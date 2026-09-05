"use strict";
/* CAGE LEGACY — tools/adaptability-window-matrix.js
   ==== [ANCRE: P8_L10_MESURE_DEDIEE] — Lot 10/P8, critères d'acceptation.
   Aucun outil existant ne mesure spécifiquement l'effet de la fenêtre
   d'adaptabilité (ANCRE P8_L10_ADAPTABILITE_FENETRE, engine-combat.js) sur
   un mauvais matchup — matchup-matrix.js mesure le STYLE à overall égal,
   reach-stance-matrix.js l'allonge/le gabarit/la garde SANS adaptabilité.
   Ce script est un outil de MESURE dédié (comme les précédents) — il ne
   modifie aucune formule du moteur. Trois mesures, chacune ciblant un
   critère d'acceptation du lot :
     1. NEUTRE — mêmes attributs/allonge/gabarit/garde des deux côtés
        (mirror match), seule l'adaptabilité (partagée par les deux)
        varie : le taux de victoire doit rester ~50% quelle que soit
        l'adaptabilité ("aucun effet mesurable sur un affrontement
        neutre").
     2. AMPLITUDE PAR ÉCART D'ALLONGE — pour plusieurs paliers d'écart
        d'allonge (mauvais matchup physique), compare le taux de victoire
        du désavantagé à adaptabilité faible vs élevée : doit être
        MEILLEUR à adaptabilité élevée, sans jamais renverser le sens de
        l'écart ("réduit l'écart... sans jamais l'annuler").
     3. FORMAT DE COMBAT — la même mesure sur 3 ET 5 rounds, à écart
        d'allonge fixe : l'effet doit être plus marqué sur 5 rounds
        ("l'adaptabilité vaut nettement plus... sur cinq rounds").
   Usage : node tools/adaptability-window-matrix.js [seed] [N] ==== */

const { newGameWindow } = require('../tests/helpers/loadGame');

const win = newGameWindow({ runMain: true });
const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
const N = process.argv[3] ? Number(process.argv[3]) : 4000;
win.setSeed(seed);

function wilson(wins, n) {
  if (n === 0) return [0, 0, 0];
  const p = wins / n, z = 1.959964;
  const denom = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / denom;
  return [p, Math.max(0, center - half), Math.min(1, center + half)];
}

console.log("===============================================================================");
console.log("     CAGE LEGACY — MESURE DÉDIÉE : FENÊTRE D'ADAPTABILITÉ (LOT 10/P8)          ");
console.log("===============================================================================\n");
console.log(`Seed : ${seed} | N par condition : ${N}\n`);

/* ---------------------------------------------------------------------- */
console.log("--- 1. AFFRONTEMENT NEUTRE (mirror match, adaptabilité partagée) ---");
function neutralWinRate(adapt, rounds) {
  let winsA = 0, n = 0;
  for (let i = 0; i < N; i++) {
    win.setSeed(seed + i);
    const A = win.makeFighter({ style: 'mma', level: 55 });
    const B = win.makeFighter({ style: 'mma', level: 55 });
    B.attrs = Object.assign({}, A.attrs);
    B.phys = Object.assign({}, A.phys, { tags: (A.phys.tags || []).slice() });
    A.attrs.adaptability = adapt; B.attrs.adaptability = adapt;
    const res = win.simulateFight(A, B, rounds);
    if (res.winner === 'A') winsA++;
    if (res.winner === 'A' || res.winner === 'B') n++;
  }
  return wilson(winsA, n);
}
for (const adapt of [10, 50, 90]) {
  const [p, lo, hi] = neutralWinRate(adapt, 5);
  console.log(`  adaptabilité (des deux côtés) = ${adapt} : A gagne ${(p * 100).toFixed(1)}% [${(lo * 100).toFixed(1)}-${(hi * 100).toFixed(1)}]`);
}

