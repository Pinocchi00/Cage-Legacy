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

function installerEcheances(win, jours) {
  win.eval(`(function(){ const m=G.mgmt, jours=${JSON.stringify(jours)}; mgmtMondeVivantIds(m).forEach((id,i)=>{ const s=m.orgs[id], e=s.cal.prochaines[0]; e.jour=jours[i]; s.cal.prochaines=[e]; }); })()`);
}

test('Monde lot 9 T2b — une semaine fait jouer chaque organisation dont la soirée est due, et aucune autre', () => {
  const win=creer(true), ids=JSON.parse(win.eval('JSON.stringify(mgmtMondeVivantIds(G.mgmt))'));
  installerEcheances(win,[0,0,0,0,0,0,Number.MAX_SAFE_INTEGER]);
  const t=Date.now();
  const joue=win.eval(`(function(){ const m=G.mgmt, avant=Object.fromEntries(Object.entries(m.orgs).map(([id,s])=>[id,s.eventsPlayed])); mgmtMondeVivantSemaine(m); return Object.fromEntries(Object.entries(m.orgs).map(([id,s])=>[id,s.eventsPlayed-avant[id]])); })()`);
  console.log(`Monde lot 9 T2b — semaine: ${Date.now()-t} ms`);
  assert.deepEqual(JSON.parse(JSON.stringify(joue)),Object.fromEntries(ids.map((id,i)=>[id,i<6?1:0])));
});

test('Monde lot 9 T2b — la partie du joueur (empreinte) et SEED sont identiques avec et sans la semaine des sept', () => {
  const avec=creer(true), sans=creer(false); installerEcheances(avec,[0,0,0,0,0,0,0]);
  const empreinte=w=>w.eval(`(function(){ const m=G.mgmt; return JSON.stringify(Object.assign({},m,{orgs:0,mondeVivant:0}))+'|'+SEED; })()`);
  const avant=empreinte(avec); avec.eval('mgmtMondeVivantSemaine(G.mgmt)');
  assert.equal(empreinte(avec),avant); assert.equal(empreinte(avec),empreinte(sans));
});

test('Monde lot 9 T2b — deux parties à graine égale donnent les mêmes sept états après trois semaines', () => {
  const a=creer(true), b=creer(true);
  for(let i=0;i<3;i++){
    for(const w of [a,b]){
      w.eval(`G.mgmt.cal.jour+=7; G.mgmt.cycle++; (function(){ const s=G.mgmt.orgs[mgmtMondeVivantIds(G.mgmt)[0]]; if(!s.cal.prochaines.length) mgmtAgendaPoser(s,s.cal.jour+7,'petite'); const e=s.cal.prochaines[0]; if(e) e.jour=G.mgmt.cal.jour; })(); mgmtMondeVivantSemaine(G.mgmt)`);
    }
  }
  assert.equal(a.eval('mgmtSerialiser(G.mgmt)'),b.eval('mgmtSerialiser(G.mgmt)'));
});

test('Monde lot 9 T2b — une partie mondeVivant:false ne fait rien', () => {
  const win=creer(false), avant=win.eval('mgmtSerialiser(G.mgmt)'); win.eval('mgmtMondeVivantSemaine(G.mgmt)');
  assert.equal(win.eval('mgmtSerialiser(G.mgmt)'),avant);
});

test('Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial', () => {
  const win=creer(true);
  const r=win.eval(`(function(){
    const m=G.mgmt, id=mgmtMondeVivantIds(m)[0], sous=m.orgs[id];
    const f=sous.roster.find(x=>!mgmtIsRetired(x));
    const avant=mgmtWorldLivingCount(m,f.div), ranking=mgmtDivisionRanking(m,f.div,'world');
    return {id:f.id,avant,compte:mgmtWorldLivingCount(m,f.div),classe:ranking.some(x=>x.id===f.id),org:mgmtExteriorEffectifs(m,f.div).find(x=>x.id===f.id).orgId};
  })()`);
  assert.equal(r.avant,r.compte);
  assert.equal(r.classe,true);
  assert.equal(r.org,win.eval('mgmtMondeVivantIds(G.mgmt)[0]'));
});
