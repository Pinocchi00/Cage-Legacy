"use strict";
/* CAGE LEGACY — js/data-content.js
   Contenu narratif : origines, motivations, orientations de camp (TRAIN).
   Chargé après data-skills.js, avant engine.js. */
/* ----------------------- BACKSTORY & MOTIVATION --------------------------- */
const ORIGINS=[
  'geek persuadé{e/} que la vraie vie est un RPG en réalité augmentée : {il/elle} est juste là pour monter ses stats de force brute',
  'moqué{e/} à l\u2019école pour sa dyslexie : sur le ring, pas besoin de faire de longues phrases pour éteindre des types égocentriques',
  'très bon{ne/} élève au lycée, promis{e/} à de grandes études, qui a juste préféré la mauvaise route et les arcades ouvertes',
  'adore les balades en forêt, le chant des oiseaux et cueillir des champignons... mais préfère encore plus faire saigner des gens en cage. Pourquoi pas ?',
  '{fils/fille} de deux grands avocats d\u2019affaires réputés : n\u2019a clairement pas choisi la même méthode pour régler ses litiges',
  'a fait toute sa scolarité par correspondance sur ordinateur, en profitant pour passer six heures par jour à la salle au lieu d\u2019écouter les cours',
  'a passé son adolescence sur des jeux de combat à enchaîner les combos dans sa chambre : aujourd\u2019hui dans l\u2019octogone, les jeux vidéo c\u2019est mal',
  's\u2019est inscrit{e/} aux sports de combat uniquement pour impressionner son crush du lycée : le crush est parti, les crochets du gauche sont restés',
  '{ancien livreur/ancienne livreuse} de pizzas en scooter sous la grêle : esquiver des SUV parisiens pendant deux ans donne des réflexes hors du commun',
  'incapable de garder un travail de bureau plus de trois semaines sans avoir envie d\u2019envoyer son manager à travers une baie vitrée',
  'a commencé le combat clandestin pour rembourser un pari complètement idiot sur un match de foot un soir de fête',
  'végétarien{ne/} convaincu{e/} qui milite pour le bien-être animal, mais n\u2019a aucun problème moral à déboîter le genou d\u2019un adversaire consentant',
  'trop grand{e/} et maladroit{e/} dans la vie quotidienne, fait tomber des verres au restaurant, mais étrangement gracieux{se/} quand il s\u2019agit de mettre un K.O.',
  'viré{e/} de trois clubs de foot consécutifs pour tacles à la gorge : le coach lui a conseillé de changer de sport avant la prison',
  'vient d\u2019une fratrie de cinq énervés : à la maison, le dernier qui finissait son assiette devait défendre son steak en lutte libre',
  'a commencé le muay-thaï après s\u2019être fait voler son vélo trois fois dans la même semaine : le vélo a disparu, la rancune est éternelle',
  '{ancien serveur/ancienne serveuse} de bar de nuit qui a appris l\u2019esquive de verres brisés et le placage d\u2019ivrognes sans jamais renverser le plateau',
  'avait la flemme de trouver un vrai métier d\u2019adulte : frapper des gens en short de bain semblait être la reconversion la plus honnête',
  'insomniaque chronique qui s\u2019est dit que prendre des coups sur la mâchoire à 22h était encore la méthode la plus rapide pour trouver le sommeil',
  'banni{e/} de tous les karts et laser games de la région pour excès d\u2019agressivité injustifiée : l\u2019octogone était son ultime refuge légal',
  'a grandi dans un garage auto miteux : pour {lui/elle}, un coude dans la tempe fait le même bruit net qu\u2019un boulon de 12 qui se desserre',
  'adorait les débats houleux sur les réseaux sociaux, avant de réaliser que c\u2019est quand même beaucoup plus satisfaisant de régler ça en face à face',
  '{ancien joueur/ancienne joueuse} d\u2019échecs frustré{e/} par la lenteur des parties, a décidé d\u2019appliquer la stratégie matérialiste avec des coups de genou sautés',
  'a découvert son punch surpuissant en voulant écraser un moustique contre un mur en placo : le mur s\u2019est effondré, la vocation est née'
];