/* ---------------------------------------------------------------------- */
console.log("\n--- 2. AMPLITUDE PAR ÉCART D'ALLONGE (A désavantagé, adaptabilité faible vs élevée, 5 rounds) ---");
function reachGapWinRate(reachGapCm, adaptA, rounds) {
  let winsA = 0, n = 0;
  for (let i = 0; i < N; i++) {
    win.setSeed(seed + i);
    const A = win.makeFighter({ style: 'boxer', level: 55 });
    const B = win.makeFighter({ style: 'boxer', level: 55 });
    A.phys.reach = B.phys.reach - reachGapCm;
    A.attrs.adaptability = adaptA; B.attrs.adaptability = 50;
    const res = win.simulateFight(A, B, rounds);
    if (res.winner === 'A') winsA++;
    if (res.winner === 'A' || res.winner === 'B') n++;
  }
  return wilson(winsA, n);
}
for (const gap of [10, 20, 30]) {
  const [pLow] = reachGapWinRate(gap, 10, 5);
  const [pHigh] = reachGapWinRate(gap, 95, 5);
  console.log(`  écart d'allonge -${gap}cm : A (désavantagé) gagne ${(pLow * 100).toFixed(1)}% à adapt.=10, ${(pHigh * 100).toFixed(1)}% à adapt.=95 (Δ ${((pHigh - pLow) * 100).toFixed(1)} pt)`);
}

/* ---------------------------------------------------------------------- */
console.log("\n--- 3. EFFET PAR FORMAT DE COMBAT (écart d'allonge -20cm fixe, écart de taux de victoire PAIRÉ par seed) ---");
/** Même seed pour les deux tirs (donc mêmes attributs de base tirés pour A/B,
 * seule l'adaptabilité de A change) : élimine le bruit dominant de la
 * variance combat-à-combat (finition/KO), qui noie sinon l'effet — réel
 * mais modeste — sur une métrique non pariée (deux moyennes indépendantes,
 * tentée et abandonnée pour cette raison, cf. rapport de lot). */
function pairedWinRateDelta(rounds, gap) {
  let lowWins = 0, highWins = 0, decided = 0;
  for (let i = 0; i < N; i++) {
    win.setSeed(seed + 500000 + i);
    const ALow = win.makeFighter({ style: 'boxer', level: 55 });
    const BLow = win.makeFighter({ style: 'boxer', level: 55 });
    ALow.phys.reach = BLow.phys.reach - gap;
    ALow.attrs.adaptability = 10; BLow.attrs.adaptability = 50;
    const resLow = win.simulateFight(ALow, BLow, rounds);

    win.setSeed(seed + 500000 + i);
    const AHigh = win.makeFighter({ style: 'boxer', level: 55 });
    const BHigh = win.makeFighter({ style: 'boxer', level: 55 });
    AHigh.phys.reach = BHigh.phys.reach - gap;
    AHigh.attrs.adaptability = 95; BHigh.attrs.adaptability = 50;
    const resHigh = win.simulateFight(AHigh, BHigh, rounds);

    if (resLow.winner === 'A' || resLow.winner === 'B') {
      decided++;
      if (resLow.winner === 'A') lowWins++;
      if (resHigh.winner === 'A') highWins++;
    }
  }
  return { lowWinRate: lowWins / decided, highWinRate: highWins / decided, decided };
}
const r3 = pairedWinRateDelta(3, 20);
const r5 = pairedWinRateDelta(5, 20);
console.log(`  3 rounds : A (désavantagé) gagne ${(r3.lowWinRate * 100).toFixed(2)}% (adapt.=10) -> ${(r3.highWinRate * 100).toFixed(2)}% (adapt.=95), Δ ${((r3.highWinRate - r3.lowWinRate) * 100).toFixed(2)} pt`);
console.log(`  5 rounds : A (désavantagé) gagne ${(r5.lowWinRate * 100).toFixed(2)}% (adapt.=10) -> ${(r5.highWinRate * 100).toFixed(2)}% (adapt.=95), Δ ${((r5.highWinRate - r5.lowWinRate) * 100).toFixed(2)} pt`);
console.log(`  Ratio 5R/3R = ${((r5.highWinRate - r5.lowWinRate) / (r3.highWinRate - r3.lowWinRate)).toFixed(2)}x (attendu : > 1)`);

console.log("\n===============================================================================");
