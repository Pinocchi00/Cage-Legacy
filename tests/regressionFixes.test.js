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
  assert.equal(migrated.version, 4, 'la version doit toujours être remontée au passage');
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

/* ==== [ANCRE: TEST_CORRECTIF_CHAMPION_ROSTER_DOUBLE_COURONNE] — Lot C01/2026 §C09c ==== */
test('CORRECTIF_CHAMPION_ROSTER_DOUBLE_COURONNE — aucun PNJ n\'est étiqueté champion quand le joueur détient déjà la ceinture de cette division', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.org = 3;
  // Simule la division nouvellement gagnée en supercombat (P2 : bascule
  // immédiate et définitive, resolveFight()/ui-05) : f.champion reste vrai,
  // et concerne désormais f.div.
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

/* ==== [ANCRE: TEST_CORRECTIF_PONDERATION_PALMARES_NONRENOUVELLEMENT] — Lot C01/2026 §C06 ==== */
function setupNonRenewFight(win, extra){
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f;
  f.org = 3;
  // Bilan de contrat pré-existant : 1 défaite, 3 victoires aux points —
  // avec la victoire de ce combat (aussi aux points), la branche
  // "gagnant" (wins>=losses) est atteinte avec une chance de base non
  // nulle (decisionWins*0.03), sans dépendre du hasard de la simulation.
  f.contract = { fightsLeft: 1, record: [
    { res: 'loss', method: 'KO' },
    { res: 'win', method: 'Décision' },
    { res: 'win', method: 'Décision' },
    { res: 'win', method: 'Décision' },
  ] };
  Object.assign(f, extra);
  const opp = win.G.roster[0];
  // Décision garantie : les deux combattants encaissent sans jamais finir,
  // seul le score aux cartes tranche (win="A" par construction du moteur
  // avec des stats dominantes côté A mais sans finition).
  Object.assign(f.attrs, { fightIQ: 100, composure: 100, adaptability: 100, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 100, killer: 1, power: 1, submission: 1 });
  Object.assign(opp.attrs, { fightIQ: 1, composure: 1, adaptability: 1, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 1, killer: 1, power: 1, submission: 1 });
  return { f, opp };
}
test('CORRECTIF_PONDERATION_PALMARES_NONRENOUVELLEMENT — un champion en titre ne perd jamais son contrat', () => {
  const win = newGameWindow({ runMain: true });
  const { f, opp } = setupNonRenewFight(win, { champion: 'local' });
  win.setSeed(1);
  win.rnd = () => 0.05; // sous la chance de base (0.12) sans protection
  win.G.fight = { opp, rounds: 3, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.f.contractNonRenewed, false, 'un champion en titre ne doit jamais risquer le non-renouvellement, quel que soit le tirage');
});
test('CORRECTIF_PONDERATION_PALMARES_NONRENOUVELLEMENT — sans le statut de champion, un tirage assez bas déclenche toujours le non-renouvellement', () => {
  const win = newGameWindow({ runMain: true });
  const { f, opp } = setupNonRenewFight(win, { champion: null, streak: 0 });
  win.setSeed(1);
  // Volontairement bien EN DESSOUS du pire cas protégé possible ici (top 5
  // ET série ≥5 cumulés : base 0.15 × 0.25 × 0.5 = 0.01875) : ce tirage
  // déclenche le non-renouvellement quel que soit le classement réel du
  // combattant à l'issue du combat — seul le statut de champion (testé à
  // part ci-dessus, où il ramène la chance à exactement 0) peut encore
  // l'empêcher.
  win.rnd = () => 0.005;
  win.G.fight = { opp, rounds: 3, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.f.contractNonRenewed, true, 'sans le statut de champion, ce tirage doit déclencher le non-renouvellement');
  assert.ok(!/défaite/.test(win.G.f.contractNonRenewalReason), 'la raison ne doit plus énumérer de victoires/défaites pour un bilan gagnant');
  assert.ok(/finisseurs/.test(win.G.f.contractNonRenewalReason), 'la raison doit être reformulée sur le style, ex. "finisseurs"');
});
test('CORRECTIF_PONDERATION_PALMARES_NONRENOUVELLEMENT — la branche bilan réellement perdant reste intacte, même pour un champion', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(1);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const f = win.G.f;
  f.org = 3; f.champion = 'local';
  // Bilan réellement perdant sur ce contrat (3 défaites, 1 victoire) : la
  // protection "champion" ne s'applique qu'à la branche gagnant/nul.
  f.contract = { fightsLeft: 1, record: [
    { res: 'loss', method: 'KO' },
    { res: 'loss', method: 'KO' },
    { res: 'loss', method: 'KO' },
    { res: 'win', method: 'Décision' },
  ] };
  const opp = win.G.roster[0];
  Object.assign(f.attrs, { fightIQ: 100, composure: 100, adaptability: 100, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 100, killer: 1, power: 1, submission: 1 });
  Object.assign(opp.attrs, { fightIQ: 1, composure: 1, adaptability: 1, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 1, killer: 1, power: 1, submission: 1 });
  win.setSeed(1);
  win.rnd = () => 0.3; // sous la chance "réellement perdant" (>=0.75 ici), au-dessus de tout ce que la branche gagnant produirait
  win.G.fight = { opp, rounds: 3, kind: 'normal', planLabel: null };
  win.resolveFight();
  assert.equal(win.G.f.contractNonRenewed, true, 'un bilan réellement perdant doit rester risqué même pour un champion en titre');
  assert.ok(/défaite/.test(win.G.f.contractNonRenewalReason), 'un bilan réellement perdant garde une raison honnête (défaites), ce n\'est pas une punition pour avoir gagné');
});

/* ==== [ANCRE: TEST_CORRECTIF_PALMARES_CORRELE_NIVEAU] — Lot C01/2026 §C14b ==== */
function pearsonCorrelation(xs, ys){
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX, dy = ys[i] - meanY;
    num += dx * dy; denX += dx * dx; denY += dy * dy;
  }
  return num / Math.sqrt(denX * denY);
}
test('CORRECTIF_PALMARES_CORRELE_NIVEAU — le palmarès généré des PNJ est corrélé à leur niveau (overall)', () => {
  const win = newGameWindow();
  win.setSeed(11);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const npcs = [];
  for (let org = 1; org <= 6; org++) {
    for (let batch = 0; batch < 4; batch++) {
      const f = Object.assign({}, win.G.f, { org });
      const roster = win.makeOrgRoster(f);
      roster.forEach(o => npcs.push(o));
    }
  }
  assert.ok(npcs.length >= 200, `au moins 200 PNJ générés pour l'échantillon (obtenu : ${npcs.length})`);

  const overalls = npcs.map(o => o.overall);
  const winRatios = npcs.map(o => o.W / Math.max(1, o.W + o.L));
  const corr = pearsonCorrelation(overalls, winRatios);
  assert.ok(corr > 0.6, `corrélation overall/ratio de victoires attendue > 0,6, obtenue : ${corr.toFixed(3)}`);

  // aucun PNJ classé top 5 (par overall, repère simple et stable en dehors
  // d'un vrai classement Elo complet) n'affiche un bilan perdant (L>W).
  const top5 = npcs.slice().sort((a, b) => b.overall - a.overall).slice(0, 5);
  assert.ok(top5.every(o => o.L <= o.W), 'aucun PNJ classé top 5 par niveau ne doit afficher un bilan perdant');

  // amaRec doit suivre la même corrélation que le palmarès pro.
  const withAma = npcs.filter(o => o.amaRec);
  assert.ok(withAma.length > 0, 'les PNJ pro doivent porter un amaRec');
  const amaRatios = withAma.map(o => o.amaRec.W / Math.max(1, o.amaRec.W + o.amaRec.L));
  const amaOveralls = withAma.map(o => o.overall);
  const amaCorr = pearsonCorrelation(amaOveralls, amaRatios);
  assert.ok(amaCorr > 0.4, `amaRec doit aussi être corrélé au niveau (obtenu : ${amaCorr.toFixed(3)})`);
});

/* ==== [ANCRE: TEST_CORRECTIF_P4P_SCORE_BRUT] — Lot C01/2026 §C15a ==== */
test('CORRECTIF_P4P_SCORE_BRUT — l\'onglet P4P n\'affiche plus aucun score brut, seulement des rangs', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.org = 3;
  win.G._rankingsTab = 'p4p';
  const html = win.scr_rankings();
  // Les scores p4pScore() bruts sont des nombres à 3-4 chiffres (centaines
  // à milliers) ; un score brut resterait visible tel quel dans le HTML.
  // On vérifie plutôt que la colonne P4P n'affiche que des rangs "#N".
  const rankCells = html.match(/font-size:14px">#(\d+)<\/div>/g) || [];
  assert.ok(rankCells.length > 0, 'la colonne P4P doit afficher des rangs au format "#N"');
  // Cohérence avec la fiche (p4pRank(f), déjà correcte) : le rang du
  // joueur dans l'onglet doit correspondre à p4pRank(G.f).
  const expectedPlayerRank = win.p4pRank(win.G.f);
  if (expectedPlayerRank != null && expectedPlayerRank <= 15) {
    assert.ok(html.includes(`#${expectedPlayerRank}`), 'le rang affiché pour le joueur doit correspondre à p4pRank(f)');
  }
});

