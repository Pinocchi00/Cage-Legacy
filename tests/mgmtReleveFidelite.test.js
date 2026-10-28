"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const preparer=()=>{
 const w=newGameWindow({runMain:true});
 w.eval(`setSeed(20261008);CL.mgmtEnter(1);window.scenarioReleve=(n,winner)=>{
  const row=Array(28).fill(0);row[0]=3;row[1]=6;row[4]=3;row[11]=42;row[14]=8;row[15]=10;row[18]=8;row[21]=2;row[22]=3;row[25]=65;
  const a={id:'a',name:'Alice Alpha',last:'Alpha',div:G.mgmt.roster[0].div},b={id:'b',name:'Bob Bravo',last:'Bravo',div:a.div};
  const t={a,b,winner,family:'dec',round:n,rounds:n,s:{d:n*300,r:Array.from({length:n},()=>row.slice()),e:[Array(12).fill(0),Array(12).fill(0)]}};
  return {t,d:{nul:winner==='D',gagnant:winner==='B'?b:a,perdant:winner==='B'?a:b,family:'dec',rounds:n,cat:a.div},s:{n:1}};
 };`);
 return w;
};
test('Relevé — gagnant B : noms, totaux et graphiques restent du même côté ; aucune simulation de rendu',()=>{
 const w=preparer();try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const {t,d,s}=scenarioReleve(3,'B'),avant=JSON.stringify(G.mgmt),seed=SEED;mgmtReplayFight=()=>{throw new Error('Rejeu interdit au rendu');};const html=mgmtSuReleveHtml(G.mgmt,t,d,s);return {html,pur:avant===JSON.stringify(G.mgmt)&&seed===SEED};})())`));
  const p=w.document.createElement('div');p.innerHTML=r.html;
  assert.equal(p.querySelector('.mf-rl-noms strong').textContent,'Bravo');
  assert.equal(p.querySelector('.mf-rl-total strong').textContent,'24 / 30');
  assert.equal(p.querySelector('.mf-rl-total strong:last-child').textContent,'9 / 18');
  const c=p.querySelector('.mf-rl-col');assert.equal(c.querySelector('b').textContent,'8');assert.equal(c.querySelector('span').textContent,'Bravo');
  assert.equal(p.querySelectorAll('.mf-rl-round').length,3);assert.equal(p.querySelectorAll('.mf-rl-juges b').length,9);
  assert.ok([...p.querySelectorAll('.mf-rl-juges b')].every(x=>x.textContent==='—'));
  assert.match(p.textContent,/Votes des juges et moments clés non conservés/);assert.equal(r.pur,true);
 }finally{w.close();}
});
test('Relevé — un et cinq rounds, nul, archive sans chiffres et noms hostiles restent honnêtes',()=>{
 const w=preparer();try{
  for(const n of [1,5]){
   const html=w.eval(`(()=>{const {t,d,s}=scenarioReleve(${n},'D');t.a.last='<img onerror=alert(1)>';return mgmtSuReleveHtml(G.mgmt,t,d,s);})()`);
   const p=w.document.createElement('div');p.innerHTML=html;assert.equal(p.querySelectorAll('.mf-rl-round').length,n);
   assert.equal(p.querySelector('.mf-rl-noms span').textContent,'ET');assert.equal(p.querySelectorAll('.coin-b').length,0);assert.equal(p.querySelectorAll('img').length,0);assert.match(html,/&lt;img/);
  }
  const sans=w.eval(`(()=>{const {t,d,s}=scenarioReleve(1,'A');delete t.s;return mgmtSuReleveHtml(G.mgmt,t,d,s);})()`);
  assert.match(sans,/RELEVÉ INDISPONIBLE/);assert.doesNotMatch(sans,/mf-rl-round"|LES TROIS JUGES/);
 }finally{w.close();}
});
test('Relevé — porte C et retour Échap conservent le combat et la soirée choisis',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:3});CL.mgmtEnter(1);CL.mgmtSuResultatDe(2);window.selectionReleve=JSON.stringify([MGMT_SU_RE.s,MGMT_SU_RE.i]);keysHandle({key:'C',preventDefault(){}});`);
  assert.equal(w.eval('G.screen'),'mgmt_releve');assert.ok(w.document.querySelector('.mf-rl'));
  w.eval(`keysHandle({key:'Escape',preventDefault(){}})`);assert.equal(w.eval('G.screen'),'mgmt_resultats');
  assert.equal(w.eval('JSON.stringify([MGMT_SU_RE.s,MGMT_SU_RE.i])'),w.selectionReleve);
 }finally{w.close();}
});
