"use strict";
/* Maquette lot 1 — Ta carrière (R34, R35 ; Q34a, Q34b, Q35a, Q35b). Troisième onglet de l'écran Organisation : Poste et Carnet fusionnés.
   Préfixe mc- (classes), mc / MC_ (fonctions, constantes). Se branche sur organisation.js (ogHaut, ogHtml).
   Deux parties distinctes (R35) : toi, arrivé le 4 janvier 2027 (Messages : bienvenue de Leïla le 4, objectifs du patron le 5),
   et Split avant toi (les soirées de ton prédécesseur). Rien n'est compté comme fait si tu ne l'as pas fait.
   Objectifs du patron jugés au 31 décembre : un avertissement, puis le renvoi (Q34a). Défis par paliers de 9 (Q35a).
   « Grande salle » (Q35b) : une arène de 15 000 places ou plus, celles des grandes soirées de l'UFC. */

const MC_ARRIVEE=new Date(2027,0,4);
Object.assign(P,{
  mcCadenas:'<path d="M6 11h12v10H6z"/><path d="M8.5 11V7.5a3.5 3.5 0 017 0V11"/>',
  mcCoche:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mcCible:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  mcCarnet:'<path d="M5 3h12l2 2v16H5z"/><path d="M9 3v18M12 8h4M12 12h4"/>',
});

/** Les paliers de défis : le premier est ouvert, les suivants s'ouvrent quand le précédent est fini (Q35a). */
function mcPaliers(){
  const prev=S.preventes||0;
  const p1=[
    {t:'Une carte principale complète',v:2,but:4,det:'il manque 2 combats',go:['carte','La carte']},
    {t:'Ta première soirée',v:0,but:1,det:'16 févr., Forum de Lille'},
    {t:'Une salle pleine',v:0,but:1,det:`Lille : ${nb(prev)} places vendues sur 4 000`},
    {t:'Une finition dans ta soirée',v:0,but:1,det:'un KO ou une soumission'},
    {t:'Une prime de la soirée',v:0,but:1,det:'tu fixes son montant avant la soirée'},
    {t:'Signer un combattant',v:0,but:1,det:'',go:['contrats','Le recrutement']},
    {t:'Prolonger un contrat qui finit',v:0,but:1,det:`${lien(parId('vanbelle'))} : dernier combat`},
    {t:'Un rapport de ton recruteur',v:0,but:1,det:'',go:['recruteur','Le recruteur']},
    {t:'Un combattant qui monte au mondial',v:0,but:1,det:'après ta soirée'},
  ];
  const f=l=>l.map(t=>({t,v:0,but:1}));
  return [
    {n:1,nom:'Tes débuts',d:p1},
    {n:2,nom:'Installer Split',d:f(['5 soirées','3 salles pleines','Une ceinture défendue','Signer un combattant du top 15','10 finitions','3 primes de la soirée','300 000 € de recette en une soirée','Un espoir dans le top 15','Gagner une place au classement'])},
    {n:3,nom:'Les grandes soirées',d:f(['10 000 spectateurs','Remplir une grande salle (15 000 places ou plus)','Une soirée à l’étranger','1 M€ de recette en une soirée','2 titres dans la même soirée','Le diffuseur européen','Un combattant dans le top 5','4/8 ou mieux en fin de saison','Le combat de l’année'])},
    {n:4,nom:'Les ceintures',d:f(['Un champion n° 1 mondial','3 champions dans le top 5','5 défenses pour un champion','Couronner un combattant que tu as signé','Un règne de 2 ans','Une revanche pour le titre','Un champion venu d’ailleurs','5 ceintures défendues en une saison','2 catégories avec un top 3'])},
    {n:5,nom:'Le sommet',d:f(['1/8 en fin de saison','19 000 spectateurs','Le diffuseur mondial','10 combattants dans le top 5','3 soirées à 15 000','3 M€ de recette en une soirée','100 soirées pour Split','10 saisons au poste','5 saisons sans avertissement'])},
  ];
}
const mcFini=p=>p.d.filter(x=>x.v>=x.but).length;

