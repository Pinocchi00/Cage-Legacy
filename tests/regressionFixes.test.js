"use strict";
/* CAGE LEGACY — tests/regressionFixes.test.js
   Tests de non-régression du mode Carrière et du moteur de simulation. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* ==== [ANCRE: TEST_GENDER_DIV_COHERENCE] — audit engine.js:250-252. ==== */
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

/* ==== [ANCRE: TEST_CORRECTIF_KD_SOL] ==== */
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

/* ==== [ANCRE: TEST_CORRECTIF_OFFRE_PRO_RETRAITE] ==== */
test('CORRECTIF_OFFRE_PRO_RETRAITE — un combattant retraité ne reçoit plus d’offre pro/promo', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.age = 27;
  win.G.f.retired = true;
  const opp = win.G.roster[0];
  Object.assign(win.G.f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(opp.attrs, { tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });
  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, true);
  assert.equal(win.G.pending.forced, true);
  assert.equal(win.G.pending.proOffer, null);
  assert.equal(win.G.pending.promoOffer, false);
  assert.equal(win.G.pending.topTierOffer, false);
});

/* ==== [ANCRE: TEST_CORRECTIF_RANK_CRASH_SCORE_REEL] ==== */
test('CORRECTIF_RANK_CRASH_SCORE_REEL — une défaite en tête de classement fait vraiment chuter le score réel (rankBoost inclus)', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.W = 20; win.G.f.L = 0; win.G.f.D = 0;
  win.G.f.careerElo = 3000; win.G.f.orgElo = 3000;
  win.G.f.rankBoost = 500;
  const opp = win.G.roster[0];
  Object.assign(win.G.f.attrs, { chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1, tdd: 1, strength: 1, guardWork: 100, submission: 1, topControl: 1, flexibility: 1 });
  Object.assign(opp.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });

  const sortedNow = win.G.roster.filter(o => !o.champion).slice().sort((a, b) => win.p4pScore(b) - win.p4pScore(a));
  const targetScore = win.p4pScore(sortedNow[3]);
  assert.ok(win.divRank(win.G.f) <= 3);

  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'normal', planLabel: null };
  win.resolveFight();

  assert.equal(win.G.pending.win, false);
  const scoreAfter = win.p4pScore(win.G.f);
  assert.ok(scoreAfter <= targetScore * 1.1);
});

/* ==== [ANCRE: TEST_CORRECTIF_LASTMSG_FACEOFF] — Lot C01/2026 §C07 : le
   face-à-face est retiré, le test ne couvre plus que le comportement
   restant (G.lastMsg toujours affiché puis consommé en step 1). ==== */
test('CORRECTIF_LASTMSG_FACEOFF — G.lastMsg s’affiche et se consomme au step 1 du plan', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.champion = 'local';
  const opp = win.G.roster[0];
  win.G.fight = { opp, rounds: 3, kind: 'defense', planStep: 1 };
  win.G.lastMsg = 'MESSAGE_DE_TOUR_UNIQUE';
  const html = win.scr_plan();
  assert.ok(!html.includes('Face-à-face'));
  assert.ok(html.includes('MESSAGE_DE_TOUR_UNIQUE'));
  assert.equal(win.G.lastMsg, null);
});

/* ==== [ANCRE: TEST_CORRECTIF_ESC_GUILLEMETS] ==== */
test('CORRECTIF_ESC_GUILLEMETS — esc() échappe aussi les guillemets simples et doubles', () => {
  const win = newGameWindow();
  const out = win.eval(`esc('<script>"\\'&</script>')`);
  assert.ok(!out.includes('"'));
  assert.ok(!out.includes("'"));
  assert.equal(out, '&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;');
});

/* ==== [ANCRE: TEST_MIGRATION_PURGE_MODES_SUPPRIMES] ==== */
test('migrate() purge G.faith/G.gauntlet/G.arcade hérités d’une sauvegarde antérieure à leur suppression', () => {
  const win = newGameWindow();
  const legacySave = {
    version: 2,
    f: { name: 'Ancien', W: 5, L: 1 },
    faith: { year: 3, month: 7, perks: { judges: true } },
    gauntlet: { seed: 'xyz' },
    arcade: { active: true },
  };
  const migrated = win.migrate(legacySave);
  assert.equal(migrated.faith, undefined, 'G.faith doit être purgé par migrate()');
  assert.equal(migrated.gauntlet, undefined, 'G.gauntlet doit être purgé par migrate()');
  assert.equal(migrated.arcade, undefined, 'G.arcade doit être purgé par migrate()');
  assert.equal(migrated.version, 3, 'la version doit toujours être remontée au passage');
  assert.equal(migrated.f.name, 'Ancien', 'les champs légitimes de la sauvegarde ne doivent pas être touchés');
});

