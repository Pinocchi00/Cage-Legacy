"use strict";
/* CAGE LEGACY — tests/duel.test.js
   LOT DUEL-01 — "Duel entre amis" : codec (encodage/décodage/validation),
   PRNG déterministe et moteur de série (best-of-3, avenant "Format en trois
   manches"). Toutes les fonctions testées ici vivent dans duel-codec.js et
   ne touchent jamais à G — aucun test ci-dessous n'a besoin de démarrer une
   carrière. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function makeSample(win, opts){
  const f = win.makeFighter(Object.assign({gender:'H', style:'boxer', div:'H-welter', level:60}, opts||{}));
  f.W = 5; f.L = 2; f.D = 1;
  return f;
}
// ATTR_KEYS/STYLE_KEYS/divById sont déclarés en `const`/arrow function dans
// engine.js — comme G (state-core.js), ce ne sont PAS des propriétés de
// `window` (seules les déclarations `function`/`var` de haut niveau le
// deviennent), donc inaccessibles en `win.ATTR_KEYS` depuis Node. `win.eval`
// les lit dans le même environnement lexical que le reste du jeu.
function getConst(win, name){ return win.eval(name); }

/* ------------------------------- codec ------------------------------- */

test('encodeDuelCode/decodeDuelCode — aller-retour identique sur les champs qui comptent', () => {
  const win = newGameWindow();
  win.setSeed(1);
  const f = makeSample(win, { first:'Alice' });
  f.nick = 'La Foudre'; f.flag = '🇫🇷'; f.skills = ['karate01','karate06'];
  const code = win.encodeDuelCode(f);
  assert.ok(typeof code === 'string' && code.length > 0);
  const dec = win.decodeDuelCode(code);
  assert.equal(dec.ok, true);
  assert.equal(dec.fighter.name, f.name);
  assert.equal(dec.fighter.nick, f.nick);
  assert.equal(dec.fighter.div, f.div);
  assert.equal(dec.fighter.style, f.style);
  assert.equal(dec.fighter.W, f.W); assert.equal(dec.fighter.L, f.L); assert.equal(dec.fighter.D, f.D);
  assert.equal(dec.fighter.flag, f.flag);
  // Array.from() ramène les tableaux (potentiellement d'un autre "royaume"
  // JS — jsdom vs Node) à de vrais tableaux Node avant comparaison stricte.
  assert.deepEqual(Array.from(dec.fighter.skills).sort(), Array.from(f.skills).sort());
  for(const k of getConst(win,'ATTR_KEYS')) assert.equal(dec.fighter.attrs[k], Math.round(f.attrs[k]), `attribut ${k} doit survivre au round-trip`);
});

test('encodeDuelCode/decodeDuelCode — aller-retour avec accents et apostrophes', () => {
  const win = newGameWindow();
  win.setSeed(2);
  const f = makeSample(win, { first:'Theo' });
  f.name = "Théo N'Diaye"; f.first = f.name; f.nick = 'Müller';
  const code = win.encodeDuelCode(f);
  const dec = win.decodeDuelCode(code);
  assert.equal(dec.ok, true);
  assert.equal(dec.fighter.name, "Théo N'Diaye");
  assert.equal(dec.fighter.nick, 'Müller');
});

test('encodeDuelCode — un combattant réel produit un code de moins de 400 caractères', () => {
  const win = newGameWindow();
  win.setSeed(3);
  const f = makeSample(win, { first:'Champion' });
  f.nick = 'Le Champion Incontesté';
  f.flag = '🇧🇷';
  f.skills = ['karate01','karate02','karate03','karate04','karate05','karate06','karate07','karate08','karate09','karate10'];
  const code = win.encodeDuelCode(f);
  assert.ok(code.length < 400, `code trop long : ${code.length} caractères`);
});

