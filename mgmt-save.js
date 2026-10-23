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
   MGMT_PRELIM_SIZE, MGMT_FAMILY_LABELS, MGMT_EXT_FONDATEUR_SPREAD),
   mgmt-corps.js (MGMT_TRAUMA_MAX),
   mgmt-monde.js (mgmtExteriorEnsure, mgmtValidExteriorLine)
   et state/state-core.js (G).
   ============================================================================ */

/* --------------------------- persistance -------------------------------- */
function mgmtValidLine(o){
  if(!o||typeof o!=='object'||Array.isArray(o)) return false;
  if(!mgmtValidId(o.id)) return false;
  if(typeof o.name!=='string'||!o.name) return false;
  if(typeof o.ck!=='string'||!COUNTRY_KEYS.includes(o.ck)) return false;
  if(o.generation!==undefined&&o.generation!==0&&o.generation!==MGMT_IDENTITE_GENERATION) return false;
  for(const k of ['W','L','D']){ if(!Number.isSafeInteger(o[k])||o[k]<0) return false; }
  if(typeof o.age!=='number'||!Number.isFinite(o.age)||o.age<0||o.age>100) return false;
  if(typeof o.div!=='string'||!divById(o.div)) return false;
  if(typeof o.divName!=='string') return false;
  if(!mgmtOrgValide(o.org)) return false;
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
  if(typeof mgmtContratLigneValide==='function'&&!mgmtContratLigneValide(o)) return false;
  /* Lot 2B T1 bis : dernier combat connu — absent (jamais combattu), cycle
     Split positif, ou cycle extérieur négatif pour une recrue dont le
     dernier combat précède l'ouverture de la partie. */
  if(o.lastCycle!==undefined&&!Number.isSafeInteger(o.lastCycle)) return false;
  /* Brief du 06/10, lot 2 : le niveau, le potentiel et l'âge de pic — absents d'une ligne d'avant le lot. */
  for(const k of ['niv','pot']){ if(o[k]!==undefined&&(!Number.isFinite(o[k])||o[k]<MGMT_NIV_MIN||o[k]>MGMT_NIV_MAX)) return false; }
  if(o.pic!==undefined&&(!Number.isSafeInteger(o.pic)||o.pic<MGMT_NIV_PIC_MIN||o.pic>MGMT_NIV_PIC_MIN+MGMT_NIV_PIC_SPREAD)) return false;
  return true;
}

/* ==== [ANCRE: MONDE_LOT6_T3_SCHEMA] — Monde lot 6 T3 ==== */
/** Vérifie une preuve enregistrée pour la paire, sans recalculer son actualité. @param {Object} raison Preuve {famille,fait}. @param {string} aid Premier id. @param {string} bid Second id. @returns {boolean} Structure et références de paire conformes au schéma T1. */
function mgmtRaisonValide(raison,aid,bid){
  const objet=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  if(!objet(raison)||!objet(raison.fait)||!mgmtValidId(aid)||!mgmtValidId(bid)||aid===bid) return false;
if(Object.keys(raison).sort().join(',')!=='fait,famille') return false;
  const f=raison.fait, entier=Number.isSafeInteger, compte=x=>entier(x)&&x>=0;
  const id=x=>x===aid||x===bid, paire=(a,b)=>id(a)&&id(b)&&a!==b;
  const age=x=>Number.isFinite(x)&&x>=0&&x<=100;
  /* Schéma fermé, famille par famille : toutes les clés attendues sont
     présentes, aucune autre ne l'est. `opt` ne sert qu'à `target` d'une
     demande « un-classe » sans cible — le lecteur écrit alors undefined, que
     la sérialisation efface ; c'est la seule clé jamais portée par le
     catalogue. Les sous-objets de `combattants` sont eux aussi fermés. */
  const ouvert=(o,cles,opt)=>objet(o)&&cles.every(k=>Object.hasOwn(o,k))
    &&Object.keys(o).every(k=>cles.includes(k)||(opt||[]).includes(k));
  const deux=(cles,fn)=>Array.isArray(f.combattants)&&f.combattants.length===2
    &&f.combattants.every(x=>ouvert(x,cles)&&fn(x))&&paire(f.combattants[0].a,f.combattants[1].a);
  const reclame=()=>paire(f.a,f.b)&&entier(f.c)&&['rivalite','trilogie','micro','reseaux'].includes(f.raison);
  switch(raison.famille){
    case 'revanche': return ouvert(f,['source','i','c','gagnant','perdant'])&&f.source==='hist'&&compte(f.i)&&entier(f.c)&&paire(f.gagnant,f.perdant);
    case 'rivalite-ouverte': return f.source==='reclames'?ouvert(f,['source','a','b','raison','c'])&&reclame()&&['micro','reseaux'].includes(f.raison)
      :ouvert(f,['source','i','a','target','c'])&&f.source==='facts'&&compte(f.i)&&entier(f.c)&&paire(f.a,f.target);
    case 'series-croisees': return ouvert(f,['source','combattants'])&&f.source==='serie'&&deux(['a','issue','n'],x=>x.issue==='win'&&compte(x.n)&&x.n>=3);
    case 'classement-voisin': return ouvert(f,['source','portee','div','combattants'])&&f.source==='classement'&&f.portee==='organization'&&!!divById(f.div)
      &&deux(['a','rang'],x=>compte(x.rang)&&x.rang>=1)&&Math.abs(f.combattants[0].rang-f.combattants[1].rang)<=2;
    case 'test-jeune': return ouvert(f,['source','a','b','role','contreRole','age','total','contreAge','contreTotal'])
      &&f.source==='roles'&&paire(f.a,f.b)&&age(f.age)&&age(f.contreAge)
      &&compte(f.total)&&compte(f.contreTotal)&&(f.role===null||typeof f.role==='string')
      &&(f.contreRole===null||typeof f.contreRole==='string');
    case 'derniere-chance': return ouvert(f,['source','a','issue','n'])&&f.source==='serie'&&id(f.a)&&f.issue==='loss'&&compte(f.n)&&f.n>=2;
    case 'longue-attente': return ouvert(f,['source','a','cycles','mois','depuis'])&&f.source==='attente'&&id(f.a)&&compte(f.cycles)&&compte(f.mois)&&f.mois>=6&&entier(f.depuis);
    case 'demande-promesse': return ouvert(f,['source','i','k','a','want','c',...(f.k==='promesse'?['due']:[])],['target'])
      &&f.source==='facts'&&compte(f.i)&&id(f.a)&&entier(f.c)
      &&['demande','promesse'].includes(f.k)&&['revanche','trilogie','un-classe'].includes(f.want)
      &&(paire(f.a,f.target)||(f.want==='un-classe'&&(f.target===null||f.target===undefined)))
      &&(f.k!=='promesse'||entier(f.due)&&f.due>=f.c);
    case 'fin-contrat': return ouvert(f,['source','a','n','f','restants'])&&f.source==='contrat'&&id(f.a)&&compte(f.n)&&compte(f.f)&&f.restants===1&&f.n-f.f===1;
    case 'styles-opposes': return ouvert(f,['source','combattants'])&&f.source==='bilan-public'&&deux(['a','style'],x=>['Finit par KO','Finit au sol'].includes(x.style))
      &&f.combattants[0].style!==f.combattants[1].style;
    case 'derby': return ouvert(f,['source','a','b','pays','ville'])&&f.source==='identite'&&paire(f.a,f.b)&&COUNTRY_KEYS.includes(f.pays)&&(f.ville===null||typeof f.ville==='string');
    case 'debuts': return ouvert(f,['source','a','n'])&&f.source==='hist'&&id(f.a)&&f.n===0;
    case 'veteran': return ouvert(f,['source','a','age','total'])&&f.source==='bilan'&&id(f.a)&&age(f.age)&&compte(f.total)&&(f.age>=33||f.total>=20);
    case 'reclame-public': return ouvert(f,['source','a','b','raison','c'])&&f.source==='reclames'&&reclame();
    case 'meme-categorie-jamais-affrontes': return ouvert(f,['source','a','b','div','n'])&&f.source==='hist'&&paire(f.a,f.b)&&!!divById(f.div)&&f.n===0;
    default: return false;
  }
}
/** Contrat de la cause portée par un combat, selon l'endroit où il vit.
 * `bloc` = les combats d'une affaire en bloc (toujours pourvus), sinon la carte
 * (un booking manuel n'en porte pas). Les anciennes causes restent
 * explicitement inconnues ; jamais de lecture du monde.
 * @param {Object} f Combat {a,b,origine?,raison?}.
 * @param {boolean} bloc Combat d'une affaire en bloc.
 * @returns {boolean} */
