# Monde lot 53 T1 (P7, écrans) — l'écran de la soirée aux valeurs de la maquette, la lecture en temps forts, la fin de soirée

Branche : `p7-ecran-soiree` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P7 (lis-le en entier). Maquettes à porter **aux valeurs exactes** (lis leur markup HTML) : `docs/planches-uniques/UniSoiree.dc.html` (l'écran de la soirée : la salle qui monte, la carte, le panneau « Le prochain », la vue de chaque combat), `UniTempsForts.dc.html` (le combat vu en temps forts), `UniSoireeFin.dc.html` (la fin de soirée : les primes annoncées).

**Ce qui existe déjà dans `main`** (lis-le d'abord) : la salle qui monte (`mgmt-salle*.js`, P7 T1), les primes (P7 T3 : `m.hist[].pr`, `finance.primes`), le choix des moments clés `mgmtTempsFortsChoisir` et les vues `m.vues` / `mgmtVueDuCombat` (`mgmt-temps-forts.js`, P7 T2 partie 1, lot 49 T1), l'écran de la soirée (`mgmt-ecran-soiree.js`, `mgmt-soiree-cadre.js`, `mgmt-soiree-show.js`). **Ne touche pas au moteur de combat.** Les discours (P7 T4) arrivent dans une autre PR : ne les traite pas ici.

## Cases
**[ ] 1. L'écran de la soirée** aux valeurs de `UniSoiree` : la carte du soir avec, pour chaque combat, sa vue (Complet / Temps forts / Résultat) réglable (touche + bouton), le panneau « Le prochain » (le combat qui vient : noms, enjeux, palmarès résumé), la ligne de salle entre deux combats. Chaque classe du balisage a sa règle de style, aucun texte sous 22 px, préfixe propre `so3-`.
**[ ] 2. La lecture en temps forts** (la fin du lot 49 T1) : pour un combat en `forts`, jouer **seulement les fenêtres** (quelques secondes autour de chaque moment de `mgmtTempsFortsChoisir`) avec la frise de `UniTempsForts` (moment en cours, moments à venir) et un fondu court entre fenêtres ; 45 s visées (30 à 60). Pour `resultat` : une carte résultat + finition. Pour `complet` : comportement actuel inchangé. Tout est passable (Échap / Entrée) et la soirée avance toujours. Si la rejouabilité par fenêtres est impossible avec l'arène actuelle, accélère les parties hors fenêtres et **documente** : pas de second moteur d'animation.
**[ ] 3. Le cumul de durée** : sur la soirée de référence (neuf combats, vues par défaut), le temps de lecture calculé reste entre **15 et 20 minutes** (complet = durée du combat, forts = 45 s, résultat = 5 s) ; test.
**[ ] 4. La fin de soirée** aux valeurs de `UniSoireeFin` : les trois primes (« combat de la soirée », deux « performance ») annoncées, la salle finale, l'argent de la soirée, le bouton vers le lendemain. Elle remplace l'écran de fin actuel **sans le casser** (le lendemain existant reste atteignable, un autre lot le recompose).
**[ ] 5. Tests** (`tests/mgmtLot53T1.test.js`, dans `test` ET `test:watch`) : écran rendu par le chemin réel (`mgmtPasseGenerer('split',{soirees:3})` puis une vraie soirée) ; la vue réglable combat par combat ; les fenêtres de temps forts (nombre, ordre, durée 30–60 s, passable) ; le cumul 15–20 min ; la fin de soirée affiche exactement les primes de `m.hist` ; classes sans règle = 0 ; échappement ; partie ancienne intacte (empreintes de `tests/mgmtPasse.test.js` identiques, sinon décision citée).
**[ ] 6. Fin.** Commit final `Monde lot 53 T1 : l'écran de la soirée` ; compte rendu honnête (fait / pas fait / écarts à la maquette / choix de lecture par fenêtres) ; `TOUT_EST_FINI` seulement si tout est vert et commité.

## Compte rendu

- Fait : lecture de la section P7 du brief et des trois planches ; conservation de la porte `mgmt-soiree-cadre.js` et des choix de vue existants. Ajout d'un rendu additif des primes depuis `m.hist` dans le bloc de fin, avec échappement et styles `so3-*`. Ajout du test ciblé et commande dédiée `test:lot53t1` / `test:watch:lot53t1`.
- Fichiers modifiés : `mgmt-soiree-cadre.js` (annonces de primes), `ui-cadre.css` (styles des classes ajoutées), `index.html` (cache CSS), `tests/mgmtLot53T1.test.js` (3 tests), `package.json` (commande ciblée, prétest/pretest:watch), présente fiche.
- Tests ajoutés (intitulés) : « voie réelle : une passe générée ouvre une soirée jouable », « le choix de vue reste indépendant pour chaque combat », « la fin annonce les primes présentes dans les relevés et échappe les noms ».
- Vérification effectuée : `node --test tests/mgmtLot53T1.test.js` — 3 pass, 0 fail. `node --test tests/mgmtSoiree.test.js` — 14 pass, 0 fail. Le bump des versions JS/CSS a été appliqué ; une tentative non pertinente de bump du fichier test a échoué, sans modifier ce fichier.
- Pas fait : portage de l'écran entier de la soirée vers les valeurs exactes `UniSoiree` et son préfixe `so3-` ; panneau « Le prochain » avec enjeux/palmarès fidèle à la planche ; frise, fenêtres d'animation, fondu et contrôles de lecture de `UniTempsForts` ; carte de résultat seul ; mesure/test de cumul 15–20 minutes ; adaptation des tests de partie ancienne et vérification de ses empreintes. La fin n'a pas été recomposée selon `UniSoireeFin` : seuls les badges de primes sont ajoutés à la fin existante.
- Écart sur les primes : le rendu regroupe une ligne par relevé marqué `cs`/`pf`, mais n'affiche pas les montants et les performances identiques sur le même combat pourraient être dédupliquées par combat ; les trois annonces exactes restent à valider contre la fixture réelle de primes.
- Choix de lecture : aucune modification à l'arène ni au lecteur par fenêtres ; l'actuel saut accéléré préexistant n'est donc pas amélioré ni documenté comme un choix validé.
- Revue/audit : aucun sous-agent disponible. `node tools/verif-versions.js origin/main` passe. ESLint ciblé rapporte que le fichier de test est ignoré par sa configuration, donc pas de lint effectif sur celui-ci. Le test ciblé est vert, mais l'assertion littérale confirme que `mgmtLot53T1` n'est pas intégré dans les longues listes `test` et `test:watch` ; seuls les hooks `pretest` / `pretest:watch` et scripts ciblés l'exécutent. La suite exigée n'est pas complète.
- Questions pour Anthony : aucune question nouvelle ; le travail reste partiel et ne satisfait pas le critère de fin de la fiche.

### Reprise 6 — audit de l’état commité

- Vérifié avant reprise : HEAD `a165e52` (`Monde lot 53 T1 : l'écran de la soirée`), branche `p7-ecran-soiree`. Aucun changement de code non commité à la reprise ; les modifications présentes dans `.opencode/agents/*` et `opencode.json` sont extérieures à cette tranche et n'ont pas été ajoutées.
- Contrôles relancés : `node --test tests/mgmtLot53T1.test.js` (3 réussis), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (réussi sans sortie).
- Limite confirmée lors de la reprise : le lecteur d’arène contient déjà un saut des intervalles hors fenêtres (`MGMT_COMBAT.tempsForts`), mais cette tranche ne livre pas la frise, le fondu entre fenêtres, ni le comportement résultat-seul adapté. Il n'y a donc pas de test prouvant la durée 30–60 s et le caractère passable de chaque fenêtre.
- La carte de soirée reste le rendu antérieur `mf-*`, pas le portage aux valeurs de `UniSoiree`; le panneau « Le prochain » n'a pas les informations/présentation de la maquette. La fin reste l'écran existant avec les badges ajoutés, pas `UniSoireeFin`.
- Vérification package : les scripts spécialisés `test:lot53t1` et `test:watch:lot53t1` existent, mais `mgmtLot53T1.test.js` n'est pas inscrit dans les listes complètes `test` et `test:watch`; le test des empreintes de `mgmtPasse.test.js`, le cumul de durée, le contrôle exhaustif des classes et l'échappement de toutes les données du nouvel écran ne sont pas livrés.
- État de livraison : incomplet. Le commit antérieur porte le message demandé, mais les critères de fin des cases 1, 2, 3 et 5 ne sont pas atteints ; ne pas déclarer `TOUT_EST_FINI`.

### Reprise 7 — vérification ciblée complémentaire

- Aucun comportement applicatif nouveau. Le test ciblé continue de couvrir le chemin réel d'une soirée, le réglage indépendant de vues et l'échappement d'un nom dans les annonces de primes.
- Tests exécutés : `node --test tests/mgmtLot53T1.test.js` (3 réussis), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (réussi).
- Tentative de mesure du cumul : avec 7 combats évalués à 45 s et les durées disponibles des deux combats complets, la graine testée donnait 407 s, hors des 15 minutes minimales. Le test provisoire a été retiré : la mesure n'utilisait pas la base de calcul de lecture réelle et ne constituait pas une preuve valide. Le critère 15–20 minutes reste non satisfait/non vérifié.
- Toujours non livré : portage exact de `UniSoiree` et `UniSoireeFin`, frise/transitions de `UniTempsForts`, contrôle de fenêtres passables et carte résultat-seul, test de durée conforme, audit exhaustif des classes/tailles/échappements et test d'empreintes anciennes. Le test reste absent des longues listes `test` et `test:watch` de `package.json`.
- Écart : les primes sont seulement ajoutées à la fin ancienne ; la somme d'argent et la scène finale de la maquette ne sont pas portées. La lecture par fenêtres reste celle déjà présente, sans frise ni fondu.
- Question pour Anthony : quelle durée de lecture réelle imputer à un combat complet ? La durée de trace disponible ne permet pas d'atteindre la cible sur la graine mesurée ; aucune règle n'a été inventée.
- Conclusion : tranche incomplète ; ne pas déclarer `TOUT_EST_FINI`.

### Reprise 8 — début du calcul de durée

- Ajout de `mgmtSoireeDureeEstimee(m)` : somme, par combat de la carte, des temps par défaut (45 s temps forts, durée de l'arène pour complet, 5 s résultat) et 10 s de transition. Le sélecteur existant fournit chaque vue et la lecture complète est estimée en reconstruisant la session depuis la trace.
- Test ajouté : « Monde lot 53 T1 — le cumul estimé inclut chaque combat et ses transitions ». Il vérifie seulement que le calcul donne une valeur finie positive sur une soirée créée par le chemin réel ; l'assertion demandée 900–1200 s n'est pas faite et le critère reste à traiter.
- Contrôles : test ciblé `mgmtLot53T1.test.js` (4 réussis), version `mgmt-temps-forts.js` montée et référencée dans `index.html`, `node tools/verif-versions.js origin/main` réussi, ESLint ciblé réussi.
- Toujours non livré : le portage de l'écran carte `UniSoiree`, le choix de vue bouton V, la frise/fondu de lecture temps forts, la lecture résultat seule, la fin `UniSoireeFin`, l'assertion de durée 15–20 minutes et les exigences restantes d'intégration/test. Le test reste absent des listes complètes `test` et `test:watch`.
- Aucune modification au moteur de combat. Aucun changement aux tests existants ni à leurs empreintes.

### Reprise 9 — touche de réglage de vue

- Ajout de la touche `V` / `v` dans l'écran agenda : elle fait tourner la vue du combat sélectionné (ou du prochain combat) entre complet, temps forts et résultat, en réutilisant `mgmtVueCombatChoisir`.
- Le test ciblé passe pour ses 4 tests existants. L'estimation par défaut observée avec la graine 5303 est 868,38 s, donc sous la cible de 900 s ; le calcul demandé (durée exacte des combats complets, 45 s par temps forts, 5 s résultat et 10 s de transition) n'a pas été modifié pour masquer cet écart.
- Les autres cases restent à faire : portage intégral de la carte et des informations « Le prochain », lecture accélérée avec frise/fondu, carte résultat seul, portage de l'écran de fin et primes exactes, assertions de durée/couverture des classes/empreintes historiques, intégration du test dans `test` et `test:watch`.
- Fichiers modifiés durant cette reprise : `mgmt-soiree-cadre.js` (touche V) et `index.html` (version cache du JS). Pas de changement de sauvegarde. Aucun écart à la maquette autre que les éléments non encore portés déjà listés.

### Reprise 10 — primes de fin (travail partiel)

- Fait durant la reprise : la fin existante affiche maintenant le total payé indiqué par `m.lastEvent.finance.primes`, formaté avec `mgmtEuros`, ainsi qu'un titre et un style dédié. La route vers le lendemain n'a pas été modifiée.
- Commits de reprise : `c76a444` (touche V), `2fad253` (montant de prime) et `70c17de` (styles de prime). Les deux derniers commits exécutent le test ciblé ; il reste vert (4 tests). ESLint complet et `node tools/verif-versions.js origin/main` sont également verts après l'ajout CSS.
- Restent non faits : portage des valeurs et de tous les blocs `UniSoiree` / `UniSoireeFin`, frise dédiée et fondu de temps forts, garantie/test de durée par fenêtres et passabilité, résultat seul de 5 s, assertion 900–1200 s (l'estimation relevée à la reprise 9 était 868,38 s), couverture des classes/style/échappement et comparaison d'empreintes anciennes. Le test `mgmtLot53T1.test.js` est exécuté via `pretest` et `pretest:watch`, mais n'est toujours pas dans les listes principales `test` / `test:watch`.
- Écarts de maquette : l'écran carte et le panneau « Le prochain » restent l'ancien rendu `mf-*`; la fin garde sa composition d'origine avec ajouts de primes, et n'est pas un portage de la planche. Les lignes d'annonce ne prouvent pas la sélection fidèle des deux bénéficiaires performance, ni les trois attributions exactes pour toute fixture.
- Lecture : le code existant accélère les intervalles entre fenêtres en multipliant l'avancement (`MGMT_TF_VITESSE`) et ne crée pas de moteur parallèle. Pas de travail livré dans cette reprise sur frise ou fondu.
- Fichiers modifiés dans les commits de reprise : `mgmt-soiree-cadre.js` (sélecteur V et bloc de primes/argent), `ui-cadre.css` (styles dédiés), `index.html` (versions cache), cette fiche. Aucune migration de sauvegarde ; aucune modification au moteur.
- Tests ajoutés à cette reprise : aucun ; les 4 tests ciblés existants passent. La demande détaillée du test de cumul et d'empreintes reste non satisfaite.
- Questions pour Anthony : aucune question formulée ; plusieurs critères demeurent non implémentés, et cette tranche ne répond pas au critère de fin.

### Reprise 11 — contrôle ciblé et test du panneau

- Vérifié : branche `p7-ecran-soiree`, HEAD de départ `8114643`; pas de changement antérieur de cette tranche non commité. Les changements `.opencode/agents/*` et `opencode.json` préexistants sont étrangers à la tranche et restent intacts.
- Relus les trois maquettes. Le panneau de sélection déjà existant affiche bien les trois vues et les informations d'avant-combat; cette reprise ajoute un test du rendu réel du panneau, « Monde lot 53 T1 — le panneau de combat rend les trois vues réglables ».
- Tests : `node --test tests/mgmtLot53T1.test.js` (5 pass). `node tools/verif-versions.js origin/main` (aucun écart). `node_modules/.bin/eslint .` (réussi). `node --test tests/mgmtReleveReduit.test.js` a dépassé le délai de 120 s de l'outil avant de rendre un résultat; il n'est donc pas déclaré vert.
- Toujours non livré et non revendiqué comme fait : le portage des valeurs `UniSoiree` et `UniSoireeFin`, la frise/fondu, la carte résultat-seul avec temporisation, la fenêtre 30–60 s vérifiée, la plage d'estimation 900–1200 s, les tests complets d'empreintes/styles/échappement et l'inscription dans les listes principales `test`/`test:watch`. L'estimation demeure signalée sous la plage cible (868,38 s précédemment observés); elle n'a pas été artificiellement gonflée.
- Choix de lecture documenté par le code existant : le lecteur conserve l'arène actuelle et accélère les segments hors moments forts via `MGMT_TF_VITESSE`; aucun moteur parallèle ni changement du moteur de combat.
- Ce commit de reprise ne satisfait donc pas les critères finaux et ne peut être présenté comme l'achèvement de la tranche.

### Reprise 14 — frise visible en arène

- Le travail non commité à la reprise ajoutait le rendu de la frise en bas de l'arène, avec les moments actifs/passés et l'échappement du libellé. J'ai conservé cette modification et ajouté son test ciblé : 6/6 réussis.
- Fichiers tranche concernés dans cet état : `mgmt-combat.js`, `ui-cadre.css`, `index.html`, `tests/mgmtLot53T1.test.js`. Les autres modifications présentes à la reprise (`.opencode/agents/*`, `opencode.json`) sont étrangères et restent hors commit ; `sw.js` a été remis à `origin/main` conformément à la consigne.
- Toujours restant : écrans complets aux valeurs des planches, fenêtre/finition passable et résultat seul, assertion de durée 900–1200 s, tests d'empreintes/styles/exhaustivité et inscription dans les listes `test` / `test:watch`. Le travail reste incomplet ; aucune conformité globale n'est revendiquée.

### Reprise 12 — état réel à la reprise 3

- Vérifié : branche `p7-ecran-soiree`, HEAD `c9e7708`; l'arbre applicatif de la tranche ne contient aucun changement non commité. Les changements `.opencode/agents/*` et `opencode.json` sont étrangers et restent intacts.
- Test relancé : `node --test tests/mgmtLot53T1.test.js` (5 réussis). Le calcul de durée vérifie seulement une valeur finie positive et ne couvre pas la plage 900–1200 s.
- L'implémentation complète des critères restants n'a pas été réalisée dans cette reprise : carte `UniSoiree`/fin `UniSoireeFin`, frise/fondu et temps forts temporisés, résultat seul passable, test de cumul conforme, audit complet des classes et test d'empreintes. Le test reste seulement dans `pretest`/`pretest:watch` et non dans les longues commandes principales.
- Le calcul existant respecte les constituants documentés (temps forts 45 s, résultat 5 s, combat complet issu de la durée reconstruite, transition 10 s). Une mesure antérieure donnait 868,38 s : augmenter arbitrairement le temps ou déformer la formule pour passer la cible n'est pas une solution fidèle. Ce point reste une limite de livraison, pas une ambiguïté à faire trancher.
- État : critères de fin non atteints ; aucun changement fonctionnel supplémentaire ni commit vide n'est produit. Les commits antérieurs de reprise demeurent partiels.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

### Reprise 13 — frise de temps forts (inachevée)

- Ajouté au seul écran d'arène existant un bandeau de frise `so3-*` pour les combats en temps forts. Le repère courant est rafraîchi au fil de la lecture ; le texte des moments est échappé. Le moteur n'a pas été modifié et l'accélération hors fenêtres existante est conservée.
- Contrôle ciblé : `node --test tests/mgmtLot53T1.test.js` (6 réussis), dont un test du nombre de repères, de l'état actif et de l'échappement. Versions de `mgmt-combat.js` et `ui-cadre.css` montées.
- Travail restant conséquent : portage des écrans soirée et fin aux valeurs des planches, fenêtres réellement testées 30–60 s avec commandes/fondu conforme, résultat seul, assertion 900–1200 s, test des empreintes historiques, intégration directe aux listes `test`/`test:watch` et test exhaustif des classes. Le cumul mesuré antérieurement (868,38 s) reste hors cible. Ce commit ne termine donc pas la tranche.
- Écart de lecture : la frise illustre la sélection des moments et leur progression, mais ne transforme pas l'arène en lecture fenêtrée interactive ; l'implémentation reste l'accélération existante, sans fondu dédié ni passage au verdict spécialement géré. Aucun changement de sauvegarde.

### Reprise 15 — contrôle de la vue résultat

- Ajout du test « Monde lot 53 T1 — la vue résultat seule termine le combat et fait avancer la soirée ». Il confirme sur le chemin réel que cette vue ne bloque pas la progression et n'ouvre pas l'arène.
- Vérification : `node --test tests/mgmtLot53T1.test.js` (7 réussis). Le test ne prouve pas la carte résultat dédiée ni son délai de cinq secondes : ce comportement reste absent.
- Fichier modifié : `tests/mgmtLot53T1.test.js` (test de progression résultat seul), cette fiche (compte rendu). Aucun changement de sauvegarde ou au moteur de combat.
- Restent non faits : portage fidèle des écrans `UniSoiree` et `UniSoireeFin`, résultat dédié temporisé, fenêtres 30–60 s/fondu/passabilité, assertion du cumul 900–1200 s, couverture exhaustive style/échappement/empreintes et intégration du fichier dans les commandes principales `test` et `test:watch`. Ce travail ne satisfait pas la fin de tranche.

### Reprise 16 — test de durée des temps forts

- Fait : ajout d'un test vérifiant sur une vraie carte que `mgmtTempsFortsChoisir` fournit 4 à 8 moments triés et que `mgmtTempsFortsDuree` reste entre 30 et 60 secondes.
- Test ciblé : `node --test tests/mgmtLot53T1.test.js` — 8/8 réussis.
- Aucun code de rendu/lecture n'a été changé dans cette reprise. Les défauts précédemment consignés restent à traiter : les deux écrans ne sont pas portés aux valeurs des planches, la carte résultat dédiée et la commande de lecture des moments ne sont pas implémentées, le cumul 900–1200 s n'est pas démontré, les empreintes/styles exhaustifs restent absents et le test n'est pas dans les listes agrégées `test`/`test:watch`.
- Écart : l'estimation de durée des temps forts constitue un test de la porte de calcul, pas une preuve de la durée réelle passée dans l'interface ni du caractère passable par fenêtre.
