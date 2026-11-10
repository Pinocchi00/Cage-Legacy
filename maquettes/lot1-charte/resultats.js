"use strict";
/* Maquette lot 1 — Résultats et lendemain (R29, R30, R40, R41 ; Q29b, Q30, Q40, Q41).
   Un seul écran « Résultats » avec deux onglets : Résultats (les soirées, puis chaque combat lisible d'un coup d'œil)
   et Le lendemain (refait, toujours consultable ici, R41). Le relevé d'un combat s'ouvre par-dessus l'écran :
   les trois cartes des juges avec le nom de celui qui a gagné chaque round (Q41), même en cas de finition,
   et les statistiques du combat (frappes significatives, précision, amenées au sol, temps de contrôle…).
   ?ecran=resultats place la maquette au lendemain de Split Fight Night 63 (17 février 2027) : la carte complète
   de la maquette Carte s'est jouée, les classements et les fiches suivent.
   Chargé après recrutement.js : remplace rendre(), aller(), retour() et l'ouverture de la fiche pour l'écran « resultats ». Préfixe rs. */

P.trophee='<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/>';

const RS_JUGES=['Hervé Castan','Nadia Ferhat','Paul Morvan']; /* inventés, À RELIRE */
const RS_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const rsJour=d=>`${d.getDate()} ${RS_MOIS[d.getMonth()]} ${d.getFullYear()}`;
const rsF=c=>/ F$/.test(c.cat);
const rsE=c=>rsF(c)?'e':'';
const rsCatC=cat=>{for(const s of ['H','F']){const x=CATS[s].find(z=>z[0]===cat);if(x)return x[1]+(s==='F'?' F':'');}return cat.replace('Poids ','');};
const rsCatPl=cat=>rsF({cat})?`poids ${cat.replace(/^Poids | F$/g,'')} féminin`:cat.toLowerCase().replace(/(\w)$/,'$1s');
const rsCatL=cat=>rsF({cat})?`poids ${cat.replace(/^Poids | F$/g,'')} féminin`:cat.toLowerCase();
const rsRangV=r=>r==='C'?0:typeof r==='number'?r:99;

const rsOrd=n=>n===1?'1er':`${n}e`;

/* ---- Les soirées : l'enjeu, la ceinture, la ville, la salle (Q29b). Les soirées d'avant sont écrites à la main pour
   le combat principal, le reste de la carte est tiré à la graine (À RELIRE). ---- */
const RS_SOIREES=[
  {n:63,date:new Date(2027,1,16),ville:'Lille',salle:'Forum de Lille',public:[4012,4200],titre:'Poids léger',ceinture:'change de mains',
   enjeu:'Nana défend sa ceinture contre Mezouar, qu’il avait battu en 2025.'},
  {n:62,date:new Date(2026,11,8),ville:'Lyon',salle:'Palais des sports',public:[5210,5800],titre:'Poids léger',ceinture:'gardée',
   enjeu:'Nana défend sa ceinture contre Darras.',main:{a:'nana',b:'darras',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,j:['aaaaa','aabaa','ababa'],pr:{a:['soiree'],b:['soiree']},nr:{a:'C',b:5},or:{a:'C',b:4}}},
  {n:61,date:new Date(2026,10,14),ville:'Marseille',salle:'Dôme de Marseille',public:[6340,8000],
   enjeu:'Bello et Moore, pour une place dans le top 3 des légers.',main:{a:'bello',b:'Jalen Moore',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,j:['abaaa','aabab','abaab'],nr:{a:3},or:{a:4}}},
  {n:60,date:new Date(2026,9,3),ville:'Grenoble',salle:'Halle de Grenoble',public:[3480,4000],
   enjeu:'Van Belle veut entrer dans le top 8 des légers.',main:{a:'vanbelle',b:'Oumar Diallo',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,j:['aabaa','abaaa','aaaba'],nr:{a:8},or:{a:9}}},
  {n:59,date:new Date(2026,6,19),ville:'Lyon',salle:'Palais des sports',public:[5650,5800],titre:'Poids léger',ceinture:'gardée',
   enjeu:'Nana défend sa ceinture contre Carvalho.',main:{a:'nana',b:'carvalho',g:'a',meth:'KO',det:'crochet du droit',rd:3,tps:'2:14',n:5,j:['ab','bb','ab'],pr:{a:['perf','fin']},nr:{a:'C',b:6},or:{a:'C',b:5}}},
  {n:58,date:new Date(2026,5,6),ville:'Nice',salle:'Palais Nikaïa',public:[4100,5000],
   enjeu:'Labbé contre Kessler : le gagnant se rapproche de la ceinture.',main:{a:'labbe',b:'kessler',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,j:['aaaba','aabaa','abaaa'],nr:{a:2,b:7},or:{a:3,b:6}}},
  {n:57,date:new Date(2026,3,25),ville:'Bordeaux',salle:'Palais des sports',public:[3020,3800],
   enjeu:'Diallo veut la 2e place des mi-moyens.',main:{a:'diallo',b:null,g:'a',meth:'Décision',det:'partagée',rd:5,tps:'5:00',n:5,j:['aabba','abbab','aabab'],nr:{a:2},or:{a:3}}},
  {n:56,date:new Date(2026,2,20),ville:'Lyon',salle:'Palais des sports',public:[5800,5800],titre:'Poids léger',ceinture:'gardée',
   enjeu:'Nana défend sa ceinture contre Belkacem.',main:{a:'nana',b:'belkacem',g:'a',meth:'Décision',det:'partagée',rd:5,tps:'5:00',n:5,j:['ababa','babab','abbaa'],pr:{a:['soiree'],b:['soiree']},nr:{a:'C',b:4},or:{a:'C',b:3}}},
];

/* ---- Split Fight Night 63 : la carte complète de la maquette Carte, jouée (résultats inventés, À RELIRE).
   j : le vainqueur de chaque round terminé, juge par juge ; co : frappes significatives par round ; sol : amenées au sol réussies ;
   nr / nm : rang chez Split et rang mondial après la soirée. ---- */
