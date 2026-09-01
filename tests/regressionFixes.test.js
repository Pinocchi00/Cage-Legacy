"use strict";
/* CAGE LEGACY — tests/regressionFixes.test.js
   Couvre les correctifs des commits #30 à #33 qu'aucun test existant ne
   vérifiait directement (audit demandé après coup) :
     - #30 : les 3 verrous anti-double-tap (faithEventContinue,
       pickCoachingTactic, faithPressConfPosture).
     - #31 : attribution du kd au bon coin sur un KO au sol (MICRO_SEQUENCES).
     - #32 : les registres de restauration Gauntlet (mutateurs/malus) ne
       doivent jamais perdre de points quand l'attribut touché était déjà
       proche de son plafond au moment du clamp(1,100).
   La cohérence genre/division de makeFighter() (audit engine.js:250-252) est
   également couverte ici : vérifiée exacte à l'exécution (DIVISIONS.H/F.forEach
   pose déjà `gender` sur chaque entrée avant tout appel à makeFighter, bien
   avant #31) — ce n'est PAS une régression, seulement une garantie qui
   mérite un test de non-régression comme n'importe quel autre invariant. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const { clickThrough } = require('./helpers/playthrough');

/* ==== [ANCRE: TEST_GENDER_DIV_COHERENCE] — audit engine.js:250-252. Les 12
   entrées de DIVISIONS reçoivent `gender` par un .forEach() posé juste après
   leur définition (engine.js:115), exécuté à l'import du fichier, donc
   toujours avant le tout premier appel à makeFighter() : optDiv.gender n'est
   jamais undefined en pratique. Vérifié ici plutôt que supposé. ==== */
test('makeFighter({div}) — le genre est toujours cohérent avec la division fournie', () => {
  const win = newGameWindow();
  win.setSeed(7);
  for (let i = 0; i < 30; i++) {
    const f = win.makeFighter({ div: 'F-straw' });
    assert.equal(f.gender, 'F', 'F-straw doit toujours produire gender===F');
  }
  for (let i = 0; i < 30; i++) {
    const f = win.makeFighter({ div: 'H-heavy' });
    assert.equal(f.gender, 'H', 'H-heavy doit toujours produire gender===H');
  }
  for (let i = 0; i < 30; i++) {
    const f = win.makeFighter({});
    assert.ok(f.gender === 'H' || f.gender === 'F', 'sans div fournie, le genre doit rester H ou F, jamais undefined');
  }
});

function makeFaithCareer(win, first) {
  win.CL.startFaith();
  const d = win.G.faithDraft;
  Object.assign(d, {
    first, div: win.eval("DIVISIONS.H[0].id"), origin: 'traditional',
    style: win.eval("Object.keys(STYLES)[0]"), lifestyle: 'pro', circle: 'family',
    agent: win.eval("Object.keys(FAITH_AGENTS)[0]"), personality: 'taiseux', stable: 'regional',
  });
  win.CL.finalizeFaithDraft();
}

/* ==== [ANCRE: TEST_CORRECTIF_DOUBLE_TAP_EVENT_CONTINUE] — teste le verrou du
   même nom (#30, ui-08 CL.faithEventContinue) : distinct de
   CORRECTIF_DOUBLE_AFTERRESULT (saveSystem.test.js), qui verrouille
   afterResult() — un handler différent, sur un écran différent
   (scr_result après un combat, pas scr_faith_event après un événement de
   vie). clickThrough s'arrête dès que G.faith.eventResolved devient vrai,
   c'est-à-dire APRÈS le choix qui résout l'événement mais AVANT le clic sur
   "Continuer" — exactement le moment que ce test doit driver lui-même. ==== */
