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

/** Rôle d'un combattant, ou null : le premier critère rempli (MGMT_ROLES,
 *  `criteres`). Les roles qui demandent une mémoire que le jeu ne tient pas
 *  encore (Ancien champion, Gatekeeper, Bête noire, Revenant, Remplaçant de luxe) ne sont
 *  pas attribués. Pur. @returns {{id:string,libelle:string}|null} */
function mgmtRole(m,f){
  if(!m||!f) return null;
  const role=id=>MGMT_ROLES.find(r=>r.id===id)||null;
  const total=f.W+f.L+f.D;
  const titre=mgmtSplitTitle(m,f.div);
  if(titre.id===f.id) return role('champion');
  const res=mgmtResultats(m,f);
  if(res.length>=3&&res.slice(0,3).every(x=>x==='loss')) return role('en-perdition');
  const rang=mgmtDivisionRank(m,f,'world');
  if(rang!==null&&rang<=5) return role('contender');
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
    if(vus.has(f.id)||!moment.relais.length) return;
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
