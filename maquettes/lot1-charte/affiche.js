"use strict";
/* Maquette — Carte et préliminaires réunis sur un seul écran « Carte » (R12, R14, Q12, Q14 ; demande du 08/11 : « au même endroit »).
   Version 2 : le bilan en tête, la carte en lignes pleine largeur (chaque combat dit en phrases ce qui le fait), les préliminaires
   dessous, les combattants à droite ; un combat complet s'ouvre à droite, en onglets (L'enjeu, Comparaison, Après).
   Chargé après cadre.js, fiche.js, effectif.js et fiche2.js, dont il reprend l'effectif fictif et la fiche.
   Préfixe af- partout : le scope est partagé avec les autres fichiers de la maquette. Données fictives, aucune sauvegarde. */

/* « Préliminaires » quitte la barre : ils vivent sur la carte (décision du 08/11). */
{const i=ITEMS.findIndex(x=>x[0]==='prelims');if(i>=0)ITEMS.splice(i,1);}

/* ---- Données ---- */
const afId=(cat,rang)=>{const c=COMBATTANTS.find(x=>x.cat===cat&&x.rang===rang);return c?c.id:null;};
const afCourt=cat=>{for(const s of ['H','F'])for(const [c,k] of CATS[s])if(c===cat)return k+(s==='F'?' F':'');return cat||'';};
const afCatMin=cat=>cat.replace(/ F$/,' féminin').toLowerCase();
const afRangN=c=>c.rang==='C'?0:typeof c.rang==='number'?c.rang:40;
/** Taille d'un nom pour qu'il tienne sans être coupé (règle 11 : un nom n'est jamais coupé). */
const afTaille=(nom,base,largeur)=>Math.min(base,Math.floor(largeur/(nom.length*.43)));
/* Les demandes des combattants (sans le mot « promesse », C4) et ce que le médecin surveille (effectif.js). */
const AF_DEMANDES={belkacem:{t:'Un adversaire classé dans le top 3',court:'veut un top 3',tenue:c=>afRangN(c)<=3}};
const AF_RISQUES={
  bello:['alerte','att','Bello : gêne à l’épaule gauche, examen le 18 janvier.','Bello : épaule à surveiller'],
  nana:['medical','neu','Nana, 37 ans : trois mois sans sparring dur conseillés après ce combat.'],
  lecomte:['medical','att','Lecomte sort de suspension le 6 février : dix jours pour se préparer.','Lecomte sort de suspension le 6 févr.'],
  labbe:['alerte','att','Labbé pourrait refuser : il ne veut que la ceinture.','Labbé pourrait refuser'],
  vanbelle:['contrats','neu','Van Belle : dernier combat de son contrat.'],
};
const AF_HIST={
  'mezouar|nana':'Mezouar a fait taper Nana en 2025. Nana n’a jamais eu sa revanche, et sa ceinture est en jeu.',
  'meziane|rachidi':'Rachidi a gagné ses cinq derniers combats. Meziane est la seule à l’avoir emmenée jusqu’à la décision.',
  'belkacem|bello':'Belkacem voulait un top 3. Bello est n° 3 et n’a perdu qu’une fois en deux ans.',
  'belkacem|labbe':'Labbé est n° 2 et ne veut que la ceinture. Il faudra le convaincre.',
  'belkacem|darras':'Darras est de Lille : le Forum sera pour lui, et Belkacem aime ce genre de soirée.',
  'carvalho|vanbelle':'Deux poids légers qui n’ont pas combattu depuis l’été. Leïla veut les relancer.',
  'darras|labbe':'Le n° 2 contre l’enfant du pays. Labbé n’aime pas les salles qui sifflent.',
};
/* Ce que Leïla propose quand tu le lui demandes (Q7 : une aide, jamais imposée). */
const AF_LEILA={
  belkacem:[['bello','Le top 3 qu’il réclame'],['labbe','Le n° 2, mais il pourrait refuser'],['darras','À la maison : Darras est de Lille']],
  vide:[['labbe','darras','Le n° 2 contre l’enfant du pays'],[afId('Poids coq F',1),afId('Poids coq F',4),'Les deux meilleures du classement, libres'],[afId('Poids mi-moyen',1),afId('Poids mi-moyen',3),'Les deux meilleurs mi-moyens libres']],
};

S.af={
  m:[{a:'nana',b:'mezouar'},{a:'rachidi',b:'meziane'},{a:'belkacem',b:null},{a:null,b:null}],
  p:[{a:'musaev',b:afId('Poids mouche',9)},{a:afId('Poids coq F',3),b:afId('Poids coq F',6)},{a:afId('Poids mi-moyen',6),b:afId('Poids mi-moyen',8)},
     {a:afId('Poids paille F',4),b:afId('Poids paille F',6)},{a:'vanbelle',b:'carvalho'},{a:afId('Poids lourd',10),b:afId('Poids lourd',13)}],
  sel:'m2',tab:'m',vue:'liste',onglet:'enjeu',cat:'Poids léger',tri:'rang',dos:0,menu:false,leila:false,apercu:null,retouche:false,valide:false,resume:false,engage:false,annuler:null,refaits:0,
};

/** Deux combattants du même nom sur une soirée prêtent à confusion : Leïla décale d'un rang. */
function afSansDoublon(){
  const vus=new Set(S.af.m.flatMap(f=>[f.a,f.b]).filter(Boolean).map(id=>parId(id).nom));
  for(const f of S.af.p)for(const s of ['a','b']){let c=parId(f[s]);if(!c)continue;let n=0;
    while(vus.has(c.nom)&&n++<9&&typeof c.rang==='number'){const x=COMBATTANTS.find(y=>y.cat===c.cat&&y.rang===c.rang+1);if(!x)break;c=x;}
    f[s]=c.id;vus.add(c.nom);}
}
afSansDoublon();

/* ---- Lecture de la carte ---- */
const afFight=k=>S.af[k[0]][+k.slice(1)];
const afCles=()=>[...S.af.m.map((_,i)=>'m'+i),...S.af.p.map((_,i)=>'p'+i)];
const afCat=f=>{const c=parId(f.a)||parId(f.b);return c?c.cat:null;};
const afComplet=f=>!!(f.a&&f.b);
const afTitre=f=>{const A=parId(f.a),B=parId(f.b);return !!(A&&B&&A.cat===B.cat&&(A.rang==='C'||B.rang==='C'));};
const afRole=k=>k[0]==='p'?`Préliminaire ${+k.slice(1)+1}`:['Combat principal','Co-principal','Combat 3','Combat 4'][+k.slice(1)];
const afRounds=(k,f)=>k==='m0'||afTitre(f)?5:3;
function afEngages(){const m=new Map();for(const k of afCles()){const f=afFight(k);if(f.a)m.set(f.a,k);if(f.b)m.set(f.b,k);}return m;}
const afRetour=r=>/^\d/.test(r)?`le ${r}`:`en ${r}`;
/** Pourquoi un combattant est libre ou non : toujours une raison écrite (R12, point 11). */
function afEtat(c){
  const k=afEngages().get(c.id);
  if(k)return{ok:false,eng:k,txt:`À l’affiche · ${afRole(k).toLowerCase()}`};
  if(c.statut==='blesse')return{ok:false,txt:`Blessé · retour ${afRetour(c.retour)}`,col:'var(--neg)'};
  if(c.statut==='pause')return{ok:false,txt:'En pause · reprend en mars'};
  if(c.statut==='refus')return{ok:false,txt:'Refuse : attend une prolongation',col:'var(--jaune)',act:'Proposer ›'};
  if(c.statut==='suspendu')return{ok:true,susp:c.retour};
  return{ok:true};
}
const afForme=c=>c.serie.slice(-3)==='vvv';   /* la série est rangée du plus ancien au plus récent */
const afInactif=c=>(S.date-c.dernier)/864e5>150;

