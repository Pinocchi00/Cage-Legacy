"use strict";
/* Maquette lot 1 — l'Arrivée (R1 à R4, Q1a, Q1b, Q3, Q4, point tranché n° 8). Préfixe pp- (classes), pp / PP_ (fonctions, constantes).
   Chargé en dernier. Le jour où le joueur est embauché chez Split : lundi 4 janvier 2027.
   Une ouverture (le lever de rideau : « Split t'embauche »), trois étapes construites pareil (un bandeau sur le tunnel, puis le contenu),
   puis l'Accueil de ce jour-là.
     1. Split : l'organisation, ton poste, ta première soirée, ton équipe ;
     2. Ton contrat : le contrat dans le bandeau, puis les trois objectifs du patron, chacun avec ce qui manque (Q3 : fusion) ;
     3. Tes espoirs : 2 sur 6 (Q4), en cartes, sans histoire ; le nom choisi vole jusqu'à sa case du bandeau ;
        la fiche s'ouvre par-dessus sans sauter l'étape (R4, T7).
   Le prédécesseur n'apparaît pas (Q1b : seulement dans l'histoire de l'organisation, Ta carrière).
   Données reprises : Effectif, Classements, Organisation, Ta carrière, Messages, Résultats, Calendrier, Infirmerie.
   Le 4 janvier est déduit du 12 : carte 1 / 4 (Nana–Mezouar, annoncé le 4 par Cage Hebdo), 2 140 places vendues,
   Marco à Turin (retour le 8), Rizzo blessé depuis le 28 décembre (Infirmerie). */

const PP_CLE='maquette-arrivee-1';
const PP_ETAPES=['split','contrat','espoirs'],PP_NOMS=['Split','Ton contrat','Tes espoirs'],PP_SUITE=['Ton contrat','Tes espoirs','Entrer chez Split'];
const PP_JOUR=new Date(2027,0,4),PP_PREV=2140,PP_PLACES=4000;
const ppCalme=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Six espoirs de Split, une particularité chacun, vérifiée dans les données (Classements, Effectif). */
const PP_ESPOIRS=[
  {id:'rizzo',part:'Invaincu : 6 combats, 6 victoires'},
  {id:'musaev',part:'5 de ses 7 victoires par soumission'},
  {id:'rachidi',part:'5 victoires de suite'},
  {id:'gpoidslourd1',part:'Le plus jeune du top 20 mondial'},
  {id:'gpoidsmouchef12',part:'14 victoires à 22 ans'},
  {id:'gpoidsplume2',part:'Fausse garde : il combat en gaucher'},
];
const PP_ESP_COURT={rizzo:'Invaincu, 6 victoires',musaev:'Cinq victoires sur sept par soumission',rachidi:'Cinq victoires de suite',
  gpoidslourd1:'Le plus jeune du top 20 mondial',gpoidsmouchef12:'14 victoires à 22 ans',gpoidsplume2:'Combat en gaucher'};

S.pp=Object.assign({etape:'split',choix:[],anim:true,actif:false,accueil:false,dir:1,bandeH:0,vol:null},(()=>{try{const v=JSON.parse(localStorage.getItem(PP_CLE))||{},o={};
  if(PP_ETAPES.includes(v.etape)||v.etape==='accueil')o.etape=v.etape;
  if(Array.isArray(v.choix))o.choix=v.choix.filter(id=>PP_ESPOIRS.some(x=>x.id===id)).slice(0,2);return o;}catch(e){return {};}})());
function ppGarder(){try{localStorage.setItem(PP_CLE,JSON.stringify({etape:S.pp.accueil?'accueil':S.pp.etape,choix:S.pp.choix}));}catch(e){}}

Object.assign(P,{
  ppCoche:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  ppCible:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  ppFleche:'<path d="M4 12h15M13 6l6 6-6 6"/>',
});

/* ---- Le monde du 4 janvier : ce qui diffère du 12 ---- */
function ppMonde(){
  S.date=new Date(PP_JOUR);S.jours=Math.round((new Date(2027,1,16)-PP_JOUR)/864e5);S.preventes=PP_PREV;S.recruteur='voyage';
  for(let i=1;i<4;i++)S.af.m[i]={a:null,b:null};
  for(const id of ['rachidi','meziane']){const c=parId(id);if(c){c.statut='dispo';delete c.affiche;}}
  S.pp.actif=true;
}
const ppAbsents=()=>INFIRMERIE.filter(b=>b.debut<=PP_JOUR&&b.fin>PP_JOUR);

