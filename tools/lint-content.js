"use strict";
/* CAGE LEGACY — tools/lint-content.js
   Linter de contenu narratif, Plan V3 LOT 0 §6.3. Vérifie les "Lois" du
   document sur le texte visible par le joueur :

     - Loi 6 (limpidité) : pas plus de 2 phrases / 30 mots par chaîne de
       choix visible. Le scan porte sur TOUTE chaîne littérale >=40 caractères
       des fichiers de contenu (pas seulement les libellés de choix stricto
       sensu — les distinguer demanderait de connaître la forme de chaque
       pool, qui varie) : un texte narratif un peu long remonte donc aussi
       ici, à trier par lecture humaine plutôt qu'à corriger aveuglément.
     - anglicisme non traduit (ex. "BOUT", trouvé et documenté dans le Plan
       V3 lui-même à ui-01:654 — LOT 6/P09 le corrige, ce linter le SIGNALE).
     - taille de pool vs Loi 4 (pool >= 4x occurrences/carrière attendues),
       entrée sans `req` dans un pool à haute fréquence, entrée sans jeton de
       contexte : ces trois checks portent sur TEXT_POOLS (engine.js,
       registerTextPool()) — le registre RUNTIME du moteur de texte construit
       en LOT 0 (§4.2). Aucun pool de contenu n'y est encore inscrit : la
       migration se fait lot par lot (LOT 4/5/6/7, chacun sur ses propres
       écrans), donc ces trois checks ne rapportent rien tant qu'aucun pool
       n'est migré — c'est attendu, pas un bug de ce linter.

   Outil de SIGNALEMENT, jamais bloquant par défaut (beaucoup des chaînes
   scannées ici précèdent ce Plan V3 et seront corrigées lot par lot, pas
   toutes d'un coup) : code de sortie 0 sauf avec --strict, où toute
   violation fait échouer (utile pour un audit ponctuel avant release, pas
   pour `npm test` qui doit rester vert pendant que les lots avancent). */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STRICT = process.argv.includes('--strict');

/* ---- 1) Anglicismes ------------------------------------------------- */
// Liste volontairement courte et ciblée (pas un dictionnaire général) :
// chaque entrée est un terme identifié dans le Plan V3 comme un anglicisme
// resté non traduit dans le vocabulaire MMA francophone du jeu.
const ANGLICISMS = [
  { term: 'BOUT', re: /\bBOUT\b/, note: 'terme anglais non traduit — "POIDS LOURDS · 3 REPRISES" ou "· 3 ROUNDS" (Plan V3 LOT 6/P09, ui-01:654 déjà identifié).' },
  { term: 'MAIN EVENT', re: /\bMAIN EVENT\b/i, note: 'à remplacer par une carte complète de 5-8 combats (Plan V3 LOT 6/P18).' },
];
const ANGLICISM_FILES = ['ui-01-roster-matchmaking.js','ui-04-faith-arcade-screens.js','data-faith-content.js','data-people.js','ui-07-contracts-legacy-screens.js'];

function lintAnglicisms(){
  const findings = [];
  for(const file of ANGLICISM_FILES){
    const fp = path.join(ROOT, file);
    if(!fs.existsSync(fp)) continue;
    const lines = fs.readFileSync(fp,'utf8').split('\n');
    lines.forEach((line, i) => {
      for(const a of ANGLICISMS){
        if(a.re.test(line)) findings.push({ file, line: i+1, term: a.term, note: a.note, text: line.trim().slice(0,120) });
      }
    });
  }
  return findings;
}

/* ---- 2) Loi 6 : phrases visibles trop longues ------------------------ */
// Extraction volontairement simple (regex, pas un vrai parseur JS) : toute
// chaîne littérale '...'/"..."/`...` de plus de 40 caractères est candidate.
// Les gabarits HTML (contiennent '<') sont exclus — ce sont des fragments de
// mise en page, pas des phrases lues d'un bloc par le joueur.
const SENTENCE_FILES = ['data-faith-content.js','data-people.js'];
/** Tokenizer minimal (pas un vrai parseur JS, mais respecte les
 * commentaires /* *​/ et //, contrairement à une regex naïve sur les
 * guillemets) : sans ça, une apostrophe dans un commentaire en français
 * ("l'ancienne...") est prise pour le début d'une chaîne et produit des
 * extraits absurdes qui noient les vrais signalements. */
