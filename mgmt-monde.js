"use strict";
/* CAGE LEGACY — mgmt-monde.js
   ============================================================================
   MODE MANAGEMENT — le monde extérieur dérivé : un combattant hors Split ne
   stocke que son identité sur sa ligne (id, graine, catégorie, pays, cycle
   d'entrée dans le monde) ; tout le reste — nom, bilans, organisations,
   âge, trajectoire — se DÉRIVE à la lecture par fonction pure de
   (seed, cycle), sans jamais appeler la RNG du jeu. Issu de mgmt-bureau.js,
   découpage de la dette CLAUDE.md §10 (ancre MGMT_LOT2B_EXTERIEUR ;
   mgmtValidExteriorLine, porte de validateMgmt, vit dans mgmt-save.js).
   Aucun accès DOM : le rendu vit dans mgmt-screens.js.

   Aucune constante évaluée au chargement. Les fonctions dépendent au
   runtime de engine.js (allDivisions, divById, COUNTRY_KEYS, SEED,
   setSeed, makeName), ui-01-roster-matchmaking.js (correlatedRecord),
   duel-codec.js (duelFnv1a32, mulberry32 — chargé avant ce fichier),
   mgmt-data.js (constantes MGMT_EXT_*) et mgmt-bureau.js (mgmtNextId).
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT2B_EXTERIEUR] — Lot 2B T1 le monde extérieur dérivé
   (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T1 ; QO-8, décision 3 du
   21/09/2026 : le monde extérieur est DÉRIVÉ, pas simulé). Un combattant
   hors Split ne stocke que son IDENTITÉ sur sa ligne : id, graine (seed),
   catégorie (div), pays (ck) et le cycle où il entre dans le monde (born).
   TOUT le reste — nom, bilan amateur, bilan professionnel hors Split,
   organisations traversées, répartition des fins de combats, âge courant,
   trajectoire — se DÉRIVE à la lecture par fonction pure de (seed, cycle) :
   règle du bureau (CDC §3), comme mgmtDivisionRank (lot 2 T1). Rien
   d'autre n'est jamais écrit sur la ligne.

   Déterminisme (le cœur de la tranche) : la dérivation n'appelle JAMAIS la
   RNG du jeu. Deux mécanismes, tous deux déjà éprouvés dans ce dépôt :
   - duelFnv1a32/mulberry32 (duel-codec.js, chargé avant ce fichier) pour
     les flux propres au combattant : chaque lecture repart de la graine,
     deux lectures successives rendent exactement la même trace ;
   - le motif SEED sauvegardé / setSeed(graine) / restauré (mgmtCombatProfile)
     pour les seuls appels aux générateurs existants liés à la RNG du jeu
     (makeName, correlatedRecord, RI) : l'état de la RNG du jeu ne bouge pas,
     les lire ne consomme aucun tirage.
   Un seul monde extérieur (décision 8) : QO-2 (short notice) et QO-3
   (combattant libre de contrat) se branchent sur mgmtExteriorEnsure /
   mgmtExteriorArrive (le vivier) et mgmtExteriorTrace (la trace) — jamais
   un second vivier.

   Réutilisation : makeName (engine.js) et correlatedRecord
   (ui-01-roster-matchmaking.js) — les mêmes générateurs que mgmtNewRoster.
   Le bilan AMATEUR est un tirage en bloc correlatedRecord (phase close, ses
   entrées ne bougent plus : stable pour la vie de la ligne). Le bilan
   PROFESSIONNEL avance cycle après cycle (il continue de combattre
   ailleurs) : il se dérive combat par combat, coup par coup, sous la MÊME
   loi bilan↔niveau que correlatedRecord (constantes MGMT_EXT_RATIO_*) —
   un tirage en bloc re-mélangerait tout le passé à chaque cycle et le
   bilan régresserait ; combat par combat, la trace au cycle C2 prolonge
   exactement la trace au cycle C1 (propriété de préfixe). Une seule loi de
   corrélation, jamais un second générateur de bilans. ==== */

/** Graine d'une ligne extérieure : hachage stable de son identifiant
 *  (compteur de partie — deux sauvegardes différentes portent des mondes
 *  différents, une même sauvegarde rejouée porte le même). Pur.
 *  @returns {number} entier non signé 32 bits. */
function mgmtExteriorSeedFor(id){
  return duelFnv1a32('ext|'+String(id));
}

