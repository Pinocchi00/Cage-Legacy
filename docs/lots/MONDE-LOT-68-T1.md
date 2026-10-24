# Monde lot 68 T1 — fidélité aux maquettes : la fiche du combattant, l'arrivée (contrat et espoirs), le recruteur, la semaine du combat, le relevé et le menu

Branche : `fid-fiches` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Les maquettes (`docs/planches-uniques/Uni*.dc.html`) sont validées par Anthony : l'écran du jeu doit leur ressembler.** Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` : l'outil capture ton écran à 1920×1080 et le compare à la maquette (`cmp-<écran>.png` : jeu à gauche, maquette à droite). **Utilise-le après chaque étape et OUVRE l'image : les nombres seuls ne suffisent pas.**

Écrans de ta tranche (planches) : `fiche` (`UniFicheStats`, `UniFicheApercu`), les deux étapes d'**arrivée** (`UniArriveeContrat`, `UniArriveeEspoirs`), `recruteur` et `retours` (`UniRecruteurMission`, `UniRecruteurRetour`), `semaine` (`UniSemaine`), le relevé d'un combat (`UniReleve`), le menu principal (`UniMenu`), les chiffres du combat (`UniCombatChiffres`), les classements (`UniMeilleurs`, `UniRecords`). **Plusieurs n'ont pas de scène de capture : écris-les toi-même** (copie le dossier `shoot` dans le tien, ajoute les scènes à `screens.js` : l'écran d'arrivée s'obtient en créant une partie par le chemin réel du jeu — cherche `mgmtNouvelle`, `mgmt_arrivee`, `mgmt_espoirs_arrivee` ; la fiche : `CL.mgmtFiche(id)` puis l'onglet voulu ; le menu : l'écran titre).

## Méthode
Pour chaque écran : capture → ouvre `cmp-…png` → liste les écarts (bloc manquant, texte absent, ordre, tailles, couleurs, chevauchement, texte < 22 px) → corrige → recapture. **Ne passe à l'écran suivant que lorsque l'écran ressemble à sa planche** (les données peuvent différer ; la structure, les textes fixes, les tailles et les couleurs non). Ne touche pas aux écrans déjà repris par d'autres lots en parallèle : Accueil/Actualités (lot 64), soirée/fin de soirée/temps forts (65), lendemain (66), page Organisation/guerre/cérémonie/croissance/poste/carnet/bilan (67), discours (59, fait).

## Cases
**[ ] 1.** Fiche du combattant (Aperçu + Statistiques). **[ ] 2.** Arrivée (contrat, espoirs). **[ ] 3.** Recruteur (mission, retours). **[ ] 4.** Semaine du combat. **[ ] 5.** Relevé, chiffres du combat, menu, classements (meilleurs, records) : ceux que tu peux capturer.
**[ ] 6.** Tests : les existants restent verts ; ceux qui décrivaient l'ancienne structure sont **mis à jour en citant la décision** (« planches Uni* validées par Anthony ; l'écran suit la planche ») ; ajoute des tests de présence des blocs et « chaque classe a sa règle ».
**[ ] 7.** `?v=`, versions, lint ; commit final `Monde lot 68 T1 : les fiches et l'arrivée fidèles aux planches` ; compte rendu honnête (**liste, écran par écran, ce qui reste différent**) ; `TOUT_EST_FINI`.

## Compte rendu

- `ui-cadre.css` : remplacement des sélecteurs `:nth-child` de colonnes de l'aperçu de la fiche par des sélecteurs adjacents explicites ; version `?v=` montée.
- `tests/mgmtFicheStats.test.js` : test « Monde lot 68 T1 — colonnes de l’aperçu explicites, sans position nth-of-type ».
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : vert (9 tests). `node tools/verif-versions.js origin/main` : aucun écart.
- Écrans : aucun écran de cette tranche n'a été validé par capture visuelle au cours de ce travail. Fiche Aperçu/Statistiques : seule la règle de placement des colonnes a été modifiée, fidélité à la planche non vérifiée. Arrivée contrat/espoirs, Recruteur mission/retours, Semaine, Relevé, chiffres du combat, Menu, Meilleurs et Records : non traités.
- Écart / limite : à la reprise, la lecture demandée de `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` a de nouveau été refusée par les permissions du workspace ; impossible de réaliser les captures et d'ouvrir les comparatifs prescrits. J'ai pu lire les planches HTML du dépôt et relancer les tests de fiche, mais je n'ai pas prétendu que cela remplaçait la validation visuelle.
- Tests ajoutés : aucun nouveau fichier ; test ajouté au fichier existant ci-dessus (déjà inclus dans les scripts de test du dépôt).
- Migration de sauvegarde : aucune.
- Questions pour Anthony : aucune ; les vérifications visuelles restantes sont des travaux à effectuer, pas des questions de spécification.

