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
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof,event:scr_event,plan:scr_plan,season:scr_season,toptier:scr_toptier,opponent_card:scr_opponent_card,
  draft:scr_draft,arcadehub:scr_arcadehub,arcade_plan:scr_arcade_plan,gameover:scr_gameover,history:scr_history,beltLineage:scr_beltLineage,promo:scr_promo,codex:scr_codex,legends:scr_legends,mueChoice:scr_mueChoice,scenarios:scr_scenarios,legend_detail:scr_legend_detail,class_choice:scr_class_choice,class_choice_31:scr_class_choice_31,
  fantasy_setup:scr_fantasySetup,allstars:scr_allstars,allstars_setup:scr_allstars_setup,vs_friend:scr_vs_friend,vs_friend_plan:scr_vs_friend_plan,arcade_upgrades:scr_arcade_upgrades,
  faith_draft:scr_faith_draft,faith_hub:scr_faith_hub,faith_event:scr_faith_event,faith_year_end:scr_faith_year_end,faith_epilogue:scr_faith_epilogue,faith_oath:scr_faith_oath,faith_retire:scr_faith_retire,faith_legends:scr_faith_legends,faith_offer:scr_faith_offer,faith_contacts:scr_faith_contacts,faith_press_conf:scr_faith_press_conf,faith_pesee:scr_faith_pesee,faith_buildup:scr_faith_buildup,faith_camps:scr_faith_camps,faith_home:scr_faith_home,faith_fight_pending:scr_faith_fight_pending,faith_nemesis_consecration:scr_faith_nemesis_consecration,faith_coach_detail:scr_faith_coach_detail,faith_coach_choice:scr_faith_coach_choice,faith_sparring_detail:scr_faith_sparring_detail,
  faith_title_merit:scr_faith_title_merit,faith_title_negotiation:scr_faith_title_negotiation,faith_title_consecration:scr_faith_title_consecration,faith_card:scr_faith_card,faith_archives:scr_faith_archives,
  contract_nego:scr_contract_nego,free_agency:scr_free_agency,champ_champ_offer:scr_champ_champ_offer,champ_champ_decision:scr_champ_champ_decision,vs_friend_next:scr_vs_friend_next,press_conf:scr_press_conf,
  gauntlet_menu:scr_gauntlet_menu,bracket_view:scr_bracket_view,archetype_pantheon:scr_archetype_pantheon,boss_reveal:scr_boss_reveal,ascension_tower:scr_ascension_tower,coaching_round:scr_coaching_round,camp_identity_pick:scr_camp_identity_pick,consumable_preview:scr_consumable_preview,ach_preview:scr_ach_preview,shop_preview:scr_shop_preview};

/* ==== [ANCRE: V3_GAME_MODE] — Plan V3 LOT 1 §P02/§P07, arbitrage A4 :
   point de vérité unique du mode courant, remplace la lecture éparpillée
   de G.f.gameMode/G.arcade. Gauntlet se reconnaît à G.arcade.active (posé
   par startArcade/startBossRun/startLadder100, jamais par gameMode) ; Faith
   à f.gameMode==='faith' (finalizeFaithDraft) avec un repli sur le nom
   d'écran pour faith_draft/faith_home (avant que G.f n'existe) — même
   logique que le test _enFaith de render() avant ce lot. Carrière classique
   est le défaut : aucun marqueur dédié ne lui correspond, elle n'a jamais
   eu besoin d'en poser un tant qu'aucun autre mode ne partageait son
   apparence. */
function currentGameMode(){
  /* ==== [ANCRE: CORRECTIF_MODE_FIN_DE_RUN] — bug trouvé : G.arcade.active
     est posé à false par finaliseGauntletRun() AVANT que G.screen ne passe à
     'gameover' — au moment même où le joueur voit l'écran de fin de run
     (victoire, élimination, tour d'Ascension), currentGameMode() ne le
     reconnaissait déjà plus comme Gauntlet et data-mode basculait sur
     'career' : le climax du mode perdait sa palette. ==== */
  if(G && G.arcade && (G.arcade.active || G.screen==='gameover' || G.screen==='ascension_tower')) return 'gauntlet';
  const sName=String((G&&G.screen)||'');
  if((G&&G.f&&G.f.gameMode==='faith') || sName.indexOf('faith')===0) return 'faith';
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
  G.settings.fightPace=mode==='gauntlet'?'integral':mode==='faith'?'instantane':'rapide';
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: V3_LOCK_NEMESIS] — Plan V3 LOT 3 §P16. Point de verrouillage
   UNIQUE d'une némésis Faith, quel que soit le déclencheur (franchissement
   de rang, rivalité répétée, trahison du protégé) : les trois anciens
   sites d'affectation directe de G.f.faithNemesisId sont remplacés par un
   appel ici, pour ne jamais oublier l'un des deux effets attendus par
   §P16 sur un futur 4e déclencheur : (1) un surnom mérité — earnNickname()
   (ui-05, déjà utilisé pour le joueur à turnPro()) tant que la personne
   n'en a pas déjà un (jamais écrasé, une trahison de protégé peut réutiliser
   un allié déjà surnommé) ; (2) un écran de consécration à la prochaine
   occasion de rendu (scr_faith_nemesis_consecration, plus bas) via un
   drapeau consommé une seule fois. nemesisRecord repart TOUJOURS de zéro
   ici (FA-26 : "ne concerne que la némésis EN COURS"), y compris le
   rattachement d'une rivalité déjà comptée par ailleurs (f._rivalries). */
function lockFaithNemesis(person){
  if(!person) return;
  G.f.faithNemesisId=person.id;
  G.f.rivalId=person.id;
  G.f.nemesisRecord=null;
  if(!person.nick) person.nick=earnNickname(person);
  if(G.faith) G.faith.pendingNemesisConsecration=true;
}
/* ==== [ANCRE: V3_SPARRING_PRIMARY] — Plan V3 LOT 2 §P04/§P08 : cause exacte
   du bug "Marcus est devenu Sean sans raison" (cf. ANCRE PERSON_REGISTRY,
   state.js) — l'ancien topPartner se recalculait par TRI à chaque rendu
   (F.gym.slice().sort((a,b)=>b.overall-a.overall)[0]), donc changeait
   d'identité dès qu'un entraînement faisait franchir à un partenaire
   l'overall de l'autre, sans aucun événement pour l'expliquer. F.
   sparringPrimaryId est désormais LA seule référence stable, réévaluée
   uniquement à des points de rupture explicites (création de l'écurie,
   départ d'un partenaire) — jamais au rendu. Appelée après TOUTE
   modification de G.faith.gym qui pourrait invalider la référence
   actuelle (départ, arrivée) ; no-op si la référence est encore valide. */
/* ==== [CORRECTIF C13] — Plan V4 LOT 5 : cette fonction est le SEUL endroit
   qui peut faire changer G.faith.sparringPrimaryId — les écrans (ui-04) ne
   font plus jamais de repli silencieux (`||gym[0]`) quand l'id référencé
   est introuvable. Un appelant qui retire un partenaire (ex.
   evt_frankenstein_betrayal) doit faire partir sa Person explicitement
   (personDepart, avec la vraie raison) AVANT d'appeler cette fonction ;
   si un appel futur l'omettait, le repli ci-dessous consigne quand même un
   départ daté générique — jamais une identité qui glisse en silence
   (Loi 3 : la perte doit être traçable). */
function ensureSparringPrimary(){
  if(!G.faith) return;
  const gym=G.faith.gym||[];
  if(gym.some(p=>p.id===G.faith.sparringPrimaryId)) return;
  if(G.faith.sparringPrimaryId!=null && G.people){
    const key='sparring:'+G.faith.sparringPrimaryId;
    const pid=G.people.byKey&&G.people.byKey[key];
    const p=pid!=null?G.people.byId[pid]:null;
    if(p && p.state.active) personDepart(p,'A quitté la salle, sans que la raison n’ait été enregistrée à temps.');
  }
  const best=gym.slice().sort((a,b)=>b.overall-a.overall)[0];
  G.faith.sparringPrimaryId=best?best.id:null;
}
/* ==== [ANCRE: V3_FAITH_AGENT_PERSON] — Plan V3 LOT 4 §P05a : "l'agent
   devient une Person, en gardant son surnom d'archétype". G.faith.agent
   reste TEL QUEL — c'est l'objet d'archétype (FAITH_AGENTS, {id,label,cut})
   dont dépend toute la mécanique de négociation existante (agentId===
   'requin'/'stratege'/'fidele', une dizaine de sites) : le retoucher
   aurait un rayon d'action bien plus large que ce lot. Une Person séparée
   (G.faith.agentPersonId) porte l'IDENTITÉ (nom réel, tirée de
   FAITH_AGENT_ROSTER, LOT 0) et l'HISTOIRE (rel.arc[]) — l'affichage
   combine les deux : nom réel + « surnom d'archétype ». Re-mintée
   uniquement quand l'archétype change réellement (nouvel agent signé),
   jamais à chaque rendu. */
function ensureFaithAgentPerson(){
  if(!G.faith || !G.faith.agent) return null;
  const archetypeId=G.faith.agent.id;
  const reg=ensurePeopleRegistry();
  const current=G.faith.agentPersonId?reg.byId[G.faith.agentPersonId]:null;
  if(current && current.extra && current.extra.archetype===archetypeId) return current;
  const usedRosterIds=Object.values(reg.byId).filter(p=>p.role==='agent').map(p=>p.extra&&p.extra.rosterId);
  const pool=(typeof FAITH_AGENT_ROSTER!=='undefined'?FAITH_AGENT_ROSTER:[]).filter(a=>a.archetype===archetypeId && usedRosterIds.indexOf(a.id)===-1);
  const fallback=(typeof FAITH_AGENT_ROSTER!=='undefined'?FAITH_AGENT_ROSTER:[]).find(a=>a.archetype===archetypeId);
  const chosen=pool.length?pick(pool):(fallback||{firstName:'Agent',lastName:'',ck:'',trait:''});
  const id=reg.nextId++;
  const flag=(typeof COUNTRIES!=='undefined' && COUNTRIES[chosen.ck])?COUNTRIES[chosen.ck].flag:'';
  const p={id,firstName:chosen.firstName,lastName:chosen.lastName||'',nickname:null,role:'agent',flag,born:chosen.ck||'',
    bio:{origin:'Agent de combattants.',past:chosen.trait||'',trait:chosen.trait||''},
    rel:personDefaultRel(),state:{gymId:null,active:true,leftAt:null,leftReason:null},memory:[],
    extra:{archetype:archetypeId,rosterId:chosen.id}};
  reg.byId[id]=p;
  G.faith.agentPersonId=id;
  return p;
}
/** Nom réel + surnom d'archétype de l'agent Faith — seule source
 * d'affichage (§P05a). */
function faithAgentDisplayName(){
  const p=ensureFaithAgentPerson();
  if(!p) return (G.faith&&G.faith.agent&&G.faith.agent.label)||'Sans agent';
  const label=(G.faith.agent&&G.faith.agent.label)||'';
  return label?`${personName(p,{})} « ${label} »`:personName(p,{});
}
/** Nom complet + surnom d'un combattant du roster, seule source d'affichage
 * pour rester cohérent partout (Loi 1) — jamais juste `.first`. */
function fighterDisplayName(o,withNick){
  if(!o) return '';
  const full=o.name||[o.first,o.last].filter(Boolean).join(' ');
  return (withNick!==false && o.nick)?`${full} « ${o.nick} »`:full;
}
/* ==== [ANCRE: V3_NEMESIS_ESCALADE] — Plan V3 LOT 3 §P16 : paliers narratifs
   d'une rivalité, dérivés du nombre de confrontations déjà jouées
   (nemesisRecord.w+l, ui-05) — jamais un compteur séparé à tenir à jour
   ailleurs. 0 combat joué = on vient tout juste de se désigner l'un
   l'autre ; le PROCHAIN combat porte le palier suivant. */
function nemesisTierLabel(fightsPlayed){
  if(fightsPlayed<=0) return 'Première rencontre';
  if(fightsPlayed===1) return 'La revanche';
  if(fightsPlayed===2) return 'La trilogie';
  return 'Le règlement de comptes';
}
/* ==== [FIN ANCRE] ==== */

/* ============================== RENDER + CL =============================== */
function render(preserveScroll){ const app=document.getElementById('app'); if(!app)return;
  /* ==== [ANCRE: FAITH_SKIN_BASCULE] — MMA Faith bascule sur sa propre
     palette (noir encre plat + accent oxblood, cf. FAITH_SKIN_BASCULE dans
     index.html). Le basculement se fait par une classe sur <body> plutôt que
     par des styles en ligne dans chaque écran : un seul point de vérité,
     aucun écran Faith à retoucher pour changer la palette.
     Le test initial (préfixe "faith" sur le nom d'écran) laissait fuir le
     skin sur les écrans transverses (select, plan, result, profile, hof,
     retire) atteints DEPUIS une carrière Faith mais dont le nom ne commence
     pas par "faith" — ~40% du parcours affichait la mauvaise palette. Le
     test porte sur l'appartenance au mode (G.f.gameMode==='faith'), avec le
     préfixe d'écran gardé en repli pour faith_draft (s'affiche avant que
     G.faith/G.f existent).
     ==== [CORRECTIF FA-10bis] — l'écran "arena" était exclu par choix
     narratif (papier=vie, noir=cage) tant que la palette Faith restait un
     papier crème très clair : le contraste avec le cuir/or de l'arène
     produisait un flash violent à chaque entrée en cage. Sans objet
     maintenant que les deux palettes sont sombres (FA-08) — l'exception est
     retirée, la transition hub->arène devient continue. ==== */
  { const _sName=String((G&&G.screen)||'');
    const _enFaith=_sName.indexOf('faith')===0 || !!(G&&G.f&&G.f.gameMode==='faith');
    document.body.classList.toggle('faith-skin', _enFaith);
    /* ==== [ANCRE: V3_DATA_MODE] — Plan V3 LOT 1 §P02 : remplace la classe
       papier/nuit (réglage joueur, ANCRE FAITH_AMBIANCE ci-dessus dans
       l'historique) par un attribut [data-mode] sur <html>, seule source
       des trois dégradés sombres (index.html, ANCRE V3_MODE_GRADIENTS).
       currentGameMode() (plus bas dans ce fichier) est le point de vérité
       unique mode Faith/Gauntlet/Carrière, réutilisé aussi par §P07 pour
       forcer le rythme de combat par mode plutôt que par réglage. ==== */
    try{ document.documentElement.setAttribute('data-mode', currentGameMode()); }catch(e){}
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V2-28] — Rythme "Instantané" : ne passe jamais par ARENA
     (aucune animation canvas) — résultat direct + résumé en trois lignes.
     Point de passage unique (render(), pas choosePlan()) : couvre carrière,
     Faith ET Gauntlet, quel que soit le chemin qui a posé G.screen='arena'.
     G.pending._flashShown évite de reconstruire le résumé à chaque rendu
     du même combat. */
  if(G && G.screen==='arena' && G.pending && !G.pending._flashShown
     && (((G.settings&&G.settings.fightPace)||'rapide')==='instantane')){
    G.pending._flashShown=true;
    G.pending.flashLines=buildFightFlashLines(G.pending.res);
    /* ==== [ANCRE: V3_FAITH_FIGHT_PENDING] — Plan V3 LOT 1 §P07, arbitrage
       A4 : Faith ne passe plus jamais par l'écran-résumé "Instantané" en
       direct — scr_faith_fight_pending() (ui-08, plus bas) s'intercale
       d'abord (2,5-4s, barre de progression non linéaire, confettis sur
       victoire), puis bascule elle-même vers fight_flash une fois le
       temps de suspense écoulé (cf. finishFaithFightPending()). Carrière
       et Gauntlet, qui n'ont jamais utilisé "Instantané" par défaut
       (forceFightPaceForMode()), ne sont pas concernés en pratique — mais
       le test reste sur le mode, pas sur le pace, pour rester correct si
       une sauvegarde plus ancienne porte encore une valeur différente. */
    G.screen=(currentGameMode()==='faith')?'faith_fight_pending':'fight_flash';
  }
  /* ==== [ANCRE: V3_NEMESIS_CONSECRATION] — Plan V3 LOT 3 §P16 : intercepte
     le tout premier rendu suivant lockFaithNemesis() (posé depuis 3 points
     d'entrée différents — franchissement de rang en fin d'année, rivalité
     répétée juste après un combat, trahison du protégé — donc pas un point
     de sortie unique comme "Instantané" ci-dessus). Jamais pendant une
     séquence de combat déjà engagée (arena/attente/résumé/résultat) : le
     drapeau reste posé et se déclenche au rendu calme suivant. */
  const FIGHT_SEQUENCE_SCREENS=['arena','faith_fight_pending','fight_flash','result'];
  if(G && G.faith && G.faith.pendingNemesisConsecration && FIGHT_SEQUENCE_SCREENS.indexOf(G.screen)===-1){
    G.faith.pendingNemesisConsecration=false;
    G.screen='faith_nemesis_consecration';
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V3_TITLE_CONSECRATION] — Plan V3 LOT 6 §5.6.1, temps 5 :
     même mécanisme d'interception que V3_NEMESIS_CONSECRATION ci-dessus
     (posé par resolveFight, ui-05, sur une victoire de titre ou une
     défense réussie) — prioritaire sur la consécration de némésis si les
     deux tombent le même rendu (un combat de titre contre sa propre
     némésis est le cas qui les ferait coïncider), l'apogée de la carrière
     passe avant l'apparition d'une rivalité. */
  if(G && G.faith && G.faith.pendingTitleConsecration && FIGHT_SEQUENCE_SCREENS.indexOf(G.screen)===-1){
    G.faith.pendingNemesisConsecration=false;
    G.faith.lastTitleConsecration=G.faith.pendingTitleConsecration;
    G.faith.pendingTitleConsecration=null;
    G.screen='faith_title_consecration';
  }
  /* ==== [FIN ANCRE] ==== */
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); if(G&&G.screen==='consumable_preview') startConsumablePreviewArena(); if(G&&G.screen==='shop_preview') startShopPreviewArena(); if(G&&G.screen==='faith_fight_pending') startFaithFightPending(); if(!preserveScroll && window.scrollTo) window.scrollTo(0,0); }
function routeAfterOrgChange(){
  /* ==== [ANCRE: CORRECTIF_ORG_CHANGE_CALENDRIER] — bug trouvé : cette fonction
     basculait sur prepareFaithYearEnd() dès qu'un changement d'organisation
     survenait en Faith. Hérité de l'ère « 1 combat par an » (avant FA-11) : avec
     un calendrier de 12 mois, renouveler un contrat au mois 3 supprimait 9 mois
     de jeu et déclenchait un bilan annuel sur une saison tronquée. Le mode Faith
     rejoint le flux normal du calendrier. ==== */
  if(G.faith){ faithAdvanceMonth(); return; }
  G.screen='hub'; save(); render();
}
/* ==== [ANCRE: FAITH_CALENDRIER] — remplace le compteur `step` (1-5, temps
   fixes) par une position dans G.faith.calendar (12 mois, généré par
   faithGenerateCalendar(), ui-04) : seul point de vérité pour savoir quel
   mois est en cours et ce qui doit s'y passer. faithLandOnMonth() saute les
   mois vides SANS jamais rendre d'écran intermédiaire pour eux ("traversées
   automatiquement", cf. le document) ; si l'année entière est épuisée en
   sautant, elle bascule directement sur le bilan. Appelée à l'entrée d'une
   année (month=0, potentiellement vide) ET après chaque mois résolu
   (faithAdvanceMonth). ==== */
function faithLandOnMonth(){
  while(G.faith.month<12 && !(G.faith.calendar[G.faith.month]||{}).type) G.faith.month++;
  if(G.faith.month>=12){ CL.prepareFaithYearEnd(); return; }
}
function faithAdvanceMonth(){
  G.faith.month++;
  // ==== [ANCRE: V2-11] — le temps qui passe régénère un peu de fraîcheur,
  // seul (sans repos actif) ce n'est jamais suffisant pour compenser un
  // stage/sparring enchaîné mois après mois.
  if(G.f) G.f.freshness=clamp((G.f.freshness==null?70:G.f.freshness)+3,0,100);
  faithLandOnMonth();
  if(G.faith.month>=12) return; // prepareFaithYearEnd() a déjà pris la main
  G.screen='faith_hub'; save(); render();
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_AGENT] — l'agent choisit LEQUEL des candidats du
   Bureau du Matchmaker (genOpponents(), ui-02, inchangé — trié du plus fort
   au plus faible, cf. CORRECTIF_ORDRE_PROPOSITIONS) devient l'offre unique,
   selon son profil : le Requin vise le plus dangereux (plus dur, mieux payé
   via faithGalaPosition), le Fidèle le plus abordable, le Stratège un
   candidat calibré au milieu. ==== */
/* ==== [ANCRE: V2-16] — "fin du combattant pressenti". Avant ce
   correctif, le hub (scr_faith_hub, ui-04) affichait `G.opps[0]` (le PLUS
   DANGEREUX des candidats, cf. CORRECTIF_ORDRE_PROPOSITIONS) comme
   "pressenti", alors que l'offre réelle générée au clic choisissait selon
   l'AGENT (le Requin prend le plus dur, le Fidèle le plus abordable, le
   Stratège le milieu) — pour deux agents sur trois, le pressenti et
   l'offre réelle étaient systématiquement DIFFÉRENTS. Extrait ici en
   fonction séparée, idempotente (ne régénère jamais une offre déjà
   figée) : le hub l'appelle à l'affichage pour lire `pendingOffer.opp`
   directement (la vraie offre, jamais un second tirage), et
   faithGenerateOffer() la réutilise telle quelle plutôt que de dupliquer
   la logique de sélection. @returns {boolean} une offre est disponible */
