# Monde lot 11 T1 — Retrait provisoire de l'humanité

## Branche
`monde-humanite-retrait` (branche attendue et courante), partie de `main`.

## Objectif
Décision d'Anthony du 15/10/2026 (voir `docs/HUMANITE-A-REFAIRE.md`) : retirer **pour l'instant** de ce que le joueur voit et de ce qui se déclenche : métiers, milieux, moments de vie, rituels, rôles (leurs libellés), trajectoires. Rien n'est supprimé : un seul interrupteur les coupe, et le remettre à `true` restaure exactement l'état d'avant.

## Ce qui change
1. `mgmt-data.js` : `const MGMT_HUMANITE_ACTIVE=false;` avec un commentaire qui cite la décision.
2. **Fiche** (`mgmt-ecran-fiche.js`, `mgmt-fiche-planche.js`, `mgmt-fiche-cadre.js`) : quand l'interrupteur est faux, aucune ligne ni bloc milieu / ancien métier / rituel / trajectoire / moments de vie (`mgmtFicheVie`) ; la mise en page reste propre (pas de bloc vide, pas de titre orphelin).
3. **Moments de vie** (`mgmt-vie.js`) : aucun moment ne naît quand l'interrupteur est faux (le tirage n'avance pas non plus, pour ne pas décaler les autres flux à graine : vérifie que le flux `vie` est séparé, comme son commentaire le dit) ; aucun relais (marques `mgmt-attention.js`, conteur, semaine, scénarios) n'en affiche.
4. **Rôles** : le CALCUL reste intact (`mgmtRole*` dans `mgmt-attention.js`, utilisé comme critère par `mgmt-raisons.js` et `mgmt-presentation-faits.js`). Seuls les LIBELLÉS du catalogue `MGMT_ROLES` ne s'affichent plus (fiche, vestiaire, mouvement). Une raison ou un fait de présentation qui s'appuie sur un rôle garde son critère mais ne montre pas le mot du catalogue.
5. **Voix** (`mgmt-voix.js`) : le jeton `metier` n'est plus disponible ; une réplique qui l'exige n'est pas choisie.
6. Les surnoms restent affichés (inchangés).

## Sauvegarde
Aucun changement. `MGMT_SAVE_VERSION` inchangée.

## Textes
Aucun texte nouveau.

## Tests
Nouveau fichier `tests/mgmtHumaniteRetrait.test.js` (ajouté à `test` ET `test:watch` de `package.json`) :
1. `Humanité retirée — la fiche ne montre ni milieu, ni ancien métier, ni rituel, ni trajectoire, ni moment de vie`.
2. `Humanité retirée — aucune soirée ne fait naître de moment de vie, et aucune marque n'en vient`.
3. `Humanité retirée — aucun libellé du catalogue des rôles n'apparaît à l'écran, mais les raisons de Leïla fonctionnent toujours`.
4. `Humanité retirée — à graine égale, une partie jouée avec l'interrupteur faux garde les mêmes combats et le même classement qu'avant` (l'humanité ne touchait pas la simulation des combats).
5. `Humanité retirée — l'interrupteur remis à vrai rend la fiche d'avant`.
Les tests existants qui vérifient la présence de ces textes passent par l'interrupteur : ils le mettent à `true` dans leur montage (avec un commentaire qui cite la décision du 15/10/2026), sans changer leurs assertions.

## Vérification
`node --test tests/mgmtHumaniteRetrait.test.js` puis les fichiers de tests des fiches, de la vie, des rôles, des raisons et des voix (cherche-les par grep). `node tools/_bump.js` des fichiers modifiés, `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance).

## Hors périmètre
Supprimer des données ; réécrire un texte ; toucher aux surnoms ; toute autre famille de la relecture.

## Pièges
- Un flux à graine qui n'avance plus peut décaler d'autres tirages : le test 4 le garde.
- Les rôles servent de critère aux raisons (lot 6) et aux faits de présentation (lot 3) : ne coupe que l'affichage.
- Pas de bloc vide ni de titre seul dans la fiche.
