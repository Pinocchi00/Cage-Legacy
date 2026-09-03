"use strict";
/* CAGE LEGACY — tests/invariants.test.js
   Invariants bloquants du Plan V3, §6.2. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('INV-05 — un événement narratif ne se déclenche jamais sans que son req(ctx) soit satisfait (moteur générique)', () => {
  const win = newGameWindow({ runMain: true });
  const ev = expr => win.eval(expr);
  ev(`registerTextPool('inv05_engine_test', [
    {id:'always',text:'INV05_ALWAYS'},
    {id:'lowFocus',req: ctx => (ctx.f.focus||0) < 30, text:'INV05_LOW_FOCUS'},
    {id:'highMorale',req: ctx => (ctx.f.morale||0) >= 70, text:'INV05_HIGH_MORALE'},
    {id:'evenYear',req: ctx => (ctx.year||0) % 2 === 0, text:'INV05_EVEN_YEAR'},
    {id:'never',req: ctx => false, text:'INV05_NEVER'}
  ])`);
  const violations = ev(`
    (function(){
      var bad = [];
      var pool = TEXT_POOLS['inv05_engine_test'];
      for(var k = 0; k < 200; k++){
        var ctx = { f: { focus: Math.floor(rnd()*100), morale: Math.floor(rnd()*100) }, year: Math.floor(rnd()*10) };
        var chosenText = txtPick('inv05_engine_test', ctx);
        var entry = pool.find(function(e){ return e.text === chosenText; });
        if(entry && entry.req && !entry.req(ctx)) bad.push({ id: entry.id, ctx: ctx });
      }
      return bad;
    })()
  `);
  assert.equal(violations.length, 0,
    `INV-05 violé (moteur txtPick) ${violations.length} fois : ${JSON.stringify(violations.slice(0,3))}`);
});
