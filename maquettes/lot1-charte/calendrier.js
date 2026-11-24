"use strict";
/* Maquette lot 1 — le Calendrier (R29, Q29a, Q29b, Q21c, T9). L'écran « Calendrier » de la barre. Préfixe ca- (classes), ca / CA_ (fonctions, constantes).
   Quatrième passe (17/11) : la première version (six mois à la fois, la soirée à droite), reprise au propre.
     - chaque mois a la même hauteur (six semaines) et une place fixe sous sa grille pour ses soirées : rien ne flotte entre deux mois ;
     - une légende dit ce que veut dire chaque repère (aujourd'hui, ta soirée, ceinture en jeu, fermé, rendez-vous) ;
     - aujourd'hui (anneau rouge) ne ressemble plus au jour choisi (anneau blanc) ;
     - la période fermée (moins de 10 semaines) est hachurée ; un clic dit pourquoi et à partir de quand ;
     - une soirée se pose et se retire à droite, avec ce que ça coûte, et une confirmation en chiffres (S6) ;
     - noms : « Fight Night 63 » (comme l'en-tête et les Résultats) et l'affiche « Nana vs Mezouar » ; « Soirée phare » (Split 1) remplace « grande soirée ».
   Règles proposées (sources dans comparaison.html) : poser ou retirer au moins 10 semaines avant (cartes annoncées 8 à 12 semaines avant, billetterie
   ouverte alors) ; retirer coûte une part de la location : rien au-delà de 180 jours, 20 % de 91 à 180, 50 % de 70 à 90. */

/* ---- Réglages de l'écran : gardés au retour ---- */
const CA_CLE='maquette-calendrier-4';
S.ca=Object.assign({per:'2027-1',type:'fn',salle:'lyon',sel:null,jour:null,retrait:null,anim:true,posees:[],retirees:[]},(()=>{try{const v=JSON.parse(localStorage.getItem(CA_CLE))||{},o={};
  for(const k of ['per','type','salle'])if(typeof v[k]==='string')o[k]=v[k];return o;}catch(e){return {};}})());
function caGarder(){try{const {per,type,salle}=S.ca;localStorage.setItem(CA_CLE,JSON.stringify({per,type,salle}));}catch(e){}}
const caEtat=()=>JSON.stringify({per:S.ca.per,sel:S.ca.sel,jour:S.ca.jour,retrait:S.ca.retrait});

