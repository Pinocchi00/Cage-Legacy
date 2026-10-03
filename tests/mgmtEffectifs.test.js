"use strict";
/* Lot 5 H4 (contrat §3.1, décision du 30/09) : plus de combattants, soirée à
   5 + 7. Une partie neuve porte effectifs 1 ; une partie d'avant H4 (migration
   12 → 13) garde son monde à 30, son vestiaire et sa carte. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

test('H4 — partie neuve : version 13, effectifs 1, carte 5 + 7, vestiaire de 130 à 150', () => {
  const win=newGameWindow();
  const r=result(win,`
    const tailles=[];
    for(let s=1;s<=12;s++){ setSeed(s); const m=mgmtDefault(); mgmtNewRoster(m); tailles.push(m.roster.length); }
    const m=mgmtDefault();
    return {v:m.v,effectifs:m.effectifs,main:m.card.sizeMain,prelims:m.card.sizePrelims,
      min:Math.min(...tailles),max:Math.max(...tailles),valide:(function(){ mgmtNewRoster(m); mgmtExteriorEnsure(m); return validateMgmt(m); })(),
      constMin:MGMT_ROSTER_MIN,constMax:MGMT_ROSTER_MAX};
  `);
  assert.equal(r.v,13); assert.equal(r.effectifs,1);
  assert.equal(r.main,5); assert.equal(r.prelims,7);
  assert.ok(r.min>=130&&r.max<=150,`vestiaire ${r.min}–${r.max}`);
  assert.ok(r.valide,'la partie neuve passe la porte de sauvegarde');
});

test('H4 — le vestiaire est réparti comme le monde (~14 % de chaque catégorie)', () => {
  const win=newGameWindow();
  const r=result(win,`
    const compte={}; let total=0;
    for(let s=1;s<=40;s++){ setSeed(s); const m=mgmtDefault(); mgmtNewRoster(m);
      for(const f of m.roster){ compte[f.div]=(compte[f.div]||0)+1; total++; } }
    const somme=Object.values(MGMT_WORLD_SIZE).reduce((a,b)=>a+b,0);
    return {total,somme,ecarts:Object.entries(MGMT_WORLD_SIZE).map(([d,n])=>[d,100*(compte[d]||0)/total,100*n/somme])};
  `);
  assert.equal(r.somme,1025,'le monde compte 1 025 combattants (contrat §3.1)');
  for(const [d,obs,att] of r.ecarts){
    assert.ok(Math.abs(obs-att)<1.5,`${d} : ${obs.toFixed(1)} % au vestiaire pour ${att.toFixed(1)} % du monde`);
  }
});

test('H4 — le monde tient la table par catégorie, Split compris, et la retraite est remplacée', () => {
  const win=newGameWindow();
  const r=result(win,`
    setSeed(77); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
    const ouverture=allDivisions().map(d=>[d.id,mgmtWorldLivingCount(m,d.id),MGMT_WORLD_SIZE[d.id]]);
    const f=m.roster[0]; f.retired='medical'; mgmtExteriorEnsure(m);
    return {ouverture,apres:mgmtWorldLivingCount(m,f.div),cible:MGMT_WORLD_SIZE[f.div],quota:mgmtWorldQuota(m,f.div)};
  `);
  for(const [d,vivants,cible] of r.ouverture) assert.equal(vivants,cible,`${d} : quota exact à l'ouverture`);
  assert.equal(r.apres,r.cible,'la place libérée est reprise');
  assert.equal(r.quota,r.cible);
});

test('H4 — migration 12 → 13 : une partie commencée garde son monde à 30, son vestiaire et sa carte', () => {
  const win=newGameWindow();
  const r=result(win,`
    setSeed(31); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); mgmtNewPile(m);
    const avant={n:m.roster.length,prelims:m.card.sizePrelims,vivants:allDivisions().map(d=>mgmtWorldLivingCount(m,d.id))};
    const brut=JSON.parse(JSON.stringify(m)); brut.v=12; delete brut.effectifs;
    const migre=mgmtMigrate(brut);
    mgmtExteriorEnsure(migre);
    return {v:migre.v,effectifs:migre.effectifs,n:migre.roster.length,prelims:migre.card.sizePrelims,
      avant,vivants:allDivisions().map(d=>mgmtWorldLivingCount(migre,d.id)),quota:mgmtWorldQuota(migre,'H-light'),valide:validateMgmt(migre)};
  `);
  assert.equal(r.v,13); assert.equal(r.effectifs,0);
  assert.equal(r.n,r.avant.n,'aucun combattant ajouté ni retiré');
  assert.equal(r.prelims,4,'la carte garde ses quatre préliminaires');
  assert.deepEqual(r.vivants,r.avant.vivants,'le monde ne grossit pas en cours de route');
  assert.equal(r.quota,30); assert.ok(r.valide);
});

test('H4 — validation : effectifs doit valoir 0 ou 1', () => {
  const win=newGameWindow();
  const r=result(win,`
    setSeed(5); const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
    const ok=validateMgmt(m); m.effectifs=2; const mauvais=validateMgmt(m); m.effectifs=0; const ancien=validateMgmt(m);
    return {ok,mauvais,ancien};
  `);
  assert.equal(r.ok,true); assert.equal(r.mauvais,false); assert.equal(r.ancien,true);
});

test('H4 — Leïla propose les sept préliminaires, la soirée joue douze combats', () => {
  const win=newGameWindow();
  const r=result(win,`
    setSeed(301); const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=2; mgmtExteriorEnsure(m);
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    const paires=[]; const pris=new Set();
    for(const a of dispo){ if(pris.has(a.id)) continue; const b=dispo.find(o=>o.id!==a.id&&!pris.has(o.id)&&o.div===a.div);
      if(b){ pris.add(a.id); pris.add(b.id); paires.push([a,b]); } if(paires.length===5) break; }
    m.card.main=paires.map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
    m.pile=[]; m.open=null;
    const issue=mgmtClosePile(m);
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    const propose=bulk?bulk.fights.length:-1;
    const valide=bulk?mgmtDecide(m,bulk.id,'validate'):false;
    const ev=mgmtRunEvent(m);
    return {main:paires.length,issue,propose,valide:!!valide,prelims:m.card.prelims.length,joues:ev?ev.fights.length:-1};
  `);
  assert.equal(r.main,5); assert.equal(r.issue,'refill');
  assert.equal(r.propose,7,'Leïla propose sept combats');
  assert.ok(r.valide);
  assert.equal(r.joues,12,'cinq combats principaux et sept préliminaires');
});

test('H4 — droits télé : la carte contractuelle est celle de la partie', () => {
  const win=newGameWindow();
  const r=result(win,`
    return {neufSurNeuf:mgmtEventRecette(8,1,100,9,0,9).tv,douzeSurDouze:mgmtEventRecette(8,1,100,12,0,12).tv,
      neufSurDouze:mgmtEventRecette(8,1,100,9,0,12).tv,defaut:mgmtEventRecette(8,1,100,12).tv};
  `);
  assert.equal(r.defaut,r.douzeSurDouze,'sans contrat explicite : la carte de douze');
  assert.equal(r.neufSurNeuf,r.douzeSurDouze,'une carte complète paie ses droits entiers, à 9 comme à 12');
  assert.ok(Math.abs(r.neufSurDouze-Math.round(r.douzeSurDouze*9/12))<=1,'neuf combats sur douze : trois quarts des droits');
});