test('decodeDuelCode — code tronqué, checksum faux ou préfixe absent : ok:false, jamais de throw', () => {
  const win = newGameWindow();
  win.setSeed(4);
  const f = makeSample(win, { first:'Bob' });
  const code = win.encodeDuelCode(f);
  const parts = code.split('.');

  assert.doesNotThrow(() => win.decodeDuelCode(code.slice(0, -8)));
  assert.equal(win.decodeDuelCode(code.slice(0, -8)).ok, false);

  const badChecksum = `${parts[0]}.${parts[1]}.zzzz`;
  assert.doesNotThrow(() => win.decodeDuelCode(badChecksum));
  assert.equal(win.decodeDuelCode(badChecksum).ok, false);

  const noPrefix = `${parts[1]}.${parts[2]}`;
  assert.doesNotThrow(() => win.decodeDuelCode(noPrefix));
  assert.equal(win.decodeDuelCode(noPrefix).ok, false);

  assert.doesNotThrow(() => win.decodeDuelCode(''));
  assert.equal(win.decodeDuelCode('').ok, false);
  assert.doesNotThrow(() => win.decodeDuelCode(null));
  assert.equal(win.decodeDuelCode(null).ok, false);
  assert.doesNotThrow(() => win.decodeDuelCode(undefined));
  assert.doesNotThrow(() => win.decodeDuelCode(12345));
  assert.doesNotThrow(() => win.decodeDuelCode('n’importe quoi de collé par erreur'));

  // Espaces/retours à la ligne insérés par un copier-coller mobile ne
  // doivent PAS faire échouer un code par ailleurs valide.
  const withWs = `${parts[0]}.\n ${parts[1]}  \n.${parts[2]}`;
  assert.equal(win.decodeDuelCode(withWs).ok, true);
  // Casse du préfixe normalisée.
  const lowerPrefix = `${parts[0].toLowerCase()}.${parts[1]}.${parts[2]}`;
  assert.equal(win.decodeDuelCode(lowerPrefix).ok, true);
});

test('decodeDuelCode — valeurs hors bornes dans le payload : clampées, jamais NaN/Infinity', () => {
  const win = newGameWindow();
  win.setSeed(5);
  const craftCode = win.eval(`(function(arr){
    const json = JSON.stringify(arr);
    const payload = duelUtf8ToBase64Url(json);
    return DUEL_CODE_PREFIX + '.' + payload + '.' + duelChecksum4(payload);
  })`);
  const insaneAttrs = new Array(30).fill(99999);
  const code = craftCode(['X', '', 999999, -999999, 1e12, -1e12, NaN, insaneAttrs, ['not-an-index', 999999, -1], 'toolongflag🏴🏴🏴🏴🏴', 'x'.repeat(500)]);
  const dec = win.decodeDuelCode(code);
  assert.equal(dec.ok, true);
  assert.ok(Number.isFinite(dec.fighter.W)); assert.ok(dec.fighter.W >= 0 && dec.fighter.W <= 999);
  assert.ok(Number.isFinite(dec.fighter.L)); assert.ok(dec.fighter.L >= 0 && dec.fighter.L <= 999);
  assert.ok(Number.isFinite(dec.fighter.D)); assert.ok(dec.fighter.D >= 0 && dec.fighter.D <= 999);
  for(const k of getConst(win,'ATTR_KEYS')){
    const v = dec.fighter.attrs[k];
    assert.ok(Number.isFinite(v), `attribut ${k} doit être fini`);
    assert.ok(v >= 0 && v <= 100, `attribut ${k}=${v} doit être borné [0,100]`);
  }
  assert.ok(dec.fighter.flag.length <= 8);
  assert.ok(dec.fighter.sig.length <= 30);
  assert.ok(Array.isArray(dec.fighter.skills));
  assert.ok(win.eval(`!!divById(${JSON.stringify(dec.fighter.div)})`), 'la division retombe sur une division réelle du jeu');
  assert.ok(Array.from(getConst(win,'STYLE_KEYS')).includes(dec.fighter.style), 'le style retombe sur un style réel du jeu');
});

/* ------------------------- PRNG / déterminisme d'une manche ------------------------- */

test('runSeededDuelFight — même graine = même résultat, deux exécutions', () => {
  const win = newGameWindow();
  win.setSeed(6);
  const A = makeSample(win, { first:'A', style:'wrestler' });
  const B = makeSample(win, { first:'B', style:'bjj' });
  const r1 = win.runSeededDuelFight(win.JSON.parse(JSON.stringify(A)), win.JSON.parse(JSON.stringify(B)), 3, 12345);
  const r2 = win.runSeededDuelFight(win.JSON.parse(JSON.stringify(A)), win.JSON.parse(JSON.stringify(B)), 3, 12345);
  assert.equal(r1.winner, r2.winner);
  assert.equal(r1.method, r2.method);
  assert.equal(r1.round, r2.round);
});

