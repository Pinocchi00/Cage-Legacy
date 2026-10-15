"use strict";
/* ==== [ANCRE: MONDE_LOT5_T1_TESTS] — Monde lot 5 T1 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees');

function partie() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:3});");
  return win;
}
const lire = (win, code) => JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

test('Monde lot 5 T1 — la clôture prépare sans jouer une carte partielle', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt; return {ev:m.eventsPlayed,passe:m.passe.soirees,joueur:mgmtSoireesJoueur(m),cycle:m.cycle,
    jour:m.cal.jour,vie:m.cal.vieJour,main:m.card.main.length,size:m.card.sizeMain,jourSuivant:m.cal.prochaines[0].jour,dates:m.cal.faites.map(x=>x.jour)};`);
  assert.deepEqual([r.ev,r.passe,r.joueur,r.cycle,r.jour,r.vie,r.size,r.jourSuivant], [3,3,0,4,0,0,5,35]);
  assert.ok(r.main === 2 || r.main === 3);
  assert.deepEqual(r.dates, [-105,-70,-35]);
  win.close();
});

/* ==== [ANCRE: MONDE_LOT5_T1_TESTS_GARDES] — Monde lot 5 T1 ==== */
test('Monde lot 5 T1 — la préparation respecte les indisponibilités et les contrats', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt;
    m.card.main=[];
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)&&!mgmtChampionIds(m).has(f.id));
    const mauvais=rows.slice(0,6);
    mauvais[0].susp=m.cycle+2; // blessure de combat : suspension persistante
    mauvais[1].susp=m.cycle; // frontière inclusive
    mauvais[2].retired=true;
    mauvais[3].libre=true; delete mauvais[3].ct;
    mauvais[4].ct.n=mauvais[4].ct.f;
    delete mauvais[5].ct; // pas libre ne suffit pas à établir un contrat
    const ids=mauvais.map(f=>f.id);
    mgmtPredecesseurCarteHeritee(m,3);
    const pairs=m.card.main.flatMap(cf=>[cf.a,cf.b]);
    const gardes=ids.every(id=>!pairs.includes(id));
    const unique=new Set(pairs).size===pairs.length;
    // Fixture isolée de dernier combat : aucun autre candidat n'est sous contrat.
    m.card.main=[];
    const a=rows[6], b=rows.find((f,i)=>i>6&&f.div===a.div);
    for(const f of m.roster){ f.libre=true; delete f.ct; }
    for(const f of [a,b]){ f.libre=false; f.ct={n:1,f:0,b:1}; f.lastCycle=m.cycle; delete f.susp; }
    const selectable=mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id);
    const n=mgmtPredecesseurCarteHeritee(m,3);
    const dernier=n===1&&m.card.main[0].a!==m.card.main[0].b&&[a,b].every(f=>mgmtContratRestants(f)===1);
    const initial=JSON.stringify(m.card.main);
    mgmtPredecesseurCarteHeritee(m,3);
    return {gardes,unique,selectable,dernier,doublon:initial===JSON.stringify(m.card.main)};`);
  assert.deepEqual(r, {gardes:true,unique:true,selectable:true,dernier:true,doublon:true});
  assert.throws(() => win.eval('mgmtPredecesseurCarteHeritee({},3)'), /G.mgmt/);
  win.close();
});

/* ==== [ANCRE: MONDE_LOT5_T1_TESTS_IDENTITE] — Monde lot 5 T1 ==== */
test('Monde lot 5 T1 — la clôture est idempotente et déterministe', () => {
  const a = partie(), b = partie();
  const initial = a.eval('JSON.stringify(G.mgmt)'), seed = a.eval('SEED');
  a.eval('mgmtPasseCloturer(G.mgmt)');
  assert.equal(a.eval('JSON.stringify(G.mgmt)'), initial);
  assert.equal(a.eval('SEED'), seed);
  assert.equal(b.eval('JSON.stringify(G.mgmt)'), initial);
  a.close(); b.close();
});

/* ==== [ANCRE: MONDE_LOT5_T1_TESTS_SAVE] — Monde lot 5 T1 ==== */
test('Monde lot 5 T1 — la carte héritée se sauvegarde sans se recréer', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt;
    const valide=validateMgmt(m);
    const disque=mgmtSerialiser(m), a=mgmtParseAndValidate(disque), b=mgmtParseAndValidate(disque);
    const photo=x=>JSON.stringify([x.cal.prochaines,x.card.main]);
    const identique=photo(m)===photo(a)&&photo(a)===photo(b);
    // Sauvegarde d'avant T1 : même format 16, carte et agenda non préparés.
    m.card.main=[]; m.cal.prochaines=[];
    const avant=mgmtSerialiser(m), ancien=mgmtParseAndValidate(avant);
    return {valide,identique,ancien:!!ancien&&ancien.card.main.length===0&&ancien.cal.prochaines.length===0};`);
  assert.deepEqual(r, {valide:true,identique:true,ancien:true});
  win.close();
});

/* ==== [ANCRE: MONDE_LOT5_T1_TESTS_JOUEUR] — Monde lot 5 T1 ==== */
test('Monde lot 5 T1 — le joueur automatique finit la carte héritée et joue une soirée', () => {
  const win = partie();
  const initial = lire(win, `const m=G.mgmt; return {paires:m.card.main.map(cf=>[cf.a,cf.b]),
    contrats:m.card.main.every(cf=>[cf.a,cf.b].every(id=>{const f=mgmtFighterById(m,id);return !f.libre&&mgmtContratRestants(f)>0;})),hist:m.hist.length};`);
  assert.equal(initial.contrats, true, 'contrats valides avant toute réparation par l’aide');
  assert.equal(jouerSoirees(win,1), 1);
  const r = lire(win, `const m=G.mgmt; return {ev:m.eventsPlayed,joueur:mgmtSoireesJoueur(m),
    combats:m.hist.slice(${initial.hist}).filter(h=>h.slot==='main').map(h=>[h.a.id,h.b.id])};`);
  assert.equal(r.ev, 4); assert.equal(r.joueur, 1); assert.equal(r.combats.length, 5);
  for (const pair of initial.paires) assert.equal(r.combats.filter(p=>p.join('|')===pair.join('|')).length, 1);
  win.close();
});
