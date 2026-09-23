# Cage Legacy — inventaire du code mort

*Généré le 2026-09-22 par `node tools/inventaire-code-mort.js` — DIAGNOSTIC, aucune suppression effectuée.*

## 1. Méthode et limites

- Extraction des déclarations par **AST (espree)** sur le corps du programme (Program.body), sur le même périmètre de fichiers qu'eslint.config.js. **Fait mieux que la regex en colonne 0** d'ESLint : une déclaration indentée ou en fin de ligne, invisible à la regex, est vue ici. Écart constaté à ce run : **0** déclaration(s) vue(s) par l'AST et manquée(s) par la colonne 0 — sur ce dépôt le style place chaque déclaration en tête de ligne, la regex ne perd rien aujourd'hui ; l'écart devient visible dès qu'elle change.
- **Méthodes CL inventoriées à part** (clés de `const CL={...}` et `Object.assign(CL,{...})`) : ce ne sont pas des déclarations de premier niveau, un comptage `nom(` les rate toutes ; leurs références lexicales sont les accès `CL.nom`.
- **Références comptées dans tout le dépôt** : fichiers du jeu (AST + chaînes), index.html brut, tests/, tools/, documentation .md, commentaires (plages AST). L'outil lui-même et tools/reports/ (artefacts générés) sont exclus de la preuve.
- **Forme de code exigée** pour qu'une occurrence prouve un chemin : `nom(`, `CL.nom`, `eval('nom')`, clé de table par chaîne, accès calculé `obj['nom']`. Un mot isolé dans une phrase (étiquette « R », texte français) reste une mention, jamais un chemin. Aucun `window[...]`/`globalThis[...]` n'existe dans ce dépôt (vérifié) ; les tables d'écrans (`SCREENS`) enregistrent par identifiant — compté lexicalement.
- **Passe transitive** : un aide appelé uniquement par des déclarations elles-mêmes mortes redescend en MORT (2 à ce run).
- Limites assumées : pas de suivi d'alias (`const f=maFonc` — l'alias, lui, reste visible) ; déclarations dans des blocs conditionnels de premier niveau non inventoriées ; preuve de test cherchée ligne par ligne (un appel coupé entre deux lignes d'un gabarit de test échapperait au scan) ; **les données (propriétés d'objets, champs de sauvegarde) sont hors périmètre** — voir §6 pour les témoins, qui sont de ce cas.

## 2. Comptes globaux

