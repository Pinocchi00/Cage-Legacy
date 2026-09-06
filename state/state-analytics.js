"use strict";
/* CAGE LEGACY — state/state-analytics.js
   Registre méta-statistiques persistant inter-carrières (meta, localStorage
   META_STATS_KEY) + registre d'achievements débloqués (ACH_KEY). Extrait de
   state.js, aucune modification de logique. */

/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — registre historique mondial &
   statistiques globales, persistant inter-carrières (clé localStorage séparée
   du combattant actif, comme le Panthéon lui-même). ==== */
const META_STATS_KEY='cage-legacy-metastats';
const ACH_KEY='cage-legacy-achievements';
/* ==== [ANCRE: FIX_B05_REGISTRES_PROTEGES] — la vue peut exclure des entrées
   invalides, mais ne devient jamais une autorisation d'effacer l'original.
   Chaque écriture relit et valide le stockage courant (même après reload).
   Une alerte par problème évite un écran vide inexpliqué et les répétitions
   à chaque rendu ; aucun registre supplémentaire ni migration. ==== */
const registryWarnings=new Map();
function warnRegistry(key,message){
  if(registryWarnings.get(key)===message) return;
  registryWarnings.set(key,message);
  console.warn(key+': '+message); alert(message);
}
function registryLabel(key){
  return ({'cage-legacy-hof':'Panthéon','cage-legacy-metastats':'Statistiques','cage-legacy-achievements':'Succès','cage-legacy-codex':'Codex'})[key]||'Archive';
}
function readRegistry(key,decode,fallback){
  try{
    const raw=localStorage.getItem(key);
    if(raw===null){ registryWarnings.delete(key); return {value:fallback(),ok:true}; }
    const result=decode(JSON.parse(raw));
    if(result.ok) registryWarnings.delete(key);
    else warnRegistry(key,registryLabel(key)+' : données endommagées. Seules les données lisibles sont affichées. L’original est conservé et les modifications sont bloquées ; conserve une copie avant toute réparation.');
    return result;
  }catch(e){
    warnRegistry(key,registryLabel(key)+' : lecture impossible. Les données existantes sont conservées et les modifications sont bloquées.');
    return {value:fallback(),ok:false};
  }
}
function writeRegistry(key,value,decode,fallback){
  if(!readRegistry(key,decode,fallback).ok) return false;
  try{
    if(!decode(value).ok) throw new Error('Données invalides');
    const raw=JSON.stringify(value);
    localStorage.setItem(key,raw);
    if(localStorage.getItem(key)!==raw) throw new Error('Écriture non confirmée');
    return true;
  }catch(e){
    warnRegistry(key,registryLabel(key)+' : enregistrement impossible ou non confirmé. Vérifie l’espace de stockage disponible puis réessaie.');
    return false;
  }
}
function decodeIdRegistry(raw,ids){
  if(!Array.isArray(raw)) return {value:[],ok:false};
  const value=raw.filter(id=>typeof id==='string' && ids.includes(id));
  return {value,ok:value.length===raw.length};
}
function decodeAchievements(raw){ return decodeIdRegistry(raw,ACH.map(a=>a.id)); }
function loadAch(){ return readRegistry(ACH_KEY,decodeAchievements,()=>[]).value; }
function saveAch(ach){ return writeRegistry(ACH_KEY,ach,decodeAchievements,()=>[]); }
/* ==== [FIN ANCRE] ==== */
function metaStatsDefaults(){ return {totalFights:0,totalKO:0,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:0,legendPoints:0,unlockedItems:[]}; }
/* ==== [ANCRE: ANALYTICS_LOCALES] — chantier 2 : "analytics locales" demandé.
   Renforce le registre EXISTANT (meta.total*, LOT13_REGISTRE_MONDIAL ci-dessus)
   au lieu d'ouvrir une seconde clé localStorage parallèle — mêmes principes que
   meta.gauntletBest : des compteurs de surface, jamais un attribut/potentiel.
   migrateMetaStats() comble les champs manquants d'un meta plus ancien (même
   discipline tolérante que repairFighter/validateState), sans jamais toucher
   à un champ déjà présent. 100% local (META_STATS_KEY, localStorage) : aucun
   appel réseau, aucune donnée personnelle — uniquement des compteurs agrégés
   et des identifiants internes de division (divId, jamais un nom de joueur). */
