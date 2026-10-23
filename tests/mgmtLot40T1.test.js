"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow,readScriptOrder}=require('./helpers/loadGame');
function result(w,code){return JSON.parse(w.eval(`JSON.stringify((()=>{${code}})())`));}

test('Monde lot 40 T1 — les parties anciennes conservent leur identité et les banques sont complètes',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault();mgmtNewRoster(m);const avant=m.roster.slice(0,8).map(f=>mgmtIdentiteSurnom(m,f));
      const nouveaux=Object.values(MGMT_SURNOMS_GAGNES).every(x=>['fr','en'].every(l=>x.noms[l].length>=8&&x.noms[l].every(n=>n.length<=24)&&new Set(x.noms[l]).size===x.noms[l].length));
      const textes=x=>Array.isArray(x)?x.flatMap(textes):x&&typeof x==='object'?Object.values(x).flatMap(textes):typeof x==='string'?[x]:[];
      const aucuneCollision=Object.values(MGMT_SURNOMS_GAGNES).every(x=>['fr','en'].every(l=>x.noms[l].every(n=>!textes(MGMT_SURNOMS[l]).includes(n))));
      return {avant,nouveaux,aucuneCollision};`);
    const order=readScriptOrder();
    assert.deepEqual(r.avant,["L'Ardoise",'Nightshift','Ironclad','Le Béton',"L'Ours",'Jacaré','The Welder','Coup-de-Grisou']);
    assert.ok(r.nouveaux&&r.aucuneCollision&&order.indexOf('mgmt-surnoms-gagnes.js')>order.indexOf('mgmt-humanite.js'));
  }finally{w.close();}
});

test('Monde lot 40 T1 — drapeau facultatif, tirage de naissance et réparation ciblée',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault();mgmtNewRoster(m);m.surnomsGagnes=true;const fs=m.roster.concat(m.exterieur||[]);
      const v=fs.map(f=>mgmtIdentiteSurnom(m,f));const par=new Map();for(const f of fs){if(!par.has(f.div))par.set(f.div,mgmtIdentiteSurnomsDe(m,f.div));}
      const vide=v.filter(x=>!x).length;const a=mgmtDefault();a.surnomsGagnes=true;a.surnoms={bad:{n:'x',s:-1,t:'bad'}};mgmtRepair(a);
      return {total:fs.length,vide,hasOwn:!Object.prototype.hasOwnProperty.call(mgmtRepair(mgmtDefault()),'surnoms'),repair:!a.surnoms||!a.surnoms.bad};`);
    assert.ok(r.vide/r.total>=0.4&&r.vide/r.total<=0.6);assert.ok(r.hasOwn&&r.repair);
  }finally{w.close();}
});

test('Monde lot 40 T1 — calcul du surnom KO, fait et source de presse',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();mgmtNewRoster(m);m.surnomsGagnes=true;m.cycle=7;m.eventsPlayed=7;const f=m.roster[0],adv=m.roster[1];
      m.hist=[];for(let i=0;i<3;i++)m.hist.push({c:m.cycle,a:{id:f.id},b:{id:adv.id},winner:'A',family:'ko',round:1});
      const ancien=mgmtSurnomsGagnesEvaluer({...m,surnomsGagnes:false});const donne=mgmtSurnomsGagnesEvaluer(m);
      return {ancien,donne,entry:m.surnoms[f.id],fact:m.facts.some(x=>x.k==='surnom'&&x.a===f.id),valid:mgmtSurnomsGagnesValide(m.surnoms)};`);
    assert.deepEqual(r.ancien,[]);assert.equal(r.donne.length,1);assert.equal(r.entry.t,'ko');assert.ok(r.fact&&r.valid);
  }finally{w.close();}
});

test('Monde lot 40 T1 — banques, ancienneté, unicité et créations déterministes',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault();mgmtNewRoster(m);m.surnomsGagnes=true;
      const categories=[...new Set(m.roster.map(f=>f.div))];const uniques=categories.every(d=>{const noms=[...mgmtIdentiteSurnomsDe(m,d).values()].filter(Boolean);return new Set(noms).size===noms.length;});
      const neuf=mgmtDefault();mgmtNewRoster(neuf);return {neuve:m.surnomsGagnes,ancien:mgmtIdentiteSurnom(neuf,m.roster[0]),uniques};`);
    assert.equal(r.neuve,true);assert.equal(typeof r.ancien,'string');assert.ok(r.uniques);
  }finally{w.close();}
});

test('Monde lot 40 T1 — deux finitions au premier round et quotas par soirée/saison',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`function fixture(cycle){setSeed(4401);const m=mgmtDefault();mgmtNewRoster(m);m.surnomsGagnes=true;m.cycle=cycle;m.eventsPlayed=cycle;const f=m.roster[0],adv=m.roster[1];
      m.hist=[{c:cycle-1,a:{id:f.id},b:{id:adv.id},winner:'A',family:'ko',round:1},{c:cycle,a:{id:f.id},b:{id:adv.id},winner:'A',family:'sub',round:1}];return {m,f};}
      const {m,f}=fixture(2);const copy=JSON.parse(JSON.stringify(m));const a=mgmtSurnomsGagnesEvaluer(m),b=mgmtSurnomsGagnesEvaluer(copy);
      const quota=fixture(5).m;quota.surnoms=Object.fromEntries(Array.from({length:4},(_,i)=>['x'+i,{n:'Nom '+i,s:5,t:'ko'}]));
      return {type:m.surnoms[f.id]?.t,deterministe:a[0]?.nom===b[0]?.nom,quota:mgmtSurnomsGagnesEvaluer(quota).length,valid:mgmtSurnomsGagnesValide({x:{n:'<img onerror>',s:0,t:'ko'}})};`);
    assert.equal(r.type,'eclair');assert.ok(r.deterministe);assert.equal(r.quota,0);assert.ok(r.valid);
  }finally{w.close();}
});

test('Monde lot 40 T1 — déclencheur guerre exige un relevé de cinq rounds',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault();mgmtNewRoster(m);m.surnomsGagnes=true;m.cycle=1;m.eventsPlayed=1;const f=m.roster[0],adv=m.roster[1];
      const releve={d:1500,c:[Array(17).fill(0),Array(17).fill(0)]};releve.c[0][14]=2;
      m.hist=[{c:1,a:{id:f.id},b:{id:adv.id},winner:'A',family:'dec',round:5,rounds:5,s:releve}];const donne=mgmtSurnomsGagnesEvaluer(m);
      return {donne:donne.length,type:m.surnoms?.[f.id]?.t};`);
    assert.equal(r.type,'guerre');assert.equal(r.donne,1);
  }finally{w.close();}
});
