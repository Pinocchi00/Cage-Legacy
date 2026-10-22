# Monde lot 26 T2 — audit du 16/10 : le tri du vestiaire et l'échelle des contrats

Branche : `monde-lot-26-audit` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; un test existant n'est réécrit que pour une décision citée (audit du 16/10/2026, lignes E110, E61) ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; `MGMT_SAVE_VERSION` ne change pas ; **lance les tests UN FICHIER À LA FOIS**, jamais `npm run check` en entier ; si un test reste rouge, commite avec « (inachevé) » et décris le blocage.
**Tu ne t'arrêtes pas au premier obstacle ; tu ne rends « inachevé » qu'après avoir réellement essayé.**

## 1. E110 — le tri du vestiaire est incompréhensible
`mgmt-ecran-vestiaire.js` ligne ~46 : `out.sort((a,b)=>poids(b)-poids(a)||divs.indexOf(a.f.div)-divs.indexOf(b.f.div)||a.f.name.localeCompare(b.f.name,'fr'))` — la liste commence par un poids lourd puis passe aux mouches, dans l'ordre alphabétique des prénoms. Lis la fonction entière et ce que vaut `poids` (probablement « quelque chose à dire » / lien). Règle voulue : d'abord ceux qui ont quelque chose à dire (comme aujourd'hui), puis **par catégorie dans l'ordre de la barre (mouche → lourd, hommes puis femmes), puis par rang dans leur catégorie** (`mgmtRangAffichable`), jamais par prénom. Garde le tri stable et déterministe.

## 2. E61 — la colonne « Contrat » du tableau des contrats dessine des barres sans échelle
`mgmt-contrats-ecran.js` (`mgmtContratsPips` ~ligne 55 et le rendu du tableau) : la colonne montre N barres selon les combats restants (8 pour l'un, 4 pour l'autre), sans légende. Ajoute dans l'en-tête de la colonne (ou en légende en bas du tableau, dans le style existant) la mention « 1 barre = 1 combat au contrat » ; ne change ni les barres ni leur nombre.

## Tests (nouveau `tests/mgmtLot26T2.test.js`, à inscrire dans `test` et `test:watch` de `package.json`)
(1) Sur une partie `mgmtDefault('split')` + `mgmtNewRoster(m)` (graine `setSeed(20261008)`), le vestiaire trié place tous les combattants sans « quelque chose à dire » dans l'ordre catégorie puis rang (vérifie sur la liste que l'ordre des catégories est monotone) ; (2) l'écran des contrats contient « 1 barre = 1 combat au contrat ».

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 26 T2 : tri du vestiaire et échelle des contrats` (le numéro T2 est obligatoire dans le message).

## Compte rendu
- `mgmt-ecran-vestiaire.js` : tri après priorité existante, catégorie puis rang affichable ; version cache montée.
- `mgmt-contrats-ecran.js` : légende explicite dans l'en-tête Contrat ; version cache montée.
- `tests/mgmtLot26T2.test.js` : tests « Monde lot 26 T2 — vestiaire trié par catégorie puis rang » et « Monde lot 26 T2 — les contrats expliquent l’échelle des barres ».
- `package.json` : commande `test:monde26t2` ajoutée.
- Tests existants adaptés : aucun. Migration de sauvegarde : aucune.
- Reprise après relecture : `tests/mgmtLot26T2.test.js` est inscrit dans `test` et `test:watch` ; le test filtre les combattants sans signe (« quelque chose à dire ») et vérifie l'ordre catégorie puis rang.
- Questions pour Anthony : aucune.
