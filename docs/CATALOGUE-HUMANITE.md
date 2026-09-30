# CAGE LEGACY — MODE MANAGEMENT
## Catalogue de l'humanité (v1, proposition)

**Statut : proposition écrite par Claude le 30/09/2026, à la demande d'Anthony.**
Données brutes du lot 5 « Un monde humain » (`docs/LOT-5-UN-MONDE-HUMAIN.md`) :
tout ce qu'il faut pour qu'**un combattant soit une personne** — d'où il vient,
comment ça le fait combattre, comment on l'appelle, ce qu'il faisait avant, ce
qui lui arrive, ce qu'il fait avant de monter dans la cage, et la forme que
prend sa carrière.

**Règles.**
- Tout se **déduit de l'identifiant** du combattant, chaque couche sur son
  propre flux de hasard (règle du bureau). Rien n'est stocké, sauf les
  **moments de vie**, qui sont des faits (QO-9).
- **Aucune ligne n'entre dans le jeu sans relecture d'Anthony.** Les surnoms, les
  métiers et les libellés sont des propositions.
- **Rien de discriminatoire.** Un pays oriente un style, jamais un caractère.
  Aucun surnom ne vise une origine.
- Les villes sont réelles ; les salles, les coachs et les personnes sont
  fictifs.
- Les chiffres de calibrage sont **tirés d'observations réelles** (sources en fin
  de document) et restent à mesurer dans le jeu avant d'être figés.

**Sommaire.** §1 Pays, poids et villes · §2 Le style vient de quelque part ·
§3 Surnoms · §4 Anciens métiers · §5 Milieux · §6 Moments de vie ·
§7 Rituels · §8 Traits cachés · §9 Rôles · §10 Trajectoires · sources.

---

# 1. PAYS, POIDS ET VILLES

## 1.1 Ce qu'on observe

- L'organisation n° 1 mondiale compte **674 combattants** (février 2025) venus de
  **75 pays**. En tête : **États-Unis 226, Brésil 123, Russie 35**. Au top 15
  des classements : États-Unis 50, Brésil 39, Russie 13, Angleterre 8,
  Mexique 7, France 6, Australie 5, Chine 5, Géorgie 3, Canada 3, Japon 3,
  Pologne 3.
- La France n'a légalisé le MMA qu'en **janvier 2020**. Ses combattants
  viennent souvent d'ailleurs : savate et boxe française, kickboxing, judo,
  boxe anglaise.
- Split est une organisation **française** : son vestiaire est d'abord français
  et européen, **le monde autour de lui ressemble à celui de l'UFC**.

## 1.2 Les pays du jeu

Les quatorze codes actuels de `COUNTRIES` (`engine.js`) restent. **Seize pays
s'ajoutent** pour coller à la répartition observée ; chacun demande une liste de
prénoms et de noms réels (même travail que la T3 bis « noms » du 28/09).

| Code | Pays | Poids chez Split | Poids dans le monde |
|---|---|---|---|
| FR | France | 37 | 4 |
| BR | Brésil | 7 | 15 |
| US | États-Unis | 4 | 24 |
| GB | Royaume-Uni | 5 | 5 |
| RU | Russie | 3 | 5 |
| DAG | Daghestan | 3 | 4 |
| GE | Géorgie | 3 | 3 |
| CM | Cameroun | 4 | 1 |
| NG | Nigeria | 3 | 2 |
| IE | Irlande | 3 | 2 |
| MX | Mexique | 2 | 5 |
| JP | Japon | 2 | 3 |
| KR | Corée du Sud | 2 | 3 |
| TH | Thaïlande | 2 | 2 |
| *nouveaux* | | | |
| BE | Belgique | 3 | 1 |
| CH | Suisse | 2 | 1 |
| MA | Maroc | 3 | 1 |
| DZ | Algérie | 2 | 1 |
| SN | Sénégal | 1 | 1 |
| PL | Pologne | 2 | 2 |
| NL | Pays-Bas | 1 | 1 |
| ES | Espagne | 1 | 1 |
| IT | Italie | 1 | 1 |
| DE | Allemagne | 1 | 1 |
| SE | Suède | 1 | 1 |
| KZ | Kazakhstan | 1 | 1 |
| KG | Kirghizistan | 1 | 1 |
| CN | Chine | 0 | 3 |
| AU | Australie | 0 | 3 |
| CA | Canada | 0 | 2 |
| **Total** | | **100** | **100** |

*Le monde compte aussi les combattants de Split : ses poids propres ne jouent
que sur son vestiaire.*

## 1.3 Les villes

Chaque combattant a **une ville**, tirée dans son pays (poids égaux sauf
mention). La ville se lit sur la fiche (« de Tijuana »), peut donner un surnom
(§3.4) et **oriente le style** (§2.2). Villes réelles, rien d'autre.

| Pays | Villes |
|---|---|
| FR | Paris, Saint-Denis, Aubervilliers, Marseille, Lyon, Villeurbanne, Lille, Roubaix, Toulouse, Bordeaux, Nice, Montpellier, Nantes, Strasbourg, Rennes, Grenoble, Saint-Étienne, Le Havre, Reims, Perpignan, Bayonne, Mulhouse, Limoges, Metz, Saint-Denis de La Réunion, Pointe-à-Pitre, Fort-de-France, Cayenne, Nouméa |
| BR | Rio de Janeiro, São Paulo, Curitiba, Belo Horizonte, Manaus, Salvador, Recife, Natal, Fortaleza, Porto Alegre, Belém, Goiânia |
| US | Albuquerque, Las Vegas, San Diego, Sacramento, Stockton, Denver, Phoenix, Houston, Chicago, Philadelphie, Newark, Miami, Atlanta, Des Moines, Oklahoma City, Coconut Creek, Milwaukee, Portland, Boston, Seattle |
| GB | Londres, Liverpool, Manchester, Birmingham, Glasgow, Édimbourg, Cardiff, Newcastle, Nottingham, Leeds, Sheffield, Belfast |
| RU | Moscou, Saint-Pétersbourg, Ekaterinbourg, Kazan, Novossibirsk, Krasnodar, Oufa, Tcheliabinsk, Iakoutsk, Grozny |
| DAG | Makhatchkala, Khassaviourt, Kizliar, Derbent, Bouïnaksk, Kaspiisk |
| GE | Tbilissi, Batoumi, Koutaïssi, Roustavi, Zougdidi, Gori |
| CM | Douala, Yaoundé, Bafoussam, Garoua, Bamenda, Limbé, Kribi |
| NG | Lagos, Abuja, Ibadan, Port Harcourt, Kano, Benin City, Enugu |
| IE | Dublin, Cork, Limerick, Galway, Waterford, Drogheda |
| MX | Tijuana, Mexico, Guadalajara, Monterrey, Hermosillo, Ciudad Juárez, Puebla, Mexicali |
| JP | Tokyo, Osaka, Yokohama, Sapporo, Fukuoka, Nagoya, Kobe, Okinawa |
| KR | Séoul, Busan, Daegu, Incheon, Gwangju, Daejeon, Jeju |
| TH | Bangkok, Chiang Mai, Phuket, Buriram, Khon Kaen, Nakhon Ratchasima, Pattaya, Surin |
| BE | Bruxelles, Liège, Charleroi, Anvers, Gand, Namur |
| CH | Genève, Lausanne, Zurich, Bâle, Berne |
| MA | Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir |
| DZ | Alger, Oran, Constantine, Annaba, Sétif |
| SN | Dakar, Thiès, Saint-Louis, Rufisque, Ziguinchor |
| PL | Varsovie, Cracovie, Gdańsk, Wrocław, Łódź, Poznań |
| NL | Amsterdam, Rotterdam, La Haye, Utrecht, Eindhoven, Breda |
| ES | Madrid, Barcelone, Valence, Séville, Bilbao, Tenerife |
| IT | Rome, Milan, Naples, Turin, Bari, Palerme |
| DE | Berlin, Hambourg, Cologne, Munich, Francfort, Düsseldorf |
| SE | Stockholm, Göteborg, Malmö, Uppsala |
| KZ | Almaty, Astana, Chymkent, Karaganda |
| KG | Bichkek, Och, Djalal-Abad, Karakol |
| CN | Pékin, Shanghai, Chengdu, Kunming, Guangzhou, Harbin |
| AU | Sydney, Melbourne, Brisbane, Perth, Adélaïde, Gold Coast |
| CA | Montréal, Toronto, Vancouver, Calgary, Winnipeg, Québec |

