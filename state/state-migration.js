"use strict";
/* CAGE LEGACY — state/state-migration.js
   Migration d'une sauvegarde ancienne vers la version courante. */
const SAVE_VERSION=3;
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  return g; }
/* ==== [FIN ANCRE] ==== */
