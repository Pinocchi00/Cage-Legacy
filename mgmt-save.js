"use strict";
/* CAGE LEGACY — mgmt-save.js
   ============================================================================
   MODE MANAGEMENT — la persistance du bureau : validateMgmt (seule porte
   d'entrée, lecture seule), migration séquentielle (mgmtMigrate),
   réparation tolérante (mgmtRepair), écriture avec secours et rechargement
   (saveMgmt / loadMgmt / hasMgmt) sur MGMT_KEY / MGMT_BACKUP_KEY — le
   secours garde la dernière version connue-bonne, comme SAVE_KEY /
   SAVE_BACKUP_KEY (state-save.js). Issu de mgmt-bureau.js, découpage de la
   dette CLAUDE.md §10 (bloc « persistance ») ; mgmtValidExteriorLine,
   porte de validateMgmt, vient de l'ancre MGMT_LOT2B_EXTERIEUR.
   Aucun accès DOM.

   Aucune constante évaluée au chargement. Les fonctions dépendent au
   runtime de mgmt-bureau.js (MGMT_KEY, MGMT_BACKUP_KEY, MGMT_SAVE_VERSION,
   mgmtValidId, mgmtAffairTitle), mgmt-data.js (MGMT_ORG, MGMT_MAIN_SIZE,
   MGMT_PRELIM_SIZE, MGMT_FAMILY_LABELS), mgmt-corps.js (MGMT_TRAUMA_MAX),
   mgmt-monde.js (mgmtExteriorEnsure, mgmtValidExteriorLine)
   et state/state-core.js (G).
   ============================================================================ */

/* --------------------------- persistance -------------------------------- */
function mgmtValidLine(o){
  if(!o||typeof o!=='object'||Array.isArray(o)) return false;
  if(!mgmtValidId(o.id)) return false;
  if(typeof o.name!=='string'||!o.name) return false;
  for(const k of ['W','L','D']){ if(!Number.isSafeInteger(o[k])||o[k]<0) return false; }
  if(typeof o.age!=='number'||!Number.isFinite(o.age)||o.age<0||o.age>100) return false;
  if(typeof o.div!=='string'||!divById(o.div)) return false;
  if(typeof o.divName!=='string') return false;
  if(o.org!==MGMT_ORG) return false;
  if(o.level!==1&&o.level!==2&&o.level!==3) return false;
  if(o.raison!==null&&!MGMT_RAISONS.some(r=>r.id===o.raison)) return false;
  if(!Number.isSafeInteger(o.interactions)||o.interactions<0) return false;
  /* Lot 3a §9 : le corps accompagne le bilan — absent (jamais combattu sur
     la carte), ou contrôlé. */
  if(o.trauma!==undefined&&(!Number.isFinite(o.trauma)||o.trauma<0||o.trauma>MGMT_TRAUMA_MAX)) return false;
  if(o.traumaFloor!==undefined&&(!Number.isFinite(o.traumaFloor)||o.traumaFloor<0||
    o.traumaFloor>MGMT_TRAUMA_MAX||o.trauma===undefined||o.traumaFloor>o.trauma)) return false;
  if(o.susp!==undefined&&(!Number.isSafeInteger(o.susp)||o.susp<0)) return false;
  /* Lot 2B T3 : la retraite d'âge existe — 'medical' (lot 3a) et 'age'
     (T3) sont les deux valeurs valides, toute autre est refusée. */
  if(o.retired!==undefined&&o.retired!=='medical'&&o.retired!=='age') return false;
  /* Lot 2B T1 bis : dernier combat connu — absent (jamais combattu), cycle
     Split positif, ou cycle extérieur négatif pour une recrue dont le
     dernier combat précède l'ouverture de la partie. */
  if(o.lastCycle!==undefined&&!Number.isSafeInteger(o.lastCycle)) return false;
  return true;
}

