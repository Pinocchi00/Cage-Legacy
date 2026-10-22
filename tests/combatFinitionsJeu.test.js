"use strict";
/* ==== [ANCRE: TEST_COMBAT_FINITIONS_JEU] — Combat lot 1 (22/10/2026, audit du 16/10 D7) : dans le jeu réel (le passé d'une partie neuve, avec les vrais combattants du
   management), les combats finissent comme en vrai — environ la moitié par une finition, un tiers par KO/TKO. Avant : 62 % de finitions, 39 % de KO/TKO. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('Combat lot 1 — les finitions du jeu réel : 45 à 60 % en tout, KO/TKO de 25 à 36 %, soumissions de 12 à 22 %', () => {
  const w = newGameWindow({ runMain: true });
  w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:40});");
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    const h=G.mgmt.hist, c={n:h.length,ko:0,sub:0,stop:0,dec:0};
    for(const t of h){ if(t.family==='ko')c.ko++; else if(t.family==='sub')c.sub++; else if(t.family==='stop')c.stop++; else c.dec++; }
    return c;})())`));
  assert.ok(r.n >= 300, 'assez de combats lus : ' + r.n);
  const P = x => 100 * x / r.n, fin = P(r.ko + r.sub + r.stop);
  assert.ok(fin >= 45 && fin <= 60, 'finitions ' + fin.toFixed(1) + ' %');
  assert.ok(P(r.ko) >= 25 && P(r.ko) <= 36, 'KO/TKO ' + P(r.ko).toFixed(1) + ' %');
  assert.ok(P(r.sub) >= 12 && P(r.sub) <= 22, 'soumissions ' + P(r.sub).toFixed(1) + ' %');
});