const RS_63={
  m0:{g:'b',meth:'Soumission',det:'étranglement arrière',rd:4,tps:'3:12',n:5,titre:true,j:['bba','baa','bba'],co:[[9,14,21,4],[13,12,10,7]],sol:[0,3],
      pr:{b:['perf','fin']},nr:{a:1,b:'C'},nm:{a:20,b:11}},
  m1:{g:'a',meth:'Décision',det:'partagée',rd:3,tps:'5:00',n:3,j:['aba','abb','aba'],co:[[15,11,17],[12,16,13]],sol:[1,2],pr:{a:['soiree'],b:['soiree']},nr:{a:1,b:3},nm:{a:10,b:33}},
  m2:{g:'a',meth:'KO',det:'coup de pied à la tête',rd:2,tps:'1:47',n:3,j:['b','b','a'],co:[[8,6],[11,3]],sol:[0,1],pr:{a:['perf','fin']},nr:{a:3,b:4},nm:{a:26,b:34}},
  m3:{g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,j:['aaa','aaa','aba'],co:[[14,18,16],[9,10,12]],sol:[5,0],nr:{a:2,b:5},nm:{a:21,b:40}},
  p0:{g:'a',meth:'Soumission',det:'clé de bras',rd:1,tps:'3:05',n:3,j:['','',''],co:[[4],[6]],sol:[2,0],pr:{a:['fin']},nr:{a:6,b:9},nm:{a:41,b:58}},
  p1:{g:'b',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,j:['bab','bab','abb'],co:[[10,14,9],[12,11,15]],sol:[0,2],nr:{a:4,b:3},nm:{a:33,b:31}},
  p2:{g:'a',meth:'KO',det:'arrêt de l’arbitre sur coups',rd:3,tps:'0:48',n:3,j:['ab','ab','aa'],co:[[13,9,7],[10,12,1]],sol:[1,0],pr:{a:['fin']},nr:{a:5,b:8},nm:{a:39,b:54}},
  p3:{g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,j:['aaa','aba','aab'],co:[[11,13,12],[8,12,9]],sol:[3,1],nr:{a:4,b:6},nm:{a:32,b:41}},
  p4:{g:'b',meth:'Soumission',det:'triangle',rd:2,tps:'2:31',n:3,j:['a','a','a'],co:[[12,5],[7,3]],sol:[0,2],pr:{b:['fin']},nr:{a:8,b:6},nm:{a:55,b:43}},
  p5:{g:'b',meth:'KO',det:'crochet du droit',rd:1,tps:'1:12',n:3,j:['','',''],co:[[3],[5]],sol:[0,0],pr:{b:['fin']},nr:{a:12,b:9},nm:{a:66,b:63}},
};

/* ---- Lecture d'un combat ---- */
function rsCote(f,s){const c=f[s];return c;}
const rsW=f=>f.g==='a'?f.A:f.B, rsL=f=>f.g==='a'?f.B:f.A;
const rsWs=f=>f.g, rsLs=f=>f.g==='a'?'b':'a';
/** Une carte de juge : le nom du vainqueur de chaque round (Q41), puis le score (rounds terminés seulement). */
function rsCarteJuge(f,i){
  const r=[...(f.j[i]||'')],wa=r.filter(x=>x==='a').length,wb=r.length-wa,n=r.length;
  const sa=10*n-wb,sb=10*n-wa,gagne=sa===sb?null:sa>sb?'a':'b';
  return {r,sa,sb,gagne,txt:n?`${Math.max(sa,sb)}-${Math.min(sa,sb)}`:''};
}
function rsMethTxt(f){
  if(f.meth==='Décision')return `Décision ${f.det}`;
  return f.meth;
}
function rsQuand(f){return f.meth==='Décision'?`après ${f.n} rounds`:`${rsOrd(f.rd)} round · ${f.tps}`;}
/** La phrase du relevé, avec le nom du vainqueur même en cas de finition (R41). */
function rsPhrase(f){
  const w=rsW(f),l=rsL(f);
  if(f.meth==='Décision')return `${w.prenom} ${w.nom} gagne aux points, par décision ${f.det} des juges${f.det==='partagée'?' (deux juges sur trois)':''}, après ${f.n} rounds.`;
  const m=f.meth==='KO'?(f.det.startsWith('arrêt')?`par KO (${f.det})`:`par KO, sur un ${f.det}`):`par soumission (${f.det})`;
  return `${w.prenom} ${w.nom} gagne ${m} au ${rsOrd(f.rd)} round, à ${f.tps}.`;
}

/* ---- Construire une soirée : les combats et ce qu'ils ont changé ---- */
function rsCombat(k,a,b,d,cat){
  const A=typeof a==='string'&&!parId(a)?parNom(a,cat):parId(a),B=typeof b==='string'&&!parId(b)?parNom(b,cat):parId(b);
  return Object.assign({k,A,B,cat:cat||A.cat},d);
}
function rsSoiree(n){
  const s=RS_SOIREES.find(x=>x.n===n);if(!s)return null;
  if(s.combats)return s;
  if(n===63){
    const ids=[...S.rsCarte.m,...S.rsCarte.p];
    s.combats=ids.map((f,i)=>{const k=i<4?'m'+i:'p'+(i-4);return rsCombat(k,f.a,f.b,RS_63[k]);});
    s.combats.forEach(f=>{f.or={a:f.A._rsAvant?f.A._rsAvant.rang:f.A.rang,b:f.B._rsAvant?f.B._rsAvant.rang:f.B.rang};
      f.om={a:f.A._rsAvant?f.A._rsAvant.mondial:f.A.mondial,b:f.B._rsAvant?f.B._rsAvant.mondial:f.B.mondial};});
    return s;
  }
  /* Soirées d'avant : le combat principal écrit, le reste tiré à la graine dans l'effectif de Split. */
  const r=graine('rs'+n),pris=new Set();const M=s.main;
  let B=M.b;if(B===null){const x=COMBATTANTS.find(c=>c.cat==='Poids mi-moyen'&&c.rang===3);B=x?x.id:'Yoann Petit';}
  const A0=parId(M.a);
  const main=rsCombat('m0',M.a,B,Object.assign({co:null,sol:null,titre:!!s.titre},M),A0.cat);
  main.or=M.or;main.om=null;pris.add(main.A.id);pris.add(main.B.id);
  const cats=['Poids mouche','Poids coq','Poids plume','Poids mi-moyen','Poids moyen','Poids mi-lourd','Poids lourd','Poids paille F','Poids coq F','Poids mouche F','Poids plume F','Poids léger'];
  const out=[main];
  for(let i=1;i<10;i++){
    let A,Bx,k=0;
    do{const cat=cats[Math.floor(r()*cats.length)];
      const l=COMBATTANTS.filter(c=>c.cat===cat&&!c.ext&&typeof c.rang==='number'&&c.rang>=3&&c.rang<=22&&!pris.has(c.id)&&!['labbe','bello','belkacem','mezouar','darras','rachidi','meziane','lecomte'].includes(c.id));
      if(l.length<2)continue;A=l[Math.floor(r()*l.length)];const l2=l.filter(c=>c!==A&&Math.abs(c.rang-A.rang)<=4);Bx=l2.length?l2[Math.floor(r()*l2.length)]:null;}
    while((!A||!Bx)&&k++<40);
    if(!A||!Bx)continue;pris.add(A.id);pris.add(Bx.id);
    const g=(A.rang<Bx.rang?r()<.62:r()<.38)?'a':'b',x=r();
    const meth=x<.3?['KO',['crochet du gauche','arrêt de l’arbitre sur coups','genou au corps'][Math.floor(r()*3)]]:x<.5?['Soumission',['étranglement arrière','guillotine','clé de bras'][Math.floor(r()*3)]]:x<.85?['Décision','unanime']:['Décision','partagée'];
    const dec=meth[0]==='Décision',rd=dec?3:1+Math.floor(r()*3);
    const nbR=dec?3:rd-1,j=[0,1,2].map(q=>{let t='';for(let z=0;z<nbR;z++)t+=r()<.6?g:(g==='a'?'b':'a');return t;});
    if(dec){/* une décision colle à ses cartes : unanime = les trois juges pour lui, partagée = deux sur trois */
      j.forEach((t,q)=>{const lo=g==='a'?'b':'a',veut=meth[1]==='partagée'&&q===1?lo:g;const w=[...t].filter(z=>z===veut).length;if(w<2)j[q]=veut+veut+lo;});}
    const o=rsCombat(i<4?'m'+i:'p'+(i-4),A.id,Bx.id,{g,meth:meth[0],det:meth[1],rd,tps:dec?'5:00':`${1+Math.floor(r()*4)}:${String(Math.floor(r()*60)).padStart(2,'0')}`,n:3,j,co:null,sol:null,pr:dec?{}:{[g]:['fin']}});
    o.or={a:A.rang+(g==='a'?1:-1)*(r()<.5?1:0),b:Bx.rang+(g==='b'?1:-1)*(r()<.5?1:0)};o.nr={a:A.rang,b:Bx.rang};
    out.push(o);
  }
  /* Une seule performance de la soirée par soirée d'avant : la première finition. */
  const fin=out.find((f,i)=>i&&f.meth!=='Décision');if(fin&&!(main.pr&&main.pr[main.g]&&main.pr[main.g].includes('perf')))fin.pr[fin.g]=['perf','fin'];
  s.combats=out;return s;
}