test('CORRECTIF_DOUBLE_TAP_EVENT_CONTINUE — un double-tap sur Continuer (événement de vie) ne consomme le mois qu’une fois', () => {
  const win = newGameWindow({ runMain: true });
  makeFaithCareer(win, 'EvtTap');
  clickThrough(win, { maxSteps: 800, stopWhen: w => w.G.faith && w.G.faith.eventResolved });
  assert.ok(win.G.faith.eventResolved, 'un événement de vie résolu doit avoir été atteint dans les 800 pas');

  const monthBefore = win.G.faith.month;
  win.CL.faithEventContinue();
  const monthAfterFirst = win.G.faith.month;
  const screenAfterFirst = win.G.screen;
  assert.ok(monthAfterFirst > monthBefore || screenAfterFirst === 'faith_year_end', 'le premier appel doit bien avancer le calendrier');

  win.CL.faithEventContinue(); // double-tap
  assert.equal(win.G.faith.month, monthAfterFirst, 'un second appel ne doit pas avancer le calendrier une deuxième fois');
  assert.equal(win.G.screen, screenAfterFirst, 'un second appel ne doit pas non plus changer l’écran');
});

/* ==== [ANCRE: TEST_CORRECTIF_DOUBLE_TAP_COACHING_ROUND] — teste le verrou du
   même nom (#30, ui-08 CL.pickCoachingTactic) : garde d'écran plutôt qu'un
   drapeau, car le premier appel bascule déjà G.screen sur 'arena' avant
   qu'un second tap ne puisse être traité. État Gauntlet construit à la main
   (mode boss_run minimal) plutôt que via le menu complet — inutile ici,
   seul G.arcade.coaching + G.screen='coaching_round' comptent pour ce
   handler. ==== */
test('CORRECTIF_DOUBLE_TAP_COACHING_ROUND — un double-tap sur une tactique ne relance pas deux fois le round', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opp = win.makeFighter({ gender: win.G.f.gender, style: 'bjj', div: win.G.f.div, first: 'Opp' });
  const blankStats = () => ({ sig: 0, td: 0, tdAtt: 0, ctrl: 0, sub: 0, kd: 0, dmgHead: 0, dmgBody: 0, dmgLegs: 0 });
  win.G.arcade = {
    active: true, mode: 'boss_run', opponent: opp,
    mutator: null, campIdentity: null, plan: null, planLabel: null,
    runStartCardio: win.G.f.attrs.cardio, streak: 0, target: 5, condition: 'ko_only', bossMalus: null,
    coaching: { round: 1, scoreA: 0, scoreB: 0, judges: { j1: [0, 0], j2: [0, 0], j3: [0, 0] }, roundStats: [], stats: { A: blankStats(), B: blankStats() }, _restore: { self: {}, opp: {} } },
  };
  win.G.screen = 'coaching_round';

  win.CL.pickCoachingTactic(0);
  const roundAfterFirst = win.G.arcade.coaching ? win.G.arcade.coaching.round : null;
  assert.equal(win.G.screen, 'arena', 'le premier tap doit faire quitter coaching_round pour arena');
  assert.ok(roundAfterFirst !== null, 'le premier tap doit avoir lancé le round (coaching toujours en cours ou combat fini)');

  win.CL.pickCoachingTactic(0); // double-tap : carte détachée du DOM, mais onclick encore lié
  const roundAfterSecond = win.G.arcade.coaching ? win.G.arcade.coaching.round : null;
  assert.equal(roundAfterSecond, roundAfterFirst, 'un second tap sur l’écran arena ne doit pas relancer un round supplémentaire');
});

/* ==== [ANCRE: TEST_CORRECTIF_DOUBLE_TAP_PRESSCONF_POSTURE] — teste le
   verrou du même nom (#30, ui-08 CL.faithPressConfPosture) : off.postureDone,
   même motif que buildupDone/pressConfDone/peseeDone voisins. off.gala.
   pressConf=true force la branche pesée de faithProceedToPesee() (pas de
   dépendance à CL.opp()/au matchmaking, hors périmètre de ce test). ==== */
