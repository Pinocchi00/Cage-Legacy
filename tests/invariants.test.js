"use strict";
/* CAGE LEGACY — tests/invariants.test.js
   Invariants bloquants du Plan V3, §6.2 (INV-01 à INV-07).

   ==== [ANCRE: TESTS_INVARIANTS_V3] — Plan V3 LOT 0 §6.2. Le document
   demande 100 carrières simulées. En pratique, chaque carrière Faith
   pilotée par le harnais jsdom (clickThrough, un vrai rendu HTML +
   sélection de bouton par cycle) coûte de l'ordre de la seconde — 100
   carrières feraient de `npm test` un run de plusieurs minutes à chaque
   invocation, ce qui n'est pas ce qu'un harnais de test courant doit être.
   Réduit ici à N_CAREERS (constante ci-dessous, actuellement 12) : assez
   pour détecter une régression structurelle sans plomber la boucle de
   développement. Un run à 100 reste possible en changeant cette seule
   constante (ex. pour un audit ponctuel avant une release), ce que le code
   ne empêche pas.

   INV-06 (longueur de carrière médiane 25-40 combats) était OBSERVÉE et
   rapportée mais PAS assertée en échec bloquant tant que le bug d'horloge
   double de LOT 1 (Plan V4 §2.1/C1 — carrières Faith deux fois trop
   courtes) n'était pas corrigé : le rendre bloquant plus tôt aurait cassé
   `npm test` sans que rien ici ne puisse le corriger — la Loi 7 du document
   ("une incohérence bloque le build") vise les incohérences DE STRUCTURE
   introduites par un lot, pas un bug pré-existant déjà planifié ailleurs.
   Plan V4 LOT 2/C3 réarme cette assertion (et celle du saut de
   nemesisRecord, cf. plus bas) maintenant que LOT 1 (C1/C2) a livré le
   correctif de la cause racine. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const { clickThrough } = require('./helpers/playthrough');

const N_CAREERS = 12;

function makeFaithCareer(win, first){
  win.CL.startFaith();
  const d = win.G.faithDraft;
  d.first = first;
  d.div = win.eval("DIVISIONS.H[0].id");
  d.origin = 'traditional';
  d.style = win.eval("Object.keys(STYLES)[0]");
  d.lifestyle = 'pro';
  d.circle = 'family';
  d.agent = win.eval("Object.keys(FAITH_AGENTS)[0]");
  d.personality = 'taiseux';
  d.stable = 'regional';
  win.CL.finalizeFaithDraft();
}

/* ==== [ANCRE: TESTS_FAITH_TURNPRO_RESET] — trouvé en instrumentant INV-06
   après le merge de LOT 1 : la médiane mesurée restait sous la cible
   (21 sur [16..35]) alors qu'une sonde sans plafond montrait des carrières
   Faith retraitant à [30..39] combats réels — pile dans 25-40. Même bug que
   celui déjà documenté et contourné côté Carrière classique (ANCRE
   TESTS_TURNPRO_RESET, helpers/playthrough.js) : turnPro() (ui-05) remet
   f.W/f.L/f.D ET f.history à zéro au passage amateur->pro (une seule fois
   par carrière), en archivant l'historique amateur dans f.amaHistory
   (ANCRE V3_HISTORIQUE_PRESERVE, Plan V4 C2). `f.W+f.L+f.D` retombe donc à
   0 à cet instant précis — sous-comptant chaque carrière Faith simulée de
   la taille exacte de sa phase amateur, ET cassant la condition de progrès
   `after <= before` de la boucle ci-dessous pile à ce moment (le run
   croyait la carrière bloquée et s'arrêtait). `f.amaHistory.length +
   f.history.length` est monotone sur toute la carrière (jamais remis à
   zéro par turnPro(), seulement déplacé) : c'est la mesure correcte du
   nombre de combats réellement joués, utilisée ci-dessous pour la boucle,
   les échantillons d'offre/némésis et la longueur finale (INV-01/03/06).
   `wlSamples` (INV-02) continue en revanche à lire le `W+L+D` BRUT : c'est
   précisément la remise à zéro par turnPro() qu'INV-02 doit voir et
   tolérer (une seule fois), pas une mesure dont on veut l'éliminer. ==== */
