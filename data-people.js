"use strict";
/* CAGE LEGACY — js/data-people.js
   ============================================================================
   Registre humain — données pures, AUCUNE fonction d'écran ici (Loi
   d'architecture CLAUDE.md : state.js/engine.js pour la logique, ui-0X pour
   le rendu). Ce fichier fournit les POOLS depuis lesquels state.js mint des
   `Person` (ancre PERSON_REGISTRY) : coachs, salles, agents, directeurs,
   journalistes. Uniquement des littéraux statiques — aucune dépendance de
   chargement (contrairement à personEnsure(), state.js, qui lui dépend de
   engine.js pour l'identité des personnes générées à la volée, ex. les
   sparrings, via COUNTRIES/FIRST_M/FIRST_F/makeName). Les personnes NOMMÉES ci-dessous (coachs,
   salles, agents, directeurs, journalistes) sont écrites à la main,
   jamais générées : Loi 1 (identifiabilité) exige un détail concret par
   personne, qu'aucun générateur de type Madlibs ne produit de façon fiable.

   ==== [ANCRE: DATA_PEOPLE_V3] — créé pour le Plan V3 « L'Humanité », LOT 0
   §4.1. Repris depuis ui-04-faith-arcade-screens.js SANS RÉÉCRITURE :
   FAITH_AGENTS, FAITH_DIRECTORS, FAITH_DIRECTOR_REFUS,
   FAITH_GYM_NEWCOMER_NICKS, FAITH_JOURNALIST_NAMES gardent exactement leurs
   noms et leur forme d'origine (aucun appelant existant à casser) — les
   nouveaux pools (FAITH_COACHES, FAITH_GYMS, FAITH_AGENT_ROSTER) sont
   ajoutés à côté, pas à la place.
   ============================================================================ */

const FAITH_AGENTS={
  requin:{id:'requin',label:'Le Requin',cut:0.18},
  stratege:{id:'stratege',label:'Le Stratège',cut:0.10},
  fidele:{id:'fidele',label:'Le Fidèle',cut:0}
};

/* ==== [ANCRE: DATA_PEOPLE_AGENTS_V3] — P05a : "Le Stratège" n'est qu'un
   surnom d'archétype, pas une identité. 8 agents nommés, chacun rattaché à
   l'un des 3 archétypes mécaniques ci-dessus (le comportement de
   négociation ne change pas, seul le visage change) — un joueur qui
   recommence une carrière ne retombe pas systématiquement sur le même
   agent. `archetype` référence une clé de FAITH_AGENTS. */
const FAITH_AGENT_ROSTER=[
  {id:'ag_okafor',firstName:'Chidi',lastName:'Okafor',archetype:'requin',ck:'NG',
   trait:'A fait signer trois champions du monde avant de te trouver — il ne prend que les carrières qui peuvent lui rapporter gros.'},
  {id:'ag_moreau',firstName:'Camille',lastName:'Moreau',archetype:'requin',ck:'FR',
   trait:'Ancienne avocate du sport, reconvertie après avoir vu trop de combattants signer des contrats qu’ils ne comprenaient pas — elle négocie comme au tribunal.'},
  {id:'ag_takahashi',firstName:'Ren',lastName:'Takahashi',archetype:'stratege',ck:'JP',
   trait:'Tient un tableur avec la trajectoire de carrière de chacun de ses clients sur dix ans — il refuse un combat qui casse la courbe, même bien payé.'},
  {id:'ag_dubois',firstName:'Antoine',lastName:'Dubois',archetype:'stratege',ck:'FR',
   trait:'Ancien matchmaker d’organisation régionale, connaît tous les styles des adversaires possibles avant de proposer quoi que ce soit.'},
  {id:'ag_reed',firstName:'Marcus',lastName:'Reed',archetype:'fidele',ck:'US',
   trait:'A gardé le même premier client pendant quinze ans, jusqu’à sa retraite — c’est sa seule référence, et il la répète à qui veut l’entendre.'},
  {id:'ag_ramirez',firstName:'Lucia',lastName:'Ramirez',archetype:'fidele',ck:'MX',
   trait:'A commencé comme kinésithérapeute de salle avant de devenir agent — elle refuse encore les combats si le corps du combattant n’est pas prêt.'},
  {id:'ag_volkov',firstName:'Yegor',lastName:'Volkov',archetype:'requin',ck:'RU',
   trait:'Représente aussi deux boxeurs et un lutteur olympique — le MMA n’est qu’une ligne de son portefeuille, ce qui se sent dans ses priorités.'},
  {id:'ag_walsh',firstName:'Niamh',lastName:'Walsh',archetype:'fidele',ck:'IE',
   trait:'A repris l’agence de son père à sa mort, avec la liste de clients — certains la voient encore comme "la fille de", elle en a fait un moteur.'}
];