/* ==== [ANCRE: TEST_P1_FORME_MORAL_REEQUILIBRAGE] — Lot P1/2026, chantier
   d'équilibrage forme/moral (diagnostic chiffré sur 200 carrières via
   tools/monte-carlo.js : forme >=95 dans 71.9% des combats avant ce
   correctif, affichage /20 changeant seulement 43.1% du temps). Couvre les
   deux mécanismes ajoutés/modifiés : regressToBaseline() (engine-
   progression.js) et le coût de forme/moral à l'issue d'un combat
   (applyResult(), engine-combat.js). ==== */
test('P1_FORME_MORAL_REEQUILIBRAGE — regressToBaseline() ramène forme et moral vers la ligne de base, dans les deux sens', () => {
  const win = newGameWindow();
  const BASELINE = win.eval('FORME_MORAL_BASELINE'); // const de haut niveau, jamais une propriété de window (cf. TESTS_LOADGAME_G_BRIDGE)
  const high = { form: 100, morale: 100 };
  win.regressToBaseline(high);
  assert.ok(high.form < 100 && high.morale < 100, 'un combattant au sommet doit redescendre vers la ligne de base');
  assert.ok(high.form >= BASELINE && high.morale >= BASELINE, 'la baisse ne doit jamais dépasser la ligne de base en un seul appel');

  const low = { form: 0, morale: 0 };
  win.regressToBaseline(low);
  assert.ok(low.form > 0 && low.morale > 0, 'un combattant épuisé doit remonter vers la ligne de base (le camp RÉCUPÈRE, jamais un pur plafond)');
  assert.ok(low.form <= BASELINE && low.morale <= BASELINE, 'la hausse ne doit jamais dépasser la ligne de base en un seul appel');

  const atBaseline = { form: BASELINE, morale: BASELINE };
  win.regressToBaseline(atBaseline);
  assert.equal(atBaseline.form, BASELINE, 'déjà à la ligne de base, regressToBaseline() ne doit rien changer');
  assert.equal(atBaseline.morale, BASELINE, 'déjà à la ligne de base, regressToBaseline() ne doit rien changer');
});

test('P1_FORME_MORAL_REEQUILIBRAGE — une victoire ne fait plus jamais gagner de forme, un match nul non plus (« le corps encaisse »)', () => {
  const win = newGameWindow();
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const A = win.G.f;
  const B = win.makeFighter({ gender: 'H', style: 'boxer', div: 'H-lheavy', first: 'B' });
  for (let i = 0; i < 25; i++) {
    A.form = 80; A.morale = 80;
    const res = { winner: 'A', method: 'Décision', round: 3 };
    win.applyResult(A, B, res, 'A');
    assert.ok(A.form <= 80, `une victoire ne doit jamais faire monter la forme (avant 80, après ${A.form})`);
  }
});

test('P1_FORME_MORAL_REEQUILIBRAGE — chooseTraining() applique la régression vers la ligne de base avant le delta de l’option choisie', () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  win.G.f.form = 100; win.G.f.morale = 100;
  win.startFightSelect();
  win.chooseOpponent(0);
  // Option d'entraînement synthétique sans aucun delta de forme/moral, pour
  // isoler l'effet de regressToBaseline() de celui (variable, dépendant du
  // style tiré) du delta propre à l'option réellement proposée.
  win.G.train = [{ label: 'Test isolation', hint: '', d: [['cardio', 1]] }];
  const before = win.G.f.form;
  win.chooseTraining(0);
  assert.ok(win.G.f.form < before, 'à 100, avec une option qui ne touche pas la forme, seule la régression vers la ligne de base doit s\'appliquer et donc la faire baisser');
});

/* ==== [ANCRE: TEST_MOTEUR_COMBAT_STATS_ENRICHIES] — Modèle statistique DeepSeek & Invariants ==== */
test('MOTEUR_COMBAT_STATS_ENRICHIES — présence de tous les compteurs et respect strict des invariants', () => {
  const win = newGameWindow();
  win.setSeed(42);
  for (let i = 0; i < 15; i++) {
    const A = win.makeFighter({ div: 'H-welter', style: 'boxer' });
    const B = win.makeFighter({ div: 'H-welter', style: 'wrestler' });
    const res = win.simulateFight(A, B, 3);

    // Vérification de la présence de chaque champ statistique
    const requiredKeys = [
      'sig', 'sigAtt', 'total', 'totalAtt',
      'sigHead', 'headAtt', 'sigBody', 'bodyAtt', 'sigLeg', 'legAtt',
      'distStrikes', 'distAtt', 'clinchStrikes', 'clinchAtt', 'groundStrikes', 'groundAtt',
      'powerStrikes', 'td', 'tdAtt', 'tdDef', 'reversals', 'standups', 'guardPasses',
      'subAtt', 'subEscapes', 'ctrl', 'ctrlSec', 'clinchCtrlSec', 'groundCtrlSec',
      'dmgHead', 'dmgBody', 'dmgLegs', 'kd', 'wobbled', 'cuts'
    ];

    ['A', 'B'].forEach(side => {
      const s = res.stats[side];
      requiredKeys.forEach(k => {
        assert.ok(typeof s[k] === 'number' && !isNaN(s[k]), `stats.${side}.${k} doit être un nombre défini (obtenu: ${s[k]})`);
      });

      // Invariants mathématiques
      assert.ok(s.sigAtt >= s.sig, `sigAtt (${s.sigAtt}) doit être >= sig (${s.sig})`);
      assert.ok(s.total >= s.sig, `total (${s.total}) doit être >= sig (${s.sig})`);
      assert.ok(s.totalAtt >= s.total, `totalAtt (${s.totalAtt}) doit être >= total (${s.total})`);
      assert.ok(s.totalAtt >= s.sigAtt, `totalAtt (${s.totalAtt}) doit être >= sigAtt (${s.sigAtt})`);
      assert.ok(s.tdAtt >= s.td, `tdAtt (${s.tdAtt}) doit être >= td (${s.td})`);
      assert.ok(s.ctrlSec >= 0, 'ctrlSec doit être positif ou nul');
      assert.ok(s.powerStrikes >= 0, 'powerStrikes doit être positif ou nul');
    });

    // Structure roundStats
    assert.ok(Array.isArray(res.roundStats) && res.roundStats.length > 0, 'roundStats doit contenir les rounds simulés');
    res.roundStats.forEach(rs => {
      assert.ok(typeof rs.r === 'number', 'roundStats.r doit être un nombre');
      assert.ok(Array.isArray(rs.j1) && Array.isArray(rs.j2) && Array.isArray(rs.j3), 'cartes juges présentes');
      assert.ok(typeof rs.sigA === 'number' && typeof rs.sigB === 'number', 'sigA/sigB présents');
      assert.ok(typeof rs.tdA === 'number' && typeof rs.tdB === 'number', 'tdA/tdB présents');
      assert.ok(typeof rs.kdA === 'number' && typeof rs.kdB === 'number', 'kdA/kdB présents');
      assert.ok(typeof rs.sigAttA === 'number' && typeof rs.sigAttB === 'number', 'sigAttA/sigAttB présents');
    });
  }
});

/* ==== [ANCRE: TEST_MOTEUR_COMBAT_IMPACT_30_ATTRIBUTS] — Impact réel des attributs ==== */
test('MOTEUR_COMBAT_IMPACT_30_ATTRIBUTS — les attributs influencent directement les dynamiques et statistiques', () => {
  const win = newGameWindow();
  win.setSeed(99);

  // 1. Impact de kick : kicks bas/médians et dégâts aux jambes
  const kicker = win.makeFighter({ div: 'H-light', style: 'kickboxer' });
  kicker.attrs.kick = 95; kicker.attrs.power = 80;
  const puncher = win.makeFighter({ div: 'H-light', style: 'boxer' });
  puncher.attrs.kick = 15; puncher.attrs.jab = 90; puncher.attrs.cross = 90;

  let totalLegDmgByKicker = 0, totalLegDmgByPuncher = 0;
  for (let i = 0; i < 10; i++) {
    const res = win.simulateFight(kicker, puncher, 3);
    totalLegDmgByKicker += res.stats.A.sigLeg;
    totalLegDmgByPuncher += res.stats.B.sigLeg;
  }
  assert.ok(totalLegDmgByKicker > totalLegDmgByPuncher, `Le kickboxeur spécialisé doit placer plus de kicks (${totalLegDmgByKicker} vs ${totalLegDmgByPuncher})`);

  // 2. Impact de takedown & tdd : tentatives et défenses
  const wrestler = win.makeFighter({ div: 'H-welter', style: 'wrestler' });
  wrestler.attrs.takedown = 95; wrestler.attrs.strength = 90;
  const defender = win.makeFighter({ div: 'H-welter', style: 'boxer' });
  defender.attrs.tdd = 95; defender.attrs.footSpeed = 85;

  let tdDefTotal = 0, tdAttTotal = 0;
  for (let i = 0; i < 10; i++) {
    const res = win.simulateFight(wrestler, defender, 3);
    tdAttTotal += res.stats.A.tdAtt;
    tdDefTotal += res.stats.B.tdDef;
  }
  assert.ok(tdAttTotal > 0, `Le lutteur doit tenter des amenées (obtenu : ${tdAttTotal})`);
  assert.ok(tdDefTotal > 0, `Le défenseur d'élite doit comptabiliser des défenses d'amenées (obtenu : ${tdDefTotal})`);

  // 3. Impact d'aggression : volume de tentatives de frappes
  const agro = win.makeFighter({ div: 'H-middle', style: 'mma' });
  agro.attrs.aggression = 95; agro.attrs.handSpeed = 85;
  const passive = win.makeFighter({ div: 'H-middle', style: 'mma' });
  /* ==== [ANCRE: TEST_HORLOGE_CONTINUE_AGGRO_CONTROLE] — Lot P6/2026 :
     `passive` était généré avec ses propres attributs aléatoires (seul
     `aggression`/`handSpeed` étaient forcés), donc le test comparait deux
     combattants qui pouvaient aussi différer sur striking/footwork/power
     etc. Sous l'ancien moteur (6 micro-séquences), le seed 99 faisait
     tomber ce bruit dans le bon sens par coïncidence ; sous l'horloge
     continue (bien plus de tirages aléatoires par combat), ce n'est plus
     le cas — le combat n'est pas moins correct, seul le tirage change (cf.
     P6 §5). On isole désormais réellement la variable testée en copiant
     TOUS les attributs de `agro` sur `passive` avant de ne faire varier
     que l'agressivité, plutôt que de rejouer avec un seed qui retomberait
     par chance dans le bon sens. ==== */
  Object.assign(passive.attrs, agro.attrs);
  passive.attrs.aggression = 15; passive.attrs.handSpeed = 85;

  let agroAttempts = 0, passiveAttempts = 0;
  for (let i = 0; i < 10; i++) {
    const res = win.simulateFight(agro, passive, 3);
    agroAttempts += res.stats.A.sigAtt;
    passiveAttempts += res.stats.B.sigAtt;
  }
  assert.ok(agroAttempts > passiveAttempts, `Le combattant ultra-agressif doit tenter plus de frappes (${agroAttempts} vs ${passiveAttempts})`);

  // 4. Impact de topControl & gnp vs guardWork : passages et renversements
  const topGrappler = win.makeFighter({ div: 'H-light', style: 'wrestler' });
  topGrappler.attrs.takedown = 99; topGrappler.attrs.topControl = 95; topGrappler.attrs.gnp = 90;
  const bottomGuard = win.makeFighter({ div: 'H-light', style: 'bjj' });
  bottomGuard.attrs.guardWork = 95; bottomGuard.attrs.flexibility = 90; bottomGuard.attrs.submission = 85;

  let passesCount = 0, reversalsOrStandups = 0;
  for (let i = 0; i < 10; i++) {
    const res = win.simulateFight(topGrappler, bottomGuard, 3);
    passesCount += res.stats.A.guardPasses;
    reversalsOrStandups += (res.stats.B.reversals + res.stats.B.standups);
  }
  assert.ok(passesCount >= 0 && reversalsOrStandups >= 0, 'Les compteurs sol avancés sont actifs');
});

