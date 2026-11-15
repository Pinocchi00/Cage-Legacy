"use strict";
/* Maquette lot 1 — le Recruteur (R26 ; Q26a à Q26d ; T10). L'onglet « Recruteur » de l'écran Recrutement.
   On choisit une destination (un pays, ou une région comme le Daghestan), pas un style ni une catégorie : il ramène
   toutes les catégories, hommes et femmes (Q26c). Le prix et la date de retour ne dépendent que de la distance depuis
   Lyon, siège de Split (Q26a), et du temps passé là-bas : billet aller-retour + jours × forfait. Le hasard est le même
   partout ; ce qui change d'un pays à l'autre, ce sont ses spécialités, de vrais styles de combat (Q26b, À RELIRE).
   2, 4 ou 6 profils selon la durée (Q26d). Plus d'écran « Ses retours » : le départ et le rapport arrivent dans les
   Messages (T10), le rapport ouvre les profils, dont les statistiques sont visibles puisqu'il les a vus (Q25b).
   Chargé après resultats.js : écran « recruteur » (la barre garde « Recrutement » allumé). Préfixe rt. */

/* ---- Les styles : vrais noms, famille de jeu (statistiques) et art martial de la fiche (À RELIRE) ---- */
const RT_STYLES={
  'Boxe anglaise':['Frappeur','Boxe','Les poings seulement.'],
  'Kickboxing':['Kickboxeur','Kickboxing','Pieds et poings.'],
  'Muay-thaï':['Kickboxeur','Muay-thaï','Coudes, genoux, clinch.'],
  'Karaté':['Kickboxeur','Karaté','Frappe de loin, en entrant et sortant.'],
  'Taekwondo':['Kickboxeur','Karaté','Les coups de pied.'],
  'Lutte':['Lutteur','Lutte','Amenées au sol et contrôle.'],
  'Judo':['Grappler','Judo','Projections, puis contrôle au sol.'],
  'Sambo':['Lutteur','Sambo','Lutte, projections et clés.'],
  'Jiu-jitsu brésilien':['Grappler','Jiu-jitsu brésilien','Le sol : étranglements et clés.'],
  /* Les spécialités propres à un pays (À RELIRE). */
  'Boxe française':['Kickboxeur','Kickboxing','La savate : pieds et poings.'],
  'Lutte sénégalaise':['Lutteur','Lutte','La lutte avec frappe.'],
  'Lutte mongole':['Lutteur','Lutte','Le bökh : projections.'],
  'Sanda':['Kickboxeur','Kickboxing','La boxe chinoise : frappes et projections.'],
  'Lutte universitaire':['Lutteur','Lutte','La lutte des universités américaines.'],
  'Karaté Kyokushin':['Kickboxeur','Karaté','Le karaté au contact.'],
  'Lutte gréco-romaine':['Lutteur','Lutte','Le corps à corps, sans saisir les jambes.'],
};
const RT_TOUS=Object.keys(RT_STYLES);
/* Hors des spécialités du pays : les styles qu'on trouve dans toutes les salles du monde. */
const RT_PARTOUT=['Boxe anglaise','Kickboxing','Lutte','Judo','Jiu-jitsu brésilien'];
const RT_REGIONS=['Europe de l’Ouest','Europe de l’Est et Asie centrale','Asie et Océanie','Amériques','Afrique'];
const RT_LYON=[45.764,4.836];

/* ---- Les destinations (Q26b : les neuf du jeu, puis les pays les plus connus du MMA ; À RELIRE).
   a : « au / en / aux / à » ; ll : coordonnées de la première ville ; train : heures de train (sinon avion) ;
   circuits : les petites organisations locales (celles du jeu, sinon inventées) ; H, F : prénoms ; N : noms. ---- */
const RT_DEST=[
  {id:'france',pays:'France',a:'en',reg:'Europe',villes:['Paris','Marseille'],ll:[48.857,2.352],train:2,spec:['Boxe française','Judo','Boxe anglaise'],
   circuits:['Cage de l’Ouest','Circuit des Alpes','Ligue du Nord'],H:'Hugo,Yanis,Mathis,Bilal,Nolan,Rayan,Théo,Maxence',F:'Léa,Inès,Manon,Sarah,Chloé,Yasmine,Océane,Lina',N:'Moreau,Benali,Girard,Traoré,Lemoine,Perrin,Haddad,Roussel,Marchand,Diakité'},
  {id:'italie',pays:'Italie',a:'en',reg:'Europe',villes:['Turin','Milan'],ll:[45.070,7.687],train:4,spec:['Kickboxing','Muay-thaï'],
   circuits:['Gala du Piémont','Ligue lombarde','Cage de Ligurie'],H:'Matteo,Lorenzo,Davide,Simone,Alessio,Riccardo,Gabriele,Federico',F:'Giulia,Chiara,Sara,Martina,Alessia,Federica',N:'Ferrari,Colombo,Greco,Bruno,Marino,Conti,De Luca,Mancini,Barbieri,Galli'},
  {id:'paysbas',pays:'Pays-Bas',a:'aux',reg:'Europe',villes:['Amsterdam','Breda'],ll:[52.370,4.895],spec:['Kickboxing','Muay-thaï'],
   circuits:['Cage du Brabant','Circuit du Nord','Ligue des Polders'],H:'Daan,Sem,Jesse,Mohamed,Thijs,Bram,Youssef,Ruben',F:'Sanne,Fleur,Lotte,Noor',N:'de Vries,Bakker,Visser,Smit,Meijer,de Boer,Mulder,El Amrani,Bos,Vos'},
  {id:'royaumeuni',pays:'Royaume-Uni',a:'au',reg:'Europe',villes:['Liverpool','Manchester'],ll:[53.408,-2.991],spec:['Boxe anglaise','Kickboxing'],
   circuits:['Cage de la Mersey','Circuit du Lancashire','Ligue des Midlands'],H:'Jack,Connor,Callum,Lewis,Kieran,Reece,Tyler,Jordan',F:'Chloe,Megan,Abbie,Holly',N:'Hughes,Gallagher,Dawson,Fletcher,Barnes,Holt,Wright,Lowe,Platt,Hargreaves'},
  {id:'irlande',pays:'Irlande',a:'en',reg:'Europe',villes:['Dublin'],ll:[53.350,-6.260],spec:['Boxe anglaise','Jiu-jitsu brésilien'],
   circuits:['Cage de Leinster','Circuit du Connacht'],H:'Cian,Darragh,Oisín,Seán,Ciarán,Rory,Eoin,Niall',F:'Aoife,Saoirse,Niamh,Ciara',N:'O’Brien,Kavanagh,Quinn,Fitzgerald,Keane,Duffy,Lynch,Gorman,Tierney,Mac Carthy'},
  {id:'suede',pays:'Suède',a:'en',reg:'Europe',villes:['Stockholm','Göteborg'],ll:[59.329,18.069],spec:['Lutte gréco-romaine','Kickboxing'],
   circuits:['Cage de Södermalm','Circuit du Västergötland'],H:'Elias,Viktor,Linus,Isak,Albin,Hampus,Leo,Melvin',F:'Elsa,Maja,Ebba,Wilma',N:'Johansson,Nyström,Berg,Lindqvist,Sandberg,Holm,Åberg,Engström,Falk,Sjöberg'},
  {id:'pologne',pays:'Pologne',a:'en',reg:'Europe',villes:['Varsovie','Gdańsk'],ll:[52.230,21.012],spec:['Judo','Lutte gréco-romaine','Kickboxing'],
   circuits:['Cage de Silésie','Circuit de Mazovie','Ligue de la Vistule'],H:'Kacper,Jakub,Mateusz,Bartosz,Szymon,Dawid,Michał,Wojciech',F:'Zuzanna,Natalia,Weronika,Aleksandra',N:'Nowak,Wiśniewski,Wójcik,Kowalczyk,Mazur,Krawczyk,Zając,Pawlak,Sikora,Lewandowski'},
  {id:'georgie',pays:'Géorgie',a:'en',reg:'Caucase et Asie centrale',villes:['Tbilissi','Koutaïssi'],ll:[41.716,44.783],spec:['Lutte libre','Judo','Lutte gréco-romaine'],
   circuits:['Cage de Tbilissi','Ligue de Kartlie'],H:'Giorgi,Levan,Nika,Davit,Irakli,Saba,Tornike,Zurab',F:'Nino,Mariam,Ana,Tamar',N:'Beridze,Kapanadze,Gelashvili,Lomidze,Tsiklauri,Maisuradze,Japaridze,Chkheidze,Gogoladze,Abashidze'},
  {id:'daghestan',pays:'Daghestan',a:'au',reg:'Caucase et Asie centrale',villes:['Makhatchkala','Khassaviourt'],ll:[42.983,47.504],spec:['Lutte libre','Sambo de combat','Sanda'],
   circuits:['Cercle de Makhatchkala','Ligue du Caucase','Défi de la Caspienne'],H:'Magomed,Abdulrashid,Gadzhi,Murad,Arsen,Rasul,Kamil,Akhmed',F:'Patimat,Aminat,Zarema,Madina',N:'Gadzhiev,Abdulaev,Omarov,Rasulov,Kurbanov,Isaev,Akhmedov,Gasanov,Alikhanov,Dzhamalov'},
  {id:'russie',pays:'Russie',a:'en',reg:'Caucase et Asie centrale',villes:['Saint-Pétersbourg','Moscou'],ll:[59.934,30.336],spec:['Sambo de combat','Boxe anglaise','Judo'],
   circuits:['Cage de la Neva','Ligue de Moscou'],H:'Artyom,Nikita,Kirill,Dmitri,Maxim,Yegor,Roman,Ilya',F:'Anastasia,Daria,Polina,Ksenia',N:'Sorokin,Smirnov,Lebedev,Kozlov,Morozov,Belov,Zaitsev,Pavlov,Fedorov,Gromov'},
  {id:'kazakhstan',pays:'Kazakhstan',a:'au',reg:'Caucase et Asie centrale',villes:['Almaty','Astana'],ll:[43.238,76.946],spec:['Boxe anglaise','Lutte gréco-romaine'],
   circuits:['Cage de la Steppe','Ligue d’Almaty'],H:'Nurlan,Daniyar,Yerlan,Askar,Aibek,Arman,Bauyrzhan,Yerzhan',F:'Aigerim,Dana,Aruzhan,Zhanna',N:'Seitkali,Abenov,Zhakupov,Bekov,Sadykov,Ospanov,Ermekov,Utepov,Kassymov,Nurgaliev'},
  {id:'kirghizistan',pays:'Kirghizistan',a:'au',reg:'Caucase et Asie centrale',villes:['Bichkek','Och'],ll:[42.875,74.570],spec:['Lutte libre','Judo'],
   circuits:['Cage du Tian Shan','Circuit de Bichkek','Ligue de l’Ala-Too'],H:'Azamat,Bektur,Nursultan,Erlan,Kanybek,Ulan,Emil,Aktan',F:'Aizada,Begimai,Nurzada,Aiperi',N:'Asanov,Toktorov,Mamytov,Sydykov,Abdyrakhmanov,Osmonov,Zhumabaev,Tursunov,Imanaliev,Satybaldiev'},
  {id:'mongolie',pays:'Mongolie',a:'en',reg:'Caucase et Asie centrale',villes:['Oulan-Bator'],ll:[47.886,106.906],spec:['Lutte mongole','Judo','Sambo de combat'],
   circuits:['Cage de la Tuul','Ligue des steppes'],H:'Temuulen,Ganbold,Enkhbayar,Tuvshin,Batbayar,Sukhbat,Erdenebat,Bilguun',F:'Oyunbileg,Nomin,Anu,Solongo',N:'Ganzorig,Batsaikhan,Dorjsuren,Tsogtbaatar,Bayarsaikhan,Purevdorj,Altangerel,Damdinsuren,Lkhagva,Ochirbat'},
  {id:'thailande',pays:'Thaïlande',a:'en',reg:'Asie',villes:['Bangkok','Phuket'],ll:[13.756,100.502],spec:['Muay-thaï'],
   circuits:['Cage du Nord','Circuit de l’Isan','Ligue du Sud'],H:'Kittisak,Somchai,Anucha,Thanawat,Phongsak,Chaiyaphon,Sakda,Nattapong',F:'Pimchanok,Siriporn,Kanokwan,Rattana',N:'Saengthong,Kaewmanee,Chaiyasit,Phromsri,Wongsawat,Sitthiporn,Boonmee,Thongdee,Srisuk,Kongkaew'},
  {id:'japon',pays:'Japon',a:'au',reg:'Asie',villes:['Tokyo','Osaka'],ll:[35.676,139.650],spec:['Judo','Karaté Kyokushin','Lutte de soumission'],
   circuits:['Cage du Kansai','Circuit de Tohoku','Ligue du Chūbu'],H:'Haruto,Ren,Sota,Kaito,Yuma,Takumi,Ryota,Daiki',F:'Yui,Hina,Aoi,Misaki',N:'Takahashi,Nakamura,Kobayashi,Fujita,Ishikawa,Hayashi,Okada,Sakai,Kondo,Ueda'},
  {id:'coree',pays:'Corée du Sud',a:'en',reg:'Asie',villes:['Séoul','Busan'],ll:[37.567,126.978],spec:['Taekwondo','Judo'],
   circuits:['Cage de Gangnam','Ligue de Busan'],H:'Min-jun,Ji-ho,Seo-jun,Hyun-woo,Do-yun,Joon-young,Tae-hoon,Sung-min',F:'Seo-yeon,Ji-woo,Ha-eun,Su-bin',N:'Kim,Lee,Park,Choi,Jung,Kang,Yoon,Han,Shin,Oh'},
  {id:'chine',pays:'Chine',a:'en',reg:'Asie',villes:['Pékin','Chengdu'],ll:[39.904,116.407],spec:['Sanda','Shuai jiao'],
   circuits:['Cage de Pékin','Ligue du Sichuan'],H:'Wei,Hao,Jun,Lei,Zhiyuan,Yifan,Tao,Bo',F:'Xin,Yue,Mei,Lin',N:'Wang,Zhang,Liu,Chen,Zhao,Sun,Guo,Ma,He,Luo'},
  {id:'bresil',pays:'Brésil',a:'au',reg:'Amériques',villes:['Rio de Janeiro','Curitiba'],ll:[-22.907,-43.173],spec:['Jiu-jitsu brésilien','Muay-thaï'],
   circuits:['Cage du Paraná','Circuit du Nordeste','Ligue de l’Intérieur'],H:'Thiago,Gabriel,Lucas,Rafael,Matheus,Vinícius,Caio,Wellington',F:'Larissa,Bruna,Jéssica,Thaís,Ana Clara,Rayssa',N:'Souza,Lima,Almeida,Barbosa,Ribeiro,Nascimento,Teixeira,Cardoso,Monteiro,Araújo'},
  {id:'etatsunis',pays:'États-Unis',a:'aux',reg:'Amériques',villes:['Albuquerque','Las Vegas'],ll:[35.084,-106.650],spec:['Lutte universitaire','Boxe anglaise','Jiu-jitsu brésilien'],
   circuits:['Cage des Appalaches','Circuit des Grands Lacs','Ligue du Sud'],H:'Tyler,Cody,Hunter,Austin,Dakota,Brandon,Marcus,Logan',F:'Kayla,Brooke,Madison,Taylor,Shayna,Kelsey',N:'Johnson,Miller,Turner,Brooks,Sanders,Reed,Coleman,Price,Hayes,Bennett'},
  {id:'mexique',pays:'Mexique',a:'au',reg:'Amériques',villes:['Mexico','Tijuana'],ll:[19.433,-99.133],spec:['Boxe anglaise','Taekwondo'],
   circuits:['Cage de Jalisco','Ligue de Basse-Californie'],H:'Diego,Alejandro,Jesús,Luis,Emiliano,Héctor,Iván,Rodrigo',F:'Ximena,Valeria,Fernanda,Guadalupe',N:'Hernández,Ramírez,Flores,Mendoza,Cruz,Ortiz,Castillo,Aguilar,Navarro,Juárez'},
  {id:'canada',pays:'Canada',a:'au',reg:'Amériques',villes:['Montréal'],ll:[45.502,-73.567],spec:['Karaté Kyokushin','Kickboxing','Lutte libre'],
   circuits:['Cage du Québec','Ligue de l’Outaouais'],H:'Félix,Samuel,Olivier,Mathieu,Jérémy,Alexandre,William,Antoine',F:'Florence,Rosalie,Camille,Laurence',N:'Tremblay,Gagnon,Roy,Côté,Bouchard,Gauthier,Lavoie,Pelletier,Bélanger,Leblanc'},
  {id:'cuba',pays:'Cuba',a:'à',reg:'Amériques',villes:['La Havane'],ll:[23.113,-82.366],spec:['Boxe anglaise','Lutte gréco-romaine','Judo'],
   circuits:['Cage de La Havane','Ligue d’Oriente'],H:'Yoandry,Yasmani,Osmany,Lázaro,Reinier,Yordenis,Dayron,Alexei',F:'Yaneisy,Idalys,Dayana,Lisandra',N:'Fonseca,Valdés,Cárdenas,Despaigne,Echevarría,Batista,Hechavarría,Martí,Quesada,Bermúdez'},
  {id:'maroc',pays:'Maroc',a:'au',reg:'Afrique',villes:['Casablanca','Tanger'],ll:[33.573,-7.590],spec:['Kickboxing','Muay-thaï'],
   circuits:['Cage de Casablanca','Ligue du Rif'],H:'Youssef,Hamza,Anas,Mehdi,Othmane,Ayoub,Zakaria,Amine',F:'Salma,Imane,Khadija,Meryem',N:'El Idrissi,Bennani,Alaoui,Tazi,Berrada,Chraibi,El Fassi,Ziani,Lahlou,Bouzid'},
  {id:'senegal',pays:'Sénégal',a:'au',reg:'Afrique',villes:['Dakar'],ll:[14.716,-17.467],spec:['Lutte sénégalaise','Lutte libre'],
   circuits:['Arène de Pikine','Ligue du Cap-Vert'],H:'Mamadou,Ousmane,Cheikh,Modou,Ibrahima,Abdou,Pape,Lamine',F:'Aïssatou,Mariama,Ndèye,Awa',N:'Ndiaye,Diop,Sarr,Faye,Diouf,Gueye,Sène,Thiam,Mbengue,Niang'},
  {id:'nigeria',pays:'Nigeria',a:'au',reg:'Afrique',villes:['Lagos'],ll:[6.524,3.379],spec:['Lutte libre','Boxe anglaise'],
   circuits:['Cage de Lagos','Ligue du Delta'],H:'Chinedu,Emeka,Tunde,Ifeanyi,Oluwaseun,Kelechi,Segun,Uche',F:'Chiamaka,Funmilayo,Ngozi,Adaeze',N:'Okafor,Adeyemi,Nwosu,Eze,Balogun,Ogunleye,Chukwu,Adebayo,Okonkwo,Afolabi'},
  {id:'afriquedusud',pays:'Afrique du Sud',a:'en',reg:'Afrique',villes:['Johannesburg','Pretoria'],ll:[-26.204,28.047],spec:['Kickboxing','Boxe anglaise'],
   circuits:['Cage du Gauteng','Ligue du Cap'],H:'Sipho,Thabo,Ruan,Pieter,Lungile,Wian,Kagiso,Bongani',F:'Lerato,Zanele,Anika,Thandi',N:'van der Merwe,Botha,Mokoena,Dlamini,Pretorius,Ndlovu,Coetzee,Khumalo,Venter,Steyn'},
  {id:'nouvellezelande',pays:'Nouvelle-Zélande',a:'en',reg:'Océanie',villes:['Auckland'],ll:[-36.848,174.763],spec:['Kickboxing','Boxe anglaise'],
   circuits:['Cage d’Auckland','Ligue du Waikato'],H:'Tama,Ethan,Wiremu,Nikau,Jayden,Manaia,Corey,Sione',F:'Aroha,Mere,Kaia,Tia',N:'Ngata,Tuhiwai,Parata,Tamihana,Henare,Walker,Te Rangi,Fifita,Kereama,Wilson'},
];
RT_DEST.push(
  {id:'croatie',pays:'Croatie',a:'en',villes:['Zagreb','Rijeka'],ll:[45.815,15.982],spec:['Kickboxing','Boxe anglaise'],
   circuits:['Ligue de Zagreb','Cage de Dalmatie'],H:'Ivan,Luka,Marko,Ante,Josip,Filip,Dario,Toni',F:'Ana,Lucija,Petra,Ivana',N:'Babić,Marić,Jurić,Knežević,Perić,Tomić,Pavić,Grgić,Šarić,Bošnjak'},
  {id:'australie',pays:'Australie',a:'en',villes:['Sydney','Melbourne'],ll:[-33.869,151.209],spec:['Kickboxing','Karaté Kyokushin','Boxe anglaise'],
   circuits:['Cage de Nouvelle-Galles','Ligue du Victoria'],H:'Lachlan,Riley,Mitchell,Cooper,Brodie,Tyson,Jarrah,Hamish',F:'Tayla,Brianna,Jess,Matilda',N:'Kelly,Ryan,Harris,Gibson,Fraser,Doherty,Sullivan,McKenzie,Crawford,Pearce'},
  {id:'cameroun',pays:'Cameroun',a:'au',villes:['Douala','Yaoundé'],ll:[4.051,9.768],spec:['Boxe anglaise','Lutte libre'],
   circuits:['Cage du Littoral','Ligue du Centre'],H:'Christian,Patrick,Arnaud,Herman,Brice,Junior,Rodrigue,Steve',F:'Carine,Prisca,Nadège,Larissa',N:'Mbarga,Ngono,Essomba,Fotso,Tchoupo,Ateba,Ekotto,Owona,Nkoulou,Abena'});
