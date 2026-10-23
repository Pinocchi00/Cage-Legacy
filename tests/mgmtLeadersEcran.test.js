"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('T6b — huit cartes Meilleurs dans l’ordre, valeurs et fiche du premier',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements');CL.mgmtSuClVue('meilleurs')`);
  assert.equal(w.document.querySelectorAll('.mf-me-carte').length,8);
  const labels=JSON.parse(w.eval('JSON.stringify(MGMT_MEILLEURS_LABELS.categories.map(x=>x[1]))'));
  assert.deepEqual([...w.document.querySelectorAll('.mf-me-carte h3')].map(x=>x.textContent),labels);
  const row=JSON.parse(w.eval(`JSON.stringify(mgmtMeilleurs(G.mgmt,{divId:mgmtSuDiv(MGMT_SU_CL),portee:'monde'})[0].rang[0])`));
  assert.equal(w.document.querySelector('.mf-me-nom').textContent,row.nom.toLocaleUpperCase('fr'));
  assert.ok(w.document.querySelector('.mf-me-nom').getAttribute('onclick').includes(row.id));
});
test('T6b — la portée mondiale et la portée Split pilotent le calcul',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements');CL.mgmtSuClVue('meilleurs')`);
  w.eval("CL.mgmtSuClPortee()");
  assert.ok(w.document.querySelector('.mf-me-carte'));
  assert.ok(w.eval(`mgmtMeilleurs(G.mgmt,{divId:MGMT_SU_CL.div,portee:MGMT_SU_CL.portee==='world'?'monde':'split'})`));
});
test('T6b — Records rend les détenteurs dans l’ordre, sans primes',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements');CL.mgmtSuClVue('records')`);
  assert.ok(w.document.querySelector('.mf-re'));
  assert.ok(!w.document.getElementById('app').textContent.includes('Primes de la soirée'));
  assert.deepEqual([...w.document.querySelectorAll('.mf-re-groupe h2')].map(x=>x.textContent),['EN UN COMBAT','EN CARRIÈRE']);
});
test('T6b — un record battu seul porte NOUVEAU et le record antérieur',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements');CL.mgmtSuClVue('records')`);
  const r=JSON.parse(w.eval('JSON.stringify(mgmtRecords(G.mgmt).battu)'));
  assert.equal(w.document.querySelectorAll('.mf-re-nouveau').length,r?1:0);
  if(r)assert.ok([...w.document.querySelectorAll('.mf-re-ligne')].some(x=>x.textContent.includes('avant :')));
});
test('T6b — Meilleurs et Records tolèrent une partie sans relevé',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtEntrerAvantH4();CL.go('mgmt_classements');CL.mgmtSuClVue('meilleurs')`);
  assert.doesNotThrow(()=>w.eval(`scr_mgmt_meilleurs_cadre();CL.mgmtSuClVue('records')`));
});
test('T6b — les noms de combattants sont échappés',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements');CL.mgmtSuClVue('meilleurs')`);
  const id=w.eval('mgmtMeilleurs(G.mgmt,{divId:mgmtSuDiv(MGMT_SU_CL),portee:"monde"})[0].rang[0].id');
  w.eval(`mgmtLeadersFighter(G.mgmt,${JSON.stringify(id)}).nom='<img onerror=x>'`);
  w.eval('render()');assert.equal(w.document.querySelector('.mf-me-carte img'),null);
});
test('T6b — rendu rapide sur six soirées',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy'`);
  const ms=w.eval(`(()=>{let t=performance.now();mgmtMeilleursRendu(G.mgmt);mgmtRecordsRendu(G.mgmt);return performance.now()-t})()`);
  assert.ok(ms<300,`${ms} ms`);
});
test('T6b — l’écran par défaut reste la liste des classements',()=>{
  const w=newGameWindow({runMain:true});w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});MGMT_SU_CL.div='H-heavy';mgmtAgendaActif=()=>true;CL.go('mgmt_classements')`);
  assert.equal(w.eval('MGMT_SU_CL.vue'),'liste');assert.ok(w.document.querySelector('.mf-su'));
});
