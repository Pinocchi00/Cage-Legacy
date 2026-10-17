# Monde lot 14 T5 — Défauts réels révélés par la pose directe (recharger, prédécesseur, ceintures)

Branche : `monde-lot-14-leila`. Suite de la T4. **Mêmes règles que `docs/lots/MONDE-LOT-14-T3.md`** (un fichier de test à la fois ; **ici ce sont probablement des défauts du CODE de T2, pas des tests périmés** : corrige le code, garde les tests). Commit `Monde lot 14 T5 : recharger ne change rien, le prédécesseur garde son flux` ; « (inachevé) » s'il reste du rouge.

Principes violés d'après les tests rouges :
- **Recharger une partie ne change rien** : sauvegarder puis recharger doit redonner le même état (seuls `lastEvent.vu` et la prochaine date peuvent bouger). La composition des préliminaires à l'ouverture (`mgmtRepair` dans `mgmt-save.js`, `mgmtAgendaJouer`, `mgmtComposerPrelims`) ne doit jamais s'exécuter sur une carte dont les préliminaires sont déjà complets, et ne doit rien tirer au sort ni écrire de fait quand il n'y a rien à faire.
- **Le prédécesseur garde son flux** (fiche T2 point 7) : `MGMT_PREDECESSEUR_EN_COURS` doit empêcher toute composition automatique pendant le rejeu du passé ; les six ans générés restent identiques aux empreintes de `main` + effet de la T1 (déjà recalculées : `tests/mgmtPasse.test.js` « empreinte » et « optimisation du booking » sont verts, ne les touche pas).

Rouges :
1. `tests/mgmtSuiteHeritee.test.js` : « Monde lot 5 T5 — reprendre la première soirée mène au lendemain puis aux résultats » → « seuls lastEvent.vu et la prochaine date sont admis après reprise » (l'état après reprise diffère de `ageWeeks:30,…`) : la reprise modifie l'état.
2. `tests/mgmtCeintures.test.js` : « T1 ceintures — cinq rounds en combat principal et titre ailleurs, vrai rejeu fidèle et rechargement » → « sauvegarde et secours : aucun recalcul de soirée » (false).
3. `tests/mgmtPasse.test.js` (filtre `--test-name-pattern "conservés"`) : « Monde lot 1 T4 — les contrats, blessures, attentes, ceintures et historique sont conservés » → « conservé : facts » (false) : les faits de la partie ne sont plus conservés au premier jour.
4. `tests/mgmtPredecesseurDemandes.test.js` : « Monde lot 5 T2 — alléger recale les références des promesses et des refus » → `82 !== 83`.
5. `tests/mgmtSoireeShow.test.js` : « Le commentaire et les coins — datés dans le combat, jamais l'un sur l'autre, textes marqués relu:false » → `assert.ok(r.coins>=3)` (false) : probablement une conséquence de la composition différente de la soirée ; vérifie si c'est du test (la soirée jouée est autre, il suffit de choisir un combat qui a des coins) ou du code.

Méthode pour chacun : lance le test seul, lis l'assertion, compare à `main` (`git stash` interdit : lis `git show origin/main:<fichier>` pour voir l'ancien comportement), trouve la ligne de T2 qui change l'état (mutation à l'ouverture, tirage supplémentaire du RNG, fait écrit), corrige. Ajoute un test `Monde lot 14 T5 — recharger ne change rien` (sauvegarde → chargement → état identique, première soirée posée et préliminaires composés) et `Monde lot 14 T5 — le prédécesseur ne compose rien`.