/* ---- L'ouverture : le lever de rideau, une seule fois par visite ---- */
function ppOuverture(){
  if(ppCalme()||$('.pp-ouv'))return false;
  const o=document.createElement('div');o.className='pp-ouv';
  o.innerHTML=`<i class="pp-ouv-tun"></i>
    <div class="pp-ouv-t">
      <span class="pp-ouv-d">Lundi 4 janvier 2027 · Lyon</span>
      <span class="pp-ouv-q">Bienvenue chez</span>
      <span class="T pp-ouv-s">Split</span>
      <span class="pp-ouv-l"></span>
      <span class="pp-ouv-p"><span class="etiq">Split t’embauche comme</span><span class="T">Matchmaker</span></span>
    </div>`;
  $('.scene').appendChild(o);
  const fin=()=>{if(!o.isConnected)return;o.classList.add('fin');S.pp.anim=true;rendre();setTimeout(()=>o.remove(),700);};
  o.addEventListener('click',fin);setTimeout(fin,3900);
  return true;
}

/* ---- Les étapes, en haut : le numéro devient une coche une fois passée ---- */
function ppOnglets(){
  const i0=PP_ETAPES.indexOf(S.pp.etape);
  return `<div class="pp-ongs">${PP_ETAPES.map((k,i)=>`${i?`<i class="pp-ongl ${i<=i0?'fait':''}"></i>`:''}<button class="onglet oct ${i===i0?'ouvert':''}" data-ppet="${k}">
      <span class="pp-onn octr ${i<i0?'fait':''}">${i<i0?ico('ppCoche',16,3):i+1}</span>${PP_NOMS[i]}${k==='espoirs'&&S.pp.choix.length<2?'<span class="onglet-mq octr"></span>':''}</button>`).join('')}</div>`;
}