function faithEnsureOffer(){
  if(G.faith.pendingOffer) return true;
  ensureOpponentsCached(G.f);
  let opps=G.opps||[];
  const gala=faithGalaPosition(G.f);
  gala.label=faithGalaLabel(G.faith,G.f);
  /* ==== [ANCRE: V2-13 règles 1/4/5] — Faith a un vrai concept de position
     de carte (faithGalaPosition, contrairement au mode carrière où seule
     l'idée de défense/titre en tient lieu — le filtre équivalent vit dans
     genOpponents(), ui-02, sur la branche isDefense) : sur une carte
     principale ou un main event, exclure les candidats en déroute
     (bilan négatif sur leurs 5 derniers combats, règle 1) et plafonner
     l'écart de rang avec le joueur (règle 4 — fenêtre large sur une
     carte principale, étroite en main event). Règle 5 : si les DEUX
     filtres appliqués STRICTEMENT (sans repli silencieux sur la liste
     non filtrée) ne laissent plus aucun candidat, ne jamais servir un
     adversaire non conforme — un mois creux avec sa raison affichée vaut
     mieux qu'un adversaire absurde sur la plus grosse affiche de l'année. */
  if(gala.tier==='Main event' || gala.tier==='Carte principale'){
    const myRank=divRank(G.f);
    const rankCap=gala.tier==='Main event'?8:15;
    const eligible=opps.filter(x=>{
      const h=x.o.history;
      const onASkid=h && h.length>=5 && h.slice(-5).filter(hh=>hh.res==='loss').length>=3;
      return !onASkid && Math.abs(divRank(x.o)-myRank)<=rankCap;
    });
    if(!eligible.length){
      G.lastMsg="L’organisation n’a personne à vous proposer pour une affiche pareille ce mois-ci — et ça commence à se voir.";
      return false;
    }
    /* ==== [ANCRE: CORRECTIF_POOL_OFFRE_SEPARE] — bug trouvé : le correctif
       précédent (CORRECTIF_POOL_ELIGIBLE_PARTAGE) posait ce filtre dans
       G.opps lui-même — mais G.opps est le CACHE PARTAGÉ des candidats
       (ensureOpponentsCached, ui-02), régénéré seulement quand le palmarès
       change (W+L+D), jamais à chaque nouvelle offre. Un mois creux ou un
       refus (nouvelle offre, même palmarès) relisait ce cache déjà réduit et
       le filtrait ENCORE — la vraie liste de candidats rétrécissait un peu
       plus à chaque offre, jusqu'à ne plus contenir personne. Le filtre vit
       désormais dans G.faith.offerPool, propre à CETTE offre, sans jamais
       toucher au cache partagé. ==== */
    opps=eligible; G.faith.offerPool=eligible;
  }
  if(!opps.length) return false;
  /* ==== [ANCRE: V3_REMATCH_GUARANTEE] — Plan V3 LOT 6 §5.6.1.b : clause de
     revanche posée à la négociation de titre (scr_faith_title_negotiation)
     et consommée à la défaite (ui-05, ANCRE V3_TITLE_LOSS_CLAUSE) — la
     prochaine offre DOIT être contre le même adversaire, en dehors du choix
     normal de l'agent. Silencieuse et sans échec si l'adversaire n'est
     plus dans le pool proposé (retraité, changé d'organisation) : la
     clause s'efface plutôt que de bloquer le jeu. */
  let chosen;
  if(G.faith.guaranteedRematchId){
    const forced=opps.find(x=>x.o.id===G.faith.guaranteedRematchId);
    G.faith.guaranteedRematchId=null;
    if(forced) chosen=forced;
  }
  /* ==== [FIN ANCRE] ==== */
  const agentId=(G.faith.agent&&G.faith.agent.id)||'fidele';
  if(!chosen) chosen=agentId==='requin'?opps[0]:agentId==='fidele'?opps[opps.length-1]:opps[Math.floor(opps.length/2)];
  /* ==== [ANCRE: CORRECTIF_MAIN_EVENT_NEMESIS_PERMANENT] — la position de
     carte calculée plus haut (avant que `chosen` ne soit connu, pour filtrer
     le pool) ignorait forcément qui serait le véritable adversaire.
     Recalculée maintenant qu'il l'est, pour que le statut de némésis
     (faithGalaPosition, ui-04) ne s'applique QUE si `chosen` est bien la
     némésis — jamais tant qu'une autre carte est en jeu. ==== */
  Object.assign(gala,faithGalaPosition(G.f,chosen.o));
  /* Sans agent (perdu, cf. nextFaithYear) : bourses -25% jusqu'à ce qu'un
     nouveau se présente l'année suivante. */
  if(!G.faith.agent) gala.mult*=0.75;
  /* ==== [ANCRE: V3_SPECTACLE_HYPE] — Plan V3 LOT 7 §5.7.1 point 5 : "cet axe
     pilote la hype, les bourses, l'accueil du public". Modeste (±10%,
     jamais un second système de bourse) — le palmarès (déjà gala.mult via
     le rang/statut de titre) reste le levier principal, le spectacle
     n'est qu'un correctif. */
  const spec=G.f.spectacle==null?50:G.f.spectacle;
  if(spec>=70) gala.mult*=1.1; else if(spec<=30) gala.mult*=0.9;
  /* ==== [FIN ANCRE] ==== */
  G.faith.pendingOffer={opp:chosen,gala,bonusMult:1};
  G.faith.pendingRevengeClause=false; // nouvelle offre : la clause d'une offre précédente ne survit jamais
  G.faith.currentCard=generateFightCard(gala,chosen.o);
  return true;
}
/* ==== [ANCRE: V3_FIGHT_CARD] — Plan V3 LOT 6 §5.6.1.b : "remplacer la
   mention Main event par la carte complète : 5 à 8 combats, avec les vrais
   combattants du roster [...] résolus par worldTick() et font bouger le
   classement". Généré UNE FOIS par offre (appelé depuis faithEnsureOffer()
   ci-dessus, jamais régénéré à un re-rendu) : les combats de complément
   sont RÉELLEMENT simulés ici (simulateFight+applyResult, exactement le
   mécanisme déjà éprouvé d'advanceRoster(), ui-01) — leurs W/L bougent
   vraiment, contrairement à un habillage cosmétique. Le combat du joueur
   lui-même n'est PAS simulé ici (il reste résolu normalement par
   resolveFight, ui-05) — seul son adversaire et sa position sur la carte y
   figurent, son propre résultat est complété après coup (cf.
   V3_FIGHT_CARD_RESULT, ui-05). */
function generateFightCard(gala,opponent){
  const pool=(G.roster||[]).filter(o=>o.id!==opponent.id && !o.champion);
  const ranked=rankPool(pool);
  const n=Math.min(RI(4,7),Math.floor(ranked.length/2));
  const fights=[];
  for(let i=0;i<n;i++){
    const a=ranked[i*2], b=ranked[i*2+1];
    if(!a||!b) break;
    const res=simulateFight(a,b,3);
    applyResult(a,b,res,'A'); applyResult(b,a,res,'B');
    const aWin=res.winner==='A';
    fights.push({aId:a.id,aName:a.name,aFlag:a.flag,bId:b.id,bName:b.name,bFlag:b.flag,method:res.method,winnerName:aWin?a.name:(res.winner==='D'?null:b.name)});
  }
  return {label:gala.label,tier:gala.tier,oppId:opponent.id,oppName:opponent.name,fights,playerResult:null};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V3_TITLE_NEGOTIATION_ROUTE] — Plan V3 LOT 6 §5.6.1, temps 3 :
   "offre distincte de scr_faith_offer(), avec ses propres leviers" — un
   combat de titre ou de défense route vers scr_faith_title_negotiation()
   (ui-08, plus bas) au lieu de l'offre ordinaire, MAIS réutilise le même
   G.faith.pendingOffer (posé par faithEnsureOffer() juste au-dessus,
   inchangé) : un seul mécanisme d'offre, deux présentations. */
