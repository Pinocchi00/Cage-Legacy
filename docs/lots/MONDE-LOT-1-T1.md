# Monde lot 1 T1 — le classement en mémoire, l'outil qui chronomètre

**Date :** 10/10/2026
**Branche attendue :** `monde-lot-1-passe` — branche courante : `monde-lot-1-passe`.
**Autorité :** `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md` §Lot 1, T1 ; `docs/PLAN-OPENCODE-MONDE.md` (étape 1, pièges « Lot 1 T1 », point d'arrêt).

## 1. Objectif

Garder le classement en mémoire pour ne plus le recalculer à chaque appel, puis chronométrer les six ans sur le PC d'Anthony — la mesure qui décide de la suite du lot.

> « La première tâche est donc de garder un classement en mémoire et de ne le recalculer que lorsqu'un résultat le change. Ensuite, chronométrer les six ans sur ton PC. »

## 2. Ce qui existe

- `mgmt-carte.js`, ancre `MGMT_LOT2_CLASSEMENT` (l.438-613) : `mgmtRangScores` (l.472), `mgmtRankingCompare` (l.493), `mgmtRosterAuCycle`, `mgmtDivisionRanking(m,divId,scope,cycle)` (l.564), `mgmtDivisionRank(m,f,scope)` (l.605). Tout est recalculé à chaque appel : cause des 84 % mesurés le 09/10 (`mgmtDivisionRank` ≈ 18 000 appels par soirée).
- Appelants : 18 sites pour `mgmtDivisionRank` (ex. `mgmt-carte.js:125,430`, `mgmt-agenda.js:219,221`, `mgmt-attention.js:56`, `mgmt-ecran-semaine.js:32,33`) ; ~35 pour `mgmtDivisionRanking`. **Aucun appelant ne se modifie.**
- Ce qui mute les entrées du classement : `mgmtRunEvent` (`mgmt-corps.js:590`, `m.hist.push` l.638 ; `mgmtApplyFight` pose `f.retired='medical'` l.561) ; `mgmtNewPile` (`mgmt-bureau.js:373` : `m.cycle++` l.383, `mgmtRetireRoster` → `f.retired='age'` `mgmt-corps.js:309`, `mgmtExteriorArrive` → `m.exterieur.push` `mgmt-monde.js:150`) ; `mgmtRecruter` (`mgmt-recrutement.js:48`, push l.70) ; `mgmtNewRoster` (`mgmt-bureau.js:187`).
- Portes à réutiliser : `tools/mesure-management.js` (`partie()` l.28-74, le joueur automatique en dur ; chrono par org l.79-81 ; sortie `tools/reports/MESURE-MANAGEMENT.md`) ; `tools/mesure-classements.js:73` (`chrono(win,label,line)`) ; `tests/outillage.test.js:27` (outil en sous-processus) ; `tests/helpers/jouerSoirees.js`.
- `MGMT_EVENT_WEEKS=5` (`mgmt-data.js:173`) → 62 soirées pour six ans (312/5). `MGMT_SAVE_VERSION=14` (`mgmt-bureau.js:81`) — inchangée ici.

## 3. Ce qui change

**`mgmt-carte.js` seulement** (ancre `MGMT_LOT2_CLASSEMENT` amendée + ancre neuve `MONDE_LOT1_T1` juste après, pour le mémo). Aucun fichier ajouté à `index.html`. Le corps actuel de `mgmtDivisionRanking` devient la voie pure, inchangée :

```js
/** La voie pure du classement, exactement le calcul d'avant le Monde lot 1 T1.
 *  Référence des tests d'exactitude. @returns {Array} */
function mgmtDivisionRankingCalcule(m,divId,scope,cycle)
/** Population classée, servie en mémoire : une fois par (portée, catégorie, cycle),
 *  gardée jusqu'à mgmtRangsInvalider. Identique au calcul pur. Rend slice().
 *  @returns {Array} */
function mgmtDivisionRanking(m,divId,scope,cycle)
/** Vide le mémo de la partie. Après toute mutation d'une entrée du classement :
 *  résultat, retraite, effectif, extérieur, cycle. @returns {void} */
function mgmtRangsInvalider(m)
```

- Mémo : `WeakMap` de module (clé `m`, valeur `Map` de `scope|div|cycle` → tableau). **Jamais sur `m`, jamais dans `G`, jamais sauvegardé.** La clé vivante porte `m.cycle` (le temps use le passé, `MGMT_RANG_TEMPS`) ; la clé d'un cycle explicite porte ce cycle.
- Appels de `mgmtRangsInvalider(m)` : fin de `mgmtRunEvent` (`mgmt-corps.js`) ; fin de `mgmtNewPile` (`mgmt-bureau.js`) ; fin de `mgmtRecruter` ; fin de `mgmtNewRoster`.
- `mgmtDivisionRank` : signature et comportement inchangés (le `null` des retraités compris).

**`tools/mesure-management.js`** — l'outil qui chronomètre (aucun écran) :

- `--six-ans` : 62 soirées (sauf nombre explicite en premier argument), `--orgs` défaut `split` (la création en joue une seule), section **« Chrono des six ans »** dans le rapport et le JSON, aux trois étapes du brief : `combatsMs` (`mgmtAgendaJouer`) ; `suiteMs` (reste de la soirée + `mgmtNewPile`, l'ouverture de la semaine suivante) ; `bookingMs` (prolongations, réclamés, têtes d'affiche, titre, Leïla — les listes de booking et les recalculs de classement). Compteurs accumulés **dans** le `win.eval` de `partie()`.
- JSON : clé **sœur** des points de mesure — `lignes[org].chrono = {soirees,totalMs,combatsMs,suiteMs,bookingMs,sixAnsMs,mesureSixAns}` ; `sixAnsMs` = mesure réelle si `soirees===62`, sinon projection `totalMs/soirees*62` avec `mesureSixAns:false`. Le rapport écrit secondes et parts (%).

## 4. Sauvegarde

**Non.** `MGMT_SAVE_VERSION` reste à 14 ; `migrate()` et `validateSave()` intouchés. Le mémo vit hors de la partie ; au chargement `m` est un objet neuf, le mémo est vide (test 4).

## 5. Textes

Aucun.

## 6. Écran

Aucun.

## 7. Tests

**`tests/mgmtClassementsMemoire.test.js`** (neuf ; `tests/helpers/loadGame.js`, `tests/helpers/jouerSoirees.js`) :

1. `Monde lot 1 T1 — cent appels dans un même état, un seul calcul pur par catégorie et portée` — graine 20261008, partie neuve ; `mgmtDivisionRankingCalcule` remplacée par un compteur qui délègue ; 100 appels de `mgmtDivisionRank(m,f,'world')` puis 100 de `mgmtDivisionRank(m,f)` : au plus **2 calculs purs** (un par portée demandée), 0 ensuite, les 200 rangs identiques.
2. `Monde lot 1 T1 — le classement en mémoire est exactement celui du calcul : graines 20261008, 20261009, 20261010, quarante soirées, comparé à chaque soirée` — par graine, 40 soirées via `jouerSoirees` ; **à chaque soirée**, pour chaque `allDivisions()` et pour `organization`, `world` et le cycle explicite `m.cycle-1` : `mgmtDivisionRanking(m,d,s[,c])` en `deepEqual` strict avec `mgmtDivisionRankingCalcule(m,d,s[,c])` (identifiants ordonnés), et pour chaque ligne le rang de `mgmtDivisionRank` égal au `findIndex` sur le calcul pur. Attendu : **0 divergence**.
3. `Monde lot 1 T1 — une mutation hors résultat invalide le mémo : recrue signée, retraite, avancée de cycle` — graine 20261008 ; après `mgmtRecruter` sur une ligne du marché, après `f.retired='age'` sur une ligne du haut du classement, après `mgmtNewPile(m)` : le rang servi est celui du calcul pur, jamais l'entrée périmée.
4. `Monde lot 1 T1 — le mémo ne se sauvegarde pas : la partie sérialisée ne change pas quand on lit les classements` — `JSON.stringify(m)` identique avant et après 200 lectures de classement ; aucune clé `memo`/`rank` sur `m`.

**`tests/outillage.test.js`** (ajout) :

5. `Monde lot 1 T1 — l'outil de mesure chronomètre les six ans : total, trois étapes, projection` — `node tools/mesure-management.js 5 --six-ans --orgs split --json` : `soirees===5`, `totalMs>0`, `combatsMs+suiteMs+bookingMs ≤ totalMs×1,1`, `sixAnsMs>0`, `mesureSixAns===false` ; le rapport contient « Chrono des six ans » avec les trois étapes. Les tests 7.1-7.4 restent verts.

## 8. Vérification

- Pendant le travail : `node --test tests/mgmtClassementsMemoire.test.js`, puis `node --test tests/outillage.test.js` (petits essais : `5 --six-ans --orgs split`).
- Mesure : `node tools/mesure-management.js --six-ans` (62 soirées, `split`). **Point d'arrêt (plan) : Anthony lance la commande sur son PC et donne la durée des six ans.**
- Critère de fin chiffré : 5 tests verts ; 0 divergence sur 3 graines × 40 soirées × catégories × 3 lectures ; la part `bookingMs` passe sous **50 %** du total (84 % le 09/10) ; la durée des six ans chiffrée dans `tools/reports/MESURE-MANAGEMENT.md`.

## 9. Hors périmètre

- Aucun fichier ajouté à `index.html`, aucun écran, aucune barre de chargement (elle vient avec la génération, T3+).
- Joueur automatique : reste en dur dans l'outil (extraction en fonction du jeu : T2) ; génération des six ans, prédécesseur, archive, Résultats/Ceintures/rôles : T2 à T6.
- `mgmtRangScores`, `mgmtRankingCompare`, `mgmtRosterAuCycle` : la loi de classement ne change pas. Aucun appelant modifié. `MGMT_SAVE_VERSION`, `migrate()`, `validateSave()` intouchés.
- Leviers 2 et 3 du lot 9 T1 (booking direct des prédécesseurs, semaine ouverte une fois) : **seulement si la mesure dépasse trois minutes**, décision d'Anthony — pas ici.

## 10. Pièges

- **Le temps use le passé** (`MGMT_RANG_TEMPS`, `mgmt-carte.js:460-472`) : une avancée de `m.cycle` peut changer l'ordre même sans combat. La phrase du brief (« ne le recalculer que lorsqu'un résultat le change ») est incomplète ; la règle d'or du plan est « exactement le même classement que le calcul actuel » — invalider à **chaque** mutation d'entrée, et la clé vivante porte `m.cycle`.
- **Portée `world`** : lit `m.exterieur` (`mgmtExteriorTrace`, `born`) ; les arrivées passent par `mgmtNewPile`, déjà dans la liste. **Cycle explicite** : `mgmtRosterAuCycle` rend les bilans courants si la ligne n'a pas encore combattu — le classement du passé dérive à mesure que `m.hist` grandit : même invalidation que le vivant, ne jamais garder une entrée pour toujours.
- `mgmtNewPile` mute plusieurs fois (`m.cycle++`, retraites, arrivées) et des lectures ont lieu en plein milieu (`mgmtPromoteSilent` → `mgmtRole`, `mgmt-attention.js:56`) : d'où la clé qui porte `m.cycle` **et** l'invalidation de fin de fonction. `mgmtPickBulkPair` a son `rankCache` local (`mgmt-carte.js:124`) : le laisser tel quel.
- Toujours rendre `slice()` : aucun appelant ne doit recevoir la référence du mémo. `mgmtDivisionRank` rend `null` pour un retraité avant tout calcul ; test `MGMT T1 classement` (`tests/mgmtCard.test.js:884`) — ne pas le casser.
- Chronométrer **dans** le `win.eval` de `partie()` : un `Date.now()` Node-side chronométrerait le pont jsdom. Aucun tirage RNG ajouté, aucun `Math.random()` : la mesure reste comparable à celle du 09/10. `tests/outillage.test.js` (7.1) lit le JSON : `chrono` est une clé **sœur** des points de mesure (`lignes[org].chrono`), jamais dans un point.

