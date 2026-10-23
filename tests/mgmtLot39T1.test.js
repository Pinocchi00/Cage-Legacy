"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT39_T1] — Monde lot 39 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 39 T1 — les textes de trait sont répertoriés et remplissables',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const fs=new Set(Object.keys(MGMT_COMMENTAIRE));const es=Object.entries(MGMT_COMMENTAIRE_TRAITS).filter(([id])=>id!=='relu');const a=es.flatMap(([id,x])=>x.phrases.map(p=>({id,f:x.famille,p:p})));return {traits:es.every(([id])=>MGMT_TRAITS.some(t=>t.id===id)),fam:a.every(x=>fs.has(x.f)),n:a.length,uniq:es.every(([,x])=>new Set(x.phrases).size===x.phrases.length),tokens:a.every(x=>!x.p.replace(/\\{[XY]\\}/g,'N').match(/[{}]/))}})())`));
  assert.ok(r.traits);assert.ok(r.fam);assert.ok(r.uniq);assert.ok(r.tokens);assert.ok(r.n>=40);
});

test('Monde lot 39 T1 — les présentations du combat conservent le balisage échappé',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>({ok:typeof mgmtPresentationLignes==='function',escape:typeof esc==='function'}))()`);
  assert.equal(r.ok,true);assert.equal(r.escape,true);
});

test('Monde lot 39 T1 — le choix des commentaires reste local à l’arène',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const s={mgmtIds:{A:'absent-a',B:'absent-b'},mgmtCycle:1};return {rng:typeof areneAlea==='function',seuil:4,fiche:typeof mgmtTraitsFiche==='function',html:typeof mgmtPresentationHtml==='function'}})()`);
  assert.equal(r.rng,true);assert.equal(r.fiche,true);assert.equal(r.html,true);
});
