"use strict";
/* ==== [ANCRE: MGMT_LOT5_T3_MEDIAS_DONNEES] — Lot 5 T3, la couche médias : les
   dix médias du document des voix (§6) et leurs lignes. PROPOSITIONS de
   Claude (30/09, relu:false) : Anthony les relit et les réécrit (règle
   absolue). Les lignes d'exemple du document citaient des noms propres ; ici
   chaque ligne n'a que des emplacements, jamais un nom (a = le combattant du
   sujet — le vainqueur au lendemain —, b = l'autre, n = le numéro de la
   soirée, round, pays, cat). Chaque ligne est déclenchée par une SITUATION
   (affiche = la carte principale annoncée ; lendemain = le dernier combat
   principal ; rebook = un combattant rebooké vite après un KO) et, au
   besoin, une CONDITION lue sur l'état du jeu. Aucun jugement sur
   l'origine, la religion, le sexe, l'orientation ou le handicap. ==== */
const MGMT_MEDIAS=[
  {id:'cage-hebdo',nom:'Cage Hebdo',regle:'Phrases complètes, factuelles, une seule opinion en dernière phrase. Jamais de point d’exclamation.'},
  {id:'sources-proches',nom:'Sources Proches',regle:'Le scoop : « selon plusieurs sources », messages courts. Il a souvent raison, pas toujours.'},
  {id:'cle-de-bras',nom:'Clé de Bras',regle:'Le putaclic : titres en majuscules, l’article dit l’inverse du titre.',majuscules:true},
  {id:'la-pesee',nom:'La Pesée',regle:'L’enquête : longue, sourcée, ironie froide. Le seul média qui te met face à tes décisions.'},
  {id:'tableau-noir',nom:'Tableau Noir',regle:'L’analyse technique, pédagogique, sans morale.'},
  {id:'micro-tendu',nom:'Micro Tendu',regle:'L’interview décalée : le côté humain, les questions gênantes.'},
  {id:'le-plateau',nom:'Le Plateau',regle:'La chaîne du diffuseur : tout est historique, immanquable.'},
  {id:'le-forum',nom:'Le Forum',regle:'La rumeur : extrême dans les deux sens, cru et injuste.'},
  {id:'presse-du-pays',nom:'La presse du pays',regle:'La presse nationale d’un combattant étranger, traduite : « notre {a} ».'},
  {id:'coin-rouge',nom:'Coin Rouge',regle:'Le média des combattants français : tutoiement, vidéos, proche des gens.'},
];

/* situation : affiche | lendemain | rebook ; si : condition facultative
   (fr, etranger, etrangerPerd, ko1, dec, surprise, serie, finition). */
