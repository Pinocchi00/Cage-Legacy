"use strict";
/* CAGE LEGACY — mgmt-bureau.js
   ============================================================================
   LOT 1 MODE MANAGEMENT — logique du bureau : roster de Split, cycles et pile
   d'affaires, règle du bureau (trois niveaux de profondeur, CDC §3),
   mémoire des faits (addendum §1), persistance dédiée. Aucun accès DOM :
   le rendu vit dans mgmt-screens.js.

   Dépend au runtime (résolu à l'exécution, jamais au chargement) de
   engine.js (pick/RI, makeName, allDivisions, divById, COUNTRY_KEYS),
   ui-01-roster-matchmaking.js (correlatedRecord) et mgmt-data.js. Chargé
   après eux dans index.html, avant main.js.

   RNG : exclusivement la RNG à graine (pick/RI), jamais de tirage non seedé :
   les identifiants viennent d'un compteur de la partie (m.seq).
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT1_BUREAU] — Lot 1 mode management : logique du bureau
   (roster, pile, dossiers, mémoire, persistance). ==== */
const MGMT_KEY='cage-legacy-mgmt';
const MGMT_BACKUP_KEY=MGMT_KEY+'_backup';
/* ==== [ANCRE: MGMT_LOT1F_VERSION] — Lot 1f : la sauvegarde du bureau est
   versionnée. v1 = format sans version (lots 1 à 1e : piles 8-15, roster
   sans bandes) ; v2 = pile Leïla 0-2 et roster bandé. Porte stricte à la
   SAVE_VERSION : une sauvegarde d'une autre version est refusée sans
   conversion, et le bureau redémarre à zéro — une pile d'avant ne doit
   jamais ressusciter sous les nouvelles règles. ==== */
/* ==== [ANCRE: MGMT_LOT3A_VERSION] — Lot 3a le corps et la soirée : v3 ajoute
   le corps (trauma/susp/retired sur la ligne) et la soirée (m.lastEvent).
   Migration 2 → 3 sans perte (mgmtMigrate) : les champs absents sont valides,
   rien n'est réinitialisé. Une v1 reste refusée, comme avant. ==== */
/* ==== [ANCRE: MGMT_LOT3B_VERSION] — Lot 3b T1 l'argent de l'organisation :
    v4 ajoute la trésorerie (m.treasury, entier k$), les deux dernières
    recettes nettes (m.recettes), l'historique d'audience (m.audiences) et le
    nombre de soirées jouées (m.eventsPlayed). Migration séquentielle
    (mgmtMigrate) : une v3 reçoit les champs d'argent par défaut, une v2
    migre d'abord en v3 puis en v4, une v1 reste refusée — sans perte, sans
    reset (contrat LOT-3B §3 T1). ==== */
/* ==== [ANCRE: MGMT_LOT2_VERSION] — Lot 2 T1 la carte principale
   (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : v5 pose la structure de carte
   {sizeMain:5, sizePrelims:4, main:[], prelims[]} — chaque combat porte
   slot:'main'|'prelim'. Migration 4 → 5 sans perte : les combats d'une
   carte en cours deviennent des préliminaires (slot 'prelim'), la carte
   principale démarre vide — aucun combat perdu, aucun ajouté d'office.
   Une v1 reste refusée. ==== */
const MGMT_SAVE_VERSION=5;

/** État management vierge. @returns {object} */
function mgmtDefault(){
  return {org:MGMT_ORG,v:MGMT_SAVE_VERSION,cycle:0,seq:1,roster:[],pile:[],facts:[],open:null,shortfall:false,
    card:{sizeMain:MGMT_MAIN_SIZE,sizePrelims:MGMT_PRELIM_SIZE,main:[],prelims:[]},leila:{crushes:[]},lastEvent:null,
    treasury:MGMT_TREASURY_START,recettes:[],audiences:[],eventsPlayed:0};
}

/** Identifiant stable et déterministe (compteur de partie, pas de hasard). */
function mgmtNextId(m){ const id='mg'+m.seq; m.seq++; return id; }

/**
 * Génère le roster de Split : 40 à 60 noms (CDC §9). Niveau 1 uniquement :
 * une ligne nom / bilan / âge / catégorie / organisation, rien d'autre
 * (CDC §3). Réutilise makeName() et correlatedRecord() existants, jamais un
 * second système de génération. Les prénoms et noms réservés (six
 * personnages, cinq légendes — MGMT_EXCLUDED_FIRST/LAST) sont retirés par
 * nouveau tirage seedé, borné.
 * Variété (lot 1e-5) : les 14 origines sont couvertes avant toute répétition
 * (tirage sans remise seedé) ; le bilan suit des bandes débutant/vétéran —
 * 22-26 ans : 2-12 combats, 27-28 ans : 8-22, 29-35 ans : 15-30 — bornées en
 * plus par la garde 1d (âge-18)..(âge-18)*4, qui ne mord jamais à vide.
 */
function mgmtNewRoster(m){
  const n=RI(MGMT_ROSTER_MIN,MGMT_ROSTER_MAX);
  m.roster=[];
  const divs=allDivisions();
  const cks=COUNTRY_KEYS.slice();
  const drawCountry=()=>{
    if(cks.length===0) cks.push(...COUNTRY_KEYS);
    return cks.splice(Math.floor(rnd()*cks.length),1)[0];
  };
  for(let i=0;i<n;i++){
    const div=pick(divs);
    /* Un tirage pays par emplacement, jamais consommé par un retirage :
       à 40 emplacements minimum, les 14 origines sortent toutes au moins
       deux fois. Le retirage rejoue le même pays (seule Leïla peut
       collisionner, 1/20 du pool féminin — le prénom est retiré à chaque
       appel de makeName). */
    const ck=drawCountry();
    let nm=makeName(div.gender,ck), guard=0;
    while((MGMT_EXCLUDED_FIRST.includes(nm.first)||MGMT_EXCLUDED_LAST.includes(nm.last))&&guard<50){
      nm=makeName(div.gender,ck); guard++;
    }
    const age=RI(22,35);
    const band=age<=26?RI(2,12):(age>=29?RI(15,30):RI(8,22));
    const rec=correlatedRecord(RI(40,80),clamp(band,age-18,(age-18)*4));
    m.roster.push({
      id:mgmtNextId(m),
      name:nm.name,first:nm.first,last:nm.last,
      W:rec.W,L:rec.L,D:RI(0,2),
      age,
      div:div.id,divName:div.name,
      org:MGMT_ORG,
      level:1,raison:null,interactions:0,
    });
  }
  return m.roster;
}

/** Retrouve un combattant du roster par son id. */
function mgmtFighterById(m,id){
  if(!m||!Array.isArray(m.roster)) return null;
  return m.roster.find(o=>o.id===id)||null;
}

/**
 * Titre d'une affaire : dit qui parle et de quoi (jamais un libellé de type
 * répété). Calculé à la création, recalculable par mgmtRepair pour les
 * sauvegardes antérieures aux titres.
 */
function mgmtAffairTitle(m,a){
  if(a.kind==='leila_bulk'&&Array.isArray(a.fights)){
    return `Leïla propose — carte de ${a.fights.length} combats`;
  }
  if(a.kind==='leila_react_swap'||a.kind==='leila_react_crush'){
    const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
    const vs=(fa&&fb)?`${fa.name} contre ${fb.name}`:'un combat';
    return a.kind==='leila_react_crush'?`Leïla réagit — carte écrasée`:`Leïla réagit — échange (${vs})`;
  }
  const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
  const vs=(fa&&fb)?`${fa.name} contre ${fb.name}`:'un combat';
  if(a.kind==='leila_react') return `Leïla réagit — ${vs}`;
  return `Leïla propose — ${vs}`;
}

/** Première affaire ouverte après un id donné, puis la première ouverte
 *  tout court (repli) : l'affaire suivante prend le focus (lot 1e-8). */
function mgmtNextOpen(m,afterId){
  if(!m||!Array.isArray(m.pile)) return null;
  const idx=afterId?m.pile.findIndex(a=>a.id===afterId):-1;
  for(let i=idx+1;i<m.pile.length;i++){
    if(m.pile[i].status==='open') return m.pile[i].id;
  }
  const first=m.pile.find(a=>a.status==='open');
  return first?first.id:null;
}

/** Déplacement dans la pile ouverte, avec rebouclage (lot 1e-7).
 *  @returns {string|null} l'id à sélectionner. */
function mgmtMoveSelection(m,dir){
  if(!m||!Array.isArray(m.pile)) return null;
  const ids=m.pile.filter(a=>a.status==='open').map(a=>a.id);
  if(ids.length===0) return null;
  const i=ids.indexOf(m.open);
  if(i<0) return dir<0?ids[ids.length-1]:ids[0];
  return ids[(i+dir+ids.length)%ids.length];
}

/* ==== [ANCRE: MGMT_LOT2_CARTE] — Lot 2 la sous-carte : carte en construction,
   proposition en bloc, échange, écrasement et son coût (addendum §12),
   mémoire des écrasements. Logique pure, aucun DOM. Même RNG seedée, mêmes
   conventions que le lot 1 (identifiants au compteur, tirages seedés).
   Le lot 1 (propositions simples, refus, ignore) est inchangé ci-dessous.
   Lot 2 T1 la carte principale (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : la
   carte devient {sizeMain, sizePrelims, main, prelims} — la proposition en
   bloc de Leïla reste sa carte préliminaire (4 combats, décision du
   19/09 : le bloc ne couvre jamais la carte principale, dont la composition
   revient au joueur à la T2) ; chaque combat porte slot, valider place les
   combats dans leur emplacement sans jamais rien perdre.
   Lot 2 T3 Leïla et les préliminaires (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ;
   LOT-3B §2, décision d'Anthony du 15/09/2026) : la proposition en bloc
   n'arrive qu'une fois la carte principale complète (cinq combats posés par
   le joueur, T2) et part après les autres affaires, jamais en tête —
   mgmtOfferBulk pousse, mgmtBookMain déclenche à la cinquième place ;
   mgmtPickBulkPair élargit ses candidats aux combattants disponibles hors
   carte principale (même catégorie, rangs proches, repos, priorité aux plus
   inactifs, pas de revanche immédiate). C1 : accepter une demande de Leïla
   booke vraiment (mgmtDecide → mgmtBookMain). ==== */