test('CORRECTIF_DOUBLE_TAP_PRESSCONF_POSTURE — un double-tap sur une posture ne double pas son effet', () => {
  const win = newGameWindow({ runMain: true });
  makeFaithCareer(win, 'PressTap');
  const oppFighter = win.makeFighter({ gender: win.G.f.gender, style: win.G.f.style, div: win.G.f.div, first: 'Rival' });
  win.G.faith.pendingOffer = {
    opp: { o: oppFighter, id: oppFighter.id }, gala: { pressConf: true },
    buildupDone: true, pressConfDone: true, bonusMult: 1,
  };
  win.G.faith.buildup = { attente: 2, tension: 2, causes: [] };

  win.CL.faithPressConfPosture('provocation');
  const attenteAfterFirst = win.G.faith.buildup.attente;
  const tensionAfterFirst = win.G.faith.buildup.tension;
  assert.equal(attenteAfterFirst, 3, 'la posture "provocation" doit incrémenter attente une fois');
  assert.equal(tensionAfterFirst, 3, 'la posture "provocation" doit incrémenter tension une fois');

  win.CL.faithPressConfPosture('provocation'); // double-tap
  assert.equal(win.G.faith.buildup.attente, attenteAfterFirst, 'un second tap ne doit pas incrémenter attente une deuxième fois');
  assert.equal(win.G.faith.buildup.tension, tensionAfterFirst, 'un second tap ne doit pas incrémenter tension une deuxième fois');
});

/* ==== [ANCRE: TEST_CORRECTIF_KD_SOL] — teste le correctif du même nom (#31,
   engine-combat.js MICRO_SEQUENCES) : le kd d'un KO au sol doit être crédité
   au VAINQUEUR (topF, celui qui frappe), jamais au perdant. Fixtures et rnd()
   forcé à 0 pour rendre l'issue déterministe : A (lutteur, stats de sol
   maximales) prend systématiquement le dessus sur B (garde/chin/fightIQ au
   plancher) dès la première micro-séquence — takedown validé, puis
   soumission du dessus structurellement nulle (bot.guard élevé) pour ne
   laisser que la branche KO/TKO possible. ==== */
