"use strict";
/* Monde lot 2 T9 : l'écran d'arrivée en trois blocs (Ton organisation / Ce qui s'est passé avant toi / Ce que tu dois faire maintenant). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('T1 — les trois blocs sont présents ; le bloc du passé n’apparaît que si la partie a un passé', () => {
  const w=neuve();
  const sans=res(w,`const t=document.getElementById('app'); return {ecran:G.screen,blocs:t.querySelectorAll('.mf-arrivee-bloc').length,
    org:t.textContent.includes('Ton organisation'),passe:t.textContent.includes("Ce qui s'est passé avant toi"),
    faire:t.textContent.includes('Ce que tu dois faire maintenant')};`);
  assert.equal(sans.ecran,'mgmt_arrivee');
  assert.equal(sans.org,true);
  assert.equal(sans.faire,true);
  assert.equal(sans.passe,false);
  assert.equal(sans.blocs,2);
  const avec=res(w,`G.mgmt.passe={enCours:false,soirees:0,reculAns:0,combatsAttendus:0,plan:[]}; render();
    const t=document.getElementById('app'); return {blocs:t.querySelectorAll('.mf-arrivee-bloc').length,passe:t.textContent.includes("Ce qui s'est passé avant toi")};`);
  assert.deepEqual(avec,{blocs:3,passe:true});
});

test('T2 — les chiffres du passé égalent ceux de la partie', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.passe={enCours:false,soirees:0,reculAns:0,combatsAttendus:0,plan:[]};
    m.eventsPlayed=2; m.hist=[{},{}]; m.facts=(m.facts||[]).concat([{c:0,k:'retired',a:'x'}]);
    render(); const txt=document.getElementById('app').textContent;
    const ch=mgmtPredecesseurChampions(m).filter(Boolean).length;
    return {txt, ch, soirees:m.eventsPlayed, combats:m.hist.length, retraites:m.facts.filter(f=>f&&f.k==='retired').length};`);
  const attendu=`2 soirées, 2 combats, ${r.ch} ${r.ch>1?'champions':'champion'} en titre, 1 retraité`;
  assert.ok(r.txt.includes(attendu), 'texte attendu : '+attendu);
  assert.equal(r.soirees,2);
  assert.equal(r.combats,2);
  assert.equal(r.retraites,1);
});

test('T3 — aucun texte sous 22 px dans l’écran d’arrivée', () => {
  const w=neuve();
  const html=res(w,`return document.getElementById('app').innerHTML;`);
  assert.ok(!/font-size\s*:\s*(\d|1\d|2[01])(\.\d+)?px/.test(html), 'taille inline sous 22 px');
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  const lignes=css.split('\n').filter(l=>/mf-arrivee/.test(l));
  for(const l of lignes){
    for(const m of l.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1])>=22, 'texte sous 22 px : '+l);
  }
});
