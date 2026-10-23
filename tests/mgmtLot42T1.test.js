"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('P5 T1 — neuf destinations, coûts et chances de pépite',()=>{
  const w=newGameWindow();try{const r=JSON.parse(w.eval(`JSON.stringify(MGMT_RECRUTEUR.destinations.map(d=>[d.cout,d.pepites]))`));assert.equal(r.length,9);assert.deepEqual(r.map(x=>x[0]),[16000,18000,20000,24000,12000,14000,10000,22000,6000]);assert.ok(r.every(x=>x[1]>=20&&x[1]<=60));assert.equal(r[1][1],40);}finally{w.close();}
});
test('P5 T1 — une mission, coût et retour à échéance',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{let m=mgmtDefault();m.treasury=50000;m.cal={jour:10};let c={dest:'france',cat:'H-light',style:'lutteur',sem:2};let a=mgmtRecruteurEnvoyer(m,c),b=mgmtRecruteurEnvoyer(m,c),debit=m.treasury;m.cal.jour=24;let retour=mgmtRecruteurRetour(m);return JSON.stringify({a,b,debit,retour:!!retour,profiles:retour?.profils.length})})()`);const x=JSON.parse(r);assert.equal(x.a,true);assert.equal(x.b,false);assert.equal(x.debit,44000);assert.equal(x.retour,true);assert.ok(x.profiles>=3&&x.profiles<=5);}finally{w.close();}
});
test('P5 T1 — partie ancienne sans recruteur conservée',()=>{
  const w=newGameWindow();try{assert.equal(w.eval(`(()=>{let m=mgmtDefault();return !Object.hasOwn(m,'recruteur')&&validateMgmt(m)})()`),true);}finally{w.close();}
});

test('P5 T1 — dix missions ne répètent aucun profil',()=>{
  const w=newGameWindow();try{assert.equal(w.eval(`(()=>{let m=mgmtDefault();m.treasury=1000000;m.graine='uniques';m.cal={jour:0};let ids=[];for(let i=0;i<10;i++){if(!mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'complet',sem:2}))return false;m.cal.jour+=14;ids.push(...mgmtRecruteurRetour(m).profils.map(p=>p.id));}return new Set(ids).size===ids.length})()`),true);}finally{w.close();}
});
test('P5 T1 — profils déterministes, styles régionaux, pépites et retours bredouilles',()=>{
  const w=newGameWindow();try{const ok=w.eval(`(()=>{const d=mgmtRecruteurDestination('kirghizistan');let styles=0,pepites=0,bredouille=0,profils=0;for(let i=1;i<=400;i++){let m=mgmtDefault();m.treasury=1e6;m.graine='stat-'+i;m.cal={jour:0};mgmtRecruteurEnvoyer(m,{dest:d.id,cat:'H-light',style:'lutteur',sem:2});m.cal.jour=14;let r=mgmtRecruteurRetour(m);if(r.bredouille){bredouille++;continue;}let p=r.profils.filter(x=>x.pepita);if(p.length>1)return false;pepites+=p.length;for(const x of r.profils){profils++;if(x.style==='lutteur')styles++;}}return {styles,pepites,bredouille,profils}})()`);assert.ok(ok.styles/ok.profils>=.45);assert.ok(ok.pepites/400>=.6/40&&ok.pepites/400<=1.4/40);assert.ok(ok.bredouille/400>=.08&&ok.bredouille/400<=.15);}finally{w.close();}
});
test('P5 T1 — refus sans argent et signature intégrée à l’effectif',()=>{
  const w=newGameWindow();try{const ok=w.eval(`(()=>{for(let i=0;i<50;i++){let m=mgmtDefault();m.treasury=0;if(mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2}))return false;m.treasury=50000;m.cal={jour:0};m.graine='sign'+i;mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2});m.cal.jour=14;let r=mgmtRecruteurRetour(m);if(!r.profils.length)continue;let p=r.profils[0],f=mgmtRecruteurSigner(m,p.id);return !!f&&m.roster.includes(f)&&typeof f.id==='string'&&Number.isInteger(f.age)}return false})()`);assert.equal(ok,true);}finally{w.close();}
});
test('P5 T1 — validation et réparation bornées',()=>{
  const w=newGameWindow();try{assert.deepEqual(JSON.parse(w.eval(`(()=>{let m=mgmtDefault();m.recruteur={mission:null,retours:[],seq:0};let valide=validateMgmt(m);m.recruteur.retours=[{}];let invalide=!validateMgmt(m);mgmtRepair(m);return JSON.stringify({valide,invalide,retire:!Object.hasOwn(m,'recruteur')})})()`)),{valide:true,invalide:true,retire:true});}finally{w.close();}
});
test('P5 T1 — les textes de retour restent du texte brut',()=>{
  const w=newGameWindow();try{assert.equal(w.eval(`(()=>{let m=mgmtDefault();m.treasury=50000;m.graine='hostile';m.cal={jour:0};mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2});m.cal.jour=14;let r=mgmtRecruteurRetour(m),t=r.profils.map(p=>p.phrase).join(' ');return !/[<>]/.test(t)})()`),true);}finally{w.close();}
});
