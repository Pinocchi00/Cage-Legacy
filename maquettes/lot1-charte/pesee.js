"use strict";
/* Maquette lot 1 — la pesée (T1, T3, T5, T10, Q17). Préfixe pe- (classes), pe / PE_ (fonctions, constantes). Chargé en dernier.
   Retour du 22/11 : plus d'écran « semaine du combat ». Il reste la pesée, la veille de la soirée :
     - les préliminaires ensemble sur un écran, adversaires côte à côte ;
     - puis la carte principale, un duel à la fois, dans l'ordre de la soirée, le combat principal en dernier ;
     - une jauge qui monte jusqu'au poids de chacun, face à la limite de la catégorie ;
     - une phrase pour le face-à-face. Sur un poids manqué, c'est l'adversaire qui accepte ou refuse le combat : le joueur ne décide pas.
   Date : celle du Calendrier (pesée le 15 février). « Les soirées le mardi » reste un point ouvert.
   Garde-fou de la 63 : l'écran LIT la carte complète (celle de Résultats et Soirée) et n'écrit jamais dans RS_63 ni dans les Finances.
   Si l'adversaire refuse (état montré par l'adresse), la Soirée de la maquette reste la carte fixe : le bouton le dit.
   Adresse : ?ecran=pesee&pepas=0..4 (0 préliminaires, 1 à 4 les duels) &pecas=accepte|refuse|sans &pevue=carte &pemouv=1 (montre la montée même si l'ordinateur demande moins d'animations). */

const PE_CLE='maquette-pesee-2';
const PE_ETAPES=['prelims','m3','m2','m1','m0'];
const PE_DATE=(()=>{const s=caAvenir().find(x=>x.id==='63');return s&&s.pesee?s.pesee:new Date(2027,1,15);})();

/* La carte que jouent Résultats et Soirée (mêmes places que soiree.js), copiée : S.af n'est modifié que le temps de la Soirée. */
const PE_BASE=(()=>{
  const m=S.af.m.map(f=>({...f}));Object.assign(m[2],{b:'bello'});Object.assign(m[3],{a:'labbe',b:'darras'});
  return {m,p:S.af.p.map(f=>({...f}))};
})();
/** Lue à chaque fois : un changement fait dans l'écran Carte se retrouve ici, comme dans la Soirée. */
function peCarte(){
  const pl=(f,b)=>f.a&&f.b?{...f}:{...b};
  const c={m:S.af.m.map((f,i)=>i===2?{a:f.a||PE_BASE.m[2].a,b:'bello'}:i===3?{a:'labbe',b:'darras'}:pl(f,PE_BASE.m[i])),p:S.af.p.map((f,i)=>pl(f,PE_BASE.p[i]))};
  const ids=[...c.m,...c.p].flatMap(f=>[f.a,f.b]);
  return new Set(ids).size===ids.length?c:{m:PE_BASE.m.map(f=>({...f})),p:PE_BASE.p.map(f=>({...f}))}; /* un combattant déplacé : la carte fixe, jamais un doublon */
}
const peFight=k=>peCarte()[k[0]][+k.slice(1)];
const peMeme=k=>{const f=peFight(k),b=PE_BASE[k[0]][+k.slice(1)];return f.a===b.a&&f.b===b.b;};
const peN=id=>`<span class="nom" data-fiche="${id}">${esc(parId(id).nom)}</span>`;
const peKg=v=>v.toFixed(1).replace('.',',');
const peLim=v=>peKg(v).replace(',0','');
/** Rangs et bilans d'avant le combat, même si la pesée est relue après la soirée. */
const peAv=c=>S.rs.apres&&c._rsAvant?{...c,...c._rsAvant}:c;

/* Le poids de chacun : inventé, à relire, sous la limite de sa catégorie (sauf Darras dans le cas du poids manqué). */
const PE_POIDS={nana:69.9,mezouar:70,rachidi:51.9,meziane:52,belkacem:70,bello:69.8,labbe:70,darras:70,musaev:56.9,gpoidsmouche9:57,gpoidscoqf3:60.8,gpoidscoqf6:61,
  gpoidsmimoyen6:76.7,gpoidsmimoyen8:77,gpoidspaillef4:52,gpoidspaillef6:51.8,vanbelle:69.7,carvalho:70,gpoidslourd10:109.4,gpoidslourd13:113.6};