- Fichiers du jeu scannés : **39** (même liste qu'ESLint).
- Déclarations de premier niveau : **637** ; méthodes CL : **89** ; total inventorié : **724**.
- VIVANTES (référence lexicale ou CL.nom) : **624** — hors catégories, non listées.
- **MORT : 19** · **ATTEINT AUTREMENT : 68** · **DOUTEUX : 13**.
- Candidats du comptage naïf « nom( » (méthode grep conseillée par eslint.config.js) : **253** — dont **11** reclassifié(s) par les catégories ATTEINT AUTREMENT/DOUTEUX et **15** confirmé(s) mort(s) ici.

## 3. MORT — rien ne l'atteint, par aucun chemin

**Aucune suppression n'est à effectuer sur la base de ce tableau seule.** Plusieurs entrées sont documentées comme conservées volontairement (ancres CAMPTIER_CODE_MORT pour `executeCampTier`, V2-12 pour `standing()`, en-têtes de fichiers pour les autres) : c'est une décision d'Anthony, tranche par tranche.

| Nom | Type | Déclaration | Pourquoi c'est sûr |
|---|---|---|---|
| `currentGameMode` | fonction | ui-08-controller-arena.js:33 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (docs/ETAT-DES-LIEUX.md:12 [documentation]) |
| `executeCampTier` | fonction | engine-events.js:224 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (engine-events.js:217 [commentaire], engine-progression.js:2 [commentaire], index.html:497 [html sans forme de code]) |
| `fighterDisplayName` | fonction | ui-08-controller-arena.js:48 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `freshnessTier` | fonction | engine-progression.js:82 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (engine-progression.js:2 [commentaire]) |
| `getMenace` | fonction | engine.js:450 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `hasMgmt` | fonction | mgmt-save.js:390 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (mgmt-save.js:2 [commentaire]) |
| `initAllStars` | méthode CL | ui-08-controller-arena.js:260 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `initAllStarsTournament` | fonction | ui-07-contracts-legacy-screens.js:672 | aucune référence hors des déclarations elles-mêmes mortes (ui-08-controller-arena.js:260 depuis initAllStars()) — mort transitive |
| `MGMT_PILE_MAX` | const | mgmt-data.js:27 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `MGMT_PILE_MIN` | const | mgmt-data.js:26 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `MGMT_TRIGGERS` | const | mgmt-data.js:36 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md:207 [documentation]) |
| `nextObjectiveBlock` | fonction | ui-06-career-screens.js:21 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `R` | const | engine.js:16 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (data-skills.js:2 [commentaire], duel-codec.js:231 [commentaire], engine-career.js:219 [commentaire]) |
| `setArenaCosmeticTheme` | fonction | ui-08-controller-arena.js:843 | aucune référence hors des déclarations elles-mêmes mortes (ui-08-controller-arena.js:236 depuis setArenaTheme()) — mort transitive |
| `setArenaTheme` | méthode CL | ui-08-controller-arena.js:236 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `setPersonality` | fonction | engine-events.js:89 | aucune occurrence du nom hors sa déclaration dans tout le dépôt (code, chaînes, tests, outillage, commentaires, documentation) |
| `standing` | fonction | engine-career.js:258 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (engine-career.js:2 [commentaire], engine-career.js:243 [commentaire]) |
| `TRAINABLE` | const | engine.js:146 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (engine-progression.js:2 [commentaire]) |
| `winProbEstimate` | fonction | engine-combat-outcomes.js:237 | aucun chemin d'exécution dans tout le dépôt ; seules des mentions (engine-combat.js:2 [commentaire], docs/ETAT-DES-LIEUX.md:23 [documentation], index.html:482 [html sans forme de code]) |

## 4. ATTEINT AUTREMENT — faux positifs du comptage naïf

Référencé par une chaîne (onclick dans du HTML généré, index.html en ligne, table par nom) — **ne pas supprimer**.

| Nom | Type | Déclaration | Preuve |
|---|---|---|---|
| `acceptChampChampOffer` | méthode CL | ui-08-controller-arena.js:285 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:136 — chaîne contenant « acceptChampChampOffer » sous forme de code |
| `acceptFreeAgency` | méthode CL | ui-08-controller-arena.js:666 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:105 — chaîne contenant « acceptFreeAgency » sous forme de code |
| `acceptPro` | méthode CL | ui-08-controller-arena.js:548 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:183 — chaîne contenant « acceptPro » sous forme de code |
| `acceptPromo` | méthode CL | ui-08-controller-arena.js:516 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:234 — chaîne contenant « acceptPromo » sous forme de code |
| `advanceAllStars` | méthode CL | ui-08-controller-arena.js:282 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-01-roster-matchmaking.js:771 — chaîne contenant « advanceAllStars » sous forme de code |
| `chooseClass` | méthode CL | ui-08-controller-arena.js:160 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:613 — chaîne contenant « chooseClass » sous forme de code |
| `chooseClass31` | méthode CL | ui-08-controller-arena.js:175 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:650 — chaîne contenant « chooseClass31 » sous forme de code |
| `chooseMue` | méthode CL | ui-08-controller-arena.js:298 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:645 — chaîne contenant « chooseMue » sous forme de code |
| `choosePlan` | méthode CL | ui-08-controller-arena.js:471 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:433 — chaîne contenant « choosePlan » sous forme de code |
| `clearExportedCode` | méthode CL | ui-08-controller-arena.js:235 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:479 — chaîne contenant « clearExportedCode » sous forme de code |
| `closeAchPreview` | méthode CL | ui-08-controller-arena.js:146 | aucune référence lexicale ; atteint par chaîne/HTML (3 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:400 — chaîne contenant « closeAchPreview » sous forme de code |
| `confirmProNickname` | méthode CL | ui-08-controller-arena.js:552 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:120 — chaîne contenant « confirmProNickname » sous forme de code |
| `cont` | méthode CL | ui-08-controller-arena.js:301 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:81 — chaîne contenant « cont » sous forme de code |
| `copyExportedLink` | méthode CL | ui-08-controller-arena.js:229 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:475 — chaîne contenant « copyExportedLink » sous forme de code |
| `create` | méthode CL | ui-08-controller-arena.js:323 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:95 — chaîne contenant « create » sous forme de code |
| `declineChampChampOffer` | méthode CL | ui-08-controller-arena.js:292 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:137 — chaîne contenant « declineChampChampOffer » sous forme de code |
| `declinePro` | méthode CL | ui-08-controller-arena.js:555 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:198 — chaîne contenant « declinePro » sous forme de code |
| `declinePromo` | méthode CL | ui-08-controller-arena.js:526 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:41 — chaîne contenant « declinePromo » sous forme de code |
| `declineTopTier` | méthode CL | ui-08-controller-arena.js:535 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:42 — chaîne contenant « declineTopTier » sous forme de code |
| `deleteHof` | méthode CL | ui-08-controller-arena.js:198 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:505 — chaîne contenant « deleteHof » sous forme de code |
| `draft` | méthode CL | ui-08-controller-arena.js:321 | aucune référence lexicale ; atteint par chaîne/HTML (4 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:87 — chaîne contenant « draft » sous forme de code |
| `draftIn` | méthode CL | ui-08-controller-arena.js:322 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:90 — chaîne contenant « draftIn » sous forme de code |
| `duelBeginManche` | méthode CL | ui-10-duel.js:313 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:172 — chaîne contenant « duelBeginManche » sous forme de code |
| `duelClearFriendCode` | méthode CL | ui-10-duel.js:267 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:141 — chaîne contenant « duelClearFriendCode » sous forme de code |
| `duelCopyMyCode` | méthode CL | ui-10-duel.js:249 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:133 — chaîne contenant « duelCopyMyCode » sous forme de code |
| `duelImportFriendCode` | méthode CL | ui-10-duel.js:258 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:151 — chaîne contenant « duelImportFriendCode » sous forme de code |
| `duelSetFriend` | méthode CL | ui-10-duel.js:230 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:146 — chaîne contenant « duelSetFriend » sous forme de code |
| `duelSetPlayer` | méthode CL | ui-10-duel.js:221 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:126 — chaîne contenant « duelSetPlayer » sous forme de code |
| `duelShareMyCode` | méthode CL | ui-10-duel.js:237 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:132 — chaîne contenant « duelShareMyCode » sous forme de code |
| `duelStartSeries` | méthode CL | ui-10-duel.js:272 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-10-duel.js:154 — chaîne contenant « duelStartSeries » sous forme de code |
| `exitLegacy` | méthode CL | ui-08-controller-arena.js:742 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:474 — chaîne contenant « exitLegacy » sous forme de code |
| `exportLegend` | méthode CL | ui-08-controller-arena.js:217 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:504 — chaîne contenant « exportLegend » sous forme de code |
| `exportSave` | méthode CL | ui-08-controller-arena.js:745 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:423 — chaîne contenant « exportSave » sous forme de code |
| `fightSelect` | méthode CL | ui-08-controller-arena.js:368 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:149 — chaîne contenant « fightSelect » sous forme de code |
| `filterCodex` | méthode CL | ui-08-controller-arena.js:118 | aucune référence lexicale ; atteint par chaîne/HTML (3 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:605 — chaîne contenant « filterCodex » sous forme de code |
| `filterHof` | méthode CL | ui-08-controller-arena.js:283 | aucune référence lexicale ; atteint par chaîne/HTML (8 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:470 — chaîne contenant « filterHof » sous forme de code |
| `handleEvent` | méthode CL | ui-08-controller-arena.js:384 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:1166 — chaîne contenant « handleEvent » sous forme de code |
| `launchAllStars` | méthode CL | ui-08-controller-arena.js:272 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:695 — chaîne contenant « launchAllStars » sous forme de code |
| `launchFantasyFight` | méthode CL | ui-08-controller-arena.js:247 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-01-roster-matchmaking.js:740 — chaîne contenant « launchFantasyFight » sous forme de code |
| `leaveAllStars` | méthode CL | ui-08-controller-arena.js:238 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-01-roster-matchmaking.js:750 — chaîne contenant « leaveAllStars » sous forme de code |
| `leaveSandbox` | méthode CL | ui-08-controller-arena.js:237 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-01-roster-matchmaking.js:741 — chaîne contenant « leaveSandbox » sous forme de code |
| `lockSignatureSuffix` | méthode CL | ui-08-controller-arena.js:512 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:982 — chaîne contenant « lockSignatureSuffix » sous forme de code |
| `mgmtCarte` | méthode CL | mgmt-screens.js:626 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : mgmt-screens.js:274 — chaîne contenant « mgmtCarte » sous forme de code |
| `mgmtEnter` | méthode CL | mgmt-screens.js:592 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : mgmt-screens.js:178 — chaîne contenant « mgmtEnter » sous forme de code |
| `mgmtMark` | méthode CL | mgmt-screens.js:680 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : mgmt-screens.js:115 — chaîne contenant « mgmtMark » sous forme de code |
| `mgmtNextCycle` | méthode CL | mgmt-screens.js:736 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : mgmt-screens.js:214 — chaîne contenant « mgmtNextCycle » sous forme de code |
| `negoRaise` | méthode CL | ui-08-controller-arena.js:571 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:87 — chaîne contenant « negoRaise » sous forme de code |
| `negoRenew` | méthode CL | ui-08-controller-arena.js:558 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:86 — chaîne contenant « negoRenew » sous forme de code |
| `newCareer` | méthode CL | ui-08-controller-arena.js:744 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:473 — chaîne contenant « newCareer » sous forme de code |
| `nextRound` | méthode CL | ui-08-controller-arena.js:383 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-09-arena.js:235 — chaîne contenant « nextRound » sous forme de code |
| `nextSeason` | méthode CL | ui-08-controller-arena.js:691 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:1189 — chaîne contenant « nextSeason » sous forme de code |
| `recoverInjury` | méthode CL | ui-08-controller-arena.js:449 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:144 — chaîne contenant « recoverInjury » sous forme de code |
| `rollRandomNickname` | fonction | ui-05-fight-resolution.js:804 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:114 — chaîne contenant « rollRandomNickname » sous forme de code |
| `setCampTier` | méthode CL | ui-08-controller-arena.js:374 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:335 — chaîne contenant « setCampTier » sous forme de code |
| `setFantasy` | méthode CL | ui-08-controller-arena.js:239 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-01-roster-matchmaking.js:729 — chaîne contenant « setFantasy » sous forme de code |
| `setHubTab` | méthode CL | ui-08-controller-arena.js:116 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:199 — chaîne contenant « setHubTab » sous forme de code |
| `setRankingsTab` | méthode CL | ui-08-controller-arena.js:106 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:1103 — chaîne contenant « setRankingsTab » sous forme de code |
| `setSignatureSuffix` | méthode CL | ui-08-controller-arena.js:510 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:981 — chaîne contenant « setSignatureSuffix » sous forme de code |
| `signTopTier` | méthode CL | ui-08-controller-arena.js:541 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:36 — chaîne contenant « signTopTier » sous forme de code |
| `skipArena` | méthode CL | ui-08-controller-arena.js:375 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-08-controller-arena.js:900 — chaîne contenant « skipArena » sous forme de code |
| `toggleAllStarsDraft` | méthode CL | ui-08-controller-arena.js:261 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:687 — chaîne contenant « toggleAllStarsDraft » sous forme de code |
| `toggleAttrHelp` | méthode CL | ui-08-controller-arena.js:130 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:1018 — chaîne contenant « toggleAttrHelp » sous forme de code |
| `toggleHofFav` | méthode CL | ui-08-controller-arena.js:186 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:503 — chaîne contenant « toggleHofFav » sous forme de code |
| `toggleHofFilters` | méthode CL | ui-08-controller-arena.js:284 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:459 — chaîne contenant « toggleHofFilters » sous forme de code |
| `toLegacy` | méthode CL | ui-08-controller-arena.js:707 | aucune référence lexicale ; atteint par chaîne/HTML (2 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:108 — chaîne contenant « toLegacy » sous forme de code |
| `train` | méthode CL | ui-08-controller-arena.js:370 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:342 — chaîne contenant « train » sous forme de code |
| `viewAchPreview` | méthode CL | ui-08-controller-arena.js:145 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-07-contracts-legacy-screens.js:380 — chaîne contenant « viewAchPreview » sous forme de code |
| `viewLegend` | méthode CL | ui-08-controller-arena.js:149 | aucune référence lexicale ; atteint par chaîne/HTML (1 chaîne(s) du jeu, index.html ×0) — preuve : ui-06-career-screens.js:494 — chaîne contenant « viewLegend » sous forme de code |

## 5. DOUTEUX — trancher à la main

| Nom | Type | Déclaration | Raison du doute |
|---|---|---|---|
| `buildStaticPreviewArena` | fonction | ui-09-arena.js:106 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 3 occurrence(s) sous forme de code dans tests/outillage (ex. tests/regressionFixes.test.js:1361) — chemin de test, jamais un chemin du jeu — preuve : tests/regressionFixes.test.js:1361 |
| `importSave` | méthode CL | ui-08-controller-arena.js:761 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 6 occurrence(s) sous forme de code dans tests/outillage (ex. tests/lot1Integrity.test.js:52) — chemin de test, jamais un chemin du jeu — preuve : tests/lot1Integrity.test.js:52 |
| `keysUnregister` | fonction | ui-11-keys.js:25 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 1 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtBureau.test.js:648) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtBureau.test.js:648 |
| `mgmtAffairDiv` | fonction | mgmt-bureau.js:199 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 1 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtBureau.test.js:491) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtBureau.test.js:491 |
| `mgmtAudienceRef` | fonction | mgmt-argent.js:220 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 3 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtEconomie.test.js:470) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtEconomie.test.js:470 |
| `mgmtCanAfford` | fonction | mgmt-argent.js:209 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 5 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtBureau.test.js:1125) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtBureau.test.js:1125 |
| `mgmtExteriorTrace` | fonction | mgmt-monde.js:247 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 17 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtExterieur.test.js:92) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtExterieur.test.js:92 |
| `mgmtFightHistory` | fonction | mgmt-corps.js:204 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 2 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtTrace.test.js:171) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtTrace.test.js:171 |
| `mgmtReplayFight` | fonction | mgmt-corps.js:187 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 4 occurrence(s) sous forme de code dans tests/outillage (ex. tests/mgmtTrace.test.js:112) — chemin de test, jamais un chemin du jeu — preuve : tests/mgmtTrace.test.js:112 |
| `registerTextPool` | fonction | engine-progression.js:355 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 3 occurrence(s) sous forme de code dans tests/outillage (ex. tests/invariants.test.js:11) — chemin de test, jamais un chemin du jeu — preuve : tests/invariants.test.js:11 |
| `resetHof` | méthode CL | ui-08-controller-arena.js:202 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 3 occurrence(s) sous forme de code dans tests/outillage (ex. tests/hallOfFame.test.js:106) — chemin de test, jamais un chemin du jeu — preuve : tests/hallOfFame.test.js:106 |
| `rivalryTier` | fonction | engine-events.js:269 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 6 occurrence(s) sous forme de code dans tests/outillage (ex. tests/proceduralNarrative.test.js:13) — chemin de test, jamais un chemin du jeu — preuve : tests/proceduralNarrative.test.js:13 |
| `txtPick` | fonction | engine-progression.js:365 | jamais appelé par le jeu (ni lexical, ni chaîne) ; 1 occurrence(s) sous forme de code dans tests/outillage (ex. tests/invariants.test.js:24) — chemin de test, jamais un chemin du jeu — preuve : tests/invariants.test.js:24 |