/* ---- Le bandeau : ton poste ---- */
function mcBandeau(){
  const j=Math.round((S.date-MC_ARRIVEE)/864e5);
  const st=(lab,val,sous,plus='')=>`<div class="stat-b og-st"><span class="etiq">${lab}</span><span class="T og-stv">${val}</span>${plus}<span class="sous">${sous}</span></div>`;
  const rep=`<span class="mc-rep">${['En France','En Europe','Reconnu','Respecté','Une référence'].map(t=>`<i class="octr" title="${t}"></i>`).join('')}</span>`;
  return `<div class="bandeau og-band mc-band ${S.og.anim?'apparait':''}"><i class="bandeau-img"></i>
    <div class="og-bt">${ogEmb('Split',86)}<div class="og-btt"><span class="etiq">Poste</span><span class="T mc-poste">Matchmaker</span><span class="sous">chez Split depuis le 4 janv. · ${j} jours</span></div></div>
    ${st('Contrat','31 déc. 2027','1 saison · 3 200 € par mois')}
    ${st('Réputation','Pas encore établie','elle se fait soirée après soirée',rep)}
    ${st('Première soirée','16 févr.',`Forum de Lille · dans ${S.jours} jours`)}
    ${st('Patron','Il attend de voir','Gérard Vasseur · bilan le 1er juillet')}
  </div>`;
}

/* ---- Les objectifs du patron : l'intitulé, puis la place visée et la tienne sur la même ligne ---- */
function mcObj(o,i){
  const ok=o.type==='jauge'?o.v>=o.but:o.v<=o.but;
  let vis,val;
  if(o.type==='jauge'){vis=`<span class="mc-oj"><i style="--p:${Math.max(2,Math.min(1,o.v/o.but)*100)}%"></i></span>`;val=`<b class="T"><span data-ogn="${o.v}">0</span></b><span>/ ${nb(o.but)}</span>`;}
  else{const N=o.type==='rang'?8:10;vis=`<span class="mc-or">${Array.from({length:N},(_,k)=>k+1).map(n=>`<span class="octr ${n===o.v?'ici':''} ${n<=o.but?'but':''}">${n}</span>`).join('')}</span>`;
    val=o.type==='rang'?`<b class="T">${ogOrd(o.v)}</b><span>/ ${ogOrd(o.but)}</span>`:`<b class="T">n° ${o.v}</b><span>/ n° ${o.but}</span>`;}
  return `<div class="mc-o oct ${ok?'ok':''}" style="animation-delay:${150+i*90}ms"><span class="mc-ol">${esc(o.lab)}</span>
    <div class="mc-ov">${vis}<span class="mc-ova">${val}</span></div><span class="mc-od">${o.det}</span></div>`;
}
function mcObjectifs(){
  const l=ogClasse(),sp=l.find(x=>x.nom==='Split'),dev=l.filter(x=>x.rang>=4&&x.rang<sp.rang).map(x=>esc(x.court||x.nom));
  const lourd=msMeilleur(c=>!c.ext&&c.cat==='Poids lourd');
  const os=[
    {type:'rang',lab:'Finir dans le top 4',v:sp.rang,but:4,det:dev.length?`Il faut passer ${dev.join(' et ')}.`:''},
    {type:'mondial',lab:'Un poids lourd dans le top 5 mondial',v:lourd.mondial,but:5,det:`Le mieux classé : ${lien(lourd)}.`},
    {type:'jauge',lab:'Remplir le Forum de Lille',v:S.preventes,but:4000,det:'Places vendues pour le 16 févr.'},
  ];
  return pan(`${titre('Objectifs 2027','jugés le 31 déc.')}
    <div class="mc-objs">${os.map(mcObj).join('')}</div>
    <div class="mc-regle">${ico('mcCible',22,2)}<span>Manqués au 31 déc. : <b>un avertissement</b>. Manqués encore la saison suivante : <b>le renvoi</b>.</span></div>`,'','mc-col');
}