function extractStringLiterals(src){
  const out = [];
  let i = 0, line = 1;
  const n = src.length;
  while(i < n){
    const c = src[i], c2 = src[i+1];
    if(c === '\n'){ line++; i++; continue; }
    if(c === '/' && c2 === '/'){ while(i<n && src[i]!=='\n') i++; continue; }
    if(c === '/' && c2 === '*'){ i+=2; while(i<n && !(src[i]==='*'&&src[i+1]==='/')){ if(src[i]==='\n') line++; i++; } i+=2; continue; }
    if(c === "'" || c === '"' || c === '`'){
      const quote = c; const startLine = line; let j = i+1; let buf = '';
      while(j < n && src[j] !== quote){
        if(src[j] === '\\'){
          const esc = src[j+1];
          if(esc === 'u'){ buf += '’'; j += 6; continue; } // \uXXXX : traité comme une apostrophe typographique (usage quasi exclusif dans ce projet, cf. grep) — évite de faire fuiter les 4 chiffres hex dans le texte
          if(esc === 'n'){ buf += ' '; j += 2; continue; }
          buf += esc||''; j += 2; continue;
        }
        if(src[j] === '\n') line++;
        buf += src[j]; j++;
      }
      out.push({ line: startLine, text: buf });
      i = j+1; continue;
    }
    i++;
  }
  return out;
}
function countSentences(text){
  const parts = text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  return parts.length || (text.trim() ? 1 : 0);
}
function countWords(text){
  return (text.trim().match(/\S+/g) || []).length;
}
function lintSentenceLength(){
  const findings = [];
  for(const file of SENTENCE_FILES){
    const fp = path.join(ROOT, file);
    if(!fs.existsSync(fp)) continue;
    const src = fs.readFileSync(fp,'utf8');
    for(const lit of extractStringLiterals(src)){
      const t = lit.text;
      if(t.length < 40 || t.includes('<') || t.includes('http') || /^[a-z0-9_.-]+$/i.test(t)) continue; // trop court, HTML, id technique
      const words = countWords(t);
      const sentences = countSentences(t);
      if(words > 30 || sentences > 2){
        findings.push({ file, line: lit.line, words, sentences, text: t.slice(0,140) });
      }
    }
  }
  return findings;
}

/* ---- 3) Pools TEXT_POOLS (moteur de texte, engine.js §4.2) ---------- */
function lintTextPools(){
  // Charge engine.js dans un contexte minimal pour lire TEXT_POOLS tel
  // qu'enregistré par les fichiers qui appellent registerTextPool() —
  // aujourd'hui aucun, cf. en-tête. Un require() direct suffit : ce fichier
  // ne dépend que de littéraux au niveau module (aucun DOM).
  const vm = require('vm');
  const sandbox = { console, module:{exports:{}}, require, __dirname: ROOT };
  vm.createContext(sandbox);
  try{
    const src = fs.readFileSync(path.join(ROOT,'engine.js'),'utf8');
    // engine.js référence des globales définies ailleurs (SKILLS, ORIGINS...) ;
    // on n'a besoin que de TEXT_POOLS/registerTextPool, donc on exécute
    // seulement ce bloc si les dépendances manquent — repli silencieux.
    vm.runInContext(src, sandbox, { filename: 'engine.js' });
  }catch(e){
    return { skipped: true, reason: e.message, sizeFindings: [], reqFindings: [], contextFindings: [] };
  }
  const TEXT_POOLS = sandbox.TEXT_POOLS || {};
  const poolIds = Object.keys(TEXT_POOLS);
  const sizeFindings = [], reqFindings = [], contextFindings = [];
  for(const id of poolIds){
    const pool = TEXT_POOLS[id];
    const meta = pool._meta || {};
    if(meta.expectedPerCareer){
      const minSize = 4 * meta.expectedPerCareer; // Loi 4
      if(pool.length < minSize) sizeFindings.push({ poolId: id, size: pool.length, minSize, expectedPerCareer: meta.expectedPerCareer });
    }
    if(meta.highFrequency){
      pool.forEach(e => {
        if(!e.req) reqFindings.push({ poolId: id, entryId: e.id });
        else if(!/ctx\s*\./.test(e.req.toString())) contextFindings.push({ poolId: id, entryId: e.id });
      });
    }
  }
  return { skipped: false, poolCount: poolIds.length, sizeFindings, reqFindings, contextFindings };
}

