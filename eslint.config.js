'use strict';
/**
 * eslint.config.js — configuration ESLint pour Cage Legacy.
 *
 * ATTENTION AU CONTEXTE DE CE PROJET : ce n'est PAS un projet avec des
 * modules JS (pas de import/export). Tous les fichiers du jeu sont des
 * <script> classiques qui partagent la MÊME portée globale — une fonction
 * déclarée dans engine.js est directement utilisable dans ui-05-*.js sans
 * rien importer. C'est voulu, c'est l'architecture du jeu, on ne le change
 * pas ici.
 *
 * Le problème que ça pose à un linter standard : par défaut, ESLint croit
 * qu'une variable utilisée sans être déclarée dans le MÊME fichier est une
 * erreur ("no-undef"). Avec cette architecture, ça déclencherait des
 * centaines de fausses alertes (chaque référence à une fonction d'un autre
 * fichier). La solution : on scanne TOUS les fichiers du jeu au démarrage
 * pour lister automatiquement chaque fonction/variable de premier niveau
 * qu'ils déclarent, et on dit à ESLint "considère tout ça comme des
 * variables globales connues". Résultat : la règle no-undef reste active et
 * utile — elle continue d'attraper les VRAIES fautes de frappe (référencer
 * un nom qui n'existe NULLE PART dans le projet) — sans crier au loup sur
 * chaque appel légitime entre fichiers.
 *
 * Cette liste se reconstruit automatiquement à chaque lancement : pas besoin
 * de la maintenir à la main quand une fonction est ajoutée/renommée.
 */
const fs = require('fs');
const path = require('path');

// Fichiers du jeu à scanner pour en extraire les déclarations globales.
// Complète cette liste si de nouveaux fichiers ui-0X-*.js ou autres sont
// ajoutés au projet (le glob ci-dessous couvre déjà data-*.js, engine.js,
// state/*.js, ui-*.js et main.js automatiquement — récursif d'un niveau
// pour suivre state.js qui a été découpé en state/state-*.js, cf. refactor
// "Cage-Legacy" : chaque state-*.js reste un <script> classique séparé,
// chargé dans le même ordre qu'avant, juste rangé dans un sous-dossier).
function findGameFiles(rootDir) {
  const top = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = top
    .filter((e) => e.isFile() && e.name.endsWith('.js'))
    .filter((e) => !e.name.startsWith('eslint.config'))
    .filter((e) => e.name !== 'extract_globals.js') // scripts d'outillage, pas du code du jeu
    .map((e) => e.name);
  for (const dir of top.filter((e) => e.isDirectory() && !['node_modules', 'tests', 'tools', '.git'].includes(e.name))) {
    for (const f of fs.readdirSync(path.join(rootDir, dir.name))) {
      if (f.endsWith('.js')) files.push(path.join(dir.name, f));
    }
  }
  return files;
}

// Extrait les noms déclarés en position de premier niveau (jamais indentés,
// donc jamais à l'intérieur d'une fonction ou d'un bloc) : `function NAME(`
// et `const/let/var NAME`. Volontairement simple (regex, pas un vrai parseur
// AST) — suffisant ici car le style du projet déclare toujours ses
// fonctions/constantes de haut niveau en début de ligne, sans indentation.
function extractTopLevelDeclarations(filePath) {
  const funcRe = /^function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;
  const constRe = /^(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/;
  const names = new Set();
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const m1 = funcRe.exec(line);
    if (m1) names.add(m1[1]);
    const m2 = constRe.exec(line);
    if (m2) names.add(m2[1]);
  }
  return names;
}

function buildGameGlobals(rootDir) {
  const globals = {};
  for (const file of findGameFiles(rootDir)) {
    const names = extractTopLevelDeclarations(path.join(rootDir, file));
    for (const name of names) globals[name] = 'writable';
  }
  return globals;
}

const gameFiles = findGameFiles(__dirname);
const allGlobals = buildGameGlobals(__dirname);