RT_DEST.forEach(d=>{d.reg=RT_REGIONS[{"france":0,"italie":0,"paysbas":0,"royaumeuni":0,"irlande":0,"suede":0,"pologne":1,"croatie":1,"russie":1,"georgie":1,"daghestan":1,"kazakhstan":1,"kirghizistan":1,"mongolie":2,"chine":2,"coree":2,"japon":2,"thailande":2,"australie":2,"nouvellezelande":2,"etatsunis":3,"canada":3,"mexique":3,"bresil":3,"cuba":3,"maroc":4,"senegal":4,"nigeria":4,"cameroun":4,"afriquedusud":4}[d.id]];});
RT_DEST.forEach(d=>{d.spec={"france":["Boxe française","Judo","Boxe anglaise"],"italie":["Kickboxing","Muay-thaï"],"paysbas":["Kickboxing","Muay-thaï"],"royaumeuni":["Boxe anglaise","Jiu-jitsu brésilien"],"irlande":["Boxe anglaise","Jiu-jitsu brésilien"],"suede":["Lutte gréco-romaine","Kickboxing"],"pologne":["Lutte","Judo"],"croatie":["Kickboxing","Boxe anglaise"],"russie":["Sambo","Boxe anglaise"],"georgie":["Lutte","Judo"],"daghestan":["Lutte","Sambo"],"kazakhstan":["Boxe anglaise","Lutte"],"kirghizistan":["Lutte","Judo"],"mongolie":["Lutte mongole","Judo"],"chine":["Sanda","Judo"],"coree":["Taekwondo","Judo"],"japon":["Judo","Karaté Kyokushin"],"thailande":["Muay-thaï"],"australie":["Kickboxing","Boxe anglaise"],"nouvellezelande":["Kickboxing","Jiu-jitsu brésilien"],"etatsunis":["Lutte universitaire","Jiu-jitsu brésilien","Boxe anglaise"],"canada":["Karaté Kyokushin","Lutte"],"mexique":["Boxe anglaise","Taekwondo"],"bresil":["Jiu-jitsu brésilien","Muay-thaï"],"cuba":["Boxe anglaise","Lutte gréco-romaine"],"maroc":["Kickboxing","Boxe anglaise"],"senegal":["Lutte sénégalaise","Lutte"],"nigeria":["Lutte","Boxe anglaise"],"cameroun":["Boxe anglaise","Lutte"],"afriquedusud":["Kickboxing","Boxe anglaise"]}[d.id];});
const rtDe=id=>RT_DEST.find(d=>d.id===id);
const rtPrep=d=>d.a==='à'?`à ${d.pays}`:d.a==='aux'?`aux ${d.pays}`:d.a==='au'?`au ${d.pays}`:`en ${d.pays}`;
const rtVilles=d=>d.villes.length>1?`${d.villes[0]}, puis ${d.villes[1]}`:d.villes[0];

/* ---- Ce qui change vraiment d'un pays à l'autre (retour du 10/11 : « qu'on puisse hésiter ») ; À RELIRE.
   langue · interprète pour le voyage (Marco parle français, anglais, italien et espagnol) · salaires (× ceux d'un jeune pro
   en France) · semaines de visa de travail avant un premier combat en France · trajet entre ses deux villes ·
   deux salles du coin (inventées) · la scène locale en une phrase. La chance de trouver une pépite, elle, ne change pas. ---- */
