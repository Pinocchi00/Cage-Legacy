# Monde lot 2 T4 — L'attribution des profils

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites` — conforme).

## Objectif

Fermer le « trou » signalé dans `mgmt-organisations-data.js` : prouver et figer que chaque nom d'organisation
a le profil de sa ligne du tableau, et retirer du fichier la phrase qui dit le contraire.

Brief : « **T4 — L'attribution des profils.** Le trou signalé dans le fichier est fermé : chaque nom reçoit son
profil, comme dans le tableau. » Le brief dit aussi : « Tu as validé la dernière colonne le 09/10/2026 », et
(En bref) « le tableau du lot 2 est validé ».

## Ce qui existe

- Les profils sont **déjà posés** sur les huit noms : `mgmt-organisations-data.js:17-36`, `MGMT_ORGANISATIONS`
  (8 entrées `{id,nom,auteur,relu,profil}`). Rien n'est à attribuer de nouveau.
- Constat fait par Claude le 10/10/2026 (`mgmtOrgAtouts(profil)`, `mgmt-organisations.js:89`, rendu sur les huit
  profils, comparé ligne à ligne au tableau « Tes plus et contreparties ») : **les huit lignes collent déjà**.
  Les libellés rendus (les « plus » d'abord, puis les « moins », au plus deux de chaque côté) :

| id | nom | plus | contreparties |
| --- | --- | --- | --- |
| `split` | Split | Une caisse saine | Encore peu connue |
| `garden-of-blood` | Garden of Blood | Très populaire ; De grandes salles | Des bourses lourdes |
| `mma-korner` | MMA Korner | Des bourses modestes | Une caisse modeste ; Un public à gagner |
| `ultimate-rim` | Ultimate Rim | De jeunes combattants | Encore peu connue ; De petites salles |
| `fighting-pacific-championship` | Fighting Pacific Championship | Une caisse confortable ; Un public déjà acquis | Un effectif vieillissant |
| `organisation-6` | Knuckle Gate | Un public déjà acquis ; Les meilleures combattantes | Une caisse modeste ; Peu d’hommes classés |
| `organisation-7` | Pure Impact | Beaucoup d’argent ; De grandes salles | Un public à gagner |
| `organisation-8` | Undisputed Cage | Une caisse saine ; Un public déjà acquis | Des catégories dégarnies |

  (Les apostrophes de « Peu d’hommes classés » et « Beaucoup d’argent » sont typographiques, U+2019.)
- **Ce qui manque** : (1) l'en-tête du fichier, `mgmt-organisations-data.js:2-16`, affirme encore « L'ASSIGNATION
  des profils à ces noms n'est écrite nulle part : c'est un trou de spécification » (ligne 11-12) ; (2) aucun test
  ne fige l'attribution. `tests/mgmtCorrectionsLot12.test.js:24` compare l'écran à `mgmtOrgAtouts` lui-même :
  il ne dirait rien si un profil passait d'un nom à l'autre. `tests/mgmtOrganisations.test.js:74` mesure les
  effets (caisse, âge, femmes, lourds) mais pas les libellés.
- Les sauvegardes stockent le **nom** : `mgmtDefault(orgRef)` (`mgmt-bureau.js:86`) écrit `org:choix.nom` ;
  `mgmtOrgValide(nom)` (`mgmt-organisations.js:14`) et `validateMgmt` (`mgmt-save.js:34`, `:228`) lisent le nom.
  L'id ne sert qu'au code (`mgmtDefault(id)`, `MGMT_ORG_IDENTITES[id]`, les tests).

## Ce qui change

1. **`mgmt-organisations-data.js`** — en-tête seulement (lignes 2-16). Aucune ligne de données ne bouge.
   - Lignes 11-12 (de « ... L'ASSIGNATION des profils » à « …pas une décision. ») : remplacer par
     `L'attribution des profils aux noms est celle du tableau « Tes plus et contreparties » du brief « Un monde qui a
     vécu » (lot 2), validé par Anthony le 09/10/2026 ; elle est figée par tests/mgmtAttributionProfils.test.js (Monde lot 2 T4).`
   - Lignes 6-7 : remplacer « (le brief demande à Anthony s'ils sont les bons) » par « (validés par Anthony le 09/10/2026) ».
   - Garder tout le reste : l'ordre historique des noms (lignes 7-10) et la fin de l'en-tête (« Le PROFIL règle… PROPOSITIONS
     de Claude (relu:false) », lignes 13-16).
2. **`tests/mgmtAttributionProfils.test.js`** — nouveau (voir Tests).
3. **`package.json`** — ajouter `tests/mgmtAttributionProfils.test.js` juste après `tests/mgmtPaysOrganisations.test.js`
   dans les scripts `test` **et** `test:watch` (pas `test:ceintures`).
4. **`index.html`** — `node tools/_bump.js mgmt-organisations-data.js` (monte son `?v=` à la ligne 1110 et `SW_VERSION`).

## Sauvegarde

Non. `MGMT_SAVE_VERSION` ne bouge pas. Aucune migration.

## Textes

Aucun.

## Écran

Aucun.

## Tests

Fichier : `tests/mgmtAttributionProfils.test.js`. Porte : `tests/mgmtOrganisations.test.js` (`newGameWindow`,
`result(win,code)`). Le tableau attendu est écrit **en dur dans le test**, avec les chaînes du tableau ci-dessus.

1. **« Attribution — chaque organisation montre exactement les plus et les contreparties de sa ligne du tableau »** *(brief)*
   - pour chacune des 8 lignes du tableau : `mgmtOrgAtouts(MGMT_ORGANISATIONS.find(o=>o.nom===nom).profil)` ;
     `.plus` et `.moins` sont `deepEqual` aux listes du tableau, dans cet ordre ; 8 lignes vérifiées, 0 écart.
2. **« Attribution — les huit noms gardent leur identifiant, et une partie stocke le nom »**
   - `MGMT_ORGANISATIONS.map(o=>o.id)` égal à `['split','garden-of-blood','mma-korner','ultimate-rim',
     'fighting-pacific-championship','organisation-6','organisation-7','organisation-8']` ;
     `MGMT_ORGANISATIONS.map(o=>o.nom)` égal à `['Split','Garden of Blood','MMA Korner','Ultimate Rim',
     'Fighting Pacific Championship','Knuckle Gate','Pure Impact','Undisputed Cage']` ;
   - pour chacune : `mgmtDefault(o.id).org === o.nom` et `mgmtDefault(o.nom).org === o.nom` ;
   - `Object.keys(MGMT_ORG_IDENTITES)` contient exactement ces huit ids (même ensemble).
3. **« Attribution — les catégories fortes et faibles de Knuckle Gate et d’Undisputed Cage sont celles du tableau »**
   - `mgmtOrgLibelleCategories(p.fortes,true)` : Knuckle Gate `'Les meilleures combattantes'`, Undisputed Cage
     `'Les meilleurs poids lourds'` ; `mgmtOrgLibelleCategories(p.faibles,false)` : Knuckle Gate
     `'Peu d’hommes classés'`, Undisputed Cage `'Des catégories dégarnies'` ;
   - les six autres profils ont `fortes` et `faibles` vides (longueur 0).
4. **« Attribution — l’en-tête de mgmt-organisations-data.js ne déclare plus de trou de spécification »**
   - lit le fichier avec `fs.readFileSync` (côté Node) ; il ne contient ni `trou de spécification` ni
     `n'est écrite nulle part`, et contient `09/10/2026`.

