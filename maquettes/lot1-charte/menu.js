"use strict";
/* ==== [ANCRE: MAQUETTE_MENU] — Menu principal, Parties et Nouvelle partie (T1, T2, T3, T5, T6, R1).
   Un seul écran « menu », trois vues. Rien n'écrit dans les sauvegardes du jeu :
   la seule clé utilisée est MN_CLE, propre à la maquette. Chargé en dernier.
   Adresses : ?ecran=menu&mnvue=menu|parties|nouvelle|creation
   &mnetat=aucune|une|libre|pleines|abimee|illisible &mnconf=effacer|ecraser
   &mnslot=1..3 &mnorg=<id> &mnduo=1 &mnchoix=1 &mnmouv=1 (mouvement forcé) &mngen=0..1 (création figée) ==== */
const MN_CLE='maquette-menu-1';
const MN_ARRIVEE='index.html?ecran=arrivee&ppetape=split&ppouv=0';
const MN_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MN_JOUR=864e5;

/* Les huit organisations du jeu (mgmt-organisations-data.js, textes de mgmt-nouvelle.js). La caisse
   de départ n'est pas reprise : 50 000 € dans le jeu, 952 200 € à l'Arrivée validée (écart signalé). */
const MN_ORGS=[
  {id:'split',nom:'Split',lieu:'Lyon · depuis 2004',t:'Au milieu. Ni la plus grosse organisation, ni la plus mauvaise.',p:['Caisse saine'],m:['Peu connue'],eff:350,age:'27,9',pop:'moyenne',salle:9000,bou:'normales'},
  {id:'garden-of-blood',nom:'Garden of Blood',lieu:'New York · depuis 1999',t:'La plus grande scène du monde. On y vient pour l’argent et pour la lumière.',p:['Très populaire','Grandes salles'],m:['Bourses lourdes'],eff:360,age:'27,9',pop:'très haute',salle:12600,bou:'lourdes'},
  {id:'mma-korner',nom:'MMA Korner',lieu:'Rotterdam · depuis 2011',t:'Une petite maison sérieuse, où les champions apprennent avant de partir.',p:['Bourses modestes'],m:['Caisse modeste','Public à gagner'],eff:310,age:'27,9',pop:'basse',salle:7200,bou:'modestes'},
  {id:'ultimate-rim',nom:'Ultimate Rim',lieu:'Melbourne · depuis 2020',t:'La jeune organisation de l’autre bout du monde, qui mise tout sur ses espoirs.',p:['Jeunes combattants'],m:['Peu connue','Petites salles'],eff:250,age:'24,9',pop:'moyenne',salle:6300,bou:'normales'},
  {id:'fighting-pacific-championship',nom:'Fighting Pacific Championship',lieu:'Tokyo · depuis 1997',t:'La plus ancienne. Un public fidèle, et des champions qui règnent longtemps.',p:['Caisse confortable','Public acquis'],m:['Effectif vieillissant'],eff:390,age:'30,9',pop:'haute',salle:9000,bou:'normales'},
  {id:'organisation-6',nom:'Knuckle Gate',lieu:'Manchester · depuis 2012',t:'La maison des meilleures combattantes du monde.',p:['Public acquis','Meilleures combattantes'],m:['Caisse modeste','Peu d’hommes classés'],eff:300,age:'27,9',pop:'haute',salle:9000,bou:'normales'},
  {id:'organisation-7',nom:'Pure Impact',lieu:'Dubaï · depuis 2018',t:'Beaucoup d’argent, des noms célèbres, et des salles encore à remplir.',p:['Beaucoup d’argent','Grandes salles'],m:['Public à gagner'],eff:360,age:'27,9',pop:'basse',salle:10800,bou:'normales'},
  {id:'organisation-8',nom:'Undisputed Cage',lieu:'São Paulo · depuis 2005',t:'Les poids lourds les plus durs du monde, et des catégories qui se cherchent.',p:['Caisse saine','Public acquis'],m:['Catégories dégarnies'],eff:320,age:'27,9',pop:'haute',salle:9000,bou:'normales'},
];
const mnOrg=id=>MN_ORGS.find(o=>o.id===id)||MN_ORGS[0];

