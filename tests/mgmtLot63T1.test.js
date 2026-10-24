"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 63 T1 — chaque famille de l’après a trois formulations spécifiques relu:false',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`MGMT_APRES_CATALOGUE.map(f=>({famille:f.famille,motCle:f.motCle,textes:f.textes.map(x=>x.texte),relu:f.textes.map(x=>x.relu)}))`);
    assert.ok(r.length>=10);
    for(const f of r){assert.equal(f.textes.length,3);assert.deepEqual(new Set(f.textes).size,3);assert.ok(f.textes.every(t=>t.toLowerCase().includes(f.motCle)),f.famille);assert.ok(f.relu.every(x=>x===false));}
    const all=r.flatMap(f=>f.textes);assert.equal(new Set(all).size,all.length);
  }finally{w.close();}
});

test('Monde lot 63 T1 — le calcul reste pur, borné et déterministe sur une vraie soirée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const m=G.mgmt,b=JSON.stringify(m),a=mgmtApresCalculer(m),c=mgmtApresCalculer(m);return {a,c,unchanged:b===JSON.stringify(m),past:mgmtApresCalculer({...m,lastEvent:{...m.lastEvent,cycle:-1}})}})()`);
    assert.equal(r.unchanged,true);assert.deepEqual(JSON.parse(JSON.stringify(r.a)),JSON.parse(JSON.stringify(r.c)));assert.ok(r.a.length<=3);assert.equal(r.past.length,0);
    for(const x of r.a)assert.equal(x.relu,false);
  }finally{w.close();}
});

test('Monde lot 63 T1 — la suite du lendemain montre les mouvements des autres organisations',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt;const org=mgmtMondeVivantIds(m)[0];m.orgs={[org]:{name:'<img src=x> Rivale',roster:[]}};m.guerre={ev:[{c:m.cycle,o:org,t:'agent',x:null,p:8}]};return JSON.stringify({org:'&lt;img src=x&gt; Rivale',raw:'<img src=x>',html:mgmtLendemainMouvementsHtml(m)});})()`));
    assert.ok(result.html.includes(result.org));
    assert.ok(!result.html.includes(result.raw));
    assert.match(result.html,/autre organisation/);
  }finally{w.close();}
});