const RT_PLUS={
  croatie:['croate',1,.65,0,40,['Zagreb Fight Club','Rijeka Kickboxing'],'Une grande école de kickboxing ; les galas de MMA se multiplient.'],
  australie:['anglais',0,1.15,4,180,['Bondi Combat','Southside MMA'],'Une scène professionnelle bien installée, des salles de très bon niveau.'],
  cameroun:['français',0,.5,8,30,['Douala Boxing Club','Yaoundé Fight'],'Des boxeurs et des lutteurs, encore très peu de galas de MMA.'],
  france:['français',0,1,0,60,['Saint-Ouen Combat','Team Vieux-Port'],'Beaucoup de clubs, peu de galas pros : les bons partent tôt.'],
  italie:['italien',0,.9,0,40,['Palestra Dora','Milano Fight Lab'],'Une vieille école de kickboxing ; le MMA pousse dans les salles de muay-thaï.'],
  paysbas:['néerlandais, anglais',0,1,0,30,['Mokum Gym','Breda Vechtsport'],'Les meilleures salles de kickboxing d’Europe. Tout le monde frappe, peu luttent.'],
  royaumeuni:['anglais',0,1.15,4,40,['Dockside MMA','Northern Grit'],'Des galas tous les week-ends, un public énorme, des agents partout.'],
  irlande:['anglais',0,1.1,0,0,['Liffey Combat Club','Westside Grappling'],'Petite scène très soudée : tout le monde se connaît.'],
  suede:['suédois, anglais',0,1.1,0,60,['Södra Brottning','Göta Fight Center'],'Des lutteurs gréco solides, quelques salles de très haut niveau.'],
  pologne:['polonais',1,.8,0,70,['Klub Wisła','Gdańsk Fight Team'],'Une grosse ligue nationale ; les jeunes y font leurs armes.'],
  georgie:['géorgien',1,.6,4,30,['Didube Wrestling','Kutaisi Fight Club'],'Des lutteurs et des judokas partout ; le MMA arrive à peine.'],
  daghestan:['russe, avar',1,.55,10,20,['École Eagle des montagnes','Club Sulak'],'La lutte dès six ans, des salles pleines, des combattants qui ne lâchent rien.'],
  russie:['russe',1,.7,10,60,['Nevsky Sambo','Krasnaya Fight'],'Le sambo à chaque coin de rue, des galas tous les mois.'],
  kazakhstan:['kazakh, russe',1,.6,6,90,['Almaty Boxing Academy','Steppe Fight'],'Une école de boxe énorme ; le MMA prend de l’ampleur.'],
  kirghizistan:['kirghiz, russe',1,.5,6,50,['Ala-Too Fight','Club Manas'],'Des lutteurs durs au mal, peu payés, peu vus.'],
  mongolie:['mongol',1,.5,8,0,['Tuul Wrestling','Khan Fight Club'],'La lutte dans chaque village ; presque personne ne vient y chercher.'],
  thailande:['thaï',1,.5,6,80,['Sor Kiatpet','Chalong Muay Thai'],'Des camps de muay-thaï partout, beaucoup d’étrangers : il faut trier.'],
  japon:['japonais',1,1,4,120,['Kanda Grappling','Osaka Shootfighters'],'Une longue histoire du MMA ; des combattants techniques, souvent légers.'],
  coree:['coréen',1,.9,4,60,['Gangnam Taekwondo','Busan Combat'],'Des taekwondoïstes qui passent au MMA, rapides et légers.'],
  chine:['chinois',1,.7,8,150,['Shichahai Sanda','Chengdu Fight Club'],'Une scène qui grandit vite, des écoles de sanda dans chaque province.'],
  bresil:['portugais',0,.6,4,150,['Academia Serra Verde','Curitiba Combate'],'Des académies à chaque coin de rue, des galas chaque week-end dans l’intérieur.'],
  etatsunis:['anglais',0,1.4,4,200,['Sandia Fight Club','Desert Wolves'],'La plus grande scène du monde ; les bons ont déjà un agent.'],
  mexique:['espagnol',0,.7,4,120,['Gimnasio Tepito','Tijuana Combat'],'Une culture de la boxe ; le MMA monte dans le nord.'],
  canada:['français, anglais',0,1.1,4,0,['Club Mont-Royal','Hochelaga Fight'],'Une scène solide au Québec, où l’on parle français.'],
  cuba:['espagnol',0,.5,12,0,['Gimnasio Rafael Trejo','Club Cerro'],'Des boxeurs et des lutteurs de niveau olympique, très difficiles à faire sortir.'],
  maroc:['arabe, français',0,.6,6,50,['Casa Fight Academy','Tanger Boxing'],'Une grande école de kickboxing ; beaucoup ont de la famille en France.'],
  senegal:['wolof, français',0,.5,8,0,['Écurie Fass','Pikine Lutte'],'La lutte est le premier sport du pays ; quelques lutteurs passent au MMA.'],
  nigeria:['anglais',0,.55,10,0,['Lagos Wrestling Hub','Surulere Fight'],'Des lutteurs puissants, très peu de galas.'],
  afriquedusud:['anglais',0,.8,6,30,['Soweto Fight','Highveld MMA'],'Une ligue nationale bien installée, des kickboxeurs costauds.'],
  nouvellezelande:['anglais',0,1.1,4,0,['Kingsland Strikers','Waikato Fight'],'Peu de salles, mais une des meilleures écoles de frappe au monde.'],
};
RT_DEST.forEach(d=>{const [langue,interp,sal,visa,transfert,salles,scene]=RT_PLUS[d.id];Object.assign(d,{langue,interp,sal,visa,transfert,salles,scene});});

/* ---- Le prix : la distance depuis Lyon et le temps passé là-bas (Q26a), rien d'arbitraire ---- */
const RT_JOUR=280;              /* hôtel, repas, voiture, entrées en salle et aux galas, par jour (À RELIRE) */
const RT_INTERP=150;            /* un interprète, par jour sur place, là où Marco ne parle pas la langue */
const RT_DUREES=[[3,2],[7,4],[14,6]]; /* jours sur place → profils ramenés (Q26d) */
function rtKm(d){const r=x=>x*Math.PI/180,[a,b]=RT_LYON,[c,e]=d.ll,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(e-b)/2)**2;
  return Math.round(6371*2*Math.asin(Math.sqrt(h))/10)*10;}
RT_DEST.forEach(d=>{d.km=rtKm(d);
  d.h=d.train||(d.km<3000?d.km/750+.5:d.km/800+3);
  d.route=d.h<=9?0:d.h<=20?2:4;            /* jours perdus en route, aller et retour */
  d.billet=d.train?(d.train<3?110:130):Math.round((150+d.km*.08)/10)*10;
  d.parCombat=3*d.billet;});               /* à chaque combat : son billet et ceux de deux coachs */
const rtHeures=h=>{const x=Math.round(h*2)/2;return Number.isInteger(x)?`${x} h`:`${Math.floor(x)} h 30`;};
const rtTrajet=d=>`${d.train?'train':'avion'}, ${rtHeures(d.h)}`;
function rtVoyage(d,jours,depart){
  const tot=jours+d.route,retour=new Date(depart.getTime()+864e5*tot),interp=d.interp?jours*RT_INTERP:0;
  return {jours,tot,retour,profils:RT_DUREES.find(x=>x[0]===jours)[1],sejour:tot*RT_JOUR,interp,cout:d.billet+d.transfert+tot*RT_JOUR+interp};
}
const rtSal=(d,b)=>Math.max(3000,Math.round(b*d.sal/500)*500);
const rtDemandeK=d=>`${Math.round(8*d.sal*2)/2} à ${Math.round(12*d.sal*2)/2} k€`.replace(/\./g,',');
const rtVisa=d=>d.visa?`${d.visa} semaines de visa`:'tout de suite';
const rtJourL=d=>`${JOURS[d.getDay()].toLowerCase()} ${d.getDate()===1?'1er':d.getDate()} ${MOIS[d.getMonth()]}`;
const rtEu=n=>`${nb(n)} €`;

/* ---- Les profils qu'il ramène : toutes catégories, 2 sur 3 dans les spécialités du pays, le hasard pour le reste ---- */
const rtPick=(r,l)=>l[Math.floor(r()*l.length)];
const rtListe=s=>s.split(',');
function rtFem(nom,d){
  if(['daghestan','russie','kazakhstan','kirghizistan'].includes(d.id)&&/(ov|ev|in)$/.test(nom))return nom+'a';
  if(d.id==='pologne')return nom.replace(/ski$/,'ska').replace(/cki$/,'cka');
  return nom;
}
/** Un nom n'est jamais déjà pris : Split, le marché, les classements, les adversaires de la fiche, les autres voyages. */
function rtPris(pr,no){
  const t=pr+' '+no,tous=[...COMBATTANTS,...EXT];
  return tous.some(c=>c.prenom+' '+c.nom===t||c.nom===no)||ADV.some(a=>a===t||a.endsWith(' '+no));
}
/* Les profils dépendent un peu du pays : les pays de lutte donnent plus de lutteurs passés au MMA. */
const RT_METH={
  Frappeur:[['KO','coups de poing'],['KO','crochet du gauche'],['Décision','unanime'],['KO technique','coups au sol']],
  Kickboxeur:[['KO','coup de pied à la tête'],['KO technique','coups de genou'],['Décision','unanime'],['KO','coups de poing']],
  Lutteur:[['KO technique','coups au sol'],['Décision','unanime'],['Soumission','étranglement arrière'],['Décision','unanime']],
  Grappler:[['Soumission','étranglement arrière'],['Soumission','clé de bras'],['Soumission','triangle'],['Décision','unanime']],
};
/** Son histoire en MMA, contre des combattants du coin, dans les galas du coin (pas de champions du monde). */
const RT_ADV=new Set(); /* les adversaires déjà nommés : un profil ramené ne porte jamais leur nom */
function rtHistoire(c,d,r){
  const n=c.v+c.d,res=[],rec=[...c.serie].reverse();let v=c.v,dd=c.d,dt=new Date(c.dernier);
  const M=RT_METH[c.style],num=20+Math.floor(r()*60);
  for(let i=0;i<n;i++){
    let x=i<rec.length?rec[i]:(dd>0&&r()<dd/(v+dd)?'d':'v');if(x==='v'&&!v)x='d';if(x==='d'&&!dd)x='v';x==='v'?v--:dd--;
    const meth=x==='v'?rtPick(r,M):(r()<.6?['Décision','partagée']:['KO','coups de poing']);
    const rd=meth[0]==='Décision'?3:1+Math.floor(r()*3);
    const f=/ F$/.test(c.cat);let adv;do{adv=`${rtPick(r,rtListe(f?d.F:d.H))} ${f?rtFem(rtPick(r,rtListe(d.N)),d):rtPick(r,rtListe(d.N))}`;}while(adv.split(' ')[0]===c.prenom||adv.endsWith(' '+c.nom)||RT_PROSP.some(z=>{const y=parId(z.id);return y.prenom+' '+y.nom===adv;}));
    RT_ADV.add(adv);
    res.push({date:new Date(dt),soiree:`${rtPick(r,d.circuits)} ${num-i*2}`,adv,advR:0,res:x,meth,rd,
      tps:meth[0]==='Décision'?'5:00':`${1+Math.floor(r()*4)}:${String(Math.floor(r()*60)).padStart(2,'0')}`});
    dt=new Date(dt);dt.setMonth(dt.getMonth()-(3+Math.floor(r()*4)));dt.setDate(1+Math.floor(r()*27));
  }
  res._o=true;res._f=true;return res;
}
/* Les petits mots : « du Brésil », « d’Italie », « à la muay-thaï », « au judo ». */
const rtDu=d=>d.a==='aux'?`des ${d.pays}`:d.a==='au'?`du ${d.pays}`:/^[AEIOUÉÈ]/.test(d.pays)?`d’${d.pays}`:`de ${d.pays}`;
const rtMin=st=>st.charAt(0).toLowerCase()+st.slice(1);
const rtAu=st=>/^(Boxe|Lutte|Luta)/.test(st)?`à la ${rtMin(st)}`:`au ${rtMin(st)}`;
const rtDeLa=st=>/^(Boxe|Lutte|Luta)/.test(st)?`de la ${rtMin(st)}`:`du ${rtMin(st)}`;
const rtDuCircuit=n=>/^(Cage|Ligue)/.test(n)?`de la ${n}`:/^(Arène)/.test(n)?`de l’${n}`:`du ${n}`;
/** Remplace {il} {Il} {e} {le} {lui} {ne} {sa} selon qu'il s'agit d'un homme ou d'une femme. */
const rtG=(t,f)=>t.replace(/\{il\}/g,f?'elle':'il').replace(/\{Il\}/g,f?'Elle':'Il').replace(/\{e\}/g,f?'e':'').replace(/\{le\}/g,f?'la':'le')
  .replace(/\{lui\}/g,f?'elle':'lui').replace(/\{ne\}/g,f?'ne':'').replace(/\{Pere\}/g,f?'Mère':'Père').replace(/\{un\}/g,f?'une':'un');

/* ---- Ce qu'il fait dans la cage, ce que Marco a vu, ce qu'il dit (À RELIRE) ---- */
const RT_GESTE={'Boxe anglaise':'frappe dur et juste','Boxe française':'touche de loin, avec les pieds','Kickboxing':'travaille de loin, avec les jambes',
  'Muay-thaï':'fait mal au corps à corps, coudes et genoux','Sanda':'frappe, puis projette','Karaté Kyokushin':'entre, frappe et sort sans se faire toucher',
  'Taekwondo':'frappe de loin, très vite, avec les jambes','Lutte sénégalaise':'projette et frappe dans le corps à corps','Lutte mongole':'projette qui {il} veut',
  'Shuai jiao':'projette au premier contact','Sambo de combat':'enchaîne lutte et clés de jambe','Judo':'projette, puis contrôle au sol',
  'Lutte libre':'amène au sol qui {il} veut','Lutte gréco-romaine':'domine le corps à corps contre la cage','Lutte universitaire':'amène au sol et ne laisse plus respirer',
  'Jiu-jitsu brésilien':'finit au sol, au cou ou au bras','Lutte de soumission':'contrôle au sol et attend la faute'};