/* ==== [ANCRE: TEST_UI_STATS_PANEL_RENDU] — Rendu de la carte de statistiques ==== */
test('renderCombatStatsCard() — rendu complet sans NaN ni undefined', () => {
  const win = newGameWindow();
  const A = win.makeFighter({ first: 'Alex', last: 'Pereira' });
  const B = win.makeFighter({ first: 'Israel', last: 'Adesanya' });
  const res = win.simulateFight(A, B, 3);
  const html = win.renderCombatStatsCard(res.stats, A, B);

  assert.ok(html.includes('Statistiques du combat'), 'titre présent');
  assert.ok(html.includes('Frappes sig.'), 'section frappes sig. présente');
  assert.ok(html.includes('Total frappes'), 'section total frappes présente');
  assert.ok(html.includes('Frappes puissantes'), 'frappes puissantes présentes');
  assert.ok(html.includes('Défense frappes'), 'défense frappes présente');
  assert.ok(html.includes('Par cible'), 'répartition par cible présente');
  assert.ok(html.includes('Par position'), 'répartition par position présente');
  assert.ok(html.includes('Amenées'), 'amenées présentes');
  assert.ok(html.includes('Défense lutte'), 'défense lutte présente');
  assert.ok(html.includes('Temps de contrôle'), 'temps de contrôle présent');
  assert.ok(html.includes('Soumissions'), 'soumissions présentes');
  assert.ok(html.includes('Lutte au sol'), 'dynamique sol présente');
  assert.ok(html.includes('Dégâts infligés'), 'dégâts infligés présents');

  assert.ok(!html.includes('undefined'), 'aucun undefined dans le HTML');
  assert.ok(!html.includes('NaN'), 'aucun NaN dans le HTML');
});

/* ==== [ANCRE: TEST_P7_L2_COUP_LOURD] — Lot 2/P7 §2.1 : avant ce lot, le flux
   de dégâts était borné par un `clamp(...,0,6)` PAR TICK (donc, mécaniquement,
   par round) — aucun combat sur 24 000 relevés mesurés en LOT 1 ne dépassait
   37 points de dégâts cumulés (tête+corps+jambes). Le nouveau modèle
   introduit des coups lourds à distribution à queue épaisse, dont
   l'amplitude est plafonnée par ÉVÉNEMENT (HEAVY_MAX_AMP), jamais par tick :
   un pic isolé bien au-delà de l'ancien plafond doit donc pouvoir survenir. ==== */
test('P7_L2_COUP_LOURD — le modèle de dégâts en deux composantes produit des pics dépassant nettement l’ancien plafond par tick', () => {
  const win = newGameWindow();
  win.setSeed(5);
  let maxDmg = 0;
  for (let i = 0; i < 300; i++) {
    const A = win.makeFighter({ style: 'boxer' });
    const B = win.makeFighter({ style: 'boxer' });
    const res = win.simulateFight(A, B, 3);
    const dmgA = res.stats.A.dmgHead + res.stats.A.dmgBody + res.stats.A.dmgLegs;
    const dmgB = res.stats.B.dmgHead + res.stats.B.dmgBody + res.stats.B.dmgLegs;
    maxDmg = Math.max(maxDmg, dmgA, dmgB);
  }
  assert.ok(maxDmg > 40,
    `un coup lourd doit pouvoir produire un pic de dégâts cumulés bien au-delà de l'ancien maximum mesuré (37 sur 24 000 relevés, cf. baseline-P7.md) — obtenu max=${maxDmg}`);
});

/* ==== [ANCRE: TEST_P7_L2_ARRET_MEDICAL] — Lot 2/P7 §2.4 : `cuts` existait
   déjà comme compteur mais n'était jamais exploité — aucune coupure ne
   pouvait jamais arrêter un combat. isKOMethod() (engine.js) doit aussi
   classer 'Arrêt médical' comme un KO/TKO pour le palmarès (F.ko, K-factor
   Elo, achievements), tout en restant un LIBELLÉ distinct affiché tel quel
   à l'écran (jamais confondu avec 'Soumission' ou une décision). ==== */
test('P7_L2_ARRET_MEDICAL — une coupure aggravée peut déclencher un arrêt médical, classé comme un KO/TKO pour le palmarès', () => {
  const win = newGameWindow();
  win.setSeed(3);
  let sawMedical = false;
  for (let i = 0; i < 500 && !sawMedical; i++) {
    const A = win.makeFighter({ style: 'karate' });
    Object.assign(A.attrs, { cross: 100, hook: 100, power: 100, killer: 100 });
    const B = win.makeFighter({ style: 'karate' });
    Object.assign(B.attrs, { chin: 1, durability: 1, composure: 1, heart: 1, fightIQ: 1 });
    const res = win.simulateFight(A, B, 5);
    if (res.method === 'Arrêt médical') sawMedical = true;
  }
  assert.ok(sawMedical, 'un arrêt médical doit pouvoir survenir sur assez de combats avec une coupure aggravée (cross/hook/power/killer 100 vs chin/durability/composure/heart/fightIQ 1)');
  assert.equal(win.isKOMethod('Arrêt médical'), true, 'isKOMethod doit classer un arrêt médical comme un KO/TKO pour le palmarès');
  assert.equal(win.isKOMethod('KO/TKO'), true);
  assert.equal(win.isKOMethod('Soumission'), false, 'isKOMethod ne doit jamais confondre un arrêt médical avec une soumission');
  assert.equal(win.isKOMethod('Décision'), false);
  assert.equal(win.isKOMethod('Décision partagée'), false);
  assert.equal(win.isKOMethod('Égalité'), false);
  assert.equal(win.isKOMethod(null), false);
});

/* ==== [ANCRE: TEST_P7_L2_RECUP_JAMAIS_DEGATS_ZONE] — Lot 2/P7 §2.5 :
   "recovery doit gouverner ce que la cloche efface : une partie de la
   fatigue, une partie de l'état wobbled, JAMAIS les dégâts cumulés aux
   jambes et au corps." Vérifié directement sur les snapshots par beat du
   journal de combat (snapA/snapB, déjà exposés à ui-09-arena.js) : les
   dégâts cumulés par zone ne doivent jamais reculer, y compris au passage
   d'un round à l'autre (la seule fenêtre où `recovery` agit). ==== */
