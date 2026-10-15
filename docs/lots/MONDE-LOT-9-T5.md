# Monde lot 9 T5 — le classement mondial des combattants

## Branche

`monde-lot-9-monde` — branche courante : `monde-lot-9-monde`.

## Objectif

Faire du classement mondial par catégorie la liste commune et cohérente de tous les combattants de toutes les organisations, et afficher le même rang sur la fiche du combattant.

Phrase fondatrice (brief, § Lot 9, T5) : « Le classement mondial des combattants. Par catégorie, toutes organisations confondues, dans la section Classements. Le rang mondial de chacun se lit aussi sur sa fiche. Il existe déjà sous une forme calculée ; il devient un vrai classement. »

## Ce qui existe

- `mgmt-carte.js:673-716` porte `mgmtDivisionRankingCalcule(m,divId,scope,cycle)` : calcul pur par catégorie ; `scope: 'world'` réunit Split et extérieur, y compris les organisations vivantes si `m.mondeVivant===true`.
- `mgmt-carte.js:771-790` porte `mgmtDivisionRanking(m,divId,scope,cycle)` : lecture mémoïsée de ce classement ; utiliser cette API, ne pas réimplémenter le tri. `mgmtDivisionRank(m,f,scope)` (l.724-731) donne le rang positionnel d'un combattant.
- La T1 a rendu le calcul déterministe et mémoïsé ; ses tests d'équivalence et d'invalidation sont dans `tests/mgmtClassementsMemoire.test.js` et `tests/mgmtClassementsCycle.test.js`.
- `mgmt-ecran-classements.js:230-250` lit déjà `mgmtDivisionRanking(...,'world')` pour la liste de la portée mondiale ; le rendu existant donne rang, combattant, bilan, organisation et tendance. La maquette d'écran existante est `maquettes/07-classements.html`.
- `mgmt-ecran-fiche.js:265-277` porte `scr_mgmt_fiche()` et lit `mgmtFicheSituation(m,f,'world')` pour le rang mondial affiché. La fiche du combattant peut être ouverte depuis la liste, y compris pour un combattant extérieur.
- T2c garantit que l'effectif vivant alimente le classement mondial : test existant `tests/mgmtMondeVivant.test.js`, « Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial ».

## Ce qui change

- `mgmt-carte.js` : préserver l'API et la loi du classement ; intégrer au classement mondial les combattants stockés des huit organisations via le chemin T2 déjà présent, sans doublonner les lignes extérieures ni les combattants de Split.
- `mgmt-ecran-classements.js` : dans la portée « Mondial », s'assurer que chaque catégorie présente le classement commun des huit organisations et que le rang rendu est la position de la ligne dans cette liste. La portée « Split » reste limitée à Split.
- `mgmt-ecran-fiche.js` et/ou son helper `mgmtFicheSituation` si nécessaire : afficher le rang mondial du même combattant, calculé depuis la même liste `mgmtDivisionRanking(m,f.div,'world')`. Ne pas créer un second calcul.
- Toute fonction nouvelle reçoit un JSDoc décrivant paramètres, valeur de retour et caractère dérivé/pur. Pas de nouvelle fonction à créer si les API ci-dessus suffisent.
- `index.html`/`sw.js` : monter les versions uniquement si les fichiers de script/cache sont modifiés, en utilisant l'outil de versionnement prescrit.

## Sauvegarde

Non. Le rang est dérivé de l'effectif et de l'historique ; aucun champ de rang n'est persisté et aucune migration ni modification de `MGMT_SAVE_VERSION` n'est attendue.

## Textes

Aucun.

## Écran

`maquettes/07-classements.html` — maquette validée de la section Classements. Rester dans les valeurs et l'organisation existantes ; aucune nouvelle planche ni refonte visuelle.

## Tests

- `tests/mgmtMondeVivant.test.js` : « Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial » (non-régression).
- `tests/mgmtEcranClassements.test.js` : ajouter « Monde lot 9 T5 — le mondial classe les huit organisations ensemble par catégorie » : sur une vraie partie avec `mondeVivant:true`, pour chaque catégorie, les identifiants affichés en portée mondiale égalent dans le même ordre `mgmtDivisionRanking(m,div,'world')`, et comprennent les combattants des huit organisations effectivement présents dans le classement ; la portée Split égale `mgmtDivisionRanking(m,div,'organization')`.
- `tests/mgmtEcranClassements.test.js` : ajouter « Monde lot 9 T5 — le rang mondial de la liste est celui de la fiche » : pour un combattant vivant de chaque organisation présente dans une catégorie de graine fixe, la position (1-based) de son id dans le classement mondial est égale à `mgmtFicheSituation(m,f,'world')` et au rang lu sur la fiche.
- `tests/mgmtEcranClassements.test.js` : ajouter « Monde lot 9 T5 — le classement mondial est déterministe à graine égale » : deux parties créées avec la même graine produisent les mêmes identifiants ordonnés dans chaque catégorie.
- Assertions complémentaires de non-régression : aucun identifiant du classement mondial n'apparaît deux fois ; les rangs rendus sont exactement 1..N sans trou ; combattant absent/retiré n'obtient pas de rang vivant.

## Vérification

- Tests ciblés : `node --test --test-name-pattern="Monde lot 9 T5|T2c" tests/mgmtMondeVivant.test.js tests/mgmtEcranClassements.test.js` (délai 120 s).
- Pas d'outil de mesure demandé. Critère de fin : zéro divergence entre liste et rang de fiche sur les cas testés, huit organisations représentées parmi les lignes vivantes quand elles ont des combattants dans la catégorie, zéro doublon et tests ciblés verts ; puis `npm run check:rapide`.

## Hors périmètre

Classement des organisations T4, formules des niveaux T3, staff T6-T9, carrière T10, écran d'organisation T11, sauvegarde, modification de la loi de classement historique, et changement de présentation autre que l'affichage déjà prévu du rang mondial.

## Pièges

- L'API `mgmtDivisionRanking` est mémoïsée : toute mutation pertinente doit suivre les invalidations existantes (`mgmtRangsInvalider`). Ne contourne pas le cache et ne conserve pas une liste calculée entre cycles.
- `mgmtDivisionRanking` attend une portée explicite `'world'` ou `'organization'` ; omettre la portée conserve le comportement historique Split seulement.
- T2c a déjà introduit les organisations vivantes dans la portée mondiale. N'ajoute pas une seconde voie qui les concatène à nouveau ; inspecter les lignes 703-712 de `mgmt-carte.js`.
- Le classement au cycle explicite sert les comparaisons de tendance et exclut les résultats du cycle lu selon la loi existante. Ne change pas cette sémantique.
- La fiche passe par `mgmtFicheSituation` ; vérifier son helper avant toute modification pour éviter de confondre libellé, rang mondial et rang de Split.
- Le chargement des scripts dans `index.html` est fragile ; si un fichier est créé, vérifier son ordre et le harnais. Aucun `Math.random()`.

## Questions pour Anthony

Aucune : le brief fixe la portée, le classement par catégorie et l'affichage du rang sur la fiche ; les API et la planche Classements existent.
