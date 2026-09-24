"use strict";
/* CAGE LEGACY — arene-vue.js
   ============================================================================
   LOT 3 T2 — LE SOCLE DE L'ARÈNE NEUVE : LE DESSIN (docs/LOT-3-L-ARENE.md
   §3 T2 ; vision § Direction artistique et § L'affichage du combat).

   LE DESSIN consomme l'état (arene-etat.js) et le peint sur le canvas.
   Aucune règle, aucune décision : il dessine ce qu'on lui donne. Le rendu
   repris du prototype validé le 17/09 (prototypes/arene.html) :
   projection de trois quarts (TILT/ZF), octogone à l'échelle réelle
   (RS=4.3, ARENE_RV — géométrie portée par arene-etat.js), tapis clair et
   grillage noir, pions à plat jamais surélevés, arbitre dans la cage.
   Chaque action a sa signature : trait droit pour un poing, arc pour un
   coup de pied, ruée pour une amenée au sol, arc qui se referme pour une
   soumission. Le texte, les noms, le résultat : côté écran (arene-ecran.js).

   Convention canvas du dépôt (CLAUDE.md §6) : dans les boucles
   requestAnimationFrame, réutiliser les objets — points scratch (_p1..),
   pool de particules fixe (_fx), aucun malloc par image.

   Sans canvas (harnais de test) : areneVueCreer rend null et
   areneVueDessiner ne fait rien — l'état, lui, se calcule quand même.
   areneVueDetruire débranche l'écouteur de redimensionnement (départ
   d'écran). Portée globale classique, préfixe arene distinct de l'ancienne
   arène.
   ============================================================================ */

/* ==== [ANCRE: ARENE_T2_VUE] — Lot 3 T2 le socle de l'arène neuve : le
   dessin (projection de trois quarts, grillage, pions à plat, signatures
   d'actions, pool de particules réutilisé). ==== */
const ARENE_TILT=0.6;   // aplatissement vertical de la vue de trois quarts
const ARENE_ZF=0.78;    // poids de la hauteur z (semi-3D)
const ARENE_CAGE_H=1.8; // hauteur du grillage (m, échelle réelle)

/* Correctif T2 (reprise) : areneVueDimensionner n'était appelé qu'à la
   création. Si le canvas mesure moins de 10px à ce moment (affichage pas
   encore fait, #app encore plafonné...), la fonction sort tôt, vue.W reste
   à 0 et areneVueDessiner ne dessine plus JAMAIS rien. La vue écoute donc
   le redimensionnement d'elle-même tant qu'elle vit ; l'écouteur est
   débranché par areneVueDetruire, appelé en quittant l'écran — jamais
   d'écouteur qui survit à la sortie. */

/** Détache la vue : débranche l'écouteur de redimensionnement. Sans
 *  effet sur une vue fantôme (harnais). */
function areneVueDetruire(vue){
  if(!vue||!vue._onResize||typeof window==='undefined'||typeof window.removeEventListener!=='function') return;
  window.removeEventListener('resize',vue._onResize);
  vue._onResize=null;
}

/** Crée la vue d'un canvas. Sans canvas vrai, rend null : rien ne plante.
 *  @returns {object|null} */
