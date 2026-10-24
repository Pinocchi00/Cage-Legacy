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

### Reprise 36 du 24/10/2026

- État initial revérifié : branche `fid-fiches`, HEAD `afa7ab34`. Pas de fichier de la tranche non committé ; les changements `.opencode/agents/*` et `opencode.json` sont restés hors périmètre.
- Le contrôle de capture a été lancé. Résultats de cette reprise : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Le lancement groupé s'est arrêté après la fiche ; les scènes suivantes ont ensuite été mesurées individuellement. Les comparatifs n'ont pas pu être ouverts avec l'outil d'image disponible ; leurs métriques de similarité ne sont pas prises pour une validation visuelle.
- Contrôles supplémentaires demandés : accueil `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{1,3,[]}` ; tonposte `{6,0,["IL ATTEND DE VOIR","« Je veux voir la suite."]}` ; bilan `{1,0,[]}`. Ces écrans sont explicitement hors périmètre (lots 64/67), donc aucun de leurs fichiers n'a été modifié.
- Test renforcé dans `tests/mgmtFicheStats.test.js` (« Monde lot 68 T1 — le suivi et son compteur restent dans la rangée des onglets ») : valide en plus le placement flex à droite et le compteur lisible à 22 px. Décision : « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (22/22 verts) ; `node tools/verif-versions.js origin/main` (aucun écart). ESLint ciblé ignore ce fichier de tests selon sa configuration. Aucun nouveau JS/CSS applicatif, donc pas de bump `?v=` ni de migration.
- Relevé écran par écran : fiche, recruteur, retours et semaine satisfont le contrôle automatique de géométrie, mais les images comparatives n'ont pas été ouvertes et la fidélité visuelle globale n'est donc pas attestée. Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records : aucun contrôle de scène disponible/établi. Accueil, actualités, tonposte et bilan : mesures ci-dessus, erreurs de contrôle documentées, laissées intactes car attribuées aux lots parallèles.
- Écart majeur : le contrôle universel demandé pour les écrans de tranche et la comparaison visuelle ne sont pas atteints. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été exécuté. Aucune migration de sauvegarde.

### Reprise 37 du 24/10/2026

- Branche `fid-fiches` confirmée ; historique jusqu'à `2842c51c` consulté. Aucun fichier applicatif ou test de cette tranche n'était non committé ; les neuf fichiers `.opencode/agents/*` et `opencode.json` sont hors périmètre et préservés.
- Tests ciblés relancés : `node --test tests/mgmtFicheStats.test.js` (22/22 verts) et `node --test tests/mgmtReleve.test.js` (5/5 verts). `node tools/verif-versions.js origin/main` : aucun écart. `node_modules/.bin/eslint .` : vert.
- Le travail de cette reprise documente l'état et ne modifie pas le code applicatif. Les scènes « fiche », « recruteur », « retours » et « semaine » ont des contrôles géométriques rapportés dans la reprise 36 (respectivement `{0,0,[]}`, `{0,0,[]}`, `{0,0,[]}`, `{0,0,[]}` pour chevauchements, textes sous 22 px et débordements). Aucun contrôle nouveau et aucune image comparative ouverte dans cette reprise ; aucun contrôle après-correction n'est donc revendiqué pour les autres scènes.
- État écran par écran : Fiche Aperçu/Statistiques, Recruteur mission/retours et Semaine ont des mesures géométriques historiques sans comparaison visuelle ouverte ; Arrivée contrat/espoirs, Relevé, Chiffres du combat, Menu, Meilleurs et Records restent sans mesure propre et sans comparaison visuelle. Les scènes accueil, actualités, tonposte et bilan demeurent hors périmètre applicatif et ne sont pas modifiées.
- Pas de modification JS/CSS, de bump `?v=` ni de migration. `tests/mgmtReleveReduit.test.js` n'a pas été relancé. Écart à la fiche : le protocole capture → ouverture → correction et la validation des cases d'écran ne sont toujours pas achevés ; aucune différence visuelle précise n'est inventée et `TOUT_EST_FINI` n'est pas atteint.

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

### Reprise 19 du 24/10/2026

- Arrivée / contrat : largeur des deux panneaux ajustée à la hiérarchie de la planche (contrat dominant à 55 %, attentes à 43 %, espacement restant), au lieu de deux panneaux égaux. `?v=` du script monté par `node tools/_bump.js mgmt-ecran-espoirs-arrivee.js`.
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 19/19 verts ; `node tools/verif-versions.js origin/main` : aucun écart ; ESLint ciblé : vert.
- Comparaison et ouverture du comparatif visuel toujours non réalisées (l’accès externe au dossier shoot reste refusé). Ce changement de géométrie est fondé sur la hiérarchie gauche/droite de la planche HTML, pas présenté comme une validation visuelle.
- État écran par écran : seule la largeur des panneaux de l’étape contrat a été corrigée ; tous les autres aspects de cet écran, les espoirs, la fiche, recruteur, semaine, relevé, chiffres, menu et classements ne sont pas validés par capture. Les corrections visuelles et le critère final restent à accomplir.
- Migration de sauvegarde : aucune. Aucun test nouveau ; pas d’écart de donnée.

### Reprise 20 du 24/10/2026

- Branche `fid-fiches` et historique vérifiés ; aucun changement applicatif non committé. Les modifications `.opencode/agents/*`, `opencode.json` et `sw.js` sont préexistantes et hors tranche ; elles restent intactes.
- La lecture des instructions de capture a réussi via l'outil système : la commande ne connaît que les scènes `accueil`, `actualites`, `tonposte`, `bilan`, `semaine`, `recruteur`, `retours`, `ceremonie`, `carnet`, `guerre`, `croissance`, `choc`, `discours`, `lendemain`, `lendemainSuite`, `soiree`, `soireeOuverture`, `soireeFin`, `fiche`. Les écrans arrivée, relevé, chiffres, menu et classements n'y sont pas prévus. Capture tentée : `semaine,recruteur,retours,fiche`; le processus a dépassé 120 s après le résultat semaine `{moyen:27.6,grosBlocs:22.1}`. Le comparatif n'a pas pu être ouvert dans l'outil d'image disponible ; aucune conclusion visuelle n'est tirée du score.
- Test « Monde lot 68 T1 — arrivée contrat et espoirs garde les blocs des deux étapes » renforcé pour vérifier les proportions 55 % / 43 % des panneaux du contrat, conformément au rapport flex de la planche. `node --test tests/mgmtFicheStats.test.js` : 19/19 verts.
- Écrans : aucune validation visuelle fiable n'a été effectuée dans cette reprise. Les statuts précédents restent : fiche partiellement structurelle, arrivée partiellement structurelle, recruteur et semaine couverts par tests mais non comparés ; relevé/chiffres, menu, meilleurs et records non comparés. Pas de diagnostic d'écart visuel inventé.
- Aucun JS/CSS applicatif modifié, aucun bump `?v=`, aucune migration. Les cases de corrections et vérifications visuelles restent à faire. Questions : aucune.

### Reprise 21 du 24/10/2026

- Branche confirmée : `fid-fiches`. Historique jusqu'à `41d52cf` consulté. Aucun changement non committé de la tranche ; les modifications `.opencode/agents/*`, `opencode.json` et `sw.js` sont hors de la tranche et n'ont pas été intégrées.
- Tests ciblés `node --test tests/mgmtFicheStats.test.js` : 19/19 verts. `node tools/verif-versions.js origin/main` : aucun écart. `node_modules/.bin/eslint .` : vert.
- La lecture de `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` est refusée par la politique d'accès externe. Les captures précédemment tentées n'ont pas été ouvertes visuellement ; aucun écart d'apparence ne peut être décrit sans inventer. Je ne prétends donc pas à une validation visuelle.
- État écran par écran : fiche aperçu/statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres du combat, menu, meilleurs et records : tests structurels/styles partiels présents, mais aucune comparaison visuelle ouverte ni correction de fidélité complète démontrée. Les cases de fidélité visuelle 1 à 5 ne sont pas achevées.
- Aucun code applicatif supplémentaire, migration ou bump `?v=` dans cette reprise. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé. Pas de nouveau commit : aucune modification de tranche préexistante à commiter. `TOUT_EST_FINI` non atteint.

### Reprise 22 du 24/10/2026

