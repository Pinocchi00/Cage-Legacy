"use strict";
/* =========================================================================
   CAGE LEGACY — MOTEUR v2 (reconstruction)
   30 attributs (Technique/Mental/Physique) internes /100, AFFICHÉS /20.
   Génération profonde (origine + motivation + potentiel caché). Combat qui
   produit de vraies statistiques de round + log lisible. Échelle d'orgs.
   Classement/GOAT corrigés (les défaites pèsent lourd). Pas d'argent.
   Cadre de compétences uniques. Aucune dépendance externe (Node pur).
   ========================================================================= */
/* Dépend de : data-skills.js (SKILLS), data-content.js (ORIGINS, MOTIVATIONS).
   Doit être chargé après ces deux fichiers. */
let SEED=(Date.now()^0x9e3779b9)>>>0;
function setSeed(s){ SEED=(s>>>0)||1; }
function rnd(){ SEED=(SEED*1664525+1013904223)>>>0; return SEED/4294967296; }
const RI=(a,b)=>Math.floor(rnd()*(b-a+1))+a;
const R=(a,b)=>a+rnd()*(b-a);
const pick=a=>a[Math.floor(rnd()*a.length)];
// ==== [ANCRE: CORRECTIF_REPETITION_TEXTES] — item demandé : varier les textes
// susceptibles de revenir identiques à chaque combat (rôles de matchmaking,
// lecture tactique...). pick() seul re-tirerait à CHAQUE rendu (flicker si
// l'écran se redessine sans nouveau combat) — pickStable() choisit dans un
// pool de façon déterministe à partir d'un seed (ex. id de l'adversaire +
// clé de contexte), donc stable tant que l'adversaire ne change pas, mais
// varié d'un adversaire ou d'un combat à l'autre.
function pickStable(pool,seed){ if(!pool||!pool.length) return ''; let h=0; const s=String(seed); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return pool[h%pool.length]; }
const clamp=(v,lo=1,hi=100)=>v<lo?lo:v>hi?hi:v;
const num=(v,d=50)=>typeof v==='number'&&!isNaN(v)?v:d;
function gauss(m,sd,lo,hi){ let u=0,v=0; while(!u)u=rnd(); while(!v)v=rnd(); let g=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); let x=Math.round(m+g*sd); if(lo!=null)x=Math.max(lo,x); if(hi!=null)x=Math.min(hi,x); return x; }
const sigmoid=x=>1/(1+Math.exp(-x));
const d20=v=>Math.max(1,Math.min(20,Math.round(v/5)));   // /100 -> /20 affiché
// Accord de genre (#1) : remplace {forme masculine/forme féminine} selon
// f.gender. Jamais une simple substitution "il"->"elle" qui casserait
// l'accord des participes/adjectifs environnants — chaque texte gendré
// porte ses deux formes complètes, écrites à la main.
function parseGender(txt,gender){
  if(!txt || typeof txt!=='string') return txt;
  return txt.replace(/\{([^}]*)\/([^}]*)\}/g,(match,m,f)=>gender==='F'?f:m);
}
/* ==== [ANCRE: IS_DECISION_LIKE] — un seul point de vérité pour "ce combat s'est
   terminé aux cartes des juges" (Décision, Décision partagée, OU Égalité).
   Avant : 13 vérifications startsWith('Déc') éparpillées dans le code, toutes
   cassées par l'ajout du Draw ('Égalité' ne commence pas par 'Déc'). ==== */
function isDecisionLike(m){ return !!m && (m.startsWith('Déc')||m==='Égalité'); }
/* ==== [FIN ANCRE] ==== */

/* --------------------------- 30 ATTRIBUTS --------------------------------- */
const ATTR={
  tech:[['jab','Jab'],['cross','Direct'],['hook','Crochets'],['kick','Coups de pied'],['clinchStr','Lutte debout'],
        ['takedown','Amenées au sol'],['tdd','Défense lutte'],['topControl','Contrôle au sol'],['gnp','Sol offensif'],
        ['submission','Soumissions'],['guardWork','Jeu de garde']],
  ment:[['fightIQ','Intelligence'],['composure','Sang-froid'],['aggression','Agressivité'],['heart','Cœur'],
        ['discipline','Discipline'],['adaptability','Adaptation'],['killer','Instinct de finition'],['focus','Concentration'],['confidence','Confiance']],
  phys:[['power','Puissance'],['handSpeed','Vitesse des mains'],['footSpeed','Jeu de jambes'],['cardio','Cardio'],
        ['strength','Force'],['chin','Menton'],['recovery','Récupération'],['explosiveness','Explosivité'],['flexibility','Souplesse'],['durability','Résistance']],
};
const ALL_ATTR=[].concat(ATTR.tech,ATTR.ment,ATTR.phys);
/* ==== [ANCRE: ATTRIBUTS_EXPLIQUES] — item demandé : "que tout le jeu soit
   explicite et facile à comprendre même pour quelqu'un qui ne connaît rien
   au MMA". Les 30 attributs portent des noms justes mais qui supposent le
   vocabulaire du sport : "Menton" ne dit pas qu'il s'agit d'encaisser,
   "Jeu de garde" ni "Défense lutte" ne parlent à personne hors du milieu.
   Une définition en une phrase par attribut, sans jargon, affichée à la
   demande sur la fiche complète (scr_profile, ui-06) — là où le joueur lit
   justement ces lignes. ==== */
const ATTR_HELP={
  jab:'Le coup de poing du bras avant, pour tenir l’adversaire à distance.',
  cross:'Le coup de poing du bras arrière, en ligne droite : le coup qui fait mal.',
  hook:'Le coup de poing latéral, qui contourne la garde.',
  kick:'Les coups de pied, de la cuisse jusqu’à la tête.',
  clinchStr:'Le corps à corps debout, quand les deux combattants se tiennent.',
  takedown:'Amener l’adversaire au sol contre sa volonté.',
  tdd:'Empêcher l’adversaire de vous amener au sol.',
  topControl:'Rester au-dessus et immobiliser l’adversaire au sol.',
  gnp:'Frapper l’adversaire une fois qu’il est au sol.',
  submission:'Les prises qui forcent l’abandon : étranglements et clés articulaires.',
  guardWork:'Se défendre et attaquer depuis le sol, quand on est en dessous.',
  fightIQ:'Lire le combat et choisir la bonne option au bon moment.',
  composure:'Rester lucide sous la pression, sans paniquer.',
  aggression:'La tendance à aller au contact et à prendre l’initiative.',
  heart:'Continuer à se battre quand tout va mal.',
  discipline:'Le sérieux à l’entraînement et le respect du plan de combat.',
  adaptability:'Changer de plan quand le premier ne fonctionne pas.',
  killer:'Savoir achever un adversaire déjà en difficulté.',
  focus:'Rester concentré du début à la fin du combat.',
  confidence:'La confiance en ses propres armes.',
  power:'La force de frappe : faire mal en un seul coup.',
  handSpeed:'La vitesse des poings.',
  footSpeed:'Les déplacements : bouger, sortir de l’axe, couper la cage.',
  cardio:'Le réservoir d’énergie : tenir la distance sans faiblir.',
  strength:'La force physique brute, surtout au corps à corps.',
  chin:'La capacité à encaisser un coup sans être assommé.',
  recovery:'Récupérer entre les rounds et entre les combats.',
  explosiveness:'Produire un effort violent d’un seul coup.',
  flexibility:'La souplesse : se dégager, tenir des positions difficiles.',
  durability:'Encaisser l’accumulation des coups sur la durée.'
};
/** Définition en clair d'un attribut. @param {string} k @returns {string} */
const attrHelp=k=>ATTR_HELP[k]||'';
/* ==== [FIN ANCRE] ==== */

const ATTR_KEYS=ALL_ATTR.map(a=>a[0]);
const CHIN='chin';                                  // ne monte jamais
const TRAINABLE=ATTR_KEYS.filter(k=>k!==CHIN);
const attrLabel=k=>(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1];

/* ------------------------- DIVISIONS & STYLES ----------------------------- */
const DIVISIONS={
 H:[{id:'H-fly',name:'Poids mouche',h:168,r:170,kg:56.7},{id:'H-bantam',name:'Poids coq',h:171,r:173,kg:61.2},
    {id:'H-feather',name:'Poids plume',h:173,r:175,kg:65.8},{id:'H-light',name:'Poids léger',h:175,r:178,kg:70.3},
    {id:'H-welter',name:'Poids mi-moyen',h:180,r:184,kg:77.1},{id:'H-middle',name:'Poids moyen',h:184,r:189,kg:83.9},
    {id:'H-lheavy',name:'Poids mi-lourd',h:188,r:193,kg:93.0},{id:'H-heavy',name:'Poids lourd',h:191,r:196,kg:120.2}],
 F:[{id:'F-straw',name:'Poids paille',h:163,r:164,kg:52.2},{id:'F-fly',name:'Poids mouche',h:165,r:166,kg:56.7},
    {id:'F-bantam',name:'Poids coq',h:168,r:169,kg:61.2},{id:'F-feather',name:'Poids plume',h:170,r:172,kg:65.8}],
};
DIVISIONS.H.forEach(d=>d.gender='H'); DIVISIONS.F.forEach(d=>d.gender='F');
const allDivisions=()=>DIVISIONS.H.concat(DIVISIONS.F);
const divById=id=>allDivisions().find(d=>d.id===id);

/* biais de style : quels attributs sont naturellement plus hauts au départ */
/* ==== [ANCRE: LOT9_CODEX] — codex interactif des compétences (logique pure —
   la construction de l'écran UI va dans ui.js) ==== */
const CODEX_KEY='cage-legacy-codex';
function loadCodex(){ try{ return JSON.parse(localStorage.getItem(CODEX_KEY))||[]; }catch(e){ return []; } }
function saveToCodex(skillId){
  const unlocked=loadCodex();
  if(!unlocked.includes(skillId)){ unlocked.push(skillId); try{ localStorage.setItem(CODEX_KEY,JSON.stringify(unlocked)); }catch(e){} }
}
function syncPlayerSkillsToCodex(f){ if(!f||!f.skills) return; f.skills.forEach(skillId=>saveToCodex(skillId)); }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT10_SCOUTING] — outils de scouting/analyse (logique — le
   rendu HTML va dans ui.js) ==== */
/* ==== [FIN ANCRE] ==== */

const STYLES={
  boxer:{label:'Boxe',b:{jab:8,cross:9,hook:8,handSpeed:8,footSpeed:5,power:4,tdd:3},grap:0.15},
  kickboxer:{label:'Kickboxing',b:{kick:11,cross:8,clinchStr:7,footSpeed:6,power:5,tdd:4},grap:0.2},
  muayThai:{label:'Muay-thaï',b:{kick:10,clinchStr:10,hook:6,strength:5,durability:5,power:4,tdd:4},grap:0.3},
  karate:{label:'Karaté',b:{footSpeed:6,kick:9,jab:7,power:5,durability:4,fightIQ:4,tdd:3},grap:0.15},
  wrestler:{label:'Lutte',b:{takedown:9,tdd:9,topControl:8,strength:7,cardio:5},grap:0.77},
  bjj:{label:'Jiu-jitsu',b:{submission:10,guardWork:9,gnp:7,flexibility:5,composure:4,power:3,durability:3,tdd:4,takedown:4},grap:0.72},
  sambo:{label:'Sambo',b:{takedown:8,submission:9,topControl:7,strength:6,heart:5,tdd:4},grap:0.66},
  mma:{label:'MMA complet',b:{fightIQ:7,adaptability:7,cardio:7,tdd:8,cross:7,hook:5,takedown:4,kick:5},grap:0.5},
};
const STYLE_KEYS=Object.keys(STYLES);
const styleLabel=s=>(STYLES[s]||{label:s}).label;

