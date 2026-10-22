"use strict";
/* CAGE LEGACY — tools/mesure-finitions-jeu.js
   Monde lot 25 (audit du 16/10, D7 à D9) : la façon dont les combats FINISSENT dans le jeu réel, pas dans un échantillon aléatoire. Le passé d'une partie neuve
   (mgmtPasseGenerer) simule des soirées avec les vrais combattants du management, leurs vrais écarts de niveau et leur vrai calendrier ; on lit m.hist.
   Usage : node tools/mesure-finitions-jeu.js [soirées=40] [graine1,graine2,...] [--json]
   Sortie : part de KO/TKO, de soumissions, d'arrêts médicaux, de décisions, de combats en 5 rounds et de blessures par combat, sur tous les combats lus. */
const { newGameWindow } = require('../tests/helpers/loadGame');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const json = process.argv.includes('--json');
const soirees = args[0] ? Number(args[0]) : 40;
const graines = (args[1] ? args[1].split(',') : ['20261008', '777', '4242']).map(Number);

const T = { n: 0, ko: 0, sub: 0, stop: 0, dec: 0, nul: 0, r5: 0, inj: 0 };
for (const g of graines) {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${g}); mgmtPasseGenerer('split',{soirees:${soirees}});`);
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const m=G.mgmt, h=m.hist, c={n:h.length,ko:0,sub:0,stop:0,dec:0,nul:0,r5:0};
    for(const t of h){ if(t.family==='ko')c.ko++; else if(t.family==='sub')c.sub++; else if(t.family==='stop')c.stop++; else if(t.family==='dec')c.dec++; else c.nul++; if(t.rounds===5)c.r5++; }
    c.inj=(m.facts||[]).filter(f=>f.k==='injury').length;
    return c;})())`));
  for (const k of Object.keys(T)) T[k] += r[k];
}
const pc = x => Math.round(1000 * x / T.n) / 10;
const res = { combats: T.n, ko: pc(T.ko), soumissions: pc(T.sub), arretsMedicaux: pc(T.stop), decisions: pc(T.dec), nuls: pc(T.nul), finitions: pc(T.ko + T.sub + T.stop), cinqRounds: pc(T.r5), blessuresParCombat: Math.round(100 * T.inj / T.n) / 100, soirees, graines };
if (json) console.log(JSON.stringify(res));
else {
  console.log(`Combats lus : ${res.combats} (${graines.length} graines, ${soirees} soirées de passé chacune)`);
  console.log(`KO/TKO ${res.ko} % · soumissions ${res.soumissions} % · arrêts médicaux ${res.arretsMedicaux} % · décisions ${res.decisions} % · nuls ${res.nuls} %`);
  console.log(`Finitions en tout ${res.finitions} % · combats en 5 rounds ${res.cinqRounds} % · blessures par combat ${res.blessuresParCombat}`);
}
process.exit(0);
