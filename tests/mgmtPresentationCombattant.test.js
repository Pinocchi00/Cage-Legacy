"use strict";
/* ==== [ANCRE: TEST_MGMT_PRESENTATION_COMBATTANT] — Monde lot 3 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});
const lire=code=>JSON.parse(win.eval(`JSON.stringify(${code})`));
function fixture(n=30){
  win.eval(`var presentationFixture={cycle:8,eventsPlayed:8,graine:'faits',org:'split',facts:[],hist:[],roster:[]};
    for(let i=0;i<${n};i++) presentationFixture.roster.push({id:'f'+i,name:'F '+i,ck:'FR',
      div:allDivisions()[0].id,age:20+i,W:10+i,L:0,D:0,lastCycle:0,ct:{since:0,n:4,f:0}});`);
}
test('Monde lot 3 T2 — trente textes distincts et six ouvertures au maximum',()=>{
  fixture();
  const ps=lire('mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div)');
  assert.equal(ps.length,30);
  const compte={};
  for(const p of ps){
    assert.ok(p.ouverture);compte[p.ouverture]=(compte[p.ouverture]||0)+1;
    assert.ok(p.faits.length<=3);assert.ok(p.faits.some(f=>f.fait.famille==='bilan'));
    assert.equal(new Set(p.faits.map(f=>f.fait.famille)).size,p.faits.length);
  }
  assert.ok(Object.values(compte).every(n=>n<=6));
  const noms=lire('presentationFixture.roster.map(f=>f.name).concat(presentationFixture.roster.map(f=>f.id))');
  const textes=ps.map(p=>noms.reduce((t,n)=>t.split(n).join(''),p.faits.map(f=>f.texte).join(' ')));
  assert.equal(new Set(textes).size,30);
});
test('Monde lot 3 T2 — appariement stable et manque de faits sans invention',()=>{
  fixture();
  const r=lire(`(function(){
    const ancien=mgmtFaitsCombattant;
    const fait=(id,famille)=>({id:id+'|'+famille,famille,valeur:famille==='age'?{age:22}:{W:1,L:0,D:0},
      sujets:[id],sources:[{type:'fiche',id}],rarete:1,frequence:30,population:30,groupe:'test'});
    try{
      mgmtFaitsCombattant=(c,id)=>[fait(id,'age')];
      const seul=mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div);
      presentationFixture.roster=presentationFixture.roster.slice(0,7);
      presentationFixture.roster.forEach((f,i)=>f.id='a'+i);
      mgmtFaitsCombattant=(c,id)=>id==='a0'?[fait(id,'age'),fait(id,'bilan')]:[fait(id,'age')];
      const a=mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div);
      presentationFixture.roster.reverse();
      const b=mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div);
      return {seul,a,b};
    }finally{mgmtFaitsCombattant=ancien;}})()`);
  assert.equal(r.seul.filter(p=>p.ouverture==='age').length,6);
  assert.equal(r.seul.filter(p=>p.ouverture===null&&p.faits.length===0).length,24);
  assert.deepEqual(r.a,r.b);assert.equal(r.a[0].ouverture,'bilan');
  assert.deepEqual(r.a.map(p=>p.id),['a0','a1','a2','a3','a4','a5','a6']);
  assert.ok(r.a.slice(1).every(p=>p.ouverture==='age'));
  fixture(3);
  win.eval('presentationFixture.roster[0].retired=true');
  assert.equal(lire("mgmtPresentationCombattant({m:presentationFixture},'f0')"),null);
  assert.equal(lire("mgmtPresentationCombattant({m:presentationFixture},'absent')"),null);
  assert.deepEqual(lire("mgmtPresentationsCategorie({m:presentationFixture},'absent')"),[]);
});
test('Monde lot 3 T2 — aucun niveau caché ni appel moteur',()=>{
  fixture();
  const r=lire(`(function(){let lectures=0,appels=0;
    for(const f of presentationFixture.roster) for(const k of ['niv','niveau','level','stats','phys','skills','trauma'])
      Object.defineProperty(f,k,{get(){lectures++;throw Error(k);}});
    const noms=['mgmtCombatProfile','mgmtNiveauCombat','makeFighter','makePhysical','mgmtReplayFight','mgmtObservation'],anciens=noms.map(k=>window[k]);
    try{for(const k of noms)window[k]=()=>{appels++;throw Error(k);};
      const a=mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div);
      const b=mgmtPresentationCombattant({m:presentationFixture},'f0');
      return {lectures,appels,a,b};
    }finally{noms.forEach((k,i)=>window[k]=anciens[i]);}})()`);
  assert.equal(r.lectures,0);assert.equal(r.appels,0);assert.equal(r.a.length,30);
  assert.deepEqual(r.a.find(p=>p.id==='f0'),r.b);
});
/* ==== [ANCRE: TEST_PRESENTATION_RECONSTRUCTION] — Monde lot 3 T2 ==== */
// Porte la reconstruction publique T1, sans importer ses tests ni rejouer un combat.
function reconstruirePublic(m,h,fait){
  const roster=m.roster.map(f=>{
    const t=m.hist.slice(h).find(t=>t.a.id===f.id||t.b.id===f.id);
    if(!t)return f;
    const s=t.a.id===f.id?t.a:t.b;
    return {id:f.id,name:f.name,first:f.first,last:f.last,ck:f.ck,div:f.div,ct:f.ct,
      age:s.age,W:s.W,L:s.L,D:s.D,lastCycle:s.lastCycle,retired:false};
  });
  const vue={...m,roster,hist:m.hist.slice(0,h),facts:m.facts.filter(x=>x.c<=m.cycle&&(x.k!=='title_fight'||x.fight<h))};
  const f=roster.find(f=>f.id===fait.sujets[0]);
  const traces=fait.sources.filter(s=>s.type==='hist'&&!s.projection).map(s=>m.hist[s.index]);
  const champs=cles=>{
    const s=fait.sources.find(s=>s.champs&&cles.every(k=>s.champs.includes(k)));
    if(!s)throw Error('Champs sans source '+fait.famille);
    return s.type==='hist'?m.hist[s.index][s.cote]:m.roster.find(f=>f.id===s.id);
  };
  for(const s of fait.sources){
    if(s.type==='hist'){
      if(!m.hist[s.index]||(!s.projection&&s.index>=h))throw Error('Trace hors frontière');
      if(s.projection&&(s.index<h||m.hist[s.index][s.cote].id!==f.id))throw Error('Projection invalide');
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
  const classes=fait.sources.filter(s=>s.type==='classement');
  const position=s=>mgmtDivisionRankingCalcule(vue,s.div,s.scope,s.mode==='cycle'?s.cycle:undefined).findIndex(x=>x.id===f.id)+1;
  switch(fait.famille){
    case 'age':return {age:champs(['age']).age};
    case 'bilan':{const s=champs(['W','L','D']);return {W:s.W,L:s.L,D:s.D||0};}
    case 'rang':return {rang:position(classes[0])};
    case 'mouvement':return {places:position(classes[1])-position(classes[0])};
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
    case 'role':return {defenses:mgmtSplitTitle({...vue,facts:fait.sources.filter(s=>s.type==='facts').map(s=>m.facts[s.index])},f.div).defenses};
    case 'ville':return {ville:mgmtIdentiteVille(f,vue)};
    case 'metier':return {metier:mgmtIdentiteMetier(f,vue)};
    case 'moment':{const x=m.facts[fait.sources[0].index];return {moment:x.m,cycle:x.c};}
    case 'victoire_champion':{
      const x=m.facts[fait.sources.find(s=>s.type==='facts').index],row=mgmtTitleMemoryRows(vue).get(x);
      if(row.winnerId!==f.id)throw Error('Vainqueur incorrect');
      return {adversaire:row.championId,cycle:x.c};
    }
    default:throw Error('Famille non reconstruite '+fait.famille);
  }
}
let archive;
function passe(){
  if(!archive){archive=newGameWindow({runMain:true});archive.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:4});");}
  return archive;
}
test('Monde lot 3 T2 — chaque phrase retrouve sa source publique',()=>{
  const w=passe();w.eval(reconstruirePublic.toString());
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,out=[];
    for(const h of [0,Math.floor(m.hist.length/2),m.hist.length]){
      for(const div of new Set(m.roster.map(f=>f.div))) for(const p of mgmtPresentationsCategorie({m,h},div)){
        for(const x of p.faits){
          const valeurs={...x.fait.valeur};
          if('issue' in valeurs)valeurs.issue=valeurs.issue==='W'?'victoires':'défaites';
          if('methode' in valeurs)valeurs.methode=MGMT_FAMILY_LABELS[valeurs.methode]||valeurs.methode;
          if('moment' in valeurs)valeurs.moment=mgmtVieMomentById(valeurs.moment).libelle;
          if('adversaire' in valeurs){const s=x.fait.sources.find(s=>s.type==='hist'&&!s.projection),t=m.hist[s.index];
            valeurs.adversaire=(t.a.id===valeurs.adversaire?t.a:t.b).name;}
          const attendu=MGMT_PRESENTATION_COMBATTANT_TEXTES[x.modele].texte.replace(/\\{([^}]+)\\}/g,(_,k)=>String(valeurs[k]??''));
          out.push({valeur:x.fait.valeur,reconstruit:reconstruirePublic(m,h,x.fait),texte:x.texte,attendu});
        }
        const prioritaires=[...new Set(mgmtFaitsCombattant({m,h},p.id).filter(f=>f.famille==='victoire_champion')
          .flatMap(f=>f.sources.filter(s=>s.type==='hist'&&!s.projection&&s.index<h).map(s=>s.index)))];
        const indices=[...new Set([...prioritaires,...mgmtObsAvant(m,p.id,h)])].slice(0,3);
        if(JSON.stringify(indices)!==JSON.stringify(p.histoire.map(x=>x.index)))throw Error('Ordre histoire');
        for(const x of p.histoire){const t=m.hist[x.index],cote=t.a.id===p.id?'A':'B',adv=cote==='A'?t.b:t.a;
          if(x.index>=h||x.adversaire!==adv.id)throw Error('Histoire orpheline');
          const issue=t.winner==='D'?'D':t.winner===cote?'W':'L';
          const valeurs={adversaire:adv.name,methode:MGMT_FAMILY_LABELS[t.family]||t.family||'',round:Number.isSafeInteger(t.round)?mgmtRoundOrdinal(t.round):''};
          const attendu=MGMT_PRESENTATION_COMBATTANT_TEXTES[issue].texte.replace(/\\{([^}]+)\\}/g,(_,k)=>String(valeurs[k]));
          out.push({valeur:x.sources,reconstruit:[{type:'hist',index:x.index}],texte:x.texte,attendu});
        }
      }
    }return out;})())`));
  assert.ok(r.length>100);
  for(const x of r){
    assert.deepEqual(x.valeur,x.reconstruit);
    assert.equal(x.texte,x.attendu.replace(/\s+/g,' ').replace(/\s+([.,;])/g,'$1').replace(/[,;]\s*\./g,'.').trim());
    assert.doesNotMatch(x.texte,/\{[^}]+\}/);
  }
});
test('Monde lot 3 T2 — frontière historique et rechargement déterministes',()=>{
  const w=passe();
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,lu=mgmtParseAndValidate(mgmtSerialiser(m)),seed=SEED,avant=JSON.stringify(m);
    const tous=(x,h)=>[...new Set(x.roster.map(f=>f.div))].flatMap(div=>mgmtPresentationsCategorie({m:x,h},div));
    const hs=[0,Math.floor(m.hist.length/2),m.hist.length],a=hs.map(h=>tous(m,h)),b=hs.map(h=>tous(lu,h));
    const gel=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(gel);Object.freeze(x);}};gel(m);
    const c=hs.map(h=>tous(m,h));G.mgmt={graine:'influence-interdite'};const d=hs.map(h=>tous(m,h));
    return {a,b,c,d,seed:SEED===seed,intact:avant===JSON.stringify(m),hs,
      borne:mgmtPresentationCombattant({m,h:-1},a[0][0].id).h,
      fin:mgmtPresentationCombattant({m,h:m.hist.length+99},a[0][0].id).h};})())`));
  assert.deepEqual(r.a,r.b);assert.deepEqual(r.a,r.c);assert.deepEqual(r.c,r.d);
  assert.ok(r.seed);assert.ok(r.intact);assert.equal(r.borne,0);assert.equal(r.fin,r.hs[2]);
  assert.ok(r.a[0].every(p=>p.histoire.length===0));
  r.a.forEach((ps,i)=>ps.forEach(p=>assert.ok(p.histoire.length<=3&&p.histoire.every(x=>x.index<r.hs[i]))));
});
test('Monde lot 3 T2 — féminin et propositions exportables',()=>{
  const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
  fixture();
  win.eval("presentationFixture.roster.forEach(f=>f.div=allDivisions().find(d=>d.gender==='F').id)");
  const ps=lire('mgmtPresentationsCategorie({m:presentationFixture},presentationFixture.roster[0].div)');
  assert.equal(ps.length,30);
  for(const p of ps)for(const f of p.faits)assert.doesNotMatch(f.texte,/\{[^}]+\}/);
  const modeles=lire('Object.values(MGMT_PRESENTATION_COMBATTANT_TEXTES)');
  assert.equal(modeles.length,16);assert.equal(new Set(modeles.map(m=>m.id)).size,16);
  assert.ok(modeles.every(m=>m.relu===false));
  const out=path.join('C:/Users/antho/AppData/Local/Temp/opencode',`presentation-t2-${process.pid}.md`);
  try{
    execFileSync(process.execPath,['tools/exporter-textes.js','--out',out],{cwd:path.join(__dirname,'..')});
    const exporte=fs.readFileSync(out,'utf8');
    for(const m of modeles){
      assert.ok(exporte.includes('`MGMT_PRESENTATION_COMBATTANT_TEXTES.'+m.id+'`'));
      assert.ok(exporte.includes(m.texte));
    }
  }finally{if(fs.existsSync(out))fs.unlinkSync(out);}
  // Le §6 impose l'épicène pour tous les modèles, y compris une adversaire championne.
  for(const m of modeles)assert.doesNotMatch(m.texte,/\b(?:il|lui|combattant|ancien|champion)\b/i,m.id);
});
