"use strict";
/* ==== [ANCRE: MAQUETTE_BARRE] — La barre latérale regroupée (T4, Q11). Chargée juste avant mouvement.js.
   Elle remplace seulement le dessin de la barre : les identifiants d'écran (S.ecran, data-go), l'historique
   et les adresses ne changent pas. Version retenue : les douze écrans visibles sous quatre titres.
   Dans les variantes, une ligne de groupe ouvre directement un écran et son chevron déplie le groupe
   sans quitter l'écran. La case blanche reste celle de mouvement.js.
   Adresses : &brbarre=ouverte|repliee, &brvar=titres|groupes|r11|jeu (la version retenue, deux variantes,
   la barre d'avant), &brgroupe=soirees|monde|direction|aucun pour les variantes à groupes. ==== */
Object.assign(P,{
  soirees:'<path d="M3 7h18v3.2a1.8 1.8 0 000 3.6V17H3v-3.2a1.8 1.8 0 000-3.6z"/><path d="M15 7v2M15 11v2M15 15v2"/>',
  monde:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z"/>',
  direction:'<path d="M3 8h18v12H3z"/><path d="M8.5 8V4.5h7V8M3 13h18M12 12v2.5"/>',
});
const BR_CLE='maquette-barre-1';
const BR_SOIREES={id:'soirees',nom:'Soirées',ic:'soirees',relire:true,ecrans:['carte','calendrier','resultats']};
const BR_MONDE={id:'monde',nom:'Le monde',ic:'monde',relire:true,ecrans:['classements','camps','presse']};
const BR_DIRECTION={id:'direction',nom:'Direction',ic:'direction',relire:true,ecrans:['finances','organisation']};
const BR_VARIANTES={
  groupes:['accueil','messages',BR_SOIREES,'effectif','contrats',BR_MONDE,BR_DIRECTION],
  titres:['accueil','messages',{titre:'Soirées',ecrans:BR_SOIREES.ecrans},{titre:'Combattants',ecrans:['effectif','contrats']},{titre:'Le monde',ecrans:BR_MONDE.ecrans},{titre:'Direction',ecrans:BR_DIRECTION.ecrans}],
  r11:['accueil','messages','carte','effectif','contrats','classements',{id:'agenda',nom:'Agenda',ic:'calendrier',relire:true,ecrans:['calendrier','resultats']},{id:'pressecamps',nom:'Presse, camps',ic:'presse',relire:true,ecrans:['presse','camps']},BR_DIRECTION],
};
/* Les écrans sans ligne propre éclairent celle d'où on les ouvre, comme avant. */
const BR_ALIAS={recruteur:'contrats',rapports:'contrats',presentation:'carte',pesee:'accueil'};
const BR_BAS=[['options','Options'],['menu','Menu principal']];
const brQ=new URLSearchParams(location.search);
const brVarQ=brQ.get('brvar');
const brVar=brVarQ==='jeu'||(brVarQ&&Object.hasOwn(BR_VARIANTES,brVarQ))?brVarQ:'titres';
const BR={ouvert:null,dernier:null,avant:null,pret:false};
window.addEventListener('load',()=>{BR.pret=true;});
window.addEventListener('click',()=>{BR.pret=true;},true);
const brLire=()=>{try{const v=JSON.parse(localStorage.getItem(BR_CLE));return v&&typeof v==='object'?v:{};}catch(e){return {};}};
/* Chaque geste n'écrit que ce qu'il change : un repli venu de l'adresse n'est pas enregistré par une navigation. */
const brSauver=m=>{try{localStorage.setItem(BR_CLE,JSON.stringify(Object.assign(brLire(),m)));}catch(e){}};
const brGroupes=()=>(BR_VARIANTES[brVar]||[]).filter(x=>x&&x.id);
const brCourant=()=>BR_ALIAS[S.ecran]||S.ecran;
const brLibelle=id=>(ITEMS.find(x=>x[0]===id)||BR_BAS.find(x=>x[0]===id)||[id,id])[1];
/* Le jour de la pesée, la carte est complète : ni sa ligne ni son groupe ne restent marqués. */
const brAFaire=id=>{const x=ITEMS.find(i=>i[0]===id);return !!(x&&x[2])&&!(S.ecran==='pesee'&&id==='carte');};
const BR_MQ_IC='<span class="mq octr"></span>';

