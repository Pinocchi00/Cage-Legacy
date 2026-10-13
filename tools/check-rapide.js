"use strict";
/* CAGE LEGACY — tools/check-rapide.js
   Outillage du brief « Un monde qui a vécu » (10/10/2026) : la vérification d'une TRANCHE.
   Même chose que `npm run check` (lint, lint:content, tests), moins les fichiers de test les plus longs — ceux qui
   simulent des dizaines de soirées, et trois autres peu concernés par ce brief. Mesure du 10/10/2026 sur 97 fichiers :
   ces sept-là cumulent 1 585 s sur 3 249 s, et le plus long (364 s) fixe à lui seul la durée de la suite.
   La liste des tests reste celle de package.json (script `test`) : rien n'est recopié ici.
   `npm run check` complet reste obligatoire au bilan de lot et avant toute fusion.
   Usage : node tools/check-rapide.js [tests/unLent.test.js …]   — un fichier nommé en argument est remis dans la suite
   (à faire quand la tranche touche ce que ce test couvre). */
const { spawnSync } = require('child_process');
const path = require('path');
const racine = path.join(__dirname, '..');
const LENTS = ['tests/mgmtCorrectionsLot12.test.js', 'tests/mgmtSoireeShow.test.js', 'tests/mgmtSuivi.test.js', 'tests/mgmtSalles.test.js',
  'tests/nomsApostrophe.test.js', 'tests/moteurRecalibrage.test.js', 'tests/mgmtAnimations.test.js',
  /* Monde lot 1 T1 : la preuve (test 6 — vingt soirées avec et sans mémo, 171 s mesurée le 10/10)
     et l'exactitude (test 2 — 3 graines × 40 soirées, 218 s) dépassent 60 s ; lancers manuels ou check complet. */
  'tests/mgmtClassementsMemoire.test.js',
  /* Monde lot 1 T2 : le test 5 (quatre soirées × 3 parties, état sérialisé à chaque soirée) dépasse 60 s (63 s mesurée le 10/10). */
  'tests/mgmtPredecesseur.test.js',
  /* Monde lot 1 T3 : les six ans complets (62 soirées, 30 à 90 s par organisation, trois organisations). */
  'tests/mgmtPasseSixAns.test.js',
  /* Monde lot 1 T4 bis : les recrues du passé réduit rendent le fichier plus long (85 s mesurées le 10/10) ; au-delà de 20 s il est lancé à part. */
  'tests/mgmtPasse.test.js',
  /* Monde lot 1 T6 : six ans complets pour tout le fichier (25 s de génération). */
   'tests/mgmtPasseT6.test.js',
   /* ==== [ANCRE: MONDE_LOT5_T1_MATRICE_LENTE] — Monde lot 5 T1 ==== */
   /* 160 créations à 62 soirées : acceptation T1 à part, et check complet au bilan du lot. */
    'tests/mgmtCarteHeriteeSixAns.test.js',
    /* ==== [ANCRE: MONDE_LOT5_T2_MATRICE_LENTE] — Monde lot 5 T2 ==== */
    'tests/mgmtPromessesHeriteesSixAns.test.js'];
const gardes = process.argv.slice(2).map(f => f.replace(/\\/g, '/'));
const tous = require(path.join(racine, 'package.json')).scripts.test.replace(/^node --test\s+/, '').split(/\s+/).filter(Boolean);
const ecartes = LENTS.filter(f => tous.includes(f) && !gardes.includes(f));
const fichiers = tous.filter(f => !ecartes.includes(f));
const lance = (cmd, args) => spawnSync(cmd, args, { cwd: racine, stdio: 'inherit', shell: process.platform === 'win32' }).status;
for (const etape of ['lint', 'lint:content']) {
  const code = lance('npm', ['run', etape]);
  if (code !== 0) { console.log('CHECK RAPIDE : ROUGE (' + etape + ')'); process.exit(code || 1); }
}
const code = lance(process.execPath.includes(' ') ? '"' + process.execPath + '"' : process.execPath, ['--test', ...fichiers]);
console.log('CHECK RAPIDE : ' + (code === 0 ? 'VERT' : 'ROUGE') + ' — ' + fichiers.length + ' fichiers de test lancés, ' + ecartes.length + ' écartés (' + ecartes.map(f => path.basename(f)).join(', ') + '). Le check complet reste à faire au bilan de lot.');
process.exit(code || 0);