/* ---- Après la soirée : les classements et les fiches suivent (une seule source pour tout l'écran) ---- */
/** Range une catégorie de Split : les rangs donnés sont fixés, les autres gardent leur ordre et comblent les places. */
function rsRanger(cat,fixes){
  const l=COMBATTANTS.filter(c=>c.cat===cat&&!c.ext&&(c.rang==='C'||typeof c.rang==='number')).sort((x,y)=>rsRangV(x.rang)-rsRangV(y.rang));
  const avant=new Map(l.map(c=>[c.id,c.rang]));
  const libres=l.filter(c=>!(c.id in fixes)),places=[];
  const aC=l.some(c=>c.rang==='C');
  for(let p=aC?0:1;places.length<l.length;p++)places.push(p);
  const prises=new Set(Object.values(fixes).map(rsRangV));
  const restantes=places.filter(p=>!prises.has(p));
  libres.forEach((c,i)=>{c.rang=restantes[i]===0?'C':restantes[i];});
  Object.entries(fixes).forEach(([id,r])=>{parId(id).rang=r;});
  l.forEach(c=>{const d=rsRangV(avant.get(c.id))-rsRangV(c.rang);c.tendS=d>0?`+${d}`:d<0?`${d}`:'=';}); /* tendS : rang chez Split (Classements) */
}
/** Joue Split Fight Night 63 dans les données de la maquette : bilans, séries, dates, rangs, historique de la fiche. */
function rsJouer63(){
  if(S.rs.apres)return;S.rs.apres=true;
  S.rsCarte={m:S.af.m.map(f=>({...f})),p:S.af.p.map(f=>({...f}))};
  const date=new Date(2027,1,16),fixes={},s=RS_SOIREES[0];
  const tous=[...S.rsCarte.m,...S.rsCarte.p];
  /* Les flèches parlent de la dernière soirée : ceux qui n'ont pas combattu ne bougent pas au mondial ;
     les retours de blessure passés avant le 17 février sont faits. */
  COMBATTANTS.forEach(c=>{if(!c.ext)c.tend='=';if(c.retour&&/février$/.test(c.retour)&&parseInt(c.retour)<17){c.statut='dispo';c.retour=null;}});
  tous.forEach((f,i)=>{const k=i<4?'m'+i:'p'+(i-4),d=RS_63[k];
    ['a','b'].forEach(sd=>{const c=parId(f[sd]),adv=parId(f[sd==='a'?'b':'a']),gagne=d.g===sd;
      historique(c); /* l'historique est figé avant d'ajouter la soirée */
      c._rsAvant={rang:c.rang,mondial:c.mondial,v:c.v,d:c.d,serie:c.serie};
      c._h.unshift({date,soiree:'Split Fight Night 63',adv:adv.prenom+' '+adv.nom,lien:adv.id,res:gagne?'v':'d',
        meth:[d.meth,d.meth==='Décision'?d.det:d.det],rd:d.rd,tps:d.tps});
      if(gagne)c.v++;else c.d++;
      c.serie=(c.serie+(gagne?'v':'d')).slice(-5);c.dernier=date;
      if(c.statut==='affiche')c.statut='dispo';
      (fixes[c.cat]=fixes[c.cat]||{})[c.id]=d.nr[sd];
      /* Rang mondial : il échange sa place avec celui qui l'occupait. */
      const m=d.nm[sd],t=x=>x>0?`+${x}`:x<0?`${x}`:'=';c.tend='=';
      if(m&&m!==c.mondial){const h=[...COMBATTANTS,...EXT].find(x=>x!==c&&x.cat===c.cat&&x.mondial===m);if(h){h.tend=t(m-c.mondial);h.mondial=c.mondial;}c.tend=t(c.mondial-m);c.mondial=m;}
    });});
  Object.entries(fixes).forEach(([cat,fx])=>rsRanger(cat,fx));
  /* Suspensions médicales après la soirée (À RELIRE). */
  const sus={nana:['Coupure à l’arcade','19 mars'],bello:['KO, suspendu 60 jours','18 avril']};
  Object.entries(sus).forEach(([id,[t,r]])=>{const c=parId(id);c.statut='blesse';c.retour=r;c._rsMed=t;});
  const bert=parId(S.rsCarte.p[5].a);if(bert){bert.statut='blesse';bert.retour='18 avril';bert._rsMed='KO, suspendu 60 jours';}
  /* La fiche de Nana : sa ceinture est partie, son premier trait reste vrai (il a pris le 3e round). */
  /* La carte suivante est vide : Split Fight Night 64 reste à composer. */
  S.af.m.forEach(f=>{f.a=null;f.b=null;});S.af.p.forEach(f=>{f.a=null;f.b=null;});S.af.sel='m0';
  S.date=new Date(2027,1,17);S.jours=45;
  s.combats=null;
}

/* ---- État de l'écran (gardé au retour, dossier UI/UX) ---- */
S.rs={apres:false,vue:'resultats',sel:null,det:null,ldVu:false};
const rsListe=()=>RS_SOIREES.filter(s=>S.rs.apres||s.n!==63);
const rsSel=()=>S.rs.sel&&rsListe().some(s=>s.n===S.rs.sel)?S.rs.sel:rsListe()[0].n;

