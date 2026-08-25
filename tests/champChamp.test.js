"use strict";
/* CAGE LEGACY — tests/champChamp.test.js
   Supercombat double champion (accepter/décliner l'offre, choisir la
   ceinture prioritaire — CORRECTIF_FOCUS_CHAMPCHAMP).
   ==== [ANCRE: TESTS_CHAMPCHAMP_V3] — Plan V3 LOT 0 §6.1. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function makeChampWithOffer(win){
  win.CL.newCareer();
  win.G.draft.first = 'Champ';
  win.CL.create();
  const f = win.G.f;
  f.champion = f.div; f.org = 3;
  const otherDiv = win.eval('DIVISIONS.H.find(d=>d.id!==G.f.div)');
  const rival = win.eval(`makeFighter({gender:'H',div:'${otherDiv.id}',level:70,potential:80})`);
  rival.champion = otherDiv.id;
  f.champChampOffer = { champion: rival, targetDivName: otherDiv.name };
  return { f, otherDiv };
}

test('accepter l\'offre de supercombat pose un combat 5 rounds contre le champion rival', () => {
  const win = newGameWindow({ runMain: true });
  makeChampWithOffer(win);
  win.CL.acceptChampChampOffer();
  assert.equal(win.G.fight.kind, 'champchamp_title');
  assert.equal(win.G.fight.rounds, 5, 'un supercombat se joue en 5 rounds');
  assert.ok(win.G.fight.opp, 'l\'adversaire posé doit être le champion rival de l\'offre');
});

test('décliner l\'offre efface champChampOffer sans toucher au reste de l\'état', () => {
  const win = newGameWindow({ runMain: true });
  const { f } = makeChampWithOffer(win);
  const defensesBefore = f.defenses;
  win.CL.declineChampChampOffer();
  assert.equal(win.G.f.champChampOffer, null, 'l\'offre déclinée doit être effacée');
  assert.equal(win.G.f.defenses, defensesBefore, 'décliner ne doit pas modifier les défenses de titre');
});

test('choisir la nouvelle ceinture (CORRECTIF_FOCUS_CHAMPCHAMP) bascule réellement f.div et régénère le roster', () => {
  const win = newGameWindow({ runMain: true });
  const { otherDiv } = makeChampWithOffer(win);
  const originalDiv = win.G.f.div;
  win.CL.chooseChampChampFocus(otherDiv.id);
  assert.equal(win.G.f.div, otherDiv.id, 'f.div doit refléter la division choisie comme priorité');
  assert.notEqual(win.G.f.div, originalDiv, 'la division doit avoir réellement changé');
  assert.ok(Array.isArray(win.G.roster) && win.G.roster.length > 0, 'le roster doit être régénéré pour la nouvelle division');
});

test('rester sur la ceinture d\'origine ne change pas la division', () => {
  const win = newGameWindow({ runMain: true });
  const { f } = makeChampWithOffer(win);
  const originalDiv = f.div;
  win.CL.chooseChampChampFocus(originalDiv);
  assert.equal(win.G.f.div, originalDiv, 'choisir la division d\'origine doit la laisser inchangée');
});
