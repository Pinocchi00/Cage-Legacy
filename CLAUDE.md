# Cage Legacy — guide d'architecture

Relevé du 24/09/2026, sur la branche `integration-24-09` : lot 2 (fusionné le
21/09, PR 62), puis le lot 3 (l'arène, T1 à T5) et le lot 2B (T1, T1 bis, T1 ter,
T2 bis, T3, T4), plus les contrats des lots 4 et 5.
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
  `ui-10-duel.js`, entrée depuis le Panthéon). Stabilisé, et hors périmètre des
  lots 0 à 5 **sauf sur un point** : depuis le lot 3 (24/09/2026), la carrière et
  le Duel tournent sur l'arène neuve (`arene-*.js`) ; `ui-09-arena.js` est retirée.
- **Mode management** — **mode jouable, en développement actif**. Lots 0 (les
  documents), 1 (le style stable) et 2 (la carte principale) sont **livrés et
  fusionnés dans `main` le 21/09/2026**. Reste le **lot 2B** (le vivier se
  renouvelle) et le **lot 3** (l'arène) sont livrés au 24/09/2026 — sauf la T2 du
  lot 2B (le recrutement), reportée au lot 5. Restent les lots 4 (la peau du jeu)
  et 5 (le monde qui parle), contrats écrits.
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
(`tests/helpers/loadGame.js`) le lit directement. Ordre relevé le 21/09/2026,
après le découpage de `mgmt-bureau.js` :

1. `data-skills.js`, `data-content.js`, `data-people.js` — données
2. `engine.js` — RNG à graine, primitives partagées
3. **Moteur de combat, six fichiers depuis le découpage du 21/09/2026** :
   `engine-combat-tactics.js` (profils de style, politiques, rythme,
   adaptabilité) — `engine-combat-striking.js` (usure, coups lourds, taxonomie,
   blessures) — `engine-combat-grappling.js` (sol et clinch) —
   `engine-combat-officials.js` (arbitre, juges, examen médical) —
   `engine-combat.js` (**`simulateFight` seule, 1641 lignes d'un bloc**) —
   `engine-combat-outcomes.js` (`applyResult`, finitions, estimation).
   Aucune dépendance de chargement entre eux : les 36 constantes de premier
   niveau sont toutes littérales. Les aides précèdent `simulateFight` par
   lisibilité, les résultats la suivent comme dans le fichier d'origine.
4. `engine-progression.js`, `engine-career.js`, `engine-events.js`
5. `state/state-core.js` — `G`, `esc()`
6. `state/state-analytics.js`, `state/state-save.js`, `state/state-migration.js`,
   `state/state-validation.js`, `state/state-hof.js`
7. `ui-01-roster-matchmaking.js` à `ui-08-controller-arena.js` (pas de `ui-04`,
   plus de `ui-09` : retirée au lot 3 T4)
8. `duel-codec.js`, `ui-10-duel.js` — exhibition « Duel entre amis »
9. `ui-11-keys.js` — navigation clavier globale (`keysRegister`)
10. **Mode management, huit fichiers depuis le découpage du 21/09/2026** :
    `mgmt-data.js` (données pures) — `mgmt-bureau.js` (pile d'affaires,
    décisions, Leïla) — `mgmt-carte.js` (sous-carte, composition, classement) —
    `mgmt-corps.js` (corps, soirée) — `mgmt-argent.js` (économie) —
    `mgmt-monde.js` (monde extérieur dérivé) — `mgmt-save.js` (persistance) —
    `mgmt-screens.js` (rendu, dernier car il étend `CL`).
    **Une seule dépendance de chargement inter-fichiers** dans tout le mode :
    `MGMT_CARD_CONTRACT = MGMT_MAIN_SIZE + MGMT_PRELIM_SIZE` (`mgmt-argent.js`)
    lit `mgmt-data.js`. Les cinq fichiers du milieu sont sinon libres d'ordre ;
    celui retenu suit l'histoire des lots.
11. **L'arène neuve, trois fichiers** (lot 3) : `arene-etat.js` (l'état, pur, sans
    canvas ni `G` — déplacement physique porté du prototype), `arene-vue.js` (le
    dessin), `arene-ecran.js` (l'écran et ses commandes). Elle sert la soirée du
    management, la carrière et le Duel.
12. `main.js` — bootstrap

## 4. Globaux structurants

| Global | Défini dans | Rôle |
|---|---|---|
| `G` | `let G=null;` dans `state/state-core.js`, initialisé dans `main.js` | État de jeu courant. Le management vit dans `G.mgmt`. |
| `CL` | `ui-08-controller-arena.js`, exposé via `window.CL` ; étendu par `Object.assign` dans `mgmt-screens.js` et `ui-10-duel.js` | Contrôleur de navigation/actions |
| `esc()` | `state/state-core.js` | Échappement HTML de toute donnée injectée dans le DOM. Aucune exception. |
| `SAVE_KEY` / `SAVE_BACKUP_KEY` | `state/state-save.js` (`'cage-legacy-v3'`) | Sauvegarde carrière + secours |
| `SAVE_VERSION` | `state/state-migration.js` — **5** | Carrière : toute version ≠ 5 est refusée proprement (reset historique décidé) |
| `MGMT_KEY` / `MGMT_BACKUP_KEY` | `mgmt-bureau.js` (`'cage-legacy-mgmt'`) ; lues par `saveMgmt`/`loadMgmt` dans `mgmt-save.js` | Sauvegarde management + secours, circuit séparé de la carrière |
| `MGMT_SAVE_VERSION` | `mgmt-bureau.js` — **9** | Management : migration séquentielle sans perte jusqu'à 9 (`mgmtMigrate` — lot 3a le corps, lot 3B T1 l'argent, lot 2 T1 la carte, lot 3 T1 la trace, lot 2B T1 ter la récupération du corps, T2 bis le calendrier d'âge, T3 les départs), v1 refusée |

## 5. Séparation des responsabilités

- **`data-*.js`, `mgmt-data.js`** : données pures. Aucune logique, aucun DOM.
- **`engine-*.js`, `state/*.js`, `mgmt-bureau.js` et ses cinq compagnons
  (`mgmt-carte.js`, `mgmt-corps.js`, `mgmt-argent.js`, `mgmt-monde.js`,
  `mgmt-save.js`)** : simulation et état. Aucun
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
  (patron : le pool de particules d'`arene-vue.js`).

## 7. Validation

```bash
npm install          # une seule fois (jsdom, eslint)
npm run lint         # ESLint
npm test             # node --test sur la liste de package.json
npm run check        # lint + lint:content + test — DOIT être vert avant toute livraison
npm run lint:content # linter de contenu narratif — inclus dans check depuis le lot 0 (17/09/2026)
```

État au 24/09/2026 (`integration-24-09`) : **342 tests, 338 passants,
0 échec, 4 skip**. Les 4 skip sont dans `mgmtBureau.test.js` : trois sorties de
carte incomplète (remonter un prélim, short notice, combattant libre) et une
pénalité économie au-delà du plafond de découvert — comportements décidés mais
absents du code (voir `docs/QUESTIONS-OUVERTES.md`). **20 fichiers dans
`tests/`**, dont `mgmtBureau.test.js` (58), `mgmtCard.test.js` (44),
`mgmtEconomie.test.js` (15) et `mgmtSoiree.test.js` (11) pour le management,
`regressionFixes.test.js` (75) et `duel.test.js` (28) pour la carrière.
Durée : ~95 s.

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
| `docs/LOT-3B-CARTE-INCOMPLETE.md`, `docs/LOT-3B-CONTRAT.md` | Lot 3B — textes d'auteur complets ; T1 (argent de l'organisation) livré. Sa T2 (carte principale) a été reprise et remplacée par le lot 2 ; ses T3 à T5 (retrait, remonter un prélim, short notice) restent à coder |
| `docs/LOT-3-L-ARENE.md` | **Lot 3 — livré (T1 à T5) au 24/09.** Répond à C2, C3, M3, M4. La T3 a été recadrée le 23/09 : le déplacement est **porté du prototype**, pas inventé ; la T3 bis a été supprimée. **L'arène est refaite à neuf et sert les deux modes ; `ui-09-arena.js` est retirée** (décision d'Anthony du 21/09). Son §1 porte le principe fondateur — le moteur décide, l'arène met en scène — et son §2 les quatre cibles mesurables du réalisme |
| `docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md` | **Lot 2B — livré au 24/09 (T1, T1 bis, T1 ter, T2 bis, T3, T4)**, sauf la T2 (le recrutement) reportée au lot 5 T5. Répond à QO-8. Son §5 liste les cinq points tranchés avant la T2, son §5 d la relecture de la T1, son **§5 e les décisions du 22/09** : le monde dérivé se lit **à travers un combattant** (sa fiche) plus **trois à cinq informations sur le hub**, au lot 4 ; et les quatre organisations extérieures sont **nommées et ordonnées** (Garden of Blood → MMA Korner → Ultimate Rim → Fighting Pacific Championship, prestige croissant) — `MGMT_EXT_ORGS` n'a plus d'`[EMPLACEMENT AUTEUR]` |
| `docs/LOT-4-LA-PEAU-DU-JEU.md` | **Lot 4 — contrat écrit le 23/09, non commencé.** Les écrans maquettés remplacent l'habillage, sans créer de système de jeu ; commence par découper `mgmt-screens.js` en un fichier par écran pour permettre deux outils en parallèle. Son §1 : **aucun texte de maquette ne s'affiche en jeu** |
| `docs/LOT-5-LE-MONDE-QUI-PARLE.md` | **Lot 5 — contrat écrit le 23/09, non commencé.** Ceintures et combats en 5 rounds, la voix du monde par formules d'auteur, la pression de l'attente, le recrutement (ex-lot 2B T2), les cartes incomplètes (ex-lot 3B T3-T5), les camps et le classement des organisations sous conditions. Son **§6 dresse la liste de tout ce qu'Anthony doit écrire** |
| `docs/LOT-2-CARTE-PRINCIPALE.md` | **Lot 2 — livré et fusionné (PR 62).** Contrat, les cinq tranches, les décisions du 20/09 et les relectures. Son §4 bis porte les réserves d'interface encore ouvertes (lot 4) |
| `tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md` | Calibrage de l'économie sur le déroulé réel (21/09/2026) : les quatre profils de joueur, les trois cibles, et le tableau des six soirées enchaînées qui a révélé QO-8 |
| `docs/CHARTE-INTERFACE-MANAGEMENT.md` | Charte d'interface du management (15/09/2026) : priorité d'Anthony. Vérification UI obligatoire à chaque tranche qui touche un écran (§3). |
| `docs/QUESTIONS-OUVERTES.md` | QO-1 à QO-11. **Attention au titre : QO-1 à QO-7 sont toutes « design arrêté » — ce qui manque est le code, pas une décision.** QO-5 et QO-6 sont livrées. QO-8 (le vivier), QO-9 (la mémoire des faits) et QO-10 (Leïla parle trop) portent les décisions d'Anthony du 21/09 : tranchées, pas encore codées. **QO-11 (22/09) est une incohérence, pas une question : « entrer dans le top 5 » n'a pas de sens dans un monde de cinq organisations — à trancher quand le classement des organisations sera écrit (lot 5), pas avant.** N'y répondre qu'avec une décision d'Anthony. |
| `docs/ETAT-DES-LIEUX.md` | Inventaire du 08/09/2026 (fichiers à garder / à jeter) — le sort du mode Duel y est en attente de la décision d'Anthony (T5). |
| `docs/STRATEGIE-IA-CAGE-LEGACY-2026-09.md` | Proposition de méthode de production avec les IA (pas une spécification du jeu) |
| `docs/ETAT-14-09.md` | **Périmé (17/09/2026)** : historique des deux tests rouges du 14/09, réécrits depuis. Ne plus s'y fier. |
| `maquettes/`, `prototypes/` | Maquettes des dix écrans et prototype d'arène validés le 17/09/2026 (vision §Direction artistique) |

## 10. Dette connue

- **Le moteur de combat est découpé depuis le 21/09/2026** : `engine-combat.js`
  est passé de 2497 à **1670 lignes**. Déplacement pur, vérifié ligne à ligne.
  **La dette qui reste est `simulateFight` elle-même : 1641 lignes d'un seul
  tenant**, qui ne se découpent pas par déplacement — il faudrait extraire des
  sous-fonctions, donc refactoriser la partie la plus calibrée du dépôt. Aucune
  raison de s'y attaquer sans besoin précis.
- **`ui-06-career-screens.js` (~1190 lignes)** est désormais le plus gros
  fichier après lui, et le plus gros côté UI. Jamais découpé.
- **Le management est découpé depuis le 21/09/2026.** `mgmt-bureau.js` est passé
  de 2017 à **469 lignes** ; le plus gros fichier du mode est désormais
  `mgmt-carte.js` (~508). Déplacement pur, vérifié ligne à ligne : aucune ligne
  de code perdue, aucun test modifié. Cette dette est réglée.
- **`npm run lint:content`** : 3 signalements « MAIN EVENT » dans
  `ui-01-roster-matchmaking.js` (carrière, dont un dans un commentaire). Il sort
  avec le code 0 : inclus dans `check`, il ne bloque pas la livraison. Sa
  vérification de longueur ne couvre que `data-people.js` : il ne garantit rien
  sur le contenu management.
- **Hasard hors graine** : `uniqueFighterId()` (`engine.js`) utilise `Date.now()`
  et `Math.random()`. Le périmètre exact de reproductibilité n'est pas défini.
- **Mémoire des faits** : `mgmtAddFact()` supprime les faits au-delà de
  `MGMT_FACTS_MAX=10` (`mgmt-data.js:30`), alors que l'addendum §2 dit « le fait
  ne disparaît jamais ». **Arbitrage rendu le 21/09/2026 (QO-9) : les faits ne
  disparaissent jamais, le plafond saute, et l'interface les range et les trie.**
  Décidé, pas encore codé — les deux moitiés vont ensemble.
- **Modes Faith, Gauntlet et boutique retirés** avec leurs fichiers. Toute mention
  restante est de la documentation historique ou une donnée d'ancienne légende du
  Panthéon (`f.gameMode`, `f.faithNemesisId`, `f.faithTraits`), jamais du code
  vivant.
- **Les tests du Duel émettent un `TypeError` non bloquant** (`reading 'flag'`,
  dans une minuterie de jsdom) : visible dans la sortie de `npm run check`, il
  existait avant le lot 3 (vérifié sur `8a8988e`). Sans échec de test, mais à
  nettoyer un jour.
- **Le monde extérieur n'a pas de jeunes pendant ses dix premières années**
  (lot 2B T3, mesuré le 24/09) : la cohorte d'ouverture a 20 à 30 ans et personne
  n'atteint l'âge de la retraite avant une dizaine d'années de jeu — au cycle 60,
  aucun combattant de moins de 25 ans. Correction proposée : étaler les âges de la
  cohorte d'ouverture sur toute la carrière (20 à ~41 ans). Attend Anthony.
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
