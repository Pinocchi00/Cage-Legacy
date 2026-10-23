# Cage Legacy — guide pour Claude

Règles stables et architecture. L'état des lots, les chiffres datés, le tableau
complet des documents et la dette sont dans `docs/HISTORIQUE-CLAUDE-MD.md` et dans
la mémoire : ne pas les recopier ici. `AGENTS.md` porte les règles communes à tous
les assistants.

## Rôle

- Claude supervise : contrats de lot, découpage en tranches, consignes pour
  OpenCode, relecture des diffs, vérifications, compte rendu à Anthony. Qui code
  quel lot est noté dans la mémoire.
- Une tranche n'est acceptée qu'après : diff relu contre le contrat, `npm run check`
  relancé par Claude, aucun test assoupli sans décision citée.
- Contenu d'auteur (dialogues, voix, noms, motivations) : la règle en vigueur est
  dans la mémoire. Un texte manquant reste `[EMPLACEMENT AUTEUR]` et il est signalé.

## Économie de contexte

- Lire des extraits (`grep`, plages de lignes), jamais un gros fichier en entier :
  `engine-combat.js`, `data-skills.js`, `ui-06-career-screens.js` et les gros
  fichiers de `tests/` dépassent chacun 30 000 tokens.
- Filtrer les sorties de tests : résumé et échecs seulement
  (`npm run check 2>&1 | tail -30`).
- Captures d'écran uniquement pour une tranche qui touche un écran, une par écran.
- Ne pas parcourir `planches-*`, `relecture/`, `maquettes/`, `prototypes/`,
  `tools/reports/` sans besoin précis.

## Projet

Jeu de MMA en vanilla JS dans le navigateur (`index.html`), sans build ni backend.
Modes accessibles depuis l'accueil : **Management** (le joueur est le matchmaker
de l'organisation Split, développement actif, avec le mode **Duo**
`mgmt-duo-*`), **Carrière** et l'exhibition **Duel** (stabilisés). Document qui
prime : `docs/VISION-MODE-MANAGEMENT.md`, puis `docs/CDC-MODE-MANAGEMENT.md` et
ses addendums, et la charte `docs/CHARTE-INTERFACE-MANAGEMENT.md`.

## Contraintes non négociables

- Vanilla JS ES6+, zéro dépendance runtime, ni framework ni bundler.
- Jamais `import`/`export` : scripts classiques, scope global partagé.
- `"use strict";` en première ligne de chaque `.js` du jeu.
- Persistance `localStorage` uniquement, 100 % offline (GitHub Pages).
- Aucun `Math.random()` dans la simulation : RNG à graine (`setSeed`/`rnd`, `engine.js`).
- Cible PC 1920×1080. Management : lisible dès 1280, souris d'abord, clavier en
  accélérateur (`ui-11-keys.js`).

## Ordre de chargement

**`index.html` est la seule source de vérité** (le harnais `tests/helpers/loadGame.js`
le lit). Vérifier, ne jamais supposer. Grandes familles, dans l'ordre :
`demo-config.js` → `data-*` → `stockage.js`, `engine.js` → `engine-combat-*`
(`engine-combat.js` = `simulateFight`) → `engine-progression/career/events`
→ `state/*` (`state-core.js` en premier) → `ui-01` à `ui-08`, `ui-carriere-pc.js`
→ `duel-codec.js`, `ui-10-duel.js` → `ui-11-keys.js` → `mgmt-*` (données `*-data.js`
d'abord, puis simulation, `mgmt-save.js`, écrans `mgmt-ecran-*`, `mgmt-screens.js`,
cadres) → `arene-*` → présentation, soirée, Duo → `main.js`.
Feuilles de style : `ui-skin.css`, `ui-cadre.css`, `ui-duo.css`, `ui-pantheon.css`,
`ui-carriere.css`, `ui-carriere-pc.css`.

## Globaux structurants

| Global | Défini dans | Rôle |
|---|---|---|
| `G` | `state/state-core.js`, initialisé dans `main.js` | État courant ; management dans `G.mgmt` |
| `CL` | `ui-08-controller-arena.js` (`window.CL`), étendu par `Object.assign` (`mgmt-screens.js`, `ui-10-duel.js`…) | Contrôleur de navigation |
| `esc()` | `state/state-core.js` | Échappement HTML de toute donnée injectée. Aucune exception. |
| `SAVE_KEY` / `SAVE_VERSION` | `state/state-save.js`, `state/state-migration.js` | Sauvegarde carrière + secours |
| `MGMT_KEY` / `MGMT_SAVE_VERSION` | `mgmt-bureau.js` ; lues par `mgmt-save.js` | Sauvegarde management + secours, circuit séparé ; trois emplacements (`MGMT_SLOT`, `mgmt-emplacements.js`) |

## Séparation des responsabilités

- `data-*.js`, `mgmt-*-data.js` : données pures, ni logique ni DOM.
- `engine-*`, `state/*`, simulation `mgmt-*` : synchrone, aucun DOM ni canvas.
- `ui-*`, `mgmt-ecran-*`, `mgmt-screens.js`, cadres et `arene-vue/ecran` : rendu et
  événements, aucune règle de simulation. `arene-etat.js` reste pur.
- Le management réutilise le moteur (`simulateFight`, `makeName`, `rollInjury`…)
  sans le modifier. Jamais de système parallèle à un système existant.

## Conventions de code

- Ancres `/* ==== [ANCRE: NOM] ==== */` avec la référence du lot : déplacées avec
  leur code, jamais réécrites ni supprimées.
- Au-delà de ~40 lignes, envisager un découpage lisible. JSDoc sur la simulation non triviale.
- Scope global : avant de renommer ou supprimer une fonction, chercher tous ses appelants.
- Canvas 2D : réutiliser les objets dans les boucles `requestAnimationFrame`
  (patron : pool de particules d'`arene-vue.js`).
- Tout `.js` ou `.css` modifié monte son `?v=` dans `index.html`.

## Validation

```bash
npm run check   # lint + lint:content + tests — DOIT être vert avant toute livraison
```

- La liste des tests est écrite à la main dans `package.json` : un nouveau fichier
  de test doit y être ajouté, sinon il ne tourne jamais.
- Un bug corrigé = un test ajouté (`tests/regressionFixes.test.js` pour la carrière,
  le fichier `mgmt*` concerné pour le management).
- Un test n'est jamais réécrit pour retrouver du vert sans citer la décision.

## Règles de modification

- Additif par défaut ; ne pas retirer une fonctionnalité pour en simplifier une autre.
- Sauvegardes : toute évolution passe par la migration (`migrate()` / `mgmtMigrate()`,
  séquentielle, sans perte) et la validation (`validateSave()` / `validateMgmt()`).
  Jamais de plantage au chargement, jamais de contamination entre carrière et management.
- À préserver : offline, sauvegarde principale + secours, Panthéon, classements,
  ères MMA, news, mémoire tactique, duel, partage de légendes.
- `docs/QUESTIONS-OUVERTES.md` : n'y répondre qu'avec une décision d'Anthony.

## Fin de session

1. Fichiers modifiés/créés et leur rôle.
2. `npm run check` vert (`# fail 0`).
3. Pour un correctif : le test ajouté. Pour un format de sauvegarde : la migration.
4. Pour une tranche OpenCode : diff relu, écarts au contrat, acceptation ou reprise.
