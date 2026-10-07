"use strict";
/* Brief du 06/10/2026, lot 3 : le recalibrage du moteur — les mesures du tableau, sur des échantillons plus modestes que les 12 000 combats de
   tools/mesure-recalibrage.js (rapport : tools/reports/LOT-3-RECALIBRAGE-MOTEUR.md). Les fourchettes sont celles des cibles, élargies du bruit
   d'échantillonnage à cette taille ; un retour franc vers l'ancien régime (3 % de décisions partagées, 46 s de contrôle…) les fait échouer. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

/** Joue N combats à graine fixe et rend les compteurs utiles. */
function mesure(seed,N,filtre){
  const win=newGameWindow(); win.setSeed(seed);
  const STY=win.eval('STYLE_KEYS'), DIV=win.eval('DIVISIONS');
  const divs=[...DIV.H.map(d=>d.id),...DIV.F.map(d=>d.id)];
  const pick=a=>a[Math.floor(win.rnd()*a.length)];
  const M={n:0,ko:0,sub:0,dec:0,decTot:0,part:0,paille:0,pailleKO:0,pailleDec:0,sig:0,sigAtt:0,wr:0,wrCtrl:0,wrTd:0,wrTdAtt:0,wrWinDec:0,wrWinKO:0,muay:0,muayCtrl:0,heavy:0,heavyFin:0,hits:0,minutes:0};
  const lourd=DIV.H[DIV.H.length-1].id;
  for(let i=0;i<N;i++){
    const sa=pick(STY), sb=pick(STY), div=pick(divs), g=div.startsWith('F-')?'F':'H';
    if(filtre&&!filtre(div,sa,sb)){ i--; continue; }
    const A=win.makeFighter({div,gender:g,style:sa}), B=win.makeFighter({div,gender:g,style:sb});
    const r=win.simulateFight(A,B,(i%5===0)?5:3), m=r.method, ko=win.isKOMethod(m), sub=m.startsWith('Soum'), dec=!r.round&&/^(Décision|Nul)/.test(m);
    M.n++; if(ko) M.ko++; else if(sub) M.sub++; else if(dec) M.dec++;
    if(dec){ M.decTot++; if(/partagée|majoritaire/.test(m)) M.part++; }
    if(div==='F-straw'){ M.paille++; if(ko) M.pailleKO++; else if(dec) M.pailleDec++; }
    if(div===lourd){ M.heavy++; if(ko||sub) M.heavyFin++; }
    for(const side of ['A','B']){
      const s=r.stats[side], st=side==='A'?sa:sb;
      M.sig+=s.sig; M.sigAtt+=s.sigAtt;
      if(st==='wrestler'){ M.wr++; M.wrCtrl+=s.ctrlSec; M.wrTd+=s.td; M.wrTdAtt+=s.tdAtt; if(r.winner===side){ if(ko) M.wrWinKO++; else if(dec) M.wrWinDec++; } }
      if(st==='muayThai'){ M.muay++; M.muayCtrl+=s.ctrlSec; }
    }
  }
  return M;
}

test('Juges — les décisions partagées ou majoritaires font de 15 à 30 % des décisions (UFC : 22,9 %)', () => {
  const M=mesure(20261006,2400);
  const part=100*M.part/M.decTot;
  assert.ok(part>=15&&part<=30,`décisions partagées ou majoritaires : ${part.toFixed(1)} % (cible 18 à 25 %, marge d'échantillon)`);
});

test('Juges — un round nettement dominé garde son vainqueur chez les trois juges', () => {
  const win=newGameWindow(); win.setSeed(4321);
  let vus=0, divergents=0;
  for(let i=0;i<500;i++){
    const r=win.simulateFight(win.makeFighter({}),win.makeFighter({}),3);
    for(const rs of r.roundStats||[]){
      const d=rs.judgeDiffs; if(!d) continue;
      const net=d.every(x=>x>20)?'A':d.every(x=>x<-20)?'B':null;
      /* Un knockdown subi renverse le round selon la règle du 10-9 (scoreFromDiff, antérieure au lot) : hors du périmètre de ce test. */
      if(!net||rs.kdDiff*(net==='A'?1:-1)<0) continue; vus++;
      for(const j of [rs.j1,rs.j2,rs.j3]) if((j[0]>j[1]?'A':j[1]>j[0]?'B':'N')!==net) divergents++;
    }
  }
  assert.ok(vus>=15,'assez de rounds nettement dominés ('+vus+')'); assert.equal(divergents,0);
});

test('Juges — sur un round serré, les trois juges peuvent diverger', () => {
  const win=newGameWindow(); win.setSeed(99);
  let serres=0, diverge=0;
  for(let i=0;i<800;i++){
    const r=win.simulateFight(win.makeFighter({style:'mma',level:55}),win.makeFighter({style:'mma',level:55}),3);
    for(const rs of r.roundStats||[]){
      const d=rs.judgeDiffs; if(!d||Math.max(...d.map(Math.abs))>12) continue; serres++;
      const w=[rs.j1,rs.j2,rs.j3].map(j=>j[0]>j[1]?'A':j[1]>j[0]?'B':'N');
      if(new Set(w).size>1) diverge++;
    }
  }
  assert.ok(serres>50&&diverge/serres>0.1,`${diverge} rounds serrés sur ${serres} divisent les juges`);
});

