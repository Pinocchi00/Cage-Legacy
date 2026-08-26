"use strict";
/* CAGE LEGACY — tests/saveSystem.test.js
   Couvre la sauvegarde versionnée + récupération automatique (validateSave,
   backup avant écriture, restauration auto si la sauvegarde principale est
   corrompue). Ajouté avec le système lui-même — le pendant "test capture le
   bug pour de bon" recommandé par README-TESTS.md. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function buildCareer(win){
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
}

test('validateSave() rejette une sauvegarde structurellement impossible', () => {
  const win = newGameWindow();
  assert.equal(win.eval(`validateSave(null)`), false);
  assert.equal(win.eval(`validateSave({})`), false, 'pas de f = invalide');
  assert.equal(win.eval(`validateSave({f:{name:'X',W:-1,L:0}})`), false, 'W négatif = impossible');
  assert.equal(win.eval(`validateSave({f:{name:'X',W:NaN,L:0}})`), false, 'NaN = invalide');
  assert.equal(win.eval(`validateSave({f:{name:'X',W:1,L:0,history:'pas un tableau'}})`), false, 'history doit être un tableau');
  assert.equal(win.eval(`validateSave({f:{name:'X',W:1,L:0,div:'div-inexistant'}})`), false, 'division inconnue = invalide');
  assert.equal(win.eval(`validateSave({version:2,f:{name:'X',W:3,L:1,D:0,history:[]}})`), true, 'sauvegarde plausible acceptée');
});

test('save() copie systématiquement la sauvegarde précédente dans la clé de secours', () => {
  const win = newGameWindow();
  buildCareer(win); // CL.create() appelle déjà save() une 1re fois (aucun backup à ce stade : rien à copier)
  const firstPrimary = win.localStorage.getItem('cage-legacy-v3');
  assert.ok(firstPrimary, 'une première sauvegarde doit exister');
  assert.equal(win.localStorage.getItem('cage-legacy-v3_backup'), null, 'pas de backup avant la 2e écriture');
  win.eval(`G.f.W += 1; save()`);
  const backup = win.localStorage.getItem('cage-legacy-v3_backup');
  assert.ok(backup, 'la 2e écriture doit créer un backup');
  assert.equal(backup, firstPrimary, 'le backup doit contenir exactement l’ancienne sauvegarde principale');
});

test('load() restaure automatiquement depuis le backup si la sauvegarde principale est corrompue', () => {
  const win = newGameWindow();
  buildCareer(win);
  win.eval(`save()`);
  const goodSave = win.localStorage.getItem('cage-legacy-v3');
  win.eval(`G.f.W += 5; save()`); // goodSave est maintenant en backup, une 2e version valide est en primary
  win.localStorage.setItem('cage-legacy-v3', goodSave);
  win.eval(`G.f.W += 99`); // corromption de la copie "primary" fraîchement écrite
  win.localStorage.setItem('cage-legacy-v3', '{ceci n\'est pas du JSON valide');
  const ok = win.eval(`load()`);
  assert.equal(ok, true, 'load() doit réussir via le backup malgré un primary illisible');
  const restoredW = win.eval(`G.f.W`);
  assert.ok(typeof restoredW === 'number' && !Number.isNaN(restoredW), 'le combattant restauré a un W numérique valide');
});

test('load() renvoie false proprement si primary ET backup sont corrompus (jamais de plantage)', () => {
  const win = newGameWindow();
  win.localStorage.setItem('cage-legacy-v3', 'pas du JSON');
  win.localStorage.setItem('cage-legacy-v3_backup', 'pas du JSON non plus');
  let threw = false;
  let ok;
  try{ ok = win.eval(`load()`); }catch(e){ threw = true; }
  assert.equal(threw, false, 'load() ne doit jamais lever d’exception');
  assert.equal(ok, false);
  assert.equal(win.eval(`G`), null);
});

test('wipe() efface la sauvegarde principale et son backup, jamais le Panthéon ni les méta-statistiques', () => {
  const win = newGameWindow();
  buildCareer(win);
  win.eval(`save(); G.f.W += 1; save();`); // garantit un backup non vide
  win.eval(`saveHOF([{id:1,name:'Legende Test'}])`);
  win.eval(`saveMetaStats({totalFights:7,totalKO:1,totalSub:0,totalDec:0,totalMoney:0,totalBelts:0,totalRetirements:1,legendPoints:5,unlockedItems:[]})`);
  win.eval(`wipe()`);
  assert.equal(win.localStorage.getItem('cage-legacy-v3'), null);
  assert.equal(win.localStorage.getItem('cage-legacy-v3_backup'), null);
  assert.equal(win.eval(`loadHOF().length`), 1, 'le Panthéon doit survivre à wipe()');
  assert.equal(win.eval(`loadMetaStats().totalFights`), 7, 'les méta-statistiques doivent survivre à wipe()');
});

test('SAVE_VERSION est bien à 3 et migrate() amène toute sauvegarde à cette version', () => {
  const win = newGameWindow();
  assert.equal(win.eval(`SAVE_VERSION`), 3);
  const migrated = win.eval(`migrate({version:1,f:{name:'X',W:0,L:0}})`);
  assert.equal(migrated.version, 3);
});
