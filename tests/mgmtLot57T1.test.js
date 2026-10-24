"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT57_T1_CLASSEMENT] — Monde lot 57 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
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

test('Monde lot 57 T1 — la variation du rang s’appuie sur le relevé précédent sans tirage',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt,avant=mgmtGuerreClassement(m);m.guerre=m.guerre||{};m.guerre.classementPrecedent=avant.map(x=>x.id).reverse();const apres=mgmtGuerreClassement(m).find(x=>x.estSplit);return JSON.stringify({rang:apres.rang,mouvement:apres.mouvement,duel:apres.duelSplit});})()`));
    assert.equal(result.mouvement, 8 - result.rang - (result.rang - 1));
    assert.ok(result.duel);
    assert.ok(Number.isInteger(result.duel.mouvement));
  }finally{w.close();}
});

test('Monde lot 57 T1 — l’écran relie la rivale, les raisons et les duels sans injection',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt; m.guerre={ev:[],rival:null,depuis:0}; const rows=mgmtGuerreClassement(m),id=rows.find(x=>!x.estSplit).id; m.guerre.ev=[{c:m.cycle,o:id,t:'pique',x:null,p:8}]; mgmtRivaleMettreAJour(m); const html=scr_mgmt_guerre(); return JSON.stringify({html,screen:SCREENS.mgmt_guerre()});})()`));
    assert.match(result.html,/LE CLASSEMENT DES HUIT/);
     assert.match(result.html,/TA RIVALE DU MOMENT/);
     assert.match(result.html,/Juste devant/);
     assert.match(result.html,/Depuis la dernière soirée/);
     assert.ok(w.eval(`(()=>{const x=mgmtGuerreClassement(G.mgmt).find(y=>y.estSplit); return typeof x.mouvement==='number';})()`));
    assert.equal(result.html,result.screen);
    assert.match(result.html,/&lt;|SPLIT/);
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    const classes=[...new Set([...result.html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('gu3')))];
    for(const c of classes) assert.match(css,new RegExp('\\.'+c+'(?:[ .:{,#]|\\s*\\{)'));
  }finally{w.close();}
});