function brLigne(id,cls=''){
  const l=brLibelle(id),cur=brCourant()===id,mq=brAFaire(id);
  return `<button class="item ${cls} ${cur?'cur':''}" data-go="${id}" title="${esc(l)}"${cur?' aria-current="page"':''}><span class="ic">${ico(id,30)}${mq?BR_MQ_IC:''}</span><span class="lib">${esc(l)}</span>${mq?BR_MQ_IC:''}</button>`;
}
function brGroupe(g){
  const ouvert=BR.ouvert===g.id,dedans=g.ecrans.includes(brCourant()),mq=g.ecrans.some(brAFaire),noms=g.ecrans.map(brLibelle);
  const action=`${ouvert?'Replier':'Déplier'} ${g.nom}`;
  return `<button class="item br-g ${ouvert?'br-ouvert':''} ${dedans&&!ouvert?'cur':''}" data-brg="${g.id}" title="${esc(g.nom)} : ${esc(noms.join(', '))}"${dedans&&!ouvert?' aria-current="true"':''}>
      <span class="ic">${ico(g.ic,30)}${mq?BR_MQ_IC:''}</span>
      <span class="lib"><span class="br-nom">${esc(g.nom)}${g.relire?'<i class="br-relire">à relire</i>':''}</span>${ouvert?'':`<span class="br-sous">${esc(noms.join(' · '))}</span>`}</span>
      ${mq?BR_MQ_IC:''}<span class="br-fl" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square"><path d="${ouvert?'M5 15l7-7 7 7':'M5 9l7 7 7-7'}"/></svg></span></button>
    <button class="br-zone" data-brz="${g.id}" aria-expanded="${ouvert}" aria-label="${esc(action)}" title="${esc(action)}"></button>${ouvert?g.ecrans.map(e=>brLigne(e,'br-e')).join(''):''}`;
}
const brEntree=x=>typeof x==='string'?brLigne(x):x.titre?`<div class="br-titre">${esc(x.titre)}<i class="br-relire">à relire</i></div>${x.ecrans.map(e=>brLigne(e)).join('')}`:brGroupe(x);

