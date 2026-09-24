"use strict";
/* CAGE LEGACY — arene-etat.js
   ============================================================================
   LOT 3 T2 — LE SOCLE DE L'ARÈNE NEUVE : L'ÉTAT (docs/LOT-3-L-ARENE.md §3 T2 ;
   vision § L'affichage du combat ; principe fondateur §1 : le moteur décide,
   l'arène met en scène).

   L'ÉTAT de l'arène, calculé SANS canvas et SANS accès au DOM — testable dans
   le harnais, mesurable hors écran (cible 1 du §2). Deux entrées, jamais
   d'autres :
     - un résultat de simulateFight (celui d'un combat qui vient d'être joué,
       ou celui d'un mgmtReplayFight d'une trace) ;
     - les deux noms.
   L'arène ne lit JAMAIS G : elle servira le management et la carrière (T4).

   Le déroulé (res.log) porte, par moment : r, phase ('debout'|'clinch'|'sol',
   plus 'exam' entre les rounds), top/pos au sol, pos au clinch ('cage'|
   'center'), by ('me' = combattant A, 'op' = combattant B), text, momentum,
   snapA, snapB. L'arène consomme les moments (phase, transition, amenée,
   tapis, menace de soumission, texte) et REMPLIT LES TROUS entre eux d'un
    déplacement physique du prototype (T3) : les pions tiennent la
   géométrie de leur phase — à distance, au clinch, contre le grillage, au
   sol avec la position nommée. Elle ne décide RIEN de ce que le moteur
   décide : qui touche, qui gagne, quand — tout vient du déroulé.

   Le temps : chaque moment du moteur est horodaté par son texte ([mm:ss]
   restant dans le round — format du moteur). Entre deux moments, ~20 s de
   combat que l'arène remplit. Les pauses entre les rounds n'ont pas de temps
   de combat : elles vivent côté affichage (areneInstant, montage), jamais
   dans areneMoment — la mesure de la cible 1 échantillonne le temps de
   combat pur.

   Portée globale classique (pas de module). Préfixe ARENE_/arene, distinct
   de l'ancienne arène (ARENA, startArena, buildTimeline, drawArena...) qui
   vit encore — ui-09-arena.js reste inchangée jusqu'à la T4. Toute fonction
   de premier niveau porte le préfixe arene : pas de global anonyme qui
   échappe à la portée partagée.

   Dépendance runtime : areneVerdictFidele lit mgmtMethodFamily
   (mgmt-corps.js) — le classificateur de famille unique du dépôt, jamais une
   seconde table. Résolu à l'appel, après chargement de tous les fichiers.
   Aucun Math.random() : le seul tirage est areneAlea (LCG local
   déterministe, présentation uniquement). Aucune réplique : les textes
   affichés viennent du moteur.
   ============================================================================ */

/* ==== [ANCRE: ARENE_T2_ETAT] — Lot 3 T2 le socle de l'arène neuve : l'état
   (géométrie de la cage à l'échelle réelle, segments pilotés par le déroulé
   du moteur, remplissage simple des trous, garde-fou du rejeu). ==== */

/* ---- Géométrie (mètres, échelle réelle — vision : « L'octogone est à
   l'échelle réelle »). Reprise du prototype validé le 17/09
   (prototypes/arene.html) : RS rayon inscrit, RV rayon du sommet, huit
   normales d'arête. ==== */
const ARENE_RS=4.3;
const ARENE_RV=ARENE_RS/Math.cos(Math.PI/8);
const ARENE_NORMALS=(function(){ const a=[]; for(let k=0;k<8;k++) a.push({x:Math.cos(k*Math.PI/4),y:Math.sin(k*Math.PI/4)}); return a; })();
/** Sommet k de l'octogone (mètres). @returns {{x:number,y:number}} */
function areneVert(k,r){ const rr=(r==null)?ARENE_RV:r; return {x:Math.cos(Math.PI/8+k*Math.PI/4)*rr,y:Math.sin(Math.PI/8+k*Math.PI/4)*rr}; }
const ARENE_CORPS=0.28;              // rayon d'un pion au sol (m)
const ARENE_COIN_A=4;                // coin jaune (vision : jaune principal)
const ARENE_COIN_B=0;                // coin rouge (vision : rouge = adversaire)
const ARENE_COUL_A='#FFC83D';
const ARENE_COUL_B='#E5322D';
const ARENE_ROUND_LEN=300;           // secondes de combat par round (moteur)

/* ---- Réglages de mise en scène (présentation, jamais des résultats) ---- */
const ARENE_MORPH_S=1.5;             // plafond physique des transitions de phase (lot 3 T3)
const ARENE_ACTION_S=1.4;            // durée affichée d'une signature de frappe
const ARENE_TEXTE_S=2.5;             // durée d'affichage d'une ligne de texte du moteur
const ARENE_TAPIS_S=4;               // durée au tapis d'un knockdown non conclu
const ARENE_FIN_S=1.2;               // temps de combat tenu sur l'image finale d'une finition
const ARENE_FLASH_S=0.35;            // durée de l'éclat d'impact
const ARENE_PAUSE_S=1.4;             // temps d'AFFICHAGE d'une pause entre les rounds (temps morts défilent vite)
const ARENE_CLINCH_D=0.6;            // distance des deux pions au clinch (m)
const ARENE_DEBOUT_MIN=1.5;          // distance de travail debout (lot 3 T3)
const ARENE_SOL_D_MAX=0.8;           // distance maximale entre deux pions au sol (m)
const ARENE_CAGE_CLINCH_BORD=0.42;   // écart au grillage du pion plaqué (m)
/* Écartement du dessus par position au sol (m, présentation) — l'ordre de
   grandeur suit la domination : garde (le combat s'établit) ... dos (collé). */
const ARENE_POS_SOL={closedGuard:0.34,openGuard:0.32,halfGuard:0.26,sideControl:0.34,mount:0.12,backControl:0.26};
/* Position au sol nommée (vision : « au sol avec la position nommée »). */
const ARENE_POS_SOL_NOM={closedGuard:'GARDE FERMÉE',openGuard:'GARDE OUVERTE',halfGuard:'DEMI-GARDE',sideControl:'CONTRÔLE LATÉRAL',mount:'MONTÉE',backControl:'DOS'};

/* ---- Petits outils (préfixés : clamp/pick/RI du moteur ne sont pas
   redéclarés ; les maths en mètres ont leurs propres bornes) ---- */
