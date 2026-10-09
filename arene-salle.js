"use strict";
/* CAGE LEGACY — arene-salle.js
   ============================================================================
   LOT 11 — LE COMBAT ANIMÉ ET LA SALLE (planches « Le combat animé », « Règles 3 »,
   « La salle », « Plan fixe »). Ce fichier PEINT, il ne décide rien : il lit l'état de
   l'arène (arene-etat.js), les échanges, le commentaire et les coins de la session
   (arene-coups.js) et dessine, sur un canvas de 1920 × 1080, la cage, ses abords, la
   salle et les voix. Le dessin est celui de la planche (même géométrie, mêmes couleurs,
   mêmes proportions) ; seule la source des positions change : elles viennent du
   déroulé du moteur au lieu d'un scénario écrit.
   Ce que montre l'image : des pions à plat (jamais de personnages), une caméra sur câble
   qui suit l'action et quatre plans fixes (plafond, large, un par coin), une étiquette
   qui nomme le coup à côté de celui qui frappe, le commentaire en bas à gauche toujours
   droit, les coins en haut chacun de son côté, et la salle plus ou moins pleine.
   Ce qu'elle ne montre JAMAIS : une jauge, une barre de moments clés, un indicateur de
   domination (« Ce sont les juges qui décident »).
   Passage monde → planche : l'octogone du jeu est en mètres (apothème 4,3) ; la planche
   le prend en unités d'apothème, tourné d'un quart de tour pour que le coin du premier
   combattant tombe sur le coin de la planche. Sans canvas (harnais de test) la vue est
   nulle et rien ne se dessine.
   ============================================================================ */

/* ==== [ANCRE: ARENE_LOT11_SALLE] — Lot 11 : la salle et l'image du combat. ==== */
const SAL_W=1920, SAL_H=1080, SAL_CY=580, SAL_TAU=Math.PI*2, SAL_SEG=Math.PI/4, SAL_VTX=1.0824;
const SAL_C={ink:'#0D0B0B',panel:'#121010',cr:'#E9E6E1',crf:'#BDB9B3',red:'#E23A2B',rdf:'#B32A1E',floor:'#1C1818',grey:'#6A6562',greyf:'#4E4A47',
  line:'rgba(233,230,225,0.62)',soft:'rgba(233,230,225,0.74)'};
