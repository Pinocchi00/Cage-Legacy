# Monde lot 4 T7 — Les styles de l'écran des dossiers

## Branche
`monde-lot-4-dossiers` (branche attendue et courante).

## Objectif
Défaut trouvé par le superviseur : l'écran des dossiers (T4, `mgmt-carte-cadre.js`) produit les classes `mf-dossiers`, `mf-dossier`, `mf-dossier-etapes`, `mf-dossier-id`, `mf-dossier-nav`, `mf-dossier-nom`, `mf-dossier-raison`, `mf-dossier-resume`, mais **aucune règle CSS** ne les dessine : l'écran s'affiche sans mise en page. Le même défaut a été corrigé sur l'écran d'arrivée (lot 10, règles `.mf-arr` dans `ui-cadre.css`) : suis le même modèle.

## Ce qui change
- `ui-cadre.css` : porte les styles des planches VALIDÉES `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html` (leurs styles inline), sous une ancre `MONDE_LOT4_T7_DOSSIERS_CSS`, toutes les règles préfixées par `.mf-dossiers` (aucune classe générique non préfixée). Utilise les jetons `--mf-*` existants.
- `mgmt-carte-cadre.js` : seulement si une balise n'est pas fermée ou si une classe de la planche manque au HTML produit.
- Aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920 (cadre 1920×1080 mis à l'échelle) ; la carte reste visible à côté du dossier comme sur la planche ; on voit qu'il reste des dossiers.

## Tests
Dans `tests/mgmtDossiers.test.js` : `Dossiers — les règles de style de l'écran existent et aucun texte sous 22 px` (les règles `.mf-dossiers .mf-dossier`, `.mf-dossier-raison`, `.mf-dossier-nav` existent dans les feuilles chargées ; tailles calculées ≥ 22 px dans un rendu jsdom, même méthode que `tests/mgmtCadre.test.js`).

## Vérification
`node tools/_bump.js ui-cadre.css` (et les .js touchés), `node tools/verif-versions.js origin/main` (les écarts hérités du lot 6 ne comptent pas, voir `MONDE-LOT-4-DECISIONS.md`), `node --test tests/mgmtDossiers.test.js tests/mgmtCadre.test.js`. Le superviseur compare l'écran aux planches dans le jeu.

## Hors périmètre
Toute logique des piles ; les textes.

## Compte rendu
- `ui-cadre.css` : styles préfixés `.mf-dossiers` pour la navigation, la carte et ses textes ; version CSS montée.
- `index.html`, `sw.js` : versions de cache montées par l’outil de versionnage.
- `tests/mgmtDossiers.test.js` : test « Dossiers — les règles de style de l’écran existent et aucun texte sous 22 px » (règles dans la feuille injectée au jsdom, tailles calculées des textes rendus).
- Migration de sauvegarde : aucune. `mgmt-carte-cadre.js` inchangé.
- Écarts : vérification des versions signale seulement l’écart hérité `mgmt-bureau.js` (`?v=b42xxxxxxxxx` vs origin/main), conforme à l’exception indiquée par la fiche.
- Planches : les fichiers `.html` cités par la fiche sont absents ; références accessibles dans ce dépôt : `maquettes/monde/MondeDossiersCombattant.dc.html` et `maquettes/monde/MondeDossiersAdversaire.dc.html` (également citées par les fiches T4/T6). Aucun contenu ni chemin n’a été inventé.
- Reprise : le contrôle jsdom vérifie désormais les règles de la feuille chargée et les tailles calculées ; `ui-cadre.css` est versionné dans `index.html`, avec SW_VERSION montée par l’outil.
- Vérification locale : `node --test tests/mgmtDossiers.test.js` (30/30) et `node --test tests/mgmtCadre.test.js` (12/12) ; `node tools/verif-versions.js origin/main` ne signale que l’écart hérité `mgmt-bureau.js`. Sous-agents non disponibles ; relecture indépendante non effectuée.
- Questions pour Anthony : confirmer que les planches `.dc.html` accessibles satisfont les références `.html` de cette fiche.