/* ==== [ANCRE: MGMT_LOT2REV_ID_STRICT] — revue lot 1 (L1-R2) : les
   identifiants sont interpolés dans des gestionnaires onclick — traités
   comme du code s'ils contiennent un guillemet. Format interne strict à
   toutes les entrées (génération, sauvegarde, import) : lettres, chiffres,
   tiret et souligné uniquement. Aucun identifiant interne légitime ne sort
   de cet alphabet ('mg'+compteur, fixtures de test incluses). ==== */
const MGMT_ID_RE=/^[A-Za-z0-9_-]{1,64}$/;
function mgmtValidId(id){ return typeof id==='string'&&MGMT_ID_RE.test(id); }
/* Écart de bilan qui fait un mauvais appariement, avec le cross-division :
   visible dans la proposition (catégorie et bilan lisibles), sans effet
   joué au lot 2 — ce qu'il avertit viendra plus tard. */
const MGMT_SLOPPY_GAP=8;
/* ==== [ANCRE: MGMT_LOT2_T3_PRELIMS] — Lot 2 T3 Leïla et les préliminaires
   (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision d'Anthony du
   15/09/2026) : écart de rang dans une même catégorie qui fait un mauvais
   appariement — au-delà, la paire est bâclée, comme le cross-division et le
   gros écart de bilan (le coût de l'écrasement, lot 3a §5, est conservé :
   un écrasement continue de produire des prélims moins logiques). Le rang
   vient de mgmtDivisionRank (T1), dérivé, jamais stocké. Constante à 3 :
   dans une catégorie du roster (quatre à cinq combattants), un écart de
   trois rangs reste un combat de même niveau visible ; un #1 contre un #5
   ne l'est pas. Réglable par Anthony après avoir joué. ==== */
const MGMT_RANK_GAP=3;

/** Combats posés sur la carte, carte principale d'abord (ordre de la
 *  soirée). Pur. @returns {Array} */
function mgmtCardFights(m){
  if(!m||!m.card) return [];
  return (Array.isArray(m.card.main)?m.card.main:[]).concat(Array.isArray(m.card.prelims)?m.card.prelims:[]);
}

/** Carte complète ? Les deux emplacements : la carte principale ET les
 *  préliminaires (docs/LOT-2-CARTE-PRINCIPALE.md §T1). */
function mgmtCardFull(m){
  return !!(m&&m.card&&Array.isArray(m.card.main)&&Array.isArray(m.card.prelims)
    &&Number.isSafeInteger(m.card.sizeMain)&&Number.isSafeInteger(m.card.sizePrelims)
    &&m.card.main.length>=m.card.sizeMain&&m.card.prelims.length>=m.card.sizePrelims);
}

/** Historique des écrasements : total et série en cours (cycles consécutifs).
 *  Trois écrasements de suite ne sont pas trois écrasements espacés (§5). */
function mgmtCrushStats(m){
  const s=(m&&m.leila&&Array.isArray(m.leila.crushes))?m.leila.crushes.slice().sort((x,y)=>x-y):[];
  let streak=0;
  for(let i=s.length-1;i>=0;i--){
    if(i===s.length-1||s[i]===s[i+1]-1) streak++;
    else break;
  }
  return {total:s.length,streak:s.length>0?streak:0};
}

/** Probabilité qu'un combat proposé soit bâclé : croît avec les écrasements
 *  (total + série), plafonnée. Zéro sans écrasement : Leïla soigneuse. */
function mgmtSloppyProb(total,streak){
  return Math.min(0.12*total+0.08*streak,0.65);
}

/** Probabilité qu'elle prévienne sur un mauvais appariement : s'éteint
 *  progressivement avec les écrasements, jamais annoncée. */
function mgmtWarnProb(total){
  return Math.max(0,1-0.35*total);
}

/** Écart de bilan entre deux combattants (combats totaux). */
function mgmtRecGap(A,B){ return Math.abs((A.W+A.L)-(B.W+B.L)); }

/**
 * Tire une paire pour la sous-carte : mode 'clean' (même catégorie,
 * rangs proches) ou 'sloppy' (cross-division, gros écart de rang ou de
 * bilan). Le mode vient du coût des écrasements ; à défaut de candidates
 * dans le mode, l'autre, puis abandon (filet : shortfall). La nature
 * bâclée ou non est celle de la paire retenue, pas l'intention — un repli
 * malchanceux reste signalable.
 * Lot 3a §6.5 : suspendus et retraités médicaux exclus, en mode strict
 * comme assoupli. Le mode assoupli (lot 3a §5) relâche les contraintes de
 * variété (prénoms déjà vus, paires déjà proposées, séries de catégories)
 * et le repos — jamais la sécurité (genre, homonymes, disponibilités,
 * combattants en carte, paires déjà en carte).
 * Lot 2 T3 (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision
 * d'Anthony du 15/09/2026 — extension de la fonction, jamais une
 * concurrente). Parmi les combattants disponibles HORS CARTE PRINCIPALE
 * (mgmtEngaged — la carte principale est composée par le joueur, T2) :
 * - même catégorie, rangs proches : écart de rang borné par
 *   MGMT_RANK_GAP, lu sur mgmtDivisionRank (T1) — au-delà, la paire est
 *   bâclée, comme le cross-division et le gros écart de bilan ;
 * - repos : pas de combattant ayant combattu à la soirée précédente
 *   (lastCycle >= cycle - 1), sauf en mode assoupli ;
 * - pas de revanche immédiate d'un combat de la soirée précédente
 *   (m.lastEvent) ;
 * - priorité aux combattants inactifs depuis le plus longtemps : la paire
 *   retenue est prise parmi celles qui cumulent la plus longue inactivité
 *   (jamais combattu sous Split = le plus inactif) ; à égalité, le tirage
 *   seedé garde la variété.
 * @returns {{a,b,sloppy,warned,div}|null} */
function mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed){
  const totals=stats||{total:0,streak:0};
  const wantSloppy=rnd()<mgmtSloppyProb(totals.total,totals.streak);
  const r=m.roster;
  /* Arbitrage lot 2 (revue) : les appariements restent toujours dans la même
     catégorie hommes/femmes — le dégradé joue sur la division et l'écart de
     bilan, jamais sur le genre. */
  const genderOf=o=>{ const d=divById(o.div); return d?d.gender:null; };
  /* Rangs (§T3) : mgmtDivisionRank (T1) appelé au plus une fois par
     combattant et par tirage — jamais par paire candidate. */
  const rankCache=new Map();
  const rankOf=f=>{ let v=rankCache.get(f.id); if(v===undefined){ v=mgmtDivisionRank(m,f); rankCache.set(f.id,v); } return v; };
  /* Repos (§T3) : a combattu à la soirée précédente. */
  const repos=f=>Number.isSafeInteger(f.lastCycle)&&f.lastCycle>=m.cycle-1;
  /* Inactivité (§T3) : cycles depuis le dernier combat ; jamais combattu
     sous Split = le plus inactif. */
  const inact=f=>m.cycle-(Number.isSafeInteger(f.lastCycle)?f.lastCycle:-1);
  /* Revanche immédiate (§T3) : les paires de la soirée précédente. */
  const rematch=new Set();
  if(m.lastEvent&&Array.isArray(m.lastEvent.fights)){
    for(const f of m.lastEvent.fights){
      if(f&&typeof f.a==='string'&&typeof f.b==='string') rematch.add([f.a,f.b].sort().join('|'));
    }
  }
  const collect=mode=>{
    const out=[];
    for(let i=0;i<r.length;i++){
      for(let j=i+1;j<r.length;j++){
      const A=r[i], B=r[j];
      if(A.first===B.first) continue;
      if(genderOf(A)!==genderOf(B)) continue;
      if(!mgmtAvailable(m,A)||!mgmtAvailable(m,B)) continue;
      /* §T3 : les prélims se construisent hors carte principale — un
         combattant déjà engagé (principale comme prélims) n'est jamais
         candidat. */
      if(mgmtEngaged(m,A)||mgmtEngaged(m,B)) continue;
      const key=[A.id,B.id].sort().join('|');
      if(seen.has(key)) continue;
      if(rematch.has(key)) continue;
      if(!relaxed){
        /* §T3 : repos sauf en mode assoupli. */
        if(repos(A)||repos(B)) continue;
        if(used.has(A.first)||used.has(B.first)) continue;
        const d0=A.div===B.div?A.div:A.div;
        if(d0===lastDiv&&run>=2) continue;
      }
        const d=A.div===B.div?A.div:A.div;
        const ra=rankOf(A), rb=rankOf(B);
        /* Rangs comparés dans la même catégorie seulement ; cross-division,
           la paire est bâclée sans comparaison de rang. */
        const rankGap=(A.div===B.div&&ra!==null&&rb!==null)?Math.abs(ra-rb):MGMT_RANK_GAP+1;
        const sloppy=(A.div!==B.div)||rankGap>MGMT_RANK_GAP||mgmtRecGap(A,B)>=MGMT_SLOPPY_GAP;
        if(mode==='clean'&&sloppy) continue;
        if(mode==='sloppy'&&!sloppy) continue;
        out.push({A,B,sloppy,div:d,inact:inact(A)+inact(B)});
      }
    }
    return out;
  };
  let cands=collect(wantSloppy?'sloppy':'clean');
  if(cands.length===0) cands=collect(wantSloppy?'clean':'sloppy');
  if(cands.length===0) return null;
  /* Priorité (§T3) : les combattants inactifs depuis le plus longtemps —
     la paire retenue est prise parmi celles qui cumulent la plus longue
     inactivité ; à égalité, le tirage seedé garde la variété. */
  let best=-1;
  for(const c of cands){ if(c.inact>best) best=c.inact; }
  const top=cands.filter(c=>c.inact===best);
  const c=pick(top);
  const warned=c.sloppy&&rnd()<mgmtWarnProb(totals.total);
  return {a:c.A,b:c.B,sloppy:c.sloppy,warned,div:c.div};
}

/**
 * Construit l'affaire de proposition en bloc : la carte préliminaire de
 * Leïla (docs/LOT-2-CARTE-PRINCIPALE.md §T1, décision du 19/09 — la
 * proposition en bloc ne couvre jamais la carte principale : sa composition
 * revient au joueur, T2). Lot 2 T3 (§T3 ; LOT-3B §2, décision du 15/09) :
 * elle n'arrive QU'UNE FOIS la carte principale complète — cinq combats
 * posés par le joueur. Elle propose les préliminaires manquants — au plus
 * MGMT_PRELIM_SIZE combats, chacun porté slot:'prelim' — ou null : carte
 * déjà complète, préliminaires complets, carte principale incomplète (le
 * joueur la compose — Leïla n'a rien à proposer), ou pot insuffisant pour
 * l'ensemble (filet : l'appelant signale shortfall — jamais une carte
 * incomplète).
 * Lot 3a §5 : relaxed=true assouplit la variété (prénoms, paires déjà
 * proposées, séries) et le repos pour le remplissage de fin de cycle —
 * jamais la carte (sanctuarisée) ni deux fois la même paire dans le bloc.
 * @returns {object|null} */
