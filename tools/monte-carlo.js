"use strict";
/* CAGE LEGACY — tools/monte-carlo.js
   ============================================================================
   Harnais Monte-Carlo (P1 — équilibrage forme/moral). Charge le VRAI jeu dans
   un DOM virtuel (jsdom), dans l'ordre EXACT des <script src> d'index.html —
   lu directement depuis le fichier à chaque exécution, jamais une liste
   recopiée à la main (même principe que tests/helpers/loadGame.js, mais un
   fichier autonome : tools/ ne dépend pas de tests/, comme tools/lint-
   content.js déjà en place).

   Simule N carrières complètes (amateur -> pro -> retraite), pilotées par une
   politique déterministe et seedée : à chaque écran, le PREMIER onclick
   disponible et pas encore essayé sur cet écran est cliqué (même politique
   que tests/helpers/playthrough.js#clickThrough, déjà validée par la suite
   de tests sur des carrières complètes). Le hasard du jeu passe exclusivement
   par rnd() (SEED interne d'engine.js), jamais Math.random() — chaque
   carrière i utilise setSeed(seedDeBase + i), donc un run est intégralement
   reproductible pour un même --seed/--runs.

   Ne modifie AUCUNE valeur d'équilibrage : lit uniquement l'état du jeu et
   quelques fonctions internes exposées en lecture seule (clamp/d20/
   softCapDelta/setSeed, cf. bridge ci-dessous) pour mesurer précisément ce
   que le jeu a réellement appliqué, jamais pour le piloter.

   Usage :
     node tools/monte-carlo.js [--runs=N] [--seed=S] [--maxFights=N] [--quiet]

   Sortie : tools/reports/monte-carlo-<horodatage>.{txt,json} + une copie
   tools/reports/latest.{txt,json} (écrasée à chaque run, pour un diff rapide
   entre deux exécutions). tools/reports/ est ignoré par git (.gitignore) —
   ce sont des mesures locales, jamais des livrables versionnés.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { runs: 30, seed: 1, maxFights: 70, maxSteps: 120000, quiet: false };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key = m[1], val = m[2];
    if(key === 'runs') out.runs = Math.max(1, parseInt(val, 10) || out.runs);
    else if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'maxFights') out.maxFights = Math.max(1, parseInt(val, 10) || out.maxFights);
    else if(key === 'maxSteps') out.maxSteps = Math.max(1000, parseInt(val, 10) || out.maxSteps);
  }
  return out;
}

/* --------------------------- 2) chargement du jeu -------------------------- */
/** Lit index.html et retourne la liste des <script src="..."> dans l'ordre
 * d'apparition — seule source de vérité sur l'ordre de chargement réel
 * (CLAUDE.md §3). @returns {string[]} */
function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = [];
  let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html — impossible de déterminer l\'ordre de chargement réel.');
  return files;
}

/** Crée une fenêtre jsdom neuve avec le vrai jeu chargé, plus un pont en
 * LECTURE SEULE (`window.__mc`) vers quelques fonctions/constantes internes
 * (clamp/d20/softCapDelta/setSeed/ATTR_KEYS/TRAIN/CAMP_TIERS/ORGS/ALL_ATTR)
 * — mêmes bindings de haut niveau que le jeu utilise réellement (pas une
 * copie parallèle des formules), exposés pour permettre au harnais de
 * recalculer *a posteriori* ce que le jeu a appliqué, jamais pour le piloter
 * ou le modifier. Reprend les stubs DOM/Canvas/localStorage de
 * tests/helpers/loadGame.js — nécessaires pour que render()/startArena() ne
 * plantent pas hors navigateur. @returns {import('jsdom').DOMWindow} */
