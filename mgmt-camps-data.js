"use strict";
/* ==== [ANCRE: MGMT_LOT5_T7_CAMPS_DONNEES] — Lot 5 T7 : les salles. Propositions
   de Claude du 03/10/2026 (décision du 30/09 : Claude propose, Anthony relit et
   réécrit — chaque modèle est relu:false). Un nom de salle se construit sur la
   VILLE du camp (« {Ville} » : une ville réelle du catalogue) : aucun nom de
   personne, aucune marque réelle, rien qui vise une origine. La langue suit le
   pays, comme pour les surnoms (catalogue §3.2) ; les pays sans modèle propre
   prennent l'anglais. Les coachs ne sont pas écrits : leur nom se tire des
   listes de prénoms et de noms réels du pays (engine.js, makeName). ==== */
const MGMT_SALLES_MODELES={
  fr:[{texte:'Boxing Club de {Ville}',relu:false},{texte:'Académie de combat de {Ville}',relu:false},{texte:'MMA {Ville}',relu:false},{texte:'Team {Ville}',relu:false},{texte:'Salle de lutte de {Ville}',relu:false}],
  pt:[{texte:'Academia {Ville}',relu:false},{texte:'Equipe {Ville}',relu:false},{texte:'{Ville} Fight Team',relu:false},{texte:'Centro de Treinamento {Ville}',relu:false},{texte:'Casa de Luta {Ville}',relu:false}],
  es:[{texte:'Gimnasio {Ville}',relu:false},{texte:'Equipo {Ville}',relu:false},{texte:'Club de Lucha {Ville}',relu:false},{texte:'Academia {Ville}',relu:false},{texte:'{Ville} MMA',relu:false}],
  en:[{texte:'{Ville} MMA',relu:false},{texte:'{Ville} Fight Club',relu:false},{texte:'Team {Ville}',relu:false},{texte:'{Ville} Boxing Gym',relu:false},{texte:'{Ville} Grappling Club',relu:false}],
};
/** Les moments de vie (catalogue §6.3) qui changent de camp ou de coach. */
const MGMT_CAMP_CHANGEMENTS={
  'change-de-camp':{camp:true,part:1},
  'dispute-coach-publique':{camp:true,part:0.6,coach:true},
  'demenage-autre-ville':{camp:true,part:0.5},
  'etranger-camp':{camp:true,part:1,etranger:true},
  'coach-meurt':{coach:true},
  'coach-retraite':{coach:true},
};
/** Un camp de qualité se lit dans la forme du combattant (jamais affiché en chiffre). */
const MGMT_CAMP_FORME=3;
/** Cycles de rodage après un changement de camp (forme en baisse). */
const MGMT_CAMP_RODAGE=2;
/** Part des combattants qui s'entraînent hors de leur ville d'origine. */
const MGMT_CAMP_AILLEURS=0.15;
/** Lot 10 : ce qu'on travaille dans une salle. Propositions de Claude (relu:false) — la spécialité pèse sur la progression des
 * combattants de son style (plein) ou de tous (le travail de fond, la moitié). */
const MGMT_CAMP_SPECIALITES=[
  {id:'distance',libelle:'Le contre à distance',styles:['boxer','karate','kickboxer'],relu:false},
  {id:'clinch',libelle:'Le clinch et les coudes',styles:['muayThai','kickboxer'],relu:false},
  {id:'lutte',libelle:'La lutte et le contrôle',styles:['wrestler','sambo'],relu:false},
  {id:'sol',libelle:'Le travail au sol',styles:['bjj','sambo'],relu:false},
  {id:'cardio',libelle:'Le cardio et les longs combats',styles:[],tous:true,relu:false},
];
/** Le surcroît de progression d'une spécialité qui convient (part du gain de niveau). */
const MGMT_CAMP_SPEC=0.15;
/** Poids (charge) du combat entre coéquipiers (décision contraire, H7). */
const MGMT_CONTRARIE_COEQUIPIER=15;
/* ==== [FIN ANCRE] ==== */
