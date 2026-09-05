"use strict";
/* CAGE LEGACY — tools/style-fingerprint-classify.js
   ==== [ANCRE: P7_L4_FINGERPRINT_CLASSIFIER] — Lot 4/P7 §4.3, critère
   d'acceptation : "empreintes statistiques distinctes, vérifiées par un
   test qui identifie le style à partir des seules statistiques de
   combat". §1.4/§4.3 avaient déjà mesuré une empreinte par style (cible/
   position/contrôle/soumission/cartes, cf. tools/monte-carlo-combat.js,
   ANCRE P7_L1_STYLE_FINGERPRINT) mais jamais VÉRIFIÉ qu'elle est
   effectivement discriminante — deux styles peuvent avoir des moyennes
   différentes tout en étant indiscernables combat par combat si la
   variance intra-style est trop grande.

   Ce script est un outil de MESURE dédié (comme monte-carlo-combat.js et
   matchup-matrix.js) — il ne modifie aucune formule du moteur. Méthode :
   classifieur au plus proche centroïde (le plus simple qui vérifie
   correctement la question posée — pas un réseau de neurones pour un
   vecteur à 11 dimensions) sur un vecteur de caractéristiques PAR COMBAT
   (jamais la moyenne du style, qui serait trivialement "reconnaissable" y
   compris avec un bruit intra-style énorme) :
     - part des frappes significatives par zone (tête/corps/jambes)
     - part des frappes significatives par position (distance/clinch/sol)
     - tentatives de soumission par combat
     - contrôle total (s) par combat
     - amenées réussies par combat
     - part de frappes puissantes parmi les frappes significatives, et
       knockdowns par combat (corrélés à koMod, cf. STYLE_PROFILE — utiles
       pour départager deux styles au profil position/zone proche, ex.
       boxe/karaté, cf. §7 du rapport de livraison de ce lot)
   Un ensemble d'ENTRAÎNEMENT calcule le centroïde (vecteur moyen, features
   normalisées en z-score) de chaque style ; un ensemble de TEST, disjoint,
   mesure la précision de classification par plus-proche-centroïde — sans
   cette séparation, un classifieur mémorisant l'entraînement semblerait
   artificiellement précis.

   Usage : node tools/style-fingerprint-classify.js [seed] [fightsPerStyle] ==== */

const { newGameWindow } = require('../tests/helpers/loadGame');

const win = newGameWindow({ runMain: true });

const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
const FIGHTS_PER_STYLE = process.argv[3] ? Number(process.argv[3]) : 1500;
win.setSeed(seed);

const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
const DIVS_H = (win.DIVISIONS && win.DIVISIONS.H) ? win.DIVISIONS.H.map(d => d.id) : ['H-light'];
const DIVS_F = (win.DIVISIONS && win.DIVISIONS.F) ? win.DIVISIONS.F.map(d => d.id) : ['F-straw'];
const ALL_DIVS = [...DIVS_H, ...DIVS_F];
const pick = a => a[Math.floor(win.rnd() * a.length)];

console.log("===============================================================================");
console.log("   CAGE LEGACY — CLASSIFIEUR D'EMPREINTE STATISTIQUE PAR STYLE (LOT 4/P7 §4.3)  ");
console.log("===============================================================================\n");
console.log(`Seed : ${seed} | combats par style : ${FIGHTS_PER_STYLE} (70% entraînement / 30% test)\n`);

/** Vecteur de caractéristiques d'UN combattant sur UN combat — voir en-tête
 * pour le choix des 9 dimensions. @returns {number[]} */
function featuresOf(s) {
  const sig = Math.max(1, s.sig);
  return [
    s.sigHead / sig, s.sigBody / sig, s.sigLeg / sig,
    s.distStrikes / sig, s.clinchStrikes / sig, s.groundStrikes / sig,
    s.subAtt, s.ctrlSec, s.td,
    s.powerStrikes / sig, s.kd,
  ];
}