/* ==== [ANCRE: TEST_CORRECTIF_ROSTER_ENTREES_NULLES] ==== */
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

  assert.equal(threw, false);
  assert.equal(ok, true);
  assert.equal(win.G.roster.length, 1);
  assert.equal(win.G.roster[0].id, survivorId);
});

/* ==== [ANCRE: TEST_CORRECTIF_MESSAGE_FOCUS_INVERSE] — Lot C01/2026 §C09a ==== */
function makeFreshChamp(win){
  win.CL.newCareer();
  win.G.draft.first = 'Champ';
  win.CL.create();
  const f = win.G.f;
  f.champion = f.div; f.org = 3;
  return f;
}
test('CORRECTIF_MESSAGE_FOCUS_INVERSE — choisir la nouvelle ceinture annonce la nouvelle ceinture, pas la division d\'origine', () => {
  const win = newGameWindow({ runMain: true });
  const f = makeFreshChamp(win);
  const otherDiv = win.eval('DIVISIONS.H.find(d=>d.id!==G.f.div)');
  // chooseChampChampFocus() appelle render() en interne, qui consomme
  // immédiatement G.lastMsg (scr_hub le remet à null après l'avoir lu) —
  // on vérifie donc le texte affiché dans le DOM, pas G.lastMsg après coup.
  // Avant le correctif, G.f.div était réassigné AVANT la comparaison :
  // le message affichait toujours "division d'origine", même ici.
  win.CL.chooseChampChampFocus(otherDiv.id);
  assert.equal(win.G.f.div, otherDiv.id, 'choisir la nouvelle ceinture doit réellement basculer f.div');
  const appHtml = win.document.getElementById('app').innerHTML;
  assert.ok(appHtml.includes('Vous faites de votre nouvelle ceinture votre priorité.'), 'le message affiché doit annoncer la nouvelle ceinture');
  assert.ok(!appHtml.includes('Vous restez concentré'), 'le message inverse ne doit pas apparaître ici');
});
test('CORRECTIF_MESSAGE_FOCUS_INVERSE — rester sur la ceinture d\'origine annonce bien la division d\'origine', () => {
  const win = newGameWindow({ runMain: true });
  const f = makeFreshChamp(win);
  const originDivId = f.div;
  win.CL.chooseChampChampFocus(originDivId);
  assert.equal(win.G.f.div, originDivId, 'rester sur la ceinture d\'origine ne doit pas changer f.div');
  const appHtml = win.document.getElementById('app').innerHTML;
  assert.ok(appHtml.includes('Vous restez concentré sur votre division d’origine.'), 'le message affiché doit annoncer la division d’origine');
  assert.ok(!appHtml.includes('Vous faites de votre nouvelle ceinture'), 'le message inverse ne doit pas apparaître ici');
});

/* ==== [ANCRE: TEST_CORRECTIF_DOUBLE_CHAMPION_DIVISION_FAUSSE] — Lot C01/2026 §C09b ==== */
test('CORRECTIF_DOUBLE_CHAMPION_DIVISION_FAUSSE — le milestone de défense n\'énumère jamais deux fois la même division', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  // Reproduit l'état buggé : le focus a basculé sur la nouvelle ceinture,
  // donc G.f.divName vaut déjà le nom de cette division — exactement
  // comme champChampBelt (jamais mis à jour par chooseChampChampFocus).
  win.G.f.champion = win.G.f.div;
  win.G.f.champChampBelt = win.G.f.divName;
  win.G.f.champChampBeltDivId = win.G.f.div;
  win.G.f.defenses = 2;
  const opp = win.G.roster[0];
  Object.assign(win.G.f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(opp.attrs, { tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });
  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'defense', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, true);
  const milestone = win.G.pending.milestone;
  const divName = win.G.f.divName;
  const occurrences = milestone.split(divName).length - 1;
  assert.equal(occurrences, 1, `le nom de division ne doit apparaître qu'une seule fois dans le milestone, reçu : "${milestone}"`);
  assert.ok(!milestone.includes(`${divName} + ${divName}`), 'jamais "X + X" dans le libellé de défense de titre');
});

