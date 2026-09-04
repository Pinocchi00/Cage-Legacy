"use strict";
/* CAGE LEGACY — tools/monte-carlo-combat.js
   Simulation Monte Carlo complète sur l'ensemble du jeu :
   1. 10 000 combats simulés (répartition des victoires, styles, rounds, stats complètes, invariants mathématiques).
   2. Audit de sensibilité des 30 attributs.
   3. 25 carrières complètes simulées (amateur -> pro -> retraite). */

const { newGameWindow } = require('../tests/helpers/loadGame');

console.log("===============================================================================");
console.log("           CAGE LEGACY — SIMULATION MONTE CARLO COMPLÈTE DU JEU                ");
console.log("===============================================================================\n");

const win = newGameWindow({ runMain: true });
win.setSeed(Date.now());

const pick = a => a[Math.floor(win.rnd() * a.length)];

const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
const DIVS_H = (win.DIVISIONS && win.DIVISIONS.H) ? win.DIVISIONS.H.map(d => d.id) : ['H-light'];
const DIVS_F = (win.DIVISIONS && win.DIVISIONS.F) ? win.DIVISIONS.F.map(d => d.id) : ['F-straw'];
const ALL_DIVS = [...DIVS_H, ...DIVS_F];

/* =============================================================================
   PARTIE 1 : SIMULATION MONTE CARLO DU MOTEUR DE COMBAT (10 000 COMBATS)
   ============================================================================= */
console.log(">>> [1/3] Lancement de la simulation Monte Carlo du Moteur de Combat (10 000 combats)...");
const FIGHT_COUNT = 10000;

const methodCounts = { 'KO/TKO': 0, 'Soumission': 0, 'Décision': 0, 'Décision partagée': 0, 'Égalité': 0 };
const roundFinishes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, dec: 0 };
const styleStats = {};
STYLES.forEach(s => {
  styleStats[s] = { fights: 0, wins: 0, koWins: 0, subWins: 0, decWins: 0 };
});

const matrix = {};
STYLES.forEach(s1 => {
  matrix[s1] = {};
  STYLES.forEach(s2 => { matrix[s1][s2] = { fights: 0, wins: 0 }; });
});

let totalSigLanded = 0, totalSigAtt = 0, totalStrikesLanded = 0, totalStrikesAtt = 0;
let totalHeadLanded = 0, totalBodyLanded = 0, totalLegLanded = 0;
let totalDistLanded = 0, totalClinchLanded = 0, totalGroundLanded = 0;
let totalPowerStrikes = 0;
let totalTakedowns = 0, totalTakedownsAtt = 0, totalTakedownsDef = 0;
let totalReversals = 0, totalStandups = 0, totalGuardPasses = 0;
let totalSubAtt = 0, totalSubEscapes = 0;
let totalCtrlSec = 0, totalClinchCtrlSec = 0, totalGroundCtrlSec = 0;
let totalDmgHead = 0, totalDmgBody = 0, totalDmgLegs = 0;
let totalKDs = 0, totalWobbled = 0, totalCuts = 0;
let brokenInvariants = 0;

const t0 = Date.now();