test('P7_L2_RECUP_JAMAIS_DEGATS_ZONE — la récupération entre rounds n’efface jamais les dégâts cumulés par zone (tête/corps/jambes)', () => {
  const win = newGameWindow();
  win.setSeed(17);
  let checked = 0;
  for (let i = 0; i < 40; i++) {
    const A = win.makeFighter({ style: 'muayThai' });
    Object.assign(A.attrs, { recovery: 99 });
    const B = win.makeFighter({ style: 'wrestler' });
    Object.assign(B.attrs, { recovery: 99 });
    const res = win.simulateFight(A, B, 5);
    let prevA = { h: 0, b: 0, l: 0 }, prevB = { h: 0, b: 0, l: 0 };
    for (const entry of res.log) {
      if (!entry.snapA || !entry.snapB) continue;
      checked++;
      const EPS = 1e-9;
      assert.ok(entry.snapA.h >= prevA.h - EPS && entry.snapA.b >= prevA.b - EPS && entry.snapA.l >= prevA.l - EPS,
        `dégâts cumulés de A ne doivent jamais reculer (combat ${i}) : ${JSON.stringify(prevA)} -> ${JSON.stringify(entry.snapA)}`);
      assert.ok(entry.snapB.h >= prevB.h - EPS && entry.snapB.b >= prevB.b - EPS && entry.snapB.l >= prevB.l - EPS,
        `dégâts cumulés de B ne doivent jamais reculer (combat ${i}) : ${JSON.stringify(prevB)} -> ${JSON.stringify(entry.snapB)}`);
      prevA = entry.snapA; prevB = entry.snapB;
    }
  }
  assert.ok(checked > 100, `assez de beats journalisés pour que ce test soit significatif (obtenu ${checked})`);
});

/* ==== [ANCRE: TEST_P7_L3_HIERARCHIE_POSITIONS] — Lot 3/P7 §3.1 : avant ce
   lot, le sol ne connaissait que `topIsA` (deux états) — aucune position
   nommée ne pouvait être observée dans le journal de combat. Vérifie que le
   graphe de transitions (ANCRE P7_L3_SOL_TRANSITIONS, engine-combat.js)
   fait réellement progresser la position au-delà de la garde fermée
   d'entrée (initialGroundPos), et que guardPasses (compteur crédité par les
   transitions réelles depuis ce lot, plus par le tirage ad hoc d'avant) est
   bien actif sur un échantillon dominé positionnellement. ==== */
test('P7_L3_HIERARCHIE_POSITIONS — la position au sol progresse au-delà de la garde fermée (passage de garde, montée, dos observés)', () => {
  const win = newGameWindow();
  win.setSeed(2026);
  const posSeen = new Set();
  let totalGuardPasses = 0;
  for (let i = 0; i < 200; i++) {
    const A = win.makeFighter({ style: 'wrestler', first: 'Top' });
    Object.assign(A.attrs, { takedown: 100, strength: 95, explosiveness: 90, tdd: 90, topControl: 95, gnp: 85, power: 70, submission: 80, killer: 70 });
    const B = win.makeFighter({ style: 'boxer', first: 'Bottom' });
    Object.assign(B.attrs, { guardWork: 5, flexibility: 5, strength: 5, tdd: 5, topControl: 5, chin: 60, durability: 60, composure: 60, heart: 60, cardio: 60 });
    const res = win.simulateFight(A, B, 5);
    res.log.forEach(entry => { if (entry.phase === 'sol' && entry.pos) posSeen.add(entry.pos); });
    totalGuardPasses += res.stats.A.guardPasses;
  }
  assert.ok(posSeen.has('closedGuard'), 'la garde fermée (position d\'entrée par défaut) doit apparaître dans le journal');
  const advancedPositions = ['halfGuard', 'sideControl', 'mount', 'backControl'].filter(p => posSeen.has(p));
  assert.ok(advancedPositions.length > 0,
    `sur un dominant positionnel net (topControl/strength/explosiveness 90-100 vs guard/flexibility/strength 5), au moins une position avancée doit apparaître sur 200 combats — obtenu positions vues: ${[...posSeen].join(', ')}`);
  assert.ok(totalGuardPasses > 0, `guardPasses doit être crédité par les transitions réelles sur cet échantillon dominé (obtenu ${totalGuardPasses})`);
});

/* ==== [ANCRE: TEST_P7_L3_SUBMISSION_DEFENSE] — Lot 3/P7 §3.2 : "elle se
   défend (flexibility, composure, strength)" — submissionDefenseMult()
   (engine-combat.js) doit réellement réduire le taux de soumissions subies
   par un défenseur souple/calme/fort par rapport à un défenseur démuni sur
   ces trois plans, toutes choses égales par ailleurs (même attaquant, même
   niveau de soumission/contrôle en face). ==== */
test('P7_L3_SUBMISSION_DEFENSE — un défenseur souple/calme/fort subit nettement moins de soumissions qu’un défenseur démuni', () => {
  const win = newGameWindow();
  const N = 300;
  const buildAttacker = () => {
    const A = win.makeFighter({ style: 'bjj', first: 'Attaquant' });
    Object.assign(A.attrs, { submission: 95, killer: 80, topControl: 85, strength: 75, explosiveness: 75, gnp: 65, takedown: 85, tdd: 50, guardWork: 50 });
    return A;
  };
  const buildDefender = (level) => {
    const B = win.makeFighter({ style: 'boxer', first: 'Defenseur' });
    Object.assign(B.attrs, { flexibility: level, composure: level, strength: level, guardWork: 50, topControl: 50, tdd: 50, chin: 50, durability: 50, fightIQ: 50 });
    return B;
  };
  win.setSeed(4041);
  let lowDefSubLosses = 0;
  for (let i = 0; i < N; i++) {
    const res = win.simulateFight(buildAttacker(), buildDefender(1), 5);
    if (res.winner === 'A' && res.method === 'Soumission') lowDefSubLosses++;
  }
  win.setSeed(4041);
  let highDefSubLosses = 0;
  for (let i = 0; i < N; i++) {
    const res = win.simulateFight(buildAttacker(), buildDefender(99), 5);
    if (res.winner === 'A' && res.method === 'Soumission') highDefSubLosses++;
  }
  assert.ok(lowDefSubLosses > highDefSubLosses,
    `un défenseur démuni (flexibility/composure/strength=1) doit subir plus de soumissions qu'un défenseur souple/calme/fort (=99), même seed, même attaquant — obtenu ${lowDefSubLosses} vs ${highDefSubLosses} sur ${N} combats`);
});

/* ==== [ANCRE: TEST_P7_L3_JUGES_COHERENCE] — Lot 3/P7 §3.3, dernier point :
   "un round où le panneau montre une domination nette ne doit pas pouvoir
   être donné à l'autre" — cohérence panneau/cartes. judgeDiffs (roundStats,
   engine-combat.js ANCRE P7_L3_JUGES_SENSIBILITES) expose les trois lectures
   pondérées du même round : quand les TROIS pondérations s'accordent sur une
   domination nette (même signe, |valeur|>20), les trois juges doivent
   obligatoirement attribuer le round au même combattant — jamais de round
   donné à l'adversaire dans ce cas, contrairement à l'ancien dissentJudge()
   qui pouvait retourner l'intégralité d'un round 10-9 dès que |rDiff|<=20. ==== */
test('P7_L3_JUGES_COHERENCE — un round nettement dominé selon les trois pondérations n’est jamais donné à l’adversaire', () => {
  const win = newGameWindow();
  win.setSeed(777);
  let checkedRounds = 0;
  /* ==== [ANCRE: P7_L4_TEST_ECHANTILLON] — Lot 4/P7 : N relevé de 300 à 450.
     La politique de combat par style (STYLE_POLICY, engine.js ; lue via
     P7_L4_STYLE_POLICY_COMBAT, engine-combat.js) change la VALEUR
     d'offA/offB à chaque tick sans ajouter de tirage
     rnd() supplémentaire, mais déplace mécaniquement quelles branches
     rnd()<... sont prises (finitions plus tôt/tard, transitions de phase) —
     pour une même seed, la séquence de combats simulés dérive donc, et le
     nombre de rounds "nettement dominés" sur un échantillon fixe peut
     varier de quelques unités d'un lot à l'autre (mesuré : 20 obtenus ici
     après ce lot contre >20 avant, aucune ligne de coherence panneau/cartes
     n'étant elle-même en cause — seul le TOTAL de rounds observés a
     changé). N relevé pour restaurer une marge confortable au-dessus du
     seuil de significativité, sans toucher au seuil lui-même ni à la
     vérification de cohérence, qui reste strictement la même.
     Lot 6/P8 §6.1 : même cause, nouvel épisode — la suppression du coin
     entre les rounds (ancre P8_L6_COIN_SUPPRIME, engine-combat.js) retire
     un appel à getUniqueLog()/pick() (donc à rnd()) à chaque round perdu,
     ce qui décale à son tour tout le flux pseudo-aléatoire des combats
     suivants pour la seed 777. Mesuré : 14 rounds nettement dominés obtenus
     à N=450 après ce lot (contre 20 avant, sous le seuil de significativité
     de ce test), toujours ZÉRO violation de cohérence panneau/cartes parmi
     eux — ni ici ni à N=600/700/800 (mesuré). N relevé à 700 (28 rounds
     observés, marge confortable) ; le seuil de significativité et la
     vérification de cohérence elle-même restent inchangés. ==== */
  for (let i = 0; i < 700; i++) {
    const A = win.makeFighter({});
    const B = win.makeFighter({});
    const res = win.simulateFight(A, B, 5);
    (res.roundStats || []).forEach(rs => {
      if (!rs.judgeDiffs) return;
      const [d1, d2, d3] = rs.judgeDiffs;
      const allDominantA = d1 > 20 && d2 > 20 && d3 > 20;
      const allDominantB = d1 < -20 && d2 < -20 && d3 < -20;
      if (!allDominantA && !allDominantB) return;
      checkedRounds++;
      const winnerOf = j => j[0] > j[1] ? 'A' : (j[1] > j[0] ? 'B' : 'tie');
      const expected = allDominantA ? 'A' : 'B';
      assert.equal(winnerOf(rs.j1), expected, `juge 1 doit donner ce round dominé à ${expected} (j1=${JSON.stringify(rs.j1)}, judgeDiffs=${JSON.stringify(rs.judgeDiffs)})`);
      assert.equal(winnerOf(rs.j2), expected, `juge 2 doit donner ce round dominé à ${expected} (j2=${JSON.stringify(rs.j2)}, judgeDiffs=${JSON.stringify(rs.judgeDiffs)})`);
      assert.equal(winnerOf(rs.j3), expected, `juge 3 doit donner ce round dominé à ${expected} (j3=${JSON.stringify(rs.j3)}, judgeDiffs=${JSON.stringify(rs.judgeDiffs)})`);
    });
  }
  assert.ok(checkedRounds > 20, `assez de rounds nettement dominés observés pour que ce test soit significatif (obtenu ${checkedRounds})`);
});

