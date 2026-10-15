"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT9_T2A] — Monde lot 9 T2a (docs/lots/MONDE-LOT-9-T2a.md) : la création et la sauvegarde des sept organisations vivantes.
   Passé court (N soirées) pour rester rapide ; la mesure des six ans complets est consignée dans la fiche. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const N = 6;
const GRAINE = 20261015;
function creer(avecMonde) {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split',{soirees:${N}});`);
  if (avecMonde) win.eval(`mgmtMondeVivantGenerer(G.mgmt,{soirees:${N}});`);
  return win;
}
const A = creer(true);
const B = creer(true);

test('Monde lot 9 T2a — même graine, deux créations identiques, sept organisations comprises', () => {
  const a = A.eval('mgmtSerialiser(G.mgmt)'), b = B.eval('mgmtSerialiser(G.mgmt)');
  assert.equal(a, b);
  const m = JSON.parse(a);
  assert.equal(m.mondeVivant, true);
  assert.equal(m.v, 20);
  assert.deepEqual(Object.keys(m.orgs), JSON.parse(A.eval("JSON.stringify(MGMT_ORGANISATIONS.map(o=>o.id).filter(id=>id!=='split'))")), 'sept organisations, dans l\'ordre de MGMT_ORGANISATIONS');
  assert.equal(Object.keys(m.orgs).length, 7);
  for (const id of Object.keys(m.orgs)) {
    const o = m.orgs[id];
    assert.equal(o.orgs, undefined, 'pas d\'orgs imbriqué');
    assert.ok(o.roster.length > 100, id + ' a un effectif');
    assert.ok(o.passe.archive && o.passe.nHist > 0, id + ' a joué ses soirées');
    assert.ok(o.graine && o.graine !== m.graine, id + ' porte sa graine dérivée');
  }
  assert.equal(new Set(Object.values(m.orgs).map(o => o.graine)).size, 7, 'sept graines distinctes');
});

test('Monde lot 9 T2a — une partie en version 18 se charge, se valide (mondeVivant=false) et joue une soirée', () => {
  const win = creer(false);
  const r = win.eval(`(function(){
    const brut=JSON.parse(mgmtSerialiser(G.mgmt)); brut.v=18; delete brut.mondeVivant; delete brut.orgs;
    const m=mgmtParseAndValidate(JSON.stringify(brut));
    if(!m) return {charge:false};
    mgmtRepair(m); G.mgmt=m;
    const avant=m.eventsPlayed;
    const s=mgmtPredecesseurSoiree(m,0,mgmtPredecesseurReglages('split'));
    return {charge:true,v:m.v,mondeVivant:m.mondeVivant,orgs:m.orgs===undefined,valide:validateMgmt(m),jouee:s.jouee,plus:m.eventsPlayed-avant};
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { charge: true, v: 20, mondeVivant: false, orgs: true, valide: true, jouee: true, plus: 1 });
});

test('Monde lot 9 T2a — sauvegarde puis rechargement conservent m.orgs à l\'identique', () => {
  const r = A.eval(`(function(){
    const avant=mgmtSerialiser(G.mgmt);
    const m=mgmtParseAndValidate(avant);
    if(!m) return {ok:false};
    return {ok:true,identique:mgmtSerialiser(m)===avant,orgs:JSON.stringify(m.orgs)===JSON.stringify(G.mgmt.orgs),tete:JSON.stringify(Object.assign({},m,{orgs:0}))===JSON.stringify(Object.assign({},G.mgmt,{orgs:0}))};
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { ok: true, identique: true, orgs: true, tete: true });
  /* via le stockage : saveMgmt puis loadMgmt */
  const s = A.eval(`(function(){ const avant=JSON.stringify(G.mgmt.orgs); const ok=saveMgmt(); const m0=G.mgmt; G.mgmt=null; const l=loadMgmt(); return {ok,l,orgs:JSON.stringify(G.mgmt.orgs)===avant}; })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), { ok: true, l: true, orgs: true });
});

test('Monde lot 9 T2a — une sous-partie illisible fait refuser la partie, jamais planter', () => {
  const r = A.eval(`(function(){
    const brut=JSON.parse(mgmtSerialiser(G.mgmt)); const id=Object.keys(brut.orgs)[0];
    const a=JSON.parse(JSON.stringify(brut)); a.orgs[id].v=19;
    const b=JSON.parse(JSON.stringify(brut)); delete b.orgs[id];
    const c=JSON.parse(JSON.stringify(brut)); c.mondeVivant='oui';
    return [mgmtParseAndValidate(JSON.stringify(a)),mgmtParseAndValidate(JSON.stringify(b)),mgmtParseAndValidate(JSON.stringify(c))].map(x=>x===null);
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), [true, true, true]);
});

test('Monde lot 9 T2a — la partie du joueur est identique avec et sans les sept organisations', () => {
  const sans = creer(false);
  const f = w => w.eval(`(function(){ const m=G.mgmt; return JSON.stringify(Object.assign({},m,{orgs:0,mondeVivant:0}))+'|'+SEED+'|'+(G.mgmt===m); })()`);
  assert.equal(f(A), f(sans), 'même partie du joueur, même état de la RNG après');
  assert.equal(A.eval('G.mgmt.mondeVivant'), true);
  assert.equal(sans.eval('G.mgmt.mondeVivant'), undefined);
});

test('Monde lot 9 T2a — la création réelle de l\'écran fait aussi vivre les sept organisations', async () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); CL.mgmtNouvelle(2); MGMT_NOUVELLE.soirees=2; MGMT_NOUVELLE.monde=true; MGMT_NOUVELLE.i=0; CL.mgmtNouvelleLancer();`);
  const debut = Date.now();
  while (Date.now() - debut < 170000) {
    await new Promise(r => setTimeout(r, 100));
    if (win.eval('!!(MGMT_NOUVELLE.gen&&MGMT_NOUVELLE.gen.pret)')) break;
  }
  assert.equal(win.eval('MGMT_NOUVELLE.gen.pret'), true);
  assert.equal(win.eval('G.mgmt'), null);
  assert.equal(win.eval('MGMT_NOUVELLE.gen.m.mondeVivant'), true);
  assert.equal(win.eval('Object.keys(MGMT_NOUVELLE.gen.m.orgs).length'), 7);
  win.eval('mgmtNouvelleGenNettoyer()');
});

test('Monde lot 9 T2a bis — six ans complets : la partie écrite tient en 1,5 Mo et se recharge à l\'identique', { timeout: 900000 }, () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split'); mgmtMondeVivantGenerer(G.mgmt);`);
  const s = win.eval('mgmtSerialiser(G.mgmt)');
  assert.ok(s.length <= 1500000, 'taille ' + s.length + ' octets > 1,5 Mo');
  assert.equal(win.eval(`(function(){ const m=mgmtParseAndValidate(${JSON.stringify(s)}); return !!m&&mgmtSerialiser(m)===${JSON.stringify(s)}; })()`), true);
});