/* ---- Dates ---- */
const CA_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const CA_MOISL=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const caJ=d=>d.getDate()===1?'1er':String(d.getDate());
const caDc=d=>`${caJ(d)} ${CA_MOIS[d.getMonth()]}`;
const caDa=d=>`${caDc(d)} ${d.getFullYear()}`;
const caDl=d=>`${caJ(d)} ${MOIS[d.getMonth()]}`;
const caCle=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const caDe=k=>{const [a,m,j]=k.split('-').map(Number);return new Date(a,m-1,j);};
const caJours=(a,b)=>Math.round((b-a)/864e5);
const caPlus=(d,j)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+j);
/** « samedi 15 mai 2027 » */
const caLong=d=>`${JOURS[d.getDay()]} ${caJ(d)} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
const caAuj=()=>new Date(S.date.getFullYear(),S.date.getMonth(),S.date.getDate());
/** « dans 35 jours », « demain », « aujourd'hui », « il y a 3 jours ». */
function caDans(d){const j=caJours(caAuj(),d);return j===0?'aujourd’hui':j===1?'demain':j>1?`dans ${nb(j)} jours`:j===-1?'hier':`il y a ${nb(-j)} jours`;}
/** Un écart en semaines (ou en jours sous deux semaines). */
function caEcart(j){j=Math.abs(j);return j>=14?`${Math.round(j/7)} semaines`:`${j} jour${j>1?'s':''}`;}

/* ---- Les règles ---- */
const CA_DELAI=70; /* dix semaines : poser, retirer, ouverture de la billetterie */
const caLimite=()=>caPlus(caAuj(),CA_DELAI);
const CA_ESP=21; /* trois semaines au moins entre deux soirées (proposition : le plus court écart de Split en 2026 est de 24 jours, 14 nov. → 8 déc.) */
/** La soirée à venir trop proche d'un jour (moins de trois semaines), s'il y en a une. */
const caTropPres=d=>caAvenir().find(s=>caCle(s.date)!==caCle(d)&&Math.abs(caJours(s.date,d))<CA_ESP)||null;
/** Peut-on poser une soirée ce jour-là ? Assez loin d'aujourd'hui, et des autres soirées. */
const caLibre=d=>d>=caLimite()&&!caTropPres(d)&&!caParJour(caCle(d));
/** La première date où une soirée peut se poser. */
function caPremiere(){for(let d=caLimite();d<=new Date(2027,11,31);d=caPlus(d,1))if(caLibre(d))return d;return null;}
/** Pourquoi un jour est fermé, en une phrase, avec la première date possible. */
function caPourquoi(d){
  const p=caPremiere(),suite=p?` Première date libre : le ${caDl(p)}.`:'';
  if(d<caLimite())return `Trop tard pour le ${caDl(d)} : une soirée se pose au moins 10 semaines avant, le temps de vendre les places.${suite}`;
  const s=caTropPres(d);return `Le ${caDl(d)} est trop près ${caDeLa(s)}, le ${caDl(s.date)} : il faut 3 semaines au moins entre deux soirées.${suite}`;
}
const caBillet=s=>caPlus(s.date,-CA_DELAI);
/** Ce que coûte un retrait aujourd'hui : une part de la location selon le délai ; null si la billetterie est déjà ouverte. */
function caCout(s){const j=caJours(caAuj(),s.date);if(j<CA_DELAI)return null;const p=j>180?0:j>90?.2:.5;return {p,e:Math.round(s.loc*p)};}

/* ---- Les salles (Résultats, Finances) ---- */
const CA_SALLES=[
  {id:'lyon',ville:'Lyon',salle:'Palais des sports',places:5800,prix:64,loc:110000},
  {id:'marseille',ville:'Marseille',salle:'Dôme de Marseille',places:8000,prix:60,loc:130000},
  {id:'nice',ville:'Nice',salle:'Palais Nikaïa',places:5000,prix:58,loc:115000},
  {id:'lille',ville:'Lille',salle:'Forum de Lille',places:4000,prix:66,loc:120000},
  {id:'grenoble',ville:'Grenoble',salle:'Halle de Grenoble',places:4000,prix:52,loc:95000},
  {id:'bordeaux',ville:'Bordeaux',salle:'Palais des sports',places:3800,prix:55,loc:100000},
];
const caSalleId=id=>CA_SALLES.find(x=>x.id===id)||CA_SALLES[0];
const caSalleDe=s=>CA_SALLES.find(x=>x.ville===s.ville&&x.salle===s.salle)||{prix:60,loc:100000};
const CA_RECORD=6340; /* le record de Split : Marseille, 14 nov. 2026 (Organisation) */
/** La dernière soirée de Split dans une salle. */
const caDerniere=x=>caPassees().find(s=>s.ville===x.ville&&s.salle===x.salle)||null;

/* ---- Les soirées ---- */
/** Les soirées jouées, de la plus récente à la plus ancienne (Résultats). */
function caPassees(){
  return RS_SOIREES.filter(s=>s.n<63||S.rs.apres).map(s=>({id:String(s.n),n:s.n,date:s.date,ville:s.ville,salle:s.salle,places:s.n===63?4000:s.public[1],
    public:s.public[0],titre:s.titre||null,ceinture:s.ceinture,enjeu:s.enjeu,passee:true,avantToi:s.n<63,genre:'fn'}));
}
/** Les soirées à venir : la 63, la 64 (Résultats), puis celles que tu poses ; moins celles que tu retires. Numérotées dans l'ordre des dates. */
function caAvenir(){
  const l=[];
  if(!S.rs.apres)l.push({id:'63',date:new Date(2027,1,16),ville:'Lille',salle:'Forum de Lille',places:4000,genre:'fn',titre:'Poids léger',carte:true,
    presse:new Date(2027,1,13),pesee:new Date(2027,1,15)});
  l.push({id:'64',date:new Date(2027,3,3),ville:'Bordeaux',salle:'Palais des sports',places:3800,genre:'fn',vide:true,avantToi:true});
  const o=l.concat(S.ca.posees).filter(s=>!S.ca.retirees.includes(s.id)).sort((a,b)=>a.date-b.date);
  let fn=S.rs.apres?63:62,ph=0;
  o.forEach(s=>{s.loc=caSalleDe(s).loc;if(s.genre==='phare'){s.n=++ph;s.lab='Soirée phare';s.court=`Split ${ph}`;}else{s.n=++fn;s.lab=`Fight Night ${fn}`;s.court=s.lab;}});
  return o;
}
/** Le nom sur l'affiche : le combat principal, le numéro d'une soirée phare, ou « À composer ». */
/** Le combat principal d'une soirée jouée (Résultats) : [vainqueur, vaincu]. */
function caPrincipal(s){const r=rsSoiree(s.n),f=r&&r.combats&&r.combats[0];return f?[rsW(f),rsL(f)]:null;}
const caAffiche=s=>s.passee?(caPrincipal(s)?`${caPrincipal(s)[0].nom} vs ${caPrincipal(s)[1].nom}`:`Fight Night ${s.n}`):s.carte?'Nana vs Mezouar':s.genre==='phare'?s.court:'À composer';
/** Ce qu'on lit dans la ligne du mois. */
const caLigneNom=s=>s.passee?(caPrincipal(s)?`${caPrincipal(s)[0].nom} bat ${caPrincipal(s)[1].nom}`:`Fight Night ${s.n}`):s.carte?'Nana vs Mezouar':s.court;
/** « de la Fight Night 64 », « de Split 1 ». */
const caDeLa=s=>s.genre==='phare'?`de ${esc(s.court)}`:`de la ${esc(s.court)}`;
const caToutes=()=>caPassees().concat(caAvenir());
const caParId=id=>caToutes().find(s=>s.id===id);
const caParJour=k=>caToutes().find(s=>caCle(s.date)===k);
/** La soirée ouverte à droite : celle choisie, sinon la prochaine. */
const caSel=()=>S.ca.jour?null:(S.ca.sel&&caParId(S.ca.sel))||caAvenir()[0];

/* ---- Les rendez-vous (un petit carré sous le jour, détaillés à droite) ---- */
function caRdv(){
  const l=[
    {d:new Date(2027,0,4),t:'Ton arrivée chez Split',go:['carriere','Ta carrière']},
    {d:new Date(2027,0,10),t:'Palier franchi : les diffuseurs nationaux regardent Split',go:['messages','Le message']},
    {d:new Date(2027,1,2),t:`Retour de blessure prévu pour ${lien(parId('rizzo'))}`},
    {d:new Date(2027,6,1),t:'Bilan de mi-saison avec Gérard Vasseur, patron',go:['carriere','Ta carrière']},
    {d:new Date(2027,11,31),t:'Fin de saison : objectifs jugés, place parmi les huit',go:['carriere','Ta carrière']},
  ];
  caAvenir().forEach(s=>{
    if(s.presse)l.push({d:s.presse,t:`Conférence de presse ${caDeLa(s)}, à ${esc(s.ville)}`,soiree:s.id});
    if(s.pesee)l.push({d:s.pesee,t:`Pesée officielle ${caDeLa(s)}`,soiree:s.id});
    const b=caBillet(s);if(s.vide&&b>caAuj())l.push({d:b,t:`Ouverture de la billetterie ${caDeLa(s)}, à ${esc(s.ville)}`,soiree:s.id});});
  return l;
}
const caRdvJour=k=>caRdv().filter(e=>caCle(e.d)===k);

/* ---- Les soirées des sept autres organisations (inventées, à relire). Organisation donne les deux premières (3 et 9 janv.) ;
   les autres sont annoncées 8 à 12 semaines avant, sauf leurs rendez-vous fixes (juillet, septembre, 31 décembre). ---- */
const CA_AILLEURS=[[0,3,'Pure Impact','Dubaï'],[0,9,'Ultimate Rim','Perth'],[0,30,'Knuckle Gate','Manchester'],[1,13,'Undisputed Cage','Recife'],
  [1,20,'Garden of Blood','New York'],[2,6,'Fighting Pacific Championship','Tokyo'],[2,20,'MMA Korner','Rotterdam'],[3,3,'Knuckle Gate','Manchester'],
  [3,17,'Garden of Blood','New York'],[6,3,'Garden of Blood','New York'],[8,18,'Undisputed Cage','São Paulo'],[11,31,'Fighting Pacific Championship','Saitama']]
  .map(([m,j,org,ville])=>({d:new Date(2027,m,j),org,ville}));
const caCourt=o=>o==='Fighting Pacific Championship'?'Fighting Pacific':o;
const caAilJour=k=>CA_AILLEURS.filter(x=>caCle(x.d)===k);
const caAilTxt=x=>`<span><b>${esc(caCourt(x.org))}</b>, ${esc(x.ville)}</span>`;

/* ---- Six mois à la fois ---- */
const CA_PER=['2026-1','2026-2','2027-1','2027-2'];
const caPer=()=>CA_PER.includes(S.ca.per)?S.ca.per:'2027-1';
const caPerDe=d=>`${d.getFullYear()}-${d.getMonth()<6?1:2}`;
function caPerTitre(p){const [a,h]=p.split('-');return h==='1'?`Janvier – juin ${a}`:`Juillet – décembre ${a}`;}

const OCT='clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)';
/** Un mois : sa grille de six semaines, puis ses soirées, chacune sur une ligne, à une place fixe. */
function caMois(an,m,i,nl){
  const auj=caAuj(),lim=caLimite(),k0=new Date(an,m,1),dec=(k0.getDay()+6)%7,n=new Date(an,m+1,0).getDate();
  const sel=caSel(),cases=[];
  for(let x=0;x<dec;x++)cases.push('<span></span>');
  for(let j=1;j<=n;j++){
    const d=new Date(an,m,j),k=caCle(d),s=caParJour(k),rdv=caRdvJour(k),ail=caAilJour(k)[0],pos=dec+j-1,passe=d<auj,ajd=+d===+auj,ferme=!passe&&!ajd&&!s&&!caLibre(d);
    const choisi=(sel&&s&&sel.id===s.id&&!S.ca.retrait)||(S.ca.retrait&&s&&s.id===S.ca.retrait)||S.ca.jour===k;
    const cls=['ca-j',passe?'passe':'',ajd?'auj':'',ferme?'ferme':'',s?'soiree':'',s&&(s.titre||s.genre==='phare')?'titre':'',s&&s.passee?'jouee':'',choisi?'sel':'',!s&&!passe&&!ferme?'libre':''].filter(Boolean).join(' ');
    let attr,tip;
    if(s){attr=`data-casel="${s.id}"`;tip=`${s.passee?`Fight Night ${s.n}`:s.lab} · ${caAffiche(s)}`;}
    else if(rdv.length||ail){attr=`data-cajour="${k}"`;tip=rdv.map(e=>e.t.replace(/<[^>]+>/g,'')).concat(ail?[`${ail.org}, ${ail.ville}`]:[]).join(' · ');}
    else if(ferme){attr=`data-caferme="${k}"`;tip=d<lim?'Fermé : moins de 10 semaines':'Fermé : trop près d’une soirée';}
    else if(!passe&&!ajd){attr=`data-cajour="${k}"`;tip='Poser une soirée ce jour-là';}
    else {attr='tabindex="-1"';tip='';}
    if(ail&&s)tip+=` · le même soir : ${ail.org}, ${ail.ville}`;
    cases.push(`<button class="${cls}" ${attr} title="${esc(tip)}" style="--x:${pos%7};--y:${Math.floor(pos/7)}"><span class="ca-n">${j}</span>${rdv.length&&!s?'<i class="ca-rdv"></i>':''}</button>`);
  }
  const ss=caToutes().filter(s=>s.date.getFullYear()===an&&s.date.getMonth()===m).sort((a,b)=>a.date-b.date);
  const ligne=s=>`<button class="ca-ml oct ${sel&&sel.id===s.id&&!S.ca.jour?'on':''} ${s.passee?'jouee':''} ${s.titre||s.genre==='phare'?'titre':''}" data-casel="${s.id}">
    <b class="T ca-mo octr">${caJ(s.date)}</b><span class="ca-mln">${s.titre||s.genre==='phare'?rsCb(18):''}<span>${esc(caLigneNom(s))}</span></span><span class="ca-mlv">${esc(s.ville)}</span></button>`;
  const lignes=ss.map(ligne).join('');
  return `<div class="ca-mois ${S.ca.anim?'apparait':''}" style="animation-delay:${i*40}ms">
    <div class="ca-mh"><span class="ca-mn T">${CA_MOISL[m]}</span></div>
    <div class="ca-sem">${['L','M','M','J','V','S','D'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="ca-grille">${cases.join('')}</div><div class="ca-mls">${lignes}</div></div>`;
}
/** La légende : seulement les repères présents sur les six mois affichés. */
function caLegende(an,m0){
  const it=(c,t)=>`<span class="ca-lg"><i class="${c}"></i>${t}</span>`,d0=new Date(an,m0,1),d1=new Date(an,m0+6,1),dans=d=>d>=d0&&d<d1;
  const ss=caToutes().filter(s=>dans(s.date)),auj=caAuj(),lim=caLimite();
  return `<div class="ca-leg">${dans(auj)?it('auj','Aujourd’hui'):''}${ss.some(s=>!s.passee)?it('soiree','Ta soirée'):''}${ss.some(s=>s.titre||s.genre==='phare')?it('titre','Ceinture en jeu'):''}
    ${ss.some(s=>s.passee)?it('jouee','Jouée'):''}${(()=>{for(let d=new Date(Math.max(+d0,+caPlus(auj,1)));d<d1;d=caPlus(d,1))if(!caParJour(caCle(d))&&!caLibre(d))return true;return false;})()?it('ferme','Fermé : trop tôt ou trop près'):''}${caRdv().some(e=>dans(e.d))?it('rdv','Un rendez-vous'):''}</div>`;
}
function caGauche(){
  const p=caPer(),[a,h]=p.split('-').map(Number),i=CA_PER.indexOf(p),m0=h===1?0:6,av=caAvenir(),pro=av.find(s=>s.date>=caAuj());
  const fl=(v,ic,t)=>v?`<button class="bb oct ca-fl" data-caper="${v}" title="${t}"><span class="oct">${ico(ic,22,2.6)}</span></button>`:`<span class="ca-fl vide"></span>`;
  const fait=(l,v,s)=>`<div class="ca-f"><span class="etiq">${l}</span><span class="T ca-fv">${v}</span><span class="sous">${s}</span></div>`;
  return pan(`<div class="pt"><h2>${caPerTitre(p)}</h2><span class="ca-nav">${fl(CA_PER[i-1],'retour','Les six mois d’avant')}${fl(CA_PER[i+1],'avant','Les six mois d’après')}</span></div>
    ${caLegende(a,m0)}
    <div class="ca-mur">${(()=>{const nb=m=>caToutes().filter(s=>s.date.getFullYear()===a&&s.date.getMonth()===m).length,r1=Math.max(nb(m0),nb(m0+1),nb(m0+2)),r2=Math.max(nb(m0+3),nb(m0+4),nb(m0+5));
      return Array.from({length:6},(_,k)=>caMois(a,m0+k,k,k<3?r1:r2)).join('');})()}</div>
    <div class="ca-faits">${fait('Soirées 2027',`${av.length} posée${av.length>1?'s':''}`,pro?`la prochaine ${caDans(pro.date)}`:'aucune à venir')}
      ${(()=>{const p=caPremiere(),t=p&&caTropPres(caPlus(p,-1));return fait('Première date libre',p?caDc(p):'—',p&&+p!==+caLimite()&&t?`3 semaines après le ${caDc(t.date)}`:'10 semaines pour vendre');})()}
      ${fait('Bilan de mi-saison','1er juil.','avec Gérard Vasseur, patron')}
      ${fait('Fin de saison','31 déc.','objectifs jugés')}</div>`,'height:100%','ca-g');
}

/* ---- À droite ---- */
function caBan(cl,sur,titre,sous){
  return `<div class="ca-ban ${cl}"><i class="ca-ban-img"></i><div class="ca-ban-t"><span class="etiq">${sur}</span><span class="T ca-bn">${titre}</span><span class="ca-bs">${sous}</span></div></div>`;
}
const caBanSoiree=s=>caBan(`${s.titre||s.genre==='phare'?'or':''} ${s.passee?'jouee':''}`,
  `${s.titre||s.genre==='phare'?rsCb(20):''}${esc(s.passee?`Fight Night ${s.n}`:s.lab)} · ${caLong(s.date)} · ${s.passee&&s.avantToi?'avant ton arrivée':caDans(s.date)}`,
  esc(caAffiche(s)),`${esc(s.salle)}, ${esc(s.ville)}`);
const caCase=(l,v,s,cl='',extra='')=>`<div class="ca-k oct ${cl}"><span class="etiq">${l}</span><span class="T ca-kv">${v}</span><span class="sous">${s}</span>${extra}</div>`;
const caSec=(t,d='')=>`<div class="ca-sec"><span class="etiq">${t}</span>${d?`<span class="ca-sm">${d}</span>`:''}</div>`;
/** Une ligne de la carte : A vs B ; une place vide dit ce qu'il manque, en lien d'action. */
function caCombat(f,i){
  const A=f.a&&parId(f.a),B=f.b&&parId(f.b),cat=(A||B)?rsCatC((A||B).cat):'',titre=i===0&&f.a==='nana';
  const cote=c=>c?`<span class="ca-cn">${lien(c)}</span>`:`<button class="ca-a" data-cago="carte">Adversaire à trouver ›</button>`;
  if(!A&&!B)return `<div class="ca-cl"><span class="ca-ci">${i+1}</span><span class="ca-gris">Place libre</span><button class="ca-a ca-fin" data-cago="carte">Composer ›</button></div>`;
  return `<div class="ca-cl"><span class="ca-ci">${i+1}</span>${cote(A)}<span class="ca-vs">vs</span>${cote(B)}<span class="ca-cc">${titre?`${rsCb(18)} Titre · `:''}${esc(cat)}<small>${titre||i===0?5:3} rounds</small></span></div>`;
}
/** Le pied d'une soirée à venir : peut-on encore la retirer, et combien ça coûte. */
function caRetraitHtml(s){
  const c=caCout(s);
  if(!c)return `<div class="ca-pied"><span class="ca-note">${ico('alerte',18)}<span>Plus de retrait possible : la billetterie est ouverte depuis le ${caDl(caBillet(s))}.</span></span>${s.carte?'<button class="bouton jaune cj oct" data-cago="carte">Ouvrir la carte</button>':''}</div>`;
  return `<div class="ca-pied"><span class="ca-note"><span><span>Retirable jusqu’au ${caDl(caPlus(caBillet(s),-1))} : ${c.e?`<b>${nb(c.e)} €</b>, ${Math.round(c.p*100)} % de la location.`:'<b>sans frais</b>.'}</span>
      <small>${s.avantToi?'Posée le 2 décembre 2026 par ton prédécesseur.<span class="relire">à relire</span>':`Posée par toi le ${caDl(caAuj())}.`}</small></span></span>
    <button class="bb oct" data-caretirer="${s.id}"><span class="oct">Retirer</span></button></div>`;
}
function caAvenirHtml(s){
  let h=caBanSoiree(s);
  if(s.carte){
    const v=S.preventes,pc=Math.round(v/s.places*100),nc=S.af.m.filter(f=>f.a&&f.b).length;
    h+=`<div class="ca-ks">${caCase('Places',`<span data-can="${s.places}">0</span>`,'capacité de la salle')}
      ${caCase('Préventes',`<span data-can="${v}">0</span>`,`${pc} % des places`,'',`<span class="ca-jg"><i style="--p:${pc}%"></i></span>`)}
      ${caCase('Billet moyen',`${caSalleDe(s).prix} €`,'prix de vente')}</div>
    ${caSec('L’enjeu')}
    <div class="ca-ce">${rsCb(34)}<div><div class="ca-ct">3e défense de ${lien(parId('nana'))}, chez les légers</div>
      <div class="sous">Contre ${lien(parId('mezouar'))}, n° 1 chez Split, qu’il avait battu en 2025</div></div></div>
    ${caSec('Carte principale',`<b class="${nc<4?'ca-jaune':''}">${nc} / 4</b>`)}
    <div class="ca-cls">${S.af.m.map(caCombat).join('')}</div>
    ${caSec('Préliminaires',`${S.af.p.filter(f=>f.a&&f.b).length} / 6 composés`)}
    ${caSec('Semaine du combat','<span class="relire">à relire</span>')}
    <div class="ca-prog"><span><b class="T">${caDc(s.presse)}</b>Conférence de presse</span><span><b class="T">${caDc(s.pesee)}</b>Pesée officielle</span><span><b class="T">${caDc(s.date)}</b>Début à 21 h</span></div>
    ${caRetraitHtml(s)}`;
    return h;
  }
  /* une soirée sans carte */
  const prec=caAvenir().filter(x=>x.date<s.date).pop(),b=caBillet(s),ouv=b<=caAuj();
  const surAff=new Set(S.af.m.concat(S.af.p).flatMap(f=>[f.a,f.b]).filter(Boolean));
  const pret=c=>c.statut!=='blesse'||/janvier|février|mars/.test(c.retour||''); /* un blessé qui revient après la soirée n'y a pas sa place */
  const libres=COMBATTANTS.filter(c=>!c.ext&&!/^g/.test(c.id)&&!surAff.has(c.id)&&pret(c)).sort((a,b)=>a.dernier-b.dernier).slice(0,5-(caDerniere(s)?1:0));
  h+=`<div class="ca-ks">${caCase('Places',`<span data-can="${s.places}">0</span>`,'capacité de la salle')}
      ${caCase('Billetterie',ouv?'Ouverte':caDc(b),ouv?'places en vente':`ouvre ${caDans(b)}`)}
      ${caCase('Location',`${nb(s.loc)} €`,'payée à la salle')}</div>
    ${caSec('Carte','vide')}
    <div class="ca-rien">${prec?`Elle se compose une fois la soirée du ${caDl(prec.date)} jouée.`:'Elle se compose dans l’écran Carte.'}${s.genre==='phare'?' Une ceinture au moins doit y être en jeu.':''}</div>
    ${caAilJour(caCle(s.date)).map(x=>`<div class="ca-meme"><span class="ca-sm2">Le même soir</span>${caAilTxt(x)}</div>`).join('')}
    ${(()=>{const der=caDerniere(s);if(!der)return '';const pc=Math.round(der.public/der.places*100);
      return `${caSec(`${esc(s.salle)}, la dernière fois`,`<button class="ca-a" data-caresu="${der.n}">Les résultats ›</button>`)}
      <div class="ca-salle"><span><b class="T">${nb(der.public)}</b> spectateurs sur ${nb(der.places)}</span><span class="ca-jg"><i style="--p:${pc}%"></i></span><span class="sous">Fight Night ${der.n}, le ${caDa(der.date)} · ${pc} % de la salle</span></div>`;})()}
    ${caSec('Plus longues absences',(()=>{const c=caAvenir().find(x=>x.carte);return c?`hors carte du ${caDc(c.date)}`:'';})())}
    <div class="ca-lib">${libres.map(c=>`<div class="ca-li"><span class="ca-ln"><span class="ca-cn">${lien(c)}</span><span class="ca-lc">${esc(rsCatC(c.cat))} · ${bilan(c)}</span></span><span class="ca-ld">${depuis(c.dernier)}</span><span class="ca-le">${etat(c)}</span></div>`).join('')}</div>
    ${caRetraitHtml(s)}`;
  return h;
}
function caPasseeHtml(s){
  const r=rsSoiree(s.n),pc=Math.round(s.public/s.places*100);
  let h=caBanSoiree(s);
  h+=`<div class="ca-ks">${caCase('Spectateurs',`<span data-can="${s.public}">0</span>`,`sur ${nb(s.places)} · ${pc} %`,'',`<span class="ca-jg"><i style="--p:${pc}%"></i></span>`)}
      ${caReste(s.n)}
      ${caCase('La ceinture',s.titre?esc(s.ceinture[0].toUpperCase()+s.ceinture.slice(1)):'—',s.titre?esc(rsCatL(s.titre)):'pas de titre en jeu')}</div>
    ${caSec('L’enjeu')}<div class="ca-rien ca-blanc">${esc(s.enjeu)}</div>
    ${caSec('Carte principale',`<button class="ca-a" data-caresu="${s.n}">Les résultats ›</button>`)}
    <div class="ca-cls">${(r&&r.combats?r.combats.slice(0,4):[]).map(x=>`<div class="ca-cl"><span class="marque octr v ca-v">V</span><span class="ca-cn">${lien(rsW(x))}</span><span class="ca-vs">bat</span><span class="ca-cn ca-gris">${lien(rsL(x))}</span>
      <span class="ca-cc">${caMeth(x)}</span></div>`).join('')}</div>
    ${caPrimes(r)}`;
  return h;
}
/** Ce qu'il reste d'une soirée jouée (Finances) : recettes moins dépenses. */
function caReste(n){let o=null;try{o=typeof fiSoiree==='function'?fiSoiree(n):null;}catch(e){o=null;}
  if(!o||typeof o.net!=='number')return caCase('Ce qu’il reste','—','');
  return caCase('Ce qu’il reste',`<span style="color:${o.net>=0?'var(--vert)':'var(--neg)'}">${o.net>=0?'+':'−'} ${nb(Math.abs(o.net))} €</span>`,'bilan de la soirée');}
/** Les primes d'une soirée jouée, en médailles (une ligne par prime). */
function caPrimes(r){
  if(!r||!r.combats)return '';const g={};
  r.combats.forEach(x=>['a','b'].forEach(sd=>((x.pr||{})[sd]||[]).forEach(p=>{(g[p]=g[p]||[]).push(sd==='a'?x.A:x.B);})));
  const l=Object.keys(RS_PR).filter(p=>g[p]);if(!l.length)return '';
  return `${caSec('Primes')}<div class="ca-cls">${l.map(p=>`<div class="ca-cl">${rsMedaille(p,26,r.n)}<span class="ca-pn">${esc(RS_PR[p])}</span><span class="ca-cc ca-pq"><span>${g[p].slice(0,2).map(c=>lien(c)).join(', ')}${g[p].length>2?` <span class="ca-vs">et ${g[p].length-2} autre${g[p].length>3?'s':''}</span>`:''}</span></span></div>`).join('')}</div>`;
}
const caMeth=f=>f.meth==='Décision'?`Décision ${esc(f.det)}`:`${f.meth==='KO'?'KO':'Soumission'} · ${rsOrd(f.rd)} round`;

/** Le mois d'un jour : ses rendez-vous et ses soirées, dans l'ordre. */
function caAgenda(d){
  const m=d.getMonth(),an=d.getFullYear(),dm=x=>x.getFullYear()===an&&x.getMonth()===m;
  return caRdv().filter(e=>dm(e.d)).map(e=>({d:e.d,t:e.t,go:e.go,soiree:e.soiree}))
    .concat(caToutes().filter(x=>dm(x.date)).map(x=>({d:x.date,t:`<b>${esc(x.passee?`Fight Night ${x.n}`:x.lab)}</b> · ${esc(caAffiche(x))}, ${esc(x.ville)}`,s:x})))
    .concat(CA_AILLEURS.filter(x=>dm(x.d)).map(x=>({d:x.d,t:caAilTxt(x),ail:true}))).sort((a,b)=>a.d-b.d);
}
/** Un jour sans soirée : ses rendez-vous, puis poser une soirée si la date est assez loin. */
function caJourHtml(k){
  const d=caDe(k),rdv=caRdvJour(k),auj=caAuj(),ouvert=caLibre(d);
  const av=caAvenir(),avant=av.filter(x=>x.date<d).pop(),apres=av.find(x=>x.date>d);
  const ecart=[avant?`${caEcart(caJours(avant.date,d))} après le ${caDc(avant.date)}`:'',apres?`${caEcart(caJours(d,apres.date))} avant le ${caDc(apres.date)}`:''].filter(Boolean).join(' · ');
  const ms=caAilJour(k);
  let h=caBan('gris',`${ouvert?'Poser une soirée':d<auj?'Passé':rdv.length?'Un rendez-vous':'Ailleurs'} · ${caDans(d)}`,esc(caLong(d).replace(/^./,c=>c.toUpperCase())),ouvert?ecart:'');
  if(ouvert&&ms.length)h+=`<div class="ca-meme">${ms.map(x=>`<span class="ca-sm2">Le même soir</span>${caAilTxt(x)}`).join('')}</div>`;
  const agenda=!ouvert&&caAgenda(d).length>1;
  if(rdv.length&&!agenda)h+=`${caSec('Ce jour-là')}<div class="ca-evs">${rdv.map(e=>`<div class="ca-evl"><i class="ca-rdv"></i><span>${e.t}</span>${e.go?`<button class="ca-a" data-cago="${e.go[0]}">${e.go[1]} ›</button>`:e.soiree?`<button class="ca-a" data-casel="${e.soiree}">La soirée ›</button>`:''}</div>`).join('')}</div>`;
  if(!ouvert){
    /* le mois autour de ce jour : ses rendez-vous et ses soirées, dans l'ordre */
    if(agenda)h+=`${caSec(`En ${MOIS[d.getMonth()]}`)}<div class="ca-ag">${caAgenda(d).map(x=>`<div class="ca-agl ${caCle(x.d)===k?'on':''} ${x.ail?'ail':''}"><b class="T">${caDc(x.d)}</b><span>${x.t}</span>${x.s?`<button class="ca-a" data-casel="${x.s.id}">La soirée ›</button>`:x.go?`<button class="ca-a" data-cago="${x.go[0]}">${x.go[1]} ›</button>`:x.soiree?`<button class="ca-a" data-casel="${x.soiree}">La soirée ›</button>`:''}</div>`).join('')}</div>`;
    if(d>=auj)h+=`<div class="ca-pied"><span class="ca-note">${ico('alerte',18)}<span>${caPourquoi(d)}</span></span></div>`;return h;}
  const T=S.ca.type,sa=caSalleId(S.ca.salle),phares=av.filter(x=>x.genre==='phare');
  const conflit=T==='phare'&&phares.find(x=>x.date.getFullYear()===d.getFullYear()&&x.date.getMonth()===d.getMonth());
  const nfn=(S.rs.apres?63:62)+av.filter(x=>x.genre==='fn'&&x.date<d).length+1,nph=phares.filter(x=>x.date<d).length+1;
  const nom=T==='phare'?`Split ${nph}`:`Fight Night ${nfn}`;
  const genre=(v,t,s)=>`<button class="ca-ty oct ${T===v?'on':''}" data-catype="${v}"><span class="oct"><b class="T">${t}</b><span class="sous">${s}</span></span></button>`;
  const ligne=x=>{const der=caDerniere(x);
    return `<button class="ca-sl oct ${x.id===sa.id?'on':''}" data-casalle="${x.id}"><span class="oct">
      <span><b>${esc(x.ville)}</b><span class="sous">${esc(x.salle)}</span></span>
      <span><b>${nb(x.places)}</b><span class="sous">places</span></span>
      <span>${der?`<b>${nb(der.public)}</b><span class="sous">${der.public===CA_RECORD?'ton record · ':'le '}${caDa(der.date)}</span>`:x.id==='lille'?'<b>—</b><span class="sous">première le 16 févr.</span>':'<b>—</b><span class="sous">jamais</span>'}</span>
      <span><b>${nb(x.loc)} €</b></span></span></button>`;};
  h+=`${caSec('Genre')}
    <div class="ca-tys ${rdv.length?'serre':''}">${genre('fn','Fight Night','nommée par son combat principal')}${genre('phare','Soirée phare',`« Split ${nph} » · un titre en jeu`)}</div>
    ${caSec('Salle')}
    <div class="ca-sh"><span>Salle</span><span>Places</span><span>Dernière soirée</span><span>Location</span></div>
    <div class="ca-sls ${rdv.length?'serre':''}">${CA_SALLES.map(ligne).join('')}</div>
    <div class="ca-pied">${conflit?`<span class="ca-note">${ico('alerte',18)}<span><b>Impossible : ${esc(conflit.court)} est déjà le ${caDl(conflit.date)}.</b> Une soirée phare par mois : choisis un autre mois, ou une fight night.</span></span>`
      :`<span class="ca-note ca-res"><b class="T">${esc(nom)}</b><span>${esc(sa.salle)}, ${esc(sa.ville)} · ${nb(sa.loc)} €</span></span><button class="bouton jaune cj oct" data-caposer="${k}">Poser la soirée</button>`}</div>`;
  return h;
}
/** Confirmer un retrait, en chiffres (charte S6). */
function caConfirmHtml(s){
  const c=caCout(s);
  return caBanSoiree(s)+`<div class="ca-conf"><h2 class="T ca-ct2">Retirer cette soirée ?</h2>
    <div class="ca-cfl"><span>Date</span><b>${caLong(s.date)}</b></div>
    <div class="ca-cfl"><span>Salle</span><b>${esc(s.salle)}, ${esc(s.ville)}</b></div>
    <div class="ca-cfl"><span>Coût</span><b>${c.e?`${nb(c.e)} €, ${Math.round(c.p*100)} % de la location (${nb(s.loc)} €)`:'Aucun'}</b></div>
    <div class="ca-cfl"><span>Ensuite</span><b>Le ${caDl(s.date)} redevient libre.</b></div>
    <div class="ca-cfb"><button class="bouton oct" data-carevenir>Revenir</button><button class="bouton jaune cj oct" data-caconfirme="${s.id}">Retirer</button></div></div>`;
}

function caDroite(){
  let h,cle;
  const r=S.ca.retrait&&caParId(S.ca.retrait);
  if(r&&caCout(r)){h=caConfirmHtml(r);cle='r'+r.id;}
  else if(S.ca.jour){h=caJourHtml(S.ca.jour);cle=S.ca.jour;}
  else{const s=caSel();h=s.passee?caPasseeHtml(s):caAvenirHtml(s);cle=s.id;}
  return pan(`<div class="ca-d ${S.ca.anim?'apparait':''}" data-cle="${esc(cle)}">${h}</div>`,'height:100%','ca-dr');
}
function caHtml(){caGarder();return `<div class="ca">${caGauche()}${caDroite()}</div>`;}

/* ---- Actions ---- */
function caPoser(k){
  const d=caDe(k),sa=caSalleId(S.ca.salle);
  const s={id:'p'+k,date:d,ville:sa.ville,salle:sa.salle,places:sa.places,genre:S.ca.type==='phare'?'phare':'fn',vide:true};
  S.ca.posees.push(s);
  caPas(()=>{S.ca.jour=null;S.ca.sel=s.id;S.ca.anim=true;});
  const p=caParId(s.id);
  toast(`${esc(p.court)} posée : ${caLong(d).toLowerCase()}, ${esc(sa.salle)}, ${esc(sa.ville)}.`);
}
function caRetirer(id){
  const s=caParId(id),c=caCout(s);if(!c)return;
  S.ca.retirees.push(id);
  caPas(()=>{S.ca.sel=null;S.ca.retrait=null;S.ca.anim=true;});
  toast(`${esc(s.court)} retirée${c.e?` : ${nb(c.e)} € versés à la salle`:''}. Le ${caDl(s.date)} est libre.`);
}

/* ---- Mouvement : les chiffres défilent ---- */
function caCompter(){document.querySelectorAll('.ca [data-can]').forEach((e,i)=>{const v=+e.dataset.can,t0=performance.now()+i*40;
  const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/650)),x=1-Math.pow(1-k,3);e.textContent=nb(Math.round(v*x));if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(()=>{e.textContent=nb(v);},1400);});}

/** La hauteur d'une semaine : les six semaines remplissent la place laissée par le titre du mois et ses soirées. */
function caAjuster(){
  /* la hauteur d'une semaine : six semaines et les soirées du mois qui en a le plus doivent tenir dans la case d'un mois */
  const mo=document.querySelector('.ca-mois');if(!mo)return;const g=mo.querySelector('.ca-grille'),h=mo.querySelector('.ca-mh'),se=mo.querySelector('.ca-sem');
  const nl=Math.max(0,...[...document.querySelectorAll('.ca-mls')].map(x=>x.children.length)),fixe=h.offsetHeight+se.offsetHeight+18+nl*32+8,rh=Math.max(30,Math.min(48,Math.floor((mo.clientHeight-fixe)/6)));
  document.querySelectorAll('.ca-grille').forEach(x=>x.style.setProperty('--rh',rh+'px'));}

/* ---- Branchement dans le cadre ---- */
const caRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='calendrier'){caRendreBase();return;}
  rendreBarre();rendreEntete('Calendrier');$('#alerte').classList.remove('af-al');
  if(S.rs.apres&&typeof rsAlerte==='function')rsAlerte();else msAlerte();
  $('#corps').style.top='152px';
  $('#corps').innerHTML=caHtml();caAjuster();
  if(S.ca.anim)caCompter();else document.querySelectorAll('.ca [data-can]').forEach(e=>e.textContent=nb(+e.dataset.can));
  S.ca.anim=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const caAllerBase=aller;
aller=function(ec){
  if(ec!=='calendrier'){caAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.ca.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : la période, la soirée, le jour et la confirmation sont des pas du parcours. */
function caPas(maj){S.hist.push({ca:caEtat()});S.futur=[];maj();rendre();}
const caRetourBase=retour;
retour=function(){
  while(S.ecran!=='calendrier'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].ca)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='calendrier'&&!S.fiche&&h&&h.ca){S.hist.pop();S.futur.push({ca:caEtat()});Object.assign(S.ca,JSON.parse(h.ca),{anim:true});rendre();return;}
  caRetourBase();
};
function caAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='calendrier'&&!S.fiche&&f&&f.ca){S.futur.pop();S.hist.push({ca:caEtat()});Object.assign(S.ca,JSON.parse(f.ca),{anim:true});rendre();return true;}
  return false;
}
const caOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='calendrier'){caOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* Continuer : le jour avance ; le calendrier suit (aujourd'hui, « dans … jours », la première date libre). */
const caContinuerBase=continuer;
continuer=function(){caContinuerBase();if(S.ecran==='calendrier')setTimeout(()=>{if(S.ecran==='calendrier'&&!S.fiche)rendre();},1500);};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='calendrier')return;
  const t=e.target;let el;
  if(t.closest('#bAvant')&&!S.fiche&&caAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.ca){e.stopImmediatePropagation();retour();return;}}
  if(t.closest('#bContinuer')){e.stopImmediatePropagation();continuer();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.ca,stop=()=>e.stopImmediatePropagation();
  if((el=t.closest('[data-caper]'))){stop();const v=el.dataset.caper;if(v!==caPer())caPas(()=>{F.per=v;F.anim=true;});return;}
  if((el=t.closest('[data-casel]'))){stop();const v=el.dataset.casel,s=caParId(v);
    if(v!==(caSel()||{}).id||F.jour||F.retrait)caPas(()=>{F.sel=v;F.jour=null;F.retrait=null;F.anim=true;const p=caPerDe(s.date);if(CA_PER.includes(p))F.per=p;});return;}
  if((el=t.closest('[data-cajour]'))){stop();const v=el.dataset.cajour;if(v!==F.jour)caPas(()=>{F.jour=v;F.retrait=null;F.anim=true;});return;}
  if((el=t.closest('[data-caferme]'))){stop();toast(caPourquoi(caDe(el.dataset.caferme)));return;}
  if((el=t.closest('[data-catype]'))){stop();F.type=el.dataset.catype;rendre();return;}
  if((el=t.closest('[data-casalle]'))){stop();F.salle=el.dataset.casalle;rendre();return;}
  if((el=t.closest('[data-caposer]'))){stop();caPoser(el.dataset.caposer);return;}
  if((el=t.closest('[data-caretirer]'))){stop();caPas(()=>{F.retrait=el.dataset.caretirer;F.anim=true;});return;}
  if((el=t.closest('[data-caconfirme]'))){stop();caRetirer(el.dataset.caconfirme);return;}
  if(t.closest('[data-carevenir]')){stop();retour();return;}
  if((el=t.closest('[data-caresu]'))){stop();S.rs.sel=+el.dataset.caresu;S.rs.vue='resultats';S.rs.det=null;aller('resultats');return;}
  if((el=t.closest('[data-cago]'))){stop();const v=el.dataset.cago;if(v==='carriere'){S.og.onglet='carriere';aller('organisation');return;}aller(v);return;}
},true);

/* ---- Lancement : ?ecran=calendrier, options periode=2026-1|2026-2|2027-1|2027-2, soiree=<56…64>, jour=AAAA-MM-JJ, type=fn|phare, salle=<id>,
   retrait=<id>, fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='calendrier')return;
  if(q.get('periode'))S.ca.per=q.get('periode');if(q.get('type'))S.ca.type=q.get('type');if(q.get('salle'))S.ca.salle=q.get('salle');
  if(q.get('soiree')){S.ca.sel=q.get('soiree');const s=caParId(S.ca.sel);if(s&&!q.get('periode'))S.ca.per=caPerDe(s.date);}
  if(q.get('retrait'))S.ca.retrait=q.get('retrait');
  if(q.get('jour')){S.ca.jour=q.get('jour');if(!q.get('periode'))S.ca.per=caPerDe(caDe(S.ca.jour));}
  S.ecran='calendrier';S.hist=['accueil'];S.ca.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
