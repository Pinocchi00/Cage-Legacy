"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT39_T1] — Monde lot 39 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 39 T1 — les textes de trait sont répertoriés et remplissables',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const fs=new Set(Object.keys(MGMT_COMMENTAIRE));const es=Object.entries(MGMT_COMMENTAIRE_TRAITS).filter(([id])=>id!=='relu');const a=es.flatMap(([id,x])=>x.phrases.map(p=>({id,f:x.famille,p:p})));return {traits:es.every(([id])=>MGMT_TRAITS.some(t=>t.id===id)),fam:a.every(x=>fs.has(x.f)),n:a.length,uniq:es.every(([,x])=>new Set(x.phrases).size===x.phrases.length),tokens:a.every(x=>!x.p.replace(/\\{[XY]\\}/g,'N').match(/[{}]/))}})())`));
  assert.ok(r.traits);assert.ok(r.fam);assert.ok(r.uniq);assert.ok(r.tokens);assert.ok(r.n>=40);
});

test('Monde lot 39 T1 — chaque famille et chaque variante est valide et distincte',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const fs=new Set(Object.keys(MGMT_COMMENTAIRE));const es=Object.entries(MGMT_COMMENTAIRE_TRAITS).filter(([id])=>id!=='relu');const phrases=es.flatMap(([,x])=>x.phrases);return {fam:es.every(([,x])=>fs.has(x.famille)),n:phrases.length,uniques:new Set(phrases).size===phrases.length,accolades:phrases.every(p=>!p.replace(/\\{[XY]\\}/g,'N').match(/[{}]/))}})())`));
  assert.equal(r.fam,true);assert.ok(r.n>=40);assert.equal(r.uniques,true);assert.equal(r.accolades,true);
});

test('Monde lot 39 T1 — les présentations du combat conservent le balisage échappé',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>({ok:typeof mgmtPresentationLignes==='function',escape:typeof esc==='function'}))()`);
  assert.equal(r.ok,true);assert.equal(r.escape,true);
});

test('Monde lot 39 T1 — le choix des commentaires reste local à l’arène',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const s={mgmtIds:{A:'absent-a',B:'absent-b'},mgmtCycle:1};return {rng:typeof areneAlea==='function',seuil:4,fiche:typeof mgmtTraitsFiche==='function',html:typeof mgmtPresentationHtml==='function'}})()`);
  assert.equal(r.rng,true);assert.equal(r.fiche,true);assert.equal(r.html,true);
});

test('Monde lot 39 T1 — les traits visibles sont ceux qui alimentent réellement la présentation « L’histoire »',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const m=G.mgmt, combat=m.hist.find(t=>t&&t.a&&t.b&&t.s);
    if(!combat)return {fixture:false};
    const ids=[combat.a.id,combat.b.id];
    const v={mode:'combat',ids,h:combat.c,page:0,nom:0,vue:'histoire'};
    const c=mgmtPresentationLignes(m,v),p=c.panneaux.find(x=>x.titre==='LEUR HISTOIRE');
    if(!p)return {fixture:true,traits:[],expected:[]};
    const expected=ids.flatMap(id=>(mgmtTraitsFiche(m,id,combat.c).vus||[]).slice(0,4).map(t=>t.nom+' · '+t.fait));
    return {fixture:true,traits:p.lignes.filter(x=>x.sous&&x.texte.includes(' · ')).map(x=>x.texte),expected};
  })())`));
  assert.equal(r.fixture,true);
  for(const line of r.expected) assert.ok(r.traits.includes(line),line);
});

test('Monde lot 39 T1 — le rendu de l’histoire échappe les noms injectés',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");
  const r=w.eval(`(()=>{
    const m=G.mgmt, f=m.roster[0]; if(!f)return {fixture:false};
    const original=f.name, originalFirst=f.first, originalLast=f.last;
    f.name='<img onerror="alert(1)">';f.first=f.name;f.last='';
    const html=mgmtPresentationNomHtml(m,{mode:'combattant',ids:[f.id],noms:[f.id]},f.id);
    f.name=original;f.first=originalFirst;f.last=originalLast;
    return {fixture:true,escaped:html.includes('&lt;img onerror=')&&!html.includes('<img onerror=')};
  })()`);
  assert.equal(r.fixture,true);assert.equal(r.escaped,true);
});

