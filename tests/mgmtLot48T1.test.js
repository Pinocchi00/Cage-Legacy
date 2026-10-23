"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT48_T1] — Monde lot 48 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 48 T1 — écran poste inscrit, liens additifs et onglets',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const org=scr_mgmt_organisation(),acc=scr_mgmt_accueil();const p=scr_mgmt_poste();mgmtPosteOngletAjouter('essai','ESSAI',()=>'<p>onglet</p>');const tabs=scr_mgmt_poste();const old=mgmtPosteOngletActif;mgmtPosteOngletActif=1;const switched=scr_mgmt_poste();return {org,acc,p,tabs,switched,old}})()`);
  assert.match(r.org,/Les finances/);assert.match(r.org,/Revoir ce qui manque/);assert.match(r.org,/Ton poste/);
  assert.match(r.acc,/Ton poste/);assert.match(r.p,/TON POSTE/);assert.match(r.tabs,/ESSAI/);assert.match(r.switched,/onglet/);
});

test('Monde lot 48 T1 — contrat accessible, données échappées et sans jauge chiffrée',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);return scr_mgmt_poste()})()`);
  assert.match(r,/3.{0,2}200.{0,2}€ \/ MOIS/);assert.match(r,/CE QU’EN PENSE LE PATRON/);assert.match(r,/TES OBJECTIFS/);assert.doesNotMatch(r,/confidence|\d+\/\d+/);
});

test('Monde lot 48 T1 — bilan expose les trois issues sans bloquer la partie',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const p=m.poste;p.fin=mgmtCalAujourdhui(m);p.conf=4;p.obj.forEach((o,i)=>o.e=i<3?'tenu':'cours');const a=mgmtPosteBilan(m).issue;p.conf=2;p.obj.forEach((o,i)=>o.e=i<2?'tenu':'cours');const b=mgmtPosteBilan(m).issue;p.conf=0;p.obj.forEach(o=>o.e='cours');const c=mgmtPosteBilan(m).issue;return {a,b,c,screen:scr_mgmt_poste_bilan(),carte:typeof scr_mgmt_carte==='function'}})()`);
  assert.deepEqual([r.a,r.b,r.c],['prolonge-augmente','prolonge-condition','renvoi']);assert.match(r.screen,/CONTINUER/);assert.equal(r.carte,true);
});
