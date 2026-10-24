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

test('Monde lot 63 T1 — le catalogue conserve les faits déclencheurs propres à chaque famille',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{const fn=mgmtLendemainApres.toString();return {families:MGMT_APRES_CATALOGUE.map(x=>x.famille),checks:['discours','trait_gagne','touched','demande','interet-organisation','espoirs','title','spectateurs','prime','retraite_annoncee'].map(x=>fn.includes(x))}})()`);
    assert.equal(r.families.length,10);
    assert.ok(r.checks.every(Boolean));
  }finally{w.close();}
});

test('Monde lot 63 T1 — les dix familles réclament chacune le fait réel correspondant',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{const fn=mgmtLendemainApres.toString();return {
      interpellation:/discours/.test(fn)&&/interpelle|target/.test(fn),
      reseaux:/trait_gagne/.test(fn)&&/surnom/.test(fn),
      suspension:/days/.test(fn)&&/touches/.test(fn),
      revanche:/demande/.test(fn)&&/revanche/.test(fn),
      organisation:/interet-organisation/.test(fn)&&/guerre/.test(fn),
      espoir:/espoirs/.test(fn)&&/suivis/.test(fn),
      titre:/title/.test(fn)||/ceinture/.test(fn),
      salle:/spectateurs/.test(fn),prime:/prime/.test(fn),retraite:/retraite_annoncee/.test(fn)
    }})()`);
    assert.deepEqual(Object.values(r),Array(10).fill(true));
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

test('Monde lot 63 T1 — l’après ne répète pas une formulation pour un combattant sur cinquante soirées',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{const m=G.mgmt;return JSON.stringify(Array.from({length:50},(_,i)=>mgmtLendemainApres(m,m.lastEvent.cycle+i+1)).flat().map(x=>x.texte))})()`));
    assert.ok(r.length>0);
    assert.equal(new Set(r).size,r.length);
  }finally{w.close();}
});

test('Monde lot 63 T1 — une ligne de l’après échappe le nom injecté en HTML',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{const m=G.mgmt,f=m.hist.find(t=>t&&t.c===m.lastEvent.cycle);if(!f)return JSON.stringify({});f.a.name='<img src=x>';m.facts.push({k:'discours',c:m.lastEvent.cycle,a:f.a.id,target:f.b.id});return JSON.stringify({line:mgmtLendemainApres(m,m.lastEvent.cycle+1).map(x=>x.texte).join(' '),safe:esc('<img src=x>')})})()`));
    if(r.line.includes('img')) assert.ok(!r.line.includes('<img'));
    assert.equal(r.safe,'&lt;img src=x&gt;');
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
