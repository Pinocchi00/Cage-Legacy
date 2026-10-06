"use strict";
/* Brief du 06/10/2026, lot 6 : l'écran Effectif (planche « Management — Effectif ») : une catégorie à la fois,
   le champion en tête, l'aperçu du combattant choisi, le clavier. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Effectif — la section Effectif de la barre ouvre l’écran, une catégorie, une ligne choisie et son aperçu', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_effectif'); const html=document.getElementById('app').innerHTML;
    const m=G.mgmt; const lignes=mgmtEffectifLignes(m,mgmtEffectifDiv(m));
    return {ecran:G.screen,eff:html.includes('mf-effectif'),lignes:document.querySelectorAll('.mf-eff-ligne').length,n:lignes.length,
      choisie:document.querySelectorAll('.mf-eff-ligne.choisie').length,apercu:html.includes('mf-eff-fiche'),section:MF_ECRAN_SECTION.mgmt_effectif};`);
  assert.equal(r.ecran,'mgmt_effectif'); assert.ok(r.eff); assert.ok(r.n>0);
  assert.equal(r.lignes,Math.min(r.n,9)); assert.equal(r.choisie,1); assert.ok(r.apercu); assert.equal(r.section,'effectif');
});

test('Effectif — flèches, Tab (catégorie) et G (sexe) déplacent la sélection sans casser l’écran', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_effectif');`);
  touche(win,'ArrowDown'); assert.equal(win.eval('MGMT_EFFECTIF.curseur'),1);
  touche(win,'ArrowUp'); assert.equal(win.eval('MGMT_EFFECTIF.curseur'),0);
  const d0=win.eval('MGMT_EFFECTIF.div'); touche(win,'Tab'); assert.equal(win.eval('G.screen'),'mgmt_effectif');
  assert.notEqual(win.eval('MGMT_EFFECTIF.div'),d0,'Tab change de catégorie');
  const s0=win.eval('MGMT_EFFECTIF.sexe'); touche(win,'g'); assert.notEqual(win.eval('MGMT_EFFECTIF.sexe'),s0);
  assert.equal(win.eval('G.screen'),'mgmt_effectif');
});

test('Effectif — Entrée ouvre la fiche du combattant choisi', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_effectif');`);
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_fiche');
});
