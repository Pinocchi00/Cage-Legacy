"use strict";
/* CAGE LEGACY — state/state-validation.js
   Validation/réparation d'une sauvegarde : validateSave() (structurelle, sur
   le JSON brut, utilisée par state-save.js), repairFighter() et
   validateState() (réparation en place de l'état vivant G, utilisée par
   state-save.js/load()). */
/** Vérification STRUCTURELLE, en lecture seule, d'une sauvegarde brute (juste
 * parsée, avant migrate()/validateState() qui eux RÉPARENT en place). Ne
 * mute jamais son argument — sert uniquement à décider si cette copie est
 * assez saine pour être chargée, ou s'il faut basculer sur le backup.
 * @param {*} raw @returns {boolean} */
function validateSave(raw){
  /* ==== [ANCRE: FIX_B04_SCHEMA_NUMERIQUE] — version exacte, nombres finis
     dans toute la sauvegarde et compteurs entiers sûrs (0..MAX_SAFE_INTEGER).
     Les âges peuvent être fractionnaires ; aucune conversion ni limite
     d'attribut à 100, le moteur autorisant la progression au-delà. ==== */
  if(!isSaveObject(raw) || raw.version!==SAVE_VERSION || !hasFiniteSaveNumbers(raw)) return false;
  const f=raw.f;
  if(!isSaveObject(f) || !validFighterNumbers(f)) return false;
  if(typeof f.name!=='string'||!f.name) return false;
  if(raw.roster!==undefined && (!Array.isArray(raw.roster) || raw.roster.some(o=>isSaveObject(o)&&!validFighterNumbers(o)))) return false;
  if(raw.fight && raw.fight.opp && !validFighterNumbers(raw.fight.opp)) return false;
  /* ==== [FIN ANCRE] ==== */
  if(f.history!==undefined && !Array.isArray(f.history)) return false;
  if(f.div!==undefined && f.div!==null && typeof divById==='function' && !divById(f.div)) return false;
  // ==== [ANCRE: SUPPRESSION_DOUBLE_CHAMPION] — P2 : une sauvegarde antérieure
  // au retrait du statut de double champion peut encore porter
  // f.champChampBelt/BeltDivId/Defenses — délibérément non vérifiés ici : ce
  // sont des champs morts, purgés par migrate() (migrateDoubleChampion,
  // state-migration.js), jamais une raison de rejeter une sauvegarde par
  // ailleurs saine. ====
  if(raw.season!==undefined && raw.season!==null){
    if(!isSaveObject(raw.season)) return false;
    if(raw.season.year!==undefined && !isSaveCounter(raw.season.year)) return false;
  }
  return true;
}
/* ==== [ANCRE: FIX_B04_VALIDATION_SANS_CONVERSION] — bornes techniques
   explicites et parcours itératif pour contrôler aussi les nombres imbriqués. ==== */