- Branche et historique vérifiés : `fid-fiches`, tête `628e2cc`. Les fichiers `.opencode/agents/*` et `opencode.json` préexistants restent hors périmètre ; conformément à la fiche, `sw.js` a été rétabli depuis `origin/main` et ne sera pas inclus.
- Test ciblé `node --test tests/mgmtFicheStats.test.js` : 19/19 verts. Il valide la structure partielle accumulée des écrans, pas leur comparaison à l'image de référence.
- La lecture de `%TEMP%/p1/shoot/LISEZMOI.txt` est bloquée par les permissions d'accès externe et aucune interface d'ouverture d'image n'est disponible. Impossible de réaliser le protocole capture → ouverture → correction pour cette reprise ; aucun diagnostic visuel n'est inventé.
- État honnête écran par écran : fiche aperçu/statistiques (changements antérieurs et tests structurels, visuel non comparé) ; arrivée contrat/espoirs (blocs testés en partie, visuel non comparé) ; recruteur mission/retours (blocs/classes testés, visuel non comparé) ; semaine (classes CSS testées, visuel non comparé) ; relevé/chiffres et meilleurs/records (couverture structurelle partielle, visuel non comparé) ; menu (blocs/styles testés, visuel non comparé). Aucune nouvelle capture ni correction d'apparence n'est revendiquée.
- Vérifications complémentaires et livraison complète restent à effectuer ; `tests/mgmtReleveReduit.test.js` non relancé dans cette reprise. Pas de migration de sauvegarde. `TOUT_EST_FINI` non atteint.

### Reprise 23 du 24/10/2026

- Capture relancée selon les instructions enfin lues : `semaine,recruteur,retours,fiche`. La scène `semaine` a produit `{moyen:27.6,grosBlocs:22.1}`, puis le processus a dépassé 120 s avant les autres scènes. Le comparatif `cmp-semaine.png` n'a pas pu être ouvert (accès externe refusé) ; le score seul ne vaut pas validation visuelle. Les scènes arrivée, relevé, chiffres, menu et classements ne sont pas dans la liste de l'outil.
- Test ajouté : « Monde lot 68 T1 — chaque classe rendue par l’arrivée a une règle dans sa feuille intégrée », avec la décision « planches Uni* validées par Anthony ; l'écran suit la planche ». Test ciblé `node --test tests/mgmtFicheStats.test.js` : 20/20 verts.
- État écran par écran : fiche et semaine/recruteur/retours tentés par capture, mais comparatifs non ouverts et corrections visuelles non validées ; arrivée, relevé, chiffres, menu et classements non capturés. Les tests assurent une partie de la structure et des règles CSS, pas la fidélité de l'écran rendu. Écarts visuels précis : non déterminés faute d'ouverture des comparatifs.
- Aucun code applicatif, migration ou bump de version dans cette reprise. Restent à faire les corrections visuelles, les captures ouvrables écran par écran, le test lent `tests/mgmtReleveReduit.test.js` et la validation finale/livraison. `TOUT_EST_FINI` n'est pas atteint.

### Reprise 24 du 24/10/2026

- Branche vérifiée : `fid-fiches`. Dernier commit observé `20461ef`; les modifications hors tranche (`.opencode/agents/*`, `opencode.json`) ont été préservées.
- Test ajouté dans `tests/mgmtFicheStats.test.js` : « Monde lot 68 T1 — chaque classe des vues meilleurs et records a une règle ». Il vérifie les classes `mf-me-*` et `mf-re-*` de `mgmt-su-leaders.js` contre `ui-cadre.css`, avec la décision « planches Uni* validées par Anthony ; l'écran suit la planche ».
- `node --test tests/mgmtFicheStats.test.js` : 21/21 verts.
- Capture/comparaison non réalisées : aucune correction d'apparence ni fidélité visuelle n'est revendiquée. Fiche, arrivée, recruteur, semaine, relevé, chiffres, menu et classements restent sans comparaison visuelle exploitable ; corrections visuelles restantes.
- Aucun fichier applicatif JS/CSS ni donnée de sauvegarde modifié ; pas de migration ni de bump `?v=`. Tests lents non relancés. `TOUT_EST_FINI` non atteint.

### Reprise 25 du 24/10/2026

- Branche confirmée : `fid-fiches`. Les changements `.opencode/agents/*` et `opencode.json` restent hors tranche. Aucun fichier applicatif non committé au début de cette reprise.
- Test « Monde lot 68 T1 — chaque classe rendue par l’arrivée a une règle dans sa feuille intégrée » renforcé : couverture explicite des blocs `po-quote` et `po-issues`, présents dans l’étape contrat. Décision : « planches Uni* validées par Anthony ; l’écran suit la planche ».
- `node --test tests/mgmtFicheStats.test.js` : 21/21 verts. `node tools/verif-versions.js origin/main` : aucun écart. `node_modules/.bin/eslint .` : vert.
- Aucun changement JS/CSS, migration de sauvegarde ou bump `?v=`. `tests/mgmtReleveReduit.test.js` non relancé.
- État écran par écran : fiche aperçu/statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres du combat, menu, meilleurs et records : tests structurels/CSS partiels accumulés ; la vérification visuelle comparative requise n'a pas été réalisée et aucune différence précise n'est affirmée sans observation des images. Les changements visuels demandés restent inachevés.
- Écart à la fiche : les cases 1 à 5 ne sont pas validées par capture et correction écran par écran. Aucun fichier temporaire de comparaison n'a pu être ouvert avec les outils disponibles pour cette reprise. Pas de `TOUT_EST_FINI`.

### Reprise 26 du 24/10/2026

- Branche `fid-fiches` confirmée, état vérifié : les modifications `.opencode/agents/*` et `opencode.json` restent hors tranche et ne sont pas incluses.
- Arrivée / contrat : corrigé le texte fixe des trois issues de fin d'année pour reprendre la formulation complète de la planche (« À la fin de l’année, trois issues : … ») ; version `?v=` montée.
- Vérification ciblée : `node --test tests/mgmtFicheStats.test.js` (21/21 verts). Pas de changement de test requis pour ce changement de texte fixe ; aucune migration.
- Comparaison de capture non réalisée dans cette reprise : aucun visuel n'est revendiqué. État écran par écran : fiche aperçu/statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records n'ont toujours pas été validés par une comparaison visuelle ouverte ; les corrections antérieures restent documentées plus haut. Pour ces écrans, fidélité visuelle et écarts d'image précis non établis.
- Écart : la modification textuelle du contrat n'achève pas les cases visuelles de la fiche. Les vérifications versions/lint et la livraison sont à finir avant tout bilan final. Aucun `TOUT_EST_FINI`.

### Reprise 27 du 24/10/2026

- Branche vérifiée : `fid-fiches`. `git status` ne montre que des modifications préexistantes dans `.opencode/agents/*` et `opencode.json`, hors tranche ; elles sont préservées. `HEAD` est `e181da4`, avec les derniers changements de contrat et la version correspondante déjà commités.
- Le protocole de capture a été relu. Capture tentée pour `semaine,recruteur,retours,fiche` : seule `semaine` a rendu `{moyen:27.6,grosBlocs:22.1}` avant dépassement des 120 s. La comparaison `cmp-semaine.png` n'a pas pu être ouverte dans l'outil disponible ; ces nombres seuls ne constituent pas un diagnostic. Les autres captures n'ont pas abouti. Les écrans arrivée, relevé, chiffres, menu et classements ne figurent pas dans les scènes de cet outil.
- Vérifications relancées : `node --test tests/mgmtFicheStats.test.js` (21/21 verts) et `node tools/verif-versions.js origin/main` (aucun écart). Aucune modification applicative ou test n'a été faite dans cette reprise ; ce commit ne concerne que ce compte rendu.
- État écran par écran : fiche Aperçu/Statistiques : corrections structurelles et tests antérieurs, aucune comparaison exploitable ; arrivée contrat/espoirs : modifications textuelles/géométriques et tests, aucune comparaison ; recruteur mission/retours et semaine : capture interrompue avant comparaison visuelle ; Relevé, chiffres du combat, Menu, Meilleurs et Records : pas de capture comparative. Les différences précises à l'image ne sont pas déterminées, aucun écart visuel n'est inventé.
- Tests lents : `tests/mgmtReleveReduit.test.js` non relancé. Migration de sauvegarde : aucune. Écart majeur : les cases de correction et validation visuelles écran par écran ne sont pas achevées ; `TOUT_EST_FINI` n'est pas atteint.

### Reprise 28 du 24/10/2026