/* ==== [ANCRE: DATA_PEOPLE_COACHES_V3] — P10 : pool de 20+ coachs (24
   livrés), chacun avec spécialité, palmarès réel ("qui il a mené et
   jusqu'où" — c'est le "pourquoi lui"), un défaut réel, un coût, une
   exigence quand il refuse certains profils. specialty ∈ {frappe, lutte,
   soumission, cardio, dur_au_mal, mental} — lu par le filtre de légitimité
   (LOT 2, scr_faith_coach_choice). cost en k$ (même unité que f.earnings). */
const FAITH_COACHES=[
  {id:'co_belhadj',firstName:'Karim',lastName:'Belhadj',nickname:null,specialty:'frappe',
   palmares:'A mené deux combattants jusqu’au rang national, aucun plus loin.',
   flaw:'Ne jure que par le kickboxing hollandais — un lutteur pur s’ennuie chez lui.',
   cost:12,requirement:null},
  {id:'co_nakamura',firstName:'Ren',lastName:'Nakamura',nickname:'Sensei',specialty:'soumission',
   palmares:'Ceinture noire de jiu-jitsu brésilien, a formé un champion continental en soumissions.',
   flaw:'Refuse d’entraîner quiconque n’a pas au moins deux ans de tapis derrière lui.',
   cost:18,requirement:'2 ans de pratique du sol minimum'},
  {id:'co_petrova',firstName:'Ioana',lastName:'Petrova',nickname:null,specialty:'lutte',
   palmares:'Ancienne lutteuse olympique, jamais entraîné un frappeur pur de sa carrière.',
   flaw:'Impose un programme de lutte à tout le monde, même aux boxeurs.',
   cost:20,requirement:null},
  {id:'co_okonkwo',firstName:'Ifeanyi',lastName:'Okonkwo',nickname:'Le Mur',specialty:'dur_au_mal',
   palmares:'A mené un combattant jusqu’au titre continental en misant tout sur l’encaissement.',
   flaw:'Sa méthode use le corps plus vite que la moyenne — tu le sentiras après 30 ans.',
   cost:15,requirement:null},
  {id:'co_ferreira',firstName:'Bruno',lastName:'Ferreira',nickname:null,specialty:'soumission',
   palmares:'Trois champions du monde formés dans son académie, aucun perdu par soumission depuis dix ans.',
   flaw:'Cher, et il le sait — il ne négocie jamais son cachet.',
   cost:45,requirement:'palmarès pro d’au moins 8 victoires'},
  {id:'co_dvalishvili',firstName:'Nika',lastName:'Dvalishvili',nickname:null,specialty:'lutte',
   palmares:'A mené un combattant amateur jusqu’à la signature professionnelle en dix-huit mois.',
   flaw:'Débutant lui-même comme coach — ses méthodes ne sont pas encore éprouvées au sommet.',
   cost:6,requirement:null},
  {id:'co_lindqvist',firstName:'Erik',lastName:'Lindqvist',nickname:null,specialty:'cardio',
   palmares:'Préparateur physique d’un champion continental connu pour n’avoir jamais fléchi au 3e round.',
   flaw:'Son programme est brutal — les combattants qui le quittent parlent souvent d’épuisement.',
   cost:16,requirement:null},
  {id:'co_haddad',firstName:'Yasmine',lastName:'Haddad',nickname:null,specialty:'mental',
   palmares:'Psychologue du sport, a suivi un champion du monde à travers deux défaites et un retour au sommet.',
   flaw:'Ne travaille jamais les attributs physiques — uniquement la tête.',
   cost:14,requirement:null},
  {id:'co_silva',firstName:'Rogerio',lastName:'Silva',nickname:'Trovão',specialty:'frappe',
   palmares:'A mené un combattant du niveau régional jusqu’au titre du monde en cinq ans.',
   flaw:'Style tout-ou-rien : sous sa main, la défense passe après la puissance.',
   cost:38,requirement:'au moins une victoire par finition cette année'},
  {id:'co_martins',firstName:'Duda',lastName:'Martins',nickname:null,specialty:'soumission',
   palmares:'Ancienne compétitrice de submission grappling, jamais entraîné en MMA complet avant toi.',
   flaw:'Vient tout juste de passer côté coaching — encore en train d’apprendre le métier.',
   cost:8,requirement:null},
  {id:'co_thompson',firstName:'Grace',lastName:'Thompson',nickname:null,specialty:'lutte',
   palmares:'A mené deux lutteurs universitaires jusqu’au professionnel, aucun jusqu’au titre.',
   flaw:'Ignore largement le jeu debout — chez elle, tout ramène au tapis.',
   cost:11,requirement:null},
  {id:'co_kobayashi',firstName:'Sora',lastName:'Kobayashi',nickname:null,specialty:'dur_au_mal',
   palmares:'Ancien combattant lui-même, retraité sur une série de sept victoires consécutives par arrêt médical infligé.',
   flaw:'Ne croit pas à la défense — pour lui, le meilleur bouclier reste l’attaque.',
   cost:22,requirement:null},
  {id:'co_kravets',firstName:'Olena',lastName:'Kravets',nickname:null,specialty:'cardio',
   palmares:'A remis sur pied trois combattants jugés "finis" physiquement après 33 ans.',
   flaw:'Ne prend que des combattants déjà expérimentés — elle refuse les débutants.',
   cost:19,requirement:'au moins 25 ans'},
  {id:'co_adeyemi',firstName:'Tunde',lastName:'Adeyemi',nickname:'Le Pasteur',specialty:'mental',
   palmares:'Ancien pasteur de quartier devenu coach mental, a stabilisé un champion connu pour ses sautes de moral.',
   flaw:'Mélange ouvertement religion et préparation — certains combattants s’en trouvent mal à l’aise.',
   cost:10,requirement:null},
  {id:'co_castillo',firstName:'Rafael',lastName:'Castillo',nickname:null,specialty:'frappe',
   palmares:'A formé un finisseur connu pour ses arrêts au premier round — sept KO d’affilée sous sa main.',
   flaw:'N’a jamais mené personne au-delà de trois rounds sans finition — mauvais en cas de décision.',
   cost:24,requirement:null},
  {id:'co_johansen',firstName:'Lars',lastName:'Johansen',nickname:null,specialty:'lutte',
   palmares:'Ancien lutteur olympique, jamais entraîné un frappeur — c’est écrit noir sur blanc dans son contrat type.',
   flaw:'Refuse catégoriquement d’adapter sa méthode à un style qui n’est pas le sien.',
   cost:26,requirement:'style lutte ou MMA complet uniquement'},
  {id:'co_diallo',firstName:'Mariama',lastName:'Diallo',nickname:null,specialty:'soumission',
   palmares:'Championne amateur de judo reconvertie, a mené un combattant jusqu’au titre régional par soumission.',
   flaw:'Encore jeune dans le métier — sa liste de clients reste courte.',
   cost:9,requirement:null},
  {id:'co_park',firstName:'Ji-ho',lastName:'Park',nickname:null,specialty:'cardio',
   palmares:'Préparateur d’athlètes olympiques reconverti au MMA il y a cinq ans, deux champions continentaux à son actif.',
   flaw:'Cachet élevé, et une liste d’attente — pas toujours disponible tout de suite.',
   cost:34,requirement:'palmarès pro d’au moins 5 victoires'},
  {id:'co_barros',firstName:'Elisa',lastName:'Barros',nickname:null,specialty:'dur_au_mal',
   palmares:'A mené un combattant réputé fragile du menton jusqu’à une série de huit victoires sans KO subi.',
   flaw:'Sa méthode ralentit nettement la progression offensive — tu deviens dur à toucher, pas dangereux.',
   cost:17,requirement:null},
  {id:'co_boateng',firstName:'Kwame',lastName:'Boateng',nickname:null,specialty:'frappe',
   palmares:'Ancien champion amateur de boxe anglaise, a formé un combattant jusqu’au titre national en boxe pure.',
   flaw:'Néglige totalement la lutte — un adversaire qui amène au sol le prend toujours par surprise.',
   cost:13,requirement:null},
  {id:'co_hansen',firstName:'Frida',lastName:'Hansen',nickname:null,specialty:'mental',
   palmares:'A accompagné un combattant à travers une suspension et un retour au sommet deux ans plus tard.',
   flaw:'Pose des questions difficiles sur ta vie hors de la cage — pas tout le monde veut ce miroir.',
   cost:12,requirement:null},
  {id:'co_essien',firstName:'Kofi',lastName:'Essien',nickname:'Le Roc',specialty:'dur_au_mal',
   palmares:'A entraîné un combattant connu pour n’avoir jamais été mis KO en quarante-et-un combats professionnels.',
   flaw:'Exigeant à l’extrême — sa salle a vu passer beaucoup de combattants qui n’ont pas tenu le rythme.',
   cost:29,requirement:'discipline ≥ 60'},
  {id:'co_moreno',firstName:'Valentina',lastName:'Moreno',nickname:null,specialty:'lutte',
   palmares:'Championne panaméricaine de lutte libre, a formé sa première signature professionnelle l’an dernier.',
   flaw:'Débutante côté coaching, encore en train de construire sa réputation.',
   cost:7,requirement:null},
  {id:'co_westbrook',firstName:'Harold',lastName:'Westbrook',nickname:'Old School',specialty:'frappe',
   palmares:'Coach depuis trente ans, a formé quatre champions dans les années où le sport se cherchait encore.',
   flaw:'Ses méthodes datent d’une autre époque — certaines analyses vidéo modernes lui échappent.',
   cost:21,requirement:null}
];

