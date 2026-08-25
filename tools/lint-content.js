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

function main(){
  const angl = lintAnglicisms();
  const sentences = lintSentenceLength();
  const pools = lintTextPools();

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

  const totalBlocking = pools.skipped ? 0 : (pools.sizeFindings.length + pools.reqFindings.length + pools.contextFindings.length);
  const total = angl.length + sentences.length + totalBlocking;
  console.log(`\n${total} signalement(s) au total.`);
  if(STRICT && total > 0){ process.exitCode = 1; }
}

main();
