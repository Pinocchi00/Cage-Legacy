"use strict";
/* CAGE LEGACY — js/ui-09-arena.js
   ============================================================================
   Moteur de rendu Canvas 2D de l'arène : état ARENA, boucle d'animation par
   beat (démarrage/pause/reprise), système de particules générique, silhouette
   des combattants, aberration chromatique au KO, moments de bascule et leur
   résolution, prévisualisations Canvas du Marché noir/de la boutique.

   Extrait de ui-08-controller-arena.js (F-07, passe d'hygiène technique) :
   ce fichier n'appartient PAS au découpage d'origine de l'ancien ui.js
   monolithique (8 fichiers) — c'est un second découpage, ultérieur, qui isole
   le moteur de rendu autonome du reste du contrôleur (CL). L'ORDRE RELATIF
   des fonctions déplacées est strictement préservé (aucun réordonnancement),
   seule la frontière de fichier a changé.

   Chargé APRÈS ui-08 (fin d'ordre de chargement, avant main.js) : les écrans
   qui référencent ce moteur (scr_arena, scr_fight_flash,
   scr_faith_fight_pending, scr_consumable_preview — restés dans ui-08 car
   référencés PAR NOM dans l'objet SCREENS, évalué au chargement du script,
   donc AVANT que ce fichier n'existe si l'ordre était inversé) ne l'appellent
   que depuis des corps de fonction exécutés bien après la fin du chargement
   de tous les scripts (rendu déclenché par une action du joueur ou par
   main.js) — jamais au chargement de la page elle-même. setArenaCosmeticTheme()
   et getArenaTheme() restent eux aussi dans ui-08, pour la même raison
   (utilisés indirectement par le catalogue de la boutique, ui-07, avant que
   ce fichier ne soit garanti chargé). Portée globale partagée avec le reste
   du jeu, comme tous les fichiers ui-0X — pas de module, pas d'export autre
   que window.CL (posé dans ui-08).
   ============================================================================ */
/* ============================ ARÈNE 2D & HYBRIDE ========================== */
/* Rejoue le combat round par round à partir de res.log (maintenant granulaire :
   plusieurs sous-événements textuels par round, momentum, dégâts par zone),
   en cohérence stricte avec le résultat du moteur (même vainqueur, méthode,
   round). Silhouettes dans la DA archive : oxblood = joueur, sage = adversaire.
   res.rounds n'existe pas (le champ réel est res.round, singulier) — corrigé
   ici par rapport au brouillon reçu. */
let ARENA=null;
/* ==== [ANCRE: V2-28] — BEAT_MS n'est plus une constante figée : le réglage
   Rythme de combat (G.settings.fightPace, persisté) l'ajuste au lancement
   de startArena() — Intégral prend plus de temps par beat pour tout
   laisser lire, Rapide (défaut) garde le rythme d'origine. Instantané ne
   passe jamais par ARENA du tout (cf. render(), scr_fight_flash). */
let BEAT_MS=750; // ralenti pour laisser le temps de lire le flux narratif
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
  /* ==== [ANCRE: V2-28] — Rythme de combat : Intégral prend son temps
     (beat plus long, on voit tout), Rapide (défaut) garde le rythme
     d'origine. Instantané ne passe jamais ici (cf. render()). */
  BEAT_MS=(((G.settings&&G.settings.fightPace)||'rapide')==='integral')?1050:750;
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
        ARENA.roundPause=true; ARENA.pendingBeatIdx=bi; ARENA.pauseHandledFor=bi;
        /* ==== [ANCRE: V2-29] — moment de bascule détecté sur la reprise qui
           vient de se terminer, à partir de l'état RÉEL de la simulation
           (momentum/phase des beats de cette reprise) — jamais à chaque
           reprise (règle 6), plafonné à 3 par combat (ARENA.basculeCount). */
        const moment=detectBascule(prevRound);
        if(moment) ARENA.basculePending={kind:moment.kind};
        renderArenaOverlay(); return;
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
/* ==== [ANCRE: V2-29] — même mécanisme de reprise que "Round suivant"
   (recalculer pauseOffset pour retomber pile sur pendingBeatIdx, relever
   roundPause, relancer la boucle) : nextRound() ET continueAfterBascule()
   partagent ce point unique plutôt que de dupliquer le calcul. */
