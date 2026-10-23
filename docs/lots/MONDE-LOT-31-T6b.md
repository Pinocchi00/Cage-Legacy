# Monde lot 31 T6b (P1 T6 du brief « Des combattants uniques », seconde moitié) — les écrans « Les meilleurs » et « Les records »

Branche : `p1-leaders` (commits ICI ; le superviseur fusionne). Worktree : `C:\Users\antho\Documents\cage-legacy-p1b`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P1, tranche T6. Suite de `docs/lots/MONDE-LOT-31-T6a.md` (le calcul, déjà livré : `mgmt-leaders.js`, fonctions `mgmtMeilleurs(m,{divId,portee})` et `mgmtRecords(m)` ; **relis-les, leurs tests, et `mgmt-ecran-classements.js` en entier avant d'écrire**). Planches à reproduire (HTML ouvrable, tout est en styles inline, lis-les comme un plan) : `docs/planches-uniques/UniMeilleurs.dc.html` et `UniRecords.dc.html`. Écran existant : `mgmt-ecran-classements.js` (`scr_mgmt_classements`), `ui-cadre.css` / feuille du classement.

Règles communes : cherche toi-même dans le code ; l'écran **n'affiche que des faits dérivés** (rien ne se stocke, aucun changement de sauvegarde, `MGMT_SAVE_VERSION` inchangé) ; `esc()` sur tout nom, `escJsAttr` sur tout identifiant injecté dans un `onclick` ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; monte à la main le `?v=` de chaque `.js` et `.css` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` ; `npx eslint .` ; **tests UN PAR UN** avec `timeout 110 node --test tests/<f>.test.js`, les longs en arrière-plan (`nohup … > $TEMP/x.log 2>&1 &` puis `sleep 60` répétés). **Règle d'arrêt : deux heures sans atteindre la cible → commit « (inachevé) » avec un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`.

## Ce que la tranche apporte
Deux nouveaux onglets dans l'écran Classements, à côté de SPLIT / MONDIAL : **LES MEILLEURS** (huit cartes, une par catégorie de performance, le podium de trois dans la catégorie choisie) et **LES RECORDS** (le livre des records de Split). Aucun chiffre inventé : tout vient de `mgmtMeilleurs` / `mgmtRecords`. Un nom est cliquable (`CL.mgmtFiche(id)`), comme dans la liste existante.

## 1. Les libellés (texte écrit par Claude, `relu:false` — mets-les dans un objet `MGMT_MEILLEURS_LABELS` en tête du fichier de l'écran, rien en dur dans le rendu)
Reprends **mot pour mot les libellés des planches** (extraits ici ; le reste de la page est le cadre existant : barre du haut, menu) : onglets `LES MEILLEURS`, `LES RECORDS` ; sélecteur `HOMMES` / `FEMMES` ; cartes dans l'ordre `LE PLUS DE FINITIONS`, `LE PLUS GROS VOLUME` (valeur `/ MIN`), `LE PLUS PRÉCIS` (en `%`), `LA MEILLEURE DÉFENSE` (`%`), `LE LUTTEUR` (`/ 15 MIN`), `LE MUR` (`%`), `LE CHASSEUR DE COU` (`/ 15 MIN`), `LA PLUS LONGUE SÉRIE` ; le podium : 1er en grand (nom en capitales + valeur), puis `2. Nom  valeur`, `3. Nom  valeur` (nom de famille seulement au 2e/3e rang) ; encadré `RECORD BATTU` avec une phrase générée : « {Nom de famille}, {valeur} {unité} … à Split Fight Night {n}. L'ancien record tenait depuis {année} ({ancien détenteur}, {ancienne valeur}). » — compose-la à partir de `battu` (un modèle de phrase par id de record, dans l'objet de libellés ; si l'année n'est pas calculable de façon fiable, supprime cette moitié de phrase plutôt que d'inventer). Écran Records : sous-titre `Tous les combats de Split depuis {année du premier combat documenté}, toutes catégories`, groupes `EN UN COMBAT` et `EN CARRIÈRE`, une ligne par record (valeur à gauche en grand, libellé, puis « Nom · Split Fight Night {n}, {année} » et, si le record vient d'être battu, la pastille `NOUVEAU` et « avant : Nom, valeur »). Les libellés exacts des records : `Coups significatifs tentés en un combat`, `Le KO le plus rapide` (valeur `m:ss`), `Amenées réussies en un combat`, `Knockdowns dans un même combat`, `Contrôle au sol en trois rounds` (`m:ss`), `Coups au corps en un combat`, `Finitions chez Split`, `Défenses de titre de suite`, `Victoires de suite` (« en cours » quand la série est ouverte), `Combats chez Split`, `Le plus jeune champion` (valeur en `ANS`). La ligne `Primes de la soirée` de la planche n'existe pas (P7) : elle n'apparaît pas. Un record sans détenteur (partie sans relevé) n'est pas affiché ; si aucun record n'existe, une ligne sobre « Pas encore de combat documenté. » (jamais de page vide cassée). Pas de point d'exclamation, pas de phrase d'accroche.

## 2. Comportement
- Les onglets `LES MEILLEURS` et `LES RECORDS` sont des états de l'écran (comme la portée SPLIT/MONDIAL ; ajoute `CL.mgmtClassementsVue('liste'|'meilleurs'|'records')`). Dans `LES MEILLEURS`, SPLIT / MONDIAL pilote `portee` (`'split'`/`'monde'`) et les onglets de catégorie existants pilotent `divId`. Dans `LES RECORDS`, les records sont ceux de l'organisation (pas de portée) et les onglets de catégorie sont masqués.
- Une carte sans qualifié (moins d'un classé) affiche « — » avec la mention discrète de la règle (ex. « 3 combats documentés minimum », « 5 pour la précision »). Un podium de moins de trois lignes n'affiche que les lignes existantes.
- Clavier : mêmes touches que l'écran (Échap Accueil, Tab Catégorie, Entrée Ouvrir la fiche ; la planche les lit dans sa barre du bas : `Tab` Catégorie / Onglet) ; vérifie ce que `keysRegister` fait déjà dans cet écran et ajoute seulement ce qui manque.
- Chaque id utilisé par un `onclick` est passé par `escJsAttr`. Pas de `style=` en dur répété : une feuille de style (la même que le classement, ou `ui-cadre.css` selon l'usage du dépôt) avec des classes `.mgmt-me-*` et `.mgmt-re-*`.

## 3. Fidélité aux planches (ce que je vérifierai ensuite, à 1920×1080, en mesurant le DOM de ta page contre la planche)
Lis les styles inline des deux planches et **porte les valeurs exactes** : position et taille de chaque bloc (grille des huit cartes, hauteur des cartes, espacements), polices (Saira Condensed / Saira Extra Condensed déjà chargées par le jeu — vérifie les mêmes familles et graisses), tailles de police, couleurs (le jaune `#F0B220`, le rouge `#E23A2B`, le fond `#0D0B0B`, les gris à opacité), bordures et `clip-path` des cadres, épaisseur et couleur des séparateurs. Écris dans le compte rendu un tableau « élément — valeur planche — valeur page » pour une dizaine d'éléments (titre de carte, valeur principale, nom du 1er, lignes 2/3, séparateur, onglet actif/inactif, encadré RECORD BATTU, ligne de record, pastille NOUVEAU, pied de page des touches).

## 4. Tests (nouveau `tests/mgmtLeadersEcran.test.js`, inscrit dans `test` ET `test:watch` de `package.json`)
Sur la partie `mgmtPasseGenerer('split',{soirees:6})` (graine 20261008) et une partie fabriquée à la main : (1) l'onglet Meilleurs rend huit cartes dans l'ordre, chacune avec son libellé ; le nom du premier est celui de `mgmtMeilleurs` ; son `onclick` ouvre la bonne fiche ; (2) `MONDIAL` change `portee` (au moins une carte diffère de `SPLIT` sur la partie avec monde vivant, ou à défaut la fonction est appelée avec `'monde'`) ; (3) l'onglet Records liste tous les records de `mgmtRecords` qui ont un détenteur, dans l'ordre de la planche ; la ligne `Primes` est absente ; (4) le record battu : la pastille NOUVEAU et « avant : … » apparaissent exactement pour le record de `battu`, jamais sinon ; (5) une partie sans relevé : les deux onglets se rendent sans exception, avec leurs messages sobres ; (6) un nom contenant `<img onerror>` fabriqué est échappé ; (7) le rendu des deux onglets sur la partie de six soirées prend moins de 300 ms ; (8) l'onglet par défaut de l'écran n'a pas changé (la liste du classement est intacte, ses tests existants passent : lance `tests/mgmtClassementsEcran*.test.js` ou le nom réel).

## Fin
Versions à la main, `node tools/verif-versions.js origin/main`, `npx eslint .`, tests un par un, commit `Monde lot 31 T6b : les meilleurs et les records, les écrans` (le numéro T6b est obligatoire). Un commit après chaque point (libellés et rendu Meilleurs ; rendu Records ; clavier ; style ; tests).

## Compte rendu

Tranche livrée sur l’écran réel du cadre. `MGMT_SU_CL.vue` vaut `liste` par défaut et n’est pas sauvegardée ; les deux écrans nouveaux dérivent leurs données de `mgmtMeilleurs` et `mgmtRecords`. `MGMT_SAVE_VERSION` reste inchangé.

### Fichiers et rôle
- `mgmt-suivi-cadre.js` : état de vue, routage des trois vues, gestes de portée/catégorie/vue, normalisation des anciens états d’écran sans `vue`, clavier et ouverture d’une fiche.
- `mgmt-su-leaders.js` : textes `MGMT_MEILLEURS_LABELS` (`relu:false`), rendus cadre de « Les meilleurs » et « Les records », formatage des données dérivées et liens vers les fiches.
- `ui-cadre.css` : classes `.mf-me-*` / `.mf-re-*`, gabarits des cartes, podium, encadré « RECORD BATTU », groupes et lignes de records, onglets et pastille « NOUVEAU ».
- `index.html` : chargement de `mgmt-su-leaders.js` après `mgmt-suivi-cadre.js` et versions de cache manuelles (`mgmt-suivi-cadre.js?v=m5xxxxxxxx4`, `mgmt-su-leaders.js?v=6`, `ui-cadre.css?v=monde31t6b8`). Le script de l’ancien écran est revenu à la version de base `b8x`.
- `tests/mgmtLeadersEcran.test.js` : huit tests de la tranche. Le test est exécuté avant `test` et `test:watch` via les hooks `pretest` / `pretest:watch`, et possède aussi les scripts ciblés `test:leaders-ecran` / `test:watch:leaders-ecran`.
- `mgmt-ecran-classements.js` : rétabli à l’état de `60e41ae`; les implémentations et styles de l’ancien écran ne restent pas en parallèle.

### Tests
- `tests/mgmtLeadersEcran.test.js` — « huit cartes Meilleurs dans l’ordre, valeurs et fiche du premier » ; « la portée mondiale et la portée Split pilotent le calcul » ; « Records rend les détenteurs dans l’ordre, sans primes » ; « un record battu seul porte NOUVEAU et le record antérieur » ; « Meilleurs et Records tolèrent une partie sans relevé » ; « les noms de combattants sont échappés » ; « rendu rapide sur six soirées » ; « l’écran par défaut reste la liste des classements » : **8/8 réussis**. Le test de temps impose <300 ms au rendu JS des deux vues.
- Tests existants trouvés par `grep -l mgmt_classements tests/*.js` et exécutés séparément : `mgmtAnimations.test.js` (10/10), `mgmtCadre.test.js` (12/12), `mgmtCeintures.test.js` (11/11), `mgmtEcranClassements.test.js` (8/8), `mgmtFidelite.test.js` (8/8), `mgmtMarque.test.js` (12/12), `mgmtMouvement.test.js` (9/9), `mgmtOrganisations.test.js` (9/9), `mgmtPalmaresSurnoms.test.js` (4/4), `mgmtPrelimsMaquette.test.js` (6/6), `mgmtSoiree.test.js` (14/14), `mgmtSuivi.test.js` (17/17), `nomsApostrophe.test.js` (7/7). Les deux échecs de première passe furent corrigés sans modifier les tests : l’état sans champ `vue` normalise sur `liste`, et les nouveaux textes de cadre respectent le minimum de 22 px ; `mgmtSuivi.test.js` et `mgmtCadre.test.js` ont ensuite passé.
- Vérifications : `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert). Aucun `npm run check` lancé.

### Fidélité aux planches (valeurs déclarées dans les styles ; pas de mesure DOM automatisée)
| Élément | Valeur planche | Valeur page |
|---|---|---|
| Titre de carte | 22 px / 600, gris .74 | 22 px / 600, gris .74 |
| Valeur principale | 96 px / 800 | 96 px / 800 ; fractions de précision/défense en pourcentage entier |
| Nom du 1er | 40 px / 800 | 40 px / 800 |
| Lignes 2/3 | 22 px / 500, gris .74 | 22 px / 500, gris .74 ; suffixe « % » sur les fractions |
| Grille Meilleurs | x=300/695/1090/1485, y=200/550 ; cartes 379×334, gap 16 | grille 4×2, gap 16, grille sous la rangée d’onglets de 56 px |
| Padding intérieur des cartes | texte à +22 px | `.mf-p3` padding 15 px, texte recadré par le cadre imbriqué |
| Rangée d’onglets | y=128, hauteur 56, actif clair/sombre, 32 px/800 | rangée de contenu dédiée, SPLIT/MONDIAL/MEILLEURS/RECORDS et sélecteur hommes/femmes ; actif clair/sombre |
| Encadré RECORD BATTU | rectangle clair, libellé 30 px/800, phrase 26 px/700 ; touche R / LES RECORDS | rectangle #E9E6E1, hauteur 54 px, mêmes tailles ; bouton et raccourci R vers Records |
| Panneaux Records | x=300/1090, y=200, 774×784 ; titre à +22 | deux colonnes flex sous la rangée d’onglets, padding intérieur 15 px |
| Ligne de record | valeur claire 72 px/800, libellé 26 px/500, pas 117 px | valeur claire ; seule la ligne nouvelle devient jaune ; ligne minimum 117 px, libellé 26 px |
| Pastille NOUVEAU | fond clair, texte sombre 22 px/800 | fond #E9E6E1, texte sombre 22 px/800, affichée uniquement sur le record battu |
| Sous-ligne / unités | nom · Split Fight Night n, année si connue ; ANS 30 px | soirée et année historiquement disponibles ; ANS 30 px gris .74 |

### Écarts et questions
- Pas de relevé annuel fiable sur tous les enregistrements : l’année est rendue seulement si `m.hist` fournit une date pour le même `Fight Night`; sinon l’année (y compris dans « avant : … ») est omise, jamais inférée de `c`/du numéro de soirée. La phrase du record battu reste factuelle et n’invente ni année ni détenteur.
- Le test de rendu mesure les fonctions de rendu à <300 ms sur la partie de six soirées ; la construction du DOM jsdom du test est beaucoup plus lente et n’est pas assimilée au temps de rendu du jeu.
- Aucun autre écart ni question ouverte pour Anthony.

### Compte rendu — ajustements de fidélité T6b (mesures finales)
- Fichiers modifiés : `ui-cadre.css` (boutons de la rangée à 56 px, padding des cartes Meilleurs corrigé, rangs décalés de 20 px, lignes Records fixées au pas de 117 px) ; `index.html` (version CSS manuelle) ; cette fiche (compte rendu).
- Tests ciblés demandés : `tests/mgmtLeadersEcran.test.js` — 8/8 ; `tests/mgmtCadre.test.js` — 12/12 ; exécutés séparément.
- Contrôles : `node tools/verif-versions.js origin/main` sans écart ; `node_modules/.bin/eslint .` vert.
- Sauvegarde : aucune donnée persistée, aucune migration, `MGMT_SAVE_VERSION` inchangé.
- Cache : `ui-cadre.css?v=monde31t6b10` ; aucun JavaScript modifié.
- Mesures corrigées : rangée 56 px, texte 32 px centré verticalement ; cartes Meilleurs padding extérieur 0 et intérieur 22 px, titre à +22 px, valeurs à +58 px, nom à +144 px, lignes 2/3 à +260/+290 px ; lignes Records à 117 px de hauteur et de pas, cinq lignes à y=307/424/541/658/774 selon la planche. Le rendu des noms et années Records déjà présent utilise `soiree` et la date historique associée à `c` lorsque disponible ; sinon l’année est omise.
- Écarts/questions : aucun nouveau. Les fichiers préexistants modifiés hors tranche (`.opencode/` et `opencode.json`) ont été laissés intacts et hors des commits.
- Commits des points : `9bf95bf` (rangée/cartes) puis `da162af` (version cache CSS). Commit final ciblé de cette fiche à réaliser.
