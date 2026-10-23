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
test('Un scoreAvantDernier isolé ne prétend pas établir un retournement',()=>{
  context.mgmtReleveCoin=()=>({kd:0});
  context.mgmtClassementCategorie=()=>[];
  const m={roster:[],hist:[]},c={a:{id:'a',div:'x'},b:{id:'b',div:'x'},winner:'A',slot:'prelim',family:'ko',round:3,scoreAvantDernier:-1,s:{d:610,A:{kd:0},B:{kd:0}}};
  assert.equal(context.elig(m,c),null);
});
test('L’interpellation ne fabrique pas une rivalité historique parallèle',()=>{
  const source=fs.readFileSync('mgmt-rivalites.js','utf8');
  assert.match(source,/function mgmtRivalites\(m\)/);
  assert.match(source,/Dérivé de m\.hist/);
  assert.match(fs.readFileSync('mgmt-corps.js','utf8'),/k:'discours',[^\n]*interpelle:d\.interpelle/);
});
const {newGameWindow:newGameWindowD}=require('./helpers/loadGame');

/* Constat du 23/10/2026 : test sur de vraies soirées, créées par le chemin réel. */
const jouerSoireesD=require('./helpers/jouerSoirees');
test('Monde lot 50 T1 — vingt soirées jouées une à une : de 0 à 4 discours par soirée, partie valide, sauvegarde rechargeable, aucune phrase avant trois discours d’écart pour un même combattant',()=>{
  const w=newGameWindowD({runMain:true});
  w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(20261008); CL.mgmtEnter(1); mgmtPasseGenerer('split',{soirees:3});`);
  const parSoiree=[];
  const phrases=new Map();
  let repetition=null;
  for(let k=0;k<20;k++){
    jouerSoireesD(w,1);
    const d=JSON.parse(w.eval(`JSON.stringify(G.mgmt.discours?G.mgmt.discours.d:[])`));
    parSoiree.push(d.length);
    /* Les banques comptent quatre variantes par famille : une phrase ne peut revenir qu'après trois discours du même combattant (l'aide de test refait combattre les mêmes têtes d'affiche à chaque soirée, jusqu'à quinze discours en vingt soirées). */
    for(const x of d){ const liste=phrases.get(x.a)||[]; const recents=liste.slice(-3); for(const ligne of x.lignes){ if(recents.some(r=>r.includes(ligne))) repetition=repetition||x.a+' : '+ligne; } liste.push(x.lignes); phrases.set(x.a,liste); }
  }
  const etat=JSON.parse(w.eval(`JSON.stringify({valide:validateMgmt(G.mgmt),recharge:validateMgmt(JSON.parse(JSON.stringify(G.mgmt)))})`));
  assert.ok(parSoiree.every(n=>n>=0&&n<=4),'0 à 4 discours par soirée : '+parSoiree.join(','));
  assert.ok(parSoiree.some(n=>n>0),'au moins une soirée a un discours (principal et co-principal sont éligibles)');
  assert.equal(etat.valide,true);
  assert.equal(etat.recharge,true);
  assert.equal(repetition,null,'aucune phrase répétée pour un même combattant : '+repetition);
});