/* ---- Pièces ---- */
/** Le C du champion, à taille fixe : il ne se tasse jamais dans une ligne. */
const rsCb=(t=26)=>`<span class="rs-c octr" style="--t:${t}px" title="Champion"><span class="octr"><b class="octr">C</b></span></span>`;
/** Mouvement au classement de Split : rien si rien ne bouge, sinon ▲ / ▼ (le C pour le nouveau champion). */
function rsMvt(av,ap){
  if(av===undefined||av===null||ap===undefined||ap==='–')return '';
  const d=rsRangV(av)-rsRangV(ap),t=x=>x==='C'?'champion':'n° '+x;
  if(!d)return '';
  return `<span class="rs-mv ${d>0?'up':'down'}" title="Chez Split : ${t(av)} → ${t(ap)}">${ap==='C'?rsCb(24):''}${d>0?'▲':'▼'}${ap==='C'?'':` ${Math.abs(d)}`}</span>`;
}
const RS_PR={soiree:'Combat de la soirée',perf:'Performance',fin:'Finition'};
/** Une seule étiquette par combat : la prime la plus rare (la finition va de soi après un KO ou une soumission). */
/* Les primes en médailles : un octogone doré, un pictogramme par prime (éclair, flamme, cible). */
const rsMedaille=(p,t=28)=>medaille(p,t); /* la médaille commune (fiche2.js) */
/** Les primes d'un combat : les médailles, puis la plus rare en toutes lettres et son montant. */
function rsPrimeTag(f){
  const all=Object.values(f.pr||{}).flat(),types=['soiree','perf','fin'].filter(p=>all.includes(p));
  if(!types.length)return '';const p=types[0];
  return `<span class="rs-bonus">${types.map(x=>rsMedaille(x)).join('')}<span class="rs-bt"><b>${RS_PR[p]}</b><span>${types.length>1?`+ ${types.slice(1).map(x=>RS_PR[x].toLowerCase()).join(' + ')} · ${nb(types.reduce((t,x)=>t+PRIMES_ORGA[x],0))} €`:`${nb(PRIMES_ORGA[p])} €${p==='soiree'?' chacun'+(rsF(f.A)?'e':''):''}`}</span></span></span>`;
}
const rsSurn=c=>`<span class="rs-surn">${c.surnom?`« ${esc(c.surnom)} »`:esc(rsCatC(c.cat))}</span>`;
const rsQuoi=f=>f.meth==='Décision'?[0,1,2].map(q=>{const c=rsCarteJuge(f,q);return c.gagne===f.g?c.txt:c.txt.split('-').reverse().join('-');}).join(' · '):`${rsOrd(f.rd)} round · ${f.tps}`;
function rsLigne(f,s,i){
  const w=rsW(f),l=rsL(f),ws=rsWs(f),ls=rsLs(f),mv=sd=>f.or?rsMvt(f.or[sd],f.nr?(s.n===63?(sd==='a'?f.A:f.B).rang:f.nr[sd]):undefined):'';
  const titre=f.titre||(f.k==='m0'&&s.titre);
  return `<div class="rs-row ${S.rs.det===f.k?'on':''} ${titre?'titre':''}" data-rsf="${f.k}" style="--i:${i}">
    <span class="marque octr v" title="Victoire">V</span>
    <div class="rs-cote"><span class="rs-n">${lien(w)}</span>${rsSurn(w)}</div>
    <span class="rs-mvc">${mv(ws)}</span>
    <div class="rs-how" title="${esc(f.det)}"><b class="T">${esc(f.meth==='Décision'?'Décision '+f.det:f.meth)}</b><span>${esc(rsQuoi(f))}</span></div>
    <div class="rs-cote rs-perd"><span class="rs-n">${lien(l)}</span>${rsSurn(l)}</div>
    <span class="rs-mvc">${mv(ls)}</span>
    <span class="rs-cat">${titre?`<span class="rs-titre">${rsCb(22)}Titre</span>`:''}<span>${esc(rsCatC(f.cat))}</span><span class="sous">${f.n} rounds</span></span>
    <span class="rs-pr">${rsPrimeTag(f)}</span>
    <span class="rs-chev">${ico('avant',22)}</span>
  </div>`;
}

/* ---- Onglet Résultats ---- */
function rsSoireesHtml(){
  const sel=rsSel(),l=rsListe();
  const it=s=>{const m=rsSoiree(s.n).combats[0],w=rsW(m),lo=rsL(m);
    return `<button class="rs-so ${s.n===sel?'on':''}" data-rss="${s.n}">
      <span class="rs-so1"><span class="T">Split Fight Night ${s.n}</span><span class="sous">${rsJour(s.date)}</span></span>
      <span class="rs-so2">${esc(s.ville)} · ${esc(s.salle)}</span>
      <span class="rs-so3">${s.titre?rsCb(24):''}<span>${esc(w.nom)} bat ${esc(lo.nom)}</span></span></button>`;};
  const toi=l.filter(s=>s.n===63),avant=l.filter(s=>s.n!==63);
  return pan(`<div class="pt"><h2>Les soirées</h2></div>
    <div class="rs-sol">${toi.length?`<div class="etiq rs-grp">Tes soirées</div>${toi.map(it).join('')}`:''}
    <div class="etiq rs-grp">Avant toi</div>${avant.map(it).join('')}
    <div class="sous rs-plus">Et 55 soirées plus anciennes, depuis 2004.</div></div>`,'width:380px;flex:none','rs-gauche');
}
function rsBandeau(s){
  const w=rsW(s.combats[0]);
  return `<div class="rs-ban">
    <div class="rs-ban-img ${s.titre?'or':''}"></div>
    <div class="rs-ban-g"><div class="T rs-ban-t">Split Fight Night <span style="color:var(--rouge-vif)">${s.n}</span></div>
      <div class="rs-ban-l">${s.date.getDate()} ${MOIS[s.date.getMonth()]} ${s.date.getFullYear()} · ${esc(s.salle)}, ${esc(s.ville)}</div></div>
    <div class="rs-case"><span class="etiq">L’enjeu</span><span class="rs-case-t">${esc(s.enjeu)}</span>
      ${s.titre?`<span class="rs-c1">${rsCb(26)}<span>${s.ceinture==='change de mains'?`<b>${esc(w.nom)}</b> devient champion`:`<b>${esc(w.nom)}</b> garde sa ceinture`}</span></span>`:''}</div>
    <div class="rs-case rs-case-p"><span class="etiq">Le public</span><span class="T rs-case-n">${nb(s.public[0])}</span><span class="sous">${s.public[0]>=s.public[1]?'à guichets fermés':`salle pleine à ${Math.round(s.public[0]/s.public[1]*100)} %`}</span></div>
  </div>`;
}
function rsResultatsHtml(){
  const s=rsSoiree(rsSel()),c=s.combats;
  return `<div class="rs-g">${rsSoireesHtml()}
    ${pan(`${rsBandeau(s)}
      <div class="rs-liste">
        <div class="rs-sec etiq">Carte principale</div>
        ${c.slice(0,4).map((f,i)=>rsLigne(f,s,i)).join('')}
        <div class="rs-sec etiq">Préliminaires</div>
        ${c.slice(4).map((f,i)=>rsLigne(f,s,i+4)).join('')}
      </div>`,'flex:1','rs-centre')}
    ${S.rs.det?rsDetailHtml(s):''}</div>`;
}

