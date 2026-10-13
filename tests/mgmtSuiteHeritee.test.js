"use strict";
/* ==== [ANCRE: MONDE_LOT5_T5_TESTS] — Monde lot 5 T5 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees');

/** Crée une partie Split déterministe avec trois soirées de passé et aucune soirée joueur. @returns {Window} Fenêtre du harnais. */
function partie() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:3}); mgmtRetraitProb=function(){return 0;};");
  assert.deepEqual(lire(win, `const m=G.mgmt; return [m.passe.soirees,m.eventsPlayed,mgmtSoireesJoueur(m),m.cycle,m.cal.jour];`), [3,3,0,4,0]);
  return win;
}
const lire = (win, code) => JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

/** Complète la carte héritée sans réparer les contrats ni jouer la soirée. @param {Window} win Fenêtre du jeu. @returns {void} */
function completer(win) {
  win.eval(`const m=G.mgmt;
    m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let essais=0;
    while(m.card.main.length<m.card.sizeMain&&essais++<80){
      const div=divs[(m.card.main.length+essais)%divs.length];
      const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)&&!f.libre&&mgmtContratRestants(f)>0);
      const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id));
      if(a&&b) mgmtBookMain(m,a.id,b.id);
    }
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');`);
  assert.deepEqual(lire(win, 'return [G.mgmt.card.main.length,G.mgmt.card.prelims.length,mgmtAgendaPret(G.mgmt),validateMgmt(G.mgmt)];'), [5,4,true,true]);
}

test('Monde lot 5 T5 — la première soirée conserve les paires héritées et leur ordre de passage', t => {
  const win = partie(); t.after(() => win.close());
  const initial = lire(win, `const m=G.mgmt; return {paires:m.card.main.map(cf=>[cf.a,cf.b]),
    contrats:m.card.main.map(cf=>[cf.a,cf.b].map(id=>mgmtFighterById(m,id).ct)),
    restants:m.card.main.flatMap(cf=>[cf.a,cf.b].map(id=>mgmtContratRestants(mgmtFighterById(m,id))))};`);
  assert.ok(initial.paires.length > 0);
  assert.ok(initial.contrats.flat().every(Boolean));
  assert.ok(initial.restants.every(n => n > 0));
  completer(win);
  const avant = lire(win, `const m=G.mgmt; return {main:m.card.main.map(cf=>[cf.a,cf.b]),prelim:m.card.prelims.map(cf=>[cf.a,cf.b]),hist:m.hist.length,prochaines:m.cal.prochaines,faites:m.cal.faites};`);
  win.eval('CL.mgmtCalendrierJouer();');
  const apres = lire(win, `const m=G.mgmt; return {ecran:G.screen,ev:m.eventsPlayed,joueur:mgmtSoireesJoueur(m),cycle:m.cycle,jour:m.cal.jour,
    prochaines:m.cal.prochaines,faites:m.cal.faites,traces:m.hist.slice(${avant.hist}),programme:mgmtSoireeProgramme(m).map(p=>p.trace),
    carte:[m.card.main.length,m.card.prelims.length],valide:validateMgmt(m)};`);
  assert.deepEqual([apres.ecran,apres.ev,apres.joueur,apres.cycle,apres.jour], ['mgmt_soiree',4,1,4,35]);
  assert.deepEqual(apres.prochaines, avant.prochaines.slice(1));
  assert.deepEqual(apres.faites.slice(0,-1), avant.faites);
  assert.equal(apres.faites.at(-1).jour, 35);
  assert.equal(apres.traces.length, 9);
  const paires = apres.traces.map(h => [h.a.id,h.b.id]);
  assert.deepEqual(paires, [...avant.prelim,...avant.main.slice().reverse()]);
  assert.deepEqual(apres.traces.map(h => h.slot), [...Array(4).fill('prelim'),...Array(5).fill('main')]);
  for (const pair of initial.paires) assert.equal(paires.filter(p => p.join('|') === pair.join('|')).length, 1);
  assert.ok(apres.programme.every(Boolean));
  assert.deepEqual(apres.programme, apres.traces);
  assert.deepEqual(apres.carte, [0,0]);
  assert.equal(apres.valide, true);
});