const MGMT_MEDIAS_LIGNES=[
  /* Cage Hebdo */
  {media:'cage-hebdo',situation:'affiche',texte:'{a} et {b} se retrouvent en tête d’affiche de Split {n}, en {cat}. Le combat dira lequel des deux a besoin de l’autre.',relu:false},
  {media:'cage-hebdo',situation:'affiche',texte:'La carte principale de Split {n} s’ouvre sur {a} contre {b}. Une affiche sans fausse note, et sans surprise.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',texte:'{a} a battu {b} à Split {n}, au round {round}. La suite de la division passe par lui.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'finition',texte:'{a} a mis fin au combat face à {b} au round {round}. Le résultat ne laisse aucune place à la discussion.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'dec',texte:'{a} l’emporte aux points contre {b} après {round} rounds. Les juges ont tranché ; le public attendait plus.',relu:false},
  /* Sources Proches */
  {media:'sources-proches',situation:'affiche',texte:'Selon plusieurs sources, {a} contre {b} sera la tête d’affiche de Split {n}. On me le confirme.',relu:false},
  {media:'sources-proches',situation:'affiche',texte:'Info : {a} et {b} sont sur la même carte à Split {n}. Rien ne sortira avant la pesée.',relu:false},
  /* Clé de Bras (majuscules appliquées à l’affichage) */
  {media:'cle-de-bras',situation:'lendemain',si:'ko1',texte:'{a} ÉTEINT {b} EN UN ROUND : VOICI CE QUE LES FANS ONT DIT',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'surprise',texte:'{b} DÉTRUIT PAR {a} ? LES FANS N’EN REVIENNENT PAS',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'serie',texte:'{a} ENCHAÎNE ENCORE : VOICI POURQUOI ON NE PEUT PLUS L’IGNORER',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'dec',texte:'{b} RÉAGIT APRÈS SA DÉFAITE : SA RÉPONSE VA VOUS SURPRENDRE',relu:false},
  /* La Pesée */
  {media:'la-pesee',situation:'rebook',texte:'{a} est rebooké cinq semaines après un KO. La médecin de commission est disponible pour commenter. Split n’a pas souhaité répondre.',relu:false},
  {media:'la-pesee',situation:'rebook',texte:'Cinq semaines après son KO, {a} remonte dans la cage. On cherche encore qui l’a décidé.',relu:false},
  /* Tableau Noir */
  {media:'tableau-noir',situation:'lendemain',si:'finition',texte:'{a} a trouvé la finition au round {round}. {b} a tenu le plan jusque-là ; tout le combat est dans ce qui a changé juste avant.',relu:false},
  {media:'tableau-noir',situation:'lendemain',si:'dec',texte:'{a} a gagné aux points, sur {rounds} rounds. Une victoire propre : aucun risque pris, aucun risque couru.',relu:false},
  {media:'tableau-noir',situation:'lendemain',texte:'{b} a perdu le combat au round {round}. La question n’est pas ce qu’il a manqué, mais ce qu’il a laissé faire.',relu:false},
  /* Micro Tendu (question, réponse) */
  {media:'micro-tendu',situation:'lendemain',si:'serie',texte:'Q. {a}, ta série, tu la vis comment ? — R. Je dors beaucoup. Et je mange mal.',relu:false},
  {media:'micro-tendu',situation:'lendemain',texte:'Q. {a}, ce soir, tu as eu peur ? — R. Avant, oui. Pendant, je n’ai pas eu le temps.',relu:false},
  {media:'micro-tendu',situation:'lendemain',texte:'Q. {a}, ton plat préféré avant une pesée ? — R. Celui que je ne peux pas manger.',relu:false},
  /* Le Plateau */
  {media:'le-plateau',situation:'affiche',texte:'Mesdames et messieurs, ce que vous verrez à Split {n}, c’est tout simplement historique. {a} contre {b}. Un seul survivant.',relu:false},
  {media:'le-plateau',situation:'affiche',texte:'Le combat de l’année ? Ce sera {a} contre {b} à Split {n}, et ne dites pas qu’on ne vous avait pas prévenus.',relu:false},
  {media:'le-plateau',situation:'lendemain',texte:'Un moment immanquable, mesdames et messieurs : {a} a battu {b} à Split {n}. C’est tout simplement historique.',relu:false},
  /* Le Forum */
  {media:'le-forum',situation:'lendemain',si:'dec',texte:'vol. VOL. VOOOL. les juges ils ont regardé un autre sport',relu:false},
  {media:'le-forum',situation:'lendemain',si:'ko1',texte:'{a} c’est le GOAT et vous êtes pas prêts',relu:false},
  {media:'le-forum',situation:'lendemain',si:'surprise',texte:'{b} fini, à la retraite, rendez l’argent à Split',relu:false},
  {media:'le-forum',situation:'affiche',texte:'qui a booké cette affiche sérieux, {a} {b} c’est du remplissage',relu:false},
  /* La presse du pays (a = le combattant de ce pays) */
  {media:'presse-du-pays',situation:'affiche',si:'etranger',texte:'(Presse nationale — {pays}, traduit) Notre {a} combat à Split {n}. Le pays entier sera devant son écran, à n’importe quelle heure.',relu:false},
  {media:'presse-du-pays',situation:'lendemain',si:'etranger',texte:'(Presse nationale — {pays}, traduit) Notre {a} a gagné en France. Une organisation française de plus qui sait maintenant son nom.',relu:false},
  {media:'presse-du-pays',situation:'lendemain',si:'etrangerPerd',texte:'(Presse nationale — {pays}, traduit) Défaite amère pour notre {a} : l’organisation française lui a donné un adversaire trop dur.',relu:false},
  /* Coin Rouge (a = le combattant français) */
  {media:'coin-rouge',situation:'affiche',si:'fr',texte:'Split met {a} en tête d’affiche pour Split {n}. Enfin. Il avait mérité sa place depuis longtemps.',relu:false},
  {media:'coin-rouge',situation:'lendemain',si:'fr',texte:'On a retrouvé {a} dans sa salle après Split {n}. Il a ramené des croissants pour tout le monde. On est fans.',relu:false},
];
/* ==== [FIN ANCRE] ==== */
