"use strict";
/* ==== [ANCRE: P6_T1_SEMAINE_EVENEMENTS] — Monde lot 41 T1 ==== */
const MGMT_SEMAINE_FAMILLES=Object.freeze([
  ['arrivee','bon','lundi',.16],['medias','neutre','mardi',.14],['conference','neutre','mercredi',.18],['face_a_face','probleme','jeudi',.12],
  ['poids','probleme','vendredi',.08],['blessure_camp','probleme','lundi',.035],['visa','probleme','mardi',.025],['maladie','probleme','mercredi',.04],
  ['coach','neutre','lundi',.08],['demande_carte','bon','mardi',.08],['preventes','bon','mercredi',.12],['video_camp','bon','jeudi',.12],
  ['provocation','probleme','mardi',.10],['seance_publique','bon','jeudi',.10],['coin_plan','neutre','vendredi',.08],['salle_record','bon','samedi',.08],
  ['repos','bon','lundi',.07],['soutien','bon','mardi',.07],['pesage_presse','neutre','vendredi',.08],['logistique','neutre','samedi',.07],
  ['tension_coin','probleme','jeudi',.035],['equipement','neutre','mercredi',.07]
].map(([id,ton,jour,base])=>Object.freeze({id,ton,jour,base,poids:{charge:0.15,age:0.1,traits:0.12,camp:0.08,rivalite:0.1,salle:0.1},textes:Object.freeze([
  '{nom} arrive à {ville} pour la soirée de {salle}, où {adversaire} sera aussi attendu.',
  'À {ville}, {nom} découvre les installations de {salle} avant son combat contre {adversaire}.',
  'La semaine de {nom} prend forme à {ville} : {salle} accueillera son duel avec {adversaire}.'
]),relu:false})));