/* ==== [ANCRE: MONDE_LOT5_T5_TESTS_PROVENANCE] — Monde lot 5 T5 ==== */
test('Monde lot 5 T5 — la provenance ne change ni le combat ni la recette', t => {
  const a = partie(); t.after(() => a.close());
  const b = partie(); t.after(() => b.close());
  completer(a); completer(b);
  assert.equal(b.eval('JSON.stringify(G.mgmt)'), a.eval('JSON.stringify(G.mgmt)'));
  assert.equal(b.eval('SEED'), a.eval('SEED'));
  b.eval('for(const cf of [...G.mgmt.card.main,...G.mgmt.card.prelims]) delete cf.herite;');
  a.eval('CL.mgmtCalendrierJouer();'); b.eval('CL.mgmtCalendrierJouer();');
  assert.equal(a.eval('G.screen'), 'mgmt_soiree');
  assert.equal(b.eval('G.screen'), 'mgmt_soiree');
  assert.equal(a.eval('G.mgmt.eventsPlayed'), 4);
  assert.equal(b.eval('G.mgmt.eventsPlayed'), 4);
  assert.equal(b.eval('JSON.stringify(G.mgmt)'), a.eval('JSON.stringify(G.mgmt)'));
  assert.equal(b.eval('SEED'), a.eval('SEED'));
});

/* ==== [ANCRE: MONDE_LOT5_T5_TESTS_CONSULTATION] — Monde lot 5 T5 ==== */
test('Monde lot 5 T5 — regarder passer et revoir ne rejouent pas la première soirée', t => {
  const win = partie(); t.after(() => win.close());
  completer(win);
  win.eval('CL.mgmtCalendrierJouer(); CL.mgmtSoCommencer();');
  const photo = () => lire(win, 'const copie=JSON.parse(JSON.stringify(G.mgmt)); delete copie.lastEvent.vu; return copie;');
  const avant = photo(), seed = win.eval('SEED');
  win.eval('CL.mgmtSoRegarder();');
  assert.equal(win.eval('G.screen'), 'mgmt_combat');
  win.eval('CL.mgmtCbPasser();');
  assert.equal(win.eval('MGMT_COMBAT.mode'), 'dec');
  win.eval('CL.mgmtCbRetour(); CL.mgmtSoPasser(); CL.mgmtSoRevoir(0);');
  assert.equal(win.eval('G.screen'), 'mgmt_combat');
  win.eval('CL.mgmtCbPasser(); CL.mgmtCbRetour();');
  assert.deepEqual(lire(win, 'return [G.screen,MGMT_SOIREE.index,G.mgmt.lastEvent.vu,G.mgmt.eventsPlayed,G.mgmt.cycle];'), ['mgmt_soiree',2,2,4,4]);
  assert.deepEqual(photo(), avant, 'seul lastEvent.vu change : traces, finance et contrats restent identiques');
  assert.equal(win.eval('SEED'), seed);
});

