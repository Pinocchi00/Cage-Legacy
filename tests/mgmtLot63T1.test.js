"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 63 T1 — chaque famille de l’après a trois formulations spécifiques relu:false',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`MGMT_APRES_CATALOGUE.map(f=>({famille:f.famille,motCle:f.motCle,textes:f.textes.map(x=>x.texte),relu:f.textes.map(x=>x.relu)}))`);
    assert.ok(r.length>=10);
    for(const f of r){assert.equal(f.textes.length,3);assert.deepEqual(new Set(f.textes).size,3);assert.ok(f.textes.every(t=>t.toLowerCase().includes(f.motCle)),f.famille);assert.ok(f.relu.every(x=>x===false));}
    const all=r.flatMap(f=>f.textes);assert.equal(new Set(all).size,all.length);
  }finally{w.close();}
});

test('Monde lot 63 T1 — le catalogue conserve les faits déclencheurs propres à chaque famille',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{const fn=mgmtLendemainApres.toString();return {families:MGMT_APRES_CATALOGUE.map(x=>x.famille),checks:['discours','trait_gagne','touched','demande','interet-organisation','espoirs','title','spectateurs','prime','retraite_annoncee'].map(x=>fn.includes(x))}})()`);
    assert.equal(r.families.length,10);
    assert.ok(r.checks.every(Boolean));
  }finally{w.close();}
});

test('Monde lot 63 T1 — le fait réel de chaque famille produit sa ligne dédiée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{
      const base=G.mgmt, cycle=base.lastEvent.cycle, fight=base.hist.find(t=>t&&t.c===cycle&&t.a&&t.b);
      if(!fight)return JSON.stringify({});
      const cases=[
        ['interpellation',m=>m.facts.push({k:'discours',c:cycle,a:fight.a.id,interpelle:fight.b.id})],
        ['réseaux',m=>m.facts.push({k:'trait_gagne',c:cycle,a:fight.a.id})],
        ['suspension',m=>m.lastEvent.touched=[{id:fight.a.id,days:21}]],
        ['revanche',m=>m.facts.push({k:'demande',c:cycle,a:fight.a.id,want:'revanche',target:fight.b.id})],
        ['autre organisation',m=>m.facts.push({k:'interet-organisation',c:cycle,a:fight.a.id,org:'Rivale'})],
        ['espoir',m=>m.espoirs=[fight.a.id]],
        ['titre',m=>{const t=m.hist.find(x=>x&&x.c===cycle&&x.a&&x.b);t.title=true;}],
        ['salle',m=>m.lastEvent.finance={spectateurs:1}],
        ['prime',m=>m.facts.push({k:'prime',c:cycle,a:fight.a.id})],
        ['retraite',m=>m.facts.push({k:'retraite_annoncee',c:cycle,a:fight.a.id})]
      ];
      return JSON.stringify(cases.map(([family,setup])=>{
        const m=JSON.parse(JSON.stringify(base));m.facts=Array.isArray(m.facts)?m.facts.filter(f=>f.c!==cycle):[];
        m.lastEvent=JSON.parse(JSON.stringify(base.lastEvent));m.hist=JSON.parse(JSON.stringify(base.hist));
        setup(m);return {family,lines:Array.from({length:100},(_,i)=>mgmtLendemainApres(m,cycle+i+1).map(x=>x.famille)).flat()};
      }));
    })()`));
    assert.equal(r.length,10);
    for(const row of r)assert.ok(row.lines.includes(row.family),`${row.family}: ${row.lines.join(', ')}`);
  }finally{w.close();}
});