function resumeArenaPlayback(){
  ARENA.pauseOffset=performance.now()-ARENA.t0-(ARENA.pendingBeatIdx||0)*BEAT_MS;
  ARENA.roundPause=false;
  if(ARENA.loopFn) ARENA.raf=requestAnimationFrame(ARENA.loopFn);
}
function renderArenaOverlay(){ const el=document.getElementById('ar-log'); if(!el) return;
  if(ARENA.basculePending){ renderBasculeOverlay(el); return; }
  const finishedRound=ARENA.beats[ARENA.lastBeat]?(ARENA.beats[ARENA.lastBeat].round||1):1;
  el.innerHTML=`<div style="text-align:center"><b class="gold">Fin du round ${finishedRound}</b><br><button class="btn primary" style="margin-top:8px;padding:8px" onclick="CL.nextRound()">Round suivant ▸</button></div>`;
}
/* ==== [ANCRE: V2-29] — les moments de bascule. Faute de flags dédiés dans
   le log du moteur (pas de "sonné"/"coupure"/"dos à la cage" — cf. beat
   shape réelle : phase/by/momentum/snapA/snapB seulement), les 4
   situations ci-dessous sont dérivées de l'état RÉEL de la reprise qui
   vient de se jouer (momentum de fin de round, domination en clinch) —
   jamais fabriquées. Format imposé : une phrase de situation, 3 options,
   aucun chiffre, conséquence en une phrase. */
const BASCULE_MOMENTS={
  sonne_lui:{situation:'Il recule, les jambes molles. La cage est derrière lui.',
    options:[
      {label:'Se jeter dessus',stat:'killer',oppStat:'chin',
        successMsg:'Vous ne le laissez pas respirer — il craque un peu plus.',
        failMsg:'Il vous accroche au passage : vous ralentissez, groggy vous aussi.'},
      {label:'Rester structuré et le cueillir',stat:'composure',oppStat:'chin',
        successMsg:'Vous le cueillez proprement, sans vous exposer.',
        failMsg:'Il tient bon, et la reprise se referme sans rien de plus.'},
      {label:'Le laisser revenir et garder le round',stat:'fightIQ',oppStat:'heart',
        successMsg:'Vous gardez le contrôle de la reprise, sans risque inutile.',
        failMsg:'Il revient dans le round : l’occasion est passée.'}
    ]},
  sonne_moi:{situation:'Vous encaissez, les jambes molles. Il sent l’occasion.',
    options:[
      {label:'Se réfugier au clinch',stat:'clinchStr',oppStat:'power',
        successMsg:'Vous vous accrochez à lui, le temps que la tête se remette en place.',
        failMsg:'Il vous décolle du clinch et continue d’appuyer.'},
      {label:'Reculer et respirer',stat:'footSpeed',oppStat:'aggression',
        successMsg:'Vous sortez de l’axe, il ne vous rattrape pas.',
        failMsg:'Il coupe la cage et vous retrouve contre la grille.'},
      {label:'Répondre pour le faire douter',stat:'heart',oppStat:'composure',
        successMsg:'Votre réponse le fait hésiter une seconde de trop.',
        failMsg:'Il encaisse sans broncher et continue d’avancer.'}
    ]},
  clinch:{situation:'Dos à la cage, il vous contrôle en clinch depuis un moment.',
    options:[
      {label:'Forcer la sortie tout de suite',stat:'strength',oppStat:'clinchStr',
        successMsg:'Vous vous dégagez, retour au centre de la cage.',
        failMsg:'Vous forcez pour rien : il vous replaque contre la grille.'},
      {label:'Attendre l’ouverture pour sortir',stat:'fightIQ',oppStat:'topControl',
        successMsg:'Vous sentez le bon moment et sortez proprement.',
        failMsg:'L’ouverture ne vient jamais : la reprise se termine collé à la grille.'},
      {label:'Accepter la position et encaisser au score',stat:'discipline',oppStat:'clinchStr',
        successMsg:'Vous limitez les dégâts, sans paniquer.',
        failMsg:'Il en profite pour accumuler les coups au corps.'}
    ]},
  serre:{situation:'Round qui se joue à rien, dans les dernières secondes.',
    options:[
      {label:'Se jeter dans un dernier échange',stat:'aggression',oppStat:'chin',
        successMsg:'Vous prenez la reprise sur ce dernier coup d’éclat.',
        failMsg:'L’échange tourne à votre désavantage sur la cloche.'},
      {label:'Sécuriser ce qui est déjà fait',stat:'discipline',oppStat:'fightIQ',
        successMsg:'Vous gérez la fin de round sans rien risquer.',
        failMsg:'Trop passif : les juges retiennent surtout sa fin de round à lui.'},
      {label:'Chercher l’amenée pour finir en contrôle',stat:'takedown',oppStat:'tdd',
        successMsg:'L’amenée passe, vous terminez le round au-dessus.',
        failMsg:'L’amenée échoue, vous perdez le peu de temps qu’il restait.'}
    ]}
};
/** Dérive un éventuel moment de bascule de la reprise qui vient de se
 * jouer, jamais fabriqué : lu sur les beats réels de cette reprise.
 * @param {number} round @returns {{kind:string}|null} */
