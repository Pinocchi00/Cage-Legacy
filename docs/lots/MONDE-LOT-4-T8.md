# Monde lot 4 T8 — L'écran des dossiers comme sur les planches

## Branche
`monde-lot-4-dossiers` (branche attendue et courante). Elle contient `main` (lots 3, 5, 6, 10, 11).

## Objectif
Défaut trouvé par le superviseur en jouant (15/10/2026, 1920×1080) : l'écran des dossiers n'affiche qu'un nom, l'identifiant interne (`mg104`) en clair, aucune raison, des boutons sans style. Les planches VALIDÉES sont dans le dépôt, en HTML lisible : `maquettes/monde/MondeDossiersCombattant.dc.html` (étape 1) et `maquettes/monde/MondeDossiersAdversaire.dc.html` (étape 2). **Lis leur HTML et leurs styles inline** : positions, tailles de police, couleurs (`#0D0B0B`, jaune, rouge), polices Saira ; porte ces valeurs en règles `.mf-dossiers …` avec les jetons `--mf-*` existants. Leurs textes d'exemple (Keller, Beko…) sont des exemples, jamais à recopier : les données viennent de la partie. La description ci-dessous suffit à coder ; ne t'arrête pas faute de pouvoir voir une image. Le rendu actuel est `mgmtCarteDossierHtml` (`mgmt-carte-cadre.js`) ; on le réécrit, la logique des piles (`mgmtDossiersCombattants`, `mgmtDossiersAdversaires`, `MGMT_CART`) ne change pas.

## Ce qui change — `mgmt-carte-cadre.js` (rendu) et `ui-cadre.css` (styles `.mf-dossiers …`)
De haut en bas, comme la planche :
1. **En-tête** (gabarit `mfEcran` existant) : plaque `CARTE`, `LES DOSSIERS DE LEÏLA`, `COMBAT {k}` (k = numéro de la place visée, `MGMT_CART.cible`+1, sinon la première place libre), puis la date et la soirée comme sur l'écran Carte (réutilise ses fonctions d'en-tête, n'en écris pas de nouvelles).
2. **Bandeau de Leïla** : `LEÏLA, VOTRE ADJOINTE` ; phrase (textes des planches validées, mot pour mot) :
   - étape 1 : `« Voici {n} dossiers pour le combat {k}. Faites-les défiler, puis choisissez. »`
   - étape 2 : `« Vous avez choisi {nom}. Voici {n} adversaires possibles. »` (`{nom}` = nom de famille)
   - ligne de contexte : `Combat {k} · {catégorie en minuscules} · {nombre} combattants libres · la carte en est à {posés} combats sur {taille}` (étape 2 : `{nom} contre ? ` à la place du nombre de libres).
   - à droite, les trois étapes `ÉTAPE 1 LE COMBATTANT` › `ÉTAPE 2 SON ADVERSAIRE` › `ÉTAPE 3 SUR LA CARTE` ; l'étape courante en jaune, une étape faite porte ✓.
3. **Le dossier** au centre, entre deux colonnes `DOSSIER PRÉCÉDENT` / `DOSSIER SUIVANT` (prénom, NOM, et la ligne 1 de la raison du dossier voisin ; flèches rondes cliquables → `CL.mgmtDossierIndex(∓1)`).
   - Bannière : prénom petit, NOM très grand, motif d'octogone (reprends celui de la présentation du lot 3, `.mf-pr-banniere`), cartouche `PALMARÈS W-L-D` · `CHEZ SPLIT N°{rang}` · `CONTRAT {n} COMBATS` (mêmes calculs que le cartouche de `mgmtPresentationHtml`). À l'étape 2 la bannière est celle de l'adversaire.
   - Encadré rouge : `POURQUOI LEÏLA VOUS LE PROPOSE · {FAMILLE}` (famille = id de `MGMT_RAISON_FAMILLES` en capitales, tirets → espaces), puis les deux lignes de `mgmtRaisonLignes(m,raison,[a,b])` (l1 en gros, l2 dessous). Si `raison` est nulle : pas d'encadré.
   - L'encadré jaune `CE QUE SERAIT … CONTRE …` de la planche 7 : **pas de donnée qui le calcule aujourd'hui → ne pas l'afficher** (aucun texte inventé).
   - Trois colonnes : `CE QUI LE DISTINGUE` (≤ 3 lignes), `SA FORCE · SA FAILLE`, `SON HISTOIRE ICI`, nourries par `mgmtPresentationLignes(m,{mode:'combattant',ids:[id]})` (panneaux 0, 1, 2) — la même source que la présentation du lot 3. Colonne vide → la colonne n'affiche que son titre.
4. Sous le dossier : points de pagination + `DOSSIER {i} SUR {n}`, à droite les touches ← → et `Flèches, clic sur un bord, ou glisser le dossier`.
5. Boutons : `D D'AUTRES DOSSIERS`, `L LISTE COMPLÈTE`, étape 1 `F SA FICHE`, étape 2 `P PRÉSENTATION DU COMBAT` ; bouton jaune à droite `Entrée CHOISIR {NOM}` (étape 1) / `Entrée METTRE {A} – {B} SUR LA CARTE` (étape 2). Utilise `mfBouton` comme le reste du jeu.
6. Barre des touches en bas (déjà fournie par `mfEcran` avec `touches`) : textes de la planche (`Retour à la carte` / `Changer de combattant` pour Échap).
- **Aucun identifiant interne visible** (supprime `mf-dossier-id`).
- Aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920.

