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
