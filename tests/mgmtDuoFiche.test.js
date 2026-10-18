"use strict";
/* ==== [ANCRE: TESTS_DUO_T59_FICHE] — Monde lot 19 T59 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Duo T59 — mgmtDuoPartieDe trouve une partie contenant le combattant',()=>{
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(function(){const a={roster:[{id:'a'}]},b={roster:[{id:'b'}]},m={duo:{},roster:[{id:'j1'}],orgs:{b}};return ['j1','b','absent'].map(id=>mgmtDuoPartieDe(m,id));})()`);
  assert.equal(r[0].roster[0].id,'j1');
  assert.equal(r[1].roster[0].id,'b');
  assert.equal(r[2],null);
});

test('Duo T59 — la présentation ne modifie pas la valeur de vu',()=>{
  const win=newGameWindow({runMain:true});
  assert.equal(win.eval(`(function(){const m={duo:{soiree:{},cartes:[]}};MGMT_DUO_PRESENTATION={partie:m,index:0};MGMT_DUO_UI.vu=false;CL.mgmtDuoPresentationRetour();return MGMT_DUO_UI.vu;})()`),false);
});