/** Flux mulberry32 propre à une ligne, sauté par domaine ('cree', 'nom',
 *  'amateur', 'carriere', 'arrivees'...) : chaque lecture repart de la
 *  graine, l'ordre des lectures ne change jamais rien. Pur.
 *  @returns {()=>number} */
function mgmtExteriorStream(salt,seed){
  return mulberry32(duelFnv1a32(salt+'|'+(seed>>>0)));
}

/** Crée une ligne extérieure : SON IDENTITÉ, rien d'autre. L'identifiant
 *  vient du compteur de la partie (mgmtNextId), la graine du hachage de
 *  l'identifiant, le pays d'un flux propre au combattant, et la catégorie
 *  demandée par le quota — aucun tirage de la RNG du jeu. born : le cycle où il entre dans le
 *  monde. @returns {object} */
function mgmtExteriorCreate(m,born,divId){
  if(!m||typeof m!=='object') return null;
  if(!divById(divId)) return null;
  if(!Number.isSafeInteger(m.seq)||m.seq<1) m.seq=1;
  const id=mgmtNextId(m);
  const seed=mgmtExteriorSeedFor(id);
  const r=mgmtExteriorStream('ext-cree',seed);
  const ck=COUNTRY_KEYS[Math.floor(r()*COUNTRY_KEYS.length)];
  return {id,seed,div:divId,ck,born};
}

/** Nombre de combattants vivants du monde dans une catégorie : Split et
 *  extérieur ensemble, sans compter un retraité — médical (test générique)
 *  ou, pour l'extérieur, une carrière dérivée parvenue à son terme (T3 :
 *  le monde part sous la même loi que le roster). Les doublons d'id ne
 *  comptent qu'une fois pendant un éventuel transfert. Pur.
 *  @returns {number} */
function mgmtWorldLivingCount(m,divId){
  if(!m||typeof m!=='object'||!divById(divId)) return 0;
  const ids=new Set();
  if(Array.isArray(m.roster)){
    for(const o of m.roster){
      if(o&&o.div===divId&&!mgmtIsRetired(o)&&mgmtValidId(o.id)) ids.add(o.id);
    }
  }
  if(Array.isArray(m.exterieur)){
    const cycle=Number.isSafeInteger(m.cycle)?m.cycle:0;
    for(const o of m.exterieur){
      if(o&&o.div===divId&&mgmtValidExteriorLine(o)&&!mgmtExteriorRetired(o,cycle)) ids.add(o.id);
    }
  }
  return ids.size;
}

/** Maintient le quota mondial par catégorie. L'extérieur complète ce que
 *  les vivants de Split ne fournissent pas, sans jamais retirer une ligne
 *  (QO-9 : le passé du monde ne disparaît pas — un partant cesse de
 *  compter, sa ligne reste). À l'ouverture born vaut 0 ; après une
 *  retraite, les remplaçants portent le cycle où la catégorie a été
 *  complétée. Le compte est pris une fois par catégorie : les lignes
 *  ajoutées sont vivantes par construction, inutile de re-dériver le
 *  monde à chaque ajout. Ne consomme aucun tirage de la RNG du jeu.
 *  @returns {Array} le vivier extérieur. */
function mgmtExteriorEnsure(m){
  if(!m||typeof m!=='object') return [];
  if(!Array.isArray(m.exterieur)) m.exterieur=[];
  const born=Number.isSafeInteger(m.cycle)&&m.cycle>=0?m.cycle:0;
  for(const div of allDivisions()){
    let vivants=mgmtWorldLivingCount(m,div.id);
    while(vivants<MGMT_EXT_LIVE_PER_DIVISION){
      m.exterieur.push(mgmtExteriorCreate(m,born,div.id));
      vivants++;
    }
  }
  return m.exterieur;
}

/** Flux du monde extérieur : à l'ouverture de chaque cycle, après son
 *  incrémentation, les catégories que les retraites ou recrutements ont
 *  creusées sont ramenées à 30 vivants, Split compris. Le nombre d'arrivées
 *  dépend donc de l'état du monde, jamais d'un tirage global.
 *  @returns {Array} le vivier extérieur. */
function mgmtExteriorArrive(m){
  if(!m||typeof m!=='object'||!Number.isSafeInteger(m.cycle)||m.cycle<0) return [];
  return mgmtExteriorEnsure(m);
}