/* Une phrase pour le face-à-face de chaque combat de la carte principale. À relire. */
const PE_FACE={
  m3:'Labbé reste les bras croisés. Darras lui parle, il ne répond pas.',
  m2:'Deux gardes hautes pour la photo, puis une poignée de main.',
  m1:'Regards fixes, pas un mot. Meziane détourne les yeux la première.',
  m0:'Quinze secondes sans un geste. Mezouar sourit, Nana ne bouge pas.'
};
const PE_FACE_RATE='Darras tend la main, Labbé ne la prend pas.';

/* ---- L'état de l'écran ---- */
S.pe={cas:'accepte',vue:0,max:0,carte:false,monte:null,vu:false,anim:true,demo:false,af0:null,date0:null,viaSoiree:false,carte63:null,force:false};
try{const g=JSON.parse(localStorage.getItem(PE_CLE))||{},F=S.pe;
  if(['accepte','refuse','sans'].includes(g.cas))F.cas=g.cas;
  if(Number.isInteger(g.max)&&g.max>=0&&g.max<=4)F.max=g.max;
  if(Number.isInteger(g.vue)&&g.vue>=0&&g.vue<=F.max)F.vue=g.vue;
  F.vu=F.max>0;
}catch(e){}
function peGarder(){if(S.pe.demo)return;try{const {cas,vue,max}=S.pe;localStorage.setItem(PE_CLE,JSON.stringify({cas,vue,max}));}catch(e){}}
/* Retour et Avant suivent ce qu'on regarde. */
const peEtat=()=>{const {vue,carte}=S.pe;return JSON.stringify({vue,carte});};
const peRestaurer=j=>{const F=S.pe;Object.assign(F,JSON.parse(j),{anim:true,monte:null});F.vue=Math.min(F.vue,F.max);};
function pePas(maj){S.hist.push({pe:peEtat()});S.futur=[];maj();S.pe.anim=true;rendre();}

const peRate=()=>S.pe.cas!=='sans';
const pePoids=id=>peRate()&&id==='darras'?71.2:(PE_POIDS[id]??parId(id).kg);
const peRetire=()=>S.pe.cas==='refuse';
/** Tout nom cité ouvre sa fiche. */
function peNoms(t){
  const c=peCarte(),par=new Map([...c.m,...c.p].flatMap(f=>[f.a,f.b]).filter(id=>parId(id)).map(id=>[esc(parId(id).nom),id]));
  const re=new RegExp(`(?<!\\p{L})(${[...par.keys()].sort((x,y)=>y.length-x.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})(?!\\p{L})`,'gu');
  return esc(t).replace(re,n=>`<span class="nom" data-fiche="${par.get(n)}">${n}</span>`);
}

/* ---- Sur un poids manqué, l'adversaire décide. Les chiffres : les bourses des contrats (fiBourse), 20 % comme dans le jeu ---- */
function peReponse(){
  const X=parId('darras'),Y=parId('labbe'),bx=fiBourse(X),by=fiBourse(Y),pen=Math.ceil(bx*.2),fixe=Math.round(by/2);
  const eu=n=>`${nb(n)} €`,moins=n=>`− ${nb(n)} €`,plus=n=>`+ ${nb(n)} €`,nx=peN('darras'),ny=peN('labbe');
  return peRetire()
    ?{ok:false,t:'Labbé refuse le combat',p:'Le combat est annulé. Darras ne touche rien, Labbé reçoit sa part fixe.',dit:'Je me suis préparé pour 70 kg, pas pour 71. Je ne monte pas.',l:[[nx,moins(bx),'neg'],[ny,eu(fixe),''],['Versé sans combat',moins(fixe),'neg'],['La carte','9 combats','neg']]}
    :{ok:true,t:'Labbé accepte le combat',p:'Poids convenu. Darras lui verse 20 % de sa bourse.',dit:'Je veux combattre. S’il paie sa part, je monte dans la cage.',l:[[nx,moins(pen),'neg'],[ny,plus(pen),'pos'],['Versé sans combat','0 €',''],['La carte','10 combats','']]};
}