function mgmtNewBulkAffair(m,used,seen,relaxed){
  if(mgmtCardFull(m)) return null;
  if(!m||!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return null;
  /* §T3 : la carte principale est complète — la proposition des
     préliminaires attend la composition du joueur. */
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.main.length<m.card.sizeMain) return null;
  const n=(Number.isSafeInteger(m.card.sizePrelims)?m.card.sizePrelims:MGMT_PRELIM_SIZE)-m.card.prelims.length;
  if(n<=0) return null;
  const stats=mgmtCrushStats(m);
  const fights=[];
  let lastDiv=null, run=0;
  /* §T3 : la proposition est un tout — Leïla propose les préliminaires
     MANQUANTS, jamais une carte partielle ; si un combat de la carte est
     introuvable, l'appelant signale le shortfall et on ne remplit rien
     (lot 3a §5). */
  for(let i=0;i<n;i++){
    const p=mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed);
    if(!p) return null;
    used.add(p.a.first); used.add(p.b.first);
    seen.add([p.a.id,p.b.id].sort().join('|'));
    run=(p.div===lastDiv)?run+1:1; lastDiv=p.div;
    fights.push({a:p.a.id,b:p.b.id,slot:'prelim',sloppy:p.sloppy,warned:p.warned});
  }
  const aff={
    id:mgmtNextId(m),kind:'leila_bulk',exchange:'leila_bulk',
    speaker:'leila',a:fights[0].a,b:fights[0].b,fights,marked:null,
    status:'open',decision:null,
  };
  aff.title=`Leïla propose — carte de ${fights.length} combats`;
  return aff;
}

/**
 * Échange le combat marqué d'une proposition en bloc contre une paire
 * fraîche. Pas un écrasement : aucun coût, aucune trace dans l'historique
 * des écrasements. Leïla réagit dans une affaire à part (motif lot 1).
 * @returns {boolean} */
function mgmtSwapFight(m,affairId){
  if(!m||!Array.isArray(m.pile)) return false;
  const aff=m.pile.find(a=>a.id===affairId);
  if(!aff||aff.status!=='open'||aff.kind!=='leila_bulk'||!Array.isArray(aff.fights)) return false;
  const idx=Number.isSafeInteger(aff.marked)?aff.marked:0;
  if(idx<0||idx>=aff.fights.length) return false;
  const used=new Set(), seen=new Set();
  for(const a of m.pile){
    if(a.kind!=='leila_propose'||a.status!=='open') continue;
    const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
    if(fa) used.add(fa.first);
    if(fb) used.add(fb.first);
    seen.add([a.a,a.b].sort().join('|'));
  }
  aff.fights.forEach((f,i)=>{ if(i!==idx){ const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b); if(fa) used.add(fa.first); if(fb) used.add(fb.first); seen.add([f.a,f.b].sort().join('|')); } });
  const old=aff.fights[idx];
  seen.add([old.a,old.b].sort().join('|'));
  const stats=mgmtCrushStats(m);
  const p=mgmtPickBulkPair(m,used,seen,null,0,stats);
  if(!p) return false;
  aff.fights[idx]={a:p.a.id,b:p.b.id,slot:'prelim',sloppy:p.sloppy,warned:p.warned};
  /* R3 : la réaction concerne les combattants retirés (old), ceux que le
     texte dit devoir replacer — jamais les remplaçants. Le fait garde les
     deux paires explicitement. */
  mgmtAddFact(m,{c:m.cycle,k:'swapped',a:old.a,b:old.b,na:p.a.id,nb:p.b.id});
  const react={
    id:mgmtNextId(m),kind:'leila_react_swap',exchange:'leila_react_swap',
    speaker:'leila',a:old.a,b:old.b,
    status:'open',decision:null,after:aff.id,
  };
  react.title=mgmtAffairTitle(m,react);
  m.pile.push(react);
  return true;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_LOT2_COMPOSITION] — Lot 2 T2 le joueur compose sa carte
   principale (docs/LOT-2-CARTE-PRINCIPALE.md §T2, geste LOT-3B §2) : logique
   pure de composition — aucun DOM (le rendu vit dans mgmt-screens.js).
   Le combat posé entre dans le premier emplacement libre de la carte
   principale (slot:'main') ; il peut être retiré. Non sélectionnables :
   suspendus, tout combattant déjà engagé sur la carte (principale comme
   préliminaires) ; retraités médicaux déjà hors de la liste (mgmtAvailable).
   Les adversaires restent dans la catégorie du premier choix — le geste de
   référence est maquettes/04-booker-un-combat.html (adversaires de la
   catégorie). Tout booking compte comme interaction (addendum 1 §5 : le
   booker compte) ; un retrait n'efface rien. ==== */

/** Combattant déjà engagé sur la carte en cours : carte principale comme
 *  préliminaires (§T2). Pur. @returns {boolean} */
function mgmtEngaged(m,f){
  if(!m||!m.card||!f||!f.id) return false;
  const on=(list)=>Array.isArray(list)&&list.some(x=>x&&(x.a===f.id||x.b===f.id));
  return on(m.card.main)||on(m.card.prelims);
}

/**
 * Pose un combat du joueur en carte principale : premier emplacement libre
 * (append — les places se remplissent dans l'ordre), slot:'main', cycle
 * courant. Garde complète : les deux lignes existent et sont distinctes,
 * même catégorie (le geste de référence est maquettes/04-booker-un-combat.
 * html : adversaires de la catégorie), disponibles (mgmtAvailable : ni
 * suspendus, ni retraités médicaux), pas déjà engagés sur la carte,
 * capacité respectée. Un booking compte comme interaction (mgmtPromote,
 * addendum 1 §5). Aucun fait mémorisé : composer est le comportement
 * normal (lot 2c). Ne lance jamais la soirée : la carte complète ne fait
 * rien d'office (lot 3a §5).
 * @returns {object|null} le combat posé, ou null si refusé.
 */
function mgmtBookMain(m,aid,bid){
  if(!m||!m.card||!Array.isArray(m.card.main)) return null;
  if(!Number.isSafeInteger(m.card.sizeMain)) return null;
  if(m.card.main.length>=m.card.sizeMain) return null;
  if(!mgmtValidId(aid)||!mgmtValidId(bid)||aid===bid) return null;
  const fa=mgmtFighterById(m,aid), fb=mgmtFighterById(m,bid);
  if(!fa||!fb||fa===fb) return null;
  if(fa.div!==fb.div) return null;
  if(!mgmtAvailable(m,fa)||!mgmtAvailable(m,fb)) return null;
  if(mgmtEngaged(m,fa)||mgmtEngaged(m,fb)) return null;
  const fight={a:fa.id,b:fb.id,cycle:m.cycle,slot:'main'};
  m.card.main.push(fight);
  mgmtPromote(m,fa); mgmtPromote(m,fb);
  /* §T3 : une fois la cinquième place posée, Leïla propose aussitôt les
     préliminaires — en fin de pile, jamais avant la carte principale
     complète (mgmtOfferBulk garde tout elle-même : no-op tant que la carte
     principale est incomplète). */
  mgmtOfferBulk(m,false);
  return fight;
}

/** Retire un combat posé de la carte principale (index dans m.card.main) :
 *  l'emplacement est libéré, les deux combattants redeviennent
 *  sélectionnables. Pur côté lignes (aucune ligne écrite). @returns {boolean} */
function mgmtRemoveMain(m,idx){
  if(!m||!m.card||!Array.isArray(m.card.main)) return false;
  if(!Number.isSafeInteger(idx)||idx<0||idx>=m.card.main.length) return false;
  m.card.main.splice(idx,1);
  return true;
}

/** Sélectionnable dans la liste de composition (§T2) : disponible (ni
 *  suspendu, ni retraité médical), pas déjà engagé sur la carte ; avec un
 *  premier choix posé, dans la même catégorie que lui — sauf le choisi
 *  lui-même, re-cliquer doit pouvoir annuler. Pur. @returns {boolean} */
function mgmtSelectable(m,f,pick){
  if(!m||!f) return false;
  if(!mgmtAvailable(m,f)) return false;
  if(mgmtEngaged(m,f)) return false;
  if(pick){
    const a=mgmtFighterById(m,pick);
    if(!a) return false;
    if(f.id===a.id) return true;
    if(a.div!==f.div) return false;
  }
  return true;
}

/**
 * Les lignes de la liste de composition : le roster sans les retraités
 * médicaux (§T2 : absents), groupé par catégorie dans l'ordre canonique
 * (DIVISIONS), rangs dérivés (mgmtDivisionRank, T1) au sein de chaque
 * catégorie. Pur : ne trie que des copies, n'écrit jamais sur une ligne,
 * ne consomme pas rnd().
 * @returns {Array} */
function mgmtCartRows(m){
  if(!m||!Array.isArray(m.roster)) return [];
  const rows=m.roster.filter(o=>o&&o.retired!=='medical');
  const order=allDivisions().map(d=>d.id);
  const dx=o=>{ const i=order.indexOf(o.div); return i<0?order.length:i; };
  rows.sort((x,y)=>{
    const a=dx(x), b=dx(y);
    if(a!==b) return a-b;
    const rx=mgmtDivisionRank(m,x)||0, ry=mgmtDivisionRank(m,y)||0;
    if(rx!==ry) return rx-ry;
    return x.id<y.id?-1:1;
  });
  return rows;
}
/* ==== [FIN ANCRE] ==== */
/** Catégorie d'une affaire : la division commune du combat, ou celle du
 *  premier combattant pour les paires inter-divisions (repli). */
function mgmtAffairDiv(m,a){
  const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
  if(!fa||!fb) return null;
  return fa.div===fb.div?fa.div:fa.div;
}