function mgmtValidAffair(a){
  if(!a||typeof a!=='object'||Array.isArray(a)) return false;
  if(!mgmtValidId(a.id)) return false;
  const kinds=['leila_propose','leila_react','leila_bulk','leila_react_swap','leila_react_crush'];
  if(!kinds.includes(a.kind)) return false;
  if(!MGMT_EXCHANGES[a.exchange]) return false;
  if(a.speaker!=='leila') return false;
  if(typeof a.a!=='string'||typeof a.b!=='string') return false;
  if(a.status!=='open'&&a.status!=='closed') return false;
  if(a.title!==undefined&&(typeof a.title!=='string'||!a.title)) return false;
  if(a.kind==='leila_bulk'){
    if(!Array.isArray(a.fights)||a.fights.length===0) return false;
    for(const f of a.fights){
      if(!f||typeof f.a!=='string'||typeof f.b!=='string') return false;
      if(typeof f.sloppy!=='boolean'||typeof f.warned!=='boolean') return false;
      /* Lot 2 T1 : l'emplacement d'un combat de proposition est 'main' ou
         'prelim' quand il est porté (les blocs de Leïla proposent des
         préliminaires) — absent toléré pour une affaire d'avant la v5. */
      if(f.slot!==undefined&&f.slot!=='main'&&f.slot!=='prelim') return false;
    }
    if(a.marked!==null&&(!Number.isSafeInteger(a.marked)||a.marked<0)) return false;
  }
  return true;
}

/** Structure de la soirée calculée en une fois (lot 3a §5, anti-rechargement) :
 *  combats (identifiants, vainqueur A/B/D, famille, round) et cartes du
 *  lendemain (combattant, fin de carrière, blessure, jours de suspension).
 *  Lot 3b T1 : la finance (attrait, spectacle, audience, billetterie,
 *  droits, cachets, recette nette) et le flag E1 du patron s'ajoutent —
 *  absents d'une soirée d'avant la v4 (migration sans perte) et contrôlés
 *  quand ils sont là. */
function mgmtValidEvent(e){
  if(!e||typeof e!=='object'||Array.isArray(e)) return false;
  if(!Number.isSafeInteger(e.cycle)||e.cycle<0) return false;
  if(!Array.isArray(e.fights)||!Array.isArray(e.touched)) return false;
  for(const x of e.fights){
    if(!x||typeof x.a!=='string'||!x.a||typeof x.b!=='string'||!x.b) return false;
    if(x.winner!=='A'&&x.winner!=='B'&&x.winner!=='D') return false;
    if(!MGMT_FAMILY_LABELS[x.family]) return false;
    if(!Number.isSafeInteger(x.round)||x.round<1) return false;
  }
  for(const t of e.touched){
    if(!t||typeof t.id!=='string'||!t.id) return false;
    if(typeof t.retired!=='boolean') return false;
    if(t.injury!==null&&(typeof t.injury!=='string'||!t.injury)) return false;
    if(!Number.isSafeInteger(t.days)||t.days<0) return false;
  }
  if(e.e1!==undefined&&typeof e.e1!=='boolean') return false;
  if(e.finance!==undefined){
    const f=e.finance;
    if(!f||typeof f!=='object'||Array.isArray(f)) return false;
    for(const k of ['attraction','spectacle']){
      if(typeof f[k]!=='number'||!Number.isFinite(f[k])||f[k]<0) return false;
    }
    if(f.spectacle>1) return false;
    for(const k of ['audience','ticketing','tv','purses']){
      if(!Number.isSafeInteger(f[k])||f[k]<0) return false;
    }
    if(!Number.isSafeInteger(f.recette)) return false;
  }
  return true;
}

/** Validation d'une ligne extérieure : SON IDENTITÉ, RIEN D'AUTRE — la
 *  liste exacte des cinq clés (id, seed, div, ck, born). Toute ligne qui
 *  porterait un bilan, un âge ou un champ dérivé est refusée : la dérivation
 *  est la seule source, la règle du bureau ne se stocke pas (CDC §3). Porte
 *  de validateMgmt : le champ exterieur est toléré absent (sauvegardes
 *  d'avant le lot 2B), strict quand il est là. @returns {boolean} */
function mgmtValidExteriorLine(o){
  if(!o||typeof o!=='object'||Array.isArray(o)) return false;
  const clefs=Object.keys(o).sort().join(',');
  if(clefs!=='born,ck,div,id,seed') return false;
  if(!mgmtValidId(o.id)) return false;
  if(!Number.isSafeInteger(o.seed)||o.seed<0||o.seed>0xFFFFFFFF) return false;
  if(typeof o.div!=='string'||!divById(o.div)) return false;
  if(typeof o.ck!=='string'||!COUNTRY_KEYS.includes(o.ck)) return false;
  if(!Number.isSafeInteger(o.born)||o.born<0) return false;
  return true;
}

