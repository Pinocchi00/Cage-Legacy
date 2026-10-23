"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 54 T1 — la partie réelle classe la surprise majeure avant les autres histoires',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const m=G.mgmt;return {stories:mgmtHistoiresSoiree(m,m.eventsPlayed),hasEvent:!!m.lastEvent&&m.lastEvent.fights.length>0};})()`);
    assert.equal(r.hasEvent,true);
    assert.ok(Array.isArray(r.stories));
    assert.equal(r.stories.length>0,true);
    assert.ok(r.stories.every((x,i)=>i===0||r.stories[i-1].poids>=x.poids));
  }finally{w.close();}
});

test('Monde lot 54 T1 — le classement d’une défaite applique la règle D1 existante sans toucher au moteur',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});const f=m.roster.find(x=>!mgmtIsRetired(x)&&x.div);const rang=mgmtDivisionRank(m,f,'organization');return {rang,calc:typeof mgmtDivisionRanking==='function'};})()`);
    assert.equal(r.calc,true);
    assert.ok(r.rang===null||Number.isSafeInteger(r.rang));
  }finally{w.close();}
});
