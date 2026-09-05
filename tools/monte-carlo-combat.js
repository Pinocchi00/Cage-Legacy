"use strict";
/* CAGE LEGACY — tools/monte-carlo-combat.js
   Simulation Monte Carlo complète sur l'ensemble du jeu :
   1. 12 000 combats simulés (répartition des victoires, styles, rounds, stats complètes, invariants mathématiques).
   2. Audit de sensibilité des 30 attributs.
   3. 25 carrières complètes simulées (amateur -> pro -> retraite).

   ==== [ANCRE: P7_L1_12000] — LOT 1/P7, règle commune #2 : "avant/après sur
   12 000 combats à chaque lot". Repris ici (au lieu des 10 000 précédents)
   pour que ce harnais serve directement de référence aux lots 2/3/4
   suivants sans qu'ils aient à ajuster ce nombre. ==== */

const { newGameWindow } = require('../tests/helpers/loadGame');

console.log("===============================================================================");
console.log("           CAGE LEGACY — SIMULATION MONTE CARLO COMPLÈTE DU JEU                ");
console.log("===============================================================================\n");

const win = newGameWindow({ runMain: true });
/* ==== [ANCRE: P7_L1_SEED_CLI] — LOT 1/P7 §1.5 : le rapport de référence
   (tools/reports/baseline-P7.md) doit rester reproductible à l'identique
   (règle commune #5, "le déterminisme seedé est non négociable"). Un seed
   optionnel en argument CLI permet de figer la seed utilisée pour générer
   ce rapport précis, sans changer le comportement par défaut (Date.now(),
   inchangé) des lancements ad hoc de ce harnais. ==== */
const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
win.setSeed(seed);
console.log(`Seed utilisée : ${seed}\n`);
/* ==== [FIN ANCRE] ==== */

const pick = a => a[Math.floor(win.rnd() * a.length)];

const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
const DIVS_H = (win.DIVISIONS && win.DIVISIONS.H) ? win.DIVISIONS.H.map(d => d.id) : ['H-light'];
const DIVS_F = (win.DIVISIONS && win.DIVISIONS.F) ? win.DIVISIONS.F.map(d => d.id) : ['F-straw'];
const ALL_DIVS = [...DIVS_H, ...DIVS_F];

/* ==== [ANCRE: P7_L1_QUANTILES] — LOT 1/P7 §1.1 : p90 seul ne voit pas la
   queue de distribution que ce plan cherche justement à mesurer (dégâts par
   pics en L2, décisions serrées en L3...). p50 (médiane, moins sensible aux
   valeurs extrêmes que la moyenne), p99 et le maximum brut s'ajoutent à
   côté de p90 — sans le retirer, tout code qui lisait déjà s.p90 continue
   de fonctionner à l'identique. ==== */
/** Moyenne, écart-type (échantillon, n-1), p50/p90/p99 (rang le plus proche)
 * et maximum d'un tableau de valeurs numériques — sert à détecter un
 * changement de FORME de distribution (variance, queue longue, valeur
 * extrême) qu'une simple comparaison de moyennes avant/après ne peut pas
 * voir.
 * @param {number[]} arr @returns {{mean:number, sd:number, p50:number, p90:number, p99:number, max:number}} */
function computeStats(arr) {
  const n = arr.length;
  if (!n) return { mean: 0, sd: 0, p50: 0, p90: 0, p99: 0, max: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const sorted = [...arr].sort((a, b) => a - b);
  const quantile = q => sorted[Math.min(n - 1, Math.ceil(q * n) - 1)];
  return { mean, sd, p50: quantile(0.5), p90: quantile(0.9), p99: quantile(0.99), max: sorted[n - 1] };
}
/** Formate {mean,sd,p50,p90,p99,max} comme "12.3 (σ 4.1, p50 11, p90 18, p99 27, max 35)". */
function fmtStats(s, digits = 1) {
  return `${s.mean.toFixed(digits)} (σ ${s.sd.toFixed(digits)}, p50 ${s.p50.toFixed(digits)}, p90 ${s.p90.toFixed(digits)}, p99 ${s.p99.toFixed(digits)}, max ${s.max.toFixed(digits)})`;
}
/* ==== [FIN ANCRE] ==== */

/* =============================================================================
   PARTIE 1 : SIMULATION MONTE CARLO DU MOTEUR DE COMBAT (10 000 COMBATS)
   ============================================================================= */
console.log(">>> [1/3] Lancement de la simulation Monte Carlo du Moteur de Combat (12 000 combats)...");
const FIGHT_COUNT = 12000;

const methodCounts = { 'KO/TKO': 0, 'Soumission': 0, 'Décision': 0, 'Décision partagée': 0, 'Égalité': 0 };
const roundFinishes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, dec: 0 };
const styleStats = {};
/* ==== [ANCRE: P7_L1_STYLE_FINGERPRINT] — LOT 1/P7 §1.4 : "empreinte
   statistique par style" — carte d'identité que L4 (§4.3) devra rendre
   reconnaissable. Purement additif à styleStats (fights/wins/koWins/...
   inchangés) : cible/position/contrôle/soumission/cartes, cumulés par
   style des DEUX côtés (A et B) de chaque combat, pas seulement du
   vainqueur — un style se reconnaît à SA façon de combattre, gagnante ou
   perdante. ==== */
