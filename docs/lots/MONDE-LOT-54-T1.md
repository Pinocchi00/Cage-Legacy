# Monde lot 54 T1 (P8 T2-T3) — le lendemain recomposé et l'histoire qui continue

Branche : `p8-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P8 T2 et T3 (lis P7 et P8 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniLendemain.dc.html` et `UniLendemainSuite.dc.html` (le lendemain recomposé, en deux écrans).

**Ce qui existe dans `main`** : le poids d'une histoire (P8 T1, lot 46 : **lis `mgmt-histoires*.js` d'abord**), les primes (P7 T3), les relevés (`m.hist`, `mgmt-releve.js`), les suivis et espoirs, `m.defis`, l'écran du lendemain actuel (cherche `lendemain` dans `mgmt-*.js`), la presse (`mgmt-actualites*.js`), le fil. **Le discours d'après-combat (P7 T4, `m.discours`) arrive dans une autre PR** : si `m.discours` / `mgmtDiscours*` n'existe pas encore dans ton arbre, branche le bloc discours derrière un test `typeof` et ne le simule pas.

## Cases
**[~] 1.** Les moments Surprise/Finition/Guerre, les primes, le bloc conditionnel des discours, les constats de suivis/espoirs, un rendu classé de la presse et des chiffres disponibles sont présents. La recomposition complète des deux écrans, le bloc contrat, les mouvements selon la planche et le second écran dédié ne sont pas achevés.
**[x] 2.** Un test génère une partie par `mgmtPasseGenerer('split',{soirees:3})`, choisit le n°1 mondial et construit dans `m.hist` le 13-1 gagnant ; il vérifie que l'histoire de surprise est en tête et que la presse produit un premier titre. Limite : les données de finitions, discours et autres composantes de T2 restent non branchées.
**[ ] 3.** Non implémenté : aucun catalogue de réactions de semaines suivantes.
**[x] 4.** D1 est déjà appliqué dans `mgmt-carte.js` (commentaire de décision au bloc `mgmtRangScores`, correction résultat par résultat). Le test ciblé vérifie maintenant qu'une défaite réduit bien le score par rapport au vainqueur, sans toucher au moteur de combat. L'audit cité par le brief ne contient pas lui-même le constat D1 ; la décision porte cette mention dans le code.
**[x] 5.** Le test est référencé par `test` et `test:watch`; aucun nouvel état de sauvegarde. Les critères fonctionnels principaux restent incomplets.
**[ ] 6.** Critère de tranche non atteint.

## Compte rendu

- `mgmt-ecran-lendemain.js` : moments existants, rangés depuis P8 T1 avec le Revoir actuel ; blocs primes, discours facultatif (garde `typeof`) et suivis/espoirs ajoutés sans altérer le rejeu.
- `ui-cadre.css` et `index.html` : règles `.ld3-*` pour les nouveaux éléments (polices ≥22 px), versions cache montées. `index.html` reste LF.
- `tests/mgmtLot54T1.test.js` : les tests de classement, soirée de référence et D1 sont conservés ; test « le lendemain assemble primes, discours facultatif et suivis/espoirs » ajouté.
- Reprise : ajout de `mgmtLendemainPresseHtml` qui trie par l'histoire rattachée au combat et de `mgmtLendemainChiffresHtml` pour les seules données présentes ; styles `.ld3-figures`/`.ld3-figure`. Nouveau test : « Monde lot 54 T1 — la presse suit le poids des histoires et les chiffres utilisent les données de clôture ».
- Aucun catalogue T3 ni nouvelle clé de sauvegarde. D1 était déjà corrigé dans le classement ; test ciblé sans moteur de combat.
- Vérifications de reprise : `node --test tests/mgmtLot54T1.test.js` passe (5 tests) ; `node tools/verif-versions.js origin/main` sans écart ; `node_modules/.bin/eslint mgmt-ecran-lendemain.js` passe. Le test est référencé dans `test` et `test:watch`.
- Écarts à la fiche et aux maquettes : tranche toujours incomplète. Les deux écrans ne sont pas fidèlement recomposés ; les chiffres de popularité/objectif ne sont rendus que s'ils existent sous les champs consultés ; contrat, mouvements, répartition des résultats et catalogue T3 (≥8 familles, ≤3 lignes/semaine, aucun texte répété sur 50 soirées pour un combattant) restent à réaliser. Aucun écart n'est présenté comme terminé.
- Choix d'implémentation : le tri presse préfère l'histoire du combat référencé (`row.f`), puis l'identifiant ; les valeurs absentes ne sont pas inventées. Le bloc discours reste absent tant que la porte `mgmtDiscoursLire`/`m.discours` n'est pas présente. Les faits prime utilisent le format réellement enregistré par P7 T3 (`m`, en euros), converti en milliers avant `mgmtEuros`.
- Questions pour Anthony : aucune question ; travaux restants identifiés ci-dessus, ne pas considérer la tranche comme terminée.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