/* ---- Le bandeau, commun aux trois étapes : le tunnel et le logo à gauche, toujours au même endroit ---- */
function ppBande(){
  const e=S.pp.etape;let c;
  if(e==='split'){
    /* Quatre cases, un thème chacune : le classement, l'argent, la salle, les ceintures. Tout est compté dans les données
       (Organisation, Finances, Résultats, Effectif). */
    const moi=COMBATTANTS.filter(x=>!x.ext),sp=ogClasse().find(x=>x.nom==='Split');
    const s26=RS_SOIREES.filter(x=>x.n<63&&x.public&&new Date(x.date).getFullYear()===2026).sort((a,b)=>a.n-b.n);
    const vend=s26.reduce((t,x)=>t+x.public[0],0),cap=s26.reduce((t,x)=>t+x.public[1],0),pleines=s26.filter(x=>x.public[0]>=x.public[1]).length;
    /* Le classement : la mesure où Split est le plus mal placé (les quatre mesures du classement des huit). */
    const MES={p_pub:'au public moyen',p_recN:'au record de spectateurs',p_v5:'au top 5 mondial',p_c30:'au top 30 mondial'};
    const faible=Object.keys(MES).sort((a,b)=>sp[b]-sp[a])[0];
    /* L'argent : la caisse au 4 janvier et son niveau après chaque soirée de 2026 (écran Finances). */
    const ca=fiCaisse(),niv=ca.pts.filter(x=>!x.avant).map(x=>x.c),nMax=Math.max(...niv),k=v=>Math.round(v/1000);
    /* Les ceintures : celles mises en jeu en 2026. */
    const champs=moi.filter(x=>x.rang==='C'),titres=s26.filter(x=>x.titre),enJeu=new Set(titres.map(x=>x.titre));
    const vis=[
      `<span class="pp-v8">${Array.from({length:8},(_,n)=>`<i class="octr ${n+1===sp.rang?'ici':''}" style="--d:${700+n*70}ms">${n+1}</i>`).join('')}</span>`,
      `<span class="pp-vb pp-vbc">${niv.map((v,n)=>`<i style="--h:${Math.max(4,Math.round(v/nMax*100))}%;--d:${800+n*70}ms" title="${n?`Après la Fight Night ${ca.pts.filter(x=>!x.avant)[n].o.n}`:'Le 1er janvier 2026'} : ${nb(v)} €"></i>`).join('')}</span>`,
      `<span class="pp-vh pp-vhl" title="${nb(vend)} places vendues sur ${nb(cap)} en 2026"><i style="--p:${vend/cap*100}%"></i></span>`,
      `<span class="pp-vc">${champs.map((x,n)=>`<i class="octr ${enJeu.has(x.cat)?'':'att'}" style="--d:${900+n*60}ms" title="${esc(x.cat)}${enJeu.has(x.cat)?' : mise en jeu en 2026':''}"></i>`).join('')}</span>`,
    ];
    const ch=(v,suf,l,so,i)=>`<div class="pp-hc" style="animation-delay:${500+i*110}ms"><div class="pp-hcr"><b class="T"><span data-ppn="${v}">${nb(v)}</span>${suf}</b>${vis[i]}</div><span class="pp-hcl">${l}</span><span class="sous">${so}</span></div>`;
    /* Le fil du bas : ce qui ne figure pas déjà au-dessus. */
    const dc=d=>`${d.getDate()} ${['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'][d.getMonth()]} ${d.getFullYear()}`;
    const rec=[...s26].sort((x,y)=>y.public[0]-x.public[0])[0],der=s26[s26.length-1],dev=ogClasse().find(x=>x.rang===sp.rang-1);
    const m=der.main,ga=m&&parId(m.g==='a'?m.a:m.b),pe=m&&(parId(m.g==='a'?m.b:m.a)||{nom:m.g==='a'?m.b:m.a});
    const fil=[
      `Record : <b>${nb(rec.public[0])} spectateurs</b> à ${esc(rec.ville)}, le ${dc(new Date(rec.date))}`,
      `Dernière soirée : <b>Fight Night ${der.n}</b>, ${esc(der.ville)}, le ${dc(new Date(der.date))}${ga?` · <b>${esc(ga.nom)}</b> bat ${esc(pe.nom)}`:''}`,
      `Juste devant Split : <b>${esc(dev.court||dev.nom)}</b>, ${ogOrd(dev.rang)} des huit`,
    ].map(t=>`<span>${t}</span><i class="octr"></i>`).join('');
    c=`<div class="pp-hid"><span class="T pp-split">Split</span><span class="pp-ville">Lyon · depuis 2004</span></div>
      <div class="pp-hposte"><span class="etiq">Ton poste</span><span class="T pp-poste">Matchmaker</span><span class="pp-ville">depuis ce matin</span></div>
      <div class="pp-hch">${ch(sp.rang,'<small>e</small>','des huit organisations',`point faible : ${ogOrd(sp[faible])} ${MES[faible]}`,0)}${ch(k(ca.c),'<small> k€</small>','en caisse au 4 janvier',`${ca.c>=FI_CAISSE0?'+':'−'} ${nb(k(Math.abs(ca.c-FI_CAISSE0)))} k€ sur 2026`,1)}${ch(Math.round(vend/cap*100),' %','des places vendues en 2026',`${pleines} salle pleine sur ${s26.length} soirées`,2)}${ch(titres.length,'','combats pour un titre en 2026',`<i class="pp-lg octr"></i> ceinture mise en jeu : ${enJeu.size} sur ${champs.length}`,3)}</div>
      <div class="pp-fil"><span class="pp-filt">Split en bref</span><div class="pp-filv"><div class="pp-fild"><span class="pp-fc">${fil}</span><span class="pp-fc pp-fc2" aria-hidden="true">${fil}</span></div></div></div>`;
  }else if(e==='contrat'){
    const f=(l,v,s,i)=>`<div class="pp-bf" style="animation-delay:${250+i*90}ms"><span class="etiq">${l}</span><b class="T">${v}</b><span class="sous">${s}</span></div>`;
    c=`<div class="pp-btit"><span class="T">Ton contrat</span><span class="pp-bphr">Ce que tu signes, et ce que le patron attend de ta saison.</span></div>
      <div class="pp-bfs">${f('Durée','Une saison','jusqu’au 31 déc. 2027',0)}${f('Salaire','3 200 €','par mois',1)}${f('Bilan de mi-saison','Juillet','le 1er, avec le patron',2)}
        <div class="pp-bf" style="animation-delay:520ms"><span class="etiq">Ta réputation</span><span class="pp-rep">${['En France','En Europe','Reconnu','Respecté','Une référence'].map(t=>`<i class="octr" title="${t}"></i>`).join('')}</span><span class="sous">pas encore établie</span></div></div>`;
  }else{
    const slot=i=>{const id=S.pp.choix[i],x=id&&parId(id);
      return `<div class="pp-slot oct ${x?'plein':''} ${S.pp.vol===id&&x?'arrive':''}" data-slot="${i}"><div class="oct">
        <span class="etiq">Espoir ${i+1}</span>${x?`<b class="T pp-slotn"><span class="nom" data-fiche="${x.id}">${esc(x.nom)}</span></b><span class="sous">${esc(x.cat.replace(/ F$/,' féminin'))} · ${x.age} ans</span>`
          :'<b class="T pp-slotn vide">À choisir</b><span class="sous">un des six ci-dessous</span>'}</div></div>`;};
    c=`<div class="pp-btit"><span class="T">Tes espoirs</span><span class="pp-bphr">Choisis-en deux. Leïla te donnera de leurs nouvelles chaque semaine.</span></div>
      <div class="pp-slots">${slot(0)}${slot(1)}</div>`;
  }
  return `<div class="pp-band pp-band-${e}">${e==='split'?'<span class="pp-tunc"><i class="pp-tun"></i></span>':'<i class="pp-tun"></i>'}<i class="pp-reflet"></i><span class="pp-emb">${LOGO}</span>${c}</div>`;
}

