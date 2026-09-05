"use strict";
/* CAGE LEGACY — tools/matchup-matrix.js
   ==== [ANCRE: P7_L1_MATCHUP_MATRIX] — LOT 1/P7 §1.2 et §1.3.
   La matrice style contre style existe déjà dans tools/monte-carlo-combat.js
   (matrix[styleA][styleB]) mais n'est: (a) jamais exposée en sortie lisible,
   (b) jamais dimensionnée pour garantir un effectif minimal par cellule
   (les styles sont piochés au hasard dans la boucle principale, donc
   certaines cases n'ont que quelques dizaines de combats), (c) jamais
   calculée à overall égal, ce qui est la seule façon d'isoler la
   contribution du STYLE de celle du niveau brut des deux combattants.

   Ce script est un outil de MESURE dédié (comme tools/monte-carlo.js et
   tools/monte-carlo-combat.js) — il ne modifie aucune formule du moteur.
   Il simule, pour chacune des 64 paires ORDONNÉES de styles (8x8, y
   compris les paires même style/même style), un nombre fixe de combats
   (>= 2 000, cf. §1.2) et calcule un intervalle de confiance à 95% (Wilson
   score interval, plus fiable que l'approximation normale près de 0%/100%)
   par cellule — sans IC, une case à 55% sur 40 combats et une case à 55%
   sur 4 000 combats sont indiscernables alors qu'une seule mérite d'être
   lue comme un vrai écart de style.

   Deux matrices sont produites :
   1. RAW    — les deux combattants sont générés "naturellement" (niveau
      gaussien standard, sans contrôle), comme le fait déjà
      monte-carlo-combat.js. Reflète l'écart de style TEL QUE le jeu la
      donne aujourd'hui, mélangé à l'écart de niveau.
   2. EQUAL-OVERALL (référence L4, §1.3) — les deux combattants sont
      générés avec un OVR (fonction overall(), déjà utilisée par l'UI et
      les tests) égal à ±2 près, par recherche itérative sur le paramètre
      `level` de makeFighter(). C'est cette matrice qui isolera la
      contribution du style une fois que L4 lui donnera une vraie
      politique de combat.

   Usage : node tools/matchup-matrix.js [seed] [fightsPerCell]
   Défauts : seed = Date.now(), fightsPerCell = 2000 (plancher du §1.2). ==== */

const { newGameWindow } = require('../tests/helpers/loadGame');

const win = newGameWindow({ runMain: true });

const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
const FIGHTS_PER_CELL = process.argv[3] ? Number(process.argv[3]) : 2000;
win.setSeed(seed);

/* ==== [ANCRE: P7_L1_WINDOW_CONST_BRIDGE] — comme dans monte-carlo-combat.js :
   STYLE_KEYS/DIVISIONS sont des `const` de haut niveau d'engine.js, jamais
   des propriétés de `window` (seuls les `function`/`var` de haut niveau le
   deviennent en script classique — cf. commentaire ANCRE
   TESTS_LOADGAME_G_BRIDGE de loadGame.js). `win.STYLE_KEYS`/`win.DIVISIONS`
   valent donc toujours `undefined` ici ; les valeurs de repli reprennent
   exactement celles déjà utilisées par monte-carlo-combat.js. ==== */
const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
const DIVS_H = (win.DIVISIONS && win.DIVISIONS.H) ? win.DIVISIONS.H.map(d => d.id) : ['H-light'];
const DIVS_F = (win.DIVISIONS && win.DIVISIONS.F) ? win.DIVISIONS.F.map(d => d.id) : ['F-straw'];
const ALL_DIVS = [...DIVS_H, ...DIVS_F];
/* ==== [FIN ANCRE] ==== */
const pick = a => a[Math.floor(win.rnd() * a.length)];

console.log("===============================================================================");
console.log("     CAGE LEGACY — MATRICE DE MATCHUPS STYLE x STYLE (LOT 1/P7 §1.2-1.3)        ");
console.log("===============================================================================\n");
console.log(`Seed utilisée : ${seed}`);
console.log(`Combats par cellule : ${FIGHTS_PER_CELL} (8x8 = ${STYLES.length * STYLES.length} cellules, ${STYLES.length * STYLES.length * FIGHTS_PER_CELL} combats par matrice)\n`);

