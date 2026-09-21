# Cage Legacy — guide d'architecture

Relevé du 17/09/2026 (livré sur la branche `lot-0-documents`, basée sur `lot-3b`,
après merge du lot 3a).
**Numérotation des lots : depuis le 17/09/2026, les lots 0 à 5 (documents, style
stable, carte principale, arène, peau du jeu, monde qui parle — voir
`docs/AUDIT-17-09.md` §8) sont la référence en cours. Les numérotations
précédentes (P8 lots 1 à 10, lots DUEL, lots 1 à 3B du management) restent
valables comme historique : les ancres et documents qui les citent ne sont pas
à réécrire.** Les chiffres (lignes, tests, versions) sont des **observations
datées** : revérifie-les avant de t'appuyer dessus. `AGENTS.md` porte les règles
communes à tous les assistants ; ce fichier-ci ajoute ce qui est propre au
travail de Claude.

## 0. Rôle de Claude sur ce dépôt

- **Le code est écrit par OpenCode (modèle GLM 5.3, offre Go).** Claude
  **supervise et orchestre** : il prépare les contrats de lot, découpe en tranches,
  rédige les consignes envoyées à OpenCode, relit les diffs produits, lance les
  vérifications et rend compte à Anthony.
- Claude n'implémente pas lui-même un lot confié à OpenCode, sauf demande
  explicite d'Anthony. Il peut corriger la documentation et l'outillage quand on
  le lui demande.
- Une tranche livrée par OpenCode n'est acceptée qu'après : relecture du diff
  contre le contrat, `npm run check` relancé par Claude sur l'état réel, et
  vérification qu'aucun test n'a été assoupli sans décision citée.
- **Contenu d'auteur** : dialogues, voix, noms et motivations de personnages sont
  écrits par Anthony. Ni Claude ni OpenCode n'en inventent. Un texte manquant
  reste `[EMPLACEMENT AUTEUR]` et il est signalé.

## 1. Nature du projet

Cage Legacy est un jeu de MMA en vanilla JavaScript, jouable dans le navigateur
(`index.html`), sans build ni backend. **Deux modes jouables**, accessibles dès
l'écran titre (`ui-06-career-screens.js`, `scr_title`) :

- **Carrière Complète** — mode historique : amateur → pro → retraite, classements,
  contrats, Panthéon, et l'exhibition « Duel entre amis » (`duel-codec.js`,
  `ui-10-duel.js`, entrée depuis le Panthéon). Stabilisé ; hors périmètre des
  lots 0 à 5.
- **Mode management** — **mode jouable, en développement actif** (lots 0 à 5).
  Le joueur est le matchmaker d'une organisation (Split), pas son patron.
  Document qui prime : `docs/VISION-MODE-MANAGEMENT.md` ; cahier des charges :
  `docs/CDC-MODE-MANAGEMENT.md` (sections périmées marquées), ses addendums et
  les six voix. Code : `mgmt-data.js`, `mgmt-bureau.js`, `mgmt-screens.js`.

## 2. Contraintes non négociables

- **Vanilla JS (ES6+), zéro dépendance runtime.** Aucun framework, aucun bundler.
- **Jamais `import`/`export`.** Scripts classiques, scope global partagé.
- **`"use strict";` en première ligne de chaque fichier `.js` du jeu.**
- **Persistance `localStorage` uniquement.** Aucun backend, aucun compte.
- **100 % offline** une fois chargé (déploiement GitHub Pages).
- **Aucun `Math.random()` dans la simulation** : RNG à graine (`setSeed`/`rnd`,
  `engine.js`).
- **Cible : PC.** Jeu pensé pour le PC (vision du 17/09/2026 : 1920×1080).
  Mode management : mise en page 1440px, lisible dès 1280, extensible à 1920,
  trois colonnes, souris d'abord, clavier en accélérateur (charte §L1,
  addendum §24-25, `ui-11-keys.js`). Le gabarit mobile 560px ne décrit plus la
  cible ; il ne subsiste que comme héritage CSS de la carrière.

## 3. Ordre de chargement

**`index.html` est la seule source de vérité** ; le harnais de test
(`tests/helpers/loadGame.js`) le lit directement. Ordre relevé le 17/09/2026
(identique à celui du 15/09, recontrôlé point par point contre `index.html`) :

1. `data-skills.js`, `data-content.js`, `data-people.js` — données
2. `engine.js` — RNG à graine, primitives partagées
3. `engine-combat.js` — moteur de combat (`simulateFight`)
4. `engine-progression.js`, `engine-career.js`, `engine-events.js`
5. `state/state-core.js` — `G`, `esc()`
6. `state/state-analytics.js`, `state/state-save.js`, `state/state-migration.js`,
   `state/state-validation.js`, `state/state-hof.js`
