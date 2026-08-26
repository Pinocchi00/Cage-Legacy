"use strict";
/* CAGE LEGACY — tests/proceduralNarrative.test.js
   Couvre le chantier 3 : rivalryHeat (renfort de f._rivalries/f._allMeetings,
   déjà posés par ui-05), arcs narratifs (redemption/ascension sur f.streak,
   déjà tenu par applyResult()), actualités contextualisées à partir des
   vraies stats — jamais un nouveau système parallèle. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('rivalryHeat() monte avec les confrontations réelles et rivalryTier() suit les paliers demandés', () => {
  const win = newGameWindow();
  const f = win.eval(`({_allMeetings:{},_rivalries:{}})`);
  win.eval(`G={}`); // rivalryHeat ne touche pas G, mais certaines fonctions engine.js le referencent en global
  assert.equal(win.eval(`rivalryHeat({},1)`), 0, 'pas d’adversaire connu = 0');
  assert.equal(win.eval(`rivalryTier(0).key`), 'normal');
  assert.equal(win.eval(`rivalryTier(25).key`), 'potential');
  assert.equal(win.eval(`rivalryTier(45).key`), 'rivalry');
  assert.equal(win.eval(`rivalryTier(70).key`), 'major');
  assert.equal(win.eval(`rivalryTier(90).key`), 'historic');
  const heat = win.eval(`rivalryHeat({_allMeetings:{7:5},_rivalries:{7:2}},7)`);
  assert.ok(heat > 0 && heat <= 100, 'heat calculée à partir des vrais compteurs, bornée à 100');
});

test('getRivalryPurseMultiplier() garde le calcul du rival déclaré inchangé et ajoute un cas additif pour un adversaire qui chauffe', () => {
  const win = newGameWindow();
  const declaredMult = win.eval(`getRivalryPurseMultiplier({rivalId:9,_allMeetings:{},_rivalries:{}},{id:9})`);
  assert.ok(declaredMult >= 1.5 && declaredMult <= 2.0, 'rival déclaré : plage 1.5-2.0 inchangée');
  const coldMult = win.eval(`getRivalryPurseMultiplier({rivalId:null,_allMeetings:{},_rivalries:{}},{id:9})`);
  assert.equal(coldMult, 1.0, 'aucune confrontation = pas de bonus');
  const warmMult = win.eval(`getRivalryPurseMultiplier({rivalId:null,_allMeetings:{9:5},_rivalries:{9:2}},{id:9})`);
  assert.ok(warmMult > 1.0 && warmMult < 1.5, 'adversaire qui chauffe (non déclaré rival) : bonus modeste, toujours sous le palier du rival déclaré');
});

test('checkNarrativeArc() déclenche un camp de rédemption après 2 défaites d’affilée puis un comeback au retour à la victoire', () => {
  const win = newGameWindow();
  const f = win.eval(`({streak:-2})`);
  const startBeat = win.eval(`(function(){ const f={streak:-2}; const beat=checkNarrativeArc(f); return {beat,arc:f.narrativeArc}; })()`);
  assert.equal(startBeat.beat.kind, 'redemption_start');
  assert.equal(startBeat.arc.type, 'redemption');
  const comeback = win.eval(`(function(){ const f={streak:-2,narrativeArc:null}; checkNarrativeArc(f); f.streak=1; const beat=checkNarrativeArc(f); return {beat,arc:f.narrativeArc}; })()`);
  assert.equal(comeback.beat.kind, 'redemption_comeback');
  const resolved = win.eval(`(function(){ const f={streak:-2,narrativeArc:null}; checkNarrativeArc(f); f.streak=1; checkNarrativeArc(f); f.streak=2; const beat=checkNarrativeArc(f); return {beat,arc:f.narrativeArc}; })()`);
  assert.equal(resolved.arc, null, 'arc refermé après le comeback, ne se répète pas indéfiniment');
});

test('checkNarrativeArc() franchit les paliers d’ascension une seule fois chacun, jamais en boucle sur la même série', () => {
  const win = newGameWindow();
  const first = win.eval(`(function(){ const f={streak:3}; return checkNarrativeArc(f); })()`);
  assert.equal(first.kind, 'ascension');
  assert.equal(first.tier, 1);
  const repeat = win.eval(`(function(){ const f={streak:3,narrativeArc:{type:'ascension',tier:1}}; return checkNarrativeArc(f); })()`);
  assert.equal(repeat, null, 'même palier, même série : pas de re-déclenchement');
  const nextTier = win.eval(`(function(){ const f={streak:6,narrativeArc:{type:'ascension',tier:1}}; return checkNarrativeArc(f); })()`);
  assert.equal(nextTier.tier, 2, 'un palier supérieur est bien franchi');
});

test('generatePlayerContextualNews() pousse dans G.divisionNews des textes qui citent les vraies stats, jamais du générique', () => {
  const win = newGameWindow();
  win.eval(`
    G={season:{year:5},divisionNews:[]};
    const f={name:'Ana Ruiz',streak:6,_allMeetings:{3:4},_rivalries:{3:2}};
    const opp={id:3,name:'Vera Kane'};
    const beat={kind:'ascension',tier:2,label:'Contender légitime',streak:6};
    generatePlayerContextualNews(f,opp,{},beat);
  `);
  const news = win.eval(`G.divisionNews`);
  assert.ok(news.length >= 1, 'au moins une actualité générée');
  const joined = news.map(n => n.text).join(' | ');
  assert.ok(joined.includes('Ana Ruiz'), 'cite le vrai nom du joueur');
  assert.ok(joined.includes('6'), 'cite la vraie série en cours');
  assert.ok(news.every(n => n.player === true), 'toutes marquées player:true');
});
