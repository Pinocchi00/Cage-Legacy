"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

function game(){const w=newGameWindow({runMain:true});w.eval('setSeed(20261008); CL.mgmtEnter(1)');return w;}

test('Réserves — validation, réparation malformée et sauvegarde ancienne sans clé',()=>{
  const w=game();const result=w.eval(`(()=>{const m=G.mgmt;delete m.reserves;const absent=validateMgmt(m);mgmtRepair(m);const old=m.reserves.length===0;m.reserves=['ok',3,'x'.repeat(81),'ok'];mgmtRepair(m);return {absent,old,repaired:m.reserves};})()`);
  assert.equal(result.absent,true);assert.equal(result.old,true);assert.deepEqual(Array.from(result.repaired),['ok']);
});

test('Réservation — réservation bloque les propositions, suivi seul ne bloque pas',()=>{
  const w=game();const r=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0];mgmtSuivre(m,f.id);const suiviLibre=!mgmtAgendaReserve(m,f);mgmtReserver(m,f.id);return {suiviLibre,reserve:mgmtAgendaReserve(m,f)};})()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)),{suiviLibre:true,reserve:true});
});

test('Suivi — un identifiant disparu est ignoré sans exception',()=>{
  const w=game();assert.doesNotThrow(()=>w.eval(`mgmtActualites({...G.mgmt,suivis:['disparu']})`));
});