/* ==== [ANCRE: MGMT_LOT3_T1_SAVE] — Lot 3 T1 la trace (docs/LOT-3-L-ARENE.md
   §3 T1) : la porte d'entrée de l'historique des combats (m.hist). Même
   philosophie que mgmtValidExteriorLine : la clé exacte des champs, strict —
   l'instantané d'une ligne ne porte que ce que mgmtFightReady lit (id,
   noms, catégorie, âge, bilan, traumatisme éventuel, part acquise et cycle
   du dernier combat), la trace d'un combat
   ne porte que ce qui régénère le déroulé (instantanés, état de la RNG,
   rounds) et l'issue résumée. Une entrée structurellement incomplète est
   refusée à l'entrée et écartée en réparation — sa trace était illisible ;
   une entrée complète n'est jamais coupée, la mémoire des combats ne
   s'efface pas (QO-9, même esprit). ==== */

/** Validation d'un instantané de ligne d'avant combat (lot 3 T1) : la clé
 *  exacte des champs que mgmtFightReady lit, trauma null quand le champ
 *  était absent à l'instant capturé. @returns {boolean} */
function mgmtValidTraceSide(t){
  if(!t||typeof t!=='object'||Array.isArray(t)) return false;
  const clefs=Object.keys(t).sort().join(',');
  if(clefs!=='D,L,W,age,div,first,id,last,lastCycle,name,trauma,traumaFloor') return false;
  if(!mgmtValidId(t.id)) return false;
  for(const k of ['name','first','last']){ if(typeof t[k]!=='string'||!t[k]) return false; }
  if(typeof t.div!=='string'||!divById(t.div)) return false;
  if(typeof t.age!=='number'||!Number.isFinite(t.age)||t.age<0||t.age>100) return false;
  for(const k of ['W','L','D']){ if(!Number.isSafeInteger(t[k])||t[k]<0) return false; }
  if(t.trauma!==null&&(!Number.isFinite(t.trauma)||t.trauma<0||t.trauma>MGMT_TRAUMA_MAX)) return false;
  if(t.traumaFloor!==null&&(!Number.isFinite(t.traumaFloor)||t.traumaFloor<0||
    t.traumaFloor>MGMT_TRAUMA_MAX||t.trauma===null||t.traumaFloor>t.trauma)) return false;
  if(t.lastCycle!==null&&!Number.isSafeInteger(t.lastCycle)) return false;
  return true;
}

/** Validation d'une trace de combat (lot 3 T1) : le cycle et l'emplacement
 *  du soir, l'état de la RNG à l'instant de l'appel (entier 32 bits), le
 *  nombre de rounds, les deux instantanés d'avant combat et l'issue résumée
 *  (vainqueur A/B/D, famille, round). @returns {boolean} */
function mgmtValidFightTrace(x){
  if(!x||typeof x!=='object'||Array.isArray(x)) return false;
  const clefs=Object.keys(x).sort().join(',');
  if(clefs!=='a,b,c,family,round,rounds,seed,slot,winner') return false;
  if(!Number.isSafeInteger(x.c)||x.c<0) return false;
  if(x.slot!=='main'&&x.slot!=='prelim') return false;
  if(!Number.isSafeInteger(x.seed)||x.seed<0||x.seed>0xFFFFFFFF) return false;
  if(!Number.isSafeInteger(x.rounds)||x.rounds<1) return false;
  if(!mgmtValidTraceSide(x.a)||!mgmtValidTraceSide(x.b)) return false;
  if(x.winner!=='A'&&x.winner!=='B'&&x.winner!=='D') return false;
  if(!MGMT_FAMILY_LABELS[x.family]) return false;
  if(!Number.isSafeInteger(x.round)||x.round<1) return false;
  return true;
}
/* ==== [FIN ANCRE] ==== */

/** Validation structurelle d'une sauvegarde du bureau, en lecture seule.
 *  Lot 3b T1 : l'argent s'ajoute — trésorerie entière (le découvert est
 *  permis, c'est T sous zéro), les deux dernières recettes, l'audience
 *  d'historique et le nombre de soirées jouées. */