## Tests (`tests/mgmtDossiers.test.js`)
- `Monde lot 4 T8 — le dossier montre la bannière, la raison de Leïla et les trois colonnes` : étape 1, le texte visible contient le NOM, `PALMARÈS`, `POURQUOI LEÏLA VOUS LE PROPOSE`, la ligne l1 de `mgmtRaisonLignes`, `CE QUI LE DISTINGUE`, `SON HISTOIRE ICI`, `DOSSIER 1 SUR {n}`.
- `Monde lot 4 T8 — aucun identifiant interne n'est affiché` : aucun texte visible ne correspond à `/\bmg\d+\b/`.
- `Monde lot 4 T8 — l'étape 2 montre l'adversaire et le bouton pour mettre le combat sur la carte`.
- Les tests T1 à T7 existants restent intacts (si un test vérifie une classe supprimée comme `mf-dossier-id`, cite cette fiche dans un commentaire et adapte-le).

## Vérification
`node tools/_bump.js mgmt-carte-cadre.js ui-cadre.css`, `node --test --test-name-pattern="T8|T7" tests/mgmtDossiers.test.js` (délai 120 s). Pas de `check:rapide`. Le superviseur compare l'écran aux planches dans le jeu. Commit `Monde lot 4 T8 : l'écran des dossiers comme sur les planches`.

## Hors périmètre
La logique des piles, le booking, les textes de raison (`MGMT_RAISON_PHRASES`).

## Compte rendu
- `mgmt-carte-cadre.js` : rendu et étapes du dossier corrigés, identité adversaire et voisins selon l'étape, raison déjà échappée, classement d'organisation, première place libre réelle, en-tête Carte, touches/libellés et phrases identifiées `relu:false`.
- `ui-cadre.css` : neutralisation des anciennes règles T7 conflictuelles, bandeau opaque, motif octogonal, tailles validées, voisins ronds, pagination et alignements.
- `index.html` : versions du JS et CSS bumpées ; `sw.js` : version de cache montée par l'outil.
- `tests/mgmtDossiers.test.js` : test T8 de l'étape 2 renforcé (étape réelle, identité dans bannière, noms dans confirmation), sans réduire la couverture T1–T7.
- Tests exécutés : « Monde lot 4 T8 — le dossier montre la bannière, la raison de Leïla et les trois colonnes », « Monde lot 4 T8 — aucun identifiant interne n'est affiché », « Monde lot 4 T8 — l'étape 2 montre l'adversaire et le bouton pour mettre le combat sur la carte » ; fichier complet `tests/mgmtDossiers.test.js` : 40/40.
- Migration de sauvegarde : aucune. Écart de contrat : la fiche demande `{n} COMBATS`, mais la présentation réutilisée affiche `—` et ne fournit pas le nombre ; aucune décision n'est prise ici, l'affichage reste `—`. Rang désormais fourni par `mgmtDivisionRank` sans incrément supplémentaire.
- Questions pour Anthony : aucune autre question ouverte par cette reprise.

## REPRISE — superviseur, 15/10/2026 19 h 15 (écran joué à 1920 et comparé à `maquettes/monde/MondeDossiersCombattant.dc.html`)
Bonne base, acceptée. Écarts à corriger, chacun en reprenant les valeurs inline de la planche `.dc.html` :
1. **Étapes** : trois cartouches comme la planche (rond numéroté, `ÉTAPE n` au-dessus, libellé dessous ; l'étape courante sur fond jaune, une étape faite avec ✓ dans le rond, les autres grisées), séparés par `›`. Aujourd'hui c'est une ligne de texte.
2. **Bannière** : le prénom est coupé en haut, à corriger ; le NOM à la taille de la planche ; le motif d'octogones rouges visible comme sur la planche ; le cartouche avec des valeurs grandes, et des libellés en capitales (`CHEZ SPLIT`, pas `CHEZ Split`).
3. **CONTRAT** : `{n} COMBATS` avec `mgmtContratRestants(f)` (`1 COMBAT` au singulier), `—` seulement sans contrat.
4. **Raison** : alignée à gauche comme la planche ; titre petit en capitales, l1 en gros et gras, l2 dessous.
5. **Dossiers voisins** : panneaux rectangulaires comme la planche (pas des ovales) ; flèche ronde blanche centrée verticalement ; prénom, NOM et raison en bas.
6. **Colonnes** : chaque ligne dans un pavé sombre avec la pastille jaune de la planche.
7. En mode dossiers, **retire l'ancienne ligne de Leïla** en bas de l'écran (« Bienvenue. Choisissez un combattant, puis son adversaire. »).
8. Aucun espace insécable ou idéographique dans le code (`no-irregular-whitespace`) : lance `npx eslint mgmt-carte-cadre.js`.
Test à ajouter : `Monde lot 4 T8 — le contrat du dossier se lit en combats restants`. Commit `Monde lot 4 T8 : reprise d'après la planche`.