/* ---- 4) Champs G.f. / G.faith. / G.arcade. écrits mais jamais relus ----
   Ajout Passe 5 : sur les cinq dernières passes de relecture, la famille de
   bugs la plus récurrente du projet n'était pas une logique fausse mais un
   champ d'état écrit quelque part et lu nulle part — un privilège payant qui
   ne fait rien (protect_title/champChampInactivity), un consommable payant
   pareillement mort (cons_shelter/consumableAutobank), une variable laissée
   après un correctif qui l'a rendue inutile (champChampFocus,
   regionalPatron). Quatre trouvés en une seule relecture manuelle : ce que
   ce script automatise.
   Regex volontairement simple (même philosophie que lintSentenceLength
   ci-dessus, pas un vrai parseur JS) : une ÉCRITURE est G.f./G.faith./
   G.arcade. suivi d'un nom de champ puis d'un opérateur d'affectation
   (jamais ==/===, jamais une simple lecture de comparaison). Une LECTURE est
   ensuite recherchée comme n'IMPORTE QUELLE autre occurrence de ce nom de
   champ dans les fichiers scannés — y compris via un alias local
   (`const f=G.f; f.champ`, très courant dans ce code), pas seulement via le
   préfixe G.f./G.faith./G.arcade. lui-même : restreindre la lecture au même
   préfixe raterait la plupart des vraies lectures.
   SIGNALEMENT humain, comme le reste de ce fichier : un nom de champ très
   commun (ex. un champ générique réutilisé par coïncidence ailleurs sous un
   autre alias non reconnu par ce scan) peut ne pas remonter, ou remonter à
   tort si tous ses usages passent par un alias que le scan ne reconnaît pas
   comme une lecture distincte de l'écriture elle-même. À trier par lecture
   humaine, pas à corriger aveuglément. ---- */
const STATE_SCAN_FILES = fs.readdirSync(ROOT)
  .filter(f => /\.js$/.test(f) && f !== 'eslint.config.js')
  .concat(
    fs.existsSync(path.join(ROOT,'state'))
      ? fs.readdirSync(path.join(ROOT,'state')).filter(f => /\.js$/.test(f)).map(f => 'state/'+f)
      : []
  );
/** Repère l'accolade fermante d'une interpolation `${…}` en respectant les
 * guillemets/gabarits imbriqués (un `}` à l'intérieur d'une chaîne ne doit
 * pas compter) — nécessaire car ce dépôt rend presque tout son HTML via
 * d'énormes template literals où `${G.arcade.champ}` EST la lecture réelle
 * qu'on cherche, pas du texte à ignorer. Renvoie l'index de ce `}`.
 * @param {string} src @param {number} start index juste après `${`
 * @returns {number} */
function matchInterpolationEnd(src, start){
  let i = start, depth = 1; const n = src.length;
  while(i < n && depth > 0){
    const c = src[i];
    if(c === '{'){ depth++; i++; continue; }
    if(c === '}'){ depth--; if(depth === 0) break; i++; continue; }
    if(c === "'" || c === '"' || c === '`'){
      const q = c; i++;
      while(i < n && src[i] !== q){ if(src[i] === '\\') i++; i++; }
      i++; continue;
    }
    i++;
  }
  return i;
}
/** Efface le CONTENU des commentaires et chaînes littérales (en préservant
 * les retours à la ligne, pour que les numéros de ligne restent exacts) —
 * sans ça, une ancre qui CITE le nom d'un champ retiré (exactement ce que ce
 * correctif lui-même vient de faire, cf. CORRECTIF_CHAMPCHAMPFOCUS_MORT)
 * se ferait passer pour une écriture ou une lecture réelle. Le texte d'une
 * interpolation `${…}` de template literal, lui, reste du VRAI CODE (voir
 * matchInterpolationEnd ci-dessus) : seule sa partie littérale est effacée. */
