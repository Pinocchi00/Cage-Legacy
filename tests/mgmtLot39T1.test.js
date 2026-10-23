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

test('Monde lot 39 T1 — chaque famille et chaque variante est valide et distincte',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const fs=new Set(Object.keys(MGMT_COMMENTAIRE));const es=Object.entries(MGMT_COMMENTAIRE_TRAITS).filter(([id])=>id!=='relu');const phrases=es.flatMap(([,x])=>x.phrases);return {fam:es.every(([,x])=>fs.has(x.famille)),n:phrases.length,uniques:new Set(phrases).size===phrases.length,accolades:phrases.every(p=>!p.replace(/\\{[XY]\\}/g,'N').match(/[{}]/))}})())`));
  assert.equal(r.fam,true);assert.ok(r.n>=40);assert.equal(r.uniques,true);assert.equal(r.accolades,true);
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

test('Monde lot 39 T1 — les traits visibles sont ceux qui alimentent réellement la présentation « L’histoire »',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const m=G.mgmt, combat=m.hist.find(t=>t&&t.a&&t.b&&t.s);
    if(!combat)return {fixture:false};
    const ids=[combat.a.id,combat.b.id];
    const v={mode:'combat',ids,h:combat.c,page:0,nom:0,vue:'histoire'};
    const c=mgmtPresentationLignes(m,v),p=c.panneaux.find(x=>x.titre==='LEUR HISTOIRE');
    if(!p)return {fixture:true,traits:[],expected:[]};
    const expected=ids.flatMap(id=>(mgmtTraitsFiche(m,id,combat.c).vus||[]).slice(0,4).map(t=>t.nom+' · '+t.fait));
    return {fixture:true,traits:p.lignes.filter(x=>x.sous&&x.texte.includes(' · ')).map(x=>x.texte),expected};
  })())`));
  assert.equal(r.fixture,true);
  for(const line of r.expected) assert.ok(r.traits.includes(line),line);
});

test('Monde lot 39 T1 — le rendu de l’histoire échappe les noms injectés',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");
  const r=w.eval(`(()=>{
    const m=G.mgmt, f=m.roster[0]; if(!f)return {fixture:false};
    const original=f.name, originalFirst=f.first, originalLast=f.last;
    f.name='<img onerror="alert(1)">';f.first=f.name;f.last='';
    const html=mgmtPresentationNomHtml(m,{mode:'combattant',ids:[f.id],noms:[f.id]},f.id);
    f.name=original;f.first=originalFirst;f.last=originalLast;
    return {fixture:true,escaped:html.includes('&lt;img onerror=')&&!html.includes('<img onerror=')};
  })()`);
  assert.equal(r.fixture,true);assert.equal(r.escaped,true);
});