function generateContextualOrigin(f){
  const a=f.attrs;
  if(f.phys && f.phys.tags && f.phys.tags.includes('gabarit hors-norme pour la division')){
    return 'a été expulsé{e/} d\u2019une équipe de rugby pour brutalité excessive, son gabarit anormal terrifiant les adversaires comme ses coéquipiers';
  }
  if(a.durability>85 && a.fightIQ<40){
    return 'a servi d\u2019homme-cible et de sac de frappe humain pendant des années : aucune stratégie, mais une boîte crânienne qui semble taillée dans le granit';
  }
  if(a.takedown>85 && f.countryKey==='DAG'){
    return 'a passé chaque hiver de son enfance à s\u2019empoigner contre des moutons et des cousins dans la boue avant de découvrir que ce calvaire s\u2019appelait le sport de haut niveau';
  }
  if(a.submission>85 && a.power<30){
    return 'incapable d\u2019enfoncer une porte d\u2019un coup d\u2019épaule, mais connaît avec une précision diabolique cinquante manières de faire plier une hanche ou une cheville';
  }
  if(a.power>85 && a.handSpeed>80){
    return 'possède des mains d\u2019une densité anormale qui ont cassé plusieurs sacs de frappe au club avant même son seizième anniversaire';
  }
  if(a.cardio>85 && a.heart>85){
    return 'ancien{ne/} coureur{se/} de fond en altitude qui a dérivé vers le combat : son cœur bat à quarante pulsations par minute et refuse viscéralement la panique';
  }
  if(f.potential>90 && f.morale<40){
    return 'un génie brut et tourmenté qui méprise la célébrité de la cage, maintenu dans le circuit par la pression écrasante d\u2019un entourage avide d\u2019argent';
  }
  return pick(ORIGINS);
}

const MOTIVATIONS=[
  {short:'Prouver à son prof de maths de 3ème qu\u2019on peut très bien réussir sa vie sans connaître le théorème de Pythagore',drive:'confidence'},
  {short:'Payer ses amendes de stationnement impayées et son abonnement à la salle sans avoir à faire un prêt bancaire',drive:'discipline'},
  {short:'Faire regretter à son ex d\u2019avoir rompu par message en devenant champion{ne/} du monde sous les projecteurs',drive:'aggression'},
  {short:'Aime beaucoup trop la sensation d\u2019entendre le speaker hurler son nom devant dix mille personnes en furie',drive:'focus'},
  {short:'Absolument terrifié{e/} à l\u2019idée de devoir un jour remettre un costume étriqué et faire des réunions Zoom de 9h à 18h',drive:'heart'},
  {short:'Vouloir s\u2019acheter une voiture de sport ridiculement bruyante et trop basse pour les dos d\u2019âne de son quartier',drive:'confidence'},
  {short:'La satisfaction pure et saine d\u2019éteindre la lumière chez des types prétentieux qui se prennent pour des influenceurs',drive:'killer'},
  {short:'Rembourser la caution de l\u2019appartement que son colocataire a détruite lors d\u2019une fête étudiante',drive:'discipline'},
  {short:'Montrer à ses cousins arrogants qui est le vrai chef de famille lors du prochain barbecue du dimanche',drive:'aggression'},
  {short:'Accumuler assez de victoires pour que plus personne n\u2019ose lui couper la parole dans une file d\u2019attente à la poste',drive:'composure'},
  {short:'Juste là pour la prime du combat de la soirée : le reste, c\u2019est de la politique pour les journalistes',drive:'killer'},
  {short:'Le frisson d\u2019avoir survécu à quinze minutes de guerre sans avoir cédé d\u2019un millimètre : le meilleur antidépresseur au monde',drive:'heart'},
  {short:'Convaincre son banquier qu\u2019un nez cassé reste un investissement bien plus rentable qu\u2019un livret A à 3%',drive:'confidence'},
  {short:'Une phobie maladive de la défaite : préfère encore sortir sur une civière que de devoir expliquer une défaite à son coach',drive:'heart'}
];

