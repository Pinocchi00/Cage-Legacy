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
