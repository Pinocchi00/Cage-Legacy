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
