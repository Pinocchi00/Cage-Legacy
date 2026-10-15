# Monde lot 9 T2a — les huit organisations vivent : la création et la sauvegarde 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
la création et la sauvegarde : à la création d'une partie avec passé, les sept autres organisations vivent leurs six ans (`m.orgs`, format de la DÉCISION 2), `m.mondeVivant=true` ; migration 18 → 20 (`m.mondeVivant=false`, ancien monde inchangé), validation, sérialisation par `mgmtPasseCompacter` ; taille mesurée. AUCUN lecteur n'est encore branché : les écrans lisent toujours l'ancien monde.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2a : ...`.
