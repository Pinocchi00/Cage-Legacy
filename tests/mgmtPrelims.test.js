"use strict";
/* Monde lot 14 T2 (décision d'Anthony du 17/10/2026) retire la validation en bloc : Leïla pose les préliminaires directement. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

function carteComplete(win){
  win.eval(`setSeed(7); CL.mgmtEnter(1); (()=>{ const m=G.mgmt; for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
    for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; } })()`);
}

test('Monde lot 14 T2 — la soirée neuve pose ses préliminaires directement, sans affaire à valider', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_prelims');`);
  assert.equal(win.eval('G.screen'),'mgmt_prelims');
  assert.equal(win.eval('G.mgmt.card.prelims.length'),win.eval('G.mgmt.card.sizePrelims'));
  assert.equal(win.eval(`G.mgmt.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')`),false);
  assert.ok(win.document.getElementById('app').textContent.includes('Posé'));
  assert.ok(!win.document.getElementById('app').textContent.includes('Valider la carte'));
  assert.equal(win.eval(`document.querySelector('.mf-barre-item.cur').dataset.section`),'preliminaires');
});

test('Monde lot 14 T2 — la composition principale conserve les préliminaires déjà posés', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1);`);
  const avant=JSON.parse(win.eval('JSON.stringify(G.mgmt.card.prelims)'));
  carteComplete(win);
  assert.equal(win.eval('G.mgmt.card.main.length'),win.eval('G.mgmt.card.sizeMain'));
  assert.deepEqual(JSON.parse(win.eval('JSON.stringify(G.mgmt.card.prelims)')),avant);
  const ids=win.eval(`(()=>{const all=[...G.mgmt.card.main,...G.mgmt.card.prelims].flatMap(f=>[f.a,f.b]);return all.length===new Set(all).size})()`);
  assert.equal(ids,true,'aucun combattant en double sur la soirée');
  win.eval('CL.go(\'mgmt_prelims\')');
  assert.ok(!win.document.getElementById('app').textContent.includes('Valider la carte'));
});

test('Préliminaires — C change le combat choisi sans toucher aux autres', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_prelims');`);
  const avant=JSON.parse(win.eval('JSON.stringify(G.mgmt.card.prelims)'));
  touche(win,'c');
  const apres=JSON.parse(win.eval('JSON.stringify(G.mgmt.card.prelims)'));
  const samePair=(a,b)=>[a.a,a.b].sort().join('|')===[b.a,b.b].sort().join('|');
  assert.ok(!samePair(avant[0],apres[0]),'C doit changer réellement le combat posé');
  assert.deepEqual(apres.slice(1),avant.slice(1),'C ne touche pas aux autres combats');
  const before=apres[0];
  win.eval('mgmtPrelimChanger(G.mgmt,0)');
  const after=JSON.parse(win.eval('JSON.stringify(G.mgmt.card.prelims[0])'));
  assert.notDeepEqual(after,before,'C doit changer réellement le combat posé');
});
