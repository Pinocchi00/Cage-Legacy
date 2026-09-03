"use strict";
/* CAGE LEGACY — tests/helpers/loadGame.js
   ============================================================================
   Charge le VRAI jeu dans un navigateur virtuel (jsdom), dans l'ordre EXACT
   des <script src> d'index.html — lu directement depuis le fichier, jamais
   une liste recopiée à la main qui pourrait diverger de l'ordre réel. Une
   nouvelle fenêtre (donc un G/CL/etc. tout neuf) à chaque appel : les tests
   ne doivent jamais partager d'état.

   ==== [ANCRE: TESTS_LOADGAME_V3] — Plan V3 LOT 0 §6.1. Le README-TESTS.md
   et package.json du dépôt documentaient déjà ce harnais et son
   organisation (tests/helpers/loadGame.js, tests/helpers/playthrough.js,
   career/hallOfFame/champChamp/ranking.test.js) — mais le dossier tests/
   lui-même n'existait pas dans le dépôt (vérifié : jamais commité, jsdom
   absent de node_modules avant `npm install`). Reconstruit ici pour de bon,
   à partir de cette documentation. ==== */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');

/** Lit index.html et retourne la liste des <script src="..."> dans l'ordre
 * d'apparition — seule source de vérité sur l'ordre de chargement réel.
 * @returns {string[]} */
function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = [];
  let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html — le harnais ne peut pas déterminer l\'ordre de chargement réel.');
  return files;
}

/** Crée une fenêtre jsdom neuve, charge le jeu réel dans l'ordre
 * d'index.html, et retourne la fenêtre (window.G/window.CL/etc. exposés,
 * comme dans un vrai navigateur). N'exécute PAS main.js par défaut (le
 * démarrage automatique crée un combattant amateur et modifie G — la
 * plupart des tests veulent partir d'un G totalement vierge et construire
 * leur propre scénario) ; passer {runMain:true} pour l'exécuter quand même.
 * @param {{runMain?:boolean}} [opts]
 * @returns {import('jsdom').DOMWindow} */
function newGameWindow(opts){
  const runMain = !!(opts && opts.runMain);
  /* ==== [ANCRE: TESTS_LOADGAME_SCRIPT_SEMANTICS] — window.eval(code) a été
     essayé en premier et rejeté : chaque fichier du jeu commence par
     "use strict", et un eval() indirect en mode strict reçoit son PROPRE
     environnement lexical (spec ECMA) — les `const`/`let` de premier niveau
     d'un fichier ne survivent alors pas jusqu'à l'eval() du fichier
     suivant (COUNTRY_KEYS, const d'engine.js, redevenait "is not defined"
     dans state.js). De vraies balises <script> injectées dans le document,
     exécutées via runScripts:'dangerously', reproduisent le comportement
     réel d'un navigateur : les `const`/`let` de premier niveau d'une balise
     <script> classique (non-module) restent visibles aux balises
     suivantes, strict mode ou non — exactement ce que fait index.html. ==== */
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const window = dom.window;
  const document = window.document;
  // jsdom n'implémente pas le défilement réel (aucun layout) — render()
  // l'appelle sans condition après chaque écran ; sans ce stub, chaque
  // rendu logue un avertissement "Not implemented" qui noie la sortie des
  // tests sans indiquer un vrai problème.
  window.scrollTo = () => {};
  // jsdom n'implémente pas window.confirm/alert/prompt (boîtes de dialogue
  // natives) — le jeu les utilise pour les actions destructrices (supprimer
  // une légende, effacer le Panthéon). Un test qui veut vérifier le chemin
  // "annulé" peut réassigner window.confirm avant d'agir ; par défaut on
  // accepte, pour que le chemin normal reste testable sans configuration.
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  // localStorage minimal (jsdom ne fournit pas de storage réel sans
  // configuration réseau supplémentaire) — un Map suffit, le jeu ne lit
  // jamais que getItem/setItem/removeItem.
  if(!window.localStorage || typeof window.localStorage.setItem !== 'function'){
    const store = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: k => { store.delete(k); },
      clear: () => { store.clear(); },
    }});
  }
  /* ==== [ANCRE: TESTS_LOADGAME_CANVAS_STUB] — jsdom ne rend pas de vrai
     Canvas 2D (nécessiterait le paquet natif `canvas`, absent ici) :
     `getContext('2d')` renvoie `null` par défaut, ce qui plante
     startArena() (ui-08) dès `ctx.scale(...)`. Un Proxy générique qui
     répond à n'importe quel appel de méthode par un no-op (et par un
     objet du même type pour les méthodes qui renvoient normalement un
     objet chaînable, ex. createRadialGradient().addColorStop()) suffit :
     le jeu dessine "dans le vide" sans jamais lire le résultat visuel, il
     a seulement besoin que ces appels ne lèvent pas d'exception. */
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
  const files = readScriptOrder();
  for(const rel of files){
    if(rel === 'main.js' && !runMain) continue;
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = code;
    document.body.appendChild(scriptEl);
  }
  /* ==== [ANCRE: TESTS_LOADGAME_G_BRIDGE] — `G` (state.js: `let G=null;`)
     est un binding lexical de haut niveau, PAS une propriété de l'objet
     global : contrairement à `CL` (exposé explicitement via
     `window.CL=CL;`, ui-08), `window.G` resterait `undefined` de
     l'extérieur même si `G` est bien vivant et réassigné en continu par le
     jeu (`G={...}` à chaque nouvelle partie/écran). Ce script, injecté
     APRÈS tous les fichiers du jeu, partage leur même environnement
     lexical global (balises <script> sœurs du même document) — son
     get/set lit et écrit donc le VRAI `G` du jeu, live, jamais un instantané
     figé au moment du chargement. README-TESTS.md documente `win.G`
     comme façon normale d'inspecter/piloter l'état depuis un test : ce
     pont est ce qui rend cette promesse vraie. */
  const bridge = document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});";
  document.body.appendChild(bridge);
  return window;
}

module.exports = { newGameWindow, readScriptOrder };