function validateMgmt(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return false;
  if(raw.v!==MGMT_SAVE_VERSION) return false;
  if(raw.org!==MGMT_ORG) return false;
  if(!Number.isSafeInteger(raw.cycle)||raw.cycle<0) return false;
  if(!Number.isSafeInteger(raw.ageWeeks)||raw.ageWeeks<0||raw.ageWeeks>=MGMT_EXT_YEAR_WEEKS) return false;
  if(!Number.isSafeInteger(raw.seq)||raw.seq<1) return false;
  if(!Array.isArray(raw.roster)||!Array.isArray(raw.pile)||!Array.isArray(raw.facts)) return false;
  if(raw.open!==null&&typeof raw.open!=='string') return false;
  if(raw.shortfall!==undefined&&typeof raw.shortfall!=='boolean') return false;
  if(!Number.isSafeInteger(raw.treasury)) return false;
  if(!Array.isArray(raw.recettes)||raw.recettes.length>2) return false;
  for(const r of raw.recettes){ if(!Number.isSafeInteger(r)) return false; }
  if(!Array.isArray(raw.audiences)) return false;
  for(const a of raw.audiences){ if(!Number.isSafeInteger(a)||a<0) return false; }
  if(!Number.isSafeInteger(raw.eventsPlayed)||raw.eventsPlayed<0) return false;
  if(raw.card!==undefined){
    if(!raw.card||typeof raw.card!=='object'||Array.isArray(raw.card)) return false;
    if(!Number.isSafeInteger(raw.card.sizeMain)||raw.card.sizeMain<1) return false;
    if(!Number.isSafeInteger(raw.card.sizePrelims)||raw.card.sizePrelims<1) return false;
    if(!Array.isArray(raw.card.main)||!Array.isArray(raw.card.prelims)) return false;
    /* Lot 2 T1 : chaque combat de la carte porte son emplacement, cohérent
       avec la liste qui le porte. */
    for(const f of raw.card.main.concat(raw.card.prelims)){
      if(!f||typeof f.a!=='string'||typeof f.b!=='string') return false;
      if(f.slot!=='main'&&f.slot!=='prelim') return false;
    }
    if(raw.card.main.some(f=>f.slot!=='main')||raw.card.prelims.some(f=>f.slot!=='prelim')) return false;
  }
  if(raw.leila!==undefined){
    if(!raw.leila||typeof raw.leila!=='object'||Array.isArray(raw.leila)) return false;
    if(!Array.isArray(raw.leila.crushes)) return false;
    for(const c of raw.leila.crushes){ if(!Number.isSafeInteger(c)||c<0) return false; }
  }
  for(const o of raw.roster){ if(!mgmtValidLine(o)) return false; }
  /* Lot 2B T1 : le vivier extérieur — toléré absent (sauvegardes d'avant le
      lot), strict quand il est là : chaque ligne ne porte que son identité. */
  if(raw.exterieur!==undefined){
    if(!Array.isArray(raw.exterieur)) return false;
    for(const e of raw.exterieur){ if(!mgmtValidExteriorLine(e)) return false; }
  }
  /* Lot 3 T1 : la trace des combats — toujours présente (la migration 5 → 6
     la crée), chaque entrée structurellement complète, strict. */
  if(!Array.isArray(raw.hist)) return false;
  for(const x of raw.hist){ if(!mgmtValidFightTrace(x)) return false; }
  for(const a of raw.pile){ if(!mgmtValidAffair(a)) return false; }
  for(const f of raw.facts){ if(!f||typeof f!=='object') return false; }
  if(raw.lastEvent!==undefined&&raw.lastEvent!==null&&!mgmtValidEvent(raw.lastEvent)) return false;
  return true;
}