/* ==== [ANCRE: DATA_PEOPLE_GYMS_V3] — a. "La salle comme lieu" (P01/P10) :
   8 à 10 salles (10 livrées), chacune avec ville, réputation, spécialité,
   coach principal (référence FAITH_COACHES par id), 3 à 6 sparrings
   potentiels (noms de départ — worldTick/LOT 2 les font vivre), et une
   culture en une phrase. Rejoindre une salle est un choix de carrière. */
const FAITH_GYMS=[
  {id:'gym_forge',name:'La Forge',city:'Marseille',ck:'FR',reputation:'régionale',specialty:'dur_au_mal',
   coachId:'co_belhadj',sparringSeeds:3,
   culture:'On y entre pour apprendre à encaisser, on en ressort en ayant appris à ne plus avoir peur.'},
  {id:'gym_kumite',name:'Kumite Academy',city:'Tokyo',ck:'JP',reputation:'nationale',specialty:'soumission',
   coachId:'co_nakamura',sparringSeeds:4,
   culture:'Le silence y est une règle non écrite : on parle avec le corps, jamais avec la bouche.'},
  {id:'gym_krepost',name:'Krepost',city:'Moscou',ck:'RU',reputation:'internationale',specialty:'lutte',
   coachId:'co_petrova',sparringSeeds:5,
   culture:'La salle a produit plus de champions olympiques de lutte que de combattants MMA — ça se sent au premier entraînement.'},
  {id:'gym_ironwall',name:'Iron Wall Gym',city:'Lagos',ck:'NG',reputation:'régionale',specialty:'dur_au_mal',
   coachId:'co_okonkwo',sparringSeeds:3,
   culture:'La devise est peinte au-dessus du ring : "Ils frapperont fort. Reste debout."',},
  {id:'gym_teamferreira',name:'Team Ferreira',city:'Rio de Janeiro',ck:'BR',reputation:'internationale',specialty:'soumission',
   coachId:'co_ferreira',sparringSeeds:6,
   culture:'Trois champions du monde s’y sont entraînés en même temps une année — l’ambiance n’a jamais retrouvé ce niveau depuis.'},
  {id:'gym_severny',name:'Severny Club',city:'Tbilissi',ck:'GE',reputation:'régionale',specialty:'lutte',
   coachId:'co_dvalishvili',sparringSeeds:3,
   culture:'Jeune salle, peu de moyens, mais une génération entière de lutteurs prometteurs qui montent ensemble.'},
  {id:'gym_arctic',name:'Arctic Performance',city:'Stockholm',ck:'RU',reputation:'nationale',specialty:'cardio',
   coachId:'co_lindqvist',sparringSeeds:4,
   culture:'Salle de préparation physique avant tout — on y vient pour tenir la distance, pas pour apprendre un coup.'},
  {id:'gym_mindset',name:'Mindset Lab',city:'Casablanca',ck:'FR',reputation:'régionale',specialty:'mental',
   coachId:'co_haddad',sparringSeeds:3,
   culture:'Pas de sac de frappe dans le hall d’entrée — un bureau, deux fauteuils. La cage vient après.'},
  {id:'gym_trovao',name:'Trovão MMA',city:'Curitiba',ck:'BR',reputation:'nationale',specialty:'frappe',
   coachId:'co_silva',sparringSeeds:4,
   culture:'On y entre frappeur, on en ressort finisseur — ou on ne reste pas longtemps.'},
  {id:'gym_westbrook',name:'Westbrook Boxing & MMA',city:'Chicago',ck:'US',reputation:'nationale',specialty:'frappe',
   coachId:'co_westbrook',sparringSeeds:5,
   culture:'Les photos aux murs datent de trente ans, mais les gants qui y pendent sont d’hier.'}
];

