"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow,readScriptOrder}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

test('H3 — chargement : données puis logique pure, avant le bureau',()=>{
  const order=readScriptOrder();
  assert.ok(order.indexOf('mgmt-humanite-data.js')<order.indexOf('mgmt-humanite.js'));
  assert.ok(order.indexOf('mgmt-humanite.js')<order.indexOf('mgmt-bureau.js'));
});

test('H3 — origine enregistrée dès la création ; identité complète, pure et stable après recharge',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`setSeed(20261003); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
      G={theme:'dark',mgmt:m}; const avant=JSON.stringify(m),seed=SEED;
      const tous=m.roster.concat(m.exterieur),identites=tous.map(f=>mgmtIdentite(m,f));
      const noms=tous.every(f=>!f.last||COUNTRIES[f.ck].last.includes(f.last));
      const pur=avant===JSON.stringify(m)&&seed===SEED;
      saveMgmt(); G.mgmt=null; const charge=loadMgmt();
      return {pur,noms,charge,generation:tous.every(f=>f.generation===1),identites,
        recharge:identites.every((id,i)=>JSON.stringify(id)===JSON.stringify(mgmtIdentite(G.mgmt,tous[i])))};`);
    assert.ok(r.pur&&r.noms&&r.charge&&r.generation&&r.recharge);
    for(const id of r.identites){
      assert.deepEqual(Object.keys(id).sort(),['ville','milieu','metier','surnom','rituel','trajectoire','traits'].sort());
      for(const key of ['ville','milieu','metier','surnom','rituel','trajectoire']) assert.equal(typeof id[key],'string');
      assert.equal(Object.keys(id.traits).length,7);
      assert.ok(Object.values(id.traits).every(n=>Number.isInteger(n)&&n>=1&&n<=20));
    }
  }finally{ w.close(); }
});

test('H3 — flux séparés : changer les rituels ne change aucune autre couche ni le profil',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault(); mgmtNewRoster(m); const f=m.roster[0];
      const a=mgmtIdentite(m,f),p=JSON.stringify(mgmtCombatProfile(f)),backup=MGMT_RITUELS.slice();
      MGMT_RITUELS.splice(0,MGMT_RITUELS.length,{texte:'fixture',relu:false});
      const b=mgmtIdentite(m,f); MGMT_RITUELS.splice(0,MGMT_RITUELS.length,...backup);
      delete a.rituel; delete b.rituel; return {a,b,profile:p===JSON.stringify(mgmtCombatProfile(f))};`);
    assert.deepEqual(r.a,r.b); assert.ok(r.profile);
  }finally{ w.close(); }
});

test('H3 — migration 11 → 12 : chaque ancien profil et rejeu reste EXACTEMENT identique',()=>{
  const w=newGameWindow();
  try{
    /* Brief du 06/10, lot 2 : une partie d'avant porte un niveau déduit de son palmarès — la fixture est une partie d'avant. */
    const r=result(w,`setSeed(20261002); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
      m.v=11; for(const f of m.roster){ delete f.ck; delete f.generation; }
      for(const f of m.exterieur) delete f.generation;
      // Chemin du profil v11, copié littéralement depuis origin/main.
      const ancien=f=>{ const saved=SEED; let p;
        try{setSeed(mgmtHashId(f.id));const d=divById(f.div);
          p=makeFighter({div:f.div,gender:d?d.gender:'H',level:mgmtLevelForRecord(f.W,f.L),age:f.age});
        }finally{setSeed(saved);}
        p.id=f.id;p.name=f.name;p.first=f.first;p.last=f.last;p.age=f.age;p.W=f.W;p.L=f.L;p.D=f.D;
        mgmtApplyAgingWear(p,f); return JSON.stringify(p); };
      const profils=m.roster.map(ancien),exterieurs=m.exterieur.map(f=>{
        const t=mgmtExteriorTrace(f,0);return {id:f.id,div:f.div,name:t.name,first:t.first,last:t.last,
          age:t.age,W:t.pro.W,L:t.pro.L,D:0};});
      const extProfils=exterieurs.map(ancien);
      const a=mgmtTraceSide(m.roster[0]),b=mgmtTraceSide(m.roster[1]);
      const fightSeed=SEED,res=simulateFight(mgmtFightReady(m.roster[0],0),mgmtFightReady(m.roster[1],0),3);
      m.hist=[{c:0,slot:'main',seed:fightSeed,rounds:3,a,b,winner:res.winner,
        family:mgmtMethodFamily(res.method,res.winner),round:res.round||3}];
      const hist=JSON.stringify(m.hist),avant=JSON.stringify(mgmtReplayFight(m.hist[0])),seed=SEED;
      mgmtMigrate(m); const premiere=JSON.stringify(m);mgmtMigrate(m);
      const apres=exterieurs.map((f,i)=>({...f,ck:m.exterieur[i].ck,generation:m.exterieur[i].generation}));
      return {v:m.v,valide:validateMgmt(m),generation:m.roster.concat(m.exterieur).every(f=>f.generation===0),
        profils:m.roster.every((f,i)=>profils[i]===JSON.stringify(mgmtCombatProfile(f))),
        ext:apres.every((f,i)=>extProfils[i]===JSON.stringify(mgmtCombatProfile(f))),
        hist:hist===JSON.stringify(m.hist),rejeu:avant===JSON.stringify(mgmtReplayFight(m.hist[0]))&&avant===JSON.stringify(res),
        rng:seed===SEED,idempotent:premiere===JSON.stringify(m)};`);
    /* H4 : la même chaîne mène à l'effectifs 0 ; lot 2 du brief du 06/10 : jusqu'à la version 14. */
    assert.deepEqual(r,{v:14,valide:true,generation:true,profils:true,ext:true,hist:true,rejeu:true,rng:true,idempotent:true});
  }finally{ w.close(); }
});

test('H3 — migration : nom composé retrouvé et repli dédié stable sans RNG globale',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();mgmtNewRoster(m);m.v=11;
      const f=m.roster[0];f.last='De Saint-Gilles';delete f.ck;delete f.generation;
      const autre=m.roster[1];autre.last='inconnu';delete autre.ck;delete autre.generation;
      const copie=JSON.parse(JSON.stringify(m)),seed=SEED;mgmtMigrate(m);rnd();mgmtMigrate(copie);
      return {fr:f.ck,stable:autre.ck===copie.roster[1].ck,rng:SEED!==seed,
        valide:validateMgmt(m)};`);
    assert.equal(r.fr,'FR'); assert.ok(r.stable&&r.rng&&r.valide);
  }finally{ w.close(); }
});