const rows = []; // {style, feat}
const t0 = Date.now();
for (const style of STYLES) {
  for (let i = 0; i < FIGHTS_PER_STYLE; i++) {
    const opp = pick(STYLES);
    const div = pick(ALL_DIVS);
    const gender = div.startsWith('F-') ? 'F' : 'H';
    const A = win.makeFighter({ div, gender, style });
    const B = win.makeFighter({ div, gender, style: opp });
    const res = win.simulateFight(A, B, (i % 5 === 0) ? 5 : 3);
    rows.push({ style, feat: featuresOf(res.stats.A) });
  }
}
console.log(`>>> ${rows.length} combats simulés en ${((Date.now() - t0) / 1000).toFixed(1)}s.\n`);

/* ==== [ANCRE: P7_L4_FINGERPRINT_SPLIT] — séparation train/test déterministe
   (indices pairs/impairs après le mélange seedé) — jamais un split par
   style consécutif (rows est déjà groupé par style dans l'ordre de la
   boucle ci-dessus), qui biaiserait le train/test s'il coïncidait avec un
   autre ordonnancement. ==== */
for (let i = rows.length - 1; i > 0; i--) {
  const j = Math.floor(win.rnd() * (i + 1));
  [rows[i], rows[j]] = [rows[j], rows[i]];
}
const splitAt = Math.floor(rows.length * 0.7);
const train = rows.slice(0, splitAt), test = rows.slice(splitAt);

const DIM = train[0].feat.length;
const mean = new Array(DIM).fill(0), sd = new Array(DIM).fill(0);
train.forEach(r => r.feat.forEach((v, k) => { mean[k] += v / train.length; }));
train.forEach(r => r.feat.forEach((v, k) => { sd[k] += (v - mean[k]) ** 2 / train.length; }));
for (let k = 0; k < DIM; k++) sd[k] = Math.sqrt(sd[k]) || 1;
const zscore = feat => feat.map((v, k) => (v - mean[k]) / sd[k]);

const centroids = {};
STYLES.forEach(s => { centroids[s] = new Array(DIM).fill(0); });
const countByStyle = {};
STYLES.forEach(s => { countByStyle[s] = 0; });
train.forEach(r => { const z = zscore(r.feat); z.forEach((v, k) => { centroids[r.style][k] += v; }); countByStyle[r.style]++; });
STYLES.forEach(s => { for (let k = 0; k < DIM; k++) centroids[s][k] /= Math.max(1, countByStyle[s]); });

function classify(feat) {
  const z = zscore(feat);
  let best = null, bestDist = Infinity;
  STYLES.forEach(s => {
    const c = centroids[s];
    let dist = 0;
    for (let k = 0; k < DIM; k++) dist += (z[k] - c[k]) ** 2;
    if (dist < bestDist) { bestDist = dist; best = s; }
  });
  return best;
}

const confusion = {};
STYLES.forEach(sTrue => { confusion[sTrue] = {}; STYLES.forEach(sPred => { confusion[sTrue][sPred] = 0; }); });
let correct = 0;
test.forEach(r => {
  const predicted = classify(r.feat);
  confusion[r.style][predicted]++;
  if (predicted === r.style) correct++;
});

console.log(`--- PRÉCISION GLOBALE : ${((correct / test.length) * 100).toFixed(1)}% (${correct}/${test.length}), hasard = ${(100 / STYLES.length).toFixed(1)}% ---\n`);
console.log("--- PRÉCISION PAR STYLE (rappel) ---");
STYLES.forEach(sTrue => {
  const total = STYLES.reduce((sum, sPred) => sum + confusion[sTrue][sPred], 0);
  const right = confusion[sTrue][sTrue];
  console.log(`  ${sTrue.padEnd(12)} : ${total ? ((right / total) * 100).toFixed(1) : '0.0'}% (${right}/${total})`);
});

console.log("\n--- MATRICE DE CONFUSION (ligne = style réel, colonne = style prédit) ---");
console.log('             ' + STYLES.map(s => s.slice(0, 8).padStart(9)).join(''));
STYLES.forEach(sTrue => {
  const row = STYLES.map(sPred => String(confusion[sTrue][sPred]).padStart(9)).join('');
  console.log(sTrue.padEnd(13) + row);
});
console.log("\nCible §4.3 : précision nettement au-dessus du hasard (12.5% pour 8 styles) — une empreinte");
console.log("statistique 'reconnaissable à l'aveugle' doit permettre à ce classifieur simple de");
console.log("retrouver le style bien plus souvent qu'en tirant au sort, à partir des seules stats de combat.");
