"use strict";
/* CAGE LEGACY — state/state-hof.js
   Panthéon (Hall of Fame) persistant (localStorage HOF_KEY), hors wipe() de
   la carrière courante. enshrine() appelle updateMetaStatsOnRetirement()
   (state-analytics.js) et awardLegendPoints() (state-shop.js) ;
   equipPantheonDecoration() appelle checkLegendUnlock() (state-shop.js) ;
   awardLegendPoints() (state-shop.js) appelle hofScore() (ici). Dépendance
   croisée réelle avec state-shop.js, signalée en Phase 1 : aucun ordre
   linéaire ne satisfait les deux sens à la fois, mais résolution à
   l'exécution (scripts classiques) donc sans effet sur le fonctionnement —
   il suffit que les deux fichiers soient chargés avant tout appel réel. */
/* ==== [ANCRE: PANTHEON] — hors wipe(), survit d'une carrière à l'autre ==== */
const HOF_KEY='cage-legacy-hof';
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
  updateMetaStatsOnRetirement(f); }
/* ==== [FIN ANCRE] ==== */
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
