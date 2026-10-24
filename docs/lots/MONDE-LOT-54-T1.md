# Monde lot 54 T1 (P8 T2-T3) — le lendemain recomposé et l'histoire qui continue

Branche : `p8-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P8 T2 et T3 (lis P7 et P8 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniLendemain.dc.html` et `UniLendemainSuite.dc.html` (le lendemain recomposé, en deux écrans).

**Ce qui existe dans `main`** : le poids d'une histoire (P8 T1, lot 46 : **lis `mgmt-histoires*.js` d'abord**), les primes (P7 T3), les relevés (`m.hist`, `mgmt-releve.js`), les suivis et espoirs, `m.defis`, l'écran du lendemain actuel (cherche `lendemain` dans `mgmt-*.js`), la presse (`mgmt-actualites*.js`), le fil. **Le discours d'après-combat (P7 T4, `m.discours`) arrive dans une autre PR** : si `m.discours` / `mgmtDiscours*` n'existe pas encore dans ton arbre, branche le bloc discours derrière un test `typeof` et ne le simule pas.

## Cases
**[~] 1.** Ajout partiel des moments Surprise/Finition/Guerre, ordonnés par sélection de l'histoire, avec le bouton Revoir existant. Le reste des deux écrans de maquette (primes, discours, changements suivis/espoirs, presse ordonnée, chiffres/contrat, mouvements, résultats complets et cadres) n'est pas recomposé.
**[x] 2.** Un test génère une partie par `mgmtPasseGenerer('split',{soirees:3})`, choisit le n°1 mondial et construit dans `m.hist` le 13-1 gagnant ; il vérifie que l'histoire de surprise est en tête et que la presse produit un premier titre. Limite : les données de finitions, discours et autres composantes de T2 restent non branchées.
**[ ] 3.** Non implémenté : aucun catalogue de réactions de semaines suivantes.
**[x] 4.** D1 est déjà appliqué dans `mgmt-carte.js` (commentaire de décision au bloc `mgmtRangScores`, correction résultat par résultat). Le test ciblé vérifie maintenant qu'une défaite réduit bien le score par rapport au vainqueur, sans toucher au moteur de combat. L'audit cité par le brief ne contient pas lui-même le constat D1 ; la décision porte cette mention dans le code.
**[x] 5.** Le test est référencé par `test` et `test:watch`; aucun nouvel état de sauvegarde. Les critères fonctionnels principaux restent incomplets.
**[ ] 6.** Critère de tranche non atteint.

## Compte rendu

- `mgmt-ecran-lendemain.js` : ajout des cartes des trois moments et lien vers `CL.mgmtLendemainRevoir` sans réécrire le rejeu.
- `ui-cadre.css` et `index.html` : règles `.ld3-*` (corps au moins 22 px) et versions cache montées. `index.html` reste LF.
- `tests/mgmtLot54T1.test.js` : test réel, soirée de référence, vérification du rendu du premier moment/Revoir et vérification D1 ; les intitulés de test préexistants sont conservés.
- Aucun catalogue T3, aucune migration de sauvegarde. D1 était déjà corrigé dans le classement ; test ciblé sans moteur de combat.
- Vérifications : `node --test tests/mgmtLot54T1.test.js` passe (3 tests) ; `node tools/verif-versions.js origin/main` ne relève aucun écart ; eslint ciblé sur le code passe (le fichier de test est ignoré par la configuration ESLint).
- Écarts à la fiche et aux maquettes : les deux écrans ne sont pas fidèlement recomposés ; les blocs primes/discours, suivis/espoirs, titres de presse prioritaires, chiffres/contrat, mouvements et résultats complets restent à faire. T3 (catalogue ≥8 familles, dosage hebdomadaire et non-répétition sur 50 soirées) reste entièrement à faire. Le scénario de référence est testé via le calcul des histoires, de la presse et des moments après injection conforme à la précision du superviseur.
- Questions pour Anthony : aucune question de spécification ; livraison partielle, non validée comme tranche terminée.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
