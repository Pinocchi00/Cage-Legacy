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
    const avant=window.__ouvertures;
    const att=[];
    for(const id of orgs){
      const before=window.__ouvertures;
      const m=mgmtPassePreparer(id,{});
      att.push({id, ouvertures:window.__ouvertures-before, cycle:m.cycle, events:m.eventsPlayed,
        calActif:!!(m.cal&&m.cal.actif), calJour:m.cal?m.cal.jour:null,
        calProchaines:m.cal&&Array.isArray(m.cal.prochaines)?m.cal.prochaines.length:0});
    }
    return JSON.stringify({orgs:orgs.length, ouvertures:window.__ouvertures, avant, att});
  })()`);
  const r=JSON.parse(res);
  assert.equal(r.orgs,8);
  assert.equal(r.ouvertures-r.avant,8,'exactement une ouverture par organisation');
  assert.equal(r.att.length,8);
  for(const x of r.att){
    assert.equal(x.ouvertures,1,'une ouverture pour '+x.id);
    assert.equal(x.calActif,true,'calendrier actif pour '+x.id);
    assert.equal(x.calJour,0,'jour d\u2019ouverture pour '+x.id);
  }
});

test('Monde lot 9 T1 — booking direct des prédécesseurs équivalent au booking préparé', () => {
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(function(){
    setSeed(20261008);
    window.__cartRows=0;
    const orig=mgmtCartRows;
    mgmtCartRows=function(m){ window.__cartRows++; return orig(m); };
    const m=mgmtPasseGenerer('split',{soirees:5});
    const combattants=m.roster.filter(f=>f&&!mgmtIsRetired(f)).map(f=>f.id);
    const carte=(m.card.main||[]).map(x=>({a:x.a,b:x.b,title:!!x.title}));
    return JSON.stringify({cartRows:window.__cartRows, jouees:m.eventsPlayed, combattants, carte});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.cartRows,0,'aucune liste d\u2019écran construite');
  assert.ok(s.jouees>0,'des soirées jouées');
  assert.ok(s.combattants.length>0,'des combattants');
  assert.ok(s.carte.length>0,'une carte retenue');

  const win2=newGameWindow({runMain:true});
  const r2=win2.eval(`(function(){
    setSeed(20261008);
    const m=mgmtPasseGenerer('split',{soirees:5});
    return JSON.stringify({combattants:m.roster.filter(f=>f&&!f.retired&&true).map(f=>f.id),
      carte:(m.card.main||[]).map(x=>({a:x.a,b:x.b,title:!!x.title}))});
  })()`);
  const s2=JSON.parse(r2);
  assert.deepEqual(s.combattants,s2.combattants,'combattants identiques sous graine fixe');
  assert.deepEqual(s.carte,s2.carte,'carte retenue identique sous graine fixe');
});

test('Monde lot 9 T1 — à graine égale la création complète est déterministe', () => {
  const win=newGameWindow({runMain:true});
  const a=win.eval(`JSON.stringify((function(){ mgmtRetraitProb=function(){return 0;}; setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:10}); return m; })())`);
  const win2=newGameWindow({runMain:true});
  const b=win2.eval(`JSON.stringify((function(){ mgmtRetraitProb=function(){return 0;}; setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:10}); return m; })())`);
  assert.equal(a,b,'\u00e9tats finaux strictement \u00e9gaux');
});