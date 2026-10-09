"use strict";
/* ==== [ANCRE: MGMT_BRIEF_DEMO_LOT8_PRISE_EN_MAIN] — Brief démo du 09/10/2026, lot 8 : la première demi-heure.
   T1 l'arrivée (un écran entre « Créer la partie » et la carte), T2 les six moments de Leïla (déclenchés par l'état du jeu, jamais par une minuterie,
   une seule fois chacun, hors des parties), T3 la prochaine chose à faire (la première ligne de « Ce qui empêche la soirée », sans second système),
   T4 le réglage « Accompagnement de Leïla » (Options, onglet Partie). Leïla vouvoie (décision d'Anthony du 09/10/2026). Tous les textes sont des
   propositions de Claude : relu:false, à réécrire par Anthony. La planche de l'arrivée et de la ligne (T5) reste à valider. ==== */

const MGMT_PRISE_TEXTES={
  arrivee:{
    titre:{texte:'Vous êtes le matchmaker de {org}',relu:false},
    leila:{texte:'Je suis Leïla. Je vous aiderai pour les premiers combats.',relu:false},
    bouton:{texte:'Commencer',relu:false},
  },
  moments:{
    carte_vide:{texte:'Bienvenue. Choisissez un combattant, puis son adversaire.',relu:false},
    premier_combat:{texte:'Un premier combat. Il en faut cinq sur la carte principale.',relu:false},
    carte_complete:{texte:'La carte principale est complète. Je prépare les préliminaires.',relu:false},
    prelims:{texte:'Voici mes préliminaires. Validez la carte, ou changez un combat.',relu:false},
    soiree_prete:{texte:'Tout est prêt. Ouvrez le calendrier pour jouer la soirée.',relu:false},
    premier_lendemain:{texte:'Première soirée terminée. Regardez comment le public a réagi.',relu:false},
  },
  prete:{texte:'La soirée est prête.',relu:false},
};
const MGMT_PRISE_CLE='cage-legacy-accompagnement';

/** Les six moments, dans l'ordre, chacun avec la condition de l'état du jeu qui le déclenche. Pur. */
const MGMT_PRISE_MOMENTS=[
  ['carte_vide',(m,ecran)=>(m.eventsPlayed||0)===0&&(m.card.main||[]).length===0&&ecran==='mgmt_carte'],
  ['premier_combat',(m)=>(m.eventsPlayed||0)===0&&(m.card.main||[]).length===1],
  ['carte_complete',(m)=>(m.eventsPlayed||0)===0&&(m.card.main||[]).length>=(m.card.sizeMain||MGMT_MAIN_SIZE)&&!m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')&&(m.card.prelims||[]).length===0],
  ['prelims',(m)=>(m.eventsPlayed||0)===0&&m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')],
  ['soiree_prete',(m)=>(m.eventsPlayed||0)===0&&typeof mgmtAgendaPret==='function'&&mgmtAgendaPret(m)],
  ['premier_lendemain',(m,ecran)=>(m.eventsPlayed||0)===1&&ecran==='mgmt_lendemain'],
];
let MGMT_PRISE={courant:null,vus:null};

function mgmtPriseVus(){
  if(MGMT_PRISE.vus) return MGMT_PRISE.vus;
  let l=[]; try{ const brut=stockageLire(MGMT_PRISE_CLE); const p=brut?JSON.parse(brut):[]; if(Array.isArray(p)) l=p.filter(x=>typeof x==='string'); }catch(e){}
  MGMT_PRISE.vus=new Set(l); return MGMT_PRISE.vus;
}
function mgmtPriseMarquer(id){
  const v=mgmtPriseVus(); v.add(id);
  try{ stockageEcrire(MGMT_PRISE_CLE,JSON.stringify([...v])); }catch(e){}
}
/** L'accompagnement est-il actif ? (Options, onglet Partie ; hors des parties.) */
function mgmtPriseActive(){ return !(typeof MGMT_REGLAGES!=='undefined'&&MGMT_REGLAGES.aide&&MGMT_REGLAGES.aide.accompagnement===false); }

/** Le moment à dire maintenant, ou null : le moment en cours tant que son état tient, puis le suivant non vu. Une fois dit, il ne revient plus. */
function mgmtPriseMoment(m,ecran){
  if(!m||!mgmtPriseActive()||typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)) return null;
  const vus=mgmtPriseVus(), cond=Object.fromEntries(MGMT_PRISE_MOMENTS);
  if(MGMT_PRISE.courant&&cond[MGMT_PRISE.courant](m,ecran)) return MGMT_PRISE.courant;
  if(MGMT_PRISE.courant){ mgmtPriseMarquer(MGMT_PRISE.courant); MGMT_PRISE.courant=null; }
  for(const [id,f] of MGMT_PRISE_MOMENTS){
    if(vus.has(id)) continue;
    if(f(m,ecran)){ MGMT_PRISE.courant=id; return id; }
    /* Un moment dépassé sans avoir été dit (état déjà plus avancé) est considéré comme vu : l'ordre reste celui de la partie. */
  }
  return null;
}

/** La prochaine chose à faire : la première ligne de « Ce qui empêche la soirée », avec son lien ; quand rien ne bloque, la soirée est prête. @returns {{texte:string,onclick:string}|null} */
function mgmtProchaineChose(m){
  if(!m||typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)) return null;
  if(typeof mgmtDemoTerminee==='function'&&mgmtDemoTerminee(m)) return null;
  const b=mgmtAgendaBlocages(m)[0];
  if(b) return {texte:b.texte,onclick:b.onclick};
  return {texte:MGMT_PRISE_TEXTES.prete.texte,onclick:"CL.go('mgmt_calendrier')"};
}

