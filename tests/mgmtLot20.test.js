"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT20] — Monde lot 20 : retours d'Anthony du 18/10/2026 (rang chez l'organisation, pourcentage seul, résolution adaptative du combat). ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function partie() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6});");
  return win;
}

test('Monde lot 20 — le mouvement de classement d’un combattant se lit « avant → après » chez l’organisation', () => {
  const win = partie();
  const r = JSON.parse(win.eval(`JSON.stringify((function(){const m=G.mgmt,f=m.roster.find(x=>!mgmtIsRetired(x));
    const rg=mgmtLendemainRangs(m,f.id),t=mgmtLendemainRangTexte(m,f.id,'Test');
    return {rg,t,inconnu:mgmtLendemainRangs(m,'zz'),vide:mgmtLendemainRangTexte(m,'zz','X')};})())`));
  assert.ok(r.rg && 'avant' in r.rg && 'apres' in r.rg);
  assert.ok(r.t.startsWith('Test '), r.t);
  assert.ok(/→|inchangé/.test(r.t), r.t);
  assert.equal(r.inconnu, null);
  assert.equal(r.vide, '');
});

test('Monde lot 20 — la présentation d’un combat porte le rang de chaque combattant, et le pourcentage se lit seul', () => {
  const win = partie();
  const html = win.eval(`(function(){const m=G.mgmt,d=m.roster.filter(f=>!mgmtIsRetired(f)),a=d[0],b=d.find(f=>f.div===a.div&&f.id!==a.id);
    CL.mgmtPresentationOuvrir('combat',[a.id,b.id],{retour:'mgmt_carte'});
    return SCREENS.mgmt_presentation_combat?SCREENS.mgmt_presentation_combat():scr_mgmt_presentation();})()`);
  assert.ok(/mf-pr-rg/.test(html), 'le rang chez l’organisation est à côté du prénom');
  assert.ok(!/class="mf-pr-pct">[^<]*[A-Za-zÀ-ÿ]/.test(html), 'le pourcentage ne porte aucun nom');
});

test('Monde lot 20 — la résolution du combat baisse quand les images manquent, et remonte quand l’ordinateur suit', () => {
  const win = partie();
  const r = JSON.parse(win.eval(`JSON.stringify((function(){const C=MGMT_COMBAT;let redim=0;
    C.vue={echelle:1,redim(){redim++;}};MGMT_COMBAT_ADAPT.ema=0;MGMT_COMBAT_ADAPT.n=0;MGMT_COMBAT_ADAPT.bons=0;
    for(let i=0;i<30;i++) mgmtCombatAdapter(40);           // 25 images par seconde pour une cible à 60
    const baisse=C.vue.echelle;
    for(let i=0;i<400;i++) mgmtCombatAdapter(40);
    const plancher=C.vue.echelle;
    for(let i=0;i<30;i++) mgmtCombatAdapter(16);
    for(let i=0;i<2000;i++) mgmtCombatAdapter(10);
    const remonte=C.vue.echelle;C.vue=null;
    return {baisse,plancher,remonte,redim};})())`));
  assert.ok(r.baisse < 1, 'la résolution baisse');
  assert.ok(r.plancher >= 0.5 && r.plancher <= 0.5001, 'jamais sous la moitié');
  assert.ok(r.remonte > r.plancher, 'elle remonte quand l’ordinateur suit');
});