function faithGenerateOffer(){
  if(!faithEnsureOffer()){ faithAdvanceMonth(); return; }
  const kind=fightKind();
  G.screen=(kind==='title'||kind==='defense')?'faith_title_negotiation':'faith_offer'; save(); render();
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
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
  /* ==== [ANCRE: CORRECTIF_DECOTE_ENCAISSEMENT] — la décote décrite par l'ancre
     REJOUABILITE_BANQUE_GAUNTLET est morte avec cashOutGauntlet(). Le nouveau
     point d'entrée d'encaissement (acceptRingDoctor) tombait donc sur la table
     PLEINE : sortir proprement rapportait deux fois une élimination au même
     palier, sans aucun risque. ==== */
  const base=(opts.kind==='elimination')
    ? gauntletEliminationPayout(a.mode,opts.progress,opts.atRisk)
    : (opts.kind==='cashout')
      ? Math.round(gauntletPayout(a.mode,opts.progress)*(a.mode==='boss_run'?0.6:0.7))
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
  /* ==== [ANCRE: TOUT_EN_BOUTIQUE] — le défi du jour et sa série (avec son
     bonus de cagnotte) sont retirés : les gains ne dépendent plus du jour
     où l'on joue. ==== */
  const earned=preBonusWithDoctor;
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
  /* ==== [ANCRE: TOUT_EN_BOUTIQUE] — les Reliques de Survie et la Maîtrise de
     mode disparaissent avec l'écran Profil qui les affichait ; le suivi du
     défi du jour disparaît avec le défi. ==== */
  saveMetaStats(meta);
  /* ==== [ANCRE: CORRECTIF_REENTRANCE_DIABLE] — buyDevilContinue() ressuscite une
     run que cette fonction a déjà close. Le crédit s'accumule (voulu : la run a
     réellement continué), mais l'écrasement de earnedOnElimination faisait
     afficher le seul dernier segment sur l'écran de fin. ==== */
  a.earnedOnElimination=(a.earnedOnElimination||0)+earned;
  a.segments=(a.segments||0)+1;
  a.basePayout=base;
  a.runMultApplied=gauntletRunMult(a);
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
/* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — le LOT G a verrouillé les
   trois boutons du combat (choosePlan / chooseArcadePlan / afterResult) contre
   le double-tap tactile, mais toute la couche « action du mois » de Faith est
   restée ouverte au même geste : chaque action consomme un mois et applique
   ses effets, sans rien qui empêche un second appel de recommencer. Un
   double-tap payait donc le stage deux fois, tirait le risque de blessure deux
   fois, brûlait deux mois, ou — sur nextFaithYear — archivait l'année en
   double et sautait deux millésimes.
   Le témoin est le mois lui-même : une action du mois M ne peut, par
   définition, se produire qu'une fois. Rien à remettre à zéro — la clé change
   d'elle-même au mois suivant.
   ==== [ANCRE: CORRECTIF_CLAIM_MOIS_SAUT_CALENDRIER] — bug trouvé en écrivant
   l'invariant de non-régression (tests/invariants.test.js) : la seule clé
   mois+année ne suffit PAS. faithLandOnMonth() (plus haut) saute en silence
   tous les mois sans `.type` — la majorité d'une année Faith typique — donc
   faithAdvanceMonth() fait presque toujours avancer G.faith.month de PLUS
   D'UN cran en un seul appel. Un double-tap relit alors G.faith.month APRÈS
   ce saut : la clé a déjà changé (elle ne correspond plus au mois consommé
   par le premier appel), et le second appel se voit à tort comme une action
   neuve pour le mois d'arrivée — la clé seule ne bloque donc jamais rien en
   pratique, sauf pile en fin d'année (où G.faith.month plafonne à 12 sans
   avancer davantage). Un second témoin, sur l'écart réel entre deux appels,
   couvre le cas qui compte.
   ==== [ANCRE: CORRECTIF_SEUIL_DOUBLE_TAP] — les 50 ms d'origine mesuraient
   le temps d'EXÉCUTION du premier appel (le "battement synchrone"), pas
   l'intervalle entre les deux doigts d'un double-tap — qui est humain (100 à
   300 ms ; le délai historique d'iOS, déjà cité ailleurs dans ce fichier
   pour la même famille de bug, est justement de 300 ms). Le garde était donc
   en place sans bloquer un vrai double-tap. 400 ms couvre le seuil de
   double-clic des navigateurs, tout en restant très en-deçà du temps que
   prend une action de jeu distincte suivante (un mois entier de simulation
   et un écran à lire séparent deux actions légitimes).
   ==== [ANCRE: CORRECTIF_CLAIM_PORTEE_ACTION] — bug trouvé en élargissant la
   fenêtre à 400 ms : le témoin de délai était PARTAGÉ par toutes les actions
   du mois (une seule paire _monthClaimed/_monthClaimedAt sur G.faith), donc
   deux actions RÉELLEMENT DIFFÉRENTES (repos puis stage le mois suivant, par
   exemple) tombant à moins de 400 ms l'une de l'autre se bloquaient l'une
   l'autre — observé sur INV-06 (longueur de carrière médiane écrasée à 14
   contre une cible de 25-40, des mois entiers silencieusement ignorés).
   `tag` isole chaque site d'appel (nom de l'action, éventuellement suffixé
   de son argument) : seul un VRAI doublon — même action, mêmes arguments,
   moins de 400 ms d'écart — est désormais bloqué. ==== */
function faithClaimMonth(tag){
  if(!G.faith) return true;
  const key=G.faith.year+':'+G.faith.month;
  const now=Date.now();
  if(!G.faith._monthClaims) G.faith._monthClaims={};
  const prev=G.faith._monthClaims[tag];
  if(prev && prev.key===key) return false;
  if(prev && (now-prev.at)<400) return false;
  G.faith._monthClaims[tag]={key,at:now};
  return true;
}
const CL={
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  /* ==== [ANCRE: V3_RANKINGS_P4P_TAB] — bascule d'onglet sur scr_rankings()
     (ui-06), cf. son ancre pour le détail. */
  setRankingsTab(tab){ G._rankingsTab=tab; render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V4_C15_FAITH_ARCHIVES] — scr_faith_archives() (ui-04).
     viewFaithArchives() mémorise l'écran d'origine (même schéma que
     viewFightCard() juste en dessous) pour que "← Retour"/"✕" revienne au
     bon endroit ; oppId, s'il est passé, pré-filtre sur cet adversaire —
     depuis une fiche adverse ou la fiche complète, l'écran s'ouvre déjà sur
     la trilogie plutôt que sur la liste entière. */
  viewFaithArchives(oppId){ G._archivesReturn=G.screen; G._archivesFilterOppId=oppId||null; G.screen='faith_archives'; render(); },
  setArchivesFilter(oppId){ G._archivesFilterOppId=oppId||null; render(); },
  /* ==== [ANCRE: V3_SCR_FIGHT_CARD] — mémorise l'écran d'origine (offre,
     négociation de titre, ou hub) pour que "← Retour" (scr_faith_card,
     ui-08) revienne au bon endroit plutôt que toujours au hub. */
  viewFightCard(){ G._cardReturn=G.screen; G.screen='faith_card'; render(); },
  /* ==== [FIN ANCRE] ==== */
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
  toggleAttrHelp(k){ G._attrHelp=(G._attrHelp===k?null:k); render(true); },
  toggleRunStatusPreview(key){ G._runStatusPreview=(G._runStatusPreview===key?null:key); render(true); },
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
  /* ==== [ANCRE: CORRECTIF_ACHAT_CONSOMMABLE_DOUBLE_RENDU] — scr_consumable_
     preview enchaînait CL.purchaseConsumable(id);CL.closeConsumablePreview()
     sur le même onclick : deux appels séparés à render() coup sur coup pour
     un seul clic. Fusionnés en une méthode unique, un seul render(). ==== */
  buyAndCloseConsumable(itemId){
    const meta=loadMetaStats(); const r=purchaseGauntletConsumable(meta,itemId);
    G.lastMsg=r.msg; saveMetaStats(meta);
    G.screen=G._returnScreen||'legends'; G._returnScreen=null; render(true);
  },
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
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: LOTERIE_LEGENDES] — ajout #11 (24 ajouts, 12/08/2026). ==== */
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
       const lA=list[G.vsFriendSelA||0];
       const lB=G.importedFriendLegend||list[G.vsFriendSelB!==undefined?G.vsFriendSelB:1];
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
    G.sel={o:offer.champion,read:'Combat historique pour la double couronne.',context:'CHAMP-CHAMP'};
    G.train=trainingOptions(G.f);
    G.screen='camp'; save(); render();
  },
  declineChampChampOffer(){
    G.f.champChampLastOfferDefenses=G.f.defenses;
    G.f.champChampOffer=null;
    G.lastMsg='Vous avez décliné le supercombat. Le président reviendra à la charge après deux défenses supplémentaires.';
    /* ==== [ANCRE: CORRECTIF_CHAMPCHAMP_MOIS] — la branche Faith d'afterResult()
       sort par `return` avant faithAdvanceMonth() quand une décision de
       supercombat est en attente : c'est donc à ces handlers de reprendre le
       calendrier, sinon le mois du combat qui vient d'avoir lieu n'est jamais
       consommé (second combat gratuit dans le même mois). ==== */
    if(G.faith){ save(); faithAdvanceMonth(); return; }
    G.screen='hub'; save(); render();
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
    // ==== [ANCRE: CORRECTIF_CHAMPCHAMPFOCUS_MORT] — la ligne qui écrivait
    // G.f.champChampFocus=divId juste ici a été retirée : l'ancre juste
    // au-dessus dit elle-même que cette variable n'est relue nulle part, et
    // le vrai correctif (basculer G.f.div/divName/roster) l'a rendue
    // définitivement inutile.
    if(divId!==G.f.div){
      const newDiv=divById(divId);
      if(newDiv){ G.f.div=newDiv.id; G.f.divName=newDiv.name; G.roster=makeOrgRoster(G.f); }
    }
    G.lastMsg=divId===G.f.div?'Vous restez concentré sur votre division d\u2019origine.':'Vous faites de votre nouvelle ceinture votre priorité.';
    /* ==== [ANCRE: CORRECTIF_CHAMPCHAMP_MOIS] — la branche Faith d'afterResult()
       sort par `return` avant faithAdvanceMonth() quand une décision de
       supercombat est en attente : c'est donc à ces handlers de reprendre le
       calendrier, sinon le mois du combat qui vient d'avoir lieu n'est jamais
       consommé (second combat gratuit dans le même mois). ==== */
    if(G.faith){ save(); faithAdvanceMonth(); return; }
    G.screen='hub'; save(); render();
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
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; G.season={year:1,fights:[]}; checkAch();
    recordCareerStart(f);
    forceFightPaceForMode('career');
    G.screen='hub'; save(); render(); },
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
      const kind=fightKind(); const opp=G.sel.o; let rounds=(kind==='title'||kind==='defense')?5:3;
      G.fight={kind,opp,rounds,malus:pendingMyMalus||null,oppMalus:pendingOppMalus||null,mmRole:G.sel.mm?G.sel.mm.role:null};
      /* ==== [CORRECTIF FA-14] — la carte de gala (position, multiplicateur
         de bourse, rounds) posée par faithGenerateOffer()/scr_faith_offer
         (ui-04) s'applique ici, au même endroit que les autres malus/buffs
         en attente — un seul point d'entrée dans le combat Faith, jamais
         deux chemins qui pourraient diverger. pursePenalty est le levier de
         multiplicateur DÉJÀ utilisé par le calcul de bourse (ui-05, ex.
         pénalité de catchweight) : le réutiliser évite de dupliquer la
         logique de déduction. ==== */
      if(G.faith.pendingOffer){
        const off=G.faith.pendingOffer;
        if(off.gala){
          rounds=off.gala.rounds||rounds; G.fight.rounds=rounds;
          const mult=(off.gala.mult||1)*(off.bonusMult||1);
          if(mult!==1) G.fight.pursePenalty=(G.fight.pursePenalty||1)*mult;
          G.fight.galaLabel=off.gala.label;
        }
        /* ==== [ANCRE: V2-20] — "une contre-proposition est un pari" :
           certains directeurs (FAITH_DIRECTORS, ui-04) refusent la
           revalorisation directe et contre-proposent une prime de
           finition à la place — ne rapporte que si le combat se termine
           avant la limite. Lu par le bonus de finition déjà existant
           (ui-05, pursePenalty voisin) plutôt que d'inventer un second
           système de bourse. ==== */
        if(off.finishBonus) G.fight.finishBonusMult=2;
        G.faith.pendingOffer=null;
        /* ==== [ANCRE: CORRECTIF_POOL_OFFRE_SEPARE] — le pool propre à cette
           offre (posé par faithEnsureOffer()) ne doit jamais survivre à
           l'offre elle-même, sinon la prochaine offre le relirait comme si
           c'était le sien. ==== */
        G.faith.offerPool=null;
        // clé de repérage (V2-08) : consommée à l'entrée dans la cage, qu'elle
        // ait servi ou non — jamais transférable au combat suivant.
        G.faith.scoutKey=false;
      }
      /* ==== [ANCRE: V2-11] — sous "émoussé", la fraîcheur basse se traduit
         en malus de combat (même mécanisme que les autres malus temporaires
         du fight, cf. G.fight.malus plus haut), jamais en risque de
         blessure : la blessure reste l'affaire des stages/sparring, pas
         du combat lui-même. */
      const ft=freshnessTier(G.f).tier;
      if(ft==='vide' || ft==='about'){
        const penalty=(ft==='about')?{cardio:-15,durability:-10}:{cardio:-8,durability:-5};
        G.fight.malus=Object.assign({},G.fight.malus,penalty);
      }
      const wc=weightCutInfo(G.f);
      /* ==== [ANCRE: V4_C10_WEIGH_IN] — même règle que côté Carrière classique
         (ui-02, ANCRE V4_C10_WEIGH_IN) : le tier `complique` peut échouer
         (30%), `impossible` échoue toujours. ==== */
      let cutTier, weighInPassed=true;
      if(G.faith.dietYear===G.faith.year){ cutTier='sans_effort'; }
      else if(wc.cutPct<=3) cutTier='sans_effort';
      else if(wc.cutPct<=8) cutTier='facile';
      else if(wc.cutPct<=13) cutTier='normal';
      else if(wc.cutPct<=18){ cutTier='complique'; weighInPassed=rnd()>=0.3; }
      else { cutTier='impossible'; weighInPassed=false; }
      G.fight.cutResult={tier:cutTier,effPct:(G.faith.dietYear===G.faith.year)?0:wc.cutPct,kg:(G.faith.dietYear===G.faith.year)?0:wc.cutKg,walk:wc.walk,limit:wc.limit,weighInPassed};
      proceedToFight();
    } else { chooseOpponent(i); }
  },
  train(i){ chooseTraining(i); },
  /* ==== [ANCRE: CORRECTIF_PERSISTANCE_ETAT_RUN] — rejoint la même grappe
     (ci-dessus dans ce fichier) : mutait G.selectedCampTier puis render()
     sans save(), rendant le choix à un rechargement de page. ==== */
  setCampTier(tierId){ G.selectedCampTier=tierId; save(); render(); },
  skipArena(){ CL.toResult(); },
  /* ==== [ANCRE: V3_FAITH_FIGHT_PENDING] — bouton "Passer" de
     scr_faith_fight_pending() : même logique que skipArena() ci-dessus,
     coupe l'animation en cours (barre + confettis) et bascule
     immédiatement sur le verdict, sans attendre le minuteur. */
  skipFaithFightPending(){ finishFaithFightPending(); },
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
      if(G.faith){ if(!G.faith.yearLog) G.faith.yearLog=[];
        G.faith.yearLog.push({title:'Dans la cage',choice:opt.label,outcome:'réussi'}); }
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
  choosePlan(idx){
    /* ==== [ANCRE: CORRECTIF_DOUBLE_RESOLUTION] — un double-tap sur la carte
       de tactique appelait resolveFight() deux fois : W/L, bourse, Elo,
       historique et dégâts crâniens appliqués deux fois pour UN combat. ==== */
    if(G.fight && G.fight._resolved) return;
    const combined=getExclusiveTactics(G.f).concat(TACTICS[G.f.style]||[]); const planObj=combined[idx]; if(!planObj)return;
    G.fight._resolved=true;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  /* ==== [ANCRE: V2-26/V2-27] — trois postures, toutes valables (règle
     H.3). La provocation plante une promesse (G.promise, carrière —
     distincte de G.faith.promise) vérifiée à la résolution du combat
     (ui-05, même ancre que côté Faith). */
  /* ==== [ANCRE: CORRECTIF_PERSISTANCE_ETAT_RUN] — bug trouvé : toute une famille
     de méthodes mutait l'état de run (choix de camp, pacte, mise en jeu, refus du
     médecin, soins d'infirmerie, analyse ciblée, second souffle) puis appelait
     render() sans save(). La dernière sauvegarde datant de l'ENTRÉE dans l'écran,
     un rechargement de page rendait le choix. Cas le plus grave : healGauntletZone
     sauvegarde bien la dépense (saveMetaStats) mais pas le soin (sur G) — le joueur
     perdait ses points ET gardait ses séquelles. ==== */
  chooseFaceoff(posture){
    G.fight.faceoffDone=true;
    const opp=G.fight.opp;
    if(posture==='respect'){
      G.f.morale=clamp((G.f.morale||60)+5,0,100);
    } else if(posture==='provocation'){
      G.promise={type:'finish',oppId:opp.id,oppName:opp.name};
      G.lastMsg="Vous avez promis de le finir — il ne l’a pas oublié en montant sur la balance.";
    } else {
      G.f.morale=clamp((G.f.morale||60)+2,0,100);
    }
    G.fight.planStep=2; save(); render();
  },
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
    if(G.faith){
      /* ==== [ANCRE: FAITH_COMPTEUR_COMBATS] — l'incrément vivait dans
         faithFight(), AVANT que startFightSelect() ne confirme même que le
         combat allait avoir lieu (bloqué net par ex. si f.injury — cf.
         FAITH_BOUTON_BLESSURE) : le compteur du bilan annuel pouvait donc
         monter sans qu'aucun combat ne se soit produit. afterResult() n'est
         atteint QUE depuis le bouton "Continuer" de l'écran de résultat
         (scr_result, ui-06) — jamais avant qu'un combat ait réellement eu
         lieu — c'est le seul endroit qui garantit un incrément par combat
         réel, ni plus ni moins. ==== */
      G.faith.fightsThisYear=(G.faith.fightsThisYear||0)+1;
      /* ==== [FIN ANCRE] ==== */
      const p=G.pending;
      if(p&&p.contractExpiry){ G.screen='contract_nego'; save(); render(); return; }
      if(p&&p.proOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.topTierOffer){ G.screen='toptier'; save(); render(); return; }
      if(p&&p.promoOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.champChampDecision){ G.screen='champ_champ_decision'; save(); render(); return; }
      if(p&&p.champChampOfferReady){ G.screen='champ_champ_offer'; save(); render(); return; }
      /* ==== [ANCRE: FAITH_PERK_LOBBYING] — même diagnostic que perks.judges :
         G.faith.perks.forcePromo était posé par buyFaithPerk() (ui-08) et relu
         par AUCUN code. Consommé ici, une seule fois, à la première victoire
         qui suit son achat. ==== */
      if(p && p.win && G.faith.perks && G.faith.perks.forcePromo && G.f.org<6){
        G.faith.perks.forcePromo=false;
        p.promoOffer=true; G.screen='promo'; save(); render(); return;
      }
      /* ==== [CORRECTIF FA-10] — un combat ne menait plus qu'au bilan annuel
         direct : à 1 combat/an fixe, 18-36 ans de carrière ne produisaient
         jamais plus de 18 combats, et un contrat de 4 combats (engine.js:
         1297, fightsLeft 4 à 6) durait mécaniquement 4 à 6 ANNÉES (FA-04).
         faithAdvanceMonth() avance au mois suivant du calendrier (FA-11) —
         s'il reste d'autres mois-combat cette année, ils suivront
         normalement ; sinon elle bascule elle-même sur le bilan. ==== */
      faithAdvanceMonth();
      return;
    }
    if(G.arcade && G.arcade.active){
      const win=G.pending&&G.pending.win;
      const _res=G.pending&&G.pending.res;
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
      /* ==== [ANCRE: CORRECTIF_FILET_RESTITUTION] — capturé AVANT la remise à
         zéro qui suit (voir l'ancre complète plus bas, où ces deux valeurs
         sont restituées par les trois filets de sécurité). ==== */
      const _pactStreakBefore=G.arcade.pactStreak||0;
      G.arcade.pactStreak=pactFulfilled?((G.arcade.pactStreak||0)+1):0;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: REJOUABILITE_ATTRITION] — G.f.form remontait à +20 fixe
         après CHAQUE victoire quel que soit le nombre de combats déjà encaissés
         dans la run (0 fatigue cumulative sur un format censé être une
         épreuve d'endurance). La récup diminue avec la profondeur de la run —
         le dernier combat d'un Gauntlet doit se jouer sur un combattant usé.
         RI(−1,1) évite un palier trop lisible/mécanique. ==== */
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
      /* ==== [ANCRE: CORRECTIF_FILET_RESTITUTION] — bug trouvé : le pacte, la
         mise en jeu et la série de pactes sont consommés en tête d'afterResult,
         AVANT les branches de mode. Les trois filets de sécurité annoncent
         pourtant « le combat n'a jamais eu lieu » : le joueur perdait quand
         même sa mise, son pacte et sa série — et surtout pactTakenEver était
         posé DÉFINITIVEMENT, cassant le contrat de run « ne jamais prendre de
         pacte » pour un combat qui n'existe officiellement pas. ==== */
      const _pactTakenEverBefore=!!G.arcade.pactTakenEver;
      const _restoreOnSafetynet=()=>{
        G.arcade.pactActive=pactWasActive && !pactForcedByAscension;
        G.arcade.atRisk=atRiskWasActive;
        G.arcade.pactStreak=_pactStreakBefore;
        G.arcade.pactTakenEver=_pactTakenEverBefore;
      };
      if(pactWasActive) G.arcade.pactTakenEver=true;
      G.arcade.maxPactStreak=Math.max(G.arcade.maxPactStreak||0,G.arcade.pactStreak||0);
      /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — remplace `if(G.f.form<60)
         G.arcade.formBroken=true`. Drapeau « ne jamais » du même type, posé une
         fois pour toutes : une séquelle soignée plus tard au camp ne rouvre pas
         le contrat Corps intact. ==== */
      if((G.arcade.runInjuries||[]).length) G.arcade.injuredEver=true;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: GAUNTLET_BLESSURE_RUN] — remplace les 3 appels à
         l'ancienne attritionHeal() (constante no-op depuis
         GAUNTLET_SANS_MORAL_FORME, retirée — cf. F-03) : la forme remonte
         comme avant, mais un combat réellement encaissé (frappes
         significatives subies / knockdowns, lus sur res.stats.B) peut
         laisser une séquelle d'attributs pour le reste de la run. C'est le
         coût invisible de l'attrition rendu mécanique, et l'argument
         principal en faveur de l'encaissement volontaire. ==== */
      const runAttrition=()=>{
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
            _restoreOnSafetynet();
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
            _restoreOnSafetynet();
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
          _restoreOnSafetynet();
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
  setGauntletSeed(v){ G._pendingSeed=(v!==undefined&&v!==null&&String(v).trim()!=='')?String(v).trim():null; render(true); refocusInput('gauntlet-seed'); },
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
  startArcade(){ injectExtendedArchetypes(); const asc=CL._rollGauntletAsc('bracket64'); const seed=CL._rollGauntletSeed();
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts, 12/08/2026). ==== */
    const mutator=rollGauntletMutator(asc);
    G.arcade={active:true,streak:0,target:5,pool:buildArcadePool(),mode:'bracket64',seed,asc,
      riskMult:1,maxPactStreak:0,contract:drawGauntletContract(asc,mutator&&mutator.id),mutator};
    /* ==== [FIN ANCRE] ==== */
    forceFightPaceForMode('gauntlet');
    G.screen='draft'; save(); render(); },
  startBossRun(){ const asc=CL._rollGauntletAsc('boss_run'); const seed=CL._rollGauntletSeed();
    startBossRun(seed,asc); render(true); },
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
      riskMult:1,maxPactStreak:0,contract:drawGauntletContract(asc,mutator&&mutator.id),mutator};
    /* ==== [FIN ANCRE] ==== */
    forceFightPaceForMode('gauntlet');
    G.screen='draft'; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [CORRECTIF FA-06] — contrairement à newCareer() (qui repart d'un G
     entièrement neuf), startFaith() ne posait que faithDraft et l'écran :
     G.arcade/G.pending/G.opps d'une session précédente (Gauntlet en cours,
     combat carrière interrompu...) survivaient jusqu'à ce que
     finalizeFaithDraft() écrase une partie de G. Ça ne tenait que parce que
     le test `if(G.faith)` passe AVANT `if(G.arcade && G.arcade.active)` dans
     afterResult() — de la chance, pas une garantie. Même ménage explicite
     que newCareer(). ==== */
  /* ==== [ANCRE: CORRECTIF_POOL_OFFRE_SEPARE] — le pool d'une éventuelle
     carrière Faith précédente (G.faith, pas encore réinitialisé ici — ça
     n'arrive qu'à finalizeFaithDraft()) ne doit pas fuiter jusqu'à la
     première offre de la nouvelle carrière. Gardé (G.faith peut être
     absent au tout premier lancement). ==== */
  startFaith(){ G.arcade=null; G.pending=null; G.opps=null; if(G.faith) G.faith.offerPool=null;
    G.faithDraft={origin:'',style:'',lifestyle:'',circle:'',personality:'',first:'',country:COUNTRY_KEYS[0]}; G.screen='faith_draft'; save(); render(); },
  /* ==== [ANCRE: V2-43] — "confirmation explicite si une carrière est en
     cours (une carrière Faith perdue par erreur est une session
     détruite)" : startFaith() écrase la sauvegarde dès son premier
     save() (ci-dessus), sans jamais redemander — comportement
     préexistant à ce lot, gardé tel quel, seule une confirmation
     s'ajoute avant de l'atteindre depuis l'accueil Faith. */
  faithHomeNewCareer(){
    if(hasSave('faith') && !confirm('Une carrière Faith est en cours. La remplacer définitivement par une nouvelle ?')) return;
    CL.startFaith();
  },
  faithDraftIn(k,v){ G.faithDraft[k]=v; },
  selectFaithDraft(key,value){ G.faithDraft[key]=value; render(true); },
  /* ==== [ANCRE: FAITH_CREATION_SEQUENTIELLE] — la création n'est pas une
     tâche à finir mais une série de portes : on avance d'une question à la
     fois, et on peut revenir. ==== */
  faithDraftPage(delta){
    const d=G.faithDraft||{}; const max=FAITH_DRAFT_PAGES.length-1;
    d.page=clamp((d.page||0)+delta,0,max);
    render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: FAITH_SERMENTS] — le serment se jure APRÈS la synthèse et
     AVANT le premier combat : c'est la dernière décision structurante, et
     elle se prend en connaissant déjà le personnage. Quatre propositions
     tirées du pool, jamais la liste complète. ==== */
  offerFaithOaths(){
    const d=G.faithDraft;
    if(!d.div || !d.origin || !d.style || !d.lifestyle || !d.circle || !d.agent || !d.personality || !d.stable){
      G.lastMsg="Il reste une question sans réponse."; d.page=0; render(); return;
    }
    const pool=FAITH_OATHS.slice();
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    d.oathPool=pool.slice(0,4);
    G.screen='faith_oath'; render(); },
  swearOath(oathId){
    const o=FAITH_OATHS.find(x=>x.id===oathId)||null;
    G.faithDraft._oath=o?{id:o.id,label:o.label,broken:false}:null;
    CL.finalizeFaithDraft(); },
  /* ==== [FIN ANCRE] ==== */
  finalizeFaithDraft(){
    const d=G.faithDraft;
    if(!d.div || !d.origin || !d.style || !d.lifestyle || !d.circle || !d.agent || !d.personality || !d.stable){
      G.lastMsg="Il reste une question sans réponse."; d.page=0; render(); return;
    }
    const f=makeFighter({gender:d.gender||'H',div:d.div,style:d.style,countryKey:d.country||COUNTRY_KEYS[0],first:(d.first||'').trim()||undefined,age:18,freshPlayer:true});
    f.gameMode='faith';
    if(d.origin==='traditional'){ f.attrs.fightIQ+=8; f.attrs.discipline+=8; }
    if(d.origin==='pro_child'){ f.earnings=50; f.attrs.composure-=10; f.hypeBonus=1.5; }
    if(d.origin==='street'){ f.attrs.chin+=10; f.attrs.heart+=10; f.attrs.fightIQ-=5; }
    if(d.origin==='late_bloomer'){ f.attrs.power+=12; f.attrs.takedown-=10; f.attrs.submission-=10; }
    if(d.lifestyle==='pro'){ f.attrs.cardio+=10; f.form=100; }
    if(d.lifestyle==='party'){ f.form=60; f.morale=90; f.hypeBonus=(f.hypeBonus||1)+0.3; }
    if(d.circle==='family'){ f.morale=100; }
    if(d.circle==='agent'){ f.earnings=(f.earnings||0)+30; }
    /* ==== [ANCRE: FAITH_AGENT] — commission appliquée via f.agentCut, déjà lue
       par la déduction de bourse existante (ui-05) et par les événements
       "Requin" déjà présents dans le pool (req:f=>f.agentCut>0). ==== */
    const faithAgent=FAITH_AGENTS[d.agent]||FAITH_AGENTS.fidele;
    f.agentCut=faithAgent.cut||0;
    /* ==== [ANCRE: FAITH_CREATION_SEQUENTIELLE] — origine, cercle et hygiène de
       vie étaient consommés puis jetés : aucun événement ne pouvait s'y
       brancher, ils n'étaient que des deltas déguisés. Conservés sur le
       combattant, ils deviennent lisibles par le champ `req` du pool. ==== */
    /* ==== [CORRECTIF FA-24] — f._agent manquait ici : nécessaire pour que
       « Reprendre le même chemin » (scr_faith_epilogue) puisse reconstruire
       un brouillon identique sans repasser par les 9 écrans de création. */
    f._origin=d.origin; f._circle=d.circle; f._lifestyle=d.lifestyle; f._stable=d.stable; f._agent=d.agent;
    /* ==== [ANCRE: FAITH_ECURIE_DEPART] — le premier dilemme réel : une salle
       régionale fait combattre souvent contre des adversaires abordables, un
       camp d'élite fait signer plus haut, contre plus dur. On agit sur
       l'organisation de départ et sur la qualité des partenaires de salle,
       tous deux déjà pilotés par le code existant. ==== */
    if(d.stable==='elite'){ f.org=Math.max(f.org||0,1); f.earnings=(f.earnings||0)+10; f.attrs.fightIQ=clamp((f.attrs.fightIQ||50)+4,1,100); }
    /* ==== [FIN ANCRE] ==== */
    f.personality=d.personality;
    if(d.personality==='villain'){ f.hypeBonus=(f.hypeBonus||1)+0.3; f.morale=clamp(f.morale-10,0,100); }
    else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    /* ==== [CORRECTIF FA-19] — « hype ×1,4 » : hypeBonus est déjà lu par
       faithNegotiationPower() (ui-04, score++ dès qu'il dépasse 1.2), donc
       la conséquence « bourses+ » demandée par le document est obtenue
       gratuitement via le système de négociation du Lot 3, sans champ
       dédié à inventer. La pénalité « moral -8 après une victoire aux
       points ennuyeuse » est posée côté résolution de combat
       (ui-05-fight-resolution.js, ANCRE FA-19_SHOWMAN). ==== */
    else if(d.personality==='showman'){ f.hypeBonus=(f.hypeBonus||1)*1.4; }
    /* ==== [ANCRE: V3_SPECTACLE_AXIS] — Plan V3 LOT 7 §5.7.1 point 5 : "gagner
       mais être chiant / perdre mais être divertissant" — le palmarès et la
       popularité doivent être deux monnaies distinctes. f.spectacle (0-100,
       jamais affiché en chiffre — règle H.1) démarre neutre, alimenté par
       le TYPE de finish/décision à chaque combat (ANCRE V3_SPECTACLE_UPDATE,
       ui-05) et lu par la bourse du prochain gala (ANCRE V3_SPECTACLE_HYPE,
       ui-08). Portée réduite par rapport à la spec complète (postures de
       conférence et KO subis n'alimentent pas encore l'axe — la demande la
       plus riche du document, gardée pour un futur lot plutôt que bâclée). */
    f.spectacle=50;
    /* ==== [FIN ANCRE] ==== */
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
    recordCareerStart(f);
    // division/genre, qui progresseront en copiant les stats du joueur s'il
    // s'entraîne avec eux (voir CL.faithSparring).
    /* ==== [ANCRE: FAITH_ECURIE_DEPART] — un camp d'élite, ce sont d'abord des
       partenaires meilleurs que soi : le Syndrome de Frankenstein s'y
       déclenche plus tôt, ce qui est exactement le prix du prestige. ==== */
    const boost=(d.stable==='elite')?8:0;
    const p1=makeFighter({gender:f.gender,div:f.div,age:18,level:clamp(f.overall-15+boost,20,60),potential:95});
    const p2=makeFighter({gender:f.gender,div:f.div,age:21,level:clamp(f.overall-10+boost,20,60),potential:85});
    p1.isGymPartner=true; p2.isGymPartner=true;
    p1.nick='Le Prodige'; p2.nick='L\u2019Aspirant';
    /* ==== [ANCRE: V2-07] \u2014 affinity (0-3) et sessions comptent la familiarit\u00e9
       avec CHAQUE partenaire s\u00e9par\u00e9ment, lues par faithSparring(). ==== */
    p1.affinity=0; p1.sessions=0; p2.affinity=0; p2.sessions=0;
    /* ==== [ANCRE: V2-11] \u2014 fra\u00eecheur de d\u00e9part : "pr\u00eat", pas "aff\u00fbt\u00e9" \u2014
       une carri\u00e8re commence en forme normale, pas au sommet absolu. */
    f.freshness=70;
    G.faith={year:2026,fightsThisYear:0,startOfYearElo:f.careerElo,startOfYearEarnings:f.earnings||0,
      startOfYearChampion:false,startOfYearRank:divRank(f),startOfYearNemesisBeaten:false,gym:[p1,p2],
      agent:faithAgent,agentPatience:3};
    ensureSparringPrimary();
    /* ==== [ANCRE: FAITH_SERMENTS] — le serment vit sur la partie, pas sur le
       brouillon de création : il doit survivre au rechargement. ==== */
    if(G.faithDraft && G.faithDraft._oath) G.faith.oath=G.faithDraft._oath;
    forceFightPaceForMode('faith');
    /* ==== [ANCRE: V3_FAITH_COACH] — Plan V3 LOT 2 §P04/§P08 : le coach
       affiché sur Contacts était la chaîne littérale 'Le coin' — jamais un
       nom. personEnsure('coach',{slot:'main'}) (PersonRegistry, LOT 0)
       tire UNE fois, ici, un vrai coach du pool FAITH_COACHES (data-people.
       js, déjà livré en LOT 0 mais jamais câblé jusqu'ici) — palmarès,
       défaut et spécialité déjà portés par la Person, réutilisés tels
       quels par scr_faith_contacts() (ui-04). G.faith.coachId est la
       référence stable, jamais recalculée. */
    G.faith.coachId=personEnsure('coach',{slot:'main'}).id;
    G.season={year:1,fights:[]};
    /* ==== [ANCRE: FAITH_CALENDRIER] — la première année se génère ici, les
       suivantes dans nextFaithYear(). faithLandOnMonth() saute les mois vides
       (le mois 0 peut l'être) jusqu'au premier mois occupé. ==== */
    G.faith.month=0; G.faith.calendar=faithGenerateCalendar(f);
    faithLandOnMonth();
    G.screen='faith_hub'; save(); render();
  },
  /* ==== [CORRECTIF FA-15] — "Se reposer" (engine.js) donnait +25 forme/+10
     moral SANS AUCUN COÛT : un choix dominant dès que la forme est basse, et
     un choix vide sinon. Un coût narratif plutôt que chiffré — restedThisYear,
     consommé par nextFaithYear() qui fait alors progresser les partenaires
     un peu plus vite CETTE année-là (sans vous pour les canaliser). ==== */
  faithRest(){
    if(!faithClaimMonth('rest')) return;
    G.f.form=clamp(G.f.form+25,0,100); G.f.morale=clamp(G.f.morale+10,0,100);
    /* ==== [ANCRE: V2-11] — le repos est la seule action qui restaure
       vraiment la fraîcheur (le reste du temps ne fait que la grignoter
       moins, cf. le petit regain passif de faithAdvanceMonth()). ==== */
    G.f.freshness=clamp((G.f.freshness==null?70:G.f.freshness)+25,0,100);
    G.faith.restedThisYear=true;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Intersaison',choice:'Repos et récupération'});
    faithAdvanceMonth();
  },
  /* ==== [ANCRE: V2-07/V2-08] — "tourner avec" n'est plus un geste identique
     à chaque fois : la familiarité avec CE partenaire précis (partner.
     sessions, incrémentée ici) détermine ce que la séance rapporte. Palier 0
     (jamais vu travailler) : rien de ciblé, juste la découverte de son
     style. Palier 1 (~1-2 séances, "il vous jauge") : petit gain large.
     Palier 2 (~3-4 séances, "il vous lit") : gain ciblé + clé de repérage
     sur le prochain adversaire (scoutKey, lue par scr_faith_offer, ui-04).
     Palier 3 (5 séances et plus, "il vous connaît par cœur") : gain fort ET
     ouverture du Syndrome de Frankenstein — qui ne se déclenche donc plus
     dès la première séance comme avant ce correctif, mais seulement une
     fois la familiarité maximale atteinte. La clé de repérage, elle,
     récompense la catégorie "précision" dès le palier 2, pas seulement au
     sommet. ==== */
  faithSparring(partnerId){
    const partner=(G.faith.gym||[]).find(p=>p.id===partnerId); if(!partner) return;
    if(!faithClaimMonth('sparring:'+partnerId)) return;
    G.f.form=clamp(G.f.form+15,0,100);
    G.f.freshness=clamp((G.f.freshness==null?70:G.f.freshness)-10,0,100);
    const priorSessions=partner.sessions||0;
    partner.affinity=clamp((partner.affinity||0)+1,0,3);
    partner.sessions=priorSessions+1;
    let tierMsg;
    if(priorSessions===0){
      applyDeltas(G.f,[['fightIQ',1]]);
      tierMsg=`Première séance ensemble : vous ne l’aviez jamais vu travailler. Vous découvrez son style, ${esc(partner.styleLabel||'')}.`;
    } else if(priorSessions<3){
      applyDeltas(G.f,[['fightIQ',1],[pick(TRAINABLE),1]]);
      G.faith.scoutKey=true;
      tierMsg=`Il commence à vous jauger. Séance utile, sans plus.`;
    } else if(priorSessions<5){
      applyDeltas(G.f,[['fightIQ',2],[pick(TRAINABLE),2]]);
      G.faith.scoutKey=true;
      tierMsg=`Il vous lit, maintenant, et cale la séance sur ce qui vous attend.`;
    } else {
      G.faith.scoutKey=true;
      const bestStats=ATTR_KEYS.map(k=>({k,v:G.f.attrs[k]})).sort((a,b)=>b.v-a.v).slice(0,2);
      applyDeltas(G.f,[[bestStats[0].k,2],['fightIQ',2]]);
      // Syndrome de Frankenstein : le partenaire copie violemment les 2
      // meilleures stats du joueur — c'est lui qui, des années plus tard,
      // reviendra armé de vos propres armes.
      applyDeltas(partner,[[bestStats[0].k,3],[bestStats[1].k,3],['adaptability',2],['fightIQ',2]]);
      partner.overall=overall(partner);
      tierMsg=`Il vous connaît par cœur. ${esc(partner.first)} a parfaitement mimé votre ${attrLabel(bestStats[0].k)}. Il progresse à une vitesse terrifiante.`;
    }
    G.lastMsg=tierMsg;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Sparring',choice:`A tourné avec ${esc(partner.name)}`});
    faithAdvanceMonth();
  },
  /* ==== [ANCRE: V2-10] — le stage unique (perk 'tiger' tiré au hasard) est
     remplacé par un choix réel entre plusieurs salles nommées (FAITH_GYMS,
     data-people.js — cf. CORRECTIF C11, ui-04), chacune avec son coût, sa
     famille d'attributs, son risque et son texte de retour propre — plus un
     menu de sélection à part entière qu'une décision narrative sous
     tension, la règle des 3 options (H.3) ne s'y applique donc pas (comme
     les autres écrans de type "vitrine" du jeu : choix de style, de camp
     d'entraînement en carrière...). ==== */
  faithCamp(){
    G.screen='faith_camps'; save(); render();
  },
  /* ==== [CORRECTIF C11] — campId référence désormais un id de FAITH_GYMS
     (gym_xxx) ; le repli sur FAITH_CAMPS (co_/thai/wrestling/...) n'est
     gardé que pour une sauvegarde antérieure à ce correctif, jamais proposé
     par l'écran depuis. faithGymAsCamp() (state.js) traduit la salle dans
     la même forme qu'un ancien camp, pour ne garder qu'une seule mécanique
     de résolution ci-dessous. */
  faithCampChoose(campId){
    const gym=(typeof FAITH_GYMS!=='undefined'?FAITH_GYMS:[]).find(g=>g.id===campId);
    const camp=gym?faithGymAsCamp(gym):(typeof FAITH_CAMPS!=='undefined'?FAITH_CAMPS:[]).find(c=>c.id===campId);
    if(!camp) return;
    const f=G.f;
    if((f.earnings||0)<camp.cost){ G.lastMsg=`Fonds insuffisants pour ce stage (${camp.cost}k$).`; render(); return; }
    /* ==== [ANCRE: V2-11] — "le coach refuse en-dessous d'à bout" : jamais
       de chiffre, une phrase qui ferme la porte. ==== */
    if(freshnessTier(f).tier==='about'){
      G.lastMsg="Votre coach refuse net : «Tu n’as plus rien à donner à un stage, là. Tu vas juste te faire mal.»";
      render(); return;
    }
    if(!faithClaimMonth('camp:'+campId)) return;
    const F=G.faith;
    if(F.pendingIntersaisonEntry){
      if(!F.intersaisonCooldown) F.intersaisonCooldown={};
      F.intersaisonCooldown[F.pendingIntersaisonEntry]=3;
      F.lastTrio=(F.currentIntersaison&&F.currentIntersaison.picks)||F.lastTrio;
      F.currentIntersaison=null;
      F.pendingIntersaisonEntry=null;
    }
    f.earnings-=camp.cost;
    const already=(G.faith.campsVisited||[]).includes(camp.id);
    if(!G.faith.campsVisited) G.faith.campsVisited=[];
    if(!already) G.faith.campsVisited.push(camp.id);
    const freshCost=already?Math.round(camp.freshCost*0.6):camp.freshCost;
    f.freshness=clamp((f.freshness==null?70:f.freshness)+freshCost,0,100);
    const riskMult=(freshnessTier(f).tier==='vide'||freshnessTier(f).tier==='emousse')?1.6:1;
    if(camp.risk>0 && rnd()<camp.risk*riskMult){
      const inj=rollInjury(); f.injury={name:inj.name,left:inj.fights};
      f.morale=clamp(f.morale-10,0,100);
      G.lastMsg=`${camp.name} : blessure au stage. ${inj.name}.`;
      if(!G.faith.yearLog) G.faith.yearLog=[];
      G.faith.yearLog.push({title:'Intersaison',choice:`Stage — ${camp.name} (blessure)`});
      faithAdvanceMonth(); return;
    }
    const gainMult=already?0.5:1;
    const deltas=camp.attrs.map(k=>[k,Math.max(1,Math.round(3*gainMult))]);
    applyDeltas(f,deltas);
    G.lastMsg=already?camp.repeatText:camp.text;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Intersaison',choice:`Stage — ${camp.name}`});
    faithAdvanceMonth();
  },
  /* ==== [ANCRE: V2-09] — point d'entrée unique de l'intersaison : quelle
     que soit l'entrée du pool choisie, le cooldown (3 intersaisons) et
     F.lastTrio (jamais le même trio deux ans de suite) se posent ICI,
     avant de router vers l'action réelle — camp/sparring/repos restent des
     primitives réutilisables, indépendantes du système de pool. ==== */
  faithIntersaisonChoose(entryId){
    const F=G.faith, f=G.f;
    const entry=(typeof FAITH_INTERSAISON_POOL!=='undefined'?FAITH_INTERSAISON_POOL:[]).find(e=>e.id===entryId);
    if(!entry) return;
    F.pendingIntersaisonEntry=null;
    if(entry.action==='camp'){
      /* Le stage ouvre un sous-écran (choix parmi 6, cf. V2-10) : le
         cooldown/lastTrio de CE choix de pool ne sont posés qu'à la
         résolution réelle du stage (faithCampChoose), pas ici — revenir en
         arrière sans choisir de camp ne doit pas "consommer" l'intersaison. */
      F.pendingIntersaisonEntry=entryId;
      CL.faithCamp(); return;
    }
    if(!F.intersaisonCooldown) F.intersaisonCooldown={};
    F.intersaisonCooldown[entryId]=3;
    F.lastTrio=(F.currentIntersaison&&F.currentIntersaison.picks)||F.lastTrio;
    F.currentIntersaison=null;
    if(!F.yearLog) F.yearLog=[];
    if(entry.action==='rest'){ CL.faithRest(); return; }
    /* ==== [ANCRE: CORRECTIF_SPARRING_TRI_RESIDUEL] — dernier site de tri au
       rendu ayant survécu à V3_SPARRING_PRIMARY. Aligné sur ui-04 (l'écran lit
       F.sparringPrimaryId pour NOMMER le partenaire) : l'action doit viser la
       même personne que celle affichée. ==== */
    if(entry.action==='sparring_top'){
      const tp=(F.gym||[]).find(p=>p.id===F.sparringPrimaryId)||(F.gym||[])[0];
      if(tp) CL.faithSparring(tp.id); else CL.faithRest();
      return;
    }
    if(entry.action==='sparring_second'){
      const sp=(F.gym||[]).find(p=>p.id!==F.sparringPrimaryId);
      if(sp) CL.faithSparring(sp.id); else CL.faithRest();
      return;
    }
    if(entry.action==='scout_video'){
      if(!faithClaimMonth('scout_video')) return;
      f.freshness=clamp((f.freshness==null?70:f.freshness)-3,0,100);
      F.scoutKey=true;
      applyDeltas(f,[['fightIQ',1]]);
      G.lastMsg='Des heures à décortiquer ses combats. Vous savez désormais où il est le plus dangereux.';
      F.yearLog.push({title:'Intersaison',choice:'Étude vidéo'});
      faithAdvanceMonth(); return;
    }
    if(entry.action==='sponsor'){
      if(!faithClaimMonth('sponsor')) return;
      f.earnings=(f.earnings||0)+15; f.morale=clamp(f.morale+5,0,100);
      G.lastMsg='Un partenariat modeste, mais qui tombe bien.';
      F.yearLog.push({title:'Intersaison',choice:'Rencontre sponsor'});
      faithAdvanceMonth(); return;
    }
    CL.faithRest();
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
    /* ==== [ANCRE: FAITH_OFFRES_TENTATION] — les offres de privilège rejoignent
       le pool des mois-vie : elles viennent au joueur au lieu de l'attendre
       dans un menu. Elles restent minoritaires (une chance sur trois d'y
       basculer) pour ne pas transformer le mode en catalogue ambulant, et la
       mémoire seenEvents s'applique à elles comme au reste. La distinction
       "temps 1 (la salle) / temps 3 (le monde)" a disparu avec le calendrier
       à 12 mois (FA-11, plusieurs mois-vie génériques plutôt que deux temps
       ordonnés) : la même chance s'applique à chaque mois-vie. ==== */
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    const base=FAITH_LIFE_EVENTS.concat(FAITH_BRANCH_EVENTS);
    const source=(rnd()<0.34)
      ? FAITH_PERK_OFFERS.concat(base)
      : base;
    let pool=source.filter(e=>!G.faith.seenEvents.includes(e.id) && (!e.req||e.req(G.f)));
    if(pool.length===0){ G.faith.seenEvents=[]; pool=source.filter(e=>!e.req||e.req(G.f)); }
    G.faith.currentEvent=pick(pool);
    G.screen='faith_event'; save(); render();
  },
  chooseFaithEvent(i){
    const ev=G.faith.currentEvent; if(!ev) return;
    /* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — voir faithClaimMonth().
       Ici le témoin est eventResolved (posé en fin de fonction, lu par
       scr_faith_event pour la vue « résolue ») : un double-tap débitait c.cost
       deux fois, appliquait les deltas deux fois, et incrémentait hiddenTraits
       deux fois — un trait permanent se cristallisait en 2 choix au lieu des
       3 annoncés. ==== */
    if(G.faith.eventResolved) return;
    const c=ev.choices[i]; if(!c) return;
    /* ==== [CORRECTIF C12] — Plan V4 LOT 5 : "Chercher un préparateur
       au-dessus" n'applique plus de delta d'attributs — l'effet réel est un
       nouveau coach, choisi sur un écran dédié (scr_faith_coach_choice,
       ui-04). Retour anticipé AVANT la résolution générique plus bas
       (cost/d ne s'appliquent pas à ce choix) ; oathBreak reste pertinent
       ici (rompre le serment "homegrown" en allant chercher ailleurs) donc
       reproduit explicitement puisqu'on saute le bloc générique. */
    if(ev.id==='evt_br_regional_coach' && i===1){
      if(c.oathBreak && G.faith.oath && G.faith.oath.id===c.oathBreak) G.faith.oath.broken=true;
      if(!G.faith.seenEvents) G.faith.seenEvents=[];
      G.faith.seenEvents.push(ev.id);
      G.faith.currentEvent=null;
      G.faith.currentCoachChoices=null;
      G.screen='faith_coach_choice';
      save(); render();
      return;
    }
    if(c.cost && (G.f.earnings||0)<c.cost){ G.lastMsg="Fonds insuffisants ("+c.cost+"k$)."; render(); return; }
    if(c.cost) G.f.earnings-=c.cost;
    if(c.reward) G.f.earnings=(G.f.earnings||0)+c.reward;
    /* ==== [ANCRE: FAITH_RISQUE_DECLARE] — résolution du pari. Un choix sans
       champ `risk` reste strictement déterministe : le pool existant continue
       de fonctionner sans modification. c.d est par ailleurs facultatif
       depuis les offres de privilège — un choix peut n'avoir aucun delta
       propre et ne faire que déclencher un achat. ==== */
    const failed=c.risk?(rnd()<c.risk):false;
    applyDeltas(G.f,(failed?c.bad:c.d)||[]);
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: FAITH_OFFRES_TENTATION] — un choix peut désormais déclencher
       un privilège. buyFaithPerk() gère seule l'argent, le tirage et ses
       conséquences ; elle peut même clore l'année sur une suspension, auquel
       cas on lui laisse la main sans poursuivre le déroulé de l'événement. ==== */
    /* ==== [ANCRE: FAITH_SERMENTS] — un choix peut rompre un serment nommé.
       Champ déclaratif : aucune logique par serment n'est câblée ici. ==== */
    if(c.oathBreak && G.faith.oath && G.faith.oath.id===c.oathBreak) G.faith.oath.broken=true;
    if(c.perk){
      /* ==== [ANCRE: CORRECTIF_PERK_ACHAT_RATE] — buyFaithPerk() peut sortir
         sur « Fonds insuffisants » sans rien acheter ; le mois était pourtant
         consommé, et le journal de l'année avait déjà enregistré le choix
         comme accompli. On ne l'inscrit qu'après confirmation de l'achat. ==== */
      const _avant=G.f.earnings||0;
      CL.buyFaithPerk(c.perk);
      if((G.f.earnings||0)===_avant && String(G.lastMsg||'').indexOf('Fonds insuffisants')===0){
        G.faith.currentEvent=ev; return;
      }
      if(!G.faith.yearLog) G.faith.yearLog=[];
      G.faith.yearLog.push({title:ev.title,choice:c.label});
      if(!G.faith.seenEvents) G.faith.seenEvents=[];
      G.faith.seenEvents.push(ev.id);
      G.faith.currentEvent=null;
      /* buyFaithPerk('ped') peut clore l'année elle-même (suspension) et a
         déjà changé G.screen dans ce cas : ne PAS avancer le mois par-dessus
         un bilan déjà affiché. */
      if(G.screen!=='faith_year_end') faithAdvanceMonth();
      return;
    }
    /* ==== [FIN ANCRE] ==== */
    // Syndrome de Frankenstein : le protégé qui trahit rejoint réellement le
    // roster de l'organisation, en Némésis si aucune n'est encore verrouillée.
    if(ev.id==='evt_frankenstein_betrayal'){
      const monster=(G.faith.gym||[]).find(p=>p.id===ev.monsterId);
      if(monster){
        /* ==== [CORRECTIF C13] — départ EXPLICITE et daté de la Person du
           protégé, avant de le retirer de G.faith.gym : le repli générique
           d'ensureSparringPrimary() (juste plus bas) ne doit jamais avoir à
           deviner pourquoi — la vraie raison, la meilleure, est connue ici. */
        const leaving=faithSparringPerson(monster);
        if(leaving) personDepart(leaving,'A quitté la salle pour signer chez l’adversaire, après sa trahison.');
        monster.org=G.f.org; monster.stage='pro';
        monster.W=Math.max(0,G.f.W-2); monster.L=1;
        monster.orgWins=0;
        monster.orgElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+150);
        monster.careerElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+100);
        G.roster.push(monster);
        /* ==== [CORRECTIF FA-26] — la trahison du protégé est le MEILLEUR
           cas de némésis (elle porte tout un fil narratif propre, contre le
           franchissement de rang qui est un déclencheur générique) : elle
           doit primer et remplacer une némésis déjà verrouillée, pas
           seulement combler l'absence d'une. Le palmarès tête-à-tête
           (nemesisRecord, ui-05) repart de zéro : il ne concerne que la
           némésis EN COURS. */
        lockFaithNemesis(monster);
        if(!G.f._rivalries) G.f._rivalries={};
        G.f._rivalries[monster.id]=3;
        G.faith.gym=G.faith.gym.filter(p=>p.id!==monster.id);
        ensureSparringPrimary();
        G.roster=rankPool(G.roster);
      }
    }
    /* ==== [ANCRE: V3_REGIONAL_CEILING_WORLD] — Plan V3 LOT 6 §5.6.3 point 4 :
       "Les choix changent l'univers, pas les attributs […] deux univers de
       jeu différents, pas deux +1." "Aller chercher plus loin" déplace
       réellement la carrière (nouvelle organisation, nouveau bassin
       d'adversaires — même mécanisme que acceptPromo()/free agency en
       carrière). "Régner sur son territoire" ouvre un statut permanent et
       VISIBLE (f.faithTraits, déjà affiché sur le hub, ui-04) — pas un
       delta d'attribut de plus. */
    if(ev.id==='evt_br_regional_ceiling'){
      if(i===0 && G.f.org<6){
        /* ==== [ANCRE: CORRECTIF_PROMOTION_INCOMPLETE] — bug trouvé : ce
           mouvement d'organisation dupliquait acceptPromo() sans trois de
           ses réinitialisations. Un champion régional emportait sa ceinture
           dans la nouvelle organisation (resolveFight() continuait d'en
           compter les défenses, et faithGalaPosition le maintenait en Main
           event via f.champion) ; le contrat de l'ancienne ligue restait
           actif dans la nouvelle ; applyOrgAdvancementBoost() — appliqué par
           tous les autres chemins de promotion — était sauté. La dissolution
           silencieuse de la némésis (sans message ni entrée yearLog) est
           également corrigée : même pattern que l'ancre V2-14 un peu plus
           bas dans ce fichier, "dissoute, jamais annulée en silence". ==== */
        G.f.org++; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0;
        if(G.f.faithNemesisId){
          if(!G.faith.yearLog) G.faith.yearLog=[];
          G.faith.yearLog.push({title:'Rivalité dissoute',choice:'Changement d’organisation'});
          G.lastMsg=(G.lastMsg?G.lastMsg+' ':'')+"Votre rivalité n'a plus de sens dans cette nouvelle organisation.";
        }
        G.f.rivalId=null; G.f.faithNemesisId=null; G.f.nemesisRecord=null;
        G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0;
        if(typeof ORG_FLAVORS!=='undefined' && ORG_FLAVORS[G.f.org]) G.f.orgFlavor=pick(ORG_FLAVORS[G.f.org]);
        G.f.contract=generateContract(G.f,G.f.org,false);
        applyOrgAdvancementBoost(G.f,G.f.org);
        G.roster=makeOrgRoster(G.f);
        /* ==== [ANCRE: V4_C16_TERRITOIRE_GALA] — Plan V4 LOT 6 C16 : au-delà
           du bassin d'adversaires (déjà changé ci-dessus), "aller chercher
           plus loin" pilote aussi le tirage des galas (faithGalaCity,
           ui-04) — ne plus jouer qu'à l'étranger, jamais plus à domicile. */
        G.faith.territoire='international';
      } else if(i===1){
        if(!G.f.faithTraits) G.f.faithTraits=[];
        if(!G.f.faithTraits.includes('Patron régional')) G.f.faithTraits.push('Patron régional');
        // "Régner sur son territoire" : même mécanisme, en sens inverse —
        // les galas ne se tiennent plus que dans le pays du combattant.
        // (G.faith.regionalPatron, écrit ici auparavant, n'était lu nulle
        // part : l'effet réel passe entièrement par faithTraits/territoire.)
        G.faith.territoire='regional';
      }
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [CORRECTIF C12] — "Rester fidèle" ne devait plus être la branche
       perdante par défaut (moral/cœur contre une pénalité d'IQ) : la fidélité
       gagne un effet réel sur la relation avec le coach — une vraie Person
       depuis LOT 2 (faithCoachPerson) — plutôt qu'un chiffre de plus sur f. */
    if(ev.id==='evt_br_regional_coach' && i===0){
      const coach=faithCoachPerson(G.faith);
      coach.rel.trust=clamp(coach.rel.trust+15,0,100);
      coach.rel.arc.push({year:G.faith.year,text:'Vous êtes resté fidèle, malgré son plafond.'});
    }
    /* ==== [FIN ANCRE] ==== */
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    G.faith.seenEvents.push(ev.id);
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:ev.title,choice:c.label,outcome:failed?'raté':'réussi'});
    // Moteur d'émergence : un choix taggé traitTag renforce une tendance cachée ;
    // au 3e choix dans la même direction, elle se cristallise en trait permanent.
    let traitAcquired=null;
    if(c.traitTag){
      if(!G.f.hiddenTraits) G.f.hiddenTraits={};
      if(!G.f.faithTraits) G.f.faithTraits=[];
      G.f.hiddenTraits[c.traitTag]=(G.f.hiddenTraits[c.traitTag]||0)+1;
      const TRAIT_NAMES={rebel:'Tête Brûlée',ascetic:'Ascète',showman:'Showman'};
      const traitName=TRAIT_NAMES[c.traitTag];
      if(traitName && G.f.hiddenTraits[c.traitTag]>=3 && !G.f.faithTraits.includes(traitName)){
        G.f.faithTraits.push(traitName);
        traitAcquired=traitName;
      }
    }
    /* ==== [CORRECTIF FA-20] — les deltas ne s'affichaient qu'AVANT le choix
       (formatEventDelta() visible sur chaque carte), l'exact inverse de la
       règle déjà tenue par la création (FAITH_CREATION_SEQUENTIELLE) : le
       joueur arbitrait sur les chiffres, jamais sur le texte. G.faith.
       currentEvent n'est PLUS effacé ici — scr_faith_event() (ui-04) en a
       encore besoin pour rendre la vue "résolue" (choix retenu seul,
       conséquence révélée) sur ce même écran. L'avance de temps
       (step/écran), qui effaçait currentEvent au passage, est repoussée
       dans faithEventContinue(), déclenchée par le bouton CONTINUER de
       cette vue résolue. ==== */
    G.faith.eventResolved={idx:i,failed,deltas:(failed?c.bad:c.d)||[],reward:c.reward||0,traitAcquired};
    save(); render();
  },
  /* ==== [ANCRE: FAITH_CALENDRIER] — l'avance de temps n'a plus lieu au
     moment du choix (correctif FA-20) mais au clic sur CONTINUER, une fois
     la conséquence lue ; elle avance désormais le CALENDRIER (FA-11) plutôt
     que le compteur `step` à 5 temps fixes. ==== */
  faithEventContinue(){
    G.faith.currentEvent=null;
    G.faith.eventResolved=null;
    faithAdvanceMonth();
  },
  /* ==== [CORRECTIF C12] — résolution de scr_faith_coach_choice() : contrat
     avec l'ancien coach rompu (personDepart via faithHireCoach, state.js —
     jamais un simple écrasement de F.coachId), le nouveau prend sa place
     sous la même clé stable. Même schéma que faithCampChoose() : la
     conséquence choisie EST l'écran qu'on vient de quitter, donc on avance
     directement le mois plutôt que de repasser par la vue "résolue" d'un
     événement de vie ordinaire. */
  chooseFaithCoach(coachId){
    if(!faithClaimMonth('coach:'+coachId)) return;
    const F=G.faith;
    const old=faithCoachPerson(F);
    const hired=faithHireCoach(coachId,`Vous avez quitté ${personName(old,{withNick:true})} pour un préparateur au-dessus.`);
    G.lastMsg=`${personName(hired,{withNick:true})} accepte de vous entraîner désormais.`;
    if(!F.yearLog) F.yearLog=[];
    F.yearLog.push({title:'Nouveau coach',choice:personName(hired,{withNick:true})});
    F.currentCoachChoices=null;
    faithAdvanceMonth();
  },
  /* ==== [ANCRE: FAITH_BOUTON_BLESSURE] — startFightSelect() (ui-02) commence
     par `if(G.f.injury) return;`, un no-op total : ni message, ni render. Le
     bouton "ENTRER DANS LA CAGE" semblait mort au clic. fightsThisYear était
     en plus incrémenté AVANT cet appel, donc même ce clic sans effet visible
     faussait le compteur (repris tel quel dans le bilan annuel — cf.
     FAITH_COMPTEUR_COMBATS un peu plus bas, qui déplace l'incrément au bon
     endroit). On coupe court ici, avec un message, avant de toucher au
     compteur ou d'appeler startFightSelect(). ==== */
  /* ==== [CORRECTIF FA-12] — remplace le menu à 3 adversaires
     (startFightSelect()/scr_select, le matchmaking du mode carrière) par une
     offre UNIQUE apportée par l'agent : un menu à trois options où l'une est
     objectivement la meilleure n'est pas un choix, c'est un test de lecture.
     Une offre à accepter ou refuser est une décision sous incertitude — la
     refuser a un coût réel (la case combat de l'année est perdue). Voir
     faithGenerateOffer() ci-dessous. ==== */
  /* ==== [ANCRE: V3_TITLE_MERIT_GATE] — Plan V3 LOT 6 §5.6.1, temps 2 "Le
     mérite" : la toute première fois qu'un combat de titre devient
     accessible (fightKind()==='title', ui-05 — le combattant n'est pas
     encore champion), on s'arrête sur un écran qui expose FACTUELLEMENT
     pourquoi ("ta série, qui tu as battu, qui tu as passé devant"), avant
     même l'offre. G.faith.titleShotSeen empêche de rejouer cet écran à
     chaque mois tant que l'éligibilité reste vraie (sinon "ENTRER DANS LA
     CAGE" s'arrêterait dessus indéfiniment) ; remis à false dès que
     fightKind() n'est plus 'title', pour qu'une FUTURE fenêtre d'éligibilité
     (après une défaite, une nouvelle série) déclenche à nouveau l'écran. */
  faithFight(){
    if(G.f.injury){ G.lastMsg="Toujours à l'infirmerie — pas de combat tant que le corps n'est pas prêt."; render(); return; }
    const kind=fightKind();
    if(kind!=='title') G.faith.titleShotSeen=false;
    else if(!G.faith.titleShotSeen){
      G.faith.titleShotSeen=true;
      G.screen='faith_title_merit'; save(); render(); return;
    }
    faithGenerateOffer();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [CORRECTIF FA-12] — signer l'offre telle quelle. G.opps est réduit
     à ce seul candidat puis CL.opp(0) (ui-08, branche G.faith déjà en place)
     est réutilisée intégralement : pesée, malus/buffs en attente, tout le
     reste de la mise en jambe d'un combat Faith — un seul chemin de code,
     pas une copie. Cette branche lit G.faith.pendingOffer elle-même pour
     appliquer le multiplicateur de bourse et le nombre de rounds du gala. ==== */
  /* ==== [ANCRE: V2-23/V2-25] — chaîne entre la signature et l'entrée en
     cage : un événement de build-up d'abord (tout combat, V2-23), puis la
     conférence de presse si le gala l'impose (Main event uniquement,
     V2-25). Chaque étape pose son propre drapeau "Done" sur l'offre pour
     ne jamais se rejouer si l'écran est réaffiché sans avoir progressé. */
  faithOfferSign(){
    const off=G.faith.pendingOffer; if(!off) return;
    /* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — cette fonction est une
       machine à états avancée par les clics (build-up -> conférence -> pesée).
       Sans verrou, un double-tap sur SIGNER franchissait DEUX étapes : le
       build-up était tiré (currentBuildupEvent posé) puis jamais affiché, et
       la scène sautait directement à la conférence. ==== */
    if(off._signStep===G.screen) return;
    off._signStep=G.screen;
    if(!G.faith.buildup) G.faith.buildup={attente:0,tension:0,causes:[]};
    if(!off.buildupDone){
      off.buildupDone=true;
      G.faith.currentBuildupEvent=faithBuildupPick(G.f,G.faith);
      G.screen='faith_buildup'; save(); render();
      return;
    }
    if(off.gala && off.gala.pressConf && !off.pressConfDone){
      off.pressConfDone=true;
      G.screen='faith_press_conf'; save(); render();
      return;
    }
    CL.faithProceedToPesee();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V4_C19_PESEE_GATING] — Plan V4 LOT 7 §C19 point 3 : "gating
     obligatoire : même condition que pressConf (rang<=4, champion, ou
     rival), deux temps forts maximum par carte." off.gala.pressConf EST
     cette condition (faithGalaPosition, ui-04) — la réutiliser telle
     quelle garantit que la pesée ne sort jamais sur plus de fights que la
     conférence de presse. Les deux ne peuvent apparaître que sur la MÊME
     carte (jamais l'une sans l'autre), ce qui plafonne à deux le nombre
     de temps forts avant l'entrée en cage — sans ce plafond, on recrée
     exactement le problème P15.1 (une interruption obligatoire à chaque
     combat, cf. LOT 5). Fonction PARTAGÉE plutôt qu'un bloc dans
     faithOfferSign() : faithPressConfPosture() (qui gère la conférence)
     saute directement à CL.opp(0) une fois la posture choisie — sans ce
     point d'entrée commun, la pesée ne sortirait JAMAIS sur les combats
     qui passent par la conférence, exactement ceux qu'elle vise. */
  faithProceedToPesee(){
    const off=G.faith.pendingOffer; if(!off) return;
    if(off.gala && off.gala.pressConf && !off.peseeDone){
      off.peseeDone=true;
      const registre=faithPeseeRegistre(G.f);
      if(!TEXT_POOLS['faith_pesee_situation']) registerTextPool('faith_pesee_situation',FAITH_PESEE_SITUATIONS);
      const o=off.opp.o;
      const line=txtPick('faith_pesee_situation',{rankTier:registre,personality:G.f.personality,trait:(o.bio&&o.bio.trait)||'',oppName:o.name,F:G.f});
      off.pesee={registre,line};
      G.screen='faith_pesee'; save(); render();
      return;
    }
    G.opps=[off.opp];
    CL.opp(0);
  },
  faithPeseeContinue(){
    const off=G.faith.pendingOffer; if(!off) return;
    G.opps=[off.opp];
    CL.opp(0);
  },
  /* ==== [ANCRE: V3_TITLE_REVENGE_CLAUSE] — Plan V3 LOT 6 §5.6.1, temps 3 :
     "clause de revanche" — un des leviers propres à scr_faith_title_
     negotiation (ui-04), jamais proposé sur une offre ordinaire. Simple
     bascule (pas de coût immédiat, contrairement à demander plus d'argent)
     : son seul effet est consommé PLUS TARD, et seulement en cas de
     défaite (ui-05, ANCRE V3_TITLE_LOSS_CLAUSE) — poser la clause n'a
     donc aucun risque à signer, cohérent avec ce qu'elle représente
     (une garantie, pas une négociation financière). */
  faithTitleToggleRevengeClause(){
    const off=G.faith.pendingOffer; if(!off) return;
    G.faith.pendingRevengeClause=!G.faith.pendingRevengeClause;
    save(); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V2-23] — applique le choix (deux options, réponse
     immédiate) puis reprend la chaîne (faithOfferSign() gère la suite :
     conférence ou signature directe). */
  faithBuildupChoose(idx){
    const ev=G.faith.currentBuildupEvent; if(!ev) return;
    const c=ev.choices[idx]; if(!c) return;
    const F=G.faith;
    if(c.dv){
      if(c.dv.attente) F.buildup.attente=Math.max(0,F.buildup.attente+c.dv.attente);
      if(c.dv.tension) F.buildup.tension=Math.max(0,F.buildup.tension+c.dv.tension);
    }
    if(c.money) G.f.earnings=(G.f.earnings||0)+c.money;
    if(c.morale) G.f.morale=clamp((G.f.morale||60)+c.morale,0,100);
    if(c.director) faithDirectorAdjust(G.f.org,c.director);
    F.buildup.causes.push({title:ev.title,choice:c.label});
    G.faith.currentBuildupEvent=null;
    CL.faithOfferSign();
  },
  /* ==== [ANCRE: V2-25/V2-27] — trois postures, toutes valables (règle
     H.3). La provocation plante une promesse (V2-27, "je le finis") —
     rappelée à la résolution du combat (ui-05, ANCRE V2-27) puis dans
     la coupure de presse annuelle si elle a été tenue ou trahie. */
  faithPressConfPosture(posture){
    const off=G.faith.pendingOffer; if(!off) return;
    if(!G.faith.buildup) G.faith.buildup={attente:0,tension:0,causes:[]};
    const F=G.faith;
    if(posture==='respect'){
      F.buildup.tension=Math.max(0,F.buildup.tension-1);
      faithDirectorAdjust(G.f.org,1);
      G.lastMsg="Ton posé, poignée de main. Le directeur retient le geste.";
    } else if(posture==='provocation'){
      F.buildup.attente++; F.buildup.tension++;
      F.promise={type:'finish',oppId:off.opp.o.id,oppName:off.opp.o.name};
      G.lastMsg="Vous avez promis de le finir — la salle ne l’oubliera pas si vous n’y arrivez pas.";
    } else {
      F.buildup.attente=Math.max(0,F.buildup.attente-1);
      G.f.morale=clamp((G.f.morale||60)+5,0,100);
    }
    CL.faithProceedToPesee();
  },
  /* ==== [CORRECTIF FA-13 / V2-20] — patience à 0 : l'agent négocie quand
     même (jamais de blocage dur), juste avec une réserve affichée — c'est
     le franchissement à 0 qui compte pour agentPatienceHitZero (bilan
     annuel, nextFaithYear), pas le fait de rester dessus. La bonification
     n'est JAMAIS un nombre affiché avant coup — le pouvoir de négociation
     reste implicite, cf. faithLeverage(). V2-20 : "sans levier, l'option
     n'existe pas" — gardée ici en plus du bouton retiré côté écran
     (scr_faith_offer, ui-04) pour ne jamais dépendre uniquement de
     l'affichage. La réponse passe désormais par le directeur de
     l'organisation (FAITH_DIRECTORS, ui-04), qui accepte, refuse, ou
     contre-propose une prime de finition selon son profil et sa mémoire
     envers le joueur (faithDirectorAdjust/Mood). */
  faithOfferDemandMoney(){
    const off=G.faith.pendingOffer; if(!off) return;
    const leverage=faithLeverage(G.f,G.faith);
    if(leverage<=0){ G.lastMsg="Vous n’avez rien à négocier : personne ne parle de ce combat."; render(); return; }
    if(G.faith.agentPatience<=0){ G.faith.agentPatienceHitZero=true; }
    else { G.faith.agentPatience--; }
    const dir=FAITH_DIRECTORS[G.f.org]||FAITH_DIRECTORS[0];
    const trust=(G.faith.directors&&G.faith.directors[G.f.org]&&G.faith.directors[G.f.org].trust)||0;
    const favorable=faithDirectorFavorable(dir,G.f);
    if(dir.archetype==='requin' && rnd()<0.6){
      off.finishBonus=true;
      G.lastMsg=`${dir.name} : « Pas un centime de plus. Mais finissez-le, et je double la prime. »`;
    } else if(favorable || trust>=1){
      const bump=0.15+Math.min(1,leverage/4)*0.25;
      off.bonusMult=(off.bonusMult||1)*(1+bump);
      faithDirectorAdjust(G.f.org,1);
      G.lastMsg=`${dir.name} revient avec une meilleure offre.`;
    } else if(trust<=-1){
      G.lastMsg=`${dir.name} refuse net : « ${faithDirectorRefusalLine(dir)} »`;
    } else {
      off.finishBonus=true;
      G.lastMsg=`${dir.name} : « La base ne bouge pas. Finissez-le, et on en reparle. »`;
    }
    save(); render();
  },
  /* ==== [ANCRE: V2-18] — "demander un autre combat, avec justification".
     Le bouton unique portait une commande abstraite, sans motif ni
     risque. Le motif réel (faithDemandMotif(), ui-04) est maintenant
     affiché avant le clic ; la réponse passe enfin par la personnalité
     de l'agent (requin/stratège/fidèle, déjà choisie à la création,
     jusqu'ici jamais branchée sur ce comportement) plutôt que par un
     échange systématique et gratuit. */
  faithOfferDemandBetter(){
    const off=G.faith.pendingOffer; if(!off) return;
    if(G.faith.agentPatience<=0){ G.faith.agentPatienceHitZero=true; }
    else { G.faith.agentPatience--; }
    /* ==== [ANCRE: CORRECTIF_POOL_OFFRE_SEPARE] — lit désormais le pool propre
       à cette offre (G.faith.offerPool, posé par faithEnsureOffer() quand la
       règle 5 a filtré des candidats) plutôt que le cache partagé G.opps —
       jamais rétréci lui-même. Repli sur G.opps quand aucun filtre n'a
       tourné (offre en Préliminaires, par exemple). ==== */
    const opps=G.faith.offerPool||G.opps||[]; const idx=opps.indexOf(off.opp);
    const agentId=(G.faith.agent&&G.faith.agent.id)||'fidele';
    if(agentId==='requin'){
      if(idx>0) off.opp=opps[idx-1];
      faithDirectorAdjust(G.f.org,-1);
      G.lastMsg="Votre agent a forcé la main du directeur — ça ne passera pas inaperçu.";
    } else if(agentId==='stratege'){
      if(idx>0){ off.opp=opps[idx-1]; G.lastMsg="Un adversaire mieux calibré pour votre progression."; }
      else { G.lastMsg="Le Stratège refuse : ce combat sert déjà le plan."; }
    } else {
      if(idx>0 && rnd()<0.8){ off.opp=opps[idx-1]; }
      else if(idx<opps.length-1){ off.opp=opps[idx+1]; G.lastMsg="Le Fidèle s’est trompé d’adversaire — trop tard pour revenir dessus."; }
    }
    /* ==== [ANCRE: CORRECTIF_MAIN_EVENT_NEMESIS_PERMANENT] — voir la même
       ancre dans faithEnsureOffer() : le statut de némésis (faithGalaPosition)
       doit être vérifié contre l'adversaire RÉEL de cette offre (off.opp.o,
       déjà mis à jour ci-dessus), jamais contre une simple présence de
       f.rivalId quelque part sur la carrière. ==== */
    off.gala=faithGalaPosition(G.f,off.opp.o); off.gala.label=faithGalaLabel(G.faith,G.f);
    if(!G.faith.agent) off.gala.mult*=0.75;
    /* ==== [ANCRE: CORRECTIF_CARTE_ADVERSAIRE_ECHANGE] — bug trouvé :
       G.faith.currentCard n'est écrite qu'à un seul endroit (faithEnsureOffer).
       Échanger d'adversaire ici laissait la carte pointer sur l'ANCIEN :
       (1) scr_faith_card affichait le mauvais nom ; (2) ui-05 teste
       currentCard.oppId===opp.id pour poster playerResult — le test échouait,
       donc le résultat du joueur n'était jamais inscrit et le lien
       « Résultats de la dernière carte » (ui-04) ne réapparaissait plus ;
       (3) le nouvel adversaire pouvait figurer en sous-carte avec un W/L déjà
       appliqué par generateFightCard, sur l'affiche où il combat le joueur. ==== */
    G.faith.currentCard=generateFightCard(off.gala,off.opp.o);
    save(); render();
  },
  /* ==== [CORRECTIF FA-12 / V2-21] — refuser coûte réellement quelque
     chose : la case combat de l'année est perdue (FA-12, inchangé). V2-21
     ajoute un vrai prix côté agent (réutilise agentPatience/
     agentPatienceHitZero, déjà l'infrastructure de mécontentement de
     l'agent — FA-13 — plutôt qu'un nouveau système de "crédit
     d'organisation" à inventer pour Faith, qui n'a pas de directeurs
     nommés à ce stade du document, cf. Batch 4/V2-19), et une franchise :
     un refus est gratuit une fois par an si le combattant est
     effectivement blessé au moment du refus (motif médical réel, pas
     déclaratif — cf. f.injury, déjà suivi). refusalsThisYear/
     medicalRefusalUsed repartent à zéro chaque année (nextFaithYear). ==== */
  faithOfferRefuse(){
    if(!faithClaimMonth('offer_refuse')) return;
    const medical=!!G.f.injury && !G.faith.medicalRefusalUsed;
    G.faith.refusalsThisYear=(G.faith.refusalsThisYear||0)+1;
    if(medical){ G.faith.medicalRefusalUsed=true; }
    else if(G.faith.agentPatience>0){ G.faith.agentPatience--; }
    else { G.faith.agentPatienceHitZero=true; }
    /* ==== [ANCRE: V3_REFUS_AGENT_ARC] — Plan V3 LOT 4 §P05a : "réaction
       datée de l'agent dans rel.arc[]" — une trace réelle de la Person,
       jamais une punition abstraite. Absente pour un refus médical
       (légitime, sans réaction de l'agent). */
    if(!medical){
      const agentPerson=ensureFaithAgentPerson();
      if(agentPerson) agentPerson.rel.arc.push({year:G.faith.year,text:'Un combat refusé de plus — sa patience s’use.'});
    }
    if(G.faith.refusalsThisYear>=3){
      G.lastMsg="Votre agent vous prévient : à ce rythme de refus, il ne pourra bientôt plus vous représenter.";
    }
    G.faith.pendingOffer=null;
    /* ==== [ANCRE: CORRECTIF_POOL_OFFRE_SEPARE] — même raison qu'à l'entrée
       en cage (CL.opp()) : refuser clôt cette offre, le pool qui lui était
       propre ne doit pas survivre jusqu'à la suivante. ==== */
    G.faith.offerPool=null;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Combat refusé',choice:medical?'Refus médical':'Combat refusé'});
    faithAdvanceMonth();
  },
  prepareFaithYearEnd(){
    const f=G.f;
    const dmgHead=(G.season.fights||[]).reduce((acc,fight)=>acc+((fight.st&&fight.st.Me&&fight.st.Me.dmgHead)||0),0);
    const eloDelta=Math.round(f.careerElo-(G.faith.startOfYearElo||f.careerElo));
    const earningsDelta=(f.earnings||0)-(G.faith.startOfYearEarnings||0);
    const rank=divRank(f);
    /* ==== [ANCRE: FAITH_SUIVI_PICS] — le Score de Légende note le SOMMET
       atteint, pas l'état final : une fin de carrière en déclin ne doit pas
       effacer le pic. Les dégâts crâniens, eux, se cumulent sur toute la
       carrière (le compteur annuel est remis à zéro avec season.fights). ==== */
    /* ==== [ANCRE: FAITH_SERMENTS] — trace du « vieux lion » : une ceinture
       portée à 34 ans ou plus. Relevé chaque fin d'année, jamais effacé. ==== */
    if((f.age||0)>=34 && f.champion) G.faith.beltAfter34=true;
    G.faith.peakElo=Math.max(G.faith.peakElo||0,f.careerElo||0);
    G.faith.peakEarnings=Math.max(G.faith.peakEarnings||0,f.earnings||0);
    G.faith.dmgHeadTotal=(G.faith.dmgHeadTotal||0)+dmgHead;
    /* ==== [ANCRE: V2-35] — même logique de pic que peakElo/peakEarnings
       juste au-dessus : computeLegendScore() (ui-04) note le SOMMET
       overall/rang/série jamais l'état final. rank est déjà calculé
       ci-dessus (divRank(f)), réutilisé tel quel. */
    G.faith.peakOverall=Math.max(G.faith.peakOverall||0,f.overall||0);
    G.faith.peakRank=Math.min(G.faith.peakRank!=null?G.faith.peakRank:99,rank||99);
    G.faith.bestStreak=Math.max(G.faith.bestStreak||0,f.streak||0);
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: FA-28] — « le combat de trop ». isDeclining() (engine.js,
       déjà le seuil qui déclenche l'écran de retraite, scr_faith_retire) et
       dmgHeadTotal (déjà suivi, ci-dessus) existaient déjà séparément, mais
       ne se parlaient pas : continuer à combattre en déclin ne coûtait
       jamais rien de mécanique, seulement un texte d'ambiance sur l'écran
       de retraite. Le seuil de 150 reprend celui déjà affiché par
       scr_faith_retire ("les coups laissent des traces" à partir de 150).
       -1 sur f.attrs ET f.maxAttrs (le plafond d'entraînement, engine.js/
       applyDeltas) : sans toucher au plafond, l'entraînement futur
       effacerait la perte, ce qui contredirait "irréversible". Jamais
       chiffré à l'écran (règle H.1/H.2) — seule une phrase, à la coupure
       de presse, au même rythme annuel que ce bloc (faithPresseArticle,
       ui-04, lit G.faith.yearStats.sequelle, un champ purgé avec le reste
       de yearStats à chaque nouvelle année) : au plus une séquelle par
       année de carrière. */
    let sequelle=null;
    if(isDeclining(f) && G.faith.dmgHeadTotal>150 && (G.season.fights||[]).length>0 && rnd()<0.12){
      const cible=rnd()<0.5?'chin':'composure';
      f.attrs[cible]=clamp((f.attrs[cible]||50)-1,1,100);
      if(f.maxAttrs) f.maxAttrs[cible]=clamp((f.maxAttrs[cible]||f.attrs[cible])-1,1,100);
      sequelle=cible;
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: V3_CAREER_LIFETIME_STATS] — Plan V3 LOT 7 §5.7.2 point 2 :
       "coups mis · coups encaissés · temps de contrôle" dans le "bloc
       chiffres" de la fiche demandent un total DE CARRIÈRE, pas juste la
       saison qui vient de s'écouler (G.season.fights est vidé à chaque
       nouvelle année). totalSig/totalTdAtt/totalCtrl/totalKD ci-dessous
       existaient déjà pour détecter les spécialisations (juste en dessous)
       — accumulés ici sur f, jamais recalculés depuis zéro, jamais réinitialisés. */
    let finitionsSeason=0;
    if((G.season.fights||[]).length>=1){
      let totalSig=0, totalTdAtt=0, totalCtrl=0, totalKD=0;
      G.season.fights.forEach(fight=>{ totalSig+=(fight.st&&fight.st.Me&&fight.st.Me.sig)||0; totalTdAtt+=(fight.st&&fight.st.Me&&fight.st.Me.tdAtt)||0; totalCtrl+=(fight.st&&fight.st.Me&&fight.st.Me.ctrl)||0; totalKD+=(fight.st&&fight.st.Me&&fight.st.Me.kd)||0;
        if(fight.win && !isDecisionLike(fight.method)) finitionsSeason++; });
      f.careerSig=(f.careerSig||0)+totalSig; f.careerTdAtt=(f.careerTdAtt||0)+totalTdAtt;
      f.careerCtrl=(f.careerCtrl||0)+totalCtrl; f.careerKD=(f.careerKD||0)+totalKD;
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
    /* ==== [ANCRE: CORRECTIF_TRAININGTAGS_MORT] — G.faith.trainingTags n'était
       alimenté nulle part (repo entier vérifié) : la branche de filtrage par
       tag de style ci-dessous ne pouvait donc jamais s'activer
       (tags.length>0 toujours faux). Retirée avec trainingTags/
       trainingsThisYear (initialisation et remise à zéro annuelle) plutôt que
       de garder trois sites morts pour une seule branche inatteignable. ==== */
    /* ==== [ANCRE: CORRECTIF_NBROLLS_1_COMBAT_PAR_AN] — le plafond « 1 roll
       max par an » date de l'époque où Faith imposait 1 combat/an (avant
       FA-11) ; le calendrier à 12 mois permet depuis plusieurs combats par
       an, mais ce plafond n'avait jamais suivi : une carrière de 18 ans
       plafonnait à 18 compétences quel que soit le nombre de combats
       livrés. Indexé sur les combats réellement livrés cette année
       (fightsThisYear), plafonné par le même MAX_CAREER_SKILLS que le pool
       lui-même.
       ==== [ANCRE: CORRECTIF_NBROLLS_ANNEE_VIDE] — bug trouvé : ce correctif
       avait perdu le garde-fou de la formule d'origine
       ((yearLog.length>=1)?1:0) — une année entièrement vide (calendrier
       sans mois occupé, aucun événement de vie résolu, aucun combat) offrait
       désormais quand même 1 compétence gratuite (Math.floor(0/3)+1=1). Le
       plancher ne s'applique plus que si l'année a réellement produit
       quelque chose. ==== */
    const nbRolls=((G.faith.yearLog||[]).length>=1 || (G.faith.fightsThisYear||0)>0)
      ? Math.min(1+Math.floor((G.faith.fightsThisYear||0)/3),SKILL_CONSTANTS.MAX_CAREER_SKILLS)
      : 0;
    const newSkills=[];
    let pool=poolEligible(f,f.age>=34,f.skills.length>=SKILL_CONSTANTS.MAX_CAREER_SKILLS);
    for(let i=0;i<nbRolls;i++){
      if(pool.length===0) break;
      const rar=tirerRarete(); const sk=getFallbackSkill(pool,rar);
      if(sk){ grantSkill(f,sk); newSkills.push(sk); pool=poolEligible(f,f.age>=34,f.skills.length>=SKILL_CONSTANTS.MAX_CAREER_SKILLS); }
    }
    /* ==== [ANCRE: V2-27] — G.faith.promiseOutcome (posé par resolveFight(),
       ui-05, à la résolution du combat concerné) capturé dans yearStats
       comme sequelle juste au-dessus, puis purgé pour ne jamais fuiter
       sur une année suivante sans nouvelle promesse. */
    const promiseOutcome=G.faith.promiseOutcome||null;
    G.faith.promiseOutcome=null;
    G.faith.yearStats={
      fights:G.faith.fightsThisYear,
      wins:(G.season.fights||[]).filter(x=>x.win).length,
      losses:(G.season.fights||[]).filter(x=>!x.win).length,
      eloDelta, earningsDelta, rank, dmgHead, newSkills, yearLog:G.faith.yearLog||[], sequelle, promiseOutcome,
      /* ==== [ANCRE: V3_YEAR_END_FACTS] — Plan V3 LOT 7 §5.7.1 points 6/8 :
         finitions de la saison (remplace "Coups encaissés" sur la coupure,
         cf. scr_faith_year_end) et delta de rang depuis le début de saison
         (F.startOfYearRank, déjà posé par nextFaithYear() — jamais
         recalculé, juste comparé). */
      finitions:finitionsSeason, rankStart:G.faith.startOfYearRank
    };
    G.screen='faith_year_end'; save(); render();
  },
  nextFaithYear(){
    /* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — le cas le plus lourd :
       yearStats n'est jamais purgé après archivage, donc un double-tap
       archivait l'année DEUX FOIS dans le Parcours, incrémentait le millésime
       deux fois (2026 -> 2028), appliquait applyAging() et worldTick() deux
       fois, et vieillissait l'écurie de deux ans. Cet écran est le seul point
       d'entrée, et la fonction en sort toujours. ==== */
    if(G.screen!=='faith_year_end') return;
    /* ==== [ANCRE: FAITH_PARCOURS] — archive AVANT la purge de yearLog
       quelques lignes plus bas : G.faith.yearStats (posé par
       prepareFaithYearEnd() pour l'écran de bilan qu'on quitte tout juste)
       porte encore les données de l'année qui vient de se terminer, et
       G.faith.year n'a pas encore été incrémenté. ==== */
    if(G.faith.yearStats) faithArchiveYear(G.faith.year,G.faith.yearStats,G.f,G.faith);
    G.faith.yearStats=null;
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: CORRECTIF_PED_VIEILLISSEMENT] — bug trouvé : le test
       `pedActive !== G.faith.year` s'exécutait APRÈS `G.faith.year++`,
       comparant donc l'année d'achat N à l'année N+1 — toujours différentes.
       L'exemption de vieillissement, seule contrepartie du risque de
       suspension à 15 %, n'a jamais pu se déclencher. Comparaison faite sur
       l'année écoulée, comme le fait déjà correctement dietYear (CL.opp). ==== */
    const _yearEnding=G.faith.year;
    G.faith.year++;
    G.faith.fightsThisYear=0; G.faith.yearLog=[];
    /* V2-21 : compteurs annuels de refus, remis à zéro comme le reste. */
    G.faith.refusalsThisYear=0; G.faith.medicalRefusalUsed=false;
    /* ==== [ANCRE: FAITH_CORRECTIF_SUSPENSION_PED] — l'année blanche ne dure
       qu'un millésime : le drapeau est levé ici, avec le reste des compteurs
       annuels. ==== */
    G.faith.suspended=false;
    G.faith.startOfYearElo=G.f.careerElo; G.faith.startOfYearEarnings=G.f.earnings||0;
    /* ==== [ANCRE: FAITH_PARCOURS] — mêmes photographies de début d'année que
       startOfYearElo/startOfYearEarnings juste au-dessus, pour que
       faithArchiveYear() puisse mesurer CE QUI S'EST PASSÉ CETTE ANNÉE
       (scandale, serment rompu) plutôt que l'état cumulé depuis toujours —
       sinon toutes les années suivant une rupture hériteraient à tort du
       marqueur de rupture. ==== */
    G.faith.startOfYearScandals=G.faith.scandals||0;
    G.faith.startOfYearOathBroken=!!(G.faith.oath&&G.faith.oath.broken);
    /* ==== [ANCRE: V2-32] — mêmes photographies de début d'année, pour la
       table des faits saillants de l'article (faithYearFacts, ui-04) :
       ceinture gagnée/perdue, mouvement de rang, némésis qui vient de
       tomber — comparés à CETTE année précisément, jamais à l'état cumulé
       depuis toujours. ==== */
    G.faith.startOfYearChampion=!!G.f.champion;
    G.faith.startOfYearRank=divRank(G.f);
    G.faith.startOfYearNemesisBeaten=!!G.faith.nemesisBeaten;
    /* ==== [FIN ANCRE] ==== */
    G.season.fights=[];
    if(G.faith.pedActive!==_yearEnding) applyAging(G.f);
    /* ==== [ANCRE: WORLD_TICK_HOOK] — Plan V3 LOT 0 §4.3 : point d'appel
       principal de worldTick(), qui enveloppe advanceRoster() (inchangé) et
       archive le rang dans G.faith.rankHistory pour LOT 7 (P20). ==== */
    worldTick(G.faith.year);
    /* ==== [ANCRE: FAITH_NEMESIS_PERMANENTE] — FA-26 : avant ce correctif,
       f.faithNemesisId n'était posé que par la trahison du protégé
       (evt_frankenstein_betrayal) ; sans trahison avant 30 ans, la carrière
       entière se jouait sans antagoniste et 3 événements de vie écrits pour
       la némésis (evt_nemesis_loss/win/gym) ne se déclenchaient jamais. Un
       second déclencheur, vérifié une fois par an (les rangs ne sont
       significatifs qu'après advanceRoster() ci-dessus, pas à chaque
       combat, trop bruité) : un combattant du roster qui franchit le rang
       du joueur deux années différentes (pas nécessairement consécutives)
       verrouille la némésis, si aucune n'est déjà posée. G.faith.rankWatch
       persiste sur toute la carrière — jamais réinitialisé ici, contraire
       à l'esprit "portée sur toute la carrière" du correctif. ==== */
    /* ==== [ANCRE: CORRECTIF_NEMESIS_FRANCHISSEMENT] — bug trouvé : l'ancre
       FAITH_NEMESIS_PERMANENTE décrit un combattant qui « FRANCHIT le rang du
       joueur deux années différentes », mais le code ne testait qu'une
       POSITION (divRank(o)<monRang). Un combattant durablement au-dessus
       accumulait donc ses deux points sans que rien ne se passe — et comme
       G.roster est trié par rang, la boucle tombait toujours d'abord sur le
       mieux classé : la némésis était presque systématiquement le n°1 de la
       division, dès la 2e année, sans aucun récit derrière. On mémorise le
       rang de l'an dernier pour ne compter que les vrais franchissements. ==== */
    if(!G.faith.rankPrev) G.faith.rankPrev={};
    const monRangPrev=(G.faith.rankPrev._me!=null)?G.faith.rankPrev._me:divRank(G.f);
    if(!G.f.faithNemesisId){
      if(!G.faith.rankWatch) G.faith.rankWatch={};
      const monRang=divRank(G.f);
      for(const o of G.roster){
        if(o.champion || o.isGymPartner) continue;
        const prev=G.faith.rankPrev[o.id];
        const aFranchi=(prev!=null) && prev>monRangPrev && divRank(o)<monRang;
        if(aFranchi){
          G.faith.rankWatch[o.id]=(G.faith.rankWatch[o.id]||0)+1;
          if(G.faith.rankWatch[o.id]>=2){ lockFaithNemesis(o); break; }
        }
      }
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: V2-14] — FA-26 verrouillait une némésis pour la
       carrière entière sans jamais vérifier qu'un rematch restait
       plausible : un rival qui s'effondre (viré du haut niveau) ou qui
       s'envole (double champion pendant que le joueur stagne en bas de
       tableau) restait quand même "la" némésis, sans qu'aucune revanche
       ne redevienne jamais réaliste. Vérifié une fois par an, juste après
       le verrouillage éventuel ci-dessus (jamais la même année qu'un
       verrouillage frais : `else` ci-dessous). Dissoute, jamais annulée
       en silence : la carrière peut ensuite en reformer une nouvelle
       (rankWatch n'est pas purgé : les compteurs déjà accumulés par
       d'autres combattants du roster restent valables). ==== */
    else if(G.f.faithNemesisId){
      const nem=(G.roster||[]).find(o=>o.id===G.f.faithNemesisId);
      const monRang=divRank(G.f);
      const nemRang=nem?divRank(nem):null;
      const gapTropGrand=!nem || Math.abs(nemRang-monRang)>20;
      if(gapTropGrand){
        const coule=!nem || nemRang>monRang;
        G.lastMsg=(G.lastMsg?G.lastMsg+' ':'')+(coule
          ?"Votre némésis a perdu trois fois de suite : plus personne ne veut de ce combat."
          :"Elle est championne, et n'a pas cité votre nom une seule fois cette année.");
        if(!G.faith.yearLog) G.faith.yearLog=[];
        G.faith.yearLog.push({title:'Rivalité dissoute',choice:coule?'Il a coulé':'Il vous a dépassé'});
        G.f.faithNemesisId=null; G.f.rivalId=null; G.f.nemesisRecord=null;
      }
    }
    /* ==== [FIN ANCRE] ==== */
    if(G.faith.gym){
      /* ==== [CORRECTIF FA-15] — "Se reposer" n'est plus gratuit : si le
         combattant a choisi le repos pendant l'intersaison de l'année qui
         vient de se terminer (restedThisYear, posé par faithRest()), les
         partenaires progressent un peu plus vite cette année — sans lui
         pour les canaliser. Prix narratif, jamais chiffré à l'écran. ==== */
      const soloBoost=G.faith.restedThisYear?1:0;
      G.faith.gym.forEach(p=>{
        p.age++;
        applyDeltas(p,[['strength',1+soloBoost],['fightIQ',1+soloBoost],['cardio',1+soloBoost],['durability',1+soloBoost]]);
        p.overall=overall(p);
      });
      G.faith.restedThisYear=false;
    }
    /* ==== [ANCRE: FAITH_ECURIE_RENOUVELEE] — G.faith.gym n'était alimenté
       qu'à la création (2 partenaires) et seulement RETIRÉ ensuite (la
       trahison du protégé, FAITH_PROTEGE_VISIBLE). Le Syndrome de
       Frankenstein — le meilleur système du mode — s'éteignait donc
       lui-même en s'exécutant : après une ou deux trahisons, le temps 2
       dégénérait en un unique bouton "Se reposer". Un nouveau venu de 18
       ans arrive dès que l'écurie descend sous 2 partenaires, avec le même
       calibrage que les deux partenaires de départ (FAITH_ECURIE_DEPART,
       quelques lignes plus haut). ==== */
    if((G.faith.gym||[]).length<2){
      const p3=makeFighter({gender:G.f.gender,div:G.f.div,age:18,level:clamp(G.f.overall-18,20,60),potential:RI(80,97)});
      p3.isGymPartner=true; p3.nick=pick(FAITH_GYM_NEWCOMER_NICKS);
      G.faith.gym.push(p3);
      ensureSparringPrimary();
      G.lastMsg=`Un gamin de 18 ans a poussé la porte de la salle cette semaine — ${esc(p3.nick)}.`;
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: FAITH_AGENT] — recouvrement AVANT le bilan de l'année qui
       vient de s'écouler : si l'agent avait déjà été perdu à l'année N-1,
       cette entrée en année N est le moment où un nouveau se présente
       (jamais la MÊME année que la perte — sinon la pénalité "sans agent"
       ne dure jamais). Le bilan patience de l'année qui vient de s'écouler
       (agentPatienceHitZero, posé par faithOfferDemandMoney/Better) est
       évalué ENSUITE, sur l'agent alors en poste. ==== */
    if(!G.faith.agent){
      const pick3=['requin','stratege','fidele'][Math.floor(rnd()*3)];
      G.faith.agent=FAITH_AGENTS[pick3]; G.f.agentCut=G.faith.agent.cut||0;
      G.faith.agentPersonId=null; // archétype différent -> nouvelle Person (ensureFaithAgentPerson)
      G.lastMsg=(G.lastMsg?G.lastMsg+' ':'')+`${faithAgentDisplayName()} vous propose de vous représenter.`;
    } else if(G.faith.agentPatienceHitZero){
      G.faith.agentPatienceZeroStreak=(G.faith.agentPatienceZeroStreak||0)+1;
      if(G.faith.agentPatienceZeroStreak>=2){
        const leavingAgent=ensureFaithAgentPerson();
        if(leavingAgent) leavingAgent.rel.arc.push({year:G.faith.year,text:'Vous a lâché : trop sollicité, il a repositionné sa liste de clients ailleurs.'});
        G.lastMsg=(G.lastMsg?G.lastMsg+' ':'')+`${faithAgentDisplayName()} vous lâche : trop sollicité, il repositionne sa liste de clients ailleurs.`;
        G.faith.agent=null; G.f.agentCut=0; G.faith.agentPatienceZeroStreak=0;
      }
    } else {
      G.faith.agentPatienceZeroStreak=0;
    }
    G.faith.agentPatience=3; G.faith.agentPatienceHitZero=false;
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: FAITH_CALENDRIER] — nouveau calendrier de 12 mois pour la
       saison qui commence (cf. finalizeFaithDraft pour la 1ère année). ==== */
    // V2-09 : un tirage d'intersaison ne doit jamais survivre au changement
    // d'année (le mois repart à 0 juste en dessous, un tirage figé sur un
    // vieux mois=0 d'une année passée pourrait sinon se faire réutiliser à tort).
    G.faith.currentIntersaison=null; G.faith.pendingIntersaisonEntry=null;
    G.faith.month=0; G.faith.calendar=faithGenerateCalendar(G.f);
    faithLandOnMonth();
    /* ==== [ANCRE: CORRECTIF_NEMESIS_FRANCHISSEMENT] — photo de fin d'année,
       lue l'an prochain par le bloc plus haut pour ne compter que les vrais
       franchissements de rang. ==== */
    G.faith.rankPrev={_me:divRank(G.f)};
    (G.roster||[]).forEach(o=>{ G.faith.rankPrev[o.id]=divRank(o); });
    if(G.faith.month>=12) return; // prepareFaithYearEnd() a déjà pris la main
    /* ==== [FIN ANCRE] ==== */
    G.screen='faith_hub'; save(); render();
  },
  buyFaithPerk(perkId){
    const f=G.f; if(!G.faith.perks) G.faith.perks={};
    /* ==== [ANCRE: FAITH_SERMENTS] — « Jamais de raccourci » se rompt à
       l'instant où l'un de ces quatre privilèges est pris, et la rupture est
       définitive : elle reste visible sur le hub jusqu'à la retraite. ==== */
    if(G.faith.oath && G.faith.oath.id==='no_shortcut' && !G.faith.oath.broken
       && ['ped','judges','lobbying','catchweight'].includes(perkId)){
      G.faith.oath.broken=true;
    }
    const costMoney={hometown:15,catchweight:35,ped:30,tiger:50,lobbying:100,diet:40};
    if(costMoney[perkId]||perkId==='judges'){
      let actualCost=costMoney[perkId];
      /* ==== [ANCRE: CORRECTIF_JUGES_GRATUIT] — bug trouvé : le coût étant un
         POURCENTAGE du patrimoine, le test `earnings < actualCost` était
         toujours faux — et à 0 k$, le privilège était accordé gratuitement.
         Plancher explicite. ==== */
      if(perkId==='judges') actualCost=Math.max(20,Math.round((f.earnings||0)*0.20));
      if((f.earnings||0)<actualCost){ G.lastMsg="Fonds insuffisants."; render(); return; }
      f.earnings-=actualCost;
      /* ==== [ANCRE: CORRECTIF_HOMETOWN_LIEU_FANTOME] — bug trouvé : le
         message promettait un lieu ("à domicile"), mais le lieu du gala est
         piloté par G.faith.territoire (faithGalaCity, ui-04) — ce privilège
         n'a jamais eu prise dessus, seulement sur moral/forme (CL.opp()).
         Message reformulé pour ne promettre que ce qu'il fait réellement. ==== */
      if(perkId==='hometown'){ G.faith.perks.hometown=true; G.lastMsg="Privilège acquis : accueil favorable, vous entrez porté par la salle."; }
      else if(perkId==='catchweight'){ G.faith.perks.catchweight=true; G.lastMsg="Privilège acquis : Le prochain adversaire subira un lourd malus de déshydratation."; }
      else if(perkId==='ped'){
        /* ==== [ANCRE: FAITH_CORRECTIF_SUSPENSION_PED] — la branche positive
           écrivait G.faith.month et G.faith.pa : deux champs qu'aucun code du
           repo ne lit (vestiges d'une structure calendaire abandonnée). Pire,
           elle incrémentait G.faith.year hors de nextFaithYear(), ce qui
           laissait startOfYearElo, startOfYearEarnings, yearLog, season.fights
           et step désynchronisés, et sautait applyAging() : la « suspension
           d'un an » faisait donc avancer le millésime sans faire avancer la
           simulation. La suspension passe désormais par le chemin normal de
           fin d'année — on marque l'année comme blanche, on saute le combat,
           et nextFaithYear() fait son travail habituel. ==== */
        if(rnd()<0.15){
          G.lastMsg="CATASTROPHE : Test antidopage positif. Année blanche, licence suspendue.";
          G.faith.suspended=true;
          G.faith.scandals=(G.faith.scandals||0)+1;
          f.rankBoost=Math.max(0,(f.rankBoost||0)-100);
          if(!G.faith.yearLog) G.faith.yearLog=[];
          G.faith.yearLog.push({title:'Contrôle antidopage',choice:'Positif — suspension'});
          CL.prepareFaithYearEnd(); return;
        }
        /* ==== [FIN ANCRE] ==== */
        else { f.attrs.chin=clamp(f.attrs.chin+4,1,100); f.attrs.durability=clamp(f.attrs.durability+4,1,100); f.overall=overall(f); G.faith.pedActive=G.faith.year; G.lastMsg="Protocoles PED réussis : Menton et Résistance +4."; }
      } else if(perkId==='tiger'){
        if(rnd()<0.25){ G.lastMsg="Le stage était d\u2019une rare violence. Blessure mineure contractée."; f.form=clamp(f.form-20,0,100); }
        else { f.attrs.kick=clamp(f.attrs.kick+5,1,100); f.attrs.clinchStr=clamp(f.attrs.clinchStr+5,1,100); f.overall=overall(f); G.lastMsg="Stage Tiger Muay Thai validé : Kick et Clinch +5 (hors-plafond)."; }
      } else if(perkId==='lobbying'){
        if(rnd()<0.50){ G.lastMsg="L\u2019argent a disparu dans les poches des promoteurs. Aucun effet."; }
        else { G.faith.perks.forcePromo=true; G.lastMsg="Lobbying réussi : Une offre de promotion sera forcée après votre prochain combat."; }
      } else if(perkId==='judges'){
        if(rnd()<0.10){ G.lastMsg="SCANDALE : Corruption découverte. L\u2019organisation coupe votre contrat !"; G.faith.scandals=(G.faith.scandals||0)+1; if(f.org>1) f.org--; G.roster=makeOrgRoster(f); }
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
  selectDraft(i){
    /* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — même geste côté
       Gauntlet : applyPendingGauntletConsumable() est déjà idempotente (elle
       purge le drapeau meta), mais le malus de run 'mut_depart_affaibli'
       s'appliquait DEUX fois — -20 Puissance/Cardio au lieu de -10. ==== */
    if(G.arcade && G.arcade._drafted) return;
    if(G.arcade) G.arcade._drafted=true;
    G.f=G.arcade.pool[i];
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
    if(mutId==='mut_sans_filet'){ G.arcade.consumableSafetynet=false; }
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
    save(); CL.go('arcadehub'); },
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
    if(G.arcade.mode==='boss_run' && G.arcade.upgradesChosen.train){ save(); CL.go('arcadehub'); return; }
    /* ==== [FIN ANCRE] ==== */
    save(); render(); },
  retryArcade(){
    /* ==== [ANCRE: CORRECTIF_RETRY_ASCENSION] — bug trouvé : startArcade/
       startLadder100/startBossRun relisent tous G._pendingAsc pour fixer le
       palier d'Ascension de la nouvelle run, mais retryArcade() ne le
       repositionnait jamais — "rejouer" retombait donc systématiquement au
       palier 0, symétrique au correctif déjà appliqué à retrySameSeed()
       ci-dessous pour la graine. ==== */
    G._pendingAsc=(G.arcade&&G.arcade.asc)||0;
    /* ==== [ANCRE: CORRECTIF_RETRY_CAPSTONE] — bug trouvé, même famille que
       CORRECTIF_RETRY_ASCENSION ci-dessus : "rejouer" un Boss Run Capstone
       (débloqué par 5 rivaux historiques battus, startBossRunCapstone())
       relançait un Boss Run ordinaire sans le dire — le palier retombait au
       Boss Run standard. Drapeau conservé au même titre que G._pendingAsc. ==== */
    const wasCapstone=G.arcade&&G.arcade.capstone;
    const prevMode=G.arcade&&G.arcade.mode;
    if(prevMode==='ladder_100') CL.startLadder100();
    else if(prevMode==='boss_run'){ wasCapstone?CL.startBossRunCapstone():CL.startBossRun(); }
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
  /* ==== [ANCRE: CORRECTIF_DOUBLE_RESOLUTION_ARCADE] — voir
     CORRECTIF_DOUBLE_RESOLUTION (choosePlan, carrière/Faith) : même risque de
     double-tap ici, sur resolveArcadeFight(). Contrairement à G.fight
     (recréé à chaque combat), G.arcade vit toute la run — le verrou doit
     donc être remis à zéro explicitement, ici, au seul point d'entrée de
     l'écran de tactique (fightArcade()), plutôt que de compter sur une
     réinitialisation implicite. ==== */
  fightArcade(){ G.arcade._resolved=false; G.arcade._planLocked=false; G.screen='arcade_plan'; save(); render(); },
  chooseArcadePlan(idx){
    if(G.arcade._resolved) return;
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
    /* ==== [ANCRE: CORRECTIF_DOUBLE_RESOLUTION_BOSSREVEAL] — bug trouvé :
       G.arcade._resolved (CORRECTIF_DOUBLE_RESOLUTION_ARCADE) ne protège que
       resolveArcadeFight() — jamais appelé sur CETTE branche, qui bascule
       plutôt vers l'écran de reveal. Un double-tap sur la carte tactique en
       Boss Run tirait donc deux fois le handicap (ALL_ATTR pris au hasard),
       le second tirage écrasant silencieusement le premier avant même que
       le joueur ne voie l'écran de révélation. Verrou dédié, remis à zéro
       au même endroit que _resolved (CL.fightArcade()). ==== */
    if(G.arcade.mode==='boss_run' && !G.arcade.revealed){
      if(G.arcade._planLocked) return;
      G.arcade._planLocked=true;
      const pick_=ALL_ATTR[Math.floor(rnd()*ALL_ATTR.length)];
      G.arcade.bossMalus={key:pick_[0],label:pick_[1],amount:-RI(6,14)};
      G.screen='boss_reveal'; save(); render(); return;
    }
    /* ==== [FIN ANCRE] ==== */
    G.arcade._resolved=true;
    resolveArcadeFight();
  },
  /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 : confirme le reveal
     (plus de retour en arrière possible sur la tactique), marque revealed,
     puis résout le combat. Le malus lui-même est appliqué et restauré à
     l'intérieur de resolveArcadeFight (ui-03), au même endroit que le reste
     de la logique de combat, pour ne pas dupliquer la restauration ici. ==== */
  confirmBossReveal(){ if(!G.arcade||G.arcade.mode!=='boss_run') return;
    if(G.arcade._resolved) return;
    G.arcade._resolved=true;
    G.arcade.revealed=true; resolveArcadeFight(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: REJOUABILITE_PACTE_TOGGLE] — Bracket 64 / Ladder 100
     seulement (Boss Run a déjà sa clause KO-only permanente et pas d'écran
     de vestiaire entre les combats). ==== */
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : le pacte forcé n'est plus lié au palier d'Ascension
     (asc>=3) mais au mutateur tiré pour cette run. ==== */
  togglePact(){ if(!G.arcade||!G.arcade.active) return; if(G.arcade.mode==='boss_run') return; if(G.arcade.mutator&&G.arcade.mutator.id==='mut_pacte_force') return; G.arcade.pactActive=!G.arcade.pactActive; save(); render(); },
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
  /* ==== [ANCRE: INFIRMERIE_FORTUNE] — ajout #20 (24 ajouts, 12/08/2026). ==== */
  healGauntletZone(zone){
    if(!G.arcade||!G.arcade.active) return;
    const meta=loadMetaStats();
    const r=healGauntletZone(meta,G.arcade,zone);
    G.lastMsg=r.msg; if(r.success){ saveMetaStats(meta); save(); } render();
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
  pierceRumor(){ if(!G.arcade) return; const r=pierceGauntletRumor(G.arcade); G.lastMsg=r.msg; save(); render(); },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026). ==== */
  acceptSecondSouffle(){ acceptGauntletSecondSouffle(); save(); render(); },
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
  refuseRingDoctor(){ if(!G.arcade||!G.arcade.active) return; G.arcade.doctorRefused=true; save(); render(); },
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
    G.arcade.atRisk=!G.arcade.atRisk; save(); render(); },
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
    if(G.arcade.mode==='boss_run' && G.arcade.upgradesChosen.train){ save(); CL.go('arcadehub'); return; }
    save(); render(); },
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
     bouton n'y appelle (GAUNTLET_SORTIE_UNIQUE, ui-04). CORRECTION (cf. ANCRE
     ULTIMATUM_MEDECIN, CL.acceptRingDoctor ci-dessus) : `a.cashedOut` est de
     nouveau posé à true, par ce nouveau point d'entrée d'encaissement — les
     branches `a.cashedOut` dans les 3 écrans de fin de run (gameover
     boss_run/ladder_100/bracket64, ui-04) sont donc bien vivantes et
     atteignables. Ne PAS les supprimer sous prétexte que ce commentaire
     (dans une version antérieure) les disait mortes. ==== */
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
    /* ==== [ANCRE: CORRECTIF_GARDE_ENSHRINE_DESTINATION] — bug trouvé : ce
       garde protège bien l'état (pas de double enshrine()), mais imposait
       toujours 'legacy' — alors que le premier appel, lui, termine sur
       G.faith?'faith_epilogue':'legacy'. Un joueur Faith qui double-tapait
       sur "Prendre sa retraite" perdait son épilogue, sa note finale, sa
       comparaison au previousBest et les relances rapides
       (faithRelaunchSame/faithRelaunchEdit) — renvoyé au lieu vers l'écran
       de palmarès carrière classique. ==== */
    if(G.f._enshrined){ G.screen=G.faith?'faith_epilogue':'legacy'; render(); return; }
    if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus',JSON.stringify({style:G.f.style})); }catch(e){} }
    // ==== [ANCRE: CORRECTIF_SAISON_PARTIELLE_RETRAITE] — bug remonté : le
    // bilan saison par saison (retireSeasonRecapHtml) totalisait moins de
    // victoires/défaites que le palmarès réel du combattant. Cause : seule
    // nextSeason() archivait G.season.fights dans f.seasonRecap, jamais
    // appelée pour la DERNIÈRE saison (partielle) au moment de la retraite —
    // ses combats restaient comptés dans f.W/f.L mais disparaissaient du
    // récapitulatif. On archive donc cette saison en cours ici aussi, avant
    // de sceller la carrière.
    /* ==== [ANCRE: CORRECTIF_SEASONRECAP_FAITH] — bug trouvé : G.season.year
       reste figé à 1 pour toute une carrière Faith (nextFaithYear() vide
       G.season.fights chaque année mais n'avance jamais G.season.year, qui
       n'existe que pour le calendrier de la Carrière classique — nextSeason()
       ne l'incrémente jamais pour Faith non plus). Ce bloc n'archivait donc
       QUE la dernière année Faith (partielle), sous l'étiquette fausse
       "année 1", et perdait silencieusement toutes les années précédentes —
       déjà archivées correctement par ailleurs (faithArchiveYear/
       G.faith.journey, lu par faithJourneyBlock, ui-04). f.seasonRecap /
       retireSeasonRecapHtml sont spécifiques à la Carrière classique
       (jamais affichés par l'épilogue Faith, ANCRE FAITH_EPILOGUE plus bas) :
       ne plus y écrire de donnée fausse pour Faith plutôt que la corriger à
       moitié. ==== */
    const sData=G.season||{year:1,fights:[]};
    /* ==== [ANCRE: CORRECTIF_SEASONEVAL_FAITH_NUL] — régression introduite par
       CORRECTIF_SEASONRECAP_FAITH : le garde `!G.faith` a été posé sur le
       CALCUL de seasonEval alors qu'il ne devait porter que sur l'écriture
       dans f.seasonRecap (spécifique à la Carrière classique). Le bloc Faith
       plus bas lit encore seasonEval pour archiver la dernière année dans le
       Parcours — il recevait donc toujours null, et la dernière année de
       chaque carrière Faith, souvent la plus chargée, s'inscrivait à 0-0. ==== */
    const seasonEval=(sData.fights && sData.fights.length)?evaluateSeason(G.f,sData.fights):null;
    if(!G.faith && seasonEval){
      if(!G.f.seasonRecap) G.f.seasonRecap=[];
      G.f.seasonRecap.push({year:sData.year, W:seasonEval.stats.W, L:seasonEval.stats.L,
        koW:seasonEval.stats.koW, subW:seasonEval.stats.subW, decW:seasonEval.stats.decW,
        trophies:seasonEval.trophies.map(t=>t.lbl), age:G.f.age, org:G.f.org, divName:G.f.divName});
      G.season.fights=[];
    }
    /* ==== [ANCRE: FAITH_EPILOGUE] — une carrière Faith se scelle comme les
       autres (Panthéon, Codex, points de Légende : rien n'est retiré) mais
       sort par son propre épilogue, avec sa note. L'écran 'legacy' générique
       reste la sortie de la carrière standard. ==== */
    /* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — le score de la carrière qui se
       termine doit être FIGÉ ici, avant que newFaithCareer() ne réinitialise
       G en repartant d'une création vierge (le combattant f et G.faith
       n'existeront plus). previousBest est lu AVANT recordFaithLegend() —
       sinon la carrière qu'on vient de sceller s'auto-compare à elle-même
       (déjà comptée dans meta.faithBest par son propre appel) et ne peut
       plus jamais afficher "première légende" ni "meilleure carrière". ==== */
    if(G.faith){
      /* ==== [ANCRE: FAITH_PARCOURS] — même angle mort que
         CORRECTIF_SAISON_PARTIELLE_RETRAITE juste au-dessus, et pour la même
         raison : la retraite ne passe jamais par nextFaithYear() (elle sort
         par CE contrôleur-ci, pas par le bouton "SAISON N+1"), donc l'année
         en cours n'aurait jamais été archivée dans le Parcours sans ce
         bloc. seasonEval, calculé juste au-dessus pour f.seasonRecap, sert
         aussi ici — G.season.fights vient d'être vidé, seule cette variable
         garde encore le bilan de l'année partielle. */
      if(seasonEval || (G.faith.yearLog&&G.faith.yearLog.length)){
        faithArchiveYear(G.faith.year,{wins:seasonEval?seasonEval.stats.W:0,
          losses:seasonEval?seasonEval.stats.L:0,rank:divRank(G.f),yearLog:G.faith.yearLog||[]},G.f,G.faith);
      }
      /* ==== [FIN ANCRE] ==== */
      const finalScore=faithFinalScore(G.f,G.faith);
      G.faith.finalScore=finalScore;
      G.faith.previousBest=getFaithBest();
      recordFaithLegend({id:G.f.id,name:G.f.name,nick:G.f.nick,flag:G.f.flag,
        score:finalScore,sub:computeLegendScore(G.f),
        W:G.f.W,L:G.f.L,ko:G.f.ko||0,
        years:(G.faith.year||2026)-2026,
        oath:G.faith.oath?{label:G.faith.oath.label,fulfilled:faithOathFulfilled(G.faith.oath,G.f,G.faith)}:null});
    }
    /* ==== [FIN ANCRE] ==== */
    G.f.retired=true; enshrine(G.f); syncPlayerSkillsToCodex(G.f); G.f._enshrined=true;
    G.screen=G.faith?'faith_epilogue':'legacy'; save(); render(); },
  /* ==== [ANCRE: FAITH_EPILOGUE] — relancer une carrière Faith depuis
     l'épilogue : on repart de la création du mode, pas du menu principal.
     ==== [CORRECTIF FA-05] — cette fonction ne sauvegardait jamais : G était
     réassigné en mémoire, mais SAVE_KEY (localStorage) gardait la carrière
     retirée. Fermer l'onglet pendant les 9 écrans de création (long) faisait
     rouvrir le jeu sur le mort. wipe() avait été écarté par erreur — la
     justification d'origine ("le Panthéon et les méta-statistiques doivent
     survivre") repose sur une confusion : wipe() ne touche QUE SAVE_KEY
     (state.js) ; HOF_KEY et META_STATS_KEY sont des clés localStorage
     séparées, jamais concernées. Même symétrie que newCareer() ci-dessous,
     qui appelle déjà wipe(). ==== */
  newFaithCareer(){ wipe(); const t=G.theme; G={theme:t,faithDraft:{gender:'H',country:COUNTRY_KEYS[0],first:''}}; setTheme(t); G.screen='faith_draft'; save(); render(); },
  /* ==== [ANCRE: FAITH_RELANCE_RAPIDE] — FA-24 : neuf écrans de création
     avant le premier clic de jeu, au moment précis où la motivation de
     rejouer est maximale (juste après l'épilogue), est le calcul inverse de
     ce qu'il faudrait faire. Trois sorties plutôt qu'un unique bouton :
     - « Reprendre le même chemin » (faithRelaunchSame) reconstruit le
       brouillon à l'identique (origine/style/catégorie/écurie/agent/
       personnalité — via f._origin/f._circle/f._lifestyle/f._stable/
       f._agent/f.style/f.div/f.personality, tous déjà conservés sur le
       combattant, cf. FAITH_CREATION_SEQUENTIELLE) et saute directement à
       finalizeFaithDraft() : un clic, premier temps de jeu. Seuls le
       prénom (laissé vide → makeName() en tire un au hasard, engine.js) et
       le pays (pick(COUNTRY_KEYS)) changent. Un serment aléatoire est tiré
       plutôt qu'omis : c'est un des meilleurs leviers de rejouabilité du
       mode (cf. FA-27), le faire disparaître silencieusement sur le chemin
       rapide reviendrait à l'exclure de la plupart des parties.
     - « Changer une chose » (faithRelaunchEdit) repasse par les 9 écrans
       normaux, mais tout est déjà pré-rempli (y compris prénom/pays) : le
       joueur ne modifie que ce qu'il veut.
     - « Repartir de zéro » réutilise newFaithCareer() tel quel. ==== */
  faithRelaunchSame(){
    const f=G.f; if(!f) return;
    const snap={gender:f.gender,div:f.div,origin:f._origin,style:f.style,lifestyle:f._lifestyle,circle:f._circle,agent:f._agent,personality:f.personality,stable:f._stable};
    const oathPool=FAITH_OATHS.slice();
    for(let i=oathPool.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [oathPool[i],oathPool[j]]=[oathPool[j],oathPool[i]]; }
    const oath=oathPool[0]||null;
    wipe(); const t=G.theme; G={theme:t}; setTheme(t);
    G.faithDraft=Object.assign({country:pick(COUNTRY_KEYS),first:''},snap,
      {_oath:oath?{id:oath.id,label:oath.label,broken:false}:null});
    CL.finalizeFaithDraft();
  },
  faithRelaunchEdit(){
    const f=G.f; if(!f) return;
    wipe(); const t=G.theme;
    G={theme:t,faithDraft:{gender:f.gender,country:f.countryKey,first:f.first,div:f.div,
      origin:f._origin,style:f.style,lifestyle:f._lifestyle,circle:f._circle,agent:f._agent,
      personality:f.personality,stable:f._stable,page:0}};
    setTheme(t); G.screen='faith_draft'; save(); render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: FAITH_LEGENDES_A_BATTRE] — sélection à deux, jamais plus :
     le 3e clic éjecte le plus ancien choix plutôt que de bloquer, pour que
     comparer une autre paire ne demande jamais de désélectionner
     explicitement d'abord. */
  toggleFaithLegendCompare(id){
    if(!G.faithLegendsCompare) G.faithLegendsCompare=[];
    const i=G.faithLegendsCompare.indexOf(id);
    if(i>=0) G.faithLegendsCompare.splice(i,1);
    else { G.faithLegendsCompare.push(id); if(G.faithLegendsCompare.length>2) G.faithLegendsCompare.shift(); }
    render();
  },
  /* ==== [CORRECTIF FA-27] — changer de filtre remet la sélection de
     face-à-face à zéro : comparer deux carrières d'un filtre précédent
     n'a plus de sens une fois la galerie changée sous leurs pieds. */
  setFaithLegendsFilter(oathId){
    G.faithLegendsFilterOath=oathId||null;
    G.faithLegendsCompare=[];
    render();
  },
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: V4_C9_FIGHT_BY_FIGHT] — une seule saison déroulée à la fois
     (re-taper la même la referme) : le Parcours reste une liste, pas un
     accordéon à plusieurs volets ouverts qui redeviendrait aussi long qu'une
     prose. */
  toggleFaithJourneyYear(year){
    G.faithJourneyExpandedYear=(G.faithJourneyExpandedYear===year)?null:year;
    render();
  },
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
    G.screen=(G.f && G.f.retired)?'legacy':(G.faith?'faith_hub':'hub'); save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
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
/* ==== [ANCRE: V3_FAITH_FIGHT_PENDING] — Plan V3 LOT 1 §P07 : Faith ne
   montre plus jamais l'arène round par round (arbitrage A4, "resolved-
   with-suspense-screen") — ce nouvel écran s'intercale entre le combat déjà
   simulé (G.pending.res, résolu en un calcul synchrone comme tout le
   moteur) et sa révélation (scr_fight_flash, réutilisé tel quel juste au-
   dessus). Barre de progression non linéaire (accélère puis ralentit avant
   le verdict — startFaithFightPending() plus bas) sur 2,5 à 4s, confettis
   sur victoire via spawnParticles/updateParticles/drawParticles
   (ANCRE JUICE_NIVEAU2/PARTICLES, réutilisées telles quelles — même pool
   d'objets réutilisés, juste porté par FFP plutôt que par ARENA) sur une
   perte plus lente et silencieuse, sans confettis. Aucun bouton : la
   bascule vers fight_flash est automatique (finishFaithFightPending()). */
