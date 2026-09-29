"use strict";
/* CAGE LEGACY — tools/mesure-classements.js
   ============================================================================
   Lot 4 T6 (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T6) — le coût d'ouverture de
   l'écran des classements, mesuré. Charge le VRAI jeu dans un DOM virtuel
   (jsdom, même principe que tests/helpers/loadGame.js — tools/ ne dépend
   pas de tests/), avance le management de N cycles (soirées réelles
   incluses), puis publie le coût du rendu de l'écran :
   - à froid (premier rendu des classements, tout dérivé à la lecture) ;
   - à chaud (cinq re-rendus, change d'onglet, deux portées) ;
   - le dernier coût inclut le classement au cycle précédent (tendance).
   Ne change rien au code : mesure, ne décide rien.
   Usage : node tools/mesure-classements.js [--seed=S] [--cycles=N]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = [];
  let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html.');
  return files;
}

function newGameWindow(){
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/', runScripts: 'dangerously', pretendToBeVisual: true,
  });
  const window = dom.window;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  if(!window.localStorage || typeof window.localStorage.setItem !== 'function'){
    const store = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: k => { store.delete(k); },
      clear: () => { store.clear(); },
    }});
  }
  const files = readScriptOrder();
  for(const rel of files){
    if(rel === 'main.js') continue;
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  }
  const bridge = window.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});";
  window.document.body.appendChild(bridge);
  return window;
}

/* --------------------------- 3) la mesure ---------------------------------- */
const CYCLES = (() => {
  const a = process.argv.find((v)=>/^--cycles=/.test(v));
  return a ? Math.max(1,parseInt(a.split('=')[1],10)||12) : 12;
})();
const SEED = (() => {
  const a = process.argv.find((v)=>/^--seed=/.test(v));
  return a ? (parseInt(a.split('=')[1],10)||20260929) : 20260929;
})();

function chrono(win,label,line){
  const t0 = Date.now();
  win.eval(line);
  const t1 = Date.now();
  return `${label} : ${t1-t0} ms`;
}

const win = newGameWindow();
/* Un management vivant : N cycles réels (soirées incluses — cartes posées
   intégralement en fixture, comme les tests le font). */
win.eval(`(function(){
  setSeed(${SEED});
  const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
})()`);
for(let c=0;c<CYCLES;c++){
  const ok = win.eval(`(function(){
    const m=G.mgmt;
    m.card.main=[]; m.card.prelims=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    for(let i=0;i<5&&i*2+1<dispo.length;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    for(let i=0;i<4&&i*2+1<dispo.length-10;i++) m.card.prelims.push({a:dispo[10+2*i].id,b:dispo[11+2*i].id,cycle:m.cycle,slot:'prelim'});
    if(!mgmtCardFull(m)) return false;
    if(!mgmtRunEvent(m)) return false;
    mgmtNewPile(m);
    return true;
  })()`);
  if(!ok){ console.log(`fixture interrompue au cycle ${c+1} (carte non composable ou roster épuisé — mesure faite sur le jeu disponible)`); break; }
}
console.log(`cycles joués : ${win.eval('G.mgmt.cycle')} · ${win.eval('G.mgmt.hist.length')} combats en historique · ${win.eval('G.mgmt.pile.length')} affaires`);
const cold = chrono(win,'ouverture à froid (premier rendu, tout dérivé)',`G.screen='mgmt_classements'; render();`);
const chaud = chrono(win,'re-rendu à chaud (mondial, même onglet)',`render();`);
const lourd = chrono(win,'onglet Poids léger (classement au cycle précédent recalculé)',`CL.mgmtClassementsTab('H-light')`);
const split = chrono(win,'bascule SPLIT',`CL.mgmtClassementsScope('split')`);
console.log(cold);
console.log(chaud);
console.log(lourd);
console.log(split);
console.log('lignes rendues : '+win.eval(`document.querySelectorAll('.mgmt-cl-row').length`));
