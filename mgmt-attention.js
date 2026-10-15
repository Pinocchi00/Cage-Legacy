"use strict";
/* ==== [ANCRE: MGMT_LOT5_H6_ATTENTION] — Lot 5 H6, contrat §3.2 à §3.4 :
   l'attention du joueur. Quatre outils pour lire un vestiaire de 140 sans
   se noyer — le role en un mot, le cercle et les suivis (choix du joueur,
   seuls états stockés), la connaissance progressive (jamais un pourcentage)
   et le conteur (un budget de trois à cinq informations par semaine).
   Aucun texte n'est écrit ici : les roles et les moments viennent du
   catalogue (MGMT_ROLES, MGMT_MOMENTS), les libellés d'action sont
   fonctionnels. Rien de dérivé n'est stocké. ==== */

const MGMT_CERCLE_MAX=5;
const MGMT_SUIVIS_MAX=15;
/** Informations de la semaine (décision du 22/09, lot 2B §5 e). */
const MGMT_CONTEUR_MIN=3;
const MGMT_CONTEUR_MAX=5;
/** Une semaine dont les informations pèsent plus que ce total est suivie d'une semaine calme. */
const MGMT_CONTEUR_LOURD=120;

/* ---- Le role en un mot (catalogue §9) -------------------------------- */

/** Les combats de Split d'un combattant, du plus récent au plus ancien :
 *  'win' | 'loss' | 'draw'. Lit la trace, rien n'est stocké. */
function mgmtResultats(m,f){
  const out=[];
  for(let i=(m.hist||[]).length-1;i>=0;i--){
    const t=m.hist[i];
    if(!t||!t.a||!t.b) continue;
    const cote=t.a.id===f.id?'A':(t.b.id===f.id?'B':null);
    if(!cote) continue;
    out.push(t.winner==='D'?'draw':(t.winner===cote?'win':'loss'));
  }
  return out;
}

/* ==== [ANCRE: MONDE_LOT1_T6_ROLES] — Monde lot 1 T6 : les cinq rôles qui demandent une mémoire. Ils se lisent sur m.hist et m.facts (le passé de six ans compris), jamais
   stockés. Règles (la fiche docs/lots/MONDE-LOT-1-T6.md §3 les justifie) :
   - Ancien champion : a tenu une ceinture de Split (un règne de la lignée, mgmtCeintureLignee) et ne la porte plus.
   - Remplaçant de luxe : au moins deux faits 'engage' (un combat accepté à court préavis).
   - Bête noire : a battu au moins deux adversaires distincts aujourd'hui mieux classés que lui dans l'organisation.
   - Revenant : son dernier combat date des trois derniers cycles et le précédent d'au moins 11 cycles (plus d'un an : MGMT_EXT_YEAR_WEEKS / MGMT_EVENT_WEEKS).
   - Gatekeeper : plus de 30 ans, a battu et perdu contre des adversaires aujourd'hui classés dans les 15 premiers de l'organisation.
   Priorité : après Champion et En perdition, avant Contender pour l'ancien champion, après lui pour les quatre autres. ==== */
const MGMT_ROLES_REVENANT_ABSENCE=11;
const MGMT_ROLES_REVENANT_RECENT=3;
const MGMT_ROLES_GATEKEEPER_TOP=15;
const MGMT_ROLES_MEMO={m:null,cle:'',data:null};

