"use strict";
/* CAGE LEGACY — tools/mesure-recalibrage.js
   Brief du 06/10/2026, lot 3 : les mesures du tableau du recalibrage, sur N combats à graine fixe (12 000 par défaut), sans les audits lourds de
   monte-carlo-combat.js. Usage : node tools/mesure-recalibrage.js [graine] [combats] [--json]
   Mesures :
   - issues globales (KO/TKO, soumissions, décisions, poids lourds finis) ;
   - décisions partagées ou majoritaires, en part des décisions ;
   - poids paille femmes : KO/TKO et décisions ;
   - lutteurs (style wrestler) : temps de contrôle et amenées par combat de 3 rounds, victoires par décision contre KO ;
   - précision des frappes significatives et coups touchés par minute. */
const { newGameWindow } = require('../tests/helpers/loadGame');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const json = process.argv.includes('--json');
const seed = args[0] ? Number(args[0]) : 20261006;
const N = args[1] ? Number(args[1]) : 12000;
const win = newGameWindow({ runMain: true });
win.setSeed(seed);
const pick = a => a[Math.floor(win.rnd() * a.length)];
const STYLES = win.eval('STYLE_KEYS');
const DIV = win.eval('DIVISIONS');
const DIVS = [...DIV.H.map(d => d.id), ...DIV.F.map(d => d.id)];
const heavy = DIV.H[DIV.H.length - 1].id;

const M = { n: 0, ko: 0, sub: 0, dec: 0, other: 0, partMaj: 0, decTotal: 0,
  heavyN: 0, heavyFin: 0, strawN: 0, strawKO: 0, strawDec: 0, strawSub: 0,
  wrestlerSides: 0, wrCtrl: 0, wrTd: 0, wrTdAtt: 0, wrWinDec: 0, wrWinKO: 0, wrWinSub: 0, wrWins: 0,
  femN: 0, femKO: 0, femDec: 0, maleN: 0, maleKO: 0, maleDec: 0,
  sig: 0, sigAtt: 0, sec: 0, close: 0, closeSplit: 0, muayCtrl: 0, muaySides: 0 };
for (let i = 0; i < N; i++) {
  const sa = pick(STYLES), sb = pick(STYLES), div = pick(DIVS), gender = div.startsWith('F-') ? 'F' : 'H';
  const rounds = (i % 5 === 0) ? 5 : 3;
  const A = win.makeFighter({ div, gender, style: sa }), B = win.makeFighter({ div, gender, style: sb });
  const r = win.simulateFight(A, B, rounds);
  const m = r.method, isKO = win.isKOMethod(m), isSub = m.startsWith('Soum'), isDec = !r.round && /^(Décision|Nul)/.test(m);
  M.n++;
  if (isKO) M.ko++; else if (isSub) M.sub++; else if (isDec) M.dec++; else M.other++;
  if (isDec) { M.decTotal++; if (/partagée|majoritaire/.test(m)) M.partMaj++; }
  if (div === heavy) { M.heavyN++; if (isKO || isSub) M.heavyFin++; }
  if (div === 'F-straw') { M.strawN++; if (isKO) M.strawKO++; else if (isSub) M.strawSub++; else if (isDec) M.strawDec++; }
  if (gender === 'F') { M.femN++; if (isKO) M.femKO++; else if (isDec) M.femDec++; } else { M.maleN++; if (isKO) M.maleKO++; else if (isDec) M.maleDec++; }
  for (const side of ['A', 'B']) {
    const s = r.stats[side], st = side === 'A' ? sa : sb;
    M.sig += s.sig; M.sigAtt += s.sigAtt;
    if (rounds === 3 && !r.round) {
      M.sec += 900;
    }
    if (st === 'wrestler' && rounds === 3) {
      M.wrestlerSides++; M.wrCtrl += s.ctrlSec; M.wrTd += s.td; M.wrTdAtt += s.tdAtt;
      if (r.winner === side) { M.wrWins++; if (isKO) M.wrWinKO++; else if (isSub) M.wrWinSub++; else M.wrWinDec++; }
    }
    if (st === 'muayThai' && rounds === 3) { M.muaySides++; M.muayCtrl += s.ctrlSec; }
  }
}
const pc = (a, b) => b ? +(100 * a / b).toFixed(1) : 0;
const out = {
  seed, n: M.n,
  issues: { ko: pc(M.ko, M.n), sub: pc(M.sub, M.n), dec: pc(M.dec, M.n), autres: pc(M.other, M.n), lourdsFinis: pc(M.heavyFin, M.heavyN) },
  partagees: pc(M.partMaj, M.decTotal),
  paille: { ko: pc(M.strawKO, M.strawN), dec: pc(M.strawDec, M.strawN), sub: pc(M.strawSub, M.strawN), n: M.strawN },
  femmes: { ko: pc(M.femKO, M.femN), dec: pc(M.femDec, M.femN) }, hommes: { ko: pc(M.maleKO, M.maleN), dec: pc(M.maleDec, M.maleN) },
  lutteur: { controleSec: +(M.wrCtrl / M.wrestlerSides).toFixed(1), amenees: +(M.wrTd / M.wrestlerSides).toFixed(2), tentees: +(M.wrTdAtt / M.wrestlerSides).toFixed(2),
    victoires: M.wrWins, parDecision: M.wrWinDec, parKO: M.wrWinKO, parSoumission: M.wrWinSub },
  muayThaiControleSec: +(M.muayCtrl / M.muaySides).toFixed(1),
  precision: pc(M.sig, M.sigAtt),
};
console.log(json ? JSON.stringify(out) : JSON.stringify(out, null, 1));
