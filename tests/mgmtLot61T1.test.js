"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT61_T1] — Monde lot 61 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 61 T1 — changer d’organisation échange les parties et conserve chaque combattant',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);const cible=Object.keys(m.orgs)[0],avant=[...m.roster,...Object.values(m.orgs).flatMap(o=>o.roster)].map(f=>f.id).sort();const ok=mgmtOrgChanger(m,cible,{salaire:1234});const apres=[...m.roster,...Object.values(m.orgs).flatMap(o=>o.roster)].map(f=>f.id).sort();return {ok,org:mgmtPredecesseurOrgId(m),valid:mgmtMondeVivantValide(m),same:JSON.stringify(avant)===JSON.stringify(apres),split:!!m.orgs.split,conf:m.poste.conf}})())`));
  assert.deepEqual(r,{ok:true,org:'garden-of-blood',valid:true,same:true,split:true,conf:2});
});
