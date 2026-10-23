"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT49_T1] — Monde lot 49 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 49 T1 — sélection pure et déterministe de quatre temps forts même sans relevé',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m={vues:{}};const c={rounds:5};const before=JSON.stringify(m);const a=mgmtTempsFortsChoisir(m,c);const b=mgmtTempsFortsChoisir(m,c);return {a,b,before,after:JSON.stringify(m)}})())`));
  assert.deepEqual(r.a,r.b); assert.equal(r.before,r.after); assert.ok(r.a.length>=4&&r.a.length<=8);
  assert.deepEqual(r.a.map(x=>x.t),r.a.map(x=>x.t).slice().sort((a,b)=>a-b));
  assert.ok(r.a.slice(1).every((x,i)=>x.t-r.a[i].t>=8));
});

test('Monde lot 49 T1 — choix global de la vue et priorité au réglage de combat',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m={lastEvent:{fights:[{}]}};MGMT_REGLAGES.soiree.vue='defaut';const d=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='entier';const g=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='resultat';const z=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='defaut';m.vues={0:'forts'};return {d,g,z,p:mgmtVueDuCombat(m,0)}})())`));
  assert.equal(r.d,'forts'); assert.equal(r.g,'complet'); assert.equal(r.z,'resultat'); assert.equal(r.p,'forts');
});
