"use strict";
/* CAGE LEGACY — tools/mesure-historique.js
   ============================================================================
   Lot 3 T1 la trace (docs/LOT-3-L-ARENE.md §3 T1) — le coût, mesuré. Charge
   le VRAI jeu dans un DOM virtuel (jsdom), joue des soirées réelles (le vrai
   mgmtNewPile, la vraie proposition en bloc de Leïla validée, le vrai
   mgmtRunEvent — carte principale posée en fixture, comme les tests §T3),
   puis publie la taille de la sauvegarde management avec et sans
   l'historique (m.hist).

   Mesure, ne décide rien : l'historique n'est JAMAIS tronqué ici — la
   décision d'élaguer appartient à l'auteur (même esprit que la QO-9 du
   21/09 pour les faits) ; cet outil livre le chiffre qui l'éclaire.

   Usage :
     node tools/mesure-historique.js [--seed=S] [--soirees=N] [--cycles=N]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260917, soirees: 20, cycles: 150 };
  for(const arg of argv){
    const m=/^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    if(m[1]==='seed') out.seed=parseInt(m[2],10)||out.seed;
    else if(m[1]==='soirees') out.soirees=Math.max(1,parseInt(m[2],10)||out.soirees);
    else if(m[1]==='cycles') out.cycles=Math.max(1,parseInt(m[2],10)||out.cycles);
  }
  return out;
}

/* --------------------- 2) chargement du jeu -------------------------------- */
/** Lit index.html et retourne la liste des <script src="..."> dans l'ordre
 *  d'apparition — seule source de vérité sur l'ordre de chargement réel.
 *  @returns {string[]} */
function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = [];
  let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html.');
  return files;
}

/** Fenêtre jsdom neuve avec le vrai jeu chargé (stubs DOM/Canvas/
 *  localStorage, même principe que tests/helpers/loadGame.js — tools/ ne
 *  dépend pas de tests/). @returns {import('jsdom').DOMWindow} */
function newGameWindow(){
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const window = dom.window;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  if(typeof window.TextEncoder === 'undefined'){
    const { TextEncoder, TextDecoder } = require('util');
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder;
  }
  function makeNoopCanvasHandle(){
    const handle = new Proxy(function(){}, {
      get(target, prop){
        if(prop === 'canvas') return undefined;
        if(prop === 'measureText') return () => ({ width: 0 });
        if(typeof prop === 'symbol' || prop === 'then') return undefined;
        if(!(prop in target)) target[prop] = handle;
        return target[prop];
      },
      set(target, prop, value){ target[prop] = value; return true; },
      apply(){ return handle; },
    });
    return handle;
  }
  window.HTMLCanvasElement.prototype.getContext = function(type){
    if(type !== '2d') return null;
    return makeNoopCanvasHandle();
  };
  for(const rel of readScriptOrder()){
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

/* ------------------------------ 3) mesure ---------------------------------- */
function mesure(cfg){
  const win = newGameWindow();
  return JSON.parse(win.eval(`(function(){
    setSeed(${cfg.seed});
    const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
    let jouees=0, cycles=0, manquees=0;
    while(jouees<${cfg.soirees}&&cycles<${cfg.cycles}){
      cycles++;
      mgmtNewPile(m);
      m.card.main=[];
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10){ manquees++; continue; }
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.pile=[]; m.open=null;
      if(mgmtClosePile(m)!=='refill'){ manquees++; continue; }
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')){ manquees++; continue; }
      if(mgmtRunEvent(m)) jouees++; else manquees++;
    }
    /* Les tailles : la sauvegarde réelle, puis la même sans l'historique. */
    const brut=JSON.stringify(m);
    const sansHist=JSON.parse(brut); sansHist.hist=[];
    const taille={total:brut.length,sansHist:JSON.stringify(sansHist).length,
      hist:JSON.stringify(m.hist).length,
      roster:JSON.stringify(m.roster).length,
      exterieur:JSON.stringify(m.exterieur).length,
      pile:JSON.stringify(m.pile).length,
      facts:JSON.stringify(m.facts).length};
    return JSON.stringify({jouees,cycles,manquees,combats:m.hist.length,
      rosterN:m.roster.length,retraitesN:m.roster.filter(o=>o.retired).length,
      eventsPlayed:m.eventsPlayed,taille,cycle:m.cycle,
      valable:validateMgmt(m)});
  })()`));
}

/* ------------------------------ 4) rapport --------------------------------- */
(function main(){
  const cfg=parseArgs(process.argv.slice(2));
  const r=mesure(cfg);
  const t=r.taille, ko=x=>(x/1024).toFixed(1);
  console.log('=== Mesure de la sauvegarde management — lot 3 T1, la trace ===');
  console.log('Graine '+cfg.seed+' — soirées jouées : '+r.jouees+'/'+cfg.soirees+
    ' (cycles ouverts : '+r.cycles+', sans carte complète : '+r.manquees+')');
  console.log('Cycle courant : '+r.cycle+' — combats tracés : '+r.combats+
    ' — roster : '+r.rosterN+' lignes ('+r.retraitesN+' retraité(s) médical(aux))');
  console.log('');
  console.log('Taille de la sauvegarde (JSON, caractère = octet) :');
  console.log('  avec l\u2019historique    : '+t.total+' o ('+ko(t.total)+' Ko)');
  console.log('  sans l\u2019historique   : '+t.sansHist+' o ('+ko(t.sansHist)+' Ko)');
  console.log('  dont m.hist         : '+t.hist+' o ('+ko(t.hist)+' Ko)');
  console.log('');
  console.log('Décomposition du reste : roster '+t.roster+' o, exterieur '+t.exterieur+
    ' o, pile '+t.pile+' o, faits '+t.facts+' o');
  if(r.jouees>0){
    console.log('');
    console.log('Par soirée : '+(t.hist/r.jouees).toFixed(0)+' o d\u2019historique ('+
      (r.combats/r.jouees).toFixed(1)+' combats/soirée), croissance totale '+
      ((t.total-t.sansHist)/r.jouees).toFixed(0)+' o/soirée.');
  }
  console.log('');
  console.log('Porte de validation validateMgmt : '+(r.valable?'PASSÉE':'REFUSÉE'));
  process.exitCode=r.valable?0:1;
})();
