# Monde lot 12 T3 — Les présentations d’un combattant et d’un combat, comme leurs planches

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Planches
`maquettes/monde/MondePresentationCombattant.dc.html` et `MondePresentationCombat.dc.html`, captures `maquettes/monde/captures-monde/4-…` et `5-…`. Écrans : `mgmt-presentation-ecrans.js` (`mgmtPresentationLignes`, `mgmtPresentationHtml`), données `mgmt-presentation-*.js` (lot 3).

## Écarts relevés par le superviseur (jeu sur `main`, 16/10/2026)
**Défaut de fond** : dans la présentation d’un combattant, « Ses points forts » lit `d.histoire` (les mêmes lignes que « Son histoire ici ») au lieu de sa force et de sa faille. Corrige la source (les données « force / faille / jamais vu » existent-elles dans `mgmtPresentationCombattant` ? sinon, reprends celles de la fiche et de la présentation de combat « Ce que chacun impose »), avec un test.
Combattant : cartouche « Au monde » et « Contrat » à « — » alors que le rang mondial (`mgmtFicheSituation(m,f,'world')`) et les combats restants (`mgmtContratRestants`) existent ; lignes en deux niveaux (titre + précision) avec pastille jaune, + / − / ?, et pastilles V / D / N avec soirée et année pour l’histoire ; « Ce qu’on en dit » et « Le monde » affichés vides (à masquer s’ils n’ont pas de donnée) ; en-tête sans la soirée à droite.
Combat : la plaque « Combat principal · léger · 5 rounds » sous le VS ; « Ce que chacun impose » en lignes AU CENTRE / CONTRE LA CAGE / AU SOL quand les données existent ; « Leur histoire » en tableau adversaire commun (noms en double aujourd’hui) ; les pronostics avec leur voix et le pourcentage autorisé (décision du 09/10) ; « Ce qu’on en dit » et « Ce que ça change » vides (à masquer s’ils n’ont pas de donnée).

## Tests (`tests/mgmtPresentation*.test.js`)
`Monde lot 12 T3 — « Ses points forts » ne répète pas l’histoire` ; `Monde lot 12 T3 — le cartouche donne le rang mondial et le contrat` ; `Monde lot 12 T3 — un panneau sans donnée n’est pas affiché`. Commit `Monde lot 12 T3 : les présentations comme leurs planches`.

## DÉCISION du superviseur (17/10/2026) — lève le blocage « portes interdites »
- **Le rejeu de combat et le moteur restent interdits** dans les présentations (`mgmtReplayFight`, `mgmtObservation` avec rejeu, `simulateFight` : le test « Monde lot 3 T5 — présentation sans moteur ni mutation » garde cette partie).
- **Sont autorisées** les lectures pures, sans moteur ni mutation : `mgmtCombatProfile`, `mgmtLectureStyle` (`mgmt-soiree-show.js`), `mgmtSaFaille`, `mgmtCommentIlCombat`, et les résultats de `m.hist` (qui a battu qui, comment). Le test du lot 3 T5 est **révisé** pour n’interdire que le rejeu, le moteur et la mutation ; cite cette décision dans le test.
- **« Ses points forts »** = les forces lues sur le profil (`mgmtLectureStyle(f).lignes`, une à trois phrases, ex. « Frappe de loin et touche juste ») **plus**, s’il y en a, ses victoires par KO ou soumission (une ligne chacune, « KO contre X, 2e round ») ; **jamais** les combats gagnés aux points, jamais l’histoire. Sans aucune force lisible, le panneau n’est pas affiché.
- Ne remets pas de question : applique.

## Compte rendu

- Fichiers modifiés : `mgmt-presentation-ecrans.js` — lectures pures du profil et de l'histoire, panneaux conditionnels, rang/contrat, histoire et rendu de combat ; `tests/mgmtPresentationEntrees.test.js` — trois tests T3 et adaptation des assertions d'écran selon la décision ; cette fiche — compte rendu.
- Tests ajoutés : « Monde lot 12 T3 — Ses points forts ne répète pas l’histoire », « Monde lot 12 T3 — le cartouche donne le rang mondial et le contrat », « Monde lot 12 T3 — un panneau sans donnée n’est pas affiché ».
- Vérification : `node tools/verif-versions.js origin/main` sans écart ; les quatre fichiers ciblés passent (33 tests). `npm run check:rapide` non lancé conformément à la consigne.
- Relecture : aucun sous-agent appelé (repli imposé) ; revue locale après tests, sans verdict agent.
- Migration : aucune. Écarts à la fiche : aucun connu.
- Questions pour Anthony : aucune.

## REPRISE (17/10/2026) — la source manquante existe maintenant
La branche a reçu `main` : `mgmtLectureStyle(f)` existe dans `mgmt-soiree-show.js` (elle renvoie `{profil, lignes, zones}`, lecture pure du profil de combat, sans moteur ni mutation). Applique la décision ci-dessus telle quelle, sans question. Le commit précédent (« inachevé ») n’est qu’un constat : termine la tranche avec le commit `Monde lot 12 T3 : les présentations comme leurs planches`.

## REPRISE du superviseur (17/10/2026, 15 h 10) — ne t'arrête pas sur des tests rouges, corrige-les
Le code est écrit (`mgmt-presentation-ecrans.js`, non commité). **Trois tests échouent parce qu'ils décrivaient l'ancienne structure** (`tests/mgmtPresentationEntrees.test.js` : « présentation sans moteur ni mutation », « voix, pourcentage et sources affichées », « échappement, absents et pagination »). La tranche **change** cette structure par décision (planches validées) : **mets ces tests à jour** pour la nouvelle structure, en citant la décision (fiche T3, section DÉCISION) dans un commentaire, sans assouplir ce qu'ils garantissent (pas de mutation, échappement `esc()`, pagination, absents). Puis : les trois intitulés du § Tests de cette fiche (`tests/mgmtPresentationEntrees.test.js`, `tests/mgmtPresentationCombattant.test.js`), `node tools/_bump.js` sur chaque .js touché, `node tools/verif-versions.js origin/main`, tests ciblés `node --test tests/mgmtPresentationEntrees.test.js tests/mgmtPresentationCombattant.test.js tests/mgmtPresentationCombat.test.js tests/mgmtPresentationFaits.test.js`, et **commite** (`Monde lot 12 T3 : …`). S'il reste du rouge, dis lequel dans le compte rendu et commite quand même avec « (inachevé) » dans le message : ne laisse jamais le travail non commité.
