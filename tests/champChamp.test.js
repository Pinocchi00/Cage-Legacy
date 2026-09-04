"use strict";
/* CAGE LEGACY — tests/champChamp.test.js
   Supercombat pour une seconde ceinture (accepter/décliner l'offre) et gain
   effectif de la nouvelle division.
   ==== [ANCRE: SUPPRESSION_DOUBLE_CHAMPION] — P2 : le statut PERMANENT de
   double champion (f.champChampBelt/BeltDivId/Defenses, l'écran de choix de
   focus chooseChampChampFocus()) a été retiré du jeu. Gagner le supercombat
   fait désormais basculer IMMÉDIATEMENT le joueur dans la nouvelle division
   (plus de retour possible ensuite) et déclare l'ancienne ceinture vacante
   sur-le-champ. Ce fichier, réécrit pour ce lot, couvre le nouveau
   comportement — les anciens tests de chooseChampChampFocus() ont disparu
   avec la méthode elle-même (voir aussi tests/regressionFixes.test.js, dont
   les tests CORRECTIF_MESSAGE_FOCUS_INVERSE/CORRECTIF_DOUBLE_CHAMPION_
   DIVISION_FAUSSE testaient exactement ce mécanisme et ont été retirés pour
   la même raison). ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function makeChampWithOffer(win){
  win.CL.newCareer();
  win.G.draft.first = 'Champ';
  win.CL.create();
  const f = win.G.f;
  f.champion = f.div; f.org = 3; f.defenses = 3;
  const otherDiv = win.eval('DIVISIONS.H.find(d=>d.id!==G.f.div)');
  const rival = win.eval(`makeFighter({gender:'H',div:'${otherDiv.id}',level:70,potential:80})`);
  rival.champion = otherDiv.id;
  f.champChampOffer = { champion: rival, targetDivId: otherDiv.id, targetDivName: otherDiv.name };
  return { f, otherDiv, rival };
}

test('accepter l\'offre de supercombat pose un combat 5 rounds contre le champion rival', () => {
  const win = newGameWindow({ runMain: true });
  makeChampWithOffer(win);
  win.CL.acceptChampChampOffer();
  assert.equal(win.G.fight.kind, 'champchamp_title');
  assert.equal(win.G.fight.rounds, 5, 'un supercombat se joue en 5 rounds');
  assert.ok(win.G.fight.opp, 'l\'adversaire posé doit être le champion rival de l\'offre');
});

test('décliner l\'offre efface champChampOffer sans toucher au reste de l\'état', () => {
  const win = newGameWindow({ runMain: true });
  const { f } = makeChampWithOffer(win);
  const defensesBefore = f.defenses;
  win.CL.declineChampChampOffer();
  assert.equal(win.G.f.champChampOffer, null, 'l\'offre déclinée doit être effacée');
  assert.equal(win.G.f.defenses, defensesBefore, 'décliner ne doit pas modifier les défenses de titre');
});

test('gagner le supercombat bascule immédiatement dans la nouvelle division, sans statut de double champion', () => {
  const win = newGameWindow({ runMain: true });
  const { f, otherDiv } = makeChampWithOffer(win);
  const originalDiv = f.div, originalDivName = f.divName, playerName = f.name;
  const opp = f.champChampOffer.champion;
  win.setSeed(1);
  // ==== [ANCRE: TEST_CHAMPCHAMP_RND_EPSILON] — rnd()=>0 exact (convention des
  // autres tests d'attrs écrasantes de ce dépôt) fait boucler indéfiniment
  // gauss() (engine.js: `while(!u)u=rnd();`) dès que ce combat gagné
  // régénère un roster (makeOrgRoster(), nouvelle branche P2 ci-dessus dans
  // ui-05) : aucun autre chemin de resolveFight() ne rappelle makeOrgRoster()
  // en cours de combat, donc ce piège n'existait pas avant ce lot. Un epsilon
  // non nul préserve exactement le même comportement "résultat le plus
  // favorable" que 0 pour toutes les comparaisons rnd()<seuil du moteur,
  // sans jamais satisfaire `!u`.
  win.rnd = () => 0.0001;
  Object.assign(f.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 100, guardWork: 100, fightIQ: 100, composure: 100, adaptability: 100, killer: 100, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 100 });
  Object.assign(opp.attrs, { tdd: 1, strength: 1, guardWork: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1, power: 1, submission: 1, killer: 1 });
  win.G.fight = { kind: 'champchamp_title', opp, rounds: 5, planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, true, 'le combat doit être gagné pour ce test (attrs écrasantes côté joueur)');

  // La nouvelle division devient la seule, sans aucun retour possible.
  assert.equal(win.G.f.div, otherDiv.id, 'le joueur doit basculer dans la nouvelle division');
  assert.equal(win.G.f.divName, otherDiv.name);
  assert.notEqual(win.G.f.div, originalDiv, 'la division doit avoir réellement changé');
  assert.equal(win.G.f.defenses, 0, 'la nouvelle ceinture démarre à 0 défense');
  assert.equal(win.G.f.champChampOffer, null);

  // Plus aucun état de double champion.
  assert.equal(win.G.f.champChampBelt, undefined, 'aucun statut de double champion ne doit être posé');
  assert.equal(win.G.f.champChampBeltDivId, undefined);
  assert.equal(win.G.f.champChampDefenses, undefined);

  // Le bonus d'héritage remplace l'ancien +150 hofScore(champChampBelt), sans
  // dévaluer les légendes déjà au Panthéon (score déjà figé chez elles).
  assert.equal(win.G.f.champChampGloryBonus, 150);

  // L'ancienne ceinture est déclarée vacante : un nouveau champion (jamais le
  // joueur) est enregistré dans le registre des ceintures, avec le joueur
  // comme "dethroned" (celui qui a quitté le trône, pas battu au combat).
  const vacantReign = win.G.titleHistory.find(r => r.divName === originalDivName && r.dethroned === playerName);
  assert.ok(vacantReign, 'l\'ancienne ceinture doit être enregistrée comme vacante dans G.titleHistory');
  assert.notEqual(vacantReign.champion, playerName, 'le nouveau champion de l\'ancienne division ne doit jamais être le joueur');

  // Événement narratif visible sur l'écran de résultat.
  assert.ok(win.G.pending.milestone.includes('vacante'), 'le milestone doit annoncer la vacance de l\'ancienne ceinture');
});

test('perdre le supercombat conserve la ceinture et la division actuelles', () => {
  const win = newGameWindow({ runMain: true });
  const { f } = makeChampWithOffer(win);
  const originalDiv = f.div, originalDivName = f.divName;
  const opp = f.champChampOffer.champion;
  win.setSeed(1);
  win.rnd = () => 0.0001; // cf. TEST_CHAMPCHAMP_RND_EPSILON plus haut
  Object.assign(opp.attrs, { takedown: 100, strength: 100, explosiveness: 100, tdd: 100, topControl: 100, gnp: 100, power: 100, submission: 100, guardWork: 100, fightIQ: 100, composure: 100, adaptability: 100, killer: 100, chin: 100, durability: 100, cardio: 100, recovery: 100, heart: 100 });
  Object.assign(f.attrs, { tdd: 1, strength: 1, guardWork: 1, chin: 1, durability: 1, fightIQ: 1, composure: 1, adaptability: 1, heart: 1, cardio: 1, recovery: 1, power: 1, submission: 1, killer: 1 });
  win.G.fight = { kind: 'champchamp_title', opp, rounds: 5, planLabel: null };
  win.resolveFight();
  assert.equal(win.G.pending.win, false, 'le combat doit être perdu pour ce test (attrs écrasantes côté adversaire)');
  assert.equal(win.G.f.div, originalDiv, 'une défaite ne doit jamais changer la division du joueur');
  assert.equal(win.G.f.divName, originalDivName);
  assert.equal(win.G.f.champion, f.champion, 'la ceinture actuelle n\'est jamais retirée par une défaite au supercombat');
  assert.equal(win.G.f.defenses, 3, 'le compteur de défenses de la ceinture actuelle n\'est pas affecté par le supercombat');
  // Comportement PRÉEXISTANT, non modifié par ce lot : l'offre acceptée est
  // consommée (mise à null), mais comme f.champion/defenses>=3 restent vrais
  // et qu'aucun cooldown n'a été posé (seul declineChampChampOffer() pose
  // champChampLastOfferDefenses), la condition de disponibilité de l'offre
  // (plus bas dans resolveFight()) se réévalue aussitôt et en repropose une
  // nouvelle sur-le-champ — jamais null durablement ici.
  assert.ok(win.G.f.champChampOffer, 'une défaite ne doit jamais bloquer durablement une nouvelle offre tant que ses conditions restent réunies');
});

/* ==== [ANCRE: TEST_MIGRATION_DOUBLE_CHAMPION] — P2 : migration d'une
   sauvegarde antérieure au retrait du statut de double champion. ==== */
