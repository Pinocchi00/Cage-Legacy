# ETAT DES LIEUX — mode management

Constat factuel du dépôt, branche `main` (commit `b6d082d`), relevé le 2026-09-08.
Objet : quels fichiers sont concernés par le mode management, lesquels sont à
conserver, lesquels sont à jeter. Aucune architecture n'est proposée ici.

Critère appliqué, repris de la consigne : sont bons et conservés le moteur de
combat et le mode carrière existants ainsi que le socle qui les fait tourner ;
est rejeté tout le reste (production des douze lots précédents).

Note sur les « six modes » : le dépôt ne montre qu'un seul mode jouable
documenté, la Carrière Complète (`CLAUDE.md:7-10` ; `currentGameMode()` retourne
toujours `'career'`, `ui-08-controller-arena.js:33-35`), deux exhibitions
grevées dessus (Duel, Fantasy Fight / All-Stars) et des résidus commentés des
modes déjà retirés (Faith, Gauntlet, boutique — retrait documenté en
`CLAUDE.md:147-159`). L'inventaire ci-dessous décrit ce qui est observable,
pas ce que les lots rejetés prétendaient livrer.

## 1. À CONSERVER — moteur de combat, carrière, socle

| Fichier | Lignes repères | Rôle constaté |
|---|---|---|
| `engine-combat.js` (2497 lignes) | `STYLE_PROFILE` l.35 ; `simulateFight(A,B,rounds=3,plan=null,planB=null,opts=null)` l.618 ; `applyResult` l.2270 ; `winProbEstimate` l.2493 | Moteur de combat. C'est le « moteur existant » que le CDC §8 déclare suffisant. |
| `engine.js` (493 lignes) | `setSeed` l.13 ; `rnd` l.14 (RNG à graine, LCG) ; `pickStable` l.25 ; `eff` l.398 ; `overall` l.429 ; `makeFighter` l.354 | Primitives de simulation partagées par tout le moteur. |
| `engine-career.js` (273 lignes) | `ORGS` l.20 ; `ORG_PURSES` l.56 ; `CHAMP_MULT` l.65 ; `canPromote` l.90 ; `eloBaseline` l.116 ; `generateContract` l.129 ; `p4pScore` l.210 | Organisations, cachets, contrats, Elo, classement P4P. Carrière existante. |
| `engine-progression.js` (404 lignes) | `isDeclining` l.31 ; `rollInjury` (`return pick(INJURY_TYPES)`) l.74 | Vieillissement, blessures, progression. Carrière existante. |
| `engine-events.js` (364 lignes) | En-tête l.1-19 (éras MMA, rivalités, hype, arcs narratifs) | Événements et narration procédurale de la carrière. |
| `state/state-core.js` (24 lignes) | `let G=null;` l.14 ; `esc` l.23 | État global `G`, échappement HTML obligatoire. |
| `state/state-save.js` (92 lignes) | `SAVE_KEY='cage-legacy-v3'` l.28 ; `SAVE_BACKUP_KEY` l.29 ; `save` l.41 ; `load` l.57 ; `hasSave` l.84 ; `wipe` l.92 | Sauvegarde atomique principale + secours. |
| `state/state-migration.js` (59 lignes) | `SAVE_VERSION=5` l.4 ; `migrate` l.10 (refus strict `< 5` et `> 5`, l.13-20) ; `migrateDoubleChampion` l.52 | Version de schéma et migration séquentielle. |
| `state/state-validation.js` (177 lignes) | `validateSave` l.12 ; `repairFighter` l.81 ; `validateState` l.131 | Seule porte d'entrée de validation / réparation. |
| `state/state-hof.js` (222 lignes) | `HOF_KEY='cage-legacy-hof'` l.6 ; `loadHOF` l.35 ; `saveHOF` l.39 | Panthéon persistant, hors `wipe()` de la carrière. |
| `state/state-analytics.js` (180 lignes) | Fichier entier | Statistiques locales. Neutre, sans lien avec les lots rejetés. |
| `data-skills.js` (649 lignes) | `SKILLS` (catalogue entier) | Données pures des compétences. |
| `data-content.js` (231 lignes) | `ORIGINS` l.6 ; `generateContextualOrigin` l.33 | Origines, motivations, contenus narratifs génériques. |
| `data-people.js` (21 lignes) | `PERSON_TRAITS` l.5 | Traits humains des combattants générés. |
| `index.html` | Ordre des `<script>` l.405-475 ; `--maxw:560px` l.31 | Ordre de chargement (source de vérité lue par le harnais de test) ; gabarit actuel, visé par le CDC §10. |
| `main.js` (99 lignes) | `G={screen:'title',...}` l.59 ; amorce Duel via `?legend=` l.67-97 (suit le sort du Duel, §3) | Bootstrap. L'amorce `?legend=` l.67-97 dépend du Duel (voir §3). |
| `tests/` (12 fichiers) + `tests/helpers/loadGame.js` (`readScriptOrder` l.26, `newGameWindow` l.44) + `tests/helpers/playthrough.js` | Suite entière, sauf `tests/duel.test.js` (voir §3) | Couverture du moteur et de la carrière sur le vrai code. |
| `tools/` (`monte-carlo.js`, `monte-carlo-combat.js`, `matchup-matrix.js`, `reach-stance-matrix.js`, `adaptability-window-matrix.js`, `style-fingerprint-classify.js`, `lint-content.js`) + `tools/reports/` | Ensemble du dossier | Diagnostic et mesure du moteur conservé. Aucun n'est un mode de jeu. |
| `CLAUDE.md`, `README.md`, `LOT-1-RAPPORT.md`, `package.json`, `eslint.config.js`, `opencode.json`, `.gitignore` | — | Documentation et outillage existants. `package.json:6-11` définit `lint`, `lint:content`, `test`, `check`. |

