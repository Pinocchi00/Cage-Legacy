# Monde lot 9 T2e — Un classement mondial juste pour les huit organisations

## Branche
`monde-lot-9-classement` (tirée de `main` après la PR 181).

## Objectif
Constat du superviseur le 15/10/2026, sur une vraie partie après T2d (Split, graine 20261008, création complète) : les sept organisations
vivantes sont enfin dans le classement mondial, mais **Split occupe 104 des 120 places des tops 10** (12 catégories × 10). Cause :
`mgmtDivisionRankingCalcule` (`mgmt-carte.js`) calcule `mgmtRangScores(m,cands,…)` avec **l'historique du joueur** (`m.hist`) pour tous les
candidats. Un combattant d'une autre organisation n'y a aucun combat : son score se réduit à `(W−L)·MGMT_RANG_TEMPS^(cycle−1)`, presque nul
au cycle 63, alors qu'un combattant de Split garde un score de forme. La loi de classement n'est donc pas la même pour tous.

## Ce qui change
- `mgmtDivisionRankingCalcule`, portée `world`, `m.mondeVivant===true` : le score de chaque candidat d'une organisation vivante est calculé
  par **la même fonction** `mgmtRangScores`, sur **l'historique de sa sous-partie** (`m.orgs[orgId].hist`) et à son cycle
  (`m.orgs[orgId].cycle` quand le cycle lu est omis ; sinon le même cycle lu). Les candidats de Split gardent leur score actuel. Puis un seul
  tri par `mgmtRankingCompare` avec la Map des scores réunis. Aucune seconde loi de classement.
- Les sous-parties allégées gardent leurs combats allégés (`mgmtPasseAlleger`) : vérifier que `mgmtRangScores` y trouve `a.id`, `b.id`,
  `winner`, `c` ; sinon garder ces champs dans l'allègement (le budget de 1,5 Mo reste à respecter — mesure et consigne la taille).
- Parties sans monde vivant : inchangées (même calcul, mêmes empreintes).

## Tests (`tests/mgmtMondeVivant.test.js`, nommés `Monde lot 9 T2e — …`)
- sur une partie avec le monde vivant (passé court comme les autres tests du fichier), dans chaque catégorie le top 10 mondial ne compte pas
  plus de 6 combattants de Split, et au moins trois organisations y figurent ;
- un combattant d'une organisation vivante qui gagne un combat dans sa sous-partie monte (ou ne descend pas) au classement mondial, exactement
  comme un combattant de Split qui gagne chez Split ;
- les empreintes de `tests/mgmtPasse.test.js` ne bougent pas.

## Vérification
`node --test --test-name-pattern="T2e|T2d" tests/mgmtMondeVivant.test.js`, `node tools/verif-versions.js origin/main`. Pas de `check:rapide`.
Commit `Monde lot 9 T2e : un classement mondial juste pour les huit organisations`.

## Compte rendu
- `mgmt-carte.js` : scores mondiaux désormais calculés par `mgmtRangScores` sur l'historique et le cycle propres à chaque organisation vivante ; Split conserve son calcul existant. Version de cache montée.
- `tests/mgmtMondeVivant.test.js` : ajout des tests « Monde lot 9 T2e — le top 10 mondial mêle les organisations vivantes sans domination de Split » et « Monde lot 9 T2e — une victoire vivante et une victoire Split sont évaluées par la même loi ».
- Sauvegarde : aucune migration (format inchangé). Écart : aucun.
- Questions pour Anthony : aucune.
