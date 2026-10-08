"use strict";
/* Brief des corrections du 08/10/2026, lot 10 : combats réclamés et satisfaction. 10.1 : un combat réclamé impossible à booker ne pénalise plus ; 10.2 : une décision
   serrée compte plus qu'une décision à sens unique, lue sur les cartes des juges. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('10.1 — Un combat réclamé dont un combattant est suspendu ou sans contrat n’entre pas dans les combats lus avant la soirée', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const [a,b,c]=m.roster.filter(f=>mgmtAvailable(m,f)&&f.div===m.roster.find(g=>mgmtAvailable(m,g)).div).slice(0,3);
    const recl=[{a:a.id,b:b.id},{a:a.id,b:c.id}];
    const avant=mgmtReclamesBookables(m,recl).length;
    b.susp=m.cycle+3;
    const suspendu=mgmtReclamesBookables(m,recl).map(x=>x.b);
    b.susp=null; c.libre=true;
    const libre=mgmtReclamesBookables(m,recl).map(x=>x.b);
    return {avant,suspendu,libre,b:b.id,c:c.id};`);
  assert.equal(r.avant,2);
  assert.deepEqual(r.suspendu,[r.c]);
  assert.deepEqual(r.libre.includes(r.c),false);
});

test('10.1 — Une rivalité impossible à booker ne fait plus baisser la satisfaction : la soirée ne reçoit que les combats réclamés bookables', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const [a,b]=m.roster.filter(f=>mgmtAvailable(m,f)&&f.div===m.roster.find(g=>mgmtAvailable(m,g)).div).slice(0,2);
    m.facts.push({c:m.cycle,k:'finish',a:a.id,b:b.id}); 
    const fights=[];
    const base={fights,noms:0};
    const tous=mgmtSatisfaction(m,{...base,reclames:[{a:a.id,b:b.id}]}).reclame;
    b.susp=m.cycle+3;
    const filtres=mgmtSatisfaction(m,{...base,reclames:mgmtReclamesBookables(m,[{a:a.id,b:b.id}])}).reclame;
    return {tous,filtres};`);
  assert.equal(r.tous,0,'réclamé et non joué : zéro');
  assert.equal(r.filtres,0.5,'impossible à booker : neutre, comme si rien n’était réclamé');
});

test('10.2 — Une décision partagée ou à un point d’écart compte plus qu’une décision à sens unique ; la méthode seule ne décide plus', () => {
  const win=neuve();
  const r=res(win,`const sens={method:'Décision unanime',judges:{j1:[30,27],j2:[30,27],j3:[30,27]}};
    const serre={method:'Décision unanime',judges:{j1:[29,28],j2:[29,28],j3:[29,28]}};
    const moyen={method:'Décision unanime',judges:{j1:[30,28],j2:[30,28],j3:[29,28]}};
    const partage={method:'Décision partagée',judges:{j1:[29,28],j2:[28,29],j3:[30,27]}};
    const ko={method:'KO (coup)',judges:{j1:[10,9],j2:[10,9],j3:[10,9]}};
    const m=G.mgmt; const a=m.roster[0].id,b=m.roster[1].id;
    const sat=ser=>mgmtSatisfaction(m,{reclames:[],noms:0,fights:[{a,b,family:'dec',round:3,rounds:3,serre:ser}]}).score;
    return {s:mgmtDecisionSerree(sens),r:mgmtDecisionSerree(serre),mo:mgmtDecisionSerree(moyen),p:mgmtDecisionSerree(partage),k:mgmtDecisionSerree(ko),
      satSens:sat(0.4),satSerre:sat(1)};`);
  assert.equal(r.s,0.4); assert.equal(r.r,1); assert.equal(r.mo,0.7); assert.equal(r.p,1); assert.equal(r.k,null);
  assert.ok(r.satSerre>r.satSens,'une décision serrée fait monter la satisfaction');
});

test('10.2 — Un combat joué porte son indice de décision serrée, à partir des cartes réelles des juges', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const vus=new Set(); let n=0;
    for(let s=1;s<=60;s++){ setSeed(s); const a=mgmtFightReady(m.roster[0],m.cycle), b=mgmtFightReady(m.roster[1],m.cycle); const x=simulateFight(a,b,3);
      if(String(x.method).indexOf('Décision')===0){ n++; vus.add(mgmtDecisionSerree(x)); } }
    return {n,vus:[...vus].sort()};`);
  assert.ok(r.n>0,'au moins une décision en 60 combats');
  assert.ok(r.vus.every(v=>[0.4,0.7,1].includes(v)));
});

/* D4 : ce qui fait réclamer un combat. */
const DEUX=`const m=G.mgmt; m.cycle=20; m.roster.forEach(f=>{ f.lastCycle=20; }); const div=m.roster.find(g=>mgmtAvailable(m,g)).div;
  const [x,y,z]=m.roster.filter(f=>f.div===div&&mgmtAvailable(m,f)).slice(0,3);
  const trace=(f,W,L)=>({id:f.id,W,L,D:0,age:25,lastCycle:null});
  const ajoute=(slot,gagnant,perdant,family,round,c)=>m.hist.push({c:c===undefined?m.cycle-1:c,slot,seed:1,rounds:3,a:trace(gagnant,3,3),b:trace(perdant,8,1),winner:'A',family,round});`;

