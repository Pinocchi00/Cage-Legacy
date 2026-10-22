"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const creer=()=>newGameWindow({runMain:true});

test('Monde lot 31 T6a — les huit classements retournent trois entrées au plus',()=>{
  const w=creer(),r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:6});return mgmtMeilleurs(m,{divId:m.roster[0].div,portee:'split'});})()`);
  assert.equal(r.length,8);assert.deepEqual(Array.from(r,x=>x.id),['finitions','volume','precis','defense','lutteur','mur','cou','serie']);assert.ok(r.every(x=>x.rang.length<=3));
});
test('Monde lot 31 T6a — la portée monde ne lève pas d’exception',()=>{const w=creer();assert.doesNotThrow(()=>w.eval(`mgmtMeilleurs(mgmtPasseGenerer('split',{soirees:6}),{divId:'H-light',portee:'monde'})`));});
test('Monde lot 31 T6a — les records ignorent décisions et combats invalides',()=>{const w=creer();const r=w.eval(`(()=>{const m={hist:[],roster:[],facts:[]};return mgmtRecords(m);})()`);assert.deepEqual(JSON.parse(JSON.stringify(r)),{unCombat:[],carriere:[],battu:null});});
test('Monde lot 31 T6a — valeurs exactes sur un combat fabriqué',()=>{const w=creer();const r=w.eval(`(()=>{const coin=(sigAtt,td,ctrlSec,body,kd)=>{const a=Array(17).fill(0);a[1]=sigAtt;a[5]=body;a[10]=td;a[14]=kd;a[15]=ctrlSec;return a;};const m={roster:[{id:'a',nom:'Ada',W:1,L:0,D:0},{id:'b',nom:'Béa',W:0,L:1,D:0}],facts:[],hist:[{c:1,round:1,rounds:3,winner:'A',family:'ko',a:{id:'a'},b:{id:'b'},s:{d:60,c:[coin(20,4,180,7,2),coin(12,3,120,5,1)]}}]};return mgmtRecords(m);})()`);const rows=JSON.parse(JSON.stringify(r.unCombat));assert.deepEqual(rows.map(x=>[x.id,x.valeur,x.combattant.id]),[['sigAtt',20,'a'],['koRapide',60,'a'],['amenees',4,'a'],['knockdowns',3,'a'],['controle3',180,'a'],['corps',7,'a']]);assert.deepEqual(rows.find(x=>x.id==='sigAtt').avant,null);});
test('Monde lot 31 T6a — battu est nul sans historique',()=>{const w=creer();assert.equal(w.eval(`mgmtRecords({hist:[],roster:[],facts:[]}).battu`),null);});
test('Monde lot 31 T6a — calcul pur et second appel mémoïsé',()=>{const w=creer();const r=w.eval(`(()=>{const m={hist:[],roster:[],facts:[]},before=JSON.stringify(m);mgmtRecords(m);const t=Date.now();mgmtRecords(m);return {same:before===JSON.stringify(m),ms:Date.now()-t};})()`);assert.equal(r.same,true);assert.ok(r.ms<20);});
test('Monde lot 31 T6a — une partie sans relevé rend des listes vides',()=>{const w=creer();const r=w.eval(`(()=>{const m={hist:[{}],roster:[],facts:[]};return {best:mgmtMeilleurs(m,{divId:'H-light',portee:'split'}),records:mgmtRecords(m)};})()`);assert.deepEqual(Array.from(r.best),[]);assert.deepEqual(Array.from(r.records.unCombat),[]);});
test('Monde lot 31 T6a — la partie de six soirées renseigne les détenteurs',()=>{const w=creer();const r=w.eval(`(()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:6}),t=Date.now(),v=mgmtRecords(m),ms=Date.now()-t;return {n:v.unCombat.length,owners:v.unCombat.every(x=>x.combattant&&x.combattant.id),ms};})()`);assert.equal(r.n,6);assert.equal(r.owners,true);assert.ok(r.ms<300);console.log('Mesure mgmtRecords (6 soirées):',r.ms,'ms');});
