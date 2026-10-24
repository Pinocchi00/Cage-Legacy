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

Règles communes : **additif** pour les données ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