## 6. Témoins de contrôle (CLAUDE.md §10, ancre CORRECTIF_GUARDPULL_MORT)

Les témoins documentés ne sont **pas des déclarations de premier niveau** : ce sont des propriétés d'objets et des champs de sauvegarde, hors périmètre de cet outil par construction. L'outil ne peut ni les « retrouver » ni les classer, et le signale plutôt que de publier un faux positif rassurant. Il vérifie et affiche ci-dessous leurs occurrences réelles dans tout le dépôt, et confirme qu'aucun de ces noms n'entre dans l'inventaire des déclarations (§2).

| Témoin | Dans l'inventaire des déclarations ? | Occurrences (tous chemins du dépôt) |
|---|---|---|
| `guardPull` | non (propriété/champ, hors périmètre) | engine-combat-tactics.js:62 · engine-combat-tactics.js:63 |
| `gameMode` | non (propriété/champ, hors périmètre) | ui-06-career-screens.js:453 · ui-06-career-screens.js:467 · ui-06-career-screens.js:467 · ui-06-career-screens.js:467 · ui-06-career-screens.js:467 · state/state-hof.js:149 · state/state-hof.js:149 · state/state-hof.js:217 (+4) |
| `faithNemesisId` | non (propriété/champ, hors périmètre) | ui-02-fight-prep-events.js:396 · state/state-migration.js:34 · CLAUDE.md:233 · docs/ETAT-DES-LIEUX.md:81 |
| `faithTraits` | non (propriété/champ, hors périmètre) | ui-06-career-screens.js:1027 · state/state-migration.js:34 · CLAUDE.md:233 |

