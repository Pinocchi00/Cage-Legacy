"use strict";
/* CAGE LEGACY — state/state-migration.js
   Migration d'une sauvegarde ancienne vers la version courante. */
const SAVE_VERSION=4;
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  g=purgeRemovedModes(g);
  g=migrateDoubleChampion(g);
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
/* ==== [ANCRE: SUPPRESSION_DOUBLE_CHAMPION] — P2 : le statut permanent de
   double champion (f.champChampBelt/BeltDivId/Defenses) est retiré du jeu.
   Une sauvegarde écrite avant ce retrait peut encore porter ces champs sur
   f — ils disparaissent ici (pas juste neutralisés) pour ne pas être
   trimballés indéfiniment. f.champion/f.div/f.divName/f.defenses reflètent
   déjà, sans aucune correction nécessaire, la SEULE ceinture réellement
   détenue au moment de la sauvegarde (chooseChampChampFocus, avant son
   retrait, les maintenait déjà à jour pour la ceinture "active" — voir
   git history) : le combattant devient donc un champion simple sans perte
   de progression. Le bonus d'héritage que donnait champChampBelt au score
   de Légende (+150, hofScore) est préservé sous sa nouvelle forme
   (champChampGloryBonus) pour ne pas pénaliser une carrière qui avait déjà
   conquis une 2e ceinture avant la migration. ==== */
function migrateDoubleChampion(g){
  const f=g&&g.f;
  if(!f||typeof f!=='object') return g;
  if(f.champChampBelt && typeof f.champChampGloryBonus!=='number'){ f.champChampGloryBonus=150; }
  delete f.champChampBelt; delete f.champChampBeltDivId; delete f.champChampDefenses;
  return g;
}
/* ==== [FIN ANCRE] ==== */