/** Migration séquentielle (AGENTS.md : migrate() séquentiel). 2 → 3 (lot 3a
 *  §9) : les champs du corps et la soirée sont absents d'une v2 et valides
 *  absents — tampon de version seulement. 3 → 4 (lot 3b T1, QO-5) : la
 *  trésorerie démarre à MGMT_TREASURY_START, aucune recette, aucune
 *  audience, aucune soirée jouée — l'organisation commence au premier jour.
 *  4 → 5 (lot 2 T1, docs/LOT-2-CARTE-PRINCIPALE.md §T1) : la carte plate
 *  {size,fights} devient {sizeMain,sizePrelims,main,prelims} — les combats
 *  d'une carte en cours deviennent des préliminaires (slot 'prelim', cycle
 *  conservé), la carte principale démarre vide : aucun combat perdu, aucun
 *  ajouté d'office. 5 → 6 (lot 3 T1, docs/LOT-3-L-ARENE.md §3 T1) : m.hist
 *  démarre vide — les combats d'avant le lot n'ont pas laissé de trace
 *  (constat C3), rien à reconstruire, rien à perdre. 6 → 7 (lot 2B T1 ter,
 *  décision d'Anthony du 22/09/2026) : chaque corps déjà écrit reçoit un
 *  plancher dérivé borné par son total ; les anciennes traces reçoivent les
 *  deux champs absents à null et rejouent donc sans récupération ajoutée.
 *  7 → 8 (lot 2B T2 bis, décision d'Anthony du 22/09/2026) : les âges des
 *  lignes restent leurs âges courants et ageWeeks démarre à 0 ; le
 *  calendrier annuel repart de là. 8 → 9 (lot 2B T3 les départs, 23/09) :
 *  la retraite d'âge existe (retired:'age' accepté, jamais effacé) — rien
 *  à convertir sur une v8, la semaine d'anniversaire de chaque combattant
 *  se dérive de son identifiant. Sans perte, sans
 *  reset : une v1 reste refusée, comme avant. */
function mgmtMigrate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return null;
  if(raw.v===MGMT_SAVE_VERSION) return raw;
  if(raw.v===2){
    raw.v=3;
    if(raw.lastEvent===undefined) raw.lastEvent=null;
  }
  if(raw.v===3){
    raw.v=4;
    if(!Number.isSafeInteger(raw.treasury)) raw.treasury=MGMT_TREASURY_START;
    if(!Array.isArray(raw.recettes)) raw.recettes=[];
    if(!Array.isArray(raw.audiences)) raw.audiences=[];
    if(!Number.isSafeInteger(raw.eventsPlayed)) raw.eventsPlayed=0;
  }
  if(raw.v===4){
    raw.v=5;
    const old=(raw.card&&Array.isArray(raw.card.fights))?raw.card.fights:[];
    raw.card={sizeMain:MGMT_MAIN_SIZE,sizePrelims:MGMT_PRELIM_SIZE,main:[],
      prelims:old.map(f=>({a:f.a,b:f.b,cycle:f.cycle,slot:'prelim'}))};
  }
  if(raw.v===5){
    raw.v=6;
    if(!Array.isArray(raw.hist)) raw.hist=[];
  }
  if(raw.v===6){
    raw.v=7;
    if(Array.isArray(raw.roster)){
      for(const o of raw.roster){
        if(o&&Number.isFinite(o.trauma)&&o.traumaFloor===undefined){
          o.traumaFloor=Math.min(clamp(o.trauma,0,MGMT_TRAUMA_MAX),mgmtInitialTrauma(o));
        }
      }
    }
    if(Array.isArray(raw.hist)){
      for(const x of raw.hist){
        if(!x||typeof x!=='object') continue;
        for(const side of ['a','b']){
          const t=x[side];
          if(!t||typeof t!=='object') continue;
          if(t.traumaFloor===undefined) t.traumaFloor=null;
          if(t.lastCycle===undefined) t.lastCycle=null;
        }
      }
    }
  }
  if(raw.v===7){
    raw.v=8;
    raw.ageWeeks=0;
  }
  /* 8 → 9 (lot 2B T3, docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T3) : la
     retraite d'âge existe. Rien à convertir — aucune valeur 'age' ne peut
     figurer sur une v8, les âges et le reste de semaines du calendrier
     sont conservés, et la semaine d'anniversaire de chaque combattant se
     dérive de son identifiant à la lecture. */
  if(raw.v===8){
    raw.v=9;
  }
  if(raw.v!==MGMT_SAVE_VERSION) return null;
  return raw;
}

/** Réparation tolérante d'un état chargé valide : faits plafonnés, titres
 *  recalculés quand ils manquent (sauvegardes antérieures), affaire ouverte
 *  recadrée — ou première affaire ouverte sélectionnée d'office quand aucune
 *  ne l'est, pour que le bureau ne s'ouvre jamais vide. */