function migrateMetaStats(meta){
  if(typeof meta.careersStarted!=='number'||isNaN(meta.careersStarted)) meta.careersStarted=0;
  if(typeof meta.careersCompleted!=='number'||isNaN(meta.careersCompleted)) meta.careersCompleted=meta.totalRetirements||0;
  if(typeof meta.totalWins!=='number'||isNaN(meta.totalWins)) meta.totalWins=0;
  if(typeof meta.totalLosses!=='number'||isNaN(meta.totalLosses)) meta.totalLosses=0;
  if(typeof meta.totalDraws!=='number'||isNaN(meta.totalDraws)) meta.totalDraws=0;
  if(typeof meta.bestWinStreak!=='number'||isNaN(meta.bestWinStreak)) meta.bestWinStreak=0;
  if(typeof meta.longestCareerFights!=='number'||isNaN(meta.longestCareerFights)) meta.longestCareerFights=0;
  if(typeof meta.highestOverall!=='number'||isNaN(meta.highestOverall)) meta.highestOverall=0;
  if(typeof meta.highestElo!=='number'||isNaN(meta.highestElo)) meta.highestElo=0;
  if(!meta.divisions||typeof meta.divisions!=='object'||Array.isArray(meta.divisions)) meta.divisions={};
  return meta;
}
function loadMetaStats(){
  return readRegistry(META_STATS_KEY,decodeMetaStats,()=>migrateMetaStats(metaStatsDefaults())).value;
}
/* ==== [ANCRE: FIX_B05_SCHEMA_STATISTIQUES] — conserver les compteurs et
   divisions sains sans propager chaînes, Infinity ou tableaux aux calculs.
   Les champs absents reçoivent seulement un défaut de lecture ; un objet
   vide ou un champ présent invalide bloque toute réécriture de l'archive. ==== */
function decodeMetaStats(raw){
  const value=migrateMetaStats(metaStatsDefaults());
  if(!isSaveObject(raw)) return {value,ok:false};
  let ok=Object.keys(value).some(k=>Object.hasOwn(raw,k));
  for(const [k,v] of Object.entries(raw)){
    if(k==='divisions'){
      if(!isSaveObject(v)){ ok=false; continue; }
      for(const [div,stats] of Object.entries(v)){
        if(!divById(div)||!isSaveObject(stats)||!['careers','fights','wins'].every(n=>isSaveCounter(stats[n]))){ ok=false; continue; }
        value.divisions[div]={...stats};
      }
    }else if(k==='unlockedItems'){
      if(!Array.isArray(v)){ ok=false; continue; }
      value[k]=v.filter(id=>typeof id==='string');
      if(value[k].length!==v.length) ok=false;
    }else if(typeof value[k]==='number'){
      const valid=['totalMoney','highestOverall','highestElo','legendPoints'].includes(k)
        ?Number.isFinite(v)&&v>=0&&v<=Number.MAX_SAFE_INTEGER:isSaveCounter(v);
      if(valid) value[k]=v; else ok=false;
    }else if(k==='arenaCosmetic'){
      if(typeof v==='string') value[k]=v; else ok=false;
    }else{
      if(!hasFiniteSaveNumbers(v)){ ok=false; continue; }
      Object.defineProperty(value,k,{value:v,enumerable:true,writable:true,configurable:true});
    }
  }
  return {value,ok};
}
function saveMetaStats(meta){ return writeRegistry(META_STATS_KEY,meta,decodeMetaStats,()=>migrateMetaStats(metaStatsDefaults())); }
/* ==== [FIN ANCRE] ==== */
/** Compte le début d'une nouvelle carrière (mode carrière ou Faith) — appelé
 * une seule fois, au moment exact où G.f est fixé sur le combattant fraîchement
 * créé (ui-08 : CL.create() et CL.finalizeFaithDraft()), jamais à la reprise
 * d'une partie existante (load()).
 * @param {Fighter} f */
