"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};
vm.createContext(context);
for(const f of ['mgmt-discours-data.js','mgmt-discours.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
context.data=vm.runInContext('MGMT_DISCOURS_DATA',context);
context.elig=vm.runInContext('mgmtDiscoursEligibilite',context);
context.compose=vm.runInContext('mgmtDiscoursComposer',context);
test('Les banques de discours existent, sont distinctes et marquées relu:false',()=>{
  assert.equal(context.data.relu,false);
  for(const ton of ['fier','emu','provocateur','humble'])for(const famille of ['ouvertures','remerciements','appels','annonces']){
    const banque=context.data.tons[ton][famille];assert.ok(banque.length>=4);assert.equal(new Set(banque).size,banque.length);
  }
});
test('Un combat préliminaire ordinaire ne déclenche pas de discours',()=>{
  context.mgmtReleveCoin=()=>({kd:0});
  const m={roster:[],hist:[]},combat={a:{id:'a'},b:{id:'b'},winner:'A',slot:'prelim',family:'dec',round:3,s:{d:900}};
  assert.equal(context.elig(m,combat),null);
});
test('Principal, co-principal, surprise et guerre de knockdowns sont éligibles',()=>{
  context.mgmtReleveCoin=(s,c)=>s[c];
  context.mgmtClassementCategorie=(m)=>m.rows;
  const m={rows:[{id:'rank1'},{id:'rank2'},{id:'rank3'},{id:'rank4'},{id:'winner'}],roster:[],hist:[]};
  const base={a:{id:'winner',div:'x',name:'Vainqueur'},b:{id:'loser',div:'x',name:'Adversaire'},winner:'A',family:'dec',round:3,s:{d:900,A:{kd:0},B:{kd:0}}};
  assert.equal(context.elig(m,{...base,slot:'main',position:0}).motif,'principal');
  assert.equal(context.elig(m,{...base,slot:'main',position:1}).motif,'co-principal');
  assert.equal(context.elig(m,{...base,slot:'prelim'}).motif,'surprise');
  m.rows=[{id:'winner'},{id:'rank2'}];
  assert.equal(context.elig(m,{...base,slot:'prelim',s:{d:900,A:{kd:1},B:{kd:2}}}).motif,'combat-fou');
});
test('Composition déterministe, nom interpellé réel et aucune accolade résiduelle',()=>{
  context.mgmtClassementCategorie=()=>[{id:'champion'}];
  context.mgmtRivalites=()=>[];
  const m={graine:12,eventsPlayed:2,ville:'Paris',roster:[{id:'champion',name:'Champion'}],facts:[]};
  const c={a:{id:'vainq',name:'Gagnant',div:'x'},b:{id:'perd',name:'Perdant',div:'x'},winner:'A',slot:'main',position:0,family:'dec',round:3,s:{d:900,A:{kd:0},B:{kd:0}}};
  const d=context.compose(m,c);
  assert.equal(d.interpelle,'champion');
  assert.equal(d.lignes.length,4);
  assert.equal(d.lignes.join(' ').includes('{'),false);
  assert.deepEqual(Array.from(context.compose(m,c).lignes),Array.from(d.lignes));
});
test('L’éligibilité est pure et indépendante de toute RNG',()=>{
  context.mgmtReleveCoin=()=>({kd:0});
  context.mgmtClassementCategorie=()=>[];
  const m={roster:[],hist:[]},c={a:{id:'a',div:'x'},b:{id:'b',div:'x'},winner:'A',slot:'prelim',family:'dec',round:3,s:{d:900}};
  const avant=JSON.stringify([m,c]);
  assert.equal(context.elig(m,c),null);
  assert.equal(JSON.stringify([m,c]),avant);
  assert.equal(fs.readFileSync('mgmt-discours.js','utf8').includes('rnd('),false);
});
