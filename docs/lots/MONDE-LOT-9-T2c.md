# Monde lot 9 T2c — les huit organisations vivent : les lecteurs 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
les lecteurs : les fonctions du monde extérieur (`mgmtExterior*`, `m.exterieur`) lisent `m.orgs` quand `m.mondeVivant===true` (effectifs, champions, classements), sinon l'ancien calcul inchangé. Inventaire des appelants par grep, une fonction de lecture commune.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2c : ...`.

## Compte rendu

- Fichiers modifiés : `mgmt-monde.js` expose la lecture commune des effectifs des organisations vivantes et l'inclut dans le compte mondial ; `mgmt-carte.js` inclut leurs combattants au classement mondial ; `tests/mgmtMondeVivant.test.js` vérifie les deux lecteurs ; `index.html` et `sw.js` montent les versions après les changements JS ; cette fiche consigne le résultat.
- Tests ajoutés : « Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial ». Le fichier `mgmtMondeVivant.test.js` était déjà référencé dans les scripts `test` et `test:watch` de `package.json`, donc aucun changement nécessaire.
- Vérification : `node --test --test-name-pattern="T2c" tests/mgmtMondeVivant.test.js` passe (1/1). Le fichier entier a été lancé, mais le délai de 120 s a interrompu son test d'écran existant ; les tests exécutés avant l'interruption étaient verts. `node tools/verif-versions.js origin/main` signale l'écart préexistant `mgmt-nouvelle.js` (modifié dans la branche, version identique à origin/main) ; ce fichier n'est pas modifié par cette tranche. Aucun `check:rapide` lancé, conformément à la consigne.
- Migration de sauvegarde : aucune.
- Écart à la fiche : portée implémentée pour l'effectif et le classement mondial ; les autres lecteurs directs de l'ancien `m.exterieur` (notamment titres/champions et les écrans qui consomment les traces) ne sont pas encore basculés. Ces consommateurs sont plus nombreux que les deux fonctions testées ; il faut compléter cette tranche avant de considérer le remplacement des lecteurs achevé. La lecture historique reste inchangée pour `mondeVivant!==true`.
- Questions pour Anthony : aucune nouvelle question ; le travail restant est la bascule des lecteurs recensés hors effectif/classement.
- Relecture : sous-agent indisponible selon la règle de repli du superviseur ; pas de verdict `@relecteur`.
