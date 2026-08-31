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
function makeFighter(opt={}){ const optDiv=divById(opt.div);
  const gender=opt.gender||(optDiv?optDiv.gender:pick(['H','F']));
  const div=optDiv|| (gender==='H'?pick(DIVISIONS.H):pick(DIVISIONS.F));
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