/** Paires candidates pour un emplacement de pile : prénoms frais, combat
 *  inédit dans les deux ordres, run de catégorie respecté. Les paires de
 *  même division d'abord (un combat se book dans une catégorie), les paires
 *  inter-divisions en repli — toujours dans la même catégorie hommes/femmes
 *  (arbitrage lot 2, revue). Tirage direct dans les éligibles plutôt
 *  qu'essais aveugles : l'épuisement du pot se constate au lieu de se
 *  rater par malchance. Lot 3a §6.5 : suspendus et retraités médicaux exclus,
 *  comme de toutes les propositions. */
function mgmtEligiblePairs(m,usedFirsts,seen,lastDiv,run){
  const outSame=[], outAny=[];
  const r=m.roster;
  const genderOf=o=>{ const d=divById(o.div); return d?d.gender:null; };
  for(let i=0;i<r.length;i++){
    for(let j=i+1;j<r.length;j++){
      const A=r[i], B=r[j];
      if(A.first===B.first) continue;
      if(genderOf(A)!==genderOf(B)) continue;
      if(!mgmtAvailable(m,A)||!mgmtAvailable(m,B)) continue;
      if(usedFirsts.has(A.first)||usedFirsts.has(B.first)) continue;
      const key=[A.id,B.id].sort().join('|');
      if(seen.has(key)) continue;
      const d=A.div===B.div?A.div:A.div;
      if(d===lastDiv&&run>=2) continue;
      /* Lot 2 T3, C1 : accepter booke dans la carte principale — un
         combattant déjà engagé n'est jamais proposé. */
      if(mgmtEngaged(m,A)||mgmtEngaged(m,B)) continue;
      (A.div===B.div?outSame:outAny).push([A,B]);
    }
  }
  return outSame.length>0?outSame:outAny;
}

/**
 * Ouvre un nouveau cycle (lot 1e-3, correction du cahier des charges) :
 * Leïla ne remplit pas la pile — une proposition par cycle en général, deux
 * au maximum, et pas à tous les cycles (20/0, 65/1, 15/2 seedé — pondération
 * modeste et visible, à ajuster). Le reste de la pile reste vide tant que
 * les autres voix ne sont pas branchées : une pile de quelques affaires est
 * correcte au lot 1. Règles de variété inchangées sur ce qu'elle propose
 * (combat inédit dans les deux ordres, prénoms uniques, run ≤ 2).
 * Tirage dans les paires éligibles : si le pot ne permet pas de compléter,
 * shortfall=true le signale au lieu de contourner. La première affaire est
 * sélectionnée d'office quand la pile n'est pas vide.
 */
function mgmtNewPile(m){
  if(!Array.isArray(m.roster)||m.roster.length<2) mgmtNewRoster(m);
  m.cycle++;
  m.pile=[];
  m.open=null;
  m.shortfall=false;
  const draw=rnd();
  const n=draw<0.20?0:(draw<0.85?1:2);
  const seen=new Set();
  const usedFirsts=new Set();
  /* Lot 2c : un combat déjà en carte n'est jamais reproposé — même combat
     dupliqué ou deuxième affaire sur le même appariement, les deux sont
     faux. Les combattants, eux, continuent leur carrière. */
  for(const f of mgmtCardFights(m)){
    if(f&&typeof f.a==='string'&&typeof f.b==='string') seen.add([f.a,f.b].sort().join('|'));
  }
  let lastDiv=null, run=0;
  while(m.pile.length<n){
    const cands=mgmtEligiblePairs(m,usedFirsts,seen,lastDiv,run);
    if(cands.length===0) break;
    const pair=pick(cands);
    const key=[pair[0].id,pair[1].id].sort().join('|');
    seen.add(key);
    usedFirsts.add(pair[0].first); usedFirsts.add(pair[1].first);
    const d=pair[0].div===pair[1].div?pair[0].div:pair[0].div;
    run=(d===lastDiv)?run+1:1; lastDiv=d;
    const aff={
      id:mgmtNextId(m),kind:'leila_propose',exchange:'leila_propose',
      speaker:'leila',a:pair[0].id,b:pair[1].id,
      status:'open',decision:null,
    };
    aff.title=mgmtAffairTitle(m,aff);
    m.pile.push(aff);
  }
  if(m.pile.length<n) m.shortfall=true;
  /* Lot 2 T3 : la proposition en bloc n'arrive qu'une fois la carte
     principale complète (docs/LOT-2-CARTE-PRINCIPALE.md §T3, décision du
     19/09 ; LOT-3B §2 : le joueur compose d'abord la main card) — et elle
     part après les autres affaires, jamais en tête. Mêmes ensembles que
     les singles (paires de la carte incluses) : ni doublon avec la carte,
     ni doublon avec les singles du cycle. */
  if(Array.isArray(m.card.main)&&Number.isSafeInteger(m.card.sizeMain)&&m.card.main.length>=m.card.sizeMain
    &&Array.isArray(m.card.prelims)&&Number.isSafeInteger(m.card.sizePrelims)&&m.card.prelims.length<m.card.sizePrelims){
    const bulk=mgmtNewBulkAffair(m,usedFirsts,seen);
    if(bulk) m.pile.push(bulk);
    else if(m.pile.length===0) m.shortfall=true;
  }
  if(m.pile.length>0) m.open=m.pile[0].id;
  return m.pile;
}

/** Nombre d'affaires encore ouvertes dans la pile. */
function mgmtOpenCount(m){
  if(!m||!Array.isArray(m.pile)) return 0;
  return m.pile.filter(a=>a.status==='open').length;
}

/**
 * Passage au dossier (CDC §3, niveau 2) : la raison de se battre est
 * attribuée à l'instant exact où le combattant croise le bureau, par tirage
 * seedé parmi les cinq. Chaque booking compte comme interaction (addendum
 * §5) ; trois interactions font un attaché (CDC §3, niveau 3).
 */
function mgmtPromote(m,f){
  if(!f) return null;
  if(f.level<2){ f.level=2; f.raison=pick(MGMT_RAISONS).id; }
  f.interactions=(Number.isSafeInteger(f.interactions)?f.interactions:0)+1;
  if(f.interactions>=3) f.level=3;
  return f;
}

/** Mémorise un fait, les plus récents d'abord conservés (addendum §1). */
function mgmtAddFact(m,fact){
  if(!m||!fact) return;
  if(!Array.isArray(m.facts)) m.facts=[];
  m.facts.push(fact);
  while(m.facts.length>MGMT_FACTS_MAX) m.facts.shift();
}

/**
 * Mémoire en phrases (lot 1g-2, addendum §1) : des faits pondérés, exprimés
 * en phrases, du point de vue de celui qui se souvient — jamais un journal
 * d'événements. Au lot 1, seule Leïla peut se souvenir de quelque chose :
 * tu as accepté sa proposition, tu l'as refusée, tu l'as ignorée. Rien de
 * significatif : rien (un espace vide vaut mieux qu'un remplissage).
 * Au lot 2 (lot 2c) ne comptent que les écrasements — avec leurs séries —
 * et les revirements (combats échangés) : le reste est le comportement
 * normal et ne se mémorise pas.
 * @returns {Array<{who:string,text:string}>} */
function mgmtMemoryLines(m){
  if(!m||!Array.isArray(m.facts)) return [];
  const lines=[];
  const cs=mgmtCrushStats(m);
  if(cs.total>0){
    lines.push({who:'Leïla',text:cs.total>1
      ?`Leïla — tu as écrasé ${cs.total} de ses cartes${cs.streak>=2?`, dont ${cs.streak} de suite`:''}.`
      :'Leïla — tu as écrasé sa carte.'});
  }
  let sw=0;
  for(const f of m.facts){ if(f&&typeof f==='object'&&f.k==='swapped') sw++; }
  if(sw>0){
    lines.push({who:'Leïla',text:sw>1?`Leïla — tu as échangé ${sw} de ses combats.`:'Leïla — tu as échangé un de ses combats.'});
  }
  return lines;
}

/**
 * Accepter une demande de Leïla est-il possible (lot 2 T3, C1 —
 * docs/LOT-2-CARTE-PRINCIPALE.md §T3) : oui si et seulement si mgmtBookMain
 * poserait le combat — un emplacement libre en carte principale et une
 * paire posable (même catégorie, disponibles, pas déjà engagées). L'interface
 * lit la même porte pour ne jamais proposer une réponse impossible
 * (charte R4) ; mgmtDecide la re-vérifie au moment de la décision.
 * Pur. @returns {boolean} */
function mgmtAcceptable(m,aff){
  if(!m||!m.card||!Array.isArray(m.card.main)||!aff) return false;
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.main.length>=m.card.sizeMain) return false;
  const a=mgmtFighterById(m,aff.a), b=mgmtFighterById(m,aff.b);
  if(!a||!b||a===b||a.div!==b.div) return false;
  if(!mgmtAvailable(m,a)||!mgmtAvailable(m,b)) return false;
  if(mgmtEngaged(m,a)||mgmtEngaged(m,b)) return false;
  return true;
}

/**
 * Joue la réponse choisie sur une affaire ouverte. Lot 1 (inchangé) :
 * accepter book, refuser fait naître une réaction, clore acte la réaction.
 * Lot 2 : valider fait entrer toute la carte en construction ; écraser la
 * rejette (coût : écrasement horodaté, qualité future dégradée, avertisse-
 * ments éteints — addendum §12) et fait naître une réaction. Chaque issue
 * est mémorisée comme fait.
 * @returns {boolean} vrai si la décision a été appliquée.
 */