/** Ce qui fait le combat : des phrases, jamais une note (charte H1). p = atout, m = faiblesse, a = à surveiller. */
function afRaisons(k,f){
  const A=parId(f.a),B=parId(f.b),l=[];if(!A||!B)return l;
  const ra=afRangN(A),rb=afRangN(B),t=afTitre(f);
  if(t)l.push(['p','La ceinture est en jeu']);
  if([A.id,B.id].sort().join('|')==='mezouar|nana')l.push(['p','La revanche de 2025']);
  if(!t&&ra<=3&&rb<=3)l.push(['p','Le haut du classement']);
  for(const c of [A,B]){const d=AF_DEMANDES[c.id];if(d)l.push(d.tenue(c===A?B:A)?['p',`Demande de ${c.nom} tenue`]:['m',`${c.nom} voulait un top 3`]);}
  if(afForme(A)&&afForme(B))l.push(['p','Deux séries de victoires']);
  else if(afForme(A)||afForme(B))l.push(['p',`${(afForme(A)?A:B).nom} reste sur trois victoires`]);
  if(afInactif(A)&&afInactif(B))l.push(['p','Relance deux inactifs']);
  if(A.id==='darras'||B.id==='darras')l.push(['p','Darras combat chez lui, à Lille']);
  const e=Math.abs(ra-rb);if(!t&&e>=5)l.push(['m',`${e} places d’écart au classement`]);
  if(ra>8&&rb>8)l.push(['m','Deux noms peu connus du public']);
  for(const c of [A,B]){const r=AF_RISQUES[c.id];if(r&&r[1]==='att')l.push(['a',r[3]]);}
  if(A.id==='vanbelle'||B.id==='vanbelle')l.push(['a','Van Belle : fin de contrat']);
  if(!l.some(x=>x[0]==='p')&&e<=3)l.unshift(['p','Un combat serré sur le papier']);
  return l;
}
const afRl=([c,t])=>`<div class="af-rl ${c}"><span class="sg">${c==='p'?'+':c==='m'?'−':'!'}</span><span>${esc(t)}</span></div>`;

/* ---- Bilan : recette, bourses, remplissage (les préliminaires pèsent très peu, Q12c) ---- */
function afValeur(k,f){
  if(!afComplet(f))return 0;
  const A=parId(f.a),B=parId(f.b),moy=(afRangN(A)+afRangN(B))/2;
  if(k[0]==='p')return 1500;
  return [160000,90000,60000,45000][+k.slice(1)]+(afTitre(f)?40000:0)+Math.max(0,10-moy)*3000;
}
const afBourse=c=>c.rang==='C'?60000:5000+Math.max(0,20-afRangN(c))*700;
function afChiffres(){
  let rec=330000,b=0;
  for(const k of afCles()){const f=afFight(k);rec+=afValeur(k,f);for(const id of [f.a,f.b])if(id)b+=afBourse(parId(id));}
  return{bas:Math.round(rec*.92/1000)*1000,haut:Math.round(rec*1.08/1000)*1000,moy:rec,bourses:Math.round(b/1000)*1000,
    plein:Math.min(100,Math.round((S.preventes+(rec-330000)/420)/40))};
}
const afCourtRole=k=>k[0]==='p'?`P${+k.slice(1)+1}`:['Principal','Co-principal','Combat 3','Combat 4'][+k.slice(1)];
function afDit(){
  if(!afComplet(S.af.m[0]))return['Rien d’annoncé pour le Forum. Les places partent lentement.','Tableau Noir'];
  const vides=S.af.m.filter(f=>!afComplet(f)).length;
  if(vides>=2)return['Une belle tête d’affiche, et pas encore de carte derrière.','Le Forum'];
  if(vides===1)return['Il ne manque qu’un combat pour que Lille ait une vraie soirée.','Tableau Noir'];
  return['Nana–Mezouar en haut, et derrière, rien à jeter. Le Forum sera plein.','Cage Hebdo'];
}
/** Ce qu'il reste à régler : jaune quand c'est à toi d'agir, gris pour une information. */
function afARegler(){
  const l=[],vides=S.af.m.map((f,i)=>[f,'m'+i]).filter(([f])=>!afComplet(f));
  if(vides.length)l.push(['att','carte',`${vides.length} combat${vides.length>1?'s':''} à placer en carte principale`,vides[0][1]]);
  const pv=S.af.p.map((f,i)=>[f,'p'+i]).filter(([f])=>!afComplet(f));
  if(pv.length)l.push(['att','prelims',`${pv.length} préliminaire${pv.length>1?'s':''} à compléter`,pv[0][1]]);
  const eng=afEngages(),kb=eng.get('belkacem'),fb=kb&&afFight(kb),adv=fb&&parId(fb.a==='belkacem'?fb.b:fb.a);
  if(!adv&&!S.af.engage)l.push(['att','messages','Belkacem attend une réponse à sa demande',kb||null]);
  else if(adv&&afRangN(adv)>3)l.push(['att','messages','Belkacem voulait un top 3 : il le saura',kb]);
  for(const id of Object.keys(AF_RISQUES))if(eng.has(id)&&AF_RISQUES[id][1]==='att')l.push(['att',AF_RISQUES[id][0],AF_RISQUES[id][3],eng.get(id)]);
  if(eng.has('vanbelle'))l.push(['neu','contrats','Van Belle : dernier combat du contrat',eng.get('vanbelle')]);
  return l;
}
function afStrip(){
  const c=afChiffres(),[dit,src]=afDit(),n=S.af.m.filter(afComplet).length,np=S.af.p.filter(afComplet).length;
  return pan(`<div class="af-bc" style="width:150px"><span class="etiq">La carte</span><span class="T">${n} / 4</span><span class="sous">et ${np} / 6 préliminaires</span></div>
    <div class="af-bc" style="width:340px"><span class="etiq">Recette estimée</span><span class="T" id="afRec">${nb(c.bas)} – ${nb(c.haut)} €</span><span class="sous">Forum de Lille plein à ${c.plein} % (prévision)</span></div>
    <div class="af-bc" style="flex:1;flex-shrink:1"><span class="etiq">Ce qu’on en dit</span><div class="af-dit">« ${esc(dit)} » <b>${esc(src)}</b></div></div>
    <div class="af-bc af-dosc" style="width:480px">${afDossiersHtml()}</div>`,'height:100%','af-strip');
}

