"use strict";
/* CAGE LEGACY — tools/inventaire-code-mort.js
   ============================================================================
   DIAGNOSTIC de code mort — outil de SIGNALEMENT, ne modifie rien, ne
   supprime rien. Il inventorie chaque déclaration de premier niveau du jeu
   (fonctions et constantes, plus les méthodes ajoutées à CL), compte ses
   références dans TOUT le dépôt, puis TRIE les candidates en trois
   catégories :

     - MORT              : rien ne l'atteint, par aucun chemin (avec preuve
                           du scan et mentions résiduelles éventuelles).
     - ATTEINT AUTREMENT : référencé par une chaîne (handler onclick dans du
                           HTML généré, appel dans l'index.html en ligne...),
                           pas par un identifiant — les faux positifs du
                           comptage naïf « nom( ».
     - DOUTEUX           : atteint uniquement par les tests/l'outillage, ou
                           par des occurrences qui ne prouvent rien de sûr —
                           le doute est assumé, pas tranché.

   POURQUOI CET OUTIL EXISTE : eslint.config.js désactive no-unused-vars
   (architecture en portée globale partagée — cf. son commentaire) et renvoie
   à une recherche manuelle « grep -c "nom(" ». Ce comptage naïf rate les
   constantes (jamais appelées avec des parenthèses) et ne voit pas les
   méthodes de CL. Ici on fait mieux :

   MÉTHODE D'EXTRACTION — AST, pas regex en colonne 0.
     eslint.config.js extrait les déclarations par regex en colonne 0
     (extractTopLevelDeclarations) : une déclaration indentée lui est
     invisible. Ici chaque fichier du jeu est analysé par espree (le parseur
     d'ESLint, déjà dans node_modules) : le périmètre des déclarations est le
     corps du programme (Program.body). L'outil liste en fin de rapport ce
     que la regex d'ESLint aurait manqué au run courant.

   COMPTAGE DES RÉFÉRENCES.
     - Références lexicales : chaque identifiant de l'AST des fichiers du
       jeu, hors position de clé de propriété, hors accès membre (f.gameMode
       n'est pas une référence à une globale), hors le sous-arbre de sa
       propre déclaration (une fonction qui ne s'appelle que elle-même reste
       candidate). Les accès `CL.nom` comptent comme références lexicales
       des méthodes CL.
     - Passe transitive : un nom vivant uniquement parce qu'il est appelé
       par des déclarations elles-mêmes mortes redescend en MORT (itération
       jusqu'à stabilité). Une référence venue du code de premier niveau
       (hors toute déclaration — ex. l'appel validateSkills() de main.js)
       ou par chaîne garde vivant.
     - Références par chaîne : littéraux de chaîne et gabarits des fichiers
       du jeu, plus index.html brut (onclick en ligne). Une occurrence ne
       prouve un chemin d'exécution que si elle a une FORME DE CODE :
       `nom(`, `CL.nom`, `eval('nom')`/`eval(\`nom(\`)`, clé d'objet par
       chaîne, ou accès calculé `obj['nom']`. Un mot isolé dans une phrase
       (étiquette « R » des raretés, etc.) est une mention, jamais un chemin.
     - Tests/outillage : mêmes formes de code cherchées dans tests/ et
       tools/ (les tests atteignent beaucoup de noms via win.eval — c'est un
       vrai chemin de test, jamais un chemin du jeu).
     - Mentions : commentaires (plages AST), documentation .md, occurrences
       textuelles sans forme de code.

   VERDICT, par priorité : lexical → vivant (hors catégories) ; chaîne à
   forme de code → ATTEINT AUTREMENT (file:ligne de preuve) ; tests/outillage
   seuls → DOUTEUX ; mentions seules ou rien → MORT (justifiée).

   LIMITES ASSUMÉES : pas de suivi d'alias (`const f=maFonc` — l'alias, lui,
   reste visible) ; les déclarations dans des blocs conditionnels de premier
   niveau (hors Program.body direct) ne sont pas inventoriées ; une preuve
   dans un gabarit de test dont l'appel serait coupé entre deux lignes
   échapperait au scan ligne par ligne ; les données (propriétés d'objets,
   champs de sauvegarde) sont hors périmètre — les témoins documentés
   (guardPull, f.gameMode, f.faithNemesisId, f.faithTraits) sont de ce cas :
   le §6 du rapport les examine avec leurs occurrences réelles plutôt que de
   prétendre les classer.

   Commande : node tools/inventaire-code-mort.js
   Rapport  : tools/reports/INVENTAIRE-CODE-MORT.md (réécrit à chaque run).
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const espree = require('espree');

const ROOT = path.join(__dirname, '..');
const REPORT_PATH = path.join(__dirname, 'reports', 'INVENTAIRE-CODE-MORT.md');
const SELF_REL = 'tools/inventaire-code-mort.js';

/* ---- 1) Fichiers du jeu — même algorithme qu'eslint.config.js ---------- */
/* Réplique de findGameFiles() d'eslint.config.js : fichiers *.js de premier
   niveau (hors eslint.config*, hors extract_globals.js) + un niveau
   récursif dans les dossiers (hors node_modules, tests, tools, .git). */