/* ---- Le relevé d'un combat, par-dessus l'écran (T7, R41) ---- */
const rsMin=s=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
/** Les statistiques du combat, par côté (a / b). Les frappes par round viennent de la soirée ; le reste est tiré à la graine,
    en restant cohérent : un soumetteur a tenté au moins une soumission, un KO peut avoir eu un knockdown avant. */
function rsStats(f){
  if(f._st)return f._st;
  const r=graine('st'+f.k+f.A.id+f.B.id),n=f.meth==='Décision'?f.n:f.rd;
  if(!f.co)f.co=[0,1].map(()=>Array.from({length:n},()=>6+Math.floor(r()*15)));
  if(!f.sol)f.sol=[Math.floor(r()*3),Math.floor(r()*2)];
  const [mm,ss]=f.tps.split(':').map(Number),duree=f.meth==='Décision'?f.n*300:(f.rd-1)*300+mm*60+ss;
  const st={duree};
  ['a','b'].forEach((sd,i)=>{const c=f[sd==='a'?'A':'B'],co=f.co[i],tot=co.reduce((x,y)=>x+y,0),gagne=f.g===sd;
    const prec=.38+r()*.18,td=f.sol[i],tdt=td+Math.floor(r()*3)+(td?0:r()<.5?1:0);
    const tete=Math.round(tot*(.5+r()*.22)),corps=Math.round((tot-tete)*(.5+r()*.25));
    st[sd]={fs:tot,tent:Math.max(tot,Math.round(tot/prec)),zones:[tete,corps,tot-tete-corps],td,tdt,
      ctrl:td?td*60+Math.floor(r()*70):Math.floor(r()*35),
      sub:gagne&&f.meth==='Soumission'?1+Math.floor(r()*2):/grappl|lutt|jiu|samb/i.test(c.style||'')&&r()<.4?1:0,
      kd:gagne&&f.meth==='KO'&&r()<.6?1:0,co};});
  return f._st=st;
}
/** Jauge octogonale (le contour de la cage) : la part remplie, le chiffre au milieu. */
function rsJauge(p,cls){
  const pts='29.3,3 70.7,3 97,29.3 97,70.7 70.7,97 29.3,97 3,70.7 3,29.3';
  return `<span class="rs-oj ${cls}"><svg viewBox="0 0 100 100"><polygon points="${pts}" class="f"/><polygon points="${pts}" class="v" pathLength="100" style="stroke-dasharray:${p} 100"/></svg><b class="T">${p}<small>%</small></b></span>`;
}
/** Une rangée de pastilles octogonales : pleines pour ce qui a réussi, vides pour le reste. */
const rsPips=(ok,tot,cls,vide='aucune')=>`<span class="rs-pips ${cls}">${Array.from({length:Math.max(tot,ok)},(_,k)=>`<i class="octr ${k<ok?'on':''}" style="--k:${k}"></i>`).join('')||`<em>${vide}</em>`}</span>`;
/** Les statistiques : des tuiles, chacune avec la forme qui lui va. Le vainqueur en blanc, l'autre en gris. */
function rsPerfHtml(f,w,l,W,L,dur){
  const zl=['Tête','Corps','Jambes'],zm=Math.max(...W.zones,...L.zones,1);
  const zones=zl.map((t,k)=>`<div class="rs-zo"><b>${W.zones[k]}</b><span class="rs-zb g"><i style="--p:${W.zones[k]/zm*100}%"></i></span><span class="rs-zl">${t}</span><span class="rs-zb d"><i style="--p:${L.zones[k]/zm*100}%"></i></span><b>${L.zones[k]}</b></div>`).join('');
  const pc=x=>Math.round(x.fs/x.tent*100),pw=W.ctrl/dur*100,pl=L.ctrl/dur*100;
  const ligne=(t,a,b,ta,tb)=>`<div class="rs-tile"><span class="etiq">${t}</span><div class="rs-pr2"><span class="g">${a}</span><b class="T g">${ta}</b></div><div class="rs-pr2"><span class="d">${b}</span><b class="T d">${tb}</b></div></div>`;
  return `<div class="rs-dsec rs-perf"><div class="rs-dt"><span class="etiq">Les statistiques</span><span class="rs-leg"><b>${esc(w.nom)}</b><span>${esc(l.nom)}</span></span></div>
    <div class="rs-tile rs-fs">
      <div class="rs-fs-s"><b class="T g">${W.fs}</b><span>sur ${W.tent}</span></div>
      <div class="rs-fs-m"><span class="etiq">Frappes significatives</span>${zones}</div>
      <div class="rs-fs-s"><b class="T d">${L.fs}</b><span>sur ${L.tent}</span></div></div>
    <div class="rs-tiles">
      <div class="rs-tile"><span class="etiq">Précision des frappes</span><div class="rs-ojs">${rsJauge(pc(W),'g')}${rsJauge(pc(L),'d')}</div></div>
      ${ligne('Amenées au sol',rsPips(W.td,W.tdt,'g'),rsPips(L.td,L.tdt,'d'),`${W.td}/${W.tdt}`,`${L.td}/${L.tdt}`)}
    </div>
    <div class="rs-tile rs-ctrl"><div class="rs-ctrl-h"><span class="etiq">Temps de contrôle</span><span class="sous">sur ${rsMin(dur)} de combat</span></div>
      <div class="rs-tl"><i class="g" style="--p:${pw}%"></i><span></span><i class="d" style="--p:${pl}%"></i></div>
      <div class="rs-tl-l"><b class="T g">${rsMin(W.ctrl)}</b><span>debout ${rsMin(dur-W.ctrl-L.ctrl)}</span><b class="T d">${rsMin(L.ctrl)}</b></div></div>
    <div class="rs-tiles">
      ${ligne('Tentatives de soumission',rsPips(W.sub,W.sub,'g'),rsPips(L.sub,L.sub,'d'),W.sub,L.sub)}
      ${ligne('Knockdowns',rsPips(W.kd,W.kd,'g','aucun'),rsPips(L.kd,L.kd,'d','aucun'),W.kd,L.kd)}
    </div></div>`;
}
function rsDetailHtml(s){
  const f=s.combats.find(x=>x.k===S.rs.det);if(!f)return '';
  const w=rsW(f),l=rsL(f),ws=rsWs(f),ls=rsLs(f),i=s.combats.indexOf(f),titre=f.titre||(f.k==='m0'&&s.titre);
  const st=rsStats(f),W=st[ws],L=st[ls];
  /* Les juges : un tableau, un round par ligne, un juge par colonne ; dans chaque case, celui qui gagne le round (Q41). */
  const cartes=[0,1,2].map(q=>rsCarteJuge(f,q)),pourW=cartes.filter(c=>c.gagne===ws).length;
  const fin=f.meth!=='Décision';
  const verdict=!cartes[0].r.length?`Fini au 1er round : aucun round n’était terminé.`
    :fin?`Avant la fin, ${esc(pourW>=2?w.nom:l.nom)} menait sur ${pourW>=2?pourW:3-pourW} carte${(pourW>=2?pourW:3-pourW)>1?'s':''} sur 3.`
    :pourW===3?`Les 3 juges donnent la victoire à ${esc(w.nom)}.`:`${pourW} juges sur 3 donnent la victoire à ${esc(w.nom)}.`;
  const cel=x=>x?`<span class="rs-jc ${x===ws?'g':'d'}">${esc((x==='a'?f.A:f.B).nom)}</span>`:'';
  let lignes='';
  for(let r=1;r<=f.n;r++){
    const xs=cartes.map(c=>c.r[r-1]);
    if(xs.some(Boolean))lignes+=`<div class="rs-jl"><span class="rs-jn">R${r}</span>${xs.map(cel).join('')}</div>`;
    else if(fin&&r===f.rd)lignes+=`<div class="rs-jl"><span class="rs-jn">R${r}</span><span class="rs-jfin">${esc(f.meth==='KO'?'KO':'Soumission')} de ${esc(w.nom)} à ${f.tps} : le round n’est pas noté</span></div>`;
    else lignes+=`<div class="rs-jl rs-jvide"><span class="rs-jn">R${r}</span><span class="rs-jfin">pas disputé</span></div>`;
  }
  const scores=cartes.map(c=>c.r.length?`<span class="rs-js"><b class="T">${c.txt}</b> ${esc((c.gagne===ws?w:l).nom)}</span>`:'<span class="rs-js">–</span>').join('');
  const juges=`<div class="rs-dsec"><div class="rs-dt"><span class="etiq">Les juges · qui gagne chaque round</span><span class="rs-leg"><b>${esc(w.nom)}</b><span>${esc(l.nom)}</span></span></div>
    <div class="rs-jg"><div class="rs-jl rs-jh"><span class="rs-jn"></span>${RS_JUGES.map(j=>`<span>${esc(j)}</span>`).join('')}</div>${lignes}
      <div class="rs-jl rs-jtot"><span class="rs-jn">Score</span>${scores}</div></div>
    <div class="rs-verdict">${verdict}</div></div>`;
  /* Les statistiques : des tuiles, le vainqueur en blanc (rsPerfHtml). */
  const chiffres=rsPerfHtml(f,w,l,W,L,st.duree);
  /* Frappes significatives, round par round : deux colonnes par round, le vainqueur en blanc. */
  const mx=Math.max(...W.co,...L.co,1);
  const col=(v,cls)=>v===undefined?`<span class="rs-col ${cls} vide"></span>`:`<span class="rs-col ${cls}"><em>${v}</em><i style="--h:${v/mx*100}%"></i></span>`;
  const rounds=Array.from({length:f.n},(_,r)=>`<div class="rs-rd ${r>=W.co.length?'off':''}" style="--r:${r}"><div class="rs-cols">${col(W.co[r],'g')}${col(L.co[r],'d')}</div><span class="rs-rdl">R${r+1}</span></div>`).join('');
  const graph=`<div class="rs-dsec"><div class="rs-dt"><span class="etiq">Frappes significatives, round par round</span></div><div class="rs-rds">${rounds}</div></div>`;
  const prix=sd=>((f.pr||{})[sd]||[]).map(p=>`<span class="rs-bp">${rsMedaille(p,24)}${RS_PR[p]} ${nb(PRIMES_ORGA[p])} €</span>`).join('');
  const bilan=(c,sd)=>{const av=f.or?f.or[sd]:undefined,ap=s.n===63?c.rang:(f.nr||{})[sd],t=x=>x==='C'?'champion':'n° '+x,p=prix(sd);
    const d=av===undefined||ap===undefined?null:rsRangV(av)-rsRangV(ap);
    return `<div class="rs-bil"><span class="rs-bil-n">${esc(c.nom)}</span><span>${s.n===63?rec(c.v,c.d):''}</span><span>${d===null?'':d?`${t(av)} → <b class="${ap==='C'?'or':''}">${t(ap)}</b> <span class="${d>0?'cl-up':'cl-down'}">${d>0?'▲':'▼'}</span>`:`reste ${t(ap)}`}</span>${p?`<span class="rs-bil-p">${p}</span>`:'<span></span>'}</div>`;};
  return `<div class="rs-det">${pan(`
    <div class="rs-dh"><span class="etiq">${titre?`${rsCb(22)} Titre des ${esc(rsCatPl(f.cat))}`:esc(rsCatL(f.cat))} · ${f.n} rounds</span>
      <span class="rs-dnav"><button class="bb oct petit" data-rsrevoir="arene"><span class="oct">${ico('avant',20)}Revoir</span></button><button class="bb oct petit" data-rsrevoir="recit"><span class="oct">Le récit</span></button>
        <i class="rs-dsep"></i><button class="bb oct petit" data-rsnav="-1" ${i?'':'disabled'} title="Combat précédent"><span class="oct">${ico('retour',22)}</span></button><button class="bb oct petit" data-rsnav="1" ${i<s.combats.length-1?'':'disabled'} title="Combat suivant"><span class="oct">${ico('avant',22)}</span></button></span></div>
    <div class="rs-face">
      <div class="rs-fc"><span class="rs-fp"><span class="marque octr v">V</span>${esc(w.prenom)}${w.surnom?` « ${esc(w.surnom)} »`:''}</span><span class="T rs-fn"><span class="nom" data-fiche="${w.id}">${esc(w.nom)}</span></span></div>
      <span class="rs-fbat">bat</span>
      <div class="rs-fc rs-fd"><span class="rs-fp">${esc(l.prenom)}${l.surnom?` « ${esc(l.surnom)} »`:''}</span><span class="T rs-fn"><span class="nom" data-fiche="${l.id}">${esc(l.nom)}</span></span></div>
    </div>
    <div class="rs-ph">${esc(rsPhrase(f))}</div>
    <div class="rs-d2"><div class="rs-dcol">${juges}${graph}</div>${chiffres}</div>
    <div class="rs-bils">${bilan(w,ws)}${bilan(l,ls)}</div>
  `,'height:100%')}</div>`;
}
/** Deux rangs face à face : 4 → 3, le C du champion en or. */
function rsRangs(av,ap){
  const d=rsRangV(av)-rsRangV(ap),box=x=>x==='C'?rsCb(32):`<span class="rs-rk">${x}</span>`;
  return `<span class="rs-rgs">${box(av)}<span class="rs-fl ${d>0?'up':'down'}">${d>0?'▲':'▼'}</span>${box(ap)}</span>`;
}