/* ---- Les pièces ---- */
function peEchelle(f){
  /* Même règle pour toutes les catégories : la jauge part de 85 % de la limite, sinon un poids lourd léger paraît presque vide. */
  const wa=pePoids(f.a),wb=pePoids(f.b),lim=parId(f.a).kg,min=Math.floor(lim*.85),max=Math.max(wa,wb,lim)+(lim-min)*.14;
  return {lim,min,l:((lim-min)/(max-min)).toFixed(4),pc:v=>((v-min)/(max-min)).toFixed(4)};
}
const peJauge=(id,e)=>{const w=pePoids(id);return `<div class="pe-j oct pose ${w<=parId(id).kg?'ok':'trop'}" role="img" aria-label="${esc(parId(id).nom)} : ${peKg(w)} kg, limite ${peLim(parId(id).kg)} kg" data-pe="${id}" data-kg="${w}" data-bas="${e.min}"><i class="pe-jf" style="--p:${e.pc(w)}"></i></div>`;};
const peVerdict=id=>{const w=pePoids(id),lim=parId(id).kg;
  return w<=lim?`<span class="pe-v ok pose" data-pe="${id}">${ico('ok',22,3)}Dans le poids</span>`:`<span class="pe-v trop pose" data-pe="${id}"><i>!</i>${peKg(w-lim)} kg de trop</span>`;};
const peValeur=id=>`<span class="pe-val"><b class="T pe-kg pose" data-pe="${id}">${peKg(pePoids(id))}</b><span class="T">kg</span></span>`;
function peOnglets(){
  const F=S.pe,c=peCarte();
  return `<div class="pe-tabs">${PE_ETAPES.map((k,i)=>{const f=i?c.m[+k[1]]:null,lab=i?`${parId(f.a).nom} – ${parId(f.b).nom}`:'Préliminaires',cur=i===F.vue&&!F.carte;
    return `<button class="onglet oct ${cur?'ouvert':''}" data-pev="${i}" ${i>F.max?'disabled':''} ${cur?'aria-current="step"':''}>${esc(lab)}</button>`;}).join('')}<span class="relire" title="Poids inventés">à relire</span></div>`;
}
function pePrelims(){
  const carte=(f,i)=>{const A=peAv(parId(f.a)),B=peAv(parId(f.b)),e=peEchelle(f);
    const co=(c,cl)=>`<div class="pe-co ${cl}"><span class="pe-no T">${peN(c.id)}</span><span class="pe-bi">${bilan(c)}</span>${peValeur(c.id)}${peVerdict(c.id)}</div>`;
    return pan(`<div class="pe-ph"><span class="etiq">Préliminaire ${i+1} · ${esc(A.cat)}</span><span class="pe-phl"><i></i>Limite ${peLim(e.lim)} kg</span></div>
      <div class="pe-pb">${co(A,'g')}<div class="pe-jg" style="--l:${e.l}">${peJauge(f.a,e)}${peJauge(f.b,e)}<i class="pe-ln"></i><span class="pe-b0">${e.min} kg</span></div>${co(B,'d')}</div>`,'height:100%','pe-pan');};
  return `<div class="pe-pre">${peCarte().p.map(carte).join('')}</div>`;
}
function peBas(k,f){
  const rate=peRate()&&k==='m3',A=parId(f.a),B=parId(f.b),texte=rate?PE_FACE_RATE:peMeme(k)?PE_FACE[k]:`${A.nom} et ${B.nom} restent face à face, sans un mot.`;
  const face=rate&&peRetire()?'':`<div class="pe-face"><span class="etiq">Face-à-face</span><p>${peNoms(texte)}</p><span class="relire">à relire</span></div>`;
  if(!rate)return pan(face,'','pe-pan pe-phrase');
  const r=peReponse();
  return pan(`<div class="pe-rep"><div class="pe-rt"><b class="T"><span class="${r.ok?'pos':'neg'}">${r.ok?ico('ok',30,3):'<i>!</i>'}</span><span>${peNoms(r.t)}</span></b><p>${peNoms(r.p)}</p><p class="pe-dit">« ${peNoms(r.dit)} » <span class="relire">à relire</span></p></div>
    <div class="pe-cells">${r.l.map(([l,v,cl])=>`<div class="oct"><span class="etiq">${l}</span><b class="T ${cl}">${v}</b></div>`).join('')}</div></div>${face}`,'','pe-pan pe-phrase pe-bande');
}
function peDuel(k){
  const f=peFight(k),A=peAv(parId(f.a)),B=peAv(parId(f.b)),e=peEchelle(f),or=afTitre(f);
  const co=(c,cl)=>{const n=Math.round(Math.min(112,500/(c.nom.length*.44)));
    return `<div class="pe-co ${cl}"><span class="pe-pr">${esc(c.prenom)}${c.surnom?` <i>« ${esc(c.surnom)} »</i>`:''}</span><span class="pe-no T" style="font-size:${n}px">${peN(c.id)}</span>
      <span class="pe-bi">${bilan(c)} · ${c.rang==='C'?'champion':'n° '+c.rang}</span>${peValeur(c.id)}${peVerdict(c.id)}</div>`;};
  return `<div class="pe-du"><div class="pe-fo oct ${or?'or':''}"><div class="pe-sc oct"><i class="pe-tun"></i>
      <span class="pe-role">${esc(afRole(k))} · ${esc(A.cat)} · ${afRounds(k,f)} rounds${or?' · ceinture en jeu':''}</span>
      ${co(A,'g')}<div class="pe-jg" style="--l:${e.l}">${peJauge(f.a,e)}<b class="T octr pe-vs">VS</b>${peJauge(f.b,e)}<i class="pe-ln"></i><span class="pe-lim">Limite ${peLim(e.lim)} kg</span><span class="pe-b0">${e.min} kg</span></div>${co(B,'d')}
    </div></div>${peBas(k,f)}</div>`;
}
function peVueCarte(){
  const c=peCarte(),ligne=k=>{const f=c[k[0]][+k.slice(1)],h=peRetire()&&k==='m3';
    return `<div class="pe-c ${h?'hors':''}"><span class="pe-cn">${peN(f.a)}<i>contre</i>${peN(f.b)}</span>${h?'<b class="neg">Annulé</b>':`<span class="pe-cr">${afRounds(k,f)} rounds</span>`}</div>`;};
  return pan(`${titre('La carte de la soirée','<button class="pe-lien" data-pecarte>Revenir ›</button>')}<div class="pe-ca"><div><span class="etiq">Carte principale</span>${c.m.map((_,i)=>ligne('m'+i)).join('')}</div><div><span class="etiq">Préliminaires</span>${c.p.map((_,i)=>ligne('p'+i)).join('')}</div></div>`,'height:100%','pe-pan');
}
const peHtml=()=>{const F=S.pe;return `<div class="pe ${F.force?'pe-force':''} ${F.anim?'pe-anime':''} ${F.monte===F.vue&&!F.carte?'pe-monte':''}">${peOnglets()}<div class="pe-zone">${F.carte?peVueCarte():F.vue===0?pePrelims():peDuel(PE_ETAPES[F.vue])}</div></div>`;};
function peEtiquette(){
  const F=S.pe;
  if(S.rs.apres)return 'Le lendemain';
  if(F.carte)return 'Continuer';
  return F.vue===0?'Carte principale':F.vue<4?'Combat suivant':'La soirée';
}

