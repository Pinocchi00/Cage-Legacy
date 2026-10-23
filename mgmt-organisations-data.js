"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT5_ORGANISATIONS_DONNEES] — Brief du 06/10/2026, lot 5 :
   les huit organisations parmi lesquelles une nouvelle partie commence (planche
   « Management — Nouvelle partie » du canvas). Seuls les NOMS des organisations sont
   fixes ; tout le reste est recréé à chaque partie.
   Les « plus » et les « moins » sont ceux des maquettes, tels quels (validés par
   Anthony le 09/10/2026). La maquette ne nomme pas ses organisations 2 à 8 : elles sont
   ici dans l'ordre de la maquette, les quatre noms que le code connaissait (MGMT_EXT_ORGS,
   par prestige croissant) sur les emplacements 2 à 5, puis les trois noms
   donnés par Anthony le 06/10 : Knuckle Gate, Pure Impact, Undisputed Cage (dans l'ordre présenté).
   L'attribution des profils aux noms est celle du tableau « Tes plus et contreparties » du
   brief « Un monde qui a vécu » (lot 2), validé par Anthony le 09/10/2026 ; elle est figée
   par tests/mgmtAttributionProfils.test.js (Monde lot 2 T4).
   Le PROFIL règle la création du monde (caisse de départ, taille et âge de l'effectif, catégories
   fortes et faibles) ; popularité, taille des salles, niveau des bourses et entente des camps
   sont portés ici pour les lots 8 (la salle), 9 (les contrats) et 10 (les camps). Les valeurs
   numériques sont des PROPOSITIONS de Claude (relu:false), lues sur les « plus » et les « moins ». ==== */
const MGMT_ORGANISATIONS=[
  {id:'split',nom:'Split',auteur:false,relu:false,
     profil:{caisse:50,effectif:1,age:0,popularite:40,salles:1,bourses:1,fortes:[],faibles:[],manque:{id:'bons-poids-lourds',categories:['H-heavy']},force:{id:'equilibree',categories:[]}}},
  {id:'garden-of-blood',nom:'Garden of Blood',auteur:false,relu:false,
     profil:{caisse:45,effectif:1,age:0,popularite:80,salles:1.4,bourses:1.3,fortes:[],faibles:[],manque:{id:'espoirs',categories:[]},force:{id:'vedettes',categories:[]}}},
  {id:'mma-korner',nom:'MMA Korner',auteur:false,relu:false,
     profil:{caisse:20,effectif:0.8,age:0,popularite:15,salles:0.8,bourses:0.8,fortes:[],faibles:[],manque:{id:'potentiel-champion',categories:[]},force:{id:'legers-et-coqs',categories:['H-light','H-bantam']}}},
  {id:'ultimate-rim',nom:'Ultimate Rim',auteur:false,relu:false,
     profil:{caisse:40,effectif:0.7,age:-3,popularite:40,salles:0.7,bourses:1,fortes:[],faibles:[],manque:{id:'experimentes',categories:[]},force:{id:'jeunes-partout',categories:[]}}},
  {id:'fighting-pacific-championship',nom:'Fighting Pacific Championship',auteur:false,relu:false,
     profil:{caisse:60,effectif:1,age:3,popularite:60,salles:1,bourses:1,fortes:[],faibles:[],manque:{id:'finisseurs',categories:[]},force:{id:'mouches-et-coqs',categories:['H-fly','H-bantam']}}},
  {id:'organisation-6',nom:'Knuckle Gate',auteur:false,relu:false,
    profil:{caisse:35,effectif:1,age:0,popularite:55,salles:1,bourses:1,fortes:['F-straw','F-fly','F-bantam','F-feather'],
       faibles:['H-fly','H-bantam','H-feather','H-light','H-welter','H-middle','H-lheavy','H-heavy'],manque:{id:'soumissions',categories:[]},force:{id:'meilleures-combattantes',categories:[]}}},
  {id:'organisation-7',nom:'Pure Impact',auteur:false,relu:false,
     profil:{caisse:120,effectif:1,age:0,popularite:20,salles:1.2,bourses:1,fortes:[],faibles:[],manque:{id:'a-domicile',categories:[]},force:{id:'noms-achetes',categories:[]}}},
  {id:'organisation-8',nom:'Undisputed Cage',auteur:false,relu:false,
    profil:{caisse:50,effectif:1,age:0,popularite:60,salles:1,bourses:1,fortes:['H-heavy','H-lheavy'],
       faibles:['H-fly','F-straw','F-fly','F-bantam','F-feather'],manque:{id:'bons-mouches',categories:['H-fly']},force:{id:'lourds',categories:['H-heavy','H-lheavy']}}},
];
/* ==== [FIN ANCRE] ==== */