/* Six parcours (retour du 10/11 : « des faux positifs, des vieux, des combattants un peu underground du pays »). */
/* ---- Ce que Marco écrit : un rapport de recruteur, factuel (retour du 15/11 : « du réel », plus de phrases romancées) ; À RELIRE ---- */
const RT_PARCOURS={
  pro:['Jeune pro invaincu',.22],circuit:['Champion d’un circuit local',.15],transfuge:['Venu d’un autre sport',.14],
  gonfle:['Invaincu dans son pays',.15],vieux:['Combattant expérimenté',.17],underground:['Peu de combats officiels',.17]};
/* L'avis de Marco : neuf mots, sans dire le classement qu'il vise. */
const RT_VERDICTS={coeur:'Coup de cœur',signer:'À signer',interessant:'Intéressant',solide:'Solide',suivre:'À suivre',pasPret:'Pas encore prêt',depanner:'Pour dépanner',pari:'Un pari',revoir:'À revoir'};
const RT_AVIS={
  coeur:'Le plus complet de ce voyage. Je {le} signerais maintenant, avant qu’une autre organisation {le} repère.',
  signer:'Prêt{e} pour nos préliminaires. {Il} a encore de la marge pour progresser.',
  interessant:'Beau bilan, mais je ne l’ai pas vu{e} face à un adversaire solide. À vérifier sur ses vidéos.',
  solide:'Prêt{e} pour nos préliminaires dès maintenant. Je ne pense pas qu’{il} ira beaucoup plus haut.',
  suivre:'Pas encore au niveau. À revoir dans six mois.',
  pasPret:'Très bon dans son sport d’origine, mais encore débutant{e} en MMA. Encore un an de travail.',
  depanner:'Fiable et expérimenté{e}. Utile pour remplacer quelqu’un au dernier moment.',
  pari:'Peu de combats officiels, donc difficile à juger. Je voudrais {le} voir contre un adversaire de niveau connu.',
  revoir:'Je n’ai pas pu me faire une idée claire. Je préfère le revoir avant de le recommander.'};
/* Ses notes, domaine par domaine, d'après ses chiffres face à la moyenne de sa catégorie. */
const RT_NOTES={
  debout:{bon:['Bon volume, {il} frappe juste.','Précis{e}, {il} choisit bien ses moments.','Frappe lourde, {il} avance sans se découvrir.'],
    moyen:['Correct. Peu de combinaisons.','Un jab propre, mais {il} tente peu de choses.'],
    faible:['Limité{e}. {Il} recule en ligne droite.','Encore débutant{e} : {il} garde les mains basses.']},
  lutte:{bon:['Amène au sol facilement, surtout contre la cage.','Très difficile à amener au sol.'],
    moyen:['Défense d’amenée correcte.','Peu d’amenées, mais {il} se relève vite.'],
    faible:['Se fait amener au sol trop facilement.','Ne cherche jamais la lutte.']},
  sol:{bon:['Cherche la soumission dès que le combat va au sol.','Bonnes transitions, très efficace du dessus.'],
    moyen:['Contrôle correct, peu de soumissions.','Solide, sans prendre de risques.'],
    faible:['Mal à l’aise sur le dos.','Peu vu{e} au sol.']}};
const RT_PHYSIQUE={pro:'Bon cardio sur trois rounds.',pep:'Bon cardio sur trois rounds, {il} finit plus fort qu’{il} ne commence.',
  gonfle:'Ses combats ont tous été courts : son cardio est inconnu.',circuit:'Solide sur trois rounds.',
  transfuge:'Très solide physiquement : un passé d’athlète.',vieux:'Récupère moins vite. Beaucoup de combats derrière lui.',
  underground:'Puissant{e}, mais {il} n’a fait que des combats courts.'};
const RT_RISQUES={
  pro:['A raté le poids à son avant-dernier combat.','Un seul adversaire sérieux dans son bilan.'],
  gonfle:['Je ne l’ai vu{e} qu’une fois, et le combat a duré moins d’une minute.','La plupart de ses adversaires ont plus de défaites que de victoires.'],
  circuit:['N’a jamais combattu hors de son pays.'],
  transfuge:['Encore débutant{e} debout : {il} prend des coups.'],
  transfugeF:['Encore débutant{e} en lutte et au sol.'],
  vieux:['{age} ans : deux ou trois ans de carrière devant {lui}.','Récupère moins vite, d’après son entraîneur.'],
  underground:['Peu de combats officiels : difficile de juger son niveau.','A combattu sans licence : son dossier médical est à vérifier.'],
  tous:['Blessure au genou en 2025, d’après son entraîneur.','Son équipe demande à être prise en charge pour chaque combat.']};

/** Un tirage qui évite ce que les autres profils du voyage ont déjà eu. */
function rtUnique(r,l,used){const libres=l.filter(x=>!used.has(x)),x=rtPick(r,libres.length?libres:l);used.add(x);return x;}
/** Le dossier d'un profil : ses notes par domaine, ce que Marco a vu (dates et lieux), les risques, son avis (À RELIRE). */
function rtDossier(c,p,d,r,used){
  const f=/ F$/.test(c.cat),g=t=>rtG(t,f).replace('{age}',c.age),s=stats(c),l=rtSplitCatStats(c.cat);
  const niv=(k,sens=1)=>{const m=l[k],e=(s[k]-m)/m*sens;return e>.12?'bon':e<-.15?'faible':'moyen';};
  const deb=niv('fpm')==='bon'||niv('prec')==='bon'?'bon':niv('fpm')==='faible'?'faible':'moyen';
  const lut=niv('am')==='bon'||niv('defA')==='bon'?'bon':niv('defA')==='faible'?'faible':'moyen';
  const fin=c._h.filter(x=>x.res==='v'&&x.meth[0]!=='Décision').length;
  const so=niv('sub');const fort=['coeur','signer'].includes(p.verdict);
  const up=x=>fort&&x==='faible'?'moyen':x;
  const notes=[['Debout',g(rtUnique(r,RT_NOTES.debout[up(deb)],used))],['Lutte',g(rtUnique(r,RT_NOTES.lutte[up(lut)],used))],['Au sol',g(rtUnique(r,RT_NOTES.sol[up(so)],used))],['Physique',g(RT_PHYSIQUE[p.pep?'pep':p.type])]];
  /* Ce que Marco a vu : un combat (s'il y en avait un pendant le voyage), puis l'entraînement. */
  const vus=[],h=c._h[0];
  for(let i=0;i<Math.min(2,p.fois);i++){const j=new Date(p.jour.getTime()-864e5*i*2);
    if(i===0&&p.type==='underground')vus.push([j,'Soirée sans licence',`${p.ville} · victoire en un round`]);
    else if(i===0&&p.gala)vus.push([j,'Combat',`${h.soiree}, ${h.res==='v'?'victoire':'défaite'}`]);
    else vus.push([j,'Entraînement',`${p.salle}, ${p.ville}`]);}
  const lr=(p.type==='transfuge'&&['Frappeur','Kickboxeur'].includes(c.style)?RT_RISQUES.transfugeF:RT_RISQUES[p.type])||[];
  const risques=[];if(!p.pep){if(lr.length)risques.push(g(rtUnique(r,lr,used)));if(p.type==='vieux'||p.type==='underground'||r()<.3)risques.push(g(rtUnique(r,RT_RISQUES.tous.concat(lr),used)));}
  const debut=c._h[c._h.length-1].date.getFullYear();
  const lv=[up(deb),up(lut),up(so)],forts=[],surveiller=[];
  notes.slice(0,3).forEach(([,t],i)=>{if(lv[i]==='bon')forts.push(t);else if(lv[i]==='faible')surveiller.push(t);});
  if(['pro','circuit','transfuge'].includes(p.type)||p.pep)forts.push(notes[3][1]);else if(['vieux','gonfle','underground'].includes(p.type))surveiller.push(notes[3][1]);
  if(c.d===0&&c.v>=5)forts.unshift(g(`Invaincu{e} : ${c.v} victoires en ${c.v} combats.`));
  else if(fin>=c.v*.6)forts.unshift(g(`Finit ses combats : ${fin} victoires sur ${c.v} avant la limite.`));
  risques.forEach(t=>surveiller.push(t));
  return {notes,vus,risques,forts:forts.slice(0,3),surveiller:surveiller.slice(0,3),avis:g(RT_AVIS[p.verdict]),debut:`Pro depuis ${debut}. ${c.v} victoire${c.v>1?'s':''}, dont ${fin} avant la limite.`};
}
/** Les moyennes de sa catégorie chez Split. */
function rtSplitCatStats(cat){const l=COMBATTANTS.filter(c=>c.cat===cat).map(stats),m={};STATS.forEach(([k])=>m[k]=l.reduce((a,x)=>a+x[k],0)/l.length);return m;}
/** Son avis en une ligne (pour la fiche). */
function rtAvis(c,p){return p.dos?p.dos.avis:'';}
const RT_PROSP=[];
/** Les n profils d'un voyage (même graine = mêmes profils), ajoutés au marché comme libres « vus » par Marco (Q25b). */
function rtProfils(d,n,cle,V){
  const r=graine('rt'+d.id+cle),out=[],used=new Set(),styles={},vu=V.retour,arrivee=new Date(V.parti.getTime()+864e5*d.route/2);
  const lutte=d.spec.some(s=>/Lutte|Judo|Sambo/.test(s));
  let pep=false;
  for(let i=0;i<n;i++){
    const f=r()<.25,sx=f?'F':'H',[cat,,kg]=rtPick(r,CATS[sx]);
    /* Jamais plus de deux fois le même style dans un voyage. */
    let styleReel,k=0;do{styleReel=r()<.67?rtPick(r,d.spec):rtPick(r,RT_PARTOUT);}while((styles[styleReel]||0)>=2&&k++<12);styles[styleReel]=(styles[styleReel]||0)+1;
    const [fam,art]=RT_STYLES[styleReel];
    const dansVoyage=(pr,no)=>out.some(o=>{const z=parId(o.id);return z.prenom===pr||z.nom.replace(/a$/,'')===no.replace(/a$/,'');});
    let pr,no;k=0;do{pr=rtPick(r,rtListe(f?d.F:d.H));no=rtPick(r,rtListe(d.N));if(f)no=rtFem(no,d);}while(((k<150?rtPris(pr,no):[...COMBATTANTS,...EXT].some(z=>z.prenom+' '+z.nom===pr+' '+no))||RT_ADV.has(pr+' '+no)||dansVoyage(pr,no))&&k++<400);
    let u=r(),type='pro';const W=Object.entries(RT_PARCOURS).map(([t,[,w]])=>[t,t==='transfuge'&&lutte?w+.08:w]),tot=W.reduce((a,[,w])=>a+w,0);u*=tot;
    for(const [t,w] of W){if(u<w){type=t;break;}u-=w;}
    if(out.filter(o=>o.type===type).length>=2)type=W.map(z=>z[0]).find(t=>out.filter(o=>o.type===t).length<2&&t!==type)||type;
    /* Une pépite : la même chance partout, à chaque profil (le hasard décide, R26). */
    const estPep=!pep&&r()<.14;if(estPep){pep=true;type='pro';}
    const R=(a,b)=>a+Math.floor(r()*(b-a+1));
    const P={pro:{age:R(21,24),v:R(5,8),d:0},circuit:{age:R(24,28),v:R(9,13),d:R(1,2)},transfuge:{age:R(22,26),v:R(5,6),d:R(0,1)},
      gonfle:{age:R(23,27),v:R(10,13),d:0},vieux:{age:R(34,39),v:R(21,29),d:R(8,12)},underground:{age:R(25,31),v:R(4,6),d:R(1,2)}}[type];
    if(estPep){P.age=R(21,22);P.v=R(7,9);}
    /* La série colle au palmarès (du plus ancien au plus récent). */
    let sa=Array.from({length:5},()=>P.d&&r()<P.d/(P.v+P.d)*1.2?'d':'v');if(!['vieux','underground'].includes(type)){sa[4]='v';sa[3]='v';}
    let nd=sa.filter(z=>z==='d').length;for(let j=0;j<5&&nd>P.d;j++)if(sa[j]==='d'){sa[j]='v';nd--;}
    const serie=sa.join('');
    const sl=f?CL_SURN_F:CL_SURN_H,snPris=new Set([...COMBATTANTS,...EXT].filter(x=>x.cat===cat).map(x=>x.surnom));
    let sn=rtPick(r,sl);k=0;while(snPris.has(sn)&&k++<sl.length)sn=sl[(sl.indexOf(sn)+1)%sl.length];
    const H0={57:[63,66],61:[66,69],66:[69,73],70:[73,78],77:[77,82],84:[81,86],93:[84,89],120:[87,94],52:[57,61]}[kg]||[70,75],H=f?[H0[0]-3,H0[1]-3]:H0;
    const t=H[0]+Math.floor(r()*(H[1]-H[0]+1)),al=t+1+Math.floor(r()*6),cm=x=>`1,${String(x).padStart(2,'0')} m`;
    const jour=new Date(arrivee.getTime()+864e5*Math.floor((i+.5)*V.jours/n));
    const dernier=r()<.5?new Date(jour):new Date(jour.getTime()-864e5*(20+Math.floor(r()*50)));
    const circuit=rtPick(r,d.circuits),iv=Math.floor(r()*d.villes.length),ville=d.villes[iv],salle=d.salles[d.villes.length>1?iv:Math.floor(r()*d.salles.length)];
    const id='rt'+d.id+cle+i;
    const c={id,prenom:pr,nom:no,surnom:sn,cat,kg,age:P.age,v:P.v,d:P.d,n:0,rang:'–',mondial:400+RT_PROSP.length,nonClasse:true,tend:'=',serie,statut:'dispo',
      dernier,taille:cm(t),allonge:cm(al),garde:r()<.72?'Orthodoxe':'Fausse garde',depuis:'—',contrat:[0,'—'],style:fam,art,ext:true,org:circuit,libre:dernier};
    c._h=rtHistoire(c,d,graine(id+'histoire'));
    c.dc={meth:c._h[0].meth[0],adv:parNom(c._h[0].adv,cat)};
    c.dc.adv.org=circuit;
    ORIGINES[id]=[ville,d.pays];SPEC_PROPRES[id]=styleReel;
    EXT.push(c);
    const p={id,type,pep:estPep,styleReel,circuit,ville,salle,dest:d.id,vu,jour,gala:dernier.getTime()===jour.getTime()};
    const r2=graine(id+'dossier');
    {const v=r2();p.verdict=estPep?'coeur':{pro:v<.55?'signer':'interessant',gonfle:v<.6?'interessant':'signer',circuit:v<.5?'solide':'suivre',transfuge:v<.5?'suivre':'pasPret',vieux:'depanner',underground:v<.6?'pari':'revoir'}[type];}
    p.fois=estPep?3:type==='gonfle'?1:1+Math.floor(r2()*2);
    if(type==='underground')p.off=20+Math.floor(r2()*35);
    /* Contre qui ? Le bilan cumulé de ses adversaires officiels : c'est là qu'un faux bon profil se trahit. */
    const moy={pro:[6,3],gonfle:[1.2,4.5],circuit:[7,4],transfuge:[5,4],vieux:[11,6],underground:[4,3]}[type];
    p.advs=[0,0];c._h.forEach(()=>{p.advs[0]+=Math.max(0,Math.round(moy[0]*(.6+r2()*.8)));p.advs[1]+=Math.max(0,Math.round(moy[1]*(.6+r2()*.8)));});
    if(type==='circuit'&&r2()<.4){p.advs=[Math.round(p.advs[0]*.45),Math.round(p.advs[1]*1.3)];}
    /* Son entraîneur et son dossier ont leur propre tirage : ils ne changent pas qui il trouve. */
    const rc2=graine(id+'coach');do{p.coach=`${rtPick(rc2,rtListe(d.H))} ${rtPick(rc2,rtListe(d.N))}`;}while(p.coach.split(' ').some(m=>m===pr||m===no));
    p.dos=rtDossier(c,p,d,r2,used);p.avis=p.dos.avis;
    {const fin=c._h.filter(x=>x.res==='v'&&x.meth[0]!=='Décision').length,e=f?'e':'',T=[];
      if(c.d===0)T.push(['+','Invaincu'+e,`${c.v} victoires en ${c.v} combats`,'Jamais battu'+e+' chez les pros.']);
      if(fin>=c.v*.6)T.push(['+','Finisseu'+(f?'se':'r'),`${fin} victoires sur ${c.v} avant la limite`,'Rarement à la décision des juges.']);
      if(type==='vieux')T.push(['+','Expérimenté'+e,`${c.v+c.d} combats chez les pros`,'A tout vu dans une cage.']);
      if(type==='underground')T.push(['-','Peu de combats officiels',`${c.v+c.d} combats officiels`,'Difficile de juger son vrai niveau.']);
      if(type==='circuit')T.push(['+','Champion'+(f?'ne':'')+' local'+e,p.circuit,'A battu tout le monde dans son circuit.']);
      if(!T.length)T.push(['+','En progrès',`${c.v} victoires`,'Encore jeune chez les pros.']);c.traits=T.slice(0,2);}
    const dur=type==='vieux'||type==='gonfle';
    const x={id,type:'libre',profil:type==='vieux'?'veteran':['circuit','underground','gonfle'].includes(type)?'regional':'espoir',tag:`vu${f?'e':''} à ${ville}, ${rcJour(jour)}`,
      raison:`Ton recruteur l’a vu${f?'e':''} à ${ville} le ${rcJour(jour)}.`,agent:[p.coach,dur?'Dur en affaires':'Arrangeant',dur?3:4,dur?.25:.45],
      vu,etat:null,rt:true,nouveau:true};
    x.dem=rcDemande(c,x.profil);if(type==='gonfle')x.dem.bourse*=1.6;['bourse','vic'].forEach(k=>x.dem[k]=rtSal(d,x.dem[k]));x.dem.sig=rtSal(d,x.dem.sig);
    x.patience=x.agent[2];x.dem.dmd=rcDemandes(c,x);
    RC.push(x);RT_PROSP.push(p);out.push(p);
  }
  return out;
}
/** Son carnet de voyage, jour par jour (À RELIRE) : l'arrivée, les salles, les galas, les profils, la route, le retour. */
function rtCarnet(V){
  const d=rtDe(V.dest),l=V.prof,arrivee=new Date(V.parti.getTime()+864e5*d.route/2),j=[];
  const nom=p=>{const c=parId(p.id);return `${esc(c.prenom)} ${esc(c.nom)}`;};
  j.push({date:arrivee,lieu:d.villes[0],k:'arrivee',t:`Arrivé ${d.route?'après une nuit d’avion':'en fin de matinée'}. ${esc(d.salles[0])} le soir.`});
  l.forEach((p,i)=>{const c=parId(p.id),f=/ F$/.test(c.cat);
    j.push({date:p.jour,lieu:p.ville,p:p.id,k:p.type==='underground'?'nuit':p.gala?'gala':'salle',
      t:p.type==='underground'?rtG(`Soirée sans licence. ${nom(p)} gagne en une minute.`,f):p.gala?`Gala ${esc(rtDuCircuit(p.circuit))}. ${nom(p)} gagne ${c._h[0].meth[0]==='Décision'?'aux points':'avant la limite'}.`
      :`${esc(p.salle)}. L’entraîneur me parle de ${nom(p)}.`});
    if(i===Math.floor(l.length/2)&&d.villes[1])j.push({date:new Date(p.jour.getTime()+864e5),lieu:d.villes[1],k:'route',t:`Route vers ${esc(d.villes[1])}.`});
    if(p.pep)j.push({date:new Date(p.jour.getTime()+864e5),lieu:p.ville,p:p.id,k:'famille',t:`Dîner chez la famille de ${nom(p)}.`});
  });
  const fin=new Date(arrivee.getTime()+864e5*(V.jours-1));
  j.push({date:fin,lieu:d.villes[d.villes.length-1],k:'depart',t:`Dernier jour. ${rtNombre(l.length).replace(/^./,x=>x.toUpperCase())} noms dans le carnet.`});
  return j.sort((a,b)=>a.date-b.date);
}
const rtNombre=n=>['zéro','un','deux','trois','quatre','cinq','six'][n]||n;

