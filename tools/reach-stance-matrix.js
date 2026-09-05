"use strict";
/* CAGE LEGACY — tools/reach-stance-matrix.js
   ==== [ANCRE: P8_L8_MESURE_DEDIEE] — Lot 8/P8 §8, critères d'acceptation.
   tools/matchup-matrix.js mesure le STYLE à overall égal ; aucun outil
   existant n'isole l'allonge, le gabarit ou la garde de la même façon —
   les critères d'acceptation du lot 8 exigent explicitement une COURBE
   (pas un seul point) pour l'allonge, une mesure de l'inversion au clinch,
   et un écart mesuré sur les gardes opposées, tout en vérifiant qu'aucun
   style ne sort de la bande 47-53% et que la matrice 8x8 reste inchangée
   dans ses grandes lignes. Ce script est un outil de MESURE dédié (comme
   monte-carlo-combat.js et matchup-matrix.js) — il ne modifie aucune
   formule du moteur, seulement les phys.reach/phys.height/phys.tags/
   phys.stance des combattants qu'il génère, pour isoler chaque axe l'un
   de l'autre :
     1. COURBE D'ALLONGE — mêmes style/overall des deux côtés, reach de A
        décalé de ±X cm par rapport à B (X variable), gabarit/stance
        neutralisés (héritent de B) — mesure le taux de victoire de A par
        palier d'écart d'allonge.
     2. INVERSION AU CLINCH — mêmes paliers d'allonge que 1., mais sur des
        wrestlers (grap élevé => beaucoup de clinch) et mesure le temps de
        contrôle en clinch cumulé plutôt que le taux de victoire.
     3. COURBE DE GABARIT — même principe que 1. mais sur phys.height (à
        allonge égale), distinct de l'allonge par construction.
     4. GARDES OPPOSÉES — pour chacun des 8 styles, mêmes stats des deux
        côtés sauf B.phys.stance (identique à A, puis opposée à A) :
        mesure le taux de victoire de A (doit rester ~50%) et la part de
        frappes aux jambes (doit augmenter en garde ouverte).
   Usage : node tools/reach-stance-matrix.js [seed] [fightsPerBucket] ==== */

const { newGameWindow } = require('../tests/helpers/loadGame');

const win = newGameWindow({ runMain: true });

const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
const N = process.argv[3] ? Number(process.argv[3]) : 3000;
win.setSeed(seed);

const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
const DIVS_H = (win.DIVISIONS && win.DIVISIONS.H) ? win.DIVISIONS.H.map(d => d.id) : ['H-light'];
const pick = a => a[Math.floor(win.rnd() * a.length)];

console.log("===============================================================================");
console.log("     CAGE LEGACY — MESURES DÉDIÉES ALLONGE / GABARIT / GARDE (LOT 8/P8)         ");
console.log("===============================================================================\n");
console.log(`Seed utilisée : ${seed}`);
console.log(`Combats par palier : ${N}\n`);

/** Wilson score interval à 95% — reprise à l'identique de matchup-matrix.js
 * (ANCRE P7_L1_MATCHUP_MATRIX), même justification (borné, fiable près de
 * 0%/100%). @returns {{p:number, lo:number, hi:number}} */
function wilson95(wins, n) {
  if (!n) return { p: 0, lo: 0, hi: 0 };
  const z = 1.959963985;
  const phat = wins / n;
  const denom = 1 + (z * z) / n;
  const center = phat + (z * z) / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat)) / n + (z * z) / (4 * n * n));
  return { p: phat, lo: Math.max(0, (center - margin) / denom), hi: Math.min(1, (center + margin) / denom) };
}

/* ==== [ANCRE: P8_L8_MESURE_EQUAL_OVERALL] — reprise de makeFighterNearOverall
   (matchup-matrix.js, ANCRE P7_L1_EQUAL_OVERALL) : recherche itérative sur
   `level` pour tomber à ±tol de l'overall cible. ==== */
function makeFighterNearOverall(style, div, gender, targetOv, tol) {
  let level = targetOv;
  let best = null, bestDiff = Infinity;
  for (let tries = 0; tries < 20; tries++) {
    const f = win.makeFighter({ style, div, gender, level });
    const ov = win.overall(f);
    const diff = Math.abs(ov - targetOv);
    if (diff < bestDiff) { best = f; bestDiff = diff; }
    if (diff <= tol) return f;
    level = Math.max(15, Math.min(95, level + (targetOv - ov)));
  }
  return best;
}
/* ==== [FIN ANCRE] ==== */