/* ==== [ANCRE: TEST_CORRECTIF_CHAMPION_ROSTER_DOUBLE_COURONNE] — Lot C01/2026 §C09c ==== */
test('CORRECTIF_CHAMPION_ROSTER_DOUBLE_COURONNE — aucun PNJ n\'est étiqueté champion quand le joueur détient déjà la ceinture de cette division', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.org = 3;
  // Simule le focus basculé sur la ceinture nouvellement gagnée en supercombat
  // (double champion) : f.champion reste vrai, et concerne désormais f.div.
  win.G.f.champion = 'national';
  const roster = win.makeOrgRoster(win.G.f);
  assert.ok(roster.length > 0);
  assert.ok(!roster.some(o => o.champion), 'aucun PNJ ne doit porter le drapeau champion quand le joueur détient déjà la ceinture de f.div');
  assert.equal(win.fightKind(), 'defense', 'le combat proposé doit rester de type defense');
});
test('CORRECTIF_CHAMPION_ROSTER_DOUBLE_COURONNE — un PNJ reste étiqueté champion quand le joueur ne détient pas (encore) la ceinture', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.org = 3;
  win.G.f.champion = null;
  const roster = win.makeOrgRoster(win.G.f);
  assert.ok(roster.some(o => o.champion), 'un PNJ doit porter le drapeau champion tant que le joueur ne détient pas cette ceinture (comportement inchangé)');
});

/* ==== [ANCRE: TEST_CORRECTIF_RETRAITE_FANTOME_PURGE] — Lot C01/2026 §C12 ==== */
test('CORRECTIF_RETRAITE_FANTOME_PURGE — CL.exitLegacy() purge la sauvegarde de carrière sans toucher au Panthéon', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Ghost'} };
    CL.create();
  `);
  win.CL.toLegacy();
  assert.equal(win.G.f.retired, true);
  assert.equal(win.G.f._enshrined, true);
  assert.equal(win.hasSave(), true, 'la carrière retraitée est encore sauvegardée juste après toLegacy()');
  const hofBefore = win.loadHOF().length;
  assert.ok(hofBefore >= 1, 'enshrine() doit avoir déjà écrit l\'entrée au Panthéon');

  win.CL.exitLegacy();

  assert.equal(win.hasSave(), false, 'la sauvegarde de carrière doit être purgée après "Retour au menu"');
  assert.equal(win.G.screen, 'title');
  assert.equal(win.loadHOF().length, hofBefore, 'le Panthéon (clé localStorage séparée) ne doit jamais être affecté par la purge');

  // Un rechargement de page (cont(), qui appelle load()) ne doit plus jamais
  // pouvoir retomber sur l'écran de fin de carrière qui vient d'être quitté.
  const loaded = win.load();
  assert.equal(loaded, false, 'load() doit échouer proprement : plus aucune sauvegarde de carrière à charger');
});
test('CORRECTIF_RETRAITE_FANTOME_PURGE — les retours ach/beltLineage après retraite pointent vers title, jamais legacy/hub', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Ghost'} };
    CL.create();
  `);
  win.CL.toLegacy();
  // G.f existe toujours après une retraite (seul f.retired change) : les
  // écrans consultés depuis 'legacy' doivent le savoir et ne jamais router
  // vers 'hub' (le vestiaire fantôme) ni vers 'legacy' lui-même.
  const achHtml = win.scr_ach();
  assert.ok(achHtml.includes(`CL.go('title')`), 'scr_ach() doit proposer un retour vers title après une retraite');
  assert.ok(!achHtml.includes(`CL.go('hub')`), 'scr_ach() ne doit jamais proposer de retour vers le vestiaire après une retraite');
  const beltHtml = win.scr_beltLineage();
  assert.ok(beltHtml.includes(`CL.go('title')`), 'scr_beltLineage() doit proposer un retour vers title après une retraite');
  assert.ok(!beltHtml.includes(`CL.go('hub')`), 'scr_beltLineage() ne doit jamais proposer de retour vers le vestiaire après une retraite');
});