/** À l'arrivée sur un écran, son groupe s'ouvre et les autres se ferment. Déplier à la main ne change pas d'écran. */
function brSuivre(){
  const c=brCourant();if(BR.dernier===c)return;
  /* Au chargement, plusieurs écrans se rendent à la suite : l'adresse et la mémoire valent jusqu'au premier clic. */
  const g=brGroupes().find(x=>x.ecrans.includes(c));BR.dernier=c;
  if(BR.pret){BR.ouvert=g?g.id:null;brSauver({groupe:BR.ouvert});return;}
  const p=brQ.get('brgroupe'),connu=id=>brGroupes().some(x=>x.id===id);
  BR.ouvert=p==='aucun'?null:connu(p)?p:g?g.id:connu(brLire().groupe)?brLire().groupe:null;
}
const brHauts=()=>{const m=new Map();document.querySelectorAll('#barre .item:not(.mv-copie)').forEach(e=>{const k=e.dataset.go||e.dataset.brg;if(k)m.set(k,e.offsetTop);});return m;};
/** Les lignes glissent à leur nouvelle place avec les pièces de mouvement.js. */
function brGlisser(av){
  if(!BR.pret||typeof mvOk!=='function'||!mvOk()||!mvBarreVisible()||!av.size)return;
  /* Les copies en noir de la case blanche font le même trajet que leur ligne. */
  const lignes=[...document.querySelectorAll('#barre .item:not(.mv-copie)')],copies=[...document.querySelectorAll('#barre .mv-copie')];
  const joue=(i,images,o)=>{mvJoue(lignes[i],images,o);if(copies.length===lignes.length)mvJoue(copies[i],images,o);};
  lignes.forEach((e,i)=>{
    const k=e.dataset.go||e.dataset.brg;if(!k)return;
    if(!av.has(k)){joue(i,[{opacity:0,transform:'translateY(-14px)'},{opacity:1,transform:'none'}],{duration:240});return;}
    const d=av.get(k)-e.offsetTop;if(d)joue(i,[{transform:`translateY(${d}px)`},{transform:'none'}],{duration:260});
  });
}
/** L'élément de la barre qui a le focus, pour le lui rendre après un nouveau rendu. */
function brCibleFocus(b){
  const f=document.activeElement;if(!f||!b.contains(f))return '';
  if(f.id==='bRepli')return '#bRepli';
  const d=f.dataset;return d.brz?`[data-brz="${d.brz}"]`:d.brg?`[data-brg="${d.brg}"]`:d.go?`.item[data-go="${d.go}"]`:'';
}
const brBarreBase=rendreBarre;
rendreBarre=function(){
  const b=$('#barre');b.classList.toggle('br-on',brVar!=='jeu');
  if(brVar==='jeu'){brBarreBase();return;}
  if(!BR.avant){BR.avant=brHauts();queueMicrotask(()=>{const av=BR.avant;BR.avant=null;brGlisser(av);});}
  brSuivre();
  const seul=S.ecran==='options'&&S.op&&S.op.sansPartie,replie=document.body.classList.contains('repliee'),focus=brCibleFocus(b);
  b.innerHTML=`<div class="barre-logo">${LOGO}<div class="logo-mots"><b>CAGE</b><i>LEGACY</i></div>
    <button id="bRepli" class="repli-btn" title="${replie?'Ouvrir la barre':'Réduire la barre'}" aria-label="${replie?'Ouvrir la barre':'Réduire la barre'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/></svg></button></div>
    ${seul?'':BR_VARIANTES[brVar].map(brEntree).join('')}<div class="barre-bas">${BR_BAS.map(([id])=>brLigne(id)).join('')}</div>`;
  if(focus){const n=b.querySelector(focus);if(n)n.focus({preventScroll:true});}
};
/** Déplier ou replier sans changer d'écran ; la case blanche suit si l'écran courant est dans le groupe. */
function brBascule(id){
  const c=document.querySelector('#barre .item.cur'),y0=c?c.offsetTop:undefined;
  BR.ouvert=BR.ouvert===id?null:id;brSauver({groupe:BR.ouvert});rendreBarre();
  if(typeof mvOk==='function'&&mvOk()&&mvBarreVisible())mvBarre(y0);
}
function brClicGroupe(id){
  const g=brGroupes().find(x=>x.id===id);if(!g)return;
  if(!S.fiche&&g.ecrans.includes(brCourant())&&(BR.ouvert!==id||S.ecran===g.ecrans[0])){brBascule(id);return;}
  aller(g.ecrans[0]);
}
(function(){
  if(brVar==='jeu')return;
  const v=brQ.get('brbarre');
  document.body.classList.toggle('repliee',v==='repliee'||(v!=='ouverte'&&brLire().repliee===true));
})();
document.addEventListener('click',e=>{
  if(brVar==='jeu')return;
  const t=e.target;let el;
  if((el=t.closest('#bRepli'))){const r=document.body.classList.contains('repliee'),l=r?'Ouvrir la barre':'Réduire la barre';el.title=l;el.setAttribute('aria-label',l);brSauver({repliee:r});return;}
  if((el=t.closest('[data-brz]'))){brBascule(el.dataset.brz);return;}
  if((el=t.closest('[data-brg]')))brClicGroupe(el.dataset.brg);
});
/* ==== [FIN ANCRE] ==== */
