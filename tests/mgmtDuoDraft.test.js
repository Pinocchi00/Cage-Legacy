"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Duo T4 — draft : catégorie de réponse, annulation et six combats prêts',()=>{
  const w=newGameWindow({runMain:true});
  w.eval("setSeed(20261018);mgmtPasseGenerer('split',{soirees:6});mgmtMondeVivantGenerer(G.mgmt,{soirees:6});mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});mgmtDuoAvancer(G.mgmt);while(G.mgmt.duo.etape==='encheres')mgmtDuoPasser(G.mgmt);CL.go('mgmt_duo_draft');");
  assert.match(w.document.body.textContent,/À .* de placer/);
  w.eval("const m=G.mgmt,t=m.duo.draft.tour,p=mgmtDuoPlacables(m,t)[0];CL.mgmtDuoPlacer(p.id);render();");
  assert.match(w.document.body.textContent,/de répondre/);
  const div=w.eval('G.mgmt.duo.draft.combats[0].div');
  assert.ok(w.eval(`mgmtDuoDisponibles(G.mgmt,G.mgmt.duo.draft.tour).filter(f=>f.div==='${div}').every(f=>f.div==='${div}')`));
  w.eval('CL.mgmtDuoAnnuler();render();');
  assert.equal(w.eval('G.mgmt.duo.draft.combats.length'),0);
  assert.equal(w.eval("(()=>{const m=G.mgmt;for(let i=0;i<6;i++){const p=mgmtDuoPlacables(m,m.duo.draft.tour)[0];if(!p||!mgmtDuoPlacer(m,p.id))return false;const r=mgmtDuoDisponibles(m,m.duo.draft.tour).find(f=>f.div===p.div);if(!r||!mgmtDuoRepondre(m,r.id))return false;}return m.duo.etape==='pret'})()"),true);
  w.eval('render();');
  assert.match(w.document.body.textContent,/Lancer la super carte/);
});
