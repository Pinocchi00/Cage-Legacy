"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const data=fs.readFileSync('mgmt-memoire-data.js','utf8');
const calc=fs.readFileSync('mgmt-memoire.js','utf8');
function memoire(){
  const w={mgmtHashId:s=>Array.from(s).reduce((a,c)=>a+c.charCodeAt(0),0),mgmtFighterById:()=>({name:'Combattant'})};
  vm.createContext(w);vm.runInContext(data+'\n'+calc+'\nglobalThis.config=MGMT_MEMOIRE;',w);return w;
}
test('Lot 47 T1 — données de mémoire déterministes, sans promesse ni compteur',()=>{
  const w=memoire(),cfg=w.config;
  assert.ok(Object.keys(cfg.types).length>=7);
  assert.ok(cfg.niveaux.length>=6);
  for(const n of cfg.niveaux)for(const groupe of [n.fiche,n.presse]){
    assert.equal(groupe.length,3);assert.equal(new Set(groupe).size,3);
    for(const phrase of groupe){assert.doesNotMatch(phrase,/[0-9]/);assert.doesNotMatch(phrase,/promets|promis/i);assert.match(phrase,/{nom}/);}
  }
  const m={cycle:20,roster:[],memoire:{c:{s:[['attente-longue',20]],p:4}}};
  assert.equal(w.mgmtMemoirePense(m,'c').phrase,w.mgmtMemoirePense(m,'c').phrase);
});
test('Lot 47 T1 — attente longue produit une pensée de mécontentement',()=>{
  const w=memoire(),m={cycle:12,roster:[{id:'c',name:'Combattant',attente:8}],hist:[],facts:[],memoire:{c:{s:Array.from({length:4},(_,i)=>['attente-longue',12-i]),p:2}}};
  w.mgmtMemoireSoiree(m);
  assert.equal(m.memoire.c.p,4);
});
test('Lot 47 T1 — validation mémoire borne les données',()=>{
  const w=memoire();
  assert.equal(w.mgmtMemoireValide({c:{s:[['prime',1]],p:2}}),true);
  assert.equal(w.mgmtMemoireValide({c:{s:[['inconnu',1]],p:2}}),false);
  assert.equal(w.mgmtMemoireValide({c:{s:Array(9).fill(['prime',1]),p:2}}),false);
});