## 10 bis. Ajouts de Claude après relecture (10/10/2026) — ils priment sur les §3 et §7 en cas de contradiction

Le classement lit `m.hist`, les bilans `W`/`L` de chaque ligne, `f.retired`, l'appartenance à `m.roster` et à
`m.exterieur`, et `m.cycle` (`mgmtRangScores`, `mgmt-carte.js:472`). Les bilans changent **avant** le
`m.hist.push`, et des lectures de classement ont lieu entre deux combats d'une même soirée. Vider le mémo
seulement en fin de fonction laisserait donc ces lectures sur une entrée périmée, et le test 2 ne le verrait
pas (il compare le mémo au calcul pur dans le même état, après la soirée).

- **Invalider tout de suite, pas à la fin.** `mgmtRangsInvalider(m)` s'appelle immédiatement après chaque
  mutation : après chaque combat appliqué dans `mgmtRunEvent` (bilans et `m.hist.push`), juste après chacune
  des deux affectations `f.retired=` (`mgmt-corps.js:309` et `:561`), juste après `m.cycle++`, après chaque
  `m.roster.push` (`mgmt-bureau.js:187` — une fois le roster entier créé suffit —, `mgmt-recrutement.js:70`),
  après `m.exterieur.push` (`mgmt-monde.js:150`). Vider le mémo coûte une instruction ; seul le recalcul coûte,
  et il n'a lieu qu'à la lecture suivante.
