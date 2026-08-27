"use strict";
/* CAGE LEGACY — state.js (en cours d'extraction vers state/*.js)
   Sauvegarde/chargement, Panthéon persistant, migration. G, esc et setTheme
   vivent désormais dans state/state-core.js (chargé avant ce fichier). */
const SAVE_KEY='cage-legacy-v3';

/* ------------------------------ sauvegarde -------------------------------- */
/* ==== [ANCRE: SAVE_GARDE_ARCADE] — bug trouvé : arcade et carrière partageaient
   la MÊME clé de sauvegarde. Démarrer un Gauntlet écrasait la carrière dans
   localStorage ; "Reprendre" (toujours G.screen='hub') rechargeait alors le
   combattant du Gauntlet dans le hub de carrière. Une run Gauntlet ne doit
   jamais toucher au localStorage : il ne survit pas à une fermeture, exactement
   comme un roguelite classique — la vraie carrière reste intacte pendant ce temps. ==== */
/* ==== [ANCRE: SAVE_BACKUP_RECOVERY] — audit "sécurité des sauvegardes" : la clé
   SAVE_KEY était écrite en une seule copie, sans filet — une écriture interrompue
   (fermeture d'onglet pendant le JSON.stringify, quota localStorage dépassé au
   milieu de l'écriture) ou une corruption silencieuse du navigateur perdait la
   carrière entière, sans recours. SAVE_BACKUP_KEY conserve toujours la DERNIÈRE
   version connue-bonne : save() y recopie l'ancien contenu de SAVE_KEY avant
   d'écrire le nouveau (jamais l'inverse — le backup a toujours un combat de
   retard, jamais plus), et load() bascule dessus automatiquement si SAVE_KEY est
   illisible ou ne passe pas validateSave(). Aucune suppression : une ancienne
   sauvegarde invalide reste en place jusqu'à la prochaine écriture réussie,
   restaurable manuellement au besoin. ==== */
const SAVE_BACKUP_KEY=SAVE_KEY+'_backup';
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
function parseAndValidate(raw){
  if(!raw) return null;
  try{ const parsed=JSON.parse(raw); return validateSave(parsed)?parsed:null; }catch(e){ return null; }
}
function save(){ if(G&&((G.arcade&&G.arcade.active)||G.fantasyActive||G.vsFriendActive||['draft','arcadehub','gameover','fantasy_setup','allstars','vs_friend'].includes(G.screen))) return;
  try{
    const previous=localStorage.getItem(SAVE_KEY);
    if(previous) localStorage.setItem(SAVE_BACKUP_KEY,previous);
    localStorage.setItem(SAVE_KEY,JSON.stringify(G));
  }catch(e){}
}
/* ==== [FIN ANCRE] ==== */
function load(){
  try{
    const primary=parseAndValidate(localStorage.getItem(SAVE_KEY));
    let parsed=primary, usedBackup=false;
    if(!parsed){
      parsed=parseAndValidate(localStorage.getItem(SAVE_BACKUP_KEY));
      if(parsed) usedBackup=true;
    }
    if(!parsed){ G=null; return false; }
    G=migrate(parsed);
    if(!validateState()){ console.error('Sauvegarde corrompue : état irrécupérable.'); G=null; return false; }
    if(usedBackup){ console.warn('Sauvegarde principale illisible ou invalide : restauration automatique depuis la copie de secours.'); save(); }
    return true;
  }catch(e){ console.error('Sauvegarde illisible:',e); G=null; }
  return false;
}
function hasSave(mode){
  try{
    let s=localStorage.getItem(SAVE_KEY);
    let p=s?JSON.parse(s):null;
    if(!validateSave(p)) p=null;
    if(!p){ const b=localStorage.getItem(SAVE_BACKUP_KEY); if(b){ const bp=JSON.parse(b); if(validateSave(bp)) p=bp; } }
    if(p){
      if(mode==='faith') return !!p.faith;
      if(mode==='career') return !p.faith;
      return true;
    }
  }catch(e){}
  return false;
}
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); localStorage.removeItem(SAVE_BACKUP_KEY); }catch(e){} }
/* ==== [ANCRE: PANTHEON] — hors wipe(), survit d'une carrière à l'autre ==== */
const HOF_KEY='cage-legacy-hof', SAVE_VERSION=3;
function loadHOF(){ try{ return JSON.parse(localStorage.getItem(HOF_KEY))||[]; }catch(e){ return []; } }
function saveHOF(l){ try{ localStorage.setItem(HOF_KEY,JSON.stringify(l)); }catch(e){} }
/* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
   f.decorations (array d'ids LEGEND_UNLOCKABLES, cat 'Décorations du
   Panthéon') vit directement sur l'entrée HOF — au même titre que
   favorite/beltHistory. "Récupération" à la suppression (deleteHof, ui-08)
   est automatique et gratuite : f.decorations disparaît avec l'entrée, la
   décoration reste possédée (meta.unlockedItems, jamais touché ici) donc
   immédiatement rééquipable ailleurs — pas de code de "recyclage" séparé
   nécessaire. */
/* ==== [ANCRE: CORRECTIF_DECORATION_UNIQUE_PANTHEON] — bug remonté : une
   décoration achetée est un déblocage de COMPTE, permanent (comme tout
   LEGEND_UNLOCKABLES) — mais l'équiper ne pouvait s'appliquer qu'à UN SEUL
   combattant à la fois dans tout le Panthéon (la boucle ci-dessous la
   retirait silencieusement de tout autre porteur). Résultat concret : dès
   qu'on possède 2-3 types de décoration, on finit par tout concentrer sur
   une seule légende "favorite", et équiper une décoration déjà portée
   ailleurs revient à la voler sans prévenir — ressenti comme "je ne peux
   personnaliser qu'un seul combattant". Chaque combattant a toujours son
   propre plafond de 3 décorations SIMULTANÉES (ligne juste au-dessus,
   inchangée), mais un même type de décoration peut désormais être porté par
   plusieurs légendes en même temps — c'est un déblocage de compte, pas un
   objet physique unique. ==== */
/* ==== [ANCRE: ALBUM_LEGEND_STYLE] — refonte demandée : le Panthéon adopte
   le langage "carte à collectionner" de L'Album (déjà choisi en Boutique
   pour la Vitrine ; ici son équivalent Panthéon). Deux fonctions PARTAGÉES,
   utilisées par scr_hof (tuiles liste), scr_legend_detail (fiche complète)
   et shopPreviewHtml (aperçu boutique) pour que le même combattant rende
   EXACTEMENT pareil partout — un seul endroit à modifier si la palette
   change un jour.
   - legendTierColor(rank) : couleur du coin de carte, par palier de
     legacyTitle (déjà calculé et stocké sur f.rank à l'intronisation,
     state.js ligne ~105 — aucune donnée nouvelle).
   - legendDecoStyle(decorations) : transforme chaque décoration en variante
     de carte plutôt qu'en simple bordure/halo générique — bordure devient
     "bordure foil", halo devient un effet holographique diagonal,
     typographie devient une gravure en relief (text-shadow), diamant reste
     un insert dégradé sur le bilan, et les 2 cosmétiques exclusifs sans
     rendu jusqu'ici (excl_mask_oni, excl_gloves_relic) deviennent des
     stickers apposés sur la carte — cohérent avec la mécanique de
     collection déjà présente (Vitrine actuelle, GOAT de ta collection). ==== */
/* ==== [ANCRE: TITRES_PANTHEON_DIVERSITE] — la grille de titres est passée de
   6 à 12 paliers : les 6 nouveaux tombaient sur le repli var(--line) et
   perdaient leur coin de carte coloré. Un ton par palier de prestige, les
   voisins partageant la même famille de couleur. ==== */
