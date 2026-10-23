"use strict";
/* ==== [ANCRE: P6_T1_SEMAINE_EVENEMENTS] — Monde lot 41 T1 ==== */
const MGMT_SEMAINE_FAMILLES=Object.freeze([
  ['arrivee','bon','lundi',.16],['medias','neutre','mardi',.14],['conference','neutre','mercredi',.18],['face_a_face','probleme','jeudi',.12],
  ['poids','probleme','vendredi',.08],['blessure_camp','probleme','lundi',.035],['visa','probleme','mardi',.025],['maladie','probleme','mercredi',.04],
  ['coach','neutre','lundi',.08],['demande_carte','bon','mardi',.08],['preventes','bon','mercredi',.12],['video_camp','bon','jeudi',.12],
  ['provocation','probleme','mardi',.10],['seance_publique','bon','jeudi',.10],['coin_plan','neutre','vendredi',.08],['salle_record','bon','samedi',.08],
  ['repos','bon','lundi',.07],['soutien','bon','mardi',.07],['pesage_presse','neutre','vendredi',.08],['logistique','neutre','samedi',.07],
  ['tension_coin','probleme','jeudi',.035],['equipement','neutre','mercredi',.07]
].map(([id,ton,jour,base])=>Object.freeze({id,ton,jour,base,poids:{charge:0.15,age:0.1,traits:0.12,camp:0.08,rivalite:0.1,salle:0.1},textes:Object.freeze(({
  arrivee:['{nom} arrive à {ville} pour retrouver {adversaire} à {salle}.','À {ville}, {nom} arrive avec un programme serré avant son combat contre {adversaire}.','{nom} arrive enfin à {ville} ; les derniers préparatifs commencent à {salle}.'],
  medias:['La journée des médias met {nom} face aux questions sur {adversaire}.','{nom} répond aux médias à {ville} et évoque son prochain combat.','Les médias suivent {nom} de près avant son duel contre {adversaire}.'],
  conference:['À la conférence, {nom} répond aux questions sur {adversaire}.','La conférence de presse réunit {nom} et son équipe avant le combat.','{nom} détaille son approche lors de la conférence organisée à {salle}.'],
  face_a_face:['Le face-à-face entre {nom} et {adversaire} reste tendu devant les photographes.','Au face-à-face, {nom} garde ses distances avec {adversaire}.','Le face-à-face de {nom} donne lieu à quelques échanges fermes entre les deux camps.'],
  poids:['À la pesée, {nom} manque le poids face à la limite prévue pour son combat.','La balance confirme que {nom} manque le poids avant son duel contre {adversaire}.','{nom} manque le poids à la pesée ; l’équipe doit maintenant décider de la suite.'],
  blessure_camp:['Au camp, {nom} ressent une gêne qui complique les derniers entraînements.','Une douleur au camp oblige {nom} à alléger sa préparation cette semaine.','Le camp de {nom} signale une blessure légère avant la rencontre avec {adversaire}.'],
  visa:['Un problème de visa retarde le déplacement de {nom} vers {ville}.','Le visa de {nom} n’est pas encore validé ; l’équipe vérifie les démarches.','Un délai administratif lié au visa perturbe le voyage de {nom}.'],
  maladie:['{nom} se sent malade et réduit ses activités avant le combat.','Une fièvre passagère éloigne {nom} des derniers rendez-vous publics.','L’équipe surveille l’état de {nom}, touché par des symptômes de grippe.'],
  coach:['Le coach de {nom} ajuste le programme avant le combat contre {adversaire}.','Le coach de {nom} insiste sur les consignes travaillées au camp.','À {salle}, le coach accompagne {nom} lors des derniers préparatifs.'],
  demande_carte:['{nom} demande à figurer sur une future carte de {salle}.','Une demande de carte de {nom} est transmise à l’organisation.','{nom} fait connaître son intérêt pour une place sur la prochaine carte.'],
  preventes:['Les préventes progressent après l’annonce du combat de {nom}.','La rencontre de {nom} et {adversaire} donne un nouvel élan aux préventes.','Les préventes de la soirée avancent régulièrement à {ville}.'],
  video_camp:['Une vidéo du camp de {nom} attire l’attention avant le combat.','La vidéo publiée par l’équipe de {nom} montre une séance de préparation.','La vidéo du camp de {nom} circule parmi les supporters.'],
  provocation:['Une provocation sur les réseaux vise {nom} avant son combat.','{nom} répond brièvement à une provocation relayée sur les réseaux.','Les réseaux s’animent après un message provocateur concernant {adversaire}.'],
  seance_publique:['La séance publique de {nom} attire le public à {salle}.','Le public observe {nom} travailler lors d’une séance ouverte.','{nom} prend le temps d’échanger avec le public après l’entraînement.'],
  coin_plan:['Le coin de {nom} affine son plan pour affronter {adversaire}.','Le plan de combat de {nom} est revu avec son équipe à {salle}.','Le coin de {nom} prépare plusieurs options pour le plan de combat.'],
  salle_record:['La salle de {ville} annonce un record d’affluence pour la soirée.','Un record de fréquentation est attendu à {salle} pour le combat de {nom}.','La soirée approche d’un record de billets vendus à {salle}.'],
  repos:['{nom} protège son repos avant le rendez-vous de samedi.','Une journée de repos aide {nom} à récupérer avant le combat.','L’équipe réserve à {nom} du repos pour finir la semaine sereinement.'],
  soutien:['Les proches de {nom} sont présents à {ville} avant le combat.','{nom} reçoit le soutien de ses supporters pendant la semaine de la rencontre.','Des proches accompagnent {nom} dans les derniers préparatifs à {salle}.'],
  pesage_presse:['La presse suit la pesée de {nom} à l’approche du combat.','Les journalistes s’intéressent à la pesée de {nom}.','La pesée de {nom} attire les médias présents à {salle}.'],
  logistique:['Un retard de vol complique le trajet de {nom} vers {ville}.','Les bagages de {nom} n’arrivent pas à l’hôtel avec l’équipe.','L’équipe de {nom} règle un contretemps d’hôtel avant la soirée.'],
  tension_coin:['Une tension dans le coin de {nom} complique les échanges avec l’équipe.','Le coin de {nom} doit clarifier les rôles avant le combat.','Un désaccord persiste dans le coin de {nom} à l’approche de samedi.'],
  equipement:['Les gants de {nom} doivent être vérifiés avant la pesée.','Un ajustement de tenue est demandé à {nom} avant son entrée.','L’équipe remplace un équipement de {nom} avant la soirée.']
}[id]||[])),relu:false})));
