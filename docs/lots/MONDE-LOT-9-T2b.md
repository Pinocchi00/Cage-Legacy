# Monde lot 9 T2b — les huit organisations vivent : la semaine 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
la semaine : à chaque ouverture de cycle du joueur, chaque organisation de `m.orgs` joue au plus une soirée selon son calendrier, ordre fixe, déterministe ; temps d'une semaine mesuré.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2b : ...`.

## Note du superviseur — 15/10/2026 (avant T2b)
T2a est ACCEPTÉE : tests verts, partie complète ≤ 1,5 Mo. Mais le test « T2a bis — six ans complets : la partie écrite tient en 1,5 Mo » dure 16 minutes : il ne doit PAS rester dans la suite ordinaire. Dans cette tranche, sors-le de `tests/mgmtMondeVivant.test.js` vers `tools/mesure-monde-vivant.js` (même assertion, lancé à la main par le superviseur avant une fusion, documenté dans `tools/reports/` ou en tête du fichier). Aucun autre test de la suite ne doit générer les six ans des huit organisations : utilise un passé court.

## Compte rendu

- Fichiers modifiés : `tests/mgmtMondeVivant.test.js` retire la mesure six ans de la suite ordinaire ; `tools/mesure-monde-vivant.js` conserve les assertions comme mesure manuelle ; cette fiche consigne l'écart.
- Tests ajoutés : aucun. Tests ciblés existants : les six tests Monde vivant.
- Migration de sauvegarde : aucune dans cette sous-tranche.
- Écart à la fiche : la simulation hebdomadaire et sa mesure n'ont pas été implémentées. La coordination du matchmaker avec l'ouverture du cycle, qui exige temporairement le remplacement de `G.mgmt`, reste à intégrer ; je n'ai pas fait de modification partielle risquant d'altérer la progression existante.
- Vérification : `node --test tests/mgmtMondeVivant.test.js` passe (6/6). `node tools/verif-versions.js origin/main` signale un écart pour `mgmt-nouvelle.js` (`?v=b9xxxxxxxx` identique à origin/main), fichier hors de cette tranche.
- Questions pour Anthony : reprendre l'implémentation de l'ouverture hebdomadaire après inventaire de son point d'appel exact.
