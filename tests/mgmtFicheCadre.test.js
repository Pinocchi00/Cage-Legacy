"use strict";
/* Brief du 06/10/2026, lot 6 : la Fiche dans le cadre — cinq onglets dont Contrat grisé, Tab, ← →, Entrée. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Fiche — cinq onglets, Contrat grisé avant le calendrier du joueur, Tab fait le tour sans passer par Contrat', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); delete G.mgmt.cal; CL.go('mgmt_effectif'); CL.mgmtEffectifOuvrir();`);
  assert.equal(win.eval('G.screen'),'mgmt_fiche');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fiche-onglets .mf-onglet:not(.mf-fiche-retour)').length`),5);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fiche-grise[aria-disabled="true"]').length`),1);
  const vus=[]; for(let i=0;i<5;i++){ vus.push(win.eval('MGMT_FICHE.onglet')); touche(win,'Tab'); }
  assert.deepEqual(vus,['apercu','style','combats','ondit','apercu']);
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('PRÉPARER SON COMBAT')||document.getElementById('app').textContent.includes('Préparer son combat')`));
});

test('Fiche — ← → change de combattant dans la catégorie, Échap revient', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_effectif'); CL.mgmtEffectifOuvrir();`);
  const a=win.eval('MGMT_FICHE.id'); touche(win,'ArrowRight'); const b=win.eval('MGMT_FICHE.id');
  assert.notEqual(a,b); touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_FICHE.id'),a);
  touche(win,'Escape'); assert.notEqual(win.eval('G.screen'),'mgmt_fiche');
});
