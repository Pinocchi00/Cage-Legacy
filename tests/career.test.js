"use strict";
/* CAGE LEGACY — tests/career.test.js
   Simulations de carrière complète (mode Carrière classique). ==== [ANCRE:
   TESTS_CAREER_V3] — Plan V3 LOT 0 §6.1. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const { playCareer } = require('./helpers/playthrough');

test('une carrière complète (amateur -> pro -> 40 combats) ne produit jamais d\'erreur JS', () => {
  const win = newGameWindow({ runMain: true });
  const result = playCareer(win, { targetFights: 40, first: 'Sim' });
  // Un arrêt avant la cible n'est un problème QUE s'il n'a ni retraite, ni
  // blessure, ni game over pour l'expliquer — sinon c'est une fin de
  // carrière légitime (mode Iron Man, vieillissement rapide...), pas un
  // signe de bug (même logique que le test "arrêt prématuré" plus bas).
  if(result.fights < 20){
    assert.ok(win.G.f.retired || win.G.screen === 'gameover' || win.G.f.injury,
      `arrêt à ${result.fights} combats sans retraite/blessure/game over — écran actuel : ${win.G.screen}`);
  }
  assert.ok(win.G.f, 'G.f doit rester défini en fin de simulation');
});

test('le bilan W+L+D ne redescend jamais pendant une même carrière', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  const { clickThrough } = require('./helpers/playthrough');
  let lastTotal = 0;
  for(let i = 0; i < 8 && !win.G.f.retired; i++){
    const before = (win.G.f.W || 0) + (win.G.f.L || 0) + (win.G.f.D || 0);
    clickThrough(win, { maxSteps: 200, stopWhen: w => {
      const t = (w.G.f.W || 0) + (w.G.f.L || 0) + (w.G.f.D || 0);
      return t > before || w.G.f.retired || w.G.screen === 'gameover';
    }});
    const total = (win.G.f.W || 0) + (win.G.f.L || 0) + (win.G.f.D || 0);
    assert.ok(total >= lastTotal, `le bilan total ne doit jamais décroître (était ${lastTotal}, est ${total})`);
    if(total === lastTotal && !win.G.f.retired) break; // plus de progrès possible : fin légitime de ce run de test
    lastTotal = total;
  }
  assert.ok(lastTotal >= 1, 'au moins un combat doit avoir été résolu pour que ce test ait un sens');
});

test('une carrière amateur ne s\'arrête jamais prématurément sans raison légitime (retraite ou blessure)', () => {
  const win = newGameWindow({ runMain: true });
  const result = playCareer(win, { targetFights: 3, first: 'Sim' });
  assert.ok(result.fights >= 1, 'au moins un combat doit être résolu en 3 tentatives');
  if(result.fights < 3){
    assert.ok(win.G.f.retired || win.G.screen === 'gameover' || win.G.f.injury,
      `arrêt prématuré (${result.fights} combats) sans retraite ni blessure ni game over — écran actuel : ${win.G.screen}`);
  }
});