/* ---- L'état du recruteur : un voyage passé (Turin, rentré le 8 janvier), un voyage en cours ou non ---- */
const RT_CLE='maquette-recruteur';
S.rt={reg:'toutes',tri:{col:'km',sens:1},dest:'bresil',jours:7,voyage:null,passe:null,rapports:[],rap:null,sel:null,anim:false,archives:false};
try{const g=JSON.parse(localStorage.getItem(RT_CLE)||'{}');['reg','tri','dest','jours'].forEach(k=>{if(g[k]!==undefined)S.rt[k]=g[k];});}catch(e){}
function rtGarder(){try{const {reg,tri,dest,jours}=S.rt;localStorage.setItem(RT_CLE,JSON.stringify({reg,tri,dest,jours}));}catch(e){}}
/** Un voyage terminé devient un rapport : ses profils, son carnet. */
function rtClore(V){V.prof=rtProfils(rtDe(V.dest),V.profils,V.cle,V);V.carnet=rtCarnet(V);V.msg='rt-rapport-'+V.cle;S.rt.rapports.unshift(V);S.rt.passe=V;return V;}

/* Le voyage précédent : Turin, 7 jours, du 1er au 8 janvier, 4 profils (le message « disponible » du 8 janvier). */
(function(){
  {const k=rtDe('kirghizistan'),p0=new Date(2026,9,5),v0=rtVoyage(k,7,p0);rtClore({dest:k.id,jours:7,parti:p0,...v0,cle:'bichkek',lu:true,signes:['musaev']});}
  const d=rtDe('italie'),parti=new Date(2027,0,1),v=rtVoyage(d,7,parti);
  rtClore({dest:d.id,jours:7,parti,...v,cle:'turin',lu:true});
})();

/* ---- Les messages : le départ, puis un condensé du rapport (T10). Le rapport complet a son écran. ---- */
function rtMsgDepart(V){
  const d=rtDe(V.dest);
  return {id:'rt-depart-'+V.cle,tag:'Recruteur',qui:'Marco Ferri',role:'ton recruteur',date:new Date(V.parti),lu:false,
    t:`Marco part ${rtPrep(d)}`,
    txt:`Je pars ${V.parti.getTime()===S.date.getTime()?'ce soir':'le '+rcJour(V.parti)} pour ${d.villes.join(', puis ')}. Je ferai les salles de ${d.spec.map(s=>s.toLowerCase()).join(', de ').replace(/, de ([^,]*)$/,' et de $1')}, et les galas du week-end. Je rentre le ${rtJourL(V.retour)}.<span class="relire">à relire</span>`,
    vue:()=>`<div class="ms-cases g2b">
      ${msCase('Le voyage',`${msFaitH('Où',esc(d.villes.join(', ')))}${msFait('Départ',`${rtJourL(V.parti)}, de Lyon`)}${msFait('Retour',`<b>${rtJourL(V.retour)}</b>`)}
        ${msFait('Sur place',`${V.jours} jours${d.route?`, plus ${d.route} jours de route`:''}`)}${msFait('Profils attendus',`${V.profils}, toutes catégories`)}`)}
      ${msCase('Ce qu’il coûte',`${msGros(`<span data-mscompte="${V.cout}">${nb(V.cout)}</span> €`,'déjà payé')}
        ${msFait(`Billet aller-retour · ${nb(d.km)} km`,rtEu(d.billet))}${d.transfert?msFait(`${esc(d.villes[0])} → ${esc(d.villes[1])}`,rtEu(d.transfert)):''}
        ${msFait(`${V.tot} jours × ${rtEu(RT_JOUR)}`,rtEu(V.sejour))}${V.interp?msFait(`Interprète · ${V.jours} jours`,rtEu(V.interp)):''}`)}
      ${msCase('Ce qu’il va chercher',`<div class="rt-ms-spec">${d.spec.map(s=>`<div><b>${esc(s)}</b><span class="sous">${esc(RT_STYLES[s][2])}</span></div>`).join('')}</div>
        <div class="sous" style="margin-top:8px">${esc(d.scene)}</div>`,'large')}
      ${msCase('',`<div class="rt-mfr">${msFrise(V.parti,V.retour,`${rcJour(V.parti)} · Lyon`,`${rcJour(V.retour)} · retour`)}</div>`,'large')}
    </div>`,
    act:()=>msNon('Le recruteur ›','data-msgo="recruteur"')};
}
/* ---- Ce que Marco pense de ses profils : verdict, place estimée chez Split, classement ---- */
const RT_VERDICT_ORDRE=['coeur','signer','interessant','solide','suivre','pasPret','pari','revoir','depanner'];
const rtVerdict=(p,cls='')=>`<span class="rp-v ${p.verdict} ${cls} oct"><span class="oct">${RT_VERDICTS[p.verdict]}</span></span>`;
/** Où Marco le voit chez Split : une fourchette de places dans sa catégorie (1 à 29, derrière le champion). */
function rtPlace(p){
  if(p.place)return p.place;
  const r=graine(p.id+'place'),c={pro:[7,12],gonfle:[5,9],circuit:[9,15],transfuge:[13,20],vieux:[11,17],underground:[6,16]}[p.type],
    centre=p.pep?3+Math.floor(r()*3):c[0]+Math.floor(r()*(c[1]-c[0]+1)),demi=(p.type==='underground'?5:[0,3,2,1][p.fois]);
  return p.place=[Math.max(1,centre-demi),Math.min(29,centre+demi)];
}
const rtOrdre=V=>[...V.prof].sort((a,b)=>RT_VERDICT_ORDRE.indexOf(a.verdict)-RT_VERDICT_ORDRE.indexOf(b.verdict)||(rtPlace(a)[0]+rtPlace(a)[1])-(rtPlace(b)[0]+rtPlace(b)[1]));
const rtASigner=V=>V.prof.filter(p=>['coeur','signer'].includes(p.verdict)).length;
/** Les combattants de Split dans une catégorie, du champion au 29e. */
const rtSplitCat=cat=>COMBATTANTS.filter(c=>c.cat===cat).sort((a,b)=>(a.rang==='C'?0:+a.rang||99)-(b.rang==='C'?0:+b.rang||99));
const rtCatPl=cat=>(cat.endsWith(' F')?pluriel(cat.replace(/ F$/,''))+' féminins':pluriel(cat)).toLowerCase();
const rtPlaceTxt=([a,b])=>a===b?`${a}e`:`${a}e – ${b}e`;
const rtCoutCombat=p=>rcDe(p.id).dem.bourse+rtDe(p.dest).parCombat;
/** Le message du retour : ses recommandations, classées. Le détail est dans l'écran Rapports. */
function rtMsgRapport(V){
  const d=rtDe(V.dest),l=rtOrdre(V),n=rtASigner(V),un=l[0],c0=parId(un.id);
  const intro=`${rtNombre(l.length).replace(/^./,x=>x.toUpperCase())} profils${n?`, ${rtNombre(n)} que je signerais`:', aucun que je signerais tout de suite'}. `
    +(n?`En premier : ${esc(c0.prenom)} ${esc(c0.nom)}. `:'')+'Le détail est dans mon rapport.<span class="relire">à relire</span>';
  return {id:V.msg,tag:'Recruteur',qui:'Marco Ferri',role:'ton recruteur',date:new Date(V.retour),lu:!!V.lu,
    t:`Le rapport de Marco : ${rtNombre(l.length)} profils ${d.a==='à'?'à':d.a==='aux'?'aux':d.a==='au'?'au':'en'} ${esc(d.pays)}`,
    txt:intro,
    vue:()=>`<div class="ms-cases rt-g1">${msCase(`Ce qu’il recommande · ${esc(d.villes.join(', '))} · ${rtEu(V.cout)}`,`<div class="rt-mc"><div class="rt-mch"><span>Profil</span><span>Son avis</span><span>Il demande</span></div>${l.map((p,i)=>{const c=parId(p.id);
      return `<div class="rt-mcl apparait" style="animation-delay:${120+i*90}ms"><div class="rt-mcn"><span class="ms-qui">${lien(c)}</span><span class="sous">${esc(courte(c.cat))}${/ F$/.test(c.cat)?' F':''} · ${c.age} ans · ${bilan(c)} · ${esc(p.styleReel)}</span></div>
        ${rtVerdict(p,'petit')}<span class="T rt-mcd">${nb(rcDe(p.id).dem.bourse)} €</span></div>`;}).join('')}</div>`,'large')}</div>`,
    act:()=>msOui('Lire le rapport',`data-rtrap="${V.cle}"`)};
}
/* Le rapport de Turin, arrivé le 8 janvier (déjà lu), juste sous « Ton recruteur est disponible ». */
(function(){
  const m=rtMsgRapport(S.rt.passe);m.date=new Date(2027,0,8);
  const i=MS_BOITE.findIndex(x=>x.id==='recruteur');MS_BOITE.splice(i+1,0,m);
  /* Le message « disponible » suit : 7 jours à Turin (2, 4 ou 6 profils selon la durée), et il mène au Recruteur. */
  const dispo=msPar('recruteur');
  dispo.vue=()=>`<div class="ms-cases g2">
      ${msCase('Marco Ferri',`<div class="ms-dispo"><span class="point octr pulse" style="background:var(--vert)"></span><span class="T">Disponible</span></div>
        ${msFait('Où il est','À Lyon, depuis le 8 janvier')}${msFait('Son dernier voyage','Turin, 7 jours, 4 profils')}${msFait('Trouvé par lui',`${lien(parId('musaev'))}, à Bichkek`)}`)}
      ${msCase('Là où l’effectif est le plus faible',msFaibles())}
      ${msCase('Un voyage, selon sa durée',`<div class="ms-chiffres q3">${msGros('2','profils en 3 jours')}${msGros('4','profils en 7 jours')}${msGros('6','profils en 14 jours')}</div>
        <div class="sous" style="margin-top:4px">Il part de Lyon et cherche dans toutes les catégories. Pendant le voyage, il n’est pas joignable.</div>`,'large')}
    </div>`;
  dispo.act=()=>msOui('Envoyer le recruteur','data-msgo="recruteur"');
})();

