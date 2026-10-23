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

test('Monde lot 54 T1 — D1 : une défaite réduit le score de classement (correction déjà présente, audit du 16/10)',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{
      const loser={id:'d1-loser',W:13,L:2,D:0,lastCycle:1};
      const other={id:'d1-other',W:13,L:1,D:0,lastCycle:1};
      const m={cycle:2,hist:[{c:1,a:{id:loser.id,W:13,L:1},b:{id:other.id,W:13,L:1},winner:'B'}]};
      const scores=mgmtRangScores(m,[loser,other],2);
      return {loser:scores.get(loser.id),other:scores.get(other.id)};
    })()`);
    assert.ok(r.loser<r.other,JSON.stringify(r));
  }finally{w.close();}
});
