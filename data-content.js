"use strict";
/* CAGE LEGACY — js/data-content.js
   Contenu narratif : origines, motivations, orientations de camp (TRAIN).
   Chargé après data-skills.js, avant engine.js. */
/* ----------------------- BACKSTORY & MOTIVATION --------------------------- */
const ORIGINS=[
 'a grandi dans un quartier où il fallait se battre pour exister',
 'découvre le sport tard, presque par accident, et ne l\u2019a plus jamais lâché',
 'vient d\u2019une famille de lutteurs, sur les tapis depuis l\u2019enfance',
 'était un gamin frêle qu\u2019on brimait, jusqu\u2019au jour où il a poussé la porte d\u2019un club',
 'a fui la guerre et trouvé dans la cage un terrain où les règles sont claires',
 'était promis à une carrière d\u2019athlète avant de tout plaquer pour le combat',
 'a appris à se battre dans la rue avant d\u2019apprendre à le faire proprement',
 'sort d\u2019une salle réputée qui a formé des champions avant lui',
];
const MOTIVATIONS=[
 {short:'Sortir sa famille de la misère',drive:'heart'},
 {short:'Prouver au monde qu\u2019on avait tort sur lui',drive:'aggression'},
 {short:'Laisser un nom que l\u2019Histoire retiendra',drive:'killer'},
 {short:'Honorer la mémoire d\u2019un proche disparu',drive:'discipline'},
 {short:'La rage froide de ne jamais être respecté',drive:'aggression'},
 {short:'L\u2019amour pur du combat, rien d\u2019autre',drive:'focus'},
 {short:'Racheter un passé qu\u2019il traîne comme un poids',drive:'composure'},
 {short:'Devenir le meilleur, sans concession',drive:'confidence'},
];

/* --------------------- camp : 3 choix liés au sport ----------------------- */
/* chaque choix = un paquet de deltas VISIBLES et bornés par le potentiel. */
const TRAIN=[
 {t:['all'],label:'Sparring dur',hint:'On encaisse pour progresser',d:[['composure',3],['hook',2],['morale',-8],['form',6]]},
 {t:['all'],label:'Repos & analyse vidéo',hint:'Récupérer, comprendre',d:[['fightIQ',3],['adaptability',2],['morale',10],['form',-3]]},
 {t:['all'],label:'Prépa physique lourde',hint:'Le corps avant tout',d:[['strength',2],['cardio',3],['explosiveness',2],['morale',-6],['form',5]]},
 {t:['all'],label:'Camp d\u2019altitude',hint:'Cardio de fer',d:[['cardio',4],['recovery',2],['heart',2],['morale',-9],['form',4]]},
 {t:['all'],label:'Travail mental',hint:'La tête froide gagne',d:[['composure',3],['focus',3],['confidence',2],['morale',6]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Mitaines & timing',hint:'Affûter la frappe',d:[['jab',2],['cross',2],['handSpeed',2],['footSpeed',1],['form',3]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Puissance de frappe',hint:'Chercher le KO',d:[['power',3],['hook',2],['killer',2],['morale',-4]]},
 {t:['muayThai','kickboxer'],label:'Travail de clinch',hint:'Genoux, coudes, projections',d:[['clinchStr',3],['strength',2],['gnp',1]]},
 {t:['wrestler','sambo','mma'],label:'Drilling d\u2019amenées',hint:'Imposer le sol',d:[['takedown',3],['topControl',2],['strength',1],['footSpeed',-1]]},
 {t:['wrestler','sambo'],label:'Contrôle & ground and pound',hint:'Écraser du dessus',d:[['topControl',2],['gnp',3],['power',1],['form',3]]},
 {t:['bjj','sambo'],label:'Rolling technique',hint:'Le sol comme un échiquier',d:[['submission',3],['guardWork',2],['flexibility',2]]},
 {t:['bjj'],label:'Chasse à la soumission',hint:'Finir par le cou',d:[['submission',3],['killer',2],['gnp',1],['form',-2]]},
 {t:['wrestler','sambo','mma','bjj'],label:'Défense de lutte',hint:'Ne plus jamais tomber',d:[['tdd',3],['fightIQ',2],['cardio',1]]},
 {t:['mma','karate'],label:'Jeu de jambes & angles',hint:'Toucher sans être touché',d:[['footSpeed',3],['fightIQ',2],['jab',1]]},
 {t:['mma'],label:'Enchaînements complets',hint:'Lier debout et sol',d:[['adaptability',3],['cross',1],['takedown',1],['submission',1],['form',3]]},
];
