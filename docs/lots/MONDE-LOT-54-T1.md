# Monde lot 54 T1 (P8 T2-T3) — le lendemain recomposé et l'histoire qui continue

Branche : `p8-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P8 T2 et T3 (lis P7 et P8 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniLendemain.dc.html` et `UniLendemainSuite.dc.html` (le lendemain recomposé, en deux écrans).

**Ce qui existe dans `main`** : le poids d'une histoire (P8 T1, lot 46 : **lis `mgmt-histoires*.js` d'abord**), les primes (P7 T3), les relevés (`m.hist`, `mgmt-releve.js`), les suivis et espoirs, `m.defis`, l'écran du lendemain actuel (cherche `lendemain` dans `mgmt-*.js`), la presse (`mgmt-actualites*.js`), le fil. **Le discours d'après-combat (P7 T4, `m.discours`) arrive dans une autre PR** : si `m.discours` / `mgmtDiscours*` n'existe pas encore dans ton arbre, branche le bloc discours derrière un test `typeof` et ne le simule pas.

## Cases
**[ ] 1.** Non implémenté : l'écran existant n'a pas été recomposé selon les deux planches.
**[ ] 2.** Non implémenté : le test de partie réelle vérifie le tri ordinaire des histoires, pas le scénario de référence 13-1 contre n°1.
**[ ] 3.** Non implémenté : aucun catalogue de réactions de semaines suivantes.
**[x] 4.** D1 est déjà appliqué dans `mgmt-carte.js` (commentaire de décision au bloc `mgmtRangScores`, correction résultat par résultat). Le test ciblé vérifie maintenant qu'une défaite réduit bien le score par rapport au vainqueur, sans toucher au moteur de combat. L'audit cité par le brief ne contient pas lui-même le constat D1 ; la décision porte cette mention dans le code.
**[ ] 5.** Le test est référencé par `test` et `test:watch`; aucun nouvel état de sauvegarde. Les critères fonctionnels principaux restent incomplets.
**[ ] 6.** Compte rendu actualisé ; critère de tranche non atteint.

## Compte rendu

- `tests/mgmtLot54T1.test.js` : un test de fumée sur une partie réelle construite par `mgmtPasseGenerer('split',{soirees:3})`, et un test ciblé du score du perdant pour D1. Le premier ne couvre pas la soirée de référence 13-1.
- `package.json` : le fichier est déjà référencé par les scripts agrégés `test` et `test:watch` et par les scripts ciblés.
- Aucun code d'écran, catalogue T3 ou changement du classement ; aucune migration de sauvegarde.
- Vérification : `node --test tests/mgmtLot54T1.test.js` passe (2 tests). D1 est déjà corrigé dans le classement depuis une tranche antérieure ; le résultat de `mgmtRangScores` est maintenant vérifié ici. La tranche reste incomplète sur T2, T3 et le scénario de référence.
- Écarts à la fiche et aux maquettes : les deux écrans à `ld3-`, les trois moments, les blocs de presse/mouvements et l'après n'ont pas été codés. Aucun écart ne doit être interprété comme une validation de ces écrans.
- Questions pour Anthony : le scénario de référence doit-il être fourni comme partie de fixture existante ou faut-il construire ses combattants/son combat via un autre chemin réel ? Sans réponse, aucun nom ou résultat du jeu n'a été inventé.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