const SAL_FX='"Saira Extra Condensed", "Arial Narrow", sans-serif', SAL_FC='"Saira Condensed", "Arial Narrow", sans-serif';
/** Les cinq caméras : le câble suit l'action, les quatre autres ne bougent pas. */
const ARENE_SALLE_PLANS=['cable','plafond','large','coinA','coinB'];
const SAL_PLANS={
  plafond:{zoom:310,az:0,ky:1,x:0,y:0.08},
  large:{zoom:300,az:0.3,ky:0.5,x:0,y:-0.1},
  coinA:{zoom:440,az:-0.3927,ky:0.6,x:-0.05,y:0.12},
  coinB:{zoom:440,az:2.7489,ky:0.6,x:0.05,y:-0.12},
};
/** Le libellé d'une caméra (pastille en haut à droite) et son bouton. */
function areneSallePlanLibelle(id,noms,court){
  if(id==='cable') return court?'CÂBLE':'CAMÉRA SUR CÂBLE';
  if(id==='plafond') return court?'PLAFOND':'PLAN FIXE · PLAFOND';
  if(id==='large') return court?'LARGE':'PLAN FIXE · LARGE';
  const nom=String(id==='coinA'?(noms&&noms.a):(noms&&noms.b)||'').toUpperCase();
  return court?('COIN '+nom).trim():('PLAN FIXE · COIN DE '+nom).trim();
}
function salLerp(a,b,t){ return a+(b-a)*t; }
function salEase(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
function salHash(n){ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function salMix(c1,c2,t){ t=clamp(t,0,1); return 'rgb('+Math.round(salLerp(c1[0],c2[0],t))+','+Math.round(salLerp(c1[1],c2[1],t))+','+Math.round(salLerp(c1[2],c2[2],t))+')'; }
function salSample(keys,t){
  const n=keys.length;
  if(t<=keys[0][0]) return keys[0];
  if(t>=keys[n-1][0]) return keys[n-1];
  for(let i=0;i<n-1;i++){
    const a=keys[i], b=keys[i+1];
    if(t>=a[0]&&t<=b[0]){ const p=salEase((t-a[0])/(b[0]-a[0])), o=[t]; for(let j=1;j<a.length;j++) o.push(salLerp(a[j],b[j],p)); return o; }
  }
  return keys[n-1];
}
/** Un point sur un octogone aligné sur la cage : r est la distance du centre au milieu d'un côté. */
function salOct(r,phi){ const a=((phi+SAL_SEG/2)%SAL_SEG+SAL_SEG)%SAL_SEG-SAL_SEG/2, rr=r/Math.cos(a); return [Math.cos(phi)*rr,Math.sin(phi)*rr]; }
/** Du monde du jeu (mètres) à la planche (unités d'apothème, quart de tour). */
function salConv(x,y){ return [y/ARENE_RS,-x/ARENE_RS]; }

/* ---- Les gradins : un anneau en bas, un couloir, un anneau en haut ---- */
const SAL_R_APRON=1.2, SAL_R_SIDE=1.5, SAL_R_STAND=1.56, SAL_ROW=0.2, SAL_ROW_W=0.165, SAL_NT=15, SAL_M=96;
function salRowR(i){ return SAL_R_STAND+i*SAL_ROW+(i>6?0.26:0); }
function salRowZ(i){ return 0.05+i*0.075+(i>6?0.14:0); }
function salAisle(j){ return j%12===6; }
function salWalk(j){ return j===11||j===12||j===59||j===60; }
const SAL_U=(function(){ const u=[]; for(let j=0;j<=SAL_M;j++) u.push(salOct(1,j/SAL_M*SAL_TAU)); return u; })();
const SAL_ROWP=(function(){ const o=[]; let tot=0,c=0; for(let i=0;i<SAL_NT;i++) tot+=salRowR(i); for(let i=0;i<SAL_NT;i++){ o.push(c/tot); c+=salRowR(i); } return o; })();
function salOccRow(i,f){ if(f>=0.98) return 0.99; return clamp(0.5+(f*1.5-0.25-SAL_ROWP[i])/0.5,0,0.99); }

/** La salle à un instant de la soirée. `fill` : la part de la salle qui sera remplie au plus haut de la soirée (la
 *  part calculée au lot 8, `taux`) ; `prog` : 0 au premier préliminaire, 1 au combat principal. La salle part d'un bon
 *  tiers de son pic et monte jusqu'à lui ; le haut est bâché seulement si le pic lui-même ne le remplit pas.
 *  @returns {{occ:number[],closed:boolean,even:boolean,noise:number,part:number}} */
function areneSalleRoom(fill,prog){
  const f=clamp(Number.isFinite(fill)?fill:0.65,0,1), p=clamp(Number.isFinite(prog)?prog:1,0,1);
  const now=f*salLerp(0.35,1,p), occ=[]; let closed=true;
  for(let i=0;i<SAL_NT;i++){ occ.push(salOccRow(i,now)); if(i>6&&salOccRow(i,f)>0.02) closed=false; }
  return {occ:occ,closed:closed,even:now>=0.98,noise:clamp(0.5+0.5*f,0.5,1)*salLerp(0.6,1,p),part:now};
}

/** La décision à annoncer à la fin du combat, lue sur le résultat du moteur (jamais recalculée). Les cartes des trois
 *  juges n'existent que pour une décision. @returns {{decision:boolean,nul:boolean,gagnant:string,titre:string,nom:string,cartes:Array}} */
function areneSalleDecision(S){
  if(!S||!S.noms) return {decision:false,nul:true,gagnant:'D',titre:'',nom:'',cartes:[]};
  const res=S.res||{}, m=String(S.methode||'');
  const dec=m.indexOf('Décision')===0||m.indexOf('Nul')===0;
  const v=S.vainqueur==='A'||S.vainqueur==='B'?S.vainqueur:'D';
  const nom=v==='D'?'':S.noms[v==='A'?'a':'b'].complet;
  const cartes=[];
  if(dec&&res.judges){
    ['j1','j2','j3'].forEach((k,i)=>{
      const j=res.judges[k]; if(!Array.isArray(j)) return;
      const a=Number(j[0]), b=Number(j[1]);
      const pour=a>b?'A':(a<b?'B':'D');
      cartes.push({juge:'JUGE '+(i+1),score:Math.max(a,b)+'-'+Math.min(a,b),pour:pour,
        nom:pour==='D'?'NUL':S.noms[pour==='A'?'a':'b'].court.toUpperCase()});
    });
  }
  let titre;
  if(v==='D') titre='MATCH NUL';
  else if(dec) titre='VAINQUEUR PAR '+m.toUpperCase();
  else titre=m.toUpperCase()+(Number.isSafeInteger(S.roundFin)?' · ROUND '+S.roundFin:'');
  return {decision:dec,nul:v==='D',gagnant:v,titre:titre,nom:nom.toUpperCase(),cartes:cartes};
}

/** Le bord de la cage : tables, officiels, photographes, médecin, les deux coins. Construit une fois. */
const SAL_SIDE=[], SAL_CORNER={};
(function(){
  function add(kind,d,r,o){ const a=d*Math.PI/180, p=salOct(r,a), off=(o&&o.off)||0; o=o||{}; o.kind=kind; o.a=a; o.x=p[0]-Math.sin(a)*off; o.y=p[1]+Math.cos(a)*off; SAL_SIDE.push(o); return o; }
  const jd=[90,180,0];
  for(let i=0;i<3;i++){ add('table',jd[i],1.34,{L:0.11,label:'JUGE',judge:i}); add('tok',jd[i],1.44,{r:0.042,col:'#57524F',dark:'#2E2B29'}); }
  add('table',270,1.34,{L:0.23,label:'COMMENTATEURS'}); add('tok',270,1.44,{r:0.042,col:'#57524F',dark:'#2E2B29',off:-0.1}); add('tok',270,1.44,{r:0.042,col:'#57524F',dark:'#2E2B29',off:0.1});
  add('table',135,1.34,{L:0.075,label:'CHRONO',chrono:1}); add('tok',135,1.44,{r:0.042,col:'#57524F',dark:'#2E2B29'});
  add('tok',22.5,1.3,{r:0.046,col:SAL_C.cr,dark:SAL_C.crf,cross:1,label:'MÉDECIN'});
  [67.5,157.5,202.5,247.5,315,337.5].forEach((d,i)=>add('tok',d,1.27,{r:0.036,col:'#2A2626',dark:'#161313',lens:1,photo:i+1}));
  [34,56,214,236].forEach(d=>add('tok',d,1.5,{r:0.04,col:'#3A3634',dark:'#1F1C1B'}));
  SAL_CORNER.A=add('tok',112.5,1.19,{r:0.06,col:SAL_C.crf,dark:'#8C8884',who:'A'});
  add('tok',112.5,1.33,{r:0.044,col:'#8C8884',dark:'#5E5B58',off:-0.11,team:1}); add('tok',112.5,1.33,{r:0.044,col:'#8C8884',dark:'#5E5B58',off:0.11,team:1});
  SAL_CORNER.B=add('tok',292.5,1.19,{r:0.06,col:SAL_C.rdf,dark:'#7A1D15',who:'B'});
  add('tok',292.5,1.33,{r:0.044,col:'#7A1D15',dark:'#4A120D',off:-0.11,team:1}); add('tok',292.5,1.33,{r:0.044,col:'#7A1D15',dark:'#4A120D',off:0.11,team:1});
})();

/** Crée la vue d'un canvas (1920 × 1080 logiques, mis à l'échelle de son affichage). Sans canvas, rend null.
 *  @returns {object|null} */
function areneSalleCreer(cv){
  if(!cv||typeof cv.getContext!=='function') return null;
  const ctx=cv.getContext('2d'); if(!ctx) return null;
  /* Une toile qui n'a pas de taille affichée (pas encore mise en page, ou le harnais de test) n'est pas une toile à animer. */
  const aff=typeof cv.getBoundingClientRect==='function'?cv.getBoundingClientRect():null;
  if(!((aff&&aff.width>=10)||cv.clientWidth>=10)) return null;
  const W=SAL_W, H=SAL_H, CY=SAL_CY, C=SAL_C, FX=SAL_FX, FC=SAL_FC, TAU=SAL_TAU, SEG=SAL_SEG, VTX=SAL_VTX;
  const V={cv:cv,ctx:ctx,k:1,decal:null,decalCle:'',camS:null,tPrec:-1,trail:{A:[],B:[]}};
  const cam={x:0,y:0,zoom:300,az:0.3,ky:0.5,kz:0.86,c:1,s:0};

  /** Recale la résolution du canvas sur sa taille d'affichage (la planche reste en 1920 × 1080 logiques). */
  V.redim=function(){
    /* La largeur AFFICHÉE (le cadre est mis à l'échelle de la fenêtre) fixe la résolution : jamais plus de pixels que l'écran n'en montre. */
    const r=typeof cv.getBoundingClientRect==='function'?cv.getBoundingClientRect():null;
    const w=(r&&r.width)||cv.clientWidth||W;  // la garde de areneSalleCreer assure une largeur réelle
    const dpr=(typeof window!=='undefined'&&window.devicePixelRatio)||1;
    const kmax=typeof MGMT_REGLAGES!=='undefined'?MGMT_REGLAGES.affichage.taille/W:2;  // la taille de l'image choisie (lot 12) borne la résolution
    V.k=clamp(w*dpr/W,0.5,kmax);
    cv.width=Math.round(W*V.k); cv.height=Math.round(H*V.k);
  };
  V.redim();
  if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
    V._onResize=function(){ V.redim(); V.sale=true; };
    window.addEventListener('resize',V._onResize);
  }
  V.detruire=function(){
    if(V._onResize&&typeof window!=='undefined'&&typeof window.removeEventListener==='function') window.removeEventListener('resize',V._onResize);
    V._onResize=null;
  };

  /* ---- la caméra et la projection ---- */
  function P(x,y,z){
    const dx=x-cam.x, dy=y-cam.y, rx=dx*cam.c-dy*cam.s, ry=dx*cam.s+dy*cam.c;
    return [W/2+rx*cam.zoom,CY+ry*cam.zoom*cam.ky-(z||0)*cam.zoom*cam.kz,ry];
  }
  function off(p,m){ m=m||0; return p[0]<-m||p[0]>W+m||p[1]<-m||p[1]>H+m; }

  /* ---- les outils de dessin ---- */
  function poly(pts,fill,stroke,lw){
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
    ctx.closePath();
    if(fill){ ctx.fillStyle=fill; ctx.fill(); }
    if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=lw||2; ctx.stroke(); }
  }
  function line(pts,stroke,lw){
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
    ctx.strokeStyle=stroke; ctx.lineWidth=lw||2; ctx.stroke();
  }
  function octRing(r,z){ const pts=[]; for(let i=0;i<8;i++){ const q=salOct(r,SEG/2+i*SEG); pts.push(P(q[0],q[1],z||0)); } return pts; }
  function ring(x,y,r){ const pts=[]; for(let i=0;i<8;i++){ const a=SEG/2+i*SEG; pts.push(P(x+Math.cos(a)*r,y+Math.sin(a)*r,0)); } return pts; }
  function setFont(px,font,weight){ ctx.font=(weight||800)+' '+px+'px '+(font||FX); }
  function txt(s,x,y,px,col,font,align,weight){ setFont(px,font,weight); ctx.textAlign=align||'left'; ctx.textBaseline='alphabetic'; ctx.fillStyle=col; ctx.fillText(s,x,y); }
  function tw(s,px,font,weight){ setFont(px,font,weight); return ctx.measureText(s).width; }
  function cutPath(x,y,w,h,c){ c=Math.max(0,Math.min(c,h/2,w/2)); ctx.beginPath(); ctx.moveTo(x+c,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h-c); ctx.lineTo(x+w-c,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+c); ctx.closePath(); }
  /* Le contour de la direction visuelle : filet clair, liseré noir, coins coupés à 45°. */
  function panel(x,y,w,h,fill,cut,lis){
    cut=cut===undefined?12:cut; lis=lis===undefined?4:lis;
    cutPath(x,y,w,h,cut); ctx.fillStyle=C.line; ctx.fill();
    cutPath(x+2,y+2,w-4,h-4,cut-1); ctx.fillStyle=C.ink; ctx.fill();
    cutPath(x+2+lis,y+2+lis,w-4-2*lis,h-4-2*lis,cut-3); ctx.fillStyle=fill; ctx.fill();
  }
  /* Une étiquette : un mot dans un petit panneau. Renvoie sa largeur. */
  function plate(s,x,y,px,bg,fg,align){
    const w=Math.round(tw(s,px)+34), h=Math.round(px*0.72+26), x0=Math.round(align==='right'?x-w:(align==='center'?x-w/2:x)), y0=Math.round(y-h);
    panel(x0,y0,w,h,bg,8,3); txt(s,x0+17,y0+h-13,px,fg); return w;
  }
  /* Une incrustation : un onglet qui dit qui parle, et sa phrase dessous. x et y : le coin du bas, à gauche ou à droite. */
  function insert(x,y,right,tab,tabBg,tabFg,s,px,font,weight,bg,fg,maxW){
    const padX=22; let w=tw(s,px,font,weight)+padX*2+10;
    while(maxW&&w>maxW&&px>30){ px-=2; w=tw(s,px,font,weight)+padX*2+10; }
    w=Math.round(w); const h=Math.round(px*0.72+42), x0=Math.round(right?x-w:x), y0=Math.round(y-h), wt=Math.round(tw(tab,20,FC,600)+28), xt=right?x0+w-wt:x0;
    ctx.fillStyle=C.ink; ctx.fillRect(xt-2,y0-34,wt+4,36); ctx.fillStyle=tabBg; ctx.fillRect(xt,y0-32,wt,32);
    txt(tab,xt+14,y0-9,20,tabFg,FC,'left',600);
    panel(x0,y0,w,h,bg,12,4); txt(s,x0+padX+5,y0+h-21,px,fg,font,'left',weight);
    return {w:w,h:h+34};
  }

  /* ---- ce qui est posé au sol : dessiné une fois, puis posé à plat, ça tourne avec la cage ---- */
  function buildDecal(org,num){
    const mk=function(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
    const u=600, d=mk(960,960), g=d.getContext('2d');
    g.translate(480,480); g.textAlign='center'; g.textBaseline='alphabetic';
    g.fillStyle='rgba(233,230,225,0.085)'; g.font='800 '+Math.round(0.46*u)+'px '+FX; g.fillText(num,0,0.2*u);
    g.fillStyle='rgba(233,230,225,0.17)'; g.font='800 '+Math.round(0.08*u)+'px '+FX; g.fillText(org+' FIGHT NIGHT',0,-0.19*u);
    const e=mk(540,72), h=e.getContext('2d');
    h.textAlign='center'; h.textBaseline='alphabetic'; h.fillStyle='#E9E6E1'; h.font='800 '+Math.round(0.085*u)+'px '+FX; h.fillText(org+' FIGHT NIGHT '+num,270,54);
    return {mid:d,strip:e};
  }
  function matPaint(cx){
    const cle=cx.org+'|'+cx.num;
    if(V.decalCle!==cle||V.decal===null){ try{ V.decal=buildDecal(cx.org,cx.num); }catch(err){ V.decal=false; } V.decalCle=cle; }
    if(!V.decal) return;
    const zc=cam.zoom;
    ctx.save();
    ctx.transform(zc*cam.c,zc*cam.ky*cam.s,-zc*cam.s,zc*cam.ky*cam.c,W/2-zc*(cam.c*cam.x-cam.s*cam.y),CY-zc*cam.ky*(cam.s*cam.x+cam.c*cam.y));
    ctx.drawImage(V.decal.mid,-0.8,-0.8,1.6,1.6);
    for(let k=0;k<8;k+=2){
      const dep=Math.cos(k*SEG)*cam.s+Math.sin(k*SEG)*cam.c, al=clamp((dep-0.15)/0.45,0,1)*0.34;
      if(al<=0.01) continue;
      ctx.save(); ctx.globalAlpha=al; ctx.translate(Math.cos(k*SEG)*1.1,Math.sin(k*SEG)*1.1); ctx.rotate(k*SEG-Math.PI/2); ctx.drawImage(V.decal.strip,-0.45,-0.06,0.9,0.12); ctx.restore();
    }
    ctx.restore(); ctx.globalAlpha=1;
  }

  /* ---- les gradins, rangée par rangée, avec ceux qui sont venus ---- */
  function stadium(st,so,real){
    const c1=[22,14,14], c2=[150,34,24], U=SAL_U, M=SAL_M;
    const nd=cam.zoom>380?3:2, sz=clamp(cam.zoom*0.011,2.4,6), noise=st.exc*so.noise;
    const mj=[]; for(let j=0;j<=M;j++) mj.push(clamp((-Math.sin(j/M*TAU+cam.az)+0.15)*1.1,0.1,1));
    if(so.closed){
      /* le haut fermé : une bâche sombre par bloc */
      const ra=salRowR(7), rb=salRowR(SAL_NT-1)+SAL_ROW_W, za=salRowZ(7), zb=salRowZ(SAL_NT-1)+0.03;
      for(let j=0;j<M;j++){
        if(salAisle(j)) continue;
        const a0=P(U[j][0]*ra,U[j][1]*ra,za*mj[j]), a1=P(U[j+1][0]*ra,U[j+1][1]*ra,za*mj[j+1]), b1=P(U[j+1][0]*rb,U[j+1][1]*rb,zb*mj[j+1]), b0=P(U[j][0]*rb,U[j][1]*rb,zb*mj[j]);
        if(off(a0,60)&&off(a1,60)&&off(b0,60)&&off(b1,60)) continue;
        poly([a0,a1,b1,b0],'#161111');
        ctx.strokeStyle='rgba(233,230,225,0.07)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(a0[0],a0[1]); ctx.lineTo(b1[0],b1[1]); ctx.stroke();
      }
    }
    for(let i=SAL_NT-1;i>=0;i--){
      if(so.closed&&i>6) continue;
      const r0=salRowR(i), r1=r0+SAL_ROW_W, z=salRowZ(i), oc=so.occ[i];
      let br=(0.1+(0.1+0.5*noise)*oc)*(1-i*0.028);
      if(st.wave>=0) br+=0.7*oc*Math.exp(-Math.pow(i-st.wave,2)/1.6);
      const A=[], D=[];
      for(let j=0;j<=M;j++){ A.push(P(U[j][0]*r0,U[j][1]*r0,z*mj[j])); D.push(P(U[j][0]*r1,U[j][1]*r1,(z+0.03)*mj[j])); }
      const vis=[];
      for(let j=0;j<M;j++) vis.push(!(i<=6&&salWalk(j))&&!(off(A[j],30)&&off(A[j+1],30)&&off(D[j],30)&&off(D[j+1],30)));
      for(let k=0;k<2;k++){
        ctx.beginPath(); let any=false;
        for(let j=0;j<M;j++){ if(!vis[j]||(salAisle(j)?1:0)!==k) continue; any=true; ctx.moveTo(A[j][0],A[j][1]); ctx.lineTo(A[j+1][0],A[j+1][1]); ctx.lineTo(D[j+1][0],D[j+1][1]); ctx.lineTo(D[j][0],D[j][1]); ctx.closePath(); }
        if(any){ ctx.fillStyle=k?salMix(c1,c2,br*0.2):salMix(c1,c2,br); ctx.fill(); }
      }
      ctx.beginPath();
      for(let j=0;j<M;j++){ if(vis[j]){ ctx.moveTo(A[j][0],A[j][1]); ctx.lineTo(A[j+1][0],A[j+1][1]); } }
      ctx.strokeStyle=(i===0||i===7)?'rgba(233,230,225,0.3)':'rgba(13,11,11,0.6)'; ctx.lineWidth=(i===0||i===7)?2:1.5; ctx.stroke();
      /* les gens : un petit rectangle par siège pris */
      const sets=[[],[],[],[],[]];
      for(let j=0;j<M;j++){
        if(!vis[j]||salAisle(j)) continue;
        const blk=so.even?1:0.62+0.76*salHash(Math.floor(((j+6)%M)/12)*7.3+(i>6?40:0)+1.7);
        for(let k=0;k<nd;k++){
          const u=(k+0.5)/nd;
          const bx=salLerp(salLerp(A[j][0],A[j+1][0],u),salLerp(D[j][0],D[j+1][0],u),0.5), by=salLerp(salLerp(A[j][1],A[j+1][1],u),salLerp(D[j][1],D[j+1][1],u),0.5);
          if(salHash(i*57.3+j*3.1+k*11.7+9.1)>=oc*blk){ sets[4].push(bx-sz/2,by-sz*0.6,sz,sz*0.8); continue; }
          const h=salHash(i*131+j*17+k*7), bounce=Math.abs(Math.sin(real*(5+h*4)+h*TAU))*5*noise*(cam.zoom/400);
          const y=by-3-bounce;
          sets[h<0.62?0:(h<0.85?1:2)].push(bx-sz/2,y-sz,sz,sz*1.5);
          if(h>0.965&&Math.sin(real*3+h*40)>0.2) sets[3].push(bx-1.5,y-sz-5,3,3);
        }
      }
      const cols=['rgba(233,230,225,'+clamp(0.24+0.6*br,0,0.95).toFixed(2)+')','rgba(13,11,11,0.85)',salMix(c2,[226,58,43],0.6+br),C.cr,'rgba(233,230,225,0.09)'];
      for(let k=0;k<5;k++){ const q=sets[k]; if(!q.length) continue; ctx.fillStyle=cols[k]; ctx.beginPath(); for(let j=0;j<q.length;j+=4) ctx.rect(q[j],q[j+1],q[j+2],q[j+3]); ctx.fill(); }
    }
  }
  /* les deux allées d'entrée : elles traversent le bas des gradins jusqu'aux portes de la cage */
  function walkways(){
    const ws=[11,59], rin=SAL_R_SIDE, rout=salRowR(6)+SAL_ROW_W, U=SAL_U, M=SAL_M;
    for(let n=0;n<2;n++){
      const j=ws[n], m=clamp((-Math.sin((j+1)/M*TAU+cam.az)+0.15)*1.1,0.1,1);
      const a=P(U[j][0]*rin,U[j][1]*rin,0), b=P(U[j+2][0]*rin,U[j+2][1]*rin,0), c=P(U[j+2][0]*rout,U[j+2][1]*rout,0), d=P(U[j][0]*rout,U[j][1]*rout,0);
      if(off(a,200)&&off(b,200)&&off(c,200)&&off(d,200)) continue;
      poly([a,b,c,d],'#171313');
      line([a,d],'rgba(233,230,225,0.3)',2); line([b,c],'rgba(233,230,225,0.3)',2);
      const c2=P(U[j+2][0]*rout,U[j+2][1]*rout,0.5*m), d2=P(U[j][0]*rout,U[j][1]*rout,0.5*m);
      poly([d,c,c2,d2],'#060505','rgba(233,230,225,0.3)',2);
    }
  }
  /* le sol autour de la cage et la barrière devant le public */
  function floorRing(){
    poly(octRing(SAL_R_STAND),'#100D0D');
    ctx.beginPath();
    for(let j=0;j<SAL_M;j++){ if(salWalk(j)) continue; const a=P(SAL_U[j][0]*SAL_R_SIDE,SAL_U[j][1]*SAL_R_SIDE,0), b=P(SAL_U[j+1][0]*SAL_R_SIDE,SAL_U[j+1][1]*SAL_R_SIDE,0); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); }
    ctx.strokeStyle='rgba(233,230,225,0.3)'; ctx.lineWidth=2; ctx.stroke();
  }

  /* ---- un pion : un jeton à plat ---- */
  function coin(x,y,r,col,dark,letter,lc,face,o){
    o=o||{}; const p=P(x,y,0), R=r*cam.zoom, ry=R*cam.ky, th=R*0.18*cam.kz;
    ctx.fillStyle='rgba(13,11,11,0.55)'; ctx.beginPath(); ctx.ellipse(p[0],p[1]+th+R*0.08,R*1.14,ry*1.14,0,0,TAU); ctx.fill();
    ctx.lineWidth=clamp(R*0.09,1.5,7); ctx.strokeStyle=C.ink;
    if(th>1){ ctx.fillStyle=dark; ctx.beginPath(); ctx.ellipse(p[0],p[1]+th,R,ry,0,0,TAU); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(p[0],p[1],R,ry,0,0,TAU); ctx.fill(); ctx.stroke();
    if(!o.small){
      ctx.strokeStyle=dark; ctx.lineWidth=clamp(R*0.07,2,5); if(o.hurt) ctx.setLineDash([R*0.45,R*0.25]);
      ctx.beginPath(); ctx.ellipse(p[0],p[1],R*0.78,ry*0.78,0,0,TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    if(letter){ ctx.save(); ctx.translate(p[0],p[1]); ctx.scale(1,Math.min(1,cam.ky+0.3)); ctx.rotate(o.rot||0); txt(letter,0,R*0.36,Math.max(14,R*1.0),lc,FX,'center'); ctx.restore(); }
    if(face!==null&&face!==undefined){ const f=P(x+Math.cos(face)*r*0.97,y+Math.sin(face)*r*0.97,0); ctx.fillStyle=C.ink; ctx.beginPath(); ctx.ellipse(f[0],f[1],R*0.17,R*0.17*Math.max(cam.ky,0.6),0,0,TAU); ctx.fill(); }
    return p;
  }

  /* ---- le bord de la cage : les tables, les officiels, les photographes, les coins ---- */
  function table(o){
    const tx=-Math.sin(o.a)*o.L, ty=Math.cos(o.a)*o.L, nx=Math.cos(o.a)*0.045, ny=Math.sin(o.a)*0.045;
    for(let g=0;g<2;g++){ const z=g?0.04:0; poly([P(o.x-tx-nx,o.y-ty-ny,z),P(o.x+tx-nx,o.y+ty-ny,z),P(o.x+tx+nx,o.y+ty+ny,z),P(o.x-tx+nx,o.y-ty+ny,z)],g?'#2A2626':'#080707',g?'rgba(233,230,225,0.55)':null,2); }
  }
  /* Brief démo du 09/10/2026 : les noms des tables (JUGE, CHRONO…) se taisent là où un texte du direct est posé par-dessus (commentaire, paroles des coins, carton de round). */
  function reserve(l,t,r,b){
    const X=function(a,c,d,e){ return l<d&&r>a&&t<e&&b>c; }, cx=V.dernier;
    if(!cx) return false;
    const v=cx.voix; if(cx.regl.commentaire!==false&&v&&(v.salle?cx.salleDit:v.a)&&X(40,v.l===0?860:(v.l===1?830:(v.b?600:740)),v.l>=2?W-40:1360,H)) return true;
    if(cx.regl.coins!==false&&cx.coins.length&&(X(40,120,700,300)||X(W-700,120,W-40,300))) return true;
    if(cx.titre&&cx.titre.alpha>0&&X(620,150,1300,440)) return true;
    return false;
  }
  function sideline(st,cx){
    const arr=[], t=cx.t, real=cx.real;
    for(let i=0;i<SAL_SIDE.length;i++){ const o=SAL_SIDE[i], p=P(o.x,o.y,0); if(!off(p,120)) arr.push([p[2],o,p]); }
    arr.sort(function(a,b){ return a[0]-b[0]; });
    const crient={A:false,B:false};
    if(cx.regl.coins!==false) for(const x of cx.coins) crient[x.c.w]=true;
    for(let i=0;i<arr.length;i++){
      const o=arr[i][1], p=arr[i][2];
      if(o.kind==='table'){
        table(o);
        if(o.chrono&&cx.chrono){ const pr=(real*2.4)%1, gr=(0.06+0.12*pr)*cam.zoom; ctx.strokeStyle='rgba(233,230,225,'+(0.7*(1-pr)).toFixed(2)+')'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(p[0],p[1],gr,gr*cam.ky,0,0,TAU); ctx.stroke(); }
        continue;
      }
      let jx=0;
      if(o.who||o.team) jx=Math.sin(real*9+o.x*31)*0.012*st.exc;
      coin(o.x+jx,o.y,o.r,o.col,o.dark,'',C.ink,null,{small:!o.who});
      const R=o.r*cam.zoom;
      if(o.cross){ ctx.strokeStyle=C.rdf; ctx.lineWidth=clamp(R*0.3,2,6); ctx.lineCap='butt'; ctx.beginPath(); ctx.moveTo(p[0]-R*0.5,p[1]); ctx.lineTo(p[0]+R*0.5,p[1]); ctx.moveTo(p[0],p[1]-R*0.5*cam.ky); ctx.lineTo(p[0],p[1]+R*0.5*cam.ky); ctx.stroke(); }
      if(o.lens){ const d=Math.sqrt(o.x*o.x+o.y*o.y), lp=P(o.x-o.x/d*o.r*0.6,o.y-o.y/d*o.r*0.6,0); ctx.fillStyle=C.crf; ctx.beginPath(); ctx.ellipse(lp[0],lp[1],R*0.3,R*0.3*Math.max(cam.ky,0.6),0,0,TAU); ctx.fill(); }
      if(o.who&&crient[o.who]){
        for(let g=0;g<2;g++){ const pg=((real*1.8)+g*0.5)%1, rr=(o.r*1.3+0.13*pg)*cam.zoom; ctx.strokeStyle=o.who==='A'?'rgba(233,230,225,'+(0.85*(1-pg)).toFixed(2)+')':'rgba(226,58,43,'+(0.95*(1-pg)).toFixed(2)+')'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(p[0],p[1],rr,rr*cam.ky,0,0,TAU); ctx.stroke(); }
      }
      if(o.photo){
        for(let f=0;f<st.fx.length;f++){
          const fx=st.fx[f]; if(fx.e.r!==1||fx.e.p<0.6) continue;
          const hh=salHash(o.photo*13.7+fx.i*5.3), fd=fx.dt-0.09-hh*0.35;
          if(hh>0.3&&!fx.e.big) continue;
          if(fd>=0&&fd<0.11){ const L=clamp(cam.zoom*0.07,14,44)*(1-fd/0.11*0.5); ctx.strokeStyle=C.cr; ctx.lineWidth=3; ctx.lineCap='round'; ctx.beginPath(); for(let a=0;a<4;a++){ const an=a*Math.PI/4; ctx.moveTo(p[0]-Math.cos(an)*L,p[1]-Math.sin(an)*L); ctx.lineTo(p[0]+Math.cos(an)*L,p[1]+Math.sin(an)*L); } ctx.stroke(); ctx.fillStyle=C.cr; ctx.beginPath(); ctx.arc(p[0],p[1],L*0.3,0,TAU); ctx.fill(); }
        }
      }
    }
    if(cam.zoom>=300){
      const pc=P(0,0,0);
      for(let i=0;i<arr.length;i++){
        const o=arr[i][1], p=arr[i][2]; if(!o.label) continue;
        const ox=p[0]-pc[0], oy=p[1]-pc[1], ol=Math.sqrt(ox*ox+oy*oy)||1, far=0.1*cam.zoom*(0.4+0.6*cam.ky)+24+Math.abs(ox/ol)*(tw(o.label,20,FC,600)/2+(o.L||0)*cam.zoom*0.4), lx=p[0]+ox/ol*far, ly=p[1]+oy/ol*far+7;
        if(ly<140||ly>H-92||lx<60||lx>W-60||reserve(lx-110,ly-26,lx+110,ly+8)) continue;
        txt(o.label,lx,ly,20,'rgba(233,230,225,0.7)',FC,'center',600);
      }
    }
  }

  /* ---- la cage ---- */
  function fenceEdge(k,st,z){
    const pts=[], N=14, a0=SEG/2+(k-1)*SEG, a1=a0+SEG;
    const A=[Math.cos(a0)*VTX,Math.sin(a0)*VTX], B=[Math.cos(a1)*VTX,Math.sin(a1)*VTX], nx=Math.cos(k*SEG), ny=Math.sin(k*SEG);
    for(let i=0;i<=N;i++){
      const u=i/N, x=salLerp(A[0],B[0],u), y=salLerp(A[1],B[1],u); let bump=0;
      if(st.pin>0&&k===st.pinPan){ const px=st[st.pinWho], dd=(x-px.x-px.dx)*(-ny)+(y-px.y-px.dy)*nx; bump=st.pin*(0.075+0.03*st.knee)*Math.exp(-dd*dd/0.012); }
      pts.push(P(x+nx*bump,y+ny*bump,z));
    }
    return pts;
  }
  function cage(st,near,cx){
    const hF=0.24; let k, i;
    if(!near){
      poly(octRing(SAL_R_APRON),'#0A0808','rgba(233,230,225,0.3)',2);
      const fl=[]; for(k=0;k<8;k++){ const e=fenceEdge(k,st,0); for(i=0;i<e.length-1;i++) fl.push(e[i]); }
      poly(fl,C.floor);
      const c0=P(0,0,0), g=ctx.createRadialGradient(c0[0],c0[1],0,c0[0],c0[1],cam.zoom*0.95); g.addColorStop(0,'rgba(233,230,225,0.07)'); g.addColorStop(1,'rgba(233,230,225,0)'); poly(fl,g);
      const fr=[0.9,0.7,0.5];
      for(i=0;i<3;i++) poly(ring(0,0,fr[i]),null,'rgba(233,230,225,0.1)',2);
      matPaint(cx);
    }
    const zc=P(0,0,0)[2];
    for(k=0;k<8;k++){
      const far=P(Math.cos(k*SEG),Math.sin(k*SEG),0)[2]-zc<-0.05;
      if(far===!!near) continue;
      const bot=fenceEdge(k,st,0), top=fenceEdge(k,st,hF), door=(k===1||k===5);
      if(far){
        poly(bot.concat(top.slice().reverse()),'rgba(13,11,11,0.42)');
        ctx.strokeStyle='rgba(233,230,225,0.2)'; ctx.lineWidth=1.5; ctx.beginPath();
        for(i=0;i<bot.length;i++){ ctx.moveTo(bot[i][0],bot[i][1]); ctx.lineTo(top[i][0],top[i][1]); if(i<bot.length-1){ ctx.moveTo(bot[i][0],bot[i][1]); ctx.lineTo(top[i+1][0],top[i+1][1]); ctx.moveTo(bot[i+1][0],bot[i+1][1]); ctx.lineTo(top[i][0],top[i][1]); } }
        ctx.stroke();
      }
      ctx.lineJoin='round'; ctx.lineCap='butt';
      line(top,far?C.cr:'rgba(233,230,225,0.3)',far?clamp(cam.zoom/110,3,6):2.5);
      line(bot,C.cr,clamp(cam.zoom/80,4,8));
      if(door){ const d0=5, d1=9; ctx.strokeStyle=far?C.cr:'rgba(233,230,225,0.3)'; ctx.lineWidth=far?clamp(cam.zoom/100,3,6):2.5; ctx.beginPath(); ctx.moveTo(bot[d0][0],bot[d0][1]); ctx.lineTo(top[d0][0],top[d0][1]); ctx.moveTo(bot[d1][0],bot[d1][1]); ctx.lineTo(top[d1][0],top[d1][1]); ctx.stroke(); if(far) line(top.slice(d0,d1+1),C.cr,clamp(cam.zoom/60,5,10)); }
    }
    for(k=0;k<8;k++){
      const an=SEG/2+k*SEG, vx=Math.cos(an)*VTX, vy=Math.sin(an)*VTX, p0=P(vx,vy,0), p1=P(vx,vy,hF), farV=p0[2]-zc<0;
      if(farV===!!near) continue;
      const pad=(k===2)?C.cr:(k===6?C.red:null);
      ctx.strokeStyle=pad||(farV?C.cr:'rgba(233,230,225,0.3)'); ctx.lineWidth=pad?clamp(cam.zoom/34,8,20):(farV?clamp(cam.zoom/90,3,7):2.5); ctx.lineCap='butt';
      if(pad&&!farV) ctx.globalAlpha=0.55;
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke(); ctx.globalAlpha=1;
    }
  }

  /* ---- les coups : on ne les dessine pas, on montre où ça touche ---- */
  function drawFx(st){
    for(let i=0;i<st.fx.length;i++){
      const f=st.fx[i], e=f.e, dt=f.dt, A=st[e.by], B=st[e.by==='A'?'B':'A'], who=e.by==='A'?C.cr:C.red;
      const cx=B.x+B.dx-f.ux*0.105, cy=B.y+B.dy-f.uy*0.105, q=dt-0.09;
      if(e.r===1&&q>=0&&q<0.9){
        const rr=(0.06+e.p*0.34)*salEase(q/0.5), al=1-salEase(q/0.9);
        ctx.globalAlpha=al; poly(ring(cx,cy,rr),null,C.cr,3+e.p*6); if(e.p>0.5) poly(ring(cx,cy,rr*1.6),null,C.cr,2+e.p*3); if(e.big){ poly(ring(cx,cy,rr*2.4),null,C.cr,4); poly(ring(cx,cy,rr*3.4),null,C.cr,3); }
        if(q<0.25){ const c0=P(cx,cy,0), n=e.big?16:10, L=(20+e.p*70)*(cam.zoom/430); ctx.strokeStyle=C.cr; ctx.lineWidth=3+e.p*5; ctx.lineCap='round'; ctx.beginPath(); for(let k=0;k<n;k++){ const an=k*TAU/n+0.3; ctx.moveTo(c0[0]+Math.cos(an)*L*0.45,c0[1]+Math.sin(an)*L*0.45*cam.ky); ctx.lineTo(c0[0]+Math.cos(an)*L,c0[1]+Math.sin(an)*L*cam.ky); } ctx.stroke(); }
        ctx.globalAlpha=1;
      }
      if(e.r===2&&q>=0&&q<0.6){ ctx.globalAlpha=1-salEase(q/0.6); ctx.setLineDash([10,8]); poly(ring(cx,cy,0.12*salEase(q/0.3)),null,C.crf,4); ctx.setLineDash([]); ctx.globalAlpha=1; }
      if(e.type==='legKick'&&q>=-0.05&&q<0.5){ const c1=P(B.x+B.dx,B.y+B.dy,0), R=0.15*cam.zoom, s1=Math.atan2(-f.uy*cam.c-f.ux*cam.s,-f.ux*cam.c+f.uy*cam.s); ctx.globalAlpha=1-salEase(q/0.5); ctx.strokeStyle=who; ctx.lineWidth=9; ctx.lineCap='round'; ctx.beginPath(); ctx.ellipse(c1[0],c1[1],R,R*cam.ky,0,s1-1.0,s1+1.0); ctx.stroke(); ctx.globalAlpha=1; }
      if(e.type==='hook'&&q>=-0.05&&q<0.5){ const c2=P(A.x+A.dx,A.y+A.dy,0), R2=0.2*cam.zoom, s2=Math.atan2(f.uy*cam.c+f.ux*cam.s,f.ux*cam.c-f.uy*cam.s); ctx.globalAlpha=1-salEase(q/0.5); ctx.strokeStyle=who; ctx.lineWidth=8; ctx.lineCap='round'; ctx.beginPath(); ctx.ellipse(c2[0],c2[1],R2,R2*cam.ky,0,s2-1.3,s2+0.2); ctx.stroke(); ctx.globalAlpha=1; }
    }
  }
  /* le nom du coup : à côté de celui qui frappe, du côté opposé à l'autre. On essaie plusieurs places et on garde la première qui ne couvre ni un pion ni l'arbitre. */
  function tag(s,px,bg,fg,p,q,Rp,push,avoid){
    const dx=p[0]-q[0], dy=p[1]-q[1], dl=Math.sqrt(dx*dx+dy*dy), w=Math.round(tw(s,px)+34), h=Math.round(px*0.72+26), ry=Rp*cam.ky, th=Rp*0.18*cam.kz, top=Math.min(p[1],dl<Rp*0.8?q[1]:p[1]);
    const up=[p[0]-w/2,top-ry-14-push-h], down=[p[0]-w/2,p[1]+ry+th+16+push], rt=[p[0]+Rp+16+push,p[1]-h/2], lf=[p[0]-Rp-16-push-w,p[1]-h/2];
    let order;
    if(dl<Rp*0.8) order=[up,rt,lf,down];
    else if(Math.abs(dx)>Math.abs(dy)*1.2) order=dx>0?[rt,up,down,lf]:[lf,up,down,rt];
    else order=dy<0?[up,dx>=0?rt:lf,dx>=0?lf:rt,down]:[down,dx>=0?rt:lf,dx>=0?lf:rt,up];
    let pick=null;
    for(let i=0;i<order.length&&!pick;i++){
      const c=order[i]; let ok=c[0]>40&&c[0]+w<W-40&&c[1]>120&&c[1]+h<H-90&&!reserve(c[0],c[1],c[0]+w,c[1]+h);
      for(let j=0;ok&&j<avoid.length;j++){ const a=avoid[j], nx=clamp(a[0],c[0],c[0]+w), ny=clamp(a[1],c[1],c[1]+h), ex=(a[0]-nx)/a[2], ey=(a[1]-ny)/(a[2]*cam.ky); if(ex*ex+ey*ey<1) ok=false; }
      if(ok) pick=c;
    }
    if(!pick){ if(avoid.length>3) return; pick=order.find(function(c){ return c[0]>40&&c[0]+w<W-40&&!reserve(c[0],c[1],c[0]+w,c[1]+h); }); if(!pick) return; }   /* plus de place : une étiquette de plus ne s'écrit pas sur une autre */
    plate(s,pick[0],pick[1]+h,px,bg,fg,'left'); avoid.push([pick[0]+w/2,pick[1]+h/2,w/2]);
  }
  function drawLabels(st,deja){
    const Rp=0.112*cam.zoom;
    /* Brief démo du 09/10/2026 (« enlever tous les textes qui se superposent ») : les places prises sont communes à toutes les étiquettes de l'image — deux coups proches ne s'écrivent plus l'un sur l'autre. */
    const pA=P(st.A.x+st.A.dx,st.A.y+st.A.dy,0), pB=P(st.B.x+st.B.dx,st.B.y+st.B.dy,0), pR=P(st.R.x,st.R.y,0), avoid=[[pA[0],pA[1],Rp*1.05],[pB[0],pB[1],Rp*1.05],[pR[0],pR[1],0.09*cam.zoom]].concat(deja||[]);
    for(let i=0;i<st.fx.length;i++){
      const f=st.fx[i], e=f.e, dt=f.dt; if(dt>1.15||!e.k) continue;
      const A=st[e.by], B=st[e.by==='A'?'B':'A'], pa=P(A.x+A.dx,A.y+A.dy,0), pb=P(B.x+B.dx,B.y+B.dy,0), al=dt<0.9?1:1-(dt-0.9)/0.25;
      ctx.globalAlpha=clamp(al,0,1);
      tag(e.k,e.big?56:36,e.by==='A'?C.cr:C.rdf,e.by==='A'?C.ink:C.cr,pa,pb,Rp,salEase(dt/0.2)*10,avoid);
      if((e.r===0||e.r===2)&&dt>0.1) tag(e.r===0?MGMT_GESTES.esquive:MGMT_GESTES.bloque,30,C.panel,C.cr,pb,pa,Rp,0,avoid);
      ctx.globalAlpha=1;
    }
  }

  /* ---- ce qui est posé par-dessus l'image ---- */
  function hud(cx){
    const K=cx.carte, e=cx.etat;
    const clock=clamp(e.horloge,0,ARENE_ROUND_LEN), mm=Math.floor(clock/60), ss=Math.floor(clock%60), cs=mm+':'+(ss<10?'0':'')+ss;
    const wS=tw(K.a,56), wD=tw(K.b,56), wRS=tw(K.ra,30), wRD=tw(K.rb,30);
    const wing=Math.round(20+46+14+Math.max(wS,wD)+30+Math.max(wRS,wRD)+24), wC=264, tot=wing*2+wC, x0=Math.round((W-tot)/2), y0=22, h=80, yc=y0+h/2;
    panel(x0,y0,tot,h,C.panel,16,5);
    function chip(c,col,lc,l){ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(c,yc,22,0,TAU); ctx.fill(); ctx.strokeStyle=C.ink; ctx.lineWidth=4; ctx.stroke(); txt(l,c,yc+11,30,lc,FX,'center'); }
    chip(x0+20+23,C.cr,C.ink,K.la); txt(K.a,x0+80,yc+19,56,C.cr); txt(K.ra,x0+wing-24,yc+12,30,C.soft,FX,'right');
    const xc=x0+wing, last=clock<=10&&e.phase!=='coins'&&!e.fini, flip=last&&Math.sin(cx.real*14)>0;
    ctx.fillStyle=flip?C.rdf:C.cr; ctx.fillRect(xc,y0+7,wC,h-14);
    const fgc=flip?C.cr:C.ink;
    txt('ROUND '+e.r,xc+20,yc+1,30,fgc);
    for(let i=0;i<K.rounds;i++){ if(i<e.r){ ctx.fillStyle=fgc; ctx.fillRect(xc+20+i*20,yc+11,16,7); } else { ctx.strokeStyle=fgc; ctx.lineWidth=2; ctx.strokeRect(xc+21+i*20,yc+12,14,5); } }
    txt(cs,xc+wC-20,yc+21,60,fgc,FX,'right');
    const xr=x0+tot; chip(xr-20-23,C.red,C.cr,K.lb); txt(K.b,xr-80,yc+19,56,C.cr,FX,'right'); txt(K.rb,xr-wing+24,yc+12,30,C.soft);
    let s1=K.plate, w1=Math.round(tw(s1,22,FC,600)+40);
    if(56+w1>x0-16){ s1=s1.split(' · ')[0]; w1=Math.round(tw(s1,22,FC,600)+40); }
    panel(56,38,w1,48,C.panel,10,3); txt(s1,76,70,22,C.cr,FC,'left',600);
    let s2=cx.planLibelle, w2=Math.round(tw(s2,22,FC,600)+66);
    if(W-56-w2<x0+tot+16&&cx.planCourt){ s2=cx.planCourt; w2=Math.round(tw(s2,22,FC,600)+66); }   /* un grand nom : le libellé court, jamais sur le tableau */
    if(W-56-w2<x0+tot+16) w2=0;
    if(w2){ panel(W-56-w2,38,w2,48,C.panel,10,3); ctx.fillStyle=C.red; ctx.beginPath(); ctx.arc(W-56-w2+27,62,7,0,TAU); ctx.fill(); txt(s2,W-56-w2+44,70,22,C.cr,FC,'left',600); }
  }
  /* le commentaire : en bas à gauche, toujours droit. Les coins : en haut, chacun de son côté, sous les plaques. */
  function voices(cx){
    const regl=cx.regl, t=cx.t, K=cx.carte;
    const cur=cx.voix, xb=56, yb=H-72-30;
    if(regl.commentaire!==false&&cur){
      const dt=t-cur.t, pop=salEase(dt/0.16), a=cur.salle?cx.salleDit:cur.a;
      if(a){
        ctx.save(); ctx.translate(xb,yb); ctx.scale(0.92+0.08*pop,0.92+0.08*pop); ctx.globalAlpha=0.3+0.7*pop;
        if(cur.l===0) insert(0,0,false,'COMMENTAIRE',C.cr,C.ink,a,32,FC,600,C.panel,C.cr,1300);
        else if(cur.l===1) insert(0,0,false,'COMMENTAIRE',C.cr,C.ink,a,76,FX,800,C.rdf,C.cr,1200);
        else{
          const big=236; let yw=0;
          if(cur.b){ const b=insert(0,0,false,'COMMENTAIRE',C.cr,C.ink,cur.b,64,FX,800,C.rdf,C.cr,1200); yw=-b.h-24; }
          else{ const wt=Math.round(tw('COMMENTAIRE',20,FC,600)+28), yt=-Math.round(big*0.72)-22-32; ctx.fillStyle=C.ink; ctx.fillRect(-2,yt-2,wt+4,36); ctx.fillStyle=C.cr; ctx.fillRect(0,yt,wt,32); txt('COMMENTAIRE',14,yt+23,20,C.ink,FC,'left',600); yw=-6; }
          ctx.lineJoin='round'; let px=big; while(px>80&&tw(a,px,FX,800)>W-160) px-=8;
          setFont(px,FX,800); ctx.textAlign='left'; ctx.strokeStyle=C.ink; ctx.lineWidth=18; ctx.strokeText(a,4,yw); txt(a,4,yw,px,C.cr);
        }
        ctx.restore(); ctx.globalAlpha=1;
      }
    }
    if(regl.coins!==false){
      for(const x of cx.coins){
        const s=x.c, d=x.d, isA=s.w==='A';
        const al=d<1.6?salEase(d/0.14):1-(d-1.6)/0.3, sl=(1-salEase(d/0.2))*36;
        ctx.globalAlpha=clamp(al,0,1);
        insert(isA?56-sl:W-56+sl,228,!isA,'LE COIN DE '+(isA?K.a:K.b),isA?C.cr:C.rdf,isA?C.ink:C.cr,s.a,44,FX,800,C.panel,C.cr,580);
        ctx.globalAlpha=1;
      }
    }
  }
  function titles(cx){
    const K=cx.carte;
    if(cx.titre&&cx.titre.alpha>0){
      ctx.globalAlpha=clamp(cx.titre.alpha,0,1); const w=620, h=236, x=(W-w)/2, y=184;
      panel(x,y,w,h,C.panel,18,5); txt('ROUND '+cx.titre.n,W/2,y+150,170,C.cr,FX,'center'); ctx.fillStyle=C.rdf; ctx.fillRect(x+7,y+h-7-52,w-14,52); txt(K.a+' · '+K.b,W/2,y+h-22,34,C.cr,FC,'center',600); ctx.globalAlpha=1;
    }
    if(cx.fade>0){ ctx.fillStyle='rgba(11,9,9,'+clamp(cx.fade,0,1).toFixed(2)+')'; ctx.fillRect(0,0,W,H); }
  }
  function decision(cx){
    const d=cx.decT, D=cx.dec;
    ctx.fillStyle='rgba(11,9,9,0.86)'; ctx.fillRect(0,0,W,H);
    if(D.decision&&D.cartes.length){
      txt('LA DÉCISION DES JUGES',W/2,250,90,C.cr,FX,'center');
      for(let i=0;i<D.cartes.length;i++){
        const c=D.cartes[i], x=W/2-630+i*430, y=320, on=d>0.8+i*1.1, p=salEase((d-0.8-i*1.1)/0.25);
        const bg=c.pour==='A'?C.cr:(c.pour==='B'?C.rdf:C.panel), fg=c.pour==='A'?C.ink:C.cr;
        panel(x,y,400,310,C.panel,18,5); txt(c.juge,x+30,y+62,40,C.soft);
        if(on){ ctx.globalAlpha=p; txt(c.score,x+200,y+200,140,C.cr,FX,'center'); ctx.fillStyle=bg; ctx.fillRect(x+7,y+310-7-74,386,74); let px=56; while(px>26&&tw(c.nom,px,FX,800)>360) px-=2; txt(c.nom,x+200,y+310-7-18,px,fg,FX,'center'); ctx.globalAlpha=1; }
        else txt('?',x+200,y+220,160,'rgba(233,230,225,0.3)',FX,'center');
      }
      if(d>4.6){ const a=salEase((d-4.6)/0.35); ctx.globalAlpha=a; annonce(D,740,920); ctx.globalAlpha=1; }
    }else{
      const a=salEase(d/0.4); ctx.globalAlpha=a; annonce(D,430,610); ctx.globalAlpha=1;
    }
  }
  function annonce(D,yTitre,yNom){
    txt(D.titre,W/2,yTitre,44,C.cr,FC,'center',600);
    if(D.nom){
      let px=200; while(px>60&&tw(D.nom,px,FX,800)>W-200) px-=8;
      ctx.lineJoin='round'; setFont(px,FX,800); ctx.textAlign='center'; ctx.strokeStyle=C.ink; ctx.lineWidth=14; ctx.strokeText(D.nom,W/2,yNom); txt(D.nom,W/2,yNom,px,C.cr,FX,'center');
    }
  }

  /* ---- la caméra choisie ---- */
  function cibleCable(cx,st){
    const e=cx.etat, A=st.A, B=st.B, mx=(A.x+B.x)/2, my=(A.y+B.y)/2;
    let zoom=500, az=0.2*Math.sin(cx.real*0.12), ky=0.52, pan=0.85;
    if(e.phase==='coins'){ zoom=300; az=0.3; ky=0.5; pan=0; }
    else if(e.phase==='clinch'){
      zoom=640; ky=0.5;
      if(e.posClinch==='cage'){ zoom=781; ky=0.46; az=-(Math.atan2(my,mx)+Math.PI/2); }
    }else if(e.phase==='sol'){ zoom=640; ky=0.6; az=0.25; }
    else if(e.phase==='fini'){ zoom=573; ky=0.55; az=0.7; }
    else if(st.exc>0.9){ zoom=560; }
    return {zoom:zoom,az:az,ky:ky,x:mx*pan,y:my*pan};
  }
  function setCam(cx,st,dtReel){
    const plan=cx.plan;
    if(plan==='cable'){
      const c=cibleCable(cx,st);
      if(!V.camS){ V.camS={zoom:240,az:0.35,ky:0.5,x:0,y:0}; }
      const k=1-Math.exp(-dtReel*2.4), s=V.camS;
      let da=c.az-s.az; da=((da+Math.PI)%TAU+TAU)%TAU-Math.PI;
      s.zoom+=(c.zoom-s.zoom)*k; s.az+=da*k; s.ky+=(c.ky-s.ky)*k; s.x+=(c.x-s.x)*k; s.y+=(c.y-s.y)*k;
      cam.zoom=s.zoom; cam.az=s.az; cam.ky=s.ky; cam.x=s.x; cam.y=s.y;
    }else{
      const p=SAL_PLANS[plan]||SAL_PLANS.large;
      cam.zoom=p.zoom; cam.az=p.az; cam.ky=p.ky; cam.x=p.x; cam.y=p.y;
    }
    cam.kz=Math.sqrt(Math.max(0.02,1-cam.ky*cam.ky)); cam.c=Math.cos(cam.az); cam.s=Math.sin(cam.az);
  }

  /* ---- l'état des pions à l'instant t, sur la planche ---- */
  function pions(cx){
    const e=cx.etat, S=cx.session, t=cx.t, a=salConv(e.ax,e.ay), b=salConv(e.bx,e.by), r=salConv(e.refX,e.refY);
    const st={A:{x:a[0],y:a[1],dx:0,dy:0,hurt:0},B:{x:b[0],y:b[1],dx:0,dy:0,hurt:0},R:{x:r[0],y:r[1]},fx:[],
      ground:e.phase==='sol',clinch:e.phase==='clinch',pin:0,knee:0,pinWho:'A',pinPan:7,wave:-1,exc:0.4};
    /* au clinch et au sol deux pions se touchent : on les écarte juste assez pour qu'on voie les deux */
    const minD=(e.phase==='sol'||e.phase==='clinch')?0.2:0, ddx=st.B.x-st.A.x, ddy=st.B.y-st.A.y, dd=Math.sqrt(ddx*ddx+ddy*ddy);
    if(minD&&dd<minD){ const ux=dd>1e-6?ddx/dd:1, uy=dd>1e-6?ddy/dd:0, m=(minD-dd)/2; st.A.x-=ux*m; st.A.y-=uy*m; st.B.x+=ux*m; st.B.y+=uy*m; }
    st.exc=e.phase==='clinch'?0.55:(e.phase==='sol'?0.45:(e.phase==='coins'?0.5:0.4));
    if(e.horloge<12&&e.phase!=='coins') st.exc=Math.max(st.exc,0.8);
    if(e.phase==='fini'||e.fini) st.exc=1;
    for(const w of S.tapis){
      if(t>=w.t0&&t<w.t1){ const k=1-salEase((t-w.t0-(w.t1-w.t0)*0.4)/((w.t1-w.t0)*0.6)); (w.cible==='A'?st.A:st.B).hurt=Math.max(w.cible==='A'?st.A.hurt:st.B.hurt,k); }
    }
    if(e.phase==='clinch'&&e.posClinch==='cage'){
      const sg=S.segs[e.seg];
      st.pinWho=sg&&sg.beat&&sg.beat.by==='op'?'A':'B';
      const pw=st[st.pinWho], an=Math.atan2(pw.y,pw.x); st.pinPan=((Math.round((an-SEG/2)/SEG)%8)+8)%8;
      st.pin=salEase((t-(sg?sg.t0:t))/0.5);
    }
    if(!cx.pause){
      const co=S.coups; let lo=0, hi=co.length;
      while(lo<hi){ const mid=(lo+hi)>>1; if(co[mid].t<t-1.4) lo=mid+1; else hi=mid; }
      for(let i=lo;i<co.length&&co[i].t<=t;i++){
        const ev=co[i], dt=t-ev.t; if(dt<0||dt>1.4) continue;
        const A=st[ev.by], B=st[ev.by==='A'?'B':'A'], bx=B.x-A.x, by=B.y-A.y, dist=Math.sqrt(bx*bx+by*by)||0.001, ux=bx/dist, uy=by/dist;
        const reach=clamp(dist-0.225,0,0.26);
        if(ev.r!==3){
          const ph=dt<0.09?salEase(dt/0.09):1-salEase((dt-0.09)/0.26);
          A.dx+=ux*reach*ph; A.dy+=uy*reach*ph;
          if(ev.r===1&&dt>=0.09){ const kb=ev.p*0.13*(1-salEase((dt-0.09)/0.8))*salEase((dt-0.09)/0.07); B.dx+=ux*kb; B.dy+=uy*kb; st.exc+=ev.p*0.5*Math.exp(-(dt-0.09)/0.7); }
          if(ev.r===0){ const sd=Math.sin(clamp(dt/0.4,0,1)*Math.PI)*0.09; B.dx+=-uy*sd; B.dy+=ux*sd; }
        }
        st.fx.push({e:ev,i:i,dt:dt,ux:ux,uy:uy});
        if(ev.type==='knee'&&dt>0.09) st.knee=Math.max(st.knee,1-salEase((dt-0.09)/0.5));
        if(ev.big&&dt>=0.09) st.wave=(dt-0.09)*9;
      }
    }
    st.exc=clamp(st.exc,0,1.25);
    return st;
  }

  /* ---- une image ---- */
  V.dessiner=function(cx){ V.dernier=cx;
    const dtReel=V.reelPrec===undefined?0.016:clamp(cx.real-V.reelPrec,0,0.1); V.reelPrec=cx.real;
    ctx.setTransform(V.k,0,0,V.k,0,0); ctx.globalAlpha=1; ctx.setLineDash([]);
    const st=pions(cx);
    setCam(cx,st,dtReel);
    ctx.fillStyle='#0B0909'; ctx.fillRect(0,0,W,H);
    let shake=0;
    if(cx.regl.secousses!==false) for(let i=0;i<st.fx.length;i++){ const f=st.fx[i]; if(f.e.r===1&&f.dt>0.09&&f.dt<0.4) shake=Math.max(shake,f.e.p*12*(1-(f.dt-0.09)/0.31)); }
    ctx.save(); if(shake>0.3) ctx.translate(Math.sin(cx.real*71)*shake,Math.cos(cx.real*83)*shake);
    stadium(st,cx.room,cx.real); walkways();
    const g=ctx.createRadialGradient(W/2,CY,260,W/2,CY,1200); g.addColorStop(0,'rgba(11,9,9,0)'); g.addColorStop(1,'rgba(11,9,9,'+(0.7-0.36*clamp(st.exc,0,1)).toFixed(2)+')'); ctx.fillStyle=g; ctx.fillRect(-40,-40,W+80,H+80);
    floorRing(); sideline(st,cx); cage(st,false,cx);
    /* les traces au sol : les dernières positions de chaque pion */
    const tr=V.trail;
    if(cx.t!==V.tPrec&&(cx.t-V.tPrec>0.09||cx.t<V.tPrec)){ V.tPrec=cx.t; tr.A.push([st.A.x,st.A.y]); tr.B.push([st.B.x,st.B.y]); if(tr.A.length>26){ tr.A.shift(); tr.B.shift(); } }
    ctx.lineCap='round';
    for(const w of ['A','B']){ const lst=tr[w]; if(lst.length>1){ ctx.setLineDash([3,12]); ctx.lineWidth=5; for(let q=1;q<lst.length;q++){ const a=P(lst[q-1][0],lst[q-1][1],0), b=P(lst[q][0],lst[q][1],0); ctx.strokeStyle=w==='A'?'rgba(233,230,225,'+(0.5*q/lst.length).toFixed(2)+')':'rgba(226,58,43,'+(0.8*q/lst.length).toFixed(2)+')'; ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); } ctx.setLineDash([]); } }
    drawFx(st);
    let gp=null, gr=0; const mx=(st.A.x+st.B.x)/2, my=(st.A.y+st.B.y)/2;
    if(st.ground||st.clinch){ gp=P(mx,my,0); gr=(st.ground?0.2:0.17)*cam.zoom; ctx.strokeStyle='rgba(233,230,225,0.7)'; ctx.lineWidth=3; ctx.setLineDash([10,10]); ctx.lineDashOffset=-cx.real*40; ctx.beginPath(); ctx.ellipse(gp[0],gp[1],gr,gr*cam.ky,0,0,TAU); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset=0; }
    const fA=Math.atan2(st.B.y-st.A.y,st.B.x-st.A.x), fB=fA+Math.PI, R=0.112, K=cx.carte;
    const wobA=st.A.hurt?Math.sin(cx.real*16)*0.35*st.A.hurt:0, wobB=st.B.hurt?Math.sin(cx.real*16)*0.35*st.B.hurt:0;
    const list=[['R',st.R.x,st.R.y,0.082,C.grey,C.greyf,'A',C.cr,null,{}],
      ['A',st.A.x+st.A.dx+wobA*0.01,st.A.y+st.A.dy,R,C.cr,C.crf,K.la,C.ink,fA,{hurt:st.A.hurt>0.05,rot:wobA}],
      ['B',st.B.x+st.B.dx+wobB*0.01,st.B.y+st.B.dy,R,C.red,C.rdf,K.lb,C.cr,fB,{hurt:st.B.hurt>0.05,rot:wobB}]];
    for(let i=0;i<3;i++) list[i].push(P(list[i][1],list[i][2],0)[2]);
    list.sort(function(a,b){ return a[10]-b[10]; });
    /* au sol le dessus se dessine après le dessous */
    if(st.ground){ const top=cx.etat.top==='B'?'B':'A'; list.sort(function(a,b){ return (a[0]===top?1:0)-(b[0]===top?1:0); }); }
    for(let i=0;i<3;i++){ const c=list[i]; coin(c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8],c[9]); }
    cage(st,true,cx);
    if(st.ground&&gp&&cx.regl.noms!==false) plate(MGMT_GESTES.sol,gp[0],gp[1]+gr*cam.ky+62,30,C.panel,C.cr,'center');
    if(cx.regl.noms!==false) drawLabels(st,(st.ground&&gp)?[[gp[0],gp[1]+gr*cam.ky+51,tw(MGMT_GESTES.sol,30)/2+34]]:[]);
    if(cx.combattez){ const rp=P(st.R.x,st.R.y,0); ctx.globalAlpha=clamp(cx.combattez,0,1); plate('« COMBATTEZ ! »',rp[0],rp[1]-0.082*cam.zoom*cam.ky-18,44,C.panel,C.cr,'center'); ctx.globalAlpha=1; }
    if(cx.juges>0){
      for(let i=0;i<SAL_SIDE.length;i++){ const o=SAL_SIDE[i]; if(o.judge===undefined) continue; const jp=P(o.x,o.y,0), a2=salEase(cx.juges-o.judge*1.6); if(a2>0&&jp[1]<H-130&&jp[1]>200&&cx.mode!=='dec'&&!reserve(jp[0]-80,jp[1]-70,jp[0]+80,jp[1]-14)){ ctx.globalAlpha=a2; plate('10 – ?',jp[0],jp[1]-24,34,C.cr,C.ink,'center'); ctx.globalAlpha=1; } }
    }
    ctx.restore();
    if(cx.mode==='dec'){ hud(cx); decision(cx); }
    else{ voices(cx); hud(cx); titles(cx); }
  };
  return V;
}
/* ==== [FIN ANCRE] ==== */