### Reprise du 24/10/2026

- Historique examiné : `be1535a` (colonnes explicites de la fiche) et `afc4bb8` (fiche) sont déjà committés. Aucun changement non committé de cette tranche n'était présent ; les modifications visibles dans `.opencode/agents/*` et `opencode.json` sont hors tranche et n'ont pas été ajoutées.
- Vérifications relancées : `node --test tests/mgmtFicheStats.test.js` (9/9 verts) et `node tools/verif-versions.js origin/main` (aucun écart).
- Les cases 2 à 6 et la validation des écrans de la case 1 restent à faire ; les écrans non traités restent chacun différents/non vérifiés par rapport à leurs planches. Aucun nouveau commit de fonctionnalités n'a été fait lors de cette reprise.

### Reprise suivante du 24/10/2026

- Ajout dans `tests/mgmtFicheStats.test.js` du test « Monde lot 68 T1 — chaque classe des écrans recruteur a une règle », selon la décision « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (10/10) et `node tools/verif-versions.js origin/main` (aucun écart).
- La consigne de lire le fichier de l'outil de capture situé dans `%TEMP%` n'a pas été accordée par l'interface de lecture. En conséquence, aucun comparatif n'a été ouvert et aucune correction visuelle n'est prétendue. Cases 1 (hors test existant), 2 à 5 et 7 restent à effectuer. Les écrans fiche, arrivée, recruteur, semaine, relevé, chiffres, menu et classements ne sont pas visuellement vérifiés.
- Écart : la tranche n'est pas terminée ; seuls le test de couverture CSS des classes recruteur et les tests de fiche déjà présents ont été validés. Pas de migration de sauvegarde.
- Questions pour Anthony : aucune ; il s'agit de travail visuel restant, pas d'une question de spécification.

### Reprise 4 du 24/10/2026

- Historique et état consultés : les commits existants sont conservés ; aucune modification déjà committée n'a été refaite. Les fichiers `.opencode/agents/*` et `opencode.json` restent des modifications hors tranche et ne sont pas inclus.
- `tests/mgmtFicheStats.test.js` : ajout du test « Monde lot 68 T1 — mission et retours du recruteur gardent leurs blocs de planche », complétant la couverture des classes et de leurs règles CSS. `node --test tests/mgmtFicheStats.test.js` : 11/11 verts.
- Captures : outil externe de capture/ouverture d'images impossible à utiliser dans ce contexte (lecture du fichier d'instructions temporaire refusée ; aucun dossier shoot/cmp disponible dans le dépôt). Aucune comparaison visuelle n'est revendiquée.
- Écrans, honnêtement : fiche Aperçu/Statistiques a seulement ses colonnes explicitement positionnées et les tests de structure antérieurs ; fidélité visuelle non validée. Arrivée contrat/espoirs non traitée. Recruteur mission/retours : règles et présence de blocs testées, mais correction et validation visuelles non faites. Semaine, relevé, chiffres du combat, menu, meilleurs et records non traités/non capturés.
- Versions : aucun fichier applicatif JS/CSS modifié durant cette reprise, donc aucun bump nécessaire. Migration de sauvegarde : aucune. Tests ciblés verts ; contrôle de versions et lint restent à exécuter avant livraison.
- Écart principal : la demande de fidélité écran par écran et le critère complet de fin ne sont pas atteints. Aucun écart de spécification ajouté ; les limites de validation visuelle sont explicites.

### Reprise 5 du 24/10/2026