Lecture des témoins : `guardPull` ne porte que son littéral de données et son ancre CORRECTIF_GUARDPULL_MORT (« donnée morte, conservée telle quelle ») — donnée morte **confirmée**. `f.gameMode` reste lu et recopié par state/state-hof.js (affichage et filtre du Panthéon) et documenté par state/state-migration.js — champ d'anciennes légendes, jamais du code vivant, conforme à CLAUDE.md §10 ; `f.faithNemesisId` et `f.faithTraits` ne subsistent qu'en commentaires et en migration — données mortes **confirmées**.

## 7. Le comptage naïf en comparaison

La méthode « grep -c "nom(" *.js » (celle que eslint.config.js conseille en attendant mieux) déclarerait morts **253** noms, dont **197** constantes (const/let/var) — le grep « nom( » ne peut jamais voir une constante utilisée, puisque rien ne l'appelle avec des parenthèses. Ce rapport en reclassifie **11** (§4 et §5) et en confirme **15** (§3), les 227 restant(s) étant vivant(s) par une référence lexicale (constante lue, fonction passée par identifiant...) que ce grep ne détecte pas.
Et l'inverse — le naïf croit vivants **4** mort(s) sûrs de ce rapport, parce qu'une mention dans un commentaire ou la documentation contient déjà « nom( » avec des parenthèses : `standing`, `executeCampTier`, `initAllStarsTournament`, `setArenaCosmeticTheme`.

---

## 8. Note de relecture (Claude, 22/09/2026)

Rapport relu contre l'état réel du dépôt (branche `inventaire-code-mort`, base
`db82c76`). L'outil a été relancé : il reproduit 19 / 68 / 13 à l'identique.
Onze des dix-neuf morts ont été repris à la main, un par un : chacun n'a que sa
déclaration et, au plus, des commentaires. `R` (`engine.js:16`) est bien mort,
et c'est le meilleur argument du §7 — un `grep` sur `R` ramène des dizaines de
faux positifs dans les chaînes de `data-skills.js` ; l'AST tranche, le grep non.
`npm run check` : 312 tests, 308 passants, 0 échec, 4 skip.

**Une réserve sur le §3, à lire avant toute suppression.** `MGMT_PILE_MIN` et
`MGMT_PILE_MAX` (`mgmt-data.js:26-27`) y sont classés MORT. Ils le sont au sens
strict — rien ne les lit — mais le commentaire des deux lignes précédentes les
réserve explicitement : « ces bornes ne s'appliquent pas encore, elles sont
conservées pour les lots suivants ». La méthode repère la conservation
volontaire quand le commentaire **nomme** le symbole (les ancres, par exemple
`CAMPTIER_CODE_MORT`), pas quand il le décrit sans le nommer. **Ces deux
constantes ne doivent pas être supprimées.** Il peut en exister d'autres du
même genre : c'est précisément pourquoi l'avertissement en tête du §3 —
« aucune suppression sur la base de ce tableau seule » — doit être respecté.

**Le §5 est la partie la plus utile du rapport, et ce n'est pas du code mort.**
Les treize « douteux » sont des fonctions vivantes pour les tests et jamais
appelées par le jeu : du travail livré, couvert, et jamais branché. Le cas net
est `mgmtExteriorTrace` (`mgmt-monde.js:247`) — le monde extérieur dérivé du
lot 2B T1, couvert par dix-sept appels de tests, qu'aucun écran ne montre.
**Tranché le 22/09/2026 : il prend un écran au lot 4** (décision d'Anthony,
`docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md` §5 e). Les douze autres restent à
trancher, lot par lot.

**Écarts `CLAUDE.md` : aucun.** Le compte rendu de livraison en signalait trois.
Sur `main` — l'état que `CLAUDE.md` déclare décrire — `MGMT_SAVE_VERSION` vaut
bien 5 et la suite compte bien 293 tests ; c'est la branche qui porte 6 et 312,
depuis le lot 3 T1. Et `engine-combat.js` fait exactement 1670 lignes. Reste un
défaut réel du document, qui est la cause de la confusion : son §4 décrit
`main` pendant que ses §3 et §10 décrivent déjà l'état d'après-découpage. À
corriger à la fusion des branches.