function mgmtDecide(m,affairId,replyId){
  if(!m||!Array.isArray(m.pile)) return false;
  const aff=m.pile.find(a=>a.id===affairId);
  if(!aff||aff.status!=='open') return false;
  const ex=MGMT_EXCHANGES[aff.exchange];
  if(!ex) return false;
  const rep=(ex.replies||[]).find(r=>r.id===replyId);
  if(!rep) return false;
  let fact=null;
  if(rep.action==='accept'){
    /* Lot 2 T3, C1 (docs/LOT-2-CARTE-PRINCIPALE.md §T3) : accepter une
       demande de Leïla booke vraiment — le combat entre dans la carte
       principale (mgmtBookMain : même catégorie, disponibles, pas déjà
       engagés, emplacement libre). S'il n'y a plus d'emplacement libre ou
       que la paire ne se pose pas, l'action n'est pas proposée
       (mgmtVisibleReplies) et la décision est refusée ici — garde double,
       souris comme clavier. */
    if(!mgmtBookMain(m,aff.a,aff.b)) return false;
    aff.status='closed'; aff.decision='accepted';
    fact={c:m.cycle,k:'booked',a:aff.a,b:aff.b};
  }else if(rep.action==='refuse'){
    aff.status='closed'; aff.decision='refused';
    fact={c:m.cycle,k:'refused',a:aff.a,b:aff.b};
    const react={
      id:mgmtNextId(m),kind:'leila_react',exchange:'leila_refused',
      speaker:'leila',a:aff.a,b:aff.b,
      status:'open',decision:null,after:aff.id,
    };
    react.title=mgmtAffairTitle(m,react);
    m.pile.push(react);
  }else if(rep.action==='close'){
    aff.status='closed'; aff.decision='noted';
    fact={c:m.cycle,k:'reaction_seen',a:aff.a,b:aff.b};
  }else if(rep.action==='validate'){
    if(aff.kind!=='leila_bulk'||!Array.isArray(aff.fights)) return false;
    if(!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return false;
    /* R1 : chaque booking compte comme interaction (addendum 1 §5) — les
       combattants progressent comme après une acceptation individuelle,
       une seule fois par validation (statut open refusé ci-dessus). */
    for(const f of aff.fights){ mgmtPromote(m,mgmtFighterById(m,f.a)); mgmtPromote(m,mgmtFighterById(m,f.b)); }
    /* Lot 2 T1 : chaque combat entre dans son emplacement (slot), sans
       jamais déborder la capacité — aucun combat perdu, aucun ajouté. */
    for(const f of aff.fights){
      const slot=f.slot==='main'?'main':'prelim';
      const key=slot==='main'?'main':'prelims';
      const cap=slot==='main'?m.card.sizeMain:m.card.sizePrelims;
      if(Number.isSafeInteger(cap)&&m.card[key].length<cap){
        m.card[key].push({a:f.a,b:f.b,cycle:m.cycle,slot});
      }
    }
    aff.status='closed'; aff.decision='validated';
    fact={c:m.cycle,k:'booked',bulk:true,a:aff.fights[0].a,b:aff.fights[0].b};
  }else if(rep.action==='crush'){
    if(aff.kind!=='leila_bulk') return false;
    if(!m.leila||!Array.isArray(m.leila.crushes)) m.leila={crushes:[]};
    m.leila.crushes.push(m.cycle);
    aff.status='closed'; aff.decision='crushed';
    fact={c:m.cycle,k:'crushed',a:aff.a,b:aff.b};
    const react={
      id:mgmtNextId(m),kind:'leila_react_crush',exchange:'leila_react_crush',
      speaker:'leila',a:aff.a,b:aff.b,
      status:'open',decision:null,after:aff.id,
    };
    react.title=mgmtAffairTitle(m,react);
    m.pile.push(react);
  }else{
    return false;
  }
  mgmtAddFact(m,fact);
  /* Focus sur l'affaire suivante (lot 1e-8). */
  if(m.open===affairId) m.open=mgmtNextOpen(m,affairId);
  return true;
}

/**
 * Ignorer est une décision (CDC §4.1) : l'affaire se clôt, le fait est
 * mémorisé, elle ne revient jamais (addendum §9) — donc sans affaire de
 * réaction, contrairement au refus. Lot 3a §5 : tant que la carte est
 * incomplète, la proposition en bloc ne peut pas être ignorée — sinon ce
 * serait une nouvelle proposition gratuite, sans le coût de l'écrasement.
 * @returns {boolean} vrai si l'affaire a été ignorée.
 */
function mgmtIgnore(m,affairId){
  if(!m||!Array.isArray(m.pile)) return false;
  const aff=m.pile.find(a=>a.id===affairId);
  if(!aff||aff.status!=='open') return false;
  if(aff.kind==='leila_bulk'&&!mgmtCardFull(m)) return false;
  aff.status='closed'; aff.decision='ignored';
  mgmtAddFact(m,{c:m.cycle,k:'ignored',a:aff.a,b:aff.b});
  if(m.open===affairId) m.open=mgmtNextOpen(m,affairId);
  return true;
}

/* ==== [ANCRE: MGMT_LOT3A_CORPS] — Lot 3a le corps et la soirée : état
   physique caché (traumatisme 0-100, ne descend jamais), dérivation sans
   rnd pour les niveau 1, profil de combat régénéré à l'identique (SEED
   sauvegardé puis restauré), couplage au moteur sans le modifier
   (simulateFight appelé, jamais édité), conséquences (blessures,
   suspensions, fin de carrière médicale) et soirée calculée en une fois.
   Aucune voix, aucune réplique : là où Clara parlera (lot 3b), les écrans
   laissent l'emplacement vide. ==== */
const MGMT_TRAUMA_MAX=100;
const MGMT_TRAUMA_START_CAP=85;
const MGMT_KO_SHARE=26;
const MGMT_KO_TRAUMA=19;
const MGMT_CHIN_WEAR=0.55;
const MGMT_CHIN_FLOOR=0.35;
const MGMT_GAIN_CAP=45;
const MGMT_HEAD_SUSP=30;
const MGMT_INJURY_BASE=0.03;
const MGMT_INJURY_HEAD=0.004;
const MGMT_INJURY_TRAUMA=0.0015;
const MGMT_INJURY_KD=0.05;

/** Hachage stable FNV-1a 32 bits d'une chaîne : pur, ne consomme jamais
 *  rnd() — la dérivation du traumatisme n'avance pas la suite des tirages.
 *  @returns {number} entier non signé. */
function mgmtHashId(s){
  let h=0x811c9dc5;
  const str=String(s);
  for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193); }
  return h>>>0;
}

/** Traumatisme d'une ligne (CDC §3, niveau 1 sans combat : rien n'est
 *  stocké). Si la ligne porte un champ trauma (déjà combattu sur la carte),
 *  le renvoyer ; sinon le dériver du bilan, de l'âge, du nombre de combats
 *  et d'un hachage de l'id — défaites par KO estimées, puis usure.
 *  Plafonné à 85 : personne ne commence retraité. Pur et déterministe.
 *  @returns {number} 0 à 100. */
function mgmtTrauma(f){
  if(!f) return 0;
  if(typeof f.trauma==='number'&&Number.isFinite(f.trauma)) return clamp(f.trauma,0,MGMT_TRAUMA_MAX);
  const W=Number.isSafeInteger(f.W)?f.W:0, L=Number.isSafeInteger(f.L)?f.L:0, D=Number.isSafeInteger(f.D)?f.D:0;
  const fights=W+L+D;
  const age=(typeof f.age==='number'&&Number.isFinite(f.age))?Math.floor(f.age):25;
  let ko=0;
  for(let i=0;i<L;i++){ if(mgmtHashId(f.id+'#'+i)%100<MGMT_KO_SHARE) ko++; }
  const wear=Math.floor(Math.max(0,fights)/6)+Math.max(0,age-30);
  return Math.min(MGMT_TRAUMA_START_CAP,ko*MGMT_KO_TRAUMA+wear);
}

/** Retrouve un niveau makeFighter en inversant correlatedRecord()
 *  (ui-01-roster-matchmaking.js:465) à partir du ratio de victoires,
 *  borné à 40-80. Pur et déterministe. */
function mgmtLevelForRecord(W,L){
  const t=(Number.isSafeInteger(W)&&Number.isSafeInteger(L)&&(W+L)>0)?W/(W+L):0.5;
  return clamp(Math.round(20+clamp((t-0.45)/0.43,0,1)*77),40,80);
}

/** Profil de combat d'une ligne : régénéré à chaque appel, jamais stocké.
 *  SEED sauvegardé, tirage sous hachage de l'id, SEED restauré — le même
 *  combattant donne exactement le même profil sans avancer la suite des
 *  tirages de la partie. L'identifiant de uniqueFighterId() n'est jamais
 *  conservé. */
function mgmtCombatProfile(f){
  const saved=SEED;
  let p;
  try{
    /* ==== [ANCRE: MGMT_LOT1_STYLE_STABLE] — Lot 1 le style stable (audit
       X2, §3.2 du lot 3a) : la graine du profil est le hachage de l'id de
       la ligne. Sans ce setSeed, chaque appel consommait le flux courant
       restauré à l'identique : tous les combattants générés au même
       instant recevaient le même style, et un même combattant changeait de
       style d'une soirée à l'autre. ==== */
    setSeed(mgmtHashId(f.id));
    const d=divById(f.div);
    p=makeFighter({div:f.div,gender:d?d.gender:'H',level:mgmtLevelForRecord(f.W,f.L),age:f.age});
  }finally{
    setSeed(saved);
  }
  p.id=f.id; p.name=f.name; p.first=f.first; p.last=f.last; p.age=f.age;
  p.W=f.W; p.L=f.L; p.D=f.D;
  return p;
}

/** Facteur d'usure menton/résistance : exactement 1 à traumatisme 0
 *  (combat strictement identique au moteur nu, même graine), décroissant
 *  ensuite, plancher anti-effondrement. Pur. */
function mgmtTraumaFactor(t){
  if(!(t>0)) return 1;
  return Math.max(MGMT_CHIN_FLOOR,1-(t/MGMT_TRAUMA_MAX)*MGMT_CHIN_WEAR);
}

/** Clone prêt à combattre : profil régénéré, copié en profondeur, attributs
 *  attrs.chin (engine.js:97, eff() en :413) et attrs.durability (engine.js:97,
 *  eff() en :423) réduits selon le traumatisme. À 0, le clone est inchangé. */
function mgmtFightReady(f){
  const c=JSON.parse(JSON.stringify(mgmtCombatProfile(f)));
  const k=mgmtTraumaFactor(mgmtTrauma(f));
  if(k!==1&&c&&c.attrs){
    c.attrs.chin=Math.max(1,Math.round(num(c.attrs.chin)*k));
    c.attrs.durability=Math.max(1,Math.round(num(c.attrs.durability)*k));
  }
  return c;
}

/** Famille d'une méthode pour l'écran de soirée (addendum 2 §6 : ni
 *  res.detail, ni statistiques, ni note). Blessure et disqualification sont
 *  des combats arrêtés par l'arbitre : famille 'stop'. */
function mgmtMethodFamily(method,winner){
  if(winner==='D') return 'draw';
  if(typeof method!=='string') return 'stop';
  if(method.indexOf('KO')===0) return 'ko';
  if(method.indexOf('Soumission')===0) return 'sub';
  if(method.indexOf('Décision')===0) return 'dec';
  if(method.indexOf('Nul')===0) return 'draw';
  return 'stop';
}

