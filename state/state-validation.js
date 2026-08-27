"use strict";
/* CAGE LEGACY — state/state-validation.js
   Validation/réparation d'une sauvegarde : validateSave() (structurelle, sur
   le JSON brut, utilisée par state-save.js), repairFighter() et
   validateState() (réparation en place de l'état vivant G, utilisée par
   state-save.js/load()). validateState() appelle ensurePeopleRegistry()
   (state-faith.js) : couplage croisé signalé en Phase 1, non résolu par ce
   découpage — résolu à l'exécution, ordre de chargement non bloquant. */
/** Vérification STRUCTURELLE, en lecture seule, d'une sauvegarde brute (juste
 * parsée, avant migrate()/validateState() qui eux RÉPARENT en place). Ne
 * mute jamais son argument — sert uniquement à décider si cette copie est
 * assez saine pour être chargée, ou s'il faut basculer sur le backup.
 * @param {*} raw @returns {boolean} */
function validateSave(raw){
  if(!raw||typeof raw!=='object') return false;
  if(raw.version!==undefined && (typeof raw.version!=='number'||isNaN(raw.version)||raw.version<1)) return false;
  const f=raw.f;
  if(!f||typeof f!=='object') return false;
  if(typeof f.name!=='string'||!f.name) return false;
  for(const k of ['W','L']){ if(f[k]!==undefined && (typeof f[k]!=='number'||isNaN(f[k])||f[k]<0)) return false; }
  if(f.D!==undefined && (typeof f.D!=='number'||isNaN(f.D)||f.D<0)) return false;
  if(f.age!==undefined && (typeof f.age!=='number'||isNaN(f.age)||f.age<0||f.age>100)) return false;
  if(f.history!==undefined && !Array.isArray(f.history)) return false;
  if(f.div!==undefined && f.div!==null && typeof divById==='function' && !divById(f.div)) return false;
  if(raw.season!==undefined && raw.season!==null){
    if(typeof raw.season!=='object') return false;
    if(raw.season.year!==undefined && (typeof raw.season.year!=='number'||isNaN(raw.season.year)||raw.season.year<0)) return false;
  }
  return true;
}
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
    if(typeof v!=='number'||isNaN(v)) f.attrs[k]=50;
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
  }
  if(typeof f.overall!=='number'||isNaN(f.overall)) f.overall=overall(f);
  if(typeof f.orgElo!=='number'||isNaN(f.orgElo)) f.orgElo=eloBaseline(f.org||0,f.overall);
  if(typeof f.careerElo!=='number'||isNaN(f.careerElo)) f.careerElo=eloBaseline(f.org||0,f.overall);
  if(typeof f.W!=='number'||isNaN(f.W)) f.W=0;
  if(typeof f.L!=='number'||isNaN(f.L)) f.L=0;
  if(typeof f.D!=='number'||isNaN(f.D)) f.D=0;
  if(typeof f.org!=='number'||isNaN(f.org)) f.org=0;
  if(!Array.isArray(f.skills)) f.skills=[];
  if(!Array.isArray(f.history)) f.history=[];
  if(!Array.isArray(f.seasonRecap)) f.seasonRecap=[];
  return f;
}
function validateState(){
  if(!G||typeof G!=='object') return false;
  if(!G.settings||typeof G.settings!=='object') G.settings={};
  G.settings.faithAmbiance='nuit'; // [V3_DARK_ONLY] P02 : plus un réglage, une constante
  /* ==== [ANCRE: MIGRATION_PERSON_REGISTRY] — Plan V3 LOT 0 §4.1 : bloc de
     migration additif, même motif que G.settings ci-dessus — une sauvegarde
     antérieure au registre reçoit un G.people vide et fonctionnel, aucune
     donnée existante n'est réécrite. ==== */
  ensurePeopleRegistry();
  if(!G.f||typeof G.f!=='object') return false;
  repairFighter(G.f);
  const f=G.f;
  if(typeof f.earnings==='undefined') f.earnings=0;
  if(typeof f.rivalId==='undefined') f.rivalId=null;
  if(typeof f.proOfferCooldown==='undefined') f.proOfferCooldown=0;
  if(typeof f.botchedWeightCuts==='undefined') f.botchedWeightCuts=0;
  if(typeof f.rankBoost==='undefined') f.rankBoost=0;
  if(typeof f.peakStreak!=='number'||isNaN(f.peakStreak)) f.peakStreak=Math.max(f.streak||0,0);
  if(typeof f.peakOverall!=='number'||isNaN(f.peakOverall)) f.peakOverall=f.overall||0;
  if(typeof f.peakElo!=='number'||isNaN(f.peakElo)) f.peakElo=f.orgElo||0;
  if(typeof f.narrativeArc==='undefined') f.narrativeArc=null;
  if(typeof f.orgWins==='undefined') f.orgWins=0;
  if(typeof f.injury==='undefined') f.injury=null;
  if(!f._rivalries || typeof f._rivalries!=='object') f._rivalries={};
  if(!Array.isArray(f.amaTitles)) f.amaTitles=[];
  if(typeof f.orgFlavor==='undefined') f.orgFlavor=null;
  if(typeof G.pendingAmaTitle==='undefined') G.pendingAmaTitle=null;
  if(typeof G.lastMsg==='undefined') G.lastMsg=null;
  if(!Array.isArray(f.skills)) f.skills=[];
  if(!Array.isArray(f.history)) f.history=[];
  if(!Array.isArray(f.amateurRivals)) f.amateurRivals=[];
  if(!G.season || typeof G.season!=='object' || !Array.isArray(G.season.fights)) G.season={year:(G.season&&G.season.year)||1,fights:[]};
  if(!Array.isArray(G.roster)) G.roster=makeOrgRoster(f);
  else G.roster.forEach(o=>repairFighter(o));
  if(G.fight && typeof G.fight==='object'){
    if(G.fight.opp) repairFighter(G.fight.opp);
    else if(['plan','arena','result','event'].includes(G.screen)) G.screen='hub';
  }
  if(typeof G.screen!=='string') G.screen='hub';
  if(!Array.isArray(G.ach)) G.ach=[];
  if(!Array.isArray(G.titleHistory)) G.titleHistory=[];
  if(G.arcade && !G.arcade.active) G.arcade=null; // état arcade incomplet ou terminé -> repli sûr, jamais 'actif' par erreur
  return true;
}