/* ---- Étape 1 : Split ---- */
function ppSplit(){
  const nana=parId('nana'),mez=parId('mezouar'),abs=ppAbsents();
  const st=(ini,nom,role,val,sous,col='')=>`<div class="pp-st"><span class="pp-ini octr">${ini}</span><div class="pp-stn"><b>${nom}</b><span class="sous">${role}</span></div>
      <div class="pp-stv"><b style="${col?`color:${col}`:''}">${val}</b><span class="sous">${sous}</span></div></div>`;
  return `<div class="pp-bas">
      ${pan(`${titre('Ta première soirée',`dans ${S.jours} jours`)}
        <div class="pp-soir">
          <div class="pp-sd"><span class="T pp-sdj">16 févr.</span><span class="pp-sdl">Forum de Lille</span><span class="sous">${nb(PP_PLACES)} places</span></div>
          <div class="pp-aff">
            <div class="pp-af"><span class="pp-ac oct cj fin" title="Champion">C</span><span class="T pp-an">${lien(nana)}</span></div>
            <span class="T pp-vs">VS</span>
            <div class="pp-af"><span class="T pp-an">${lien(mez)}</span></div>
            <div class="pp-aen">Ceinture des poids légers · 5 rounds</div>
            <div class="pp-ahist">Mezouar, n° 1 du classement, a battu Nana par soumission le 4 août 2025.</div>
          </div>
        </div>
        <div class="pp-cases">
          <div class="pp-case"><span class="etiq">La carte</span><b class="T" style="color:var(--jaune)">1 / 4</b><span class="sous">3 combats à trouver</span></div>
          <div class="pp-case"><span class="etiq">Les préventes</span><b class="T"><span data-ppn="${S.preventes}">${nb(S.preventes)}</span><small> / ${nb(PP_PLACES)}</small></b><span class="sous pp-js"><span class="jauge pp-j"><i style="width:${S.preventes/PP_PLACES*100}%;background:var(--blanc)"></i></span>${Math.round(S.preventes/PP_PLACES*100)} % des places</span></div>
          <div class="pp-case"><span class="etiq">Le billet</span><b class="T">66 €</b><span class="sous">prix moyen d’une place</span></div>
        </div>`,'','pp-p pp-psoir')}
      ${pan(`${titre('Ton équipe')}
        <div class="pp-sts">
          ${st('GV','Gérard Vasseur','Le patron, fondateur de Split','Il attend de voir','bilan le 1er juillet')}
          ${st('LM','Leïla Malika','Ton adjointe','Disponible','pour un avis, à la demande','var(--vert)')}
          ${st('MF','Marco Ferri','Ton recruteur','En voyage à Turin','retour le 8 janv.')}
          ${st('HR','Dr Hélène Roux','Le médecin de Split',`${abs.length} absents`,`${abs.filter(b=>/Suspension/.test(b.quoi)).length} suspendu, ${abs.filter(b=>!/Suspension/.test(b.quoi)).length} blessés`)}
        </div>`,'','pp-p pp-peq')}
    </div>`;
}

