"use strict";
/* CAGE LEGACY — mgmt-humanite-data.js
   ============================================================================
   LOT 5 H1 (docs/LOT-5-UN-MONDE-HUMANITE.md §7 H1 in docs/LOT-5-UN-MONDE-HUMAIN.md)
   — les données de l'humanité, recopiées de docs/CATALOGUE-HUMANITE.md
   sans rien inventer ni reformuler. DONNÉES PURES : aucune fonction, aucun
   accès DOM, aucune dépendance (chargeable juste après mgmt-data.js, avant
   toute logique ; mgmt-bureau.js et le reste n'en dépendent pas encore).

   Chaque texte écrit (surnom, métier, milieu, libellé de moment, rituel,
   rôle, trajectoire) porte `relu:false` : ce sont des PROPOSITIONS de Claude
   (décision d'Anthony du 30/09, LOT-5 §0 item 4 et 7) qu'Anthony relira
   plus tard — quand il relit, il remplace le texte et passe la marque à
   `relu:true`, aucun code ne change. Les villes et les poids n'en portent
   pas : ce sont des données de calibrage, pas des textes.

   Les trente pays du catalogue existent dans COUNTRIES (engine.js) depuis
   H2 (seize nouveaux pays, décision du 30/09).
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT5_H1_DONNEES] — Lot 5 H1 les données de l'humanité
   (villes, styles par origine, surnoms, métiers, milieux, moments de vie,
   rituels, rôles, trajectoires). Recopie littérale du catalogue. ==== */

/* ---- §1.3 Les villes (une par combattant, tirée dans son pays ; poids
   égaux sauf ville-école, double §2.2). Pays réels, villes réelles ; rien
   d'autre. Les trente codes du catalogue sont portés par COUNTRIES
   (engine.js) depuis H2 (seize nouveaux pays, décision du 30/09). ==== */