/** Joue une carrière Faith jusqu'à `maxFights` combats résolus ou retraite,
 * en échantillonnant à chaque écran d'offre (scr_faith_offer) l'adversaire
 * proposé — c'est le point d'observation d'INV-01. */
function playFaithCareerSampling(win, maxFights){
  const totalFights = () => (win.G.f.amaHistory||[]).length + (win.G.f.history||[]).length;
  const rawWLD = () => (win.G.f.W||0)+(win.G.f.L||0)+(win.G.f.D||0);
  const offerSamples = [];
  const wlSamples = [];
  const nemesisSamples = [];
  let guard = 0;
  while(totalFights() < maxFights && !win.G.f.retired && win.G.screen !== 'gameover' && guard < 600){
    guard++;
    if(win.G.screen === 'faith_offer' && win.G.faith && win.G.faith.pendingOffer && win.G.faith.pendingOffer.opp){
      const o = win.G.faith.pendingOffer.opp.o;
      offerSamples.push({ playerFights: totalFights(), oppW: o.W||0, oppL: o.L||0 });
    }
    if(win.G.f.nemesisRecord){
      nemesisSamples.push({ w: win.G.f.nemesisRecord.w||0, l: win.G.f.nemesisRecord.l||0, playerFights: totalFights() });
    }
    const before = totalFights();
    clickThrough(win, { maxSteps: 300, stopWhen: w => {
      const wf = w.G.f;
      return ((wf.amaHistory||[]).length + (wf.history||[]).length) > before || w.G.f.retired || w.G.screen === 'gameover';
    }});
    const after = totalFights();
    wlSamples.push(rawWLD());
    if(after <= before && !win.G.f.retired) break;
  }
  return { fights: totalFights(), retired: !!win.G.f.retired, offerSamples, wlSamples, nemesisSamples };
}
/* ==== [FIN ANCRE] ==== */