function areneVueCreer(cv){
  if(!cv||typeof cv.getContext!=='function') return null;
  const ctx=cv.getContext('2d');
  if(!ctx) return null;
  const vue={cv:cv,ctx:ctx,W:0,H:0,dpr:1,SC:1,CX:0,CY:0,bg:null,
    _p1:{x:0,y:0,s:1},_p2:{x:0,y:0,s:1},_p3:{x:0,y:0,s:1},_p4:{x:0,y:0,s:1},
    _fx:[],_lastActionId:null,_dernierNow:0};
  for(let i=0;i<80;i++) vue._fx.push({actif:false});
  areneVueDimensionner(vue);
  /* La vue se redimensionne après coup (correctif T2) : une première mesure
     nulle (canvas encore invisible) ou un changement de fenêtre relancent
     le cadrage. Débranchée par areneVueDetruire à la sortie de l'écran. */
  if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
    vue._onResize=function(){ areneVueDimensionner(vue); };
    window.addEventListener('resize',vue._onResize);
  }
  /* Première mesure nulle : retenter une fois la mise en page faite — le
     canvas vient d'être inséré, clientWidth peut encore être à 0 ici. */
   if(!(vue.W>=10)&&typeof requestAnimationFrame!=='undefined'){
     requestAnimationFrame(function(){
       if(vue._onResize){
         areneVueDimensionner(vue);
         if(vue.W>=10&&typeof ARENE_ECRAN!=='undefined'&&ARENE_ECRAN.vue===vue&&!ARENE_ECRAN.raf)
           ARENE_ECRAN.raf=requestAnimationFrame(areneEcranBoucle);
       }
     });
  }
  return vue;
}
/** Recadre la vue sur la taille CSS du canvas (fond reconstruit). */
function areneVueDimensionner(vue){
  const w=vue.cv.clientWidth;
  if(!(w>=10)) return;
  vue.dpr=(typeof window!=='undefined'&&window.devicePixelRatio)||1;
  vue.W=w;
   /* T4 : réserver au HUD et aux commandes leur place dans la même vue
      1920×1080 que la maquette. À largeur égale, seul le cadrage change. */
   vue.H=Math.round(Math.min(w*(w<640?0.9:0.58),
     Math.max(360,(typeof window!=='undefined'?window.innerHeight:1080)-340)));
  vue.cv.style.height=vue.H+'px';
  vue.cv.width=Math.round(vue.W*vue.dpr);
  vue.cv.height=Math.round(vue.H*vue.dpr);
  vue.SC=Math.min(vue.W*0.47/(ARENE_RV+0.9),vue.H*0.47/((ARENE_RV+0.9)*ARENE_TILT+ARENE_CAGE_H*ARENE_ZF*0.55));
  vue.CX=vue.W/2; vue.CY=vue.H*0.56;
  areneVueFond(vue);
}
/** Projection de trois quarts (prototype, validé) : x/y au sol, z en
 *  hauteur. Écrit dans out — jamais d'objet alloué par image. */
function areneProj(vue,x,y,z,out){
  const k=1+(y/ARENE_RV)*0.07;
  out.x=vue.CX+x*vue.SC*k;
  out.y=vue.CY+y*vue.SC*ARENE_TILT*k-(z||0)*vue.SC*k*ARENE_ZF;
  out.s=vue.SC*k;
  return out;
}
/** Le fond : salle (fond prune chaud, jamais noir), public, pourtour, tapis
 *  clair, marquages. Reconstruit au redimensionnement uniquement. */