/** Gain de traumatisme après un combat, selon les dégâts subis : H les
 *  dégâts tête encaissés (res.stats[side].dmgHead — ce que le combattant a
 *  encaissé, engine-combat.js:1690-1691,1730), K les knockdowns encaissés
 *  (res.stats[side].wobbled — res.stats[side].kd compte ceux qu'il a
 *  infligés, engine-combat.js:1768,1774). Déterministe, borné, jamais
 *  négatif : le traumatisme ne descend jamais. */
function mgmtTraumaGain(method,fam,issue,H,K){
  const h=Math.max(0,Math.round(num(H))), k=Math.max(0,Math.round(num(K)));
  let g;
  if(issue==='loss'){
    if(fam==='ko') g=11+k*3+Math.floor(h/15);
    else if(fam==='sub'||fam==='stop') g=(fam==='sub'?10:13)+k*3+Math.floor(h/15);
    else g=3+Math.min(3,Math.floor(h/12))+k*3;
  }else if(issue==='win'){
    g=(fam==='dec')?2+Math.min(3,Math.floor(h/12)):3;
  }else{
    g=3+Math.min(3,Math.floor(h/12))+k*3;
  }
  if(method==='Blessure'&&issue==='loss') g+=4;
  return clamp(Math.round(g),0,MGMT_GAIN_CAP);
}

/** Durée de suspension en jours d'un nom de blessure du moteur
 *  (INJURY_TYPES, engine-progression.js:67-73), selon la table du lot
 *  (§6.3). 0 si le nom est inconnu. */
function mgmtInjuryDays(name){
  if(typeof name!=='string') return 0;
  if(name.indexOf('Commotion')>=0||name.indexOf('Déchirure')>=0) return 180;
  if(name.indexOf('Fracture')>=0) return 90;
  if(name.indexOf('Entorse')>=0) return 60;
  return 0;
}

/** Disponibilité pour une proposition : ni retraité médical, ni suspendu
 *  (susp = cycle jusqu'auquel il est indisponible). */
function mgmtAvailable(m,f){
  if(!f||f.retired) return false;
  if(Number.isSafeInteger(f.susp)&&m&&Number.isSafeInteger(m.cycle)&&m.cycle<=f.susp) return false;
  return true;
}

/* ==== [ANCRE: MGMT_LOT2_CLASSEMENT] — Lot 2 T1 la carte principale
   (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : classement par catégorie, dérivé
   de l'état courant, jamais stocké sur la ligne (règle du bureau, CDC §3).
   Ordre : victoires − défaites, puis victoires, puis dernier combat sous
   Split (le plus actif devant). Les suspendus gardent leur rang, les
   retraités médicaux sortent du classement. ==== */
/** Rang d'une ligne dans sa catégorie (1..n). Pur : ne trie que des copies,
 *  n'écrit jamais sur la ligne, ne consomme pas rnd() (comparaison de
 *  champs entiers seulement). Retraité médical : hors classement (null).
 *  @returns {number|null} */
function mgmtDivisionRank(m,f){
  if(!m||!f||!Array.isArray(m.roster)) return null;
  if(f.retired==='medical') return null;
  const cands=m.roster.filter(o=>o&&o.div===f.div&&o.retired!=='medical');
  const key=o=>({
    d:(Number.isSafeInteger(o.W)?o.W:0)-(Number.isSafeInteger(o.L)?o.L:0),
    w:Number.isSafeInteger(o.W)?o.W:0,
    c:Number.isSafeInteger(o.lastCycle)?o.lastCycle:-1});
  cands.sort((x,y)=>{
    const a=key(x), b=key(y);
    if(a.d!==b.d) return b.d-a.d;
    if(a.w!==b.w) return b.w-a.w;
    return b.c-a.c;
  });
  const i=cands.findIndex(o=>o.id===f.id);
  return i>=0?i+1:null;
}
/* ==== [FIN ANCRE] ==== */

/** Dossier sans interaction comptée (addendum §5 : ce n'est pas un choix du
 *  joueur) : la raison est attribuée, le compteur d'interactions ne bouge
 *  pas — ni vers le niveau 3, ni ailleurs. level 3 sur fin de carrière
 *  (CDC §3, « KO grave »). */
function mgmtPromoteSilent(m,f,level){
  if(!f) return null;
  if(f.level<2){ f.level=2; if(f.raison==null) f.raison=pick(MGMT_RAISONS).id; }
  if(level>=3) f.level=3;
  return f;
}

/** Rang de gravité pour le lendemain (du plus grave au moins grave) :
 *  fin de carrière d'abord, puis durée de suspension, puis blessure. */
function mgmtTouchedRank(t){
  return (t.retired?1000000:0)+(Number.isSafeInteger(t.days)?t.days:0)*10+(t.injury?1:0);
}

/** Applique à une ligne tout ce que son combat lui a fait (§6) : bilan,
 *  traumatisme (écrit sur la ligne — premier combat sur la carte),
 *  blessure (rollInjury(), inchangé), suspension (la plus longue l'emporte),
 *  fin de carrière médicale (traumatisme 100, ou commotion sévère sur un
 *  corps déjà au-dessus du seuil — définitive, sans réparation), promotions
 *  règle du bureau et faits (blessures, suspensions de 90 j et plus, fins
 *  de carrière — jamais les résultats ordinaires).
 *  @returns {object|null} la carte du lendemain pour ce combattant, ou null
 *  si rien ne le touche. */
function mgmtApplyFight(m,f,opp,res,side){
  if(!m||!f||!res) return null;
  const st=res.stats?res.stats[side]:null;
  const H=st?Math.max(0,Math.round(num(st.dmgHead))):0;
  const K=st?Math.max(0,Math.round(num(st.wobbled))):0;
  const fam=mgmtMethodFamily(res.method,res.winner);
  const issue=res.winner==='D'?'draw':(res.winner===side?'win':'loss');
  const T0=mgmtTrauma(f);
  const T1=Math.min(MGMT_TRAUMA_MAX,T0+mgmtTraumaGain(res.method,fam,issue,H,K));
  f.trauma=Math.max(T0,T1);
  /* Lot 2 T1 : dernier combat sous Split, écrit ici où le lot 3a écrit déjà
     le traumatisme. Absent = n'a jamais combattu sous Split. */
  f.lastCycle=m.cycle;
  if(issue==='win') f.W++;
  else if(issue==='loss') f.L++;
  else f.D++;
  const loserSide=res.winner==='D'?null:(res.winner==='A'?'B':'A');
  let injury=null;
  if(res.method==='Blessure'&&loserSide===side){
    injury=rollInjury();
  }else{
    const p=MGMT_INJURY_BASE+MGMT_INJURY_HEAD*H+MGMT_INJURY_TRAUMA*T0+(K>0?MGMT_INJURY_KD*K:0);
    if(rnd()<p) injury=rollInjury();
  }
  let days=0;
  if(injury) days=Math.max(days,mgmtInjuryDays(injury.name));
  if(issue==='loss'&&fam==='ko') days=Math.max(days,60);
  if(issue==='loss'&&res.method==='Arrêt médical') days=Math.max(days,30);
  if(fam==='dec'&&H>=MGMT_HEAD_SUSP) days=Math.max(days,30);
  if(days>0){
    const until=m.cycle+Math.max(1,Math.ceil(days/(MGMT_EVENT_WEEKS*7)));
    f.susp=Math.max(Number.isSafeInteger(f.susp)?f.susp:0,until);
  }
  let retired=false;
  if(f.trauma>=MGMT_TRAUMA_MAX) retired=true;
  else if(injury&&typeof injury.name==='string'&&injury.name.indexOf('Commotion')>=0&&T0>MGMT_BODY_THRESHOLD) retired=true;
  if(retired){
    f.retired='medical';
    mgmtPromoteSilent(m,f,3);
    mgmtAddFact(m,{c:m.cycle,k:'retired',a:f.id});
  }else if(injury||days>=90){
    mgmtPromoteSilent(m,f,2);
    mgmtAddFact(m,{c:m.cycle,k:injury?'injury':'susp',a:f.id});
  }
  if(!retired&&!injury&&!(days>0)) return null;
  return {id:f.id,retired:retired,injury:injury?injury.name:null,days:days};
}

/** Joue la soirée : les combats de la carte se règlent en une seule fois
 *  par simulateFight(A,B,3) — sans applyResult(), le bilan est mis à jour
 *  à la main — avec toutes leurs conséquences (§6). Lot 3b T1 (QO-5) : le
 *  même calcul unique porte la finance — attrait et cachets lus sur les
 *  lignes d'avant combat, spectacle observé sur les combats joués, recette
 *  nette R = billetterie + droits − cachets ajoutée au solde unique
 *  (remboursement automatique : tant que T < 0, rien n'est bénéfice),
 *  audience, historiques et E1 (patron : T < 0 avant la soirée et R > 0).
 *  Stocké dans m.lastEvent puis sauvegardé avant tout affichage : recharger
 *  la page ne rejoue rien. La carte est vidée. Ne remplit jamais rien
 *  d'office : carte incomplète ou paire introuvable, on ne joue pas (null),
 *  avant toute mutation.
 *  @returns {object|null} m.lastEvent. */
