"use strict";
/* ==== [ANCRE: TEST_MGMT_PRESENTATION_FAITS] — Monde lot 3 T1 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const win = newGameWindow({ runMain: true });
function lire(code) { return JSON.parse(win.eval(`JSON.stringify(${code})`)); }
test('Monde lot 3 T1 — accessoires publics avec contexte explicite', () => {
  const r = lire(`(function(){
    const f={id:'probe',ck:'FR',name:'Probe'},m={graine:'test',cycle:0,roster:[f],facts:[]};
    const seed=SEED,avant=JSON.stringify(m);
    const a=[mgmtCamp(m,f,0,m),mgmtIdentiteStyle(f,m)];
    G.mgmt={graine:'autre'};
    const b=[mgmtCamp(m,f,0,m),mgmtIdentiteStyle(f,m)];
    return {a,b,stable:SEED===seed,intact:JSON.stringify(m)===avant};
  })()`);
  assert.deepEqual(r.a,r.b); assert.equal(r.stable,true); assert.equal(r.intact,true);
});
function fixture(n=6) {
  win.eval(`var faitsFixture={cycle:8,graine:'faits',org:'split',facts:[],hist:[],roster:[]};
    for(let i=0;i<${n};i++) faitsFixture.roster.push({id:'f'+i,name:'F '+i,ck:'FR',
      div:allDivisions()[0].id,age:20+i,W:10+i,L:0,D:0,lastCycle:0,ct:{since:0,n:4,f:0}});`);
}
test('Monde lot 3 T1 — mêmes données publiques, mêmes faits sans mutation ni tirage', () => {
  fixture();
  const r=lire(`(function(){
    const m=faitsFixture,avant=JSON.stringify(m),seed=SEED;
    const gel=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(gel);Object.freeze(x);}};gel(m);
    const a=[mgmtFaitsCombattant({m},'f0'),mgmtFaitsCombat({m},'f0','f1')];
    G.mgmt={graine:'influence-interdite'};
    const b=[mgmtFaitsCombattant({m},'f0'),mgmtFaitsCombat({m},'f0','f1')];
    return {a,b,intact:JSON.stringify(m)===avant,seed:SEED===seed};})()`);
  assert.deepEqual(r.a,r.b); assert.equal(r.intact,true); assert.equal(r.seed,true);
});
test('Monde lot 3 T1 — aucun accès au niveau caché ni aux attributs moteur', () => {
  fixture();
  const r=lire(`(function(){
    let lectures=0,appels=0;
    for(const f of faitsFixture.roster) for(const k of ['niveau','level','stats','phys','skills','trauma','traumaFloor'])
      Object.defineProperty(f,k,{get(){lectures++;throw Error(k);}});
    const noms=['mgmtCombatProfile','mgmtNiveauCombat','makeFighter','makePhysical','mgmtReplayFight'];
    const anciens=noms.map(k=>window[k]);
    try{ for(const k of noms) window[k]=()=>{appels++;throw Error(k);};
      const a=mgmtFaitsCombattant({m:faitsFixture},'f0'),b=mgmtFaitsCombat({m:faitsFixture},'f0','f1');
      return {lectures,appels,n:a.length+b.length};
    }finally{noms.forEach((k,i)=>window[k]=anciens[i]);}})()`);
  assert.equal(r.lectures,0); assert.equal(r.appels,0); assert.ok(r.n>0);
});
let archive;
function passe() {
  if(!archive) { archive=newGameWindow({runMain:true}); archive.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:4});"); }
  return archive;
}
test('Monde lot 3 T1 — chaque fait possède une source publique retrouvable', () => {
  const w=passe();
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt;let n=0,orphelins=0,prives=0;
    const actifs=m.roster.filter(f=>!mgmtIsRetired(f));
    const faits=actifs.flatMap(f=>mgmtFaitsCombattant({m},f.id));
    faits.push(...mgmtFaitsCombat({m},actifs[0].id,actifs.find(f=>f.div===actifs[0].div&&f.id!==actifs[0].id).id));
    for(const f of faits){n++;if(!f.sources.length)orphelins++;
      for(const s of f.sources){
        if(s.type==='hist'&&!m.hist[s.index])orphelins++;
        if(s.type==='fiche'&&!m.roster.some(x=>x.id===s.id))orphelins++;
        if(s.type==='classement'&&!mgmtDivisionRankingCalcule(m,s.div,s.scope).length)orphelins++;
        if(s.type==='facts'){const x=m.facts[s.index];if(!x)orphelins++;
          if(x&&x.k==='moment_vie'&&!mgmtVieMomentById(x.m).relais.length)prives++;}
      }
    }return {n,orphelins,prives};})())`));
  assert.ok(r.n>100); assert.equal(r.orphelins,0); assert.equal(r.prives,0);
});
test('Monde lot 3 T1 — le passé allégé reste une source après rechargement', () => {
  const w=passe();
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,lu=mgmtParseAndValidate(mgmtSerialiser(m));
    const tous=x=>x.roster.filter(f=>!mgmtIsRetired(f)).map(f=>mgmtFaitsCombattant({m:x},f.id));
    const avant=tous(m),apres=tous(lu);
    const ids=m.roster.filter(f=>!mgmtIsRetired(f)&&f.div===m.roster[0].div).slice(0,2).map(f=>f.id);
    return {identique:JSON.stringify(avant)===JSON.stringify(apres),leger:m.hist.every(t=>t.p),
      paire:JSON.stringify(mgmtFaitsCombat({m},...ids))===JSON.stringify(mgmtFaitsCombat({m:lu},...ids))};})())`));
  assert.equal(r.identique,true); assert.equal(r.leger,true); assert.equal(r.paire,true);
});
test('Monde lot 3 T1 — trente combattants ont trente signatures et au plus six ouvertures par famille', () => {
  // §13.2 remplace l'attendu de quota : T1 ne sélectionne aucune ouverture ; T2 le testera.
  fixture(30);
  const r=lire(`(function(){const listes=faitsFixture.roster.map(f=>mgmtFaitsCombattant({m:faitsFixture},f.id));
    const signatures=listes.map(fs=>JSON.stringify(fs.map(f=>[f.famille,f.groupe,f.valeur])));
    return {n:new Set(signatures).size,bilans:listes.filter(fs=>fs.some(f=>f.famille==='bilan')).length};})()`);
  assert.equal(r.n,30); assert.equal(r.bilans,30,'aucun quota ne supprime les faits de T1');
});
test('Monde lot 3 T1 — les faits de paire sont sourcés et classés par rareté', () => {
  fixture(4);
  win.eval("faitsFixture.roster.forEach((f,i)=>{f.age=i<3?24:36;});");
  const faits=lire("mgmtFaitsCombat({m:faitsFixture},'f0','f1')");
  const age=faits.find(f=>f.famille==='meme_age'),voisins=faits.find(f=>f.famille==='rangs_voisins');
  assert.equal(age.frequence,3); assert.equal(age.population,6); assert.equal(age.rarete,0.5);
  assert.equal(voisins.frequence,3); assert.equal(voisins.population,6); assert.equal(voisins.rarete,0.5);
  assert.ok(faits.indexOf(age)<faits.indexOf(voisins),'départage fixe des familles');
  for(let i=1;i<faits.length;i++) assert.ok(faits[i-1].rarete<=faits[i].rarete);
  assert.ok(faits.every(f=>f.sources.length>0));
});
test('Monde lot 3 T1 — seuils publics, titre historique et frontière avant combat', () => {
  fixture(6);
  win.eval(`faitsFixture.roster[0].W=4;
    for(let i=0;i<4;i++) faitsFixture.hist.push({c:i+1,
    a:{id:'f0',name:'F 0',W:i,L:0,D:0,age:20,lastCycle:i},
    b:{id:'f1',name:'F 1',W:11,L:i,D:0,age:21,lastCycle:i},winner:'A',family:i<3?'KO':'SUB'});
    faitsFixture.facts.push({k:'title_initial',c:0,div:faitsFixture.roster[0].div,a:'f1'},
      {k:'title_fight',c:1,div:faitsFixture.roster[0].div,fight:0});`);
  const faits=lire("mgmtFaitsCombattant({m:faitsFixture},'f0')");
  const serie=faits.find(f=>f.famille==='serie'),methode=faits.find(f=>f.famille==='methode');
  assert.equal(serie.valeur.n,4); assert.equal(methode.valeur.victoires,3); assert.equal(methode.valeur.total,4);
  assert.equal(faits.find(f=>f.famille==='attente').valeur.mois,8);
  assert.equal(faits.find(f=>f.famille==='victoire_champion').valeur.adversaire,'f1');
  assert.equal(faits.find(f=>f.famille==='role').groupe,'champion');
  const avant=lire("mgmtFaitsCombattant({m:faitsFixture,h:0},'f0')");
  assert.equal(avant.find(f=>f.famille==='bilan').valeur.W,0);
  assert.ok(!avant.some(f=>['serie','methode','role','victoire_champion'].includes(f.famille)));
  const paire=lire("mgmtFaitsCombat({m:faitsFixture,h:0},'f0','f1')");
  assert.ok(!paire.some(f=>f.famille==='revanche'));
  assert.deepEqual(lire("mgmtFaitsCombattant({m:faitsFixture},'absent')"),[]);
  assert.deepEqual(lire("mgmtFaitsCombat({m:faitsFixture},'f0','f0')"),[]);
  win.eval('faitsFixture.roster[0].W=10');
  assert.ok(!lire("mgmtFaitsCombattant({m:faitsFixture},'f0')").some(f=>f.famille==='methode'),
    'les victoires sans méthode connue restent au dénominateur');
});
