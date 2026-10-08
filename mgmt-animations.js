"use strict";
/* ==== [ANCRE: MGMT_FIDELITE_MOUVEMENT] — Reprise de fidélité du 07/10/2026 : le mouvement de la planche « Le mouvement de l'interface » (Mouvement.dc.html).
   La règle : tout arrive vite et en biais, tout se pose droit, rien ne bouge au repos. Six gestes, aux durées et aux courbes de la planche :
   1. L'ARRIVÉE d'un écran : la barre (200 ms, 16 ms d'écart entre deux sections), l'en-tête (220 ms), les panneaux (340 ms, léger rebond, 55 ms d'écart),
      les touches (220 ms, à 300 ms) ;
   2. Le PASSAGE d'un écran à l'autre : une bande à 45° (blanc cassé, rouge, noir) traverse en 620 ms à vitesse constante ; l'écran change dessous, à mi-course ;
   3. CHOISIR dans une liste : la ligne claire arrive en biais sur la ligne choisie, en 190 ms ;
   4. CHANGER D'ONGLET : le contenu glisse de 60 px en 240 ms, l'onglet se pose avec un léger rebond (200 ms) ;
   5. LE DÉFILÉ (le calendrier) : les trois cartes glissent de 170 px en 320 ms, l'une après l'autre ;
   6. VALIDER : le bouton jaune s'enfonce (200 ms), un éclat clair le traverse en biais (260 ms), puis l'action part (240 ms) ;
   7. LA VOIX : l'onglet monte (160 ms), puis la phrase se déroule de gauche à droite (300 ms).
   Du pur habillage : aucune règle, aucune donnée, aucun tirage. Rien ne se joue sans l'API d'animation du navigateur (le harnais de test n'en a pas) ni quand le
   système demande moins de mouvement. ==== */

const MGMT_ANIM_SORTIE='cubic-bezier(0.2, 0.9, 0.2, 1)';
const MGMT_ANIM_REBOND='cubic-bezier(0.2, 1.5, 0.4, 1)';
const MGMT_ANIM_BALAYAGE_MS=620;
/** Vu : le dernier écran dessiné. sel/ong : ce qui était choisi / ouvert au dernier dessin. coef : 1 = vitesse réelle (4 = au ralenti). */
let MGMT_ANIM={vu:null,sel:[],ong:[],cal:null,voix:'',coef:1,presse:false,balayage:0};

function mgmtAnimOk(){
  try{
    if(typeof document==='undefined'||typeof document.createElement!=='function') return false;
    if(typeof document.createElement('div').animate!=='function') return false;
    /* Le réglage Affichage › Mouvement de l'interface décide (oui d'origine), pas la préférence du système : ces gestes sont brefs et se coupent dans les options.
       Un test ou un harnais sans réglages joue le mouvement. */
    if(typeof MGMT_REGLAGES!=='undefined'&&MGMT_REGLAGES.affichage&&MGMT_REGLAGES.affichage.mouvement===false) return false;
    return true;
  }catch(e){ return false; }
}
/** Joue une animation avec les durées de la planche, mises à l'échelle du coefficient de vitesse. */
function mgmtAnimJoue(el,frames,ms,o){
  if(!el||typeof el.animate!=='function') return null;
  o=o||{};
  try{ return el.animate(frames,{duration:ms*MGMT_ANIM.coef,delay:(o.delay||0)*MGMT_ANIM.coef,easing:o.easing||MGMT_ANIM_SORTIE,fill:o.fill||'backwards'}); }catch(e){ return null; }
}
function mgmtAnimTous(racine,sel){ return Array.prototype.slice.call((racine||document).querySelectorAll(sel)); }
function mgmtAnimVisible(el){ return !!el&&(el.offsetParent!==null||(el.getClientRects&&el.getClientRects().length>0)); }

/** 1. Les pièces d'un écran arrivent. */
function mgmtAnimArrivee(stage){
  if(!stage) return;
  mgmtAnimTous(stage,'.mf-barre .mf-barre-item').forEach((b,n)=>mgmtAnimJoue(b,[{transform:'translateX(-36px)',opacity:0},{transform:'none',opacity:1}],200,{delay:n*16}));
  mgmtAnimTous(stage,'.mf-entete').forEach(h=>mgmtAnimJoue(h,[{transform:'translateY(-24px)',opacity:0},{transform:'none',opacity:1}],220,{delay:60}));
  const pieces=mgmtAnimTous(stage,'.mf-panneau, .mf-ancien, .mf-accueil-gauche, .mf-affiche > *, .mf-dialogue').filter(p=>!p.closest('.mf-voix-bulle'));
  pieces.forEach((p,n)=>mgmtAnimJoue(p,[{transform:'translate(34px, 34px)',opacity:0},{transform:'none',opacity:1}],340,{delay:90+Math.min(n,10)*55,easing:MGMT_ANIM_REBOND}));
  mgmtAnimTous(stage,'.mf-touches, .mf-accueil-touches').forEach(h=>mgmtAnimJoue(h,[{opacity:0},{opacity:1}],220,{delay:300}));
}

