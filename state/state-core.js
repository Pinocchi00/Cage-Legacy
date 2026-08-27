"use strict";
/* CAGE LEGACY — state/state-core.js
   État global G et helpers partagés par tout le reste de state/*.js.
   Dépend de engine.js (epithets, appelé par enshrine, state-hof.js).
   legacyTitle (dans ui-07.js, appelé par enshrine) n'est résolu qu'à
   l'exécution : ui-*.js doit être chargé avant toute partie jouée, jamais
   avant l'exécution des fichiers state/*.js eux-mêmes.

   Couche jouable v3 (sur moteur v2 : engine2.js concaténé) : lisible mobile,
   thème sombre/clair, 3 adversaires + %estimé, camp = 3 choix liés au sport
   avec deltas visibles et bornés, orgs, fiche /20, stats de combat, 5
   derniers combats, surnom gagné, épithètes de fin. */
/** @type {GameState} */
let G=null;
const esc=s=>(''+s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function setTheme(t){ G.theme=t; try{ if(document.documentElement)document.documentElement.setAttribute('data-theme',t); }catch(e){} }