/* ---- Étape 2 : Ton contrat, et ce qui manque pour chaque objectif (Q3 : fusion) — la forme de la première passe, gardée le 19/11 ---- */
function ppObjectifs(){
  const l=ogClasse(),sp=l.find(x=>x.nom==='Split'),dev=l.filter(x=>x.rang>=4&&x.rang<sp.rang).map(x=>esc(x.court||x.nom));
  const lourd=msMeilleur(c=>!c.ext&&c.cat==='Poids lourd'),pet=parId('gpoidslourd1'),reste=PP_PLACES-S.preventes;
  return [
    {type:'rang',lab:'Finir la saison dans les quatre premières',v:sp.rang,but:4,auj:ogOrd(sp.rang),auS:'des huit',vis:'4e',viS:'ou mieux',
     manque:`Passer ${dev.join(' et ')}.`},
    {type:'mondial',lab:'Un poids lourd de Split dans le top 5 mondial',v:lourd.mondial,but:5,auj:`n° ${lourd.mondial}`,auS:lien(lourd),vis:'n° 5',viS:'ou mieux',
     manque:`${lourd.mondial-5} places à gagner. ${esc(lourd.nom)} a ${lourd.age} ans ; derrière lui, ${lien(pet)} est n° ${pet.mondial}.`},
    {type:'jauge',lab:'Remplir le Forum de Lille',v:S.preventes,but:PP_PLACES,auj:`<span data-ppn="${S.preventes}">${nb(S.preventes)}</span>`,auS:'places vendues',vis:nb(PP_PLACES),viS:'le 16 févr.',
     manque:`${nb(reste)} places en ${S.jours} jours, environ ${Math.round(reste/S.jours)} par jour.`},
  ];
}
function ppObj(o,i){
  let vis;
  if(o.type==='jauge')vis=`<span class="pp2-oj"><i style="--p:${Math.max(2,o.v/o.but*100)}%"></i></span><span class="pp2-ojl"><span>0</span><span>${nb(o.but)} places</span></span>`;
  else{const N=o.type==='rang'?8:10;vis=`<span class="pp2-or">${Array.from({length:N},(_,k)=>k+1).map(n=>`<span class="octr ${n===o.v?'ici':''} ${n<=o.but?'but':''}">${n}</span>`).join('')}</span>
    <span class="pp2-orl"><i class="but"></i>${o.type==='rang'?'les places visées':'le top 5 visé'}<i class="ici"></i>${o.type==='rang'?'Split aujourd’hui':'le mieux classé'}</span>`;}
  return `<div class="pp2-o oct" style="animation-delay:${180+i*110}ms"><div class="pp2-ol"><span class="pp2-on octr">${i+1}</span>${esc(o.lab)}</div>
    <div class="pp2-og">
      <div class="pp2-ovis">${vis}</div>
      <div class="pp2-ov"><span class="etiq">Aujourd’hui</span><b class="T">${o.auj}</b><span class="sous">${o.auS}</span></div>
      <div class="pp2-ov"><span class="etiq">Il veut</span><b class="T">${o.vis}</b><span class="sous">${o.viS}</span></div>
      <div class="pp2-om"><span class="etiq">Ce qui manque</span><p>${o.manque}</p></div>
    </div></div>`;
}
function ppContrat(){
  const li=(l,v,s)=>`<div class="pp2-cl"><span class="etiq">${l}</span><span class="pp2-clv"><b class="T">${v}</b><span class="sous">${s}</span></span></div>`;
  return `<div class="pp2">
    ${pan(`${titre('Ton contrat','signé le 4 janv.')}
      <div class="pp2-cls">${li('Poste','Matchmaker','chez Split')}${li('Durée','Une saison','du 4 janv. au 31 déc. 2027')}${li('Salaire','3 200 €','par mois')}${li('Bilan de mi-saison','1<span style="text-transform:none">er</span> juillet','avec le patron')}
        ${li('Ta réputation',`<span class="pp-rep">${['En France','En Europe','Reconnu','Respecté','Une référence'].map(t=>`<i class="octr" title="${t}"></i>`).join('')}</span>`,'pas encore établie')}</div>
      <div class="pp2-patron"><span class="pp-ini octr">GV</span><div><b>Gérard Vasseur</b><span class="sous">le patron de Split, qu’il a fondé en 2004</span>
        <p>« Je ne te demande pas de miracle. Je veux voir où tu emmènes Split. »</p></div></div>`,'','pp-p pp2-pcontrat')}
    ${pan(`${titre('Ce qu’il attend de ta saison','jugé le 31 déc.')}
      <div class="pp2-os">${ppObjectifs().map(ppObj).join('')}</div>
      <div class="mc-regle pp2-regle">${ico('ppCible',22,2)}<span>Manqués au 31 déc. : <b>un avertissement</b>. Manqués encore la saison suivante : <b>le renvoi</b>.</span></div>`,'','pp-p pp2-pobj')}
  </div>`;
}