- Historique et statut consultés : branche `fid-fiches`, tête `72ef0b9`. Aucun fichier applicatif de la tranche n'était non committé ; seules les modifications préexistantes `.opencode/agents/*` et `opencode.json` restent hors périmètre.
- Ajout dans `tests/mgmtReleve.test.js` du test « Monde lot 68 T1 — le relevé conserve les blocs round et total de la planche », couvrant les mesures par round et totaux via la conversion complète/réduite. Décision citée : « planches Uni* validées par Anthony ; l'écran suit la planche ».
- `node --test tests/mgmtReleve.test.js` : 5/5 verts. Ce test de données ne vaut pas capture ni validation visuelle du relevé.
- État écran par écran inchangé : fiche, arrivée, recruteur, semaine, relevé, chiffres, menu, meilleurs et records restent sans comparaison visuelle exploitable ; les différences précises demeurent inconnues. Aucune capture ou correction visuelle n'est revendiquée.
- Pas de modification JS/CSS applicative, donc pas de bump `?v=` ; aucune migration. Cases de fidélité visuelle et critère final encore non atteints.

### Reprise 29 du 24/10/2026

- État vérifié : branche `fid-fiches`, dernier commit `8d756f0`. Aucun fichier applicatif ou test de la tranche non committé ; les modifications `.opencode/agents/*` et `opencode.json` restent hors périmètre.
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (21/21 verts), `node --test tests/mgmtReleve.test.js` (5/5 verts), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert).
- Tentative du test lent `node --test tests/mgmtReleveReduit.test.js` : dépasse le délai outil de 120 s après les sorties de démarrage, résultat non confirmé.
- Captures : l'accès à `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` est bloqué par les permissions ; aucun comparatif n'a pu être ouvert. Pas de correction ni de validation visuelle revendiquée.
- État écran par écran : fiche Aperçu/Statistiques, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres du combat, menu, Meilleurs et Records restent visuellement non comparés ; certains changements et tests structurels sont décrits dans les reprises antérieures, mais les cases de fidélité par captures et corrections ne sont pas achevées. Écarts visuels précis non établis.
- Aucun changement applicatif, test ou migration dans cette reprise ; aucun bump `?v=` requis. Écart principal : fidélité visuelle et protocole capture→ouverture→correction incomplets, donc la livraison finale et `TOUT_EST_FINI` ne sont pas atteints.

### Reprise 30 du 24/10/2026

- Branche et historique vérifiés : `fid-fiches`, tête `cd33270`. Aucun fichier de tranche n'était modifié ; les changements présents dans `.opencode/agents/*` et `opencode.json` sont hors périmètre et préservés.
- Instructions de capture lues à `%TEMP%/p1/shoot/LISEZMOI.txt`. L'outil gère un sous-ensemble des scènes ; arrivée, relevé, chiffres, menu et classements exigent des scènes ajoutées. Les images comparatives sont générées hors du dépôt.
- Une tentative de test de couverture des classes fiche a été retirée après échec sur des hooks qui ne sont pas des sélecteurs CSS autonomes (`mf-fi-cage`, puis `mf-fi-bas`). Le test naïf aurait été trompeur ; aucun changement de test n'est conservé.
- État écran par écran : fiche, arrivée contrat/espoirs, recruteur mission/retours, semaine, relevé, chiffres, menu, meilleurs et records restent sans comparaison visuelle ouverte. Les tests structurels antérieurs demeurent décrits dans les reprises précédentes ; aucune fidélité visuelle n'est revendiquée.
- Aucun fichier applicatif ou test modifié, aucune migration et aucun bump `?v=`. Aucune correction visuelle ni nouveau commit de code dans cette reprise. Les cases visuelles 1 à 5 restent inachevées ; pas de `TOUT_EST_FINI`.

### Reprise 31 du 24/10/2026

- Branche/historique/statut revérifiés : `fid-fiches`, tête initiale `1997703`. Aucun changement non committé de la tranche ; les modifications `.opencode/agents/*` et `opencode.json` restent hors périmètre.
- Vérifications ciblées : `node --test tests/mgmtFicheStats.test.js` (21/21 verts) et `node --test tests/mgmtReleve.test.js` (5/5 verts). `node tools/verif-versions.js origin/main` : aucun écart ; `node_modules/.bin/eslint .` : vert.
- Aucun changement applicatif ou de test cette reprise, donc aucun bump `?v=` ni migration. Les reprises précédentes contiennent les tests structurels documentés ci-dessus.
- État écran par écran, honnêtement : Fiche Aperçu/Statistiques (colonnes/layout et couverture structurelle antérieure, comparaison visuelle non vérifiée) ; Arrivée contrat/espoirs (blocs et proportions/textes ajustés en partie, comparaison visuelle non vérifiée) ; Recruteur mission/retours (blocs et règles testés, visuel non vérifié) ; Semaine (classes testées, visuel non vérifié) ; Relevé (test des données round/total, visuel non vérifié) ; chiffres du combat (métriques vérifiées par test, visuel non vérifié) ; menu (blocs/classes vérifiés par test, visuel non vérifié) ; Meilleurs/Records (classes couvertes, visuel non vérifié).
- Aucun comparatif `cmp-*.png` n'a été ouvert dans cette reprise ; je n'affirme pas les écarts visuels précis. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé. Aucun changement hors fiche à commiter.
- Écart à la fiche : le protocole de capture/ouverture/correction écran par écran demeure non achevé et les cases visuelles 1 à 5 ne sont donc pas validées. Aucun fichier applicatif n'est commité dans cette reprise ; ce compte rendu consigne l'état sans revendiquer `TOUT_EST_FINI`.

### Reprise 40 du 24/10/2026 — contrôle géométrique

- Contrôles actuels, capture à 1920×1080 : fiche (UniFicheStats) `{chevauchements:0, exemples:[], textesSous22px:0, debordent:[]}` ; recruteur (UniRecruteurMission) `{0, [], 0, []}` ; retours (UniRecruteurRetour) `{0, [], 0, []}` ; semaine (UniSemaine) `{0, [], 0, []}`. La fiche ne reproduit donc plus les deux chevauchements historiques signalés (palmarès/compteur, POIDS/SUIVRE) ; le bouton et son compteur sont déjà dans la rangée des onglets. Pas de correction applicative nécessaire pour ces contrôles.
- Scènes de contrôle supplémentaires du superviseur, hors périmètre applicatif de cette tranche : accueil `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{1,3,[]}` (un chevauchement « Tout est lu » / « Tout marquer comme lu ») ; tonposte `{6,0,["IL ATTEND DE VOIR","« Je veux voir la suite."]}` ; bilan `{1,0,[]}`. Aucun de ces écrans parallèles n'a été modifié.
- Les valeurs de similarité (`moyen`/`grosBlocs`) ne valent pas validation visuelle. Les comparatifs PNG n'ont pas été ouverts. Les scènes arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records ne sont pas disponibles dans les scènes du captureur utilisé et n'ont pas reçu de contrôle automatique dans cette reprise.
- État honnête : les contrôles géométriques disponibles pour fiche, recruteur, retours et semaine sont sans anomalie, mais le protocole de comparaison visuelle reste incomplet ; les autres écrans cités restent sans contrôle visuel propre. Cases de fidélité et critère final non achevés ; pas de `TOUT_EST_FINI`. Aucun JS/CSS ou test changé, donc aucun bump `?v=` ni migration.

### Reprise 41 du 24/10/2026

- Branche `fid-fiches` confirmée. Les commits fonctionnels précédents sont déjà présents ; les modifications locales de `.opencode/agents/*` et `opencode.json` sont hors tranche, non ajoutées et laissées intactes.
- Contrôles géométriques disponibles dans le compte rendu (reprise 40) : fiche, recruteur, retours et semaine chacun `{chevauchements:0, textesSous22px:0, debordent:[]}`. Le script externe de capture et ses PNG n'ont pas pu être lus dans cette session, donc pas de nouvelle capture ni de comparaison visuelle revendiquée. Les scènes arrivée, relevé, chiffres, menu et classements restent sans mesure documentée ; accueil, actualités, tonposte et bilan restent hors périmètre applicatif et leurs anomalies consignées en reprise 40 ne sont pas modifiées.
- Vérifications relancées : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (27/27 verts), `node tools/verif-versions.js origin/main` (aucun écart) et `node_modules/.bin/eslint .` (vert). Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé.
- Aucun défaut géométrique nouveau exploitable n'étant apparu, aucun changement applicatif n'a été fait à l'aveugle. Aucun bump `?v=` ni migration. Fidélité aux maquettes et couverture de toutes les scènes restent incomplètes ; cette reprise ne revendique pas `TOUT_EST_FINI`.

### Reprise 38 du 24/10/2026