/* ==== [ANCRE: TEST_CORRECTIF_FORME_MORAL_FORMAT_OBJET] — Lot C01/2026 §C03 ==== */
test('CORRECTIF_FORME_MORAL_FORMAT_OBJET — applyDeltas() sort moral/forme au même format objet que les attributs', () => {
  const win = newGameWindow();
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f;
  f.morale = 50; f.form = 50;
  const applied = win.applyDeltas(f, [['morale', 12], ['form', -12]]);
  assert.equal(applied.length, 2);
  const moraleEntry = applied.find(d => d.key === 'morale');
  const formEntry = applied.find(d => d.key === 'form');
  assert.ok(moraleEntry && !Array.isArray(moraleEntry), 'moral doit sortir en objet, jamais en tableau [\'Moral\',dv]');
  assert.equal(moraleEntry.label, 'Moral');
  assert.ok(typeof moraleEntry.before === 'number' && typeof moraleEntry.after === 'number' && typeof moraleEntry.delta === 'number');
  assert.ok(formEntry && !Array.isArray(formEntry), 'forme doit sortir en objet, jamais en tableau [\'Forme\',dv]');
  assert.equal(formEntry.label, 'Forme');
});
test('CORRECTIF_FORME_MORAL_FORMAT_OBJET — [ARBITRAGE] tout delta non nul de moral/forme est arrondi à un multiple de 5', () => {
  const win = newGameWindow();
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f;
  f.morale = 50;
  const applied = win.applyDeltas(f, [['morale', 1]]);
  assert.equal(applied.length, 1, 'un delta non nul, même minuscule, doit produire un changement visible (jamais invisible)');
  assert.equal(applied[0].delta, 5, 'un delta de 1 doit être arrondi au minimum de 5 (Math.sign(dv)*Math.max(5,...))');
  f.morale = 50;
  const appliedNeg = win.applyDeltas(f, [['morale', -1]]);
  assert.equal(appliedNeg[0].delta, -5, 'le sens du delta doit être préservé par l\'arrondi');
});
test('CORRECTIF_FORME_MORAL_FORMAT_OBJET — un gain de moral/forme qui ne change rien réellement (plafond) ne produit aucune entrée', () => {
  const win = newGameWindow();
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f;
  f.morale = 100;
  const applied = win.applyDeltas(f, [['morale', 5]]);
  assert.equal(applied.length, 0, 'déjà au plafond : aucune entrée ne doit être poussée (rien à annoncer)');
});

/* ==== [ANCRE: TEST_CORRECTIF_FICHE_LEGENDE] — Lot C01/2026 §C13 ==== */
test('CORRECTIF_FICHE_LEGENDE — origine capturée par enshrine() et affichée, classLabel retiré du nom, ceintures en badges', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Garfield';
  win.CL.create();
  const f = win.G.f;
  f.nick = 'Garfield';
  f.classLabel = 'Le Mur Défensif';
  f.class31Label = 'La Forteresse';
  assert.ok(typeof f.origin === 'string' && f.origin.length > 0, 'un combattant généré doit toujours porter une origine (engine.js)');
  win.G.titleHistory = [{org:2, divName:f.divName, champion:f.name, year:3, defenses:1, dethroned:'Aucun', orgFlavor:'Octogone MMA'}];
  win.eval('enshrine(G.f)');
  const hofList = win.loadHOF();
  const entry = hofList.find(x => String(x.id) === String(f.id));
  assert.ok(entry, 'entrée introuvable au Panthéon');
  assert.equal(entry.origin, f.origin, 'enshrine() doit capturer f.origin dans l\'entrée du Panthéon');
  assert.ok(entry.beltHistory && entry.beltHistory.length === 1, 'la ceinture pro enregistrée dans G.titleHistory doit être reprise dans beltHistory');

  win.G.viewingLegendId = entry.id;
  const html = win.scr_legend_detail();
  assert.ok(html.includes('« Garfield » — '), 'le surnom doit rester affiché dans le hero-name');
  assert.ok(!html.includes('Le Mur Défensif'), 'classLabel ne doit plus apparaître dans le hero-name (se lisait comme un second surnom)');
  assert.ok(!html.includes('La Forteresse'), 'class31Label ne doit plus apparaître dans le hero-name');
  assert.ok(html.includes('Venait de.'), 'l\'origine doit être affichée au-dessus de la motivation');
  win.G._testOrigin = f.origin;
  const escapedOrigin = win.eval('esc(G._testOrigin)');
  assert.ok(html.includes(escapedOrigin), 'le texte d\'origine réel doit apparaître sur la fiche');
  assert.ok(html.includes('Octogone MMA') && html.includes('Année 3'), 'la ceinture pro doit apparaître au format "ORG (Division) — Année N"');
  assert.ok(html.includes('tag2 hot'), 'la ceinture doit utiliser le même composant de badge que les titres amateurs');
});

