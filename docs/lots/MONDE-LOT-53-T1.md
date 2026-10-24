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

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