7. `ui-01-roster-matchmaking.js` à `ui-09-arena.js` (pas de `ui-04`)
8. `duel-codec.js`, `ui-10-duel.js` — exhibition « Duel entre amis »
9. `ui-11-keys.js` — navigation clavier globale (`keysRegister`)
10. `mgmt-data.js`, `mgmt-bureau.js`, `mgmt-screens.js` — mode management
11. `main.js` — bootstrap

## 4. Globaux structurants

| Global | Défini dans | Rôle |
|---|---|---|
| `G` | `let G=null;` dans `state/state-core.js`, initialisé dans `main.js` | État de jeu courant. Le management vit dans `G.mgmt`. |
| `CL` | `ui-08-controller-arena.js`, exposé via `window.CL` ; étendu par `Object.assign` dans `mgmt-screens.js` et `ui-10-duel.js` | Contrôleur de navigation/actions |
| `esc()` | `state/state-core.js` | Échappement HTML de toute donnée injectée dans le DOM. Aucune exception. |
| `SAVE_KEY` / `SAVE_BACKUP_KEY` | `state/state-save.js` (`'cage-legacy-v3'`) | Sauvegarde carrière + secours |
| `SAVE_VERSION` | `state/state-migration.js` — **5** | Carrière : toute version ≠ 5 est refusée proprement (reset historique décidé) |
| `MGMT_KEY` / `MGMT_BACKUP_KEY` | `mgmt-bureau.js` (`'cage-legacy-mgmt'`) | Sauvegarde management + secours, circuit séparé de la carrière |
| `MGMT_SAVE_VERSION` | `mgmt-bureau.js` — **4** | Management : migration séquentielle 2 → 3 → 4 sans perte (`mgmtMigrate` — lot 3a le corps, lot 3B T1 l'argent), v1 refusée |

## 5. Séparation des responsabilités

- **`data-*.js`, `mgmt-data.js`** : données pures. Aucune logique, aucun DOM.
- **`engine-*.js`, `state/*.js`, `mgmt-bureau.js`** : simulation et état. Aucun
  accès DOM/Canvas, simulation 100 % synchrone.
- **`ui-*.js`, `mgmt-screens.js`** : rendu et événements utilisateur. Pas de règle
  de simulation.
- Le mode management **réutilise** le moteur existant (`simulateFight`,
  `makeName`, `rollInjury`…) sans le modifier. Ne jamais créer un second système
  à côté d'un système existant.

## 6. Conventions de code

- **Ancres** : `/* ==== [ANCRE: NOM] ==== */` avec la référence du lot. Déplacée
  avec son code, jamais réécrite ni supprimée.
- **Taille des fonctions** : au-delà de ~40 lignes, envisager un découpage — sans
  extraction mécanique qui nuirait à la lecture.
- **JSDoc** sur les fonctions de simulation non triviales.
- **Scope global** : un appelant orphelin ne casse qu'à l'exécution. Avant de
  supprimer ou renommer une fonction, chercher tous ses appelants.
- **Canvas 2D** : dans les boucles `requestAnimationFrame`, réutiliser les objets
  (patron : pool de particules de `ui-09-arena.js`, ancre `JUICE_NIVEAU2`).

## 7. Validation

```bash
npm install          # une seule fois (jsdom, eslint)
npm run lint         # ESLint
npm test             # node --test sur la liste de package.json
npm run check        # lint + lint:content + test — DOIT être vert avant toute livraison
npm run lint:content # linter de contenu narratif — inclus dans check depuis le lot 0 (17/09/2026)
```

État au 19/09/2026 (branche `lot-1-style-stable`) : **265 tests, 261 passants,
0 échec, 4 skip**. Les 4 skip sont dans `mgmtBureau.test.js` : trois sorties de
carte incomplète (remonter un prélim, short notice, combattant libre) et une
pénalité économie au-delà du plafond de découvert — comportements décidés mais
absents du code (voir `docs/QUESTIONS-OUVERTES.md`). **16 fichiers dans
`tests/`**, dont `mgmtBureau.test.js` (53), `mgmtCard.test.js` (23),
`mgmtEconomie.test.js` (13) et `mgmtSoiree.test.js` (11) pour le management,
`regressionFixes.test.js` (75) et `duel.test.js` (28) pour la carrière.
Durée : ~90 s.

**La liste des tests est écrite à la main dans `package.json`** (scripts `test`
et `test:watch`) : un nouveau fichier de test doit y être ajouté, sinon il ne
tourne jamais.

**Règle** : aucune livraison sans `npm run check` vert. Un bug corrigé = un test
ajouté (`tests/regressionFixes.test.js` pour la carrière, le fichier `mgmt*`
concerné pour le management). Un test n'est jamais réécrit pour retrouver du vert
sans citer la décision qui change le comportement attendu.

## 8. Règles de modification

- **Additif par défaut.** Ne pas retirer une fonctionnalité pour en simplifier une
  autre.
- **Sauvegardes** : toute évolution du format passe par la migration du circuit
  concerné (`migrate()` carrière, `mgmtMigrate()` management) et par sa
  validation (`validateSave()`, `validateMgmt()`). Jamais de plantage au
  chargement ; jamais de contamination entre carrière et management.
- **Ne jamais créer un système parallèle** à un système existant.
- **À préserver** : offline, sauvegarde principale + secours, Panthéon,
  classements, ères MMA, news, mémoire tactique, duel, partage de légendes.

## 9. Documents de référence

| Document | Rôle |
|---|---|
| `docs/VISION-MODE-MANAGEMENT.md` | Vision du mode management (16-17/09/2026). **Prime en cas de contradiction avec tout autre document.** |
| `docs/AUDIT-17-09.md` | Audit du mode management (17/09/2026) : constats X/C/D/B/G/M/T, ordre des lots 0 à 5. Chaque constat attend la décision d'Anthony. |
| `docs/CDC-MODE-MANAGEMENT.md` | Cahier des charges du management — fait foi sauf contradiction avec la vision ; sections périmées marquées en tête. |
| `docs/CDC-MODE-MANAGEMENT-ADDENDUM.md`, `docs/CDC-ADDENDUM-2-LES-SIX-REGARDS.md` | Décisions complémentaires (mêmes marques sur les sections périmées) |
| `docs/LES-SIX-VOIX-v1.1.md`, `docs/LES-CINQ-LEGENDES-v1.1.md` | Voix et personnages — contenu d'auteur |
| `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md`, `docs/LOT-3A-TESTS-CONTRAT.md` | Lot 3a — livré et mergé (PR 61) |
| `docs/LOT-3B-CARTE-INCOMPLETE.md`, `docs/LOT-3B-CONTRAT.md` | Lot 3B — textes d'auteur complets ; T1 (argent de l'organisation) livré, T2 (carte principale) contracté mais non codé |
| `docs/CHARTE-INTERFACE-MANAGEMENT.md` | Charte d'interface du management (15/09/2026) : priorité d'Anthony. Vérification UI obligatoire à chaque tranche qui touche un écran (§3). |
| `docs/QUESTIONS-OUVERTES.md` | QO-1 à QO-7 : ce qui manque côté code ou design. N'y répondre qu'avec une décision d'Anthony. |
| `docs/ETAT-DES-LIEUX.md` | Inventaire du 08/09/2026 (fichiers à garder / à jeter) — le sort du mode Duel y est en attente de la décision d'Anthony (T5). |
| `docs/STRATEGIE-IA-CAGE-LEGACY-2026-09.md` | Proposition de méthode de production avec les IA (pas une spécification du jeu) |
| `docs/ETAT-14-09.md` | **Périmé (17/09/2026)** : historique des deux tests rouges du 14/09, réécrits depuis. Ne plus s'y fier. |
| `maquettes/`, `prototypes/` | Maquettes des dix écrans et prototype d'arène validés le 17/09/2026 (vision §Direction artistique) |

