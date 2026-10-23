"use strict";
/* ==== [ANCRE: TEST_MGMT_TRAITS_EFFETS] — Monde lot 32 T2 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('Monde lot 32 T2 — un trait, un effet : cinq traits ajustent leurs attributs entre 1 et 100 ; sans trait ni relevé, aucun effet', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((()=>{
    const cas=[['menton-granit','chin',5.25],['menton-fele','chin',-5.25],['ne-se-releve-pas','tdd',-4.5],['chasseur-de-cou','submission',5.25],['poings-de-marbre','power',3.75]];
    const sortie=cas.map(([id,k,d])=>{const t=MGMT_TRAITS.find(x=>x.id===id);const c={attrs:{[k]:99}};mgmtTraitEffetAppliquer(t.effet,c);return {id,k,d,attendu:Math.max(1,Math.min(100,Math.round(99+d))),reel:c.attrs[k]};});
    const f={id:'sans-releve',attrs:{chin:70},dynamic:70,overall:70,age:28,div:'H-light'};
    const m={cycle:4,roster:[f],hist:[],facts:[]};
    const profil={attrs:{chin:70},overall:70};mgmtTraitsAppliquer(m,f,4,profil);
    const avant=profil.attrs.chin;
    return {sortie,avant,sans:mgmtTraitsDe(m,f.id,4)};
  })())`));
  assert.equal(r.sortie.length, 5);
  for (const x of r.sortie) assert.equal(x.reel, x.attendu, x.id);
  assert.deepEqual(r.sans, ['debutant']);
  assert.equal(r.avant, 70);
});

test('Monde lot 32 T2 — le rejeu reste identique après ajout de combats postérieurs', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((()=>{
    setSeed(20261008); mgmtPasseGenerer('split',{soirees:6}); const m=G.mgmt; const f=m.roster.find(x=>!mgmtIsRetired(x));
    if(!f)return {ok:false}; const avant=JSON.stringify(mgmtFightReady(f,2));
    const ancien=m.hist[0]; if(!ancien)return {ok:false};
    for(let i=0;i<3;i++)m.hist.push({...ancien,c:(m.cycle||0)+i+1,seed:(ancien.seed||1)+i+1});
    return {ok:true,avant,apres:JSON.stringify(mgmtFightReady(f,2))};
  })())`));
  assert.equal(r.ok, true);
  assert.equal(r.avant, r.apres);
});

test('Monde lot 32 T2 — pas de lecture du futur : mgmtFightReady ne change pas avec un combat de cycle >= c', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);mgmtPasseGenerer('split',{soirees:2});const m=G.mgmt;const f=m.roster.find(x=>!mgmtIsRetired(x));const c=1;const a=JSON.stringify(mgmtFightReady(f,c));const t=m.hist.find(x=>x.a&&x.a.id===f.id||x.b&&x.b.id===f.id);if(t)m.hist.push({...t,c});return {a,b:JSON.stringify(mgmtFightReady(f,c))};})())`));
  assert.equal(r.a, r.b);
});

test('Monde lot 32 T2 — chaque trait à effet figure dans TRAITS-MESURES.md avec verdict mesurable', () => {
  const fs = require('node:fs');
  const texte = fs.readFileSync(require('node:path').join(__dirname, '..', 'tools/reports/TRAITS-MESURES.md'), 'utf8');
  const w = newGameWindow({ runMain: true });
  const ids = JSON.parse(w.eval(`JSON.stringify(MGMT_TRAITS.filter(t=>t.effet).map(t=>t.id))`));
  for (const id of ids) {
    const ligne = texte.split(/\r?\n/).find(x => x.startsWith('| ' + id + ' |'));
    assert.ok(ligne, `${id} absent du rapport`);
    assert.match(ligne, /\| mesurable \|$/, `${id} n'a pas un verdict mesurable`);
  }
});
