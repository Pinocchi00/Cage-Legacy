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
  'tests/nomsApostrophe.test.js', 'tests/moteurRecalibrage.test.js', 'tests/mgmtAnimations.test.js'];
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