/** Wilson score interval à 95% pour une proportion observée (wins/n).
 * Préféré à l'approximation normale (p ± 1.96*sqrt(p(1-p)/n)) : reste
 * borné dans [0,1] et ne dégénère pas près de 0%/100%, deux zones que
 * l'on rencontre forcément sur une matrice de matchups très asymétriques.
 * @param {number} wins @param {number} n @returns {{p:number, lo:number, hi:number}} */
function wilson95(wins, n) {
  if (!n) return { p: 0, lo: 0, hi: 0 };
  const z = 1.959963985;
  const phat = wins / n;
  const denom = 1 + (z * z) / n;
  const center = phat + (z * z) / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat)) / n + (z * z) / (4 * n * n));
  return { p: phat, lo: Math.max(0, (center - margin) / denom), hi: Math.min(1, (center + margin) / denom) };
}

/* ==== [ANCRE: P7_L1_EQUAL_OVERALL] — LOT 1/P7 §1.3 : recherche itérative
   d'un fighter dont overall() tombe à ±tol du overall cible, en ajustant
   le paramètre `level` de makeFighter (le seul levier direct sur le
   niveau moyen des attributs, cf. baseAttrs()). Le biais de style (STYLES[].b)
   décale l'overall obtenu à level égal différemment par style — d'où la
   recherche plutôt qu'un simple `level=targetOv` fixe. Recherche bornée
   (maxTries) : si la tolérance n'est jamais atteinte (styles aux biais
   extrêmes, cible en bord de plage), le meilleur candidat rencontré est
   conservé plutôt que d'échouer — mieux vaut un léger écart d'overall
   mesuré et documenté qu'un plantage du harnais. ==== */
function makeFighterNearOverall(style, div, gender, targetOv, tol) {
  let level = targetOv;
  let best = null, bestDiff = Infinity;
  for (let tries = 0; tries < 20; tries++) {
    const f = win.makeFighter({ style, div, gender, level });
    const ov = win.overall(f);
    const diff = Math.abs(ov - targetOv);
    if (diff < bestDiff) { best = f; bestDiff = diff; }
    if (diff <= tol) return { f, ov, diff };
    level = Math.max(15, Math.min(95, level + (targetOv - ov)));
  }
  return { f: best, ov: win.overall(best), diff: bestDiff };
}
/* ==== [FIN ANCRE] ==== */

/** Simule FIGHTS_PER_CELL combats pour chaque paire ordonnée de styles et
 * retourne la matrice brute {wins, fights} — `fighterFactory(styleA,styleB,div,gender)`
 * fournit les deux combattants, ce qui permet de réutiliser cette boucle
 * pour la matrice RAW et la matrice EQUAL-OVERALL sans dupliquer la
 * logique de comptage/CI. */
function buildMatrix(label, fighterFactory) {
  console.log(`>>> Construction de la matrice "${label}" (${STYLES.length * STYLES.length * FIGHTS_PER_CELL} combats)...`);
  const t0 = Date.now();
  const cells = {};
  STYLES.forEach(sA => {
    cells[sA] = {};
    STYLES.forEach(sB => { cells[sA][sB] = { fights: 0, wins: 0 }; });
  });
  let overallDiffMax = 0, overallDiffSum = 0, overallDiffCount = 0;

  for (const sA of STYLES) {
    for (const sB of STYLES) {
      const cell = cells[sA][sB];
      for (let i = 0; i < FIGHTS_PER_CELL; i++) {
        const div = pick(ALL_DIVS);
        const gender = div.startsWith('F-') ? 'F' : 'H';
        const rounds = (i % 5 === 0) ? 5 : 3;
        const { A, B, ovDiff } = fighterFactory(sA, sB, div, gender);
        if (ovDiff != null) { overallDiffSum += ovDiff; overallDiffCount++; overallDiffMax = Math.max(overallDiffMax, ovDiff); }
        const res = win.simulateFight(A, B, rounds);
        cell.fights++;
        if (res.winner === 'A') cell.wins++;
      }
    }
  }
  const t1 = Date.now();
  console.log(`✓ Matrice "${label}" terminée en ${((t1 - t0) / 1000).toFixed(1)}s.`);
  if (overallDiffCount) {
    console.log(`  Écart d'overall entre les deux combattants : moyenne ${(overallDiffSum / overallDiffCount).toFixed(2)}, max ${overallDiffMax} (cible : <= 2)\n`);
  } else {
    console.log("");
  }
  return cells;
}