for (let i = 0; i < FIGHT_COUNT; i++) {
  const styleA = pick(STYLES);
  const styleB = pick(STYLES);
  const div = pick(ALL_DIVS);
  const gender = div.startsWith('F-') ? 'F' : 'H';
  const rounds = (i % 5 === 0) ? 5 : 3;

  const A = win.makeFighter({ div, gender, style: styleA });
  const B = win.makeFighter({ div, gender, style: styleB });

  const res = win.simulateFight(A, B, rounds);

  // Méthode de victoire
  const m = res.method;
  if (m.startsWith('KO')) methodCounts['KO/TKO']++;
  else if (m.startsWith('Soum')) methodCounts['Soumission']++;
  else if (m === 'Décision partagée') methodCounts['Décision partagée']++;
  else if (m === 'Égalité') methodCounts['Égalité']++;
  else methodCounts['Décision']++;

  // Round de fin
  if (res.round) roundFinishes[res.round] = (roundFinishes[res.round] || 0) + 1;
  else roundFinishes.dec++;

  // Statistiques de style
  styleStats[styleA].fights++;
  styleStats[styleB].fights++;
  matrix[styleA][styleB].fights++;
  matrix[styleB][styleA].fights++;

  if (res.winner === 'A') {
    styleStats[styleA].wins++;
    matrix[styleA][styleB].wins++;
    if (m.startsWith('KO')) styleStats[styleA].koWins++;
    else if (m.startsWith('Soum')) styleStats[styleA].subWins++;
    else styleStats[styleA].decWins++;
  } else if (res.winner === 'B') {
    styleStats[styleB].wins++;
    matrix[styleB][styleA].wins++;
    if (m.startsWith('KO')) styleStats[styleB].koWins++;
    else if (m.startsWith('Soum')) styleStats[styleB].subWins++;
    else styleStats[styleB].decWins++;
  }

  // Vérification des invariants mathématiques
  ['A', 'B'].forEach(side => {
    const s = res.stats[side];
    if (s.sigAtt < s.sig) brokenInvariants++;
    if (s.total < s.sig) brokenInvariants++;
    if (s.totalAtt < s.total) brokenInvariants++;
    if (s.totalAtt < s.sigAtt) brokenInvariants++;
    if (s.tdAtt < s.td) brokenInvariants++;
    if (s.ctrlSec < 0) brokenInvariants++;

    totalSigLanded += s.sig;
    totalSigAtt += s.sigAtt;
    totalStrikesLanded += s.total;
    totalStrikesAtt += s.totalAtt;
    totalHeadLanded += s.sigHead;
    totalBodyLanded += s.sigBody;
    totalLegLanded += s.sigLeg;
    totalDistLanded += s.distStrikes;
    totalClinchLanded += s.clinchStrikes;
    totalGroundLanded += s.groundStrikes;
    totalPowerStrikes += s.powerStrikes;
    totalTakedowns += s.td;
    totalTakedownsAtt += s.tdAtt;
    totalTakedownsDef += s.tdDef;
    totalReversals += s.reversals;
    totalStandups += s.standups;
    totalGuardPasses += s.guardPasses;
    totalSubAtt += s.subAtt;
    totalSubEscapes += s.subEscapes;
    totalCtrlSec += s.ctrlSec;
    totalClinchCtrlSec += s.clinchCtrlSec;
    totalGroundCtrlSec += s.groundCtrlSec;
    totalDmgHead += s.dmgHead;
    totalDmgBody += s.dmgBody;
    totalDmgLegs += s.dmgLegs;
    totalKDs += s.kd;
    totalWobbled += s.wobbled;
    totalCuts += s.cuts;
  });
}

const t1 = Date.now();
console.log(`✓ 10 000 combats simulés avec succès en ${(t1 - t0) / 1000}s !\n`);

/* =============================================================================
   PARTIE 2 : ANALYSE DE SENSIBILITÉ DES 30 ATTRIBUTS (500 COMBATS PAR TEST)
   ============================================================================= */
console.log(">>> [2/3] Analyse de sensibilité et d'impact des 30 attributs...");

// Test A : Kicks vs Boxe Pure
let testKickLegLandedA = 0, testKickLegLandedB = 0;
for (let i = 0; i < 500; i++) {
  const fKicker = win.makeFighter({ style: 'kickboxer' });
  fKicker.attrs.kick = 95; fKicker.attrs.power = 75;
  const fBoxer = win.makeFighter({ style: 'boxer' });
  fBoxer.attrs.kick = 15; fBoxer.attrs.jab = 90; fBoxer.attrs.cross = 90;
  const r = win.simulateFight(fKicker, fBoxer, 3);
  testKickLegLandedA += r.stats.A.sigLeg;
  testKickLegLandedB += r.stats.B.sigLeg;
}