function mgmtRunEvent(m){
  if(!m||!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return null;
  if(!mgmtCardFull(m)) return null;
  /* Lot 2 T1 : chaque combat porte son emplacement (slot:'main'|'prelim')
     et la soirée joue la carte principale d'abord, puis les préliminaires. */
  const booked=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot==='main'?'main':'prelim'}));
  /* Disponibilités vérifiées d'abord : une paire introuvable n'applique
     aucune conséquence — la soirée n'a pas commencé. */
  for(const cf of booked){
    const fa=mgmtFighterById(m,cf.a), fb=mgmtFighterById(m,cf.b);
    if(!fa||!fb||!mgmtAvailable(m,fa)||!mgmtAvailable(m,fb)) return null;
  }
  /* Cachets et attrait : la carte d'avant la soirée — le bilan et le corps
     d'avant combat, jamais d'après (les combats mutent les lignes). */
  const attraction=mgmtCardAttraction(m,booked);
  const purses=mgmtPurses(m,booked);
  const fights=[];
  const touched=[];
  for(const cf of booked){
    const fa=mgmtFighterById(m,cf.a), fb=mgmtFighterById(m,cf.b);
    const res=simulateFight(mgmtFightReady(fa),mgmtFightReady(fb),3);
    fights.push({a:fa.id,b:fb.id,winner:res.winner,family:mgmtMethodFamily(res.method,res.winner),
      round:Number.isSafeInteger(res.round)?res.round:3});
    const ta=mgmtApplyFight(m,fa,fb,res,'A');
    const tb=mgmtApplyFight(m,fb,fa,res,'B');
    if(ta) touched.push(ta);
    if(tb) touched.push(tb);
  }
  touched.sort((x,y)=>mgmtTouchedRank(y)-mgmtTouchedRank(x));
  const finance=mgmtEventRecette(attraction,mgmtSpectacle(fights),purses,fights.length);
  /* Un seul solde (QO-5) : T ← T + R. Remboursement « avant tout bénéfice »
     automatique — tant que T < 0, rien n'est bénéfice. E1 si et seulement
     si T < 0 avant la soirée et R > 0. */
  const debtBefore=Number.isSafeInteger(m.treasury)&&m.treasury<0;
  m.treasury=(Number.isSafeInteger(m.treasury)?m.treasury:MGMT_TREASURY_START)+finance.recette;
  if(!Array.isArray(m.recettes)) m.recettes=[];
  m.recettes.push(finance.recette);
  while(m.recettes.length>2) m.recettes.shift();
  if(!Array.isArray(m.audiences)) m.audiences=[];
  m.audiences.push(finance.audience);
  m.eventsPlayed=(Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0)+1;
  m.lastEvent={cycle:m.cycle,fights:fights,touched:touched,finance,e1:!!(debtBefore&&finance.recette>0)};
  m.card.main=[];
  m.card.prelims=[];
  saveMgmt();
  return m.lastEvent;
}

/**
 * Pousse la proposition en bloc de Leïla en fin de pile quand la carte
 * principale est complète et que les préliminaires manquent (lot 2 T3,
 * docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision du 15/09 :
 * le joueur compose d'abord la main card, Leïla propose ensuite).
 * Mêmes interdits que partout (indisponibles exclus), coût de l'écrasement
 * conservé (proposition plus bâclée). Si les contraintes de variété
 * coincent, on les assouplit (prénoms déjà vus, paires déjà proposées,
 * repos) — jamais un combat d'office : impossible même assoupli, on
 * signale (shortfall) et on ne remplit rien.
 * Carte principale incomplète : Leïla n'a rien à proposer (la proposition
 * des préliminaires attend la composition du joueur, §T3) — pas de
 * shortfall : ce n'est pas le pot qui manque. Le déclencheur manuel fait
 * avancer le cycle (lot 1g, aucun blocage).
 * selectWhenIdle : la proposition vole le focus d'office (pile vidée,
 * appel du §5) ; à faux, elle ne déloge pas une affaire déjà ouverte — le
 * booking de la cinquième place arrive parfois au milieu de la pile.
 * @returns {boolean} vrai si une proposition est arrivée en fin de pile. */
