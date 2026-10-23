"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT43_T1] — Monde lot 43 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 43 T1 — un poste neuf porte son contrat et ses objectifs non acquis',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);return {p:m.poste,n:m.poste.obj.length,manque:mgmtManque(m).objectif,types:MGMT_POSTE.types,values:m.poste.obj.map(o=>mgmtPosteValeur(m,o)),days:MGMT_POSTE.duree,salary:m.poste.salaire,mi:MGMT_POSTE.mi}})()`);
  assert.ok(r.p);assert.ok(r.n>=3&&r.n<=5);assert.equal(r.p.obj[0].t,'manque');assert.deepEqual(r.p.obj[0].cible,1);assert.ok(r.types.includes(r.p.obj[0].t));
  assert.equal(r.days,365);assert.equal(r.salary,3200);assert.equal(r.mi,183);
  assert.ok(r.p.obj.every((o,i)=>!(o.t==='manque'&&r.manque&&r.manque.acquis)||r.values[i]===0));
});

test('Monde lot 43 T1 — ancienne partie facultative et validation/réparation stricte',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const old=mgmtDefault('Split');const stayed=!Object.hasOwn(old,'poste');const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);const p=m.poste;return {valid:mgmtPosteValide(p),bad:mgmtPosteValide({...p,conf:9}),phrases:MGMT_POSTE.seuils.phrases.flatMap(x=>[x.niveau,x.mi,...x.banque.map(y=>y.texte)]),old:stayed}})()`);
  assert.equal(r.valid,true);assert.equal(r.bad,false);assert.equal(r.old,true);
  for(const phrase of r.phrases) assert.doesNotMatch(phrase,/[0-9]/);
});

test('Monde lot 43 T1 — confiance bornée, mi-saison et bilan sans effet de bord',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);m.poste.conf=2;m.treasury=-1;const before=m.poste.conf;mgmtPosteSoiree(m);const delta=Math.abs(m.poste.conf-before);m.poste.debut=-183;mgmtPosteSoiree(m);const mi=m.poste.mi;const b=mgmtPosteBilan(m);return {delta,mi,b,valid:mgmtPosteValide(m.poste),rand:mgmtPosteSoiree.toString().includes('rnd(')}})()`);
  assert.ok(r.delta<=1);assert.equal(r.mi,true);assert.equal(r.valid,true);assert.equal(r.rand,false);assert.ok(['prolonge-augmente','prolonge-condition','renvoi'].includes(r.b.issue));
});

test('Monde lot 43 T1 — mêmes données et même graine donnent le même calcul',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);const a=JSON.stringify(MGMT_POSTE);const x=mgmtPosteInit(m);const one=JSON.stringify(x);const y=mgmtPosteInit(m);return {same:a===JSON.stringify(MGMT_POSTE),det:one===JSON.stringify(y)}})()`);
  assert.equal(r.same,true);assert.equal(r.det,true);
});

test('Monde lot 43 T1 — évolution déterministe et bornée sur soixante soirées',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);let prev=m.poste.conf, max=0;for(let i=1;i<=60;i++){m.eventsPlayed=i;m.treasury=i%2?-100:100;m.audiences=[i%3?MGMT_MAIN_SIZE:0];mgmtPosteSoiree(m);max=Math.max(max,Math.abs(m.poste.conf-prev));prev=m.poste.conf;}return {max,n:m.poste.hist.length,conf:m.poste.conf,valid:mgmtPosteValide(m.poste)}})()`);
  assert.equal(r.max,1);assert.equal(r.n,12);assert.ok(r.conf>=0&&r.conf<=4);assert.equal(r.valid,true);
});

test('Monde lot 43 T1 — confiance réagit à la caisse et à une série de salles pleines',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);m.poste.conf=3;m.poste.obj=[];while(m.poste.obj.length<3)m.poste.obj.push({t:'salle',cible:0,e:'cours',v:0});m.treasury=-100;m.audiences=[0];mgmtPosteSoiree(m);const afterBad=m.poste.conf;m.treasury=1000;for(let i=0;i<4;i++){m.audiences=[MGMT_MAIN_SIZE];mgmtPosteSoiree(m);}return {afterBad,afterFull:m.poste.conf}})()`);
  assert.ok(r.afterBad<3);assert.ok(r.afterFull>r.afterBad);
});

test('Monde lot 43 T1 — bilan retourne chacune des trois issues selon les seuils documentés',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);m.poste.obj=[{t:'salle',cible:1,e:'tenu',v:1},{t:'salle',cible:1,e:'tenu',v:1},{t:'salle',cible:1,e:'tenu',v:1},{t:'salle',cible:1,e:'cours',v:0}];m.poste.conf=4;const a=mgmtPosteBilan(m).issue;m.poste.obj[2].e='cours';m.poste.conf=2;const b=mgmtPosteBilan(m).issue;m.poste.obj.forEach(o=>o.e='cours');m.poste.conf=0;const c=mgmtPosteBilan(m).issue;return [a,b,c]})()`);
  assert.deepEqual(Array.from(r),['prolonge-augmente','prolonge-condition','renvoi']);
});

test('Monde lot 43 T1 — sauvegarde facultative répare seulement un poste malformé',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const old=mgmtDefault('Split');const untouched=mgmtRepair(old);const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);const malformed={...m,poste:{conf:99}};mgmtRepair(malformed);return {stillAbsent:!Object.hasOwn(untouched,'poste'),deleted:!Object.hasOwn(malformed,'poste'),good:validateMgmt(m),bad:validateMgmt({...m,poste:{conf:99}})}})()`);
  assert.equal(r.stillAbsent,true);assert.equal(r.deleted,true);assert.equal(r.good,true);assert.equal(r.bad,false);
});

test('Monde lot 43 T1 — anciennes parties restent sans poste après une clôture',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPasseCloturer(m);return {absent:!Object.hasOwn(m,'poste')}})()`);
  assert.equal(r.absent,true);
});