/* ---- Envoyer, puis le retour (Continuer jour par jour s'arrête sur le message du rapport) ---- */
function rtEnvoyer(silence){
  const d=rtDe(S.rt.dest),parti=new Date(S.date),v=rtVoyage(d,S.rt.jours,parti),cle=d.id+S.rt.jours+parti.getDate();
  const V=S.rt.voyage={dest:d.id,jours:S.rt.jours,parti,...v,cle,prof:null};
  const m=rtMsgDepart(V);V.msgDepart=m.id;
  MS_BOITE.unshift(m);MESSAGES.unshift({id:Date.now(),lu:false,nouveau:true,t:m.t,de:`Marco Ferri · aujourd’hui · retour le ${rcJour(V.retour)}`,tag:'Recruteur'});
  S.recruteur='voyage';
  rendre();
  if(!silence)toast(`Marco part ${rtPrep(d)} : retour le ${rtJourL(V.retour)}. Son message de départ est dans tes messages.`);
}
function rtRetour(){
  const V=S.rt.voyage;if(!V)return;
  rtClore(V);V.lu=false;
  const m=rtMsgRapport(V);m.important=false;
  MS_BOITE.unshift(m);MESSAGES.unshift({id:Date.now()+1,lu:false,nouveau:true,t:m.t,de:`Marco Ferri · ${rtJourL(V.retour)}`,tag:'Recruteur'});
  S.rt.voyage=null;S.recruteur='dispo';
  return m;
}
const rtContinuerBase=continuer;
continuer=function(){
  const V=S.rt.voyage;
  if(!V||msBloquant()){rtContinuerBase();return;}
  if(S._enCours)return;S._enCours=true;
  const n=Math.round((V.retour-S.date)/864e5),pas=Math.max(120,Math.min(420,2600/Math.max(1,n)));
  const tic=()=>{S.date.setDate(S.date.getDate()+1);S.jours--;S.preventes+=52;
    const e=$('#dateH');if(e){e.textContent=dCourt(S.date);e.animate([{opacity:.2,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:Math.min(280,pas)});}
    if(S.ecran==='recruteur'){const f=$('.rt-frise');if(f)f.outerHTML=rtFrise(V);}
    if(S.date<V.retour){setTimeout(tic,pas);return;}
    S._enCours=false;const m=rtRetour();
    S.ms.sel=m.id;S.ms.nouveau=m.id;S.ms.anim=true;
    if(S.ecran==='messages'){msLire(m.id);rendre();}else aller('messages');
    toast(`Le temps s’arrête, ${dLong(S.date).toLowerCase()} : Marco est rentré ${rtDu(rtDe(V.dest))}.`);
  };tic();
};

/* ---- L'onglet Recruteur (version simple du 15/11) : le tableau du marché, la destination choisie à droite.
   Trois chiffres décident : ce que coûte le voyage, ce que demandent ses combattants, ce que coûte chaque combat.
   Une fine barre sous chaque chiffre du tableau permet de comparer les pays d'un coup d'œil. ---- */
const rtCoutJ=d=>rtVoyage(d,S.rt.jours,S.date).cout;
const rtSalMoy=d=>Math.round(10000*d.sal/500)*500;
const RT_COL={
  dest:['Destination','minmax(0,1fr)',d=>d.pays],
  spec:['Spécialités','minmax(0,1.2fr)',d=>d.spec[0]],
  km:['De Lyon','130px',d=>d.km],
  billet:['Billet A/R','130px',d=>d.billet],
  sal:['Bourse demandée','190px',d=>d.sal],
};
const rtCols=()=>Object.keys(RT_COL);
const rtGrille=()=>rtCols().map(k=>RT_COL[k][1]).join(' ');
function rtListeDest(){
  const F=S.rt,l=RT_DEST.filter(d=>F.reg==='toutes'||d.reg===F.reg),col=RT_COL[F.tri.col]?F.tri.col:'km',f=RT_COL[col][2];
  return l.sort((a,b)=>{const x=f(a),y=f(b);return ((x>y?1:x<y?-1:0)||(a.km-b.km))*F.tri.sens;});
}
function rtCellule(d,k){
  const V=S.rt.voyage;
  switch(k){
    case 'dest':return `<div class="rc-2l"><span class="rt-pays">${esc(d.pays)}${V&&V.dest===d.id?' <span class="rt-ily">il y est</span>':''}</span><span class="sous rc-ell">${esc(d.villes.join(', '))}</span></div>`;
    case 'spec':return `<div class="rt-spec">${d.spec.map(esc).join(' · ')}</div>`;
    case 'km':return `<span class="rt-num">${nb(d.km)} km</span>`;
    case 'billet':return `<span class="rt-num">${nb(d.billet)} €</span>`;
    case 'sal':return `<span class="rt-num">${nb(rtSalMoy(d))} €</span>`;
  }
  return '';
}
function rtTableau(){
  const l=rtListeDest(),F=S.rt;
  const th=k=>{const on=F.tri.col===k;return `<button class="rc-th ${on?'trie':''}" data-rttri="${k}">${RT_COL[k][0]}${on?(F.tri.sens>0?' ▾':' ▴'):''}</button>`;};
  return pan(`<div class="rc-tete" style="grid-template-columns:${rtGrille()}">${rtCols().map(th).join('')}</div>
    <div class="defile rc-liste rt-liste">${l.map((d,i)=>`<div class="rc-l oct ${d.id===(F.voyage?F.voyage.dest:F.dest)?'sel':''} apparait" data-rtdest="${d.id}" style="animation-delay:${Math.min(i,12)*22}ms">
      <div class="rc-li oct" style="grid-template-columns:${rtGrille()}">${rtCols().map(k=>`<div class="rc-c c-${k}">${rtCellule(d,k)}</div>`).join('')}</div></div>`).join('')}</div>`,'height:100%');
}
function rtFrise(V){
  const k=Math.max(.02,Math.min(1,(S.date-V.parti)/(V.retour-V.parti))),reste=Math.round((V.retour-S.date)/864e5);
  return `<div class="rt-frise"><span class="T">${reste>0?`Retour dans ${reste} jour${reste>1?'s':''}`:'Il rentre'}</span>
    <div class="ms-fr-l"><i style="width:${k*100}%"></i><b class="octr" style="left:${k*100}%"></b></div>
    <div class="rt-fr-e"><span class="sous">parti le ${rcJour(V.parti)}</span><span class="sous">aujourd’hui, ${rcJour(S.date)}</span></div></div>`;
}
/** Le panneau de droite : Marco disponible (la destination choisie) ou en voyage. */
function rtPanneau(){
  const V=S.rt.voyage;
  const tete=(etat)=>`<div class="rt-tete"><span class="etiq">Ton recruteur</span><span class="rt-qui">Marco Ferri</span><span class="rt-etat">${etat}</span></div>`;
  const specs=d=>`<div class="rt-bloc"><div class="etiq">Ce qu’on y trouve</div><div class="rt-specs">${d.spec.map(s=>`<span class="rt-spc">${esc(s)}</span>`).join('')}</div></div>`;
  if(V){const d=rtDe(V.dest);
    return pan(`<div class="rt-p apparait">${tete(`<span style="color:var(--texte2)">En voyage</span>`)}
      <div class="rt-ban"><i class="rt-ban-img"></i><div class="rt-ban-t"><div class="T rt-grand">${esc(d.pays)}</div><div class="rt-ou">${esc(rtVilles(d))}</div></div></div>
      ${rtFrise(V)}
      <div class="rc-faits">${rcFait('Retour',rtJourL(V.retour).replace(/^\S+ /,''),JOURS[V.retour.getDay()].toLowerCase())}${rcFait('Profils',V.profils,'toutes catégories')}${rcFait('Coût',rtEu(V.cout),'déjà payé')}</div>
      ${specs(d)}
      <div class="rt-info">Pendant le voyage, il n’est pas joignable. Son rapport arrivera le ${rtJourL(V.retour)}.</div>
      <div class="rt-bas"><button class="bb oct petit" data-rtmsg="${V.msgDepart}"><span class="oct">Son message de départ</span></button></div>
    </div>`,'height:100%');}
  const d=rtDe(S.rt.dest),v=rtVoyage(d,S.rt.jours,S.date);
  const duree=([j,n])=>`<button class="bb oct rt-duree ${S.rt.jours===j?'on':''}" data-rtjours="${j}"><span class="oct"><b class="T">${j} jours</b><span class="sous">${n} profils</span></span></button>`;
  return pan(`<div class="rt-p apparait" data-cle="${d.id}">${tete('<span style="color:var(--vert)">Disponible</span>')}
    <div class="rt-ban"><i class="rt-ban-img"></i><div class="rt-ban-t"><div class="T rt-grand">${esc(d.pays)}</div><div class="rt-ou">${esc(rtVilles(d))} <span class="sous">· ${nb(d.km)} km · ${rtTrajet(d)}</span></div></div></div>
      <div class="rt-scene">${esc(d.scene)}</div>
    ${specs(d)}
    <div class="rc-faits">${rcFait('Le voyage',`<span data-rtcompte="${v.cout}">${nb(v.cout)}</span> €`,`billet et ${v.tot} jours`)}${rcFait('Bourse demandée',`${nb(rtSalMoy(d))} €`,'par combat, en moyenne')}${rcFait('Retour le',`${v.retour.getDate()===1?'1er':v.retour.getDate()} ${RC_MOIS[v.retour.getMonth()]}`,`<span data-rtprof>${v.profils} profils</span>`)}</div>
    <div class="rt-bloc"><div class="etiq">Combien de temps sur place</div><div class="rt-durees">${RT_DUREES.map(duree).join('')}</div></div>
    <button class="bouton jaune cj rt-envoyer" data-rtenvoyer>Envoyer Marco ${esc(rtPrep(d))}</button>
  </div>`,'height:100%');
}
/** Les onglets du Recrutement : Combattants · Recruteur · Rapports (l'octogone jaune pour un rapport pas encore lu). */
function rtOnglets(cur){
  const o=(v,t)=>`<button class="onglet oct ${cur===v?'ouvert':''}" data-rtvue="${v}">${t}</button>`;
  const neuf=S.rt.rapports.some(V=>!V.lu);
  return `<div class="cl-haut">${o('contrats','Combattants')}${o('recruteur','Recruteur')}${o('rapports',`Rapports${neuf?'<span class="onglet-mq octr pulse"></span>':''}`)}</div>`;
}
const rcOngletsBase=rcOnglets;
rcOnglets=function(){return rtOnglets('contrats').replace(/data-rtvue="contrats"/,'data-rcvue="marche"');};
function rtFiltres(){
  const b=(v,t)=>`<button class="bb oct petit ${S.rt.reg===v?'on':''}" data-rtreg="${esc(v)}"><span class="oct">${t}</span></button>`;
  return `<div class="eff-filtres">${b('toutes','Toutes')}<i class="eff-sep"></i>${RT_REGIONS.map(r=>b(r,r)).join('')}</div>`;
}
function rtHtml(){rtGarder();return `<div class="rc rt">${rtOnglets('recruteur')}${rtFiltres()}<div class="rt-g">${rtTableau()}${rtPanneau()}</div></div>`;}
/** Les compteurs défilent (le coût quand on change de destination, les chiffres du rapport à l'ouverture). */
function rtCompter(e,de,v,ms=420){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){e.textContent=nb(v);return;}
  const t0=performance.now(),f=t=>{const k=Math.min(1,(t-t0)/ms),q=1-Math.pow(1-k,3);e.textContent=nb(de+(v-de)*q);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);
}
function rtAnimer(de){const e=document.querySelector('[data-rtcompte]');if(e&&de!=null&&+e.dataset.rtcompte!==de)rtCompter(e,de,+e.dataset.rtcompte);}

