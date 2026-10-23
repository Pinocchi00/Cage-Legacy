"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT43_T1] — Monde lot 43 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 43 T1 — un poste neuf porte son contrat et ses objectifs non acquis',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtDefault('Split');mgmtNewRoster(m);mgmtPosteInit(m);return {p:m.poste,n:m.poste.obj.length,first:mgmtManque(m).id,types:MGMT_POSTE.types}})()`);
  assert.ok(r.p);assert.ok(r.n>=3&&r.n<=5);assert.equal(r.p.obj[0].t,'manque');assert.ok(r.types.includes(r.p.obj[0].t));
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
