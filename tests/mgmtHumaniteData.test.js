"use strict";
/* CAGE LEGACY — tests/mgmtHumaniteData.test.js
   ===========================================================================
   LOT 5 H1 (docs/LOT-5-UN-MONDE-HUMAIN.md §7 H1, docs/CATALOGUE-HUMANITE.md)
   — forme des données de mgmt-humanite-data.js :
   - chaque ligne de MGMT_STYLE_PAYS fait 100, chaque clé de style existe
     dans STYLES (engine.js) ;
   - les décalages de MGMT_STYLE_VILLE portent sur des styles connus et des
     villes connues de MGMT_VILLES ; chaque ville-école de MGMT_VILLES_ECOLES
     existe dans MGMT_VILLES ;
   - aucun doublon dans chaque liste (villes, écoles, surnoms par langue et
     thème, métiers par famille, milieux, libellés de moments, rituels,
     rôles, trajectoires) ;
   - chaque moment de vie a un poids entre 0 et 100 et les champs attendus ;
   - chaque texte (surnom, métier, milieu, libellé de moment, rituel, rôle,
     trajectoire) porte sa marque relu:false — propositions qu'Anthony relira
     (décision du 30/09, LOT-5 §0 item 7) ; les villes et les poids n'en
     portent pas.
   Aucun Math.random().
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function loadHumanite(){
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`(function(){
    return JSON.stringify({
      villes:MGMT_VILLES,
      villesEcoles:MGMT_VILLES_ECOLES,
      stylePays:MGMT_STYLE_PAYS,
      styleVille:MGMT_STYLE_VILLE,
      surnoms:MGMT_SURNOMS,
      metiers:MGMT_METIERS,
      milieux:MGMT_MILIEUX,
      moments:MGMT_MOMENTS,
      rituels:MGMT_RITUELS,
      roles:MGMT_ROLES,
      trajectoires:MGMT_TRAJECTOIRES,
      styleKeys:STYLE_KEYS,
    });
  })()`));
  return { win, r };
}

test('H1 — chaque ligne de MGMT_STYLE_PAYS fait 100 sur les styles connus', () => {
  const { r } = loadHumanite();
  for(const [pays, poids] of Object.entries(r.stylePays)){
    const total = Object.values(poids).reduce((a, b) => a + b, 0);
    assert.equal(total, 100, `total des styles de ${pays} = 100 (reçu ${total})`);
    for(const cle of Object.keys(poids)){
      assert.ok(r.styleKeys.includes(cle),
        `clé de style "${cle}" (${pays}) existe dans STYLES de engine.js`);
      assert.ok(Number.isInteger(poids[cle]) && poids[cle] >= 0 && poids[cle] <= 100,
        `poids ${pays}.${cle} entier entre 0 et 100`);
    }
  }
});

test('H1 — les décalages de ville portent sur des styles et des villes connus', () => {
  const { r } = loadHumanite();
  const toutesVilles = new Set(Object.values(r.villes).flat());
  for(const [ville, dec] of Object.entries(r.styleVille)){
    assert.ok(toutesVilles.has(ville),
      `la ville décalée "${ville}" existe dans MGMT_VILLES`);
    assert.ok(dec.styles && Object.keys(dec.styles).length >= 1,
      `la ville décalée "${ville}" porte un objet styles non vide`);
    for(const cle of Object.keys(dec.styles)){
      assert.ok(r.styleKeys.includes(cle),
        `clé de style décalée "${cle}" (${ville}) existe dans STYLES de engine.js`);
      const val = dec.styles[cle];
      assert.ok(Number.isInteger(val) && val > 0,
        `décalage ${ville}.${cle} entier strictement positif`);
    }
  }
});

test('H1 — chaque ville-école existe dans MGMT_VILLES', () => {
  const { r } = loadHumanite();
  const toutesVilles = new Set(Object.values(r.villes).flat());
  for(const v of r.villesEcoles){
    assert.ok(toutesVilles.has(v), `ville-école "${v}" dans MGMT_VILLES`);
  }
  assert.equal(new Set(r.villesEcoles).size, r.villesEcoles.length,
    'aucun doublon dans MGMT_VILLES_ECOLES');
});

test('H1 — aucun doublon dans chaque liste', () => {
  const { r } = loadHumanite();
  for(const [pays, villes] of Object.entries(r.villes)){
    assert.equal(new Set(villes).size, villes.length,
      `aucun doublon dans MGMT_VILLES.${pays}`);
  }
  for(const [langue, themes] of Object.entries(r.surnoms)){
    for(const [theme, liste] of Object.entries(themes)){
      const textes = liste.map(e => e.texte);
      assert.equal(new Set(textes).size, textes.length,
        `aucun doublon dans MGMT_SURNOMS.${langue}.${theme}`);
    }
  }
  for(const [famille, liste] of Object.entries(r.metiers)){
    const textes = liste.map(e => e.texte);
    assert.equal(new Set(textes).size, textes.length,
      `aucun doublon dans MGMT_METIERS.${famille}`);
  }
  const milieux = r.milieux.map(e => e.texte);
  assert.equal(new Set(milieux).size, milieux.length,
    'aucun doublon dans MGMT_MILIEUX');
  const idsMoments = r.moments.map(m => m.id);
  assert.equal(new Set(idsMoments).size, idsMoments.length,
    'aucun doublon d\'id dans MGMT_MOMENTS');
  assert.equal(new Set(idsMoments.map(id => id.toLowerCase())).size, idsMoments.length,
    'aucun doublon d\'id à la casse près dans MGMT_MOMENTS');
  const libellesMoments = r.moments.map(m => m.libelle);
  assert.equal(new Set(libellesMoments).size, libellesMoments.length,
    'aucun doublon de libellé dans MGMT_MOMENTS');
  const textesRituels = r.rituels.map(x => x.texte);
  assert.equal(new Set(textesRituels).size, textesRituels.length,
    'aucun doublon dans MGMT_RITUELS');
  assert.equal(new Set(r.roles.map(x => x.id)).size, r.roles.length,
    'aucun doublon d\'id dans MGMT_ROLES');
  assert.equal(new Set(r.trajectoires.map(x => x.id)).size, r.trajectoires.length,
    'aucun doublon d\'id dans MGMT_TRAJECTOIRES');
});

test('H1 — chaque moment a son poids entre 0 et 100 et ses champs', () => {
  const { r } = loadHumanite();
  for(const m of r.moments){
    assert.ok(typeof m.id === 'string' && m.id.length > 0, 'id présent');
    assert.ok(typeof m.famille === 'string' && m.famille.length > 0, 'famille présente');
    assert.ok(typeof m.libelle === 'string' && m.libelle.length > 0, 'libellé présent');
    assert.ok(Number.isInteger(m.poids) && m.poids >= 0 && m.poids <= 100,
      `poids de "${m.id}" entre 0 et 100 (reçu ${m.poids})`);
    assert.ok(Array.isArray(m.relais), 'relais présent');
    assert.ok(typeof m.effet === 'string', 'effet présent');
    for(const rel of m.relais){
      assert.ok(typeof rel === 'string' && rel.length > 0, `relais non vide dans "${m.id}"`);
    }
  }
});

test('H1 — chaque texte porte relu:false, les villes et les poids n\'en portent pas', () => {
  const { r } = loadHumanite();
  /* surnoms, métiers, milieux, rituels : entrées {texte, relu} */
  for(const e of [
    ...Object.values(r.surnoms).flatMap(themes => Object.values(themes).flat()),
    ...Object.values(r.metiers).flat(),
    ...r.milieux,
    ...r.rituels,
  ]){
    assert.equal(typeof e.texte, 'string', 'texte présent');
    assert.equal(typeof e.relu, 'boolean', 'marque relu présente');
    assert.equal(e.relu, false, 'proposition non relue par défaut');
  }
  /* moments : le texte écrit (libellé, relais, effet) est une proposition —
     la marque porte sur l'entrée {libelle, ..., relu:false} */
  for(const m of r.moments){
    assert.equal(typeof m.libelle, 'string', 'libellé de moment');
    assert.equal(typeof m.relu, 'boolean', 'marque relu du moment présente');
    assert.equal(m.relu, false, 'moment non relu par défaut');
  }
  /* rôles : {libelle, criteres, relu} */
  for(const role of r.roles){
    assert.equal(typeof role.libelle, 'string', 'libellé de rôle');
    assert.equal(typeof role.criteres, 'string', 'critères de rôle');
    assert.equal(typeof role.relu, 'boolean', 'marque relu du rôle');
    assert.equal(role.relu, false, 'rôle non relu par défaut');
  }
  /* trajectoires : {libelle, forme, relu} */
  for(const t of r.trajectoires){
    assert.equal(typeof t.libelle, 'string', 'libellé de trajectoire');
    assert.equal(typeof t.forme, 'string', 'forme de trajectoire');
    assert.equal(typeof t.relu, 'boolean', 'marque relu de la trajectoire');
    assert.equal(t.relu, false, 'trajectoire non relu par défaut');
  }
  /* villes et poids : aucune marque */
  for(const [pays, poids] of Object.entries(r.stylePays)){
    assert.equal(typeof poids.relu, 'undefined',
      `${pays} : la ligne de poids ne porte pas de marque relu`);
    assert.ok(Object.values(poids).every(Number.isInteger),
      `${pays} : tous les poids sont des entiers`);
  }
  for(const [ville, dec] of Object.entries(r.styleVille)){
    assert.equal(typeof dec.relu, 'undefined',
      `${ville} : la ligne de décalage ne porte pas de marque relu`);
  }
});
