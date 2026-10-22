"use strict";
/* ==== [ANCRE: TEST_PARTIE_CACHE] — Monde lot 35 T1 : le cache des parties générées est TRANSPARENT.
   Une partie générée puis relue du cache doit être la même, dans tout ce qui s'observe : le JSON de la partie, l'état de la RNG après l'appel,
   la suite des tirages, le compteur d'identifiants, G.mgmt. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newGameWindow } = require('./helpers/loadGame');
const { empreinte, CACHE_DIR, memory } = require('./helpers/partieCache');

function sansCache(fn) {
  const avant = process.env.CL_TEST_CACHE;
  process.env.CL_TEST_CACHE = '0';
  try { return fn(); } finally { if (avant === undefined) delete process.env.CL_TEST_CACHE; else process.env.CL_TEST_CACHE = avant; }
}
const CODE_PASSE = `setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:3});
  return JSON.stringify({m:JSON.stringify(m),seed:SEED,id:_idCounter,gm:G.mgmt===m,suite:Array.from({length:100},()=>rnd())});`;
const lance = (w, code) => JSON.parse(w.eval(`(function(){${code}})()`));

test('Monde lot 35 T1 — la partie du passé : sans cache, premier appel (écrit), second appel (lit) donnent exactement la même chose', () => {
  const sans = sansCache(() => lance(newGameWindow({ runMain: true }), CODE_PASSE));
  const premier = lance(newGameWindow({ runMain: true }), CODE_PASSE);
  const t0 = Date.now();
  const second = lance(newGameWindow({ runMain: true }), CODE_PASSE);
  const ms = Date.now() - t0;
  assert.equal(premier.m, sans.m, 'JSON identique au premier appel');
  assert.equal(second.m, sans.m, 'JSON identique en relisant le cache');
  assert.equal(second.seed, sans.seed, 'SEED après l\'appel');
  assert.equal(second.id, sans.id, 'compteur d\'identifiants');
  assert.deepEqual(second.suite, sans.suite, 'les 100 tirages suivants sont les mêmes');
  assert.equal(second.gm, true, 'G.mgmt est la partie rendue');
  console.log('second appel du cache (fenêtre + 3 soirées) : ' + ms + ' ms');
  assert.ok(ms < 6000, 'relire le cache est rapide : ' + ms + ' ms');
});

test('Monde lot 35 T1 — le monde vivant : la partie reçue est mutée comme par la vraie fonction (m.orgs, m.mondeVivant), même JSON et même SEED', () => {
  const CODE = `setSeed(20261008); const m=mgmtPasseGenerer('split',{soirees:2}); const r=mgmtMondeVivantGenerer(m,{soirees:2});
    return JSON.stringify({m:JSON.stringify(m),meme:r===m,seed:SEED,id:_idCounter,vivant:m.mondeVivant,n:Object.keys(m.orgs).length,suite:Array.from({length:100},()=>rnd())});`;
  const sans = sansCache(() => lance(newGameWindow({ runMain: true }), CODE));
  lance(newGameWindow({ runMain: true }), CODE);
  const second = lance(newGameWindow({ runMain: true }), CODE);
  assert.equal(sans.vivant, true); assert.equal(sans.n, 7);
  assert.equal(second.m, sans.m, 'JSON identique');
  assert.equal(second.meme, true, 'la fonction rend la partie reçue');
  assert.equal(second.seed, sans.seed); assert.equal(second.id, sans.id);
  assert.deepEqual(second.suite, sans.suite);
});

test('Monde lot 35 T1 — l\'empreinte change avec le code, les arguments et la graine ; un fichier de cache abîmé est ignoré', () => {
  const f = ['engine.js'];
  const base = empreinte(f, 'passe', ['split', { soirees: 3 }], 1);
  assert.notEqual(base, empreinte(f, 'passe', ['split', { soirees: 4 }], 1), 'arguments');
  assert.notEqual(base, empreinte(f, 'passe', ['split', { soirees: 3 }], 2), 'graine');
  assert.notEqual(base, empreinte(f, 'monde', ['split', { soirees: 3 }], 1), 'fonction');
  assert.notEqual(base, empreinte(['engine.js', 'engine-combat.js'], 'passe', ['split', { soirees: 3 }], 1), 'liste de fichiers du jeu');
  /* un cache tronqué : la clé existe sur le disque mais illisible → la fonction régénère sans erreur */
  const CODE = `setSeed(777); const m=mgmtPasseGenerer('split',{soirees:1}); return JSON.stringify({n:m.roster.length,seed:SEED});`;
  const avant = new Set(fs.existsSync(CACHE_DIR) ? fs.readdirSync(CACHE_DIR) : []);
  const a = lance(newGameWindow({ runMain: true }), CODE);
  const neufs = fs.readdirSync(CACHE_DIR).filter(n => n.endsWith('.json') && !avant.has(n));
  /* on n'abîme QUE le fichier créé par cet appel (graine 777), jamais ceux que d'autres fichiers de test lisent en même temps */
  for (const nom of neufs) fs.writeFileSync(path.join(CACHE_DIR, nom), '{"partie":"tronq');
  memory.clear();
  const b = lance(newGameWindow({ runMain: true }), CODE);
  assert.deepEqual(b, a, 'le fichier abîmé est ignoré, la partie est régénérée à l\'identique');
});

test('Monde lot 35 T1 — sans runMain (G nul au départ), la génération met G en place comme la vraie fonction, et le cache aussi', () => {
  const CODE = `setSeed(20261018); const m=mgmtPasseGenerer('split',{soirees:1}); return JSON.stringify({g:typeof G,gm:G.mgmt===m,th:G.theme,seed:SEED,n:m.roster.length});`;
  const sans = sansCache(() => lance(newGameWindow(), CODE));
  lance(newGameWindow(), CODE);
  const second = lance(newGameWindow(), CODE);
  assert.deepEqual(second, sans);
  assert.equal(sans.gm, true); assert.equal(sans.g, 'object');
});