function detectBascule(round){
  // V2-44 : réglage Moments de bascule (activés par défaut), Réglages, ui-06.
  if(G.settings && G.settings.basculeEnabled===false) return null;
  if((ARENA.basculeCount||0)>=3) return null;
  const roundBeats=ARENA.beats.filter(b=>b.round===round && b.phase!=='bell');
  if(!roundBeats.length) return null;
  const last=roundBeats[roundBeats.length-1];
  const lastM=(last.momentum!=null)?last.momentum:50;
  const clinchDom=roundBeats.filter(b=>b.phase==='clinch'&&b.by==='op').length>=3;
  if(clinchDom && rnd()<0.6) return {kind:'clinch'};
  if(lastM>=78 && rnd()<0.55) return {kind:'sonne_lui'};
  if(lastM<=22 && rnd()<0.55) return {kind:'sonne_moi'};
  if(Math.abs(lastM-50)<=8 && rnd()<0.35) return {kind:'serre'};
  return null;
}
/** Chance de succès pondérée par l'attribut du joueur contre celui
 * de l'adversaire sur le point précis de l'option — jamais un tirage à
 * plat, jamais un chiffre affiché au joueur.
 * @param {object} opt @returns {boolean} */
function resolveBasculeOption(opt){
  const f=G.f, opp=(G.fight&&G.fight.opp)||{};
  const my=(f.attrs&&f.attrs[opt.stat])!=null?f.attrs[opt.stat]:50;
  const their=(opp.attrs&&opp.attrs[opt.oppStat])!=null?opp.attrs[opt.oppStat]:50;
  const chance=clamp(50+(my-their)/2,10,90);
  return rnd()*100<chance;
}
function renderBasculeOverlay(el){
  const b=ARENA.basculePending, m=BASCULE_MOMENTS[b.kind]; if(!m) return;
  if(b.resultMsg){
    el.innerHTML=`<div style="text-align:center"><div class="small" style="color:var(--gold)">${esc(b.resultMsg)}</div>
      <button class="btn primary" style="margin-top:8px;padding:8px" onclick="CL.continueAfterBascule()">Continuer ▸</button></div>`;
    return;
  }
  el.innerHTML=`<div style="text-align:left">
    <div class="small mb">${esc(m.situation)}</div>
    ${m.options.map((o,i)=>`<button class="btn ghost" style="display:block;width:100%;margin-top:6px;padding:8px;text-align:left" onclick="CL.pickBascule(${i})">${esc(o.label)}<div class="small muted" style="margin-top:2px">${esc(attrLabel(o.stat))}</div></button>`).join('')}
  </div>`;
}
function applyBeat(b){ const A=ARENA; if(!b)return;
  if(b.phase==='bell'){ A.currentText=b.text; return; }
  if(b.by==='me'){ A.flashOp=1; A.shakeOp=1; A.lungeMe=1; }
  else { A.flashMe=1; A.shakeMe=1; A.lungeOp=1; }
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
  A._chromaKOActive=!!(b.finish && b.method && b.method.startsWith('KO')); A._chromaDone=false;
  A.crowdPulse=Math.min(1,(A.crowdPulse||0)+(b.finish?1:0.35));
  if(b.finish){ if(b.method&&b.method.startsWith('KO')){ if(A.meWin){A.fall=2;} else {A.fall=1;} }
    else if(b.method&&b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; }
    if(A.finishZone){ const zoneLetter=A.finishZone==='tête'?'h':A.finishZone==='corps'?'b':'l';
      const loserPrefix=A.meWin?'do':'dm'; A.flashZoneId=`${loserPrefix}-${zoneLetter}`; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
  A.currentText=b.text; A.currentMomentum=b.momentum;
  if(b.snapA) A.snapA=b.snapA; if(b.snapB) A.snapB=b.snapB;
  /* ==== [ANCRE: CORRECTIF_CARDIO_FICTIF] — bug trouvé : les deux barres
     étiquetées CARDIO dans scr_arena descendaient par RI(2,5) des DEUX côtés à
     chaque beat, sans aucune lecture du combat réel. Dérivées désormais des
     dégâts cumulés par zone du log (snapA/snapB, déjà transportés par chaque
     beat) : la barre du combattant qui encaisse descend, celle de l'autre non. ==== */
  const _dmgA=(A.snapA.h||0)+(A.snapA.b||0)+(A.snapA.l||0);
  const _dmgB=(A.snapB.h||0)+(A.snapB.b||0)+(A.snapB.l||0);
  A.stMe=clamp(100-_dmgA*1.2,12,100); A.stOp=clamp(100-_dmgB*1.2,12,100);
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
  /* ==== [ANCRE: CORRECTIF_CHROMA_GEL_REPETE] — bug trouvé : applyChromaAberration()
     fait un getImageData + boucle par pixel + putImageData sur ~316 000 pixels,
     rejoué ~10 fois pendant les 170 ms de hit-stop d'un KO (la frame ne change
     pourtant pas pendant le gel, par construction) — la frame la plus importante
     du jeu, la plus coûteuse sur mobile. Appliqué une seule fois par gel. ==== */
  if(A._chromaKOActive && !A._chromaDone){ applyChromaAberration(ctx,Math.round(3*(A.dpr||1))); A._chromaDone=true; }
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  /* ==== [ANCRE: CORRECTIF_OMBRE_RND] — bug trouvé : ce `const rnd` masquait
     le RNG seedé global (rnd(), engine.js) sur toute la fonction via la TDZ —
     tout ajout futur d'un appel à rnd() ailleurs dans drawArena() aurait levé
     un ReferenceError en pleine boucle d'animation à 60 fps. Renommé en `rd`,
     un simple numéro de round affiché, jamais un tirage aléatoire. ==== */
  const rd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = A.curPhase==='sol'?'SOL':(A.curPhase==='clinch'?'CLINCH':'DEBOUT');
  if(A.done){ label = A.method==='Égalité'?'ÉGALITÉ':isDecisionLike(A.method)?'AUX POINTS':(A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rd+' · '+label), W/2, 20);
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
const ARENA_ZONE_COLOR=v=>v>28?'var(--blood-d)':v>18?'var(--gold)':v>8?'var(--gold-d)':'var(--sage)';
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