/* ---- Étape 3 : Tes espoirs, 2 sur 6 (Q4) ---- */
function ppCarte(x,i){
  const c=parId(x.id),ch=S.pp.choix.includes(x.id),rang=c.rang==='C'?'Champion':`n° ${c.rang} chez Split`;
  const etatH=c.statut==='blesse'?`<span class="pp-cet neg">${ico('medical',18)}Blessé · retour le 2 févr.</span>`:`<span class="pp-cet ok">${ico('ok',18,3)}Disponible</span>`;
  const [nc,bourse]=c.contrat||[0,'—'];
  return `<div class="pp-c oct ${ch?'choisi':''}" data-ppchoix="${x.id}" style="animation-delay:${120+i*80}ms"><div class="pp-c2 oct"><div class="pp-c3 oct">
    <div class="pp-ch"><span class="etiq">${esc(c.cat.replace(/ F$/,' féminin'))} · ${c.age} ans</span>${etatH}</div>
    <div class="pp-cnm"><span class="pp-cpr">${esc(c.prenom)}${c.surnom?` <span class="pp-surn">« ${esc(c.surnom)} »</span>`:''}</span>
      <span class="T pp-cnom nom" data-fiche="${c.id}">${esc(c.nom)}</span></div>
    <div class="pp-cr"><b class="T pp-cbil">${bilan(c)}</b>${serie(c.serie)}<span class="pp-crg"><b>${rang}</b><span class="sous">n° ${c.mondial} mondial</span></span></div>
    <div class="pp-cst"><span class="pp-tag oct">${esc(c.art||'')}</span><span>${esc(c.style||'')}</span></div>
    <div class="pp-cpa"><span class="etiq">Sa particularité</span><b>${esc(x.part)}</b></div>
    <div class="pp-cf"><span class="sous">${nc} combat${nc>1?'s':''} sous contrat · ${esc(bourse)} par combat</span>
      <span class="pp-cbtn oct"><span class="oct">${ch?`${ico('ppCoche',20,3)}Choisi`:'Choisir'}</span></span></div>
  </div></div></div>`;
}
const ppEspoirs=()=>`<div class="pp-esps">${PP_ESPOIRS.map(ppCarte).join('')}</div>`;

function ppHtml(){
  const corps={split:ppSplit,contrat:ppContrat,espoirs:ppEspoirs}[S.pp.etape]();
  return `<div class="pp pp-e-${S.pp.etape} ${S.pp.anim?'pp-anim':'pp-fixe'}">${ppOnglets()}${S.pp.etape==='contrat'?'':ppBande()}<div class="pp-corps ${S.pp.anim?(S.pp.dir<0?'gauche':'droite'):''}">${corps}</div></div>`;
}

/* ---- En-tête : pas de barre latérale ; le bouton jaune dit où il mène ---- */
function ppEntete(){
  const i=PP_ETAPES.indexOf(S.pp.etape),pret=i===2&&S.pp.choix.length===2;
  $('#entete').innerHTML=`<button class="retour" id="bRetour" title="Retour" ${S.hist.length||S.fiche?'':'disabled'}>${ico('retour',28)}</button>
    <button class="retour" id="bAvant" title="Avancer" ${S.futur.length?'':'disabled'}>${ico('avant',28)}</button>
    <div class="plaque">Ton arrivée</div><span style="margin-left:auto"></span>
    <div class="boite"><span class="T" id="dateH">${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}</span></div>
    <div class="boite"><span class="T">Split Fight Night <span style="color:var(--rouge-vif)">63</span></span></div>
    <button class="bouton jaune cj cont-carre pp-suite ${pret?'pret':''}" id="ppSuite" style="height:64px;font-size:40px">${PP_SUITE[i]} ${ico('avant',30,3)}</button>`;
}