function mgmtRepair(m){
  if(!m||typeof m!=='object') return null;
  if(!Number.isSafeInteger(m.ageWeeks)||m.ageWeeks<0||m.ageWeeks>=MGMT_EXT_YEAR_WEEKS) m.ageWeeks=0;
  if(!Array.isArray(m.facts)) m.facts=[];
  while(m.facts.length>MGMT_FACTS_MAX) m.facts.shift();
  /* Lot 2B T1 bis : le vivier extérieur se recadre comme le reste — épuré
     d'abord des identités illisibles, puis complété jusqu'à 30 vivants dans
     chaque catégorie, roster compris. Une sauvegarde d'avant la tranche est
     donc réparée à la lecture, jamais refusée pour ses catégories creuses. */
  if(!Array.isArray(m.exterieur)) m.exterieur=[];
  else m.exterieur=m.exterieur.filter(e=>mgmtValidExteriorLine(e));
  mgmtExteriorEnsure(m);
  /* Lot 3a §9 : le corps invalide ne bloque pas le chargement — on l'écarte
     (le traumatisme se re-dérive, la suspension et la retraite tombent) ; une
     soirée illisible est écartée (recharger ne rejoue rien d'invalide) ; un
     combat en carte qui ne pointe plus vers le roster est retiré. */
  if(Array.isArray(m.roster)){
    for(const o of m.roster){
      if(o&&typeof o==='object'){
        if(o.trauma!==undefined&&(!Number.isFinite(o.trauma)||o.trauma<0||o.trauma>MGMT_TRAUMA_MAX)) delete o.trauma;
        if(o.traumaFloor!==undefined&&(!Number.isFinite(o.traumaFloor)||o.traumaFloor<0||
          o.traumaFloor>MGMT_TRAUMA_MAX||o.trauma===undefined||o.traumaFloor>o.trauma)) delete o.traumaFloor;
        if(o.susp!==undefined&&(!Number.isSafeInteger(o.susp)||o.susp<0)) delete o.susp;
        /* Lot 2B T3 : une retraite d'âge se répare comme une médicale —
           seule une valeur inconnue est effacée (le partant ne
           ressuscite pas). */
        if(o.retired!==undefined&&o.retired!=='medical'&&o.retired!=='age') delete o.retired;
        if(o.lastCycle!==undefined&&!Number.isSafeInteger(o.lastCycle)) delete o.lastCycle;
      }
    }
  }
  if(typeof m.shortfall!=='boolean') m.shortfall=false;
  /* Lot 3b T1 : l'argent se recadre comme le reste — une recette au-delà de
     deux est écartée (on ne garde que les deux dernières, QO-5), une
     audience négative n'existe pas, le compte de soirées ne descend pas. */
  if(!Number.isSafeInteger(m.treasury)) m.treasury=MGMT_TREASURY_START;
  if(!Array.isArray(m.recettes)) m.recettes=[];
  m.recettes=m.recettes.filter(r=>Number.isSafeInteger(r)).slice(-2);
  if(!Array.isArray(m.audiences)) m.audiences=[];
  m.audiences=m.audiences.filter(a=>Number.isSafeInteger(a)&&a>=0);
  if(!Number.isSafeInteger(m.eventsPlayed)||m.eventsPlayed<0) m.eventsPlayed=0;
  /* Lot 3 T1 : la trace se recadre comme le reste — présente (la migration
     la crée), et une entrée structurellement incomplète est écartée (sa
     trace était illisible, rien ne la référençait) ; une entrée complète
     n'est jamais coupée : la mémoire des combats ne s'efface pas (QO-9,
     même esprit). */
  if(!Array.isArray(m.hist)) m.hist=[];
  else m.hist=m.hist.filter(x=>mgmtValidFightTrace(x));
  /* Lot 2 T1 : la carte {sizeMain,sizePrelims,main,prelims} se recadre — les
     deux capacités et les deux listes existent toujours, un combat qui ne
     pointe plus vers le roster est retiré de son emplacement. */
  if(!m.card||typeof m.card!=='object'||Array.isArray(m.card)){
    m.card={sizeMain:MGMT_MAIN_SIZE,sizePrelims:MGMT_PRELIM_SIZE,main:[],prelims:[]};
  }
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.sizeMain<1) m.card.sizeMain=MGMT_MAIN_SIZE;
  if(!Number.isSafeInteger(m.card.sizePrelims)||m.card.sizePrelims<1) m.card.sizePrelims=MGMT_PRELIM_SIZE;
  if(!Array.isArray(m.card.main)) m.card.main=[];
  if(!Array.isArray(m.card.prelims)) m.card.prelims=[];
  for(const slot of ['main','prelims']){
    if(Array.isArray(m.card[slot])) m.card[slot]=m.card[slot].filter(x=>x&&typeof x.a==='string'&&typeof x.b==='string');
  }
  if(!m.leila||typeof m.leila!=='object'||Array.isArray(m.leila)) m.leila={crushes:[]};
  if(!Array.isArray(m.leila.crushes)) m.leila.crushes=[];
  m.leila.crushes=m.leila.crushes.filter(c=>Number.isSafeInteger(c)&&c>=0);
  if(m.lastEvent!==undefined&&m.lastEvent!==null&&!mgmtValidEvent(m.lastEvent)) m.lastEvent=null;
  if(Array.isArray(m.card.main)&&Array.isArray(m.roster)){
    const ids=new Set(m.roster.map(o=>o&&o.id));
    for(const slot of ['main','prelims']){
      m.card[slot]=m.card[slot].filter(x=>ids.has(x.a)&&ids.has(x.b));
    }
  }
  if(Array.isArray(m.pile)){
    for(const a of m.pile){
      if(typeof a.title!=='string'||!a.title) a.title=mgmtAffairTitle(m,a);
      if(a&&a.kind==='leila_bulk'){
        if(!Array.isArray(a.fights)) a.fights=[];
        if(a.marked!==null&&(!Number.isSafeInteger(a.marked)||a.marked<0||a.marked>=Math.max(a.fights.length,1))) a.marked=null;
      }
    }
    const cur=m.open!==null?m.pile.find(a=>a.id===m.open):null;
    if(!cur||cur.status!=='open'){
      const first=Array.isArray(m.pile)?m.pile.find(a=>a.status==='open'):null;
      m.open=first?first.id:null;
    }
  }else if(m.open!==null){
    m.open=null;
  }
  return m;
}