function areneVueFond(vue){
  if(typeof document==='undefined') return;
  let bg=null;
  try{
    bg=document.createElement('canvas');
    bg.width=vue.cv.width; bg.height=vue.cv.height;
  }catch(e){ return; }
  const g=bg.getContext('2d');
  if(!g) return;
  g.setTransform(vue.dpr,0,0,vue.dpr,0,0);
  const rad=g.createRadialGradient(vue.CX,vue.CY,vue.SC*2,vue.CX,vue.CY,Math.max(vue.W,vue.H));
  rad.addColorStop(0,'#3A2F33'); rad.addColorStop(1,'#1A1517');
  g.fillStyle=rad; g.fillRect(0,0,vue.W,vue.H);
  /* Le public — anneau de points, semé une fois (déterministe). */
  const r2=areneAlea(42);
  for(let i=0;i<900;i++){
    const a=r2()*Math.PI*2, rr=ARENE_RV+1.6+r2()*6;
    const p=areneProj(vue,Math.cos(a)*rr,Math.sin(a)*rr,0,vue._p4);
    if(p.x<-10||p.x>vue.W+10||p.y<-10||p.y>vue.H+10) continue;
    const s=r2(), l=r2();
    g.fillStyle=l>0.985?'rgba(255,248,238,.5)':'rgba('+(120+Math.floor(s*60))+','+(100+Math.floor(s*40))+','+(95+Math.floor(s*40))+','+(0.12+s*0.14)+')';
    g.beginPath(); g.arc(p.x,p.y,1+s*2.2,0,Math.PI*2); g.fill();
  }
  const poly=function(pts,fill,stroke,lw){
    g.beginPath();
    for(let i=0;i<pts.length;i++){ if(i)g.lineTo(pts[i].x,pts[i].y); else g.moveTo(pts[i].x,pts[i].y); }
    g.closePath();
    if(fill){ g.fillStyle=fill; g.fill(); }
    if(stroke){ g.strokeStyle=stroke; g.lineWidth=lw||1; g.stroke(); }
  };
  const anneau=function(r){
    const pts=[];
    for(let k=0;k<8;k++){ const v=areneVert(k,r); pts.push({x:areneProj(vue,v.x,v.y,0,vue._p4).x,y:areneProj(vue,v.x,v.y,0,vue._p4).y}); }
    return pts;
  };
  poly(anneau(ARENE_RV+0.9),'#2C2629');
  /* Les trois entrées de la cage (passerelles sombres). */
  const passages=[[0,ARENE_RV+1.6],[-ARENE_RV-1.6,0],[ARENE_RV+1.6,0]];
  for(let i=0;i<passages.length;i++){
    const px=passages[i][0], py=passages[i][1];
    const a=areneProj(vue,px-0.9,py-0.25,0,vue._p4), b=areneProj(vue,px+0.9,py+0.25,0,vue._p4);
    g.fillStyle='#3A3236';
    g.fillRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y));
  }
  /* Le tapis clair (vision : « tapis clair et grillage noir »). */
  const mat=g.createRadialGradient(vue.CX,vue.CY,0,vue.CX,vue.CY,vue.SC*ARENE_RV*1.1);
  mat.addColorStop(0,'#F4EFE7'); mat.addColorStop(1,'#DAD3C8');
  poly(anneau(ARENE_RV),mat);
  poly(anneau(2.5),null,'rgba(60,48,52,.35)',2.5);
  /* Marquages du centre (motif de la marque). */
  g.save(); g.translate(vue.CX,vue.CY); g.scale(1,ARENE_TILT);
  g.textAlign='center'; g.textBaseline='middle';
   /* Lot 3 T4 : le lettrage du prototype, atténué sur la zone de travail
      pour que les deux pions restent lisibles au centre du tapis. */
   g.fillStyle='rgba(229,50,45,.34)';
   g.font='800 italic '+Math.round(vue.SC*1.15)+"px 'Saira Condensed', sans-serif";
  g.fillText('SPLIT',0,0);
  g.fillStyle='rgba(60,48,52,.28)';
   g.font='700 '+Math.round(vue.SC*0.36)+"px 'Saira Condensed', sans-serif";
  g.fillText('SPLIT 14',0,-vue.SC*3.3);
  g.fillText('CAGE LEGACY',0,vue.SC*3.3);
  g.restore();
  vue.bg=bg;
}
/* ==== [ANCRE: ARENE_T4_RENDU] — Lot 3 T4, section 11 du prototype :
   grillage, pions, étiquettes, arbitre, coins, signatures et ordre du dessin. ==== */