test('CORRECTIF_KD_SOL — un KO au sol crédite le kd au vainqueur, pas au perdant', () => {
  const win = newGameWindow();
  win.setSeed(1);
  const A = win.makeFighter({ gender: 'H', style: 'wrestler', div: 'H-heavy', first: 'Top' });
  const B = win.makeFighter({ gender: 'H', style: 'bjj', div: 'H-heavy', first: 'Bottom' });
  Object.assign(A.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(B.attrs, { tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });
  win.rnd = () => 0;

  const res = win.simulateFight(A, B, 1, null, null, null);
  assert.equal(res.winner, 'A', 'A doit remporter ce combat construit pour finir au sol dès le round 1');
  assert.equal(res.method, 'KO/TKO');
  assert.equal(res.detail, 'coups au sol');
  assert.equal(res.stats.A.kd, 1, 'le kd doit être crédité au vainqueur (A, celui qui frappe au sol)');
  assert.equal(res.stats.B.kd, 0, 'le perdant (B) ne doit recevoir aucun kd sur ce KO');
});

/* ==== [ANCRE: TEST_CORRECTIF_RESTAURATION_DELTAS] — teste le correctif du
   même nom (#32, ui-03 startCoachingFight/runCoachingRound) : un attribut à
   95 recevant +15 (clampé à 100) doit être restauré à 95 en fin de combat,
   jamais à 85 (l'ancien bug appliquait un delta NOMINAL de restauration
   -15 sur la valeur déjà clampée, perdant les 5 points écrêtés par le
   clamp). Combat construit pour finir dès le round 1 (mêmes fixtures que
   CORRECTIF_KD_SOL) afin que la restauration s'applique sans jamais passer
   par buildTimeline()/render() (chemin round-non-conclusif, hors périmètre
   de ce test). ==== */
test('CORRECTIF_RESTAURATION_DELTAS — un attribut à 95 boosté de +15 puis restauré revient à 95, pas 85', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opp = win.makeFighter({ gender: win.G.f.gender, style: 'bjj', div: win.G.f.div, first: 'Opp' });
  win.G.arcade = {
    active: true, mode: 'boss_run', opponent: opp,
    mutator: { id: 'mut_violent', label: 'x', desc: 'x' },
    campIdentity: null, plan: null, planLabel: null,
    runStartCardio: win.G.f.attrs.cardio, streak: 0, target: 5, condition: 'ko_only', bossMalus: null,
  };
  Object.assign(win.G.f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(opp.attrs, { power: 95, tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });

  win.setSeed(1);
  win.rnd = () => 0;
  win.startCoachingFight(); // applique mut_violent (+15, clampé 95->100), finit round 1, restaure avant finalizeArcadeCombatResult()

  assert.equal(opp.attrs.power, 95, 'le +15 de mut_violent doit être intégralement restauré (95 -> 100 clampé -> 95), jamais 85');
});

/* ============================================================================
   Lot d'audit "13 findings" (rapport revérifié contre HEAD, groupes 2 à 4 —
   G1-1/G1-2/G3-1 étaient des arbitrages traités séparément : G1-1 et G1-2 se
   sont avérés être des faux positifs, G3-1 a été patché après vérification
   que le score de référence sans rankBoost n'était pas un garde-fou
   documenté). Chaque test ci-dessous couvre UN SEUL correctif de ce lot.
   ============================================================================ */

/* ==== [ANCRE: TEST_CORRECTIF_CACHE_OPPS_DIV_ORG] — G2-1, ui-02
   ensureOpponentsCached() : un changement de division doit invalider le
   cache d'adversaires même sans nouveau combat comptabilisé. ==== */
test('CORRECTIF_CACHE_OPPS_DIV_ORG — un changement de division invalide le cache d’adversaires', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opps1 = win.ensureOpponentsCached(win.G.f);
  win.G.f.div = win.eval("DIVISIONS.H[0].id");
  win.G.f.divName = win.eval("DIVISIONS.H[0].name");
  win.G.roster = win.makeOrgRoster(win.G.f);
  const opps2 = win.ensureOpponentsCached(win.G.f);
  assert.notEqual(opps2, opps1, 'un changement de division (sans nouveau combat) doit régénérer G.opps');
  const opps3 = win.ensureOpponentsCached(win.G.f);
  assert.equal(opps3, opps2, 'sans changement de div/org/nombre de combats, le cache doit rester stable (pas de régénération à chaque appel)');
});

/* ==== [ANCRE: TEST_CORRECTIF_OVERALL_CONSOMMABLE_GAUNTLET] — G2-3,
   state-gauntlet.js applyPendingGauntletConsumable() : un consommable
   'buff' doit recalculer overall() immédiatement (lu directement par le
   moteur de combat, engine-combat.js). ==== */
test('CORRECTIF_OVERALL_CONSOMMABLE_GAUNTLET — un buff Gauntlet recalcule immédiatement overall()', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const overallBefore = win.G.f.overall;
  const meta = win.loadMetaStats();
  meta.gauntletPendingConsumable = 'cons_strength'; // +15 power
  win.saveMetaStats(meta);
  win.applyPendingGauntletConsumable({});
  assert.ok(win.G.f.overall > overallBefore, 'overall() doit augmenter dès l’application du buff, pas seulement au prochain recalcul externe');
  assert.equal(win.G.f.overall, win.overall(win.G.f), 'G.f.overall doit être synchronisé avec les attrs déjà buffés');
});

/* ==== [ANCRE: TEST_CORRECTIF_OFFRE_PRO_RETRAITE] — G3-2, ui-05
   resolveFight() : un combattant déjà retraité en entrant dans ce combat ne
   doit recevoir ni offre pro ni offre de promotion, même dans les
   conditions qui les déclencheraient normalement (org 0, victoire, âge
   ≥ 26 ans). ==== */
