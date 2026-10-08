"use strict";
/* Brief du 06/10/2026, lot 8 : l'écran Finances — six cartes, euros, bourses engagées, détail, clavier ; le lieu choisi au Calendrier. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
function neuve(){ const win=newGameWindow({runMain:true}); win.eval(`setSeed(7); CL.mgmtEnter(1);`); return win; }

test('Finances — les montants se lisent en euros, comme sur les maquettes', () => {
  const win=neuve();
  assert.equal(win.eval('mgmtEuros(182)'),'182 000 €');
  assert.equal(win.eval('mgmtEuros(-64)'),'−64 000 €');
  assert.equal(win.eval(`mgmtEuros(50)`),'50\u202f000\u00a0€');
});

test('Finances — six cartes, la caisse au départ, les bourses engagées suivent la carte en cours de composition', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_finances');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fin-p').length`),6);
  const txt=win.eval(`document.getElementById('app').textContent`);
  assert.ok(txt.includes('50\u202f000'),'la caisse de départ'); assert.ok(txt.includes('Avant la première soirée'));
  const r=JSON.parse(win.eval(`JSON.stringify((function(){ const m=G.mgmt; const a=mgmtFinancesEngagees(m).k;
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); const A=rows[0]; const B=rows.find(x=>x.id!==A.id&&x.div===A.div&&mgmtSelectable(m,x,A.id)); mgmtBookMain(m,A.id,B.id);
    const e=mgmtFinancesEngagees(m); return {a,b:e.k,n:e.n,attendu:mgmtPurse(A,'main')+mgmtPurse(B,'main')}; })())`));
  assert.equal(r.a,0); assert.equal(r.n,1); assert.equal(r.b,r.attendu,'le cachet des deux combattants du combat posé');
});

test('Finances — ← → choisissent, Entrée montre le détail, Échap le ferme puis revient', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_finances');`);
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_FINANCES.i'),1);
  touche(win,'Enter'); assert.ok(win.eval('MGMT_FINANCES.detail')); assert.ok(win.eval(`document.getElementById('app').textContent.includes('Rien encore')`));
  touche(win,'Escape'); assert.ok(!win.eval('MGMT_FINANCES.detail')); assert.equal(win.eval('G.screen'),'mgmt_finances');
  touche(win,'Escape'); assert.equal(win.eval('G.screen'),'mgmt_carte','échap ramène à la carte (décision d’Anthony du 08/10/2026 : plus d’écran « Les affaires » à l’ouverture ; l’entrée et le retour ramènent à la carte)');
  assert.equal(win.eval(`document.querySelector('.mf-barre-item[data-section="finances"]').getAttribute('onclick')`),"CL.go('mgmt_finances')");
});

test('Finances — le lieu se choisit au Calendrier : V change de salle, la soirée posée porte sa salle', () => {
  const win=neuve();
  /* Demande d’Anthony du 08/10/2026 : l’ouverture pose déjà la première soirée ; ce test pose la sienne, il retire d’abord celle-là. */
  win.eval('G.mgmt.cal.prochaines=[]; mgmtAgendaSynchroCarte(G.mgmt);');
  win.eval(`CL.go('mgmt_calendrier'); CL.mgmtCalendrierPoseOuvrir();`);
  const s0=win.eval('MGMT_CALENDRIER.pose.salle'); touche(win,'v'); assert.notEqual(win.eval('MGMT_CALENDRIER.pose.salle'),s0);
  const choisie=win.eval('MGMT_CALENDRIER.pose.salle'); touche(win,'Enter');
  assert.equal(win.eval('G.mgmt.cal.prochaines[0].salle'),choisie);
  assert.ok(win.eval(`document.getElementById('app').textContent.includes(mgmtSalleParId(G.mgmt,'${choisie}').nom.toUpperCase())`));
  assert.ok(win.eval('validateMgmt(JSON.parse(JSON.stringify(G.mgmt)))'));
});
