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

/* ==== [ANCRE: TESTS_HOF_GARDE_FOU_PURGE] — P5b : garde-fou obligatoire avant
   toute purge de la sauvegarde de carrière (CORRECTIF_RETRAITE_FANTOME_PURGE,
   ui-08-controller-arena.js) — l'entrée du Panthéon doit déjà être persistée,
   complète (récap saison inclus), dans son propre stockage (HOF_KEY, séparé
   de SAVE_KEY) avant que exitLegacy()/newCareer() ne vident la sauvegarde de
   carrière. Voir aussi CORRECTIF_DOUBLE_ENSHRINE (toLegacy()) : l'entrée ne
   doit être ni perdue, ni dupliquée. ==== */
test('CORRECTIF_RETRAITE_FANTOME_PURGE — l\'entrée du Panthéon est persistée et complète (récap saison inclus) avant toute purge', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Ghost'} };
    CL.create();
  `);
  win.G.f.W = 12; win.G.f.L = 2; win.G.f.ko = 6;
  win.G.f.seasonRecap = [
    { year: 1, W: 6, L: 1, koW: 3, subW: 1, decW: 2, trophies: ['Combattant de l’année'], age: 22, org: 1, divName: win.G.f.divName },
    { year: 2, W: 6, L: 1, koW: 3, subW: 1, decW: 2, trophies: [], age: 23, org: 2, divName: win.G.f.divName }
  ];

  win.CL.toLegacy();

  // Persisté dans son propre stockage (HOF_KEY), avant toute purge de SAVE_KEY.
  const list = win.loadHOF();
  const entry = list.find(x => String(x.id) === String(win.G.f.id));
  assert.ok(entry, 'l\'entrée du Panthéon doit exister dès toLegacy(), avant tout retour au menu');
  assert.equal(entry.seasonRecap.length, 2, 'le récap saison par saison doit être intégralement copié dans l\'entrée du Panthéon');
  assert.equal(entry.seasonRecap[0].trophies[0], 'Combattant de l’année', 'le contenu du récap (ex. trophées) doit être préservé tel quel');
  assert.ok(Array.isArray(entry.notableWins), 'notableWins doit être capturé (même vide)');
  assert.ok(Array.isArray(entry.earnedAchievements), 'earnedAchievements doit être capturé (même vide)');
  assert.equal(win.hasSave(), true, 'la sauvegarde de carrière existe encore juste après toLegacy(), avant la purge');

  win.CL.exitLegacy();

  // Après purge : l'entrée du Panthéon doit être intacte, dans son propre stockage.
  assert.equal(win.hasSave(), false, 'la sauvegarde de carrière doit être purgée après "Retour au menu"');
  const afterPurge = win.loadHOF().find(x => String(x.id) === String(entry.id));
  assert.ok(afterPurge, 'l\'entrée du Panthéon ne doit jamais disparaître avec la purge de la sauvegarde de carrière');
  assert.equal(afterPurge.seasonRecap.length, 2, 'le récap saison doit rester complet après la purge');
});

test('CORRECTIF_DOUBLE_ENSHRINE — un double-appel à CL.toLegacy() (double-tap) n\'ajoute pas une seconde entrée au Panthéon', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'DoubleTap'} };
    CL.create();
  `);
  const before = win.loadHOF().length;

  win.CL.toLegacy();
  win.CL.toLegacy();

  const after = win.loadHOF().length;
  assert.equal(after, before + 1, 'un double-tap sur "Prendre ma retraite" ne doit produire qu\'une seule entrée au Panthéon');
  assert.equal(win.G.screen, 'legacy', 'le second appel doit rester sur l’écran de retraite sans ré-introniser');
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