/* ---- Les deux jauges partent de 0 ensemble et arrivent ensemble, le chiffre suit. Rien en mouvement réduit. ----
   La barre est animée par le navigateur (transform, hors du fil principal) ; le chiffre lit le temps de cette même animation. */
const PE_DUREE=1000;
let PE_RAF=0,PE_MONTE=false;
function peMonter(){
  const F=S.pe,z=$('.pe-zone'),go=F.monte!==null&&F.monte===F.vue&&!F.carte&&!!z;
  F.monte=null;
  if(!go||(!F.force&&matchMedia('(prefers-reduced-motion:reduce)').matches))return;
  /* On lit toutes les largeurs d'abord, on écrit ensuite : le chiffre garde sa place pendant qu'il défile. */
  const pistes=[...z.querySelectorAll('.pe-j')].map(j=>{const id=j.dataset.pe,kg=z.querySelector(`.pe-kg[data-pe="${id}"]`),f=j.querySelector('.pe-jf');
    return {el:[...z.querySelectorAll(`[data-pe="${id}"]`)],f,kg,fin:+j.dataset.kg,p:+f.style.getPropertyValue('--p'),l:kg.offsetWidth+1,txt:''};});
  for(const x of pistes){
    x.el.forEach(y=>y.classList.remove('pose'));
    x.kg.style.width=x.l+'px';x.kg.textContent=peKg(0);
    x.a=x.f.animate([{transform:'scaleY(0)'},{transform:`scaleY(${x.p})`}],{duration:PE_DUREE,easing:'cubic-bezier(.33,1,.68,1)'});
  }
  /* En mouvement réduit forcé, les fondus CSS sont coupés : la réponse et le repère du bas attendent l'arrivée. */
  const caches=F.force?[...z.querySelectorAll('.pe-bande,.pe-b0')]:[];caches.forEach(x=>{x.style.visibility='hidden';});
  PE_MONTE=true;
  const pas=()=>{
    const t=pistes[0].a.currentTime,k=t===null?1:Math.min(1,t/PE_DUREE),e=1-Math.pow(1-k,3);
    for(const x of pistes){const v=peKg(x.fin*e);if(v!==x.txt){x.txt=v;x.kg.textContent=v;}}
    if(k<1){PE_RAF=requestAnimationFrame(pas);return;}
    PE_MONTE=false;caches.forEach(x=>{x.style.visibility='';});
    for(const x of pistes){x.kg.textContent=peKg(x.fin);x.kg.style.width='';x.el.forEach(y=>y.classList.add('pose'));}
  };
  PE_RAF=requestAnimationFrame(pas);
}

