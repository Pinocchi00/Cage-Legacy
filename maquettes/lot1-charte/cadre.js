"use strict";
/* Maquette lot 1 — cadre du jeu (barre, en-tête, Continuer), Accueil, Effectif. Données fictives, aucune sauvegarde. */

const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nb=n=>Math.round(n).toLocaleString('fr-FR').replace(/ | /g,' ');

/* ---- Icônes de la barre repliée (T4) ---- */
const P={
  accueil:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',messages:'<rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/>',
  carte:'<path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z"/><path d="M9 9l6 6M15 9l-6 6"/>',prelims:'<path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z"/><path d="M8 10h8M8 14h5"/>',
  effectif:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c3 0 5.5 2 5.5 5.3"/>',
  classements:'<path d="M4 20V13h5v7M9.5 20V8h5v12M15 20v-9h5v9M3 20h18"/>',ceintures:'<rect x="2" y="9" width="20" height="6"/><path d="M9 7.5h6l1.5 4.5L15 16.5H9L7.5 12z"/>',
  contrats:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',camps:'<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/>',
  presse:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',calendrier:'<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  resultats:'<path d="M4 6h16M4 12h16M4 18h10"/><path d="M16 17l2 2 3-4"/>',finances:'<path d="M17 6.5A7 7 0 1017 17.5M4 10h9M4 14h9"/>',
  organisation:'<path d="M4 21V8l8-4 8 4v13"/><path d="M9 21v-5h6v5"/>',options:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  menu:'<rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/>',
  retour:'<path d="M15 5l-7 7 7 7"/>',avant:'<path d="M9 5l7 7-7 7"/>',croix:'<path d="M6 6l12 12M18 6L6 18"/>',ok:'<path d="M4 12.5l5 5L20 6.5"/>',
  medical:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',alerte:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',lecture:'<path d="M7 4l13 8-13 8z"/>',livre:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
};
/* Icônes de la barre réduite, refondues le 07/11 : un seul trait, une seule idée par icône, mêmes proportions. */
Object.assign(P,{
  accueil:'<path d="M3.5 11L12 3.5l8.5 7.5"/><path d="M6 9v11.5h4.5v-6h3v6H18V9"/>',
  messages:'<path d="M3 5.5h18v13H3z"/><path d="M3 5.5l9 7.5 9-7.5"/>',
  carte:'<path d="M8.4 2.8h7.2l5.6 5.6v7.2l-5.6 5.6H8.4l-5.6-5.6V8.4z"/><text x="12" y="15.6" text-anchor="middle" fill="currentColor" stroke="none" font-family="Saira Extra Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="10.5">VS</text>',
  prelims:'<path d="M11.39 2h6.21l4.39 4.39v6.21l-4.39 4.39h-6.21l-4.39 -4.39v-6.21z"/><text x="11" y="13.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="Saira Extra Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="7">VS</text><path fill="#0D0B0B" d="M6.39 7h6.21l4.39 4.39v6.21l-4.39 4.39h-6.21l-4.39 -4.39v-6.21z"/>',
  effectif:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5c0-3.8 2.9-6 6.5-6s6.5 2.2 6.5 6"/><path d="M15.5 4.6a3.5 3.5 0 010 6.8M17.5 14.8c2.4.6 4 2.6 4 5.7"/>',
  classements:'<text x="12" y="19.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="Saira Extra Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="19">#1</text>',
  ceintures:'<path stroke-linejoin="bevel" d="M3 18.5h18M4 18.5L3 7.5l5 4L12 5l4 6.5 5-4-1 11"/>',
  contrats:'<path stroke-linejoin="bevel" d="M12 20.5l-5.5-8.5L9 4.5h6l2.5 7.5z"/><path d="M12 20v-6.5M9 4.5V2.5h6v2"/><circle cx="12" cy="12" r="1.4"/>',
  camps:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  presse:'<path d="M3.5 4.5h14v15.5h-14z"/><path d="M17.5 8.5h3V18a2 2 0 01-2 2h-1M6.5 8h8M6.5 11.5h8M6.5 15h5"/>',
  calendrier:'<path d="M3.5 5.5h17v15h-17zM3.5 10h17M8 3v5M16 3v5"/>',
  resultats:'<path d="M4.31 7.2h3.98l2.81 2.81v3.98l-2.81 2.81h-3.98l-2.81 -2.81v-3.98z"/><path d="M15.71 7.2h3.98l2.81 2.81v3.98l-2.81 2.81h-3.98l-2.81 -2.81v-3.98z"/><text x="6.3" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-family="Saira Extra Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="8.5">V</text><text x="17.7" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-family="Saira Extra Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="8.5">D</text>',
  finances:'<circle cx="12" cy="12" r="9"/><path d="M15 8.6a4 4 0 100 6.8M7.5 11h5.5M7.5 13.3h5.5"/>',
  organisation:'<path d="M5 21V3.5h9V21M14 8.5h5V21M3 21h18M8 7.5h3M8 11.5h3M8 15.5h3"/>',
  options:'<path d="M19.0 10.3L21.9 10.3L21.9 13.7L19.0 13.7L18.2 15.7L20.2 17.8L17.8 20.2L15.7 18.2L13.7 19.0L13.7 21.9L10.3 21.9L10.3 19.0L8.3 18.2L6.2 20.2L3.8 17.8L5.8 15.7L5.0 13.7L2.1 13.7L2.1 10.3L5.0 10.3L5.8 8.3L3.8 6.2L6.2 3.8L8.3 5.8L10.3 5.0L10.3 2.1L13.7 2.1L13.7 5.0L15.7 5.8L17.8 3.8L20.2 6.2L18.2 8.3Z"/><circle cx="12" cy="12" r="3"/>',
  menu:'<path d="M10 3.5H4v17h6M15.5 7.5L20 12l-4.5 4.5M20 12H9.5"/>',
});
const ico=(n,t=24,w=2)=>`<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${P[n]||''}</svg>`;
const LOGO='<svg viewBox="0 0 400 400" fill="none" aria-label="Cage Legacy"><path d="M292 238.1L238.1 292H161.9L108 238.1V161.9L161.9 108H238.1L292 161.9Z" stroke="#E23A2B" stroke-width="15"/><path d="M331 254.3L254.3 331H145.7L69 254.3V145.7L145.7 69H254.3L331 145.7Z" stroke="#E23A2B" stroke-width="21"/><path d="M371 270.8L270.8 371H129.2L29 270.8V129.2L129.2 29H270.8L371 129.2Z" stroke="#E23A2B" stroke-width="12"/></svg>';
const pan=(contenu,style='',cls='')=>`<div class="pan oct ${cls}" style="${style}"><div class="p2 oct"><div class="p3 oct">${contenu}</div></div></div>`;
const titre=(t,ment='')=>`<div class="pt"><h2>${t}</h2>${ment?`<span class="ment">${ment}</span>`:''}</div>`;