const MGMT_VILLES = {
  FR: ['Paris', 'Saint-Denis', 'Aubervilliers', 'Marseille', 'Lyon', 'Villeurbanne', 'Lille', 'Roubaix', 'Toulouse', 'Bordeaux', 'Nice', 'Montpellier', 'Nantes', 'Strasbourg', 'Rennes', 'Grenoble', 'Saint-Étienne', 'Le Havre', 'Reims', 'Perpignan', 'Bayonne', 'Mulhouse', 'Limoges', 'Metz', 'Saint-Denis de La Réunion', 'Pointe-à-Pitre', 'Fort-de-France', 'Cayenne', 'Nouméa'],
  BR: ['Rio de Janeiro', 'São Paulo', 'Curitiba', 'Belo Horizonte', 'Manaus', 'Salvador', 'Recife', 'Natal', 'Fortaleza', 'Porto Alegre', 'Belém', 'Goiânia'],
  US: ['Albuquerque', 'Las Vegas', 'San Diego', 'Sacramento', 'Stockton', 'Denver', 'Phoenix', 'Houston', 'Chicago', 'Philadelphie', 'Newark', 'Miami', 'Atlanta', 'Des Moines', 'Oklahoma City', 'Coconut Creek', 'Milwaukee', 'Portland', 'Boston', 'Seattle'],
  GB: ['Londres', 'Liverpool', 'Manchester', 'Birmingham', 'Glasgow', 'Édimbourg', 'Cardiff', 'Newcastle', 'Nottingham', 'Leeds', 'Sheffield', 'Belfast'],
  RU: ['Moscou', 'Saint-Pétersbourg', 'Ekaterinbourg', 'Kazan', 'Novossibirsk', 'Krasnodar', 'Oufa', 'Tcheliabinsk', 'Iakoutsk', 'Grozny'],
  DAG: ['Makhatchkala', 'Khassaviourt', 'Kizliar', 'Derbent', 'Bouïnaksk', 'Kaspiisk'],
  GE: ['Tbilissi', 'Batoumi', 'Koutaïssi', 'Roustavi', 'Zougdidi', 'Gori'],
  CM: ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Limbé', 'Kribi'],
  NG: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano', 'Benin City', 'Enugu'],
  IE: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda'],
  MX: ['Tijuana', 'Mexico', 'Guadalajara', 'Monterrey', 'Hermosillo', 'Ciudad Juárez', 'Puebla', 'Mexicali'],
  JP: ['Tokyo', 'Osaka', 'Yokohama', 'Sapporo', 'Fukuoka', 'Nagoya', 'Kobe', 'Okinawa'],
  KR: ['Séoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Jeju'],
  TH: ['Bangkok', 'Chiang Mai', 'Phuket', 'Buriram', 'Khon Kaen', 'Nakhon Ratchasima', 'Pattaya', 'Surin'],
  BE: ['Bruxelles', 'Liège', 'Charleroi', 'Anvers', 'Gand', 'Namur'],
  CH: ['Genève', 'Lausanne', 'Zurich', 'Bâle', 'Berne'],
  MA: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir'],
  DZ: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif'],
  SN: ['Dakar', 'Thiès', 'Saint-Louis', 'Rufisque', 'Ziguinchor'],
  PL: ['Varsovie', 'Cracovie', 'Gdańsk', 'Wrocław', 'Łódź', 'Poznań'],
  NL: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Breda'],
  ES: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao', 'Tenerife'],
  IT: ['Rome', 'Milan', 'Naples', 'Turin', 'Bari', 'Palerme'],
  DE: ['Berlin', 'Hambourg', 'Cologne', 'Munich', 'Francfort', 'Düsseldorf'],
  SE: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
  KZ: ['Almaty', 'Astana', 'Chymkent', 'Karaganda'],
  KG: ['Bichkek', 'Och', 'Djalal-Abad', 'Karakol'],
  CN: ['Pékin', 'Shanghai', 'Chengdu', 'Kunming', 'Guangzhou', 'Harbin'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adélaïde', 'Gold Coast'],
  CA: ['Montréal', 'Toronto', 'Vancouver', 'Calgary', 'Winnipeg', 'Québec'],
};

/* Villes-écoles (§1.3) : certaines villes pèsent plus parce qu'une tradition
   y fabrique des combattants — poids doublé (le mécanisme appliquera ce lien
   ; ici seule la liste existe, sans doublon avec MGMT_VILLES). */
const MGMT_VILLES_ECOLES = [
  'Rio de Janeiro', 'Curitiba', 'Albuquerque', 'Tijuana', 'Makhatchkala', 'Khassaviourt', 'Bangkok', 'Buriram', 'Dublin', 'Amsterdam', 'Tbilissi', 'Paris', 'Marseille', 'Liverpool',
];

/* ---- §2.2 Le style vient du pays et de la ville. Clés = codes pays ;
   valeurs = poids sur les huit styles de STYLES (engine.js), dans l'ordre
   de la colonne du catalogue : Boxe, Kick, Muay, Karaté, Lutte, JJB, Sambo,
   MMA — chaque ligne fait 100. Le moteur n'est pas modifié : seul le choix
   du style passé à makeFighter changera (option opt.style, H3). ==== */
const MGMT_STYLE_PAYS = {
  FR: { boxer: 18, kickboxer: 22, muayThai: 10, karate: 6, wrestler: 6, bjj: 12, sambo: 2, mma: 24 },
  BR: { boxer: 6, kickboxer: 6, muayThai: 18, karate: 4, wrestler: 4, bjj: 36, sambo: 0, mma: 26 },
  US: { boxer: 14, kickboxer: 8, muayThai: 4, karate: 4, wrestler: 34, bjj: 10, sambo: 0, mma: 26 },
  GB: { boxer: 24, kickboxer: 18, muayThai: 14, karate: 4, wrestler: 6, bjj: 12, sambo: 0, mma: 22 },
  RU: { boxer: 16, kickboxer: 10, muayThai: 4, karate: 4, wrestler: 16, bjj: 2, sambo: 30, mma: 18 },
  DAG: { boxer: 4, kickboxer: 2, muayThai: 0, karate: 2, wrestler: 44, bjj: 2, sambo: 30, mma: 16 },
  GE: { boxer: 8, kickboxer: 4, muayThai: 2, karate: 2, wrestler: 42, bjj: 4, sambo: 20, mma: 18 },
  CM: { boxer: 26, kickboxer: 12, muayThai: 4, karate: 4, wrestler: 20, bjj: 4, sambo: 0, mma: 30 },
  NG: { boxer: 24, kickboxer: 8, muayThai: 4, karate: 2, wrestler: 34, bjj: 2, sambo: 0, mma: 26 },
  IE: { boxer: 40, kickboxer: 8, muayThai: 4, karate: 6, wrestler: 4, bjj: 14, sambo: 0, mma: 24 },
  MX: { boxer: 44, kickboxer: 6, muayThai: 8, karate: 2, wrestler: 8, bjj: 10, sambo: 0, mma: 22 },
  JP: { boxer: 10, kickboxer: 12, muayThai: 4, karate: 22, wrestler: 10, bjj: 16, sambo: 0, mma: 26 },
  KR: { boxer: 10, kickboxer: 22, muayThai: 4, karate: 6, wrestler: 12, bjj: 10, sambo: 0, mma: 36 },
  TH: { boxer: 6, kickboxer: 8, muayThai: 70, karate: 0, wrestler: 2, bjj: 4, sambo: 0, mma: 10 },
  BE: { boxer: 16, kickboxer: 26, muayThai: 14, karate: 6, wrestler: 6, bjj: 10, sambo: 2, mma: 20 },
  CH: { boxer: 14, kickboxer: 22, muayThai: 10, karate: 8, wrestler: 8, bjj: 14, sambo: 0, mma: 24 },
  MA: { boxer: 24, kickboxer: 30, muayThai: 10, karate: 4, wrestler: 6, bjj: 6, sambo: 0, mma: 20 },
  DZ: { boxer: 30, kickboxer: 22, muayThai: 8, karate: 6, wrestler: 10, bjj: 4, sambo: 0, mma: 20 },
  SN: { boxer: 18, kickboxer: 8, muayThai: 4, karate: 2, wrestler: 40, bjj: 2, sambo: 0, mma: 26 },
  PL: { boxer: 16, kickboxer: 14, muayThai: 6, karate: 4, wrestler: 18, bjj: 12, sambo: 4, mma: 26 },
  NL: { boxer: 10, kickboxer: 44, muayThai: 14, karate: 4, wrestler: 4, bjj: 6, sambo: 0, mma: 18 },
  ES: { boxer: 18, kickboxer: 20, muayThai: 10, karate: 8, wrestler: 8, bjj: 12, sambo: 0, mma: 24 },
  IT: { boxer: 20, kickboxer: 20, muayThai: 12, karate: 6, wrestler: 6, bjj: 12, sambo: 0, mma: 24 },
  DE: { boxer: 18, kickboxer: 22, muayThai: 10, karate: 6, wrestler: 10, bjj: 10, sambo: 0, mma: 24 },
  SE: { boxer: 16, kickboxer: 18, muayThai: 10, karate: 4, wrestler: 10, bjj: 16, sambo: 0, mma: 26 },
  KZ: { boxer: 18, kickboxer: 6, muayThai: 2, karate: 2, wrestler: 34, bjj: 2, sambo: 20, mma: 16 },
  KG: { boxer: 16, kickboxer: 6, muayThai: 2, karate: 2, wrestler: 36, bjj: 2, sambo: 22, mma: 14 },
  CN: { boxer: 14, kickboxer: 20, muayThai: 8, karate: 10, wrestler: 16, bjj: 4, sambo: 0, mma: 28 },
  AU: { boxer: 22, kickboxer: 16, muayThai: 12, karate: 4, wrestler: 8, bjj: 14, sambo: 0, mma: 24 },
  CA: { boxer: 14, kickboxer: 10, muayThai: 8, karate: 6, wrestler: 22, bjj: 14, sambo: 0, mma: 26 },
};

/* Décalages de ville (§2.2) : points ajoutés avant de ramener le total à 100.
   Un seul objet par ville ; `styles` additionne sur les clés de STYLES.
   Les villes listées existent toutes dans MGMT_VILLES (test de forme). ==== */
const MGMT_STYLE_VILLE = {
  'Rio de Janeiro': { styles: { bjj: 15 } },
  Manaus: { styles: { bjj: 15 } },
  Curitiba: { styles: { muayThai: 20 } },
  Albuquerque: { styles: { mma: 15 } },
  'Des Moines': { styles: { wrestler: 15 } },
  'Oklahoma City': { styles: { wrestler: 15 } },
  Philadelphie: { styles: { boxer: 12 } },
  Newark: { styles: { boxer: 12 } },
  Stockton: { styles: { boxer: 8, bjj: 8 } },
  Tijuana: { styles: { boxer: 12 } },
  Hermosillo: { styles: { boxer: 12 } },
  Makhatchkala: { styles: { wrestler: 12 } },
  Khassaviourt: { styles: { wrestler: 12 } },
  Grozny: { styles: { wrestler: 8, boxer: 6 } },
  Ekaterinbourg: { styles: { boxer: 12 } },
  Iakoutsk: { styles: { wrestler: 12 } },
  Tbilissi: { styles: { wrestler: 10 } },
  Gori: { styles: { wrestler: 10 } },
  Bangkok: { styles: { muayThai: 10 } },
  Buriram: { styles: { muayThai: 10 } },
  Surin: { styles: { muayThai: 10 } },
  Amsterdam: { styles: { kickboxer: 12 } },
  Rotterdam: { styles: { kickboxer: 12 } },
  Dublin: { styles: { boxer: 8, mma: 8 } },
  Liverpool: { styles: { bjj: 8, mma: 6 } },
  Paris: { styles: { kickboxer: 8, boxer: 6 } },
  'Saint-Denis': { styles: { kickboxer: 8, boxer: 6 } },
  Aubervilliers: { styles: { kickboxer: 8, boxer: 6 } },
  Marseille: { styles: { boxer: 10 } },
  Montpellier: { styles: { bjj: 10 } },
  Okinawa: { styles: { karate: 15 } },
  Osaka: { styles: { karate: 6, boxer: 6 } },
  Dakar: { styles: { wrestler: 10 } },
  Thiès: { styles: { wrestler: 10 } },
  Casablanca: { styles: { kickboxer: 10 } },
  Almaty: { styles: { wrestler: 8, boxer: 6 } },
  Bichkek: { styles: { wrestler: 8, boxer: 6 } },
  Montréal: { styles: { mma: 10 } },
};

/* ---- §3.3 La banque de surnoms, par langue puis par thème. 79 % des
   surnoms réels sont en anglais : la langue suit le pays. Aucun surnom ne
   vise une origine, aucun surnom de combattant réel célèbre (règles §3.2).
   Chaque entrée {texte, relu} est une proposition d'écriture : relu:false
   tant qu'Anthony ne l'a pas relue, relu:true quand il l'a validée. ==== */
const MGMT_SURNOMS = {
  fr: {
    personnalite: [{ texte: 'Sang-Froid', relu: false }, { texte: 'Le Doux', relu: false }, { texte: 'Sale-Gosse', relu: false }, { texte: 'La Teigne', relu: false }, { texte: 'Tête-Brûlée', relu: false }, { texte: 'Casse-Cou', relu: false }, { texte: 'Trompe-la-Mort', relu: false }, { texte: 'Cœur-de-Pierre', relu: false }, { texte: 'Le Sphinx', relu: false }, { texte: 'Gueule-d\'Ange', relu: false }, { texte: 'Le Môme', relu: false }, { texte: 'Sans-Sommeil', relu: false }, { texte: 'Le Taiseux', relu: false }, { texte: 'Petit-Prince', relu: false }, { texte: 'Tête-de-Mule', relu: false }, { texte: 'Le Grand Calme', relu: false }, { texte: 'Mauvais-Œil', relu: false }, { texte: 'Le Sourire', relu: false }, { texte: 'Pas-de-Chance', relu: false }, { texte: 'L\'Insolent', relu: false }],
    metiers: [{ texte: 'Le Notaire', relu: false }, { texte: 'L\'Horloger', relu: false }, { texte: 'Le Couvreur', relu: false }, { texte: 'Le Plombier', relu: false }, { texte: 'Le Rémouleur', relu: false }, { texte: 'Le Facteur', relu: false }, { texte: 'Le Maçon', relu: false }, { texte: 'L\'Instit\'', relu: false }, { texte: 'Le Docteur', relu: false }, { texte: 'Le Bûcheron', relu: false }, { texte: 'Le Boulanger', relu: false }, { texte: 'Le Ferrailleur', relu: false }, { texte: 'Le Carreleur', relu: false }, { texte: 'Le Grutier', relu: false }, { texte: 'Le Videur', relu: false }, { texte: 'Le Pompier', relu: false }, { texte: 'Le Livreur', relu: false }, { texte: 'L\'Huissier', relu: false }, { texte: 'Le Menuisier', relu: false }, { texte: 'Le Chaudronnier', relu: false }],
    animaux: [{ texte: 'La Mangouste', relu: false }, { texte: 'Le Frelon', relu: false }, { texte: 'Le Sanglier', relu: false }, { texte: 'La Belette', relu: false }, { texte: 'L\'Ours', relu: false }, { texte: 'Le Chat', relu: false }, { texte: 'La Guêpe', relu: false }, { texte: 'Moustique', relu: false }, { texte: 'P\'tit Loup', relu: false }, { texte: 'Grand-Duc', relu: false }, { texte: 'Le Blaireau', relu: false }, { texte: 'La Murène', relu: false }, { texte: 'Le Taureau', relu: false }, { texte: 'L\'Orque', relu: false }, { texte: 'Le Bouc', relu: false }, { texte: 'La Fouine', relu: false }, { texte: 'Le Coq', relu: false }, { texte: 'La Vipère', relu: false }, { texte: 'Le Chacal', relu: false }, { texte: 'Le Corbeau', relu: false }],
    armes: [{ texte: 'L\'Enclume', relu: false }, { texte: 'Casse-Noix', relu: false }, { texte: 'Brise-Os', relu: false }, { texte: 'Brise-Glace', relu: false }, { texte: 'La Tenaille', relu: false }, { texte: 'La Gâchette', relu: false }, { texte: 'La Fronde', relu: false }, { texte: 'L\'Aiguille', relu: false }, { texte: 'Main-Froide', relu: false }, { texte: 'Bras-de-Fer', relu: false }, { texte: 'Fil-de-Fer', relu: false }, { texte: 'Tête-de-Bois', relu: false }, { texte: 'Vieux-Bois', relu: false }, { texte: 'L\'Ardoise', relu: false }, { texte: 'Le Roc', relu: false }, { texte: 'La Grêle', relu: false }, { texte: 'L\'Orage', relu: false }, { texte: 'La Marée', relu: false }, { texte: 'Coup-de-Grisou', relu: false }, { texte: 'Pique-Feu', relu: false }],
    droles: [{ texte: 'Tonneau', relu: false }, { texte: 'Quart-d\'Heure', relu: false }, { texte: 'Bout-d\'Allumette', relu: false }, { texte: 'Poids-Plume', relu: false }, { texte: 'Mille-Pattes', relu: false }, { texte: 'Pas-de-Loup', relu: false }, { texte: 'La Rature', relu: false }, { texte: 'Double-Six', relu: false }, { texte: 'Le Cierge', relu: false }, { texte: 'Petit-Hiver', relu: false }, { texte: 'Le Vieux', relu: false }, { texte: 'Deux-Temps', relu: false }, { texte: 'Chaussette', relu: false }, { texte: 'Gros-Câlin', relu: false }, { texte: 'La Sieste', relu: false }],
  },
  en: {
    general: [{ texte: 'The Anvil', relu: false }, { texte: 'Nightshift', relu: false }, { texte: 'The Locksmith', relu: false }, { texte: 'The Mailman', relu: false }, { texte: 'Slow Burn', relu: false }, { texte: 'Deadbolt', relu: false }, { texte: 'Brickhouse', relu: false }, { texte: 'The Plumber', relu: false }, { texte: 'Two-Shift', relu: false }, { texte: 'Rusty', relu: false }, { texte: 'The Preacher', relu: false }, { texte: 'The Bulldozer', relu: false }, { texte: 'The Mechanic', relu: false }, { texte: 'Sunday Punch', relu: false }, { texte: 'Last Call', relu: false }, { texte: 'The Landlord', relu: false }, { texte: 'Foghorn', relu: false }, { texte: 'The Ferryman', relu: false }, { texte: 'Stonewall', relu: false }, { texte: 'Coldwater', relu: false }, { texte: 'The Grinder', relu: false }, { texte: 'Scrap Iron', relu: false }, { texte: 'Buzzsaw', relu: false }, { texte: 'The Tax Man', relu: false }, { texte: 'Knuckles', relu: false }, { texte: 'Tiny', relu: false }, { texte: 'Heartbreaker', relu: false }, { texte: 'Night Train', relu: false }, { texte: 'Blue Collar', relu: false }, { texte: 'The Bishop', relu: false }, { texte: 'Cornerstone', relu: false }, { texte: 'Riptide', relu: false }, { texte: 'Short Fuse', relu: false }, { texte: 'Wildfire', relu: false }, { texte: 'The Weatherman', relu: false }, { texte: 'Sandbag', relu: false }, { texte: 'Kid Lightning', relu: false }, { texte: 'The Hammer', relu: false }, { texte: 'The Beast', relu: false }, { texte: 'The Machine', relu: false }],
  },
  pt: {
    general: [{ texte: 'Tijolo', relu: false }, { texte: 'Marreta', relu: false }, { texte: 'Furacão', relu: false }, { texte: 'Tatu', relu: false }, { texte: 'Formiga', relu: false }, { texte: 'Gato Preto', relu: false }, { texte: 'Trovão', relu: false }, { texte: 'Cachorro Louco', relu: false }, { texte: 'Pé-de-Chumbo', relu: false }, { texte: 'Sombra', relu: false }, { texte: 'Carrapato', relu: false }, { texte: 'Bate-Estaca', relu: false }, { texte: 'Sucuri', relu: false }, { texte: 'Relâmpago', relu: false }, { texte: 'Vovô', relu: false }, { texte: 'Moleque', relu: false }, { texte: 'Cabeça-Dura', relu: false }, { texte: 'Peixe', relu: false }, { texte: 'Pesadelo', relu: false }, { texte: 'Pedreiro', relu: false }, { texte: 'Leão da Favela', relu: false }, { texte: 'Coração Valente', relu: false }, { texte: 'Boca de Ferro', relu: false }, { texte: 'Tubarão', relu: false }, { texte: 'Mão Pesada', relu: false }],
  },
  es: {
    general: [{ texte: 'El Martillo', relu: false }, { texte: 'La Mula', relu: false }, { texte: 'El Alacrán', relu: false }, { texte: 'El Tlacuache', relu: false }, { texte: 'El Relámpago', relu: false }, { texte: 'La Tormenta', relu: false }, { texte: 'El Gallo', relu: false }, { texte: 'El Chato', relu: false }, { texte: 'El Güero', relu: false }, { texte: 'El Flaco', relu: false }, { texte: 'El Chamaco', relu: false }, { texte: 'Manos de Hierro', relu: false }, { texte: 'El Diablito', relu: false }, { texte: 'El Cuervo', relu: false }, { texte: 'El Profe', relu: false }, { texte: 'El Panadero', relu: false }, { texte: 'El Cometa', relu: false }, { texte: 'Sin Miedo', relu: false }, { texte: 'El Terco', relu: false }, { texte: 'El Albañil', relu: false }],
  },
  ja: {
    general: [{ texte: 'Kaminari', relu: false }, { texte: 'Tetsu', relu: false }, { texte: 'Kuma', relu: false }, { texte: 'Kaze', relu: false }, { texte: 'Tora', relu: false }, { texte: 'Kitsune', relu: false }, { texte: 'Yamaotoko', relu: false }, { texte: 'Hagane', relu: false }, { texte: 'Namazu', relu: false }, { texte: 'Oni', relu: false }, { texte: 'Kawauso', relu: false }, { texte: 'Hibana', relu: false }],
  },
  ru: {
    general: [{ texte: 'Medved', relu: false }, { texte: 'Molot', relu: false }, { texte: 'Kuvalda', relu: false }, { texte: 'Volk', relu: false }, { texte: 'Tank', relu: false }, { texte: 'Kamen', relu: false }, { texte: 'Burya', relu: false }, { texte: 'Sokol', relu: false }, { texte: 'Gorets', relu: false }, { texte: 'Batyr', relu: false }],
  },
  ko: {
    general: [{ texte: 'The Korean Bulldozer', relu: false }, { texte: 'The Korean Wolf', relu: false }, { texte: 'The Korean Mailman', relu: false }, { texte: 'The Seoul Train', relu: false }],
  },
  ge: {
    general: [{ texte: 'The Georgian Bull', relu: false }, { texte: 'Lomi', relu: false }],
  },
  pl: {
    general: [{ texte: 'Mlot', relu: false }, { texte: 'Wilk', relu: false }],
  },
};

/* ---- §4.3 La liste des anciens métiers (150), par famille. ==== */
const MGMT_METIERS = {
  'Bâtiment et travaux': [{ texte: 'maçon', relu: false }, { texte: 'couvreur', relu: false }, { texte: 'électricien', relu: false }, { texte: 'plombier', relu: false }, { texte: 'carreleur', relu: false }, { texte: 'plaquiste', relu: false }, { texte: 'peintre en bâtiment', relu: false }, { texte: 'charpentier', relu: false }, { texte: 'menuisier', relu: false }, { texte: 'grutier', relu: false }, { texte: 'conducteur d\'engins', relu: false }, { texte: 'soudeur', relu: false }, { texte: 'chaudronnier', relu: false }, { texte: 'ferrailleur', relu: false }, { texte: 'échafaudeur', relu: false }, { texte: 'cordiste', relu: false }, { texte: 'paysagiste', relu: false }, { texte: 'élagueur', relu: false }, { texte: 'démolisseur', relu: false }, { texte: 'étancheur', relu: false }],
  'Industrie et logistique': [{ texte: 'ouvrier en usine', relu: false }, { texte: 'cariste', relu: false }, { texte: 'préparateur de commandes', relu: false }, { texte: 'docker', relu: false }, { texte: 'déménageur', relu: false }, { texte: 'manutentionnaire', relu: false }, { texte: 'mécanicien auto', relu: false }, { texte: 'carrossier', relu: false }, { texte: 'mécanicien poids lourds', relu: false }, { texte: 'chaudronnier naval', relu: false }, { texte: 'ouvrier agricole', relu: false }, { texte: 'agent de tri postal', relu: false }, { texte: 'ouvrier en abattoir', relu: false }, { texte: 'opérateur de ligne', relu: false }, { texte: 'magasinier', relu: false }],
  Transport: [{ texte: 'livreur à scooter', relu: false }, { texte: 'coursier à vélo', relu: false }, { texte: 'chauffeur routier', relu: false }, { texte: 'chauffeur de bus', relu: false }, { texte: 'chauffeur VTC', relu: false }, { texte: 'taxi', relu: false }, { texte: 'ambulancier', relu: false }, { texte: 'convoyeur de fonds', relu: false }, { texte: 'marin pêcheur', relu: false }, { texte: 'matelot de commerce', relu: false }],
  'Sécurité et uniformes': [{ texte: 'videur', relu: false }, { texte: 'agent de sécurité', relu: false }, { texte: 'maître-chien', relu: false }, { texte: 'pompier professionnel', relu: false }, { texte: 'pompier volontaire', relu: false }, { texte: 'militaire du rang', relu: false }, { texte: 'parachutiste', relu: false }, { texte: 'commando', relu: false }, { texte: 'gendarme', relu: false }, { texte: 'policier municipal', relu: false }, { texte: 'gardien de prison', relu: false }, { texte: 'garde du corps', relu: false }, { texte: 'sauveteur en mer', relu: false }, { texte: 'surveillant de baignade', relu: false }],
  'Santé et soin': [{ texte: 'aide-soignant', relu: false }, { texte: 'infirmier', relu: false }, { texte: 'kinésithérapeute', relu: false }, { texte: 'brancardier', relu: false }, { texte: 'ostéopathe', relu: false }, { texte: 'étudiant en médecine', relu: false }, { texte: 'préparateur en pharmacie', relu: false }, { texte: 'auxiliaire de vie', relu: false }, { texte: 'masseur', relu: false }, { texte: 'éducateur spécialisé', relu: false }],
  'Éducation et sport': [{ texte: 'professeur d\'EPS', relu: false }, { texte: 'professeur de maths', relu: false }, { texte: 'professeur d\'histoire', relu: false }, { texte: 'instituteur', relu: false }, { texte: 'surveillant de collège', relu: false }, { texte: 'animateur de centre de loisirs', relu: false }, { texte: 'éducateur sportif', relu: false }, { texte: 'coach de fitness', relu: false }, { texte: 'maître-nageur', relu: false }, { texte: 'entraîneur de foot des petits', relu: false }],
  'Commerce, hôtellerie, bouche': [{ texte: 'serveur', relu: false }, { texte: 'barman', relu: false }, { texte: 'plongeur', relu: false }, { texte: 'cuisinier', relu: false }, { texte: 'commis de cuisine', relu: false }, { texte: 'pizzaïolo', relu: false }, { texte: 'boulanger', relu: false }, { texte: 'pâtissier', relu: false }, { texte: 'boucher', relu: false }, { texte: 'poissonnier', relu: false }, { texte: 'vendeur en magasin de sport', relu: false }, { texte: 'caissier', relu: false }, { texte: 'vendeur de téléphones', relu: false }, { texte: 'agent immobilier', relu: false }, { texte: 'commercial', relu: false }, { texte: 'télévendeur', relu: false }, { texte: 'livreur de pizza', relu: false }, { texte: 'marchand sur les marchés', relu: false }, { texte: 'primeur', relu: false }, { texte: 'kebab du quartier', relu: false }],
  'Terre et mer': [{ texte: 'agriculteur', relu: false }, { texte: 'éleveur', relu: false }, { texte: 'berger', relu: false }, { texte: 'bûcheron', relu: false }, { texte: 'pêcheur', relu: false }, { texte: 'mineur', relu: false }, { texte: 'ouvrier viticole', relu: false }, { texte: 'saisonnier aux vendanges', relu: false }, { texte: 'jardinier', relu: false }, { texte: 'apiculteur', relu: false }],
  'Arts, spectacle, image': [{ texte: 'danseur', relu: false }, { texte: 'cascadeur', relu: false }, { texte: 'figurant', relu: false }, { texte: 'mannequin', relu: false }, { texte: 'tatoueur', relu: false }, { texte: 'coiffeur', relu: false }, { texte: 'barbier', relu: false }, { texte: 'DJ', relu: false }, { texte: 'rappeur', relu: false }, { texte: 'musicien de bal', relu: false }, { texte: 'photographe', relu: false }, { texte: 'graphiste', relu: false }, { texte: 'streamer', relu: false }, { texte: 'monteur vidéo', relu: false }],
  'Bureau et technique': [{ texte: 'comptable', relu: false }, { texte: 'informaticien', relu: false }, { texte: 'développeur', relu: false }, { texte: 'technicien réseau', relu: false }, { texte: 'employé de banque', relu: false }, { texte: 'assistant juridique', relu: false }, { texte: 'agent d\'assurance', relu: false }, { texte: 'employé de mairie', relu: false }, { texte: 'agent de la Poste', relu: false }, { texte: 'standardiste', relu: false }],
  'Études et à-côtés': [{ texte: 'étudiant en droit', relu: false }, { texte: 'étudiant en STAPS', relu: false }, { texte: 'étudiant en ingénierie', relu: false }, { texte: 'lycéen', relu: false }, { texte: 'apprenti', relu: false }, { texte: 'intérimaire', relu: false }, { texte: 'saisonnier en station de ski', relu: false }],
  'Autres sports': [{ texte: 'lutteur olympique', relu: false }, { texte: 'judoka de haut niveau', relu: false }, { texte: 'boxeur amateur de l\'équipe nationale', relu: false }, { texte: 'kickboxeur professionnel', relu: false }, { texte: 'footballeur en centre de formation', relu: false }, { texte: 'rugbyman semi-pro', relu: false }, { texte: 'handballeur', relu: false }, { texte: 'haltérophile', relu: false }, { texte: 'champion de taekwondo', relu: false }, { texte: 'lutteur de lutte traditionnelle', relu: false }],
  'La vie sans métier': [{ texte: 'sans emploi', relu: false }, { texte: 'en foyer', relu: false }, { texte: 'a vécu dans la rue', relu: false }, { texte: 'a fait de la prison', relu: false }, { texte: 'a vendu dans son quartier', relu: false }, { texte: 'réfugié en attente de papiers', relu: false }],
};

/* ---- §5 Milieux : d'où il vient, en une ligne. Oriente la voix et le
   métier sans les décider. ==== */
const MGMT_MILIEUX = [
  { texte: 'quartier populaire d\'une grande ville', relu: false }, { texte: 'cité de banlieue', relu: false }, { texte: 'centre-ville', relu: false }, { texte: 'petite ville industrielle', relu: false }, { texte: 'village de montagne', relu: false }, { texte: 'village de pêcheurs', relu: false }, { texte: 'campagne agricole', relu: false }, { texte: 'famille aisée', relu: false }, { texte: 'famille de sportifs', relu: false }, { texte: 'famille de militaires', relu: false }, { texte: 'famille d\'enseignants', relu: false }, { texte: 'famille nombreuse', relu: false }, { texte: 'fils ou fille unique', relu: false }, { texte: 'élevé par ses grands-parents', relu: false }, { texte: 'élevé par sa mère seule', relu: false }, { texte: 'élevé par son père seul', relu: false }, { texte: 'foyer de l\'aide sociale à l\'enfance', relu: false }, { texte: 'famille arrivée récemment dans le pays', relu: false }, { texte: 'enfance entre deux pays', relu: false }, { texte: 'famille de commerçants', relu: false }, { texte: 'famille d\'agriculteurs', relu: false }, { texte: 'enfance dans une salle de boxe (un parent coach)', relu: false },
];

/* ---- §6.3 Les moments de vie (120), famille par famille : poids (charge,
   inspiré de Holmes et Rahe), relais (média ou le combattant lui-même),
   effet (ce que ça change). id = libellé sans accents ni espaces. Chaque
   poids est entre 0 et 100 (échelle Holmes et Rahe : décès du conjoint
   100 au plus haut). ==== */
const MGMT_MOMENTS = [
  /* Famille */
  { id: 'naissance-enfant', famille: 'Famille', libelle: 'Naissance d\'un enfant', poids: 39, relais: ['Coin Rouge', 'Réseaux'], effet: 'Peut refuser un combat ce cycle-là', relu: false },
  { id: 'grossesse-annoncee', famille: 'Famille', libelle: 'Grossesse annoncée (combattante)', poids: 40, relais: ['Réseaux'], effet: 'Pause de carrière ; la Mère au retour', relu: false },
  { id: 'grossesse-compagne', famille: 'Famille', libelle: 'Grossesse de sa compagne', poids: 25, relais: ['Micro Tendu'], effet: 'Veut combattre avant la naissance', relu: false },
  { id: 'deces-parent', famille: 'Famille', libelle: 'Décès d\'un parent', poids: 63, relais: ['Cage Hebdo'], effet: 'Retrait possible ; peut dédier le combat suivant', relu: false },
  { id: 'deces-grand-parent', famille: 'Famille', libelle: 'Décès d\'un grand-parent', poids: 30, relais: ['Lui-même'], effet: 'Dédicace', relu: false },
  { id: 'deces-frere-soeur', famille: 'Famille', libelle: 'Décès d\'un frère ou d\'une sœur', poids: 63, relais: ['Cage Hebdo'], effet: 'Charge forte ; voix plus grave', relu: false },
  { id: 'parent-gravement-malade', famille: 'Famille', libelle: 'Parent gravement malade', poids: 44, relais: ['Lui-même'], effet: 'Veut combattre près de chez lui', relu: false },
  { id: 'enfant-malade', famille: 'Famille', libelle: 'Enfant malade', poids: 44, relais: [], effet: 'Retrait possible', relu: false },
  { id: 'mariage', famille: 'Famille', libelle: 'Mariage', poids: 50, relais: ['Réseaux', 'Micro Tendu'], effet: 'Aucune indisponibilité si hors camp', relu: false },
  { id: 'separation', famille: 'Famille', libelle: 'Séparation', poids: 65, relais: ['Le Forum'], effet: 'Forme en baisse', relu: false },
  { id: 'divorce', famille: 'Famille', libelle: 'Divorce', poids: 73, relais: ['Clé de Bras'], effet: 'Forme en baisse, argent en baisse', relu: false },
  { id: 'reconciliation', famille: 'Famille', libelle: 'Réconciliation', poids: 45, relais: ['Réseaux'], effet: '—', relu: false },
  { id: 'nouveau-couple-mediatise', famille: 'Famille', libelle: 'Nouveau couple médiatisé', poids: 20, relais: ['Clé de Bras'], effet: 'Attention en hausse', relu: false },
  { id: 'frere-passe-pro', famille: 'Famille', libelle: 'Un frère ou une sœur passe pro', poids: 15, relais: ['Coin Rouge'], effet: 'Lien familial dans le vestiaire (§ liens)', relu: false },
  { id: 'enfant-debuts-sport-combat', famille: 'Famille', libelle: 'Son enfant fait ses débuts dans un sport de combat', poids: 10, relais: ['Réseaux'], effet: 'Le Vieux de la vieille en parle', relu: false },
  { id: 'adopte-chien', famille: 'Famille', libelle: 'Adopte un chien', poids: 5, relais: ['Réseaux'], effet: 'L\'Influenceur en fait trois vidéos', relu: false },
  { id: 'demenage-famille', famille: 'Famille', libelle: 'Déménage pour rejoindre sa famille', poids: 20, relais: ['Lui-même'], effet: 'Change parfois de camp', relu: false },
  { id: 'dispute-familiale-publique', famille: 'Famille', libelle: 'Dispute familiale publique', poids: 35, relais: ['Clé de Bras'], effet: 'Le Clan se tait', relu: false },
  { id: 'parents-premiere-fois', famille: 'Famille', libelle: 'Père ou mère vient le voir combattre pour la première fois', poids: 10, relais: ['Lui-même'], effet: 'Pression ; le Clan et le Timide en parlent', relu: false },
  { id: 'reunion-famille-pays', famille: 'Famille', libelle: 'Réunion de famille au pays', poids: 15, relais: ['La presse du pays'], effet: 'L\'Enfant du pays pleure', relu: false },
  /* Santé et corps */
  { id: 'blessure-entrainement', famille: 'Santé et corps', libelle: 'Blessure à l\'entraînement', poids: 53, relais: ['Sources Proches'], effet: 'Retrait ; retour en N cycles', relu: false },
  { id: 'operation-chirurgicale', famille: 'Santé et corps', libelle: 'Opération chirurgicale', poids: 53, relais: ['Cage Hebdo'], effet: 'Absence longue', relu: false },
  { id: 'commotion-sparring', famille: 'Santé et corps', libelle: 'Commotion en sparring', poids: 53, relais: [], effet: 'Clara donne un avis', relu: false },
  { id: 'maladie-semaine-combat', famille: 'Santé et corps', libelle: 'Maladie la semaine du combat', poids: 30, relais: ['Sources Proches'], effet: 'Retrait tardif (carte incomplète)', relu: false },
  { id: 'pesee-ratee', famille: 'Santé et corps', libelle: 'Pesée ratée', poids: 25, relais: ['Tous'], effet: 'Amende ; colère de Delatour ; le combat peut tenir', relu: false },
  { id: 'coupe-dangereuse', famille: 'Santé et corps', libelle: 'Coupe de poids dangereuse', poids: 35, relais: ['La Pesée'], effet: 'Hospitalisation possible ; Clara', relu: false },
  { id: 'monte-categorie', famille: 'Santé et corps', libelle: 'Monte d\'une catégorie', poids: 30, relais: ['Tableau Noir', 'Cage Hebdo'], effet: 'Nouveau classement', relu: false },
  { id: 'descend-categorie', famille: 'Santé et corps', libelle: 'Descend d\'une catégorie', poids: 35, relais: ['Tableau Noir'], effet: 'Coupe plus dure', relu: false },
  { id: 'reprend-15-kilos', famille: 'Santé et corps', libelle: 'Reprend 15 kilos hors camp', poids: 15, relais: ['Le Forum'], effet: 'Pesée plus risquée au prochain camp', relu: false },
  { id: 'controle-antidopage-positif', famille: 'Santé et corps', libelle: 'Contrôle antidopage positif', poids: 60, relais: ['La Pesée', 'Clé de Bras'], effet: 'Suspension ; réputation', relu: false },
  { id: 'blues-apres-combat', famille: 'Santé et corps', libelle: 'Blues d\'après-combat', poids: 30, relais: ['Lui-même', 'Micro Tendu'], effet: 'Inactivité volontaire, même après une victoire', relu: false },
  { id: 'depression-declaree', famille: 'Santé et corps', libelle: 'Dépression déclarée', poids: 50, relais: ['Lui-même'], effet: 'Pause ; la rupture du Cœur ouvert', relu: false },
  { id: 'arrete-alcool', famille: 'Santé et corps', libelle: 'Arrête l\'alcool', poids: 24, relais: ['Lui-même'], effet: 'Forme en hausse', relu: false },
  { id: 'remet-a-boire', famille: 'Santé et corps', libelle: 'Se remet à boire', poids: 30, relais: ['Le Forum'], effet: 'Forme en baisse', relu: false },
  { id: 'insomnies-camp', famille: 'Santé et corps', libelle: 'Insomnies de camp', poids: 16, relais: [], effet: 'Forme en baisse légère', relu: false },
  { id: 'blessure-hors-cage', famille: 'Santé et corps', libelle: 'Blessure hors cage (accident de scooter, chute)', poids: 40, relais: ['Sources Proches'], effet: 'Retrait', relu: false },
  { id: 'bagarre-bar', famille: 'Santé et corps', libelle: 'Bagarre de bar', poids: 35, relais: ['Clé de Bras'], effet: 'Suspension possible ; blessure à la main', relu: false },
  { id: 'mois-de-jeune-camp', famille: 'Santé et corps', libelle: 'Mois de jeûne pendant le camp', poids: 15, relais: ['Lui-même'], effet: 'Préfère ne pas combattre ce mois-là ; certains n\'ont pas le choix', relu: false },
  { id: 'plus-couper-poids', famille: 'Santé et corps', libelle: 'Décide de ne plus couper de poids', poids: 20, relais: ['Tableau Noir'], effet: 'Monte d\'une catégorie', relu: false },
  { id: 'premier-scanner-inquietant', famille: 'Santé et corps', libelle: 'Premier scanner cérébral inquiétant', poids: 45, relais: [], effet: 'Avis de Clara', relu: false },
  /* Argent et travail */
  { id: 'quitte-emploi', famille: 'Argent et travail', libelle: 'Quitte son emploi pour combattre à plein temps', poids: 36, relais: ['Coin Rouge'], effet: 'Camp complet ; plus de disponibilité', relu: false },
  { id: 'perd-emploi', famille: 'Argent et travail', libelle: 'Perd son emploi', poids: 47, relais: ['Lui-même'], effet: 'Accepte tout (comme la nécessité)', relu: false },
  { id: 'reprend-emploi', famille: 'Argent et travail', libelle: 'Reprend un emploi', poids: 26, relais: ['Lui-même'], effet: 'Moins disponible', relu: false },
  { id: 'premiere-grosse-prime', famille: 'Argent et travail', libelle: 'Première grosse prime', poids: 28, relais: ['Réseaux'], effet: 'Achète quelque chose : voiture, maison des parents', relu: false },
  { id: 'achete-maison-parents', famille: 'Argent et travail', libelle: 'Achète une maison à ses parents', poids: 20, relais: ['Coin Rouge', 'Réseaux'], effet: '—', relu: false },
  { id: 'dettes', famille: 'Argent et travail', libelle: 'Dettes', poids: 38, relais: ['Le Forum'], effet: 'Accepte les combats à court préavis', relu: false },
  { id: 'nouveau-sponsor', famille: 'Argent et travail', libelle: 'Nouveau sponsor', poids: 10, relais: ['Réseaux'], effet: 'L\'Influenceur surtout', relu: false },
  { id: 'perd-sponsor', famille: 'Argent et travail', libelle: 'Perd un sponsor', poids: 15, relais: ['Clé de Bras'], effet: '—', relu: false },
  { id: 'ouvre-salle', famille: 'Argent et travail', libelle: 'Ouvre sa salle', poids: 36, relais: ['Coin Rouge'], effet: 'Moins de temps au camp ; pense à l\'après', relu: false },
  { id: 'lance-marque-vetements', famille: 'Argent et travail', libelle: 'Lance une marque de vêtements', poids: 20, relais: ['Réseaux'], effet: '—', relu: false },
  { id: 'litige-manager', famille: 'Argent et travail', libelle: 'Litige avec son manager', poids: 30, relais: ['Sources Proches'], effet: 'Refuse de négocier un temps', relu: false },
  { id: 'change-agent', famille: 'Argent et travail', libelle: 'Change d\'agent', poids: 15, relais: ['Sources Proches'], effet: 'Rebecca Lasso peut entrer (lot futur)', relu: false },
  { id: 'bourse-publiee', famille: 'Argent et travail', libelle: 'Bourse publiée', poids: 10, relais: ['La Pesée'], effet: 'L\'Aigri a de quoi parler', relu: false },
  { id: 'reclame-augmentation', famille: 'Argent et travail', libelle: 'Réclame une augmentation', poids: 15, relais: ['Lui-même'], effet: 'Demande (cf. promesses)', relu: false },
  /* Justice et incidents */
  { id: 'garde-a-vue', famille: 'Justice et incidents', libelle: 'Garde à vue', poids: 40, relais: ['Clé de Bras', 'Le Forum'], effet: 'Suspension possible', relu: false },
  { id: 'condamnation', famille: 'Justice et incidents', libelle: 'Condamnation', poids: 63, relais: ['Cage Hebdo'], effet: 'Absence ; le Repenti à la sortie', relu: false },
  { id: 'exces-vitesse-mediatise', famille: 'Justice et incidents', libelle: 'Excès de vitesse médiatisé', poids: 11, relais: ['Clé de Bras'], effet: '—', relu: false },
  { id: 'probleme-visa', famille: 'Justice et incidents', libelle: 'Problème de visa', poids: 30, relais: ['Sources Proches'], effet: 'Ne peut pas combattre en France ce cycle-là', relu: false },
  { id: 'obtient-nationalite', famille: 'Justice et incidents', libelle: 'Obtient la nationalité', poids: 28, relais: ['La presse du pays', 'Cage Hebdo'], effet: '—', relu: false },
  { id: 'obtient-papiers', famille: 'Justice et incidents', libelle: 'Obtient ses papiers', poids: 40, relais: ['Coin Rouge'], effet: 'Peut enfin combattre partout ; l\'Exilé', relu: false },
  { id: 'accuse-tort-blanchi', famille: 'Justice et incidents', libelle: 'Accusé à tort, puis blanchi', poids: 50, relais: ['La Pesée'], effet: 'Voix plus dure', relu: false },
  { id: 'plainte-voisin-salle', famille: 'Justice et incidents', libelle: 'Plainte d\'un voisin de salle', poids: 10, relais: [], effet: '—', relu: false },
  /* Carrière et camp */
  { id: 'change-de-camp', famille: 'Carrière et camp', libelle: 'Change de camp', poids: 36, relais: ['Sources Proches', 'Tableau Noir'], effet: 'Le style peut évoluer ; le Thaï change de nom', relu: false },
  { id: 'dispute-coach-publique', famille: 'Carrière et camp', libelle: 'Dispute publique avec son coach', poids: 35, relais: ['Clé de Bras'], effet: 'Changement de camp probable', relu: false },
  { id: 'coach-meurt', famille: 'Carrière et camp', libelle: 'Son coach meurt', poids: 63, relais: ['Cage Hebdo'], effet: 'Charge forte ; dédicace', relu: false },
  { id: 'coach-retraite', famille: 'Carrière et camp', libelle: 'Son coach prend sa retraite', poids: 20, relais: ['Cage Hebdo'], effet: '—', relu: false },
  { id: 'nouveau-partenaire-celebre', famille: 'Carrière et camp', libelle: 'Nouveau partenaire d\'entraînement célèbre', poids: 10, relais: ['Réseaux'], effet: '—', relu: false },
  { id: 'coequipier-booké-contre-lui', famille: 'Carrière et camp', libelle: 'Un coéquipier est booké contre lui', poids: 30, relais: ['Sources Proches'], effet: 'Refus probable (§ liens)', relu: false },
  { id: 'offre-autre-organisation', famille: 'Carrière et camp', libelle: 'Offre d\'une autre organisation', poids: 20, relais: ['Sources Proches'], effet: 'Risque de départ (lot 2B)', relu: false },
  { id: 'consultant-television', famille: 'Carrière et camp', libelle: 'Invité en consultant à la télévision', poids: 10, relais: ['Le Plateau'], effet: 'Visibilité', relu: false },
  { id: 'tourne-film-serie', famille: 'Carrière et camp', libelle: 'Tourne dans un film ou une série', poids: 15, relais: ['Coin Rouge'], effet: 'Absence d\'un cycle', relu: false },
  { id: 'documentaire-vie', famille: 'Carrière et camp', libelle: 'Documentaire sur sa vie', poids: 20, relais: ['Coin Rouge'], effet: 'Popularité ; la presse du pays', relu: false },
  { id: 'video-virale', famille: 'Carrière et camp', libelle: 'Vidéo virale', poids: 15, relais: ['Le Forum', 'Clé de Bras'], effet: 'Popularité', relu: false },
  { id: 'clash-autre-organisation', famille: 'Carrière et camp', libelle: 'Clash avec un combattant d\'une autre organisation', poids: 10, relais: ['Réseaux'], effet: 'Occasion de recrutement', relu: false },
  { id: 'rival-appelle-public', famille: 'Carrière et camp', libelle: 'Rival qui l\'appelle en public', poids: 10, relais: ['Réseaux', 'Le Forum'], effet: 'Occasion : « Envisager ce combat »', relu: false },
  { id: 'surnom-presse', famille: 'Carrière et camp', libelle: 'Reçoit un surnom de la presse', poids: 5, relais: ['Cage Hebdo'], effet: 'Nouveau surnom (§3.5)', relu: false },
  { id: 'annonce-retraite', famille: 'Carrière et camp', libelle: 'Annonce sa retraite', poids: 45, relais: ['Tous'], effet: 'Départ', relu: false },
  { id: 'revient-retraite', famille: 'Carrière et camp', libelle: 'Revient de sa retraite', poids: 36, relais: ['Tous'], effet: 'Retour ; le Vieux de la vieille', relu: false },
  { id: 'retraite-ancien-coequipier', famille: 'Carrière et camp', libelle: 'Retraite d\'un ancien coéquipier', poids: 15, relais: ['Cage Hebdo'], effet: 'Il y pense', relu: false },
  { id: 'sparring-tourne-bagarre', famille: 'Carrière et camp', libelle: 'Sparring qui tourne à la bagarre', poids: 20, relais: ['Le Forum'], effet: 'Blessure possible', relu: false },
  { id: 'ceinture-noire', famille: 'Carrière et camp', libelle: 'Obtient une ceinture noire', poids: 28, relais: ['Réseaux'], effet: 'Style (JJB) confirmé', relu: false },
  { id: 'diplome-obtenu', famille: 'Carrière et camp', libelle: 'Diplôme obtenu', poids: 28, relais: ['Micro Tendu'], effet: 'Le Prof et l\'Étudiant en parlent', relu: false },
  /* Lieux et vie */
  { id: 'demenage-autre-ville', famille: 'Lieux et vie', libelle: 'Déménage dans une autre ville', poids: 20, relais: ['Lui-même'], effet: 'Peut changer de camp', relu: false },
  { id: 'etranger-camp', famille: 'Lieux et vie', libelle: 'S\'installe à l\'étranger pour un camp', poids: 25, relais: ['Tableau Noir'], effet: 'Style qui évolue', relu: false },
  { id: 'retourne-au-pays', famille: 'Lieux et vie', libelle: 'Retourne vivre au pays', poids: 25, relais: ['La presse du pays'], effet: 'Moins disponible pour Split', relu: false },
  { id: 'maison-inondee-incendiee', famille: 'Lieux et vie', libelle: 'Maison inondée ou incendiée', poids: 38, relais: ['Coin Rouge'], effet: 'Accepte tout pour payer', relu: false },
  { id: 'voyage-pelerinage', famille: 'Lieux et vie', libelle: 'Voyage de pèlerinage', poids: 12, relais: ['Lui-même'], effet: 'Absent un cycle', relu: false },
  { id: 'vacances-derapent', famille: 'Lieux et vie', libelle: 'Vacances qui dérapent (photos)', poids: 13, relais: ['Le Forum'], effet: '—', relu: false },
  { id: 'engagement-associatif', famille: 'Lieux et vie', libelle: 'Engagement associatif (enfants, prison, santé mentale)', poids: 10, relais: ['Coin Rouge'], effet: 'Le Cœur ouvert, le Repenti', relu: false },
  { id: 'visite-ecole-ancien-quartier', famille: 'Lieux et vie', libelle: 'Visite une école de son ancien quartier', poids: 5, relais: ['Coin Rouge'], effet: '—', relu: false },
  { id: 'arrete-reseaux', famille: 'Lieux et vie', libelle: 'Arrête les réseaux sociaux', poids: 10, relais: ['Le Forum'], effet: 'Le Réclamant devient muet un temps', relu: false },
  { id: 'revient-reseaux', famille: 'Lieux et vie', libelle: 'Revient sur les réseaux', poids: 5, relais: ['Réseaux'], effet: '—', relu: false },
  { id: 'tatouage-nom-ville', famille: 'Lieux et vie', libelle: 'Se fait tatouer le nom de sa ville', poids: 5, relais: ['Réseaux'], effet: '—', relu: false },
  { id: 'change-religion', famille: 'Lieux et vie', libelle: 'Change de religion ou reprend la pratique', poids: 19, relais: ['Lui-même'], effet: 'Voix du Fataliste possible', relu: false },
  { id: 'emission-tele-realite', famille: 'Lieux et vie', libelle: 'Participe à une émission de télé-réalité', poids: 20, relais: ['Clé de Bras'], effet: 'L\'Influenceur', relu: false },
  { id: 'chante-hymne-match-foot', famille: 'Lieux et vie', libelle: 'Chante l\'hymne à un match de foot', poids: 5, relais: ['Réseaux'], effet: '—', relu: false },
  /* Autour de la cage */
  { id: 'premiere-victoire-ko', famille: 'Autour de la cage', libelle: 'Première victoire par KO', poids: 28, relais: ['Cage Hebdo'], effet: 'Confiance', relu: false },
  { id: 'premier-ko-subi', famille: 'Autour de la cage', libelle: 'Premier KO subi', poids: 45, relais: ['Cage Hebdo'], effet: 'Peur ; certaines voix changent (§4 des voix)', relu: false },
  { id: 'serie-trois-defaites', famille: 'Autour de la cage', libelle: 'Série de trois défaites', poids: 40, relais: ['Le Forum'], effet: 'Pense à arrêter', relu: false },
  { id: 'serie-cinq-victoires', famille: 'Autour de la cage', libelle: 'Série de cinq victoires', poids: 28, relais: ['Cage Hebdo'], effet: 'Réclame un classé', relu: false },
  { id: 'entre-top-15', famille: 'Autour de la cage', libelle: 'Entre dans le top 15', poids: 28, relais: ['Cage Hebdo'], effet: '—', relu: false },
  { id: 'sort-top-15', famille: 'Autour de la cage', libelle: 'Sort du top 15', poids: 30, relais: ['Le Forum'], effet: '—', relu: false },
  { id: 'devient-champion', famille: 'Autour de la cage', libelle: 'Devient champion', poids: 28, relais: ['Tous'], effet: 'Pression ; blues possible', relu: false },
  { id: 'perd-ceinture', famille: 'Autour de la cage', libelle: 'Perd sa ceinture', poids: 45, relais: ['Tous'], effet: '—', relu: false },
  { id: 'combat-annule-veille', famille: 'Autour de la cage', libelle: 'Combat annulé la veille', poids: 30, relais: ['Sources Proches'], effet: 'Frustration ; bourse perdue', relu: false },
  { id: 'victoire-volee', famille: 'Autour de la cage', libelle: 'Victoire volée (décision contestée)', poids: 35, relais: ['Le Forum'], effet: 'Réclame la revanche', relu: false },
  { id: 'blesse-gravement-adversaire', famille: 'Autour de la cage', libelle: 'Blesse gravement un adversaire', poids: 40, relais: ['Cage Hebdo'], effet: 'Peut douter ; le Contemplatif en parle', relu: false },
  { id: 'combat-annee', famille: 'Autour de la cage', libelle: 'Combat de l\'année', poids: 20, relais: ['Cage Hebdo', 'Le Plateau'], effet: 'Popularité', relu: false },
  { id: 'premier-combat-public', famille: 'Autour de la cage', libelle: 'Premier combat devant son public', poids: 15, relais: ['Coin Rouge', 'La presse du pays'], effet: 'Pression et joie', relu: false },
];

/* ---- §7.3 Rituels (50) : se lisent sur la fiche et dans Micro Tendu ; ne
   changent rien aux combats sauf quand ils sont rompus (moment de vie de
   poids 10). ==== */
const MGMT_RITUELS = [
  { texte: 'mange le même plat la veille de chaque combat', relu: false }, { texte: 'porte les mêmes chaussettes depuis son premier combat', relu: false }, { texte: 'ne se rase plus à partir du début du camp', relu: false }, { texte: 'se rase la tête le jour de la pesée', relu: false }, { texte: 'appelle sa mère juste avant d\'entrer', relu: false }, { texte: 'prie dans un coin du vestiaire', relu: false }, { texte: 'fait exactement cent pompes à l\'échauffement', relu: false }, { texte: 'écoute la même chanson en boucle, toujours la même depuis ses débuts', relu: false }, { texte: 'change de chanson d\'entrée à chaque combat', relu: false }, { texte: 'touche le grillage trois fois en entrant', relu: false }, { texte: 'entre toujours du pied gauche', relu: false }, { texte: 'embrasse le tapis avant le premier round', relu: false }, { texte: 'garde une photo de son enfant dans son sac', relu: false }, { texte: 'garde ses gants d\'amateur dans son sac', relu: false }, { texte: 'fait bander ses mains par la même personne depuis dix ans', relu: false }, { texte: 'refuse de regarder son adversaire à la pesée', relu: false }, { texte: 'fixe son adversaire sans cligner à la pesée', relu: false }, { texte: 'dort une heure dans le vestiaire', relu: false }, { texte: 'vomit avant chaque combat, et dit que c\'est bon signe', relu: false }, { texte: 'ne parle à personne les deux heures d\'avant', relu: false }, { texte: 'chante dans les couloirs', relu: false }, { texte: 'danse pendant son entrée', relu: false }, { texte: 'lit le même livre pendant tout le camp', relu: false }, { texte: 'regarde des dessins animés la veille', relu: false }, { texte: 'joue aux cartes avec son coach avant d\'entrer', relu: false }, { texte: 'porte un bracelet de sa grand-mère au poignet sous les bandages', relu: false }, { texte: 'refuse le numéro 13 sur tout', relu: false }, { texte: 'jeûne le jour du combat jusqu\'à la pesée de contrôle', relu: false }, { texte: 'se fait couper les cheveux par son petit frère', relu: false }, { texte: 'ne dort pas la veille et dit que ça le rend méchant', relu: false }, { texte: 'se douche à l\'eau glacée juste avant', relu: false }, { texte: 'écrit le nom de son adversaire sur un papier et le brûle', relu: false }, { texte: 'écrit une lettre à son père mort', relu: false }, { texte: 'serre la main de chaque membre de la sécurité', relu: false }, { texte: 'compte les marches jusqu\'à la cage', relu: false }, { texte: 'mâche du chewing-gum jusqu\'au dernier moment', relu: false }, { texte: 'met son protège-dents à l\'envers pendant l\'échauffement', relu: false }, { texte: 'porte le short de son premier combat professionnel, recousu dix fois', relu: false }, { texte: 'appelle son ancien prof de sport', relu: false }, { texte: 'mange un carré de chocolat entre chaque round d\'échauffement', relu: false }, { texte: 'salue les quatre coins de la salle', relu: false }, { texte: 'tape sur l\'épaule de l\'arbitre en lui souhaitant bonne chance', relu: false }, { texte: 'se récite un poème', relu: false }, { texte: 'fait une sieste dans la voiture sur le parking', relu: false }, { texte: 'garde un caillou de son village dans sa chaussure pendant la pesée', relu: false }, { texte: 's\'interdit de regarder les combats d\'avant le sien', relu: false }, { texte: 'regarde tous les combats d\'avant le sien', relu: false }, { texte: 'rit tout seul pendant l\'échauffement', relu: false }, { texte: 'fait l\'inventaire de son sac trois fois', relu: false }, { texte: 'ne mange que de la nourriture de son pays pendant la semaine du combat', relu: false },
];

/* ---- §9.2 Rôles — un mot pour lire un combattant. Déduits de l'âge, du
   bilan, du rang, de la série et de la tendance : la table porte les
   critères d'attribution (texte du catalogue, relu:false), pas la
   mécanique. ==== */
const MGMT_ROLES = [
  { id: 'espoir', libelle: 'Espoir', criteres: 'Moins de 25 ans, moins de 6 combats pros', relu: false },
  { id: 'invaincu', libelle: 'Invaincu', criteres: 'Aucune défaite, au moins 5 victoires', relu: false },
  { id: 'journeyman', libelle: 'Journeyman', criteres: 'Plus de 15 combats, bilan proche de l\'équilibre, hors top 15', relu: false },
  { id: 'gatekeeper', libelle: 'Gatekeeper', criteres: 'Ancien top 15, plus de 30 ans, a battu et perdu contre des classés', relu: false },
  { id: 'contender', libelle: 'Contender', criteres: 'Top 5 de sa catégorie', relu: false },
  { id: 'champion', libelle: 'Champion', criteres: 'Ceinture en cours (lot 5 T1)', relu: false },
  { id: 'ancien-champion', libelle: 'Ancien champion', criteres: 'A tenu une ceinture', relu: false },
  { id: 'veteran', libelle: 'Vétéran', criteres: 'Plus de 34 ans ou plus de 30 combats', relu: false },
  { id: 'remplacant-de-luxe', libelle: 'Remplaçant de luxe', criteres: 'A accepté au moins deux combats à court préavis', relu: false },
  { id: 'bete-noire', libelle: 'Bête noire', criteres: 'A battu deux combattants classés au-dessus de lui', relu: false },
  { id: 'en-perdition', libelle: 'En perdition', criteres: 'Trois défaites de suite', relu: false },
  { id: 'revenant', libelle: 'Revenant', criteres: 'Revenu après plus d\'un an d\'absence', relu: false },
];

/* ---- §10.2 Trajectoires : modulent les paramètres existants (potentiel,
   âge du pic, vitesse du déclin — lot 2B T2 bis) sans créer une seconde loi
   de vieillissement. La forme (texte du catalogue) décrit la courbe. ==== */
const MGMT_TRAJECTOIRES = [
  { id: 'meteore', libelle: 'Météore', forme: 'Monte très vite, pic court, chute brutale', relu: false },
  { id: 'batisseur', libelle: 'Bâtisseur', forme: 'Lent, régulier, pic tardif et long', relu: false },
  { id: 'eternel-espoir', libelle: 'Éternel espoir', forme: 'Beaucoup de potentiel, ne décolle jamais tout à fait', relu: false },
  { id: 'gatekeeper-heureux', libelle: 'Gatekeeper heureux', forme: 'Plafonne tôt, reste dangereux dix ans', relu: false },
  { id: 'eclosion-tardive', libelle: 'Éclosion tardive', forme: 'Médiocre jusqu\'à 28 ans, puis tout change (souvent un changement de camp)', relu: false },
  { id: 'brise', libelle: 'Brisé', forme: 'Une blessure ou un KO coupe la courbe en deux', relu: false },
  { id: 'voyageur', libelle: 'Voyageur', forme: 'Change souvent d\'organisation, de camp, de catégorie', relu: false },
  { id: 'vieux-lion', libelle: 'Vieux lion', forme: 'Long pic, déclin lent, un dernier sursaut', relu: false },
  { id: 'prodige-eteint', libelle: 'Prodige éteint', forme: 'Pic très jeune, puis plus rien, sans raison apparente', relu: false },
  { id: 'double-vie', libelle: 'Double vie', forme: 'Garde un métier ; progresse lentement, dure longtemps', relu: false },
  { id: 'redemption', libelle: 'Rédemption', forme: 'Chute (prison, alcool, blessure), puis retour', relu: false },
  { id: 'fidele', libelle: 'Fidèle', forme: 'Toute sa carrière chez Split (dépend aussi du joueur)', relu: false },
  { id: 'mercenaire', libelle: 'Mercenaire', forme: 'Va toujours au plus offrant', relu: false },
  { id: 'changement-de-poids', libelle: 'Changement de poids', forme: 'Sa vraie carrière commence dans une autre catégorie', relu: false },
  { id: 'un-seul-soir', libelle: 'Un seul soir', forme: 'Une victoire immense, puis une carrière ordinaire', relu: false },
];
/* ==== [FIN ANCRE MGMT_LOT5_H1_DONNEES] ==== */