- Historique et branche vérifiés : branche `fid-fiches` ; les commits du lot 68 T1 étaient déjà présents et aucun fichier de la tranche n'était non committé. Les modifications `.opencode/agents/*` et `opencode.json` sont restées hors du périmètre.
- Capture tentée pour `fiche` avec l'outil indiqué dans `%TEMP%` : planche `UniFicheStats`, mesure retournée `{moyen:31.3, grosBlocs:23}`. La lecture de `cmp-fiche.png` reste refusée par les permissions de lecture externe ; je n'en déduis donc pas de diagnostic visuel et n'ai pas retouché l'écran à l'aveugle. L'outil fourni ne propose pas les écrans arrivée, menu, relevé, chiffres ou classements dans sa liste de scènes.
- Test ciblé relancé : `node --test tests/mgmtFicheStats.test.js` (11/11 verts). Les tests préexistants et les trois tests ajoutés dans les reprises précédentes couvrent fiche/statistiques et blocs recruteur, mais ne remplacent pas la comparaison visuelle ni la couverture des autres écrans.
- Écrans, état honnête : Aperçu et Statistiques conservent les changements déjà committés (dont les colonnes explicites) ; apparence non validée visuellement. Arrivée contrat/espoirs non traitée. Recruteur mission/retours : tests de présence de blocs et de styles, aucune validation visuelle. Semaine, Relevé, chiffres du combat, Menu, Meilleurs et Records : non traités/non capturés.
- Pas de migration de sauvegarde ni de changement de version applicative dans cette reprise. Les cases 1 (validation visuelle), 2 à 7 ne sont donc pas toutes achevées ; je ne déclare pas `TOUT_EST_FINI`.

### Reprise 6 du 24/10/2026

- Branche et état vérifiés : `fid-fiches`. Les commits précédents contiennent les colonnes de fiche et la couverture recruteur ; aucun fichier applicatif non committé. Les modifications `.opencode/agents/*` et `opencode.json` sont préexistantes, hors tranche, laissées intactes.
- Ajout du test « Monde lot 68 T1 — chaque classe de la semaine a une règle dédiée » dans `tests/mgmtFicheStats.test.js`, en accord avec la décision des planches Uni validées.
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (12/12 verts), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert). Le lent `node --test tests/mgmtReleveReduit.test.js` a dépassé le délai maximal de 120 s de l'outil après cinq sorties « Compétences OK » ; son résultat n'est pas confirmé.
- Écrans, état honnête : fiche Aperçu/Statistiques et recruteur mission/retours ont des modifications/tests antérieurs, mais aucune comparaison visuelle ouverte. Semaine : couverture des classes CSS seulement, pas de correction visuelle. Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records : non traités. Aucune capture de comparaison exploitable n'a été produite ; l'accès aux instructions et comparatifs sous `%TEMP%` a été refusé par l'environnement.
- Migration de sauvegarde : aucune. Tests de structure des écrans non encore ajoutés pour la plupart des écrans listés. Cases 1 à 5 ne sont pas achevées visuellement ; le test lent n'a pas rendu de résultat dans la fenêtre de l'outil. La tranche demeure inachevée.
- Écarts à la fiche : validation écran par écran avec captures non réalisée. Aucun écart de maquette n'est affirmé sans observation.

### Reprise 7 du 24/10/2026

- Branche vérifiée : `fid-fiches`. Historique consulté (`c34df76` en tête) ; aucun changement applicatif non committé n'était présent au départ. Les fichiers `.opencode/agents/*` et `opencode.json` restent hors tranche.
- Ajout du test « Monde lot 68 T1 — chaque classe des écrans arrivée, relevé et classements a une règle », qui vérifie les classes de cadre `.mf-*` et `.ea-*` des sources d'arrivée, de relevé/chiffres et de classements contre `ui-cadre.css`. Décision appliquée : planches Uni validées par Anthony ; l'écran suit la planche.
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 13/13 verts. Le test initialement trop large incluait des classes de classement héritées sans règle dans `ui-cadre.css` ; resserré au périmètre des classes de cadre et d'arrivée, sans modifier l'écran.
- Fidélité visuelle : aucune capture comparative n'a pu être ouverte ici, et aucune correction visuelle écran par écran n'est revendiquée. Fiche Aperçu/Statistiques : changements antérieurs (colonnes explicites), fidélité non validée. Arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records : présence/structure générale seulement partiellement couverte par les tests existants ; comparaison visuelle et corrections demandées restent à faire.
- Migration de sauvegarde : aucune. Aucun JS/CSS applicatif modifié, donc pas de bump `?v=`. Tests ajoutés dans le fichier existant, déjà référencé par les scripts. Écart majeur : cases visuelles 1 à 5 et livraison complète non atteintes ; aucune prétention à `TOUT_EST_FINI`.
- Questions pour Anthony : aucune ; les éléments non faits sont du travail restant, pas une ambiguïté de spécification.

### Reprise 8 du 24/10/2026

