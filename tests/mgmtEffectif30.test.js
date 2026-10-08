"use strict";
/* Demande d'Anthony (08/10/2026) : environ 30 combattants par catégorie dans chaque organisation, et au moins 98 % de prénoms et de noms de famille différents. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('Effectif — les huit organisations, 5 graines chacune : au moins 98 % de prénoms différents et 98 % de noms de famille différents', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`const pires={prenoms:100,noms:100,n:0}; const mauvais=[];
    for(const o of MGMT_ORGANISATIONS) for(let s=1;s<=5;s++){ setSeed(s*101+7); const m=mgmtDefault(o.id); mgmtNewRoster(m); const n=m.roster.length;
      const p=100*new Set(m.roster.map(f=>f.first)).size/n, l=100*new Set(m.roster.map(f=>f.last)).size/n;
      pires.prenoms=Math.min(pires.prenoms,p); pires.noms=Math.min(pires.noms,l); pires.n=Math.max(pires.n,n);
      if(p<98||l<98) mauvais.push([o.id,s,Math.round(p*10)/10,Math.round(l*10)/10]); }
    return {pires,mauvais};`);
  assert.deepEqual(r.mauvais,[]); assert.ok(r.pires.prenoms>=98&&r.pires.noms>=98);
});

test('Effectif — Split compte environ 30 combattants par catégorie (28 à 32), les catégories fortes et faibles des autres s’écartent', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`const c=(id,s)=>{ setSeed(s); const m=mgmtDefault(id); mgmtNewRoster(m); const o={}; for(const f of m.roster) o[f.div]=(o[f.div]||0)+1; return o; };
    const split=[1,2,3,4].map(s=>c('split',s)); const lourds=c('organisation-8',1), femmes=c('organisation-6',1);
    return {min:Math.min(...split.map(o=>Math.min(...Object.values(o)))),max:Math.max(...split.map(o=>Math.max(...Object.values(o)))),cat:split[0]&&Object.keys(split[0]).length,
      fort:lourds['H-heavy'],faible:lourds['H-fly'],fortF:femmes['F-straw']};`);
  assert.equal(r.cat,12); assert.ok(r.min>=28&&r.max<=32,`${r.min}–${r.max}`); assert.ok(r.fort>40&&r.faible<20,'fortes ×1,5, faibles ×0,5'); assert.ok(r.fortF>40);
});

test('Effectif — les paliers d’attente d’une partie neuve valent 2,5 fois ceux de 140 combattants, ceux d’une ancienne partie ne bougent pas', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`return {neuve:mgmtCtSeuils({effectifs:1}),ancienne:mgmtCtSeuils({effectifs:0}),depart:[mgmtCtDepart({effectifs:1}),mgmtCtDepart({effectifs:0})]};`);
  assert.deepEqual(r.neuve,[8,13,18,25]); assert.deepEqual(r.ancienne,[3,5,7,10]); assert.deepEqual(r.depart,[8,3]);
});
