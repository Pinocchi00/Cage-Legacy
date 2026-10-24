"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 54 T1 — la partie réelle classe la surprise majeure avant les autres histoires',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const m=G.mgmt;return {stories:mgmtHistoiresSoiree(m,m.eventsPlayed),hasEvent:!!m.lastEvent&&m.lastEvent.fights.length>0};})()`);
    assert.equal(r.hasEvent,true);
    assert.ok(Array.isArray(r.stories));
    assert.equal(r.stories.length>0,true);
    assert.ok(r.stories.every((x,i)=>i===0||r.stories[i-1].poids>=x.poids));
  }finally{w.close();}
});

test('Monde lot 54 T1 — brief du 22/10, P8 : la victoire d’un 13-1 sur le n°1 ouvre le lendemain',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const r=w.eval(`(()=>{
      const m=G.mgmt, div=m.roster.find(f=>f&&f.div).div;
      const top=mgmtDivisionRanking(m,div,'world')[0];
      const f=m.roster.find(x=>x&&x.id===top.id), other=m.roster.find(x=>x&&x.id!==f.id&&x.div===div);
      if(!other) return {missing:true};
      f.W=13;f.L=1;f.D=0;other.W=20;other.L=1;other.D=0;
      const side=x=>({id:x.id,name:x.name,first:x.first,last:x.last,div:x.div,age:x.age,W:x.W,L:x.L,D:x.D});
      const cycle=m.cycle, fight={c:cycle,slot:'main',rounds:3,seed:0,round:3,winner:'A',family:'dec',
        a:side(f),b:side(other),s:{d:900,c:[]}};
      m.hist.push(fight);m.lastEvent={cycle,fights:[{a:f.id,b:other.id,winner:'A',family:'dec'}],touched:[],finance:{spectateurs:0,recette:0}};
      const stories=mgmtHistoiresSoiree(m,m.eventsPlayed), press=mgmtMediasLendemain(m), moments=mgmtLendemainMomentsHtml(m);
      return {top:top.id,first:stories[0]&&stories[0].type,winner:stories[0]&&stories[0].a,
        press:press[0]&&press[0].texte,moments};
    })()`);
    assert.notEqual(r.missing,true,'la partie générée contient deux combattants dans la division');
    assert.equal(r.first,'surprise');
    assert.equal(r.winner,r.top);
    assert.ok(r.press,'la presse du lendemain produit un premier titre');
    assert.match(r.moments,/ld3-moment/);
    assert.match(r.moments,/Revoir/);
  }finally{w.close();}
});

test('Monde lot 54 T1 — D1 : une défaite réduit le score de classement (correction déjà présente, audit du 16/10)',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{
      const loser={id:'d1-loser',W:13,L:2,D:0,lastCycle:1};
      const other={id:'d1-other',W:13,L:1,D:0,lastCycle:1};
      const m={cycle:2,hist:[{c:1,a:{id:loser.id,W:13,L:1},b:{id:other.id,W:13,L:1},winner:'B'}]};
      const scores=mgmtRangScores(m,[loser,other],2);
      return {loser:scores.get(loser.id),other:scores.get(other.id)};
    })()`);
    assert.ok(r.loser<r.other,JSON.stringify(r));
  }finally{w.close();}
});

test('Monde lot 54 T1 — le lendemain assemble primes, discours facultatif et suivis/espoirs',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const r=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],i=m.hist.length,side=x=>({id:x.id,name:x.name,first:x.first,last:x.last,div:x.div,W:x.W,L:x.L,D:x.D});m.suivis=[f.id];m.espoirs=[f.id];m.hist.push({c:m.cycle,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(m.roster.find(x=>x.id!==f.id))});const t=m.hist[i];m.lastEvent={cycle:m.cycle,fights:[{a:t.a.id,b:t.b.id,winner:'A',family:'dec'}],finance:{spectateurs:0,recette:0}};m.facts.push({c:m.cycle,k:'prime',a:f.id,fight:i,type:'pf',m:1200});return {prime:mgmtLendemainPrimesHtml(m),attention:mgmtLendemainAttentionHtml(m),discours:mgmtLendemainDiscoursHtml(m)};})()`);
    assert.match(r.prime,/PERFORMANCE DE LA SOIRÉE/);
    assert.match(r.prime,/1\s*200/);
    assert.match(r.attention,/Ton espoir/);
    assert.equal(r.discours,'');
  }finally{w.close();}
});

test('Monde lot 54 T1 — la presse suit le poids des histoires et les chiffres utilisent les données de clôture',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const r=w.eval(`(()=>{const m=G.mgmt, f=m.roster[0],g=m.roster.find(x=>x.id!==f.id),side=x=>({id:x.id,name:x.name,last:x.last,first:x.first,div:x.div,W:x.W,L:x.L,D:x.D});m.treasury=230;m.hist.push({c:m.cycle,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(g)});m.lastEvent={cycle:m.cycle,fights:[{a:f.id,b:g.id,winner:'A',family:'dec'}],finance:{spectateurs:1234,recette:250000}};return {press:mgmtLendemainPresseHtml(m),figures:mgmtLendemainChiffresHtml(m)};})()`);
    assert.match(r.press,/ld3-press/);
    assert.match(r.figures,/SALLE/);
    assert.match(r.figures,/CAISSE/);
  }finally{w.close();}
});
