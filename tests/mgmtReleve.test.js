"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('Monde lot 31 T1 — forme, arrondis et coin du relevé',()=>{
  const w=newGameWindow({runMain:true});
  const result=JSON.parse(w.eval(`JSON.stringify((()=>{const res={round:1,finishTime:42,roundStats:[{sigA:2.4,ctrlSecA:3.6,pwrB:4}],stats:{A:{headAtt:2,distStrikes:3},B:{}}};const s=mgmtReleveDeResultat(res,3);return {s,valid:mgmtReleveValide(s),a:mgmtReleveCoin(s,'A')};})())`));
  assert.equal(result.valid,true);assert.equal(result.s.d,42);assert.equal(result.s.r.length,1);assert.equal(result.s.r[0][0],2);assert.equal(result.s.r[0][11],4);assert.equal(result.s.r[0][27],4);assert.equal(result.a.headAtt,2);assert.equal(result.a.sig,2);
  const bad=JSON.parse(JSON.stringify(result.s));bad.r[0].pop();assert.equal(w.eval(`mgmtReleveValide(${JSON.stringify(bad)})`),false);
});