function findGameFiles(rootDir) {
  const top = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = top
    .filter((e) => e.isFile() && e.name.endsWith('.js'))
    .filter((e) => !e.name.startsWith('eslint.config'))
    .filter((e) => e.name !== 'extract_globals.js')
    .map((e) => e.name);
  for (const dir of top.filter((e) => e.isDirectory() && !['node_modules', 'tests', 'tools', '.git'].includes(e.name))) {
    for (const f of fs.readdirSync(path.join(rootDir, dir.name))) {
      if (f.endsWith('.js')) files.push(path.join(dir.name, f));
    }
  }
  return files.map((f) => f.replace(/\\/g, '/'));
}

/* Extraction « colonne 0 » d'eslint.config.js, répliquée à l'identique
   (mêmes regexes, même limite : une déclaration indentée lui est
   invisible), pour la comparaison de périmètre du §7. */
function extractTopLevelDeclarationsColumnZero(filePath) {
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

/* ---- 2) Parse AST de chaque fichier du jeu ----------------------------- */
function parseGameFile(absPath) {
  const src = fs.readFileSync(absPath, 'utf-8');
  const ast = espree.parse(src, {
    ecmaVersion: 'latest',
    sourceType: 'script',
    loc: true,
    range: true,
    comment: true,
  });
  return { src, ast };
}

/* Parcours générique de l'AST (sans dépendance). */
function walk(node, cb, parent) {
  if (!node || typeof node.type !== 'string') return;
  cb(node, parent);
  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue;
    const val = node[key];
    if (Array.isArray(val)) {
      for (const child of val) {
        if (child && typeof child === 'object') walk(child, cb, node);
      }
    } else if (val && typeof val === 'object' && typeof val.type === 'string') {
      walk(val, cb, node);
    }
  }
}

function inRanges(pos, ranges) {
  for (const r of ranges) if (pos >= r[0] && pos <= r[1]) return true;
  return false;
}

const NAME_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/* Occurrence du nom avec forme de code dans un texte :
   - appel          : nom(            (onclick, eval, table de fonctions)
   - méthode CL     : CL.nom          (les méthodes CL n'existent que là)
   - eval par nom   : eval('nom') / eval(`nom(`)  (chemin des tests)
   Un mot isolé (étiquette, texte) n'est PAS une forme de code. */
function hasCodeShape(text, name) {
  const callRe = new RegExp('(?:^|[^A-Za-z0-9_$])' + name + '\\s*\\(');
  if (callRe.test(text)) return true;
  const clRe = new RegExp('\\bCL\\s*\\.\\s*' + name + '\\b');
  if (clRe.test(text)) return true;
  const evalRe = new RegExp('\\beval\\s*\\(\\s*["\'`]\\s*' + name + '\\s*["\'`)]');
  return evalRe.test(text);
}

function wordOccurs(text, name) {
  return new RegExp('(?:^|[^A-Za-z0-9_$])' + name + '(?:$|[^A-Za-z0-9_$])').test(text);
}

/* Index (dans le texte) de la première occurrence du mot, hors préfixe. */
function wordMatchIndex(text, name) {
  const m = new RegExp('(?:^|[^A-Za-z0-9_$])' + name + '(?:$|[^A-Za-z0-9_$])').exec(text);
  if (!m) return -1;
  return m.index + (m[0].startsWith(name) ? 0 : 1);
}

/* Cache des sources de fichiers du jeu, pour calculer la LIGNE EXACTE d'un
   match à l'intérieur d'un littéral de chaîne (le loc d'un quasi d'un
   gabarit pointe sur le début du gabarit, pas sur le match). Tolérant aux
   fichiers qui disparaissent en cours de route (une autre session de lot
   peut travailler dans le même répertoire). */
const srcCache = new Map();
function srcOf(relFile) {
  if (!srcCache.has(relFile)) {
    let content = '';
    try { content = fs.readFileSync(path.join(ROOT, relFile), 'utf-8'); } catch (e) { content = ''; }
    srcCache.set(relFile, content);
  }
  return srcCache.get(relFile);
}
function exactLineOf(s, name) {
  if (s.base == null) return s.line;
  const idx = wordMatchIndex(s.text, name);
  if (idx < 0) return s.line;
  return lineOfOffset(srcOf(s.file), s.base + idx);
}

/* Numéro de ligne (1-based) d'un offset dans un texte. */
function lineOfOffset(src, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i++) if (src[i] === '\n') line++;
  return line;
}

