"use strict";
/* ==== [ANCRE: P10_T1_MATCHMAKERS] — Monde lot 45 T1 ==== */
/** Les huit matchmakers des organisations du monde vivant. Chaque organisation a
 *  un matchmaker nommé, une manière ('acheteur' | 'formateur' | 'prudent') qui
 *  influence ses actions, et une phrase signature.
 *  Les noms validés par Anthony : Ruud Verbeek (MMA Korner), Siobhan Kerr (Knuckle Gate).
 *  Les autres sont des propositions crédibles selon le pays de l'organisation,
 *  jamais un nom de personne réelle du MMA. Textes relu:false. */
const MGMT_MATCHMAKERS={
  'split':{nom:'Jean-Michel Delatour',maniere:'formateur',phrase:"On ne vole pas l'avenir, on le construit.",relu:false},
  'garden-of-blood':{nom:'Marcus Varela',maniere:'acheteur',phrase:"Split achète. Nous, on signe les vedettes.",relu:false},
  'mma-korner':{nom:'Ruud Verbeek',maniere:'formateur',phrase:"Split achète. Nous, on forme.",relu:false},
  'ultimate-rim':{nom:'Tahlia Brennan',maniere:'formateur',phrase:"Chaque jeune a sa chance. La nôtre, c'est de la leur donner.",relu:false},
  'fighting-pacific-championship':{nom:'Hideki Tanaka',maniere:'prudent',phrase:"La patience bâtit les dynasties. La précipitation les détruit.",relu:false},
  'organisation-6':{nom:'Siobhan Kerr',maniere:'acheteur',phrase:"Les meilleures combattantes méritent les plus gros contrats.",relu:false},
  'organisation-7':{nom:'Karim Al-Mansour',maniere:'acheteur',phrase:"L'image fait vendre. Le talent fait rester.",relu:false},
  'organisation-8':{nom:'Rodrigo Valença',maniere:'prudent',phrase:"Un lourd qui tient la route vaut dix espoirs qui s'envolent.",relu:false},
};
/* ==== [FIN ANCRE] ==== */

/** Phrases de piques dans la presse, par manière (au moins 3 par manière).
 *  relu:false. */
const MGMT_MATCHMAKER_PIQUES={
  acheteur:[
    "Il paie pour l'ego, pas pour le spectacle. — {matchmaker}, {org}",
    "Son chéquier est ouvert, son projet est vide. — {matchmaker}, {org}",
    "Acheter des noms, c'est facile. Les faire gagner, c'est une autre histoire. — {matchmaker}, {org}",
    "Il croit qu'un contrat signe une carrière. Il se trompe. — {matchmaker}, {org}",
  ],
  formateur:[
    "On ne forme pas des champions pour les voir partir. — {matchmaker}, {org}",
    "Son gymnase est une usine à espoirs, son bureau une porte tournante. — {matchmaker}, {org}",
    "Former, c'est perdre du temps. Lui, il en a fait un business. — {matchmaker}, {org}",
    "Il parle de patience. Ses combattants, eux, n'ont que l'urgence. — {matchmaker}, {org}",
  ],
  prudent:[
    "Il attend que les autres fassent le travail, puis il ramasse. — {matchmaker}, {org}",
    "Prudent ? Non. Paralysé. La différence se voit au classement. — {matchmaker}, {org}",
    "Il ne prend pas de risques. Il ne prend pas de titres non plus. — {matchmaker}, {org}",
    "Son silence fait plus de bruit que ses soirées. — {matchmaker}, {org}",
  ],
};
const MGMT_MATCHMAKER_PIQUES_RELU=false;

/** Phrases par raison de rivalité (au moins 3 par raison). relu:false.
 *  Raisons : 'pris' (combattant pris), 'agent' (agent libre disputé),
 *  'meme-soir' (soirée le même soir), 'parti' (combattant parti chez elle),
 *  'voisin' (voisinage au classement), 'pique' (pique dans la presse). */
const MGMT_RIVALITE_RAISONS_PHRASES={
  pris:[
    "Elle t'a pris {combattant}, l'agent libre que tu voulais.",
    "{combattant} a signé chez elle. Tu l'avais en vue depuis des mois.",
    "Elle a fait une offre qu'il ne pouvait pas refuser. Pour {combattant}.",
    "Le dossier {combattant} était sur ton bureau. Il est sur le sien maintenant.",
  ],
  agent:[
    "Vous couriez après le même agent libre. Elle a gagné la course.",
    "L'agent libre que tu ciblais a choisi son camp. Pas le tien.",
    "Deux offres sur la table. La sienne a pesé plus lourd.",
  ],
  'meme-soir':[
    "Elle a posé sa soirée le même soir que la tienne. À {ville}.",
    "Même week-end, deux cartes. La sienne a mangé ton public.",
    "Collision frontale : votre soirée, la sienne. Même date.",
  ],
  parti:[
    "{combattant} est parti chez elle. Il avait encore un an de contrat.",
    "Tu l'as fait grandir. Elle l'a fait signer. {combattant} a choisi.",
    "Un de tes piliers a fait ses valises. Direction : son organisation.",
  ],
  voisin:[
    "Tu viens de passer devant elle. Un point de popularité d'écart.",
    "Elle te talonne au classement. La guerre de position a commencé.",
    "À un rang l'une de l'autre. Chaque soirée compte double.",
  ],
  pique:[
    "Sa dernière sortie dans la presse te vise nommément. Elle ne cache plus son jeu.",
    "Une pique signée {matchmaker}. La presse en a fait un titre.",
    "Il a dit ce que tout le monde pensait. Tout haut. Contre toi.",
  ],
};
const MGMT_RIVALITE_RAISONS_RELU=false;
/* ==== [FIN ANCRE] ==== */