/* ---- L'écran Rapports, refait le 15/11 : uniquement ce qui sert à recruter.
   Le classement de Marco, puis pour chaque profil : où il se placerait dans sa catégorie chez Split (une fourchette, plus
   étroite s'il l'a vu souvent), ses chiffres face à ceux de Split, contre qui il a gagné, ce qu'il coûterait, ses risques.
   À droite, « Qui vaut le coup ? » : la place estimée contre le coût par combat, pour tout le voyage. ---- */
const rtRapSel=()=>S.rt.rapports.find(V=>V.cle===S.rt.rap)||S.rt.rapports[0];

/* ---- Le dossier d'un profil, refait le 15/11 : ce qu'un vrai rapport de recruteur contient.
   L'avis, ses notes par domaine, quand et où Marco l'a vu, les risques ; à droite ce qu'il demanderait, le niveau de ses
   adversaires, son gabarit, ses derniers combats et ses statistiques face à sa catégorie chez Split. ---- */
const RT_BARRES=[['fpm','Frappes / min',''],['prec','Précision','%'],['am','Amenées / 15 min','']];
function rtChiffres(c){
  const m=rtSplitCatStats(c.cat),s=stats(c);
  return RT_BARRES.map(([k,t,u])=>{const moy=m[k],v=s[k],max=Math.max(v,moy)*1.35,mieux=v>moy;
    return `<div class="rp-b1"><span>${t}</span><div class="rp-bj"><i style="width:${(v/max*100).toFixed(1)}%"></i><b style="left:${(moy/max*100).toFixed(1)}%"></b></div><b>${mieux?'<i class="point octr" style="background:var(--vert)"></i>':''}${virg(v)}${u}</b></div>`;}).join('');
}
/* ---- Le rapport, version aérée (retour du 15/11 : « ça ne respire pas ») : plus de bandeau.
   À gauche, ses profils ; à droite, un seul profil, avec trois choses : l'avis de Marco, ce qu'il demande et quand il l'a
   vu, puis ses points forts et ce qu'il faut surveiller. Le reste est sur sa fiche. ---- */
function rtLigneRap(p,i){
  const c=parId(p.id),x=rcDe(p.id),sel=p.id===S.rt.sel;
  return `<div class="rp-l oct ${sel?'sel':''} ${S.rt.anim?'rp-in':''}" data-rpsel="${p.id}" style="animation-delay:${150+i*90}ms"><div class="oct">
    <div class="rp-ln"><span class="ms-qui">${lien(c)}</span><span class="sous">${esc(courte(c.cat))}${/ F$/.test(c.cat)?' F':''} · ${c.age} ans · ${bilan(c)}</span></div>
    <div class="rp-lv">${x.etat==='signe'?'<span class="rt-pos rp-signe">Signé</span>':rtVerdict(p,'petit')}</div></div></div>`;
}
function rtAnalyse(V,p){
  const c=parId(p.id),x=rcDe(p.id),D=p.dos,f=/ F$/.test(c.cat),suivi=S.rc.suivis.includes(c.id);
  const js=Array.from({length:p.fois},(_,i)=>new Date(p.jour.getTime()-864e5*i*2)).sort((a,b)=>a-b),mo=RC_MOIS[js[js.length-1].getMonth()];
  const vus=[js.map(j=>j.getDate()).join(', ').replace(/, (\d+)$/,' et $1')+' '+mo];
  const lieu=D.vus[0]?D.vus[0][2].split(' · ')[0].split(', ')[0]:'';
  const liste=(l,cls,icone)=>l.map((t,i)=>`<div class="rp-pt ${cls}" style="animation-delay:${350+i*90}ms"><span class="rp-pti">${icone}</span><span>${esc(t)}</span></div>`).join('');
  return pan(`<div class="rp-an" data-cle="${p.id}">
    <div class="rp-tete rp-a"><i class="rt-ban-img"></i>
      <div style="min-width:0;position:relative"><div class="rc-pre">${esc(c.prenom)} <span>« ${esc(c.surnom)} »</span></div>
        <div class="T rp-nom nom" data-fiche="${c.id}">${esc(c.nom)}</div>
        <div class="rp-id">${esc(c.cat.replace(/ F$/,' féminin'))} · ${c.age} ans · ${esc(p.styleReel)} · ${esc(p.ville)}</div></div>
      <div class="rp-bil" style="position:relative"><span class="T">${bilan(c)}</span>${serie5(c.serie)}</div></div>
    <div class="rp-avisb rp-a">${rtVerdict(p)}<p>« ${esc(D.avis)} »</p></div>
    <div class="rp-faits rp-a">
      <div><span class="etiq">${f?'Elle':'Il'} demande</span><b class="T"><span data-rpcompte="${x.dem.bourse}">${nb(x.dem.bourse)}</span> €</b><span class="sous">par combat</span></div>
      <div><span class="etiq">Vu${f?'e':''} par Marco</span><b class="T">${p.fois} fois</b><span class="sous">${vus.length?vus.join(' et '):''}${lieu?' · '+esc(lieu):''}</span></div>
      <div><span class="etiq">Gabarit</span><b class="T">${esc(c.taille)}</b><span class="sous">allonge ${esc(c.allonge)}</span></div></div>
    <div class="rp-deux">
      <div><div class="etiq">Ses points forts</div>${D.forts.length?liste(D.forts,'fort',ico('ok',20,3)):'<p class="sous">Rien qui ressorte vraiment.</p>'}</div>
      <div><div class="etiq">À surveiller</div>${D.surveiller.length?liste(D.surveiller,'faible',ico('alerte',20)):'<p class="sous">Rien de particulier.</p>'}</div>
    </div>
    <div class="rp-act">${['signe','accord'].includes(x.etat)?rcEtatHtml(x):`<button class="bouton jaune cj rp-offre" data-rcoffre="${c.id}">${x.etat==='cours'?'Reprendre la négociation':'Faire une offre'}</button>`}
      <button class="bb oct petit ${suivi?'on':''}" data-rcsuivre="${c.id}"><span class="oct">${suivi?'Suivi':'Suivre'}</span></button>
      <button class="bb oct petit" data-fiche="${c.id}"><span class="oct">Sa fiche</span></button></div>
  </div>`,'height:100%');
}
/** Les rapports de Marco : un voyage par carte, ce qu'il a ramené, ce qui a été signé. */
function rtArchives(){
  const V0=rtRapSel();
  return S.rt.rapports.map((V,i)=>{const d=rtDe(V.dest),l=rtOrdre(V),sig=l.filter(p=>['signe','accord'].includes(rcDe(p.id).etat)).map(p=>parId(p.id)).concat((V.signes||[]).map(parId));
    return `<div class="rp-al oct ${V===V0?'sel':''} rp-in" data-rtrap="${V.cle}" style="animation-delay:${120+i*110}ms"><div class="oct">
      <div class="rp-ah"><span class="T">${esc(d.pays)}</span><span class="sous">${rcJour(V.retour)} ${V.retour.getFullYear()}</span></div>
      <div class="sous">${esc(d.villes.join(', '))} · ${V.jours} jours · ${rtEu(V.cout)}</div>
      <div class="rp-ac"><span><b class="T">${l.length}</b> profils</span><span><b class="T">${rtASigner(V)}</b> à signer</span>${sig.length?`<span class="rt-pos">Signé : ${sig.map(c=>lien(c)).join(', ')}</span>`:''}</div></div></div>`;}).join('');
}
function rtRapHtml(){
  const V=rtRapSel();if(!V)return `<div class="rc rt">${rtOnglets('rapports')}${pan('<div class="rc-vide">Aucun rapport pour l’instant.</div>')}</div>`;
  V.lu=true;const m=msPar(V.msg);if(m)m.lu=true;
  const d=rtDe(V.dest),l=rtOrdre(V);if(!l.some(p=>p.id===S.rt.sel))S.rt.sel=l[0].id;
  const p=l.find(z=>z.id===S.rt.sel),A=S.rt.archives;
  const gauche=A?`<div class="pt"><h2>Ses rapports</h2><span class="ment">${S.rt.rapports.length} voyages</span></div><div class="rp-arch">${rtArchives()}</div>`
    :`<div class="pt"><h2>${esc(d.pays)}</h2><span class="ment">${rcJour(V.retour)}</span></div>
        <div class="rp-voy">${esc(rtVilles(d))} · ${V.jours} jours · ${rtEu(V.cout)}</div>
        <div class="rp-liste">${l.map(rtLigneRap).join('')}</div>
        ${S.rt.rapports.length>1?`<button class="rp-arch-l" data-rparch>Tous ses rapports (${S.rt.rapports.length}) ›</button>`:''}`;
  return `<div class="rc rt rp">${rtOnglets('rapports')}
    <div class="rp-g">${pan(gauche,'height:100%')}${rtAnalyse(V,p)}</div></div>`;
}
function rtRapAnimer(){
  document.querySelectorAll('[data-rpcompte]').forEach((e,i)=>setTimeout(()=>rtCompter(e,0,+e.dataset.rpcompte,900),150+i*90));
}