// ==== [IMPORTANT] — no-redeclare et les globals partagées ====
// Si on donne la MÊME liste de globales à tous les fichiers, ESLint croit
// que chaque fichier "redéclare" ses propres fonctions (puisqu'il les voit
// déjà listées comme globales prédéfinies avant même de lire le fichier).
// La bonne approche : pour CHAQUE fichier, ne lui donner en globales que les
// symboles déclarés PAR LES AUTRES fichiers (jamais les siens). Ainsi
// no-redeclare reste utile (il détecterait une vraie redéclaration
// accidentelle du même nom dans deux fichiers différents) sans se déclencher
// sur le fonctionnement normal du projet.
const globalsPerFile = {};
for (const file of gameFiles) {
  const ownNames = extractTopLevelDeclarations(path.join(__dirname, file));
  const othersGlobals = {};
  for (const [name, kind] of Object.entries(allGlobals)) {
    if (!ownNames.has(name)) othersGlobals[name] = kind;
  }
  globalsPerFile[file] = othersGlobals;
}

const browserGlobals = {
  window: 'readonly', document: 'readonly', localStorage: 'readonly',
  navigator: 'readonly', location: 'readonly', history: 'readonly',
  console: 'readonly', alert: 'readonly', confirm: 'readonly', prompt: 'readonly',
  requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly',
  URL: 'readonly', URLSearchParams: 'readonly',
  Image: 'readonly', Audio: 'readonly', performance: 'readonly',
  btoa: 'readonly', atob: 'readonly',
};

module.exports = [
  {
    ignores: ['node_modules/**', 'tests/**'], // les tests ont leur propre style (node:test, require) — pas concernés par ce lint
  },
  ...gameFiles.map((file) => ({
    files: [file],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script', // PAS 'module' : ce sont des <script> classiques, pas des modules ES
      globals: { ...browserGlobals, ...globalsPerFile[file] },
    },
    rules: {
      // ==== Règles qui attrapent de VRAIS bugs (priorité de cette config) ====
      'no-undef': 'error',           // référence à un nom qui n'existe nulle part — LA règle la plus utile ici
      // 'no-unused-vars' est VOLONTAIREMENT désactivée : dans cette
      // architecture (fichiers qui partagent une portée globale, sans
      // import/export), une fonction déclarée dans un fichier et utilisée
      // uniquement dans un autre est report signalée à tort "jamais
      // utilisée" par ESLint (qui ne voit qu'un fichier à la fois). Sur ce
      // projet, activer cette règle produit ~95% de faux positifs (testé :
      // 144 avertissements sur 150, tous des fonctions bel et bien
      // utilisées ailleurs). Pour repérer du VRAI code mort (une fonction
      // que RIEN n'appelle nulle part dans tout le projet), mieux vaut
      // chercher manuellement, ex. : grep -c "nomDeLaFonction(" *.js
      // (si le résultat est 1, seule la déclaration existe, rien ne
      // l'appelle).
      'no-dupe-keys': 'error',       // ex. deux fois la même clé dans un objet littéral (a trouvé un vrai doublon dès le 1er passage)
      'no-dupe-args': 'error',
      'no-duplicate-case': 'error',
      'no-fallthrough': 'error',     // un `case` qui "tombe" dans le suivant sans `break`, souvent involontaire
      'no-unreachable': 'error',     // code mort après un return/throw
      'no-const-assign': 'error',
      'no-redeclare': 'error',
      'no-self-compare': 'error',
      'no-self-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': ['error', 'except-parens'],
      'no-dupe-else-if': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'use-isnan': 'error',          // `x === NaN` ne marche JAMAIS — piège classique
      'valid-typeof': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-setter-return': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      // Signalés mais pas bloquants (avertissement, pas erreur) : suspects,
      // parfois volontaires dans ce code, à revoir au cas par cas.
      eqeqeq: ['warn', 'smart'],     // 'smart' tolère `x == null` (idiome courant et volontaire)
      'no-empty': ['warn', { allowEmptyCatch: true }], // `catch(e){}` est un choix assumé dans ce projet (ex. localStorage indisponible)
    },
  })),
];
