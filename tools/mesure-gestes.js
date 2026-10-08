"use strict";
/* CAGE LEGACY — tools/mesure-gestes.js
   Brief des corrections du 08/10/2026, lot 6 : compte les gestes de finition du moteur sur au moins 500 finitions (KO/TKO et soumissions), à graine fixe.
   Usage : node tools/mesure-gestes.js [graine] [finitions] [--out chemin.md]
   Écrit le tableau dans tools/reports/LOT-6-GESTES-DE-FINITION.md par défaut ; passer --out vers un fichier de travail pour ne pas écraser le rapport. */
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('../tests/helpers/loadGame');
const args = process.argv.slice(2).filter((a, i, l) => !a.startsWith('--') && l[i - 1] !== '--out');
const iOut = process.argv.indexOf('--out');
const out = iOut >= 0 ? process.argv[iOut + 1] : path.join(__dirname, 'reports', 'LOT-6-GESTES-DE-FINITION.md');
const seed = args[0] ? Number(args[0]) : 20261008;
const CIBLE = args[1] ? Number(args[1]) : 600;
const win = newGameWindow({ runMain: true });
win.setSeed(seed);
const pick = a => a[Math.floor(win.rnd() * a.length)];
const STYLES = win.eval('STYLE_KEYS');
const DIV = win.eval('DIVISIONS');
const DIVS = [...DIV.H.map(d => d.id), ...DIV.F.map(d => d.id)];
const ko = {}, sub = {};
let nKO = 0, nSub = 0, combats = 0;
while (nKO + nSub < CIBLE && combats < CIBLE * 12) {
  const sa = pick(STYLES), sb = pick(STYLES), div = pick(DIVS), gender = div.startsWith('F-') ? 'F' : 'H';
  const A = win.makeFighter({ div, gender, style: sa }), B = win.makeFighter({ div, gender, style: sb });
  const r = win.simulateFight(A, B, combats % 5 === 0 ? 5 : 3);
  combats++;
  const nom = r.moveName;
  if (!nom) continue;
  if (win.isKOMethod(r.method)) { ko[nom] = (ko[nom] || 0) + 1; nKO++; }
  else if (r.method.startsWith('Soum')) { sub[nom] = (sub[nom] || 0) + 1; nSub++; }
}
const tab = (titre, o, n) => `### ${titre} (${n})\n\n| Geste | Finitions | Part |\n|---|---|---|\n` +
  Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} | ${(100 * v / n).toFixed(1)} % |`).join('\n') + '\n';
const md = `# Gestes de finition du moteur (corrections du 08/10/2026, lot 6)\n\nMesure : ${combats} combats simulés à graine ${seed}, tous styles et toutes catégories, ${nKO + nSub} finitions (${nKO} KO/TKO, ${nSub} soumissions). Outil : \`tools/mesure-gestes.js\`.\n\n` +
  tab('KO et arrêts', ko, nKO) + '\n' + tab('Soumissions', sub, nSub);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(md);
