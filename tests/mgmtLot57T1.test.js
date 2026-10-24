"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT57_T1_CLASSEMENT] — Monde lot 57 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

function partie(){
  const w=newGameWindow({runMain:true});
  w.eval("setSeed(20261024); mgmtPasseGenerer('split',{soirees:3}); mgmtMondeVivantGenerer(G.mgmt,{soirees:3});");
  return w;
}

test('Monde lot 57 T1 — le classement de guerre relie les huit rangs existants',()=>{
  const w=partie();
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt; return {g:mgmtGuerreClassement(m),o:mgmtOrgClassement(m)};})())`));
    assert.equal(r.g.length,8);
    assert.deepEqual(r.g.map(x=>x.id),r.o.map(x=>x.id));
    assert.deepEqual(r.g.map(x=>x.rang),[1,2,3,4,5,6,7,8]);
    assert.equal(r.g.filter(x=>x.estSplit).length,1);
    const split=r.g.find(x=>x.estSplit);
    assert.equal(split.duelSplit.devant,r.o[split.rang-2]?.id||null);
    assert.equal(split.duelSplit.derriere,r.o[split.rang]?.id||null);
    assert.ok(split.nom&&split.ville);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le classement est déterministe',()=>{
  const a=partie(),b=partie();
  try{
    const code=`JSON.stringify(mgmtGuerreClassement(G.mgmt))`;
    assert.equal(a.eval(code),b.eval(code));
  }finally{a.close();b.close();}
});

test('Monde lot 57 T1 — trois lectures saisonnières restent reliées au classement mondial',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=JSON.parse(w.eval(`(()=>{setSeed(570103);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});const saisons=[];for(let an=0;an<3;an++){saisons.push(mgmtGuerreClassement(m).map(x=>[x.id,x.rang]));if(an<2){m.cycle++;if(typeof mgmtOrgsAgir==='function')mgmtOrgsAgir(m);}}return JSON.stringify({saisons});})()`));
    assert.equal(r.saisons.length,3);
    for(const saison of r.saisons){assert.equal(saison.length,8);assert.deepEqual(saison.map(x=>x[1]),[1,2,3,4,5,6,7,8]);}
    assert.equal(new Set(r.saisons.flatMap(s=>s.map(x=>x[0]))).size,8);
  }finally{w.close();}
});

test('Monde lot 57 T1 — trois soirées réellement jouées gardent les huit organisations classées',()=>{
  const w=partie();
  try{
    const jouees=jouerSoirees(w,3);
    assert.equal(jouees,3);
    const rangs=JSON.parse(w.eval(`JSON.stringify(mgmtGuerreClassement(G.mgmt).map(x=>x.rang))`));
    assert.deepEqual(rangs,[1,2,3,4,5,6,7,8]);
  }finally{w.close();}
});

test('Monde lot 57 T1 — la variation du rang s’appuie sur le relevé précédent sans tirage',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt,avant=mgmtGuerreClassement(m);m.guerre=m.guerre||{};m.guerre.classementPrecedent=avant.map(x=>x.id).reverse();const apres=mgmtGuerreClassement(m).find(x=>x.estSplit);return JSON.stringify({rang:apres.rang,mouvement:apres.mouvement,duel:apres.duelSplit});})()`));
    assert.equal(result.mouvement, 8 - result.rang - (result.rang - 1));
    assert.ok(result.duel);
    assert.ok(Number.isInteger(result.duel.mouvement));
  }finally{w.close();}
});

