"use strict";
/* CAGE LEGACY — js/data-faith-content.js
   ============================================================================
   Corpus texte du mode MMA Faith — données pures, AUCUNE fonction d'écran
   ici. Dépend de rien (juste des littéraux JS), doit charger avant
   ui-04-faith-arcade-screens.js qui consomme ces constantes par leur nom
   d'origine, INCHANGÉ (déplacement mécanique, cf. ANCRE ci-dessous — pas
   une réécriture).

   ==== [ANCRE: DATA_FAITH_CONTENT_V3] — créé pour le Plan V3 « L'Humanité »,
   LOT 0 §0.2/§4.2. Contenu déplacé tel quel depuis
   ui-04-faith-arcade-screens.js : FAITH_DRAFT_PAGES, FAITH_DIVISION_TEXT,
   FAITH_DRAFT_OPTIONS, FAITH_GALA_PREFIX, FAITH_GALA_CITIES,
   FAITH_BUILDUP_EVENTS, FAITH_CAMPS, FAITH_INTERSAISON_POOL,
   FAITH_PERK_OFFERS, FAITH_BRANCH_EVENTS, FAITH_LIFE_EVENTS, FAITH_OATHS,
   FAITH_PRESSE_MEDIAS, FAITH_PRESSE_TITRES, FAITH_PRESSE_CORPS — mêmes
   noms de constantes, aucun appelant existant cassé. Les commentaires
   d'ancre internes à chaque bloc (FA-16, V2-23, V2-10, V2-09, V2-32...)
   restent tels quels : ils documentent CE bloc précis, pas son
   emplacement dans le fichier. ==== */

const FAITH_DRAFT_PAGES=[
  {key:null,q:'Qui êtes-vous ?'},
  /* ==== [CORRECTIF FA-16] — finalizeFaithDraft() (ui-08) appelait
     makeFighter() sans jamais passer `div` : makeFighter() (engine.js)
     tire alors la catégorie de poids AU HASARD dans DIVISIONS[gender]. Le
     mode carrière, lui, la fait choisir (scr_create, ui-06). La catégorie
     détermine la morphologie (taille/allonge) et une partie du profil de
     départ — la laisser au hasard est un oubli, pas un choix de design. */
  {key:'div',q:'Sur quelle balance montez-vous ?'},
  {key:'origin',q:'D’où venez-vous ?'},
  /* ==== [CORRECTIF FA-18] — FAITH_DRAFT_OPTIONS.style ne proposait que 4
     styles sur les 8 de STYLES (engine.js) : karaté, sambo, kickboxing et
     MMA complet en étaient absents, alors que du contenu existant (l'événement
     evt_forest_kata, spécifique au karaté) était de fait inatteignable en
     Faith. Un style unique reste écrit sur `d.style` (le champ lu par
     finalizeFaithDraft) mais réparti sur deux pages de 4 options pour tenir
     la règle des 3-4 options/écran : `field` indique le champ réel à
     renseigner quand il diffère de `key` (cf. scr_faith_draft). ==== */
  {key:'style_stand',field:'style',q:'Où avez-vous appris à frapper ?'},
  {key:'style_ground',field:'style',q:'Où avez-vous appris à finir un combat au sol ?'},
  {key:'lifestyle',q:'Quel adolescent avez-vous été ?'},
  {key:'circle',q:'Qui vous entoure ?'},
  /* ==== [ANCRE: FAITH_AGENT] — question distincte de "Qui vous entoure ?" :
     le cercle (circle) est un champ narratif déjà chargé — une douzaine
     d'événements de branche (FAITH_BRANCH_EVENTS) testent f._circle==='family'
     /'agent'/'squad'. Réutiliser ces mêmes valeurs pour désigner les 3 agents
     du document (le Requin/le Stratège/le Fidèle) aurait cassé silencieusement
     tout ce contenu existant. Question séparée, agent mécaniquement
     indépendant du cercle. ==== */
  {key:'agent',q:'Qui gère votre carrière ?'},
  {key:'personality',q:'Que donnez-vous à voir ?'},
  {key:'stable',q:'Où signez-vous votre premier contrat ?'},
  {key:null,q:'Voilà qui vous êtes.'}
];

const FAITH_DIVISION_TEXT={
  H:{
    'H-fly':'Vous ne mettrez jamais personne KO d’un seul coup. Vous ne vous arrêterez jamais non plus.',
    'H-bantam':'La vitesse est le seul luxe que la catégorie vous accorde. Ne la gâchez pas.',
    'H-feather':'Ni le plus rapide, ni le plus lourd. Il faudra être le plus complet.',
    'H-light':'La division la plus encombrée du sport. Tout le monde sait se battre.',
    'H-welter':'Assez de puissance pour finir, assez de vitesse pour ne pas se faire prendre. La plus regardée, pour cette raison.',
    'H-middle':'Le gabarit qu’on met en couverture. On y attend des champions, pas des surprises.',
    'H-lheavy':'Chaque échange peut tout changer d’un coup. Personne ne relâche vraiment sa garde.',
    'H-heavy':'Un coup, une carrière. Le vôtre ou le sien.'
  },
  F:{
    'F-straw':'La plus légère des catégories féminines. Le sport ne pardonne pas plus qu’aux autres.',
    'F-fly':'Une vitesse d’exécution qui ne laisse le temps de réfléchir à personne — ni à vous, ni en face.',
    'F-bantam':'Le juste milieu entre la vitesse et la capacité à faire mal. La catégorie reine du sport féminin.',
    'F-feather':'La plus haute catégorie encore ouverte aux femmes. Peu de monde en face, et ça se voit vite.'
  }
};

const FAITH_DRAFT_OPTIONS={
  origin:[
    ['traditional','Dojo de la discipline','Un maître obsessionnel vous a fait répéter le même jab dix mille fois, jusqu’à ce qu’il ne demande plus rien à la tête. Le prix : vous ne sortez jamais du plan prévu.'],
    ['pro_child','Fils de la maison','Votre nom remplissait la salle avant votre premier combat. Il vous a ouvert les meilleurs camps — et il vous interdit la moindre excuse le jour où ça tourne mal.'],
    ['street','École du bitume','Les vraies leçons se sont passées dans les parkings, pas sur les tatamis. La garde reste basse, le temps mort n’existe pas : ces habitudes-là ne partent jamais.'],
    ['late_bloomer','Le retardataire','Personne ne pariait un centime sur vous à seize ans. Ce qui a été arraché tard reste acquis pour de bon — la vitesse des autres, elle, ne se rattrape jamais tout à fait.']],
  style_stand:[
    ['boxer','Boxe','Des mains lourdes, des appuis, et l’art de ne pas être là où le coup arrive.'],
    ['kickboxer','Kickboxing','Les jambes aussi souvent que les mains. On vous a appris à changer de cible sans jamais changer de rythme.'],
    ['muayThai','Muay-thaï','Le corps à corps, les genoux, les coudes. La distance où les gens renoncent.'],
    ['karate','Karaté','Chaque geste répété jusqu’à l’os, jusqu’à ce que la distance devienne un réflexe plutôt qu’un calcul.']],
  style_ground:[
    ['wrestler','Lutte','Décider où le combat se passe. Debout ou au sol, mais c’est vous qui choisissez.'],
    ['bjj','Jiu-jitsu','Laisser venir, encaisser la position, et refermer la prise quand personne ne l’attend.'],
    ['sambo','Sambo','Lutte et soumission dans le même mouvement, appris là où l’un ne se pratique jamais sans l’autre.'],
    ['mma','MMA complet','Aucune discipline n’a jamais été la maison. Compétent partout, jamais brillant nulle part en particulier.']],
  lifestyle:[
    ['pro','Moine guerrier','Extinction des feux à 21h, zéro écart, zéro excuse. Les coachs vous adorent, vos amis vous ont oublié.'],
    ['balanced','Ni moine ni fêtard','Sérieux à la salle, tolérable en dehors. La voie du compromis.'],
    ['party','La vie est courte','Les sorties avant les rounds de sac. Le talent compensera — ou pas.']],
  circle:[
    ['family','Le clan','Vos parents ont réglé chaque détail avant que vous n’ayez un mot à dire. La table de la cuisine reste, aujourd’hui encore, votre vrai bureau.'],
    ['agent','Le pourcentage','Quelqu’un négociait déjà vos contrats avant que vous sachiez lacer vos gants. Il prend sa part sur chaque bourse, encore aujourd’hui.'],
    ['squad','La bande','Vos potes d’enfance vous suivent à chaque combat, bruyants et fidèles, sans jamais vraiment comprendre les règles.']],
  /* ==== [ANCRE: FAITH_AGENT] — trois profils, trois façons de remplir le
     calendrier : le Requin maximise l'argent immédiat au prix d'adversaires
     trop durs, le Stratège calibre chaque affiche pour la progression au
     classement quitte à laisser de l'argent sur la table, le Fidèle ne
     négocie jamais rien mais ne prend rien non plus. ==== */
  agent:[
    ['requin','Le Requin','Il sent l’argent avant tout le monde. Les plus grosses bourses, tôt — et des adversaires qu’il choisit toujours un cran trop costauds.'],
    ['stratege','Le Stratège','Chaque combat sert un plan. Il refuse ce qui ne fait pas progresser au classement, quitte à laisser de l’argent sur la table.'],
    ['fidele','Le Fidèle','Loyauté totale, commission nulle. Il ne sait pas négocier une bourse, mais il ne vous lâchera jamais.']],
  /* ==== [CORRECTIF FA-19] — personality n'offrait que 2 options (villain/
     humble), un binaire au milieu d'une série de choix à 3-4 options. Le
     showman existait déjà comme trait ÉMERGENT (TRAIT_NAMES.showman,
     ui-08) — de fait déjà produit par une dizaine de choix du pool
     FAITH_BRANCH_EVENTS déjà tagués traitTag:'showman' avant ce correctif,
     contrairement au constat du document source qui affirmait qu'aucun ne
     l'était (vérifié par relecture du pool actuel : 650, 662, 698, 702,
     710, 750, 803, 828, 842, 846 le portent déjà). Ce qui manquait
     réellement : le showman comme 3e option de PERSONNALITÉ dès la
     création (mécaniquement indépendant du trait émergent). ==== */
  personality:[
    ['villain','Le vilain','Chaque conférence de presse est un règlement de comptes. Ça remplit les salles.'],
    ['humble','Le taiseux','Deux phrases par interview, un mental de granit. Les puristes vous respectent, les promoteurs s’arrachent les cheveux.'],
    ['showman','Le showman','Vous vendez le combat avant de le livrer. Le public qui a payé pour un spectacle ne pardonne pas une victoire aux points sans éclat.']],
  /* ==== [ANCRE: FAITH_ECURIE_DEPART] — le premier vrai dilemme, absent
     jusqu'ici : temps de jeu contre prestige. Une salle régionale fait
     combattre souvent contre des adversaires abordables ; un camp d'élite
     fait signer plus haut, contre plus dur, avec ce que ça implique. ==== */
  stable:[
    ['regional','Une salle régionale','On vous fera combattre souvent, contre des gens de votre niveau. Vous apprendrez sur le tas, loin des caméras.'],
    ['elite','Un camp d’élite','On ne vous fera pas de cadeau : des partenaires meilleurs que vous, des affiches plus dures, et du monde qui regarde.']]
};

const FAITH_GALA_PREFIX=['AM','CL','CR','CN','CONT','URC','PCF'];

const FAITH_GALA_CITIES=['Lyon','Marseille','Osaka','Rio','Manchester','Chicago','Lagos','Séoul','Varsovie','Montréal','Le Caire','Perth'];

/* ==== [ANCRE: V3_GALA_BANDEAU] — Plan V3 LOT 6 §P09 point 2 : "un combat
   d'ouverture régional et un main event à Rio ne doivent pas se ressembler
   visuellement" — deux données déterministes par ville (même seed que
   faithGalaLabel, ui-04, pour ne jamais changer entre deux affichages du
   même gala) : la salle réelle, et la nationalité locale (pour savoir si le
   combattant est à domicile — §P09 point 3). Une ville sur trois n'a pas
   d'équivalent dans COUNTRIES (Varsovie/Montréal/Le Caire/Perth) : jamais de
   "domicile" pour un combat qui s'y tient, ce qui est correct (aucun
   combattant du roster n'est tiré de ces pays). */
const FAITH_GALA_VENUES={
  'Lyon':'Halle Tony-Garnier',Marseille:'Palais des Sports',Osaka:'Osaka-jō Hall',
  Rio:'Jeunesse Arena',Manchester:'AO Arena',Chicago:'United Center',
  Lagos:'Teslim Balogun Stadium',Séoul:'Jamsil Arena',Varsovie:'Torwar Hall',
  Montréal:'Centre Bell',
  'Le Caire':'Cairo Stadium Indoor Hall',Perth:'RAC Arena'
};
const FAITH_GALA_CITY_COUNTRY={
  Lyon:'FR',Marseille:'FR',Osaka:'JP',Rio:'BR',Manchester:'GB',Chicago:'US',
  Lagos:'NG',Séoul:'KR',Varsovie:null,Montréal:null,'Le Caire':null,Perth:null
};
/* ==== [FIN ANCRE] ==== */

const FAITH_BUILDUP_EVENTS=[
  {id:'bu_missed_weight_his',title:'Pesée ratée (la sienne)',
   text:'Il monte sur la balance en sueur, un kilo et demi au-dessus. L’organisation attend votre feu vert.',
   choices:[{label:'Accepter le catchweight, contre compensation',dv:{attente:1},money:15},
            {label:'Refuser : il perd le combat par forfait',dv:{attente:-1},director:1}]},
  {id:'bu_missed_weight_mine',title:'Pesée ratée (la vôtre)',
   text:'Le corps n’a pas suivi. La balance affiche un chiffre que personne dans votre camp ne voulait voir.',
   choices:[{label:'Assumer devant les caméras',dv:{attente:1,tension:1},morale:-8},
            {label:'Laisser l’agent gérer la communication',dv:{tension:1},director:-1}]},
  {id:'bu_promotion',title:'Promotion sur la carte',
   text:'La tête d’affiche prévue déclare forfait. Le matchmaker vous propose de monter d’un cran.',
   choices:[{label:'Accepter — plus d’attente, plus de risque',dv:{attente:2}},
            {label:'Décliner — rester là où le plan vous voulait',dv:{}}]},
  {id:'bu_faceoff_degenerates',title:'Le face-à-face dégénère',
   text:'Ce qui devait être une photo se transforme en échange de mots, puis de bousculade.',
   choices:[{label:'Rester au contact, ne pas reculer',dv:{tension:2,attente:1}},
            {label:'Laisser la sécurité s’interposer',dv:{tension:-1}}]},
  {id:'bu_viral_clip',title:'Clip viral',
   text:'Une séquence d’entraînement, sortie de son contexte, tourne en boucle depuis ce matin.',
   choices:[{label:'En rire publiquement',dv:{attente:1},morale:5},
            {label:'Demander son retrait',dv:{},director:-1}]},
  {id:'bu_coach_declaration',title:'Déclaration de son coach',
   text:'Le coach adverse promet en interview que "ça ne passera pas trois rounds".',
   choices:[{label:'Répondre publiquement',dv:{attente:1,tension:1}},
            {label:'Laisser parler',dv:{tension:-1}}]},
  {id:'bu_old_rival_speaks',title:'Un ancien adversaire prend position',
   text:'Quelqu’un que vous avez déjà affronté donne son pronostic en interview — sans vous ménager.',
   choices:[{label:'Le prendre comme un compliment',dv:{attente:1},morale:5},
            {label:'Ignorer complètement',dv:{}}]},
  {id:'bu_gym_polemic',title:'Polémique sur votre salle',
   text:'Une accusation, jamais vraiment prouvée, ressort sur les méthodes de votre salle d’entraînement.',
   choices:[{label:'Défendre votre salle publiquement',dv:{tension:1},director:-1},
            {label:'Ne pas commenter',dv:{}}]},
  {id:'bu_ticket_sales',title:'Billetterie qui explose',
   text:'Votre ville d’origine s’arrache les places pour ce combat.',
   choices:[{label:'Multiplier les apparitions locales',dv:{attente:2},morale:-5},
            {label:'Rester concentré sur le camp',dv:{attente:1}}]},
  {id:'bu_broadcaster_offer',title:'Un diffuseur veut vous en ouverture',
   text:'Une chaîne étrangère propose de vous mettre en tête de son émission d’avant-combat.',
   choices:[{label:'Accepter l’interview',dv:{attente:1},money:10},
            {label:'Décliner, rester concentré',dv:{}}]},
  {id:'bu_weighin_stare',title:'Regard au pesage',
   text:'Face à face sur la balance, il ne cligne pas des yeux. La salle retient son souffle.',
   choices:[{label:'Soutenir le regard',dv:{tension:1,attente:1}},
            {label:'Sourire et tourner la tête',dv:{tension:-1}}]},
  {id:'bu_quiet_week',title:'Une semaine sans histoire',
   text:'Aucune polémique, aucun clip, aucune déclaration. Le camp se déroule dans le silence.',
   choices:[{label:'Profiter du calme pour travailler',dv:{}},
            {label:'S’en inquiéter — le silence avant l’orage',dv:{tension:1}}]}
];

const FAITH_CAMPS=[
  {id:'thai',name:'Camp thaïlandais',cost:55,freshCost:-25,risk:0.06,attrs:['kick','clinchStr','power'],
   text:'Six semaines de tibias en sang et de genoux au corps. Vous rentrez plus dur à toucher, et bien plus dangereux de près.',
   repeatText:'Retour au même camp thaïlandais : les mêmes coachs, les mêmes exercices. Vous connaissez déjà tout ce qu’ils ont à donner.'},
  {id:'wrestling',name:'Wrestling américain',cost:45,freshCost:-22,risk:0.05,attrs:['takedown','tdd','topControl'],
   text:'Une salle universitaire où on vous jette au sol cent fois par jour jusqu’à ce que la chute devienne un réflexe.',
   repeatText:'Les mêmes lutteurs, les mêmes séries de projections. Vous connaissez déjà tout ce qu’ils ont à donner.'},
  {id:'bjj',name:'Académie brésilienne',cost:45,freshCost:-20,risk:0.04,attrs:['submission','guardWork','gnp'],
   text:'Des heures au sol, à chercher la soumission ou à survivre à celle de l’autre. Le jeu de jambes change de nature.',
   repeatText:'La même académie, les mêmes ceintures noires patientes. Vous connaissez déjà tout ce qu’ils ont à donner.'},
  {id:'boxing',name:'École de boxe',cost:40,freshCost:-15,risk:0.03,attrs:['jab','cross','hook','handSpeed'],
   text:'Un vieux club de boxe anglaise, miroirs rayés et sac lourd fatigué. Les mains sortent plus vite, et plus juste.',
   repeatText:'Le même club, le même miroir rayé. Vous connaissez déjà tout ce qu’ils ont à donner.'},
  {id:'physical',name:'Prépa physique',cost:35,freshCost:-30,risk:0.08,attrs:['cardio','strength','explosiveness','durability'],
   text:'Un préparateur qui ne connaît que le chiffre sur le chronomètre. Le corps en ressort plus fort, et vidé.',
   repeatText:'Le même préparateur, les mêmes séries à l’échec. Vous connaissez déjà tout ce qu’ils ont à donner.'},
  {id:'solo',name:'Retraite en montagne, seul',cost:20,freshCost:15,risk:0,attrs:['focus','composure','discipline'],
   text:'Personne pour vous entraîner, juste vous, le silence, et ce qu’il y a dans votre tête. Vous en redescendez plus calme.',
   repeatText:'Le même chalet, le même silence. Vous savez déjà ce que la montagne a à vous dire — mais ça continue de faire du bien.'},
];

const FAITH_INTERSAISON_POOL=[
  {id:'is_repos',categorie:'securite',weight:3,req:()=>true,
   title:'Se reposer',text:'Récupérer, souffler — mais laisser l’écurie tourner sans vous.',action:'rest'},
  {id:'is_repos_famille',categorie:'securite',weight:1,req:(f)=>(f.age||20)>=26,
   title:'Rentrer voir la famille',text:'Quelques semaines loin de la salle, loin de tout ce qui ressemble à un adversaire.',action:'rest'},
  {id:'is_repos_soin',categorie:'securite',weight:1,req:(f,F)=>(F.year||1)>1,
   title:'Soigner les vieilles douleurs',text:'Un corps de combattant accumule des dettes. Prendre le temps de les régler, une fois.',action:'rest'},
  {id:'is_repos_media',categorie:'securite',weight:1,req:(f)=>(f.hypeBonus||1)>1,
   title:'Souffler loin des caméras',text:'La popularité fatigue autant que les coups. Une intersaison sans une seule interview.',action:'rest'},
  {id:'is_sparring_top',categorie:'precision',weight:3,req:(f,F)=>!!((F.gym||[]).length),
   title:'Tourner avec son partenaire',text:'Une séance de sparring.',action:'sparring_top'},
  {id:'is_sparring_second',categorie:'precision',weight:1,req:(f,F)=>(F.gym||[]).length>=2,
   title:'Travailler avec le second partenaire',text:'Une séance de sparring.',action:'sparring_second'},
  {id:'is_sparring_video',categorie:'precision',weight:1,req:(f)=>!!f.faithNemesisId,
   title:'Étudier sa némésis en vidéo',text:'Des heures à décortiquer ses combats, jusqu’à connaître ses tics par cœur.',action:'scout_video'},
  {id:'is_sparring_style',categorie:'precision',weight:1,req:(f,F)=>!!((F.gym||[]).length),
   title:'Séance technique ciblée',text:'Une séance courte, entièrement consacrée à un seul détail du jeu.',action:'sparring_top'},
  {id:'is_camp',categorie:'puissance',weight:3,req:(f)=>(f.earnings||0)>=20,
   title:'Partir en stage',text:'Six semaines dans un camp spécialisé, à choisir sur place.',action:'camp'},
  {id:'is_camp_urgent',categorie:'puissance',weight:1,req:(f,F)=>!!f.faithNemesisId && (f.earnings||0)>=20,
   title:'Stage ciblé avant la revanche',text:'Préparer précisément ce qui vous a manqué la dernière fois.',action:'camp'},
  {id:'is_sponsor',categorie:'securite',weight:1,req:(f)=>(f.org||0)>=2,
   title:'Rencontrer un sponsor',text:'Un partenariat modeste, mais qui tombe bien.',action:'sponsor'},
  {id:'is_solo_pensee',categorie:'securite',weight:1,req:(f,F)=>(F.year||1)>=2,
   title:'Faire le point, seul',text:'Pas d’entraînement, pas de salle — juste s’asseoir avec ce que la carrière est devenue.',action:'rest'},
  {id:'is_camp_leger',categorie:'puissance',weight:1,req:(f)=>(f.earnings||0)>=20 && (f.earnings||0)<60,
   title:'Stage à petit budget',text:'Pas le camp rêvé, mais celui que le compte en banque autorise.',action:'camp'},
  {id:'is_precision_plan',categorie:'precision',weight:1,req:(f,F)=>!!((F.gym||[]).length),
   title:'Revoir le plan de jeu à la salle',text:'',action:'sparring_top'},
  {id:'is_securite_famille2',categorie:'securite',weight:1,req:(f)=>(f.morale||60)<50,
   title:'S’éloigner un peu de tout',text:'Le moral ne suit plus. Une pause, sans rien d’autre en tête.',action:'rest'},
];