/* ---- Onglet Le lendemain : refait (R40, Q40) — l'essentiel, sans défilement ---- */
function rsLendemainHtml(){
  const s=rsSoiree(63),C=k=>s.combats.find(f=>f.k===k),m0=C('m0'),m1=C('m1'),m2=C('m2');
  const w0=rsW(m0),l0=rsL(m0),w2=rsW(m2),l2=rsL(m2),w1=rsW(m1),l1=rsL(m1);
  const moment=(cls,tag,t,p,f,i)=>`<div class="rs-mo ${cls}" style="--i:${i}">${pan(`<div class="rs-mo-img"></div><div class="rs-mo-in">
    <span class="rs-tag oct">${tag}</span><div class="T rs-mo-t">${t}</div><div class="rs-mo-p">${p}</div>
    <button class="rs-lien" data-rsvoir="${f.k}">Voir le combat ›</button></div>`,'height:100%')}</div>`;
  const moments=`<div class="rs-mos">
    ${moment('or','La ceinture',`${esc(w0.nom)} prend la ceinture`,`Étranglement arrière au 4e round. ${esc(l0.nom)} menait sur une carte. Revanche de 2025 : Split a un nouveau champion des légers.`,m0,0)}
    ${moment('','La finition',`${esc(w2.nom)} met ${esc(l2.nom)} KO`,`Un coup de pied à la tête, au 2e round, à 1:47. Il réclamait un top 3 : il prend la place de ${esc(l2.nom)}.`,m2,1)}
    ${moment('','Le combat de la soirée','Trois rounds à fond',`${esc(w1.nom)} bat ${esc(l1.nom)} sur deux cartes sur trois. 43 frappes contre 41, le Forum debout.`,m1,2)}</div>`;
  /* Ce qui a bougé : la carte principale, puis les préliminaires qui gagnent ou perdent deux places ou plus. */
  const ids=[];s.combats.forEach((f,k)=>{[f.A,f.B].forEach(c=>{const a=c._rsAvant;if(!a||a.rang===c.rang)return;
    if(k<4||Math.abs(rsRangV(a.rang)-rsRangV(c.rang))>=2)ids.push(c);});});
  const ordre=['Poids léger','Poids paille F','Poids coq F','Poids mi-moyen','Poids mouche','Poids lourd'];
  ids.sort((x,y)=>ordre.indexOf(x.cat)-ordre.indexOf(y.cat)||rsRangV(x.rang)-rsRangV(y.rang));
  const phr=c=>{const f=s.combats.find(z=>z.A===c||z.B===c),g=rsW(f)===c,adv=g?rsL(f):rsW(f);
    if(c.rang==='C')return `nouve${rsF(c)?'lle':'au'} champion${rsE(c)}`;
    if(c._rsAvant.rang==='C')return 'perd sa ceinture';
    return g?`bat ${esc(adv.nom)}`:`battu${rsE(c)} par ${esc(adv.nom)}`;};
  const autres=s.combats.reduce((n,f)=>n+[f.A,f.B].filter(c=>c._rsAvant&&c._rsAvant.rang!==c.rang).length,0)-ids.length;
  const lignes=ids.map((c,i)=>`<div class="rs-cl" style="--i:${i}">
    <span class="rs-cl-n"><span class="rs-n">${lien(c)}</span><span class="sous">${esc(rsCatC(c.cat))} · ${phr(c)}${c.mondial!==c._rsAvant.mondial?` · n° ${c.mondial} mondial <span class="${c.mondial<c._rsAvant.mondial?'cl-up':'cl-down'}">${c.mondial<c._rsAvant.mondial?'▲':'▼'}</span>`:''}</span></span>
    ${rsRangs(c._rsAvant.rang,c.rang)}</div>`).join('');
  const classement=pan(`<div class="pt"><h2>Le classement</h2></div><div class="rs-cls">${lignes}</div>
    <button class="rs-lien rs-bas" data-go="classements">${autres>0?`Et ${autres} autres mouvements · `:''}Ouvrir les classements ›</button>`,'height:100%');
  /* La presse et les vestiaires (À RELIRE). */
  const presse=pan(`<div class="pt"><h2>On en parle</h2><span class="ment"><span class="relire" style="margin:0">À relire</span></span></div>
    <div class="rs-une"><span class="etiq">Cage Hebdo · la une</span><div class="T rs-une-t">« ${esc(w0.nom)}, enfin »</div>
      <p>Battu par ${esc(l0.nom)} en 2025, il a attendu le 4e round pour lui prendre le dos.</p></div>
    <div class="rs-cits"><div class="rs-cit"><p>« ${esc(w2.nom)} règle la question du top 3 en un coup de pied. »</p><span class="etiq">Tableau Noir</span></div>
      <div class="rs-cit"><p>« ${esc(w1.nom)}–${esc(l1.nom)}, on veut la revanche, et à Lyon. »</p><span class="etiq">Le Forum</span></div></div>
    <div class="rs-vest"><span class="etiq">Dans les vestiaires</span>
      <div class="rs-q"><p>« Je l’avais dit : il fallait l’emmener au 4e. »</p><span class="rs-n">${lien(w0)}</span></div>
      <div class="rs-q"><p>« Je veux la revanche. Pas dans un an : cet été. »</p><span class="rs-n">${lien(l0)}</span></div></div>`,'height:100%');
  /* Les chiffres, à la fin seulement (R39). Primes : montants de l'organisation (fiche, onglet Contrat). */
  const pr=s.combats.reduce((t,f)=>t+Object.values(f.pr||{}).flat().reduce((a,p)=>a+PRIMES_ORGA[p],0),0);
  const recette=846000,dep=345000+120000+pr,reste=recette-dep,pct=Math.round(s.public[0]/s.public[1]*100);
  const chiffres=pan(`<div class="pt"><h2>La soirée</h2></div>
    <div class="rs-ch"><span>Le public</span><b class="T"><span data-rscompte="${s.public[0]}">0</span><small> / ${nb(s.public[1])}</small></b></div>
    <div class="rs-jauge"><i style="--p:${pct}%"></i></div>
    <div class="rs-ch"><span>La recette</span><b class="T"><span data-rscompte="${recette}">0</span> €</b></div>
    <div class="rs-ch"><span>Bourses, primes et salle</span><b class="T">− ${nb(dep)} €</b></div>
    <div class="rs-ch2"><span>bourses 345 000 €</span><span>primes ${nb(pr)} €</span><span>salle 120 000 €</span></div>
    <div class="rs-ch rs-reste"><span>Ce qu’il te reste</span><b class="T ${reste>=0?'cl-up':'cl-down'}">${reste>=0?'+':'−'} <span data-rscompte="${Math.abs(reste)}">0</span> €</b></div>
    <div class="rs-ch"><span>La popularité de Split</span><b class="T">40 → 43 <span class="cl-up">▲</span></b></div>
    <div class="etiq rs-medt">Les primes</div>
    ${[['soiree','Combat de la soirée'],['perf','Performance'],['fin','Finition']].map(([k,t])=>{const qui=s.combats.flatMap(f=>['a','b'].filter(sd=>((f.pr||{})[sd]||[]).includes(k)).map(sd=>sd==='a'?f.A:f.B));
      return qui.length?`<div class="rs-pl">${rsMedaille(k,30)}<span class="rs-pl-t">${t}</span><span class="rs-pl-n">${qui.slice(0,qui.length>3?2:3).map(c=>lien({...c,prenom:''}).replace('> ','>')).join(', ')}${qui.length>3?` <span class="sous">et ${qui.length-2} autres</span>`:''}</span><span class="sous">${nb(PRIMES_ORGA[k])} €</span></div>`:'';}).join('')}
    <div class="etiq rs-medt">Tes blessés</div>
    ${s.combats.flatMap(f=>[f.A,f.B]).filter(c=>c._rsMed).map(c=>`<div class="rs-med"><span class="rs-med-i">${ico('medical',20)}</span><span class="rs-n">${lien(c)}</span><span class="sous">${esc(c._rsMed.replace(', suspendu 60 jours',''))} · retour le ${esc(c.retour)}</span></div>`).join('')}`,'height:100%');
  return `<div class="rs-ld">${moments}<div class="rs-ld2">${classement}${presse}${chiffres}</div></div>`;
}

