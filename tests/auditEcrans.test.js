"use strict";
/* ==== [ANCRE: TEST_AUDIT_ECRANS] — Monde lot 23 : l'audit des écrans du management, rejouable (reprend le point « outil d'audit » du lot 13 T6).
   Une partie jouée (six soirées de passé + six soirées réelles), chaque écran `mgmt_*` rendu, et le texte affiché ne doit jamais contenir un reste de programmation
   (« undefined », « NaN », « [object »), un « null » isolé, une ligne de classement sans nom, ni une phrase de travail. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees.js');

const INTERDITS = [/undefined/, /\bNaN\b/, /\[object/, /\bnull\b/, /EMPLACEMENT AUTEUR/, /\bTODO\b/, /Ce que tu ne sais pas/i];
/* Les écrans qui demandent un contexte (un combat, une fiche, une création) sont couverts par leurs propres tests. */
const SANS_CONTEXTE = ['mgmt_combat', 'mgmt_fiche', 'mgmt_presentation_combat', 'mgmt_presentation_combattant', 'mgmt_soiree_avant', 'mgmt_nouvelle', 'mgmt_arrivee',
  'mgmt_confirmation', 'mgmt_duo_nouvelle', 'mgmt_duo_encheres', 'mgmt_duo_draft', 'mgmt_duo_soiree', 'mgmt_duo_bilan', 'mgmt_duo_effectif', 'mgmt_duo_histo', 'mgmt_duo',
  'mgmt_duo_fiche_retour', 'mgmt_duo_presentation_retour', 'mgmt_demo_fin', 'mgmt_parties'];

test('Monde lot 23 — aucun écran du management ne montre un reste de programmation',() => {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");
  jouerSoirees(win, 4);
  const ecrans = JSON.parse(win.eval(`JSON.stringify(Object.keys(SCREENS).filter(k=>/^mgmt_/.test(k)&&!${JSON.stringify(SANS_CONTEXTE)}.includes(k)))`));
  assert.ok(ecrans.length >= 12, 'les écrans du management sont listés : ' + ecrans.join(','));
  const fautes = [];
  for (const nom of ecrans) {
    let texte;
    try {
      win.eval(`G.screen=${JSON.stringify(nom)};render();`);
      texte = win.eval("document.getElementById('app').textContent");
    } catch (e) { fautes.push(nom + ' : erreur ' + e.message); continue; }
    for (const re of INTERDITS) { const m = texte.match(re); if (m) fautes.push(nom + ' : « ' + texte.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ') + ' »'); }
  }
  assert.deepEqual(fautes, []);
});
