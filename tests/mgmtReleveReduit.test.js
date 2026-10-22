"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

/* ==== [ANCRE: TESTS_MONDE_LOT31_T2_RELEVE_REDUIT] — Monde lot 31 T2 ==== */
test('Monde lot 31 T2 — le relevé réduit condense les deux coins',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtDefault('split');mgmtNewRoster(m);G={theme:'dark',mgmt:m};return m.roster.slice(0,20).map((a,i)=>{const b=m.roster[(i+1)%m.roster.length],x=simulateFight(mgmtFightReady(a,m.cycle),mgmtFightReady(b,m.cycle),3),s=mgmtReleveDeResultat(x,3),z=mgmtReleveReduit(s);return {s,z};});})())`));
  for(const {s,z} of r){assert.equal(w.eval(`mgmtReleveValide(${JSON.stringify(z)})`),true);for(let c=0;c<2;c++){assert.equal(z.c[c].length,17);assert.equal(z.c[c][0],s.r.reduce((n,row)=>n+row[c*14],0));assert.ok(z.c[c][7]+z.c[c][8]+z.c[c][9]<=z.c[c][0]+1);}assert.equal(w.eval(`mgmtReleveCoin(${JSON.stringify(z)},'A').headAtt`),null);}
  assert.equal(w.eval(`mgmtReleveValide({d:1,r:[],e:[],c:[]})`),false);
});

test('Monde lot 31 T2 — le passé conserve le relevé réduit, les combats joueurs le complet',()=>{
  const w=newGameWindow({runMain:true});
  const x=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:6});G={theme:'dark',mgmt:m};const n=m.hist.length;mgmtRunEvent(m);return {past:m.hist.slice(0,m.passe.nHist).every(t=>mgmtReleveValide(t.s)&&Array.isArray(t.s.c)&&t.s.c.every(c=>c.length===17)),fresh:m.hist.slice(n).filter(t=>t.s).every(t=>mgmtReleveValide(t.s)&&Array.isArray(t.s.r))};})())`));
  assert.equal(x.past,true);assert.equal(x.fresh,true);
});

test('Monde lot 31 T2 — archive claire et compacte préservent les relevés',()=>{
  const w=newGameWindow({runMain:true});
  const x=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:4}),before=m.hist.map(t=>t.s),d=mgmtSerialiser(m),l=mgmtParseAndValidate(d),a=JSON.parse(d);return {same:!!l&&JSON.stringify(before)===JSON.stringify(l.hist.map(t=>t.s)),seventeen:a.passe.archive.h.every(r=>r.length===17),old:(()=>{a.passe.archive.h=a.passe.archive.h.map(r=>r.slice(0,16));const q=mgmtParseAndValidate(JSON.stringify(a));return !!q&&q.hist.slice(0,q.passe.nHist).every(t=>t.s===undefined);})()};})())`));
  assert.deepEqual(x,{same:true,seventeen:true,old:true});
});

test('Monde lot 31 T2 — monde vivant réécrit tous ses relevés réduits',()=>{
  const w=newGameWindow({runMain:true});
  const ok=w.eval(`(()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:4});mgmtMondeVivantGenerer(m,{soirees:4});const l=mgmtParseAndValidate(mgmtSerialiser(m));return !!l&&Object.values(l.orgs).every(o=>o.hist.every(t=>mgmtReleveValide(t.s)&&!!t.s.c));})()`);
  assert.equal(ok,true);
});

test('Monde lot 31 T2 — le poids de référence reste sous le plafond',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:62});mgmtMondeVivantGenerer(m,{soirees:62});const n=m.hist.slice(0,m.passe.nHist).filter(t=>t.s).map(t=>JSON.stringify(t.s).length);return {bytes:mgmtSerialiser(m).length,mean:n.reduce((a,b)=>a+b,0)/n.length};})())`));
  console.log('Mesure partie neuve et relevé réduit:',JSON.stringify(r));
  assert.ok(r.bytes<=1900000);assert.ok(r.mean<=100);
});

test('Monde lot 31 T2 — une sauvegarde ancienne sans relevé reste chargeable et jouable',()=>{
  const w=newGameWindow({runMain:true});
  const ok=w.eval(`(()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:2});m.hist.forEach(t=>delete t.s);const l=mgmtParseAndValidate(JSON.stringify(m));G.mgmt=l;return !!l&&mgmtPredecesseurSoiree(l,0).jouee;})()`);
  assert.equal(ok,true);
});
