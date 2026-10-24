# Monde lot 54 T1 (P8 T2-T3) — le lendemain recomposé et l'histoire qui continue

Branche : `p8-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P8 T2 et T3 (lis P7 et P8 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniLendemain.dc.html` et `UniLendemainSuite.dc.html` (le lendemain recomposé, en deux écrans).

**Ce qui existe dans `main`** : le poids d'une histoire (P8 T1, lot 46 : **lis `mgmt-histoires*.js` d'abord**), les primes (P7 T3), les relevés (`m.hist`, `mgmt-releve.js`), les suivis et espoirs, `m.defis`, l'écran du lendemain actuel (cherche `lendemain` dans `mgmt-*.js`), la presse (`mgmt-actualites*.js`), le fil. **Le discours d'après-combat (P7 T4, `m.discours`) arrive dans une autre PR** : si `m.discours` / `mgmtDiscours*` n'existe pas encore dans ton arbre, branche le bloc discours derrière un test `typeof` et ne le simule pas.

## Cases
**[ ] 1.** Non implémenté : l'écran existant n'a pas été recomposé selon les deux planches.
**[x] 2.** Un test génère une partie par `mgmtPasseGenerer('split',{soirees:3})`, choisit le n°1 mondial et construit dans `m.hist` le 13-1 gagnant ; il vérifie que l'histoire de surprise est en tête et que la presse produit un premier titre. Limite : les données de finitions, discours et autres composantes de T2 restent non branchées.
**[ ] 3.** Non implémenté : aucun catalogue de réactions de semaines suivantes.
**[x] 4.** D1 est déjà appliqué dans `mgmt-carte.js` (commentaire de décision au bloc `mgmtRangScores`, correction résultat par résultat). Le test ciblé vérifie maintenant qu'une défaite réduit bien le score par rapport au vainqueur, sans toucher au moteur de combat. L'audit cité par le brief ne contient pas lui-même le constat D1 ; la décision porte cette mention dans le code.
**[x] 5.** Le test est référencé par `test` et `test:watch`; aucun nouvel état de sauvegarde. Les critères fonctionnels principaux restent incomplets.
**[ ] 6.** Compte rendu actualisé ; critère de tranche non atteint.

## Compte rendu

- `tests/mgmtLot54T1.test.js` : test de fumée sur une partie réelle, test du scénario de référence (partie issue du chemin réel, classement 13-1 contre le n°1 injecté dans la trace, histoire classée en tête et production d'un titre de presse), et test ciblé du score du perdant pour D1.
- `package.json` : le fichier est déjà référencé par les scripts agrégés `test` et `test:watch` et par les scripts ciblés.
- Aucun code d'écran ni catalogue T3 ; aucune migration de sauvegarde. D1 était déjà corrigé dans le classement depuis une tranche antérieure ; le test vérifie cette correction sans moteur de combat.
- Vérification : `node --test tests/mgmtLot54T1.test.js` passe (3 tests).
- Écarts à la fiche et aux maquettes : les deux écrans à `ld3-`, les trois moments, primes/discours, chiffres/contrat et résultats aux valeurs des planches, ainsi que l'après (catalogue de huit familles, limitation hebdomadaire et garantie d'absence de répétition sur 50 soirées) restent à faire. Le scénario de test suit la précision du superviseur : données de combat injectées à la main après génération du monde.
- Questions pour Anthony : aucune question bloquante identifiée ; ces écarts sont des travaux restants, pas une validation des écrans.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