test('runSeededDuelFight — rnd() (le PRNG réel du moteur) est restauré après la manche, y compris si simulateFight lève', () => {
  const win = newGameWindow();
  win.setSeed(7);
  const originalRnd = win.rnd;
  const A = makeSample(win, { first:'A' }), B = makeSample(win, { first:'B' });
  win.runSeededDuelFight(A, B, 3, 999);
  assert.equal(win.rnd, originalRnd, 'rnd doit être restauré après une manche normale');

  let threw = false;
  win.eval(`
    var __duelTestOrigSimulateFight = simulateFight;
    simulateFight = function(){ throw new Error('boom (attendu par le test)'); };
  `);
  try{ win.runSeededDuelFight({}, {}, 3, 1); }
  catch(e){ threw = true; }
  finally{ win.eval('simulateFight = __duelTestOrigSimulateFight;'); }
  assert.equal(threw, true, "l'exception de simulateFight doit bien remonter à l'appelant");
  // Le patch a bien été retiré même après une exception dans simulateFight.
  assert.equal(win.rnd, originalRnd, 'rnd doit être restauré même si simulateFight lève');
});

/* ------------------------------- série (avenant) ------------------------------- */

function twoCodes(win, seedA, seedB){
  win.setSeed(seedA);
  const A = makeSample(win, { first:'Alpha', style:'wrestler', level:65 });
  A.skills = ['karate01'];
  const codeA = win.encodeDuelCode(A);
  win.setSeed(seedB);
  const B = makeSample(win, { first:'Bravo', style:'bjj', level:58 });
  B.skills = ['karate02'];
  const codeB = win.encodeDuelCode(B);
  return { codeA, codeB, A, B };
}

test('simulateDuelSeries — au plus 3 manches, s’arrête dès 2 victoires', () => {
  const win = newGameWindow();
  const { codeA, codeB } = twoCodes(win, 10, 11);
  const series = win.simulateDuelSeries(codeA, codeB);
  assert.equal(series.ok, true);
  assert.ok(series.manches.length === 2 || series.manches.length === 3);
  assert.ok(series.score.self >= 2 || series.score.friend >= 2, 'la série doit se conclure sur 2 victoires (ou un départage explicite)');
  if(series.manches.length === 2) assert.equal(series.decider, false);
});

test('simulateDuelSeries — déterminisme : même paire de codes = mêmes 3 résultats, deux exécutions', () => {
  const win = newGameWindow();
  const { codeA, codeB } = twoCodes(win, 20, 21);
  const s1 = win.simulateDuelSeries(codeA, codeB);
  const s2 = win.simulateDuelSeries(codeA, codeB);
  assert.equal(s1.ok, true); assert.equal(s2.ok, true);
  assert.deepEqual(
    s1.manches.map(m => [m.winner, m.res.method, m.res.round||null]),
    s2.manches.map(m => [m.winner, m.res.method, m.res.round||null])
  );
  assert.deepEqual(s1.score, s2.score);
  assert.equal(s1.seriesWinner, s2.seriesWinner);
});

test('simulateDuelSeries — symétrie : (A,B) et (B,A) donnent le même vainqueur (identifié par son nom)', () => {
  const win = newGameWindow();
  const { codeA, codeB, A, B } = twoCodes(win, 30, 31);
  const sAB = win.simulateDuelSeries(codeA, codeB);
  const sBA = win.simulateDuelSeries(codeB, codeA);
  const winnerNameOf = s => s.seriesWinner === 'self' ? s.self.name : s.friend.name;
  assert.equal(winnerNameOf(sAB), winnerNameOf(sBA));
  const mancheNamesOf = s => s.manches.map(m => m.winner === 'self' ? s.self.name : (m.winner === 'friend' ? s.friend.name : 'draw'));
  assert.deepEqual(mancheNamesOf(sAB), mancheNamesOf(sBA));
});

