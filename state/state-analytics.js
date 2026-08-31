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
function loadAch(){ try{ return JSON.parse(localStorage.getItem(ACH_KEY))||[]; }catch(e){ return []; } }
function saveAch(ach){ try{ localStorage.setItem(ACH_KEY,JSON.stringify(ach)); }catch(e){} }
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
  try{ return migrateMetaStats(JSON.parse(localStorage.getItem(META_STATS_KEY))||metaStatsDefaults()); }
  catch(e){ return metaStatsDefaults(); }
}
function saveMetaStats(meta){ try{ localStorage.setItem(META_STATS_KEY,JSON.stringify(meta)); }catch(e){} }
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