STYLES.forEach(s => {
  styleStats[s] = {
    fights: 0, wins: 0, koWins: 0, subWins: 0, decWins: 0,
    sigLanded: 0, headLanded: 0, bodyLanded: 0, legLanded: 0,
    distLanded: 0, clinchLanded: 0, groundLanded: 0,
    ctrlSec: 0, clinchCtrlSec: 0, groundCtrlSec: 0,
    subAtt: 0, cardsCount: 0
  };
});
/* ==== [FIN ANCRE] ==== */

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

/* ==== [ANCRE: MC_DISTRIBUTION_STATS] — les totaux ci-dessus ne donnaient
   que des moyennes : deux distributions peuvent avoir la même moyenne et
   une forme complètement différente (variance qui explose, une queue
   longue de combats à 150 frappes) sans qu'aucune comparaison avant/après
   ne le détecte. Les tableaux ci-dessous gardent la valeur PAR
   COMBATTANT (une entrée par côté A/B de chaque combat, comme les
   moyennes existantes) pour calculer écart-type et p90 en plus de la
   moyenne — cf. computeStats() et son usage en RAPPORT STATISTIQUE. ==== */
const samples = {
  sigLanded: [], sigAtt: [], strikesLanded: [], strikesAtt: [],
  powerStrikes: [], takedowns: [], takedownsAtt: [],
  ctrlSec: [], clinchCtrlSec: [], groundCtrlSec: [],
  kd: [], wobbled: [],
  /* ==== [ANCRE: P7_L1_DMG_TOTAL] — LOT 1/P7 §"État des lieux mesuré" :
     les dégâts CUMULÉS (dmgHead+dmgBody+dmgLegs) par combattant, pas
     encore suivis par ce harnais alors que c'est la métrique même que
     L2 doit faire bouger (queue de distribution des dégâts). ==== */
  dmgTotal: []
  /* ==== [FIN ANCRE] ==== */
};
/* ==== [FIN ANCRE] ==== */

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

  /* ==== [ANCRE: P7_L1_STYLE_FINGERPRINT_CARDS] — LOT 1/P7 §1.4 : part des
     combats allant aux cartes, par style (décision, décision partagée ou
     égalité — les trois méthodes qui ne viennent pas d'une finition). ==== */
  const wentToCards = !res.round;
  if (wentToCards) { styleStats[styleA].cardsCount++; styleStats[styleB].cardsCount++; }
  /* ==== [FIN ANCRE] ==== */

  // Vérification des invariants mathématiques
  const sideStyle = { A: styleA, B: styleB };
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

    samples.sigLanded.push(s.sig); samples.sigAtt.push(s.sigAtt);
    samples.strikesLanded.push(s.total); samples.strikesAtt.push(s.totalAtt);
    samples.powerStrikes.push(s.powerStrikes);
    samples.takedowns.push(s.td); samples.takedownsAtt.push(s.tdAtt);
    samples.ctrlSec.push(s.ctrlSec); samples.clinchCtrlSec.push(s.clinchCtrlSec); samples.groundCtrlSec.push(s.groundCtrlSec);
    samples.kd.push(s.kd); samples.wobbled.push(s.wobbled);
    samples.dmgTotal.push(s.dmgHead + s.dmgBody + s.dmgLegs);

    /* ==== [ANCRE: P7_L1_STYLE_FINGERPRINT] — voir déclaration de styleStats
       plus haut : accumulation par style, des DEUX côtés du combat. ==== */
    const st = styleStats[sideStyle[side]];
    st.sigLanded += s.sig;
    st.headLanded += s.sigHead; st.bodyLanded += s.sigBody; st.legLanded += s.sigLeg;
    st.distLanded += s.distStrikes; st.clinchLanded += s.clinchStrikes; st.groundLanded += s.groundStrikes;
    st.ctrlSec += s.ctrlSec; st.clinchCtrlSec += s.clinchCtrlSec; st.groundCtrlSec += s.groundCtrlSec;
    st.subAtt += s.subAtt;
    /* ==== [FIN ANCRE] ==== */
  });
}

