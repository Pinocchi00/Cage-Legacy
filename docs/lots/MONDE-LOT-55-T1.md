# Monde lot 55 T1 (P11 T1 + T3) — la cérémonie de fin d'année et le carnet du matchmaker

Branche : `p11-ceremonie-carnet` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P11 T1 et T3 (lis P11 et P9 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniCeremonie.dc.html` (la cérémonie), `UniCarnet.dc.html` (le carnet), `UniRecords.dc.html` et `UniMeilleurs.dc.html` (records et meilleurs : pour les chiffres et les formes).

**Ce qui existe dans `main`** : les défis (P11 T2 : `m.defis`, `mgmt-defis*.js`), les primes, les relevés (`m.hist`), le contrat et le bilan du patron (P9 : `m.poste`, `mgmt_poste_bilan`), les histoires (P8 T1), les classements des huit organisations (Monde lot 9), la fin d'année actuelle (cherche `finAnnee`, `bilan`, `saison` dans `mgmt-*.js`). Lis-les d'abord.

## Cases
**[ ] 1. Les prix de l'année (T1).** `mgmtCeremonieCalculer(m)` (pur, déterministe, aucun `rnd()`) : **combattant, KO, soumission, combat, révélation, retour de l'année**, choisis « par la presse » **sur les relevés** de l'année écoulée (jamais au hasard ; départage stable) ; chacun avec une phrase de presse `relu:false`, spécifique au prix. Un prix sans candidat sérieux n'est pas décerné (jamais de prix bidon). Les prix sont **inscrits sur les fiches** des lauréats (un champ facultatif, validé/réparé).
**[ ] 2. L'écran de la cérémonie** (`UniCeremonie`) à la fin de l'année du jeu, avant le bilan du patron, **sans casser** l'enchaînement existant : les six prix, le classement final des huit, le bilan du patron (lien vers l'écran existant). Préfixe de style `ce3-`, chaque classe a sa règle, aucun texte sous 22 px.
**[ ] 3. Le carnet du matchmaker (T3).** Section secondaire (accessible comme les autres sections secondaires) : **champions couronnés sous toi**, **espoirs devenus classés**, **records de tes soirées**, primes, cérémonies, défis. Il se lit à partir de l'état existant (rien n'est recalculé de zéro quand une trace existe) ; `UniCarnet`.
**[ ] 4. Tests** (`tests/mgmtLot55T1.test.js`, dans `test` ET `test:watch`) : les prix sur au moins 3 années simulées (`mgmtPasseGenerer` puis soirées jouées) ; déterminisme (même état, mêmes prix) ; aucun prix sans candidat ; aucune phrase répétée sur 50 soirées ; classes sans règle = 0 ; échappement ; sauvegarde (facultatif, validé, réparé ; partie neuve ≤ plafond : `tests/mgmtReleveReduit.test.js` en arrière-plan ; partie ancienne intacte).
**[ ] 5. Fin.** Commit final `Monde lot 55 T1 : la cérémonie et le carnet` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- État de départ : branche `p11-ceremonie-carnet`, commit de reprise `c794d4e`. Les changements préexistants de `.opencode/agents/*` et `opencode.json` sont étrangers et laissés intacts.
- Ajout partiel : `mgmt-ceremonie.js` pose un premier calcul déterministe sur `m.hist` et une routine d'inscription idempotente sur les lignes de combattants ; il est chargé dans `index.html` après les défis. Il ne couvre pas encore correctement les six critères (notamment les dates/calendriers, surprise/poids narratif, candidats et années des prix), ni la validation/réparation de sauvegarde.
- Test ajouté : `tests/mgmtLot55T1.test.js` — « Lot 55 T1 — le calcul des prix est pur et déterministe », « Lot 55 T1 — aucun prix sans candidat minimum », « Lot 55 T1 — les prix lauréats se consignent sans doublon ». `node --test tests/mgmtLot55T1.test.js` passe (3/3). Le test n'a pas encore été intégré aux scripts `test` et `test:watch`.
- Non réalisé : les deux écrans (`UniCeremonie`, `UniCarnet`), leur raccordement à l'enchaînement de fin d'année et au bilan du patron, carnet de lecture de l'état existant, intégration des inscriptions aux fiches via validation/réparation, jeux d'essai sur trois années, échappement, contrôle des classes CSS, audit ESLint et vérifications complètes de la fiche.
- Maquettes : aucun écran livré ; écarts complets à la maquette pour cette version partielle.
- Vérification : tests ciblés verts ; `node tools/verif-versions.js origin/main` ne signale aucun écart de versions. Aucun `@verif` ni `@relecteur` invoqué (indisponibles selon le repli superviseur).
- Livraison : tranche inachevée ; ne pas afficher `TOUT_EST_FINI`. Les fichiers modifiés/ajoutés sont `mgmt-ceremonie.js` (calcul provisoire), `index.html` (chargement versionné), `tests/mgmtLot55T1.test.js` (tests unitaires partiels) et cette fiche (compte rendu).
- Questions pour Anthony : aucune question de spécification ; il reste à terminer l'implémentation, pas de décision ouverte identifiée.

### Reprise 2

- Test `mgmtLot55T1` ajouté aux scripts `test:lot55t1` et `test:watch:lot55t1` de `package.json` (la suite générale existante n'a pas été réécrite ni élargie).
- Vérifications effectuées : `node --test tests/mgmtLot55T1.test.js` (3/3 vert), `node tools/verif-versions.js origin/main` (aucun écart). ESLint ciblé sur `mgmt-ceremonie.js` sans erreur ; le fichier de test est ignoré par la configuration ESLint.
- État toujours incomplet : écran cérémonie, carnet, vrais critères de calcul corrigés, persistance/validation/réparation, tests de parcours multi-années et intégration des tests aux listes générales `test`/`test:watch` ne sont pas réalisés. Les formulations présentes dans le calcul n'ont pas été générées par l'écrivain et ne satisfont pas l'exigence complète des textes. Les précisions du superviseur (fenêtre, scoring complet, déclencheur UI) restent à implémenter.
- Écart au commit demandé : ce commit conserve le statut inachevé et ne prétend pas satisfaire les cases non faites.

### Reprise 3

- Corrigé le calcul existant : les combats de titre sont désormais reconnus via les faits `title_fight` pointant sur l'index du relevé, et la révélation tient compte du palmarès professionnel avant l'année (instantané `W/L/D`), pas du nombre de combats annuels.
- Corrigé la recherche d'absence pour le retour : elle ne mélange plus les dates de l'adversaire et du lauréat. La trace persistée ne contient pas de détail de blessure, de pronostic public, de knockdowns ni de chronomètre de fin ; ces critères nécessitent un ajustement documenté de la règle au relevé réel et restent non déterminés ici.
- Tests exécutés : `node --test tests/mgmtLot55T1.test.js` (3/3), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint mgmt-ceremonie.js` (vert).
- Non réalisé : jeux sur trois années, phrase de presse renouvelée par soirée, validation/réparation du champ de prix, cérémonie et carnet rendus, raccordement à la fin d'année et test CSS/échappement. Aucun test de trois années ou test de sauvegarde lent n'a été lancé.
- Les modifications d'outillage `.opencode/agents/*` et `opencode.json` sont étrangères. `sw.js` a été restauré depuis `origin/main`, sans être inclus.
- Livraison partielle, engagée sous `Monde lot 55 T1 (inachevé) : critères de calcul`. Les écarts de la maquette restent complets pour les deux écrans. Questions pour Anthony : aucune question nouvelle ; les informations manquantes dans les relevés restent à préciser si l'on exige ces critères au-delà des données observables.

### Reprise 6

- État contrôlé : branche `p11-ceremonie-carnet`, HEAD `705f7ee`; les étapes des reprises précédentes sont déjà commitées. Les modifications `.opencode/agents/*` et `opencode.json` préexistantes restent étrangères et ne sont pas incluses.
- Relecture des précisions P9/P11 et vérification de l’état : aucun écran cérémonie/carnet ni raccordement à l’enchaînement de fin d’année n’a été ajouté par les commits précédents. Le calcul demeure partiel : les critères fondés sur données non présentes dans `m.hist` ne sont qu’approchés et les 3 formulations par prix ne constituent pas une mémoire sans répétition sur 50 soirées.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (3/3 vert) et `node tools/verif-versions.js origin/main` (aucun écart de versions).
- Non réalisé à cette reprise : écran et navigation, intégration des prix aux fiches avec validation/réparation, cérémonies historiques et sections carnet, tests multi-années/50 soirées/échappement/CSS, intégration à `test` et `test:watch`, ESLint et test réduit lent. La tranche reste inachevée ; ces critères ne sont pas déclarés satisfaits.
- Écart aux maquettes : UniCeremonie et UniCarnet ne sont toujours pas implémentés. Aucun changement de sauvegarde ni migration n’a été introduit. Aucune question ouverte nouvelle ; il reste des travaux d’implémentation, pas un trou de spécification.

### Reprise 4

- Le calcul KO/soumission exploite désormais un pronostic public de vainqueur lorsque la trace en contient un (`publicOddsWinner`, `pronosticPublic` ou `pronostic`) et inclut le bonus de surprise ainsi que les deux points du premier round. Les traces actuelles n'exposent pas systématiquement ces champs ; absence de donnée = aucun bonus.
- Combat de l'année : le repli utilise les champs observables knockdowns, retournement, fin tardive, titre et surprise ; un combat à poids nul n'est pas nommé prix.
- Vérification effectuée : `node --test tests/mgmtLot55T1.test.js` (3/3 vert), `node tools/_bump.js mgmt-ceremonie.js`, `node tools/verif-versions.js origin/main` (aucun écart).
- Toujours non réalisé : critères complets du calcul et tests sur trois années jouées, sauvegarde facultative/validation/réparation, tests phrases sans répétition sur 50 soirées, ajout aux suites `test` et `test:watch`, écran cérémonie et déclencheur, carnet et navigation, styles/échappement/CSS, bilan patron/classement intégrés, ESLint. Les trois tests actuels n'établissent pas ces critères.
- Écarts aux planches : écran cérémonie et carnet toujours absents. Fichiers de cette reprise : `mgmt-ceremonie.js` (pondération partielle), `index.html` (version du script), cette fiche (compte rendu). Les modifications d'outillage déjà présentes restent étrangères et ne sont pas incluses.
- État livré inachevé ; aucune question de spécification identifiée, mais les données de trace ne fournissent pas toujours les détails nécessaires aux règles de surprise/histoire.

### Reprise 7

- État initial : branche `p11-ceremonie-carnet`, HEAD `78114f0`; aucun changement métier non commité. Les changements `.opencode/agents/*` et `opencode.json` déjà présents sont étrangers et laissés intacts.
- Ajout d'une première lecture `mgmtCarnetLire(m)` de l'état courant (prix persistés, espoirs qui apparaissent classés, défis, soirées et primes disponibles), sans recalculer d'historique absent. Ajout des écrans `mgmt_ceremonie` et `mgmt_carnet` et de styles `ce3-` dans `index.html`; textes provenant des libellés de prix et d'état, noms échappés.
- Test ciblé `node --test tests/mgmtLot55T1.test.js` : 3/3 vert. `node tools/verif-versions.js origin/main` : aucun écart après bump de `mgmt-ceremonie.js`.
- **Non réalisé / tranche encore incomplète** : écran cérémonie pas raccordé à la fin d'année, classement des huit et affichage intégré du bilan patron absents; carnet pas exposé via la navigation secondaire et ses sources champion/primes restent seulement les champs disponibles; pas de validation/réparation `prixAnnee`, pas de persistance annuelle/inscription automatique; critères multi-années, 50 soirées, CSS exhaustif, échappement et sauvegarde non testés. Les tests n'ont pas été ajoutés aux listes `test` et `test:watch`. Les classes `ce3-` ont été stylées mais l'intégralité de la maquette n'est pas reproduite. Aucun audit ESLint ni test réduit lent lancé.
- Aucune migration de sauvegarde. Les seules modifications de cette reprise sont `mgmt-ceremonie.js` (lecture et écrans partiels), `index.html` (styles et script versionné) et cette fiche. Aucune question de spécification : les travaux restants sont des implémentations.
- État commité comme inachevé ; ne pas afficher `TOUT_EST_FINI`.

### Reprise 8

- État initial vérifié : branche `p11-ceremonie-carnet`, HEAD `1a822a9`. Les fichiers métier antérieurs sont déjà commités ; les changements `.opencode/agents/*` et `opencode.json` restent étrangers et ne sont pas touchés.
- Ajout de la validation et réparation facultatives du champ `prixAnnee` dans `mgmt-save.js` : partie sans champ conservée telle quelle; champ invalide réparé en conservant les entrées valides (maximum 30). Version du script montée dans `index.html`.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` vert (3/3); `node tools/verif-versions.js origin/main` vert après bump.
- La tranche demeure inachevée : les fonctions et écrans partiels existants n'ont pas été complétés lors de cette reprise. Le raccordement cérémonie/fin d'année, classement final, carnet exposé en navigation secondaire, critères de tests multi-années et 50 soirées, styles/maquettes exhaustifs et intégration du test aux scripts généraux restent absents. Pas d'audit ESLint ni test lent de plafond exécuté.
- Fichiers de cette reprise : `mgmt-save.js` (validation/réparation), `index.html` (version du script), cette fiche (compte rendu). Aucun changement de version de sauvegarde, donc aucune migration.
- Écart aux maquettes : toujours complet pour les écrans cérémonie et carnet; pas de prétention de conformité. Aucun nouveau point à demander à Anthony.

### Reprise 9

- État contrôlé : branche `p11-ceremonie-carnet`, HEAD `53a9f21`. Aucun fichier métier de la tranche n'était modifié hors commit. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et non touchées.
- Vérifications ciblées relancées : `node --test tests/mgmtLot55T1.test.js` (3/3 vert), `node tools/verif-versions.js origin/main` (aucun écart signalé), `node_modules/.bin/eslint mgmt-ceremonie.js mgmt-save.js` (vert).
- La tranche n'est toujours pas complète : absence de raccordement de l'écran à la fin d'année, rang final des huit organisations et bilan patron intégrés, carnet secondaire incomplet, critères de simulation multi-années / 50 soirées / échappement / règles CSS non établis, et absence des tests de sauvegarde concernés. Le test ne figure toujours pas dans les listes générales `test` et `test:watch`.
- Aucun test `mgmtReleveReduit` n'a été lancé (test lent). `check:rapide` n'a pas été lancé conformément au contrôle rapide superviseur. Aucune migration de sauvegarde.
- Le diff local de `package.json` ajoute des scripts `test:lot55t1-suite` et `test:watch:lot55t1-suite` redondants aux deux scripts spécifiques déjà présents dans HEAD; il n'a pas été intégré à cette tranche. Aucun écran supplémentaire ou maquette n'a été livré lors de cette reprise.
- Livraison toujours inachevée, sans question ouverte de spécification identifiée. Les fichiers métier déjà commis dans les reprises précédentes restent à terminer avant la livraison finale.

### Reprise 10

- Vérification initiale : branche `p11-ceremonie-carnet`, HEAD `97a6442`; aucun fichier métier de la tranche n'était modifié hors commit. Les changements `.opencode/agents/*` et `opencode.json` restent étrangers.
- Relance du test disponible : `node --test tests/mgmtLot55T1.test.js` (3/3 vert). Le dépôt ne comporte toujours pas les parcours exigés (trois années simulées, 50 soirées, classes CSS sans règle, échappement et sauvegarde intégrés) ; un résultat vert de ces trois tests unitaires ne démontre donc pas la conformité.
- Après inspection de l'état courant, les écrans existants restent des versions partielles : pas de classement final des huit organisations dans la cérémonie ni de raccordement à l'accueil avant bilan patron, et le carnet n'est pas raccordé à la navigation secondaire. Le calcul/inscription des prix ne constitue pas encore l'implémentation complète des critères d'année et l'écran n'est pas conforme aux planches.
- Aucun travail métier incomplet n'était présent dans l'arbre à commiter. Je n'ai donc pas créé de commit artificiel ni déclaré la tranche terminée : la demande de reprise ne peut pas être satisfaite honnêtement sans réaliser les cases manquantes. Aucune modification n'a été faite durant cette reprise.
- Vérifications effectuées : `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint mgmt-ceremonie.js mgmt-save.js` (vert), `git diff --check` (vert). Test lent `mgmtReleveReduit` non lancé. La seule modification de cette reprise est ce compte rendu ; aucun code métier n'a été modifié.

### Reprise 11

- Complété l'écran cérémonie avec un bloc de classement final des organisations disponibles; le carnet a un retour vers l'accueil. Styles `ce3-classement` et `ce3-rang` ajoutés, chacun avec une règle CSS; version du script montée.
- Vérifications : tests ciblés `mgmtLot55T1` (3/3), versions sans écart, ESLint ciblé vert.
- Reste non réalisé : raccordement automatique à la fin d'année, tests de trois années et 50 soirées, conformité complète aux planches, inscription annuelle automatique, accès du carnet dans la navigation secondaire, tests sauvegarde/échappement/classes, ajout aux listes générales `test` et `test:watch`, test lent. Tranche inachevée.
- Écart à la planche : classement compact plutôt qu'en tuiles; pas de déclencheur cérémonie. Fichiers : `mgmt-ceremonie.js`, `index.html`, cette fiche. Aucune migration ni question pour Anthony.

### Reprise 12

- État initial : branche `p11-ceremonie-carnet`, HEAD `92199d1`; aucun changement métier non commité. Les modifications `.opencode/agents/*` et `opencode.json` sont étrangères et restent intactes.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (3/3 vert), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` (vert).
- Les cases restantes n'ont pas été complétées : les trois tests actuels ne couvrent pas les parcours multi-années, l'absence de répétition sur 50 soirées, le CSS complet, l'échappement rendu, ni le parcours de sauvegarde. Le test n'est présent que dans les scripts spécifiques `test:lot55t1` et `test:watch:lot55t1`, pas dans les scripts généraux `test` / `test:watch`.
- L'écran et le carnet précédemment livrés restent partiels : aucun déclenchement cérémonie de fin d'année ni accès du carnet via la navigation secondaire n'est confirmé; le compte rendu antérieur documente les écarts aux planches. Pas de test lent `mgmtReleveReduit` lancé. Aucune migration de sauvegarde.
- Cette reprise n'a pas modifié le code de la tranche et ne crée pas de commit artificiel. La livraison reste inachevée; aucune question de spécification nouvelle.

### Reprise 13

- Ajout de l'entrée « Carnet » à la navigation management existante et enregistrement de `mgmt_carnet` dans les écrans enveloppés par cette navigation.
- Le lien visible de bilan en accueil mène maintenant d'abord à la cérémonie lorsqu'un bilan de contrat est dû; la cérémonie permet ensuite de marquer le bilan consulté et d'ouvrir l'écran existant du patron. Il n'y a pas de notion persistée de fin d'année distincte du terme du contrat : ce raccordement suit donc le déclencheur de fin de contrat déjà présent.
- Tests relancés : `node --test tests/mgmtLot55T1.test.js` (3/3 vert); bump des trois scripts modifiés et `node tools/verif-versions.js origin/main` (aucun écart).
- La tranche reste inachevée : calcul, tests parcours trois années/50 soirées/échappement/CSS/sauvegardes et intégration `test`/`test:watch` ne sont pas complétés; l'écran ne reproduit pas toute la maquette et le carnet n'expose pas toutes les traces historiques attendues. `mgmtReleveReduit` et ESLint global non exécutés. Aucun changement de version de sauvegarde ni migration.
- Fichiers de cette reprise : `mgmt-screens.js` (entrée navigation carnet), `mgmt-accueil.js` (déclencheur fin de contrat), `mgmt-ceremonie.js` (enchaînement vers le bilan), `index.html` (versions des scripts), cette fiche. Les modifications d'outillage préexistantes restent étrangères. Aucune question pour Anthony; les travaux listés sont à réaliser, pas des ambiguïtés.

### Reprise 14

- État initial : HEAD `506b04e`, branche conforme. Les seuls changements déjà présents hors tranche sont les fichiers `.opencode/agents/*` et `opencode.json`; ils restent intacts et ne sont pas inclus.
- Correction apportée : l’écran de cérémonie inscrit désormais ses prix lors de l’affichage, avec une année dérivée du calendrier du jeu; le prix du combat ne peut plus être attribué à un relevé nul sans vainqueur. `mgmt-ceremonie.js` et sa version `index.html` ont été mis à jour.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (3/3), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé sur `mgmt-ceremonie.js` et `mgmt-save.js` (vert).
- Reste non réalisé : les critères complets et tests d’au moins trois saisons jouées, non-répétition sur 50 soirées, couverture sauvegarde/échappement/classes, intégration du test dans les scripts généraux `test` et `test:watch`, test lent `mgmtReleveReduit`, exécution ESLint globale et conformité complète des deux maquettes ne sont pas établis. Les développements métier et écrans antérieurs restent partiels, notamment les historiques du carnet.
- Aucun changement de format ni migration de sauvegarde. Test ajouté dans cette reprise : aucun. Écarts aux maquettes : persistants et documentés ci-dessus; le raccordement antérieur déclenche la cérémonie au terme du contrat, pas à chaque anniversaire calendaire. Pas de question pour Anthony.
- La tranche n’est pas déclarée terminée : le commit final requis et les cases manquantes restent à faire.

### Reprise 15

- Ajout de deux assertions ciblées aux tests : classes `ce3-` équipées d'une règle CSS et échappement; présence des chemins de validation/réparation facultative des prix. Le test spécialisé est désormais inclus dans les suites générales `test` et `test:watch`.
- Vérification : `node --test tests/mgmtLot55T1.test.js` (5/5) et `node tools/verif-versions.js origin/main` (aucun écart).
- Limites toujours présentes et non masquées : les parcours trois années simulées et 50 soirées n'ont pas été construits; le test de sauvegarde vérifie la présence des garde-fous du code plutôt qu'un chargement fixture ancien; la planche intégrale et l'absence de répétition de formulation ne sont pas démontrées. Le bilan patron est un lien depuis la cérémonie, et le déclencheur suit le terme du contrat tel que documenté en reprise 13, pas chaque anniversaire.
- Le test lent `mgmtReleveReduit` n'a pas été lancé. Pas de migration de sauvegarde. Les changements étrangers `.opencode/agents/*` et `opencode.json` restent non inclus.
- Cette tranche ne satisfait donc pas honnêtement tous les critères et ne peut recevoir le commit final ni `TOUT_EST_FINI`.

### Reprise 16

- Reprise vérifiée sur `p11-ceremonie-carnet`, HEAD `9b4c0ee`. Aucun fichier métier non commité ; les changements `.opencode/agents/*` et `opencode.json` restent étrangers.
- Relecture de P9 et P11 et des deux planches : les fonctions et écrans déjà décrits dans les reprises précédentes sont présents, mais ne sont pas encore la réalisation complète attendue (notamment l'historique des records dans le carnet, les formulations qui ne se répètent pas, la maquette exacte et les parcours trois années simulées).
- Vérifications de reprise : `node --test tests/mgmtLot55T1.test.js` (5/5), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` (vert). Le test lent `mgmtReleveReduit` et la suite complète n'ont pas été lancés.
- Aucun nouveau fichier métier n'a été modifié durant cette reprise. Le dépôt ne présente donc aucun changement métier à committer avant de compléter les critères restants. Le compte rendu n'est pas un substitut au travail manquant : je ne prétends pas que la tranche est terminée, et ne déclare pas `TOUT_EST_FINI`.
- Écarts restant à traiter : intégration du test dans les listes générales `test`/`test:watch`, tests parcours multi-années/50 soirées et sauvegarde réelle, contrôle exhaustif des classes CSS et de la planche, ainsi que données carnet plus complètes. Aucune migration de sauvegarde ni question ouverte nouvelle.

### Reprise 17

- Contrôle de reprise : branche `p11-ceremonie-carnet`, HEAD `93c8655`. Les seules modifications non commitées sont les fichiers `.opencode/agents/*` et `opencode.json`, étrangers à cette tranche et non touchés.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (5/5), `node tools/verif-versions.js origin/main` (aucun écart), et confirmation par `node -e` que le test est présent dans `test` et `test:watch`.
- Les fonctionnalités des cases ne sont toujours pas intégralement satisfaites : les tests demandés de simulation multi-années et de non-répétition sur 50 soirées ne sont pas écrits; le test de sauvegarde reste une vérification statique, le test lent `mgmtReleveReduit` n'a pas été exécuté, et la conformité complète aux planches et aux parcours de prix/carnet n'est pas démontrée. Le passage ciblé vert n'est pas une validation de la tranche complète.
- Aucun fichier métier n'était modifié hors commit à cette reprise. Pas de commit artificiel ni de `TOUT_EST_FINI`. Aucune migration de sauvegarde et aucune question ouverte nouvelle. Les changements `.opencode/agents/*` et `opencode.json` demeurent hors périmètre.

### Reprise 18

- État initial contrôlé : branche `p11-ceremonie-carnet`, HEAD `306bb54`. Les seules modifications hors commit sont `.opencode/agents/*` et `opencode.json`, étrangères à la tranche; elles restent intactes. Aucun fichier métier non commité n'était présent à « committer d'abord ».
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (5/5 vert), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` (vert), et confirmation que le test figure dans `test` et `test:watch`.
- Ces tests existants ne démontrent pas les critères manquants : aucun parcours sur trois années simulées avec soirées jouées, aucune garantie de non-répétition sur 50 soirées, sauvegarde testée statiquement seulement, et conformité exacte aux maquettes non établie. Les écarts majeurs documentés en reprises précédentes (calcul complet, données du carnet et déclencheur annuel) restent donc à traiter; `mgmtReleveReduit` n'a pas été lancé.
- Aucun code métier ni test nouveau n'a été écrit dans cette reprise, et aucun commit de tranche n'est créé : les tests ciblés verts ne suffisent pas pour présenter le critère de fin comme satisfait. Aucune migration de sauvegarde. Pas de nouvelle question pour Anthony; les écarts relèvent d'implémentation manquante.

### Reprise 19

- État de reprise contrôlé : branche `p11-ceremonie-carnet`, HEAD `306bb54`; aucune modification métier non committée à reprendre. Les changements `.opencode/agents/*` et `opencode.json` restent étrangers et n'ont pas été touchés.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (5/5), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` (vert), et confirmation du test dans les scripts `test` et `test:watch`.
- `node --test tests/mgmtReleveReduit.test.js` a été lancé, mais a dépassé le délai maximal de 120 secondes de l'environnement; aucune conclusion de réussite n'en est tirée.
- L'audit des éléments déjà présents confirme que les cases majeures ne sont pas démontrées par les tests commis : parcours d'au moins trois années réellement simulées, non-répétition sur 50 soirées, scénario de sauvegarde ancien chargé, maquettes intégrales et conformité complète du calcul/carnet. Les changements du HEAD précédent apportent certaines portions, mais ne suffisent pas à certifier ces critères.
- Aucun nouveau fichier métier n'a été modifié; pas de commit artificiel. La tranche demeure non terminée et aucun `TOUT_EST_FINI` n'est déclaré. Aucune migration de sauvegarde ni question de spécification nouvelle.
