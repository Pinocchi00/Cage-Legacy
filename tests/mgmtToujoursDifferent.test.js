"use strict";
/* Retours d'Anthony du 09/10/2026 : « 2x plus de lignes de presse, de phrases, de répliques, d'histoire, de monde ; sur une partie de A à Z tout doit toujours
   être différent ; vérifie les palmarès avec ce qui se fait dans la vraie vie. » Un test par promesse. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const partie=seed=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed}); CL.mgmtEnter(1); CL.mgmtArriveeFin();`); return w; };

test('Les réserves de textes ont plus que doublé : presse 46→92, répliques 220→440, anciens combats 33→66, moments de vie racontés, banques de noms', () => {
  const w=newGameWindow();
  const r=res(w,`const compte=o=>Object.values(o).reduce((n,l)=>n+l.length,0);
    return {presse:MGMT_MEDIAS_LIGNES.length,repliques:MGMT_VOIX.reduce((n,v)=>n+v.repliques.length,0),
      anciens:Object.values(MGMT_ANCIENS_TEXTES).filter(Array.isArray).reduce((n,l)=>n+l.length,0),
      moments:MGMT_MOMENTS.filter(x=>typeof x.texte==='string'&&x.texte.length>0).length,total:MGMT_MOMENTS.length,
      surnomsFr:compte(MGMT_SURNOMS.fr),surnomsEn:compte(MGMT_SURNOMS.en),metiers:compte(MGMT_METIERS),milieux:MGMT_MILIEUX.length,rituels:MGMT_RITUELS.length,
      comm:compte(Object.fromEntries(Object.entries(MGMT_COMMENTAIRE).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v])))};`);
  assert.ok(r.presse>=92,'presse '+r.presse); assert.ok(r.repliques>=440,'répliques '+r.repliques); assert.ok(r.anciens>=66,'anciens '+r.anciens);
  assert.equal(r.moments,r.total,'chaque moment de vie a sa phrase');
  assert.ok(r.surnomsFr>=190&&r.surnomsEn>=80&&r.metiers>=272&&r.milieux>=44&&r.rituels>=100,JSON.stringify(r));
  assert.ok(r.comm>=60,'commentaire '+r.comm);
});

test('Aucune phrase en double dans les réserves', () => {
  const w=newGameWindow();
  const r=res(w,`const dup=a=>{ const s=new Set(), d=[]; for(const x of a){ if(s.has(x)) d.push(x); s.add(x); } return d; };
    return {presse:dup(MGMT_MEDIAS_LIGNES.map(l=>l.media+'|'+l.texte)),voix:dup(MGMT_VOIX.flatMap(v=>v.repliques.map(x=>x.texte))),
      anciens:dup(Object.values(MGMT_ANCIENS_TEXTES).filter(Array.isArray).flat().map(x=>x.t)),moments:dup(MGMT_MOMENTS.map(x=>x.texte)),
      metiers:dup(Object.values(MGMT_METIERS).flat().map(x=>x.texte.toLowerCase())),rituels:dup(MGMT_RITUELS.map(x=>x.texte))};`);
  assert.deepEqual(r,{presse:[],voix:[],anciens:[],moments:[],metiers:[],rituels:[]});
});

test('Les phrases des moments de vie sont neutres (ni il, ni elle, ni lui) et courtes', () => {
  const w=newGameWindow();
  const t=JSON.parse(w.eval(`JSON.stringify(MGMT_MOMENTS.map(x=>x.texte))`));
  for(const x of t){
    assert.ok(!/(^|[^a-zA-ZÀ-ÿ])(il|elle|ils|elles|lui)([^a-zA-ZÀ-ÿ]|$)/i.test(x),'neutre : '+x);
    assert.ok(x.split(/\s+/).length<=16,'courte : '+x);
  }
});

test('Deux parties ne se ressemblent plus : métiers, surnoms, voix et salles changent avec la graine', () => {
  const a=res(partie(7),`const m=G.mgmt; return {g:m.graine,salles:m.salles.map(s=>s.nom),f:m.roster.slice(0,12).map(f=>[mgmtVoixId(f),mgmtIdentite(m,f).metier,mgmtIdentite(m,f).surnom])};`);
  const b=res(partie(19),`const m=G.mgmt; return {g:m.graine,salles:m.salles.map(s=>s.nom),f:m.roster.slice(0,12).map(f=>[mgmtVoixId(f),mgmtIdentite(m,f).metier,mgmtIdentite(m,f).surnom])};`);
  assert.notEqual(a.g,b.g); assert.ok(a.g&&b.g);
  assert.notDeepEqual(a.salles,b.salles,'les cinq salles ne sont plus celles de toutes les parties');
  const memes=a.f.filter((x,i)=>x[1]===b.f[i][1]&&x[2]===b.f[i][2]).length;
  assert.ok(memes<=2,'au plus deux combattants sur douze gardent le même métier et le même surnom : '+memes);
});

test('Une partie reprise (sans graine) garde son monde tel qu’il était', () => {
  const w=partie(7);
  const r=res(w,`const m=G.mgmt, f=m.roster[0], avec=[mgmtVoixId(f),mgmtIdentite(m,f).metier]; delete m.graine; const sans=[mgmtVoixId(f),mgmtIdentite(m,f).metier]; return {valide:validateMgmt(Object.assign({},m,{graine:'ab1'})),avec,sans,ok:validateMgmt(m)};`);
  assert.equal(r.ok,true,'sans graine, la partie est valide'); assert.equal(r.valide,true,'avec graine aussi');
  assert.ok(r.sans.length===2);
});

test('Un combattant ne redit pas la même phrase d’un cycle à l’autre', () => {
  const w=partie(7);
  const r=res(w,`const m=G.mgmt; const f=m.roster.find(x=>mgmtVoixId(x)==='la-voix-commune'&&mgmtVoixActuelle(m,x)==='la-voix-commune'); const dits=[];
    for(let c=1;c<=3;c++){ m.cycle=c; dits.push(mgmtReplique(m,f,'reseaux')); } m.cycle=1; const encore=mgmtReplique(m,f,'reseaux');
    return {dits,rejoue:encore===dits[0]};`);
  assert.equal(new Set(r.dits).size,3,'trois cycles, trois phrases différentes : '+r.dits.join(' / '));
  assert.equal(r.rejoue,true,'rejouer la semaine redit la même phrase');
});

test('La presse ne redit pas la même ligne d’une soirée à l’autre', () => {
  const w=partie(7);
  const r=res(w,`const m=G.mgmt; const [a,b]=m.roster.filter(x=>x.div===m.roster[0].div).slice(0,2);
    const scene={a,b,gagne:true,family:'dec',round:3,rounds:3,n:5,cat:'X',serie:false,surprise:false,va:null,vb:null};
    const vus=[]; for(let c=1;c<=6;c++){ m.cycle=c; vus.push(mgmtMediasScene(m,'lendemain',scene,a.id+'|'+b.id,3).map(x=>x.texte)); }
    return {vus};`);
  const tous=r.vus.flat();
  assert.ok(tous.length>=12,'des lignes à chaque soirée');
  assert.equal(new Set(tous).size,tous.length,'six soirées de suite, aucune ligne en double');
});

test('Un palmarès ressemble à la vraie vie : peu de nuls, des champions à 80 % et plus, un haut du classement qui gagne plus que le bas, des vétérans aguerris', () => {
  const lignes=[7,19,31].flatMap(seed=>res(partie(seed),`const m=G.mgmt; return m.roster.map(f=>({age:f.age,W:f.W,L:f.L,D:f.D||0,rang:mgmtRangAffichable(m,f)}));`));
  const tot=r=>r.W+r.L+r.D, somme=(a,k)=>a.reduce((n,r)=>n+(typeof k==='function'?k(r):r[k]),0);
  const nuls=somme(lignes,'D')/somme(lignes,tot);
  assert.ok(nuls>=0.005&&nuls<=0.03,'nuls : '+(nuls*100).toFixed(1)+' % des combats (vraie vie : 1,5 à 2 %)');
  const avecNul=lignes.filter(r=>r.D>0).length/lignes.length;
  assert.ok(avecNul<=0.3,'combattants ayant un nul : '+(avecNul*100).toFixed(0)+' %');
  const part=g=>somme(g,'W')/Math.max(1,somme(g,tot));
  const champs=lignes.filter(r=>r.rang==='C'), top5=lignes.filter(r=>/^[1-5]/.test(String(r.rang))&&r.rang!=='C'&&Number.parseInt(r.rang,10)<=5), bas=lignes.filter(r=>r.rang===null||Number.parseInt(r.rang,10)>15||Number.isNaN(Number.parseInt(r.rang,10))&&r.rang!=='C');
  assert.ok(champs.length>=20&&part(champs)>=0.8,'champions : '+(part(champs)*100).toFixed(0)+' %');
  assert.ok(part(top5)>=0.72,'top 5 : '+(part(top5)*100).toFixed(0)+' %');
  assert.ok(part(top5)>part(bas)+0.1,'le haut du classement gagne nettement plus que le bas');
  const vets=lignes.filter(r=>r.age>=33);
  assert.ok(vets.length>50&&somme(vets,tot)/vets.length>=20,'un vétéran de 33 ans et plus a plus de 20 combats en moyenne');
  assert.ok(lignes.every(r=>tot(r)>=2),'personne n’a moins de deux combats');
});