function newGameWindow(){
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const window = dom.window;
  const document = window.document;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  const store = new Map();
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: k => { store.delete(k); },
    clear: () => { store.clear(); },
  }});
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
    // main.js EST chargé (contrairement à tests/helpers/loadGame.js par défaut) :
    // il initialise G={screen:'title',...} sans créer de combattant — condition
    // requise par CL.newCareer() (ui-08), qui lit G.theme avant de réinitialiser
    // G. On pilote ensuite nous-mêmes CL.newCareer()/create(), jamais l'auto-
    // démarrage d'un combattant (main.js ne fait que poser l'écran titre).
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = code;
    document.body.appendChild(scriptEl);
  }
  const bridge = document.createElement('script');
  bridge.textContent = [
    "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});",
    "window.__mc = { clamp:clamp, d20:d20, softCapDelta:softCapDelta, setSeed:setSeed,",
    "  ATTR_KEYS:ATTR_KEYS, ALL_ATTR:ALL_ATTR, TRAIN:TRAIN, CAMP_TIERS:CAMP_TIERS, ORGS:ORGS };",
  ].join('\n');
  document.body.appendChild(bridge);
  return window;
}

/* --------------------------- 3) politique de jeu --------------------------- */
/** Extrait tous les onclick="..." du HTML actuellement rendu, dans l'ordre
 * d'apparition — même extraction que tests/helpers/playthrough.js. */
function allOnclicks(win){
  const app = win.document.getElementById('app');
  if(!app) return [];
  const html = app.innerHTML.replace(/<span class="eyebrow x"[^>]*>.*?<\/span>/g, '');
  const re = /onclick="([^"]+)"/g;
  const out = [];
  let m;
  while((m = re.exec(html))) out.push(m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  return out;
}

/** Capture tout le contexte nécessaire pour reconstituer *a posteriori* ce
 * qu'un choix d'entraînement (CL.train(idx)) va appliquer : l'option
 * choisie, le palier de camp actif, et un instantané des champs du
 * combattant qui bornent le gain (potentiel/maxAttrs/agedCeilings). */
function captureCampContext(win, idx){
  const f = win.G.f;
  const opt = win.G.train[idx];
  const tierId = win.G.selectedCampTier || 'gratuit';
  const tier = win.__mc.CAMP_TIERS.find(t => t.id === tierId) || win.__mc.CAMP_TIERS[0];
  const canAffordTier = tierId === 'gratuit' || (f.earnings || 0) >= tier.cost;
  return {
    opt, tierId, tier, canAffordTier,
    before: {
      form: f.form, morale: f.morale,
      attrs: Object.assign({}, f.attrs),
      potential: f.potential,
      maxAttrs: f.maxAttrs ? Object.assign({}, f.maxAttrs) : null,
      agedCeilings: f.agedCeilings ? Object.assign({}, f.agedCeilings) : null,
      injury: !!f.injury,
      mentorStat: f._mentorMainStat || null,
    },
  };
}

/* --------------------------- 4) mesures : camp/entraînement ---------------- */
/** Reconstitue, pour chaque attribut/forme/moral touché par le choix
 * d'entraînement joué, le delta INTENTIONNEL (avant tout écrêtage) et le
 * delta RÉELLEMENT observé, puis pousse le résultat dans l'accumulateur.
 * Pour les attributs, décompose la perte en 3 étages (softCapDelta / plafond
 * de déclin par l'âge / clamp final), dans l'ordre exact d'applyDeltas()
 * (engine-progression.js) — deux étages appellent la VRAIE fonction du jeu
 * (softCapDelta/clamp, exposées en lecture seule via __mc), le 3ᵉ
 * (agedCeilings) reproduit la formule d'une seule ligne d'applyDeltas()
 * (engine-progression.js:178) ; un garde-fou compare le résultat recalculé
 * à la valeur réellement observée et journalise un écart (jamais silencieux
 * — cf. warnings). */
