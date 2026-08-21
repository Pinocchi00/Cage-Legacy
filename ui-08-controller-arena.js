"use strict";
/* CAGE LEGACY — js/ui-08-controller-arena.js
   ============================================================================
   Fichier 8/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Le registre des écrans (SCREENS), la boucle de rendu, et TOUT le contrôleur d'actions (CL) — c'est-à-dire chaque clic possible dans le jeu — ainsi que le rendu Canvas 2D de l'arène de combat.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

const SCREENS={title:scr_title,intro:scr_intro,create:scr_create,hub:scr_hub,select:scr_select,camp:scr_camp,arena:scr_arena,
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof,event:scr_event,plan:scr_plan,season:scr_season,toptier:scr_toptier,
  draft:scr_draft,arcadehub:scr_arcadehub,arcade_plan:scr_arcade_plan,gameover:scr_gameover,history:scr_history,beltLineage:scr_beltLineage,promo:scr_promo,codex:scr_codex,legends:scr_legends,mueChoice:scr_mueChoice,scenarios:scr_scenarios,legend_detail:scr_legend_detail,class_choice:scr_class_choice,class_choice_31:scr_class_choice_31,
  fantasy_setup:scr_fantasySetup,allstars:scr_allstars,allstars_setup:scr_allstars_setup,vs_friend:scr_vs_friend,vs_friend_plan:scr_vs_friend_plan,arcade_upgrades:scr_arcade_upgrades,
  faith_draft:scr_faith_draft,faith_hub:scr_faith_hub,faith_event:scr_faith_event,faith_year_end:scr_faith_year_end,
  contract_nego:scr_contract_nego,free_agency:scr_free_agency,champ_champ_offer:scr_champ_champ_offer,champ_champ_decision:scr_champ_champ_decision,vs_friend_next:scr_vs_friend_next,press_conf:scr_press_conf,
  gauntlet_menu:scr_gauntlet_menu,bracket_view:scr_bracket_view,archetype_pantheon:scr_archetype_pantheon,boss_reveal:scr_boss_reveal,ascension_tower:scr_ascension_tower,gauntlet_profile:scr_gauntlet_profile,coaching_round:scr_coaching_round,camp_identity_pick:scr_camp_identity_pick,consumable_preview:scr_consumable_preview,ach_preview:scr_ach_preview,shop_preview:scr_shop_preview};

/* ============================== RENDER + CL =============================== */
function render(preserveScroll){ const app=document.getElementById('app'); if(!app)return;
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); if(G&&G.screen==='consumable_preview') startConsumablePreviewArena(); if(G&&G.screen==='shop_preview') startShopPreviewArena(); if(!preserveScroll && window.scrollTo) window.scrollTo(0,0); }
function routeAfterOrgChange(){
  if(G.faith){ if(typeof CL.prepareFaithYearEnd==='function') CL.prepareFaithYearEnd(); return; }
  G.screen='hub'; save(); render();
}
// ==== [ANCRE: CORRECTIF_DUPLICATION_ROUTAGE] — chooseClass() et
// afterResult() (mode carrière/gauntlet, hors Faith qui a son propre
// endpoint prepareFaithYearEnd) redirigeaient vers l'écran suivant via la
// même chaîne if/else if copiée mot pour mot aux deux endroits — extraite
// ici une seule fois. Le mode Faith garde sa propre logique séparée (pas de
// classOffer/endOfSeason, fallback différent), volontairement non fusionnée
// ici pour ne rien changer à son comportement.
/* ==== [ANCRE: GAUNTLET_FIN_DE_RUN] — les 7 sorties de run (3 éliminations,
   3 victoires, 1 encaissement) dupliquaient chacune leur propre séquence
   « calculer / créditer legendPoints / recordGauntletBest / poser
   earnedOnElimination ». C'est exactement le motif qui avait déjà produit le
   bug de facteur ×10 sur le Ladder (cf. ANCRE REJOUABILITE_LADDER_POINTS_
   UNIFIES) quand les barèmes étaient dupliqués. Point de sortie unique :
   évalue le contrat de run, fige le multiplicateur, crédite, enregistre le
   record AU BON PALIER d'Ascension, débloque le palier suivant en cas de
   victoire, consomme la tentative du jour, et relance checkAch() pour les
   succès de fin de run. Ne touche JAMAIS G.screen ni render() — le routage
   reste sous la responsabilité de chaque branche appelante. ==== */