/* ---- Branchement dans le cadre : écrans « recruteur » et « rapports », la barre garde « Recrutement » allumé ---- */
const RT_ECRANS=['recruteur','rapports'];
const rtBarreBase=rendreBarre;
rendreBarre=function(){if(!RT_ECRANS.includes(S.ecran)){rtBarreBase();return;}const e=S.ecran;S.ecran='contrats';try{rtBarreBase();}finally{S.ecran=e;}};
const rtRendreBase=rendre;
rendre=function(){
  if(!RT_ECRANS.includes(S.ecran)){rtRendreBase();return;}
  rendreBarre();rendreEntete('Recrutement');$('#alerte').classList.remove('af-al');msAlerte();
  $('#corps').style.top='152px';
  if(S.ecran==='rapports'){
    $('#corps').innerHTML=rtRapHtml();
    rtRapAnimer();S.rt.anim=false;
  }else{
    const g=$('.rt-liste'),y=g?g.scrollTop:0,ce=document.querySelector('[data-rtcompte]'),de=ce?+ce.dataset.rtcompte:null;
    $('#corps').innerHTML=rtHtml();
    const g2=$('.rt-liste');if(g2){g2.scrollTop=y;const sel=g2.querySelector('.rc-l.sel');if(!g&&sel)g2.scrollTop=Math.max(0,sel.offsetTop-g2.clientHeight/2+sel.offsetHeight/2);}
    rtAnimer(de);
  }
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const rtAllerBase=aller;
aller=function(ec){
  if(!RT_ECRANS.includes(ec)){rtAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];if(ec==='rapports')S.rt.anim=true;}
  S.ecran=ec;rendre();
};
const rtRetourBase=retour;
retour=function(){if(S.ecran==='rapports'&&!S.fiche&&S.rt.archives){S.rt.archives=false;rendre();return;}rtRetourBase();};
const rtEnteteBase=rendreEntete;
rendreEntete=function(p){rtEnteteBase(p);if(S.ecran==='rapports'&&S.rt.archives){const b=$('#bRetour');if(b)b.disabled=false;}};
const rtOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(!RT_ECRANS.includes(S.ecran)){rtOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* L'Accueil : « En voyage à <ville> · Retour le <date> » (validé), « Ouvrir › » mène au Recruteur. */
const rtAccueilBase=accueilHtml;
accueilHtml=function(){
  let h=rtAccueilBase();const V=S.rt.voyage;
  if(V){const d=rtDe(V.dest);h=h.replace('En voyage à Turin',`En voyage à ${esc(d.villes[0])}`).replace('Retour le 3 février',`Retour le ${V.retour.getDate()===1?'1er':V.retour.getDate()} ${MOIS[V.retour.getMonth()]}`);}
  return h.replace('<button style="color:var(--jaune);font-size:24px;font-weight:600">Ouvrir ›</button>','<button style="color:var(--jaune);font-size:24px;font-weight:600" data-go="recruteur">Ouvrir ›</button>');
};
/* La fiche courte du marché donne le vrai style vu par Marco (Lutte sénégalaise plutôt que « Lutte »). */
const rtFicheCourteBase=rcFicheCourte;
rcFicheCourte=function(){
  let h=rtFicheCourteBase();const x=rcDe(S.rc.sel);
  if(x&&x.rt){const c=parId(x.id);h=h.replace(`<b>${esc(c.art)}</b> · ${esc(RC_STYLES[c.style]||c.style)}`,`<b>${esc(SPEC_PROPRES[c.id])}</b> · ${esc(RC_STYLES[c.style]||c.style)}`);}
  return h;
};
/* « On en dit » d'un profil ramené : Marco d'abord, puis la presse locale et son entraîneur (À RELIRE). */
const rtEchosBase=echosDe;
echosDe=function(c){
  const p=RT_PROSP.find(z=>z.id===c.id);if(!p)return rtEchosBase(c);
  const h=c._h[0];
  return [
    ['pos','Marco Ferri','Recruteur','Son rapport',p.dos.avis,`le ${rcJour(p.vu)}`,0,'Ton recruteur'],
    ['info','La presse locale','Presse',h.soiree,`${c.prenom} ${c.nom} ${h.res==='v'?'bat':'perd contre'} ${h.adv} (${h.meth[0].toLowerCase()}, ${h.rd===1?'1er':h.rd+'e'} round).`,'il y a 1 mois',0,''],
    ['info','Son entraîneur','Entourage','',p.dos.debut,'il y a 2 semaines',0,p.coach]];
};
const rtRelationBase=relation;
relation=function(c){
  const p=RT_PROSP.find(z=>z.id===c.id);if(!p)return rtRelationBase(c);
  const d=rtDe(p.dest),h=c._h,f=/ F$/.test(c.cat),e=f?'e':'',first=h[h.length-1];
  const moments=[[String(first.date.getFullYear()),'Premier combat pro',first.soiree]];
  if(p.type==='circuit')moments.push([String(h[Math.min(2,h.length-1)].date.getFullYear()),`Champion${f?'ne':''} ${rtDuCircuit(p.circuit).replace(/^d(e la|u|e l’) /,'')}`,'']);
  if(p.type==='transfuge')moments.unshift([String(first.date.getFullYear()-2),`Champion${f?'ne':''} ${rtDu(d)} de ${rtMin(p.styleReel)}`,'chez les espoirs']);
  moments.push([String(h[0].date.getFullYear()),`Dernier combat : ${h[0].res==='v'?'victoire':'défaite'}`,h[0].soiree]);
  moments.push(['2027','Vu'+e+' par Marco Ferri',`${p.ville}, ${rcJour(p.jour)}`]);
  const ligne=(r,n,t)=>`<div class="rl-e"><span class="etiq">${r}</span><div><b>${n}</b><span class="sous">${esc(t)}</span></div></div>`;
  const parAn={};h.forEach(x=>{const y=x.date.getFullYear();parAn[y]=parAn[y]||[0,0];parAn[y][x.res==='v'?0:1]++;});
  const obj=p.type==='vieux'?[['Faire encore deux ou trois combats','cours'],['Signer dans une organisation plus grande','cours']]
    :[['Signer dans une organisation plus grande','cours'],...(c.d===0?[['Rester invaincu'+e,'cours',bilan(c)]]:[]),...(p.type==='circuit'?[['Champion'+(f?'ne':'')+' de son circuit','atteint']]:[])];
  const ETAT={atteint:['Atteint','var(--blanc)',ico('ok',16)],cours:['En cours','var(--jaune)','']};
  return `<div style="display:grid;grid-template-columns:1fr .95fr 1.15fr;gap:20px;height:100%">
    ${pan(titre('Sa carrière')+`<div class="rl-st" style="margin-top:0">Moments marquants</div>
      <div class="rl-tl2 defile ct7-defile">${[...moments].reverse().map(([a,t,s])=>`<div class="rl-mm"><span class="rl-md">${esc(a)}</span><i class="octr"></i><div><b>${esc(t)}</b>${s?`<span class="sous">${esc(s)}</span>`:''}</div></div>`).join('')}</div>`,'height:100%')}
    ${pan(titre('Son entourage')+`<div class="rl-col">${ligne('Entraîneur',esc(p.coach),'négocie pour '+(f?'elle':'lui'))}${ligne('Salle',esc(p.salle),p.ville)}${ligne('Organisation','Aucune','libre, combat dans les galas du coin')}${ligne('Agent','Aucun','')}</div>`,'height:100%')}
    ${pan(titre('Ses objectifs')+`${obj.map(([t,e2,n])=>`<div class="rl-o ${e2}"><span>${esc(t)}</span><span class="rl-oe" style="color:${ETAT[e2][1]}">${ETAT[e2][2]}${ETAT[e2][0]}${n?` <span class="sous">· ${esc(n)}</span>`:''}</span></div>`).join('')}
      <div class="rl-st">Classement mondial <span class="rl-v">non classé${e}</span></div>
      <div class="rl-st">Son bilan, année par année</div>
      ${Object.keys(parAn).sort().reverse().map(y=>`<div class="rl-o"><span>${y}</span><span>${parAn[y][0]} victoire${parAn[y][0]>1?'s':''} · ${parAn[y][1]} défaite${parAn[y][1]>1?'s':''}</span></div>`).join('')}`,'height:100%')}
  </div>`;
};
/* L'Aperçu d'un profil ramené : ses vrais traits, « non classé », libre sans avoir quitté personne. */
const rtFicheRT=rendreFiche;
rendreFiche=function(dir=0){
  rtFicheRT(dir);const p=RT_PROSP.find(z=>z.id===S.fiche);if(!p)return;const c=parId(p.id);
  const w=document.createTreeWalker($('#fiche'),NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){
    if(n.nodeValue.includes('Libre, a quitté'))n.nodeValue='Libre, sans contrat';
    else if(n.nodeValue==='N° '+c.mondial||n.nodeValue==='n° '+c.mondial)n.nodeValue='—';}
};
/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  /* Les onglets du Recrutement : Combattants · Recruteur · Rapports. */
  if((el=t.closest('[data-rcvue="recruteur"],[data-rtvue]'))){e.stopImmediatePropagation();const v=el.dataset.rtvue||'recruteur';
    if(v==='contrats'){if(S.ecran!=='contrats')aller('contrats');}else aller(v);return;}
  /* « Envoyer le recruteur » sur un combattant du marché, pendant un voyage : il n'est pas là. */
  if((el=t.closest('[data-rcenvoyer]'))&&S.rt.voyage){e.stopImmediatePropagation();const d=rtDe(S.rt.voyage.dest);
    toast(`Impossible : Marco est ${rtPrep(d)} jusqu’au ${rtJourL(S.rt.voyage.retour)}. Il pourra le voir à son retour.`);return;}
  /* « Lire le rapport » (message, Recruteur) et les messages du recruteur. */
  if((el=t.closest('[data-rtrap]'))){e.stopImmediatePropagation();const neuf=S.rt.rap!==el.dataset.rtrap||S.ecran!=='rapports';S.rt.rap=el.dataset.rtrap;S.rt.sel=null;S.rt.archives=false;if(!neuf){rendre();return;}
    if(S.ecran==='rapports'){if(neuf){S.rt.anim=true;rendre();}}else aller('rapports');return;}
  if((el=t.closest('[data-rtmsg]'))){e.stopImmediatePropagation();S.ms.sel=el.dataset.rtmsg;S.ms.anim=true;if(S.ecran==='messages'){msLire(S.ms.sel);rendre();}else aller('messages');return;}
  if(!RT_ECRANS.includes(S.ecran)||S.fiche||t.closest('[data-fiche]'))return;
  const F=S.rt;
  if(S.ecran==='rapports'){
    if(t.closest('[data-rparch]')){F.archives=!F.archives;rendre();return;}
    if((el=t.closest('[data-rpsel]'))&&el.dataset.rpsel!==F.sel){F.sel=el.dataset.rpsel;rendre();}
    return;}
  if((el=t.closest('[data-rtreg]'))){F.reg=el.dataset.rtreg;if(!F.voyage&&!rtListeDest().some(d=>d.id===F.dest))F.dest=rtListeDest()[0].id;rendre();return;}
  if((el=t.closest('[data-rttri]'))){const k=el.dataset.rttri;F.tri=F.tri.col===k?{col:k,sens:-F.tri.sens}:{col:k,sens:1};rendre();return;}
  if((el=t.closest('[data-rtdest]'))){if(F.voyage){toast(`Marco est déjà en voyage ${rtPrep(rtDe(F.voyage.dest))}, retour le ${rtJourL(F.voyage.retour)}.`);return;}
    if(F.dest!==el.dataset.rtdest){F.dest=el.dataset.rtdest;rendre();}return;}
  if((el=t.closest('[data-rtjours]'))){F.jours=+el.dataset.rtjours;rendre();return;}
  if(t.closest('[data-rtenvoyer]')){rtEnvoyer();return;}
},true);
/* Dans les Rapports, « Suivre » et « Faire une offre » passent par le Recrutement (recrutement.js) : on redessine l'écran. */
document.addEventListener('click',e=>{if(S.ecran==='rapports'&&e.target.closest('[data-rcsuivre]')){const id=e.target.closest('[data-rcsuivre]').dataset.rcsuivre,i=S.rc.suivis.indexOf(id);
  if(i>=0)S.rc.suivis.splice(i,1);else{S.rc.suivis.push(id);toast(`Tu suis ${esc(parId(id).prenom)} ${esc(parId(id).nom)}.`);}rendre();}});

/* ---- Lancement : ?ecran=recruteur, options dest=<id>, jours=3|7|14, reg=<région>, parti=1 (Marco est parti ce matin),
   jour=<n> (n jours après le départ), rentre=1 (le retour : le message condensé s'ouvre dans les Messages),
   msg=<rapport|depart>, accueil=1 (l'Accueil pendant le voyage), rapport=1 (l'écran Rapports après le retour),
   rtfiche=pepite|<id> (fiche d'un profil ramené). ?ecran=rapports ouvre le rapport de Turin. ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')==='rapports'){S.ecran='rapports';S.hist=['accueil','contrats'];S.rt.anim=true;if(q.get('sel')){const l=rtRapSel().prof;S.rt.sel=(l[+q.get('sel')]||l[0]).id;}rendre();return;}
  if(q.get('ecran')!=='recruteur')return;
  if(q.get('dest')&&rtDe(q.get('dest')))S.rt.dest=q.get('dest');
  if(q.get('jours'))S.rt.jours=+q.get('jours');
  if(q.get('reg'))S.rt.reg=q.get('reg');
  S.ecran='recruteur';S.hist=['accueil','contrats'];
  rendre();
  if(q.get('parti')||q.get('rentre')||q.get('msg')||q.get('rapport')){rtEnvoyer(true);
    for(let i=0;i<(+q.get('jour')||0);i++){S.date.setDate(S.date.getDate()+1);S.jours--;}
    if(q.get('accueil')){S.hist.push(S.ecran);S.ecran='accueil';}
    rendre();}
  if(q.get('msg')==='depart'){S.ms.sel=S.rt.voyage.msgDepart;aller('messages');}
  if(q.get('rentre')||q.get('msg')==='rapport'||q.get('rapport')){const V=S.rt.voyage;S.jours-=Math.round((V.retour-S.date)/864e5);S.date=new Date(V.retour);const m=rtRetour();
    if(q.get('rapport')){S.rt.rap=V.cle;aller('rapports');}else{S.ms.sel=m.id;S.ms.anim=true;aller('messages');}}
  /* rtfiche=pepite : la fiche de son coup de cœur (les profils n'existent qu'après le retour). */
  if(q.get('rtfiche')){const l=S.rt.passe.prof,p=l.find(z=>z.pep)||l[0];setTimeout(()=>ouvrirFiche(q.get('rtfiche')==='pepite'?p.id:q.get('rtfiche')),80);}
  if(q.get('sel')&&S.ecran==='rapports'){const l=rtRapSel().prof;S.rt.sel=(l[+q.get('sel')]||l[0]).id;rendre();}
});