- Historique et statut consultés : tête `065ea67`, branche `fid-fiches`. Les seules modifications non committées au départ sont `.opencode/agents/*` et `opencode.json`, hors tranche ; laissées intactes.
- Ajout du test « Monde lot 68 T1 — les écrans de la tranche restent enregistrés dans le jeu » dans `tests/mgmtFicheStats.test.js`, avec les identifiants d’écrans effectivement employés par le registre. Décision citée : « planches Uni* validées par Anthony ; l’écran suit la planche ».
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 14/14 verts. Pas de nouveau fichier de test ni de changement applicatif ; pas de bump `?v=` à faire.
- La vérification visuelle est toujours non réalisée : l’accès à l’instruction de capture externe et l’ouverture de ses comparatifs n’ont pas été disponibles dans ce contexte. L’écran titre/menu et les captures arrivée, relevé, chiffres, classements ne sont pas comparés. Aucune correction visuelle supplémentaire n’est revendiquée.
- État écran par écran : fiche (colonnes déjà corrigées, visuel non validé) ; arrivée contrat/espoirs (règles de classes testées partiellement, non validée visuellement) ; recruteur mission/retours (classes et blocs testés, non validé visuellement) ; semaine (classes testées, non validée visuellement) ; relevé/chiffres et classements (couverture partielle des classes, non validés visuellement) ; menu (non traité). Les différences précises ne peuvent pas être affirmées sans ouvrir les comparatifs.
- Migration de sauvegarde : aucune. Les cases de fidélité visuelle et le critère final ne sont pas atteints ; pas de `TOUT_EST_FINI`.

Règles communes : **additif** pour les données ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

### Reprise 11 du 24/10/2026

- État initial : branche `fid-fiches`, les commits précédents sont conservés ; modifications `.opencode/agents/*` et `opencode.json` hors tranche laissées intactes.
- Vérification ciblée : `node --test tests/mgmtFicheStats.test.js` (15/15 verts) ; `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` sont à relancer avant une livraison.
- Tentative de test supplémentaire des règles CSS du relevé : retirée après constat que `mgmt-releve.js` ne contient que la représentation des données et aucun markup/classe d'écran ; un tel test donnerait un faux critère. Les classes `.mf-*` de l'écran ne sont pas identifiées dans cette tranche, et aucun faux succès n'est revendiqué.
- Captures visuelles non réalisées : les écrans listés dans les reprises précédentes restent non validés ; aucun diagnostic visuel ou changement d'apparence n'est affirmé. Outil de capture externe et ouverture des comparatifs indisponibles dans le contexte.
- Aucun fichier applicatif modifié, aucune migration ni bump de version. Écart majeur : les corrections et comparaisons visuelles exigées restent à faire ; `TOUT_EST_FINI` n'est pas atteint.

### Reprise 10 du 24/10/2026

- Historique consulté : `dafc87c` en tête, branche `fid-fiches`. Au départ, aucun fichier de tranche non committé ; les neuf changements `.opencode/agents/*` et `opencode.json` sont hors tranche et restent intacts.
- Test ajouté dans `tests/mgmtFicheStats.test.js` : « Monde lot 68 T1 — menu principal conserve ses blocs et styles de planche ». Il rend l'écran titre et vérifie les blocs de menu ainsi que les règles CSS des classes de cadre. La décision « planches Uni* validées par Anthony ; l'écran suit la planche » est citée.
- Vérification ciblée : `node --test tests/mgmtFicheStats.test.js`, 15/15 verts. Une première assertion a révélé que le titre ne porte pas de classe `title-logo` ; le test a été ajusté aux vrais blocs du markup (`mf-accueil-*`). Aucun JS/CSS applicatif modifié, aucun bump de version ou migration.
- Captures/écarts visuels : pas de capture comparative ouverte, instructions sous `%TEMP%` inaccessibles dans le contexte et scène capture dédiée non établie. Ainsi aucune fidélité visuelle n'est revendiquée. Fiche aperçu/statistiques : changements antérieurs, visuel non validé ; Arrivée contrat/espoirs : non corrigée/validée ; Recruteur mission/retours : structure/styles partiellement testés, visuel non validé ; Semaine : couverture CSS seulement ; Relevé, chiffres du combat, menu, Meilleurs et Records : pas de comparaison visuelle (menu désormais couvert structurellement par test, non par capture).
- Limites : cases de corrections écran par écran et validation visuelle restent inachevées. Les différences visuelles précises ne sont pas affirmées sans accès au comparatif. Migration de sauvegarde : aucune. Tests lents : `tests/mgmtReleveReduit.test.js` n'a pas été relancé dans cette reprise.

