"use strict";
/* ==== [ANCRE: MAQUETTE_MOUVEMENT] — Le mouvement « fluide » (T3), commun à tous les écrans de la maquette.
   Un seul jeu d'effets, chargé en dernier, qui ne change ni les données ni le rendu :
   la barre, les onglets, les filtres, les tris, le survol et l'arrivée sur un écran.
   Les entrées déjà validées écran par écran sont gardées ; la soirée et l'Arrivée gardent les leurs.
   Règles : rien ne bloque un clic, seul ce qui est visible s'anime, un écran revu s'ouvre plus vite.
   Adresses : &mvmouv=1 (montre tout le mouvement même si l'ordinateur en demande moins, gardé
   pendant la session), &mvmouv=0 (revient au réglage de l'ordinateur), &mvessai=0 (sans ce jeu d'effets). ==== */
const MV_GESTION=new Set(['accueil','messages','carte','effectif','classements','contrats','recruteur','rapports','camps','presse','calendrier','resultats','finances','organisation','options']);
const MV_PROPRES=new Set(['accueil','effectif']);
const MV_COURBE='cubic-bezier(.2,.8,.2,1)';
const MV_CLE_FORCE='maquette-mouvement';
const MV_LIGNES_VISIBLES=15;
const MV_LIGNES_MAX=40;
const MV_TRAIT_BASE=320,MV_TRAIT_PX=.7,MV_TRAIT_MAX=720,MV_TRAIT_POSE=130,MV_TRAIT_FONDU=130; /* le trait des filtres, en ms */
const mvQ=new URLSearchParams(location.search);
const mvLireForce=()=>{
  const v=mvQ.get('mvmouv'),demande=v==='1'||mvQ.get('mnmouv')==='1';
  try{if(demande)sessionStorage.setItem(MV_CLE_FORCE,'1');if(v==='0')sessionStorage.removeItem(MV_CLE_FORCE);return sessionStorage.getItem(MV_CLE_FORCE)==='1';}
  catch(e){return demande;}
};
const MV={actif:mvQ.get('mvessai')!=='0',force:false,ecran:null,cle:null,hist:0,cours:[],vus:new Set(),t:0,dernier:null};
MV.force=MV.actif&&mvLireForce();
/** Forcé : les écrans ne voient plus la préférence de l'ordinateur, ni en CSS ni en script. */
function mvLeverReduit(){
  const mm=window.matchMedia.bind(window);
  window.matchMedia=q=>mm(/prefers-reduced-motion:\s*reduce/.test(q)?'not all':q);
  for(const f of document.styleSheets){
    let r;try{r=f.cssRules;}catch(e){continue;}
    for(let i=r.length-1;i>=0;i--)if(r[i].media&&/prefers-reduced-motion:\s*reduce/.test(r[i].media.mediaText))f.deleteRule(i);
  }
}
if(MV.force)mvLeverReduit();
const mvOk=()=>MV.actif&&(MV.force||!matchMedia('(prefers-reduced-motion:reduce)').matches);
const mvTous=(s,r=document)=>[...r.querySelectorAll(s)];
const mvEchelle=()=>document.querySelector('.scene').getBoundingClientRect().width/1920;
/** Une position dans la zone, en pixels de la scène. */
function mvCase(el){
  const r=el.getBoundingClientRect(),z=$('#zone').getBoundingClientRect(),k=mvEchelle();
  return {x:(r.left-z.left)/k,y:(r.top-z.top)/k,w:r.width/k,h:r.height/k};
}

