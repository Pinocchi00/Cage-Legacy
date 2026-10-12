"use strict";
/* ==== [ANCRE: MGMT_MONDE_LOT2_IDENTITES_TESTS] — Monde lot 2 T1 : la fiche d'identité.
   Les huit fiches de MGMT_ORG_IDENTITES (mgmt-organisations-identites-data.js, données du
   commit 95e1fd0 — jamais modifiées ici) deviennent accessibles au jeu par
   mgmtOrgIdentite (mgmt-organisations.js). Les tests vérifient :
   - la complétude des fiches, l'absence d'auto-rivale, les ids des huit organisations ;
   - « Leïla n'existe qu'à Split » (piège du plan) ;
   - les énumérations de la main, les mélanges de pays (somme 100 sur COUNTRY_KEYS) ;
   - la résolution des null par mgmtOrgIdentite ;
   - que chaque phrase de la fiche de Split est reprise de son contexte
     (docs/SPLIT-CONTEXTE-DEPART.md + docs/SPLIT-CONTEXTE-COMPLEMENT.md) — comparaison
     en Node (fs), normalisation des deux côtés, sans lecture de la fenêtre jsdom. ==== */
const fs = require('fs');
const path = require('path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
function result(win, code) { return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

/** La fenêtre de jeu charge les huit fiches, les huit organisations du profil et les clés de pays. */
function chargerIdentites() {
  const win = newGameWindow();
  const r = result(win, `return {identites:MGMT_ORG_IDENTITES, orgs:MGMT_ORGANISATIONS, countryKeys:COUNTRY_KEYS};`);
  return { win, r };
}

/* Clés attendues, telles que la fiche les énumère. */
const CLES_FICHE = ['ville','pays','annee','reputation','blessure','rivale','soirees','villesSalles','adjointe','predecesseur','main','paysPoids','relu'];
const CLES_ADJOINTE = ['prenom','nom','parcours','voix'];
const CLES_PREDECESSEUR = ['prenom','nom','depart','posteActuel'];
const CLES_MAIN = ['titres','jeunes','noms','contrats'];
const ENUMS_MAIN = {
  titres: ['souvent','normal','rarement'],
  jeunes: ['fait-monter','equilibre','protege-anciens'],
  noms: ['souvent','parfois','jamais'],
  contrats: ['garde','normal','laisse-filer'],
};

test('Identités — chaque fiche a tous ses champs, aucune organisation n’est sa propre rivale', () => {
  const { r } = chargerIdentites();
  const ids = Object.keys(r.identites);
  assert.equal(ids.length, 8, Object.keys(r.identites).length + ' fiches, pas 8');
  for (const id of ids) {
    const it = r.identites[id];
    for (const cle of CLES_FICHE) {
      assert.ok(cle in it, `« ${id} » : la clé "${cle}" manque`);
    }
    for (const cle of CLES_ADJOINTE) {
      assert.ok(cle in it.adjointe, `« ${id} » : l'adjointe n'a pas "${cle}"`);
    }
    for (const cle of CLES_PREDECESSEUR) {
      assert.ok(cle in it.predecesseur, `« ${id} » : le prédécesseur n'a pas "${cle}"`);
    }
    for (const cle of CLES_MAIN) {
      assert.ok(cle in it.main, `« ${id} » : la main n'a pas "${cle}"`);
    }
    assert.notEqual(it.rivale, id, `« ${id} » : une organisation n'est pas sa propre rivale`);
    assert.ok(r.identites[it.rivale] !== undefined,
      `« ${id} » : sa rivale "${it.rivale}" est une clé de MGMT_ORG_IDENTITES`);
  }
});

test('Identités — les ids sont ceux des huit organisations du profil', () => {
  const { r } = chargerIdentites();
  assert.deepEqual(Object.keys(r.identites).sort(), r.orgs.map(o => o.id).sort());
});

test('Identités — Leïla n’existe qu’à Split', () => {
  const { r } = chargerIdentites();
  const leila = Object.keys(r.identites).filter(id => r.identites[id].adjointe.prenom === 'Leïla');
  assert.deepEqual(leila, ['split']);
});

test('Identités — les réglages de la main sont dans les quatre énumérations', () => {
  const { r } = chargerIdentites();
  for (const id of Object.keys(r.identites)) {
    for (const [cle, valeurs] of Object.entries(ENUMS_MAIN)) {
      assert.ok(valeurs.includes(r.identites[id].main[cle]),
        `« ${id} » : main.${cle} vaut "${r.identites[id].main[cle]}", hors de [${valeurs.join(', ')}]`);
    }
  }
});

test('Identités — les mélanges de pays sont valides', () => {
  const { r } = chargerIdentites();
  assert.equal(r.identites.split.paysPoids, null,
    'split porte null : le défaut MGMT_PAYS_POIDS.split est résolu par mgmtOrgIdentite');
  for (const [id, it] of Object.entries(r.identites)) {
    if (it.paysPoids === null) continue;
    const total = Object.values(it.paysPoids).reduce((a, b) => a + b, 0);
    assert.equal(total, 100, `« ${id} » : somme des poids de pays = 100 (reçu ${total})`);
    for (const cle of Object.keys(it.paysPoids)) {
      assert.ok(r.countryKeys.includes(cle),
        `« ${id} » : la clé de pays "${cle}" existe dans COUNTRY_KEYS`);
    }
  }
});

test('Identités — mgmtOrgIdentite résout les nulls et refuse un id inconnu', () => {
  const win = newGameWindow();
  /* Les égalités d'objets (===) se jugent dans la fenêtre : JSON.stringify des détruirait. */
  const r = result(win, `return {
    vs:mgmtOrgIdentite('split').villesSalles === MGMT_SALLES_VILLES,
    pp:mgmtOrgIdentite('split').paysPoids === MGMT_PAYS_POIDS.split,
    us:mgmtOrgIdentite('garden-of-blood').paysPoids.US,
    inconnu:mgmtOrgIdentite('inconnu')};`);
  assert.equal(r.vs, true, 'villesSalles null de split se résout en MGMT_SALLES_VILLES');
  assert.equal(r.pp, true, 'paysPoids null de split se résout en MGMT_PAYS_POIDS.split');
  assert.equal(r.us, 40, 'le mélange custom de garden-of-blood est conservé');
  assert.equal(r.inconnu, null, 'un id inconnu donne null');
});

/* La normalisation des deux côtés du test Split : apostrophes excédentaires → droite,
   markdown (gras, italique) retiré, `>` et espaces de début de chaque ligne retirés
   (les citations du contexte coupent une phrase sur deux lignes), espaces fusionnés,
   casse en minuscule, ponctuation finale de la phrase cherchée retirée. */
function normaliser(t) {
  return t
    .replace(/\r/g, '')
    .split('\n')
    .map(ligne => ligne.replace(/^[>\s]+/, ''))
    .join(' ')
    .replace(/['`]/g, "'")
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
function normaliserPhrase(t) {
  return normaliser(t).replace(/[.!?;:]+$/, '');
}

test('Identités — la fiche de Split ne contient aucune phrase absente de son contexte', () => {
  /* Les phrases viennent de la fenêtre de jeu ; le contexte vient du disque : la
     comparaison vit en Node, jamais dans la fenêtre jsdom. */
  const win = newGameWindow();
  const phrases = result(win, `const s=MGMT_ORG_IDENTITES.split;
    return [s.reputation,s.blessure,s.adjointe.parcours,s.adjointe.voix,
      s.predecesseur.depart,s.predecesseur.posteActuel];`);
  /* soirees ('Split Fight Night') est un nom, pas une phrase : jamais cherché ici. */
  assert.equal(phrases.length, 6, 'six phrases à retrouver');
  const contexte = normaliser(
    fs.readFileSync(path.join(__dirname, '..', 'docs', 'SPLIT-CONTEXTE-DEPART.md'), 'utf8') + ' ' +
    fs.readFileSync(path.join(__dirname, '..', 'docs', 'SPLIT-CONTEXTE-COMPLEMENT.md'), 'utf8'));
  for (let i = 0; i < phrases.length; i++) {
    const p = normaliserPhrase(phrases[i]);
    assert.ok(contexte.includes(p),
      `phrase ${i + 1} absente du contexte : « ${p} »`);
  }
});