/* ==== [ANCRE: MONDE_LOT5_T5_TESTS_REPRISE] — Monde lot 5 T5 ==== */
test('Monde lot 5 T5 — reprendre la première soirée mène au lendemain puis aux résultats', t => {
  const win = partie(); t.after(() => win.close());
  completer(win);
  win.eval('CL.mgmtCalendrierJouer(); CL.mgmtSoCommencer(); for(let i=0;i<3;i++) CL.mgmtSoPasser(); saveMgmt();');
  const avant = win.eval('JSON.stringify(G.mgmt)'), seed = win.eval('SEED');
  win.eval('G.mgmt=null; MGMT_SOIREE=mgmtSoireeNeuve(0); CL.mgmtEnter(1);');
  assert.deepEqual(lire(win, 'return [G.screen,MGMT_SOIREE.index,G.mgmt.lastEvent.vu,G.mgmt.cycle,G.mgmt.eventsPlayed,validateMgmt(G.mgmt)];'), ['mgmt_soiree',3,3,4,4,true]);
   /* ==== [ANCRE: MONDE_LOT5_T5_TESTS_REPRISE_DATE] — Monde lot 5 T5 ==== */
   // décision du 13/10/2026 : préparation de la date suivante existante
   const avantReprise = JSON.parse(avant), apresReprise = lire(win, 'return G.mgmt;');
   assert.equal(apresReprise.cal.prochaines.length, avantReprise.cal.prochaines.length + 1);
   assert.deepEqual(apresReprise.cal.prochaines.slice(0,-1), avantReprise.cal.prochaines);
   assert.equal(apresReprise.cal.prochaines.at(-1).jour, 70);
   delete avantReprise.lastEvent.vu; delete apresReprise.lastEvent.vu;
   delete avantReprise.cal.prochaines; delete apresReprise.cal.prochaines;
   assert.deepEqual(apresReprise, avantReprise, 'seuls lastEvent.vu et la prochaine date sont admis après reprise');
  assert.equal(win.eval('SEED'), seed);
  const traces = lire(win, 'return mgmtSoireeProgramme(G.mgmt).map(p=>p.trace);');
  assert.equal(traces.length, 9); assert.ok(traces.every(Boolean));
  assert.deepEqual(traces, JSON.parse(avant).hist.slice(-9));
  win.eval('for(let i=0;i<6;i++) CL.mgmtSoPasser(); CL.mgmtSoFin();');
  assert.deepEqual(lire(win, 'return [G.screen,MGMT_SOIREE.index,G.mgmt.cycle,G.mgmt.eventsPlayed];'), ['mgmt_lendemain',9,4,4]);
  win.eval('CL.mgmtLendemainResultats();');
  assert.deepEqual(lire(win, 'return [G.screen,G.mgmt.cycle,G.mgmt.eventsPlayed,mgmtSoireesJoueur(G.mgmt),mgmtSoireeEnCours(G.mgmt),validateMgmt(G.mgmt)];'), ['mgmt_resultats',5,4,1,false,true]);

  const sans = partie(); t.after(() => sans.close());
  completer(sans);
  sans.eval('CL.mgmtCalendrierJouer(); G.mgmt.lastEvent.touched=[]; CL.mgmtSoCommencer(); for(let i=0;i<9;i++) CL.mgmtSoPasser(); CL.mgmtSoFin();');
  assert.deepEqual(lire(sans, 'return [G.screen,G.mgmt.cycle,G.mgmt.eventsPlayed,validateMgmt(G.mgmt)];'), ['mgmt_lendemain',4,4,true]);
});

/* ==== [ANCRE: MONDE_LOT5_T5_TESTS_JOUEUR] — Monde lot 5 T5 ==== */
test('Monde lot 5 T5 — le joueur automatique finit la carte héritée avec une reprise', t => {
  const win = partie(); t.after(() => win.close());
  const initial = lire(win, `const m=G.mgmt; return {paires:m.card.main.map(cf=>[cf.a,cf.b]),
    contrats:m.card.main.map(cf=>[cf.a,cf.b].map(id=>mgmtFighterById(m,id).ct)),
    valides:m.card.main.every(cf=>[cf.a,cf.b].every(id=>{const f=mgmtFighterById(m,id);return !f.libre&&mgmtContratRestants(f)>0;})),hist:m.hist.length};`);
  assert.ok(initial.paires.length > 0);
  assert.ok(initial.contrats.flat().every(Boolean));
  assert.equal(initial.valides, true, 'contrats valides avant toute réparation par l’aide');
  assert.equal(jouerSoirees(win,1,{recharge:true}), 1);
  const apres = lire(win, `const m=G.mgmt; return {ev:m.eventsPlayed,joueur:mgmtSoireesJoueur(m),cycle:m.cycle,valide:validateMgmt(m),
    combats:m.hist.slice(${initial.hist}).filter(h=>h.slot==='main').map(h=>[h.a.id,h.b.id])};`);
  assert.deepEqual([apres.ev,apres.joueur,apres.cycle,apres.valide], [4,1,5,true]);
  assert.equal(apres.combats.length, 5);
  for (const pair of initial.paires) assert.equal(apres.combats.filter(p => p.join('|') === pair.join('|')).length, 1);
});