/* ---- Les pièces du jeu d'effets ---- */
function mvJoue(el,images,o={}){
  if(!el)return null;
  const a=el.animate(images,Object.assign({duration:320,easing:MV_COURBE,fill:'backwards'},o));
  MV.cours.push(a);return a;
}
const mvArrive=(el,o={})=>mvJoue(el,[{opacity:0,transform:`translate(${o.x||0}px,${o.y||0}px)`},{opacity:1,transform:'none'}],o);
/* Une animation finie n'est pas annulée : son « annulé » arriverait après coup et nettoierait l'animation suivante. */
function mvStopCours(){MV.cours.forEach(a=>{if(a.playState!=='finished')a.cancel();});MV.cours=[];}
const mvFin=(a,f)=>{if(a){a.onfinish=f;a.oncancel=f;}else f();};
/** Un nombre qui monte ; il s'efface si Continuer change la valeur entre-temps. */
function mvCompteur(el,ms=620){
  if(!el)return;const v=+el.textContent.replace(/\D/g,'');if(!v)return;
  let der=nb(0);el.textContent=der;const t0=performance.now();
  const f=t=>{if(el.textContent!==der)return;const k=Math.min(1,Math.max(0,(t-t0)/ms)),e=1-Math.pow(1-k,3);
    der=nb(k<1?v*e:v);el.textContent=der;if(k<1)requestAnimationFrame(f);};
  requestAnimationFrame(f);
}
const mvJauges=(r,delai=220)=>mvTous('.jauge>i',r).forEach((e,i)=>mvJoue(e,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:760,delay:delai+i*70}));
function mvReflet(bloc,delai){
  if(!bloc)return;const i=document.createElement('i');i.className='mv-reflet';bloc.appendChild(i);
  const a=mvJoue(i,[{transform:'translateX(-130%) skewX(-18deg)'},{transform:'translateX(420%) skewX(-18deg)'}],{duration:820,delay:delai,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
  mvFin(a,()=>i.remove());
}
/** L'élément courant de la barre glisse d'une ligne à l'autre. La case contient une copie de la barre
 *  en texte noir, qui reste immobile pendant que la case passe : les couleurs ne sont jamais recalculées. */
function mvBarre(y0){
  const n=document.querySelector('#barre .item.cur'),b=$('#barre');if(!n||y0===undefined||y0===n.offsetTop)return;
  const dy=y0-n.offsetTop,g=document.createElement('div'),v=document.createElement('div');
  b.classList.add('mv-glisse');g.className='mv-cur';g.setAttribute('aria-hidden','true');v.className='mv-cur-v';
  g.style.cssText=`left:${n.offsetLeft}px;top:${n.offsetTop}px;width:${n.offsetWidth}px;height:${n.offsetHeight}px`;
  v.style.cssText=`left:${-n.offsetLeft}px;top:${-n.offsetTop}px;width:${b.clientWidth}px;height:${b.clientHeight}px`;
  mvTous('.item',b).forEach(it=>{const c=it.cloneNode(true);c.classList.remove('cur');c.classList.add('mv-copie');c.removeAttribute('data-go');
    c.style.cssText=`position:absolute;left:${it.offsetLeft}px;top:${it.offsetTop}px;width:${it.offsetWidth}px;height:${it.offsetHeight}px`;v.appendChild(c);});
  g.appendChild(v);b.appendChild(g);
  const a=mvJoue(g,[{transform:`translateY(${dy}px)`},{transform:'none'}],{duration:260});
  mvJoue(v,[{transform:`translateY(${-dy}px)`},{transform:'none'}],{duration:260});
  mvFin(a,()=>{g.remove();if(!b.querySelector('.mv-cur'))b.classList.remove('mv-glisse');});
}
/** L'onglet ouvert : une copie de la rangée, tous onglets ouverts, se découvre de l'ancien au nouveau. */
function mvOngletGlisse(de,n){
  if(!de||!n)return;const r=mvCase(n);if(Math.abs(de.x-r.x)<1&&Math.abs(de.y-r.y)<1)return;
  const rang=n.parentElement,z=mvCase(rang),c=parseFloat(getComputedStyle(n).getPropertyValue('--c'))||10;
  /* Le texte de chaque onglet passe dans un élément à part : le gris neutre ne touche pas sa pastille jaune. */
  mvTous('.onglet',rang).forEach(t=>[...t.childNodes].forEach(x=>{if(x.nodeType===3&&x.textContent.trim()){const s=document.createElement('span');s.className='mv-gris';x.replaceWith(s);s.appendChild(x);}}));
  const v=rang.cloneNode(true);
  mvTous('[id]',v).forEach(e=>e.removeAttribute('id'));
  rang.classList.add('mv-rang-gris');
  v.classList.add('mv-plaque','mv-rang-gris');v.setAttribute('aria-hidden','true');
  v.style.cssText=`${rang.style.cssText};position:absolute;left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px;margin:0;box-sizing:border-box`;
  [...v.children].forEach(e=>{if(e.classList.contains('onglet')){e.classList.add('ouvert');e.classList.remove('mv-sous');}else e.style.visibility='hidden';});
  const octo=b=>{const x=b.x-z.x,y=b.y-z.y,w=b.w,h=b.h;return `polygon(${x+c}px ${y}px,${x+w-c}px ${y}px,${x+w}px ${y+c}px,${x+w}px ${y+h-c}px,${x+w-c}px ${y+h}px,${x+c}px ${y+h}px,${x}px ${y+h-c}px,${x}px ${y+c}px)`;};
  v.style.clipPath=octo(r);$('#zone').appendChild(v);n.classList.add('mv-sous');
  mvFin(mvJoue(v,[{clipPath:octo(de)},{clipPath:octo(r)}],{duration:260}),()=>{v.remove();n.classList.remove('mv-sous');rang.classList.remove('mv-rang-gris');});
}
/** Un filtre choisi : un trait blanc relie l'ancien au nouveau. */
function mvFiltreGlisse(de,n){
  const r=mvCase(n);if(Math.abs(de.x-r.x)<1&&Math.abs(de.w-r.w)<1)return;
  const g=document.createElement('i');g.className='mv-filtre';g.style.top=(r.y+r.h+4)+'px';$('#zone').appendChild(g);
  /* Plus le filtre est loin, plus le trait prend son temps ; il se pose, puis s'efface. */
  const fin=`translateX(${r.x}px) scaleX(${r.w})`,trajet=Math.min(MV_TRAIT_MAX,MV_TRAIT_BASE+Math.abs(r.x-de.x)*MV_TRAIT_PX),total=trajet+MV_TRAIT_POSE+MV_TRAIT_FONDU;
  mvFin(mvJoue(g,[{transform:`translateX(${de.x}px) scaleX(${de.w})`,opacity:1,easing:'cubic-bezier(.4,0,.2,1)'},{transform:fin,opacity:1,offset:trajet/total},{transform:fin,opacity:1,offset:(trajet+MV_TRAIT_POSE)/total},{transform:fin,opacity:0}],{duration:total,easing:'linear',fill:'both'}),()=>g.remove());
}
const mvFiltres=()=>{const m={};mvTous('#corps .bb.on').forEach(e=>{const k=Object.keys(e.dataset)[0];if(k&&!m[k])m[k]={v:e.dataset[k],c:mvCase(e),el:e};});return m;};
/** La surbrillance octogonale suit la souris dans tout tableau. */
function mvSurvol(){
  const t=document.querySelector('#corps table'),d=t&&t.closest('.defile');if(!d||!t.tBodies[0]||d.querySelector('.mv-survol'))return;
  d.classList.add('mv-sv');t.classList.add('mv-svt');
  const s=document.createElement('i');s.className='mv-survol oct';d.prepend(s);
  t.tBodies[0].addEventListener('mouseover',e=>{const r=e.target.closest('tr');if(!r)return;
    s.style.width=t.offsetWidth+'px';s.style.height=r.offsetHeight+'px';s.style.transform=`translateY(${t.offsetTop+r.offsetTop}px)`;s.classList.add('on');});
  t.tBodies[0].addEventListener('mouseleave',()=>s.classList.remove('on'));
}
/* Trier : chaque ligne visible glisse de son ancienne place à la nouvelle. */
const mvRangees=()=>mvTous('#corps tbody tr,#corps .rc-l');
function mvIdLigne(r){const e=r.querySelector('[data-fiche]')||r,d=e.dataset,k=Object.keys(d)[0];return k?d[k]:(r.textContent||'').trim().slice(0,40);}
function mvLecture(){
  const l=mvRangees();if(!l.length||l.length>MV_LIGNES_MAX)return null;
  const k=mvEchelle(),m=new Map(),ordre=[];
  l.forEach(r=>{const id=mvIdLigne(r);if(id&&!m.has(id)){m.set(id,r.getBoundingClientRect().top/k);ordre.push(id);}});
  return {m,ordre};
}
function mvTri(av){
  const n=mvLecture(),a=av.lignes;if(!n||!a)return false;
  if(a.ordre.length!==n.ordre.length||a.ordre.join('\n')===n.ordre.join('\n')||!n.ordre.every(k=>a.m.has(k)))return false;
  const l=mvRangees(),p=l[0].parentElement,cadre=(l[0].closest('.defile')||$('#corps')).getBoundingClientRect(),k=mvEchelle(),haut=cadre.top/k,bas=cadre.bottom/k;
  p.classList.add('mv-tri');let dernier=null,i=0;
  for(const r of l){
    r.classList.remove('apparait');
    const id=mvIdLigne(r),y0=a.m.get(id),y1=n.m.get(id);
    if(y0===undefined||y0===y1||y1<haut-70||y1>bas)continue;
    dernier=y0<haut-10||y0>=bas?mvArrive(r,{y:12,duration:260,delay:60+i*12}):mvJoue(r,[{transform:`translateY(${y0-y1}px)`},{transform:'none'}],{duration:300,delay:i*5});
    i++;
  }
  mvFin(dernier,()=>p.classList.remove('mv-tri'));
  return true;
}

/* ---- L'Accueil ---- */
function mvAccueil(premier,sens){
  const x=sens*30,k=premier?1:.62,c=$('#corps');
  mvArrive(c.querySelector('.bandeau'),{y:-10,duration:320*k});
  mvArrive(c.querySelector('.bandeau .T'),{x:-34,duration:420*k,delay:30});
  mvTous('.bandeau .stat-b',c).forEach((e,i)=>mvArrive(e,{y:14,duration:340*k,delay:(premier?60:30)+i*(premier?45:24)}));
  const pans=mvTous('.pan',c);
  pans.forEach((e,i)=>mvArrive(e,{x:premier?0:x,y:premier?18:0,duration:380*k,delay:(premier?70:40)+i*(premier?55:28)}));
  if(premier){
    pans.forEach((p,j)=>mvTous('.ligne',p).slice(0,8).forEach((e,i)=>mvArrive(e,{x:-14,duration:280,delay:130+j*50+i*24})));
    mvCompteur(document.getElementById('jours'));mvCompteur(document.getElementById('preventes'),760);
    const bloc=mvTous('#corps .oct.cj').find(e=>!e.classList.contains('bouton'));
    if(bloc){mvJoue(bloc,[{transform:'scale(.97)'},{transform:'none'}],{duration:360,delay:220});mvReflet(bloc,620);}
  }
  mvJauges(c,premier?240:60);
}

/* ---- L'Effectif ---- */
const mvRangs=()=>{const t=document.querySelector('.eff-t tbody');return t?[...t.rows]:[];};
function mvLignes(dx,o={}){
  /* Une très longue liste bouge d'un seul bloc : animer ses lignes une à une ferait saccader. */
  if(mvRangs().length>MV_LIGNES_MAX){mvArrive(document.querySelector('.eff-t'),{x:dx,duration:o.duree||260});return;}
  mvRangs().slice(0,MV_LIGNES_VISIBLES).forEach((r,i)=>{
    mvArrive(r,{x:dx,duration:o.duree||300,delay:(o.delai||0)+i*(o.pas||20)});
    if(o.marques)mvJoue(r.querySelector('.s5'),[{opacity:0,transform:'translateX(-16px) scale(.94)'},{opacity:1,transform:'none'}],{duration:320,delay:150+i*24,easing:'cubic-bezier(.3,1.3,.5,1)'});
  });
}
function mvOnglet(sens){
  const c=$('#corps');
  mvTous('.inf-g>.pan',c).forEach((e,i)=>mvArrive(e,{x:sens*28,duration:320,delay:i*60}));
  mvTous('.inf-l:not(.inf-tete)',c).forEach((e,i)=>mvArrive(e,{x:sens*18,duration:300,delay:90+i*50}));
  mvTous('.inf-s',c).forEach((e,i)=>mvArrive(e,{y:10,duration:280,delay:170+i*50}));
  if(S.eff.onglet!=='infirmerie'){mvArrive(c.querySelector('.eff-t thead'),{duration:200});mvLignes(sens*18,{duree:230,pas:13});}
}
function mvEffectif(premier,sens){
  const c=$('#corps');
  mvTous('.eff-filtres>*',c).forEach((e,i)=>mvArrive(e,{y:-8,duration:premier?300:200,delay:Math.min(i,12)*(premier?22:8)}));
  if(S.eff.onglet==='infirmerie'){mvOnglet(sens);return;}
  mvArrive(c.querySelector('.eff-t thead'),{duration:240});
  mvLignes(sens*(premier?26:16),premier?{duree:300,pas:22,delai:70,marques:true}:{duree:220,pas:12,delai:50});
}
const mvRangCat=(sexe,cat)=>(sexe==='F'?20:0)+(cat==='toutes'?-1:CATS[sexe].findIndex(x=>x[0]===cat));
function mvEffectifEtat(av,trie){
  const [,on0,sx0,cat0,vue0,col0,s0]=av.cle.split('|'),[,on1,,,vue1,col1,s1]=MV.cle.split('|');
  if(on0!==on1){mvOnglet(on1==='infirmerie'?1:-1);return;}
  if(vue0!==vue1){mvArrive(document.querySelector('.eff-t thead'),{duration:200});mvLignes(0,{duree:220,pas:8});return;}
  if(col0!==col1||s0!==s1){if(!trie)mvArrive(document.querySelector('.eff-t'),{y:8,duration:220});return;}
  const d=mvRangCat(S.eff.sexe,S.eff.cat)>=mvRangCat(sx0,cat0)?1:-1;
  mvArrive(document.querySelector('.eff-t thead'),{duration:180});mvLignes(d*30,{duree:240,pas:13});
}

/* ---- Les autres écrans de gestion : leur entrée validée, plus rapide quand on les revoit ---- */
function mvEntreeCommune(premier){
  const c=$('#corps'),css=c.getAnimations({subtree:true}).filter(a=>a.animationName&&a.effect.getComputedTiming().iterations!==Infinity);
  if(css.length>=3){if(!premier)css.forEach(a=>a.updatePlaybackRate(1.6));return;}
  const k=premier?1:.65;
  mvTous('.pan',c).forEach((e,i)=>mvArrive(e,{y:16,duration:360*k,delay:40+i*50*k}));
  mvTous('.af-r,.ligne',c).slice(0,MV_LIGNES_VISIBLES).forEach((e,i)=>mvArrive(e,{x:-12,duration:260*k,delay:(110+i*18)*k}));
}

/* ---- Ce qui a changé depuis le dernier rendu ---- */
const mvCle=()=>S.ecran==='effectif'?[S.ecran,S.eff.onglet,S.eff.sexe,S.eff.cat,S.eff.vue,S.tri.col,S.tri.sens].join('|'):S.ecran;
const mvBarreVisible=()=>{const b=$('#barre');return !!b&&getComputedStyle(b).display!=='none'&&b.getBoundingClientRect().right>10;};
function mvCapture(){
  const av={ecran:MV.ecran,cle:MV.cle,hist:MV.hist};
  if(!mvOk()||!MV.ecran)return av;
  if(mvBarreVisible()){const it=document.querySelector('#barre .item.cur');if(it)av.barre=it.offsetTop;}
  const o=document.querySelector('#corps .onglet.ouvert');if(o)av.onglet={t:o.textContent,c:mvCase(o)};
  av.filtres=mvFiltres();av.lignes=mvLecture();
  return av;
}
function mvChangements(av){
  const o=document.querySelector('#corps .onglet.ouvert');
  if(o&&av.onglet&&av.onglet.t!==o.textContent)mvOngletGlisse(av.onglet.c,o);
  if(av.filtres){const n=mvFiltres();for(const k in n)if(av.filtres[k]&&av.filtres[k].v!==n[k].v)mvFiltreGlisse(av.filtres[k].c,n[k].el);}
}
function mvJouerEntree(av){
  const e=S.ecran,premier=!MV.vus.has(e),sens=S.hist.length<av.hist?-1:1;
  if(!S.fiche&&mvBarreVisible())mvBarre(av.barre);
  if(MV_GESTION.has(e)){
    if(av.ecran&&!S.fiche)mvJoue($('#corps'),[{opacity:0},{opacity:1}],{duration:150,easing:'ease-out'});
    if(e==='accueil')mvAccueil(premier,sens);else if(e==='effectif')mvEffectif(premier,sens);else mvEntreeCommune(premier);
  }
  MV.vus.add(e);
}

/* ---- Branchement : autour du rendu, sans le modifier ---- */
const mvRendreBase=rendre;
rendre=function(){
  const av=mvCapture();
  mvRendreBase();
  mvStopCours();
  const e=S.ecran,ok=mvOk(),gestion=ok&&MV_GESTION.has(e),propre=ok&&MV_PROPRES.has(e),cle=mvCle(),t=performance.now();
  document.body.classList.toggle('mv-on',gestion);document.body.classList.toggle('mv-propre',propre);
  MV.ecran=e;MV.cle=cle;MV.hist=S.hist.length;
  if(!ok)return;
  /* Accueil et Effectif : l'entrée est confiée au jeu d'effets. */
  if(propre)mvTous('#corps .apparait').forEach(x=>x.classList.remove('apparait'));
  if(gestion)mvSurvol();
  if(av.ecran!==e){MV.dernier={av};MV.t=t;mvJouerEntree(av);return;}
  mvChangements(av);
  const trie=gestion&&mvTri(av);
  if(e==='effectif'&&av.cle!==cle){MV.dernier=null;mvEffectifEtat(av,trie);return;}
  /* Au chargement, plusieurs rendus se suivent : l'entrée est rejouée sur le dernier. */
  if(MV.dernier&&t-MV.t<260){MV.vus.delete(e);mvJouerEntree(Object.assign({},MV.dernier.av,{barre:undefined}));}
};
/* Les onglets de la fiche glissent comme ceux des écrans. */
const mvFicheBase=rendreFiche;
rendreFiche=function(dir){
  const ok=mvOk(),o=ok&&document.querySelector('#fiche .onglet.ouvert'),av=o?{t:o.textContent,c:mvCase(o),f:MV.fiche}:null;
  mvFicheBase(dir);MV.fiche=S.fiche;
  if(!av||av.f!==S.fiche)return;
  const n=document.querySelector('#fiche .onglet.ouvert');if(n&&n.textContent!==av.t)mvOngletGlisse(av.c,n);
};
/* ==== [FIN ANCRE] ==== */