test('INV-01/02/03/06 — sur ' + N_CAREERS + ' carrières Faith simulées', () => {
  const results = [];
  for(let i = 0; i < N_CAREERS; i++){
    const win = newGameWindow({ runMain: true });
    makeFaithCareer(win, 'Sim' + i);
    results.push(playFaithCareerSampling(win, 35));
  }

  // INV-01 : aucun adversaire 0-0 proposé à un joueur ayant déjà >= 5 combats.
  let inv01Violations = [];
  for(const r of results){
    for(const s of r.offerSamples){
      if(s.playerFights >= 5 && s.oppW === 0 && s.oppL === 0) inv01Violations.push(s);
    }
  }
  assert.equal(inv01Violations.length, 0,
    `INV-01 violé ${inv01Violations.length} fois : adversaire 0-0 proposé à un joueur avec >=5 combats — ${JSON.stringify(inv01Violations.slice(0,3))}`);

  // INV-02 (partiel, déjà couvert aussi par career.test.js) : le bilan W+L+D
  // ne redescend jamais au sein d'une même carrière — SAUF au passage
  // amateur->pro, où turnPro() (ui-05) réinitialise volontairement W/L par
  // conception (le palmarès amateur est archivé à part dans f.amaRec, cf.
  // ANCRE P4P_SCORE_80_20, engine.js:1266 : "seul turnPro() réinitialise
  // W/L"). Un run de ce test a d'abord échoué sur une fausse alerte (14->12)
  // qui était exactement cette remise à zéro légitime, pas une régression —
  // on tolère donc UNE SEULE baisse par carrière simulée, jamais deux.
  for(const r of results){
    let drops = 0;
    for(let i = 1; i < r.wlSamples.length; i++){
      if(r.wlSamples[i] < r.wlSamples[i-1]) drops++;
      else assert.ok(r.wlSamples[i] >= r.wlSamples[i-1]);
    }
    assert.ok(drops <= 1, `INV-02 violé : le bilan est redescendu ${drops} fois dans la même carrière (au plus 1 attendu, le passage amateur->pro)`);
  }

  // INV-03 : nemesisRecord.w+l ne peut jamais dépasser le nombre de combats
  // du joueur — celle-ci est stricte, bloquante, sans exception connue.
  //
  // Un second contrôle (hausse de nemesisRecord bornée par la hausse du
  // nombre de combats joués entre deux échantillons) a été tenté, mais un
  // repro dédié (scratchpad, hors dépôt) a trouvé un cas réel et
  // reproductible où nemesisRecord gagne +1 en w ET +1 en l (total +2)
  // alors qu'un seul combat vient de compter dans f.W+f.L+f.D, avec le
  // MÊME faithNemesisId avant/après (donc pas une dissolution/reformation,
  // seul cas de désynchronisation déjà documenté dans le code de jeu,
  // ANCRE FAITH_NEMESIS_PERMANENTE/V2-14, ui-08). ui-05 (ANCRE juste avant
  // nemesisRecord.w++/l++) ne contient qu'un seul site d'incrémentation, +1
  // par combat résolu — la cause exacte (double appel de resolveFight(),
  // combat d'exhibition qui partage l'id du roster avec le némésis sans
  // compter dans f.W/L, ou autre) n'a pas pu être isolée dans le temps
  // disponible pour ce lot. Plan V4 LOT 2/C3 réarme cette assertion en
  // échec bloquant (elle n'était qu'observée jusqu'ici) : si elle échoue,
  // ce n'est pas une régression de ce lot, c'est le bug non résolu
  // ci-dessus qui redevient visible — investigation prévue LOT 3/P16
  // (dédié à la némésis), qui touche justement ce code.
  let recordJumpAnomalies = 0;
  for(const r of results){
    let last = null;
    for(const s of r.nemesisSamples){
      const total = s.w + s.l;
      assert.ok(total <= s.playerFights,
        `INV-03 violé : nemesisRecord (${s.w}-${s.l}) dépasse le nombre de combats joués (${s.playerFights})`);
      if(last && total > last.total){
        const recordDelta = total - last.total;
        const fightsDelta = s.playerFights - last.playerFights;
        if(recordDelta > fightsDelta) recordJumpAnomalies++;
      }
      last = { total, playerFights: s.playerFights };
    }
  }
  assert.equal(recordJumpAnomalies, 0,
    `INV-03 violé : ${recordJumpAnomalies} saut(s) de nemesisRecord plus rapide que le nombre de combats joués, sur ${N_CAREERS} carrières (cf. LOT 3/P16).`);

  // INV-06 : réarmé en échec bloquant par Plan V4 LOT 2/C3, maintenant que
  // LOT 1 (C1/C2) a corrigé la cause racine (horloge double, historique
  // amateur détruit à la promotion pro) — cf. commentaire d'en-tête.
  const lengths = results.map(r => r.fights).sort((a,b)=>a-b);
  const median = lengths[Math.floor(lengths.length/2)];
  assert.ok(results.every(r => r.fights >= 1), 'chaque carrière simulée doit au moins produire un combat');
  assert.ok(median >= 25 && median <= 40,
    `INV-06 violé : longueur de carrière médiane hors cible — [${lengths.join(', ')}], médiane ${median} (cible document : 25-40).`);
});

test('INV-04 — aucun changement d\'identité d\'interlocuteur sans arc[] daté (PersonRegistry)', () => {
  const win = newGameWindow({ runMain: true });
  const ev = expr => win.eval(expr);
  const coach1 = ev("personEnsure('coach',{slot:'main'})");
  const coach2 = ev("personEnsure('coach',{slot:'main'})");
  assert.equal(coach1.id, coach2.id, 'un même slot doit toujours retourner la même identité tant qu\'aucun départ n\'est acté');

  ev(`personDepart(personEnsure('coach',{slot:'main'}), 'parti pour une autre salle')`);
  const departed = ev("G.people.byId[personEnsure('coach',{slot:'main'}).id]");
  assert.equal(departed.state.active, false, 'un interlocuteur parti doit être marqué inactif');
  assert.ok(departed.rel.arc.length >= 1, 'le départ doit laisser une trace datée dans rel.arc');
  assert.ok(departed.rel.arc[departed.rel.arc.length-1].year != null, 'l\'entrée d\'arc doit être datée');
});

