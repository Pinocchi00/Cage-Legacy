"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-ceremonie.js'),'utf8');
function charger(){const c={mgmtCalAujourdhui:()=>365,mgmtHistoirePoidsCombat:()=>0};vm.createContext(c);vm.runInContext(source,c);return c;}
test('Lot 55 T1 — le calcul des prix est pur et déterministe',()=>{
  const m={hist:[{c:1,a:{id:'a',name:'A'},b:{id:'b',name:'B'},winner:'A',family:'ko',round:1,slot:'main'},{c:2,a:{id:'a',name:'A'},b:{id:'c',name:'C'},winner:'A',family:'sub',round:2},{c:3,a:{id:'a',name:'A'},b:{id:'d',name:'D'},winner:'A',family:'ko',round:1}],roster:[{id:'a'}]};
  const c=charger(), before=JSON.stringify(m);assert.deepEqual(c.mgmtCeremonieCalculer(m),c.mgmtCeremonieCalculer(m));assert.equal(JSON.stringify(m),before);
});
test('Lot 55 T1 — aucun prix sans candidat minimum',()=>{
  const c=charger();assert.equal(JSON.stringify(c.mgmtCeremonieCalculer({hist:[]})),'[]');
});
test('Lot 55 T1 — les prix lauréats se consignent sans doublon',()=>{
  const c=charger(),m={roster:[{id:'a'}]},prix=[{id:'ko',laureat:'a'}];c.mgmtCeremonieInscrire(m,prix,2026);c.mgmtCeremonieInscrire(m,prix,2026);assert.equal(m.roster[0].prixAnnee.length,1);
});
test('Lot 55 T1 — rendu échappé et toutes les classes ce3 ont une règle',()=>{
  const c=charger();
  const js=source;
  assert.match(js,/mgmtCeremonieEchapper\(x\.nom\)/);
  const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
  const classes=[...new Set([...js.matchAll(/class="(ce3-[^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)))];
  for(const name of classes)assert.match(html,new RegExp('\\.'+name+'(?:[^,{]*)\\{'),`règle CSS manquante: ${name}`);
  assert.equal(c.mgmtCeremonieEchapper('<script>'), '&lt;script&gt;');
});
test('Lot 55 T1 — champ prix facultatif et réparé sans création sur ancien état',()=>{
  const save=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-save.js'),'utf8');
  assert.match(save,/prixAnnee/);
  assert.match(save,/delete f\.prixAnnee/);
});
test('Lot 55 T1 — les relevés sont filtrés sur la fenêtre annuelle et les prix changent avec les combats',()=>{
  const c=charger();
  const combat=(jour,adversaire,family='ko')=>({c:jour,a:{id:'a',name:'A',W:3,L:0,D:0},b:{id:adversaire,name:adversaire},winner:'A',family,round:1,slot:'main'});
  const m={hist:[combat(1,'ancien'),combat(40,'b'),combat(100,'c'),combat(200,'d'),combat(366,'hors-fenetre')],roster:[]};
  const result=c.mgmtCeremonieCalculer(m);
  assert.ok(result.some(p=>p.id==='combattant'&&p.laureat==='a'));
  assert.ok(result.every(p=>p.relu===false));
  const avant=JSON.stringify(result);m.hist.push(combat(250,'e','sub'));
  assert.notEqual(JSON.stringify(c.mgmtCeremonieCalculer(m)),avant);
});
test('Lot 55 T1 — un prix de combat nul et une finition absente ne sont pas décernés',()=>{
  const c=charger(),m={hist:[
    {c:1,a:{id:'a',name:'A'},b:{id:'b',name:'B'},winner:'A',family:'decision'},
    {c:2,a:{id:'c',name:'C'},b:{id:'d',name:'D'},winner:'B',family:'decision'}
  ]};
  const ids=c.mgmtCeremonieCalculer(m).map(p=>p.id);
  assert.ok(!ids.includes('ko'));
  assert.ok(!ids.includes('soumission'));
  assert.ok(!ids.includes('combat'));
});
test('Lot 55 T1 — le retour tient compte du dernier combat avant la fenêtre annuelle',()=>{
  const c=charger(),m={hist:[
    {c:10,a:{id:'a'},b:{id:'b'},winner:'A',family:'decision'},
    {c:200,a:{id:'a',name:'A'},b:{id:'c',name:'C'},winner:'A',family:'decision'}
  ]};
  const retour=c.mgmtCeremonieCalculer(m).find(p=>p.id==='retour');
  assert.ok(retour);
  assert.equal(retour.laureat,'a');
});
test('Lot 55 T1 — le carnet lit les traces disponibles sans recalculer les saisons absentes',()=>{
  const c=charger();
  const m={roster:[{id:'x',name:'X',prixAnnee:[{prix:'ko',annee:2025}]}],hist:[{c:12,primes:[{titre:'Prime observée'}]}],facts:[{k:'champion',nom:'X'}],defis:[{id:'d',etat:'fait'}]};
  const carnet=c.mgmtCarnetLire(m);
  assert.equal(carnet.prix.length,1);
  assert.equal(carnet.champions.length,1);
  assert.equal(carnet.primes[0].titre,'Prime observée');
  assert.equal(carnet.defis.length,1);
  assert.equal(carnet.soirees.length,1);
  assert.equal(JSON.stringify(c.mgmtCarnetLire({})),JSON.stringify({champions:[],espoirs:[],prix:[],defis:[],primes:[],soirees:[]}));
});