const LEGEND_TIER_COLOR={
  'LÉGENDE ÉTERNELLE':'#F4D580','MONUMENT DU SPORT':'#E8D9A0',
  'ROI DE LA CAGE':'var(--gold)','GRAND CHAMPION':'var(--gold)',
  'CHAMPION DOMINANT':'var(--sage)','CHAMPION RESPECTÉ':'var(--sage)',
  'PRÉTENDANT AU TITRE':'#4DA6FF','TÊTE D\u2019AFFICHE':'#4DA6FF','COMBATTANT ACCOMPLI':'#4DA6FF',
  'ESPOIR CONFIRMÉ':'var(--muted)','VÉTÉRAN DU CIRCUIT':'var(--muted)','GUERRIER DE L\u2019OMBRE':'var(--blood)'
};
function legendTierColor(rank){ return LEGEND_TIER_COLOR[rank]||'var(--line)'; }
function legendDecoStyle(decorations){
  decorations=decorations||[];
  const hasGold=decorations.includes('deco_frame_gold');
  const hasCrimson=decorations.includes('deco_frame_crimson');
  const hasHolo=decorations.includes('deco_glow');
  const hasEngraved=decorations.includes('deco_typography');
  const hasDiamond=decorations.includes('deco_diamond');
  const stickers=[];
  if(decorations.includes('excl_mask_oni')) stickers.push('🎭');
  if(decorations.includes('excl_gloves_relic')) stickers.push('🥊');
  return{
    borderCss:hasGold?'border-color:var(--gold);border-width:2px;':hasCrimson?'border-color:var(--blood);border-width:2px;':'',
    holoCss:hasHolo?'background-image:linear-gradient(120deg,transparent 30%,rgba(230,185,58,.30) 45%,rgba(124,151,136,.22) 58%,transparent 74%);':'',
    nameCss:hasEngraved?'text-shadow:0 1px 0 rgba(0,0,0,.65),0 -1px 0 rgba(255,255,255,.12);letter-spacing:.03em;':'',
    recordCss:hasDiamond?'background:linear-gradient(135deg,#b9f2ff,#ffffff,#8ec9d8);-webkit-background-clip:text;background-clip:text;color:transparent':'',
    stickers
  };
}
/* ==== [FIN ANCRE] ==== */
function equipPantheonDecoration(hofId,decId){
  if(!checkLegendUnlock(decId)) return {success:false,msg:'Décoration non possédée.'};
  const list=loadHOF(); const f=list.find(x=>String(x.id)===String(hofId));
  if(!f) return {success:false,msg:'Combattant introuvable.'};
  f.decorations=f.decorations||[];
  if(f.decorations.includes(decId)) return {success:false,msg:'Déjà équipée sur ce combattant.'};
  if(f.decorations.length>=3) return {success:false,msg:'Maximum 3 décorations par combattant.'};
  f.decorations.push(decId); saveHOF(list);
  return {success:true,msg:'Décoration équipée.'};
}
/* ==== [FIN ANCRE] ==== */
function unequipPantheonDecoration(hofId,decId){
  const list=loadHOF(); const f=list.find(x=>String(x.id)===String(hofId));
  if(!f||!f.decorations) return {success:false,msg:'Rien à retirer.'};
  f.decorations=f.decorations.filter(d=>d!==decId); saveHOF(list);
  return {success:true,msg:'Décoration retirée.'};
}
/* ==== [FIN ANCRE] ==== */
// Bonus double champion (+150, cf. ANCRE: BONUS_DOUBLE_CHAMPION dans engine.js) :
// une double ceinture doit peser sur le score d'héritage et les points de Légende.
function hofScore(f){ return (f._world?300:0)+(f._euro?120:0)+(f.champChampBelt?150:0)+f.defenses*30+f.W*3-f.L*4+f.ko*2+f.sub*2; }
function enshrine(f){ const [ico,rank]=legacyTitle(f); const list=loadHOF();
  // ==== [ANCRE: CORRECTIF_CEINTURES_PANTHEON] — bug remonté : seules les
  // ceintures amateur (WMA/DMMA, via amaTitles) étaient visibles dans le
  // Panthéon — aucune trace des ceintures pro gagnées dans les organisations
  // à nom d'ambiance (PVM, Iguana Iguana, etc., orgs 1 à 4), alors même que
  // G.titleHistory les enregistre déjà (recordTitleChange, ui-01). On extrait
  // ici tous les règnes de CE combattant (par nom, seule clé disponible dans
  // titleHistory) pour les figer définitivement dans l'entrée du Panthéon —
  // G.titleHistory lui-même est remis à zéro à chaque nouvelle carrière
  // (wipe()), donc cette capture est la seule façon de préserver l'info.
  const myReigns=(G.titleHistory||[]).filter(r=>r.champion===f.name);
  const beltHistory=myReigns.map(r=>({
    org:r.org,
    // ==== [ANCRE: CORRECTIF_ORGNAME_HISTORIQUE] — bug remonté : le nom
    // d'ambiance n'était fiable que pour l'organisation ACTUELLE du
    // combattant (fallback générique "Circuit national" etc. pour toutes les
    // autres), rendant les anciens règnes indiscernables entre eux malgré des
    // organisations en réalité différentes. recordTitleChange() capture
    // désormais le nom d'ambiance réel au moment même du titre (orgFlavor) —
    // on l'utilise en priorité, le fallback générique ne sert plus que pour
    // les sauvegardes antérieures à ce correctif (orgFlavor absent).
    orgName:r.orgFlavor||((r.org===f.org && f.orgFlavor && ORG_FLAVORS[r.org] && ORG_FLAVORS[r.org].includes(f.orgFlavor)) ? f.orgFlavor : (ORGS[r.org]||'Organisation')),
    divName:r.divName, year:r.year, defenses:r.defenses||0
  }));
  // Bug #11 (correctif complémentaire, hors proposition Gemini) : beltHistory
  // n'était jamais écrit sur f lui-même, seulement poussé dans l'entrée HOF —
  // le fix UI de scr_legacy() lit f.beltHistory, qui restait donc toujours
  // undefined sur l'écran de retraite. On le fixe ici pour que les deux
  // lectures (HOF et écran de retraite) pointent vers la même donnée.
  f.beltHistory=beltHistory;
  list.push({id:f.id,name:f.name,nick:f.nick,flag:f.flag,style:f.styleLabel,styleKey:f.style,div:f.div,divName:f.divName,W:f.W,L:f.L,ko:f.ko,sub:f.sub,
    titles:f.titles,defenses:f.defenses,world:!!f._world,euro:!!f._euro,ico,rank,epithets:epithets(f),score:hofScore(f),age:f.age,
    amaTitles:(f.amaTitles||[]).slice(),amaRec:f.amaRec?{W:f.amaRec.W,L:f.amaRec.L}:null,biggestRival:f.biggestRival||null,
    gameMode:f.gameMode||'career',favorite:false,
    // ==== [ANCRE: ECRAN_DETAIL_LEGENDE] — item demandé : fiche complète
    // consultable depuis le Panthéon (clic sur une carte), reprenant le même
    // esprit que l'écran de retraite. Champs additionnels capturés ici.
    beltHistory,champChampBelt:f.champChampBelt||null,
    class:f.class||null,classLabel:f.classLabel||null,
    class31:f.class31||null,class31Label:f.class31Label||null,
    motivation:f.motivation||null,
    seasonRecap:(f.seasonRecap||[]).slice(),
    notableWins:(f.history||[]).filter(h=>h.res==='win'&&h.oppWasChamp&&h.oppName).slice(-6).reverse(),
    earnedAchievements:ACH.filter(a=>{ try{ return a.t(f); }catch(e){ return false; } }).map(a=>a.id),
    nicknameHistory:(f.nicknameHistory||[]).slice(),
    /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
       nom complet (base + complément libre) figé dans le Panthéon, sinon le
       nommage du joueur disparaît à la retraite (f.signatureMove n'est pas
       autrement conservé dans l'entrée HOF). Copie légère (nom+zone+type),
       pas l'objet entier — cohérent avec le reste de cette entrée. ==== */
    signatureMove:f.signatureMove?{name:f.signatureMove.name,customSuffix:f.signatureMove.customSuffix||null,type:f.signatureMove.type,zone:f.signatureMove.zone}:null,
    /* ==== [FIN ANCRE] ==== */
    // Données profondes pour le Fantasy Fight / All-Stars / Vs Ami — reconstruction fidèle du combattant
    attrs:JSON.parse(JSON.stringify(f.attrs)),skills:(f.skills||[]).slice(),phys:f.phys?JSON.parse(JSON.stringify(f.phys)):null,overall:f.overall});
  // Limite à 20 : les favoris sont protégés, seuls les non-favoris sont purgés
  // au tri par score une fois la limite atteinte.
  const favs=list.filter(x=>x.favorite);
  const nonFavs=list.filter(x=>!x.favorite).sort((a,b)=>b.score-a.score);
  const keepNonFavs=nonFavs.slice(0,Math.max(0,20-favs.length));
  saveHOF(favs.concat(keepNonFavs).sort((a,b)=>b.score-a.score));
  updateMetaStatsOnRetirement(f); awardLegendPoints(f); }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — META_STATS_KEY, ACH_KEY, loadAch,
   saveAch, metaStatsDefaults, migrateMetaStats, loadMetaStats, saveMetaStats,
   recordCareerStart, getAnalytics : déplacés vers state/state-analytics.js. ==== */
/* ==== [ANCRE: REJOUABILITE_RECORD_GAUNTLET] — meta.gauntletBest{bracket64,
   ladder_100,boss_run} : record persistant par format, lu au menu (ui-06) et
   à l'écran de fin de run (ui-04). Sémantique par format (plus haut = mieux
   SAUF ladder_100 où le rang #1 est le sommet, donc "plus BAS = mieux") :
   bracket64 -> meilleur roundStep atteint (1 à 7=victoire) ; ladder_100 ->
   meilleur (plus bas) rang atteint (100 au départ, 1 = sommet) ; boss_run ->
   meilleur streak KO enchaîné (0 à 5). N'écrit JAMAIS d'attribut/potentiel —
   même garde-fou que LOT14_SALLE_LEGENDES ci-dessus. ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — meta.gauntletBest[mode] était un SCALAIRE
   (un record unique par format). Avec les paliers d'Ascension, un record de
   palier 0 et un record de palier 3 ne sont plus comparables : le champ
   devient un dictionnaire {niveauAscension: valeur}. migrateGauntletBest()
   convertit l'ancien scalaire en {0:valeur} au premier accès — aucune perte
   de record existant. recordGauntletBest() garde sa signature à 3 arguments
   (les 6 appels existants dans ui-08 restent valides) : le niveau est lu sur
   G.arcade.asc quand il n'est pas passé explicitement.
   RÈGLE LOT14 RESPECTÉE : aucune de ces fonctions n'écrit d'attribut, de
   potentiel ni de vitesse — uniquement des compteurs de méta-progression. ==== */
const GAUNTLET_ASC_MAX=5;
function migrateGauntletBest(meta){
  if(!meta.gauntletBest){ meta.gauntletBest={}; return meta; }
  for(const k in meta.gauntletBest){
    if(typeof meta.gauntletBest[k]==='number') meta.gauntletBest[k]={0:meta.gauntletBest[k]};
  }
  return meta;
}
function gauntletAscLevel(meta,mode){ return (meta.gauntletAscension&&meta.gauntletAscension[mode])||0; }
function gauntletBestGet(meta,mode,asc){
  migrateGauntletBest(meta);
  const per=meta.gauntletBest[mode]; if(!per) return undefined;
  return per[asc===undefined?0:asc];
}
/* ==== [ANCRE: TOUR_ASCENSION_CONDITIONS_MESUREES] — item demandé : "vérifier
   les conditions d'équilibrage des paliers et réorganiser en fonction du
   taux de réussite le plus adapté". Mesuré au Monte-Carlo (250-400 runs
   simulées par palier et par format, via simulateFight, progression de camp
   incluse) — ce que le code d'origine reconnaissait ne jamais avoir fait
   ("aucun Monte Carlo derrière", cf. ANCRE GAUNTLET_ASCENSION, ui-03).
   Résultat au palier 0, avec l'ancienne condition « remporter le format » :
     Bracket 64  — tournoi remporté .... 1,8 %
     Boss Run    — 5 boss battus ....... 2,0 %
     Ladder 100  — rang 1 atteint ...... 0,0 %
   Les 5 paliers × 3 formats étaient donc du contenu mort : impossible
   d'ouvrir l'Ascension 1, donc aucune des suivantes. La difficulté des
   combats n'est PAS touchée (ce serait un changement de sensation de jeu
   bien plus risqué) : seule change la performance qui ouvre le palier
   suivant, recalée sur ~20-27 % de réussite au palier 0 — un objectif qui
   demande une bonne run sans exiger un quasi-sans-faute :
     Bracket 64  — quarts de finale .... 27 %
     Boss Run    — 2 boss battus ....... 21 %
     Ladder 100  — top 30 .............. ~25 %
   Remporter le format débloque toujours, forcément (le seuil est inclus).
   'better' dit dans quel sens va la progression : le Ladder se compte à
   l'envers (rang 1 = meilleur), les deux autres montent. ==== */
const GAUNTLET_ASC_UNLOCK={
  bracket64:{need:4,better:'up',goal:'atteindre les quarts de finale'},
  ladder_100:{need:30,better:'down',goal:'entrer dans le top 30'},
  boss_run:{need:2,better:'up',goal:'battre 2 boss'}
};
/** Objectif d'ouverture du palier suivant, en clair, pour l'affichage.
 * @param {string} mode @returns {string} */
function gauntletAscUnlockGoal(mode){ return (GAUNTLET_ASC_UNLOCK[mode]||GAUNTLET_ASC_UNLOCK.bracket64).goal; }
/** La performance de la run ouvre-t-elle le palier suivant ?
 * @param {string} mode @param {number} progress profondeur atteinte (rang pour le Ladder)
 * @returns {boolean} */
function gauntletAscUnlockReached(mode,progress){
  const r=GAUNTLET_ASC_UNLOCK[mode];
  if(!r || progress===undefined || progress===null) return false;
  return r.better==='down' ? progress<=r.need : progress>=r.need;
}
/* ==== [FIN ANCRE] ==== */
function recordGauntletAscension(meta,mode,asc){
  if(!meta.gauntletAscension) meta.gauntletAscension={};
  const cur=meta.gauntletAscension[mode]||0;
  const next=Math.min(GAUNTLET_ASC_MAX,(asc||0)+1);
  if(next>cur){ meta.gauntletAscension[mode]=next; return true; }
  return false;
}
/* ==== [ANCRE: PROCHAIN_OBJECTIF] — un joueur qui ouvre le jeu pour la
   première fois ne sait pas par où entrer. Un encart d'amorçage le lui dit,
   au menu du Gauntlet, et disparaît dès qu'il a joué une run : passé ce
   cap, il sait où il va et l'écran n'a plus à le lui répéter. La version
   précédente restait affichée en permanence et changeait de cible au fil de
   la progression — jugée trop encombrante, ramenée à ce seul rôle. ==== */
/** L'amorçage, et lui seul : ce qu'il faut faire quand on n'a encore rien
 * joué. Une fois la première run terminée, il n'y a plus rien à afficher —
 * le joueur sait où il va, l'encart s'efface.
 * @returns {?{titre:string,detail:string,cta:{label:string,onclick:string}}} */
function nextObjective(){
  const meta=loadMetaStats();
  if(meta.totalFights>0) return null;
  return {titre:'Lance une première run de Gauntlet',
    detail:'Un combattant tiré au sort, des adversaires à enchaîner : la façon la plus rapide de voir à quoi ressemble le jeu.',
    cta:{label:'Commencer',onclick:"CL.go('gauntlet_menu')"}};
}
/* ==== [FIN ANCRE] ==== */
function recordGauntletBest(meta,mode,value,asc){
  migrateGauntletBest(meta);
  const lvl=(asc===undefined||asc===null)
    ?((typeof G!=='undefined'&&G&&G.arcade&&G.arcade.asc)||0)
    :asc;
  if(!meta.gauntletBest[mode]) meta.gauntletBest[mode]={};
  const cur=meta.gauntletBest[mode][lvl];
  const better=(mode==='ladder_100')?(cur===undefined||value<cur):(cur===undefined||value>cur);
  if(better){ meta.gauntletBest[mode][lvl]=value; return true; }
  return false;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — couche 1 de la méta-progression du
   mode Faith : une carrière scellée disparaît avec le combattant (retiré,
   enshrine() l'a déjà copié dans le Panthéon), mais rien ne restait pour
   comparer une carrière à celle d'avant — chaque partie recommençait de
   zéro sans mémoire du record personnel. meta.faithLegends conserve les 12
   meilleures carrières Faith jamais scellées (triées par score), et
   meta.faithBest/meta.faithRuns le record et le nombre total de carrières
   pour l'affichage "précédent record" sans avoir à parcourir la liste.
   Même discipline que meta.gauntletBest ci-dessus (RÈGLE LOT14 RESPECTÉE) :
   entry est un résumé de surface (score, identité, palmarès), jamais un
   attribut, un potentiel ni une vitesse — aucune de ces fonctions ne
   redonne le moindre avantage à une future carrière. ==== */
const FAITH_LEGENDS_MAX=12;
function recordFaithLegend(entry){
  const meta=loadMetaStats();
  if(!meta.faithLegends) meta.faithLegends=[];
  meta.faithLegends.push(entry);
  meta.faithLegends.sort((a,b)=>(b.score||0)-(a.score||0));
  if(meta.faithLegends.length>FAITH_LEGENDS_MAX) meta.faithLegends.length=FAITH_LEGENDS_MAX;
  meta.faithBest=Math.max(meta.faithBest||0,entry.score||0);
  meta.faithRuns=(meta.faithRuns||0)+1;
  saveMetaStats(meta);
}
function getFaithBest(){ return loadMetaStats().faithBest||0; }
/* ==== [FIN ANCRE] ==== */
/* Profil du joueur : max 1 titre + 1 effet affichés à la fois (compte
   entier, pas par combattant — les combattants arcade sont jetables et non
   persistés, cf. règle déjà établie ailleurs dans ce fichier). */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — meta.gauntletBest[mode][asc]
   reste un SCALAIRE global partagé par les 23+ archétypes (comportement
   inchangé, lu par gauntletMenuBestTag/finaliseGauntletRun) : y ajouter une
   dimension archétype en place aurait exigé de migrer sa forme partout où
   il est lu, avec le risque de casser le record global déjà en place chez
   des joueurs existants. À la place, meta.gauntletBestByArchetype[mode]
   [asc][archetypeNick] est une structure PARALLÈLE et INDÉPENDANTE, jamais
   lue par l'ancien système : aucune migration nécessaire, aucun risque sur
   les records déjà enregistrés. archetypeNick = G.f.nick au moment du run
   (identifiant stable posé par makeArcadeArchetype(), jamais modifié en
   arcade — pas d'évolution de surnom hors mode carrière). ==== */
function gauntletBestByArchetypeGet(meta,mode,asc,archetypeNick){
  const perMode=meta.gauntletBestByArchetype&&meta.gauntletBestByArchetype[mode];
  const perAsc=perMode&&perMode[asc===undefined?0:asc];
  return perAsc?perAsc[archetypeNick]:undefined;
}
function recordGauntletBestByArchetype(meta,mode,value,asc,archetypeNick){
  if(!archetypeNick) return false;
  const lvl=asc===undefined||asc===null?0:asc;
  if(!meta.gauntletBestByArchetype) meta.gauntletBestByArchetype={};
  if(!meta.gauntletBestByArchetype[mode]) meta.gauntletBestByArchetype[mode]={};
  if(!meta.gauntletBestByArchetype[mode][lvl]) meta.gauntletBestByArchetype[mode][lvl]={};
  const per=meta.gauntletBestByArchetype[mode][lvl];
  const cur=per[archetypeNick];
  const better=(mode==='ladder_100')?(cur===undefined||value<cur):(cur===undefined||value>cur);
  if(better){ per[archetypeNick]=value; return true; }
  return false;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : registre
   PARALLÈLE et INDÉPENDANT à meta.gauntletBestByArchetype ci-dessus, même
   principe (pas de migration, aucun risque sur les records déjà enregistrés).
   Stocke, pour la MEILLEURE run connue par mode/palier/archétype, la liste
   ordonnée des snapshots de chaque combat de cette run (dégâts subis par
   zone + amenées au sol + knockdowns — seules données déjà suivies par le
   moteur, cf. res.stats.A dans engine.js). Écrasé uniquement quand
   recordGauntletBestByArchetype() renvoie true (nouveau record), jamais
   avant — cf. finaliseGauntletRun() (ui-08). ==== */
function gauntletGhostLogGet(meta,mode,asc,archetypeNick){
  const perMode=meta.gauntletGhostLog&&meta.gauntletGhostLog[mode];
  const perAsc=perMode&&perMode[asc===undefined?0:asc];
  return perAsc?perAsc[archetypeNick]:undefined;
}
function recordGauntletGhostLog(meta,mode,asc,archetypeNick,fights){
  if(!archetypeNick) return;
  const lvl=asc===undefined||asc===null?0:asc;
  if(!meta.gauntletGhostLog) meta.gauntletGhostLog={};
  if(!meta.gauntletGhostLog[mode]) meta.gauntletGhostLog[mode]={};
  if(!meta.gauntletGhostLog[mode][lvl]) meta.gauntletGhostLog[mode][lvl]={};
  meta.gauntletGhostLog[mode][lvl][archetypeNick]=(fights||[]).map(x=>({dmgHead:x.dmgHead||0,dmgBody:x.dmgBody||0,dmgLegs:x.dmgLegs||0,td:x.td||0,kd:x.kd||0}));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_DAILY] — graine du jour. Aucun serveur, aucun compte :
   la graine est DÉRIVÉE de la date locale (YYYYMMDD), donc identique pour
   tout le monde le même jour sans échange réseau, et _rollGauntletSeed()
   (ui-08) sait déjà hacher une chaîne numérique. Une seule tentative par
   jour et par format, mémorisée dans meta (clé localStorage séparée de la
   sauvegarde, donc survit au fait qu'une run Gauntlet n'est JAMAIS persisté —
   cf. ANCRE SAVE_GARDE_ARCADE ci-dessus). ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* updateMetaStatsOnRetirement : déplacé vers state/state-analytics.js. */
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
  /* ==== [ANCRE: GAUNTLET_MENU_HIERARCHIE] — ajout #2 (24 ajouts, 12/08/2026) :
     flag gauntlet:true sur les entrées réellement liées au Gauntlet
     (cosmétiques d'octogone utilisés en Gauntlet + archétypes + Boss Run),
     lu par scr_legends (ui-07) pour le filtre "Boutique (filtrée Gauntlet)"
     ouvert depuis scr_gauntlet_menu. Les modes 100% carrière (Vs Ami,
     Fantasy, All-Stars) et les Scénarios restent gauntlet:false (absent =
     false), volontairement exclus du filtre pour ne pas le diluer. ==== */
  {id:'tool_codex',name:'Codex Inter-carrières',cat:'Outils',cost:40,desc:'Ajoute un panneau de statistiques cumulées (compétences par rareté, carrières et combats totaux) directement dans le Codex.'},
  {id:'cosmetic_pride',name:'Toile Héritage Blanche & Bleue',cat:'Cosmétiques',cost:75,desc:'Nouveau thème visuel pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_gold',name:'Bâche Royale (Prestige)',cat:'Cosmétiques',cost:140,desc:'Thème visuel doré pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_neon',name:'Néons Cyberpunk',cat:'Cosmétiques',cost:105,desc:'Thème visuel nocturne et futuriste pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_underground',name:'Béton Clandestin',cat:'Cosmétiques',cost:50,desc:'L\u2019ambiance rugueuse et sombre des combats clandestins.',gauntlet:true},
  {id:'cosmetic_crimson',name:'Arène Écarlate',cat:'Cosmétiques',cost:125,desc:'Thème visuel rouge sang pour l\u2019octogone, pour les carrières les plus brutales.',gauntlet:true},
  {id:'arch_titan',name:'Archétype : Le Titan Antique',cat:'Archétypes Arcade',cost:90,desc:'Débloque un colosse inarrêtable spécialisé en lutte pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_ninja',name:'Archétype : Le Shinobi',cat:'Archétypes Arcade',cost:90,desc:'Débloque un expert en furtivité et soumissions éclairs pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_brawler',name:'Archétype : Le Roi de la Rue',cat:'Archétypes Arcade',cost:95,desc:'Débloque un spécialiste de la boxe sale et de la survie pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_sniper',name:'Archétype : Le Sniper',cat:'Archétypes Arcade',cost:95,desc:'Débloque un spécialiste du combat à distance en Muay Thaï pour le mode Gauntlet.',gauntlet:true},
  {id:'mode_vs_friend',name:'Défi Multijoueur (Vs Ami)',cat:'Modes annexes',cost:165,desc:'Oppose une de tes légendes retraitées au combattant d\u2019un ami, généré à la volée.'},
  {id:'mode_fantasy',name:'Fantasy Fight (Sandbox)',cat:'Modes annexes',cost:190,desc:'Simule un combat entre deux légendes de ton Panthéon.'},
  {id:'mode_boss',name:'Arcade : Boss Run',cat:'Modes annexes',cost:250,desc:'5 champions d\u2019affilée, KO uniquement. Le format le plus punitif du Gauntlet.',gauntlet:true},
  {id:'mode_allstars',name:'Tournoi All-Stars (8 Légendes)',cat:'Modes annexes',cost:270,desc:'Tournoi à élimination directe entre tes 8 meilleures légendes pour désigner ton GOAT.'},
  // ==== [ANCRE: REFONTE_SCENARIOS] — 2 scénarios réservés (cf. SCENARIOS dans
  // engine.js, champ legendUnlock). Coûts calés entre les archétypes (80) et
  // le Boss Run (220) : plus exigeants qu'un simple cosmétique/archétype
  // (un scénario entier à réussir), mais plus accessibles qu'un mode annexe
  // complet.
  {id:'scenario_finisseur',name:'Scénario : Le Finisseur',cat:'Scénarios',cost:110,desc:'Débloque le défi "Le Finisseur" : titre mondial sans jamais gagner à la décision.'},
  {id:'scenario_regne',name:'Scénario : Le Règne Sans Faille',cat:'Scénarios',cost:135,desc:'Débloque le défi "Le Règne Sans Faille" : 5 défenses de titre continental sans jamais perdre la ceinture.'},
  /* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
     décorations "flex" pour combattants retraités. Achat PERMANENT (compte),
     mais équipement UNIQUE (une décoration donnée n'est portée que par un
     seul combattant du Panthéon à la fois — cf. equipPantheonDecoration
     plus bas, qui la retire d'un éventuel porteur précédent). Maximum 3
     équipées simultanément par combattant. gauntlet:false : ce sont des
     décorations de Panthéon (carrière), pas du contenu Gauntlet. */
  {id:'deco_frame_gold',name:'Cadre Doré (Décoration)',cat:'Décorations du Panthéon',cost:60,desc:'Cadre doré autour de la fiche du combattant retraité.'},
  {id:'deco_frame_crimson',name:'Cadre Écarlate (Décoration)',cat:'Décorations du Panthéon',cost:60,desc:'Cadre rouge sang autour de la fiche du combattant retraité.'},
  {id:'deco_glow',name:'Effet de Lumière (Décoration)',cat:'Décorations du Panthéon',cost:100,desc:'Halo lumineux doré autour du nom du combattant.'},
  {id:'deco_typography',name:'Typographie Gravée (Décoration)',cat:'Décorations du Panthéon',cost:45,desc:'Nom du combattant affiché dans une typographie ornementale exclusive.'},
  {id:'deco_diamond',name:'Palmarès en Diamant (Décoration)',cat:'Décorations du Panthéon',cost:120,desc:'Le bilan (victoires-défaites) scintille en diamant sur la fiche.'},
  /* ==== [ANCRE: TOUT_EN_BOUTIQUE] — item demandé : les contenus qui
     n'existaient qu'à travers une mécanique de rotation ou de hasard —
     offre du jour, Caisse Mystère, récompense de série quotidienne —
     rejoignent le catalogue et s'achètent directement, comme le reste.
     Leurs identifiants sont conservés tels quels : un joueur qui les avait
     déjà obtenus par l'ancien chemin les garde acquis, sans migration.
     Prix calés en haut de leur catégorie, ces articles étant les plus
     prestigieux (ils étaient rares ou exclusifs). ==== */
  {id:'excl_banner_ash',name:'Bannière Cendrée',cat:'Cosmétiques',cost:180,desc:'Thème d\u2019octogone : variante sombre et cendrée de l\u2019Arène Écarlate.',gauntlet:true},
  {id:'cosmetic_renegade',name:'Toile Braise du Renégat',cat:'Cosmétiques',cost:200,desc:'Thème d\u2019octogone : braises orange sur toile calcinée.',gauntlet:true},
  {id:'arch_lottery_phoenix',name:'Archétype : Le Phénix Cendré',cat:'Archétypes Arcade',cost:215,desc:'Débloque un combattant qui renaît de ses cendres : plus il encaisse, plus il devient dangereux.',gauntlet:true},
  {id:'excl_mask_oni',name:'Masque du Oni (Décoration)',cat:'Décorations du Panthéon',cost:145,desc:'Décoration de fiche au masque de démon, sur fond sombre.'},
  {id:'excl_gloves_relic',name:'Gants-Relique (Décoration)',cat:'Décorations du Panthéon',cost:155,desc:'Décoration de fiche au style usé et ancien, comme des gants de légende.'}
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
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
/* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026) :
   nouvelle section boutique, consommables à USAGE UNIQUE, appliqués
   AUTOMATIQUEMENT au début de la PROCHAINE run Gauntlet (pas de réserve —
   un seul en attente à la fois, cf. purchaseGauntletConsumable ci-dessous).
   ⚠️ Le Gauntlet n'a pas de forme/moral (juste le flag interne formBroken,
   cf. GAUNTLET_SANS_MORAL_FORME ailleurs) — aucun consommable ne cible donc
   forme/moral, conformément à la mise en garde de la spec. ⚠️ Toutes les
   valeurs fx sont exprimées ici en échelle BRUTE 1-100 (déjà converties
   depuis l'échelle affichée /20 de la spec : facteur ×5, cf. d20() dans
   engine.js — ex. "+3 Cardio" /20 devient fx.cardio:+15). ==== */
const GAUNTLET_CONSUMABLES=[
  {id:'cons_veto',name:'Droit de véto',cost:70,kind:'veto',desc:'Annule le 1er adversaire généré de la prochaine run, un autre est tiré à sa place.'},
  {id:'cons_shelter',name:'Mise à l\u2019abri automatique',cost:60,kind:'autobank',desc:'Sécurise automatiquement une petite somme dès le 1er combat gagné de la run.'},
  {id:'cons_safetynet',name:'Filet de sécurité',cost:90,kind:'safetynet',desc:'Offre une 2e chance si tu perds le 1er combat de la run — l\u2019adversaire est retiré sans mettre fin à la run.'},
  {id:'cons_strength',name:'Potion de force',cost:50,kind:'buff',fx:{power:15},desc:'Boost temporaire de Puissance (+3), actif pour toute la run.'},
  {id:'cons_dope',name:'Dopage légal',cost:65,kind:'buff',fx:{cardio:15,power:20,durability:-5},desc:'+3 Cardio, +4 Puissance, -1 Résistance, actif pour toute la run.'},
  {id:'cons_camp',name:'Camp d\u2019entraînement rigoureux',cost:65,kind:'buff',fx:{strength:10,composure:10,fightIQ:10},desc:'+2 Force, +2 Sang-froid, +2 Intelligence, actif pour toute la run.'}
];
function purchaseGauntletConsumable(meta,itemId){
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===itemId);
  if(!item) return {success:false,msg:'Consommable invalide.'};
  if(meta.gauntletPendingConsumable) return {success:false,msg:'Un consommable est déjà en attente pour ta prochaine run — pas de réserve possible.'};
  if((meta.legendPoints||0)<item.cost) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=item.cost; meta.gauntletPendingConsumable=itemId;
  return {success:true,msg:`${item.name} appliqué à ta prochaine run Gauntlet.`};
}
/* Appelée UNE SEULE FOIS à la création de G.arcade (startArcade/startBossRun/
   startLadder100, ui-03/ui-08) : consomme le consommable en attente (plus de
   réserve après ça) et pose les drapeaux/effets correspondants sur la run
   qui démarre. Les effets 'veto'/'autobank'/'safetynet' sont de simples
   drapeaux lus/consommés ailleurs (selectDraft pour veto, afterResult pour
   autobank et safetynet, ui-08) — 'buff' est appliqué immédiatement ici,
   directement sur G.f.attrs (permanent pour la durée de la run, même
   principe que les deltas de camp d'entraînement). */
function applyPendingGauntletConsumable(a){
  const meta=loadMetaStats();
  const itemId=meta.gauntletPendingConsumable;
  if(!itemId) return;
  meta.gauntletPendingConsumable=null; saveMetaStats(meta);
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===itemId);
  if(!item) return;
  a.activeConsumable=itemId;
  if(item.kind==='buff' && typeof G!=='undefined' && G && G.f){
    Object.entries(item.fx).forEach(([k,v])=>{ G.f.attrs[k]=clamp((G.f.attrs[k]||50)+v,1,100); });
  } else if(item.kind==='veto'){ a.consumableVeto=true; }
  else if(item.kind==='autobank'){ a.consumableAutobank=true; }
  else if(item.kind==='safetynet'){ a.consumableSafetynet=true; }
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
   UNIQUEMENT en Gauntlet. Coût "astronomique", volontairement croissant
   avec la profondeur déjà atteinte (plus tu es allé loin, plus cher de
   sauver la run — cohérent avec "astronomique" et avec le fait qu'une run
   profonde vaut plus la peine d'être sauvée). Fonction pure (aucune
   dépendance à G) : lit uniquement l'objet arcade passé en argument, pour
   rester utilisable aussi bien à l'affichage (scr_gameover, ui-04) que dans
   la validation d'achat (CL.buyDevilContinue, ui-08). ==== */
function gauntletDevilCost(mode,a){
  let depth=0;
  if(mode==='boss_run') depth=a.streak||0;
  else if(mode==='ladder_100') depth=Math.max(0,100-(a.rank||100));
  else depth=(a.tournament&&a.tournament.roundStep)||1;
  return 500+depth*150;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  /* ==== [ANCRE: FAITH_CINQ_TEMPS] — l'année Faith est passée de 3 à 5 temps.
     Une partie sauvegardée sous l'ancienne numérotation se retrouverait au
     mauvais moment de l'année : step 3 valait « combat », il vaut désormais
     « le monde ». Correspondance par intention, pas par arithmétique —
     l'ancien 3 devient 4 (l'octogone), pas 5 (le bilan), sans quoi le joueur
     sauterait le combat qu'il s'apprêtait à disputer. Le drapeau
     stepScale5 rend la migration idempotente. ==== */
  if(g.faith && !g.faith.stepScale5){
    const ancien=g.faith.step||1;
    g.faith.step=(ancien>=3)?4:ancien;
    g.faith.stepScale5=true;
  }
  return g; }
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
/* ==== [ANCRE: PERSON_REGISTRY] — Plan V3 LOT 0 §4.1. « Le jeu n'a pas de
   notion d'être humain persistant. » Avant ce correctif, le coach était la
   chaîne littérale 'Le coin' (ui-04), l'agent un archétype sans nom
   (FAITH_AGENTS), et le partenaire d'entraînement affiché était recalculé
   par tri à chaque rendu (topPartner=F.gym.slice().sort(...)[0]) — c'est
   la cause EXACTE du bug remonté « Marcus est devenu Sean sans raison » :
   il n'était jamais désigné, seulement premier au tri.

   G.people = {byId, byKey, nextId} est le registre. Une Person mintée pour
   une clé stable (directeur d'une organisation, agent en poste, coach
   principal, journaliste qui suit la carrière) est TOUJOURS récupérée par
   personEnsure(), jamais reminée — c'est ce qui garantit qu'un
   personId stocké sur G.faith (F.coachId, F.sparringIds[]...) ne change
   que par un événement explicite portant une cause (state.leftReason),
   jamais par un recalcul de tri. Les rôles sans clé stable (sparring,
   fighter générique) mintent une personne réellement nouvelle à chaque
   appel — c'est le comportement voulu pour peupler un roster.

   Ce lot construit le REGISTRE et sa migration ; le RACCORDEMENT des
   écrans existants (scr_faith_contacts, F.agent, FAITH_DIRECTORS[org]...)
   à des Person réelles est le travail des LOTs 2 (coach/salle/contacts) et
   4 (agent) — les rattacher tous ici aurait mélangé fondation et
   contenu/écrans, contrairement à l'ordre de dépendance du document. ==== */
/** Représente humainement un rôle (LOT 2, 5.2.1c : 5 axes de relation, pas
 * une jauge unique — `debt`/`distance` étendent le triplet trust/respect/
 * resentment déjà écrit en §4.1 ; superset qui satisfait les deux
 * descriptions du document sans migration douloureuse plus tard).
 * @typedef {{id:number, firstName:string, lastName:string,
 *   nickname:?string, flag:string, born:string,
 *   role:'coach'|'sparring'|'agent'|'director'|'journalist'|'fighter',
 *   bio:{origin:string,past:string,trait:string},
 *   rel:{since:number,trust:number,respect:number,resentment:number,
 *     debt:number,distance:number,arc:{year:number,text:string}[]},
 *   state:{gymId:?string,active:boolean,leftAt:?number,leftReason:?string},
 *   memory:string[], extra:?object}} Person */
function ensurePeopleRegistry(){
  if(!G.people || typeof G.people!=='object' || !G.people.byId){
    G.people = { byId:{}, byKey:{}, nextId:1 };
  }
  if(!G.people.byKey || typeof G.people.byKey!=='object') G.people.byKey={};
  return G.people;
}
function personDefaultRel(){
  return { since:(G.faith&&G.faith.year)||(G.season&&G.season.year)||1,
    trust:50, respect:50, resentment:0, debt:0, distance:0, arc:[] };
}
/** Clé de dédoublonnage stable — deux appels avec la même clé renvoient
 * TOUJOURS la même Person (jamais reminée). null = pas de dédoublonnage
 * (sparrings/fighters génériques : chaque appel doit créer quelqu'un de
 * réellement nouveau).
 * @param {string} role @param {object} ctx @returns {?string} */
function personKeyFor(role,ctx){
  if(ctx && ctx.key!=null) return role+':'+ctx.key;
  if(role==='director') return 'director:'+((ctx&&ctx.org)||0);
  if(role==='agent') return 'agent:'+((ctx&&ctx.slot)||'main');
  if(role==='coach') return 'coach:'+((ctx&&ctx.slot)||'main');
  if(role==='journalist') return 'journalist:main';
  return null;
}
/** Construit une Person neuve à partir des pools de data-people.js pour
 * les rôles nommés, ou d'une identité générée (makeName, engine.js) pour
 * les rôles sans pool dédié. Jamais appelée directement par un écran —
 * seulement par personEnsure(). @param {string} role @param {object} ctx
 * @returns {Person} */
function personMint(role,ctx){
  ctx = ctx||{};
  const reg = ensurePeopleRegistry();
  const id = reg.nextId++;
  const base = { id, nickname:null, role, bio:{origin:'',past:'',trait:''},
    rel:personDefaultRel(), state:{gymId:ctx.gymId||null,active:true,leftAt:null,leftReason:null}, memory:[] };
  if(role==='director'){
    const pool=(typeof FAITH_DIRECTORS!=='undefined')?FAITH_DIRECTORS:[];
    const d=pool[ctx.org]||pool[0]||{name:'Inconnu',lastName:'',archetype:'loyaliste',trait:''};
    return Object.assign(base,{firstName:d.name,lastName:d.lastName||'',flag:'',born:'',
      bio:{origin:'Dirige l’organisation.',past:d.trait||'',trait:d.trait||''},
      extra:{archetype:d.archetype,grants:d.grants,refuses:d.refuses,counter:d.counter}});
  }
  if(role==='agent'){
    const pool=((typeof FAITH_AGENT_ROSTER!=='undefined')?FAITH_AGENT_ROSTER:[]).filter(a=>!reg.byId[reg.byKey['agent:'+a.id]]);
    const a=pick(pool.length?pool:((typeof FAITH_AGENT_ROSTER!=='undefined')?FAITH_AGENT_ROSTER:[{firstName:'Agent',lastName:'',archetype:'fidele',ck:'FR',trait:''}]));
    const flag=(typeof COUNTRIES!=='undefined'&&COUNTRIES[a.ck])?COUNTRIES[a.ck].flag:'';
    return Object.assign(base,{firstName:a.firstName,lastName:a.lastName,flag,born:a.ck||'',
      bio:{origin:'Agent de combattants.',past:a.trait||'',trait:a.trait||''},
      extra:{archetype:a.archetype}});
  }
  if(role==='coach'){
    const pool=(typeof FAITH_COACHES!=='undefined')?FAITH_COACHES:[];
    const c=ctx.coachId?pool.find(x=>x.id===ctx.coachId):pick(pool.length?pool:[{firstName:'Coach',lastName:'',specialty:'mental',palmares:'',flaw:'',cost:0}]);
    return Object.assign(base,{firstName:c.firstName,lastName:c.lastName,nickname:c.nickname||null,flag:'',born:'',
      bio:{origin:c.palmares||'',past:c.flaw||'',trait:c.specialty||''},
      extra:{specialty:c.specialty,cost:c.cost,requirement:c.requirement,coachId:c.id}});
  }
  if(role==='journalist'){
    const names=(typeof FAITH_JOURNALIST_NAMES!=='undefined')?FAITH_JOURNALIST_NAMES:['Anonyme'];
    const full=pick(names);
    const parts=full.split(' '); const traits=(typeof FAITH_JOURNALIST_TRAITS!=='undefined')?FAITH_JOURNALIST_TRAITS:{};
    const media=(typeof FAITH_PRESSE_MEDIAS!=='undefined'&&FAITH_PRESSE_MEDIAS.length)?pick(FAITH_PRESSE_MEDIAS):'';
    return Object.assign(base,{firstName:parts[0]||full,lastName:parts.slice(1).join(' '),flag:'',born:'',
      bio:{origin:media,past:traits[full]||'',trait:traits[full]||''},
      extra:{media,sentiment:0}});
  }
  // sparring / fighter / rôle inconnu : identité générée, jamais inventée
  // "à la volée" par un écran — c'est makeName() (engine.js) qui la
  // produit, la même fonction que pour tout combattant du jeu.
  const gender=ctx.gender||(rnd()<0.5?'F':'H');
  const ck=ctx.countryKey||pick(COUNTRY_KEYS);
  const nm=makeName(gender,ck);
  const bio={origin:(typeof pick==='function'&&typeof ORIGINS!=='undefined')?pick(ORIGINS):'',
    past:(typeof MOTIVATIONS!=='undefined')?pick(MOTIVATIONS):'',
    trait:(typeof PERSON_TRAITS!=='undefined')?pick(PERSON_TRAITS):''};
  return Object.assign(base,{firstName:nm.first,lastName:nm.last,flag:nm.flag,born:ck,bio,
    nickname:(role==='sparring'&&typeof FAITH_GYM_NEWCOMER_NICKS!=='undefined')?pick(FAITH_GYM_NEWCOMER_NICKS):null});
}
/** Crée ou récupère une Person. Aucun écran n'a le droit d'inventer un nom
 * à la volée — c'est le seul point d'entrée pour peupler G.people.
 * @param {'coach'|'sparring'|'agent'|'director'|'journalist'|'fighter'} role
 * @param {object} [ctx] @returns {Person} */
function personEnsure(role,ctx){
  const reg=ensurePeopleRegistry();
  const key=personKeyFor(role,ctx);
  if(key && reg.byKey[key]!=null && reg.byId[reg.byKey[key]]) return reg.byId[reg.byKey[key]];
  const p=personMint(role,ctx);
  reg.byId[p.id]=p;
  if(key) reg.byKey[key]=p.id;
  return p;
}
/** Source unique d'affichage d'une Person — jamais recomposer "prénom nom"
 * ailleurs, sinon deux écrans peuvent finir par afficher deux formats
 * différents pour la même personne. @param {Person} p
 * @param {{short?:boolean,withNick?:boolean}} [opts] @returns {string} */
function personName(p,opts){
  if(!p) return '';
  opts=opts||{};
  if(opts.short) return p.firstName||'';
  const full=[p.firstName,p.lastName].filter(Boolean).join(' ');
  if(opts.withNick && p.nickname) return `${full} « ${p.nickname} »`;
  return full;
}
/** Marque une Person comme partie EXPLICITEMENT — jamais un simple
 * "disparaît sans qu'on sache pourquoi" (Loi 3 : la perte doit être
 * traçable). Ajoute l'entrée datée à rel.arc AVANT de figer l'état.
 * @param {Person} p @param {string} reason texte daté, lisible tel quel */
function personDepart(p,reason){
  if(!p) return;
  const year=(G.faith&&G.faith.year)||(G.season&&G.season.year)||1;
  p.rel.arc.push({year,text:reason});
  p.state.active=false; p.state.leftAt=year; p.state.leftReason=reason;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_GYMS_ELIGIBILITE] — Plan V4 LOT 5 §C11 : les 10 salles
   nommées de FAITH_GYMS (data-people.js) n'étaient lues par aucun écran ;
   scr_faith_camps() (ui-04) tournait toujours sur FAITH_CAMPS, 6 stages
   anonymes. Le stage reste le même geste (six semaines, un lieu, un
   effet chiffré sur 3 attributs) — seule la source change : une salle
   réelle, avec ville, spécialité et coach nommé, plutôt qu'un nom de
   discipline. GYM_SPECIALTY_ATTRS reprend la logique déjà écrite pour
   FAITH_CAMPS (trois attributs par famille) ; GYM_REP_TIER dérive coût
   d'accès en fraîcheur/risque du niveau de réputation de la salle (le
   coût en argent, lui, vient du coach principal qui l'anime — déjà
   chiffré dans FAITH_COACHES, jamais dupliqué ici). */
const GYM_SPECIALTY_ATTRS={
  frappe:['jab','cross','power'],
  lutte:['takedown','tdd','topControl'],
  soumission:['submission','guardWork','gnp'],
  cardio:['cardio','strength','explosiveness'],
  dur_au_mal:['chin','durability','recovery'],
  mental:['focus','composure','discipline']
};
const GYM_REP_TIER={
  'régionale':{minOrg:0,freshCost:-15,risk:0.04},
  'nationale':{minOrg:2,freshCost:-20,risk:0.05},
  'internationale':{minOrg:4,freshCost:-25,risk:0.07}
};
/** Famille de spécialités qu'un style de combat rend légitimes chez lui —
 * les spécialités "universelles" (cardio/mental/dur_au_mal) s'entraînent
 * n'importe où, jamais filtrées par le style. @type {Object<string,string[]>} */
const STYLE_TO_GYM_SPECIALTY={
  boxer:['frappe'],kickboxer:['frappe'],muayThai:['frappe'],karate:['frappe'],
  wrestler:['lutte'],sambo:['lutte'],bjj:['soumission'],
  mma:['frappe','lutte','soumission']
};
/** Une salle est éligible si sa réputation correspond au niveau de
 * l'organisation (f.org) et si sa spécialité correspond au style du
 * combattant (ou est universelle). L'argent n'entre pas dans ce filtre :
 * il reste un signal d'affordabilité affiché carte par carte (§C11),
 * jamais une raison de faire disparaître une salle de la liste.
 * @param {object} gym @param {object} f @returns {boolean} */
function faithGymEligible(gym,f){
  const tier=GYM_REP_TIER[gym.reputation]||GYM_REP_TIER['régionale'];
  if((f.org||0)<tier.minOrg) return false;
  if(['cardio','mental','dur_au_mal'].includes(gym.specialty)) return true;
  const fam=STYLE_TO_GYM_SPECIALTY[f.style]||[];
  return fam.includes(gym.specialty);
}
/** @param {object} f @returns {object[]} salles éligibles, ordre de FAITH_GYMS */
function faithEligibleGyms(f){
  return (typeof FAITH_GYMS!=='undefined'?FAITH_GYMS:[]).filter(g=>faithGymEligible(g,f));
}
/** Tirage idempotent d'au plus 3 salles parmi les éligibles, figé pour tout
 * le mois d'intersaison courant (même schéma que faithEnsureIntersaisonDraw,
 * data-faith-content.js/ui-08 : re-visiter l'écran ne doit jamais réduire
 * le choix). @param {object} f @param {object} F @returns {object[]} */
function faithEnsureCampGyms(f,F){
  const elig=faithEligibleGyms(f);
  if(F.currentCampGyms && F.currentCampGyms.month===F.month){
    const ids=F.currentCampGyms.ids;
    const byId=elig.filter(g=>ids.includes(g.id));
    if(byId.length) return byId;
  }
  let picks=elig;
  if(elig.length>3){
    const bag=elig.slice(); picks=[];
    while(picks.length<3 && bag.length) picks.push(bag.splice(RI(0,bag.length-1),1)[0]);
  }
  F.currentCampGyms={month:F.month,ids:picks.map(g=>g.id)};
  return picks;
}
/** Traduit une salle (FAITH_GYMS) dans la même forme que jouait un ancien
 * camp anonyme (FAITH_CAMPS) — id, coût, famille d'attributs, fraîcheur/
 * risque, texte — pour que faithCampChoose() (ui-08) n'ait qu'une seule
 * mécanique à résoudre. Le coût vient du coach principal de la salle
 * (FAITH_COACHES), jamais dupliqué sur la salle elle-même.
 * @param {object} gym @returns {?object} */
function faithGymAsCamp(gym){
  if(!gym) return null;
  const coach=(typeof FAITH_COACHES!=='undefined'?FAITH_COACHES:[]).find(c=>c.id===gym.coachId);
  const tier=GYM_REP_TIER[gym.reputation]||GYM_REP_TIER['régionale'];
  return {
    id:gym.id,name:gym.name,cost:(coach&&coach.cost)||0,
    freshCost:tier.freshCost,risk:tier.risk,
    attrs:GYM_SPECIALTY_ATTRS[gym.specialty]||[],
    text:`${gym.culture} Vous progressez sous l’œil de ${(coach&&coach.firstName)||''} ${(coach&&coach.lastName)||''}.`,
    repeatText:`Retour à ${gym.name} : la salle n’a plus rien de nouveau à vous apprendre — le travail rapporte moins.`
  };
}
/* ==== [ANCRE: FAITH_COACH_CHOICE_C12] — Plan V4 LOT 5 §C12 : les 24 coachs
   de FAITH_COACHES n'étaient tirés qu'au hasard, une seule fois, à la
   création (personMint('coach',...)). "Chercher un préparateur au-dessus"
   (evt_br_regional_coach, data-faith-content.js) ouvre maintenant un vrai
   choix parmi eux plutôt qu'un delta d'attributs — mais un coach qui a
   mené des champions ne prend pas n'importe qui : COACH_LEGITIMACY_CHECK
   traduit en code le champ `requirement` déjà écrit (texte libre) pour les
   7 coachs qui en portent un ; les 17 autres n'ont aucune exigence
   déclarée, donc toujours légitimes. Portée réduite assumée : deux
   exigences ("2 ans de pratique du sol", "une finition cette année") n'ont
   pas de compteur dédié dans f — approximées par la lecture la plus proche
   déjà disponible (attributs de sol, dernières entrées de f.history),
   plutôt que d'ajouter un champ rien que pour ce texte. */
const COACH_LEGITIMACY_CHECK={
  co_nakamura:f=>(f.attrs.submission||0)>=40 || (f.attrs.guardWork||0)>=40,
  co_ferreira:f=>(f.W||0)>=8,
  co_silva:f=>{
    const n=(G.faith&&G.faith.fightsThisYear)||0;
    if(n<=0) return false;
    return (f.history||[]).slice(-n).some(h=>h.res==='win' && (h.method==='Soumission'||h.method==='KO/TKO'));
  },
  co_kravets:f=>(f.age||0)>=25,
  co_johansen:f=>f.style==='wrestler'||f.style==='mma',
  co_essien:f=>(f.attrs.discipline||0)>=60,
  co_park:f=>(f.W||0)>=5
};
/** Un coach sans exigence déclarée (`requirement===null`) est toujours
 * légitime ; les 7 qui en ont une sont vérifiés via COACH_LEGITIMACY_CHECK.
 * @param {object} coach @param {object} f @returns {boolean} */
function faithCoachLegitimate(coach,f){
  const check=COACH_LEGITIMACY_CHECK[coach.id];
  return check?check(f):true;
}
/** @param {object} f @returns {object[]} coachs légitimes, ordre de FAITH_COACHES */
function faithEligibleCoaches(f){
  return (typeof FAITH_COACHES!=='undefined'?FAITH_COACHES:[]).filter(c=>faithCoachLegitimate(c,f));
}
/** Tirage idempotent d'au plus 3 coachs légitimes, figé pour la durée de
 * l'écran (jamais recalculé au fil des rendus — même raison que
 * faithEnsureCampGyms : re-visiter l'écran ne doit jamais changer le choix
 * proposé). @param {object} f @param {object} F @returns {object[]} */
function faithEnsureCoachChoices(f,F){
  if(F.currentCoachChoices){
    const byId=F.currentCoachChoices.map(id=>FAITH_COACHES.find(c=>c.id===id)).filter(Boolean);
    if(byId.length) return byId;
  }
  const elig=faithEligibleCoaches(f);
  let picks=elig;
  if(elig.length>3){
    const bag=elig.slice(); picks=[];
    while(picks.length<3 && bag.length) picks.push(bag.splice(RI(0,bag.length-1),1)[0]);
  }
  F.currentCoachChoices=picks.map(c=>c.id);
  return picks;
}
/** Remplace le coach principal : l'ancien PART (Loi 3, personDepart — jamais
 * un simple écrasement silencieux), le nouveau est minté sur l'id choisi de
 * FAITH_COACHES et prend la même clé stable ('coach:main') pour que
 * faithCoachPerson()/personEnsure() le retrouvent ensuite sans le reminer.
 * @param {string} coachId @param {string} reason texte daté pour l'ancien coach
 * @returns {Person} le nouveau coach */
function faithHireCoach(coachId,reason){
  const F=G.faith, reg=ensurePeopleRegistry();
  const old=F.coachId?reg.byId[F.coachId]:null;
  if(old) personDepart(old,reason);
  const p=personMint('coach',{coachId,slot:'main'});
  reg.byId[p.id]=p;
  reg.byKey['coach:main']=p.id;
  F.coachId=p.id;
  return p;
}
/* ==== [FIN ANCRE] ==== */
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
/* ==== [FIN ANCRE] ==== */
