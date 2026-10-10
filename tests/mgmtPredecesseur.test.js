"use strict";
/* CAGE LEGACY — tests/mgmtPredecesseur.test.js
   ===========================================================================
   Monde lot 1 T2 (docs/lots/MONDE-LOT-1-T2.md) : le prédécesseur. Le joueur
   automatique de l'outil de mesure est une fonction du jeu, sans écran
   (mgmt-predecesseur.js, ancre MONDE_LOT1_T2_PREDECESSEUR). Une seule source :
   l'outil l'appelle (tests/outillage.test.js, tests 7 et 8).
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newGameWindow, readScriptOrder } = require('./helpers/loadGame');

const racine = path.join(__dirname, '..');
const SOURCE = fs.readFileSync(path.join(racine, 'mgmt-predecesseur.js'), 'utf8');
const SANS_COMMENTAIRES = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

/** Une partie neuve comme l'outil la crée : graine, organisation Split, vivier, monde extérieur, pile, G branché, agenda. */
function partieNeuve(graine) {
  const win = newGameWindow({ runMain: true });
  win.eval(`(function(){
    setSeed(${graine});
    const m=mgmtDefault('split'); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m);
    G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
  })()`);
  return win;
}

/** Joue n soirées (k = 0 … n-1) ; rend les comptes rendus sans l'événement (trop gros) et l'état sérialisé après chacune. */
function jouer(win, n) {
  return JSON.parse(win.eval(`JSON.stringify((function(){
    const m=G.mgmt, out=[];
    for(let k=0;k<${n};k++){ const s=mgmtPredecesseurSoiree(m,k);
      out.push({s:Object.assign({},s,{evenement:s.evenement?{fights:s.evenement.fights.length}:null}),etat:JSON.stringify(m)}); }
    return out; })())`));
}

/* ===================== Test 1 ===================== */
test('Monde lot 1 T2 — mgmt-predecesseur.js est chargé après mgmt-agenda.js et mgmt-save.js, avant mgmt-ecran-semaine.js, avec un ?v=', () => {
  const ordre = readScriptOrder();
  const i = ordre.indexOf('mgmt-predecesseur.js');
  assert.ok(i >= 0, 'le fichier est dans index.html');
  assert.ok(i > ordre.indexOf('mgmt-agenda.js'), 'après mgmt-agenda.js');
  assert.ok(i > ordre.indexOf('mgmt-save.js'), 'après mgmt-save.js');
  assert.ok(i < ordre.indexOf('mgmt-ecran-semaine.js'), 'avant mgmt-ecran-semaine.js');
  assert.match(fs.readFileSync(path.join(racine, 'index.html'), 'utf8'), /<script src="mgmt-predecesseur\.js\?v=[^"]+"><\/script>/);
});

/* ===================== Test 2 ===================== */
test('Monde lot 1 T2 — le prédécesseur est sans écran : ni document, ni CL, ni window, ni localStorage, ni Math.random', () => {
  assert.equal(SOURCE.split('\n')[0], '"use strict";', 'ligne 1 : "use strict";');
  assert.ok(SOURCE.includes('/* ==== [ANCRE: MONDE_LOT1_T2_PREDECESSEUR]') && SOURCE.includes('/* ==== [FIN ANCRE] ==== */'), "l'ancre et sa fin");
  for (const motif of [/\bdocument\b/, /\bCL\b/, /\bwindow\b/, /\blocalStorage\b/, /Math\.random/, /\brnd\s*\(/, /\bsetSeed\b/]) {
    assert.ok(!motif.test(SANS_COMMENTAIRES), 'le source ne contient pas ' + motif);
  }
});

/* ===================== Test 3 ===================== */
test('Monde lot 1 T2 — la cadence du titre vient des réglages : aucun k%2 en dur, titreCadence lu, réglages par défaut neufs à chaque appel', () => {
  assert.ok(!SANS_COMMENTAIRES.includes('k%2'), 'aucun k%2 en dur');
  assert.ok(SANS_COMMENTAIRES.includes('titreCadence'), 'titreCadence est lu');
  const win = newGameWindow();
  const a = win.mgmtPredecesseurReglages();
  assert.deepEqual(JSON.parse(JSON.stringify(a)), { titreCadence: 2 });
  a.titreCadence = 99; a.autre = true;
  assert.deepEqual(JSON.parse(JSON.stringify(win.mgmtPredecesseurReglages())), { titreCadence: 2 }, "muter l'objet rendu ne change pas l'appel suivant");
});

/* ===================== Test 4 ===================== */
test('Monde lot 1 T2 — deux soirées de la graine 20261008 : compte rendu complet, neuf combats, cycle +1, garde G.mgmt', () => {
  const win = partieNeuve(20261008);
  const nbDivisions = win.eval('allDivisions().length');
  const cycle0 = win.eval('G.mgmt.cycle');
  const [s0, s1] = jouer(win, 2).map(x => x.s);
  assert.equal(s0.jouee, true);
  assert.equal(s0.k, 0);
  assert.equal(s0.evenement.fights, 9, 'neuf combats');
  assert.equal(win.eval('G.mgmt.eventsPlayed'), 2, 'deux soirées jouées');
  assert.equal(win.eval('G.mgmt.cycle'), cycle0 + 2, 'le cycle avance de un par soirée');
  assert.equal(s0.reclames, 0);
  assert.equal(s0.tetes, 5);
  assert.equal(s0.titres, 2);
  assert.equal(s0.champions.avant.length, nbDivisions);
  assert.equal(s0.champions.apres.length, nbDivisions);
  assert.deepEqual(Object.keys(s0.refus), ['trop-grand', 'caisse', 'trop-bas', 'offre']);
  for (const v of Object.values(s0.refus)) assert.ok(Number.isInteger(v) && v >= 0);
  assert.ok(Number.isInteger(s0.prolonges) && s0.prolonges >= 0);
  assert.equal(typeof s0.decouvert, 'boolean');
  assert.equal(s1.k, 1);
  assert.equal(s1.reclames, 1);
  assert.equal(s1.tetes, 4);
  /* la garde : G.mgmt doit être la partie jouée */
  const leve = win.eval(`(function(){ const m=G.mgmt, autre=mgmtDefault('split'); G.mgmt=autre;
    try{ mgmtPredecesseurSoiree(m,2); return 'rien'; }catch(e){ return e instanceof Error?'erreur':'autre'; }finally{ G.mgmt=m; } })()`);
  assert.equal(leve, 'erreur', 'avec G.mgmt ≠ m, la fonction lève une Error');
});

/* ===================== Test 5 ===================== */
test('Monde lot 1 T2 — même graine, deux parties, quatre soirées : état sérialisé identique après chaque soirée ; une autre graine donne un autre état', () => {
  const a = jouer(partieNeuve(20261008), 4);
  const b = jouer(partieNeuve(20261008), 4);
  const c = jouer(partieNeuve(20261009), 4);
  for (let i = 0; i < 4; i++) assert.equal(a[i].etat, b[i].etat, 'soirée ' + i + ' : même graine, même état');
  assert.notEqual(a[3].etat, c[3].etat, 'une autre graine donne un autre état');
});

/* ===================== Test 6 ===================== */
test('Monde lot 1 T2 — la partie jouée reste valide : mgmtParseAndValidate accepte le JSON après trois soirées', () => {
  const win = partieNeuve(20261008);
  jouer(win, 3);
  assert.equal(win.eval('G.mgmt.v === MGMT_SAVE_VERSION'), true);
  assert.equal(win.eval('!!mgmtParseAndValidate(JSON.stringify(G.mgmt))'), true);
});
