"use strict";
/* ==== [ANCRE: MONDE_LOT5_T3_TESTS] — Monde lot 5 T3 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

// Porte partie() de mgmtCarteHeritee.test.js : même graine, même passé court.
function partie() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:3});");
  return win;
}

test('Monde lot 5 T3 — seuls les combats hérités portent la provenance', () => {
  const win = partie();
  try {
    const n = win.eval('G.mgmt.card.main.length');
    assert.ok(n === 2 || n === 3);
    assert.equal(win.eval('mgmtSoireesJoueur(G.mgmt)'), 0);
    assert.equal(win.eval('G.mgmt.card.main.every(f=>f.herite===true)'), true);
    assert.equal(win.eval(`(function(){const m=G.mgmt;for(const a of mgmtCartRows(m)){
      if(!mgmtSelectable(m,a,null)) continue;
      const b=mgmtCartRows(m).find(b=>b.id!==a.id&&b.div===a.div&&mgmtSelectable(m,b,a.id));
      if(b&&mgmtBookMain(m,a.id,b.id)) return true;
    }return false;})()`), true);
    assert.equal(win.eval('G.mgmt.card.main.at(-1).herite'), undefined);
    const html = win.eval('G.mgmt.card.main.map((f,i)=>mgmtCarteCombatLigne(G.mgmt,i,f,{courant:-1})).join("")');
    const host = win.document.createElement('div'); host.innerHTML = html;
    assert.equal(host.querySelectorAll('.mf-car-provenance').length, n);
    assert.equal(host.querySelector('.mf-car-provenance em').textContent, "VIENT D'AVANT");
    assert.equal(win.eval('MGMT_CARTE_PROVENANCE.relu'), false);
  } finally { win.close(); }
});

test('Monde lot 5 T3 — la lecture répétée ne crée aucun héritage', () => {
  const win = partie();
  try {
    const photo = win.eval('JSON.stringify(G.mgmt)'), seed = win.eval('SEED');
    for(let i=0;i<2;i++) win.eval('G.mgmt.card.main.forEach((f,i)=>mgmtCarteCombatLigne(G.mgmt,i,f,{courant:-1}))');
    assert.equal(win.eval('JSON.stringify(G.mgmt)'), photo);
    assert.equal(win.eval('SEED'), seed);
    assert.equal(win.eval('JSON.stringify(mgmtParseAndValidate(mgmtSerialiser(G.mgmt)).card.main)'), win.eval('JSON.stringify(G.mgmt.card.main)'));
  } finally { win.close(); }
});

test('Monde lot 5 T3 — une ancienne sauvegarde ne reçoit aucune provenance', () => {
  const win = partie();
  try {
    assert.equal(win.eval(`(function(){const old=JSON.parse(mgmtSerialiser(G.mgmt));old.v=16;
      old.card.main.forEach(f=>delete f.herite);const photo=JSON.stringify(old.card.main);
      const loaded=mgmtParseAndValidate(JSON.stringify(old));
      // Décision du 13/10/2026, lot 5 T4 : version 18.
      return !!loaded&&loaded.v===19&&/* décision du 15/10/2026 : fusion du lot 6, migration 18 → 19 */ JSON.stringify(loaded.card.main)===photo&&validateMgmt(loaded);})()`), true);
    assert.equal(win.eval(`(function(){const bad=JSON.parse(mgmtSerialiser(G.mgmt));
      bad.card.main[0].herite='true';return validateMgmt(bad);})()`), false);
  } finally { win.close(); }
});

test('Monde lot 5 T3 — modifier un combat efface sa provenance', () => {
  const win = partie();
  try {
    assert.equal(win.eval(`(function(){const m=G.mgmt, f=m.card.main[0], a=f.a,b=f.b;
      mgmtRemoveMain(m,0);return !!mgmtBookMain(m,a,b)&&m.card.main.at(-1).herite===undefined;})()`), true);
    assert.equal(win.eval(`(function(){const m=G.mgmt;
      // Fixture de titre vacant : aucune ceinture ni combat de titre concurrent.
      m.hist=[];m.facts=m.facts.filter(f=>f.k!=='title_initial'&&f.k!=='title_fight');
      m.card.main.forEach(f=>delete f.title);
      const i=m.card.main.findIndex(f=>f.herite&&mgmtCanTitle(m,f));
      if(i<0) return false;const f=m.card.main[i];const next=!f.title;
      return mgmtSetTitle(m,i,next)&&f.herite===undefined;})()`), true);
  } finally { win.close(); }
});