/* ---- La carte : une ligne par combat ---- */
const AF_POIGNEE='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="4" width="3.4" height="3.4"/><rect x="13.6" y="4" width="3.4" height="3.4"/><rect x="7" y="10.3" width="3.4" height="3.4"/><rect x="13.6" y="10.3" width="3.4" height="3.4"/><rect x="7" y="16.6" width="3.4" height="3.4"/><rect x="13.6" y="16.6" width="3.4" height="3.4"/></svg>';
function afMarques(f){
  const ids=[f.a,f.b].filter(Boolean),out=[];
  for(const id of ids){const d=AF_DEMANDES[id];if(d){const adv=parId(f.a===id?f.b:f.a);if(adv)out.push(d.tenue(adv)?`<span class="ok" title="Sa demande est tenue">${ico('ok',19,2.6)}</span>`:`<span class="att" title="Sa demande n’est pas tenue">${ico('messages',19)}</span>`);}}
  for(const id of ids){const r=AF_RISQUES[id];if(r)out.push(`<span class="${r[1]}" title="${esc(r[2])}">${ico(r[0],19)}</span>`);}
  return out.join('');
}
/** L'aperçu au survol : le combattant survolé se pose « pour voir » à la place libre du combat choisi. */
function afAvecApercu(k){
  const f=afFight(k);let A=parId(f.a),B=parId(f.b),apA=false,apB=false;
  const ap=S.af.sel===k&&S.af.apercu&&!(A&&B)?parId(S.af.apercu):null;
  if(ap){if(A){B=ap;apB=true;}else if(B){A=ap;apA=true;}}
  return{A,B,apA,apB};
}
const AF_C='<span class="rang-c octr af-cc" title="Champion"><span class="octr"><b class="octr">C</b></span></span>';
const AF_Q='<div class="af-q"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="29.3,1.5 70.7,1.5 98.5,29.3 98.5,70.7 70.7,98.5 29.3,98.5 1.5,70.7 1.5,29.3"/></svg>?</div>';
/** Un côté d'un combat. niv : 0 tête d'affiche, 1 carte principale, 2 préliminaire. */
function afCote(c,k,s,ap,niv){
  if(!c)return `<div class="af-cote ${s}" data-drop="${k}" data-cote="${s}">${AF_Q}</div>`;
  const rg=c.rang==='C'?AF_C:`<span class="af-rgb octr" title="n° ${c.rang} du classement">${c.rang}</span>`;
  return `<div class="af-cote ${s} ${ap?'af-ap':''}" data-drop="${k}" data-cote="${s}" ${ap?'':`data-glisse="c:${c.id}" data-de="${k}|${s}"`}>
    <div class="l1">${ap?'<span class="tagap">Aperçu</span>':''}${rg}<span>${esc(c.prenom)}${c.surnom&&niv<2?` « ${esc(c.surnom)} »`:''}</span></div>
    <div class="nm " style="${afNomStyle(c.nom,afTaille(c.nom,[112,64,44][niv],290))}"><span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span></div>
    <div class="l3"><span class="T">${bilan(c)}</span>${serie(c.serie)}</div></div>`;
}
/** Couleur de chaque côté : jaune pour le champion d'un combat de titre, rouge sinon (décision du 08/11). */
const afCoins=(A,B,t)=>`ga-${t&&A&&A.rang==='C'?'or':'rg'} gb-${t&&B&&B.rang==='C'?'or':'rg'}`;
/** Un nom avec un accent au-dessus d'une capitale est un peu plus petit : même hauteur totale, rien ne bouge. */
const afAcc=nom=>accentHaut(nom)?.86:1;
/** La boîte du nom garde la même hauteur : la place gagnée va au-dessus, pour l'accent. */
const afNomStyle=(nom,t)=>accentHaut(nom)?`font-size:${t*.86}px;padding-top:${(t*.14*.82).toFixed(1)}px`:`font-size:${t}px`;
function afLigne(k){
  const p=k[0]==='p',main=k==='m0',niv=main?0:p?2:1,{A,B,apA,apB}=afAvecApercu(k),vide=!A&&!B,cat=(A||B)?(A||B).cat:null;
  const t=!!(A&&B&&A.cat===B.cat&&(A.rang==='C'||B.rang==='C')),r=main||t?5:3;
  let rai;
  if(vide)rai='<span class="vide">Place libre</span>';
  else if(!(A&&B)){const s=A||B,d=AF_DEMANDES[s.id];rai=(d?afRl(['a',`${s.nom} ${d.court}`]):'<span class="vide">Adversaire à choisir</span>')+(S.af.sel===k?'<button class="af-b af-lib" data-afretirer><span class="oct">Libérer la place</span></button>':'');}
  else rai=afRaisons(k,{a:A.id,b:B.id}).slice(0,[5,4,3][niv]).map(afRl).join('');
  return `<div class="af-t af-row oct ${main?'m0':''} ${p?'pre':''} ${t?'titre':''} ${vide?'vide':''} ${S.af.sel===k?'sel':''}" data-afsel="${k}" data-drop="${k}" data-glisse="${k}">
    <div class="in oct"><div class="af-numc"><span class="T">${p?'P':''}${+k.slice(1)+1}</span>${AF_POIGNEE}</div>
      <div class="af-sc ${afCoins(A,B,t)}" ${p?`style="--i:${+k.slice(1)}"`:''}>${main?'<i class="tun"></i>':''}<i class="rouge"></i><i class="fil"></i><i class="tun2"></i><i class="bande a"></i><i class="bande b"></i><i class="ligne"></i>${afCote(A,k,'a',apA,niv)}
        <div class="af-ctr">${t?'<div class="chip titre oct cj fin">Titre</div>':''}<div class="vsw octr"><div class="vsr octr"><div class="vs octr">VS</div></div></div><div class="chip oct">${cat?`${esc(afCourt(cat))}<i></i>${r} rounds`:'Libre'}</div></div>
        ${afCote(B,k,'b',apB,niv)}</div>
      <div class="af-rai">${rai}</div></div></div>`;
}
const ACT_P='<button class="af-b af-actu" data-afrefaire title="Leïla recompose les préliminaires"><span class="oct"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 11-2.2-5.3"/><path d="M19.5 4v5h-5"/></svg></span></button>';
/** Le sous-menu : carte principale et préliminaires au même endroit. On peut y lâcher un combat pour changer d'onglet. */
function afOnglets(){
  const n=S.af.m.filter(afComplet).length,np=S.af.p.filter(afComplet).length,fem=S.af.p.filter(f=>/ F$/.test(afCat(f)||'')).length,a=S.af.tab;
  const mq=c=>c?'<span class="onglet-mq octr"></span>':'';
  return `<div class="af-ongs"><button class="onglet oct ${a==='m'?'ouvert':''}" data-aftab="m" data-droptab="m">Carte principale <span class="n">${n} / 4</span>${mq(n<4)}</button>
    <button class="onglet oct ${a==='p'?'ouvert':''}" data-aftab="p" data-droptab="p">Préliminaires <span class="n">${np} / 6</span>${mq(np<6)}</button>
    <span class="af-ongs-d">${a==='m'?`Début à 21 h · 16 févr. · Forum de Lille${S.af.valide?' · <span style="color:var(--vert)">carte validée ✓</span>':''}`
      :S.af.p.some(f=>f.a||f.b)?`Début à 19 h · ${S.af.retouche?'Retouchés par toi':'Composés par Leïla'} ${ACT_P}`
      :'Début à 19 h · À composer '+ACT_P}</span></div>`;
}
function afCarte(){
  const cles=S.af.tab==='p'?S.af.p.map((_,i)=>'p'+i):S.af.m.map((_,i)=>'m'+i);
  return `<div class="af-carte">${cles.map(afLigne).join('')}</div>`;
}

/* ---- À droite : les combattants ---- */
const afSexe=cat=>/ F$/.test(cat)?'F':'H';
const afLarge=()=>['tous','H','F'].includes(S.af.cat);
/** La série de victoires en cours (la série est rangée du plus ancien au plus récent). */
const afSerieV=c=>{let n=0;for(let i=c.serie.length-1;i>=0&&c.serie[i]==='v';i--)n++;return n;};
const AF_TRIS={rang:(x,y)=>afRangN(x)-afRangN(y),inactifs:(x,y)=>x.dernier-y.dernier,series:(x,y)=>afSerieV(y)-afSerieV(x)||afRangN(x)-afRangN(y)};
function afListe(){
  const c=S.af.cat;
  return COMBATTANTS.filter(x=>c==='tous'||(c==='H'||c==='F'?afSexe(x.cat)===c:x.cat===c)).sort(AF_TRIS[S.af.tri]||AF_TRIS.rang);
}
const afFiltreNom=c=>c==='tous'?'Tous':c==='H'?'Hommes':c==='F'?'Femmes':afCourt(c);