/** Chiffres qui défilent. */
function ppCompter(){
  const fin=ppCalme();
  document.querySelectorAll('.pp-anim [data-ppn]').forEach(e=>{const v=+e.dataset.ppn;if(fin){e.textContent=nb(v);return;}
    const t0=performance.now(),d=1100;const f=t=>{const k=Math.min(1,(t-t0)/d),q=1-Math.pow(1-k,3);e.textContent=nb(v*q);if(k<1)requestAnimationFrame(f);};e.textContent='0';requestAnimationFrame(f);});
}
/** Le bandeau passe d'une hauteur à l'autre entre deux étapes, sans saut. */
function ppBandeSuit(){
  const b=$('.pp-band');if(!b){S.pp.bandeH=0;return;}const h=b.offsetHeight,h0=S.pp.bandeH;S.pp.bandeH=h;
  if(!h0||h0===h||ppCalme())return;
  b.animate([{height:h0+'px'},{height:h+'px'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});
}

const ppRendreBase=rendre;
rendre=function(){
  document.body.classList.toggle('pp-mode',S.ecran==='arrivee');
  if(S.ecran!=='arrivee'){ppRendreBase();return;}
  rendreBarre();ppEntete();
  const al=$('#alerte');al.className='alerte-l';al.innerHTML='';
  $('#corps').style.top='104px';$('#corps').innerHTML=ppHtml();
  if(S.pp.anim)ppCompter();
  ppBandeSuit();
  S.pp.anim=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};

/* ---- L'Accueil du 4 janvier : l'Accueil validé, avec les données de ce jour-là ---- */
const PP_MSGS=[
  {id:'pp1',lu:false,t:'Bienvenue chez Split',de:'Leïla · aujourd’hui',tag:'Leïla'},
  {id:'pp2',lu:false,t:'Ce que le patron attend de ta saison',de:'Gérard Vasseur · aujourd’hui',tag:'Organisation'},
  {id:'pp3',lu:false,t:'Tes deux espoirs<span class="relire">à relire</span>',de:'Leïla · aujourd’hui · de leurs nouvelles chaque semaine',tag:'Leïla'},
  {id:'pp4',lu:true,t:'Split nomme un nouveau matchmaker',de:'Cage Hebdo · aujourd’hui',tag:'Presse',go:'presse'},
  {id:'pp5',lu:true,t:'Quatre absents au 4 janvier<span class="relire">à relire</span>',de:'Le médecin · aujourd’hui · Rizzo revient le 2 février',tag:'Médecin'},
];
const ppAccueilBase=accueilHtml;
accueilHtml=function(){
  if(!S.pp.accueil)return ppAccueilBase();
  PP_MSGS[2].t=`Tes deux espoirs : ${S.pp.choix.map(id=>esc(parId(id).nom)).join(' et ')}<span class="relire">à relire</span>`;
  const sauve=MESSAGES;MESSAGES=PP_MSGS;let h;try{h=ppAccueilBase();}finally{MESSAGES=sauve;}
  const suivis=S.pp.choix.map(id=>{const c=parId(id),info=c.statut==='blesse'?'<span style="color:var(--neg)">Blessé, retour le 2 février</span>':esc(PP_ESP_COURT[id]);
    return `<div class="ligne" data-fiche="${c.id}"><span style="font-size:23px;font-weight:700;white-space:nowrap">${lien(c)}</span><span style="margin-left:auto;font-size:21px;color:var(--texte2);text-align:right">${info}</span></div>`;}).join('');
  let n=0;
  h=h.replace(/<div class="ligne" data-fiche="(rizzo|musaev|rachidi)">[\s\S]*?<\/span><\/div>/g,()=>n++?'':suivis);
  return h.replace('<span style="color:var(--jaune)">2 / 4</span>','<span style="color:var(--jaune)">1 / 4</span>').replace('2 places à finir','3 places à finir')
    .replace('Il manque 2 combats en carte principale.','Il manque 3 combats en carte principale.').replace('Retour le 3 février','Retour le 8 janvier');
};

/* ---- Navigation : chaque étape est un pas (Retour / Avant) ---- */
function ppAller(et,dir){S.pp.dir=dir||(PP_ETAPES.indexOf(et)>=PP_ETAPES.indexOf(S.pp.etape)?1:-1);S.pp.etape=et;S.pp.anim=true;ppGarder();rendre();}
function ppPas(et){if(et===S.pp.etape)return;S.hist.push({pp:S.pp.etape});S.futur=[];ppAller(et);}
function ppSuite(){
  const i=PP_ETAPES.indexOf(S.pp.etape);
  if(i<2){ppPas(PP_ETAPES[i+1]);return;}
  const n=2-S.pp.choix.length;
  if(n>0){toast(`Choisis encore ${n} espoir${n>1?'s':''} pour entrer chez Split.`);
    document.querySelectorAll('.pp-slot:not(.plein)').forEach(s=>s.animate([{transform:'none'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:320}));return;}
  ppCommencer();
}
function ppCommencer(){
  S.hist.push({pp:S.pp.etape});S.futur=[];S.pp.accueil=true;S.ecran='accueil';ppGarder();
  document.body.classList.add('pp-entree');setTimeout(()=>document.body.classList.remove('pp-entree'),1000);
  rendre();
}
/** Le nom choisi part de sa carte et se pose dans sa case du bandeau. */
function ppVol(id){
  const src=$(`.pp-c[data-ppchoix="${id}"] .pp-cnom`),dst=$(`.pp-slot[data-slot="${S.pp.choix.indexOf(id)}"] .pp-slotn`);
  if(!src||!dst||ppCalme())return;
  const sc=$('.scene').getBoundingClientRect(),k=sc.width/1920,a=src.getBoundingClientRect(),b=dst.getBoundingClientRect();
  const v=document.createElement('span');v.className='T pp-vol';v.textContent=parId(id).nom;
  Object.assign(v.style,{left:(a.left-sc.left)/k+'px',top:(a.top-sc.top)/k+'px'});$('.scene').appendChild(v);
  const dx=(b.left-a.left)/k,dy=(b.top-a.top)/k,s=b.height/a.height;
  dst.style.opacity='0';
  v.animate([{transform:'none',opacity:1},{transform:`translate(${dx*.55}px,${dy*.55-40}px) scale(${(1+s)/2})`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${s})`,opacity:1}],
    {duration:620,easing:'cubic-bezier(.3,.7,.2,1)'}).onfinish=()=>{v.remove();dst.style.opacity='';
      const sl=dst.closest('.pp-slot');if(sl)sl.animate([{boxShadow:'0 0 0 0 rgba(233,230,225,.6)'},{boxShadow:'0 0 0 14px rgba(233,230,225,0)'}],{duration:600});};
}
function ppChoisir(id){
  const C=S.pp.choix,i=C.indexOf(id);
  if(i>=0)C.splice(i,1);
  else if(C.length>=2){toast(`Deux espoirs au plus : retire d’abord ${C.map(x=>esc(parId(x).nom)).join(' ou ')}.`);return;}
  else C.push(id);
  ppGarder();rendre();
  if(C.includes(id)){ppVol(id);const el=$(`.pp-c[data-ppchoix="${id}"]`);if(el&&!ppCalme())el.animate([{transform:'scale(.97)'},{transform:'scale(1.015)'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});}
}
const ppRetourBase=retour;
retour=function(){
  const h=S.hist[S.hist.length-1];
  if(!S.fiche&&h&&h.pp){
    S.hist.pop();
    if(S.ecran==='arrivee'){S.futur.push({pp:S.pp.etape});ppAller(h.pp,-1);return;}
    /* De l'Accueil du 4 janvier, Retour rouvre la dernière étape de l'arrivée. */
    S.futur.push({ecran:S.ecran});S.ecran='arrivee';S.pp.accueil=false;S.pp.bandeH=0;ppAller(h.pp,-1);return;
  }
  ppRetourBase();
};
function ppAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran!=='arrivee'||S.fiche||!f)return false;
  if(f.pp){S.futur.pop();S.hist.push({pp:S.pp.etape});ppAller(f.pp,1);return true;}
  if(f.ecran==='accueil'){S.futur.pop();S.hist.push({pp:S.pp.etape});S.pp.accueil=true;S.ecran='accueil';ppGarder();rendre();return true;}
  return false;
}
const ppOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='arrivee'){ppOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/** Continuer depuis l'Accueil du 4 janvier : les jours défilent jusqu'au 12, où reprend le reste de la maquette. */
function ppVersLe12(){
  if(S._enCours)return;S._enCours=true;
  const tic=()=>{S.date.setDate(S.date.getDate()+1);const e=$('#dateH');if(e){e.textContent=`${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}`;if(!ppCalme())e.animate([{opacity:.2,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:150});}
    if(S.date.getDate()<12&&!ppCalme())setTimeout(tic,170);else{S.pp.accueil=false;S.pp.etape='split';ppGarder();location.href='index.html';}};
  tic();
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;const stop=()=>e.stopImmediatePropagation();
  if(S.pp.accueil&&S.ecran==='accueil'&&t.closest('#bContinuer')){stop();ppVersLe12();return;}
  if(S.ecran!=='arrivee')return;
  if(t.closest('#bAvant')){if(ppAvancer())stop();return;}
  if(t.closest('#ppSuite')){stop();ppSuite();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  if((el=t.closest('[data-ppet]'))){stop();ppPas(el.dataset.ppet);return;}
  if((el=t.closest('[data-ppchoix]'))){stop();ppChoisir(el.dataset.ppchoix);return;}
},true);

/* ---- Lancement : ?ecran=arrivee, options ppetape=split|contrat|espoirs|accueil, ppchoix=<id>,<id>, ppfiche=<id>, ppouv=0 (sans ouverture) ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='arrivee')return;
  ppMonde();
  const et=q.get('ppetape')||S.pp.etape;
  if(q.get('ppchoix')!==null)S.pp.choix=q.get('ppchoix').split(',').filter(id=>PP_ESPOIRS.some(x=>x.id===id)).slice(0,2);
  S.hist=[];S.futur=[];
  if(et==='accueil'){if(S.pp.choix.length<2)S.pp.choix=['rizzo','musaev'];S.pp.etape='espoirs';S.hist=[{pp:'espoirs'}];S.pp.accueil=true;S.ecran='accueil';}
  else{S.pp.etape=PP_ETAPES.includes(et)?et:'split';S.pp.accueil=false;S.ecran='arrivee';
    for(let i=0;i<PP_ETAPES.indexOf(S.pp.etape);i++)S.hist.push({pp:PP_ETAPES[i]});}
  S.pp.anim=true;ppGarder();rendre();
  if(S.ecran==='arrivee'&&S.pp.etape==='split'&&q.get('ppouv')!=='0')ppOuverture();
  if(q.get('ppfiche'))setTimeout(()=>ouvrirFiche(q.get('ppfiche')),80);
});