/** Le bloc du bas à droite de tous les écrans de la partie : la parole de Leïla (si un moment est à dire) et la prochaine chose à faire. */
function mfPriseHtml(m,ecran,grise){
  if(!m||!G||G.mgmt!==m) return '';
  const p=grise?null:mgmtProchaineChose(m), id=mgmtPriseMoment(m,ecran);
  const leila=id?`<div class="mf-prise-leila"><b>Leïla</b><span>${esc(MGMT_PRISE_TEXTES.moments[id].texte)}</span></div>`:'';
  const suite=p?`<button type="button" class="mf-prise-suite" onclick="${p.onclick}"><span>Prochaine étape</span><b>${esc(p.texte)}</b></button>`:'';
  /* Une seule ligne à la fois dans le bas de l'écran : la parole de Leïla quand un moment est à dire, sinon la prochaine étape. */
  return (leila||suite)?`<div class="mf-prise">${leila||suite}</div>`:'';
}

/* ---- T1 : l'arrivée --------------------------------------------------------------------------------------------------------------------- */
function scr_mgmt_arrivee(){
  const m=G&&G.mgmt; if(!m) return scr_mgmt_parties();
  const T=MGMT_PRISE_TEXTES.arrivee, org=mgmtOrgNom(m);
  const faits=mgmtOrgApercu({profil:mgmtOrgProfil(m)}).filter(x=>['Caisse de départ','Popularité','Plus grande salle'].includes(x.k));
  let quand='';
  if(typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)&&m.cal.prochaines[0]) quand='Votre première soirée a lieu dans '+Math.max(0,m.cal.prochaines[0].jour-m.cal.jour)+' jours.';
  const corps=`<div class="mf-ld-crit"><div class="mf-fin-ls">${faits.map(x=>`<div>${esc(x.k)} : <b>${esc(x.v)}</b></div>`).join('')}${quand?`<div>${esc(quand)}</div>`:''}</div>`
    +`<div class="mf-prise-leila"><b>Leïla</b><span>${esc(T.leila.texte)}</span></div></div>`;
  return mfEcran(`<main class="mf-contenu"><div class="mf-su-vide">${mfPanneau(`<div class="mf-fin-t">${esc(T.titre.texte.replace('{org}',org).toUpperCase())}</div>${corps}`,'normal','mf-fin-p mf-arrivee')}</div></main>`,
    {barre:'aucune',m:null,plaque:'Management',libelle:'Votre arrivée',touches:[{ks:['Entrée'],t:T.bouton.texte,jaune:true,onclick:"CL.mgmtArriveeFin()"}]});
}
SCREENS.mgmt_arrivee=scr_mgmt_arrivee;
Object.assign(CL,{ mgmtArriveeFin(){ CL.go('mgmt_carte'); } });
keysRegister('mgmt_arrivee',{ Enter(){ CL.mgmtArriveeFin(); }, Escape(){ CL.mgmtArriveeFin(); } });
/* ==== [FIN ANCRE] ==== */
