# Cage Legacy

Jeu de gestion de carrière de MMA, jouable directement dans le navigateur —
vanilla JavaScript, sans build, sans backend, 100 % offline une fois chargé.

**Jouer en ligne : https://pinocchi00.github.io/Cage-Legacy/**

## Modes de jeu

- **Carrière Complète** : amateur → pro → retraite, gestion physique et financière, camps d'entraînement, classements, contrats, Panthéon des légendes, et l'exhibition « Duel entre amis ».
- **Mode management** : le joueur est le matchmaker d'une organisation (Split par défaut, huit au choix). Il compose les cartes, négocie les contrats, pose ses soirées au calendrier, lit la presse et les classements, et regarde les combats dans l'arène. Cible : un PC en 1920 × 1080 (le cadre se met à l'échelle), souris d'abord, clavier en accélérateur. Mode jouable, en développement actif ; sa direction visuelle est celle des maquettes du dossier `maquettes/`.

## Arborescence

```
index.html                        point d'entrée, ordre de chargement des scripts
data-*.js                         données pures (compétences, contenus, personnages)
engine.js, engine-*.js            moteur de simulation (combat, carrière, progression, événements)
state/                            état de jeu et logique métier, par domaine (sauvegarde, analytics, Panthéon...)
ui-*.js                           rendu et écrans de la carrière, de l'arène, du duel et des touches (Canvas 2D)
mgmt-*.js                         le mode management : données, simulation (bureau, carte, corps, argent, monde, agenda, contrats…), cadre et écrans
sw.js, manifest.webmanifest, icons/  application installable (PWA), jouable hors ligne
main.js                           bootstrap au chargement de la page
tests/                            suite de tests (node --test) sur le vrai code du jeu, chargé dans un DOM virtuel
tools/                            outils : lint de contenu, mesures (management, gestes de finition, monde, économie), export des textes à relire, Monte-Carlo
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
npm run check    # lint + lint de contenu + suite de tests — doit être vert avant toute livraison
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

72 fichiers de test et près de 800 tests au 08/10/2026 (`npm run check` donne le compte exact ; ne pas se fier à ce chiffre). **La liste des fichiers est écrite à la main dans `package.json`** (scripts `test` et `test:watch`) : un nouveau fichier de test doit y être ajouté, sinon il ne tourne jamais.

```
tests/
  helpers/
    loadGame.js            charge le jeu dans un DOM virtuel
    playthrough.js          le « joueur automatique » de la carrière
    jouerSoirees.js         joue des soirées du management
  career.test.js, regressionFixes.test.js, saveSystem.test.js …   la carrière
  mgmt*.test.js           le mode management, un fichier par sujet
  mgmtCorrections*.test.js   les corrections du 08/10/2026, un fichier par lot
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
des mesures locales, jamais un livrable versionné ; le joueur automatique de l'outil est une copie de celui de `tests/helpers/playthrough.js`, et `tests/outillage.test.js` échoue si les deux divergent) : `monte-carlo-<horodatage>.
{txt,json}` et une copie `latest.{txt,json}` toujours à jour, pour differ
deux runs facilement.

## Mesurer le management et les textes

```bash
node tools/mesure-management.js           # 40 soirées pour chacune des huit organisations → tools/reports/MESURE-MANAGEMENT.md
node tools/mesure-gestes.js               # les gestes de finition sur 600 finitions
node tools/exporter-textes.js             # tous les textes relu:false, par famille → docs/TEXTES-A-RELIRE.md
```

Ces outils lisent les vraies fonctions du jeu, n'écrivent que leur rapport, et n'utilisent jamais `Math.random()`.

## Confidentialité

Tout est local. Le jeu ne fait aucun appel réseau au runtime : la
sauvegarde vit uniquement dans le `localStorage` du navigateur, rien n'est
transmis à un serveur.