test('Monde lot 63 T1 — les dix familles réclament chacune le fait réel correspondant',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{const fn=mgmtLendemainApres.toString();return {
      interpellation:/discours/.test(fn)&&/interpelle|target/.test(fn),
      reseaux:/trait_gagne/.test(fn)&&/surnom/.test(fn),
      suspension:/days/.test(fn)&&/touches/.test(fn),
      revanche:/demande/.test(fn)&&/revanche/.test(fn),
      organisation:/interet-organisation/.test(fn)&&/guerre/.test(fn),
      espoir:/espoirs/.test(fn)&&/suivis/.test(fn),
      titre:/title/.test(fn)||/ceinture/.test(fn),
      salle:/spectateurs/.test(fn),prime:/prime/.test(fn),retraite:/retraite_annoncee/.test(fn)
    }})()`);
    assert.deepEqual(Object.values(r),Array(10).fill(true));
  }finally{w.close();}
});

test('Monde lot 63 T1 — le calcul reste pur, borné et déterministe sur une vraie soirée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const m=G.mgmt,b=JSON.stringify(m),a=mgmtApresCalculer(m),c=mgmtApresCalculer(m);return {a,c,unchanged:b===JSON.stringify(m),past:mgmtApresCalculer({...m,lastEvent:{...m.lastEvent,cycle:-1}})}})()`);
    assert.equal(r.unchanged,true);assert.deepEqual(JSON.parse(JSON.stringify(r.a)),JSON.parse(JSON.stringify(r.c)));assert.ok(r.a.length<=3);assert.equal(r.past.length,0);
    for(const x of r.a)assert.equal(x.relu,false);
  }finally{w.close();}
});

test('Monde lot 63 T1 — l’après ne répète pas une formulation pour un combattant sur cinquante soirées',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{const m=G.mgmt;return JSON.stringify(Array.from({length:50},(_,i)=>mgmtLendemainApres(m,m.lastEvent.cycle+i+1)).flat().map(x=>x.texte))})()`));
    assert.ok(r.length>0);
    assert.equal(new Set(r).size,r.length);
  }finally{w.close();}
});

test('Monde lot 63 T1 — une ligne de l’après échappe le nom injecté en HTML',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{const m=G.mgmt,f=m.hist.find(t=>t&&t.c===m.lastEvent.cycle);if(!f)return JSON.stringify({});f.a.name='<img src=x>';m.facts.push({k:'discours',c:m.lastEvent.cycle,a:f.a.id,target:f.b.id});return JSON.stringify({line:mgmtLendemainApres(m,m.lastEvent.cycle+1).map(x=>x.texte).join(' '),safe:esc('<img src=x>')})})()`));
    if(r.line.includes('img')) assert.ok(!r.line.includes('<img'));
    assert.equal(r.safe,'&lt;img src=x&gt;');
  }finally{w.close();}
});

test('Monde lot 63 T1 — l’après ne change pas la sauvegarde et préserve une partie ancienne',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const r=JSON.parse(w.eval(`(()=>{
      const m=G.mgmt,avant=JSON.stringify(m),version=MGMT_SAVE_VERSION;
      mgmtApresCalculer(m);
      const intact=JSON.stringify(m)===avant, valide=validateMgmt(m);
      const ancien=JSON.parse(avant);delete ancien.apres;
      const avantAncien=JSON.stringify(ancien),repare=mgmtRepair(ancien);
      return JSON.stringify({version,intact,valide,absente:!Object.prototype.hasOwnProperty.call(m,'apres'),
        ancienneSansCle:!Object.prototype.hasOwnProperty.call(repare,'apres'),ancienneValide:validateMgmt(repare),
        ancienneConservee:JSON.stringify(repare)===avantAncien});
    })()`));
    assert.equal(r.intact,true);
    assert.equal(r.valide,true);
    assert.equal(r.absente,true);
    assert.equal(r.ancienneSansCle,true);
    assert.equal(r.ancienneValide,true);
    assert.equal(r.ancienneConservee,true);
    assert.ok(r.version>0);
  }finally{w.close();}
});

test('Monde lot 63 T1 — la suite du lendemain montre les mouvements des autres organisations',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(20261024);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
    jouerSoirees(w,1);
    const result=JSON.parse(w.eval(`(()=>{const m=G.mgmt;const org=mgmtMondeVivantIds(m)[0];m.orgs={[org]:{name:'<img src=x> Rivale',roster:[]}};m.guerre={ev:[{c:m.cycle,o:org,t:'agent',x:null,p:8}]};return JSON.stringify({org:'&lt;img src=x&gt; Rivale',raw:'<img src=x>',html:mgmtLendemainMouvementsHtml(m)});})()`));
    assert.ok(result.html.includes(result.org));
    assert.ok(!result.html.includes(result.raw));
    assert.match(result.html,/autre organisation/);
  }finally{w.close();}
});
