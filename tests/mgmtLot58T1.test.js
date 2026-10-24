"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT58_T1] — Monde lot 58 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 58 T1 — offres facultatives, validées et réparées sans création sur ancienne partie',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});const absent=!Object.hasOwn(m,'offres');const base=validateMgmt(m);m.offres=[];const vide=validateMgmt(m);m.offres=[{orgId:'split',poste:'Matchmaker',salaire:3200,texte:'Proposition.',relu:false,refuse:false,raisons:['a','b','c','d']}];const valide=validateMgmt(m);const mauvais=JSON.parse(JSON.stringify(m));mauvais.offres[0].salaire=-1;const refuse=mgmtOffreRefuser(m,0);const refuseValide=validateMgmt(m);const rep=mgmtRepair(mauvais);return {absent,base,vide,valide,refuse,refuseValide,repare:!Object.hasOwn(rep,'offres')}})())`));
  assert.deepEqual(r,{absent:true,base:true,vide:true,valide:true,refuse:true,refuseValide:true,repare:true});
});

test('Monde lot 58 T1 — quatre raisons de rejoindre plus fort sont des informations concrètes',()=>{
  const w=newGameWindow({runMain:true});
  const n=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});if(!m.poste)mgmtPosteInit(m);const r=mgmtPosteRaisons(m,'split');const offers=mgmtOffresCreer(m);G.mgmt=m;return {r,offers,html:scr_mgmt_poste()}})())`));
  assert.equal(n.r.length,4);
  assert.equal(new Set(n.r).size,4);
  assert.match(n.r[0],/Scène/);
  assert.match(n.r[1],/Meilleurs du monde/);
  assert.match(n.r[2],/Agents libres/);
  assert.match(n.r[3],/Choc des organisations/);
  assert.ok(n.offers.length<=3);
  assert.ok(n.offers.every(o=>o.relu===false&&o.texte.includes('matchmaker')));
  assert.match(n.html,/LES OFFRES/);
});

test('Monde lot 58 T1 — le joueur peut attendre après le renvoi sans changer d’organisation',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=0;m.poste.obj.forEach(o=>o.e='cours');m.offres=[];mgmtOffresCreer(m);const org=m.org;const attendu=mgmtOffresAttendre(m);return {attendu,refusees:m.offres.every(o=>o.refuse),orgIdentique:m.org===org,poste:!!m.poste}})())`));
  assert.deepEqual(r,{attendu:true,refusees:true,orgIdentique:true,poste:true});
});