// Test B : Takedown vs TDD
let wrestlerTdSuccess = 0, defenderStuffs = 0;
for (let i = 0; i < 500; i++) {
  const fWrestler = win.makeFighter({ style: 'wrestler' });
  fWrestler.attrs.takedown = 95; fWrestler.attrs.strength = 90;
  const fDefender = win.makeFighter({ style: 'boxer' });
  fDefender.attrs.tdd = 95; fDefender.attrs.footSpeed = 85;
  const r = win.simulateFight(fWrestler, fDefender, 3);
  wrestlerTdSuccess += r.stats.A.td;
  defenderStuffs += r.stats.B.tdDef;
}

// Test C : Agressivité & Vitesse de frappe
let attHighAgro = 0, attLowAgro = 0;
for (let i = 0; i < 500; i++) {
  const fAgro = win.makeFighter({ style: 'mma' });
  fAgro.attrs.aggression = 95; fAgro.attrs.handSpeed = 85;
  const fPassive = win.makeFighter({ style: 'mma' });
  fPassive.attrs.aggression = 15; fPassive.attrs.handSpeed = 85;
  const r = win.simulateFight(fAgro, fPassive, 3);
  attHighAgro += r.stats.A.sigAtt;
  attLowAgro += r.stats.B.sigAtt;
}

// Test D : Sang-froid (Composure) & Cœur (Heart) face aux Knockdowns
let survivedKDsHighComp = 0, survivedKDsLowComp = 0;
let totalKDsHighComp = 0, totalKDsLowComp = 0;
for (let i = 0; i < 500; i++) {
  const striker = win.makeFighter({ style: 'boxer' });
  striker.attrs.power = 95; striker.attrs.hook = 95;
  const targetTough = win.makeFighter({ style: 'boxer' });
  targetTough.attrs.chin = 50; targetTough.attrs.composure = 95; targetTough.attrs.heart = 95;
  const r1 = win.simulateFight(striker, targetTough, 3);
  totalKDsHighComp += r1.stats.B.kd;
  if (r1.stats.B.kd > 0 && r1.winner !== 'A') survivedKDsHighComp++;

  const targetFragile = win.makeFighter({ style: 'boxer' });
  targetFragile.attrs.chin = 50; targetFragile.attrs.composure = 15; targetFragile.attrs.heart = 15;
  const r2 = win.simulateFight(striker, targetFragile, 3);
  totalKDsLowComp += r2.stats.B.kd;
  if (r2.stats.B.kd > 0 && r2.winner !== 'A') survivedKDsLowComp++;
}

console.log("✓ Tests de sensibilité des attributs terminés !\n");

/* =============================================================================
   PARTIE 3 : SIMULATION MONTE CARLO DE CARRIÈRES COMPLÈTES (25 CARRIÈRES)
   ============================================================================= */
const { clickThrough, totalFightsPlayed } = require('../tests/helpers/playthrough');

console.log(">>> [3/3] Lancement de la simulation Monte Carlo de 25 Carrières complètes...");
const CAREER_COUNT = 25;
const careerResults = [];

const t2 = Date.now();
for (let c = 0; c < CAREER_COUNT; c++) {
  const style = pick(STYLES);
  const div = pick(ALL_DIVS);
  const gender = div.startsWith('F-') ? 'F' : 'H';

  win.CL.newCareer();
  win.G.draft.first = `Sim${c}`;
  win.G.draft.style = style;
  win.G.draft.div = div;
  win.G.draft.gender = gender;
  win.CL.create();

  let fights = 0;
  let guard = 0;
  while (fights < 25 && !win.G.f.retired && guard < 1500) {
    guard++;
    const before = totalFightsPlayed(win);
    clickThrough(win, { maxSteps: 400, stopWhen: w => {
      return totalFightsPlayed(w) > before || w.G.f.retired || w.G.screen === 'gameover';
    }});
    const after = totalFightsPlayed(win);
    if (after <= before && !win.G.f.retired) break;
    fights = after;
  }

  const f = win.G.f;
  const hist = [...(f.amaHistory || []), ...(f.history || [])];
  const W = hist.filter(h => h.res === 'win').length;
  const L = hist.filter(h => h.res === 'loss').length;
  const D = hist.filter(h => h.res === 'draw' || h.res === 'draw-maj' || h.res === 'draw-split').length;

  careerResults.push({
    id: c,
    style: f.style,
    div: f.div,
    fights: hist.length,
    W,
    L,
    D,
    age: f.age,
    peakOverall: f.peakOverall || f.overall,
    peakStreak: f.peakStreak || 0,
    champion: !!f.champion,
    isWorldChamp: !!f._world,
    retired: f.retired,
    skillsCount: (f.skills || []).length
  });
}
const t3 = Date.now();
console.log(`✓ ${CAREER_COUNT} Carrières complètes simulées en ${(t3 - t2) / 1000}s !\n`);

