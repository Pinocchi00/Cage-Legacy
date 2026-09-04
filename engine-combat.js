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
   isDecisionLike/ATTR_KEYS/DIVISIONS/STYLES/eff/overall/reachEdge/
   weightFactor/makeFighter...) donc CHARGE JUSTE APRES engine.js. Utilise
   aussi des fonctions d'engine-progression.js (grantSkill, epithets,
   txtPick) et d'engine-events.js (getRivalryPurseMultiplier...) au
   runtime — l'ordre exact entre
   fichiers freres n'a pas d'importance tant que tous chargent avant que
   la partie ne demarre reellement (aucun appel au niveau racine d'un
   fichier vers un autre). */

// ==== [ANCRE: STYLE_PROFILE] — différenciation mécanique des 8 styles (volume de
// frappes, facteur KO, menace de soumission, dégâts clinch/GNP). tdVol
// délibérément absent : STYLES[].grap couvre déjà l'initiative de lutte
// (boxeur 0.15 vs lutteur 0.77, écart ×5) — l'ajouter aurait fait ×48, une
// surcorrection qui aurait quasiment supprimé la lutte chez les boxeurs. ====
const STYLE_PROFILE={
  boxer:{sigVol:1.18,koMod:1.15,subMod:0.10,clinchDmg:0.8,gnpDmg:0.8},
  kickboxer:{sigVol:1.05,koMod:1.20,subMod:0.20,clinchDmg:0.9,gnpDmg:0.8},
  muayThai:{sigVol:0.88,koMod:1.25,subMod:0.30,clinchDmg:1.25,gnpDmg:1.0},
  karate:{sigVol:1.26,koMod:1.52,subMod:0.20,clinchDmg:0.7,gnpDmg:0.7},
  wrestler:{sigVol:0.98,koMod:1.10,subMod:0.40,clinchDmg:1.1,gnpDmg:1.30},
  // ==== [ANCRE: CORRECTIF_GUARDPULL_MORT] — signalé par A22 (ui-03) : guardPull n'est lu NULLE PART dans ce moteur — donnée morte, conservée telle quelle (pas de risque à la retirer, mais pas de bénéfice non plus tant qu'aucune mécanique ne la consomme).
  bjj:{sigVol:0.95,koMod:0.75,subMod:1.98,clinchDmg:0.9,gnpDmg:0.9,guardPull:0.35},
  sambo:{sigVol:0.85,koMod:1.20,subMod:1.30,clinchDmg:1.2,gnpDmg:1.15},
  mma:{sigVol:1.05,koMod:1.05,subMod:1.00,clinchDmg:1.0,gnpDmg:1.0}
};
/* ==== [FIN ANCRE] ==== */
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
  let sa=0,sb=0,dmgA=0,dmgB=0,finish=null; const log=[];
  // ==== [ANCRE: CHIN_TEMPORAIRE] — un round brutal fragilise le menton pour LE
  // RESTE DE CE COMBAT uniquement (variable locale), jamais l'attribut permanent
  // du combattant : encaisser un round dur ne doit pas user le menton à vie,
  // sans que le joueur en soit jamais informé. ====
  let chinVulnA=0, chinVulnB=0;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: MOTEUR_COMBAT_STATS_ENRICHIES] — modèle statistique complet selon spécification DeepSeek ====
  const makeFighterStats=()=>({
    sig:0, td:0, tdAtt:0, ctrl:0, sub:0, kd:0, dmgHead:0, dmgBody:0, dmgLegs:0,
    sigAtt:0, total:0, totalAtt:0,
    sigHead:0, headAtt:0, sigBody:0, bodyAtt:0, sigLeg:0, legAtt:0,
    distStrikes:0, distAtt:0, clinchStrikes:0, clinchAtt:0, groundStrikes:0, groundAtt:0,
    powerStrikes:0, tdDef:0, reversals:0, standups:0, guardPasses:0,
    subAtt:0, subEscapes:0, ctrlSec:0, clinchCtrlSec:0, groundCtrlSec:0,
    wobbled:0, cuts:0
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
    let currentPhase='debout', topIsA=false;
    const cardioFactorA=(a.cardio<60)?0.09:0.06, cardioFactorB=(b.cardio<60)?0.09:0.06;
    const roundPenalty=(r>=4)?1.3:1.0;
    for(let t=0;t<roundLen && !finish;t+=dt){
      // décalage aléatoire intra-tick : partagé par tous les horodatages
      // affichés ce tick (beats narratifs comme finitions), pour que les
      // instants montrés au joueur ne soient jamais des multiples de dt.
      const beatT=t+RI(0,dt-1);
      const outA=st.A.sig+st.A.tdAtt*0.6, outB=st.B.sig+st.B.tdAtt*0.6;
      // Résistance à la fatigue via durabilité et second souffle (cœur)
      const heartResistA=(r>=3||dmgA>30)?clamp(((a.heart||50)-50)*0.003,-0.04,0.18):0;
      const durResistA=clamp(((a.durability||50)-50)*0.002,-0.04,0.14);
      const heartResistB=(r>=3||dmgB>30)?clamp(((b.heart||50)-50)*0.003,-0.04,0.18):0;
      const durResistB=clamp(((b.durability||50)-50)*0.002,-0.04,0.14);
      const fatA=clamp(((dmgA+outA*0.2)-a.cardio)*cardioFactorA*roundPenalty*(1-heartResistA-durResistA),0,28);
      const fatB=clamp(((dmgB+outB*0.2)-b.cardio)*cardioFactorB*roundPenalty*(1-heartResistB-durResistB),0,28);

      if(currentPhase==='sol'){
        const top=topIsA?a:b, bot=topIsA?b:a, topF=topIsA?A:B, botF=topIsA?B:A, topFat=topIsA?fatA:fatB;
        const topProf=topIsA?profA:profB, botProf=topIsA?profB:profA;
        const stTop=topIsA?st.A:st.B, stBot=topIsA?st.B:st.A;
        const control=clamp((top.topControl-bot.guard)*0.32,0,11)*0.2;
        const gnp=clamp((top.ground*0.5+top.power*0.45)-bot.guard*0.55-topFat,0,45)*topProf.gnpDmg*0.2;
        const subTop=clamp(top.submission-bot.guard*0.85,0,45)*(1+top.killer*0.004)*topProf.subMod*0.2;
        const subBot=clamp(bot.submission-top.topControl*0.7-top.ground*0.4,0,35)*botProf.subMod*0.2;
        const topPts=1.2+control*0.5+gnp*0.46+subTop*0.22; const botPts=subBot*0.9+clamp(bot.guard-top.topControl,0,22)*0.032+0.6;
        const gHits=gnp*0.4;
        /* ==== [ANCRE: HORLOGE_CONTINUE_CTRLSEC] — beatGroundSec est la même
           heuristique qu'avant ce lot (une fraction du tick, jamais le tick
           entier : un contrôle au sol connaît des relances/scrambles même
           quand la phase persiste), simplement rescalée par (dt/50) comme
           tout le reste. `stTop.ctrlSec+=dt` (tout le tick) donnait un
           temps de contrôle ~3x trop élevé au Monte Carlo — confirmé en
           comparant tools/monte-carlo-combat.js avant/après ce lot. ==== */
        const beatGroundSec=clamp(22+clamp(top.topControl-bot.guard,-15,25)*0.35,14,46);
        if(topIsA){sa+=topPts*(dt/50);sb+=botPts*(dt/50);dmgB+=gnp*0.32*(dt/50);st.A.ctrl+=dt*(0.2/50);st.A.sig+=gHits*(dt/50);} else {sb+=topPts*(dt/50);sa+=botPts*(dt/50);dmgA+=gnp*0.32*(dt/50);st.B.ctrl+=dt*(0.2/50);st.B.sig+=gHits*(dt/50);}
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
        if(top.topControl>bot.guard+12 && rnd()<0.25*(dt/50)) stTop.guardPasses++;
        if(gHits>=3 && (top.gnp||50)>70 && rnd()<0.2*(dt/50)) stBot.cuts++;
        if(subTop>2.5) stTop.subAtt+=(dt/50);
        if(subBot>2.5) stBot.subAtt+=(dt/50);

        const heartR=1-(bot.heart*0.0016);
        const koGnp=clamp((top.power-bot.chin)/56,0,.72)*clamp(gnp/9,0,1)*0.62*(1-bot.fightIQ*0.0022)*heartR*topProf.koMod*0.32;
        const subChT=clamp((top.submission-bot.guard)/17,0,.84)*0.68*(1-bot.fightIQ*0.0022)*topProf.subMod*0.4*subWeightMult;
        const subChB=clamp((bot.submission-top.submission)/42,0,.7)*0.44*(1-top.fightIQ*0.0022)*botProf.subMod*0.4*subWeightMult;
        if(rnd()<subChT*(dt/50) && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'Soumission',round:r};(topIsA?st.A:st.B).sub++;}
        else if(rnd()<koGnp*(dt/50) && !(immuneA&&botF===A)){finish={by:topF,loser:botF,method:'KO/TKO',round:r,detail:'coups au sol'};(topIsA?st.A:st.B).kd++; stBot.wobbled++;}
        else if(rnd()<subChB*(dt/50) && !(immuneA&&topF===A)){finish={by:botF,loser:topF,method:'Soumission',round:r,detail:'par le bas'};(topIsA?st.B:st.A).sub++;}
        else {
          if(subChT>0.03) stBot.subEscapes+=(dt/50);
          if(subChB>0.03) stTop.subEscapes+=(dt/50);
          if(koGnp>0.15) stBot.wobbled+=(dt/50);
        }
        const isMe=topIsA; momentum=clamp(momentum+(isMe?RI(3,8):-RI(3,8)),5,95);
        const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
        tgt.dmgBody+=RI(0,2)*(dt/50); tgt.dmgHead+=RI(0,1)*(dt/50);
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
        if(top.topControl>bot.guard+20){
          txtPool.push(`${atk.name} plie ${def.name} au sol comme un vulgaire origami. L\u2019écart technique est embarrassant.`);
        }
        const botFat=topIsA?fatB:fatA;
        if(botFat>15 || bot.cardio<40){
          txtPool.push(`Écrasé sous le poids adverse, ${def.name} cherche de l\u2019oxygène qui n\u2019existe plus.`);
        }
        /* ==== [ANCRE: CORRECTIF_SUB_DANGER_MOTEUR] — voir ui-09 ==== */
        log.push({r,phase:'sol',top:topIsA?'A':'B',by:isMe?'me':'op',text:`[${formatTime(beatT)}] `+getUniqueLog(txtPool),momentum,sub:(subChT>0.03||subChB>0.03),snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
          finish.time=beatT;
          last.text=`[${formatTime(beatT)}] [CRITIQUE] L\u2019arbitre s\u2019interpose ! Victoire par ${finish.method} de ${finish.by.name}.`; }
        }
        if(!finish){
          const evadeCh=clamp((bot.footwork+bot.fightIQ-topFat*0.5)/280,0.06,0.28);
          if(rnd()<evadeCh*(dt/50)){
            if(rnd()<0.5){ topIsA=!topIsA; stBot.reversals++; }
            else { currentPhase='debout'; stBot.standups++; }
          }
        }
      } else if(currentPhase==='clinch'){
        const clinchA=(a.clinch*0.6+a.striking*0.25+a.power*0.15)*profA.clinchDmg-fatA;
        const clinchB=(b.clinch*0.6+b.striking*0.25+b.power*0.15)*profB.clinchDmg-fatB;
        const diff=clinchA-clinchB;
        if(Math.abs(diff)>8){
          const domIsA=diff>0; const dom=domIsA?A:B;
          const stDom=domIsA?st.A:st.B, stDef=domIsA?st.B:st.A;
          const hits=RI(0,4); (domIsA?st.A:st.B).sig+=hits*(dt/50); if(domIsA) dmgB+=hits*1.8*(dt/50); else dmgA+=hits*1.8*(dt/50);
          (domIsA?st.B:st.A).dmgBody+=RI(0,2)*(dt/50);
          // Frappes en clinch et contrôle
          const attHits=hits+RI(1,2);
          stDom.sigAtt+=attHits*(dt/50); stDom.clinchStrikes+=hits*(dt/50); stDom.clinchAtt+=attHits*(dt/50);
          stDom.total+=(hits+RI(1,2))*(dt/50); stDom.totalAtt+=(attHits+RI(2,3))*(dt/50);
          const bodyHits=hits*0.65, headHits=hits-bodyHits;
          stDom.sigBody+=bodyHits*(dt/50); stDom.bodyAtt+=(attHits*0.65)*(dt/50);
          stDom.sigHead+=headHits*(dt/50); stDom.headAtt+=(attHits*0.35)*(dt/50);
          if(hits>=2 && (domIsA?a.power:b.power)>65) stDom.powerStrikes+=(dt/50);
          const clSec=clamp(14+Math.abs(diff)*0.25,10,32);
          stDom.ctrl+=dt*(0.1/50); stDom.ctrlSec+=clSec*(dt/50); stDom.clinchCtrlSec+=clSec*(dt/50);
          momentum=clamp(momentum+(domIsA?RI(3,7):-RI(3,7)),5,95);
          if(rnd()<0.28*(dt/50)){ currentPhase='sol'; topIsA=domIsA; (domIsA?st.A:st.B).td++; stDom.tdAtt++;
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(beatT)}] ${dom.name} utilise son contrôle en clinch pour amener au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            if(rnd()<0.35*(dt/50)){ stDom.tdAtt++; stDef.tdDef++; }
            if(rnd()<dt/90){
            const clinchTxt=getUniqueLog([
              `${dom.name} étouffe son adversaire contre le grillage.`,
              `Lutte rugueuse le long de la cage à l’avantage de ${dom.name}.`,
              `${dom.name} pèse de tout son poids et place de petits coups vicieux.`,
              `Le clinch s’éternise, ${dom.name} grignote l’énergie adverse.`,
              `${dom.name} domine contre la cage avec ${Math.round(hits)} coups courts.`
            ]);
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(beatT)}] ${clinchTxt}`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
            }
          }
        } else {
          currentPhase='debout';
          log.push({r,phase:'clinch',by:'me',text:`[${formatTime(beatT)}] Séparation, le combat reprend au centre de la cage.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else { // debout
        const attA=giA*(0.55+rnd()*0.45), attB=giB*(0.55+rnd()*0.45);
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
          const tdChanceA=sigmoid((a.takedown-b.tdd)/15)*attA;
          if(rnd()<clamp(tdChanceA,0.05,0.85)*(dt/50)){ st.A.td++; currentPhase='sol'; topIsA=true;
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(beatT)}] Takedown validé par ${A.name} !`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            st.B.tdDef+=(dt/50);
            if(rnd()<dt/90) log.push({r,phase:'debout',by:'op',text:`[${formatTime(beatT)}] Bonne défense de ${B.name} sur la tentative d’amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else if(attB>0.14 && rnd()<0.18){ st.B.tdAtt+=(dt/50); handled=true;
          const tdChanceB=sigmoid((b.takedown-a.tdd)/15)*attB;
          if(rnd()<clamp(tdChanceB,0.05,0.85)*(dt/50)){ st.B.td++; currentPhase='sol'; topIsA=false;
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(beatT)}] Takedown explosif de ${B.name}, le combat passe au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            st.A.tdDef+=(dt/50);
            if(rnd()<dt/90) log.push({r,phase:'debout',by:'me',text:`[${formatTime(beatT)}] ${A.name} repousse une tentative d’amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        }
        if(!handled && currentPhase==='debout'){
          const offA=(a.striking*0.72+a.power*0.35+a.handSpeed*0.22+a.footwork*0.14+a.clinch*0.14*profA.clinchDmg+rEdge*0.85-b.footwork*0.2-b.fightIQ*0.14-fatA)*profA.sigVol;
          const offB=(b.striking*0.72+b.power*0.35+b.handSpeed*0.22+b.footwork*0.14+b.clinch*0.14*profB.clinchDmg-rEdge*0.85-a.footwork*0.2-a.fightIQ*0.14-fatB)*profB.sigVol;
          const noiseAmt=Math.round(6*noiseWeightMult);
          const pA=clamp(offA*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20), pB=clamp(offB*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20);
          sa+=pA*(dt/50);sb+=pB*(dt/50);dmgA+=clamp(offB*0.22*0.22,0,6)*(dt/50);dmgB+=clamp(offA*0.22*0.22,0,6)*(dt/50);
          const landedA=clamp(pA*0.5,0,10);
          const landedB=clamp(pB*0.5,0,10);
          st.A.sig+=landedA*(dt/50); st.B.sig+=landedB*(dt/50);

          // Tentatives et frappes debout pour A
          const accRateA=clamp(0.42+((a.handSpeed||50)*0.08+(a.discipline||50)*0.06-(b.footSpeed||50)*0.10-(b.footwork||50)*0.06)*0.003,0.30,0.65);
          const attA=Math.max(landedA,landedA/accRateA+((a.aggression||50)>60?RI(1,3):RI(0,1)));
          st.A.sigAtt+=attA*(dt/50); st.A.distStrikes+=landedA*(dt/50); st.A.distAtt+=attA*(dt/50);
          st.A.total+=(landedA+RI(1,3))*(dt/50); st.A.totalAtt+=(attA+RI(2,4))*(dt/50);
          const kickRatioA=clamp(((a.kick||50)/150)*0.45,0.10,0.45);
          const legA=landedA*kickRatioA*0.7;
          const bodyA=landedA*(0.22+((a.hook||50)>65?0.08:0));
          const headA=Math.max(0,landedA-legA-bodyA);
          st.A.sigHead+=headA*(dt/50); st.A.headAtt+=(attA*0.60)*(dt/50);
          st.A.sigBody+=bodyA*(dt/50); st.A.bodyAtt+=(attA*0.22)*(dt/50);
          st.A.sigLeg+=legA*(dt/50); st.A.legAtt+=(attA*0.18)*(dt/50);
          const pwrPctA=clamp(((a.power||50)*0.5+(a.cross||50)*0.25+(a.hook||50)*0.25)/100,0.15,0.65);
          st.A.powerStrikes+=(landedA*pwrPctA)*(dt/50);

          // Tentatives et frappes debout pour B
          const accRateB=clamp(0.42+((b.handSpeed||50)*0.08+(b.discipline||50)*0.06-(a.footSpeed||50)*0.10-(a.footwork||50)*0.06)*0.003,0.30,0.65);
          const attB=Math.max(landedB,landedB/accRateB+((b.aggression||50)>60?RI(1,3):RI(0,1)));
          st.B.sigAtt+=attB*(dt/50); st.B.distStrikes+=landedB*(dt/50); st.B.distAtt+=attB*(dt/50);
          st.B.total+=(landedB+RI(1,3))*(dt/50); st.B.totalAtt+=(attB+RI(2,4))*(dt/50);
          const kickRatioB=clamp(((b.kick||50)/150)*0.45,0.10,0.45);
          const legB=landedB*kickRatioB*0.7;
          const bodyB=landedB*(0.22+((b.hook||50)>65?0.08:0));
          const headB=Math.max(0,landedB-legB-bodyB);
          st.B.sigHead+=headB*(dt/50); st.B.headAtt+=(attB*0.60)*(dt/50);
          st.B.sigBody+=bodyB*(dt/50); st.B.bodyAtt+=(attB*0.22)*(dt/50);
          st.B.sigLeg+=legB*(dt/50); st.B.legAtt+=(attB*0.18)*(dt/50);
          const pwrPctB=clamp(((b.power||50)*0.5+(b.cross||50)*0.25+(b.hook||50)*0.25)/100,0.15,0.65);
          st.B.powerStrikes+=(landedB*pwrPctB)*(dt/50);

          // Impact des dégâts reçus (altération des déplacements et coupures)
          if(st.B.dmgLegs>15) b.footwork=Math.max(10,b.footwork*0.98);
          if(st.A.dmgLegs>15) a.footwork=Math.max(10,a.footwork*0.98);
          if(headA>=3 && ((a.cross||50)>75||(a.hook||50)>75) && rnd()<0.2*(dt/50)) st.B.cuts++;
          if(headB>=3 && ((b.cross||50)>75||(b.hook||50)>75) && rnd()<0.2*(dt/50)) st.A.cuts++;
          if(pA>=8 && rnd()<0.25*(dt/50)) st.B.wobbled++;
          if(pB>=8 && rnd()<0.25*(dt/50)) st.A.wobbled++;

          const koA=clamp((a.power-(b.chin-chinVulnB))/62,0,.93)*clamp((offA-offB)/62+0.46,0,1)*0.6*koWeightMult*(1-b.fightIQ*0.0022)*(1+a.killer*0.003)*(1-b.heart*0.0016)*profA.koMod*0.22;
          const koB=clamp((b.power-(a.chin-chinVulnA))/62,0,.93)*clamp((offB-offA)/62+0.46,0,1)*0.6*koWeightMult*(1-a.fightIQ*0.0022)*(1+b.killer*0.003)*(1-a.heart*0.0016)*profB.koMod*0.22;
          const isKdA=rnd()<koA*1.5*(dt/50), isKdB=!isKdA&&rnd()<koB*1.5*(dt/50);
          let kdText=null;
          if(isKdA){
            st.A.kd++; st.B.wobbled++;
            const finishChanceA=clamp(0.60*(1+((a.killer||50)-50)*0.003)*(1-((b.composure||50)-50)*0.003)*(1-((b.heart||50)-50)*0.002),0.25,0.85);
            if(rnd()<finishChanceA){ finish={by:A,loser:B,method:'KO/TKO',round:r}; }
            else kdText={by:'me',txt:`${A.name} envoie ${B.name} au tapis, mais l’arbitre laisse le combat continuer !`};
          }
          else if(isKdB){
            st.B.kd++; st.A.wobbled++;
            const finishChanceB=clamp(0.60*(1+((b.killer||50)-50)*0.003)*(1-((a.composure||50)-50)*0.003)*(1-((a.heart||50)-50)*0.002),0.25,0.85);
            if(!immuneA && rnd()<finishChanceB){ finish={by:B,loser:A,method:'KO/TKO',round:r}; }
            else kdText={by:'op',txt:`${B.name} envoie ${A.name} au tapis, mais l’arbitre laisse le combat continuer !`};
          }
          const isMe=rnd()<(offA/(offA+offB+1));
          momentum=clamp(momentum+(isMe?RI(4,9):-RI(4,9)),5,95);
          const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
          const rDmg=rnd(); if(rDmg<0.4) tgt.dmgHead+=RI(1,3)*(dt/50); else if(rDmg<0.7) tgt.dmgBody+=RI(1,3)*(dt/50); else tgt.dmgLegs+=RI(1,3)*(dt/50);
          /* ==== [ANCRE: HORLOGE_CONTINUE_DENSITE_LOG_DEBOUT] — même logique
             de densité qu'en phase sol : un knockdown ou une finition sont
             toujours journalisés, un échange ordinaire est échantillonné à
             (dt/50) pour retomber sur ~6 beats/round en moyenne quel que soit
             dt (voir ANCRE HORLOGE_CONTINUE_DENSITE_LOG ci-dessus). ==== */
          if(kdText || finish || rnd()<dt/90){
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
          if(satirePool.length===0){
            satirePool=[`${atk.name} touche avec une belle combinaison.`,`${atk.name} trouve l’ouverture en striking.`,`Superbe échange remporté par ${atk.name}.`,`Le bras arrière de ${atk.name} fait mouche.`,`${atk.name} casse la distance et punit.`,`${tgs.includes('Kick')?atk.name+' claque un lourd kick.':atk.name+' place une combinaison nette.'}`];
          }
          let txt=kdText?kdText.txt:getUniqueLog(satirePool);
          log.push({r,phase:'debout',by:kdText?kdText.by:(isMe?'me':'op'),text:`[${formatTime(beatT)}] `+txt,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
            finish.time=beatT;
            last.text=`[${formatTime(beatT)}] [CRITIQUE] KO foudroyant de ${finish.by.name} !`; }
          }
          if(!finish && rnd()<0.15*(dt/50)){ currentPhase='clinch'; }
        }
      }
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
    // Règles unifiées MMA : le dommage effectif (KD, sonné, frappes lourdes) prime.
    // 1 amenée = 1.5 frappe sig, 1 round complet de contrôle (1.2) = ~3.6 pts (critère secondaire)
    const rDiff=(rSigA-rSigB)+rPwrDiff*0.5+(rTdA-rTdB)*1.5+rSubDiff*1.2+rWobDiff*1.8+(rCtrlA-rCtrlB)*3+aggDiff;
    let sA=10,sB=10;
    if((rDiff>44&&kdDiff>=0)||kdDiff>=3){ sA=10;sB=7; }
    else if((rDiff>32&&kdDiff>=0)||kdDiff>=2){ sA=10;sB=8; }
    else if((rDiff>3&&kdDiff>=0)||kdDiff===1){ sA=10;sB=9; }
    else if((rDiff<-44&&kdDiff<=0)||kdDiff<=-3){ sA=7;sB=10; }
    else if((rDiff<-32&&kdDiff<=0)||kdDiff<=-2){ sA=8;sB=10; }
    else if((rDiff<-3&&kdDiff<=0)||kdDiff===-1){ sA=9;sB=10; }
    else if(rDiff>0){ sA=10;sB=9; } // bande serrée mais A garde un léger avantage réel
    else if(rDiff<0){ sA=9;sB=10; } // bande serrée mais B garde un léger avantage réel
    else { if(rnd()<0.5){sA=10;sB=9;} else {sA=9;sB=10;} } // égalité mathématique exacte, rarissime
    let j1=[sA,sB], j2=[sA,sB], j3=[sA,sB];
    const margin=Math.max(Math.abs(rDiff),Math.abs(kdDiff)*20);
    const dissent2=clamp(0.35-margin*0.004,0.04,0.35);
    const dissent3=clamp(0.15-margin*0.002,0.02,0.15);
    const dissentJudge=()=>{
      if(sA===10 && sB===9) return (Math.abs(rDiff)>20 ? [sA,sB] : [9,10]);
      if(sB===10 && sA===9) return (Math.abs(rDiff)>20 ? [sA,sB] : [10,9]);
      if(sA===10 && sB<9) return [10,sB+1];
      if(sB===10 && sA<9) return [sA+1,10];
      return [sA,sB];
    };
    if(rnd()<dissent2) j2=dissentJudge();
    if(rnd()<dissent3) j3=dissentJudge();
    j1A+=j1[0];j1B+=j1[1];j2A+=j2[0];j2B+=j2[1];j3A+=j3[0];j3B+=j3[1];
    /* ==== [ANCRE: HORLOGE_CONTINUE_ARRONDI] — les compteurs de st.A/st.B
       s'accumulent en valeur fractionnaire pendant toute la boucle de ticks
       (voir ANCRE HORLOGE_CONTINUE) : c'est ici, en figeant les totaux du
       round pour l'affichage des cartes de juges, que l'arrondi intervient
       pour la première fois — jamais avant. `ctrl` (utilisé par
       formatCtrl()) reste volontairement en valeur fractionnaire. ==== */
    roundStats.push({
      r,j1,j2,j3,
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
    // Adaptation tactique de fin de round
    if(sA<sB){
      const adaptA=clamp(((a.adaptability||50)-50)*0.08,0,4);
      a.fightIQ=clamp(a.fightIQ+adaptA,1,150);
      a.footwork=clamp(a.footwork+adaptA*0.5,1,150);
    } else if(sB<sA){
      const adaptB=clamp(((b.adaptability||50)-50)*0.08,0,4);
      b.fightIQ=clamp(b.fightIQ+adaptB,1,150);
      b.footwork=clamp(b.footwork+adaptB*0.5,1,150);
    }
    // ==== [ANCRE: RECUP_INTER_ROUND] — la minute de repos entre rounds allège
    // une partie des dégâts accumulés, proportionnellement à la vraie stat de
    // récupération (pas la fatigue/cardio, qui reste dérivée à chaque round). ====
    dmgA=Math.max(0,dmgA-(A.attrs.recovery||50)*0.15);
    dmgB=Math.max(0,dmgB-(B.attrs.recovery||50)*0.15);
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
    const votesA=[j1A>j1B,j2A>j2B,j3A>j3B].filter(Boolean).length;
    const votesB=[j1A<j1B,j2A<j2B,j3A<j3B].filter(Boolean).length;
    if(votesA===votesB){ res={winner:'D',method:'Égalité'}; }
    else { const winnerSide=votesA>votesB?'A':'B'; const unanimous=votesA===3||votesB===3;
      res={winner:winnerSide,method:unanimous?'Décision':'Décision partagée'}; }
    // ==== [FIN ANCRE] ====
  }
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
    'dmgHead','dmgBody','dmgLegs','kd','wobbled','cuts','sub'];
  ['A', 'B'].forEach(side => {
    const s = st[side];
    INT_ROUND_FIELDS.forEach(k=>{ s[k]=Math.round(s[k]); });
    s.sigAtt = Math.max(s.sigAtt, s.sig);
    s.total = Math.max(s.total, s.sig);
    s.totalAtt = Math.max(s.totalAtt, s.sigAtt, s.total);
    s.tdAtt = Math.max(s.tdAtt, s.td);
    s.ctrlSec = Math.max(0, s.ctrlSec);
  });
  /* ==== [FIN ANCRE] ==== */
  res.log=log; res.stats=st;
  return res;
}
/* ==== [ANCRE: P1_FORME_MORAL_COUT_COMBAT] — Lot P1/2026, chantier
   d'équilibrage (harnais tools/monte-carlo.js) : diagnostic sur 200
   carrières avant ce correctif — forme >=95 dans 71.9% des combats
   (moral : 32.4%), gain moyen théorique de moral à la victoire RI(6,12)
   quasi entièrement absorbé par le clamp dès que le moral dépassait 90
   (delta réel observé +2.3 au lieu de +9.0 théorique). Le gain de moral à
   la victoire est réduit (RI(6,12) -> RI(2,7)) : une victoire reste
   toujours un gain net, jamais un coût, mais n'entretient plus à elle
   seule un plafond permanent — voir aussi P1_FORME_MORAL_COUT_FORME
   juste en dessous (le coût de forme, lui, touche aussi les victoires :
   "le corps encaisse" même en gagnant). ==== */
function applyResult(F,opp,res,side){ const isDraw=res.winner==='D'; const win=!isDraw&&res.winner===side; const m=res.method;
  if(isDraw){ F.D=(F.D||0)+1; F.morale=clamp(F.morale+RI(-2,2),0,100); }
  else if(win){ F.W++; F.streak=Math.max(1,F.streak+1); if(m.startsWith('KO'))F.ko++; else if(m.startsWith('Soum'))F.sub++; else F.dec++; F.morale=clamp(F.morale+RI(2,7),0,100); }
  else { F.L++; F.streak=Math.min(-1,F.streak-1); if(m.startsWith('KO'))F.koLoss++; F.morale=clamp(F.morale-RI(8,16),0,100); }
  /* ==== [ANCRE: V2-38] — "bilan maison" par organisation, en plus du
     palmarès pro global (F.W/F.L, qui ne se remet jamais à zéro après le
     seul passage amateur→pro, turnPro()) : un nouvel objectif de
     progression demandé par le document, jamais un remplacement du
     palmarès existant. Réservé au joueur en carrière pro (F===G.f, jamais
     les PNJ simulés par advanceRoster()/rankPool() ni les combats Faith/
     Gauntlet, hors périmètre de cet item). ==== */
  if(typeof G!=='undefined' && G && F===G.f && F.stage==='pro' && F.org>0){
    if(!F.orgRecords) F.orgRecords={};
    const rec=F.orgRecords[F.org]||(F.orgRecords[F.org]={W:0,L:0,D:0});
    if(isDraw) rec.D=(rec.D||0)+1; else if(win) rec.W++; else rec.L++;
  }
  /* ==== [ANCRE: P1_FORME_MORAL_COUT_FORME] — même lot que P1_FORME_MORAL_
     COUT_COMBAT ci-dessus. Avant ce correctif, la forme montait à la
     victoire (+RI(3,8)) exactement comme un attribut entraîné — aucun
     combat, gagné ou perdu, ne coûtait jamais rien au corps, seul le
     clamp(0,100) finissait par arrêter la hausse. "Le corps encaisse"
     (item demandé) : une victoire coûte désormais un peu de forme (encaisser
     des coups reste un combat, même gagné), une défaite en coûte
     nettement plus, un match nul un peu — jamais un gain net pour la
     forme à l'issue d'un combat, seul un entraînement/repos peut la
     faire remonter (cf. regressToBaseline(), engine-progression.js). ==== */
  F.form=clamp(F.form-(win?RI(1,4):isDraw?RI(1,3):RI(5,12)),0,100);
  // ==== [ANCRE: META04_06] — planchers de moral. Le jeu n'a pas de système de
  // popularité distinct : ces deux compétences sont adaptées sur `morale`,
  // le champ existant le plus proche (au lieu d'un f.pop qui n'existe pas). ====
  if(F.skills&&F.skills.includes('meta06')){ if(F.morale<75) F.morale=75; }
  else if(F.skills&&F.skills.includes('meta04')){ if(F.morale<45) F.morale=45; }
  // ==== [FIN ANCRE] ====
  // OPTIMISATION MÉMOIRE — seul le profil du joueur conserve l'historique narratif
  // détaillé (vérifié : aucun affichage ne lit jamais l'historique d'un PNJ, seuls
  // last5()/scr_history()/l'succès a4 lisent G.f.history spécifiquement).
  if(G.f && F.id===G.f.id){
    /* ==== [ANCRE: HUB_COMBAT_HISTORY_FIELDS] — Lot P3/2026 : le sous-menu
       Combat du hub (ui-06 scr_hub) affiche le surnom et le rang de
       l'adversaire au moment du combat, absents jusqu'ici. oppNick est pris
       directement sur l'objet opp (jamais recherché via oppId dans le
       roster ensuite : le roster est régénéré et l'objet d'origine
       disparaît). oppRank réutilise divRank(), la fonction de classement
       déjà en place — ui-05 (resolveFight, ANCRE HISTORIQUE_ENRICHI)
       écrase cette valeur juste après avec le rang capturé AVANT le combat
       (oppRankBefore), plus correct pour l'affichage joueur ; ce calcul ici
       ne sert donc de valeur par défaut que pour un futur appel de
       applyResult() sur G.f qui ne passerait pas par ce chemin d'écran.
       Mise à jour Lot P6/2026 (horloge continue) : la simulation dispose
       désormais d'un horodatage réel de finition (res.finishTimeStr, cf.
       ANCRE HORLOGE_CONTINUE_FINISH_TIME dans simulateFight) — `time` est
       donc bien ajouté ici (null pour une décision, faute de finition à
       horodater — jamais fabriqué ; comme pour toute entrée d'historique
       antérieure à ce lot, où le champ est simplement absent, hubCombatHtml
       en ui-06-career-screens.js sait déjà omettre les deux cas proprement). ==== */
    F.history.push({res:isDraw?'draw':(win?'win':'loss'),method:m,round:res.round||null,time:res.finishTimeStr||null,oppId:opp&&opp.id,
      oppName:opp&&opp.name,oppFlag:opp&&opp.flag,oppNick:opp&&opp.nick,oppWasChamp:!!(opp&&opp.champion),oppRecord:opp?`${opp.W}-${opp.L}`:null,oppElo:opp&&opp.orgElo,
      oppRank:opp?divRank(opp):null});
    if(F.history.length>60)F.history=F.history.slice(-60);
  }
  return win;
}
/* ------------------ FINISHERS SIGNATURE — noms de finish débloqués par compétence ---------------- */
const FINISH_MOVES={
 sub:[
  {id:'bjj29',name:'étranglement Anaconda',zone:'tête'},{id:'bjj30',name:'Peruvian Necktie',zone:'tête'},
  {id:'bjj35',name:'clé de cheville éclair',zone:'jambes'},{id:'bjj36',name:'Twister',zone:'jambes'},
  {id:'bjj39',name:'étranglement invisible',zone:'tête'},{id:'bjj40',name:'toile de soumissions sans fin',zone:'tête'},
  {id:'sambo29',name:'clé arrachée à la force brute',zone:'jambes'},{id:'sambo35',name:'clé de jambe fatale',zone:'jambes'},
  {id:'sambo38',name:'broyage articulaire',zone:'jambes'},{id:'sambo40',name:'double clé du Dernier Empereur',zone:'jambes'},
 ],
 ko:[
  {id:'karate28',name:'direct du samouraï',zone:'tête'},{id:'karate20',name:'coup de pied en crochet à l\u2019angle mort',zone:'tête'},
  {id:'boxer28',name:'crochet qui termine tout',zone:'tête'},{id:'boxer33',name:'uppercut surgi de nulle part',zone:'tête'},
  {id:'boxer36',name:'frappe qu\u2019on ne voit jamais partir',zone:'tête'},{id:'boxer40',name:'coup de l\u2019Interrupteur',zone:'tête'},
  {id:'kb28',name:'high kick mortel',zone:'tête'},{id:'kb40',name:'tibia du Cro Cop',zone:'tête'},
  {id:'mt30',name:'coude du chirurgien',zone:'tête'},{id:'mt35',name:'genou assassin',zone:'corps'},{id:'mt40',name:'tibia de l\u2019Héritier de Buakaw',zone:'jambes'},
  {id:'wrestler40',name:'takedown destructeur',zone:'corps'},{id:'sambo37',name:'enclume du Tsar',zone:'corps'},
  {id:'mma30',name:'Ground and Pound de l\u2019enfer',zone:'tête'},{id:'mma37',name:'instinct de destruction',zone:'tête'},
 ]
};
// ==== [ANCRE: FINITIONS_GENERIQUES_REFONTE] — remplace l'ancien pool de
// finitions génériques (qui mélangeait noms de coups et phrases descriptives,
// ex. "crochet au foie qui coupe les jambes") par des noms de coups PROPRES
// uniquement — chacun avec sa propre variante "signature" dédiée (voir
// MOVE_SIGNATURE_FLAVOR ci-dessous), au lieu d'un message générique unique.
const GENERIC_SUB=[
  {name:'Kimura',zone:'corps'},{name:'Americana',zone:'corps'},{name:'Armbar',zone:'corps'},
  {name:'Triangle',zone:'tête'},{name:'Rear Naked Choke',zone:'tête'},{name:'Guillotine',zone:'tête'},
  {name:'Anaconda',zone:'tête'},{name:'Twister',zone:'corps'},{name:'Heel Hook',zone:'jambes'},
  {name:'Clé de cheville',zone:'jambes'}
];
const GENERIC_KO=[
  {name:'Crochet',zone:'tête'},{name:'Uppercut',zone:'tête'},{name:'Overhand',zone:'tête'},
  {name:'Jab chanceux',zone:'tête'},{name:'Direct puissant',zone:'tête'},{name:'Marteau au sol',zone:'tête'},
  {name:'Coup de genou sauté',zone:'tête'},{name:'Coup de coude retourné',zone:'tête'},
  {name:'Coup de pied au corps',zone:'corps'},{name:'Coup de genou au corps',zone:'corps'},{name:'Crochet au foie',zone:'corps'},
  {name:'Low kick',zone:'jambes'},{name:'Calf kick',zone:'jambes'},
  {name:'High kick',zone:'tête'},{name:'Coup de pied retourné',zone:'tête'},{name:'Superman punch',zone:'tête'}
];
// Une variante narrative dédiée par coup, utilisée à la fois pour le
// déblocage du mouvement signature et pour ses répétitions ultérieures.
const MOVE_SIGNATURE_FLAVOR={
  'Crochet':'Le crochet est devenu sa signature — un mensonge qui arrive toujours de là où on l\u2019attend.',
  'Uppercut':'L\u2019uppercut est devenu sa signature — droit sous le menton, à chaque fois.',
  'Overhand':'L\u2019overhand est devenu sa signature — une bombe qui passe par-dessus la garde.',
  'Jab chanceux':'Le jab chanceux est devenu sa signature — un coup de rien qui finit tout.',
  'Direct puissant':'Le direct puissant est devenu sa signature — la ligne la plus courte vers le KO.',
  'Marteau au sol':'Le marteau au sol est devenu sa signature — implacable une fois l\u2019adversaire à terre.',
  'Coup de genou sauté':'Le genou sauté est devenu sa signature — personne ne voit le décollage venir.',
  'Coup de coude retourné':'Le coude retourné est devenu sa signature — un geste qu\u2019on ne voit qu\u2019une fois.',
  'Coup de pied au corps':'Le coup de pied au corps est devenu sa signature — il vide les poumons un round à l\u2019avance.',
  'Coup de genou au corps':'Le genou au corps est devenu sa signature — plié en deux, à chaque clinch.',
  'Crochet au foie':'Le crochet au foie est devenu sa signature — personne ne s\u2019en relève à temps.',
  'Low kick':'Le low kick est devenu sa signature — il ne casse pas l\u2019adversaire, il l\u2019use.',
  'Calf kick':'Le calf kick est devenu sa signature — la jambe d\u2019appui cède avant le mental.',
  'High kick':'Le high kick est devenu sa signature — une explosion qui vient de nulle part.',
  'Coup de pied retourné':'Le coup de pied retourné est devenu sa signature — le dos tourné, l\u2019instant d\u2019avant.',
  'Superman punch':'Le superman punch est devenu sa signature — il s\u2019envole avant de frapper.',
  'Kimura':'Le kimura est devenu sa signature — l\u2019épaule cède avant la fierté.',
  'Americana':'L\u2019americana est devenue sa signature — le bras plaqué au sol, sans échappatoire.',
  'Armbar':'L\u2019armbar est devenu sa signature — le coude tendu jusqu\u2019au point de rupture.',
  'Triangle':'Le triangle est devenu sa signature — les jambes se referment, l\u2019air disparaît.',
  'Rear Naked Choke':'Le rear naked choke est devenu sa signature — accroché dans le dos, inévitable.',
  'Guillotine':'La guillotine est devenue sa signature — la tête coincée dès le premier contact.',
  'Anaconda':'L\u2019anaconda est devenu sa signature — un étau qui se resserre sans prévenir.',
  'Twister':'Le twister est devenu sa signature — la colonne tordue jusqu\u2019à l\u2019abandon.',
  'Heel Hook':'Le heel hook est devenu sa signature — le genou cède avant que ça fasse mal.',
  'Clé de cheville':'La clé de cheville est devenue sa signature — la cheville plie, l\u2019adversaire tape.'
};
function pickFinishMove(winner,type,zone,fightStats,round){ // type: 'sub' ou 'ko' — priorité aux compétences signature possédées, puis à la zone la plus endommagée
  // Mouvement signature (#6) : si le combattant a déjà déverrouillé une prise
  // signature (5 finitions identiques auparavant), 40% de chance de la rejouer
  // directement plutôt que de repartir sur le tirage normal.
  /* ==== [ANCRE: CORRECTIF_ZONE_AFFICHEE] — bug remonté : « Soumission (clé de
     jambe fatale) — CORPS ». La zone AFFICHÉE venait de res.zone (zone la plus
     endommagée du perdant), jamais du geste réellement joué. Trois chemins la
     désynchronisaient : (1) le rejeu de signature ci-dessous ne renvoyait
     aucune zone, (2) le repli `candidates=owned` quand aucun geste possédé ne
     matche la zone, (3) le repli `pick(generic)` quand aucun générique ne
     matche. On renvoie désormais la zone PROPRE du geste choisi ; l'appelant
     s'en sert pour l'affichage. La zone de dégâts reste inchangée côté
     mécanique (SIGNATURE_BOOST_BY_ZONE lit toujours `zone`). ==== */
  const zoneOfGeneric=n=>{ const g=(type==='sub'?GENERIC_SUB:GENERIC_KO).find(m=>m.name===n); return g?g.zone:null; };
  const zoneOfOwned=n=>{ const o=FINISH_MOVES[type].find(m=>m.name===n); return o?o.zone:null; };
  if(winner.signatureMove && winner.signatureMove.type===type && rnd()<0.40){
    const _n=winner.signatureMove.name;
    return {name:_n, moveZone:zoneOfOwned(_n)||zoneOfGeneric(_n)||winner.signatureMove.zone||null, flavor:MOVE_SIGNATURE_FLAVOR[_n]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.'};
  }
  const owned=(winner.skills||[]).filter(id=>FINISH_MOVES[type].some(m=>m.id===id));
  let baseMove;
  // ==== [ANCRE: CORRECTIF_ZONE_MOUVEMENT_ACQUIS] — bug trouvé : un geste
  // possédé (compétence débloquée) était choisi sans jamais vérifier sa zone
  // propre contre la zone réellement la plus endommagée (finishZone) — un
  // Heel Hook (jambes) pouvait ainsi être narré sur un KO déclenché par des
  // dégâts à la tête. On restreint désormais la sélection aux gestes possédés
  // dont la zone correspond, quand au moins un correspond ; sinon on retombe
  // sur l'ensemble des gestes possédés (mieux vaut un geste possédé mal zoné
  // qu'un geste totalement générique).
  if(owned.length && rnd()<0.6){
    let candidates=owned;
    if(zone){ const zoneMatches=owned.filter(id=>FINISH_MOVES[type].find(m=>m.id===id).zone===zone); if(zoneMatches.length) candidates=zoneMatches; }
    const chosenId=pick(candidates); baseMove=FINISH_MOVES[type].find(m=>m.id===chosenId).name;
  }
  else{ const generic=type==='sub'?GENERIC_SUB:GENERIC_KO; const zoned=zone?generic.filter(m=>m.zone===zone):[]; baseMove=(zoned.length?pick(zoned):pick(generic)).name; }
  // Comptage des finitions identiques — au 5e succès avec le même geste, il
  // devient signature : compétence unique + boost de stat + 40% de retour
  // automatique désormais géré ci-dessus.
  if(!winner.finishMoveCounts) winner.finishMoveCounts={};
  const key=type+':'+baseMove;
  winner.finishMoveCounts[key]=(winner.finishMoveCounts[key]||0)+1;
  let flavor=null;
  if(!winner.signatureMove && winner.finishMoveCounts[key]>=5){
    /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
       customSuffix (null tant que le joueur n'a pas validé un complément
       libre) et locked (figé une fois validé, cf. CL.setSignatureSuffix
       ci-dessous dans ui-08). Le nom de base (baseMove) n'est JAMAIS
       remplacé — customSuffix s'affiche uniquement en complément. ==== */
    winner.signatureMove={name:baseMove,type,zone,customSuffix:null,locked:false};
    /* ==== [FIN ANCRE] ==== */
    // ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_DIFFERENCIE] — bug trouvé : TOUS
    // les mouvements signature donnaient exactement le même boost (submission+
    // killer pour toute soumission, power+killer pour tout KO), peu importe le
    // geste réel. Le boost dépend désormais de la ZONE ciblée par le geste
    // (tête/corps/jambes), cohérent avec ce que le geste représente : une
    // soumission à la tête (étranglement) récompense le cardio/contrôle, une
    // soumission au corps (clé de bras) récompense la force, une soumission
    // aux jambes récompense l'explosivité ; un KO à la tête récompense la
    // puissance pure, au corps l'endurance à encaisser en pression, aux jambes
    // l'explosivité des coups de pied. Table définie une seule fois au niveau
    // module (SIGNATURE_BOOST_BY_ZONE plus bas) — réutilisée telle quelle par
    // signatureMoveCard() côté affichage, pour ne jamais désynchroniser le
    // texte montré au joueur du boost réellement appliqué.
    const boostKeys=(SIGNATURE_BOOST_BY_ZONE[type]&&SIGNATURE_BOOST_BY_ZONE[type][zone])||(type==='sub'?['submission','killer']:['power','killer']);
    boostKeys.forEach(k=>{ winner.attrs[k]=clamp((winner.attrs[k]||50)+SIGNATURE_BOOST_PTS,1,100); });
    winner.overall=overall(winner);
    const skillId='sig_'+baseMove.replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,20);
    if(!(winner.skills||[]).includes(skillId)){
      grantSkill(winner,{id:skillId,name:baseMove+' (Signature)',rar:'M',fx:{},desc:`${winner.name} a répété ce geste jusqu\u2019à le rendre inévitable : ${baseMove}, désormais sa marque de fabrique.`,tags:['Signature']});
    }
    flavor=`MOUVEMENT SIGNATURE DÉBLOQUÉ : ${MOVE_SIGNATURE_FLAVOR[baseMove]||baseMove+' devient sa marque de fabrique.'}`;
  }
  // ==== [ANCRE: CORRECTIF_FLAVOR_SIGNATURE_MANQUANT] — bug trouvé : le texte
  // signature ne s'affichait QUE dans deux cas précis : le tout premier
  // déblocage (une fois dans toute la carrière), et le chemin de "rejeu
  // délibéré" (40% de chance, tiré au tout début de la fonction). Si le geste
  // signature était retrouvé par le tirage normal (les 60% restants — d'où le
  // "2/3 du temps" remonté), aucun texte n'était attaché, alors que c'était
  // pourtant bien le même geste. On rattache maintenant systématiquement le
  // flavor signature dès que baseMove correspond au geste signature déjà
  // déverrouillé, quel que soit le chemin qui l'a sélectionné.
  if(!flavor && winner.signatureMove && winner.signatureMove.type===type && winner.signatureMove.name===baseMove){
    flavor=MOVE_SIGNATURE_FLAVOR[baseMove]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.';
  }
  if(fightStats && !flavor){
    const isLate=(round||1)>=3;
    const isBloodbath=(fightStats.A.dmgHead+fightStats.B.dmgHead)>40;
    const isBoring=(fightStats.A.sig+fightStats.B.sig)<30 && !isBloodbath;
    if(isBloodbath && type==='ko') flavor='La commission médicale doit intervenir en urgence.';
    else if(isBoring && isLate) flavor='Sorti de nulle part — le public somnolent se réveille enfin.';
  }
  return {name:baseMove, moveZone:zoneOfOwned(baseMove)||zoneOfGeneric(baseMove)||null, flavor};
}
function winProbEstimate(A,B){ const a=eff(A),b=eff(B);
  const oa=A.overall+a.killer*0.05+reachEdge(A,B), ob=B.overall+b.killer*0.05;
  let p=sigmoid((oa-ob)/12); p=clamp(p*100+RI(-8,8),3,97)/100; return p; // bruit volontaire
}

