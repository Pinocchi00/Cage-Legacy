"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

function evalJSON(w,source){ return JSON.parse(w.eval(`JSON.stringify((()=>{${source}})())`)); }

test('Monde lot 31 T1 — forme, arrondis et coin du relevé',()=>{
  const w=newGameWindow({runMain:true});
  const result=evalJSON(w,`const res={round:1,finishTime:42,roundStats:[{sigA:2.4,ctrlSecA:3.6,pwrB:4}],stats:{A:{headAtt:2,distStrikes:3},B:{}}};const s=mgmtReleveDeResultat(res,3);return {s,valid:mgmtReleveValide(s),a:mgmtReleveCoin(s,'A')};`);
  assert.equal(result.valid,true);assert.equal(result.s.d,42);assert.equal(result.s.r.length,1);assert.equal(result.s.r[0][0],2);assert.equal(result.s.r[0][11],4);assert.equal(result.s.r[0][27],4);assert.equal(result.a.headAtt,2);assert.equal(result.a.sig,2);
  const bad=JSON.parse(JSON.stringify(result.s));bad.r[0].pop();assert.equal(w.eval(`mgmtReleveValide(${JSON.stringify(bad)})`),false);
});

test('Monde lot 31 T1 — 40 combats réels, nombre de rounds, cohérence et poids',()=>{
  const w=newGameWindow({runMain:true});
  const r=evalJSON(w,`setSeed(20261008); const m=mgmtDefault('split'); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; const out=[]; for(let i=0;i<40;i++){ const n=i%2?5:3, a=m.roster[i%m.roster.length], b=m.roster[(i+1)%m.roster.length]; const res=simulateFight(mgmtFightReady(a,m.cycle),mgmtFightReady(b,m.cycle),n), s=mgmtReleveDeResultat(res,n); out.push({s,round:res.round,stats:res.stats,roundStats:res.roundStats,method:res.method,n}); } return out;`);
  let mean=0,max=0; const diffs={sig:0,td:0,kd:0,subAtt:0};
  for(const {s,round,stats,roundStats,n} of r){
    assert.equal(w.eval(`mgmtReleveValide(${JSON.stringify(s)})`),true);
    assert.equal(s.r.length,round||n,'arrêts et décisions doivent compter le round réellement joué');
    assert.ok(s.d>=1&&s.d<=n*300);
    for(let i=0;i<s.r.length;i++) for(let c=0;c<2;c++){
      const row=s.r[i],o=c*14;
      assert.ok(row[o+4]+row[o+5]+row[o+6]<=row[o]+1);
      for(const [key,ix,statKey] of [['sig',0,'sig'],['td',7,'td'],['kd',10,'kd'],['subAtt',12,'subAtt']]){
        const actual=row[o+ix], expected=Number(roundStats[i]?.[statKey+(c?'B':'A')]||0);
        diffs[key]=Math.max(diffs[key],Math.abs(actual-expected));
        assert.ok(Math.abs(actual-expected)<=1,`${key} round ${i+1}, coin ${c?'B':'A'}: ${actual} vs ${expected}`);
      }
    }
    const bytes=Buffer.byteLength(JSON.stringify(s)); mean+=bytes;max=Math.max(max,bytes);
  }
  mean/=r.length;
  assert.ok(mean>0); assert.ok(max>=mean); assert.ok(mean<=280,`poids moyen ${mean}`); assert.ok(max<=450,`poids maximal ${max}`);
  console.log('Mesures relevé:',JSON.stringify({ecartsMax:diffs,poidsMoyen:mean,poidsMax:max}));
});

test('Monde lot 31 T1 — le relevé ne consomme pas la RNG',()=>{
  const w=newGameWindow({runMain:true});
  const x=evalJSON(w,`const duel=()=>{setSeed(6671);const m=mgmtDefault('split');mgmtNewRoster(m);const res=simulateFight(mgmtFightReady(m.roster[0],m.cycle),mgmtFightReady(m.roster[1],m.cycle),3);return {winner:res.winner,method:res.method,round:res.round};};const a=duel(),seedA=SEED,b=(()=>{setSeed(6671);const m=mgmtDefault('split');mgmtNewRoster(m);const res=simulateFight(mgmtFightReady(m.roster[0],m.cycle),mgmtFightReady(m.roster[1],m.cycle),3);mgmtReleveDeResultat(res,3);return {winner:res.winner,method:res.method,round:res.round};})(),seedB=SEED;return {a,b,seedA,seedB};`);
  assert.deepEqual(x.a,x.b);assert.equal(x.seedA,x.seedB);
});

test('Monde lot 31 T1 — soirée, rejeu, sauvegarde et anciennes parties',()=>{
  const w=newGameWindow({runMain:true});
  const x=evalJSON(w,`setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:2});G={theme:'dark',mgmt:m};const before=m.hist.length;mgmtRunEvent(m);const fresh=m.hist.slice(before).filter(t=>t.s);const copy=JSON.parse(JSON.stringify(m));const bad=copy.hist.find(t=>t.s);if(bad)bad.s.r[0].pop();const repaired=mgmtParseAndValidate(JSON.stringify(copy));const serial=mgmtParseAndValidate(mgmtSerialiser(m));const old=JSON.parse(JSON.stringify(m));old.hist.forEach(t=>delete t.s);const loaded=mgmtParseAndValidate(JSON.stringify(old));setSeed(20261008);const past=mgmtPasseGenerer('split',{soirees:6});return {fresh:fresh.length,valid:fresh.every(t=>mgmtReleveValide(t.s)),rounds:fresh.map(t=>t.s.r.length),serial:!!serial&&fresh.every(t=>JSON.stringify(t.s)===JSON.stringify(serial.hist.find(q=>q.seed===t.seed&&q.a===t.a&&q.b===t.b)?.s)),badRemoved:!!repaired&&repaired.hist.filter(t=>t.a===bad?.a&&t.b===bad?.b).every(t=>!t.s),oldLoaded:!!loaded,pastHas:past.hist.some(t=>Object.hasOwn(t,'s'))};`);
  assert.ok(x.valid);assert.ok(x.rounds.every(n=>n>=1&&n<=5));assert.ok(x.serial);assert.ok(x.badRemoved);assert.ok(x.oldLoaded);assert.equal(x.pastHas,false);
});