function recordCampResult(win, ctx, acc){
  const f = win.G.f;
  const { opt, tierId, tier, canAffordTier, before } = ctx;
  const paidTierApplied = tierId !== 'gratuit' && canAffordTier;
  const injuryHappened = !before.injury && !!f.injury;
  const deltas = opt.d.slice();
  if(before.mentorStat && before.attrs[before.mentorStat] !== undefined) deltas.push([before.mentorStat, 2]);

  for(const [key, dv0] of deltas){
    if(key === 'form' || key === 'morale'){
      const beforeVal = before[key];
      const dv = dv0 !== 0 ? Math.sign(dv0) * Math.max(5, Math.round(Math.abs(dv0) / 5) * 5) : 0;
      let extra = 0;
      if(paidTierApplied && tier.buff && tier.buff[key]) extra = tier.buff[key];
      if(!paidTierApplied && injuryHappened) extra += (key === 'form' ? -15 : -10);
      const intendedDelta = dv + extra;
      const observedDelta = f[key] - beforeVal;
      acc.formMoraleCampLoss[key].push({ before: beforeVal, intendedDelta, observedDelta });
      continue;
    }
    const b = before.attrs[key];
    if(b === undefined) continue;
    const ceiling = (before.maxAttrs && before.maxAttrs[key] != null) ? before.maxAttrs[key] : before.potential + 4;
    const afterSoftcap = dv0 > 0 ? win.__mc.softCapDelta(b, dv0, ceiling) : b + dv0;
    const agedCeiling = before.agedCeilings ? before.agedCeilings[key] : null;
    /* Formule à un étage, mirroir exact d'engine-progression.js:178 (jamais
       modifiée dans le jeu réel — un mur dur assumé, cf. ANCRE
       PLAFOND_DECLIN_VIEILLESSE) : */
    const afterAged = (dv0 > 0 && agedCeiling != null) ? Math.min(afterSoftcap, Math.max(b, agedCeiling)) : afterSoftcap;
    const afterClampTheoretical = win.__mc.clamp(afterAged, 1, 100);
    const observed = f.attrs[key];
    if(Math.abs(afterClampTheoretical - observed) > 0.01){
      acc.warnings.push(`[camp] reconstruction divergente pour "${key}" (before=${b}, dv0=${dv0}) : attendu ${afterClampTheoretical}, observé ${observed}`);
    }
    if(!acc.attrCampLoss[key]) acc.attrCampLoss[key] = { softcapLoss: [], agedCeilingLoss: [], clampLoss: [], nAgedCeilingActive: 0 };
    const bucket = acc.attrCampLoss[key];
    bucket.softcapLoss.push(dv0 > 0 ? Math.max(0, (b + dv0) - afterSoftcap) : 0);
    bucket.agedCeilingLoss.push(Math.max(0, afterSoftcap - afterAged));
    bucket.clampLoss.push(Math.max(0, afterAged - observed));
    if(dv0 > 0 && agedCeiling != null) bucket.nAgedCeilingActive++;
  }
}

/* --------------------------- 5) mesures : combats --------------------------- */
const FIGHT_DELTA_RANGES = {
  /* Bornes RI(a,b) lues telles quelles dans engine-combat.js#applyResult au
     moment de la rédaction (win: RI(6,12) moral / RI(3,8) forme ; loss:
     -RI(8,16) moral / -RI(5,12) forme ; draw: RI(-2,2) moral / forme
     inchangée) — sert uniquement à afficher l'espérance THÉORIQUE non
     écrêtée en regard du delta réellement observé (mesure statistique, cf.
     README/rapport ; pas une lecture directe des tirages réels, impossible
     depuis l'extérieur sans intercepter rnd() — cf. tools/monte-carlo.js
     en-tête de fichier / rapport §méthodologie). */
  morale: { win: [6, 12], loss: [-16, -8], draw: [-2, 2] },
  form: { win: [3, 8], loss: [-12, -5], draw: [0, 0] },
};
function methodBucket(method, res){
  if(res === 'draw') return 'DRAW';
  if(method && method.startsWith('KO')) return 'KO';
  if(method && method.startsWith('Soum')) return 'SUB';
  return 'DEC';
}
function recordFightResult(win, formBefore, moraleBefore, acc){
  const f = win.G.f;
  const last = f.history[f.history.length - 1];
  const res = last.res; // 'win'|'loss'|'draw'
  const org = f.org;

  acc.formBeforeFight.push(formBefore);
  acc.moraleBeforeFight.push(moraleBefore);
  if(!acc.attrSamples._all) acc.attrSamples._all = true;
  for(const k of win.__mc.ATTR_KEYS){
    if(!acc.attrSamples[k]) acc.attrSamples[k] = [];
    const v = f.attrs[k];
    if(typeof v === 'number') acc.attrSamples[k].push(v);
  }

  const d20Form = win.__mc.d20(formBefore), d20Morale = win.__mc.d20(moraleBefore);
  if(acc._lastD20Form != null){
    acc.formD20ChangeTotal++; if(d20Form !== acc._lastD20Form) acc.formD20ChangeCount++;
  }
  if(acc._lastD20Morale != null){
    acc.moraleD20ChangeTotal++; if(d20Morale !== acc._lastD20Morale) acc.moraleD20ChangeCount++;
  }
  acc._lastD20Form = d20Form; acc._lastD20Morale = d20Morale;

  const mb = methodBucket(last.method, res);
  acc.methodCounts[mb] = (acc.methodCounts[mb] || 0) + 1;

  if(!acc.orgFightCounts[org]) acc.orgFightCounts[org] = { w: 0, l: 0, d: 0 };
  if(res === 'win') acc.orgFightCounts[org].w++;
  else if(res === 'loss') acc.orgFightCounts[org].l++;
  else acc.orgFightCounts[org].d++;

  acc.fightDeltaBuckets.form[res].push({ before: formBefore, delta: f.form - formBefore });
  acc.fightDeltaBuckets.morale[res].push({ before: moraleBefore, delta: f.morale - moraleBefore });

  if(!acc.ageOverall[f.age]) acc.ageOverall[f.age] = [];
  acc.ageOverall[f.age].push(f.overall);
}