/** Ce que la mémoire de la partie dit de chacun. Mémo : la clé suit les combats, les faits, le cycle et l'effectif. Pur. @returns {{ancien:Set,engage:Map,vs:Map,rang:Map}} */
function mgmtRolesMemoire(m){
  const cle=[(m.hist||[]).length,(m.facts||[]).length,m.cycle,(m.roster||[]).length].join('|');
  if(MGMT_ROLES_MEMO.m===m&&MGMT_ROLES_MEMO.cle===cle) return MGMT_ROLES_MEMO.data;
  const ancien=new Set(), engage=new Map(), vs=new Map(), rang=new Map();
  for(const d of allDivisions()){
    for(const r of mgmtCeintureLignee(m,d.id).reigns) ancien.add(r.id);
    mgmtDivisionRanking(m,d.id,'organization').forEach((o,i)=>rang.set(o.id,i+1));
  }
  for(const x of m.facts||[]){ if(x&&x.k==='engage'&&typeof x.a==='string') engage.set(x.a,(engage.get(x.a)||0)+1); }
  const donnees=id=>{ let v=vs.get(id); if(!v){ v={battus:[],perdus:[],cycles:[]}; vs.set(id,v); } return v; };
  for(const t of m.hist||[]){
    if(!t||!t.a||!t.b) continue;
    for(const [moi,lui,cote] of [[t.a.id,t.b.id,'A'],[t.b.id,t.a.id,'B']]){
      const v=donnees(moi); v.cycles.push(t.c);
      if(t.winner===cote) v.battus.push(lui); else if(t.winner!=='D') v.perdus.push(lui);
    }
  }
  const data={ancien,engage,vs,rang};
  MGMT_ROLES_MEMO.m=m; MGMT_ROLES_MEMO.cle=cle; MGMT_ROLES_MEMO.data=data;
  return data;
}
/** Le rôle de mémoire d'un combattant, ou null : 'ancien-champion', 'remplacant-de-luxe', 'bete-noire', 'revenant' ou 'gatekeeper', dans cet ordre. Pur. */
function mgmtRoleMemoire(m,f,ordre){
  const M=mgmtRolesMemoire(m), v=M.vs.get(f.id)||{battus:[],perdus:[],cycles:[]};
  const rg=id=>M.rang.get(id)||Infinity, moi=rg(f.id);
  for(const quoi of ordre){
    if(quoi==='ancien-champion'&&M.ancien.has(f.id)) return quoi;
    if(quoi==='remplacant-de-luxe'&&(M.engage.get(f.id)||0)>=2) return quoi;
    if(quoi==='bete-noire'&&new Set(v.battus.filter(id=>rg(id)<moi)).size>=2) return quoi;
    if(quoi==='revenant'&&v.cycles.length>=2){
      const c=v.cycles; if(m.cycle-c[c.length-1]<=MGMT_ROLES_REVENANT_RECENT&&c[c.length-1]-c[c.length-2]>=MGMT_ROLES_REVENANT_ABSENCE) return quoi;
    }
    if(quoi==='gatekeeper'&&f.age>30&&v.battus.some(id=>rg(id)<=MGMT_ROLES_GATEKEEPER_TOP)&&v.perdus.some(id=>rg(id)<=MGMT_ROLES_GATEKEEPER_TOP)) return quoi;
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */

/** Rôle d'un combattant, ou null : le premier critère rempli (MGMT_ROLES,
 *  `criteres`). Les roles qui demandent une mémoire que le jeu ne tient pas
 *  encore (Ancien champion, Gatekeeper, Bête noire, Revenant, Remplaçant de luxe) se lisent
 *  depuis le Monde lot 1 T6 sur m.hist et m.facts (mgmtRoleMemoire). Pur. `classements` : cache optionnel d'un appelant qui
 *  lit beaucoup de rôles à la suite. @returns {{id:string,libelle:string}|null} */
function mgmtRole(m,f,classements){
  if(!m||!f) return null;
  const role=id=>MGMT_ROLES.find(r=>r.id===id)||null;
  const total=f.W+f.L+f.D;
  const titre=mgmtSplitTitle(m,f.div);
  if(titre.id===f.id) return role('champion');
  const res=mgmtResultats(m,f);
  if(res.length>=3&&res.slice(0,3).every(x=>x==='loss')) return role('en-perdition');
  const ancien=mgmtRoleMemoire(m,f,['ancien-champion']);   /* Monde lot 1 T6 */
  if(ancien) return role(ancien);
  /* Lot 5 H8 : le vestiaire passe un cache {div: ids classés} — un classement
     mondial par catégorie, pas un par combattant. */
  let rang;
  if(classements){
    if(!classements[f.div]) classements[f.div]=mgmtDivisionRanking(m,f.div,'world').map(o=>o.id);
    const i=classements[f.div].indexOf(f.id);
    rang=(i>=0&&!mgmtIsRetired(f))?i+1:null;
  }else{
    rang=mgmtDivisionRank(m,f,'world');
  }
  if(rang!==null&&rang<=5) return role('contender');
  const memoire=mgmtRoleMemoire(m,f,['remplacant-de-luxe','bete-noire','revenant','gatekeeper']);   /* Monde lot 1 T6 */
  if(memoire) return role(memoire);
  if(f.L===0&&f.W>=5) return role('invaincu');
  if(f.age<25&&total<6) return role('espoir');
  if(f.age>34||total>30) return role('veteran');
  if(total>15&&Math.abs(f.W-f.L)<=3&&(rang===null||rang>15)) return role('journeyman');
  return null;
}

/* ---- Le cercle et les suivis (§3.2) ---------------------------------- */

function mgmtCercle(m){ return (m&&Array.isArray(m.cercle))?m.cercle:[]; }
function mgmtSuivis(m){ return (m&&Array.isArray(m.suivis))?m.suivis:[]; }

/** Le plus fort lien du joueur avec un combattant : 'cercle', 'suivi' ou null. */
function mgmtLien(m,id){
  if(mgmtCercle(m).includes(id)) return 'cercle';
  if(mgmtSuivis(m).includes(id)) return 'suivi';
  return null;
}

/** Ajoute ou retire un combattant du cercle (5 au plus). Un combattant du
 *  cercle n'est plus un simple suivi. @returns {boolean} vrai si l'état a changé. */
function mgmtCercleToggle(m,id){
  if(!m||!mgmtValidId(id)) return false;
  if(!Array.isArray(m.cercle)) m.cercle=[];
  if(!Array.isArray(m.suivis)) m.suivis=[];
  const i=m.cercle.indexOf(id);
  if(i>=0){ m.cercle.splice(i,1); return true; }
  if(m.cercle.length>=MGMT_CERCLE_MAX) return false;
  m.cercle.push(id);
  m.suivis=m.suivis.filter(x=>x!==id);
  return true;
}

/** Ajoute ou retire un suivi (15 au plus). Refusé pour un membre du cercle. */
function mgmtSuiviToggle(m,id){
  if(!m||!mgmtValidId(id)) return false;
  if(!Array.isArray(m.cercle)) m.cercle=[];
  if(!Array.isArray(m.suivis)) m.suivis=[];
  if(m.cercle.includes(id)) return false;
  const i=m.suivis.indexOf(id);
  if(i>=0){ m.suivis.splice(i,1); return true; }
  if(m.suivis.length>=MGMT_SUIVIS_MAX) return false;
  m.suivis.push(id);
  return true;
}

/* ---- La connaissance progressive (§3.3) ------------------------------ */

/** Ce que le joueur sait d'un combattant : l'a-t-il vu combattre sous Split
 *  (« Comment il combat »), deux fois (« Sa faille »), ses moments relayés
 *  (« Sa vie »). Dérivé de la trace, jamais stocké, jamais un pourcentage.
 *  @returns {{vus:number,combat:boolean,faille:boolean,vie:boolean}} */
function mgmtConnaissance(m,f){
  const vus=mgmtResultats(m,f).length;
  return {vus,combat:vus>=1,faille:vus>=2,vie:mgmtVieRelayes(m,f).length>0};
}

/** « Comment il combat » : la discipline et la garde, lues sur son profil. */
function mgmtCommentIlCombat(f){
  const p=mgmtCombatProfile(f);
  const style=STYLES[p.style];
  return {style:style?style.label:'',garde:p.phys&&p.phys.stance==='southpaw'?'gaucher':'orthodoxe'};
}

/** « Sa faille » : son attribut le plus faible, par son nom du jeu. */
function mgmtSaFaille(f){
  const p=mgmtCombatProfile(f);
  let pire=null;
  for(const [k,v] of Object.entries(p.attrs||{})){
    if(typeof v!=='number'||!Number.isFinite(v)) continue;
    if(pire===null||v<pire[1]) pire=[k,v];
  }
  return pire?attrLabel(pire[0]):'';
}

/* ---- Le conteur (§3.4) ------------------------------------------------ */

/** Les moments de vie de la semaine, du plus attendu au moins attendu :
 *  ton cercle d'abord, puis tes suivis, puis le vestiaire ; à lien égal, le
 *  plus lourd d'abord. Jamais deux informations sur le même combattant.
 *  Seuls les moments relayés se lisent (§6.2), et l'extérieur n'est connu
 *  que pour ceux que le joueur suit. @returns {Array} */
function mgmtConteurCandidats(m,cycle){
  const vus=new Set(), out=[];
  const poser=(f,moment)=>{
    if(vus.has(f.id)||!moment.relais.length||!mgmtVieTexte(moment)) return;   /* 3.3 : un libellé de catalogue ne s'affiche jamais tel quel */
    vus.add(f.id);
    const lien=mgmtLien(m,f.id);
    out.push({id:f.id,name:f.name,div:f.div,moment,lien,
      rang:(lien==='cercle'?2:(lien==='suivi'?1:0))*1000+moment.poids});
  };
  for(const x of m.facts||[]){
    if(!x||x.k!=='moment_vie'||x.c!==cycle) continue;
    const f=mgmtFighterById(m,x.a), moment=mgmtVieMomentById(x.m);
    if(f&&moment&&!mgmtIsRetired(f)) poser(f,moment);
  }
  for(const id of [...mgmtCercle(m),...mgmtSuivis(m)]){
    if(m.roster.some(o=>o.id===id)) continue;
    const ligne=(m.exterieur||[]).find(e=>e.id===id);
    if(!ligne||mgmtExteriorRetired(ligne,cycle)) continue;
    const moment=mgmtVieMomentAt({id:ligne.id,div:ligne.div},cycle);
    const trace=moment?mgmtExteriorTrace(ligne,cycle):null;
    if(moment&&trace) poser({id:ligne.id,name:trace.name,div:ligne.div},moment);
  }
  return out.sort((a,b)=>b.rang-a.rang);
}

/** Le budget de la semaine : cinq informations, trois après une semaine
 *  lourde (le conteur relâche pour que l'histoire se déroule). Pur. */
function mgmtConteurBudget(m){
  if(!m||!Number.isSafeInteger(m.cycle)||m.cycle<1) return MGMT_CONTEUR_MAX;
  const hier=mgmtConteurCandidats(m,m.cycle-1).slice(0,MGMT_CONTEUR_MAX);
  const poids=hier.reduce((n,x)=>n+x.moment.poids,0);
  return poids>=MGMT_CONTEUR_LOURD?MGMT_CONTEUR_MIN:MGMT_CONTEUR_MAX;
}

/** Les informations de moment de la semaine, dans le budget — et jamais le
 *  budget entier : une place reste aux nouvelles structurelles du monde.
 *  Parties neuves seulement (les moments n'existent pas ailleurs). */
function mgmtConteur(m){
  if(!m||m.effectifs!==1) return [];
  const budget=mgmtConteurBudget(m);
  return mgmtConteurCandidats(m,m.cycle).slice(0,Math.max(1,budget-1));
}

/* ---- Continuer qui s'arrête (§3.4) ------------------------------------ */

/** Pourquoi le temps s'arrête : le libellé du bouton le dit. @returns {{libelle:string,raison:string}} */
function mgmtContinuerRaison(m){
  if(mgmtOpenCount(m)>0) return {libelle:'Répondre à Leïla',raison:'affaire'};
  if(typeof mgmtDemandesOuvertes==='function'&&mgmtDemandesOuvertes(m).length>0) return {libelle:'Demande en attente',raison:'demande'};
  if(mgmtMainPosable(m)) return {libelle:'Carte incomplète',raison:'carte'};
  return {libelle:'Cycle suivant',raison:'cycle'};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE_LOT8_T1_MARQUE] — Monde lot 8 T1 (docs/lots/MONDE-LOT-8-T1.md,
   branche monde-lot-8-marques) : la marque jaune à côté du nom d'un combattant
   dans chaque liste — quelque chose lui est arrivé depuis la dernière fois
   que sa fiche a été ouverte. Ouvrir la fiche éteint la marque partout, même
   après un rechargement. Pas de numéro de semaine : un cycle a deux moments
   (avant la soirée, puis après) ; les faits (m.facts) et les combats (m.hist)
   ne font que grandir, leur longueur est une horloge exacte — m.visites garde
   pour chaque combattant [nFaits, nCombats] vus à l'instant de l'ouverture.
   Etat pur ici : aucune fonction ne touche le DOM, le dessin est dans
   mgmt-cadre.js (mfMarqueNom), l'enregistrement dans mgmt-ecran-fiche.js
   (mgmtFicheVue) — un seul morceau de code par titre. ==== */

/** Les faits qui allument la marque : la fiche doit pouvoir expliquer la
 *  marque (T2 lit mgmtEvenementsDepuis). Les faits de titre et les
 *  rivalités sont déjà portés par `demande` ; les actes du joueur
 *  (promesse, refus, contrarie, contrat, recrue, offre, engage, retrait*,
 *  reduite, swapped, ignored), title_initial, libere, fin_contrat et
 *  depart_attente ne sont PAS des événements pour le joueur (décision de
 *  la T1). */
const MGMT_MARQUE_FAITS=['moment_vie','demande','attend','injury','susp','retired',
  /* Monde lot 8 T4a : les cinq événements de coût petit et la demande restée
     sans réponse — des faits datés portant l'identifiant du combattant, ils
     allument la marque comme les autres, sans code neuf ici. */
   'top15','titre_vacant','regne_cap','dernier_combat','carte_camp','sans_reponse',
   'retraite_annoncee','depassement','challenger','vieux_combat'];

/** La seule étiquette fonctionnelle de la marque : aria-label et infobulle. */
const MGMT_MARQUE_LIBELLE={texte:'Du nouveau depuis ta dernière visite',relu:false};

/** [nFaits,nCombats] vus pour un combattant. Absent = [0,0] : rien vu.
 *  @returns {number[]} */
function mgmtVisiteDe(m,id){
  const v=m&&m.visites&&m.visites[id];
  return Array.isArray(v)&&v.length===2?v:[0,0];
}

/** Ce fait compte pour la marque : dans MGMT_MARQUE_FAITS, et pour un
 *  moment de vie seulement s'il se relaie (relais non vide et phrase non
 *  nulle — même règle que le conteur). Une seule copie de la règle,
 *  partagée avec mgmtEvenementsDepuis. Pur. @returns {boolean} */
function mgmtFaitMarque(x){
  if(!x||!MGMT_MARQUE_FAITS.includes(x.k)) return false;
  if(x.k==='moment_vie'){
    const moment=mgmtVieMomentById(x.m);
    if(!moment||!moment.relais.length||!mgmtVieTexte(moment)) return false;
  }
  return true;
}

/** Les événements arrivés à id depuis sa dernière visite, dans l'ordre.
 *  Un fait de moment de vie ne compte que s'il se relaie (même règle que le
 *  conteur : relais non vide et phrase non nulle — mgmtVieMomentById /
 *  mgmtVieTexte). Un combat de préliminaire ne compte pas (slot 'main' seul).
 *  Pur.
 *  @returns {Array<{type:'fait',i:number,fait:object}|{type:'combat',i:number,trace:object}>} */
function mgmtEvenementsDepuis(m,id){
  if(!m||!mgmtValidId(id)) return [];
  const out=[], v=mgmtVisiteDe(m,id);
  const facts=Array.isArray(m.facts)?m.facts:[], hist=Array.isArray(m.hist)?m.hist:[];
  for(let i=Math.min(Math.max(0,v[0]),facts.length);i<facts.length;i++){
    const x=facts[i];
    if(!x||x.a!==id||!mgmtFaitMarque(x)) continue;
    out.push({type:'fait',i,fait:x});
  }
  for(let i=Math.min(Math.max(0,v[1]),hist.length);i<hist.length;i++){
    const t=hist[i];
    if(!t||t.slot!=='main'||!t.a||!t.b) continue;
    if(t.a.id!==id&&t.b.id!==id) continue;
    out.push({type:'combat',i,trace:t});
  }
  return out;
}

/** La marque d'un combattant : quelque chose est arrivé depuis sa dernière
 *  visite. Pur — ne modifie rien, ne dessine rien. @returns {boolean} */
function mgmtMarque(m,id){
  return mgmtEvenementsDepuis(m,id).length>0;
}

/** Tout est « vu » : la table se pose à la longueur courante des faits et des combats.
 *  Tolère l'absence de roster, facts et hist (migrations). */
function mgmtVisitesInit(m){
  if(!m||typeof m!=='object'||Array.isArray(m)) return;
  m.visites={};
  for(const o of Array.isArray(m.roster)?m.roster:[]){
    if(o&&mgmtValidId(o.id)) m.visites[o.id]=[(m.facts||[]).length,(m.hist||[]).length];
  }
}

/** La table des visites est-elle bien formée ? Objet simple (pas un
 *  tableau), identifiants stricts, valeurs paires d'entiers sûrs ≥ 0.
 *  @returns {boolean} */
function mgmtVisitesValide(v){
  if(!v||typeof v!=='object'||Array.isArray(v)) return false;
  for(const k of Object.keys(v)){
    if(!mgmtValidId(k)) return false;
    const p=v[k];
    if(!Array.isArray(p)||p.length!==2) return false;
    for(const n of p){ if(!Number.isSafeInteger(n)||n<0) return false; }
  }
  return true;
}

/** Enregistre ce que le combattant vient de voir : pose la table à la
 *  longueur courante des faits et des combats. Renvoie true seulement si la
 *  valeur a changé (l'appelant décide alors de sauvegarder).
 *  @returns {boolean} */
function mgmtVuEnregistre(m,id){
  if(!mgmtValidId(id)) return false;
  if(!m||typeof m!=='object') return false;
  if(!m.visites||typeof m.visites!=='object'||Array.isArray(m.visites)) m.visites={};
  const v=[Array.isArray(m.facts)?m.facts.length:0,Array.isArray(m.hist)?m.hist.length:0];
  const anc=mgmtVisiteDe(m,id);
  if(anc[0]===v[0]&&anc[1]===v[1]) return false;
  m.visites[id]=v;
  return true;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE_LOT8_T6_BUDGET] — Monde lot 8 T6 (docs/lots/MONDE-LOT-8-T6.md,
   branche monde-lot-8-marques) : le budget de la marque. Lecture (b), décision
   du 10/10/2026 : au plus mgmtMarqueBudget(m) marques allumées en même temps ;
   une marque qui n'a pas eu sa place n'est pas dessinée — rien n'est perdu, son
   événement reste en attente sur la fiche, elle s'allume si une place se
   libère. Décision de la question 2 : le budget est celui du conteur, réutilisé
   tel quel. Décision de la question 3 : une place revient à un combattant hors
   du cercle et des suivis dès qu'il y en a un, le cercle et les suivis gardent
   les autres places (à partir de deux places : à budget 1, la fiche §7 test 4
   veut que le cercle passe avant). Décision de la question 4 : à date égale,
   une blessure, une demande ou un moment de vie passe avant un simple combat.
   mgmtMarque (brut) ne change pas. État pur : aucune fonction ne touche le
   DOM, le dessin reste dans mgmt-cadre.js (mfMarqueNom). Le calcul ne garde
   aucun cache : la liste est recomputée à chaque lecture (le tableau m est
   l'unique vérité). ==== */

/** Le nombre de marques allumées en même temps : celui du conteur, réutilisé.
 *  Pur. Déclaration de fonction (pas const) : les tests la remplacent.
 *  @returns {number} */
function mgmtMarqueBudget(m){
  const b=mgmtConteurBudget(m);
  return Number.isSafeInteger(b)&&b>=0?b:0;
}

/** Les combattants dont la marque est allumée, du premier au dernier, au plus
 *  mgmtMarqueBudget(m). Une seule passe sur m.facts et m.hist — jamais
 *  mgmtEvenementsDepuis par combattant. Pur, sans rnd(), ne modifie rien.
 *  Ordre : le lien (cercle, suivi, les autres), puis l'événement en attente le
 *  plus récent, puis à date égale un fait compté avant un simple combat,
 *  puis le mieux classé de sa catégorie (portée 'organization') — calculé
 *  seulement pour les divisions des candidats à égalité au rang du budget —
 *  puis l'identifiant. Les retraités ne prennent pas de place.
 *  @returns {string[]} */
function mgmtMarquesAllumees(m){
  if(!m||!Array.isArray(m.roster)) return [];
  const vifs=new Map();
  for(const o of m.roster){
    if(o&&mgmtValidId(o.id)&&!mgmtIsRetired(o)) vifs.set(o.id,o);
  }
  /* Le plus récent événement en attente de chaque vivant : [c, sev] — sev vaut
     1 si un fait compté (pas un simple combat) porte ce même c. */
  const frais=new Map();
  const pose=(id,c,nc)=>{
    const cur=frais.get(id);
    const cc=Number.isSafeInteger(c)?c:0;
    if(cur===undefined||cc>cur[0]) frais.set(id,[cc,nc?1:0]);
    else if(cc===cur[0]&&nc&&!cur[1]) cur[1]=1;
  };
  const facts=Array.isArray(m.facts)?m.facts:[], hist=Array.isArray(m.hist)?m.hist:[];
  for(let i=0;i<facts.length;i++){
    const x=facts[i];
    if(x&&mgmtFaitMarque(x)&&i>=mgmtVisiteDe(m,x.a)[0]) pose(x.a,x.c,true);
  }
  for(let i=0;i<hist.length;i++){
    const t=hist[i];
    if(!t||t.slot!=='main'||!t.a||!t.b) continue;
    /* Le combat ne compte que pour qui ne l'a pas encore vu : chacun dans
       sa passe (la même porte que mgmtEvenementsDepuis — la trace est
       partagée, la visite ne l'est pas), fiche §3. */
    if(i>=mgmtVisiteDe(m,t.a.id)[1]) pose(t.a.id,t.c,false);
    if(t.b.id!==t.a.id&&i>=mgmtVisiteDe(m,t.b.id)[1]) pose(t.b.id,t.c,false);
  }
  const B=mgmtMarqueBudget(m);
  if(B<=0||frais.size===0) return [];
  let cands=[];
  for(const [id,ev] of frais){
    const o=vifs.get(id);
    if(o) cands.push({id,div:o.div,lien:mgmtLien(m,id),c:ev[0],sev:ev[1],ind:9999});
  }
  if(!cands.length) return [];
  /* Tri initial sur le lien, la date, la gravité et l'identifiant : total sans
     le classement. Tous les ind valent encore 9999 — le critère est neutre. */
  const cmp=(a,b)=>{
    const pic={cercle:2,suivi:1};
    const la=pic[a.lien]||0, lb=pic[b.lien]||0;
    if(la!==lb) return lb-la;
    if(a.c!==b.c) return b.c-a.c;
    if(a.sev!==b.sev) return b.sev-a.sev;
    if(a.ind!==b.ind) return a.ind-b.ind;
    return a.id<b.id?-1:(a.id>b.id?1:0);
  };
  cands.sort(cmp);
  if(B<cands.length){
    /* Le groupe d'égalité au rang B : même lien, même c, même gravité que le
       B-ème — le classement est lu une seule fois par division de ce groupe,
       jamais ailleurs. Les candidats d'un même (lien, c, sev) sont contigus
       dans cands : le bloc se remplace en place. */
    const ref=cands[B-1], grp=[];
    for(const x of cands){
      if(x.lien===ref.lien&&x.c===ref.c&&x.sev===ref.sev) grp.push(x);
    }
    const parDiv=new Map();
    for(const x of grp){
      if(!parDiv.has(x.div)) parDiv.set(x.div,mgmtDivisionRanking(m,x.div,'organization').map(o=>o.id));
      const i=parDiv.get(x.div).indexOf(x.id);
      x.ind=i>=0?i:9999;
    }
    grp.sort(cmp);
    /* Les candidats d'un même (lien, c, sev) sont contigus dans cands AVANT le
       retri du groupe : le bloc à remplacer commence au premier membre et fait
       exactement grp.length candidats. */
    const deb=cands.findIndex(x=>x.lien===ref.lien&&x.c===ref.c&&x.sev===ref.sev);
    cands=cands.slice(0,deb).concat(grp,cands.slice(deb+grp.length));
  }
  let sel=cands.slice(0,B);
  /* Une place réservée dès qu'un combattant hors du cercle et des suivis est
     en attente (décision de la question 3) : si les « liés » ont pris tout le
     budget, le dernier d'entre eux rend sa place au premier des autres. */
  if(B>=2&&sel.length&&sel.every(x=>!!x.lien)){
    const autre=cands.find(x=>!x.lien);
    if(autre){ sel.pop(); sel.push(autre); sel.sort(cmp); }
  }
  return sel.map(x=>x.id);
}

/** La marque allumée d'un combattant : « sa » marque est allumée — au plus
 *  mgmtMarqueBudget(m) en même temps. La marque n'est pas l'événement : un
 *  combattant éteint garde son événement lisible sur la fiche.
 *  @returns {boolean} */
function mgmtMarqueAllumee(m,id){
  return mgmtMarquesAllumees(m).includes(id);
}
/* ==== [FIN ANCRE] ==== */
