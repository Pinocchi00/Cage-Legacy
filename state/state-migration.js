"use strict";
/* CAGE LEGACY — state/state-migration.js
   Migration d'une sauvegarde ancienne vers la version courante. */
const SAVE_VERSION=3;
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  g=purgeRemovedModes(g);
  return g; }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MIGRATION_PURGE_MODES_SUPPRIMES] — les modes Faith et Gauntlet
   (avec la boutique associée) ont été retirés du jeu (commit f7f2592) : plus
   aucun code du moteur ni de l'UI ne lit G.faith/G.gauntlet/G.arcade. Une
   sauvegarde écrite avant ce retrait (carrière ou run Faith en cours au
   moment de la mise à jour) peut encore porter ces clés au premier niveau de
   l'état — purge défensive pour ne pas les trimballer indéfiniment dans
   localStorage à chaque save() ni risquer qu'un futur ajout de code les relise
   par erreur. G.f (le combattant) et le Panthéon (HOF_KEY, hors save())
   ne sont jamais concernés : leurs champs historiques (f.gameMode,
   f.faithNemesisId, f.faithTraits...) restent lisibles tels quels. ==== */
function purgeRemovedModes(g){
  if(!g||typeof g!=='object') return g;
  delete g.faith; delete g.gauntlet; delete g.arcade;
  return g;
}
/* ==== [FIN ANCRE] ==== */