- **Un interrupteur pour la preuve** : `function mgmtRangsMemoActif(actif)` (dans l'ancre `MONDE_LOT1_T1`) pose
  un drapeau de module, vrai par défaut ; à faux, `mgmtDivisionRanking` appelle toujours la voie pure. Il ne
  sert qu'aux tests et à la mesure ; aucun écran ne l'appelle.
- **Test 6, la preuve** (dans `tests/mgmtClassementsMemoire.test.js`) :
  `Monde lot 1 T1 — la partie jouée avec le mémo est identique à la partie jouée sans : deux graines, vingt soirées, état comparé après chaque soirée`
  — graines 20261008 et 20261009 ; pour chacune, deux parties créées à l'identique, l'une mémo actif, l'autre
  mémo inactif, vingt soirées par `jouerSoirees` ; après **chaque** soirée, `JSON.stringify(m)` des deux parties
  est strictement égal. Attendu : 0 différence. C'est ce test qui prouve que rien n'a changé dans le jeu ;
  s'il échoue, on ne l'assouplit pas : on cherche la mutation qui n'invalide pas.
- Ce test est long (il joue vingt soirées sans mémo) : l'ajouter aussi à la liste `LENTS` de
  `tools/check-rapide.js` s'il dépasse 60 s, et le lancer à la main pour cette tranche.
- Critère de fin : **6 tests verts**, et la suite complète `npm run check` verte pour cette tranche (demander
  « complet » à `@verif`) : elle touche le cœur du mode, tous les tests existants servent de filet.
- Point d'arrêt : Claude lance lui-même `node tools/mesure-management.js --six-ans` sur le PC d'Anthony après le
  commit ; le codeur ne lance que la mesure courte (`5 --six-ans --orgs split`).

## 11. Questions pour Anthony

- La barre de chargement (décision 2) : je la place avec la génération des six ans (T3 et après), pas en T1 — rien n'est encore chargé à la création. Tu valides ? *(Non bloquant : le classement et le chronomètre partent sans elle ; si tu la veux en T1, il faudra une planche.)*
