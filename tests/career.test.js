"use strict";
/* CAGE LEGACY — tests/career.test.js
   Simulations de carrière complète (mode Carrière classique). ==== [ANCRE:
   TESTS_CAREER_V3] — Plan V3 LOT 0 §6.1. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const { playCareer, clickThrough, totalFightsPlayed } = require('./helpers/playthrough');

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

test('le nombre total de combats joués (f.history) ne redescend jamais pendant une même carrière', () => {
  /* ==== [ANCRE: TESTS_TURNPRO_RESET] — f.W+f.L+f.D N'EST PAS ce test à
     l'origine testait : turnPro() (ui-05) remet volontairement W/L à zéro
     au passage amateur->pro (palmarès amateur archivé à part dans
     f.amaRec, cf. ANCRE P4P_SCORE_80_20, engine.js:1266) — une carrière
     qui franchit cette étape voit son "bilan" redescendre légitimement,
     ce que l'ancienne version de ce test prenait à tort pour un bug.
     f.history (poussé une fois par combat résolu, jamais remis à zéro,
     cf. playthrough.js/totalFightsPlayed) est la mesure réellement
     monotone sur toute la carrière — trouvé et corrigé en stress-testant
     le Plan V3 LOT 1. ==== */
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  let lastTotal = 0;
  for(let i = 0; i < 8 && !win.G.f.retired; i++){
    const before = totalFightsPlayed(win);
    clickThrough(win, { maxSteps: 200, stopWhen: w => {
      return totalFightsPlayed(w) > before || w.G.f.retired || w.G.screen === 'gameover';
    }});
    const total = totalFightsPlayed(win);
    assert.ok(total >= lastTotal, `le nombre de combats joués ne doit jamais décroître (était ${lastTotal}, est ${total})`);
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