test('simulateDuelSeries — les manches 1 et 2 ne sont pas de simples rejeux l’une de l’autre (preuve que les graines diffèrent)', () => {
  const win = newGameWindow();
  // Preuve directe et non-fragile : seedManche(1) et seedManche(2) sont
  // mathématiquement différentes (fonction pure de i, indépendante de tout
  // tirage de combat) — une comparaison sur le SEUL winner/method/round
  // d'une paire de combattants donnée serait fragile : un matchup très
  // déséquilibré peut légitimement retomber sur la même issue qualitative
  // (KO round 1) sur deux graines distinctes sans que ça prouve quoi que ce
  // soit sur les graines elles-mêmes.
  const seedBase = win.duelFnv1a32('graine-de-test-fixe');
  const s1 = win.duelFnv1a32(`${seedBase}#1`), s2 = win.duelFnv1a32(`${seedBase}#2`), s3 = win.duelFnv1a32(`${seedBase}#3`);
  assert.notEqual(s1, s2); assert.notEqual(s2, s3); assert.notEqual(s1, s3);

  // Et, empiriquement, au moins une paire de combattants testée produit des
  // journaux de combat manche par manche réellement différents (pas un
  // simple rejeu) — recherche sur plusieurs graines pour ne pas dépendre
  // d'un matchup particulier trop déséquilibré.
  let sawDifference = false;
  for(let i=0;i<20 && !sawDifference;i++){
    const { codeA, codeB } = twoCodes(win, 400+i, 500+i);
    const series = win.simulateDuelSeries(codeA, codeB);
    if(series.manches.length >= 2){
      const log1 = JSON.stringify(series.manches[0].res.log||[]);
      const log2 = JSON.stringify(series.manches[1].res.log||[]);
      if(log1 !== log2) sawDifference = true;
    }
  }
  assert.ok(sawDifference, 'au moins une paire de graines testées doit produire des journaux de manche différents');
});

test('simulateDuelSeries — la manche décisive (score 1-1 après la manche 2) est bien jouée sur 5 rounds', () => {
  const win = newGameWindow();
  // Cherche une paire de graines qui produit effectivement un 1-1 après 2 manches.
  let found = null;
  for(let i=0;i<60 && !found;i++){
    const { codeA, codeB } = twoCodes(win, 100+i, 200+i);
    const series = win.simulateDuelSeries(codeA, codeB);
    if(series.manches.length === 3) found = series;
  }
  assert.ok(found, 'aucune graine testée ne produit de manche décisive — vérifier la boucle de recherche');
  assert.equal(found.decider, true);
  assert.equal(found.manches[2].rounds, 5);
  assert.equal(found.manches[0].rounds, 3);
  assert.equal(found.manches[1].rounds, 3);
});

test('simulateDuelSeries — les fiches décodées d’origine ne sont jamais mutées', () => {
  const win = newGameWindow();
  const { codeA, codeB } = twoCodes(win, 50, 51);
  const decBefore = win.decodeDuelCode(codeA);
  const snapshot = JSON.stringify(decBefore.fighter);
  win.simulateDuelSeries(codeA, codeB);
  const decAfter = win.decodeDuelCode(codeA);
  assert.equal(JSON.stringify(decAfter.fighter), snapshot, 'décoder le même code avant/après une série doit toujours donner la même fiche');
});

test('simulateDuelSeries — la fatigue reste sous le plafond (25% du cardio/durability de base) même après deux manches', () => {
  const win = newGameWindow();
  const { codeA, codeB } = twoCodes(win, 60, 61);
  const series = win.simulateDuelSeries(codeA, codeB);
  assert.ok(series.manches.length >= 2);
  const baseSelf = series.self.attrs, baseFriend = series.friend.attrs;
  const lastManche = series.manches[series.manches.length-1];
  const capSelfCardio = baseSelf.cardio*0.25, capSelfDur = baseSelf.durability*0.25;
  const capFriendCardio = baseFriend.cardio*0.25, capFriendDur = baseFriend.durability*0.25;
  const selfClone = lastManche.selfFighter, friendClone = lastManche.friendFighter;
  assert.ok(baseSelf.cardio - selfClone.attrs.cardio <= capSelfCardio + 1e-9);
  assert.ok(baseSelf.durability - selfClone.attrs.durability <= capSelfDur + 1e-9);
  assert.ok(baseFriend.cardio - friendClone.attrs.cardio <= capFriendCardio + 1e-9);
  assert.ok(baseFriend.durability - friendClone.attrs.durability <= capFriendDur + 1e-9);
});

test('applyDuelFatigue — plafond dur à 25% même avec une fatigue accumulée massive', () => {
  const win = newGameWindow();
  const f = { attrs: { cardio: 80, durability: 60 } };
  win.applyDuelFatigue(f, 100000);
  assert.equal(f.attrs.cardio, 80 - 80*0.25);
  assert.equal(f.attrs.durability, 60 - 60*0.25);
});

