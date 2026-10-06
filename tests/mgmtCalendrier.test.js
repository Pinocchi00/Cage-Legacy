"use strict";
/* Brief du 06/10/2026, lot 7a : le Calendrier — dates dérivées, trois soirées, navigation. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Calendrier — la date est dérivée du numéro : cinq semaines d’écart, rien de stocké', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1);`);
  const r=JSON.parse(win.eval(`JSON.stringify({a:mgmtSoireeDate(1),b:mgmtSoireeDate(2),cles:Object.keys(G.mgmt).filter(k=>/date|calend/i.test(k))})`));
  assert.equal(Math.round((r.b.ts-r.a.ts)/86400000),35); assert.deepEqual(r.cles,[]);
});

test('Calendrier — l’écran montre trois soirées, la courante au centre, et la barre l’éclaire', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_calendrier');`);
  assert.equal(win.eval('G.screen'),'mgmt_calendrier');
  assert.equal(win.eval(`document.querySelectorAll('.mf-cal-onglet').length`),8);
  assert.equal(win.eval(`document.querySelector('.mf-barre-item.cur').dataset.section`),'calendrier');
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('Il manque')`));
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_CALENDRIER.n'),2);
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_calendrier','une soirée à venir n’ouvre pas la carte');
  touche(win,'ArrowLeft'); touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_carte');
});