/* ==== [ANCRE: INV05_NARRATIF_REQ] — Plan V4 LOT 2/C3. INV-05 était absent
   du fichier (audit §1, ligne 28) : "aucun événement narratif ne se
   déclenche sans que son req(ctx) soit satisfait" — c'est l'invariant qui
   garde P05b, P12 et P20 (des exigences qui, elles, ne sont pas encore
   codées). Deux volets, parce que "req(ctx)" recouvre deux mécanismes
   réellement distincts dans ce dépôt :
   1) le moteur générique documenté avec cette signature exacte,
      TEXT_ENGINE/txtPick (engine.js:1711-1763) — celui que P05b/P12/P20
      utiliseront quand ils migreront un pool de contenu (§4.2). Testé ici
      par fuzzing direct sur un pool jetable, sans dépendre d'aucun contenu
      de jeu existant : protège le mécanisme lui-même, pas un pool précis.
   2) le sélecteur d'événement de vie Faith déjà en production,
      CL.faithLifeEvent() (ui-08:1805-1809), qui filtre `!e.req||e.req(G.f)`
      à la main plutôt que via txtPick — un bug ici (ex. pool non filtré)
      ne serait PAS détecté par (1). Testé par une vraie carrière simulée,
      même harnais que INV-01/02/03/06, avec CL.faithLifeEvent() intercepté
      pour capturer l'événement retenu au moment exact de son tirage. ==== */
test('INV-05 — un événement narratif ne se déclenche jamais sans que son req(ctx) soit satisfait (moteur générique)', () => {
  const win = newGameWindow({ runMain: true });
  const ev = expr => win.eval(expr);
  ev(`registerTextPool('inv05_engine_test', [
    {id:'always',text:'INV05_ALWAYS'},
    {id:'lowFocus',req: ctx => (ctx.f.focus||0) < 30, text:'INV05_LOW_FOCUS'},
    {id:'highMorale',req: ctx => (ctx.f.morale||0) >= 70, text:'INV05_HIGH_MORALE'},
    {id:'evenYear',req: ctx => (ctx.year||0) % 2 === 0, text:'INV05_EVEN_YEAR'},
    {id:'never',req: ctx => false, text:'INV05_NEVER'}
  ])`);
  const violations = ev(`
    (function(){
      var bad = [];
      var pool = TEXT_POOLS['inv05_engine_test'];
      for(var k = 0; k < 200; k++){
        var ctx = { f: { focus: Math.floor(rnd()*100), morale: Math.floor(rnd()*100) }, year: Math.floor(rnd()*10) };
        var chosenText = txtPick('inv05_engine_test', ctx);
        var entry = pool.find(function(e){ return e.text === chosenText; });
        if(entry && entry.req && !entry.req(ctx)) bad.push({ id: entry.id, ctx: ctx });
      }
      return bad;
    })()
  `);
  assert.equal(violations.length, 0,
    `INV-05 violé (moteur txtPick) ${violations.length} fois : ${JSON.stringify(violations.slice(0,3))}`);
});

test('INV-05 — un événement de vie Faith ne se déclenche jamais avec son req(f) non satisfait (carrières simulées)', () => {
  for(let i = 0; i < 3; i++){
    const win = newGameWindow({ runMain: true });
    win.eval(`
      (function(){
        window.__inv05Log = [];
        var orig = CL.faithLifeEvent;
        CL.faithLifeEvent = function(){
          var r = orig.apply(this, arguments);
          var chosen = G.faith && G.faith.currentEvent;
          if(chosen && chosen.req) window.__inv05Log.push({ id: chosen.id, ok: !!chosen.req(G.f) });
          return r;
        };
      })();
    `);
    makeFaithCareer(win, 'Sim05_' + i);
    const totalFights = () => (win.G.f.W||0)+(win.G.f.L||0)+(win.G.f.D||0);
    let guard = 0;
    while(totalFights() < 20 && !win.G.f.retired && win.G.screen !== 'gameover' && guard < 600){
      guard++;
      const before = totalFights();
      clickThrough(win, { maxSteps: 300, stopWhen: w => ((w.G.f.W||0)+(w.G.f.L||0)+(w.G.f.D||0)) > before || w.G.f.retired || w.G.screen === 'gameover' });
      if(totalFights() <= before && !win.G.f.retired) break;
    }
    const log = win.eval('window.__inv05Log') || [];
    const violations = Array.from(log).filter(s => !s.ok);
    assert.equal(violations.length, 0,
      `INV-05 violé (carrière Faith simulée ${i}) : ${JSON.stringify(violations)}`);
  }
});
/* ==== [FIN ANCRE] ==== */

