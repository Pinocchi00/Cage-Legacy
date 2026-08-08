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
  draft:scr_draft,arcadehub:scr_arcadehub,gameover:scr_gameover,history:scr_history,beltLineage:scr_beltLineage,promo:scr_promo,codex:scr_codex,legends:scr_legends,mueChoice:scr_mueChoice,scenarios:scr_scenarios,legend_detail:scr_legend_detail,class_choice:scr_class_choice,class_choice_31:scr_class_choice_31,
  fantasy_setup:scr_fantasySetup,allstars:scr_allstars,allstars_setup:scr_allstars_setup,vs_friend:scr_vs_friend,vs_friend_plan:scr_vs_friend_plan,arcade_upgrades:scr_arcade_upgrades,
  faith_draft:scr_faith_draft,faith_hub:scr_faith_hub,faith_event:scr_faith_event,faith_year_end:scr_faith_year_end,
  contract_nego:scr_contract_nego,free_agency:scr_free_agency,champ_champ_offer:scr_champ_champ_offer,champ_champ_decision:scr_champ_champ_decision,vs_friend_next:scr_vs_friend_next,press_conf:scr_press_conf,
  gauntlet_menu:scr_gauntlet_menu};

/* ============================== RENDER + CL =============================== */
function render(preserveScroll){ const app=document.getElementById('app'); if(!app)return;
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); if(!preserveScroll && window.scrollTo) window.scrollTo(0,0); }
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
  purchaseUnlock(itemId){ const r=purchaseLegendUnlock(itemId); G.lastMsg=r.msg; render(); },
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
    save(); render(); },
  choosePlan(idx){ const combined=getExclusiveTactics(G.f).concat(TACTICS[G.f.style]||[]); const planObj=combined[idx]; if(!planObj)return;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  toResult(){ stopArena(); G.screen='result'; save(); render(); },
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
      if(G.arcade.mode==='boss_run'){
        const koOnlyFail=G.arcade.condition==='ko_only' && win && G.pending.method && !G.pending.method.startsWith('KO');
        // ==== [ANCRE: CORRECTIF_BOSSRUN_RAISON_ELIMINATION] — bug remonté : une
        // victoire par décision/soumission en Boss Run (mode KO uniquement)
        // était traitée comme une élimination SANS AUCUNE explication — l'écran
        // affichait juste "R.I.P." comme après une vraie défaite, alors que le
        // combat venait d'être gagné. On mémorise désormais la vraie raison
        // pour que scr_gameover puisse distinguer les deux cas.
        if(!win || koOnlyFail){ G.arcade.active=false; G.arcade.eliminatedReason=koOnlyFail?'no_ko':'loss'; G.screen='gameover'; save(); render(); return; }
        G.arcade.streak++;
        if(G.arcade.streak>=G.arcade.target){ G.arcade.active=false; G.arcade.victory=true; G.screen='gameover'; save(); render(); return; }
        G.f.form=Math.min(100,G.f.form+20);
        G.arcade.opponent=genBossOpponent(G.arcade.streak);
        G.screen='arcadehub'; save(); render(); return;
      }
      if(G.arcade.mode==='ladder_100'){
        if(!win){
          const earned=Math.max(2,Math.round((101-G.arcade.rank)*0.8));
          const meta=loadMetaStats(); meta.legendPoints=(meta.legendPoints||0)+earned; saveMetaStats(meta);
          G.arcade.active=false; G.screen='gameover'; save(); render(); return;
        }
        G.arcade.fightsDone=(G.arcade.fightsDone||0)+1;
        // ==== [ANCRE: CORRECTIF_LADDER_RANG] — bug trouvé : seul G.arcade.rank
        // (le rang du joueur) était mis à jour ; le PNJ vaincu gardait son
        // ancien ladderRank, désormais "occupé" par le joueur. Un futur
        // matchmaking recherchant ce rang exact (genWTUMMAOpponent) pouvait
        // retomber sur ce même PNJ déjà battu. Échange explicite des rangs.
        const oldRank=G.arcade.rank;
        G.arcade.rank=G.arcade.opponent.ladderRank; // le joueur prend la place du vaincu
        G.arcade.opponent.ladderRank=oldRank;
        if(G.arcade.rank===1){
          const meta=loadMetaStats(); meta.legendPoints=(meta.legendPoints||0)+80; saveMetaStats(meta);
          G.arcade.active=false; G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
        }
        G.f.form=Math.min(100,G.f.form+20);
        generateArcadeUpgrades();
        G.screen='arcade_upgrades'; save(); render(); return;
      }
      // ==== Bracket 64 (WTUMMA) ====
      if(!win){
        const points={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
        const meta=loadMetaStats();
        meta.legendPoints=(meta.legendPoints||0)+(points[G.arcade.tournament.roundStep]||2);
        saveMetaStats(meta);
        G.arcade.active=false; G.screen='gameover'; save(); render(); return;
      }
      const wonTournament=advanceWTUMMABracket();
      if(wonTournament){
        const meta=loadMetaStats();
        meta.wtNemesis={name:G.f.name,nick:G.f.nick,flag:G.f.flag,overall:G.f.overall,
          attrs:JSON.parse(JSON.stringify(G.f.attrs)),skills:[...G.f.skills],style:G.f.style,div:G.f.div};
        const points={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
        meta.legendPoints=(meta.legendPoints||0)+(points[7]);
        saveMetaStats(meta);
        G.arcade.active=false; G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
      }
      G.f.form=Math.min(100,G.f.form+20);
      generateArcadeUpgrades();
      G.screen='arcade_upgrades'; save(); render(); return;
    }
    routeAfterCareerPending();
    save(); render(); },
  startArcade(){ injectExtendedArchetypes(); G.arcade={active:true,streak:0,target:5,pool:buildArcadePool()}; G.screen='draft'; save(); render(); },
  startBossRun(){ startBossRun(); },
  startLadder100(){ injectExtendedArchetypes(); G.arcade={active:true,mode:'ladder_100',rank:100,victory:false,fightsDone:0,pool:buildArcadePool()}; G.screen='draft'; save(); render(); },
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
  selectDraft(i){ G.f=G.arcade.pool[i];
    if(G.arcade.mode==='boss_run'){ G.arcade.opponent=genBossOpponent(0); G.screen='arcadehub'; save(); render(); return; }
    if(G.arcade.mode==='ladder_100'){ G.arcade.ladder=buildWTUMMALadder(G.f.div); G.arcade.opponent=genWTUMMAOpponent(); G.screen='arcadehub'; save(); render(); return; }
    G.arcade.tournament=buildWTUMMABracket(G.f);
    const playerMatch=G.arcade.tournament.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
    G.arcade.opponent=playerMatch.a.id===G.f.id?playerMatch.b:playerMatch.a;
    G.screen='arcadehub'; save(); render(); },
  pickArcadeTrain(idx){ if(G.arcade.upgradesChosen.train) return; applyDeltas(G.f,G.arcade.trainOpts[idx].d); G.arcade.upgradesChosen.train=true;
    if(G.arcade.mode==='ladder_100') G.arcade.opponent=genWTUMMAOpponent();
    CL.go('arcadehub'); },
  pickArcadeSkill(idx){ if(G.arcade.upgradesChosen.skill) return; if(idx>=0) grantSkill(G.f,G.arcade.skillOpts[idx]); G.arcade.upgradesChosen.skill=true; render(); },
  retryArcade(){
    const prevMode=G.arcade&&G.arcade.mode;
    if(prevMode==='ladder_100') CL.startLadder100();
    else if(prevMode==='boss_run') CL.startBossRun();
    else CL.startArcade();
  },
  fightArcade(){ resolveArcadeFight(); },
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
    if(G.pending) G.pending.promoOffer=false;
    routeAfterOrgChange();
  },
  declineTopTier(){
    G.f.promoCooldown=2;
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
  declinePro(){ G.f.proOfferCooldown=G.f._mentorFastTrack?2:3; if(G.pending)G.pending.proOffer=null; routeAfterOrgChange(); },
  negoRenew(){
    G.f.contract=generateContract(G.f,G.f.org,false);
    if(G.pending) G.pending.contractExpiry=false;
    G.lastMsg="Contrat renouvelé (4 combats).";
    if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
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
      if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
    } else {
      G.lastMsg="Négociations rompues. L\u2019organisation refuse vos conditions et vous libère.";
      CL.negoMarket(true);
    }
  },
  negoMarket(forcedPenalty){
    const f=G.f; const offers=[];
    const canUp=canPromote(f); const agentBonus=(f.agentCut>0);
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
      offers.push({org:nextOrg,flavor:ORG_FLAVORS[nextOrg]?pick(ORG_FLAVORS[nextOrg]):(ORGS[nextOrg]||'Ligue supérieure'),contract:generateContract(f,nextOrg,false),desc:"La ligue supérieure veut vous signer."});
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
    if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
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
  toLegacy(){ if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus',JSON.stringify({style:G.f.style})); }catch(e){} }
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
    G.f.retired=true; enshrine(G.f); syncPlayerSkillsToCodex(G.f); G.screen='legacy'; save(); render(); },
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
function buildTimeline(){
  const res=G.pending.res, you=G.f, opp=G.fight.opp, meWin=G.pending.win;
  const log=(res.log&&res.log.length)?res.log:[];
  const beats=log.map(L=>({phase:L.phase,by:L.by,round:L.r,finish:L.finish,method:L.method,
    text:L.text,momentum:L.momentum,snapA:L.snapA,snapB:L.snapB}));
  if(isDecisionLike(res.method)) beats.push({phase:'bell',finish:true,method:res.method,round:res.round||3,text:'[00:00] Fin du combat. Décision des juges.'});
  ARENA={beats,idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    stMe:100,stOp:100,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:res.method,meWin,
    currentMomentum:50,snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0},finishZone:res.zone||null,
    nmeName:you.first,nopName:opp.first,meFlag:you.flag,opFlag:opp.flag};
}
function cacheArenaGfx(){
  const A=ARENA, ctx=A.ctx, W=A.W, H=A.H;
  const topY=H*0.30, topL=W*0.08, topR=W*0.92, botL=W*0.03, botR=W*0.97, gY=H-16, gY2=H-6;
  A._geom={topY,topL,topR,botL,botR,gY,gY2,W,H};
  const spot=ctx.createRadialGradient(W*0.5,topY*0.3,0,W*0.5,topY*0.3,W*0.7);
  spot.addColorStop(0,'rgba(255,225,170,.34)'); spot.addColorStop(0.5,'rgba(255,225,170,.12)'); spot.addColorStop(1,'rgba(0,0,0,0)');
  A._spotGrad=spot;
  A._bleacherFill=[]; A._bleacherDots=[];
  for(let r=0;r<6;r++){ A._bleacherFill.push(`rgba(58,49,38,${0.55+r*0.06})`); A._bleacherDots.push(`rgba(190,140,105,${0.35+r*0.05})`); }
  A._theme=getArenaTheme();
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
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.t0=performance.now(); ARENA.pauseOffset=0; ARENA.roundPause=false;
  ARENA.noise=makeNoisePattern(ctx);
  cacheArenaGfx();
  const total=ARENA.beats.length*BEAT_MS;
  const loop=(now)=>{ if(ARENA.roundPause) return; const el=now-ARENA.t0-ARENA.pauseOffset; const bi=Math.min(ARENA.beats.length-1,Math.floor(el/BEAT_MS));
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
    drawArena((el%BEAT_MS)/BEAT_MS); paintBars();
    if(el>=total){ ARENA.done=true; drawArena(1,true); ARENA.to=setTimeout(()=>CL.toResult(),1300); return; }
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
  if(b.finish){ if(b.method&&b.method.startsWith('KO')){ if(A.meWin){A.fall=2;} else {A.fall=1;} }
    else if(b.method&&b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; }
    if(A.finishZone){ const zoneLetter=A.finishZone==='tête'?'h':A.finishZone==='corps'?'b':'l';
      const loserPrefix=A.meWin?'do':'dm'; A.flashZoneId=`${loserPrefix}-${zoneLetter}`; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
  A.currentText=b.text; A.currentMomentum=b.momentum;
  if(b.snapA) A.snapA=b.snapA; if(b.snapB) A.snapB=b.snapB;
}
function fighter(ctx,x,groundY,face,color,o){ // o: {lunge,flash,shake,fallen,grounded,phase,top,tap}
  ctx.save();
  const sh=o.shake?((Math.random()-0.5)*4):0;
  x+=face*(o.lunge*14)+sh;
  const bob=Math.sin(performance.now()/240 + (face>0?0:1))*2;
  if(o.grounded){
    if(!o.top){
      // Sur le dos (garde) — buste allongé, tête décalée, jambes relevées
      ctx.translate(x, groundY-5);
      ctx.fillStyle=o.flash?'#fff':color; ctx.globalAlpha=.95;
      ctx.beginPath(); ctx.ellipse(0,0,30,9,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-face*25,-2,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=color; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(0,-20); ctx.lineTo(-face*15,-15); ctx.stroke();
    } else {
      // Au-dessus (dominant) — buste vertical, bras qui contrôle/frappe
      ctx.translate(x-face*8, groundY-22);
      ctx.fillStyle=o.flash?'#fff':color; ctx.strokeStyle=o.flash?'#fff':color;
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
  const col=o.flash?'#fff':color;
  ctx.strokeStyle=col; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-3,4); ctx.lineTo(-10,46); ctx.moveTo(4,4); ctx.lineTo(12,46); ctx.stroke();
  ctx.lineWidth=15; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,26); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-20,9,0,Math.PI*2); ctx.fill();
  ctx.lineWidth=6;
  const reach=o.lunge;
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
  ctx.fillStyle=o.flash?'#fff':color; ctx.beginPath(); ctx.arc(face*(10+reach*20),-8+reach*4,4.5,0,Math.PI*2); ctx.fill();
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
  {id:'crimson',name:'Arène Écarlate',floorColors:['#2a0a0a','#170505'],railColor:'#E8442F',padColor:'#1a0303'}
];
function setArenaCosmeticTheme(themeId){ G.arenaCosmetic=themeId; save(); }
function getArenaTheme(){ return ARENA_THEMES.find(t=>t.id===(G.arenaCosmetic||'classic'))||ARENA_THEMES[0]; }
/* ==== [FIN ANCRE] ==== */
function drawArena(frac,freeze){ const A=ARENA, ctx=A.ctx; if(!ctx||!A._geom)return; const {W,H,topY,topL,topR,botL,botR,gY,gY2}=A._geom;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=A._spotGrad; ctx.fillRect(0,0,W,topY);
  const bleacherRows=6, rowH=topY/bleacherRows;
  for(let r=0;r<bleacherRows;r++){ const ry=r*rowH, rh=rowH-1;
    ctx.fillStyle=A._bleacherFill[r]; ctx.fillRect(0,ry,W,rh);
    ctx.fillStyle=A._bleacherDots[r];
    const dots=14+r*3;
    for(let d=0;d<dots;d++){ const dx=(d/dots)*W+Math.sin(d+r)*3;
      ctx.beginPath(); ctx.arc(dx,ry+rh*0.5,1.6,0,Math.PI*2); ctx.fill(); }
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
  const isSubDanger=grounded && A.currentText && (A.currentText.includes('soum')||A.currentText.includes('clé')||A.currentText.includes('étrangl'));
  const foOp=A._foOp, foMe=A._foMe;
  foOp.lunge=A.lungeOp*(1-frac); foOp.flash=A.flashOp>0; foOp.shake=A.shakeOp>0; foOp.fallen=A.fall===2;
  foOp.grounded=grounded; foOp.phase=A.curPhase; foOp.top=A.curTop==='op'; foOp.tap=isSubDanger&&A.curTop!=='op';
  foMe.lunge=A.lungeMe*(1-frac); foMe.flash=A.flashMe>0; foMe.shake=A.shakeMe>0; foMe.fallen=A.fall===1;
  foMe.grounded=grounded; foMe.phase=A.curPhase; foMe.top=A.curTop==='me'; foMe.tap=isSubDanger&&A.curTop!=='me';
  fighter(ctx, xOp, gY, -1, '#6E8478', foOp);
  fighter(ctx, xMe, gY, 1, '#B23B36', foMe);
  if(isSubDanger && !A.done){ ctx.save(); ctx.textAlign='center'; ctx.fillStyle='#E8442F'; ctx.font="700 12px 'Oswald'"; ctx.fillText('⚠ DANGER SOUMISSION',W/2,H*0.45); ctx.restore(); }
  A.flashMe=Math.max(0,A.flashMe-0.5); A.flashOp=Math.max(0,A.flashOp-0.5);
  A.shakeMe=Math.max(0,A.shakeMe-0.5); A.shakeOp=Math.max(0,A.shakeOp-0.5);
  A.lungeMe*=0.86; A.lungeOp*=0.86;
  ctx.fillStyle=A._vignetteGrad; ctx.fillRect(0,0,W,H);
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  const rnd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = A.curPhase==='sol'?'SOL':(A.curPhase==='clinch'?'CLINCH':'DEBOUT');
  if(A.done){ label = A.method==='Égalité'?'ÉGALITÉ':isDecisionLike(A.method)?'AUX POINTS':(A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rnd+' · '+label), W/2, 20);
  if(A.tap){ ctx.fillStyle='#C6A15B'; ctx.font="700 13px 'Oswald'"; ctx.fillText('TAP !', A.tap===1?W*0.34:W*0.66, gY-70); }
}
function stopArena(){ if(ARENA){ if(ARENA.raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(ARENA.raf); if(ARENA.to)clearTimeout(ARENA.to); } }
function scr_arena(){ const A=ARENA||{};
  return `<div class="fade">
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