function scr_faith_fight_pending(){
  const meWin=!!(G.pending&&G.pending.win);
  return `<div class="scr center intro">
   <div class="eyebrow muted">LE VERDICT ARRIVE</div>
   <div class="mono small muted" style="margin-top:8px">La commission délibère.</div>
   <div style="height:8px;background:var(--panel2);border:1px solid var(--line);border-radius:2px;overflow:hidden;margin-top:28px">
     <div id="ffp-bar" style="height:100%;width:0%;background:var(--gold);transition:none"></div>
   </div>
   ${meWin?'<canvas id="ffp-cv" style="width:100%;height:140px;margin-top:4px;display:block"></canvas>':''}
   <button class="btn ghost mt" style="border:1px solid var(--line)" onclick="CL.skipFaithFightPending()">Passer ▸</button>
  </div>`;
}
/* Pool de particules dédié à cet écran (confettis) : même mécanisme que
   celui de l'arène (ARENA._particles), objet séparé parce que Faith
   n'instancie jamais ARENA/le canvas de l'arène — cf. l'ancre ci-dessus.
   Déclaré une seule fois, réutilisé (jamais réalloué) d'un combat Faith à
   l'autre : seul son tableau ._particles se vide/se remplit. */
let FFP={_particles:[],raf:0,to:0};
function startFaithFightPending(){
  if(!G.pending) return;
  const meWin=!!G.pending.win;
  /* ==== [ANCRE: V3_TITLE_EXTENDED_WAIT] — Plan V3 LOT 6 §5.6.1, temps 5 :
     "écran d'attente allongé" pour un combat de titre ou de défense —
     G.fight.kind reste posé à ce stade (seul champchamp_title est effacé
     après résolution, cf. ANCRE CORRECTIF_KIND_CHAMPCHAMP_PERSISTANT,
     ui-05), donc lisible directement ici sans état supplémentaire. */
  const isTitleFight=G.fight&&(G.fight.kind==='title'||G.fight.kind==='defense');
  const durationMs=isTitleFight?(4000+Math.random()*2000):(2500+Math.random()*1500); // 2,5-4s normal, 4-6s titre (§P07/§P18)
  /* ==== [FIN ANCRE] ==== */
  const t0=(typeof performance!=='undefined'?performance.now():Date.now());
  const bar=document.getElementById('ffp-bar');
  const cv=meWin?/** @type {HTMLCanvasElement|null} */(document.getElementById('ffp-cv')):null;
  let ctx=null, W=0, H=0, spawned=false;
  if(cv && cv.getContext){
    const dpr=Math.min((typeof window!=='undefined'&&window.devicePixelRatio)||1,2);
    W=cv.clientWidth||320; H=140; cv.width=W*dpr; cv.height=H*dpr;
    ctx=cv.getContext('2d'); if(ctx) ctx.scale(dpr,dpr);
  }
  FFP._particles.length=0; // vidé, jamais réalloué (cf. déclaration de FFP)
  /* Non-linéaire : easeOutQuint jusqu'à 85%, puis un dernier tiers de temps
     "suspendu" (progression très lente) avant de sauter à 100% — le
     joueur voit la barre presque finie puis hésiter, comme un jury. */
  function ease(t){ return t<0.7 ? 1-Math.pow(1-(t/0.7),5) : 0.92+(t-0.7)/0.3*0.08; }
  function frame(now){
    const t=Math.min(1,(now-t0)/durationMs);
    if(bar) bar.style.width=(ease(t)*100).toFixed(1)+'%';
    if(ctx){
      if(!spawned && t>0.15){ spawned=true;
        spawnParticles(FFP,W/2,-10,{count:44,xSpread:W*0.9,ySpread:10,spreadX:2,spreadY:1,vy0:1.5,gravity:0.085,life:130,size:6,
          colors:['#E6B93A','#E8442F','#7FC488','#F5EFE0'],kind:'confetti'});
      }
      updateParticles(FFP);
      ctx.clearRect(0,0,W,H);
      drawParticles(ctx,FFP);
    }
    if(t<1){ FFP.raf=requestAnimationFrame(frame); }
    else { finishFaithFightPending(); }
  }
  if(typeof requestAnimationFrame!=='undefined'){ FFP.raf=requestAnimationFrame(frame); }
  else { FFP.to=setTimeout(finishFaithFightPending,durationMs); } // repli (tests jsdom sans rAF)
}
function finishFaithFightPending(){
  if(FFP.raf){ cancelAnimationFrame(FFP.raf); FFP.raf=0; }
  if(FFP.to){ clearTimeout(FFP.to); FFP.to=0; }
  if(G.screen!=='faith_fight_pending') return; // déjà quitté (retour rapide, changement d'écran ailleurs)
  G.screen='fight_flash'; render();
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V3_NEMESIS_CONSECRATION_SCREEN] — Plan V3 LOT 3 §P16 : écran
   dédié, une seule fois par nemesis désigné (drapeau consommé dans
   render(), plus haut). Loi 1 (victime identifiable) : nom complet +
   surnom fraîchement gagné (lockFaithNemesis()) + un détail concret (son
   rang/palmarès actuel, jamais une case vide). Toujours "faith_hub" au
   retour : c'est l'écran calme depuis lequel ce rendu a été intercepté
   dans tous les cas (fin d'année, sortie de combat, résolution d'un
   événement de vie — jamais une séquence de combat, filtrée en amont). */