test('H3 — nouveaux profils : style géographique, traces autonomes et décisions cinq rounds fidèles',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();mgmtNewRoster(m);const f=m.roster[0];
      const t=mgmtTraceSide(f),profile=JSON.stringify(mgmtCombatProfile(f));
      const a=mgmtTraceLine(t);const style=mgmtCombatProfile(f).style;
      t.ck='inconnu';const invalide=!mgmtValidTraceSide(t);t.ck=f.ck;
      return {style:style===mgmtIdentiteStyle(f),profil:profile===JSON.stringify(mgmtCombatProfile(a)),
        valide:mgmtValidTraceSide(t),invalide,
        decision:areneVerdictFidele({rounds:5,round:5,winner:'A',family:'dec'},
          {winner:'A',method:'Décision unanime'})};`);
    assert.ok(Object.values(r).every(Boolean));
  }finally{ w.close(); }
});

test('H3 — pays + ville : normalisation exacte et villes-écoles deux fois plus fréquentes',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const p=mgmtIdentiteStylePoids('BR','Curitiba'),villes={};
      for(let i=1;i<=30000;i++){const v=mgmtIdentiteVille({id:'mg'+i,ck:'DAG'});villes[v]=(villes[v]||0)+1;}
      return {muay:p.muayThai,jjb:p.bjj,total:Object.values(p).reduce((a,b)=>a+b,0),villes};`);
    assert.ok(Math.abs(r.total-100)<1e-10);
    assert.ok(Math.abs(r.muay-38/120*100)<1e-10);
    assert.ok(Math.abs(r.jjb-36/120*100)<1e-10);
    for(const v of ['Makhatchkala','Khassaviourt']) assert.ok(Math.abs(r.villes[v]/r.villes.Derbent-2)<.1);
  }finally{ w.close(); }
});

test('H3 — surnoms : catégorie commune, ordre indépendant, arrivées et transfert stables, banques finies',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();
      for(let i=1;i<=150;i++){const f={id:'mg'+i,ck:'JP',div:'H-light'};
        (i%2?m.roster:m.exterieur).push(f);}
      const tous=m.roster.concat(m.exterieur),avant=tous.map(f=>mgmtIdentite(m,f).surnom);
      m.roster.reverse();m.exterieur.reverse();
      const ordre=tous.every((f,i)=>mgmtIdentite(m,f).surnom===avant[i]);
      m.exterieur.push({id:'mg151',ck:'JP',div:'H-light'});
      const arrivee=tous.every((f,i)=>mgmtIdentite(m,f).surnom===avant[i]);
      const f=m.exterieur.pop(),transfert=m.exterieur.pop(),nom=mgmtIdentite(m,transfert).surnom;
      m.roster.push(transfert);
      return {uniques:new Set(avant).size,ordinal:avant.some(n=>n.includes(' · ')),ordre,arrivee,
        transfert:nom===mgmtIdentite(m,transfert).surnom,
        francais:mgmtIdentiteSurnoms({id:'mg1',ck:'CM'}).every(n=>
          Object.values(MGMT_SURNOMS.fr).flat().some(t=>t.texte===n)||n.includes(mgmtIdentiteVille({id:'mg1',ck:'CM'})))};`);
    assert.deepEqual(r,{uniques:150,ordinal:true,ordre:true,arrivee:true,transfert:true,francais:true});
  }finally{ w.close(); }
});

test('H3 — validation : pays et génération invalides refusés en lecture seule',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();mgmtNewRoster(m);mgmtExteriorEnsure(m);
      const variants=[];for(const [k,v] of [['ck','inconnu'],['ck',null],['generation',2],['generation','1']]){
        const copy=JSON.parse(JSON.stringify(m));copy.roster[0][k]=v;
        const before=JSON.stringify(copy);variants.push(!validateMgmt(copy)&&before===JSON.stringify(copy));}
      const ext={...m.exterieur[0],generation:3};return {variants,ext:!mgmtValidExteriorLine(ext)};`);
    assert.ok(r.variants.every(Boolean)&&r.ext);
  }finally{ w.close(); }
});

