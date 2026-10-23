"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('P5 T1 — neuf destinations, coûts et chances de pépite',()=>{
  const w=newGameWindow();try{const r=JSON.parse(w.eval(`JSON.stringify(MGMT_RECRUTEUR.destinations.map(d=>[d.cout,d.pepites]))`));assert.equal(r.length,9);assert.deepEqual(r.map(x=>x[0]),[16000,18000,20000,24000,12000,14000,10000,22000,6000]);assert.ok(r.every(x=>x[1]>=20&&x[1]<=60));assert.equal(r[1][1],40);}finally{w.close();}
});
test('P5 T1 — une mission, coût et retour à échéance',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{let m=mgmtDefault();m.treasury=50000;m.cal={jour:10};let c={dest:'france',cat:'LW',style:'lutteur',sem:2};let a=mgmtRecruteurEnvoyer(m,c),b=mgmtRecruteurEnvoyer(m,c),debit=m.treasury;m.cal.jour=24;let retour=mgmtRecruteurRetour(m);return JSON.stringify({a,b,debit,retour:!!retour,profiles:retour?.profils.length})})()`);const x=JSON.parse(r);assert.equal(x.a,true);assert.equal(x.b,false);assert.equal(x.debit,44000);assert.equal(x.retour,true);assert.ok(x.profiles>=3&&x.profiles<=5);}finally{w.close();}
});
test('P5 T1 — partie ancienne sans recruteur conservée',()=>{
  const w=newGameWindow();try{assert.equal(w.eval(`(()=>{let m=mgmtDefault();return !Object.hasOwn(m,'recruteur')&&validateMgmt(m)})()`),true);}finally{w.close();}
});