/* --------------------------- 6) une carrière complète ----------------------- */
function makeAccumulator(){
  return {
    careers: [],
    formBeforeFight: [], moraleBeforeFight: [],
    formD20ChangeCount: 0, formD20ChangeTotal: 0,
    moraleD20ChangeCount: 0, moraleD20ChangeTotal: 0,
    _lastD20Form: null, _lastD20Morale: null,
    fightDeltaBuckets: { morale: { win: [], loss: [], draw: [] }, form: { win: [], loss: [], draw: [] } },
    attrSamples: {},
    attrCampLoss: {},
    formMoraleCampLoss: { form: [], morale: [] },
    orgFightCounts: {},
    methodCounts: { KO: 0, SUB: 0, DEC: 0, DRAW: 0 },
    ageOverall: {},
    warnings: [],
  };
}
function playCareer(seed, opts, acc){
  const win = newGameWindow();
  win.__mc.setSeed(seed);
  win.CL.newCareer();
  win.G.draft.first = 'Auto';
  win.CL.create();

  let curScreen = win.G.screen;
  let tried = new Set();
  let steps = 0;
  const t0 = Date.now();

  while(steps < opts.maxSteps){
    const f = win.G.f;
    if(!f || f.retired || win.G.screen === 'gameover') break;
    if((f.history || []).length >= opts.maxFights) break;

    if(win.G.screen !== curScreen){ curScreen = win.G.screen; tried = new Set(); }
    const actions = allOnclicks(win);
    const action = actions.find(a => !tried.has(a));
    if(!action) break;

    const screenBeforeAction = win.G.screen;
    const historyLenBefore = (f.history || []).length;
    const formBeforeStep = f.form, moraleBeforeStep = f.morale;

    let campCtx = null;
    const trainMatch = /^CL\.train\((\d+)\)$/.exec(action);
    if(screenBeforeAction === 'camp' && trainMatch) campCtx = captureCampContext(win, Number(trainMatch[1]));

    try{
      win.eval(action);
    }catch(e){
      throw new Error(`monte-carlo: échec de "${action}" sur l'écran "${screenBeforeAction}" (seed ${seed}, étape ${steps}) — ${e.message}`);
    }
    steps++;

    if(campCtx) recordCampResult(win, campCtx, acc);
    if((win.G.f.history || []).length > historyLenBefore) recordFightResult(win, formBeforeStep, moraleBeforeStep, acc);

    if(win.G.screen !== curScreen){ curScreen = win.G.screen; tried = new Set(); }
    else tried.add(action);
  }

  const f = win.G.f;
  acc.careers.push({
    seed,
    fights: (f.history || []).length,
    seasons: (win.G.season && win.G.season.year) || 1,
    retireAge: f.age,
    retired: !!f.retired,
    hitCaps: steps >= opts.maxSteps || (f.history || []).length >= opts.maxFights,
    ms: Date.now() - t0,
  });
}

