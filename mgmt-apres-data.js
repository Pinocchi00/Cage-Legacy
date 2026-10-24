"use strict";
/* ==== [ANCRE: P8_T3_APRES_CATALOGUE] — Monde lot 63 T1 ==== */
/* Trois formulations par famille. Les textes ne déclenchent aucune nouvelle
   histoire seuls : mgmtApresCalculer ne les expose que si le fait existe. */
const MGMT_APRES_CATALOGUE = [
  { famille:'interpellation', motCle:'réponse', textes:[
    'Réponse du camp adverse à l’interpellation de {nom}.',
    'Le camp adverse prépare sa réponse à {nom}, interpellé après la soirée.',
    'Après l’interpellation de {nom}, le camp adverse formule sa réponse.'
  ]},
  { famille:'réseaux', motCle:'réseaux', textes:[
    'Sur les réseaux, le trait de {nom} fait réagir.',
    'Le surnom de {nom} circule sur les réseaux après sa victoire.',
    'Les réseaux commentent le nouveau trait de {nom}.'
  ]},
  { famille:'suspension', motCle:'suspension', textes:[
    'La suspension médicale de {nom} est de {jours} jours.',
    'Pour {nom}, la suspension médicale court encore {jours} jours.',
    'La suspension de {nom} après sa blessure est fixée à {jours} jours.'
  ]},
  { famille:'revanche', motCle:'revanche', textes:[
    'Le camp de {nom} demande une revanche.',
    'Une revanche est réclamée par le camp de {nom}.',
    'Le camp de {nom} veut une revanche après ce combat serré.'
  ]},
  { famille:'autre organisation', motCle:'organisation', textes:[
    'Une autre organisation réagit au parcours de {nom}.',
    'L’organisation rivale prépare une réponse autour de {nom}.',
    'Une organisation concurrente fait parler de {nom}.'
  ]},
  { famille:'espoir', motCle:'espoir', textes:[
    'Ton espoir {nom} poursuit sa progression après la soirée.',
    'Des nouvelles de ton espoir {nom} après son combat.',
    'Ton espoir {nom} reste suivi après cette étape.'
  ]},
  { famille:'titre', motCle:'titre', textes:[
    'Le titre remporté par {nom} change la division.',
    'Après le combat pour le titre, {nom} ouvre un nouveau chapitre.',
    'Le titre de {nom} attire déjà l’attention de la division.'
  ]},
  { famille:'salle', motCle:'salle', textes:[
    'La salle pleine prolonge le souvenir de la soirée.',
    'La salle a répondu présente lors du combat de {nom}.',
    'L’affluence de la salle reste un sujet après la soirée.'
  ]},
  { famille:'prime', motCle:'prime', textes:[
    'La prime de {nom} récompense sa performance.',
    'Après la soirée, la prime revient à {nom}.',
    'La prime attribuée à {nom} souligne son combat.'
  ]},
  { famille:'retraite', motCle:'retraite', textes:[
    'Le discours de retraite de {nom} clôt son parcours.',
    'Après son annonce, {nom} confirme sa retraite.',
    'La retraite annoncée par {nom} marque la fin de sa carrière.'
  ]}
].map(f => ({ ...f, textes:f.textes.map(texte => ({ texte, relu:false })) }));