/** Nom dérivé d'une ligne extérieure : makeName (le générateur du jeu,
 *  jamais un second) sous le motif SEED sauvegardé / restauré, avec le
 *  même garde de noms réservés que mgmtNewRoster. La graine est celle de la
 *  ligne : le nom est stable à vie et deux lectures donnent le même.
 *  @returns {{name,first,last}} */
function mgmtExteriorName(seed,div,ck){
  const saved=SEED;
  let nm=null;
  try{
    setSeed(duelFnv1a32('ext-nom|'+(seed>>>0)));
    nm=makeName((div&&div.gender)||'H',ck);
    let guard=0;
    while((MGMT_EXCLUDED_FIRST.includes(nm.first)||MGMT_EXCLUDED_LAST.includes(nm.last))&&guard<50){
      nm=makeName((div&&div.gender)||'H',ck); guard++;
    }
  }finally{
    setSeed(saved);
  }
  return {name:nm.name,first:nm.first,last:nm.last};
}

/** Bilan amateur dérivé : phase CLOSE (le passé complet du combattant), un
 *  tirage en bloc correlatedRecord sous le motif SEED sauvegardé /
 *  restauré — entrées stables pour la vie de la ligne (durée amateur 1-3
 *  ans d'après la graine, bande de combats du générateur existant
 *  RI(3,20)), la même loi bilan↔niveau que partout. La répartition des fins
 *  de la phase suit la même distribution que le reste du monde dérivé.
 *  @returns {{lv,W,L,fin:{ko,sub,dec}}} */
function mgmtExteriorAmateur(seed){
  const saved=SEED;
  let out=null;
  try{
    setSeed(duelFnv1a32('ext-amateur|'+(seed>>>0)));
    const lv=RI(40,70);
    const n=RI(MGMT_EXT_AMA_FIGHTS_MIN,MGMT_EXT_AMA_FIGHTS_MIN+MGMT_EXT_AMA_FIGHTS_SPREAD-1);
    const rec=correlatedRecord(lv,n);
    const total=rec.W+rec.L;
    const j1=rnd()*2-1, j2=rnd()*2-1;
    const ko=clamp(Math.round(total*MGMT_EXT_FIN_KO+j1*total*0.15),0,total);
    const reste=total-ko;
    const sub=clamp(Math.round(reste*MGMT_EXT_FIN_SUB/(1-MGMT_EXT_FIN_KO)+j2*reste*0.2),0,reste);
    out={lv:lv,W:rec.W,L:rec.L,fin:{ko:ko,sub:sub,dec:reste-sub}};
  }finally{
    setSeed(saved);
  }
  return out;
}

/** Chronologie d'une carrière extérieure : les deux premiers tirages du
 *  flux de carrière (âge de début, âge au passage dans le monde), le départ
 *  professionnel et la FIN DE CARRÉE — la retraite du T3, la même loi que
 *  le roster (mgmtRetireAgeFor, engine-career.js:161 : max(39, 42 −
 *  dégradation du menton)). Le niveau de dégradation du partant se dérive
 *  de sa propre trace, dans un flux séparé ('ext-retraite') : les carrières
 *  déjà dérivées ne bougent pas d'un tirage. Pur — consomme uniquement le
 *  flux donné (pour mgmtExteriorCareer) ou des flux propres à la graine.
 *  @returns {{ageStart,ageBorn,careerStart,retAge,retireCycle}} */
function mgmtExteriorTimeline(r,seed,born){
  const ageStart=MGMT_EXT_AGE_START_MIN+Math.floor(r()*MGMT_EXT_AGE_START_SPREAD);
  const ageBorn=MGMT_EXT_AGE_MIN+Math.floor(r()*MGMT_EXT_AGE_SPREAD);
  const cpy=MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS;
  const bornC=Number.isSafeInteger(born)?born:0;
  const careerStart=bornC-Math.round((ageBorn-ageStart)*cpy);
  const rr=mgmtExteriorStream('ext-retraite',seed);
  const retAge=mgmtRetireAgeFor(Math.floor(rr()*4));
  return {ageStart,ageBorn,careerStart,retAge,
    retireCycle:careerStart+Math.ceil((retAge-ageStart)*cpy)};
}

/** La ligne extérieure est-elle parvenue au terme de sa carrière dérivée ?
 *  Pur — deux flux propres à la graine, aucun tirage de la RNG du jeu.
 *  @returns {boolean} */
