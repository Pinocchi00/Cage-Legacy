"use strict";
/* Maquette lot 1 — Organisation (R32, R33 ; Q32a, Q32b, Q33a, Q33b). L'écran « Organisation » de la barre. Préfixe og- (classes), og / OG_ (fonctions, constantes).
   Deux onglets : « Les huit » (le classement des organisations, qui bouge avec les résultats, Q32a) et « La croissance » (les pistes, Q33).
   Q32b : les quatre mesures du jeu sont gardées, chacune dite avec son unité pour se lire d'un coup d'œil :
     popularité → Spectateurs (par soirée) ; salle → Record (spectateurs) ;
     notoriété → Top 5 mondial (combattants) ; puissance → Top 30 mondial (combattants).
   Vedettes et classés sont comptés dans le classement mondial des Classements ; le public de Split vient des Résultats (4 800 en moyenne).
   Le rang additionne les places sur les quatre mesures (comme le jeu), à égalité le public départage. Poste et Carnet (R34, R35) fusionnent plus tard. */

/* ---- Réglages de l'écran : gardés au retour ---- */
const OG_CLE='maquette-organisation-2';
S.og=Object.assign({onglet:'huit',sel:null,piste:'salles',anim:true},(()=>{try{return JSON.parse(localStorage.getItem(OG_CLE))||{};}catch(e){return {};}})());
function ogGarder(){try{const {onglet,piste}=S.og;localStorage.setItem(OG_CLE,JSON.stringify({onglet,piste}));}catch(e){}}
const ogEtat=()=>JSON.stringify({onglet:S.og.onglet,sel:S.og.sel,piste:S.og.piste,palier:S.og.palier||0});

/* ---- Les huit organisations ----
   pub : spectateurs en moyenne par soirée en 2026 ; rec : sa plus grande soirée [spectateurs, ville, date] ; avant : rang au 12 décembre (le classement est revu chaque mois ; on est le 12 janvier 2027) ; der : dernière soirée [date, ville, spectateurs] ;
   bouge : la raison du changement (À RELIRE) ; diff / salles : où elle en est (le développement n'est pas le même partout, Q33b).
   Ordres de grandeur : UFC 2023, 363 518 spectateurs sur 43 soirées (≈ 8 450) et 19 000 à 20 000 au Madison Square Garden ;
   Oktagon 12 200 à Dortmund, 19 000 à Cologne ; PFL 18 000 à Riyad. Split, organisation française de second rang : 4 800. */