function finaliseGauntletRun(a,opts){
  const meta=loadMetaStats();
  a.maxPactStreak=Math.max(a.maxPactStreak||0,a.pactStreak||0);
  evalGauntletContract(a);
  const base=(opts.kind==='elimination')
    ? gauntletEliminationPayout(a.mode,opts.progress,opts.atRisk)
    : gauntletPayout(a.mode,opts.progress);
  const preBonus=gauntletFinalPayout(a,base);
  /* ==== [ANCRE: ULTIMATUM_MEDECIN] — ajout #24 (24 ajouts, 12/08/2026) :
     bonus ×1.5 UNIQUEMENT sur une victoire réelle (opts.kind==='victory')
     après un refus de l'ultimatum — une élimination après refus reste une
     élimination normale, sans pénalité NI bonus (cf. spec : "refuse + perd
     = élimination normale"). Appliqué sur preBonus, AVANT le bonus de série
     quotidienne (dailyBonusMult, juste en dessous) — les deux bonus sont
     indépendants et se cumulent, comme le reste des multiplicateurs de run. ==== */
  const doctorBonusMult=(opts.kind==='victory' && a.doctorRefused)?1.5:1;
  const preBonusWithDoctor=Math.round(preBonus*doctorBonusMult);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_DAILY_STREAK] — streak calculée et créditée ICI,
     au point de sortie unique de la run, pour compter une tentative du jour
     effectivement jouée jusqu'au bout (victoire, élimination OU
     encaissement — les 3 passent par finaliseGauntletRun). Le bonus
     s'applique en plus de gauntletRunMult (mise, pactes, contrat), pas à sa
     place — deux systèmes indépendants, cf. la ligne dédiée dans
     runDebriefBlock (ui-04). ==== */
  let dailyStreak=null, dailyBonusMult=1;
  if(a.daily){
    /* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
       la série ne progresse plus sur simple tentative jouée jusqu'au bout,
       mais uniquement quand l'objectif du jour est réellement atteint
       (prog.completed, mis à jour au fil des combats — cf. afterResult ci-
       dessus). streakCredited empêche un double crédit si l'objectif était
       déjà atteint plus tôt dans la journée (2e run du jour, par ex.). ==== */
    const prog=meta.gauntletDailyObjProgress;
    if(prog && prog.completed && !prog.streakCredited){
      dailyStreak=recordGauntletDailyStreak(meta);
      prog.streakCredited=true;
    } else {
      dailyStreak=meta.gauntletDailyStreak||0;
    }
    /* ==== [FIN ANCRE] ==== */
    dailyBonusMult=gauntletDailyStreakBonusMult(dailyStreak);
  }
  const earned=Math.round(preBonusWithDoctor*dailyBonusMult);
  /* ==== [FIN ANCRE] ==== */
  if(earned>0) meta.legendPoints=(meta.legendPoints||0)+earned;
  a.isNewRecord=recordGauntletBest(meta,a.mode,opts.progress,a.asc||0);
  /* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — enregistré EN PLUS du record
     global ci-dessus, jamais à sa place. G.f est toujours défini à ce stade
     (une run Gauntlet ne peut se terminer sans combattant actif) mais le
     garde-fou reste défensif au cas où finaliseGauntletRun soit un jour
     appelée hors contexte réel (tests, retryArcade...). ==== */
  if(typeof G!=='undefined' && G && G.f && G.f.nick) a.isNewArchetypeRecord=recordGauntletBestByArchetype(meta,a.mode,opts.progress,a.asc||0,G.f.nick);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : le
     journal de combats de CETTE run (G.arcade.ghostFights, alimenté par
     resolveArcadeFight, ui-03) ne remplace la référence enregistrée QUE si
     cette run vient de battre le record d'archétype ci-dessus — jamais
     avant, sinon une run moyenne écraserait le fantôme d'une run bien
     meilleure. ==== */
  if(a.isNewArchetypeRecord && typeof G!=='undefined' && G && G.f && G.f.nick) recordGauntletGhostLog(meta,a.mode,a.asc||0,G.f.nick,a.ghostFights||[]);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: TOUR_ASCENSION_CONDITIONS_MESUREES] — le palier suivant
     s'ouvre désormais sur une performance atteignable (cf. state.js pour les
     taux mesurés), pas seulement sur une victoire totale qui ne tombait que
     dans 0 à 2 % des runs. a.ascJustUnlocked sert à l'annoncer sur l'écran
     de fin de run — sans quoi le joueur ne saurait pas ce qu'il vient
     d'ouvrir. ==== */
  if(opts.kind==='victory' || gauntletAscUnlockReached(a.mode,opts.progress)){
    if(recordGauntletAscension(meta,a.mode,a.asc||0)) a.ascJustUnlocked=(a.asc||0)+1;
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: RELIQUES_SURVIE] — ajout #7 (24 ajouts, 12/08/2026) :
     victoire au palier MAX (GAUNTLET_ASC_MAX, state.js) avec l'archétype
     G.f.nick — récompense fixe et unique par couple (mode, archétype),
     jamais réattribuée deux fois (grantGauntletRelic renvoie false si déjà
     possédée). a.newRelic/a.newMastery lus par scr_gameover (ui-04) pour
     l'annonce, exactement sur le même principe que a.newAch juste
     au-dessus pour les succès. ==== */
  if(opts.kind==='victory' && (a.asc||0)>=GAUNTLET_ASC_MAX && typeof G!=='undefined' && G && G.f && G.f.nick){
    if(grantGauntletRelic(meta,a.mode,G.f.nick)) a.newRelic=gauntletRelicContent(a.mode,G.f.nick);
    if(checkGauntletModeMastery(meta,a.mode) && grantGauntletModeMastery(meta,a.mode)) a.newMastery=GAUNTLET_MODE_MASTERY_RELIC[a.mode];
  }
  /* ==== [FIN ANCRE] ==== */
  if(a.daily) recordGauntletDaily(meta,a.mode,opts.progress);
  saveMetaStats(meta);
  a.earnedOnElimination=earned;
  a.basePayout=base;
  a.runMultApplied=gauntletRunMult(a);
  a.dailyStreak=dailyStreak;
  a.dailyStreakBonusMult=dailyBonusMult;
  a.active=false;
  const got=(typeof checkAch==='function')?checkAch():[];
  if(got&&got.length) a.newAch=(a.newAch||[]).concat(got);
  return earned;
}
/* ==== [FIN ANCRE] ==== */
function routeAfterCareerPending(){
  const p=G.pending;
  if(p&&p.classOffer) G.screen='class_choice';
  else if(p&&p.class31Offer) G.screen='class_choice_31';
  else if(p&&p.contractExpiry) G.screen='contract_nego';
  else if(p&&p.proOffer) G.screen='promo';
  else if(p&&p.topTierOffer) G.screen='toptier';
  else if(p&&p.promoOffer) G.screen='promo';
  else if(p&&p.champChampDecision) G.screen='champ_champ_decision';
  else if(p&&p.champChampOfferReady) G.screen='champ_champ_offer';
  else if(p&&p.endOfSeason) G.screen='season';
  else G.screen='hub';
}
const CL={
  theme(){ setTheme(G.theme==='light'?'dark':'light'); save(); render(); },
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  filterCodex(key,val){ if(!G.codexFilter) G.codexFilter={style:'all',rar:'all',status:'all'}; G.codexFilter[key]=val; render(); },
  /* ==== [ANCRE: CORRECTIF_SCROLL_BOUTIQUE] — bug remonté : chaque achat/
     tirage/bascule d'aperçu dans la Salle des Légendes appelait render()
     sans préserver le scroll, ramenant la page tout en haut alors que
     l'objet cliqué (et le message de résultat, tout en bas de l'écran —
     cf. G.lastMsg dans scr_legends, ui-07) se trouve plus bas. render(true)
     conserve la position de scroll (cf. ANCRE dans ui-08, fonction render). ==== */
  purchaseUnlock(itemId){ const r=purchaseLegendUnlock(itemId); G.lastMsg=r.msg; render(true); },
  /* ==== [ANCRE: APERCU_BOUTIQUE_UNIFIE] — CL.toggleShopPreview (aperçu
     replié sur place, réservé aux cosmétiques et décorations) est retiré :
     le catalogue ouvre désormais la fenêtre dédiée CL.viewShopPreview pour
     tous ses articles, sans exception. ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_ETAT_RUN_ESPACE] — même bascule d'aperçu que la
     boutique (toggleShopPreview ci-dessus), réutilisée pour replier par
     défaut la description du mutateur/le rappel du contrat dans "État de la
     run" (gauntletStatusBlock, ui-04) — un seul dépliage ouvert à la fois. ==== */
  /* ==== [ANCRE: ATTRIBUTS_EXPLIQUES] — bascule des définitions d'attributs
     sur la fiche complète. ==== */
  toggleAttrHelp(){ G._attrHelp=!G._attrHelp; render(true); },
  toggleRunStatusPreview(key){ G._runStatusPreview=(G._runStatusPreview===key?null:key); render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SUCCES_VITRINE_DIRECTE] — clic sur une tuile d'exploit ->
     "fenêtre" dédiée (scr_ach_preview, ui-07), même principe que
     CL.viewConsumablePreview ci-dessous pour le Marché noir, plutôt que le
     texte replié sur place utilisé auparavant. Pas de fenêtre Canvas ici :
     un succès n'a pas d'effet à visualiser dans l'octogone, contrairement
     à un consommable (buff/veto/filet de sécurité). ==== */
  viewAchPreview(achId){ G._achPreviewId=achId; G.screen='ach_preview'; render(); },
  closeAchPreview(){ G.screen='ach'; render(true); },
  /* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
     UNIQUEMENT en Gauntlet (G.arcade), sur scr_gameover (ui-04), bouton
     discret déjà caché côté UI si le joueur ne peut pas payer — garde-fou
     recalculé ici quand même (jamais confiance aveugle dans l'affichage).
     Ne touche PAS a.earnedOnElimination déjà crédité par finaliseGauntletRun
     (bonus conservé, pas annulé) : le rachat s'ajoute par-dessus, il ne
     rembourse rien. ==== */
  buyDevilContinue(){
    const a=G.arcade; if(!a) return;
    const cost=gauntletDevilCost(a.mode,a);
    const meta=loadMetaStats();
    if((meta.legendPoints||0)<cost) return;
    meta.legendPoints-=cost; saveMetaStats(meta);
    a.active=true; a.victory=false; a.cashedOut=false; a.eliminatedReason=null;
    if(a.mode==='boss_run'){ a.opponent=genBossOpponent(a.streak||0); a.revealed=false; a.bossMalus=null; }
    else if(a.mode==='ladder_100'){ a.targets=genWTUMMATargets(); }
    else { regenerateBracketOpponent(); }
    G.lastMsg=`Le Diable a été payé : ${cost} points de Légende. La run continue.`;
    G.screen='arcadehub'; save(); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026). ==== */
  /* ==== [ANCRE: CORRECTIF_LASTMSG_DECORATION] — bug remonté : G.lastMsg est un
     canal GLOBAL relu par plusieurs écrans (hub ui-01, ui-06, ui-07, et même
     scr_legend_detail) — un message posé ici pouvait donc réapparaître hors
     contexte (ex. sur le menu principal) si un render() intermédiaire ne
     l'avait pas déjà consommé. Équiper/retirer une décoration est une action
     cosmétique dont le retour visuel est déjà immédiat (bordure/halo sur la
     carte) : le message texte est déplacé sur G._decoMsg, lu UNIQUEMENT par
     scr_legend_detail (seul écran où cette action est possible), donc jamais
     susceptible de fuiter ailleurs. ==== */
  equipDecoration(hofId,decId){ const r=equipPantheonDecoration(hofId,decId); G._decoMsg=r.msg; render(); },
  unequipDecoration(hofId,decId){ const r=unequipPantheonDecoration(hofId,decId); G._decoMsg=r.msg; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026). ==== */
  purchaseConsumable(itemId){ const meta=loadMetaStats(); const r=purchaseGauntletConsumable(meta,itemId); G.lastMsg=r.msg; saveMetaStats(meta); render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: PREVIEW_MARCHE_NOIR_CANVA] — item demandé : clic sur une
     tuile du Marché noir -> "fenêtre" dédiée (scr_consumable_preview)
     plutôt que le texte replié sur place (shopPreviewHtml, réservé
     désormais au catalogue classique). G._returnScreen mémorise l'écran de
     départ (toujours 'legends' en pratique) pour y revenir exactement au
     lieu de coder 'legends' en dur ici. ==== */
  viewConsumablePreview(itemId){ G._consumablePreviewId=itemId; G._returnScreen=G.screen; G.screen='consumable_preview'; render(); },
  closeConsumablePreview(){ G.screen=G._returnScreen||'legends'; G._returnScreen=null; render(true); },
  /* ==== [ANCRE: APERCU_BOUTIQUE_UNIFIE] — même va-et-vient que le Marché
     noir, pour tous les articles du catalogue. ==== */
  viewShopPreview(itemId){ G._shopPreviewId=itemId; G._returnScreen=G.screen; G.screen='shop_preview'; render(); },
  closeShopPreview(){ G.screen=G._returnScreen||'legends'; G._returnScreen=null; render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ROTATION_OFFRES_EXCLUSIVES] — ajout #9 (24 ajouts, 12/08/2026). ==== */
  purchaseExclusiveOffer(){ const meta=loadMetaStats(); const r=purchaseExclusiveOffer(meta); G.lastMsg=r.msg; render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: LOTERIE_LEGENDES] — ajout #11 (24 ajouts, 12/08/2026). ==== */
  drawGauntletLottery(){ const meta=loadMetaStats(); const r=drawGauntletLottery(meta); G.lastMsg=r.msg; render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_MENU_HIERARCHIE] — ajout #2 (24 ajouts, 12/08/2026) :
     accès à la boutique depuis le menu Gauntlet (cf. scr_legends, ui-07). */
  /* ==== [ANCRE: CORRECTIF_FILTRE_GAUNTLET_RETIRE] — item demandé : le
     filtre "contenu Gauntlet uniquement" est retiré (scr_legends, ui-07) —
     goShopGauntlet() ne pose plus le drapeau, simple redirection ;
     toggleShopGauntletFilter() n'a plus d'appelant, supprimée. ==== */
  goShopGauntlet(){ CL.go('legends'); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  viewLegend(id){ G.viewingLegendId=id; G.screen='legend_detail'; render(); },
  // ==== [ANCRE: SYSTEME_CLASSES] (contrôleur) — choix unique et définitif,
  // vérifié par f.classChosen (jamais réinitialisé, contrairement à un simple
  // f.class qui pourrait légitimement sembler modifiable).
  // ==== [ANCRE: CLASSE_EXCEPTION_PLAFOND_AGE] — confirmé explicitement : les
  // malus de Classe (ex. -3 Menton) sont une EXCEPTION volontaire au plafond
  // anti-remontée du vieillissement (f.agedCeilings, cf. applyAging/
  // grantSkill/applyDeltas dans engine.js). Un attribut baissé par une Classe
  // reste librement remontable ensuite par l'entraînement ou une compétence —
  // contrairement à un attribut baissé par l'âge. Volontairement, on
  // n'écrit donc PAS dans f.agedCeilings ici.
  chooseClass(idx){
    const pool=CLASSES[G.f.style]||[];
    const cls=pool[idx]; if(!cls || G.f.classChosen) return;
    Object.entries(cls.fx).forEach(([k,v])=>{ G.f.attrs[k]=clamp((G.f.attrs[k]||50)+v,1,100); });
    G.f.class=cls.id; G.f.classLabel=cls.lbl; G.f.classChosen=true;
    G.f.overall=overall(G.f);
    if(G.pending) G.pending.classOffer=false;
    G.lastMsg=`Classe choisie : ${cls.lbl}. Ce choix est définitif.`;
    routeAfterCareerPending();
    save(); render();
  },
  // ==== [ANCRE: SYSTEME_CLASSES_31] (contrôleur) — même garde-fou que
  // chooseClass() (classChosen jamais réinitialisé). Le pool dépend de
  // G.f.class (choix fait à 23 ans), pas seulement du style — cohérent avec
  // scr_class_choice_31().
  chooseClass31(idx){
    const pool=(CLASSES_31[G.f.style]&&CLASSES_31[G.f.style][G.f.class])||[];
    const cls=pool[idx]; if(!cls || G.f.class31Chosen) return;
    Object.entries(cls.fx).forEach(([k,v])=>{ G.f.attrs[k]=clamp((G.f.attrs[k]||50)+v,1,100); });
    G.f.class31=cls.id; G.f.class31Label=cls.lbl; G.f.class31Chosen=true;
    G.f.overall=overall(G.f);
    if(G.pending) G.pending.class31Offer=false;
    G.lastMsg=`Classe choisie : ${cls.lbl}. Ce choix est définitif.`;
    routeAfterCareerPending();
    save(); render();
  },
  toggleHofFav(id){
    // ==== [ANCRE: BUG_ID_PANTHEON] — f.id est un NOMBRE (compteur interne),
    // mais l'attribut onclick="...('${f.id}')" le transmet toujours en
    // CHAÎNE. Une comparaison stricte ===/!== entre nombre et chaîne est
    // TOUJOURS fausse en JS, donc find()/filter() ne matchaient jamais rien
    // : Supprimer, Favori et Exporter étaient tous les trois silencieusement
    // cassés par ce seul bug. Corrigé avec String(...) des deux côtés,
    // compatible aussi bien avec les id numériques qu'avec les id texte des
    // légendes importées (ex. 'legend_1234').
    const list=loadHOF(); const f=list.find(x=>String(x.id)===String(id));
    if(f){ f.favorite=!f.favorite; saveHOF(list); render(); }
  },
  deleteHof(id){
    if(!confirm('Supprimer cette légende définitivement ?')) return;
    let list=loadHOF(); list=list.filter(x=>String(x.id)!==String(id)); saveHOF(list); render();
  },
  resetHof(){
    if(!confirm('Effacer tout le Panthéon, sauf les favoris ?')) return;
    let list=loadHOF(); list=list.filter(x=>x.favorite); saveHOF(list); render();
  },
  exportLegend(id){
    const l=loadHOF().find(x=>String(x.id)===String(id)); if(!l) return;
    // ==== [ANCRE: CORRECTIF_LIEN_AMI] — bug trouvé : le code exportait le
    // record COMPLET du Panthéon (icône SVG entière, épithètes narratives,
    // score, rang, historique amateur, rival...), aucun de ces champs n'étant
    // utilisé par reconstructLegend() ni par le duel lui-même. Sur une
    // carrière longue et décorée, ça produisait des liens de ~1900+
    // caractères — largement suffisant pour être tronqués ou rejetés en
    // silence par SMS/WhatsApp/Messenger lors du partage, ce qui donnait
    // l'impression que "le lien ne marche pas" sans aucun message d'erreur.
    // Le payload est réduit aux seuls champs réellement nécessaires.
    const slim={id:l.id,name:l.name,nick:l.nick,flag:l.flag,style:l.style,styleKey:l.styleKey,
      div:l.div,divName:l.divName,W:l.W,L:l.L,ko:l.ko,sub:l.sub,
      attrs:l.attrs,skills:l.skills,phys:l.phys,overall:l.overall};
    G.exportedCode=encodeLegendCode(slim); G.exportedName=l.name;
    try{ G.exportedLink=location.origin+location.pathname+'?legend='+encodeURIComponent(G.exportedCode); }catch(e){ G.exportedLink=null; }
    render();
  },
  copyExportedLink(){
    if(!G.exportedLink) return;
    try{
      navigator.clipboard.writeText(G.exportedLink);
      G.lastMsg="Lien copié !";
    }catch(e){ G.lastMsg="Copie automatique impossible — sélectionne le champ et copie-le manuellement."; }
    render();
  },
  clearExportedCode(){ G.exportedCode=null; G.exportedName=null; G.exportedLink=null; render(); },
  setArenaTheme(themeId){ setArenaCosmeticTheme(themeId); render(); },
  leaveSandbox(){ if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; } G.fantasyActive=false; G.vsFriendActive=false; CL.go('legends'); },
  leaveAllStars(){ G.allstars=null; CL.go('legends'); },
  setFantasy(side,dir){
     const max=loadHOF().length-1;
     if(side===0){ let n=(G.fantasyA||0)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===(G.fantasyB!==undefined?G.fantasyB:1)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyA=n;
     } else { let n=(G.fantasyB!==undefined?G.fantasyB:1)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===(G.fantasyA||0)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyB=n; }
     render();
  },
  launchFantasyFight(){
     const list=loadHOF();
     const lA=list[G.fantasyA||0], lB=list[G.fantasyB!==undefined?G.fantasyB:(list.length>1?1:0)];
     const A=reconstructLegend(lA), B=reconstructLegend(lB);
     neutralizeWeightGap(A,B);
     if(!G._backupF){ G._backupF=G.f; G._backupFight=G.fight; }
     G.f=A; G.fight={kind:'fantasy',opp:B,rounds:5,plan:null}; G.fantasyActive=true;
     const res=simulateFight(A,B,5);
     G.pending={res,win:res.winner==='A',method:res.method,finish:!isDecisionLike(res.method),opp:{name:B.name,flag:B.flag},isFantasy:true};
     buildTimeline(); G.screen='arena'; render();
  },
  initAllStars(){ initAllStarsTournament(); render(); },
  toggleAllStarsDraft(index){
     G.allstarsDraft=G.allstarsDraft||[];
     if(G.allstarsDraft.includes(index)) G.allstarsDraft=G.allstarsDraft.filter(i=>i!==index);
     else if(G.allstarsDraft.length<8) G.allstarsDraft.push(index);
     render();
  },
  launchAllStars(){
     if(!G.allstarsDraft || G.allstarsDraft.length!==8) return;
     const fullList=loadHOF();
     const top8=G.allstarsDraft.map(idx=>reconstructLegend(fullList[idx])).sort(()=>0.5-Math.random());
     G.allstars={active:true,step:'Quarts de finale',roundNum:1,
       matches:[{a:top8[0],b:top8[1]},{a:top8[2],b:top8[3]},{a:top8[4],b:top8[5]},{a:top8[6],b:top8[7]}],
       history:[]};
     G.screen='allstars'; render();
  },
  advanceAllStars(){ advanceAllStarsTournament(); render(); },
  setVsFriendPlayer(side,dir){
     const max=loadHOF().length-1;
     if(side===0){ let n=(G.vsFriendSelA||0)+dir; if(n<0)n=max; if(n>max)n=0; G.vsFriendSelA=n; }
     else { let n=(G.vsFriendSelB!==undefined?G.vsFriendSelB:1)+dir; if(n<0)n=max; if(n>max)n=0; G.vsFriendSelB=n; }
     render();
  },
  importFriendCode(){
     // Cast JSDoc : getElementById() renvoie HTMLElement générique, qui n'a
     // pas .value — ce champ est bien une <textarea> dans le HTML réel.
     const el=/** @type {HTMLTextAreaElement|null} */ (document.getElementById('friend_code'));
     let raw=(el&&el.value||'').trim();
     // ==== [ANCRE: IMPORT_LIEN_AMI] — le champ acceptait uniquement le code
     // brut ; on accepte désormais aussi le lien complet collé tel quel
     // (ex. https://.../?legend=XXXX), en extrayant le paramètre 'legend'.
     if(raw.includes('legend=')){
       try{
         const url=new URL(raw);
         raw=url.searchParams.get('legend')||raw;
       }catch(e){
         const m=raw.match(/legend=([^&\s]+)/);
         if(m) raw=decodeURIComponent(m[1]);
       }
     }
     const legend=decodeLegendCode(raw);
     if(!legend){ G.lastMsg="Code ou lien invalide/corrompu."; render(); return; }
     G.importedFriendLegend=legend; render();
  },
  clearImportedFriend(){ G.importedFriendLegend=null; render(); },
  launchVsFriend(){
     if(!G.vsFriendScore){
       const list=loadHOF();
       const lA=list[G.vsFriendSelA||0];
       const lB=G.importedFriendLegend||list[G.vsFriendSelB!==undefined?G.vsFriendSelB:1];
       G.vsFriendLegendA=reconstructLegend(lA);
       G.vsFriendLegendB=reconstructLegend(lB);
       G.vsFriendLegendB.champion='monde'; G.vsFriendLegendB.flag=G.vsFriendLegendB.flag||'🏴\u200d☠️';
       neutralizeWeightGap(G.vsFriendLegendA,G.vsFriendLegendB);
       G.vsFriendScore={A:0,B:0,round:0};
     }
     // ==== [ANCRE: TACTIQUE_VS_AMI] — avant : la manche était simulée
     // instantanément sans jamais demander de consigne tactique. On route
     // maintenant vers un choix de tactique (comme en carrière) avant de
     // lancer réellement la simulation, via chooseVsFriendPlan().
     G.screen='vs_friend_plan'; save(); render();
  },
  chooseVsFriendPlan(idx){
     const A=G.vsFriendLegendA, B=G.vsFriendLegendB;
     const combined=getExclusiveTactics(A).concat(TACTICS[A.style]||[]);
     const planObj=combined[idx]; if(!planObj) return;
     G.vsFriendScore.round++;
     const isDecider=G.vsFriendScore.A===1 && G.vsFriendScore.B===1;
     const rounds=isDecider?5:3;
     if(!G._backupF){ G._backupF=G.f; G._backupFight=G.fight; }
     G.f=A; G.fight={kind:'fantasy',opp:B,rounds,plan:planObj.m,planLabel:planObj.lbl}; G.vsFriendActive=true;
     const res=simulateFight(A,B,rounds,planObj.m);
     G.pending={res,win:res.winner==='A',method:res.method,finish:!isDecisionLike(res.method),opp:{name:B.name,flag:B.flag},isVsFriend:true,isDecider};
     buildTimeline(); G.screen='arena'; render();
  },
  filterHof(key,val){ if(!G.hofFilter) G.hofFilter={}; if(val===''||val===0) delete G.hofFilter[key]; else G.hofFilter[key]=val; render(); },
  toggleHofFilters(){ G.showHofFilters=!G.showHofFilters; render(); },
  acceptChampChampOffer(){
    const offer=G.f.champChampOffer; if(!offer) return;
    G.fight={kind:'champchamp_title',opp:offer.champion,rounds:5,malus:null,oppMalus:null};
    G.sel={o:offer.champion,read:'Combat historique pour la double couronne.',context:'CHAMP-CHAMP'};
    G.train=trainingOptions(G.f);
    G.screen='camp'; save(); render();
  },
  declineChampChampOffer(){
    G.f.champChampLastOfferDefenses=G.f.defenses;
    G.f.champChampOffer=null;
    G.lastMsg='Vous avez décliné le supercombat. Le président reviendra à la charge après deux défenses supplémentaires.';
    G.screen=G.faith?'faith_hub':'hub'; save(); render();
  },
  chooseChampChampFocus(divId){
    // ==== [ANCRE: CORRECTIF_FOCUS_CHAMPCHAMP] — bug trouvé : le choix de
    // focus n'était enregistré que dans champChampFocus, une variable jamais
    // relue ailleurs. G.f.div, G.f.divName et G.roster n'étaient JAMAIS mis
    // à jour : même en choisissant "nouvelle ceinture", le joueur restait
    // coincé à combattre dans son ancienne division pour toujours, et
    // resolveFight() incrémentait aveuglément le compteur de défenses de
    // l'ancienne ceinture. On bascule désormais réellement de division
    // quand ce choix est fait, avec régénération du roster correspondant.
    G.f.champChampFocus=divId;
    if(divId!==G.f.div){
      const newDiv=divById(divId);
      if(newDiv){ G.f.div=newDiv.id; G.f.divName=newDiv.name; G.roster=makeOrgRoster(G.f); }
    }
    G.lastMsg=divId===G.f.div?'Vous restez concentré sur votre division d\u2019origine.':'Vous faites de votre nouvelle ceinture votre priorité.';
    G.screen=G.faith?'faith_hub':'hub'; save(); render();
  },
  chooseMue(styleId){ const r=triggerMueMartiale(G.f,styleId); G.lastMsg=r.msg||G.lastMsg;
    G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(1,3)){ applyAging(G.f); G.f._fy=0; }
    advanceRoster(); G.screen='hub'; save(); render(); },
  pickScenario(scenId){
    const scen=SCENARIOS.find(s=>s.id===scenId); if(!scen) return;
    // Sécurité : un scénario verrouillé ne doit jamais pouvoir démarrer, même
    // via un appel direct (ex. ancien lien, manipulation console).
    if(scen.legendUnlock && typeof checkLegendUnlock==='function' && !checkLegendUnlock(scen.legendUnlock)) return;
    wipe();
    G={theme:(G&&G.theme)||'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}};
    setTheme(G.theme);
    CL.create();
    G.activeScenario=scen.id;
    scen.init(G.f);
    // Recalcul critique : create() a fixé l'overall/Elo au niveau amateur, mais
    // scen.init() vient de changer radicalement l'organisation et le palmarès —
    // sans ce recalcul, le combattant restait à ~800 pts Elo pour toujours,
    // gelant son classement quel que soit son parcours réel.
    G.f.overall=overall(G.f);
    const bias=Math.round(((G.f.W||0)-(G.f.L||0))*18);
    G.f.orgElo=eloBaseline(G.f.org,G.f.overall)+bias;
    G.f.careerElo=eloBaseline(G.f.org,G.f.overall)+Math.round(bias*0.6);
    G.roster=makeOrgRoster(G.f);
    G.screen='hub'; save(); render(); },
  cont(){ if(load()){ setTheme(G.theme||'dark');
    // ==== [ANCRE: CORRECTIF_RETRAITE_FANTOME] — bug trouvé : cont() forçait
    // TOUJOURS l'écran 'hub' au chargement, sans jamais vérifier f.retired.
    // Un joueur qui rechargeait la page juste après sa retraite (l'écran
    // 'legacy' est sauvegardé, rien ne l'exclut de save()) atterrissait donc
    // dans le vestiaire avec un bouton de combat parfaitement cliquable —
    // pouvant enchaîner d'autres combats, dupliquer son entrée au Panthéon
    // et générer des points de Légende à volonté à chaque nouvelle "retraite".
    G.screen=(G.f && G.f.retired)?'legacy':(G.faith?'faith_hub':'hub'); render(); } },
  draft(k,v){ G.draft[k]=v; if(k==='gender')G.draft.div=DIVISIONS[v][Math.min(3,DIVISIONS[v].length-1)].id; render(true); },
  draftIn(k,v){ G.draft[k]=v; },
  create(){ const d=G.draft; const f=makeFighter({gender:d.gender,div:d.div,style:d.style,countryKey:d.country,first:(d.first||'').trim()||undefined,age:RI(15,16),potential:RI(80,95),freshPlayer:true});
    f.stage='amateur'; f.org=0; f._fy=0;
    if(d.personality){ f.personality=d.personality;
      if(d.personality==='villain'){ f.hypeBonus=1.3; f.morale=clamp(f.morale-10,0,100); }
      else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    }
    G.ironMan=!!d.ironMan;
    // ==== [ANCRE: META02] — mentorat en 3 piliers, consommé une seule fois à la
    // création : (1) bonus d'archétype selon le style du mentor, (2) faveur des
    // promoteurs (cooldown d'offre pro réduit de 50%), (3) bonus de camp
    // persistant sur la stat principale du mentor (+2 à chaque entraînement).
    try{ const raw=localStorage.getItem('cage-legacy-mentor-bonus');
      if(raw){
        const mentor=JSON.parse(raw);
        const ARCHETYPE_BONUS={
          wrestler:{tdd:10,strength:5}, sambo:{tdd:10,strength:5},
          boxer:{handSpeed:10,jab:5,cross:5}, kickboxer:{handSpeed:10,jab:5,cross:5},
          muayThai:{handSpeed:10,jab:5,cross:5}, karate:{handSpeed:10,jab:5,cross:5},
          bjj:{submission:10,guardWork:5}, mma:{fightIQ:8,adaptability:8}
        };
        const MAIN_STAT={boxer:'jab',kickboxer:'kick',muayThai:'kick',karate:'kick',wrestler:'takedown',bjj:'submission',sambo:'takedown',mma:'fightIQ'};
        const bonus=ARCHETYPE_BONUS[mentor.style]||{};
        for(const k in bonus) if(f.attrs[k]!==undefined) f.attrs[k]=clamp(f.attrs[k]+bonus[k],1,100);
        f.overall=overall(f);
        f._mentorMainStat=MAIN_STAT[mentor.style]||null; // pilier 3, lu par chooseTraining()
        f.proOfferCooldown=0; f._mentorFastTrack=true; // pilier 2, lu par declinePro()
        G.lastMsg=`Bonus testamentaire actif ! Votre ancienne légende vous laisse un héritage : attributs de style de départ, cooldown des offres pro réduit de moitié, et bonus de camp permanent en ${f._mentorMainStat?attrLabel(f._mentorMainStat):'polyvalence'}.`;
        localStorage.removeItem('cage-legacy-mentor-bonus');
      }
    }catch(e){}
    // ==== [FIN ANCRE] ====
    // ==== [ANCRE: CORRECTIF_RESET_TITLEHISTORY] — bug remonté ("le registre des
    // ceintures d'un combattant affiche les ceintures d'un autre combattant") :
    // le commentaire d'origine (LINEAGE, ui-01) affirmait déjà que G.titleHistory
    // "est remis à zéro à chaque nouvelle carrière", mais aucun code ne le
    // faisait réellement — seule une initialisation paresseuse existait
    // (if(!G.titleHistory)...), donc le registre s'accumulait sans fin d'une
    // légende à l'autre. Les règnes déjà accomplis restent gravés dans le
    // Panthéon (enshrine(), state.js) — ce reset ne perd donc aucune trace,
    // il empêche seulement une nouvelle carrière d'hériter du registre d'une
    // carrière précédente.
    G.titleHistory=[];
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; G.season={year:1,fights:[]}; checkAch(); G.screen='hub'; save(); render(); },
  fightSelect(){ startFightSelect(); },
  opp(i){
    if(G.faith){
      G.sel=G.opps[i];
      let pendingOppMalus=null, pendingMyMalus=null;
      if(G.faith.nextFightBuffs){
        pendingOppMalus=G.faith.nextFightBuffs.oppMalus;
        pendingMyMalus=G.faith.nextFightBuffs.myMalus;
        if(G.faith.nextFightBuffs.neutralizePlanB){ if(!pendingOppMalus) pendingOppMalus={}; pendingOppMalus.adaptability=-50; }
        G.faith.nextFightBuffs=null;
      }
      if(G.faith.perks && G.faith.perks.hometown){
        G.f.morale=clamp(G.f.morale+15,0,100); G.f.form=clamp(G.f.form+8,0,100); G.faith.perks.hometown=false;
      }
      if(G.faith.perks && G.faith.perks.catchweight){
        if(!pendingOppMalus) pendingOppMalus={}; pendingOppMalus.cardio=-20; pendingOppMalus.durability=-15; G.faith.perks.catchweight=false;
      }
      const kind=fightKind(); const opp=G.sel.o; const rounds=(kind==='title'||kind==='defense')?5:3;
      G.fight={kind,opp,rounds,malus:pendingMyMalus||null,oppMalus:pendingOppMalus||null,mmRole:G.sel.mm?G.sel.mm.role:null};
      const wc=weightCutInfo(G.f);
      let cutTier;
      if(G.faith.dietYear===G.faith.year){ cutTier='sans_effort'; }
      else if(wc.cutPct<=3) cutTier='sans_effort';
      else if(wc.cutPct<=8) cutTier='facile';
      else if(wc.cutPct<=13) cutTier='normal';
      else if(wc.cutPct<=18) cutTier='complique';
      else cutTier='impossible';
      G.fight.cutResult={tier:cutTier,effPct:(G.faith.dietYear===G.faith.year)?0:wc.cutPct,kg:(G.faith.dietYear===G.faith.year)?0:wc.cutKg,walk:wc.walk,limit:wc.limit};
      proceedToFight();
    } else { chooseOpponent(i); }
  },
  train(i){ chooseTraining(i); },
  setCampTier(tierId){ G.selectedCampTier=tierId; render(); },
  skipArena(){ CL.toResult(); },
  nextRound(){ if(!ARENA||!ARENA.roundPause) return;
    ARENA.pauseOffset=performance.now()-ARENA.t0-(ARENA.pendingBeatIdx||0)*BEAT_MS;
    ARENA.roundPause=false;
    if(ARENA.loopFn) ARENA.raf=requestAnimationFrame(ARENA.loopFn);
  },
  handleEvent(actionId){ const ev=G.activeEvent; const id=actionId||(ev&&ev.actionId);
    if(id==='short_notice_accept'){
      const newOpp=G._pendingShortNoticeOpp;
      if(newOpp) G.fight.opp=newOpp;
      G.fight.malus=Object.assign({},G.fight.malus,{cardio:-25});
      // ==== [ANCRE: CORRECTIF_PUNITION_SHORT_NOTICE] — bug trouvé : accepter
      // un remplacement de dernière minute échange l'adversaire pour un PNJ
      // souvent bien moins bien classé (pour compenser le malus physique),
      // mais resolveFight() ignorait totalement ce contexte et appliquait sa
      // sanction "adversaire trop facile" comme si le joueur avait choisi
      // d'esquiver un vrai défi. On marque explicitement le combat pour
      // l'exempter de cette pénalité (voir aussi resolveFight()).
      G.fight.isShortNotice=true;
      G.f.form=clamp(G.f.form-30,0,100);
      G.f.earnings=(G.f.earnings||0)+250;
      delete G._pendingShortNoticeOpp;
      proceedToFight(); return;
    }
    if(id==='short_notice_decline'){
      delete G._pendingShortNoticeOpp;
      G.lastMsg='Vous refusez de sauver la carte. Votre combat initial est maintenu, sans prime ni pénalité.';
      proceedToFight(); return;
    }
    if(id==='mue_martiale'){ G.screen='mueChoice'; save(); render(); return; }
    if(id==='mue_martiale_decline'){ G.f.morale=clamp(G.f.morale-5,0,100); G.lastMsg='Vous restez fidèle à votre style, pour le meilleur ou pour le pire.'; G.screen='hub'; save(); render(); return; }
    if(id==='major_injury'){ const f=G.f;
      f._fy=(f._fy||0)+1; if(f._fy>=RI(1,3)){ applyAging(f); f._fy=0; }
      const inj=rollInjury(); f.injury={name:inj.name,left:inj.fights};
      f.form=clamp(f.form-20,0,100); f.morale=clamp(f.morale-15,0,100);
      if(typeof checkIronManDeath==='function') checkIronManDeath(null,inj);
      // ==== [ANCRE: CORRECTIF_IRONMAN_INFIRMERIE] — même correctif que pour
      // les blessures d'entraînement : router vers la retraite si le mode
      // Iron Man vient de déclencher G.f.retired, plutôt que de renvoyer
      // sans condition au vestiaire.
      if(G.f.retired){ CL.toLegacy(); return; }
      advanceRoster(); G.screen='hub'; save(); render();
    } else if(id==='botched_weight_accept'){
      G.fight.malus=Object.assign({},G.fight.malus,{cardio:-20,durability:-15,strength:-10});
      // Pénalité de bourse alignée sur le % annoncé dans le texte de l'événement
      // (gradué selon l'écart de poids réel — cf. CORRECTIF_CATCHWEIGHT_GRADUE),
      // au lieu d'un -35% fixe qui ne correspondait pas toujours au message affiché.
      const penPct=(G.fight.cutResult&&G.fight.cutResult.catchweightPenaltyPct)||35;
      G.fight.pursePenalty=+(1-penPct/100).toFixed(2);
      proceedToFight();
    } else if(id==='botched_weight_decline'){
      G.f.morale=clamp(G.f.morale-8,0,100);
      G.lastMsg='Combat annulé. Mauvaise impression garantie auprès de l\u2019organisation.';
      G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(1,3)){ applyAging(G.f); G.f._fy=0; }
      advanceRoster();
      G.screen='hub'; save(); render();
    } else if(id==='opp_overweight_accept'){
      const oa=G.fight.opp.attrs;
      oa.killer=clamp((oa.killer||50)+5,1,100); oa.power=clamp((oa.power||50)+5,1,100);
      G.fight.opp.overall=overall(G.fight.opp);
      proceedToFight();
    } else if(id==='opp_overweight_decline'){
      G.f.form=clamp(G.f.form-5,0,100);
      G.lastMsg='Combat annulé suite au surpoids adverse. Un remplaçant est recherché pour la prochaine carte.';
      G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(1,3)){ applyAging(G.f); G.f._fy=0; }
      advanceRoster();
      G.screen='hub'; save(); render();
    } else if(id==='faceoff_smile' || id==='faceoff_ignore'){
      G.fight.malus=Object.assign({},G.fight.malus,{composure:8,focus:5,aggression:-5});
      G.f.morale=clamp(G.f.morale+5,0,100);
      G.lastMsg='Vous avez remporté la guerre psychologique de la pesée (+ Sang-froid/Moral).';
      proceedToFight();
    } else if(id==='faceoff_shove' || id==='faceoff_talkback'){
      G.fight.malus=Object.assign({},G.fight.malus,{confidence:8,aggression:10,composure:-10});
      G.lastMsg='L\u2019adrénaline monte avant même d\u2019entrer dans la cage (+ Agressivité/Confiance, - Sang-froid).';
      proceedToFight();
    } else { proceedToFight(); }
  },
  recoverInjury(){ const f=G.f; if(!f.injury)return;
    f.injury.left-=1; f.morale=clamp(f.morale+5,0,100); f.form=clamp(f.form+15,0,100);
    f._fy=(f._fy||0)+1; if(f._fy>=RI(1,3)){ applyAging(f); f._fy=0; }
    advanceRoster();
    if(f.injury.left<=0) f.injury=null;
    // ==== [ANCRE: CORRECTIF_CLASSE_BLESSURE] — bug remonté : une blessure
    // qui fait franchir l'âge de 23 (ou 31) ans via applyAging() ci-dessus
    // ne passe jamais par resolveFight(), seul endroit qui pose classOffer/
    // class31Offer — la proposition de Classe pouvait donc être retardée
    // indéfiniment au-delà de la guérison. Dès que la blessure est purgée,
    // on revérifie l'éligibilité et on route directement vers l'écran de
    // choix si applicable, sans attendre le prochain combat.
    if(!f.injury && !f.retired){
      if(!f.classChosen && f.age>=23){ G.screen='class_choice'; save(); render(); return; }
      if(f.classChosen && !f.class31Chosen && f.age>=31){ G.screen='class_choice_31'; save(); render(); return; }
    }
    save(); render(); },
  choosePlan(idx){ const combined=getExclusiveTactics(G.f).concat(TACTICS[G.f.style]||[]); const planObj=combined[idx]; if(!planObj)return;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  /* ==== [ANCRE: CORRECTIF_RENDU_ROUND_PAR_ROUND] — seul point de sortie de
     l'arène (skipArena et la fin naturelle de l'animation passent tous les
     deux par ici) : généralisé pour pouvoir router ailleurs qu'au résultat
     final. G._arenaNext (posé par runCoachingRound, ui-03, avant un round
     intermédiaire de coaching Gauntlet) redirige vers l'écran de coaching
     au lieu du résultat ; undefined partout ailleurs préserve exactement
     le comportement d'origine ('result'). ==== */
  toResult(){ stopArena(); G.screen=G._arenaNext||'result'; G._arenaNext=null; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  afterResult(){
    if(G.pending && G.pending.isFantasy){
      if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; }
      G.fantasyActive=false; G.screen='fantasy_setup'; render(); return;
    }
    if(G.pending && G.pending.isVsFriend){
      const s=G.vsFriendScore;
      if(G.pending.win) s.A++; else if(G.pending.res.winner==='B') s.B++;
      if(s.A>=2 || s.B>=2){
        G.lastMsg=`Série terminée : ${s.A>=2?esc(G.vsFriendLegendA.name):esc(G.vsFriendLegendB.name)} remporte la série ${Math.max(s.A,s.B)}-${Math.min(s.A,s.B)}.`;
        if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; }
        G.vsFriendActive=false; G.vsFriendScore=null; G.vsFriendLegendA=null; G.vsFriendLegendB=null;
        G.screen='vs_friend'; render(); return;
      }
      G.lastMsg=`Manche ${s.round} terminée. Score de la série : ${s.A} - ${s.B}.${s.A===1&&s.B===1?' Manche décisive : 5 rounds.':''}`;
      G.screen='vs_friend_next'; render(); return;
    }
    if(G.faith){
      const p=G.pending;
      if(p&&p.contractExpiry){ G.screen='contract_nego'; save(); render(); return; }
      if(p&&p.proOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.topTierOffer){ G.screen='toptier'; save(); render(); return; }
      if(p&&p.promoOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.champChampDecision){ G.screen='champ_champ_decision'; save(); render(); return; }
      if(p&&p.champChampOfferReady){ G.screen='champ_champ_offer'; save(); render(); return; }
      if(typeof CL.prepareFaithYearEnd==='function') CL.prepareFaithYearEnd();
      return;
    }
    if(G.arcade && G.arcade.active){
      const win=G.pending&&G.pending.win;
      const _res=G.pending&&G.pending.res;
      /* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
         suivi générique des compteurs de l'objectif du jour, exécuté une
         seule fois par combat, AVANT le branchement par mode ci-dessous
         (bracket64/ladder_100/boss_run partagent donc exactement la même
         logique). Compteurs "run" (koStreak/winStreak/flawless) vivent sur
         G.arcade — remis à zéro à chaque nouvelle run par la simple absence
         de champ au lancement. Compteurs "day" vivent dans
         meta.gauntletDailyObjProgress (cumulés sur toutes les tentatives du
         jour, tous modes confondus). ==== */
      (()=>{
        const meta=loadMetaStats();
        gauntletDailyObjective(meta); // garantit l'existence + gère un éventuel changement de jour
        const prog=meta.gauntletDailyObjProgress;
        if(_res){
          if(win && G.pending.method==='Soumission') prog.subWins=(prog.subWins||0)+1;
          prog.takedowns=(prog.takedowns||0)+(_res.stats.A.td||0);
          prog.kdCount=(prog.kdCount||0)+(_res.stats.A.kd||0);
        }
        G.arcade.koStreak=(win && G.pending.method && G.pending.method.startsWith('KO'))?(G.arcade.koStreak||0)+1:0;
        G.arcade.winStreak=win?(G.arcade.winStreak||0)+1:0;
        /* ==== [ANCRE: CORRECTIF_DEFI_SANS_DEGAT] — seuil assoupli de "===0"
           à "<=3" (cf. state.js, GAUNTLET_DAILY_OBJECTIVES) : le moteur
           inflige 1 à 3 dégâts à chaque échange debout perdu, donc une
           égalité stricte à zéro exigeait de ne perdre AUCUN échange sur
           tout le combat — un défi du jour irréalisable en pratique, pas
           seulement rare. ==== */
        if(_res && win && (_res.stats.A.dmgHead+_res.stats.A.dmgBody+_res.stats.A.dmgLegs)<=3) G.arcade.flawlessAchieved=true;
        /* ==== [FIN ANCRE] ==== */
        /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026) :
           "Mise à l'abri automatique" : dès le 1er combat GAGNÉ de la run
           (peu importe le mode), petite somme versée immédiatement en
           points de Légende, une seule fois par run (autobankTriggered). ==== */
        if(win && G.arcade.consumableAutobank && !G.arcade.autobankTriggered){
          G.arcade.autobankTriggered=true;
          meta.legendPoints=(meta.legendPoints||0)+15;
          G.lastMsg='Mise à l\u2019abri automatique : 15 points de Légende sécurisés.';
        }
        /* ==== [FIN ANCRE] ==== */
        const obj=meta.gauntletDailyObj;
        if(obj && !prog.completed && (!obj.scope || obj.scope===G.arcade.mode)){
          let val=0;
          if(obj.kind==='day') val=prog[obj.metric]||0;
          else if(obj.metric==='koStreak') val=G.arcade.koStreak||0;
          else if(obj.metric==='winStreak') val=G.arcade.winStreak||0;
          else if(obj.metric==='flawless') val=G.arcade.flawlessAchieved?1:0;
          if(val>=obj.target) prog.completed=true;
        }
        saveMetaStats(meta);
      })();
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: REJOUABILITE_NEARMISS] — res.scoreA/scoreB/res.judges
         (juges 10-point) sont calculés par simulateFight() pour CHAQUE combat
         mais n'étaient jamais lus en arcade : une élimination aux points
         affichait "R.I.P." muet, identique à une déroute nette. Mémorisé sur
         chaque issue à cartes (avant le kill de la run plus bas), lu par
         scr_gameover pour distinguer une défaite écrasée d'un near-miss. ==== */
      G.arcade.lastScorecard=(_res && isDecisionLike(_res.method))?{scoreA:_res.scoreA,scoreB:_res.scoreB,judges:_res.judges,method:_res.method}:null;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: REJOUABILITE_PACTE_FINITION] — clause de mort subite
         opt-in : posée par le joueur via CL.togglePact() (bouton au camp,
         cf. ui-04) avant Bracket 64 / Ladder 100 seulement — Boss Run a déjà
         sa propre clause KO-only permanente (condition==='ko_only') et n'a
         pas d'écran de camp entre les combats. Consommée à chaque combat,
         qu'elle se déclenche ou non. ==== */
      /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
         12/08/2026) : remplace la condition asc>=3 par une lecture directe
         du mutateur tiré pour cette run (G.arcade.mutator.id) — plus aucun
         lien avec le palier d'Ascension lui-même. ==== */
      const pactForcedByAscension=G.arcade.mutator&&G.arcade.mutator.id==='mut_pacte_force' && G.arcade.mode!=='boss_run';
      const pactWasActive=pactForcedByAscension||!!G.arcade.pactActive; G.arcade.pactActive=false;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: ITEM_PACTE_AVEC_SOUMISSIONS] — item demandé : le pacte de
         finition ne validait QUE le KO/TKO (`!method.startsWith('KO')`), une
         victoire par soumission comptait comme un échec au même titre qu'une
         décision aux points. Élargi aux deux méthodes de finition : seule une
         victoire aux points (method vide) reste un échec du pacte. ==== */
      const pactFail=pactWasActive && win && G.pending.method && !(G.pending.method.startsWith('KO')||G.pending.method==='Soumission');
      /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
         12/08/2026) : "Juges sévères" — une victoire aux points (method
         vide = décision, cf. pactFail juste au-dessus qui utilise le même
         critère) ne suffit plus si la marge est trop faible. Marge lue sur
         G.arcade.lastScorecard (posé juste au-dessus, ANCRE
         REJOUABILITE_NEARMISS), qui cumule déjà les 3 juges — seuil de 6
         points choisi pour représenter une décision "large" sur une échelle
         10-point sur 3 rounds (soit ~2 points d'écart par round et par
         juge, une marge réellement confortable, pas un simple 29-28). ==== */
      const judgesMutActive=G.arcade.mutator&&G.arcade.mutator.id==='mut_juges_severes';
      const judgesFail=judgesMutActive && win && isDecisionLike(G.pending.method) && G.arcade.lastScorecard && (G.arcade.lastScorecard.scoreA-G.arcade.lastScorecard.scoreB)<6;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: REJOUABILITE_PACTE_ESCALADE] — pactStreak compte les
         pactes remplis D'AFFILÉE (pris ET terminés par KO/TKO). Remis à 0 dès
         qu'un combat se joue SANS pacte pris, ou dès qu'un pacte pris échoue
         — la stack n'existe que pour une prise de risque répétée et continue,
         pas pour un pacte isolé au milieu de la run. Lu par generateArcadeUpgrades
         (ui-03) pour hausser encore le plancher de rareté au-delà du simple
         pactBonus booléen d'origine. ==== */
      const pactFulfilled=pactWasActive && win && !pactFail;
      G.arcade.pactStreak=pactFulfilled?((G.arcade.pactStreak||0)+1):0;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: REJOUABILITE_ATTRITION] — G.f.form remontait à +20 fixe
         après CHAQUE victoire quel que soit le nombre de combats déjà encaissés
         dans la run (0 fatigue cumulative sur un format censé être une
         épreuve d'endurance). La récup diminue avec la profondeur de la run —
         le dernier combat d'un Gauntlet doit se jouer sur un combattant usé.
         RI(−1,1) évite un palier trop lisible/mécanique. ==== */
      /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — attritionHeal() faisait
         remonter G.f.form d'un montant décroissant avec la profondeur de la
         run. La forme n'ayant plus aucun effet mécanique en Gauntlet (cf.
         eff(), engine.js) ni aucun affichage, la fonction devient un no-op :
         la profondeur de la run se paie désormais uniquement en séquelles
         d'attributs, dont la probabilité est déjà indexée sur les dégâts
         réellement encaissés (rollGauntletInjuryChance, ui-03). ==== */
      const attritionHeal=()=>{};
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: GAUNTLET_MISE_EN_JEU] — consommée à chaque combat, comme le
         pacte de finition juste au-dessus, qu'elle se déclenche ou non. Une
         victoire sous mise double le multiplicateur de la run (plafond ×8) ; une
         élimination sous mise annule TOUT le paiement (cf.
         gauntletEliminationPayout(...,atRisk)). Les deux clauses sont
         cumulables volontairement : pacte + mise sur le même combat est le
         pic de tension du mode. ==== */
      const atRiskWasActive=!!G.arcade.atRisk; G.arcade.atRisk=false;
      if(atRiskWasActive && win) G.arcade.riskMult=Math.min(8,(G.arcade.riskMult||1)*2);
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: GAUNTLET_PRIME_VENGEANCE] — battre un némésis le retire de
         meta.gauntletRivals et verse la prime immédiatement (hors barème de
         palier) : le dossier est clos, elle ne peut plus repayer. ==== */
      if(win && G.arcade.opponent && G.arcade.opponent._isRival){
        const _b=claimGauntletBounty(G.arcade.opponent);
        if(_b>0){ G.arcade.lastBounty=_b; G.arcade.bounties=(G.arcade.bounties||0)+1; }
      } else { G.arcade.lastBounty=0; }
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: GAUNTLET_CONTRAT_RUN] — drapeaux de run lus par les
         contrats ct_nopact et ct_intact. Posés ici, jamais remis à zéro :
         un contrat de type « ne jamais » se casse définitivement. ==== */
      if(pactWasActive) G.arcade.pactTakenEver=true;
      G.arcade.maxPactStreak=Math.max(G.arcade.maxPactStreak||0,G.arcade.pactStreak||0);
      /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — remplace `if(G.f.form<60)
         G.arcade.formBroken=true`. Drapeau « ne jamais » du même type, posé une
         fois pour toutes : une séquelle soignée plus tard au camp ne rouvre pas
         le contrat Corps intact. ==== */
      if((G.arcade.runInjuries||[]).length) G.arcade.injuredEver=true;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: GAUNTLET_BLESSURE_RUN] — remplace les 3 appels à
         attritionHeal() : la forme remonte comme avant, mais un combat
         réellement encaissé (frappes significatives subies / knockdowns, lus
         sur res.stats.B) peut laisser une séquelle d'attributs pour le reste
         de la run. C'est le coût invisible de l'attrition rendu mécanique, et
         l'argument principal en faveur de l'encaissement volontaire. ==== */
      const runAttrition=()=>{
        attritionHeal();
        if(_res && rnd()<rollGauntletInjuryChance(_res)){
          const inj=rollGauntletRunInjury(G.f);
          G.arcade.runInjuries=(G.arcade.runInjuries||[]).concat([inj]);
          G.arcade.lastInjury=inj;
        } else { G.arcade.lastInjury=null; }
      };
      /* ==== [FIN ANCRE] ==== */
      if(G.arcade.mode==='boss_run'){
        /* ==== [ANCRE: ITEM_PACTE_AVEC_SOUMISSIONS] — même élargissement que le
           pacte de finition (Bracket 64/Ladder 100, ci-dessus) appliqué à la
           clause permanente du Boss Run. Seule une victoire aux points
           (method vide) invalide désormais le combat. ==== */
        const koOnlyFail=G.arcade.condition==='ko_only' && win && G.pending.method && !(G.pending.method.startsWith('KO')||G.pending.method==='Soumission');
        // ==== [ANCRE: CORRECTIF_BOSSRUN_RAISON_ELIMINATION] — bug remonté : une
        // victoire par décision/soumission en Boss Run (mode KO uniquement)
        // était traitée comme une élimination SANS AUCUNE explication — l'écran
        // affichait juste "R.I.P." comme après une vraie défaite, alors que le
        // combat venait d'être gagné. On mémorise désormais la vraie raison
        // pour que scr_gameover puisse distinguer les deux cas.
        if(!win || koOnlyFail){
          /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts,
             12/08/2026) : "Filet de sécurité", 1er combat de la run
             uniquement (streak===0 avant incrément), une seule fois. Ne se
             déclenche PAS sur koOnlyFail (victoire aux points en Boss Run) :
             le combattant n'a pas vraiment perdu, rien à "sauver". ==== */
          if(!win && G.arcade.streak===0 && G.arcade.consumableSafetynet){
            G.arcade.consumableSafetynet=false;
            G.arcade.opponent=genBossOpponent(0);
            G.arcade.revealed=false; G.arcade.bossMalus=null;
            G.lastMsg='Filet de sécurité : le combat n\u2019a jamais eu lieu. Un nouvel adversaire t\u2019attend.';
            save(); render(); return;
          }
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: REJOUABILITE_NEMESIS_MULTI] — le vrai bourreau, pas le
             champion : n'enregistre comme rival QUE sur une vraie défaite
             (pas koOnlyFail, où l'adversaire n'a rien fait — c'est le pacte KO
             du Boss Run lui-même qui invalide la victoire). ==== */
          /* ==== [ANCRE: GAUNTLET_PRIME_VENGEANCE] — killedAt (4e argument) : le
             palier auquel ce némésis vous a tué, base de sa prime future. ==== */
          if(!win){ const meta=loadMetaStats(); recordGauntletRival(meta,G.arcade.opponent,'boss_run',G.arcade.streak); saveMetaStats(meta); }
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: GAUNTLET_FIN_DE_RUN] — paiement, record et succès
             centralisés (cf. finaliseGauntletRun). ==== */
          finaliseGauntletRun(G.arcade,{kind:'elimination',progress:G.arcade.streak,atRisk:atRiskWasActive});
          /* ==== [FIN ANCRE] ==== */
          G.arcade.eliminatedReason=koOnlyFail?'no_ko':'loss'; G.screen='gameover'; save(); render(); return; }
        G.arcade.streak++;
        if(G.arcade.streak>=G.arcade.target){
          finaliseGauntletRun(G.arcade,{kind:'victory',progress:5});
          G.arcade.victory=true; G.screen='gameover'; save(); render(); return; }
        runAttrition();
        /* ==== [ANCRE: REJOUABILITE_BANQUE_BOSSRUN] — champ `banked` (posé à 0
           dans startBossRun(), ui-03) n'était jusqu'ici jamais réécrit : mort.
           Reflète désormais le montant RÉELLEMENT versé si le joueur encaisse
           maintenant (même table que gauntletPayout), affiché en cagnotte
           visible au hub (ui-04) pour matérialiser ce qui est mis en jeu à
           chaque KO suivant. ==== */
        G.arcade.banked=gauntletFinalPayout(G.arcade,gauntletPayout('boss_run',G.arcade.streak));
        /* ==== [FIN ANCRE] ==== */
        G.arcade.opponent=genBossOpponent(G.arcade.streak);
        /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 : nouveau boss
           généré pour le combat suivant -> re-masqué jusqu'au prochain
           reveal. S'applique donc aux 5 combats, pas seulement au premier. ==== */
        G.arcade.revealed=false; G.arcade.bossMalus=null;
        /* ==== [FIN ANCRE] ==== */
        /* ==== [ANCRE: REJOUABILITE_CAMP_BOSSRUN] — camp allégé (1 compétence,
           cf. ui-03) entre chaque KO, absent jusqu'ici du seul format qui n'a
           aucun répit entre les combats. ==== */
        generateBossRunUpgrade(G.arcade.streak);
        G.screen='arcade_upgrades'; save(); render(); return;
        /* ==== [FIN ANCRE] ==== */
      }
      if(G.arcade.mode==='ladder_100'){
        if(!win || pactFail || judgesFail){
          /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 : 1er combat
             de la run = fightsDone encore à 0 (pas incrémenté sur défaite). ==== */
          if(!win && (G.arcade.fightsDone||0)===0 && G.arcade.consumableSafetynet){
            G.arcade.consumableSafetynet=false;
            G.arcade.targets=genWTUMMATargets();
            G.lastMsg='Filet de sécurité : le combat n\u2019a jamais eu lieu. De nouvelles cibles te sont proposées.';
            save(); render(); return;
          }
          /* ==== [FIN ANCRE] ==== */
          if(!win){ const meta=loadMetaStats(); recordGauntletRival(meta,G.arcade.opponent,'ladder_100',G.arcade.rank); saveMetaStats(meta); }
          finaliseGauntletRun(G.arcade,{kind:'elimination',progress:G.arcade.rank,atRisk:atRiskWasActive});
          G.arcade.eliminatedReason=pactFail?'pact':judgesFail?'judges':'loss'; G.screen='gameover'; save(); render(); return;
        }
        G.arcade.fightsDone=(G.arcade.fightsDone||0)+1;
        /* ==== [ANCRE: GAUNTLET_BANQUE_TOUS_FORMATS] — G.arcade.banked n'était
           écrit QUE dans la branche boss_run : les deux autres formats
           affichaient une cagnotte inexistante. Écrit ici et dans la branche
           Bracket ci-dessous, avec la même table centralisée. ==== */
        // ==== [ANCRE: CORRECTIF_LADDER_RANG] — bug trouvé : seul G.arcade.rank
        // (le rang du joueur) était mis à jour ; le PNJ vaincu gardait son
        // ancien ladderRank, désormais "occupé" par le joueur. Un futur
        // matchmaking recherchant ce rang exact (genWTUMMAOpponent) pouvait
        // retomber sur ce même PNJ déjà battu. Échange explicite des rangs.
        const oldRank=G.arcade.rank;
        G.arcade.rank=G.arcade.opponent.ladderRank; // le joueur prend la place du vaincu
        G.arcade.opponent.ladderRank=oldRank;
        G.arcade.banked=gauntletFinalPayout(G.arcade,gauntletPayout('ladder_100',G.arcade.rank));
        if(G.arcade.rank===1){
          finaliseGauntletRun(G.arcade,{kind:'victory',progress:1});
          G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
        }
        runAttrition();
        if(G.arcade.aggroCooldown>0) G.arcade.aggroCooldown--;
        generateArcadeUpgrades(G.arcade.pactStreak);
        G.screen='arcade_upgrades'; save(); render(); return;
      }
      // ==== Bracket 64 (WTUMMA) ====
      if(!win || pactFail || judgesFail){
        /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 : 1er combat de
           la run = roundStep encore à 1 (1er tour du tableau). ==== */
        if(!win && G.arcade.tournament && G.arcade.tournament.roundStep===1 && G.arcade.consumableSafetynet){
          G.arcade.consumableSafetynet=false;
          G.arcade.tournament=buildWTUMMABracket(G.f);
          const rematch=G.arcade.tournament.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
          G.arcade.opponent=rematch.a.id===G.f.id?rematch.b:rematch.a;
          G.lastMsg='Filet de sécurité : le combat n\u2019a jamais eu lieu. Un nouveau tableau t\u2019attend.';
          save(); render(); return;
        }
        /* ==== [FIN ANCRE] ==== */
        if(!win){ const meta=loadMetaStats(); recordGauntletRival(meta,G.arcade.opponent,'bracket64',G.arcade.tournament.roundStep); saveMetaStats(meta); }
        finaliseGauntletRun(G.arcade,{kind:'elimination',progress:G.arcade.tournament.roundStep,atRisk:atRiskWasActive});
        G.arcade.eliminatedReason=pactFail?'pact':judgesFail?'judges':'loss'; G.screen='gameover'; save(); render(); return;
      }
      const wonTournament=advanceWTUMMABracket();
      /* ==== [ANCRE: GAUNTLET_BANQUE_TOUS_FORMATS] ==== */
      if(G.arcade.tournament) G.arcade.banked=gauntletFinalPayout(G.arcade,gauntletPayout('bracket64',G.arcade.tournament.roundStep));
      if(wonTournament){
        finaliseGauntletRun(G.arcade,{kind:'victory',progress:7});
        G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
      }
      runAttrition();
      generateArcadeUpgrades(G.arcade.pactStreak);
      G.screen='arcade_upgrades'; save(); render(); return;
    }
    routeAfterCareerPending();
    save(); render(); },
  /* ==== [ANCRE: REJOUABILITE_SEED_GAUNTLET] — setSeed() (engine.js) existait
     mais n'était appelée nulle part dans toute la codebase. Chaque run tire
     désormais une graine affichée à l'écran : reproductible si le joueur la
     saisit à nouveau (comparaison de runs, défis entre joueurs, farming
     volontaire d'un pool favorable), sinon aléatoire par défaut. La graine
     saisie via CL.setGauntletSeed() (G._pendingSeed) n'est consommée qu'une
     fois puis effacée, pour ne pas figer TOUS les runs suivants par erreur. ==== */
  setGauntletSeed(v){ G._pendingSeed=(v!==undefined&&v!==null&&String(v).trim()!=='')?String(v).trim():null; render(true); },
  /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026).
     _draftSuffix vit sur f.signatureMove lui-même (pas sur G, comme
     G._pendingSeed) : la fiche peut être quittée et rouverte sans perdre la
     saisie en cours, tant qu'elle n'a pas été validée. render(true) même
     pattern que setGauntletSeed : préserve le scroll à chaque frappe. ==== */
  setSignatureSuffix(v){ const sm=G.f&&G.f.signatureMove; if(!sm||sm.locked) return;
    sm._draftSuffix=(v!==undefined&&v!==null)?String(v).slice(0,24):''; render(true); },
  lockSignatureSuffix(){ const sm=G.f&&G.f.signatureMove; if(!sm||sm.locked) return;
    const val=(sm._draftSuffix||'').trim(); if(!val) return;
    sm.customSuffix=val; sm.locked=true; delete sm._draftSuffix; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  _rollGauntletSeed(){ const s=G._pendingSeed; G._pendingSeed=null;
    const numeric=s&&/^[0-9]+$/.test(s)?parseInt(s,10):(s?[...s].reduce((h,c)=>((h*31+c.charCodeAt(0))>>>0),0):((Date.now()^0x9e3779b9)>>>0));
    setSeed(numeric); return numeric; },
  /* ==== [ANCRE: GAUNTLET_ASCENSION] — palier choisi au menu (ui-06), borné au
     palier réellement débloqué pour ce format : on ne peut jamais lancer un
     palier supérieur à celui gagné, même en forçant l'état. Consommé une
     seule fois au lancement puis figé sur G.arcade.asc pour toute la durée
     de la run (les courbes de difficulté et les payouts le relisent là). ==== */
  setGauntletAsc(mode,v){ const meta=loadMetaStats();
    G._pendingAsc=clamp(parseInt(v,10)||0,0,gauntletAscLevel(meta,mode)); render(true); },
  _rollGauntletAsc(mode){ const meta=loadMetaStats();
    const asc=clamp(parseInt(G._pendingAsc,10)||0,0,gauntletAscLevel(meta,mode));
    return asc; },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_DAILY] — pré-remplit la graine du jour puis lance le
     format demandé par le flux NORMAL (les start* ci-dessous), sans dupliquer
     leur logique. dailyMode marque la run pour que la tentative soit
     consommée en fin de run (cf. finaliseGauntletRun). ==== */
  startGauntletDaily(mode){
    const meta=loadMetaStats();
    if(gauntletDailyDone(meta,mode)){ G.lastMsg='Tentative du jour déjà utilisée sur ce format. Revenez demain.'; render(); return; }
    G._pendingSeed=gauntletDailyKey();
    G._dailyPending=mode;
    if(mode==='ladder_100') CL.startLadder100();
    else if(mode==='boss_run') CL.startBossRun();
    else CL.startArcade();
  },
  /* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
     rachat de série depuis le menu Gauntlet (scr_gauntlet_menu, ui-06),
     visible uniquement si meta.gauntletDailyRescueOffer est posé (jour
     manqué détecté par gauntletDailyObjective au dernier changement de
     date). ==== */
  buybackGauntletDailyStreak(){
    const meta=loadMetaStats();
    const r=buybackGauntletDailyStreak(meta);
    G.lastMsg=r.msg; saveMetaStats(meta); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  startArcade(){ injectExtendedArchetypes(); const asc=CL._rollGauntletAsc('bracket64'); const seed=CL._rollGauntletSeed();
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts, 12/08/2026). ==== */
    const mutator=rollGauntletMutator(asc);
    G.arcade={active:true,streak:0,target:5,pool:buildArcadePool(),mode:'bracket64',seed,asc,
      riskMult:1,maxPactStreak:0,contract:drawGauntletContract(asc,mutator&&mutator.id),daily:G._dailyPending==='bracket64',mutator};
    /* ==== [FIN ANCRE] ==== */
    G._dailyPending=null; G.screen='draft'; save(); render(); },
  startBossRun(){ const asc=CL._rollGauntletAsc('boss_run'); const seed=CL._rollGauntletSeed();
    const wasDaily=G._dailyPending==='boss_run'; G._dailyPending=null;
    startBossRun(seed,asc); G.arcade.daily=wasDaily; render(true); },
  /* ==== [ANCRE: GAUNTLET_CAPSTONE_NEMESIS] — variante Boss Run débloquée
     depuis scr_gauntlet_menu (ui-06) une fois 5 rivaux historiques battus.
     Pas de défi du jour sur cette entrée (G._dailyPending non consommé ici,
     symétrique avec le fait que boss_capstone n'a pas d'entrée dans
     gauntletDailyTag). ==== */
  startBossRunCapstone(){ const asc=CL._rollGauntletAsc('boss_run'); const seed=CL._rollGauntletSeed();
    startBossRun(seed,asc,true); render(true); },
  /* ==== [FIN ANCRE] ==== */
  startLadder100(){ injectExtendedArchetypes(); const asc=CL._rollGauntletAsc('ladder_100'); const seed=CL._rollGauntletSeed();
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts, 12/08/2026). ==== */
    const mutator=rollGauntletMutator(asc);
    G.arcade={active:true,mode:'ladder_100',rank:100,victory:false,fightsDone:0,pool:buildArcadePool(),seed,asc,
      riskMult:1,maxPactStreak:0,contract:drawGauntletContract(asc,mutator&&mutator.id),daily:G._dailyPending==='ladder_100',mutator};
    /* ==== [FIN ANCRE] ==== */
    G._dailyPending=null; G.screen='draft'; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  startFaith(){ G.faithDraft={origin:'',style:'',lifestyle:'',circle:'',personality:'',first:'',country:COUNTRY_KEYS[0]}; G.screen='faith_draft'; save(); render(); },
  faithDraftIn(k,v){ G.faithDraft[k]=v; },
  selectFaithDraft(key,value){ G.faithDraft[key]=value; render(true); },
  finalizeFaithDraft(){
    const d=G.faithDraft;
    if(!d.origin || !d.style || !d.lifestyle || !d.circle || !d.personality){
      G.lastMsg="Complète les 5 catégories avant de commencer."; render(); return;
    }
    const f=makeFighter({gender:d.gender||'H',style:d.style,countryKey:d.country||COUNTRY_KEYS[0],first:(d.first||'').trim()||undefined,age:18,freshPlayer:true});
    f.gameMode='faith';
    if(d.origin==='traditional'){ f.attrs.fightIQ+=8; f.attrs.discipline+=8; }
    if(d.origin==='pro_child'){ f.earnings=50; f.attrs.composure-=10; f.hypeBonus=1.5; }
    if(d.origin==='street'){ f.attrs.chin+=10; f.attrs.heart+=10; f.attrs.fightIQ-=5; }
    if(d.origin==='late_bloomer'){ f.attrs.power+=12; f.attrs.takedown-=10; f.attrs.submission-=10; }
    if(d.lifestyle==='pro'){ f.attrs.cardio+=10; f.form=100; }
    if(d.lifestyle==='party'){ f.form=60; f.morale=90; f.hypeBonus=(f.hypeBonus||1)+0.3; }
    if(d.circle==='family'){ f.morale=100; }
    if(d.circle==='agent'){ f.earnings=(f.earnings||0)+30; f.agentCut=0.15; }
    f.personality=d.personality;
    if(d.personality==='villain'){ f.hypeBonus=(f.hypeBonus||1)+0.3; f.morale=clamp(f.morale-10,0,100); }
    else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    for(const k in f.attrs) f.attrs[k]=clamp(f.attrs[k],1,100);
    f.overall=overall(f);
    f.maxAttrs={};
    for(const k of ATTR_KEYS){
      let margin=RI(8,28);
      if(d.origin==='late_bloomer' && ['power','strength'].includes(k)) margin+=10;
      f.maxAttrs[k]=Math.max(45,clamp(f.attrs[k]+margin,1,100));
    }
    G.titleHistory=[];
    G.f=f; G.roster=makeOrgRoster(f);
    // division/genre, qui progresseront en copiant les stats du joueur s'il
    // s'entraîne avec eux (voir CL.faithSparring).
    const p1=makeFighter({gender:f.gender,div:f.div,age:18,level:clamp(f.overall-15,20,60),potential:95});
    const p2=makeFighter({gender:f.gender,div:f.div,age:21,level:clamp(f.overall-10,20,60),potential:85});
    p1.isGymPartner=true; p2.isGymPartner=true;
    p1.nick='Le Prodige'; p2.nick='L\u2019Aspirant';
    G.faith={year:2026,step:1,fightsThisYear:0,trainingsThisYear:0,trainingTags:[],startOfYearElo:f.careerElo,startOfYearEarnings:f.earnings||0,gym:[p1,p2]};
    G.season={year:1,fights:[]};
    G.screen='faith_hub'; save(); render();
  },
  faithRest(){
    G.f.form=clamp(G.f.form+25,0,100); G.f.morale=clamp(G.f.morale+10,0,100);
    G.faith.step=3; G.screen='faith_hub'; save(); render();
  },
  faithSparring(partnerId){
    const partner=(G.faith.gym||[]).find(p=>p.id===partnerId); if(!partner) return;
    G.f.form=clamp(G.f.form+15,0,100);
    applyDeltas(G.f,[['fightIQ',1]]); // enseigner renforce l'intellect tactique
    // Syndrome de Frankenstein : le partenaire copie violemment les 2
    // meilleures stats du joueur — c'est lui qui, des années plus tard,
    // reviendra armé de vos propres armes.
    const bestStats=ATTR_KEYS.map(k=>({k,v:G.f.attrs[k]})).sort((a,b)=>b.v-a.v).slice(0,2);
    applyDeltas(partner,[[bestStats[0].k,3],[bestStats[1].k,3],['adaptability',2],['fightIQ',2]]);
    partner.overall=overall(partner);
    G.lastMsg=`Séance intense. ${esc(partner.first)} a parfaitement mimé votre ${attrLabel(bestStats[0].k)}. Il progresse à une vitesse terrifiante.`;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Sparring',choice:`A tourné avec ${esc(partner.name)}`});
    G.faith.step=3; save(); render();
  },
  faithLifeEvent(){
    // Syndrome de Frankenstein : si un protégé a rattrapé (ou dépassé) le
    // joueur, il quitte la salle — court-circuite le pool normal d'événements
    // pour ce tour, ce moment doit être vécu, pas noyé dans la pioche.
    if(G.faith.gym){
      const monster=G.faith.gym.find(p=>p.overall>=G.f.overall-2 && p.overall>45);
      if(monster){
        G.faith.currentEvent={
          id:'evt_frankenstein_betrayal', monsterId:monster.id, title:'Le monstre s\u2019échappe',
          text:`Votre protégé, ${esc(monster.name)}, vient de vider son casier. "Je connais ton jeu par cœur, tu n\u2019as plus rien à m\u2019apprendre", lâche-t-il devant la salle. Il a signé un contrat dans votre ligue et promet de prendre votre place.`,
          choices:[
            {label:'Le laisser partir et préparer la guerre',d:[['aggression',8],['morale',-15],['focus',10]]},
            {label:'Le provoquer publiquement',d:[['composure',-10],['confidence',5],['morale',-10]]}
          ]
        };
        G.screen='faith_event'; save(); render();
        return;
      }
    }
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    let pool=FAITH_LIFE_EVENTS.filter(e=>!G.faith.seenEvents.includes(e.id) && (!e.req||e.req(G.f)));
    if(pool.length===0){ G.faith.seenEvents=[]; pool=FAITH_LIFE_EVENTS.filter(e=>!e.req||e.req(G.f)); }
    G.faith.currentEvent=pick(pool);
    G.screen='faith_event'; save(); render();
  },
  chooseFaithEvent(i){
    const ev=G.faith.currentEvent; if(!ev) return;
    const c=ev.choices[i]; if(!c) return;
    if(c.cost && (G.f.earnings||0)<c.cost){ G.lastMsg="Fonds insuffisants ("+c.cost+"k$)."; render(); return; }
    if(c.cost) G.f.earnings-=c.cost;
    if(c.reward) G.f.earnings=(G.f.earnings||0)+c.reward;
    applyDeltas(G.f,c.d);
    // Syndrome de Frankenstein : le protégé qui trahit rejoint réellement le
    // roster de l'organisation, en Némésis si aucune n'est encore verrouillée.
    if(ev.id==='evt_frankenstein_betrayal'){
      const monster=(G.faith.gym||[]).find(p=>p.id===ev.monsterId);
      if(monster){
        monster.org=G.f.org; monster.stage='pro';
        monster.W=Math.max(0,G.f.W-2); monster.L=1;
        monster.orgWins=0;
        monster.orgElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+150);
        monster.careerElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+100);
        G.roster.push(monster);
        if(!G.f.faithNemesisId) G.f.faithNemesisId=monster.id;
        G.f.rivalId=monster.id;
        if(!G.f._rivalries) G.f._rivalries={};
        G.f._rivalries[monster.id]=3;
        G.faith.gym=G.faith.gym.filter(p=>p.id!==monster.id);
        G.roster=rankPool(G.roster);
      }
    }
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    G.faith.seenEvents.push(ev.id);
    G.faith.currentEvent=null;
    G.lastMsg="Événement résolu : "+ev.title;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:ev.title,choice:c.label});
    // Moteur d'émergence : un choix taggé traitTag renforce une tendance cachée ;
    // au 3e choix dans la même direction, elle se cristallise en trait permanent.
    if(c.traitTag){
      if(!G.f.hiddenTraits) G.f.hiddenTraits={};
      if(!G.f.faithTraits) G.f.faithTraits=[];
      G.f.hiddenTraits[c.traitTag]=(G.f.hiddenTraits[c.traitTag]||0)+1;
      const TRAIT_NAMES={rebel:'Tête Brûlée',ascetic:'Ascète',showman:'Showman'};
      const traitName=TRAIT_NAMES[c.traitTag];
      if(traitName && G.f.hiddenTraits[c.traitTag]>=3 && !G.f.faithTraits.includes(traitName)){
        G.f.faithTraits.push(traitName);
        G.lastMsg=`Événement résolu : ${ev.title}. NOUVEAU TRAIT ACQUIS : ${traitName} !`;
      }
    }
    G.faith.step=2; G.screen='faith_hub'; save(); render();
  },
  faithFight(){
    G.faith.fightsThisYear=(G.faith.fightsThisYear||0)+1;
    G.faith.step=4; // combat en cours — le retour se fera vers le bilan (voir afterResult)
    startFightSelect();
  },
  prepareFaithYearEnd(){
    const f=G.f;
    const dmgHead=(G.season.fights||[]).reduce((acc,fight)=>acc+((fight.st&&fight.st.Me&&fight.st.Me.dmgHead)||0),0);
    const eloDelta=Math.round(f.careerElo-(G.faith.startOfYearElo||f.careerElo));
    const earningsDelta=(f.earnings||0)-(G.faith.startOfYearEarnings||0);
    const rank=divRank(f);
    if((G.season.fights||[]).length>=1){
      let totalSig=0, totalTdAtt=0, totalCtrl=0, totalKD=0;
      G.season.fights.forEach(fight=>{ totalSig+=(fight.st&&fight.st.Me&&fight.st.Me.sig)||0; totalTdAtt+=(fight.st&&fight.st.Me&&fight.st.Me.tdAtt)||0; totalCtrl+=(fight.st&&fight.st.Me&&fight.st.Me.ctrl)||0; totalKD+=(fight.st&&fight.st.Me&&fight.st.Me.kd)||0; });
      const totalRounds=G.season.fights.reduce((acc,fight)=>acc+(fight.round||3),0);
      if(!f.faithSpecs) f.faithSpecs=[];
      if(!f._styleProfileOverride) f._styleProfileOverride=Object.assign({},STYLE_PROFILE[f.style]||STYLE_PROFILE.mma);
      if(!f.faithSpecs.includes('Striker Pur') && (totalSig/(totalSig+totalTdAtt*10+1))>0.85){
        f.faithSpecs.push('Striker Pur'); f._styleProfileOverride.sigVol+=0.15; f._styleProfileOverride.koMod+=0.10;
        G.lastMsg="Nouvelle Spécialisation : Striker Pur (+15% Vol, +10% KO)";
      } else if(!f.faithSpecs.includes('Boa Constrictor') && totalCtrl>totalRounds*0.60){
        f.faithSpecs.push('Boa Constrictor'); f._styleProfileOverride.subMod+=0.20; f._styleProfileOverride.gnpDmg+=0.15;
        G.lastMsg="Nouvelle Spécialisation : Boa Constrictor (+20% Sub, +15% GNP)";
      } else if(!f.faithSpecs.includes('Tueur à Gages') && totalKD>=4){
        f.faithSpecs.push('Tueur à Gages'); f._styleProfileOverride.koMod+=0.25;
        G.lastMsg="Nouvelle Spécialisation : Tueur à Gages (+25% KO)";
      }
    }
    // Tirage de compétence : 1 roll garanti si un événement de vie a été résolu
    // cette année (toujours vrai en pratique, Phase 1 en impose un). Corrige un
    // bug trouvé en vérifiant : l'ancienne condition (trainingsThisYear>=1)
    // dépendait d'un compteur mort depuis le remplacement de l'entraînement par
    // les événements de vie — plus aucune compétence ne pouvait plus se
    // débloquer en Faith.
    const nbRolls=((G.faith.yearLog||[]).length>=1)?1:0;
    const newSkills=[];
    let pool=poolEligible(f,f.age>=34,f.skills.length>=SKILL_CONSTANTS.MAX_CAREER_SKILLS);
    const tags=G.faith.trainingTags||[];
    for(let i=0;i<nbRolls;i++){
      if(pool.length===0) break;
      let currentPool=pool;
      if(tags.length>0 && rnd()<0.5){ const filtered=pool.filter(s=>s.fam==='style'&&s.key && tags.includes(s.key)); if(filtered.length>0) currentPool=filtered; }
      const rar=tirerRarete(); const sk=getFallbackSkill(currentPool,rar);
      if(sk){ grantSkill(f,sk); newSkills.push(sk); pool=poolEligible(f,f.age>=34,f.skills.length>=SKILL_CONSTANTS.MAX_CAREER_SKILLS); }
    }
    G.faith.yearStats={
      fights:G.faith.fightsThisYear,
      wins:(G.season.fights||[]).filter(x=>x.win).length,
      losses:(G.season.fights||[]).filter(x=>!x.win).length,
      eloDelta, earningsDelta, rank, dmgHead, newSkills, yearLog:G.faith.yearLog||[]
    };
    G.screen='faith_year_end'; save(); render();
  },
  nextFaithYear(){
    G.faith.year++; G.faith.step=1;
    G.faith.fightsThisYear=0; G.faith.trainingsThisYear=0; G.faith.trainingTags=[]; G.faith.yearLog=[];
    G.faith.startOfYearElo=G.f.careerElo; G.faith.startOfYearEarnings=G.f.earnings||0;
    G.season.fights=[];
    if(G.faith.pedActive!==G.faith.year) applyAging(G.f);
    advanceRoster();
    if(G.faith.gym){
      G.faith.gym.forEach(p=>{
        p.age++;
        applyDeltas(p,[['strength',1],['fightIQ',1],['cardio',1],['durability',1]]);
        p.overall=overall(p);
      });
    }
    G.screen='faith_hub'; save(); render();
  },
  buyFaithPerk(perkId){
    const f=G.f; if(!G.faith.perks) G.faith.perks={};
    const costMoney={hometown:15,catchweight:35,protect_title:50,ped:30,tiger:50,lobbying:100,diet:40};
    if(costMoney[perkId]||perkId==='judges'){
      let actualCost=costMoney[perkId];
      if(perkId==='judges') actualCost=(f.earnings||0)*0.20;
      if((f.earnings||0)<actualCost){ G.lastMsg="Fonds insuffisants."; render(); return; }
      f.earnings-=actualCost;
      if(perkId==='hometown'){ G.faith.perks.hometown=true; G.lastMsg="Privilège acquis : Votre prochain combat sera à domicile."; }
      else if(perkId==='catchweight'){ G.faith.perks.catchweight=true; G.lastMsg="Privilège acquis : Le prochain adversaire subira un lourd malus de déshydratation."; }
      else if(perkId==='protect_title'){ G.f.champChampInactivity=0; G.lastMsg="Privilège acquis : L\u2019inactivité est réinitialisée. Ceinture sanctuarisée."; }
      else if(perkId==='ped'){
        if(rnd()<0.15){ G.lastMsg="CATASTROPHE : Test antidopage positif ! Suspendu 1 an."; G.faith.month=1; G.faith.year++; G.faith.pa=3; f.rankBoost=Math.max(0,(f.rankBoost||0)-100); }
        else { f.attrs.chin=clamp(f.attrs.chin+4,1,100); f.attrs.durability=clamp(f.attrs.durability+4,1,100); f.overall=overall(f); G.faith.pedActive=G.faith.year; G.lastMsg="Protocoles PED réussis : Menton et Résistance +4."; }
      } else if(perkId==='tiger'){
        if(rnd()<0.25){ G.lastMsg="Le stage était d\u2019une rare violence. Blessure mineure contractée."; f.form=clamp(f.form-20,0,100); }
        else { f.attrs.kick=clamp(f.attrs.kick+5,1,100); f.attrs.clinchStr=clamp(f.attrs.clinchStr+5,1,100); f.overall=overall(f); G.lastMsg="Stage Tiger Muay Thai validé : Kick et Clinch +5 (hors-plafond)."; }
      } else if(perkId==='lobbying'){
        if(rnd()<0.50){ G.lastMsg="L\u2019argent a disparu dans les poches des promoteurs. Aucun effet."; }
        else { G.faith.perks.forcePromo=true; G.lastMsg="Lobbying réussi : Une offre de promotion sera forcée après votre prochain combat."; }
      } else if(perkId==='judges'){
        if(rnd()<0.10){ G.lastMsg="SCANDALE : Corruption découverte. L\u2019organisation coupe votre contrat !"; if(f.org>1) f.org--; G.roster=makeOrgRoster(f); }
        else { G.faith.perks.judges=true; G.lastMsg="Les juges ont été 'informés'. Vous bénéficierez d\u2019une grande clémence en cas de décision."; }
      } else if(perkId==='diet'){ G.faith.dietYear=G.faith.year; G.lastMsg="Diététicien Élite engagé pour l\u2019année. Les pesées seront une formalité."; }
    }
    save(); render();
  },
  /* ==== [ANCRE: APERCU_STATS_DRAFT] — item demandé : aperçu dépliable des
     stats complètes par profil, avant sélection définitive (scr_draft,
     ui-04). Un seul profil déplié à la fois (toggle simple, pas de Set). ==== */
  toggleDraftPreview(i){ G._draftPreview=G._draftPreview===i?null:i; render(); },
  /* ==== [FIN ANCRE] ==== */
  selectDraft(i){ G.f=G.arcade.pool[i];
    G._draftPreview=null;
    /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026) :
       point unique, commun aux 3 modes : G.f est déjà le combattant réel de
       la run (nécessaire pour un effet 'buff' sur G.f.attrs), et c'est
       AVANT toute génération d'adversaire ci-dessous, donc le flag 'veto'
       est prêt à être lu par les 3 branches qui suivent. ==== */
    applyPendingGauntletConsumable(G.arcade);
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
       12/08/2026) : effets de run posés une seule fois, avant tout combat.
       'mut_sans_filet' invalide le Filet de sécurité/Mise à l'abri même si
       achetés au Marché Noir AVANT que le mutateur ne soit connu (le joueur
       achète son consommable sans savoir quel mutateur sortira à la run
       suivante — cohérent avec "pas de réserve", l'achat reste consommé
       même s'il se retrouve neutralisé). 'mut_depart_affaibli' applique un
       malus permanent-pour-la-run sur G.f, mêmes conventions d'échelle que
       les consommables buff (state.js : ×5 pour passer de /20 à 1-100). ==== */
    const mutId=G.arcade.mutator&&G.arcade.mutator.id;
    if(mutId==='mut_sans_filet'){ G.arcade.consumableSafetynet=false; G.arcade.consumableAutobank=false; }
    if(mutId==='mut_depart_affaibli'){
      G.f.attrs.power=clamp((G.f.attrs.power||50)-10,1,100);
      G.f.attrs.cardio=clamp((G.f.attrs.cardio||50)-10,1,100);
    }
    /* ==== [FIN ANCRE] ==== */
    if(G.arcade.mode==='boss_run'){ G.arcade.opponent=genBossOpponent(0);
      /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — Droit de véto : un seul
         nouveau tirage, jamais en boucle (pas de "véto en cascade"). ==== */
      if(G.arcade.consumableVeto){ G.arcade.opponent=genBossOpponent(0); G.arcade.consumableVeto=false; }
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
         revealed=false tant que le joueur n'a pas franchi l'écran de reveal
         (scr_boss_reveal) — masque l'identité/stats au hub et au vestiaire
         tactique jusqu'à l'instant juste avant le combat. bossMalus tiré au
         moment du reveal (CL.chooseArcadePlan), pas ici : voir plus bas. ==== */
      G.arcade.revealed=false; G.arcade.bossMalus=null;
      /* ==== [FIN ANCRE] ==== */
      goArcadeHubOrIdentity(); save(); render(); return; }
    /* ==== [ANCRE: REJOUABILITE_LADDER_CIBLES] — G.arcade.targets (2-3 choix,
       cf. genWTUMMATargets ui-03) remplace l'opponent unique imposé. G.arcade.
       opponent reste undefined tant que CL.pickLadderTarget() n'a pas tranché. ==== */
    if(G.arcade.mode==='ladder_100'){ G.arcade.ladder=buildWTUMMALadder(G.f.div); G.arcade.targets=genWTUMMATargets();
      /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — véto en Ladder 100 : pas
         d'adversaire unique à ce stade (le joueur choisit sa cible), le
         véto reroll donc l'ensemble des cibles proposées. ==== */
      if(G.arcade.consumableVeto){ G.arcade.targets=genWTUMMATargets(); G.arcade.consumableVeto=false; }
      /* ==== [FIN ANCRE] ==== */
      goArcadeHubOrIdentity(); save(); render(); return; }
    /* ==== [FIN ANCRE] ==== */
    G.arcade.tournament=buildWTUMMABracket(G.f);
    const playerMatch=G.arcade.tournament.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
    G.arcade.opponent=playerMatch.a.id===G.f.id?playerMatch.b:playerMatch.a;
    /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — véto en Bracket 64 : le
       premier adversaire dépend du tirage complet du tableau ; reconstruire
       tout le tableau est le seul moyen fiable de changer le 1er adversaire
       sans casser la cohérence de l'arbre. ==== */
    if(G.arcade.consumableVeto){
      G.arcade.tournament=buildWTUMMABracket(G.f);
      const rematch=G.arcade.tournament.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
      G.arcade.opponent=rematch.a.id===G.f.id?rematch.b:rematch.a;
      G.arcade.consumableVeto=false;
    }
    /* ==== [FIN ANCRE] ==== */
    goArcadeHubOrIdentity(); save(); render(); },
  pickArcadeTrain(idx){ if(G.arcade.upgradesChosen.train) return; const _opt=G.arcade.trainOpts[idx]; applyDeltas(G.f,_opt.d);
    /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — la carte de soin doit aussi vider
       la liste des séquelles, sinon gauntletStatusBlock (ui-04) continuerait à
       les afficher en rouge alors que les attributs ont été rendus. ==== */
    if(_opt._heal){ G.arcade.runInjuries=[]; G.arcade.lastInjury=null; }
    G.arcade.upgradesChosen.train=true;
    if(G.arcade.mode==='ladder_100') G.arcade.targets=genWTUMMATargets();
    CL.go('arcadehub'); },
  /* ==== [ANCRE: REJOUABILITE_LADDER_CIBLES] — choix du joueur parmi les
     cibles proposées par le hub (ui-04). Route direct vers le plan tactique,
     comme le faisait auparavant le bouton unique "DÉFIER". ==== */
  pickLadderTarget(rank){
    if(!G.arcade||!G.arcade.targets) return;
    const t=G.arcade.targets.find(x=>x.ladderRank===rank); if(!t) return;
    /* ==== [ANCRE: GAUNTLET_CIBLE_PERISSABLE] — prendre une cible sûre ou
       médiane ferme la fenêtre agressive pour 2 paliers (décrémentée après
       chaque combat gagné, cf. afterResult). Prendre la cible agressive la
       laisse ouverte : la prudence a un coût d'opportunité, pas l'audace. ==== */
    const gap=G.arcade.rank-t.ladderRank;
    G.arcade.aggroCooldown=(gap>=18)?0:2;
    /* ==== [FIN ANCRE] ==== */
    G.arcade.opponent=t; G.arcade.targets=null;
    CL.fightArcade();
  },
  /* ==== [FIN ANCRE] ==== */
  pickArcadeSkill(idx){ if(G.arcade.upgradesChosen.skill) return; if(idx>=0) grantSkill(G.f,G.arcade.skillOpts[idx]); G.arcade.upgradesChosen.skill=true;
    /* ==== [ANCRE: REJOUABILITE_CAMP_BOSSRUN] — Boss Run n'a pas de phase
       entraînement (upgradesChosen.train posé à true d'emblée par
       generateBossRunUpgrade(), ui-03) : une fois la compétence choisie, la
       boucle est bouclée, direction le hub avec l'adversaire déjà généré. ==== */
    if(G.arcade.mode==='boss_run' && G.arcade.upgradesChosen.train){ CL.go('arcadehub'); return; }
    /* ==== [FIN ANCRE] ==== */
    render(); },
  retryArcade(){
    const prevMode=G.arcade&&G.arcade.mode;
    if(prevMode==='ladder_100') CL.startLadder100();
    else if(prevMode==='boss_run') CL.startBossRun();
    else CL.startArcade();
  },
  /* ==== [ANCRE: REJOUABILITE_SEED_REJOUABLE] — bouton "REJOUER CETTE GRAINE"
     (ui-04, scr_gameover) : capture G.arcade.seed AVANT que retryArcade()
     n'écrase G.arcade via les fonctions start*(), puis la repose dans
     G._pendingSeed pour que _rollGauntletSeed() (déjà seedable via saisie
     manuelle) la reconsomme comme si le joueur l'avait retapée. ==== */
  retrySameSeed(){
    const s=G.arcade&&G.arcade.seed;
    if(s!==undefined && s!==null) G._pendingSeed=String(s);
    CL.retryArcade();
  },
  /* ==== [FIN ANCRE] ==== */
  fightArcade(){ G.screen='arcade_plan'; save(); render(); },
  chooseArcadePlan(idx){
    /* ==== [ANCRE: ITEM_TACTIQUE_PAR_ARCHETYPE] — même ordre de composition
       QUE scr_arcade_plan (ui-04) : la tactique exclusive de l'archétype
       d'abord, sinon l'index cliqué ne correspondrait plus à la carte
       réellement affichée. ==== */
    const archTactic=ARCADE_EXCLUSIVE_TACTICS[G.f.nick];
    const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(G.f)).concat(TACTICS[G.f.style]||[]);
    const planObj=idx>=0?combined[idx]:null;
    G.arcade.plan=planObj?planObj.m:null; G.arcade.planLabel=planObj?planObj.lbl:null;
    /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
       en Boss Run, la tactique vient d'être verrouillée à l'aveugle
       (scr_arcade_plan, isBossBlind) — au lieu de résoudre le combat tout de
       suite, on bascule sur l'écran de reveal (scr_boss_reveal). Le malus
       est tiré ICI, une seule fois par combat, jamais recalculé au
       re-render de l'écran de reveal. Pool = tous les attributs existants
       (ALL_ATTR, engine.js) : le Gauntlet n'a pas de forme/moral (juste le
       flag interne formBroken), donc on retient des stats mécaniquement
       réelles plutôt que "forme/moral" au sens littéral du document source. ==== */
    if(G.arcade.mode==='boss_run' && !G.arcade.revealed){
      const pick_=ALL_ATTR[Math.floor(rnd()*ALL_ATTR.length)];
      G.arcade.bossMalus={key:pick_[0],label:pick_[1],amount:-RI(6,14)};
      G.screen='boss_reveal'; save(); render(); return;
    }
    /* ==== [FIN ANCRE] ==== */
    resolveArcadeFight();
  },
  /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 : confirme le reveal
     (plus de retour en arrière possible sur la tactique), marque revealed,
     puis résout le combat. Le malus lui-même est appliqué et restauré à
     l'intérieur de resolveArcadeFight (ui-03), au même endroit que le reste
     de la logique de combat, pour ne pas dupliquer la restauration ici. ==== */
  confirmBossReveal(){ if(!G.arcade||G.arcade.mode!=='boss_run') return;
    G.arcade.revealed=true; resolveArcadeFight(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: REJOUABILITE_PACTE_TOGGLE] — Bracket 64 / Ladder 100
     seulement (Boss Run a déjà sa clause KO-only permanente et pas d'écran
     de vestiaire entre les combats). ==== */
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : le pacte forcé n'est plus lié au palier d'Ascension
     (asc>=3) mais au mutateur tiré pour cette run. ==== */
  togglePact(){ if(!G.arcade||!G.arcade.active) return; if(G.arcade.mode==='boss_run') return; if(G.arcade.mutator&&G.arcade.mutator.id==='mut_pacte_force') return; G.arcade.pactActive=!G.arcade.pactActive; render(); },
  /* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — filtres de scr_archetype_pantheon
     (ui-06), même pattern que setGauntletAsc (mémorisé sur G, jamais
     persisté — un filtre d'affichage, pas une donnée de progression). ==== */
  setArchPantheonMode(mode){ G._archPantheonMode=mode; G._archPantheonAsc=0; render(); },
  setArchPantheonAsc(asc){ G._archPantheonAsc=asc; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: TOUR_ASCENSION_VISUELLE] — ajout #6 (24 ajouts, 12/08/2026). ==== */
  viewAscensionTower(mode){ G._towerMode=mode; CL.go('ascension_tower'); },
  setTowerMode(mode){ G._towerMode=mode; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: RELIQUES_SURVIE] — ajout #7 (24 ajouts, 12/08/2026). ==== */
  setGauntletProfile(relicId){ const meta=loadMetaStats(); const r=setGauntletProfileDisplay(meta,relicId); G.lastMsg=r.msg; saveMetaStats(meta); render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: INFIRMERIE_FORTUNE] — ajout #20 (24 ajouts, 12/08/2026). ==== */
  healGauntletZone(zone){
    if(!G.arcade||!G.arcade.active) return;
    const meta=loadMetaStats();
    const r=healGauntletZone(meta,G.arcade,zone);
    G.lastMsg=r.msg; if(r.success) saveMetaStats(meta); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: COACHING_OBLIGATOIRE] — toggleCoaching() retirée : le
     coaching Gauntlet n'est plus togglable (coachingToggleBlock, ui-04, est
     désormais un badge informatif non cliquable ; resolveArcadeFight(),
     ui-03, ne passe plus que par startCoachingFight()). Plus aucun appelant
     dans le codebase — retrait plutôt que méthode morte laissée en place,
     conformément à la convention CORRECTIF_CODE_MORT déjà utilisée ailleurs
     dans ce fichier. ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ITEM_TACTIQUE_PAR_ARCHETYPE] — même ordre de composition que
     scr_coaching_round (ui-04) et scr_arcade_plan : archétype exclusif
     d'abord, sinon l'index cliqué ne correspond plus à la carte affichée. ==== */
  pickCoachingTactic(idx){
    if(!G.arcade||!G.arcade.coaching) return;
    const archTactic=ARCADE_EXCLUSIVE_TACTICS[G.f.nick];
    const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(G.f)).concat(TACTICS[G.f.style]||[]);
    const planObj=idx>=0?combined[idx]:null;
    const plan=planObj?planObj.m:null;
    G.arcade.plan=plan; G.arcade.planLabel=planObj?planObj.lbl:null;
    runCoachingRound(plan);
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026). ==== */
  pickCampIdentity(idx){
    if(!G.arcade||G.arcade.campIdentity) return;
    const opts=G.arcade.campIdentityOptions||[]; const chosen=opts[idx]; if(!chosen) return;
    Object.entries(chosen.fx).forEach(([k,v])=>{ G.f.attrs[k]=clamp((G.f.attrs[k]||50)+v,1,100); });
    G.f.overall=overall(G.f);
    G.arcade.campIdentity=chosen; G.arcade.campIdentityOptions=null;
    G.screen='arcadehub'; save(); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: PREPARATION_CIBLEE] — ajout #23 (24 ajouts, 12/08/2026). ==== */
  pierceRumor(){ if(!G.arcade) return; const r=pierceGauntletRumor(G.arcade); G.lastMsg=r.msg; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026). ==== */
  acceptSecondSouffle(){ acceptGauntletSecondSouffle(); render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ULTIMATUM_MEDECIN] — ajout #24 (24 ajouts, 12/08/2026) :
     déclenché depuis le camp (scr_arcade_upgrades, ui-04) quand le
     combattant cumule >=2 séquelles actives (ringDoctorUltimatumActive,
     ui-03). Accepter = encaisser proprement (ranime le mécanisme
     a.cashedOut, existant mais mort depuis le retrait de cashOutGauntlet(),
     cf. ANCRE CORRECTIF_CODE_MORT ci-dessus). Refuser = continuer, avec un
     bonus ×1.5 en cas de victoire finale de la run (appliqué dans
     finaliseGauntletRun, ui-08) — mais rien ne change en cas de défaite
     (élimination normale). ==== */
  acceptRingDoctor(){
    if(!G.arcade||!G.arcade.active) return;
    const a=G.arcade;
    const progress=a.mode==='boss_run'?a.streak:a.mode==='ladder_100'?a.rank:(a.tournament?a.tournament.roundStep:1);
    finaliseGauntletRun(a,{kind:'cashout',progress});
    a.victory=false; a.cashedOut=true; a.eliminatedReason=null;
    G.screen='gameover'; save(); render();
  },
  refuseRingDoctor(){ if(!G.arcade||!G.arcade.active) return; G.arcade.doctorRefused=true; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_MISE_EN_JEU] — disponible sur les 3 formats (contrai-
     rement au pacte de finition), y compris le Boss Run : c'est le seul
     arbitrage économique qu'il possédait, sa clause KO-only étant permanente
     et non négociable. Refusée tant que la cagnotte est nulle — il n'y a
     alors rien à mettre en jeu et l'option n'aurait aucun coût. ==== */
  toggleAtRisk(){ if(!G.arcade||!G.arcade.active) return;
    if(!(G.arcade.banked>0) && !G.arcade.atRisk) return;
    G.arcade.atRisk=!G.arcade.atRisk; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_CAMP_MAUDIT] — consomme la phase compétence du camp
     comme pickArcadeSkill(), en appliquant EN PLUS les deltas négatifs du
     malus via applyDeltas() (engine.js). Même sortie de camp que
     pickArcadeSkill pour le Boss Run (pas de phase entraînement). ==== */
  pickCursedSkill(){ if(!G.arcade||!G.arcade.cursedOpt) return;
    if(G.arcade.upgradesChosen.skill) return;
    const c=G.arcade.cursedOpt;
    grantSkill(G.f,c.skill);
    applyDeltas(G.f,c.d);
    G.arcade.cursedTaken=(G.arcade.cursedTaken||0)+1;
    G.arcade.curses=(G.arcade.curses||[]).concat([c.curseLabel]);
    G.arcade.upgradesChosen.skill=true;
    G.arcade.cursedOpt=null;
    if(G.arcade.mode==='boss_run' && G.arcade.upgradesChosen.train){ CL.go('arcadehub'); return; }
    render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_BRACKET_VISIBLE] — les 63 autres combattants et TOUS
     les combats des autres branches sont déjà simulés par
     advanceWTUMMABracket() (ui-03), mais seul a.opponent était affiché : le
     tableau existait sans jamais être montré. Simple routage d'écran, aucune
     donnée nouvelle à produire. ==== */
  viewBracket(){ if(!G.arcade||!G.arcade.tournament) return; G.screen='bracket_view'; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: REJOUABILITE_BANQUE_GAUNTLET] — quitter volontairement une run
     en cours en encaissant les points de salle du palier atteint, plutôt que
     d'être obligé de perdre pour toucher quoi que ce soit. Boss Run applique
     une décote (×0.6) sur son propre barème d'élimination : la banque
     garantie reste strictement inférieure à ce que rapporterait une
     élimination au palier suivant, pour que la mise en banque soit un choix
     de prudence et non un simple raccourci sans coût. Bracket 64 et Ladder
     100 réutilisent tels quels leurs barèmes d'élimination existants : chez
     eux, perdre ou décrocher soi-même a toujours rapporté pareil (aucune
     pénalité à modifier), seule l'option de sortir proprement manquait. ==== */
  /* ==== [ANCRE: CORRECTIF_CODE_MORT] — cashOutGauntlet() retirée : plus aucun
     bouton n'y appelle (GAUNTLET_SORTIE_UNIQUE, ui-04). Les branches
     `a.cashedOut` dans les 3 écrans de fin de run (gameover boss_run/
     ladder_100/bracket64, ui-04) restent en l'état : a.cashedOut ne sera
     plus jamais posé à true nulle part dans le code, ces branches sont donc
     du texte mort mais inoffensif (jamais atteint). Les nettoyer implique de
     retoucher 3 narrations distinctes sans rapport avec ce correctif — hors
     du périmètre de cette passe, à faire si l'un de ces écrans est retouché
     pour une autre raison. ==== */
  /* ==== [FIN ANCRE] ==== */
  acceptPromo(targetOrg){
    G.f.org=targetOrg||(G.f.org+1); G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0;
    G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampOffer=null; G.f.champChampDefenses=null;
    if(ORG_FLAVORS[G.f.org]) G.f.orgFlavor=pick(ORG_FLAVORS[G.f.org]);
    G.f.contract=generateContract(G.f,G.f.org,false);
    applyOrgAdvancementBoost(G.f,G.f.org);
    G.roster=makeOrgRoster(G.f);
    if(G.pending) G.pending.promoOffer=false;
    routeAfterOrgChange();
  },
  declinePromo(){
    G.f.promoCooldown=2;
    // ==== [ANCRE: CORRECTIF_PRECEDEMMENT_DEMANDE] — mémorise qu'une orga
    // supérieure a montré un intérêt réel, pour que negoMarket() puisse la
    // reproposer plus tard même si canPromote() ne repasse plus le seuil.
    G.f.priorPromoInterest=Math.max(G.f.priorPromoInterest||0,G.f.org+1);
    if(G.pending) G.pending.promoOffer=false;
    routeAfterOrgChange();
  },
  declineTopTier(){
    G.f.promoCooldown=2;
    G.f.priorPromoInterest=Math.max(G.f.priorPromoInterest||0,5);
    if(G.pending) G.pending.topTierOffer=false;
    routeAfterOrgChange();
  },
  signTopTier(orgId){ G.f.org=orgId; G.f.orgWins=0; G.f.champion=null; G.f.rivalId=null; G.f.orgElo=eloBaseline(orgId,G.f.overall); G.f.rankBoost=0; if(G.pending)G.pending.topTierOffer=false;
    G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampOffer=null; G.f.champChampDefenses=null; G.f.defenses=0;
    G.f.contract=generateContract(G.f,orgId,false);
    applyOrgAdvancementBoost(G.f,orgId);
    G.roster=makeOrgRoster(G.f);
    if(orgId===6){ G.roster.forEach(o=>{ o.overall=clamp(o.overall+4,30,99); o.attrs.fightIQ=clamp(o.attrs.fightIQ+5,1,100); }); }
    routeAfterOrgChange(); },
  acceptPro(orgIdx,flavorName){ turnPro(); G.f.org=orgIdx||1; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.orgFlavor=flavorName||(ORG_FLAVORS[G.f.org]?pick(ORG_FLAVORS[G.f.org]):null);
    G.f.contract=generateContract(G.f,G.f.org,false);
    applyOrgAdvancementBoost(G.f,G.f.org); G.roster=makeOrgRoster(G.f,'PRO_TRANSITION'); if(G.pending)G.pending.proOffer=null; routeAfterOrgChange(); },
  declinePro(){ G.f.proOfferCooldown=G.f._mentorFastTrack?2:3;
    if(G.pending && G.pending.proOffer) G.f.priorPromoInterest=Math.max(G.f.priorPromoInterest||0,G.pending.proOffer.baseTier||1);
    if(G.pending)G.pending.proOffer=null; routeAfterOrgChange(); },
  negoRenew(){
    G.f.contract=generateContract(G.f,G.f.org,false);
    if(G.pending) G.pending.contractExpiry=false;
    G.lastMsg="Contrat renouvelé (4 combats).";
    // ==== [ANCRE: CORRECTIF_SUPERCOMBAT_ZAPPE] — bug remonté : si l'offre de
    // supercombat (champChampOfferReady) devenait disponible sur le même
    // combat que la fin de contrat, ce routage direct vers 'season'/'hub'
    // écrasait l'offre sans jamais l'afficher. routeAfterCareerPending()
    // réévalue toute la chaîne de priorités (dont champChampOfferReady) une
    // fois contractExpiry consommé, au lieu de sauter directement en fin de
    // chaîne.
    if(G.faith){ routeAfterOrgChange(); } else { routeAfterCareerPending(); save(); render(); }
  },
  negoRaise(){
    const f=G.f; const hasAgent=(f.agentCut>0);
    let prob=0.3;
    if(f.champion) prob+=0.5;
    if(hasAgent) prob+=0.25;
    if((f.streak||0)>=2) prob+=0.15;
    if(rnd()<prob){
      G.f.contract=generateContract(f,f.org,true);
      if(G.pending) G.pending.contractExpiry=false;
      G.lastMsg="Coup de poker réussi ! L\u2019organisation s\u2019aligne sur vos exigences (+40%).";
      // ==== [ANCRE: CORRECTIF_SUPERCOMBAT_ZAPPE] — voir negoRenew() : évite
      // qu'une offre de supercombat concurrente à la fin de contrat soit
      // perdue par un routage direct vers 'season'/'hub'.
      if(G.faith){ routeAfterOrgChange(); } else { routeAfterCareerPending(); save(); render(); }
    } else {
      G.lastMsg="Négociations rompues. L\u2019organisation refuse vos conditions et vous libère.";
      CL.negoMarket(true);
    }
  },
  negoMarket(forcedPenalty){
    const f=G.f; const offers=[];
    // ==== [ANCRE: CORRECTIF_MARCHE_TOUJOURS_MEME_NIVEAU] — bug remonté : hors
    // du cas forcedPenalty (négociation ratée), canUp=canPromote(f) est très
    // strict (orgWins>=6, winRate>=63%, p4pScore) — un combattant qui teste
    // le marché sans remplir ces critères stricts n'obtenait alors QUE des
    // offres de même niveau (rival + réalignement), jamais de variété. On
    // élargit canUp à deux signaux supplémentaires déjà en jeu ailleurs :
    // popularité assez haute (hypeBonus, même seuil que le combat vedette),
    // et intérêt PRÉCÉDEMMENT exprimé par une orga supérieure (déclinée plus
    // tôt, cf. declinePromo/declineTopTier/declinePro) qu'on peut reproposer.
    const hype=f.hypeBonus||1;
    const priorInterestAbove=(f.priorPromoInterest||0)>f.org;
    const canUp=canPromote(f) || hype>=1.4 || priorInterestAbove;
    const agentBonus=(f.agentCut>0);
    // ==== [ANCRE: CORRECTIF_SOMMET_LATERAL] — bug trouvé : une fois dans
    // Pacific Championship (6) OU Ultimate Rim (5), aucune des deux
    // organisations ne pouvait plus jamais proposer l'AUTRE (canPromote()
    // bloque tout mouvement au-delà du plafond 6, et l'organisation 6 n'a
    // pas de pool de noms alternatifs) — la négociation ne proposait donc
    // que soi-même, en double. Les deux ligues du sommet sont des
    // alternatives PARALLÈLES (choix ponctuel depuis la Continentale) : l'une
    // doit pouvoir proposer un transfert latéral vers l'autre à tout moment.
    let currentMult=forcedPenalty?0.7:1.1;
    if(agentBonus && forcedPenalty) currentMult=0.9;
    if(f.org===5 || f.org===6){
      const otherTop=f.org===5?6:5;
      const topContract=generateContract(f,otherTop,false);
      topContract.show=+(topContract.show*currentMult).toFixed(2); topContract.win=+(topContract.win*currentMult).toFixed(2);
      offers.push({org:otherTop,flavor:ORGS[otherTop],contract:topContract,
        desc:otherTop===6?"L\u2019organisation la plus prestigieuse et brutale au monde vous fait de l\u2019\u0153il.":"La ligue des millionnaires vous propose un transfert."});
    } else if(canUp && f.org===4){
      offers.push({org:5,flavor:'Ultimate Rim',contract:generateContract(f,5,false),desc:"La ligue des millionnaires. Suivi médical de pointe."});
      offers.push({org:6,flavor:'Pacific Championship',contract:generateContract(f,6,false),desc:"La ligue la plus prestigieuse. (+4 OVR pour l\u2019opposition)."});
    } else if(canUp && f.org<6){
      const nextOrg=f.org+1;
      offers.push({org:nextOrg,flavor:ORG_FLAVORS[nextOrg]?pick(ORG_FLAVORS[nextOrg]):(ORGS[nextOrg]||'Ligue supérieure'),contract:generateContract(f,nextOrg,false),
        desc:priorInterestAbove&&!canPromote(f)?"Ils avaient déjà tenté de vous signer. L\u2019offre est toujours sur la table.":"La ligue supérieure veut vous signer."});
      if(agentBonus && nextOrg+1<=6 && ((f.defenses||0)>=2 || (f.streak||0)>=6)){
        const fastOrg=nextOrg+1;
        offers.push({org:fastOrg,flavor:ORG_FLAVORS[fastOrg]?pick(ORG_FLAVORS[fastOrg]):(ORGS[fastOrg]||'Ligue supérieure'),contract:generateContract(f,fastOrg,false),desc:"Votre agent a fait jouer ses contacts pour vous faire sauter une étape !"});
      }
    }
    const latContract=generateContract(f,f.org,false);
    latContract.show=+(latContract.show*currentMult).toFixed(2); latContract.win=+(latContract.win*currentMult).toFixed(2);
    // ==== [ANCRE: CORRECTIF_DOUBLON_ORGA] — pick() choisissait un nom au
    // hasard dans le pool de l'organisation ACTUELLE, avec un risque réel (1
    // chance sur 3, pool de 3 noms) de retomber sur le nom déjà utilisé par
    // l'organisation en cours (orgDisplayName). Exclusion explicite du nom
    // actuel avant tirage. Au sommet (5/6), il n'existe pas de pool de noms
    // concurrents (une seule Pacific, une seule Ultimate Rim) : l'offre
    // "ligue concurrente" n'a alors aucun sens et est simplement omise, la
    // vraie alternative étant déjà l'autre organisation du sommet ajoutée
    // ci-dessus.
    if(f.org!==5 && f.org!==6){
      const rivalPool=(ORG_FLAVORS[f.org]||[]).filter(n=>n!==orgDisplayName(f));
      const rivalFlavor=rivalPool.length?pick(rivalPool):(ORGS[f.org]||'Concurrence');
      offers.push({org:f.org,flavor:rivalFlavor,contract:latContract,desc:forcedPenalty?"Une ligue concurrente vous repêche au rabais.":"Une ligue concurrente cherche à vous débaucher."});
    }
    if(!forcedPenalty){ offers.push({org:f.org,flavor:orgDisplayName(f),contract:generateContract(f,f.org,false),desc:"Votre organisation actuelle s\u2019aligne pour vous garder."}); }
    // ==== [ANCRE: OFFRE_LIGUE_INFERIEURE] — bug remonté : le marché libre ne
    // proposait jamais de ligue inférieure, uniquement même palier ou palier
    // supérieur. Élargi au-delà du seul cas forcedPenalty (négociation rompue
    // / fin de contrat sans renouvellement) : un combattant encore peu connu
    // (hype bas) qui teste le marché de son propre chef doit aussi voir
    // cette option de repli, pas seulement quand il y est forcé.
    if((forcedPenalty || hype<1.15) && f.org>=2){
      const lowerOrg=f.org-1;
      const lowerContract=generateContract(f,lowerOrg,false);
      lowerContract.show=+(lowerContract.show*0.8).toFixed(2); lowerContract.win=+(lowerContract.win*0.8).toFixed(2);
      offers.push({org:lowerOrg,flavor:ORG_FLAVORS[lowerOrg]?pick(ORG_FLAVORS[lowerOrg]):(ORGS[lowerOrg]||'Ligue inférieure'),contract:lowerContract,desc:"Une ligue de niveau inférieur vous propose un tremplin pour rebondir."});
    }
    // ==== [FIN ANCRE] ====
    G.freeAgencyOffers=offers;
    G.screen='free_agency'; save(); render();
  },
  acceptFreeAgency(index){
    const offer=G.freeAgencyOffers[index]; const isNewOrg=(offer.org!==G.f.org);
    G.f.contract=offer.contract;
    if(isNewOrg){
      G.f.org=offer.org; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null;
      G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampOffer=null; G.f.champChampDefenses=null;
      G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.orgFlavor=offer.flavor;
      applyOrgAdvancementBoost(G.f,G.f.org);
      G.roster=makeOrgRoster(G.f);
      // ==== [ANCRE: CORRECTIF_BUFF_PACIFIC_TRANSFERT] — bug trouvé : le
      // buff d'élite propre au Pacific Championship (org 6, "+4 OVR / +5
      // fightIQ" à tout le roster) n'était appliqué que dans signTopTier()
      // (première signature). Un transfert latéral via le marché libre
      // (ex. depuis Ultimate Rim) régénérait le roster SANS jamais réappliquer
      // ce buff, rendant la ligue artificiellement plus facile.
      if(offer.org===6){ G.roster.forEach(o=>{ o.overall=clamp(o.overall+4,30,99); o.attrs.fightIQ=clamp(o.attrs.fightIQ+5,1,100); }); }
    }
    if(G.pending){ G.pending.contractExpiry=false; }
    G.freeAgencyOffers=null;
    G.lastMsg=`Contrat signé avec ${offer.flavor} !`;
    // ==== [ANCRE: CORRECTIF_SUPERCOMBAT_ZAPPE] — voir negoRenew() : évite
    // qu'une offre de supercombat concurrente à la fin de contrat soit
    // perdue par un routage direct vers 'season'/'hub'.
    if(G.faith){ routeAfterOrgChange(); } else { routeAfterCareerPending(); save(); render(); }
  },
  nextSeason(){
    // ==== [ANCRE: RECAP_SAISON_RETRAITE] — archive un résumé de la saison qui
    // se termine AVANT de vider G.season.fights, pour pouvoir reconstituer
    // l'historique saison par saison dans l'écran de retraite (item demandé).
    const sData=G.season||{year:1,fights:[]};
    if(sData.fights && sData.fights.length){
      const seasonEval=evaluateSeason(G.f,sData.fights);
      if(!G.f.seasonRecap) G.f.seasonRecap=[];
      G.f.seasonRecap.push({year:sData.year, W:seasonEval.stats.W, L:seasonEval.stats.L,
        koW:seasonEval.stats.koW, subW:seasonEval.stats.subW, decW:seasonEval.stats.decW,
        trophies:seasonEval.trophies.map(t=>t.lbl), age:G.f.age, org:G.f.org, divName:G.f.divName});
    }
    G.season.year++; G.season.fights=[]; if(G.pending) G.pending.endOfSeason=false; if(typeof generateNPCNews==='function') generateNPCNews(true); G.screen='hub'; save(); render(); },
  toLegacy(){
    // ==== [ANCRE: CORRECTIF_DOUBLE_ENSHRINE] — bug remonté ("le Codex
    // inter-carrières bugue") : ce contrôleur n'avait aucune protection
    // contre un second déclenchement pour le MÊME combattant avant que
    // render() ne remplace le bouton "Continuer"/"Voir mon palmarès" par
    // l'écran 'legacy'. Un double-tap rapide (courant sur écran tactile,
    // notamment le délai de tap historique de Safari iOS — d'où le repro sur
    // iPhone, mais le bug lui-même n'a rien de spécifique à une plateforme :
    // n'importe quel double-clic assez rapide sur desktop le déclenche
    // pareil) appelait deux fois enshrine()/syncPlayerSkillsToCodex()/
    // awardLegendPoints() : entrée dupliquée au Panthéon, et surtout
    // totalFights/totalRetirements/legendPoints comptés deux fois dans les
    // statistiques cumulées affichées par le Codex Inter-carrières
    // (panneau tool_codex, scr_codex()). f._enshrined marque la carrière
    // comme déjà scellée et rend tout appel suivant sans effet.
    if(G.f._enshrined){ G.screen='legacy'; render(); return; }
    if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus',JSON.stringify({style:G.f.style})); }catch(e){} }
    // ==== [ANCRE: CORRECTIF_SAISON_PARTIELLE_RETRAITE] — bug remonté : le
    // bilan saison par saison (retireSeasonRecapHtml) totalisait moins de
    // victoires/défaites que le palmarès réel du combattant. Cause : seule
    // nextSeason() archivait G.season.fights dans f.seasonRecap, jamais
    // appelée pour la DERNIÈRE saison (partielle) au moment de la retraite —
    // ses combats restaient comptés dans f.W/f.L mais disparaissaient du
    // récapitulatif. On archive donc cette saison en cours ici aussi, avant
    // de sceller la carrière.
    const sData=G.season||{year:1,fights:[]};
    if(sData.fights && sData.fights.length){
      const seasonEval=evaluateSeason(G.f,sData.fights);
      if(!G.f.seasonRecap) G.f.seasonRecap=[];
      G.f.seasonRecap.push({year:sData.year, W:seasonEval.stats.W, L:seasonEval.stats.L,
        koW:seasonEval.stats.koW, subW:seasonEval.stats.subW, decW:seasonEval.stats.decW,
        trophies:seasonEval.trophies.map(t=>t.lbl), age:G.f.age, org:G.f.org, divName:G.f.divName});
      G.season.fights=[];
    }
    G.f.retired=true; enshrine(G.f); syncPlayerSkillsToCodex(G.f); G.f._enshrined=true; G.screen='legacy'; save(); render(); },
  newCareer(){ wipe(); const t=G.theme; G={theme:t,draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}}; setTheme(t); CL.go('create'); },
  exportSave(){ try{ const blob=JSON.stringify(G); const ta=document.createElement('textarea'); ta.value=blob; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); alert('Sauvegarde copiée — colle-la dans un fichier texte pour la garder.'); }catch(e){ prompt('Copie ce texte :',blob); }
      document.body.removeChild(ta); }catch(e){ alert('Export impossible.'); } },
  importSave(){ const s=prompt('Colle ta sauvegarde ici :'); if(!s)return; try{ const parsed=JSON.parse(s); if(!parsed||typeof parsed!=='object') throw new Error('invalid'); G=migrate(parsed); if(!validateState()) throw new Error('corrupt'); setTheme(G.theme||'dark'); G.screen='hub'; save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
};
window.CL=CL;
/* ============================ ARÈNE 2D & HYBRIDE ========================== */
/* Rejoue le combat round par round à partir de res.log (maintenant granulaire :
   plusieurs sous-événements textuels par round, momentum, dégâts par zone),
   en cohérence stricte avec le résultat du moteur (même vainqueur, méthode,
   round). Silhouettes dans la DA archive : oxblood = joueur, sage = adversaire.
   res.rounds n'existe pas (le champ réel est res.round, singulier) — corrigé
   ici par rapport au brouillon reçu. */
let ARENA=null;
const BEAT_MS=750; // ralenti pour laisser le temps de lire le flux narratif
function makeNoisePattern(ctx){ try{
  const n=64, c=document.createElement('canvas'); c.width=n; c.height=n;
  const nctx=c.getContext('2d'); const id=nctx.createImageData(n,n);
  for(let i=0;i<id.data.length;i+=4){ const v=Math.random()*255; id.data[i]=v; id.data[i+1]=v; id.data[i+2]=v; id.data[i+3]=16; }
  nctx.putImageData(id,0,0); return ctx.createPattern(c,'repeat');
}catch(e){ return null; } }
/* ==== [ANCRE: CORRECTIF_RENDU_ROUND_PAR_ROUND] — paramètre midFight ajouté :
   true quand cette timeline ne couvre qu'UN round joué en cours de coaching
   Gauntlet (runCoachingRound, ui-03), pas l'issue finale du combat — sert
   uniquement à choisir le texte de la cloche de fin (round vs combat).
   N'affecte aucun appelant existant (career/arcade non coaché), tous
   passent midFight=undefined, donc le texte "Fin du combat" d'origine. ==== */
function buildTimeline(midFight){
  const res=G.pending.res, you=G.f, opp=G.fight.opp, meWin=G.pending.win;
  const log=(res.log&&res.log.length)?res.log:[];
  const beats=log.map(L=>({phase:L.phase,by:L.by,round:L.r,finish:L.finish,method:L.method,
    text:L.text,momentum:L.momentum,snapA:L.snapA,snapB:L.snapB}));
  /* ==== [ANCRE: CORRECTIF_ROUND_CLOCHE] — bug remonté : le round de la
     cloche de fin retombait toujours sur res.round||3 — res.round n'existe
     QUE sur une finition (KO/Soumission), jamais sur une décision (la seule
     branche où cette cloche s'ajoute), donc l'expression valait TOUJOURS 3
     en pratique. Inoffensif tant qu'un seul round jusqu'au-boutiste
     existait (toujours le round 3, en carrière) — devient faux dès qu'un
     round 1 ou 2 de coaching Gauntlet se termine aux points : affichait
     "ROUND 3" sur le Canvas au lieu du vrai round joué. Lit désormais le
     round du dernier beat réel du log, cohérent quel que soit le contexte. ==== */
  if(isDecisionLike(res.method)) beats.push({phase:'bell',finish:true,method:res.method,round:(beats.length?beats[beats.length-1].round:3),text:midFight?'[00:00] Fin du round.':'[00:00] Fin du combat. Décision des juges.'});
  /* ==== [FIN ANCRE] ==== */
  ARENA={beats,idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    stMe:100,stOp:100,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:res.method,meWin,
    currentMomentum:50,snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0},finishZone:res.zone||null,
    nmeName:you.first,nopName:opp.first,meFlag:you.flag,opFlag:opp.flag,
    /* ==== [ANCRE: JUICE_NIVEAU1] — hit-stop (gel bref à l'impact), zoom
       caméra et secousse d'écran globale. camZoom/camShakeX/Y sont les
       valeurs COURANTES (interpolées chaque frame vers leur repos), jamais
       appliquées directement en un saut. ==== */
    hitStopMs:0,hitStopStart:0,_lastNow:0,camZoom:1,camShakeMag:0,camFocusX:0.5,
    /* ==== [ANCRE: JUICE_NIVEAU2] — pool de particules générique (étincelles
       d'impact, poussière de takedown, confettis de victoire). _particles est
       un tableau plat consommé/rempli par spawnParticles()/updateParticles()/
       drawParticles(), tous génériques (le "kind" pilote le rendu). ==== */
    _particles:[],_wasGrounded:false,
    /* ==== [ANCRE: JUICE_NIVEAU4] — ralenti (slowMo*), chromatic aberration
       au KO (_chromaKOActive) et réaction de foule (crowdPulse, 0=calme,
       1=en délire). ==== */
    slowMoFactor:1,slowMoUntil:0,_chromaKOActive:false,crowdPulse:0};
}
/* ==== [ANCRE: PREVIEW_MARCHE_NOIR_CANVA] — item demandé : ouvrir une
   "fenêtre" avec un aperçu de l'arène en plein rendu Canvas (les silhouettes
   de combattants), un par effet du Marché noir, au lieu du simple texte
   descriptif. Réutilise TEL QUEL le moteur de rendu déjà éprouvé du combat
   réel (cacheArenaGfx/drawArena/fighter, tous inchangés) — seule différence :
   une timeline VIDE (aucun beat, aucune boucle d'animation démarrée),
   dessinée une seule fois en trame figée (drawArena(0,true), même mécanisme
   que le gel final d'un vrai combat) pour montrer les deux combattants
   debout dans l'octogone. ==== */