/* ---- Rendu de l'écran ---- */
function rsOnglets(){
  const o=(v,t,mq)=>`<button class="onglet oct ${S.rs.vue===v?'ouvert':''}" data-rsvue="${v}">${t}${mq?'<span class="onglet-mq octr"></span>':''}</button>`;
  return `<div class="cl-haut">${o('resultats','Résultats')}${S.rs.apres?o('lendemain','Le lendemain',!S.rs.ldVu):''}</div>`;
}
function rsHtml(){
  if(S.rs.vue==='lendemain'&&S.rs.apres){S.rs.ldVu=true;return `<div class="rs">${rsOnglets()}${rsLendemainHtml()}</div>`;}
  return `<div class="rs ${S.rs.det?'rs-ouvert':''}">${rsOnglets()}${rsResultatsHtml()}</div>`;
}
function rsAlerte(){
  if(!S.rs.apres){$('#alerte').classList.remove('af-al');msAlerte();return;}
  $('#alerte').innerHTML=`<span class="tag-j oct cj fin">Prochaine étape</span><span style="font-size:22px">Split Fight Night 64, le 3 avril à Bordeaux : la carte est vide.</span>`;
}
/** Mouvement discret : compteurs qui défilent, jauge qui se remplit (T3). Une seule fois par ouverture d'onglet. */
function rsAnimer(){
  const reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-rscompte]').forEach(e=>{const v=+e.dataset.rscompte;
    if(reduit||!S.rs.anim){e.textContent=nb(v);return;}
    const t0=performance.now();const pas=t=>{const k=Math.min(1,(t-t0)/900),x=1-Math.pow(1-k,3);e.textContent=nb(v*x);if(k<1)requestAnimationFrame(pas);};requestAnimationFrame(pas);});
  const z=$('.rs');if(z&&S.rs.anim&&!reduit)z.classList.add('rs-anim');
  S.rs.anim=false;
  const l=$('.rs-sol');if(l&&typeof majFondu==='function')majFondu(l);
}

const rsRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='resultats'){rsRendreBase();return;}
  rendreBarre();rendreEntete('Résultats');rsAlerte();
  const l=$('.rs-sol'),y=l?l.scrollTop:0;
  $('#corps').style.top='152px';$('#corps').innerHTML=rsHtml();
  const l2=$('.rs-sol');if(l2)l2.scrollTop=y;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  rsAnimer();
};
/* Après la soirée, l'en-tête annonce la soirée suivante. */
const rsEnteteBase=rendreEntete;
rendreEntete=function(p){rsEnteteBase(p);
  if(S.rs.apres){const b=[...document.querySelectorAll('#entete .boite .T')].find(e=>/Fight Night/.test(e.textContent));if(b)b.innerHTML='Split Fight Night <span style="color:var(--rouge-vif)">64</span>';}
  if(S.ecran==='resultats'&&S.rs.det&&!S.fiche){const r=$('#bRetour');if(r)r.disabled=false;}};
const rsAllerBase=aller;
aller=function(ec){
  if(ec!=='resultats'){S.rs.det=null;rsAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='resultats'){S.hist.push(S.ecran);S.futur=[];S.rs.anim=true;}
  S.ecran='resultats';rendre();
};
/* Retour ferme d'abord le relevé du combat, avant de quitter l'écran. */
const rsRetourBase=retour;
retour=function(){
  if(S.ecran==='resultats'&&!S.fiche&&S.rs.det){S.rs.det=null;rendre();return;}
  rsRetourBase();
};
const rsOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='resultats'){rsOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='resultats')return;
  const t=e.target;let el;
  if(t.closest('#bContinuer')){e.stopImmediatePropagation();toast('Continuer reprend le temps jour par jour jusqu’au prochain message (hors de cette maquette).');return;}
  if(S.fiche||t.closest('[data-fiche]'))return;
  if((el=t.closest('[data-rsvue]'))){S.rs.vue=el.dataset.rsvue;S.rs.det=null;S.rs.anim=true;rendre();return;}
  if((el=t.closest('[data-rss]'))){const n=+el.dataset.rss;if(n!==rsSel()){S.rs.sel=n;S.rs.det=null;S.rs.anim=true;rendre();}return;}
  if((el=t.closest('[data-rsrevoir]'))){toast(el.dataset.rsrevoir==='arene'?'Le combat se rejoue dans l’arène, vu du dessus (Q39b, hors de cette maquette).':'Le récit du combat et ses temps forts (Q39b, hors de cette maquette).');return;}
  if((el=t.closest('[data-rsvoir]'))){S.rs.vue='resultats';S.rs.sel=63;S.rs.det=el.dataset.rsvoir;S.rs.anim=true;rendre();return;}
  if(S.rs.det&&!t.closest('.rs-det,[data-rsf],#entete,#barre,.toast')){S.rs.det=null;rendre();return;}
  if((el=t.closest('[data-rsnav]'))){const s=rsSoiree(rsSel()),i=s.combats.findIndex(f=>f.k===S.rs.det)+(+el.dataset.rsnav);if(s.combats[i]){S.rs.det=s.combats[i].k;rendre();}return;}
  if((el=t.closest('[data-rsf]'))){S.rs.det=S.rs.det===el.dataset.rsf?null:el.dataset.rsf;rendre();return;}
},true);

/* ---- Lancement : ?ecran=resultats (lendemain de Split Fight Night 63), options vue=lendemain, soiree=<n>, combat=<m0…p5>, fiche=<id>, avant=1 (avant la soirée) ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='resultats')return;
  /* La carte jouée est la carte complète de la maquette Carte. */
  Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});
  if(!q.get('avant'))rsJouer63();
  S.ecran='resultats';S.hist=['accueil'];S.rs.anim=true;
  if(q.get('vue')==='lendemain')S.rs.vue='lendemain';
  if(q.get('soiree'))S.rs.sel=+q.get('soiree');
  if(q.get('combat'))S.rs.det=q.get('combat');
  rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),50);
});
