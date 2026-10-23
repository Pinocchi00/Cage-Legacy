# Monde lot 54 T1 (P8 T2-T3) — le lendemain recomposé et l'histoire qui continue

Branche : `p8-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P8 T2 et T3 (lis P7 et P8 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniLendemain.dc.html` et `UniLendemainSuite.dc.html` (le lendemain recomposé, en deux écrans).

**Ce qui existe dans `main`** : le poids d'une histoire (P8 T1, lot 46 : **lis `mgmt-histoires*.js` d'abord**), les primes (P7 T3), les relevés (`m.hist`, `mgmt-releve.js`), les suivis et espoirs, `m.defis`, l'écran du lendemain actuel (cherche `lendemain` dans `mgmt-*.js`), la presse (`mgmt-actualites*.js`), le fil. **Le discours d'après-combat (P7 T4, `m.discours`) arrive dans une autre PR** : si `m.discours` / `mgmtDiscours*` n'existe pas encore dans ton arbre, branche le bloc discours derrière un test `typeof` et ne le simule pas.

## Cases
**[ ] 1.** Non implémenté (voir compte rendu).
**[ ] 2.** Le test ajouté ne construit pas le scénario de référence 13-1 contre n°1.
**[ ] 3.** Non implémenté.
**[ ] 4.** L'audit reste à vérifier précisément ; test ajouté limité à la validité du rang et ne prouve pas D1.
**[ ] 5.** Test ajouté aux scripts `test` et `test:watch`; aucun nouvel état de sauvegarde. Les critères fonctionnels principaux restent incomplets.
**[ ] 6.** Compte rendu ajouté ; critère de tranche non atteint.

## Compte rendu

- `tests/mgmtLot54T1.test.js` : ajoute deux tests de fumée sur une partie créée avec `mgmtPasseGenerer('split',{soirees:3})`, dont un passage par la soirée réelle et une lecture des histoires. Ils ne couvrent pas les critères d'acceptation T2/T3 ni le cas de référence 13-1.
- `package.json` : ajoute le test aux scripts agrégés `test` et `test:watch`, ainsi que `test:lot54t1` et `test:watch:lot54t1`.
- Aucun code d'écran, catalogue de textes ou changement de classement livré ; aucune migration de sauvegarde.
- Écart majeur à la fiche : T2 et T3 restent à faire. Les deux maquettes et le brief exigent un travail d'interface et de données non couvert par cette reprise. D1 n'est pas établi par le test actuel.
- Questions pour Anthony : aucune nouvelle question, mais cette tranche n'est pas finie et ne satisfait pas son critère final.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
