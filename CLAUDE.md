# Cage Legacy — guide d'architecture

## 1. Nature du projet

Cage Legacy est un jeu de gestion de carrière de MMA en vanilla JavaScript,
jouable directement dans le navigateur (`index.html`), sans build ni backend.
Le mode de jeu disponible est :

- **Carrière Complète** — le mode historique : amateur → pro → retraite,
  classements, contrats, Panthéon.

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

Ordre lu dans `index.html` :

1. `data-skills.js` — données de compétences
2. `data-content.js` — textes/contenus génériques
3. `data-people.js` — noms, pays, traits
4. `engine.js` — cœur du moteur, types partagés
5. `engine-combat.js` — résolution des combats
6. `engine-progression.js` — XP, attributs, évolution du combattant
7. `engine-career.js` — déroulé de carrière, calendrier
8. `engine-events.js` — génération d'événements/actualités
9. `state/state-core.js` — état global `G`, `esc()`, helpers de base
10. `state/state-analytics.js` — analytics locales
11. `state/state-save.js` — `SAVE_KEY`, sauvegarde/chargement
12. `state/state-migration.js` — `SAVE_VERSION`, migrations
13. `state/state-validation.js` — validation de sauvegarde
14. `state/state-hof.js` — Panthéon (Hall of Fame)
15. `ui-01-roster-matchmaking.js` — roster, matchmaking
16. `ui-02-fight-prep-events.js` — préparation de combat, événements
17. `ui-03-contracts-arcade-data.js` — contrats et récits de combat
18. `ui-05-fight-resolution.js` — écran de résultat de combat, succès
19. `ui-06-career-screens.js` — écrans de carrière
20. `ui-07-contracts-legacy-screens.js` — contrats/legacy
21. `ui-08-controller-arena.js` — routeur d'écrans (`CL`), boucle de jeu
22. `ui-09-arena.js` — arène et animation Canvas 2D
23. `main.js` — bootstrap, initialisation de `G`

## 4. Globaux structurants

| Global | Défini dans | Rôle |
|---|---|---|
| `G` | déclaré `let G=null;` dans `state/state-core.js:14`, initialisé dans `main.js` (`G={screen:'title',...}`) et réassigné à chaque nouvelle partie/écran (`newCareer()`, `exitLegacy()`, etc. dans `ui-08-controller-arena.js`) | État de jeu courant (donnée brute, jamais figée dans un objet séparé) |
| `CL` | `ui-08-controller-arena.js:102`, exposé via `window.CL=CL;` en fin de fichier | Contrôleur de navigation/actions (`CL.go(screen)`, etc.) |
| `esc()` | `state/state-core.js:23` | Échappement HTML pour tout texte injecté dans le DOM (noms de combattant, surnoms, légendes importées) |
| `SAVE_KEY` | `state/state-save.js:28` (`'cage-legacy-v3'`) | Clé `localStorage` de la sauvegarde principale |
| `SAVE_VERSION` | `state/state-migration.js:4` (`4` au moment de la rédaction) | Version de schéma de sauvegarde, utilisée par `migrate()` |

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
npm test             # suite de tests (node --test), 10 fichiers
npm run check        # lint + test — DOIT être vert avant toute livraison
```

Au moment de la rédaction : **101 tests**, répartis sur 10 fichiers dans
`tests/` (`analytics.test.js`, `career.test.js`, `champChamp.test.js`,
`hallOfFame.test.js`, `hubCombatDossier.test.js`, `invariants.test.js`,
`proceduralNarrative.test.js`, `ranking.test.js`, `regressionFixes.test.js`,
`saveSystem.test.js`), tous passants (`npm run check` vert).

**Règle** : aucune livraison sans `npm run check` vert. Un bug corrigé =
un test ajouté dans `tests/regressionFixes.test.js` (déjà le fichier le
plus fourni, et de loin : 60 tests au moment de la rédaction).

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

- **Les modes Faith et Gauntlet (avec la boutique associée) ont été
  entièrement retirés du jeu**, y compris leurs 6 fichiers dédiés
  (`data-faith-content.js`, `state-faith.js`, `ui-04a-faith-screens.js`,
  `state-gauntlet.js`, `ui-04b-gauntlet-screens.js`, `state-shop.js`) —
  seul le mode Carrière Complète reste jouable. Une purge complète du code
  et de la documentation résiduels a été faite après coup (fonctions
  orphelines, branches mortes conditionnées par `G.faith`/`G.gauntlet`/
  `G.arcade`, sauvegardes historiques purgées par `migrate()`) ; si une
  ancre ou un commentaire mentionne encore ces modes ailleurs dans le
  dépôt, il s'agit de documentation historique volontairement conservée
  (rationale d'un correctif passé) ou de données légitimes d'anciennes
  légendes du Panthéon (`f.gameMode`, `f.faithNemesisId`, `f.faithTraits`),
  jamais de code vivant.
- **`ui-06-career-screens.js` fait ~1199 lignes** — le plus gros fichier du
  dépôt depuis le Lot 6/P8 (retrait des moments de bascule et du coin entre
  les rounds, qui a fait reculer `ui-08-controller-arena.js` à ~946 et
  `ui-09-arena.js` à ~627). `ui-08-controller-arena.js` concentre le routeur
  d'écrans (`CL`) et une bonne partie du rendu Canvas de l'arène ; les deux
  fichiers restent des candidats naturels à un futur découpage, non
  entrepris à ce jour.
- **`npm run lint:content` signale 3 points** au moment de la rédaction :
  3 occurrences de l'anglicisme « MAIN EVENT » (`ui-01-roster-matchmaking.js`,
  hors périmètre du Lot 6/P8), 0 phrase visible jugée trop longue (LOI 6),
  0 champ `G.f./G.faith./G.arcade.` écrit mais jamais relu. Ce linter est
  informatif — il n'est pas inclus dans `npm run check` et ne bloque pas
  une livraison à lui seul, mais ses signalements sont à regarder avant de
  merger du contenu narratif.

## 10. Livrables attendus en fin de session

1. Fichiers modifiés/créés, avec leur rôle.
2. `npm run check` vert (coller la sortie finale : `# pass N`, `# fail 0`).
3. Pour tout correctif de bug : le test ajouté dans
   `tests/regressionFixes.test.js` et son intitulé.
4. Pour toute modification du format de sauvegarde : le chemin de migration
   avant/après.
5. Écarts constatés entre ce document et l'état réel du dépôt, s'il y en a.
