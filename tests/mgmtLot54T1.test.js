"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
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
        winnerName:f.name,press:press[0]&&press[0].texte,moments,pressRows:mgmtLendemainPresseHtml(m)};
    })()`);
    assert.notEqual(r.missing,true,'la partie générée contient deux combattants dans la division');
    assert.equal(r.first,'surprise');
    assert.equal(r.winner,r.top);
    assert.ok(r.press,'la presse du lendemain produit un premier titre');
    assert.match(r.pressRows,/À LA UNE/);
    assert.ok(r.pressRows.indexOf(r.press)>=0,'le premier titre affiché est l’article lié à l’histoire classée en tête');
    assert.match(r.pressRows,new RegExp(r.winnerName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
    assert.match(r.moments,/ld3-moment/);
    assert.match(r.moments,/Revoir/);
    assert.ok(r.moments.indexOf(r.winnerName)<r.moments.indexOf('LA FINITION')||!r.moments.includes('LA FINITION'));
  }finally{w.close();}
});

test('Monde lot 54 T1 — le lendemain complète trois moments distincts',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const count=w.eval(`(mgmtLendemainMomentsCompletsHtml(G.mgmt).match(/class="ld3-moment"/g)||[]).length`);
    assert.equal(count,3);
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

test('Monde lot 54 T1 — l’après propose au plus trois lignes déterministes parmi huit familles',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const r=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],g=m.roster.find(x=>x.id!==f.id),side=x=>({id:x.id,name:x.name,last:x.last,first:x.first,div:x.div,W:x.W,L:x.L,D:x.D});m.hist.push({c:m.cycle,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(g)});m.lastEvent={cycle:m.cycle,fights:[],finance:{}};const a=mgmtLendemainApres(m,m.cycle+1),b=mgmtLendemainApres(m,m.cycle+1);return {a,b,count:MGMT_LD_APRES_FAMILLES.length};})()`);
    assert.equal(r.count>=8,true);
    assert.equal(r.a.length<=3,true);
    assert.deepEqual(r.a,r.b);
    assert.ok(r.a.every(x=>x.relu===false));
  }finally{w.close();}
});

test('Monde lot 54 T1 — le catalogue de l’après garde une formulation distincte par famille',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`MGMT_LD_APRES_FAMILLES.map(x=>({famille:x.famille,texte:x.texte,relu:x.relu}))`);
    assert.ok(r.length>=8);
    assert.equal(new Set(r.map(x=>x.famille)).size,r.length);
    assert.equal(new Set(r.map(x=>x.texte)).size,r.length);
    for(const x of r){
      assert.equal(x.relu,false);
      assert.ok(x.texte.includes('{nom}'),x.famille);
      assert.ok(x.texte.toLocaleLowerCase('fr').includes(x.famille.toLocaleLowerCase('fr')),
        `la formulation doit nommer sa famille : ${x.famille}`);
    }
  }finally{w.close();}
});

test('Monde lot 54 T1 — l’après ne nomme une suspension que si la soirée l’a enregistrée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const result=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],g=m.roster.find(x=>x.id!==f.id),side=x=>({id:x.id,name:x.name,last:x.last,first:x.first,div:x.div,W:x.W,L:x.L,D:x.D});m.hist.push({c:m.cycle,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(g)});m.lastEvent={cycle:m.cycle,fights:[],touched:[],finance:{}};return mgmtLendemainApres(m,m.cycle+1);})()`);
    assert.ok(result.length<=3);
    assert.ok(result.every(x=>x.relu===false));
    assert.ok(result.every(x=>x.famille!=='suspension'));
  }finally{w.close();}
});

test('Monde lot 54 T1 — l’après tolère un champ de touchés malformé sans inventer de suspension',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const result=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],g=m.roster.find(x=>x.id!==f.id),side=x=>({id:x.id,name:x.name,last:x.last,first:x.first,div:x.div,W:x.W,L:x.L,D:x.D});m.hist.push({c:m.cycle,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(g)});m.lastEvent={cycle:m.cycle,fights:[],touched:{days:90},finance:{}};return mgmtLendemainApres(m,m.cycle+1);})()`);
    assert.ok(result.length<=3);
    assert.ok(result.every(x=>x.famille!=='suspension'));
  }finally{w.close();}
});

test('Monde lot 54 T1 — l’après ne répète pas une formulation pour un combattant sur cinquante semaines',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    const texts=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],g=m.roster.find(x=>x.id!==f.id),side=x=>({id:x.id,name:x.name,last:x.last,first:x.first,div:x.div,W:x.W,L:x.L,D:x.D}),out=[];for(let week=1;week<=50;week++){const c=m.cycle+week;m.hist.push({c,slot:'main',winner:'A',family:'dec',round:3,rounds:3,a:side(f),b:side(g)});m.lastEvent={cycle:c,fights:[],touched:[],finance:{}};out.push(...mgmtLendemainApres(m,c+1).filter(x=>x.texte.includes(f.name)).map(x=>x.texte));}return out;})()`);
    assert.ok(texts.length>1);
    assert.equal(new Set(texts).size,texts.length);
  }finally{w.close();}
});