## 2. CONCERNÉS par le mode management

Parmi les fichiers conservés, ceux que le CDC mobilise directement. Le tableau
cite le point de contact factuel, sans en déduire de conception.

| Fichier | Point de contact | CDC |
|---|---|---|
| `ui-01-roster-matchmaking.js` (792 lignes) | `makeOrgRoster` l.472 (construction du roster d'organisation) ; `divRank` l.550 ; `advanceRoster` l.554 (Elo d'arrière-plan) ; `reconstructLegend` l.636 | §3 (noms niveau 1, dossiers, attachés), §9 (roster 40-60, monde de centaines de noms, classements). |
| `ui-02-fight-prep-events.js` (848 lignes) | `genOpponents` l.116 (génération d'adversaires) ; `tacticalRead` l.36 (lecture tactique affichée) | §4.2 (choix du main et du co-main), §9 (décisions réelles par événement). |
| `ui-03-contracts-arcade-data.js` (201 lignes) | `CONTRACT_PHRASES` l.24 ; `evaluateProOffer` l.31. L'en-tête l.2-9 atteste que les données du mode Arcade ont déjà été retirées du fichier (le nom garde la trace, pas le contenu). | Contrats et cachets (pression « marge » du patron, §1 ; argent visible, §7). |
| `ui-05-fight-resolution.js` (973 lignes) | `resolveFight` l.40 (résolution d'un combat) ; `isTitleEligible` l.28 | §4.3 (la soirée), §4.4 (le lendemain : blessures via `rollInjury`, suspensions, cotes). |
| `ui-06-career-screens.js` (1187 lignes) | `scr_hub` l.119 ; `scr_select` l.249 (sélection d'adversaire) ; écrans titre/création `scr_title` l.30, `scr_intro` l.71, `scr_create` l.81 ; classements et fiches dans le reste du fichier | Écrans actuels du seul mode jouable ; roster, classements, fiches (mobilisés par §4.1, §4.2, §10). |
| `ui-07-contracts-legacy-screens.js` (716 lignes) | `scr_toptier` l.16 ; écrans de contrats, retraite, historique, Panthéon dans le reste du fichier | Contrats, retraite et fin de carrière (mobilisés par §4.4, §7). Hors blocs All-Stars (voir §3). |
| `ui-08-controller-arena.js` (894 lignes) | `SCREENS` l.26-31 (registre des écrans) ; `CL` l.102 ; `CL.go` l.103 ; `render` l.66 ; `newCareer` l.744 | Routeur et contrôleur de tous les écrans (mobilisés par §4 et §10). Hors entrées et méthodes d'exhibition (voir §3). |
| `ui-09-arena.js` (655 lignes) | `ARENA` l.41 ; `BEAT_MS=750` l.47 ; `startArena` l.139 ; boucle `requestAnimationFrame` l.161-213 ; `setTimeout(()=>CL.toResult(),200)` l.208 | Rendu de la soirée regardée (§4.3). Les `Math.random()` du fichier (l.51, l.314-323, l.382, l.481) sont du visuel (particules, tremblement), pas de la simulation. |

## 3. À JETER — exhibitions et résidus des lots rejetés

Rien de cette section n'appartient au moteur de combat ni au mode carrière.
Aucun fichier `engine-*.js` ni `state/*.js` n'y figure.

| Élément | Localisation exacte | Motif |
|---|---|---|
| `duel-codec.js` (entier, 348 lignes) | Fichier entier : codec et PRNG du duel (`DUEL_CODE_PREFIX='CLD2'` l.40, `duelFnv1a32` l.51, `mulberry32` l.58, `simulateDuelSeries` l.290) | Socle du « Duel entre amis », produit des lots DUEL rejetés. |
| `ui-10-duel.js` (entier, 358 lignes) | Fichier entier : `scr_duelHome` l.97, `scr_duelLaunch` l.158, extension de `SCREENS` l.198-200, garde d'exhibition l.38-42 | Écrans du Duel, lots DUEL rejetés. |
| Bloc Fantasy Fight | `ui-01-roster-matchmaking.js:711` (`scr_fantasySetup`, avec `G.fantasyA/B` l.716-717 et bouton `CL.launchFantasyFight()` l.740) ; `ui-08-controller-arena.js:237-255` (`leaveSandbox` l.237, navigation `G.fantasyA/B` l.241-244, `launchFantasyFight` l.247-255) | Exhibition hors carrière, lots rejetés. |
| Bloc All-Stars | `ui-01-roster-matchmaking.js:747` (`scr_allstars`, lit `G.allstars` l.748) ; `ui-07-contracts-legacy-screens.js:677-695` (`scr_allstars_setup`, bouton `CL.launchAllStars()` l.695) ; `ui-08-controller-arena.js:238` (`leaveAllStars`) et l.262-280 (`launchAllStars`, pose `G.allstars`) | Tournoi d'exhibition hors carrière, lots rejetés. |
| Gardes d'exhibition dans la sauvegarde | `state/state-save.js:34-41` (ancre `DUEL_CODEC` : `G.duelActive`, `G.fantasyActive`, écrans `'fantasy_setup'`/`'allstars'`) | Gardes devenues sans objet une fois les exhibitions ci-dessus retirées. Le reste du fichier (§1) est conservé. |
| Amorce Duel au démarrage | `main.js:61-97` (ancre `DUEL_LIEN_PARTAGE` : `?legend=`, `decodeDuelCode`, `CL.duelEnter`) | Point d'entrée du Duel, lots DUEL rejetés. Le reste du fichier (§1) est conservé. |
| `tests/duel.test.js` (516 lignes) | Fichier entier | Couvre exclusivement le Duel ; suit le sort du Duel. |
| Résidus commentés des modes déjà retirés | `ui-08-controller-arena.js:19` (`scr_faith_fight_pending`, `scr_consumable_preview`) et l.125-127 (`gauntletStatusBlock`, ui-04) ; `ui-09-arena.js:20-23` (mêmes écrans) ; `ui-02-fight-prep-events.js:280` (`scr_faith_hub`) et l.396 (`faithNemesisId`) ; `ui-05-fight-resolution.js:109,156,173` (mentions Faith) ; `ui-06-career-screens.js:49,361,920,1022,1035` (mentions Faith/Gauntlet) ; `engine-progression.js:80-81,346,374` (mentions Faith) ; `index.html:66` (`.faith-paper`) et l.300-325 (`.shop-*`) | Commentaires, ancres historiques et CSS orphelins. `CLAUDE.md:147-159` documente le retrait de leurs fichiers (`data-faith-content.js`, `state-faith.js`, `ui-04a-faith-screens.js`, `state-gauntlet.js`, `ui-04b-gauntlet-screens.js`, `state-shop.js`, déjà absents du dépôt). À purger, pas à réactiver. |

Levée d'ambiguïté : le mot « arcade » dans `engine-combat.js:519,532,818,826,1641,2223-2224`
(« arcade fermée / s'ouvre »), `data-skills.js:133,302` et `data-content.js:9`
désigne l'arcade sourcilière (blessure), pas un mode de jeu. Ces occurrences ne
sont pas des résidus et ne sont pas à jeter.

## 4. Points de vigilance factuels (ni questions, ni conception)

- `engine.js:276` (`uniqueFighterId`) utilise `Date.now()` et `Math.random()` :
  seule production d'identifiants hors RNG à graine constatée dans la
  simulation ; `engine.js:12-14` (`setSeed`/`rnd`) reste la RNG de référence.
- `engine-events.js:2-19` et `index.html:435-443` mentionnent `worldTick()`,
  mais aucune définition `function worldTick` n'existe dans le dépôt
  (recherche sur l'ensemble des fichiers) : seules des mentions en commentaires
  subsistent, dont `ui-01-roster-matchmaking.js:566`.
- `state/state-migration.js:10-23` : seules les sauvegardes de version
  exactement 5 chargent ; les versions antérieures sont refusées sans
  conversion (ancre `SAVE_VERSION_5_SANS_CONVERSION`).
- Le harnais de test lit l'ordre des `<script>` directement dans `index.html`
  (`tests/helpers/loadGame.js:26-34`) : toute suppression de fichier du
  chargement doit s'y refléter le moment venu.