## 10. Dette connue

- **`engine-combat.js` fait ~2500 lignes**, le plus gros fichier du dépôt.
  `ui-06-career-screens.js` (~1190) est le plus gros côté UI, `mgmt-bureau.js`
  (~1300, grossi par le lot 3B T1) le plus gros du management et porte plusieurs
  responsabilités (bureau, carte, argent, corps, soirée, sauvegarde). Aucun
  découpage entrepris.
- **`npm run lint:content`** : 3 signalements « MAIN EVENT » dans
  `ui-01-roster-matchmaking.js` (carrière, dont un dans un commentaire). Il sort
  avec le code 0 : inclus dans `check`, il ne bloque pas la livraison. Sa
  vérification de longueur ne couvre que `data-people.js` : il ne garantit rien
  sur le contenu management.
- **Hasard hors graine** : `uniqueFighterId()` (`engine.js`) utilise `Date.now()`
  et `Math.random()`. Le périmètre exact de reproductibilité n'est pas défini.
- **Mémoire des faits** : `mgmtAddFact()` supprime les faits au-delà de
  `MGMT_FACTS_MAX=10`, alors que l'addendum §2 dit « le fait ne disparaît
  jamais ». Arbitrage d'auteur non rendu.
- **Modes Faith, Gauntlet et boutique retirés** avec leurs fichiers. Toute mention
  restante est de la documentation historique ou une donnée d'ancienne légende du
  Panthéon (`f.gameMode`, `f.faithNemesisId`, `f.faithTraits`), jamais du code
  vivant.
- **Plan P8 carrière** : intégralement livré (lots 6 à 10), rapports dans
  `tools/reports/`.

## 11. Livrables attendus en fin de session

1. Fichiers modifiés/créés, avec leur rôle.
2. `npm run check` vert (sortie finale : `# pass N`, `# fail 0`).
3. Pour tout correctif : le test ajouté et son intitulé.
4. Pour toute modification d'un format de sauvegarde : le chemin de migration.
5. Pour une tranche OpenCode : diff relu, écarts au contrat, décision
   d'acceptation ou de reprise.
6. Écarts constatés entre ce document et l'état réel du dépôt.
