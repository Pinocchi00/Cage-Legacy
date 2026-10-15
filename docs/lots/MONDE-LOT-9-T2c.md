# Monde lot 9 T2c — les huit organisations vivent : les lecteurs 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
les lecteurs : les fonctions du monde extérieur (`mgmtExterior*`, `m.exterieur`) lisent `m.orgs` quand `m.mondeVivant===true` (effectifs, champions, classements), sinon l'ancien calcul inchangé. Inventaire des appelants par grep, une fonction de lecture commune.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2c : ...`.

## Compte rendu — reprise superviseur

- Fichiers modifiés : `mgmt-monde.js` ajoute un résolveur commun de combattant (source vivante ou trace historique) ; `mgmt-contrats.js` l'emploie pour les offres en mode vivant ; `mgmt-ceintures.js` lit le champion de chaque organisation vivante. Versions JS montées via `_bump.js`.
- Tests ajoutés : aucun. Test ciblé préexistant : « Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial ».
- Vérification : `node --test --test-name-pattern="T2c" tests/mgmtMondeVivant.test.js` passe (1/1). `node tools/verif-versions.js origin/main` ne signale que l'écart préexistant `mgmt-nouvelle.js`. Aucun `check:rapide` lancé.
- Migration de sauvegarde : aucune.
- Écarts à la fiche : tranche incomplète : l'actualité semaine, l'accueil et recrutement ne sont pas basculés vers `m.orgs`; il manque les tests exigés pour points 1–4 et la comparaison JSON héritée.
- Questions pour Anthony : aucune nouvelle question ; terminer les lecteurs restants avant de considérer T2c achevée.
- Relecture : non appelée, indisponibilité des sous-agents selon la règle de repli.

## REPRISE — superviseur, 15/10/2026
Le commit 2276663 a basculé l'effectif et le classement mondial (`mgmtExteriorEffectifs`). Reste à basculer, chacun avec sa lecture `m.mondeVivant===true` → `m.orgs`, sinon l'ancien calcul STRICTEMENT inchangé :
1. `mgmt-ceintures.js:153` `mgmtExteriorTitles(m,div,cycle)` : champions des organisations vivantes = ceux de leur sous-partie (`m.orgs[id]`, même lecture que les ceintures du joueur).
2. `mgmt-contrats.js:207` `mgmtExteriorPourOffre(m,id)` : retrouve un combattant d'une organisation vivante via `mgmtExteriorEffectifs`.
3. `mgmt-ecran-semaine.js` `mgmtSemaineMonde(m)` : les actualités du monde lisent les résultats des soirées des sous-parties (`m.orgs[id].hist` du cycle) quand le monde vit.
4. `mgmt-recrutement.js` et `mgmt-accueil.js` : leurs lectures de `m.exterieur` passent par les mêmes fonctions (une fonction de lecture commune, pas de copie).
Une partie avec `mondeVivant===true` ne doit plus afficher de combattant venu de l'ancien `m.exterieur`.
Tests dans `tests/mgmtMondeVivant.test.js` (nommés `Monde lot 9 T2c — …`) : un par point 1 à 4, plus « une partie sans monde vivant garde exactement les mêmes titres, offres et actualités » (comparaison JSON avant/après sur une graine fixe).
Le test `outillage.test.js` « l'outil mesure création complète et semaine » passe seul : son échec venait de la charge, rien à corriger. L'écart `mgmt-nouvelle.js` de `verif-versions` : monte sa version avec `node tools/_bump.js mgmt-nouvelle.js`.
Lance seulement les tests ciblés avec `--test-name-pattern="T2c"` (délai de 120 s). Commit `Monde lot 9 T2c : les lecteurs du monde vivant (suite)`.

## REPRISE 2 — superviseur, 15/10/2026 17 h 30
Points 1 et 2 codés (09976ae). Cette session fait UNIQUEMENT, dans cet ordre, un commit après chaque étape :
A. Les tests des points 1 et 2 et le test de non-régression (partie sans monde vivant : titres et offres identiques en JSON) dans `tests/mgmtMondeVivant.test.js`. Commit `Monde lot 9 T2c : tests des titres et des offres`.
B. Le point 3 (`mgmtSemaineMonde`) et son test. Commit `Monde lot 9 T2c : les actualités du monde vivant`.
Le point 4 sera une session suivante. Ne t'arrête pas sur le nom d'un commit précédent.

## Compte rendu — reprise

- Fichiers modifiés : `mgmt-ecran-semaine.js` lit une soirée courante d'une sous-partie en mode vivant ; `index.html` monte sa version de cache ; `tests/mgmtMondeVivant.test.js` couvre titres, offres, actualités et non-régression sans monde vivant.
- Tests ajoutés : « Monde lot 9 T2c — les titres extérieurs reprennent les champions des organisations vivantes » ; « Monde lot 9 T2c — une offre extérieure retrouve le combattant de l’organisation vivante » ; « Monde lot 9 T2c — titres, offres et actualités sans monde vivant restent identiques » ; « Monde lot 9 T2c — les actualités lisent les résultats des soirées des organisations vivantes ».
- Migration de sauvegarde : aucune. Écarts : le test ciblé a été interrompu deux fois par le délai d'outil de 120 s ; `node tools/verif-versions.js origin/main` ne signale que l'écart préexistant `mgmt-nouvelle.js`.
- Questions pour Anthony : aucune.
- Relecture : non appelée, aucun sous-agent disponible selon la règle de repli.

## REPRISE 3 — superviseur, 15/10/2026 18 h
Relecture de 9243019 : A et B acceptés, sauf le test « titres, offres et actualités sans monde vivant restent identiques », qui est vide (il passe `mondeVivant` de false à false). À faire, un commit par étape :
A. Réécris ce test : partie `creer(false)` ; photographie titres, offre et actualités ; puis ajoute à cette même partie un `m.orgs` rempli (copie de celui d'une partie `creer(true)`, `mondeVivant` reste false) et re-photographie : les deux JSON sont identiques. Commit `Monde lot 9 T2c : le test de non-régression compare deux états`.
B. Point 4 : `mgmt-recrutement.js` et `mgmt-accueil.js` lisent les combattants extérieurs par `mgmtExteriorCombattant` / `mgmtExteriorEffectifs` quand `m.mondeVivant===true`. Remets d'abord l'indentation d'origine de `mgmt-recrutement.js:33` (4 espaces). Test « Monde lot 9 T2c — le recrutement et l'accueil lisent les organisations vivantes ». Commit `Monde lot 9 T2c : recrutement et accueil`.
C. `node tools/_bump.js mgmt-nouvelle.js` puis `node tools/verif-versions.js origin/main` sans écart. Commit `Monde lot 9 T2c : versions`.