const FAITH_DIRECTORS=[
  {name:'Mourad',lastName:'Benali',archetype:'comptable',grants:'chiffres',refuses:'base',counter:'prime_resultat',
   trait:'A géré les comptes de l’organisation pendant dix ans avant d’en prendre la tête — il ne voit un combattant qu’à travers son rendement.'},
  {name:'Vince',lastName:'Caruso',archetype:'showman',grants:'spectacle',refuses:'ennuyeux',counter:'montee_carte',
   trait:'Ancien promoteur de catch reconverti au MMA — pour lui, un combat qui ne se vend pas n’existe pas.'},
  {name:'Odette',lastName:'Fontaine',archetype:'loyaliste',grants:'ancien',refuses:'nouveau',counter:'contrat_long',
   trait:'Dirige l’organisation fondée par son père — elle garde ses vétérans même quand ils déclinent.'},
  {name:'Silva',lastName:'Barreto',archetype:'requin',grants:'rien',refuses:'tout',counter:'revanche',
   trait:'A racheté trois petites organisations en cinq ans — pour lui, un combattant est un actif, rien de plus.'},
  {name:'Karl',lastName:'Ostberg',archetype:'ancien',grants:'finisseur',refuses:'decisionneur',counter:'prime_finition',
   trait:'Ancien champion lui-même, retraité sur un KO — il n’a jamais digéré de voir un combat aller aux juges.'},
  {name:'Nadia',lastName:'Kassab',archetype:'technocrate',grants:'grille',refuses:'ecart',counter:'clause_titre',
   trait:'A informatisé le classement de son organisation avant tout le monde — elle ne discute jamais un chiffre.'},
  {name:'Ruben',lastName:'Alarcon',archetype:'patriarche',grants:'excuse',refuses:'humiliation',counter:'domicile',
   trait:'Considère chaque combattant sous contrat comme un fils ou une fille — jusqu’à ce qu’il se sente trahi.'}
];