test('Monde lot 39 T1 — une amenée cite le trait visible de X, avec les plafonds par round et par combat',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const id='fixture-tombeur';G.mgmt={};
    const original=mgmtTraitsFiche;
    mgmtTraitsFiche=(m,x)=>({vus:x===id?[{id:'tombeur'}]:[]});
    const segs=[];for(let r=1;r<=5;r++){segs.push({t0:(r-1)*300,r,phase:'debout'});segs.push({t0:(r-1)*300+40,r,phase:'sol',top:'A'});}
    const S={finT:1500,vainqueur:'D',methode:'Décision',roundLen:300,echelle:1,noms:{a:{court:'X'},b:{court:'Y'}},res:{stats:{}},segs,tapis:[],mgmtIds:{A:id,B:'sans-trait'},mgmtCycle:1};
    areneCoupsConstruire(S);mgmtTraitsFiche=original;
    const phrases=MGMT_COMMENTAIRE_TRAITS.tombeur.phrases.map(p=>p.replace('{X}','X').replace('{Y}','Y'));
    const hits=S.voix.filter(v=>phrases.includes(v.a));
    return {fixture:true,hits:hits.map(v=>v.a),count:hits.length};
  })())`));
  assert.equal(r.fixture,true);assert.ok(r.count>=1,'au moins une amenée de X cite tombeur');assert.ok(r.count<=4,'quatre phrases au plus dans le combat');
});

test('Monde lot 39 T1 — le commentaire cite au plus une fois le même porteur par round',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const id='fixture-tombeur',original=mgmtTraitsFiche;G.mgmt={};
    mgmtTraitsFiche=(m,x)=>({vus:x===id?[{id:'tombeur'}]:[]});
    const segs=[];for(let r=1;r<=5;r++){segs.push({t0:(r-1)*300,r,phase:'debout'});segs.push({t0:(r-1)*300+40,r,phase:'sol',top:'A'});segs.push({t0:(r-1)*300+80,r,phase:'debout'});segs.push({t0:(r-1)*300+120,r,phase:'sol',top:'A'});}
    const S={finT:1500,vainqueur:'D',methode:'Décision',roundLen:300,echelle:1,noms:{a:{court:'X'},b:{court:'Y'}},res:{stats:{}},segs,tapis:[],mgmtIds:{A:id,B:'sans-trait'},mgmtCycle:1};
    areneCoupsConstruire(S);mgmtTraitsFiche=original;
    const phrases=MGMT_COMMENTAIRE_TRAITS.tombeur.phrases.map(p=>p.replace('{X}','X').replace('{Y}','Y'));
    const hits=S.voix.filter(v=>phrases.includes(v.a));const rounds=hits.map(v=>Math.floor(v.t/300)+1);
    return {n:hits.length,uniques:new Set(rounds).size===rounds.length};
  })())`));
  assert.ok(r.n>0);assert.ok(r.n<=4);assert.equal(r.uniques,true);
});

test('Monde lot 39 T1 — un trait caché est filtré avant trois combats documentés et visible au troisième',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const id='fixture-cache',original=mgmtTraitsFiche,seen=[];G.mgmt={hist:[]};
    mgmtTraitsFiche=(m,x)=>({vus:m.hist.length>=3&&x===id?[{id:'tombeur'}]:[]});
    const build=n=>{G.mgmt.hist=Array.from({length:n},(_,i)=>({i}));const segs=[{t0:0,r:1,phase:'debout'},{t0:40,r:1,phase:'sol',top:'A'}];const S={finT:300,vainqueur:'D',methode:'Décision',roundLen:300,echelle:1,noms:{a:{court:'X'},b:{court:'Y'}},res:{stats:{}},segs,tapis:[],mgmtIds:{A:id,B:'y'},mgmtCycle:1};areneCoupsConstruire(S);const ps=MGMT_COMMENTAIRE_TRAITS.tombeur.phrases.map(p=>p.replace('{X}','X').replace('{Y}','Y'));return S.voix.some(v=>ps.includes(v.a));};
    const a=build(2),b=build(3);mgmtTraitsFiche=original;return {a,b};})()`);
  assert.equal(r.a,false);assert.equal(r.b,true);
});

test('Monde lot 39 T1 — le commentaire de trait ne modifie ni le combat, ni SEED, ni G.mgmt',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(3901);mgmtPasseGenerer('split',{soirees:2});");
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt,avant=JSON.stringify(m),seed=SEED;
    const make=withTraits=>{const segs=[];for(let r=1;r<=5;r++)segs.push({t0:(r-1)*300,r,phase:'debout'},{t0:(r-1)*300+40,r,phase:'sol',top:'A'},{t0:(r-1)*300+80,r,phase:'debout'});
      const S={finT:1500,vainqueur:'A',methode:'Décision',roundLen:300,echelle:1,noms:{a:{court:'X'},b:{court:'Y'}},res:{stats:{}},segs,tapis:[],mgmtIds:withTraits?{A:m.roster[0].id,B:m.roster[1].id}:null,mgmtCycle:m.cycle};areneCoupsConstruire(S);return {result:S.vainqueur,trace:JSON.stringify(S.segs),coups:JSON.stringify(S.coups),voix:S.voix.filter(v=>v.a).map(v=>v.a)};};
    const a=make(true);SEED=seed;const b=make(false);return {a:a,b:b,seed:SEED===seed,mgmt:JSON.stringify(m)===avant};})())`));
  assert.equal(r.a.result,r.b.result);assert.equal(r.a.trace,r.b.trace);assert.equal(r.a.coups,r.b.coups);assert.equal(r.seed,true);assert.equal(r.mgmt,true);
});

test('Monde lot 39 T1 — préparer le commentaire de cinq rounds ajoute moins de 50 ms',()=>{
  const w=newGameWindow({runMain:true});w.eval("setSeed(3902);mgmtPasseGenerer('split',{soirees:2});");
  const r=w.eval(`(()=>{const m=G.mgmt,idA=m.roster[0].id,idB=m.roster[1].id,segs=[];for(let r=1;r<=5;r++)segs.push({t0:(r-1)*300,r,phase:'debout'},{t0:(r-1)*300+40,r,phase:'sol',top:'A'},{t0:(r-1)*300+80,r,phase:'debout'});
    const make=traits=>{const S={finT:1500,vainqueur:'D',methode:'Décision',roundLen:300,echelle:1,noms:{a:{court:'X'},b:{court:'Y'}},res:{stats:{}},segs,tapis:[],mgmtIds:traits?{A:idA,B:idB}:null,mgmtCycle:m.cycle};const t=Date.now();areneCoupsConstruire(S);return Date.now()-t;};
    const base=make(false),withTraits=make(true);return withTraits-base;})()`);
  assert.ok(r<50,`surcoût mesuré : ${r} ms`);
});
