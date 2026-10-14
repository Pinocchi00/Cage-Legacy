"use strict";
/* ==== [ANCRE: MONDE_LOT3_T2_TEXTES] — Monde lot 3 T2 : phrases de présentation d'un combattant ====
   Propositions de Claude (13/10/2026), marquées relu:false : Anthony les relit et les réécrit.
   Narration factuelle, épicène, ni dialogue de Leïla ni pronostic. Variables = clés de `valeur` des faits de
   mgmt-presentation-faits.js ; la résolution des libellés est faite par l'écran (pas ici) :
   {issue} → « victoires » ou « défaites » ; {methode} → libellé public de la méthode ; {moment} → libellé du moment
   de vie du catalogue ; {adversaire} → nom du combattant ; {round} et {methode} peuvent valoir une chaîne vide
   (l'écran compacte alors les espaces et la ponctuation). Aucune phrase ne dépend d'un pronom ni d'un genre. */
const MGMT_PRESENTATION_COMBATTANT_TEXTES = {
  age:               { id: 'age',               texte: '{age} ans.',                                                           situation: 'tranche d’âge publique', relu: false },
  rang:              { id: 'rang',              texte: 'Numéro {rang} de sa catégorie au classement de l’organisation.',     situation: 'top 3 de la catégorie', relu: false },
  mouvement:         { id: 'mouvement',         texte: 'Son classement a bougé de {places} places depuis la dernière soirée.', situation: 'mouvement d’au moins 3 places', relu: false },
  serie:             { id: 'serie',             texte: 'Une série de {n} {issue} d’affilée.',                                  situation: 'série d’au moins 3', relu: false },
  methode:           { id: 'methode',           texte: '{victoires} de ses {total} victoires viennent de la même méthode : {methode}.', situation: 'méthode dominante', relu: false },
  attente:           { id: 'attente',           texte: 'Pas de combat depuis {mois} mois.',                                    situation: 'attente d’au moins 6 mois', relu: false },
  camp:              { id: 'camp',              texte: 'S’entraîne au camp {nom}, à {ville}.',                                 situation: 'camp public', relu: false },
  role:              { id: 'role',              texte: 'Tient la ceinture de sa catégorie : {defenses} défenses à son actif.', situation: 'champion en titre', relu: false },
  bilan:             { id: 'bilan',             texte: 'Bilan : {W} victoires, {L} défaites, {D} nuls.',                       situation: 'bilan public', relu: false },
  ville:             { id: 'ville',             texte: 'Originaire de {ville}.',                                               situation: 'ville publique', relu: false },
  metier:            { id: 'metier',            texte: 'Dans la vie : {metier}.',                                              situation: 'métier public', relu: false },
  moment:            { id: 'moment',            texte: 'Moment de vie récent : {moment}.',                                     situation: 'moment de vie relayé', relu: false },
  victoire_champion: { id: 'victoire_champion', texte: 'Victoire de prestige : {adversaire} portait la ceinture.',                          situation: 'victoire sur un champion', relu: false },
  W:                 { id: 'W',                 texte: 'Victoire contre {adversaire}, {methode} {round}.',                     situation: 'résultat d’histoire : victoire', relu: false },
  L:                 { id: 'L',                 texte: 'Défaite contre {adversaire}, {methode} {round}.',                      situation: 'résultat d’histoire : défaite', relu: false },
  D:                 { id: 'D',                 texte: 'Match nul contre {adversaire}, {methode} {round}.',                                       situation: 'résultat d’histoire : nul', relu: false }
};
/* ==== [FIN ANCRE] ==== */
