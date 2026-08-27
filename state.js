"use strict";
/* CAGE LEGACY — state.js (en cours d'extraction vers state/*.js)
   Panthéon persistant. G/esc/setTheme : state/state-core.js. Meta-stats/
   analytics : state/state-analytics.js. save/load/hasSave/wipe/
   parseAndValidate/SAVE_KEY/SAVE_BACKUP_KEY : state/state-save.js. migrate/
   SAVE_VERSION : state/state-migration.js. validateSave/repairFighter/
   validateState : state/state-validation.js (tous chargés avant ce fichier). */
/* Panthéon (HOF_KEY, loadHOF/saveHOF, LEGEND_TIER_COLOR, legendTierColor,
   legendDecoStyle, equipPantheonDecoration, unequipPantheonDecoration,
   hofScore, enshrine) : déplacés vers state/state-hof.js. */
/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — META_STATS_KEY, ACH_KEY, loadAch,
   saveAch, metaStatsDefaults, migrateMetaStats, loadMetaStats, saveMetaStats,
   recordCareerStart, getAnalytics : déplacés vers state/state-analytics.js. ==== */
/* recordFaithLegend, getFaithBest, FAITH_LEGENDS_MAX, ensurePeopleRegistry, personDefaultRel, personKeyFor,
   personMint, personEnsure, personName, personDepart, GYM_SPECIALTY_ATTRS, GYM_REP_TIER, STYLE_TO_GYM_SPECIALTY,
   faithGymEligible, faithEligibleGyms, faithEnsureCampGyms, faithGymAsCamp, COACH_LEGITIMACY_CHECK,
   faithCoachLegitimate, faithEligibleCoaches, faithEnsureCoachChoices, faithHireCoach :
   déplacés vers state/state-faith.js. state.js ne contient plus que ce commentaire :
   toutes les fonctions du fichier original ont été réparties dans state/*.js
   (nettoyage final à venir : suppression de state.js et de sa balise <script>). */