function stripCommentsAndStrings(src){
  let out = ''; let i = 0; const n = src.length; let inBlock = false;
  while(i < n){
    const c = src[i], c2 = src[i+1];
    if(inBlock){
      if(c === '*' && c2 === '/'){ inBlock = false; out += '  '; i += 2; continue; }
      out += (c === '\n') ? '\n' : ' '; i++; continue;
    }
    if(c === '/' && c2 === '/'){ while(i < n && src[i] !== '\n'){ out += ' '; i++; } continue; }
    if(c === '/' && c2 === '*'){ inBlock = true; out += '  '; i += 2; continue; }
    if(c === '`'){
      out += ' '; i++;
      while(i < n && src[i] !== '`'){
        if(src[i] === '\\'){ out += '  '; i += 2; continue; }
        if(src[i] === '$' && src[i+1] === '{'){
          const exprEnd = matchInterpolationEnd(src, i+2);
          out += '  ' + src.slice(i+2, exprEnd) + ' ';
          i = Math.min(exprEnd+1, n); continue;
        }
        out += (src[i] === '\n') ? '\n' : ' '; i++;
      }
      if(i < n){ out += ' '; i++; }
      continue;
    }
    if(c === '"' || c === "'"){
      const quote = c; out += ' '; i++;
      while(i < n && src[i] !== quote){
        if(src[i] === '\\'){ out += '  '; i += 2; continue; }
        out += (src[i] === '\n') ? '\n' : ' '; i++;
      }
      if(i < n){ out += ' '; i++; }
      continue;
    }
    out += c; i++;
  }
  return out;
}
function lintDeadStateFields(){
  const writeRe = /\b(G\.f|G\.faith|G\.arcade)\.([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:=(?!=)|\+=|-=|\*=|\/=|\|\|=|&&=|\?\?=)/g;
  const sources = {};
  for(const file of STATE_SCAN_FILES){
    const fp = path.join(ROOT, file);
    if(!fs.existsSync(fp)) continue;
    sources[file] = stripCommentsAndStrings(fs.readFileSync(fp, 'utf8'));
  }
  const writes = new Map(); // nom de champ -> [{file,line,namespace}]
  for(const [file, src] of Object.entries(sources)){
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      let m; writeRe.lastIndex = 0;
      while((m = writeRe.exec(line))){
        const field = m[2];
        if(!writes.has(field)) writes.set(field, []);
        writes.get(field).push({ file, line: i+1, namespace: m[1] });
      }
    });
  }
  const findings = [];
  for(const [field, occs] of writes){
    const fieldRe = new RegExp(`\\.${field}\\b`, 'g');
    let totalUses = 0;
    for(const src of Object.values(sources)){
      const m = src.match(fieldRe);
      if(m) totalUses += m.length;
    }
    if(totalUses <= occs.length) findings.push({ field, writeCount: occs.length, at: occs[0] });
  }
  findings.sort((a,b) => a.field.localeCompare(b.field));
  return findings;
}
/* ==== [FIN ANCRE] ==== */

function main(){
  const angl = lintAnglicisms();
  const sentences = lintSentenceLength();
  const pools = lintTextPools();
  const deadFields = lintDeadStateFields();

  console.log(`=== ANGLICISMES (${angl.length}) ===`);
  angl.forEach(f => console.log(`  ${f.file}:${f.line} — "${f.term}" — ${f.note}\n    ${f.text}`));

  console.log(`\n=== LOI 6 — phrases visibles trop longues (${sentences.length}) ===`);
  sentences.slice(0,40).forEach(f => console.log(`  ${f.file}:${f.line} — ${f.words} mots, ${f.sentences} phrase(s)\n    "${f.text}"`));
  if(sentences.length > 40) console.log(`  ... et ${sentences.length-40} de plus`);

  console.log(`\n=== TEXT_POOLS (moteur §4.2) ===`);
  if(pools.skipped){
    console.log(`  (ignoré : engine.js n'a pas pu être chargé isolément — ${pools.reason})`);
  } else {
    console.log(`  ${pools.poolCount} pool(s) enregistré(s) au runtime.`);
    if(pools.poolCount===0) console.log('  Aucun contenu migré vers TEXT_POOLS pour l’instant (attendu — migration lot par lot, cf. en-tête).');
    pools.sizeFindings.forEach(f => console.log(`  [Loi 4] pool "${f.poolId}" : ${f.size} entrées pour ${f.expectedPerCareer}/carrière attendu (minimum ${f.minSize})`));
    pools.reqFindings.forEach(f => console.log(`  [req manquant] pool "${f.poolId}", entrée "${f.entryId}" (pool à haute fréquence)`));
    pools.contextFindings.forEach(f => console.log(`  [jeton de contexte manquant] pool "${f.poolId}", entrée "${f.entryId}"`));
  }

  console.log(`\n=== CHAMPS G.f./G.faith./G.arcade. écrits mais jamais relus (${deadFields.length}) ===`);
  deadFields.forEach(f => console.log(`  ${f.at.namespace}.${f.field} — écrit ${f.at.file}:${f.at.line}${f.writeCount>1?` (et ${f.writeCount-1} autre(s) site(s))`:''}, jamais relu ailleurs`));

  const totalBlocking = pools.skipped ? 0 : (pools.sizeFindings.length + pools.reqFindings.length + pools.contextFindings.length);
  const total = angl.length + sentences.length + totalBlocking + deadFields.length;
  console.log(`\n${total} signalement(s) au total.`);
  if(STRICT && total > 0){ process.exitCode = 1; }
}

main();