function isSaveObject(value){ return !!value && typeof value==='object' && !Array.isArray(value); }
function isSaveCounter(value){ return Number.isFinite(value) && Number.isSafeInteger(value) && value>=0; }
function hasFiniteSaveNumbers(value){
  const pending=[value], seen=new Set();
  while(pending.length){
    const item=pending.pop();
    if(typeof item==='number' && !Number.isFinite(item)) return false;
    if(item && typeof item==='object' && !seen.has(item)){
      seen.add(item); for(const child of Object.values(item)) pending.push(child);
    }
  }
  return true;
}
function validFighterNumbers(f){
  if(!isSaveObject(f)) return false;
  for(const k of ['W','L','D','ko','sub','dec','koLoss','titles','defenses','orgWins','peakStreak','botchedWeightCuts','proOfferCooldown']){
    if(f[k]!==undefined && !isSaveCounter(f[k])) return false;
  }
  if(f.streak!==undefined && !Number.isSafeInteger(f.streak)) return false;
  if(f.age!==undefined && (!Number.isFinite(f.age)||f.age<0||f.age>100)) return false;
  if(f.org!==undefined && (!isSaveCounter(f.org)||f.org>=ORGS.length)) return false;
  for(const k of ['overall','orgElo','careerElo','potential','morale','form','earnings','money','rankBoost','peakOverall','peakElo']){
    if(f[k]!==undefined && (!Number.isFinite(f[k])||Math.abs(f[k])>Number.MAX_SAFE_INTEGER)) return false;
  }
  if(f.attrs!==undefined && (!isSaveObject(f.attrs)||Object.values(f.attrs).some(v=>!Number.isFinite(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER))) return false;
  if(f.phys!=null){
    if(!isSaveObject(f.phys)) return false;
    for(const k of ['height','reach']){
      if(f.phys[k]!==undefined && (!Number.isFinite(f.phys[k])||f.phys[k]<0||f.phys[k]>Number.MAX_SAFE_INTEGER)) return false;
    }
  }
  return true;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: VALIDATE_STATE] — comble les champs manquants d'une ancienne
   sauvegarde (audit "sécurité des sauvegardes"). Corrigé par rapport au
   brouillon : G.season est un OBJET {year,fights} dans ce jeu, jamais un
   nombre — l'écraser avec 1 casserait scr_season()/compileSeasonStats(). Il
   n'existe pas de champ G.mode ici (l'arcade vit sous G.arcade.active) donc
   rien à y combler. Ne touche jamais une sauvegarde valide : uniquement les
   champs manquants (typeof===undefined / pas un tableau / pas un objet). ==== */
function repairFighter(f){
  if(!f||typeof f!=='object') return null;
  if(!f.attrs||typeof f.attrs!=='object') f.attrs={};
  for(const k of ATTR_KEYS){
    const v=f.attrs[k];
    if(!Number.isFinite(v)) f.attrs[k]=50;
  }
  f.morale=num(f.morale,60); f.form=num(f.form,55);
  f.morale=clamp(f.morale,0,100); f.form=clamp(f.form,0,100);
  if(!f.gender||!['H','F'].includes(f.gender)) f.gender='H';
  if(!f.style||!STYLES[f.style]) f.style='mma';
  f.styleLabel=styleLabel(f.style);
  const div=divById(f.div);
  if(!div) f.div=f.gender==='F'?DIVISIONS.F[0].id:DIVISIONS.H[3].id;
  f.divName=(divById(f.div)||{}).name||'';
  if(!f.phys||typeof f.phys!=='object'){
    f.phys=makePhysical(divById(f.div));
  } else {
    f.phys.height=num(f.phys.height,175);
    f.phys.reach=num(f.phys.reach,f.phys.height+2);
    if(!Array.isArray(f.phys.tags)) f.phys.tags=[];
    /* ==== [ANCRE: P8_L8_GARDE_STANCE] — Lot 8/P8 §8.2 : phys.stance est un
       champ nouveau (makePhysical, engine.js) — une sauvegarde antérieure à
       ce lot ne le porte pas. Défaut 'orthodox' (garde majoritaire), même
       principe tolérant que height/reach/tags juste au-dessus : jamais faire
       planter le chargement d'une sauvegarde ancienne. ==== */
    if(f.phys.stance!=='orthodox' && f.phys.stance!=='southpaw') f.phys.stance='orthodox';
    /* ==== [FIN ANCRE] ==== */
  }
  if(!Number.isFinite(f.overall)) f.overall=overall(f);
  if(!Number.isFinite(f.orgElo)) f.orgElo=eloBaseline(f.org||0,f.overall);
  if(!Number.isFinite(f.careerElo)) f.careerElo=eloBaseline(f.org||0,f.overall);
  if(!Number.isFinite(f.W)) f.W=0;
  if(!Number.isFinite(f.L)) f.L=0;
  if(!Number.isFinite(f.D)) f.D=0;
  if(!Number.isFinite(f.org)) f.org=0;
  if(!Number.isFinite(f.age)) f.age=20;
  if(!Number.isFinite(f.potential)) f.potential=85;
  if(!Number.isFinite(f.ko)) f.ko=0;
  if(!Number.isFinite(f.sub)) f.sub=0;
  if(!Number.isFinite(f.streak)) f.streak=0;
  if(!Number.isFinite(f.defenses)) f.defenses=0;
  if(!Array.isArray(f.skills)) f.skills=[];
  if(!Array.isArray(f.history)) f.history=[];
  if(!Array.isArray(f.seasonRecap)) f.seasonRecap=[];
  return f;
}
/* ==== [ANCRE: FIX_B03_VALIDATION_CANDIDAT] — le même validateur répare un
   candidat isolé avant publication ; sans argument, les appels existants
   continuent de valider G. Réaffecter G avant validation perdait la partie. ==== */