**Villes-écoles** : certaines villes pèsent plus parce qu'une tradition y
fabrique des combattants (§2.2). Poids doublé : Rio de Janeiro, Curitiba,
Albuquerque, Tijuana, Makhatchkala, Khassaviourt, Bangkok, Buriram, Dublin,
Amsterdam, Tbilissi, Paris, Marseille, Liverpool.

---

# 2. LE STYLE VIENT DE QUELQUE PART

## 2.1 Ce qu'on observe

- **Daghestan** : la lutte est un mode de vie dès l'enfance, avec le sambo et
  le judo ; enchaînement d'attaques au sol sans répit.
- **Brésil** : le berceau du jiu-jitsu (la famille Gracie), la plus grande
  réserve de spécialistes du sol ; le muay-thaï de Curitiba.
- **Thaïlande** : le muay-thaï, plus populaire que le football ; coups de pied,
  clinch, genoux, coudes.
- **Pays-Bas** : le kickboxing hollandais, garde haute, enchaînements de poings,
  low-kicks lourds.
- **Mexique** : la boxe de pression, volume, accepter un coup pour en placer un ;
  Tijuana est une fabrique de combattants.
- **Géorgie** : lutte et judo. **Kazakhstan et Kirghizistan** : lutte, sambo,
  boxe soviétique, nouvelle génération complète.
- **France** : savate et boxe française, kickboxing, judo, boxe anglaise.
- **États-Unis** : la lutte universitaire, base de beaucoup de champions.

## 2.2 Les poids de style par pays

Aujourd'hui le style est tiré **au hasard, sans lien avec le pays**
(`makeFighter` : `pick(STYLE_KEYS)` ; le management passe par
`mgmt-corps.js:174`). La proposition : **le pays donne une distribution, la
ville la décale.** Les huit styles sont ceux de `STYLES` (`engine.js`) ; **le
moteur n'est pas modifié**, seul le choix du style passé à `makeFighter`
change (option `opt.style`, qui existe déjà).

| Pays | Boxe | Kick | Muay | Karaté | Lutte | JJB | Sambo | MMA |
|---|---|---|---|---|---|---|---|---|
| FR | 18 | 22 | 10 | 6 | 6 | 12 | 2 | 24 |
| BR | 6 | 6 | 18 | 4 | 4 | 36 | 0 | 26 |
| US | 14 | 8 | 4 | 4 | 34 | 10 | 0 | 26 |
| GB | 24 | 18 | 14 | 4 | 6 | 12 | 0 | 22 |
| RU | 16 | 10 | 4 | 4 | 16 | 2 | 30 | 18 |
| DAG | 4 | 2 | 0 | 2 | 44 | 2 | 30 | 16 |
| GE | 8 | 4 | 2 | 2 | 42 | 4 | 20 | 18 |
| CM | 26 | 12 | 4 | 4 | 20 | 4 | 0 | 30 |
| NG | 24 | 8 | 4 | 2 | 34 | 2 | 0 | 26 |
| IE | 40 | 8 | 4 | 6 | 4 | 14 | 0 | 24 |
| MX | 44 | 6 | 8 | 2 | 8 | 10 | 0 | 22 |
| JP | 10 | 12 | 4 | 22 | 10 | 16 | 0 | 26 |
| KR | 10 | 22 | 4 | 6 | 12 | 10 | 0 | 36 |
| TH | 6 | 8 | 70 | 0 | 2 | 4 | 0 | 10 |
| BE | 16 | 26 | 14 | 6 | 6 | 10 | 2 | 20 |
| CH | 14 | 22 | 10 | 8 | 8 | 14 | 0 | 24 |
| MA | 24 | 30 | 10 | 4 | 6 | 6 | 0 | 20 |
| DZ | 30 | 22 | 8 | 6 | 10 | 4 | 0 | 20 |
| SN | 18 | 8 | 4 | 2 | 40 | 2 | 0 | 26 |
| PL | 16 | 14 | 6 | 4 | 18 | 12 | 4 | 26 |
| NL | 10 | 44 | 14 | 4 | 4 | 6 | 0 | 18 |
| ES | 18 | 20 | 10 | 8 | 8 | 12 | 0 | 24 |
| IT | 20 | 20 | 12 | 6 | 6 | 12 | 0 | 24 |
| DE | 18 | 22 | 10 | 6 | 10 | 10 | 0 | 24 |
| SE | 16 | 18 | 10 | 4 | 10 | 16 | 0 | 26 |
| KZ | 18 | 6 | 2 | 2 | 34 | 2 | 20 | 16 |
| KG | 16 | 6 | 2 | 2 | 36 | 2 | 22 | 14 |
| CN | 14 | 20 | 8 | 10 | 16 | 4 | 0 | 28 |
| AU | 22 | 16 | 12 | 4 | 8 | 14 | 0 | 24 |
| CA | 14 | 10 | 8 | 6 | 22 | 14 | 0 | 26 |

*Le Sénégal pèse sur la lutte : la lutte sénégalaise est le premier sport du
pays. Le Nigeria aussi a sa lutte traditionnelle. Le Maroc et l'Algérie
viennent du kickboxing et de la boxe, très implantés.*

**Décalages de ville** (points ajoutés avant de ramener le total à 100) :