function mgmtOfferBulk(m,selectWhenIdle){
  if(!m||!Array.isArray(m.pile)) return false;
  if(!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return false;
  /* §T3 : la carte principale est complète, les préliminaires manquent. */
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.main.length<m.card.sizeMain) return false;
  if(Number.isSafeInteger(m.card.sizePrelims)&&m.card.prelims.length>=m.card.sizePrelims) return false;
  /* Pas de doublon : une proposition déjà ouverte suffit. */
  if(m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')) return false;
  const used=new Set(), seen=new Set();
  for(const a of m.pile){
    if(a.kind!=='leila_propose'&&a.kind!=='leila_bulk') continue;
    const list=a.kind==='leila_bulk'&&Array.isArray(a.fights)?a.fights:[a];
    for(const x of list){
      const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
      if(fa) used.add(fa.first);
      if(fb) used.add(fb.first);
      seen.add([x.a,x.b].sort().join('|'));
    }
  }
  const cardPairs=new Set();
  for(const x of mgmtCardFights(m)){ seen.add([x.a,x.b].sort().join('|')); cardPairs.add([x.a,x.b].sort().join('|')); }
  const bulk=mgmtNewBulkAffair(m,used,seen,false)||mgmtNewBulkAffair(m,new Set(),cardPairs,true);
  if(!bulk){ m.shortfall=true; return false; }
  m.pile.push(bulk);
  /* Le focus suit la proposition d'office quand rien n'est ouvert — jamais
     au détriment d'une affaire que le joueur regarde. */
  if(selectWhenIdle||!m.pile.some(a=>a.id===m.open&&a.status==='open')) m.open=bulk.id;
  return true;
}

/** Fin de pile (§5) : la reproposition de Leïla quand le cycle ne se ferme
 *  pas — la proposition des préliminaires attend la carte principale
 *  complète (§T3). @returns {boolean} */
function mgmtRefillBulk(m){
  return mgmtOfferBulk(m,true);
}

/** Fin de pile (§5) : plus aucune affaire ouverte. Carte complète : la
 *  soirée ('event'). Carte incomplète : le cycle ne se ferme pas, Leïla
 *  propose à nouveau ('refill') — ou 'stuck' si elle n'a rien à proposer
 *  (carte principale incomplète, §T3 — la proposition des préliminaires
 *  attend la composition du joueur, sans signal de pot épuisé — ou même
 *  assoupli elle ne peut plus : rien d'office, shortfall signalé). Pile
 *  encore ouverte : 'none'.
 *  @returns {string} 'none'|'event'|'refill'|'stuck'. */
function mgmtClosePile(m){
  if(!m||mgmtOpenCount(m)>0) return 'none';
  if(mgmtCardFull(m)) return 'event';
  return mgmtRefillBulk(m)?'refill':'stuck';
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT3B_T1_ECONOMIE] — Lot 3b T1 l'argent de
   l'organisation (contrat LOT-3B §3 T1, décisions QO-5 et QO-7 §1) : un seul
   solde — le découvert est T sous zéro, jamais un compteur séparé — cachets
   dérivés de la ligne (jamais stockés, règle du bureau CDC §3), recette
   nette R = billetterie + droits du diffuseur − cachets, plafond de
   découvert, audience et sa référence pour D4. Fonctions pures, aucun
   rnd(), aucune réplique, aucun affichage dans cette tranche : la
   trésorerie s'affichera à la T6 (CDC §7) ; la réplique E1 du patron existe
   (texte d'auteur, LOT-3B §E1) et sera branchée à une tranche ultérieure —
   T1 ne stocke que la condition, dans m.lastEvent.e1. Lot 2 T1 : la carte
   {main,prelims} existe en jeu (docs/LOT-2-CARTE-PRINCIPALE.md §T1) —
   cachets et attrait lisent l'emplacement porté par chaque combat.
   Constantes calibrées par tools/monte-carlo-economie.js sur des cartes de
   4 + 4 combats (docs/lots/LOT-3B-T1-CALIBRAGE.md), revérifiées sur le VRAI
   déroulé à la T4 du lot 2 (docs/LOT-2-CARTE-PRINCIPALE.md §T4 —
   tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md) : les poids d'argent sont
   inchangés, seules les références D4 suivent la mesure réelle. ==== */
/* Trésorerie au premier jour (k$). Ordre de grandeur de l'exemple QO-5
   (T=50 : un short notice à 60 est refusé avant la première soirée, P=0). */
const MGMT_TREASURY_START=50;
/* Nom d'une ligne (valeur de scène, 0..1) : activité (bilan total) pondérée
   par le bilan et le niveau dérivé du bilan — mgmtLevelForRecord clampe à
   MGMT_STAR_LVL_MIN..MGMT_STAR_LVL_MAX. Pur, jamais stocké. */
const MGMT_STAR_FIGHTS=8;
const MGMT_STAR_W_RATIO=0.35;
const MGMT_STAR_W_LVL=0.65;
const MGMT_STAR_LVL_MIN=40;
const MGMT_STAR_LVL_MAX=80;
/* Cachet (k$) d'un combattant : plancher + nom, pondéré par l'emplacement —
   un combat de main card coûte plus qu'un prélim (poids nommés, §3 T1). */
const MGMT_PURSE_BASE=1;
const MGMT_PURSE_PER_STAR=4;
const MGMT_PURSE_PRELIM_W=1;
const MGMT_PURSE_MAIN_W=2.5;
/* Attrait : poids d'emplacement d'un combat dans la carte — un combat de
   main card rapporte plus qu'un prélim — mordu par l'écart de nom entre les
   deux lignes (un combat déséquilibré ne se vend pas). */
const MGMT_ATTR_PRELIM_W=1;
const MGMT_ATTR_MAIN_W=2.5;
const MGMT_ATTR_GAP=0.6;
/* Billetterie (k$) par point d'attrait de la carte. */
const MGMT_TICKET_PER_DRAW=7;
/* Audience, en écrans entiers : attrait × mix de spectacle. L'audience est
   décidée surtout avant la soirée — MGMT_AUD_BASE est acquise d'avance, la
   part de finitions observée ne pèse que sur le reste. Une soirée sans
   finition garde donc une audience non nulle. */
const MGMT_AUD_BASE=0.7;
const MGMT_AUD_PER_DRAW=1000;
/* Droits du diffuseur (k$) pour MGMT_TV_ECRANS écrans, payés au prorata du
   nombre de combats joués par rapport à la carte contractuelle (addendum
   §16 : c'est le contrat du diffuseur). Carte contractuelle = la carte
   complète du lot 2 (décision du 19/09 : 9 combats — 5 en carte principale,
   4 en préliminaires). */
const MGMT_TV_PER_AUD=6;
const MGMT_TV_ECRANS=1000;
const MGMT_CARD_CONTRACT=MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE;
/* Références D4 (QO-7) : attrait d'un combat moyen et spectacle (part de
   finitions) d'une carte complète d'attrait moyen, mesurés par Monte Carlo
   sur le déroulé réel (graine 20260919, 4000 soirées — lot 2 T4,
   tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md ; l'ancien déroulé
   synthétique 4 + 4 mesurait 0.616 et 0.638, docs/lots/LOT-3B-T1-CALIBRAGE.md).
   mgmtAudienceRef sans historique redonne ainsi l'audience moyenne mesurée
   d'une carte complète. */
const MGMT_DRAW_AVG=0.59;
const MGMT_SPECTACLE_REF=0.67;

/** Nom d'une ligne (0..1) : valeur de scène dérivée du bilan — activité,
 *  ratio de victoires, niveau dérivé du bilan. Pur et déterministe, jamais
 *  stocké sur la ligne (règle du bureau, CDC §3).
 *  @returns {number} 0 à 1. */
function mgmtStar(f){
  if(!f) return 0;
  const W=Number.isSafeInteger(f.W)?f.W:0, L=Number.isSafeInteger(f.L)?f.L:0, D=Number.isSafeInteger(f.D)?f.D:0;
  const t=W+L+D;
  const ratio=t>0?(W+0.5*D)/t:0.5;
  const lvl=mgmtLevelForRecord(W,L);
  const fame=1-Math.exp(-t/MGMT_STAR_FIGHTS);
  return clamp(fame*(MGMT_STAR_W_RATIO*ratio+MGMT_STAR_W_LVL*((lvl-MGMT_STAR_LVL_MIN)/(MGMT_STAR_LVL_MAX-MGMT_STAR_LVL_MIN))),0,1);
}

/** Cachet (k$) d'un combattant pour un emplacement ('main'|'prelim') :
 *  plancher + nom, pondéré par l'emplacement. Pur, jamais stocké sur la
 *  ligne — il est payé avant la soirée et n'existe que dans le calcul de
 *  l'événement (anti-rechargement).
 *  @returns {number} entier k$ > 0. */
function mgmtPurse(f,slot){
  const star=mgmtStar(f);
  const w=slot==='main'?MGMT_PURSE_MAIN_W:MGMT_PURSE_PRELIM_W;
  return Math.round((MGMT_PURSE_BASE+MGMT_PURSE_PER_STAR*star)*w);
}

/** Attrait d'un combat (0..1) : la valeur de scène des deux lignes, mordue
 *  par l'écart entre elles — un combat déséquilibré ne se vend pas. Pur.
 *  @returns {number} 0 à 1. */
function mgmtFightDraw(fa,fb){
  const sa=mgmtStar(fa), sb=mgmtStar(fb);
  return clamp((sa+sb)/2*(1-MGMT_ATTR_GAP*Math.abs(sa-sb)),0,1);
}

/** Attrait total d'une carte slottée, avant la soirée : Σ poids
 *  d'emplacement × attrait du combat. slotted = [{a,b,slot}] — des
 *  identifiants du roster ; une ligne introuvable ne compte pas. Pur.
 *  @returns {number} ≥ 0. */
function mgmtCardAttraction(m,slotted){
  if(!Array.isArray(slotted)) return 0;
  let s=0;
  for(const f of slotted){
    if(!f||typeof f.a!=='string'||typeof f.b!=='string') continue;
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
    if(!fa||!fb) continue;
    s+=(f.slot==='main'?MGMT_ATTR_MAIN_W:MGMT_ATTR_PRELIM_W)*mgmtFightDraw(fa,fb);
  }
  return s;
}

/** Total des cachets (k$) d'une carte slottée, payés avant la soirée.
 *  Pur. @returns {number} entier ≥ 0. */
function mgmtPurses(m,slotted){
  if(!Array.isArray(slotted)) return 0;
  let p=0;
  for(const f of slotted){
    if(!f||typeof f.a!=='string'||typeof f.b!=='string') continue;
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
    if(!fa||!fb) continue;
    p+=mgmtPurse(fa,f.slot)+mgmtPurse(fb,f.slot);
  }
  return p;
}

/** Spectacle observé d'une soirée : part de finitions (KO et soumission —
 *  l'arrêt médical est une intervention, pas un spectacle). Pur.
 *  @returns {number} 0 à 1. */
function mgmtSpectacle(fights){
  if(!Array.isArray(fights)||fights.length===0) return 0;
  let fin=0;
  for(const f of fights){ if(f&&(f.family==='ko'||f.family==='sub')) fin++; }
  return fin/fights.length;
}

/** Recette d'une soirée, en une seule fois (QO-5) : billetterie (attrait de
 *  la carte avant la soirée) + droits du diffuseur (audience en écrans =
 *  attrait × mix de spectacle, décidée surtout avant la soirée ; droits au
 *  prorata des combats joués sur la carte contractuelle de 8 — addendum
 *  §16) − cachets. Pure : attraction et cachets sont calculés sur les
 *  lignes d'avant combat par l'appelant, spectacle et nombre de combats sur
 *  les combats joués. Tout est entier (k$, écrans) ; R peut être négative.
 *  @returns {{attraction,spectacle,audience,ticketing,tv,purses,recette}} */
function mgmtEventRecette(attraction,spectacle,purses,nFights){
  const a=Math.max(0,num(attraction)), s=clamp(num(spectacle),0,1), p=Math.max(0,Math.round(num(purses)));
  /* L'audience est décidée surtout avant la soirée : la base est acquise,
     le spectacle observé (part de finitions) ne porte que le reste. */
  const mix=MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*s;
  const audience=Math.round(MGMT_AUD_PER_DRAW*a*mix);
  const ticketing=Math.round(MGMT_TICKET_PER_DRAW*a);
  /* Droits au prorata des combats joués sur la carte contractuelle. */
  const n=(typeof nFights==='number'&&Number.isFinite(nFights))?Math.max(0,nFights):MGMT_CARD_CONTRACT;
  const tv=Math.round(MGMT_TV_PER_AUD*audience*n/(MGMT_TV_ECRANS*MGMT_CARD_CONTRACT));
  return {attraction:Math.round(a*1000)/1000,spectacle:Math.round(s*1000)/1000,
    audience,ticketing,tv,purses:p,recette:ticketing+tv-p};
}

/** Plafond de découvert P (QO-5) : 0 avant la première soirée, la dernière
 *  recette ensuite, puis la moyenne arrondie des deux dernières — lissée,
 *  jamais négative : une soirée perdante n'ouvre aucun crédit. Pure.
 *  @returns {number} entier ≥ 0. */
function mgmtOverdraftCap(m){
  if(!m||!Number.isSafeInteger(m.eventsPlayed)||m.eventsPlayed<1) return 0;
  if(!Array.isArray(m.recettes)||m.recettes.length<1) return 0;
  const last=Number.isSafeInteger(m.recettes[m.recettes.length-1])?m.recettes[m.recettes.length-1]:0;
  if(m.eventsPlayed<2||m.recettes.length<2) return Math.max(0,last);
  const prev=Number.isSafeInteger(m.recettes[m.recettes.length-2])?m.recettes[m.recettes.length-2]:0;
  return Math.max(0,Math.round((last+prev)/2));
}

/** Court préavis payable ? QO-5 : si et seulement si T − coût ≥ −P. Un seul
 *  solde. Pure. @returns {boolean} */
function mgmtCanAfford(m,cost){
  if(!m||!Number.isSafeInteger(m.treasury)) return false;
  const c=(typeof cost==='number'&&Number.isFinite(cost))?Math.max(0,Math.round(cost)):0;
  return m.treasury-c>=-mgmtOverdraftCap(m);
}

/** Audience de référence pour D4 (QO-7) : la moyenne d'audience (en écrans)
 *  des soirées précédentes — ou, avant toute soirée, l'audience qu'aurait
 *  eue une carte complète d'attrait moyen (5 combats de carte principale +
 *  4 préliminaires, spectacle de référence — lot 2 T1). Pure.
 *  @returns {number} entier ≥ 0. */
function mgmtAudienceRef(m){
  if(m&&Array.isArray(m.audiences)){
    let s=0,n=0;
    for(const a of m.audiences){ if(Number.isSafeInteger(a)&&a>=0){ s+=a; n++; } }
    if(n>0) return Math.round(s/n);
  }
  const refAttraction=MGMT_DRAW_AVG*(MGMT_MAIN_SIZE*MGMT_ATTR_MAIN_W+MGMT_PRELIM_SIZE*MGMT_ATTR_PRELIM_W);
  const refMix=MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*MGMT_SPECTACLE_REF;
  return Math.round(MGMT_AUD_PER_DRAW*refAttraction*refMix);
}
/* ==== [FIN ANCRE] ==== */

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
  if(o.susp!==undefined&&(!Number.isSafeInteger(o.susp)||o.susp<0)) return false;
  if(o.retired!==undefined&&o.retired!=='medical') return false;
  /* Lot 2 T1 : dernier combat sous Split — absent (jamais combattu) ou
     entier positif. */
  if(o.lastCycle!==undefined&&(!Number.isSafeInteger(o.lastCycle)||o.lastCycle<0)) return false;
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

/** Validation structurelle d'une sauvegarde du bureau, en lecture seule.
 *  Lot 3b T1 : l'argent s'ajoute — trésorerie entière (le découvert est
 *  permis, c'est T sous zéro), les deux dernières recettes, l'audience
 *  d'historique et le nombre de soirées jouées. */
function validateMgmt(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return false;
  if(raw.v!==MGMT_SAVE_VERSION) return false;
  if(raw.org!==MGMT_ORG) return false;
  if(!Number.isSafeInteger(raw.cycle)||raw.cycle<0) return false;
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
 *  ajouté d'office. Sans perte, sans reset : une v1 reste refusée, comme
 *  avant. */
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
  if(raw.v!==MGMT_SAVE_VERSION) return null;
  return raw;
}

/** Réparation tolérante d'un état chargé valide : faits plafonnés, titres
 *  recalculés quand ils manquent (sauvegardes antérieures), affaire ouverte
 *  recadrée — ou première affaire ouverte sélectionnée d'office quand aucune
 *  ne l'est, pour que le bureau ne s'ouvre jamais vide. */
function mgmtRepair(m){
  if(!m||typeof m!=='object') return null;
  if(!Array.isArray(m.facts)) m.facts=[];
  while(m.facts.length>MGMT_FACTS_MAX) m.facts.shift();
  /* Lot 3a §9 : le corps invalide ne bloque pas le chargement — on l'écarte
     (le traumatisme se re-dérive, la suspension et la retraite tombent) ; une
     soirée illisible est écartée (recharger ne rejoue rien d'invalide) ; un
     combat en carte qui ne pointe plus vers le roster est retiré. */
  if(Array.isArray(m.roster)){
    for(const o of m.roster){
      if(o&&typeof o==='object'){
        if(o.trauma!==undefined&&(!Number.isFinite(o.trauma)||o.trauma<0||o.trauma>MGMT_TRAUMA_MAX)) delete o.trauma;
        if(o.susp!==undefined&&(!Number.isSafeInteger(o.susp)||o.susp<0)) delete o.susp;
        if(o.retired!==undefined&&o.retired!=='medical') delete o.retired;
        if(o.lastCycle!==undefined&&(!Number.isSafeInteger(o.lastCycle)||o.lastCycle<0)) delete o.lastCycle;
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