Test de garde déjà vert à ne pas toucher : `tests/mgmtOrganisations.test.js` (« Organisations — huit… »),
`tests/mgmtCorrectionsLot12.test.js`, `tests/mgmtEffectif30.test.js`.

## Vérification

`node --test tests/mgmtAttributionProfils.test.js`, puis `node --test tests/mgmtOrganisations.test.js
tests/mgmtCorrectionsLot12.test.js`. Pas de mesure.
Critère de fin chiffré : **4 tests verts, 8 lignes du tableau retrouvées, 0 écart, 0 ligne de données modifiée dans
`git diff mgmt-organisations-data.js` (seulement des commentaires)**. Puis `npm run check` (par `@verif`).

## Hors périmètre

- **Ne renomme aucun id** : `organisation-6` (Knuckle Gate), `organisation-7` (Pure Impact), `organisation-8`
  (Undisputed Cage) sont aussi les clés de `MGMT_ORG_IDENTITES`, de `tests/mgmtPaysOrganisations.test.js`,
  `tests/mgmtEffectif30.test.js` et `tests/mgmtOrganisations.test.js`. Un id renommé casse tout cela.
- Ne change aucun chiffre de profil (`caisse`, `age`, `popularite`…) : des tests seedés les mesurent.
- Pas de `mgmt-organisations.js`, `mgmt-nouvelle.js`, ni de l'identité (`mgmt-organisations-identites-data.js`).
- La colonne « Ce que son passé devrait montrer » du tableau n'est pas de cette tranche (lot 1 et T3).

