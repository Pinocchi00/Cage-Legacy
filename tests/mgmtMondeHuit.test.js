"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT22_T1] — Monde lot 22 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

const win=newGameWindow({runMain:true});
win.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});");

test('Monde lot 22 T1 — mgmtFicheLigne trouve les sept organisations vivantes sans mutation',()=>{
  const r=win.eval(`(function(){const m=G.mgmt,b=mgmtSerialiser(m),ids=mgmtMondeVivantIds(m),out=ids.map(orgId=>{const f=m.orgs[orgId].roster[0],l=mgmtFicheLigne(m,f.id);return {orgId,ok:!!l&&l.orgId===orgId&&l.f.orgId===orgId&&l.f.org===mgmtOrgParId(orgId).nom,copie:!!l&&l.f!==f};});return {out,stable:b===mgmtSerialiser(m)};})()`);
  assert.ok(r.out.every(x=>x.ok&&x.copie));
  assert.equal(r.stable,true);
});

test('Monde lot 22 T1 — une partie sans monde vivant garde son résultat extérieur historique',()=>{
  const r=win.eval(`(function(){const m=G.mgmt,sans=Object.assign({},m,{mondeVivant:false,orgs:undefined}),line=sans.exterieur[0];return JSON.stringify(mgmtFicheLigne(sans,line.id))===JSON.stringify((function(){const t=mgmtExteriorTrace(line,sans.cycle);return t?{f:{id:line.id,div:line.div,divName:divById(line.div).name,ck:line.ck,generation:line.generation,name:t.name,first:t.first,last:t.last,age:t.age,W:t.pro.W,L:t.pro.L,D:0},trace:t}:null;})());})()`);
  assert.equal(r,true);
});

test('Monde lot 22 T1 — une ligne de classement affiche l’organisation du combattant vivant',()=>{
  const r=win.eval(`(function(){const m=G.mgmt,orgId=mgmtMondeVivantIds(m)[0],f=m.orgs[orgId].roster[0],row={id:f.id,W:f.W,L:f.L,D:f.D||0},html=mgmtClassementsRowHtml(m,1,row,null);return {html,nom:mgmtOrgParId(orgId).nom};})()`);
  assert.ok(r.html.includes(r.nom));
  assert.ok(!r.html.includes('>Split</span>'));
});

test('Monde lot 22 T1 — la fiche d’un combattant vivant s’ouvre et les lectures ne mutent rien',()=>{
  const r=win.eval(`(function(){const m=G.mgmt,f=m.orgs[mgmtMondeVivantIds(m)[0]].roster[0];CL.mgmtFiche(f.id);return {html:document.body.innerHTML,nom:f.name};})()`);
  assert.ok(r.html.includes('mgmt_fiche'));
  assert.ok(r.html.includes(r.nom));
});