### Reprise 12 du 24/10/2026

- Branche confirmée : `fid-fiches`. Historique : les commits du lot déjà présents ; aucun fichier de tranche non committé. Modifications `.opencode` et `opencode.json` hors tranche laissées intactes.
- `node --test tests/mgmtFicheStats.test.js` : 15/15 verts. Cela confirme les tests structure/style existants, pas une comparaison visuelle.
- Lecture de `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` refusée par les permissions de l'environnement. Aucun `cmp-*.png` n'a pu être ouvert ; aucune correction d'apparence à l'aveugle.
- État écran par écran : Aperçu/Statistiques (colonnes et structure couvertes par tests, fidélité visuelle non validée) ; Arrivée contrat/espoirs, Recruteur mission/retours, Semaine, Relevé, Chiffres, Menu, Meilleurs et Records (non validés visuellement ; certaines structures/classes testées, corrections et comparaisons restent à faire). Différences visuelles précises non établies.
- Aucune migration de sauvegarde, modification JS/CSS, ni bump `?v=`. Le critère visuel complet et la livraison ne sont pas atteints ; pas de déclaration `TOUT_EST_FINI`.

### Reprise 14 du 24/10/2026

- Vérifiés à la reprise : branche `fid-fiches`, historique jusqu'à `7615840`, aucun fichier de tranche non committé. Changements `.opencode/agents/*` et `opencode.json` hors périmètre préservés.
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 16/16 verts. Une tentative de test « chaque classe fiche a une règle » a été supprimée : classes de présentation (notamment SVG) mêlées aux classes de layout, et le test naïf confondait règle CSS exacte et styles hérités. Aucun test invalide gardé.
- Comparaison visuelle requise : toujours impossible à produire/ouvrir dans l'environnement ; le rapport ne prétend donc pas avoir validé les planches. Écrans : fiche, arrivée, recruteur, semaine, relevé, chiffres, menu, meilleurs et records restent sans vérification comparative complète. Les seules différences précises observées via tests sont structurelles ; pas de diagnostic visuel inventé.
- Aucun changement applicatif ni migration. Le critère de fidélité visuelle n'est pas atteint ; ne pas déclarer `TOUT_EST_FINI`.

### Reprise 13 du 24/10/2026

- Ajout de « Monde lot 68 T1 — arrivée contrat et espoirs garde les blocs des deux étapes » dans `tests/mgmtFicheStats.test.js`. Le test vérifie la présence des blocs contrat/espoirs et de règles CSS correspondantes dans les styles définis par l'écran d'arrivée, conformément à la décision « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (16/16 verts) ; `node tools/verif-versions.js origin/main` (aucun écart). ESLint ciblé a ignoré le fichier de test selon sa configuration (warning, aucune erreur).
- Capture et comparaison visuelle : non réalisées ; le fichier temporaire externe indiqué pour l'outil n'a pas été accessible dans ce contexte, et aucun comparatif ouvert ne permet un constat écran par écran.
- État écran par écran : Fiche Aperçu/Statistiques : tests et correction antérieure des colonnes, fidélité visuelle non validée. Arrivée contrat/espoirs : blocs/styles couverts par tests, apparence non validée. Recruteur mission/retours : tests de classes/blocs antérieurs, pas de validation visuelle. Semaine : couverture des classes seulement. Relevé, chiffres du combat, menu, Meilleurs et Records : non comparés visuellement ; menu a une couverture structurelle partielle.
- Aucun JS/CSS applicatif modifié, donc aucun bump `?v=` ; aucune migration de sauvegarde. Cases de corrections et comparaisons visuelles restent inachevées ; aucun `TOUT_EST_FINI`.

### Reprise 15 du 24/10/2026