## Pièges

- **Si un libellé ne colle pas au tableau** (par exemple si l'autre agent a retouché un profil entre-temps) :
  `STOP`, compte rendu, pas de correction de chiffre de ta propre initiative.
- Le troisième « plus » d'Undisputed Cage (« Les meilleurs poids lourds ») et de Knuckle Gate n'apparaît pas à l'écran :
  `mgmtOrgAtouts` coupe à deux de chaque côté (`mgmt-organisations.js:94`). C'est conforme au tableau. Ne rien « corriger ».
- Dans le test, copier les apostrophes typographiques (’) du tableau ; un `'` droit fait échouer `deepEqual`.
- `mgmtOrgLibelleCategories` et `mgmtOrgAtouts` sont des fonctions globales de `mgmt-organisations.js` : on les appelle
  dans `result(win,…)`, pas depuis Node.
- Ordre des `<script>` : `mgmt-organisations-data.js` (index.html:1110) charge avant `mgmt-organisations.js` (:1112).
  Ne rien évaluer au chargement qui dépende de `divById`.
- L'autre agent code T3 dans le même dépôt et ajoute peut-être un test à `package.json` : édite la ligne sans
  écraser ses ajouts.

## Questions pour Anthony

Aucune. Le tableau est validé (09/10/2026) et les données le suivent déjà.
## Compte rendu
### Fichiers modifiés et leur rôle

- mgmt-organisations-data.js — en-tête seulement (lignes 2-16) : « trou de spécification » remplacé par la référence au tableau validé le 09/10/2026, figé par le nouveau test ; parenthèse ligne 6-7 mise à jour. Aucune ligne de données modifiée (diff vérifié).
- tests/mgmtAttributionProfils.test.js — nouveau, 4 tests (intitulés de la fiche), porte tests/mgmtOrganisations.test.js (newGameWindow, result) ; un premier jet du helper `result` comportait une parenthèse mal placée, corrigé en copiant exactement la ligne de la porte avant les mesures ci-dessous.
- package.json — tests/mgmtAttributionProfils.test.js ajouté juste après tests/mgmtPaysOrganisations.test.js dans test et test:watch (pas test:ceintures).
- index.html, sw.js — node tools/_bump.js mgmt-organisations-data.js (?v=b8 -> ?v=b8x, SW_VERSION).

### Tests ajoutés (intitulés de la fiche)

1. Attribution — chaque organisation montre exactement les plus et les contreparties de sa ligne du tableau

2. Attribution — les huit noms gardent leur identifiant, et une partie stocke le nom

3. Attribution — les catégories fortes et faibles de Knuckle Gate et d’Undisputed Cage sont celles du tableau

4. Attribution — l’en-tête de mgmt-organisations-data.js ne déclare plus de trou de spécification

### Migration de sauvegarde

Aucune (MGMT_SAVE_VERSION ne bouge pas, conforme à la fiche).

### Vérifications

- node --test tests/mgmtAttributionProfils.test.js : 4/4 verts. 8 lignes du tableau retrouvées, 0 écart.
- node --test tests/mgmtOrganisations.test.js tests/mgmtCorrectionsLot12.test.js : 13/13 verts.
- tests/mgmtEffectif30.test.js, mgmtPaysOrganisations.test.js, mgmtIdentites.test.js (gardes) : verts.
- node tools/verif-versions.js : aucun écart.
- npm run check:rapide (repli, @verif inatteignable) : lint et lint:content verts ; 96 fichiers de test exonérés des 7 plus longs, 95 verts, 1 fichier en échec. Seul échec : tests/mgmtVoix.test.js, test de perf « le coût : une fiche et une semaine avec paroles restent sous 100 ms » (assertion « fiche 120 ms »). Relancé isolément juste après : 12/12 verts. Variabilité de charge sous processus groupé ; fichier et test hors périmètre de cette tranche (tranche T4 : mgmt-organisations-data.js), à suivre.
- mgmt-voix-data.js et mgmt-retraits-data.js : `git status --short` les montrait modifiés, `git diff --ignore-all-space` vide, aucune réécriture ; ils ne sont ni lus ni committés ici.

### Écart à la fiche

Aucun sur le périmètre de la fiche (branche, en-tête, tests, package.json, bump, zéro ligne de donnée modifiée). Hors périmètre mais signalé : l'échec de perf de tests/mgmtVoix.test.js au check:rapide, vert en relance isolée ; le check complet se fait au bilan du lot.

### Questions pour Anthony

Aucune — la fiche n'en pose aucune.