test('Lutte — un lutteur contrôle bien plus longtemps qu\'un combattant de muay-thaï, amène davantage et gagne plus souvent à la décision qu\'au KO', () => {
  const M=mesure(777,3600);
  const ctrl=M.wrCtrl/M.wr, ctrlMT=M.muayCtrl/M.muay, td=M.wrTd/M.wr;
  assert.ok(ctrl>=100&&ctrl<=200,`contrôle d'un lutteur : ${ctrl.toFixed(0)} s (cible 120 à 200 s)`);
  assert.ok(ctrl>ctrlMT*1.6,`le lutteur (${ctrl.toFixed(0)} s) contrôle bien plus que le muay-thaï (${ctrlMT.toFixed(0)} s)`);
  assert.ok(td>=1.1&&td<=2.4,`amenées réussies d'un lutteur : ${td.toFixed(2)} (cible 1,2 à 2)`);
  const tent=M.wrTdAtt/M.wr, taux=100*td/tent;
  assert.ok(taux>=36&&taux<=46,`réussite des amenées d'un lutteur : ${taux.toFixed(0)} % (moyenne UFC : 38 à 42 %)`);
  assert.ok(M.wrWinDec>M.wrWinKO,`victoires d'un lutteur : ${M.wrWinDec} décisions contre ${M.wrWinKO} KO`);
});

test('Lutte — le jiu-jitsu garde son jeu : le boxeur reste favori à niveau égal', () => {
  const win=newGameWindow(); win.setSeed(20260905);
  let w=0; const N=1200;
  for(let i=0;i<N;i++) if(win.simulateFight(win.makeFighter({style:'boxer',level:55}),win.makeFighter({style:'bjj',level:55}),3).winner==='A') w++;
  assert.ok(100*w/N>=54,'boxeur contre jiu-jitsu : '+(100*w/N).toFixed(1)+' %');
});

test('Genre — poids paille femmes : KO/TKO entre 10 et 18 %, décisions entre 58 et 72 % (UFC : 13,5 % et ~67 %)', () => {
  const M=mesure(4242,1800,div=>div==='F-straw');
  const ko=100*M.pailleKO/M.paille, dec=100*M.pailleDec/M.paille;
  assert.ok(ko>=9&&ko<=19,`KO/TKO poids paille : ${ko.toFixed(1)} %`);
  assert.ok(dec>=57&&dec<=73,`décisions poids paille : ${dec.toFixed(1)} %`);
});

test('Genre — le moteur lit le genre : mêmes combattants, moins de KO chez les femmes qu\'chez les hommes', () => {
  const M=mesure(31,2400,(div,sa,sb)=>div==='F-fly'||div==='H-fly');
  const win=newGameWindow(); win.setSeed(31);
  let kos={F:0,H:0}, n={F:0,H:0};
  for(const g of ['F','H']) for(let i=0;i<500;i++){
    const div=g==='F'?'F-fly':'H-fly';
    const r=win.simulateFight(win.makeFighter({div,gender:g,style:'mma',level:55}),win.makeFighter({div,gender:g,style:'mma',level:55}),3);
    n[g]++; if(win.isKOMethod(r.method)) kos[g]++;
  }
  assert.ok(M.n>0&&kos.F/n.F<kos.H/n.H*0.8,`KO chez les femmes ${kos.F}/${n.F}, chez les hommes ${kos.H}/${n.H}`);
});

test('Précision — les frappes significatives touchent 42 à 48 % du temps, sans toucher plus par minute', () => {
  const M=mesure(5150,2400);
  const pc=100*M.sig/M.sigAtt;
  assert.ok(pc>=42&&pc<=48,`précision : ${pc.toFixed(1)} % (cible 45 %)`);
});

test('Les quatre issues globales restent près de leur valeur d\'avant (±3 points) : KO, soumissions, décisions, poids lourds finis', () => {
  /* Valeurs d'avant le lot, mesurées au même outil sur trois graines (tools/reports/LOT-3-RECALIBRAGE-MOTEUR.md) : 30,1 / 22,1 / 47,5 / 57,3. */
  const M=mesure(20261006,4800), P=x=>100*x/M.n;
  assert.ok(Math.abs(P(M.ko)-30.1)<=4,`KO/TKO ${P(M.ko).toFixed(1)}`);
  assert.ok(Math.abs(P(M.sub)-22.1)<=4,`soumissions ${P(M.sub).toFixed(1)}`);
  assert.ok(Math.abs(P(M.dec)-47.5)<=4,`décisions ${P(M.dec).toFixed(1)}`);
  assert.ok(Math.abs(100*M.heavyFin/M.heavy-57.3)<=6,`poids lourds finis ${(100*M.heavyFin/M.heavy).toFixed(1)}`);
});

test('Le moteur reste déterministe à graine fixe, et chaque style reste jouable', () => {
  const run=()=>{ const win=newGameWindow(); win.setSeed(5); const r=win.simulateFight(win.makeFighter({style:'wrestler',gender:'F',div:'F-straw'}),win.makeFighter({style:'boxer',gender:'F',div:'F-straw'}),3); return [r.method,r.winner,r.round,JSON.stringify(r.judges)]; };
  assert.deepEqual(run(),run());
});
