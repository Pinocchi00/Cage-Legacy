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