/* ==== [ANCRE: TEST_CORRECTIF_SURNOM_MATCHMAKING] — Lot C01/2026 §C14a ==== */
test('CORRECTIF_SURNOM_MATCHMAKING — le surnom des adversaires est visible en matchmaking et au classement', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.org = 3;
  win.CL.fightSelect();
  const opp = win.G.opps[0].o;
  opp.nick = 'Le Marteau';
  const selectHtml = win.scr_select();
  assert.ok(selectHtml.includes('« Le Marteau » — '), 'le surnom d\'un adversaire doit apparaître sur sa carte de matchmaking');

  // Le classement n'affiche que les 15 mieux classés (division) : on force
  // le nick sur un combattant du roster garanti d'y figurer plutôt que sur
  // opp (issu de G.opps, sans lien garanti avec le haut du classement).
  const topRanked = win.rankPool(win.G.roster)[0];
  topRanked.nick = 'Le Marteau';
  win.G._rankingsTab = 'division';
  const rankHtml = win.scr_rankings();
  assert.ok(rankHtml.includes(`« ${topRanked.nick} »`), 'le surnom doit apparaître au classement (onglet Division)');
  win.G._rankingsTab = 'p4p';
  const rankP4pHtml = win.scr_rankings();
  assert.ok(rankP4pHtml.includes(`« ${topRanked.nick} »`), 'le surnom doit apparaître au classement (onglet P4P)');

  // repli propre quand nick est absent
  const noNick = win.G.roster.find(o => !o.nick);
  if (noNick) assert.ok(!win.scr_rankings().includes('« undefined »'), 'aucun surnom vide ne doit jamais apparaître');
});
test('CORRECTIF_AMAREC_RIVAUX_AMATEURS — un rival amateur promu au niveau pro porte un palmarès amateur affichable', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const rival = win.G.roster[0];
  rival.W = 5; rival.L = 1;
  win.G.f.amateurRivals = [rival];
  const proRoster = win.makeOrgRoster(Object.assign({}, win.G.f, { org: 1 }), 'PRO_TRANSITION');
  const promoted = proRoster.find(o => o.id === rival.id);
  assert.ok(promoted, 'le rival amateur doit être repris dans le roster pro');
  assert.ok(promoted.amaRec && typeof promoted.amaRec.W === 'number' && typeof promoted.amaRec.L === 'number', 'un rival amateur promu doit porter un amaRec, comme tout PNJ généré directement au niveau pro');
});

/* ==== [ANCRE: TEST_CORRECTIF_LIBELLES_ANGLAIS_ROUNDS] — Lot C01/2026 §C10c ==== */
test('CORRECTIF_LIBELLES_ANGLAIS_ROUNDS — libellés de carte en anglais, rounds au lieu de reprises', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f; f.org = 3;
  const opp = win.G.roster[0];
  assert.equal(win.getCardSlot(f, opp, 'title'), 'MAIN EVENT');
  const amateurF = Object.assign({}, f, { org: 0 });
  assert.equal(win.getCardSlot(amateurF, opp, 'normal'), 'AMATEUR CARD');
  const posterHtml = win.renderFightPoster(f, opp, 'normal');
  assert.ok(/\d ROUNDS/.test(posterHtml), 'l\'affiche de combat doit annoncer "N ROUNDS"');
  assert.ok(!/REPRISE/i.test(posterHtml), 'aucun libellé de l\'affiche ne doit contenir "reprise"');
  assert.ok(!/VEDETTE/i.test(posterHtml), 'aucun libellé de l\'affiche ne doit contenir "vedette"');
});

