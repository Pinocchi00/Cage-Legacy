'use strict';
/* Construit les planches dans out/project/ (chemins du canevas) et un index local de prévisualisation. */
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out');
const PROJ = path.join(OUT, 'project');
fs.mkdirSync(PROJ, { recursive: true });
fs.mkdirSync(path.join(OUT, '_blob'), { recursive: true });
const AF = path.join(__dirname, '..', 'artifact-files', 'c7dfb69f-2471-4281-bbf5-11b934b9e2e4');
for (const id of ['318791530b7ad80e04db5f5d4e771a0b', 'f0735629a6f7ece03b1dd472f1279f76']) {
  const src = path.join(AF, id + '.jpg'), dst = path.join(OUT, '_blob', id);
  if (fs.existsSync(src) && !fs.existsSync(dst)) fs.copyFileSync(src, dst);
}
const rt = path.join(AF, 'artifact-type', 'dc-runtime.js');
if (fs.existsSync(rt)) fs.copyFileSync(rt, path.join(PROJ, 'support.js'));

const groupes = ['vague1', 'vague2', 'vague3', 'vague4'].filter(g => fs.existsSync(path.join(__dirname, g + '.js')));
const ecrits = [];
for (const g of groupes) {
  delete require.cache[require.resolve('./' + g + '.js')];
  const mod = require('./' + g + '.js');
  for (const [nom, fn] of Object.entries(mod)) {
    const fichier = 'Uni' + nom[0].toUpperCase() + nom.slice(1) + '.dc.html';
    fs.writeFileSync(path.join(PROJ, fichier), fn(), 'utf8');
    ecrits.push(fichier);
  }
}
fs.writeFileSync(path.join(OUT, 'liste.json'), JSON.stringify(ecrits, null, 1));
console.log(ecrits.join('\n'));
