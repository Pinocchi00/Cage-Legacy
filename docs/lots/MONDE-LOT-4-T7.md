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