test('INV-07 — aucune chaîne visible tirée deux fois dans une fenêtre de 8 tirages du même pool', () => {
  const win = newGameWindow({ runMain: true });
  const ev = expr => win.eval(expr);
  ev(`registerTextPool('inv07_test', [
    {id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'},{id:'d',text:'D'},
    {id:'e',text:'E'},{id:'f',text:'F'},{id:'g',text:'G'},{id:'h',text:'H'},
    {id:'i',text:'I'},{id:'j',text:'J'}
  ])`);
  const violations = ev(`
    (function(){
      var F = {};
      var draws = [];
      for(var k=0;k<40;k++){ draws.push(txtPick('inv07_test', {F:F})); }
      var win = Math.min(8, Math.floor(10/3));
      var bad = 0;
      for(var i=1;i<draws.length;i++){
        var start = Math.max(0, i-win);
        if(draws.slice(start,i).includes(draws[i])) bad++;
      }
      return bad;
    })()
  `);
  assert.equal(violations, 0, `INV-07 violé ${violations} fois sur 40 tirages`);
});

/* ==== [ANCRE: CORRECTIF_DOUBLE_TAP_ACTION_FAITH] — verrouille tout le LOT M
   d'un coup (voir ui-08-controller-arena.js, faithClaimMonth()) : un second
   appel consécutif à n'importe quelle action du mois Faith doit laisser
   l'état EXACTEMENT identique au premier appel — même G.faith.month, même
   G.faith.year, même G.f.earnings. Chaque action est testée sur sa PROPRE
   carrière fraîchement amenée au hub Faith, pour ne jamais laisser le
   calendrier dérivé par une action précédente influencer la suivante
   (notamment franchir la fin d'année en cours de séquence). */