function mgmtCombatRaisonValide(f,bloc){
  if(f.origine!==undefined&&f.origine!=='leila'&&f.origine!=='joueur') return false;
  if(f.raison===undefined) return !bloc&&f.origine===undefined;
  if(f.raison===null) return f.origine!=='leila';
  return mgmtRaisonValide(f.raison,f.a,f.b);
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
      /* ==== [ANCRE: MONDE_LOT6_T3_AFFAIRE] — Monde lot 6 T3 ==== */
      if(!mgmtCombatRaisonValide(f,true)) return false;
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
 *  quand ils sont là. Lot 2B T4 : le bonus de victoire voyage avec la
 *  finance, toléré absent (soirée d'avant la tranche), strict quand il
 *  est là. */
function mgmtValidEvent(e){
  if(!e||typeof e!=='object'||Array.isArray(e)) return false;
  if(!Number.isSafeInteger(e.cycle)||e.cycle<0) return false;
  if(!Array.isArray(e.fights)||!Array.isArray(e.touched)) return false;
  for(const x of e.fights){
    if(!x||typeof x.a!=='string'||!x.a||typeof x.b!=='string'||!x.b) return false;
    if(x.winner!=='A'&&x.winner!=='B'&&x.winner!=='D') return false;
    if(!MGMT_FAMILY_LABELS[x.family]) return false;
    if(!Number.isSafeInteger(x.round)||x.round<1) return false;
    /* Lot 5 T1 : absents dans les anciennes soirées, stricts si présents. */
    if(x.title!==undefined&&typeof x.title!=='boolean') return false;
    if(x.rounds!==undefined&&(x.rounds!==3&&x.rounds!==5||x.round>x.rounds)) return false;
    if(x.title===true&&x.rounds!==5) return false;
  }
  for(const t of e.touched){
    if(!t||typeof t.id!=='string'||!t.id) return false;
    if(typeof t.retired!=='boolean') return false;
    if(t.injury!==null&&(typeof t.injury!=='string'||!t.injury)) return false;
    if(!Number.isSafeInteger(t.days)||t.days<0) return false;
  }
  if(e.e1!==undefined&&typeof e.e1!=='boolean') return false;
  if(e.vu!==undefined&&(!Number.isSafeInteger(e.vu)||e.vu<0)) return false;
  /* Monde lot 44 T1 : la première entrée de la soirée dans m.hist, et la
     prime payée à la clôture (0 : soirée sans combat notable). */
  if(e.premier!==undefined&&(!Number.isSafeInteger(e.premier)||e.premier<0)) return false;
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
    /* Lot 2B T4 : le bonus de victoire voyage avec la finance — toléré
       absent (soirée d'avant la tranche), strict quand il est là. */
    if(f.bonuses!==undefined&&(!Number.isSafeInteger(f.bonuses)||f.bonuses<0)) return false;
    if(f.primes!==undefined&&(!Number.isSafeInteger(f.primes)||f.primes<0)) return false;
    if(!Number.isSafeInteger(f.recette)) return false;
    /* Brief démo, lot 6 : les trois critères de la satisfaction, absents des soirées d'avant. */
    if(f.criteres!==undefined){
      const k=f.criteres;
      if(!k||typeof k!=='object'||Array.isArray(k)) return false;
      for(const n of ['reclame','serres','noms']){ if(typeof k[n]!=='number'||!(k[n]>=0&&k[n]<=1)) return false; }
      if(!Number.isSafeInteger(k.reclames)||k.reclames<0) return false;
    }
  }
  return true;
}

/** Validation d'une ligne extérieure : SON IDENTITÉ, RIEN D'AUTRE — la
 *  liste exacte des cinq clés historiques (id, seed, div, ck, born) et du
 *  marqueur generation en H3 (absent = ancien). Toute ligne qui
 *  porterait un bilan, un âge ou un champ dérivé est refusée : la dérivation
 *  est la seule source, la règle du bureau ne se stocke pas (CDC §3). Porte
 *  de validateMgmt : le champ exterieur est toléré absent (sauvegardes
 *  d'avant le lot 2B), strict quand il est là.
 *  Lot 2B T3 bis : une date d'entrée antérieure à l'ouverture existe —
 *  le passé des fondateurs (mgmt-monde.js, flux 'ext-fondateur') fait
 *  descendre born jusqu'à −MGMT_EXT_FONDATEUR_SPREAD ; accepté, borné
 *  (une entrée encore plus ancienne est illisible, réparation à la porte). */
function mgmtValidExteriorLine(o){
  if(!o||typeof o!=='object'||Array.isArray(o)) return false;
  const clefs=Object.keys(o).sort().join(',');
  if(clefs!=='born,ck,div,id,seed'&&clefs!=='born,ck,div,generation,id,seed') return false;
  if(o.generation!==undefined&&o.generation!==0&&o.generation!==MGMT_IDENTITE_GENERATION) return false;
  if(!mgmtValidId(o.id)) return false;
  if(!Number.isSafeInteger(o.seed)||o.seed<0||o.seed>0xFFFFFFFF) return false;
  if(typeof o.div!=='string'||!divById(o.div)) return false;
  if(typeof o.ck!=='string'||!COUNTRY_KEYS.includes(o.ck)) return false;
  if(!Number.isSafeInteger(o.born)||o.born<-MGMT_EXT_FONDATEUR_SPREAD) return false;
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
  /* Brief du 06/10, lot 2 : le niveau d'avant combat est facultatif — les traces d'avant le lot n'en portent pas. */
  if(t.niv!==undefined&&(!Number.isFinite(t.niv)||t.niv<MGMT_NIV_MIN||t.niv>MGMT_NIV_MAX)) return false;
  /* Lot 9 : la rouille sous contrat se lit sur l'attente depuis la signature (rg), facultative. */
  if(t.rg!==undefined&&!Number.isSafeInteger(t.rg)) return false;
  const clefs=Object.keys(t).filter(k=>k!=='niv'&&k!=='rg').sort().join(',');
  if(clefs!=='D,L,W,age,div,first,id,last,lastCycle,name,trauma,traumaFloor'){
    if(clefs!=='D,L,W,age,ck,div,first,generation,id,last,lastCycle,name,trauma,traumaFloor'
      ||t.generation!==MGMT_IDENTITE_GENERATION||!COUNTRY_KEYS.includes(t.ck)) return false;
  }
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
  /* Monde lot 1 T5 : p:true marque un combat du passé (allégé, il ne se revoit pas). */
  if(x.p!==undefined&&x.p!==true) return false;
  /* Monde lot 31 T1 : s est optionnelle même si invalide ; mgmtRepair la
     retire seule sans écarter la trace. */
  /* Duo T1 : `duo` marque un combat de super carte — {b,ca,cb}, facultatif comme `p`. */
  if(x.duo!==undefined){
    const d=x.duo;
    if(!d||typeof d!=='object'||Array.isArray(d)||Object.keys(d).sort().join(',')!=='b,ca,cb') return false;
    if(!MGMT_ORGANISATIONS.some(o=>o.id===d.b)||!Number.isSafeInteger(d.ca)||d.ca<0||!Number.isSafeInteger(d.cb)||d.cb<0) return false;
  }
  /* Monde lot 44 T1 : pr marque le prix reçu (combat de la soirée, performance). */
  if(x.pr!==undefined&&x.pr!=='cs'&&x.pr!=='pf') return false;
  const clefs=Object.keys(x).filter(k=>k!=='p'&&k!=='duo'&&k!=='s'&&k!=='pr').sort().join(',');
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

/* ==== [ANCRE: DUO_T1_VALIDATION] — Duo T1 : l'état `m.duo` d'une partie à deux ==== */
/** Valide `m.duo` : forme, bornes et cohérence avec la partie (monde vivant, organisation de J2 distincte de la sienne). Pur. */
function mgmtDuoValide(d,raw){
  if(!d||typeof d!=='object'||Array.isArray(d)||d.v!==1) return false;
  if(raw.mondeVivant!==true||!raw.orgs||typeof raw.orgs!=='object'||!Object.prototype.hasOwnProperty.call(raw.orgs,d.b)) return false;
  const propre=mgmtOrgParNom(raw.org);
  if(propre&&propre.id===d.b) return false;
  const nom=x=>typeof x==='string'&&x.length>=1&&x.length<=16;
  if(!d.noms||typeof d.noms!=='object'||!nom(d.noms.a)||!nom(d.noms.b)) return false;
  for(const k of ['periode','prochaine']){ if(!Number.isSafeInteger(d[k])||d[k]<0) return false; }
  if(!['attente','encheres','draft','pret','soiree','bilan'].includes(d.etape)) return false;
  if(!d.reperes||!Number.isSafeInteger(d.reperes.ca)||!Number.isSafeInteger(d.reperes.cb)) return false;
  if(d.draft!==null){
    const dr=d.draft;
    if(!dr||typeof dr!=='object'||!['a','b'].includes(dr.premier)||!['a','b'].includes(dr.tour)) return false;
    if(dr.attente!==null&&dr.attente!=='place'&&dr.attente!=='reponse') return false;
    if(!Array.isArray(dr.combats)||dr.combats.length>6) return false;
    for(const c of dr.combats){
      if(!c||typeof c!=='object'||!['a','b'].includes(c.place)||typeof c.div!=='string') return false;
      for(const k of ['a','b']){ if(c[k]!==null&&!mgmtValidId(c[k])) return false; }
    }
  }
  if(d.encheres!==null){
    const e=d.encheres;
    if(!e||typeof e!=='object'||!Array.isArray(e.lots)||e.lots.length>3||!Number.isSafeInteger(e.i)||e.i<0||e.i>e.lots.length||!['a','b'].includes(e.premier)) return false;
    for(const l of e.lots){
      if(!l||typeof l!=='object'||!mgmtValidId(l.id)||typeof l.fini!=='boolean'||!['a','b'].includes(l.tour)) return false;
      for(const k of ['b','ouverture','pas','prix']){ if(!Number.isSafeInteger(l[k])||l[k]<0) return false; }
      for(const k of ['meneur','gagnant']){ if(l[k]!==null&&!['a','b'].includes(l[k])) return false; }
      if(!Number.isSafeInteger(l.passes)||l.passes<0||l.passes>2) return false;
    }
  }
  if(d.recrues!==undefined&&(!Array.isArray(d.recrues)||d.recrues.length>200)) return false;
  if(d.soiree!==null&&(!d.soiree||!Number.isSafeInteger(d.soiree.i)||d.soiree.i<0||d.soiree.i>6)) return false;
  if(!Array.isArray(d.cartes)||d.cartes.length>200) return false;
  for(const c of d.cartes){
    if(!c||typeof c!=='object'||!Array.isArray(c.combats)||c.combats.length!==6) return false;
    if(!c.gains||!Number.isSafeInteger(c.gains.a)||c.gains.a<0||!Number.isSafeInteger(c.gains.b)||c.gains.b<0) return false;
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
  if(raw.surnomsGagnes!==undefined&&typeof raw.surnomsGagnes!=='boolean') return false;
  if(raw.surnoms!==undefined&&!mgmtSurnomsGagnesValide(raw.surnoms)) return false;
  if(raw.idPrefixe!==undefined&&(typeof raw.idPrefixe!=='string'||!MGMT_ID_RE.test(raw.idPrefixe))) return false;
  if(raw.duo!==undefined&&!mgmtDuoValide(raw.duo,raw)) return false;   /* Duo T1 */
  if(raw.semaine!==undefined&&!mgmtSemaineValide(raw.semaine)) return false;
  if(raw.recruteur!==undefined&&!mgmtRecruteurValide(raw.recruteur)) return false;
  if(raw.memoire!==undefined&&!mgmtMemoireValide(raw.memoire)) return false;
  if(!mgmtOrgValide(raw.org)) return false;
  /* Monde lot 9 T2a : les organisations vivantes (m.orgs) ou l'ancien monde (mondeVivant=false ou absent). */
  if(raw.mondeVivant!==undefined&&typeof raw.mondeVivant!=='boolean') return false;
  if(!Number.isSafeInteger(raw.cycle)||raw.cycle<0) return false;
  if(!Number.isSafeInteger(raw.ageWeeks)||raw.ageWeeks<0||raw.ageWeeks>=MGMT_EXT_YEAR_WEEKS) return false;
  if(!Number.isSafeInteger(raw.seq)||raw.seq<1) return false;
  if(!Array.isArray(raw.roster)||!Array.isArray(raw.pile)||!Array.isArray(raw.facts)) return false;
  if(raw.open!==null&&typeof raw.open!=='string') return false;
  if(raw.shortfall!==undefined&&typeof raw.shortfall!=='boolean') return false;
  if(raw.effectifs!==undefined&&raw.effectifs!==0&&raw.effectifs!==1) return false;
  if(raw.echelleExt!==undefined&&raw.echelleExt!==4&&raw.echelleExt!==7) return false;
  if(raw.niveaux!==undefined&&raw.niveaux!==0&&raw.niveaux!==1) return false;
  /* Monde lot 33 T1 : cercle résiduel vide après réparation, liste unique de 60 suivis. */
  for(const [cle,max] of [['cercle',5],['suivis',60]]){
    if(raw[cle]===undefined) continue;
    if(!Array.isArray(raw[cle])||raw[cle].length>max||new Set(raw[cle]).size!==raw[cle].length) return false;
    for(const id of raw[cle]){ if(!mgmtValidId(id)) return false; }
  }
  if(raw.reserves!==undefined&&(!Array.isArray(raw.reserves)||raw.reserves.length>15||new Set(raw.reserves).size!==raw.reserves.length||raw.reserves.some(id=>!mgmtValidId(id)||id.length>80)))return false;
  for(const k of ['espoirsPropose','espoirs']) if(raw[k]!==undefined&&(!Array.isArray(raw[k])||raw[k].length>(k==='espoirs'?3:12)||new Set(raw[k]).size!==raw[k].length||raw[k].some(id=>typeof id!=='string'||!id||id.length>80)))return false;
  if(raw.espoirs&&raw.espoirsPropose&&raw.espoirs.some(id=>!raw.espoirsPropose.includes(id)))return false;
  /* ==== [ANCRE: P11_T2_DEFIS_SAUVEGARDE] — Monde lot 46 T1 ==== */
  /* Facultatif : une partie d'avant le lot n'en porte pas. Quand il est là,
     seuls des identifiants connus, soixante entrées au plus. */
  if(raw.defis!==undefined&&!mgmtDefisValide(raw.defis)) return false;
  if(raw.cercle&&raw.suivis&&raw.cercle.some(id=>raw.suivis.includes(id))) return false;
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
      if(f.title!==undefined&&typeof f.title!=='boolean') return false;
      /* ==== [ANCRE: MONDE_LOT6_T3_CARTE] — Monde lot 6 T3 ==== */
      if(!mgmtCombatRaisonValide(f,false)) return false;
      /* ==== [ANCRE: MONDE_LOT5_T3_VALIDATION] — Monde lot 5 T3 ==== */
      if(f.herite!==undefined&&(f.herite!==true||f.slot!=='main')) return false;
      /* Monde lot 15 : un combat d'ouverture (places 4 et 5 laissées par l'ancien matchmaker) est en carte principale. */
      if(f.ouverture!==undefined&&(f.ouverture!==true||f.slot!=='main')) return false;
    }
    if(raw.card.main.some(f=>f.slot!=='main')||raw.card.prelims.some(f=>f.slot!=='prelim')) return false;
  }
  if(raw.cal!==undefined&&!mgmtAgendaValide(raw.cal)) return false;
  if(raw.passe!==undefined&&!mgmtPasseValide(raw.passe)) return false;   /* Monde lot 1 T3 */
  if(raw.fil!==undefined&&!mgmtFilValide(raw.fil)) return false;
  /* Monde lot 8 T1 : la table des visites — tolérée absente (états construits
     par les tests, migrations), strict quand elle est là. */
  if(raw.visites!==undefined&&!mgmtVisitesValide(raw.visites)) return false;
  if(!mgmtSallesValide(raw)) return false;
  if(raw.card!==undefined&&raw.card.sizeEarly!==undefined&&(!Number.isSafeInteger(raw.card.sizeEarly)||raw.card.sizeEarly<0||raw.card.sizeEarly>raw.card.sizePrelims)) return false;
  /* Monde lot 44 T1 : le dernier état de salle, facultatif, strict quand il est là. */
  if(raw.soirees!==undefined&&!mgmtSalleEtatValide(raw.soirees)) return false;
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
  /* QO-9 : aucune limite de longueur ; une sauvegarde ancienne ou une
      mémoire de plusieurs saisons franchit la même porte sans perte. */
  const titleInitial=new Set(),titleFights=new Set();
  for(const f of raw.facts){
    if(!f||typeof f!=='object'||Array.isArray(f)) return false;
    /* Lot 5 T1 : un fait de titre pointe vers le combat auto-portant ;
       aucun champion ni compteur dérivé n'est persisté à côté. */
    if(f.k==='title_initial'){
      if(Object.keys(f).sort().join(',')!=='a,c,div,k'||!divById(f.div)
        ||!Number.isSafeInteger(f.c)||f.c<0||f.c>raw.cycle
        ||f.a!==null&&!mgmtValidId(f.a)||titleInitial.has(f.div)) return false;
      titleInitial.add(f.div);
    }else if(f.k==='title_fight'){
      if(Object.keys(f).sort().join(',')!=='c,div,fight,k'||!divById(f.div)
        ||!Number.isSafeInteger(f.c)||f.c<0||f.c>raw.cycle
        ||!Number.isSafeInteger(f.fight)||f.fight<0||titleFights.has(f.fight)) return false;
      const t=raw.hist[f.fight];
      if(!t||t.c!==f.c||t.a.div!==f.div||t.b.div!==f.div
        ||t.a.id===t.b.id||t.rounds!==5||t.round>t.rounds) return false;
      titleFights.add(f.fight);
    }else if(f.k==='retrait'||f.k==='retrait_sortie'||f.k==='offre'||f.k==='engage'||f.k==='reduite'){
      /* Lot 5 T6 : la carte incomplète — retrait, sortie choisie, offre, engagement, carte réduite. */
      if(!Number.isSafeInteger(f.c)||f.c<0||f.c>raw.cycle) return false;
      if((f.k==='retrait'||f.k==='offre'||f.k==='engage')&&!mgmtValidId(f.a)) return false;
      if(f.k==='retrait'&&(!mgmtValidId(f.adv)||(f.slot!=='main'&&f.slot!=='prelim'))) return false;
      if(f.k==='retrait_sortie'&&!['remonter','split','externe','reduite'].includes(f.s)) return false;
      if(f.k==='engage'&&!['split','autre','libre'].includes(f.src)) return false;
    }else if(f.k==='prime'){
      /* Monde lot 44 T1 : un versement, sur un combat de cette soirée. */
      if(!mgmtPrimeFactValide(f,raw.hist)||f.c>raw.cycle) return false;
    }else if(f.k==='recrue'){
      /* Lot 5 T5 : le geste de recruter — un fait, l'identifiant du recruté et le cycle. */
      if(!mgmtValidId(f.a)||!Number.isSafeInteger(f.c)||f.c<0||f.c>raw.cycle) return false;
    }else if(f.k==='demande'||f.k==='promesse'||f.k==='refus'||f.k==='contrarie'){
      /* Lot 5 H7 : demandes, promesses, refus et décisions contraires — des faits, rien de dérivé. */
      if(!mgmtValidId(f.a)||!Number.isSafeInteger(f.c)||f.c<0||f.c>raw.cycle) return false;
      if((f.k==='demande'||f.k==='promesse')&&(typeof f.want!=='string'||!MGMT_DEMANDES[f.want])) return false;
      /* target:null est toléré : des parties enregistrées entre le 03/10 et le 06/10 en portent (H10, deuxième groupe). */
      if(f.target!==undefined&&f.target!==null&&!mgmtValidId(f.target)) return false;
      if(f.k==='promesse'&&(!Number.isSafeInteger(f.due)||f.due<f.c||!Number.isSafeInteger(f.d))) return false;
      if(f.k==='refus'&&!Number.isSafeInteger(f.d)) return false;
      /* ==== [ANCRE: MONDE_LOT5_T4_VALIDATION] — Monde lot 5 T4 ==== */
      if(f.k==='contrarie'&&(!Number.isSafeInteger(f.p)||f.p<10||f.p>30||(f.why!=='titre'&&f.why!=='jeune'&&f.why!=='coequipier'&&f.why!=='fratrie'&&f.why!=='annulation-heritee'))) return false;
    }
  }
  if(raw.lastEvent!==undefined&&raw.lastEvent!==null&&!mgmtValidEvent(raw.lastEvent)) return false;
  /* Retours du 09/10/2026 : la graine de la partie (facultative : une partie d'avant n'en a pas). */
  if(raw.graine!==undefined&&(typeof raw.graine!=='string'||!/^[0-9a-z]{1,16}$/.test(raw.graine))) return false;
  if(raw.poste!==undefined&&!mgmtPosteValide(raw.poste)) return false;
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
 *  se dérive de son identifiant à la lecture. Sans perte, sans
 *  reset : une v1 reste refusée, comme avant. 14 → 15 (monde lot 1 T3, le passé : rien à convertir),
 *  15 → 16 (monde lot 8 T1, 10/10/2026, renumérotée à la fusion) : la table des visites part pleine (tous vus, migration
 *  MONDE_LOT8_T1_MIGRATION), rien d'autre ne bouge. */
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
    raw.card={sizeMain:MGMT_MAIN_SIZE,sizePrelims:MGMT_PRELIM_AVANT_H4,main:[],
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
  /* 9 → 10 (lot 2B T3 bis, docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T3 bis) :
     une date d'entrée antérieure à l'ouverture existe — le passé des
     fondateurs se dérive (mgmt-monde.js, flux 'ext-fondateur'), la porte
     l'accepte jusqu'à −MGMT_EXT_FONDATEUR_SPREAD. Rien à convertir : aucune
     ligne d'une v9 ne peut porter un born négatif, la cohorte d'ouverture
     d'une partie déjà commencée reste celle qu'elle porte — le monde d'une
     ancienne sauvegarde ne bouge pas. */
  if(raw.v===9){
    raw.v=10;
  }
  /* 10 → 11 (lot 5 T1, décisions d'Anthony du 02/10/2026) : attribuer
     aujourd'hui les ceintures au premier classé, zéro défense. Aucun ancien
     combat n'est requalifié en titre ou en cinq rounds ; trace et faits
     existants restent intacts. Les choix title absents valent faux. */
  if(raw.v===10){
    raw.v=11;
    mgmtInitTitles(raw);
  }
  /* ==== [ANCRE: MGMT_LOT5_H3_MIGRATION] — 11 → 12 : origine retrouvée,
     génération ancienne figée. Aucun profil, style, identité dérivée ni
     attribut stocké ; traces anciennes intactes et rejouables. ==== */
  if(raw.v===11){
    for(const o of raw.roster||[]){
      if(!o||typeof o!=='object') continue;
      o.ck=mgmtIdentitePays(o);
      o.generation=0;
    }
    for(const o of raw.exterieur||[]){
      if(o&&typeof o==='object') o.generation=0;
    }
    raw.v=12;
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: MGMT_LOT5_H4_MIGRATION] — 12 → 13 : les effectifs. Une
     partie commencée garde son monde à 30 par catégorie, son vestiaire et la
     taille de sa carte (card.sizePrelims déjà sauvegardée) : effectifs 0.
     Aucune ligne ajoutée ni retirée. ==== */
  if(raw.v===12){
    raw.effectifs=0;
    raw.v=13;
  }
  /* ==== [FIN ANCRE] ==== */
  /* Monde lot 24 T1 : echelleExt est facultatif ; absent conserve l'échelle historique de quatre noms. */
  /* ==== [ANCRE: MGMT_BRIEF_LOT2_MIGRATION] — 13 → 14 : un niveau propre à chaque combattant. Chaque ligne reçoit
     comme niveau actuel celui que lui donnait son palmarès, un potentiel et un pic déduits de son identifiant. Les traces
     de combat d'avant ne portent pas de niveau et se rejouent à l'identique (ancienne loi). ==== */
  if(raw.v===13){
    raw.niveaux=1;
    if(Array.isArray(raw.roster)){
      for(const o of raw.roster){
        try{ if(o&&typeof o==='object'&&typeof o.id==='string'&&Number.isFinite(o.W)&&Number.isFinite(o.L)&&Number.isFinite(o.age)) mgmtNiveauPose(o); }catch(e){}
      }
    }
    raw.v=14;
  }
  /* Monde lot 1 T3 : 14 → 15. Une partie d'avant n'a pas de passé (m.passe absent est valide) : rien à convertir, rien à perdre. */
  if(raw.v===14){
    raw.v=15;
  }
  /* ==== [FIN ANCRE] ==== */
   /* ==== [ANCRE: MONDE_LOT8_T1_MIGRATION] — 15 → 16 (monde lot 8 T1, docs/lots/MONDE-LOT-8-T1.md) : la table des
      visites (m.visites, {id:[nFaits,nCombats]}, mgmt-attention.js) part PLEINE à l'instant de la migration —
      tous les combattants déjà dans la partie sont considérés vus, donc 0 marque au premier chargement (sinon
      351 sur 364 s'allumeraient après dix soirées). Sans perte : aucun autre champ n'est touché. ==== */
  if(raw.v===15){
    mgmtVisitesInit(raw);
    raw.v=16;
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: MONDE_LOT5_T3_MIGRATION] — Monde lot 5 T3 ==== */
  /* 16 → 17 : provenance facultative, jamais déduite pour une ancienne carte. */
  if(raw.v===16) raw.v=17;
  /* ==== [ANCRE: MONDE_LOT5_T4_MIGRATION] — Monde lot 5 T4 ==== */
  if(raw.v===17) raw.v=18;
  /* Renumérotation à la fusion (15/10/2026) : la migration du lot 6 T3 passe de 16 → 17 à 18 → 19. */
  /* ==== [ANCRE: MONDE_LOT6_T3_MIGRATION] — Monde lot 6 T3 ==== */
  if(raw.v===18){
    /* Une preuve déjà présente n'est jamais écrasée : la migration ne marque
       que ce qui n'en porte pas (une pile d'avant n'en porte aucune). */
    const marque=f=>{ if(f&&typeof f==='object'&&f.raison===undefined) f.raison=null; };
    for(const a of raw.pile||[]) if(a&&a.kind==='leila_bulk'&&Array.isArray(a.fights)){
      for(const f of a.fights) marque(f);
    }
    if(raw.card) for(const cle of ['main','prelims']) if(Array.isArray(raw.card[cle])){
      for(const f of raw.card[cle]) marque(f);
    }
    raw.v=19;
  }
  /* ==== [ANCRE: MONDE_LOT9_T2A_MIGRATION] — Monde lot 9 T2a (décision du superviseur du 15/10/2026), renumérotée 19 → 20 à la fusion du lot 6.
     Une partie d'avant porte m.mondeVivant=false et garde EXACTEMENT son ancien monde extérieur calculé ; rien d'autre ne bouge. ==== */
  if(raw.v===19){ raw.mondeVivant=false; raw.v=20; }
  /* ==== [ANCRE: MONDE_LOT9_T2D_MIGRATION] — Monde lot 9 T2d : 20 → 21 ==== */
  if(raw.v===20){
    if(raw.mondeVivant===true&&raw.orgs&&typeof mgmtMondeVivantPrefixer==='function'){
      for(const [id,sous] of Object.entries(raw.orgs)){
        const k=MGMT_ORGANISATIONS.findIndex(o=>o.id===id);
        if(k>=0) mgmtMondeVivantPrefixer(sous,'o'+k+'mg');
      }
    }
    raw.v=21;
  }
  if(raw.v!==MGMT_SAVE_VERSION) return null;
  return raw;
}

/** Réparation tolérante d'un état chargé valide : faits conservés, titres
 *  recalculés quand ils manquent (sauvegardes antérieures), affaire ouverte
 *  recadrée — ou première affaire ouverte sélectionnée d'office quand aucune
 *  ne l'est, pour que le bureau ne s'ouvre jamais vide. */
function mgmtRepair(m){
  if(!m||typeof m!=='object') return null;
  if(Object.prototype.hasOwnProperty.call(m,'semaine')&&!mgmtSemaineValide(m.semaine)) delete m.semaine;
  if(Object.prototype.hasOwnProperty.call(m,'poste')&&!mgmtPosteValide(m.poste)) delete m.poste;
  if(Object.prototype.hasOwnProperty.call(m,'semaine')&&!mgmtSemaineValide(m.semaine)) delete m.semaine;
  if(Object.prototype.hasOwnProperty.call(m,'recruteur')&&!mgmtRecruteurValide(m.recruteur)) delete m.recruteur;
  if(Object.prototype.hasOwnProperty.call(m,'memoire')&&!mgmtMemoireValide(m.memoire)) delete m.memoire;
  if(Object.prototype.hasOwnProperty.call(m,'surnoms')){
    const surnoms=mgmtSurnomsGagnesReparer(m.surnoms);
    if(surnoms===undefined) delete m.surnoms;
    else m.surnoms=surnoms;
  }
  /* ==== [ANCRE: MONDE_LOT33_T1_MIGRATION_SUIVIS] — Monde lot 33 T1 ==== */
  const cercleAncien=Array.isArray(m.cercle)?m.cercle:[];
  const suivisExistants=Array.isArray(m.suivis)?m.suivis:[];
  m.suivis=[...new Set([...cercleAncien,...suivisExistants])].filter(mgmtValidId);
  m.cercle=[];
  if(m.reserves!==undefined) m.reserves=Array.isArray(m.reserves)?[...new Set(m.reserves.filter(id=>mgmtValidId(id)&&id.length<=80))].slice(0,15):[];   /* facultative : une ancienne partie n'en porte pas */
   for(const k of ['espoirsPropose','espoirs']) if(Object.prototype.hasOwnProperty.call(m,k)&&(!Array.isArray(m[k])||m[k].length>(k==='espoirs'?3:12)||new Set(m[k]).size!==m[k].length||m[k].some(id=>typeof id!=='string'||!id||id.length>80)))delete m[k];
  if(Array.isArray(m.espoirs)&&Array.isArray(m.espoirsPropose)&&m.espoirs.some(id=>!m.espoirsPropose.includes(id)))delete m.espoirs;
  if(Object.prototype.hasOwnProperty.call(m,'actuLu')&&(!Array.isArray(m.actuLu)||m.actuLu.length>300||m.actuLu.some(x=>typeof x!=='string'||x.length>80))) m.actuLu=[];
  /* ==== [ANCRE: P11_T2_DEFIS_REPARATION] — Monde lot 46 T1 ==== */
  /* Présent et malformé seulement : les entrées lisibles d'un défi connu
     restent, le reste tombe, soixante au plus. Absent, il le reste. */
  if(Object.prototype.hasOwnProperty.call(m,'defis')){
    const defis=mgmtDefisReparer(m.defis);
    if(defis===null) delete m.defis; else m.defis=defis;
  }
  if(!Number.isSafeInteger(m.ageWeeks)||m.ageWeeks<0||m.ageWeeks>=MGMT_EXT_YEAR_WEEKS) m.ageWeeks=0;
  if(m.cal!==undefined&&!mgmtAgendaValide(m.cal)) delete m.cal;
  if(m.passe!==undefined&&!mgmtPasseValide(m.passe)) delete m.passe;   /* Monde lot 1 T3 */
  if(m.fil!==undefined&&!mgmtFilValide(m.fil)) delete m.fil;
  /* Monde lot 8 T1 : une table des visites illisible (ou absente) est
     reconstruite pleine — la réparation ne rallume jamais de marque. */
  if(!mgmtVisitesValide(m.visites)) mgmtVisitesInit(m);
  if(!mgmtSallesValide(m)){ delete m.salles; delete m.pop; delete m.comptes; }
  if(m.cal&&m.cal.actif===true) mgmtSallesInit(m);
  /* Monde lot 44 T1 : une clé de salle malformée est effacée, jamais ajoutée
     à une partie qui n'en porte pas. */
  if(m.soirees!==undefined&&!mgmtSalleEtatValide(m.soirees)) delete m.soirees;
  if(m.card&&m.card.sizeEarly!==undefined&&(!Number.isSafeInteger(m.card.sizeEarly)||m.card.sizeEarly<0||m.card.sizeEarly>m.card.sizePrelims)) m.card.sizeEarly=0;
  if(!Array.isArray(m.facts)) m.facts=[];
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
  /* Brief du 06/10, lot 2 : une partie à niveaux complète les lignes qui n'en ont pas. */
  if(m.niveaux===1) mgmtNiveauxComplete(m);
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
  else {
    /* Lot 5 T1 : si une trace illisible est écartée, recaler les références
       des faits de titre, sans couper ni décaler leur combat par erreur. */
    const indices=new Map(),hist=[];
    m.hist.forEach((x,i)=>{ if(x&&typeof x==='object'&&x.pr!==undefined&&x.pr!=='cs'&&x.pr!=='pf') delete x.pr; if(mgmtValidFightTrace(x)){ if(x.s!==undefined&&!mgmtReleveValide(x.s)) delete x.s; indices.set(i,hist.length); hist.push(x); } });
    m.hist=hist;
    m.facts=m.facts.filter(f=>f.k!=='title_fight'||indices.has(f.fight));
    /* Monde lot 44 T1 : le fait prime suit le combat, comme le fait de titre. */
    for(const f of m.facts){ if(f.k==='title_fight'||f.k==='prime') f.fight=indices.get(f.fight); }
    /* Monde lot 44 T1 : un fait prime malformé (ou qui pointe un combat
       disparu) est écarté. */
    m.facts=m.facts.filter(f=>f.k!=='prime'||mgmtPrimeFactValide(f,m.hist));
  }
  /* Lot 2 T1 : la carte {sizeMain,sizePrelims,main,prelims} se recadre — les
     deux capacités et les deux listes existent toujours, un combat qui ne
     pointe plus vers le roster est retiré de son emplacement. */
  if(!m.card||typeof m.card!=='object'||Array.isArray(m.card)){
    m.card={sizeMain:MGMT_MAIN_SIZE,sizePrelims:m.effectifs===1?MGMT_PRELIM_SIZE:MGMT_PRELIM_AVANT_H4,main:[],prelims:[]};
  }
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.sizeMain<1) m.card.sizeMain=MGMT_MAIN_SIZE;
  if(!Number.isSafeInteger(m.card.sizePrelims)||m.card.sizePrelims<1) m.card.sizePrelims=m.effectifs===1?MGMT_PRELIM_SIZE:MGMT_PRELIM_AVANT_H4;
  if(!Array.isArray(m.card.main)) m.card.main=[];
  if(!Array.isArray(m.card.prelims)) m.card.prelims=[];
  for(const slot of ['main','prelims']){
    if(Array.isArray(m.card[slot])) m.card[slot]=m.card[slot].filter(x=>x&&typeof x.a==='string'&&typeof x.b==='string');
  }
  /* Corrections du 08/10, 1.1 : une carte de 12 places, qui ne correspond à aucune soirée, se recadre sur la prochaine soirée posée (ou la petite). */
  if(typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)&&Array.isArray(m.cal.prochaines)&&mgmtAgendaTailleCarte(m)===null){
    const p=m.cal.prochaines[0];
    mgmtAgendaAjusterCarte(m,p&&p.taille==='grosse'?'grosse':'petite');
  }
  if(!m.leila||typeof m.leila!=='object'||Array.isArray(m.leila)) m.leila={crushes:[]};
  if(!Array.isArray(m.leila.crushes)) m.leila.crushes=[];
  m.leila.crushes=m.leila.crushes.filter(c=>Number.isSafeInteger(c)&&c>=0);
  if(m.lastEvent&&typeof m.lastEvent==='object'&&m.lastEvent.finance&&m.lastEvent.finance.primes!==undefined
    &&(!Number.isSafeInteger(m.lastEvent.finance.primes)||m.lastEvent.finance.primes<0)) delete m.lastEvent.finance.primes;
  if(m.lastEvent&&typeof m.lastEvent==='object'&&m.lastEvent.premier!==undefined
    &&(!Number.isSafeInteger(m.lastEvent.premier)||m.lastEvent.premier<0)) delete m.lastEvent.premier;
  if(m.lastEvent!==undefined&&m.lastEvent!==null&&!mgmtValidEvent(m.lastEvent)) m.lastEvent=null;
  if(Array.isArray(m.card.main)&&Array.isArray(m.roster)){
    const ids=new Set(m.roster.map(o=>o&&o.id));
    for(const slot of ['main','prelims']){
      m.card[slot]=m.card[slot].filter(x=>ids.has(x.a)&&ids.has(x.b));
    }
    /* Monde lot 15 : les combats d'ouverture restent en fin de carte principale (partition stable). */
    m.card.main=m.card.main.filter(x=>x.ouverture!==true).concat(m.card.main.filter(x=>x.ouverture===true));
  }
  if(Array.isArray(m.pile)){
    for(const a of m.pile){
      if(typeof a.title!=='string'||!a.title) a.title=mgmtAffairTitle(m,a);
      if(a&&a.kind==='leila_bulk'){
        if(!Array.isArray(a.fights)) a.fights=[];
        if(a.marked!==null&&(!Number.isSafeInteger(a.marked)||a.marked<0||a.marked>=Math.max(a.fights.length,1))) a.marked=null;
      }
    }
    /* ==== [ANCRE: LEILA_ANCIENNE_PILE_FERMEE] — Monde lot 14 T1 ==== */
    mgmtFermeChoixLeila(m);
    /* ==== [ANCRE: MONDE_LOT14_T2_REPRISE] — Monde lot 14 T2 ====
       Décision d'Anthony du 17/10/2026 : une sauvegarde ancienne garde une
       affaire leila_bulk ouverte — elle est validée à l'ouverture de la
       partie (mgmtBulkPoser : combats posés aux préliminaires, affaire close
       « validated », fait booked). Plus de proposition à valider au joueur,
       à l'écran comme à la reprise ; les affaires sans combats se ferment
       comme les autres (mgmtFermeChoixLeila ne les touche pas : elles se
       ferment ici, sans fait). ==== */
    for(const a of m.pile){
      if(a&&a.kind==='leila_bulk'&&a.status==='open'&&(!Array.isArray(a.fights)||!a.fights.length)){
        a.status='closed'; a.decision='ignored';
      }
    }
    for(const a of m.pile){
      if(a&&a.kind==='leila_bulk'&&a.status==='open') mgmtBulkPoser(m,a);
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
  if(raw.charAt(0)==='\u0001') raw=mgmtDecompresser(raw);
  if(raw===null) return null;
  try{ const parsed=JSON.parse(raw); const mgr=mgmtPasseDeployer(mgmtMigrate(parsed)); if(mgr&&mgr.orgs&&typeof mgr.orgs==='object'&&!Array.isArray(mgr.orgs)){ for(const id of Object.keys(mgr.orgs)){ if(!mgmtPasseDeployer(mgr.orgs[id])) return null; } }   /* Monde lot 9 T2a : chaque organisation redéploie son archive */
    return mgr&&validateMgmt(mgr)&&mgmtMondeVivantValide(mgr)?mgr:null; }   /* Monde lot 1 T5 : l'archive du passé se redéploie avant la validation */
  catch(e){ return null; }
}

/* ==== [ANCRE: MGMT_BRIEF_LOT1_EMPLACEMENTS] — Brief du 06/10/2026, lot 1 : les
   trois emplacements. L'emplacement 1 garde la clé historique (MGMT_KEY et son
   secours) : aucune donnée n'est déplacée, la partie d'avant le lot y est déjà.
   Les emplacements 2 et 3 ont leur clé et leur secours. saveMgmt, loadMgmt et
   hasMgmt travaillent sur l'emplacement ACTIF. Le format d'une partie ne
   change pas (MGMT_SAVE_VERSION inchangé). Un petit registre, hors de l'état
   de la partie, garde la dernière partie jouée et la date du dernier
   enregistrement de chaque emplacement ; absent ou illisible, il ne fait
   rien planter : la date ne s'affiche pas. ==== */
const MGMT_SLOTS=3;
const MGMT_REGISTRE_KEY=MGMT_KEY+'-registre';
let MGMT_SLOT=1;

function mgmtSlotValide(n){ return Number.isSafeInteger(n)&&n>=1&&n<=MGMT_SLOTS; }
/** La clé d'un emplacement : l'historique pour le 1, la sienne pour les autres. */
function mgmtSlotKey(n){ return n===1?MGMT_KEY:MGMT_KEY+'-'+n; }
function mgmtSlotBackupKey(n){ return mgmtSlotKey(n)+'_backup'; }

/* ==== [ANCRE: SAUVEGARDE_COMPRESSION_LECTURE] — Monde lot 52 T1 ==== */
function mgmtLireSauvegarde(cle){
  const valeur=stockageLire(cle);
  return typeof valeur==='string'&&valeur.charAt(0)==='\u0001'?mgmtDecompresser(valeur):valeur;
}

/** La dernière valeur que saveMgmt a écrite dans cette session : {cle, valeur}. */
let mgmtDerniereEcriture={cle:null,valeur:null};

/** Les morceaux de la partie écrite : leur concaténation est une chaîne JSON de la même partie que mgmtSerialiser (le corps d'abord, puis chaque organisation vivante
 *  à part : ce sont les gros blocs qui ne changent pas d'une sauvegarde à l'autre). Pur. @returns {string[]} */
function mgmtSerialiserMorceaux(m){
  const o=mgmtSerialiserCorps(m), parts=[], orgs=m.orgs&&typeof m.orgs==='object';
  let premier=true;
  for(const k of Object.keys(o)){
    if(k==='orgs'&&orgs){   /* à sa place d'origine : le texte rendu est celui de mgmtSerialiser, à l'octet près */
      parts.push((premier?'{':',')+'"orgs":{'); premier=false;
      Object.keys(m.orgs).forEach((id,i)=>parts.push((i?',':'')+JSON.stringify(id)+':'+JSON.stringify(mgmtSerialiserCorps(m.orgs[id]))));
      parts.push('}');
      continue;
    }
    const v=JSON.stringify(o[k]);
    if(v===undefined) continue;
    parts.push((premier?'{':',')+JSON.stringify(k)+':'+v); premier=false;
  }
  parts.push(premier?'{}':'}');
  return parts;
}
/** La partie telle qu'elle s'écrit sur le disque : compressée, avec les gros blocs inchangés repris du mémo. @returns {string} */
function mgmtSerialiserCompresse(m){ return mgmtCompresserMorceaux(mgmtSerialiserMorceaux(m)); }

/** Le registre : {dernier:1..3|null, dates:{'1':ms,…}}. Toujours une forme saine. */
function mgmtRegistre(){
  const out={dernier:null,dates:{}};
  try{
    const raw=JSON.parse(stockageLire(MGMT_REGISTRE_KEY));
    if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
      if(mgmtSlotValide(raw.dernier)) out.dernier=raw.dernier;
      if(raw.dates&&typeof raw.dates==='object'){
        for(let n=1;n<=MGMT_SLOTS;n++){ const d=raw.dates[n]; if(Number.isSafeInteger(d)&&d>0) out.dates[n]=d; }
      }
    }
  }catch(e){}
  return out;
}
function mgmtRegistreEcrit(reg){ try{ stockageEcrire(MGMT_REGISTRE_KEY,JSON.stringify(reg)); }catch(e){} }

/** La partie d'un emplacement, lue sur le disque sans rien écrire ni réparer
 *  (secours compris) ; l'emplacement actif rend la partie en mémoire. */
function mgmtSlotPeek(n){
  if(!mgmtSlotValide(n)) return null;
  if(n===MGMT_SLOT&&typeof G!=='undefined'&&G&&G.mgmt&&validateMgmt(G.mgmt)) return G.mgmt;
  try{
    for(const key of [mgmtSlotKey(n),mgmtSlotBackupKey(n)]){
      const m=mgmtParseAndValidate(mgmtLireSauvegarde(key));
      if(m) return m;
    }
  }catch(e){}
  return null;
}

/** L'emplacement que « Reprendre » rouvre : le dernier joué s'il est encore
 *  occupé, sinon le premier occupé, sinon null. */
function mgmtSlotDernier(){
  const d=mgmtRegistre().dernier;
  if(d&&mgmtSlotPeek(d)) return d;
  for(let n=1;n<=MGMT_SLOTS;n++){ if(mgmtSlotPeek(n)) return n; }
  return null;
}

/** Efface un emplacement : sa clé, son secours, sa date. Les autres ne bougent pas. */
function mgmtSlotEffacer(n){
  if(!mgmtSlotValide(n)) return false;
  try{ stockageSupprimer(mgmtSlotKey(n)); stockageSupprimer(mgmtSlotBackupKey(n)); }catch(e){}
  const reg=mgmtRegistre();
  delete reg.dates[n];
  if(reg.dernier===n) reg.dernier=null;
  mgmtRegistreEcrit(reg);
  if(n===MGMT_SLOT&&typeof G!=='undefined'&&G) G.mgmt=null;
  return true;
}
/* ==== [FIN ANCRE] ==== */

/** Persiste le bureau : le secours garde la dernière version connue-bonne,
 *  comme SAVE_KEY / SAVE_BACKUP_KEY (state-save.js). */
function saveMgmt(){
  if(!G||!G.mgmt) return false;
  /* Monde lot 1 T3 : un passé en cours de génération ne s'écrit jamais — rien d'une partie à moitié née ne touche l'emplacement. */
  if(G.mgmt.passe&&G.mgmt.passe.enCours===true) return true;
  /* Duo T0 : une organisation vivante ne s'écrit jamais à la place de la partie du joueur (elle s'écrit DANS m.orgs, avec elle). */
  if(G.mgmt.idPrefixe!==undefined) return true;
  try{
    /* Lot 2B T1 bis : les retraites de la soirée ont déjà été appliquées
       quand elle se sauvegarde. Le quota est rétabli dans l'état vivant
       avant sa sérialisation, jamais seulement dans la copie disque. */
    mgmtExteriorEnsure(G.mgmt);
    const cle=mgmtSlotKey(MGMT_SLOT);
     const previous=stockageLire(cle);
     /* Monde lot 52 T1 : ce que cette session vient d'écrire elle-même, relu à l'identique, n'est pas re-décompressé ni re-validé (124 ms sur une partie complète) : la première sauvegarde de la session valide le disque, les suivantes se fient à la trace de la dernière écriture. */
     if((mgmtDerniereEcriture.cle===cle&&mgmtDerniereEcriture.valeur===previous)||mgmtParseAndValidate(previous)) stockageEcrire(mgmtSlotBackupKey(MGMT_SLOT),previous);
     const ecrit=mgmtSerialiserCompresse(G.mgmt);   /* Monde lot 52 T1 : écriture compressée */
     stockageEcrire(cle,ecrit);
     mgmtDerniereEcriture={cle,valeur:ecrit};
    /* Brief lot 1 : la dernière partie jouée et la date de l'enregistrement, hors de la partie. */
    const reg=mgmtRegistre(); reg.dernier=MGMT_SLOT; reg.dates[MGMT_SLOT]=Date.now(); mgmtRegistreEcrit(reg);
    return stockageSignaler(true);
  }catch(e){ return stockageSignaler(false); }   /* brief démo, lot 2 T2 : l'échec se voit, avec « Réessayer » */
}

/** Charge le bureau, secours inclus. @returns {boolean} */
function loadMgmt(){
  try{
    const cle=mgmtSlotKey(MGMT_SLOT), secours=mgmtSlotBackupKey(MGMT_SLOT);
    for(const key of [cle,secours]){
      const candidate=mgmtParseAndValidate(mgmtLireSauvegarde(key));
      if(!candidate) continue;
      G.mgmt=mgmtRepair(candidate);
      if(key===secours){
        try{ stockageEcrire(cle,mgmtSerialiserCompresse(G.mgmt)); }catch(e){}
      }
      return true;
    }
  }catch(e){}
  return false;
}

function hasMgmt(){
  try{
    if(mgmtParseAndValidate(mgmtLireSauvegarde(mgmtSlotKey(MGMT_SLOT)))) return true;
    if(mgmtParseAndValidate(mgmtLireSauvegarde(mgmtSlotBackupKey(MGMT_SLOT)))) return true;
  }catch(e){}
  return false;
}
/* ==== [FIN ANCRE] ==== */
