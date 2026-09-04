"use strict";
/* CAGE LEGACY — tests/hubCombatDossier.test.js
   Couvre le Lot P3/2026 : sous-menu Combat du hub (hubCombatHtml(), ui-06),
   les 5 derniers combats de f.history affichés du plus récent au plus
   ancien, avec repli propre sur les sauvegardes anciennes dépourvues de
   oppNick/oppRank/time (ajoutés par ce même lot à applyResult(),
   engine-combat.js). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function fullEntry(over){
  return Object.assign({
    res:'win', method:'KO/TKO', round:2, time:'1:45',
    oppId:1, oppName:'Vera Kane', oppFlag:'🇧🇷', oppNick:'O Machado',
    oppWasChamp:false, oppRecord:'10-2', oppElo:1500, oppRank:6,
  }, over);
}

test('hubCombatHtml() — 5 combats complets : les 5 lignes s’affichent, du plus récent au plus ancien, avec surnom et rang', () => {
  const win = newGameWindow();
  const history = [1,2,3,4,5].map(n => fullEntry({ oppName: `Adversaire${n}`, oppRank: n }));
  const f = { history };
  const html = win.hubCombatHtml(f);
  assert.ok(!/undefined/.test(html), 'aucun "undefined" dans le HTML produit');
  assert.ok(html.includes('Adversaire5') && html.includes('Adversaire1'), 'les 5 combats sont bien présents');
  assert.ok(html.indexOf('Adversaire5') < html.indexOf('Adversaire1'), 'le plus récent (poussé en dernier dans history) apparaît en premier');
  assert.ok(html.includes('Victoire'), 'résultat affiché (mis en majuscules par CSS text-transform:uppercase, pas dans la source)');
  assert.ok(html.includes('« O Machado »'), 'surnom entre guillemets français');
  assert.ok(html.includes('RANG #5'), 'rang de l’adversaire le plus récent affiché dans un tag');
  assert.ok(html.includes('KO/TKO · R2 · 1:45'), 'méthode condensée avec round et temps');
});

test('hubCombatHtml() — seulement 2 combats : pas de crash, le dernier de la liste n’a pas de filet', () => {
  const win = newGameWindow();
  const history = [fullEntry({ oppName: 'Premier' }), fullEntry({ oppName: 'Second' })];
  const f = { history };
  const html = win.hubCombatHtml(f);
  assert.ok(!/undefined/.test(html));
  assert.ok(html.includes('Premier') && html.includes('Second'));
  const borderCount = (html.match(/border-bottom:1px solid var\(--line\)/g) || []).length;
  assert.equal(borderCount, 1, 'sur 2 combats affichés, un seul filet (entre les deux, pas après le dernier)');
});

test('hubCombatHtml() — historique vide : une seule ligne .small.muted, pas de crash', () => {
  const win = newGameWindow();
  const html = win.hubCombatHtml({ history: [] });
  assert.ok(html.includes('Pas encore de combat.'));
  assert.ok(html.includes('small') && html.includes('muted'));
  assert.ok(!/undefined/.test(html));
});

test('hubCombatHtml() — entrée ancienne sans oppNick/oppRank/time : repli propre, aucun "undefined", pas de guillemets ni de tag vides', () => {
  const win = newGameWindow();
  const oldEntry = { res:'loss', method:'Soumission', round:1, oppId:2, oppName:'Ana Ruiz', oppFlag:'🇪🇸', oppWasChamp:false, oppRecord:'5-1', oppElo:1400 };
  const html = win.hubCombatHtml({ history: [oldEntry] });
  assert.ok(!/undefined/.test(html), 'aucun "undefined" imprimé pour les champs absents');
  assert.ok(!html.includes('« »'), 'pas de guillemets vides quand oppNick est absent');
  assert.ok(!html.includes('RANG #undefined') && !/RANG #\s*<\/span>/.test(html), 'pas de tag de rang vide/undefined quand oppRank est absent');
  assert.ok(html.includes('Ana Ruiz'), 'le nom de l’adversaire reste affiché');
  assert.ok(html.includes('Soumission · R1'), 'round affiché sans temps quand celui-ci est absent');
  assert.ok(!html.includes('Soumission · R1 · '), 'pas de séparateur orphelin quand le temps est absent');
});

test('hubCombatHtml() — décision unanime/partagée et égalité : pas de round ni de temps affichés', () => {
  const win = newGameWindow();
  const decisionUnanime = { res:'win', method:'Décision', oppId:1, oppName:'A', oppFlag:'🇫🇷' };
  const decisionPartagee = { res:'win', method:'Décision partagée', oppId:2, oppName:'B', oppFlag:'🇫🇷' };
  const egalite = { res:'draw', method:'Égalité', oppId:3, oppName:'C', oppFlag:'🇫🇷' };
  const html = win.hubCombatHtml({ history: [decisionUnanime, decisionPartagee, egalite] });
  assert.ok(html.includes('Décision unanime'));
  assert.ok(html.includes('Décision partagée'));
  assert.ok(html.includes('Égalité'));
  assert.ok(!/Décision[^<]*· R/.test(html), 'aucune décision ne porte de round');
  assert.ok(!/undefined/.test(html));
});

test('applyResult() — pousse oppNick et oppRank sur f.history pour le joueur, sans fabriquer de champ time', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opp = win.G.roster[0];
  opp.nick = 'Le Marteau';
  const res = { winner: 'A', method: 'Décision', scoreA: 30, scoreB: 27 };
  win.applyResult(win.G.f, opp, res, 'A');
  const last = win.G.f.history[win.G.f.history.length - 1];
  assert.equal(last.oppNick, 'Le Marteau');
  assert.equal(typeof last.oppRank, 'number');
  assert.ok(!('time' in last), 'aucun horodatage fabriqué : le champ time n’existe nulle part dans la simulation');
});

test('hubDossierHtml() — six boutons vers les mêmes écrans qu’avant, en grille 2 colonnes', () => {
  const win = newGameWindow();
  const html = win.hubDossierHtml();
  ["profile","rankings","ach","history","beltLineage","hof"].forEach(target => {
    assert.ok(html.includes(`CL.go('${target}')`), `bouton vers l’écran '${target}' présent`);
  });
  assert.ok(!/undefined/.test(html));
});