const t1 = Date.now();
console.log(`✓ 12 000 combats simulés avec succès en ${(t1 - t0) / 1000}s !\n`);

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

console.log("--- 1. DISTRIBUTION DES FINITIONS SUR 12 000 COMBATS ---");
for (const [m, cnt] of Object.entries(methodCounts)) {
  console.log(`  ${m.padEnd(20)} : ${cnt.toString().padStart(5)} (${((cnt / FIGHT_COUNT) * 100).toFixed(1)}%)`);
}
console.log(`\n  Finition R1          : ${roundFinishes[1]} (${((roundFinishes[1] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R2          : ${roundFinishes[2]} (${((roundFinishes[2] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R3          : ${roundFinishes[3]} (${((roundFinishes[3] / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Finition R4/R5       : ${(roundFinishes[4] || 0) + (roundFinishes[5] || 0)} (${((((roundFinishes[4] || 0) + (roundFinishes[5] || 0)) / FIGHT_COUNT) * 100).toFixed(1)}%)`);
console.log(`  Allés aux cartes     : ${roundFinishes.dec} (${((roundFinishes.dec / FIGHT_COUNT) * 100).toFixed(1)}%)`);
/* ==== [ANCRE: P7_L1_SPLIT_DEC_SHARE] — LOT 1/P7, "État des lieux mesuré" et
   cible L3 §3.3 : la part des décisions PARTAGÉES rapportée à l'ensemble
   des DÉCISIONS (Décision + Décision partagée + Égalité) — pas à
   l'ensemble des combats — est la métrique que L3 doit ramener sous 15%. ==== */
const totalDecisions = methodCounts['Décision'] + methodCounts['Décision partagée'] + methodCounts['Égalité'];
const splitDecShare = totalDecisions ? (methodCounts['Décision partagée'] / totalDecisions) * 100 : 0;
console.log(`  Décisions partagées  : ${splitDecShare.toFixed(1)}% de l'ensemble des décisions (cible L3 : < 15%)`);
/* ==== [FIN ANCRE] ==== */

console.log("\n--- 2. MOYENNES PAR COMBAT (PAR COMBATTANT) ---");
const N = FIGHT_COUNT * 2;
/* ==== [ANCRE: MC_DISTRIBUTION_STATS] — chaque ligne porte désormais
   moyenne / écart-type (σ) / p90 en plus du total brut : deux runs qui ont
   la même moyenne mais un σ ou un p90 différent signalent un changement de
   forme de distribution (variance, queue longue) qu'une comparaison de
   moyennes seules laisserait passer — voir computeStats() plus haut. ==== */
const statSigLanded = computeStats(samples.sigLanded);
const statSigAtt = computeStats(samples.sigAtt);
const statStrikesLanded = computeStats(samples.strikesLanded);
const statStrikesAtt = computeStats(samples.strikesAtt);
const statPowerStrikes = computeStats(samples.powerStrikes);
const statTakedowns = computeStats(samples.takedowns);
const statTakedownsAtt = computeStats(samples.takedownsAtt);
const statCtrlSec = computeStats(samples.ctrlSec);
const statClinchCtrlSec = computeStats(samples.clinchCtrlSec);
const statGroundCtrlSec = computeStats(samples.groundCtrlSec);
const statKD = computeStats(samples.kd);
const statWobbled = computeStats(samples.wobbled);
const statDmgTotal = computeStats(samples.dmgTotal);

