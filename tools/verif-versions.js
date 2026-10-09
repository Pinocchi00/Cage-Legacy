"use strict";
/* CAGE LEGACY — tools/verif-versions.js
   Outillage du brief « Un monde qui a vécu » (09/10/2026) : l'audit des versions de cache avant chaque relecture et chaque PR.
   Tout fichier .js ou .css chargé par index.html et modifié depuis la base doit avoir monté son ?v= (sinon un navigateur qui a déjà
   chargé le jeu garde l'ancien fichier) ; tout nouveau fichier .js à la racine ou dans state/ doit être chargé par index.html ;
   index.html reste en fins de ligne LF.
   Usage : node tools/verif-versions.js [base]   (base : main par défaut). Code de sortie 1 s'il y a un écart. */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const racine = path.join(__dirname, '..');
const base = process.argv[2] || 'main';
const git = c => execSync('git ' + c, { cwd: racine, encoding: 'utf8' });
const lignes = s => s.split('\n').map(l => l.trim()).filter(Boolean);
const versions = html => {
  const v = {};
  for (const m of html.matchAll(/(?:src|href)="([^"?]+)\?v=([^"]+)"/g)) v[m[1]] = m[2];
  return v;
};
const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
const ici = versions(html);
const avant = versions(git('show ' + base + ':index.html'));
const changes = new Set([
  ...lignes(git('diff --name-only ' + base + '...HEAD')),
  ...lignes(git('diff --name-only')),
  ...lignes(git('diff --name-only --cached')),
  ...lignes(git('ls-files --others --exclude-standard'))
]);
const neufs = new Set([
  ...lignes(git('diff --name-only --diff-filter=A ' + base + '...HEAD')),
  ...lignes(git('ls-files --others --exclude-standard'))
]);
const ecarts = [];
for (const f of changes) {
  if (!/\.(js|css)$/.test(f) || !fs.existsSync(path.join(racine, f))) continue;
  if (ici[f] !== undefined) {
    if (avant[f] !== undefined && avant[f] === ici[f]) ecarts.push(f + ' : modifié, mais ?v=' + ici[f] + ' est la version de ' + base);
  } else if (neufs.has(f) && /^(state\/)?[^/]+\.js$/.test(f) && !/\.config\.js$/.test(f) && f !== 'sw.js') {
    ecarts.push(f + " : nouveau fichier du jeu, absent d'index.html");
  }
}
/* core.autocrlf convertit la copie de travail sous Windows : c'est la version indexée, celle qui sera commitée, qui doit rester en LF. */
if (git('show :index.html').includes('\r')) ecarts.push('index.html : fins de ligne CRLF dans la version indexée (attendu : LF)');
if (ecarts.length) {
  console.log('VERSIONS : ' + ecarts.length + ' écart(s) par rapport à ' + base);
  for (const e of ecarts) console.log('- ' + e);
  console.log('Correction : node tools/_bump.js <fichier> pour chaque fichier modifié.');
  process.exitCode = 1;
} else {
  console.log('VERSIONS : aucun écart par rapport à ' + base + ' (' + changes.size + ' fichier(s) changé(s) examiné(s)).');
}
