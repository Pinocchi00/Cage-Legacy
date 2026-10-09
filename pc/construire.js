"use strict";
/* Cage Legacy — la construction de la version PC. Brief démo du 09/10/2026, lot 3 T5.
   Usage : node pc/construire.js [--demo]   (ou npm run pc, npm run pc:demo, depuis la racine)
   1. copie dans pc/dist/jeu/ exactement les fichiers que charge index.html (scripts, feuilles, images, polices, icônes), rien d'autre ;
   2. avec --demo, fixe l'interrupteur CL_DEMO (demo-config.js) à true dans la copie, jamais dans le jeu ;
   3. si Electron et son outil d'empaquetage sont installés (npm install dans pc/), produit le dossier Windows prêt à déposer sur Steam.
   Windows d'abord ; Linux et Mac ne sont pas dans ce lot. */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOSSIERS_RESSOURCES = ['images', 'fonts', 'icons'];

/** Les fichiers que charge index.html : scripts et feuilles (balises src et href locales, sans leur ?v=), plus les dossiers de ressources. @returns {string[]} chemins relatifs */
function listerFichiers(racine = RACINE) {
  const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
  const liste = new Set(['index.html']);
  const re = /<(?:script|link)\b[^>]*?\b(?:src|href)="([^"#]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1].split('?')[0];
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) continue;
    liste.add(url);
  }
  for (const d of DOSSIERS_RESSOURCES) {
    const dir = path.join(racine, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (fs.statSync(path.join(dir, f)).isFile()) liste.add(d + '/' + f);
  }
  return [...liste].sort();
}

/** Copie la liste dans `cible`. @returns {number} le nombre de fichiers */
function copier(cible, { demo = false, racine = RACINE } = {}) {
  fs.rmSync(cible, { recursive: true, force: true });
  let n = 0;
  for (const f of listerFichiers(racine)) {
    const src = path.join(racine, f), dst = path.join(cible, f);
    if (!fs.existsSync(src)) throw new Error('fichier manquant : ' + f);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (demo && f === 'demo-config.js') {
      const txt = fs.readFileSync(src, 'utf8');
      if (!/let CL_DEMO=false;/.test(txt)) throw new Error('interrupteur CL_DEMO introuvable');
      fs.writeFileSync(dst, txt.replace('let CL_DEMO=false;', 'let CL_DEMO=true;'));
    } else fs.copyFileSync(src, dst);
    n++;
  }
  return n;
}

function main() {
  const demo = process.argv.includes('--demo');
  const cible = path.join(__dirname, 'dist', 'jeu');
  const n = copier(cible, { demo });
  console.log(n + ' fichiers copiés dans ' + cible + (demo ? ' (démo)' : ''));
  fs.copyFileSync(path.join(__dirname, 'main.js'), path.join(__dirname, 'dist', 'main.js'));
  fs.copyFileSync(path.join(__dirname, 'preload.js'), path.join(__dirname, 'dist', 'preload.js'));
  fs.copyFileSync(path.join(__dirname, 'package.json'), path.join(__dirname, 'dist', 'package.json'));
  let packager = null;
  try { packager = require('@electron/packager'); } catch (e) { /* pas installé */ }
  if (!packager) {
    console.log('Electron et @electron/packager ne sont pas installés : lancez « npm install » dans pc/ puis relancez cette commande pour produire le dossier Windows.');
    return;
  }
  packager({ dir: path.join(__dirname, 'dist'), out: path.join(__dirname, 'sortie'), name: demo ? 'CageLegacyDemo' : 'CageLegacy', platform: 'win32', arch: 'x64', overwrite: true })
    .then(chemins => console.log('Prêt à déposer sur Steam : ' + chemins.join(', ')))
    .catch(e => { console.error(e); process.exitCode = 1; });
}

if (require.main === module) main();
module.exports = { listerFichiers, copier };
