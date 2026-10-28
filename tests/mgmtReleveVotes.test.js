"use strict";
/* ==== [ANCRE: TEST_RELEVE_VOTES_ORIGINAUX_20261028] — Demande d’Anthony ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('Votes — décisions trois et cinq rounds, retraits de points, réduction et refus de cartes incohérentes',()=>{
 const w=newGameWindow({runMain:true});try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
   const out=[];for(const n of [3,5]){
    const roundStats=Array.from({length:n},(_,i)=>({r:i+1,j1:i===0?[6,10]:[10,9],j2:[9,10],j3:[10,10]}));
    const judges=Object.fromEntries(['j1','j2','j3'].map(k=>[k,[0,1].map(c=>roundStats.reduce((s,r)=>s+r[k][c],0))]));
    const res={method:'Nul majoritaire',roundStats,judges},seed=SEED,s=mgmtReleveDeResultat(res,n),z=mgmtReleveReduit(s),votes=mgmtReleveVotes(s),avant=JSON.stringify(s);
    res.roundStats[0].j1[0]=10;
    const incoherent=mgmtReleveDeResultat(res,n);res.method='KO';
    const ko=mgmtReleveDeResultat(res,n);
    out.push({n,s,z,votes,incoherent,ko,pur:JSON.stringify(s)===avant&&SEED===seed,valid:mgmtReleveValide(s)&&mgmtReleveValide(z)});
   }return out;
  })())`));
  for(const x of r){assert.equal(x.votes.length,x.n);assert.deepEqual(x.votes[0],[6,10,9,10,10,10]);assert.equal(x.s.j.length,x.n*3+1);assert.equal(x.z.j,x.s.j);assert.ok(x.pur&&x.valid);assert.equal(x.incoherent.j,undefined);assert.equal(x.ko.j,undefined);}
  assert.equal(w.eval(`mgmtReleveVotesOriginaux({method:'Décision',roundStats:[null]},1)`),null);
  for(const j of [null,'','poo','poooZ','pppp','p'+'ooo'.repeat(6)])assert.equal(w.eval(`mgmtReleveValide({d:1,c:[Array(17).fill(0),Array(17).fill(0)],j:${JSON.stringify(j)}})`),false);
 }finally{w.close();}
});
test('Votes — sauvegarde et chargement préservent les cartes ; une carte corrompue ne détruit pas les statistiques',()=>{
 const w=newGameWindow({runMain:true});try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:2});G.mgmt=m;mgmtRunEvent(m);
   const i=m.hist.findIndex(t=>t.s?.j);if(i<0)throw Error('Décision réelle absente');const avant=JSON.stringify(m.hist[i].s);
   const relu=mgmtParseAndValidate(mgmtSerialiser(m)),copie=JSON.parse(JSON.stringify(m));copie.hist[i].s.j='corrompu';
   const repare=mgmtRepair(copie),stat=repare.hist[i].s;
   return {same:!!relu&&JSON.stringify(relu.hist[i].s)===avant,stat:!!stat&&mgmtReleveValide(stat),votes:stat&&Object.hasOwn(stat,'j')};})())`));
  assert.deepEqual(r,{same:true,stat:true,votes:false});
 }finally{w.close();}
});