/* --------------------------- 7) statistiques -------------------------------- */
function percentile(sortedArr, p){
  if(!sortedArr.length) return null;
  const idx = (sortedArr.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if(lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}
function distStats(arr){
  if(!arr.length) return null;
  const a = arr.slice().sort((x, y) => x - y);
  return {
    n: a.length, min: a[0], p10: percentile(a, 0.10), median: percentile(a, 0.5),
    p90: percentile(a, 0.90), max: a[a.length - 1],
    mean: a.reduce((s, x) => s + x, 0) / a.length,
  };
}
function pct(n, d){ return d > 0 ? (100 * n / d) : null; }
function mean(arr){ return arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null; }

/** Regroupe fightDeltaBuckets[stat][res] par tranche de "before" (loin du
 * plafond / près du plafond ou du plancher) pour montrer la compression du
 * delta réel par rapport à l'espérance théorique RI(a,b) du code source. */
function deltaCompressionTable(stat){
  const ranges = FIGHT_DELTA_RANGES[stat];
  const out = {};
  for(const res of ['win', 'loss', 'draw']){
    const theoretical = ranges[res];
    const theoreticalMean = (theoretical[0] + theoretical[1]) / 2;
    out[res] = { theoreticalMean, buckets: {} };
  }
  return { ranges, out };
}
function buildFightDeltaReport(acc, stat){
  const { ranges } = FIGHT_DELTA_RANGES[stat] ? { ranges: FIGHT_DELTA_RANGES[stat] } : { ranges: null };
  const report = {};
  for(const res of ['win', 'loss', 'draw']){
    const pts = acc.fightDeltaBuckets[stat][res];
    const theoreticalRange = FIGHT_DELTA_RANGES[stat][res];
    const theoreticalMean = (theoreticalRange[0] + theoreticalRange[1]) / 2;
    const nearCeiling = pts.filter(p => p.before >= 90);
    const midRange = pts.filter(p => p.before >= 40 && p.before < 90);
    const nearFloor = pts.filter(p => p.before < 40);
    report[res] = {
      n: pts.length,
      theoreticalMean,
      observedMeanDelta: mean(pts.map(p => p.delta)),
      observedMeanDelta_before_ge90: mean(nearCeiling.map(p => p.delta)),
      observedMeanDelta_before_40_90: mean(midRange.map(p => p.delta)),
      observedMeanDelta_before_lt40: mean(nearFloor.map(p => p.delta)),
      n_before_ge90: nearCeiling.length,
    };
  }
  return report;
}

function buildAttrReport(acc){
  const out = {};
  for(const key of Object.keys(acc.attrSamples)){
    if(key === '_all') continue;
    const samples = acc.attrSamples[key];
    const dist = distStats(samples);
    const lossBucket = acc.attrCampLoss[key];
    out[key] = {
      dist,
      pctTimeAtCeiling95: dist ? pct(samples.filter(v => v >= 95).length, samples.length) : null,
      trainingActions: lossBucket ? lossBucket.softcapLoss.length : 0,
      avgSoftcapLoss: lossBucket ? mean(lossBucket.softcapLoss) : null,
      avgAgedCeilingLoss: lossBucket ? mean(lossBucket.agedCeilingLoss) : null,
      avgClampLoss: lossBucket ? mean(lossBucket.clampLoss) : null,
      nAgedCeilingActive: lossBucket ? lossBucket.nAgedCeilingActive : 0,
    };
  }
  return out;
}

function buildFormMoraleCampLossReport(acc){
  const out = {};
  for(const key of ['form', 'morale']){
    const pts = acc.formMoraleCampLoss[key];
    const gains = pts.filter(p => p.intendedDelta > 0);
    const drops = pts.filter(p => p.intendedDelta < 0);
    out[key] = {
      nActions: pts.length,
      avgIntendedDelta: mean(pts.map(p => p.intendedDelta)),
      avgObservedDelta: mean(pts.map(p => p.observedDelta)),
      onGains: {
        n: gains.length,
        avgIntended: mean(gains.map(p => p.intendedDelta)),
        avgObserved: mean(gains.map(p => p.observedDelta)),
        avgCeilingLoss: mean(gains.map(p => Math.max(0, p.intendedDelta - p.observedDelta))),
        pctClamped: pct(gains.filter(p => (p.intendedDelta - p.observedDelta) > 0.01).length, gains.length),
      },
      onDrops: {
        n: drops.length,
        avgIntended: mean(drops.map(p => p.intendedDelta)),
        avgObserved: mean(drops.map(p => p.observedDelta)),
        avgFloorCushion: mean(drops.map(p => Math.max(0, p.observedDelta - p.intendedDelta))),
        pctClamped: pct(drops.filter(p => (p.observedDelta - p.intendedDelta) > 0.01).length, drops.length),
      },
    };
  }
  return out;
}

function buildReport(acc, opts){
  const orgReport = {};
  for(const orgIdx of Object.keys(acc.orgFightCounts)){
    const c = acc.orgFightCounts[orgIdx];
    const total = c.w + c.l + c.d;
    orgReport[orgIdx] = { name: null, w: c.w, l: c.l, d: c.d, total, winRate: pct(c.w, total) };
  }
  const ageOverallReport = {};
  for(const age of Object.keys(acc.ageOverall)) ageOverallReport[age] = mean(acc.ageOverall[age]);

  const totalFightsAllCareers = acc.careers.reduce((s, c) => s + c.fights, 0);
  const methodTotal = Object.values(acc.methodCounts).reduce((s, x) => s + x, 0);

  return {
    meta: { runs: opts.runs, seedBase: opts.seed, maxFights: opts.maxFights, generatedAt: new Date().toISOString() },
    careerLength: {
      fights: distStats(acc.careers.map(c => c.fights)),
      seasons: distStats(acc.careers.map(c => c.seasons)),
      retireAge: distStats(acc.careers.map(c => c.retireAge)),
      pctRetiredNaturally: pct(acc.careers.filter(c => c.retired).length, acc.careers.length),
      pctHitSafetyCap: pct(acc.careers.filter(c => c.hitCaps && !c.retired).length, acc.careers.length),
    },
    formMorale: {
      form: {
        dist: distStats(acc.formBeforeFight),
        pctAtCeiling95: pct(acc.formBeforeFight.filter(v => v >= 95).length, acc.formBeforeFight.length),
        pctDisplayChangesBetweenFights: pct(acc.formD20ChangeCount, acc.formD20ChangeTotal),
      },
      morale: {
        dist: distStats(acc.moraleBeforeFight),
        pctAtCeiling95: pct(acc.moraleBeforeFight.filter(v => v >= 95).length, acc.moraleBeforeFight.length),
        pctDisplayChangesBetweenFights: pct(acc.moraleD20ChangeCount, acc.moraleD20ChangeTotal),
      },
    },
    campLossFormMorale: buildFormMoraleCampLossReport(acc),
    fightDeltaCompression: { form: buildFightDeltaReport(acc, 'form'), morale: buildFightDeltaReport(acc, 'morale') },
    attributes: buildAttrReport(acc),
    methodDistribution: {
      counts: acc.methodCounts, total: methodTotal,
      pct: Object.fromEntries(Object.entries(acc.methodCounts).map(([k, v]) => [k, pct(v, methodTotal)])),
      realWorldReference: 'Ordre de grandeur MMA pro agrégé (toutes fédérations confondues, sources publiques) : ~45% décision, ~40% KO/TKO, ~15% soumission — comparaison indicative, pas une cible officielle du jeu.',
    },
    winRateByOrg: orgReport,
    overallByAge: ageOverallReport,
    totalFightsSimulated: totalFightsAllCareers,
    warnings: acc.warnings,
  };
}

/* --------------------------- 8) rendu texte --------------------------------- */
function fmt(n, d){ return (n == null || isNaN(n)) ? 'n/a' : n.toFixed(d == null ? 1 : d); }
function distLine(d){ return d ? `min=${fmt(d.min)} p10=${fmt(d.p10)} médiane=${fmt(d.median)} p90=${fmt(d.p90)} max=${fmt(d.max)} moyenne=${fmt(d.mean)} (n=${d.n})` : 'n/a'; }

function renderText(report){
  const L = [];
  const push = s => L.push(s);
  push(`=== CAGE LEGACY — RAPPORT MONTE-CARLO ===`);
  push(`Généré : ${report.meta.generatedAt}`);
  push(`Carrières simulées : ${report.meta.runs} (seed de base ${report.meta.seedBase}, plafond ${report.meta.maxFights} combats/carrière)`);
  push(`Total combats simulés : ${report.totalFightsSimulated}`);
  push('');
  push('--- Durée de carrière ---');
  push(`Combats/carrière : ${distLine(report.careerLength.fights)}`);
  push(`Saisons/carrière : ${distLine(report.careerLength.seasons)}`);
  push(`Âge de retraite   : ${distLine(report.careerLength.retireAge)}`);
  push(`% carrières terminées par retraite naturelle : ${fmt(report.careerLength.pctRetiredNaturally)}%`);
  push(`% carrières arrêtées par le plafond de sécurité du harnais (pas une vraie fin) : ${fmt(report.careerLength.pctHitSafetyCap)}%`);
  push('');
  push('--- Forme & Moral : plafond et visibilité ---');
  for(const key of ['form', 'morale']){
    const s = report.formMorale[key];
    push(`${key.toUpperCase()} — distribution (0-100, valeur juste avant chaque combat) : ${distLine(s.dist)}`);
    push(`${key.toUpperCase()} — % de combats avec valeur >= 95 (plafond) : ${fmt(s.pctAtCeiling95)}%`);
    push(`${key.toUpperCase()} — % de combats où l'affichage /20 change vs le combat précédent : ${fmt(s.pctDisplayChangesBetweenFights)}%`);
  }
  push('');
  push('--- Forme & Moral : points perdus au clamp() pendant les camps d\'entraînement ---');
  push('(mesure EXACTE : delta intentionnel reconstruit depuis TRAIN[].d + palier de camp/blessure réels vs delta réellement observé)');
  for(const key of ['form', 'morale']){
    const r = report.campLossFormMorale[key];
    push(`${key.toUpperCase()} — ${r.nActions} actions de camp mesurées. Delta intentionnel moyen ${fmt(r.avgIntendedDelta)}, delta réel moyen ${fmt(r.avgObservedDelta)}.`);
    push(`  Gains (${r.onGains.n} actions) : intentionnel moy. ${fmt(r.onGains.avgIntended)}, réel moy. ${fmt(r.onGains.avgObserved)}, perte moy. au clamp ${fmt(r.onGains.avgCeilingLoss)} (écrêté dans ${fmt(r.onGains.pctClamped)}% des cas)`);
    push(`  Baisses (${r.onDrops.n} actions) : intentionnel moy. ${fmt(r.onDrops.avgIntended)}, réel moy. ${fmt(r.onDrops.avgObserved)}, coussin moy. au plancher ${fmt(r.onDrops.avgFloorCushion)} (écrêté dans ${fmt(r.onDrops.pctClamped)}% des cas)`);
  }
  push('');
  push('--- Forme & Moral : compression des deltas de combat (estimation statistique) ---');
  push('(les deltas de fin de combat sont tirés au hasard par RI(a,b) dans engine-combat.js — pas de mesure exacte possible depuis l\'extérieur du moteur sans intercepter rnd() ; ce tableau compare l\'espérance théorique de RI(a,b), lue dans le code source, au delta MOYEN réellement observé, par tranche de valeur de départ)');
  for(const stat of ['form', 'morale']){
    push(`${stat.toUpperCase()} :`);
    for(const res of ['win', 'loss', 'draw']){
      const r = report.fightDeltaCompression[stat][res];
      push(`  ${res.padEnd(5)} (n=${r.n}) — théorique E[delta]=${fmt(r.theoreticalMean)} | observé global=${fmt(r.observedMeanDelta)} | avant<40=${fmt(r.observedMeanDelta_before_lt40)} | avant 40-90=${fmt(r.observedMeanDelta_before_40_90)} | avant>=90=${fmt(r.observedMeanDelta_before_ge90)} (n=${r.n_before_ge90})`);
    }
  }
  push('');
  push('--- Attributs : saturation et pertes de progression ---');
  const attrKeys = Object.keys(report.attributes).sort((a, b) => (report.attributes[b].pctTimeAtCeiling95 || 0) - (report.attributes[a].pctTimeAtCeiling95 || 0));
  for(const key of attrKeys){
    const a = report.attributes[key];
    push(`${key.padEnd(14)} plafond95=${fmt(a.pctTimeAtCeiling95)}%  dist:[${fmt(a.dist && a.dist.min, 0)}..${fmt(a.dist && a.dist.max, 0)}] médiane=${fmt(a.dist && a.dist.median, 0)}  pertes/action: softcap=${fmt(a.avgSoftcapLoss)} agedCeiling=${fmt(a.avgAgedCeilingLoss)} clamp=${fmt(a.avgClampLoss)}  (${a.trainingActions} actions, dont ${a.nAgedCeilingActive} sous plafond d'âge)`);
  }
  push('');
  push('--- Méthodes de fin de combat ---');
  for(const k of ['KO', 'SUB', 'DEC', 'DRAW']){
    push(`${k.padEnd(4)} : ${report.methodDistribution.counts[k] || 0} (${fmt(report.methodDistribution.pct[k])}%)`);
  }
  push(report.methodDistribution.realWorldReference);
  push('');
  push('--- Taux de victoire par palier d\'organisation ---');
  for(const orgIdx of Object.keys(report.winRateByOrg).sort((a, b) => a - b)){
    const o = report.winRateByOrg[orgIdx];
    push(`org #${orgIdx} : ${o.w}V-${o.l}D-${o.d}N sur ${o.total} combats — taux de victoire ${fmt(o.winRate)}%`);
  }
  push('');
  push('--- Progression d\'overall en fonction de l\'âge ---');
  const ages = Object.keys(report.overallByAge).map(Number).sort((a, b) => a - b);
  for(const age of ages) push(`âge ${age} : overall moyen ${fmt(report.overallByAge[age], 1)}`);
  if(report.warnings.length){
    push('');
    push(`--- Avertissements de reconstruction (${report.warnings.length}) — divergence entre le calcul du harnais et l'état réel observé ---`);
    report.warnings.slice(0, 40).forEach(w => push(`  ${w}`));
    if(report.warnings.length > 40) push(`  ... et ${report.warnings.length - 40} de plus`);
  }
  return L.join('\n') + '\n';
}

/* --------------------------- 9) main ---------------------------------------- */
function main(){
  const opts = parseArgs(process.argv.slice(2));
  const acc = makeAccumulator();
  const t0 = Date.now();
  for(let i = 0; i < opts.runs; i++){
    const seed = opts.seed + i;
    playCareer(seed, opts, acc);
    if(!opts.quiet && ((i + 1) % Math.max(1, Math.round(opts.runs / 20)) === 0 || i === opts.runs - 1)){
      const last = acc.careers[acc.careers.length - 1];
      process.stderr.write(`  [${i + 1}/${opts.runs}] seed=${seed} combats=${last.fights} saisons=${last.seasons} âge_retraite=${last.retireAge} retraite=${last.retired} (${last.ms}ms)\n`);
    }
  }
  const report = buildReport(acc, opts);
  const elapsedMs = Date.now() - t0;
  process.stderr.write(`Terminé en ${(elapsedMs / 1000).toFixed(1)}s.\n`);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const txt = renderText(report);
  const jsonStr = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(REPORTS_DIR, `monte-carlo-${stamp}.txt`), txt);
  fs.writeFileSync(path.join(REPORTS_DIR, `monte-carlo-${stamp}.json`), jsonStr);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.txt'), txt);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), jsonStr);
  process.stdout.write(txt);
  process.stderr.write(`\nRapport écrit dans tools/reports/monte-carlo-${stamp}.{txt,json} (et latest.{txt,json}).\n`);
}

main();
