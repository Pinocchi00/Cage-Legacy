"use strict";
/* CAGE LEGACY — state/state-migration.js
   Migration d'une sauvegarde ancienne vers la version courante. */
const SAVE_VERSION=3;
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  /* ==== [ANCRE: FAITH_CINQ_TEMPS] — l'année Faith est passée de 3 à 5 temps.
     Une partie sauvegardée sous l'ancienne numérotation se retrouverait au
     mauvais moment de l'année : step 3 valait « combat », il vaut désormais
     « le monde ». Correspondance par intention, pas par arithmétique —
     l'ancien 3 devient 4 (l'octogone), pas 5 (le bilan), sans quoi le joueur
     sauterait le combat qu'il s'apprêtait à disputer. Le drapeau
     stepScale5 rend la migration idempotente. ==== */
  if(g.faith && !g.faith.stepScale5){
    const ancien=g.faith.step||1;
    g.faith.step=(ancien>=3)?4:ancien;
    g.faith.stepScale5=true;
  }
  return g; }
/* ==== [FIN ANCRE] ==== */