function mgmtParseAndValidate(raw){
  if(!raw) return null;
  try{ const parsed=JSON.parse(raw); const mgr=mgmtMigrate(parsed); return mgr&&validateMgmt(mgr)?mgr:null; }
  catch(e){ return null; }
}

/** Persiste le bureau : le secours garde la dernière version connue-bonne,
 *  comme SAVE_KEY / SAVE_BACKUP_KEY (state-save.js). */
function saveMgmt(){
  if(!G||!G.mgmt) return;
  try{
    /* Lot 2B T1 bis : les retraites de la soirée ont déjà été appliquées
       quand elle se sauvegarde. Le quota est rétabli dans l'état vivant
       avant sa sérialisation, jamais seulement dans la copie disque. */
    mgmtExteriorEnsure(G.mgmt);
    const previous=localStorage.getItem(MGMT_KEY);
    if(mgmtParseAndValidate(previous)) localStorage.setItem(MGMT_BACKUP_KEY,previous);
    localStorage.setItem(MGMT_KEY,JSON.stringify(G.mgmt));
  }catch(e){}
}

/** Charge le bureau, secours inclus. @returns {boolean} */
function loadMgmt(){
  try{
    for(const key of [MGMT_KEY,MGMT_BACKUP_KEY]){
      const candidate=mgmtParseAndValidate(localStorage.getItem(key));
      if(!candidate) continue;
      G.mgmt=mgmtRepair(candidate);
      if(key===MGMT_BACKUP_KEY){
        try{ localStorage.setItem(MGMT_KEY,JSON.stringify(G.mgmt)); }catch(e){}
      }
      return true;
    }
  }catch(e){}
  return false;
}

function hasMgmt(){
  try{
    if(mgmtParseAndValidate(localStorage.getItem(MGMT_KEY))) return true;
    if(mgmtParseAndValidate(localStorage.getItem(MGMT_BACKUP_KEY))) return true;
  }catch(e){}
  return false;
}
/* ==== [FIN ANCRE] ==== */
