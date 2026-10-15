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