/** Le grillage : huit panneaux, avant ou arrière, poteaux et coins colorés. */
function areneGrillage(vue,avant){
  const ctx=vue.ctx;
  for(let k=0;k<8;k++){
    const a=areneVert(k), b=areneVert(k+1);
    const my=(a.y+b.y)/2;
    if((my>0)!==avant) continue;
     const a0=areneProj(vue,a.x,a.y,0,vue._p1), b0=areneProj(vue,b.x,b.y,0,vue._p2);
     const a1=areneProj(vue,a.x,a.y,ARENE_CAGE_H,vue._p3), b1=areneProj(vue,b.x,b.y,ARENE_CAGE_H,vue._p4);
    ctx.beginPath();
    ctx.moveTo(a0.x,a0.y); ctx.lineTo(b0.x,b0.y); ctx.lineTo(b1.x,b1.y); ctx.lineTo(a1.x,a1.y);
    ctx.closePath();
    ctx.fillStyle=avant?'rgba(20,15,17,.10)':'rgba(20,15,17,.22)';
    ctx.fill();
    ctx.strokeStyle=avant?'rgba(20,15,17,.16)':'rgba(20,15,17,.25)'; ctx.lineWidth=1;
    for(let i=1;i<10;i++){
      const t=i/10;
       const p0=areneProj(vue,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,0,vue._p3);
       const p1=areneProj(vue,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,ARENE_CAGE_H,vue._p4);
      ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
    }
    ctx.strokeStyle='#171214'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(a1.x,a1.y); ctx.lineTo(b1.x,b1.y); ctx.stroke();
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(a0.x,a0.y); ctx.lineTo(b0.x,b0.y); ctx.stroke();
  }
  for(let k=0;k<8;k++){
    const v=areneVert(k);
    if((v.y>0)!==avant) continue;
     const p0=areneProj(vue,v.x,v.y,0,vue._p1), p1=areneProj(vue,v.x,v.y,ARENE_CAGE_H,vue._p2);
    ctx.strokeStyle='#171214'; ctx.lineWidth=Math.max(4,vue.SC*0.08);
    ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
    const coul=k===ARENE_COIN_A?ARENE_COUL_A:(k===ARENE_COIN_B?ARENE_COUL_B:'#171214');
    ctx.fillStyle=coul;
    ctx.fillRect(p1.x-vue.SC*0.07,p1.y-vue.SC*0.05,vue.SC*0.14,vue.SC*0.5);
  }
}
function areneEllipse(vue,x,y,rx,ry,fill){
  const ctx=vue.ctx;
  ctx.beginPath(); ctx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2);
  ctx.fillStyle=fill; ctx.fill();
}
/** Un pion à plat sur le tapis — jamais surélevé (vision). posture :
 *  'debout' (marque d'orientation vers l'adversaire), 'sol-dessus' (debout,
 *  plus ramassé), 'sol-dessous'/'tapis' (allongé). */