/** Les dossiers de Leïla : un dossier à la fois, pour la place choisie (ou la première à remplir). Une aide, jamais imposée (Q7). */
function afDossiers(){
  let k=S.af.sel;if(afComplet(afFight(k)))k=afCles().find(x=>!afComplet(afFight(x)));
  if(!k)return{k:null,rows:[]};
  const f=afFight(k),A=parId(f.a),B=parId(f.b),seul=A||B;
  const rows=seul?(AF_LEILA[seul.id]?AF_LEILA[seul.id].map(([id,w])=>[[seul.id,id],w,id])
      :COMBATTANTS.filter(c=>c.cat===seul.cat&&c.id!==seul.id&&afEtat(c).ok).sort((x,y)=>Math.abs(afRangN(x)-afRangN(seul))-Math.abs(afRangN(y)-afRangN(seul))).slice(0,3).map(c=>[[seul.id,c.id],`Le plus proche de lui au classement.`,c.id]))
    :AF_LEILA.vide.map(([a,b,w])=>[[a,b],w,null]).filter(([ids])=>ids.every(id=>!afEngages().has(id)));
  return{k,rows};
}
function afDossiersHtml(){
  const {k,rows}=afDossiers();
  if(!k)return `<div class="af-dos-t"><span class="etiq">Les dossiers de Leïla</span></div><div class="af-reg" style="color:var(--vert)">${ico('ok',19,2.6)}<span>Rien à proposer : la carte est complète.</span></div>`;
  if(!rows.length)return `<div class="af-dos-t"><span class="etiq">Les dossiers de Leïla · ${esc(afCourtRole(k))}</span></div><span class="sous">Pas de dossier pour cette place.</span>`;
  const n=rows.length,i=((S.af.dos%n)+n)%n,[ids,w,ap]=rows[i];
  return `<div class="af-dos-t"><span class="etiq">Les dossiers de Leïla · ${esc(afCourtRole(k))}</span>
      <span class="nav"><button class="af-b" data-afdosn="-1" title="Dossier précédent"><span class="oct">${ico('retour',16,3)}</span></button><span class="n">${i+1} / ${n}</span><button class="af-b" data-afdosn="1" title="Dossier suivant"><span class="oct">${ico('avant',16,3)}</span></button></span></div>
    <div class="af-dossier oct" ${ap&&k===S.af.sel?`data-afhover="${ap}"`:''}><div class="in oct">
      <div class="l1"><span class="T">${ids.map(id=>`<span class="nom" data-fiche="${id}">${esc(parId(id).nom)}</span>`).join('<small> contre </small>')}</span>
        <button class="af-b" data-afdos="${k}|${ids.join(',')}"><span class="oct">Placer</span></button></div>
      <div class="l2">« ${esc(w)} »</div></div></div>`;
}
function afLigneC(c){
  const st=afEtat(c),sv=afSerieV(c);
  const droite=st.susp?`<span class="af-mer af-susp" title="Suspension médicale">${ico('medical',15)}Apte le ${esc(st.susp)}</span>`:st.act?`<button class="af-lien" data-afprop="${c.id}">${st.act}</button>`
    :!st.ok?'':S.af.tri==='series'&&sv>1?`<span class="af-mer" style="color:var(--vert)">${sv} victoires de suite</span>`:`<span class="af-mer" title="Dernier combat">il y a ${depuis(c.dernier)}</span>`;
  return `<div class="af-r ${st.ok?'':'off'}" ${st.ok?`data-glisse="c:${c.id}" data-afplace="${c.id}" data-afhover="${c.id}"`:`data-afpourquoi="${c.id}"`}>
    <span class="af-rg">${c.rang==='C'?AF_C:c.rang}</span>
    <div class="af-rm"><div class="af-r1"><span class="nom T" data-fiche="${c.id}">${esc(c.nom)}</span><span class="af-pal T">${bilan(c)}</span></div>
      <div class="af-r2"><span class="af-sn" ${st.col?`style="color:${st.col}"`:''}>${afLarge()?`${esc(afCourt(c.cat))} · `:''}${st.txt?esc(st.txt):esc(c.prenom)+(c.surnom?` « ${esc(c.surnom)} »`:'')}</span>${droite}</div></div></div>`;
}
function afVestiaire(){
  const l=afListe(),libres=l.filter(c=>afEtat(c).ok),indis=l.filter(c=>{const s=afEtat(c);return !s.ok&&!s.eng;});
  const nbL=x=>COMBATTANTS.filter(c=>(x==='tous'||(x==='H'||x==='F'?afSexe(c.cat)===x:c.cat===x))&&afEtat(c).ok).length;
  const b=x=>`<button class="${x===S.af.cat?'cur':''}" data-afcat="${esc(x)}">${esc(afFiltreNom(x).replace(/ F$/,''))}<small>${nbL(x)}</small></button>`;
  const menu=S.af.menu?`<div class="af-menu oct"><div class="oct"><div class="tous">${b('tous')}${b('H')}${b('F')}</div><span class="etiq">Hommes</span><span class="etiq">Femmes</span>
      ${[0,1,2,3,4,5,6,7].map(i=>[CATS.H[i],CATS.F[i]].map(x=>x?b(x[0]):'<span></span>').join('')).join('')}</div></div>`:'';
  const seg=[['rang','Rang'],['inactifs','Inactifs'],['series','Séries']].map(([id,t])=>`<button class="af-b ${S.af.tri===id?'on':''}" data-afseg="${id}"><span class="oct">${t}</span></button>`).join('');
  return pan(`<div class="af-fil"><button class="af-b" data-afmenu><span class="oct">${esc(afFiltreNom(S.af.cat))} ▾</span></button><span class="af-seg">${seg}</span>${menu}</div>
    <div class="af-list"><div class="af-grp">Libres · ${libres.length}</div>${libres.map(c=>afLigneC(c)).join('')}
      ${indis.length?`<div class="af-grp">Indisponibles</div>${indis.map(afLigneC).join('')}`:''}</div>`,'height:100%','af-ves');
}

