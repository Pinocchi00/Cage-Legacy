"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const data=fs.readFileSync('mgmt-memoire-data.js','utf8');
const calc=fs.readFileSync('mgmt-memoire.js','utf8');
function memoire(){
  const w={mgmtHashId:s=>Array.from(s).reduce((a,c)=>a+c.charCodeAt(0),0),mgmtFighterById:()=>({name:'Combattant'}),mgmtActuSourceAjouter(){}};
  vm.createContext(w);vm.runInContext(data+'\n'+calc+'\nglobalThis.config=MGMT_MEMOIRE;',w);return w;
}
test('Lot 47 T1 — données de mémoire déterministes, sans promesse ni compteur',()=>{
  const w=memoire(),cfg=w.config;
  assert.ok(Object.keys(cfg.types).length>=7);
  assert.ok(cfg.niveaux.length>=6);
  assert.ok(Object.isFrozen(cfg)&&Object.isFrozen(cfg.types)&&Object.isFrozen(cfg.niveaux));
  assert.ok(Object.values(cfg.types).every(Object.isFrozen));
  assert.ok(cfg.niveaux.every(n=>Object.isFrozen(n)&&Object.isFrozen(n.fiche)&&Object.isFrozen(n.presse)));
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
test('Lot 47 T1 — plainte de presse limitée à une par dix soirées',()=>{
  const w=memoire(),m={cycle:1,roster:[{id:'c',name:'Combattant',attente:8}],hist:[],facts:[],memoire:{c:{s:Array(8).fill(['attente-longue',1]),p:4}}};
  w.mgmtMemoireSoiree(m);
  assert.equal(m.facts.filter(x=>x.k==='memoire-presse'&&x.a==='c').length,1);
  for(let c=2;c<=10;c++){m.cycle=c;w.mgmtMemoireSoiree(m);}
  assert.equal(m.facts.filter(x=>x.k==='memoire-presse'&&x.a==='c').length,1);
  m.cycle=11;w.mgmtMemoireSoiree(m);
  assert.equal(m.facts.filter(x=>x.k==='memoire-presse'&&x.a==='c').length,2);
});

/* Constat du 23/10/2026 : les tests de la tranche passaient par des contextes simulés ; celui-ci joue de vraies soirées sur une partie créée par le chemin réel. */
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');
test('Monde lot 47 T1 — dix soirées jouées une à une : aucune exception, la partie reste valide et la mémoire se recharge',()=>{
  const w=newGameWindow({runMain:true});
  w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(20261008); CL.mgmtEnter(1); mgmtPasseGenerer('split',{soirees:3});`);
  for(let k=0;k<10;k++) jouerSoirees(w,1);
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt;const mem=m.memoire||{};const ids=Object.keys(mem);
    const copie=JSON.parse(JSON.stringify(m));
    return {valide:validateMgmt(m),n:ids.length,max:ids.reduce((a,i)=>Math.max(a,(mem[i].s||[]).length),0),recharge:validateMgmt(copie),joues:m.eventsPlayed};})())`));
  assert.equal(r.valide,true);
  assert.equal(r.recharge,true);
  assert.ok(r.max<=8,'au plus huit souvenirs par combattant');
  assert.ok(r.joues>=10);
});
