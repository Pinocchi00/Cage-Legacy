"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT61_T1] — Monde lot 61 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 61 T1 — changer d’organisation échange les parties et conserve chaque combattant',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);const cible=Object.keys(m.orgs)[0],avant=[...m.roster,...Object.values(m.orgs).flatMap(o=>o.roster)].map(f=>f.id).sort();const ok=mgmtOrgChanger(m,cible,{salaire:1234});const apres=[...m.roster,...Object.values(m.orgs).flatMap(o=>o.roster)].map(f=>f.id).sort();return {ok,org:mgmtPredecesseurOrgId(m),valid:mgmtMondeVivantValide(m),same:JSON.stringify(avant)===JSON.stringify(apres),split:!!m.orgs.split,conf:m.poste.conf}})())`));
  assert.deepEqual(r,{ok:true,org:'garden-of-blood',valid:true,same:true,split:true,conf:2});
});

test('Monde lot 61 T1 — Split puis retour restaure le roster et le monde valide',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);const roster=m.roster.map(f=>f.id).sort(), cible=Object.keys(m.orgs)[0];const aller=mgmtOrgChanger(m,cible,{salaire:1234}),retour=mgmtOrgChanger(m,'split',{salaire:1234});return {aller,retour,split:mgmtPredecesseurOrgId(m)==='split',roster:JSON.stringify(roster)===JSON.stringify(m.roster.map(f=>f.id).sort()),valid:mgmtMondeVivantValide(m)}})())`));
  assert.deepEqual(r,{aller:true,retour:true,split:true,roster:true,valid:true});
});

test('Monde lot 61 T1 — le changement sauvegardé se recharge à l’identique sans tirage RNG',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);const cible=Object.keys(m.orgs)[0];mgmtOrgChanger(m,cible,{salaire:1234});const avant=mgmtSerialiser(m),copie=JSON.parse(avant);return {identique:mgmtSerialiser(copie)===avant,org:mgmtPredecesseurOrgId(copie),rng:!String(mgmtOrgChanger).includes('rnd('),sansOrphelins:mgmtMondeVivantValide(copie)}})())`));
  assert.deepEqual(r,{identique:true,org:'garden-of-blood',rng:true,sansOrphelins:true});
});
