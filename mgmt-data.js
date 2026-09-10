"use strict";
/* CAGE LEGACY — mgmt-data.js
   ============================================================================
   LOT 1 MODE MANAGEMENT — données du bureau. Données pures : aucun accès DOM,
   aucune logique, aucune dépendance (chargeable avec les autres data-*.js,
   avant engine.js et state/*.js).

   Contenu : la seule voix branchée en Lot 1 (Leïla Malika), le format des
   échanges (texte + deux à quatre réponses, CDC §6), les cinq raisons de se
   battre, les cinq déclencheurs de la règle du bureau (addendum §4) et les
   constantes de cadrage (CDC §9).

   Textes d'auteur repris à l'identique de docs/LES-SIX-VOIX-v1.1.md.
   Règle absolue (AGENTS.md) : aucune réplique n'est rédigée ici. Partout où
   il manque une réplique, l'emplacement est vide (text:null) et marqué par
   un libellé [RÉPLIQUE MANQUANTE — ...] destiné à l'auteur.
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT1_DONNEES] — Lot 1 mode management : socle de données
   du bureau (voix, échanges, raisons, déclencheurs, cadrage). ==== */
const MGMT_ORG='Split';
const MGMT_PILE_MIN=8;
const MGMT_PILE_MAX=15;
const MGMT_ROSTER_MIN=40;
const MGMT_ROSTER_MAX=60;
const MGMT_FACTS_MAX=10;

/* Les cinq déclencheurs du passage niveau 1 → niveau 2, addendum §4.
   Exhaustifs en v1 : pas un de plus. Seul le premier peut survenir en Lot 1
   (proposition de combat portée par Leïla) ; les quatre autres sont listés
   pour mémoire et serviront aux lots suivants. */
const MGMT_TRIGGERS=[
  'propose',
  'refuse',
  'request',
  'injury',
  'agent_call',
];

/* ==== [ANCRE: MGMT_LOT1B_NOMS_RESERVES] — Lot 1b : le générateur de
   combattants ne produit jamais un prénom ou un nom appartenant aux six
   personnages (docs/LES-SIX-VOIX-v1.1.md : Leïla Malika, Jean-Michel
   Delatour, Rebecca Lasso, Stephen Tarpit, Clara Saint-Marie, Komma Chrome
   / Roy Duplantis) ni aux cinq légendes (docs/LES-CINQ-LEGENDES-v1.1.md :
   Baptiste Mukoku, Cajun Saint-Roc, Mark Sima, Pratello, Raoul De La
   Santos). Comparaison exacte sur le prénom et sur le nom de famille.
   Pratello, surnom sans état civil, est réservé comme prénom. ==== */
const MGMT_EXCLUDED_FIRST=['Leïla','Jean-Michel','Rebecca','Stephen','Clara','Komma','Roy','Baptiste','Cajun','Mark','Pratello','Raoul'];
const MGMT_EXCLUDED_LAST=['Malika','Delatour','Lasso','Tarpit','Saint-Marie','Chrome','Duplantis','Mukoku','Saint-Roc','Sima','De La Santos'];
/* ==== [FIN ANCRE] ==== */

/* Seule voix branchée en Lot 1 : Leïla Malika, 28 ans, adjointe matchmaker
   (docs/LES-SIX-VOIX-v1.1.md §1). Aucun des cinq autres personnages ne figure
   ici. */
const MGMT_SPEAKERS={
  leila:{id:'leila',name:'Leïla Malika',role:'Adjointe matchmaker'},
};

/* Format d'un échange (CDC §6) : des lignes d'une seule voix, puis deux à
   quatre réponses. Les réponses du joueur sont des choses qu'il dirait :
   elles appartiennent à l'auteur. En Lot 1, chaque réponse porte une
   `action` mécanique (bouton d'interface neutre, pas une réplique) et un
   `text` nul avec un emplacement marqué. */
