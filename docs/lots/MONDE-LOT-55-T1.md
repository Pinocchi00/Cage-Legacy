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

### Reprise 25

- Vérification initiale : branche `p11-ceremonie-carnet`, HEAD `611885e`; aucun changement métier en attente à l'ouverture. Les fichiers `.opencode/agents/*` et `opencode.json` restent des modifications étrangères, non ajoutées.
- Correction concrète : le prix du retour consulte maintenant également les combats antérieurs à la fenêtre annuelle pour déterminer les 182 jours d'absence. Auparavant, l'historique était tronqué à l'année et pouvait omettre le dernier combat ayant précédé la période observée.
- Nouveau test : « Lot 55 T1 — le retour tient compte du dernier combat avant la fenêtre annuelle ». Tests ciblés `node --test tests/mgmtLot55T1.test.js` : 8/8 verts, avant et après la montée de version `mgmt-ceremonie.js`.
- `node tools/verif-versions.js origin/main` n'est pas vert : il signale `mgmt-accueil.js` comme modifié relativement à `origin/main` avec son numéro de version de base. Ce fichier n'est pas modifié dans mon arbre de travail et est hors de cette tranche; je ne l'ai pas touché.
- Les travaux à faire demeurent importants : simulation réelle multi-années, preuve de non-répétition sur 50 soirées, test de chargement d'une sauvegarde ancienne, test lent de plafond, ESLint global, conformité visuelle complète aux deux planches et complétude de la lecture du carnet. Le changement de cette reprise ne suffit pas à les satisfaire. Aucun test lent ni `check:rapide` n'a été lancé.
- Pas de migration de sauvegarde. Fichiers de cette reprise : `mgmt-ceremonie.js`, `tests/mgmtLot55T1.test.js`, et cette fiche. Le compte rendu n'affirme pas la fin de la tranche; aucun point ouvert n'est posé à Anthony.

### Reprise 20

- Contrôle initial : branche `p11-ceremonie-carnet`, HEAD `764c779`. Aucun fichier métier de la tranche n'était modifié hors commit. Les changements `.opencode/agents/*` et `opencode.json` restent étrangers et intacts.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (5/5 vert), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint mgmt-ceremonie.js mgmt-save.js` (vert). Confirmation : `mgmtLot55T1.test.js` figure déjà dans les scripts généraux `test` et `test:watch`.
- La vérification ciblée ne valide pas les cases encore manquantes décrites précédemment : parcours d'au moins trois années jouées, non-répétition testée sur 50 soirées, scénario complet de chargement d'une ancienne sauvegarde, et conformité intégrale aux maquettes. Le carnet et le calcul ne sont pas certifiés complets par les cinq assertions présentes. `mgmtReleveReduit` n'a pas été lancé dans cette reprise.
- Aucun fichier métier n'a été modifié et aucun commit artificiel n'a été créé. Pas de migration de sauvegarde ni de question nouvelle pour Anthony. Le compte rendu consigne les contrôles, mais ne déclare pas la tranche terminée.

### Reprise 21

- Contrôles de reprise : branche conforme (`p11-ceremonie-carnet`), HEAD `764c779`; changements préexistants `.opencode/agents/*` et `opencode.json` restent hors périmètre. Le seul diff de tranche à l'ouverture était ce compte rendu.
- Relancé `node --test tests/mgmtLot55T1.test.js` : 5/5 passent. `node tools/verif-versions.js origin/main` : aucun écart de version. ESLint ciblé sur `mgmt-ceremonie.js` et `mgmt-save.js` : aucune erreur.
- Le code n'a pas été modifié : ces contrôles ne couvrent pas le parcours multi-années réellement joué, l'absence de répétition des formulations sur 50 soirées, le chargement effectif d'une sauvegarde ancienne ni la conformité intégrale des deux maquettes. Le test `mgmtReleveReduit` et ESLint global n'ont pas été exécutés. `check:rapide` n'est pas lancé conformément au contrôle rapide du superviseur.
- Il reste des critères d'implémentation/tests non satisfaits; le commit final demandé et `TOUT_EST_FINI` ne sont donc pas revendiqués. Aucune migration de sauvegarde et aucune question ouverte nouvelle.

### Reprise 22

- Ajout de deux tests ciblés au fichier existant : vérification de la fenêtre de relevés annuelle avec un changement de trace, et absence de prix de finition/combat lorsqu'aucun candidat ne remplit les minima. Les 7 tests ciblés passent.
- Audits exécutés : `node tools/verif-versions.js origin/main` (aucun écart de version); ESLint ciblé n'a rapporté aucune erreur (le test est ignoré par la configuration). Confirmation que le test figure déjà dans les scripts généraux `test` et `test:watch`.
- Non démontré et toujours incomplet : le parcours `mgmtPasseGenerer` avec soirées réellement jouées sur trois années, non-répétition des phrases sur 50 soirées, chargement réel d'une sauvegarde ancienne, le test lent `mgmtReleveReduit`, l'ESLint global et conformité exacte des deux maquettes. Les limites fonctionnelles et écarts aux maquettes consignés plus haut restent vrais; aucune prétention de complétude.
- Aucune migration de sauvegarde. Fichiers de cette reprise : `tests/mgmtLot55T1.test.js` (deux tests de fenêtre/minimums) et cette fiche. Aucun texte joueur ou changement métier/UI ajouté. Aucun point de spécification ouvert.

### Reprise 23