/* ---- À droite : le combat choisi ---- */
function afTape(A,B){
  const pt='<span class="af-pt octr"></span>';
  const row=(lab,fa,mieux)=>{const m=mieux?mieux(A,B):0;
    return `<div class="af-tr"><span class="g">${m>0?pt:''}<span class="val">${fa(A)}</span></span><span class="m">${lab}</span><span class="d"><span class="val">${fa(B)}</span>${m<0?pt:''}</span></div>`;};
  const rang=c=>c.rang==='C'?'Champion':`n° ${c.rang}`,pc=c=>c.v/(c.v+c.d),al=c=>parseFloat(c.allonge.replace(',','.')),sv=c=>[...c.serie].filter(x=>x==='v').length;
  const cmp=(f,inv)=>(a,b)=>{const x=f(a),y=f(b);return x===y?0:(inv?x<y:x>y)?1:-1;};
  return `<div class="af-tape">${row('Classement',rang,cmp(afRangN,true))}${row('Mondial',c=>`n° ${c.mondial}`,cmp(c=>c.mondial,true))}
    ${row('Palmarès',bilan,cmp(pc))}${row('5 derniers',c=>serie(c.serie),cmp(sv))}${row('Âge',c=>`${c.age} ans`)}
    ${row('Allonge',c=>c.allonge,cmp(al))}${row('Art martial',c=>esc(c.art||'—'))}${row('Dernier combat',c=>depuis(c.dernier))}</div>`;
}
function afDemande(A,B){
  const qui=[A,B].find(c=>c&&AF_DEMANDES[c.id]);if(!qui)return '';
  const d=AF_DEMANDES[qui.id],adv=qui===A?B:A;
  const r=d.tenue(adv)?`<span style="color:var(--vert)">${ico('ok',18,2.6)} Tenue</span>`:'<span style="color:var(--neg)">Pas tenue</span>';
  return `<div class="af-dem oct"><span style="color:var(--jaune);display:flex">${ico('messages',20)}</span><span>Demande de ${esc(qui.nom)} : ${esc(d.t.toLowerCase())}</span><span class="af-dem-r">${r}</span></div>`;
}
function afHistoire(A,B){
  const h=AF_HIST[[A.id,B.id].sort().join('|')];
  if(h)return `<div class="af-hist">${esc(h)}</div>`;
  const e=Math.abs(afRangN(A)-afRangN(B));
  return `<div class="af-hist" style="font-style:normal">${esc(A.nom)} est ${A.rang==='C'?'champion':`n° ${A.rang}`}, ${esc(B.nom)} ${B.rang==='C'?'champion':`n° ${B.rang}`} : ${e<=3?'un combat serré sur le papier.':'un écart net au classement.'}</div>`;
}
function afEnjeu(k,f,A,B){
  const deja=[A.id,B.id].sort().join('|')==='mezouar|nana'?'Oui, en 2025':'Jamais';
  const risques=[A,B].map(c=>AF_RISQUES[c.id]).filter(r=>r&&r[1]==='neu').slice(0,1);
  return `<span class="etiq">Ce qui fait le combat</span><div>${afRaisons(k,f).slice(0,4).map(afRl).join('')}</div>${afHistoire(A,B)}
    <div class="af-st3"><div><span class="etiq">Bourses</span><span class="T">${nb(afBourse(A)+afBourse(B))} €</span></div>
      <div><span class="etiq">À la recette</span><span class="T">${afValeur(k,f)?'≈ '+nb(Math.round(afValeur(k,f)/1000)*1000)+' €':'—'}</span></div>
      <div><span class="etiq">Déjà affrontés</span><span class="T">${deja}</span></div></div>
    ${risques.map(r=>`<div class="af-li" style="color:var(--texte2)">${ico(r[0],20)}<span>${esc(r[2])}</span></div>`).join('')}`;
}
function afDetail(){
  const k=S.af.sel,f=afFight(k),A=parId(f.a),B=parId(f.b),o=S.af.onglet==='comp'?'comp':'enjeu';
  const x=(c,s)=>`<div class="x ${s}"><span class="T " style="${afNomStyle(c.nom,afTaille(c.nom,44,165))};display:inline-block;line-height:.85"><span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span></span>
    <span class="ss">${c.rang==='C'?'Champion':`n° ${c.rang}`} · ${bilan(c)}</span></div>`;
  return pan(`<div class="af-det-h"><button class="af-b af-ret" data-afvue="liste" title="Revenir aux combattants"><span class="oct">${ico('retour',18,3)}</span></button><span class="etiq">${esc(afRole(k))} · ${esc(afCourt(A.cat))} · ${afRounds(k,f)} rounds</span></div>
    <div class="af-face">${x(A,'a')}<div class="mil"><span class="vs octr">VS</span><button class="af-b af-coin" data-afcoin title="Changer de coin"><span class="oct"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M4 8h15M15 4l4 4-4 4"/><path d="M20 16H5M9 12l-4 4 4 4"/></svg></span></button></div>${x(B,'b')}</div>
    <div class="af-ong">${[['enjeu','L’enjeu'],['comp','Comparaison']].map(([id,l])=>`<button class="onglet oct ${o===id?'ouvert':''}" data-afong="${id}">${l}</button>`).join('')}</div>
    <div class="af-ongc">${o==='comp'?afTape(A,B):afEnjeu(k,f,A,B)}</div>
    <div class="af-act"><button class="af-b" data-afpres><span class="oct">Présentation</span></button><button class="af-b" data-afface><span class="oct">Face-à-face</span></button>
      <button class="af-b droite" data-afretirer><span class="oct">Retirer</span></button></div>`,'height:100%','af-det af-entre');
}
const afDroite=()=>afComplet(afFight(S.af.sel))&&S.af.vue==='detail'?afDetail():afVestiaire();

/* ---- Résumé avant de confirmer (Q12c ; confirmation permise : décision qui engage l'argent) ---- */
function afResume(){
  const c=afChiffres(),m0=S.af.m[0],A=parId(m0.a),B=parId(m0.b),frais=120000,marge=Math.round((c.moy-c.bourses-frais)/1000)*1000,[dit,src]=afDit();
  const t=afTitre(m0),rg=x=>x.rang==='C'?AF_C:`<span class="af-rgb octr">${x.rang}</span>`;
  const cote=(x,s)=>`<div class="af-rs-c ${s}"><div class="l1">${rg(x)}<span>${esc(x.prenom)}${x.surnom?` « ${esc(x.surnom)} »`:''}</span></div>
    <div class="T nm " style="${afNomStyle(x.nom,afTaille(x.nom,104,420))}">${esc(x.nom)}</div><div class="l3"><span class="T">${bilan(x)}</span>${serie(x.serie)}</div></div>`;
  const ligne=(f,k)=>{const a=parId(f.a),b=parId(f.b);return `<div class="af-rs-l"><span class="n T">${+k.slice(1)+1}</span>
    <span class="x">${rg(a)}<span class="T">${esc(a.nom)}</span></span><span class="vs2">VS</span><span class="x d"><span class="T">${esc(b.nom)}</span>${rg(b)}</span>
    <span class="r">${afTitre(f)?'<b>Titre</b> · ':''}${esc(afCourt(afCat(f)))} · ${afRounds(k,f)} rounds</span></div>`;};
  const ligneP=(f,i)=>`<div class="af-rs-p"><span class="n">P${i+1}</span><span class="pp">${rg(parId(f.a))}${esc(parId(f.a).nom)} <i>contre</i> ${esc(parId(f.b).nom)}${rg(parId(f.b))}</span><span class="r">${esc(afCourt(afCat(f)))}</span></div>`;
  const risques=[];for(const [id] of afEngages())if(AF_RISQUES[id])risques.push(AF_RISQUES[id]);
  const dem=[];for(const [id,k] of afEngages()){const d=AF_DEMANDES[id];if(d){const f=afFight(k),adv=parId(f.a===id?f.b:f.a);dem.push(adv&&d.tenue(adv)?['ok','vert',`Demande de ${parId(id).nom} tenue`]:['messages','neg',`Demande de ${parId(id).nom} non tenue : il le saura`]);}}
  return `<div class="af-voile">${pan(`<div class="af-rs-ban ${t?'or':''} ${afCoins(A,B,t)}"><i class="tun"></i>
      <div class="haut etiq">Split Fight Night 63 · 16 février 2027 · Forum de Lille · 21 h</div>
      ${cote(A,'a')}<div class="mil"><div class="vsw octr"><div class="vsr octr"><div class="vs octr">VS</div></div></div>
        <div class="chip oct">${t?'<b>Titre</b><i></i>':''}${esc(afCourt(A.cat))}<i></i>5 rounds</div></div>${cote(B,'b')}</div>
    <div class="af-rs-corps">
      <div class="col"><div class="etiq">Carte principale · 21 h</div>${S.af.m.map((f,i)=>i?ligne(f,'m'+i):'').join('')}
        <div class="etiq" style="margin-top:18px">Préliminaires · 19 h</div>${S.af.p.map(ligneP).join('')}</div>
      <div class="col bil"><div class="etiq">Le bilan</div>
        <div class="af-chif"><span class="etiq">Recette estimée</span><span class="T">${nb(c.bas)} – ${nb(c.haut)} €</span>
          <span class="etiq">Bourses à verser</span><span class="T">${nb(c.bourses)} €</span>
          <span class="etiq">Salle et soirée</span><span class="T">${nb(frais)} €</span>
          <span class="etiq">Ce qu’il devrait te rester</span><span class="T" style="color:${marge>0?'var(--vert)':'var(--neg)'}">${marge>0?'+ ':'− '}${nb(Math.abs(marge))} €</span></div>
        <div class="af-rs-rem"><span class="etiq">Le Forum de Lille</span><span>plein à ${c.plein} % (prévision)</span></div><div class="jauge"><i style="width:${c.plein}%;background:var(--blanc)"></i></div>
        <div class="af-dit" style="margin-top:14px">« ${esc(dit)} » <b>${esc(src)}</b></div>
        <div class="etiq" style="margin-top:16px">À surveiller</div>
        ${dem.map(([i,col,tx])=>`<div class="af-li" style="color:var(--${col})">${ico(i,20,2.4)}<span>${esc(tx)}</span></div>`).join('')}
        ${risques.slice(0,Math.max(0,3-dem.length)).map(r=>`<div class="af-li" style="color:${r[1]==='att'?'var(--jaune)':'var(--texte2)'}">${ico(r[0],20)}<span>${esc(r[2])}</span></div>`).join('')||(dem.length?'':'<div class="sous">Rien de signalé.</div>')}</div></div>
    <div class="af-res-pied"><span class="sous">Les combattants et leurs camps seront prévenus dès la confirmation.</span>
      <button class="af-b grand" data-afrevenir><span class="oct">Revenir</span></button>
      <button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px" data-afconfirmer>Confirmer la carte</button></div>`,'','af-res')}</div>`;
}

