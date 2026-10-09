"use strict";
/* ==== [ANCRE: MGMT_BRIEF_DEMO_LOT10_PERIMETRE] — Brief démo du 09/10/2026, lot 10 : le périmètre de la démo (T2 l'accueil, T3 les organisations
   verrouillées, T4 la fin). Tout est derrière CL_DEMO (demo-config.js) ; sans l'interrupteur, rien ne change. Le texte de l'écran de fin est une
   proposition de Claude : relu:false, à réécrire par Anthony. ==== */

const MGMT_DEMO_FIN={
  titre:{texte:'Fin de la démo',relu:false},
  corps:{texte:'Vous avez monté cinq soirées. Le jeu complet vous attend : ajoutez Cage Legacy à votre liste de souhaits sur Steam.',relu:false},
};
let MGMT_DEMO_FIN_VUE=false;

/** La démo est active. */
const mgmtDemoActive=()=>typeof CL_DEMO!=='undefined'&&CL_DEMO===true;
/** Les cinq soirées de la démo sont jouées. Pur. */
function mgmtDemoTerminee(m){
  return mgmtDemoActive()&&!!m&&Number.isSafeInteger(m.eventsPlayed)&&m.eventsPlayed>=CL_DEMO_SOIREES;
}
/** Après le lendemain de la dernière soirée permise, l'écran de fin passe, une seule fois. @returns {boolean} vrai si l'écran de fin a pris la main. */
function mgmtDemoApresSoiree(){
  if(!mgmtDemoTerminee(G&&G.mgmt)||MGMT_DEMO_FIN_VUE) return false;
  MGMT_DEMO_FIN_VUE=true;
  CL.go('mgmt_demo_fin');
  return true;
}

function scr_mgmt_demo_fin(){
  const m=G&&G.mgmt, F=MGMT_DEMO_FIN;
  return mfEcran(`<main class="mf-contenu"><div class="mf-su-vide">${mfPanneau(`<div class="mf-fin-t">${esc(F.titre.texte.toUpperCase())}</div><div class="mf-ld-crit"><div>${esc(F.corps.texte)}</div></div>`,'normal','mf-fin-p mf-demo-fin')}</div></main>`,
    {barre:'jeu',m,plaque:'Démo',libelle:'',touches:[{ks:['Entrée'],t:'Revoir ma partie',jaune:true,onclick:"CL.go('mgmt_carte')"},{ks:['Échap'],t:'Menu principal',onclick:'CL.mgmtMenuPrincipal()'}]});
}
SCREENS.mgmt_demo_fin=scr_mgmt_demo_fin;
keysRegister('mgmt_demo_fin',{
  Enter(){ CL.go('mgmt_carte'); },
  Escape(){ CL.mgmtMenuPrincipal(); },
});
/* ==== [FIN ANCRE] ==== */
