"use strict";
/* ==== [ANCRE: STOCKAGE_PORTE_UNIQUE] — Brief démo du 09/10/2026, lot 2 T1 : une seule porte pour le stockage.
   Tout appel à localStorage du jeu passe par ces trois fonctions (un test d'outillage le vérifie). Le comportement ne change pas : un échec du
   navigateur remonte à l'appelant, comme avant. Dans la version PC (lot 3), le moteur de fichiers se branche ici sans toucher au reste :
   window.cageStockagePC = {lire(cle), ecrire(cle,valeur), supprimer(cle)}, synchrone, un fichier par clé, écriture temporaire puis renommage. ==== */

/** Le moteur de la version PC, s'il existe. */
function stockageMoteurPC(){
  return (typeof window!=='undefined'&&window.cageStockagePC&&typeof window.cageStockagePC.lire==='function')?window.cageStockagePC:null;
}
/** Lit une clé. @returns {string|null} */
function stockageLire(cle){
  const pc=stockageMoteurPC();
  return pc?pc.lire(cle):localStorage.getItem(cle);
}
/** Écrit une clé ; l'échec du support remonte. */
function stockageEcrire(cle,valeur){
  const pc=stockageMoteurPC();
  if(pc) return pc.ecrire(cle,valeur);
  localStorage.setItem(cle,valeur);
}
/** Supprime une clé. */
function stockageSupprimer(cle){
  const pc=stockageMoteurPC();
  if(pc) return pc.supprimer(cle);
  localStorage.removeItem(cle);
}

/* ---- Lot 2 T2 : les échecs se voient. ---------------------------------------------------------------------------------------------------- */
const STOCKAGE_TEXTES={
  echec:{texte:'La sauvegarde a échoué. Votre partie n’est pas enregistrée.',relu:false},
  reessayer:{texte:'Réessayer',relu:false},
};
let STOCKAGE_ECHEC=false;
/** Signale le résultat d'une sauvegarde : un échec s'affiche avec « Réessayer », un succès l'efface. @returns {boolean} le résultat reçu */
function stockageSignaler(ok){
  STOCKAGE_ECHEC=!ok;
  stockageAfficherAlerte();
  return ok;
}
/** Pose ou retire l'alerte, hors de la partie et de tout écran. */
function stockageAfficherAlerte(){
  try{
    if(typeof document==='undefined'||!document.body) return;
    let el=document.getElementById('stockage-alerte');
    if(!STOCKAGE_ECHEC){ if(el) el.remove(); return; }
    if(!el){ el=document.createElement('div'); el.id='stockage-alerte'; el.setAttribute('role','alert'); document.body.appendChild(el); }
    el.innerHTML='<span>'+STOCKAGE_TEXTES.echec.texte+'</span><button type="button" onclick="stockageReessayer()">'+STOCKAGE_TEXTES.reessayer.texte+'</button>';
  }catch(e){}
}
/** « Réessayer » : la partie en cours est écrite de nouveau. */
function stockageReessayer(){
  if(typeof G!=='undefined'&&G&&G.mgmt&&typeof saveMgmt==='function') saveMgmt();
  else if(typeof G!=='undefined'&&G&&typeof save==='function') save();
}
/* ==== [FIN ANCRE] ==== */