/* ---- 3) Collecte ------------------------------------------------------- */
const gameFiles = findGameFiles(ROOT);

const decls = [];          // déclarations de premier niveau {name,kind,file,line,range}
const clMethods = [];      // méthodes CL {name,file,line,range}
const lexicalRefs = [];    // références lexicales {name,file,line,pos,enc}
const clMemberRefs = [];   // références CL.méthode {name,file,line,pos}
const gameStrings = [];    // littéraux de chaîne du jeu {text,file,line,isKey,isComputed}
const commentRanges = [];  // plages de commentaires {file,ranges:[...]}

const columnZeroNames = new Map(); // file -> Set (réplique eslint, §7)

for (const relFile of gameFiles) {
  const absPath = path.join(ROOT, relFile);
  const { src, ast } = parseGameFile(absPath);
  columnZeroNames.set(relFile, extractTopLevelDeclarationsColumnZero(absPath));

  // Déclarations de premier niveau (Program.body direct).
  for (const stmt of ast.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id) {
      decls.push({ name: stmt.id.name, kind: 'fonction', file: relFile, line: stmt.loc.start.line, range: stmt.range });
    } else if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations) {
        if (d.id.type === 'Identifier') {
          decls.push({ name: d.id.name, kind: stmt.kind, file: relFile, line: d.loc.start.line, range: stmt.range });
        }
      }
    } else if (stmt.type === 'ClassDeclaration' && stmt.id) {
      decls.push({ name: stmt.id.name, kind: 'classe', file: relFile, line: stmt.loc.start.line, range: stmt.range });
    }
  }

  // Commentaires (plages, pour distinguer code et mentions).
  commentRanges.push({ file: relFile, ranges: ast.comments.map((c) => c.range) });

  // Méthodes CL : clés de `const CL={...}`, de `Object.assign(CL,{...})`
  // et affectations `CL.nom=...` au premier niveau.
  const collectObjectKeys = (objExpr) => {
    for (const prop of objExpr.properties) {
      if (prop.type !== 'Property') continue;
      if (prop.computed) continue;
      const keyName = prop.key.type === 'Identifier' ? prop.key.name
        : (prop.key.type === 'Literal' && typeof prop.key.value === 'string' ? prop.key.value : null);
      if (keyName && NAME_RE.test(keyName)) {
        clMethods.push({ name: keyName, file: relFile, line: prop.key.loc.start.line, range: prop.range });
      }
    }
  };
  for (const stmt of ast.body) {
    if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations) {
        if (d.id.type === 'Identifier' && d.id.name === 'CL' && d.init && d.init.type === 'ObjectExpression') {
          collectObjectKeys(d.init);
        }
      }
    } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
      const call = stmt.expression;
      if (call.callee.type === 'MemberExpression' && call.callee.object.type === 'Identifier'
          && call.callee.object.name === 'Object' && call.callee.property.name === 'assign' && call.arguments.length >= 2) {
        const target = call.arguments[0];
        if (target.type === 'Identifier' && target.name === 'CL') {
          for (const arg of call.arguments.slice(1)) {
            if (arg.type === 'ObjectExpression') collectObjectKeys(arg);
          }
        }
      }
    } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'AssignmentExpression') {
      const left = stmt.expression.left;
      if (left.type === 'MemberExpression' && !left.computed
          && left.object.type === 'Identifier' && left.object.name === 'CL'
          && left.property.type === 'Identifier' && NAME_RE.test(left.property.name)) {
        clMethods.push({ name: left.property.name, file: relFile, line: left.property.loc.start.line, range: stmt.expression.range });
      }
    }
  }

  // Enclos de ce fichier : déclarations de premier niveau + propriétés CL
  // (une méthode CL est un sous-arbre à part entière — la passe transitive
  // doit voir qu'un appel vient D'UNE méthode morte, pas seulement du const
  // CL qui la contient). Trié par largeur croissante pour prendre le plus
  // interne.
  const enclosures = decls.filter((d) => d.file === relFile)
    .map((d) => ({ name: d.name, range: d.range }))
    .concat(clMethods.filter((m) => m.file === relFile).map((m) => ({ name: m.name, range: m.range })))
    .sort((a, b) => (a.range[1] - a.range[0]) - (b.range[1] - b.range[0]));

  // Parcours complet : références lexicales, CL.nom, littéraux de chaîne.
  walk(ast, (node, parent) => {
    if (node.type === 'Identifier') {
      const isPropKey = parent && parent.type === 'Property' && parent.key === node && !parent.computed;
      const isMemberProp = parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed;
      if (isPropKey) return;
      if (isMemberProp) {
        const obj = parent.object;
        if (obj.type === 'Identifier' && obj.name === 'CL' && NAME_RE.test(node.name)) {
          clMemberRefs.push({ name: node.name, file: relFile, line: node.loc.start.line, pos: node.start });
        }
        return;
      }
      if (NAME_RE.test(node.name)) {
        const encDecl = enclosures.find((e) => node.start >= e.range[0] && node.end <= e.range[1]);
        lexicalRefs.push({ name: node.name, file: relFile, line: node.loc.start.line, pos: node.start, enc: encDecl ? encDecl.name : null });
      }
    } else if (node.type === 'Literal' && typeof node.value === 'string') {
      const isKey = parent && parent.type === 'Property' && parent.key === node;
      const isComputed = parent && parent.type === 'MemberExpression' && parent.property === node && parent.computed;
      gameStrings.push({ text: node.value, file: relFile, line: node.loc.start.line, base: node.start, isKey: !!isKey, isComputed: !!isComputed });
    } else if (node.type === 'TemplateLiteral') {
      for (const q of node.quasis) {
        gameStrings.push({ text: q.value.cooked || q.value.raw || '', file: relFile, line: q.loc.start.line, base: q.start, isKey: false, isComputed: false });
      }
    }
  }, null);
}

