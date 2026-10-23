"use strict";
/* ==== [ANCRE: TESTS_DUO_T58_PRESENTATION] — Monde lot 19 T58 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const {AVANCER,DRAFT}=require('./helpers/duoPartie');

test('Duo T58 — la présentation de la super carte est sans spoiler et rend la partie',()=>{
  const win=newGameWindow({runMain:true});
  win.eval("setSeed(20261018);mgmtPasseGenerer('split',{soirees:6});mgmtMondeVivantGenerer(G.mgmt,{soirees:6});mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});");
  win.eval(AVANCER);
  assert.equal(win.eval(`(function(){${DRAFT}})()`),'pret');
  win.eval('window.__duoM=G.mgmt');
  const carte=win.eval('mgmtDuoJouer(G.mgmt)');
  assert.ok(carte);
  const vue=win.eval('mgmtDuoVueMonde(G.mgmt,G.mgmt.duo.cartes.at(-1))');
  assert.ok(win.eval(`mgmtFighterById(mgmtDuoVueMonde(G.mgmt,G.mgmt.duo.cartes.at(-1)),'${carte.combats[0].a}')`));
  assert.ok(win.eval(`mgmtFighterById(mgmtDuoVueMonde(G.mgmt,G.mgmt.duo.cartes.at(-1)),'${carte.combats[0].b}')`));
  assert.equal(win.eval(`(function(){const v=mgmtDuoVueMonde(G.mgmt,G.mgmt.duo.cartes.at(-1));return saveMgmt(v);})()`),true);
  assert.ok(vue);
  win.eval('G.screen="mgmt_duo_soiree";render();CL.mgmtDuoPresentation();');
  assert.equal(win.eval('G.screen'),'mgmt_presentation_combat');
  const html=win.document.body.innerHTML;
  /* Décision (superviseur, 22/10/2026, brief P4 T1) : la présentation écrit les noms en capitales, prénom et nom dans deux éléments (« SERGEI » puis « KARPOV ») ; la fixture change avec la composition de Split, le test lit donc chaque mot du nom en capitales plutôt que le nom exact. */
  const mots=n=>String(n).toUpperCase().split(/\s+/).filter(Boolean);
  assert.ok([...mots(carte.combats[0].na),...mots(carte.combats[0].nb)].every(w=>html.includes(w)),'les deux combattants du premier combat figurent, en capitales');
  const premier=carte.combats[0];
  assert.ok(!html.includes(`${premier.family} · ${premier.round}`));
  win.eval('CL.mgmtPresentationRetour();');
  assert.equal(win.eval('G.mgmt===window.__duoM'),true);
  assert.equal(win.eval('G.screen'),'mgmt_duo_soiree');
});
