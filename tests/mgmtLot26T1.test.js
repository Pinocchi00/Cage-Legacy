"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT26_T1] — Monde lot 26 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 26 T1 — formulation des cinq demandes, avec et sans cible',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify(['carte-principale','un-classe','revanche','trilogie','pause'].map(k=>[mgmtDemandeTexte(k),mgmtDemandeTexte(k,'Nora')]))`));
  assert.deepEqual(r,[['veut la carte principale','veut la carte principale'],['veut affronter un classé','veut affronter un classé: Nora'],['veut sa revanche','veut sa revanche contre Nora'],['veut le troisième combat','veut le troisième combat contre Nora'],['veut une pause','veut une pause']]);
});
test('Monde lot 26 T1 — les textes de contrariété sont clarifiés dans les deux écrans',()=>{
  for(const f of ['mgmt-carte-cadre.js','mgmt-suivi-cadre.js']) assert.ok(!fs.readFileSync(f,'utf8').includes('les opposer les contrarie'));
});
test('Monde lot 26 T1 — un camp de huit membres annonce les six affichés et les autres',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(function(){const m=G.mgmt,d=allDivisions()[0],membres=Array.from({length:8},(_,i)=>({id:'f'+i,first:'A',last:'B',name:'A B',div:d.id,rank:99}));const g={membres,cle:'test',coach:'Coach Test',nom:'Camp',ville:'Ville',specialite:{libelle:'Lutte'}};return mgmtSuCampGrand(m,g)})()`);
  assert.match(r,/LES 6 PREMIERS SUR 8/); assert.match(r,/\+ 2 autres : voir l’effectif/);
});