- Branche vérifiée : `fid-fiches`. Historique consulté jusqu'à `e863701`. Les modifications `.opencode/agents/*` et `opencode.json` sont préexistantes, hors tranche, et laissées intactes.
- Vérifications relancées : `node --test tests/mgmtFicheStats.test.js` (16/16 verts) et `node tools/verif-versions.js origin/main` (aucun écart).
- Une tentative de test générique « chaque classe de fiche a une règle » a échoué sur `mf-fi-cage` : le nom est un préfixe d'une classe CSS réelle (`mf-fi-cagebox`), pas un sélecteur exact. Le test mal cadré a été retiré plutôt que d'enregistrer un faux critère ou d'élargir l'assertion sans distinguer les hooks de markup des classes stylées.
- Captures et comparatifs : non réalisés dans cette reprise ; aucun résultat visuel n'est revendiqué. Fidélité par écran : fiche (structure et colonnes précédemment couvertes, comparaison non validée) ; arrivée contrat/espoirs (blocs partiellement testés, comparaison non validée) ; recruteur mission/retours (blocs/classes testés, comparaison non validée) ; semaine (classes testées, comparaison non validée) ; relevé/chiffres/classements (couverture partielle, comparaison non validée) ; menu (blocs testés, comparaison non validée).
- Aucun JS/CSS applicatif ni donnée de sauvegarde modifié ; aucune migration, aucun bump `?v=`. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé. Les corrections visuelles et captures restent à faire ; pas de déclaration `TOUT_EST_FINI`.

### Reprise 16 du 24/10/2026

- Branche confirmée : `fid-fiches`. Les changements `.opencode/agents/*` et `opencode.json` sont restés hors tranche.
- Test ajouté dans `tests/mgmtFicheStats.test.js` : « Monde lot 68 T1 — l’écran des classements conserve ses blocs de données », avec la décision « planches Uni* validées par Anthony ; l’écran suit la planche ». Test ciblé : 17/17 verts.
- Vérifications : `node tools/verif-versions.js origin/main` (aucun écart) et `node_modules/.bin/eslint .` (vert). Aucun JS/CSS applicatif modifié, aucun bump `?v=`, aucune migration.
- Captures visuelles : toujours non effectuées ; l’accès à `%TEMP%/p1/shoot/LISEZMOI.txt` est refusé par l’environnement. Aucune comparaison visuelle ni correction d’apparence n’est revendiquée. Aperçu/Statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records restent sans validation visuelle ; la majeure partie des corrections de fidélité demandées reste à faire.
- Écart à la fiche : malgré la couverture structurelle croissante, les cases visuelles 1 à 5 ne sont pas achevées. Test lent `tests/mgmtReleveReduit.test.js` non relancé. Pas de `TOUT_EST_FINI`.

### Reprise 17 du 24/10/2026

- État repris : branche `fid-fiches`, les commits antérieurs restent en place. Les changements `.opencode/agents/*` et `opencode.json` sont hors tranche et ne sont pas ajoutés.
- Test ajouté dans `tests/mgmtFicheStats.test.js` : « Monde lot 68 T1 — chaque classe de la planche menu a une règle ». Il contrôle les classes `mf-*` réellement rendues par l'écran titre contre `ui-cadre.css`. Décision appliquée : « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 18/18 verts.
- Comparaison visuelle : non effectuée ; l'accès au fichier d'instructions et aux images externes ne fait pas partie des chemins autorisés dans ce contexte. Il n'y a donc ni diagnostic visuel ni correction d'apparence revendiqués.
- État écran par écran : fiche Aperçu/Statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records restent sans validation comparative visuelle. La couverture est structurelle/tests uniquement ; les corrections visuelles écran par écran demandées restent à faire.
- Migration : aucune. Aucun fichier applicatif JS/CSS modifié ; pas de bump `?v=`. Tests lents non relancés lors de cette reprise.
- Écart à la fiche : critère de fidélité visuelle et cases 1 à 5 non achevés ; `TOUT_EST_FINI` non atteint.

### Reprise 18 du 24/10/2026

- Ajout dans `tests/mgmtFicheStats.test.js` du test « Monde lot 68 T1 — les chiffres de combat gardent les métriques comparées et le relevé par round », couvrant les métriques de face-à-face et le résumé par round. Décision citée : planches Uni validées par Anthony ; l'écran suit la planche.
- Tests : `node --test tests/mgmtFicheStats.test.js` (19/19 verts) ; `node tools/verif-versions.js origin/main` (aucun écart) ; `node_modules/.bin/eslint .` (vert).
- Aucun JS/CSS applicatif modifié, donc pas de bump `?v=` et aucune migration. Le fichier de capture externe et comparatifs restent non accessibles ici : aucune comparaison visuelle ni correction de maquette n'est revendiquée.
- État écran par écran : fiche aperçu/statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records ne sont pas confirmés visuellement par comparaison. Le test chiffres couvre les métriques des données mais ne valide pas l'écran. Les corrections visuelles et captures prescrites restent à faire ; pas de `TOUT_EST_FINI`.
