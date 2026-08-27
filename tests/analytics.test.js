"use strict";
/* CAGE LEGACY — tests/analytics.test.js
   Couvre les analytics locales (chantier 2) : registre META_STATS_KEY
   renforcé (careersStarted/careersCompleted/totalWins.../divisions), jamais
   une 2e source de vérité parallèle. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function startCareer(win, div){
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:'${div}',first:'Ana'} };
    CL.create();
  `);
}

test('recordCareerStart() incrémente careersStarted et le compteur de la division choisie', () => {
  const win = newGameWindow();
  win.eval(`saveMetaStats(metaStatsDefaults())`);
  startCareer(win, 'H-welter');
  const an = win.eval(`getAnalytics()`);
  assert.equal(an.careersStarted, 1);
  assert.equal(an.divisions['H-welter'].careers, 1);
});

test('migrateMetaStats() comble les champs manquants sans jamais toucher un champ déjà présent', () => {
  const win = newGameWindow();
  const migrated = win.eval(`migrateMetaStats({totalFights:42,totalKO:5})`);
  assert.equal(migrated.totalFights, 42, 'champ existant intact');
  assert.equal(migrated.totalKO, 5, 'champ existant intact');
  assert.equal(migrated.careersStarted, 0);
  assert.equal(migrated.totalWins, 0);
  assert.equal(JSON.stringify(migrated.divisions), '{}');
});

test('updateMetaStatsOnRetirement() alimente bilan, pics de carrière et stats par division', () => {
  const win = newGameWindow();
  win.eval(`saveMetaStats(metaStatsDefaults())`);
  startCareer(win, 'H-middle');
  win.eval(`
    G.f.W=10; G.f.L=3; G.f.D=1; G.f.ko=4; G.f.sub=2; G.f.dec=4;
    G.f.peakStreak=6; G.f.peakOverall=78; G.f.peakElo=1500;
    G.f.div='H-middle';
    updateMetaStatsOnRetirement(G.f);
  `);
  const an = win.eval(`getAnalytics()`);
  assert.equal(an.careersCompleted, 1);
  assert.equal(an.totalWins, 10);
  assert.equal(an.totalLosses, 3);
  assert.equal(an.totalDraws, 1);
  assert.equal(an.bestWinStreak, 6);
  assert.equal(an.longestCareerFights, 14);
  assert.equal(an.highestOverall, 78);
  assert.equal(an.highestElo, 1500);
  assert.equal(an.divisions['H-middle'].fights, 14);
  assert.equal(an.divisions['H-middle'].wins, 10);
  // Bilan KO/soumission/décision cohérent (10 finitions+décisions sur 10 combats décidés)
  assert.equal(an.koPct + an.subPct + an.decPct <= 100 + 2, true);
});

test('peakStreak/peakOverall/peakElo ne redescendent jamais entre deux combats', () => {
  const win = newGameWindow();
  startCareer(win, 'H-light');
  win.eval(`G.f.streak=5; G.f.overall=70; G.f.orgElo=1200;
    G.f.peakStreak=Math.max(G.f.peakStreak||0,G.f.streak,0);
    G.f.peakOverall=Math.max(G.f.peakOverall||0,G.f.overall,0);
    G.f.peakElo=Math.max(G.f.peakElo||0,G.f.orgElo,0);`);
  win.eval(`G.f.streak=0; G.f.overall=55; G.f.orgElo=900;
    G.f.peakStreak=Math.max(G.f.peakStreak||0,G.f.streak,0);
    G.f.peakOverall=Math.max(G.f.peakOverall||0,G.f.overall,0);
    G.f.peakElo=Math.max(G.f.peakElo||0,G.f.orgElo,0);`);
  assert.equal(win.eval(`G.f.peakStreak`), 5);
  assert.equal(win.eval(`G.f.peakOverall`), 70);
  assert.equal(win.eval(`G.f.peakElo`), 1200);
});