/* ------------------------------ NOMS -------------------------------------- */
const COUNTRIES={
 FR:{name:'France',flag:'🇫🇷',last:['Moreau','Lefevre','Dubois','Girard','Faure','Roussel','Blanc','Mercier','Garnier','Leroy','Roux','Dupont','Bernard','Petit','Durand','Leroux']},
 BR:{name:'Brésil',flag:'🇧🇷',last:['Silva','Souza','Oliveira','Costa','Almeida','Pereira','Lima','Rocha','Carvalho','Gomes','Martins','Araujo','Ribeiro','Melo','Cardoso','Dias']},
 US:{name:'États-Unis',flag:'🇺🇸',last:['Johnson','Williams','Brown','Miller','Davis','Wilson','Carter','Reed','Smith','Jones','Taylor','Moore','Jackson','Martin','Lee','Thompson']},
 DAG:{name:'Daghestan',flag:'🏔️',last:['Nurmagomedov','Aliev','Magomedov','Gadzhiev','Ramazanov','Shamilov','Umarov','Makhachev','Gasanov','Kurbanov','Omarov','Isaev']},
 JP:{name:'Japon',flag:'🇯🇵',last:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Kobayashi','Nakamura','Ito','Yamamoto','Saito','Yoshida','Yamada','Sasaki','Yamaguchi']},
 NG:{name:'Nigéria',flag:'🇳🇬',last:['Adeyemi','Okafor','Balogun','Eze','Okoye','Abubakar','Nwosu','Ibrahim','Musa','Bello','Olawale','Abdullahi','Chukwu','Onyeka']},
 GB:{name:'Royaume-Uni',flag:'🇬🇧',last:['Smith','Taylor','Walker','Wright','Hughes','Ward','Bennett','Jones','Williams','Brown','Davies','Evans','Thomas','Roberts']},
 RU:{name:'Russie',flag:'🇷🇺',last:['Volkov','Petrov','Sokolov','Ivanov','Popov','Kozlov','Orlov','Smirnov','Kuznetsov','Lebedev','Novikov','Morozov','Makarov']},
 MX:{name:'Mexique',flag:'🇲🇽',last:['Hernández','García','Martínez','López','Ramírez','Torres','Flores','Pérez','Rodriguez','Sanchez','Cruz','Gomez','Morales','Reyes']},
 IE:{name:'Irlande',flag:'🇮🇪',last:['Murphy','Kelly','OBrien','Byrne','Ryan','Walsh','McCarthy','OSullivan','OConnor','Doyle','Gallagher','Kennedy','Lynch','Murray']},
 TH:{name:'Thaïlande',flag:'🇹🇭',last:['Sittichai','Petchyindee','Kiatmoo','Sor','Rungravee','Saenchai','Banchamek','Srisaket','Tawanchai','Pramuk','Khamsing']},
 KR:{name:'Corée',flag:'🇰🇷',last:['Kim','Lee','Park','Choi','Jung','Kang','Yoon','Jo','Lim','Jang','Shin','Yoo','Han','Kwon']},
 CM:{name:'Cameroun',flag:'🇨🇲',last:['Ngannou','Mbappe','Etoo','Nkemdirim','Fotso','Biya','Kamga','Takam','Ndi','Abate','Tchakoute','Ndong']},
 GE:{name:'Géorgie',flag:'🇬🇪',last:['Dvalishvili','Beridze','Kvaratskhelia','Chikadze','Gogitidze','Maisuradze','Kapanadze','Gelashvili','Bolkvadze','Diasamidze']},
};
const COUNTRY_KEYS=Object.keys(COUNTRIES);
/* ==== [ANCRE: COUNTRY_MMA_PREFIX] — 1re lettre du nom FR, 2 lettres si collision
   (Royaume-Uni/Russie et Corée/Cameroun partagent leur 1re lettre). ==== */
const COUNTRY_MMA_PREFIX={FR:'F',BR:'B',US:'E',DAG:'D',JP:'J',NG:'N',GB:'RO',RU:'RU',MX:'M',IE:'I',TH:'T',KR:'CO',CM:'CA',GE:'G'};
/* ==== [FIN ANCRE] ==== */
const FIRST_M=['Alex','Marcus','Diego','Ivan','Kenji','Samuel','Leon','Rashid','Tariq','Bruno','Kai','Omar','Noah','Yuki','Malik','Hugo','Sean','Nikolai','Andre','Felix','Jamal','Ravi','Enzo','Kofi','Dante'];
const FIRST_F=['Amara','Lena','Sofia','Nadia','Yuki','Maya','Zara','Ana','Ines','Kira','Fatima','Nina','Rosa','Aiko','Elena','Sara','Leïla','Tara','Bianca','Hana'];
function makeName(gender,ck,firstOverride){ const c=COUNTRIES[ck]; const first=firstOverride||pick(gender==='F'?FIRST_F:FIRST_M); const last=pick(c.last); return {first,last,name:first+' '+last,flag:c.flag,countryKey:ck}; }

/* ------------------------- CRÉATION D'UN COMBATTANT ----------------------- */
// ==== [ANCRE: CORRECTIF_ID_UNIQUE] — bug majeur trouvé : l'ancien compteur
// `let _id=1` repartait de 1 à CHAQUE rechargement de page. Le Panthéon
// persiste pourtant en localStorage entre les sessions : deux combattants
// retraités lors de sessions différentes (donc de rechargements différents)
// pouvaient très facilement partager le même id numérique (souvent le tout
// premier combattant créé de chaque session = id 1). Résultat : supprimer UNE
// légende individuellement effaçait TOUTES celles qui partageaient son id, y
// compris — dans le pire cas observé — le Panthéon entier. Remplacé par un
// identifiant réellement unique (horodatage + suffixe aléatoire), stable
// quel que soit le nombre de rechargements.
let _idCounter=0;
function uniqueFighterId(){ _idCounter++; return Date.now().toString(36)+'_'+_idCounter.toString(36)+'_'+Math.random().toString(36).slice(2,8); }
/* ==== [ANCRE: V2-42, lecture (a), point 3] — fréquence des VRAIES anomalies
   (les 4 tirages rnd()<0.02 ci-dessous — pas 'allonge hors-norme', simple
   queue statistique dérivée d'apeIndex>=7, pas un tirage d'anomalie)
   réduite à 0.008 : rarement rencontrée, une anomalie devient un souvenir ;
   rencontrée souvent, c'est un modificateur. Un seul et unique combattant
   ne peut plus cumuler deux anomalies (hasAnomaly, posé dès la première) —
   sans ce garde-fou, réduire la fréquence de chaque tirage individuel
   n'empêchait pas leur cumul (deux tirages à faible probabilité restent
   indépendants). */
function makePhysical(div){ const D=div||pick(allDivisions());
  let height=gauss(D.h,4,D.h-9,D.h+11);
  const tags=[];
  let hasAnomaly=false;
  // Anomalie statistique rare : une taille réellement hors-norme pour la division
  if(!hasAnomaly && rnd()<0.008){ height=D.h+RI(16,24); tags.push('gabarit hors-norme pour la division'); hasAnomaly=true; }
  // Allonge découplée de la taille (indice de singe), plutôt que dérivée de D.h/D.r directement
  let apeIndex=gauss(0,5,-8,12);
  if(!hasAnomaly && rnd()<0.008){ apeIndex=RI(15,22); tags.push('allonge démesurée'); hasAnomaly=true; } // anomalie rare, indépendante de la taille
  let reach=Math.round(height+apeIndex); if(reach<height-1)reach=height-1;
  if(apeIndex>=7 && !tags.includes('allonge démesurée'))tags.push('allonge hors-norme');
  if(!hasAnomaly && rnd()<0.008){ tags.push('densité rare (type Ngannou)'); hasAnomaly=true; }
  if(!hasAnomaly && rnd()<0.008){ tags.push('explosivité rare (type Cormier)'); hasAnomaly=true; }
  return {height,reach,tags};
}
/* ------------------ CUTTING — trait VARIABLE, retiré à chaque combat (pas un
   poids de forme figé à la création) : reflète les fluctuations naturelles
   entre deux camps, moyenne ~9%, profils extrêmes jusqu'à ~24%. ---------------- */
function weightCutInfo(f){ const D=divById(f.div); const limit=D?D.kg:70;
  const cutPct=gauss(9,5,0,24);
  const walk=+(limit/(1-cutPct/100)).toFixed(1);
  const cutKg=+(walk-limit).toFixed(1);
  return {limit,walk,cutKg,cutPct};
}
// ==== [ANCRE: STATS_DEPART_RESSERREES] — item demandé : les attributs de
// départ tombaient parfois très bas (jusqu'à 1/20 sur certains, écart-type
// de 9 sur une échelle /100 avec un plancher à 6). Resserré pour que CHAQUE
// attribut individuel tombe toujours entre 8/20 et 12/20 (40-60/100) à la
// création, potentiel cette fois variable entre 80 et 95 (au lieu de 45-97)
// — c'est le potentiel, pas le niveau de départ, qui doit différencier un
// prospect ordinaire d'un prodige.
// ==== [ANCRE: STATS_DEPART_RESSERREES] — item demandé : les attributs de
// départ d'un COMBATTANT JOUEUR FRAIS tombaient parfois très bas (jusqu'à
// 1/20, écart-type 9 sur une échelle /100 avec un plancher à 6). Un
// paramètre dédié `tightSpread` resserre le tirage UNIQUEMENT pour la
// création d'un nouveau joueur (chaque attribut individuel garanti entre
// 8/20 et 12/20, soit 40-60/100) sans toucher à baseAttrs pour la génération
// des adversaires/roster (qui a besoin de toute l'amplitude 6-96 pour les
// paliers élevés — un adversaire de haut niveau n'est pas concerné par cette
// contrainte, seulement le combattant qu'on incarne).
/** @returns {FighterAttrs} */
function baseAttrs(style,level,predis,tightSpread){ const o={}; const bias=(STYLES[style]||{b:{}}).b;
  const sd=tightSpread?3:9, lo=tightSpread?40:6, hi=tightSpread?60:96;
  for(const k of ATTR_KEYS){ let v=gauss(level, sd, lo, hi); if(bias[k])v=clamp(v+bias[k], lo, hi); o[k]=v; }
  if(predis){ if(predis.includes('densité'))o.power=clamp(o.power+RI(8,16), lo, hi); if(predis.includes('explosivité')){o.explosiveness=clamp(o.explosiveness+RI(8,14), lo, hi);o.takedown=clamp(o.takedown+RI(5,10), lo, hi);} }
  // La boucle ci-dessus remplit dynamiquement les 30 clés de ATTR_KEYS (une
  // affectation calculée `o[k]=v`, que TypeScript ne peut pas prouver
  // statiquement complète même si elle l'est réellement à l'exécution —
  // vérifié par la suite de tests, ex. `un champion qui défend son titre...`
  // et par l'audit de couverture des attributs entraînables cette session).
  // Cast explicite pour le confirmer au vérificateur de types.
  return /** @type {FighterAttrs} */ (o);
}
/** @returns {Fighter} */
function makeFighter(opt={}){ const gender=opt.gender||pick(['H','F']);
  const div=divById(opt.div)|| (gender==='H'?pick(DIVISIONS.H):pick(DIVISIONS.F));
  const style=opt.style||pick(STYLE_KEYS); const ck=opt.countryKey||pick(COUNTRY_KEYS);
  const nm=makeName(gender,ck,opt.first);
  const phys=makePhysical(div);
  // Le tirage resserré s'active automatiquement quand aucun niveau explicite
  // n'est fourni ET que l'appelant le demande via opt.freshPlayer — jamais
  // pour le roster/les adversaires (toujours créés avec un level explicite).
  const level=opt.level!=null?opt.level:gauss(50,3,42,58);
  const attrs=baseAttrs(style,level,phys.tags.join(' '),!!opt.freshPlayer);
  const potential=opt.potential!=null?opt.potential:gauss(87,4,80,95);   // caché
  const dynamic=0;                                                         // moral/forme caché ±
  const mot=pick(MOTIVATIONS); const origin=parseGender(generateContextualOrigin({attrs,phys,countryKey:ck,potential,morale:60}),gender);
  const motivation=parseGender(mot.short,gender);
  /* ==== [ANCRE: FIGHTER_BIO_C14] — Plan V4 LOT 5 §C14 : PERSON_TRAITS
     (data-people.js) n'était lu que pour les coachs/agents/sparrings
     (personMint(), state.js) — un combattant du roster n'avait aucun lore
     lisible nulle part. Trois chaînes STABLES À VIE, posées une seule fois
     ici, à la génération, jamais recalculées ensuite : `bio.origin`/`bio.
     past` reprennent exactement `origin`/`motivation` déjà calculés
     ci-dessus (une seule source, jamais deux versions différentes de la
     même vie) ; `bio.trait` est nouveau, un détail concret et mémorable
     (jamais une phrase générique — même exigence que pour les coachs). */
  const bio={origin,past:motivation,trait:pick(PERSON_TRAITS)};
  const f={ id:uniqueFighterId(), gender, div:div.id, divName:div.name, style, styleLabel:styleLabel(style),
    first:nm.first,last:nm.last,name:nm.name,flag:nm.flag,countryKey:ck,
    phys, attrs, potential, dynamic, morale:60, form:55,
    stage:'amateur', org:0, orgWins:0, age:opt.age!=null?opt.age:RI(18,22),
    W:0,L:0,D:0,ko:0,sub:0,dec:0,koLoss:0,streak:0, champion:null, titles:0, defenses:0,
    skills:[], history:[], origin, motivation, drive:mot.drive, bio, amaRec:null, amaTitle:false, nick:null, epithets:[] };
  f.overall=overall(f);
  f.orgElo=eloBaseline(0,f.overall); f.careerElo=eloBaseline(0,f.overall); f.inactivityCycles=0;
  // ==== [ANCRE: GENETIQUE] — jet unique à la création, jamais via rollSkill ====
  const GENETIC_CHANCE=0.10;
  if(rnd()<GENETIC_CHANCE){
    const genPool=SKILLS.filter(s=>s.fam==='gen');
    if(genPool.length>0) grantSkill(f, genPool[Math.floor(rnd()*genPool.length)]);
  }
  // ==== [FIN ANCRE] ====
  return f;
}

/* ------------------- canaux de combat dérivés des 30 attributs ------------ */
/* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — item demandé : le Gauntlet ne
   connaît plus ni moral ni forme. Neutralisation à la SOURCE plutôt qu'au
   niveau de l'affichage : masquer les deux jauges en laissant `dyn` actif
   aurait produit une mécanique invisible (±10 sur tous les canaux) — exactement
   le travers que l'ancre GAUNTLET_BLESSURE_RUN cherchait à éviter. Le test porte
   sur G.arcade.active, donc il coupe le canal SYMÉTRIQUEMENT pour le joueur et
   pour l'adversaire : aucun des deux camps n'y gagne. La carrière et le mode
   Faith sont strictement inchangés — c'est le seul point du moteur où moral et
   forme entrent dans le calcul de combat. L'usure d'une run passe désormais
   exclusivement par les séquelles d'attributs (GAUNTLET_BLESSURE_RUN), qui sont
   lisibles, arbitrables et déjà en place. ==== */
function eff(f){ const a=f.attrs||{};
  const _arcade=(typeof G!=='undefined' && G && G.arcade && G.arcade.active);
  const dyn=_arcade?0:((num(f.morale)-50)*0.10+(num(f.form)-50)*0.10); // moral/forme -> ± (carrière uniquement)
  const ch={
    striking: num(a.jab)*0.24+num(a.cross)*0.24+num(a.hook)*0.2+num(a.kick)*0.18+num(a.clinchStr)*0.14+num(a.fightIQ)*0.06,
    power:    num(a.power)+num(a.strength)*0.12,
    handSpeed:num(a.handSpeed)*0.85+num(a.footSpeed)*0.15,
    footwork: num(a.footSpeed)*0.8+num(a.flexibility)*0.2,
    clinch:   num(a.clinchStr)*0.8+num(a.strength)*0.2,
    takedown: num(a.takedown)*0.78+num(a.strength)*0.12+num(a.explosiveness)*0.08,
    tdd:      num(a.tdd)*0.88+num(a.strength)*0.08+num(a.flexibility)*0.06+2,
    topControl:num(a.topControl)*0.82+num(a.strength)*0.18,
    ground:   num(a.gnp)*0.82+num(a.power)*0.18,
    submission:num(a.submission)*0.9+num(a.flexibility)*0.1,
    guard:    num(a.guardWork)*0.85+num(a.flexibility)*0.15,
    cardio:   num(a.cardio)*0.82+num(a.recovery)*0.18,
    chin:     num(a.chin)*0.72+num(a.durability)*0.28,
    fightIQ:  num(a.fightIQ)*0.7+num(a.composure)*0.18+num(a.adaptability)*0.12,
    killer:   num(a.killer), heart:num(a.heart), aggression:num(a.aggression),
  };
  for(const k in ch){ if(k!=='chin'&&k!=='killer'&&k!=='heart'&&k!=='aggression') ch[k]=clamp(ch[k]+dyn,1,100); }
  return ch;
}
function overall(f){ const a=f.attrs||{};
  // récompense la spécialisation : le coeur des meilleurs attributs pèse plus
  const vals=ATTR_KEYS.map(k=>num(a[k])).sort((x,y)=>y-x);
  const top=vals.slice(0,10), topAvg=top.reduce((s,v)=>s+v,0)/top.length;
  const allAvg=vals.reduce((s,v)=>s+v,0)/vals.length;
  // ==== [ANCRE: CORRECTIF_PLAFOND_POTENTIEL] — bug remonté : même avec un
  // potentiel élevé (jusqu'à 95, cf. makeFighter), l'OVR affiché dépassait
  // rarement 75. Cause : un malus fixe de -5, appliqué uniformément à TOUS
  // les combattants sans lien avec leur potentiel réel — un combattant à
  // potentiel 95 parfaitement optimisé subissait exactement la même
  // pénalité qu'un combattant à potentiel 80 quelconque. Rien dans le
  // calcul ne reliait ce -5 au potentiel individuel ; il ne faisait que
  // déflater artificiellement tout le monde de 5 points. Supprimé — le
  // plafond individuel par attribut (f.potential+4, cf. applyDeltas)
  // continue de faire tout le travail de limitation par potentiel.
  let ov=topAvg*0.68+allAvg*0.32 + (f.dynamic||0)*0.3;
  return clamp(Math.round(ov),1,100);
}
function groupAvg(f){ const a=f.attrs||{}; const g=k=>Math.round(k.reduce((s,x)=>s+num(a[x[0]]),0)/k.length);
  return {tech:g(ATTR.tech),ment:g(ATTR.ment),phys:g(ATTR.phys)}; }
/* ------------------ MENACE DE FINITION (remplace "Danger") ---------------- */
function getMenace(f){ const a=f.attrs||{};
  const menaceScore=num(a.power)*0.4+num(a.submission)*0.4+num(a.killer)*0.2;
  return clamp(Math.round(menaceScore),1,100);
}

/* ------------------------------- COMBAT ----------------------------------- */
function reachEdge(A,B){ const rA=(A.phys&&A.phys.reach)||175, rB=(B.phys&&B.phys.reach)||175; return clamp((rA-rB)*0.14,-6,6); }
/* ==== [ANCRE: EQUILIBRAGE_MC] - recalibrage Monte-Carlo (audit d'equilibrage).
   Mesure avant/apres sur 10000+ combats simules : victoire ecrasante a 97%
   des un ecart de niveau modere, soumissions quasi jamais declenchees (4%).
   4 leviers touches : seuil/probabilite de mise au sol, sensibilite du KO
   debout, bruit du score par round, chance de soumission au sol - plus une
   modulation par categorie de poids basee sur la vraie taille des divisions
   (pas une liste de noms). Le filtre par style (kickboxer vs kickboxer ne va
   quasiment jamais au sol, wrestler vs wrestler si) etait DEJA correct et n'a
   pas eu besoin d'etre touche - verifie explicitement avant d'y toucher.
   Complété ici par un journal granulaire (plusieurs lignes de texte par
   round, momentum, dégâts par zone tête/corps/jambes) lu par l'arène —
   AUCUNE formule de résolution du combat n'est modifiée, uniquement des
   sous-événements narratifs générés en plus, pour l'affichage. ==== */
function weightFactor(f){ const divs=DIVISIONS[f.gender]||DIVISIONS.H; const d=divById(f.div);
  if(!d) return 0.5;
  const heights=divs.map(x=>x.h); const min=Math.min(...heights), max=Math.max(...heights);
  return max>min ? (d.h-min)/(max-min) : 0.5; }
// ==== [ANCRE: STYLE_PROFILE] — différenciation mécanique des 8 styles (volume de
// frappes, facteur KO, menace de soumission, dégâts clinch/GNP). tdVol
// délibérément absent : STYLES[].grap couvre déjà l'initiative de lutte
// (boxeur 0.15 vs lutteur 0.77, écart ×5) — l'ajouter aurait fait ×48, une
// surcorrection qui aurait quasiment supprimé la lutte chez les boxeurs. ====
const STYLE_PROFILE={
  boxer:{sigVol:1.18,koMod:1.15,subMod:0.10,clinchDmg:0.8,gnpDmg:0.8},
  kickboxer:{sigVol:1.05,koMod:1.20,subMod:0.20,clinchDmg:0.9,gnpDmg:0.8},
  muayThai:{sigVol:0.88,koMod:1.25,subMod:0.30,clinchDmg:1.25,gnpDmg:1.0},
  karate:{sigVol:1.26,koMod:1.52,subMod:0.20,clinchDmg:0.7,gnpDmg:0.7},
  wrestler:{sigVol:0.98,koMod:1.10,subMod:0.40,clinchDmg:1.1,gnpDmg:1.30},
  bjj:{sigVol:0.95,koMod:0.75,subMod:1.98,clinchDmg:0.9,gnpDmg:0.9,guardPull:0.35},
  sambo:{sigVol:0.85,koMod:1.20,subMod:1.30,clinchDmg:1.2,gnpDmg:1.15},
  mma:{sigVol:1.05,koMod:1.05,subMod:1.00,clinchDmg:1.0,gnpDmg:1.0}
};
/* ==== [FIN ANCRE] ==== */
function simulateFight(A,B,rounds=3,plan=null,planB=null,opts=null){ const a=eff(A),b=eff(B);
  /* ==== [ANCRE: IMMUNITE_FINITION_CAMP] — item demandé : passifs de camp
     "impossible à finir" (Familial round 1, Ascétique round 3). Purement
     additif : opts est undefined sur tous les appels existants (carrière,
     fantasy, vs ami, arcade non-coaching), donc leur comportement est
     inchangé à l'identique. immuneA n'empêche que le TIRAGE d'une finition
     contre A pendant CET appel — n'affecte jamais B. ==== */
  const immuneA=!!(opts&&opts.immuneA);
  /* ==== [FIN ANCRE] ==== */
  const profA=A._styleProfileOverride||STYLE_PROFILE[A.style]||STYLE_PROFILE.mma, profB=B._styleProfileOverride||STYLE_PROFILE[B.style]||STYLE_PROFILE.mma;
  const wf=weightFactor(A);
  const koWeightMult=1+(wf-0.5)*0.8;
  const subWeightMult=1+(0.5-Math.abs(wf-0.5))*0.7; // pic d'efficacité au poids moyen (wf≈0.5)
  const noiseWeightMult=1+(wf-0.5)*0.4;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: PLAN_TACTIQUE] — modificateurs du vestiaire (audit §11), appliqués
  // une seule fois sur les canaux de A avant la boucle des rounds. Clés vérifiées
  // contre les canaux réels de eff() : striking, power, footwork/fightIQ (def),
  // takedown (td), tdd, submission (sub), ground (gnp), topControl (ctrl). ====
  let myGi=(STYLES[A.style]||STYLES.mma).grap;
  if(plan){
    if(plan.gi) myGi*=plan.gi;
    if(plan.td) a.takedown*=plan.td;
    if(plan.tdd) a.tdd*=plan.tdd;
    if(plan.str) a.striking*=plan.str;
    if(plan.ko) a.power*=plan.ko;
    if(plan.sub) a.submission*=plan.sub;
    if(plan.gnp) a.ground*=plan.gnp;
    if(plan.ctrl) a.topControl*=plan.ctrl;
    if(plan.def){ a.footwork*=plan.def; a.fightIQ*=plan.def; }
    for(const k in a){ if(typeof a[k]==='number') a[k]=clamp(a[k],1,150); }
  }
  // ==== [ANCRE: PLAN_TACTIQUE_B] — même mécanisme que ci-dessus, côté B cette
  // fois. Sert à l'IA adaptative en rematch (getAdaptiveNPCTactics) qui, faute
  // de ce paramètre, ne pouvait modifier que des canaux jamais lus (eff() étant
  // recalculé en interne à chaque appel de simulateFight, un ajustement fait
  // depuis l'extérieur n'avait aucun effet réel). ====
  if(planB){
    if(planB.td) b.takedown*=planB.td;
    if(planB.tdd) b.tdd*=planB.tdd;
    if(planB.str) b.striking*=planB.str;
    if(planB.ko) b.power*=planB.ko;
    if(planB.sub) b.submission*=planB.sub;
    if(planB.gnp) b.ground*=planB.gnp;
    if(planB.ctrl) b.topControl*=planB.ctrl;
    if(planB.def){ b.footwork*=planB.def; b.fightIQ*=planB.def; }
    for(const k in b){ if(typeof b[k]==='number') b[k]=clamp(b[k],1,150); }
  }
  // ==== [FIN ANCRE] ====
  const giA=myGi, giB=(STYLES[B.style]||STYLES.mma).grap; const rEdge=reachEdge(A,B);
  let sa=0,sb=0,dmgA=0,dmgB=0,finish=null; const log=[];
  // ==== [ANCRE: CHIN_TEMPORAIRE] — un round brutal fragilise le menton pour LE
  // RESTE DE CE COMBAT uniquement (variable locale), jamais l'attribut permanent
  // du combattant : encaisser un round dur ne doit pas user le menton à vie,
  // sans que le joueur en soit jamais informé. ====
  let chinVulnA=0, chinVulnB=0;
  // ==== [FIN ANCRE] ====
  const st={ // statistiques de combat (dmgHead/Body/Legs : purement narratif, additif)
    A:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0},
    B:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0} };
  let momentum=50; // jauge narrative (50=neutre), n'influence aucun calcul de combat
  // ==== [ANCRE: JUGES_10PT] — vrai 10-point must, round par round, 3 juges ====
  const roundStats=[]; let j1A=0,j1B=0,j2A=0,j2B=0,j3A=0,j3B=0;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: ANTI_REPETITION] — évite de tirer deux fois de suite la même phrase ====
  let lastTemplates=[]; // les 2 derniers modèles de phrase (nom neutralisé), pas la chaîne finale
  const normalizeTxt=(txt)=>txt.split(A.name).join('§').split(B.name).join('§');
  const getUniqueLog=(pool)=>{ let txt=pick(pool); let tpl=normalizeTxt(txt); let tries=0;
    while(lastTemplates.includes(tpl)&&tries<8){ txt=pick(pool); tpl=normalizeTxt(txt); tries++; }
    lastTemplates.push(tpl); if(lastTemplates.length>2) lastTemplates.shift();
    return txt; };
  // ==== [FIN ANCRE] ====
  const formatTime=(k,tot)=>{ let sec=300-Math.floor((k/tot)*300); let m=Math.floor(sec/60); let s=sec%60; return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };
  const getTags=f=>(f.skills||[]).map(id=>{ const s=SKILLS.find(x=>x.id===id); return s?(s.tags||[]):[]; }).flat();
  const tagsA=getTags(A), tagsB=getTags(B);
  for(let r=1;r<=rounds && !finish;r++){
    // ==== [ANCRE: JUGES_10PT_SNAP] ====
    const _startSa=sa, _startSb=sb, _kdA0=st.A.kd, _kdB0=st.B.kd, _sigA0=st.A.sig, _sigB0=st.B.sig, _tdA0=st.A.td, _tdB0=st.B.td, _ctrlA0=st.A.ctrl||0, _ctrlB0=st.B.ctrl||0;
    // ==== [FIN ANCRE] ====
    // ==== [ANCRE: MICRO_SEQUENCES] — chaque round de 5 minutes est découpé en 6
    // micro-séquences de 50 secondes. La phase (debout/clinch/sol) persiste
    // d'une séquence à l'autre DANS le même round, mais repart toujours de
    // 'debout' à la cloche — permet de vrais retournements de situation dans
    // un même round (domination debout, takedown, puis sol, par exemple). ====
    let currentPhase='debout', topIsA=false;
    const cardioFactorA=(a.cardio<60)?0.09:0.06, cardioFactorB=(b.cardio<60)?0.09:0.06;
    const roundPenalty=(r>=4)?1.3:1.0;
    for(let k=0;k<6 && !finish;k++){
      const outA=st.A.sig+st.A.tdAtt*0.6, outB=st.B.sig+st.B.tdAtt*0.6;
      const fatA=clamp(((dmgA+outA*0.2)-a.cardio)*cardioFactorA*roundPenalty,0,28);
      const fatB=clamp(((dmgB+outB*0.2)-b.cardio)*cardioFactorB*roundPenalty,0,28);

      if(currentPhase==='sol'){
        const top=topIsA?a:b, bot=topIsA?b:a, topF=topIsA?A:B, botF=topIsA?B:A, topFat=topIsA?fatA:fatB;
        const topProf=topIsA?profA:profB, botProf=topIsA?profB:profA;
        const control=clamp((top.topControl-bot.guard)*0.32,0,11)*0.2;
        const gnp=clamp((top.ground*0.5+top.power*0.45)-bot.guard*0.55-topFat,0,45)*topProf.gnpDmg*0.2;
        const subTop=clamp(top.submission-bot.guard*0.85,0,45)*(1+top.killer*0.004)*topProf.subMod*0.2;
        const subBot=clamp(bot.submission-top.topControl*0.7-top.ground*0.4,0,35)*botProf.subMod*0.2;
        const topPts=1.2+control*0.5+gnp*0.46+subTop*0.22; const botPts=subBot*0.9+clamp(bot.guard-top.topControl,0,22)*0.032+0.6;
        if(topIsA){sa+=topPts;sb+=botPts;dmgB+=gnp*0.32;st.A.ctrl+=0.2;st.A.sig+=Math.round(gnp*0.4);} else {sb+=topPts;sa+=botPts;dmgA+=gnp*0.32;st.B.ctrl+=0.2;st.B.sig+=Math.round(gnp*0.4);}
        const heartR=1-(bot.heart*0.0016);
        const koGnp=clamp((top.power-bot.chin)/56,0,.72)*clamp(gnp/9,0,1)*0.62*(1-bot.fightIQ*0.0022)*heartR*topProf.koMod*0.32;
        const subChT=clamp((top.submission-bot.guard)/17,0,.84)*0.68*(1-bot.fightIQ*0.0022)*topProf.subMod*0.4*subWeightMult;
        const subChB=clamp((bot.submission-top.submission)/42,0,.7)*0.44*(1-top.fightIQ*0.0022)*botProf.subMod*0.4*subWeightMult;
        if(rnd()<subChT && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'Soumission',round:r};(topIsA?st.A:st.B).sub++;}
        else if(rnd()<koGnp && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'KO/TKO',round:r,detail:'coups au sol'};(topIsA?st.B:st.A).kd++;}
        else if(rnd()<subChB && !(immuneA&&topF===A)){finish={by:botF,loser:topF,method:'Soumission',round:r,detail:'par le bas'};(topIsA?st.B:st.A).sub++;}
        const isMe=topIsA; momentum=clamp(momentum+(isMe?RI(3,8):-RI(3,8)),5,95);
        const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
        tgt.dmgBody+=RI(0,2); tgt.dmgHead+=RI(0,1);
        let txtPool=[`${atk.name} consolide son contrôle.`,`${atk.name} maintient une lourde pression.`,`Lutte de position : ${atk.name} prend l\u2019avantage.`,`${atk.name} verrouille les hanches de son adversaire.`];
        if(tgs.includes('GNP')) txtPool.push(`${atk.name} fait pleuvoir un lourd Ground & Pound.`);
        if(tgs.includes('Soumission')) txtPool.push(`${atk.name} cherche l\u2019ouverture pour soumettre.`);
        if(top.topControl>bot.guard+20){
          txtPool.push(`${atk.name} plie ${def.name} au sol comme un vulgaire origami. L\u2019écart technique est embarrassant.`);
        }
        const botFat=topIsA?fatB:fatA;
        if(botFat>15 || bot.cardio<40){
          txtPool.push(`Écrasé sous le poids adverse, ${def.name} cherche de l\u2019oxygène qui n\u2019existe plus.`);
        }
        log.push({r,phase:'sol',top:topIsA?'A':'B',by:isMe?'me':'op',text:`[${formatTime(k,6)}] `+getUniqueLog(txtPool),momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
          last.text=`[00:00] [CRITIQUE] L\u2019arbitre s\u2019interpose ! Victoire par ${finish.method} de ${finish.by.name}.`; }
        else {
          const evadeCh=clamp((bot.footwork+bot.fightIQ-topFat*0.5)/280,0.06,0.28);
          if(rnd()<evadeCh){ if(rnd()<0.5){ topIsA=!topIsA; } else { currentPhase='debout'; } }
        }
      } else if(currentPhase==='clinch'){
        const clinchA=(a.clinch*0.6+a.striking*0.25+a.power*0.15)*profA.clinchDmg-fatA;
        const clinchB=(b.clinch*0.6+b.striking*0.25+b.power*0.15)*profB.clinchDmg-fatB;
        const diff=clinchA-clinchB;
        if(Math.abs(diff)>8){
          const domIsA=diff>0; const dom=domIsA?A:B;
          const hits=RI(0,4); (domIsA?st.A:st.B).sig+=hits; if(domIsA) dmgB+=hits*1.8; else dmgA+=hits*1.8;
          (domIsA?st.B:st.A).dmgBody+=RI(0,2);
          momentum=clamp(momentum+(domIsA?RI(3,7):-RI(3,7)),5,95);
          if(rnd()<0.28){ currentPhase='sol'; topIsA=domIsA; (domIsA?st.A:st.B).td++;
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(k,6)}] ${dom.name} utilise son contrôle en clinch pour amener au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            const clinchTxt=getUniqueLog([
              `${dom.name} étouffe son adversaire contre le grillage.`,
              `Lutte rugueuse le long de la cage à l\u2019avantage de ${dom.name}.`,
              `${dom.name} pèse de tout son poids et place de petits coups vicieux.`,
              `Le clinch s\u2019éternise, ${dom.name} grignote l\u2019énergie adverse.`,
              `${dom.name} domine contre la cage avec ${hits} coups courts.`
            ]);
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(k,6)}] ${clinchTxt}`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else {
          currentPhase='debout';
          log.push({r,phase:'clinch',by:'me',text:`[${formatTime(k,6)}] Séparation, le combat reprend au centre de la cage.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else { // debout
        const attA=giA*(0.55+rnd()*0.45), attB=giB*(0.55+rnd()*0.45);
        let handled=false;
        if(attA>0.14 && rnd()<0.18){ st.A.tdAtt++; handled=true;
          const tdChanceA=sigmoid((a.takedown-b.tdd)/15)*attA;
          if(rnd()<clamp(tdChanceA,0.05,0.85)){ st.A.td++; currentPhase='sol'; topIsA=true;
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(k,6)}] Takedown validé par ${A.name} !`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(k,6)}] Bonne défense de ${B.name} sur la tentative d\u2019amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else if(attB>0.14 && rnd()<0.18){ st.B.tdAtt++; handled=true;
          const tdChanceB=sigmoid((b.takedown-a.tdd)/15)*attB;
          if(rnd()<clamp(tdChanceB,0.05,0.85)){ st.B.td++; currentPhase='sol'; topIsA=false;
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(k,6)}] Takedown explosif de ${B.name}, le combat passe au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(k,6)}] ${A.name} repousse une tentative d\u2019amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        }
        if(!handled && currentPhase==='debout'){
          const offA=(a.striking*0.72+a.power*0.35+a.handSpeed*0.22+a.footwork*0.14+a.clinch*0.14*profA.clinchDmg+rEdge*0.85-b.footwork*0.2-b.fightIQ*0.14-fatA)*profA.sigVol;
          const offB=(b.striking*0.72+b.power*0.35+b.handSpeed*0.22+b.footwork*0.14+b.clinch*0.14*profB.clinchDmg-rEdge*0.85-a.footwork*0.2-a.fightIQ*0.14-fatB)*profB.sigVol;
          const noiseAmt=Math.round(6*noiseWeightMult);
          const pA=clamp(offA*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20), pB=clamp(offB*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20);
          sa+=pA;sb+=pB;dmgA+=clamp(offB*0.22*0.22,0,6);dmgB+=clamp(offA*0.22*0.22,0,6);
          st.A.sig+=clamp(Math.round(pA*0.5),0,10); st.B.sig+=clamp(Math.round(pB*0.5),0,10);
          const koA=clamp((a.power-(b.chin-chinVulnB))/62,0,.93)*clamp((offA-offB)/62+0.46,0,1)*0.6*koWeightMult*(1-b.fightIQ*0.0022)*(1+a.killer*0.003)*(1-b.heart*0.0016)*profA.koMod*0.22;
          const koB=clamp((b.power-(a.chin-chinVulnA))/62,0,.93)*clamp((offB-offA)/62+0.46,0,1)*0.6*koWeightMult*(1-a.fightIQ*0.0022)*(1+b.killer*0.003)*(1-a.heart*0.0016)*profB.koMod*0.22;
          const isKdA=rnd()<koA*1.5, isKdB=!isKdA&&rnd()<koB*1.5;
          let kdText=null;
          if(isKdA){ st.A.kd++; if(rnd()<0.6){ finish={by:A,loser:B,method:'KO/TKO',round:r}; } else kdText={by:'me',txt:`${A.name} envoie ${B.name} au tapis, mais l\u2019arbitre laisse le combat continuer !`}; }
          else if(isKdB){ st.B.kd++; if(!immuneA && rnd()<0.6){ finish={by:B,loser:A,method:'KO/TKO',round:r}; } else kdText={by:'op',txt:`${B.name} envoie ${A.name} au tapis, mais l\u2019arbitre laisse le combat continuer !`}; }
          const isMe=rnd()<(offA/(offA+offB+1));
          momentum=clamp(momentum+(isMe?RI(4,9):-RI(4,9)),5,95);
          const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
          const rDmg=rnd(); if(rDmg<0.4) tgt.dmgHead+=RI(1,3); else if(rDmg<0.7) tgt.dmgBody+=RI(1,3); else tgt.dmgLegs+=RI(1,3);
          let satirePool=[];
          if(atk.attrs.fightIQ>def.attrs.fightIQ+20){
            satirePool.push(`${atk.name} donne une leçon de géométrie à un adversaire qui ne sait pas lire les angles.`,`${atk.name} feinte le jab, ${def.name} réagit avec deux secondes de retard.`);
          }
          if(atk.attrs.power>85 && def.attrs.chin<50){
            satirePool.push(`La droite de ${atk.name} teste la validité de l\u2019assurance santé de ${def.name}.`,`Chaque impact de ${atk.name} entame sérieusement le capital neuronal de ${def.name}.`);
          }
          if(atk.style==='karate'){
            satirePool.push(`${atk.name} fait des bonds de kangourou et claque un kick insaisissable.`,`Garde au niveau des genoux, arrogance au maximum, ${atk.name} touche en premier.`);
          }
          if(satirePool.length===0){
            satirePool=[`${atk.name} touche avec une belle combinaison.`,`${atk.name} trouve l\u2019ouverture en striking.`,`Superbe échange remporté par ${atk.name}.`,`Le bras arrière de ${atk.name} fait mouche.`,`${atk.name} casse la distance et punit.`,`${tgs.includes('Kick')?atk.name+' claque un lourd kick.':atk.name+' place une combinaison nette.'}`];
          }
          let txt=kdText?kdText.txt:getUniqueLog(satirePool);
          log.push({r,phase:'debout',by:kdText?kdText.by:(isMe?'me':'op'),text:`[${formatTime(k,6)}] `+txt,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
            last.text=`[00:00] [CRITIQUE] KO foudroyant de ${finish.by.name} !`; }
          else if(rnd()<0.15){ currentPhase='clinch'; }
        }
      }
    }
    // ==== [FIN ANCRE] ====
    if(dmgA>45&&rnd()<.4)chinVulnA+=8;
    if(dmgB>45&&rnd()<.4)chinVulnB+=8;
    // ==== [ANCRE: JUGES_10PT_SCORE] — 10-9 par défaut, 10-8 si domination nette, 10-7 en cas extrême ====
    const rSigA=st.A.sig-_sigA0, rSigB=st.B.sig-_sigB0;
    const rTdA=st.A.td-_tdA0, rTdB=st.B.td-_tdB0;
    const rCtrlA=(st.A.ctrl||0)-_ctrlA0, rCtrlB=(st.B.ctrl||0)-_ctrlB0;
    const kdDiff=(st.A.kd-_kdA0)-(st.B.kd-_kdB0);
    // Règles unifiées MMA : le dommage prime sur le contrôle positionnel.
    // 1 amenée = 1.5 frappe sig, 1 round complet de contrôle (1.2) = ~3.6 pts (critère secondaire)
    const rDiff=(rSigA-rSigB)+(rTdA-rTdB)*1.5+(rCtrlA-rCtrlB)*3;
    let sA=10,sB=10;
    if((rDiff>44&&kdDiff>=0)||kdDiff>=3){ sA=10;sB=7; }
    else if((rDiff>32&&kdDiff>=0)||kdDiff>=2){ sA=10;sB=8; }
    else if((rDiff>3&&kdDiff>=0)||kdDiff===1){ sA=10;sB=9; }
    else if((rDiff<-44&&kdDiff<=0)||kdDiff<=-3){ sA=7;sB=10; }
    else if((rDiff<-32&&kdDiff<=0)||kdDiff<=-2){ sA=8;sB=10; }
    else if((rDiff<-3&&kdDiff<=0)||kdDiff===-1){ sA=9;sB=10; }
    else if(rDiff>0){ sA=10;sB=9; } // bande serrée mais A garde un léger avantage réel
    else if(rDiff<0){ sA=9;sB=10; } // bande serrée mais B garde un léger avantage réel
    else { if(rnd()<0.5){sA=10;sB=9;} else {sA=9;sB=10;} } // égalité mathématique exacte, rarissime
    let j1=[sA,sB], j2=[sA,sB], j3=[sA,sB];
    // Dissidence des juges : la probabilité baisse avec l'écart du round mais
    // n'atteint jamais 0% — même un round net (10-7/10-8) peut voir un juge
    // s'écarter d'un point. Avant, la dissidence n'était possible QUE sur les
    // rounds ultra-serrés (|rDiff|<=6), rendant l'unanimité totale obligatoire
    // sur tout round net — confirmé irréaliste (3 juges identiques à chaque
    // round d'un combat entier n'arrive jamais en vrai MMA).
    const margin=Math.max(Math.abs(rDiff),Math.abs(kdDiff)*20);
    const dissent2=clamp(0.35-margin*0.004,0.04,0.35);
    const dissent3=clamp(0.15-margin*0.002,0.02,0.15);
    // ==== [ANCRE: CORRECTIF_DISSIDENCE_NOOP] — bug remonté ("les juges scorent
    // toujours de manière identique") : l'ancienne formule
    // [sB===10?9:10, sA===10?9:10] retombait EXACTEMENT sur [sA,sB] pour le cas
    // le plus fréquent de tous (round serré 10-9/9-10) — vérifié : sA=10,sB=9
    // donnait [10,9], identique à la majorité. Le tirage dissent2/dissent3
    // réussissait donc régulièrement sans jamais rien changer à l'affichage.
    // Nouvelle règle, conforme au commentaire d'intention ci-dessus : sur un
    // round déjà serré (10-9), le seul écart réaliste pour un juge est de
    // basculer le round à l'adversaire (9-10) — pas de palier intermédiaire
    // possible. Sur un round net (10-7/10-8), le juge dissident adoucit d'un
    // point sans changer de vainqueur (10-8/10-9), comme décrit plus haut.
    // ==== [ANCRE: CORRECTIF_DISSIDENCE_LANDSLIDE] — bug remonté : un round
    // classé 10-9 ("serré") pouvait être intégralement inversé par un juge
    // dissident même quand rDiff montrait déjà une domination nette (ex.
    // 18-3 en frappes significatives), simplement parce que ce rDiff restait
    // sous le seuil >32 requis pour basculer en 10-8. Un round proche de ce
    // palier (|rDiff|>20, plus de la moitié du chemin vers 10-8) n'est plus
    // assez "serré" pour justifier un renversement complet du vainqueur —
    // seuls les rounds vraiment courus (|rDiff|<=20) restent inversables.
    const dissentJudge=()=>{
      if(sA===10 && sB===9) return (Math.abs(rDiff)>20 ? [sA,sB] : [9,10]);
      if(sB===10 && sA===9) return (Math.abs(rDiff)>20 ? [sA,sB] : [10,9]);
      if(sA===10 && sB<9) return [10,sB+1];
      if(sB===10 && sA<9) return [sA+1,10];
      return [sA,sB];
    };
    if(rnd()<dissent2) j2=dissentJudge();
    if(rnd()<dissent3) j3=dissentJudge();
    j1A+=j1[0];j1B+=j1[1];j2A+=j2[0];j2B+=j2[1];j3A+=j3[0];j3B+=j3[1];
    roundStats.push({r,j1,j2,j3,sigA:st.A.sig-_sigA0,sigB:st.B.sig-_sigB0,tdA:st.A.td-_tdA0,tdB:st.B.td-_tdB0,kdA:st.A.kd-_kdA0,kdB:st.B.kd-_kdB0});
    // ==== [ANCRE: RECUP_INTER_ROUND] — la minute de repos entre rounds allège
    // une partie des dégâts accumulés, proportionnellement à la vraie stat de
    // récupération (pas la fatigue/cardio, qui reste dérivée à chaque round). ====
    dmgA=Math.max(0,dmgA-(A.attrs.recovery||50)*0.15);
    dmgB=Math.max(0,dmgB-(B.attrs.recovery||50)*0.15);
    // ==== [FIN ANCRE] ====
  }
  let res;
  if(finish){
    const loserSt=(finish.loser===A)?st.A:st.B;
    const zones={tête:loserSt.dmgHead,corps:loserSt.dmgBody,jambes:loserSt.dmgLegs};
    const finishZone=Object.keys(zones).reduce((a,b)=>zones[b]>zones[a]?b:a,'tête');
    finish.zone=finishZone;
    const finishMove=pickFinishMove(finish.by, finish.method==='Soumission'?'sub':'ko', finishZone, st, finish.round);
    finish.moveName=finishMove.name; finish.moveFlavor=finishMove.flavor;
    /* ==== [ANCRE: CORRECTIF_ZONE_AFFICHEE] — zone anatomique NARRÉE = celle du
       geste joué (finishMove.moveZone), pas celle des dégâts cumulés. Repli sur
       finishZone si le geste n'est référencé dans aucune table. ==== */
    const shownZone=finishMove.moveZone||finishZone;
    res={winner:finish.by===A?'A':'B',method:finish.method,round:finish.round,detail:finish.detail||'',moveName:finish.moveName,moveFlavor:finish.moveFlavor,zone:shownZone}; }
  else {
    // ==== [ANCRE: JUGES_10PT_VERDICT] — le vainqueur vient du vote MAJORITAIRE des
    // juges (pas d'un total sa/sb caché), pour que les cartes affichées soient
    // toujours cohérentes avec le résultat annoncé. ====
    const votesA=[j1A>j1B,j2A>j2B,j3A>j3B].filter(Boolean).length;
    const votesB=[j1A<j1B,j2A<j2B,j3A<j3B].filter(Boolean).length;
    if(votesA===votesB){ res={winner:'D',method:'Égalité'}; }
    else { const winnerSide=votesA>votesB?'A':'B'; const unanimous=votesA===3||votesB===3;
      res={winner:winnerSide,method:unanimous?'Décision':'Décision partagée'}; }
    // ==== [FIN ANCRE] ====
  }
  res.scoreA=j1A+j2A+j3A; res.scoreB=j1B+j2B+j3B;
  res.judges={j1:[j1A,j1B],j2:[j2A,j2B],j3:[j3A,j3B]}; res.roundStats=roundStats;
  res.log=log; res.stats=st;
  return res;
}
function applyResult(F,opp,res,side){ const isDraw=res.winner==='D'; const win=!isDraw&&res.winner===side; const m=res.method;
  if(isDraw){ F.D=(F.D||0)+1; F.morale=clamp(F.morale+RI(-2,2),0,100); }
  else if(win){ F.W++; F.streak=Math.max(1,F.streak+1); if(m.startsWith('KO'))F.ko++; else if(m.startsWith('Soum'))F.sub++; else F.dec++; F.morale=clamp(F.morale+RI(6,12),0,100); }
  else { F.L++; F.streak=Math.min(-1,F.streak-1); if(m.startsWith('KO'))F.koLoss++; F.morale=clamp(F.morale-RI(8,16),0,100); }
  /* ==== [ANCRE: V2-38] — "bilan maison" par organisation, en plus du
     palmarès pro global (F.W/F.L, qui ne se remet jamais à zéro après le
     seul passage amateur→pro, turnPro()) : un nouvel objectif de
     progression demandé par le document, jamais un remplacement du
     palmarès existant. Réservé au joueur en carrière pro (F===G.f, jamais
     les PNJ simulés par advanceRoster()/rankPool() ni les combats Faith/
     Gauntlet, hors périmètre de cet item). ==== */
  if(typeof G!=='undefined' && G && F===G.f && F.stage==='pro' && F.org>0){
    if(!F.orgRecords) F.orgRecords={};
    const rec=F.orgRecords[F.org]||(F.orgRecords[F.org]={W:0,L:0,D:0});
    if(isDraw) rec.D=(rec.D||0)+1; else if(win) rec.W++; else rec.L++;
  }
  F.form=clamp(F.form+(win?RI(3,8):isDraw?0:-RI(5,12)),0,100);
  // ==== [ANCRE: META04_06] — planchers de moral. Le jeu n'a pas de système de
  // popularité distinct : ces deux compétences sont adaptées sur `morale`,
  // le champ existant le plus proche (au lieu d'un f.pop qui n'existe pas). ====
  if(F.skills&&F.skills.includes('meta06')){ if(F.morale<75) F.morale=75; }
  else if(F.skills&&F.skills.includes('meta04')){ if(F.morale<45) F.morale=45; }
  // ==== [FIN ANCRE] ====
  // OPTIMISATION MÉMOIRE — seul le profil du joueur conserve l'historique narratif
  // détaillé (vérifié : aucun affichage ne lit jamais l'historique d'un PNJ, seuls
  // last5()/scr_history()/l'succès a4 lisent G.f.history spécifiquement).
  if(G.f && F.id===G.f.id){
    F.history.push({res:isDraw?'draw':(win?'win':'loss'),method:m,round:res.round||null,oppId:opp&&opp.id,
      oppName:opp&&opp.name,oppFlag:opp&&opp.flag,oppWasChamp:!!(opp&&opp.champion),oppRecord:opp?`${opp.W}-${opp.L}`:null,oppElo:opp&&opp.orgElo});
    if(F.history.length>60)F.history=F.history.slice(-60);
  }
  return win;
}
/* ------------------ FINISHERS SIGNATURE — noms de finish débloqués par compétence ---------------- */
const FINISH_MOVES={
 sub:[
  {id:'bjj29',name:'étranglement Anaconda',zone:'tête'},{id:'bjj30',name:'Peruvian Necktie',zone:'tête'},
  {id:'bjj35',name:'clé de cheville éclair',zone:'jambes'},{id:'bjj36',name:'Twister',zone:'jambes'},
  {id:'bjj39',name:'étranglement invisible',zone:'tête'},{id:'bjj40',name:'toile de soumissions sans fin',zone:'tête'},
  {id:'sambo29',name:'clé arrachée à la force brute',zone:'jambes'},{id:'sambo35',name:'clé de jambe fatale',zone:'jambes'},
  {id:'sambo38',name:'broyage articulaire',zone:'jambes'},{id:'sambo40',name:'double clé du Dernier Empereur',zone:'jambes'},
 ],
 ko:[
  {id:'karate28',name:'direct du samouraï',zone:'tête'},{id:'karate20',name:'coup de pied en crochet à l\u2019angle mort',zone:'tête'},
  {id:'boxer28',name:'crochet qui termine tout',zone:'tête'},{id:'boxer33',name:'uppercut surgi de nulle part',zone:'tête'},
  {id:'boxer36',name:'frappe qu\u2019on ne voit jamais partir',zone:'tête'},{id:'boxer40',name:'coup de l\u2019Interrupteur',zone:'tête'},
  {id:'kb28',name:'high kick mortel',zone:'tête'},{id:'kb40',name:'tibia du Cro Cop',zone:'tête'},
  {id:'mt30',name:'coude du chirurgien',zone:'tête'},{id:'mt35',name:'genou assassin',zone:'corps'},{id:'mt40',name:'tibia de l\u2019Héritier de Buakaw',zone:'jambes'},
  {id:'wrestler40',name:'takedown destructeur',zone:'corps'},{id:'sambo37',name:'enclume du Tsar',zone:'corps'},
  {id:'mma30',name:'Ground and Pound de l\u2019enfer',zone:'tête'},{id:'mma37',name:'instinct de destruction',zone:'tête'},
 ]
};
// ==== [ANCRE: FINITIONS_GENERIQUES_REFONTE] — remplace l'ancien pool de
// finitions génériques (qui mélangeait noms de coups et phrases descriptives,
// ex. "crochet au foie qui coupe les jambes") par des noms de coups PROPRES
// uniquement — chacun avec sa propre variante "signature" dédiée (voir
// MOVE_SIGNATURE_FLAVOR ci-dessous), au lieu d'un message générique unique.
const GENERIC_SUB=[
  {name:'Kimura',zone:'corps'},{name:'Americana',zone:'corps'},{name:'Armbar',zone:'corps'},
  {name:'Triangle',zone:'tête'},{name:'Rear Naked Choke',zone:'tête'},{name:'Guillotine',zone:'tête'},
  {name:'Anaconda',zone:'tête'},{name:'Twister',zone:'corps'},{name:'Heel Hook',zone:'jambes'},
  {name:'Clé de cheville',zone:'jambes'}
];
const GENERIC_KO=[
  {name:'Crochet',zone:'tête'},{name:'Uppercut',zone:'tête'},{name:'Overhand',zone:'tête'},
  {name:'Jab chanceux',zone:'tête'},{name:'Direct puissant',zone:'tête'},{name:'Marteau au sol',zone:'tête'},
  {name:'Coup de genou sauté',zone:'tête'},{name:'Coup de coude retourné',zone:'tête'},
  {name:'Coup de pied au corps',zone:'corps'},{name:'Coup de genou au corps',zone:'corps'},{name:'Crochet au foie',zone:'corps'},
  {name:'Low kick',zone:'jambes'},{name:'Calf kick',zone:'jambes'},
  {name:'High kick',zone:'tête'},{name:'Coup de pied retourné',zone:'tête'},{name:'Superman punch',zone:'tête'}
];
// Une variante narrative dédiée par coup, utilisée à la fois pour le
// déblocage du mouvement signature et pour ses répétitions ultérieures.
const MOVE_SIGNATURE_FLAVOR={
  'Crochet':'Le crochet est devenu sa signature — un mensonge qui arrive toujours de là où on l\u2019attend.',
  'Uppercut':'L\u2019uppercut est devenu sa signature — droit sous le menton, à chaque fois.',
  'Overhand':'L\u2019overhand est devenu sa signature — une bombe qui passe par-dessus la garde.',
  'Jab chanceux':'Le jab chanceux est devenu sa signature — un coup de rien qui finit tout.',
  'Direct puissant':'Le direct puissant est devenu sa signature — la ligne la plus courte vers le KO.',
  'Marteau au sol':'Le marteau au sol est devenu sa signature — implacable une fois l\u2019adversaire à terre.',
  'Coup de genou sauté':'Le genou sauté est devenu sa signature — personne ne voit le décollage venir.',
  'Coup de coude retourné':'Le coude retourné est devenu sa signature — un geste qu\u2019on ne voit qu\u2019une fois.',
  'Coup de pied au corps':'Le coup de pied au corps est devenu sa signature — il vide les poumons un round à l\u2019avance.',
  'Coup de genou au corps':'Le genou au corps est devenu sa signature — plié en deux, à chaque clinch.',
  'Crochet au foie':'Le crochet au foie est devenu sa signature — personne ne s\u2019en relève à temps.',
  'Low kick':'Le low kick est devenu sa signature — il ne casse pas l\u2019adversaire, il l\u2019use.',
  'Calf kick':'Le calf kick est devenu sa signature — la jambe d\u2019appui cède avant le mental.',
  'High kick':'Le high kick est devenu sa signature — une explosion qui vient de nulle part.',
  'Coup de pied retourné':'Le coup de pied retourné est devenu sa signature — le dos tourné, l\u2019instant d\u2019avant.',
  'Superman punch':'Le superman punch est devenu sa signature — il s\u2019envole avant de frapper.',
  'Kimura':'Le kimura est devenu sa signature — l\u2019épaule cède avant la fierté.',
  'Americana':'L\u2019americana est devenue sa signature — le bras plaqué au sol, sans échappatoire.',
  'Armbar':'L\u2019armbar est devenu sa signature — le coude tendu jusqu\u2019au point de rupture.',
  'Triangle':'Le triangle est devenu sa signature — les jambes se referment, l\u2019air disparaît.',
  'Rear Naked Choke':'Le rear naked choke est devenu sa signature — accroché dans le dos, inévitable.',
  'Guillotine':'La guillotine est devenue sa signature — la tête coincée dès le premier contact.',
  'Anaconda':'L\u2019anaconda est devenu sa signature — un étau qui se resserre sans prévenir.',
  'Twister':'Le twister est devenu sa signature — la colonne tordue jusqu\u2019à l\u2019abandon.',
  'Heel Hook':'Le heel hook est devenu sa signature — le genou cède avant que ça fasse mal.',
  'Clé de cheville':'La clé de cheville est devenue sa signature — la cheville plie, l\u2019adversaire tape.'
};
function pickFinishMove(winner,type,zone,fightStats,round){ // type: 'sub' ou 'ko' — priorité aux compétences signature possédées, puis à la zone la plus endommagée
  // Mouvement signature (#6) : si le combattant a déjà déverrouillé une prise
  // signature (5 finitions identiques auparavant), 40% de chance de la rejouer
  // directement plutôt que de repartir sur le tirage normal.
  /* ==== [ANCRE: CORRECTIF_ZONE_AFFICHEE] — bug remonté : « Soumission (clé de
     jambe fatale) — CORPS ». La zone AFFICHÉE venait de res.zone (zone la plus
     endommagée du perdant), jamais du geste réellement joué. Trois chemins la
     désynchronisaient : (1) le rejeu de signature ci-dessous ne renvoyait
     aucune zone, (2) le repli `candidates=owned` quand aucun geste possédé ne
     matche la zone, (3) le repli `pick(generic)` quand aucun générique ne
     matche. On renvoie désormais la zone PROPRE du geste choisi ; l'appelant
     s'en sert pour l'affichage. La zone de dégâts reste inchangée côté
     mécanique (SIGNATURE_BOOST_BY_ZONE lit toujours `zone`). ==== */
  const zoneOfGeneric=n=>{ const g=(type==='sub'?GENERIC_SUB:GENERIC_KO).find(m=>m.name===n); return g?g.zone:null; };
  const zoneOfOwned=n=>{ const o=FINISH_MOVES[type].find(m=>m.name===n); return o?o.zone:null; };
  if(winner.signatureMove && winner.signatureMove.type===type && rnd()<0.40){
    const _n=winner.signatureMove.name;
    return {name:_n, moveZone:zoneOfOwned(_n)||zoneOfGeneric(_n)||winner.signatureMove.zone||null, flavor:MOVE_SIGNATURE_FLAVOR[_n]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.'};
  }
  const owned=(winner.skills||[]).filter(id=>FINISH_MOVES[type].some(m=>m.id===id));
  let baseMove;
  // ==== [ANCRE: CORRECTIF_ZONE_MOUVEMENT_ACQUIS] — bug trouvé : un geste
  // possédé (compétence débloquée) était choisi sans jamais vérifier sa zone
  // propre contre la zone réellement la plus endommagée (finishZone) — un
  // Heel Hook (jambes) pouvait ainsi être narré sur un KO déclenché par des
  // dégâts à la tête. On restreint désormais la sélection aux gestes possédés
  // dont la zone correspond, quand au moins un correspond ; sinon on retombe
  // sur l'ensemble des gestes possédés (mieux vaut un geste possédé mal zoné
  // qu'un geste totalement générique).
  if(owned.length && rnd()<0.6){
    let candidates=owned;
    if(zone){ const zoneMatches=owned.filter(id=>FINISH_MOVES[type].find(m=>m.id===id).zone===zone); if(zoneMatches.length) candidates=zoneMatches; }
    const chosenId=pick(candidates); baseMove=FINISH_MOVES[type].find(m=>m.id===chosenId).name;
  }
  else{ const generic=type==='sub'?GENERIC_SUB:GENERIC_KO; const zoned=zone?generic.filter(m=>m.zone===zone):[]; baseMove=(zoned.length?pick(zoned):pick(generic)).name; }
  // Comptage des finitions identiques — au 5e succès avec le même geste, il
  // devient signature : compétence unique + boost de stat + 40% de retour
  // automatique désormais géré ci-dessus.
  if(!winner.finishMoveCounts) winner.finishMoveCounts={};
  const key=type+':'+baseMove;
  winner.finishMoveCounts[key]=(winner.finishMoveCounts[key]||0)+1;
  let flavor=null;
  if(!winner.signatureMove && winner.finishMoveCounts[key]>=5){
    /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
       customSuffix (null tant que le joueur n'a pas validé un complément
       libre) et locked (figé une fois validé, cf. CL.setSignatureSuffix
       ci-dessous dans ui-08). Le nom de base (baseMove) n'est JAMAIS
       remplacé — customSuffix s'affiche uniquement en complément. ==== */
    winner.signatureMove={name:baseMove,type,zone,customSuffix:null,locked:false};
    /* ==== [FIN ANCRE] ==== */
    // ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_DIFFERENCIE] — bug trouvé : TOUS
    // les mouvements signature donnaient exactement le même boost (submission+
    // killer pour toute soumission, power+killer pour tout KO), peu importe le
    // geste réel. Le boost dépend désormais de la ZONE ciblée par le geste
    // (tête/corps/jambes), cohérent avec ce que le geste représente : une
    // soumission à la tête (étranglement) récompense le cardio/contrôle, une
    // soumission au corps (clé de bras) récompense la force, une soumission
    // aux jambes récompense l'explosivité ; un KO à la tête récompense la
    // puissance pure, au corps l'endurance à encaisser en pression, aux jambes
    // l'explosivité des coups de pied. Table définie une seule fois au niveau
    // module (SIGNATURE_BOOST_BY_ZONE plus bas) — réutilisée telle quelle par
    // signatureMoveCard() côté affichage, pour ne jamais désynchroniser le
    // texte montré au joueur du boost réellement appliqué.
    const boostKeys=(SIGNATURE_BOOST_BY_ZONE[type]&&SIGNATURE_BOOST_BY_ZONE[type][zone])||(type==='sub'?['submission','killer']:['power','killer']);
    boostKeys.forEach(k=>{ winner.attrs[k]=clamp((winner.attrs[k]||50)+SIGNATURE_BOOST_PTS,1,100); });
    winner.overall=overall(winner);
    const skillId='sig_'+baseMove.replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,20);
    if(!(winner.skills||[]).includes(skillId)){
      grantSkill(winner,{id:skillId,name:baseMove+' (Signature)',rar:'M',fx:{},desc:`${winner.name} a répété ce geste jusqu\u2019à le rendre inévitable : ${baseMove}, désormais sa marque de fabrique.`,tags:['Signature']});
    }
    flavor=`MOUVEMENT SIGNATURE DÉBLOQUÉ : ${MOVE_SIGNATURE_FLAVOR[baseMove]||baseMove+' devient sa marque de fabrique.'}`;
  }
  // ==== [ANCRE: CORRECTIF_FLAVOR_SIGNATURE_MANQUANT] — bug trouvé : le texte
  // signature ne s'affichait QUE dans deux cas précis : le tout premier
  // déblocage (une fois dans toute la carrière), et le chemin de "rejeu
  // délibéré" (40% de chance, tiré au tout début de la fonction). Si le geste
  // signature était retrouvé par le tirage normal (les 60% restants — d'où le
  // "2/3 du temps" remonté), aucun texte n'était attaché, alors que c'était
  // pourtant bien le même geste. On rattache maintenant systématiquement le
  // flavor signature dès que baseMove correspond au geste signature déjà
  // déverrouillé, quel que soit le chemin qui l'a sélectionné.
  if(!flavor && winner.signatureMove && winner.signatureMove.type===type && winner.signatureMove.name===baseMove){
    flavor=MOVE_SIGNATURE_FLAVOR[baseMove]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.';
  }
  if(fightStats && !flavor){
    const isLate=(round||1)>=3;
    const isBloodbath=(fightStats.A.dmgHead+fightStats.B.dmgHead)>40;
    const isBoring=(fightStats.A.sig+fightStats.B.sig)<30 && !isBloodbath;
    if(isBloodbath && type==='ko') flavor='La commission médicale doit intervenir en urgence.';
    else if(isBoring && isLate) flavor='Sorti de nulle part — le public somnolent se réveille enfin.';
  }
  return {name:baseMove, moveZone:zoneOfOwned(baseMove)||zoneOfGeneric(baseMove)||null, flavor};
}
function winProbEstimate(A,B){ const a=eff(A),b=eff(B);
  const oa=A.overall+a.killer*0.05+reachEdge(A,B), ob=B.overall+b.killer*0.05;
  let p=sigmoid((oa-ob)/12); p=clamp(p*100+RI(-8,8),3,97)/100; return p; // bruit volontaire
}

/* ==== [ANCRE: V2-39] — levier 2/3 des "+5 combats sur une carrière
   complète" : le pic avant déclin s'allonge d'environ un an (36/38 →
   37/39). Les leviers 1 (bande de combats/an élargie, RI(1,4) vétéran)
   et 3 (durée de contrat dépendante de la réputation, fightsByRep
   ci-dessous dans generateContract()) existaient déjà avant ce lot,
   posés par un correctif antérieur à ce document (CORRECTIF_DUREE_
   CARRIERE / DUREE_CONTRAT_REPUTATION) — seul le déclin restait à
   toucher. Validation : sim_v39_careers.js (script jetable, résultats
   dans le message de commit). ==== */
function isDeclining(f){ return f.age>=(isHeavy(f)?39:37); }
function isHeavy(f){ return f.div==='H-heavy'||f.div==='H-lheavy'; }
function applyAging(f){ const A=f.age; const declineLog=[];
  if(isDeclining(f)){ // déclin, poids lourds plus tardif
    // ==== [ANCRE: NOTIF_DECLIN_VIEILLESSE] — item demandé : toute baisse
    // d'attribut doit venir UNIQUEMENT du vieillissement, d'un choix de
    // Classe, ou du menton — jamais d'une compétence ou d'un entraînement
    // (déjà le cas : audité, aucune compétence n'a de fx négatif, aucun
    // entraînement ne baisse un attribut réel, seuls morale/forme le font).
    // Ce qui manquait : (1) prévenir clairement le joueur quand LE
    // VIEILLISSEMENT fait baisser un attribut, et (2) empêcher qu'une
    // compétence ou un entraînement ultérieur ne fasse remonter un attribut
    // au-delà du plafond qu'il vient d'atteindre par le déclin — sinon le
    // déclin serait cosmétique. f.agedCeilings[k] fige ce nouveau plafond,
    // lu par applyDeltas()/grantSkill() en plus du potentiel habituel.
    /* ==== [ANCRE: V2-39] — "déclin plus progressif" : les 3 premières
       années après l'entrée en déclin restent douces (RI(0,1)), le rythme
       antérieur (RI(0,2)) ne reprend qu'ensuite — un pic étiré ne sert à
       rien si la chute qui suit est aussi brutale qu'avant. */
    const yearsIntoDecline=A-(isHeavy(f)?39:37);
    const declineCap=yearsIntoDecline<3?1:2;
    const dec=k=>{ const before=f.attrs[k]; const after=clamp(before-RI(0,declineCap),1,100);
      if(after<before){ f.attrs[k]=after; declineLog.push({key:k,label:attrLabel(k),before,after});
        if(!f.agedCeilings) f.agedCeilings={}; f.agedCeilings[k]=after; }
    };
    dec('footSpeed');dec('handSpeed');dec('cardio');dec('explosiveness'); if(A>=39){dec('power');dec('recovery');}
    const chinBefore=f.attrs.chin, chinAfter=clamp(chinBefore-(A>=38?RI(0,declineCap):0),1,100);
    if(chinAfter<chinBefore){ f.attrs.chin=chinAfter; declineLog.push({key:'chin',label:attrLabel('chin'),before:chinBefore,after:chinAfter});
      if(!f.agedCeilings) f.agedCeilings={}; f.agedCeilings.chin=chinAfter; }
    if(rnd()<0.3) f.morale=clamp(f.morale-5,0,100); // voir ses capacités chuter mine le moral
  } else if(A>=27){ /* pic : stable */ }
  f.age++; f.overall=overall(f);
  if(declineLog.length){ f.lastAgingDecline={age:f.age,items:declineLog}; }
  return declineLog;
}
/* ------------------ INFIRMERIE — catalogue de blessures ---------------- */
const INJURY_TYPES=[
 {name:'Déchirure ligamentaire (genou)',fights:5},
 {name:'Fracture orbitale',fights:4},
 {name:'Fracture de la main',fights:3},
 {name:'Commotion cérébrale sévère',fights:3},
 {name:'Entorse grave à la cheville',fights:2},
];
function rollInjury(){ return pick(INJURY_TYPES); }
/* ==== [ANCRE: V2-11] — Fraîcheur : jauge interne (0-100, jamais affichée en
   chiffre) qui borne combien de sparring/stages un combattant Faith peut
   enchaîner avant que le corps ne dise stop. Cinq paliers qualitatifs,
   seul le libellé est montré (règle FA-21 : jamais de % ni de nombre brut
   dans l'interface). f.freshness vit sur le combattant Faith (ui-08 : init
   à la création, consommée par faithSparring()/faithCamp(), restaurée par
   faithRest() et par le simple écoulement des mois, faithAdvanceMonth()). */
function freshnessTier(f){
  const v=(f && f.freshness!=null)?f.freshness:80;
  if(v>=80) return {tier:'affute',label:'Affûté'};
  if(v>=55) return {tier:'pret',label:'Prêt'};
  if(v>=30) return {tier:'emousse',label:'Émoussé'};
  if(v>=12) return {tier:'vide',label:'Vidé'};
  return {tier:'about',label:'À bout'};
}
/* ==== [ANCRE: V2-08] — clé de repérage : "tourner avec" un partenaire
   (catégorie précision, cf. faithSparring() ui-08) révèle l'attribut où le
   prochain adversaire est le plus dangereux, lue une fois sur l'écran
   d'offre (scr_faith_offer, ui-04) puis consommée à l'entrée dans la cage
   (CL.opp, ui-08) — jamais un simple bonus chiffré. */
function oppTopAttrLabel(o){
  if(!o || !o.attrs) return '';
  let best=null, bv=-1;
  for(const k of ATTR_KEYS){ const v=o.attrs[k]||0; if(v>bv){ bv=v; best=k; } }
  return best?attrLabel(best):'';
}
/* progression BORNÉE : un choix applique un delta net d'attributs ( up/down),
   plafonné par le potentiel — pas d'amélioration infinie. */
/* ==== [ANCRE: V2-36] — règle 7 (jamais de récompense nulle) : un gain
   plafonné (attribut déjà au maximum) sortait de applyDeltas() sans
   laisser AUCUNE trace (real===0 => rien poussé dans `applied`) — l'écran
   qui affiche le résultat n'avait donc rien à montrer, et le joueur
   voyait parfois "10 -> 10" ou rien du tout selon l'écran, sans jamais
   savoir qu'un gain avait bien été TENTÉ. Convertit un gain plafonné en
   un point sur un attribut voisin de la même famille (ATTR.tech/ment/
   phys) s'il en reste un non plafonné, sinon en un petit bonus d'argent
   — jamais silencieux, toujours annoncé (converted:true, lu par les
   écrans qui affichent `applied`). ==== */
function attrFamilyOf(statKey){
  if(ATTR.tech.some(a=>a[0]===statKey)) return ATTR.tech;
  if(ATTR.ment.some(a=>a[0]===statKey)) return ATTR.ment;
  if(ATTR.phys.some(a=>a[0]===statKey)) return ATTR.phys;
  return null;
}
function convertZeroGain(f,statKey){
  const fam=attrFamilyOf(statKey);
  if(fam){
    for(const [nk] of fam){
      if(nk===statKey || f.attrs[nk]===undefined) continue;
      // Même logique que skillHasEffect() (V3_DIMINISHING_RETURNS) : le seuil
      // de potentiel n'est plus un mur, seul le déclin par l'âge (ou 100) l'est.
      const cap=(f.agedCeilings && f.agedCeilings[nk]!=null)?f.agedCeilings[nk]:100;
      const before=f.attrs[nk];
      if(before<cap){
        const after=clamp(Math.min(before+1,cap),1,100);
        if(after>before){ f.attrs[nk]=after;
          return {key:nk,label:attrLabel(nk),delta:after-before,before,after,converted:true,fromLabel:attrLabel(statKey)};
        }
      }
    }
  }
  f.earnings=(f.earnings||0)+2;
  return {key:null,label:null,delta:0,converted:true,money:2,fromLabel:attrLabel(statKey)};
}
/* ==== [ANCRE: V3_DIMINISHING_RETURNS] — Plan V3 LOT 7 §5.7.3/P17 : "Pas de
   palier minimum ou maximum […] Si le combattant a la chance d'avoir les
   bonnes compétences, fait les bons camps d'entraînement, les bons choix,
   il peut devenir le meilleur combattant de l'histoire." Le plafond dur de
   potentiel (f.potential+4 / f.maxAttrs[k], ci-dessous jusqu'à ce lot)
   remplacé par un rendement décroissant : EN DESSOUS du seuil, la
   progression est strictement inchangée (aucune régression de contenu) ;
   AU-DESSUS, chaque gain est réduit selon l'écart déjà creusé au-delà du
   seuil — 90→95 coûte beaucoup plus que 50→55, mais reste possible, sans
   jamais s'arrêter net. Le plafond de déclin par l'âge (f.agedCeilings,
   ANCRE PLAFOND_DECLIN_VIEILLESSE, juste en dessous) N'EST PAS concerné —
   "le déclin par l'âge reste" (spec, point 4) : lui seul demeure un mur
   dur, un choix narratif assumé (le corps vieillit, l'entraînement seul ne
   défait jamais ça), pas une limite arbitraire de potentiel. */
function softCapDelta(before,dv,ceiling){
  if(dv<=0) return before+dv;
  if(before<ceiling) return before+dv;
  const overshoot=before-ceiling;
  const factor=Math.max(0.05,1/(1+overshoot*0.5));
  return before+dv*factor;
}
/* ==== [FIN ANCRE] ==== */
function applyDeltas(f,deltas){ const applied=[]; for(const [k,dv] of deltas){
    if(k==='morale'){ f.morale=clamp(f.morale+dv,0,100); applied.push(['Moral',dv]); continue; }
    if(k==='form'){ f.form=clamp(f.form+dv,0,100); applied.push(['Forme',dv]); continue; }
    const before=f.attrs[k]; let after=before+dv;
    // Rendement décroissant au-delà du seuil de potentiel (V3_DIMINISHING_RETURNS
    // ci-dessus) — plus de mur dur : la valeur déjà acquise n'est jamais reprise,
    // mais la progression au-delà ralentit au lieu de s'arrêter.
    if(dv>0) after=softCapDelta(before,dv,(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4);
    // ==== [ANCRE: PLAFOND_DECLIN_VIEILLESSE] — item demandé : un attribut
    // rabaissé par le vieillissement (f.agedCeilings, cf. applyAging) ne peut
    // plus jamais être remonté par un entraînement au-delà de ce plafond —
    // sinon le déclin lié à l'âge serait annulable, ce qui n'a pas de sens.
    if(dv>0 && f.agedCeilings && f.agedCeilings[k]!=null) after=Math.min(after, Math.max(before, f.agedCeilings[k]));
    f.attrs[k]=clamp(after,1,100); const real=Math.round(f.attrs[k]-before);
    if(real!==0) applied.push({key:k,label:attrLabel(k),delta:real,before,after:f.attrs[k]});
    else if(dv>0) applied.push(convertZeroGain(f,k));
  } f.overall=overall(f); return applied;
}
/* ==== [ANCRE: TIRAGE] — moteur de compétences en deux temps (plan §6/§18).
   Corrigé par rapport à la version brute reçue : les attributs vivent dans
   f.attrs (pas f.stats), le pays est f.countryKey (pas f.country), et le
   générateur aléatoire doit être rnd() (seedé, reproductible) et non
   Math.random(). Bornes /1-100 et recalcul de l'overall ajoutés, comme le
   faisait l'ancien rollSkill(). ==== */
const SKILL_CONSTANTS = {
  // Taux de tirage augmenté (item demandé : ~10 compétences par partie en
  // moyenne, contre ~8 auparavant) et plafond de carrière relevé en
  // conséquence (9 → 10).
  BASE_RATE: 0.12, DROUGHT_INC: 0.012,
  // ==== [ANCRE: CORRECTIF_BAISSE_RARETE_HAUT_TIER] — item demandé : retour
  // en arrière sur RARETE_BOOST_HAUT_TIER (trop de E/L/M en jeu), puis
  // ajustement fin demandé explicitement : Mythique à 0.12% (0.0012) et
  // Légendaire à 4.5% pile. Épique laissé à 10% (valeur pré-boost déjà
  // posée juste avant), Commune/Rare réajustés en proportion pour combler
  // les 85.5 points restants.
  MYTHIC_CHANCE: 0.0012,
  MAX_CAREER_SKILLS: 10, AGE_META: 34,
};
function tirerRarete(){ const roll=rnd()*100;
  if(roll<55.5) return 'C'; if(roll<85.5) return 'R'; if(roll<95.5) return 'E'; return 'L';
}
// ==== [ANCRE: SKILL_SANS_EFFET] — bug remonté : une compétence pouvait être
// tirée alors que TOUS les attributs qu'elle affecte étaient déjà à leur
// plafond (potentiel/maxAttrs/agedCeilings) — le gain réel valait alors 0,
// rendant la compétence inutile. Même formule de plafond que grantSkill().
function skillHasEffect(f, s){
  if(!s.fx) return true;
  return Object.keys(s.fx).some(stat=>{
    const dv=s.fx[stat];
    if(dv<=0 || !f.attrs || f.attrs[stat]===undefined) return true;
    /* ==== [CORRECTIF V3_DIMINISHING_RETURNS] — le seuil de potentiel n'est
       plus un mur (cf. softCapDelta, engine.js) : une compétence garde un
       effet réel tant que l'attribut n'a pas atteint son SEUL vrai plafond
       restant, le déclin par l'âge (agedCeilings) ou 100 à défaut. Un
       rendement décroissant très faible reste un gain non nul — jamais
       "sans effet" tant que la marge existe. ==== */
    const cap=(f.agedCeilings && f.agedCeilings[stat]!=null) ? f.agedCeilings[stat] : 100;
    return f.attrs[stat] < cap;
  });
}
function poolEligible(f, isEndOfCareer, isCapped){
  return SKILLS.filter(s=>{
    if(f.skills && f.skills.includes(s.id)) return false;
    if(s.fam==='gen') return false;                 // jamais tiré en carrière, seulement à la création
    if(!skillHasEffect(f, s)) return false;
    if(s.fam==='meta') return isEndOfCareer;
    if(isCapped) return false;
    if(s.fam==='style' && s.key===f.style) return true;
    if(s.fam==='country' && s.key===f.countryKey) return true;
    return false;
  });
}
function getFallbackSkill(pool, baseRarity){ const hierarchy=['L','E','R','C'];
  let startIndex=hierarchy.indexOf(baseRarity); if(startIndex===-1) startIndex=0;
  for(let i=startIndex;i<hierarchy.length;i++){ const available=pool.filter(s=>s.rar===hierarchy[i]);
    if(available.length>0) return available[Math.floor(rnd()*available.length)]; }
  return null;
}
function grantSkill(f, skill){ if(!f.skills) f.skills=[]; f.skills.push(skill.id);
  // ==== [ANCRE: CAP_COMPETENCE_ATTRIBUT] — bug remonté : une compétence
  // pouvait faire dépasser le plafond de potentiel d'un attribut (borne déjà
  // appliquée pour toute PROGRESSION normale via applyDeltas, mais absente
  // ici). Même règle : un gain positif ne peut jamais dépasser le potentiel
  // (ou maxAttrs si défini), mais ne redescend jamais une valeur déjà acquise
  // au-dessus de ce plafond (ex. via une autre compétence antérieure).
  // ==== [ANCRE: CORRECTIF_DELTA_AFFICHE_COMPETENCE] — bug remonté : l'écran
  // "Compétence débloquée" recalculait le "avant" en faisant after-fx[stat],
  // en supposant que le delta nominal du fx avait été appliqué intégralement.
  // Or juste au-dessus, ce gain est clampé au plafond : si le clamp a réduit
  // le delta réel, l'"avant" recalculé était faux (trop bas), affichant un
  // gain gonflé qui n'a jamais eu lieu. On capture ici le VRAI "avant" par
  // stat (avant tout clamp) dans _realBefore, attaché à une COPIE renvoyée
  // (jamais à l'objet SKILLS partagé, qui resterait alors pollué pour tous
  // les futurs tirages/combattants).
  const realBefore={};
  if(skill.fx){ for(const stat in skill.fx){ if(f.attrs && f.attrs[stat]!==undefined){
    const dv=skill.fx[stat]; const before=f.attrs[stat]; realBefore[stat]=before; let after=before+dv;
    // Même rendement décroissant qu'applyDeltas() (ANCRE V3_DIMINISHING_RETURNS,
    // engine.js) — une compétence ne doit pas contourner la règle que suit
    // tout le reste de la progression.
    if(dv>0) after=softCapDelta(before,dv,(f.maxAttrs && f.maxAttrs[stat]!=null) ? f.maxAttrs[stat] : f.potential+4);
    if(dv>0 && f.agedCeilings && f.agedCeilings[stat]!=null) after=Math.min(after, Math.max(before, f.agedCeilings[stat]));
    f.attrs[stat]=clamp(after,1,100);
  } } }
  if(typeof applySynergyBuffs==='function') applySynergyBuffs(f);
  f.overall=overall(f);
  return Object.keys(realBefore).length ? Object.assign({},skill,{_realBefore:realBefore}) : skill;
}
function rollSkill(f){
  if(!f._drought) f._drought=0; if(!f.skills) f.skills=[];
  let careerCount=0, hasMythic=false;
  f.skills.forEach(skillId=>{ const s=SKILLS.find(x=>x.id===skillId); if(s){ if(s.fam==='style'||s.fam==='country') careerCount++; if(s.rar==='M') hasMythic=true; } });
  const isCapped=careerCount>=SKILL_CONSTANTS.MAX_CAREER_SKILLS;
  const isEndOfCareer=(f.age>=SKILL_CONSTANTS.AGE_META);
  // 1) Jet Mythique — entièrement séparé, testé à CHAQUE combat, indépendant
  //    du plafond et de la sécheresse (sinon il ne se déclenche presque jamais,
  //    comme observé lors des tests : 0% au lieu des ~4%/carrière visés).
  if(!hasMythic && rnd()<SKILL_CONSTANTS.MYTHIC_CHANCE){
    const mythics=SKILLS.filter(s=>s.rar==='M' && s.fam==='style' && s.key===f.style && !(f.skills||[]).includes(s.id) && skillHasEffect(f, s));
    if(mythics.length>0) return grantSkill(f, mythics[Math.floor(rnd()*mythics.length)]);
  }
  // 2) Pool éligible pour le tirage normal (style/pays/méta selon contexte)
  const pool=poolEligible(f, isEndOfCareer, isCapped);
  if(pool.length===0) return null;
  const unlockChance=SKILL_CONSTANTS.BASE_RATE + (f._drought*SKILL_CONSTANTS.DROUGHT_INC);
  if(rnd()>unlockChance){ f._drought++; return null; }
  f._drought=0;
  if(isEndOfCareer){ const metaPool=pool.filter(s=>s.fam==='meta');
    if(metaPool.length>0 && rnd()<0.25) return grantSkill(f, metaPool[Math.floor(rnd()*metaPool.length)]); }
  if(isCapped) return null;
  const rarityDrawn=tirerRarete(); const finalSkill=getFallbackSkill(pool, rarityDrawn);
  if(finalSkill) return grantSkill(f, finalSkill);
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* épithètes de fin de carrière (uniques, certains liés à la catégorie) */
function epithets(f){ const e=[]; const fights=f.W+f.L+f.D; const wr=f.W/Math.max(1,fights);
  if(f.ko>=12)e.push('Machine à KO'); if(f.sub>=12)e.push('Le chasseur de cou');
  if(f.titles>=1&&f.L===0)e.push('L\u2019Invaincu'); if(f.defenses>=5)e.push('Le monarque');
  if(f.attrs.power>=92&&/plume|paille|mouche|coq/i.test(f.divName))e.push('Le Ngannou des petits gabarits');
  if(f.skills.includes('bjj29'))e.push('L\u2019Anaconda'); if(f.skills.includes('bjj36'))e.push('Le Tordeur');
  if(f.morale>=85&&f.titles>=1)e.push('Le favori du public'); if(wr>=0.85&&fights>=15)e.push('Le prodige');
  if(f.koLoss>=6)e.push('La guerre l\u2019a marqué'); if(!e.length)e.push('L\u2019artisan de la cage');
  return e;
}

/* ==== [ANCRE: TEXT_ENGINE] — Plan V3 LOT 0 §4.2. Moteur de tirage contextuel
   générique : une chaîne visible n'est plus « la même à chaque combat » mais
   un pool d'entrées {id, text, req(ctx), weight, tier} filtré par le contexte
   courant et protégé d'une répétition rapprochée par un carnet persistant
   (F.textLedger). N'ATTEND PAS que les pools existants (data-faith-content.js)
   soient déjà au format {req,weight,tier} — ils restent de simples tableaux
   de chaînes pour l'instant, migrés lot par lot (LOT 4/5/6/7, chacun sur ses
   propres écrans) ; TEXT_POOLS n'accueille QUE les pools déjà migrés. Une
   entrée sans `req` est valide (silencieusement toujours éligible) mais
   `tools/lint-content.js` (§6.3) l'interdira dans les pools à haute
   fréquence — ce n'est pas au moteur de le refuser à l'exécution. */
const TEXT_POOLS={};
/** @param {string} poolId @param {{id:string,text:string,req?:(ctx:object)=>boolean,weight?:number,tier?:string}[]} entries */
function registerTextPool(poolId,entries){ TEXT_POOLS[poolId]=entries||[]; }
function ensureTextLedger(F){
  if(!F) return null;
  if(!F.textLedger||typeof F.textLedger!=='object') F.textLedger={};
  return F.textLedger;
}
/** Tire une entrée d'un pool enregistré, filtrée par ctx.req/tier, pondérée
 *  par weight, et jamais identique à une des dernières tirées de ce pool
 *  (fenêtre = min(8, taille du pool / 3), §4.2). Retourne '' si le pool est
 *  vide ou inconnu — jamais d'exception, jamais de texte fabriqué. */
function txtPick(poolId,ctx){
  ctx=ctx||{};
  const pool=TEXT_POOLS[poolId];
  if(!pool||!pool.length) return '';
  let elig=pool.filter(e=>(!e.req||e.req(ctx)) && (!e.tier||!ctx.rankTier||e.tier===ctx.rankTier));
  if(!elig.length) elig=pool.filter(e=>!e.req); // repli : au moins les entrées sans condition, jamais un pool vide
  if(!elig.length) elig=pool; // dernier repli : mieux vaut une redite qu'une chaîne vide
  const ledger=ctx.F?ensureTextLedger(ctx.F):null;
  const recent=ledger&&ledger[poolId]?ledger[poolId]:[];
  const window=Math.min(8,Math.max(1,Math.floor(pool.length/3)));
  let candidates=elig.filter(e=>!recent.includes(e.id));
  if(!candidates.length) candidates=elig; // tout le pool éligible a déjà été vu récemment : on retire quand même plutôt que de bloquer
  const totalWeight=candidates.reduce((s,e)=>s+(e.weight||1),0);
  let roll=rnd()*totalWeight, chosen=candidates[0];
  for(const e of candidates){ roll-=(e.weight||1); if(roll<=0){ chosen=e; break; } }
  if(ledger){
    if(!ledger[poolId]) ledger[poolId]=[];
    ledger[poolId].push(chosen.id);
    while(ledger[poolId].length>window) ledger[poolId].shift();
  }
  /* ==== [ANCRE: TEXT_ENGINE_INTERPOLATION] — Plan V3 LOT 5 : "toute phrase
     fréquente doit consommer >=1 jeton de contexte" (§4.2). `text` peut
     être une fonction (ctx)=>string plutôt qu'une chaîne figée — c'est
     elle qui permet à un pool de rester générique (un seul id ledger,
     dédupliqué normalement) tout en nommant l'adversaire réel, son
     palmarès, etc. à chaque tirage. Chaînes figées toujours acceptées,
     inchangé pour les pools déjà écrits ainsi (LOT 0). ==== */
  return typeof chosen.text==='function'?chosen.text(ctx):chosen.text;
}
/* ==== [FIN ANCRE] ==== */

