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

/** État management vierge. @returns {object} */
function mgmtDefault(){
  return {org:MGMT_ORG,cycle:0,seq:1,roster:[],pile:[],facts:[],open:null};
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
 */
function mgmtNewRoster(m){
  const n=RI(MGMT_ROSTER_MIN,MGMT_ROSTER_MAX);
  m.roster=[];
  const divs=allDivisions();
  for(let i=0;i<n;i++){
    const div=pick(divs);
    let nm=makeName(div.gender,pick(COUNTRY_KEYS)), guard=0;
    while((MGMT_EXCLUDED_FIRST.includes(nm.first)||MGMT_EXCLUDED_LAST.includes(nm.last))&&guard<50){
      nm=makeName(div.gender,pick(COUNTRY_KEYS)); guard++;
    }
    const rec=correlatedRecord(RI(40,80),RI(8,30));
    m.roster.push({
      id:mgmtNextId(m),
      name:nm.name,first:nm.first,last:nm.last,
      W:rec.W,L:rec.L,D:RI(0,2),
      age:RI(22,35),
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

/** Tire deux combattants distincts, de préférence de la même catégorie. */
function mgmtPickPair(m){
  const r=m.roster;
  if(!Array.isArray(r)||r.length<2) return null;
  const divId=pick(allDivisions()).id;
  const same=r.filter(o=>o.div===divId);
  const pool=same.length>=2?same:r;
  const a=pick(pool);
  let b=pick(pool), guard=0;
  while(b===a&&guard<20){ b=pick(pool); guard++; }
  if(b===a) return null;
  return [a,b];
}

/**
 * Titre d'une affaire : dit qui parle et de quoi (jamais un libellé de type
 * répété). Calculé à la création, recalculable par mgmtRepair pour les
 * sauvegardes antérieures aux titres.
 */
function mgmtAffairTitle(m,a){
  const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
  const vs=(fa&&fb)?`${fa.name} contre ${fb.name}`:'un combat';
  if(a.kind==='leila_react') return `Leïla réagit — ${vs}`;
  return `Leïla propose — ${vs}`;
}

/**
 * Ouvre un nouveau cycle : 8 à 15 affaires (CDC §4.1, §9). En Lot 1, toutes
 * les affaires sont des propositions de combat portées par Leïla, la seule
 * voix branchée. Un combat A contre B et son inverse sont le même combat :
 * les paires déjà proposées dans la pile sont exclues, dans les deux ordres.
 * La première affaire est sélectionnée d'office : le bureau ne s'ouvre
 * jamais vide.
 */
function mgmtNewPile(m){
  if(!Array.isArray(m.roster)||m.roster.length<2) mgmtNewRoster(m);
  m.cycle++;
  m.pile=[];
  m.open=null;
  const n=RI(MGMT_PILE_MIN,MGMT_PILE_MAX);
  const seen=new Set();
  let guard=0;
  while(m.pile.length<n&&guard<n*60){
    guard++;
    const pair=mgmtPickPair(m);
    if(!pair) break;
    const key=[pair[0].id,pair[1].id].sort().join('|');
    if(seen.has(key)) continue;
    seen.add(key);
    const aff={
      id:mgmtNextId(m),kind:'leila_propose',exchange:'leila_propose',
      speaker:'leila',a:pair[0].id,b:pair[1].id,
      status:'open',decision:null,
    };
    aff.title=mgmtAffairTitle(m,aff);
    m.pile.push(aff);
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
 * Joue la réponse choisie sur une affaire ouverte. Accepter book le combat
 * (les deux combattants passent en dossier) ; refuser clôt et fait naître
 * l'affaire de réaction de Leïla (second type d'affaire du Lot 1) ; clore
 * acte la réaction. Chaque issue est mémorisée comme fait.
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
  const a=mgmtFighterById(m,aff.a), b=mgmtFighterById(m,aff.b);
  if(rep.action==='accept'){
    mgmtPromote(m,a); mgmtPromote(m,b);
    aff.status='closed'; aff.decision='accepted';
    mgmtAddFact(m,{c:m.cycle,k:'booked',a:aff.a,b:aff.b});
  }else if(rep.action==='refuse'){
    aff.status='closed'; aff.decision='refused';
    mgmtAddFact(m,{c:m.cycle,k:'refused',a:aff.a,b:aff.b});
    const react={
      id:mgmtNextId(m),kind:'leila_react',exchange:'leila_refused',
      speaker:'leila',a:aff.a,b:aff.b,
      status:'open',decision:null,after:aff.id,
    };
    react.title=mgmtAffairTitle(m,react);
    m.pile.push(react);
  }else if(rep.action==='close'){
    aff.status='closed'; aff.decision='noted';
    mgmtAddFact(m,{c:m.cycle,k:'reaction_seen',a:aff.a,b:aff.b});
  }else{
    return false;
  }
  if(m.open===affairId) m.open=null;
  return true;
}

/**
 * Ignorer est une décision (CDC §4.1) : l'affaire se clôt, le fait est
 * mémorisé, elle ne revient jamais (addendum §9) — donc sans affaire de
 * réaction, contrairement au refus.
 * @returns {boolean} vrai si l'affaire a été ignorée.
 */
function mgmtIgnore(m,affairId){
  if(!m||!Array.isArray(m.pile)) return false;
  const aff=m.pile.find(a=>a.id===affairId);
  if(!aff||aff.status!=='open') return false;
  aff.status='closed'; aff.decision='ignored';
  mgmtAddFact(m,{c:m.cycle,k:'ignored',a:aff.a,b:aff.b});
  if(m.open===affairId) m.open=null;
  return true;
}

/* --------------------------- persistance -------------------------------- */
function mgmtValidLine(o){
  if(!o||typeof o!=='object'||Array.isArray(o)) return false;
  if(typeof o.id!=='string'||!o.id) return false;
  if(typeof o.name!=='string'||!o.name) return false;
  for(const k of ['W','L','D']){ if(!Number.isSafeInteger(o[k])||o[k]<0) return false; }
  if(typeof o.age!=='number'||!Number.isFinite(o.age)||o.age<0||o.age>100) return false;
  if(typeof o.div!=='string'||!divById(o.div)) return false;
  if(typeof o.divName!=='string') return false;
  if(o.org!==MGMT_ORG) return false;
  if(o.level!==1&&o.level!==2&&o.level!==3) return false;
  if(o.raison!==null&&!MGMT_RAISONS.some(r=>r.id===o.raison)) return false;
  if(!Number.isSafeInteger(o.interactions)||o.interactions<0) return false;
  return true;
}

function mgmtValidAffair(a){
  if(!a||typeof a!=='object'||Array.isArray(a)) return false;
  if(typeof a.id!=='string'||!a.id) return false;
  if(a.kind!=='leila_propose'&&a.kind!=='leila_react') return false;
  if(!MGMT_EXCHANGES[a.exchange]) return false;
  if(a.speaker!=='leila') return false;
  if(typeof a.a!=='string'||typeof a.b!=='string') return false;
  if(a.status!=='open'&&a.status!=='closed') return false;
  if(a.title!==undefined&&(typeof a.title!=='string'||!a.title)) return false;
  return true;
}

/** Validation structurelle d'une sauvegarde du bureau, en lecture seule. */
function validateMgmt(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return false;
  if(raw.org!==MGMT_ORG) return false;
  if(!Number.isSafeInteger(raw.cycle)||raw.cycle<0) return false;
  if(!Number.isSafeInteger(raw.seq)||raw.seq<1) return false;
  if(!Array.isArray(raw.roster)||!Array.isArray(raw.pile)||!Array.isArray(raw.facts)) return false;
  if(raw.open!==null&&typeof raw.open!=='string') return false;
  for(const o of raw.roster){ if(!mgmtValidLine(o)) return false; }
  for(const a of raw.pile){ if(!mgmtValidAffair(a)) return false; }
  for(const f of raw.facts){ if(!f||typeof f!=='object') return false; }
  return true;
}

/** Réparation tolérante d'un état chargé valide : faits plafonnés, titres
 *  recalculés quand ils manquent (sauvegardes antérieures), affaire ouverte
 *  recadrée — ou première affaire ouverte sélectionnée d'office quand aucune
 *  ne l'est, pour que le bureau ne s'ouvre jamais vide. */
function mgmtRepair(m){
  if(!m||typeof m!=='object') return null;
  if(!Array.isArray(m.facts)) m.facts=[];
  while(m.facts.length>MGMT_FACTS_MAX) m.facts.shift();
  if(Array.isArray(m.pile)){
    for(const a of m.pile){
      if(typeof a.title!=='string'||!a.title) a.title=mgmtAffairTitle(m,a);
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
  try{ const parsed=JSON.parse(raw); return validateMgmt(parsed)?parsed:null; }
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
