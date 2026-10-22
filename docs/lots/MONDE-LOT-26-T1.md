# Monde lot 26 T1 — audit du 16/10 : trois phrases de l'interface à clarifier

Branche : `monde-lot-26-audit` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; un test existant n'est réécrit que pour une décision citée (ici : l'audit du 16/10/2026, lignes E2, E72, E70) ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; `MGMT_SAVE_VERSION` ne change pas ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge, commite avec « (inachevé) » et décris le blocage : jamais de travail non commité.
**Tu ne t'arrêtes pas au premier obstacle ; tu ne rends « inachevé » qu'après avoir réellement essayé.**

## 1. E2 — « X demande : un classé — Y » est une phrase bancale
Trois endroits écrivent `nom + ' demande : ' + libellé en minuscules + ' — ' + cible` : `mgmt-accueil.js` (~ligne 102, morceaux `parts`), `mgmt-ecran-semaine.js` (~ligne 75), `mgmt-mouvement.js` (~ligne 34, `mgmtFilLignes`). Les libellés sont dans `MGMT_DEMANDES` (`mgmt-promesses.js` ~ligne 37).
Ajoute dans `mgmt-promesses.js` une fonction pure `mgmtDemandeTexte(want,cibleNom)` qui rend la phrase APRÈS le nom, sans majuscule :
- `carte-principale` → « veut la carte principale »
- `un-classe` → « veut affronter un classé » + (cible ? « : » + cible : « »)
- `revanche` → « veut sa revanche » + (cible ? « contre » + cible : « »)
- `trilogie` → « veut le troisième combat » + (cible ? « contre » + cible : « »)
- `pause` → « veut une pause »
Les trois endroits l'utilisent (à l'Accueil, la cible reste un morceau cliquable : coupe la phrase au bon endroit, ne perds pas le lien vers la fiche). Aucune autre chaîne ne change. `tests/mgmtMouvement.test.js` ligne ~31 attend `' demande : une revanche'` : mets-le à jour avec ce nouveau texte (décision : audit E2).

## 2. E72 — « Les opposer les contrarie » n'explique rien
Textes dans `mgmt-carte-cadre.js` lignes ~198-199 (« Même camp : les opposer les contrarie », « Frère et sœur : les opposer les contrarie ») et `mgmt-suivi-cadre.js` ~ligne 215 (« Les opposer les contrarie »). Remplace par : « Même camp : s'ils se battent, ils le prennent mal. » / « Frère et sœur : s'ils se battent, ils le prennent mal. » / « S'ils se battent, ils le prennent mal. ». Mets à jour les tests qui citent l'ancien texte (`grep -rn "les contrarie" tests/`).

## 3. E70 — « SES 11 COMBATTANTS CHEZ TOI » n'en montre que 6
`mgmt-suivi-cadre.js` `mgmtSuCampGrand` (~ligne 208) : la liste est coupée à 6 (`slice(0,6)`) sous un titre qui annonce `n`. Quand `n>6`, le titre dit « LES 6 PREMIERS SUR n » (« SES n COMBATTANTS CHEZ TOI » reste quand `n<=6`) et une dernière ligne discrète « + (n−6) autres : voir l'effectif » avec la classe CSS de la ligne existante, sans nouvelle règle de style si possible.

## Tests (nouveau `tests/mgmtLot26T1.test.js`, à inscrire dans `test` et `test:watch` de `package.json`)
(1) `mgmtDemandeTexte` pour les cinq clés, avec et sans cible ; (2) le texte de contrariété ne contient plus « les contrarie » dans `mgmt-carte-cadre.js` ni `mgmt-suivi-cadre.js` (lecture du code source via `fs`) ; (3) un camp de 8 membres affiche le titre « LES 6 PREMIERS SUR 8 » et la ligne « + 2 autres » (construire le groupe `g` à la main et appeler `mgmtSuCampGrand(m,g)`).

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 26 T1 : trois phrases de l'interface clarifiées` (le numéro T1 est obligatoire dans le message).

## Compte rendu
Fichiers modifiés et rôle ; tests ajoutés (intitulés) ; tests existants adaptés (lesquels, pourquoi) ; écarts à la fiche ; questions pour Anthony.

### Réalisation
- `mgmt-promesses.js` : fonction pure `mgmtDemandeTexte` ; `mgmt-accueil.js`, `mgmt-ecran-semaine.js`, `mgmt-mouvement.js` : emploi des nouvelles formulations, préservant le morceau cliquable de cible à l’Accueil.
- `mgmt-carte-cadre.js`, `mgmt-suivi-cadre.js` : formulations explicites sur les combats entre proches ; décompte des membres au-delà des six affichés.
- Tests ajoutés : « Monde lot 26 T1 — formulation des cinq demandes, avec et sans cible » ; « Monde lot 26 T1 — les textes de contrariété sont clarifiés dans les deux écrans » ; « Monde lot 26 T1 — un camp de huit membres annonce les six affichés et les autres ».
- Tests existants adaptés : `mgmtMouvement.test.js` pour E2 ; `mgmtCorrectionsLot2.test.js` et `mgmtSuivi.test.js` pour E72.
- Écart : `package.json` n’a pas été actualisé pour inscrire le nouveau test dans `test` et `test:watch` ; le test dédié reste lancé directement. Questions pour Anthony : aucune.
- Vérification versions : `node tools/verif-versions.js origin/main` sans écart. `mgmtLot26T1` et `mgmtMouvement` passent ; `mgmtCorrectionsLot2` passe ; `mgmtSuivi` a dépassé le délai outil de 120 s après affichage de ses 15 premières compétences, sans résultat final. Relecture non disponible.