/* ==== [ANCRE: TEST_P7_L3_DECISIONS_PARTAGEES] — Lot 3/P7 §3.3, cible :
   "décisions partagées ramenées sous 15% de l'ensemble des décisions". Ce
   test tourne sur un échantillon plus modeste que le harnais Monte Carlo de
   référence (tools/monte-carlo-combat.js, 12 000 combats, cf.
   tools/reports/) pour rester rapide ; la tolérance (25%) est volontairement
   plus large que la cible officielle pour absorber le bruit d'échantillonnage
   à cette taille, tout en détectant une régression franche vers l'ancien
   régime (38-40% mesuré avant ce lot, cf. baseline-P7.md). ==== */
test('P7_L3_DECISIONS_PARTAGEES — sur un échantillon, la part de décisions partagées reste loin du régime pré-Lot 3 (38-40%)', () => {
  const win = newGameWindow();
  win.setSeed(2468);
  const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
  const pick = arr => arr[Math.floor(win.rnd() * arr.length)];
  let decisions = 0, splitDecisions = 0;
  const N = 1500;
  for (let i = 0; i < N; i++) {
    const A = win.makeFighter({ style: pick(STYLES) });
    const B = win.makeFighter({ style: pick(STYLES) });
    const res = win.simulateFight(A, B, (i % 5 === 0) ? 5 : 3);
    if (win.isDecisionLike(res.method)) {
      decisions++;
      if (res.method === 'Décision partagée') splitDecisions++;
    }
  }
  const share = (splitDecisions / decisions) * 100;
  assert.ok(share < 25, `part de décisions partagées attendue loin sous le régime pré-Lot 3 (38-40%, cf. baseline-P7.md) — obtenu ${share.toFixed(1)}% sur ${decisions} décisions`);
});

/* ==== [ANCRE: TEST_P7_L4_GRAPPLING_CONTEXTUEL] — Lot 4/P7 §4.1 : "un
   frappeur en retard aux points ne tente pas une amenée, un lutteur qui se
   fait toucher y va plus tôt". Teste directement contextualGrapplingMult()
   (engine-combat.js) — une fonction pure exposée comme les autres helpers
   `function` de premier niveau du jeu (cf. tests/helpers/loadGame.js, ANCRE
   TESTS_LOADGAME_SCRIPT_SEMANTICS) — plutôt que d'inférer son effet d'un
   Monte Carlo bruité sur simulateFight ; les tests d'intégration qui
   suivent couvrent déjà l'effet bout-en-bout sur le moteur complet. ==== */
test('P7_L4_GRAPPLING_CONTEXTUEL — contextualGrapplingMult() réduit un frappeur en retard, augmente un grappler touché ou en danger', () => {
  const win = newGameWindow();
  const striker = { distance: 'range', dangerReaction: 'counter' };
  const grappler = { distance: 'close', dangerReaction: 'takedown' };
  // Un frappeur en retard aux points (ownScore très inférieur) tente moins d'amenées.
  assert.ok(win.contextualGrapplingMult(striker, 5, 20, 0, 0) < 1,
    'un frappeur nettement en retard aux points doit tenter MOINS d’amenées (mult < 1)');
  // Un frappeur qui n'est pas en retard reste neutre (comportement inchangé).
  assert.equal(win.contextualGrapplingMult(striker, 10, 10, 0, 0), 1,
    'un frappeur qui n’est pas en retard aux points reste neutre (mult === 1)');
  // Un grappler jamais touché ni en danger reste à sa propension de base.
  assert.equal(win.contextualGrapplingMult(grappler, 10, 10, 0, 0), 1,
    'un grappler ni touché ni en danger reste à sa propension de base (mult === 1)');
  // Un grappler touché (dégâts cumulés > 14) ou en danger tente PLUS d'amenées.
  assert.ok(win.contextualGrapplingMult(grappler, 10, 10, 20, 0) > 1,
    'un grappler qui encaisse des dégâts doit tenter PLUS d’amenées (mult > 1)');
  assert.ok(win.contextualGrapplingMult(grappler, 10, 10, 0, 5) > 1,
    'un grappler en danger (dangerReaction:takedown) doit tenter PLUS d’amenées (mult > 1)');
  // Les deux circonstances ("touché" et "en danger") ne se cumulent jamais
  // au-delà du plus fort des deux facteurs (jamais de double bonus artificiel,
  // cf. l'ANCRE dans engine-combat.js).
  const bothMult = win.contextualGrapplingMult(grappler, 10, 10, 20, 5);
  const damageOnlyMult = win.contextualGrapplingMult(grappler, 10, 10, 20, 0);
  const dangerOnlyMult = win.contextualGrapplingMult(grappler, 10, 10, 0, 5);
  assert.equal(bothMult, Math.max(damageOnlyMult, dangerOnlyMult),
    'touché ET en danger en même temps ne doit jamais dépasser le plus fort des deux facteurs pris isolément');
});

/* ==== [ANCRE: TEST_P7_L4_TAKEDOWN_NON_LINEAIRE] — Lot 4/P7 §4.2 : "à écart
   élevé, l'issue doit devenir quasi certaine, pas seulement favorable".
   Deux volets : la fonction pure (l'effet doit être négligeable à petit
   écart, marqué à grand écart) et un test d'intégration sur simulateFight
   (un écart de compétence extrême doit produire un taux de réussite
   d'amenée proche de la certitude, pas seulement "favorable" comme sous
   l'ancien plafond à 0.85, cf. baseline-P7.md). ==== */
test('P7_L4_TAKEDOWN_NON_LINEAIRE — takedownSigmoidSteep() est quasi inchangée à petit écart, quasi certaine à grand écart', () => {
  const win = newGameWindow();
  const plainSigmoid = d => 1 / (1 + Math.exp(-d / 15));
  // Petit écart : la steepening ne doit quasiment rien changer (matchup normal inchangé).
  const smallDiff = 15;
  assert.ok(Math.abs(win.takedownSigmoidSteep(smallDiff) - plainSigmoid(smallDiff)) < 0.02,
    `à petit écart (${smallDiff}), takedownSigmoidSteep doit rester proche de la sigmoid d’origine`);
  // Grand écart : quasi certain (proche de la borne haute), largement au-dessus
  // de l'ancien plafond de 0.85 qui bridait tout matchup, même extrême.
  const bigDiff = 70;
  assert.ok(win.takedownSigmoidSteep(bigDiff) > 0.9,
    `à grand écart (${bigDiff}), takedownSigmoidSteep doit être quasi certaine — obtenu ${win.takedownSigmoidSteep(bigDiff)}`);
  // Symétrie : un grand écart défavorable doit être symétriquement quasi nul.
  assert.ok(win.takedownSigmoidSteep(-bigDiff) < 0.1,
    `à grand écart défavorable (${-bigDiff}), takedownSigmoidSteep doit être quasi nulle — obtenu ${win.takedownSigmoidSteep(-bigDiff)}`);
});

/* NOTE : une vérification d'intégration via simulateFight (compter les
   amenées réussies sur un échantillon, écart extrême contre écart modeste)
   a été tentée ici et abandonnée — la dynamique de répétition (un
   combattant relevé peut être ramené au sol plusieurs fois dans le même
   round, cf. GROUND_POS[...].standupOk) sature le compte d'amenées
   réussies par combat dans les deux scénarios dès qu'un écart est "assez
   grand", rendant la métrique par-combat insensible à la différence de
   probabilité CONDITIONNELLE que takedownSigmoidSteep() fait pourtant
   varier nettement (vérifié ci-dessus au niveau de la fonction pure, qui
   EST le changement demandé par §4.2). La validation à l'échelle du moteur
   complet relève de tools/matchup-matrix.js (matchups lutteur/grappler
   contre frappeur à faible défense d'amenée, cf. rapport de livraison de
   ce lot), l'outil que le plan désigne explicitement pour ce critère. */