const OG_ORGS=[
  {nom:'Garden of Blood',der:['20 déc.','New York',16900],ville:'New York',depuis:1999,pub:12600,rec:[19400,'New York','12 sept. 2026'],avant:1,diff:'Mondial',salles:'15 000 places et plus',
   bouge:'Garde la tête : 16 900 spectateurs à New York le 20 déc.'},
  {nom:'Undisputed Cage',der:['13 déc.','São Paulo',13500],ville:'São Paulo',depuis:2005,pub:7900,rec:[13500,'São Paulo','13 déc. 2026'],avant:3,diff:'Européen',salles:'15 000 places et plus',
   bouge:'Passe devant Fighting Pacific : 13 500 spectateurs à São Paulo le 13 déc., son record.'},
  {nom:'Pure Impact',der:['3 janv.','Dubaï',4100],ville:'Dubaï',depuis:2018,pub:3400,rec:[7200,'Dubaï','21 nov. 2026'],avant:4,diff:'National',salles:'jusqu’à 10 000 places',
   bouge:'A signé en décembre 3 combattants classés venus de Fighting Pacific.'},
  {nom:'Fighting Pacific Championship',der:['18 oct.','Osaka',8700],court:'Fighting Pacific',ville:'Tokyo',depuis:1997,pub:9800,rec:[16000,'Saitama','3 mai 2026'],avant:2,diff:'Mondial',salles:'15 000 places et plus',
   bouge:'Aucune soirée depuis le 18 oct. à Osaka, et 3 combattants classés partis chez Pure Impact.'},
  {nom:'Knuckle Gate',der:['19 déc.','Manchester',6200],ville:'Manchester',depuis:2012,pub:5300,rec:[8900,'Manchester','28 févr. 2026'],avant:5,diff:'Européen',salles:'jusqu’à 10 000 places',
   bouge:'6 200 spectateurs à Manchester le 19 déc., dans sa moyenne.'},
  {nom:'Split',der:['8 déc.','Lyon',5210],ville:'Lyon',depuis:2004,pub:4800,rec:[6340,'Marseille','14 nov. 2026'],avant:7,diff:'National',salles:'jusqu’à 6 000 places',
   bouge:'5 210 spectateurs à Lyon le 8 déc. ; Ultimate Rim n’en a fait que 2 100 à Perth le 9 janv.'},
  {nom:'Ultimate Rim',der:['9 janv.','Perth',2100],ville:'Melbourne',depuis:2020,pub:3900,rec:[6100,'Melbourne','15 août 2026'],avant:6,diff:'National',salles:'jusqu’à 6 000 places',
   bouge:'2 100 spectateurs à Perth le 9 janv., sa plus faible affluence depuis 2023.'},
  {nom:'MMA Korner',der:['27 déc.','Rotterdam',3100],ville:'Rotterdam',depuis:2011,pub:2900,rec:[5000,'Rotterdam','7 juin 2026'],avant:8,diff:'Régional',salles:'jusqu’à 6 000 places',
   bouge:'3 100 spectateurs à Rotterdam le 27 déc., dans sa moyenne.'},
];
const OG_CATS=()=>[...CATS.H,...CATS.F].map(x=>x[0]);
let OG_CACHE=null;
/** Vedettes, classés et meilleurs combattants de chaque organisation, lus dans le classement mondial des Classements. */
function ogComptes(){
  if(OG_CACHE)return OG_CACHE;const o={};OG_ORGS.forEach(x=>o[x.nom]={v5:0,c30:0,l:[]});
  for(const cat of OG_CATS())clMonde(cat).forEach(c=>{const org=c.ext?c.org:'Split';if(!o[org]||c.mondial>60)return;
    if(c.mondial<=5)o[org].v5++;if(c.mondial<=30)o[org].c30++;o[org].l.push(c);});
  Object.values(o).forEach(x=>x.l.sort((a,b)=>a.mondial-b.mondial||a.cat.localeCompare(b.cat)));
  return OG_CACHE=o;
}
/** Le classement : la somme des places sur les quatre mesures, le public départage. */
function ogClasse(){
  const C=ogComptes(),l=OG_ORGS.map(x=>Object.assign({},x,{v5:C[x.nom].v5,c30:C[x.nom].c30,meilleurs:C[x.nom].l}));
  const place=(k)=>{const v=[...l].sort((a,b)=>b[k]-a[k]);l.forEach(x=>{const p=v.findIndex(y=>y[k]===x[k]),n=v.filter(y=>y[k]===x[k]).length;x['p_'+k]=p+1+(n-1)/2;});};
  l.forEach(x=>x.recN=x.rec[0]);['pub','recN','v5','c30'].forEach(place);
  l.forEach(x=>x.points=x.p_pub+x.p_recN+x.p_v5+x.p_c30);
  l.sort((a,b)=>a.points-b.points||b.pub-a.pub);l.forEach((x,i)=>x.rang=i+1);return l;
}
const ogTeinte=nom=>CL_TEINTES[nom]||CL_TEINTES.Split;
/** L'emblème : les trois octogones du logo du jeu, dans la couleur de l'organisation. */
const ogEmb=(nom,t=64)=>`<span class="og-emb" style="width:${t}px;height:${t}px">${LOGO.replace(/#E23A2B/g,ogTeinte(nom)[0])}</span>`;
const ogCb=n=>n>1?'combattants':'combattant';
const ogOrd=n=>n===1?'1re':`${n}e`;
const ogMv=(x,cl='')=>{const d=x.avant-x.rang;return d>0?`<span class="og-mv cl-up ${cl}">▲ ${d}</span>`:d<0?`<span class="og-mv cl-down ${cl}">▼ ${-d}</span>`:`<span class="og-mv og-eg ${cl}">=</span>`;};
/* Icônes des mesures et des pistes (un trait, une idée) */
Object.assign(P,{
  ogPublic:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 19c0-3.3 2.4-5.5 5.5-5.5s5.5 2.2 5.5 5.5M10.5 19c0-3.3 2.4-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/>',
  ogSalle:'<path d="M3 20V10l9-6 9 6v10"/><path d="M3 20h18M8 20v-6h8v6"/>',
  ogEtoile:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  ogDiese:'<path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>',
  ogEcran:'<path d="M3 5h18v11H3zM8 20h8M12 16v4"/>',
  ogLoupe:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  ogContrat:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
  ogEuro:'<circle cx="12" cy="12" r="9"/><path d="M15 8.6a4 4 0 100 6.8M7.5 11h5.5M7.5 13.3h5.5"/>',
  ogMonde:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
});