| Ville | Décalage |
|---|---|
| Rio de Janeiro, Manaus | JJB +15 |
| Curitiba | Muay +20 |
| Albuquerque | MMA +15 |
| Des Moines, Oklahoma City | Lutte +15 |
| Philadelphie, Newark | Boxe +12 |
| Stockton | Boxe +8, JJB +8 |
| Tijuana, Hermosillo | Boxe +12 |
| Makhatchkala, Khassaviourt | Lutte +12 |
| Grozny | Lutte +8, Boxe +6 |
| Ekaterinbourg | Boxe +12 |
| Iakoutsk | Lutte +12 |
| Tbilissi, Gori | Lutte +10 |
| Bangkok, Buriram, Surin | Muay +10 |
| Amsterdam, Rotterdam | Kick +12 |
| Dublin | Boxe +8, MMA +8 |
| Liverpool | JJB +8, MMA +6 |
| Paris, Saint-Denis, Aubervilliers | Kick +8, Boxe +6 |
| Marseille | Boxe +10 |
| Montpellier | JJB +10 |
| Okinawa | Karaté +15 |
| Osaka | Karaté +6, Boxe +6 |
| Dakar, Thiès | Lutte +10 |
| Casablanca | Kick +10 |
| Almaty, Bichkek | Lutte +8, Boxe +6 |
| Montréal | MMA +10 |

**Exemple.** Une combattante de Curitiba : 6 / 6 / 38 / 4 / 4 / 36 / 0 / 26,
ramené à 100. Muay-thaï ou jiu-jitsu, presque à égalité. Un lutteur de
Khassaviourt a presque une chance sur deux d'être lutteur, et presque aucune
d'être thaïboxeur.

## 2.3 Ce que ça change à l'écran

- La fiche dit **d'où vient le style** : « Lutte, comme on l'apprend à
  Khassaviourt », « Muay-thaï de Curitiba ». Libellé d'auteur.
- La presse (Tableau Noir, Cage Hebdo) s'en sert : « un lutteur daghestanais
  contre un thaïboxeur de Buriram » est **un matchup lisible sans chiffre**.
- Le joueur apprend à **lire le monde par la géographie**, comme un vrai
  matchmaker.

---

# 3. SURNOMS

## 3.1 Ce qu'on observe

Sur environ 2 500 surnoms de combattants de l'UFC :

- **Les thèmes** : personnalité et attitude (456), métiers et rôles (424),
  animaux (410), armes et destruction (289), provenance (274)… le moins
  fréquent : les matériaux (59). **28 % des surnoms mêlent deux thèmes.**
- **Deux tiers sont uniques.** Les doublons les plus fréquents : « The Hammer »,
  « The Beast » (13 chacun), « The Machine » (12).
- **79 % sont en anglais** ; puis portugais (190), espagnol (133), japonais
  (54), et 35 autres langues.
- **148 jouent sur le nom** du combattant (rime, inclusion, homonyme).
- Un surnom se **donne** (coach, salle, promoteur), se **choisit**, ou se
  **gagne** après un combat.
- **En Thaïlande**, le combattant prend un **nom de ring suivi du nom de sa
  salle** (« Sor. », « Sit » pour « élève de »), et **en change quand il change
  de salle**.

## 3.2 Les règles du jeu

