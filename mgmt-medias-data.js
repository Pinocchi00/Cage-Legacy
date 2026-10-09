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
  {media:'cage-hebdo',situation:'affiche',texte:'{a} et {b} sont en tête d’affiche de {org} {n}, en {cat}. Qui va gagner ?',relu:false},
  {media:'cage-hebdo',situation:'affiche',texte:'La carte principale de {org} {n} commence par {a} contre {b}. Un combat sans surprise.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',texte:'{a} a battu {b} à {org} {n}, au round {round}. Il monte dans sa division.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'finition',texte:'{a} a fini le combat contre {b} au round {round}. Le résultat est clair.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'dec',texte:'{a} gagne aux points contre {b}, après {round} rounds. Le public voulait plus de spectacle.',relu:false},
  /* Sources Proches */
  {media:'sources-proches',situation:'affiche',texte:'{a} contre {b} sera en tête d’affiche de {org} {n}. Plusieurs sources le disent.',relu:false},
  {media:'sources-proches',situation:'affiche',texte:'Info : {a} et {b} sont sur la même carte à {org} {n}. On saura tout à la pesée.',relu:false},
  /* Clé de Bras (majuscules appliquées à l’affichage) */
  {media:'cle-de-bras',situation:'lendemain',si:'ko1',texte:'{a} BAT {b} EN UN ROUND : VOYEZ LA RÉACTION DES FANS',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'surprise',texte:'{b} PERD FACE À {a} : LES FANS SONT CHOQUÉS',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'serie',texte:'{a} GAGNE ENCORE : VOICI POURQUOI IL FAUT LE SUIVRE',relu:false},
  {media:'cle-de-bras',situation:'lendemain',si:'dec',texte:'{b} PARLE APRÈS SA DÉFAITE : SA RÉPONSE VA VOUS SURPRENDRE',relu:false},
  /* La Pesée */
  {media:'la-pesee',situation:'rebook',texte:'{a} se bat de nouveau cinq semaines après un KO. La médecin de la commission est prête à en parler. {org} ne répond pas.',relu:false},
  {media:'la-pesee',situation:'rebook',texte:'{a} remonte dans la cage cinq semaines après son KO. Qui l’a décidé ? On ne sait pas.',relu:false},
  /* Tableau Noir */
  {media:'tableau-noir',situation:'lendemain',si:'finition',texte:'{a} finit le combat au round {round}. {b} suivait son plan, puis tout a changé en quelques secondes.',relu:false},
  {media:'tableau-noir',situation:'lendemain',si:'dec',texte:'{a} gagne aux points, sur {rounds} rounds. Il n’a pris aucun risque.',relu:false},
  {media:'tableau-noir',situation:'lendemain',texte:'{b} perd au round {round}. Il a laissé son adversaire faire ce qu’il voulait.',relu:false},
  /* Micro Tendu (question, réponse) */
  {media:'micro-tendu',situation:'lendemain',si:'serie',texte:'Q. {a}, ta série, comment tu la vis ? — R. Je dors beaucoup. Je mange mal.',relu:false},
  {media:'micro-tendu',situation:'lendemain',texte:'Q. {a}, tu as eu peur ce soir ? — R. Avant, oui. Pendant, non. Pas le temps.',relu:false},
  {media:'micro-tendu',situation:'lendemain',texte:'Q. {a}, ton plat préféré avant une pesée ? — R. Celui que je n’ai pas le droit de manger.',relu:false},
  /* Le Plateau */
  {media:'le-plateau',situation:'affiche',texte:'Mesdames et messieurs, {org} {n} sera historique. {a} contre {b}. Un seul gagnant.',relu:false},
  {media:'le-plateau',situation:'affiche',texte:'Le combat de l’année : {a} contre {b}, à {org} {n}. Ne le ratez pas.',relu:false},
  {media:'le-plateau',situation:'lendemain',texte:'Un grand moment : {a} a battu {b} à {org} {n}. C’est historique.',relu:false},
  /* Le Forum */
  {media:'le-forum',situation:'lendemain',si:'dec',texte:'vol. VOL. VOOOL. les juges n’ont rien compris',relu:false},
  {media:'le-forum',situation:'lendemain',si:'ko1',texte:'{a} est le meilleur et vous n’êtes pas prêts',relu:false},
  {media:'le-forum',situation:'lendemain',si:'surprise',texte:'{b} est fini, qu’il arrête, rendez l’argent à {org}',relu:false},
  {media:'le-forum',situation:'affiche',texte:'qui a fait cette affiche ? {a} contre {b}, c’est du remplissage',relu:false},
  /* La presse du pays (a = le combattant de ce pays) */
  {media:'presse-du-pays',situation:'affiche',si:'etranger',texte:'(Presse nationale — {pays}, traduit) Notre {a} combat à {org} {n}. Tout le pays va regarder, à toute heure.',relu:false},
  {media:'presse-du-pays',situation:'lendemain',si:'etranger',texte:'(Presse nationale — {pays}, traduit) Notre {a} a gagné en France. Les organisations françaises connaissent maintenant son nom.',relu:false},
  {media:'presse-du-pays',situation:'lendemain',si:'etrangerPerd',texte:'(Presse nationale — {pays}, traduit) Défaite pour notre {a}. L’organisation française lui a donné un adversaire trop fort.',relu:false},
  /* Quand deux voix se rencontrent (document des voix §4) : la tension de l'affiche. */
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-metteur-en-scene+le-metronome',texte:'{a} provoque {b} depuis trois semaines. {b} ne répond jamais. Ça ne va pas durer.',relu:false},
  {media:'cle-de-bras',situation:'affiche',si:'voix:le-sans-filtre+le-fataliste',texte:'{a} S’EN PREND À {b} : LA RÉPONSE GLACÉE QUE PERSONNE N’ATTENDAIT',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:le-bavard-de-la-cage+le-signeur',texte:'{a} parle quinze minutes devant {b}, qui n’écoute pas. le feuilleton de la semaine',relu:false},
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-mechant-de-catch+le-clan',texte:'{a} a touché un sujet très sensible pour {b}. {b} ne dit plus rien. C’est le combat le plus attendu de la saison.',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:le-prophete+le-prophete',texte:'deux prophètes sur la même affiche : {a} et {b} disent le contraire. l’un des deux a tort',relu:false},
  {media:'tableau-noir',situation:'affiche',si:'voix:le-violent-heureux+le-lutteur-de-fac',texte:'{a} veut se battre debout, {b} veut aller au sol. Quelqu’un va crier au vol samedi.',relu:false},
  {media:'le-plateau',situation:'affiche',si:'voix:linfluenceur+le-vieux-de-la-vieille',texte:'L’ancienne école contre la nouvelle : {a} contre {b}. Tout le monde regarde.',relu:false},
  {media:'cage-hebdo',situation:'affiche',si:'voix:le-reclamant+le-plan-de-carriere',texte:'{a} réclame, {b} calcule. Deux façons de monter, un seul combat.',relu:false},
  {media:'coin-rouge',situation:'affiche',si:'voix:le-timide+bruyant',texte:'{a} se taira, {b} parlera pour deux. Qui dira « merci » le premier ?',relu:false},
  {media:'la-pesee',situation:'affiche',si:'voix:laigri+le-bon-client',texte:'{a} se plaint des bourses, {b} remercie {org}. On a comparé les deux contrats.',relu:false},
  {media:'le-forum',situation:'affiche',si:'voix:*+linterprete',texte:'{a} a encore provoqué {b}. {b} n’a pas répondu : il ne l’a pas lu.',relu:false},
  /* Les scénarios que le terrain écrit : la pionnière (n° 32) et la guerre de l'année (n° 20). */
  {media:'cage-hebdo',situation:'lendemain',si:'pionniere',texte:'Pour la première fois, {org} met un combat féminin en tête d’affiche. {a} contre {b}. La soirée a très bien marché.',relu:false},
  {media:'coin-rouge',situation:'lendemain',si:'pionniere',texte:'Première soirée de {org} avec un combat féminin en tête. {a} et {b} ont ouvert la voie. On est fans.',relu:false},
  {media:'cage-hebdo',situation:'lendemain',si:'guerre',texte:'{a} et {b} ont fait la guerre pendant {round} rounds. Deux combattants contents, une salle debout.',relu:false},
  {media:'le-plateau',situation:'lendemain',si:'guerre',texte:'La guerre de l’année : {a} contre {b}, {round} rounds sans reculer. C’est historique.',relu:false},
  /* Coin Rouge (a = le combattant français) */
  {media:'coin-rouge',situation:'affiche',si:'fr',texte:'{a} est enfin en tête d’affiche de {org} {n}. Il le méritait depuis longtemps.',relu:false},
  {media:'coin-rouge',situation:'lendemain',si:'fr',texte:'On a retrouvé {a} dans sa salle après {org} {n}. Il a apporté des croissants pour tout le monde. On est fans.',relu:false},
];
/* ==== [FIN ANCRE] ==== */
