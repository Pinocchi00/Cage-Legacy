"use strict";
/* ==== [ANCRE: TEST_P2_T3_TRAITS_FICHE] — Monde lot 37 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('brief du 22/10, P2 T3 — textes présents, champs de contexte résolus et formats chiffrés',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const ids=MGMT_TRAITS.map(t=>t.id),texts=Object.keys(MGMT_TRAITS_TEXTES),k=mgmtTraitsContexte({hist:[],roster:[],orgs:{}},'absent').k;return {ids,texts,k,fmt:mgmtTraitTexte('encaisseur',{sigEncaisseParMin:3.56}),p:mgmtTraitTexte('sous-pression',{principal:{taux:.67}}),s:mgmtTraitTexte('etouffeur',{controlePar15:215})};})())`));
  assert.deepEqual(r.ids.slice().sort(),r.texts.slice().sort());
  assert.equal(r.fmt.fait,'3,6 coups reçus par minute et toujours debout');
  assert.match(r.p.fait,/67 %/); assert.match(r.s.fait,/3:35/);
  for(const id of r.ids){const text=w.eval(`mgmtTraitTexte(${JSON.stringify(id)},${JSON.stringify(r.k)})`);assert.ok(!/undefined|NaN|\{/.test(text.fait),id);}
});

test('brief du 22/10, P2 T3 — l’Aperçu affiche le panneau de traits et échappe les contenus injectés',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_effectif');CL.mgmtEffectifOuvrir();const f=mgmtFighterById(G.mgmt,MGMT_FICHE.id),id=mgmtTraitsDe(G.mgmt,f.id)[0];MGMT_TRAITS_TEXTES[id].phrase='<img onerror>';let html=mgmtFicheApercuHtml(G.mgmt,f,mgmtFicheLigne(G.mgmt,f.id));return {html};})())`));
  assert.match(r.html,/Ce qui le distingue/); assert.match(r.html,/TRAITS/);
  assert.ok(!r.html.includes('<img onerror>')); assert.ok(r.html.includes('&lt;img onerror&gt;'));
});

test('brief du 22/10, P2 T3 — six soirées : chaque combattant produit un à quatre traits en moins de 300 ms',()=>{
  const w=newGameWindow({runMain:true}); w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt,t=Date.now();const rows=m.roster.map(f=>mgmtTraitsFiche(m,f.id));return {ms:Date.now()-t,lens:rows.map(x=>x.vus.length)};})())`));
  assert.ok(r.ms<300,`${r.ms} ms`); assert.ok(r.lens.every(n=>n<=4));
});