const FAITH_DIRECTOR_REFUS={
  comptable:'Les chiffres ne le permettent pas.',
  showman:'Vous ne faites pas encore parler de vous.',
  loyaliste:"Vous n'êtes pas encore d'ici.",
  requin:'Il n’y a rien à gagner pour lui, là-dedans.',
  ancien:'Il attend une finition, pas une décision.',
  technocrate:'La grille ne vous positionne pas encore là.',
  patriarche:'Vous n’avez pas encore mérité cette confiance.'
};

const FAITH_GYM_NEWCOMER_NICKS=['Le Nouveau','La Relève','Le Croc','Le Silencieux','L’Affamé','Le Guetteur'];

/* ==== [ANCRE: DATA_PEOPLE_JOURNALISTS_V3] — 8 journalistes nommés (le
   système en tirait déjà un par carrière, cf. faithEnsureJournalist(),
   ui-04 V2-33 — repris à l'identique, juste déplacé). Chacun rattaché à un
   média de FAITH_PRESSE_MEDIAS (data-faith-content.js) et porteur d'un
   trait qui pilotera son ton (LOT 7). */
const FAITH_JOURNALIST_NAMES=['Théo Vasseur','Inès Duplantier','Karim Belaïd','Sacha Moreno','Léa Fontaine','Marcus Webb','Nadia Cherif','Owen Blackwood'];
const FAITH_JOURNALIST_TRAITS={
  'Théo Vasseur':'Couvre le MMA depuis le tout premier gala amateur qu’il ait vu — se souvient de tout le monde, ne pardonne rien.',
  'Inès Duplantier':'Ancienne combattante amateur elle-même — lit un combat différemment de ceux qui n’ont jamais mis les gants.',
  'Karim Belaïd':'Célèbre pour ses pronostics presque toujours faux — et pour ne jamais l’admettre en interview.',
  'Sacha Moreno':'Spécialiste des statistiques, méfiant envers tout ce qui ressemble à une "narrative" plutôt qu’à un chiffre.',
  'Léa Fontaine':'A construit sa réputation sur un seul scoop, un scandale de poids qu’elle a été la première à sortir.',
  'Marcus Webb':'Voix la plus écoutée de la division chez les anglophones — un mot de lui pèse sur une carrière entière.',
  'Nadia Cherif':'Toujours du côté du négligé, du outsider — se méfie viscéralement des favoris.',
  'Owen Blackwood':'Ancien coach reconverti à la plume — analyse plus qu’il ne raconte, ce qui déplaît autant que ça informe.'
};

