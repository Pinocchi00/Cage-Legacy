"use strict";
/* ==== [ANCRE: MONDE_LOT3_T3_TEXTES] — Monde lot 3 T3 : phrases de présentation d'un combat ====
   Propositions de Claude (13/10/2026), marquées relu:false : Anthony les relit et les réécrit.
   Sept familles de paire (mgmt-presentation-faits.js) + trois voix de médias (règles de mgmt-medias-data.js) :
   Cage Hebdo = phrases complètes et factuelles, une seule opinion en dernière phrase, jamais de point d’exclamation ;
   Tableau Noir = analyse technique pédagogique, sans morale ; Le Forum = rumeur extrême, crue et injuste.
   Formulations épicènes, utilisables en catégorie féminine. Variables : celles de la clé ({tranche}, {combats}, {styles},
   {nom}, {rangs}, {adversaire}, {champion}, {vainqueur}, {pourcentage}) ; l’écran résout les identifiants en noms publics. */
const MGMT_PRESENTATION_COMBAT_TEXTES = {
  meme_age:          { id: 'meme_age',          texte: 'Les deux sont dans la même tranche d’âge : {tranche} ans.', situation: 'même tranche d’âge', relu: false },
  revanche:          { id: 'revanche',          texte: 'Cette paire s’est déjà affrontée {combats} fois : ce combat prolonge une histoire commune.', situation: 'revanche ou trilogie', relu: false },
  contraste_style:   { id: 'contraste_style',   texte: 'Deux styles s’opposent : {styles}.',                                          situation: 'contraste de styles publics', relu: false },
  meme_camp:         { id: 'meme_camp',         texte: 'Les deux s’entraînent dans le même camp, {nom}.',                              situation: 'même camp', relu: false },
  rangs_voisins:     { id: 'rangs_voisins',     texte: 'Au classement, leurs places sont voisines : {rangs}.',                         situation: 'rangs voisins', relu: false },
  adversaire_commun: { id: 'adversaire_commun', texte: 'Les deux ont déjà affronté {adversaire}.',                                    situation: 'adversaire commun', relu: false },
  titre:             { id: 'titre',             texte: 'La personne qui détient la ceinture de la catégorie, {champion}, figure dans ce combat.', situation: 'présence du détenteur de la ceinture', relu: false },
  'cage-hebdo':      { id: 'cage-hebdo',        texte: 'Les chiffres donnent la victoire à {vainqueur} à {pourcentage} %. Le combat reste à jouer, et c’est la seule vérité qui compte.', situation: 'pronostic Cage Hebdo', relu: false },
  'tableau-noir':    { id: 'tableau-noir',      texte: 'Sur le papier, l’avantage va à {vainqueur}, d’après les bilans publics de la paire.', situation: 'pronostic Tableau Noir', relu: false },
  'le-forum':        { id: 'le-forum',          texte: 'Pour le Forum, {vainqueur} écrase tout et l’autre n’a rien à faire là.',   situation: 'pronostic Le Forum', relu: false }
};
/* ==== [FIN ANCRE] ==== */
