"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Niveaux organisations — dérivés, déterministes et liés aux sources courantes',()=>{
  const win=newGameWindow();
  const result=JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(19); const m={org:'split',pop:40,roster:[],salles:[{nom:'petite',capacite:800}],comptes:[],mondeVivant:false};
    const a=mgmtOrgNiveaux(m,m.org), b=mgmtOrgNiveaux(m,m.org);
    const p=a.popularite; m.pop=p+1; const c=mgmtOrgNiveaux(m,m.org);
    return {a,b,c,r:mgmtOrgNiveauxRangs(m),ids:MGMT_ORGANISATIONS.map(o=>o.id),legacy:mgmtOrgNiveaux({org:m.org,roster:m.roster,mondeVivant:false},'garden-of-blood')};
  })())`));
  assert.deepEqual(result.a,result.b);
  assert.equal(result.c.popularite,result.a.popularite+1);
  assert.deepEqual(Object.keys(result.r).sort(),result.ids.sort());
  assert.equal(result.legacy,null);
});

/* ==== [ANCRE: TEST_MONDE_LOT9_T3_NIVEAUX_INDEPENDANTS] — Monde lot 9 T3 ==== */
test('Niveaux organisations — stade, notoriété et puissance suivent leurs règles propres',()=>{
  const win=newGameWindow();
  const result=JSON.parse(win.eval(`JSON.stringify((function(){
    const m={org:'split',pop:40,mondeVivant:false,roster:[{id:'f1',div:'H-light',star:4},{id:'f2',div:'H-light',star:2}],salles:[{id:'s1',nom:'Petite',capacite:800},{id:'s2',nom:'Grande',capacite:4000}],comptes:[{salle:'Petite',taux:.9},{salle:'Grande',taux:.79}]};
    const oldRank=mgmtDivisionRanking, oldResolve=mgmtExteriorCombattant, oldStar=mgmtStar;
    mgmtDivisionRanking=(partie,div)=>div==='H-light'?[{id:'f1',rang:3},{id:'f2',rang:1},{id:'outside',rang:11}]:[]; mgmtExteriorCombattant=()=>null; mgmtStar=f=>f.star;
    const a=mgmtOrgNiveaux(m,'split'); m.comptes=[{salle:'Grande',taux:.8}]; const b=mgmtOrgNiveaux(m,'split');
    mgmtDivisionRanking=oldRank; mgmtExteriorCombattant=oldResolve; mgmtStar=oldStar; return {a,b};
  })())`));
  assert.equal(result.a.stade,800); assert.equal(result.b.stade,4000); assert.equal(result.a.notoriete,3); assert.equal(result.a.puissance,18);
});

test('Niveaux organisations — rang fourni et sous-partie vivante déterminent la puissance',()=>{
  const win=newGameWindow();
  const result=JSON.parse(win.eval(`JSON.stringify((function(){
    const m={org:'split',mondeVivant:true,roster:[{id:'mine',div:'H-light'}],pop:40,orgs:{'garden-of-blood':{roster:[{id:'other',div:'H-light'}]}}};
    const oldRank=mgmtDivisionRanking, oldResolve=mgmtExteriorCombattant;
    mgmtDivisionRanking=(partie,div)=>div==='H-light'&&partie.roster.length?[{id:partie.roster[0].id,rang:partie.roster[0].id==='mine'?2:1}]:[];
    mgmtExteriorCombattant=()=>null;
    const a=mgmtOrgNiveaux(m,'split'), b=mgmtOrgNiveaux(m,'garden-of-blood');
    mgmtDivisionRanking=oldRank; mgmtExteriorCombattant=oldResolve; return {a:a.puissance,b:b.puissance};
  })())`));
  assert.deepEqual(result,{a:9,b:10});
});
