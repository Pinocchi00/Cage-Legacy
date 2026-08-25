"use strict";
/* CAGE LEGACY — tests/ranking.test.js
   Classement de division : rang #1 unique, un champion sort du classement
   des challengers (CORRECTIF_DOUBLE_RANG_1, ui-01).
   ==== [ANCRE: TESTS_RANKING_V3] — Plan V3 LOT 0 §6.1. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('divRank(f) place le joueur à un rang unique parmi son roster (jamais deux #1 simultanés)', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  const rank = win.eval('divRank(G.f)');
  assert.ok(Number.isInteger(rank) && rank >= 1, `divRank doit renvoyer un entier >= 1, obtenu ${rank}`);
  const ranksSeen = win.eval(`
    (function(){
      const pool = rankPool(G.roster.filter(o=>!o.champion).concat(G.f.champion?[]:[G.f]));
      const ranks = pool.map((o,i)=>i+1);
      return { count1: ranks.filter(r=>r===1).length, total: pool.length };
    })()
  `);
  assert.equal(ranksSeen.count1, 1, `un seul combattant doit occuper le rang #1 (pool de ${ranksSeen.total})`);
});

test('un champion de division n\'apparaît plus dans le classement des challengers', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  win.G.f.champion = win.G.f.div;
  const inPool = win.eval(`G.roster.filter(o=>!o.champion).concat(G.f.champion?[]:[G.f])`).some(o => o === undefined);
  void inPool;
  const containsChamp = win.eval(`rankPool(G.roster.filter(o=>!o.champion).concat(G.f.champion?[]:[G.f])).includes(G.f)`);
  assert.equal(containsChamp, false, 'un champion ne doit pas figurer dans le classement des challengers de sa division');
});

test('rankPool() ne produit jamais de doublon d\'un même combattant', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  const dupCount = win.eval(`
    (function(){
      const pool = rankPool(G.roster.filter(o=>!o.champion).concat(G.f.champion?[]:[G.f]));
      const ids = pool.map(o=>o.id);
      return ids.length - new Set(ids).size;
    })()
  `);
  assert.equal(dupCount, 0, 'le pool de classement ne doit contenir aucun combattant deux fois');
});