test('migrate() convertit une sauvegarde double champion en champion simple, sans perte du bonus de score', () => {
  const win = newGameWindow({ runMain: true });
  win.CL.newCareer();
  win.G.draft.first = 'Legacy';
  win.CL.create();
  const liveDiv = win.G.f.div, liveDivName = win.G.f.divName;
  const oldSave = {
    version: 3,
    f: Object.assign({}, win.G.f, {
      champion: 'national', org: 3, div: liveDiv, divName: liveDivName,
      champChampBelt: 'Poids Coq', champChampBeltDivId: 'H-bantam',
      champChampDefenses: { [liveDiv]: 2, 'H-bantam': 1 },
    }),
    season: { year: 2, fights: [] },
  };
  assert.equal(win.eval(`validateSave(${JSON.stringify(oldSave)})`), true, 'une sauvegarde double champion pré-migration doit rester structurellement valide');
  const migrated = win.migrate(oldSave);
  assert.equal(migrated.version, win.eval('SAVE_VERSION'), 'la sauvegarde migrée doit porter SAVE_VERSION');
  assert.equal(migrated.f.champChampBelt, undefined, 'champChampBelt doit disparaître, pas juste être neutralisé');
  assert.equal(migrated.f.champChampBeltDivId, undefined);
  assert.equal(migrated.f.champChampDefenses, undefined);
  assert.equal(migrated.f.champion, 'national', 'le combattant reste champion simple de sa division actuelle');
  assert.equal(migrated.f.div, liveDiv, 'la division active n\'est jamais réécrite par la migration');
  assert.equal(migrated.f.champChampGloryBonus, 150, 'le bonus d\'héritage est accordé à la migration pour ne pas pénaliser une carrière déjà double championne');
});
