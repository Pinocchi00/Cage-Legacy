"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 24 T1 — échelle extérieure : sept noms ordonnés, Split au même rang, ancien monde à quatre',()=>{
  const w=newGameWindow();
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtDefault('split');m.echelleExt=7;const sept=mgmtExtOrgs(m);m.org='Ultimate Rim';const remplace=mgmtExtOrgs(m);delete m.echelleExt;return {sept,remplace,ancien:mgmtExtOrgs(m)}})())`));
  assert.deepEqual(r.sept,['Garden of Blood','MMA Korner','Pure Impact','Ultimate Rim','Knuckle Gate','Undisputed Cage','Fighting Pacific Championship']);
  assert.equal(r.remplace[3],'Split'); assert.equal(r.ancien.length,4);
});

test('Monde lot 24 T1 — carrière extérieure : plafonds et continuité sous le troisième échelon',()=>{
  const w=newGameWindow();
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{let maxi4=0,maxi7=0,atteint=false,identiques=true;for(let seed=0;seed<400;seed++){const m=mgmtDefault();m.echelleExt=4;G={mgmt:m};const a=mgmtExteriorCareer(seed,0,100);m.echelleExt=7;const b=mgmtExteriorCareer(seed,0,100);maxi4=Math.max(maxi4,a.orgIdx);maxi7=Math.max(maxi7,b.orgIdx);if(b.orgIdx>=4)atteint=true;if(a.orgIdx<3&&(a.W!==b.W||a.L!==b.L||JSON.stringify(a.orgs)!==JSON.stringify(b.orgs)))identiques=false;}return {maxi4,maxi7,atteint,identiques}})())`));
  assert.ok(r.maxi4<=3&&r.maxi7<=6&&r.atteint&&r.identiques);
});

test('Monde lot 24 T1 — validation : echelleExt accepte 4, 7 et absent seulement',()=>{
  const w=newGameWindow();
  assert.deepEqual(JSON.parse(w.eval(`JSON.stringify([4,7,undefined,5,'7'].map(x=>{const m=mgmtDefault();if(x===undefined)delete m.echelleExt;else m.echelleExt=x;return validateMgmt(m)}))`)),[true,true,true,false,false]);
});

test('Monde lot 24 T1 — défaut : partie neuve à sept, ancien helper sans champ',()=>{
  const w=newGameWindow();
  assert.equal(w.eval('mgmtDefault("split").echelleExt'),7);
  assert.equal(w.eval('(function(){const m=mgmtDefault();m.effectifs=0;m.niveaux=0;delete m.echelleExt;return m.echelleExt})()'),undefined);
});
