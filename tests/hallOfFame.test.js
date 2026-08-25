"use strict";
/* CAGE LEGACY — tests/hallOfFame.test.js
   Panthéon : intronisation, favoris, suppression, export.
   ==== [ANCRE: TESTS_HOF_V3] — Plan V3 LOT 0 §6.1. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function makeEnshrinedFighter(win){
  win.CL.newCareer();
  win.G.draft.first = 'Sim';
  win.CL.create();
  win.G.f.W = 20; win.G.f.L = 3; win.G.f.ko = 8;
  win.eval('enshrine(G.f)');
  return win.eval('loadHOF()');
}

test('intronisation : enshrine(f) ajoute une entrée retrouvable par id', () => {
  const win = newGameWindow({ runMain: true });
  const list = makeEnshrinedFighter(win);
  assert.equal(list.length, 1, 'une carrière intronisée doit produire exactement une entrée');
  assert.ok(list[0].id !== undefined && list[0].id !== null, 'l\'entrée doit porter un id');
});

test('favori : toggleHofFav(id) persiste (id comparé en chaîne, cf. BUG_ID_PANTHEON)', () => {
  const win = newGameWindow({ runMain: true });
  const list = makeEnshrinedFighter(win);
  const id = list[0].id; // id est un NOMBRE côté state — le CL doit accepter la forme chaîne transmise par le HTML
  win.CL.toggleHofFav(String(id));
  assert.equal(win.eval('loadHOF()')[0].favorite, true, 'le favori doit être activé après un premier bascule');
  win.CL.toggleHofFav(String(id));
  assert.equal(win.eval('loadHOF()')[0].favorite, false, 'un second bascule doit le désactiver');
});

test('suppression : deleteHof(id) retire l\'entrée (confirm() accepté par défaut dans le harnais)', () => {
  const win = newGameWindow({ runMain: true });
  const list = makeEnshrinedFighter(win);
  win.CL.deleteHof(String(list[0].id));
  assert.equal(win.eval('loadHOF()').length, 0, 'la légende supprimée ne doit plus apparaître');
});

test('suppression annulée : deleteHof(id) ne retire rien si confirm() est refusé', () => {
  const win = newGameWindow({ runMain: true });
  const list = makeEnshrinedFighter(win);
  win.confirm = () => false;
  win.CL.deleteHof(String(list[0].id));
  assert.equal(win.eval('loadHOF()').length, 1, 'un refus de confirmation doit laisser le Panthéon intact');
});

test('resetHof() garde les favoris et efface le reste', () => {
  const win = newGameWindow({ runMain: true });
  const list1 = makeEnshrinedFighter(win);
  win.CL.toggleHofFav(String(list1[0].id));
  // Une seconde carrière, non favorite.
  win.CL.newCareer(); win.G.draft.first = 'Autre'; win.CL.create();
  win.G.f.W = 5; win.G.f.L = 5;
  win.eval('enshrine(G.f)');
  assert.equal(win.eval('loadHOF()').length, 2, 'deux carrières intronisées doivent donner deux entrées');
  win.CL.resetHof();
  const after = win.eval('loadHOF()');
  assert.equal(after.length, 1, 'resetHof() ne doit garder que les favoris');
  assert.equal(after[0].favorite, true, 'l\'entrée restante doit être celle marquée favorite');
});
