# Cage Legacy — guide d'architecture

## 1. Nature du projet

Cage Legacy est un jeu de gestion de carrière de MMA en vanilla JavaScript,
jouable directement dans le navigateur (`index.html`), sans build ni backend.
Trois modes de jeu, tous accessibles depuis l'écran-titre :

- **Carrière Complète** — le mode historique : amateur → pro → retraite,
  classements, contrats, Panthéon.
- **Faith** — un mode narratif dédié, avec son propre tirage de personnage
  (`G.faithDraft`), sa propre progression (`G.f`) et ses propres écrans
  (`ui-04a-faith-screens.js`).
- **Gauntlet** — un mode arcade en runs courtes (Ladder 100, Bracket 64,
  Boss Run), piloté par `G.arcade` et distinct de `gameMode` (voir
  `detectMode()` dans `ui-08-controller-arena.js`).

Le mode actif se déduit à l'exécution (`G.arcade.active`, `G.f.gameMode`),
il n'y a pas de séparation en sous-dossiers par mode.

## 2. Contraintes non négociables

- **Vanilla JS (ES6+), zéro dépendance runtime.** Aucun framework, aucun
  bundler.
- **Jamais `import`/`export`.** Tous les fichiers sont chargés via des
  balises `<script>` classiques et partagent un scope global. Toute
  extraction de fichier doit rester chargée de cette façon.
- **`"use strict";` en première ligne de chaque fichier `.js` du jeu.**
- **Persistance `localStorage` uniquement**, via `SAVE_KEY` (voir §4).
  Aucun backend, aucun compte, aucune synchronisation.
- **100 % offline.** Le jeu doit fonctionner sans connexion réseau une fois
  chargé (déploiement GitHub Pages).
- **Mobile-first.** Écrans tactiles, pas de dépendance à un clavier/souris.

## 3. Ordre de chargement réel

**`index.html` est la seule source de vérité** pour l'ordre de chargement —
la liste ci-dessous est indicative et peut se périmer à la prochaine
modification d'`index.html`. Vérifie toujours les balises `<script>` avant
d'ajouter ou déplacer un fichier.

Ordre lu dans `index.html` (nombre de lignes de chaque fichier entre
parenthèses) :

1. `data-skills.js` (649) — données de compétences
2. `data-content.js` (231) — textes/contenus génériques
3. `data-people.js` (268) — noms, pays, personnages
4. `data-faith-content.js` (1510) — contenus narratifs du mode Faith
5. `engine.js` (372) — cœur du moteur, types partagés
6. `engine-combat.js` (559) — résolution des combats
7. `engine-progression.js` (375) — XP, attributs, évolution du combattant
8. `engine-career.js` (260) — déroulé de carrière, calendrier
9. `engine-events.js` (503) — génération d'événements/actualités
10. `state/state-core.js` (24) — état global `G`, `esc()`, helpers de base
11. `state/state-analytics.js` (101) — analytics locales
12. `state/state-save.js` (74) — `SAVE_KEY`, sauvegarde/chargement
13. `state/state-migration.js` (40) — `SAVE_VERSION`, migrations
14. `state/state-validation.js` (129) — validation de sauvegarde
15. `state/state-hof.js` (179) — Panthéon (Hall of Fame)
16. `state/state-shop.js` (87) — boutique/consommables
17. `state/state-gauntlet.js` (261) — état du mode Gauntlet
18. `state/state-faith.js` (362) — état du mode Faith
19. `ui-01-roster-matchmaking.js` (834) — roster, matchmaking
20. `ui-02-fight-prep-events.js` (870) — préparation de combat, événements
21. `ui-03-contracts-arcade-data.js` (2043) — contrats, données arcade
22. `ui-04a-faith-screens.js` (2349) — écrans du mode Faith
23. `ui-04b-gauntlet-screens.js` (1309) — écrans du mode Gauntlet
24. `ui-05-fight-resolution.js` (1110) — écran de résultat de combat
25. `ui-06-career-screens.js` (1309) — écrans de carrière
26. `ui-07-contracts-legacy-screens.js` (1003) — contrats/legacy
27. `ui-08-controller-arena.js` (4304) — routeur d'écrans (`CL`), rendu Canvas
    de l'arène
28. `ui-09-arena.js` (765) — effets visuels de l'arène (particules, juice)
29. `main.js` (57) — bootstrap, initialisation de `G`

## 4. Globaux structurants

| Global | Défini dans | Rôle |
|---|---|---|
| `G` | déclaré `let G=null;` dans `state/state-core.js:14`, initialisé dans `main.js` (`G={screen:'title',...}`) et réassigné à chaque nouvelle partie/écran (`newCareer()`, `newFaithCareer()`, etc. dans `ui-08-controller-arena.js`) | État de jeu courant (donnée brute, jamais figée dans un objet séparé) |
| `CL` | `ui-08-controller-arena.js:645`, exposé via `window.CL=CL;` en fin de fichier | Contrôleur de navigation/actions (`CL.go(screen)`, etc.) |
| `esc()` | `state/state-core.js:23` | Échappement HTML pour tout texte injecté dans le DOM (noms de combattant, surnoms, légendes importées) |
| `SAVE_KEY` | `state/state-save.js:28` (`'cage-legacy-v3'`) | Clé `localStorage` de la sauvegarde principale |
| `SAVE_VERSION` | `state/state-migration.js:4` (`3` au moment de la rédaction) | Version de schéma de sauvegarde, utilisée par `migrate()` |

## 5. Séparation des responsabilités

- **`data-*.js`** : données pures (tables, textes, constantes). Aucune
  logique de jeu, aucun accès DOM/Canvas.
- **`engine-*.js` et `state/*.js`** : logique de simulation et état.
  **Aucun accès DOM ni Canvas direct.** La simulation doit rester
  100 % synchrone (pas de `Promise`, `setTimeout` de logique de jeu, etc.).