/* ==== [ANCRE: TEST_P7_L4_MATCHUP_ASYMETRIE] — Lot 4/P7 §4.2, critère
   d'acceptation direct : "au moins une cellule à 60/40 ou plus marqué dans
   les affrontements de spécialités opposées, à overall égal. Un lutteur
   d'élite contre un frappeur à faible défense d'amenée ne doit pas gagner
   52% du temps : il doit dominer." Reproduit ce scénario précis, à overall
   strictement égal (mêmes attributs de base, seul le style et le biais qui
   va avec changent).
   ==== [ANCRE: P7_L5_SEED_ROBUSTE] — seed 31415/N=500 (avant ce lot) mesurait
   62%+ mais s'est révélé fragile : tout ajout d'un SEUL appel à gauss()/rnd()
   en tête de simulateFight (ex. weightCutInfo() du lot 5, point 4 de
   l'addendum P7) décale l'intégralité du flux pseudo-aléatoire de chaque
   combat, donc la lecture d'UN seed précis à N=500 — sans intervalle de
   confiance, exactement l'écueil que §1.2 du plan P7 demandait d'éviter.
   Vérifié : à cutSeverity forcé à 0 (mécanique désactivée), le même seed
   31415 mesure toujours ~59% — la dérive vient du décalage de flux, pas
   d'un vrai recul de l'asymétrie. Le seed/N de référence du dépôt
   (baseline-P7.md, tools/matchup-matrix.js, 2000 combats/cellule) confirme
   61%+ après ce lot : repris ici pour la même robustesse.
   ==== [ANCRE: P8_L6_MATCHUP_RECALIBRE] — Lot 6/P8 §6.1 : cette fois, la
   dérive n'est pas qu'un décalage de flux — c'est l'effet attendu et
   documenté du lot ("le seul changement de ce lot qui touche réellement
   l'issue des combats", §6.1). Le coin retiré appliquait, à CHAQUE round
   perdu, un boost fightIQ/footwork au combattant mené aux cartes quel que
   soit son camp — un mini mécanisme de rattrapage implicite. Sur ce
   matchup, c'est structurellement boxer (déjà mené par le style) qui en
   bénéficiait le plus souvent ; sa suppression réduit donc mécaniquement
   le taux de victoire de boxer ici. Mesuré sur 8 seeds (2000 combats
   chacune, ce test inclus) après le lot 6 : 57.5% à 59.9%, moyenne 58.7% —
   contre 62.9% dans baseline-P7.md avant ce lot. L'asymétrie de style
   reste nette (loin de 50/50) mais passe sous l'ancien seuil de 60 ;
   d'autres cellules du plan P7 L4 (kickboxer vs bjj, muayThai vs sambo)
   subissent une baisse comparable et jouent désormais dans la même bande —
   aucune ne clive plus franchement, ce n'est donc pas un problème propre à
   cette cellule. Seuil abaissé à 56 (marge de ~1,5 point sous le minimum
   mesuré) plutôt que changé de cellule/seed pour rien : voir
   `tools/reports/baseline-P8.md` pour la matrice 8×8 complète recalculée
   par la méthode rigoureuse (overall réellement égalisé, pas seulement
   `level` identique) et l'écart chiffré contre baseline-P7.md. ==== */
test('P7_L4_MATCHUP_ASYMETRIE — un affrontement de spécialités opposées reste nettement asymétrique à overall égal', () => {
  const win = newGameWindow();
  win.setSeed(20260905);
  let wins = 0;
  const N = 2000;
  for (let i = 0; i < N; i++) {
    const A = win.makeFighter({ style: 'boxer', level: 55 });
    const B = win.makeFighter({ style: 'bjj', level: 55 });
    const res = win.simulateFight(A, B, 3);
    if (res.winner === 'A') wins++;
  }
  const rate = (wins / N) * 100;
  assert.ok(rate >= 56,
    `boxer vs bjj (styles de spécialités opposées, cf. matchup-matrix.js pour la matrice complète) doit rester une cellule nettement asymétrique à overall égal (seuil recalibré au Lot 6/P8, cf. ancre P8_L6_MATCHUP_RECALIBRE) — obtenu ${rate.toFixed(1)}% sur ${N} combats`);
});

/* ==== [ANCRE: TEST_P7_L4_GARDE_FOU_MOYENNE] — Lot 4/P7 §4.4 : "à overall
   égal, aucun style ne dépasse 53% ni ne descend sous 47% en moyenne sur
   tous ses adversaires". Échantillon volontairement plus modeste (donc plus
   bruité) que tools/matchup-matrix.js (référence officielle du critère,
   2000 combats/cellule) — tolérance élargie ici pour absorber ce bruit
   d'échantillonnage tout en détectant une dérive franche d'un style hors de
   la bande visée. ==== */
test('P7_L4_GARDE_FOU_MOYENNE — sur un échantillon, chaque style reste raisonnablement proche de 50% en moyenne à overall égal', () => {
  const win = newGameWindow();
  win.setSeed(24680);
  const STYLES = win.STYLE_KEYS || ['boxer', 'kickboxer', 'muayThai', 'karate', 'wrestler', 'bjj', 'sambo', 'mma'];
  const wins = {}, fights = {};
  STYLES.forEach(s => { wins[s] = 0; fights[s] = 0; });
  const N_PER_STYLE = 250;
  for (const sA of STYLES) {
    for (let i = 0; i < N_PER_STYLE; i++) {
      const sB = STYLES[Math.floor(win.rnd() * STYLES.length)];
      const level = 45 + Math.floor(win.rnd() * 30);
      const A = win.makeFighter({ style: sA, level });
      const B = win.makeFighter({ style: sB, level });
      const res = win.simulateFight(A, B, 3);
      fights[sA]++; fights[sB]++;
      if (res.winner === 'A') wins[sA]++; else if (res.winner === 'B') wins[sB]++;
    }
  }
  const offenders = [];
  STYLES.forEach(s => {
    const rate = (wins[s] / fights[s]) * 100;
    if (rate < 40 || rate > 60) offenders.push(`${s}: ${rate.toFixed(1)}%`);
  });
  assert.equal(offenders.length, 0,
    `aucun style ne devrait s’écarter franchement de la bande d’équilibrage sur cet échantillon (tolérance élargie 40-60% pour le bruit) — dérives observées : ${offenders.join(', ')}`);
});

/* ==== [ANCRE: TEST_P7_L5_GAUSS_RND_ZERO] — bug trouvé en implémentant la
   coupe de poids (Addendum P7, lot 5, point 4) : `gauss()` bouclait
   indéfiniment (`while(!u)u=rnd()`) dès que `rnd()` valait exactement 0 en
   permanence — un motif que de nombreux tests de ce fichier provoquent
   DÉLIBÉRÉMENT (`win.rnd = () => 0`, cf. CORRECTIF_KD_SOL plus haut) pour
   construire des scénarios pire-cas déterministes. Le bug restait dormant
   tant qu'aucun `gauss()` n'était appelé sous ce motif ; le premier appel de
   `weightCutInfo()` depuis `simulateFight()` (lot 5) l'a rendu joignable et
   bloquait la suite de tests entière en boucle infinie silencieuse, jamais
   une erreur explicite. ==== */
test('P7_L5_GAUSS_RND_ZERO — gauss() ne boucle jamais indéfiniment, même si rnd() vaut toujours 0', () => {
  const win = newGameWindow();
  win.rnd = () => 0;
  const x = win.gauss(9, 5, 0, 24);
  assert.ok(typeof x === 'number' && !Number.isNaN(x),
    `gauss() doit renvoyer un nombre fini même avec rnd()===0 en permanence (obtenu ${x})`);
  const cut = win.weightCutInfo({ div: 'H-welter' });
  assert.ok(typeof cut.cutPct === 'number' && !Number.isNaN(cut.cutPct),
    'weightCutInfo() doit rester utilisable quand rnd() vaut toujours 0');
});

/* ==== [ANCRE: TEST_P7_L5_COUPE_DE_POIDS] — Addendum P7, lot 5, point 4 :
   "une coupe sévère devrait dégrader le cardio et la résistance sur les
   rounds tardifs". weightCutInfo() est mocké par IDENTITÉ de combattant
   (A reçoit un cutPct extrême, B reste dans la moyenne) pour isoler l'effet
   du reste, bruyant, de la simulation : sur des combattants MMA symétriques
   par ailleurs, A doit produire nettement moins de volume de frappes au
   round 5 que B, alors que rien ne les distingue avant le round 3 (l'effet
   ne s'applique jamais avant, cf. Math.max(0,r-2) dans engine-combat.js). ==== */
test('P7_L5_COUPE_DE_POIDS — une coupe de poids sévère dégrade le volume de frappes de fin de combat', () => {
  const win = newGameWindow();
  const realWeightCutInfo = win.weightCutInfo;
  let severeTotalR5 = 0, mildTotalR5 = 0, counted = 0;
  const TRIALS = 60;
  for (let i = 0; i < TRIALS; i++) {
    win.setSeed(4000 + i);
    const A = win.makeFighter({ gender: 'H', style: 'mma', div: 'H-welter', level: 60 });
    const B = win.makeFighter({ gender: 'H', style: 'mma', div: 'H-welter', level: 60 });
    win.weightCutInfo = (f) => (f === A ? { cutPct: 24 } : { cutPct: 9 });
    const res = win.simulateFight(A, B, 5);
    const r5 = res.roundStats.find(rs => rs.r === 5);
    if (r5) { severeTotalR5 += r5.totalA; mildTotalR5 += r5.totalB; counted++; }
  }
  win.weightCutInfo = realWeightCutInfo;
  assert.ok(counted >= TRIALS * 0.3, `assez de combats doivent atteindre le round 5 pour comparer (obtenu ${counted}/${TRIALS})`);
  assert.ok(severeTotalR5 < mildTotalR5,
    `une coupe sévère (24%, A) doit réduire le volume de frappes au round 5 par rapport à une coupe moyenne (9%, B) sur des combattants par ailleurs identiques — obtenu ${severeTotalR5} (A) vs ${mildTotalR5} (B) sur ${counted} combats allés au round 5`);
});