/* ---- 4) index.html + reste du dépôt (scan brut) ------------------------ */
function listRepoFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listRepoFiles(full, out);
    else if (/\.(js|html|md|json|css|txt)$/i.test(entry.name) && entry.name !== 'package-lock.json') {
      out.push(full);
    }
  }
  return out;
}

const indexHtmlSrc = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8') : '';
// Commentaires HTML de index.html : une occurrence dedans est une mention
// (prose historique), jamais un chemin d'exécution.
const indexCommentRanges = [];
{
  const reHtml = /<!--[\s\S]*?-->/g;
  let mh;
  while ((mh = reHtml.exec(indexHtmlSrc)) !== null) indexCommentRanges.push([mh.index, mh.index + mh[0].length]);
}
function inIndexComment(off) {
  for (const [a, b] of indexCommentRanges) if (off >= a && off <= b) return true;
  return false;
}
const repoFiles = listRepoFiles(ROOT, [])
  .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
  .filter((f) => !gameFiles.includes(f))
  .filter((f) => f !== 'index.html')
  .filter((f) => f !== SELF_REL)                 // l'outil lui-même : jamais une preuve
  .filter((f) => !f.startsWith('tools/reports/')); // rapports générés : jamais une preuve
const repoText = repoFiles.map((f) => ({ file: f, src: fs.readFileSync(path.join(ROOT, f), 'utf-8') }));

function findWordHits(name, src) {
  const hits = [];
  const re = new RegExp('(?:^|[^A-Za-z0-9_$])(' + name + ')(?:$|[^A-Za-z0-9_$])', 'g');
  let m;
  while ((m = re.exec(src)) !== null) {
    const prefixLen = m[0].startsWith(name) ? 0 : 1;
    hits.push({ line: lineOfOffset(src, m.index + prefixLen), off: m.index + prefixLen });
    re.lastIndex = m.index + m[0].length - 1;
  }
  return hits;
}

/* ---- 5) Classification -------------------------------------------------- */
const universe = new Map(); // name -> {decls:[], isClMethod}
function addToUniverse(name, info) {
  if (!universe.has(name)) universe.set(name, { decls: [], isClMethod: false });
  universe.get(name).decls.push(info);
}
for (const d of decls) addToUniverse(d.name, d);
for (const m of clMethods) { addToUniverse(m.name, m); universe.get(m.name).isClMethod = true; }