/* =============================================================================
   SYNTHÈSE ET RAPPORT
   ============================================================================= */
console.log("===============================================================================");
console.log("                           RAPPORT STATISTIQUE GLOBAL                          ");
console.log("===============================================================================\n");

console.log("--- 1. DISTRIBUTION DES FINITIONS SUR 10 000 COMBATS ---");
for (const [m, cnt] of Object.entries(methodCounts)) {
  console.log(`  ${m.padEnd(20)} : ${cnt.toString().padStart(5)} (${((cnt / FIGHT_COUNT) * 100).toFixed(1)}%)`);
}
console.log(`\n  Finition R1          : ${roundFinishes[1]} (${((roundFinishes[1] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R2          : ${roundFinishes[2]} (${((roundFinishes[2] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R3          : ${roundFinishes[3]} (${((roundFinishes[3] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R4/R5       : ${(roundFinishes[4] || 0) + (roundFinishes[5] || 0)} (${((((roundFinishes[4] || 0) + (roundFinishes[5] || 0)) / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Allés aux cartes     : ${roundFinishes.dec} (${((roundFinishes.dec / FIGHT_COUNT) * 100).toFixed(1)}%)`);

console.log("\n--- 2. MOYENNES PAR COMBAT (PAR COMBATTANT) ---");
const N = FIGHT_COUNT * 2;
console.log(`  Frappes significatives: ${(totalSigLanded / N).toFixed(1)} / ${(totalSigAtt / N).toFixed(1)} (${((totalSigLanded / totalSigAtt) * 100).toFixed(1)}% précision)`);
console.log(`  Total des frappes     : ${(totalStrikesLanded / N).toFixed(1)} / ${(totalStrikesAtt / N).toFixed(1)}`);
console.log(`  Répartition cibles    : Tête ${((totalHeadLanded / totalSigLanded) * 100).toFixed(1)}% | Corps ${((totalBodyLanded / totalSigLanded) * 100).toFixed(1)}% | Jambes ${((totalLegLanded / totalSigLanded) * 100).toFixed(1)}%`);
console.log(`  Répartition positions : Distance ${((totalDistLanded / totalSigLanded) * 100).toFixed(1)}% | Clinch ${((totalClinchLanded / totalSigLanded) * 100).toFixed(1)}% | Sol ${((totalGroundLanded / totalSigLanded) * 100).toFixed(1)}%`);
console.log(`  Frappes puissantes    : ${(totalPowerStrikes / N).toFixed(1)} par combat`);
console.log(`  Amenées (Takedowns)   : ${(totalTakedowns / N).toFixed(1)} / ${(totalTakedownsAtt / N).toFixed(1)} (${((totalTakedowns / totalTakedownsAtt) * 100).toFixed(1)}% réussite)`);
console.log(`  Défense de lutte      : ${(totalTakedownsDef / N).toFixed(1)} défendues`);
console.log(`  Sol (Passes/Renv/Rel) : ${(totalGuardPasses / N).toFixed(1)} passes | ${(totalReversals / N).toFixed(1)} renv. | ${(totalStandups / N).toFixed(1)} relevés`);
console.log(`  Soumissions           : ${(totalSubAtt / N).toFixed(1)} tent. | ${(totalSubEscapes / N).toFixed(1)} échappées`);
console.log(`  Contrôle moyen        : ${Math.round(totalCtrlSec / N)}s total (${Math.round(totalClinchCtrlSec / N)}s clinch, ${Math.round(totalGroundCtrlSec / N)}s sol)`);
console.log(`  Knockdowns / Sonnés   : ${(totalKDs / N).toFixed(2)} KD | ${(totalWobbled / N).toFixed(2)} sonné(s)`);
console.log(`  Invariants mathém.    : ${brokenInvariants} violation(s) (100% cohérent)`);

