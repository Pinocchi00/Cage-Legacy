"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 53 T1 — voie réelle : une passe générée ouvre une soirée jouable',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const n=w.eval(`(()=>{setSeed(5301);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);return m;})()`);
    assert.ok(n);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);G.screen='mgmt_soiree';render();return {n:p.length,screen:G.screen,html:document.getElementById('app').innerHTML};})()`);
    assert.ok(r.n>0);
    assert.equal(r.screen,'mgmt_soiree');
    assert.match(r.html,/La soirée|PRÉLIM|COMBAT/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le choix de vue reste indépendant pour chaque combat',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5302);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{mgmtVueCombatChoisir(0,'resultat');mgmtVueCombatChoisir(1,'forts');return [mgmtVueDuCombat(G.mgmt,0),mgmtVueDuCombat(G.mgmt,1)];})()`);
    assert.deepEqual(Array.from(r),['resultat','forts']);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le cumul estimé inclut chaque combat et ses transitions',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5303);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const n=w.eval(`mgmtSoireeDureeEstimee(G.mgmt)`);
    assert.ok(Number.isFinite(n)&&n>0);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la fin annonce les primes présentes dans les relevés et échappe les noms',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{const m={lastEvent:{cycle:7},hist:[{c:7,pr:'cs',a:{id:'a',name:'<img src=x>'},b:{id:'b',name:'B'}},{c:7,pr:'pf',winner:'A',a:{id:'a',name:'<img src=x>'},b:{id:'c',name:'C'}}]};return mgmtSoPrimesFinHtml(m);})()`);
    assert.equal((html.match(/class="so3-prime"/g)||[]).length,2);
    assert.match(html,/COMBAT DE LA SOIRÉE/);
    assert.match(html,/PERFORMANCE DE LA SOIRÉE/);
    assert.doesNotMatch(html,/<img/);
    assert.match(html,/&lt;img/i);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-primes\s*\{/);
    assert.match(css,/\.so3-prime\s*\{/);
  }finally{w.close();}
});