function classify(name, entry) {
  const ownRanges = entry.decls.map((d) => [d.file, d.range]);
  const inOwn = (ref) => ownRanges.some(([f, r]) => f === ref.file && inRanges(ref.pos, [r]));

  const lex = lexicalRefs.filter((r) => r.name === name && !inOwn(r));
  const clRefs = clMemberRefs.filter((r) => r.name === name && !inOwn(r));
  const stringRefs = gameStrings.filter((s) => {
    if (!wordOccurs(s.text, name)) return false;
    if (s.isKey || s.isComputed) return true;          // clé de table / accès calculé obj['nom']
    return hasCodeShape(s.text, name);                 // nom( ou CL.nom dans la chaîne
  });
  const indexCodeHits = [];
  const indexMentions = [];
  for (const hit of findWordHits(name, indexHtmlSrc)) {
    if (inIndexComment(hit.off)) { indexMentions.push(hit.line); continue; }
    const lineText = indexHtmlSrc.split('\n')[hit.line - 1] || '';
    if (hasCodeShape(lineText, name)) indexCodeHits.push(hit.line);
    else indexMentions.push(hit.line);
  }
  const testToolHits = [];
  const testToolMentions = [];
  for (const f of repoText) {
    if (!(f.file.startsWith('tests/') || f.file.startsWith('tools/'))) continue;
    for (const hit of findWordHits(name, f.src)) {
      const lineText = f.src.split('\n')[hit.line - 1] || '';
      if (hasCodeShape(lineText, name)) testToolHits.push({ file: f.file, line: hit.line });
      else testToolMentions.push({ file: f.file, line: hit.line });
    }
  }
  const mentions = [];
  for (const cr of commentRanges) {
    const src = srcOf(cr.file);
    for (const [start, end] of cr.ranges) {
      if (wordOccurs(src.slice(start, end), name)) mentions.push({ file: cr.file, line: lineOfOffset(src, start), why: 'commentaire' });
    }
  }
  for (const f of repoText) {
    if (f.file.endsWith('.md')) {
      for (const hit of findWordHits(name, f.src)) mentions.push({ file: f.file, line: hit.line, why: 'documentation' });
    }
  }
  for (const line of indexMentions) mentions.push({ file: 'index.html', line, why: 'html sans forme de code' });
  for (const m of testToolMentions) mentions.push({ file: m.file, line: m.line, why: 'tests/outillage sans forme de code' });

  return { lex, clRefs, stringRefs, indexCodeHits, testToolHits, mentions };
}

const verdicts = [];
for (const [name, entry] of universe) {
  const c = classify(name, entry);
  const base = {
    name,
    kind: entry.isClMethod ? 'méthode CL' : entry.decls[0].kind,
    file: entry.decls[0].file,
    line: entry.decls[0].line,
    extraDecls: entry.decls.length - 1,
    lexCount: c.lex.length + c.clRefs.length,
    stringCount: c.stringRefs.length + c.indexCodeHits.length,
    testToolCount: c.testToolHits.length,
    mentionCount: c.mentions.length,
  };
  let verdict, proof, justification;
  if (c.lex.length > 0 || c.clRefs.length > 0) {
    const refSite = c.lex[0] || c.clRefs[0];
    verdict = 'VIVANT';
    justification = `${base.lexCount} référence(s) lexicale(s) dans le jeu (ex. ${refSite.file}:${refSite.line})`;
    proof = null;
  } else if (c.stringRefs.length > 0 || c.indexCodeHits.length > 0) {
    verdict = 'ATTEINT_AUTREMENT';
    if (c.stringRefs.length > 0) {
      const s = c.stringRefs[0];
      proof = `${s.file}:${exactLineOf(s, name)} — chaîne contenant « ${name} » sous forme de code`;
    } else {
      proof = `index.html:${c.indexCodeHits[0]} — occurrence sous forme de code dans l'HTML (script en ligne/onclick)`;
    }
    justification = `aucune référence lexicale ; atteint par chaîne/HTML (${c.stringRefs.length} chaîne(s) du jeu, index.html ×${c.indexCodeHits.length})`;
  } else if (c.testToolHits.length > 0) {
    verdict = 'DOUTEUX';
    proof = `${c.testToolHits[0].file}:${c.testToolHits[0].line}`;
    justification = `jamais appelé par le jeu (ni lexical, ni chaîne) ; ${c.testToolHits.length} occurrence(s) sous forme de code dans tests/outillage (ex. ${proof}) — chemin de test, jamais un chemin du jeu`;
  } else if (c.mentions.length > 0) {
    verdict = 'MORT';
    proof = null;
    justification = `aucun chemin d'exécution dans tout le dépôt ; seules des mentions (${c.mentions.slice(0, 3).map((m) => `${m.file}:${m.line} [${m.why}]`).join(', ')})`;
  } else {
    verdict = 'MORT';
    proof = null;
    justification = 'aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation)';
  }
  verdicts.push(Object.assign(base, { verdict, proof, justification, _class: c }));
}

/* Passe transitive : un nom vivant UNIQUEMENT par des références venues du
   sous-arbre de déclarations elles-mêmes mortes redescend en MORT. Une
   référence venue du code de premier niveau (enc === null, ex. l'appel
   validateSkills() de main.js) ou par chaîne garde vivant. */
let transitiveFound = 0;
let changed = true;
while (changed) {
  changed = false;
  const alive = new Set(verdicts.filter((v) => v.verdict !== 'MORT').map((v) => v.name));
  for (const v of verdicts) {
    if (v.verdict !== 'VIVANT') continue;
    const refs = v._class.lex;
    if (!refs.length || v._class.clRefs.length > 0) continue; // méthode CL : jamais transitive
    const allFromDead = refs.length > 0 && refs.every((r) => r.enc !== null && !alive.has(r.enc));
    if (allFromDead) {
      v.verdict = 'MORT';
      v.proof = null;
      v.justification = `aucune référence hors des déclarations elles-mêmes mortes (${refs.map((r) => `${r.file}:${r.line} depuis ${r.enc}()`).slice(0, 3).join(', ')}) — mort transitive`;
      changed = true;
      transitiveFound++;
    }
  }
}