/* ---- Les emplacements ---- */
const mnIl=(j,h=20,mn=12)=>{const d=new Date();d.setDate(d.getDate()-j);d.setHours(h,mn,0,0);return d.getTime();};
/* Les deux autres parties sont inventées, pour montrer les états pleins (à relire). */
const MN_AUTRES={
  2:{org:'garden-of-blood',date:[2028,2,3],soiree:81,place:1,caisse:1384500,ts:mnIl(1,21,40),invente:true},
  3:{org:'mma-korner',date:[2027,8,18],soiree:29,place:7,caisse:212400,ts:mnIl(9,18,5),invente:true},
};
const mnSplit=(x={})=>Object.assign({org:'split',vive:true,ts:mnIl(0,Math.min(new Date().getHours(),23),0)},x);
function mnEtatDemo(et){
  const a=()=>JSON.parse(JSON.stringify(MN_AUTRES));
  if(et==='aucune')return {slots:{1:null,2:null,3:null},dernier:null};
  if(et==='libre')return {slots:{1:mnSplit(),2:a()[2],3:null},dernier:1};
  if(et==='pleines')return {slots:{1:mnSplit(),2:a()[2],3:a()[3]},dernier:1};
  if(et==='abimee')return {slots:{1:mnSplit({abimee:true,copie:[2027,0,11]}),2:a()[2],3:null},dernier:1};
  if(et==='illisible')return {slots:{1:mnSplit({abimee:true}),2:a()[2],3:null},dernier:2};
  return {slots:{1:mnSplit(),2:null,3:null},dernier:1};
}
function mnLire(){
  try{const v=JSON.parse(localStorage.getItem(MN_CLE));if(v&&v.slots&&typeof v.slots==='object'&&[1,2,3].every(n=>n in v.slots))return v;}catch(e){}
  return mnEtatDemo('une');
}
S.mn={vue:'menu',slot:1,org:'split',conf:null,duo:false,choix:false,ecrase:false,anim:true,demo:false,mouv:false,gelGen:null,donnees:mnLire()};
function mnGarder(){if(S.mn.demo)return;try{localStorage.setItem(MN_CLE,JSON.stringify(S.mn.donnees));}catch(e){}}
const mnSlot=n=>S.mn.donnees.slots[n];
const mnLisible=x=>!!x&&(!x.abimee||!!x.copie);
const mnLibres=()=>[1,2,3].filter(n=>!mnSlot(n));
const mnOccupes=()=>[1,2,3].filter(n=>mnSlot(n));
/** L'emplacement que « Reprendre » rouvre : le dernier joué, sinon le premier lisible (comme mgmtSlotDernier). */
function mnDernier(){const d=S.mn.donnees.dernier;if(d&&mnLisible(mnSlot(d)))return d;return [1,2,3].find(n=>mnLisible(mnSlot(n)))||null;}
const mnDateDe=x=>x.copie?new Date(...x.copie):x.neuve?new Date(2027,0,4):x.vive?S.date:new Date(...x.date);
const mnCourt=d=>`${d.getDate()===1?'1er':d.getDate()} ${MN_MOIS[d.getMonth()]} ${d.getFullYear()}`;
const mnLong=d=>`${d.getDate()===1?'1er':d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
const mnPlaceSplit=()=>ogClasse().findIndex(o=>o.nom==='Split')+1;
const mnOrd=n=>n===1?'1re':`${n}e`;
/** Ce qu'un emplacement montre : les données partagées pour Split, la fiche inventée pour les autres. */
function mnInfos(x){
  const split=x.vive||x.neuve;
  return {nom:mnOrg(x.org).nom,date:mnDateDe(x),soiree:split?(x.neuve?63:(S.rs&&S.rs.apres?64:63)):x.soiree,place:split?mnPlaceSplit():x.place,caisse:split?fiCaisse().c:x.caisse};
}
function mnSauve(ts){
  const d=new Date(ts),n=new Date(),j=Math.round((new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/MN_JOUR);
  const h=`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`;
  return j<=0?`Aujourd’hui, ${h}`:j===1?`Hier, ${h}`:mnCourt(d);
}

/* ---- Mise en page de l’affiche : copie de mgmt-cadre.js, sans changement ---- */
const MF_ADV_ECHELLE=1;
const MF_ADV={"A":0.425,"B":0.409,"C":0.323,"D":0.416,"E":0.342,"F":0.317,"G":0.41,"H":0.435,"I":0.216,"J":0.258,"K":0.414,"L":0.312,"M":0.623,"N":0.439,"O":0.42,"P":0.404,"Q":0.42,"R":0.42,"S":0.369,"T":0.351,"U":0.425,"V":0.412,"W":0.662,"X":0.427,"Y":0.396,"Z":0.367,"0":0.398,"1":0.277,"2":0.383,"3":0.367,"4":0.393,"5":0.383,"6":0.391,"7":0.358,"8":0.404,"9":0.391,"-":0.266,"'":0.202," ":0.145,".":0.231};
function mfAvance(s){
  let t=0;
  for(const c of String(s)){ const w=MF_ADV[c]; t+=(w===undefined?0.45:w); }
  return t*MF_ADV_ECHELLE;
}
function mfNet(s){
  /* Corrections du 08/10, 5.8 : les capitales gardent leurs accents (FÉMININ, LÉGER, LEFÈVRE, GUIMARÃES), comme partout ailleurs dans le jeu. */
  return String(s==null?'':s).replace(/’/g,"'").toLocaleUpperCase('fr').trim();
}
function mfCorps(texte,largeur,max,min=22){
  const a=Math.max(mfAvance(mfNet(texte)),0.3);
  return Math.max(min,Math.min(max,Math.floor(largeur/a)));
}
function mfAfficheMise(nom1,nom2){
  const n1=mfNet(nom1), n2=mfNet(nom2);
  const a1=Math.max(mfAvance(n1),0.3), a2=Math.max(mfAvance(n2),0.3), aL=Math.max(a1,a2), aS=Math.min(a1,a2);
  const r1=x=>Math.round(x*10)/10;
  const H=1044, G=20, VS=0.781, BOX=0.653, CX=1234, TOP=18, BOT=1062;
  const fsE=Math.min(300,H/aL), need=VS*fsE+Math.max(BOX*fsE,1.68*Math.max(22,.28*fsE)+28)+2*G;
  const room1=H-a1*fsE>=need, room2=H-a2*fsE>=need;
  let mode, fs;
  if(room1||room2){ mode=(room1&&room2)?'P':(room1?'E1':'E2'); fs=fsE; }
  else{
    const fsS=Math.min(300,(H-G)/(aL+BOX),(H-G)/(aS+VS)), fsT=Math.min(221,H/aL);
    if(fsT>fsS){ mode='T'; fs=fsT; } else { mode='S'; fs=fsS; }
  }
  fs=Math.floor(fs);
  const th=Math.max(80,0.69*fs);
  let xA, xB, vsFs=fs, vsLeft, vsTop, boxLeft, boxTop, boxW=th, boxFs=Math.max(22,0.28*fs), boxH=Math.max(BOX*fs,1.68*boxFs+28);
  if(mode==='T'){
    const c=Math.min(110,434-2*th-32,th);
    xA=CX-(2*th+c+32)/2; const xC=xA+th+16; xB=xC+c+16;
    vsFs=c/0.69; boxW=c; boxFs=(c-20)/1.83; boxH=2*0.69*boxFs+0.3*boxFs+28;
    const grp=VS*vsFs+16+boxH; vsLeft=xC; vsTop=540-grp/2; boxLeft=xC; boxTop=vsTop+VS*vsFs+16;
  }else{
    xA=CX-(2*th+G)/2; xB=xA+th+G; const lenVS=VS*fs; let gap;
    if(mode==='E1'){ gap=(H-a1*fs-lenVS-boxH)/2; vsLeft=xA; vsTop=TOP+a1*fs+gap; boxLeft=xA; boxTop=BOT-boxH; }
    else if(mode==='E2'){ gap=(H-a2*fs-lenVS-boxH)/2; boxLeft=xB; boxTop=TOP; vsLeft=xB; vsTop=TOP+boxH+gap; }
    else if(mode==='P'||a1>=a2){ boxLeft=xA; boxTop=BOT-boxH; vsLeft=xB; vsTop=TOP; }
    else{ vsLeft=xA; vsTop=BOT-lenVS; boxLeft=xB; boxTop=TOP; }
  }
  return {mode,n1,n2,fs,xA:r1(xA),xB:r1(xB),vsFs:r1(vsFs),vsLeft:r1(vsLeft),vsTop:r1(vsTop),vsStroke:Math.max(2,Math.round(vsFs/75)),
    boxLeft:r1(boxLeft),boxTop:r1(boxTop),boxW:r1(boxW),boxH:r1(boxH),boxFs:r1(boxFs),boxGap:r1(0.3*boxFs)};
}

/* ---- Le mouvement : le tunnel du jeu, teinté à la couleur de l'organisation ---- */
const mnCalme=()=>matchMedia('(prefers-reduced-motion:reduce)').matches&&!S.mn.mouv;
let MN_TUN=[];
const mnTunHtml=(nom,cl='')=>`<div class="mn-tun ${cl}" id="mnTun" style="--f:${ogTeinte(nom)[1]||'none'}"><i></i><i></i></div>`;
function mnTunStop(){MN_TUN.forEach(a=>a.cancel());MN_TUN=[];}
/** Deux couches du même tunnel avancent en décalé : l'une naît quand l'autre s'efface, sans raccord visible. */
function mnTunLancer(duree=11000){
  mnTunStop();const c=$('#mnTun');if(!c||mnCalme())return;
  [...c.children].forEach((e,i)=>{const a=e.animate([{transform:'scale(1)',opacity:0},{transform:'scale(1.22)',opacity:1,offset:.25},{transform:'scale(1.62)',opacity:1,offset:.75},{transform:'scale(1.95)',opacity:0}],{duration:duree,iterations:Infinity,easing:'linear'});
    a.currentTime=i*duree/2;MN_TUN.push(a);});
}
function mnTunTeinte(nom,elan=true){
  const c=$('#mnTun');if(!c)return;const f=ogTeinte(nom)[1]||'none',av=getComputedStyle(c).getPropertyValue('--f').trim();
  if(av===f)return;c.style.setProperty('--f',f);if(mnCalme())return;
  [...c.children].forEach(e=>e.animate([{filter:(av==='none'?'hue-rotate(0deg)':av)+' brightness(1.5)'},{filter:(f==='none'?'hue-rotate(0deg)':f)+' brightness(1)'}],{duration:420,easing:'ease-out'}));
  if(elan){MN_TUN.forEach(a=>a.updatePlaybackRate(5));clearTimeout(mnTunTeinte.t);mnTunTeinte.t=setTimeout(()=>MN_TUN.forEach(a=>a.updatePlaybackRate(1)),300);}
}
function mnCompte(el,v,suf=''){
  if(!el)return;const fin=()=>{el.textContent=nb(v)+suf;};
  if(mnCalme()||typeof v!=='number'){fin();return;}
  const id=(el._mn=(el._mn||0)+1),t0=performance.now(),de=0;
  const f=t=>{if(el._mn!==id)return;const k=Math.min(1,(t-t0)/520),e=1-Math.pow(1-k,3);el.textContent=nb(de+(v-de)*e)+suf;if(k<1)requestAnimationFrame(f);else fin();};
  requestAnimationFrame(f);
}
function mnEntrees(){
  if(!S.mn.anim)return;S.mn.anim=false;if(mnCalme())return;
  document.querySelectorAll('#corps .mn-a').forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:480,delay:Math.min(i,12)*38,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
  document.querySelectorAll('#corps .mn-g-a').forEach((e,i)=>e.animate([{opacity:0,transform:'translateX(-26px)'},{opacity:1,transform:'none'}],{duration:420,delay:i*34,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
}

/* ---- L'accueil : celui du jeu, mesure pour mesure ; « Reprendre » prend la place de la barre de touches (T1) ---- */
const MN_MENU=[
  {t:'Management',s:'Matchmaker',act:'parties',on:1},{t:'Duo',s:'À deux sur ce PC',act:'duo'},
  {t:'Mode histoire',av:1},{t:'Patron',s:'Crée ou dirige ton organisation',av:1},{t:'Dirigeant de salle',s:'Tes combattants dans toutes les organisations',av:1},
];
function mnBouton(x){
  const corps=`<span class="mn-mt"><strong style="font-size:${mfCorps(mfNet(x.t),x.av?325:420,58,40)}px">${esc(x.t)}</strong>${x.s?`<small>${esc(x.s)}</small>`:''}</span>`;
  const fin=x.av?'<span class="mn-statut">À VENIR</span>':x.act?'<span class="mn-past"></span>':'';
  return x.act?`<button class="mn-mb ${x.on?'on':''}" data-mn="${x.act}">${corps}${fin}</button>`:`<button class="mn-mb grise" disabled aria-disabled="true">${corps}${fin}</button>`;
}
/** L'affiche de la prochaine soirée, comme sur l'accueil du jeu, lue sur la carte de la maquette. */
function mnAffiche(){
  const n=mnDernier(),x=n&&mnSlot(n);if(!x||!x.vive||x.abimee)return '';
  const cf=S.af&&S.af.m.find(f=>f.a&&f.b);if(!cf)return '';
  const a=parId(cf.a),b=parId(cf.b);if(!a||!b)return '';
  const L=mfAfficheMise(a.nom,b.nom),rec=c=>`${c.v}-${c.d}-${c.n||0}`,recFs=Math.floor(Math.min(180,302/Math.max(mfAvance(rec(a)),mfAvance(rec(b)),.5)));
  const fiche=(c,cote)=>`<div class="mn-f ${cote}"><div class="mn-fh"><div class="mn-fn"><div style="font-size:${mfCorps(c.prenom,318,28,22)}px">${esc(mfNet(c.prenom))}</div><div style="font-size:${mfCorps(c.nom,318,28,22)}px">${esc(mfNet(c.nom))}</div></div><div class="mn-fr" style="font-size:${recFs}px">${rec(c)}</div></div>
    <div class="mn-fl"><div>${c.rang==='C'?'Champion':`N°${c.rang}`} · ${esc(c.cat)}</div><div>${c.age} ans</div></div><div class="mn-ff">${[...c.serie].reverse().slice(0,3).map(k=>`<span class="marque octr ${k}">${k.toUpperCase()}</span>`).join('')}</div></div>`;
  const autres=S.af.m.filter(f=>f!==cf&&f.a&&f.b).slice(0,2).map(f=>`${parId(f.a).nom} — ${parId(f.b).nom}`);
  const soiree=S.rs&&S.rs.apres?64:63;
  return `<div class="mn-aff"><div class="mn-nom" style="left:${L.xA}px;top:18px;font-size:${L.fs}px">${esc(L.n1)}</div>
    <div class="mn-vs" style="left:${L.vsLeft}px;top:${L.vsTop}px;font-size:${L.vsFs}px;-webkit-text-stroke:var(--blanc) ${L.vsStroke}px">VS</div>
    <div class="mn-poids" style="left:${L.boxLeft}px;top:${L.boxTop}px;width:${L.boxW}px;height:${L.boxH}px;font-size:${L.boxFs}px;gap:${L.boxGap}px">${a.cat.toUpperCase().split(' ').map(t=>`<div>${esc(t)}</div>`).join('')}</div>
    <div class="mn-nom bas" style="left:${L.xB}px;bottom:18px;font-size:${L.fs}px">${esc(L.n2)}</div>
    <div class="mn-soiree"><div>SPLIT FIGHT</div><div><span>NIGHT</span><b>${soiree}</b></div></div>${fiche(a,'g')}${fiche(b,'d')}
    ${autres.length?`<div class="mn-aussi"><div class="t">AUSSI À L’AFFICHE</div>${autres.map(t=>`<div class="l" style="font-size:${mfCorps(mfNet(t),318,30,22)}px">${esc(t)}</div>`).join('')}</div>`:''}
    <div class="mn-date"><b>16 FÉVRIER</b><span>FORUM DE LILLE</span></div></div>`;
}
function mnMenuHtml(){
  const d=mnDernier();let rep='';
  if(d){const x=mnSlot(d),i=mnInfos(x);rep=`<button class="bouton jaune cj oct mn-rep" data-mn="reprendre|${d}"><b class="T">${x.abimee?'Reprendre la copie':'Reprendre'}</b><span>${esc(i.nom)} · ${mnLong(i.date)}</span>${ico('avant',26,3)}</button>`;}
  return `<div class="mn-accueil"><i class="mn-oct"></i>${mnAffiche()}<div class="mn-g"><h1 class="mn-titre">Cage<br>Legacy</h1>
    <nav class="mn-liste" aria-label="Modes de jeu">${MN_MENU.map(mnBouton).join('')}</nav><div class="mn-sep"></div>
    <nav class="mn-liste bas" aria-label="Autres">${mnBouton({t:'Options',s:'L’affichage, le son, les touches',act:'options',bas:1})}${mnBouton({t:'Quitter',bas:1})}</nav></div>${rep}</div>`;
}

/* ---- Mes parties : la dernière en grand, les deux autres à côté ---- */
const MN_CORB='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const mnFait=(l,v,cl='')=>`<div class="mn-fait ${cl}"><span class="etiq">${l}</span><b class="T">${v}</b></div>`;
const mnBt=(t,act,j)=>j?`<button class="bouton jaune cj oct mn-bt" data-mn="${act}">${t} ${ico('avant',30,3)}</button>`:`<button class="bb oct mn-bt" data-mn="${act}"><span class="oct">${t}</span></button>`;
function mnCarte(n,grand,jaune){
  const x=mnSlot(n),F=S.mn,nom=x?mnOrg(x.org).nom:'Libre',largeur=grand?960:700;
  const fs=mfCorps(nom,largeur,grand?150:84,44);
  const band=(tag,em)=>`<div class="mn-band"><i class="mn-bi" style="filter:${x?ogTeinte(nom)[1]||'none':'grayscale(1) brightness(.55)'}"></i><div class="mn-bh"><span class="etiq">Emplacement ${n}</span>${tag}</div><div class="mn-bn">${em?ogEmb(nom,grand?104:60):''}<span class="T" style="font-size:${fs}px">${esc(nom)}</span></div></div>`;
  const corb=`<button class="bb oct mn-corb" data-mn="effacer|${n}" aria-label="Effacer la partie de l’emplacement ${n}" title="Effacer"><span class="oct">${MN_CORB}</span></button>`;
  const cl=`mn-carte ${grand?'grand':'cote'} ${x?'':'libre'} mn-a`,org=x?`data-mnorg="${esc(nom)}"`:'';
  const cadre=c=>`<div class="mn-cw" ${org}>${pan(c,'height:100%',cl)}</div>`;
  if(!x)return cadre(band('',false)+`<div class="mn-cp">${mnBt(F.duo?'Nouvelle partie à deux':'Nouvelle partie',`creer|${n}`,jaune)}</div>`);
  const der=n===mnDernier()&&!F.choix&&!x.abimee,i=mnInfos(x);
  const tag=x.abimee?`<span class="mn-abi">${ico('medical',22)} Sauvegarde abîmée</span>`:der?'<span class="mn-der">Dernière partie</span>':x.invente?'<span class="relire">à relire</span>':'';
  if(x.abimee&&!x.copie)return cadre(band(tag,true)+`<div class="mn-cm"><p>La sauvegarde ne se lit plus et il n’y a pas de copie de secours.<span class="relire">à relire</span></p></div><div class="mn-cp">${F.choix?mnBt('Remplacer cette partie',`remplacer|${n}`,false):`<span class="mn-pt">Effacer pour libérer l’emplacement</span>${corb}`}</div>`);
  const faits=mnFait(x.abimee?'Copie du':'Date de jeu',mnCourt(i.date))+mnFait('Prochaine soirée',`Fight Night ${i.soiree}`)+mnFait('Place',`${i.place}/8`)+mnFait('En caisse',`${nb(i.caisse)} €`)
    +(x.abimee?`<div class="mn-fait large mn-nt"><span>La sauvegarde du ${mnCourt(S.date)} ne se lit plus.<span class="relire">à relire</span></span></div>`:mnFait('Sauvegardée',mnSauve(x.ts),'large'));
  const pied=F.choix?mnBt('Remplacer cette partie',`remplacer|${n}`,false):mnBt(x.abimee?'Reprendre la copie':'Reprendre',`reprendre|${n}`,jaune)+corb;
  return cadre(band(tag,true)+`<div class="mn-fg">${faits}</div><div class="mn-cp">${pied}</div>`);
}
function mnPartiesHtml(){
  const F=S.mn,d=mnDernier(),h=d||mnLibres()[0]||1,aut=[1,2,3].filter(n=>n!==h),nomH=mnSlot(h)?mnOrg(mnSlot(h).org).nom:'Split';
  const info=F.choix?`<div class="mn-info">Les trois emplacements sont pris. Choisis la partie à remplacer.<span class="relire">à relire</span></div>`:'';
  const rempl=!F.choix&&!F.duo&&!mnLibres().length?'<button class="bb oct mn-rempl" data-mn="choix"><span class="oct">Nouvelle partie</span></button>':'';
  return `${mnTunHtml(nomH,'doux')}<div class="mn-voil-g"></div>${rempl}${info}<div class="mn-pg ${F.choix?'mn-remp':''}">${mnCarte(h,true,!F.conf&&!F.choix)}<div class="mn-pc">${aut.map(n=>mnCarte(n,false,false)).join('')}</div></div>`;
}

/* ---- La nouvelle partie : une scène par organisation ---- */
const mnOgDe=o=>ogClasse().find(x=>x.nom===o.nom);
const MN_MESURES=[['pub','Spectateurs','par soirée'],['recN','Record','spectateurs'],['v5','Top 5 mondial','combattants'],['c30','Top 30 mondial','combattants']];
function mnRail(){
  return MN_ORGS.map(o=>{const on=o.id===S.mn.org,g=mnOgDe(o);return `<button class="mn-r oct mn-g-a ${on?'on':''}" data-mn="org|${o.id}" aria-pressed="${on}" style="--t:${ogTeinte(o.nom)[0]}">${ogEmb(o.nom,50)}<span class="T" style="font-size:${mfCorps(o.nom,270,40,24)}px">${esc(o.nom)}</span><small>${mnOrd(g.rang)}</small></button>`;}).join('');
}
function mnBande(k,o){
  const l=ogClasse(),v=[...l].sort((a,b)=>b[k]-a[k]||(a.nom===o.nom?-1:1));
  return `<div class="mn-b8" aria-hidden="true">${v.map(x=>`<i class="octr ${x.nom===o.nom?'on':''}"></i>`).join('')}</div>`;
}
function mnHero(o){
  const g=mnOgDe(o),c=ogTeinte(o.nom)[0];
  const t=([k,l,u])=>`<div class="mn-t"><span class="etiq">${l}</span><b class="T" data-v="${g[k]}">${nb(g[k])}</b><small>${u}</small>${mnBande(k,o)}</div>`;
  const place=`<div class="mn-t place"><span class="etiq">Place</span><b class="T">${g.rang}/8</b><small></small><div class="mn-b8" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i class="octr ${i+1===g.rang?'on':''}"></i>`).join('')}</div></div>`;
  const f=(l,v)=>`<div><span class="etiq">${l}</span><b>${v}</b></div>`;
  return `<div class="mn-hh" style="--t:${c}"><div class="mn-hl"><span class="mn-lieu">${esc(o.lieu)}</span><h2 class="T mn-hn" style="font-size:${mfCorps(o.nom,1290,186,80)}px">${esc(o.nom)}</h2><p class="mn-hp">${esc(o.t)}</p>
      <div class="mn-chips">${o.p.map(x=>`<span class="mn-ch"><b class="pl">+</b>${esc(x)}</span>`).join('')}${o.m.map(x=>`<span class="mn-ch"><b class="mo">−</b>${esc(x)}</span>`).join('')}</div></div>
    <div class="mn-tg">${place}${MN_MESURES.map(t).join('')}</div>
    <div class="mn-fa">${f('Effectif',`environ ${o.eff} combattants`)}${f('Âge moyen',`environ ${o.age} ans`)}${f('Popularité',o.pop)}${f('Plus grande salle',`${nb(o.salle)} places`)}${f('Bourses demandées',o.bou)}</div></div>`;
}
function mnNouvelleHtml(){
  const F=S.mn,o=mnOrg(F.org);
  return `${mnTunHtml(o.nom)}<div class="mn-voil-n"></div><div class="mn-nv" id="mnScene"><div class="mn-rail" id="mnRail">${mnRail()}<div class="mn-r off oct mn-g-a"><span>Créer ton organisation</span><small class="mn-av">À venir</small></div></div>
    <div class="mn-hero" id="mnHero">${mnHero(o)}</div>
    ${F.conf?'':`<button class="bouton jaune cj oct mn-cree" data-mn="lancer">Créer la partie ${ico('avant',36,3)}</button>`}</div>`;
}
/** Changer d'organisation : le tunnel accélère et change de couleur, le nom entre, les chiffres défilent. */
function mnChoisirOrg(id){
  const F=S.mn;if(id===F.org||F.vue!=='nouvelle')return;
  const i0=MN_ORGS.findIndex(o=>o.id===F.org),i1=MN_ORGS.findIndex(o=>o.id===id),sens=i1>i0?1:-1;F.org=id;
  const o=mnOrg(id),r=$('#mnRail'),h=$('#mnHero');if(!r||!h)return;
  r.querySelectorAll('.mn-r[data-mn]').forEach(e=>{const on=e.dataset.mn==='org|'+id;e.classList.toggle('on',on);e.setAttribute('aria-pressed',on);});
  h.innerHTML=mnHero(o);mnTunTeinte(o.nom);
  h.querySelectorAll('.mn-t b[data-v]').forEach(e=>mnCompte(e,+e.dataset.v));
  if(mnCalme())return;
  const n=h.querySelector('.mn-hn');n.animate([{opacity:0,transform:`translateX(${70*sens}px) skewX(${-7*sens}deg)`},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});
  h.querySelectorAll('.mn-lieu,.mn-hp,.mn-ch').forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:300,delay:50+i*28,easing:'ease-out',fill:'backwards'}));
  h.querySelectorAll('.mn-t').forEach((e,i)=>e.animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:320,delay:i*34,easing:'ease-out',fill:'backwards'}));
  h.querySelectorAll('.mn-b8 i.on').forEach(e=>e.animate([{transform:'scale(.2)'},{transform:'scale(1.3)',offset:.7},{transform:'scale(1)'}],{duration:380,delay:160,easing:'ease-out',fill:'backwards'}));
}
function mnOrgPas(d){const i=MN_ORGS.findIndex(o=>o.id===S.mn.org),n=MN_ORGS.length;mnChoisirOrg(MN_ORGS[(i+d+n)%n].id);}