/* ---- Rendu de l'écran et branchement dans le cadre ---- */
function afHtml(){return `<div class="af st-${S.af.style||'tunnel'}">${afOnglets()}${afCarte()}${afDroite()}${afStrip()}</div>${S.af.resume?afResume():''}`;}
function afAlerte(){
  const al=$('#alerte');al.classList.add('af-al');
  const reg=afARegler(),vides=S.af.m.filter(f=>!afComplet(f)).length;
  const phrase=S.af.valide?'Carte validée. Continue jusqu’à la semaine du combat.':vides?`Il manque ${vides} combat${vides>1?'s':''} en carte principale.`:reg.some(r=>r[0]==='att')?'La carte est complète : vérifie ce qu’il reste à régler, puis valide.':'La carte est complète : tu peux la valider.';
  al.innerHTML=`<span class="tag-j oct cj fin" style="--c:7px;height:34px;padding:0 14px">Prochaine étape</span><span style="font-size:22px">${phrase}</span>
    ${S.fiche||S.af.valide||S.af.resume?'':'<button class="af-b af-valider" data-afvalider><span class="oct" style="height:40px;font-size:26px">Valider la carte</span></button>'}`;
}
const afRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='carte'){$('#alerte').classList.remove('af-al');afRendreBase();return;}
  rendreBarre();rendreEntete('Carte');afAlerte();
  $('#corps').style.top='152px';
  const l=$('.af-list'),y=l?l.scrollTop:0;
  $('#corps').innerHTML=afHtml();
  const l2=$('.af-list');if(l2)l2.scrollTop=y;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  afRaccords();
};
/** Préliminaires : chaque ligne montre sa tranche de la même grande cage. La position est mesurée,
    ligne par ligne, pour que l'image se raccorde au pixel près (ligne choisie, ligne plus haute…). */