/** 2. La bande qui traverse l'écran ; l'écran change dessous, à mi-course. */
function mgmtAnimBalayage(stage,milieu){
  if(!stage||!mgmtAnimOk()){ milieu(); return; }
  const id=++MGMT_ANIM.balayage;
  const voile=document.createElement('div');
  voile.className='mf-balayage'; voile.setAttribute('aria-hidden','true');
  voile.innerHTML='<div data-m="wipe"><div style="width:40px;background:#E9E6E1"></div><div style="width:360px;background:#B32A1E"></div><div style="width:4200px;background:#0D0B0B"></div><div style="width:360px;background:#B32A1E"></div><div style="width:40px;background:#E9E6E1"></div></div>';
  stage.appendChild(voile);
  stage.classList.add('mf-masque');
  mgmtAnimJoue(voile.firstChild,[{transform:'translateX(-5200px) skewX(-45deg)'},{transform:'translateX(3100px) skewX(-45deg)'}],MGMT_ANIM_BALAYAGE_MS,{easing:'linear',fill:'both'});
  setTimeout(()=>{ if(id!==MGMT_ANIM.balayage) return; stage.classList.remove('mf-masque'); milieu(); },MGMT_ANIM_BALAYAGE_MS*0.5*MGMT_ANIM.coef);
  setTimeout(()=>{ if(voile.parentNode) voile.parentNode.removeChild(voile); },MGMT_ANIM_BALAYAGE_MS*MGMT_ANIM.coef+40);
}

