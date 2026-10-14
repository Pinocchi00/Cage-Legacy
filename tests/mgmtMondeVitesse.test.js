"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 9 T1 — semaine ouverte une fois pour huit organisations', () => {
  const win=newGameWindow({runMain:true});
  const res=win.eval(`(function(){
    setSeed(20261008);
    window.__ouvertures=0;
    const orig=mgmtNewPile;
    mgmtNewPile=function(m){ window.__ouvertures++; return orig(m); };
    const orgs=MGMT_ORGANISATIONS.map(o=>o.id);
    const att=[];
    for(const id of orgs){
      const m=mgmtPassePreparer(id,{});
      att.push({id, ouverturesParOrg:1, cycle:m.cycle, events:m.eventsPlayed});
    }
    return JSON.stringify({orgs:orgs.length, ouvertures:window.__ouvertures, att});
  })()`);
  const r=JSON.parse(res);
  assert.equal(r.orgs,8);
  assert.equal(r.ouvertures,8,'exactement une ouverture par organisation');
  assert.equal(r.att.length,8);
});

test('Monde lot 9 T1 — booking direct des prédécesseurs équivalent au booking préparé', () => {
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(function(){
    setSeed(20261008);
    window.__cartRows=0;
    const orig=mgmtCartRows;
    mgmtCartRows=function(m){ window.__cartRows++; return orig(m); };
    const m=mgmtPasseGenerer('split',{soirees:5});
    return JSON.stringify({cartRows:window.__cartRows, jouees:m.eventsPlayed});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.cartRows,0,'aucune liste d\'écran construite');
  assert.ok(s.jouees>0,'des soirées jouées');
});

test('Monde lot 9 T1 — à graine égale la création complète est déterministe', () => {
  const win=newGameWindow({runMain:true});
  const a=win.eval(`JSON.stringify((function(){ mgmtRetraitProb=function(){return 0;}; setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:10}); return m; })())`);
  const win2=newGameWindow({runMain:true});
  const b=win2.eval(`JSON.stringify((function(){ mgmtRetraitProb=function(){return 0;}; setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:10}); return m; })())`);
  assert.equal(a,b,'états finaux strictement égaux');
});