test('CORRECTIF_OFFRE_PRO_RETRAITE — un combattant retraité ne reçoit plus d’offre pro/promo', () => {
  const win = newGameWindow({ runMain: true });
  /* setSeed() AVANT la création : sinon makeFighter() (via CL.create())
     pioche ses attrs de départ dans Math.random() non seedé, et laisse le
     test dépendre d'attributs non maîtrisés (flaky selon l'exécution). */
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.age = 27; // seul suffit normalement à garantir evaluateProOffer()
  win.G.f.retired = true; // déjà retraité en entrant dans ce combat
  const opp = win.G.roster[0];
  Object.assign(win.G.f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(opp.attrs, { tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });
  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, true, 'le combat construit doit bien se solder par une victoire (pour tester le déclencheur normalement garanti)');
  assert.equal(win.G.pending.forced, true, 'forced doit refléter la retraite déjà actée');
  assert.equal(win.G.pending.proOffer, null, 'aucune offre pro ne doit être générée pour un combattant retraité');
  assert.equal(win.G.pending.promoOffer, false, 'aucune offre de promotion ne doit être générée pour un combattant retraité');
  assert.equal(win.G.pending.topTierOffer, false, 'aucune offre top-tier ne doit être générée pour un combattant retraité');
});

/* ==== [ANCRE: TEST_CORRECTIF_RANK_CRASH_SCORE_REEL] — G3-1, ui-05
   RANK_CRASH : la correction doit se baser sur le score RÉEL (rankBoost
   courant inclus), pas sur le score sans boost — sinon un rankBoost déjà
   accumulé laisse le joueur "insubmersible" après une défaite, exactement
   le symptôme que cette ancre existe pour corriger. ==== */
test('CORRECTIF_RANK_CRASH_SCORE_REEL — une défaite en tête de classement fait vraiment chuter le score réel (rankBoost inclus)', () => {
  const win = newGameWindow({ runMain: true });
  /* setSeed() AVANT la création : sinon makeFighter() (via CL.create())
     pioche ses attrs de départ dans Math.random() non seedé, et laisse le
     test dépendre d'attributs non maîtrisés (flaky selon l'exécution). */
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.W = 20; win.G.f.L = 0; win.G.f.D = 0;
  win.G.f.careerElo = 3000; win.G.f.orgElo = 3000;
  win.G.f.rankBoost = 500; // "capital de victoires" déjà accumulé
  const opp = win.G.roster[0];
  // Attrs du joueur volontairement faibles : le classement (Elo/palmarès/
  // rankBoost) ne dépend jamais des attrs de combat, seule l'issue du
  // combat lui-même doit être forcée en défaite.
  Object.assign(win.G.f.attrs, { chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1, tdd: 1, strength: 1, guardWork: 100, submission: 1, topControl: 1, flexibility: 1 });
  Object.assign(opp.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });

  const sortedNow = win.G.roster.filter(o => !o.champion).slice().sort((a, b) => win.p4pScore(b) - win.p4pScore(a));
  const targetScore = win.p4pScore(sortedNow[3]);
  assert.ok(win.divRank(win.G.f) <= 3, 'le combattant doit être classé top-3 avant le combat, pour que RANK_CRASH s’applique');

  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'normal', planLabel: null };
  win.resolveFight();

  assert.equal(win.G.pending.win, false, 'le combat construit doit bien se solder par une défaite');
  const scoreAfter = win.p4pScore(win.G.f);
  assert.ok(scoreAfter <= targetScore * 1.1, `le score réel après la chute doit retomber près du 4e (cible ${targetScore}), pas rester gonflé par l’ancien rankBoost (obtenu : ${scoreAfter})`);
});

/* ==== [ANCRE: TEST_CORRECTIF_CUMUL_NEGOCIATION_SPAM] — G3-3, ui-08
   faithOfferDemandMoney() : une fois la patience de l'agent déjà épuisée
   (hors du clic qui la fait franchir 0, laissé intact), aucun clic
   supplémentaire ne doit plus faire progresser off.bonusMult. ==== */
