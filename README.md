# Cage Legacy

Jeu de gestion de carrière de MMA, jouable directement dans le navigateur —
vanilla JavaScript, sans build, sans backend, 100 % offline une fois chargé.

**Jouer en ligne : https://pinocchi00.github.io/Cage-Legacy/**

## Mode de jeu

**Carrière Complète** : amateur → pro → retraite, gestion physique et financière, camps d'entraînement, classements, contrats, et Panthéon des légendes.

## Arborescence

```
index.html                        point d'entrée, ordre de chargement des scripts
data-*.js                         données pures (compétences, contenus, personnages)
engine.js, engine-*.js            moteur de simulation (combat, carrière, progression, événements)
state/                            état de jeu et logique métier, par domaine (sauvegarde, analytics, Panthéon...)
ui-01…ui-09*.js                   rendu Canvas 2D et écrans, un fichier par zone fonctionnelle
main.js                           bootstrap au chargement de la page
tests/                            suite de tests (node --test) sur le vrai code du jeu, chargé dans un DOM virtuel
tools/lint-content.js             linter de contenu narratif (anglicismes, longueur des phrases, etc.)
eslint.config.js                  configuration ESLint
```

Pour le détail de l'ordre de chargement réel, des globaux structurants et
des règles d'architecture, voir [`CLAUDE.md`](./CLAUDE.md).

## Développement

Aucun build. Pour jouer/modifier en local, ouvrir `index.html` dans un
navigateur suffit.

Pour valider une modification :

```bash
npm install     # une seule fois
npm run check    # lint + suite de tests — doit être vert avant toute livraison
```

## Suite de tests

La suite exécute le **vrai code du jeu** dans un DOM virtuel (`jsdom`) pour
détecter les erreurs qui ne surviennent que dans des situations précises
(carrière longue, cas limites de classement, sauvegardes corrompues...) et
les incohérences d'état.

```bash
npm test          # lance la suite complète
npm run test:watch # idem, en mode watch
```

9 fichiers de test, 62 tests au total au moment de la rédaction :

```
tests/
  helpers/
    loadGame.js            charge le jeu dans un DOM virtuel
    playthrough.js          un "joueur automatique" qui enchaîne des actions de jeu
  analytics.test.js          analytics locales
  career.test.js              simulations de carrière complètes
  champChamp.test.js           supercombat double champion
  hallOfFame.test.js            Panthéon (ajout, suppression, favoris, export)
  invariants.test.js            invariants d'état (classement, cohérence des données)
  proceduralNarrative.test.js    génération procédurale (rivalités, arcs narratifs)
  ranking.test.js                classement (rang #1, pénalités du champion)
  regressionFixes.test.js         un test par bug corrigé — le fichier le plus fourni
  saveSystem.test.js              sauvegarde, migration, récupération automatique
```

**Un bug corrigé = un test ajouté dans `tests/regressionFixes.test.js`.**

Modèle minimal pour un nouveau test (dans un fichier `*.test.js` existant
ou nouveau) :

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('description claire de ce qui est vérifié', () => {
  const win = newGameWindow();
  // ... mettre le jeu dans la situation à tester (win.G, win.CL, etc.) ...
  assert.equal(resultatObtenu, resultatAttendu, 'message si ça échoue');
});
```

## Harnais Monte-Carlo (équilibrage)

`tools/monte-carlo.js` charge le vrai jeu dans un DOM virtuel (même principe
que `tests/helpers/loadGame.js`, mais un fichier autonome — `tools/` ne
dépend pas de `tests/`) et simule N carrières complètes (amateur → pro →
retraite), pilotées par une politique déterministe et seedée (le premier
choix disponible à chaque écran, hasard exclusivement via `rnd()`/`setSeed()`
— jamais `Math.random()`). Sert à mesurer l'équilibrage (forme/moral,
progression des attributs, durée de carrière, méthodes de fin de combat...)
sur un grand nombre de carrières plutôt qu'à l'œil sur une seule partie.

```bash
node tools/monte-carlo.js                       # 30 carrières, seed 1 (par défaut)
node tools/monte-carlo.js --runs=200 --seed=1    # run de référence pour un diagnostic
node tools/monte-carlo.js --runs=200 --seed=1 --maxFights=70 --quiet
```

Options : `--runs=N` (nombre de carrières), `--seed=S` (seed de base — la
carrière *i* utilise `seed+i`, donc un run est intégralement reproductible),
`--maxFights=N` (plafond de sécurité par carrière, pas une vraie fin de
carrière), `--quiet` (masque la progression sur stderr).

Écrit un rapport texte + JSON dans `tools/reports/` (ignoré par git — ce sont
des mesures locales, jamais un livrable versionné) : `monte-carlo-<horodatage>.
{txt,json}` et une copie `latest.{txt,json}` toujours à jour, pour differ
deux runs facilement.

## Confidentialité

Tout est local. Le jeu ne fait aucun appel réseau au runtime : la
sauvegarde vit uniquement dans le `localStorage` du navigateur, rien n'est
transmis à un serveur.