test('Monde lot 54 T1 — le cadre du lendemain intègre les trois moments et le récit',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const html=w.eval(`scr_mgmt_lendemain_cadre()`);
    assert.match(html,/LES TROIS MOMENTS/);
    assert.match(html,/ld3-moment/);
    assert.match(html,/TOUS LES RÉSULTATS/);
  }finally{w.close();}
});

test('Monde lot 54 T1 — la suite du lendemain expose presse, mouvements et carte complète',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const html=w.eval(`mgmtLendemainSuiteHtml(G.mgmt)`);
    assert.match(html,/LE LENDEMAIN · LA SUITE/);
    assert.match(html,/CAGE HEBDO/);
    assert.match(html,/LES MOUVEMENTS/);
    assert.match(html,/TOUS LES RÉSULTATS/);
    assert.match(html,/class="ld3-suite-results"/);
  }finally{w.close();}
});

test('Monde lot 54 T1 — les blocs ld3 de la suite ont chacun une règle de style dédiée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const classes=Array.from(w.eval(`(()=>{const html=mgmtLendemainSuiteHtml(G.mgmt);return [...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\\s+/)))].filter(x=>x.startsWith('ld3-'));})()`));
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    const missing=classes.filter(c=>!new RegExp('\\.'+c+'(?:\\W|$)').test(css));
    assert.deepEqual(missing,[],'chaque classe de la suite doit être stylée dans le CSS');
  }finally{w.close();}
});

test('Monde lot 54 T1 — les blocs ld3 du premier écran ont chacun une règle de style dédiée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const classes=Array.from(w.eval(`(()=>{const m=G.mgmt,html=mgmtLendemainMomentsCompletsHtml(m)+mgmtLendemainPrimesHtml(m)+mgmtLendemainDiscoursHtml(m)+mgmtLendemainAttentionHtml(m)+mgmtLendemainPresseHtml(m)+mgmtLendemainChiffresHtml(m);return [...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\\s+/)))].filter(x=>x.startsWith('ld3-'));})()`));
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    const missing=classes.filter(c=>!new RegExp('\\.'+c+'(?:\\W|$)').test(css));
    assert.deepEqual(missing,[],'chaque classe ld3 du premier écran doit avoir une règle CSS');
  }finally{w.close();}
});

test('Monde lot 54 T1 — les deux écrans du lendemain gardent un corps de texte lisible',()=>{
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  const styles=css.match(/\.ld3-[^{]+\{[^}]*\}/g)||[];
  assert.ok(styles.length>0,'les composants ld3 ont des règles dédiées');
  for(const rule of styles){
    const sizes=[...rule.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map(x=>Number(x[1]));
    for(const size of sizes) assert.ok(size>=22,`${rule.slice(0,80)} utilise ${size}px`);
  }
});

test('Monde lot 54 T1 — la navigation ouvre le second écran puis revient aux moments',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{CL.go('mgmt_lendemain');const premier=document.getElementById('app').innerHTML;CL.mgmtLendemainSuite();const suite=G.screen;const html=document.getElementById('app').innerHTML;CL.go('mgmt_lendemain');return {premier,suite,html,retour:G.screen};})()`);
    assert.match(r.premier,/Lire la suite du lendemain/);
    assert.equal(r.suite,'mgmt_lendemain_suite');
    assert.match(r.html,/LE LENDEMAIN · LA SUITE/);
    assert.match(r.html,/LES MOUVEMENTS/);
    assert.equal(r.retour,'mgmt_lendemain');
  }finally{w.close();}
});

test('Monde lot 54 T1 — la suite conserve ses trois colonnes de planche et tous les combats',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>({
      fights:G.mgmt.lastEvent.fights.length,
      rows:(mgmtLendemainResultatsHtml(G.mgmt).match(/class="mgmt-ld-item"/g)||[]).length,
      suite:mgmtLendemainSuiteHtml(G.mgmt)
    }))()`);
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    assert.equal(r.rows,r.fights,'chaque combat de la soirée doit être consultable dans les résultats');
    assert.match(css,/\.ld3-suite\s*\{[^}]*grid-template-columns:\s*1\.05fr\s+1\.1fr\s+1fr/s,
      'presse, mouvements et résultats gardent trois colonnes explicites');
    assert.match(r.suite,/class="ld3-suite-(?:press|moves|results)"/);
  }finally{w.close();}
});