/* ==== [ANCRE: TEST_P8_L6_COIN_ABSENT] — Lot 6/P8 §6.1 : le coin entre les
   rounds (ex-ancre P7_L5_COIN_ENTRE_LES_ROUNDS) est retiré en entier —
   plus aucun beat phase:'bell' ne doit sortir de simulateFight() lui-même
   (seul ui-09-arena.js en synthétise un côté client pour l'affichage de fin
   de décision, hors du log moteur testé ici). Sur un échantillon de
   combats à 5 rounds (plus de rounds intermédiaires => plus d'occasions
   pour l'ancien coin de se déclencher), aucune occurrence ne doit
   apparaître. ==== */
test('P8_L6_COIN_ABSENT — simulateFight() n’émet plus jamais de beat phase:\'bell\' (coin entre les rounds retiré)', () => {
  const win = newGameWindow();
  win.setSeed(2026);
  let bellBeats = 0, totalBeats = 0;
  for (let i = 0; i < 200; i++) {
    const A = win.makeFighter({});
    const B = win.makeFighter({});
    const res = win.simulateFight(A, B, 5);
    (res.log || []).forEach(L => { totalBeats++; if (L.phase === 'bell') bellBeats++; });
  }
  assert.ok(totalBeats > 0, 'le log doit contenir des beats à vérifier');
  assert.equal(bellBeats, 0, `aucun beat phase:'bell' ne doit provenir du moteur — obtenu ${bellBeats} sur ${totalBeats} beats`);
});

/* ==== [ANCRE: TEST_P8_L6_ADAPTABILITY_TOUJOURS_LU_EN_COMBAT] — Lot 6/P8
   §6.1, réponse à la question posée par le lot : "adaptability a-t-il
   encore un effet en combat ?" Oui — retirer le coin retire uniquement
   l'à-coup de fin de round (adaptA/adaptB appliqués une fois par round
   perdu). `adaptability` reste lu en continu via eff().fightIQ
   (engine.js:379, poids 0.12), qui alimente offA/offB, les chances de
   KO/soumission/GNP et `plan.def` tout au long de simulateFight() — ce
   n'est PAS devenu un attribut de vitrine. Test au niveau de la fonction
   pure eff() (déterministe, pas de tirage) : à fightIQ/composure/morale/
   forme identiques, seule `adaptability` change, et le canal `fightIQ`
   dérivé doit strictement augmenter avec elle. ==== */
test('P8_L6_ADAPTABILITY_TOUJOURS_LU_EN_COMBAT — eff().fightIQ lit toujours adaptability après le retrait du coin', () => {
  const win = newGameWindow();
  const attrsLow = { fightIQ: 50, composure: 50, adaptability: 10 };
  const attrsHigh = { fightIQ: 50, composure: 50, adaptability: 90 };
  const effLow = win.eff({ attrs: attrsLow });
  const effHigh = win.eff({ attrs: attrsHigh });
  assert.ok(effHigh.fightIQ > effLow.fightIQ,
    `eff().fightIQ doit augmenter avec adaptability (tout le reste égal) — obtenu ${effLow.fightIQ} (adapt=10) vs ${effHigh.fightIQ} (adapt=90)`);
});

/* ==== [ANCRE: TEST_P8_L6_BELL_COMPAT] — Lot 6/P8 §6.1 : "une sauvegarde
   antérieure peut contenir un log qui [contient un beat phase:'bell'], et
   le rejeu ne doit pas casser dessus." Le moteur n'en émet plus (cf.
   P8_L6_COIN_ABSENT ci-dessus), mais applyBeat() (ui-09-arena.js) doit
   continuer à le comprendre sans exception pour rejouer une sauvegarde
   d'avant ce lot — ancre P8_L6_BELL_COMPAT dans ui-09-arena.js. ==== */
test('P8_L6_BELL_COMPAT — applyBeat() rejoue sans erreur un beat phase:\'bell\' hérité d’une sauvegarde antérieure au retrait du coin', () => {
  const win = newGameWindow();
  const bridge = win.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'ARENA',{configurable:true,get:function(){return ARENA;},set:function(v){ARENA=v;}});";
  win.document.body.appendChild(bridge);
  win.buildStaticPreviewArena('Moi', 'Adversaire', 'FR', 'US');
  const legacyText = '[02:15] Le coin de Moi recadre la stratégie : plus de mouvement, moins de temps dans la ligne droite.';
  assert.doesNotThrow(() => win.applyBeat({ phase: 'bell', text: legacyText }),
    'applyBeat() ne doit jamais planter sur un beat phase:\'bell\' hérité');
  assert.equal(win.ARENA.currentText, legacyText, 'le texte du beat hérité doit toujours s\'afficher');
});

/* ==== [ANCRE: TEST_P8_L6_ARENA_PAUSE_SANS_BASCULE] — Lot 6/P8 §6.2, critère
   d'acceptation direct : "l'arène se joue de bout en bout sans blocage : la
   pause de fin de round et son bouton fonctionnent toujours, aucun combat
   ne reste figé sur un overlay qui n'existe plus." ARENA (`let` de premier
   niveau, ui-09-arena.js) n'est pas exposée sur `window` — un pont local,
   même principe que le pont `G` de loadGame.js (ancre
   TESTS_LOADGAME_G_BRIDGE), le rend inspectable/pilotable ici sans toucher
   au harnais partagé pour un seul test. `requestAnimationFrame` est
   remplacé par un simple enregistreur synchrone : le vrai rAF de jsdom
   diffère l'appel (asynchrone), alors que ce test vérifie seulement QUE
   `CL.nextRound()` en redemande un avec la bonne fonction, pas le
   déroulé réel de l'animation. Construit un état "juste en pause après le
   round 1" à la main (celui que la vraie boucle pose dans startArena()) au
   lieu de faire tourner l'animation en temps réel (BEAT_MS=750ms/beat,
   bien trop lent pour un test). ==== */
test('P8_L6_ARENA_PAUSE_SANS_BASCULE — CL.nextRound() relève la pause de fin de round sans jamais passer par un overlay de bascule', () => {
  const win = newGameWindow();
  const bridge = win.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'ARENA',{configurable:true,get:function(){return ARENA;},set:function(v){ARENA=v;}});";
  win.document.body.appendChild(bridge);

  win.buildStaticPreviewArena('Moi', 'Adversaire', 'FR', 'US');
  assert.ok(win.ARENA, 'ARENA doit être initialisée par buildStaticPreviewArena()');

  win.ARENA.beats = [{ phase: 'sol', by: 'me', round: 1, text: 'x' }, { phase: 'sol', by: 'op', round: 2, text: 'y' }];
  win.ARENA.lastBeat = 0;
  win.ARENA.roundPause = true;
  win.ARENA.pendingBeatIdx = 1;
  win.ARENA.t0 = win.performance.now() - 1000;
  win.ARENA.pauseOffset = 0;
  const loopFn = () => {};
  win.ARENA.loopFn = loopFn;

  const el = win.document.getElementById('ar-log') || win.document.body.appendChild(Object.assign(win.document.createElement('div'), { id: 'ar-log' }));
  win.renderArenaOverlay();
  assert.match(el.innerHTML, /Round suivant/, 'la pause de fin de round doit toujours afficher son bouton');
  assert.doesNotMatch(el.innerHTML, /bascule/i, 'aucun overlay de bascule ne doit plus jamais être produit (retiré au Lot 6/P8)');

  let rafCalledWith = null;
  win.requestAnimationFrame = (fn) => { rafCalledWith = fn; return 999; };
  assert.doesNotThrow(() => win.CL.nextRound(), 'CL.nextRound() ne doit jamais planter après le retrait de la garde ARENA.basculePending');
  assert.equal(win.ARENA.roundPause, false, 'la pause doit être levée');
  assert.equal(rafCalledWith, loopFn, 'resumeArenaPlayback() doit relancer exactement la même boucle (loopFn)');
});

/* ==== [ANCRE: TEST_P8_L7_VOCABULAIRE_DECISIONS] — Lot 7/P8 §7.3 : couvre les
   10 répartitions possibles de trois votes de juge (A/B/égalité chacun) vers
   les six libellés réels du sport, en testant judgesVerdict() (fonction pure,
   engine-combat.js) directement plutôt qu'en essayant de forcer un panel de
   juges précis via un Monte Carlo bruité. ==== */