function arenePion(vue,x,y,coul,posture,orient,flash){
  const ctx=vue.ctx;
   const c={x:x,y:y,s:vue.SC};
  const rx=ARENE_CORPS*c.s, ry=rx*ARENE_TILT;
  const allonge=(posture==='sol-dessous'||posture==='tapis');
  areneEllipse(vue,c.x+rx*0.1,c.y+ry*0.22,rx*1.08,ry*1.1,'rgba(40,28,30,.18)');
  if(allonge){
    const ang=Math.atan2((orient?orient.y:0)*ARENE_TILT,(orient?orient.x:1));
    ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(ang);
    ctx.beginPath(); ctx.ellipse(0,0,rx*1.5,ry*0.95,0,0,Math.PI*2);
    ctx.fillStyle='#1F1A1D'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0,0,rx*1.22,ry*0.68,0,0,Math.PI*2);
    ctx.fillStyle=coul; ctx.globalAlpha=0.85; ctx.fill();
    ctx.restore(); ctx.globalAlpha=1;
  }else{
    areneEllipse(vue,c.x,c.y,rx,ry,'#1F1A1D');
    areneEllipse(vue,c.x,c.y,rx*0.78,ry*0.78,coul);
     if(posture==='debout'&&orient){
      const u=orient;
      const tip={x:c.x+(u.x*ARENE_CORPS*1.28)*c.s,y:c.y+(u.y*ARENE_CORPS*1.28)*c.s*ARENE_TILT};
      const l={x:c.x+(u.x*0.82-u.y*0.3)*ARENE_CORPS*c.s,y:c.y+(u.y*0.82+u.x*0.3)*ARENE_CORPS*c.s*ARENE_TILT};
      const r={x:c.x+(u.x*0.82+u.y*0.3)*ARENE_CORPS*c.s,y:c.y+(u.y*0.82-u.x*0.3)*ARENE_CORPS*c.s*ARENE_TILT};
      ctx.fillStyle='#1F1A1D';
      ctx.beginPath(); ctx.moveTo(tip.x,tip.y); ctx.lineTo(l.x,l.y); ctx.lineTo(r.x,r.y); ctx.closePath(); ctx.fill();
     }
  }
  if(flash>0){
    ctx.globalAlpha=flash*0.7;
    areneEllipse(vue,c.x,c.y,rx*(allonge?1.4:1),ry*(allonge?0.9:1),'#FFF8EE');
    ctx.globalAlpha=1;
  }
  return c;
}
/** L'étiquette d'un pion : le nom, liseré de coin. */
function areneEtiquette(vue,x,y,texte,coul){
  const ctx=vue.ctx;
  const ry=ARENE_CORPS*vue.SC*ARENE_TILT;
  const taille=Math.round(Math.min(19,Math.max(12,vue.SC*0.2)));
   ctx.font='700 italic '+taille+"px 'Saira Condensed', sans-serif";
  ctx.textAlign='center';
  const w=ctx.measureText(texte).width;
   /* Le texte est décalé vers le côté libre, à la manière de la maquette
      vidéo : même en clinch, il ne recouvre pas le corps adverse. */
   const yy=y-ry-taille*1.7;
  ctx.fillStyle='rgba(31,26,29,.82)';
  ctx.fillRect(x-w/2-6,yy-taille+2,w+12,taille+4);
  ctx.fillStyle=coul;
  ctx.fillRect(x-w/2-6,yy+4,w+12,2);
  ctx.fillStyle='#FFF8EE';
  ctx.fillText(texte,x,yy);
}
/** L'arbitre, dans la cage (vision). */
function areneArbitre(vue,x,y){
  const rx=0.22*vue.SC, ry=rx*ARENE_TILT;
  areneEllipse(vue,x+rx*0.1,y+ry*0.22,rx*1.05,ry*1.05,'rgba(40,28,30,.16)');
  areneEllipse(vue,x,y,rx,ry,'#1F1A1D');
  areneEllipse(vue,x,y,rx*0.62,ry*0.62,'#8C8388');
}
/** Les hommes de coin, pendant les pauses. */
function areneCoins(vue){
  for(const ck of [ARENE_COIN_A,ARENE_COIN_B]){
    const v=areneVert(ck,ARENE_RV+0.45);
    const n=areneNorm(v);
    for(const s of [-1,1]){
      const q={x:v.x-n.y*0.35*s,y:v.y+n.x*0.35*s};
      const p=areneProj(vue,q.x,q.y,0,vue._p1);
      const rx=0.18*p.s;
      areneEllipse(vue,p.x,p.y,rx,rx*ARENE_TILT,'#4A4145');
    }
  }
}
/* ---- Pool de signatures (réutilisé, jamais alloué par image) -------------- */
/** Réserve un emplacement du pool (premier inactif). @returns {object|null} */
function areneFxSpawn(vue,o){
  for(let i=0;i<vue._fx.length;i++){
    const f=vue._fx[i];
    if(!f.actif){
      f.actif=true; f.t=0;
      f.kind=o.kind; f.dur=o.dur; f.ax=o.ax; f.ay=o.ay; f.bx=o.bx; f.by=o.by;
      f.coul=o.coul||'#1F1A1D'; f.w=o.w||1; f.big=!!o.big;
      return f;
    }
  }
  return null;
}
function areneFxAvance(vue,dt){
  for(let i=0;i<vue._fx.length;i++){
    const f=vue._fx[i];
    if(!f.actif) continue;
    f.t+=dt;
    if(f.t>=f.dur) f.actif=false;
  }
}
/** Signatures au sol (anneaux d'impact, poussière) — sous les pions. */
function areneFxDessinerSol(vue){
  const ctx=vue.ctx;
  for(let i=0;i<vue._fx.length;i++){
    const f=vue._fx[i];
    if(!f.actif||(f.kind!=='ring'&&f.kind!=='dust')) continue;
    const k=f.t/f.dur;
    const p=areneProj(vue,f.bx,f.by,0,vue._p1);
    ctx.save();
    if(f.kind==='ring'){
      const r=(f.big?(0.25+0.55*k):(0.12+0.28*k))*p.s;
      ctx.globalAlpha=1-k;
      ctx.strokeStyle=f.big?ARENE_COUL_A:'#1F1A1D';
      ctx.lineWidth=f.big?4:2.5;
      ctx.beginPath(); ctx.ellipse(p.x,p.y,r,r*ARENE_TILT,0,0,Math.PI*2); ctx.stroke();
    }else{
      const r=(0.3+0.9*k)*p.s;
      ctx.globalAlpha=(1-k)*0.6;
      ctx.strokeStyle='#8C8388'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.ellipse(p.x,p.y,r,r*ARENE_TILT,0,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}
/** Signatures aériennes (trait droit, arc, ruée) — au-dessus des pions. */
function areneFxDessinerVols(vue){
  const ctx=vue.ctx;
  for(let i=0;i<vue._fx.length;i++){
    const f=vue._fx[i];
    if(!f.actif||(f.kind!=='punch'&&f.kind!=='kick'&&f.kind!=='td')) continue;
    const k=f.t/f.dur;
    const A=areneProj(vue,f.ax,f.ay,ARENE_CORPS*0.8,vue._p1);
    const B=areneProj(vue,f.bx,f.by,ARENE_CORPS*0.8,vue._p2);
    const grow=Math.min(1,k*3.5), fondu=1-Math.max(0,(k-0.45)/0.55);
    ctx.save();
    ctx.globalAlpha=fondu; ctx.lineCap='round';
    ctx.strokeStyle='#1F1A1D'; ctx.lineWidth=(f.kind==='td'?3.5:2.5)+f.w*4.5;
    ctx.beginPath();
    if(f.kind==='kick'||f.kind==='td'){
      const dx=f.bx-f.ax, dy=f.by-f.ay;
      const M=areneProj(vue,f.ax+dx*0.5-dy*0.45,f.ay+dy*0.5+dx*0.45,ARENE_CORPS*0.8,vue._p3);
      const qx=(1-grow)*(1-grow)*A.x+2*(1-grow)*grow*M.x+grow*grow*B.x;
      const qy=(1-grow)*(1-grow)*A.y+2*(1-grow)*grow*M.y+grow*grow*B.y;
      ctx.moveTo(A.x,A.y);
      ctx.quadraticCurveTo(A.x+(M.x-A.x)*grow,A.y+(M.y-A.y)*grow,qx,qy);
    }else{
      ctx.moveTo(A.x,A.y);
      ctx.lineTo(A.x+(B.x-A.x)*grow,A.y+(B.y-A.y)*grow);
    }
    ctx.stroke();
    ctx.strokeStyle=f.coul; ctx.lineWidth=1+f.w*2.4;
    ctx.stroke();
    ctx.restore();
  }
}
/** L'arc qui se referme d'une soumission (vision), autour du menacé. */
function areneArcSoumission(vue,x,y,prog,coul){
  const ctx=vue.ctx;
  const p=areneProj(vue,x,y,0,vue._p1);
  const r=ARENE_CORPS*2*p.s;
  ctx.save();
  ctx.strokeStyle=coul; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath();
  ctx.ellipse(p.x,p.y,r,r*ARENE_TILT,0,-Math.PI/2,-Math.PI/2+Math.PI*2*prog);
  ctx.stroke();
  ctx.restore();
}

/** Dessine l'image du combat : fond, grillage arrière, sol, pions triés par
 *  profondeur, signatures, grillage avant, étiquettes. Ne décide rien :
 *  tout vient de l'état (arene-etat.js). */
function areneVueDessiner(vue,session,etat,now){
  if(!vue||!vue.ctx||vue.W<10) return;
  const ctx=vue.ctx;
  const dt=(typeof now==='number'&&vue._dernierNow>0)?Math.min(0.05,Math.max(0,(now-vue._dernierNow)/1000)):0;
  vue._dernierNow=now||0;
  ctx.setTransform(1,0,0,1,0,0);
  if(vue.bg) ctx.drawImage(vue.bg,0,0);
  ctx.setTransform(vue.dpr,0,0,vue.dpr,0,0);
  areneGrillage(vue,false);
  /* Signatures nées d'une action nouvelle (une seule fois par action). */
  if(etat.action&&etat.action.id!==vue._lastActionId){
    vue._lastActionId=etat.action.id;
    const act=etat.action;
    const de={x:act.de==='A'?etat.ax:etat.bx,y:act.de==='A'?etat.ay:etat.by};
    const ci={x:act.cible==='A'?etat.ax:etat.bx,y:act.cible==='A'?etat.ay:etat.by};
    if(act.type==='punch'||act.type==='kick'){
      areneFxSpawn(vue,{kind:act.type,dur:0.32,ax:de.x,ay:de.ay,bx:ci.x,by:ci.y,
        coul:act.de==='A'?ARENE_COUL_A:ARENE_COUL_B,w:act.fin?1.6:0.8});
      areneFxSpawn(vue,{kind:'ring',dur:act.fin?0.5:0.28,bx:ci.x,by:ci.y,big:!!act.fin});
    }else if(act.type==='td'){
      areneFxSpawn(vue,{kind:'td',dur:0.38,ax:de.x,ay:de.ay,bx:ci.x,by:ci.y,
        coul:act.de==='A'?ARENE_COUL_A:ARENE_COUL_B,w:1});
      areneFxSpawn(vue,{kind:'dust',dur:0.6,bx:ci.x,by:ci.y});
    }else if(act.type==='sub'){
      areneFxSpawn(vue,{kind:'ring',dur:0.4,bx:ci.x,by:ci.y,big:false});
    }
  }
  if(!etat.action) vue._lastActionId=null;
  areneFxAvance(vue,dt);
  areneFxDessinerSol(vue);
  /* Entités triées par profondeur ; au sol, le dessous se dessine d'abord. */
   const ents=[];
  ents.push({y:etat.refY,genre:'ref'});
  const decA=(etat.postureA==='sol-dessous'||etat.postureA==='tapis')?-10:0;
  const decB=(etat.postureB==='sol-dessous'||etat.postureB==='tapis')?-10:0;
  ents.push({y:etat.ay+decA,genre:'A'});
  ents.push({y:etat.by+decB,genre:'B'});
  ents.sort(function(a,b){ return a.y-b.y; });
  const orientA=areneNorm({x:etat.bx-etat.ax,y:etat.by-etat.ay});
  for(let i=0;i<ents.length;i++){
    const en=ents[i];
    if(en.genre==='ref'){
      const p=areneProj(vue,etat.refX,etat.refY,0,vue._p1);
      areneArbitre(vue,p.x,p.y);
    }else if(en.genre==='A'){
      const p=areneProj(vue,etat.ax,etat.ay,0,vue._p1);
      arenePion(vue,p.x,p.y,ARENE_COUL_A,etat.postureA,{x:-orientA.x,y:-orientA.y},etat.flashA);
    }else{
      const p=areneProj(vue,etat.bx,etat.by,0,vue._p1);
      arenePion(vue,p.x,p.y,ARENE_COUL_B,etat.postureB,orientA,etat.flashB);
    }
  }
  if(etat.phase==='coins') areneCoins(vue);
  areneFxDessinerVols(vue);
  /* L'arc de soumission au-dessus des pions, sous le grillage avant. */
  if(etat.action&&etat.action.type==='sub'){
    const ci={x:etat.action.cible==='A'?etat.ax:etat.bx,y:etat.action.cible==='A'?etat.ay:etat.by};
    const brut=etat.action.fin?etat.actionProg:((etat.actionProg*3)%1);
    areneArcSoumission(vue,ci.x,ci.y,areneLisse(brut),ARENE_COUL_B);
  }
  areneGrillage(vue,true);
  /* Étiquettes : au sol, celle du dessus seulement (le dessous est couvert). */
  const pa=areneProj(vue,etat.ax,etat.ay,0,vue._p1);
  const pb=areneProj(vue,etat.bx,etat.by,0,vue._p2);
  const sol=(etat.phase==='sol');
   if(!sol){
     areneEtiquette(vue,pa.x,pa.y,session.noms.a.court.toUpperCase(),ARENE_COUL_A);
     areneEtiquette(vue,pb.x,pb.y,session.noms.b.court.toUpperCase(),ARENE_COUL_B);
  }else{
    const topP=(etat.top==='B')?pb:pa;
    const topC=(etat.top==='B')?ARENE_COUL_B:ARENE_COUL_A;
    const topT=(etat.top==='B')?session.noms.b.court:session.noms.a.court;
    areneEtiquette(vue,topP.x,topP.y,topT.toUpperCase(),topC);
  }
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
