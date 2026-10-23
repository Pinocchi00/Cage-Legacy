"use strict";
/* ==== [ANCRE: P6_T3_MEMOIRE] — Monde lot 47 T1 ==== */
const MGMT_MEMOIRE=Object.freeze({
  relu:false,
  types:Object.freeze({
    'attente-longue':Object.freeze({poids:2,duree:12}),'combat-refuse':Object.freeze({poids:2,duree:10}),
    relegation:Object.freeze({poids:3,duree:12}),'pied-leve':Object.freeze({poids:-2,duree:8}),prime:Object.freeze({poids:-1,duree:8}),
    'titre-accorde':Object.freeze({poids:-3,duree:16}),'titre-refuse':Object.freeze({poids:3,duree:16})
  }),
  niveaux:Object.freeze([
    {id:'carriere',label:'Te doit sa carrière',seuil:-6,fiche:['{nom} sait que tu lui as ouvert la porte.','{nom} n’oublie pas la chance reçue.','{nom} garde en tête le coup de pouce décisif.'],presse:['{nom} reconnaît la chance qu’on lui a donnée.','{nom} se rappelle qui l’a lancé.','{nom} garde le souvenir d’une occasion décisive.']},
    {id:'fidele',label:'Fidèle',seuil:-3,fiche:['{nom} reste attaché à l’organisation.','{nom} garde confiance dans ta façon de faire.','{nom} apprécie la place qu’il a ici.'],presse:['{nom} se dit bien dans cette organisation.','{nom} souligne le soutien reçu.','{nom} reste en bons termes avec son équipe.']},
    {id:'content',label:'Content de son sort',seuil:-1,fiche:['{nom} est content de sa place.','{nom} trouve son compte dans la situation.','{nom} juge sa place juste.'],presse:['{nom} se satisfait de sa situation.','{nom} dit que sa place lui convient.','{nom} ne réclame pas davantage aujourd’hui.']},
    {id:'attend',label:'Attend son tour',seuil:2,fiche:['{nom} attend que son tour vienne.','{nom} patiente encore.','{nom} espère une occasion à la hauteur.'],presse:['{nom} attend une occasion de se montrer.','{nom} rappelle qu’il est prêt à combattre.','{nom} veut que sa patience soit remarquée.']},
    {id:'cache',label:'Estime qu’on le cache',seuil:5,fiche:['{nom} estime qu’on ne lui donne pas assez de place.','{nom} pense qu’on le laisse dans l’ombre.','{nom} veut être davantage considéré.'],presse:['{nom} estime qu’on le laisse dans l’ombre.','{nom} demande que sa place soit revue.','{nom} dit qu’il mérite davantage d’exposition.']},
    {id:'part',label:'Ne prolongera pas',seuil:9,fiche:['{nom} ne compte pas prolonger.','{nom} envisage de partir au terme du contrat.','{nom} ne se voit pas rester ici.'],presse:['{nom} n’envisage pas de rester à la fin du contrat.','{nom} pense déjà à la suite ailleurs.','{nom} ne se voit pas prolonger l’aventure.']}
  ].map(n=>Object.freeze(Object.assign({},n,{fiche:Object.freeze(n.fiche),presse:Object.freeze(n.presse)})))),
  effets:Object.freeze({facteurCarriere:1.5,seuilBourse:5,majorationBourse:0.15,intervallePresse:10})
});