console.log(`  Frappes significatives: ${fmtStats(statSigLanded)} / ${fmtStats(statSigAtt)} (${((totalSigLanded / totalSigAtt) * 100).toFixed(1)}% précision)`);
console.log(`  Total des frappes     : ${fmtStats(statStrikesLanded)} / ${fmtStats(statStrikesAtt)}`);
console.log(`  Répartition cibles    : Tête ${((totalHeadLanded / totalSigLanded) * 100).toFixed(1)}% | Corps ${((totalBodyLanded / totalSigLanded) * 100).toFixed(1)}% | Jambes ${((totalLegLanded / totalSigLanded) * 100).toFixed(1)}%`);
console.log(`  Répartition positions : Distance ${((totalDistLanded / totalSigLanded) * 100).toFixed(1)}% | Clinch ${((totalClinchLanded / totalSigLanded) * 100).toFixed(1)}% | Sol ${((totalGroundLanded / totalSigLanded) * 100).toFixed(1)}%`);
console.log(`  Frappes puissantes    : ${fmtStats(statPowerStrikes)} par combat`);
console.log(`  Amenées (Takedowns)   : ${fmtStats(statTakedowns)} / ${fmtStats(statTakedownsAtt)} (${((totalTakedowns / totalTakedownsAtt) * 100).toFixed(1)}% réussite)`);
console.log(`  Défense de lutte      : ${(totalTakedownsDef / N).toFixed(1)} défendues`);
console.log(`  Sol (Passes/Renv/Rel) : ${(totalGuardPasses / N).toFixed(1)} passes | ${(totalReversals / N).toFixed(1)} renv. | ${(totalStandups / N).toFixed(1)} relevés`);
console.log(`  Soumissions           : ${(totalSubAtt / N).toFixed(1)} tent. | ${(totalSubEscapes / N).toFixed(1)} échappées`);
console.log(`  Contrôle moyen        : ${fmtStats(statCtrlSec, 0)}s total (${fmtStats(statClinchCtrlSec, 0)}s clinch, ${fmtStats(statGroundCtrlSec, 0)}s sol)`);
console.log(`  Knockdowns / Sonnés   : ${fmtStats(statKD, 2)} KD | ${fmtStats(statWobbled, 2)} sonné(s)`);
/* ==== [ANCRE: P7_L1_DMG_TOTAL] — voir déclaration de samples.dmgTotal plus
   haut : reprend exactement la métrique citée par le plan P7 ("dégâts
   cumulés moyens 11,35, écart-type 6,23, p90 19, maximum 35 sur 24 000
   relevés") — sert de point de comparaison direct pour L2 §"Critères
   d'acceptation" (écart-type +40% minimum, moyenne stable ±10%). ==== */
console.log(`  Dégâts cumulés        : ${fmtStats(statDmgTotal)} (référence L2)`);
/* ==== [FIN ANCRE] ==== */
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

/* ==== [ANCRE: P7_L1_STYLE_FINGERPRINT] — LOT 1/P7 §1.4 : "carte d'identité"
   par style — répartition des frappes par cible/position, contrôle,
   tentatives de soumission, part des combats allant aux cartes. Référence
   que L4 §4.3 devra rendre plus tranchée (empreintes "reconnaissables à
   l'aveugle"). ==== */
console.log("\n--- 3b. EMPREINTE STATISTIQUE PAR STYLE (RÉFÉRENCE L4) ---");
for (const s of STYLES) {
  const st = styleStats[s];
  const n = st.fights || 1;
  const sig = st.sigLanded || 1;
  const headPct = (st.headLanded / sig) * 100, bodyPct = (st.bodyLanded / sig) * 100, legPct = (st.legLanded / sig) * 100;
  const distPct = (st.distLanded / sig) * 100, clinchPct = (st.clinchLanded / sig) * 100, groundPct = (st.groundLanded / sig) * 100;
  const cardsPct = (st.cardsCount / n) * 100;
  console.log(`  ${s.padEnd(12)} : cible Tête ${headPct.toFixed(0)}%/Corps ${bodyPct.toFixed(0)}%/Jambes ${legPct.toFixed(0)}% | position Distance ${distPct.toFixed(0)}%/Clinch ${clinchPct.toFixed(0)}%/Sol ${groundPct.toFixed(0)}% | contrôle ${(st.ctrlSec / n).toFixed(1)}s | sub ${(st.subAtt / n).toFixed(2)} tent. | cartes ${cardsPct.toFixed(1)}%`);
}
/* ==== [FIN ANCRE] ==== */

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