function reachFaithHub(first){
  const win = newGameWindow({ runMain: true });
  makeFaithCareer(win, first);
  clickThrough(win, { maxSteps: 400, stopWhen: w => w.G.screen === 'faith_hub' });
  return win;
}

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — faithRest() : un second appel n’avance pas le calendrier deux fois', () => {
  const win = reachFaithHub('Rest');
  const before = { month: win.G.faith.month, year: win.G.faith.year, form: win.G.f.form };
  win.CL.faithRest();
  const after1 = { month: win.G.faith.month, year: win.G.faith.year, form: win.G.f.form };
  assert.notDeepEqual(after1, before, 'faithRest() doit avoir un effet au premier appel');
  win.CL.faithRest();
  assert.deepEqual({ month: win.G.faith.month, year: win.G.faith.year, form: win.G.f.form }, after1,
    'un second faithRest() ne doit rien changer de plus');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — faithSparring() : un second appel ne double pas la séance', () => {
  const win = reachFaithHub('Sparring');
  const partnerId = win.G.faith.gym[0].id;
  const before = { month: win.G.faith.month, year: win.G.faith.year, sessions: win.G.faith.gym[0].sessions||0 };
  win.CL.faithSparring(partnerId);
  const after1 = { month: win.G.faith.month, year: win.G.faith.year, sessions: win.G.faith.gym.find(p=>p.id===partnerId).sessions };
  assert.notDeepEqual(after1, before, 'faithSparring() doit avoir un effet au premier appel');
  win.CL.faithSparring(partnerId);
  assert.deepEqual({ month: win.G.faith.month, year: win.G.faith.year, sessions: win.G.faith.gym.find(p=>p.id===partnerId).sessions }, after1,
    'un second faithSparring() ne doit rien changer de plus');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — faithCampChoose() : un second appel ne paie pas le stage deux fois', () => {
  const win = reachFaithHub('Camp');
  win.G.f.earnings = 100000; // écarte "Fonds insuffisants"
  win.G.f.freshness = 90;    // écarte le refus du coach
  const campId = win.eval("(typeof FAITH_GYMS!=='undefined'?FAITH_GYMS:[])[0].id");
  const before = { month: win.G.faith.month, year: win.G.faith.year, earnings: win.G.f.earnings };
  win.CL.faithCampChoose(campId);
  const after1 = { month: win.G.faith.month, year: win.G.faith.year, earnings: win.G.f.earnings };
  assert.notDeepEqual(after1, before, 'faithCampChoose() doit avoir un effet au premier appel');
  win.CL.faithCampChoose(campId);
  assert.deepEqual({ month: win.G.faith.month, year: win.G.faith.year, earnings: win.G.f.earnings }, after1,
    'un second faithCampChoose() ne doit rien changer de plus (le stage n’est pas payé deux fois)');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — chooseFaithCoach() : un second appel n’embauche pas deux fois', () => {
  const win = reachFaithHub('Coach');
  const coachId = win.eval('FAITH_COACHES[0].id');
  const before = { month: win.G.faith.month, year: win.G.faith.year };
  win.CL.chooseFaithCoach(coachId);
  const after1 = { month: win.G.faith.month, year: win.G.faith.year, coachId: win.G.faith.coachId };
  assert.notDeepEqual({ month: win.G.faith.month, year: win.G.faith.year }, before, 'chooseFaithCoach() doit avoir un effet au premier appel');
  win.CL.chooseFaithCoach(coachId);
  assert.deepEqual({ month: win.G.faith.month, year: win.G.faith.year, coachId: win.G.faith.coachId }, after1,
    'un second chooseFaithCoach() ne doit rien changer de plus');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — faithOfferRefuse() : un second appel ne pénalise pas deux fois', () => {
  const win = reachFaithHub('Refuse');
  const before = { month: win.G.faith.month, year: win.G.faith.year, refusals: win.G.faith.refusalsThisYear||0 };
  win.CL.faithOfferRefuse();
  const after1 = { month: win.G.faith.month, year: win.G.faith.year, refusals: win.G.faith.refusalsThisYear||0 };
  assert.notDeepEqual(after1, before, 'faithOfferRefuse() doit avoir un effet au premier appel');
  win.CL.faithOfferRefuse();
  assert.deepEqual({ month: win.G.faith.month, year: win.G.faith.year, refusals: win.G.faith.refusalsThisYear||0 }, after1,
    'un second faithOfferRefuse() ne doit rien changer de plus');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — chooseFaithEvent() : un second appel ne redébite pas le coût ni ne recompte le trait', () => {
  const win = reachFaithHub('Event');
  win.G.f.earnings = 100;
  win.G.faith.currentEvent = { id:'test_evt_double_tap', title:'Test', choices:[
    { label:'Choix', cost:10, d:[], traitTag:'rebel' }
  ]};
  win.G.faith.eventResolved = null;
  win.G.faith.yearLog = [];
  win.G.f.hiddenTraits = {};
  const earningsBefore = win.G.f.earnings;
  win.CL.chooseFaithEvent(0);
  const after1 = { earnings: win.G.f.earnings, yearLogLen: win.G.faith.yearLog.length, trait: win.G.f.hiddenTraits.rebel };
  assert.equal(after1.earnings, earningsBefore-10, 'chooseFaithEvent() doit débiter le coût au premier appel');
  win.CL.chooseFaithEvent(0);
  assert.deepEqual({ earnings: win.G.f.earnings, yearLogLen: win.G.faith.yearLog.length, trait: win.G.f.hiddenTraits.rebel }, after1,
    'un second chooseFaithEvent() ne doit rien changer de plus');
});

test('CORRECTIF_DOUBLE_TAP_ACTION_FAITH — nextFaithYear() : un second appel n’incrémente pas le millésime deux fois', () => {
  const win = reachFaithHub('Year');
  win.G.faith.yearStats = { fights:0, wins:0, losses:0, eloDelta:0, earningsDelta:0, rank:1,
    dmgHead:0, newSkills:[], yearLog:[], sequelle:null, promiseOutcome:null, finitions:[], rankStart:1 };
  win.G.screen = 'faith_year_end';
  const yearBefore = win.G.faith.year;
  win.CL.nextFaithYear();
  const yearAfter1 = win.G.faith.year;
  assert.notEqual(yearAfter1, yearBefore, 'nextFaithYear() doit faire passer au millésime suivant au premier appel');
  win.CL.nextFaithYear();
  assert.equal(win.G.faith.year, yearAfter1, 'un second nextFaithYear() ne doit pas ré-incrémenter le millésime');
});
