"use strict";
/* CAGE LEGACY — mgmt-bureau.js
   ============================================================================
   MODE MANAGEMENT — le bureau : roster de Split, cycles et pile d'affaires,
   règle du bureau (trois niveaux de profondeur, CDC §3), mémoire des faits
   (addendum §1), décisions Leïla, identifiants au format strict. Issu du
   découpage de l'ancien mgmt-bureau.js monolithique (dette CLAUDE.md §10) :
   ce fichier garde la pile, les décisions et Leïla — la sous-carte et la
   composition vivent dans mgmt-carte.js, le corps et la soirée dans
   mgmt-corps.js, l'argent dans mgmt-argent.js, le monde extérieur dans
   mgmt-monde.js, la persistance dans mgmt-save.js. Aucun accès DOM :
   le rendu vit dans mgmt-screens.js.

   Constantes évaluées au chargement : toutes littérales (MGMT_KEY,
   MGMT_BACKUP_KEY lit MGMT_KEY du même fichier, MGMT_SAVE_VERSION,
   MGMT_ID_RE, MGMT_RANK_GAP) — aucune dépendance de chargement.
   Dépend au runtime (résolu à l'exécution, jamais au chargement) de
   engine.js (pick/RI, makeName, allDivisions, divById, COUNTRY_KEYS),
   ui-01-roster-matchmaking.js (correlatedRecord), mgmt-data.js et des
   autres fichiers mgmt-*. Chargé après eux dans index.html, avant main.js.

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
/* ==== [ANCRE: MGMT_LOT3_T1_VERSION] — Lot 3 T1 la trace
   (docs/LOT-3-L-ARENE.md §3 T1, constat C3) : v6 ajoute m.hist, la liste
   append-only des combats joués — chaque entrée porte l'instantané d'AVANT
   COMBAT des deux lignes et l'état de la RNG à l'instant du combat, de quoi
   REJOUER le combat à l'identique, jamais le combat lui-même (le déroulé se
   régénère). Migration 5 → 6 sans perte : hist:[], les lignes du roster ne
   changent pas (mgmtMigrate). Rien ne s'efface : la décision de tronquer
   l'historique appartient à l'auteur (même esprit que la QO-9 du 21/09
   pour les faits). Une v1 reste refusée. ==== */
const MGMT_SAVE_VERSION=6;

/** État management vierge. @returns {object} */
function mgmtDefault(){
  /* Lot 2B T1 : le vivier extérieur démarre vide — la cohorte initiale se
     crée à l'ouverture du premier cycle (mgmtExteriorEnsure), chaque ligne
     ne portera que son identité. */
  return {org:MGMT_ORG,v:MGMT_SAVE_VERSION,cycle:0,seq:1,roster:[],pile:[],facts:[],open:null,shortfall:false,
    card:{sizeMain:MGMT_MAIN_SIZE,sizePrelims:MGMT_PRELIM_SIZE,main:[],prelims:[]},leila:{crushes:[]},lastEvent:null,
    hist:[],treasury:MGMT_TREASURY_START,recettes:[],audiences:[],eventsPlayed:0,exterieur:[]};
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

/* ==== [ANCRE: MGMT_LOT2REV_ID_STRICT] — revue lot 1 (L1-R2) : les
   identifiants sont interpolés dans des gestionnaires onclick — traités
   comme du code s'ils contiennent un guillemet. Format interne strict à
   toutes les entrées (génération, sauvegarde, import) : lettres, chiffres,
   tiret et souligné uniquement. Aucun identifiant interne légitime ne sort
   de cet alphabet ('mg'+compteur, fixtures de test incluses). ==== */
const MGMT_ID_RE=/^[A-Za-z0-9_-]{1,64}$/;
function mgmtValidId(id){ return typeof id==='string'&&MGMT_ID_RE.test(id); }

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
  /* Lot 2B T1 bis : la cohorte et les remplaçants complètent le cycle
     courant avant son incrément. Le même état réparé au chargement produit
     ainsi exactement les mêmes lignes qu'une partie continuée. */
  mgmtExteriorEnsure(m);
  m.cycle++;
  mgmtExteriorArrive(m);
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
