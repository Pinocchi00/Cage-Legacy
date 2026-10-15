"use strict";
/* Mesure longue du budget monde vivant — Monde lot 9 T2b.
   Lancer à la main avant une fusion : node tools/mesure-monde-vivant.js
   Ce scénario de six ans ne fait pas partie de la suite ordinaire (≈16 min). */
const assert = require('node:assert/strict');
const { newGameWindow } = require('../tests/helpers/loadGame');

const GRAINE = 20261015;
const debut = Date.now();
const win = newGameWindow({ runMain: true });
win.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split'); mgmtMondeVivantGenerer(G.mgmt);`);
const serialise = win.eval('mgmtSerialiser(G.mgmt)');
assert.ok(serialise.length <= 1500000, `taille ${serialise.length} octets > 1,5 Mo`);
assert.equal(win.eval(`(function(){ const m=mgmtParseAndValidate(${JSON.stringify(serialise)}); return !!m&&mgmtSerialiser(m)===${JSON.stringify(serialise)}; })()`), true);
process.stdout.write(`Monde vivant : ${serialise.length} octets, création ${((Date.now()-debut)/1000).toFixed(1)} s.\n`);