/* ---- La création : six ans se jouent (le vrai écran calcule, la maquette reprend l'histoire validée) ---- */
const MN_GEN={raf:0,fin:0,duree:9500,t0:0,sortie:false,vus:0};
const MN_ANS=[2021,2022,2023,2024,2025,2026];
/** Les changements de ceinture de 2021 à 2026, lus dans la lignée de l'écran Ceintures. */
const mnSacres=(()=>{let c=null;return ()=>{
  if(c)return c;c=[];Object.entries(CE_L).forEach(([cat,l])=>l.forEach(r=>{const m=/^(\d{4})-(\d{2})$/.exec(r[1]||'');if(!m||+m[1]<2021||+m[1]>2026)return;const b=String(r[0]).split('|')[0],f=b[0]==='@'?parId(b.slice(1)):null;c.push({an:+m[1],mois:+m[2]-1,nom:f?`${f.prenom} ${f.nom}`:b,cat});}));
  c.sort((a,b)=>a.an-b.an||a.mois-b.mois);return c;};})();
const mnGenDate=p=>2021+Math.min(.9999,p)*6;
function mnCreationHtml(){
  const o=mnOrg(S.mn.org),c=ogTeinte(o.nom)[0];
  const cpt=(id,l)=>`<div class="mn-gc"><b class="T" id="${id}">0</b><span class="etiq">${l}</span></div>`;
  /* Octogone régulier de 600 px : le contour se trace avec les six ans. */
  const P='M176 12H424L588 176V424L424 588H176L12 424V176Z';
  return `${mnTunHtml(o.nom,'vif')}<div class="mn-voil-c" id="mnVoile"></div><div class="mn-cr" style="--t:${c}">
    <div class="mn-cg"><div class="mn-ci mn-g-a">${ogEmb(o.nom,92)}<div><div class="T mn-cnom" style="font-size:${mfCorps(o.nom,440,84,44)}px">${esc(o.nom)}</div><div class="mn-cl">${esc(o.lieu)}</div></div></div>
      <div class="mn-gcs mn-g-a">${cpt('mnCs','Soirées')}${cpt('mnCc','Combats')}${cpt('mnCh','Ceintures')}</div>
      <div class="mn-fil mn-g-a"><div class="etiq">Changements de ceinture</div><div id="mnFil"></div></div></div>
    <div class="mn-ring"><svg viewBox="0 0 600 600" aria-hidden="true"><path d="${P}" class="fd"/><path d="${P}" class="tr" id="mnTr" pathLength="100"/></svg>
      <div class="mn-rt" role="status" aria-live="off"><span class="etiq" id="mnRe">Six ans avant ton arrivée</span><b class="T" id="mnAn">2021</b><span class="mn-rs" id="mnRs">Split Fight Night 1</span></div></div>
    <div class="mn-fr2"><div class="mn-bar" role="progressbar" aria-label="Les six ans" aria-valuemin="0" aria-valuemax="62" aria-valuenow="0" id="mnBar"><b id="mnBb"></b>${Array.from({length:5},(_,i)=>`<i style="left:${(i+1)/6*100}%"></i>`).join('')}</div>
      <div class="mn-ans">${MN_ANS.map(y=>`<span data-an="${y}">${y}</span>`).join('')}</div></div></div>`;
}
function mnGenMaj(p){
  const n=Math.min(62,Math.floor(p*62)+(p>=1?0:1)),d=mnGenDate(p),an=p>=1?2026:Math.floor(d),L=mnSacres(),vus=p>=1?L.length:L.filter(x=>x.an+x.mois/12<=d).length;
  const T=(s,v)=>{const e=$(s);if(e&&e.textContent!==v)e.textContent=v;};
  T('#mnCs',nb(n));T('#mnCc',nb(n*9));T('#mnCh',nb(vus));T('#mnAn',String(an));
  T('#mnRs',p>=1?'62 soirées, de 2021 à 2026':`Split Fight Night ${n}`);T('#mnRe',p>=1?'Six ans sont écrits':'Six ans avant ton arrivée');
  const tr=$('#mnTr');if(tr)tr.style.strokeDashoffset=String(100-p*100);
  const bb=$('#mnBb');if(bb)bb.style.width=(p*100).toFixed(2)+'%';
  const bar=$('#mnBar');if(bar)bar.setAttribute('aria-valuenow',n);
  document.querySelectorAll('.mn-ans span').forEach(e=>{const y=+e.dataset.an;e.classList.toggle('fait',y<an||p>=1);e.classList.toggle('cours',y===an&&p<1);});
  if(vus!==MN_GEN.vus){const fil=$('#mnFil');if(fil){const neuf=vus>MN_GEN.vus;MN_GEN.vus=vus;
    fil.innerHTML=L.slice(Math.max(0,vus-6),vus).reverse().map((x,i)=>`<div class="mn-fl2 ${i===0&&neuf?'neuf':''}"><b>${esc(x.nom)}</b><span>${esc(courte(x.cat))} · ${MN_MOIS[x.mois]} ${x.an}</span></div>`).join('');
    const a=fil.querySelector('.neuf');if(a&&!mnCalme())a.animate([{opacity:0,transform:'translateX(-22px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});}}
}
function mnGenStop(){cancelAnimationFrame(MN_GEN.raf);clearTimeout(MN_GEN.fin);MN_GEN.raf=0;MN_GEN.fin=0;MN_GEN.sortie=false;}
function mnGenLancer(){
  mnGenStop();MN_GEN.vus=0;mnTunLancer(2600);
  if(S.mn.gelGen!==null){mnGenMaj(S.mn.gelGen);return;}
  MN_GEN.t0=performance.now();
  const f=t=>{if(S.mn.vue!=='creation'||S.ecran!=='menu')return;const k=Math.min(1,(t-MN_GEN.t0)/MN_GEN.duree);mnGenMaj(k);
    if(k<1)MN_GEN.raf=requestAnimationFrame(f);else MN_GEN.fin=setTimeout(mnGenSortie,850);};
  MN_GEN.raf=requestAnimationFrame(f);
}
/** Un clic passe la création ; rien n'est écrit avant cette sortie. */
function mnGenPasser(){if(S.mn.gelGen!==null||MN_GEN.sortie)return;cancelAnimationFrame(MN_GEN.raf);clearTimeout(MN_GEN.fin);mnGenMaj(1);mnGenSortie();}
function mnGenSortie(){
  if(MN_GEN.sortie)return;MN_GEN.sortie=true;
  if(mnCalme()){mnCreer();return;}
  MN_TUN.forEach(a=>a.updatePlaybackRate(7));
  const r=$('.mn-ring');if(r)r.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-50%) scale(3.4)',opacity:0}],{duration:620,easing:'cubic-bezier(.6,0,.9,.3)',fill:'forwards'});
  const v=$('#mnVoile');if(v)v.animate([{background:'rgba(13,11,11,.2)'},{background:'#0D0B0B'}],{duration:620,easing:'ease-in',fill:'forwards'}).onfinish=mnCreer;else mnCreer();
}

/* ---- Le chargement d'une partie : court, un clic le passe ---- */
function mnChargeHtml(n){
  const x=mnSlot(n),i=mnInfos(x);
  return `${mnTunHtml(i.nom,'vif')}<div class="mn-voil-c"></div><div class="mn-ch2" role="status">${ogEmb(i.nom,120)}<b class="T" style="font-size:${mfCorps(i.nom,1100,170,70)}px">${esc(i.nom)}</b><span>${mnLong(i.date)} · Fight Night ${i.soiree}</span><div class="mn-chb"><i id="mnChb"></i></div></div>`;
}

/* ---- Confirmation en chiffres (charte S6) ---- */
function mnConfirme(){
  const F=S.mn,x=mnSlot(F.slot);if(!x)return '';
  const i=mnInfos(x),ef=F.conf==='effacer',lisible=mnLisible(x);
  const c=(l,v)=>`<div><span class="etiq">${l}</span><b class="T">${v}</b></div>`;
  const cases=c('Emplacement',F.slot)+c('Organisation',esc(i.nom))+(lisible?c('Date de jeu',mnCourt(i.date))+c('En caisse',`${nb(i.caisse)} €`):c('État','Illisible')+c('Copie','Aucune'));
  const apres=ef?'L’emplacement redevient libre. Sa copie de secours est effacée aussi. Cette partie ne pourra plus être reprise.'
    :`Une partie ${esc(mnOrg(F.org).nom)} commence le 4 janvier 2027 à la place. Sa copie de secours est effacée aussi. L’ancienne partie ne pourra plus être reprise.`;
  return `<div class="mn-voile" data-mnvoile><div class="mn-dlg apparait" role="dialog" aria-modal="true" aria-labelledby="mnDt">${pan(`<div class="pt"><h2 id="mnDt">${ef?'Effacer cette partie ?':'Remplacer cette partie ?'}</h2></div>
    <div class="mn-cf">${cases}</div><p class="mn-cn2">${apres}<span class="relire">à relire</span></p>
    <div class="mn-cb"><button class="bb oct" id="mnRevenir" data-mn="revenir"><span class="oct">Revenir</span></button><button class="bouton jaune cj oct" data-mn="${ef?'okeffacer':'okecraser'}">${ef?'Effacer la partie':'Remplacer la partie'}</button></div>`)}</div></div>`;
}

/* ---- Rendu ---- */
const mnEtat=()=>JSON.stringify({vue:S.mn.vue,slot:S.mn.slot,org:S.mn.org,duo:S.mn.duo,choix:S.mn.choix,ecrase:S.mn.ecrase});
const mnRestaurer=j=>Object.assign(S.mn,JSON.parse(j),{conf:null,anim:true});
const MN_PLAQUES={parties:()=>S.mn.duo?'Duo':'Mes parties',nouvelle:()=>'Nouvelle partie',creation:()=>'Nouvelle partie'};
const mnRendreBase=rendre;
rendre=function(){
  const b=document.body;
  if(S.ecran!=='menu'){mnTunStop();mnGenStop();b.classList.remove('mn-mode');$('#corps').style.left='';mnRendreBase();return;}
  const F=S.mn;mnTunStop();mnGenStop();b.classList.remove('sd-mode','pp-mode');b.classList.add('mn-mode');
  const al=$('#alerte');al.className='alerte-l';al.innerHTML='';$('#barre').innerHTML='';$('#corps').style.top='0';
  if(F.vue==='menu'||F.vue==='charge')$('#entete').innerHTML='';
  else{rendreEntete(MN_PLAQUES[F.vue]());document.querySelectorAll('#entete .boite,#bContinuer').forEach(e=>e.remove());
    $('#entete').insertAdjacentHTML('afterbegin',`<div class="mn-logo">${LOGO}<div><b>CAGE</b><i>LEGACY</i></div></div>`);
    if(F.vue==='nouvelle'||F.vue==='creation')$('#entete').insertAdjacentHTML('beforeend',`<span class="mn-empl">${F.ecrase?`Remplace l’emplacement ${F.slot}`:`Emplacement ${F.slot}`}</span>`);}
  const h=F.vue==='menu'?mnMenuHtml():F.vue==='parties'?mnPartiesHtml():F.vue==='nouvelle'?mnNouvelleHtml():F.vue==='creation'?mnCreationHtml():mnChargeHtml(F.slot);
  $('#corps').innerHTML=h+(F.conf?mnConfirme():'');
  $('#zone').classList.toggle('fiche-ouverte',false);
  if(F.vue==='parties')mnTunLancer(16000);
  if(F.vue==='nouvelle'){mnTunLancer(11000);if(F.anim)document.querySelectorAll('#mnHero .mn-t b[data-v]').forEach(e=>mnCompte(e,+e.dataset.v));}
  if(F.vue==='creation')mnGenLancer();
  if(F.vue==='charge')mnTunLancer(2200);
  mnEntrees();
  if(F.conf){const r=$('#mnRevenir');if(r)r.focus();}
};

/* ---- Navigation : Retour et Avant suivent chaque pas ---- */
function mnPas(maj){S.hist.push({mn:mnEtat()});S.futur=[];maj();S.mn.conf=null;S.mn.anim=true;rendre();}
const mnAllerBase=aller;
aller=function(ec){
  if(ec==='menu'){
    if(S.fiche)fermerFiche(false);
    if(S.ecran!=='menu'){S.hist.push(S.ecran);S.futur=[];}
    S.ecran='menu';Object.assign(S.mn,{vue:'menu',conf:null,duo:false,choix:false,ecrase:false,anim:true});rendre();return;
  }
  if(S.ecran!=='menu'){mnAllerBase(ec);return;}
  const e=mnEtat();mnAllerBase(ec);
  if(S.ecran!=='menu'&&S.hist[S.hist.length-1]==='menu')S.hist[S.hist.length-1]={mn:e};
};
/** Options › Changer de partie : ouvre les emplacements, la partie en cours reste derrière Retour. */
function mnOuvrirParties(){
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='menu'){S.hist.push(S.ecran);S.futur=[];}
  S.ecran='menu';Object.assign(S.mn,{vue:'parties',conf:null,duo:false,choix:false,ecrase:false,anim:true});rendre();
}
function mnRetour(){
  const F=S.mn;
  if(S.ecran==='menu'&&F.vue==='charge')return true;
  if(S.ecran==='menu'&&F.conf){F.conf=null;rendre();return true;}
  const h=S.hist[S.hist.length-1];
  /* Abandonner la création ne laisse rien à refaire : Avant ne la relance pas. */
  const garde=()=>{if(S.ecran==='menu'&&F.vue==='creation')return;S.futur.push(S.ecran==='menu'?{mn:mnEtat()}:S.ecran);};
  if(h&&h.mn){S.hist.pop();garde();S.ecran='menu';mnRestaurer(h.mn);rendre();return true;}
  if(S.ecran==='menu'&&typeof h==='string'){S.hist.pop();garde();S.ecran=h;rendre();return true;}
  return false;
}
function mnAvant(){
  const f=S.futur[S.futur.length-1];
  if(f&&f.mn){S.futur.pop();S.hist.push(S.ecran==='menu'?{mn:mnEtat()}:S.ecran);S.ecran='menu';mnRestaurer(f.mn);rendre();return true;}
  if(S.ecran==='menu'&&typeof f==='string'){S.futur.pop();S.hist.push({mn:mnEtat()});S.ecran=f;rendre();return true;}
  return false;
}

/* ---- Actions ---- */
function mnEntrer(n){
  const x=mnSlot(n);if(!x)return;clearTimeout(mnEntrer.t);
  S.mn.donnees.dernier=n;
  if(x.abimee){S.date=new Date(...x.copie);S.jours=Math.round((new Date(2027,1,16)-S.date)/MN_JOUR);delete x.abimee;delete x.copie;x.ts=Date.now();}
  mnGarder();S.mn.vue='menu';
  if(x.neuve){location.href=MN_ARRIVEE;return;}
  if(S.op)S.op.sansPartie=false;
  S.hist=[];S.futur=[];S.ecran='accueil';rendre();
}
function mnReprendre(n){
  const x=mnSlot(n);if(!mnLisible(x))return;
  if(x.org!=='split'){toast('Cette maquette ne joue que Split : '+esc(mnOrg(x.org).nom)+' s’ouvrira dans le jeu.');return;}
  if(mnCalme()){mnEntrer(n);return;}
  Object.assign(S.mn,{vue:'charge',slot:n,conf:null,anim:true});rendre();
  const b=$('#mnChb');if(b)b.animate([{width:'0%'},{width:'100%'}],{duration:680,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'});
  mnEntrer.t=setTimeout(()=>mnEntrer(n),700);
}
function mnNouvelle(n,ecrase){mnPas(()=>Object.assign(S.mn,{vue:'nouvelle',slot:n,ecrase:!!ecrase,choix:false}));}
function mnCreer(){
  const F=S.mn;F.donnees.slots[F.slot]={org:'split',neuve:true,ts:Date.now()};F.donnees.dernier=F.slot;mnGarder();
  /* Une partie neuve repart sans les deux espoirs d'une arrivée précédente (clé de la maquette). */
  try{localStorage.removeItem(PP_CLE);}catch(e){}
  location.href=MN_ARRIVEE;
}
function mnEffacer(){
  const F=S.mn,n=F.slot;F.donnees.slots[n]=null;if(F.donnees.dernier===n)F.donnees.dernier=null;F.conf=null;S.futur=[];
  mnGarder();rendre();toast(`Partie effacée. L’emplacement ${n} est libre.`);
}
function mnAction(a,v){
  const F=S.mn;
  if(a==='reprendre')return mnReprendre(+v);
  if(a==='parties')return mnPas(()=>Object.assign(F,{vue:'parties',choix:false,duo:false}));
  if(a==='duo')return mnPas(()=>Object.assign(F,{vue:'parties',choix:false,duo:true}));
  if(a==='options'){if(S.op)S.op.sansPartie=true;return aller('options');}
  if(a==='creer'){if(F.duo)return toast('La création à deux reste celle du jeu : les noms, puis deux organisations.');return mnNouvelle(+v,false);}
  if(a==='choix')return mnPas(()=>{F.choix=true;});
  if(a==='remplacer')return mnNouvelle(+v,true);
  if(a==='effacer'){F.slot=+v;F.conf='effacer';return rendre();}
  if(a==='org')return mnChoisirOrg(v);
  if(a==='lancer'){
    if(F.org!=='split')return toast('Cette maquette ne joue que Split : l’Arrivée des autres organisations n’existe pas encore.');
    if(F.ecrase&&mnSlot(F.slot)){F.conf='ecraser';return rendre();}
    return mnPas(()=>{F.vue='creation';});
  }
  if(a==='revenir'){F.conf=null;return rendre();}
  if(a==='okeffacer')return mnEffacer();
  if(a==='okecraser')return mnPas(()=>{F.vue='creation';});
}

/* ---- Clics, molette, cliquer-tirer ; touches cachées (T1) ---- */
document.addEventListener('click',e=>{
  const t=e.target,stop=()=>e.stopImmediatePropagation();
  if(!S.fiche&&t.closest('#bRetour')&&mnRetour()){stop();return;}
  if(!S.fiche&&t.closest('#bAvant')&&mnAvant()){stop();return;}
  if(S.ecran!=='menu'||S.fiche)return;
  if(S.mn.vue==='charge'){stop();mnEntrer(S.mn.slot);return;}
  if(S.mn.vue==='creation'&&t.closest('#corps')){stop();mnGenPasser();return;}
  if(!t.closest('#corps'))return;
  if(mnGlisse.vient){mnGlisse.vient=false;stop();return;}
  const el=t.closest('[data-mn]');
  if(el){stop();const [a,v]=el.dataset.mn.split('|');mnAction(a,v);return;}
  if(S.mn.conf&&t.closest('[data-mnvoile]')&&!t.closest('.mn-dlg')){stop();S.mn.conf=null;rendre();return;}
  stop();
},true);
const mnGlisse={x:null,vient:false};
document.addEventListener('pointerdown',e=>{mnGlisse.x=(S.ecran==='menu'&&S.mn.vue==='nouvelle'&&!S.mn.conf&&e.target.closest('#mnHero'))?e.clientX:null;});
document.addEventListener('pointerup',e=>{if(mnGlisse.x===null)return;const d=e.clientX-mnGlisse.x;mnGlisse.x=null;if(Math.abs(d)>70){mnGlisse.vient=true;mnOrgPas(d<0?1:-1);setTimeout(()=>{mnGlisse.vient=false;},0);}});
let mnMolette=0;
document.addEventListener('wheel',e=>{
  if(S.ecran!=='menu'||S.mn.vue!=='nouvelle'||S.mn.conf||!e.target.closest('#mnScene'))return;
  const n=performance.now();if(n-mnMolette<240)return;mnMolette=n;mnOrgPas(e.deltaY>0?1:-1);
},{passive:true});
document.addEventListener('mouseover',e=>{
  if(S.ecran!=='menu'||S.mn.vue!=='parties'||S.mn.conf)return;
  const c=e.target.closest&&e.target.closest('[data-mnorg]');if(c)mnTunTeinte(c.dataset.mnorg,false);
});
document.addEventListener('keydown',e=>{
  if(S.ecran!=='menu'||S.fiche)return;const F=S.mn;
  if(e.key==='Escape'&&(F.conf||F.vue!=='menu')){e.stopImmediatePropagation();e.preventDefault();mnRetour();return;}
  if(F.vue==='nouvelle'&&!F.conf&&(e.key==='ArrowDown'||e.key==='ArrowRight')){e.preventDefault();mnOrgPas(1);}
  if(F.vue==='nouvelle'&&!F.conf&&(e.key==='ArrowUp'||e.key==='ArrowLeft')){e.preventDefault();mnOrgPas(-1);}
},true);

/* ---- Lancement ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search),F=S.mn;
  if(q.get('ecran')!=='menu')return;
  const et=q.get('mnetat');
  if(['aucune','une','libre','pleines','abimee','illisible'].includes(et)){F.demo=true;F.donnees=mnEtatDemo(et);}
  F.mouv=q.get('mnmouv')==='1';F.duo=q.get('mnduo')==='1';
  const v=q.get('mnvue');if(['menu','parties','nouvelle','creation'].includes(v))F.vue=v;
  const n=+q.get('mnslot');if([1,2,3].includes(n))F.slot=n;else if(F.vue==='nouvelle'||F.vue==='creation')F.slot=mnLibres()[0]||1;
  const o=q.get('mnorg');if(MN_ORGS.some(x=>x.id===o))F.org=o;
  if(F.vue==='parties'&&q.get('mnchoix')==='1')F.choix=true;
  const g=parseFloat(q.get('mngen'));if(F.vue==='creation'&&g>=0&&g<=1)F.gelGen=g;
  const c=q.get('mnconf');
  if(c==='effacer'&&mnSlot(F.slot)){F.vue='parties';F.conf='effacer';}
  if(c==='ecraser'&&mnSlot(F.slot)){F.vue='nouvelle';F.ecrase=true;F.conf='ecraser';}
  if(F.vue==='nouvelle'&&mnSlot(F.slot))F.ecrase=true;
  S.hist=F.vue==='menu'?[]:[{mn:JSON.stringify({vue:'menu',slot:1,org:'split',duo:false,choix:false,ecrase:false})}];S.futur=[];
  S.ecran='menu';F.anim=true;rendre();
});
/* ==== [FIN ANCRE] ==== */
