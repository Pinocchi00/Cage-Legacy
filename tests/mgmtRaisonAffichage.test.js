"use strict";
/* ==== [ANCRE: MONDE_LOT6_T4_TEST_AFFICHAGE] — Monde lot 6 T4 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});

test('Monde lot 6 T4 — mgmtRaisonLignes rend deux lignes depuis la preuve sans relecture',()=>{
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault(),f={famille:'longue-attente',fait:{source:'attente',cycles:8,mois:7,a:'<img>'}};mgmtRaisonsPourPaire=()=>{throw Error('relecture interdite')};return JSON.stringify(mgmtRaisonLignes(m,f));})()`));
  assert.match(r.l1,/7 mois/);
  assert.match(r.l1,/Un combattant/);
  assert.equal(win.eval("MGMT_RAISON_PHRASES['longue-attente'].relu"),false);
  assert.match(r.l2,/remettre en activité/);
});

test('Monde lot 6 T4 — origine joueur et preuve absente ne produisent aucune ligne',()=>{
  assert.equal(win.eval(`mgmtRaisonLignes({},null)`),null);
  assert.equal(win.eval(`mgmtRaisonLignes({}, {origine:'joueur',famille:'debuts',fait:{}})`),null);
});

test('Monde lot 6 T4 — les préliminaires omettent une raison nulle sans exception',()=>{
  assert.doesNotThrow(()=>win.eval(`(()=>{const m=mgmtDefault();G.mgmt=m;G.screen='mgmt_prelims';return scr_mgmt_prelims();})()`));
  const html=win.eval(`(()=>{const m=mgmtDefault();G.mgmt=m;G.screen='mgmt_prelims';return scr_mgmt_prelims();})()`);
  assert.doesNotMatch(html,/mf-pre-pourquoi/);
});