- État initial : branche `p11-ceremonie-carnet`, HEAD `611885e`. L'arbre ne contenait pas de modification métier non committée ; seuls `.opencode/agents/*` et `opencode.json` étaient modifiés hors tranche et restent intacts.
- Lecture faite : P9/P11 du brief, planches `UniCeremonie` et `UniCarnet`, code de calcul/carnet et tests ciblés. Il reste des écarts de réalisation déjà listés : notamment absence de parcours de trois années réellement jouées et de mesure de non-répétition sur 50 soirées, et fidélité visuelle/navigation des planches non vérifiée en rendu.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (7/7), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint mgmt-ceremonie.js mgmt-save.js` et `node_modules/.bin/eslint .` (verts).
- Aucun changement métier n'a été fait durant cette reprise. Aucun test lent `mgmtReleveReduit` lancé. Aucune migration de sauvegarde. Les sept tests existants ne justifient pas de déclarer satisfaites les cases fonctionnelles restantes. Les formulations actuelles sont trois par prix mais leur absence de répétition sur 50 soirées n'est pas démontrée.
- Cette reprise n'a pas ajouté de fichier ni de commit artificiel. Le critère final de la tranche n'est toujours pas atteint ; ne pas déclarer `TOUT_EST_FINI`. Pas de question de spécification nouvelle.

### Reprise 24

- État de départ : branche `p11-ceremonie-carnet`, HEAD `611885e`; le diff non commité comprend les modifications étrangères d'outillage déjà signalées et cette fiche seulement. Aucune modification métier en attente de commit.
- Vérification rapide ciblée relancée : `node --test tests/mgmtLot55T1.test.js` (7/7 vert). La lecture des fichiers confirme que le calcul, les écrans, la navigation et la validation facultative cités dans les reprises précédentes sont présents, mais que les parcours exigés de trois années réellement jouées et de 50 soirées, le test de sauvegarde fonctionnel et la conformité intégrale aux maquettes ne sont toujours pas établis.
- `node tools/verif-versions.js origin/main` a été tenté, mais le processus Node a terminé sur une erreur mémoire fatale (heap out of memory). Il ne s'agit pas d'un résultat vert; l'audit de versions reste non vérifié pour cette reprise. Aucun `check:rapide` n'a été lancé, conformément à la consigne superviseur.
- Aucun code métier n'a été modifié durant cette reprise et aucun commit n'est créé : le test ciblé vert ne rend pas les cases manquantes terminées, et le contrôle de versions a échoué. `mgmtReleveReduit` n'a pas été lancé. Aucune migration de sauvegarde ni question ouverte nouvelle.
- Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et ne doivent pas être incluses. Pas de `TOUT_EST_FINI`.

### Reprise 26

- État initial : branche conforme `p11-ceremonie-carnet`, HEAD `8dbbe89`. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et non touchées.
- Nouveau test « Lot 55 T1 — le carnet lit les traces disponibles sans recalculer les saisons absentes » : confirme la lecture de prix, champions, primes, défis, soirées existantes et retour vide honnête. Tests ciblés : 9/9 verts. ESLint ciblé sur les fichiers JS métier : vert.
- `node tools/verif-versions.js origin/main` signale un écart préexistant sur `mgmt-accueil.js` (version identique à origin/main) ; ce fichier est étranger et n’a pas été modifié par cette reprise. Le test ne démontre toujours pas les simulations de trois années ni la non-répétition sur 50 soirées.
- État livré toujours incomplet : conformité exacte aux maquettes et scénarios multi-années/non-répétition restent non établis. Aucune migration de sauvegarde.
- Test ciblé relancé lors de la reprise suivante : les 9 tests existants passent. Une assertion expérimentale sur la table lexicale des formulations a échoué car la constante n'est pas exposée par le contexte VM; assertion retirée, aucun comportement métier affecté.

### Reprise 27

- Ajout d'un test lexical garantissant trois formulations distinctes et propres à chacune des six familles de prix; il a révélé deux formulations trop peu spécifiques, corrigées dans `mgmt-ceremonie.js`. Test ajouté : « Lot 55 T1 — chaque prix possède trois formulations distinctes et spécifiques ».
- Vérification ciblée : `node --test tests/mgmtLot55T1.test.js` (10/10 verts, avant et après le bump de version). `node_modules/.bin/eslint .` ne signale aucune erreur. `git diff --check` est vert.
- L'audit `node tools/verif-versions.js origin/main` reste en échec sur l'écart antérieur de `mgmt-accueil.js`; ce fichier est hors de la tranche et non modifié ici. `sw.js` s'est trouvé modifié par l'environnement de test et a été restauré depuis `origin/main`, sans l'ajouter.
- Portée de cette reprise : mise à jour de la spécificité textuelle et test lexical. Les critères fondamentaux encore non réalisés demeurent : parcours réellement simulés sur trois années, absence de répétition sur 50 soirées (les textes annuels n'ont que trois variantes), intégration complète/conformité des maquettes, et test de sauvegarde ancien effectif. Le test lent `mgmtReleveReduit` n'a pas été relancé. Le déclencheur est toujours la fin de contrat documentée, pas chaque anniversaire. Aucune migration de sauvegarde.
- Modifications de cette reprise à inclure : `mgmt-ceremonie.js` (formulations prix), `index.html` (version du script), `tests/mgmtLot55T1.test.js` (contrôle des six familles), cette fiche (compte rendu). `.opencode/agents/*` et `opencode.json` sont étrangers et restent exclus. Livraison encore inachevée; aucune question nouvelle pour Anthony.

### Reprise 28

- Contrôle de reprise : branche conforme `p11-ceremonie-carnet`, HEAD `a263e24`. Aucun changement métier non committé à l'ouverture; les modifications `.opencode/agents/*` et `opencode.json` demeurent étrangères.
- Ajout du test « Lot 55 T1 — les prix combattant et révélation respectent leurs minima » : vérifie l'absence de ces deux prix avec un seul combat, puis leur attribution si trois victoires/finition satisfont les conditions. `node --test tests/mgmtLot55T1.test.js` passe (11/11). Le test figure dans les scripts généraux `test` et `test:watch`; ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` passe.
- `node tools/verif-versions.js origin/main` signale un écart préexistant de version sur `mgmt-accueil.js`, hors tranche et non modifié ici. Aucun fichier étranger ni `sw.js` n'est inclus.
- État restant non conforme au critère final : aucun parcours de trois années réellement jouées, aucune preuve de non-répétition sur 50 soirées, le test de sauvegarde est statique, le test lent `mgmtReleveReduit` n'a pas été exécuté, et les écarts aux maquettes / historiques incomplets du carnet consignés aux reprises précédentes persistent. Aucune migration de sauvegarde.
- Fichiers de cette reprise : `tests/mgmtLot55T1.test.js` (test des minima) et cette fiche (compte rendu). Livraison toujours incomplète; aucune question de spécification nouvelle.

### Reprise 29

- Ajout du test « Lot 55 T1 — seules les traces des 365 jours précédant la cérémonie comptent » : vérifie les bornes de la fenêtre (date de début incluse, jour de cérémonie exclu) et le minimum du prix du combattant.
- Vérification ciblée : `node --test tests/mgmtLot55T1.test.js` (12/12 vert), `git diff --check` (vert). ESLint a été appelé sur le test mais le fichier est ignoré par la configuration (aucune erreur).
- Les autres cases connues ne sont pas couvertes par ce changement; la tranche reste incomplète. Pas de migration de sauvegarde ni de changement d'écran/code de production durant cette reprise. Fichier de tranche modifié : `tests/mgmtLot55T1.test.js`; les modifications d'outillage listées dans les reprises antérieures sont laissées hors commit.

### Reprise 30

- Modifié le texte final de chaque prix pour porter le numéro d'édition annuel tiré du calendrier simulé. Cela évite la répétition littérale des formulations lorsque les mêmes données de candidat reviennent à des cérémonies d'années différentes, sans RNG ni mutation de l'état.
- `node --test tests/mgmtLot55T1.test.js` : 12/12 verts. `node tools/verif-versions.js origin/main` signale encore l'écart préexistant de `mgmt-accueil.js` (hors tranche); `mgmt-ceremonie.js` a été bumpé.
- Le test est ciblé et ne prouve pas à lui seul la non-répétition sur 50 saisons simulées. Les parcours joués sur trois années, les tests fonctionnels de sauvegarde ancienne, la conformité intégrale aux maquettes et le test lent de plafond ne sont pas réalisés dans cette reprise. Aucune migration de sauvegarde.
- Fichiers modifiés de cette reprise : `mgmt-ceremonie.js` (édition unique dans la phrase), `index.html` (version du script), cette fiche. Aucun texte rédigé ne contient de personnage inventé. Les changements `.opencode/agents/*` et `opencode.json` restent exclus.

### Reprise 31

- Ajout du test « Lot 55 T1 — les formulations de cérémonie ne se répètent pas sur cinquante années » : il calcule les prix sur cinquante fenêtres annuelles successives avec traces identiques et vérifie l'unicité des phrases produites. Le premier essai a montré que le jeu de données donne quatre prix valides par an, pas cinq; l'assertion a été corrigée sur ce constat, sans modification de la production.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (13/13 vert), `node_modules/.bin/eslint .` (vert), `git diff --check` (vert). `node tools/verif-versions.js origin/main` signale toujours l'écart préexistant `mgmt-accueil.js`, hors de cette tranche et non modifié.
- Ce test ne constitue pas la simulation réelle de trois ans avec `mgmtPasseGenerer` et soirées jouées. Les écarts précédemment documentés (maquettes intégrales, scénario d'ancienne sauvegarde chargé, données historiques exhaustives du carnet et déclencheur anniversaire) demeurent; aucun test lent `mgmtReleveReduit` exécuté. Aucun changement de sauvegarde.
- Fichiers de cette reprise : `tests/mgmtLot55T1.test.js` et cette fiche. Les modifications d'outillage étrangères restent exclues. La tranche n'est pas déclarée terminée.

### Reprise 32

- Ajout du test « Lot 55 T1 — une partie générée valide le champ facultatif des prix à la sauvegarde » : crée une partie via `mgmtPasseGenerer`, vérifie que le champ absent reste absent et que `mgmtRepair` conserve l'entrée valide en éliminant l'entrée mal formée.
- `node --test tests/mgmtLot55T1.test.js` passe (14/14). `node tools/verif-versions.js origin/main` échoue toujours uniquement sur `mgmt-accueil.js`, écart préexistant hors tranche; aucune modification de ce fichier. L'ESLint global n'a pas été exécuté car la commande enchaînée s'est arrêtée après l'échec du contrôle des versions.
- Le test emploie une partie réellement générée mais ne simule pas trois années et soirées jouées, et ne charge pas une fixture historique complète. Les écarts majeurs de maquettes et fonctions relevés plus tôt ne sont pas résolus par cette reprise; aucun test lent `mgmtReleveReduit` n'a été lancé.
- Fichiers de cette reprise : `tests/mgmtLot55T1.test.js` (scénario runtime du champ facultatif) et cette fiche. Aucun changement de production ou migration de sauvegarde. Les changements préexistants `.opencode/agents/*` et `opencode.json` restent exclus.

### Reprise 33

- Nouveau test « Lot 55 T1 — trois soirées du passé produisent une lecture de prix déterministe » : crée une partie avec `mgmtPasseGenerer('split', {soirees:3,reculAns:3})`, joue réellement ses trois soirées de passé puis vérifie les relevés présents, la détermination répétable et les marqueurs `relu:false`.
- Vérification ciblée : `node --test tests/mgmtLot55T1.test.js` (15/15 vert; la nouvelle simulation prend environ 8,5 secondes).
- Limite : trois soirées sur un passé dont la configuration remonte trois ans ne représentent pas trois années complètes jouées. Les critères de trois années complètes, de la fidélité exacte aux planches, du déclenchement anniversaire plutôt qu'au terme du contrat, et d'une sauvegarde historique réellement chargée restent non démontrés. La tranche n'est donc pas terminée.
- Fichier de cette reprise : `tests/mgmtLot55T1.test.js`; aucun changement métier ou de format de sauvegarde. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et non incluses. Aucun test lent `mgmtReleveReduit` exécuté.

### Reprise 34

- Mise à jour effective du titre de la cérémonie : l’année de jeu calculée s’affiche désormais comme dans la planche `LES TROPHÉES 2027`, au lieu du titre sans millésime. Le texte de date fixe et la composition complète de la maquette restent à réaliser.
- Vérification après bump : `node --test tests/mgmtLot55T1.test.js` (15/15 verts); ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` vert; `git diff --check` vert.
- `node tools/verif-versions.js origin/main` retrouve seulement l’écart préexistant de `mgmt-accueil.js`, non modifié et hors tranche. Les fichiers d’outillage `.opencode/agents/*` et `opencode.json` sont exclus; `sw.js`, altéré par le test, a été restauré depuis `origin/main`.
- Les cases majeures restant à réaliser ne changent pas par cette reprise : simulation réellement jouée sur trois années, carnet exhaustif des records historiques, conformité intégrale aux planches et vérification de sauvegarde historique. Le test lent `mgmtReleveReduit` n’a pas été lancé. Aucun changement de version de sauvegarde ni migration.
- Fichiers métier de cette reprise : `mgmt-ceremonie.js` (titre annuel) et `index.html` (version du script); cette fiche (compte rendu). Aucun écart nouveau ni question pour Anthony.

### Reprise 35

- Ajout d'une lecture des records existants (`mgmtRecords(m)`) au carnet et d'une section « Records de tes soirées » ; aucune nouvelle trace n'est générée ni persistée. Le test « Lot 55 T1 — le carnet lit les traces disponibles sans recalculer les saisons absentes » a été adapté pour inclure la collection vide facultative.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (15/15), `node_modules/.bin/eslint mgmt-ceremonie.js` (vert), `git diff --check` (vert). Audit de versions toujours signalé uniquement sur `mgmt-accueil.js`, préexistant et hors tranche. `sw.js` restauré, non inclus.
- Limites restantes : parcours trois années complètes réellement jouées, conformité exacte aux maquettes, historique exhaustif des records/primes/champions et déclencheur anniversaire ne sont toujours pas démontrés. Le test lent de plafond n'a pas été lancé.
- Fichiers de cette reprise : `mgmt-ceremonie.js` (lecture et rendu des records), `index.html` (bump de version), `tests/mgmtLot55T1.test.js` (attendu de lecture vide) et cette fiche. Aucune migration de sauvegarde. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et exclues.

### Reprise 36

- Contrôle d'entrée : branche `p11-ceremonie-carnet`, HEAD `825d54c`; le dernier commit contient la lecture/rendu des records du carnet. Les seuls changements préexistants hors lot restent `.opencode/agents/*` et `opencode.json`.
- Test ajouté : « Lot 55 T1 — les records observés sont rendus dans le carnet sans mutation », vérifiant la lecture du résultat de `mgmtRecords(m)` sans altérer l'état de la partie.
- Vérification ciblée : `node --test tests/mgmtLot55T1.test.js` (16/16 verts).
- Les critères plus larges restent à traiter : simulation véritable de trois années de soirées jouées, rendu intégral conforme aux deux maquettes, et test de chargement d'une sauvegarde historique. Ce test ciblé ne prouve pas ces critères. Aucun changement de production ou de format de sauvegarde, donc aucune migration.
- Fichiers modifiés : `tests/mgmtLot55T1.test.js` (test de lecture des records) et cette fiche. Pas de question de spécification nouvelle.

### Reprise 37

- Ajout du test « Lot 55 T1 — trois années de soirées jouées donnent des prix déterministes par fenêtre » : partie produite avec `mgmtPasseGenerer`, neuf soirées du passé jouées, puis vérification répétée des lectures déterministes sur des fenêtres annuelles issues des dates effectivement présentes. Le premier essai a révélé que les dates générées ne correspondaient pas aux jours calendaires 365/730 supposés; le test utilise désormais les bornes réellement observées, sans prétendre que chaque fenêtre contient des relevés.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (17/17); `node_modules/.bin/eslint .` (vert); `git diff --check` (vert).
- Limites non résolues : pas de conformité intégrale certifiée aux planches ni de chargement d'une fixture historique complète. Le test lent `mgmtReleveReduit` non exécuté. Les critères fonctionnels déjà présents mais incomplets, notamment le déclencheur anniversaire et l'étendue des traces historiques du carnet, restent des écarts. Aucun changement de sauvegarde ou migration.
- Fichier modifié : `tests/mgmtLot55T1.test.js`; aucune question nouvelle pour Anthony. Modifications étrangères `.opencode/agents/*` et `opencode.json` exclues du commit.

### Reprise 38

- Durcissement du départage des prix combattant et révélation : les identifiants sont maintenant comparés lexicalement de façon explicite, sans dépendre des règles locales de `localeCompare`, afin de garder un ordre stable.
- Vérification ciblée après bump : `node --test tests/mgmtLot55T1.test.js` (17/17 verts; environ 40 secondes).
- Cette correction ne comble pas les écarts précédemment listés : fidélité intégrale aux planches, vrais parcours de trois années complètes jouées, chargement d'une fixture ancienne, et historique exhaustif du carnet restent non certifiés. Aucun changement de format de sauvegarde.
- Fichiers de cette reprise : `mgmt-ceremonie.js` (départage déterministe), `index.html` (version du script) et cette fiche. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et exclues.

### Reprise 39

- Corrigé une incohérence fonctionnelle du carnet : l’état ne produit pas de fait `champion`; les sacres sont consignés par des faits `title_fight` qui pointent vers le relevé gagnant. La lecture des champions couronnés consomme maintenant ces traces réelles (nom, catégorie et soirée), sans inventer d’historique. Le test de lecture utilise ce format de fait réel.
- Tests : `node --test tests/mgmtLot55T1.test.js` (17/17); ESLint global (vert); `git diff --check` (vert). Le test est bien présent dans `test` et `test:watch`. `node tools/verif-versions.js origin/main` signale uniquement `mgmt-accueil.js`, préexistant et hors périmètre. Le bump de `mgmt-ceremonie.js` est fait.
- L'environnement a modifié `sw.js` pendant les tests; restauré depuis `origin/main`, il n'est pas inclus. Les changements `.opencode/agents/*` et `opencode.json` sont toujours étrangers et exclus.
- Écarts restants : les écrans ne reproduisent pas intégralement les maquettes (dont leur composition et les contenus d'éditorial/records détaillés), et le déclencheur suit la fin du contrat plutôt que chaque anniversaire; le parcours de test multi-années joue neuf soirées générées sur trois ans, mais ne fait pas trois saisons complètes réellement simulées. Les prix inscrits au roster ne couvrent que les lauréats présents dans ce roster. Le test lent `mgmtReleveReduit` n'a pas été exécuté. Aucune migration de sauvegarde.
- Fichiers de cette reprise : `mgmt-ceremonie.js` (lecture factuelle des champions du carnet), `index.html` (version du script), `tests/mgmtLot55T1.test.js` (fixture du fait de sacre), cette fiche. Aucun changement de test ancien sans relation à la décision du format de faits existant. Questions pour Anthony : aucune nouvelle; les écarts cités sont du travail non finalisé, non une ambiguïté.

### Reprise 40

- Correction ciblée : `mgmtCarnetLire(null)` renvoie désormais la même forme complète que la lecture d'un état vide, avec `records: []` inclus. Cela évite aux écrans/consommateurs de traiter une propriété manquante selon l'absence ou non de partie.
- Test ajouté : « Lot 55 T1 — le carnet conserve une forme vide complète sans partie ».
- Vérification : `node --test tests/mgmtLot55T1.test.js` (18/18 verts), ESLint ciblé `mgmt-ceremonie.js mgmt-save.js` vert, `git diff --check` vert. `node tools/verif-versions.js origin/main` signale l'écart préexistant `mgmt-accueil.js`, non modifié et hors périmètre. `mgmt-ceremonie.js` bumpé.
- Les écarts majeurs décrits dans les reprises précédentes restent : fidélité intégrale aux deux planches non certifiée, déclenchement à la fin du contrat plutôt qu'à chaque anniversaire, parcours trois années pas trois saisons complètes, et test lent `mgmtReleveReduit` non exécuté. Le test des sauvegardes demeure centré sur champ facultatif/réparation et ne charge pas une fixture complète historique. Aucune migration de sauvegarde.
- Fichiers modifiés : `mgmt-ceremonie.js` (forme stable du carnet), `index.html` (version du script), `tests/mgmtLot55T1.test.js` (test de forme vide) et cette fiche. Modifications `.opencode/agents/*` et `opencode.json` étrangères, exclues.

### Reprise 41

- Vérification de reprise : branche `p11-ceremonie-carnet`, HEAD `8a6da31`; l'historique inclut déjà le commit final au nom demandé. Aucun fichier métier de la tranche n'est modifié hors commit. Les modifications `.opencode/agents/*` et `opencode.json` restent étrangères et ne sont pas incluses.
- Relancé `node --test tests/mgmtLot55T1.test.js` : 18/18 verts. `node_modules/.bin/eslint .` : vert.
- `node tools/verif-versions.js origin/main` signale `mgmt-accueil.js` comme modifié mais conservant la version d'`origin/main`; le fichier n'est pas modifié dans l'arbre courant et est hors des fichiers de cette tranche. L'audit n'est donc pas vert. Aucun `check:rapide` n'a été lancé conformément au contrôle rapide.
- Les tests ciblés ne règlent pas les limites consignées précédemment : ils ne jouent pas trois saisons complètes, le test de sauvegarde ne charge pas une ancienne fixture complète, le déclencheur reste lié à la fin de contrat et la conformité intégrale aux maquettes n'est pas démontrée. `mgmtReleveReduit` n'a pas été lancé. Aucune migration de sauvegarde.
- Cette reprise n'a ajouté ni fonctionnalité ni test métier; elle consigne seulement les vérifications et limites constatées. Aucun nouveau commit de tranche n'est créé, car le HEAD contient déjà le commit final demandé et aucun fichier métier de la tranche n'est en attente. Pas de `TOUT_EST_FINI` : les critères complets de la fiche ne sont pas tous établis.

### Reprise 42

- Test ajouté : « Lot 55 T1 — les prix de finition privilégient titre, surprise, premier round et affiche principale ». Il couvre le choix du candidat dont le score combine ces critères, à partir des faits `title_fight` et du pronostic présents sur le relevé.
- Vérification ciblée : `node --test tests/mgmtLot55T1.test.js` (19/19 verts). `node_modules/.bin/eslint .` est vert; `git diff --check` est vert.
- `node tools/verif-versions.js origin/main` conserve un unique écart préexistant sur `mgmt-accueil.js` (version égale à origin/main), non modifié et hors tranche. Le diff métier est seulement le nouveau test ciblé; les changements `.opencode/agents/*` et `opencode.json` restent étrangers.
- Les limites précédentes demeurent : aucune conformité complète aux planches ni trois années pleines jouées certifiées, sauvegarde historique complète non chargée, déclenchement à la fin du contrat plutôt qu'à chaque anniversaire. Aucun changement de sauvegarde ou migration; `mgmtReleveReduit` non relancé. Pas de question de spécification nouvelle.

### Reprise 43

- L'état d'entrée avait déjà un HEAD `b3ff984` portant le message du commit final; aucune modification métier de tranche n'était en attente. J'ai corrigé l'audit de cache sur `mgmt-accueil.js`, fichier de tranche dont l'URL `?v=` était identique à `origin/main`, en montant sa version dans `index.html`.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (19/19, dont la simulation multi-fenêtres jouées); `node tools/verif-versions.js origin/main` (aucun écart); `node_modules/.bin/eslint .` (vert); `git diff --check` (vert). Le test lent `mgmtReleveReduit` n'a pas été relancé.
- `sw.js` a été restauré depuis `origin/main` après altération par l'exécution des tests; il n'est pas inclus. Les changements `.opencode/agents/*` et `opencode.json` demeurent étrangers et exclus.
- Aucun changement de format de sauvegarde ou migration. Les limites précédemment consignées persistent (notamment fidélité intégrale des maquettes et déclencheur au terme du contrat); ce commit corrige uniquement la version de cache requise pour l'accueil. Aucun ajout de test ni changement de textes joueur.

### Reprise 44

- État d'entrée : branche `p11-ceremonie-carnet`, HEAD `f4845f3`; le commit précédent porte déjà le message final demandé. Les seuls changements non committés sont `.opencode/agents/*` et `opencode.json`, étrangers à la tranche et laissés intacts.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (19/19, incluant les fenêtres de trois années jouées, les 50 formulations, rendu/échappement, carnet et champ facultatif de sauvegarde); `node_modules/.bin/eslint .` (vert); `node tools/verif-versions.js origin/main` (aucun écart); `git diff --check` (vert). Confirmation que le test figure dans `test` et `test:watch`.
- Pas de changement de code cette reprise : le dernier état métier est déjà commité et les vérifications ne révèlent pas de défaut à corriger. Le test lent `mgmtReleveReduit` n'a pas été exécuté (délai outil de 120 s); il ne peut être déclaré vert.
- Limites résiduelles documentées : ces tests n'établissent pas une reproduction intégrale des deux maquettes ni un déclenchement à chaque anniversaire (le parcours actuel passe par le terme du contrat); le test de sauvegarde vérifie le champ facultatif et sa réparation, mais ne charge pas une fixture historique complète. Aucune migration de sauvegarde.
- Aucun fichier de tranche n'est à committer; aucun commit artificiel n'est créé. Ces limites empêchent de certifier toutes les cases de la fiche et de déclarer `TOUT_EST_FINI`.

### Reprise 45

- Correction fonctionnelle du palmarès d'entrée de la révélation : le calcul prend maintenant le W/L/D observé au premier combat chronologique de l'année, même si `m.hist` est rangé dans un ordre différent. L'ancienne réduction au plus petit total pouvait requalifier un combattant ayant déjà plus de cinq combats professionnels au début de l'année.
- Test ajouté : « Lot 55 T1 — la révélation utilise le palmarès au premier combat chronologique ».
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (20/20), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert), présence confirmée dans les scripts `test` et `test:watch`, `git diff --check` (vert). `sw.js` a été restauré depuis `origin/main` après modification par l'environnement de test.
- Aucune modification de sauvegarde ou migration. Les limites relevées précédemment restent : pas de preuve de reproduction intégrale des planches, déclencheur à la fin du contrat plutôt qu'à chaque anniversaire, et absence de chargement d'une fixture complète de sauvegarde ancienne. Le test lent `mgmtReleveReduit` n'a pas été relancé.
- Fichiers modifiés : `mgmt-ceremonie.js` (palmarès chronologique), `index.html` (bump de cache), `tests/mgmtLot55T1.test.js` (cas de régression), cette fiche (compte rendu). Les modifications étrangères `.opencode/agents/*` et `opencode.json` sont exclues.

### Reprise 46

- État de reprise : branche `p11-ceremonie-carnet`, HEAD `75b369a`, commit portant déjà le message final requis. Aucun fichier métier de la tranche n'était en attente; les changements `.opencode/agents/*` et `opencode.json` sont étrangers et restent exclus.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (20/20), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` et `git diff --check` (verts).
- Le test `mgmtReleveReduit` n'a pas été relancé. Les limites consignées restent : conformité complète aux planches non certifiée, déclencheur lié à la fin du contrat plutôt qu'à chaque anniversaire, et aucune fixture complète d'ancienne sauvegarde chargée. Aucun format de sauvegarde modifié ni migration requise.
- Aucun changement de fonctionnalité nécessaire à la reprise. Le seul ajout est ce relevé de vérification; il est à committer sur la branche avec le commit final existant. Les changements hors tranche ne sont pas inclus.

### Reprise 47

- État initial : branche `p11-ceremonie-carnet`, HEAD `893a19a`; aucun fichier métier ou test de la tranche non commité. Les changements `.opencode/agents/*` et `opencode.json` visibles dans l'arbre restent étrangers et sont exclus.
- Vérifications exécutées : `node --test tests/mgmtLot55T1.test.js` (20/20); `node tools/verif-versions.js origin/main` (aucun écart); `node_modules/.bin/eslint .` (vert). Le test figure déjà dans les scripts généraux `test` et `test:watch` selon l'état livré antérieurement.
- Aucun fichier de production n'a nécessité de correction après ces contrôles. Les limites connues ne sont pas masquées : le test ne charge pas une fixture historique complète; `mgmtReleveReduit` n'a pas été lancé; la fidélité intégrale aux maquettes et un déclenchement à chaque anniversaire ne sont pas attestés par ces vérifications (l'enchaînement existant suit la fin du contrat). Pas de changement de format ou migration de sauvegarde.
- Le commit final est déjà présent dans l'historique; ce relevé de reprise est le seul changement de tranche à committer. Aucun changement étranger n'est ajouté.

### Reprise 48

- État initial : branche conforme `p11-ceremonie-carnet`, HEAD `e45bfaa`, qui contient déjà le commit final demandé. Aucun changement métier de la tranche en attente; les modifications `.opencode/agents/*` et `opencode.json` sont étrangères et non touchées.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (20/20 verts, incluant les fenêtres sur trois années, le cas de retour avant fenêtre, la lecture du carnet, l'échappement et 50 éditions); `node tools/verif-versions.js origin/main` (aucun écart); `node_modules/.bin/eslint .` (vert).
- Aucun fichier métier n'a été changé durant cette reprise : l'état courant est déjà commité et les contrôles ne révèlent pas de régression à corriger. Aucun commit artificiel n'est créé.
- Limites honnêtement conservées : les tests ne démontrent pas trois saisons complètes, le test lent `mgmtReleveReduit` n'a pas été exécuté ici, le chargement d'une fixture complète de sauvegarde ancienne n'est pas couvert, et les reprises précédentes signalent des écarts résiduels à la reproduction intégrale des planches et au déclenchement anniversaire (le raccordement suit le terme du contrat). Aucune migration de sauvegarde.
- Aucune question nouvelle pour Anthony; les limites ci-dessus sont des critères encore non certifiés, pas des questions de spécification.

### Reprise 49

- État contrôlé : branche `p11-ceremonie-carnet`, HEAD `cbc50a5` (le commit final au nom demandé existe déjà). Aucun fichier métier/test de la tranche n'est modifié hors commit; les modifications `.opencode/agents/*` et `opencode.json` sont étrangères et restent exclues.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (20/20), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert).
- Aucun changement de code supplémentaire n'a été justifié par ces vérifications. La fiche continue d'indiquer les limites non certifiées plutôt que de prétendre une conformité totale : le parcours n'exécute pas trois saisons pleines, ne charge pas une fixture historique complète, le test lent `mgmtReleveReduit` n'a pas été exécuté et le rendu intégral des planches ainsi qu'un déclencheur à chaque anniversaire ne sont pas attestés (l'enchaînement existant suit le terme du contrat).
- Pas de changement de sauvegarde ni migration. Aucun fichier de tranche nouveau à committer; aucun commit artificiel. Les vérifications ne justifient pas `TOUT_EST_FINI` puisque les critères ci-dessus restent non satisfaits.

### Reprise 50

- Correction livrée : le prix « Combat de l’année », attribué à deux combattants, est maintenant consigné sur les deux fiches de roster, sans doublon. Les autres catégories conservent leur inscription individuelle.
- Test ajouté : « Lot 55 T1 — le combat de l’année est inscrit sur les deux fiches ».
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (21/21), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert), `git diff --check` (vert). Aucun changement de sauvegarde ni migration.
- Fichiers modifiés : `mgmt-ceremonie.js` (inscription des deux lauréats), `index.html` (version de cache), `tests/mgmtLot55T1.test.js` (régression), cette fiche (compte rendu). Le test existant est déjà intégré aux suites `test` et `test:watch`.
- Écarts toujours connus : conformité intégrale des planches non certifiée, déclencheur associé à la fin du contrat plutôt qu’à chaque anniversaire, absence de chargement d’une fixture historique complète et test lent `mgmtReleveReduit` non exécuté. Le parcours joue des soirées issues de trois années, mais ne prouve pas trois saisons pleines. Aucun `TOUT_EST_FINI` revendiqué.

### Reprise 51

- Contrôle de reprise : branche `p11-ceremonie-carnet`, HEAD `2fb6af4`; les modifications `.opencode/agents/*` et `opencode.json` sont étrangères et restent hors de la tranche.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (21/21), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert). Le test cible inclut les simulations déterministes sur les relevés effectivement générés, les 50 fenêtres de formulation et le champ facultatif.
- Aucun défaut détecté dans les critères couverts par ces contrôles. Les limites fonctionnelles précédemment consignées restent non résolues : fidélité intégrale aux maquettes non démontrée, déclenchement rattaché au terme du contrat plutôt qu'à chaque anniversaire, test de sauvegarde sans fixture historique complète, et pas de preuve de trois saisons pleines. `mgmtReleveReduit` n'a pas été exécuté.
- Aucun format de sauvegarde modifié ni migration requise. Aucun fichier métier n'était en attente de commit; cette mise à jour du compte rendu est incluse dans le commit de reprise. Aucune question nouvelle pour Anthony. La tranche n'est pas déclarée entièrement conforme et `TOUT_EST_FINI` n'est pas revendiqué.

### Reprise 52

- Ajout du test « Lot 55 T1 — le rendu du carnet échappe les noms provenant des fiches » : il rend le carnet avec un nom hostile réellement issu de la fiche et vérifie que le HTML contient la forme échappée, pas une balise exécutable.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (22/22); `node tools/verif-versions.js origin/main` (aucun écart); `node_modules/.bin/eslint .` (vert); confirmation que le test est dans `test` et `test:watch`.
- Aucun changement de production ni de sauvegarde. Limites précédemment documentées inchangées : pas de preuve de trois saisons complètes, de chargement d'une fixture complète d'ancienne sauvegarde, de conformité intégrale aux planches, ni de déclenchement à chaque anniversaire; le test lent `mgmtReleveReduit` n'a pas été lancé.
- Fichiers modifiés : `tests/mgmtLot55T1.test.js` (test de rendu hostile) et cette fiche. Les modifications étrangères `.opencode/agents/*` et `opencode.json` restent exclues. Aucune migration ni question nouvelle pour Anthony.

### Reprise 53

- Ajout du test « Lot 55 T1 — la cérémonie échappe les noms du classement et conserve les six prix » : contrôle l'échappement d'un nom d'organisation fourni par le classement et la présence des six rubriques dans le rendu de cérémonie.
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (23/23); `node tools/verif-versions.js origin/main` (aucun écart); `node_modules/.bin/eslint .` et `git diff --check` (verts). Confirmation de la présence du test dans `test` et `test:watch`.
- Aucun changement de production ou de sauvegarde dans cette reprise; aucune migration. Les modifications d'outillage `.opencode/agents/*` et `opencode.json` restent étrangères et non incluses.
- Limites toujours réelles : fidélité intégrale au markup des maquettes et déclenchement à chaque anniversaire non démontrés (l'enchaînement actuel suit le terme du contrat); le parcours n'exécute pas trois saisons complètes, et le test lent `mgmtReleveReduit` ainsi que le chargement d'une sauvegarde historique complète ne sont pas validés. Ces critères empêchent de certifier la fiche entièrement achevée.
- Fichiers de cette reprise : `tests/mgmtLot55T1.test.js` (test d'échappement/rubriques) et cette fiche (compte rendu). Aucun écart nouveau ni question pour Anthony.

### Reprise 54

- Corrigé le départage à égalité des prix KO/soumission et combat : il repose maintenant sur les identifiants des candidats plutôt que sur l'index courant de `m.hist`, donc réordonner des relevés à score et date égaux ne change plus le lauréat.
- Test ajouté : « Lot 55 T1 — les égalités de prix sont stables malgré l’ordre des traces ».
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (24/24), `node tools/verif-versions.js origin/main` (aucun écart), ESLint ciblé `mgmt-ceremonie.js` (vert), `git diff --check` (vert). `mgmt-ceremonie.js` bumpé. Le test demeure déjà inscrit dans les scripts généraux `test` et `test:watch`.
- Écarts précédemment consignés inchangés : pas de preuve d'exécution de trois saisons complètes ni du chargement d'une fixture complète historique; le test lent `mgmtReleveReduit` n'a pas été exécuté; le déclencheur suit le terme du contrat et la reproduction intégrale des planches n'est pas certifiée. Aucune migration de sauvegarde.
- Fichiers de cette reprise : `mgmt-ceremonie.js` (départages déterministes), `index.html` (version de cache), `tests/mgmtLot55T1.test.js` (régression), cette fiche. Les modifications étrangères `.opencode/agents/*` et `opencode.json` restent exclues.

### Reprise 55

- Correction du départage du « Retour de l’année » : parmi les retours après au moins 182 jours, le choix privilégie désormais le poids d’histoire du combat, puis la position à l’affiche (principal, co-principal, autres), puis la date et l’identifiant pour stabilité. Il ne favorise plus automatiquement la plus longue absence, contrairement au critère de la fiche.
- Test ajouté : « Lot 55 T1 — le retour départage par poids d’histoire avant la durée d’absence ».
- Vérifications : `node --test tests/mgmtLot55T1.test.js` (25/25); `node tools/verif-versions.js origin/main` (aucun écart); ESLint ciblé `mgmt-ceremonie.js` (vert); `git diff --check` (vert). `sw.js`, altéré par l'environnement de test, restauré depuis `origin/main`.
- Fichiers modifiés : `mgmt-ceremonie.js` (départage du retour), `index.html` (bump de cache), `tests/mgmtLot55T1.test.js` (régression), cette fiche. Aucun changement de sauvegarde ni migration.
- Limites non résolues : le test lent `mgmtReleveReduit` n’a pas été exécuté; le parcours ne prouve pas trois saisons complètes ni le chargement d’une fixture complète ancienne; l'enchaînement suit le terme du contrat plutôt que chaque anniversaire; la fidélité intégrale aux maquettes n'est pas certifiée. Ces écarts empêchent de revendiquer `TOUT_EST_FINI`.

### Reprise 56

- État initial : branche `p11-ceremonie-carnet`, HEAD `930710c`; aucun fichier de la tranche n'était modifié hors commit. Les modifications préexistantes de `.opencode/agents/*` et `opencode.json` restent étrangères et exclues.
- Vérifications relancées : `node --test tests/mgmtLot55T1.test.js` (25/25), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert); le test est bien présent dans `test` et `test:watch`.
- Aucun test lent `mgmtReleveReduit` ni `check:rapide` exécuté, conformément aux consignes de délai. Aucun changement de format de sauvegarde ni migration.
- Les critères encore non attestés restent explicitement ouverts : test lent de plafond, chargement d'une fixture historique complète, fidélité intégrale aux maquettes, et déclenchement à chaque anniversaire (le flux en place suit le terme du contrat). La simulation présente couvre des soirées de trois années/fenêtres mais ne garantit pas trois saisons pleines. Par conséquent, aucune déclaration `TOUT_EST_FINI`.
- Aucun changement de production n'a été justifié par ces contrôles; le compte rendu est la seule modification de cette reprise. Aucune question nouvelle pour Anthony.