/* ---- Onglets ---- */
function ogHaut(){
  const o=(v,t)=>`<button class="onglet oct ${S.og.onglet===v?'ouvert':''}" data-ogong="${v}">${t}</button>`;
  return `<div class="cl-haut og-haut">${o('huit','Concurrence')}${o('croissance','Croissance')}${typeof mcHtml==='function'?o('carriere','Carrière'):''}</div>`;
}

/* ---- Les huit : le bandeau de Split, puis les huit en colonnes ---- */
/** Ce qu'il faut à Split pour passer l'organisation juste devant : le public moyen qui suffit, testé sur le vrai calcul du rang. */
function ogPasser(l){
  const sp=l.find(x=>x.nom==='Split'),dev=l.find(x=>x.rang===sp.rang-1);if(!dev)return null;
  const o=OG_ORGS.find(x=>x.nom==='Split'),a=o.pub;let res=null;
  for(let v=sp.pub+100;v<=20000&&!res;v+=100){o.pub=v;if(ogClasse().find(x=>x.nom==='Split').rang<sp.rang)res=v;}
  o.pub=a;return res;
}
function ogBandeau(l){
  const sp=l.find(x=>x.nom==='Split'),dev=l.find(x=>x.rang===sp.rang-1),der=l.find(x=>x.rang===sp.rang+1),v=ogPasser(l);
  const st=(lab,val,sous)=>`<div class="stat-b og-st"><span class="etiq">${lab}</span><span class="T og-stv">${val}</span><span class="sous">${sous}</span></div>`;
  return `<div class="bandeau og-band ${S.og.anim?'apparait':''}"><i class="bandeau-img"></i>
    <div class="og-bt">${ogEmb('Split',86)}<div class="og-btt"><span class="etiq">Place</span><span class="T og-place-g">${sp.rang}<small>/8</small></span><span class="sous">${ogMv(sp)} · ${sp.avant}/8 le 12 décembre</span></div></div>
    ${dev?st('Juste devant',`<button class="og-nb" data-ogsel="${esc(dev.nom)}">${esc(dev.court||dev.nom)}</button>`,v?`${ogOrd(dev.rang)} · ${nb(v)} spectateurs par soirée suffisent`:`${ogOrd(dev.rang)}`):''}
    ${der?st('Juste derrière',`<button class="og-nb" data-ogsel="${esc(der.nom)}">${esc(der.court||der.nom)}</button>`,`${ogOrd(der.rang)} · ${nb(sp.pub-der.pub)} spectateurs de moins par soirée`):''}
    ${st('Fin de saison','31 déc. 2027','le rang fixe le diffuseur et les agents libres')}
  </div>`;
}
function ogColonne(x,i,mx){
  const t=ogTeinte(x.nom),moi=x.nom==='Split';
  const m=(ic,lab,v,max,u)=>`<span class="og-me"><span class="og-meh"><span class="og-mi">${ico(ic,18,2)}</span><span class="og-ml">${lab}</span></span>
    <span class="og-mv2"><b class="T"><span data-ogn="${v}">0</span></b><span class="og-mu">${u}</span></span>
    <span class="og-mj"><i style="--p:${Math.max(2,v/max*100)}%;animation-delay:${250+i*50}ms"></i></span></span>`;
  return `<button class="og-k oct ${moi?'og-split':''} ${S.og.sel===x.nom?'sel':''} ${S.og.anim?'apparait':''}" style="animation-delay:${i*55}ms;--teinte:${t[0]}" data-ogsel="${esc(x.nom)}"><span class="og-ki oct">
    <span class="og-kimg"><i style="filter:${t[1]||'none'} brightness(.85)"></i>${ogEmb(x.nom,70)}<span class="og-rgb"><b class="T">${x.rang}</b>${ogMv(x)}</span></span>
    <span class="og-kh"><span class="T og-kn">${esc(x.court||x.nom)}</span><span class="sous">${esc(x.ville)}</span></span>
    <span class="og-ms4">${m('ogPublic','Spectateurs',x.pub,mx.pub,'par soirée')}${m('ogSalle','Record',x.rec[0],mx.rec,'spectateurs')}${m('ogEtoile','Top 5 mondial',x.v5,mx.v5,ogCb(x.v5))}${m('ogDiese','Top 30 mondial',x.c30,mx.c30,ogCb(x.c30))}</span>
    <span class="og-mot"><span class="og-ml">Dernière soirée</span><span class="og-motv">${esc(x.der[0])}, ${esc(x.der[1])}</span><span class="og-motn">${nb(x.der[2])} spectateurs</span></span>
  </span></button>`;
}
/** Le panneau d'une organisation, par-dessus les colonnes : sa place et pourquoi, ses chiffres face à Split, où elle en est, ses meilleurs classés. */
function ogPanneau(l){
  const x=l.find(y=>y.nom===S.og.sel);if(!x)return '';
  const sp=l.find(y=>y.nom==='Split'),t=ogTeinte(x.nom),moi=x.nom==='Split',d=x.avant-x.rang;
  const tuile=(ic,lab,v,s,vs)=>`<div class="og-tu oct"><div class="og-tuh"><span class="og-mi">${ico(ic,20,2)}</span><span class="etiq">${lab}</span></div><b class="T"><span data-ogn="${v}">0</span></b><span class="sous">${s}</span>${moi?'':`<span class="og-vs">Split : ${nb(vs)}</span>`}</div>`;
  const best=x.meilleurs.slice(0,5).map((c,i)=>`<div class="og-b" style="animation-delay:${250+i*50}ms"><span class="T og-bm">${c.mondial}</span>${(c.ext&&c.mondial<=7)||c.rang==='C'?'<span class="marque octr og-c8">C</span>':'<span></span>'}<span class="og-bn">${lien(c)}</span><span class="sous">${esc(rsCatL(c.cat))}</span></div>`).join('');
  return `<div class="og-voile" data-ogfermer></div><div class="og-over">${pan(`<div class="og-p" data-cle="${esc(x.nom)}">
    <div class="og-pban" style="--teinte:${t[0]}"><i class="og-pimg" style="filter:${t[1]||'none'} brightness(.8)"></i>${ogEmb(x.nom,96)}
      <div class="og-pbt"><div class="T og-pbn">${esc(x.nom)}</div><div class="og-pbl">${esc(x.ville)} · depuis ${x.depuis}</div></div>
      <div class="og-pplace"><span class="etiq">Place</span><b class="T">${ogOrd(x.rang)}</b>${ogMv(x)}</div>
      <button class="og-fermer" data-ogfermer title="Fermer">${ico('croix',26,2.4)}</button></div>
    <div class="og-pc">
      <div class="og-pg">
        <div class="og-bouge"><span class="etiq">Évolution</span><p>${d?`${ogOrd(x.avant)} le 12 décembre, ${ogOrd(x.rang)} aujourd’hui. `:`${ogOrd(x.rang)} depuis le 12 décembre. `}${esc(x.bouge)}<span class="relire">à relire</span></p></div>
        <div class="og-tus">${tuile('ogPublic','Spectateurs',x.pub,'par soirée, en moyenne en 2026',sp.pub)}${tuile('ogSalle','Record',x.rec[0],`spectateurs · ${esc(x.rec[1])}, ${esc(x.rec[2])}`,sp.rec[0])}${tuile('ogEtoile','Top 5 mondial',x.v5,`${ogCb(x.v5)} dans le top 5 de ${x.v5>1?'leur':'sa'} catégorie`,sp.v5)}${tuile('ogDiese','Top 30 mondial',x.c30,`${ogCb(x.c30)} dans le top 30 de ${x.c30>1?'leur':'sa'} catégorie`,sp.c30)}</div>
      </div>
      <div class="og-pd">
        <div class="og-ou"><div><span class="og-mi">${ico('ogEcran',20,2)}</span><span class="etiq">Diffuseur</span><b>${esc(x.diff)}</b></div><div><span class="og-mi">${ico('ogSalle',20,2)}</span><span class="etiq">Salles</span><b>${esc(x.salles)}</b></div></div>
        <div class="og-bh"><span class="etiq">Meilleurs classés</span><button class="og-lien" data-ogmonde>Classement mondial ›</button></div>
        <div class="og-bs">${best}</div>
      </div>
    </div></div>`,'','og-pan')}</div>`;
}
function ogHuit(){
  const l=ogClasse();if(S.og.sel&&!l.some(x=>x.nom===S.og.sel))S.og.sel=null;
  const mx={pub:Math.max(...l.map(x=>x.pub)),rec:Math.max(...l.map(x=>x.rec[0])),v5:Math.max(...l.map(x=>x.v5)),c30:Math.max(...l.map(x=>x.c30))};
  return `${ogBandeau(l)}<div class="og-zone ${S.og.sel?'og-ouvert':''}"><div class="og-mur">${l.map((x,i)=>ogColonne(x,i,mx)).join('')}</div>${ogPanneau(l)}</div>`;
}