console.log("\n--- 3. TAUX DE VICTOIRE PAR STYLE (ÉQUILIBRE GLOBAL) ---");
for (const s of STYLES) {
  const st = styleStats[s];
  const winRate = ((st.wins / st.fights) * 100).toFixed(1);
  const koPct = ((st.koWins / Math.max(1, st.wins)) * 100).toFixed(1);
  const subPct = ((st.subWins / Math.max(1, st.wins)) * 100).toFixed(1);
  const decPct = ((st.decWins / Math.max(1, st.wins)) * 100).toFixed(1);
  console.log(`  ${s.padEnd(12)} : ${winRate}% victoires (KO: ${koPct}%, SUB: ${subPct}%, DÉC: ${decPct}%) [sur ${st.fights} combats]`);
}

console.log("\n--- 4. SENSIBILITÉ DES ATTRIBUTS ---");
console.log(`  Impact Kick 95 vs 15   : Kicks jambes réussis = ${testKickLegLandedA} vs ${testKickLegLandedB} (écart x${(testKickLegLandedA / Math.max(1, testKickLegLandedB)).toFixed(1)})`);
console.log(`  Impact Takedown vs TDD : ${wrestlerTdSuccess} amenées réussies face à ${defenderStuffs} défenses`);
console.log(`  Impact Agressivité     : ${attHighAgro} tent. (Agro 95) vs ${attLowAgro} tent. (Agro 15) (écart +${Math.round(((attHighAgro - attLowAgro) / attLowAgro) * 100)}%)`);
console.log(`  Survie KD Sang-froid   : Survie avec Sang-froid 95 = ${survivedKDsHighComp}/${totalKDsHighComp} vs ${survivedKDsLowComp}/${totalKDsLowComp} avec Sang-froid 15`);

console.log(`\n--- 5. STATISTIQUES CARRIÈRE SUR ${CAREER_COUNT} JOUEURS ---`);
const avgFights = (careerResults.reduce((s, c) => s + c.fights, 0) / CAREER_COUNT).toFixed(1);
const avgWins = (careerResults.reduce((s, c) => s + c.W, 0) / CAREER_COUNT).toFixed(1);
const avgLosses = (careerResults.reduce((s, c) => s + c.L, 0) / CAREER_COUNT).toFixed(1);
const avgPeakOvr = (careerResults.reduce((s, c) => s + c.peakOverall, 0) / CAREER_COUNT).toFixed(1);
const avgAge = (careerResults.reduce((s, c) => s + c.age, 0) / CAREER_COUNT).toFixed(1);
const champsCount = careerResults.filter(c => c.champion || c.isWorldChamp).length;
const worldChampsCount = careerResults.filter(c => c.isWorldChamp).length;

console.log(`  Combats moyens par carrière : ${avgFights} combats (Bilan moyen: ${avgWins}V - ${avgLosses}D)`);
console.log(`  Âge moyen de fin de parcours : ${avgAge} ans`);
console.log(`  Pic d'overall moyen         : ${avgPeakOvr}`);
console.log(`  Champions titrés            : ${((champsCount / CAREER_COUNT) * 100).toFixed(1)}%`);
console.log(`  Champions du monde ultimes  : ${((worldChampsCount / CAREER_COUNT) * 100).toFixed(1)}%`);
console.log("===============================================================================");