const MGMT_EXCHANGES={
  leila_propose:{
    speaker:'leila',
    lines:[
      "Écoute chef, je sais que je m'occupe que des combats en début de carte mais là tu dois me croire, je pense que j'ai un combat parfait pour l'organisation, ça va être un combat incroyable, il va te plaire, s'il te plaît laisse-moi le placer dans les plus gros combats.",
    ],
    replies:[
      {id:'accept',action:'accept',text:"Allez j'accepte, j'apprécie ta conviction et le match-up, je te fais confiance sur ce coup, j'espère un beau combat ahah."},
      {id:'refuse',action:'refuse',text:"Non désolé vraiment, sur cette carte j'ai déjà mes combats en tête, j'ai pas de place en plus ni de combats à déclasser mais une prochaine fois peut être."},
    ],
  },
  leila_refused:{
    speaker:'leila',
    lines:[
      "Pas de soucis, j'accepte parce que c'est vous mais retenez bien le nom des deux combattants parce qu'à mon avis ils vont monter au classement.",
    ],
    replies:[
      {id:'close',action:'close',text:null,empty:'[RÉPLIQUE MANQUANTE — Leïla réagit à un refus : prendre acte]'},
    ],
  },
};

/* Les cinq raisons de se battre (docs/LES-SIX-VOIX-v1.1.md + complément
   SPLIT-CONTEXTE-DEPART.md §9). Attribuées à la création d'un dossier (§3,
   niveau 2 du CDC). Textes et effets repris du document, sans réécriture. */
const MGMT_RAISONS=[
  {id:'necessite',label:'La nécessité',
   text:"J'ai dû commencer à combattre car je devais gagner de l'argent, sinon je n'avais pas de quoi me payer un toit sur la tête.",
   rule:"Il accepte tout ce qui paye. Court préavis, catégorie au-dessus, adversaire dangereux. Il ne refuse jamais. Et il ne t'en voudra pas de l'avoir utilisé — c'est ce qui rend le joueur complice."},
  {id:'passion',label:'La passion',
   text:"Je l'ai fait juste par passion. Depuis tout petit je regarde des sports de combat, ça m'a toujours plu, je me suis dit pourquoi pas essayer.",
   rule:"Il veut des combats intéressants, pas des combats payants. Il accepte un adversaire trop fort si le nom est beau, et refuse un combat sûr et ennuyeux. Il ne s'arrêtera jamais de lui-même. C'est le profil de la last dance."},
  {id:'hasard',label:'Le hasard',
   text:"C'est un peu malgré moi. Je m'étais inscrit pour accompagner un pote à l'université, et apparemment j'avais du talent. J'ai saisi ma chance, ça fait de l'argent, ça me fait connaître, et ce n'est pas un métier traditionnel, donc ça me va.",
   rule:"Du talent, aucune faim. Il négocie de haut et refuse ce qui ne l'arrange pas. Et il peut arrêter du jour au lendemain — une mauvaise défaite, une blessure, une meilleure opportunité, et il s'en va sans drame. Le joueur investira sur lui et le perdra bêtement."},
  {id:'addiction',label:"L'addiction",
   text:"Le combat est la seule chose qui l'empêche d'y penser. Les semaines d'entraînement, les camps, le temps passé sur les tatamis — c'est ce qui le tient éloigné. Ça lui sauve la vie petit à petit.",
   rule:"Il accepte pour rester en camp, pas pour l'argent ni pour le nom. Et l'inactivité le détruit. Le laisser sans combat pendant des mois n'est pas neutre : c'est une décision qui a un coût. C'est la seule raison où ne rien proposer est le mauvais choix."},
  {id:'reconversion',label:'La reconversion',
   text:"Un ancien sportif de combat — un lutteur, par exemple — qui n'a jamais réussi à s'imposer dans sa discipline. Il a rejoint une salle de MMA qui l'a propulsé bien plus vite que la précédente, ses premiers combats amateurs ont révélé un vrai talent.",
   rule:"Il a déjà connu l'échec ailleurs et il ne veut pas le revivre. Il refuse ce qui pourrait le renvoyer à ce qu'il était, et accepte ce qui prouve qu'il avait raison de changer."},
];
/* ==== [FIN ANCRE] ==== */
