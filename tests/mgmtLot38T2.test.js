"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){return JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`));}
test('Monde lot 38 T2 — écran d’arrivée en deux étapes et six propositions',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);MGMT_ARRIVEE.etape=1;const a=SCREENS.mgmt_arrivee();MGMT_ARRIVEE.etape=2;const b=SCREENS.mgmt_arrivee();return {a,b,n:mgmtEspoirsProposer(G.mgmt).length};`);
  assert.match(r.a,/CE QUI MANQUE/);assert.match(r.a,/objectif/i);assert.equal(r.n,6);assert.match(r.b,/TES TROIS ESPOIRS/);
});
test('Monde lot 38 T2 — texte joueur échappé dans les cartes',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt;mgmtEspoirsFixer(m);for(const f of mgmtEspoirsCandidats(m))f.name='<img onerror=alert(1)>';MGMT_ARRIVEE.etape=2;return SCREENS.mgmt_arrivee();`);
  assert.doesNotMatch(r,/<img onerror=/);assert.match(r,/&lt;img/);
});