function afRaccords(){
  const els=[...document.querySelectorAll('.af-row.pre .af-sc')];if(!els.length)return;
  const k=$('.scene').getBoundingClientRect().width/1920,b=els.map(e=>e.getBoundingClientRect()),t0=b[0].top,l0=Math.min(...b.map(r=>r.left));
  const h=(b[b.length-1].bottom-t0)/k,cx=(Math.max(...b.map(r=>r.right))-l0)/k/2;
  els.forEach((e,i)=>{const x=(b[i].left-l0)/k,y=(b[i].top-t0)/k;e.style.backgroundPosition=`0 0,${Math.round(cx-x-964)}px ${Math.round(h/2-422-y)}px,0 0`;});
}
/** Ne redessine qu'une place de la carte (aperçu au survol, sans toucher à la liste). */
function afMajPlace(k){const el=$(`.af-t[data-afsel="${k}"]`);if(el)el.outerHTML=afLigne(k);afRaccords();}
const afAllerBase=aller;
aller=function(ec){
  if(ec==='prelims')ec='carte';
  if(ec!=='carte'){afAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='carte'){S.hist.push(S.ecran);S.futur=[];}
  S.ecran='carte';rendre();
};
/* La fiche s'ouvre par-dessus la carte, sans la quitter (T7). */
const afOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='carte'){afOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

/* ---- Actions ---- */
function afSelect(k,leila){
  S.af.sel=k;S.af.tab=k[0];S.af.apercu=null;S.af.menu=false;S.af.leila=!!leila;S.af.dos=0;
  const f=afFight(k),c=afCat(f);if(c&&!afLarge())S.af.cat=c;
  S.af.vue=afComplet(f)?'detail':'liste';
  rendre();
}
function afRefus(t,el){toast(t);if(el){el.classList.remove('af-non-anim');void el.offsetWidth;el.classList.add('af-non-anim');}return false;}
/** Pose un combattant à une place ; une seule catégorie par combat. Retourne false si refusé (avec la raison). */
function afPoser(id,k,s,el){
  const f=afFight(k),c=parId(id);
  if(f.a===id||f.b===id){afSelect(k);return true;}
  if(!s){if(f.a&&f.b)return afRefus(`${afRole(k)} est complet : lâche ${c.nom} sur le nom à remplacer.`,el);s=!f.a?'a':'b';}
  const autre=parId(f[s==='a'?'b':'a']);
  if(autre&&autre.cat!==c.cat)return afRefus(`${c.prenom} ${c.nom} est en ${afCatMin(c.cat)} : ce combat est en ${afCatMin(autre.cat)}.`,el);
  const avant=afChiffres().moy,prev=afEngages().get(id);
  if(prev){const pf=afFight(prev);if(pf.a===id)pf.a=null;if(pf.b===id)pf.b=null;}
  f[s]=id;if(k[0]==='p')S.af.retouche=true;S.af.valide=false;
  S.af.sel=k;S.af.tab=k[0];S.af.apercu=null;S.af.dos=0;if(!afLarge())S.af.cat=c.cat;S.af.leila=false;S.af.vue='liste';
  rendre();afSent(k,avant);return true;
}
/** Échange deux places de la carte, préliminaires compris (monter un préliminaire en carte principale). */
function afEchanger(k1,k2){
  if(k1===k2)return;
  const avant=afChiffres().moy,a=S.af[k1[0]],b=S.af[k2[0]],i=+k1.slice(1),j=+k2.slice(1);
  [a[i],b[j]]=[b[j],a[i]];
  if(k1[0]==='p'||k2[0]==='p')S.af.retouche=true;S.af.valide=false;
  S.af.sel=k2;S.af.tab=k2[0];if(!afComplet(afFight(k2)))S.af.vue='liste';rendre();afSent(k2,avant,k1);
}
/** Le dépôt se sent : la place claque, une onde part, la recette bouge. */
function afSent(k,avant,k2){
  for(const kk of [k,k2].filter(Boolean)){const el=$(`.af-t[data-afsel="${kk}"]`);if(el){el.classList.remove('af-clac');void el.offsetWidth;el.classList.add('af-clac');}}
  const el=$(`.af-t[data-afsel="${k}"]`),sc=$('.scene');
  if(el){const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect(),q=s.width/1920,o=document.createElement('div');
    o.className='af-onde';o.style.left=((r.left+Math.min(r.width/2,200)-s.left)/q)+'px';o.style.top=((r.top+r.height/2-s.top)/q)+'px';sc.appendChild(o);
    o.animate([{transform:'scale(.35)',opacity:.95},{transform:'scale(2.4)',opacity:0}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=()=>o.remove();}
  const apres=afChiffres().moy,d=Math.round((apres-avant)/1000)*1000,rec=$('#afRec');
  if(d&&rec){const b=document.createElement('span');b.className='af-delta';b.style.color=d>0?'var(--vert)':'var(--neg)';b.textContent=(d>0?'+ ':'− ')+nb(Math.abs(d))+' €';
    rec.parentNode.appendChild(b);b.animate([{transform:'translateY(0)',opacity:0},{transform:'translateY(-14px)',opacity:1,offset:.25},{transform:'translateY(-28px)',opacity:0}],{duration:1500,easing:'ease-out'}).onfinish=()=>b.remove();
    rec.animate([{color:d>0?'var(--vert)':'var(--neg)'},{color:'var(--blanc)'}],{duration:900});}
}
function afRetirer(){
  const k=S.af.sel,f=afFight(k),avant=afChiffres().moy;
  S.af.annuler={k,f:{...f}};f.a=null;f.b=null;S.af.valide=false;S.af.vue='liste';rendre();afSent(k,avant);
  toast(`${afRole(k)} retiré. <button class="af-lien" data-afannuler>Annuler</button>`);
}
/** Retire un seul combattant de sa place (glissé hors de la carte) ; l'autre reste, Annuler pendant 3 secondes. */
function afLiberer(k,s){
  const f=afFight(k),id=f[s],avant=afChiffres().moy;if(!id)return;
  S.af.annuler={k,f:{...f}};f[s]=null;S.af.valide=false;S.af.sel=k;S.af.tab=k[0];S.af.vue='liste';rendre();afSent(k,avant);
  toast(`${esc(parId(id).nom)} quitte ${esc(afRole(k).toLowerCase())}. <button class="af-lien" data-afannuler>Annuler</button>`);
}
function afRefaire(){
  /* Leïla recompose les préliminaires : priorité aux inactifs, au moins 2 combats féminins (Q14). */
  const avant=afChiffres().moy,n=++S.af.refaits%3,R=[[9,11],[5,8],[7,10]][n];
  const pris=new Set(S.af.m.flatMap(f=>[f.a,f.b]));
  const libre=id=>{const c=parId(id);return !!c&&!pris.has(id)&&!['blesse','pause','refus','suspendu'].includes(c.statut);};
  const paire=(cat,x,y)=>{let a=afId(cat,x),b=afId(cat,y),i=0;while(!libre(a)&&i++<9)a=afId(cat,++x);i=0;while((!libre(b)||b===a)&&i++<9)b=afId(cat,++y);pris.add(a);pris.add(b);return{a,b};};
  S.af.p=[paire(['Poids mouche','Poids coq','Poids plume'][n],R[0],R[1]),paire(['Poids coq F','Poids mouche F','Poids plume F'][n],R[0]-4,R[1]-4),
    paire(['Poids mi-moyen','Poids moyen','Poids mi-lourd'][n],R[0]-2,R[1]-2),paire(['Poids paille F','Poids coq F','Poids mouche F'][n],R[0]-3,R[1]-1),
    n===0&&libre('vanbelle')&&libre('carvalho')?{a:'vanbelle',b:'carvalho'}:paire('Poids léger',[10,11,10][n],[12,13,12][n]),paire(['Poids lourd','Poids mi-lourd','Poids lourd'][n],R[0]+1,R[1]+2)];
  afSansDoublon();S.af.retouche=false;S.af.valide=false;if(S.af.sel[0]==='p'){S.af.sel='p0';S.af.vue='liste';}S.af.tab='p';
  rendre();document.querySelectorAll('.af-row.pre').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'none'}],{duration:380,delay:i*55,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
  afSent('p0',avant);
}

/* ---- Glisser-déposer (pointeur ; la scène est mise à l'échelle) ---- */
let afD=null,afBloque=false;
function afValide(src,k,cote){
  if(src.startsWith('c:')){const c=parId(src.slice(2)),f=afFight(k),s=cote||(!f.a?'a':!f.b?'b':'b'),autre=parId(f[s==='a'?'b':'a']);return !autre||autre.cat===c.cat||autre.id===c.id;}
  return src!==k;
}
function afDebut(){
  const d=afD;d.on=true;
  const sc=$('.scene'),g=document.createElement('div');g.className='af-fantome oct';
  if(d.src.startsWith('c:')){const c=parId(d.src.slice(2));g.innerHTML=`<div class="oct">${c.rang==='C'?AF_C:''}${esc(c.nom)}<small>${esc(afCourt(c.cat))}</small></div>`;}
  else{const f=afFight(d.src),A=parId(f.a),B=parId(f.b);g.innerHTML=`<div class="oct">${A||B?`${esc((A||{nom:'?'}).nom)} <small>contre</small> ${esc((B||{nom:'?'}).nom)}`:'Place libre'}<small>${esc(afRole(d.src))}</small></div>`;
  }
  sc.appendChild(g);d.ghost=g;document.body.classList.add('af-glisse');afMarquer(d);
  const col=$('.af-ves,.af-det');if(d.de&&col)col.classList.add('af-zone');
}
function afMarquer(d){
  const src=$(`.af-t[data-afsel="${d.src}"]`);if(src)src.classList.add('source');
  document.querySelectorAll('.af-t[data-afsel]').forEach(el=>{if(el.dataset.afsel!==d.src)el.classList.add(afValide(d.src,el.dataset.afsel)?'cible':'non');});
  if(d.src.startsWith('c:'))document.querySelectorAll('.af-t [data-cote]').forEach(el=>{if(el.querySelector('.af-q')&&afValide(d.src,el.dataset.drop,el.dataset.cote))el.classList.add('af-okd');});
}
function afBouge(e){
  const d=afD,sc=$('.scene').getBoundingClientRect(),q=sc.width/1920;
  d.ghost.style.left=((e.clientX-sc.left)/q)+'px';d.ghost.style.top=((e.clientY-sc.top)/q)+'px';
  const t=document.elementFromPoint(e.clientX,e.clientY),cib=t&&t.closest('[data-drop]');
  document.querySelectorAll('.sur').forEach(x=>x.classList.remove('sur'));
  const hors=!!(d.de&&t&&t.closest('.af-ves,.af-det'));d.retire=hors;const col=$('.af-ves,.af-det');if(col)col.classList.toggle('af-retire',hors);
  d.cible=hors?null:cib;if(cib&&!hors){(cib.closest('.af-t')||cib).classList.add('sur');if(cib.dataset.cote)cib.classList.add('sur');}
  /* Survoler l'autre onglet un instant l'ouvre, sans lâcher le combat. */
  const tab=t&&t.closest('[data-droptab]');
  if(tab){tab.classList.add('sur');if(tab.dataset.droptab!==S.af.tab&&!d.ressort)d.ressort=setTimeout(()=>{d.ressort=null;if(afD!==d)return;S.af.tab=tab.dataset.droptab;rendre();afMarquer(d);},450);}
  else if(d.ressort){clearTimeout(d.ressort);d.ressort=null;}
}
function afFin(d){
  document.body.classList.remove('af-glisse');if(d.ressort)clearTimeout(d.ressort);
  const cib=d.cible;
  document.querySelectorAll('.cible,.non,.sur,.source,.af-okd').forEach(x=>x.classList.remove('cible','non','sur','source','af-okd'));
  d.ghost.remove();const col=$('.af-ves,.af-det');if(col)col.classList.remove('af-zone','af-retire');
  if(d.retire){const [k,sd]=d.de.split('|');afLiberer(k,sd);return;}
  if(!cib)return;
  const k=cib.dataset.drop,cote=cib.dataset.cote||null,row=cib.closest('.af-t')||cib;
  if(d.src.startsWith('c:'))afPoser(d.src.slice(2),k,cote,row);
  else if(d.src!==k)afEchanger(d.src,k);
}
document.addEventListener('pointerdown',e=>{
  if(S.ecran!=='carte'||e.button!==0||S.af.resume)return;
  const el=e.target.closest('[data-glisse]');
  if(!el||e.target.closest('button'))return;
  afD={src:el.dataset.glisse,de:el.dataset.de||null,el,x0:e.clientX,y0:e.clientY,on:false,ghost:null,cible:null};
});
document.addEventListener('pointermove',e=>{
  if(!afD)return;
  if(!afD.on){if(Math.hypot(e.clientX-afD.x0,e.clientY-afD.y0)<7)return;afDebut();}
  afBouge(e);
});
document.addEventListener('pointerup',()=>{
  if(!afD)return;const d=afD;afD=null;
  if(d.on){afBloque=true;setTimeout(()=>{afBloque=false;},0);afFin(d);}
});
window.addEventListener('click',e=>{if(afBloque){e.stopPropagation();e.preventDefault();}},true);

/* ---- Aperçu au survol : le combattant se pose « pour voir » en face, sans rien changer ---- */
document.addEventListener('mouseover',e=>{
  if(S.ecran!=='carte'||afD&&afD.on||S.af.resume)return;
  const el=e.target.closest('[data-afhover]'),f=afFight(S.af.sel);
  const id=el&&el.dataset.afhover,c=id&&parId(id),seul=parId(f.a)||parId(f.b);
  const voulu=c&&!(f.a&&f.b)&&(!seul||c.cat===seul.cat&&c.id!==seul.id)?id:null;
  if(voulu!==S.af.apercu){S.af.apercu=voulu;afMajPlace(S.af.sel);}
});

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='carte')return;
  const t=e.target;let el;
  if(t.closest('[data-fiche]'))return;
  if(S.af.menu&&!t.closest('.af-menu')&&!t.closest('[data-afmenu]')){S.af.menu=false;rendre();if(!t.closest('[data-afcat]'))return;}
  if(t.closest('[data-afannuler]')){const u=S.af.annuler;if(u){const avant=afChiffres().moy;Object.assign(afFight(u.k),u.f);S.af.annuler=null;S.af.sel=u.k;S.af.tab=u.k[0];rendre();afSent(u.k,avant);}return;}
  if(t.closest('[data-afvalider]')){
    const k=afCles().find(x=>!afComplet(afFight(x)));
    if(k){afSelect(k);toast(`Impossible de valider : ${afRole(k).toLowerCase()} n’est pas complet.`);return;}
    S.af.resume=true;rendre();return;}
  if(t.closest('[data-afrevenir]')||(S.af.resume&&t.classList.contains('af-voile'))){S.af.resume=false;rendre();return;}
  if(t.closest('[data-afconfirmer]')){S.af.resume=false;S.af.valide=true;rendre();toast('Carte validée. Les combattants et leurs camps sont prévenus.');return;}
  if(t.closest('[data-afretirer]')){afRetirer();return;}
  if(t.closest('[data-afpres]')){toast('Ouvre la présentation du combat (R10), écran à part.');return;}
  if(t.closest('[data-afface]')){toast('Ouvre le face-à-face (R10), écran à part.');return;}
  if(t.closest('[data-afcoin]')){const f=afFight(S.af.sel);[f.a,f.b]=[f.b,f.a];rendre();afSent(S.af.sel,afChiffres().moy);return;}
  if((el=t.closest('[data-afong]'))){S.af.onglet=el.dataset.afong;rendre();return;}
  if((el=t.closest('[data-afvue]'))){S.af.vue=el.dataset.afvue;rendre();return;}
  if(t.closest('[data-afeng]')){S.af.engage=true;rendre();toast('Tu t’engages : Belkacem aura un adversaire du top 3 avant l’été.');return;}
  if((el=t.closest('[data-afleilaplace]'))){afSelect(el.dataset.afleilaplace,true);return;}
  if(t.closest('[data-afleila]')){S.af.leila=!S.af.leila;S.af.apercu=null;rendre();return;}
  if((el=t.closest('[data-aftab]'))){S.af.tab=el.dataset.aftab;rendre();return;}
  if(t.closest('[data-afrefaire]')){afRefaire();return;}
  if(t.closest('[data-afmenu]')){S.af.menu=!S.af.menu;rendre();return;}
  if((el=t.closest('[data-afcat]'))){S.af.cat=el.dataset.afcat;S.af.menu=false;rendre();const l=$('.af-list');if(l)l.scrollTop=0;return;}
  if((el=t.closest('[data-afseg]'))){S.af.tri=el.dataset.afseg;rendre();const l=$('.af-list');if(l)l.scrollTop=0;return;}
  if((el=t.closest('[data-afdosn]'))){S.af.dos+=+el.dataset.afdosn;S.af.apercu=null;rendre();return;}
  if((el=t.closest('[data-afprop]'))){toast(`Ouvre la prolongation de ${esc(parId(el.dataset.afprop).nom)} : écran Contrats, hors de cette maquette.`);return;}
  if((el=t.closest('[data-afdos]'))){const [k,l]=el.dataset.afdos.split('|'),ids=l.split(','),f=afFight(k),avant=afChiffres().moy;
    for(const id of ids){if(f.a===id||f.b===id)continue;const p=afEngages().get(id);if(p){const pf=afFight(p);if(pf.a===id)pf.a=null;if(pf.b===id)pf.b=null;}if(!f.a)f.a=id;else if(!f.b)f.b=id;}
    S.af.sel=k;S.af.tab=k[0];S.af.dos=0;if(!afLarge())S.af.cat=parId(ids[0]).cat;S.af.vue='liste';S.af.valide=false;if(k[0]==='p')S.af.retouche=true;rendre();afSent(k,avant);return;}
  if((el=t.closest('[data-afidee]'))){const ids=el.dataset.afidee.split(','),k=S.af.sel,row=$(`.af-t[data-afsel="${k}"]`);
    if(ids.length===2){const f=afFight(k),avant=afChiffres().moy;for(const id of ids){const p=afEngages().get(id);if(p){const pf=afFight(p);if(pf.a===id)pf.a=null;if(pf.b===id)pf.b=null;}}
      f.a=ids[0];f.b=ids[1];S.af.cat=parId(ids[0]).cat;S.af.leila=false;S.af.vue='liste';rendre();afSent(k,avant);}
    else afPoser(ids[0],k,null,row);return;}
  if((el=t.closest('[data-afpourquoi]'))){const c=parId(el.dataset.afpourquoi),st=afEtat(c);
    toast(st.eng?`${c.nom} est déjà à l’affiche (${afRole(st.eng).toLowerCase()}). Glisse son combat pour le déplacer.`:`${c.prenom} ${c.nom} : ${st.txt.toLowerCase()}.`);return;}
  if((el=t.closest('[data-afplace]'))){const id=el.dataset.afplace,f=afFight(S.af.sel);
    if(f.a&&f.b){toast(`${afRole(S.af.sel)} est complet. Choisis une place libre sur la carte, ou glisse ${esc(parId(id).nom)} sur un nom pour le remplacer.`);return;}
    afPoser(id,S.af.sel,null,$(`.af-t[data-afsel="${S.af.sel}"]`));return;}
  if((el=t.closest('[data-afsel]'))){afSelect(el.dataset.afsel);return;}
});

