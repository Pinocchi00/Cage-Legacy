"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT57_T1_CLASSEMENT] — Monde lot 57 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

function partie(){
  const w=newGameWindow({runMain:true});
  w.eval("setSeed(20261024); mgmtPasseGenerer('split',{soirees:3}); mgmtMondeVivantGenerer(G.mgmt,{soirees:3});");
  return w;
}

test('Monde lot 57 T1 — le classement de guerre relie les huit rangs existants',()=>{
  const w=partie();
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt; return {g:mgmtGuerreClassement(m),o:mgmtOrgClassement(m)};})())`));
    assert.equal(r.g.length,8);
    assert.deepEqual(r.g.map(x=>x.id),r.o.map(x=>x.id));
    assert.deepEqual(r.g.map(x=>x.rang),[1,2,3,4,5,6,7,8]);
    assert.equal(r.g.filter(x=>x.estSplit).length,1);
    const split=r.g.find(x=>x.estSplit);
    assert.equal(split.duelSplit.devant,r.o[split.rang-2]?.id||null);
    assert.equal(split.duelSplit.derriere,r.o[split.rang]?.id||null);
    assert.ok(split.nom&&split.ville);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le classement est déterministe',()=>{
  const a=partie(),b=partie();
  try{
    const code=`JSON.stringify(mgmtGuerreClassement(G.mgmt))`;
    assert.equal(a.eval(code),b.eval(code));
  }finally{a.close();b.close();}
});
