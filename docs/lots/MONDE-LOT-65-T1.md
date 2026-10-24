# Monde lot 65 T1 — fidélité aux maquettes : la soirée (carte, en cours, fin) et le combat en temps forts

Branche : `fid-soiree` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Les maquettes (`docs/planches-uniques/Uni*.dc.html`) sont validées par Anthony : l'écran du jeu doit leur ressembler.** Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` : un outil capture ton écran à 1920×1080 et le compare à la maquette (image `cmp-<écran>.png` : jeu à gauche, maquette à droite). **Utilise-le après chaque étape.**

Écrans de ta tranche : `soiree` (état en cours, maquette `UniSoiree`), `soireeOuverture`, `soireeFin` (maquette `UniSoireeFin`) et le combat en temps forts (maquette `UniTempsForts`, à capturer : écris-toi une scène dans une copie de `screens.js` : copie le dossier `shoot` dans le tien). Fichiers : `mgmt-soiree-cadre.js`, `mgmt-ecran-soiree.js`, `mgmt-soiree-show.js`, `mgmt-combat.js`, `mgmt-temps-forts.js`, `ui-cadre.css`.

## Écarts constatés le 24/10 (à corriger tous)
**Fin de soirée (le plus grave, écart 50 %).** L'écran du jeu **empile deux en-têtes** (« SOIRÉE 9/9 » et « FIN DE SOIRÉE 9/9 »), garde l'ancienne vue (un grand bloc rouge « SPLIT FIGHT NIGHT TERMINÉE », « LES PRIMES DE LA SOIRÉE » en lignes, « LE LIEU / OÙ EN EST LA SOIRÉE ») **et une rangée de boutons de vue « TEMPS FORTS / COMPLET » qui chevauche le bas**. La maquette : **trois cartes en haut** (COMBAT DE LA SOIRÉE en grand fond clair, deux PERFORMANCE DE LA SOIRÉE avec leur prime et leur phrase), **un panneau « LA SOIRÉE »** (la salle 8 910 / 9 000, l'ambiance à la fin en pastilles, la recette + primes payées) et en bas les touches « R Tous les résultats · Entrée Le lendemain ». Remplace l'ancien contenu par celui de la maquette ; rien d'autre sur l'écran.
**Soirée en cours.** La maquette : bandeau « LA SALLE 6 840 / 9 000 · L'AMBIANCE (pastilles) · une phrase · ÇA MONTE · LA RECETTE », tableau « LA CARTE » de **neuf lignes numérotées** (rang, catégorie, « X bat Y » ou « X contre Y », méthode, delta) avec **les trois boutons de vue COMPLET / TEMPS FORTS / RÉSULTAT sur chaque ligne à venir**, et à droite le panneau « LE PROCHAIN » (noms en grand, texte de Leïla, « TU LE REGARDES EN », Entrée REGARDER). Le jeu n'a pas ce tableau (il garde la carte d'ouverture en deux colonnes).
**Ouverture.** Vérifie `soireeOuverture` : la maquette ne la montre pas ; garde-la propre (aucun chevauchement).
**Temps forts.** Compare au combat réel en vue « forts » : frise des moments, moment en cours, résumé.

## Cases
**[ ] 1.** Fin de soirée recomposée sur `UniSoireeFin`. **[ ] 2.** Soirée en cours recomposée sur `UniSoiree` (tableau, vues par ligne, panneau Le prochain, bandeau salle). **[ ] 3.** Temps forts alignés sur `UniTempsForts`. **[ ] 4.** Capture et `cmp-…png` à chaque étape ; objectif : `grosBlocs` ≤ 20 %, aucun bloc manquant, aucun chevauchement, aucun texte sous 22 px, tout le mouvement en script (jamais d'animation CSS : décision du 07/10).
**[ ] 5.** Tests : les existants restent verts ; ceux qui décrivaient l'ancienne structure sont **mis à jour en citant la décision** (« planches Uni* validées par Anthony ; l'écran suit la planche ») ; ajoute des tests de présence des blocs et « chaque classe a sa règle ». Les touches du combat (Espace, V, C, P, R, Entrée) et T (temps forts → entier) gardent leur rôle.
**[ ] 6.** `?v=`, versions, lint ; commit final `Monde lot 65 T1 : la soirée fidèle aux planches` ; compte rendu honnête (avant/après `moyen`, `grosBlocs`) ; `TOUT_EST_FINI`.

Règles communes : ne touche ni au moteur de combat (`simulateFight` et ses fichiers), ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- Modifiés : `mgmt-soiree-cadre.js` remplace partiellement l'ancien contenu de fin par des cartes de primes et un résumé de salle/recette ; `ui-cadre.css` donne des styles à ce nouveau balisage ; `index.html` versions actualisées ; `tests/mgmtSoireeShow.test.js` met à jour l'attente sur le lendemain et vérifie les nouveaux blocs.
- Tests : `La soirée en cinq moments — ouverture, entre-deux, attente du principal, avant-combat, fin` mis à jour (décision citée dans le test).
- Migration de sauvegarde : aucune.
- Complément de reprise : `mgmt-soiree-cadre.js` retire désormais l'en-tête SOIRÉE/9 en double à l'état fin ; version `?v=` actualisée dans `index.html`. Test ciblé `node --test tests/mgmtSoireeShow.test.js` : 18/18 ; ESLint ciblé et audit des versions sans erreur.
- Écarts : les cases tableau de soirée en cours et temps forts restent à faire. Captures et comparaisons `cmp-…png` non produites ; `moyen`/`grosBlocs` non mesurés. Le rendu de fin reste partiel (cartes de primes dérivées des traces, pas de construction garantie des trois cartes de la planche). L'outil de capture indiqué dans la fiche n'a pas été accessible depuis l'environnement autorisé, donc aucune mesure visuelle ne peut être avancée honnêtement.
- Questions pour Anthony : aucune question de spécification n'est soulevée ; reprise nécessaire pour compléter et vérifier les cases restantes.
