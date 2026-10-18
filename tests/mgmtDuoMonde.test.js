"use strict";
/* ==== [ANCRE: TESTS_DUO_T0_MONDE] — Monde lot 19 T0 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function creer() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261015); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});");
  return win;
}

test('Duo T0 — les sept organisations continuent de jouer leurs soirées', () => {
  const win=creer();
  const r=win.eval(`(function(){const m=G.mgmt,ids=mgmtMondeVivantIds(m),avant=Object.fromEntries(ids.map(id=>[id,m.orgs[id].eventsPlayed]));
    for(let i=0;i<6;i++){m.cal.jour+=MGMT_EVENT_WEEKS*7;m.cycle++;mgmtMondeVivantSemaine(m);}
    return {jouees:ids.map(id=>m.orgs[id].eventsPlayed-avant[id]),cycles:ids.map(id=>m.orgs[id].cycle),cycle:m.cycle};})()`);
  assert.deepEqual(Array.from(r.jouees),Array(7).fill(6));
  assert.deepEqual(Array.from(r.cycles),Array(7).fill(r.cycle));
});

test('Duo T0 — l’emplacement garde la partie du joueur après une soirée', () => {
  const win=creer();
  const r=win.eval(`(function(){const m=G.mgmt;saveMgmt();m.cal.jour+=MGMT_EVENT_WEEKS*7;m.cycle++;mgmtMondeVivantSemaine(m);
    const charge=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));return {org:charge&&charge.org,orgs:!!(charge&&charge.orgs)};})()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)),{org:'Split',orgs:true});
});

test('Duo T0 — même graine, même monde', () => {
  const a=creer(),b=creer();
  for(let i=0;i<3;i++) for(const w of [a,b]) w.eval('G.mgmt.cal.jour+=MGMT_EVENT_WEEKS*7;G.mgmt.cycle++;mgmtMondeVivantSemaine(G.mgmt)');
  assert.equal(a.eval('mgmtSerialiser(G.mgmt)'),b.eval('mgmtSerialiser(G.mgmt)'));
});