/* ==== [ANCRE: DATA_PEOPLE_TRAITS_V3] — state.js (personMint(), ancre
   PERSON_REGISTRY) pioche ici le `bio.trait` d'un sparring ou d'un
   combattant générique du roster (rôles sans pool nommé dédié) : réutilise
   ORIGINS/MOTIVATIONS de data-content.js pour origin/past (déjà écrits
   pour ce même besoin côté création de combattant, Loi 1), et ce pool
   court et concret pour trait — jamais une phrase générique qui
   s'appliquerait à n'importe qui (test de substitution, §1.3). */
const PERSON_TRAITS=[
  'Ne parle presque jamais avant un round, et jamais après une défaite.',
  'Rit à chaque coup encaissé — personne n’a jamais su si c’était du courage ou de la provocation.',
  'Tient un carnet où il note un détail sur chaque adversaire croisé à l’entraînement.',
  'N’a jamais manqué une seule séance en cinq ans, même malade.',
  'Change de musique d’entrée à chaque combat — jamais deux fois la même.',
  'Refuse de serrer la main d’un adversaire tant que le combat n’a pas eu lieu.',
  'Garde toujours ses gants d’amateur dans son sac, "pour ne pas oublier d’où il vient".',
  'A un rituel précis avant chaque sparring, immuable depuis ses débuts.',
  'Parle trois langues et change selon à qui il s’adresse dans la salle.',
  'N’a jamais posté une seule photo de sa vie privée — personne à la salle ne sait où il habite.',
  'Collectionne les tickets de chaque gala où il est monté, même perdu.',
  'A un humour noir qui met mal à l’aise les nouveaux venus de la salle.',
  'Prie avant chaque entraînement, discrètement, dans un coin du tapis.',
  'Se souvient du nom de chaque personne qu’il a un jour affrontée, même en amateur.',
  'Ne s’entraîne jamais un dimanche — question de principe, jamais expliqué.'
];