function scr_faith_nemesis_consecration(){
  const f=G.f;
  const nem=(G.roster||[]).find(o=>o.id===f.faithNemesisId);
  if(!nem) return `<div class="scr center intro"><p class="lede">La rivalité s’est déjà dissoute.</p><button class="btn primary mt" onclick="CL.go('faith_hub')">Continuer</button></div>`;
  const rang=divRank(nem);
  return `<div class="scr center intro" style="max-width:480px;margin:0 auto">
   <div class="eyebrow" style="color:var(--f-red-hi)">UNE NÉMÉSIS EST NÉE</div>
   <h2 class="hero-name" style="font-size:28px;line-height:1.1;margin-top:8px">${esc(fighterDisplayName(nem))}</h2>
   <div class="mono small muted" style="margin-top:10px">${esc(nem.divName||'')} · rang #${rang} · ${nem.W||0}-${nem.L||0}${nem.D?`-${nem.D}`:''}</div>
   <p class="lede small" style="margin-top:16px">${esc(fighterDisplayName(nem,false))} portera désormais ce surnom partout où votre carrière le recroisera — sur les affiches, dans la presse, dans vos souvenirs.</p>
   <div class="card mt" style="padding:14px;background:var(--panel2);border-left:3px solid var(--f-red-hi);text-align:left">
     <div class="eyebrow mb" style="font-size:11px;color:var(--f-red-hi)">${esc(nemesisTierLabel(0))}</div>
     <div class="small muted">Aucun combat encore joué entre vous deux — le premier écrira le reste.</div>
   </div>
   <button class="btn primary mt" style="width:100%;height:52px;font-size:16px" onclick="CL.go('faith_hub')">Continuer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: V3_TITLE_SEQUENCE] — Plan V3 LOT 6 §5.6.1 : la séquence de
   titre en 5 temps ("jamais un bouton"). Portée réduite par rapport à la
   spécification complète (temps 1 "la rumeur" — un mois ou deux de
   rumeurs progressives avant l'annonce — n'a pas de représentation dans
   l'état actuel du jeu, qui ne connaît que le mois EN COURS ; l'ajouter
   demanderait un système de rumeurs différées hors du périmètre de ce
   lot, explicitement différé) : les temps 2 (mérite), 3 (négociation),
   4 (montée, cf. V3_TITLE_PROMO_EXCLUSIF plus haut) et 5 (attente
   allongée + consécration) sont, eux, réellement construits ci-dessous. */
/** Temps 2 — "Le mérite" : expose FACTUELLEMENT pourquoi ce combat de
 * titre existe (série, adversaires notables battus, rang), et qui le
 * conteste (le PNJ le mieux classé du roster). Le cas "pas encore mérité"
 * n'a pas d'écran dédié ici : fightKind() (ui-05) EST déjà la garde
 * d'éligibilité — on n'atteint cet écran que lorsqu'elle est vraie. */
function scr_faith_title_merit(){
  const f=G.f;
  const rang=divRank(f);
  const contenders=rankPool(G.roster||[]);
  const contender=contenders[0]||null;
  const notableWins=(f.history||[]).filter(h=>h.res==='win' && (h.oppWasChamp || (h.oppElo||0)>=1500)).slice(-3);
  const recentWins=notableWins.length?notableWins:(f.history||[]).filter(h=>h.res==='win').slice(-2);
  return `<div class="scr center intro" style="max-width:480px;margin:0 auto">
   <div class="eyebrow gold">LE MÉRITE</div>
   <h2 class="disp" style="margin-top:6px">On parle de vous pour le titre.</h2>
   <div class="card mt" style="padding:16px;background:var(--panel2);border:1px solid var(--gold);text-align:left">
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Rang actuel</span><span class="gold">#${rang}</span></div>
     <div class="mono small mt" style="display:flex;justify-content:space-between"><span class="muted">Série en cours</span><span class="${(f.streak||0)>0?'sage':'muted'}">${f.streak>0?`${f.streak} victoire(s) de suite`:'—'}</span></div>
     ${recentWins.length?`<div class="mt"><div class="eyebrow" style="font-size:10px;margin-bottom:6px">CE QUI VOUS Y AMÈNE</div>
       ${recentWins.map(h=>`<div class="small muted">Victoire face à ${esc(h.oppName||'un adversaire')}${h.oppWasChamp?' — alors champion':''}${h.oppRecord?` (${h.oppRecord})`:''}</div>`).join('')}
     </div>`:''}
   </div>
   ${contender?`<div class="card mt" style="padding:14px;background:var(--panel2);border-left:3px solid var(--blood);text-align:left">
     <div class="eyebrow" style="font-size:10px;color:var(--blood)">QUI CONTESTE</div>
     <div class="hero-name" style="font-size:18px;margin-top:4px">${esc(fighterDisplayName(contender))} ${contender.flag||''}</div>
     <div class="small muted mt">${recordStr(contender)} · rang #${divRank(contender)} — pense encore mériter sa place avant vous.</div>
   </div>`:''}
   <p class="lede small mt">Le mérite ne se discute plus. Reste à le confirmer dans la cage.</p>
   <button class="btn primary mt" style="width:100%;height:52px;font-size:16px" onclick="CL.faithFight()">Continuer</button>
  </div>`;
}
/** Temps 3 — négociation de titre, distincte de scr_faith_offer() : leviers
 * propres (clause de revanche, part de la billetterie), rounds fixés par
 * faithGalaPosition() (déjà 5 pour un Main event, jamais un choix ici — la
 * spec ne le liste qu'à titre indicatif, la valeur existe déjà). Le choix
 * du lieu (spec, "5 rounds, part de la billetterie, choix du lieu")
 * suppose de pouvoir surcharger la ville déterministe du gala
 * (faithGalaVenueInfo, ui-04) — hors périmètre de ce lot, différé. */
function scr_faith_title_negotiation(){
  const f=G.f, F=G.faith, off=F.pendingOffer;
  if(!off) return `<div class="scr center intro"><p class="lede">Aucune offre en cours.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const o=off.opp.o, gala=off.gala;
  const base=(f.org>0 && f.contract)?f.contract.show:(ORG_PURSES[f.org]||[0,0])[0];
  const bourseEst=Math.round(base*(gala.mult||1)*(off.bonusMult||1)*10)/10;
  const isDefense=!!f.champion;
  const canRevengeClause=faithLeverage(f,F)>0 && o.id!==f.faithNemesisId;
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow" style="color:var(--gold)">${isDefense?'DÉFENSE DU TITRE':'COMBAT DE TITRE'}</div>
   <h2 class="hero-name" style="font-size:26px;line-height:1.1">${esc(gala.label)}</h2>
   <!-- ==== [ANCRE: CORRECTIF_ROUNDS_TITRE_CODES_EN_DUR] — bug trouvé : "5
        reprises" et "conférence et pesée obligatoires" étaient écrits en dur,
        vrais aujourd'hui seulement parce qu'isTitleEligible (rang ≤ 4, ui-05)
        coïncide avec le seuil Main event de faithGalaPosition (rk ≤ 4, ui-04)
        — deux constantes indépendantes, dans deux fichiers, sans aucun test
        qui les lie. Lu directement sur gala (déjà résolu ci-dessus). ==== -->
   <div class="mono small muted" style="margin-top:4px">${gala.rounds} reprises · registre spectacle${gala.pressConf?' · conférence et pesée obligatoires':''}</div>
   <div class="opp" style="padding:16px;text-align:left;margin-top:20px">
     <div class="hero-name" style="font-size:22px">${esc(o.name)} ${o.flag}</div>
     <div class="mono small" style="margin-top:4px">${recordStr(o)} · <span class="muted">#${divRank(o)}</span>${o.champion?' · Champion':''}</div>
     <div class="small muted" style="margin-top:8px">${esc(off.opp.read)}</div>
   </div>
   <div class="mono" style="margin-top:16px;font-size:15px">Bourse estimée : <b>${bourseEst}k$</b></div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
     <button class="btn primary" style="height:56px;font-size:16px" onclick="CL.faithOfferSign()">SIGNER</button>
     ${faithLeverage(f,F)>0?`<div class="opp" style="padding:14px" onclick="CL.faithOfferDemandMoney()">
       <b style="font-size:15px">Négocier la part de la billetterie</b>
       <div class="muted small mt">Une bourse à la hauteur de l'enjeu, ou rien.</div>
     </div>`:''}
     ${canRevengeClause?`<div class="opp" style="padding:14px;border-color:${F.pendingRevengeClause?'var(--gold)':'var(--line)'}" onclick="CL.faithTitleToggleRevengeClause()">
       <b style="font-size:15px">${F.pendingRevengeClause?'✓ ':''}Clause de revanche</b>
       <div class="muted small mt">${F.pendingRevengeClause?'Si vous perdez, la revanche est garantie — le même adversaire, pas un autre.':'En cas de défaite, garantit une revanche immédiate plutôt qu’un tirage classique.'}</div>
     </div>`:''}
     <button class="btn ghost" onclick="CL.faithOfferRefuse()">Refuser le combat</button>
   </div>
   <div class="mono small" style="text-align:center;margin-top:14px"><span onclick="CL.viewFightCard()" style="color:var(--gold);cursor:pointer;text-decoration:underline">Voir la carte complète ▸</span></div>
  </div>`;
}
/** Temps 5 (suite) — consécration, une seule fois, après l'écran de
 * résultat (interceptée par render(), ANCRE V3_TITLE_CONSECRATION
 * ci-dessus). La ligne finale (FAITH_TITLE_FINAL_LINES) est LE point le
 * plus important de cet écran — mise en avant seule, en dernier. */
function scr_faith_title_consecration(){
  const f=G.f, F=G.faith;
  const c=F.lastTitleConsecration;
  if(!c) return `<div class="scr center intro"><p class="lede">Le moment est déjà passé.</p><button class="btn primary mt" onclick="CL.go('faith_hub')">Continuer</button></div>`;
  const won=c.type==='won';
  if(!TEXT_POOLS['faith_title_final_line']) registerTextPool('faith_title_final_line',FAITH_TITLE_FINAL_LINES);
  const finalLine=txtPick('faith_title_final_line',{type:c.type,wasNemesis:c.wasNemesis,wasUnderdog:c.wasUnderdog,attemptsBefore:c.titleAttemptsBefore,personality:f.personality});
  const coach=(typeof faithCoachPerson==='function')?faithCoachPerson(F):null;
  const gymTop=(F.gym||[]).find(p=>p.id===F.sparringPrimaryId);
  const nem=(G.roster||[]).find(o=>o.id===f.faithNemesisId);
  const journ=faithEnsureJournalist(F);
  const reign=(G.titleHistory||[]).find(r=>r.org===f.org && r.divName===f.divName && r.champion===f.name);
  return `<div class="scr center intro" style="max-width:480px;margin:0 auto">
   <div class="eyebrow gold" style="letter-spacing:0.3em">${won?'CONSÉCRATION':'TITRE DÉFENDU'}</div>
   <div style="font-size:64px;margin-top:10px">${SVG&&SVG.medal?SVG.medal:'🏆'}</div>
   <h2 class="hero-name" style="font-size:28px;line-height:1.1;margin-top:8px">${esc(orgDisplayName(f).toUpperCase())} · ${esc(f.divName||'')}</h2>
   ${reign?`<div class="mono small muted mt">Règne inscrit — ${reign.defenses||0} défense(s) à ce jour.</div>`:''}
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     ${coach?`<div class="small muted">${esc(personName(coach,{}))}, votre coach : « Ce n'est pas un accident. On l'a construit. »</div>`:''}
     ${gymTop?`<div class="small muted mt">${esc(gymTop.first||gymTop.name||'')} à la salle : « On l'a vu se battre pour ça tous les jours. »</div>`:''}
     ${nem?`<div class="small mt" style="color:var(--f-red-hi)">${esc(fighterDisplayName(nem,false))} regarde en silence, depuis les vestiaires adverses.</div>`:''}
     <div class="small muted mt">${esc(journ.name)}, ${esc(journ.media)} : « Retenez cette date. »</div>
   </div>
   <p class="lede mt" style="font-style:italic;font-size:17px;line-height:1.4">${esc(finalLine)}</p>
   <button class="btn primary mt" style="width:100%;height:52px;font-size:16px" onclick="CL.go('faith_hub')">Continuer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: V3_SCR_FIGHT_CARD] — Plan V3 LOT 6 §5.6.1.b : la carte
   complète, en 1 tap depuis l'offre (scr_faith_offer/scr_faith_title_
   negotiation, "Voir la carte complète") ou depuis le hub une fois le
   combat du joueur résolu ("Résultats de la carte"). Les combats de
   complément sont DÉJÀ joués (generateFightCard, ui-08) au moment où cet
   écran s'affiche — ce n'est pas une prévisualisation, ce sont de vrais
   résultats. */