/* Candidats « naïfs » : ce que grep -c "nom(" sur les fichiers du jeu
   déclarerait mort (toutes les occurrences de `nom(` sont la déclaration). */
const naiveDead = new Set();
for (const [name, entry] of universe) {
  let total = 0;
  let declOcc = 0;
  for (const relFile of gameFiles) {
    const src = srcOf(relFile);
    const re = new RegExp('(?:^|[^A-Za-z0-9_$])' + name + '\\s*\\(', 'g');
    let m;
    while ((m = re.exec(src)) !== null) {
      total++;
      const prefixLen = m[0].startsWith(name) ? 0 : 1;
      const off = m.index + prefixLen; // position du nom lui-même, pas du caractère précédent
      if (entry.decls.some((d) => d.file === relFile && off >= d.range[0] && off <= d.range[1])) declOcc++;
      re.lastIndex = m.index + m[0].length - 1;
    }
  }
  if (total === 0 || total === declOcc) naiveDead.add(name);
}

/* Comparaison de périmètre : ce que la regex colonne 0 d'ESLint a manqué. */
const astOnlyNames = [];
for (const [name, entry] of universe) {
  if (entry.isClMethod) continue;
  const filesOfName = new Set(entry.decls.map((d) => d.file));
  const missing = [...filesOfName].filter((f) => !columnZeroNames.get(f).has(name));
  if (missing.length) astOnlyNames.push({ name, file: entry.decls[0].file, line: entry.decls[0].line });
}

/* ---- 6) Témoins de contrôle (calculés) ---------------------------------- */
const WITNESS_NAMES = ['guardPull', 'gameMode', 'faithNemesisId', 'faithTraits'];
const witnesses = WITNESS_NAMES.map((name) => {
  const sites = [];
  for (const relFile of gameFiles) {
    const src = srcOf(relFile);
    for (const hit of findWordHits(name, src)) sites.push(`${relFile}:${hit.line}`);
  }
  for (const hit of findWordHits(name, indexHtmlSrc)) sites.push(`index.html:${hit.line}`);
  for (const f of repoText) {
    for (const hit of findWordHits(name, f.src)) sites.push(`${f.file}:${hit.line}`);
  }
  return { name, inUniverse: universe.has(name), sites };
});

/* ---- 7) Rapport --------------------------------------------------------- */
const byVerdict = { MORT: [], ATTEINT_AUTREMENT: [], DOUTEUX: [], VIVANT: [] };
for (const v of verdicts) byVerdict[v.verdict].push(v);
const sortByName = (a, b) => a.name.localeCompare(b.name);
for (const key of Object.keys(byVerdict)) byVerdict[key].sort(sortByName);

function row(v) {
  const lieu = `${v.file}:${v.line}`;
  const extra = v.extraDecls ? ` (+${v.extraDecls} autre(s))` : '';
  const preuve = v.proof ? ` — preuve : ${v.proof}` : '';
  return `| \`${v.name}\` | ${v.kind} | ${lieu}${extra} | ${v.justification}${preuve} |`;
}

const naiveRescued = [...naiveDead].filter((n) => {
  const v = verdicts.find((x) => x.name === n);
  return v && (v.verdict === 'ATTEINT_AUTREMENT' || v.verdict === 'DOUTEUX');
});
const naiveConfirmedDead = [...naiveDead].filter((n) => {
  const v = verdicts.find((x) => x.name === n);
  return v && v.verdict === 'MORT';
});
/* Et l'inverse : des morts sûrs que le naïf croit vivants parce qu'une
   mention (commentaire, doc) contient déjà « nom( » avec des parenthèses. */
const mortNotNaive = verdicts.filter((v) => v.verdict === 'MORT' && !naiveDead.has(v.name)).map((v) => v.name);
const naiveKinds = { const: 0, let: 0, var: 0, fonction: 0, 'méthode CL': 0, classe: 0 };
for (const n of naiveDead) {
  const v = verdicts.find((x) => x.name === n);
  if (v) naiveKinds[v.kind] = (naiveKinds[v.kind] || 0) + 1;
}

