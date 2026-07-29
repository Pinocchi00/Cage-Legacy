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
/* --------------------- camp : 3 choix liés au sport ----------------------- */
/* chaque choix = un paquet de deltas VISIBLES et bornés par le potentiel. 
   Équilibrage parfait : Chaque style a accès à exactement 18 entraînements. */
const TRAIN=[
 // ==========================================
 // 1. GÉNÉRAUX (Accessibles à tous : 9 options)
 // ==========================================
 {t:['all'],label:'Guerre de la salle',hint:'Laisser quelques neurones sur le tapis pour l\u2019endurcissement.',d:[['durability',3],['heart',2],['power',1],['morale',-10],['form',5]]},
 {t:['all'],label:'Analyse paranoïaque',hint:'Traquer le moindre tic de l\u2019adversaire jusqu\u2019à la nausée.',d:[['fightIQ',3],['focus',2],['composure',1],['morale',2],['form',-2]]},
 {t:['all'],label:'Conditionnement soviétique',hint:'Pousser des pneus de tracteur dans la boue. Brutal mais efficace.',d:[['strength',3],['cardio',3],['explosiveness',2],['morale',-8],['form',6]]},
 {t:['all'],label:'Sauna de l\u2019enfer',hint:'Apprendre à survivre en état de déshydratation avancée.',d:[['discipline',3],['recovery',2],['heart',2],['morale',-12],['form',2]]},
 {t:['all'],label:'Gourou psychologique',hint:'Payer un type pour te convaincre que tu es un prédateur alpha.',d:[['confidence',3],['composure',2],['focus',1],['morale',10],['form',-3]]},
 {t:['all'],label:'Ascèse monacale',hint:'Riz blanc, sommeil à 20h et suppression totale de vie sociale.',d:[['recovery',3],['discipline',3],['cardio',1],['morale',-4],['form',2]]},
 {t:['all'],label:'Sparring dans le noir',hint:'Éteindre les lumières pour ne se fier qu\u2019au bruit des pas et aux respirations.',d:[['adaptability',3],['focus',2],['fightIQ',1],['morale',-5],['form',2]]},
 {t:['all'],label:'Bain de glace & Cupping',hint:'Médecine barbare pour survivre à l\u2019inflammation généralisée de tes articulations.',d:[['recovery',3],['durability',2],['composure',1],['morale',5],['form',-2]]},
 {t:['all'],label:'Coupeur de poids pro',hint:'Engager un tortionnaire pour perdre 8 kilos en trois jours de sueur et de larmes.',d:[['discipline',3],['cardio',2],['heart',1],['morale',-8],['form',3]]},

 // ==========================================
 // 2. STRIKING PUR (4 styles : 3 options)
 // ==========================================
 {t:['boxer','kickboxer','muayThai','karate'],label:'Destruction de sac',hint:'Taper sur un objet en cuir lourd pour expier sa rage et alourdir sa frappe.',d:[['power',3],['aggression',2],['hook',1],['morale',4],['form',2]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Chirurgie du foie',hint:'Le KO qui ne s\u2019invente pas. Viser le bon organe pour débrancher le système.',d:[['killer',3],['fightIQ',2],['cross',1],['form',1]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Renforcement des phalanges',hint:'Micro-fracturer les os des mains pour les calcifier et frapper comme une brique.',d:[['durability',3],['power',2],['jab',1],['morale',-4],['form',3]]},

 // ==========================================
 // 3. STRIKING + MMA (5 styles : 3 options)
 // ==========================================
 {t:['boxer','kickboxer','muayThai','karate','mma'],label:'Cibles mouvantes',hint:'Le coach encaisse tes combos, toi tu améliores tes angles et ta fluidité.',d:[['handSpeed',3],['adaptability',2],['jab',1],['form',3]]},
 {t:['boxer','kickboxer','muayThai','karate','mma'],label:'Matador (Esquives)',hint:'L\u2019art subtil de ne pas prendre le KO du siècle en glissant la tête.',d:[['footSpeed',3],['composure',2],['fightIQ',2],['form',1]]},
 {t:['boxer','kickboxer','muayThai','karate','mma'],label:'Danse de l\u2019ombre',hint:'Shadow boxing face au miroir. Combattre un fantôme pour corriger le déséquilibre.',d:[['footSpeed',3],['focus',2],['adaptability',1],['morale',3],['form',-1]]},

 // ==========================================
 // 4. GRAPPLING PUR (3 styles : 3 options)
 // ==========================================
 {t:['wrestler','sambo','bjj'],label:'Torture par compression',hint:'Placer le sternum sur la mâchoire adverse pour lui voler son oxygène.',d:[['strength',3],['topControl',2],['aggression',1],['morale',-3],['form',4]]},
 {t:['wrestler','sambo','bjj'],label:'Anaconda de sueur',hint:'Passer des soumissions sur des partenaires couverts d\u2019huile pour simuler le round 3.',d:[['submission',3],['cardio',2],['focus',1],['morale',-2],['form',3]]},
 {t:['wrestler','sambo','bjj'],label:'Évasion de l\u2019enfer',hint:'Apprendre à sortir de dessous un type qui fait deux fois ton poids et qui respire mal.',d:[['heart',3],['guardWork',2],['cardio',2],['morale',-4]]},

 // ==========================================
 // 5. GRAPPLING + MMA (4 styles : 3 options)
 // ==========================================
 {t:['wrestler','sambo','bjj','mma'],label:'Arrachage de racines',hint:'Soulever de force des partenaires de 110 kilos qui refusent catégoriquement de tomber.',d:[['takedown',3],['strength',3],['cardio',1],['morale',-5],['form',4]]},
 {t:['wrestler','sambo','bjj','mma'],label:'Sprawl de survie',hint:'Jeter les hanches au sol avec la violence d\u2019un réflexe pour ne pas finir écrasé.',d:[['tdd',3],['explosiveness',2],['adaptability',1],['form',2]]},
 {t:['wrestler','sambo','bjj','mma'],label:'Échecs au sol',hint:'Ne pas forcer, glisser vers la position dominante comme un reptile vicieux.',d:[['topControl',3],['adaptability',2],['fightIQ',1],['form',1]]},

 // ==========================================
 // 6. SPÉCIFIQUES BOXE (3 options)
 // ==========================================
 {t:['boxer'],label:'Le Piston (Directs)',hint:'Répéter le même bras arrière 10 000 fois jusqu\u2019à ce que ça devienne un automatisme létal.',d:[['cross',3],['discipline',2],['focus',2]]},
 {t:['boxer'],label:'Garde Philly Shell',hint:'Rouler l\u2019épaule et cacher le menton derrière pour faire glisser les pires parpaings.',d:[['composure',3],['footSpeed',2],['durability',1],['form',1]]},
 {t:['boxer'],label:'Marteau-piqueur court',hint:'Travailler les crochets vicieux à l\u2019intérieur de la garde, là où l\u2019arbitre ne voit rien.',d:[['hook',3],['handSpeed',2],['power',1],['form',3]]},

 // ==========================================
 // 7. SPÉCIFIQUES KICKBOXER (3 options)
 // ==========================================
 {t:['kickboxer'],label:'Combo mitraillette',hint:'Lier un enchaînement poings avec un low kick à une vitesse que le cerveau adverse ne traite pas.',d:[['kick',3],['handSpeed',2],['adaptability',1],['form',3]]},
 {t:['kickboxer'],label:'Le K-1 classique',hint:'Bloquer statique et rendre coup pour coup. On laisse la fuite aux autres, on prend le centre.',d:[['power',3],['kick',2],['durability',1],['morale',-3],['form',4]]},
 {t:['kickboxer'],label:'Teep de destruction',hint:'Planter la plante du pied dans l\u2019estomac pour stopper net l\u2019avancée et vider les poumons.',d:[['kick',3],['fightIQ',2],['strength',1],['form',2]]},

 // ==========================================
 // 8. SPÉCIFIQUES MUAY THAÏ (3 options)
 // ==========================================
 {t:['muayThai'],label:'Le supplice du Plum',hint:'Accepter de se faire tirer la nuque vers le sol en boucle pour maîtriser le corps-à-corps.',d:[['clinchStr',3],['strength',2],['cardio',1],['morale',-4]]},
 {t:['muayThai'],label:'Destruction des nerfs',hint:'Taper dans des battes entourées de mousse pour anesthésier complètement le tibia.',d:[['kick',3],['durability',3],['morale',-6],['form',3]]},
 {t:['muayThai'],label:'Coudes de boucher',hint:'Affûter l\u2019os sur les paos pour chercher systématiquement l\u2019ouverture de l\u2019arcade.',d:[['killer',3],['clinchStr',2],['handSpeed',1],['form',2]]},

 // ==========================================
 // 9. SPÉCIFIQUES KARATÉ (3 options)
 // ==========================================
 {t:['karate'],label:'Chorégraphie mortelle',hint:'Travailler la forme, la ligne et le timing absolu dans le silence le plus glaçant.',d:[['fightIQ',3],['footSpeed',2],['composure',2],['morale',2]]},
 {t:['karate'],label:'Explosion linéaire',hint:'Traverser la largeur de la cage en un bond pour surprendre le menton.',d:[['explosiveness',3],['cross',2],['handSpeed',1],['form',3]]},
 {t:['karate'],label:'Frappe de l\u2019aveugle',hint:'Armer sans bouger le bassin. Un high kick qui rentre dans le champ visuel au dernier millième.',d:[['kick',3],['adaptability',2],['focus',1],['morale',1],['form',1]]},

 // ==========================================
 // 10. SPÉCIFIQUES LUTTE (3 options)
 // ==========================================
 {t:['wrestler'],label:'À travers le mur',hint:'Plonger aux jambes avec une intention claire : traverser la cible, pas s\u2019arrêter dessus.',d:[['takedown',3],['explosiveness',2],['power',1],['form',4]]},
 {t:['wrestler'],label:'Broyeur de vertèbres',hint:'La soumission n\u2019est pas le but. Plier la colonne vertébrale adverse sous ton poids l\u2019est.',d:[['topControl',3],['strength',2],['killer',1],['morale',-2],['form',3]]},
 {t:['wrestler'],label:'Scramble d\u2019Université',hint:'Lutter sans oxygène, en se relevant instantanément après chaque chute comme un automate.',d:[['cardio',3],['tdd',2],['adaptability',1],['form',2]]},

 // ==========================================
 // 11. SPÉCIFIQUES SAMBO (3 options)
 // ==========================================
 {t:['sambo'],label:'Casting Punch',hint:'Un overhand volontairement affreux, balancé avec le poids mort pour masquer une prise de lutte.',d:[['cross',3],['power',2],['takedown',1],['form',3]]},
 {t:['sambo'],label:'Le briseur de chevilles',hint:'Oublier le visage. Plonger, isoler le genou et menacer les ligaments sans sommation.',d:[['submission',3],['killer',2],['explosiveness',1],['form',2]]},
 {t:['sambo'],label:'Judo des quartiers froids',hint:'Balayages secs et projections de hanche rugueuses héritées des manteaux d\u2019hiver russes.',d:[['takedown',3],['clinchStr',2],['strength',1],['morale',-3],['form',3]]},

 // ==========================================
 // 12. SPÉCIFIQUES BJJ (3 options)
 // ==========================================
 {t:['bjj'],label:'Jeu de la pieuvre',hint:'Accepter le dos au sol avec le sourire et devenir une nuisance absolue pour les articulations.',d:[['guardWork',3],['flexibility',3],['composure',1]]},
 {t:['bjj'],label:'Torture articulaire',hint:'Trouver calmement le millimètre d\u2019angle exact qui sépare la tension de la rupture du tendon.',d:[['submission',3],['fightIQ',2],['killer',1],['form',-1]]},
 {t:['bjj'],label:'Berimbolo hypnotique',hint:'Roulades complexes pour prendre le dos d\u2019un adversaire qui n\u2019a même pas compris le mouvement.',d:[['adaptability',3],['guardWork',2],['footSpeed',1],['form',1]]},

 // ==========================================
 // 13. SPÉCIFIQUES MMA HYBRIDE (3 options)
 // ==========================================
 {t:['mma'],label:'Bagarre dans la boue',hint:'Survivre aux transitions chaotiques quand tout glisse avec le sang et la sueur.',d:[['adaptability',3],['tdd',2],['topControl',1],['morale',-2],['form',3]]},
 {t:['mma'],label:'Leurre systémique',hint:'Faire semblant de savoir boxer uniquement pour forcer la garde à monter et voler une cheville.',d:[['fightIQ',3],['takedown',2],['cross',1],['focus',1]]},
 {t:['mma'],label:'Dirty Boxing en cage',hint:'Tenir la nuque de la main gauche, uppercut sale de la droite contre le grillage.',d:[['clinchStr',3],['hook',2],['aggression',1],['form',3]]}
];