/** Un chemin stable pour reconnaître un élément d'un dessin à l'autre. */
function mgmtAnimChemin(el,racine){
  const p=[]; let x=el;
  while(x&&x!==racine&&x.parentElement){ p.push(Array.prototype.indexOf.call(x.parentElement.children,x)); x=x.parentElement; }
  return p.reverse().join('/');
}
/** 3. La ligne claire arrive en biais sur ce qui vient d'être choisi. */
function mgmtAnimChoix(stage,premier){
  const cles=[], els=mgmtAnimTous(stage,'.choisie, .choisi:not(.mf-panneau), .mf-panneau.choisi, .mf-op-l.sel, .mf-menu button.on').filter(e=>mgmtAnimVisible(e));
  els.forEach(e=>cles.push(mgmtAnimChemin(e,stage)+'|'+e.className.split(' ')[0]));
  if(!premier) els.forEach((e,i)=>{
    if(MGMT_ANIM.sel.indexOf(cles[i])>=0) return;
    mgmtAnimJoue(e,[{clipPath:'polygon(0px 0px, 0px 0px, -88px 100%, 0px 100%)',transform:'translateX(-10px)'},{clipPath:'polygon(0px 0px, calc(100% + 88px) 0px, 100% 100%, 0px 100%)',transform:'none'}],190);
  });
  MGMT_ANIM.sel=cles;
}
/** 4. Le contenu glisse de 60 px, l'onglet se pose avec un léger rebond. */
function mgmtAnimOnglet(stage,premier){
  const ongs=mgmtAnimTous(stage,'.mf-onglet');
  const ouvert=ongs.map((o,i)=>o.classList.contains('ouvert')?i:-1).filter(i=>i>=0);
  const cle=ouvert.join(',');
  if(!premier&&MGMT_ANIM.ong.length&&cle!==MGMT_ANIM.ong.join(',')&&ouvert.length){
    const avant=MGMT_ANIM.ong[0], apres=ouvert[0], sens=apres>avant?60:-60;
    const contenu=stage.querySelector('.mf-op-ls, .mf-op-touches, .mf-fiche-corps, .mf-fiche-contenu');
    mgmtAnimJoue(contenu,[{transform:'translateX('+sens+'px)',opacity:0},{transform:'none',opacity:1}],240);
    mgmtAnimJoue(ongs[apres],[{transform:'translateY(8px)'},{transform:'none'}],200,{easing:MGMT_ANIM_REBOND});
  }
  MGMT_ANIM.ong=ouvert;
}
/** 5. Le défilé : les cartes du calendrier. */
function mgmtAnimDefile(stage,premier){
  if(typeof MGMT_CALENDRIER==='undefined'||typeof G==='undefined'||!G||G.screen!=='mgmt_calendrier') { MGMT_ANIM.cal=null; return; }
  const n=MGMT_CALENDRIER.n;
  if(!premier&&MGMT_ANIM.cal!==null&&n!==MGMT_ANIM.cal){
    const d=n>MGMT_ANIM.cal?1:0, de=d?170:-170;
    mgmtAnimTous(stage,'.mf-contenu .mf-panneau, .mf-cal-lat, .mf-cal-centre').filter(p=>!p.closest('.mf-panneau .mf-cal-lat')).forEach((p,i)=>mgmtAnimJoue(p,[{transform:'translateX('+de+'px)',opacity:0},{transform:'none',opacity:1}],320,{delay:(d?i:2-i)*55,easing:MGMT_ANIM_REBOND}));
  }
  MGMT_ANIM.cal=n;
}
/** 7. La voix : l'onglet monte, la phrase se déroule. */
function mgmtAnimVoix(stage,retard){
  const q=stage.querySelector('.mf-voix-qui'), b=stage.querySelector('.mf-voix-bulle');
  const cle=(q?q.textContent:'')+'|'+(b?b.textContent:'');
  if(!q||!b){ MGMT_ANIM.voix=''; return; }
  if(cle!==MGMT_ANIM.voix||retard){
    mgmtAnimJoue(q,[{transform:'translateY(14px)',opacity:0},{transform:'none',opacity:1}],160,{delay:retard||0});
    mgmtAnimJoue(b,[{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 0% 0 0)',opacity:1}],300,{delay:(retard||0)+110});
  }
  MGMT_ANIM.voix=cle;
}

/** Les étapes importantes, seules à jouer le grand mouvement : la soirée, le lendemain, et tout passage entre le jeu et l'extérieur (menu, nouvelle partie). */
const MGMT_ANIM_MAJEURS=['mgmt_soiree','mgmt_lendemain','mgmt_confirmation'];
const MGMT_ANIM_FONDU_MS=90;
function mgmtAnimImportant(avant,apres){
  const dedans=x=>typeof x==='string'&&x.indexOf('mgmt_')===0;
  return MGMT_ANIM_MAJEURS.indexOf(avant)>=0||MGMT_ANIM_MAJEURS.indexOf(apres)>=0||!dedans(avant)||!dedans(apres);
}

/** Après chaque dessin d'écran : l'arrivée (avec la bande si l'on vient d'un autre écran) ou le geste du changement. */
function mgmtAnimApres(){
  if(typeof G==='undefined'||!G||!mgmtAnimOk()) return;
  const stage=document.querySelector('.mf-stage'); if(!stage) return;
  const ecran=G.screen, avant=MGMT_ANIM.vu, nouveau=ecran!==avant, depart=avant===null;
  MGMT_ANIM.vu=ecran;
  if(nouveau){
    MGMT_ANIM.sel=[]; MGMT_ANIM.ong=[]; MGMT_ANIM.cal=null; MGMT_ANIM.voix='';
    mgmtAnimChoix(stage,true); mgmtAnimOnglet(stage,true); mgmtAnimDefile(stage,true);
    const joue=()=>{ mgmtAnimArrivee(stage); mgmtAnimVoix(stage,420); };
    /* Demande d'Anthony du 08/10/2026 : le grand mouvement (la bande et l'arrivée des pièces) ne sert qu'aux étapes importantes ; entre deux sections de la barre, un fondu bref. */
    if(depart) joue();
    else if(mgmtAnimImportant(avant,ecran)) mgmtAnimBalayage(stage,joue);
    else mgmtAnimJoue(stage.querySelector('.mf-contenu')||stage,[{opacity:0},{opacity:1}],MGMT_ANIM_FONDU_MS);
    return;
  }
  mgmtAnimChoix(stage,false); mgmtAnimOnglet(stage,false); mgmtAnimDefile(stage,false); mgmtAnimVoix(stage,0);
}

/** 6. Valider : le bouton jaune s'enfonce, l'éclat le traverse, puis l'action part. */
function mgmtAnimPresse(e){
  if(MGMT_ANIM.presse||!mgmtAnimOk()) return;
  const b=e.target&&e.target.closest?e.target.closest('.mf-bouton.jaune'):null;
  if(!b||b.disabled) return;
  e.stopImmediatePropagation(); e.preventDefault();
  MGMT_ANIM.presse=true;
  b.style.position='relative'; b.style.overflow='hidden';
  const eclat=document.createElement('span');
  eclat.setAttribute('aria-hidden','true');
  eclat.style.cssText='position:absolute;left:-90px;top:0;width:60px;height:100%;background:#E9E6E1;opacity:0;transform:skewX(-45deg);pointer-events:none';
  b.appendChild(eclat);
  mgmtAnimJoue(b,[{transform:'scale(1)'},{transform:'scale(0.93)'},{transform:'scale(1)'}],200,{fill:'none'});
  mgmtAnimJoue(eclat,[{transform:'translateX(0px) skewX(-45deg)',opacity:0.85},{transform:'translateX(560px) skewX(-45deg)',opacity:0.85}],260,{fill:'none'});
  setTimeout(()=>{
    MGMT_ANIM.presse=false;
    if(eclat.parentNode) eclat.parentNode.removeChild(eclat);
    /* Le geste a eu lieu : le clic repart tel quel (le garde est levé, il ne se rejoue pas). */
    MGMT_ANIM.libre=true; try{ b.click(); }finally{ MGMT_ANIM.libre=false; }
  },240*MGMT_ANIM.coef);
}
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('click',e=>{ if(MGMT_ANIM.libre) return; mgmtAnimPresse(e); },true);
}
/* Chaque écran dessiné joue son mouvement. */
if(typeof window!=='undefined'&&typeof render==='function'&&!render.anime){
  const dessin=render;
  window.render=function(){ const r=dessin.apply(this,arguments); try{ mgmtAnimApres(); }catch(e){} return r; };
  window.render.anime=true;
  if(dessin.sonne) window.render.sonne=true;
}
/* ==== [FIN ANCRE] ==== */
