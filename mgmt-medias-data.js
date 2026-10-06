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
   (fr, etranger, etrangerPerd, ko1, dec, surprise, serie, finition ; pionniere,
   guerre ; voix:x+y — deux voix qui se rencontrent, '*' toute voix, 'bruyant'). */
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
  /* Quand deux voix se rencontrent (document des voix §4) : la tension de l'affiche. */
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-metteur-en-scene+le-metronome',texte:'{a} provoque {b} depuis trois semaines. {b} n’a pas répondu une seule fois. Ça ne durera pas.',relu:false},
  {media:'cle-de-bras',situation:'affiche',si:'voix:le-sans-filtre+le-fataliste',texte:'{a} DÉRAPE SUR {b} : LA RÉPONSE GLACÉE QUE PERSONNE N’ATTENDAIT',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:le-bavard-de-la-cage+le-signeur',texte:'quinze minutes de monologue de {a} devant {b}, qui n’a pas entendu un mot. le feuilleton de la semaine',relu:false},
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-mechant-de-catch+le-clan',texte:'{a} a trouvé le seul sujet qui ne se plaisante pas chez {b}. {b} ne dit plus rien. C’est le combat le plus attendu de la saison.',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:le-prophete+le-prophete',texte:'deux prophètes sur la même affiche : {a} et {b} ont annoncé le contraire l’un de l’autre. un des deux a tort, forcément',relu:false},
  {media:'tableau-noir',situation:'affiche',si:'voix:le-violent-heureux+le-lutteur-de-fac',texte:'{a} veut la guerre debout, {b} veut le sol. Quelqu’un criera au vol samedi.',relu:false},
  {media:'le-plateau',situation:'affiche',si:'voix:linfluenceur+le-vieux-de-la-vieille',texte:'Le monde d’avant contre celui d’après, mesdames et messieurs : {a} contre {b}, et les vues explosent.',relu:false},
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-reclamant+le-plan-de-carriere',texte:'{a} réclame, {b} calcule. Deux façons de monter, un seul combat.',relu:false},
  {media:'coin-rouge',situation:'affiche',si:'voix:le-timide+bruyant',texte:'{a} se taira, {b} parlera pour deux. On parie lequel dira « merci » en premier.',relu:false},
  {media:'la-pesee',situation:'affiche',si:'voix:laigri+le-bon-client',texte:'{a} se plaint des bourses, {b} remercie Split. On a comparé les deux contrats.',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:*+linterprete',texte:'{a} a encore provoqué {b}. {b} n’a pas répondu : il ne l’a pas lu.',relu:false},
  /* Les scénarios que le terrain écrit : la pionnière (n° 32) et la guerre de l'année (n° 20). */
  {media:'cage-hebdo',situation:'lendemain',si:'pionniere',texte:'Pour la première fois, Split a placé un combat féminin en tête d’affiche : {a} contre {b}. La carte n’a pas souffert de ce choix.',relu:false},
  {media:'coin-rouge',situation:'lendemain',si:'pionniere',texte:'Première soirée de Split menée par un combat féminin. {a} et {b} ont ouvert la porte, on est fans.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'guerre',texte:'{a} et {b} ont fait la guerre pendant {round} rounds. Deux combattants heureux, une salle debout.',relu:false},
  {media:'le-plateau',situation:'lendemain',si:'guerre',texte:'La guerre de l’année, mesdames et messieurs : {a} contre {b}, {round} rounds sans un pas en arrière. Historique.',relu:false},
  /* Coin Rouge (a = le combattant français) */
  {media:'coin-rouge',situation:'affiche',si:'fr',texte:'Split met {a} en tête d’affiche pour Split {n}. Enfin. Il avait mérité sa place depuis longtemps.',relu:false},
  {media:'coin-rouge',situation:'lendemain',si:'fr',texte:'On a retrouvé {a} dans sa salle après Split {n}. Il a ramené des croissants pour tout le monde. On est fans.',relu:false},
];
/* ==== [FIN ANCRE] ==== */