function areneBordDist(p){ let m=1e9; for(let k=0;k<8;k++){ const n=ARENE_NORMALS[k]; const d=ARENE_RS-(n.x*p.x+n.y*p.y); if(d<m)m=d; } return m; }
function areneDedans(p,m){ const q={x:p.x,y:p.y}; for(let i=0;i<3;i++){ for(let k=0;k<8;k++){ const n=ARENE_NORMALS[k]; const o=(n.x*q.x+n.y*q.y)-(ARENE_RS-m); if(o>0){ q.x-=n.x*o; q.y-=n.y*o; } } } return q; }
/** LCG local déterministe (même famille que la RNG du jeu) — présentation
 *  uniquement, jamais un résultat. @returns {function():number} */
function areneAlea(seed){ let s=(seed>>>0)||1; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function areneNorm(v){ const l=Math.hypot(v.x,v.y)||1; return {x:v.x/l,y:v.y/l}; }
function areneTourne(v,ang){ const c=Math.cos(ang),s=Math.sin(ang); return {x:v.x*c-v.y*s,y:v.x*s+v.y*c}; }
function areneLisse(u){ return u*u*(3-2*u); }
function areneMilieu(A,B){ return {x:(A.x+B.x)/2,y:(A.y+B.y)/2}; }
function areneDist(A,B){ return Math.hypot(A.x-B.x,A.y-B.y); }
function areneBorne(x,a,b){ return Math.max(a,Math.min(b,x)); }
function areneRayon(p,v){ let t=1e9; for(const n of ARENE_NORMALS){ const d=n.x*v.x+n.y*v.y; if(d>1e-6)t=Math.min(t,(ARENE_RS-n.x*p.x-n.y*p.y)/d); } return t; }
function areneCoinA(){ return areneVert(ARENE_COIN_A,ARENE_RV*0.8); }
function areneCoinB(){ return areneVert(ARENE_COIN_B,ARENE_RV*0.8); }
function areneAngleSemee(idx,sel){ const a=areneAlea(idx*97+(sel||1))()*Math.PI*2; return {x:Math.cos(a),y:Math.sin(a)}; }

/* ---- Lecture du déroulé --------------------------------------------------- */
const ARENE_RE_TEMPS=/^\[(\d{1,2}):(\d{2})\] /;
/** Temps de combat écoulé (depuis le début du combat) d'un moment du moteur :
 *  l'horodatage du texte est le temps RESTANT dans le round. @returns {number} */
function areneTempsCombat(b,defaut){
  const m=ARENE_RE_TEMPS.exec(typeof b.text==='string'?b.text:'');
  if(!m) return defaut;
  const reste=(+m[1])*60+(+m[2]);
  return ARENE_ROUND_LEN-Math.min(ARENE_ROUND_LEN,Math.max(0,reste));
}
/** Les moments du moteur, horodatés, en ordre de combat. Le premier moment
 *  de finition clôt le combat (aucun moment ne le suit). @returns {Array} */
function areneBeats(res){
  const log=(res&&Array.isArray(res.log))?res.log:[];
  const beats=[]; let tPrev=-1;
  for(let i=0;i<log.length;i++){
    const L=log[i];
    if(!L||typeof L!=='object') continue;
    const r=(Number.isSafeInteger(L.r)&&L.r>=1)?L.r:1;
    const t=(r-1)*ARENE_ROUND_LEN+Math.min(ARENE_ROUND_LEN,Math.max(0,areneTempsCombat(L,ARENE_ROUND_LEN)));
    const tClamp=Math.max(t,tPrev); tPrev=tClamp;
    beats.push({i:beats.length,r:r,t:tClamp,phase:typeof L.phase==='string'?L.phase:'debout',
      top:(L.top==='A'||L.top==='B')?L.top:null,
      pos:(typeof L.pos==='string')?L.pos:null,
      by:(L.by==='me'||L.by==='op')?L.by:null,
      text:typeof L.text==='string'?L.text:'',
      finish:!!L.finish, method:typeof L.method==='string'?L.method:null, sub:!!L.sub});
    if(L.finish) break;
  }
  return beats;
}
/** Transition de phase portée par un moment du moteur : le moteur journalise
 *  l'amener/la séparation/la relance DANS la phase d'où elle part — le
 *  moment annonce le changement, la phase d'après en découle. Lecture des
 *  marques stables du texte du moteur (engine-combat.js, inchangé) : aucune
 *  décision n'est prise ici, le moteur a déjà tranché.
 *  @returns {{phase:string,top:string}|null} */
function areneTransitionBeat(b){
  if(!b||typeof b.text!=='string') return null;
  if(b.phase==='debout'&&b.text.indexOf('Takedown validé par ')>=0) return {phase:'sol',top:'A'};
  if(b.phase==='debout'&&b.text.indexOf('le combat passe au sol')>=0) return {phase:'sol',top:'B'};
  if(b.phase==='clinch'&&b.text.indexOf('pour amener au sol')>=0) return {phase:'sol',top:(b.by==='me'?'A':'B')};
  if(b.phase==='clinch'&&b.text.indexOf('Séparation, le combat reprend au centre')>=0) return {phase:'debout',top:null};
  if(b.phase==='sol'&&b.text.indexOf('relance les combattants debout')>=0) return {phase:'debout',top:null};
  return null;
}
/** Knockdown non conclu : le moment « X envoie Y au tapis » nomme la cible
 *  (by = l'auteur). @returns {string|null} 'A'|'B' */
function areneBeatTapis(b){
  if(!b||typeof b.text!=='string'||b.text.indexOf('au tapis')<0) return null;
  return b.by==='me'?'B':'A';
}

/* ==== [ANCRE: ARENE_T3_PAS] — Lot 3 T3 : moveStanding et escape du prototype
   validé, alimentés par les seuls faits de res.stats et par le déroulé. ==== */
function areneProfil(stats){
  const s=stats||{}, dist=s.distAtt||s.distStrikes||0, close=s.clinchAtt||s.clinchStrikes||0;
  const td=s.tdAtt||0, total=dist+close+td*2+1;
  const part=dist/total, grap=(close+td*2)/total;
  return {a:{speed:areneBorne(0.45+part*0.35+grap*0.15,0.45,0.8),iq:areneBorne(0.45+part*0.3,0.45,0.8),grappling:grap},
    plan:{range:grap>0.4?'close':part>0.68?'long':'mid',aggr:areneBorne(0.4+(s.sigAtt||0)/Math.max(1,total)*0.35+grap*0.2,0.4,0.9),angle:areneBorne(part*0.55,0.1,0.5)}};
}
function areneMobile(pos,profil){ return {pos:{x:pos.x,y:pos.y},vel:{x:0,y:0},step:null,escapeCD:0,pinnedT:0,
  a:profil.a,plan:profil.plan,leg:0,stam:1,stun:0,down:0,busy:0,pref:2}; }
function areneEscape(f,o,u,lat,rng){
  f.escapeCD=1.3+rng()*1.1;
  const p=areneBorne(0.12+1.3*f.plan.angle*f.a.iq,0.08,0.92);
  if(rng()<p){
    const side=areneRayon(f.pos,lat)>areneRayon(f.pos,{x:-lat.x,y:-lat.y})?1:-1;
    f.step={v:areneNorm({x:lat.x*side-u.x*0.3,y:lat.y*side-u.y*0.3}),speed:1.55,t:0.35+rng()*0.15};
  }
}
function areneMoveStanding(f,o,dt,rng){
  const to={x:o.pos.x-f.pos.x,y:o.pos.y-f.pos.y},d=Math.hypot(to.x,to.y)||0.01;
  const u={x:to.x/d,y:to.y/d},lat={x:-u.y,y:u.x};
  const spd=(0.55+0.9*f.a.speed)*areneBorne(1-f.leg*0.07,0.5,1)*(0.55+0.45*f.stam)*(f.stun>0?0.45:1);
  let want={x:0,y:0};
  if(f.down>0){f.vel.x*=0.8;f.vel.y*=0.8;return;}
  if(f.step){want={x:f.step.v.x*f.step.speed*spd,y:f.step.v.y*f.step.speed*spd};f.step.t-=dt;if(f.step.t<=0)f.step=null;}
  else if(f.busy<=0){
    const pref=f.pref,e=d-pref;
    if(f.stun>0&&f.a.grappling<0.4){if(areneRayon(f.pos,{x:-u.x,y:-u.y})>0.8)want={x:-u.x*0.6*spd,y:-u.y*0.6*spd};}
    else if(e>0.15){
      if(rng()<dt*(1+2.6*f.plan.aggr))f.step={v:u,speed:1.25,t:0.16+rng()*0.14};
      else want={x:u.x*1.5*spd,y:u.y*1.5*spd};
    }else if(e< -0.15){
      const back=areneRayon(f.pos,{x:-u.x,y:-u.y});
      if(back<1.05){if(f.escapeCD<=0)areneEscape(f,o,u,lat,rng);}
      else if(rng()<dt*(2.2+2*f.a.speed))f.step={v:{x:-u.x,y:-u.y},speed:1.15,t:0.16+rng()*0.12};
      else want={x:-u.x*1.5*spd,y:-u.y*1.5*spd};
    }
    if(f.plan.range==='close'){const ol=o.vel.x*lat.x+o.vel.y*lat.y;want.x+=lat.x*ol*0.85;want.y+=lat.y*ol*0.85;}
    if(Math.abs(e)<0.3&&areneBordDist(f.pos)<1.4&&f.plan.range!=='close'){
      const inward=areneNorm(f.pos);want.x-=inward.x*0.3*spd;want.y-=inward.y*0.3*spd;
    }
  }
  f.vel.x+=(want.x-f.vel.x)*Math.min(1,dt*8);f.vel.y+=(want.y-f.vel.y)*Math.min(1,dt*8);
  f.escapeCD-=dt;
  if(f.plan.range!=='close'&&areneRayon(f.pos,{x:-u.x,y:-u.y})<0.75&&d<f.pref)f.pinnedT+=dt;
}
function areneVers(f,target,dt,max){
  const dx=target.x-f.pos.x,dy=target.y-f.pos.y,l=Math.hypot(dx,dy);
  const speed=Math.min(max,l*9), wx=l>0.01?dx/l*speed:0,wy=l>0.01?dy/l*speed:0;
  f.vel.x+=(wx-f.vel.x)*Math.min(1,dt*12);
  f.vel.y+=(wy-f.vel.y)*Math.min(1,dt*12);
}
function arenePasRef(sim,phase,dt){
  const A=sim.A.pos,B=sim.B.pos,ref=sim.ref;
  const M=areneMilieu(A,B),u=areneNorm({x:B.x-A.x,y:B.y-A.y}),perp={x:-u.y,y:u.x};
  const base=phase==='sol'?B:M,offset=phase==='debout'?2.3:1.8;
  const c1=areneDedans({x:base.x+perp.x*offset,y:base.y+perp.y*offset},0.6);
  const c2=areneDedans({x:base.x-perp.x*offset,y:base.y-perp.y*offset},0.6);
  /* Le signe de la perpendiculaire peut s'inverser : mémoriser le côté physique. */
  const same=areneDist(ref.side,c1)<=areneDist(ref.side,c2)?c1:c2;
  const other=same===c1?c2:c1;
  if(areneBordDist(other)>areneBordDist(same)+0.9)ref.side=other;
  else ref.side=same;
  areneVers(ref,phase==='exam'?{x:0,y:-0.4}:ref.side,dt,1.6);
  const p=areneDedans({x:ref.pos.x+ref.vel.x*dt,y:ref.pos.y+ref.vel.y*dt},0.45);
  ref.pos=p;
}
function arenePas(session,dt,t){
  const sim=session._pas,sg=areneSegDe(t,session.segs),rng=sim.rng;
  const A=sim.A,B=sim.B;
  A.down=0; B.down=0; A.stun=0; B.stun=0;
  for(const w of session.tapis){
    if(t>=w.t0&&t<w.t1){
      const f=w.cible==='A'?A:B; f.down=1; f.stun=1;
    }
  }
  if(sg.phase==='debout'){
    if(sim.prefAt==null||t>=sim.prefAt){
      sim.prefAt=t+0.4+rng()*0.2;
      A.pref=1.5+rng(); B.pref=1.5+rng();
    }
    areneMoveStanding(A,B,dt,rng); areneMoveStanding(B,A,dt,rng);
    const d=areneDist(A.pos,B.pos);
    if(d<1.65){
      const u=areneNorm({x:B.pos.x-A.pos.x,y:B.pos.y-A.pos.y});
      areneVers(A,{x:A.pos.x-u.x*(1.8-d),y:A.pos.y-u.y*(1.8-d)},dt,3.3);
      areneVers(B,{x:B.pos.x+u.x*(1.8-d),y:B.pos.y+u.y*(1.8-d)},dt,3.3);
    }
  }else{
    const prev={A:A.pos,B:B.pos};let target;
    if(sg.phase==='clinch')target=areneArrangementClinch(prev,sg.beat&&sg.beat.by==='op'?'B':'A',sg.posClinch,sg.i);
    else if(sg.phase==='sol')target=areneArrangementSol(prev,sg.top,sg.posSol,sg.i);
    else target=prev;
    /* Le point de cage est fixé à l'entrée du segment, pas recalculé à chaque image. */
    if(sim.segment!==sg){sim.segment=sg;sim.target=target;}
    areneVers(A,sim.target.A,dt,sg.phase==='clinch'?4.2:2.8);
    areneVers(B,sim.target.B,dt,sg.phase==='clinch'?4.2:2.8);
  }
  for(const f of [A,B]){
    const v=Math.hypot(f.vel.x,f.vel.y),k=Math.min(1,5.5/(v||1));f.vel.x*=k;f.vel.y*=k;
    f.pos=areneDedans({x:f.pos.x+f.vel.x*dt,y:f.pos.y+f.vel.y*dt},ARENE_CORPS+0.08);
  }
  arenePasRef(sim,sg.phase,dt);
  return [A.pos.x,A.pos.y,B.pos.x,B.pos.y,sim.ref.pos.x,sim.ref.pos.y];
}
function areneImage(session,t){
  const sim=session._pas,step=1/60,idx=Math.floor(t/step);
  while(sim.frames.length<=idx+1){
    const n=sim.frames.length;
    sim.frames.push(arenePas(session,step,n*step));
  }
  const a=sim.frames[idx],b=sim.frames[idx+1],k=t/step-idx;
  return a.map((v,i)=>v+(b[i]-v)*k);
}

/** La phase du DÉROULÉ à l'instant t de combat — la source de vérité de la
 *  cible 1, lue sur les moments bruts (pas sur les segments de l'arène) :
 *  le dernier moment ≤ t porte sa phase, sa transition s'applique d'après,
 *  'exam' tient jusqu'au moment suivant. Avant le premier moment : debout.
 *  @returns {{phase:string,top:string,posSol:string,posClinch:string}} */
function arenePhaseDeroule(beats,t){
  let cur={phase:'debout',top:null,posSol:null,posClinch:null};
  for(let i=0;i<beats.length;i++){
    const b=beats[i];
    if(b.t>t) break;
    const tr=areneTransitionBeat(b);
    if(b.finish){ cur={phase:'fini',top:(b.phase==='sol')?(b.top==='B'?'B':'A'):null,posSol:(b.phase==='sol')?(b.pos||'closedGuard'):null,posClinch:null}; continue; }
    if(tr) cur={phase:tr.phase,top:tr.top,posSol:tr.phase==='sol'?'closedGuard':null,posClinch:tr.phase==='clinch'?(b.pos==='cage'?'cage':'center'):null};
    else if(b.phase==='exam') cur={phase:'exam',top:null,posSol:null,posClinch:null};
    else if(b.phase==='debout') cur={phase:'debout',top:null,posSol:null,posClinch:null};
    else if(b.phase==='clinch') cur={phase:'clinch',top:null,posSol:null,posClinch:(b.pos==='cage'?'cage':'center')};
    else if(b.phase==='sol') cur={phase:'sol',top:(b.top==='B'?'B':'A'),posSol:b.pos||'closedGuard',posClinch:null};
    else cur={phase:'debout',top:null,posSol:null,posClinch:null};
  }
  return cur;
}

/* ---- Dispositions des pions (remplissage simple des trous) ---------------- */
/** Debout — cible de fin de segment : la paire tient une distance de frappe
 *  lisible (≥ ARENE_DEBOUT_MIN, jamais sous la fenêtre d'oscillation) et
 *  reste dans la cage. @returns {{A:{x,y},B:{x,y}}} */
function areneFinDebout(arr,idx){
  const M=areneDedans(areneMilieu(arr.A,arr.B),1.2);
  let u={x:arr.A.x-arr.B.x,y:arr.A.y-arr.B.y};
  if(Math.hypot(u.x,u.y)<0.2) u=areneAngleSemee(idx,3); else u=areneNorm(u);
  const u2=areneTourne(u,(idx%2?1:-1)*(0.10+0.18*areneAlea(idx*13+7)()));
  return {A:{x:M.x+u2.x*0.75,y:M.y+u2.y*0.75},B:{x:M.x-u2.x*0.75,y:M.y-u2.y*0.75}};
}
/** Debout — arrangement d'entrée (après une séparation, une relance) : la
 *  paire part des positions d'où elle vient et reprend une distance de
 *  frappe. @returns {{A,B}} */
function areneArrangementDebout(prev,idx){
  const M=areneDedans(areneMilieu(prev.A,prev.B),1.2);
  let u={x:prev.A.x-prev.B.x,y:prev.A.y-prev.B.y};
  if(Math.hypot(u.x,u.y)<0.2) u=areneAngleSemee(idx,3); else u=areneNorm(u);
  return {A:{x:M.x+u.x*0.75,y:M.y+u.y*0.75},B:{x:M.x-u.x*0.75,y:M.y-u.y*0.75}};
}
/** Clinch — arrangement : corps en contact (ARENE_CLINCH_D) ; contre la
 *  cage, le dominant (by du moment) plaque l'autre au grillage.
 *  @returns {{A,B}} */
function areneArrangementClinch(prev,dominant,posCage,idx){
  const dom=dominant==='B'?'B':'A', ndS=dom==='A'?'B':'A';
  const out={};
  if(posCage==='cage'){
    const M=areneMilieu(prev.A,prev.B);
    const l=Math.hypot(M.x,M.y);
    const dir=l>0.3?areneNorm(M):areneAngleSemee(idx,5);
    let md=-1e9; for(let k=0;k<8;k++){ const n=ARENE_NORMALS[k]; const p=n.x*dir.x+n.y*dir.y; if(p>md)md=p; }
    const s=(ARENE_RS-ARENE_CAGE_CLINCH_BORD)/Math.max(0.2,md);
    const nd={x:dir.x*Math.min(s,ARENE_RV-0.5),y:dir.y*Math.min(s,ARENE_RV-0.5)};
    const dm={x:nd.x-dir.x*ARENE_CLINCH_D,y:nd.y-dir.y*ARENE_CLINCH_D};
    out[dom]={x:dm.x,y:dm.y}; out[ndS]={x:nd.x,y:nd.y};
  }else{
    const M=areneDedans(areneMilieu(prev.A,prev.B),0.9);
    let u={x:prev.A.x-prev.B.x,y:prev.A.y-prev.B.y};
    if(Math.hypot(u.x,u.y)<0.2) u=areneAngleSemee(idx,3); else u=areneNorm(u);
    out[dom]={x:M.x+u.x*ARENE_CLINCH_D/2,y:M.y+u.y*ARENE_CLINCH_D/2};
    out[ndS]={x:M.x-u.x*ARENE_CLINCH_D/2,y:M.y-u.y*ARENE_CLINCH_D/2};
  }
  return out;
}
/** Clinch — cible de fin de segment : au centre la paire pivote d'un quart de
 *  tour lent, contact tenu ; contre la cage elle grinding sur place.
 *  @returns {{A,B}} */
function areneFinClinch(arr,dominant,posCage,idx){
  if(posCage==='cage') return {A:{x:arr.A.x,y:arr.A.y},B:{x:arr.B.x,y:arr.B.y}};
  const M=areneDedans(areneMilieu(arr.A,arr.B),0.9);
  const ang=(idx%2?1:-1)*0.12;
  let u=areneNorm({x:arr.A.x-arr.B.x,y:arr.A.y-arr.B.y});
  u=areneTourne(u,ang);
  const dom=dominant==='B'?'B':'A', ndS=dom==='A'?'B':'A';
  const out={};
  out[dom]={x:M.x+u.x*ARENE_CLINCH_D/2,y:M.y+u.y*ARENE_CLINCH_D/2};
  out[ndS]={x:M.x-u.x*ARENE_CLINCH_D/2,y:M.y-u.y*ARENE_CLINCH_D/2};
  return out;
}
/** Sol — arrangement : le dessous ancré, le dessus à l'écartement de la
 *  position nommée. @returns {{A,B}} */
function areneArrangementSol(prev,top,posSol,idx){
  const tS=(top==='B')?'B':'A', bS=tS==='A'?'B':'A';
  const off=ARENE_POS_SOL[posSol]||0.34;
  const pTop=prev[tS], pBot=prev[bS];
  let u={x:pTop.x-pBot.x,y:pTop.y-pBot.y};
  if(Math.hypot(u.x,u.y)<0.15) u=areneAngleSemee(idx,11); else u=areneNorm(u);
  if(posSol==='sideControl') u={x:-u.y,y:u.x};
  else if(posSol==='backControl') u={x:-u.x,y:-u.y};
  const bot=areneDedans({x:pBot.x,y:pBot.y},ARENE_CORPS+0.1);
  const tp=areneDedans({x:bot.x+u.x*off,y:bot.y+u.y*off},ARENE_CORPS*0.6);
  const out={}; out[tS]=tp; out[bS]=bot;
  return out;
}
/** Sol — cible de fin de segment : le dessous glisse lentement, le dessus
 *  suit, l'écartement de la position tenu. @returns {{A,B}} */
function areneFinSol(arr,top,posSol,idx){
  const tS=(top==='B')?'B':'A', bS=tS==='A'?'B':'A';
  const off=ARENE_POS_SOL[posSol]||0.34;
  let u=areneNorm({x:arr[tS].x-arr[bS].x,y:arr[tS].y-arr[bS].y});
  if(posSol==='sideControl') u={x:-u.y,y:u.x};
  else if(posSol==='backControl') u={x:-u.x,y:-u.y};
  const perp={x:-u.y,y:u.x}, s=(idx%2?1:-1)*0.12;
  const bot=areneDedans({x:arr[bS].x+perp.x*s,y:arr[bS].y+perp.y*s},ARENE_CORPS+0.1);
  const tp=areneDedans({x:bot.x+u.x*off,y:bot.y+u.y*off},ARENE_CORPS*0.6);
  const out={}; out[tS]=tp; out[bS]=bot;
  return out;
}
/** Fini : le vainqueur se tient près du vaincu resté au tapis (ou les deux
 *  debout, séparés, sur un nul). @returns {{A,B}} */
function areneArrangementFini(prev,method,winner,idx){
  if(winner!=='A'&&winner!=='B') return areneFinDebout(prev,idx);
  const lS=winner==='A'?'B':'A';
  const loser={x:prev[lS].x,y:prev[lS].y};
  let dir={x:-loser.x,y:-loser.y};
  if(Math.hypot(dir.x,dir.y)<0.2) dir=areneAngleSemee(idx,9); else dir=areneNorm(dir);
  const win2=areneDedans({x:loser.x+dir.x*1.0,y:loser.y+dir.y*1.0},ARENE_CORPS+0.2);
  const out={}; out[winner]=win2; out[lS]={x:loser.x,y:loser.y};
  return out;
}

/* ---- Construction de la session ------------------------------------------- */
function areneNomCourt(c){ const p=String(c||'?').trim().split(/\s+/); return p.length>1?p[p.length-1]:String(c||'?'); }

/** Construit la session d'arène depuis un résultat du moteur et les deux
 *  noms. Aucune décision : tout ce que la session montrera vient de
 *  res.log ; les positions des pions (ce que le moteur ne dit pas) sont
  *  parcourues à vitesse lissée et intégrées par pas fixes.
 *  @param {object} res résultat de simulateFight (ou de mgmtReplayFight).
 *  @param {{a:string,b:string}} noms noms complets des deux combattants
 *    (a = combattant A du résultat, b = B).
 *  @returns {object|null} la session, ou null sans résultat. */
function areneConstruire(res,noms){
  if(!res||typeof res!=='object') return null;
  const na=(noms&&typeof noms.a==='string'&&noms.a)?noms.a:'A';
  const nb=(noms&&typeof noms.b==='string'&&noms.b)?noms.b:'B';
  const S={res:res,noms:{a:{complet:na,court:areneNomCourt(na),coul:ARENE_COUL_A},
      b:{complet:nb,court:areneNomCourt(nb),coul:ARENE_COUL_B}},
     _etat:{},_etatAff:{},tapis:[]};
  const vainqueur=(res.winner==='A'||res.winner==='B')?res.winner:'D';
  S.vainqueur=vainqueur;
  S.methode=typeof res.method==='string'?res.method:'';
  S.roundFin=Number.isSafeInteger(res.round)?res.round:null;
  const beats=areneBeats(res);
  const beatsOr=beats.length>0?beats:[{i:0,r:1,t:0,phase:'debout',top:null,pos:null,by:null,text:'',finish:false,method:null,sub:false}];
  let roundsMax=1;
  for(const b of beatsOr){ if(b.r>roundsMax) roundsMax=b.r; }
  if(Number.isSafeInteger(res.round)&&res.round>roundsMax) roundsMax=res.round;
  const bFin=beatsOr[beatsOr.length-1];
  const finT=bFin.finish?(bFin.t+ARENE_FIN_S):roundsMax*ARENE_ROUND_LEN;
  S.finT=finT;

  /* Segments : [t_i, t_{i+1}) — la phase d'après transition s'applique dès
     l'instant du moment qui l'annonce ; au moment exact, c'est l'action du
     moment qui se joue (la frappe, l'amener) dans la phase d'avant. */
  const segs=[];
  let posA=areneCoinA(), posB=areneCoinB();
  /* rPrec démarre à 1 : le premier round est déjà entré par l'ouverture
     (segment d'ouverture ci-dessous quand le premier moment tarde). */
  let rPrec=1, phasePrec=null, posSolPrec=null, topPrec=null, posClinchPrec=null, examVu=false;
  for(let i=0;i<beatsOr.length;i++){
    const b=beatsOr[i];
    const t1=(i+1<beatsOr.length)?beatsOr[i+1].t:finT;
    const tr=areneTransitionBeat(b);
    let phase;
    if(b.finish) phase='fini';
    else if(tr) phase=tr.phase;
    else if(b.phase==='exam') phase='exam';
    else if(b.phase==='clinch') phase='clinch';
    else if(b.phase==='sol') phase='sol';
    else phase='debout';
    const top=phase==='sol'?(tr?tr.top:(b.top==='B'?'B':'A')):null;
    const posSol=phase==='sol'?(tr?'closedGuard':(b.pos||'closedGuard')):null;
    const posClinch=phase==='clinch'?(b.pos==='cage'?'cage':'center'):null;
    const dominant=phase==='clinch'?(b.by==='op'?'B':'A'):null;
    const nouvelleRonde=b.r>rPrec;
    const prev={A:{x:posA.x,y:posA.y},B:{x:posB.x,y:posB.y}};
    let arr=null, fin=null, morph=false;
    /* Round nouveau et pause médicale : les pions sont DANS leur coin (le
       montage d'affichage a fait la marche ; en temps de combat, le round
       repart des coins — débat de la cloche compris). Si la phase du
       premier moment du round n'est pas debout (un clinch peut déjà être
       pris), ils regagnent sa géométrie en fenêtre de réarrangement. */
    if(nouvelleRonde||(phase==='exam'&&!examVu)){
      if(phase==='exam') examVu=true;
      arr={A:{x:arenePosA0().x,y:arenePosA0().y},B:{x:arenePosB0().x,y:arenePosB0().y}};
      prev.A={x:arr.A.x,y:arr.A.y}; prev.B={x:arr.B.x,y:arr.B.y};
      if(phase==='debout'||phase==='exam'){
        fin=(phase==='exam')?{A:{x:arr.A.x,y:arr.A.y},B:{x:arr.B.x,y:arr.B.y}}
          :{A:{x:arr.A.x*0.45,y:arr.A.y*0.45},B:{x:arr.B.x*0.45,y:arr.B.y*0.45}};
      }else{
        morph=true;
        arr=(phase==='clinch')?areneArrangementClinch(prev,dominant,posClinch,i)
          :areneArrangementSol(prev,top,posSol,i);
        fin=(phase==='clinch')?areneFinClinch(arr,dominant,posClinch,i)
          :areneFinSol(arr,top,posSol,i);
      }
    }else if(phasePrec!==phase){
      /* La phase change : les pions regagnent la géométrie de la nouvelle
         phase en ARENE_MORPH_S (fenêtre d'instabilité de la cible 1). */
      morph=true;
      if(phase==='debout') arr=areneArrangementDebout(prev,i);
      else if(phase==='clinch') arr=areneArrangementClinch(prev,dominant,posClinch,i);
      else if(phase==='sol') arr=areneArrangementSol(prev,top,posSol,i);
      else arr=areneArrangementFini(prev,S.methode,vainqueur,top,i);
      fin=(phase==='clinch')?areneFinClinch(arr,dominant,posClinch,i)
        :(phase==='sol')?areneFinSol(arr,top,posSol,i)
        :(phase==='fini')?arr
        :areneFinDebout(arr,i);
    }else if(phase==='sol'&&(posSol!==posSolPrec||top!==topPrec)){
      /* Scramble au sol : la position nommée ou le dessus changent. */
      morph=true;
      arr=areneArrangementSol(prev,top,posSol,i);
      fin=areneFinSol(arr,top,posSol,i);
    }else if(phase==='clinch'&&posClinch!==posClinchPrec){
      morph=true;
      arr=areneArrangementClinch(prev,dominant,posClinch,i);
      fin=areneFinClinch(arr,dominant,posClinch,i);
    }else{
      arr={A:{x:posA.x,y:posA.y},B:{x:posB.x,y:posB.y}};
      fin=(phase==='clinch')?areneFinClinch(arr,dominant,posClinch,i)
        :(phase==='sol')?areneFinSol(arr,top,posSol,i)
        :(phase==='fini')?arr
        :(phase==='exam')?{A:{x:arr.A.x,y:arr.A.y},B:{x:arr.B.x,y:arr.B.y}}
        :areneFinDebout(arr,i);
    }
    /* Signature de l'action (vision : « chaque action a sa signature ») —
       lue sur le moment, jamais inventée. */
    let act=null;
    if(b.finish){
      /* Finition : l'arc qui se referme pour une soumission (cible = le
         vaincu) ; trait droit/arc pour un KO ; les autres arrêts (arrêt
         médical, disqualification, blessure) n'ont pas de geste — le texte
         du moteur les porte. */
      if(S.methode.indexOf('Soumission')===0){
        act={type:'sub',de:(S.vainqueur==='B'?'B':'A'),fin:true};
      }else if(S.methode.indexOf('KO')===0){
        act={type:/kick/i.test(b.text)?'kick':'punch',de:(b.by==='op'?'B':'A'),fin:true};
      }
    }else if(tr&&tr.phase==='sol'){
      act={type:'td',de:tr.top};
    }else if(phase==='sol'&&b.sub){
      act={type:'sub',de:top,boucle:true};
    }else if((phase==='debout'||phase==='clinch'||phase==='sol')&&b.by&&!(tr&&tr.phase==='debout')){
      act={type:/kick/i.test(b.text)?'kick':'punch',de:(b.by==='op'?'B':'A')};
    }
    if(act){
      act.de=act.de||'A'; act.cible=act.de==='A'?'B':'A';
      act.t0=b.t;
      act.t1=b.t+(act.fin?ARENE_FIN_S:(act.boucle?Math.max(0.8,t1-b.t):ARENE_ACTION_S));
      act.id='m'+b.i;
    }
    const tap=areneBeatTapis(b);
    if(tap) S.tapis.push({t0:b.t,t1:b.t+ARENE_TAPIS_S,cible:tap});
    segs.push({i:i,t0:b.t,t1:Math.max(b.t,t1),r:b.r,phase:phase,top:top,posSol:posSol,
      posClinch:posClinch,beat:b,act:act,nouvelleRonde:nouvelleRonde,
      prev:prev,arr:arr,fin:fin,morph:morph,
      texte:(typeof b.text==='string'?b.text.replace(ARENE_RE_TEMPS,''):'')});
    posA=fin.A; posB=fin.B;
    rPrec=b.r; phasePrec=phase; posSolPrec=posSol; topPrec=top; posClinchPrec=posClinch;
  }
  /* L'ouverture : le premier moment du moteur peut n'arriver qu'après
     plusieurs minutes de jauge — avant lui, le déroulé ne dit rien de
     plus que « debout » (arenePhaseDeroule) : les pions partent de leur
     coin et rentrent dans la cage. */
  if(beatsOr[0].t>0){
    segs.unshift({i:0,t0:0,t1:beatsOr[0].t,r:1,phase:'debout',top:null,posSol:null,
      posClinch:null,beat:null,act:null,nouvelleRonde:true,
      prev:{A:areneCoinA(),B:areneCoinB()},arr:{A:areneCoinA(),B:areneCoinB()},
      fin:{A:{x:areneCoinA().x*0.45,y:areneCoinA().y*0.45},B:{x:areneCoinB().x*0.45,y:areneCoinB().y*0.45}},
      morph:false,texte:''});
    for(let k=1;k<segs.length;k++) segs[k].i=k;
  }
  S.segs=segs;
  S.dureeCombat=Math.max(0.1,finT);
  const seed=(beatsOr.length*7919+Math.floor(finT*37)+
    (res.stats&&res.stats.A?Math.floor((res.stats.A.sigAtt||0)*101):0))>>>0;
  const departA=areneCoinA(),departB=areneCoinB();
  S._pas={A:areneMobile(departA,areneProfil(res.stats&&res.stats.A)),
    B:areneMobile(departB,areneProfil(res.stats&&res.stats.B)),
    ref:{pos:{x:0,y:-0.4},vel:{x:0,y:0},side:{x:0,y:-2.3}},rng:areneAlea(seed),segment:null,target:null,
    frames:[[departA.x,departA.y,departB.x,departB.y,0,-0.4]]};
  /* Montage d'affichage : le temps de combat 1:1, une pause d'affichage
     (les pions regagnent leur coin) avant chaque round nouveau et avant la
     première pause médicale. Les pauses n'occupent AUCUN temps de combat. */
  const montage=[];
  let d=0; examVu=false;
  for(let i=0;i<segs.length;i++){
    const sg=segs[i];
    const pauseAvantRonde=sg.nouvelleRonde&&!(i>0&&segs[i-1].phase==='exam');
    const pauseAvantExam=sg.phase==='exam'&&!examVu;
    if(pauseAvantRonde||pauseAvantExam){
      if(pauseAvantExam) examVu=true;
       const image=areneImage(S,sg.t0);
       const depuisA={x:image[0],y:image[1]};
       const depuisB={x:image[2],y:image[3]};
       montage.push({genre:'pause',d0:d,d1:d+ARENE_PAUSE_S,rNext:sg.r,
         fromA:depuisA,fromB:depuisB,refX:image[4],refY:image[5]});
      d+=ARENE_PAUSE_S;
    }
    montage.push({genre:'combat',d0:d,d1:d+(sg.t1-sg.t0),t0:sg.t0,t1:sg.t1});
    d+=sg.t1-sg.t0;
  }
  if(montage.length===0) montage.push({genre:'combat',d0:0,d1:S.dureeCombat,t0:0,t1:S.dureeCombat});
  S.montage=montage;
  S.dureeAffichage=Math.max(0.1,d);
  /* Le rejeu et les sauts dans la chronologie relisent les mêmes images. */
  areneImage(S,S.dureeCombat);
  return S;
}
function arenePosA0(){ return areneCoinA(); }
function arenePosB0(){ return areneCoinB(); }

/** Segment portant l'instant t (dichotomie — les segments sont triés).
 *  @returns {object} */
function areneSegDe(t,segs){
  let lo=0,hi=segs.length-1,res=segs[0];
  while(lo<=hi){
    const mid=(lo+hi)>>1, sg=segs[mid];
    if(t<sg.t0){ hi=mid-1; }
    else { res=sg; lo=mid+1; }
  }
  return res;
}

/** L'état de l'arène à l'instant t DE COMBAT — calculé sans canvas ni DOM.
 *  L'objet renvoyé est réutilisé d'un appel à l'autre (convention canvas du
 *  dépôt) : le copier si l'on conserve. L'appel met aussi à jour l'arbitre
 *  (il patrouille) — à appeler en ordre croissant de t.
 *  @returns {object} l'état courant (même objet à chaque appel). */
function areneMoment(session,t){
  const e=session._etat;
  const tt=Math.min(session.dureeCombat,Math.max(0,t));
  const sg=areneSegDe(tt,session.segs);
  e.t=tt; e.seg=sg.i;
  e.r=sg.r; e.phase=sg.phase; e.top=sg.top; e.posSol=sg.posSol; e.posClinch=sg.posClinch;
  e.fini=tt>=session.dureeCombat-1e-9||sg.phase==='fini';
  const image=areneImage(session,tt);
  const A={x:image[0],y:image[1]},B={x:image[2],y:image[3]};
  e.ax=A.x; e.ay=A.y; e.bx=B.x; e.by=B.y;
  e.d=areneDist(A,B);
  /* Postures — lues sur la phase et les knockdowns du déroulé. */
  let pA='debout', pB='debout';
  if(sg.phase==='sol'){
    if(e.top==='B'){ pB='sol-dessus'; pA='sol-dessous'; }
    else { pA='sol-dessus'; pB='sol-dessous'; }
  }else if(sg.phase==='fini'&&session.vainqueur!=='D'){
    if(session.vainqueur==='A'){ pB='tapis'; } else { pA='tapis'; }
  }else{
    for(const w of session.tapis){
      if(tt>=w.t0&&tt<w.t1){ if(w.cible==='A')pA='tapis'; else pB='tapis'; }
    }
  }
  e.postureA=pA; e.postureB=pB;
  /* Action en cours (signature) + éclat d'impact. */
  let act=sg.act;
  if(!act&&sg.i>0){ const psg=session.segs[sg.i-1]; if(psg.act&&tt<psg.act.t1) act=psg.act; }
  e.action=null; e.actionProg=0; e.flashA=0; e.flashB=0;
  if(act&&tt>=act.t0&&tt<act.t1){
    e.action=act;
    e.actionProg=Math.min(1,Math.max(0,(tt-act.t0)/Math.max(0.01,act.t1-act.t0)));
    if(act.type!=='sub'&&tt-act.t0<ARENE_FLASH_S){
      const f=1-(tt-act.t0)/ARENE_FLASH_S;
      if(act.cible==='A') e.flashA=f; else e.flashB=f;
    }
  }
  /* Texte du moteur — une ligne à la fois, moments clés seulement. */
  e.texte=null;
  if(sg.texte&&(tt<sg.t0+ARENE_TEXTE_S||sg.phase==='fini')) e.texte=sg.texte;
  else if(sg.i>0){ const psg=session.segs[sg.i-1]; if(psg.texte&&tt<psg.t0+ARENE_TEXTE_S) e.texte=psg.texte; }
  /* Horloge du round (temps restant, convention du moteur). */
  e.horloge=Math.min(ARENE_ROUND_LEN,Math.max(0,ARENE_ROUND_LEN-(tt-(sg.r-1)*ARENE_ROUND_LEN)));
  e.vainqueur=session.vainqueur; e.methode=session.methode;
  e.instable=!!(sg.morph&&tt-sg.t0<ARENE_MORPH_S);
  e.refX=image[4]; e.refY=image[5];
  return e;
}

/** État à l'instant d'AFFICHAGE d (montage : combat + pauses entre rounds).
 *  Les pauses occupent un temps d'affichage, jamais de temps de combat :
  *  les pions restent à leur position pour éviter toute rupture de vitesse.
 *  @returns {object} le même objet d'état d'affichage à chaque appel. */
function areneInstant(session,d){
  const e=session._etatAff;
  const dd=Math.min(session.dureeAffichage,Math.max(0,d));
  let lo=0,hi=session.montage.length-1,ent=session.montage[0];
  while(lo<=hi){
    const mid=(lo+hi)>>1, m=session.montage[mid];
    if(dd<m.d0) hi=mid-1;
    else { ent=m; lo=mid+1; }
  }
  if(ent.genre==='pause'){
     e.t=-1; e.phase='coins'; e.r=ent.rNext; e.top=null; e.posSol=null; e.posClinch=null;
     e.ax=ent.fromA.x; e.ay=ent.fromA.y;
     e.bx=ent.fromB.x; e.by=ent.fromB.y;
    e.d=areneDist({x:e.ax,y:e.ay},{x:e.bx,y:e.by});
    e.postureA='debout'; e.postureB='debout';
    e.action=null; e.actionProg=0; e.flashA=0; e.flashB=0; e.texte=null;
    e.horloge=60; e.fini=false; e.instable=false;
    e.vainqueur=session.vainqueur; e.methode=session.methode;
     e.refX=ent.refX; e.refY=ent.refY;
    return e;
  }
  return areneMoment(session,ent.t0+(dd-ent.d0));
}

/* ---- Le garde-fou du rejeu (relecture de la T1) --------------------------- */
/* ==== [ANCRE: ARENE_T2_GARDE_REJEU] — Lot 3 T2, décidé à la relecture de la
   T1 (docs/LOT-3-L-ARENE.md §3 T1) : un rejeu est fidèle SOUS LA VERSION DU
   MOTEUR qui a produit la trace. Si engine-combat.js évolue, un vieux combat
   rejoué peut finir autrement — l'historique, lui, garde l'issue vraie
   (winner, family, round stockés). Avant d'afficher un rejeu, l'arène compare
   son issue à celle qui est stockée ; si elles divergent, elle REFUSE de le
   montrer : une arène qui montre un combat finissant autrement que ce que
   l'historique annonce est un mensonge à l'écran. La famille est classée par
   mgmtMethodFamily (mgmt-corps.js) — le classificateur unique du dépôt,
   jamais une seconde table ; le round d'une décision n'existe pas sur le
   résultat du moteur (judgesVerdict) : même repli à 3 que mgmtRunEvent. ==== */
/** Compare l'issue d'un déroulé rejoué à celle stockée dans la trace.
 *  @param {{winner:string,family:string,round:number}} trace issue vraie.
 *  @param {object} res résultat du rejeu (simulateFight).
 *  @returns {boolean} vrai si le rejeu peut être montré. */
function areneVerdictFidele(trace,res){
  if(!trace||typeof trace!=='object'||!res||typeof res!=='object') return false;
  if(trace.winner!=='A'&&trace.winner!=='B'&&trace.winner!=='D') return false;
  if(res.winner!==trace.winner) return false;
  if(mgmtMethodFamily(res.method,res.winner)!==trace.family) return false;
  const round=Number.isSafeInteger(res.round)?res.round:3;
  return round===trace.round;
}
/* ==== [FIN ANCRE] ==== */