function buildStaticPreviewArena(nameA,nameB,flagA,flagB){
  ARENA={beats:[],idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    stMe:100,stOp:100,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:'',meWin:false,
    currentMomentum:50,snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0},finishZone:null,
    nmeName:nameA,nopName:nameB,meFlag:flagA,opFlag:flagB,
    hitStopMs:0,hitStopStart:0,_lastNow:0,camZoom:1,camShakeMag:0,camFocusX:0.5,
    _particles:[],_wasGrounded:false,
    slowMoFactor:1,slowMoUntil:0,_chromaKOActive:false,crowdPulse:0};
}
/* ==== [FIN ANCRE] ==== */
function cacheArenaGfx(){
  const A=ARENA, ctx=A.ctx, W=A.W, H=A.H;
  const topY=H*0.30, topL=W*0.08, topR=W*0.92, botL=W*0.03, botR=W*0.97, gY=H-16, gY2=H-6;
  A._geom={topY,topL,topR,botL,botR,gY,gY2,W,H};
  const spot=ctx.createRadialGradient(W*0.5,topY*0.3,0,W*0.5,topY*0.3,W*0.7);
  spot.addColorStop(0,'rgba(255,225,170,.34)'); spot.addColorStop(0.5,'rgba(255,225,170,.12)'); spot.addColorStop(1,'rgba(0,0,0,0)');
  A._spotGrad=spot;
  A._bleacherFill=[]; A._bleacherDots=[];
  for(let r=0;r<6;r++){ A._bleacherFill.push(`rgba(58,49,38,${0.55+r*0.06})`); A._bleacherDots.push(`rgba(190,140,105,${0.35+r*0.05})`); }
  /* ==== [ANCRE: APERCU_BOUTIQUE_UNIFIE] — _themeOverride permet de rendre
     l'octogone avec un thème qui n'est PAS celui équipé, pour montrer un
     cosmétique avant achat. Absent partout ailleurs : le comportement normal
     (thème équipé) est strictement inchangé. ==== */
  A._theme=A._themeOverride||getArenaTheme();
  A._floorGrad=ctx.createLinearGradient(0,topY,0,H);
  A._floorGrad.addColorStop(0,A._theme.floorColors[0]); A._floorGrad.addColorStop(1,A._theme.floorColors[1]);
  A._vignetteGrad=ctx.createRadialGradient(W/2,H*0.55,H*0.25,W/2,H*0.55,Math.max(W,H)*0.62);
  A._vignetteGrad.addColorStop(0,'rgba(0,0,0,0)'); A._vignetteGrad.addColorStop(1,'rgba(0,0,0,.38)');
  A._pads=[[botL,H],[botR,H],[W,gY2],[W,gY],[topL,topY],[topR,topY],[0,gY],[0,gY2]];
  A._foMe={lunge:0,flash:false,shake:false,fallen:false,grounded:false,phase:null,top:false,tap:false};
  A._foOp={lunge:0,flash:false,shake:false,fallen:false,grounded:false,phase:null,top:false,tap:false};
}
function startArena(){ if(!ARENA||ARENA.started)return; ARENA.started=true;
  // Cast JSDoc : getElementById() renvoie HTMLElement générique ; c'est bien
  // un <canvas> dans le HTML réel (width/height/getContext lui sont propres).
  const cv=/** @type {HTMLCanvasElement|null} */ (document.getElementById('arena-cv'));
  if(!cv||!cv.getContext||typeof requestAnimationFrame==='undefined'){ ARENA.done=true; return; } // pas de canvas (test)
  const dpr=Math.min(window.devicePixelRatio||1,2); const W=cv.clientWidth||360, H=220;
  cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.dpr=dpr; ARENA.t0=performance.now(); ARENA.pauseOffset=0; ARENA.roundPause=false;
  ARENA.noise=makeNoisePattern(ctx);
  cacheArenaGfx();
  const total=ARENA.beats.length*BEAT_MS;
  const loop=(now)=>{ if(ARENA.roundPause) return;
    /* ==== [ANCRE: JUICE_NIVEAU1] — hit-stop : pendant le gel, on absorbe le
       temps réel dans pauseOffset au lieu de laisser el avancer, donc la
       frame reste identique sans jamais sauter de beat au dégel. */
    if(ARENA.hitStopMs>0){
      if(now-ARENA.hitStopStart<ARENA.hitStopMs){
        ARENA.pauseOffset+=now-(ARENA._lastNow||now); ARENA._lastNow=now;
        drawArena((ARENA._lastFrac||0),true); ARENA.raf=requestAnimationFrame(loop); return;
      }
      ARENA.hitStopMs=0; ARENA._chromaKOActive=false;
    }
    /* ==== [ANCRE: JUICE_NIVEAU4] — ralenti sur les finitions : même principe
       que le hit-stop (absorber le temps réel dans pauseOffset), mais PARTIEL
       (facteur slowMoFactor) au lieu de total — la frappe/chute se termine en
       temps étiré au lieu de reprendre net à vitesse normale après le gel. */
    if(ARENA.slowMoUntil && now<ARENA.slowMoUntil){
      const dtReal=now-(ARENA._lastNow||now); const dtSlow=dtReal*(ARENA.slowMoFactor||1);
      ARENA.pauseOffset+=dtReal-dtSlow; ARENA._lastNow=now;
      const elS=now-ARENA.t0-ARENA.pauseOffset;
      ARENA._lastFrac=(elS%BEAT_MS)/BEAT_MS;
      drawArena(ARENA._lastFrac,false); paintBars();
      ARENA.raf=requestAnimationFrame(loop); return;
    }
    ARENA.slowMoUntil=0;
    ARENA._lastNow=now;
    const el=now-ARENA.t0-ARENA.pauseOffset; const bi=Math.min(ARENA.beats.length-1,Math.floor(el/BEAT_MS));
    if(bi!==ARENA.lastBeat){
      // pause au changement de round (sauf le tout premier beat) — laisse le
      // joueur enchaîner manuellement plutôt qu'un défilement continu.
      // pauseHandledFor évite de redétecter EXACTEMENT le même changement de
      // round à la reprise (sinon nextRound() retombe sur le même bi, revoit
      // le même changement de round, et se re-bloque instantanément : le
      // bouton semblait "ne rien faire").
      const prevRound=ARENA.lastBeat>=0?(ARENA.beats[ARENA.lastBeat].round||1):null;
      const newRound=ARENA.beats[bi].round||1;
      if(prevRound!==null && newRound!==prevRound && !ARENA.beats[bi].finish && bi!==ARENA.pauseHandledFor){
        ARENA.roundPause=true; ARENA.pendingBeatIdx=bi; ARENA.pauseHandledFor=bi; renderArenaOverlay(); return;
      }
      ARENA.lastBeat=bi; applyBeat(ARENA.beats[bi]);
    }
    ARENA._lastFrac=(el%BEAT_MS)/BEAT_MS;
    drawArena(ARENA._lastFrac); paintBars();
    if(el>=total){ ARENA.done=true;
      /* ==== [ANCRE: JUICE_NIVEAU2] — confettis de victoire : sans une courte
         boucle dédiée après la fin du combat, drawArena(1,true) ne serait
         appelé qu'UNE fois (gel plat) et les confettis n'auraient jamais la
         moindre frame pour tomber avant la navigation vers l'écran de
         résultat. */
      if(ARENA.meWin) spawnParticles(ARENA,ARENA.W/2,-10,{count:44,xSpread:ARENA.W*0.9,
        colors:['#E6B93A','#E8442F','#7FC488','#F5EFE0'],spreadX:2,spreadY:1,vy0:1.5,gravity:0.085,life:120,size:6,kind:'confetti'});
      const outroStart=performance.now();
      const outroLoop=(now2)=>{ updateParticles(ARENA); drawArena(1,true); paintBars();
        if(now2-outroStart<1100){ ARENA.raf=requestAnimationFrame(outroLoop); }
        else { ARENA.to=setTimeout(()=>CL.toResult(),200); } };
      ARENA.raf=requestAnimationFrame(outroLoop); return;
    }
    ARENA.raf=requestAnimationFrame(loop); };
  ARENA.loopFn=loop;
  paintBars(); ARENA.raf=requestAnimationFrame(loop);
}
function renderArenaOverlay(){ const el=document.getElementById('ar-log'); if(!el) return;
  const finishedRound=ARENA.beats[ARENA.lastBeat]?(ARENA.beats[ARENA.lastBeat].round||1):1;
  el.innerHTML=`<div style="text-align:center"><b class="gold">Fin du round ${finishedRound}</b><br><button class="btn primary" style="margin-top:8px;padding:8px" onclick="CL.nextRound()">Round suivant ▸</button></div>`;
}
function applyBeat(b){ const A=ARENA; if(!b)return;
  if(b.phase==='bell'){ A.currentText=b.text; return; }
  if(b.by==='me'){ A.flashOp=1; A.shakeOp=1; A.lungeMe=1; }
  else { A.flashMe=1; A.shakeMe=1; A.lungeOp=1; }
  A.stMe=clamp(A.stMe-RI(2,5),12,100); A.stOp=clamp(A.stOp-RI(2,5),12,100);
  /* ==== [ANCRE: JUICE_NIVEAU1] — hit-stop + secousse d'écran, magnitude
     différenciée : un échange normal mérite un micro-gel discret, une
     finition mérite un vrai temps d'arrêt. Le point de focus caméra suit le
     combattant qui ENCAISSE (pas celui qui frappe) — c'est lui que l'œil
     cherche instinctivement au moment de l'impact. ==== */
  A.hitStopMs=b.finish?170:55; A.hitStopStart=performance.now();
  A.camShakeMag=Math.min(1,(A.camShakeMag||0)+(b.finish?1:0.45));
  A.camFocusX=b.by==='me'?0.68:0.32;
  A.camZoomTarget=b.finish?1.22:1.08;
  /* ==== [ANCRE: JUICE_NIVEAU2] — intention de burst d'impact, consommée une
     seule fois dans drawArena dès que la position réelle du receveur (xOp/
     xMe, qui dépend du momentum) est connue — applyBeat n'a pas cette info. */
  A._fxSpawn={receiver:b.by==='me'?'op':'me',finish:!!b.finish};
  /* ==== [ANCRE: JUICE_NIVEAU4] — ralenti + chromatic aberration + foule.
     Le ralenti ne concerne QUE les finitions (un échange normal n'a pas
     besoin de s'étirer). La chromatic aberration ne concerne QUE le KO —
     une soumission n'a pas ce "choc caméra", elle a déjà sa propre tension
     (halo TAP! existant). La foule réagit à TOUT coup, mais plus fort sur
     une finition, et décroît ensuite (cf. drawArena). */
  if(b.finish){ A.slowMoFactor=0.22; A.slowMoUntil=performance.now()+900; }
  A._chromaKOActive=!!(b.finish && b.method && b.method.startsWith('KO'));
  A.crowdPulse=Math.min(1,(A.crowdPulse||0)+(b.finish?1:0.35));
  if(b.finish){ if(b.method&&b.method.startsWith('KO')){ if(A.meWin){A.fall=2;} else {A.fall=1;} }
    else if(b.method&&b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; }
    if(A.finishZone){ const zoneLetter=A.finishZone==='tête'?'h':A.finishZone==='corps'?'b':'l';
      const loserPrefix=A.meWin?'do':'dm'; A.flashZoneId=`${loserPrefix}-${zoneLetter}`; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
  A.currentText=b.text; A.currentMomentum=b.momentum;
  if(b.snapA) A.snapA=b.snapA; if(b.snapB) A.snapB=b.snapB;
}
/* ==== [ANCRE: JUICE_NIVEAU2] — système de particules générique. Chaque
   particule est un objet plat {x,y,vx,vy,g,life,maxLife,size,color,kind,rot}.
   spawnParticles() en crée un lot, updateParticles() les fait vivre une
   frame (gravité + décroissance de vie), drawParticles() les dessine selon
   leur "kind". Pas de classe, pas de lib : cohérent avec le reste du fichier. ==== */
function spawnParticles(A,x,y,opts){
  if(!A._particles) A._particles=[];
  const n=opts.count||6;
  for(let i=0;i<n;i++){
    const ox=opts.xSpread?( (Math.random()-0.5)*opts.xSpread ):0;
    A._particles.push({
      x:x+ox, y:y+(opts.ySpread?(Math.random()-0.5)*opts.ySpread:0),
      vx:(Math.random()-0.5)*(opts.spreadX||4),
      vy:(opts.vy0||0)-(Math.random()*(opts.spreadY||4)),
      g:opts.gravity!=null?opts.gravity:0.32,
      life:opts.life||24, maxLife:opts.life||24,
      size:(opts.size||3)*(0.65+Math.random()*0.7),
      color:opts.colors[Math.floor(Math.random()*opts.colors.length)],
      kind:opts.kind||'spark', rot:Math.random()*Math.PI*2, rotSpeed:(Math.random()-0.5)*0.3
    });
  }
}
function updateParticles(A){
  if(!A._particles||!A._particles.length) return;
  A._particles=A._particles.filter(p=>{
    p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.life-=1; p.rot+=p.rotSpeed;
    return p.life>0;
  });
}
/* ==== [ANCRE: JUICE_NIVEAU4] — chromatic aberration au KO. Décale le canal
   rouge vers la gauche et le bleu vers la droite (vert centré, inchangé) sur
   quelques pixels — le "choc caméra" qu'on voit dans beaucoup de jeux de
   combat modernes sur un gros impact. Volontairement réservé au KO (voir
   _chromaKOActive posé dans applyBeat) : appelé une fois par frame gelée
   pendant le hit-stop, jamais pendant le reste du combat — le coût O(pixels)
   de getImageData/putImageData est négligeable sur une poignée de frames
   rares, il serait déraisonnable à 60fps en continu. ==== */
function applyChromaAberration(ctx,offsetPx){
  try{
    const cv=ctx.canvas; if(!cv||!cv.width||!cv.height) return;
    const w=cv.width, h=cv.height;
    const img=ctx.getImageData(0,0,w,h); const d=img.data;
    const out=new Uint8ClampedArray(d.length);
    for(let y=0;y<h;y++){ const rowBase=y*w;
      for(let x=0;x<w;x++){ const i=(rowBase+x)*4;
        const xr=x-offsetPx<0?0:(x-offsetPx); const xb=x+offsetPx>=w?w-1:(x+offsetPx);
        const ir=(rowBase+xr)*4, ib=(rowBase+xb)*4;
        out[i]=d[ir]; out[i+1]=d[i+1]; out[i+2]=d[ib+2]; out[i+3]=d[i+3];
      }
    }
    img.data.set(out);
    ctx.putImageData(img,0,0);
  }catch(e){ /* getImageData peut échouer (canvas "tainted", environnement de test) — dégrade silencieusement */ }
}
function drawParticles(ctx,A){
  if(!A._particles||!A._particles.length) return;
  for(const p of A._particles){
    const t=Math.max(0,p.life/p.maxLife);
    ctx.save();
    if(p.kind==='confetti'){
      ctx.globalAlpha=t; ctx.fillStyle=p.color;
      ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillRect(-p.size/2,-p.size/2*0.6,p.size,p.size*0.6);
    } else if(p.kind==='dust'){
      ctx.globalAlpha=t*0.5; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(1.4-t*0.4),0,Math.PI*2); ctx.fill();
    } else { // spark
      ctx.globalAlpha=t; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*t,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha=1;
}
/* ==== [FIN ANCRE] ==== */
function fighter(ctx,x,groundY,face,color,o){ // o: {lunge,flash,shake,fallen,grounded,phase,top,tap}
  ctx.save();
  const sh=o.shake?((Math.random()-0.5)*4):0;
  x+=face*(o.lunge*14)+sh;
  const bob=Math.sin(performance.now()/240 + (face>0?0:1))*2;
  /* ==== [ANCRE: JUICE_NIVEAU3] — ombre portée, ancrée au sol (groundY fixe,
     jamais le bob vertical du buste — sinon elle "respirerait" avec lui,
     ce qui casserait l'ancrage au sol). Légèrement plus large en pleine
     extension : le poids se porte en avant. ==== */
  ctx.save(); ctx.globalAlpha=0.30; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(x, groundY-2, 14+o.lunge*3, 4.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  if(o.grounded){
    if(!o.top){
      // Sur le dos (garde) — buste allongé, tête décalée, jambes relevées
      ctx.translate(x, groundY-5);
      /* ==== [ANCRE: JUICE_NIVEAU3] — halo lumineux au lieu du blanc plat :
         le combattant garde sa couleur, un glow diffus derrière souligne
         l'impact sans effacer qui il est. */
      if(o.flash){ ctx.save(); ctx.shadowColor='#fff'; ctx.shadowBlur=16; ctx.fillStyle='rgba(255,255,255,.8)';
        ctx.beginPath(); ctx.ellipse(0,0,30,9,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle=color; ctx.globalAlpha=.95;
      ctx.beginPath(); ctx.ellipse(0,0,30,9,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-face*25,-2,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=color; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(0,-20); ctx.lineTo(-face*15,-15); ctx.stroke();
    } else {
      // Au-dessus (dominant) — buste vertical, bras qui contrôle/frappe
      ctx.translate(x-face*8, groundY-22);
      if(o.flash){ ctx.save(); ctx.shadowColor='#fff'; ctx.shadowBlur=16; ctx.fillStyle='rgba(255,255,255,.8)';
        ctx.beginPath(); ctx.ellipse(0,-6,14,22,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle=color; ctx.strokeStyle=color;
      ctx.lineWidth=12; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(0,-15); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,-22,8,0,Math.PI*2); ctx.fill();
      ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(face*15,(o.lunge*15)); ctx.stroke();
    }
    if(o.tap){ // halo de danger de soumission, pulsant, sur le combattant en péril
      const pulse=Math.abs(Math.sin(performance.now()/150))*5;
      ctx.beginPath(); ctx.arc(0,-15,20+pulse,0,Math.PI*2);
      ctx.fillStyle='rgba(232,68,47,0.3)'; ctx.fill();
      ctx.strokeStyle='#E8442F'; ctx.lineWidth=2; ctx.stroke();
    }
    ctx.restore(); return;
  }
  ctx.translate(x, groundY-52+bob+(o.fallen?46:0));
  if(o.fallen) ctx.rotate(face*1.3);
  /* ==== [ANCRE: JUICE_NIVEAU3] — même halo pour la pose debout, dessiné
     derrière avant tout le reste (jambes/buste/tête/bras gardent leur
     couleur propre, plus de flip vers un blanc plat). */
  if(o.flash){ ctx.save(); ctx.shadowColor='#fff'; ctx.shadowBlur=18; ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(0,-5,17,32,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  const col=color;
  const reach=o.lunge;
  ctx.strokeStyle=col; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-3,4); ctx.lineTo(-10,46); ctx.moveTo(4,4); ctx.lineTo(12,46); ctx.stroke();
  ctx.save();
  ctx.scale(1+reach*0.14, 1-reach*0.10);
  ctx.lineWidth=15; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,26); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-20,9,0,Math.PI*2); ctx.fill();
  /* ==== [ANCRE: JUICE_NIVEAU3] — volume : surbrillance douce en haut à
     gauche du buste/tête (lumière du projecteur, cohérent avec _spotGrad
     déjà centré au-dessus de l'octogone), fondue via 'overlay' plutôt qu'un
     dégradé de teinte calculé — un simple trait de couleur unie gagne un
     semblant de relief sans ajouter de complexité de calcul de couleur. */
  ctx.save(); ctx.globalCompositeOperation='overlay';
  const hl=ctx.createRadialGradient(-3,-24,0,-3,-24,15);
  hl.addColorStop(0,'rgba(255,255,255,.55)'); hl.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=hl;
  ctx.beginPath(); ctx.arc(0,-20,9,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0,8,8,18,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.lineWidth=6;
  // flou de mouvement — traînée du bras avant en pleine frappe
  if(reach>0.1 && !o.fallen){
    for(let i=1;i<=3;i++){
      ctx.globalAlpha=0.25/i;
      const offset=(reach*20)*(i*0.4);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(face*(10+(reach*20)-offset), -8+(reach*4)); ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-face*8,-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(face*(10+reach*20), -8+reach*4); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(face*(10+reach*20),-8+reach*4,4.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
/* ==== [ANCRE: LOT12_COSMETIQUE_ARENE] — thèmes visuels de l'octogone. Adapté
   pour s'intégrer à la géométrie réelle de drawArena (8 points, pas la version
   simplifiée du brouillon) — seules les couleurs de sol/rails/poteaux changent,
   la forme reste identique. ==== */
const ARENA_THEMES=[
  {id:'classic',name:'Toile Noire (Classique)',floorColors:['#1c1710','#241d14'],railColor:'#4a3c1f',padColor:'#5C4B2E'},
  {id:'pride',name:'Toile Blanche & Bleue (Héritage)',floorColors:['#DCE2EB','#FFFFFF'],railColor:'#1A4D8F',padColor:'#B22222'},
  {id:'gold',name:'Bâche Royale (Prestige)',floorColors:['#E6B93A','#8A6A1E'],railColor:'#241D13',padColor:'#14100B'},
  {id:'neon',name:'Néons Cyberpunk',floorColors:['#0d0221','#26045c'],railColor:'#ff003c',padColor:'#00f0ff'},
  {id:'underground',name:'Béton Clandestin',floorColors:['#2a2a2a','#1a1a1a'],railColor:'#555555',padColor:'#000000'},
  {id:'crimson',name:'Arène Écarlate',floorColors:['#2a0a0a','#170505'],railColor:'#E8442F',padColor:'#1a0303'},
  /* ==== [ANCRE: GAUNTLET_DEFI_JOUR_V2] — ajout #2 (24 ajouts, 12/08/2026) :
     récompense exclusive de série de 7 jours (GAUNTLET_DAILY_STREAK_REWARD,
     state.js) — checkLegendUnlock('cosmetic_renegade') la rend
     sélectionnable ici sans jamais figurer dans LEGEND_UNLOCKABLES (donc
     jamais achetable). ==== */
  {id:'renegade',name:'Toile Braise du Renégat (exclusive)',floorColors:['#3a0e02','#1a0500'],railColor:'#ff5a1f',padColor:'#1a0500'},
  /* ==== [ANCRE: CORRECTIF_BANNIERE_CENDREE] — bug remonté : excl_banner_ash
     (GAUNTLET_EXCLUSIVE_OFFERS, state.js) était vendu comme "thème
     d'octogone" mais n'avait aucune entrée ici, donc aucun moyen de le
     sélectionner après achat. Id aligné sur celui de l'offre (banner_ash)
     pour matcher le checkLegendUnlock('excl_'+t.id) ajouté ci-dessous
     (ui-07-contracts-legacy-screens.js). ==== */
  {id:'banner_ash',name:'Bannière Cendrée (exclusive)',floorColors:['#180404','#0c0202'],railColor:'#7a1f16',padColor:'#0c0202'}
  /* ==== [FIN ANCRE] ==== */
];
/* ==== [ANCRE: CORRECTIF_PERSISTANCE_SKIN_ARENE] — bug remonté : le skin
   actif vivait sur G (réinitialisé par newCareer(), voir CL.newCareer plus
   bas), donc perdu à chaque nouvelle carrière même si le déblocage
   (meta.unlockedItems) survivait bien. Déplacé sur meta, comme tous les
   autres déblocages achetés en points de Légende — jamais touché par
   newCareer(). ==== */
function setArenaCosmeticTheme(themeId){ const meta=loadMetaStats(); meta.arenaCosmetic=themeId; saveMetaStats(meta); }
function getArenaTheme(){ const meta=loadMetaStats(); return ARENA_THEMES.find(t=>t.id===(meta.arenaCosmetic||'classic'))||ARENA_THEMES[0]; }
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
function drawArena(frac,freeze){ const A=ARENA, ctx=A.ctx; if(!ctx||!A._geom)return; const {W,H,topY,topL,topR,botL,botR,gY,gY2}=A._geom;
  ctx.clearRect(0,0,W,H);
  /* ==== [ANCRE: JUICE_NIVEAU1] — caméra : zoom vers la cible (tenu, pas
     assoupli, pendant le hit-stop) + secousse globale qui décroît en
     exponentielle. focusX suit qui encaisse (posé par applyBeat) pour que le
     zoom recentre naturellement sur l'action plutôt que sur le centre fixe. */
  if(!freeze){
    const zt=A.camZoomTarget||1; A.camZoom=(A.camZoom||1)+(zt-(A.camZoom||1))*0.22;
    A.camZoomTarget=1+((A.camZoomTarget||1)-1)*0.86;
    A.camShakeMag=Math.max(0,(A.camShakeMag||0)-0.09);
  }
  const shakeMag=(A.camShakeMag||0)*7;
  const shakeX=shakeMag?(Math.random()-0.5)*shakeMag:0, shakeY=shakeMag?(Math.random()-0.5)*shakeMag*0.6:0;
  const zoom=A.camZoom||1, focusX=W*(A.camFocusX!=null?A.camFocusX:0.5), focusY=H*0.62;
  ctx.save();
  ctx.translate(shakeX,shakeY);
  if(zoom>1.002){ ctx.translate(focusX,focusY); ctx.scale(zoom,zoom); ctx.translate(-focusX,-focusY); }
  ctx.fillStyle=A._spotGrad; ctx.fillRect(0,0,W,topY);
  if(!freeze) A.crowdPulse=Math.max(0,(A.crowdPulse||0)-0.02);
  const cp=A.crowdPulse||0;
  const bleacherRows=6, rowH=topY/bleacherRows;
  for(let r=0;r<bleacherRows;r++){ const ry=r*rowH, rh=rowH-1;
    ctx.fillStyle=A._bleacherFill[r]; ctx.fillRect(0,ry,W,rh);
    ctx.fillStyle=A._bleacherDots[r];
    const dots=14+r*3;
    for(let d=0;d<dots;d++){ const dx=(d/dots)*W+Math.sin(d+r)*3;
      const jump=cp>0.02?Math.sin(performance.now()/80+d*1.7+r*2)*cp*3:0;
      ctx.beginPath(); ctx.arc(dx,ry+rh*0.5-Math.abs(jump),1.6,0,Math.PI*2); ctx.fill(); }
  }
  ctx.beginPath();
  ctx.moveTo(botL,H); ctx.lineTo(botR,H); ctx.lineTo(W,gY2); ctx.lineTo(W,gY);
  ctx.lineTo(topR,topY); ctx.lineTo(topL,topY); ctx.lineTo(0,gY); ctx.lineTo(0,gY2);
  ctx.closePath();
  const arenaTheme=A._theme;
  ctx.fillStyle=A._floorGrad; ctx.fill();
  if(A.noise){ ctx.save(); ctx.clip(); ctx.fillStyle=A.noise; ctx.fillRect(0,0,W,H); ctx.restore(); }
  ctx.strokeStyle='#3a2f20'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){ const x=i*W/8; ctx.globalAlpha=.5; ctx.beginPath(); ctx.moveTo(x,gY); ctx.lineTo(x*0.86+W*0.05,topY); ctx.stroke(); }
  ctx.globalAlpha=1; ctx.strokeStyle=arenaTheme.railColor; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(botL,H); ctx.lineTo(botR,H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(topL,topY); ctx.lineTo(topR,topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(0,gY2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W,gY); ctx.lineTo(W,gY2); ctx.stroke();
  ctx.fillStyle=arenaTheme.padColor;
  for(let i=0,p=A._pads;i<p.length;i++){ const px=p[i][0], py=p[i][1]; ctx.fillRect(px-2,py-10,4,20); }
  const grounded=A.curPhase==='sol';
  const mom=(A.currentMomentum!=null?A.currentMomentum:50);
  const shift=grounded?0:clamp((mom-50)/50,-1,1)*(W*0.09);
  let xOp=W*0.68+shift, xMe=W*0.32+shift;
  if(grounded){ const center=W*0.5+shift; xOp=center+(A.curTop==='op'?12:-12); xMe=center+(A.curTop==='me'?-12:12); }
  /* ==== [ANCRE: JUICE_NIVEAU2] — consommation des intentions de particules
     posées plus tôt (applyBeat pour l'impact, transition de phase ici pour
     le takedown) : c'est ICI que xOp/xMe/gY sont enfin connus. */
  if(A._fxSpawn){
    const s=A._fxSpawn; const px=s.receiver==='op'?xOp:xMe; const py=grounded?gY-15:gY-58;
    spawnParticles(A,px,py,{count:s.finish?14:7,colors:['#F5EFE0','#E6B93A','#E8442F'],
      spreadX:s.finish?7:4,spreadY:s.finish?6:3.5,gravity:0.32,life:s.finish?32:20,size:s.finish?3.2:2.2,kind:'spark'});
    A._fxSpawn=null;
  }
  if(grounded && !A._wasGrounded){
    spawnParticles(A,(xOp+xMe)/2,gY,{count:10,colors:['#4a3c1f','#3a2f20','#5C4B2E'],
      spreadX:5,spreadY:2,gravity:0.05,life:34,size:5,kind:'dust'});
  }
  A._wasGrounded=grounded;
  const isSubDanger=grounded && A.currentText && (A.currentText.includes('soum')||A.currentText.includes('clé')||A.currentText.includes('étrangl'));
  const foOp=A._foOp, foMe=A._foMe;
  foOp.lunge=A.lungeOp*(1-frac); foOp.flash=A.flashOp>0; foOp.shake=A.shakeOp>0; foOp.fallen=A.fall===2;
  foOp.grounded=grounded; foOp.phase=A.curPhase; foOp.top=A.curTop==='op'; foOp.tap=isSubDanger&&A.curTop!=='op';
  foMe.lunge=A.lungeMe*(1-frac); foMe.flash=A.flashMe>0; foMe.shake=A.shakeMe>0; foMe.fallen=A.fall===1;
  foMe.grounded=grounded; foMe.phase=A.curPhase; foMe.top=A.curTop==='me'; foMe.tap=isSubDanger&&A.curTop!=='me';
  fighter(ctx, xOp, gY, -1, '#6E8478', foOp);
  fighter(ctx, xMe, gY, 1, '#B23B36', foMe);
  if(isSubDanger && !A.done){ ctx.save(); ctx.textAlign='center'; ctx.fillStyle='#E8442F'; ctx.font="700 12px 'Oswald'"; ctx.fillText('⚠ DANGER SOUMISSION',W/2,H*0.45); ctx.restore(); }
  if(!freeze) updateParticles(A);
  drawParticles(ctx,A);
  if(!freeze){
    A.flashMe=Math.max(0,A.flashMe-0.5); A.flashOp=Math.max(0,A.flashOp-0.5);
    A.shakeMe=Math.max(0,A.shakeMe-0.5); A.shakeOp=Math.max(0,A.shakeOp-0.5);
    A.lungeMe*=0.86; A.lungeOp*=0.86;
  }
  ctx.fillStyle=A._vignetteGrad; ctx.fillRect(0,0,W,H);
  ctx.restore();
  if(A._chromaKOActive) applyChromaAberration(ctx,Math.round(3*(A.dpr||1)));
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  const rnd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = A.curPhase==='sol'?'SOL':(A.curPhase==='clinch'?'CLINCH':'DEBOUT');
  if(A.done){ label = A.method==='Égalité'?'ÉGALITÉ':isDecisionLike(A.method)?'AUX POINTS':(A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rnd+' · '+label), W/2, 20);
  if(A.tap){ ctx.fillStyle='#C6A15B'; ctx.font="700 13px 'Oswald'"; ctx.fillText('TAP !', A.tap===1?W*0.34:W*0.66, gY-70); }
}
function stopArena(){ if(ARENA){ if(ARENA.raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(ARENA.raf); if(ARENA.to)clearTimeout(ARENA.to); } }
/* ==== [ANCRE: PREVIEW_MARCHE_NOIR_CANVA] — appelée par render() dès que
   G.screen==='consumable_preview' (même schéma que startArena/G.screen==
   'arena'). Un seul dessin figé (drawArena(0,true)), pas de boucle
   requestAnimationFrame : rien à animer sur un aperçu statique. ==== */
/* ==== [ANCRE: APERCU_BOUTIQUE_UNIFIE] — item demandé : "que chaque aperçu
   (comme ceux du marché noir) soit disponible sur absolument chaque élément
   de la boutique". Le catalogue n'avait qu'un repli texte pour la majorité
   de ses articles, et un aperçu replié sur place pour les cosmétiques et
   décorations. Même fenêtre dédiée que le Marché noir pour TOUS les
   articles, avec le rendu le plus parlant selon ce qu'on achète :
     - cosmétique d'octogone -> l'octogone réellement rendu dans ce thème
       (Canvas, via ARENA._themeOverride) — on voit ce qu'on achète ;
     - archétype de Gauntlet -> les deux silhouettes dans la cage, le
       combattant mis en avant, plus ses points forts chiffrés ;
     - décoration -> la fiche de légende telle qu'elle sera décorée ;
     - mode, scénario, outil -> pas de rendu visuel possible (rien de
       visuel n'existe avant l'achat) : la fenêtre explique ce que
       l'article ajoute et OÙ le retrouver une fois acheté, ce qui manquait
       le plus au catalogue.
   Réutilise intégralement le pipeline de dessin du combat (buildStatic
   PreviewArena / cacheArenaGfx / drawArena), aucun code de rendu nouveau. ==== */
function startShopPreviewArena(){
  const cv=/** @type {HTMLCanvasElement|null} */ (document.getElementById('shop-preview-cv'));
  if(!cv||!cv.getContext) return;
  const id=G._shopPreviewId||'';
  const arch=(typeof ARCADE_UNLOCKABLE_ARCHETYPES!=='undefined')
    ? ARCADE_UNLOCKABLE_ARCHETYPES.find(a=>a.unlockId===id) : null;
  buildStaticPreviewArena(arch?arch.nick:'Toi','Adversaire',arch?arch.flag:'','');
  const dpr=Math.min(window.devicePixelRatio||1,2); const W=cv.clientWidth||360, H=180;
  cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.dpr=dpr;
  /* Thème forcé pour un cosmétique, thème équipé pour tout le reste. */
  const themeId=id.indexOf('cosmetic_')===0?id.replace('cosmetic_',''):(id.indexOf('excl_')===0?id.replace('excl_',''):null);
  ARENA._themeOverride=themeId?(ARENA_THEMES.find(t=>t.id===themeId)||null):null;
  cacheArenaGfx();
  if(arch) ARENA.flashMe=1;
  drawArena(0,true);
  ARENA._themeOverride=null;
}
function startConsumablePreviewArena(){
  const cv=/** @type {HTMLCanvasElement|null} */ (document.getElementById('shop-preview-cv'));
  if(!cv||!cv.getContext) return;
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===G._consumablePreviewId);
  const you=G.f;
  buildStaticPreviewArena(you?(you.nick||you.first||'Toi'):'Toi','Adversaire',you?(you.flag||''):'','');
  const dpr=Math.min(window.devicePixelRatio||1,2); const W=cv.clientWidth||360, H=180;
  cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.dpr=dpr;
  cacheArenaGfx();
  /* ==== [ANCRE: PREVIEW_MARCHE_NOIR_PAR_EFFET] — item demandé : "pour
     chaque effet" — un indice visuel distinct par consommable, sur ce même
     Canvas figé, sans nouveau code de dessin (le halo de flash existe déjà
     dans fighter(), ui-08, pour le combat réel). "shake" est un tremblement
     JOUÉ SUR PLUSIEURS FRAMES (jitter aléatoire à chaque appel) — invisible
     sur une trame unique figée, donc écarté ici au profit du halo, qui SE
     VOIT sur une image fixe. Droit de véto change l'ADVERSAIRE : c'est lui
     qui brille. Tout le reste est un avantage direct pour le joueur
     (banque, filet de sécurité, statistiques) : c'est lui qui brille. ==== */
  if(item&&item.id==='cons_veto') ARENA.flashOp=1; else ARENA.flashMe=1;
  /* ==== [FIN ANCRE] ==== */
  drawArena(0,true);
}
/* ==== [FIN ANCRE] ==== */
function scr_arena(){ const A=ARENA||{};
  return `<div class="scr">
   <div class="eyebrow center" style="margin-bottom:12px;font-size:12px;color:var(--text)">${esc(A.nmeName||'')} ${A.meFlag||''} VS ${A.opFlag||''} ${esc(A.nopName||'')}</div>
   <div class="card glass raise" style="padding:12px;border-color:var(--line);background:var(--panel2)">
     <div class="eyebrow center" style="font-size:9px;margin-bottom:6px">DOMINATION TERRITORIALE</div>
     <div style="height:6px;background:var(--sage);margin-bottom:20px;position:relative;overflow:hidden;border-radius:2px">
       <div id="ar-momentum" style="height:100%;width:50%;background:var(--blood);transition:width .4s ease"></div>
       <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--bg)"></div>
     </div>
     <div class="arena-hud" style="border-bottom:1px dashed var(--line);padding-bottom:16px;display:flex;justify-content:space-between">
       <div style="display:flex;flex-direction:column;align-items:flex-start">
         <span class="ah-name blood mono" style="font-size:13px">${esc(A.nmeName||'Toi')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Tête</span><div id="dm-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Corps</span><div id="dm-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Jambes</span><div id="dm-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
         </div>
       </div>
       <div style="display:flex;flex-direction:column;align-items:flex-end">
         <span class="ah-name sage mono" style="font-size:13px">${esc(A.nopName||'Adv.')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;align-items:flex-end">
           <div style="display:flex;align-items:center;gap:6px"><div id="do-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Tête</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Corps</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Jambes</span></div>
         </div>
       </div>
     </div>
     <canvas id="arena-cv" style="width:100%;height:220px;display:block;margin-top:16px;border:1px solid var(--line);background:var(--bg)"></canvas>
     <div class="arena-st" style="margin-top:16px"><div class="st-lbl">CARDIO</div><div class="st-lbl" style="text-align:right">CARDIO</div></div>
     <div class="arena-bars sm" style="margin-top:6px"><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-me" style="background:var(--gold)"></div></div><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-op" style="background:var(--gold)"></div></div></div>
     <div id="ar-log" class="mono muted small" style="margin-top:20px;min-height:48px;display:flex;flex-direction:column;justify-content:flex-end;border-left:3px solid var(--gold);padding-left:12px;line-height:1.4;padding-bottom:4px"></div>
   </div>
   <button class="btn ghost mt" style="border:1px solid var(--line)" onclick="CL.skipArena()">Couper la transmission vidéo ▸</button>
  </div>`; }
/* ==== [ANCRE: PREVIEW_MARCHE_NOIR_CANVA] — "fenêtre" ouverte au clic sur une
   tuile du Marché noir (scr_legends, ui-07 : CL.viewConsumablePreview) —
   même gabarit de carte que scr_arena ci-dessus (silhouettes debout dans
   l'octogone), sans le HUD de combat (dégâts par zone, cardio, momentum,
   journal texte) qui n'a pas de sens hors combat réel : juste le Canvas,
   le nom de l'objet, sa description et son effet chiffré (même formule que
   campFxLabel, ui-03 — le jeu affiche tout sur /20 sans jamais l'écrire,
   donc ni ici ni ailleurs). ==== */
function scr_consumable_preview(){
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===G._consumablePreviewId);
  if(!item) return `<div class="scr center intro"><p class="lede">Objet introuvable.</p><button class="btn ghost mt" onclick="CL.closeConsumablePreview()">Fermer</button></div>`;
  const meta=loadMetaStats(), pts=meta.legendPoints||0;
  const owned=!!meta.gauntletPendingConsumable, canAfford=pts>=item.cost && !owned;
  const fxTxt=item.fx?Object.entries(item.fx).map(([k,v])=>{
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
    return `${shown>0?'+':''}${shown} ${attrLabel(k)}`;
  }).join(', '):'';
  return `<div class="scr"><div class="bar"><span class="eyebrow">Marché noir — aperçu</span><span class="eyebrow x" onclick="CL.closeConsumablePreview()">✕</span></div>
   <h2 class="disp gold" style="font-size:20px">${item.name}</h2>
   <div class="card glass raise" style="padding:12px;border-color:var(--blood-d);background:var(--panel2)">
     <canvas id="shop-preview-cv" style="width:100%;height:180px;display:block;border:1px solid var(--line);background:var(--bg)"></canvas>
   </div>
   <div class="card mt" style="background:var(--panel2);padding:14px">
     <div class="muted small">${item.desc}</div>
     ${fxTxt?`<div class="mono small gold mt">${fxTxt} (actif pour toute la run)</div>`:''}
   </div>
   <button class="btn ghost mt" style="border-color:var(--blood);color:var(--blood)" onclick="CL.purchaseConsumable('${item.id}');CL.closeConsumablePreview();" ${canAfford?'':'disabled'}>${owned?'Déjà un consommable en attente':`Acheter — ${item.cost} pts`}</button>
   <button class="btn ghost mt" onclick="CL.closeConsumablePreview()">Fermer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
// ==== [ANCRE: CORRECTIF_COULEUR_ZONES_DEGATS] — bug remonté : le rouge
// (var(--blood)) était utilisé pour un simple seuil de dégâts CUMULÉS
// (v>28), qui devient quasi systématique dès le round 2-3 puisque ces
// valeurs ne redescendent jamais de tout le combat (contrairement à dmgA/
// dmgB, la vraie jauge de risque KO, qui se résorbe chaque round via
// RECUP_INTER_ROUND). Le rouge se confondait donc avec le flash de finition
// réel (ARENA.flashZoneId, déclenché uniquement sur un KO effectif) — un
// combattant "en rouge" en permanence sans jamais tomber. Sémantique
// corrigée, alignée sur l'attente : sauge = indemne, or = touché/blessé ;
// le rouge reste exclusivement réservé au flash de KO (flashZoneId
// ci-dessous), jamais à un simple cumul de dégâts.
const ARENA_ZONE_COLOR=v=>v>10?'var(--gold)':'var(--sage)';
/* mise à jour des barres HTML (plus de HP globaux) + momentum + points de dégâts par zone + terminal texte, à chaque frame */
function paintBars(){ if(!ARENA)return; const set=(id,v)=>{const e=document.getElementById(id); if(e)e.style.width=clamp(v,0,100)+'%';};
  set('st-me',ARENA.stMe); set('st-op',ARENA.stOp);
  if(ARENA.currentMomentum!==undefined) set('ar-momentum',ARENA.currentMomentum);
  const setZone=(id,v)=>{ const e=document.getElementById(id); if(e)e.style.background=ARENA_ZONE_COLOR(v); };
  if(ARENA.snapA){ setZone('dm-h',ARENA.snapA.h); setZone('dm-b',ARENA.snapA.b); setZone('dm-l',ARENA.snapA.l); }
  if(ARENA.snapB){ setZone('do-h',ARENA.snapB.h); setZone('do-b',ARENA.snapB.b); setZone('do-l',ARENA.snapB.l); }
  if(ARENA.flashZoneId){ const e=document.getElementById(ARENA.flashZoneId); if(e){ e.style.background='var(--blood)'; e.style.boxShadow='0 0 6px var(--blood)'; } }
  const logEl=document.getElementById('ar-log');
  if(logEl && ARENA.currentText && logEl.getAttribute('data-last')!==ARENA.currentText){
    logEl.innerHTML=`<div style="animation:fade .3s ease;color:var(--text)">${ARENA.currentText}</div>`;
    logEl.setAttribute('data-last',ARENA.currentText);
  }
}