/* ---- Données de la partie (fictives) ---- */
const COMBATTANTS=[
  {id:'nana',prenom:'Parfait',nom:'Nana',surnom:'Le Boucher',cat:'Poids léger',kg:70,age:37,v:14,d:8,n:0,rang:'C',mondial:17,tend:'=',serie:'ddvvv',statut:'dispo',dernier:new Date(2026,11,8),
   taille:'1,72 m',allonge:'1,77 m',garde:'Orthodoxe',depuis:'2019',contrat:[2,'120 000 €'],style:'Bagarreur, pression au centre',
   traits:[['+','Diesel','3 victoires au troisième round','Monte en régime quand les autres s’éteignent.'],['+','Guerrier','Une guerre dont on parle encore','Ne recule jamais d’un échange.']]},
  {id:'labbe',surnomP:1,prenom:'Thomas',nom:'Labbé',surnom:'Le Notaire',cat:'Poids léger',kg:70,age:29,v:12,d:3,n:0,rang:2,mondial:24,tend:'+2',serie:'vvdvv',statut:'dispo',dernier:new Date(2026,10,14),taille:'1,78 m',allonge:'1,81 m',garde:'Orthodoxe',depuis:'2022',contrat:[3,'34 000 €'],style:'Lutteur de contrôle'},
  {id:'bello',surnomP:1,prenom:'Babatunde',nom:'Bello',surnom:'Baba',cat:'Poids léger',kg:70,age:27,v:11,d:2,n:0,rang:3,mondial:29,tend:'+1',serie:'vdvvv',statut:'dispo',dernier:new Date(2026,10,14),taille:'1,80 m',allonge:'1,86 m',garde:'Fausse garde',depuis:'2023',contrat:[2,'28 000 €'],style:'Frappeur de distance'},
  {id:'mezouar',surnomP:1,prenom:'Ilyas',nom:'Mezouar',surnom:'Le Faucon',cat:'Poids léger',kg:70,age:28,v:13,d:3,n:0,rang:1,mondial:19,tend:'+1',serie:'vvvdv',statut:'dispo',dernier:new Date(2026,11,8),taille:'1,76 m',allonge:'1,80 m',garde:'Orthodoxe',depuis:'2021',contrat:[1,'52 000 €'],style:'Grappler, finisseur'},
  {id:'lecomte',surnomP:1,prenom:'Étienne',nom:'Lecomte',surnom:'Le Prof',cat:'Poids léger',kg:70,age:31,v:10,d:5,n:0,rang:6,mondial:41,tend:'-2',serie:'vvdvd',statut:'dispo',dernier:new Date(2026,11,8),taille:'1,75 m',allonge:'1,78 m',garde:'Orthodoxe',depuis:'2020',contrat:[2,'22 000 €'],style:'Kickboxeur'},
  {id:'rachidi',prenom:'Hajar',nom:'Rachidi',surnom:'',cat:'Poids paille F',kg:52,age:25,v:8,d:1,n:0,rang:1,mondial:12,tend:'+3',serie:'vvvvv',statut:'dispo',dernier:new Date(2026,11,8),taille:'1,60 m',allonge:'1,62 m',garde:'Orthodoxe',depuis:'2023',contrat:[3,'26 000 €'],style:'Frappeuse explosive'},
  {id:'meziane',prenom:'Lynda',nom:'Meziane',surnom:'',cat:'Poids paille F',kg:52,age:28,v:7,d:3,n:0,rang:3,mondial:33,tend:'-1',serie:'vdvvd',statut:'dispo',dernier:new Date(2026,11,8),taille:'1,58 m',allonge:'1,60 m',garde:'Orthodoxe',depuis:'2022',contrat:[1,'15 000 €'],style:'Lutteuse'},
  {id:'diallo',prenom:'Malick',nom:'Diallo',surnom:'',cat:'Poids mi-moyen',kg:77,age:30,v:15,d:4,n:0,rang:2,mondial:21,tend:'=',serie:'vvvdv',statut:'pause',dernier:new Date(2026,8,20),taille:'1,83 m',allonge:'1,90 m',garde:'Orthodoxe',depuis:'2020',contrat:[2,'40 000 €'],style:'Contre-attaquant'},
  {id:'rizzo',prenom:'Paolo',nom:'Rizzo',surnom:'',cat:'Poids mouche',kg:57,age:23,v:6,d:0,n:0,rang:4,mondial:30,tend:'+4',serie:'vvvvv',statut:'blesse',retour:'2 février',dernier:new Date(2026,9,3),taille:'1,65 m',allonge:'1,68 m',garde:'Orthodoxe',depuis:'2026',contrat:[3,'11 000 €'],style:'Lutteur, très rapide'},
  {id:'musaev',prenom:'Omurbek',nom:'Musaev',surnom:'',cat:'Poids mouche',kg:57,age:22,v:7,d:1,n:0,rang:7,mondial:44,tend:'+2',serie:'vdvvv',statut:'dispo',dernier:new Date(2026,10,14),taille:'1,67 m',allonge:'1,70 m',garde:'Fausse garde',depuis:'2026',contrat:[3,'10 000 €'],style:'Sambiste, finit au sol'},
  {id:'vanbelle',surnomP:1,prenom:'Jens',nom:'Van Belle',surnom:'Le Viking',cat:'Poids léger',kg:70,age:26,v:9,d:2,n:0,rang:8,mondial:52,tend:'=',serie:'vvdvv',statut:'dispo',dernier:new Date(2026,9,3),taille:'1,79 m',allonge:'1,83 m',garde:'Orthodoxe',depuis:'2024',contrat:[1,'14 000 €'],style:'Frappeur précis'},
  {id:'darras',surnomP:1,prenom:'Kévin',nom:'Darras',surnom:'Kéké',cat:'Poids léger',kg:70,age:30,v:9,d:4,n:0,rang:5,mondial:38,tend:'-1',serie:'vvdvd',statut:'dispo',dernier:new Date(2026,11,8),taille:'1,77 m',allonge:'1,79 m',garde:'Orthodoxe',depuis:'2021',contrat:[2,'20 000 €'],style:'Boxeur'},
  {id:'carvalho',surnomP:1,prenom:'Rui',nom:'Carvalho',surnom:'Tubarão',cat:'Poids léger',kg:70,age:27,v:8,d:3,n:0,rang:7,mondial:47,tend:'-1',serie:'vdvvd',statut:'dispo',dernier:new Date(2026,6,1),taille:'1,74 m',allonge:'1,76 m',garde:'Orthodoxe',depuis:'2024',contrat:[2,'16 000 €'],style:'Jiu-jitsu'},
  {id:'belkacem',surnomP:1,prenom:'Sofiane',nom:'Belkacem',surnom:'Le Sniper',cat:'Poids léger',kg:70,age:29,v:11,d:4,n:0,rang:4,mondial:33,tend:'=',serie:'vvvdv',statut:'dispo',dernier:new Date(2026,10,14),taille:'1,79 m',allonge:'1,84 m',garde:'Fausse garde',depuis:'2022',contrat:[3,'30 000 €'],style:'Kickboxeur'},
  {id:'kessler',surnomP:1,prenom:'Anton',nom:'Kessler',surnom:'Le Bûcheron',cat:'Poids léger',kg:70,age:32,v:16,d:6,n:0,rang:9,mondial:58,tend:'-2',serie:'vdvdd',statut:'dispo',dernier:new Date(2026,9,3),taille:'1,76 m',allonge:'1,78 m',garde:'Orthodoxe',depuis:'2020',contrat:[1,'18 000 €'],style:'Lutteur'},
];
const EXT=[];
const parId=id=>COMBATTANTS.find(c=>c.id===id)||EXT.find(c=>c.id===id);
const slug=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]+/g,'');
/** Un adversaire hors effectif : sa fiche est créée à la demande (données fictives stables). */
function parNom(nom,cat){
  const c=COMBATTANTS.find(x=>x.prenom+' '+x.nom===nom);if(c)return c;
  const id='x'+slug(nom);let e=EXT.find(x=>x.id===id);if(e)return e;
  let h=0;for(const ch of nom)h=(h*31+ch.charCodeAt(0))>>>0;const sp=nom.split(' ');
  e={id,prenom:sp[0],nom:sp.slice(1).join(' '),surnom:'',cat,kg:70,age:25+h%10,v:8+h%9,d:2+h%5,n:0,rang:'–',mondial:30+h%40,tend:'=',serie:['vvdvv','vdvvd','dvvvd'][h%3],statut:'dispo',dernier:new Date(2026,h%12,1+h%27),
    taille:'1,7'+(h%9)+' m',allonge:'1,8'+(h%5)+' m',garde:h%4?'Orthodoxe':'Fausse garde',depuis:'—',contrat:[0,'—'],style:['Frappeur','Lutteur','Grappler','Kickboxeur'][h%4],ext:true};
  EXT.push(e);return e;
}
const bilan=c=>`${c.v}-${c.d}-${c.n}`;
const lien=(c,surnom=false)=>`<span class="nom" data-fiche="${c.id}">${esc(c.prenom)} ${esc(c.nom)}</span>${surnom&&c.surnom?` <span class="surn">« ${esc(c.surnom)} »</span>`:''}`;
const serie=s=>`<span style="display:inline-flex;gap:6px;align-items:center" title="Du plus ancien au plus récent">${[...s].map(x=>`<span class="marque octr ${x}" style="width:28px;height:28px;font-size:20px">${x.toUpperCase()}</span>`).join('')}</span>`;
const ETATS={dispo:['var(--vert)','ok','Disponible'],blesse:['var(--neg)','medical','Blessé'],pause:['var(--texte2)','alerte','En pause']};
const etat=c=>{const [col,i,t]=ETATS[c.statut];return `<span style="color:${col};display:inline-flex;gap:8px;align-items:center;font-weight:700;white-space:nowrap">${ico(i,20)}${t}${c.retour?` · retour ${esc(c.retour)}`:''}</span>`;};
const JOURS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const dLong=d=>`${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
/** Temps depuis une date, en mois et en semaines : « 2 mois et 1 semaine », « 3 semaines ». */
function depuis(d){const j=Math.max(0,Math.round((S.date-d)/864e5));let m=Math.floor(j/30.44),w=Math.floor((j-m*30.44)/7);if(w>=4){m++;w=0;}
  const sm=w?`${w} semaine${w>1?'s':''}`:'';return m?`${m} mois${sm?' et '+sm:''}`:(sm||'moins d’une semaine');}
const dCourt=d=>`${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;

let MESSAGES=[
  {id:1,lu:false,t:'Il manque deux combats pour <b>Split Fight Night 63</b>',de:'Leïla · aujourd’hui',tag:'Leïla',go:'carte'},
  {id:2,lu:false,t:'<span class="nom" data-fiche="rizzo">Paolo Rizzo</span> s’est blessé au camp',de:'Le médecin · hier · retour estimé le 2 février',tag:'Médecin'},
  {id:3,lu:true,t:'Palier franchi : les diffuseurs nationaux regardent Split',de:'Split · 10 janvier',tag:'Palier'},
  {id:4,lu:true,t:'« Split a un nouveau matchmaker. Il a 35 jours pour remplir le Forum. »',de:'Cage Hebdo · 9 janvier',tag:'Presse'},
  {id:5,lu:true,t:'Ton recruteur est disponible',de:'Lyon · 8 janvier',tag:'Recruteur'},
];

/* ---- État ---- */
const S={ecran:'accueil',hist:[],futur:[],recruteur:'dispo',fiche:null,ficheHist:[],onglet:'Aperçu',date:new Date(2027,0,12),jours:35,preventes:2626,
  tri:{col:'mondial',sens:1},police:'saira',fond:'arene',octo:'cage'};

/* ---- Barre latérale (liste du jeu ; ACTUALITÉS devient MESSAGES, R13/T10) ---- */
const ITEMS=[['accueil','Accueil'],['messages','Messages',1],['carte','Carte',1],['prelims','Préliminaires'],['effectif','Effectif'],['classements','Classements'],['ceintures','Ceintures'],
  ['contrats','Contrats'],['camps','Camps'],['presse','Presse'],['calendrier','Calendrier'],['resultats','Résultats'],['finances','Finances'],['organisation','Organisation']];
function rendreBarre(){
  const it=([id,l,mq])=>`<button class="item ${S.ecran===id?'cur':''}" data-go="${id}" title="${esc(l)}"><span class="ic">${ico(id,30)}${mq?'<span class="mq octr"></span>':''}</span><span class="lib">${esc(l)}</span>${mq?'<span class="mq octr"></span>':''}</button>`;
  $('#barre').innerHTML=`<div class="barre-logo">${LOGO}<div class="logo-mots"><b>CAGE</b><i>LEGACY</i></div>
    <button id="bRepli" class="repli-btn" title="Réduire la barre"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/></svg></button></div>${ITEMS.map(it).join('')}
    <div class="barre-bas">${it(['options','Options'])}${it(['menu','Menu principal'])}</div>`;
}

/* ---- En-tête : titre, Retour (T7), soirée, Continuer (T10) ---- */
function rendreEntete(plaque){
  $('#entete').innerHTML=`<button class="retour" id="bRetour" title="Retour" ${S.hist.length||S.fiche?'':'disabled'}>${ico('retour',28)}</button>
    <button class="retour" id="bAvant" title="Avancer" ${S.futur.length?'':'disabled'}>${ico('avant',28)}</button>
    <div class="plaque">${esc(plaque)}</div><span style="margin-left:auto"></span>
    <div class="boite"><span class="T" id="dateH">${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}</span></div>
    <div class="boite"><span class="T">Split Fight Night <span style="color:var(--rouge-vif)">63</span></span></div>
    <button class="bouton jaune oct cj" id="bContinuer" style="height:64px;font-size:40px">Continuer ${ico('avant',30,3)}</button>`;
}

/* ---- Accueil (R5 : messages, ce qui t'attend, saison cohérente ; T3 : mouvement discret) ---- */
function accueilHtml(){
  const nonlus=MESSAGES.filter(m=>!m.lu).length;
  const stat=(l,v,s,extra='')=>`<div class="stat-b" style="position:relative;padding:0 30px;border-left:2px solid var(--sep);display:flex;flex-direction:column;justify-content:center;gap:8px;min-width:0">
      <span class="etiq">${l}</span><span class="T" style="font-size:56px;line-height:.8;white-space:nowrap">${v}</span><span style="font-size:24px;color:var(--texte2);white-space:nowrap">${s}</span>${extra}</div>`;
  const rizzo=parId('rizzo'),musaev=parId('musaev');
  const suivi=(c,info)=>`<div class="ligne" data-fiche="${c.id}"><span style="font-size:23px;font-weight:700;white-space:nowrap">${lien(c)}</span><span style="margin-left:auto;font-size:21px;color:var(--texte2);text-align:right">${info}</span></div>`;
  const espoir=(c,part)=>`<div style="display:flex;gap:14px;align-items:flex-start;padding:10px 0;border-bottom:2px solid var(--sep)">
      <div style="min-width:0;flex:1"><div style="display:flex;gap:14px;align-items:baseline"><span style="font-size:24px;font-weight:700">${lien(c)}</span><span style="margin-left:auto;font-size:19px">${etat(c)}</span></div>
      <div class="sous">${esc(c.cat)} · ${bilan(c)} · n° ${c.mondial} mondial</div><div style="font-size:20px;margin-top:2px">${esc(part)}<span class="relire">à relire</span></div></div></div>`;
  const obj=(t,v,k,col)=>`<div style="padding:12px 0 14px;border-bottom:2px solid var(--sep)"><div style="display:flex;gap:20px;align-items:baseline"><span style="font-size:24px">${t}</span><span class="T" style="margin-left:auto;font-size:30px;white-space:nowrap;color:${col};text-transform:none">${v}</span></div>
      <div class="jauge" style="margin-top:10px"><i style="width:${k*100}%;background:${col}"></i></div></div>`;
  return `<div style="display:flex;flex-direction:column;gap:18px;height:100%">
    <div class="apparait bandeau" style="height:158px;flex:none;display:grid;grid-template-columns:540px minmax(0,1fr) minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr)">
      <i class="bandeau-img"></i>
      <div style="position:relative;padding:20px 30px;display:flex;flex-direction:column;justify-content:center;gap:12px">
        <span class="T" style="font-size:96px;line-height:.75">Split</span>
        <span style="font-size:24px;white-space:nowrap">Lyon · depuis 2004</span></div>
      ${stat('Prochaine soirée',`Dans <span id="jours">${S.jours}</span> j`,'Split Fight Night 63')}
      ${stat('Le lieu','Forum de Lille','Lille, 16 février')}
      ${stat('La carte','<span style="color:var(--jaune)">2 / 4</span>','2 places à finir')}
      ${stat('Les préventes',`<span id="preventes">${nb(S.preventes)}</span>`,'sur 4 000 places',`<div class="jauge" style="height:5px;width:180px"><i id="jPrev" style="width:${S.preventes/40}%;background:var(--blanc)"></i></div>`)}
    </div>
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.12fr 1fr .9fr;gap:20px">
      ${pan(titre('Derniers messages',`${nonlus} non lus · <button data-go="messages">Tout voir ›</button>`)+`<div class="defile" id="msgs">${MESSAGES.map(m=>`<div class="ligne ${m.nouveau?'apparait':''}" data-go="${m.go||'messages'}">
          <span class="point octr ${m.lu?'':'pulse'}" style="${m.lu?'background:transparent':''}"></span>
          <div style="flex:1;min-width:0"><div style="font-size:24px;${m.lu?'color:var(--texte2)':'font-weight:700'}">${m.t}</div><div class="sous">${esc(m.de)}</div></div>
          <span class="tag">${esc(m.tag)}</span></div>`).join('')}</div>`,'','apparait')}
      ${pan(titre('Ce qui t’attend')+`<div class="defile">
          <div class="oct cj" style="--c:16px;background:var(--jaune);color:var(--noir);padding:22px 24px">
            <div style="font-weight:700;font-size:22px;letter-spacing:.07em;text-transform:uppercase">La prochaine chose à faire</div>
            <div class="T" style="font-size:54px;margin:8px 0 10px">Finir la carte</div>
            <div style="display:flex;align-items:center;gap:18px"><span style="font-size:22px;flex:1">Il manque 2 combats en carte principale.</span>
              <button class="bouton petit oct" style="background:var(--noir);color:var(--jaune)" data-go="carte">Ouvrir la carte</button></div></div>

          <div class="etiq" style="margin:20px 0 4px">À surveiller</div>
          <div class="ligne"><span style="color:var(--neg)">${ico('medical',22)}</span><span style="flex:1">${lien(rizzo)} · blessé au camp, retour le 2 février</span><span class="lecture">›</span></div>
          <div class="ligne"><span style="color:var(--jaune)">${ico('contrats',22)}</span><span style="flex:1">${lien(parId('vanbelle'))} · dernier combat de son contrat</span><span class="lecture">›</span></div>
          <div style="display:flex;align-items:baseline;margin:22px 0 2px"><span class="etiq">Tes suivis</span><button class="etiq" style="margin-left:auto;color:var(--jaune);font-weight:700" data-go="effectif">Tout voir ›</button></div>
          ${suivi(rizzo,'<span style="color:var(--neg)">Blessé, retour le 2 février</span>')}${suivi(musaev,'Cinq victoires sur sept par soumission')}${suivi(parId('rachidi'),'<span style="color:var(--vert)">Cinq victoires de suite</span>')}
        </div>`,'','apparait')}
      ${pan(titre('Ta saison','2027')+`<div class="defile">
          ${obj('Rester dans les deux premières organisations','2e, à garder',.92,'var(--vert)')}
          ${obj('Un poids lourd de Split dans le top 10 mondial','Meilleur : n° 14',.55,'var(--jaune)')}
          ${obj('Remplir le Forum de Lille',`${Math.round(S.preventes/40)} %`,S.preventes/4000,'var(--blanc)')}
          <div class="etiq" style="margin:22px 0 6px">Le patron</div>
          <div class="T" style="font-size:40px">Il attend de voir</div>
          <div style="font-size:24px;color:var(--texte2);margin-top:6px;font-style:italic">« Je veux voir la suite. »</div>
          <div class="etiq" style="margin:24px 0 6px">Ton recruteur</div>
          ${S.recruteur==='dispo'?`<div style="display:flex;align-items:baseline;gap:18px"><span style="font-size:24px;color:var(--vert);font-weight:700">Disponible</span><button style="color:var(--jaune);font-size:24px;font-weight:600">Ouvrir ›</button></div>`
            :`<div style="font-size:24px">En voyage à Turin</div><div class="sous">Retour le 3 février</div>`}
        </div>`,'','apparait')}
    </div></div>`;
}

/* ---- Effectif (R15) : derrière la fiche ---- */
const COLS=[['nom','Combattant'],['cat','Catégorie'],['age','Âge'],['bilan','Palmarès'],['rang','Split'],['mondial','Mondial'],['serie','5 derniers combats'],['statut','Statut']];
const valTri=(c,k)=>k==='nom'?c.nom:k==='bilan'?c.v-c.d:k==='rang'?(c.rang==='C'?0:c.rang):k==='serie'?[...c.serie].filter(x=>x==='v').length:k==='statut'?c.statut:c[k];
function effectifHtml(){
  const l=[...COMBATTANTS].sort((a,b)=>{const x=valTri(a,S.tri.col),y=valTri(b,S.tri.col);return (x>y?1:x<y?-1:0)*S.tri.sens;});
  const cell=(c,k)=>({nom:`<span style="font-weight:700">${lien(c,true)}</span>`,cat:esc(c.cat),age:c.age,bilan:`<span class="T" style="font-size:30px">${bilan(c)}</span>`,
    rang:c.rang==='C'?`<span class="marque octr" style="background:var(--jaune);width:32px;height:32px">C</span>`:'n° '+c.rang,
    mondial:`n° ${c.mondial} ${c.tend==='='?'<span class="sous">=</span>':c.tend[0]==='+'?`<span style="color:var(--vert);font-weight:700">▲ ${c.tend.slice(1)}</span>`:`<span style="color:var(--neg);font-weight:700">▼ ${c.tend.slice(1)}</span>`}`,
    serie:serie(c.serie),statut:etat(c)}[k]);
  return pan(`<div class="defile"><table style="width:100%;border-collapse:collapse;font-size:24px"><thead><tr>${COLS.map(([k,t])=>`<th data-tri="${k}" style="text-align:left;padding:6px 12px 12px;font-weight:600;font-size:19px;letter-spacing:.07em;text-transform:uppercase;color:${S.tri.col===k?'var(--blanc)':'var(--texte2)'};border-bottom:2px solid var(--bord);cursor:pointer;white-space:nowrap">${t}${S.tri.col===k?(S.tri.sens>0?' ▾':' ▴'):''}</th>`).join('')}</tr></thead>
    <tbody>${l.map((c,i)=>`<tr class="apparait" style="animation-delay:${i*30}ms">${COLS.map(([k])=>`<td style="padding:11px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">${cell(c,k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,'height:100%');
}

/* ---- Rendu d'écran ---- */
function rendre(){
  rendreBarre();
  const z=$('#zone');
  if(S.ecran==='accueil'){rendreEntete('Accueil');$('#alerte').innerHTML='';$('#corps').style.top='108px';$('#corps').innerHTML=accueilHtml();}
  else{const i=S.fiche?COMBATTANTS.findIndex(c=>c.id===S.fiche)+1:0;
    rendreEntete('Effectif');
    $('#alerte').innerHTML=`<span class="tag-j oct cj fin" style="--c:7px;height:34px;padding:0 14px">Prochaine étape</span><span style="font-size:22px">Il manque 2 combats en carte principale.</span>`;
    $('#corps').style.top='136px';$('#corps').innerHTML=effectifHtml();}
  z.classList.toggle('fiche-ouverte',!!S.fiche);
}
function aller(ecran){
  if(!['accueil','effectif'].includes(ecran)){toast('Écran hors de cette maquette : seuls l’Accueil et la fiche (Effectif) sont travaillés.');return;}
  if(S.fiche)fermerFiche(false);
  if(ecran!==S.ecran){S.hist.push(S.ecran);S.futur=[];}
  S.ecran=ecran;rendre();
}
function toast(t){const e=document.createElement('div');e.className='toast oct';e.innerHTML=`<div class="oct">${t}</div>`;$('.scene').appendChild(e);
  e.animate([{opacity:0,transform:'translate(-50%,10px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:200});setTimeout(()=>e.animate([{opacity:1},{opacity:0}],{duration:250}).onfinish=()=>e.remove(),2800);}

/* ---- Continuer : jour par jour, s'arrête au premier message (T10) ---- */
function continuer(){
  if(S._enCours)return;S._enCours=true;let n=0;
  const tic=()=>{S.date.setDate(S.date.getDate()+1);S.jours--;n++;
    const vend=48+n*17,de=S.preventes;S.preventes+=vend;
    ['#dateH'].forEach(s=>{const e=$(s);if(e){e.textContent=`${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}`;e.animate([{opacity:.2,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:280});}});
    const j=$('#jours');if(j)j.textContent=S.jours;
    const p=$('#preventes');if(p){const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/380);p.textContent=nb(de+(S.preventes-de)*k);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);}
    const jp=$('#jPrev');if(jp)jp.style.width=S.preventes/40+'%';
    if(n<2)setTimeout(tic,650);else{S._enCours=false;
      MESSAGES.unshift({id:Date.now(),lu:false,nouveau:true,t:'<span class="nom" data-fiche="rizzo">Paolo Rizzo</span> reprend la course',de:`Le médecin · ${dLong(S.date).toLowerCase()} · retour toujours prévu le 2 février`,tag:'Médecin'});
      if(S.ecran==='accueil'){$('#corps').innerHTML=accueilHtml();}
      toast(`Le temps s’arrête : nouveau message, ${dLong(S.date).toLowerCase()}.`);}
  };tic();
}
