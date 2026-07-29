"use strict";
/* CAGE LEGACY — js/data-content.js
   Contenu narratif : origines, motivations, orientations de camp (TRAIN).
   Chargé après data-skills.js, avant engine.js. */
/* ----------------------- BACKSTORY & MOTIVATION --------------------------- */
const ORIGINS=[
 // Tes idées adaptées à l'âge (15/16 ans)
 'a fugué de sa campagne pour la capitale, s\u2019est retrouvé piégé dans un réseau de combats clandestins pour survivre, et y a pris goût',
 'possède une carrure si effrayante pour son âge qu\u2019un manager véreux l\u2019a sorti du lycée pour en faire une machine à cash',
 
 // Délinquance, foyers et rue
 'a été renvoyé de quatre collèges différents pour bagarre avant qu\u2019un éducateur ne le traîne de force dans une salle de sport',
 'a grandi dans les foyers de l\u2019État, où savoir frapper le premier était la seule règle pour ne pas se faire écraser',
 'a passé son adolescence à organiser des combats à mains nues dans des parkings abandonnés pour impressionner son grand frère',
 's\u2019est réfugié dans les sports de combat pour canaliser une hyperactivité sévère qui menaçait de le faire finir en prison',
 'a simulé son âge avec de faux papiers pour pouvoir entrer dans le circuit des combats adultes dès ses quinze ans',
 'a été repéré par hasard par un coach en train d\u2019assommer trois racketteurs à la sortie de son lycée',
 'a refusé l\u2019emprise des gangs de son quartier en s\u2019enfermant quatorze heures par jour à la salle pour ne penser qu\u2019à la frappe',

 // Famille, prodiges et environnement
 'est un enfant prodige couvé par un père tyrannique qui l\u2019entraîne comme un soldat spartiate depuis qu\u2019il sait marcher',
 'vient d\u2019une famille déchirée par les dettes et a compris très tôt que son corps était sa seule véritable porte de sortie',
 'enfant de diplomates, a fugué de sa pension dorée par rejet viscéral du confort et de l\u2019hypocrisie bourgeoise',
 'a grandi dans l\u2019ombre d\u2019un père ancien combattant tombé dans l\u2019oubli, jurant très jeune de laver le nom de sa famille',
 's\u2019est mis au combat par pure nécessité de survie après s\u2019être retrouvé seul à la rue à l\u2019âge de quatorze ans',
 'brutalisé pendant toute son enfance à cause de son bégaiement, a fini par découvrir que la violence n\u2019avait pas besoin de mots',
 'passait ses nuits à regarder des cassettes de combats clandestins dans sa chambre d\u2019ado en rêvant de brutalité, jusqu\u2019à franchir le pas',
 'n\u2019a jamais rien réussi à l\u2019école et voit la cage comme la seule et unique alternative au chômage de longue durée'
];

