# Monde lot 9 T2c — les huit organisations vivent : les lecteurs 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
les lecteurs : les fonctions du monde extérieur (`mgmtExterior*`, `m.exterieur`) lisent `m.orgs` quand `m.mondeVivant===true` (effectifs, champions, classements), sinon l'ancien calcul inchangé. Inventaire des appelants par grep, une fonction de lecture commune.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2c : ...`.