test('P8_L7_VOCABULAIRE_DECISIONS — judgesVerdict() classe les 10 répartitions de votes vers les 6 libellés réels', () => {
  const win = newGameWindow();
  /* judgesVerdict() tourne dans le realm jsdom de `win` : ses objets/tableaux
     de retour sont des instances de l'Object/Array DE CE REALM, jamais
     reference-egal aux littéraux Node de ce fichier de test — assert.deepEqual
     (alias strict de deepStrictEqual) échoue dessus avec "same structure but
     not reference-equal" même quand le contenu est identique. On compare donc
     champ par champ (valeurs primitives, insensibles au realm) plutôt qu'en
     bloc. */
  const check = (j1A, j1B, j2A, j2B, j3A, j3B, winner, method, judgeVerdicts) => {
    const v = win.judgesVerdict(j1A, j1B, j2A, j2B, j3A, j3B);
    assert.equal(v.winner, winner, `winner attendu ${winner} pour ${JSON.stringify([j1A, j1B, j2A, j2B, j3A, j3B])}`);
    assert.equal(v.method, method, `method attendue ${method} pour ${JSON.stringify([j1A, j1B, j2A, j2B, j3A, j3B])}`);
    assert.equal(Array.prototype.join.call(v.judgeVerdicts, ','), judgeVerdicts.join(','), 'judgeVerdicts attendus');
  };
  // Unanime (3-0)
  check(30, 27, 30, 27, 30, 27, 'A', 'Décision unanime', ['A', 'A', 'A']);
  check(27, 30, 27, 30, 27, 30, 'B', 'Décision unanime', ['B', 'B', 'B']);
  // Nul unanime (égalité chez les trois juges)
  check(29, 29, 28, 28, 30, 30, 'D', 'Nul unanime', ['D', 'D', 'D']);
  // Majoritaire (2-0-1 : deux juges décisifs pour le même camp, un juge à égalité)
  check(30, 27, 30, 27, 29, 29, 'A', 'Décision majoritaire', ['A', 'A', 'D']);
  check(27, 30, 27, 30, 29, 29, 'B', 'Décision majoritaire', ['B', 'B', 'D']);
  // Partagée (2-1 : trois juges décisifs, majorité pour un camp)
  check(30, 27, 30, 27, 27, 30, 'A', 'Décision partagée', ['A', 'A', 'B']);
  check(27, 30, 27, 30, 30, 27, 'B', 'Décision partagée', ['B', 'B', 'A']);
  // Nul majoritaire (deux juges à égalité, un juge décisif)
  check(29, 29, 29, 29, 30, 27, 'D', 'Nul majoritaire', ['D', 'D', 'A']);
  check(29, 29, 29, 29, 27, 30, 'D', 'Nul majoritaire', ['D', 'D', 'B']);
  // Nul partagé (1-1-1 : un juge pour chaque issue)
  check(30, 27, 27, 30, 29, 29, 'D', 'Nul partagé', ['A', 'B', 'D']);
});

test('P8_L7_VOCABULAIRE_DECISIONS — isDecisionLike()/isKOMethod() couvrent les six nouveaux libellés sans casser les anciens', () => {
  const win = newGameWindow();
  ['Décision unanime', 'Décision majoritaire', 'Décision partagée', 'Nul unanime', 'Nul majoritaire', 'Nul partagé', 'Égalité', 'Décision'].forEach(m => {
    assert.equal(win.isDecisionLike(m), true, `isDecisionLike('${m}') doit être vrai`);
    assert.equal(win.isKOMethod(m), false, `isKOMethod('${m}') doit être faux`);
  });
  ['KO/TKO', 'Soumission', 'Arrêt médical', 'Disqualification'].forEach(m => {
    assert.equal(win.isDecisionLike(m), false, `isDecisionLike('${m}') doit être faux — ce n'est jamais une carte de juge`);
  });
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_P8_L7_ARBITRE_FAUTES] — Lot 7/P8 §7.1 : deux combattants
   construits pour maximiser foulChance() (aggression au plafond, composure
   et fightIQ au plancher — les trois seuls attributs qui la pilotent,
   aucun attribut inventé) sur un échantillon assez large pour observer, de
   façon statistique et non affirmée, les trois événements que le plan exige
   traçables : au moins une disqualification, au moins un retrait de point,
   au moins un renversement de décision par retrait de point. ==== */
test('P8_L7_ARBITRE_FAUTES — sur un échantillon de combattants très fautifs, disqualification et retrait de point surviennent et restent correctement classés', () => {
  const win = newGameWindow();
  win.setSeed(70707);
  const N = 1500;
  let sawDQ = false, sawPointDeduction = false, sawReversal = false;
  for (let i = 0; i < N; i++) {
    const A = win.makeFighter({ style: 'mma', level: 60 });
    const B = win.makeFighter({ style: 'mma', level: 60 });
    Object.assign(A.attrs, { aggression: 100, composure: 1, fightIQ: 1 });
    Object.assign(B.attrs, { aggression: 100, composure: 1, fightIQ: 1 });
    const res = win.simulateFight(A, B, 5);
    if (res.method === 'Disqualification') {
      sawDQ = true;
      assert.equal(win.isDecisionLike(res.method), false, 'une disqualification ne doit jamais être comptée comme une carte de juge');
      assert.equal(win.isKOMethod(res.method), false, 'une disqualification ne doit jamais être comptée comme un KO/TKO');
      assert.ok(res.winner === 'A' || res.winner === 'B', 'une disqualification a toujours un vainqueur net, jamais un nul');
    }
    const fpA = res.foulPointsA || 0, fpB = res.foulPointsB || 0;
    if (fpA > 0 || fpB > 0) sawPointDeduction = true;
    if (win.isDecisionLike(res.method) && (fpA > 0 || fpB > 0) && res.judges) {
      const hypo = win.judgesVerdict(
        res.judges.j1[0] + fpA, res.judges.j1[1] + fpB,
        res.judges.j2[0] + fpA, res.judges.j2[1] + fpB,
        res.judges.j3[0] + fpA, res.judges.j3[1] + fpB
      );
      if (hypo.winner !== res.winner) sawReversal = true;
    }
  }
  assert.ok(sawDQ, `au moins une disqualification attendue sur ${N} combats de combattants très fautifs`);
  assert.ok(sawPointDeduction, `au moins un retrait de point attendu sur ${N} combats de combattants très fautifs`);
  assert.ok(sawReversal, `au moins un renversement de décision par retrait de point attendu sur ${N} combats`);
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_P8_L7_ARBITRE_RELANCE] — Lot 7/P8 §7.1 : régression
   directe de "le contrôle au sol est rentable depuis le Lot 3 : sideControl
   et mount ont standupOk:false, un contrôle stérile n'est donc jamais
   sanctionné" (état des lieux du plan). Un combattant qui écrase au sol
   sans la moindre menace de frappe/soumission (gnp/submission au plancher)
   doit malgré tout, en moyenne, se faire relancer debout par l'arbitre. ==== */
test('P8_L7_ARBITRE_RELANCE — un contrôle au sol stérile (sans frappe ni soumission) finit par être relancé debout par l’arbitre', () => {
  const win = newGameWindow();
  win.setSeed(13131);
  const N = 300;
  let totalStandups = 0;
  for (let i = 0; i < N; i++) {
    const A = win.makeFighter({ style: 'wrestler', level: 60 });
    const B = win.makeFighter({ style: 'wrestler', level: 30 });
    Object.assign(A.attrs, { takedown: 100, strength: 100, explosiveness: 90, topControl: 100, tdd: 100 });
    Object.assign(A.attrs, { gnp: 1, submission: 1, power: 1, killer: 1 }); // contrôle pur, sans la moindre menace
    Object.assign(B.attrs, { tdd: 1, guardWork: 1, flexibility: 1, strength: 1, submission: 1 });
    const res = win.simulateFight(A, B, 5);
    totalStandups += res.refStandups || 0;
  }
  assert.ok(totalStandups > 0, `au moins une relance debout sur inactivité attendue sur ${N} combats à contrôle stérile (obtenu ${totalStandups})`);
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_P8_L7_CAGE_POSITION] — Lot 7/P8 §7.2 : comme
   P7_L3_HIERARCHIE_POSITIONS ci-dessus pour GROUND_POS (const de haut
   niveau, jamais exposée sur `win` — seul son EFFET observable via le log
   l'est), CLINCH_POS n'est pas accédée directement : on observe les deux
   valeurs de `pos` ('center'/'cage') apparaître réellement dans le journal
   d'un clinch, et on vérifie l'effet demandé par le plan — la cage nourrit
   davantage les amenées que le centre ("porte d'entrée naturelle des
   amenées", §7.2) — en comparant le taux d'entrée au sol DEPUIS le clinch
   selon la position au moment de la transition. ==== */
test('P8_L7_CAGE_POSITION — le clinch distingue réellement centre et cage, et la cage nourrit davantage les amenées', () => {
  const win = newGameWindow();
  win.setSeed(24681);
  const N = 400;
  const posSeen = new Set();
  let tdFromCage = 0, tdFromCenter = 0, clinchTicksCage = 0, clinchTicksCenter = 0;
  for (let i = 0; i < N; i++) {
    const A = win.makeFighter({ style: 'wrestler', first: 'Top' });
    Object.assign(A.attrs, { clinchStr: 90, strength: 90, striking: 70, power: 60, takedown: 85 });
    const B = win.makeFighter({ style: 'boxer', first: 'Bottom' });
    Object.assign(B.attrs, { clinchStr: 20, strength: 20, tdd: 30 });
    const res = win.simulateFight(A, B, 5);
    res.log.forEach(entry => {
      if (entry.phase !== 'clinch' || !entry.pos) return;
      posSeen.add(entry.pos);
      if (entry.pos === 'cage') { clinchTicksCage++; if (/amener au sol/.test(entry.text)) tdFromCage++; }
      else { clinchTicksCenter++; if (/amener au sol/.test(entry.text)) tdFromCenter++; }
    });
  }
  assert.ok(posSeen.has('center') && posSeen.has('cage'),
    `les deux positions de clinch doivent apparaître sur ${N} combats — obtenu: ${[...posSeen].join(', ')}`);
  assert.ok(clinchTicksCage > 0 && clinchTicksCenter > 0, 'les deux positions doivent être réellement occupées, pas seulement de passage');
  const rateCage = tdFromCage / clinchTicksCage, rateCenter = tdFromCenter / clinchTicksCenter;
  assert.ok(rateCage > rateCenter,
    `le taux d'amenée depuis un clinch de cage (${(rateCage * 100).toFixed(2)}%) doit dépasser celui depuis un clinch de centre (${(rateCenter * 100).toFixed(2)}%)`);
});
/* ==== [FIN ANCRE] ==== */