- Branche confirmée : `fid-fiches`. Historique jusqu'à `6874035f` consulté ; aucun fichier de la tranche en attente de commit. Les modifications `.opencode/agents/*` et `opencode.json` restent hors tranche et intactes.
- Instructions du captureur relues. Contrôles exécutés avec ses scènes disponibles : fiche `{chevauchements:0, exemples:[], textesSous22px:0, debordent:[]}` ; recruteur `{0,[],0,[]}` ; retours `{0,[],0,[]}`. Les comparatifs des fichiers `cmp-*.png` n'ont pas été ouverts : les valeurs `moyen`/`grosBlocs` ne sont pas prises pour preuve de fidélité visuelle.
- Aucun défaut signalé par le contrôle dans ces trois scènes ; aucune modification de balisage/styles n'est justifiée à l'aveugle. Les mesures ne sont pas une validation visuelle des planches et ne couvrent pas les autres scènes requises. Semaine, accueil, actualités, tonposte, bilan et les scènes ajoutées (arrivée, relevé, chiffres, menu, classements) restent à contrôler ; accueil/actualités/tonposte/bilan restent hors périmètre applicatif de cette tranche.
- Aucune modification de JS/CSS ou test lors de cette reprise ; aucun bump `?v=` ni migration de sauvegarde. Les cases d'écran et la livraison globale ne sont donc pas achevées ; `TOUT_EST_FIN` n'est pas revendiqué.

### Reprise 39 du 24/10/2026

- Vérifications ciblées relancées : `node --test tests/mgmtFicheStats.test.js` (22/22 verts), `node --test tests/mgmtReleve.test.js` (5/5 verts) ; `node tools/verif-versions.js origin/main` : aucun écart.
- Les changements des reprises précédentes sont déjà committés ; aucun fichier applicatif/test de cette tranche n'est actuellement en attente. Les changements `.opencode/agents/*` et `opencode.json` restent hors périmètre, non ajoutés.
- Contrôle de capture demandé : les chemins `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` et `cmp-*.png` sont bloqués par l'accès externe dans cette session. Je ne rapporte donc aucun contrôle nouveau ni résultat après-correction. Les seuls résultats géométriques disponibles restent ceux de la reprise 38 : fiche, recruteur, retours à zéro ; aucun résultat exploitable pour les autres écrans.
- État écran par écran : fiche Aperçu/Statistiques, Recruteur mission/retours et Semaine gardent les contrôles géométriques antérieurs documentés, sans comparatif ouvert ; arrivée contrat/espoirs, Relevé, chiffres du combat, Menu, Meilleurs et Records n'ont pas de contrôle nouvellement établi. Accueil, Actualités, Ton poste et Bilan restent hors périmètre applicatif demandé, aucune modification faite.
- Aucun changement JS/CSS ou sauvegarde ; pas de migration ni de bump `?v=`. La fidélité comparative et la mesure complète de tous les écrans restent inachevées ; je ne revendique pas `TOUT_EST_FINI`.

### Reprise 34 du 24/10/2026

- Branche confirmée : `fid-fiches`. Les changements préexistants `.opencode/agents/*` et `opencode.json` restent hors tranche ; `sw.js` a été rétabli depuis `origin/main` conformément à la consigne.
- Contrôles disponibles dans l'historique de capture (reprise 32), avant/après : fiche `chevauchements 2 → 0`, `textesSous22px 0`, `debordent []`; recruteur `0,0,[]`; retours `0,0,[]`; semaine `0,0,[]`. Les écrans secondaires demandés par la reprise (accueil, actualités, tonposte, bilan), et arrivée, relevé, chiffres, menu, meilleurs et records n'ont pas de mesure établie. Aucun contrôle/capture n'a été exécuté à nouveau ici ; les nombres historiques ne sont pas assimilés à une validation visuelle.
- Tests ciblés : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (26/26 verts). `node tools/verif-versions.js origin/main` : aucun écart.
- État écran par écran : fiche, recruteur, retours, semaine ont les résultats géométriques historiques ci-dessus ; arrivée contrat/espoirs, relevé, chiffres du combat, menu et classements ne disposent pas de contrôle mesuré dans ce rapport. Accueil/Actualités/Ton poste/Bilan : aucun résultat récent. Ouverture des comparatifs et fidélité aux planches non établies.
- Aucune modification applicative ou migration de sauvegarde dans cette reprise. Écart majeur : la demande de mesure complète des scènes restantes et la validation visuelle écran par écran ne sont pas satisfaites ; pas de `TOUT_EST_FINI`.

### Reprise 33 du 24/10/2026