test('CORRECTIF_CUMUL_NEGOCIATION_SPAM — une patience déjà épuisée bloque tout gain supplémentaire de négociation', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.startFaith();
  const d = win.G.faithDraft;
  Object.assign(d, {
    first: 'Neg', div: win.eval("DIVISIONS.H[0].id"), origin: 'traditional',
    style: win.eval("Object.keys(STYLES)[0]"), lifestyle: 'pro', circle: 'family',
    agent: win.eval("Object.keys(FAITH_AGENTS)[0]"), personality: 'villain', stable: 'regional',
  });
  win.CL.finalizeFaithDraft();
  win.G.f.streak = 5; // garantit faithLeverage(f,F) > 0
  win.G.faith.agentPatience = 0;
  win.G.faith.agentPatienceHitZero = true; // déjà épuisée AVANT ce test (pas le clic de franchissement)
  const opp = win.makeFighter({ gender: 'H', div: win.G.f.div, first: 'Opp' });
  win.G.faith.pendingOffer = { opp: { o: opp, id: opp.id }, gala: {}, bonusMult: 1 };
  win.G.faith.directors = win.G.faith.directors || {};
  win.G.faith.directors[win.G.f.org] = { trust: 5 }; // favorise la branche qui composait bonusMult

  win.CL.faithOfferDemandMoney();
  const afterFirst = win.G.faith.pendingOffer.bonusMult;
  assert.equal(afterFirst, 1, 'un clic alors que la patience est déjà à plat ne doit apporter aucun gain');
  win.CL.faithOfferDemandMoney();
  assert.equal(win.G.faith.pendingOffer.bonusMult, afterFirst, 'un second clic ne doit pas non plus faire progresser bonusMult (négociation infinie corrigée)');
});

/* ==== [ANCRE: TEST_CORRECTIF_DROUGHT_ATTRIBUTION_CONFIRMEE] — G3-4,
   engine-progression.js rollSkill() : la disette ne doit être remise à
   zéro qu'après une attribution CONFIRMÉE — pas dès que le jet de
   déblocage réussit, si le plafond de compétences de carrière empêche
   ensuite toute attribution réelle. ==== */
test('CORRECTIF_DROUGHT_ATTRIBUTION_CONFIRMEE — un jet réussi sans attribution réelle ne remet pas la disette à zéro', () => {
  const win = newGameWindow();
  win.setSeed(1);
  const f = win.makeFighter({ gender: 'H', div: 'H-heavy', style: 'boxer', first: 'Drought' });
  f.age = 20; // sous AGE_META : pas fin de carrière
  f._drought = 7;
  const SKILLS = win.eval('SKILLS');
  const styleSkills = SKILLS.filter(s => s.fam === 'style' && s.key === f.style).slice(0, 10);
  f.skills = styleSkills.map(s => s.id); // 10 compétences de style déjà acquises -> isCapped
  let calls = 0;
  win.rnd = () => { calls++; return calls === 1 ? 0.5 : 0.05; }; // jet mythique raté, jet de déblocage réussi
  const result = win.rollSkill(f);
  assert.equal(result, null, 'aucune compétence ne doit être accordée une fois le plafond de carrière atteint');
  assert.equal(f._drought, 7, 'la disette accumulée ne doit pas être perdue quand le jet réussit sans qu’aucune compétence ne soit réellement accordée');
});

/* ==== [ANCRE: TEST_CORRECTIF_COACH_REEMBAUCHE] — G3-5, state-faith.js
   faithHireCoach() : réembaucher un coach déjà employé par le passé (même
   coachId) doit restaurer la Person existante (relation/historique
   conservés), pas en reminer une nouvelle. ==== */
