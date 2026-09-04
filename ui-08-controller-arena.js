"use strict";
/* CAGE LEGACY — js/ui-08-controller-arena.js
   ============================================================================
   Fichier 8/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Le registre des écrans (SCREENS), la boucle de rendu, et TOUT le contrôleur
   d'actions (CL) — c'est-à-dire chaque clic possible dans le jeu.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.

   Le rendu Canvas 2D de l'arène de combat, autrefois en fin de ce fichier,
   vit désormais dans ui-09-arena.js (F-07, hygiène technique — second
   découpage, ultérieur à celui-ci, cf. l'en-tête de ce fichier). Ce qui reste
   ici de ce côté-là (scr_arena, scr_fight_flash, scr_faith_fight_pending,
   scr_consumable_preview, setArenaCosmeticTheme/getArenaTheme) y est resté
   par nécessité : référencé par nom dans SCREENS ci-dessous, évalué au
   chargement du script — voir l'ancre CORRECTIF_ARENA_MOTEUR_DEPLACE plus
   loin dans ce fichier pour le détail.
   ============================================================================ */

const SCREENS={title:scr_title,intro:scr_intro,create:scr_create,hub:scr_hub,select:scr_select,camp:scr_camp,arena:scr_arena,fight_flash:scr_fight_flash,
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof,event:scr_event,plan:scr_plan,season:scr_season,toptier:scr_toptier,
  history:scr_history,beltLineage:scr_beltLineage,promo:scr_promo,pro_nickname:scr_pro_nickname,codex:scr_codex,mueChoice:scr_mueChoice,legend_detail:scr_legend_detail,class_choice:scr_class_choice,class_choice_31:scr_class_choice_31,
  fantasy_setup:scr_fantasySetup,allstars:scr_allstars,allstars_setup:scr_allstars_setup,vs_friend:scr_vs_friend,vs_friend_plan:scr_vs_friend_plan,
  contract_nego:scr_contract_nego,free_agency:scr_free_agency,champ_champ_offer:scr_champ_champ_offer,vs_friend_next:scr_vs_friend_next,press_conf:scr_press_conf,
  ach_preview:scr_ach_preview};

function currentGameMode(){
  return 'career';
}
/* Rythme de combat forcé par le mode (arbitrage A4, §3) : Gauntlet en
   intégral (round par round complet, BEAT_MS=1050 — c'est le format
   spectacle du jeu), Carrière en rapide (round par round, BEAT_MS=750).
   Faith ne lit plus fightPace pour décider de l'arène : elle ne l'atteint
   simplement jamais (scr_faith_fight_pending() la remplace, cf. plus bas),
   mais la valeur est quand même posée à 'instantane' par cohérence, pour
   qu'un futur code qui lirait G.settings.fightPace sans connaître le mode
   ne tombe jamais sur une valeur incohérente avec ce que Faith fait
   réellement (jamais d'arène round par round). Appelée UNE FOIS à l'entrée
   de chaque mode (finalizeFaithDraft/newCareer/startArcade et variantes),
   jamais reproposée au joueur ensuite. */
function forceFightPaceForMode(mode){
  if(!G.settings||typeof G.settings!=='object') G.settings={};
  G.settings.fightPace='rapide';
}
/* ==== [FIN ANCRE] ==== */

function fighterDisplayName(o,withNick){
  if(!o) return '';
  const full=o.name||[o.first,o.last].filter(Boolean).join(' ');
  return (withNick!==false && o.nick)?`${full} « ${o.nick} »`:full;
}
/* ==== [FIN ANCRE] ==== */

/* ============================== RENDER + CL =============================== */
function render(preserveScroll){ const app=document.getElementById('app'); if(!app)return;
  if(G && G.screen==='arena' && G.pending && !G.pending._flashShown
     && (((G.settings&&G.settings.fightPace)||'rapide')==='instantane')){
    G.pending._flashShown=true;
    G.pending.flashLines=buildFightFlashLines(G.pending.res);
    G.screen='fight_flash';
  }
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); if(!preserveScroll && window.scrollTo) window.scrollTo(0,0); }
function routeAfterOrgChange(){
  G.screen='hub'; save(); render();
}