function recordCareerStart(f){
  const meta=loadMetaStats();
  meta.careersStarted=(meta.careersStarted||0)+1;
  if(f&&f.div){
    if(!meta.divisions[f.div]) meta.divisions[f.div]={careers:0,fights:0,wins:0};
    meta.divisions[f.div].careers++;
  }
  saveMetaStats(meta);
}
/** Vue en lecture seule des analytics cumulées — même donnée que loadMetaStats(),
 * juste mise en forme (pourcentages par méthode de victoire compris) pour les
 * écrans qui veulent l'afficher (ex. scr_codex, ui-07) sans recalculer chacun
 * sa propre logique.
 * @returns {object} */
function getAnalytics(){
  const meta=loadMetaStats();
  const decided=(meta.totalKO||0)+(meta.totalSub||0)+(meta.totalDec||0);
  const pct=n=>decided>0?Math.round(n/decided*100):0;
  return {
    careersStarted:meta.careersStarted||0, careersCompleted:meta.careersCompleted||0,
    totalFights:meta.totalFights||0, totalWins:meta.totalWins||0, totalLosses:meta.totalLosses||0, totalDraws:meta.totalDraws||0,
    totalKO:meta.totalKO||0, totalSub:meta.totalSub||0, totalDec:meta.totalDec||0,
    koPct:pct(meta.totalKO||0), subPct:pct(meta.totalSub||0), decPct:pct(meta.totalDec||0),
    bestWinStreak:meta.bestWinStreak||0, longestCareerFights:meta.longestCareerFights||0,
    highestOverall:meta.highestOverall||0, highestElo:meta.highestElo||0,
    divisions:meta.divisions||{}
  };
}
/* ==== [FIN ANCRE] ==== */

function updateMetaStatsOnRetirement(f){
  const meta=loadMetaStats();
  const fights=f.W+f.L+(f.D||0);
  meta.totalFights=(meta.totalFights||0)+fights; meta.totalKO=(meta.totalKO||0)+(f.ko||0); meta.totalSub=(meta.totalSub||0)+(f.sub||0); meta.totalDec=(meta.totalDec||0)+(f.dec||0);
  meta.totalMoney=(meta.totalMoney||0)+(f.earnings||0); meta.totalBelts=(meta.totalBelts||0)+(f.titles||0); meta.totalRetirements=(meta.totalRetirements||0)+1;
  /* ==== [ANCRE: ANALYTICS_LOCALES_RETRAITE] — bilan de carrière ajouté au même
     point que le reste de la mise à jour (une seule fois, à la retraite/enshrine)
     — jamais recalculé à chaque combat, comme le reste de ce bloc. peakStreak/
     peakOverall/peakElo sont mis à jour combat par combat (ui-05, ANCRE:
     RIVALITE) ; ici on ne fait que les reporter dans le registre cumulé. ==== */
  meta.careersCompleted=(meta.careersCompleted||0)+1;
  meta.totalWins=(meta.totalWins||0)+(f.W||0); meta.totalLosses=(meta.totalLosses||0)+(f.L||0); meta.totalDraws=(meta.totalDraws||0)+(f.D||0);
  meta.bestWinStreak=Math.max(meta.bestWinStreak||0,f.peakStreak||f.streak||0,0);
  meta.longestCareerFights=Math.max(meta.longestCareerFights||0,fights);
  meta.highestOverall=Math.max(meta.highestOverall||0,f.peakOverall||f.overall||0);
  meta.highestElo=Math.max(meta.highestElo||0,f.peakElo||f.orgElo||0);
  if(f.div){
    if(!meta.divisions) meta.divisions={};
    if(!meta.divisions[f.div]) meta.divisions[f.div]={careers:0,fights:0,wins:0};
    meta.divisions[f.div].fights+=fights; meta.divisions[f.div].wins+=(f.W||0);
  }
  /* ==== [FIN ANCRE] ==== */
  saveMetaStats(meta);
}
/* ==== [FIN ANCRE] ==== */
