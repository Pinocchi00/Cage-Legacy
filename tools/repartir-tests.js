"use strict";
/* CAGE LEGACY — tools/repartir-tests.js
   Outillage de vitesse (22/10/2026) : répartit la liste des tests de package.json (script `test`) en N lots d'une durée à peu près égale, pour que
   `npm run check` tourne en parallèle sur plusieurs machines (GitHub Actions, voir .github/workflows/check.yml) ou plusieurs processus.
   Pourquoi pas `node --test --test-shard=i/N` : il coupe la liste en tranches contiguës ; les fichiers les plus longs (six ans de passé, monde vivant)
   se retrouveraient dans le même lot. Ici les fichiers lents connus sont distribués d'abord, un par lot, puis les autres tour à tour.
   Usage : node tools/repartir-tests.js <i> <n>   → écrit sur la sortie les fichiers du lot i (de 1 à n), séparés par des espaces.
           node tools/repartir-tests.js --verifie <n> → vérifie que les n lots réunis sont exactement la liste de package.json (code 0), sinon code 1. */
const path = require('path');
const racine = path.join(__dirname, '..');
const tous = require(path.join(racine, 'package.json')).scripts.test.replace(/^node --test\s+/, '').split(/\s+/).filter(Boolean);
/* Les fichiers lents, du plus long au plus court (mesures du 10/10 et du 22/10/2026 : tools/check-rapide.js) : un par lot, en tête. */
const LENTS = ['tests/mgmtMondeVivant.test.js', 'tests/mgmtPasseSixAns.test.js', 'tests/mgmtClassementsMemoire.test.js', 'tests/mgmtCarteHeriteeSixAns.test.js',
  'tests/mgmtPromessesHeriteesSixAns.test.js', 'tests/mgmtPasseT6.test.js', 'tests/mgmtCorrectionsLot12.test.js', 'tests/mgmtPredecesseur.test.js',
  'tests/mgmtPasse.test.js', 'tests/mgmtStats.test.js', 'tests/mgmtDuoPresentation.test.js', 'tests/mgmtActualites.test.js', 'tests/mgmtSoireeShow.test.js',
  'tests/mgmtSuivi.test.js', 'tests/mgmtSalles.test.js', 'tests/nomsApostrophe.test.js', 'tests/moteurRecalibrage.test.js', 'tests/mgmtAnimations.test.js'];
function repartir(n) {
  const lots = Array.from({ length: n }, () => []);
  const lents = LENTS.filter(f => tous.includes(f));
  const autres = tous.filter(f => !lents.includes(f));
  lents.forEach((f, k) => lots[k % n].push(f));
  autres.forEach((f, k) => lots[(k + lents.length) % n].push(f));
  return lots;
}
const args = process.argv.slice(2);
if (args[0] === '--verifie') {
  const n = Number(args[1]);
  const vus = [].concat(...repartir(n)).sort();
  const ok = vus.length === tous.length && vus.join('|') === tous.slice().sort().join('|');
  console.log(ok ? 'REPARTITION OK : ' + tous.length + ' fichiers en ' + n + ' lots' : 'REPARTITION FAUSSE');
  process.exit(ok ? 0 : 1);
}
const i = Number(args[0]), n = Number(args[1]);
if (!Number.isInteger(i) || !Number.isInteger(n) || i < 1 || i > n) { console.error('usage : node tools/repartir-tests.js <i> <n>'); process.exit(2); }
console.log(repartir(n)[i - 1].join(' '));
