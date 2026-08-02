"use strict";
/* CAGE LEGACY — js/state.js
   État global G, sauvegarde/chargement, Panthéon persistant, migration.
   Dépend de engine.js (epithets, appelé par enshrine). legacyTitle (dans ui.js,
   appelé par enshrine) n'est résolu qu'à l'exécution : ui.js doit être chargé
   avant toute partie jouée, jamais avant l'exécution de state.js lui-même. */
/* =========================================================================
   CAGE LEGACY — Couche jouable v3 (sur moteur v2 : engine2.js concaténé).
   Lisible mobile · thème sombre/clair · 3 adversaires + %estimé · camp = 3
   choix liés au sport avec deltas visibles et bornés · orgs · fiche /20 ·
   stats de combat · 5 derniers combats · surnom gagné · épithètes de fin.
   ========================================================================= */
let G=null;
const SAVE_KEY='cage-legacy-v3';
const esc=s=>(''+s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ------------------------------ sauvegarde -------------------------------- */
/* ==== [ANCRE: SAVE_GARDE_ARCADE] — bug trouvé : arcade et carrière partageaient
   la MÊME clé de sauvegarde. Démarrer un Gauntlet écrasait la carrière dans
   localStorage ; "Reprendre" (toujours G.screen='hub') rechargeait alors le
   combattant du Gauntlet dans le hub de carrière. Un run Gauntlet ne doit
   jamais toucher au localStorage : il ne survit pas à une fermeture, exactement
   comme un roguelite classique — la vraie carrière reste intacte pendant ce temps. ==== */
function save(){ if(G&&((G.arcade&&G.arcade.active)||G.fantasyActive||G.vsFriendActive||['draft','arcadehub','gameover','fantasy_setup','allstars','vs_friend'].includes(G.screen))) return; try{ localStorage.setItem(SAVE_KEY,JSON.stringify(G)); }catch(e){} }
/* ==== [FIN ANCRE] ==== */
function load(){ try{ const s=localStorage.getItem(SAVE_KEY); if(s){ G=migrate(JSON.parse(s)); validateState(); return true; } }catch(e){ console.error('Sauvegarde illisible:',e); G=null; } return false; }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
/* ==== [ANCRE: PANTHEON] — hors wipe(), survit d'une carrière à l'autre ==== */
const HOF_KEY='cage-legacy-hof', SAVE_VERSION=2;
function loadHOF(){ try{ return JSON.parse(localStorage.getItem(HOF_KEY))||[]; }catch(e){ return []; } }
function saveHOF(l){ try{ localStorage.setItem(HOF_KEY,JSON.stringify(l)); }catch(e){} }
function hofScore(f){ return (f._world?300:0)+(f._euro?120:0)+f.defenses*30+f.W*3-f.L*4+f.ko*2+f.sub*2; }
function enshrine(f){ const [ico,rank]=legacyTitle(f); const list=loadHOF();
  list.push({id:f.id,name:f.name,nick:f.nick,flag:f.flag,style:f.styleLabel,styleKey:f.style,div:f.div,divName:f.divName,W:f.W,L:f.L,ko:f.ko,sub:f.sub,
    titles:f.titles,defenses:f.defenses,world:!!f._world,euro:!!f._euro,ico,rank,epithets:epithets(f),score:hofScore(f),age:f.age,
    amaTitles:(f.amaTitles||[]).slice(),amaRec:f.amaRec?{W:f.amaRec.W,L:f.amaRec.L}:null,biggestRival:f.biggestRival||null,
    gameMode:f.gameMode||'career',
    // Données profondes pour le Fantasy Fight / All-Stars / Vs Ami — reconstruction fidèle du combattant
    attrs:JSON.parse(JSON.stringify(f.attrs)),skills:(f.skills||[]).slice(),phys:f.phys?JSON.parse(JSON.stringify(f.phys)):null,overall:f.overall});
  list.sort((a,b)=>b.score-a.score); if(list.length>40)list.length=40; saveHOF(list);
  updateMetaStatsOnRetirement(f); awardLegendPoints(f); }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — registre historique mondial &
   statistiques globales, persistant inter-carrières (clé localStorage séparée
   du combattant actif, comme le Panthéon lui-même). ==== */
const META_STATS_KEY='cage-legacy-metastats';
function loadMetaStats(){
  try{ return JSON.parse(localStorage.getItem(META_STATS_KEY))||{totalFights:0,totalKO:0,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:0,legendPoints:0,unlockedItems:[]}; }
  catch(e){ return {totalFights:0,totalKO:0,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:0,legendPoints:0,unlockedItems:[]}; }
}
function saveMetaStats(meta){ try{ localStorage.setItem(META_STATS_KEY,JSON.stringify(meta)); }catch(e){} }
function updateMetaStatsOnRetirement(f){
  const meta=loadMetaStats();
  const fights=f.W+f.L+(f.D||0);
  meta.totalFights+=fights; meta.totalKO+=(f.ko||0); meta.totalSub+=(f.sub||0); meta.totalDec+=(f.dec||0);
  meta.totalMoney+=(f.earnings||0); meta.totalBelts+=(f.titles||0); meta.totalRetirements=(meta.totalRetirements||0)+1;
  saveMetaStats(meta);
}
function filterHallOfFame(criteria){
  const list=loadHOF();
  return list.filter(f=>{
    if(criteria.style && f.style!==criteria.style) return false;
    if(criteria.minDefenses!==undefined && (f.defenses||0)<criteria.minDefenses) return false;
    if(criteria.gameMode && (f.gameMode||'career')!==criteria.gameMode) return false;
    if(criteria.divName && f.divName!==criteria.divName) return false;
    return true;
  });
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT14_SALLE_LEGENDES] — RÈGLE ABSOLUE VÉRIFIÉE : les
   legendPoints servent UNIQUEMENT à débloquer des modes/outils/cosmétiques.
   AUCUN bonus d'attribut, de potentiel ou de vitesse n'est injecté dans
   makeFighter() ou applyDeltas() — vérifié : aucune des fonctions ci-dessous
   ne touche à f.attrs, f.potential ni aux fonctions de création/entraînement. ==== */
const LEGEND_UNLOCKABLES=[
  {id:'tool_codex',name:'Codex Inter-carrières',cat:'Outils',cost:60,desc:'Recense toutes les compétences déjà croisées, toutes carrières confondues.'},
  {id:'cosmetic_pride',name:'Toile Héritage Blanche & Bleue',cat:'Cosmétiques',cost:90,desc:'Nouveau thème visuel pour l\u2019octogone.'},
  {id:'cosmetic_gold',name:'Bâche Royale (Prestige)',cat:'Cosmétiques',cost:150,desc:'Thème visuel doré pour l\u2019octogone.'},
  {id:'cosmetic_neon',name:'Néons Cyberpunk',cat:'Cosmétiques',cost:110,desc:'Thème visuel nocturne et futuriste pour l\u2019octogone.'},
  {id:'cosmetic_underground',name:'Béton Clandestin',cat:'Cosmétiques',cost:75,desc:'L\u2019ambiance rugueuse et sombre des combats clandestins.'},
  {id:'arch_titan',name:'Archétype : Le Titan Antique',cat:'Archétypes Arcade',cost:80,desc:'Débloque un colosse inarrêtable spécialisé en lutte pour le mode Gauntlet.'},
  {id:'arch_ninja',name:'Archétype : Le Shinobi',cat:'Archétypes Arcade',cost:80,desc:'Débloque un expert en furtivité et soumissions éclairs pour le mode Gauntlet.'},
  {id:'arch_brawler',name:'Archétype : Le Roi de la Rue',cat:'Archétypes Arcade',cost:80,desc:'Débloque un spécialiste de la boxe sale et de la survie pour le mode Gauntlet.'},
  {id:'mode_vs_friend',name:'Défi Multijoueur (Vs Ami)',cat:'Modes annexes',cost:140,desc:'Oppose une de tes légendes retraitées au combattant d\u2019un ami, généré à la volée.'},
  {id:'mode_fantasy',name:'Fantasy Fight (Sandbox)',cat:'Modes annexes',cost:180,desc:'Simule un combat entre deux légendes de ton Panthéon.'},
  {id:'mode_boss',name:'Arcade : Boss Run',cat:'Modes annexes',cost:220,desc:'5 champions d\u2019affilée, KO uniquement. Le format le plus punitif du Gauntlet.'},
  {id:'mode_allstars',name:'Tournoi All-Stars (8 Légendes)',cat:'Modes annexes',cost:300,desc:'Tournoi à élimination directe entre tes 8 meilleures légendes pour désigner ton GOAT.'}
];
// Gain divisé par 10 par rapport au score brut : hofScore() peut dépasser 500
// pour une belle carrière (titre mondial + défenses + palmarès), ce qui
// débloquait tout le contenu en une seule retraite. Vise plusieurs semaines
// de jeu réel pour tout débloquer, pas quelques jours.
function awardLegendPoints(f){ const meta=loadMetaStats(); const earned=Math.round((hofScore(f)||0)/10); meta.legendPoints=(meta.legendPoints||0)+Math.max(0,earned); saveMetaStats(meta); }
function checkLegendUnlock(itemId){ return (loadMetaStats().unlockedItems||[]).includes(itemId); }
function purchaseLegendUnlock(itemId){
  const meta=loadMetaStats(); const item=LEGEND_UNLOCKABLES.find(i=>i.id===itemId);
  if(!item||checkLegendUnlock(itemId)) return {success:false,msg:"Invalide ou déjà possédé."};
  if((meta.legendPoints||0)>=item.cost){
    meta.legendPoints-=item.cost; if(!meta.unlockedItems) meta.unlockedItems=[]; meta.unlockedItems.push(itemId);
    saveMetaStats(meta); return {success:true,msg:`${item.name} débloqué avec succès !`};
  }
  return {success:false,msg:"Points de Légende insuffisants."};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<2){ g.version=2; }
  return g; }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: VALIDATE_STATE] — comble les champs manquants d'une ancienne
   sauvegarde (audit "sécurité des sauvegardes"). Corrigé par rapport au
   brouillon : G.season est un OBJET {year,fights} dans ce jeu, jamais un
   nombre — l'écraser avec 1 casserait scr_season()/compileSeasonStats(). Il
   n'existe pas de champ G.mode ici (l'arcade vit sous G.arcade.active) donc
   rien à y combler. Ne touche jamais une sauvegarde valide : uniquement les
   champs manquants (typeof===undefined / pas un tableau / pas un objet). ==== */
function validateState(){
  if(!G || !G.f) return;
  const f=G.f;
  if(typeof f.earnings==='undefined') f.earnings=0;
  if(typeof f.rivalId==='undefined') f.rivalId=null;
  if(typeof f.proOfferCooldown==='undefined') f.proOfferCooldown=0;
  if(typeof f.botchedWeightCuts==='undefined') f.botchedWeightCuts=0;
  if(typeof f.rankBoost==='undefined') f.rankBoost=0;
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
  if(!Array.isArray(G.ach)) G.ach=[];
  if(!Array.isArray(G.titleHistory)) G.titleHistory=[];
  if(G.arcade && typeof G.arcade.active==='undefined') G.arcade=null; // état arcade incomplet -> repli sûr, jamais 'actif' par erreur
}
/* ==== [FIN ANCRE] ==== */
function setTheme(t){ G.theme=t; try{ if(document.documentElement)document.documentElement.setAttribute('data-theme',t); }catch(e){} }