const MOTIVATIONS=[
 // Tes ajouts
 {short:'Cherche à détruire ses adversaires avec violence pour combler un profond complexe d\u2019infériorité',drive:'killer'},
 {short:'C\u2019était soit le lycée général, soit la cage. Le choix a été vite fait',drive:'confidence'},

 // Motivations de jeunesse (Adolescence / Preuve de soi)
 {short:'Prouver à ses parents qu\u2019il n\u2019est pas le "bon à rien" qu\u2019ils lui ont toujours décrit',drive:'aggression'},
 {short:'Sortir sa famille de la misère avant même d\u2019avoir l\u2019âge légal pour passer le permis de conduire',drive:'heart'},
 {short:'Gagner assez d\u2019argent pour payer les frais médicaux et protéger son petit frère',drive:'composure'},
 {short:'Une soif de reconnaissance maladive, nourrie par la quête du buzz sur les réseaux sociaux',drive:'focus'},
 {short:'Refuse l\u2019avenir d\u2019employé de bureau qu\u2019on lui promettait et veut marquer l\u2019Histoire jeune',drive:'confidence'},
 {short:'Canaliser une rage sourde et inexpliquée qui lui donne envie de tout casser depuis l\u2019enfance',drive:'aggression'},
 {short:'Rembourser ses avocats et se sortir d\u2019un dossier judiciaire lourd qui pèse sur sa jeunesse',drive:'discipline'},
 {short:'Détruire méthodiquement l\u2019ego des adultes arrogants qui le prennent de haut à cause de son âge',drive:'killer'},
 {short:'Besoin pathologique de ressentir la douleur physique pour se sentir vivant et ancré dans le réel',drive:'heart'},

 // Motivations martiales et tactiques (Génériques à tous les styles)
 {short:'Suivre à la lettre les enseignements d\u2019un vieux coach qui est sa seule véritable figure paternelle',drive:'discipline'},
 {short:'Analyser la peur dans les yeux de ses adversaires pour essayer de comprendre ses propres démons',drive:'fightIQ'},
 {short:'Échapper à son quartier : l\u2019octogone est littéralement son seul et unique ticket de sortie',drive:'adaptability'},
 {short:'Cherche l\u2019immortalité précoce : devenir le plus jeune champion de l\u2019histoire pour qu\u2019on ne l\u2019oublie jamais',drive:'focus'},
 {short:'Racheter les erreurs de son adolescence en prouvant qu\u2019il est capable de respecter des règles strictes',drive:'composure'},
 {short:'Approche la bagarre comme un jeu d\u2019échecs macabre où chaque mouvement de l\u2019adversaire est calculé avec froideur',drive:'fightIQ'},
 {short:'Simplement pour l\u2019argent de poche, car détruire des gens dans une cage paie infiniment mieux que de faire la plonge',drive:'adaptability'},
 {short:'Une haine viscérale de la défaite : il préfère littéralement se laisser casser un membre plutôt que d\u2019abandonner',drive:'heart'}
];
/* --------------------- camp : 3 choix liés au sport ----------------------- */
/* chaque choix = un paquet de deltas VISIBLES et bornés par le potentiel. */
const TRAIN=[
 {t:['all'],label:'Sparring dur',hint:'On encaisse pour progresser',d:[['composure',3],['hook',2],['morale',-8],['form',6]]},
 {t:['all'],label:'Repos & analyse vidéo',hint:'Récupérer, comprendre',d:[['fightIQ',3],['adaptability',2],['morale',10],['form',-3]]},
 {t:['all'],label:'Prépa physique lourde',hint:'Le corps avant tout',d:[['strength',2],['cardio',3],['explosiveness',2],['morale',-6],['form',5]]},
 {t:['all'],label:'Camp d\u2019altitude',hint:'Cardio de fer',d:[['cardio',4],['recovery',2],['heart',2],['morale',-9],['form',4]]},
 {t:['all'],label:'Travail mental',hint:'La tête froide gagne',d:[['composure',3],['focus',3],['confidence',2],['morale',6]]},
 {t:['all'],label:'Nutrition & sommeil',hint:'Les fondations invisibles',d:[['recovery',3],['discipline',2],['morale',8],['form',-2]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Mitaines & timing',hint:'Affûter la frappe',d:[['jab',2],['cross',2],['handSpeed',2],['footSpeed',1],['form',3]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Puissance de frappe',hint:'Chercher le KO',d:[['power',3],['hook',2],['killer',2],['morale',-4]]},
 {t:['muayThai','kickboxer'],label:'Travail de clinch',hint:'Genoux, coudes, projections',d:[['clinchStr',3],['strength',2],['gnp',1]]},
 {t:['wrestler','sambo','mma'],label:'Drilling d\u2019amenées',hint:'Imposer le sol',d:[['takedown',3],['topControl',2],['strength',1],['footSpeed',-1]]},
 {t:['wrestler','sambo'],label:'Contrôle & ground and pound',hint:'Écraser du dessus',d:[['topControl',2],['gnp',3],['power',1],['form',3]]},
 {t:['bjj','sambo'],label:'Rolling technique',hint:'Le sol comme un échiquier',d:[['submission',3],['guardWork',2],['flexibility',2]]},
 {t:['bjj'],label:'Chasse à la soumission',hint:'Finir par le cou',d:[['submission',3],['killer',2],['gnp',1],['form',-2]]},
 {t:['wrestler','sambo','mma','bjj'],label:'Défense de lutte',hint:'Ne plus jamais tomber',d:[['tdd',3],['fightIQ',2],['cardio',1]]},
 {t:['mma','karate'],label:'Jeu de jambes & angles',hint:'Toucher sans être touché',d:[['footSpeed',3],['fightIQ',2],['jab',1]]},
 {t:['mma'],label:'Enchaînements complets',hint:'Lier debout et sol',d:[['adaptability',3],['cross',1],['takedown',1],['submission',1],['form',3]]},
 {t:['boxer'],label:'Sac lourd & double-end ball',hint:'Précision et volume',d:[['jab',2],['handSpeed',2],['cardio',1],['form',2]]},
 {t:['karate'],label:'Kata & vitesse de déplacement',hint:'La forme au service du fond',d:[['footSpeed',3],['composure',2],['fightIQ',1]]},
 {t:['muayThai'],label:'Coups de tibias sur troncs',hint:'Endurcir la frappe basse',d:[['kick',3],['durability',2],['morale',-3]]},
 {t:['kickboxer'],label:'Combos pieds-poings',hint:'Alterner sans temps mort',d:[['kick',2],['handSpeed',2],['adaptability',1]]},
 {t:['wrestler'],label:'Chain wrestling',hint:'Ne jamais lâcher la prise',d:[['takedown',2],['topControl',2],['cardio',1],['form',2]]},
];