test('CORRECTIF_COACH_REEMBAUCHE — réembaucher un ancien coach reprend la relation existante', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.startFaith();
  const d = win.G.faithDraft;
  Object.assign(d, {
    first: 'Coach', div: win.eval("DIVISIONS.H[0].id"), origin: 'traditional',
    style: win.eval("Object.keys(STYLES)[0]"), lifestyle: 'pro', circle: 'family',
    agent: win.eval("Object.keys(FAITH_AGENTS)[0]"), personality: 'taiseux', stable: 'regional',
  });
  win.CL.finalizeFaithDraft();

  const p1 = win.faithHireCoach('co_belhadj', 'Embauche initiale (test)');
  p1.rel.trust = 90;
  const firstId = p1.id;
  win.faithHireCoach('co_nakamura', 'Remplacé pour le test'); // p1 part
  assert.equal(win.G.people.byId[firstId].state.active, false, 'l’ancien coach doit être marqué parti (personDepart)');
  const p3 = win.faithHireCoach('co_belhadj', 'Réembauche (test)');
  assert.equal(p3.id, firstId, 'réembaucher le même coachId doit renvoyer la MÊME Person, jamais une identité neuve');
  assert.equal(p3.rel.trust, 90, 'la relation (confiance) construite lors de la première embauche doit être conservée');
  assert.equal(p3.state.active, true, 'le coach réembauché doit redevenir actif');
});

/* ==== [ANCRE: TEST_CORRECTIF_LASTMSG_FACEOFF] — G4-2, ui-06 scr_plan() :
   G.lastMsg doit être rendu (et consommé) même quand un face-à-face est
   éligible et pas encore fait, pas seulement dans la branche sans
   face-à-face. ==== */
test('CORRECTIF_LASTMSG_FACEOFF — G.lastMsg s’affiche même quand un face-à-face est proposé', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.champion = 'local'; // kind==='defense' -> faceoffEligible
  const opp = win.G.roster[0];
  win.G.fight = { opp, rounds: 3, kind: 'defense', planStep: 1, faceoffDone: false };
  win.G.lastMsg = 'MESSAGE_DE_TOUR_UNIQUE';
  const html = win.scr_plan();
  assert.ok(html.includes('Face-à-face'), 'le combat est éligible au face-à-face, la carte doit apparaître');
  assert.ok(html.includes('MESSAGE_DE_TOUR_UNIQUE'), 'G.lastMsg doit malgré tout être rendu sur cet écran');
  assert.equal(win.G.lastMsg, null, 'G.lastMsg doit être consommé (mis à null) une fois rendu, comme dans la branche sans face-à-face');
});

/* ==== [ANCRE: TEST_CORRECTIF_ESC_GUILLEMETS] — G4-3, state-core.js esc() :
   les guillemets simples ET doubles doivent être échappés (attributs HTML
   title=/value=, noms de combattants saisis par le joueur). ==== */
test('CORRECTIF_ESC_GUILLEMETS — esc() échappe aussi les guillemets simples et doubles', () => {
  const win = newGameWindow();
  // esc() est un `const` de premier niveau (state-core.js) : comme `G`,
  // jamais une propriété de window — seul win.eval() y a directement accès.
  const out = win.eval(`esc('<script>"\\'&</script>')`);
  assert.ok(!out.includes('"'), 'un guillemet double brut ne doit plus apparaître dans la sortie de esc()');
  assert.ok(!out.includes('\''), 'un guillemet simple brut ne doit plus apparaître dans la sortie de esc()');
  assert.equal(out, '&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;');
});

/* ==== [ANCRE: TEST_CORRECTIF_ROSTER_ENTREES_NULLES] — F1, state/state-validation.js
   validateState() : une entrée null/undefined dans G.roster (sauvegarde
   corrompue) ne doit plus jamais lever de TypeError, et le correctif filtre
   désormais uniquement les entrées invalides (G.roster.map(repairFighter)
   .filter(Boolean)) au lieu de régénérer tout le roster — les fighters sains
   qu'il contenait déjà doivent survivre à l'appel. ==== */
