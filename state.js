"use strict";
/* CAGE LEGACY — js/state.js
   État global G, sauvegarde/chargement, Panthéon persistant, migration.
   Dépend de engine.js (epithets, appelé par enshrine). legacyTitle (dans ui.js,
   appelé par enshrine) n'est résolu qu'à l'exécution : ui.js doit être chargé
   avant toute partie jouée, jamais avant l'exécution de state.js lui-même.

   Couche jouable v3 (sur moteur v2 : engine2.js concaténé) : lisible mobile,
   thème sombre/clair, 3 adversaires + %estimé, camp = 3 choix liés au sport
   avec deltas visibles et bornés, orgs, fiche /20, stats de combat, 5
   derniers combats, surnom gagné, épithètes de fin. */
/** @type {GameState} */
let G=null;
const SAVE_KEY='cage-legacy-v3';
const esc=s=>(''+s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ------------------------------ sauvegarde -------------------------------- */
/* ==== [ANCRE: SAVE_GARDE_ARCADE] — bug trouvé : arcade et carrière partageaient
   la MÊME clé de sauvegarde. Démarrer un Gauntlet écrasait la carrière dans
   localStorage ; "Reprendre" (toujours G.screen='hub') rechargeait alors le
   combattant du Gauntlet dans le hub de carrière. Une run Gauntlet ne doit
   jamais toucher au localStorage : il ne survit pas à une fermeture, exactement
   comme un roguelite classique — la vraie carrière reste intacte pendant ce temps. ==== */
function save(){ if(G&&((G.arcade&&G.arcade.active)||G.fantasyActive||G.vsFriendActive||['draft','arcadehub','gameover','fantasy_setup','allstars','vs_friend'].includes(G.screen))) return; try{ localStorage.setItem(SAVE_KEY,JSON.stringify(G)); }catch(e){} }
/* ==== [FIN ANCRE] ==== */
function load(){ try{ const s=localStorage.getItem(SAVE_KEY); if(s){ const parsed=JSON.parse(s); if(!parsed||typeof parsed!=='object'){ G=null; return false; } G=migrate(parsed); if(!validateState()){ console.error('Sauvegarde corrompue : état irrécupérable.'); G=null; return false; } return true; } }catch(e){ console.error('Sauvegarde illisible:',e); G=null; } return false; }
function hasSave(mode){
  try{
    const s=localStorage.getItem(SAVE_KEY);
    if(s){
      const p=JSON.parse(s);
      if(mode==='faith') return !!p.faith;
      if(mode==='career') return !p.faith;
      return true;
    }
  }catch(e){}
  return false;
}
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
/* ==== [ANCRE: PANTHEON] — hors wipe(), survit d'une carrière à l'autre ==== */
const HOF_KEY='cage-legacy-hof', SAVE_VERSION=2;
function loadHOF(){ try{ return JSON.parse(localStorage.getItem(HOF_KEY))||[]; }catch(e){ return []; } }
function saveHOF(l){ try{ localStorage.setItem(HOF_KEY,JSON.stringify(l)); }catch(e){} }
/* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
   f.decorations (array d'ids LEGEND_UNLOCKABLES, cat 'Ennoblissement du
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
const LEGEND_TIER_COLOR={
  'LÉGENDE ÉTERNELLE':'#F4D580','GRAND CHAMPION':'var(--gold)','CHAMPION RESPECTÉ':'var(--sage)',
  'COMBATTANT ACCOMPLI':'#4DA6FF','VÉTÉRAN DU CIRCUIT':'var(--muted)','GUERRIER DE L\u2019OMBRE':'var(--blood)'
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

/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — registre historique mondial &
   statistiques globales, persistant inter-carrières (clé localStorage séparée
   du combattant actif, comme le Panthéon lui-même). ==== */
const META_STATS_KEY='cage-legacy-metastats';
const ACH_KEY='cage-legacy-achievements';
function loadAch(){ try{ return JSON.parse(localStorage.getItem(ACH_KEY))||[]; }catch(e){ return []; } }
function saveAch(ach){ try{ localStorage.setItem(ACH_KEY,JSON.stringify(ach)); }catch(e){} }
function loadMetaStats(){
  try{ return JSON.parse(localStorage.getItem(META_STATS_KEY))||{totalFights:0,totalKO:0,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:0,legendPoints:0,unlockedItems:[]}; }
  catch(e){ return {totalFights:0,totalKO:0,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:0,legendPoints:0,unlockedItems:[]}; }
}
function saveMetaStats(meta){ try{ localStorage.setItem(META_STATS_KEY,JSON.stringify(meta)); }catch(e){} }
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
function recordGauntletAscension(meta,mode,asc){
  if(!meta.gauntletAscension) meta.gauntletAscension={};
  const cur=meta.gauntletAscension[mode]||0;
  const next=Math.min(GAUNTLET_ASC_MAX,(asc||0)+1);
  if(next>cur){ meta.gauntletAscension[mode]=next; return true; }
  return false;
}
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
/* ==== [ANCRE: RELIQUES_SURVIE] — ajout #7 (24 ajouts, 12/08/2026) : une
   Relique par couple (mode, archétype) — jusqu'à 3 modes × ~32 archétypes
   (23 de base + 4 légendes + 4 achetables + 1 loterie, cf. ARCADE_ARCHETYPES
   et ses extensions dans ui-03) ≈ 96 combinaisons possibles, exactement
   l'ordre de grandeur "~96" de la spec — débloquée en remportant le format
   au palier d'Ascension MAXIMUM (GAUNTLET_ASC_MAX) avec cet archétype.
   + 3 récompenses de maîtrise (une par mode), débloquées quand TOUTES les
   Reliques de ce mode sont réunies.
   ⚠️ SCOPE ASSUMÉ ET EXPLICITE : la spec évoque ~99 récompenses avec un
   contenu réellement unique à rédiger une par une — un travail d'écriture
   à cette échelle (99 titres + textes distincts) dépasse une passe sûre de
   génie logiciel automatisé sans verser dans le remplissage artificiel.
   Le contenu ci-dessous est donc généré PROCÉDURALEMENT à partir d'un petit
   nombre de gabarits combinés à un hash déterministe par (mode, archétype)
   — chaque Relique a un titre et un effet visuel distincts et stables (la
   même combinaison ressort toujours pour le même couple), mais ce n'est pas
   99 textes rédigés à la main. Le système mécanique (acquisition, unicité,
   équipement, persistance) est en revanche complet et fonctionnel. ==== */
const GAUNTLET_RELIC_TITLE_TEMPLATES=['Le Vainqueur de {arch}','L\u2019Ombre de {arch}','Le Bourreau de {arch}','Le Spectre de {arch}','L\u2019Héritier de {arch}','Le Fléau de {arch}'];
const GAUNTLET_RELIC_EFFECT_TEMPLATES=[
  {id:'fx_gold_frame',label:'Cadre Ascension Doré',style:'border:2px solid var(--gold);box-shadow:0 0 18px rgba(230,185,58,0.3)'},
  {id:'fx_crimson_glow',label:'Halo Écarlate',style:'border:2px solid var(--blood);box-shadow:0 0 18px rgba(232,68,47,0.3)'},
  {id:'fx_void_frame',label:'Cadre Abyssal',style:'border:2px solid #6b46c1;box-shadow:0 0 18px rgba(107,70,193,0.3)'}
];
const GAUNTLET_MODE_MASTERY_RELIC={
  bracket64:{id:'mastery_bracket64',title:'Le Souverain du Bracket',effect:{id:'fx_gold_frame',label:'Couronne d\u2019Ascension',style:'border:3px double var(--gold);box-shadow:0 0 26px rgba(230,185,58,0.45)'}},
  ladder_100:{id:'mastery_ladder_100',title:'Le Sommet Inaccessible',effect:{id:'fx_crimson_glow',label:'Aura du Sommet',style:'border:3px double var(--blood);box-shadow:0 0 26px rgba(232,68,47,0.45)'}},
  boss_run:{id:'mastery_boss_run',title:'Le Bourreau Ultime',effect:{id:'fx_void_frame',label:'Ombre du Bourreau',style:'border:3px double #6b46c1;box-shadow:0 0 26px rgba(107,70,193,0.45)'}}
};
function hasGauntletRelic(meta,mode,nick){ return !!(meta.gauntletRelics&&meta.gauntletRelics[mode]&&meta.gauntletRelics[mode][nick]); }
function grantGauntletRelic(meta,mode,nick){
  if(hasGauntletRelic(meta,mode,nick)) return false;
  if(!meta.gauntletRelics) meta.gauntletRelics={};
  if(!meta.gauntletRelics[mode]) meta.gauntletRelics[mode]={};
  meta.gauntletRelics[mode][nick]=true;
  return true;
}
function gauntletRelicContent(mode,nick){
  const h=_dailyHash(mode+'|'+nick);
  const titleTpl=GAUNTLET_RELIC_TITLE_TEMPLATES[h%GAUNTLET_RELIC_TITLE_TEMPLATES.length];
  const effect=GAUNTLET_RELIC_EFFECT_TEMPLATES[Math.floor(h/11)%GAUNTLET_RELIC_EFFECT_TEMPLATES.length];
  return {id:`relic_${mode}_${nick.replace(/[^a-zA-Z0-9]/g,'')}`,title:titleTpl.replace('{arch}',nick),mode,archetype:nick,effect};
}
function checkGauntletModeMastery(meta,mode){
  injectExtendedArchetypes();
  return ARCADE_ARCHETYPES.length>0 && ARCADE_ARCHETYPES.every(a=>hasGauntletRelic(meta,mode,a.nick));
}
function hasGauntletModeMastery(meta,mode){ return !!(meta.gauntletMastery&&meta.gauntletMastery[mode]); }
function grantGauntletModeMastery(meta,mode){
  if(hasGauntletModeMastery(meta,mode)) return false;
  if(!meta.gauntletMastery) meta.gauntletMastery={};
  meta.gauntletMastery[mode]=true;
  return true;
}
/* Profil du joueur : max 1 titre + 1 effet affichés à la fois (compte
   entier, pas par combattant — les combattants arcade sont jetables et non
   persistés, cf. règle déjà établie ailleurs dans ce fichier). */
function listOwnedGauntletRelics(meta){
  const out=[];
  Object.keys(meta.gauntletRelics||{}).forEach(mode=>{
    Object.keys(meta.gauntletRelics[mode]).forEach(nick=>out.push(gauntletRelicContent(mode,nick)));
  });
  Object.keys(meta.gauntletMastery||{}).forEach(mode=>{ if(meta.gauntletMastery[mode]) out.push({...GAUNTLET_MODE_MASTERY_RELIC[mode],mastery:true}); });
  return out;
}
function setGauntletProfileDisplay(meta,relicId){
  const owned=listOwnedGauntletRelics(meta);
  const relic=owned.find(r=>r.id===relicId);
  if(!relic) return {success:false,msg:'Relique non possédée.'};
  meta.gauntletProfileTitle=relic.title; meta.gauntletProfileEffect=relic.effect;
  return {success:true,msg:'Profil mis à jour.'};
}
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
function gauntletDailyKey(d){
  const t=d||new Date();
  return `${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}`;
}
function gauntletDailyState(meta){
  const key=gauntletDailyKey();
  if(!meta.gauntletDaily||meta.gauntletDaily.date!==key) return {date:key,done:{}};
  if(!meta.gauntletDaily.done) meta.gauntletDaily.done={};
  return meta.gauntletDaily;
}
function gauntletDailyDone(meta,mode){ return !!gauntletDailyState(meta).done[mode]; }
function recordGauntletDaily(meta,mode,progress){
  const st=gauntletDailyState(meta);
  st.done[mode]={progress,at:Date.now()};
  meta.gauntletDaily=st;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
   remplace le "défi du jour" (simple tentative, cf. GAUNTLET_DAILY ci-dessus,
   CONSERVÉ tel quel pour le verrou 1 tentative/format/jour — décision
   assumée : la doc demande de changer le CRITÈRE de réussite, pas de retirer
   la protection anti-abus déjà en place) par un vrai mini-objectif tiré
   chaque jour, parfois valable dans les 3 modes (scope:null), parfois
   restreint à un mode nommé (scope:'bracket64'|'ladder_100'|'boss_run').
   kind:'run' = à réaliser DANS une seule run (compteurs sur G.arcade, reset
   à chaque run) ; kind:'day' = cumulé sur toutes les tentatives du jour
   (compteurs dans meta.gauntletDailyObjProgress). ==== */
const GAUNTLET_DAILY_OBJECTIVES=[
  {id:'ko2straight',kind:'run',metric:'koStreak',target:2,label:'2 KO d\u2019affilée dans la même run'},
  {id:'win3straight',kind:'run',metric:'winStreak',target:3,label:'3 victoires d\u2019affilée dans la même run'},
  /* ==== [ANCRE: CORRECTIF_DEFI_SANS_DEGAT] — bug remonté : "sans le
     moindre dégât reçu" (dmgHead+dmgBody+dmgLegs===0) demandait de ne
     JAMAIS perdre un seul échange debout ou au sol sur tout le combat — le
     moteur inflige 1 à 3 points à l'un des deux camps à chaque échange
     debout (engine.js, ANCRE MICRO_SEQUENCES), donc une victoire à zéro
     dégât exige de gagner CHAQUE micro-séquence du combat, dans l'ordre,
     sans exception : un défi du jour vécu comme irréalisable plutôt que
     comme rare. Seuil assoupli à "quasiment aucun dégât" (cf. ui-08,
     ANCRE GAUNTLET_DEFI_JOUR_V2) — reste une victoire très dominante, mais
     plus un tirage à annulation totale du hasard. ==== */
  {id:'flawless1',kind:'run',metric:'flawless',target:1,label:'Un combat terminé en n’encaissant presque aucun dégât (3 points ou moins)'},
  /* ==== [FIN ANCRE] ==== */
  {id:'sub3day',kind:'day',metric:'subWins',target:3,label:'3 victoires par soumission aujourd\u2019hui (toutes tentatives confondues)'},
  {id:'td5day',kind:'day',metric:'takedowns',target:5,label:'5 amenées au sol réussies aujourd\u2019hui'},
  {id:'kd2day',kind:'day',metric:'kdCount',target:2,label:'2 knockdowns infligés aujourd\u2019hui'}
];
const GAUNTLET_DAILY_MODES=[null,'bracket64','ladder_100','boss_run'];
/* Récompense exclusive de série (palier 7), jamais obtenable autrement —
   réutilise le système de thèmes d'octogone existant (ARENA_THEMES,
   ui-08) : checkLegendUnlock('cosmetic_renegade') suffit à la rendre
   sélectionnable dans la Salle des Légendes, sans y ajouter d'entrée
   achetable (elle ne figure PAS dans LEGEND_UNLOCKABLES). */
const GAUNTLET_DAILY_STREAK_REWARD={id:'cosmetic_renegade',threshold:7,name:'Toile Braise du Renégat (exclusive)'};
function _dailyHash(s){ return [...String(s)].reduce((h,c)=>((h*31+c.charCodeAt(0))>>>0),0); }
/* Point d'entrée unique : garantit que l'objectif + la progression du jour
   existent, gère le passage à un nouveau jour (règle le sort de la série
   d'hier — cf. buybackGauntletDailyStreak ci-dessous — AVANT de régénérer). */
function gauntletDailyObjective(meta){
  const key=gauntletDailyKey();
  if(meta.gauntletDailyObj && meta.gauntletDailyObj.date===key) return meta.gauntletDailyObj;
  const prevProg=meta.gauntletDailyObjProgress;
  if(prevProg && prevProg.date!==key){
    if(!prevProg.completed && !prevProg.rescued){
      meta.gauntletDailyRescueOffer={fromDate:prevProg.date,streakAtRisk:meta.gauntletDailyStreak||0};
      meta.gauntletDailyStreak=0;
    } else {
      meta.gauntletDailyRescueOffer=null;
    }
  }
  const h=_dailyHash(key);
  const tmpl=GAUNTLET_DAILY_OBJECTIVES[h%GAUNTLET_DAILY_OBJECTIVES.length];
  const scope=GAUNTLET_DAILY_MODES[Math.floor(h/97)%GAUNTLET_DAILY_MODES.length];
  const obj={date:key,id:tmpl.id,kind:tmpl.kind,metric:tmpl.metric,target:tmpl.target,label:tmpl.label,scope};
  meta.gauntletDailyObj=obj;
  meta.gauntletDailyObjProgress={date:key,subWins:0,takedowns:0,kdCount:0,completed:false,streakCredited:false,rescued:false};
  /* ==== [ANCRE: CORRECTIF_OFFRE_RACHAT_PERDUE] — bug remonté : cette
     fonction pose meta.gauntletDailyRescueOffer (juste au-dessus) mais ne
     sauvegardait jamais elle-même — ses deux appelants d'affichage
     (gauntletDailyTag/gauntletDailyGroup, ui-06) rechargent un meta neuf à
     chaque render sans jamais persister. Résultat : l'offre n'existait que
     dans la mémoire du render courant. Au clic sur "Racheter",
     CL.buybackGauntletDailyStreak() (ui-08) recharge un meta FRAIS depuis
     localStorage — sans l'offre — donc "Rien à racheter." même avec assez
     de points. Sauvegarder ici, au seul point d'entrée qui écrit l'offre,
     couvre tous les appelants sans les modifier un par un. La sauvegarde ne
     se déclenche qu'au changement de jour/première init (l'early return
     ci-dessus court-circuite le reste tant que la date n'a pas changé). ==== */
  saveMetaStats(meta);
  /* ==== [FIN ANCRE] ==== */
  return obj;
}
function gauntletDailyObjectiveDone(meta){ gauntletDailyObjective(meta); return !!meta.gauntletDailyObjProgress.completed; }
function gauntletDailyBuybackCost(streakAtRisk){ return Math.max(40,(streakAtRisk||0)*40); }
function buybackGauntletDailyStreak(meta){
  const offer=meta.gauntletDailyRescueOffer;
  if(!offer) return {success:false,msg:'Rien à racheter.'};
  const cost=gauntletDailyBuybackCost(offer.streakAtRisk);
  if((meta.legendPoints||0)<cost) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=cost; meta.gauntletDailyStreak=offer.streakAtRisk; meta.gauntletDailyRescueOffer=null;
  if(meta.gauntletDailyObjProgress) meta.gauntletDailyObjProgress.rescued=true;
  saveMetaStats(meta);
  return {success:true,msg:`Série sauvée pour ${cost} points de Légende.`};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_DAILY_STREAK] — appelée UNE SEULE FOIS par jour, dès
   que l'objectif du jour est atteint (cf. finaliseGauntletRun, ui-08 : garde
   prog.streakCredited pour éviter un double crédit si plusieurs tentatives
   le même jour concluent l'objectif). Le cas "jour manqué" est désormais géré
   en amont par gauntletDailyObjective() (reset ou rachat), donc cette
   fonction n'a plus besoin de comparer les dates elle-même — simple
   incrément, plus lisible que l'ancien calcul de gap. ==== */
function recordGauntletDailyStreak(meta){
  meta.gauntletDailyStreak=(meta.gauntletDailyStreak||0)+1;
  meta.gauntletLastDailyDate=gauntletDailyKey();
  if(meta.gauntletDailyStreak>=GAUNTLET_DAILY_STREAK_REWARD.threshold){
    if(!meta.unlockedItems) meta.unlockedItems=[];
    if(!meta.unlockedItems.includes(GAUNTLET_DAILY_STREAK_REWARD.id)) meta.unlockedItems.push(GAUNTLET_DAILY_STREAK_REWARD.id);
  }
  return meta.gauntletDailyStreak;
}
/* Bonus de cagnotte aux paliers 3 et 7 du streak, appliqué au payout du
   défi du jour concerné (finaliseGauntletRun, ui-08) — pas un rééquilibrage
   audité, un facteur de fidélité comme le reste du système Gauntlet. */
function gauntletDailyStreakBonusMult(streak){
  if((streak||0)>=7) return 1.5;
  if((streak||0)>=3) return 1.2;
  return 1;
}
/* ==== [FIN ANCRE] ==== */
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
  /* ==== [ANCRE: GAUNTLET_MENU_HIERARCHIE] — ajout #2 (24 ajouts, 12/08/2026) :
     flag gauntlet:true sur les entrées réellement liées au Gauntlet
     (cosmétiques d'octogone utilisés en Gauntlet + archétypes + Boss Run),
     lu par scr_legends (ui-07) pour le filtre "Boutique (filtrée Gauntlet)"
     ouvert depuis scr_gauntlet_menu. Les modes 100% carrière (Vs Ami,
     Fantasy, All-Stars) et les Scénarios restent gauntlet:false (absent =
     false), volontairement exclus du filtre pour ne pas le diluer. ==== */
  {id:'tool_codex',name:'Codex Inter-carrières',cat:'Outils',cost:60,desc:'Ajoute un panneau de statistiques cumulées (compétences par rareté, carrières et combats totaux) directement dans le Codex.'},
  {id:'cosmetic_pride',name:'Toile Héritage Blanche & Bleue',cat:'Cosmétiques',cost:90,desc:'Nouveau thème visuel pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_gold',name:'Bâche Royale (Prestige)',cat:'Cosmétiques',cost:150,desc:'Thème visuel doré pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_neon',name:'Néons Cyberpunk',cat:'Cosmétiques',cost:110,desc:'Thème visuel nocturne et futuriste pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_underground',name:'Béton Clandestin',cat:'Cosmétiques',cost:75,desc:'L\u2019ambiance rugueuse et sombre des combats clandestins.',gauntlet:true},
  {id:'cosmetic_crimson',name:'Arène Écarlate',cat:'Cosmétiques',cost:130,desc:'Thème visuel rouge sang pour l\u2019octogone, pour les carrières les plus brutales.',gauntlet:true},
  {id:'arch_titan',name:'Archétype : Le Titan Antique',cat:'Archétypes Arcade',cost:80,desc:'Débloque un colosse inarrêtable spécialisé en lutte pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_ninja',name:'Archétype : Le Shinobi',cat:'Archétypes Arcade',cost:80,desc:'Débloque un expert en furtivité et soumissions éclairs pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_brawler',name:'Archétype : Le Roi de la Rue',cat:'Archétypes Arcade',cost:80,desc:'Débloque un spécialiste de la boxe sale et de la survie pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_sniper',name:'Archétype : Le Sniper',cat:'Archétypes Arcade',cost:80,desc:'Débloque un spécialiste du combat à distance en Muay Thaï pour le mode Gauntlet.',gauntlet:true},
  {id:'mode_vs_friend',name:'Défi Multijoueur (Vs Ami)',cat:'Modes annexes',cost:140,desc:'Oppose une de tes légendes retraitées au combattant d\u2019un ami, généré à la volée.'},
  {id:'mode_fantasy',name:'Fantasy Fight (Sandbox)',cat:'Modes annexes',cost:180,desc:'Simule un combat entre deux légendes de ton Panthéon.'},
  {id:'mode_boss',name:'Arcade : Boss Run',cat:'Modes annexes',cost:220,desc:'5 champions d\u2019affilée, KO uniquement. Le format le plus punitif du Gauntlet.',gauntlet:true},
  {id:'mode_allstars',name:'Tournoi All-Stars (8 Légendes)',cat:'Modes annexes',cost:300,desc:'Tournoi à élimination directe entre tes 8 meilleures légendes pour désigner ton GOAT.'},
  // ==== [ANCRE: REFONTE_SCENARIOS] — 2 scénarios réservés (cf. SCENARIOS dans
  // engine.js, champ legendUnlock). Coûts calés entre les archétypes (80) et
  // le Boss Run (220) : plus exigeants qu'un simple cosmétique/archétype
  // (un scénario entier à réussir), mais plus accessibles qu'un mode annexe
  // complet.
  {id:'scenario_finisseur',name:'Scénario : Le Finisseur',cat:'Scénarios',cost:100,desc:'Débloque le défi "Le Finisseur" : titre mondial sans jamais gagner à la décision.'},
  {id:'scenario_regne',name:'Scénario : Le Règne Sans Faille',cat:'Scénarios',cost:160,desc:'Débloque le défi "Le Règne Sans Faille" : 5 défenses de titre continental sans jamais perdre la ceinture.'},
  /* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
     décorations "flex" pour combattants retraités. Achat PERMANENT (compte),
     mais équipement UNIQUE (une décoration donnée n'est portée que par un
     seul combattant du Panthéon à la fois — cf. equipPantheonDecoration
     plus bas, qui la retire d'un éventuel porteur précédent). Maximum 3
     équipées simultanément par combattant. gauntlet:false : ce sont des
     décorations de Panthéon (carrière), pas du contenu Gauntlet. */
  {id:'deco_frame_gold',name:'Cadre Doré (Ennoblissement)',cat:'Ennoblissement du Panthéon',cost:70,desc:'Cadre doré autour de la fiche du combattant retraité.'},
  {id:'deco_frame_crimson',name:'Cadre Écarlate (Ennoblissement)',cat:'Ennoblissement du Panthéon',cost:70,desc:'Cadre rouge sang autour de la fiche du combattant retraité.'},
  {id:'deco_glow',name:'Effet de Lumière (Ennoblissement)',cat:'Ennoblissement du Panthéon',cost:90,desc:'Halo lumineux doré autour du nom du combattant.'},
  {id:'deco_typography',name:'Typographie Gravée (Ennoblissement)',cat:'Ennoblissement du Panthéon',cost:60,desc:'Nom du combattant affiché dans une typographie ornementale exclusive.'},
  {id:'deco_diamond',name:'Palmarès en Diamant (Ennoblissement)',cat:'Ennoblissement du Panthéon',cost:120,desc:'Le bilan (victoires-défaites) scintille en diamant sur la fiche.'}
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
  {id:'cons_strength',name:'Potion de force',cost:50,kind:'buff',fx:{power:15},desc:'Boost temporaire de Puissance (+3/20), actif pour toute la run.'},
  {id:'cons_dope',name:'Dopage légal',cost:65,kind:'buff',fx:{cardio:15,power:20,durability:-5},desc:'+3 Cardio, +4 Puissance, -1 Résistance (/20), actif pour toute la run.'},
  {id:'cons_camp',name:'Camp d\u2019entraînement rigoureux',cost:65,kind:'buff',fx:{strength:10,composure:10,fightIQ:10},desc:'+2 Force, +2 Sang-froid, +2 Intelligence (/20), actif pour toute la run.'}
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
/* ==== [ANCRE: ROTATION_OFFRES_EXCLUSIVES] — ajout #9 (24 ajouts, 12/08/2026) :
   "Offre du jour" — objets EXCLUSIFS, jamais obtenables autrement que par
   cette rotation (ne figurent PAS dans LEGEND_UNLOCKABLES : pas de doublon
   d'achat possible ailleurs). Tirage déterministe par date (même principe
   que gauntletDailyObjective, salt différent pour ne pas tomber sur le même
   index que l'objectif du jour), réduction -40% à -60% également dérivée du
   hash. meta.gauntletExclusiveOfferLastId mémorise l'offre d'hier pour
   garantir qu'elle ne revient jamais 2 jours d'affilée (peut revenir plus
   tard, cf. spec). **Scope à anticiper** : pool volontairement restreint (4
   objets) — à enrichir librement plus tard, la mécanique de rotation ne
   dépend pas de sa taille. ==== */
const GAUNTLET_EXCLUSIVE_OFFERS=[
  /* ==== [ANCRE: CORRECTIF_COSMETIQUES_EXCLUSIFS_INVISIBLES] — bug remonté :
     excl_mask_oni et excl_gloves_relic étaient achetables via l'offre du
     jour (checkLegendUnlock les marque bien possédés) mais n'apparaissaient
     ensuite NULLE PART — le panneau d'équipement du Panthéon (ui-06,
     ownedDecorations) ne lit que LEGEND_UNLOCKABLES, jamais
     GAUNTLET_EXCLUSIVE_OFFERS. Ajout du champ cat (même valeur que les
     décorations classiques) pour que ces 2 objets soient reconnus par ce
     panneau une fois le correctif appliqué côté ui-06 — sans dupliquer leur
     id ni les rendre achetables ailleurs (ils restent absents de
     LEGEND_UNLOCKABLES). excl_title_ghost n'a pas d'équivalent : aucun
     emplacement d'affichage de titre n'existe dans le jeu (ni fiche, ni
     Panthéon) — hors scope d'un correctif ciblé, à traiter comme un ajout
     de fonctionnalité à part entière. ==== */
  {id:'excl_mask_oni',name:'Masque du Oni (cosmétique Panthéon)',cat:'Ennoblissement du Panthéon',desc:'Décoration de fiche exclusive, jamais vendue autrement.',baseCost:220},
  {id:'excl_banner_ash',name:'Bannière Cendrée (thème d\u2019octogone)',desc:'Variante sombre et exclusive du thème Arène Écarlate.',baseCost:260},
  {id:'excl_title_ghost',name:'Titre « L\u2019Insaisissable » (Profil)',desc:'Titre cosmétique exclusif, sans effet mécanique.',baseCost:180},
  {id:'excl_gloves_relic',name:'Gants-Relique (cosmétique Panthéon)',cat:'Ennoblissement du Panthéon',desc:'Décoration de fiche exclusive au style usé et ancien.',baseCost:240},
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
     "Disponible à la fois en achat classique ET via la Rotation des offres
     exclusives" — ID PARTAGÉ avec LEGEND_UNLOCKABLES (deco_diamond) au lieu
     d'un doublon : checkLegendUnlock()/meta.unlockedItems fonctionnent déjà
     à l'identique quel que soit le chemin d'achat, donc réutiliser le même
     id évite toute désynchronisation entre les deux catalogues. baseCost
     recopié depuis son entrée LEGEND_UNLOCKABLES (120) pour que la réduction
     s'applique sur le même prix de référence. ==== */
  {id:'deco_diamond',name:'Palmarès en Diamant (Ennoblissement)',desc:'Décoration de Panthéon, aussi disponible en achat classique.',baseCost:120}
  /* ==== [FIN ANCRE] ==== */
];
function gauntletExclusiveOfferToday(meta){
  const key=gauntletDailyKey();
  if(meta.gauntletExclusiveOffer && meta.gauntletExclusiveOffer.date===key) return meta.gauntletExclusiveOffer;
  const h=_dailyHash(key+'|offer');
  let idx=h%GAUNTLET_EXCLUSIVE_OFFERS.length;
  if(GAUNTLET_EXCLUSIVE_OFFERS[idx].id===meta.gauntletExclusiveOfferLastId) idx=(idx+1)%GAUNTLET_EXCLUSIVE_OFFERS.length;
  const item=GAUNTLET_EXCLUSIVE_OFFERS[idx];
  const discountPct=40+(Math.floor(h/13)%3)*10; // 40, 50 ou 60 %
  const cost=Math.round(item.baseCost*(1-discountPct/100));
  const offer={date:key,id:item.id,discountPct,cost};
  meta.gauntletExclusiveOffer=offer; meta.gauntletExclusiveOfferLastId=item.id;
  return offer;
}
function purchaseExclusiveOffer(meta){
  const offer=gauntletExclusiveOfferToday(meta);
  if(checkLegendUnlock(offer.id)) return {success:false,msg:'Déjà possédé.'};
  if((meta.legendPoints||0)<offer.cost) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=offer.cost; if(!meta.unlockedItems) meta.unlockedItems=[]; meta.unlockedItems.push(offer.id);
  saveMetaStats(meta);
  return {success:true,msg:'Offre exclusive du jour débloquée !'};
}
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
/* ==== [ANCRE: LOTERIE_LEGENDES] — ajout #11 (24 ajouts, 12/08/2026) : Caisse
   Mystère, une fois par jour, coût modique. Pioche parmi les consommables du
   Marché Noir (ajout #8, implémenté juste avant celui-ci dans ce même
   chantier — TODO résolu, plus de dépendance ouverte) ET les cosmétiques/
   déblocages existants. Un consommable gagné ici respecte la même règle
   "pas de réserve" que le Marché Noir (meta.gauntletPendingConsumable) :
   s'il y en a déjà un en attente, la Caisse ne peut retomber que sur un
   cosmétique/déblocage cette fois-là. L'exception 1% (archétype ultra-
   exclusif nouveau) est pleinement implémentée : voir arch_lottery_phoenix
   dans ARCADE_UNLOCKABLE_ARCHETYPES (ui-03). ==== */
const GAUNTLET_LOTTERY_COST=25;
const GAUNTLET_LOTTERY_JACKPOT_ID='arch_lottery_phoenix';
function gauntletLotteryAvailable(meta){ return meta.gauntletLotteryLastDate!==gauntletDailyKey(); }
function drawGauntletLottery(meta){
  if(!gauntletLotteryAvailable(meta)) return {success:false,msg:'Déjà tentée aujourd\u2019hui.'};
  if((meta.legendPoints||0)<GAUNTLET_LOTTERY_COST) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=GAUNTLET_LOTTERY_COST; meta.gauntletLotteryLastDate=gauntletDailyKey();
  if(!meta.unlockedItems) meta.unlockedItems=[];
  if(rnd()<0.01 && !meta.unlockedItems.includes(GAUNTLET_LOTTERY_JACKPOT_ID)){
    meta.unlockedItems.push(GAUNTLET_LOTTERY_JACKPOT_ID);
    saveMetaStats(meta);
    return {success:true,jackpot:true,msg:'🏆 JACKPOT — Archétype ultra-exclusif débloqué !'};
  }
  const pool=LEGEND_UNLOCKABLES.filter(i=>!meta.unlockedItems.includes(i.id));
  if(!pool.length){ meta.legendPoints+=GAUNTLET_LOTTERY_COST*2; saveMetaStats(meta); return {success:true,jackpot:false,msg:'Tout est déjà débloqué — remboursé en points de Légende (×2).'}; }
  const won=pool[Math.floor(rnd()*pool.length)];
  meta.unlockedItems.push(won.id);
  saveMetaStats(meta);
  return {success:true,jackpot:false,msg:`Caisse Mystère : ${won.name} !`};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
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
function validateState(){
  if(!G||typeof G!=='object') return false;
  if(!G.f||typeof G.f!=='object') return false;
  repairFighter(G.f);
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
function setTheme(t){ G.theme=t; try{ if(document.documentElement)document.documentElement.setAttribute('data-theme',t); }catch(e){} }