/* ==== [ANCRE: TEST_CORRECTIF_NIVEAU_ORGA_SANS_CIRCUIT] — Lot C01/2026 §C04 ==== */
test('CORRECTIF_NIVEAU_ORGA_SANS_CIRCUIT — orgLevelTag() ne renvoie que le niveau, plus de nom de palier ni Fast-Track', () => {
  const win = newGameWindow();
  const tag = win.eval(`orgLevelTag(3)`);
  assert.equal(tag, 'Niveau 4/7');
  assert.ok(!/Circuit|Continentale|Ultimate Rim|Pacific/i.test(tag), 'orgLevelTag() ne doit plus jamais citer le nom du palier interne');
  const orgs = win.eval('ORGS');
  assert.ok(Array.isArray(orgs) && orgs.length === 7, 'ORGS lui-même doit rester intact (clé interne / repli du registre des ceintures)');

  const win2 = newGameWindow({ runMain: true });
  win2.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win2.G.f;
  // Conditions qui déclenchent à coup sûr l'offre fast-track (upset:
  // victoire contre un Top 10 par autre chose qu'une décision) plutôt que
  // de compter sur le hasard des seuils de hype.
  f.age = 22; f.stage = 'amateur'; f.org = 0; f.ko = 4; f.sub = 0; f.W = 6; f.L = 0; f.D = 0; f.streak = 0;
  const offer = win2.eval(`evaluateProOffer(G.f, {method:'KO'}, 5)`);
  assert.ok(offer && offer.fastTrack, 'l\'offre fast-track doit être générée dans ces conditions');
  win2.G.pending = { proOffer: offer };
  const html = win2.eval(`scr_promo()`);
  // Vérifie le libellé visible de la 2e carte (hero-name), pas le HTML
  // entier : celui-ci porte encore, en commentaire invisible côté joueur,
  // la documentation historique d'un tout autre correctif (V2-38) qui cite
  // "Fast-Track" par coïncidence de vocabulaire — hors périmètre ici.
  const secondCardName = html.match(/<div class="hero-name"[^>]*>[^<]*<em[^>]*>([^<]*)<\/em>/g) || [];
  assert.ok(!secondCardName.some(s => /Fast-Track/i.test(s)), 'le libellé visible d\'aucune carte ne doit plus mentionner "Fast-Track"');
  assert.ok(!html.includes('parcours fulgurant'), 'la phrase "parcours fulgurant" doit avoir disparu');
});
test('CORRECTIF_SUPPRESSION_PHRASE_RECRUTEUR — la phrase "recruteur" a disparu de CONTRACT_PHRASES', () => {
  const win = newGameWindow();
  const phrases = win.eval(`CONTRACT_PHRASES.map(p => p('TestOrg'))`);
  assert.equal(phrases.length, 4, '4 phrases restantes (5 - 1 retirée)');
  assert.ok(!phrases.some(p => /recruteur/i.test(p)), 'aucune phrase ne doit plus mentionner un recruteur déplacé');
});

/* ==== [ANCRE: TEST_CORRECTIF_CLASSEMENT_EXPLIQUE] — Lot C01/2026 §C02 ==== */
test('CORRECTIF_CLASSEMENT_EXPLIQUE — la variation de rang est expliquée par une carte dédiée, avec une vraie cause', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.streak = 4;
  const opp = win.G.roster[0];
  Object.assign(win.G.f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 1, guardWork: 1, flexibility: 1, fightIQ: 100, composure: 100, adaptability: 100, killer: 100 });
  Object.assign(opp.attrs, { tdd: 1, strength: 1, flexibility: 1, guardWork: 100, submission: 1, topControl: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1 });
  win.setSeed(1);
  win.rnd = () => 0;
  win.G.fight = { opp, rounds: 1, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, true);
  assert.ok(win.G.pending.opp.rank > 0, 'le rang de l\'adversaire au moment du combat doit être capturé (p.opp.rank)');

  if (win.G.pending.rankBefore !== win.G.pending.rankAfter) {
    const html = win.scr_result();
    assert.ok(html.includes('Classement'), 'une carte "Classement" doit apparaître quand le rang change');
    assert.ok(html.includes(`#${win.G.pending.rankBefore} ➔ #${win.G.pending.rankAfter}`), 'la variation doit être affichée en gros');
    // La phrase de cause doit citer des données réelles du combat (ici :
    // le rang de l'adversaire réellement battu), jamais un texte générique.
    assert.ok(html.includes(String(win.G.pending.opp.rank)) || html.includes(win.G.pending.opp.name), 'la phrase de cause doit citer l\'adversaire ou son rang réel');
  }
});