function validateState(state=G){
  if(!state||typeof state!=='object') return false;
  if(!state.settings||typeof state.settings!=='object') state.settings={};
  if(!state.f||typeof state.f!=='object') return false;
  repairFighter(state.f);
  const f=state.f;
  if(typeof f.earnings==='undefined') f.earnings=0;
  if(typeof f.rivalId==='undefined') f.rivalId=null;
  if(typeof f.proOfferCooldown==='undefined') f.proOfferCooldown=0;
  if(typeof f.botchedWeightCuts==='undefined') f.botchedWeightCuts=0;
  if(typeof f.rankBoost==='undefined') f.rankBoost=0;
  if(!Number.isFinite(f.peakStreak)) f.peakStreak=Math.max(f.streak||0,0);
  if(!Number.isFinite(f.peakOverall)) f.peakOverall=f.overall||0;
  if(!Number.isFinite(f.peakElo)) f.peakElo=f.orgElo||0;
  if(typeof f.narrativeArc==='undefined') f.narrativeArc=null;
  if(typeof f.orgWins==='undefined') f.orgWins=0;
  if(typeof f.injury==='undefined') f.injury=null;
  if(!f._rivalries || typeof f._rivalries!=='object') f._rivalries={};
  if(!Array.isArray(f.amaTitles)) f.amaTitles=[];
  if(typeof f.orgFlavor==='undefined') f.orgFlavor=null;
  if(typeof state.pendingAmaTitle==='undefined') state.pendingAmaTitle=null;
  if(typeof state.lastMsg==='undefined') state.lastMsg=null;
  if(!Array.isArray(f.skills)) f.skills=[];
  if(!Array.isArray(f.history)) f.history=[];
  if(!Array.isArray(f.amateurRivals)) f.amateurRivals=[];
  if(!state.season || typeof state.season!=='object' || !Array.isArray(state.season.fights)) state.season={year:(state.season&&state.season.year)||1,fights:[]};
  if(!Array.isArray(state.roster)) state.roster=makeOrgRoster(f);
  /* ==== [ANCRE: VALIDATE_STATE] — repairFighter(o) rend déjà null pour une
     entrée invalide (garde ligne 39) : pas de TypeError, mais un null
     RESTAIT dans G.roster si on se contentait d'un forEach. Un roster amputé
     de ses seules entrées corrompues (filter+map ci-dessous) est préférable
     à une régénération totale (branche if juste au-dessus) : cette dernière
     ne s'applique qu'à un G.roster structurellement absent (pas un tableau),
     pas à un tableau valide contenant quelques trous — sinon on perdrait
     aussi les fighters sains qu'il contient déjà. ==== */
  else state.roster=state.roster.map(o=>repairFighter(o)).filter(Boolean);
  if(state.fight && typeof state.fight==='object'){
    if(state.fight.opp) repairFighter(state.fight.opp);
    else if(['plan','arena','result','event'].includes(state.screen)) state.screen='hub';
  }
  if(typeof state.screen!=='string') state.screen='hub';
  if(!Array.isArray(state.ach)) state.ach=[];
  if(!Array.isArray(state.titleHistory)) state.titleHistory=[];
  return true;
}

/* ==== [FIN ANCRE] ==== */