- **`ui-0X.js`** : rendu Canvas 2D et gestion des événements utilisateur
  uniquement. Ne porte pas de règles de simulation qui devraient vivre dans
  `engine-*.js`/`state/*.js`.

## 6. Conventions de code

- **Ancres** : tout bloc de code lié à un correctif ou un lot de travail
  identifiable est encadré par `/* ==== [ANCRE: NOM] ==== */`. Si le code
  ancré est déplacé vers un autre fichier, l'ancre et la référence au lot
  d'origine sont conservées telles quelles (ne pas les réécrire ni les
  supprimer).
- **Taille des fonctions** : toute fonction dépassant ~40 lignes doit être
  découpée.
- **JSDoc** : les fonctions complexes (logique de simulation non triviale,
  signatures ambiguës) portent un commentaire JSDoc (`@param`, `@returns`,
  `@type`). Voir `engine.js` et `state/state-core.js` pour des exemples.
- **Scope global** : le code n'utilise pas de modules — un appelant orphelin
  après suppression d'une fonction ne casse qu'à l'exécution, jamais à la
  compilation. Avant de supprimer ou renommer une fonction dans
  `state/*.js` ou `engine-*.js`, vérifier tous ses appelants dans `ui-*.js`.
- **Performance Canvas 2D** : dans les boucles `requestAnimationFrame`
  (arène, `ui-09-arena.js`), réutiliser les objets plutôt qu'allouer
  (`new Array()`, littéraux d'objet) à chaque frame. Le pool de particules
  de `ui-09-arena.js` (ancre `JUICE_NIVEAU2`) est le patron à suivre pour
  tout nouvel effet visuel.

## 7. Validation

Commandes réelles (`package.json`) :

```bash
npm install        # une seule fois — installe jsdom et eslint
npm run lint        # ESLint sur tout le dépôt
npm run lint:content # linter de contenu narratif (anglicismes, longueur
                     # des phrases visibles, TEXT_POOLS, champs G.f./
                     # G.faith./G.arcade. jamais relus) — pas inclus dans
                     # `check`, à lancer séparément sur le contenu narratif
npm test             # suite de tests (node --test), 9 fichiers
npm run check        # lint + test — DOIT être vert avant toute livraison
```

Au moment de la rédaction : **62 tests**, répartis sur 9 fichiers dans
`tests/` (`analytics.test.js`, `career.test.js`, `champChamp.test.js`,
`hallOfFame.test.js`, `invariants.test.js`, `proceduralNarrative.test.js`,
`ranking.test.js`, `regressionFixes.test.js`, `saveSystem.test.js`), tous
passants (`npm run check` vert).

**Règle** : aucune livraison sans `npm run check` vert. Un bug corrigé =
un test ajouté dans `tests/regressionFixes.test.js` (déjà le fichier le
plus fourni : 18 tests au moment de la rédaction, un par correctif).

## 8. Règles de modification

- **Additif par défaut.** Ne pas retirer une fonctionnalité existante pour
  en simplifier une nouvelle.
- **Compatibilité des sauvegardes.** Toute évolution du format de
  sauvegarde passe par `migrate()` (`state/state-migration.js`) avec des
  valeurs par défaut tolérantes pour les champs absents d'une sauvegarde
  plus ancienne (ex. `if (save.fighter.morale === undefined) save.fighter.morale = 50;`).
  Ne jamais faire planter le chargement d'une sauvegarde ancienne ou
  légèrement corrompue.
- **Ne jamais créer un système parallèle** à un système existant
  (ex. un second mécanisme de rivalités à côté de `rivalryHeat`, un second
  registre de classement à côté de celui déjà en place). Étendre l'existant.
- **À préserver dans toute modification** : le fonctionnement offline, la
  compatibilité mobile, le partage de légendes (import/export), le
  Panthéon, les classements, les ères MMA, la génération de news, la
  mémoire tactique.

## 9. Dette connue

- **`ui-08-controller-arena.js` fait 4304 lignes** — de loin le plus gros
  fichier du dépôt (le suivant, `ui-04a-faith-screens.js`, en fait 2349). Il
  concentre le routeur d'écrans (`CL`) et une bonne partie du rendu Canvas
  de l'arène ; un candidat naturel à un futur découpage, non entrepris à ce
  jour.
- **Déséquilibre de couverture des tests.** Aucun fichier de test dédié au
  mode Faith ni au mode Gauntlet — ils n'apparaissent que ponctuellement
  dans `invariants.test.js`, `regressionFixes.test.js` et
  `saveSystem.test.js` (Faith), et `regressionFixes.test.js` (Gauntlet).
  Ce sont pourtant les fichiers les plus modifiés dans l'historique récent
  (`ui-04b-gauntlet-screens.js`, `ui-03-contracts-arcade-data.js`,
  `ui-08-controller-arena.js` en tête).
- **`npm run lint:content` signale 27 points** au moment de la rédaction :
  10 anglicismes, 17 phrases visibles jugées trop longues (LOI 6). Ce
  linter est informatif — il n'est pas inclus dans `npm run check` et ne
  bloque pas une livraison à lui seul, mais ses signalements sont à
  regarder avant de merger du contenu narratif.

## 10. Livrables attendus en fin de session

1. Fichiers modifiés/créés, avec leur rôle.
2. `npm run check` vert (coller la sortie finale : `# pass N`, `# fail 0`).
3. Pour tout correctif de bug : le test ajouté dans
   `tests/regressionFixes.test.js` et son intitulé.
4. Pour toute modification du format de sauvegarde : le chemin de migration
   avant/après.
5. Écarts constatés entre ce document et l'état réel du dépôt, s'il y en a.
