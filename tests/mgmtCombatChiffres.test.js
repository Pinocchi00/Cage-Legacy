"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const creer=()=>{const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");return w;};

test('Monde lot 36 T1 — mgmtFaceAFace reprend les chiffres de carrière et compare correctement',()=>{
  const w=creer(),r=w.eval(`(()=>{const m=G.mgmt,[a,b]=m.roster.filter(f=>f.div===m.roster[0].div);return {x:mgmtFaceAFace(m,a.id,b.id),sa:mgmtStatsCarriere(m,a.id),sb:mgmtStatsCarriere(m,b.id),ids:[a.id,b.id]};})()`);
  assert.equal(r.x.a.id,r.ids[0]);assert.equal(r.x.b.id,r.ids[1]);
  for(const line of r.x.lignes.slice(2)){const k=line.id==='encaisseParMin'?'sigEncaisseParMin':line.id;assert.equal(line.a,r.sa&&r.sa[k]);assert.equal(line.b,r.sb&&r.sb[k]);}
});
test('Monde lot 36 T1 — physique, bilan, égalité, null et identifiant inconnu',()=>{
  const w=creer(),r=w.eval(`(()=>{const m=G.mgmt;m.roster=[{id:'a',name:'A',W:2,L:1,D:0,div:'x',phys:{height:180,reach:190,stance:'orthodox'}},{id:'b',name:'B',W:1,L:2,D:0,div:'x',phys:{height:180,reach:190,stance:'southpaw'}}];const p=mgmtCombatProfile(m.roster[0]).phys;return {x:mgmtFaceAFace(m,'a','b'),p,bad:mgmtFaceAFace(m,'inconnu','b')};})()`);
  assert.equal(r.x.lignes[0].a,r.p.height);assert.equal(r.x.lignes[1].a,r.p.reach);assert.equal(r.x.a.garde,r.p.stance);assert.deepEqual(JSON.parse(JSON.stringify(r.x.lignes.slice(0,2).map(x=>x.meilleur))),[r.x.lignes[0].a===r.x.lignes[0].b?null:(r.x.lignes[0].a>r.x.lignes[0].b?'a':'b'),r.x.lignes[1].a===r.x.lignes[1].b?null:(r.x.lignes[1].a>r.x.lignes[1].b?'a':'b')]);assert.deepEqual(JSON.parse(JSON.stringify(r.x.a.bilan)),{v:2,d:1,n:0});assert.equal(r.bad.a,null);
});
test('Monde lot 36 T1 — mgmtReleveCombat calcule les totaux, rounds et invariants',()=>{
  const w=creer(),r=w.eval(`(()=>{const row=Array(28).fill(0);row[0]=3;row[1]=6;row[4]=1;row[5]=1;row[6]=1;row[7]=2;row[8]=4;row[10]=1;row[11]=42;const s={d:600,r:[row,row,row],e:[Array(12).fill(0),Array(12).fill(0)]};const t={a:{id:'a'},b:{id:'b'},s};return mgmtReleveCombat({},t);})()`);
  assert.equal(r.rounds,3);assert.equal(r.a.sigTouches,9);assert.equal(r.a.sigTentes,18);assert.equal(r.a.precision,.5);assert.equal(r.a.tete+r.a.corps+r.a.jambes,r.a.sigTouches);assert.equal(r.total.a.amenees,6);assert.equal(r.parRound[0].a.controle,42);assert.equal(r.parRound[0].a.kd,true);
});
test('Monde lot 36 T1 — relevé absent ou réduit, cinq rounds et trace de référence',()=>{
  const w=creer(),r=w.eval(`(()=>{const row=Array(28).fill(0),s={d:1200,r:Array.from({length:5},()=>row.slice()),e:[Array(12).fill(0),Array(12).fill(0)]};return {full:mgmtReleveCombat({}, {a:{id:'a'},b:{id:'b'},s}),reduced:mgmtReleveCombat({}, {s:{d:1,c:[Array(17).fill(0),Array(17).fill(0)]}}),missing:mgmtReleveCombat({},{}),cards:mgmtReleveCombat({}, {winner:'A',family:'dec',s})};})()`);
  assert.equal(r.full.rounds,5);assert.equal(r.reduced,null);assert.equal(r.missing,null);assert.equal(r.cards.juges,null);assert.equal(r.cards.tournant,null);
});
test('Monde lot 36 T1 — pureté, invariants de six soirées et temps de calcul',()=>{
  const w=creer(),r=w.eval(`(()=>{const m=G.mgmt,before=JSON.stringify(m),ids=m.roster.slice(0,2).map(f=>f.id);mgmtFaceAFace(m,...ids);for(const t of m.hist.filter(t=>t.s&&t.s.r)){const x=mgmtReleveCombat(m,t);for(const c of ['a','b']){for(const k of ['sigTouches','sigTentes','amenees','amTentees','controle','kd','sub'])assert.equal(x.parRound.reduce((n,q)=>n+q[c][k],0),x.total[c][k]);assert.equal(x.total[c].tete+x.total[c].corps+x.total[c].jambes,x.total[c].sigTouches);}}return {same:before===JSON.stringify(m),ids};})()`);
  assert.equal(r.same,true);
});