/* ---- Branchement dans le cadre ---- */
function pePoseCarte(){
  const F=S.pe;if(F.af0||S.rs.apres)return;
  const ca=peCarte(),txt=JSON.stringify(ca);
  F.af0=JSON.stringify({m:S.af.m,p:S.af.p});F.date0=+S.date;
  if(F.carte63!==txt){SD_CARTE=null;SD_F=null;F.carte63=txt;}
  ca.m.forEach((f,i)=>Object.assign(S.af.m[i],f));ca.p.forEach((f,i)=>Object.assign(S.af.p[i],f));
}
function peRevient(){
  const F=S.pe;if(!F.af0)return;
  if(!S.rs.apres){const a=JSON.parse(F.af0);a.m.forEach((f,i)=>Object.assign(S.af.m[i],f));a.p.forEach((f,i)=>Object.assign(S.af.p[i],f));S.date=new Date(F.date0);}
  F.af0=null;F.date0=null;
}
function peLienCalendrier(){
  const p=S.ecran==='calendrier'&&$('.ca-prog');if(!p||p.dataset.pe||!/Pesée/.test(p.textContent))return;
  p.dataset.pe='1';const h=p.previousElementSibling;if(!h)return;
  h.insertAdjacentHTML('beforeend','<button class="pe-lien pe-lcal" data-peouvrir>Voir la pesée ›</button>');
}
const peRendreBase=rendre;
rendre=function(){
  cancelAnimationFrame(PE_RAF);PE_MONTE=false;
  if(S.ecran==='soiree'){if(S.pe.viaSoiree)pePoseCarte();}else peRevient();
  if(S.ecran!=='pesee'){peRendreBase();peLienCalendrier();return;}
  if(typeof SD_ANIM!=='undefined')cancelAnimationFrame(SD_ANIM.raf);
  document.body.classList.remove('sd-mode','pp-mode');
  rendreBarre();const acc=$('#barre [data-go="accueil"]');if(acc)acc.classList.add('cur');
  $('#barre [data-go="carte"]')?.querySelectorAll('.mq').forEach(x=>x.remove()); /* le jour de la pesée, la carte est complète */
  rendreEntete('La pesée');
  const d=$('#dateH');if(d)d.textContent=`${PE_DATE.getDate()} ${MOIS[PE_DATE.getMonth()]} ${PE_DATE.getFullYear()}`;
  const b=$('#bContinuer');if(b)b.innerHTML=`${esc(peEtiquette())} ${ico('avant',30,3)}`;
  const a=$('#alerte');a.className='alerte-l';a.innerHTML='';
  $('#corps').style.top='108px';$('#corps').innerHTML=peHtml();
  peMonter();S.pe.anim=false;peGarder();
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const peAllerBase=aller;
aller=function(ec){
  /* Depuis la pesée, « Carte » montre la carte complète ici : l'écran Carte reste au 12 janvier, avec ses places libres. */
  if(ec==='carte'&&S.ecran==='pesee'&&!S.rs.apres){if(S.fiche)fermerFiche();if(!S.pe.carte)pePas(()=>{S.pe.carte=true;});return;}
  if(ec!=='pesee'){peAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  S.rs.det=null;S.rc.nego=null; /* comme la sortie des Résultats et du Recrutement */
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.pe.anim=true;if(!S.pe.vu){S.pe.vu=true;S.pe.monte=S.pe.vue;}}
  S.ecran=ec;rendre();
};
const peOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='pesee'){peOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* La fiche ouverte depuis la pesée voit la carte complète, le temps de se dessiner : rien n'est gardé dans S.af ni dans l'effectif. */
const peFicheBase=rendreFiche;
rendreFiche=function(dir=0){
  if(S.ecran!=='pesee'||S.rs.apres){peFicheBase(dir);return;}
  const ca=peCarte(),hors=peRetire()?['labbe','darras']:[];
  const av=JSON.stringify({m:S.af.m,p:S.af.p}),d0=S.date,ids=[...ca.m,...ca.p].flatMap(f=>[f.a,f.b]).filter(id=>!hors.includes(id)),st=ids.map(id=>parId(id).statut);
  const poser=x=>{x.m.forEach((f,i)=>Object.assign(S.af.m[i],f));x.p.forEach((f,i)=>Object.assign(S.af.p[i],f));};
  poser(ca);ids.forEach(id=>{parId(id).statut='affiche';});S.date=PE_DATE;
  try{peFicheBase(dir);}finally{S.date=d0;poser(JSON.parse(av));ids.forEach((id,i)=>{parId(id).statut=st[i];});}
};
const peRetourBase=retour;
retour=function(){
  while(S.ecran!=='pesee'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].pe)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='pesee'&&!S.fiche&&h&&h.pe){S.hist.pop();S.futur.push({pe:peEtat()});peRestaurer(h.pe);rendre();return;}
  peRetourBase();
};
function peAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='pesee'&&!S.fiche&&f&&f.pe){S.futur.pop();S.hist.push({pe:peEtat()});peRestaurer(f.pe);rendre();return true;}
  return false;
}