- **Chaque combattant a un surnom** (décision d'Anthony du 30/09).
- **La langue suit le pays** : français pour FR, BE, CH, MA, DZ, SN, CM ;
  portugais pour BR ; espagnol pour MX ; japonais pour JP ; anglais pour les
  autres, avec une part de langue du pays (§3.3).
- **Le thème suit ce qu'on sait de lui** : ancien métier → thème métier ; ville →
  provenance ; voix → personnalité ; style → armes ou animaux.
- **Un surnom sur trois environ se donne plus tard** : le combattant commence
  avec un surnom de salle, et **la presse lui en donne un autre** après un
  combat marquant (un KO spectaculaire, une guerre). C'est un moment de vie
  (§6).
- **Aucun doublon dans une même catégorie** ; quelques doublons dans le monde,
  comme dans la réalité.
- **Aucun surnom qui vise une origine**, aucun surnom de combattant réel célèbre.

## 3.3 La banque

**Français — personnalité.** Sang-Froid · Le Doux · Sale-Gosse · La Teigne ·
Tête-Brûlée · Casse-Cou · Trompe-la-Mort · Cœur-de-Pierre · Le Sphinx ·
Gueule-d'Ange · Le Môme · Sans-Sommeil · Le Taiseux · Petit-Prince · Tête-de-Mule
· Le Grand Calme · Mauvais-Œil · Le Sourire · Pas-de-Chance · L'Insolent

**Français — métiers.** Le Notaire · L'Horloger · Le Couvreur · Le Plombier ·
Le Rémouleur · Le Facteur · Le Maçon · L'Instit' · Le Docteur · Le Bûcheron ·
Le Boulanger · Le Ferrailleur · Le Carreleur · Le Grutier · Le Videur · Le
Pompier · Le Livreur · L'Huissier · Le Menuisier · Le Chaudronnier

**Français — animaux.** La Mangouste · Le Frelon · Le Sanglier · La Belette ·
L'Ours · Le Chat · La Guêpe · Moustique · P'tit Loup · Grand-Duc · Le Blaireau
· La Murène · Le Taureau · L'Orque · Le Bouc · La Fouine · Le Coq · La
Vipère · Le Chacal · Le Corbeau

**Français — armes, matériaux, météo.** L'Enclume · Casse-Noix · Brise-Os ·
Brise-Glace · La Tenaille · La Gâchette · La Fronde · L'Aiguille · Main-Froide
· Bras-de-Fer · Fil-de-Fer · Tête-de-Bois · Vieux-Bois · L'Ardoise · Le Roc ·
La Grêle · L'Orage · La Marée · Coup-de-Grisou · Pique-Feu

**Français — drôles, ironiques.** Tonneau · Quart-d'Heure · Bout-d'Allumette ·
Poids-Plume *(pour un lourd)* · Mille-Pattes · Pas-de-Loup · La Rature ·
Double-Six · Le Cierge · Petit-Hiver · Le Vieux · Deux-Temps · Chaussette ·
Gros-Câlin · La Sieste

**Anglais.** The Anvil · Nightshift · The Locksmith · The Mailman · Slow Burn ·
Deadbolt · Brickhouse · The Plumber · Two-Shift · Rusty · The Preacher · The
Bulldozer · The Mechanic · Sunday Punch · Last Call · The Landlord · Foghorn ·
The Ferryman · Stonewall · Coldwater · The Grinder · Scrap Iron · Buzzsaw ·
The Tax Man · Knuckles · Tiny · Heartbreaker · Night Train · Blue Collar · The
Bishop · Cornerstone · Riptide · Short Fuse · Wildfire · The Weatherman ·
Sandbag · Kid Lightning · The Hammer · The Beast · The Machine

*Les trois derniers sont les doublons les plus fréquents du monde réel : ils
peuvent revenir chez plusieurs combattants, comme dans la réalité.*

**Portugais (BR).** Tijolo · Marreta · Furacão · Tatu · Formiga · Gato Preto ·
Trovão · Cachorro Louco · Pé-de-Chumbo · Sombra · Carrapato · Bate-Estaca ·
Sucuri · Relâmpago · Vovô · Moleque · Cabeça-Dura · Peixe · Pesadelo · Pedreiro
· Leão da Favela *(provenance)* · Coração Valente · Boca de Ferro · Tubarão ·
Mão Pesada

**Espagnol (MX).** El Martillo · La Mula · El Alacrán · El Tlacuache · El
Relámpago · La Tormenta · El Gallo · El Chato · El Güero · El Flaco · El
Chamaco · Manos de Hierro · El Diablito · El Cuervo · El Profe · El Panadero ·
El Cometa · Sin Miedo · El Terco · El Albañil

**Japonais (JP).** Kaminari (le tonnerre) · Tetsu (le fer) · Kuma (l'ours) ·
Kaze (le vent) · Tora (le tigre) · Kitsune (le renard) · Yamaotoko (l'homme de
la montagne) · Hagane (l'acier) · Namazu (le poisson-chat qui fait trembler la
terre) · Oni (le démon) · Kawauso (la loutre) · Hibana (l'étincelle)

**Russe, Daghestan, Kazakhstan, Kirghizistan** (translittéré, traduit sur la
fiche). Medved (l'ours) · Molot (le marteau) · Kuvalda (la masse) · Volk (le
loup) · Tank · Kamen (la pierre) · Burya (la tempête) · Sokol (le faucon) ·
Gorets (le montagnard) · Batyr (le héros, KZ/KG)

**Coréen** (motif réel : « The Korean … »). The Korean Bulldozer · The Korean
Wolf · The Korean Mailman · The Seoul Train

**Géorgien et polonais** (anglais ou langue du pays). The Georgian Bull · Lomi
(le lion, géorgien) · Mlot (le marteau, polonais) · Wilk (le loup, polonais)

## 3.4 Les surnoms construits

- **Provenance** (274 surnoms réels) : « Le Gamin de {ville} », « La Fierté de
  {ville} », « {Ville} Kid », « Le Mur de {ville} ». Exemples : Le Gamin de
  Roubaix, La Fierté de Bamenda, Tijuana Kid.
- **Jeu sur le nom** (148 surnoms réels) : rime, inclusion ou homonyme. Le code
  propose, **l'auteur valide** : un nom qui contient « roc » peut devenir « Le
  Roc » ; un nom qui rime avec « tonnerre » peut devenir « Tonnerre ».
- **Thaïlande** : nom de ring + salle. **Le combattant thaï change de surnom
  quand il change de camp** (§6, changement de camp). Motif : « {nom de ring}
  Sor.{salle} » ou « {nom de ring} Sit{salle} ». Noms de ring et de salles à
  écrire par Anthony (lot 5, camps).

## 3.5 Le surnom qui se gagne

Un surnom donné par la presse remplace le surnom de salle après **un fait
marquant** : KO en moins de 30 secondes, trois guerres d'affilée, une remontée
au dernier round, une série de soumissions. Le fait se garde ; le surnom se
déduit de ce fait. Exemples : « Trente-Secondes », « Le Revenant », « Dernier
Round », « L'Étrangleur ».

---

# 4. ANCIENS MÉTIERS

## 4.1 Ce qu'on observe

Avant ou pendant leur carrière, des combattants ont été professeurs de maths,
remplaçants à l'école primaire, pompiers (certains le restent en parallèle),
videurs de boîte de nuit, apprentis plombiers, militaires des forces
spéciales ; beaucoup viennent du bâtiment. **Un débutant gagne à peine de quoi
vivre** (autour de 10 000 à 12 000 dollars pour combattre, autant pour gagner, à
une ou deux fois par an) : **beaucoup gardent un emploi à côté.**

## 4.2 Ce que ça fait dans le jeu

- Une ligne sur la fiche : « Ancien couvreur à Limoges ».
- **Un emploi qui continue** (« double emploi ») pour certains combattants de bas
  de carte : il limite leur disponibilité (camp plus court), et il disparaît
  quand la bourse suffit. Un moment de vie (§6) : « a quitté son emploi ».
- **Des affinités** : le métier nourrit une voix (le Soldat, le Prof, le Double
  emploi, le Repenti), un surnom (§3.3), des moments de vie (un pompier appelé
  la semaine du combat).

## 4.3 La liste (150)

**Bâtiment et travaux.** maçon · couvreur · électricien · plombier · carreleur ·
plaquiste · peintre en bâtiment · charpentier · menuisier · grutier · conducteur
d'engins · soudeur · chaudronnier · ferrailleur · échafaudeur · cordiste ·
paysagiste · élagueur · démolisseur · étancheur

**Industrie et logistique.** ouvrier en usine · cariste · préparateur de
commandes · docker · déménageur · manutentionnaire · mécanicien auto ·
carrossier · mécanicien poids lourds · chaudronnier naval · ouvrier agricole ·
agent de tri postal · ouvrier en abattoir · opérateur de ligne · magasinier

**Transport.** livreur à scooter · coursier à vélo · chauffeur routier ·
chauffeur de bus · chauffeur VTC · taxi · ambulancier · convoyeur de fonds ·
marin pêcheur · matelot de commerce

**Sécurité et uniformes.** videur · agent de sécurité · maître-chien · pompier
professionnel · pompier volontaire · militaire du rang · parachutiste · commando
· gendarme · policier municipal · gardien de prison · garde du corps ·
sauveteur en mer · surveillant de baignade

**Santé et soin.** aide-soignant · infirmier · kinésithérapeute · brancardier ·
ostéopathe · étudiant en médecine · préparateur en pharmacie · auxiliaire de vie ·
masseur · éducateur spécialisé

**Éducation et sport.** professeur d'EPS · professeur de maths · professeur
d'histoire · instituteur · surveillant de collège · animateur de centre de
loisirs · éducateur sportif · coach de fitness · maître-nageur · entraîneur de
foot des petits

**Commerce, hôtellerie, bouche.** serveur · barman · plongeur · cuisinier ·
commis de cuisine · pizzaïolo · boulanger · pâtissier · boucher · poissonnier ·
vendeur en magasin de sport · caissier · vendeur de téléphones · agent
immobilier · commercial · télévendeur · livreur de pizza · marchand sur les
marchés · primeur · kebab du quartier *(tenu par la famille)*

**Terre et mer.** agriculteur · éleveur · berger · bûcheron · pêcheur · mineur ·
ouvrier viticole · saisonnier aux vendanges · jardinier · apiculteur

**Arts, spectacle, image.** danseur · cascadeur · figurant · mannequin ·
tatoueur · coiffeur · barbier · DJ · rappeur · musicien de bal · photographe ·
graphiste · streamer · monteur vidéo

**Bureau et technique.** comptable · informaticien · développeur · technicien
réseau · employé de banque · assistant juridique · agent d'assurance · employé
de mairie · agent de la Poste · standardiste

**Études et à-côtés.** étudiant en droit · étudiant en STAPS · étudiant en
ingénierie · lycéen *(débute à 18 ans)* · apprenti · intérimaire ·
saisonnier en station de ski

**Autres sports.** lutteur olympique · judoka de haut niveau · boxeur amateur
de l'équipe nationale · kickboxeur professionnel · footballeur en centre de
formation · rugbyman semi-pro · handballeur · haltérophile · champion de
taekwondo · lutteur de lutte traditionnelle

**La vie sans métier.** sans emploi · en foyer · a vécu dans la rue · a fait de
la prison · a vendu dans son quartier · réfugié en attente de papiers

*Les six dernières lignes ne sont jamais une caricature : elles nourrissent le
Repenti, le Rescapé, l'Exilé (voix), et la presse ne les cite que si le
combattant en parle lui-même.*

---

# 5. MILIEUX

D'où il vient, en une ligne. **Le milieu oriente la voix et le métier sans les
décider.**

quartier populaire d'une grande ville · cité de banlieue · centre-ville ·
petite ville industrielle · village de montagne · village de pêcheurs ·
campagne agricole · famille aisée · famille de sportifs · famille de militaires
· famille d'enseignants · famille nombreuse · fils ou fille unique · élevé par
ses grands-parents · élevé par sa mère seule · élevé par son père seul · foyer
de l'aide sociale à l'enfance · famille arrivée récemment dans le pays ·
enfance entre deux pays · famille de commerçants · famille d'agriculteurs ·
enfance dans une salle de boxe (un parent coach)

---

# 6. MOMENTS DE VIE

## 6.1 Ce qu'on observe

- **L'échelle de Holmes et Rahe** (1967, 43 événements) mesure le poids d'un
  changement de vie : décès du conjoint 100, divorce 73, séparation 65, prison
  63, décès d'un proche 63, blessure ou maladie 53, mariage 50, licenciement 47,
  retraite 45, grossesse 40, arrivée d'un nouveau membre de la famille 39,
  changement financier 38, décès d'un ami proche 37, accomplissement
  personnel 28, déménagement 20, vacances 13, petite infraction 11. **Au-delà de
  300 points sur un an, le risque de problème de santé devient majeur.**
- **Le modèle stress-blessure** (Andersen et Williams, 1988) : les **événements
  de vie négatifs** sont le meilleur prédicteur des blessures d'un sportif, par
  la tension musculaire, la fatigue et l'attention qui décroche. Plus de 70 %
  des études le confirment.
- **La plupart des blessures arrivent au camp, pas dans la cage.** Une grande
  salle a compté 18 % de retraits sur blessure. 94 % des blessés reviennent.
- **La coupe de poids** : environ 5 % du poids perdu dans les quatre derniers
  jours, humeur en chute, irritabilité, brouillard ; 60 à 80 % des combattants
  coupent ; 39 % montent dans la cage déshydratés.
- **Le blues d'après-combat**, même après une victoire : huit à douze semaines
  de camp coupé du monde, puis plus rien.
- **La retraite** : chez les anciens sportifs, anxiété et dépression plus de
  deux fois plus fréquentes que dans la population ; environ un sur cinq la vit
  comme une crise.
- **Le jeûne** : certains combattants refusent de combattre pendant le mois de
  jeûne et demandent plusieurs semaines après ; d'autres n'ont pas ce luxe.

## 6.2 Comment le jeu s'en sert

- Chaque cycle, **chaque combattant a une petite chance de vivre un moment**,
  tirée sur un flux `'vie'`. Les moments **sont des faits** : ils se gardent
  (QO-9) et se lisent sur sa fiche, dans « Sa vie ».
- **Chaque moment a un poids**, inspiré de Holmes et Rahe. **La charge d'un
  combattant** est la somme des poids de ses moments de l'année écoulée. **Elle ne
  s'affiche jamais en chiffre** (ni note, ni jauge) : elle se lit dans ses mots,
  dans la presse, et dans l'avis de Clara.
- **Au-delà de 150**, il est chargé : risque de blessure au camp augmenté (modèle
  stress-blessure), forme en baisse (paramètre `dynamic` de `makeFighter`, qui
  existe déjà et vaut 0 aujourd'hui). **Au-delà de 300**, il est au bord : un
  retrait sur blessure devient probable, et certaines voix changent de ton.
- **Les moments heureux pèsent aussi** (mariage 50, naissance 39) : ils prennent
  de la place dans une vie, mais n'augmentent pas le risque de blessure (le
  modèle ne retient que les événements négatifs).
- **Le joueur ne voit pas tout** : un moment privé n'apparaît que si la presse ou
  le combattant en parle.

## 6.3 La liste (109)

Colonnes : **poids** (charge), **qui le relaie** (média §6 du document des voix,
ou le combattant lui-même), **ce que ça change**.

**Famille.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Naissance d'un enfant | 39 | Coin Rouge, réseaux | Peut refuser un combat ce cycle-là |
| Grossesse annoncée (combattante) | 40 | Réseaux | Pause de carrière ; la Mère au retour |
| Grossesse de sa compagne | 25 | Micro Tendu | Veut combattre avant la naissance |
| Décès d'un parent | 63 | Cage Hebdo, une ligne | Retrait possible ; peut dédier le combat suivant |
| Décès d'un grand-parent | 30 | Lui-même | Dédicace |
| Décès d'un frère ou d'une sœur | 63 | Cage Hebdo | Charge forte ; voix plus grave |
| Parent gravement malade | 44 | Lui-même | Veut combattre près de chez lui |
| Enfant malade | 44 | Personne, sauf s'il en parle | Retrait possible |
| Mariage | 50 | Réseaux, Micro Tendu | Aucune indisponibilité si hors camp |
| Séparation | 65 | Le Forum | Forme en baisse |
| Divorce | 73 | Clé de Bras | Forme en baisse, argent en baisse |
| Réconciliation | 45 | Réseaux | — |
| Nouveau couple médiatisé | 20 | Clé de Bras | Attention en hausse |
| Un frère ou une sœur passe pro | 15 | Coin Rouge | Lien familial dans le vestiaire (§ liens) |
| Son enfant fait ses débuts dans un sport de combat | 10 | Réseaux | Le Vieux de la vieille en parle |
| Adopte un chien | 5 | Réseaux | L'Influenceur en fait trois vidéos |
| Déménage pour rejoindre sa famille | 20 | Lui-même | Change parfois de camp |
| Dispute familiale publique | 35 | Clé de Bras | Le Clan se tait |
| Père ou mère vient le voir combattre pour la première fois | 10 | Lui-même | Pression ; le Clan et le Timide en parlent |
| Réunion de famille au pays | 15 | La presse du pays | L'Enfant du pays pleure |

**Santé et corps.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Blessure à l'entraînement | 53 | Sources Proches | Retrait ; retour en N cycles |
| Opération chirurgicale | 53 | Cage Hebdo | Absence longue |
| Commotion en sparring | 53 | Personne ; Clara le sait | Clara donne un avis |
| Maladie la semaine du combat | 30 | Sources Proches | Retrait tardif (carte incomplète) |
| Pesée ratée | 25 | Tous | Amende ; colère de Delatour ; le combat peut tenir |
| Coupe de poids dangereuse | 35 | La Pesée | Hospitalisation possible ; Clara |
| Monte d'une catégorie | 30 | Tableau Noir, Cage Hebdo | Nouveau classement |
| Descend d'une catégorie | 35 | Tableau Noir | Coupe plus dure |
| Reprend 15 kilos hors camp | 15 | Le Forum | Pesée plus risquée au prochain camp |
| Contrôle antidopage positif | 60 | La Pesée, Clé de Bras | Suspension ; réputation |
| Blues d'après-combat | 30 | Lui-même, parfois ; Micro Tendu | Inactivité volontaire, même après une victoire |
| Dépression déclarée | 50 | Lui-même, s'il en parle | Pause ; la rupture du Cœur ouvert |
| Arrête l'alcool | 24 | Lui-même | Forme en hausse |
| Se remet à boire | 30 | Le Forum | Forme en baisse |
| Insomnies de camp | 16 | Personne | Forme en baisse légère |
| Blessure hors cage (accident de scooter, chute) | 40 | Sources Proches | Retrait |
| Bagarre de bar | 35 | Clé de Bras | Suspension possible ; blessure à la main |
| Mois de jeûne pendant le camp | 15 | Lui-même | Préfère ne pas combattre ce mois-là ; certains n'ont pas le choix |
| Décide de ne plus couper de poids | 20 | Tableau Noir | Monte d'une catégorie |
| Premier scanner cérébral inquiétant | 45 | Personne ; Clara | Avis de Clara |

**Argent et travail.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Quitte son emploi pour combattre à plein temps | 36 | Coin Rouge | Camp complet ; plus de disponibilité |
| Perd son emploi | 47 | Lui-même | Accepte tout (comme la nécessité) |
| Reprend un emploi | 26 | Lui-même | Moins disponible |
| Première grosse prime | 28 | Réseaux | Achète quelque chose : voiture, maison des parents |
| Achète une maison à ses parents | 20 | Coin Rouge, réseaux | — |
| Dettes | 38 | Le Forum | Accepte les combats à court préavis |
| Nouveau sponsor | 10 | Réseaux | L'Influenceur surtout |
| Perd un sponsor | 15 | Clé de Bras | — |
| Ouvre sa salle | 36 | Coin Rouge | Moins de temps au camp ; pense à l'après |
| Lance une marque de vêtements | 20 | Réseaux | — |
| Litige avec son manager | 30 | Sources Proches | Refuse de négocier un temps |
| Change d'agent | 15 | Sources Proches | Rebecca Lasso peut entrer (lot futur) |
| Bourse publiée | 10 | La Pesée | L'Aigri a de quoi parler |
| Réclame une augmentation | 15 | Lui-même | Demande (cf. promesses) |

**Justice et incidents.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Garde à vue | 40 | Clé de Bras, Le Forum | Suspension possible |
| Condamnation | 63 | Cage Hebdo | Absence ; le Repenti à la sortie |
| Excès de vitesse médiatisé | 11 | Clé de Bras | — |
| Problème de visa | 30 | Sources Proches | Ne peut pas combattre en France ce cycle-là |
| Obtient la nationalité | 28 | La presse du pays, Cage Hebdo | — |
| Obtient ses papiers | 40 | Coin Rouge | Peut enfin combattre partout ; l'Exilé |
| Accusé à tort, puis blanchi | 50 | La Pesée | Voix plus dure |
| Plainte d'un voisin de salle | 10 | Personne | — |

**Carrière et camp.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Change de camp | 36 | Sources Proches, Tableau Noir | Le style peut évoluer ; le Thaï change de nom |
| Dispute publique avec son coach | 35 | Clé de Bras | Changement de camp probable |
| Son coach meurt | 63 | Cage Hebdo | Charge forte ; dédicace |
| Son coach prend sa retraite | 20 | Cage Hebdo | — |
| Nouveau partenaire d'entraînement célèbre | 10 | Réseaux | — |
| Un coéquipier est booké contre lui | 30 | Sources Proches | Refus probable (§ liens) |
| Offre d'une autre organisation | 20 | Sources Proches | Risque de départ (lot 2B) |
| Invité en consultant à la télévision | 10 | Le Plateau | Visibilité |
| Tourne dans un film ou une série | 15 | Coin Rouge | Absence d'un cycle |
| Documentaire sur sa vie | 20 | Coin Rouge | Popularité ; la presse du pays |
| Vidéo virale | 15 | Le Forum, Clé de Bras | Popularité |
| Clash avec un combattant d'une autre organisation | 10 | Réseaux | Occasion de recrutement |
| Rival qui l'appelle en public | 10 | Réseaux, Le Forum | Occasion : « Envisager ce combat » |
| Reçoit un surnom de la presse | 5 | Cage Hebdo | Nouveau surnom (§3.5) |
| Annonce sa retraite | 45 | Tous | Départ |
| Revient de sa retraite | 36 | Tous | Retour ; le Vieux de la vieille |
| Retraite d'un ancien coéquipier | 15 | Cage Hebdo | Il y pense |
| Sparring qui tourne à la bagarre | 20 | Le Forum | Blessure possible |
| Obtient une ceinture noire | 28 | Réseaux | Style (JJB) confirmé |
| Diplôme obtenu | 28 | Micro Tendu | Le Prof et l'Étudiant en parlent |

**Lieux et vie.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Déménage dans une autre ville | 20 | Lui-même | Peut changer de camp |
| S'installe à l'étranger pour un camp | 25 | Tableau Noir | Style qui évolue |
| Retourne vivre au pays | 25 | La presse du pays | Moins disponible pour Split |
| Maison inondée ou incendiée | 38 | Coin Rouge | Accepte tout pour payer |
| Voyage de pèlerinage | 12 | Lui-même | Absent un cycle |
| Vacances qui dérapent (photos) | 13 | Le Forum | — |
| Engagement associatif (enfants, prison, santé mentale) | 10 | Coin Rouge | Le Cœur ouvert, le Repenti |
| Visite une école de son ancien quartier | 5 | Coin Rouge | — |
| Arrête les réseaux sociaux | 10 | Le Forum | Le Réclamant devient muet un temps |
| Revient sur les réseaux | 5 | Réseaux | — |
| Se fait tatouer le nom de sa ville | 5 | Réseaux | — |
| Change de religion ou reprend la pratique | 19 | Lui-même, s'il en parle | Voix du Fataliste possible |
| Participe à une émission de télé-réalité | 20 | Clé de Bras | L'Influenceur |
| Chante l'hymne à un match de foot | 5 | Réseaux | — |

**Autour de la cage.**

| Moment | Poids | Relais | Effet |
|---|---|---|---|
| Première victoire par KO | 28 | Cage Hebdo | Confiance |
| Premier KO subi | 45 | Cage Hebdo | Peur ; certaines voix changent (§4 des voix) |
| Série de trois défaites | 40 | Le Forum | Pense à arrêter |
| Série de cinq victoires | 28 | Cage Hebdo | Réclame un classé |
| Entre dans le top 15 | 28 | Cage Hebdo | — |
| Sort du top 15 | 30 | Le Forum | — |
| Devient champion | 28 | Tous | Pression ; blues possible |
| Perd sa ceinture | 45 | Tous | — |
| Combat annulé la veille | 30 | Sources Proches | Frustration ; bourse perdue |
| Victoire volée (décision contestée) | 35 | Le Forum | Réclame la revanche |
| Blesse gravement un adversaire | 40 | Cage Hebdo | Peut douter ; le Contemplatif en parle |
| Combat de l'année | 20 | Cage Hebdo, Le Plateau | Popularité |
| Premier combat devant son public | 15 | Coin Rouge, la presse du pays | Pression et joie |

---

# 7. RITUELS

## 7.1 Ce qu'on observe

Beaucoup de combattants ont des rituels : ne plus se laver pendant le camp,
porter les mêmes chaussettes, la même tenue « porte-bonheur », dormir dans le
vestiaire, danser pendant l'entrée, vomir avant chaque combat. **Ce n'est pas de
la magie, c'est du contrôle** : le rituel calme l'excitation et redonne de la
confiance (effet placebo mesurable). Et presque tous ont peur : ceux qui disent
le contraire mentent, selon plusieurs d'entre eux.

## 7.2 Dans le jeu

Chaque combattant a **un rituel**, déduit. Il se lit sur la fiche et dans Micro
Tendu. **Il ne change rien aux combats… sauf quand il est rompu** : un rituel
impossible (short notice, soirée à l'étranger, pesée ratée) est un moment de vie
de poids 10, et certaines voix en parlent (le Superstitieux surtout).

## 7.3 La liste (50)

mange le même plat la veille de chaque combat · porte les mêmes chaussettes
depuis son premier combat · ne se rase plus à partir du début du camp · se rase
la tête le jour de la pesée · appelle sa mère juste avant d'entrer · prie dans
un coin du vestiaire · fait exactement cent pompes à l'échauffement · écoute la
même chanson en boucle, toujours la même depuis ses débuts · change de chanson
d'entrée à chaque combat · touche le grillage trois fois en entrant · entre
toujours du pied gauche · embrasse le tapis avant le premier round · garde une
photo de son enfant dans son sac · garde ses gants d'amateur dans son sac ·
fait bander ses mains par la même personne depuis dix ans · refuse de regarder
son adversaire à la pesée · fixe son adversaire sans cligner à la pesée · dort
une heure dans le vestiaire · vomit avant chaque combat, et dit que c'est bon
signe · ne parle à personne les deux heures d'avant · chante dans les couloirs ·
danse pendant son entrée · lit le même livre pendant tout le camp · regarde des
dessins animés la veille · joue aux cartes avec son coach avant d'entrer ·
porte un bracelet de sa grand-mère au poignet sous les bandages · refuse le
numéro 13 sur tout · jeûne le jour du combat jusqu'à la pesée de contrôle · se
fait couper les cheveux par son petit frère · ne dort pas la veille et dit que
ça le rend méchant · se douche à l'eau glacée juste avant · écrit le nom de son
adversaire sur un papier et le brûle · écrit une lettre à son père mort ·
serre la main de chaque membre de la sécurité · compte les marches jusqu'à la
cage · mâche du chewing-gum jusqu'au dernier moment · met son protège-dents à
l'envers pendant l'échauffement · porte le short de son premier combat
professionnel, recousu dix fois · appelle son ancien prof de sport · mange un
carré de chocolat entre chaque round d'échauffement · salue les quatre coins de
la salle · tape sur l'épaule de l'arbitre en lui souhaitant bonne chance · se
récite un poème · fait une sieste dans la voiture sur le parking · garde un
caillou de son village dans sa chaussure pendant la pesée · s'interdit de
regarder les combats d'avant le sien · regarde tous les combats d'avant le sien ·
rit tout seul pendant l'échauffement · fait l'inventaire de son sac trois fois ·
ne mange que de la nourriture de son pays pendant la semaine du combat

*Plusieurs de ces rituels existent déjà dans `PERSON_TRAITS` (`data-people.js`,
carrière) : ils se réutilisent, ils ne se doublent pas.*

---

# 8. TRAITS CACHÉS

## 8.1 Ce qu'on observe

- **Football Manager** décrit un joueur par **sept attributs cachés** notés de
  1 à 20 : **ambition, controverse, loyauté, pression, professionnalisme, esprit
  sportif, tempérament**. Le joueur ne les voit jamais : il voit **un mot**
  (« Professionnel », « Tempérament fragile », « Ambitieux ») et des
  comportements. Le **professionnalisme** pèse le plus : progression, soin du
  corps, longévité.
- En psychologie, le **trait de conscience** (discipline, persévérance,
  organisation) est celui qui prédit le mieux la réussite des sportifs de haut
  niveau ; les combattants y sont hauts.
- **Crusader Kings 3** : agir **contre sa personnalité** génère du stress ; le
  stress accumulé produit une crise, et le personnage **développe une façon d'y
  faire face** (un vice ou une vertu). Le même acte stresse l'un et apaise
  l'autre.
- **Pound for Pound** (simulateur de promotion MMA, 2026, 96 % d'avis
  positifs) : les combattants ont une personnalité et une mémoire, **une
  relation avec l'organisation qui se construit**, et ils demandent : ceinture,
  revanche, soirée à domicile, place en carte principale, augmentation, départ.
  Un combattant bien traité accepte plus volontiers un combat risqué.

## 8.2 Les sept traits du jeu

Déduits de l'identifiant, **jamais affichés en chiffre**. Ils colorent la voix,
les décisions et la forme :

| Trait | Ce qu'il change |
|---|---|
| **Discipline** | Soin du corps, coupe de poids, longévité ; un indiscipliné rate plus de pesées |
| **Ambition** | Refuse les combats qui ne font pas monter ; demande plus vite une ceinture |
| **Loyauté** | Reste chez Split malgré une offre ; en veut plus longtemps à un joueur qui l'a trahi |
| **Sang-froid** | Tenue sous la pression : carte principale, combat de titre, public hostile |
| **Tempérament** | Réaction à la provocation, à l'injustice, à une défaite contestée |
| **Exposition** | Goût des micros et des réseaux ; nourrit la presse |
| **Fair-play** | Respect de l'adversaire, des règles, des arbitres |

**Ce que le joueur voit** : **un mot** (Professionnel, Instable, Fidèle,
Carriériste, Discret, Grande gueule, Réglo…) et **des comportements** relayés
par la presse et les voix. Jamais un chiffre.

**Le stress (Crusader Kings) branché sur la charge (§6).** Certaines décisions du
joueur pèsent sur un combattant selon ses traits : booker un loyal contre son
ami, envoyer un sang-froid faible en combat de titre, forcer un combattant à
combattre pendant son jeûne, refuser trois fois sa demande. **Chaque décision
contraire devient un moment de vie** (poids 10 à 30). Le même geste ne pèse rien
sur un autre.

**Les demandes et les promesses (Pound for Pound, Football Manager).** Un
combattant demande : un classé, une revanche, une soirée dans sa ville, la carte
principale, une augmentation, partir. Le joueur peut **promettre**. **Une promesse
tenue renforce la loyauté ; une promesse rompue est un fait, et il ne l'oublie
pas.** Trop de promesses à la fois deviennent impossibles à tenir : c'est voulu.

---

# 9. RÔLES — UN MOT POUR LIRE UN COMBATTANT

## 9.1 Ce qu'on observe

Le milieu du combat classe les gens en quelques mots : **le prospect**, qu'on
protège ; **le journeyman**, solide, qui sert de test aux prospects et accepte
les remplacements de dernière minute ; **le gatekeeper**, ancien classé qui
n'ira plus au titre mais reste la porte de l'élite ; **le faire-valoir**, qu'on
met en face d'un prospect pour gonfler son bilan ; **le contender** ; **le
champion**.

## 9.2 Dans le jeu

Un mot, **déduit** de son âge, son bilan, son rang, sa série et sa tendance. Il
s'affiche à côté de son nom partout. **C'est l'outil principal contre le
trop-plein** : avec cent quarante combattants, le joueur lit le vestiaire en
mots, pas en fiches.

| Rôle | Déduit de |
|---|---|
| **Espoir** | Moins de 25 ans, moins de 6 combats pros |
| **Invaincu** | Aucune défaite, au moins 5 victoires |
| **Journeyman** | Plus de 15 combats, bilan proche de l'équilibre, hors top 15 |
| **Gatekeeper** | Ancien top 15, plus de 30 ans, a battu et perdu contre des classés |
| **Contender** | Top 5 de sa catégorie |
| **Champion** | Ceinture en cours (lot 5 T1) |
| **Ancien champion** | A tenu une ceinture |
| **Vétéran** | Plus de 34 ans ou plus de 30 combats |
| **Remplaçant de luxe** | A accepté au moins deux combats à court préavis |
| **Bête noire** | A battu deux combattants classés au-dessus de lui |
| **En perdition** | Trois défaites de suite |
| **Revenant** | Revenu après plus d'un an d'absence |

---

# 10. TRAJECTOIRES — JAMAIS DEUX CARRIÈRES PAREILLES

## 10.1 Ce qu'on observe

- **La carrière moyenne à l'UFC tient en moins de quatre combats** ; en tenir
  plus de cinq de suite, c'est déjà rare.
- **1,7 combat par an** en moyenne ; les bas de carte jusqu'à cinq, les classés
  une ou deux fois.
- **L'âge** : sur 2 229 combats, les vainqueurs ont en moyenne 29,8 ans et les
  perdants 30,7 ans. **Aucune étude ne donne d'âge de déclin universel** ; les
  lourds durent plus, parce que la puissance vieillit mieux que la vitesse.
- **RimWorld** : les histoires naissent de **personnages fixés** (passé, traits
  qu'on ne change pas) qui traversent **des événements qui se chevauchent** ; le
  conteur relâche la pression quand tout va mal, pour laisser l'histoire se
  dérouler au lieu de la couper.
- **Le système Nemesis** (Shadow of Mordor) : **l'ennemi se souvient** — de
  t'avoir battu, d'avoir fui, d'avoir été humilié — et revient changé. Il est
  inspiré… des jeux de sport, où l'échec ne remet pas l'histoire à zéro.

## 10.2 La trajectoire

**Chaque combattant reçoit une trajectoire**, déduite, qui **module** les
paramètres existants (potentiel, âge du pic, vitesse du déclin — lot 2B T2 bis)
**sans créer une seconde loi de vieillissement** : elle choisit où il se place
dans la loi qui existe.

| Trajectoire | Forme |
|---|---|
| **Météore** | Monte très vite, pic court, chute brutale |
| **Bâtisseur** | Lent, régulier, pic tardif et long |
| **Éternel espoir** | Beaucoup de potentiel, ne décolle jamais tout à fait |
| **Gatekeeper heureux** | Plafonne tôt, reste dangereux dix ans |
| **Éclosion tardive** | Médiocre jusqu'à 28 ans, puis tout change (souvent un changement de camp) |
| **Brisé** | Une blessure ou un KO coupe la courbe en deux |
| **Voyageur** | Change souvent d'organisation, de camp, de catégorie |
| **Vieux lion** | Long pic, déclin lent, un dernier sursaut |
| **Prodige éteint** | Pic très jeune, puis plus rien, sans raison apparente |
| **Double vie** | Garde un métier ; progresse lentement, dure longtemps |
| **Rédemption** | Chute (prison, alcool, blessure), puis retour |
| **Fidèle** | Toute sa carrière chez Split (dépend aussi du joueur) |
| **Mercenaire** | Va toujours au plus offrant |
| **Changement de poids** | Sa vraie carrière commence dans une autre catégorie |
| **Un seul soir** | Une victoire immense, puis une carrière ordinaire |

**Pourquoi deux carrières ne se ressemblent jamais.** Une carrière est la
combinaison : trajectoire (15) × voix (48) × style tiré de son pays et de sa
ville (8, pondérés sur 30 pays et 250 villes) × métier (150) × milieu (22) ×
traits (7 × 20) × **moments de vie tirés chaque cycle** (109) × **les choix du
joueur**. Même à trajectoire, voix et style égaux, les moments de vie et les
adversaires rendus différents font diverger les carrières dès le premier camp.

**La mémoire (Nemesis).** Un combattant se souvient **de qui l'a battu, comment,
et de qui a booké ce combat**. Une défaite humiliante crée un rival ; une
revanche due est un fait. Il revient **changé** : un nouveau camp, un nouveau
surnom (§3.5), une nouvelle voix parfois (§4 des voix).

---

## Sources

**Effectifs, activité, carrières.** John Morgan (X), effectifs de l'UFC par
catégorie, février 2025 · Home of Fight (X), pays au top 15 · Wikipedia, *List
of current UFC fighters* · FightAlpha, MMA Channel, fréquence des combats ·
Yahoo Sports, *The anatomy of an above-average UFC career* · AgentMMA, âge du
pic par catégorie · Gambling.com, format des Fight Night (12 combats).

**Écoles de combat.** MiddleEasy et Wikipedia, la lutte au Daghestan ·
Skillset Mag, *Combat sports by country* · ESPN, le Mexique et Tijuana ·
Lockerroom, Tapology, Kazakhstan et Kirghizistan · ESPN, légalisation en
France en 2020 · LowKick MMA, la savate.

**Surnoms.** mmanicknames.com, tendances sur 2 500 surnoms · ESPN, *The UFC's
best nicknames* · MixedMartialArts.com, *100 fighter nickname origins* · Evolve
Daily, noms des combattants de muay-thaï.

**Métiers et argent.** TheSportster, BJJEE, anciens métiers · Fight Matrix,
Ringside Report, bourses de l'UFC.

**Psychologie et santé.** Wikipedia, échelle de Holmes et Rahe · Andersen et
Williams (1988), modèle stress-blessure, et revue ScienceDirect · Bloody Elbow,
taux de blessure des camps · PubMed, retour après blessure · PMC, *Getting small
to feel big: the psychology of weight cutting* · Yahoo Sports, *The truth about
post-fight depression* · Taylor & Francis et Frontiers, retraite des sportifs ·
BMC Psychology et PMC, personnalité des combattants · ESPN et Arab News, le
jeûne et les combattants · TheSportster, Title Boxing, rituels · ESPN, la peur
avant le combat.

**Game design.** FM Scout, personnalités de Football Manager · Sports
Interactive, manuel de FM24 (interface, bouton Continuer, recrutement) ·
sortitoutsi, promesses dans FM · Steam, *Pound for Pound: MMA Promotion
Simulator* · Game Developer, RimWorld et Dwarf Fortress · Game Developer,
*Designing Shadow of Mordor's Nemesis system* · PC Gamer, le stress dans
Crusader Kings 3 · Wikipedia, nombre de Dunbar.