function mgmtExteriorRetired(line,cycle){
  if(!line||typeof line!=='object') return false;
  const seed=(Number.isSafeInteger(line.seed)&&line.seed>=0)?line.seed>>>0:mgmtExteriorSeedFor(line.id);
  const born=Number.isSafeInteger(line.born)?line.born:0;
  const c=Math.floor(Number.isFinite(cycle)?cycle:born);
  const tl=mgmtExteriorTimeline(mgmtExteriorStream('ext-carriere',seed),seed,born);
  return c>=tl.retireCycle;
}

/** Carrière professionnelle hors Split, dérivée combat par combat du cycle
 *  de début de carrière jusqu'au cycle lu (propriété de préfixe : la
 *  carrière au cycle C2 prolonge exactement celle au cycle C1 — le bilan
 *  avance, ne régresse jamais). Chaque combat part d'un écart de cycles
 *  dérivé (rythme réel), se joue sous la loi bilan↔niveau de
 *  correlatedRecord évaluée au niveau du combattant à ce moment de sa
 *  trajectoire (progression annuelle dérivée, plafond comme le pont
 *  bilan→niveau existant, déclin après MGMT_EXT_DECLINE_AGE ans), se finit
 *  selon la distribution calibrée du monde dérivé, et peut faire changer
 *  d'organisation (série de victoires, ambition dérivée — l'échelle est
 *  MGMT_EXT_ORGS). T3 : la carrière s'arrête à la retraite — la même loi
 *  que le roster (mgmtRetireAgeFor, 39-42 ans) ; le bilan se fige, il ne
 *  régresse jamais, et l'âge courant continue d'avancer (calendrier).
 *  Pur : un seul flux mulberry32 semé par la graine de la ligne, jamais la
 *  RNG du jeu.
 *  @returns {{age,W,L,fin:{ko,sub,dec},fights,streak,orgIdx,orgs:Array,retAge,retireCycle}} */
function mgmtExteriorCareer(seed,born,cycle){
  const r=mgmtExteriorStream('ext-carriere',seed);
  const cpy=MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS;
  const tl=mgmtExteriorTimeline(r,seed,born);
  const ageStart=tl.ageStart;
  /* La chronologie commune a consommé les deux premiers tirages du flux
     (âge de début, âge au passage dans le monde) — la suite reprend dans
     l'ordre exact d'avant la T3 : les carrières déjà dérivées ne bougent pas. */
  const amaYears=MGMT_EXT_AMA_YEARS_MIN+r()*MGMT_EXT_AMA_YEARS_SPREAD;
  const rate=Math.floor(r()*(MGMT_EXT_RATE_MAX+1));
  const ambition=MGMT_EXT_ORG_MOVE_MIN+r()*MGMT_EXT_ORG_MOVE_SPREAD;
  const lvStart=MGMT_EXT_LVL_START_MIN+Math.floor(r()*MGMT_EXT_LVL_START_SPREAD);
  const bornC=Number.isSafeInteger(born)?born:0;
  const c=Math.floor(Number.isFinite(cycle)?cycle:bornC);
  const careerStart=tl.careerStart;
  const proStart=Math.round(amaYears*cpy);
  const tNow=c-careerStart;
  const fin={ko:0,sub:0,dec:0};
  let W=0,L=0,fights=0,streak=0,orgIdx=0,orgFights=0,w3=0;
  const orgs=[{i:0,from:null,to:null,fights:0}];
  const orgMax=MGMT_EXT_ORGS.length;
  let s=proStart;
  for(;;){
    /* Fin de carrière : la retraite (T3, même loi que le roster) fige le
       bilan — il ne régresse jamais, il cesse d'avancer. La borne des 60
       ans d'avant la T3 est absorbée par la loi de retraite (39-42 ans). */
    if(ageStart+s/cpy>=tl.retAge) break;
    const gap=MGMT_EXT_GAP_MIN+Math.floor(r()*MGMT_EXT_GAP_SPREAD);
    s+=gap;
    if(s>tNow) break;
    const ageF=ageStart+s/cpy;
    const yearsPro=Math.max(0,(s-proStart)/cpy);
    const decline=Math.max(0,Math.floor(ageF)-MGMT_EXT_DECLINE_AGE)*MGMT_EXT_DECLINE_PER_YEAR;
    const lv=clamp(clamp(Math.round(lvStart+rate*yearsPro),MGMT_EXT_LVL_FLOOR,MGMT_EXT_LVL_CAP)-decline,MGMT_EXT_LVL_FLOOR,MGMT_EXT_LVL_CAP);
    const t=clamp((lv-MGMT_EXT_LVL_SRC_FLOOR)/MGMT_EXT_LVL_SRC_SPAN,0,1);
    const p=clamp(MGMT_EXT_RATIO_BASE+t*MGMT_EXT_RATIO_SPAN,MGMT_EXT_RATIO_FLOOR,MGMT_EXT_RATIO_CAP);
    const win=r()<p;
    const mr=r();
    const fam=mr<MGMT_EXT_FIN_KO?'ko':(mr<MGMT_EXT_FIN_KO+MGMT_EXT_FIN_SUB?'sub':'dec');
    const moveRoll=r();
    const worldC=careerStart+s;
    fights++;
    if(win){ W++; streak=streak>=0?streak+1:1; }else{ L++; streak=streak<=0?streak-1:-1; }
    fin[fam]++;
    w3=((w3<<1)|(win?1:0))&7;
    const cur=orgs[orgs.length-1];
    if(cur.from===null) cur.from=worldC;
    cur.to=worldC;
    cur.fights++;
    orgFights++;
    const wins3=((w3&1)?1:0)+((w3&2)?1:0)+((w3&4)?1:0);
    if(orgFights>=MGMT_EXT_ORG_MIN_FIGHTS&&wins3>=2&&orgIdx<orgMax-1&&moveRoll<ambition){
      orgIdx++; orgFights=0;
      orgs.push({i:orgIdx,from:null,to:null,fights:0});
    }
  }
  const age=Math.floor(ageStart+tNow/cpy);
  return {age:age,W:W,L:L,fin:fin,fights:fights,streak:streak,orgIdx:orgIdx,orgs:orgs,
    retAge:tl.retAge,retireCycle:tl.retireCycle};
}

