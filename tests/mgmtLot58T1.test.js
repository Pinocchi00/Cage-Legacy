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
  const n=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});return mgmtPosteRaisons(m,'split').length})()`);
  assert.equal(n,4);
});