test('H3 — fiche Split et extérieur : origine et surnom échappés, traits invisibles',()=>{
  const w=newGameWindow();
  try{
    const r=result(w,`const m=mgmtDefault();mgmtNewRoster(m);mgmtExteriorEnsure(m);G={theme:'dark',mgmt:m};
      const f=m.roster[0];f.name='<img src=x onerror=alert(1)>';
      MGMT_FICHE.id=f.id;const html=scr_mgmt_fiche(),id=mgmtIdentite(m,f);
      MGMT_FICHE.id=m.exterieur[0].id;const ext=scr_mgmt_fiche();
      return {nom:html.includes(esc(f.name)),surnom:html.includes(esc(id.surnom)),
        ville:html.includes('de '+esc(id.ville)),pays:html.includes(esc(COUNTRIES[f.ck].name)),
        ext:ext.includes('mgmt-fiche-origine'),traits:!html.includes('discipline')&&!html.includes('fairPlay'),
        injection:!html.includes('<img src=x')};`);
    assert.ok(Object.values(r).every(Boolean));
  }finally{ w.close(); }
});

test('H3 — poids des pays (catalogue §1.2) : deux lois à 100, tirage pondéré, vestiaire neuf plausible',()=>{
  const win=newGameWindow();
  const r=result(win,`
    const somme=o=>Object.values(o).reduce((a,b)=>a+b,0);
    const cles=COUNTRY_KEYS.filter(k=>k in MGMT_PAYS_POIDS.split);
    const n=20000,split={},monde={};
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n;
      const a=mgmtPaysTire(u,'split'),b=mgmtPaysTire(u,'monde');
      split[a]=(split[a]||0)+1; monde[b]=(monde[b]||0)+1;
    }
    setSeed(2025); const m=mgmtDefault(); mgmtNewRoster(m);
    const vestiaire={}; for(const f of m.roster) vestiaire[f.ck]=(vestiaire[f.ck]||0)+1;
    return {sS:somme(MGMT_PAYS_POIDS.split),sM:somme(MGMT_PAYS_POIDS.monde),cles:cles.length,
      split,monde,vestiaire,total:m.roster.length,
      toutesCles:Object.keys(MGMT_PAYS_POIDS.split).every(k=>COUNTRY_KEYS.includes(k))
        &&Object.keys(MGMT_PAYS_POIDS.monde).every(k=>COUNTRY_KEYS.includes(k))};
  `);
  assert.equal(r.sS,100); assert.equal(r.sM,100);
  assert.ok(r.toutesCles,'chaque pays pondéré existe dans COUNTRY_KEYS');
  /* Un balayage uniforme de u rend exactement les poids (×200 sur 20000). */
  for(const [k,p] of Object.entries(win.eval('MGMT_PAYS_POIDS.split'))){
    assert.ok(Math.abs((r.split[k]||0)/200-p)<=0.5,`Split ${k} : ${(r.split[k]||0)/200} pour un poids de ${p}`);
  }
  for(const [k,p] of Object.entries(win.eval('MGMT_PAYS_POIDS.monde'))){
    assert.ok(Math.abs((r.monde[k]||0)/200-p)<=0.5,`monde ${k} : ${(r.monde[k]||0)/200} pour un poids de ${p}`);
  }
  /* Un pays de poids 0 chez Split n'apparaît jamais au vestiaire. */
  for(const k of ['CN','AU','CA']){ if(win.eval(`COUNTRY_KEYS.includes('${k}')`)) assert.equal(r.split[k]||0,0,k); }
  /* Le vestiaire neuf porte la France en tête, comme le catalogue (37 %). */
  const fr=(r.vestiaire.FR||0)/r.total;
  assert.ok(fr>0.2&&fr<0.55,`France au vestiaire : ${Math.round(100*fr)} %`);
});