test('10 / D4 — Une humiliation en préliminaire ne fait plus réclamer de revanche ; la même en carte principale, si', () => {
  const win=neuve();
  const r=res(win,`${DEUX} m.hist=[]; ajoute('prelim',x,y,'ko',1);
    const prelim=mgmtRivalites(m).length; m.hist=[]; ajoute('main',x,y,'ko',1); const main=mgmtRivalites(m);
    return {prelim,main:main.length,raison:mgmtPublicReclame(m).find(q=>q.a===y.id||q.b===y.id).raison};`);
  assert.equal(r.prelim,0); assert.equal(r.main,1); assert.equal(r.raison,'rivalite');
});

test('10 / D4 — Le vainqueur d’un combat principal fini avant la limite appelle le champion ou le premier de sa catégorie, au micro', () => {
  const win=neuve();
  const r=res(win,`${DEUX} m.hist=[]; ajoute('main',x,y,'ko',3);
    const l=mgmtReclamesRaisons(m).filter(q=>q.raison==='micro');
    const ok=l.length===1&&l[0].a===x.id&&l[0].b!==x.id&&l[0].b!==y.id;
    m.hist=[]; ajoute('main',x,y,'dec',3); const decision=mgmtReclamesRaisons(m).filter(q=>q.raison==='micro').length;
    m.hist=[]; ajoute('main',x,y,'ko',3,m.cycle-6); const vieux=mgmtReclamesRaisons(m).filter(q=>q.raison==='micro').length;
    return {ok,decision,vieux,texte:l[0]&&l[0].texte};`);
  assert.equal(r.ok,true); assert.equal(r.decision,0,'une décision ne fait pas appeler au micro'); assert.equal(r.vieux,0,'un appel s’éteint');
  assert.match(r.texte,/Appel au micro/);
});

test('10 / D4 — Deux têtes de classement qui ne se sont jamais rencontrées se chambrent sur les réseaux, un cycle sur deux ; jamais une paire déjà rencontrée', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.hist=[]; const pairs=[]; let impairs=0;
    for(let c=2;c<=40;c++){ m.cycle=c; m.roster.forEach(f=>{ f.lastCycle=c; }); const l=mgmtReclamesRaisons(m).filter(q=>q.raison==='reseaux'); if(c%2) impairs+=l.length; else pairs.push(l.length); }
    m.roster.forEach(f=>{ f.lastCycle=40; }); const l=mgmtReclamesRaisons(Object.assign(m,{cycle:40})).filter(q=>q.raison==='reseaux');
    const a=l[0]; m.hist.push({c:39,slot:'main',seed:1,rounds:3,a:{id:a.a,W:1,L:0,D:0,age:25,lastCycle:null},b:{id:a.b,W:1,L:0,D:0,age:25,lastCycle:null},winner:'A',family:'dec',round:3});
    const apres=mgmtReclamesRaisons(m).filter(q=>q.raison==='reseaux'&&[q.a,q.b].sort().join()===[a.a,a.b].sort().join()).length;
    return {impairs,pairesTotal:pairs.reduce((s,v)=>s+v,0),apres};`);
  assert.equal(r.impairs,0); assert.ok(r.pairesTotal>=15,'presque chaque cycle pair en donne une'); assert.equal(r.apres,0);
});

test('10 / D4 — Le booking dit pourquoi le combat est réclamé', () => {
  const win=neuve();
  const r=res(win,`${DEUX} m.hist=[]; ajoute('main',x,y,'ko',1); CL.go('mgmt_carte');
    const q=mgmtPublicReclame(m).find(v=>v.a===y.id); return {raison:q.raison,texte:q.texte};`);
  assert.equal(r.raison,'rivalite'); assert.match(r.texte,/Revanche après une humiliation/);
});