/* ---- Ton parcours, puis Split avant toi ---- */
function mcParcours(){
  const c=(lab,v)=>`<div class="mc-case"><span class="etiq">${lab}</span><b class="T"><span data-ogn="${v}">0</span></b></div>`;
  const r=(lab,v,s)=>`<div class="mc-av"><span class="etiq">${lab}</span><span class="sous">${s}</span><b class="T"><span data-ogn="${v}">0</span></b></div>`;
  const ev=[
    ['4 janv.','Arrivée chez Split, Leïla t’accueille','messages'],
    ['5 janv.','Gérard Vasseur fixe tes objectifs 2027','messages'],
    ['8 janv.','Le recruteur rentre de Turin : 4 profils','recruteur'],
    ['12 janv.','2 combats placés pour le 16 févr.','carte'],
  ];
  const pleines=RS_SOIREES.filter(s=>s.main&&s.public&&s.public[0]>=s.public[1]&&new Date(s.date).getFullYear()===2026).length;
  const n26=RS_SOIREES.filter(s=>s.main&&new Date(s.date).getFullYear()===2026).length;
  const champs=COMBATTANTS.filter(x=>!x.ext&&x.rang==='C').length;
  return `<div class="mc-col2">
    ${pan(`${titre('Ton parcours','depuis le 4 janv.')}
      <div class="mc-cases">${c('Soirées',0)}${c('Combats placés',2)}${c('Signatures',0)}</div>
      <div class="mc-fil">${ev.map((e,i)=>`<button class="mc-ev" data-go="${e[2]}" style="animation-delay:${200+i*70}ms"><span class="mc-evd">${e[0]}</span><i class="octr"></i><span class="mc-evt">${esc(e[1])}</span><span class="lecture">›</span></button>`).join('')}</div>`,'','mc-pan')}
    ${pan(`<div class="pt"><h2>Split avant toi</h2><button class="og-lien" data-go="resultats">Les soirées ›</button></div>
      <div class="mc-avs">${r('Soirées',62,'depuis 2004, sous ton prédécesseur')}${r('Champions',champs,'un par catégorie, aujourd’hui')}${r('Record',6340,'Marseille, 14 nov. 2026')}${r('Salles pleines',pleines,`en 2026, sur ${n26} soirées`)}</div>`,'','mc-pan mc-avant')}
  </div>`;
}

/* ---- Tes défis : un palier ouvert, les suivants fermés ---- */
function mcDefis(){
  const PL=mcPaliers(),ouvert=PL.findIndex(p=>mcFini(p)<p.d.length)+1||PL.length;
  const n=Math.min(Math.max(1,S.og.palier||ouvert),PL.length),p=PL[n-1],ferme=n>ouvert;
  const pl=PL.map(q=>`<button class="mc-pl octr ${q.n===n?'sel':''} ${q.n>ouvert?'ferme':q.n<ouvert?'fait':'cur'}" data-mcpal="${q.n}" title="Palier ${q.n} · ${esc(q.nom)}">${q.n>ouvert?ico('mcCadenas',18,2):q.n}</button>`).join('');
  const carte=(d,i)=>{const ok=d.v>=d.but,k=Math.max(ferme?0:3,d.v/d.but*100);
    return `<div class="mc-d oct ${ok?'ok':''} ${ferme?'ferme':''}" style="animation-delay:${120+i*45}ms">
      <div class="mc-dh"><span class="mc-dt">${esc(d.t)}</span>${ok?`<span class="mc-ok octr">${ico('mcCoche',16,3)}</span>`:ferme?`<span class="mc-cad">${ico('mcCadenas',18,2)}</span>`:''}</div>
      ${ferme?'':d.but>1?`<div class="mc-dp"><b class="T">${d.v}</b><span>/ ${d.but}</span><span class="mc-dj"><i style="--p:${k}%"></i></span></div>`:`<div class="mc-dp"><span class="mc-af ${ok?'ok':''}">${ok?'Fait':'À faire'}</span></div>`}
      ${ferme?'':`<div class="mc-dd">${d.det||''}${d.go?`<button class="og-lien" data-go="${d.go[0]}">${esc(d.go[1])} ›</button>`:''}</div>`}
    </div>`;};
  return pan(`<div class="pt"><h2>Tes défis</h2><span class="mc-pls">${pl}</span></div>
    <div class="mc-ph"><span class="T">Palier ${n} · ${esc(p.nom)}</span><span class="sous">${ferme?`s’ouvre quand le palier ${n-1} est fini`:`${mcFini(p)} sur ${p.d.length} · le palier ${n+1} s’ouvre quand celui-ci est fini`}</span></div>
    <div class="mc-ds">${p.d.map(carte).join('')}</div>`,'','mc-col mc-defis');
}

function mcHtml(){return `${mcBandeau()}<div class="mc-zone">${mcObjectifs()}${mcParcours()}${mcDefis()}</div>`;}

/* ---- Clics : le choix du palier est un pas du parcours (Retour / Avant) ---- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-mcpal]');if(!el||S.ecran!=='organisation')return;
  e.stopImmediatePropagation();const v=+el.dataset.mcpal;if(v!==S.og.palier)ogPas(()=>{S.og.palier=v;});
},true);
(()=>{const q=new URLSearchParams(location.search);if(q.get('palier'))S.og.palier=+q.get('palier');})();