test('Monde lot 57 T1 — l’écran relie la rivale, les raisons et les duels sans injection',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt; m.guerre={ev:[],rival:null,depuis:0}; const rows=mgmtGuerreClassement(m),id=rows.find(x=>!x.estSplit).id; m.guerre.ev=[{c:m.cycle,o:id,t:'pique',x:null,p:8}]; mgmtRivaleMettreAJour(m); const html=scr_mgmt_guerre(); return JSON.stringify({html,screen:SCREENS.mgmt_guerre()});})()`));
    assert.match(result.html,/LE CLASSEMENT DES HUIT/);
     assert.match(result.html,/TA RIVALE DU MOMENT/);
     assert.match(result.html,/Juste devant/);
     assert.match(result.html,/Depuis la dernière soirée/);
     assert.ok(w.eval(`(()=>{const x=mgmtGuerreClassement(G.mgmt).find(y=>y.estSplit); return typeof x.mouvement==='number';})()`));
    assert.equal(result.html,result.screen);
    assert.match(result.html,/&lt;|SPLIT/);
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    const classes=[...new Set([...result.html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('gu3')))];
    for(const c of classes) assert.match(css,new RegExp('\\.'+c+'(?:[ .:{,#]|\\s*\\{)'));
  }finally{w.close();}
});

test('Monde lot 57 T1 — classement et mouvement ne consomment aucun tirage',()=>{
  const w=partie();
  try{
    const r=JSON.parse(w.eval(`(()=>{const m=G.mgmt;const avant=mgmtGuerreClassement(m);const seed=m.graine;const rng=m.rng;mgmtGuerreClassement(m);return JSON.stringify({seed,rng,seedApres:m.graine,rngApres:m.rng,avant:avant.map(x=>x.id),apres:mgmtGuerreClassement(m).map(x=>x.id)});})()`));
    assert.deepEqual(r.apres,r.avant);
    assert.equal(r.seedApres,r.seed);
    assert.equal(r.rngApres,r.rng);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le rapport de classement reste facultatif sur une partie sans monde vivant',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const result=w.eval(`(()=>{const m=mgmtDefault('Split');return mgmtGuerreClassement(m).length;})()`);
    assert.equal(result,0);
  }finally{w.close();}
});

test('Monde lot 57 T1 — les raisons hostiles de rivalité sont échappées dans le HTML',()=>{
  const w=partie();
  try{
    const hostile='<img src=x onerror=alert(1)>';
    const html=w.eval(`(()=>{const m=G.mgmt;const id=mgmtGuerreClassement(m).find(x=>!x.estSplit).id;m.guerre={ev:[{c:m.cycle,o:id,t:'pique',x:null,p:8}],rival:id,depuis:m.cycle};const raisons=mgmtRivaleRaisons,rivale=mgmtRivaleDuMoment;mgmtRivaleRaisons=()=>[{raison:${JSON.stringify(hostile)},soiree:1}];mgmtRivaleDuMoment=()=>id;try{return scr_mgmt_guerre();}finally{mgmtRivaleRaisons=raisons;mgmtRivaleDuMoment=rivale;}})()`);
    assert.ok(!html.includes(hostile));
    assert.ok(html.includes('&lt;img'));
  }finally{w.close();}
});

test('Monde lot 57 T1 — chaque classe gu3 affichée possède une règle CSS',()=>{
  const w=partie();
  try{
    const html=w.eval('scr_mgmt_guerre()');
    const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
    const classes=[...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('gu3-')))];
    assert.ok(classes.length>0);
    const sansRegle=classes.filter(c=>!new RegExp('\\.'+c+'(?:[ .:{,#]|\\s*\\{)').test(css));
    assert.deepEqual(sansRegle,[]);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le classement expose les quatre mesures mondiales sans état parallèle',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt;const monde=mgmtOrgClassement(m),guerre=mgmtGuerreClassement(m);return JSON.stringify({monde:monde.map(x=>x.id),guerre:guerre.map(x=>({id:x.id,mesures:Object.keys(x.niveaux).sort(),total:x.total}))});})()`));
    assert.deepEqual(result.guerre.map(x=>x.id),result.monde);
    for(const row of result.guerre){
      assert.ok(['notoriete','popularite','puissance','stade'].every(k=>row.mesures.includes(k)));
      assert.ok(Number.isFinite(row.total));
    }
  }finally{w.close();}
});

test('Monde lot 57 T1 — une lecture répétée du classement laisse la sauvegarde inchangée',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt;const avant=JSON.stringify(m);mgmtGuerreClassement(m);const apres=JSON.stringify(m);return JSON.stringify({avant,apres});})()`));
    assert.equal(result.apres,result.avant);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le classement ne produit que les huit organisations connues',()=>{
  const w=partie();
  try{
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt;return JSON.stringify({ids:MGMT_ORGANISATIONS.map(o=>o.id),rangs:mgmtGuerreClassement(m).map(x=>x.rang),connues:mgmtGuerreClassement(m).every(x=>!!mgmtOrgParId(x.id))});})()`));
    assert.equal(result.connues,true);
    assert.equal(result.rangs.length,8);
    assert.deepEqual(result.rangs,[1,2,3,4,5,6,7,8]);
    assert.equal(new Set(result.ids).size,8);
  }finally{w.close();}
});

test('Monde lot 57 T1 — le mouvement affiché précise le nombre de places gagnées',()=>{
  const w=partie();
  try{
    const texte=w.eval(`(()=>{const m=G.mgmt;const rows=mgmtGuerreClassement(m);m.guerre=m.guerre||{};m.guerre.classementPrecedent=rows.map(x=>x.id).reverse();return scr_mgmt_guerre();})()`);
    assert.match(texte,/Split a gagné [1-7] places? et se rapproche du haut du classement/);
  }finally{w.close();}
});

test('Monde lot 57 T1 — les quatre métriques et le rang s’accordent aux données source',()=>{
  const w=partie();
  try{
    const rows=JSON.parse(w.eval(`(()=>{const m=G.mgmt;return JSON.stringify(mgmtGuerreClassement(m).map(x=>({id:x.id,rang:x.rang,niveaux:x.niveaux,rangs:x.rangs})));})()`));
    const source=JSON.parse(w.eval(`JSON.stringify(mgmtOrgClassement(G.mgmt))`));
    assert.equal(rows.length,8);
    for(const row of rows){
      const original=source.find(x=>x.id===row.id);
      assert.ok(original);
      assert.deepEqual(row.niveaux,original.niveaux);
      assert.deepEqual(row.rangs,original.rangs);
      assert.equal(row.rang,original.rang);
      assert.ok(['popularite','stade','notoriete','puissance'].every(k=>Number.isFinite(row.niveaux[k])));
    }
  }finally{w.close();}
});

test('Monde lot 57 T1 — l’interface garde une issue lisible quand une rivale n’existe pas',()=>{
  const w=partie();
  try{
    const html=w.eval(`(()=>{G.mgmt.guerre={ev:[],rival:null,depuis:0};return scr_mgmt_guerre();})()`);
    assert.match(html,/AUCUNE POUR L’INSTANT/);
    assert.match(html,/Aucune rivale ne s’est encore imposée/);
    assert.doesNotMatch(html,/undefined|null/);
  }finally{w.close();}
});
