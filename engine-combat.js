"use strict";
/* CAGE LEGACY — js/engine-combat.js
   Extrait d'engine.js (chantier 4 : refactorisation progressive du moteur).
   Regroupe le coeur du combat : profil mecanique par style (STYLE_PROFILE),
   simulation round par round (simulateFight, juges 10-point, micro-
   sequences, plan tactique, mementoire tactique), application du resultat
   au combattant (applyResult), catalogue des finitions et leur habillage
   (FINISH_MOVES/GENERIC_SUB/GENERIC_KO/MOVE_SIGNATURE_FLAVOR/
   pickFinishMove), et l'estimation de probabilite de victoire pre-combat
   (winProbEstimate).

   Deplace a l'IDENTIQUE depuis engine.js : memes noms de fonctions, memes
   signatures, memes ancres ANCRE:/FIN ANCRE, comportement strictement
   inchange (aucune ligne de logique de simulation modifiee). C'est le bloc
   le plus interdependant et le plus risque du moteur (le plan demandait de
   le laisser en dernier) : deplacement mecanique pur, verifie par la suite
   de tests complete apres coup, aucun recalibrage.

   Scope global classique (pas d'import/export) : depend des primitives
   d'engine.js (rnd/pick/clamp/num/RI/gauss/sigmoid/d20/parseGender/
   isDecisionLike/ATTR_KEYS/DIVISIONS/STYLES/eff/overall/reachEdge/buildEdge/
   weightFactor/makeFighter...) donc CHARGE JUSTE APRES engine.js. Utilise
   aussi des fonctions d'engine-progression.js (grantSkill, epithets,
   txtPick) et d'engine-events.js (getRivalryPurseMultiplier...) au
   runtime — l'ordre exact entre
   fichiers freres n'a pas d'importance tant que tous chargent avant que
   la partie ne demarre reellement (aucun appel au niveau racine d'un
   fichier vers un autre). */