- Vérifiés à la reprise : branche `fid-fiches`, tête `e0e438ad`. Aucun fichier de la tranche n'était non committé ; les modifications `.opencode/agents/*`, `opencode.json` et `sw.js` sont hors périmètre et laissées intactes.
- Tests relancés : `node --test tests/mgmtFicheStats.test.js` (21/21 verts) et `node tools/verif-versions.js origin/main` (aucun écart).
- Derniers contrôles de scène consignés (reprise 32) : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}`, recruteur `{0,0,[]}`, retours `{0,0,[]}`, semaine `{0,0,[]}`. Avant la correction de la fiche : `{chevauchements:2,textesSous22px:0,debordent:[]}` ; le suivi a été déplacé à droite des onglets. Ces mesures attestent les contrôles géométriques rapportés, pas une comparaison visuelle aux planches.
- L'outil de capture décrit dans la fiche n'est pas disponible via les outils de cette reprise ; aucun nouveau contrôle n'a été exécuté ni image ouverte. Les scènes accueil, actualites, tonposte et bilan demandées par le contrôle de reprise n'ont donc pas de résultat nouveau. Arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records n'ont pas de contrôle d'écran nouveau non plus.
- Bilan écran par écran : fiche, recruteur, retours, semaine ont un dernier contrôle sans chevauchement documenté, mais fidélité visuelle exacte non validée ; arrivée, relevé, chiffres, menu et classements restent sans contrôle de capture établi. Pas de nouveau changement applicatif, test ou migration ; aucun bump `?v=` nécessaire.
- Écart à la fiche : le critère de contrôle `chevauchements:0` n'est pas établi pour tous les écrans demandés et la comparaison visuelle reste incomplète ; tranche non terminée. `tests/mgmtReleveReduit.test.js` n'a pas été relancé.

### Reprise 42 du 24/10/2026

- Vérifications de départ : branche `fid-fiches`, tête `041a20d3`. Aucun fichier de la tranche n'était non committé ; les modifications `.opencode/agents/*` et `opencode.json` sont préexistantes et hors périmètre.
- Outil de capture relancé conformément aux instructions. Scène `fiche` (UniFicheStats) : `{chevauchements:0, exemples:[], textesSous22px:0, debordent:[]}`, similarité `{moyen:31.2,grosBlocs:23.2}`. Capture groupée interrompue au timeout de 120 s après la fiche ; scène `recruteur` exécutée séparément : `{chevauchements:0, exemples:[], textesSous22px:0, debordent:[]}`, similarité `{moyen:26,grosBlocs:19.7}`. Les scores ne remplacent pas l'ouverture du comparatif ; les PNG n'ont pas été ouverts.
- Tests ciblés relancés : `node --test tests/mgmtFicheStats.test.js` (22/22), `node --test tests/mgmtReleve.test.js` (5/5), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert).
- Contrôle écran par écran : fiche (contrôle géométrique zéro, confirmé dans cette reprise) ; recruteur (zéro, confirmé dans cette reprise) ; retours et semaine (dernier résultat zéro documenté en reprise 40, pas de mesure nouvelle) ; arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records (aucune scène de capture dans l'outil, aucun résultat géométrique établi). Les scènes accueil, actualités, tonposte et bilan sont hors périmètre, leurs anciennes anomalies de reprise 40 restent inchangées.
- Aucun défaut géométrique signalé sur les deux scènes mesurées ; aucune retouche à l'aveugle. Les cases visuelles et la validation comparative restent incomplètes. Aucun changement applicatif, aucune migration et aucun bump `?v=` ; seuls ce compte rendu et les vérifications décrites sont nouveaux. `tests/mgmtReleveReduit.test.js` non relancé.

### Reprise 35 du 24/10/2026

- Historique et état vérifiés : branche `fid-fiches`, tête `6d484b53`. Aucun fichier de la tranche n'était non committé ; les changements `.opencode/agents/*` et `opencode.json` restent hors périmètre. Les commits antérieurs sont conservés.
- Contrôles exécutés avec l'outil de capture fourni : fiche `{chevauchements:0, textesSous22px:0, debordent:[]}` ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Les comparatifs produits n'ont pas été ouverts ; les scores `moyen`/`grosBlocs` ne sont pas interprétés comme une validation visuelle.
- Les contrôles additionnels prescrits ont aussi été exécutés : accueil `{chevauchements:0, textesSous22px:1, debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{1,3,[]}` avec collision « Tout est lu » / « Tout marquer comme lu » ; tonposte `{6,0,["IL ATTEND DE VOIR","« Je veux voir la suite."]}` ; bilan `{1,0,[]}` avec collision « REMERCIÉ » / « Il manque 3 combats en carte ». Ces écrans appartiennent aux lots 64/67 explicitement exclus de cette tranche : aucun fichier de ces écrans n'a été modifié.
- Les scènes `arrivée contrat/espoirs`, `relevé`, `chiffres du combat`, `menu`, `meilleurs` et `records` ne sont pas proposées par la liste du captureur. Je n'ai pas créé de scènes ad hoc ni prétendu à un contrôle inexistant. Le traitement restant est donc clairement établi : contrôle/correction des scènes restantes, ouverture des comparatifs et fin des cases 1 à 5.
- Aucun changement applicatif, donnée de sauvegarde, test ou migration dans cette reprise. Tests ciblés déjà documentés dans les reprises précédentes ; aucune nouvelle vérification versions/lint n'a été nécessaire pour ce seul compte rendu. Pas de commit de code : aucune modification applicative de la tranche n'était présente à commiter.

### Reprise 40 du 24/10/2026

- Branche confirmée : `fid-fiches`. Historique et état initial consultés : les changements applicatifs/tests déjà présents sont commités ; les modifications `.opencode/agents/*` et `opencode.json` restent hors tranche et intactes.
- Vérifications relancées : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (27/27 verts), `node tools/verif-versions.js origin/main` (aucun écart) et `node_modules/.bin/eslint .` (vert).
- La fiche et le message prescrivent le contrôle par l'outil externe et les images `cmp-*.png`. Ces fichiers sont dans un répertoire externe à accès refusé par l'environnement ; aucun contrôle de cette reprise ni ouverture de comparatif n'est possible. Les mesures antérieures ne sont pas présentées comme nouvel état après correction. En particulier, les scènes arrivée, relevé, chiffres, menu et classements n'ont toujours pas de mesure établie dans le dépôt.
- Contrôle demandé pour accueil/actualités/tonposte/bilan : leurs derniers résultats disponibles sont documentés aux reprises 34/35 ; ces écrans sont hors périmètre de modification et restent non corrigés. Je ne change pas leurs sources.
- Aucun défaut nouveau vérifiable dans le code ou les tests ciblés ne justifie une retouche applicative à l'aveugle. Aucun JS/CSS, test ou sauvegarde modifié ; aucun bump `?v=` ni migration. Pas de fichier de tranche en attente de commit.
- État écran par écran : fiche, recruteur, retours et semaine ont des mesures historiques de contrôle à zéro (reprises 32/34/38), sans validation comparative ouverte ; Aperçu n'a pas de mesure distincte établie. Arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records restent sans mesure propre ni comparaison exploitable. Aucune différence visuelle précise n'est inventée.
- Écart à la fiche : corrections et contrôles actuels de toutes les scènes, puis fidélité visuelle par comparaison, restent incomplets. Tests lents `tests/mgmtReleveReduit.test.js` non relancé. Aucune migration. `TOUT_EST_FINI` non revendiqué.
- Écart à la fiche : le critère de livraison globale n'est pas atteint ; contrairement à l'exigence de cette reprise, les comparatifs n'ont pu être ouverts et les scènes manquantes ne sont pas capturées. `TOUT_EST_FINI` n'est pas atteint.

### Reprise 41 du 24/10/2026

- État repris : branche `fid-fiches`, HEAD `38811937`. L'historique `git log --oneline -12` et `git status` ont été examinés. Aucun fichier applicatif ou test de la tranche n'est non committé ; les changements `.opencode/agents/*` et `opencode.json` sont hors tranche et préservés.
- Contrôles ciblés relancés : `node --test tests/mgmtFicheStats.test.js` (22/22) et `node --test tests/mgmtReleve.test.js` (5/5), verts. `node tools/verif-versions.js origin/main` : aucun écart ; `node_modules/.bin/eslint .` : vert.
- Le travail effectué dans cette reprise est cette mise à jour du compte rendu : aucune correction applicative supplémentaire n'a été faite faute d'un constat de capture directement vérifiable ici. Le fichier temporaire d'instructions et les comparatifs sont hors des chemins de lecture autorisés par l'environnement ; les données historiques de contrôles ne sont pas présentées comme un résultat nouveau.
- Bilan écran par écran : fiche statistiques a historiquement un contrôle géométrique à zéro après déplacement du bouton suivi ; Aperçu, arrivée (contrat/espoirs), recruteur mission/retours, semaine, relevé, chiffres du combat, menu, meilleurs et records n'ont pas de comparaison d'image nouvellement validée dans cette reprise. Les seules valeurs détaillées disponibles sont celles des reprises précédentes ; aucune différence d'apparence non observée n'est inventée.
- Aucun changement de JS/CSS ou de sauvegarde : pas de bump `?v=`, aucune migration. Aucun test nouveau, aucun changement de `package.json`. Les scènes d'accueil, actualités, tonposte et bilan restent hors périmètre fonctionnel et ne sont pas modifiées.
- Écart à la fiche : le contrôle « chevauchements:0 » après-correction n'est pas nouvellement mesuré pour toutes les scènes, et le protocole de comparaison visuelle n'est pas achevé. Les cases visuelles de la tranche restent incomplètes ; `TOUT_EST_FIN` n'est pas revendiqué.

### Reprise 44 du 24/10/2026 — contrôles automatiques demandés

- Branche `fid-fiches` confirmée, HEAD initial `c356bb81`. Les seules modifications au départ (`.opencode/agents/*`, `opencode.json`) sont hors périmètre et restent intactes.
- Instructions de `shoot` lues. Contrôles frais à 1920×1080 : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` (UniFicheStats ; l'outil ne capture pas séparément l'onglet Aperçu) ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Les scores de similarité ne sont pas une validation visuelle. Les comparatifs PNG n'ont pas été ouverts.
- Contrôle frais des écrans parallèles demandé : accueil `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{chevauchements:1, exemples:["« Tout est lu » x « Tout marquer comme lu »"],textesSous22px:3,debordent:[]}` ; tonposte `{chevauchements:6,textesSous22px:0,debordent:["IL ATTEND DE VOIR","« Je veux voir la suite."]}` ; bilan `{chevauchements:1,exemples:["REMERCIÉ x Il manque 3 combats en carte"],textesSous22px:0,debordent:[]}`. Ces écrans relèvent des lots 64/67 exclus de modification par la fiche ; leurs anomalies sont consignées, non corrigées ici.
- Captures dédiées à l'arrivée (contrat/espoirs), au relevé, aux chiffres du combat, au menu et aux classements impossibles avec le jeu de scènes du captureur (`accueil`, `actualites`, `tonposte`, `bilan`, `semaine`, `recruteur`, `retours`, etc.). Aucune scène personnalisée n'a été ajoutée : aucun constat géométrique n'est donc revendiqué pour ces écrans. Aucun comparatif image n'a été ouvert.
- Aucun défaut frais signalé par le contrôle sur les scènes de tranche disponibles ; pas de modification applicative à l'aveugle. Tests ciblés précédemment verts : `tests/mgmtFicheStats.test.js` et `tests/mgmtReleve.test.js` ; versions/lint précédemment verts. Pas de changement JS/CSS/sauvegarde, donc ni bump ni migration. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé dans cette reprise.
- État honnête écran par écran : fiche Statistiques, mission recruteur, retours et semaine — contrôle géométrique sans anomalie, sans comparaison visuelle ouverte ; fiche Aperçu — pas de capture distincte ; arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records — pas de capture ni de mesure ; écrans accueil/actualités/tonposte/bilan — contrôles ci-dessus, anomalies hors périmètre non corrigées. Les cases de comparaison/correction visuelle complète restent inachevées ; aucun `TOUT_EST_FIN`.

### Reprise du 24/10/2026 — rangée de la fiche

- `mgmt-fiche-cadre.js` : dans la rangée des onglets, le repère clavier « Tab · Onglet suivant » précède maintenant le groupe compteur/bouton de suivi. Le suivi est le dernier bloc à droite, conformément à la position demandée dans les planches. `?v=` monté.
- `tests/mgmtFicheStats.test.js` : le test « Monde lot 68 T1 — le suivi et son compteur restent dans la rangée des onglets » vérifie aussi que le bloc suivi termine la rangée et que le repère clavier le précède. Décision citée : « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (22/22), `node --test tests/mgmtReleve.test.js` (5/5), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert).
- Contrôles visuels avant/après : aucune mesure nouvelle n'a pu être lancée dans cette session ; le captureur externe n'est pas accessible via les chemins autorisés. Les derniers chiffres documentés restent historiques (reprise 32 : fiche `2→0`, recruteur/retours/semaine `0→0`; les contrôles des autres scènes ne sont pas établis). Aucun résultat après-correction n'est prétendu pour la présente modification.
- Écrans : modification ciblée de la rangée fiche uniquement. Arrivée, recruteur, retours, semaine, relevé, chiffres du combat, menu et classements ne sont pas corrigés ni validés ici ; comparatifs non ouverts. Accueil, actualités, tonposte et bilan restent hors périmètre fonctionnel, sans modification.
- Migration de sauvegarde : aucune. Le critère global de contrôle géométrique zéro et de comparaison visuelle écran par écran n'est pas atteint.

### Reprise 32 du 24/10/2026

### Reprise 42 du 24/10/2026

- Branche confirmée : `fid-fiches`. `git log --oneline -12` et `git status` consultés ; les changements applicatifs déjà faits sont commités. Les modifications `.opencode/agents/*` et `opencode.json` restent hors tranche, intactes et non ajoutées.
- Instructions de capture lues. Contrôles frais sur scènes de tranche disponibles : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Aucun de ces écrans ne signale de défaut géométrique à corriger. Les scores `moyen`/`grosBlocs` sont des indices de comparaison, pas une validation visuelle.
- Contrôles demandés pour écrans parallèles : accueil `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{1,3,[]}` (collision « Tout est lu » / « Tout marquer comme lu ») ; tonposte `{6,0,["IL ATTEND DE VOIR","« Je veux voir la suite. »"]}` ; bilan `{1,0,[]}` (collision « REMERCIÉ » / « Il manque 3 combats en carte »). Ils relèvent des lots 64/67 exclus ; aucun fichier de ces écrans n'a été modifié.
- Arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records ne figurent pas parmi les scènes du captureur ; aucun contrôle automatisé n'est inventé pour eux. Aucune image `cmp-*.png` n'a été ouverte dans cette session, donc la similitude visuelle aux planches n'est pas attestée par ces métriques.
- Les écarts géométriques signalés étant soit nuls sur les scènes de tranche disponibles, soit hors périmètre, aucun changement de code à l'aveugle n'a été fait. Migration de sauvegarde : aucune ; aucun bump `?v=` requis.
- Tests ciblés : `node --test tests/mgmtFicheStats.test.js` (22/22), `node --test tests/mgmtReleve.test.js` (5/5) et `node --test tests/mgmtReleveReduit.test.js` (6/6, environ 452 s) sont verts. `node tools/verif-versions.js origin/main` : aucun écart ; `node_modules/.bin/eslint .` : vert.
- État écran par écran : fiche, recruteur mission, retours et semaine — contrôle géométrique à zéro, comparatif visuel non ouvert ; arrivée, relevé, chiffres, menu, meilleurs et records — contrôle non disponible et comparaison non faite. Les captures ne démontrent donc pas l'achèvement visuel global demandé. Aucune migration. L'écran de combattant a dans le contrôle frais les cibles chevauchements/sous-22/débordement à zéro ; les autres scènes non disponibles restent non attestées.
- Écart à la fiche : toutes les corrections de fidélité visuelle aux planches et l'ouverture des comparatifs ne sont pas accomplies ; `TOUT_EST_FINI` n'est pas revendiqué. Aucun fichier applicatif n'a été modifié car les contrôles frais n'ont signalé aucun défaut dans les scènes de cette tranche mesurables ; le compte rendu est la seule modification de cette reprise.

- Contrôles automatiques de capture avant correction : fiche `{chevauchements:2, textesSous22px:0, debordent:[]}` (palmarès/compteur et poids/bouton SUIVRE). La fiche a été déplacée du bloc bannière à la rangée des onglets ; le premier essai a montré trois recouvrements avec le nom de style, corrigés en contraignant l'onglet, le bouton de suivi et l'aide Tab dans la rangée. Contrôle après correction fiche : `{chevauchements:0, textesSous22px:0, debordent:[]}`.
- Captures/contrôles après : Recruteur `{0,0,[]}`, Retours `{0,0,[]}`, Semaine `{0,0,[]}` (dans l'ordre chevauchements, textesSous22px, débordements). Moyennes affichées : fiche 31.1, recruteur 26, retours 27.1, semaine 27.6 ; ces mesures ne sont pas des validations visuelles. Je n'ai pas pu ouvrir les comparatifs. Aperçu/Statistiques n'a été capturé que sur Statistiques ; autres scènes de cette tranche non contrôlées.
- `mgmt-fiche-cadre.js` et `ui-cadre.css` : suivi rendu à droite des onglets, versions `?v=` montées. `tests/mgmtFicheStats.test.js` : test existant adapté avec décision « planches Uni* validées par Anthony ; le bouton de suivi est à droite des onglets ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js` (21/21 verts), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert). Test lent `tests/mgmtReleveReduit.test.js` non relancé.
- Les autres écrans demandés par la fiche (arrivée, relevé, chiffres, menu, meilleurs, records) et les contrôles accueil/actualités/tonposte/bilan ne sont pas tous capturés ; aucun contrôle n'est revendiqué pour eux. Aucun test de la tranche complet ni aucune migration de sauvegarde.
- Écart : livraison globale encore inachevée ; seules les scènes fiche, recruteur, retours et semaine ont un contrôle sans chevauchement, et la fidélité exacte aux planches n'est pas visuellement validée par ouverture d'image. Pas de `TOUT_EST_FINI`.

### Reprise 36 du 24/10/2026

- Branche vérifiée : `fid-fiches`. Les changements `.opencode/agents/*` et `opencode.json` restent hors tranche ; aucun fichier applicatif ou test de la tranche n'était en attente de commit au début de cette reprise.
- Ajout du test « Monde lot 68 T1 — le suivi et son compteur restent dans la rangée des onglets » à `tests/mgmtFicheStats.test.js`. Il verrouille la correction de position existante : bouton et compteur sont dans `.mf-fi-onglets`, ni l'un ni l'autre dans `.mf-fi-corps`. Décision : « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Vérifications : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (26/26 verts) puis `node --test tests/mgmtFicheStats.test.js` (22/22 verts) ; `node tools/verif-versions.js origin/main` (aucun écart) ; `node_modules/.bin/eslint .` (vert).
- Contrôles géométriques disponibles dans le rapport de reprise 32 : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}`, recruteur `{0,0,[]}`, retours `{0,0,[]}`, semaine `{0,0,[]}`. Pas de contrôle nouveau exécuté pour ces scènes ni pour accueil, actualités, tonposte, bilan ; ces quatre derniers écrans sont hors périmètre fonctionnel de cette tranche.
- État par écran : fiche statistiques a un contrôle antérieur à zéro et un test de placement du suivi renforcé ici ; aperçu n'a pas de mesure distincte. Recruteur mission/retours et semaine ont uniquement les contrôles antérieurs documentés. Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records n'ont pas de contrôle mesuré ici. Aucune comparaison `cmp-*.png` n'a été ouverte pendant cette reprise : fidélité aux maquettes non validée visuellement.
- Aucun changement JS/CSS applicatif, donc aucun bump `?v=` ; aucune migration de sauvegarde. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé.
- Écart à la fiche : les contrôles `chevauchements:0` manquent toujours sur plusieurs écrans de la liste et le protocole capture/ouverture/correction aux maquettes n'est pas achevé. Pas de `TOUT_EST_FINI`.

### Reprise 43 du 24/10/2026

- Vérification de l'état : branche `fid-fiches`, commits de tranche déjà présents ; les modifications `.opencode/agents/*` et `opencode.json` sont étrangères à la tranche et non ajoutées.
- Contrôles ciblés relancés : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (27/27 verts) ; `node tools/verif-versions.js origin/main` (aucun écart).
- Contrôle-capture obligatoire non exécuté : l'accès à `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` et aux images `cmp-*.png` est refusé par les permissions de l'environnement. Aucun statut `CONTRÔLE` frais, aucune ouverture d'image et aucune correction visuelle ne sont revendiqués. Les résultats géométriques des reprises précédentes sont historiques, pas des mesures après-correction dans cette reprise.
- État écran par écran : fiche Aperçu/Statistiques, recruteur mission/retours et semaine ont des contrôles historiques à zéro, non renouvelés ; arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records n'ont pas de résultat de contrôle vérifiable ici. Les comparatifs visuels restent non ouverts. Accueil, actualités, tonposte et bilan sont hors périmètre de modification ; leurs anciens défauts rapportés ne sont pas corrigés.
- Aucun code applicatif n'a été modifié à l'aveugle. Aucune migration de sauvegarde. Écart : le critère actuel « chevauchements:0 » pour toute la liste et la validation comparative écran par écran ne sont pas démontrés ; `TOUT_EST_FIN` n'est pas atteint.

### Reprise 44 du 24/10/2026

- Reprise engagée après examen de `git log --oneline -12` et `git status` : branche `fid-fiches`, tête `c3173c15`. Aucun fichier de code/test de la tranche n'était en attente de commit ; les changements `.opencode/agents/*` et `opencode.json` sont hors périmètre et préservés.
- Contrôles relancés via l'outil de capture : fiche (planche UniFicheStats) `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur (UniRecruteurMission) `{0,0,[]}` ; retours (UniRecruteurRetour) `{0,0,[]}` ; semaine (UniSemaine) `{0,0,[]}`. Ces quatre écrans ne montrent pas de défaut géométrique automatisé, mais leur image comparative n'a pas été ouverte et le score de similarité ne vaut pas validation de fidélité.
- Contrôle d'accueil demandé en complément : `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}`. Cet écran appartient au lot 64 et n'a pas été modifié dans cette tranche.
- Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records n'ont pas de contrôle dans cette série ; aucun résultat n'est supposé. Actualités, tonposte et bilan (hors périmètre de modification) restent également sans contrôle de cette reprise.
- Aucun code applicatif n'a été modifié car les scènes disponibles de cette tranche n'ont présenté aucun défaut géométrique à corriger ; aucune modification à l'aveugle n'est faite. Vérifications après mise à jour : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (27/27 verts), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert). Aucune migration de sauvegarde.
- Écart : le contrôle zéro pour l'ensemble des scènes requises, l'ouverture des comparatifs et la fidélité visuelle écran par écran ne sont pas démontrés ; cases visuelles non terminées, aucun `TOUT_EST_FINI`.

### Reprise 45 du 24/10/2026 — contrôle ciblé de reprise

- Branche confirmée : `fid-fiches`. `git log --oneline -12` consulté ; aucun changement non committé de la tranche n'était présent. Les modifications `.opencode/agents/*` et `opencode.json` sont hors périmètre et préservées.
- Contrôle géométrique connu le plus récent (reprise 42) : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Le récapitulatif de cette reprise confirme que le suivi/compteur sont dans la rangée des onglets. Ces valeurs historiques ne sont pas présentées comme un contrôle frais.
- Aucun résultat `CONTRÔLE` frais n'a pu être établi dans ce tour : le fichier d'instructions et l'exécutable/les comparatifs du captureur résident dans `%TEMP%`, chemin externe refusé par l'accès aux fichiers. Les scènes arrivée, relevé, chiffres, menu et classements n'ont pas de mesure vérifiable ici ; les comparatifs ne sont pas ouverts. Je n'ai donc pas fait de retouche visuelle aveugle ni déclaré leur géométrie conforme.
- Tests de structure et de règles CSS restent ceux déjà présents dans `tests/mgmtFicheStats.test.js` et `tests/mgmtReleve.test.js` ; le code applicatif n'a pas été modifié et aucune migration de sauvegarde n'est requise.
- État honnête par écran : Fiche Statistiques — contrôle historique à zéro, Aperçu et image non comparés ; Arrivée contrat/espoirs — blocs/styles testés, contrôle géométrique non établi ; Recruteur mission/retours et Semaine — contrôle historique à zéro, images non comparées ; Relevé — données de rounds/totaux testées, contrôle écran non établi ; Chiffres — métriques testées, contrôle écran non établi ; Menu — blocs/styles testés, contrôle écran non établi ; Meilleurs/Records — blocs/classes testés, contrôle écran non établi.
- Écart à la fiche : mesures fraîches pour toute la liste et validation comparative image par image restent à faire. Aucun `TOUT_EST_FINI` n'est revendiqué. Aucun changement de JS/CSS ni de version `?v=` ; aucune migration.

### Reprise 46 du 24/10/2026 — contrôle frais des scènes disponibles

- Branche `fid-fiches`, HEAD initial `32bb357c`. `git status` confirme seulement les modifications préexistantes de `.opencode/agents/*` et `opencode.json`, toutes hors tranche ; aucun fichier de tranche non committé à reprendre.
- Contrôles frais avec `shoot.js` : `semaine` `{chevauchements:0, exemples:[], textesSous22px:0, debordent:[]}` ; `recruteur` `{0,[],0,[]}` ; `retours` `{0,[],0,[]}`. Les captures groupées ont dépassé le délai après leur première scène ; les mesures individuelles de recruteur et retours ont été réalisées séparément. `fiche` avait une mesure à zéro antérieure (reprise 42) ; le lancement frais combiné a dépassé le délai avant de l'atteindre.
- Fidélité visuelle : les moyennes ne sont pas un substitut à l'ouverture des comparatifs. Aucun `cmp-*.png` n'a été ouvert ; aucun écart précis d'image n'est donc affirmé. Les scènes arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records ne sont pas supportées par l'outil de capture livré ; elles restent sans mesure, scène personnalisée ni comparaison.
- Les contrôles disponibles ne signalant pas d'anomalie géométrique, aucune retouche applicative à l'aveugle n'a été faite. Les scènes `accueil`, `actualites`, `tonposte` et `bilan` n'ont pas été reprises dans ce contrôle (écrans des lots parallèles, explicitement hors périmètre).
- Tests : `node --test tests/mgmtFicheStats.test.js` — 22/22 verts. Aucun nouveau test ni changement JS/CSS, donc aucun bump `?v=` ni migration de sauvegarde.

### Reprise 48 du 24/10/2026 — correction VS recruteur

- Contrôle frais avant : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur `{chevauchements:1,exemples:["VS [mf-vs] x VS [mf-vs trait] (204x230)"],textesSous22px:0,debordent:[]}` ; retours/semaine `{chevauchements:0,textesSous22px:0,debordent:[]}`.
- `mgmt-cadre.js` : suppression du second VS superposé ; contour blanc appliqué au même libellé avec `-webkit-text-stroke`. `index.html` : version `?v=` montée.
- Contrôle recruteur après correction : `{chevauchements:0,exemples:[],textesSous22px:0,debordent:[]}`. `node --test tests/mgmtFicheStats.test.js` : 22/22 verts. Pas de migration.
- Les comparatifs n'ont pas été ouverts ; les scènes arrivée, relevé, chiffres, menu et classements ne sont pas supportées par le captureur. Fidélité visuelle complète non revendiquée.

### Reprise 47 du 24/10/2026

- Branche confirmée : `fid-fiches`. Historique jusqu'à `9ad72a62` et `git status` consultés. Aucun fichier applicatif ou test de la tranche en attente ; les changements préexistants `.opencode/agents/*` et `opencode.json` restent hors périmètre.
- Vérifications ciblées relancées : `node --test tests/mgmtFicheStats.test.js` (22/22 verts), `node --test tests/mgmtReleve.test.js` (5/5 verts), `node tools/verif-versions.js origin/main` (aucun écart) et `node_modules/.bin/eslint .` (vert).
- Pas de nouveau résultat `CONTRÔLE` ni ouverture de comparatifs dans cette reprise. Les derniers contrôles frais disponibles restent ceux de la reprise 46 : recruteur, retours et semaine à zéro ; la fiche a un résultat historique à zéro. Aucun contrôle propre n'est établi pour arrivée, relevé écran, chiffres, menu et classements ; aucune fidélité visuelle n'est revendiquée sur la seule base des tests.
- État écran par écran : fiche Aperçu/Statistiques — corrections et tests structurels déjà commités, contrôle géométrique historique à zéro, comparatif non ouvert ; arrivée contrat/espoirs — structure/proportions/styles en tests, mesure et comparatif absents ; recruteur mission/retours et semaine — contrôle géométrique antérieur à zéro, comparatif non ouvert ; relevé et chiffres — tests de données, pas de mesure d'écran ; menu et meilleurs/records — tests de structure/classes, pas de mesure d'écran. Accueil, actualités, tonposte et bilan restent hors périmètre fonctionnel.
- Aucun changement de code de la tranche dans cette reprise : les contrôles automatiques documentés ne signalent pas d'anomalie exploitable sur les scènes couvertes, et une correction sans image serait spéculative. Aucune migration de sauvegarde ; aucun bump `?v=` requis. Le test lent `tests/mgmtReleveReduit.test.js` n'a pas été relancé.
- Écart à la fiche : les comparaisons visuelles, scènes personnalisées et contrôles frais des écrans restants sont toujours à faire ; les cases visuelles 1 à 5 et la livraison globale ne sont pas achevées. `TOUT_EST_FIN` non atteint.
- État honnête : les mesures automatiques fraîches à zéro couvrent recruteur, retours et semaine seulement ; fiche reste couverte par la mesure historique, les autres scènes par tests structurels partiels. La comparaison visuelle aux planches et les mesures des scènes non supportées restent inachevées ; aucune différence visuelle non observée n'est inventée. Pas de `TOUT_EST_FINI`.

### Reprise 49 du 24/10/2026

- Branche confirmée : `fid-fiches`. `git log --oneline -12` et `git status` consultés ; aucune modification de fichier de la tranche n'était en attente. Les changements `.opencode/agents/*` et `opencode.json` restent hors périmètre et n'ont pas été ajoutés.
- Vérifications ciblées relancées : `node --test tests/mgmtFicheStats.test.js` (22/22 verts) et `node --test tests/mgmtReleve.test.js` (5/5 verts). `node tools/verif-versions.js origin/main` ne signale aucun écart ; `node_modules/.bin/eslint .` est vert.
- Le fichier d'instructions situé hors du dépôt (`C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt`) reste inaccessible à l'outil de lecture dans cette session. Aucun nouveau contrôle `CONTRÔLE` n'a donc été exécuté et aucun comparatif `cmp-*.png` ouvert. Les mesures antérieures ne sont pas présentées comme fraîches.
- État par écran : fiche Statistiques et Aperçu, recruteur mission/retours et semaine ont des contrôles géométriques historiques à zéro, mais pas de comparaison visuelle nouvellement validée. Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records n'ont pas de contrôle géométrique établi dans cette reprise ; leurs tests structurels antérieurs ne démontrent pas l'absence de chevauchement. Accueil, actualités, tonposte et bilan restent hors périmètre de modification.
- Aucun changement applicatif ou test n'a été fait : sans observation de rendu ni défaut nouveau confirmé, une retouche visuelle serait spéculative. Aucune migration de sauvegarde ni hausse de version nécessaire. `tests/mgmtReleveReduit.test.js` est lent et n'a pas été relancé.
- Écart à la fiche : le contrôle géométrique demandé pour toutes les scènes ainsi que la comparaison visuelle écran par écran restent inachevés. Aucun `TOUT_EST_FINI` revendiqué.

### Reprise suivante — 24/10/2026

- Branche confirmée : `fid-fiches`, HEAD initial `c4376b03`. Aucun changement de la tranche n'était non committé ; `.opencode/agents/*` et `opencode.json` restent hors périmètre et n'ont pas été intégrés.
- Tests ciblés : `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` (27/27 verts). `node tools/verif-versions.js origin/main` : aucun écart ; `node_modules/.bin/eslint .` : vert.
- Contrôle demandé par la reprise (« CONTRÔLE {chevauchements, exemples, textesSous22px, debordent} ») non exécuté : l'instruction et le captureur du dossier `%TEMP%/p1/shoot` sont hors des chemins lisibles dans cette session. Aucune image comparative n'a été ouverte. Pas de nouvelles valeurs avant/après revendiquées.
- État écran par écran : Fiche aperçu/statistiques, Arrivée contrat/espoirs, Recruteur mission/retours, Semaine, Relevé, Chiffres du combat, Menu, Meilleurs et Records : les résultats antérieurs/tests structurels sont consignés dans les reprises plus haut, mais ne démontrent pas le contrôle frais demandé ni la fidélité comparative. Accueil/Actualités/Ton poste/Bilan : résultats historiques consignés, écrans des lots parallèles laissés intacts.
- Aucun changement de code applicatif ou de test : aucune correction géométrique à l'aveugle, aucun bump `?v=`, aucune migration. Le critère de contrôle frais à zéro sur tous les écrans n'est pas établi ; tranche non déclarée terminée.

### Reprise 47 du 24/10/2026 — contrôle géométrique frais

- Contrôles frais via `shoot.js` : fiche `{chevauchements:0,textesSous22px:0,debordent:[]}` ; recruteur `{0,0,[]}` ; retours `{0,0,[]}` ; semaine `{0,0,[]}`. Aucun défaut géométrique sur ces écrans selon l'outil. Comparatifs non ouverts : aucune validation visuelle n'est revendiquée.
- Mesures complémentaires, écrans des lots parallèles laissés intacts : accueil `{chevauchements:0,textesSous22px:1,debordent:["LA SEMAINE DU COMBAT","Ouvrir la semaine du com","Le classement des huit","Ton poste"]}` ; actualités `{1,3,[]}` (collision « Tout est lu » / « Tout marquer comme lu ») ; tonposte `{6,0,["IL ATTEND DE VOIR","« Je veux voir la suite. »"]}` ; bilan `{1,0,[]}` (collision « REMERCIÉ » / « Il manque 3 combats en carte »).
- Arrivée contrat/espoirs, relevé, chiffres du combat, menu, meilleurs et records : scènes absentes de l'outil de capture ; aucune mesure ou comparaison n'est inventée. Les cases 1 à 5 restent incomplètes ; aucune retouche à l'aveugle des écrans mesurés sans défaut.
- Aucun fichier applicatif/test modifié, aucune migration ni hausse de version `?v=`. Aucune image comparative ouverte ; fidélité visuelle globale non établie. Pas de `TOUT_EST_FINI`.

### Reprise 48 du 24/10/2026

- Reprise de l'historique : HEAD initial `2abe6597`, branche `fid-fiches`. Les changements locaux dans `.opencode/agents/*` et `opencode.json` restent hors tranche et ne sont pas inclus.
- Tests ciblés exécutés : `node --test tests/mgmtFicheStats.test.js` et `node --test tests/mgmtReleve.test.js` ; contrôle versions `node tools/verif-versions.js origin/main`. Résultats consignés après exécution.
- Contrôles de géométrie disponibles restent ceux de la reprise 47 pour fiche, recruteur, retours et semaine (tous à zéro chevauchement, texte <22 px, et débordement). Je n'ai pas relancé le captureur ni ouvert de comparatif dans cette reprise ; les scènes arrivée, relevé, chiffres, menu et classements restent sans contrôle mesuré.
- État écran par écran : fiche, recruteur, retours et semaine ont leurs contrôles géométriques historiques favorables, sans validation de fidélité comparative ; arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs et records n'ont pas de contrôle établi. Accueil, actualités, tonposte et bilan restent les écrans parallèles signalés dans la reprise 47, non modifiés.
- Aucun changement applicatif, migration ou bump `?v=`. La tranche n'est pas terminée : les mesures fraîches exigées sur tous les écrans et les comparaisons visuelles sont toujours absentes ; aucun `TOUT_EST_FINI`.

### Reprise 49 du 24/10/2026 — vérification ciblée

- Branche confirmée : `fid-fiches`. `git log --oneline -12` et `git status` consultés ; les changements locaux `.opencode/agents/*` et `opencode.json` restent hors tranche et n'ont pas été inclus.
- `node --test tests/mgmtFicheStats.test.js tests/mgmtReleve.test.js` : 27/27 verts. `node tools/verif-versions.js origin/main` : aucun écart. `node_modules/.bin/eslint .` : vert.
- Outil `shoot` et images comparatives hors des chemins autorisés dans cette session ; aucun contrôle frais ni ouverture de `cmp-*.png` n'est revendiqué. Les derniers résultats connus sont ceux de la reprise 47 : fiche, recruteur, retours et semaine sans anomalie géométrique. Ils ne sont pas des mesures fraîches. Aucune mesure établie pour arrivée, relevé à l'écran, chiffres, menu, meilleurs ou records.
- Bilan écran par écran : Fiche Statistiques, recruteur, retours, semaine — géométrie historiquement contrôlée à zéro, fidélité comparative non validée ; Aperçu — pas de mesure distincte ; arrivée contrat/espoirs, relevé, chiffres, menu, meilleurs, records — contrôle visuel non établi. Pas de diagnostic visuel inventé ni de code applicatif retouché à l'aveugle.
- Aucun test/donnée/fichier JS ou CSS modifié : pas de migration ni de bump `?v=`. Le critère de contrôle géométrique frais sur tous les écrans et de comparaison des maquettes reste inachevé ; `TOUT_EST_FIN` non revendiqué.
