"use strict";
/* ==== [ANCRE: TEST_MGMT_PRESENTATION_COMBAT] — Monde lot 3 T3 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});
const lire=code=>JSON.parse(win.eval(`JSON.stringify(${code})`));
function fixture(n=30){
  win.eval(`var paireFixture={cycle:8,eventsPlayed:0,graine:'faits',org:'split',facts:[],hist:[],roster:[]};
    for(let i=0;i<${n};i++) paireFixture.roster.push({id:i===0?'a':i===1?'b':'f'+i,name:'Sujet '+i,ck:'FR',
      div:allDivisions()[0].id,age:20+i,W:10+i,L:0,D:0,lastCycle:0,ct:{since:0,n:4,f:0}});`);
}
test('Monde lot 3 T3 — paire canonique et invalides',()=>{
  fixture();
  const a=lire("mgmtPresentationCombat({m:paireFixture},'a','b')");
  win.eval('paireFixture.roster.reverse()');
  assert.deepEqual(a,lire("mgmtPresentationCombat({m:paireFixture},'b','a')"));
  assert.ok(a.faits.length<=3);assert.equal(new Set(a.faits.map(x=>x.fait.famille)).size,a.faits.length);
  assert.deepEqual(a.cotes.map(x=>x.faits[0].fait.famille),['bilan','bilan']);
  for(const [a,b] of [['a','a'],['absent','b']]){
    assert.equal(lire(`mgmtPresentationCombat({m:paireFixture},'${a}','${b}')`),null);
    assert.deepEqual(lire(`mgmtPronosticsCombat({m:paireFixture},'${a}','${b}')`),[]);
  }
  win.eval("paireFixture.roster.find(f=>f.id==='b').retired=true");
  assert.equal(lire("mgmtPresentationCombat({m:paireFixture},'a','b')"),null);
  win.eval("paireFixture.roster.find(f=>f.id==='b').retired=false;paireFixture.roster.find(f=>f.id==='b').div='ailleurs'");
  assert.deepEqual(lire("mgmtPronosticsCombat({m:paireFixture},'a','b')"),[]);
});
test('Monde lot 3 T3 — trois voix nommées et pourcentage public',()=>{
  fixture(2);
  for(const [W,L,p] of [[8,2,68],[0,0,50],[10,0,80]]){
    win.eval(`Object.assign(paireFixture.roster[0],{W:${W},L:${L}});Object.assign(paireFixture.roster[1],{W:${L},L:${W}})`);
    const ps=lire("mgmtPronosticsCombat({m:paireFixture},'b','a')");
    assert.deepEqual(ps.map(x=>x.nom),['Cage Hebdo','Tableau Noir','Le Forum']);
    assert.deepEqual(ps.map(x=>x.pourcentage),[p,null,null]);assert.equal(ps[0].vainqueur,'a');
    const vs=ps[0].preuves.map(x=>x.valeurs),r=vs.map(x=>x.W+x.L+x.D?(x.W+0.5*x.D)/(x.W+x.L+x.D):0.5);
    assert.equal(ps[0].pourcentage,Math.max(Math.round(50+30*(r[0]-r[1])),100-Math.round(50+30*(r[0]-r[1]))));
    for(const x of ps[0].preuves)assert.deepEqual(x.sources,[{type:'fiche',id:x.valeurs.id,champs:['W','L','D']}]);
  }
});
test('Monde lot 3 T3 — les voix peuvent se contredire',()=>{
  fixture(4);
  win.eval(`Object.assign(paireFixture.roster[0],{W:8,L:3});Object.assign(paireFixture.roster[1],{W:3,L:8});
    for(let i=0;i<3;i++)for(const j of [0,1])paireFixture.hist.push({c:i,a:paireFixture.roster[j],b:paireFixture.roster[j+2],winner:j===0?'B':'A',family:'DEC',round:3});`);
  const ps=lire("mgmtPronosticsCombat({m:paireFixture},'a','b')");
  assert.equal(ps[0].vainqueur,'a');assert.equal(ps[2].vainqueur,'b');
  win.eval("paireFixture.hist.forEach(t=>t.winner='D')");
  assert.equal(lire("mgmtPronosticsCombat({m:paireFixture},'b','a')[2].vainqueur"),'a');
});
/* ==== [ANCRE: TEST_COMBAT_FRONTIERE_SOURCES] — Monde lot 3 T3 ==== */
let archive;
function passe(){
  if(!archive){archive=newGameWindow({runMain:true});archive.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:4});
    G.mgmt.lastEvent={cycle:G.mgmt.hist.at(-1).c,touched:[],fights:G.mgmt.hist.filter(t=>t.c===G.mgmt.hist.at(-1).c)
      .map(t=>({a:t.a.id,b:t.b.id,winner:t.winner,family:t.family,round:t.round,rounds:t.rounds||3,title:!!t.title}))};`);}
  return archive;
}
test('Monde lot 3 T3 — aucun niveau caché ni appel moteur',()=>{
  const w=passe();
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt;let lectures=0,appels=0;
    const objets=m.roster.concat(m.hist.flatMap(t=>[t,t.a,t.b])),descripteurs=[];
    for(const f of objets)for(const k of ['niv','niveau','level','stats','phys','skills','trauma'])
      {descripteurs.push([f,k,Object.getOwnPropertyDescriptor(f,k)]);Object.defineProperty(f,k,{configurable:true,get(){lectures++;throw Error(k);}});}
    const noms=['mgmtCombatProfile','mgmtNiveauCombat','makeFighter','makePhysical','mgmtReplayFight','mgmtObservation','mgmtAvantCote'],anciens=noms.map(k=>window[k]);
    try{for(const k of noms)window[k]=()=>{appels++;throw Error(k);};
      const p=mgmtSoireeProgramme(m)[0],c={m,h:p.h};
      const a=mgmtPresentationCombat(c,p.a.id,p.b.id),b=mgmtPronosticsCombat(c,p.a.id,p.b.id),d=mgmtPresentationCombatSoiree(m,0);
      return {lectures,appels,a,b,d};
    }finally{noms.forEach((k,i)=>window[k]=anciens[i]);for(const [f,k,d] of descripteurs){if(d)Object.defineProperty(f,k,d);else delete f[k];}}})())`));
  assert.equal(r.lectures,0);assert.equal(r.appels,0);assert.deepEqual(r.a.pronostics,r.b);assert.deepEqual(r.d.presentation,r.a);
});
// Porte les adresses publiques T1/T2 : projection distincte des récits historiques.
function verifierSources(m,h,sources){
  for(const s of sources){
    if(s.type==='hist'){
      if(!m.hist[s.index]||(!s.projection&&s.index>=h))throw Error('Trace orpheline');
      if(s.projection&&(s.index<h||!m.hist[s.index][s.cote]))throw Error('Projection orpheline');
    }else if(s.type==='fiche'){
      if(!m.roster.some(f=>f.id===s.id))throw Error('Fiche orpheline');
    }else if(s.type==='facts'){
      const f=m.facts[s.index];
      if(!f||f.c>m.cycle||(f.k==='title_fight'&&f.fight>=h))throw Error('Fait orphelin');
      if(f.k==='moment_vie'&&!mgmtVieMomentById(f.m).relais.length)throw Error('Moment privé');
    }else if(s.type==='classement'){
      if(s.h!==h||s.cycle!==(s.mode==='vivant'?m.cycle:m.cycle-1))throw Error('Classement hors frontière');
    }else if(s.type!=='calendrier')throw Error('Source inconnue');
  }
}
function reconstruirePaire(m,h,fait){
  const roster=m.roster.map(f=>{const t=m.hist.slice(h).find(t=>t.a.id===f.id||t.b.id===f.id);
    if(!t)return f;const s=t.a.id===f.id?t.a:t.b;
    return {id:f.id,name:f.name,first:f.first,last:f.last,ck:f.ck,div:f.div,ct:f.ct,age:s.age,W:s.W,L:s.L,D:s.D,lastCycle:s.lastCycle,retired:false};});
  const vue={...m,roster,hist:m.hist.slice(0,h),facts:m.facts.filter(f=>f.c<=m.cycle&&(f.k!=='title_fight'||f.fight<h))};
  const fs=fait.sujets.map(id=>roster.find(f=>f.id===id));
  const traces=fait.sources.filter(s=>s.type==='hist'&&!s.projection).map(s=>m.hist[s.index]);
  switch(fait.famille){
    case 'meme_age':return {tranche:mgmtFaitsTranche(fs[0].age)};
    case 'revanche':return {combats:traces.length};
    case 'contraste_style':return {styles:fs.map(f=>mgmtIdentiteStyle(f,vue))};
    case 'meme_camp':return {nom:mgmtCamp(vue,fs[0],vue.cycle,vue).nom};
    case 'rangs_voisins':{const rang=mgmtDivisionRankingCalcule(vue,fs[0].div,'organization');return {rangs:fs.map(f=>rang.findIndex(x=>x.id===f.id)+1)};}
    case 'adversaire_commun':{
      const adv=traces.map(t=>t.a.id===fs[0].id?t.b.id:t.b.id===fs[0].id?t.a.id:null).find(Boolean);
      if(!traces.some(t=>[t.a.id,t.b.id].includes(fs[1].id)&&[t.a.id,t.b.id].includes(adv)))throw Error('Adversaire non commun');
      return {adversaire:adv};
    }
    case 'titre':return {champion:mgmtSplitTitle(vue,fs[0].div).id};
    default:throw Error('Famille de paire inconnue');
  }
}
function reconstruireIndividuel(m,h,fait){
  const roster=m.roster.map(f=>{const t=m.hist.slice(h).find(t=>t.a.id===f.id||t.b.id===f.id);
    if(!t)return f;const s=t.a.id===f.id?t.a:t.b;
    return {id:f.id,name:f.name,first:f.first,last:f.last,ck:f.ck,div:f.div,ct:f.ct,age:s.age,W:s.W,L:s.L,D:s.D,lastCycle:s.lastCycle,retired:false};});
  const vue={...m,roster,hist:m.hist.slice(0,h),facts:m.facts.filter(f=>f.c<=m.cycle&&(f.k!=='title_fight'||f.fight<h))};
  const f=roster.find(f=>f.id===fait.sujets[0]),traces=fait.sources.filter(s=>s.type==='hist'&&!s.projection).map(s=>m.hist[s.index]);
  const champs=cles=>{const s=fait.sources.find(s=>s.champs&&cles.every(k=>s.champs.includes(k)));
    if(!s)throw Error('Champs sans source');return s.type==='hist'?m.hist[s.index][s.cote]:m.roster.find(f=>f.id===s.id);};
  const classes=fait.sources.filter(s=>s.type==='classement'),pos=s=>mgmtDivisionRankingCalcule(vue,s.div,s.scope,s.mode==='cycle'?s.cycle:undefined).findIndex(x=>x.id===f.id)+1;
  switch(fait.famille){
    case 'age':return {age:champs(['age']).age};
    case 'bilan':{const s=champs(['W','L','D']);return {W:s.W,L:s.L,D:s.D||0};}
    case 'rang':return {rang:pos(classes[0])};
    case 'mouvement':return {places:pos(classes[1])-pos(classes[0])};
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
    case 'victoire_champion':{const x=m.facts[fait.sources.find(s=>s.type==='facts').index],row=mgmtTitleMemoryRows(vue).get(x);return {adversaire:row.championId,cycle:x.c};}
    default:throw Error('Famille individuelle inconnue');
  }
}
test('Monde lot 3 T3 — chaque phrase et preuve retrouve sa source',()=>{
  const w=passe();w.eval(verifierSources.toString());w.eval(reconstruirePaire.toString());w.eval(reconstruireIndividuel.toString());
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,out=[];
    const programmes=mgmtSoireeProgramme(m);
    for(const p of programmes)for(const h of [0,p.h,m.hist.length]){
      const x=mgmtPresentationCombat({m,h},p.a.id,p.b.id);if(!x)continue;
      const base=mgmtFaitsBase({m,h},x.ids[0]);
      for(const f of x.faits){
        verifierSources(m,h,f.fait.sources);
        const attendu=reconstruirePaire(m,h,f.fait);
        if(JSON.stringify(attendu)!==JSON.stringify(f.fait.valeur))throw Error('Valeur non reconstruite '+f.fait.famille);
        const v={...attendu};for(const k of ['styles','rangs'])if(Array.isArray(v[k]))v[k]=v[k].slice().sort((a,b)=>a<b?-1:a>b?1:0).join(' et ');
        for(const k of ['adversaire','champion'])if(k in v)v[k]=m.roster.find(f=>f.id===v[k]).name;
        out.push({texte:f.texte,attendu:mgmtPresentationTexte(MGMT_PRESENTATION_COMBAT_TEXTES[f.modele],v)});
      }
      for(const cote of x.cotes)for(const f of cote.faits){verifierSources(m,h,f.fait.sources);
        if(JSON.stringify(f.fait.valeur)!==JSON.stringify(reconstruireIndividuel(m,h,f.fait)))throw Error('Valeur individuelle sans source');
        out.push({texte:f.texte,attendu:mgmtPresentationPhrase(m,f.fait).texte});}
      const tous=mgmtFaitsCombat({m:{...m,roster:m.roster.slice().sort((a,b)=>a.id<b.id?-1:1)},h},...x.ids);
      const indices=[...new Set(tous.filter(f=>['revanche','adversaire_commun'].includes(f.famille)).flatMap(f=>f.sources.filter(s=>s.type==='hist'&&!s.projection&&s.index<h).map(s=>s.index)))].sort((a,b)=>b-a).slice(0,3);
      if(JSON.stringify(indices)!==JSON.stringify(x.histoire.map(z=>z.index)))throw Error('Ordre histoire');
      for(const z of x.histoire){verifierSources(m,h,z.sources);const t=m.hist[z.index];
        if(JSON.stringify(z.ids)!==JSON.stringify([t.a.id,t.b.id]))throw Error('Côtés histoire');
        for(const recit of z.recits){const cote=t.a.id===recit.id?'A':'B',adv=cote==='A'?t.b:t.a,issue=t.winner==='D'?'D':t.winner===cote?'W':'L';
          out.push({texte:recit.texte,attendu:mgmtPresentationTexte(MGMT_PRESENTATION_COMBATTANT_TEXTES[issue],{adversaire:adv.name,methode:MGMT_FAMILY_LABELS[t.family]||t.family||'',round:Number.isSafeInteger(t.round)?mgmtRoundOrdinal(t.round):''})});}
      }
      for(const pr of x.pronostics){
        const valeurs=[];
        for(const preuve of pr.preuves){verifierSources(m,h,preuve.sources);const v=preuve.valeurs,f=base.population.find(f=>f.id===v.id);
          if(preuve.critere==='bilan'){
            const s=preuve.sources[0],src=s.type==='hist'?m.hist[s.index][s.cote]:m.roster.find(f=>f.id===s.id);
            if(v.W!==src.W||v.L!==src.L||v.D!==(src.D||0))throw Error('Bilan sans source');
            valeurs.push(v.W+v.L+v.D?(v.W+0.5*v.D)/(v.W+v.L+v.D):0.5);
          }else if(preuve.critere==='rang'){
            const i=base.rang.findIndex(x=>x.id===f.id),rang=i<0?base.population.length+1:i+1;
            if(v.rang!==rang)throw Error('Rang sans source');valeurs.push(-rang);
          }else{
            const indices=mgmtObsAvant(m,v.id,h).slice(0,3),resultats=indices.map(index=>{const t=m.hist[index],cote=t.a.id===v.id?'A':'B';return {index,resultat:t.winner==='D'?'D':t.winner===cote?'W':'L'};});
            const score=resultats.reduce((s,x)=>s+(x.resultat==='W'?1:x.resultat==='L'?-1:0),0);
            if(JSON.stringify(v.resultats)!==JSON.stringify(resultats)||score!==v.score)throw Error('Série sans source');valeurs.push(score);
          }
        }
        const choix=pr.voix==='cage-hebdo'?(Math.round(50+30*(valeurs[0]-valeurs[1]))<50?1:0):(valeurs[1]>valeurs[0]?1:0);
        if(pr.vainqueur!==x.ids[choix])throw Error('Choix non public');
        if(pr.voix==='cage-hebdo'){const pA=Math.round(50+30*(valeurs[0]-valeurs[1]));if(pr.pourcentage!==Math.max(pA,100-pA))throw Error('Pourcentage');}
        out.push({texte:pr.texte,attendu:mgmtPresentationTexte(MGMT_PRESENTATION_COMBAT_TEXTES[pr.modele],{vainqueur:base.population.find(f=>f.id===pr.vainqueur).name,pourcentage:pr.pourcentage})});
      }
    }return out;})())`));
  assert.ok(r.length>100);for(const x of r){assert.equal(x.texte,x.attendu);assert.doesNotMatch(x.texte,/\{[^}]+\}/);}
  assert.doesNotMatch(lire("MGMT_PRESENTATION_COMBAT_TEXTES.titre.texte"),/en jeu|disput[ée]/i);
  fixture(5);
  win.eval(`const m=paireFixture;const trace=(a,b,winner)=>({c:1,a:m.roster[a],b:m.roster[b],winner,family:'DEC',round:3});
    m.hist=[trace(0,2,'A'),trace(1,2,'B'),trace(0,3,'D'),trace(0,3,'A'),trace(0,4,'B')];`);
  const ancien=lire("mgmtPresentationHistoire(paireFixture,'a',5,[])");
  const histoire=lire("mgmtPresentationCombat({m:paireFixture},'a','b').histoire");
  assert.ok(!ancien.some(x=>x.index===0));assert.deepEqual(histoire.map(x=>x.index),[1,0]);
  assert.ok(histoire[1].recits[0].texte.includes('Sujet 2'));
});
test('Monde lot 3 T3 — frontière soirée, pureté et rechargement',()=>{
  const w=passe();
  const r=JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,lu=mgmtParseAndValidate(mgmtSerialiser(m)),seed=SEED,avant=JSON.stringify(m),programme=mgmtSoireeProgramme(m);
    const lire=x=>programme.map(p=>mgmtPresentationCombat({m:x,h:p.h},p.a.id,p.b.id));
    const a=lire(m),b=lire(lu),adaptes=programme.map(p=>mgmtPresentationCombatSoiree(m,p.i));
    let frontiere=true;
    for(const p of programme){const copie=JSON.parse(avant),x=mgmtPresentationCombat({m:copie,h:p.h},p.a.id,p.b.id);
      copie.hist.slice(p.h).forEach(t=>{t.winner='D';t.family='KO';t.round=99;});
      if(JSON.stringify(x)!==JSON.stringify(mgmtPresentationCombat({m:copie,h:p.h},p.a.id,p.b.id)))frontiere=false;
    }
    const p=programme[0],zero=mgmtPresentationCombat({m,h:0},p.a.id,p.b.id),fin=mgmtPresentationCombat({m,h:m.hist.length},p.a.id,p.b.id);
    const gel=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(gel);Object.freeze(x);}};gel(m);
    const c=lire(m);G.mgmt={graine:'interdit'};const d=lire(m);
    const invalides=[-1,0.5,999,'0'].map(i=>mgmtPresentationCombatSoiree(m,i));
    const sans=mgmtPresentationCombatSoiree({},0),brise=JSON.parse(avant);brise.lastEvent.fights[0].a='absent';
    const traceInvalide=mgmtPresentationCombatSoiree(brise,0);
    G.mgmt=m;return {a,b,c,d,adaptes,frontiere,seed:SEED===seed,intact:avant===JSON.stringify(m),zero,fin,invalides,sans,traceInvalide};})())`));
  assert.deepEqual(r.a,r.b);assert.deepEqual(r.a,r.c);assert.deepEqual(r.c,r.d);
  assert.ok(r.frontiere);assert.ok(r.seed);assert.ok(r.intact);assert.equal(r.zero.h,0);assert.deepEqual(r.zero.histoire,[]);
  assert.ok(r.fin.h>0);assert.deepEqual(r.invalides,[null,null,null,null]);assert.equal(r.sans,null);assert.equal(r.traceInvalide,null);
  for(const [i,x] of r.adaptes.entries()){assert.deepEqual(x.presentation,r.a[i]);assert.deepEqual(Object.keys(x),['i','etiquette','rounds','titre','presentation']);}
});
test('Monde lot 3 T3 — féminin et dix propositions exportables',()=>{
  const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
  fixture();win.eval("paireFixture.roster.forEach(f=>f.div=allDivisions().find(d=>d.gender==='F').id)");
  const p=lire("mgmtPresentationCombat({m:paireFixture},'a','b')");assert.ok(p);
  const modeles=lire('Object.values(MGMT_PRESENTATION_COMBAT_TEXTES)');
  assert.equal(modeles.length,10);assert.equal(new Set(modeles.map(x=>x.id)).size,10);assert.ok(modeles.every(x=>x.relu===false));
  for(const texte of p.faits.concat(p.cotes.flatMap(x=>x.faits),p.pronostics).map(x=>x.texte))assert.doesNotMatch(texte,/\{[^}]+\}/);
  const out=path.join('C:/Users/antho/AppData/Local/Temp/opencode',`presentation-t3-${process.pid}.md`);
  try{execFileSync(process.execPath,['tools/exporter-textes.js','--out',out],{cwd:path.join(__dirname,'..')});
    const exporte=fs.readFileSync(out,'utf8');for(const m of modeles){assert.ok(exporte.includes('`MGMT_PRESENTATION_COMBAT_TEXTES.'+m.id+'`'));assert.ok(exporte.includes(m.texte));}
  }finally{if(fs.existsSync(out))fs.unlinkSync(out);}
  // Décision du 13/10 : les réserves de forme sont relevées, pas réécrites par le codeur.
  const reserves=modeles.filter(m=>/\b(?:ils|combattants|gagnant|eux)\b/i.test(m.texte)).map(m=>m.id);
  assert.deepEqual(reserves,['meme_age','revanche','cage-hebdo','le-forum']);
});