const report = [];
report.push('# Cage Legacy — inventaire du code mort');
report.push('');
report.push(`*Généré le ${new Date().toISOString().slice(0, 10)} par \`node tools/inventaire-code-mort.js\` — DIAGNOSTIC, aucune suppression effectuée.*`);
report.push('');
report.push('## 1. Méthode et limites');
report.push('');
report.push('- Extraction des déclarations par **AST (espree)** sur le corps du programme (Program.body), sur le même périmètre de fichiers qu\'eslint.config.js. **Fait mieux que la regex en colonne 0** d\'ESLint : une déclaration indentée ou en fin de ligne, invisible à la regex, est vue ici. Écart constaté à ce run : **' + astOnlyNames.length + '** déclaration(s) vue(s) par l\'AST et manquée(s) par la colonne 0' + (astOnlyNames.length ? ' : ' + astOnlyNames.map((d) => `\`${d.name}\` (${d.file}:${d.line})`).join(', ') : ' — sur ce dépôt le style place chaque déclaration en tête de ligne, la regex ne perd rien aujourd\'hui ; l\'écart devient visible dès qu\'elle change') + '.');
report.push('- **Méthodes CL inventoriées à part** (clés de `const CL={...}` et `Object.assign(CL,{...})`) : ce ne sont pas des déclarations de premier niveau, un comptage `nom(` les rate toutes ; leurs références lexicales sont les accès `CL.nom`.');
report.push('- **Références comptées dans tout le dépôt** : fichiers du jeu (AST + chaînes), index.html brut, tests/, tools/, documentation .md, commentaires (plages AST). L\'outil lui-même et tools/reports/ (artefacts générés) sont exclus de la preuve.');
report.push('- **Forme de code exigée** pour qu\'une occurrence prouve un chemin : `nom(`, `CL.nom`, `eval(\'nom\')`, clé de table par chaîne, accès calculé `obj[\'nom\']`. Un mot isolé dans une phrase (étiquette « R », texte français) reste une mention, jamais un chemin. Aucun `window[...]`/`globalThis[...]` n\'existe dans ce dépôt (vérifié) ; les tables d\'écrans (`SCREENS`) enregistrent par identifiant — compté lexicalement.');
report.push('- **Passe transitive** : un aide appelé uniquement par des déclarations elles-mêmes mortes redescend en MORT (' + transitiveFound + ' à ce run).');
report.push('- Limites assumées : pas de suivi d\'alias (`const f=maFonc` — l\'alias, lui, reste visible) ; déclarations dans des blocs conditionnels de premier niveau non inventoriées ; preuve de test cherchée ligne par ligne (un appel coupé entre deux lignes d\'un gabarit de test échapperait au scan) ; **les données (propriétés d\'objets, champs de sauvegarde) sont hors périmètre** — voir §6 pour les témoins, qui sont de ce cas.');
report.push('');
report.push('## 2. Comptes globaux');
report.push('');
report.push(`- Fichiers du jeu scannés : **${gameFiles.length}** (même liste qu'ESLint).`);
report.push(`- Déclarations de premier niveau : **${decls.length}** ; méthodes CL : **${clMethods.length}** ; total inventorié : **${verdicts.length}**.`);
report.push(`- VIVANTES (référence lexicale ou CL.nom) : **${byVerdict.VIVANT.length}** — hors catégories, non listées.`);
report.push(`- **MORT : ${byVerdict.MORT.length}** · **ATTEINT AUTREMENT : ${byVerdict.ATTEINT_AUTREMENT.length}** · **DOUTEUX : ${byVerdict.DOUTEUX.length}**.`);
report.push(`- Candidats du comptage naïf « nom( » (méthode grep conseillée par eslint.config.js) : **${naiveDead.size}** — dont **${naiveRescued.length}** reclassifié(s) par les catégories ATTEINT AUTREMENT/DOUTEUX et **${naiveConfirmedDead.length}** confirmé(s) mort(s) ici.`);
report.push('');
report.push('## 3. MORT — rien ne l\'atteint, par aucun chemin');
report.push('');
report.push('**Aucune suppression n\'est à effectuer sur la base de ce tableau seule.** Plusieurs entrées sont documentées comme conservées volontairement (ancres CAMPTIER_CODE_MORT pour `executeCampTier`, V2-12 pour `standing()`, en-têtes de fichiers pour les autres) : c\'est une décision d\'Anthony, tranche par tranche.');
report.push('');
report.push('| Nom | Type | Déclaration | Pourquoi c\'est sûr |');
report.push('|---|---|---|---|');
report.push(...byVerdict.MORT.map(row));
report.push('');
report.push('## 4. ATTEINT AUTREMENT — faux positifs du comptage naïf');
report.push('');
report.push('Référencé par une chaîne (onclick dans du HTML généré, index.html en ligne, table par nom) — **ne pas supprimer**.');
report.push('');
report.push('| Nom | Type | Déclaration | Preuve |');
report.push('|---|---|---|---|');
report.push(...byVerdict.ATTEINT_AUTREMENT.map(row));
report.push('');
report.push('## 5. DOUTEUX — trancher à la main');
report.push('');
report.push('| Nom | Type | Déclaration | Raison du doute |');
report.push('|---|---|---|---|');
report.push(...byVerdict.DOUTEUX.map(row));
report.push('');
report.push('## 6. Témoins de contrôle (CLAUDE.md §10, ancre CORRECTIF_GUARDPULL_MORT)');
report.push('');
report.push('Les témoins documentés ne sont **pas des déclarations de premier niveau** : ce sont des propriétés d\'objets et des champs de sauvegarde, hors périmètre de cet outil par construction. L\'outil ne peut ni les « retrouver » ni les classer, et le signale plutôt que de publier un faux positif rassurant. Il vérifie et affiche ci-dessous leurs occurrences réelles dans tout le dépôt, et confirme qu\'aucun de ces noms n\'entre dans l\'inventaire des déclarations (§2).');
report.push('');
report.push('| Témoin | Dans l\'inventaire des déclarations ? | Occurrences (tous chemins du dépôt) |');
report.push('|---|---|---|');
for (const w of witnesses) {
  const sites = w.sites.length ? w.sites.slice(0, 8).join(' · ') + (w.sites.length > 8 ? ` (+${w.sites.length - 8})` : '') : 'aucune';
  report.push(`| \`${w.name}\` | ${w.inUniverse ? '**OUI — à investiguer**' : 'non (propriété/champ, hors périmètre)'} | ${sites} |`);
}
report.push('');
report.push('Lecture des témoins : `guardPull` ne porte que son littéral de données et son ancre CORRECTIF_GUARDPULL_MORT (« donnée morte, conservée telle quelle ») — donnée morte **confirmée**. `f.gameMode` reste lu et recopié par state/state-hof.js (affichage et filtre du Panthéon) et documenté par state/state-migration.js — champ d\'anciennes légendes, jamais du code vivant, conforme à CLAUDE.md §10 ; `f.faithNemesisId` et `f.faithTraits` ne subsistent qu\'en commentaires et en migration — données mortes **confirmées**.');
report.push('');
report.push('## 7. Le comptage naïf en comparaison');
report.push('');
report.push(`La méthode « grep -c "nom(" *.js » (celle que eslint.config.js conseille en attendant mieux) déclarerait morts **${naiveDead.size}** noms, dont **${naiveKinds['const'] + naiveKinds['let'] + naiveKinds['var']}** constantes (const/let/var) — le grep « nom( » ne peut jamais voir une constante utilisée, puisque rien ne l'appelle avec des parenthèses. Ce rapport en reclassifie **${naiveRescued.length}** (§4 et §5) et en confirme **${naiveConfirmedDead.length}** (§3)${naiveDead.size - naiveRescued.length - naiveConfirmedDead.length > 0 ? `, les ${naiveDead.size - naiveRescued.length - naiveConfirmedDead.length} restant(s) étant vivant(s) par une référence lexicale (constante lue, fonction passée par identifiant...) que ce grep ne détecte pas` : ''}.`);
report.push(`Et l'inverse — le naïf croit vivants **${mortNotNaive.length}** mort(s) sûrs de ce rapport, parce qu'une mention dans un commentaire ou la documentation contient déjà « nom( » avec des parenthèses${mortNotNaive.length ? ' : ' + mortNotNaive.map((n) => `\`${n}\``).join(', ') + '.' : '.'}`);
report.push('');

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report.join('\n'), 'utf-8');

/* ---- 8) Résumé console --------------------------------------------------- */
console.log('Inventaire du code mort — Cage Legacy (diagnostic, rien n\'est modifié).');
console.log(`Fichiers du jeu : ${gameFiles.length} ; déclarations : ${decls.length} ; méthodes CL : ${clMethods.length}.`);
console.log(`MORT : ${byVerdict.MORT.length} | ATTEINT AUTREMENT : ${byVerdict.ATTEINT_AUTREMENT.length} | DOUTEUX : ${byVerdict.DOUTEUX.length} | vivantes : ${byVerdict.VIVANT.length}.`);
console.log(`Passe transitive : ${transitiveFound} nom(s) redescendu(s) en MORT.`);
console.log(`Comptage naïf « nom( » : ${naiveDead.size} candidats (${naiveKinds['const'] + naiveKinds['let'] + naiveKinds['var']} constantes) — ${naiveRescued.length} reclassifiés, ${naiveConfirmedDead.length} confirmés.`);
console.log(`Écart extraction AST vs colonne 0 (ESLint) : ${astOnlyNames.length} déclaration(s) manquée(s) à la regex.`);
for (const d of astOnlyNames) console.log(`  - ${d.name} (${d.file}:${d.line})`);
console.log('Témoins (hors périmètre, occurrences vérifiées) :');
for (const w of witnesses) console.log(`  - ${w.name} : ${w.sites.length} occurrence(s), hors inventaire des déclarations : ${!w.inUniverse}`);
console.log(`Rapport écrit : ${path.relative(ROOT, REPORT_PATH)}`);