function scr_faith_card(){
  const card=G.faith&&G.faith.currentCard;
  if(!card) return `<div class="scr center intro"><p class="lede">Aucune carte pour l'instant.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const pr=card.playerResult;
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow gold">LA CARTE COMPLÈTE</div>
   <h2 class="hero-name" style="font-size:24px;line-height:1.1">${esc(card.label)}</h2>
   <div class="mono small muted" style="margin-top:4px">${card.fights.length+1} combats · ${esc(card.tier||'')}</div>
   <div class="opp" style="padding:14px;text-align:left;margin-top:16px;border-left:3px solid var(--gold)">
     <div class="eyebrow" style="font-size:10px;color:var(--gold)">${card.tier==='Main event'?"TÊTE D'AFFICHE":'VOTRE COMBAT'}</div>
     <div class="small mt">${esc(G.f.name)} vs ${esc(card.oppName)}</div>
     ${pr?`<div class="mono small mt" style="color:${pr.win?'var(--win)':'var(--loss)'}">${pr.win?'Victoire':'Défaite'} · ${esc(pr.method)}</div>`:'<div class="muted small mt">Pas encore joué.</div>'}
   </div>
   ${card.fights.map(fi=>`<div class="opp" style="padding:12px;text-align:left;margin-top:8px">
     <div class="small">${esc(fi.aName)} ${fi.aFlag||''} vs ${esc(fi.bName)} ${fi.bFlag||''}</div>
     <div class="mono small muted mt">${fi.winnerName?`${esc(fi.winnerName)} gagne par ${esc(fi.method)}`:'Match nul'}</div>
   </div>`).join('')}
   <button class="btn ghost mt" onclick="CL.go('${G._cardReturn||'faith_hub'}')">← Retour</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
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
   <h2 class="disp gold" style="font-size:20px">${esc(item.name)}</h2>
   <div class="card glass raise" style="padding:12px;border-color:var(--blood-d);background:var(--panel2)">
     <canvas id="shop-preview-cv" style="width:100%;height:180px;display:block;border:1px solid var(--line);background:var(--bg)"></canvas>
   </div>
   <div class="card mt" style="background:var(--panel2);padding:14px">
     <div class="muted small">${esc(item.desc)}</div>
     ${fxTxt?`<div class="mono small gold mt">${fxTxt} (actif pour toute la run)</div>`:''}
   </div>
   <button class="btn ghost mt" style="border-color:var(--blood);color:var(--blood)" onclick="CL.buyAndCloseConsumable('${item.id}')" ${canAfford?'':'disabled'}>${owned?'Déjà un consommable en attente':`Acheter — ${item.cost} pts`}</button>
   <button class="btn ghost mt" onclick="CL.closeConsumablePreview()">Fermer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
