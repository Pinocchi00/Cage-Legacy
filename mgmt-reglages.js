"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT12_REGLAGES] — Brief du 06/10/2026, lot 12 : les réglages du joueur (planches « Options »).
   Logique sans DOM, gardée À PART des parties : une clé à elle (`cage-legacy-reglages`), valable pour les trois emplacements et
   pour le menu avant toute partie. Trois groupes :
   - COMBAT (6) : vitesse au départ, caméra au départ, commentaire, paroles des coins, nom des coups, secousses — lus par l'écran du combat
     (MGMT_COMBAT_REGLAGES, lot 11) ; les masquer retire l'élément de l'image sans toucher au combat ;
   - AFFICHAGE (3) : plein écran, taille de l'image (1280 × 720, 1920 × 1080, 2560 × 1440 : la résolution à laquelle le combat est dessiné et,
     dans une fenêtre d'application, la taille de la fenêtre), images par seconde (30 ou 60 : le combat n'est redessiné que si le temps est venu) ;
   - SON (5) : volume général, musique, salle, coups (de 0 à 10) et le son coupé quand le jeu n'est plus au premier plan (mgmt-son.js).
   Une valeur illisible ou hors liste revient à son origine : un réglage ne casse jamais le jeu. R remet les réglages d'origine d'un onglet. ==== */

const MGMT_REGLAGES_CLE='cage-legacy-reglages';
const MGMT_REGLAGES_VERSION=1;
/** Les réglages d'origine. */
const MGMT_REGLAGES_ORIGINE={
  combat:{vitesse:1,camera:'cable',commentaire:true,coins:true,noms:true,secousses:true},
  affichage:{plein:false,taille:1920,fps:60,mouvement:true},
  son:{general:8,musique:6,salle:8,coups:7,silence:true},
};
/** Ce que chaque réglage accepte : une liste de valeurs, ou un entier de 0 à 10. */
const MGMT_REGLAGES_VALEURS={
  combat:{vitesse:[1,2,4],camera:['cable','plafond','large'],commentaire:[true,false],coins:[true,false],noms:[true,false],secousses:[true,false]},
  affichage:{plein:[true,false],taille:[1280,1920,2560],fps:[30,60],mouvement:[true,false]},
  son:{general:'niveau',musique:'niveau',salle:'niveau',coups:'niveau',silence:[true,false]},
};
const MGMT_REGLAGES_ONGLETS=['combat','affichage','son'];

function mgmtReglagesCopie(o){ return JSON.parse(JSON.stringify(o)); }
/** Valide un bloc lu (stockage, import) : chaque clé garde sa valeur si elle est permise, sinon son origine. Pur. */
function mgmtReglagesValide(raw){
  const out=mgmtReglagesCopie(MGMT_REGLAGES_ORIGINE);
  if(!raw||typeof raw!=='object') return out;
  for(const g of MGMT_REGLAGES_ONGLETS){
    const src=raw[g]; if(!src||typeof src!=='object') continue;
    for(const k of Object.keys(out[g])){
      const permis=MGMT_REGLAGES_VALEURS[g][k], v=src[k];
      if(permis==='niveau'){ if(Number.isInteger(v)&&v>=0&&v<=10) out[g][k]=v; }
      else if(permis.includes(v)) out[g][k]=v;
    }
  }
  return out;
}
let MGMT_REGLAGES=mgmtReglagesValide(null);

function mgmtReglagesLire(){
  try{
    const t=localStorage.getItem(MGMT_REGLAGES_CLE);
    if(t){ const j=JSON.parse(t); MGMT_REGLAGES=mgmtReglagesValide(j&&j.reglages); return MGMT_REGLAGES; }
  }catch(e){}
  MGMT_REGLAGES=mgmtReglagesValide(null);
  return MGMT_REGLAGES;
}
function mgmtReglagesSauver(){
  try{ localStorage.setItem(MGMT_REGLAGES_CLE,JSON.stringify({v:MGMT_REGLAGES_VERSION,reglages:MGMT_REGLAGES})); return true; }catch(e){ return false; }
}
/** Pose un réglage (valeur permise seulement), l'applique et le garde. @returns {boolean} */
function mgmtReglagesChanger(g,k,v){
  const permis=MGMT_REGLAGES_VALEURS[g]&&MGMT_REGLAGES_VALEURS[g][k];
  if(!permis) return false;
  if(permis==='niveau'){ if(!(Number.isInteger(v)&&v>=0&&v<=10)) return false; }
  else if(!permis.includes(v)) return false;
  MGMT_REGLAGES[g][k]=v;
  mgmtReglagesAppliquer(g);
  mgmtReglagesSauver();
  return true;
}
/** Remet les réglages d'origine d'un onglet. */
function mgmtReglagesRaz(g){
  if(!MGMT_REGLAGES_ORIGINE[g]) return false;
  MGMT_REGLAGES[g]=mgmtReglagesCopie(MGMT_REGLAGES_ORIGINE[g]);
  mgmtReglagesAppliquer(g);
  mgmtReglagesSauver();
  return true;
}
/** La valeur suivante (ou précédente) d'un réglage, sans bouclage pour un niveau. */
function mgmtReglagesPas(g,k,delta){
  const permis=MGMT_REGLAGES_VALEURS[g][k], v=MGMT_REGLAGES[g][k];
  if(permis==='niveau') return Math.max(0,Math.min(10,v+(delta<0?-1:1)));
  const i=permis.indexOf(v);
  return permis[Math.max(0,Math.min(permis.length-1,i+(delta<0?-1:1)))];
}

/** Le temps minimal entre deux images du combat, en millisecondes (30 ou 60 images par seconde). */
function mgmtReglagesPasImage(){ return MGMT_REGLAGES.affichage.fps===30?1000/30-2:1000/60-2; }

/** Applique un groupe (ou tout) : le combat lit ses réglages, l'écran passe en plein écran, le son se règle. */
function mgmtReglagesAppliquer(g){
  const tout=!g;
  if(tout||g==='combat'&&typeof MGMT_COMBAT_REGLAGES!=='undefined') Object.assign(MGMT_COMBAT_REGLAGES,MGMT_REGLAGES.combat);
  if(tout||g==='affichage'){
    try{
      if(typeof document!=='undefined'&&document.documentElement){
        const plein=!!document.fullscreenElement;
        if(MGMT_REGLAGES.affichage.plein&&!plein&&document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
        else if(!MGMT_REGLAGES.affichage.plein&&plein&&document.exitFullscreen) document.exitFullscreen().catch(()=>{});
      }
      const t=MGMT_REGLAGES.affichage.taille;
      if(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches&&window.resizeTo&&!MGMT_REGLAGES.affichage.plein) window.resizeTo(t,Math.round(t*9/16)+80);
    }catch(e){}
  }
  if((tout||g==='son')&&typeof mgmtSonAppliquer==='function') mgmtSonAppliquer();
}
/** Le plein écran change (touche du navigateur, Échap) : le réglage suit ce que le navigateur a fait. */
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('fullscreenchange',()=>{
    const plein=!!document.fullscreenElement;
    if(MGMT_REGLAGES.affichage.plein!==plein){ MGMT_REGLAGES.affichage.plein=plein; mgmtReglagesSauver(); if(typeof G!=='undefined'&&G&&G.screen==='mgmt_options') render(); }
  });
}
mgmtReglagesLire();
mgmtReglagesAppliquer('combat');
/* ==== [FIN ANCRE] ==== */