/* ---- Continuer : le duel suivant, puis la Soirée ---- */
function peContinuer(){
  const F=S.pe;
  if(S.rs.apres){sdLendemain();return;}
  if(F.carte){pePas(()=>{F.carte=false;});return;}
  if(PE_MONTE&&peRate()&&PE_ETAPES[F.vue]==='m3'){F.anim=false;rendre();return;} /* le premier clic montre le verdict et la réponse */
  if(F.vue<4){const n=F.vue+1,neuf=n>F.max;pePas(()=>{F.vue=n;if(neuf){F.max=n;F.monte=n;}});return;}
  if(peRetire()){toast('La Soirée de la maquette joue la carte fixe de la 63 : ce cas s’arrête ici.');return;}
  F.viaSoiree=true;pePoseCarte();
  S.sd.etat='direct';S.sd.n=0;S.sd.k=null;S.sd.anim=true;aller('soiree');
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target,stop=()=>e.stopImmediatePropagation();let el;
  if(S.ecran==='calendrier'&&t.closest('[data-peouvrir]')){stop();aller('pesee');return;}
  if(S.ecran!=='pesee')return;
  const F=S.pe;
  if(t.closest('#bAvant')&&!S.fiche&&peAvancer()){stop();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.pe){stop();retour();return;}}
  if(t.closest('#bContinuer')){stop();if(S.fiche)fermerFiche();peContinuer();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  if((el=t.closest('[data-pev]'))){stop();const i=+el.dataset.pev;if(i!==F.vue||F.carte)pePas(()=>{F.vue=i;F.carte=false;});return;}
  if(t.closest('[data-pecarte]')){stop();pePas(()=>{F.carte=!F.carte;});return;}
},true);
document.addEventListener('keydown',e=>{
  if(S.ecran!=='pesee'||S.fiche)return;
  const F=S.pe;
  if(e.key==='Escape'&&F.carte){e.stopImmediatePropagation();e.preventDefault();pePas(()=>{F.carte=false;});return;}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    const i=Math.max(0,Math.min(F.max,F.vue+(e.key==='ArrowLeft'?-1:1)));e.stopImmediatePropagation();if(i!==F.vue)pePas(()=>{F.vue=i;F.carte=false;});}
},true);

/* ---- Lancement ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='pesee')return;
  const F=S.pe,g=k=>q.get(k);
  if(['pepas','pecas','pevue'].some(k=>q.has(k)))Object.assign(F,{demo:true,cas:'accepte',vue:0,max:0});
  if(['accepte','refuse','sans'].includes(g('pecas')))F.cas=g('pecas');
  if(/^[0-4]$/.test(g('pepas')||'')){F.vue=+g('pepas');F.max=F.vue;}
  if(g('pevue')==='carte')F.carte=true;
  F.force=g('pemouv')==='1';F.vu=true;F.monte=F.vue;
  S.ecran='pesee';S.hist=['accueil'];F.anim=true;rendre();
});