/* =============================================================================
   1. COURBE D'ALLONGE — taux de victoire de A par écart d'allonge (cm),
      style et overall égaux des deux côtés, gabarit/stance neutralisés.
   ============================================================================= */
const REACH_GAPS = [-25, -15, -8, 0, 8, 15, 25];
console.log("--- 1. COURBE D'ALLONGE (style+overall égaux, gabarit/garde neutres) ---");
const reachCurve = [];
for (const gap of REACH_GAPS) {
  let wins = 0, fights = 0;
  for (let i = 0; i < N; i++) {
    const div = pick(DIVS_H);
    const style = pick(STYLES);
    const targetOv = 40 + Math.floor(win.rnd() * 40);
    const A = makeFighterNearOverall(style, div, 'H', targetOv, 3);
    const B = makeFighterNearOverall(style, div, 'H', win.overall(A), 3);
    B.phys.stance = A.phys.stance; // neutralise la garde sur cette mesure
    B.phys.tags = [];
    A.phys.height = B.phys.height; // neutralise le gabarit sur cette mesure
    A.phys.reach = B.phys.reach + gap;
    A.phys.tags = [];
    const res = win.simulateFight(A, B, i % 5 === 0 ? 5 : 3);
    fights++; if (res.winner === 'A') wins++;
  }
  const { p, lo, hi } = wilson95(wins, fights);
  reachCurve.push({ gap, p, lo, hi, fights });
  console.log(`  A-B reach = ${gap >= 0 ? '+' : ''}${gap}cm : ${(p * 100).toFixed(1)}% [${(lo * 100).toFixed(1)}-${(hi * 100).toFixed(1)}] (n=${fights})`);
}
const monotonic = reachCurve.every((c, i) => i === 0 || c.p >= reachCurve[i - 1].p - 0.02);
console.log(`  Monotone (à 2pt de bruit près) : ${monotonic ? 'OUI' : 'NON — À VÉRIFIER'}\n`);

/* =============================================================================
   2. INVERSION AU CLINCH — contrôle en clinch cumulé (s) par écart
      d'allonge, wrestlers (beaucoup de clinch), attrs de clinch égalisées.
   ============================================================================= */
console.log("--- 2. INVERSION AU CLINCH (wrestlers, mêmes attrs de clinch, écart d'allonge seul) ---");
const CLINCH_GAPS = [-25, 0, 25];
const clinchCurve = [];
for (const gap of CLINCH_GAPS) {
  let ctrlA = 0, ctrlB = 0, fights = 0;
  const N2 = Math.round(N * 0.6);
  for (let i = 0; i < N2; i++) {
    const div = pick(DIVS_H);
    const A = win.makeFighter({ style: 'wrestler', div, gender: 'H', level: 55 });
    const B = win.makeFighter({ style: 'wrestler', div, gender: 'H', level: 55 });
    const clinchAttrs = { clinchStr: 80, strength: 80, striking: 55, power: 50, takedown: 55, tdd: 55 };
    Object.assign(A.attrs, clinchAttrs); Object.assign(B.attrs, clinchAttrs);
    B.phys.stance = A.phys.stance; B.phys.tags = []; A.phys.tags = [];
    A.phys.height = B.phys.height;
    A.phys.reach = B.phys.reach + gap;
    const res = win.simulateFight(A, B, 3);
    ctrlA += res.stats.A.clinchCtrlSec || 0;
    ctrlB += res.stats.B.clinchCtrlSec || 0;
    fights++;
  }
  clinchCurve.push({ gap, ctrlA, ctrlB, fights });
  console.log(`  A-B reach = ${gap >= 0 ? '+' : ''}${gap}cm : contrôle clinch cumulé A=${ctrlA.toFixed(0)}s / B=${ctrlB.toFixed(0)}s (n=${fights})`);
}
console.log("  Attendu : A contrôle MOINS en clinch quand A a l'allonge la plus longue (gap>0),");
console.log("            et PLUS quand A a l'allonge la plus courte (gap<0) — inversion vs la courbe 1.\n");

/* =============================================================================
   3. COURBE DE GABARIT — taux de victoire de A par écart de taille (cm),
      allonge/garde neutralisées, distincte de la courbe d'allonge.
   ============================================================================= */