/* ==== [ANCRE: CORRECTIF_PROTECT_TITLE_MORT] — bug trouvé : evt_offer_protect
   (perk 'protect_title', 50k$) promettait de réinitialiser un « compteur
   d'inactivité » qui n'existe nulle part dans le dépôt — G.f.champChampInactivity
   n'était écrit que par buyFaithPerk() et lu par aucun code. Retiré plutôt
   qu'inventé : aucune mécanique de ceinture retirée pour inactivité n'existe
   ailleurs dans le jeu à brancher dessus. ==== */
const FAITH_PERK_OFFERS=[
  {id:'evt_offer_hometown',title:'Un promoteur du coin',req:f=>(f.earnings||0)>=15&&f.org>0,
   text:'Il connaît votre nom, votre salle, le nom de votre première victime amateur. Il peut faire venir le prochain combat ici, chez vous. Ça se paie.',
   choices:[{label:'Accepter — combattre à domicile',perk:'hometown'},
            {label:'Refuser, ça ne change rien au travail',d:[['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_offer_catchweight',title:'La pesée arrangée',req:f=>(f.earnings||0)>=35&&f.org>0,
   text:'Votre manager a une idée : négocier un poids intermédiaire. L’adversaire acceptera — et arrivera vidé, à sec, sans jambes.',
   choices:[{label:'Faire signer le catchweight',perk:'catchweight'},
            {label:'Le prendre à son poids',d:[['confidence',4]],traitTag:'ascetic'}]},
  {id:'evt_offer_ped',title:'Un homme vous attend sur le parking',req:f=>(f.earnings||0)>=30,
   text:'Il ne se présente pas. Il parle de récupération, de cellule hyperbare, de « protocoles » que tout le monde utilise et que personne ne nomme. Il laisse une carte.',
   choices:[{label:'Écouter ce qu’il propose',perk:'ped',tone:'gamble'},
            {label:'Jeter la carte',d:[['discipline',5],['morale',-3]],traitTag:'ascetic'}]},
  {id:'evt_offer_tiger',title:'Une place s’est libérée',req:f=>(f.earnings||0)>=50,
   text:'Un camp thaïlandais réputé pour casser les hommes autant que les former a une place. Six semaines. On y entre entier, rarement.',
   choices:[{label:'Partir six semaines',perk:'tiger',tone:'gamble'},
            {label:'Rester à la salle',d:[['form',5]]}]},
  {id:'evt_offer_lobbying',title:'Le dîner qui compte',req:f=>(f.earnings||0)>=100,
   text:'Une table, trois costumes, personne ne parle de sport. On vous fait comprendre qu’une promotion se décide ici, pas dans la cage.',
   choices:[{label:'Payer l’addition',perk:'lobbying',tone:'gamble'},
            {label:'Partir avant le dessert',d:[['confidence',3],['morale',3]],traitTag:'rebel'}]},
  {id:'evt_offer_judges',title:'Une enveloppe, pas une question',req:f=>(f.earnings||0)>=40&&f.org>0,
   text:'On vous explique, sans jamais le dire, que les cartes des juges sont parfois écrites avant le premier round. Un cinquième de votre bourse suffirait.',
   choices:[{label:'Faire glisser l’enveloppe',perk:'judges',tone:'gamble'},
            {label:'Refuser net',d:[['heart',5],['discipline',3]],traitTag:'ascetic'}]},
  {id:'evt_offer_diet',title:'La nutritionniste',req:f=>(f.earnings||0)>=40,
   text:'Elle a fait descendre trois champions sans les vider. Elle prend cher, à l’année, et ne travaille qu’avec des gens sérieux.',
   choices:[{label:'L’engager pour la saison',perk:'diet'},
            {label:'Continuer à la sueur et au sauna',d:[['durability',2],['form',-4]]}]}
];

const FAITH_BRANCH_EVENTS=[
  {id:'evt_br_street_parking',req:f=>f._origin==='street',title:'Retour au parking',
   text:'Le terrain vague où vous vous battiez à seize ans est devenu un chantier. Un ancien vous reconnaît et vous propose « une dernière, pour la route ».',
   choices:[{label:'Remettre les mains dedans, une fois',d:[['aggression',6],['heart',4],['discipline',-8]],risk:0.35,bad:[['form',-18],['discipline',-12],['morale',-8]],traitTag:'rebel'},
            {label:'Serrer la main et repartir',d:[['composure',6],['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_br_street_family',req:f=>f._origin==='street',title:'Le petit frère du quartier',
   text:'Un gamin de la cité traîne devant la salle tous les soirs. Il ne demande rien, il regarde.',
   choices:[{label:'Lui ouvrir la porte',d:[['morale',8],['discipline',4],['form',-5]]},
            {label:'Le renvoyer chez lui',d:[['focus',5],['morale',-6]]}]},
  {id:'evt_br_dojo_master',req:f=>f._origin==='traditional',title:'Le maître est malade',
   text:'Celui qui vous a fait répéter le même jab dix mille fois ne se lève plus. Il demande à vous voir avant votre prochain camp.',
   choices:[{label:'Tout arrêter et partir le voir',d:[['fightIQ',6],['composure',6],['form',-10]],traitTag:'ascetic'},
            {label:'Envoyer un message, rester au camp',d:[['discipline',4],['morale',-10]]}]},
  {id:'evt_br_dojo_kata',req:f=>f._origin==='traditional',title:'Le retour aux formes',
   text:'Votre coach actuel trouve vos routines d’échauffement « folkloriques ». Elles viennent du dojo, et vous n’avez jamais su vous en passer.',
   choices:[{label:'Les garder, quoi qu’on en dise',d:[['discipline',6],['focus',4],['adaptability',-4]]},
            {label:'Passer à la méthode moderne',d:[['adaptability',6],['cardio',3],['composure',-3]]}]},
  {id:'evt_br_prochild_name',req:f=>f._origin==='pro_child',title:'Le nom sur l’affiche',
   text:'L’affiche du prochain gala met votre nom de famille en plus gros que votre prénom. Votre père n’a jamais combattu dans cette salle, et pourtant c’est lui qu’on vient voir.',
   choices:[{label:'Exiger que l’affiche change',d:[['confidence',7],['morale',5],['discipline',-4]],traitTag:'rebel'},
            {label:'Laisser courir et gagner',d:[['focus',6],['morale',-6]]}]},
  {id:'evt_br_late_doubt',req:f=>f._origin==='late_bloomer',title:'Le temps perdu',
   text:'Un journaliste vous rappelle en direct que les combattants de votre niveau ont commencé dix ans avant vous.',
   choices:[{label:'Le prendre comme un carburant',d:[['aggression',7],['heart',5],['composure',-5]]},
            {label:'Reconnaître le retard, et travailler',d:[['discipline',7],['fightIQ',4],['morale',-4]],traitTag:'ascetic'}]},
  {id:'evt_br_agent_cut',req:f=>f._circle==='agent',title:'La clause en petits caractères',
   text:'Votre agent a fait passer un avenant. Le pourcentage a bougé, discrètement, en sa faveur.',
   choices:[{label:'Le confronter, quitte à tout casser',d:[['confidence',6],['morale',-8]],risk:0.30,bad:[['morale',-16],['focus',-8]],traitTag:'rebel'},
            {label:'Signer et continuer à combattre',d:[['composure',5],['focus',4]]}]},
  {id:'evt_br_family_dinner',req:f=>f._circle==='family',title:'Le repas de famille',
   text:'Toute la table a un avis sur votre prochain adversaire. Personne autour n’a jamais mis un gant.',
   choices:[{label:'Écouter jusqu’au bout',d:[['morale',8],['composure',4],['focus',-5]]},
            {label:'Quitter la table',d:[['focus',7],['morale',-8]]}]},
  {id:'evt_br_squad_night',req:f=>f._circle==='squad',title:'La bande débarque',
   text:'Vos potes ont réservé une soirée pour « fêter le camp ». Le camp commence dans neuf heures.',
   choices:[{label:'Y aller une heure, pas plus',d:[['morale',7],['form',-8]],risk:0.35,bad:[['form',-20],['discipline',-10],['morale',-5]]},
            {label:'Annuler et dormir',d:[['discipline',6],['form',6],['morale',-6]],traitTag:'ascetic'}]},
  {id:'evt_br_party_relapse',req:f=>f._lifestyle==='party',title:'La vieille habitude',
   text:'Trois semaines de camp irréprochable. Ce soir, la tentation est exactement la même qu’à dix-sept ans.',
   choices:[{label:'Céder une dernière fois',d:[['morale',10],['form',-12]],risk:0.40,bad:[['form',-26],['discipline',-12],['morale',-10]]},
            {label:'Tenir',d:[['discipline',8],['confidence',4]],traitTag:'ascetic'}]},
  {id:'evt_br_pro_burnout',req:f=>f._lifestyle==='pro',title:'La machine bien huilée',
   text:'Rien à redire : sommeil, nutrition, séances. C’est justement ce que votre préparateur trouve inquiétant — vous ne vivez plus rien d’autre.',
   choices:[{label:'Continuer, la rigueur paie',d:[['discipline',6],['cardio',4],['morale',-8]],traitTag:'ascetic'},
            {label:'S’autoriser une vraie coupure',d:[['morale',12],['form',8],['discipline',-6]]}]},
  {id:'evt_br_regional_loyalty',req:f=>f._stable==='regional',title:'L’offre du gros camp',
   text:'Une structure réputée vous propose une place. Votre salle régionale vous a tout donné, et n’a pas les moyens de s’aligner.',
   choices:[{label:'Partir pour le camp d’élite',d:[['fightIQ',6],['adaptability',5],['morale',-10]],oathBreak:'homegrown'},
            {label:'Rester là où on vous a formé',d:[['morale',10],['heart',5],['fightIQ',-3]]}]},
  {id:'evt_br_elite_pecking',req:f=>f._stable==='elite',title:'La hiérarchie du camp',
   text:'Dans cette salle, vous n’êtes ni le plus fort ni le mieux payé. On vous le fait sentir à chaque round de sparring.',
   choices:[{label:'Serrer les dents et encaisser',d:[['durability',5],['heart',6],['form',-12]],risk:0.30,bad:[['form',-24],['morale',-12]]},
            {label:'Changer de partenaires d’entraînement',d:[['composure',5],['adaptability',4],['morale',-4]]}]}
,
  {id:'evt_br_dojo_belt',req:f=>f._origin==='traditional',title:'La ceinture du dojo',
   text:'On vous propose de venir remettre les ceintures aux enfants du club. Le même tatami, la même odeur, vingt ans plus tard.',
   choices:[{label:'Y passer la journée',d:[['morale',9],['composure',4],['form',-6]]},
            {label:'Décliner, le camp d’abord',d:[['focus',6],['morale',-5]],traitTag:'ascetic'}]},
  {id:'evt_br_prochild_shadow',req:f=>f._origin==='pro_child',title:'L’ombre du père',
   text:'Un ancien adversaire de votre père vous arrête dans un couloir : « Tu frappes moins fort que lui, mais tu réfléchis mieux. »',
   choices:[{label:'Prendre ça pour un compliment',d:[['fightIQ',6],['confidence',4]]},
            {label:'Le prendre très mal',d:[['aggression',8],['composure',-6]],traitTag:'rebel'}]},
  {id:'evt_br_prochild_money',req:f=>f._origin==='pro_child',title:'L’héritage encombrant',
   text:'La salle familiale coule. On vous demande de remettre de l’argent, discrètement, pour éviter la fermeture.',
   choices:[{label:'Payer sans faire de bruit',cost:25,d:[['morale',8],['discipline',3]]},
            {label:'Refuser, ce n’est plus votre histoire',d:[['focus',6],['morale',-10]],traitTag:'rebel'}]},
  {id:'evt_br_street_cops',req:f=>f._origin==='street',title:'Le contrôle',
   text:'Trois heures au commissariat pour une histoire qui ne vous concerne pas, la veille d’une séance décisive.',
   choices:[{label:'Encaisser sans rien dire',d:[['composure',7],['form',-8]],traitTag:'ascetic'},
            {label:'Hausser le ton',d:[['aggression',6],['morale',-8]],risk:0.35,bad:[['morale',-16],['discipline',-10],['form',-10]],traitTag:'rebel'}]},
  {id:'evt_br_late_body',req:f=>f._origin==='late_bloomer',title:'Un corps de trente ans',
   text:'Le kiné est formel : vos articulations ont commencé le sport dix ans trop tard, et elles vous le rappellent chaque matin.',
   choices:[{label:'Adapter tout le programme',d:[['recovery',7],['durability',4],['explosiveness',-4]]},
            {label:'Ignorer et charger la mule',d:[['power',6],['heart',4]],risk:0.40,bad:[['durability',-10],['form',-20]]}]},
  {id:'evt_br_late_proof',req:f=>f._origin==='late_bloomer',title:'La preuve par les faits',
   text:'Un podcast vous présente comme « l’exception qui confirme la règle ». Vos coachs détestent la formule.',
   choices:[{label:'La reprendre à votre compte',d:[['confidence',7],['morale',6]],traitTag:'showman'},
            {label:'Refuser l’étiquette',d:[['focus',6],['discipline',4]],traitTag:'ascetic'}]},
  {id:'evt_br_family_pressure',req:f=>f._circle==='family',title:'La peur des siens',
   text:'Votre mère a vu le dernier combat en entier. Elle ne veut plus jamais le revoir, et le dit à table.',
   choices:[{label:'Promettre d’arrêter les guerres',d:[['composure',6],['morale',6],['aggression',-6]]},
            {label:'Expliquer que c’est le métier',d:[['confidence',5],['morale',-6]]}]},
  {id:'evt_br_family_manager',req:f=>f._circle==='family',title:'Le contrat sur la table de la cuisine',
   text:'Votre oncle a « négocié » votre prochaine bourse. Le promoteur a souri poliment pendant tout l’appel.',
   choices:[{label:'Laisser la famille gérer',d:[['morale',7]],risk:0.35,bad:[['morale',-10]]},
            {label:'Reprendre la main soi-même',d:[['fightIQ',5],['discipline',4],['morale',-6]]}]},
  {id:'evt_br_agent_media',req:f=>f._circle==='agent',title:'Le plan média',
   text:'Votre agent a bloqué trois jours de tournage promotionnel en plein pic de charge. « C’est ça ou tu restes invisible. »',
   choices:[{label:'Faire le tournage',d:[['confidence',5],['form',-10]],traitTag:'showman'},
            {label:'Tout annuler et s’entraîner',d:[['form',8],['discipline',5],['morale',-6]],traitTag:'ascetic'}]},
  {id:'evt_br_agent_rival',req:f=>f._circle==='agent',title:'Le poulain d’à côté',
   text:'Vous découvrez que votre agent gère aussi un combattant de votre division, plus jeune, mieux placé.',
   choices:[{label:'Exiger l’exclusivité',d:[['confidence',6],['morale',-6]],risk:0.30,bad:[['morale',-14],['focus',-8]],traitTag:'rebel'},
            {label:'S’en servir comme motivation',d:[['aggression',5],['focus',5]]}]},
  {id:'evt_br_squad_loyalty',req:f=>f._circle==='squad',title:'Un des vôtres dérape',
   text:'Un ami d’enfance s’est battu dans un bar en se réclamant de vous. La vidéo circule.',
   choices:[{label:'Le défendre publiquement',d:[['morale',6],['composure',-8]],risk:0.35,bad:[['morale',-14],['focus',-10]],traitTag:'rebel'},
            {label:'Prendre ses distances',d:[['focus',6],['morale',-8]],traitTag:'ascetic'}]},
  {id:'evt_br_squad_ride',req:f=>f._circle==='squad',title:'Le convoi',
   text:'Toute la bande veut vous accompagner au gala, à six heures de route. Personne n’a de billet.',
   choices:[{label:'Les emmener quand même',cost:8,d:[['morale',10],['focus',-5]]},
            {label:'Partir seul avec le staff',d:[['focus',7],['morale',-7]]}]},
  {id:'evt_br_pro_science',req:f=>f._lifestyle==='pro',title:'Le laboratoire',
   text:'Une équipe universitaire veut faire de vous un cas d’étude : capteurs, prises de sang, sommeil surveillé.',
   choices:[{label:'Se prêter au protocole',d:[['cardio',5],['recovery',5],['morale',-5]]},
            {label:'Refuser d’être un sujet',d:[['composure',5],['confidence',4]],traitTag:'rebel'}]},
  {id:'evt_br_pro_isolation',req:f=>f._lifestyle==='pro',title:'La chambre d’hôtel',
   text:'Quatrième camp de l’année loin de chez vous. Tout est optimal, et personne ne vous attend le soir.',
   choices:[{label:'Tenir le protocole jusqu’au bout',d:[['discipline',7],['morale',-10]],traitTag:'ascetic'},
            {label:'Rentrer une semaine',d:[['morale',12],['form',-8]]}]},
  {id:'evt_br_balanced_choice',req:f=>f._lifestyle==='balanced',title:'Le milieu du gué',
   text:'Votre préparateur pose le constat : ni assez rigoureux pour les protocoles de pointe, ni assez relâché pour tenir sur la durée.',
   choices:[{label:'Basculer vers la rigueur totale',d:[['discipline',8],['cardio',4],['morale',-8]],traitTag:'ascetic'},
            {label:'Assumer l’équilibre',d:[['morale',8],['composure',5],['discipline',-3]]}]},
  {id:'evt_br_balanced_job',req:f=>f._lifestyle==='balanced',title:'Le travail à côté',
   text:'Le poste à mi-temps que vous gardez « au cas où » tombe en plein camp. Il faut choisir cette semaine.',
   choices:[{label:'Démissionner et tout miser',d:[['focus',7],['confidence',5]],risk:0.35,bad:[['morale',-14],['form',-10]]},
            {label:'Garder la sécurité',d:[['composure',6],['morale',4],['focus',-4]]}]},
  {id:'evt_br_balanced_friends',req:f=>f._lifestyle==='balanced',title:'Les deux vies',
   text:'Un mariage le samedi, une pesée le dimanche. Les deux comptent, et vous ne pouvez pas être entier aux deux.',
   choices:[{label:'Y aller, partir tôt',d:[['morale',7],['form',-6]]},
            {label:'S’excuser et rester au camp',d:[['discipline',6],['morale',-7]],traitTag:'ascetic'}]},
  {id:'evt_br_party_image',req:f=>f._lifestyle==='party',title:'La photo de trop',
   text:'Une story de 3h du matin circule, trois jours avant la pesée. Votre coach l’a vue avant vous.',
   choices:[{label:'En rire publiquement',d:[['confidence',6],['morale',5],['discipline',-8]],traitTag:'showman'},
            {label:'Fermer les comptes une saison',d:[['focus',8],['discipline',6],['morale',-8]],traitTag:'ascetic'}]},
  {id:'evt_br_regional_crowd',req:f=>f._stable==='regional',title:'La salle des fêtes',
   text:'Six cents personnes, un ring monté le matin même, et la moitié du public qui connaît votre prénom.',
   choices:[{label:'Leur donner le spectacle',d:[['confidence',6],['morale',8],['form',-6]],traitTag:'showman'},
            {label:'Faire le travail proprement',d:[['focus',6],['fightIQ',4]],traitTag:'ascetic'}]},
  /* ==== [CORRECTIF C12] — Plan V4 LOT 5 : "Rester fidèle" ne portait qu'un
     delta mitigé (moral/cœur contre une pénalité d'IQ), la branche perdante
     par défaut face à l'autre choix. Son effet réel est désormais sur la
     RELATION avec le coach (rel.trust, cf. CL.chooseFaithEvent, ui-08) —
     jamais un chiffre de plus ici ; `hideDelta` (scr_faith_event, ui-04)
     cache aussi son tagrow avant clic, la fidélité ne se pesant pas plus en
     chiffres que le choix d'un nouveau coach juste à côté. "Chercher un
     préparateur au-dessus" ne porte plus de delta d'attributs du tout : le
     vrai effet est un nouveau coach, choisi sur un écran dédié
     (scr_faith_coach_choice, ui-04) vers lequel CL.chooseFaithEvent() route
     directement pour ce choix précis. */
  {id:'evt_br_regional_coach',req:f=>f._stable==='regional',title:'Le coach qui plafonne',
   text:'Celui qui vous entraîne depuis le début n’a jamais mené personne au-delà du niveau régional. Il le sait.',
   choices:[{label:'Rester fidèle',d:[['morale',9],['heart',4]],hideDelta:true},
            {label:'Chercher un préparateur au-dessus',d:[],oathBreak:'homegrown'}]},
  {id:'evt_br_elite_camera',req:f=>f._stable==='elite',title:'Les caméras dans la salle',
   text:'Le camp tourne un documentaire. Vos séances les plus dures seront diffusées, ratages compris.',
   choices:[{label:'Jouer le jeu',d:[['confidence',5],['morale',4],['focus',-5]],traitTag:'showman'},
            {label:'Exiger d’être coupé au montage',d:[['focus',6],['composure',4],['morale',-4]]}]},
  {id:'evt_br_elite_bench',req:f=>f._stable==='elite',title:'Le second couteau',
   text:'Le camp prépare une tête d’affiche pour un titre mondial. Vous êtes officiellement son partenaire d’entraînement.',
   choices:[{label:'Servir de sparring et tout apprendre',d:[['fightIQ',7],['adaptability',5],['form',-10]]},
            {label:'Refuser de tenir la lampe',d:[['confidence',6],['aggression',5],['morale',-6]],traitTag:'rebel'}]},
  {id:'evt_br_party_crash',req:f=>f._lifestyle==='party',title:'Le réveil difficile',
   text:'Séance de 7h. Vous y êtes, debout, mais votre corps est resté quelque part entre hier soir et ce matin.',
   choices:[{label:'Faire la séance quand même',d:[['heart',5],['form',-10]],risk:0.40,bad:[['form',-22],['durability',-6]]},
            {label:'Rentrer dormir et assumer',d:[['form',6],['discipline',-6],['morale',4]]}]},
  {id:'evt_br_party_manager',req:f=>f._lifestyle==='party',title:'L’ultimatum du staff',
   text:'Le coach pose les choses simplement : soit vous levez le pied cette saison, soit il passe la main à quelqu’un d’autre.',
   choices:[{label:'Promettre et tenir',d:[['discipline',9],['form',6],['morale',-6]],traitTag:'ascetic'},
            {label:'Changer de coach',d:[['confidence',6],['morale',5],['fightIQ',-4]],traitTag:'rebel'}]},
  {id:'evt_br_dojo_lineage',req:f=>f._origin==='traditional',title:'La lignée',
   text:'On vous demande de porter le nom du dojo sur votre short. C’est un honneur, et une dette.',
   choices:[{label:'Le porter fièrement',d:[['discipline',6],['morale',6],['confidence',-3]]},
            {label:'Combattre sous son propre nom',d:[['confidence',7],['morale',-6]],traitTag:'rebel'}]},
  {id:'evt_br_prochild_press',req:f=>f._origin==='pro_child',title:'La question qui revient',
   text:'Quinzième interview de l’année, quinzième question sur votre père.',
   choices:[{label:'Couper court sèchement',d:[['aggression',6],['composure',-5]],traitTag:'rebel'},
            {label:'Répondre patiemment, encore',d:[['composure',7],['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_br_street_debt',req:f=>f._origin==='street',title:'Une vieille dette',
   text:'Quelqu’un du quartier vous rappelle un service rendu il y a dix ans. Il ne demande pas d’argent.',
   choices:[{label:'Rendre le service',d:[['morale',6],['focus',-6]],risk:0.35,bad:[['morale',-14],['discipline',-10]]},
            {label:'Dire que c’est une autre vie',d:[['focus',7],['morale',-7]]}]},
  {id:'evt_br_late_mentor',req:f=>f._origin==='late_bloomer',title:'Le vétéran',
   text:'Un combattant en fin de carrière vous prend à part : « Tu as moins de temps que les autres. Ne le gaspille pas en technique inutile. »',
   choices:[{label:'Se spécialiser à outrance',d:[['power',6],['killer',5],['adaptability',-5]]},
            {label:'Continuer à tout apprendre',d:[['fightIQ',6],['adaptability',6],['power',-3]]}]},
  {id:'evt_br_family_child',req:f=>f._circle==='family',title:'Un nouveau venu',
   text:'La famille s’agrandit. Les nuits raccourcissent, et le regard sur le métier change.',
   choices:[{label:'Redoubler d’ambition',d:[['heart',7],['focus',5],['form',-8]]},
            {label:'Lever le pied cette saison',d:[['morale',10],['form',6],['aggression',-6]]}]},
  {id:'evt_br_agent_offer',req:f=>f._circle==='agent',title:'Le transfert',
   text:'Une écurie concurrente propose à votre agent de vous racheter. Il vous en parle après avoir dit oui.',
   choices:[{label:'Accepter le mouvement',d:[['adaptability',6],['fightIQ',4],['morale',-6]]},
            {label:'Bloquer le transfert',d:[['confidence',7],['morale',-8]],traitTag:'rebel'}]},
  {id:'evt_br_squad_business',req:f=>f._circle==='squad',title:'Le projet des potes',
   text:'La bande veut monter une marque de vêtements à votre nom. Personne dans le groupe n’a jamais géré une entreprise.',
   choices:[{label:'Investir dedans',cost:20,d:[['morale',9]],risk:0.45,bad:[['morale',-12],['focus',-8]],traitTag:'showman'},
            {label:'Refuser poliment',d:[['focus',6],['morale',-5]]}]},
  {id:'evt_br_pro_plateau',req:f=>f._lifestyle==='pro',title:'Le plateau',
   text:'Tout est parfait sur le papier, et pourtant plus rien ne progresse depuis six mois.',
   choices:[{label:'Tout casser et repartir de zéro',d:[['adaptability',8],['form',-12]],risk:0.35,bad:[['form',-22],['confidence',-8]]},
            {label:'Faire confiance au protocole',d:[['discipline',6],['composure',4]],traitTag:'ascetic'}]},
  {id:'evt_br_balanced_doubt',req:f=>f._lifestyle==='balanced',title:'La question du soir',
   text:'Un soir de fatigue, la question tombe toute seule : est-ce que vous voulez vraiment de cette vie-là ?',
   choices:[{label:'Répondre oui, et s’y remettre',d:[['heart',7],['focus',5]]},
            {label:'Ne pas répondre',d:[['composure',5],['morale',-5]]}]},
  /* ==== [CORRECTIF V3_REGIONAL_CEILING_GUARD] — Plan V3 LOT 6 §5.6.3 point
     3 : "cet écran ne peut pas se déclencher avec 6 victoires. Condition =
     avoir réellement épuisé l'opposition locale". faithRegionalCeilingEligible()
     (ui-04) lit le ratio d'adversaires du roster ACTUEL déjà battus — pas
     juste un nombre de combats — pour ne se déclencher que quand "battu
     tout le monde dans un rayon de 300km" est vrai au sens du jeu. ==== */
  /* ==== [ANCRE: V4_C16_TERRITOIRE_GALA] — Plan V4 LOT 6 C16 : "je veux que
     l'univers du jeu change" — au-delà des deltas d'attributs ci-dessous,
     chooseFaithEvent() (ui-08, ANCRE V3_REGIONAL_CEILING_WORLD) fait
     réellement changer l'univers sur ces deux choix : nouvelle organisation
     et nouveau bassin d'adversaires pour la première, statut visible pour
     la seconde — et désormais aussi le pool de villes de gala (F.territoire,
     faithGalaCity, ui-04) : jouer à l'étranger pour l'une, à domicile pour
     l'autre. ==== */
  {id:'evt_br_regional_ceiling',req:f=>f._stable==='regional'&&faithRegionalCeilingEligible(f),title:'Le plafond régional',
   text:'Vous avez battu tout le monde dans un rayon de trois cents kilomètres. Il n’y a plus personne à affronter ici.',
   choices:[{label:'Aller chercher plus loin',d:[['confidence',6],['adaptability',5],['morale',-5]]},
            {label:'Régner sur son territoire',d:[['morale',9],['confidence',4],['fightIQ',-3]]}]},
  {id:'evt_br_elite_cut',req:f=>f._stable==='elite',title:'La coupe du camp',
   text:'Le camp réduit son effectif. Deux places sautent, et la vôtre n’est pas garantie.',
   choices:[{label:'Se battre pour rester',d:[['focus',7],['aggression',5],['form',-8]]},
            {label:'Partir avant qu’on vous pousse',d:[['confidence',5],['composure',5],['morale',-6]]}]}];

const FAITH_LIFE_EVENTS=[
  {id:'evt_eco_exam',title:'Semaine de partiels',text:'La session d\u2019examens approche à l\u2019université. Vous passez vos nuits à réviser au lieu de récupérer de vos sparrings.',
    choices:[{label:'Prioriser les révisions (assurer l\u2019avenir)',d:[['fightIQ',3],['form',-12],['morale',5]],traitTag:'ascetic'},
             {label:'Ignorer la fac, aller tourner à la salle',d:[['jab',2],['morale',-15]]}]},
  {id:'evt_calisthenics',title:'Routine au poids du corps',text:'Vous remplacez votre séance de musculation lourde par une session stricte de calisthénie en plein air.',
    choices:[{label:'Focus explosivité & figures',d:[['explosiveness',3],['flexibility',2],['cardio',-4]]},
             {label:'Focus isométrie & maintien',d:[['strength',2],['durability',2],['form',-2]]}]},
  {id:'evt_plants',title:'Invasion de nuisibles',text:'Les feuilles de vos plantes tropicales sont attaquées. Vous passez des heures à les soigner au lieu de visualiser votre combat.',
    choices:[{label:'Sauver les plantes (patience & soin)',d:[['composure',4],['focus',2],['form',-5]]},
             {label:'Abandonner et aller s\u2019entraîner',d:[['morale',-10],['aggression',3]]}]},
  {id:'evt_streetwear',title:'Le tech pack',text:'Vous finalisez seul le dossier technique de votre marque indépendante. L\u2019usine attend vos mensurations exactes.',
    choices:[{label:'Financer la production (15k$)',cost:15,d:[['focus',-5],['morale',12],['composure',3]]},
             {label:'Repousser le drop, focus sur le MMA',d:[['morale',-12],['focus',6]]}]},
  {id:'evt_rainy_run',title:'Pluie battante',text:'Une pluie glaciale s\u2019abat sur la région. Votre footing matinal s\u2019annonce particulièrement misérable.',
    choices:[{label:'Courir quand même sous l\u2019averse',d:[['durability',5],['heart',4],['form',-8],['morale',-5]]},
             {label:'Rester au chaud',d:[['form',10],['discipline',-8]]}]},
  {id:'evt_ufc_live',title:'Main event à 5h du matin',text:'La carte principale d\u2019un événement majeur commence en pleine nuit, avec un combat crucial pour votre catégorie.',
    choices:[{label:'Analyser en direct',d:[['fightIQ',5],['adaptability',3],['form',-15]]},
             {label:'Dormir et regarder le replay',d:[['form',5],['fightIQ',1]]}]},
  {id:'evt_kaiju',title:'Soirée grand spectacle',text:'Pour décompresser avec votre cercle proche, vous organisez une soirée cinéma.',
    choices:[{label:'Profiter de la soirée',d:[['morale',12],['composure',3],['discipline',-4]]}]},
  {id:'evt_sparring_heavy',title:'Sparring lourd imprévu',text:'Un vétéran de la salle vous propose un sparring très appuyé, sans casque.',
    choices:[{label:'Accepter la guerre',d:[['chin',3],['durability',3],['form',-18],['morale',5]],risk:0.35,bad:[['form',-32],['durability',-4],['morale',-10]]},
             {label:'Refuser, travail technique',d:[['footSpeed',3],['jab',2],['morale',-5]]}]},
  {id:'evt_diet_temptation',title:'Tentation de triche',text:'En plein milieu de votre perte de poids, la faim vous tenaille l\u2019estomac.',
    choices:[{label:'Craquer pour un repas lourd',d:[['form',15],['morale',10],['discipline',-15]]},
             {label:'Boire de l\u2019eau et souffrir',d:[['discipline',5],['heart',2],['morale',-8]]}]},
  {id:'evt_wrestling_seminar',title:'Séminaire de l\u2019Est',text:'Un ancien lutteur médaillé donne un séminaire technique très coûteux sur le contrôle au sol.',
    choices:[{label:'Payer l\u2019accès (5k$)',cost:5,d:[['topControl',4],['takedown',3],['fightIQ',2]]},
             {label:'S\u2019entraîner seul',d:[['strength',2],['form',-3]]}]},
  {id:'evt_coach_clash',title:'Tension tactique',text:'Votre entraîneur veut vous imposer un plan de jeu extrêmement prudent qui va à l\u2019encontre de vos instincts.',
    choices:[{label:'Se plier à ses exigences',d:[['fightIQ',4],['composure',3],['aggression',-5]],traitTag:'ascetic'},
             {label:'Refuser, imposer votre vision',d:[['aggression',4],['confidence',3],['morale',-10]],traitTag:'rebel'}]},
  {id:'evt_media_call',title:'Interview locale',text:'Un média régional vous contacte pour un long format vidéo, sur votre journée de repos.',
    choices:[{label:'Faire le show',d:[['morale',8],['confidence',4],['form',-6],['focus',-3]],traitTag:'showman'},
             {label:'Décliner poliment',d:[['focus',4],['form',5],['morale',-5]]}]},
  {id:'evt_sauna_break',title:'Le sauna en panne',text:'Pour maintenir votre perte de poids, vous devez enfiler une combinaison de sudation et enchaîner les sprints.',
    choices:[{label:'Faire les sprints (épuisant)',d:[['cardio',4],['heart',3],['form',-15]],traitTag:'ascetic'},
             {label:'Décaler la perte de poids',d:[['form',5],['discipline',-10]]}]},
  {id:'evt_shadow_mirror',title:'Perfectionnisme',text:'La salle est vide. Vous passez une heure devant le miroir à corriger une micro-imperfection technique.',
    choices:[{label:'Chirurgie technique',d:[['handSpeed',3],['cross',3],['focus',2],['form',-4]]}]},
  {id:'evt_gourou',title:'Le gourou psychologique',text:'Un coach mental vous vend une préparation "prédateur alpha" à prix fort.',
    choices:[{label:'Payer la séance (8k$)',cost:8,d:[['confidence',4],['composure',3],['form',-6]]},
             {label:'Refuser, rester terre-à-terre',d:[['discipline',3],['morale',-3]]}]},
  // --- Événements conditionnels (req) : n'apparaissent que si l'état réel du combattant les justifie ---
  {id:'evt_crypto_crash',req:f=>(f.earnings||0)>50,title:'Sponsor véreux',text:'Le fondateur de "PunchCoin", votre sponsor principal, s\u2019est enfui aux Bahamas. Vous perdez votre investissement de départ, mais la communauté a pitié de vous.',
    choices:[{label:'Faire profil bas et encaisser la perte (20k$)',cost:20,d:[['composure',5],['morale',10],['focus',3]]},
             {label:'Insulter le fondateur sur les réseaux',d:[['aggression',6],['composure',-10],['morale',-5]]}]},
  {id:'evt_tax_audit',req:f=>(f.earnings||0)>150,title:'Contrôle fiscal',text:'L\u2019administration fiscale s\u2019intéresse de très près à vos déclarations. Votre comptable, qui a le charisme d\u2019une huître, vous conseille de payer pour éviter le tribunal.',
    choices:[{label:'Régler le redressement sans faire de bruit (40k$)',cost:40,d:[['focus',5],['morale',-10]]},
             {label:'Aller au tribunal (guerre d\u2019usure)',d:[['composure',-15],['discipline',-10],['fightIQ',2]]}]},
  {id:'evt_exotic_pet',req:f=>(f.earnings||0)>80,title:'Achat compulsif',text:'Suite à un pari avec un influenceur, vous venez d\u2019acheter un tigre albinos. L\u2019animal est magnifique, mais il a dévoré votre canapé et terrorise vos sparring-partners.',
    choices:[{label:'Le revendre à un zoo et payer l\u2019amende (15k$)',cost:15,d:[['discipline',5],['morale',-5]]},
             {label:'Le garder et s\u2019en occuper',d:[['focus',-12],['heart',4],['form',-8]]}]},
  {id:'evt_aging_joints',req:f=>f.age>33,title:'Le poids des années',text:'En vous levant ce matin, vos genoux ont craqué avec le bruit d\u2019un coup de fusil. Le déni ne fonctionne plus, votre corps réclame une maintenance drastique.',
    choices:[{label:'Investir dans des cellules souches expérimentales (25k$)',cost:25,d:[['recovery',6],['durability',4],['form',10]]},
             {label:'Prendre des anti-inflammatoires et serrer les dents',d:[['durability',-5],['heart',5],['recovery',-8]]}]},
  {id:'evt_prospect_hype',req:f=>f.age<22&&(f.streak||0)>=3,title:'Le hype train',text:'Les médias vous considèrent comme le nouveau prodige de la décennie. Vos DM explosent, les marques vous harcèlent et votre ego enfle dangereusement.',
    choices:[{label:'Couper le téléphone et retourner au sac de frappe',d:[['discipline',8],['focus',6],['morale',-5]],traitTag:'ascetic'},
             {label:'Profiter de la gloire et des soirées mondaines',d:[['composure',-12],['cardio',-10],['morale',20]],traitTag:'showman'}]},
  {id:'evt_losing_streak',req:f=>(f.streak||0)<=-2,title:'Le gouffre',text:'Les défaites s\u2019accumulent. Les fans qui vous adulaient hier vous conseillent de prendre votre retraite dans les commentaires de vos photos de vacances.',
    choices:[{label:'Isolement total et remise en question',d:[['fightIQ',6],['focus',8],['confidence',-15]],traitTag:'ascetic'},
             {label:'Répondre aux trolls avec agressivité',d:[['aggression',10],['composure',-15],['focus',-10]],traitTag:'rebel'}]},
  {id:'evt_champion_target',req:f=>!!f.champion,title:'La cible sur le dos',text:'En tant que champion, vous êtes épié. Le challenger numéro 1 a disséqué chacun de vos rounds et vient de publier une vidéo pointant vos défauts biomécaniques.',
    choices:[{label:'Modifier sa garde dans l\u2019urgence',d:[['adaptability',8],['fightIQ',4],['confidence',-8]]},
             {label:'Parier sur ses fondamentaux bruts',d:[['confidence',10],['adaptability',-6],['composure',4]]}]},
  {id:'evt_chin_check',req:f=>f.attrs.chin<50,title:'Verre pilé',text:'Pendant un sparring léger, un jab anodin vous fait vaciller. Votre menton est de plus en plus fragile et votre coach propose de changer toute l\u2019approche défensive.',
    choices:[{label:'Passer à un style purement évasif',d:[['footSpeed',8],['fightIQ',4],['power',-6],['aggression',-10]]},
             {label:'Refuser de reculer (risque de KO accru)',d:[['heart',8],['durability',-5],['composure',-5]],traitTag:'rebel',risk:0.4,bad:[['chin',-6],['durability',-9],['morale',-12]]}]},
  {id:'evt_bjj_nerd',req:f=>f.style==='bjj'||f.attrs.submission>80,title:'Obsession articulaire',text:'Vous avez passé les 72 dernières heures à visionner des tutoriels de clés de cheville lituaniennes. Vous voyez des angles de soumission même quand vous pliez votre linge.',
    choices:[{label:'Intégrer ce savoir au gameplan',d:[['submission',6],['fightIQ',4],['cardio',-5]]},
             {label:'Forcer l\u2019application en sparring (risque de blesser un ami)',d:[['killer',8],['submission',2],['morale',-12]]}]},
  {id:'evt_podcast_disaster',req:null,title:'Le micro ouvert',text:'Vous êtes invité dans un podcast populaire de 4 heures. Vers la 3ème heure, fatigué, vous lâchez une théorie du complot absurde sur la forme de la Terre.',
    choices:[{label:'Assumer et embrasser le rôle de vilain',d:[['composure',-8],['aggression',6],['morale',15]],traitTag:'showman',risk:0.35,bad:[['composure',-14],['morale',-14],['focus',-8]]},
             {label:'Engager une agence de gestion de crise (10k$)',cost:10,d:[['discipline',5],['focus',5],['morale',-10]]}]},
  {id:'evt_reality_tv',req:null,title:'Romance cathodique',text:'Vous commencez à fréquenter une star de télé-réalité. Les paparazzis campent devant votre salle d\u2019entraînement, brisant la concentration de tout le camp.',
    choices:[{label:'Mettre fin à la relation pour le sport',d:[['focus',10],['discipline',8],['morale',-20]],traitTag:'ascetic'},
             {label:'Gérer les caméras et la relation',d:[['composure',-10],['form',-15],['morale',15]],traitTag:'showman'}]},
  {id:'evt_bar_fight',req:null,title:'Désamorcer la bombe',text:'Dans un bar, un type éméché qui a fait deux mois de Krav Maga en 2014 décide que vous êtes l\u2019adversaire idéal pour prouver sa virilité à ses amis.',
    choices:[{label:'Lui payer un verre et quitter les lieux',d:[['composure',8],['fightIQ',4],['aggression',-5]]},
             {label:'Le balayer sèchement pour l\u2019exemple',d:[['aggression',8],['discipline',-15],['focus',-5]],risk:0.3,bad:[['discipline',-22],['composure',-10],['morale',-12]]}]},
  {id:'evt_guru_supplement',req:null,title:'La poudre magique',text:'Un préparateur physique douteux vous propose un complément alimentaire non-étiqueté qui "révolutionnera votre testostérone" mais sent fortement l\u2019ammoniaque.',
    choices:[{label:'Refuser et s\u2019en tenir au poulet-brocolis',d:[['discipline',6],['durability',3],['recovery',-4]]},
             {label:'Tester le produit (risque absolu)',d:[['explosiveness',8],['power',5],['cardio',-15],['form',-10]],risk:0.45,bad:[['cardio',-22],['form',-20],['discipline',-6]]}]},
  // --- Événements verrouillés par un trait émergent (cristallisé après 3 choix dans la même direction) ---
  {id:'evt_trait_rebel_sponsor',req:f=>f.faithTraits&&f.faithTraits.includes('Tête Brûlée'),title:'Conséquence : marque toxique',text:'Votre réputation de Tête Brûlée fait fuir les annonceurs traditionnels, mais attire une marque de boisson énergisante ultra-agressive qui adore votre image.',
    choices:[{label:'Signer le contrat controversé',reward:25,d:[['morale',15],['focus',-5]]},
             {label:'Refuser pour redorer son image',d:[['composure',5],['morale',-10]]}]},
  {id:'evt_trait_ascetic_camp',req:f=>f.faithTraits&&f.faithTraits.includes('Ascète'),title:'Conséquence : le vide absolu',text:'En tant qu\u2019Ascète reconnu, vous avez éliminé toute distraction. Vous passez un mois entier sans parler à personne d\u2019autre qu\u2019à votre sac de frappe.',
    choices:[{label:'Embrasser l\u2019isolement martial',d:[['focus',10],['discipline',5],['morale',-15]]}]},
  {id:'evt_trait_showman_deal',req:f=>f.faithTraits&&f.faithTraits.includes('Showman'),title:'Conséquence : le cirque médiatique',text:'Votre réputation de Showman précède chaque combat. Une chaîne de streaming vous propose une série documentaire intrusive sur votre quotidien.',
    choices:[{label:'Accepter, caméras partout',reward:35,d:[['focus',-10],['morale',10],['composure',-5]]},
             {label:'Refuser, préserver l\u2019intimité du camp',d:[['discipline',4],['morale',-5]]}]},
  // --- Événements liés à l'agent (Le Requin) — n'apparaissent que si ce cercle a été choisi au draft ---
  {id:'evt_agent_scheme',req:f=>f.agentCut>0,title:'Coup de fil du Requin',text:'Votre agent vous a décroché un spot publicitaire pour une marque d\u2019outillage peu glorieuse. "C\u2019est humiliant mais ça paye, gamin", dit-il.',
    choices:[{label:'Tourner la pub',reward:20,d:[['morale',-15],['focus',-10]]},
             {label:'Refuser catégoriquement (l\u2019agent s\u2019énerve)',d:[['confidence',5],['morale',5]]}]},
  {id:'evt_agent_lobby',req:f=>f.agentCut>0&&f.org>0,title:'Trafic d\u2019influence',text:'Votre agent utilise son carnet d\u2019adresses pour vous obtenir de meilleurs créneaux d\u2019entraînement, mais la facture vous revient.',
    choices:[{label:'Payer l\u2019accès VIP (10k$)',cost:10,d:[['form',20],['cardio',3]]},
             {label:'Se débrouiller seul',d:[['discipline',5],['form',-5]]}]},
  // --- Événements liés aux ères martiales (MMA_ERAS) ---
  {id:'evt_era_daghestan',req:f=>G.currentEra&&G.currentEra.id==='era_daghestan',title:'L\u2019invasion de l\u2019Est',text:'La ligue est inondée de lutteurs effrayants. L\u2019angoisse de finir sur le dos pousse votre coach à modifier tout votre camp d\u2019entraînement.',
    choices:[{label:'S\u2019entraîner spécifiquement contre la lutte',d:[['tdd',6],['guardWork',4],['form',-12]]},
             {label:'Faire confiance à son style',d:[['confidence',5],['adaptability',-5]]}]},
  {id:'evt_era_calf',req:f=>G.currentEra&&G.currentEra.id==='era_calf',title:'Chasse aux chevilles',text:'Détruire l\u2019appui avant est devenu la norme. Vos tibias sont couverts de contusions rien qu\u2019en sparring.',
    choices:[{label:'Adapter sa garde',d:[['power',-5],['footSpeed',5],['durability',3]]},
             {label:'Ignorer la mode (vos appuis sont en miettes)',d:[['durability',-8],['morale',5]]}]},
  {id:'evt_era_boxing',req:f=>G.currentEra&&G.currentEra.id==='era_boxing',title:'Le renouveau du noble art',text:'Les combattants avec une excellente anglaise règnent en maîtres. Les échanges de pur striking sont d\u2019une violence rare.',
    choices:[{label:'Affûter son jeu de jambes',d:[['footSpeed',6],['jab',3],['form',-8]]},
             {label:'Compenser par le clinch sale',d:[['clinchStr',5],['aggression',4],['fightIQ',-3]]}]},
  {id:'evt_era_bjj',req:f=>G.currentEra&&G.currentEra.id==='era_bjj',title:'La menace des leglocks',text:'Plus personne ne se sent en sécurité les jambes tendues. Toute la salle révise ses défenses articulaires.',
    choices:[{label:'Blinder sa défense de jambes',d:[['flexibility',5],['tdd',3],['form',-8]]},
             {label:'Rester concentré sur son propre jeu',d:[['confidence',4],['adaptability',-4]]}]},
  {id:'evt_era_clinch',req:f=>G.currentEra&&G.currentEra.id==='era_clinch',title:'L\u2019ère de la boxe sale',text:'Le clinch contre la cage est devenu une arme à part entière. Les coudes pleuvent dans chaque combat de haut niveau.',
    choices:[{label:'Travailler la boxe sale au clinch',d:[['clinchStr',6],['durability',3],['form',-10]]},
             {label:'Fuir le clinch systématiquement',d:[['footSpeed',4],['cardio',-4]]}]},
  {id:'evt_era_karate',req:f=>G.currentEra&&G.currentEra.id==='era_karate',title:'L\u2019avènement du style fuyant',text:'La distance et l\u2019angle deviennent rois. Les combattants qui restent statiques se font punir sans jamais toucher personne.',
    choices:[{label:'Adopter un jeu de jambes fuyant',d:[['footSpeed',6],['fightIQ',4],['power',-4]]},
             {label:'S\u2019en tenir à la pression constante',d:[['aggression',4],['cardio',-5]]}]},
  // --- Lot d'expansion : chaque choix est un vrai entraînement, pas un simple texte ---
  {id:'evt_boxing_pads',title:'Séance de pao',text:'Le coach vous colle aux patins pendant quarante minutes sans pause, à corriger chaque angle de frappe.',
    choices:[{label:'Vitesse et précision',d:[['handSpeed',4],['jab',3],['form',-6]]},
             {label:'Puissance et enracinement',d:[['power',4],['cross',3],['form',-8]]}]},
  {id:'evt_wrestling_room',title:'La salle de lutte',text:'Un vétéran vous propose de reprendre les bases : niveau des hanches, changements de direction, chaînes d\u2019amenées.',
    choices:[{label:'Perfectionner les amenées simples',d:[['takedown',5],['strength',3],['form',-10]]},
             {label:'Travailler la défense de projection',d:[['tdd',5],['footSpeed',2],['form',-8]]}]},
  {id:'evt_jiujitsu_open_mat',title:'Open mat du dimanche',text:'La salle ouvre ses tapis à tout le monde. Ceintures noires, débutants, tout le monde roule ensemble.',
    choices:[{label:'Chasser les soumissions',d:[['submission',5],['flexibility',2],['form',-6]]},
             {label:'Travailler la garde et la patience',d:[['guardWork',5],['composure',3],['form',-5]]}]},
  {id:'evt_clinch_work',title:'Travail au clinch',text:'Deux heures collé à un partenaire contre le mur, à chercher les genoux et à casser la posture adverse.',
    choices:[{label:'Genoux et coudes sales',d:[['clinchStr',5],['aggression',3],['form',-8]]},
             {label:'Contrôle et projection depuis le clinch',d:[['clinchStr',3],['takedown',3],['form',-6]]}]},
  {id:'evt_gnp_drilling',title:'Ground and pound au sac lesté',text:'Le préparateur physique a inventé un exercice à base de sac de sable posé sur un mannequin. C\u2019est aussi ridicule qu\u2019efficace.',
    choices:[{label:'Rafales courtes et répétées',d:[['gnp',5],['handSpeed',2],['form',-9]]},
             {label:'Frappes lourdes et posture',d:[['gnp',4],['power',3],['form',-7]]}]},
  {id:'evt_footwork_ladder',title:'L\u2019échelle de rythme',text:'Une session entière consacrée au jeu de jambes, digne d\u2019un boxeur des années 70.',
    choices:[{label:'Vitesse pure',d:[['footSpeed',5],['explosiveness',2],['form',-5]]},
             {label:'Angles et déplacements latéraux',d:[['footSpeed',3],['fightIQ',3],['form',-5]]}]},
  {id:'evt_iron_chin',title:'Renforcement du cou',text:'Un protocole spécifique de musculation cervicale, réputé réduire l\u2019impact des coups à la tête.',
    choices:[{label:'S\u2019y tenir sérieusement',d:[['durability',4],['discipline',3],['form',-4]]},
             {label:'Bâcler pour gagner du temps',d:[['durability',1],['form',2]]}]},
  {id:'evt_film_study',title:'Séance vidéo',text:'Des heures à décortiquer vos propres combats et ceux de la division au ralenti.',
    choices:[{label:'Analyser ses propres erreurs',d:[['fightIQ',5],['composure',2],['focus',-3]]},
             {label:'Étudier le style du prochain adversaire',d:[['adaptability',5],['fightIQ',2],['focus',-3]]}]},
  {id:'evt_altitude_camp',title:'Stage en altitude',text:'Deux semaines à 2000 mètres. Chaque respiration est un combat en soi.',
    choices:[{label:'S\u2019y donner à fond',d:[['cardio',6],['heart',3],['form',-15]],risk:0.3,bad:[['form',-28],['recovery',-6]]},
             {label:'Doser l\u2019effort pour ne pas se griller',d:[['cardio',3],['recovery',2],['form',-6]]}]},
  {id:'evt_flexibility_yoga',title:'Séance de mobilité',text:'Le staff insiste : un corps plus mobile encaisse mieux et attaque sous des angles impossibles.',
    choices:[{label:'S\u2019investir sérieusement',d:[['flexibility',5],['recovery',2],['form',-3]]},
             {label:'Le faire du bout des lèvres',d:[['flexibility',1],['discipline',-3]]}]},
  {id:'evt_mental_coach',title:'Le préparateur mental',text:'Un psychologue du sport propose des séances de visualisation avant chaque gros combat.',
    choices:[{label:'Adhérer pleinement à la méthode',d:[['composure',5],['confidence',3],['focus',2]]},
             {label:'Rester sceptique mais écouter poliment',d:[['composure',2],['discipline',1]]}]},
  {id:'evt_weight_class_debate',title:'Le débat de catégorie',text:'Votre entourage se dispute : rester dans votre catégorie actuelle, ou tenter le grand saut vers une division voisine ?',
    choices:[{label:'Se concentrer sur la catégorie actuelle',d:[['discipline',4],['composure',2]]},
             {label:'Se préparer mentalement à un changement futur',d:[['adaptability',5],['confidence',-3]]}]},
  {id:'evt_condition_check',title:'Bilan physique complet',text:'Un check-up médical complet, des pieds à la tête, pour repartir sur des bases saines.',
    choices:[{label:'Suivre à la lettre les recommandations',d:[['durability',3],['recovery',3],['discipline',2]]},
             {label:'Garder seulement ce qui vous arrange',d:[['confidence',3],['durability',-2]]}]},
  {id:'evt_sparring_partner_bond',title:'Le partenaire de confiance',text:'Un partenaire d\u2019entraînement régulier commence à vraiment comprendre votre jeu — dans les deux sens.',
    choices:[{label:'Approfondir cette complicité technique',d:[['adaptability',4],['fightIQ',3],['composure',2]]},
             {label:'Varier les partenaires pour rester imprévisible',d:[['adaptability',2],['confidence',3]]}]},
  {id:'evt_local_seminar',title:'Séminaire de passage',text:'Un ancien champion de passage dans la région donne un séminaire technique très demandé.',
    choices:[{label:'Payer l\u2019accès (6k$)',cost:6,d:[['fightIQ',4],['adaptability',3]]},
             {label:'Ne pas s\u2019y rendre',d:[['discipline',2]]}]},
  {id:'evt_referee_incident',title:'Incident avec un arbitre',text:'Un mauvais souvenir d\u2019arrêt de combat controversé refait surface dans les médias locaux.',
    choices:[{label:'Répondre calmement en interview',d:[['composure',4],['confidence',2]]},
             {label:'Laisser sa colère s\u2019exprimer publiquement',d:[['aggression',5],['composure',-6],['morale',8]]}]},
  {id:'evt_new_gym_offer',title:'Offre d\u2019une salle rivale',text:'Une salle réputée de l\u2019autre bout du pays propose de vous accueillir, avec des infrastructures bien supérieures.',
    choices:[{label:'Rester fidèle à sa salle d\u2019origine',d:[['discipline',3],['morale',6]]},
             {label:'Envisager sérieusement le changement',d:[['adaptability',3],['confidence',3],['morale',-4]]}]},
  {id:'evt_injury_scare',title:'Alerte à l\u2019entraînement',text:'Une torsion du genou pendant un exercice de niveau fait craindre le pire un instant. Finalement rien de cassé, mais l\u2019inquiétude reste.',
    choices:[{label:'Reprendre prudemment',d:[['durability',2],['discipline',2],['form',-8]]},
             {label:'Reprendre comme si de rien n\u2019était',d:[['confidence',4],['durability',-3],['form',-4]],risk:0.35,bad:[['durability',-9],['form',-22],['recovery',-5]]}]},
  {id:'evt_public_workout',title:'Entraînement public',text:'L\u2019organisation demande une séance ouverte aux médias avant le prochain événement.',
    choices:[{label:'Montrer un vrai travail technique',d:[['fightIQ',3],['confidence',2],['focus',-3]]},
             {label:'Mettre en scène de la puissance brute',d:[['power',3],['aggression',3],['focus',-3]]}]},
  {id:'evt_old_footage',title:'Vieilles images',text:'Un fan retrouve une vidéo de vos tout premiers combats amateurs et la partage en ligne. Le contraste est saisissant.',
    choices:[{label:'En rire publiquement',d:[['composure',3],['morale',8]]},
             {label:'Ignorer complètement',d:[['discipline',2]]}]},
  {id:'evt_camp_relocation',title:'Délocalisation de camp',text:'Pour préparer un combat à l\u2019étranger, tout le camp part s\u2019installer un mois sur place.',
    choices:[{label:'S\u2019adapter au fuseau horaire et à la nourriture',d:[['adaptability',4],['recovery',2],['form',-6]]},
             {label:'Reproduire sa routine habituelle à tout prix',d:[['discipline',4],['adaptability',-2],['form',-4]]}]},
  {id:'evt_style_switch_temptation',title:'La tentation du style adverse',text:'En observant un adversaire dominer avec un style qui n\u2019est pas le vôtre, l\u2019envie de tout changer vous traverse.',
    choices:[{label:'Résister et approfondir son propre style',d:[['discipline',4],['confidence',3]]},
             {label:'Emprunter un peu de cette approche',d:[['adaptability',5],['fightIQ',2],['confidence',-2]],risk:0.35,bad:[['confidence',-10],['focus',-8],['discipline',-5]]}]},
  {id:'evt_fan_letter',title:'Une lettre de fan',text:'Un jeune combattant amateur vous écrit une longue lettre expliquant à quel point votre parcours l\u2019a inspiré.',
    choices:[{label:'Répondre personnellement',d:[['morale',10],['composure',2]]},
             {label:'Passer à autre chose, trop de sollicitations',d:[['focus',3]]}]},
  {id:'evt_camp_conflict',title:'Tension entre coachs',text:'Deux membres de votre staff ne s\u2019entendent plus sur l\u2019approche à adopter pour le prochain combat.',
    choices:[{label:'Trancher soi-même la question',d:[['fightIQ',3],['confidence',3],['composure',-3]]},
             {label:'Laisser le coach principal décider',d:[['discipline',3],['confidence',-2]]}]},
  {id:'evt_documentary_offer',title:'Offre de documentaire',text:'Une équipe de tournage souhaite suivre une saison entière de votre carrière pour un documentaire.',
    choices:[{label:'Accepter, caméras partout',reward:15,d:[['focus',-8],['morale',12]]},
             {label:'Refuser, préserver la tranquillité du camp',d:[['discipline',3],['morale',-3]]}]},
  {id:'evt_home_gym_build',req:f=>(f.earnings||0)>100,title:'Salle personnelle',text:'Vos moyens permettent enfin d\u2019installer une salle privée chez vous, loin du bruit du club.',
    choices:[{label:'Investir dans l\u2019équipement (25k$)',cost:25,d:[['discipline',3],['recovery',3],['form',6]]},
             {label:'Continuer à s\u2019entraîner en club',d:[['composure',2]]}]},
  {id:'evt_weight_cut_horror',req:f=>f.age>28,title:'Une coupe de poids terrible',text:'La déshydratation de cette semaine a été la pire de votre carrière. Votre corps a mis des jours à s\u2019en remettre.',
    choices:[{label:'Revoir sérieusement sa méthode de coupe',d:[['discipline',4],['durability',3],['form',-10]]},
             {label:'Serrer les dents et continuer pareil',d:[['heart',5],['durability',-4],['form',-6]],risk:0.4,bad:[['durability',-9],['form',-20],['cardio',-6]]}]},
  // --- Lot 2 (Gemini, vérifié) ---
  {id:'evt_ice_bath_extreme',title:'Bain de glace prolongé',text:'Votre préparateur vous met au défi de rester cinq minutes de plus dans l\u2019eau à 2°C pour tester vos limites mentales.',
    choices:[{label:'Serrer les dents et rester',d:[['recovery',5],['heart',4],['form',-8]],risk:0.3,bad:[['form',-18],['recovery',-5],['morale',-8]]},
             {label:'Sortir, la récupération standard suffit',d:[['form',5],['discipline',-4]]}]},
  {id:'evt_prodigy_sparring',req:f=>f.org>0,title:'Le petit nouveau',text:'Un jeune prodige de 19 ans fraîchement débarqué à la salle vous met en réelle difficulté lors d\u2019un sparring. Votre ego en prend un coup.',
    choices:[{label:'Ranger son ego et analyser son jeu',d:[['fightIQ',5],['focus',4],['morale',-8]]},
             {label:'Durcir le sparring pour le calmer',d:[['aggression',6],['power',2],['form',-10]]}]},
  {id:'evt_mansion_buy',req:f=>(f.earnings||0)>=100,title:'Folie immobilière',text:'Avec vos récents gains, l\u2019envie d\u2019acheter une immense villa avec piscine devient obsédante. C\u2019est le symbole ultime de la réussite.',
    choices:[{label:'Acheter la villa (60k$)',cost:60,d:[['morale',20],['confidence',5],['focus',-10]]},
             {label:'Placer l\u2019argent sagement',d:[['discipline',6],['focus',4],['morale',-5]]}]},
  {id:'evt_food_poisoning',title:'Le buffet maudit',text:'Une intoxication alimentaire fulgurante vous cloue au lit à trois semaines du combat. Vous êtes complètement déshydraté et affaibli.',
    choices:[{label:'S\u2019entraîner quand même dans la douleur',d:[['heart',6],['durability',3],['form',-20],['cardio',-5]]},
             {label:'Garder le lit et se soigner',d:[['form',8],['recovery',4],['cardio',-8]]}]},
  {id:'evt_boxer_hands',req:f=>f.style==='boxer',title:'Mains de cristal',text:'Vos phalanges vous font atrocement souffrir après chaque séance aux paos. C\u2019est le prix à payer pour frapper aussi lourdement.',
    choices:[{label:'Bander lourdement et continuer de frapper',d:[['power',4],['hook',3],['form',-12]]},
             {label:'Mettre les poings au repos, focus jambes',d:[['footSpeed',5],['adaptability',3],['cross',-4]]}]},
  {id:'evt_wrestler_ear',req:f=>f.style==='wrestler',title:'Oreille en chou-fleur',text:'Votre oreille gauche vient de gonfler dramatiquement après un frottement sévère sur le tapis. Elle est prête à exploser.',
    choices:[{label:'La faire ponctionner chez le médecin',d:[['composure',5],['focus',3],['form',-8]]},
             {label:'La laisser durcir comme un trophée',d:[['durability',5],['confidence',3],['focus',-5]]}]},
  {id:'evt_era_calf_def',req:f=>G.currentEra&&G.currentEra.id==='era_calf',title:'Hachoir à viande',text:'Dans cette ère du calf-kick, vos mollets sont ciblés à chaque session d\u2019entraînement. Vous avez du mal à marcher le matin.',
    choices:[{label:'Conditionner les tibias sur des sacs durs',d:[['durability',6],['kick',3],['form',-15]]},
             {label:'Travailler les changements de garde fluides',d:[['adaptability',5],['footSpeed',4],['power',-5]]}]},
  {id:'evt_imposter_syndrome',title:'Le syndrome de l\u2019imposteur',text:'Il est 3h du matin. Vous fixez le plafond en vous demandant si vous avez vraiment le niveau pour monter dans cette cage face à des tueurs.',
    choices:[{label:'Regarder les vidéos de ses anciennes victoires',d:[['confidence',6],['morale',5],['form',-6]]},
             {label:'Appeler son coach en pleine nuit pour parler tactique',d:[['fightIQ',5],['focus',4],['morale',-5]]}]},
  {id:'evt_hollywood_cameo',req:f=>(f.earnings||0)>30,title:'Caméo hollywoodien',text:'Un studio de cinéma vous propose un petit rôle de mercenaire dans un film d\u2019action. Le tournage empiétera sur vos horaires de camp.',
    choices:[{label:'Accepter le rôle',reward:20,d:[['morale',15],['focus',-10],['form',-8]]},
             {label:'Refuser pour rester 100% focus sur le sport',d:[['discipline',8],['focus',6],['morale',-10]]}]},
  {id:'evt_overtraining',title:'La ligne rouge',text:'Votre corps vous supplie d\u2019arrêter. Vos temps de réaction s\u2019effondrent et votre système nerveux est complètement grillé par le surentraînement.',
    choices:[{label:'Prendre trois jours de repos complet',d:[['recovery',6],['form',15],['discipline',-6]]},
             {label:'Pousser la machine jusqu\u2019à la rupture',d:[['heart',8],['cardio',4],['form',-25]],risk:0.45,bad:[['form',-38],['recovery',-8],['morale',-12]]}]},
  {id:'evt_forgotten_belt',req:f=>!!f.champion,title:'Ceinture oubliée',text:'Vous avez oublié votre ceinture de champion dans le coffre d\u2019un VTC après une soirée de célébration. Le chauffeur exige une récompense pour la rendre.',
    choices:[{label:'Payer la rançon discrètement (5k$)',cost:5,d:[['focus',5],['discipline',3],['morale',-5]]},
             {label:'Le menacer publiquement sur les réseaux',d:[['aggression',6],['confidence',4],['composure',-10]]}]},
  {id:'evt_lumpinee_trip',req:f=>f.style==='muayThai',title:'Pèlerinage au Lumpinee',text:'L\u2019appel de la Thaïlande se fait sentir. Partir s\u2019entraîner à la dure, dans la chaleur étouffante de Bangkok, pourrait raviver votre instinct animal.',
    choices:[{label:'Financer le voyage martial (15k$)',cost:15,d:[['clinchStr',6],['kick',5],['durability',4],['form',-12]]},
             {label:'Rester s\u2019entraîner dans son confort habituel',d:[['discipline',4],['morale',-6]]}]},
  {id:'evt_hot_yoga',title:'Yoga infernal',text:'Un coéquipier vous traîne dans un cours de yoga Bikram à 40°C. Vos muscles raides d\u2019artiste martial crient à l\u2019agonie dès les premières postures.',
    choices:[{label:'Souffrir en silence jusqu\u2019à la fin de la séance',d:[['flexibility',8],['recovery',4],['power',-4]],risk:0.25,bad:[['form',-14],['power',-6]]},
             {label:'Quitter la salle en plein milieu, trempé de sueur',d:[['power',3],['flexibility',-5],['morale',-2]]}]},
  {id:'evt_twitter_beef',title:'Guerre des claviers',text:'Un combattant que vous n\u2019avez même pas provoqué lance une attaque cinglante sur votre style de combat en ligne. Vos notifications explosent.',
    choices:[{label:'Rentrer dans le clash virtuel et faire le buzz',d:[['aggression',6],['confidence',5],['focus',-10]],risk:0.35,bad:[['focus',-20],['composure',-9],['morale',-12]]},
             {label:'Désinstaller l\u2019application et l\u2019ignorer',d:[['composure',8],['discipline',5],['morale',-8]]}]},
  {id:'evt_boxing_gloves_16',req:f=>G.currentEra&&G.currentEra.id==='era_boxing',title:'Le test des 16oz',text:'Dans cette ère dominée par la boxe, d\u2019anciens pros viennent tourner à la salle avec des gants de 16oz pour vous donner une leçon d\u2019anglaise.',
    choices:[{label:'Mettre les gros gants et boxer avec eux',d:[['handSpeed',6],['cross',4],['kick',-5],['form',-8]]},
             {label:'Les emmener au sol (imposer les règles du MMA)',d:[['adaptability',6],['takedown',4],['handSpeed',-5]]}]},
  {id:'evt_invincible_aura',req:f=>(f.streak||0)>=4,title:'Aura d\u2019invincibilité',text:'Votre série de victoires vous donne l\u2019impression d\u2019être un demi-dieu. Plus rien ne semble pouvoir vous blesser dans la cage.',
    choices:[{label:'Embrasser cette confiance absolue',d:[['confidence',8],['power',5],['fightIQ',-8]]},
             {label:'Se forcer à rester humble et paranoïaque',d:[['composure',6],['focus',5],['morale',-6]]}]},
  {id:'evt_change_scenery',req:f=>(f.streak||0)<=-2,title:'Changement de décor',text:'La spirale de la défaite empoisonne l\u2019air de votre salle habituelle. Vous ressentez un besoin vital de vous exiler pour ce camp d\u2019entraînement.',
    choices:[{label:'Partir en camp d\u2019isolement à l\u2019étranger (10k$)',cost:10,d:[['adaptability',6],['fightIQ',5],['confidence',4],['form',-10]]},
             {label:'Serrer les dents et rester fidèle à son équipe',d:[['heart',6],['discipline',4],['confidence',-5]]}]},
  {id:'evt_intrusive_fan',title:'Le fan envahissant',text:'Pendant votre footing matinal à l\u2019aube, un fan vous reconnaît et commence à courir à côté de vous en vous posant mille questions.',
    choices:[{label:'Lui répondre gentiment et faire le footing ensemble',d:[['cardio',4],['morale',8],['focus',-5]]},
             {label:'Accélérer violemment l\u2019allure pour le semer',d:[['footSpeed',5],['explosiveness',4],['morale',-4]]}]},
  {id:'evt_creaky_knee',title:'Genou qui grince',text:'Sur une tentative de takedown routinière, votre genou émet un craquement sourd. La douleur est minime, mais l\u2019angoisse d\u2019une rupture ligamentaire est totale.',
    choices:[{label:'Consulter un spécialiste en urgence (5k$)',cost:5,d:[['recovery',6],['composure',4],['form',-4]]},
             {label:'Bander l\u2019articulation fortement et prier',d:[['heart',5],['durability',3],['confidence',-8]]}]},
  {id:'evt_martial_wisdom',req:f=>f.age>=35,title:'Sagesse martiale',text:'Vos fibres blanches disparaissent, votre explosivité n\u2019est plus ce qu\u2019elle était. Mais là où le corps ralentit, l\u2019esprit commence à voir tout au ralenti.',
    choices:[{label:'Adapter son style sur le timing et le coup d\u2019œil',d:[['fightIQ',8],['composure',6],['handSpeed',-6]]},
             {label:'Refuser l\u2019âge et forcer les drills de vitesse',d:[['handSpeed',5],['explosiveness',3],['recovery',-10],['form',-12]]}]},
  {id:'evt_stubborn_scale',title:'La balance qui stagne',text:'À une semaine de la pesée, votre poids refuse de descendre. Votre métabolisme s\u2019est mis en mode survie et stocke la moindre goutte d\u2019eau.',
    choices:[{label:'Enfiler la combinaison de sudation et courir',d:[['cardio',5],['chin',-8],['form',-18]]},
             {label:'Jeûne hydrique total et absolu dans le noir',d:[['discipline',8],['power',-8],['form',-15]]}]},
  {id:'evt_tape_study',title:'Nuit de cassettes',text:'Vous retrouvez une clé USB contenant des centaines d\u2019heures de combats d\u2019anciennes époques et de vieux tournois.',
    choices:[{label:'Analyser les vieux maîtres toute la nuit',d:[['fightIQ',6],['adaptability',5],['form',-8]]},
             {label:'Aller dormir, le sport a évolué de toute façon',d:[['recovery',5],['form',5],['fightIQ',-3]]}]},
  {id:'evt_cooper_test',title:'Le test de Cooper',text:'Votre préparateur physique apporte un sifflet sur la piste d\u2019athlétisme. "12 minutes. Montrez-moi de quoi vous êtes fait."',
    choices:[{label:'Vomir ses poumons pour battre le record de la salle',d:[['cardio',8],['heart',6],['form',-20]]},
             {label:'Gérer son allure pour faire le strict minimum syndical',d:[['recovery',5],['discipline',-5],['cardio',-2]]}]},
  {id:'evt_tv_documentary',req:f=>f.org>=3,title:'Dans l\u2019intimité du camp',text:'Une équipe télévisée réalise un documentaire "Embedded" sur votre préparation. Ils vous suivent même à la cantine et chez le kiné.',
    choices:[{label:'Jouer le jeu des caméras et faire le show',d:[['confidence',6],['morale',10],['focus',-10]]},
             {label:'Leur montrer la monotonie brutale et silencieuse du métier',d:[['discipline',6],['focus',5],['morale',-6]]}]},
  {id:'evt_gi_nogi',req:f=>f.style==='bjj',title:'L\u2019appel du Kimono',text:'Vos racines vous manquent. Vous ressentez l\u2019envie viscérale de remettre un Gi pour rouler, même si le MMA moderne se pratique en No-Gi.',
    choices:[{label:'Passer la semaine en Kimono',d:[['guardWork',6],['submission',5],['explosiveness',-6]]},
             {label:'Rester pragmatique et s\u2019entraîner en No-Gi',d:[['takedown',4],['adaptability',3],['morale',-5]]}]},
  {id:'evt_forest_kata',req:f=>f.style==='karate',title:'L\u2019esprit de la forêt',text:'Vous décidez de fuir les néons clignotants de la salle pour exécuter vos Katas pieds nus dans la forêt, au lever du soleil.',
    choices:[{label:'Rechercher la fluidité et le vide mental',d:[['footSpeed',6],['composure',5],['durability',-5]]},
             {label:'Durcir ses tibias et poings contre les écorces d\u2019arbres',d:[['durability',8],['kick',4],['form',-12]]}]},
  {id:'evt_neck_harness',title:'Collier de plomb',text:'Un lutteur de passage vous montre un vieil exercice avec un harnais de cou lesté de disques de fonte. Cela a l\u2019air dangereux pour les cervicales.',
    choices:[{label:'Charger les poids et renforcer la nuque',d:[['chin',6],['clinchStr',5],['form',-10]]},
             {label:'Protéger ses cervicales et faire des étirements',d:[['flexibility',5],['recovery',4],['chin',-4]]}]},
  {id:'evt_management_sim',title:'Nuit blanche tactique',text:'Un ami vous offre le dernier jeu de simulation de management sportif. Vous lancez une partie "juste pour voir les menus" et il est soudainement 6h du matin.',
    choices:[{label:'Terminer la saison (esprit tactique en ébullition)',d:[['fightIQ',5],['morale',12],['form',-18]]},
             {label:'Sauvegarder et aller dormir de force',d:[['discipline',6],['recovery',4],['morale',-5]]}]},
  {id:'evt_train_south',req:f=>f.org>0,title:'Retraite au soleil',text:'Pour couper avec la pression asphyxiante du camp, vous partez quelques jours dans le Sud. Le trajet est long, mais le soleil régénère l\u2019esprit.',
    choices:[{label:'Payer le voyage et s\u2019évader (4k$)',cost:4,d:[['morale',18],['recovery',6],['focus',-8]]},
             {label:'Annuler à la dernière minute et s\u2019enfermer à la salle',d:[['focus',6],['discipline',4],['morale',-10]]}]},
  {id:'evt_repotting',title:'Rempotage printanier',text:'Vos plantes d\u2019appartement commencent à étouffer dans leurs vieux pots. L\u2019opération de sauvetage botanique va vous prendre l\u2019après-midi entière.',
    choices:[{label:'Prendre le temps d\u2019avoir la main verte',d:[['composure',6],['recovery',4],['form',-6]]},
             {label:'Laisser les plantes souffrir pour le moment',d:[['focus',5],['aggression',3],['morale',-8]]}]},
  // --- Némésis parallèle : lit l'état réel du rival verrouillé dans le roster ---
  {id:'evt_nemesis_loss',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId&&(o.streak||0)<0),title:'Chute du rival',text:'Votre rival historique vient de subir un lourd revers. Les journalistes s\u2019empressent de vous demander votre réaction à chaud.',
    choices:[{label:'L\u2019enterrer publiquement',d:[['aggression',4],['morale',5],['composure',-5]]},
             {label:'Lui souhaiter un bon rétablissement',d:[['composure',5],['focus',3]]}]},
  {id:'evt_nemesis_win',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId&&(o.streak||0)>=3),title:'L\u2019ombre du rival',text:'Votre némésis enchaîne les victoires impressionnantes. Sa hype médiatique commence sérieusement à éclipser la vôtre.',
    choices:[{label:'S\u2019entraîner deux fois plus dur',d:[['form',-15],['focus',8],['cardio',4]]},
             {label:'L\u2019ignorer et rester concentré',d:[['confidence',5],['composure',3],['morale',-5]]}]},
  {id:'evt_nemesis_gym',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId),title:'Guerre à distance',text:'Rumeur confirmée : votre némésis vient de rejoindre une salle rivale réputée pour sa lutte agressive. Le message est clair.',
    choices:[{label:'Travailler sa défense de lutte en prévision',d:[['tdd',6],['form',-8]]},
             {label:'Parier sur son propre striking',d:[['power',4],['handSpeed',3],['form',-6]]}]}
];

const FAITH_OATHS=[
  {id:'no_shortcut',label:'Jamais de raccourci',
   texte:'Je ne prendrai jamais de raccourci : ni produit, ni juge acheté, ni pesée arrangée.',
   rappel:'Aucun privilège illégal de toute la carrière.'},
  {id:'old_lion',label:'Le vieux lion',
   texte:'Je serai encore champion quand on me dira que je suis trop vieux.',
   rappel:'Décrocher une ceinture à 34 ans ou plus.'},
  {id:'undefeated',label:'Invaincu jusqu’au titre',
   texte:'Je porterai la ceinture sans avoir jamais connu la défaite.',
   rappel:'Être champion en n’ayant jamais perdu.'},
  {id:'blood_master',label:'Le sang du maître',
   texte:'Celui que j’aurai formé tombera devant moi.',
   rappel:'Battre son propre protégé devenu rival.'},
  {id:'long_road',label:'La route longue',
   texte:'Je combattrai jusqu’à ce que mon corps me le refuse.',
   rappel:'Aller jusqu’à 38 ans sans raccrocher.'},
  {id:'homegrown',label:'Fidèle à la salle',
   texte:'Je ne quitterai jamais ceux qui m’ont appris à me battre.',
   rappel:'Ne jamais accepter l’offre d’une autre écurie.'}
];

const FAITH_PRESSE_MEDIAS=['LA GAZETTE DE LA CAGE','COMBAT HEBDO','LE ROUND','RINGSIDE'];

const FAITH_PRESSE_TITRES={
  blanche:['Une année pour rien','Le nom effacé des affiches','Suspendu, et déjà oublié','Douze mois de silence administratif','La saison qui n’a jamais eu lieu','Rayé du calendrier'],
  consecration:['Le sommet, enfin','Plus personne devant','La division a un patron','On regarde tout le monde d’en haut','Le trône est occupé','Il n’y a plus d’adversaire évident'],
  usure:['À quel prix ?','Les coups s’accumulent','Une guerre de trop','Le corps envoie la facture','Gagner en laissant des morceaux','Ce que le classement ne dit pas'],
  ascension:['La marche a été franchie','On ne rigole plus','L’année qui change tout','Le saut que personne n’attendait','Un cran au-dessus','La hiérarchie a bougé'],
  chute:['La chute','Le doute s’installe','Où est passé le combattant ?','Le classement ne pardonne pas','Une année à oublier','Le contrecoup'],
  creux:['Une saison sans combat','Le silence de la cage','Absent des affiches','Une année en pointillés'],
  stagnation:['Sur place','Ni progrès ni recul','Une année de transition','Le surplace','Rien n’a bougé','Une saison sans relief'],
  /* ==== [ANCRE: V4_C20_SPECTACLE_TITRES] — Plan V4 LOT 7 §C20 : voir ANCRE
     V4_C20_SPECTACLE_ANGLE (ui-04, faithPresseAngle) pour le calcul de ces
     quatre angles, croisant f.spectacle avec le bilan W/L de la saison —
     jusqu'ici lu une seule fois dans tout le jeu (scr_faith_offer). 10+
     titres par famille, comme demandé. */
  spectacle_vend:['Le nom qui remplit les salles','On paie pour le voir gagner','La victoire qui se vend','Une saison qui fait recette','Le public en redemande','Gagner en remplissant les gradins','La star que la division attendait','Chaque combat, un événement','Le genre de vainqueur qu’on veut revoir','Rentable et invaincu cette année','Le guichet ne désemplit pas'],
  spectacle_ennuie:['Gagner sans convaincre','Le vainqueur qu’on oublie vite','Une efficacité qui n’attire personne','Les victoires, jamais le public','Le classement monte, l’audience non','Trois victoires, zéro frisson','Gagner dans l’indifférence','Le travail bien fait, jamais applaudi','La méthode sans le spectacle','Des chiffres qui ne remplissent pas les salles','Invaincu et invisible'],
  spectacle_divertit:['Perdre en héros','Le public l’aime encore plus après la défaite','Battu, mais jamais oublié','La défaite qui fait vibrer la salle','On revient pour lui, gagnant ou perdant','Le combattant que personne ne veut voir partir','Perdre n’a jamais aussi bien vendu','Une saison de défaites et de standing ovations','Le charisme survit au classement','Battu au tableau, vainqueur du public','La popularité qui ignore les statistiques'],
  spectacle_disparait:['La saison qui efface un nom','Perdu, et déjà oublié','Plus personne ne se déplace pour le voir','Le silence qui suit la défaite','Une saison à disparaître des radars','Ni victoires, ni raisons de rester','Le public a déjà tourné la page','Une carrière qui s’éteint dans l’indifférence','Battu et invisible','La sortie par la petite porte','Le nom qui ne fait plus vendre un billet']
};

const FAITH_PRESSE_CORPS={
  blanche:[
    'Licence suspendue, saison annulée. Le dossier restera dans les archives de la fédération bien après que le public aura tourné la page.',
    'Une signature au bas d’un rapport de laboratoire aura suffi à rayer douze mois de travail. La cage, elle, n’a pas attendu.',
    'Le calendrier s’est refermé sans un seul combat. Les concurrents, eux, ont continué d’avancer.'],
  consecration:[
    'Le classement ne se discute plus. Reste à savoir combien de temps un sommet se défend — l’histoire du sport dit rarement longtemps.',
    'Il faudra désormais battre ce nom pour exister dans la division. Tous les calendriers de l’an prochain seront écrits autour de lui.',
    'La place est prise, et personne ne semble pressé de la réclamer. C’est précisément là que les carrières deviennent dangereuses.'],
  usure:[
    'Le bilan comptable est correct. Le bilan médical l’est moins. En coulisses, plus d’un observateur compte les années qui restent.',
    'Chaque victoire de cette saison s’est payée en coups encaissés. Ce genre d’arithmétique finit toujours par se solder.',
    'On a vu un combattant gagner. On a aussi vu un homme rentrer au vestiaire plus lentement qu’il y était entré.'],
  ascension:[
    'La progression est nette, mesurable, et les promoteurs l’ont remarquée avant les fans. Le calendrier de l’an prochain sera plus dur.',
    'Il y a douze mois, ce nom ne figurait dans aucune conversation sérieuse. Il ouvre désormais les discussions de matchmaking.',
    'Le genre de saison qui déplace une carrière d’un étage. Reste à tenir le rythme quand les adversaires cesseront d’être des tests.'],
  chute:[
    'La saison laisse des traces au classement. Un accident de parcours, dit l’entourage ; une tendance, disent les chiffres.',
    'Rien ne s’est écroulé d’un coup. C’est bien ce qui inquiète : la pente a été régulière, et personne ne l’a enrayée.',
    'Les mêmes armes, les mêmes plans, mais plus les mêmes résultats. La division a appris à lire ce combattant.'],
  creux:[
    'Aucun combat cette année. Dans ce sport, l’absence se paie deux fois : au classement, et dans la mémoire du public.',
    'Douze mois sans entrer dans la cage. Les fans passent à autre chose plus vite que les blessures ne guérissent.'],
  stagnation:[
    'Rien de déshonorant, rien de marquant non plus. Le genre de saison qu’on oublie avant même la suivante.',
    'Une année propre, sans éclat. À ce niveau, ne pas monter revient déjà à laisser passer du monde.',
    'Le travail est là, les résultats suivent à peine. La différence se fera ailleurs que dans la salle.'],
  spectacle_vend:[
    'Les victoires s’enchaînent, et les guichets suivent. Ce genre de combinaison ne dure jamais éternellement — les promoteurs comptent en profiter.',
    'Gagner ne suffit pas toujours à remplir une salle. Cette saison, les deux se sont tenus par la main du début à la fin.',
    'Le classement progresse, l’audience aussi. Rares sont les saisons où les deux courbes montent ensemble.'],
  spectacle_ennuie:[
    'Le palmarès ne ment pas : que des victoires. Les chiffres d’audience, eux, racontent une tout autre histoire.',
    'Gagner aux points, encore et encore, use la patience d’un public venu pour un spectacle. Le classement grimpe, les tribunes se vident.',
    'Personne ne conteste les résultats. Personne ne se bouscule non plus pour la prochaine affiche.'],
  spectacle_divertit:[
    'La défaite fait mal au classement, jamais à la popularité. Ce genre de combattant se reconstruit une carrière sur l’enthousiasme du public.',
    'Perdre en donnant tout n’a jamais autant fait vendre de billets. Les promoteurs le savent, et en profitent sans complexe.',
    'Le bilan est mauvais sur le papier. Dans les gradins, personne n’a eu l’impression d’avoir perdu son soir.'],
  spectacle_disparait:[
    'Perdre sans jamais inquiéter personne finit par coûter plus cher que la défaite elle-même — le public s’en va avant le classement ne recule.',
    'Les combats se sont enchaînés sans éclat ni résultat. Les cartes suivantes se sont composées sans même y penser.',
    'Une saison qui n’a rien laissé — ni une victoire à retenir, ni un moment à raconter. Le pire des deux mondes.']
};

/* ==== [ANCRE: DATA_FAITH_PRESSCONF_REPLIES_V3] — Plan V3 LOT 5 §P15 :
   répliques d'adversaire pour la conférence de presse, migrées vers le
   moteur de texte contextuel (TEXT_POOLS/txtPick, engine.js — LOT 0
   §4.2). Remplace faithOppReplies() (ui-04), qui ne produisait que 2
   formules figées par adversaire, jamais un vrai pool. Chaque entrée
   déclare `req(ctx)` (lu sur l'adversaire/le contexte réels — jamais un
   texte générique, anti-générique §1.3) et `text` comme FONCTION de ctx
   (jeton de contexte obligatoire, ANCRE TEXT_ENGINE_INTERPOLATION,
   engine.js). Portée à 80 entrées (Plan V4 LOT 7 §C19 point 2 — la
   carrière ayant doublé de longueur au Lot 1, la Main event, bien que
   limitée par construction à rang<=4/champion/rival (faithGalaPosition,
   ui-04), revient assez souvent pour justifier le seuil de la Loi 4 :
   voir ANCRE V4_C19_PRESSCONF_EXTENSION plus bas pour les 53 entrées
   ajoutées à ce lot, au-delà des 27 déjà écrites au LOT 5). */
const FAITH_PRESSCONF_REPLIES=[
  {id:'pc_agr_finish',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.aggression||50)>65,
   text:({opp:{name}})=>`« Je viens chercher la finition, pas les points. » ${esc(name)} ne cache rien de ses intentions.`},
  {id:'pc_agr_pression',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.aggression||50)>70,
   text:({opp:{name}})=>`« Je mets la pression dès la cloche, et je ne la relâche pas. » ${esc(name)} ne parle que d'aller de l'avant.`},
  {id:'pc_calme_laisser_venir',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.aggression||50)<40,
   text:({opp:{name,styleLabel}})=>`« Je le laisse venir, ${esc(styleLabel||'mon style')} n'a jamais eu besoin de se presser. » ${esc(name)} reste de marbre.`},
  {id:'pc_calme_patience',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.aggression||50)<35,
   text:({opp:{name}})=>`« La patience gagne plus de combats que la colère. » ${esc(name)} répond posément, presque trop.`},
  {id:'pc_winrecord',weight:1,req:ctx=>ctx.opp.W>ctx.opp.L+3,
   text:({opp:{W,L}})=>`Il rappelle son bilan, ${W}-${L}, « et ce n'est pas fini ».`},
  {id:'pc_winrecord_confiance',weight:1,req:ctx=>ctx.opp.W>ctx.opp.L+5,
   text:({opp:{name,W}})=>`« ${W} victoires, ce n'est pas de la chance. » ${esc(name)} n'a pas l'air de douter une seconde.`},
  {id:'pc_losing_evite',weight:1,req:ctx=>ctx.opp.L>=ctx.opp.W,
   text:({opp:{W,L}})=>`Il évite le sujet de son bilan, ${W}-${L}, et détourne la question vers l'avenir.`},
  {id:'pc_losing_revanche',weight:1,req:ctx=>ctx.opp.L>ctx.opp.W,
   text:({opp:{name}})=>`« Les chiffres ne racontent pas tout. » ${esc(name)} parle d'un tournant, pas d'un déclin.`},
  {id:'pc_favori',weight:1,req:ctx=>ctx.favorite===true,
   text:({opp:{name}})=>`« Je suis ici parce que je suis le meilleur choix, pas le plus commode. » ${esc(name)} rappelle son rang.`},
  {id:'pc_outsider',weight:1,req:ctx=>ctx.favorite===false,
   text:({opp:{name}})=>`« Personne ne me voyait ici il y a un an. » ${esc(name)} joue la carte de l'outsider, sans en avoir l'air gêné.`},
  {id:'pc_nemesis_1',weight:2,req:ctx=>!!ctx.isNemesis,
   text:({opp:{name}})=>`« On se connaît déjà, tous les deux. » ${esc(name)} ne prend même plus la peine de feindre découvrir un inconnu.`},
  {id:'pc_nemesis_2',weight:2,req:ctx=>!!ctx.isNemesis,
   text:()=>`« Cette fois, on règle vraiment la question. » Le ton est différent des autres conférences — plus court, plus tendu.`},
  {id:'pc_title_1',weight:1,req:ctx=>!!ctx.isTitle,
   text:({opp:{name}})=>`« Une ceinture, ça se prend, ça ne se donne pas. » ${esc(name)} pèse chaque mot devant les caméras du titre.`},
  {id:'pc_grappler',weight:1,req:ctx=>ctx.opp.styleLabel&&/lutte|jiu|jitsu|sol/i.test(ctx.opp.styleLabel),
   text:({opp:{name}})=>`« Debout ou au sol, l'issue est la même. » ${esc(name)} ne cache pas où il veut amener le combat.`},
  {id:'pc_striker',weight:1,req:ctx=>ctx.opp.styleLabel&&/boxe|kick|muay|karate/i.test(ctx.opp.styleLabel),
   text:({opp:{name}})=>`« Je frappe plus vite que ce qu'on peut anticiper. » ${esc(name)} n'a pas l'intention de traîner debout.`},
  {id:'pc_veteran',weight:1,req:ctx=>(ctx.opp.age||25)>=33,
   text:({opp:{name,age}})=>`« L'expérience ne s'use pas comme le corps. » ${esc(name)}, ${age} ans, a entendu la question mille fois.`},
  {id:'pc_jeune',weight:1,req:ctx=>(ctx.opp.age||25)<=22,
   text:({opp:{name,age}})=>`« L'âge ne se voit pas dans la cage. » À ${age} ans, ${esc(name)} balaie la question d'un revers de main.`},
  {id:'pc_champion',weight:1,req:ctx=>!!ctx.opp.champion,
   text:({opp:{name}})=>`« Cette ceinture n'est pas un souvenir, c'est un outil de travail. » ${esc(name)} parle en champion.`},
  {id:'pc_default_1',weight:1,
   text:({opp:{name}})=>`« Le meilleur gagne le soir du combat, pas en salle de conférence. » ${esc(name)} garde ses vraies cartes pour la cage.`},
  {id:'pc_default_2',weight:1,
   text:({opp:{name}})=>`« On en a assez dit. La cage tranchera. » ${esc(name)} coupe court aux questions.`},
  {id:'pc_default_3',weight:1,
   text:({opp:{name}})=>`${esc(name)} sourit, sans grand-chose à ajouter — le combat parlera de lui-même, dit-il.`},
  {id:'pc_default_4',weight:1,
   text:({opp:{name}})=>`« Respect, mais aucune pitié. » ${esc(name)} garde le ton mesuré, sans un mot de trop.`},
  {id:'pc_streak_win',weight:1,req:ctx=>(ctx.opp.streak||0)>=3,
   text:({opp:{name,streak}})=>`« Cette série n'est pas un accident. » ${esc(name)}, ${streak} victoires de suite, ne compte pas s'arrêter là.`},
  {id:'pc_streak_loss',weight:1,req:ctx=>(ctx.opp.streak||0)<=-2,
   text:({opp:{name}})=>`« Une série se retourne en un soir. » ${esc(name)} n'esquive pas la question des défaites récentes.`},
  {id:'pc_ko_specialist',weight:1,req:ctx=>(ctx.opp.ko||0)>=5 && (ctx.opp.ko||0)>(ctx.opp.sub||0),
   text:({opp:{name,ko}})=>`« Je ne vais pas au tableau des juges pour gagner du temps. » ${ko} KO à son actif, ${esc(name)} le rappelle sans détour.`},
  {id:'pc_sub_specialist',weight:1,req:ctx=>(ctx.opp.sub||0)>=5 && (ctx.opp.sub||0)>(ctx.opp.ko||0),
   text:({opp:{name,sub}})=>`« Une soumission, c'est une conversation qu'on termine soi-même. » ${sub} finitions parlent pour ${esc(name)}.`},
  {id:'pc_gapclasse',weight:1,req:ctx=>Math.abs((ctx.opp.overall||50)-(ctx.f.overall||50))>=15,
   text:({opp:{name}})=>`${esc(name)} évite soigneusement de commenter l'écart de niveau que tout le monde chuchote en coulisses.`},
  /* ==== [ANCRE: V4_C19_PRESSCONF_EXTENSION] — Plan V4 LOT 7 §C19 point 2 :
     28 entrées mesurées trop courtes pour la fréquence réelle de la
     conférence sur une carrière doublée par le Lot 1 (Main event, rang<=4/
     champion/rival — cf. faithGalaPosition, ui-04). 53 entrées ajoutées,
     chacune sur un axe non couvert ci-dessus : blessure en cours, trait de
     lore (bio.trait, déjà posé à la création — engine.js FIGHTER_BIO_C14),
     nationalité, palmarès rond, statut de champion à sa première/énième
     défense, gabarit hors-norme, terrain (ctx.home, ajouté à l'appel dans
     scr_faith_press_conf), attributs bruts (cardio/menton/QI/puissance/
     lutte/soumission), rivalité déjà rejouée plusieurs fois
     (ctx.commonHistory, également ajouté à l'appel), match serré, nul(s)
     au palmarès, styles debout distincts (muay-thaï/karaté), et davantage
     de répliques neutres pour ne pas surcharger pc_default_1..4. */
  {id:'pc_injury',weight:1,req:ctx=>!!ctx.opp.injury,
   text:({opp:{name}})=>`${esc(name)} balaie la question de sa blessure d'un revers de main — « je suis là, c'est tout ce qui compte. »`},
  {id:'pc_injury_2',weight:1,req:ctx=>!!ctx.opp.injury,
   text:({opp:{name}})=>`« Les médecins ont donné leur feu vert, pas les paris. » ${esc(name)} sait ce qu'on chuchote sur sa forme.`},
  {id:'pc_injury_3',weight:1,req:ctx=>!!ctx.opp.injury,
   text:({opp:{name}})=>`On l'interroge sur sa convalescence. ${esc(name)} répond en une phrase et change immédiatement de sujet.`},
  {id:'pc_trait_1',weight:1,req:ctx=>!!(ctx.opp.bio&&ctx.opp.bio.trait),
   text:({opp:{name,bio:{trait}}})=>`Quelqu'un rappelle une habitude connue de ${esc(name)} : ${esc(trait)} Ce soir ne fera pas exception.`},
  {id:'pc_trait_2',weight:1,req:ctx=>!!(ctx.opp.bio&&ctx.opp.bio.trait),
   text:({opp:{bio:{trait}}})=>`${esc(trait)} Un détail que les habitués de la salle connaissent bien, que vous découvrez ce soir.`},
  {id:'pc_country_1',weight:1,text:({opp:{name,flag}})=>`« Je porte tout un pays sur ce podium. » ${esc(name)} ${flag} n'en fait pas mystère.`},
  {id:'pc_country_2',weight:1,text:({opp:{name,flag}})=>`Une partie de la salle est venue exprès pour ${esc(name)} ${flag}, drapeaux compris.`},
  {id:'pc_milestone_win',weight:1,req:ctx=>(ctx.opp.W||0)>0&&(ctx.opp.W%10)===0,
   text:({opp:{name,W}})=>`Une ${W}e victoire serait un chiffre rond que ${esc(name)} ne cache pas vouloir décrocher ce soir.`},
  {id:'pc_champ_first_defense',weight:1,req:ctx=>!!ctx.opp.champion&&(ctx.opp.defenses||0)===0,
   text:({opp:{name}})=>`« Une première défense, ça se prépare différemment. » ${esc(name)} n'a jamais eu à protéger cette ceinture.`},
  {id:'pc_champ_many_defenses',weight:1,req:ctx=>!!ctx.opp.champion&&(ctx.opp.defenses||0)>=3,
   text:({opp:{name,defenses}})=>`${defenses} défenses au compteur. ${esc(name)} en parle comme d'une habitude, pas d'un exploit.`},
  {id:'pc_anomaly',weight:1,req:ctx=>!!(ctx.opp.phys&&ctx.opp.phys.tags&&ctx.opp.phys.tags.length),
   text:({opp:{name}})=>`Le gabarit de ${esc(name)} fait déjà parler avant le premier coup — il le sait, et ne s'en cache pas.`},
  {id:'pc_home_opp',weight:1,req:ctx=>ctx.home===false,
   text:({opp:{name}})=>`« Un peu d'hostilité ne m'a jamais dérangé. » ${esc(name)} sait qu'il évolue en terrain conquis ce soir.`},
  {id:'pc_away_opp',weight:1,req:ctx=>ctx.home===true,
   text:({opp:{name}})=>`${esc(name)} sourit en évoquant le public venu vous soutenir — « ça ne changera rien dans la cage. »`},
  {id:'pc_cardio_high',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.cardio||50)>78,
   text:({opp:{name}})=>`« Je n'ai jamais vu la lumière rouge du dernier round. » ${esc(name)} parle de rythme plus que de puissance.`},
  {id:'pc_cardio_low',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.cardio||50)<32,
   text:({opp:{name}})=>`On évoque son souffle en fin de combat. ${esc(name)} balaie le sujet : « ça ne dépassera pas le premier round ».`},
  {id:'pc_chin_iron',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.chin||50)>80,
   text:({opp:{name}})=>`« Personne ne m'a encore vu tomber. » ${esc(name)} le dit sans forfanterie, juste en constat.`},
  {id:'pc_fightiq_high',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.fightIQ||50)>80,
   text:({opp:{name}})=>`« Je lis un combat trois échanges à l'avance. » ${esc(name)} préfère parler de plan que de force brute.`},
  {id:'pc_power_high',weight:1,req:ctx=>(ctx.opp.attrs&&ctx.opp.attrs.power||50)>82,
   text:({opp:{name}})=>`« Un coup, une conversation qui s'arrête. » ${esc(name)} ne promet rien d'autre que ça.`},
  {id:'pc_wrestler_focus',weight:1,req:ctx=>ctx.opp.style==='wrestler'||ctx.opp.style==='sambo',
   text:({opp:{name}})=>`« Le combat se passe là où je décide de l'emmener. » ${esc(name)} ne cache pas son intention de coller au sol.`},
  {id:'pc_bjj_focus',weight:1,req:ctx=>ctx.opp.style==='bjj',
   text:({opp:{name}})=>`« Une seule erreur, et c'est terminé. » ${esc(name)} parle de patience, jamais de vitesse.`},
  {id:'pc_muaythai_focus',weight:1,req:ctx=>ctx.opp.style==='muayThai',
   text:({opp:{name}})=>`« Le corps avant la tête, toujours. » ${esc(name)} rappelle que le combat se gagne aussi dans les côtes.`},
  {id:'pc_karate_focus',weight:1,req:ctx=>ctx.opp.style==='karate',
   text:({opp:{name}})=>`« La distance, c'est toute la discipline. » ${esc(name)} explique le karaté sans jamais lever le ton.`},
  {id:'pc_trilogy',weight:2,req:ctx=>(ctx.commonHistory||0)>=2,
   text:({opp:{name}})=>`Troisième face-à-face avec ${esc(name)}. Les questions habituelles n'ont plus vraiment de sens entre vous deux.`},
  {id:'pc_second_meeting',weight:1,req:ctx=>(ctx.commonHistory||0)===1,
   text:({opp:{name}})=>`Un premier affrontement les a déjà opposés. ${esc(name)} sait précisément à quoi s'attendre cette fois.`},
  {id:'pc_close_gap',weight:1,req:ctx=>Math.abs((ctx.opp.overall||50)-(ctx.f.overall||50))<=4,
   text:({opp:{name}})=>`« Rien ne nous sépare sur le papier. » ${esc(name)} le reconnaît sans détour, presque avec plaisir.`},
  {id:'pc_draws',weight:1,req:ctx=>(ctx.opp.D||0)>=1,
   text:({opp:{name}})=>`On lui rappelle son ou ses matchs nuls. ${esc(name)} préfère parler de la revanche de ce soir.`},
  {id:'pc_default_5',weight:1,text:({opp:{name}})=>`${esc(name)} regarde la salle plus que les journalistes, comme s'il s'adressait déjà au public.`},
  {id:'pc_default_6',weight:1,text:({opp:{name}})=>`« Tout ce qu'il y a à dire se dira sous les projecteurs. » ${esc(name)} garde le reste pour lui.`},
  {id:'pc_default_7',weight:1,text:({opp:{name}})=>`${esc(name)} répond à chaque question par une autre question, sans jamais vraiment se dévoiler.`},
  {id:'pc_default_8',weight:1,text:({opp:{name}})=>`« Ce genre de moment ne se prépare pas en interview. » ${esc(name)} garde son énergie pour la cage.`},
  {id:'pc_default_9',weight:1,text:({opp:{name}})=>`Un sourire, une poignée de main un peu trop appuyée : ${esc(name)} joue la carte du calme apparent.`},
  {id:'pc_default_10',weight:1,text:({opp:{name}})=>`${esc(name)} détourne une question piège avec une blague, sans perdre son sérieux sous-jacent.`},
  {id:'pc_default_11',weight:1,text:({opp:{name}})=>`« Je laisse les micros aux autres. » ${esc(name)} reste bref, presque expéditif.`},
  {id:'pc_default_12',weight:1,text:({opp:{name}})=>`${esc(name)} fixe la caméra plus que le public, comme si le vrai message était ailleurs.`},
  {id:'pc_default_13',weight:1,text:({opp:{name}})=>`« On en dira davantage après, croyez-moi. » ${esc(name)} laisse la phrase en suspens.`},
  {id:'pc_default_14',weight:1,text:({opp:{name}})=>`${esc(name)} salue la salle avant même de répondre, comme s'il connaissait déjà l'issue.`},
  {id:'pc_default_15',weight:1,text:({opp:{name}})=>`« Les mots ne pèsent rien face au combat. » ${esc(name)} le répète, presque par principe.`},
  {id:'pc_default_16',weight:1,text:({opp:{name}})=>`${esc(name)} croise les bras et laisse le silence répondre à sa place, un instant de trop.`},
  {id:'pc_default_17',weight:1,text:({opp:{name}})=>`« Vous verrez bien. » Trois mots, et ${esc(name)} cède le micro au suivant.`},
  {id:'pc_default_18',weight:1,text:({opp:{name}})=>`${esc(name)} garde un ton égal du début à la fin, sans jamais monter en pression malgré les relances.`},
  {id:'pc_default_19',weight:1,text:({opp:{name}})=>`« Chacun sa version, on tranchera dans la cage. » ${esc(name)} referme le sujet aussi vite qu'il l'a ouvert.`},
  {id:'pc_default_20',weight:1,text:({opp:{name}})=>`${esc(name)} prend son temps pour répondre, comme si chaque mot était pesé à l'avance.`},
  {id:'pc_default_21',weight:1,text:({opp:{name}})=>`« Je suis venu pour une raison précise, pas pour parler. » ${esc(name)} recentre chaque question.`},
  {id:'pc_default_22',weight:1,text:({opp:{name}})=>`Un journaliste insiste. ${esc(name)} répond exactement la même chose, mot pour mot, la seconde fois.`},
  {id:'pc_default_23',weight:1,text:({opp:{name}})=>`${esc(name)} regarde sa propre équipe avant chaque réponse, comme pour confirmer la ligne à tenir.`},
  {id:'pc_default_24',weight:1,text:({opp:{name}})=>`« Il y a un micro entre nous, mais il n'y en aura plus demain. » ${esc(name)} laisse planer la menace.`},
  {id:'pc_default_25',weight:1,text:({opp:{name}})=>`${esc(name)} enlève sa casquette pour répondre, un geste presque cérémonial avant chaque phrase.`},
  {id:'pc_default_26',weight:1,text:({opp:{name}})=>`« Ce n'est qu'une formalité avant l'essentiel. » ${esc(name)} balaie la conférence d'un revers de main.`},
  {id:'pc_default_27',weight:1,text:({opp:{name}})=>`${esc(name)} termine chaque phrase par un petit rire, difficile à interpréter avant le combat.`},
  {id:'pc_default_28',weight:1,text:({opp:{name}})=>`« On juge un combattant à la sortie de la cage, jamais à l'entrée de la salle de presse. » ${esc(name)} s'y tient.`},
  {id:'pc_default_29',weight:1,text:({opp:{name}})=>`${esc(name)} tapote la table du bout des doigts en écoutant la question, sans se presser d'y répondre.`},
  {id:'pc_default_30',weight:1,text:({opp:{name}})=>`« Gardez vos questions pour après. » ${esc(name)} préfère parler résultats plutôt qu'intentions.`},
  {id:'pc_default_31',weight:1,text:({opp:{name}})=>`${esc(name)} désigne la ceinture ou le classement d'un simple regard, sans avoir besoin d'un mot de plus.`},
];

/* ==== [ANCRE: DATA_FAITH_CROWD_AMBIANCE_V3] — Plan V3 LOT 6 §P09 point 3 :
   "le public existe" — une ligne tirée du TextEngine selon la ville,
   l'enjeu, et si le combattant est à domicile (§P09 : "l'origine du
   combattant est déjà en base", cf. FAITH_GALA_CITY_COUNTRY et f.countryKey,
   ui-04). req(ctx) lit ctx.home (bool) et ctx.hype ('forte'/'moyenne'/
   'faible'/'nulle', faithGalaPosition). Portée réduite (12 entrées, pas un
   pool par ville) — même choix assumé que FAITH_PRESSCONF_REPLIES (LOT 5). */
const FAITH_CROWD_AMBIANCE=[
  {id:'ca_home_forte',weight:1,req:ctx=>ctx.home&&ctx.hype==='forte',
   text:ctx=>`La salle est à vous avant même le premier coup — ${esc(ctx.city)} scande votre nom en entrant.`},
  {id:'ca_home_moyenne',weight:1,req:ctx=>ctx.home&&(ctx.hype==='moyenne'||ctx.hype==='faible'),
   text:ctx=>`Une bonne partie du public de ${esc(ctx.city)} est venue pour vous — l'accueil est chaleureux, sans excès.`},
  {id:'ca_home_family',weight:1,req:ctx=>ctx.home,
   text:()=>`Quelque part dans les gradins, des visages que vous reconnaissez. Ce n'est pas rien.`},
  {id:'ca_away_forte',weight:2,req:ctx=>!ctx.home&&ctx.hype==='forte',
   text:ctx=>`${esc(ctx.city)} vous accueille comme l'ennemi qu'il faut voir tomber — les sifflets couvrent presque l'hymne.`},
  {id:'ca_away_hostile',weight:1,req:ctx=>!ctx.home&&ctx.hype!=='nulle',
   text:ctx=>`La salle de ${esc(ctx.city)} soutient l'autre nom que le vôtre. Vous l'entendez dès l'entrée.`},
  {id:'ca_away_indiff',weight:1,req:ctx=>!ctx.home&&(ctx.hype==='faible'||ctx.hype==='nulle'),
   text:ctx=>`${esc(ctx.city)} ne vous connaît pas encore. Le public regarde surtout sa montre.`},
  {id:'ca_neutre_curieux',weight:1,req:ctx=>!ctx.home,
   text:()=>`Un public neutre, venu voir un bon combat plus qu'un nom précis. À vous de le convaincre.`},
  {id:'ca_forte_bruit',weight:1,req:ctx=>ctx.hype==='forte',
   text:ctx=>`Le bruit dans ${esc(ctx.venue)} est déjà assourdissant avant l'entrée en cage.`},
  {id:'ca_faible_vide',weight:1,req:ctx=>ctx.hype==='faible'||ctx.hype==='nulle',
   text:ctx=>`${esc(ctx.venue)} est loin d'être plein ce soir — les rangs du fond restent vides.`},
  {id:'ca_default_1',weight:1,
   text:ctx=>`Le public de ${esc(ctx.city)} prend place. Dans quelques minutes, il aura un avis sur vous.`},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_UPSET_WIN_V3] — Plan V3 LOT 6 §P09 point 4 : "la
   psychologie de l'accomplissement, sans en faire des tonnes" — le joueur
   demande explicitement UNE SEULE phrase, jamais un paragraphe. La rareté
   est appliquée côté code (faithMaybeUpsetLine, ui-06) : ce pool ne fournit
   que la variété de LA phrase, tirée au plus une fois par carrière. */
const FAITH_UPSET_WIN=[
  {id:'up_1',weight:1,text:()=>`Personne ne pariait sur vous ce soir. Vous venez de le leur rappeler.`},
  {id:'up_2',weight:1,text:()=>`Il était donné largement favori. Le classement, lui, ne ment plus.`},
  {id:'up_3',weight:1,text:()=>`Ce genre de victoire ne s'explique pas dans une interview — elle se vit une fois, peut-être.`},
  {id:'up_4',weight:1,text:()=>`Vous entrez dans la catégorie des gens qui ont fait tomber plus fort qu'eux.`},
  {id:'up_5',weight:1,text:()=>`Un instant, en sortant de la cage, vous n'y croyez pas non plus.`},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_TITLE_PROMO_V3] — Plan V3 LOT 6 §5.6.1, temps 4 :
   "conférence obligatoire + pesée obligatoire, tous deux en registre
   « spectacle », avec textes EXCLUSIFS au titre (jamais les pools
   ordinaires)". faithOppReplies() (ui-04) pioche TOUJOURS au moins une
   réplique ici plutôt que dans FAITH_PRESSCONF_REPLIES quand ctx.isTitle,
   pour que la différence se voie réellement, pas seulement en probabilité
   via un req(ctx). Portée réduite (8 entrées, pas la pesée séparée que
   P19/LOT 6 diffère explicitement) — même choix assumé que les pools
   précédents. */
const FAITH_TITLE_PROMO_REPLIES=[
  {id:'tp_1',weight:1,text:({opp:{name}})=>`« Une ceinture ne se prête pas, elle se prend. » ${esc(name)} ne quitte pas la caméra des yeux en le disant.`},
  {id:'tp_2',weight:1,req:ctx=>!!ctx.opp.champion,
   text:({opp:{name,defenses}})=>`« Je la porte depuis ${defenses||0} défense(s), et elle ne va nulle part. » ${esc(name)} pose la main dessus en le disant.`},
  {id:'tp_3',weight:1,req:ctx=>!ctx.opp.champion,
   text:({opp:{name}})=>`« Un champion, ça se juge une seule fois : le soir où on va le chercher. » ${esc(name)} refuse tout autre sujet.`},
  {id:'tp_4',weight:1,req:ctx=>!!ctx.isNemesis,
   text:({opp:{name}})=>`« Cette histoire ne pouvait se terminer que pour un titre. » ${esc(name)} le dit sans sourire.`},
  {id:'tp_5',weight:1,text:()=>`La salle de conférence est pleine ce soir — jusqu'aux journalistes qui ne suivent d'habitude que les autres catégories.`},
  {id:'tp_6',weight:1,text:({opp:{name}})=>`« Tout ce que j'ai fait jusqu'ici menait à ce podium. » ${esc(name)} pèse la phrase comme préparée depuis longtemps.`},
  {id:'tp_7',weight:1,text:({opp:{name}})=>`« Un seul de nous deux repart avec la ceinture ce soir. » ${esc(name)} ne cherche plus à se montrer modeste.`},
  {id:'tp_8',weight:1,text:()=>`Les questions habituelles disparaissent — ce soir, la salle ne parle que du titre.`},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_TITLE_FINAL_LINE_V3] — Plan V3 LOT 6 §5.6.1 :
   "la ligne finale de cet écran est la phrase que le joueur retiendra de
   toute sa partie […] elle doit varier selon le chemin parcouru, pas selon
   le résultat seul". req(ctx) lit ctx.type ('won'/'defended'),
   ctx.wasNemesis, ctx.wasUnderdog, ctx.attemptsBefore (0 = premier essai),
   ctx.personality ('villain'/'humble'/'showman'). Priorité des entrées
   spécifiques (nemesis/outsider/personnalité) sur les génériques via
   weight, jamais via ordre de tableau (txtPick ne lit pas l'ordre). */
const FAITH_TITLE_FINAL_LINES=[
  {id:'tf_first_try',weight:2,req:ctx=>ctx.type==='won'&&(ctx.attemptsBefore||0)===0,
   text:()=>`Vous n'avez pas eu besoin d'une deuxième chance. Peu de gens peuvent dire ça.`},
  {id:'tf_many_tries',weight:3,req:ctx=>ctx.type==='won'&&(ctx.attemptsBefore||0)>=2,
   text:ctx=>`Il vous aura fallu ${ctx.attemptsBefore+1} tentatives pour ce moment précis. Personne ne se souviendra des échecs — seulement de celle-ci.`},
  {id:'tf_nemesis',weight:3,req:ctx=>ctx.type==='won'&&!!ctx.wasNemesis,
   text:()=>`Ce n'était pas seulement un titre. C'était LUI, en face, ce soir-là. La ceinture, presque en second.`},
  {id:'tf_underdog',weight:3,req:ctx=>ctx.type==='won'&&!!ctx.wasUnderdog,
   text:()=>`Personne, absolument personne, ne vous voyait tenir cette ceinture aujourd'hui. Retenez ce sentiment — il ne dure jamais assez longtemps.`},
  {id:'tf_villain',weight:1,req:ctx=>ctx.type==='won'&&ctx.personality==='villain',
   text:()=>`Les sifflets se transforment lentement en autre chose. Vous n'avez jamais eu besoin d'être aimé pour être respecté.`},
  {id:'tf_humble',weight:1,req:ctx=>ctx.type==='won'&&ctx.personality==='humble',
   text:()=>`Vous ne dites rien de grand devant les caméras. La ceinture, elle, parle pour vous.`},
  {id:'tf_showman',weight:1,req:ctx=>ctx.type==='won'&&ctx.personality==='showman',
   text:()=>`Vous saviez déjà, avant même la décision, exactement quelle image resterait de ce soir.`},
  {id:'tf_won_default',weight:1,req:ctx=>ctx.type==='won',
   text:()=>`À partir de maintenant, tout ce que vous ferez sera mesuré à l'aune de ce soir-là.`},
  {id:'tf_defended_many',weight:2,req:ctx=>ctx.type==='defended'&&(ctx.attemptsBefore||0)>=4,
   text:ctx=>`Une ${ctx.attemptsBefore+1}e nuit où la ceinture reste chez vous. Les chiffres commencent à parler d'un règne, pas d'un accident.`},
  {id:'tf_defended_nemesis',weight:3,req:ctx=>ctx.type==='defended'&&!!ctx.wasNemesis,
   text:()=>`Face à lui, précisément, vous ne pouviez pas vous permettre le doute. Vous ne l'avez pas laissé passer.`},
  {id:'tf_defended_default',weight:1,req:ctx=>ctx.type==='defended',
   text:()=>`Défendre une ceinture, ce n'est jamais aussi bruyant que la gagner — et c'est pourtant ce qui construit une légende.`},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_CUTTING_LINES_V4] — Plan V4 LOT 7 §C18 : les quatre
   gabarits de cutting de scr_plan (ui-06, sans_effort/facile/normal/
   complique) codaient chacun UNE SEULE phrase d'ambiance en dur, revue
   identique à chaque combat d'une carrière qui en compte désormais deux
   fois plus depuis le Lot 1. Migré vers TEXT_POOLS/txtPick (engine.js) :
   `tier` porte le palier de coupe (réutilise le mécanisme de filtre
   ctx.rankTier déjà prévu par le moteur pour autre chose que le rang),
   `req(ctx)` couvre les quatre cas mesurés comme absents du contenu
   existant — poids lourd sans plafond de catégorie (ctx.isHeavy), vétéran
   dont la récupération ne suit plus (ctx.veteran, seuil aligné sur le tag
   VETERAN existant, ui-03), troisième coupe compliquée d'affilée
   (ctx.thirdComplique, lu sur les deux dernières entrées de f.history —
   cutTier posé désormais par resolveFight(), ui-05) et changement RÉCENT
   de catégorie vers le bas (ctx.divDescended, comparé à f.history[-1].div,
   même enrichissement). Le HTML/les chiffres/les effets de scr_plan ne
   bougent pas : seule la ligne "ambiance" (`div class="small muted"`)
   change de source. 80 entrées, 15/20/25/20 sur les quatre paliers — la
   répartition suit le volume réel observé (le tirage de weightCutInfo,
   engine.js, centre autour de 9% donc retombe majoritairement en
   facile/normal). */
const FAITH_CUTTING_LINES=[
  {id:'cw_se_01',tier:'sans_effort',weight:1,text:`Vous montez sur la balance sans même y penser vraiment — le chiffre n'a presque pas bougé depuis la semaine dernière.`},
  {id:'cw_se_02',tier:'sans_effort',weight:1,text:`Petit-déjeuner complet la veille de la pesée. Pour une fois, personne ne compte les calories dans le vestiaire.`},
  {id:'cw_se_03',tier:'sans_effort',weight:1,text:`Le sauna reste éteint cette semaine. Le corps n'a rien à négocier avec la balance.`},
  {id:'cw_se_04',tier:'sans_effort',weight:1,text:`Vous buvez normalement jusqu'au bout — aucun sachet de thé, aucun bain brûlant à l'horizon.`},
  {id:'cw_se_05',tier:'sans_effort',weight:1,text:`La limite de la catégorie n'a jamais été un adversaire cette fois. Le repas d'avant-combat ressemble à n'importe quel autre.`},
  {id:'cw_se_06',tier:'sans_effort',weight:1,text:`Le nutritionniste de la salle regarde votre fiche et hausse les épaules : rien à ajuster.`},
  {id:'cw_se_07',tier:'sans_effort',weight:1,text:`Huit heures de sommeil la nuit d'avant, sans réveil anxieux pour vérifier le poids sur le téléphone.`},
  {id:'cw_se_08',tier:'sans_effort',weight:1,text:`Le seul effort de la semaine, c'est le sac de sport qu'il faut refaire pour le voyage.`},
  {id:'cw_se_09',tier:'sans_effort',weight:1,text:`Le coach ne mentionne même pas le poids en briefing — il n'y a simplement rien à en dire.`},
  {id:'cw_se_10',tier:'sans_effort',weight:1,text:`Vous montez sur scène la peau normale, sans les marques d'un sauna de la veille.`},
  {id:'cw_se_11',tier:'sans_effort',weight:1,text:`Le régime des autres combattants de la carte fait sourire un peu — le vôtre s'appelle dîner normalement.`},
  {id:'cw_se_12',tier:'sans_effort',weight:1,text:`Cette semaine, le mot "cutting" n'a même pas été prononcé une seule fois au camp.`},
  {id:'cw_se_13',tier:'sans_effort',weight:1,text:`Un bol de pâtes la veille, comme n'importe quel soir. Le poids suivra tout seul.`},
  {id:'cw_se_14',tier:'sans_effort',weight:2,req:ctx=>!!ctx.isHeavy,
   text:`Chez les poids lourds, la balance n'a jamais fixé de plafond au-dessus de vous — vous mangez comme avant une longue journée de chantier.`},
  {id:'cw_se_15',tier:'sans_effort',weight:2,req:ctx=>!!ctx.isHeavy,
   text:`Aucune limite supérieure à respecter dans votre catégorie : le seul chiffre qui compte ce soir, c'est celui que vous infligerez à l'adversaire.`},
  /* ==== [ANCRE: V4_C18_MESURE_FREQUENCE] — Plan V4 LOT 7 §C18 : mesure
     réelle sur 10 carrières Faith simulées (harnais de test, clic
     automatique) avant d'écrire ce contenu — cf. rapport livré avec ce lot.
     ~31,5 combats/carrière, ~63 rendus de vestiaire (le double : scr_plan a
     deux étapes, wcHtml n'est affiché qu'à l'étape 1 mais reconstruit à
     chaque rendu). Répartition observée par palier : sans_effort ~16%,
     facile ~32%, normal ~34%, complique ~15%, impossible (jamais affiché
     ici, cf. CUTTING_5PALIERS) ~2,5%. Rapportée aux ~31,5 vrais combats/
     carrière, facile et normal dépassent le plancher 20/25 donné par le
     document au regard de la Loi 4 (>= 4x l'occurrence réelle/carrière,
     ~10 et ~11 respectivement) : relevés à 30/35 ci-dessous plutôt que
     laissés au plancher, sans toucher sans_effort/complique dont la mesure
     confirme le plancher déjà suffisant. */
  {id:'cw_fa_21',tier:'facile',weight:1,text:`Une pomme en dessert plutôt qu'une part de gâteau, sans plus de cérémonie.`},
  {id:'cw_fa_22',tier:'facile',weight:1,text:`Le coach coche une case sur sa feuille et passe directement au sujet suivant.`},
  {id:'cw_fa_23',tier:'facile',weight:1,text:`Un peu moins de sauce, un peu plus d'eau : l'ajustement passe presque inaperçu.`},
  {id:'cw_fa_24',tier:'facile',weight:1,text:`Une séance de sauna courte suffit à finir le travail, sans drame ni chronomètre.`},
  {id:'cw_fa_25',tier:'facile',weight:1,text:`Le kiné note juste une légère baisse de poids sur la fiche, rien d'alarmant.`},
  {id:'cw_fa_26',tier:'facile',weight:1,text:`Deux jours sans grignotage entre les repas, et le compte y est déjà.`},
  {id:'cw_fa_27',tier:'facile',weight:1,text:`Un peu de marche en plus après le dîner, pour finir de faire le poids sans effort.`},
  {id:'cw_fa_28',tier:'facile',weight:1,text:`Le staff considère cette semaine comme un entraînement presque ordinaire.`},
  {id:'cw_fa_29',tier:'facile',weight:1,text:`Une soupe claire remplace le plat du soir, sans que personne ne s'en inquiète.`},
  {id:'cw_fa_30',tier:'facile',weight:1,text:`Le sauna se termine avant même que la sueur ne devienne inconfortable.`},
  {id:'cw_fa_01',tier:'facile',weight:1,text:`Deux jours de sauna léger et un dessert en moins : rien qui perturbe vraiment la semaine.`},
  {id:'cw_fa_02',tier:'facile',weight:1,text:`Le corps lâche l'eau sans drame, comme à chaque camp depuis des années.`},
  {id:'cw_fa_03',tier:'facile',weight:1,text:`Une séance de vélo en survêtement l'après-midi, puis un repas normal le soir.`},
  {id:'cw_fa_04',tier:'facile',weight:1,text:`Le coach retire le pain du plateau trois jours avant. Une routine, pas un sacrifice.`},
  {id:'cw_fa_05',tier:'facile',weight:1,text:`Le sel disparaît des repas pendant 48 heures — le genre de détail que personne ne remarque à l'extérieur.`},
  {id:'cw_fa_06',tier:'facile',weight:1,text:`Un dernier footing léger en coupe-vent, juste pour évacuer les derniers grammes superflus.`},
  {id:'cw_fa_07',tier:'facile',weight:1,text:`La balance affiche un chiffre proche, sans jamais inquiéter qui que ce soit dans le vestiaire.`},
  {id:'cw_fa_08',tier:'facile',weight:1,text:`Deux repas plus légers suffisent. Le staff médical ne juge même pas utile de passer voir comment ça va.`},
  {id:'cw_fa_09',tier:'facile',weight:1,text:`Le bain chaud du soir dure vingt minutes, pas plus — juste assez pour finir le travail.`},
  {id:'cw_fa_10',tier:'facile',weight:1,text:`Un chewing-gum à la place du grignotage habituel, et la marge nécessaire est déjà couverte.`},
  {id:'cw_fa_11',tier:'facile',weight:1,text:`Rien d'extraordinaire cette semaine : un peu moins de féculents, un peu plus d'eau chaude au réveil.`},
  {id:'cw_fa_12',tier:'facile',weight:1,text:`Le coach nutrition parle d'un petit ajustement de routine, jamais d'une vraie coupe de poids.`},
  {id:'cw_fa_13',tier:'facile',weight:1,text:`Vous sautez le dessert deux soirs de suite. Le reste du plan de repas ne change pas.`},
  {id:'cw_fa_14',tier:'facile',weight:1,text:`Une marche digestive après chaque repas, en plus du programme habituel — la seule concession de la semaine.`},
  {id:'cw_fa_15',tier:'facile',weight:1,text:`Le sauna accueille votre passage sans drame, vingt minutes montre en main, pas une de plus.`},
  {id:'cw_fa_16',tier:'facile',weight:1,text:`Moins de pain, plus d'eau : la routine standard d'avant-combat, sans surprise ni inquiétude.`},
  {id:'cw_fa_17',tier:'facile',weight:1,text:`Le kiné surveille la peau et les articulations, pas le chiffre sur la balance — rien à signaler de ce côté.`},
  {id:'cw_fa_18',tier:'facile',weight:1,text:`Une petite fenêtre de restriction hydrique la veille au soir, comme des dizaines de fois avant.`},
  {id:'cw_fa_19',tier:'facile',weight:1,text:`L'équipe plaisante sur le poids en salle de sport — signe qu'il n'y a vraiment rien à craindre.`},
  {id:'cw_fa_20',tier:'facile',weight:1,text:`Un jus vert amer remplace le café du matin. Le sacrifice s'arrête à peu près là.`},
  {id:'cw_no_01',tier:'normal',weight:1,text:`Le sauna, le sac poubelle sous le survêtement, la routine complète du métier depuis des années.`},
  {id:'cw_no_02',tier:'normal',weight:1,text:`Trois jours sans glucides, un dernier bain chaud la veille : le protocole classique, sans fioriture.`},
  {id:'cw_no_03',tier:'normal',weight:1,text:`Le coach chronomètre chaque passage au sauna — dix minutes, pause, dix minutes de plus.`},
  {id:'cw_no_04',tier:'normal',weight:1,text:`La faim s'installe dès le deuxième jour, familière, presque prévisible à ce stade de carrière.`},
  {id:'cw_no_05',tier:'normal',weight:1,text:`Un sachet de thé glissé sous la langue pour tromper la soif, vieux truc de vestiaire.`},
  {id:'cw_no_06',tier:'normal',weight:1,text:`Les crampes commencent en fin d'après-midi. Rien qui sorte de l'ordinaire pour ce genre de coupe.`},
  {id:'cw_no_07',tier:'normal',weight:1,text:`Le kiné masse les mollets qui commencent à se raidir, symptôme classique de la déshydratation contrôlée.`},
  {id:'cw_no_08',tier:'normal',weight:1,text:`Trois kilos à perdre en cinq jours : le calcul tourne en boucle dans la tête au réveil.`},
  {id:'cw_no_09',tier:'normal',weight:1,text:`Le sel disparaît complètement de l'assiette depuis mardi. Jeudi, même l'eau a un goût différent.`},
  {id:'cw_no_10',tier:'normal',weight:1,text:`Un bonnet et deux sweats pour courir en pleine chaleur — la panoplie habituelle de la semaine de pesée.`},
  {id:'cw_no_11',tier:'normal',weight:1,text:`Le poids baisse lentement, presque à la même vitesse qu'à chaque camp précédent.`},
  {id:'cw_no_12',tier:'normal',weight:1,text:`La tête tourne un peu en se levant du sauna, sans que ça inquiète personne dans le vestiaire.`},
  {id:'cw_no_13',tier:'normal',weight:1,text:`Le coach nutrition ajuste les derniers grammes d'eau à coups de petites gorgées chronométrées.`},
  {id:'cw_no_14',tier:'normal',weight:1,text:`Un dernier passage au sauna la veille au soir, puis plus rien jusqu'à la pesée du lendemain.`},
  {id:'cw_no_15',tier:'normal',weight:1,text:`Les mains tremblent un peu en signant l'autorisation médicale d'avant-pesée — la déshydratation, encore.`},
  {id:'cw_no_16',tier:'normal',weight:1,text:`Le protocole tient sur une feuille scotchée au mur du vestiaire, cochée jour après jour.`},
  {id:'cw_no_17',tier:'normal',weight:1,text:`Manger un fruit sec pour tenir jusqu'au bain chaud — le seul luxe autorisé cette semaine-là.`},
  {id:'cw_no_18',tier:'normal',weight:1,text:`Le sommeil devient difficile la nuit précédant la pesée, ventre vide et tête pleine de calculs.`},
  {id:'cw_no_19',tier:'normal',weight:1,text:`L'odeur du sauna colle encore aux cheveux au moment de monter sur la balance.`},
  {id:'cw_no_20',tier:'normal',weight:1,text:`Le corps proteste un peu, sans jamais franchir la ligne rouge que le staff surveille de près.`},
  {id:'cw_no_21',tier:'normal',weight:2,req:ctx=>!!ctx.veteran,
   text:`Le même protocole que d'habitude, mais le corps met plus longtemps à répondre qu'il y a dix ans.`},
  {id:'cw_no_22',tier:'normal',weight:2,req:ctx=>!!ctx.veteran,
   text:`Ce qui passait en deux jours à vingt-cinq ans en prend maintenant trois, sans que personne n'en parle à voix haute.`},
  {id:'cw_no_23',tier:'normal',weight:2,req:ctx=>!!ctx.divDescended,
   text:`La nouvelle catégorie demande un effort que l'ancienne ne réclamait jamais — le corps réapprend une limite plus basse.`},
  {id:'cw_no_24',tier:'normal',weight:2,req:ctx=>!!ctx.divDescended,
   text:`Descendre d'une catégorie n'était pas qu'une décision sur le papier : la balance le rappelle chaque matin cette semaine.`},
  {id:'cw_no_25',tier:'normal',weight:2,req:ctx=>!!ctx.divDescended,
   text:`Le poids de forme d'hier devient le poids à perdre aujourd'hui — la nouvelle catégorie ne pardonne rien de gratuit.`},
  {id:'cw_no_26',tier:'normal',weight:1,text:`Le régime tient sur trois jours pile, ni plus ni moins, réglé comme une horloge.`},
  {id:'cw_no_27',tier:'normal',weight:1,text:`Une soupe de légumes le soir, un fruit le matin — la routine de la semaine de pesée.`},
  {id:'cw_no_28',tier:'normal',weight:1,text:`Le coach vérifie le poids deux fois par jour, sans commentaire particulier.`},
  {id:'cw_no_29',tier:'normal',weight:1,text:`Les jambes sont un peu lourdes à l'entraînement léger du matin, rien d'inhabituel.`},
  {id:'cw_no_30',tier:'normal',weight:1,text:`Le sauna devient une habitude de la semaine, ni redoutée ni banale.`},
  {id:'cw_no_31',tier:'normal',weight:1,text:`Deux verres d'eau de moins par repas, méthodiquement, jusqu'au jour de la pesée.`},
  {id:'cw_no_32',tier:'normal',weight:1,text:`Le miroir du vestiaire renvoie un visage un peu plus creusé que d'habitude.`},
  {id:'cw_no_33',tier:'normal',weight:1,text:`La balance recule kilo après kilo, au rythme prévu par le staff.`},
  {id:'cw_no_34',tier:'normal',weight:1,text:`Un dernier bol de riz blanc la veille, sans assaisonnement, pour finir la coupe en douceur.`},
  {id:'cw_no_35',tier:'normal',weight:1,text:`Le préparateur physique surveille la fatigue plus que le poids lui-même, cette semaine-là.`},
  {id:'cw_co_01',tier:'complique',weight:1,text:`Le sauna, le sac poubelle, six heures à cracher dans un gobelet : pitoyable, mais professionnel.`},
  {id:'cw_co_02',tier:'complique',weight:1,text:`La vision se trouble par moments en fin de coupe — signal que le staff médical surveille de près.`},
  {id:'cw_co_03',tier:'complique',weight:1,text:`Le dernier kilo refuse de partir. Chaque minute au sauna semble ne plus rien changer.`},
  {id:'cw_co_04',tier:'complique',weight:1,text:`Le corps entier tremble en sortant du bain brûlant, jambes en coton jusqu'à la balance.`},
  {id:'cw_co_05',tier:'complique',weight:1,text:`Les crampes arrivent aux mollets, puis aux mains — le prix habituel d'une coupe à ce niveau.`},
  {id:'cw_co_06',tier:'complique',weight:1,text:`Le médecin de commission reste posté à côté du sauna, prêt à interrompre la séance.`},
  {id:'cw_co_07',tier:'complique',weight:1,text:`Dormir devient presque impossible, le ventre creux et la bouche sèche jusqu'à l'os.`},
  {id:'cw_co_08',tier:'complique',weight:1,text:`Le coach répète de ne pas parler pour économiser l'eau que le corps n'a plus.`},
  {id:'cw_co_09',tier:'complique',weight:1,text:`La peau tire sur les os en se regardant dans le miroir du vestiaire, méconnaissable.`},
  {id:'cw_co_10',tier:'complique',weight:1,text:`Le dernier passage au sauna se fait assis, parce que rester debout demande déjà trop d'énergie.`},
  {id:'cw_co_11',tier:'complique',weight:2,req:ctx=>!!ctx.veteran,
   text:`À cet âge, une coupe pareille ne se récupère plus en une nuit de sommeil — le corps réclamera son dû après le combat aussi.`},
  {id:'cw_co_12',tier:'complique',weight:2,req:ctx=>!!ctx.veteran,
   text:`Le staff médical insiste plus qu'avant pour ce genre de coupe. Le corps ne pardonne plus rien depuis quelques années.`},
  {id:'cw_co_13',tier:'complique',weight:2,req:ctx=>!!ctx.veteran,
   text:`Ce genre d'effort avait un coût plus léger, autrefois. Ce n'est plus le cas depuis un moment.`},
  {id:'cw_co_14',tier:'complique',weight:3,req:ctx=>!!ctx.thirdComplique,
   text:`Troisième coupe compliquée d'affilée. Le corps commence à ne plus vraiment récupérer entre deux camps.`},
  {id:'cw_co_15',tier:'complique',weight:3,req:ctx=>!!ctx.thirdComplique,
   text:`Le staff s'inquiète tout haut cette fois : enchaîner un troisième cutting difficile n'est plus tenable indéfiniment.`},
  {id:'cw_co_16',tier:'complique',weight:3,req:ctx=>!!ctx.thirdComplique,
   text:`Le corps garde la mémoire des deux dernières coupes compliquées — celle-ci s'annonce encore plus dure à encaisser.`},
  {id:'cw_co_17',tier:'complique',weight:2,req:ctx=>!!ctx.divDescended,
   text:`Descendre de catégorie ne devait être qu'un chiffre sur le contrat. Sur la balance, c'est une vraie guerre.`},
  {id:'cw_co_18',tier:'complique',weight:2,req:ctx=>!!ctx.divDescended,
   text:`Le nouveau poids de forme reste un objectif lointain — cette semaine ressemble à une négociation permanente avec le corps.`},
  {id:'cw_co_19',tier:'complique',weight:2,req:ctx=>!!ctx.divDescended,
   text:`La nouvelle catégorie exige un sacrifice que l'ancienne épargnait. Le staff se demande à voix basse si le choix était le bon.`},
  {id:'cw_co_20',tier:'complique',weight:2,req:ctx=>!!ctx.divDescended,
   text:`Changer de catégorie sur le papier était simple. L'imposer au corps, cette semaine, l'est beaucoup moins.`},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_PRESSCONF_POSTURES_V4] — Plan V4 LOT 7 §C19 point 1 :
   voir ANCRE V4_C19_PRESSCONF_POSTURES (ui-04) pour le mécanisme de tirage.
   15 entrées, 5 par catégorie (`tier`='respect'/'provocation'/'silence' —
   les TROIS BRANCHES MÉCANIQUES de faithPressConfPosture(), ui-08, jamais
   modifiées par ce lot). `text` est un objet {label,hint} direct (pas une
   fonction : aucune de ces accroches n'a besoin d'interpoler l'adversaire,
   déjà nommé juste au-dessus sur l'écran) — txtPick() accepte cette forme
   telle quelle (engine.js : `typeof chosen.text==='function'?...:chosen.
   text`). req(ctx) lit f.personality et ctx.commonHistory (nombre de
   face-à-face déjà disputés contre CET adversaire précis), les deux champs
   demandés par le document. */
const FAITH_PRESSCONF_POSTURES=[
  {id:'pcp_respect_default',tier:'respect',weight:1,
   text:{label:'Le respect',hint:'Une poignée de main. Tension basse, crédit auprès du directeur.'}},
  {id:'pcp_respect_villain',tier:'respect',weight:2,req:ctx=>ctx.personality==='villain',
   text:{label:'Le respect calculé',hint:'Vous jouez la carte du fair-play, pour une fois — ça change du personnage habituel.'}},
  {id:'pcp_respect_humble',tier:'respect',weight:2,req:ctx=>ctx.personality==='humble',
   text:{label:'Le respect sincère',hint:'Deux mots sur son parcours, sans calcul. Le genre de geste qu’on attend de vous.'}},
  {id:'pcp_respect_showman',tier:'respect',weight:2,req:ctx=>ctx.personality==='showman',
   text:{label:'Le respect mis en scène',hint:'Une accolade filmée sous tous les angles — sincère, mais jamais sans caméra.'}},
  {id:'pcp_respect_rivalry',tier:'respect',weight:2,req:ctx=>(ctx.commonHistory||0)>=1,
   text:{label:'Le respect de circonstance',hint:'Vous vous connaissez déjà trop bien pour rejouer la carte de la haine.'}},
  {id:'pcp_provoc_default',tier:'provocation',weight:1,
   text:{label:'La provocation',hint:'Un levier pour négocier — mais il n’arrivera pas dans le même état.'}},
  {id:'pcp_provoc_villain',tier:'provocation',weight:2,req:ctx=>ctx.personality==='villain',
   text:{label:'Le règlement de comptes',hint:'Vous ne retenez plus rien — la salle en redemande, le directeur grimace.'}},
  {id:'pcp_provoc_humble',tier:'provocation',weight:2,req:ctx=>ctx.personality==='humble',
   text:{label:'La provocation malgré vous',hint:'Ce n’est pas votre registre habituel, mais un mot de trop vous a échappé.'}},
  {id:'pcp_provoc_showman',tier:'provocation',weight:2,req:ctx=>ctx.personality==='showman',
   text:{label:'Le show avant le combat',hint:'Vous vendez l’affrontement comme un spectacle, quitte à en rajouter.'}},
  {id:'pcp_provoc_rivalry',tier:'provocation',weight:2,req:ctx=>(ctx.commonHistory||0)>=1,
   text:{label:'Vieux compte à régler',hint:'Cette fois, les politesses habituelles ne survivent pas à la troisième question.'}},
  {id:'pcp_silence_default',tier:'silence',weight:1,
   text:{label:'Le silence',hint:'Deux phrases, pas une de plus. Personne ne pourra vous citer.'}},
  {id:'pcp_silence_villain',tier:'silence',weight:2,req:ctx=>ctx.personality==='villain',
   text:{label:'Le mépris silencieux',hint:'Vous ne daignez même pas répondre — le silence, ici, est une insulte de plus.'}},
  {id:'pcp_silence_humble',tier:'silence',weight:2,req:ctx=>ctx.personality==='humble',
   text:{label:'Le silence naturel',hint:'Vous n’avez jamais eu grand-chose à prouver en dehors de la cage.'}},
  {id:'pcp_silence_showman',tier:'silence',weight:2,req:ctx=>ctx.personality==='showman',
   text:{label:'Le silence qui joue avec l’attente',hint:'Vous laissez le vide durer une seconde de trop, exprès, pour faire parler la salle.'}},
  {id:'pcp_silence_rivalry',tier:'silence',weight:2,req:ctx=>(ctx.commonHistory||0)>=1,
   text:{label:'Plus rien à dire',hint:'Vous vous êtes déjà tout dit la dernière fois. Le reste se réglera dans la cage.'}},
];
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DATA_FAITH_PESEE_SITUATIONS_V4] — Plan V4 LOT 7 §C19 point 3 :
   la pesée n'avait aucun écran propre — un simple palier de coupe calculé
   en silence (CUTTING_5PALIERS, ui-02/ui-08). scr_faith_pesee() (ui-04)
   choisit un REGISTRE parmi cinq (calme/tendu/comique/menaçant/spectacle,
   pondéré par f.personality — faithPeseeRegistre(), ui-04) puis tire une
   mise en scène dans ce registre via `tier` (même mécanisme de filtre que
   les postures ci-dessus). req(ctx)/text(ctx) lisent f.personality et le
   trait de l'adversaire (ctx.trait = opp.bio.trait, déjà posé à la
   création — engine.js FIGHTER_BIO_C14) : les deux champs demandés par le
   document. 60 entrées, 12 par registre. Gating (fréquence d'apparition de
   l'écran) : voir ANCRE V4_C19_PESEE_GATING, ui-08 — mêmes conditions que
   la conférence de presse, jamais plus généreux. */
const FAITH_PESEE_SITUATIONS=[
  {id:'ps_calme_01',tier:'calme',weight:1,
   text:({oppName,trait})=>`Les deux camps se saluent sans excès. ${esc(oppName)} monte sur la balance sans un mot de trop.`},
  {id:'ps_calme_02',tier:'calme',weight:1,
   text:()=>`Le protocole se déroule sans accroc, presque cérémonieux — une pesée comme le règlement les imagine.`},
  {id:'ps_calme_03',tier:'calme',weight:1,req:ctx=>ctx.personality==='humble',
   text:({oppName,trait})=>`Deux poignées de main, deux hochements de tête. ${esc(oppName)} semble presque soulagé de ne pas avoir à jouer un rôle.`},
  {id:'ps_calme_04',tier:'calme',weight:1,req:ctx=>!!ctx.trait,
   text:({oppName,trait})=>`${esc(oppName)} garde son rituel habituel : ${esc(trait)} Personne ne s'en formalise.`},
  {id:'ps_calme_05',tier:'calme',weight:1,
   text:()=>`Le photographe peine à sortir un cliché intéressant — la scène est trop paisible pour faire la une.`},
  {id:'ps_calme_06',tier:'calme',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} félicite sobrement le camp adverse pour la préparation, sans jamais insister.`},
  {id:'ps_calme_07',tier:'calme',weight:1,
   text:()=>`La salle applaudit poliment. Rien ici ne ressemble à un règlement de comptes.`},
  {id:'ps_calme_08',tier:'calme',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} redescend de la balance et va directement discuter avec son propre staff, sans un regard superflu.`},
  {id:'ps_calme_09',tier:'calme',weight:1,
   text:()=>`Le commissaire annonce les deux poids d'une voix neutre. La routine, purement.`},
  {id:'ps_calme_10',tier:'calme',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} vous adresse un signe de tête avant de quitter la scène, sans chercher le contact prolongé.`},
  {id:'ps_calme_11',tier:'calme',weight:1,
   text:()=>`Rien à signaler pour la presse — le genre de pesée qui ne fera aucune image mémorable.`},
  {id:'ps_calme_12',tier:'calme',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} enfile son peignoir et s'éloigne sans un mot de plus, la formalité terminée.`},
  {id:'ps_tendu_01',tier:'tendu',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} refuse de vous regarder pendant l'annonce des poids. L'air se charge un peu.`},
  {id:'ps_tendu_02',tier:'tendu',weight:1,
   text:()=>`Les deux équipes se tiennent à distance, presque trop calculée pour être naturelle.`},
  {id:'ps_tendu_03',tier:'tendu',weight:1,req:ctx=>!!ctx.trait,
   text:({oppName,trait})=>`${esc(oppName)} garde une habitude connue de tous : ${esc(trait)} Ce soir, ça ressemble plutôt à de la nervosité.`},
  {id:'ps_tendu_04',tier:'tendu',weight:1,
   text:({oppName,trait})=>`La sécurité se rapproche discrètement en voyant ${esc(oppName)} et vous vous approcher un peu trop près.`},
  {id:'ps_tendu_05',tier:'tendu',weight:1,
   text:()=>`Un silence pesant s'installe sur la scène — personne ne veut être le premier à parler.`},
  {id:'ps_tendu_06',tier:'tendu',weight:1,req:ctx=>ctx.personality==='humble',
   text:({oppName,trait})=>`Vous ne dites rien, mais ${esc(oppName)} semble chercher la moindre réaction sur votre visage.`},
  {id:'ps_tendu_07',tier:'tendu',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} serre la main un peu trop fort, un message plus qu'une politesse.`},
  {id:'ps_tendu_08',tier:'tendu',weight:1,
   text:()=>`Les photographes sentent que quelque chose peut déraper — les objectifs se braquent, prêts.`},
  {id:'ps_tendu_09',tier:'tendu',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} reste immobile une seconde de trop face à vous, jusqu'à ce que le staff intervienne.`},
  {id:'ps_tendu_10',tier:'tendu',weight:1,
   text:()=>`L'organisation resserre le dispositif de sécurité entre les deux équipes, par précaution.`},
  {id:'ps_tendu_11',tier:'tendu',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} marmonne quelque chose en quittant la balance, trop bas pour être entendu clairement.`},
  {id:'ps_tendu_12',tier:'tendu',weight:1,
   text:()=>`La tension redescend doucement une fois les deux poids annoncés, sans jamais vraiment disparaître.`},
  {id:'ps_comique_01',tier:'comique',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} monte sur la balance déguisé, arrachant un rire général même chez votre propre équipe.`},
  {id:'ps_comique_02',tier:'comique',weight:1,req:ctx=>!!ctx.trait,
   text:({oppName,trait})=>`${esc(oppName)} sort son excentricité habituelle devant les caméras : ${esc(trait)} La salle rit franchement.`},
  {id:'ps_comique_03',tier:'comique',weight:1,req:ctx=>ctx.personality==='showman',
   text:({oppName,trait})=>`Vous improvisez une pose ridicule sur la balance. ${esc(oppName)} n'a d'autre choix que de sourire.`},
  {id:'ps_comique_04',tier:'comique',weight:1,
   text:()=>`Un journaliste trébuche sur son propre micro en pleine annonce des poids, désamorçant instantanément l'ambiance.`},
  {id:'ps_comique_05',tier:'comique',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} fait mine de peser plus lourd en gonflant les joues, sous les rires de la salle.`},
  {id:'ps_comique_06',tier:'comique',weight:1,
   text:()=>`Le speaker se trompe deux fois de nom en annonçant les combattants, provoquant l'hilarité générale.`},
  {id:'ps_comique_07',tier:'comique',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} vous propose une photo façon carte postale, bras autour des épaules, sourire figé.`},
  {id:'ps_comique_08',tier:'comique',weight:1,
   text:()=>`La mascotte de l'organisation s'incruste sur scène pendant la pesée, au grand amusement du public.`},
  {id:'ps_comique_09',tier:'comique',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} imite votre garde de combat de façon volontairement grotesque, pour détendre l'atmosphère.`},
  {id:'ps_comique_10',tier:'comique',weight:1,
   text:()=>`Quelqu'un dans le public crie une blague potache — même l'arbitre a du mal à garder son sérieux.`},
  {id:'ps_comique_11',tier:'comique',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} lance une petite pique bon enfant, suivie d'un clin d'œil qui désamorce tout.`},
  {id:'ps_comique_12',tier:'comique',weight:1,
   text:()=>`La musique d'entrée part avant l'heure par erreur technique, transformant la pesée en sketch improvisé.`},
  {id:'ps_menacant_01',tier:'menacant',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} vous fixe sans ciller pendant l'intégralité du face-à-face, mâchoire serrée.`},
  {id:'ps_menacant_02',tier:'menacant',weight:1,req:ctx=>ctx.personality==='villain',
   text:({oppName,trait})=>`Vous refusez de baisser les yeux le premier. ${esc(oppName)} finit par reculer d'un pas, visiblement agacé.`},
  {id:'ps_menacant_03',tier:'menacant',weight:1,req:ctx=>!!ctx.trait,
   text:({oppName,trait})=>`${esc(oppName)} laisse tomber son habitude connue de tous — ${esc(trait)} — pour un silence beaucoup plus lourd que d'ordinaire.`},
  {id:'ps_menacant_04',tier:'menacant',weight:1,
   text:()=>`Les fronts se touchent presque pendant le face-à-face. Le staff des deux camps se prépare déjà à intervenir.`},
  {id:'ps_menacant_05',tier:'menacant',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} murmure une menace assez basse pour que seul vous l'entendiez, puis s'éloigne sans un regard.`},
  {id:'ps_menacant_06',tier:'menacant',weight:1,
   text:()=>`La sécurité s'interpose physiquement entre les deux équipes avant même la fin de l'annonce des poids.`},
  {id:'ps_menacant_07',tier:'menacant',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} pointe un doigt vers vous en articulant une promesse silencieuse, sans un mot audible.`},
  {id:'ps_menacant_08',tier:'menacant',weight:1,
   text:()=>`Un poussez-poussez éclate un instant entre les deux staffs avant d'être maîtrisé par la sécurité.`},
  {id:'ps_menacant_09',tier:'menacant',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} arrache presque le drapeau des mains de l'organisateur en montant sur scène, mâchoires serrées.`},
  {id:'ps_menacant_10',tier:'menacant',weight:1,
   text:()=>`Le silence qui suit le face-à-face est plus lourd que n'importe quelle insulte échangée avant.`},
  {id:'ps_menacant_11',tier:'menacant',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} vous bouscule légèrement l'épaule en descendant de la balance, comme un dernier mot silencieux.`},
  {id:'ps_menacant_12',tier:'menacant',weight:1,
   text:()=>`Le commissaire hausse le ton pour rétablir le calme, une première pour cette organisation depuis longtemps.`},
  {id:'ps_spectacle_01',tier:'spectacle',weight:1,req:ctx=>ctx.personality==='showman',
   text:({oppName,trait})=>`Vous arrivez sur scène dans une mise en scène digne d'un concert. ${esc(oppName)} peine à suivre le rythme.`},
  {id:'ps_spectacle_02',tier:'spectacle',weight:1,
   text:()=>`Les confettis tombent avant même l'annonce des poids — l'organisation n'a pas lésiné sur la mise en scène.`},
  {id:'ps_spectacle_03',tier:'spectacle',weight:1,req:ctx=>!!ctx.trait,
   text:({oppName,trait})=>`${esc(oppName)} transforme son habitude connue en numéro complet devant les caméras : ${esc(trait)}`},
  {id:'ps_spectacle_04',tier:'spectacle',weight:1,
   text:()=>`Les écrans géants diffusent un montage vidéo des meilleurs moments des deux carrières, sous un tonnerre d'applaudissements.`},
  {id:'ps_spectacle_05',tier:'spectacle',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} enlève sa veste avec une lenteur théâtrale, jouant clairement pour les photographes.`},
  {id:'ps_spectacle_06',tier:'spectacle',weight:1,
   text:()=>`Le public scande déjà les deux noms en chœur, transformant la pesée en avant-goût de soirée de gala.`},
  {id:'ps_spectacle_07',tier:'spectacle',weight:1,req:ctx=>ctx.personality==='showman',
   text:({oppName,trait})=>`Vous répondez à chaque geste de ${esc(oppName)} par un geste encore plus grand, sous les rires ravis du public.`},
  {id:'ps_spectacle_08',tier:'spectacle',weight:1,
   text:()=>`Un feu d'artifice intérieur salue l'entrée des deux combattants, réglé au dixième de seconde par la production.`},
  {id:'ps_spectacle_09',tier:'spectacle',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} pose longuement pour les photographes, changeant trois fois de posture avant de descendre de scène.`},
  {id:'ps_spectacle_10',tier:'spectacle',weight:1,
   text:()=>`La musique d'entrée résonne encore dans la salle bien après que les deux combattants ont quitté la balance.`},
  {id:'ps_spectacle_11',tier:'spectacle',weight:1,
   text:({oppName,trait})=>`${esc(oppName)} lance son t-shirt dans le public, comme si le combat avait déjà commencé.`},
  {id:'ps_spectacle_12',tier:'spectacle',weight:1,
   text:()=>`Les caméras multiplient les ralentis sur le face-à-face — l'organisation sait qu'elle tient une image qui tournera en boucle.`},
];
/* ==== [FIN ANCRE] ==== */