/** Imprime la matrice sous forme de grille de taux de victoire (ligne =
 * style au numérateur, colonne = adversaire), puis un tableau détaillé
 * fights/wins/IC95% par cellule. */
function printMatrix(label, cells) {
  console.log(`--- ${label} : GRILLE DES TAUX DE VICTOIRE (ligne vs colonne) ---`);
  const header = '             ' + STYLES.map(s => s.slice(0, 8).padStart(9)).join('');
  console.log(header);
  STYLES.forEach(sA => {
    const row = STYLES.map(sB => {
      const c = cells[sA][sB];
      const pct = c.fights ? (c.wins / c.fights) * 100 : 0;
      return `${pct.toFixed(1)}%`.padStart(9);
    }).join('');
    console.log(sA.padEnd(13) + row);
  });

  console.log(`\n--- ${label} : DÉTAIL PAR CELLULE (effectif + IC95% Wilson) ---`);
  STYLES.forEach(sA => {
    STYLES.forEach(sB => {
      const c = cells[sA][sB];
      const { p, lo, hi } = wilson95(c.wins, c.fights);
      console.log(`  ${sA.padEnd(11)} vs ${sB.padEnd(11)} : ${(p * 100).toFixed(1)}% [${(lo * 100).toFixed(1)}–${(hi * 100).toFixed(1)}] (n=${c.fights}, ${c.wins}V)`);
    });
  });
  console.log("");
}

/** Moyenne des taux de victoire par style (toutes cellules confondues,
 * pondérée par effectif — ici constant par cellule donc équivalent à une
 * moyenne simple des 8 cellules de la ligne) — sert de garde-fou
 * d'équilibrage (référence directe pour L4 §4.4 : bande 47-53%). */
function printStyleAverages(label, cells) {
  console.log(`--- ${label} : MOYENNE PAR STYLE (TOUS ADVERSAIRES CONFONDUS) ---`);
  STYLES.forEach(sA => {
    let wins = 0, fights = 0;
    STYLES.forEach(sB => { wins += cells[sA][sB].wins; fights += cells[sA][sB].fights; });
    console.log(`  ${sA.padEnd(12)} : ${((wins / fights) * 100).toFixed(1)}% (sur ${fights} combats)`);
  });
  console.log("");
}

/* =============================================================================
   MATRICE 1 : RAW (niveau naturel, non contrôlé)
   ============================================================================= */
const rawCells = buildMatrix('RAW (niveau non contrôlé)', (sA, sB, div, gender) => {
  const A = win.makeFighter({ div, gender, style: sA });
  const B = win.makeFighter({ div, gender, style: sB });
  return { A, B, ovDiff: null };
});

/* =============================================================================
   MATRICE 2 : EQUAL-OVERALL ±2 (référence L4)
   ============================================================================= */
const equalCells = buildMatrix('EQUAL-OVERALL ±2 (référence L4)', (sA, sB, div, gender) => {
  const targetOv = Math.round(40 + win.rnd() * 40); // 40-80, plage réaliste (cf. pic d'overall moyen ~70 en fin de carrière)
  const { f: A, ov: ovA } = makeFighterNearOverall(sA, div, gender, targetOv, 2);
  const { f: B, ov: ovB } = makeFighterNearOverall(sB, div, gender, ovA, 2);
  return { A, B, ovDiff: Math.abs(ovA - ovB) };
});

console.log("===============================================================================");
console.log("                                  RAPPORT                                       ");
console.log("===============================================================================\n");
printMatrix('MATRICE RAW', rawCells);
printStyleAverages('MATRICE RAW', rawCells);
printMatrix('MATRICE EQUAL-OVERALL', equalCells);
printStyleAverages('MATRICE EQUAL-OVERALL', equalCells);
