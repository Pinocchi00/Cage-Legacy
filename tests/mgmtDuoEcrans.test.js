"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Duo T3 — le menu Duo existe hors démo et reste masqué en démo',()=>{
  const w=newGameWindow();
  assert.equal(w.eval("MF_MENU.some(x=>x.id==='duo')"),true);
  assert.equal(w.eval("CL_DEMO=true; mfMenu().some(x=>x.id==='duo')"),false);
});

test('Duo T3 — emplacement vide en mode Duo ouvre la création temporaire',()=>{
  const w=newGameWindow();
  w.eval('CL.mgmtDuoParties(); CL.mgmtPartieOuvrir();');
  assert.equal(w.eval('G.screen'),'mgmt_duo_nouvelle');
  assert.match(w.document.body.textContent,/Bientôt/);
});

test('Duo T3 — une partie Duo rouverte ouvre mgmt_duo si l’écran existe',()=>{
  const w=newGameWindow({runMain:true});
  w.eval('SCREENS.mgmt_duo=()=>"Duo";');
  w.eval('setSeed(20261018); CL.mgmtEnter(1); mgmtDuoActif=()=>true; CL.mgmtEnter(1);');
  assert.equal(w.eval('G.screen'),'mgmt_duo');
});

test('Duo T3 — l’emplacement affiche le libellé DUO et la prochaine super carte',()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`);
  const txt=w.eval(`mgmtPartieHtml(1,1,{dates:{}},Date.now())`);
  assert.match(txt,/DUO · .* × .*Super carte 1/);
});

test('Duo T3 — mgmtDuoEffectif lit le côté B, trie et expose son état',()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`);
  const result=w.eval(`(()=>{const m=G.mgmt,d=allDivisions()[0].id; return mgmtDuoEffectif(m,'b',d);})()`);
  assert.ok(result.length>0);
  const j1ids=w.eval('G.mgmt.roster.map(f=>f.id)');
  assert.ok(result.every(x=>!j1ids.includes(x.id)));
  assert.ok(result.every(x=>['dispo','blesse','libre','refuse'].includes(x.etat)));
  assert.deepEqual(Object.keys(result[0]),['id','name','rang','W','L','D','age','etat','restants','forme']);
});

test('Duo T3 — aucun texte de travail dans les écrans ajoutés',()=>{
  const w=newGameWindow();
  assert.equal(w.eval("String(SCREENS.mgmt_duo_nouvelle()).includes('TODO')"),false);
});
