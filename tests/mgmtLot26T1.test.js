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
  const carte=fs.readFileSync('mgmt-carte-cadre.js','utf8'),suivi=fs.readFileSync('mgmt-suivi-cadre.js','utf8');
  for(const source of [carte,suivi]) assert.ok(!source.includes('les opposer les contrarie'));
  for(const texte of ['Même camp : s’ils se battent, ils le prennent mal.','Frère et sœur : s’ils se battent, ils le prennent mal.']) assert.ok(carte.includes(texte),`mgmt-carte-cadre.js manque : ${texte}`);
  assert.ok(suivi.includes('S’ils se battent, ils le prennent mal.'),'mgmt-suivi-cadre.js manque la formulation générique');
});
test('Monde lot 26 T1 — un camp de huit membres annonce les six affichés et les autres',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(function(){const m=G.mgmt,d=allDivisions()[0],membres=Array.from({length:8},(_,i)=>({id:'f'+i,first:'A',last:'B',name:'A B',div:d.id,rank:99}));const g={membres,cle:'test',coach:'Coach Test',nom:'Camp',ville:'Ville',specialite:{libelle:'Lutte'}};return mgmtSuCampGrand(m,g)})()`);
  assert.match(r,/LES 6 PREMIERS SUR 8/); assert.match(r,/\+ 2 autres : voir l’effectif/);
  assert.equal((r.match(/class="mf-su-ca-m"/g)||[]).length,7);
  const normal=w.eval(`(function(){const m=G.mgmt,d=allDivisions()[0],membres=Array.from({length:6},(_,i)=>({id:'n'+i,first:'A',last:'B',name:'A B',div:d.id,rank:99}));const g={membres,cle:'test',coach:'Coach Test',nom:'Camp',ville:'Ville',specialite:{libelle:'Lutte'}};return mgmtSuCampGrand(m,g)})()`);
  assert.match(normal,/SES 6 COMBATTANTS CHEZ TOI/);
});