/* ---- Lancement : ?ecran=carte, puis options de capture ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='carte')return;
  S.ecran='carte';S.hist=['accueil'];afSansDoublon();
  if(q.get('etat')==='vide'){S.af.m.forEach(f=>{f.a=null;f.b=null;});S.af.p.forEach(f=>{f.a=null;f.b=null;});S.af.sel='m0';}
  if(q.get('etat')==='complet'){Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});}
  if(q.get('sel'))S.af.sel=q.get('sel');
  {const f=afFight(S.af.sel),c=afCat(f);if(c)S.af.cat=c;S.af.vue=afComplet(f)?'detail':'liste';}
  S.af.tab=S.af.sel[0];if(q.get('tab'))S.af.tab=q.get('tab');
  if(q.get('vue'))S.af.vue=q.get('vue');
  if(q.get('ong'))S.af.onglet=q.get('ong');
  if(q.get('cat'))S.af.cat=q.get('cat');
  if(q.get('leila'))S.af.leila=true;
  if(q.get('apercu'))S.af.apercu=q.get('apercu');
  if(q.get('menu'))S.af.menu=true;
  if(q.get('tri'))S.af.tri=q.get('tri');
  if(q.get('style'))S.af.style=q.get('style');
  if(q.get('resume')&&afCles().every(k=>afComplet(afFight(k))))S.af.resume=true;
  if(q.get('valide'))S.af.valide=true;
  rendre();
  /* Capture du geste : un combattant tenu au-dessus d'une place (aucun effet sur la carte). */
  if(q.get('glisse')){setTimeout(()=>{const src=$(`.af-r[data-glisse="c:${q.get('glisse')}"]`),cib=$(`.af-t[data-afsel="${S.af.sel}"] .af-cote.b`)||$(`.af-t[data-afsel="${S.af.sel}"]`);
    if(!src||!cib)return;const r=cib.getBoundingClientRect();
    afD={src:src.dataset.glisse,el:src,x0:0,y0:0,on:false,ghost:null,cible:null};afDebut();
    afBouge({clientX:r.left+r.width*.45,clientY:r.top+r.height*.4});},300);}
});