function simulateFight(A,B,rounds=3,plan=null,planB=null,opts=null){ const a=eff(A),b=eff(B);
  /* ==== [ANCRE: IMMUNITE_FINITION_CAMP] — item demandé : passifs de camp
     "impossible à finir" (Familial round 1, Ascétique round 3). Purement
     additif : opts est undefined sur tous les appels existants (carrière,
     fantasy, vs ami, arcade non-coaching), donc leur comportement est
     inchangé à l'identique. immuneA n'empêche que le TIRAGE d'une finition
     contre A pendant CET appel — n'affecte jamais B. ==== */
  const immuneA=!!(opts&&opts.immuneA);
  /* ==== [FIN ANCRE] ==== */
  const profA=A._styleProfileOverride||STYLE_PROFILE[A.style]||STYLE_PROFILE.mma, profB=B._styleProfileOverride||STYLE_PROFILE[B.style]||STYLE_PROFILE.mma;
  /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — politique de combat des deux
     combattants (STYLE_POLICY, engine.js), lue tout au long de la boucle
     de combat ci-dessous. ==== */
  const policyA=policyOf(A), policyB=policyOf(B);
  /* ==== [FIN ANCRE] ==== */
  const wf=weightFactor(A);
  const koWeightMult=1+(wf-0.5)*0.8;
  const subWeightMult=1+(0.5-Math.abs(wf-0.5))*0.7; // pic d'efficacité au poids moyen (wf≈0.5)
  const noiseWeightMult=1+(wf-0.5)*0.4;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: PLAN_TACTIQUE] — modificateurs du vestiaire (audit §11), appliqués
  // une seule fois sur les canaux de A avant la boucle des rounds. Clés vérifiées
  // contre les canaux réels de eff() : striking, power, footwork/fightIQ (def),
  // takedown (td), tdd, submission (sub), ground (gnp), topControl (ctrl). ====
  let myGi=(STYLES[A.style]||STYLES.mma).grap;
  if(plan){
    if(plan.gi) myGi*=plan.gi;
    if(plan.td) a.takedown*=plan.td;
    if(plan.tdd) a.tdd*=plan.tdd;
    if(plan.str) a.striking*=plan.str;
    if(plan.ko) a.power*=plan.ko;
    if(plan.sub) a.submission*=plan.sub;
    if(plan.gnp) a.ground*=plan.gnp;
    if(plan.ctrl) a.topControl*=plan.ctrl;
    if(plan.def){ a.footwork*=plan.def; a.fightIQ*=plan.def; }
    for(const k in a){ if(typeof a[k]==='number') a[k]=clamp(a[k],1,150); }
  }
  // ==== [ANCRE: PLAN_TACTIQUE_B] — même mécanisme que ci-dessus, côté B cette
  // fois. Sert à l'IA adaptative en rematch (getAdaptiveNPCTactics) qui, faute
  // de ce paramètre, ne pouvait modifier que des canaux jamais lus (eff() étant
  // recalculé en interne à chaque appel de simulateFight, un ajustement fait
  // depuis l'extérieur n'avait aucun effet réel). ====
  if(planB){
    if(planB.td) b.takedown*=planB.td;
    if(planB.tdd) b.tdd*=planB.tdd;
    if(planB.str) b.striking*=planB.str;
    if(planB.ko) b.power*=planB.ko;
    if(planB.sub) b.submission*=planB.sub;
    if(planB.gnp) b.ground*=planB.gnp;
    if(planB.ctrl) b.topControl*=planB.ctrl;
    if(planB.def){ b.footwork*=planB.def; b.fightIQ*=planB.def; }
    for(const k in b){ if(typeof b[k]==='number') b[k]=clamp(b[k],1,150); }
  }
  // ==== [FIN ANCRE] ====
  const giA=myGi, giB=(STYLES[B.style]||STYLES.mma).grap; const rEdge=reachEdge(A,B);
  /* ==== [ANCRE: P8_L8_GABARIT] — bEdge, calculé une fois par combat comme
     rEdge ci-dessus (aucun des deux ne varie avec la fatigue/les dégâts en
     cours de combat) : cf. buildEdge() (engine.js) pour la distinction avec
     rEdge — taille+densité contre allonge pure. ==== */
  const bEdge=buildEdge(A,B);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L8_GARDE_STANCE] — Lot 8/P8 §8.2 : calculé une fois par
     combat (la stance ne change jamais en cours de combat) — vrai seulement
     quand les deux combattants ont des gardes opposées (un orthodoxe pied
     avant droit contre un gaucher pied avant gauche, la vraie définition
     d'un "open stance matchup"), jamais entre deux mêmes gardes. ==== */
  const openStance=(((A.phys&&A.phys.stance)||'orthodox')!==((B.phys&&B.phys.stance)||'orthodox'));
  /* ==== [FIN ANCRE] ==== */
  let sa=0,sb=0,dmgA=0,dmgB=0,finish=null; const log=[];
  /* ==== [ANCRE: P7_L2_DEGATS_PROGRESSIFS_BASELINE] — Lot 2/P7 §2.2 : valeurs
     de référence des canaux dégradés PROGRESSIVEMENT par les dégâts cumulés
     par zone (recalculées chaque tick à partir de CETTE référence fixe et de
     l'état courant de st.X.dmgLegs/dmgBody/dmgHead — jamais par decay
     multiplicatif répété, qui compounderait de façon incontrôlable sur les
     ~100 ticks d'un round). Capturées ici, APRÈS le plan tactique (qui a déjà
     ajusté a/b), donc chaque dégradation ci-dessous s'ajoute au plan de
     coaching plutôt que de l'écraser. ==== */
  const baseFootworkA=a.footwork, baseFootworkB=b.footwork;
  const baseKickA=a.kick, baseKickB=b.kick;
  const baseTddA=a.tdd, baseTddB=b.tdd;
  const baseCardioA=a.cardio, baseCardioB=b.cardio;
  const baseChinA=a.chin, baseChinB=b.chin;
  const baseComposureA=a.composure, baseComposureB=b.composure;
  const baseDurabilityA=a.durability, baseDurabilityB=b.durability;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L9_BLESSURES] — mêmes références fixes que ci-dessus,
     capturées APRÈS le plan tactique : `power`/`takedown` ne sont sinon
     jamais recalculés à chaque tick (contrairement à footwork/kick/tdd/
     cardio/chin/composure/durability ci-dessus) — une blessure doit
     pourtant pouvoir les dégrader pour le reste du combat sans écraser
     l'ajustement du plan de coaching. ==== */
  const basePowerA=a.power, basePowerB=b.power;
  const baseTakedownA=a.takedown, baseTakedownB=b.takedown;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P7_L5_COUPE_DE_POIDS] — Addendum P7 point 4 : weightCutInfo()
     existe côté carrière (avertissements de pesée, ui-02) mais n'atteignait
     jamais engine-combat.js (`weightCut` : zéro occurrence avant ce lot) —
     un système déjà écrit qui ne servait à rien. Tiré une fois par
     combattant ici (jamais par tick, sous peine de désynchroniser le
     déterminisme seedé round après round), comme un poids de forme mesuré
     à la pesée. `cutPct` suit gauss(9,5,0,24) : sévérité nulle pour une
     coupe dans la moyenne (~9%, la norme du milieu), montant vers 1 pour
     les coupes extrêmes (24%) — voir application round par round plus bas
     (durability, ANCRE P7_L2_DEGATS_PROGRESSIFS, et fatigue additive,
     ANCRE P7_L5_COUPE_DE_POIDS sur fatA/fatB), jamais dès le round 1 :
     l'eau perdue au pesage est déjà largement reprise en début de combat. ==== */
  const cutSeverityA=clamp((weightCutInfo(A).cutPct-9)/15,0,1);
  const cutSeverityB=clamp((weightCutInfo(B).cutPct-9)/15,0,1);
  /* ==== [FIN ANCRE] ==== */
  // ==== [ANCRE: CHIN_TEMPORAIRE] — un round brutal fragilise le menton pour LE
  // RESTE DE CE COMBAT uniquement (variable locale), jamais l'attribut permanent
  // du combattant : encaisser un round dur ne doit pas user le menton à vie,
  // sans que le joueur en soit jamais informé. ====
  let chinVulnA=0, chinVulnB=0;
  // ==== [FIN ANCRE] ====
  /* ==== [ANCRE: P7_L2_FENETRE_FINITION] — Lot 2/P7 §2.3 : `wobbled` n'était
     qu'un COMPTEUR (nombre de fois où pA/pB>=8 ou un KD est survenu), jamais
     un ÉTAT consulté par la suite du combat — un combattant tout juste sonné
     se battait exactement comme la seconde d'avant. dangerA/dangerB portent
     désormais un vrai état temporisé (secondes d'horloge RÉELLES restantes,
     décrémentées de dt à chaque tick quelle que soit la phase — voir ANCRE
     P7_L2_FENETRE_FINITION_DECAY plus bas) : tant que dangerX>0, l'attaquant
     voit son volume augmenter et une finition devient nettement plus
     probable (phase 'debout'), et la cloche n'en efface qu'une partie
     proportionnelle à `recovery` (ANCRE RECUP_INTER_ROUND, §2.5) — jamais
     les dégâts cumulés par zone, qui ne sont eux jamais réduits. ==== */
  let dangerA=0, dangerB=0;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L7_ARBITRE_ETAT] — compteur de relances debout sur
     inactivité (ANCRE P8_L7_ARBITRE_RELANCE), exposé en fin de combat via
     res.refStandups — sert au harnais Monte Carlo (tools/monte-carlo-combat.js)
     pour mesurer "part des combats se terminant par..." et, plus largement,
     la fréquence de la relance sans avoir à parser le log narratif. ==== */
  let refStandupCount=0;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L9_EXAMEN_MEDICAL] — compteur d'examens entre les
     rounds, exposé en fin de combat via res.examCount — même rôle que
     refStandupCount ci-dessus pour le harnais Monte Carlo (mesurer la
     fréquence sans reparser le log). ==== */
  let examCount=0;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L7_ARBITRE_ETAT] — Lot 7/P8 §7.1 : état de l'arbitre,
     persistant sur TOUTE la durée du combat (jamais remis à zéro par la
     cloche, comme un vrai arbitre qui se souvient des fautes déjà
     sanctionnées) — foulPointsX compte les retraits de point déjà infligés
     à ce combattant (un deuxième déclenche la disqualification automatique,
     règle simplifiée) ; foulWarnX les avertissements, jamais lus par une
     mécanique, uniquement pour trace/narration. Voir ANCRE
     P8_L7_ARBITRE_FAUTES plus bas pour le jet lui-même. ==== */
  let foulPointsA=0, foulPointsB=0, foulWarnA=0, foulWarnB=0;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L9_BLESSURES] — état des blessures, persistant sur TOUTE
     la durée du combat (jamais remis à zéro par la cloche — une main
     cassée au round 2 reste cassée au round 4) : au plus UNE blessure par
     TYPE et par combattant (une main ne se casse pas deux fois), jamais un
     malus global — chaque multiplicateur ne dégrade qu'un canal précis
     (power pour la main, takedown/footwork pour le genou, composure/
     footwork pour l'œil), recombiné avec les autres dégradations
     (dégâts cumulés, ANCRE P7_L2_DEGATS_PROGRESSIFS) à chaque tick. ==== */
  let injHandMultA=1, injHandMultB=1, injKneeMultA=1, injKneeMultB=1, injEyeMultA=1, injEyeMultB=1;
  let injuredHandA=false, injuredHandB=false, injuredKneeA=false, injuredKneeB=false, injuredEyeA=false, injuredEyeB=false;
  /* ==== [FIN ANCRE] ==== */
  // ==== [ANCRE: MOTEUR_COMBAT_STATS_ENRICHIES] — modèle statistique complet selon spécification DeepSeek ====
  const makeFighterStats=()=>({
    sig:0, td:0, tdAtt:0, ctrl:0, sub:0, kd:0, dmgHead:0, dmgBody:0, dmgLegs:0,
    sigAtt:0, total:0, totalAtt:0,
    sigHead:0, headAtt:0, sigBody:0, bodyAtt:0, sigLeg:0, legAtt:0,
    distStrikes:0, distAtt:0, clinchStrikes:0, clinchAtt:0, groundStrikes:0, groundAtt:0,
    powerStrikes:0, tdDef:0, reversals:0, standups:0, guardPasses:0,
    subAtt:0, subEscapes:0, ctrlSec:0, clinchCtrlSec:0, groundCtrlSec:0,
    wobbled:0, cuts:0, lateSig:0,
    /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — répartition des frappes
       significatives par TYPE (§9.1) et des coupures par SOURCE (§9.1
       "coudes, chocs de têtes, coups lourds, dans cet ordre") — purement
       additif, alimenté sans toucher aux compteurs ci-dessus. ==== */
    byType:{jab:0,cross:0,hook:0,uppercut:0,elbow:0,knee:0,legKick:0,bodyKick:0,headKick:0,spinning:0,frontKick:0,groundPunch:0},
    cutSrc:{elbow:0,clash:0,heavy:0}
    /* ==== [FIN ANCRE] ==== */
  });
  const st={ A:makeFighterStats(), B:makeFighterStats() };
  let momentum=50; // jauge narrative (50=neutre), n'influence aucun calcul de combat
  // ==== [ANCRE: JUGES_10PT] — vrai 10-point must, round par round, 3 juges ====
  const roundStats=[]; let j1A=0,j1B=0,j2A=0,j2B=0,j3A=0,j3B=0;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: ANTI_REPETITION] — évite de tirer deux fois de suite la même phrase ====
  let lastTemplates=[]; // les 2 derniers modèles de phrase (nom neutralisé), pas la chaîne finale
  const normalizeTxt=(txt)=>txt.split(A.name).join('§').split(B.name).join('§');
  const getUniqueLog=(pool)=>{ let txt=pick(pool); let tpl=normalizeTxt(txt); let tries=0;
    while(lastTemplates.includes(tpl)&&tries<8){ txt=pick(pool); tpl=normalizeTxt(txt); tries++; }
    lastTemplates.push(tpl); if(lastTemplates.length>2) lastTemplates.shift();
    return txt; };
  // ==== [FIN ANCRE] ====
  /* ==== [ANCRE: P8_L9_BLESSURES] — trois fermetures partagées par tous les
     points d'appel de blessure de ce combat (debout/clinch/sol) : jamais
     dupliquées à chaque site de déclenchement. `r`/`beatT`/`phase`/`mom`
     sont passés en paramètres (pas capturés par fermeture) car ce sont des
     bindings redéclarés À CHAQUE ROUND/TICK (dont `r`, scopé au `for(let
     r=...)` plus bas — inaccessible par fermeture depuis une fonction
     déclarée avant cette boucle), contrairement à `log`/`st`/A/B, qui eux
     sont stables sur tout le combat et peuvent être fermés dessus. */
  /** Coupure accumulée -> arcade qui "ferme" pour de bon (§9.2) : dégrade
   * composure/footwork (vision troublée), jamais un malus global, au plus
   * une fois par combattant et par combat. */
  const tryEyeInjury=(sideIsA,r,beatT,phase,mom)=>{
    const already=sideIsA?injuredEyeA:injuredEyeB, cuts=(sideIsA?st.A:st.B).cuts;
    if(already || cuts<INJURY_EYE_CUTS_THRESHOLD || rnd()>=INJURY_EYE_CHANCE) return;
    const f=sideIsA?A:B;
    if(sideIsA){ injuredEyeA=true; injEyeMultA=INJURY_EYE_MULT; } else { injuredEyeB=true; injEyeMultB=INJURY_EYE_MULT; }
    log.push({r,phase,by:sideIsA?'me':'op',text:`[${formatTime(beatT)}] L’arcade de ${f.name} s’ouvre pour de bon, la vision se trouble.`,momentum:mom,
      snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
  };
  /** Coup lourd porté -> risque pour la main de SON AUTEUR (§9.2 "main
   * cassée"), jamais pour sa cible. Retourne true si la blessure met fin au
   * combat sur le coup (cas extrême, §9.2) — l'appelant doit alors poser
   * `finish` lui-même (cette fermeture ne connaît pas `finish`). */
  const tryHandFracture=(sideIsA,amp,r,beatT,phase,mom)=>{
    const already=sideIsA?injuredHandA:injuredHandB;
    if(already || amp<INJURY_HAND_AMP_THRESHOLD || rnd()>=INJURY_HAND_CHANCE*(dt/50)) return false;
    const f=sideIsA?A:B;
    if(sideIsA){ injuredHandA=true; injHandMultA=INJURY_HAND_POWER_MULT; } else { injuredHandB=true; injHandMultB=INJURY_HAND_POWER_MULT; }
    log.push({r,phase,by:sideIsA?'me':'op',text:`[${formatTime(beatT)}] ${f.name} touche fort, mais grimace aussitôt : sa main a morflé sur l’impact.`,momentum:mom,
      snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
    return rnd()<INJURY_HAND_END_CHANCE;
  };
  /** Scramble au sol -> risque de genou qui lâche (§9.2 "genou lâché"),
   * indépendant de qui est dessus/dessous (les deux prennent des appuis
   * dans un scramble). Même contrat de retour que tryHandFracture. */
  const tryKneeInjury=(sideIsA,r,beatT,phase,mom)=>{
    const already=sideIsA?injuredKneeA:injuredKneeB;
    if(already || rnd()>=INJURY_KNEE_CHANCE*(dt/50)) return false;
    const f=sideIsA?A:B;
    if(sideIsA){ injuredKneeA=true; injKneeMultA=INJURY_KNEE_MULT; } else { injuredKneeB=true; injKneeMultB=INJURY_KNEE_MULT; }
    log.push({r,phase,by:sideIsA?'me':'op',text:`[${formatTime(beatT)}] Le genou de ${f.name} lâche dans le scramble, visiblement affecté.`,momentum:mom,
      snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
    return rnd()<INJURY_KNEE_END_CHANCE;
  };
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: HORLOGE_CONTINUE] — Lot P6/2026 : roundLen/dt sont les
     DEUX SEULES constantes qui pilotent la granularité de simulation —
     tout ajustement du pas se fait UNIQUEMENT ici. dt doit rester impair
     et non multiple de 5 (calibrage tools/monte-carlo-combat.js) si
     jamais 3 s'avère trop lent. formatTime prend désormais des secondes
     écoulées dans le round (plus un index de micro-séquence) et rend le
     temps RESTANT au format mm:ss, comme avant. ==== */
  const roundLen=300, dt=3;
  const formatTime=(sec)=>{ const rem=Math.max(0,roundLen-sec); const m=Math.floor(rem/60); const s=Math.floor(rem%60); return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };
  /* ==== [FIN ANCRE] ==== */
  const getTags=f=>(f.skills||[]).map(id=>{ const s=SKILLS.find(x=>x.id===id); return s?(s.tags||[]):[]; }).flat();
  const tagsA=getTags(A), tagsB=getTags(B);
  for(let r=1;r<=rounds && !finish;r++){
    // ==== [ANCRE: JUGES_10PT_SNAP] ====
    const _startSa=sa, _startSb=sb;
    const _kdA0=st.A.kd, _kdB0=st.B.kd, _sigA0=st.A.sig, _sigB0=st.B.sig, _tdA0=st.A.td, _tdB0=st.B.td, _ctrlA0=st.A.ctrl||0, _ctrlB0=st.B.ctrl||0;
    const _sigAttA0=st.A.sigAtt||0, _sigAttB0=st.B.sigAtt||0;
    const _totalA0=st.A.total||0, _totalB0=st.B.total||0, _totalAttA0=st.A.totalAtt||0, _totalAttB0=st.B.totalAtt||0;
    const _tdAttA0=st.A.tdAtt||0, _tdAttB0=st.B.tdAtt||0, _tdDefA0=st.A.tdDef||0, _tdDefB0=st.B.tdDef||0;
    const _ctrlSecA0=st.A.ctrlSec||0, _ctrlSecB0=st.B.ctrlSec||0;
    const _subAttA0=st.A.subAtt||0, _subAttB0=st.B.subAtt||0;
    const _headA0=st.A.sigHead||0, _headB0=st.B.sigHead||0, _bodyA0=st.A.sigBody||0, _bodyB0=st.B.sigBody||0, _legA0=st.A.sigLeg||0, _legB0=st.B.sigLeg||0;
    const _pwrA0=st.A.powerStrikes||0, _pwrB0=st.B.powerStrikes||0, _wobA0=st.A.wobbled||0, _wobB0=st.B.wobbled||0;
    // ==== [FIN ANCRE] ====
    /* ==== [ANCRE: P8_L9_RYTHME_ROUND] — "accélération... chez celui qui se
       sait mené aux points" sur la lecture de score DÉJÀ DISPONIBLE côté
       juges (§9.4) : j1A/j1B/j2A/j2B/j3A/j3B ne portent encore, à cet
       instant de la boucle, que les totaux des rounds PRÉCÉDENTS (l'ajout
       du round courant n'a lieu qu'en fin de round, ANCRE JUGES_10PT_SCORE
       plus bas) — au round 1 les deux valent 0, donc personne n'est encore
       "mené", ce qui exclut naturellement ce round de la relance, exactement
       le symptôme du plan. Calculé une seule fois par round (pas par tick) :
       lire qui est mené ne change pas dans la seconde. ==== */
    const roundLaggingA=r>1 && (j1A+j2A+j3A)<(j1B+j2B+j3B-4), roundLaggingB=r>1 && (j1B+j2B+j3B)<(j1A+j2A+j3A-4);
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — recalculé une seule fois
       par round (jamais par tick : ni le round ni `a.adaptability`/
       `b.adaptability`, fixes pour tout le combat, ne changent entre deux
       ticks d'un même round) — voir closeStructuralGap() plus haut. Les
       trois axes physiques fixés une fois pour tout le combat (allonge,
       gabarit, garde — §10.3) referment leur désavantage round après round
       selon l'adaptabilité du combattant qu'ils pénalisent CE round-ci.
       `rEdgeStrikeAdj` couvre l'allonge en frappe à distance ET la taxe
       d'entrée en clinch (ANCRE P8_L8_ALLONGE_FERMETURE plus bas, même axe,
       même signe que rEdge) ; `rEdgeClinchAdj`/`bEdgeClinchAdj` couvrent
       l'allonge et le gabarit une fois AU clinch, où le signe de l'allonge
       s'inverse (ANCRE P8_L8_ALLONGE_CLINCH) — deux fermetures distinctes
       de la MÊME allonge selon le contexte, jamais la même variable
       réutilisée à tort d'un contexte à l'autre. ==== */
    const rEdgeStrikeAdj=closeStructuralGap(rEdge,r,a.adaptability,b.adaptability,ADAPT_CLOSURE_CAP_PHYSICAL);
    const rEdgeClinchAdj=closeStructuralGap(-rEdge,r,a.adaptability,b.adaptability,ADAPT_CLOSURE_CAP_PHYSICAL);
    const bEdgeClinchAdj=closeStructuralGap(bEdge,r,a.adaptability,b.adaptability,ADAPT_CLOSURE_CAP_PHYSICAL);
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L10_ADAPTABILITE_LOG] — Lot 10/P8 §10.4 : "le joueur
       doit pouvoir constater l'effet sans lire le code... une ligne de log
       au passage du round, du même registre que les autres beats, sans
       chiffre affiché". Un seul beat, au tout début du round (jamais un par
       tick), et seulement quand il y a réellement quelque chose à raconter :
       un axe physique (allonge ou garde — le gabarit reste volontairement
       hors de ce beat, son effet est trop discret pour mériter une ligne
       dédiée, cf. lot8-allonge-gabarit-garde.md §3.2) est en train de se
       refermer CE round-ci (donc jamais au round 1, par construction de
       closeStructuralGap) pour un combattant dont l'adaptabilité dépasse
       nettement la moyenne — un combattant moyen ne justifie pas une ligne à
       chaque round. Priorité à l'allonge (axe le plus lisible en jeu, §8.1)
       sur la garde. ==== */
    if(r>=2){
      const ADAPT_LOG_THRESHOLD=65;
      let adaptBeatName=null, adaptBeatText=null;
      const reachClosing=Math.abs(rEdge)-Math.abs(rEdgeStrikeAdj);
      if(reachClosing>0.15){
        if(rEdge>0 && b.adaptability>=ADAPT_LOG_THRESHOLD){ adaptBeatName=B.name; adaptBeatText=`${B.name} commence à trouver la bonne distance malgré l’allonge adverse.`; }
        else if(rEdge<0 && a.adaptability>=ADAPT_LOG_THRESHOLD){ adaptBeatName=A.name; adaptBeatText=`${A.name} commence à trouver la bonne distance malgré l’allonge adverse.`; }
      }
      if(!adaptBeatName && openStance){
        const stFootEdgeStart=clamp((a.footwork-b.footwork)*0.04,-1.2,1.2);
        const stFootEdgeStartAdj=closeStructuralGap(stFootEdgeStart,r,a.adaptability,b.adaptability,ADAPT_CLOSURE_CAP_PHYSICAL);
        const stanceClosing=Math.abs(stFootEdgeStart)-Math.abs(stFootEdgeStartAdj);
        if(stanceClosing>0.05){
          if(stFootEdgeStart>0 && b.adaptability>=ADAPT_LOG_THRESHOLD){ adaptBeatName=B.name; adaptBeatText=`${B.name} s’habitue peu à peu à la garde inversée d’en face.`; }
          else if(stFootEdgeStart<0 && a.adaptability>=ADAPT_LOG_THRESHOLD){ adaptBeatName=A.name; adaptBeatText=`${A.name} s’habitue peu à peu à la garde inversée d’en face.`; }
        }
      }
      if(adaptBeatText){
        log.push({r,phase:'debout',by:adaptBeatName===A.name?'me':'op',text:`[${formatTime(0)}] ${adaptBeatText}`,momentum,
          snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      }
    }
    /* ==== [FIN ANCRE] ==== */
    // ==== [ANCRE: HORLOGE_CONTINUE] — Lot P6/2026, remplace l'ancienne
    // découpe fixe en 6 micro-séquences de 50 secondes (ancre historique
    // MICRO_SEQUENCES) par une horloge continue de roundLen/dt=100 ticks
    // de dt=3s : t (secondes écoulées dans le round) est désormais la
    // SEULE source de vérité temporelle, plus aucun horodatage n'est
    // dérivé d'un index d'itération. La phase (debout/clinch/sol) persiste
    // d'un tick à l'autre DANS le même round, mais repart toujours de
    // 'debout' à la cloche — inchangé.
    // Rescaling : toute grandeur accumulée dans un compteur persistant
    // (points, dégâts, frappes, amenées, contrôle...) est multipliée par
    // (dt/50) au moment où elle rejoint ce compteur — jamais en dur,
    // toujours écrit dt/50, pour que le pas reste ajustable au seul
    // endroit ci-dessus (roundLen/dt). Les probabilités qui décident SI un
    // événement discret survient CE tick (tentative d'amenée, transition
    // de phase, KO/finition) sont elles aussi multipliées par (dt/50), pour
    // que leur taux réel par seconde reste inchangé malgré les ~17x plus
    // de ticks ; les probabilités "en cascade" évaluées SACHANT qu'un tel
    // événement vient de survenir (réussite d'amenée sachant une tentative,
    // arrêt de l'arbitre sachant un knockdown) ne le sont PAS : elles
    // décrivent une distribution conditionnelle liée aux attributs, pas un
    // taux temporel. Piège de l'arrondi : aucun Math.round/Math.floor ne
    // doit porter sur un compteur cumulatif À L'INTÉRIEUR de la boucle
    // (Math.round(gnp*0.4) vaudrait systématiquement 0 une fois ramené à
    // ~1/17e) — l'accumulation reste fractionnaire, l'arrondi n'intervient
    // qu'en figeant roundStats (fin de round) et res.stats (fin de combat).
    let currentPhase='debout', topIsA=false, groundPos=null;
    /* ==== [ANCRE: P8_L7_ARBITRE_RELANCE] — remis à zéro à chaque round : la
       position au sol elle-même repart toujours de zéro à la cloche
       (currentPhase='debout' ci-dessus, inchangé), donc l'horloge
       d'inactivité qui lui est associée n'a pas de sens au-delà d'un round.
       ==== */
    let groundInactivity=0;
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L7_CAGE_POSITION] — position du clinch courant (voir
       déclaration de CLINCH_POS plus haut), fixée à l'entrée en clinch,
       nulle hors clinch. ==== */
    let clinchPos=null;
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L7_ARBITRE_FAUTES] — retraits de point infligés PENDANT
       CE ROUND SEULEMENT (contrairement à foulPointsA/B, cumulatifs sur tout
       le combat) : c'est ce compteur qui est soustrait du score de CE round
       pour les trois juges (§7.1, "le retrait de point doit traverser la
       notation"), une seule fois, au moment où roundStats fige le round. ==== */
    let roundFoulPtsA=0, roundFoulPtsB=0;
    /* ==== [FIN ANCRE] ==== */
    const cardioFactorA=(a.cardio<60)?0.09:0.06, cardioFactorB=(b.cardio<60)?0.09:0.06;
    const roundPenalty=(r>=4)?1.3:1.0;
    for(let t=0;t<roundLen && !finish;t+=dt){
      // décalage aléatoire intra-tick : partagé par tous les horodatages
      // affichés ce tick (beats narratifs comme finitions), pour que les
      // instants montrés au joueur ne soient jamais des multiples de dt.
      const beatT=t+RI(0,dt-1);
      /* ==== [ANCRE: P8_L9_RYTHME_ROUND] — multiplicateur de rythme du tick
         courant (voir paceMultiplier() plus haut) — calculé une fois par
         tick, lu par le volume de frappe debout uniquement (ANCRE
         P8_L9_RYTHME_ROUND_APPLICATION plus bas), jamais par le sol/clinch
         (hors périmètre du §9.4, qui ne parle que du "rythme du round" au
         sens frappe, pas de la lutte). ==== */
      const paceA=paceMultiplier(t,roundLen,roundLaggingA), paceB=paceMultiplier(t,roundLen,roundLaggingB);
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: P7_L2_FENETRE_FINITION_DECAY] — la fenêtre de danger
         s'épuise avec le temps réel qui passe, quelle que soit la phase
         courante (un combattant sonné qui se fait clincher reste sonné) —
         voir déclaration de dangerA/dangerB plus haut. §2.3 : "le défenseur
         récupère en fonction de composure, heart, recovery et chin" — ces
         quatre attributs accélèrent la décroissance plutôt que d'agir sur un
         jet séparé, pour qu'un combattant solide sur ces plans traverse la
         tempête plus vite sans qu'un tirage chanceux isolé ne l'en sorte
         d'un coup. ==== */
      if(dangerA>0){ const surviveMultA=1+clamp(((a.composure||50)+(a.heart||50)+(a.recovery||50)+(a.chin||50)-200)/500,0,1.2); dangerA=Math.max(0,dangerA-dt*surviveMultA); }
      if(dangerB>0){ const surviveMultB=1+clamp(((b.composure||50)+(b.heart||50)+(b.recovery||50)+(b.chin||50)-200)/500,0,1.2); dangerB=Math.max(0,dangerB-dt*surviveMultB); }
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: P7_L2_DEGATS_PROGRESSIFS] — Lot 2/P7 §2.2 : les dégâts
         cumulés par zone rétroagissent désormais sur le combat, de façon
         PROGRESSIVE et continue (fonction de st.X.dmgLegs/dmgBody/dmgHead,
         jamais une marche binaire) plutôt que d'être de simples compteurs
         d'affichage : jambes -> mobilité + volume de kicks, et au-delà d'un
         second seuil, vulnérabilité aux amenées (tdd) ; corps -> cardio, qui
         accélère lui-même la fatigue (fatA/fatB juste en dessous la lisent
         déjà chaque tick) et réduit donc mécaniquement le volume de fin de
         combat sans code supplémentaire ; tête -> menton et sang-froid, qui
         rendent chaque coup lourd suivant plus dangereux (koA/koB plus bas
         lisent déjà chin) — la cascade de finitions décrite par le plan.
         Recalculé depuis la référence fixe (ANCRE ...BASELINE) à chaque
         tick : jamais de decay multiplicatif répété qui compounderait de
         façon incontrôlable sur tout un round. ==== */
      a.footwork=Math.max(10, baseFootworkA-clamp(st.A.dmgLegs-14,0,50)*0.55);
      b.footwork=Math.max(10, baseFootworkB-clamp(st.B.dmgLegs-14,0,50)*0.55);
      a.kick=Math.max(8, baseKickA-clamp(st.A.dmgLegs-10,0,55)*0.5);
      b.kick=Math.max(8, baseKickB-clamp(st.B.dmgLegs-10,0,55)*0.5);
      a.tdd=Math.max(8, baseTddA-clamp(st.A.dmgLegs-24,0,45)*0.45);
      b.tdd=Math.max(8, baseTddB-clamp(st.B.dmgLegs-24,0,45)*0.45);
      a.cardio=Math.max(12, baseCardioA-clamp(st.A.dmgBody-12,0,55)*0.5);
      b.cardio=Math.max(12, baseCardioB-clamp(st.B.dmgBody-12,0,55)*0.5);
      a.chin=Math.max(10, baseChinA-clamp(st.A.dmgHead-14,0,55)*0.5);
      b.chin=Math.max(10, baseChinB-clamp(st.B.dmgHead-14,0,55)*0.5);
      a.composure=Math.max(10, baseComposureA-clamp(st.A.dmgHead-14,0,55)*0.4);
      b.composure=Math.max(10, baseComposureB-clamp(st.B.dmgHead-14,0,55)*0.4);
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: P8_L9_BLESSURES] — Lot 9/P8 §9.2 : "dégrade une
         capacité précise... pas un malus global". Appliqué APRÈS la
         dégradation par dégâts cumulés ci-dessus (jamais en remplacement) :
         `power`/`takedown` ne sont recalculés QUE par ce bloc (aucune autre
         ANCRE ne les touche par tick, cf. captures basePowerA/baseTakedownA
         plus haut), `footwork`/`composure` reçoivent un multiplicateur
         SUPPLÉMENTAIRE en plus de leur propre dégradation par dégâts. Les
         trois multiplicateurs valent 1 tant qu'aucune blessure de ce type
         n'est survenue (immense majorité des combats) : comportement
         strictement inchangé dans ce cas, aucune régression possible sur
         les critères des lots précédents. ==== */
      a.power=Math.max(5, basePowerA*injHandMultA); b.power=Math.max(5, basePowerB*injHandMultB);
      a.takedown=Math.max(5, baseTakedownA*injKneeMultA); b.takedown=Math.max(5, baseTakedownB*injKneeMultB);
      a.footwork*=injKneeMultA; b.footwork*=injKneeMultB;
      a.composure*=injEyeMultA; b.composure*=injEyeMultB;
      /* ==== [FIN ANCRE] ==== */
      /* ==== [ANCRE: P7_L5_COUPE_DE_POIDS] — la résistance (`durability`)
         dégrade à partir du round 3, ce qui aggrave l'encaissement
         (chinFactor, ligne ~234, lit déjà durability comme un multiplicateur
         direct — un canal toujours actif, contrairement à celui choisi
         initialement pour le cardio, voir note ci-dessous). ==== */
      a.durability=Math.max(10, baseDurabilityA-cutSeverityA*Math.max(0,r-2)*6);
      b.durability=Math.max(10, baseDurabilityB-cutSeverityB*Math.max(0,r-2)*6);
      /* ==== [FIN ANCRE] ==== */
      const outA=st.A.sig+st.A.tdAtt*0.6, outB=st.B.sig+st.B.tdAtt*0.6;
      // Résistance à la fatigue via durabilité et second souffle (cœur)
      const heartResistA=(r>=3||dmgA>30)?clamp(((a.heart||50)-50)*0.003,-0.04,0.18):0;
      const durResistA=clamp(((a.durability||50)-50)*0.002,-0.04,0.14);
      const heartResistB=(r>=3||dmgB>30)?clamp(((b.heart||50)-50)*0.003,-0.04,0.18):0;
      const durResistB=clamp(((b.durability||50)-50)*0.002,-0.04,0.14);
      /* ==== [ANCRE: P7_L5_COUPE_DE_POIDS] — première tentative : router la
         coupe de poids par la MÊME référence fixe que le reste de cette
         ANCRE (baseCardioA-pénalité) échouait silencieusement — `fatA` est
         `clamp(...,0,28)` et son argument était déjà négatif (cardio de base
         très supérieur à dmgA+outA*0.2 tant que le combat reste d'intensité
         normale) dans la quasi-totalité des combats mesurés : une pénalité
         de cardio, même extrême (jusqu'à -24 testé), ne faisait alors JAMAIS
         franchir le seuil et restait invisible à `fatA`. Terme additif
         directement sur `fatA`/`fatB` à la place : garanti actif dès que
         `cutSeverity>0` et le round >=3, quelle que soit l'intensité du
         combat par ailleurs — jusqu'à 9 points sur les 28 possibles pour une
         coupe extrême au round 5, soit un peu moins d'un tiers de la
         fatigue maximale, jamais de quoi l'écraser à elle seule. ==== */
      const cutFatA=cutSeverityA*Math.max(0,r-2)*3, cutFatB=cutSeverityB*Math.max(0,r-2)*3;
      const fatA=clamp(((dmgA+outA*0.2)-a.cardio)*cardioFactorA*roundPenalty*(1-heartResistA-durResistA)+cutFatA,0,28);
      const fatB=clamp(((dmgB+outB*0.2)-b.cardio)*cardioFactorB*roundPenalty*(1-heartResistB-durResistB)+cutFatB,0,28);
      /* ==== [FIN ANCRE] ==== */

      if(currentPhase==='sol'){
        const top=topIsA?a:b, bot=topIsA?b:a, topF=topIsA?A:B, botF=topIsA?B:A, topFat=topIsA?fatA:fatB;
        const topProf=topIsA?profA:profB, botProf=topIsA?profB:profA;
        const stTop=topIsA?st.A:st.B, stBot=topIsA?st.B:st.A;
        /* ==== [ANCRE: P7_L3_SOL_POSITION] — Lot 3/P7 sec.3.1 : chaque grandeur
           qui ne dependait avant ce lot que de (topControl-guard) est
           desormais aussi mise a l'echelle par posProf (GROUND_POS[groundPos],
           voir declaration en tete de fichier) : controle, volume de GNP et
           intensite des deux menaces de soumission (dessus ET dessous, sec.3.1
           "le dessous n'est pas passif") dependent de la position REELLEMENT
           occupee, pas seulement de l'ecart d'attributs brut. groundPos est
           fixe a l'entree au sol (initialGroundPos(), takedown/clinch) et
           evolue via les transitions plus bas (ANCRE P7_L3_SOL_TRANSITIONS). ==== */
        /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — §10.3 "le cas échéant
           l'infériorité positionnelle au sol" : posProf brut est refermé
           pour le combattant du DESSOUS selon SA propre adaptabilité — voir
           adaptGroundDisadvantage() plus haut pour le choix d'un plafond
           réduit sur cet axe. ==== */
        const botAdaptForGround=topIsA?b.adaptability:a.adaptability;
        const posProf=adaptGroundDisadvantage(GROUND_POS[groundPos]||GROUND_POS.closedGuard,r,botAdaptForGround);
        /* ==== [FIN ANCRE] ==== */
        const control=clamp((top.topControl-bot.guard)*0.32,0,11)*0.2*posProf.ctrlMult;
        const gnp=clamp((top.ground*0.5+top.power*0.45)-bot.guard*0.55-topFat,0,45)*topProf.gnpDmg*0.2*posProf.gnpMult;
        const subTop=clamp(top.submission-bot.guard*0.85,0,45)*(1+top.killer*0.004)*topProf.subMod*0.2*posProf.topSubMult;
        const subBot=clamp(bot.submission-top.topControl*0.7-top.ground*0.4,0,35)*botProf.subMod*0.2*posProf.botSubMult;
        const topPts=1.2+control*0.5+gnp*0.46+subTop*0.22+(posProf.dominance-1)*0.5; const botPts=subBot*0.9+clamp(bot.guard-top.topControl,0,22)*0.032+0.6;
        const gHits=gnp*0.4;
        /* ==== [ANCRE: HORLOGE_CONTINUE_CTRLSEC] — beatGroundSec est la même
           heuristique qu'avant ce lot (une fraction du tick, jamais le tick
           entier : un contrôle au sol connaît des relances/scrambles même
           quand la phase persiste), simplement rescalée par (dt/50) comme
           tout le reste. `stTop.ctrlSec+=dt` (tout le tick) donnait un
           temps de contrôle ~3x trop élevé au Monte Carlo — confirmé en
           comparant tools/monte-carlo-combat.js avant/après ce lot. ==== */
        const beatGroundSec=clamp((22+clamp(top.topControl-bot.guard,-15,25)*0.35)*posProf.ctrlMult,10,55);
        /* ==== [ANCRE: P7_L2_USURE_SOL] — même principe qu'en phase debout
           (ANCRE P7_L2_USURE) : `groundWear` alimente à la fois le pool de
           fatigue (dmgA/dmgB, inchangé) et le pool de dégâts par zone
           (st.X.dmgHead/dmgBody/dmgLegs, cf. plus bas), réparti selon la
           MÊME proportion tête/corps que le Ground & Pound qui vient d'être
           porté (gHead/gBody), au lieu de l'ancien roll RI(0,2)/RI(0,1)
           totalement déconnecté. ==== */
        const groundWear=gnp*0.32*(dt/50);
        if(topIsA){sa+=topPts*(dt/50);sb+=botPts*(dt/50);dmgB+=groundWear;st.A.ctrl+=dt*(0.2/50);st.A.sig+=gHits*(dt/50);} else {sb+=topPts*(dt/50);sa+=botPts*(dt/50);dmgA+=groundWear;st.B.ctrl+=dt*(0.2/50);st.B.sig+=gHits*(dt/50);}
        stTop.ctrlSec+=beatGroundSec*(dt/50); stTop.groundCtrlSec+=beatGroundSec*(dt/50);
        // Enrichissement stats sol (frappes au sol, tentatives, temps de contrôle continu)
        const gAtt=gHits+Math.max(1,1+((top.aggression||50)-50)*0.03);
        stTop.sigAtt+=gAtt*(dt/50); stTop.groundStrikes+=gHits*(dt/50); stTop.groundAtt+=gAtt*(dt/50);
        const totGHits=gHits+Math.max(1,1+(top.gnp||50)*0.02);
        stTop.total+=totGHits*(dt/50); stTop.totalAtt+=(gAtt+2)*(dt/50);
        const gHead=gHits*0.75, gBody=gHits-gHead;
        stTop.sigHead+=gHead*(dt/50); stTop.headAtt+=(gAtt*0.75)*(dt/50);
        stTop.sigBody+=gBody*(dt/50); stTop.bodyAtt+=(gAtt*0.25)*(dt/50);
        if(gHits>=2 && (top.power||50)>60) stTop.powerStrikes+=(gHits*0.5)*(dt/50);
        /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — §9.1 "les coudes sont
           l'ouvreur principal de coupures et ne sont disponibles qu'au
           clinch et au sol" : une part du Ground & Pound (gHead, jamais le
           volume total gHits) est classée coude plutôt que poing au sol —
           c'est CE mécanisme de coupure existant (inchangé dans son seuil
           et sa probabilité) qui est désormais attribué à la bonne source. ==== */
        const elbowShareGround=clamp(0.30+((topProf.gnpDmg||1)-1)*0.15,0.15,0.55);
        const gElbow=gHead*elbowShareGround, gPunchGround=gHits-gElbow;
        stTop.byType.elbow+=gElbow*(dt/50); stTop.byType.groundPunch+=gPunchGround*(dt/50);
        if(gHits>=3 && (top.gnp||50)>70 && rnd()<0.2*(dt/50)){ stBot.cuts++; stBot.cutSrc.elbow++; tryEyeInjury(!topIsA,r,beatT,'sol',momentum); }
        /* ==== [FIN ANCRE] ==== */
        if(subTop>2.5) stTop.subAtt+=(dt/50);
        if(subBot>2.5) stBot.subAtt+=(dt/50);

        const heartR=1-(bot.heart*0.0016);
        const koGnp=clamp((top.power-bot.chin)/56,0,.72)*clamp(gnp/9,0,1)*0.62*(1-bot.fightIQ*0.0022)*heartR*topProf.koMod*0.40*posProf.gnpMult;
        /* ==== [ANCRE: P7_L3_SUBMISSION_DEFENSE] — Lot 3/P7 sec.3.2 : "elle se
           defend (flexibility, composure, strength)" -- submissionDefenseMult()
           applique cette defense a la CHANCE DE FINITION (subChT/subChB), pas
           a l'intensite d'attaque (subTop/subBot ci-dessus, qui pilote toujours
           subAtt) : un defenseur souple/calme/fort rend la finition plus dure
           sans changer combien de fois l'attaquant a reellement tente. ==== */
        const subChT=clamp((top.submission-bot.guard)/7,0,0.95)*0.68*(1-bot.fightIQ*0.0022)*topProf.subMod*0.4*subWeightMult*posProf.topSubMult*submissionDefenseMult(bot);
        const subChB=clamp((bot.submission-top.submission)/10,0,0.88)*0.44*(1-top.fightIQ*0.0022)*botProf.subMod*0.4*subWeightMult*posProf.botSubMult*submissionDefenseMult(top);
        /* ==== [FIN ANCRE] ==== */
        if(rnd()<subChT*(dt/50) && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'Soumission',round:r};(topIsA?st.A:st.B).sub++;}
        else if(rnd()<koGnp*(dt/50) && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'KO/TKO',round:r,detail:'coups au sol'};(topIsA?st.A:st.B).kd++; stBot.wobbled++;
          // cf. ANCRE P7_L2_COUP_FINITION (phase debout) : même garde-fou, un
          // KO au sol déclenché avant toute usure notable ne doit pas laisser
          // le perdant à 0 dégât arrondi.
          applyZoneDamage(stBot,clamp(gnp*0.32,3,8),gHead,gBody,0);
        }
        else if(rnd()<subChB*(dt/50) && !(immuneA&&topF===A)){finish={by:botF,loser:topF,method:'Soumission',round:r,detail:'par le bas'};(topIsA?st.B:st.A).sub++;}
        else {
          if(subChT>0.03) stBot.subEscapes+=(dt/50);
          if(subChB>0.03) stTop.subEscapes+=(dt/50);
          if(koGnp>0.15) stBot.wobbled+=(dt/50);
        }
        const isMe=topIsA; momentum=clamp(momentum+(isMe?RI(3,8):-RI(3,8)),5,95);
        const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB;
        applyZoneDamage(stBot,groundWear,gHead,gBody,0);
        /* ==== [FIN ANCRE] ==== */
        /* ==== [ANCRE: HORLOGE_CONTINUE_DENSITE_LOG] — avec 100 ticks/round au
           lieu de 6, journaliser chaque tick donnerait ~100 lignes/round
           (illisible, et ui-09-arena.js consomme ces beats pour son rythme
           d'animation). Les moments qui comptent (finition, tentative de
           soumission) sont toujours journalisés ; les échanges de routine
           sont échantillonnés à un taux qui, multiplié par le nombre de
           ticks du round, redonne un nombre de beats de routine quasi
           indépendant de dt (roundLen/dt * dt/90 = roundLen/90 ≈ 3,3),
           auquel s'ajoutent les moments notables ci-dessus pour retomber
           dans la fourchette visée de 4 à 8 beats/round — la densité
           narrative reste ainsi découplée de la fréquence de simulation. ==== */
        const solNotable=!!finish || subTop>2.5 || subBot>2.5;
        if(solNotable || rnd()<dt/90){
        let txtPool=[`${atk.name} consolide son contrôle.`,`${atk.name} maintient une lourde pression.`,`Lutte de position : ${atk.name} prend l\u2019avantage.`,`${atk.name} verrouille les hanches de son adversaire.`];
        if(tgs.includes('GNP')) txtPool.push(`${atk.name} fait pleuvoir un lourd Ground & Pound.`);
        if(tgs.includes('Soumission')) txtPool.push(`${atk.name} cherche l\u2019ouverture pour soumettre.`);
        if(posProf.dominance>=3){
          txtPool.push(`${atk.name} plie ${def.name} au sol comme un vulgaire origami. L\u2019écart technique est embarrassant.`);
        }
        if(groundPos==='backControl'){
          txtPool.push(`${atk.name} verrouille le dos, hameçons plantés : ${def.name} n\u2019a plus d\u2019issue.`);
        } else if(groundPos==='mount'){
          txtPool.push(`${atk.name} s\u2019installe en montée, la position la plus dominante du sol.`);
        }
        const botFat=topIsA?fatB:fatA;
        if(botFat>15 || bot.cardio<40){
          txtPool.push(`Écrasé sous le poids adverse, ${def.name} cherche de l\u2019oxygène qui n\u2019existe plus.`);
        }
        /* ==== [ANCRE: CORRECTIF_SUB_DANGER_MOTEUR] — voir ui-09 ==== */
        log.push({r,phase:'sol',top:topIsA?'A':'B',pos:groundPos,by:isMe?'me':'op',text:`[${formatTime(beatT)}] `+getUniqueLog(txtPool),momentum,sub:(subChT>0.03||subChB>0.03),snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
          finish.time=beatT;
          last.text=`[${formatTime(beatT)}] [CRITIQUE] L\u2019arbitre s\u2019interpose ! Victoire par ${finish.method} de ${finish.by.name}.`; }
        }
        /* ==== [ANCRE: HORLOGE_CONTINUE_CTRLSEC_SOL_RESIDU] — investigation
           post-lot (relecture Monte Carlo) : le temps de contrôle au sol
           ressort ~5-9% au-dessus de la valeur d'avant ce lot (le clinch,
           lui, ne bouge quasi pas : <2%). Racine trouvée par instrumentation
           directe (compteurs de ticks/entrées/sorties de phase, pas de
           conjecture) : un artefact de quantification de L'ANCIEN modèle à 6
           micro-séquences (une amenée réussie sur la toute dernière
           micro-séquence d'un round tombait à une position au sol de durée
           quasi nulle avant la cloche, ce qui tirait sa moyenne mesurée vers
           le bas) — la suite continue (dt=3s) n'a pas ce biais. Conservé en
           écart connu (rapport de livraison), plutôt que "corrigé" par un
           facteur artificiel qui réintroduirait ce biais de l'ancien modèle.
           Le mécanisme unique `evadeCh` référencé ici avant Lot 3/P7 est
           remplacé ci-dessous par le graphe de transitions par position (voir
           ANCRE P7_L3_SOL_TRANSITIONS) : ce commentaire historique reste pour
           la traçabilité de l'investigation, mais ne décrit plus le code qui
           suit. ==== */
        /* ==== [ANCRE: P7_L3_SOL_TRANSITIONS] — Lot 3/P7 sec.3.1 : remplace
           l'unique mécanisme `evadeCh` (un seul jet, moitié renversement/
           moitié relevé, quelle que soit la position — même chance de se
           relever depuis une montée que depuis une garde fermée) par un
           graphe de transitions propre à chaque position : passage de garde
           (groundPassChance), récupération d'une position moins défavorable
           (groundRecoverChance), renversement complet (groundSweepChance,
           uniquement depuis garde/demi-garde — sec.3.1 "garde fermée offre
           balayages"), relevé complet (groundStandupChance, uniquement si
           posProf.standupOk), prise de dos directe (groundBackTakeChance,
           depuis latéral/montée) et échappée du dos (groundBackEscapeChance,
           seule sortie possible depuis le contrôle du dos). Sec.3.2 : "une
           tentative ratée coûte souvent la position" — si aucune transition
           "normale" n'a eu lieu ce tick, un dessous engagé dans une vraie
           menace de soumission (subBot>2.5) risque de se faire progresser
           (garde passée pendant qu'il attaquait), et un dessus trop engagé
           dans sa propre tentative (subTop>2.5) risque de perdre du terrain. ==== */
        /* ==== [ANCRE: P8_L7_ARBITRE_RELANCE] — `transitioned` est hissé hors
           du `if(!finish)` ci-dessous (au lieu d'être déclaré dedans avec
           `let`) pour rester lisible par le contrôle d'inactivité de
           l'arbitre juste après ce bloc, y compris sur un tick où `finish`
           est déjà vrai (transitions sautées, `transitioned` reste false —
           un combat qui vient de se terminer n'a pas besoin d'être relancé
           debout). ==== */
        let transitioned=false;
        if(!finish){
          if(groundPos==='backControl'){
            if(rnd()<groundBackEscapeChance(top,bot)*(dt/50)){ groundPos='halfGuard'; stBot.reversals++; transitioned=true; }
          } else if(groundPos==='mount'){
            if(rnd()<groundBackTakeChance(top,bot)*(dt/50)){ groundPos='backControl'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundRecoverChance(top,bot)*(dt/50)){ groundPos='halfGuard'; stBot.reversals++; transitioned=true; }
          } else if(groundPos==='sideControl'){
            if(rnd()<groundBackTakeChance(top,bot)*0.6*(dt/50)){ groundPos='backControl'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundPassChance(top,bot)*(dt/50)){ groundPos='mount'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundRecoverChance(top,bot)*(dt/50)){ groundPos='halfGuard'; stBot.reversals++; transitioned=true; }
          } else if(groundPos==='halfGuard'){
            if(rnd()<groundPassChance(top,bot)*(dt/50)){ groundPos='sideControl'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundSweepChance(top,bot)*(dt/50)){ topIsA=!topIsA; stBot.reversals++; transitioned=true; }
            else if(rnd()<groundRecoverChance(top,bot)*(dt/50)){ groundPos='closedGuard'; stBot.reversals++; transitioned=true; }
          } else if(groundPos==='openGuard'){
            if(rnd()<groundPassChance(top,bot)*(dt/50)){ groundPos='halfGuard'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundSweepChance(top,bot)*(dt/50)){ topIsA=!topIsA; stBot.reversals++; transitioned=true; }
            else if(posProf.standupOk && rnd()<groundStandupChance(top,bot,topFat)*(dt/50)){ currentPhase='debout'; stBot.standups++; transitioned=true; }
            else if(rnd()<groundGuardCloseChance(bot)*(dt/50)){ groundPos='closedGuard'; transitioned=true; }
          } else { // closedGuard
            if(rnd()<groundPassChance(top,bot)*0.7*(dt/50)){ groundPos='halfGuard'; stTop.guardPasses++; transitioned=true; }
            else if(rnd()<groundSweepChance(top,bot)*(dt/50)){ topIsA=!topIsA; stBot.reversals++; transitioned=true; }
            else if(posProf.standupOk && rnd()<groundStandupChance(top,bot,topFat)*(dt/50)){ currentPhase='debout'; stBot.standups++; transitioned=true; }
            else if(rnd()<groundGuardOpenChance(bot)*(dt/50)){ groundPos='openGuard'; transitioned=true; }
          }
          if(!transitioned){
            const idx=GROUND_POS_ORDER.indexOf(groundPos);
            if(subBot>2.5 && idx<GROUND_POS_ORDER.length-1 && rnd()<0.05*(dt/50)){ groundPos=GROUND_POS_ORDER[idx+1]; stTop.guardPasses++; }
            else if(subTop>2.5 && idx>0 && rnd()<0.05*(dt/50)){ groundPos=GROUND_POS_ORDER[idx-1]; stBot.reversals++; }
          }
          /* ==== [ANCRE: P8_L9_BLESSURES] — §9.2 "genou lâché" : un scramble
             réel (`transitioned`, un changement de position vient de se
             produire CE tick) risque un genou, pour QUI QUE CE SOIT des deux
             combattants (un scramble met les deux à l'épreuve) — jamais lié
             à qui est dessus/dessous. ==== */
          if(transitioned){
            if(tryKneeInjury(true,r,beatT,'sol',momentum)){ finish={by:B,loser:A,method:'Blessure',round:r,detail:'genou lâché',time:beatT}; }
            else if(!finish && tryKneeInjury(false,r,beatT,'sol',momentum)){ finish={by:A,loser:B,method:'Blessure',round:r,detail:'genou lâché',time:beatT}; }
          }
          /* ==== [FIN ANCRE] ==== */
        }
        /* ==== [FIN ANCRE] ==== */
        /* ==== [ANCRE: P8_L7_ARBITRE_RELANCE] — §7.1 : relance debout sur
           inactivité, INDÉPENDANTE de posProf.standupOk (voir déclaration de
           REF_STANDUP_THRESHOLD plus haut) — c'est ce qui corrige la
           régression du Lot 3/P7 (sideControl/mount rentables : aucune
           sanction possible tant que le dessous ne se relève pas via
           groundStandupChance, qui n'existe même pas depuis ces positions).
           "Progression" = changement de position (transitioned, y compris
           un simple ajustement de garde), frappe significative au sol
           (gHits, seuil choisi au-dessus du bruit de fond du calcul de
           `gHits=gnp*0.4`) ou menace de soumission réelle des DEUX côtés
           (subTop/subBot>2.5, même seuil que celui qui déclenche déjà
           subAtt++ plus haut) — tant que l'une de ces trois conditions est
           vraie ce tick, l'horloge est remise à zéro plutôt qu'incrémentée. ==== */
        if(!finish && currentPhase==='sol'){
          if(transitioned || gHits>1.0 || subTop>2.5 || subBot>2.5){ groundInactivity=0; }
          else {
            groundInactivity+=dt;
            if(groundInactivity>=(REF_STANDUP_THRESHOLD[groundPos]||55)){
              currentPhase='debout'; groundInactivity=0; stBot.standups++; refStandupCount++;
              log.push({r,phase:'sol',top:topIsA?'A':'B',pos:groundPos,by:'me',
                text:`[${formatTime(beatT)}] L’arbitre relance les combattants debout : plus aucune progression au sol.`,
                momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
            }
          }
        }
        /* ==== [FIN ANCRE] ==== */
      } else if(currentPhase==='clinch'){
        /* ==== [ANCRE: P8_L7_CAGE_POSITION] — voir déclaration de CLINCH_POS
           plus haut : `cp` module le contrôle (ctrlMult), le volume de
           frappe (volMult) et la propension à nourrir une amenée (tdMult)
           de tout ce bloc, exactement comme `posProf` (GROUND_POS) module
           déjà la phase 'sol'. ==== */
        const cp=CLINCH_POS[clinchPos]||CLINCH_POS.center;
        /* ==== [ANCRE: P8_L8_ALLONGE_CLINCH] — Lot 8/P8 §8.1 : "l'avantage
           [d'allonge] s'inverse au clinch et au corps à corps, où l'allonge
           devient une gêne" — signe opposé à son usage en frappe à distance
           (ANCRE P8_L8_ALLONGE_ECHANGES ci-dessous, +rEdge*0.85 pour A) :
           ici -rEdge*0.45 pour A, un bras long gêne à cette distance plutôt
           qu'il n'aide. Le gabarit fait l'inverse (+bEdge*0.35 pour A) —
           un combattant plus grand/dense génère plus de force et se
           déséquilibre moins en corps à corps, cf. buildEdge (engine.js).
           Poids volontairement plus faibles qu'en frappe distance (0.85) :
           le clinch reste avant tout gouverné par clinch/striking/power,
           l'allonge/le gabarit n'y sont qu'un facteur secondaire. ==== */
        /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — rEdgeClinchAdj/
           bEdgeClinchAdj (calculés une fois par round plus haut) remplacent
           ici -rEdge*0.45/+bEdge*0.35 bruts : au round 1 (closure=0) les deux
           valent exactement -rEdge/bEdge, donc cette ligne reste identique à
           avant ce lot pour le tout premier round — seuls les rounds
           suivants voient le désavantage se refermer. ==== */
        const clinchA=(a.clinch*0.6+a.striking*0.25+a.power*0.15)*profA.clinchDmg-fatA+rEdgeClinchAdj*0.45+bEdgeClinchAdj*0.35;
        const clinchB=(b.clinch*0.6+b.striking*0.25+b.power*0.15)*profB.clinchDmg-fatB-rEdgeClinchAdj*0.45-bEdgeClinchAdj*0.35;
        /* ==== [FIN ANCRE] ==== */
        /* ==== [FIN ANCRE] ==== */
        const diff=clinchA-clinchB;
        if(Math.abs(diff)>8){
          const domIsA=diff>0; const dom=domIsA?A:B;
          const stDom=domIsA?st.A:st.B, stDef=domIsA?st.B:st.A;
          const hits=RI(0,4)*cp.volMult; (domIsA?st.A:st.B).sig+=hits*(dt/50);
          /* ==== [ANCRE: P7_L2_USURE_CLINCH] — même principe qu'en debout/sol
             (ANCRE P7_L2_USURE) : `clinchWear` alimente à la fois le pool de
             fatigue (dmgA/dmgB, inchangé) et le pool de dégâts par zone,
             réparti selon la MÊME proportion tête/corps que les coups en
             clinch qui viennent d'être portés (bodyHits/headHits, calculés
             juste en dessous avec le ratio 0.65/0.35 repris ici), au lieu de
             l'ancien roll RI(0,2) totalement déconnecté (et qui n'alimentait
             que dmgBody, jamais dmgHead). ==== */
          const clinchWear=hits*1.8*(dt/50);
          if(domIsA) dmgB+=clinchWear; else dmgA+=clinchWear;
          applyZoneDamage(domIsA?st.B:st.A,clinchWear,0.35,0.65,0);
          /* ==== [FIN ANCRE] ==== */
          // Frappes en clinch et contrôle
          const attHits=hits+RI(1,2);
          stDom.sigAtt+=attHits*(dt/50); stDom.clinchStrikes+=hits*(dt/50); stDom.clinchAtt+=attHits*(dt/50);
          stDom.total+=(hits+RI(1,2))*(dt/50); stDom.totalAtt+=(attHits+RI(2,3))*(dt/50);
          const bodyHits=hits*0.65, headHits=hits-bodyHits;
          stDom.sigBody+=bodyHits*(dt/50); stDom.bodyAtt+=(attHits*0.65)*(dt/50);
          stDom.sigHead+=headHits*(dt/50); stDom.headAtt+=(attHits*0.35)*(dt/50);
          if(hits>=2 && (domIsA?a.power:b.power)>65) stDom.powerStrikes+=(dt/50);
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — §9.1 "les genoux au
             corps sont l'arme du clinch" / "les coudes... disponibles au
             clinch et au sol" : une part de bodyHits/headHits (déjà décidés
             ci-dessus, montant inchangé) est classée genou/coude plutôt que
             poing générique, pondérée par clinchDmg du profil dominant
             (STYLE_PROFILE — muay-thaï/lutte, historiquement clinch-heavy,
             en reçoivent naturellement plus, sans second sac de bonus). Un
             coude qui touche à cette distance ouvre une coupure nettement
             plus souvent qu'un poing (STRIKE_CUT_MULT.elbow), §9.1 "les
             coudes sont l'ouvreur principal de coupures". ==== */
          const profDom=domIsA?profA:profB;
          const kneeShareClinch=clamp(0.32*profDom.clinchDmg,0.12,0.55), elbowShareClinch=clamp(0.16*profDom.clinchDmg,0.06,0.36);
          const kneeHits=bodyHits*kneeShareClinch, elbowHits=headHits*elbowShareClinch;
          stDom.byType.knee+=kneeHits*(dt/50); stDom.byType.hook+=(bodyHits-kneeHits+headHits-elbowHits)*(dt/50); stDom.byType.elbow+=elbowHits*(dt/50);
          if(elbowHits>0.15 && rnd()<0.085*STRIKE_CUT_MULT.elbow*(dt/50)){ stDef.cuts++; stDef.cutSrc.elbow++; tryEyeInjury(!domIsA,r,beatT,'clinch',momentum); }
          /* ==== [FIN ANCRE] ==== */
          const clSec=clamp(14+Math.abs(diff)*0.25,10,32)*cp.ctrlMult;
          stDom.ctrl+=dt*(0.1/50); stDom.ctrlSec+=clSec*(dt/50); stDom.clinchCtrlSec+=clSec*(dt/50);
          momentum=clamp(momentum+(domIsA?RI(3,7):-RI(3,7)),5,95);
          /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — §4.1 "propension au
             grappling... doit devenir une décision contextuelle" : la
             décision d'amener au sol depuis le clinch dépend désormais de
             la propension au grappling RÉELLE du dominant du clinch
             (giA/giB, déjà utilisés pour les tentatives d'amenée debout),
             au lieu d'un taux fixe identique pour un boxeur et un lutteur
             qui domineraient tous deux le clinch. ==== */
          /* ==== [ANCRE: P8_L7_CAGE_POSITION] — §7.2 "porte d'entrée
             naturelle des amenées" : `cp.tdMult` (1.30 contre la cage, 0.80
             au centre) est le levier qui rend ça vrai — une amenée sortie
             du clinch de cage est nettement plus probable qu'une amenée
             sortie d'un clinch de centre, à propension au grappling égale. ==== */
          const clinchGroundChance=clamp(0.28*(0.55+(domIsA?giA:giB)*1.15)*cp.tdMult,0.06,0.65);
          if(rnd()<clinchGroundChance*(dt/50)){ currentPhase='sol'; topIsA=domIsA; groundPos=initialGroundPos(domIsA?a:b,domIsA?b:a); groundInactivity=0; (domIsA?st.A:st.B).td++; stDom.tdAtt++;
            log.push({r,phase:'clinch',pos:clinchPos,by:domIsA?'me':'op',text:`[${formatTime(beatT)}] ${dom.name} utilise son contrôle en clinch pour amener au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            if(rnd()<0.35*(dt/50)){ stDom.tdAtt++; stDef.tdDef++; }
            /* ==== [ANCRE: P8_L7_CAGE_TRANSITIONS] — §7.2 "son propre profil
               de... transitions" : le dominant pousse plus souvent vers la
               cage (0.18/tick) que le dessous ne s'en dégage vers le centre
               (0.10/tick) — cohérent avec le MMA réel, où un clinch fini
               généralement contre le grillage plutôt qu'au centre. ==== */
            if(clinchPos==='center'){ if(rnd()<0.18*(dt/50)) clinchPos='cage'; }
            else { if(rnd()<0.10*(dt/50)) clinchPos='center'; }
            /* ==== [FIN ANCRE] ==== */
            if(rnd()<dt/90){
            /* ==== [ANCRE: P8_L7_CAGE_POSITION] — "le clinch au centre et le
               clinch contre la cage ne sont pas la même chose" : deux pools
               de texte distincts plutôt qu'un seul générique déjà orienté
               cage (l'ancien pool ne parlait QUE de grillage/cage, même
               quand rien ne le justifiait mécaniquement avant ce lot). ==== */
            const clinchTxt=getUniqueLog(clinchPos==='cage'?[
              `${dom.name} étouffe son adversaire contre le grillage.`,
              `Lutte rugueuse le long de la cage à l’avantage de ${dom.name}.`,
              `${dom.name} pèse de tout son poids et écrase son adversaire contre la cage.`,
              `Plaqué contre le grillage, l’adversaire de ${dom.name} cherche une échappatoire.`,
              `${dom.name} domine contre la cage avec ${Math.round(hits)} coups courts.`
            ]:[
              `${dom.name} contrôle le clinch au centre de l’octogone.`,
              `Lutte debout au centre, à l’avantage net de ${dom.name}.`,
              `${dom.name} place de petits coups vicieux au centre de la cage.`,
              `Le clinch s’éternise au centre, ${dom.name} grignote l’énergie adverse.`
            ]);
            log.push({r,phase:'clinch',pos:clinchPos,by:domIsA?'me':'op',text:`[${formatTime(beatT)}] ${clinchTxt}`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
            }
          }
        } else {
          currentPhase='debout'; clinchPos=null;
          log.push({r,phase:'clinch',by:'me',text:`[${formatTime(beatT)}] Séparation, le combat reprend au centre de la cage.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else { // debout
        /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — §4.1 : la propension au
           grappling (attA/attB, dérivée de STYLES[].grap comme avant ce
           lot) devient CONTEXTUELLE — contextualGrapplingMult() la module
           selon le score courant (sa/sb) et les dégâts déjà encaissés
           (dmgA/dmgB) ou la fenêtre de danger (dangerA/dangerB), tous déjà
           en portée dans cette boucle. ==== */
        const attA=giA*(0.55+rnd()*0.45)*contextualGrapplingMult(policyA,sa,sb,dmgA,dangerA),
              attB=giB*(0.55+rnd()*0.45)*contextualGrapplingMult(policyB,sb,sa,dmgB,dangerB);
        /* ==== [FIN ANCRE] ==== */
        let handled=false;
        /* ==== [ANCRE: HORLOGE_CONTINUE_TD_ATTEMPT_GATE] — bug trouvé pendant
           la validation Monte Carlo de ce lot : `rnd()<0.18*(dt/50)` faisait
           chuter la fraction de ticks « occupés » par une tentative
           d'amenée de ~20% (ancien moteur, mesuré) à ~1,3% (nouveau), ce
           qui livrait mécaniquement ~24% de ticks de frappe debout en plus
           à la branche striking — largement suffisant pour expliquer le
           dépassement de +18-19% observé sur les frappes significatives. Le
           partage de temps striking/lutte debout (`handled` vs frappe) est
           une fraction du round, PAS un compteur cumulatif : elle ne doit
           donc PAS être rescalée par (dt/50), sous peine de redistribuer
           les probabilités de tout le moteur (contraire à la consigne du
           lot). Le taux réel de TENTATIVES reste donc celui d'origine
           (0.18, inchangé), et c'est la réussite SACHANT une tentative qui
           est rescalée (dt/50) pour que le taux d'amenées RÉUSSIES par
           seconde — et donc le temps réellement passé au sol — reste
           inchangé malgré des tentatives ~17x plus nombreuses en compte
           brut. tdAtt/tdDef (comptes purs, jamais lus par seuil ailleurs)
           accumulent alors en valeur fractionnaire comme tout compteur de
           ce lot ; td (succès) reste un simple ++, sa fréquence étant déjà
           correctement rescalée par la réussite. Une tentative RATÉE est
           encore ~17x plus fréquente en compte brut qu'avant : elle
           n'est donc journalisée qu'en échantillon (densité de routine),
           jamais systématiquement — une réussite (rare, notable) reste
           toujours journalisée. ==== */
        if(attA>0.14 && rnd()<0.18){ st.A.tdAtt+=(dt/50); handled=true;
          /* ==== [ANCRE: P7_L4_TAKEDOWN_NON_LINEAIRE] — §4.2, remplace
             sigmoid((...)/15) telle quelle par takedownSigmoidSteep(),
             plafond relevé 0.85->0.95 (sinon un écart devenu "quasi
             certain" par la steepening restait artificiellement bridé). ==== */
          const tdChanceA=takedownSigmoidSteep(a.takedown-b.tdd)*attA;
          if(rnd()<clamp(tdChanceA,0.05,0.95)*(dt/50)){ st.A.td++; currentPhase='sol'; topIsA=true; groundPos=initialGroundPos(a,b); groundInactivity=0;
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(beatT)}] Takedown validé par ${A.name} !`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            st.B.tdDef+=(dt/50);
            if(rnd()<dt/90) log.push({r,phase:'debout',by:'op',text:`[${formatTime(beatT)}] Bonne défense de ${B.name} sur la tentative d’amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else if(attB>0.14 && rnd()<0.18){ st.B.tdAtt+=(dt/50); handled=true;
          /* ==== [ANCRE: P7_L4_TAKEDOWN_NON_LINEAIRE] — voir ci-dessus, côté B. ==== */
          const tdChanceB=takedownSigmoidSteep(b.takedown-a.tdd)*attB;
          if(rnd()<clamp(tdChanceB,0.05,0.95)*(dt/50)){ st.B.td++; currentPhase='sol'; topIsA=false; groundPos=initialGroundPos(b,a); groundInactivity=0;
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(beatT)}] Takedown explosif de ${B.name}, le combat passe au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            st.A.tdDef+=(dt/50);
            if(rnd()<dt/90) log.push({r,phase:'debout',by:'me',text:`[${formatTime(beatT)}] ${A.name} repousse une tentative d’amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        }
        if(!handled && currentPhase==='debout'){
          /* ==== [ANCRE: P8_L8_ALLONGE_ECHANGES] — Lot 8/P8 §8.1 : "celui qui
             a l'allonge touche plus souvent à distance longue et se fait
             toucher moins". rEdge*0.85 existait déjà ici avant ce lot (offA
             gagne quand A a l'allonge, offB perd symétriquement) : c'est le
             seul point de l'addendum où reachEdge() était déjà branché dans
             la frappe elle-même — l'état des lieux du plan sous-estimait cet
             appel en ne comptant que les CALLS de reachEdge() (500 et le
             départage final), pas la variable rEdge qu'ils alimentent. Ce
             lot en fait le pivot d'une vraie mécanique : inversion en clinch
             (ANCRE P8_L8_ALLONGE_CLINCH), coût de fermeture de distance
             (ANCRE P8_L8_ALLONGE_FERMETURE, transition vers le clinch plus
             bas) et garde ouverte (ANCRE P8_L8_GARDE_STANCE ci-dessous)
             s'ajoutent à cette base inchangée. ==== */
          /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — rEdgeStrikeAdj
             (calculé une fois par round plus haut) remplace ici rEdge brut :
             au round 1 (closure=0) il vaut exactement rEdge, comportement
             inchangé ; les rounds suivants referment partiellement l'écart
             pour le combattant qu'il désavantage, selon son adaptabilité. ==== */
          let offA=(a.striking*0.72+a.power*0.35+a.handSpeed*0.22+a.footwork*0.14+a.clinch*0.14*profA.clinchDmg+rEdgeStrikeAdj*0.85-b.footwork*0.2-b.fightIQ*0.14-fatA)*profA.sigVol;
          let offB=(b.striking*0.72+b.power*0.35+b.handSpeed*0.22+b.footwork*0.14+b.clinch*0.14*profB.clinchDmg-rEdgeStrikeAdj*0.85-a.footwork*0.2-a.fightIQ*0.14-fatB)*profB.sigVol;
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: P8_L8_GARDE_STANCE] — Lot 8/P8 §8.2 : "un
             affrontement de gardes opposées change la géométrie... avantage
             au pied avant". Actif UNIQUEMENT quand openStance est vrai
             (gardes différentes, cf. déclaration en tête de simulateFight) :
             un petit swing (borné ±1.2) en faveur de celui des deux dont le
             footwork est meilleur — modélise le contrôle de l'angle extérieur
             par le pied avant, sans introduire de nouvel attribut (footwork
             existe déjà). Nul par construction sur un affrontement de gardes
             identiques (l'écrasante majorité des combats), donc sans effet
             sur la matrice 8x8 existante. ==== */
          if(openStance){
            /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — troisième axe
               physique (§10.3, garde) : recalculé par TICK (contrairement à
               rEdgeStrikeAdj/bEdgeClinchAdj plus haut) car footwork lui-même
               varie par tick (dégâts aux jambes, blessure au genou — ANCREs
               P7_L2_DEGATS_PROGRESSIFS/P8_L9_BLESSURES) ; seuls le round et
               l'adaptabilité, eux fixes pour tout le combat, gouvernent la
               fermeture — closeStructuralGap() reste néanmoins bon marché
               (aucun état, aucun tirage). ==== */
            const stFootEdgeRaw=clamp((a.footwork-b.footwork)*0.04,-1.2,1.2);
            const stFootEdge=closeStructuralGap(stFootEdgeRaw,r,a.adaptability,b.adaptability,ADAPT_CLOSURE_CAP_PHYSICAL);
            offA+=stFootEdge; offB-=stFootEdge;
            /* ==== [FIN ANCRE] ==== */
          }
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — §4.1 : "initiative"
             (mener/contrer) et "rythme" (volume/salves) modulent le volume
             de frappe indépendamment de la fenêtre de danger ci-dessous —
             effet permanent de la politique de combat, pas seulement en
             situation de danger/domination. "réaction quand il est en
             danger" (reculer/répondre) est appliquée séparément ici même,
             sur le volume PROPRE du combattant qui traverse SA fenêtre de
             danger (dangerA/dangerB), à distinguer de dangerBoostA/B
             ci-dessous qui récompense l'ADVERSAIRE qui en profite. ==== */
          offA*=initiativeMult(policyA,a.aggression,b.aggression)*burstFactor(policyA,t,0)*dangerReactionOffenseMult(policyA,dangerA>0);
          offB*=initiativeMult(policyB,b.aggression,a.aggression)*burstFactor(policyB,t,9)*dangerReactionOffenseMult(policyB,dangerB>0);
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: P7_L2_FENETRE_FINITION_VOLUME] — Lot 2/P7 §2.3 :
             "l'attaquant augmente son volume en fonction de killer et
             d'aggression" pendant que son adversaire traverse une fenêtre de
             danger (dangerA/dangerB, cf. déclaration plus haut). Multiplie
             offA/offB en place plutôt que d'introduire des variables offAEff/
             offBEff : chaque usage en aval (points juges, KO, log, dégâts)
             profite ainsi de la même valeur boostée, sans devoir être
             réécrit un par un. ==== */
          /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — §4.1 "réaction quand
             il domine" : dominanceReactionMult() amplifie (finition) ou
             atténue (gestion) ce boost — multiplie le terme variable
             (clamp(...)), jamais la base 1 hors fenêtre de danger, pour
             rester strictement neutre quand l'adversaire n'est pas en
             danger (comportement inchangé hors domination réelle). ==== */
          const dangerBoostA=dangerB>0?(1+clamp(((a.killer||50)+(a.aggression||50)-100)/140,0,0.55)*dominanceReactionMult(policyA)):1;
          const dangerBoostB=dangerA>0?(1+clamp(((b.killer||50)+(b.aggression||50)-100)/140,0,0.55)*dominanceReactionMult(policyB)):1;
          /* ==== [FIN ANCRE] ==== */
          offA*=dangerBoostA; offB*=dangerBoostB;
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: P8_L9_RYTHME_ROUND_APPLICATION] — §9.4 : seul point
             d'application de paceA/paceB (voir paceMultiplier() et son
             calcul par tick plus haut) — après tous les multiplicateurs de
             politique de combat/fenêtre de danger ci-dessus, sur le volume
             final avant bruit, pour que la redistribution temporelle
             s'applique de façon identique quel que soit le contexte tactique
             du tick. ==== */
          offA*=paceA; offB*=paceB;
          /* ==== [FIN ANCRE] ==== */
          const noiseAmt=Math.round(6*noiseWeightMult);
          const pA=clamp(offA*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20), pB=clamp(offB*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20);
          sa+=pA*(dt/50);sb+=pB*(dt/50);
          const landedA=clamp(pA*0.5,0,10);
          const landedB=clamp(pB*0.5,0,10);
          st.A.sig+=landedA*(dt/50); st.B.sig+=landedB*(dt/50);
          /* ==== [ANCRE: P8_L9_RYTHME_ROUND] — "part des frappes
             significatives dans les trente dernières secondes de round"
             (critère d'acceptation §9) : compteur dédié, purement additif,
             pour que le harnais Monte Carlo puisse la mesurer directement
             sans reparser le log narratif. ==== */
          if(t>roundLen-30){ st.A.lateSig+=landedA*(dt/50); st.B.lateSig+=landedB*(dt/50); }
          /* ==== [FIN ANCRE] ==== */

          // Tentatives et frappes debout pour A
          const accRateA=clamp(0.42+((a.handSpeed||50)*0.08+(a.discipline||50)*0.06-(b.footSpeed||50)*0.10-(b.footwork||50)*0.06)*0.003,0.30,0.65);
          const attA=Math.max(landedA,landedA/accRateA+((a.aggression||50)>60?RI(1,3):RI(0,1)));
          st.A.sigAtt+=attA*(dt/50); st.A.distStrikes+=landedA*(dt/50); st.A.distAtt+=attA*(dt/50);
          st.A.total+=(landedA+RI(1,3))*(dt/50); st.A.totalAtt+=(attA+RI(2,4))*(dt/50);
          /* ==== [ANCRE: P8_L8_GARDE_STANCE] — §8.2 "low kick extérieur plus
             disponible" en garde ouverte : la jambe avant exposée d'un
             gaucher face à un orthodoxe (et inversement) rend le low kick
             extérieur structurellement plus accessible — traduit ici par un
             ratio de coups de pied relevé de 15% quand openStance est vrai,
             plafonné comme avant (0.10-0.45) pour ne pas dépasser la borne
             existante ailleurs dans le moteur. ==== */
          const kickRatioA=clamp(((a.kick||50)/150)*0.45*(openStance?1.15:1),0.10,0.45);
          const legA=landedA*kickRatioA*0.7;
          const bodyA=landedA*(0.22+((a.hook||50)>65?0.08:0));
          const headA=Math.max(0,landedA-legA-bodyA);
          st.A.sigHead+=headA*(dt/50); st.A.headAtt+=(attA*0.60)*(dt/50);
          st.A.sigBody+=bodyA*(dt/50); st.A.bodyAtt+=(attA*0.22)*(dt/50);
          st.A.sigLeg+=legA*(dt/50); st.A.legAtt+=(attA*0.18)*(dt/50);
          const pwrPctA=clamp(((a.power||50)*0.5+(a.cross||50)*0.25+(a.hook||50)*0.25)/100,0.15,0.65);
          st.A.powerStrikes+=(landedA*pwrPctA)*(dt/50);
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — classification par type
             des montants de zone headA/bodyA/legA CI-DESSUS, inchangés
             (standingStrikeMix() ne fait que répartir ce qui est déjà
             décidé, cf. sa déclaration en tête de fichier). ==== */
          const mixHeadA=standingStrikeMix(a,'head'), mixBodyA=standingStrikeMix(a,'body');
          for(const k in mixHeadA) st.A.byType[k]+=headA*mixHeadA[k]*(dt/50);
          for(const k in mixBodyA) st.A.byType[k]+=bodyA*mixBodyA[k]*(dt/50);
          st.A.byType.legKick+=legA*(dt/50);
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — un high kick qui touche
             franchement peut ouvrir une coupure au tibia/à l'arcade, un
             mécanisme réel mais additif (jamais à la place du check cross/
             hook existant juste plus bas) — utilise STRIKE_CUT_MULT.headKick
             plutôt qu'une constante isolée, pour que la table déclarée en
             tête de fichier gouverne réellement un comportement. Classé
             "coup lourd" dans le rapport (§9.1 : les trois sources listées
             sont coude/choc de tête/coup lourd, un kick lourd relève de ce
             dernier registre). ==== */
          const headKickAmtA=headA*mixHeadA.headKick;
          if(headKickAmtA>1.5 && rnd()<0.05*STRIKE_CUT_MULT.headKick*(dt/50)){ st.B.cuts++; st.B.cutSrc.heavy++; tryEyeInjury(false,r,beatT,'debout',momentum); }
          /* ==== [FIN ANCRE] ==== */

          // Tentatives et frappes debout pour B
          const accRateB=clamp(0.42+((b.handSpeed||50)*0.08+(b.discipline||50)*0.06-(a.footSpeed||50)*0.10-(a.footwork||50)*0.06)*0.003,0.30,0.65);
          const attB=Math.max(landedB,landedB/accRateB+((b.aggression||50)>60?RI(1,3):RI(0,1)));
          st.B.sigAtt+=attB*(dt/50); st.B.distStrikes+=landedB*(dt/50); st.B.distAtt+=attB*(dt/50);
          st.B.total+=(landedB+RI(1,3))*(dt/50); st.B.totalAtt+=(attB+RI(2,4))*(dt/50);
          /* ==== [ANCRE: P8_L8_GARDE_STANCE] — symétrique de kickRatioA
             ci-dessus, côté B. ==== */
          const kickRatioB=clamp(((b.kick||50)/150)*0.45*(openStance?1.15:1),0.10,0.45);
          const legB=landedB*kickRatioB*0.7;
          const bodyB=landedB*(0.22+((b.hook||50)>65?0.08:0));
          const headB=Math.max(0,landedB-legB-bodyB);
          st.B.sigHead+=headB*(dt/50); st.B.headAtt+=(attB*0.60)*(dt/50);
          st.B.sigBody+=bodyB*(dt/50); st.B.bodyAtt+=(attB*0.22)*(dt/50);
          st.B.sigLeg+=legB*(dt/50); st.B.legAtt+=(attB*0.18)*(dt/50);
          const pwrPctB=clamp(((b.power||50)*0.5+(b.cross||50)*0.25+(b.hook||50)*0.25)/100,0.15,0.65);
          st.B.powerStrikes+=(landedB*pwrPctB)*(dt/50);
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — symétrique côté B. ==== */
          const mixHeadB=standingStrikeMix(b,'head'), mixBodyB=standingStrikeMix(b,'body');
          for(const k in mixHeadB) st.B.byType[k]+=headB*mixHeadB[k]*(dt/50);
          for(const k in mixBodyB) st.B.byType[k]+=bodyB*mixBodyB[k]*(dt/50);
          st.B.byType.legKick+=legB*(dt/50);
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — symétrique côté B, voir
             le commentaire complet côté A ci-dessus. ==== */
          const headKickAmtB=headB*mixHeadB.headKick;
          if(headKickAmtB>1.5 && rnd()<0.05*STRIKE_CUT_MULT.headKick*(dt/50)){ st.A.cuts++; st.A.cutSrc.heavy++; tryEyeInjury(true,r,beatT,'debout',momentum); }
          /* ==== [FIN ANCRE] ==== */

          /* ==== [ANCRE: P7_L2_USURE] — composante "usure" (§2.1) : fond
             continu, faible amplitude, réparti selon la MÊME zone que la
             frappe qui vient d'être portée (headX/bodyX/legX ci-dessus),
             au lieu de l'ancien roll uniforme déconnecté (voir ANCRE
             P7_L2_DEGATS_USURE_COUPS_LOURDS pour le détail). dmgA/dmgB
             (pool de fatigue) et st.X.dmgHead/dmgBody/dmgLegs (pool de
             dégâts par zone, jamais remis à zéro par la cloche, §2.5)
             reçoivent le même montant — un seul mécanisme, deux lectures. ==== */
          const wearOnA=landedB*WEAR_PER_LANDED*(dt/50), wearOnB=landedA*WEAR_PER_LANDED*(dt/50);
          dmgA+=wearOnA; dmgB+=wearOnB;
          applyZoneDamage(st.A,wearOnA,headB,bodyB,legB);
          applyZoneDamage(st.B,wearOnB,headA,bodyA,legA);
          /* ==== [FIN ANCRE] ==== */

          // Impact des dégâts reçus (altération des déplacements, cf. ANCRE
          // P7_L2_DEGATS_PROGRESSIFS en tête de boucle pour la mobilité/
          // cardio/menton — recalculés chaque tick, pas ici)
          /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — ce mécanisme est basé sur
             cross/hook (des poings puissants), pas des coudes : classé dans
             le bucket "coups lourds" du rapport §9.1, pas "coudes" (les
             coudes sont indisponibles à distance, cf. standingStrikeMix()). ==== */
          if(headA>=3 && ((a.cross||50)>75||(a.hook||50)>75) && rnd()<0.2*(dt/50)){ st.B.cuts++; st.B.cutSrc.heavy++; tryEyeInjury(false,r,beatT,'debout',momentum); }
          if(headB>=3 && ((b.cross||50)>75||(b.hook||50)>75) && rnd()<0.2*(dt/50)){ st.A.cuts++; st.A.cutSrc.heavy++; tryEyeInjury(true,r,beatT,'debout',momentum); }
          /* ==== [FIN ANCRE] ==== */
          if(pA>=8 && rnd()<0.25*(dt/50)){ st.B.wobbled++; dangerB=Math.max(dangerB,DANGER_TICKS_WOBBLE); }
          if(pB>=8 && rnd()<0.25*(dt/50)){ st.A.wobbled++; dangerA=Math.max(dangerA,DANGER_TICKS_WOBBLE); }

          /* ==== [ANCRE: P7_L2_COUP_LOURD] — composante "coup lourd" (§2.1) :
             événement rare et indépendant de pA/pB (les points juges), à
             amplitude à queue épaisse (heavyShotAmplitude), dont la
             fréquence dépend de l'attaquant (power/cross/hook/killer/
             handSpeed, cf. heavyShotChance) et de la vulnérabilité du
             défenseur (fatigue courante, déjà en pleine fenêtre de danger).
             Un coup lourd qui sonne (amplitude >= HEAVY_WOBBLE_AMP) ouvre à
             son tour une fenêtre de danger — cf. §2.3 — et peut aggraver une
             coupure déjà ouverte (§2.4). ==== */
          let heavyLandedThisTick=false;
          if(rnd()<heavyShotChance(a,fatB,dangerB>0)*(dt/50)){
            const amp=heavyShotAmplitude(a,b);
            dmgB+=amp; applyZoneDamage(st.B,amp,headA*1.4+0.6,bodyA+0.4,legA*0.4); heavyLandedThisTick=true;
            if(amp>=HEAVY_WOBBLE_AMP){ st.B.wobbled++; dangerB=Math.max(dangerB,DANGER_TICKS_HEAVY); if(rnd()<0.12){ st.B.cuts++; st.B.cutSrc.heavy++; tryEyeInjury(false,r,beatT,'debout',momentum); } }
            /* ==== [ANCRE: P8_L9_BLESSURES] — un coup lourd de CET ordre de
               grandeur (amp>=INJURY_HAND_AMP_THRESHOLD, bien au-dessus du
               seuil "sonné") risque la main de son AUTEUR (A ici), jamais
               celle de sa cible — §9.2. ==== */
            if(!finish && tryHandFracture(true,amp,r,beatT,'debout',momentum)){ finish={by:B,loser:A,method:'Blessure',round:r,detail:'main cassée',time:beatT}; }
            /* ==== [FIN ANCRE] ==== */
          }
          if(!finish && rnd()<heavyShotChance(b,fatA,dangerA>0)*(dt/50)){
            const amp=heavyShotAmplitude(b,a);
            dmgA+=amp; applyZoneDamage(st.A,amp,headB*1.4+0.6,bodyB+0.4,legB*0.4); heavyLandedThisTick=true;
            if(amp>=HEAVY_WOBBLE_AMP){ st.A.wobbled++; dangerA=Math.max(dangerA,DANGER_TICKS_HEAVY); if(rnd()<0.12){ st.A.cuts++; st.A.cutSrc.heavy++; tryEyeInjury(true,r,beatT,'debout',momentum); } }
            /* ==== [ANCRE: P8_L9_BLESSURES] — symétrique côté B (attaquant). ==== */
            if(!finish && tryHandFracture(false,amp,r,beatT,'debout',momentum)){ finish={by:A,loser:B,method:'Blessure',round:r,detail:'main cassée',time:beatT}; }
            /* ==== [FIN ANCRE] ==== */
          }
          /* ==== [FIN ANCRE] ==== */

          /* ==== [ANCRE: P7_L2_ARRET_MEDICAL] — Lot 2/P7 §2.4 : `cuts`
             existait déjà comme COMPTEUR (incrémenté ci-dessus) mais n'était
             jamais exploité. Une coupure devient sévère à partir de
             CUT_SEVERE_THRESHOLD ouvertures ; chaque tick suivant où le
             combattant coupé continue d'encaisser du volume à la tête peut
             déclencher un arrêt médical — méthode de victoire DISTINCTE du
             KO/TKO (voir engine.js, isKOMethod). ==== */
          if(st.B.cuts>=CUT_SEVERE_THRESHOLD && headA>0.5){
            const medStopChance=clamp((st.B.cuts-CUT_SEVERE_THRESHOLD+1)*0.05*headA,0,0.35)*(dt/50);
            if(rnd()<medStopChance){ finish={by:A,loser:B,method:'Arrêt médical',round:r,detail:'coupure trop profonde pour continuer'}; }
          }
          if(!finish && st.A.cuts>=CUT_SEVERE_THRESHOLD && headB>0.5 && !immuneA){
            const medStopChance=clamp((st.A.cuts-CUT_SEVERE_THRESHOLD+1)*0.05*headB,0,0.35)*(dt/50);
            if(rnd()<medStopChance){ finish={by:B,loser:A,method:'Arrêt médical',round:r,detail:'coupure trop profonde pour continuer'}; }
          }
          /* ==== [FIN ANCRE] ==== */

          const koA=finish?0:clamp((a.power-(b.chin-chinVulnB))/62,0,.93)*clamp((offA-offB)/62+0.46,0,1)*0.6*koWeightMult*(1-b.fightIQ*0.0022)*(1+a.killer*0.003)*(1-b.heart*0.0016)*profA.koMod*0.22;
          const koB=finish?0:clamp((b.power-(a.chin-chinVulnA))/62,0,.93)*clamp((offB-offA)/62+0.46,0,1)*0.6*koWeightMult*(1-a.fightIQ*0.0022)*(1+b.killer*0.003)*(1-a.heart*0.0016)*profB.koMod*0.22;
          const isKdA=rnd()<koA*1.5*(dt/50), isKdB=!isKdA&&rnd()<koB*1.5*(dt/50);
          let kdText=null;
          /* ==== [ANCRE: P7_L2_COUP_FINITION] — bug évité : sur un KO/TKO
             déclenché dès les tout premiers échanges (avant toute usure
             accumulée), le perdant pouvait finir la simulation avec
             dmgHead=dmgBody=dmgLegs=0 arrondis (les fractions d'usure du
             tick, réparties sur 3 zones, tombent sous 0,5 chacune) — un
             knockout sans le moindre dégât enregistré, incohérent. Le coup
             qui termine réellement le combat compte désormais toujours,
             indépendamment du tirage "coup lourd" indépendant ci-dessus. ==== */
          if(isKdA){
            st.A.kd++; st.B.wobbled++; chinVulnB+=6;
            const finishChanceA=clamp(0.60*(1+((a.killer||50)-50)*0.003)*(1-((b.composure||50)-50)*0.003)*(1-((b.heart||50)-50)*0.002),0.25,0.85);
            if(rnd()<finishChanceA){ finish={by:A,loser:B,method:'KO/TKO',round:r}; applyZoneDamage(st.B,clamp(heavyShotAmplitude(a,b)*0.25,3,8),headA*1.4+0.6,bodyA+0.4,legA*0.4); }
            else { kdText={by:'me',txt:`${A.name} envoie ${B.name} au tapis, mais l’arbitre laisse le combat continuer !`}; dangerB=Math.max(dangerB,DANGER_TICKS_KD); applyZoneDamage(st.B,clamp(heavyShotAmplitude(a,b)*0.18,2,5),headA*1.4+0.6,bodyA+0.4,legA*0.4); }
          }
          else if(isKdB){
            st.B.kd++; st.A.wobbled++; chinVulnA+=6;
            const finishChanceB=clamp(0.60*(1+((b.killer||50)-50)*0.003)*(1-((a.composure||50)-50)*0.003)*(1-((a.heart||50)-50)*0.002),0.25,0.85);
            if(!immuneA && rnd()<finishChanceB){ finish={by:B,loser:A,method:'KO/TKO',round:r}; applyZoneDamage(st.A,clamp(heavyShotAmplitude(b,a)*0.25,3,8),headB*1.4+0.6,bodyB+0.4,legB*0.4); }
            else { kdText={by:'op',txt:`${B.name} envoie ${A.name} au tapis, mais l’arbitre laisse le combat continuer !`}; dangerA=Math.max(dangerA,DANGER_TICKS_KD); applyZoneDamage(st.A,clamp(heavyShotAmplitude(b,a)*0.18,2,5),headB*1.4+0.6,bodyB+0.4,legB*0.4); }
          }
          /* ==== [FIN ANCRE] ==== */
          /* ==== [ANCRE: P7_L2_FENETRE_FINITION_ROLL] — Lot 2/P7 §2.3 : "une
             finition devient nettement probable, sans être automatique"
             pendant la fenêtre de danger — un jet SUPPLÉMENTAIRE, distinct du
             jet de knockdown ci-dessus, actif uniquement tant que
             dangerA/dangerB>0 (donc nul le reste du combat, purement additif).
             dangerBoostA/B valent 1 hors fenêtre : (dangerBoostX-1) est donc
             nul hors fenêtre et proportionnel au boost de volume dedans. ==== */
          if(!finish && dangerB>0){
            const stormFinishA=clamp((dangerBoostA-1)*0.85+((a.killer||50)-50)*0.003,0,0.45)*(1-((b.composure||50)-50)*0.003)*(dt/50);
            if(rnd()<stormFinishA){ finish={by:A,loser:B,method:'KO/TKO',round:r,detail:'enchaînement dans la tempête'}; applyZoneDamage(st.B,clamp(heavyShotAmplitude(a,b)*0.25,3,8),headA*1.4+0.6,bodyA+0.4,legA*0.4); }
          }
          if(!finish && dangerA>0 && !immuneA){
            const stormFinishB=clamp((dangerBoostB-1)*0.85+((b.killer||50)-50)*0.003,0,0.45)*(1-((a.composure||50)-50)*0.003)*(dt/50);
            if(rnd()<stormFinishB){ finish={by:B,loser:A,method:'KO/TKO',round:r,detail:'enchaînement dans la tempête'}; applyZoneDamage(st.A,clamp(heavyShotAmplitude(b,a)*0.25,3,8),headB*1.4+0.6,bodyB+0.4,legB*0.4); }
          }
          /* ==== [FIN ANCRE] ==== */
          const isMe=rnd()<(offA/(offA+offB+1));
          momentum=clamp(momentum+(isMe?RI(4,9):-RI(4,9)),5,95);
          const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB;
          /* ==== [ANCRE: HORLOGE_CONTINUE_DENSITE_LOG_DEBOUT] — même logique
             de densité qu'en phase sol : un knockdown ou une finition sont
             toujours journalisés, un échange ordinaire est échantillonné à
             (dt/50) pour retomber sur ~6 beats/round en moyenne quel que soit
             dt (voir ANCRE HORLOGE_CONTINUE_DENSITE_LOG ci-dessus). ==== */
          if(kdText || finish || heavyLandedThisTick || rnd()<dt/90){
          let satirePool=[];
          if(atk.attrs.fightIQ>def.attrs.fightIQ+20){
            satirePool.push(`${atk.name} donne une leçon de géométrie à un adversaire qui ne sait pas lire les angles.`,`${atk.name} feinte le jab, ${def.name} réagit avec deux secondes de retard.`);
          }
          if(atk.attrs.power>85 && def.attrs.chin<50){
            satirePool.push(`La droite de ${atk.name} teste la validité de l’assurance santé de ${def.name}.`,`Chaque impact de ${atk.name} entame sérieusement le capital neuronal de ${def.name}.`);
          }
          if(atk.style==='karate'){
            satirePool.push(`${atk.name} fait des bonds de kangourou et claque un kick insaisissable.`,`Garde au niveau des genoux, arrogance au maximum, ${atk.name} touche en premier.`);
          }
          /* ==== [ANCRE: P7_L2_LOG_COUP_LOURD] — §2.3 : "une victoire par KO
             doit se lire dans le déroulé : un coup lourd, un knockdown, un
             enchaînement, l'arrêt" — un coup lourd qui vient de toucher (sans
             forcément de KD) obtient désormais ses propres lignes, plutôt que
             de se fondre dans les échanges ordinaires. ==== */
          if(!kdText && heavyLandedThisTick){
            satirePool=[`${atk.name} place un coup lourd, ${def.name} accuse le coup.`,`Sérieuse alerte pour ${def.name} : ${atk.name} vient de placer un coup qui compte.`,`${atk.name} touche fort, ${def.name} recule pour se remettre les idées en place.`];
          }
          /* ==== [FIN ANCRE] ==== */
          if(satirePool.length===0){
            satirePool=[`${atk.name} touche avec une belle combinaison.`,`${atk.name} trouve l’ouverture en striking.`,`Superbe échange remporté par ${atk.name}.`,`Le bras arrière de ${atk.name} fait mouche.`,`${atk.name} casse la distance et punit.`,`${tgs.includes('Kick')?atk.name+' claque un lourd kick.':atk.name+' place une combinaison nette.'}`];
          }
          let txt=kdText?kdText.txt:getUniqueLog(satirePool);
          log.push({r,phase:'debout',by:kdText?kdText.by:(isMe?'me':'op'),text:`[${formatTime(beatT)}] `+txt,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          /* ==== [ANCRE: P7_L2_LOG_ARRET_MEDICAL] — bug évité : ce texte de
             clôture était hardcodé "KO foudroyant", qui aurait été affiché
             tel quel même pour un arrêt médical (méthode distincte, §2.4) —
             contrairement à la phase 'sol' (ANCRE juste au-dessus dans ce
             fichier) déjà générique ("Victoire par ${finish.method}"). ==== */
          if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
            finish.time=beatT;
            last.text=finish.method==='Arrêt médical'
              ?`[${formatTime(beatT)}] [CRITIQUE] Le médecin de la commission arrête le combat : coupure trop sévère pour continuer.`
              :`[${formatTime(beatT)}] [CRITIQUE] KO foudroyant de ${finish.by.name} !`; }
          /* ==== [FIN ANCRE] ==== */
          }
          /* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — §4.1 "distance
             préférée et volonté de la maintenir ou de la fermer" : la
             fréquence de fermeture de distance dépend de clinchAffinity()
             des DEUX combattants (un style 'close' la ferme plus souvent
             qu'un style 'range', quel que soit l'adversaire), amplifiée si
             l'un des deux réagit au danger en cherchant le clinch
             (dangerReaction:'clinch', §4.1 "réaction quand il est en
             danger"). ==== */
          let clinchChance=0.15*((clinchAffinity(policyA)+clinchAffinity(policyB))/2);
          if(policyA.dangerReaction==='clinch' && dangerA>0) clinchChance*=1.6;
          if(policyB.dangerReaction==='clinch' && dangerB>0) clinchChance*=1.6;
          /* ==== [ANCRE: P8_L7_CAGE_POSITION] — position initiale du clinch à
             l'entrée depuis le debout : biaisée vers la cage quand l'un des
             deux combattants a une forte propension au grappling (giA/giB,
             déjà utilisés pour les tentatives d'amenée) — un lutteur/
             sambiste qui ferme la distance cherche typiquement la cage
             d'entrée, pas le centre. Simplification assumée : la propension
             au grappling la PLUS FORTE des deux pilote seule ce biais,
             qu'elle appartienne à A ou B (peu importe qui initie le
             clinch — ce n'est pas modélisé ici). ==== */
          if(!finish && rnd()<clinchChance*(dt/50)){
            currentPhase='clinch'; clinchPos=rnd()<(0.35+0.3*Math.max(giA,giB))?'cage':'center';
            /* ==== [ANCRE: P8_L8_ALLONGE_FERMETURE] — Lot 8/P8 §8.1 :
               "fermer la distance contre une allonge supérieure a un coût —
               passage sous les coups, exposition à l'entrée". Le moteur ne
               modélise pas QUI initie le clinch (aucune des deux jauges de
               grappling ci-dessus n'est directionnelle) ; hypothèse assumée
               ici, cohérente avec le MMA réel : c'est structurellement le
               combattant qui a l'allonge la plus COURTE qui est motivé à
               fermer la distance contre un adversaire plus long. "Taxe
               d'entrée" ponctuelle (un seul tick, au moment même de la
               transition vers le clinch), proportionnelle à l'écart
               d'allonge, plafonnée à 1.2 point de dégâts (négligeable
               devant l'usure/les coups lourds accumulés sur un round entier,
               ANCRE P7_L2_USURE) — un coût réel mais qui ne doit pas, à lui
               seul, décider un combat. ==== */
            /* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — même axe allonge
               que rEdgeStrikeAdj plus haut (fermeture du désavantage pour le
               combattant à l'allonge la plus courte) : réutilise la même
               variable, pas une seconde fermeture indépendante du même écart. ==== */
            if(Math.abs(rEdgeStrikeAdj)>=1){
              const shortIsA=rEdgeStrikeAdj<0, entryTax=clamp(Math.abs(rEdgeStrikeAdj)*0.6,0,4)*0.3;
              if(shortIsA){ dmgA+=entryTax; applyZoneDamage(st.A,entryTax,0.6,0.3,0.1); }
              else { dmgB+=entryTax; applyZoneDamage(st.B,entryTax,0.6,0.3,0.1); }
            }
            /* ==== [FIN ANCRE] ==== */
          }
        }
      }
    /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — §9.1 "chocs de têtes" : la
       deuxième source de coupures, indépendante des frappes elles-mêmes —
       un choc accidentel de crânes en clinch ou au sol (scramble, entrée en
       clinch serrée), PHASE-AGNOSTIQUE comme le jet de faute ci-dessous,
       placé ici pour la même raison (jamais après une finition déjà tirée
       ce tick). Touche un seul des deux combattants (tirage 50/50) — un
       choc de tête réel abîme parfois les deux, mais un modèle plus simple
       suffit ici : ce n'est jamais lui qui décide un combat, seulement une
       source de coupure à isoler dans le rapport. ==== */
    if(!finish && (currentPhase==='clinch'||currentPhase==='sol') && rnd()<HEAD_CLASH_CHANCE*(dt/50)){
      const victimIsA=rnd()<0.5;
      if(victimIsA){ st.A.cuts++; st.A.cutSrc.clash++; tryEyeInjury(true,r,beatT,currentPhase,momentum); }
      else { st.B.cuts++; st.B.cutSrc.clash++; tryEyeInjury(false,r,beatT,currentPhase,momentum); }
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L7_ARBITRE_FAUTES] — Lot 7/P8 §7.1 : jet de faute
       PHASE-AGNOSTIQUE (debout/clinch/sol), placé en fin de tick pour ne
       jamais interférer avec une finition déjà tirée CE tick par la phase
       ci-dessus (`!finish` gate) — un knockdown et une disqualification ne
       peuvent jamais se disputer la même seconde. Sévérité en cascade,
       classée du PLUS probable au MOINS probable (70% avertissement, ~22%
       temps mort de récupération pour la victime, ~7.7% retrait de point,
       0.3% faute flagrante et disqualification immédiate) : cet ORDRE
       ascendant est délibéré, pas cosmétique — de nombreux tests de ce
       fichier forcent `win.rnd=()=>0` pour construire un scénario pire-cas
       déterministe (cf. ANCRE P7_L5_GAUSS_RND_ZERO, engine.js), ce qui rend
       CHAQUE comparaison `rnd()<seuil positif` vraie ; classer la branche
       la MOINS perturbatrice (avertissement, aucun effet sur `finish`/le
       score) en premier garantit qu'un flux dégénéré tombe systématiquement
       dessus plutôt que sur la disqualification immédiate — sans quoi
       n'importe quel test préexistant construit autour d'un KO/une
       soumission au round 1 se retrouverait court-circuité par une
       disqualification parasite avant même que son scénario ne s'exécute
       (constaté : CORRECTIF_KD_SOL, tests/regressionFixes.test.js, cassait
       exactement ainsi avant cette réorganisation). Un avertissement ne
       journalise rien (compteur seul, foulWarnX) pour ne pas noyer le log
       d'un combat construit avec un flux dégénéré de centaines de ticks —
       les issues avec un effet réel (temps mort, retrait de point,
       disqualification) restent, elles, toujours journalisées. `roundFoulPtsX`
       traverse la notation du round courant (ANCRE JUGES_10PT_SCORE plus
       bas) et un DEUXIÈME retrait contre le même combattant déclenche la
       disqualification automatique ; les deux issues de disqualification
       remontent `finish` exactement comme un KO/une soumission (méthode
       'Disqualification', §7.1 "comme l'a été l'arrêt médical"). ==== */
    if(!finish && rnd()<foulChance(a)*(dt/50)){
      const sevRoll=rnd();
      if(sevRoll<0.70){
        foulWarnA++;
      } else if(sevRoll<0.92){
        dmgB=Math.max(0,dmgB-4);
        log.push({r,phase:currentPhase,by:'op',text:`[${formatTime(beatT)}] Temps mort : ${B.name} récupère après une faute de ${A.name}.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      } else if(sevRoll<0.997){
        foulPointsA++; roundFoulPtsA++;
        log.push({r,phase:currentPhase,by:'op',text:`[${formatTime(beatT)}] L’arbitre retire un point à ${A.name} pour une faute.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(foulPointsA>=2){
          finish={by:B,loser:A,method:'Disqualification',round:r,detail:'deuxième retrait de point',time:beatT};
          log.push({r,phase:currentPhase,by:'op',finish:true,method:'Disqualification',text:`[${formatTime(beatT)}] [CRITIQUE] Deuxième retrait de point : ${A.name} est disqualifié.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else {
        finish={by:B,loser:A,method:'Disqualification',round:r,detail:'faute grave et intentionnelle',time:beatT};
        log.push({r,phase:currentPhase,by:'op',finish:true,method:'Disqualification',text:`[${formatTime(beatT)}] [CRITIQUE] Faute grave de ${A.name} : l’arbitre disqualifie sur-le-champ.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      }
    }
    if(!finish && rnd()<foulChance(b)*(dt/50)){
      const sevRoll=rnd();
      if(sevRoll<0.70){
        foulWarnB++;
      } else if(sevRoll<0.92){
        dmgA=Math.max(0,dmgA-4);
        log.push({r,phase:currentPhase,by:'me',text:`[${formatTime(beatT)}] Temps mort : ${A.name} récupère après une faute de ${B.name}.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      } else if(sevRoll<0.997){
        foulPointsB++; roundFoulPtsB++;
        log.push({r,phase:currentPhase,by:'me',text:`[${formatTime(beatT)}] L’arbitre retire un point à ${B.name} pour une faute.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(foulPointsB>=2){
          finish={by:A,loser:B,method:'Disqualification',round:r,detail:'deuxième retrait de point',time:beatT};
          log.push({r,phase:currentPhase,by:'me',finish:true,method:'Disqualification',text:`[${formatTime(beatT)}] [CRITIQUE] Deuxième retrait de point : ${B.name} est disqualifié.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else {
        finish={by:A,loser:B,method:'Disqualification',round:r,detail:'faute grave et intentionnelle',time:beatT};
        log.push({r,phase:currentPhase,by:'me',finish:true,method:'Disqualification',text:`[${formatTime(beatT)}] [CRITIQUE] Faute grave de ${B.name} : l’arbitre disqualifie sur-le-champ.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      }
    }
    /* ==== [FIN ANCRE] ==== */
    }
    // ==== [FIN ANCRE] ====
    if(dmgA>45&&rnd()<.4)chinVulnA+=8;
    if(dmgB>45&&rnd()<.4)chinVulnB+=8;
    // ==== [ANCRE: JUGES_10PT_SCORE] — 10-9 par défaut, 10-8 si domination nette, 10-7 en cas extrême ====
    const rSigA=st.A.sig-_sigA0, rSigB=st.B.sig-_sigB0;
    const rTdA=st.A.td-_tdA0, rTdB=st.B.td-_tdB0;
    const rCtrlA=(st.A.ctrl||0)-_ctrlA0, rCtrlB=(st.B.ctrl||0)-_ctrlB0;
    const kdDiff=(st.A.kd-_kdA0)-(st.B.kd-_kdB0);
    const rPwrDiff=(st.A.powerStrikes-_pwrA0)-(st.B.powerStrikes-_pwrB0);
    const rSubDiff=(st.A.subAtt-_subAttA0)-(st.B.subAtt-_subAttB0);
    const rWobDiff=(st.B.wobbled-_wobB0)-(st.A.wobbled-_wobA0);
    const aggDiff=((a.aggression||50)-(b.aggression||50))*0.04;
    /* ==== [ANCRE: P7_L3_JUGES_SENSIBILITES] — Lot 3/P7 sec.3.3 : remplace le
       bruit inter-juges INDÉPENDANT (dissentJudge(), qui pouvait donner la
       TOTALITÉ d'un round à l'autre combattant dès que |rDiff|<=20 — la
       quasi-totalité des rounds 10-9, cf. baseline-P7.md, mesuré 38-40% de
       décisions partagées, cible <15%) par trois lectures CORRÉLÉES du même
       round : les trois juges partent des MÊMES composantes objectives
       (frappes, amenées, contrôle, KD...) mais pondèrent différemment — sec.
       3.3, "ils doivent partager une lecture commune du round et ne diverger
       qu'à la marge, avec des sensibilités différentes" (juge 2 : plus
       sensible au contrôle/amenées ; juge 3 : plus sensible aux dégâts/
       sonnés). Un round nettement dominé selon TOUTES les pondérations reste
       nettement dominé pour les trois juges — jamais donné à l'autre ; seul
       un round réellement limite peut basculer sous une pondération
       différente. Cohérence panneau/cartes (sec.3.3 dernier point) : chaque
       composante pondérée est exposée en clair (judgeDiffs, ci-dessous dans
       roundStats) pour rester inspectable par le harnais. ==== */
    const judgeRDiff=w=>(rSigA-rSigB)*w.sig+rPwrDiff*w.pwr+(rTdA-rTdB)*w.td+rSubDiff*w.sub+rWobDiff*w.wob+(rCtrlA-rCtrlB)*w.ctrl+aggDiff*w.agg;
    const JUDGE_WEIGHTS=[
      {sig:1.0, pwr:0.5, td:1.5, sub:1.2, wob:1.8, ctrl:3.0, agg:1.0}, // juge 1 : lecture de référence (formule pré-L3, inchangée)
      {sig:0.9, pwr:0.3, td:2.0, sub:1.3, wob:1.6, ctrl:4.2, agg:0.8}, // juge 2 : plus sensible au contrôle/amenées
      {sig:1.1, pwr:0.9, td:1.1, sub:1.1, wob:2.3, ctrl:2.0, agg:1.1}, // juge 3 : plus sensible aux dégâts/sonnés
    ];
    const scoreFromDiff=rDiff=>{
      if((rDiff>44&&kdDiff>=0)||kdDiff>=3) return [10,7];
      if((rDiff>32&&kdDiff>=0)||kdDiff>=2) return [10,8];
      if((rDiff>3&&kdDiff>=0)||kdDiff===1) return [10,9];
      if((rDiff<-44&&kdDiff<=0)||kdDiff<=-3) return [7,10];
      if((rDiff<-32&&kdDiff<=0)||kdDiff<=-2) return [8,10];
      if((rDiff<-3&&kdDiff<=0)||kdDiff===-1) return [9,10];
      if(rDiff>0) return [10,9]; // bande serrée mais A garde un léger avantage réel
      if(rDiff<0) return [9,10]; // bande serrée mais B garde un léger avantage réel
      return rnd()<0.5?[10,9]:[9,10]; // égalité mathématique exacte, rarissime
    };
    const judgeDiffs=JUDGE_WEIGHTS.map(judgeRDiff);
    let [sA,sB]=scoreFromDiff(judgeDiffs[0]);
    let [s2A,s2B]=scoreFromDiff(judgeDiffs[1]);
    let [s3A,s3B]=scoreFromDiff(judgeDiffs[2]);
    /* ==== [ANCRE: P8_L7_ARBITRE_FAUTES] — §7.1 "le retrait de point doit
       traverser la notation : une victoire aux points peut s'inverser sur
       un point retiré". roundFoulPtsA/B (remis à zéro à chaque round,
       déclaré au début de la boucle des rounds) sont soustraits IDENTIQUEMENT
       des TROIS cartes pour ce round — une décision de l'arbitre est
       objective, elle ne varie pas d'un juge à l'autre, contrairement au
       bruit inter-juges de JUDGE_WEIGHTS ci-dessus. Plancher à 6 pour éviter
       un round dégénéré (un round reste un round, jamais négatif ni nul). ==== */
    if(roundFoulPtsA>0){ sA=Math.max(6,sA-roundFoulPtsA); s2A=Math.max(6,s2A-roundFoulPtsA); s3A=Math.max(6,s3A-roundFoulPtsA); }
    if(roundFoulPtsB>0){ sB=Math.max(6,sB-roundFoulPtsB); s2B=Math.max(6,s2B-roundFoulPtsB); s3B=Math.max(6,s3B-roundFoulPtsB); }
    /* ==== [FIN ANCRE] ==== */
    let j1=[sA,sB], j2=[s2A,s2B], j3=[s3A,s3B];
    j1A+=j1[0];j1B+=j1[1];j2A+=j2[0];j2B+=j2[1];j3A+=j3[0];j3B+=j3[1];
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: HORLOGE_CONTINUE_ARRONDI] — les compteurs de st.A/st.B
       s'accumulent en valeur fractionnaire pendant toute la boucle de ticks
       (voir ANCRE HORLOGE_CONTINUE) : c'est ici, en figeant les totaux du
       round pour l'affichage des cartes de juges, que l'arrondi intervient
       pour la première fois — jamais avant. `ctrl` (utilisé par
       formatCtrl()) reste volontairement en valeur fractionnaire. ==== */
    roundStats.push({
      r,j1,j2,j3,judgeDiffs,kdDiff,
      sigA:Math.round(st.A.sig-_sigA0), sigB:Math.round(st.B.sig-_sigB0),
      sigAttA:Math.round(st.A.sigAtt-_sigAttA0), sigAttB:Math.round(st.B.sigAtt-_sigAttB0),
      totalA:Math.round(st.A.total-_totalA0), totalB:Math.round(st.B.total-_totalB0),
      totalAttA:Math.round(st.A.totalAtt-_totalAttA0), totalAttB:Math.round(st.B.totalAtt-_totalAttB0),
      tdA:Math.round(st.A.td-_tdA0), tdB:Math.round(st.B.td-_tdB0),
      tdAttA:Math.round(st.A.tdAtt-_tdAttA0), tdAttB:Math.round(st.B.tdAtt-_tdAttB0),
      tdDefA:Math.round(st.A.tdDef-_tdDefA0), tdDefB:Math.round(st.B.tdDef-_tdDefB0),
      kdA:Math.round(st.A.kd-_kdA0), kdB:Math.round(st.B.kd-_kdB0),
      ctrlA:st.A.ctrl-_ctrlA0, ctrlB:st.B.ctrl-_ctrlB0,
      ctrlSecA:st.A.ctrlSec-_ctrlSecA0, ctrlSecB:st.B.ctrlSec-_ctrlSecB0,
      subAttA:Math.round(st.A.subAtt-_subAttA0), subAttB:Math.round(st.B.subAtt-_subAttB0),
      headA:Math.round(st.A.sigHead-_headA0), headB:Math.round(st.B.sigHead-_headB0),
      bodyA:Math.round(st.A.sigBody-_bodyA0), bodyB:Math.round(st.B.sigBody-_bodyB0),
      legA:Math.round(st.A.sigLeg-_legA0), legB:Math.round(st.B.sigLeg-_legB0),
      pwrA:Math.round(st.A.powerStrikes-_pwrA0), pwrB:Math.round(st.B.powerStrikes-_pwrB0)
    });
    /* ==== [ANCRE: P8_L9_EXAMEN_MEDICAL] — Lot 9/P8 §9.3 : "distinct de
       l'arrêt médical déjà implémenté [mi-round]... le médecin monte,
       examine une coupure ou une blessure, et laisse continuer ou arrête.
       La majorité des examens doivent laisser continuer." Nouveau POINT DE
       CONTRÔLE (entre les rounds, jamais mi-round — ce dernier reste
       intégralement géré par l'ANCRE P7_L2_ARRET_MEDICAL, plus haut), pas
       un second système de gravité : ringsideExamStopChance() lit les
       mêmes compteurs déjà accumulés (cuts, blessures). Réutilise les
       méthodes de victoire EXISTANTES ('Arrêt médical' pour une coupure,
       'Blessure' pour une blessure sans coupure sévère associée) plutôt que
       d'en inventer une troisième — CLAUDE.md §8 "ne jamais créer de
       système parallèle". Pas d'examen après le dernier round (`r<rounds`) :
       le combat est de toute façon terminé. ==== */
    if(!finish && r<rounds){
      const hasInjuryA=injuredHandA||injuredKneeA||injuredEyeA, hasInjuryB=injuredHandB||injuredKneeB||injuredEyeB;
      if(st.A.cuts>=1 || hasInjuryA){
        examCount++;
        if(rnd()<ringsideExamStopChance(st.A.cuts,hasInjuryA)){
          const injuryDriven=hasInjuryA && st.A.cuts<CUT_SEVERE_THRESHOLD;
          finish={by:B,loser:A,method:injuryDriven?'Blessure':'Arrêt médical',round:r,
            detail:injuryDriven?'blessure jugée trop sévère pour continuer':'coupure jugée trop sévère pour continuer'};
          log.push({r,phase:'exam',by:'op',finish:true,method:finish.method,text:`[00:00] Le médecin monte entre les rounds : ${A.name} ne peut pas continuer.`,momentum,
            snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        } else {
          log.push({r,phase:'exam',by:'me',text:`[00:00] Le médecin monte entre les rounds examiner ${A.name} : le combat continue.`,momentum,
            snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      }
      if(!finish && (st.B.cuts>=1 || hasInjuryB)){
        examCount++;
        if(rnd()<ringsideExamStopChance(st.B.cuts,hasInjuryB)){
          const injuryDriven=hasInjuryB && st.B.cuts<CUT_SEVERE_THRESHOLD;
          finish={by:A,loser:B,method:injuryDriven?'Blessure':'Arrêt médical',round:r,
            detail:injuryDriven?'blessure jugée trop sévère pour continuer':'coupure jugée trop sévère pour continuer'};
          log.push({r,phase:'exam',by:'me',finish:true,method:finish.method,text:`[00:00] Le médecin monte entre les rounds : ${B.name} ne peut pas continuer.`,momentum,
            snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        } else {
          log.push({r,phase:'exam',by:'op',text:`[00:00] Le médecin monte entre les rounds examiner ${B.name} : le combat continue.`,momentum,
            snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      }
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: P8_L6_COIN_SUPPRIME] — Lot 6/P8 §6.1 : le coin entre les
       rounds (ex-ancre P7_L5_COIN_ENTRE_LES_ROUNDS) est retiré en entier,
       beats phase:'bell' et ajustement d'attributs (`a.fightIQ+=adaptA`,
       `a.footwork+=adaptA*0.5`) compris. Il n'y a donc plus aucun coin,
       visible ou invisible. `adaptability` n'est pas devenu un attribut
       muet pour autant : il reste lu à chaque échange via eff().fightIQ
       (engine.js:379, poids 0.12), qui alimente offA/offB, les chances de
       KO/soumission/GNP et le multiplicateur `plan.def` — voir la réponse
       "adaptability en combat" du rapport de lot 6. Seul l'à-coup
       supplémentaire de fin de round (le "second souffle" quand on perd
       le round) disparaît. Le handler `phase==='bell'` d'applyBeat()
       (ui-09-arena.js) est conservé pour rejouer sans erreur les logs de
       sauvegardes antérieures à ce lot, mais aucun combat simulé après ce
       lot n'émettra plus ce beat. ==== */
    // ==== [ANCRE: RECUP_INTER_ROUND] — la minute de repos entre rounds allège
    // une partie des dégâts accumulés, proportionnellement à la vraie stat de
    // récupération (pas la fatigue/cardio, qui reste dérivée à chaque round). ====
    dmgA=Math.max(0,dmgA-(A.attrs.recovery||50)*0.15);
    dmgB=Math.max(0,dmgB-(B.attrs.recovery||50)*0.15);
    /* ==== [ANCRE: P7_L2_RECUP_DANGER] — Lot 2/P7 §2.5 : "recovery doit
       gouverner ce que la cloche efface : une partie de la fatigue (juste
       au-dessus, inchangé), une partie de l'état wobbled, JAMAIS les dégâts
       cumulés aux jambes et au corps." La cloche allège donc aussi la
       fenêtre de danger encore active — st.X.dmgHead/dmgBody/dmgLegs, eux,
       ne sont touchés NULLE PART dans ce bloc (ni ailleurs dans ce fichier) :
       un combattant qui a pris quarante low kicks au round 2 ne repart pas
       neuf au round 3. ==== */
    dangerA=Math.max(0,dangerA-(A.attrs.recovery||50)*0.08);
    dangerB=Math.max(0,dangerB-(B.attrs.recovery||50)*0.08);
    /* ==== [FIN ANCRE] ==== */
    // ==== [FIN ANCRE] ====
  }
  let res;
  if(finish){
    const loserSt=(finish.loser===A)?st.A:st.B;
    const zones={tête:loserSt.dmgHead,corps:loserSt.dmgBody,jambes:loserSt.dmgLegs};
    const finishZone=Object.keys(zones).reduce((a,b)=>zones[b]>zones[a]?b:a,'tête');
    finish.zone=finishZone;
    const finishMove=pickFinishMove(finish.by, finish.method==='Soumission'?'sub':'ko', finishZone, st, finish.round);
    finish.moveName=finishMove.name; finish.moveFlavor=finishMove.flavor;
    /* ==== [ANCRE: P7_L2_FLAVOR_ARRET_MEDICAL] — pickFinishMove() ne connaît
       que 'sub'/'ko' (jamais 'Arrêt médical', §2.4) : sans ce repli, le
       flavor "bloodbath" générique ('La commission médicale doit intervenir
       en urgence.') aurait pu s'afficher au mot près pour un KO ordinaire ET
       pour un arrêt médical réel, les rendant indiscernables à l'écran. ==== */
    if(finish.method==='Arrêt médical') finish.moveFlavor='La coupure est trop profonde : le médecin de la commission met fin au combat.';
    /* ==== [ANCRE: P8_L7_ARBITRE_FAUTES] — même repli que l'arrêt médical
       ci-dessus (ANCRE P7_L2_FLAVOR_ARRET_MEDICAL) : pickFinishMove() ne
       connaît que 'sub'/'ko', donc une disqualification aurait hérité d'un
       nom de prise de KO totalement hors-sujet (et affiché comme tel par
       les écrans, cf. ui-06-career-screens.js — `moveName` vidé empêche
       l'étiquette "KO/TKO (…)"/"Soumission (…)" de s'afficher pour une
       méthode qui n'est ni l'un ni l'autre). ==== */
    if(finish.method==='Disqualification'){
      finish.moveName='';
      finish.moveFlavor=finish.detail==='deuxième retrait de point'
        ?'Deuxième retrait de point : l’arbitre met fin au combat et disqualifie le fautif.'
        :'Faute grave et intentionnelle : l’arbitre disqualifie sur-le-champ.';
    }
    /* ==== [ANCRE: P8_L9_BLESSURES] — même repli que l'arrêt médical/la
       disqualification ci-dessus : pickFinishMove() ne connaît que 'sub'/
       'ko', donc une blessure (main cassée, genou lâché) aurait hérité d'un
       nom de prise de KO totalement hors-sujet. `moveName` vidé, comme pour
       la disqualification. ==== */
    if(finish.method==='Blessure'){
      finish.moveName='';
      finish.moveFlavor=`${finish.detail?finish.detail.charAt(0).toUpperCase()+finish.detail.slice(1):'Blessure'} : le combat ne peut pas continuer.`;
    }
    /* ==== [FIN ANCRE] ==== */
    /* ==== [FIN ANCRE] ==== */
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: CORRECTIF_ZONE_AFFICHEE] — zone anatomique NARRÉE = celle du
       geste joué (finishMove.moveZone), pas celle des dégâts cumulés. Repli sur
       finishZone si le geste n'est référencé dans aucune table. ==== */
    const shownZone=finishMove.moveZone||finishZone;
    res={winner:finish.by===A?'A':'B',method:finish.method,round:finish.round,detail:finish.detail||'',moveName:finish.moveName,moveFlavor:finish.moveFlavor,zone:shownZone};
    /* ==== [ANCRE: HORLOGE_CONTINUE_FINISH_TIME] — Lot P6/2026 : finish.time
       (secondes écoulées dans le round de finition, tirées uniformément dans
       le tick via t+RI(0,dt-1), cf. ANCRE HORLOGE_CONTINUE) est désormais un
       horodatage réel — voir applyResult() plus bas pour sa propagation dans
       f.history. finishTime est exposé en secondes écoulées, finishTimeStr
       au format mm:ss (temps restant, même convention que les logs). ==== */
    if(typeof finish.time==='number'){ res.finishTime=finish.time; res.finishTimeStr=formatTime(finish.time); }
    /* ==== [FIN ANCRE] ==== */
  }
  else {
    // ==== [ANCRE: JUGES_10PT_VERDICT] — le vainqueur vient du vote MAJORITAIRE des
    // juges (pas d'un total sa/sb caché), pour que les cartes affichées soient
    // toujours cohérentes avec le résultat annoncé. ====
    /* ==== [ANCRE: P8_L7_VOCABULAIRE_DECISIONS] — Lot 7/P8 §7.3 : remplace le
       vote binaire ci-dessus (votesA/votesB traitait une égalité de juge
       comme un simple non-vote — un combattant qui ne recueillait qu'UN
       SEUL juge décisif contre deux égalités aurait été déclaré vainqueur
       par "Décision", alors qu'un vrai panel MMA rend ça un NUL majoritaire)
       par judgesVerdict() (fonction pure, déclarée plus haut, testée
       directement) — les scores j1A/j1B/j2A/j2B/j3A/j3B lus ici sont les
       totaux du combat entier, déjà accumulés round par round juste
       au-dessus, retraits de point de l'arbitre compris (ANCRE
       P8_L7_ARBITRE_FAUTES : "le retrait de point doit traverser la
       notation"). Les libellés existants ('Décision', 'Décision partagée',
       'Égalité') ne sont jamais réécrits en base — seuls les COMBATS
       SIMULÉS APRÈS ce lot émettent le nouveau vocabulaire complet (§8,
       compatibilité des sauvegardes). ==== */
    res=judgesVerdict(j1A,j1B,j2A,j2B,j3A,j3B);
    // ==== [FIN ANCRE] ====
  }
  /* ==== [ANCRE: P8_L7_ARBITRE_ETAT] — exposé pour le harnais/les tests :
     nombre de relances debout sur inactivité et retraits de point cumulés
     par combattant sur l'ensemble du combat, indépendamment de la méthode
     de victoire (une disqualification directe par faute flagrante n'a par
     exemple jamais touché à foulPointsA/B). ==== */
  res.refStandups=refStandupCount; res.foulPointsA=foulPointsA; res.foulPointsB=foulPointsB;
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: P8_L9_BLESSURES] — exposé pour le harnais/les tests, même
     schéma que refStandups ci-dessus : nombre d'examens médicaux entre les
     rounds, et liste des blessures réellement survenues par combattant sur
     l'ensemble du combat (jamais un booléen unique — un combattant peut, en
     théorie, cumuler les trois types). ==== */
  res.examCount=examCount;
  res.injuriesA=[injuredHandA&&'main cassée',injuredKneeA&&'genou lâché',injuredEyeA&&'arcade fermée'].filter(Boolean);
  res.injuriesB=[injuredHandB&&'main cassée',injuredKneeB&&'genou lâché',injuredEyeB&&'arcade fermée'].filter(Boolean);
  /* ==== [FIN ANCRE] ==== */
  res.scoreA=j1A+j2A+j3A; res.scoreB=j1B+j2B+j3B;
  res.judges={j1:[j1A,j1B],j2:[j2A,j2B],j3:[j3A,j3B]}; res.roundStats=roundStats;
  /* ==== [ANCRE: HORLOGE_CONTINUE_ARRONDI_FIN_COMBAT] — dernier point
     d'arrondi (voir ANCRE HORLOGE_CONTINUE_ARRONDI plus haut, pour les
     rounds) : les compteurs discrets de res.stats sont fractionnaires tout
     au long du combat, arrondis une seule fois ici. `ctrl` (utilisé par
     formatCtrl()) et ctrlSec/groundCtrlSec/clinchCtrlSec (déjà des entiers,
     accumulés par pas de dt) sont exclus. ==== */
  const INT_ROUND_FIELDS=['sig','sigAtt','total','totalAtt','sigHead','headAtt','sigBody','bodyAtt',
    'sigLeg','legAtt','distStrikes','distAtt','clinchStrikes','clinchAtt','groundStrikes','groundAtt',
    'powerStrikes','td','tdAtt','tdDef','reversals','standups','guardPasses','subAtt','subEscapes',
    'dmgHead','dmgBody','dmgLegs','kd','wobbled','cuts','sub','lateSig'];
  ['A', 'B'].forEach(side => {
    const s = st[side];
    INT_ROUND_FIELDS.forEach(k=>{ s[k]=Math.round(s[k]); });
    s.sigAtt = Math.max(s.sigAtt, s.sig);
    s.total = Math.max(s.total, s.sig);
    s.totalAtt = Math.max(s.totalAtt, s.sigAtt, s.total);
    s.tdAtt = Math.max(s.tdAtt, s.td);
    s.ctrlSec = Math.max(0, s.ctrlSec);
    /* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — mêmes règles d'arrondi que
       ci-dessus pour les deux structures imbriquées (byType/cutSrc, ANCRE
       P8_L9_TAXONOMIE_FRAPPES plus haut) : Object.keys() plutôt qu'une
       liste plate, jamais touchées par INT_ROUND_FIELDS (qui ne sait
       arrondir que des champs scalaires). ==== */
    Object.keys(s.byType).forEach(k=>{ s.byType[k]=Math.round(s.byType[k]); });
    Object.keys(s.cutSrc).forEach(k=>{ s.cutSrc[k]=Math.round(s.cutSrc[k]); });
    /* ==== [FIN ANCRE] ==== */
  });
  /* ==== [FIN ANCRE] ==== */
  res.log=log; res.stats=st;
  return res;
}
