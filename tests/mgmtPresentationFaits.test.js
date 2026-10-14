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
  win.eval(`var faitsFixture={cycle:8,eventsPlayed:8,graine:'faits',org:'split',facts:[],hist:[],roster:[]};
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
    for(const f of faitsFixture.roster) for(const k of ['niv','niveau','level','stats','phys','skills','trauma','traumaFloor'])
      Object.defineProperty(f,k,{get(){lectures++;throw Error(k);}});
    const noms=['mgmtCombatProfile','mgmtNiveauCombat','makeFighter','makePhysical','mgmtReplayFight'];
    const anciens=noms.map(k=>window[k]);
    try{ for(const k of noms) window[k]=()=>{appels++;throw Error(k);};
      const a=mgmtFaitsCombattant({m:faitsFixture},'f0');
      const individuel={lectures,appels};
      const b=mgmtFaitsCombat({m:faitsFixture},'f0','f1');
      return {lectures,appels,individuel,n:a.length+b.length};
    }finally{noms.forEach((k,i)=>window[k]=anciens[i]);}})()`);
  assert.deepEqual(r.individuel,{lectures:0,appels:0});
  assert.equal(r.lectures,0); assert.equal(r.appels,0); assert.ok(r.n>0);
});
let archive;
function passe() {
  if(!archive) { archive=newGameWindow({runMain:true}); archive.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:4});"); }
  return archive;
}
/* ==== [ANCRE: TEST_FAITS_RECONSTRUCTION] — Monde lot 3 T1 ==== */
function reconstruirePublic(m,h,fait){
  const roster=m.roster.map(f=>{
    const t=m.hist.slice(h).find(t=>t.a.id===f.id||t.b.id===f.id);
    if(!t)return f;
    const s=t.a.id===f.id?t.a:t.b;
    return {id:f.id,name:f.name,first:f.first,last:f.last,ck:f.ck,div:f.div,ct:f.ct,
      age:s.age,W:s.W,L:s.L,D:s.D,lastCycle:s.lastCycle,retired:false};
  });
  const vue={...m,roster,hist:m.hist.slice(0,h),facts:m.facts.filter(x=>x.c<=m.cycle&&(x.k!=='title_fight'||x.fight<h))};
  const sujets=fait.sujets.map(id=>roster.find(f=>f.id===id)),f=sujets[0];
  const traces=fait.sources.filter(s=>s.type==='hist'&&!s.projection).map(s=>m.hist[s.index]);
  const champs=cles=>{
    const s=fait.sources.find(s=>s.champs&&cles.every(k=>s.champs.includes(k)));
    if(!s)throw Error('Champs sans source '+fait.famille);
    return s.type==='hist'?m.hist[s.index][s.cote]:m.roster.find(f=>f.id===s.id);
  };
  for(const s of fait.sources){
    if(s.type==='hist'){
      if(!m.hist[s.index]||(!s.projection&&s.index>=h))throw Error('Trace hors frontière');
      if(s.projection&&(s.index<h||m.hist[s.index][s.cote].id!==fait.sujets.find(id=>id===m.hist[s.index][s.cote].id)))throw Error('Projection invalide');
    }else if(s.type==='facts'){
      if(!vue.facts.includes(m.facts[s.index]))throw Error('Fait hors frontière');
      const x=m.facts[s.index];
      if(x.k==='moment_vie'&&!mgmtVieMomentById(x.m).relais.length)throw Error('Moment privé');
    }else if(s.type==='classement'){
      if(s.h!==h||s.cycle!==(s.mode==='vivant'?m.cycle:m.cycle-1))throw Error('Cycle/frontière incorrects');
    }else if(s.type==='fiche'){
      if(!m.roster.some(f=>f.id===s.id))throw Error('Fiche absente');
    }else if(s.type!=='calendrier')throw Error('Source inconnue');
  }
  const rang=s=>mgmtDivisionRankingCalcule(vue,s.div,s.scope,s.mode==='cycle'?s.cycle:undefined);
  const classes=fait.sources.filter(s=>s.type==='classement');
  const position=(s,id)=>rang(s).findIndex(f=>f.id===id)+1;
  const titre=()=>mgmtSplitTitle({...vue,facts:fait.sources.filter(s=>s.type==='facts').map(s=>m.facts[s.index])},f.div);
  switch(fait.famille){
    case 'age':return {age:champs(['age']).age};
    case 'bilan':{const s=champs(['W','L','D']);return {W:s.W,L:s.L,D:s.D||0};}
    case 'rang':return {rang:position(classes[0],f.id)};
    case 'mouvement':return {places:position(classes[1],f.id)-position(classes[0],f.id)};
    case 'serie':return {issue:traces[0].winner===(traces[0].a.id===f.id?'A':'B')?'W':'L',n:traces.length};
    case 'methode':return {methode:fait.groupe,victoires:traces.filter(t=>t.family===fait.groupe&&t.winner===(t.a.id===f.id?'A':'B')).length,total:champs(['W']).W};
    case 'attente':{
      const s=fait.sources.find(s=>s.type==='calendrier'),x=champs(s.depuis===f.lastCycle?['lastCycle']:['ct']);
      const depuis=Number.isSafeInteger(x.lastCycle)&&x.lastCycle>=0?x.lastCycle:x.ct.since;
      const debut=depuis===0?0:mgmtAgendaJour(m,depuis),fin=h<m.hist.length?mgmtAgendaJour(m,m.hist[h].c):mgmtCalAujourdhui(m);
      if(s.depuis!==depuis||s.jourDebut!==debut||s.jourFin!==fin||s.h!==h)throw Error('Dates sans source');
      const a=new Date(mgmtJourDate(debut).ts),b=new Date(mgmtJourDate(fin).ts);
      return {mois:Math.max(0,12*(b.getUTCFullYear()-a.getUTCFullYear())+b.getUTCMonth()-a.getUTCMonth()-(b.getUTCDate()<a.getUTCDate()?1:0))};
    }
    case 'camp':{const c=mgmtCamp(vue,f,vue.cycle,vue);return {nom:c.nom,ville:c.ville};}
    case 'role':return {defenses:titre().defenses};
    case 'ville':return {ville:mgmtIdentiteVille(f,vue)};
    case 'metier':return {metier:mgmtIdentiteMetier(f,vue)};
    case 'moment':{const x=m.facts[fait.sources[0].index];return {moment:x.m,cycle:x.c};}
    case 'victoire_champion':{
      const x=m.facts[fait.sources.find(s=>s.type==='facts').index];
      const row=mgmtTitleMemoryRows(vue).get(x);
      if(row.winnerId!==f.id)throw Error('Vainqueur incorrect');
      return {adversaire:row.championId,cycle:x.c};
    }
    case 'meme_age':{
      const ages=fait.sources.map(s=>s.type==='hist'?m.hist[s.index][s.cote].age:m.roster.find(f=>f.id===s.id).age);
      const tranche=a=>a<=22?'22-':a<=26?'23-26':a<=30?'27-30':a<=34?'31-34':'35+';
      if(tranche(ages[0])!==tranche(ages[1]))throw Error('Âges différents');
      return {tranche:tranche(ages[0])};
    }
    case 'revanche':return {combats:traces.length};
    case 'contraste_style':return {styles:fait.sources.map(s=>mgmtIdentiteStyle(roster.find(f=>f.id===s.id),vue))};
    case 'meme_camp':return {nom:mgmtCamp(vue,f,vue.cycle,vue).nom};
    case 'rangs_voisins':return {rangs:sujets.map(f=>position(classes[0],f.id))};
    case 'adversaire_commun':{
      const ids=traces.map(t=>sujets.some(f=>f.id===t.a.id)?t.b.id:t.a.id);
      if(new Set(ids).size!==1)throw Error('Adversaire non commun');
      return {adversaire:ids[0]};
    }
    case 'titre':return {champion:titre().id};
    default:throw Error('Famille non reconstruite '+fait.famille);
  }
}
test('Monde lot 3 T1 — chaque fait possède une source publique retrouvable', () => {
  const w=passe();
  w.eval(reconstruirePublic.toString());
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,resultats=[];
    const actifs=m.roster.filter(f=>!mgmtIsRetired(f));
    for(const h of [m.hist.length,Math.floor(m.hist.length/2)]){
      const faits=actifs.flatMap(f=>mgmtFaitsCombattant({m,h},f.id));
      faits.push(...mgmtFaitsCombat({m,h},actifs[0].id,actifs.find(f=>f.div===actifs[0].div&&f.id!==actifs[0].id).id));
      for(const f of faits){if(!f.sources.length)throw Error('Source absente');
        resultats.push({famille:f.famille,valeur:f.valeur,reconstruit:reconstruirePublic(m,h,f)});}
    }return resultats;})())`));
  assert.ok(r.length>100);
  for(const f of r)assert.deepEqual(f.valeur,f.reconstruit,f.famille);
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
  assert.equal(faits.find(f=>f.famille==='attente').valeur.mois,9);
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
/* ==== [ANCRE: TEST_FAITS_DATES_RETRAITE] — Monde lot 3 T1 ==== */
test('Monde lot 3 T1 — attente en mois publics et non en cycles', () => {
  fixture();
  win.eval(`faitsFixture.cycle=2;faitsFixture.eventsPlayed=1;
    faitsFixture.cal={actif:true,jour:365,faites:[{n:1,jour:0}],prochaines:[]};
    faitsFixture.roster[0].lastCycle=1;`);
  const fait=lire("mgmtFaitsCombattant({m:faitsFixture},'f0').find(f=>f.famille==='attente')");
  assert.equal(fait.valeur.mois,12);
  win.eval(reconstruirePublic.toString());
  assert.deepEqual(lire("reconstruirePublic(faitsFixture,0,mgmtFaitsCombattant({m:faitsFixture},'f0').find(f=>f.famille==='attente'))"),fait.valeur);
  win.eval('faitsFixture.cycle=8;faitsFixture.cal.jour=90');
  assert.ok(!lire("mgmtFaitsCombattant({m:faitsFixture},'f0')").some(f=>f.famille==='attente'));
});
test('Monde lot 3 T1 — retraite exclue et provenance du côté avant combat', () => {
  fixture();
  win.eval(`faitsFixture.roster[0].retired=true;faitsFixture.roster[0].age=39;
    faitsFixture.hist.push({c:8,a:{id:'f1',age:21,W:11,L:0,D:0,lastCycle:0},
      b:{id:'f0',age:22,W:2,L:1,D:1,lastCycle:0},winner:'A',family:'KO'});
    faitsFixture.facts.push({c:8,k:'retired',a:'f0'});`);
  assert.deepEqual(lire("mgmtFaitsCombattant({m:faitsFixture},'f0')"),[]);
  const faits=lire("mgmtFaitsCombattant({m:faitsFixture,h:0},'f0')");
  assert.deepEqual(faits.find(f=>f.famille==='age').valeur,{age:22});
  assert.deepEqual(faits.find(f=>f.famille==='bilan').valeur,{W:2,L:1,D:1});
  for(const famille of ['age','bilan']){
    const source=faits.find(f=>f.famille===famille).sources[0];
    assert.equal(source.type,'hist');assert.equal(source.index,0);assert.equal(source.cote,'b');assert.equal(source.projection,true);
  }
  const paire=lire("mgmtFaitsCombat({m:faitsFixture,h:0},'f0','f1')");
  assert.ok(paire.some(f=>f.famille==='meme_age'));
  win.eval(reconstruirePublic.toString());
  const r=lire(`mgmtFaitsCombattant({m:faitsFixture,h:0},'f0').concat(mgmtFaitsCombat({m:faitsFixture,h:0},'f0','f1'))
    .map(f=>({valeur:f.valeur,reconstruit:reconstruirePublic(faitsFixture,0,f)}))`);
  for(const f of r)assert.deepEqual(f.valeur,f.reconstruit);
});