test('CORRECTIF_ROSTER_ENTREES_NULLES — validateState() filtre les entrées nulles de G.roster sans planter ni régénérer tout le roster', () => {
  const win = newGameWindow();
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Rost'} };
    CL.create();
  `);
  const survivor = win.G.roster[0];
  const survivorId = survivor.id;
  win.G.roster = [null, survivor, undefined];

  let threw = false, ok;
  try { ok = win.validateState(); } catch (e) { threw = true; }

  assert.equal(threw, false, 'validateState() ne doit jamais lever d’exception sur un roster contenant des entrées nulles');
  assert.equal(ok, true, 'validateState() doit réussir malgré la corruption partielle du roster');
  assert.equal(win.G.roster.length, 1, 'les entrées null/undefined doivent être filtrées, pas laissées dans le tableau');
  assert.equal(win.G.roster[0].id, survivorId, 'le fighter valide restant doit être conservé (pas de régénération totale via makeOrgRoster)');
});

/* ==== [ANCRE: TEST_CORRECTIF_FAITH_LEVERAGE_F_INERTE] — F2,
   ui-04a-faith-screens.js faithLeverage(f,F) : vérifié que l'ancre
   FAITH_AGENT ne prévoit aucun effet de l'agent sur le levier de
   négociation (seulement une commission et un style de matchmaking) — F
   reste un paramètre non exploité, documenté comme tel plutôt que retiré
   (signature conservée). Ce test fige ce comportement : si un futur
   correctif fait lire F.agent sans mettre à jour l'ancre/la doc, il doit
   échouer ici pour forcer une revue explicite. ==== */
test('CORRECTIF_FAITH_LEVERAGE_F_INERTE — faithLeverage(f,F) ignore F.agent, comme documenté (ancre FAITH_NEGOCIATION)', () => {
  const win = newGameWindow();
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Lev'} };
    CL.create();
  `);
  win.G.f.streak = 5; win.G.f.hypeBonus = 2; win.G.f.personality = 'villain';
  const scoreNoAgent = win.faithLeverage(win.G.f, {});
  const scoreShark = win.faithLeverage(win.G.f, { agent: win.eval('FAITH_AGENTS.requin') });
  const scoreLoyal = win.faithLeverage(win.G.f, { agent: win.eval('FAITH_AGENTS.fidele') });
  assert.equal(scoreShark, scoreNoAgent, 'un agent Requin ne doit modifier aucun point de levier (F non lu par faithLeverage)');
  assert.equal(scoreLoyal, scoreNoAgent, 'un agent Fidèle ne doit pas non plus modifier le score, à F identique par ailleurs');
});

/* ==== [ANCRE: TEST_CORRECTIF_EQEQEQ_VENGEANCE_RIVAL_ID] — F3,
   ui-05-fight-resolution.js ACH 'vengeance_ultime' : vérifié que tout id de
   combattant du jeu (uniqueFighterId(), engine.js, seule source d'id de
   production) est toujours une chaîne — Object.keys() aussi — donc `===`
   est équivalent à l'ancien `==` sans en perdre le comportement. ==== */
test('CORRECTIF_EQEQEQ_VENGEANCE_RIVAL_ID — vengeance_ultime détecte la revanche avec des ids toujours en chaîne (=== suffit)', () => {
  const win = newGameWindow();
  const oppId = win.makeFighter({ gender: 'H', div: 'H-heavy' }).id;
  assert.equal(typeof oppId, 'string', 'uniqueFighterId() doit toujours produire une chaîne, jamais un nombre');

  const f = {
    history: [
      { oppId, res: 'loss', method: 'Décision' },
      { oppId, res: 'win', method: 'KO (test)' },
    ],
    _rivalries: { [oppId]: 2 },
  };
  const ach = win.eval("ACH.find(a=>a.id==='vengeance_ultime')");
  assert.equal(ach.t(f), true, 'une revanche par KO contre un rival (ids en chaîne, comme en jeu) doit déclencher le succès avec ===');
});
