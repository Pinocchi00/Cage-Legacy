"use strict";
/* CAGE LEGACY — ui-11-keys.js
   ============================================================================
   LOT 1e-7 — navigation clavier globale, conçue pour tous les écrans, pas
   câblée sur un seul. Un unique écouteur `keydown` route la touche vers la
   carte de l'écran courant (G.screen) : chaque écran enregistre sa carte via
   keysRegister(), jamais de branchement par écran ici.

   Contrat : le clavier accélère, il n'est jamais exclusif — toute action au
   clavier existe aussi à la souris. Une touche n'est consommée que si la
   carte courante la définit (preventDefault ciblé) ; saisie en cours
   (input/textarea/contenu éditable) et modificateurs (ctrl/meta/alt) ne sont
   jamais interceptés.
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT1E_CLAVIER] — Lot 1e-7 : système clavier réutilisable
   (registre par écran + dispatcher unique). ==== */
const KEYS={maps:{}};

/** Enregistre la carte clavier d'un écran : {touche: action}. */
function keysRegister(screen,map){
  if(typeof screen==='string'&&map&&typeof map==='object') KEYS.maps[screen]=map;
}

function keysUnregister(screen){ delete KEYS.maps[screen]; }

/**
 * Route un événement clavier vers la carte de l'écran courant.
 * @param {object} e événement keydown (ou sosie en test)
 * @returns {boolean} vrai si une action a été jouée.
 */
function keysHandle(e){
  if(!e||e.defaultPrevented) return false;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return false;
  if(e.ctrlKey||e.metaKey||e.altKey) return false;
  const map=(typeof G!=='undefined'&&G&&G.screen)?KEYS.maps[G.screen]:null;
  if(!map) return false;
  const fn=map[e.key];
  if(typeof fn!=='function') return false;
  if(typeof e.preventDefault==='function') e.preventDefault();
  fn();
  return true;
}

if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('keydown',keysHandle);
}
/* ==== [FIN ANCRE] ==== */
