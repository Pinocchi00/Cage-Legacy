"use strict";
/* ==== [ANCRE: P7_T1_SALLE_PRIMES] — Monde lot 44 T1 ==== */
/* Brief du 22/10/2026, P7 T1 et T3. Textes courts, relu:false : Anthony les
   relit. Aucun nom de personnage, aucune réplique inventée. Les montants sont
   proportionnels à la bourse de la soirée et plafonnés pour rester sous 3 %
   des recettes brutes (billetterie + droits) — mesure du 23/10/2026 sur
   40 soirées : 1,60 % (max 2,64 %). La maquette UniSoireeFin (50 000 € par prime) est une
   illustration, pas une valeur d'économie. */
const MGMT_SALLE=Object.freeze({
  paliers:Object.freeze(['salle froide','salle qui s’éveille','salle pleine','salle chaude','salle debout']),
  /* Effet d'un combat terminé sur le palier (0 à 4). Le neutre revient d'un
     cran vers le palier 2 : le temps calme une salle, sans l'éteindre. */
  effets:Object.freeze({eclair:2,tardive:1,surprise:2,guerre:2,molle:-2,neutre:0}),
  /* Part de la capacité gagnée ou perdue à chaque combat. */
  affluence:Object.freeze({eclair:0.01,tardive:0.005,surprise:0.01,guerre:0.01,molle:-0.01,neutre:0.005}),
  naturel:2,
  affluenceDepart:0.35,
  capaciteDefaut:9000,
  /* Trois phrases par type et par palier ; la sélection n'en répète jamais
     deux de suite. */
  phrases:Object.freeze({
    eclair:Object.freeze({
      0:Object.freeze(['Un premier round expéditif ne suffit pas à réchauffer les travées.','La finition arrive trop tôt pour une salle encore vide.','Quelques cris, puis le silence retombe sur les gradins.']),
      1:Object.freeze(['Le premier round met la salle en mouvement.','Une finition rapide tire les premiers applaudissements.','Les travées s’éveillent sur ce départ expéditif.']),
      2:Object.freeze(['La salle se lève à peine, le premier round a suffi.','Un éclair au premier round fait vibrer les gradins.','Le public répond d’un coup à cette finition immédiate.']),
      3:Object.freeze(['La salle gronde : un premier round, une finition.','Les gradins sont debout avant la reprise.','Le premier round embrase une salle déjà chaude.']),
      4:Object.freeze(['Une salle debout pour un premier round expéditif.','Le toit tremble sur cette finition immédiate.','Le public debout scande la finition du premier round.'])
    }),
    tardive:Object.freeze({
      0:Object.freeze(['Une finition tardive arrache quelques applaudissements distraits.','La salle froide s’anime un instant, à la limite.','Le coup de la fin réveille à peine les derniers rangs.']),
      1:Object.freeze(['La finition tardive fait monter un premier murmure.','Les travées s’éveillent à la dernière limite.','Un sursaut dans les gradins, la fin arrive au bout.']),
      2:Object.freeze(['La salle pleine salue une finition arrachée à la limite.','Les gradins répondent quand la fin tombe au dernier round.','Une finition tardive fait lever une partie de la salle.']),
      3:Object.freeze(['La salle chaude explose sur cette finition de fin de combat.','Les travées tiennent jusqu’au bout, puis lâchent.','Une finition tardive met le feu à des gradins déjà chauds.']),
      4:Object.freeze(['Salle debout : la finition tombe au dernier moment.','Le public debout acclame une fin arrachée à la limite.','Les gradins ne se rassoient pas après cette finition tardive.'])
    }),
    surprise:Object.freeze({
      0:Object.freeze(['L’outsider surprend, mais la salle reste froide.','Quelques exclamations dans une salle presque vide.','Le pronostic public se trompe, les gradins à peine réveillés.']),
      1:Object.freeze(['La surprise fait lever les premiers rangs.','Un murmure de stupeur parcourt les travées.','Les gradins s’éveillent sur un résultat inattendu.']),
      2:Object.freeze(['La salle pleine bascule avec l’outsider.','Une clameur de surprise monte des gradins.','Le public se lève à moitié sur ce résultat inattendu.']),
      3:Object.freeze(['La salle chaude conspue le pronostic et acclame la surprise.','Les travées grondent : personne n’avait vu venir ce résultat.','Une surprise électrise des gradins déjà chauds.']),
      4:Object.freeze(['Salle debout pour l’outsider que personne n’attendait.','Le public debout scande la surprise de la soirée.','Les gradins en délire saluent un résultat renversant.'])
    }),
    guerre:Object.freeze({
      0:Object.freeze(['Une guerre de coups réchauffe à peine une salle froide.','Les coups pleuvent, les gradins restent clairsemés.','Le public encore vide suit la guerre sans s’emballer.']),
      1:Object.freeze(['La guerre fait monter un grondement dans les travées.','Les premiers rangs se penchent sur ce combat de coups.','Une salle qui s’éveille prend parti dans la guerre.']),
      2:Object.freeze(['La salle pleine vibre à chaque échange de la guerre.','Les gradins répondent coup pour coup.','Un combat de guerre fait lever la salle entière.']),
      3:Object.freeze(['La salle chaude scande chaque round de la guerre.','Les travées tiennent le rythme d’un combat de fer.','La guerre embrase des gradins déjà chauds.']),
      4:Object.freeze(['Salle debout, la guerre ne laisse personne assis.','Le public debout hurle à chaque échange.','Les gradins en fusion pour une guerre de cinq rounds.'])
    }),
    molle:Object.freeze({
      0:Object.freeze(['Une décision sans éclat laisse la salle froide.','Les gradins s’endorment sur ce combat sans action.','Quelques sifflets perdus dans une salle vide.']),
      1:Object.freeze(['La décision molle fait retomber l’élan des travées.','Les gradins se rassoient, le combat n’a pas pris.','Un murmure déçu accompagne la décision.']),
      2:Object.freeze(['La salle pleine retombe sur une décision sans action.','Les travées se vident de leur bruit.','Un combat sans éclat casse l’ambiance des gradins.']),
      3:Object.freeze(['La salle chaude se refroidit sur cette décision molle.','Les gradins cessent de scander, le combat s’éteint.','Une décision sans action fait retomber des travées chaudes.']),
      4:Object.freeze(['Salle debout, puis la décision molle fait retomber tout le monde.','Le public retombe d’un coup sur un combat sans éclat.','Les gradins se rassoient, déçus par la décision.'])
    }),
    neutre:Object.freeze({
      0:Object.freeze(['Un combat ordinaire ne réchauffe pas une salle froide.','Les gradins suivent sans bruit.','La salle reste froide, le combat suit son cours.']),
      1:Object.freeze(['La salle s’éveille lentement sur un combat ordinaire.','Quelques applaudissements polis dans les travées.','Les gradins prennent le rythme, sans s’emballer.']),
      2:Object.freeze(['La salle pleine suit un combat ordinaire sans se lever.','Les gradins restent attentifs, l’ambiance tient.','Un combat propre entretient le bruit de la salle.']),
      3:Object.freeze(['La salle chaude garde son bruit sur un combat ordinaire.','Les travées tiennent l’ambiance, sans coup d’éclat.','Un combat sérieux ne fait pas retomber des gradins chauds.']),
      4:Object.freeze(['Salle debout, puis un combat ordinaire la fait asseoir.','Les gradins gardent le rythme, sans nouvelle étincelle.','Le public debout attend un nouvel éclat.'])
    })
  }),
  relu:false
});

const MGMT_PRIMES=Object.freeze({
  /* 1 % de la bourse de la soirée par versement (quatre versements : le
     combat de la soirée pour ses deux combattants, deux performances). Le
     total est plafonné à 2,9 % des recettes brutes ; sous le plancher d'un
     euro par versement, aucune prime n'est versée. */
  partBourse:0.01,
  plafondRecettes:0.029,
  minimum:1,
  /* Le plus fort l'emporte : finition au 1er round, surprise, guerre,
     finition tardive. Une décision molle ou un combat ordinaire ne vaut rien. */
  criteres:Object.freeze({eclair:5,tardive:3,surprise:4,guerre:3,molle:0,neutre:0}),
  libelles:Object.freeze({cs:'combat de la soirée',pf:'performance de la soirée'}),
  annonces:Object.freeze([
    'Le {prix} revient à {nom} : {montant}.',
    '{nom} reçoit {montant} pour le {prix}.',
    '{prix} : {nom}, {montant}.'
  ]),
  relu:false
});