/* --------------------- camp : 3 choix liés au sport ----------------------- */
/* chaque choix = un paquet de deltas VISIBLES et bornés par le potentiel. 
   Équilibrage parfait : Chaque style a accès à exactement 18 entraînements. */
const TRAIN=[
 // ==========================================
 // 1. GÉNÉRAUX (Accessibles à tous : 9 options)
 // ==========================================
 {t:['all'],label:'Chambre d\u2019altitude',hint:'S\u2019isoler à 3000m pour décupler les globules rouges sans épuiser les articulations.',d:[['cardio',4],['recovery',3],['morale',-5]]},
 {t:['all'],label:'Diététique ciblée',hint:'Investir dans une nutrition stricte pour alléger la coupe de poids future.',d:[['form',8],['durability',2],['discipline',2]]},
 {t:['all'],label:'Étude biomécanique',hint:'Optimiser ses angles de force via la vidéo de manière scientifique.',d:[['fightIQ',4],['adaptability',2],['form',-2]]},
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
 {t:['mma'],label:'Dirty Boxing en cage',hint:'Tenir la nuque de la main gauche, uppercut sale de la droite contre le grillage.',d:[['clinchStr',3],['hook',2],['aggression',1],['form',3]]},

 // ==========================================
 // 14. OPTIONS CROISÉES (item demandé : combler les attributs qu'aucune
 // option n'entraînait jamais pour certains styles, empêchant le niveau
 // d'approcher le potentiel sur une carrière entière — cf. audit de
 // couverture par style)
 // ==========================================
 {t:['all'],label:'Souplesse fonctionnelle',hint:'Étirements dynamiques et mobilité articulaire pour repousser les limites du corps.',d:[['flexibility',4],['adaptability',1],['form',3]]},
 {t:['boxer','kickboxer','muayThai','karate','mma'],label:'Ground and Pound basique',hint:'Apprendre à finir un combat une fois l\u2019adversaire au sol, même sans bagage de lutteur.',d:[['gnp',3],['topControl',1],['power',1],['form',2]]},
 {t:['wrestler','sambo','bjj'],label:'Pilonnage au sol',hint:'Transformer un contrôle dominant en dégâts constants, coude après coude.',d:[['gnp',3],['strength',1],['aggression',1],['form',2]]},
 {t:['boxer','kickboxer','karate','wrestler'],label:'Guerre de clinch',hint:'S\u2019accrocher au corps à corps pour étouffer la puissance adverse.',d:[['clinchStr',3],['strength',1],['composure',1],['form',2]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Défense anti-lutte',hint:'Apprendre à rester debout coûte que coûte face à un lutteur déterminé.',d:[['tdd',3],['footSpeed',1],['discipline',1],['form',2]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Bases de soumission défensive',hint:'Survivre au minimum vital une fois au sol, même sans bagage de spécialiste.',d:[['guardWork',3],['heart',1],['composure',1],['form',1]]},
 {t:['boxer','karate'],label:'Initiation à la lutte',hint:'Apprendre les bases du double-leg pour ne plus être unidimensionnel.',d:[['takedown',2],['topControl',2],['strength',1],['form',2]]},
 {t:['wrestler','sambo','bjj'],label:'Bases de striking',hint:'Ajouter un minimum de frappe pour ne pas être totalement prévisible debout.',d:[['jab',2],['cross',1],['handSpeed',1],['form',2]]},
 {t:['wrestler','sambo'],label:'Percussion improvisée',hint:'Développer un crochet et un high kick de fortune pour garder les strikers honnêtes.',d:[['hook',2],['kick',2],['footSpeed',1],['form',1]]},
 {t:['mma'],label:'Instinct du finisseur',hint:'Cultiver ce petit supplément d\u2019âme qui transforme une domination en KO.',d:[['killer',3],['confidence',1],['aggression',1],['form',2]]},
 {t:['mma'],label:'Soumissions improvisées',hint:'Ajouter un arsenal minimal au sol pour ne pas être un pur frappeur perdu par terre.',d:[['submission',2],['guardWork',2],['adaptability',1],['form',1]]},
 {t:['mma'],label:'Jeu de jambes complet',hint:'Ajouter le coup de pied à un arsenal de poings pour varier les angles d\u2019attaque.',d:[['kick',3],['footSpeed',1],['form',2]]},
 {t:['boxer','kickboxer','muayThai','karate'],label:'Soumissions de fortune',hint:'Mémoriser deux ou trois clés basiques, juste de quoi ne pas être totalement démuni au sol.',d:[['submission',2],['adaptability',1],['form',1]]},
 {t:['boxer'],label:'Ajout du jeu de jambes',hint:'Intégrer le coup de pied circulaire à un arsenal jusque-là 100% poings.',d:[['kick',3],['footSpeed',1],['form',2]]},
 {t:['kickboxer','muayThai'],label:'Double-leg improvisé',hint:'Voler une jambe entre deux échanges pour casser le rythme d\u2019un pur frappeur.',d:[['takedown',2],['strength',1],['form',1]]},
 {t:['bjj'],label:'Frappe complémentaire',hint:'Ajouter crochet, coup de pied et clinch à un jeu jusque-là exclusivement au sol.',d:[['hook',2],['kick',1],['clinchStr',1],['form',1]]}
];
/* ==== [ANCRE: LOT12_COSMETIQUE_ARENE] — thèmes visuels de l'octogone. Adapté
   pour s'intégrer à la géométrie réelle de drawArena (8 points, pas la version
   simplifiée du brouillon) — seules les couleurs de sol/rails/poteaux changent,
   la forme reste identique. Déplacé depuis ui-08-controller-arena.js (F-05,
   hygiène) : donnée pure, elle n'a jamais eu sa place au milieu du moteur de
   rendu Canvas. setArenaCosmeticTheme()/getArenaTheme() (ui-08) restent les
   seuls points d'accès en lecture/écriture. ==== */
const ARENA_THEMES=[
  {id:'classic',name:'Toile Noire (Classique)',floorColors:['#1c1710','#241d14'],railColor:'#4a3c1f',padColor:'#5C4B2E'},
  {id:'pride',name:'Toile Blanche & Bleue (Héritage)',floorColors:['#DCE2EB','#FFFFFF'],railColor:'#1A4D8F',padColor:'#B22222'},
  {id:'gold',name:'Bâche Royale (Prestige)',floorColors:['#E6B93A','#8A6A1E'],railColor:'#241D13',padColor:'#14100B'},
  {id:'neon',name:'Néons Cyberpunk',floorColors:['#0d0221','#26045c'],railColor:'#ff003c',padColor:'#00f0ff'},
  {id:'underground',name:'Béton Clandestin',floorColors:['#2a2a2a','#1a1a1a'],railColor:'#555555',padColor:'#000000'},
  {id:'crimson',name:'Arène Écarlate',floorColors:['#2a0a0a','#170505'],railColor:'#E8442F',padColor:'#1a0303'},
  /* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
     récompense exclusive de série de 7 jours (GAUNTLET_DAILY_STREAK_REWARD,
     state.js) — checkLegendUnlock('cosmetic_renegade') la rend
     sélectionnable ici sans jamais figurer dans LEGEND_UNLOCKABLES (donc
     jamais achetable). ==== */
  {id:'renegade',name:'Toile Braise du Renégat (exclusive)',floorColors:['#3a0e02','#1a0500'],railColor:'#ff5a1f',padColor:'#1a0500'},
  /* ==== [ANCRE: CORRECTIF_BANNIERE_CENDREE] — bug remonté : excl_banner_ash
     (GAUNTLET_EXCLUSIVE_OFFERS, state.js) était vendu comme "thème
     d'octogone" mais n'avait aucune entrée ici, donc aucun moyen de le
     sélectionner après achat. Id aligné sur celui de l'offre (banner_ash)
     pour matcher le checkLegendUnlock('excl_'+t.id) ajouté ci-dessous
     (ui-07-contracts-legacy-screens.js). ==== */
  {id:'banner_ash',name:'Bannière Cendrée (exclusive)',floorColors:['#180404','#0c0202'],railColor:'#7a1f16',padColor:'#0c0202'}
  /* ==== [FIN ANCRE] ==== */
];