/** La trace de carrière d'une combattant extérieur : TOUT le passé, dérivé
 *  à la lecture de la seule identité (seed, div, ck, born) et du cycle
 *  courant. Pur : n'écrit jamais rien sur la ligne, ne consomme aucun
 *  tirage de la RNG du jeu (flux propres + motif SEED restauré).
 *  Trajectoire lisible : le bilan amateur (bloqué), le bilan professionnel
 *  qui avance, les organisations traversées (noms = MGMT_EXT_ORGS, null =
 *  [EMPLACEMENT AUTEUR]), l'âge courant, la série en cours. Les bornes
 *  d'organisation sont des cycles du monde — négatif : avant l'ouverture
 *  du monde. T3 : l'âge de retraite et le cycle où la carrière s'est
 *  close (ou se clora) voyagent avec la trace — un partant garde son
 *  passé, il cesse seulement de compter parmi les vivants.
 *  @returns {object|null} null si la ligne est illisible. */
function mgmtExteriorTrace(line,cycle){
  if(!line||typeof line!=='object') return null;
  const seed=(Number.isSafeInteger(line.seed)&&line.seed>=0)?line.seed>>>0:mgmtExteriorSeedFor(line.id);
  const div=divById(line.div);
  if(!div||typeof line.ck!=='string'||!COUNTRY_KEYS.includes(line.ck)) return null;
  const born=Number.isSafeInteger(line.born)?line.born:0;
  const nm=mgmtExteriorName(seed,div,line.ck);
  const am=mgmtExteriorAmateur(seed);
  const car=mgmtExteriorCareer(seed,born,cycle);
  return {
    name:nm.name,first:nm.first,last:nm.last,
    age:car.age,
    amateur:{W:am.W,L:am.L,fin:{ko:am.fin.ko,sub:am.fin.sub,dec:am.fin.dec}},
    pro:{W:car.W,L:car.L,fin:{ko:car.fin.ko,sub:car.fin.sub,dec:car.fin.dec}},
    fights:car.fights,
    streak:car.streak,
    org:car.orgIdx,
    orgs:car.orgs.map(o=>({i:o.i,name:MGMT_EXT_ORGS[o.i]||null,from:o.from,to:o.to,fights:o.fights})),
    retAge:car.retAge,retireCycle:car.retireCycle,
  };
}

/* ==== [FIN ANCRE] ==== */
