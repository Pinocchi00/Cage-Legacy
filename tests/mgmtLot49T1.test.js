"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT49_T1] — Monde lot 49 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 49 T1 — sélection pure et déterministe de quatre temps forts même sans relevé',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m={vues:{}};const c={rounds:5};const before=JSON.stringify(m);const a=mgmtTempsFortsChoisir(m,c);const b=mgmtTempsFortsChoisir(m,c);return {a,b,before,after:JSON.stringify(m)}})())`));
  assert.deepEqual(r.a,r.b); assert.equal(r.before,r.after); assert.ok(r.a.length>=4&&r.a.length<=8);
  assert.deepEqual(r.a.map(x=>x.t),r.a.map(x=>x.t).slice().sort((a,b)=>a-b));
  assert.ok(r.a.slice(1).every((x,i)=>x.t-r.a[i].t>=8));
});

test('Monde lot 49 T1 — choix global de la vue et priorité au réglage de combat',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m={lastEvent:{fights:[{}]}};MGMT_REGLAGES.soiree.vue='defaut';const d=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='entier';const g=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='resultat';const z=mgmtVueDuCombat(m,0);MGMT_REGLAGES.soiree.vue='defaut';m.vues={0:'forts'};return {d,g,z,p:mgmtVueDuCombat(m,0)}})())`));
  assert.equal(r.d,'forts'); assert.equal(r.g,'complet'); assert.equal(r.z,'resultat'); assert.equal(r.p,'forts');
});

test('Monde lot 49 T1 — validation et réparation facultatives des vues de soirée',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m={};const absent=mgmtRepair(m);const valide={vues:{0:'complet',11:'resultat'}};const invalide={vues:{0:'inconnu',12:'forts'}};mgmtRepair(invalide);return {absent:Object.hasOwn(m,'vues'),valide:validateMgmt(valide),repare:invalide.vues,ancien:validateMgmt({})}})())`));
  assert.equal(r.absent,false); assert.equal(r.valide,false); assert.equal(r.repare,undefined); assert.equal(r.ancien,false);
});

test('Monde lot 49 T1 — les commandes de vue sont présentes dans le bandeau de soirée',()=>{
  const fs=require('node:fs');
  const source=fs.readFileSync(require.resolve('../mgmt-soiree-cadre.js'),'utf8');
  assert.match(source,/mf-so-views/); assert.match(source,/COMPLET/); assert.match(source,/TEMPS FORTS/); assert.match(source,/RÉSULTAT/);
});

test('Monde lot 49 T1 — le lecteur accélère entre les fenêtres de temps forts',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const C=MGMT_COMBAT;C.session={dureeAffichage:200};C.pause=false;C.mode='fight';C.d=0;C.fin=0;C.tempsForts=[{t:0},{t:300},{t:600}];C.tempsFortActif=-1;mgmtCombatAvancer(0.1);const debut={d:C.d,v:C.vitesse,i:C.tempsFortActif};C.d=4;mgmtCombatAvancer(0.01);return {debut,saut:C.d,index:C.tempsFortActif,v:C.vitesse}})())`));
  assert.equal(r.debut.v,1);
  assert.ok(r.saut>35,'l’intervalle entre les moments est sauté sur la trace');
  assert.equal(r.index,1);
  assert.equal(r.v,1);
});