function routeAfterCareerPending(){
  const p=G.pending;
  if(p&&p.classOffer) G.screen='class_choice';
  else if(p&&p.class31Offer) G.screen='class_choice_31';
  else if(p&&p.contractExpiry) G.screen='contract_nego';
  else if(p&&p.proOffer) G.screen='promo';
  else if(p&&p.topTierOffer) G.screen='toptier';
  else if(p&&p.promoOffer) G.screen='promo';
  else if(p&&p.champChampOfferReady) G.screen='champ_champ_offer';
  else if(p&&p.endOfSeason) G.screen='season';
  else G.screen='hub';
}
/* ==== [ANCRE: CORRECTIF_FOCUS_SAISIE] — bug trouvé : render() remplace
   app.innerHTML, donc l'<input> focalisé est détruit puis recréé à chaque
   frappe. render(true) préservait le scroll (comme annoncé) mais PAS le
   focus : sur desktop il fallait recliquer entre chaque lettre, sur mobile
   le clavier se refermait — les deux seuls champs texte du jeu (graine
   Gauntlet, prise signature nommée) étaient inutilisables. ==== */
function refocusInput(id){
  try{ const el=/** @type {HTMLInputElement|null} */(document.getElementById(id));
    if(el){ el.focus(); const n=el.value.length; el.setSelectionRange(n,n); } }catch(e){}
}
const CL={
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  /* ==== [ANCRE: V3_RANKINGS_P4P_TAB] — bascule d'onglet sur scr_rankings()
     (ui-06), cf. son ancre pour le détail. */
  setRankingsTab(tab){ G._rankingsTab=tab; render(); },
  /* ==== [FIN ANCRE] ==== */
  filterCodex(key,val){ if(!G.codexFilter) G.codexFilter={style:'all',rar:'all',status:'all'}; G.codexFilter[key]=val; render(); },
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
  toggleAttrHelp(k){ G._attrHelp=(G._attrHelp===k?null:k); render(true); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SUCCES_VITRINE_DIRECTE] — clic sur une tuile d'exploit ->
     "fenêtre" dédiée (scr_ach_preview, ui-07), même principe que
     CL.viewConsumablePreview ci-dessous pour le Marché noir, plutôt que le
     texte replié sur place utilisé auparavant. Pas de fenêtre Canvas ici :
     un succès n'a pas d'effet à visualiser dans l'octogone, contrairement
     à un consommable (buff/veto/filet de sécurité). ==== */
  /* ==== [ANCRE: CORRECTIF_RETOUR_ACH_PREVIEW] — bug trouvé : cette fenêtre
     codait son écran de retour en dur ('ach'), contrairement aux deux autres
     fenêtres du fichier (viewConsumablePreview/viewShopPreview ci-dessous),
     qui suivent toutes deux le pattern G._returnScreen avec une ancre
     expliquant précisément pourquoi coder l'écran en dur est à éviter. Sans
     conséquence tant que la vitrine des exploits n'est atteignable que d'un
     seul endroit — mais plus la seule des trois à ne pas suivre le pattern. ==== */
  viewAchPreview(achId){ G._achPreviewId=achId; G._returnScreen=G.screen; G.screen='ach_preview'; render(); },
  closeAchPreview(){ G.screen=G._returnScreen||'ach'; G._returnScreen=null; render(true); },
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
  /* ==== [ANCRE: CORRECTIF_COPIE_PROMISE] — bug trouvé : navigator.clipboard.
     writeText() renvoie une Promise — un refus de permission ou un contexte
     non sécurisé produit un rejet ASYNCHRONE que ce try/catch synchrone ne
     pouvait jamais attraper. "Lien copié !" s'affichait donc à tort, et le
     message de repli (écrit, utile) restait inatteignable : le joueur
     collait un presse-papier vide en croyant avoir le lien. ==== */
  copyExportedLink(){
    if(!G.exportedLink) return;
    if(!navigator.clipboard){ G.lastMsg="Copie automatique impossible — sélectionne le champ et copie-le manuellement."; render(); return; }
    navigator.clipboard.writeText(G.exportedLink).then(()=>{ G.lastMsg="Lien copié !"; render(); })
      .catch(()=>{ G.lastMsg="Copie automatique impossible — sélectionne le champ et copie-le manuellement."; render(); });
  },
  clearExportedCode(){ G.exportedCode=null; G.exportedName=null; G.exportedLink=null; render(); },
  setArenaTheme(themeId){ setArenaCosmeticTheme(themeId); render(); },
  leaveSandbox(){ if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; } G.fantasyActive=false; G.vsFriendActive=false; CL.go('hof'); },
  leaveAllStars(){ G.allstars=null; CL.go('hof'); },
  setFantasy(side,dir){
     const max=loadHOF().length-1;
     if(side===0){ let n=Math.min(G.fantasyA||0,max)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===Math.min(G.fantasyB!==undefined?G.fantasyB:1,max)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyA=n;
     } else { let n=Math.min(G.fantasyB!==undefined?G.fantasyB:1,max)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===Math.min(G.fantasyA||0,max)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyB=n; }
     render();
  },
  launchFantasyFight(){
     const list=loadHOF();
     const idxA=Math.max(0,Math.min(G.fantasyA||0,list.length-1));
     const idxB=Math.max(0,Math.min(G.fantasyB!==undefined?G.fantasyB:(list.length>1?1:0),list.length-1));
     const lA=list[idxA], lB=list[idxB];
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
  /* ==== [ANCRE: CORRECTIF_MELANGE_ALLSTARS] — bug trouvé : un comparateur
     aléatoire dans .sort() ne produit pas une permutation uniforme (et V8
     peut se comporter de façon incohérente sur un comparateur non
     transitif). Remplacé par le Fisher-Yates déjà utilisé ailleurs dans ce
     fichier (offerFaithOaths()), identique. ==== */
  launchAllStars(){
     if(!G.allstarsDraft || G.allstarsDraft.length!==8) return;
     const fullList=loadHOF();
     const top8=G.allstarsDraft.map(idx=>reconstructLegend(fullList[idx]));
     for(let i=top8.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [top8[i],top8[j]]=[top8[j],top8[i]]; }
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
       const lA=list[Math.max(0,Math.min(G.vsFriendSelA||0,list.length-1))];
       const lB=G.importedFriendLegend||list[Math.max(0,Math.min(G.vsFriendSelB!==undefined?G.vsFriendSelB:1,list.length-1))];
       /* ==== [ANCRE: CORRECTIF_VSFRIEND_PANTHEON_UNIQUE] — bug trouvé : si le
          Panthéon ne contient qu'une seule légende (et aucun code ami importé),
          list[1] vaut undefined et reconstructLegend(undefined) plante. Son
          cousin launchFantasyFight() gère déjà ce cas (repli sur list[0]),
          pas celui-ci. ==== */
       if(!lB){ G.lastMsg="Il faut deux légendes (ou un code ami) pour lancer un duel."; render(); return; }
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
     /* ==== [ANCRE: CORRECTIF_DOUBLE_VSFRIEND_PLAN] — voir chooseVsFriendPlan() :
        même verrou que choosePlan() (CORRECTIF_DOUBLE_RESOLUTION), réarmé à
        chaque nouvelle manche puisque c'est ce point d'entrée qui affiche à
        nouveau l'écran de tactique. ==== */
     G.vsFriendScore._resolved=false;
     G.screen='vs_friend_plan'; save(); render();
  },
  chooseVsFriendPlan(idx){
     /* ==== [ANCRE: CORRECTIF_DOUBLE_VSFRIEND_PLAN] — même verrou que
        choosePlan() (CORRECTIF_DOUBLE_RESOLUTION) : sans lui, un double-tap
        sur la carte de tactique incrémentait G.vsFriendScore.round deux fois
        pour une seule manche réellement jouée. ==== */
     if(G.vsFriendScore && G.vsFriendScore._resolved) return;
     const A=G.vsFriendLegendA, B=G.vsFriendLegendB;
     const combined=getExclusiveTactics(A).concat(TACTICS[A.style]||[]);
     const planObj=combined[idx]; if(!planObj) return;
     G.vsFriendScore._resolved=true;
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
    G.sel={o:offer.champion,read:'Combat historique pour une seconde couronne.',context:'CHAMP-CHAMP'};
    G.train=trainingOptions(G.f);
    G.screen='camp'; save(); render();
  },
  declineChampChampOffer(){
    G.f.champChampLastOfferDefenses=G.f.defenses;
    G.f.champChampOffer=null;
    G.lastMsg='Vous avez décliné le supercombat. Le président reviendra à la charge après deux défenses supplémentaires.';
    G.screen='hub'; save(); render();
  },
  chooseMue(styleId){ const r=triggerMueMartiale(G.f,styleId); G.lastMsg=r.msg||G.lastMsg;
    G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(1,3)){ applyAging(G.f); G.f._fy=0; }
    advanceRoster(); G.screen='hub'; save(); render(); },
  cont(){ if(load()){ setTheme(G.theme||'dark');
    // ==== [ANCRE: CORRECTIF_RETRAITE_FANTOME] — bug trouvé : cont() forçait
    // TOUJOURS l'écran 'hub' au chargement, sans jamais vérifier f.retired.
    // Un joueur qui rechargeait la page juste après sa retraite (l'écran
    // 'legacy' est sauvegardé, rien ne l'exclut de save()) atterrissait donc
    // dans le vestiaire avec un bouton de combat parfaitement cliquable —
    // pouvant enchaîner d'autres combats, dupliquer son entrée au Panthéon
    // et générer des points de Légende à volonté à chaque nouvelle "retraite".
    /* ==== [ANCRE: CORRECTIF_COMBAT_ORPHELIN] — bug trouvé : choosePlan()
       exécute resolveFight() PUIS save() avec G.screen='arena'. Le combat est
       donc intégralement appliqué et persisté avant que le joueur n'ait rien
       vu. cont() forçant le hub, un onglet tué pendant l'animation (banal sur
       mobile) faisait perdre TOUT afterResult() : en Faith le mois n'était
       jamais consommé et fightsThisYear jamais incrémenté ; en Gauntlet le
       palier n'avançait pas et l'adversaire déjà battu était reproposé ; en
       carrière une offre en attente était perdue. On reprend sur l'écran de
       résultat tant que G.pending n'a pas été consommé (cf.
       CORRECTIF_DOUBLE_AFTERRESULT). ==== */
    if(G.f && !G.f.retired && G.pending && !G.pending._consumed){ G.screen='result'; render(); return; }
    G.screen=(G.f && G.f.retired)?'legacy':'hub'; render(); } },
  draft(k,v){ G.draft[k]=v; if(k==='gender')G.draft.div=DIVISIONS[v][Math.min(3,DIVISIONS[v].length-1)].id; render(true); },
  draftIn(k,v){ G.draft[k]=v; },
  create(){ const d=G.draft; const f=makeFighter({gender:d.gender,div:d.div,style:d.style,countryKey:d.country,first:(d.first||'').trim()||undefined,age:RI(15,16),potential:RI(80,95),freshPlayer:true});
    f.stage='amateur'; f.org=0; f._fy=0;
    if(d.personality){ f.personality=d.personality;
      if(d.personality==='villain'){ f.hypeBonus=1.3; f.morale=clamp(f.morale-10,0,100); }
      else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    }
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
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; G.season={year:1,fights:[]}; checkAch();
    recordCareerStart(f);
    forceFightPaceForMode('career');
    G.screen='hub'; save(); render(); },
  fightSelect(){ startFightSelect(); },
  opp(i){ chooseOpponent(i); },
  train(i){ chooseTraining(i); },
  /* ==== [ANCRE: CORRECTIF_PERSISTANCE_ETAT_RUN] — rejoint la même grappe
     (ci-dessus dans ce fichier) : mutait G.selectedCampTier puis render()
     sans save(), rendant le choix à un rechargement de page. ==== */
  setCampTier(tierId){ G.selectedCampTier=tierId; save(); render(); },
  skipArena(){ CL.toResult(); },
  nextRound(){ if(!ARENA||!ARENA.roundPause||ARENA.basculePending) return; resumeArenaPlayback(); },
  /* ==== [ANCRE: V2-29] — une option choisie ne rend pas le même verdict
     pour deux joueurs : le succès est pondéré par l'attribut du joueur
     contre celui de l'adversaire sur ce point précis (resolveBasculeOption),
     jamais un simple tirage à plat. La conséquence est immédiate (une
     phrase) puis reste affichée jusqu'au tap suivant, qui reprend la
     lecture — jamais de second tap requis pour ça (règle V2-31 point 3,
     même esprit ici). */
  pickBascule(i){
    if(!ARENA||!ARENA.basculePending||ARENA.basculePending.resultMsg) return;
    const m=BASCULE_MOMENTS[ARENA.basculePending.kind]; const opt=m&&m.options[i]; if(!opt) return;
    const win=resolveBasculeOption(opt);
    ARENA.basculeCount=(ARENA.basculeCount||0)+1;
    if(win){
      /* ==== [ANCRE: CORRECTIF_BASCULE_RECOMPENSE_MORTE] — bug trouvé : la
         bonification de bourse posée ici sur G.fight.pursePenalty n'avait
         AUCUN effet — pursePenalty est lu par resolveFight() (ui-05), déjà
         exécuté par choosePlan() avant même que l'arène ne s'affiche. La
         récompense passe sur des canaux encore ouverts à ce stade : moral, et
         trace narrative dans le journal de l'année (Faith). ==== */
      G.f.morale=clamp((G.f.morale||60)+4,0,100);
      
    } else {
      G.f.morale=clamp((G.f.morale||60)-3,0,100);
    }
    ARENA.basculePending.resultMsg=win?opt.successMsg:opt.failMsg;
    renderArenaOverlay();
  },
  continueAfterBascule(){ if(!ARENA||!ARENA.basculePending) return; ARENA.basculePending=null; resumeArenaPlayback(); },
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
    } else {
      /* ==== [ANCRE: CORRECTIF_HANDLEEVENT_ATTRAPE_TOUT] — bug trouvé :
         l'attrape-tout final lançait proceedToFight() pour N'IMPORTE QUEL
         actionId inconnu, même hors de tout contexte de combat (G.fight
         absent). Un identifiant d'action mal formé ou une régression
         ailleurs se traduisait par un combat lancé sans adversaire. ==== */
      if(!G.fight){ G.screen='hub'; save(); render(); return; }
      proceedToFight();
    }
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
  /* ==== [ANCRE: FAITH_RECOVER_INJURY] — pendant du recoverInjury() carrière,
     mais décrémenté en MOIS (f.injury.left posé par faithCampChoose()) et
     routé par faithAdvanceMonth() plutôt que par un simple render(). Ne
     rappelle ni applyAging() ni advanceRoster() : le mode Faith les
     applique déjà une fois par an dans prepareFaithYearEnd(). ==== */
  choosePlan(idx){
    /* ==== [ANCRE: CORRECTIF_DOUBLE_RESOLUTION] — un double-tap sur la carte
       de tactique appelait resolveFight() deux fois : W/L, bourse, Elo,
       historique et dégâts crâniens appliqués deux fois pour UN combat. ==== */
    if(G.fight && G.fight._resolved) return;
    const combined=getExclusiveTactics(G.f).concat(TACTICS[G.f.style]||[]); const planObj=combined[idx]; if(!planObj)return;
    G.fight._resolved=true;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  /* ==== [ANCRE: CORRECTIF_PERSISTANCE_ETAT_RUN] — bug trouvé : toute une famille
     de méthodes mutait l'état de run (choix de camp, pacte, mise en jeu, refus du
     médecin, soins d'infirmerie, analyse ciblée, second souffle) puis appelait
     render() sans save(). La dernière sauvegarde datant de l'ENTRÉE dans l'écran,
     un rechargement de page rendait le choix. Cas le plus grave : healGauntletZone
     sauvegarde bien la dépense (saveMetaStats) mais pas le soin (sur G) — le joueur
     perdait ses points ET gardait ses séquelles. ==== */
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
    /* ==== [ANCRE: CORRECTIF_DOUBLE_AFTERRESULT] — même hasard matériel que
       CORRECTIF_DOUBLE_ENSHRINE (double-tap tactile, délai de tap iOS), sur le
       bouton le plus tapé du jeu. Sans verrou, un double-tap sur « Continuer »
       consommait DEUX mois de calendrier Faith, ou créditait DEUX fois le
       paiement de fin de run Gauntlet via finaliseGauntletRun(). Le drapeau
       vit sur G.pending (remplacé à chaque nouveau combat par resolveFight),
       donc il n'a jamais besoin d'être remis à zéro. ==== */
    if(G.pending){ if(G.pending._consumed) return; G.pending._consumed=true; }
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
    routeAfterCareerPending();
    save(); render(); },
  /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026).
     _draftSuffix vit sur f.signatureMove lui-même (pas sur G, comme
     G._pendingSeed) : la fiche peut être quittée et rouverte sans perdre la
     saisie en cours, tant qu'elle n'a pas été validée. render(true) même
     pattern que setGauntletSeed : préserve le scroll à chaque frappe. ==== */
  setSignatureSuffix(v){ const sm=G.f&&G.f.signatureMove; if(!sm||sm.locked) return;
    sm._draftSuffix=(v!==undefined&&v!==null)?String(v).slice(0,24):''; render(true); refocusInput('sig-suffix'); },
  lockSignatureSuffix(){ const sm=G.f&&G.f.signatureMove; if(!sm||sm.locked) return;
    const val=(sm._draftSuffix||'').trim(); if(!val) return;
    sm.customSuffix=val; sm.locked=true; delete sm._draftSuffix; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  acceptPromo(targetOrg){
    G.f.org=targetOrg||(G.f.org+1); G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0;
    G.f.champChampOffer=null;
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
    G.f.champChampOffer=null; G.f.defenses=0;
    G.f.contract=generateContract(G.f,orgId,false);
    applyOrgAdvancementBoost(G.f,orgId);
    G.roster=makeOrgRoster(G.f);
    if(orgId===6){ G.roster.forEach(o=>{ o.overall=clamp(o.overall+4,30,99); o.attrs.fightIQ=clamp(o.attrs.fightIQ+5,1,100); }); }
    routeAfterOrgChange(); },
  acceptPro(orgIdx,flavorName){ turnPro(); G.f.org=orgIdx||1; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.orgFlavor=flavorName||(ORG_FLAVORS[G.f.org]?pick(ORG_FLAVORS[G.f.org]):null);
    G.f.contract=generateContract(G.f,G.f.org,false);
    applyOrgAdvancementBoost(G.f,G.f.org); G.roster=makeOrgRoster(G.f,'PRO_TRANSITION'); if(G.pending)G.pending.proOffer=null;
    G.screen='pro_nickname'; save(); render(); },
  confirmProNickname(nick){
    const clean=(nick||'').trim()||(typeof earnNickname==='function'?earnNickname(G.f):'Le Guerrier');
    G.f.nick=clean; G._proNickDraft=null; routeAfterOrgChange(); },
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
    routeAfterCareerPending(); save(); render();
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
      routeAfterCareerPending(); save(); render();
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
      G.f.champChampOffer=null;
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
    routeAfterCareerPending(); save(); render();
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
    G.season.year++; G.season.fights=[]; if(G.pending) G.pending.endOfSeason=false; G.screen='hub'; save(); render(); },
  toLegacy(){
    if(G.f._enshrined){ G.screen='legacy'; render(); return; }
    if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus',JSON.stringify({style:G.f.style})); }catch(e){} }
    const sData=G.season||{year:1,fights:[]};
    const seasonEval=(sData.fights && sData.fights.length)?evaluateSeason(G.f,sData.fights):null;
    if(seasonEval){
      if(!G.f.seasonRecap) G.f.seasonRecap=[];
      G.f.seasonRecap.push({year:sData.year, W:seasonEval.stats.W, L:seasonEval.stats.L,
        koW:seasonEval.stats.koW, subW:seasonEval.stats.subW, decW:seasonEval.stats.decW,
        trophies:seasonEval.trophies.map(t=>t.lbl), age:G.f.age, org:G.f.org, divName:G.f.divName});
      G.season.fights=[];
    }
    G.f.retired=true; enshrine(G.f); syncPlayerSkillsToCodex(G.f); G.f._enshrined=true;
    G.screen='legacy'; save(); render();
  },
  /* ==== [ANCRE: CORRECTIF_RETRAITE_FANTOME_PURGE] — Lot C01/2026 §C12 :
     quitter définitivement l'écran de retraite ("Retour au menu") laissait
     la sauvegarde de carrière (retired:true, _enshrined:true) intacte dans
     localStorage. go('title') seul ne persiste rien (pas de save()), mais
     tout rechargement ou "Reprendre le dossier" (cont(), qui appelle
     load()) relisait cette même sauvegarde figée en fin de carrière — le
     joueur retombait sur l'écran de retraite qu'il venait de quitter.
     L'entrée au Panthéon (enshrine(), HOF_KEY) est déjà persistée à part,
     hors de portée de wipe() (voir state/state-hof.js) : purger la
     sauvegarde de carrière ici est donc sans risque pour elle. Après
     purge, hasSave() renvoie faux et cont() ne peut plus jamais router
     vers 'legacy'. ==== */
  exitLegacy(){ wipe(); const t=G.theme; G={theme:t,screen:'title'}; setTheme(t); render(); },
  newCareer(){ wipe(); const t=G.theme; G={theme:t,draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}}; setTheme(t); CL.go('create'); },
  exportSave(){ try{ const blob=JSON.stringify(G); const ta=document.createElement('textarea'); ta.value=blob; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); alert('Sauvegarde copiée — colle-la dans un fichier texte pour la garder.'); }catch(e){ prompt('Copie ce texte :',blob); }
      document.body.removeChild(ta); }catch(e){ alert('Export impossible.'); } },
  /* ==== [ANCRE: CORRECTIF_IMPORT_ROUTAGE] — bug trouvé : ce contrôleur
     imposait toujours G.screen='hub', un copier-coller d'une ligne déjà
     écrite (et depuis corrigée) 60 lignes plus haut dans cont(). Importer
     une sauvegarde Faith déposait le joueur sur le hub CARRIÈRE avec un
     combattant Faith ; importer une sauvegarde retraitée reproduisait
     exactement le bug fantôme de l'ancre CORRECTIF_RETRAITE_FANTOME
     (vestiaire avec bouton de combat cliquable, doublons possibles au
     Panthéon) ; importer une sauvegarde figée en plein combat (G.pending
     non consommé, cf. CORRECTIF_COMBAT_ORPHELIN) perdait le résultat.
     Même routage que cont(), pas un second calcul divergent. ==== */
  importSave(){ const s=prompt('Colle ta sauvegarde ici :'); if(!s)return; try{ const parsed=JSON.parse(s); if(!parsed||typeof parsed!=='object') throw new Error('invalid'); G=migrate(parsed); if(!validateState()) throw new Error('corrupt'); setTheme(G.theme||'dark');
    if(G.f && !G.f.retired && G.pending && !G.pending._consumed){ G.screen='result'; save(); render(); return; }
    G.screen=(G.f && G.f.retired)?'legacy':'hub'; save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
};
window.CL=CL;
/* ==== [ANCRE: CORRECTIF_ARENA_MOTEUR_DEPLACE] — F-07, hygiène : le moteur de
   rendu Canvas 2D autonome (état ARENA, boucle d'animation, particules,
   silhouettes, aberration chromatique, moments de bascule) a déménagé dans
   ui-09-arena.js, chargé juste après ce fichier. Restent ici : tout ce qui
   est référencé PAR NOM dans l'objet SCREENS ci-dessus (évalué au chargement
   du script, donc avant que ui-09 n'existe si l'ordre était inversé) — les
   écrans scr_fight_flash/scr_faith_fight_pending/scr_arena/
   scr_consumable_preview et, avec eux, tout ce qui leur est intimement lié
   (FFP/startFaithFightPending/finishFaithFightPending, buildFightFlashLines,
   les autres écrans du temps de titre Faith physiquement voisins dans
   l'ancien fichier) — ainsi que setArenaCosmeticTheme()/getArenaTheme(),
   gardés ici par choix explicite (cf. ANCRE CORRECTIF_ARENA_THEMES_DEPLACE
   plus bas). ==== */
/* ==== [ANCRE: V2-28] — résumé du Rythme "Instantané" : trois lignes
   (le meilleur moment, le tournant, la fin), tirées du log réel du
   combat déjà simulé — jamais un texte générique. "Meilleur moment" =
   le plus grand écart de momentum entre deux événements consécutifs ;
   "le tournant" = le premier événement où le momentum franchit
   l'équilibre (50) après le début du combat, à défaut l'événement du
   milieu ; "la fin" = l'événement de finition, ou le dernier du log.
 * @param {object} res @returns {string[]} */
function buildFightFlashLines(res){
  const log=(res && res.log && res.log.length)?res.log:[];
  const clean=t=>String(t||'').replace(/^\[\d+:\d+\]\s*/,'');
  if(!log.length) return ['Le combat s’est résolu directement, sans temps mort.'];
  let best=log[0], bestSwing=-1, prevM=50, tournant=null;
  for(const L of log){
    const m=(L.momentum!=null)?L.momentum:prevM;
    const swing=Math.abs(m-prevM);
    if(swing>bestSwing){ bestSwing=swing; best=L; }
    if(tournant===null && (prevM-50)*(m-50)<0) tournant=L;
    prevM=m;
  }
  if(!tournant) tournant=log[Math.floor(log.length/2)];
  const finLog=log.find(L=>L.finish)||log[log.length-1];
  const lines=[clean(best.text),clean(tournant.text),clean(finLog.text)];
  return lines.filter((t,i)=>t && lines.indexOf(t)===i);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: CORRECTIF_ARENA_THEMES_DEPLACE] — F-05, hygiène : ARENA_THEMES
   (donnée pure) a déménagé dans data-content.js (chargé avant ce fichier,
   même ancre LOT12_COSMETIQUE_ARENE conservée là-bas). setArenaCosmeticTheme()
   et getArenaTheme() restent ici : ce sont les seuls points d'accès. ==== */
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
/* ==== [ANCRE: V2-28] — écran du Rythme "Instantané" : résultat direct,
   jamais d'animation canvas. ==== */
function scr_fight_flash(){
  const lines=(G.pending&&G.pending.flashLines)||[];
  const meWin=!!(G.pending&&G.pending.win);
  return `<div class="scr center intro">
   <div class="eyebrow" style="color:${meWin?'var(--pos)':'var(--neg)'}">${meWin?'VICTOIRE':'DÉFAITE'}</div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;text-align:left">
     ${lines.map(l=>`<div class="card" style="padding:12px;background:var(--panel2)"><div class="small">${esc(l)}</div></div>`).join('')}
   </div>
   <button class="btn primary mt" style="width:100%;height:52px;font-size:16px" onclick="CL.toResult()">VOIR LE RÉSULTAT</button>
  </div>`;
}

function scr_arena(){ const A=ARENA||{};
  /* ==== [CORRECTIF V2-06] — la cage reste sombre dans les deux ambiances
     (V2-01), mais son HUD (chrono/rounds/jauges — ici noms, zones de
     dégâts, cardio) passe à un contraste renforcé, texte blanc pur plutôt
     que var(--text)/var(--muted) : c'est un affichage lu en un coup d'œil
     pendant l'action, pas du texte de lecture posée. Les jauges elles-
     mêmes étaient déjà en aplats pleins (ARENA_ZONE_COLOR, plus bas),
     jamais de dégradé — rien à corriger de ce côté. ==== */
  return `<div class="scr">
   <div class="eyebrow center" style="margin-bottom:12px;font-size:12px;color:#FFFFFF">${esc(A.nmeName||'')} ${A.meFlag||''} VS ${A.opFlag||''} ${esc(A.nopName||'')}</div>
   <div class="card glass raise" style="padding:12px;border-color:var(--line);background:var(--panel2)">
     <div class="eyebrow center" style="font-size:9px;margin-bottom:6px;color:#FFFFFF">DOMINATION TERRITORIALE</div>
     <div style="height:6px;background:var(--sage);margin-bottom:20px;position:relative;overflow:hidden;border-radius:2px">
       <div id="ar-momentum" style="height:100%;width:50%;background:var(--blood);transition:width .4s ease"></div>
       <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--bg)"></div>
     </div>
     <div class="arena-hud" style="border-bottom:1px dashed var(--line);padding-bottom:16px;display:flex;justify-content:space-between">
       <div style="display:flex;flex-direction:column;align-items:flex-start">
         <span class="ah-name blood mono" style="font-size:13px">${esc(A.nmeName||'Toi')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px">Tête</span><div id="dm-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px">Corps</span><div id="dm-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px">Jambes</span><div id="dm-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
         </div>
       </div>
       <div style="display:flex;flex-direction:column;align-items:flex-end">
         <span class="ah-name sage mono" style="font-size:13px">${esc(A.nopName||'Adv.')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;align-items:flex-end">
           <div style="display:flex;align-items:center;gap:6px"><div id="do-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px;text-align:right">Tête</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px;text-align:right">Corps</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:11px;color:#FFFFFF;width:44px;text-align:right">Jambes</span></div>
         </div>
       </div>
     </div>
     <canvas id="arena-cv" style="width:100%;height:220px;display:block;margin-top:16px;border:1px solid var(--line);background:var(--bg)"></canvas>
     <div class="arena-st" style="margin-top:16px"><div class="st-lbl" style="color:#FFFFFF">CARDIO</div><div class="st-lbl" style="text-align:right;color:#FFFFFF">CARDIO</div></div>
     <div class="arena-bars sm" style="margin-top:6px"><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-me" style="background:var(--gold)"></div></div><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-op" style="background:var(--gold)"></div></div></div>
     <div id="ar-log" class="mono muted small" style="margin-top:20px;min-height:48px;display:flex;flex-direction:column;justify-content:flex-end;border-left:3px solid var(--gold);padding-left:12px;line-height:1.4;padding-bottom:4px"></div>
   </div>
   <button class="btn ghost mt" style="border:1px solid var(--line)" onclick="CL.skipArena()">Passer au verdict ▸</button>
  </div>`; }
