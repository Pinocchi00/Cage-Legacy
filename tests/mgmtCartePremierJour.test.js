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
    /* Monde lot 15 — décision d'Anthony du 17/10/2026 : l'ancien matchmaker laisse exactement deux combats d'ouverture (places 4 et 5). */
    assert.equal(n, 2);
    assert.equal(win.eval('mgmtSoireesJoueur(G.mgmt)'), 0);
    assert.equal(win.eval('G.mgmt.card.main.every(f=>f.herite===true)'), true);
    assert.equal(win.eval(`(function(){const m=G.mgmt;for(const a of mgmtCartRows(m)){
      if(!mgmtSelectable(m,a,null)) continue;
      const b=mgmtCartRows(m).find(b=>b.id!==a.id&&b.div===a.div&&mgmtSelectable(m,b,a.id));
      if(b&&mgmtBookMain(m,a.id,b.id)) return true;
    }return false;})()`), true);
    /* Les combats que le joueur pose se placent devant les combats d'ouverture, qui restent en fin de carte. */
    assert.equal(win.eval('G.mgmt.card.main[0].herite'), undefined);
    assert.equal(win.eval('G.mgmt.card.main.at(-1).herite'), true);
    const html = win.eval('G.mgmt.card.main.map((f,i)=>mgmtCarteCombatLigne(G.mgmt,i,f,{courant:-1},i)).join("")');
    const host = win.document.createElement('div'); host.innerHTML = html;
    /* Décision d'Anthony du 17/10/2026 : l'étiquette « VIENT D'AVANT » est retirée ; le combat hérité reste reconnaissable à son bouton Annuler. */
    assert.equal(host.querySelectorAll('.mf-car-provenance').length, 0);
    assert.ok(!/VIENT D'AVANT/.test(host.textContent));
    assert.equal(host.querySelectorAll('.mf-car-slot.herite .mf-car-annule').length, 2);
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
      return !!loaded&&loaded.v===21&&/* décision du 15/10/2026 : fusion du lot 6, migration 18 → 19 */ /* décision du lot 6 T3 : la migration ne pose que raison:null, écarté ici */ JSON.stringify(loaded.card.main,(k,v)=>k==='raison'&&v===null?undefined:v)===photo&&validateMgmt(loaded);})()`), true); /* fusion du lot 9 (15/10/2026) : 19 → 20, mondeVivant=false ; lot 9 T2d : 20 → 21, identifiants préfixés */
    assert.equal(win.eval(`(function(){const bad=JSON.parse(mgmtSerialiser(G.mgmt));
      bad.card.main[0].herite='true';return validateMgmt(bad);})()`), false);
  } finally { win.close(); }
});

test('Monde lot 5 T3 — modifier un combat efface sa provenance', () => {
  const win = partie();
  try {
    assert.equal(win.eval(`(function(){const m=G.mgmt, f=m.card.main[0], a=f.a,b=f.b;
      mgmtRemoveMain(m,0);const poses=mgmtBookMain(m,a,b);return !!poses&&poses.herite===undefined&&poses.ouverture===undefined&&m.card.main[0]===poses&&m.card.main.at(-1).ouverture===true;})()`), true);
    assert.equal(win.eval(`(function(){const m=G.mgmt;
      // Fixture de titre vacant : aucune ceinture ni combat de titre concurrent.
      m.hist=[];m.facts=m.facts.filter(f=>f.k!=='title_initial'&&f.k!=='title_fight');
      m.card.main.forEach(f=>delete f.title);
      const i=m.card.main.findIndex(f=>f.herite&&mgmtCanTitle(m,f));
      if(i<0) return false;const f=m.card.main[i];const next=!f.title;
      return mgmtSetTitle(m,i,next)&&f.herite===undefined&&f.ouverture===true;})()`), true);
  } finally { win.close(); }
});
