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
    const res={method:'Nul majoritaire',roundStats,judges},seed=SEED,s=mgmtReleveDeResultat(res,n),sansVotes=mgmtReleveDeResultat(res,n,false),z=mgmtReleveReduit(s),votes=mgmtReleveVotes(s),avant=JSON.stringify(s);
    res.roundStats[0].j1[0]=10;
    const incoherent=mgmtReleveDeResultat(res,n);res.method='KO';
    const ko=mgmtReleveDeResultat(res,n);
    out.push({n,s,sansVotes,z,votes,incoherent,ko,pur:JSON.stringify(s)===avant&&SEED===seed,valid:mgmtReleveValide(s)&&mgmtReleveValide(z)});
   }return out;
  })())`));
  for(const x of r){assert.equal(x.votes.length,x.n);assert.deepEqual(x.votes[0],[6,10,9,10,10,10]);assert.equal(x.s.j.length,x.n*3+1);assert.equal(x.z.j,x.s.j);assert.ok(x.pur&&x.valid);assert.equal(x.incoherent.j,undefined);assert.equal(x.ko.j,undefined);const {j,...stat}=x.s;assert.ok(j);assert.deepEqual(x.sansVotes,stat);}
  assert.equal(w.eval(`mgmtReleveVotesOriginaux({method:'Décision',roundStats:[null]},1)`),null);
  for(const j of [null,'','poo','poooZ','pppp','p'+'ooo'.repeat(6)])assert.equal(w.eval(`mgmtReleveValide({d:1,c:[Array(17).fill(0),Array(17).fill(0)],j:${JSON.stringify(j)}})`),false);
 }finally{w.close();}
});
test('Votes — sauvegarde et chargement préservent les cartes ; une carte corrompue ne détruit pas les statistiques',()=>{
 const w=newGameWindow({runMain:true});try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const passe=mgmtPasseGenerer('split',{soirees:2}),passeSansVotes=passe.hist.every(t=>!t.s||!Object.hasOwn(t.s,'j'));
   setSeed(20260925);const m=mgmtDefaultAvantH4();mgmtNewRoster(m);G.mgmt=m;
   mgmtNewPile(m);m.card.main=[];const dispo=m.roster.filter(f=>mgmtAvailable(m,f)&&!mgmtEngaged(m,f));if(dispo.length<10)throw Error('Effectif disponible insuffisant');
   for(let i=0;i<5;i++)m.card.main.push({a:dispo[i*2].id,b:dispo[i*2+1].id,cycle:m.cycle,slot:'main'});
   m.pile=[];m.open=null;if(mgmtClosePile(m)!=='refill')throw Error('Préliminaires absents');const bulk=m.pile.find(p=>p.kind==='leila_bulk'&&p.status==='open');
   if(!bulk||!mgmtDecide(m,bulk.id,'validate')||!mgmtRunEvent(m))throw Error('La soirée réelle doit être jouée');
   const i=m.hist.findIndex(t=>t.s?.j);if(i<0)throw Error('Décision réelle absente');const avant=JSON.stringify(m.hist[i].s);
   const relu=mgmtParseAndValidate(mgmtSerialiser(m)),copie=JSON.parse(JSON.stringify(m));copie.hist[i].s.j='corrompu';
   const repare=mgmtRepair(copie),stat=repare.hist[i].s;
   return {passeSansVotes,same:!!relu&&JSON.stringify(relu.hist[i].s)===avant,stat:!!stat&&mgmtReleveValide(stat),votes:stat&&Object.hasOwn(stat,'j')};})())`));
  assert.deepEqual(r,{passeSansVotes:true,same:true,stat:true,votes:false});
 }finally{w.close();}
});