const BUILD_GAPS = [-20, -10, 0, 10, 20];
console.log("--- 3. COURBE DE GABARIT (style+overall+allonge égaux, écart de taille seul) ---");
const buildCurve = [];
for (const gap of BUILD_GAPS) {
  let wins = 0, fights = 0;
  for (let i = 0; i < N; i++) {
    const div = pick(DIVS_H);
    const style = pick(STYLES);
    const targetOv = 40 + Math.floor(win.rnd() * 40);
    const A = makeFighterNearOverall(style, div, 'H', targetOv, 3);
    const B = makeFighterNearOverall(style, div, 'H', win.overall(A), 3);
    B.phys.stance = A.phys.stance; B.phys.tags = []; A.phys.tags = [];
    A.phys.reach = B.phys.reach; // allonge neutralisée
    A.phys.height = B.phys.height + gap;
    const res = win.simulateFight(A, B, i % 5 === 0 ? 5 : 3);
    fights++; if (res.winner === 'A') wins++;
  }
  const { p, lo, hi } = wilson95(wins, fights);
  buildCurve.push({ gap, p, lo, hi, fights });
  console.log(`  A-B height = ${gap >= 0 ? '+' : ''}${gap}cm : ${(p * 100).toFixed(1)}% [${(lo * 100).toFixed(1)}-${(hi * 100).toFixed(1)}] (n=${fights})`);
}
console.log("");

/* =============================================================================
   4. GARDES OPPOSÉES — par style, taux de victoire de A (même garde puis
      garde opposée) et part de frappes aux jambes.
   ============================================================================= */
console.log("--- 4. GARDES OPPOSÉES, PAR STYLE (mêmes attrs, allonge/gabarit égaux) ---");
const N4 = Math.round(N * 0.4);
const stanceRows = [];
for (const style of STYLES) {
  const row = { style };
  for (const opposite of [false, true]) {
    let wins = 0, fights = 0, legShare = 0;
    for (let i = 0; i < N4; i++) {
      const div = pick(DIVS_H);
      const targetOv = 40 + Math.floor(win.rnd() * 40);
      const A = makeFighterNearOverall(style, div, 'H', targetOv, 3);
      const B = makeFighterNearOverall(style, div, 'H', win.overall(A), 3);
      A.phys.reach = B.phys.reach; A.phys.height = B.phys.height; A.phys.tags = []; B.phys.tags = [];
      A.phys.stance = 'orthodox';
      B.phys.stance = opposite ? 'southpaw' : 'orthodox';
      const res = win.simulateFight(A, B, i % 5 === 0 ? 5 : 3);
      fights++; if (res.winner === 'A') wins++;
      const legs = res.stats.A.sigLeg + res.stats.B.sigLeg, tot = res.stats.A.sig + res.stats.B.sig;
      if (tot > 0) legShare += legs / tot;
    }
    const { p, lo, hi } = wilson95(wins, fights);
    row[opposite ? 'opp' : 'same'] = { p, lo, hi, fights, legShare: legShare / fights };
  }
  stanceRows.push(row);
  console.log(`  ${style.padEnd(11)} même garde: ${(row.same.p * 100).toFixed(1)}% [${(row.same.lo * 100).toFixed(1)}-${(row.same.hi * 100).toFixed(1)}] jambes=${(row.same.legShare * 100).toFixed(1)}%   |   garde opposée: ${(row.opp.p * 100).toFixed(1)}% [${(row.opp.lo * 100).toFixed(1)}-${(row.opp.hi * 100).toFixed(1)}] jambes=${(row.opp.legShare * 100).toFixed(1)}%`);
}
const outOfBand = stanceRows.filter(r => r.opp.p < 0.47 || r.opp.p > 0.53);
console.log(`\n  Styles hors bande 47-53% en garde opposée : ${outOfBand.length === 0 ? 'AUCUN' : outOfBand.map(r => r.style).join(', ')}`);
const legShareUp = stanceRows.every(r => r.opp.legShare >= r.same.legShare - 0.01);
console.log(`  Part de frappes aux jambes en hausse (garde opposée >= même garde, ±1pt de bruit) pour tous les styles : ${legShareUp ? 'OUI' : 'NON — À VÉRIFIER'}\n`);

console.log("===============================================================================");
console.log("Fin des mesures dédiées Lot 8/P8.");
console.log("===============================================================================");