/* ---- La croissance : les pistes à gauche, la piste choisie en grand à droite ----
   Chaque piste a quatre marches ; la marche du moment est jaune (valeur en cours vers un objectif).
   Les conditions lisent la partie : public et soirées des Résultats, caisse des Finances, place dans Les huit, rang mondial des Classements. */
function ogPistes(){
  const l=ogClasse(),sp=l.find(x=>x.nom==='Split'),caisse=typeof fiCaisse==='function'?fiCaisse().c:952200;
  const best=COMBATTANTS.filter(c=>!c.ext).reduce((m,c)=>!m||c.mondial<m.mondial?c:m,null);
  const rang={type:'rang',lab:'4/8 ou mieux en fin de saison',v:sp.rang,but:4,det:`${ogOrd(sp.rang)} aujourd’hui, ${ogOrd(sp.avant)} le 12 décembre`};
  const pub={type:'jauge',lab:'Un public moyen de 6 000',v:sp.pub,but:6000,det:'sur les 7 soirées de 2026'};
  const salle={type:'jauge',lab:'Une soirée à 8 000 spectateurs',v:6340,but:8000,det:'le record : Marseille, 14 nov.'};
  return [
    {id:'salles',ic:'ogSalle',t:'Salles',m:['3 000','6 000','10 000','15 000 +'],u:'places',cur:1,
     auj:'Split remplit les salles de 6 000 places',auj2:'5 800 au Palais des sports de Lyon, salle pleine',
     cond:[{type:'jauge',lab:'Une salle de 8 000 remplie à 90 %',v:79,but:90,suf:' %',det:'Marseille, 14 nov. : 6 340 sur 8 000'},pub],
     gain:'Des salles de 10 000 places',gain2:'Une grande salle, dans le MMA : 15 000 places (UFC Paris : 15 405)',go:['resultats','Soirées']},
    {id:'diffuseur',ic:'ogEcran',t:'Diffuseur',m:['Régional','National','Européen','Mondial'],cur:1,
     auj:'National depuis le 10 janvier',auj2:'380 000 € par soirée',
     cond:[rang,pub],gain:'Diffusé dans 8 pays d’Europe',gain2:'Le montant se négocie à la fin de la saison',go:['finances','Caisse']},
    {id:'recruteur',ic:'ogLoupe',t:'Recruteur',m:['L’Europe','Le monde','2 voyages','3 voyages'],cur:1,
     auj:'Marco voyage partout dans le monde',auj2:'un voyage à la fois',
     cond:[{type:'jauge',lab:'1 000 000 € en caisse',v:caisse,but:1000000,suf:' €',det:`il manque ${nb(1000000-caisse)} €`}],
     gain:'Un 2e recruteur',gain2:'2 voyages en même temps',go:['recruteur','Recruteur']},
    {id:'agents',ic:'ogContrat',t:'Agents libres',m:['Non classés','Classés 61 et +','Top 60','Top 30'],cur:1,
     auj:'Te répondent : les classés au-delà du top 60',auj2:'et les non-classés, comme au Recrutement',
     cond:[rang,{type:'mondial',lab:'Un combattant dans le top 5 mondial',v:best?best.mondial:99,but:5,det:best?`le mieux classé : ${lien(best)}`:''}],
     gain:'Les classés du top 60 te répondent',gain2:'quand leur contrat finit',go:['contrats','Recrutement']},
    {id:'partenaires',ic:'ogEuro',t:'Partenaires',m:['60 000 €','110 000 €','140 000 €','200 000 €'],u:'par soirée',cur:2,propose:true,
     auj:'140 000 € par soirée',auj2:'depuis le palier du 10 janvier',
     cond:[salle,pub],gain:'200 000 € par soirée',gain2:'',go:['finances','Caisse']},
    {id:'etranger',ic:'ogMonde',t:'Hors de France',m:['La région','La France','L’Europe','Le monde'],cur:1,propose:true,
     auj:'Toutes les soirées en France',auj2:'Lyon, Bordeaux, Nice, Grenoble, Marseille, Lille',
     cond:[{type:'piste',lab:'Le diffuseur européen',piste:'diffuseur',det:''},salle],
     gain:'Des soirées en Belgique, en Suisse, en Espagne',gain2:''},
  ];
}
const ogAvance=c=>c.type==='rang'?Math.min(1,(9-c.v)/(9-c.but)):c.type==='mondial'?Math.min(1,c.but/c.v):c.type==='piste'?0:Math.min(1,c.v/c.but);
function ogCond(c,i){
  const ok=ogAvance(c)>=1;
  let vis='';
  if(c.type==='rang')vis=`<div class="og-rangs">${[1,2,3,4,5,6,7,8].map(n=>`<span class="octr ${n===c.v?'ici':''} ${n<=c.but?'but':''}">${n}</span>`).join('')}</div>`;
  else if(c.type==='mondial')vis=`<div class="og-rangs og-r10">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<span class="octr ${n===c.v?'ici':''} ${n<=c.but?'but':''}">${n}</span>`).join('')}</div>`;
  else if(c.type==='piste')vis=`<button class="og-dep oct" data-ogpiste="${c.piste}">${ico('ogEcran',22,2)}<span>Il faut d’abord monter <b>le diffuseur</b></span><span class="og-lien">Voir ›</span></button>`;
  else vis=`<div class="og-cj"><i class="${ok?'ok':''}" style="--p:${Math.max(2,ogAvance(c)*100)}%;animation-delay:${300+i*120}ms"></i></div>`;
  const val=c.type==='rang'?`<b class="T">${ogOrd(c.v)}</b><span> / ${ogOrd(c.but)}</span>`:c.type==='mondial'?`<b class="T">n° ${c.v}</b><span> / n° ${c.but}</span>`:c.type==='piste'?'':`<b class="T"><span data-ogn="${c.v}">0</span>${c.suf||''}</b><span> / ${nb(c.but)}${c.suf||''}</span>`;
  return `<div class="og-cond ${ok?'fait':''}" style="animation-delay:${200+i*120}ms"><div class="og-condh"><span class="og-condl">${esc(c.lab)}</span><span class="og-condv">${val}</span></div>${vis}<div class="og-condd">${c.det||''}</div></div>`;
}
function ogCroissance(){
  const PS=ogPistes(),cle=S.og.piste&&PS.some(p=>p.id===S.og.piste)?S.og.piste:PS[0].id,p=PS.find(x=>x.id===cle);
  const prog=q=>q.cond.reduce((t,c)=>t+ogAvance(c),0)/q.cond.length;
  const proche=PS.reduce((m,q)=>!m||prog(q)>prog(m)?q:m,null);
  const tuile=(q,i)=>`<button class="og-pl oct ${q.id===cle?'sel':''} ${S.og.anim?'apparait':''}" style="animation-delay:${i*50}ms" data-ogpiste="${q.id}"><span class="og-pli oct">
    <span class="og-pli-i">${ico(q.ic,30,2)}</span>
    <span class="og-pli-t"><span class="T">${esc(q.t)}</span><span class="og-pli-m">${q.m.map((m,j)=>`<i class="octr ${j<q.cur?'fait':j===q.cur?'cur':''}"></i>`).join('')}<b>${esc(q.m[q.cur])}</b></span></span>
    <span class="og-pli-p">${q===proche?'<span class="og-proche">plus proche</span>':'<span class="etiq">avancée</span>'}<span class="T">${Math.round(prog(q)*100)} %</span></span>
  </span></button>`;
  const marches=p.m.map((m,j)=>`<div class="og-st4 ${j<p.cur?'fait':j===p.cur?'cur':''}" style="--h:${34+j*22}%;animation-delay:${100+j*80}ms"><span class="og-st4-l">${j===p.cur?'<span class="og-ici">Aujourd’hui</span>':j===p.cur+1?'<span class="og-ici og-next">Prochaine marche</span>':''}<b class="T">${esc(m)}</b>${p.u&&j===p.m.length-1?`<span>${esc(p.u)}</span>`:''}</span><i class="oct"></i></div>`).join('');
  const detail=pan(`<div class="og-pdt" data-cle="${p.id}">
    <div class="pt"><h2>${esc(p.t)}</h2>${p.propose?'<span class="ment">piste proposée</span>':''}</div>
    <div class="og-esc">${marches}</div>
    <div class="og-now"><span class="og-mi og-mi-g">${ico(p.ic,26,2)}</span><div><b>${esc(p.auj)}</b><span class="sous">${esc(p.auj2)}</span></div></div>
    <div class="og-pour"><span class="etiq">Pour monter</span><div class="og-conds n${p.cond.length}">${p.cond.map(ogCond).join('')}</div></div>
    <div class="og-gain"><div><span class="etiq">À la clé</span><b>${esc(p.gain)}</b>${p.gain2?`<span class="sous">${esc(p.gain2)}</span>`:''}</div>${p.go?`<button class="bb oct" data-oggo="${p.go[0]}"><span class="oct">${esc(p.go[1])} ›</span></button>`:''}</div>
  </div>`,'height:100%','og-droite');
  return `<div class="og-g2"><div class="og-pls">${PS.map(tuile).join('')}</div>${detail}</div>`;
}

function ogHtml(){ogGarder();return `<div class="rc og">${ogHaut()}${S.og.onglet==='croissance'?ogCroissance():S.og.onglet==='carriere'&&typeof mcHtml==='function'?mcHtml():ogHuit()}</div>`;}

/* ---- Mouvement : les chiffres défilent ---- */
function ogCompter(){document.querySelectorAll('.og [data-ogn]').forEach((e,i)=>{const v=+e.dataset.ogn,t0=performance.now()+Math.min(i,16)*30;
  const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/650)),x=1-Math.pow(1-k,3);e.textContent=nb(v*x);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(()=>{e.textContent=nb(v);},1400);});}

/* ---- Branchement dans le cadre ---- */
const ogRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='organisation'){ogRendreBase();return;}
  rendreBarre();rendreEntete('Organisation');$('#alerte').classList.remove('af-al');
  if(S.rs.apres&&typeof rsAlerte==='function')rsAlerte();else msAlerte();
  $('#corps').style.top='152px';
  const cle=($('.og .og-p,.og .og-pdt')||{dataset:{}}).dataset.cle;
  $('#corps').innerHTML=ogHtml();
  const p=$('.og .og-p,.og .og-pdt');
  if(!S.og.anim&&p&&p.dataset.cle===cle){p.classList.add('og-fixe');document.querySelectorAll('.og [data-ogn]').forEach(e=>e.textContent=nb(+e.dataset.ogn));}
  else if(!S.og.anim){document.querySelectorAll('.og-mur [data-ogn],.og-band [data-ogn],.mc-zone [data-ogn]').forEach(e=>e.textContent=nb(+e.dataset.ogn));document.querySelectorAll('.og-p [data-ogn],.og-pdt [data-ogn]').forEach((e,i)=>{const v=+e.dataset.ogn,t0=performance.now()+i*40,f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/600)),x=1-Math.pow(1-k,3);e.textContent=nb(v*x);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(()=>{e.textContent=nb(v);},1300);});}
  else ogCompter();
  S.og.anim=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const ogAllerBase=aller;
aller=function(ec){
  if(ec!=='organisation'){ogAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.og.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : l'onglet et l'organisation choisie sont des pas du parcours. */
function ogPas(maj){S.hist.push({og:ogEtat()});S.futur=[];maj();rendre();}
const ogRetourBase=retour;
retour=function(){
  while(S.ecran!=='organisation'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].og)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='organisation'&&!S.fiche&&h&&h.og){S.hist.pop();S.futur.push({og:ogEtat()});const v=JSON.parse(h.og);S.og.anim=v.onglet!==S.og.onglet;Object.assign(S.og,v);rendre();return;}
  ogRetourBase();
};
function ogAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='organisation'&&!S.fiche&&f&&f.og){S.futur.pop();S.hist.push({og:ogEtat()});const v=JSON.parse(f.og);S.og.anim=v.onglet!==S.og.onglet;Object.assign(S.og,v);rendre();return true;}
  return false;
}
const ogOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='organisation'){ogOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='organisation')return;
  const t=e.target;let el;
  if(t.closest('#bAvant')&&!S.fiche&&ogAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.og){e.stopImmediatePropagation();retour();return;}}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.og;
  if((el=t.closest('[data-ogong]'))){e.stopImmediatePropagation();const v=el.dataset.ogong;if(v!==F.onglet)ogPas(()=>{F.onglet=v;F.sel=null;F.anim=true;});return;}
  if((el=t.closest('[data-ogsel]'))&&!t.closest('.og-over')){e.stopImmediatePropagation();const v=el.dataset.ogsel;if(v!==F.sel)ogPas(()=>{F.sel=v;});return;}
  if(t.closest('[data-ogfermer]')){e.stopImmediatePropagation();ogPas(()=>{F.sel=null;});return;}
  if((el=t.closest('[data-ogpiste]'))){e.stopImmediatePropagation();const v=el.dataset.ogpiste;if(v!==F.piste)ogPas(()=>{F.piste=v;});return;}
  if(t.closest('[data-ogmonde]')){e.stopImmediatePropagation();S.cl.vue='classement';S.cl.portee='monde';aller('classements');return;}
  if((el=t.closest('[data-oggo]'))){e.stopImmediatePropagation();const v=el.dataset.oggo;if(v==='resultats'){S.rs.vue='resultats';S.rs.det=null;}aller(v);return;}
},true);

/* ---- Lancement : ?ecran=organisation, options vue=huit|croissance, org=<nom>, fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='organisation')return;
  if(q.get('vue'))S.og.onglet=q.get('vue');if(q.get('org'))S.og.sel=q.get('org');if(q.get('piste'))S.og.piste=q.get('piste');
  S.ecran='organisation';S.hist=['accueil'];S.og.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