test('resolveDuelTie — départage explicite : plus de finitions, puis plus de rounds gagnés, puis avantage au challenger', () => {
  const win = newGameWindow();
  const decisionManche = (winSide, rounds) => ({ rounds, winSide, res: { method:'Décision unanime' } });
  const finishManche = (winSide, rounds, round) => ({ rounds, winSide, res: { method:'KO/TKO', round } });

  // Plus de finitions pour 'A' (=self si selfIsCanonicalA) doit l'emporter,
  // même si 'B' (friend) a gagné sa propre manche (aux points, sur plus de rounds).
  assert.equal(win.resolveDuelTie([finishManche('A',3,1), decisionManche('B',5)], true), 'self');

  // Aucune finition d'aucun côté : les rounds gagnés (toutes les rounds de
  // chaque manche pour son vainqueur) tranchent.
  const manchesRoundsFavorFriend = [
    decisionManche('A', 3), // self (A) gagne cette manche -> 3 rounds pour self
    decisionManche('B', 3), // friend (B) gagne -> 3 rounds pour friend
    decisionManche('B', 5), // friend gagne encore, à 5 rounds -> plus de rounds cumulés pour friend
  ];
  assert.equal(win.resolveDuelTie(manchesRoundsFavorFriend, true), 'friend');

  // Ni finitions ni écart de rounds mesurable (toutes les manches réellement
  // nulles) : dernier recours, avantage au challenger (friend).
  const manchesFlat = [
    decisionManche('D', 3),
    decisionManche('D', 3),
    decisionManche('D', 5),
  ];
  assert.equal(win.resolveDuelTie(manchesFlat, true), 'friend');
});

/* --------------------- LOT DUEL-02 : entrée sur scr_intro --------------------- */

test('scr_intro() — aucune entrée Duel entre amis quand hasSave(\'career\') est faux', () => {
  const win = newGameWindow();
  win.eval(`G = {};`);
  const html = win.scr_intro();
  assert.ok(!html.includes('CL.duelEnterFromIntro'), 'sans sauvegarde de carrière, un duel n’a aucun sens : pas de bouton du tout');
});

test('scr_intro() — l’entrée Duel entre amis apparaît dès qu’une sauvegarde de carrière existe', () => {
  const win = newGameWindow();
  win.setSeed(70);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Intro'} };
    CL.create();
  `);
  const html = win.scr_intro();
  assert.ok(html.includes('CL.duelEnterFromIntro()'), 'le bouton doit router sur duelEnterFromIntro(), pas sur duelEnter() (G.f pas encore chargé sur cet écran)');
});

test('duelEnterFromIntro() — sur une sauvegarde valide, charge la carrière puis entre dans l’écran de duel avec G.f renseigné', () => {
  const win = newGameWindow();
  win.setSeed(71);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Duelliste'} };
    CL.create();
  `);
  const savedName = win.G.f.name;
  win.G = null; // simule un rechargement de page : scr_intro() s'affiche avant tout CL.cont()
  win.CL.duelEnterFromIntro();
  assert.equal(win.G.screen, 'duel_home');
  assert.ok(win.G.f, 'G.f doit être renseigné après duelEnterFromIntro()');
  assert.equal(win.G.f.name, savedName);
});

test('duelEnterFromIntro() — reste sur l’écran d’accueil avec un message lisible si le chargement échoue', () => {
  const win = newGameWindow();
  win.eval(`G = { screen:'intro' };`);
  // Pas de sauvegarde du tout : load() doit échouer proprement (jamais de throw).
  assert.doesNotThrow(() => win.CL.duelEnterFromIntro());
  assert.equal(win.G.screen, 'intro', 'reste sur l’écran d’accueil, jamais sur duel_home, si load() échoue');
  // render() a déjà consommé G._introDuelError en l'affichant (même patron que
  // G.lastMsg/G.bootMsg) : on vérifie le message dans le HTML rendu, pas sur G.
  const rendered = win.document.getElementById('app').innerHTML;
  assert.ok(/impossible|échec|réessaie/i.test(rendered), 'un message d’erreur lisible doit être affiché sur l’écran d’accueil');
});

test('duelEnterFromIntro() — aucune écriture localStorage sur tout ce chemin (exhibition pure)', () => {
  const win = newGameWindow();
  win.setSeed(72);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Pure'} };
    CL.create();
  `);
  win.G = null;
  const before = win.localStorage.getItem('cage-legacy-v3');
  let writes = 0;
  const origSetItem = win.localStorage.setItem.bind(win.localStorage);
  win.localStorage.setItem = (...args) => { writes++; return origSetItem(...args); };
  win.CL.duelEnterFromIntro();
  assert.equal(writes, 0, 'duelEnterFromIntro() ne doit jamais écrire dans localStorage (ni save(), ni auto-réparation de load())');
  assert.equal(win.localStorage.getItem('cage-legacy-v3'), before);
});
