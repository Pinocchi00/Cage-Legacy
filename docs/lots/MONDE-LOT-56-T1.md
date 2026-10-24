# Monde lot 56 T1 (P11 T4) — la croissance visible : des paliers liés à la popularité et au rang

Branche : `p11-croissance` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P11 T4 et le passage P9 « Devenir le plus fort sans partir » et « Pourquoi rejoindre plus fort » (lis-les). Maquette **aux valeurs exactes** : `docs/planches-uniques/UniCroissance.dc.html`.

**Ce qui existe dans `main`** : l'écran Organisation, la popularité, la salle, le diffuseur et les salles accessibles (cherche `salle`, `diffuseur` dans `mgmt-*.js`), le budget du recruteur (P5), les classements des huit (Monde lot 9 : `mgmt-organisations*.js`, `mgmt-monde.js`), les agents libres (recrutement). Lis-les d'abord.

## Cases
**[ ] 1. Les paliers.** `mgmtPaliersCalculer(m)` (pur) : une table de **paliers** (≥ 5) liés à la popularité et au rang de Split chez les huit ; chaque palier ouvre **quelque chose de réel et déjà présent** : salles accessibles, palier du diffuseur, budget du recruteur, attrait pour les agents libres. **Ne crée aucune mécanique nouvelle** : branche seulement des plafonds ou des multiplicateurs sur ce qui existe, avec des valeurs faibles et documentées ; chaque effet a un test. Aucun palier ne peut faire baisser une valeur d'une partie existante (additif).
**[ ] 2. L'annonce.** Chaque palier franchi est **annoncé** (une fois : l'Accueil et le fil de presse) avec une phrase `relu:false` spécifique au palier.
**[ ] 3. L'écran** (`UniCroissance`) sur la page **Organisation** : les paliers franchis, la marche suivante (ce qu'elle ouvre, ce qu'il faut), le rang chez les huit. Préfixe de style `cr3-`, chaque classe a sa règle, aucun texte sous 22 px.
**[ ] 4. Tests** (`tests/mgmtLot56T1.test.js`, dans `test` ET `test:watch`) : franchissement sur une partie qui monte (chemin réel `mgmtPasseGenerer` + soirées) ; annonce unique ; effets bornés ; rien ne baisse pour une partie ancienne (empreintes de `tests/mgmtPasse.test.js` identiques) ; écran sans classe sans règle ; sauvegarde facultative, validée, réparée ; partie neuve ≤ plafond (`tests/mgmtReleveReduit.test.js` en arrière-plan).
**[ ] 5. Fin.** Commit final `Monde lot 56 T1 : la croissance visible` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- État de reprise : toujours inachevé. Tests ciblés et empreintes de `mgmtPasse.test.js` revérifiés verts (4/4 et 13/13) ; audit `node tools/verif-versions.js origin/main` vert. ESLint ciblé signale le test ignoré par la configuration (pas d'erreur de code).
- Restent non faits : raccordement des seuils aux quatre systèmes, progression réelle par `mgmtPasseGenerer` et soirées, intégration du test dans les tableaux `test`/`test:watch`, couverture sauvegarde facultative/validation/réparation et vérification de plafond rejouée en arrière-plan. L'écran n'est pas conforme à toute la maquette. Je ne revendique pas la fin.
- Les effets contenus actuellement dans `mgmtPALIERS` sont des métadonnées et ne modifient pas encore les systèmes concernés ; ce décalage demeure explicite.

  - État : **inachevé**. Le critère de fin de la fiche n’est pas atteint ; ne pas fusionner comme tranche terminée.
- Fichiers modifiés : `mgmt-salles.js` (table de cinq paliers et dérivation pure sur popularité/rang), `mgmt-ecran-organisation.js` (premier affichage de la croissance sur Organisation), `ui-cadre.css` (règles `cr3-*`), `index.html` (versions cache), `package.json` (scripts dédiés), `tests/mgmtLot56T1.test.js` (tests de dérivation et de classes).
- Tests ajoutés : « Croissance — cinq paliers sont dérivés sans mutation et répondent à la popularité et au rang » ; « Croissance — les classes cr3 de l’écran ont des règles dédiées et aucun petit texte ».
 - Vérifications reprise : `node --test tests/mgmtLot56T1.test.js` (2/2), `node --test tests/mgmtPasse.test.js` (13/13), `node --test tests/mgmtReleveReduit.test.js` (6/6, partie neuve 1 908 745 octets sous le plafond de 1,9 Mo) et `node tools/verif-versions.js origin/main` passent. Le contrôle lint mentionné dans le compte rendu précédent était vert.
- Migration de sauvegarde : aucune (aucune clé nouvelle persistée).
 - Écarts à la fiche : les effets déclarés par les paliers ne sont pas raccordés aux systèmes salles/diffuseur/recruteur/agents ; le franchissement n’est pas annoncé une fois dans l’Accueil et le fil de presse ; le détail visuel ne reprend pas les barres et valeurs exactes de la maquette. Les tests du chemin de progression réel, annonces, effets bornés, empreintes anciennes, validation/réparation de sauvegarde et plafond de partie neuve ne sont pas écrits. Le fichier n’a pas été ajouté aux listes exécutées par `test` et `test:watch` (seuls des scripts dédiés ont été ajoutés). La reprise a vérifié l’état existant sans combler ces écarts.
 - Questions pour Anthony : aucune question de spécification n’a été tranchée par supposition ; continuer le raccordement des effets existants et des annonces avant de considérer la tranche livrée.

### Reprise du 24/10/2026 — annonces et compatibilité d’empreinte

- Branche confirmée : `p11-croissance`. L’historique contient trois commits préalables marqués inachevés (`17cc481`, `59d510c`, `c0ba561`). Aucun fichier de la tranche n’était modifié dans l’arbre au début de cette reprise ; les seuls changements préexistants concernent `.opencode/agents/*` et `opencode.json` et ont été laissés intacts.
- Vérifications relancées : `node --test tests/mgmtLot56T1.test.js` (2/2) et `node --test tests/mgmtPasse.test.js` (13/13) passent.
- Changements de cette reprise : chaque palier porte une phrase d’annonce `relu:false`, le calcul pur retourne les effets déclarés, et `mgmtPaliersAnnoncer` fournit des annonces uniques dans une clé facultative. Les actualités savent afficher ces lignes. La clé est validée/réparée sans migration ni hausse de version.
- Vérifications : `node --test tests/mgmtPasse.test.js` passe (13/13) et confirme la compatibilité des empreintes après avoir retiré l’émission d’annonce du chemin de simulation ; `node tools/verif-versions.js origin/main` a été lancé avant les derniers changements. Les tests ciblés de progression réelle, intégrations d’effets, rendu maquette, réparations et plafond ne sont pas encore écrits/validés ; ESLint et la vérification finale ne sont pas faits.
- Écarts : aucun effet de palier n’est encore raccordé à la disponibilité des salles, au diffuseur, au recruteur ou aux agents libres. L’annonce n’est pas encore déclenchée dans le parcours d’Accueil, le classement des huit est purement présenté, et le balisage n’atteint pas les valeurs exactes de la maquette. Le test n’est toujours pas inscrit dans les listes agrégées `test` et `test:watch` (scripts dédiés uniquement). L’écran reste un premier affichage, sans détail des quatre marches attendu.
- Migration : aucune ; clé facultative `croissanceActus`, si présente validée/réparée. Questions pour Anthony : aucune. La tranche demeure **inachevée**.
- Aucun `TOUT_EST_FINI`.

### Reprise du 24/10/2026 — effet incrémental salle

- Modifié `mgmt-salles.js` : ajout du bonus additif au remplissage par palier de salle (1 % par niveau, plafond 3 %), activé uniquement pour monde vivant et transmis explicitement au calcul réel de la soirée. Anciennes parties/appels sans contexte inchangés.
- Modifié `tests/mgmtLot56T1.test.js` : test « Croissance — bonus de remplissage additif, plafonné et nul pour une partie ancienne ».
- Vérifications : test de tranche 5/5 vert ; `mgmtPasse.test.js` est inclus dans le lancement combiné et ses empreintes ont passé (13/13). `mgmtSalles.test.js` a dépassé le délai de 120 s, sans conclusion sur son dernier test. `node tools/verif-versions.js origin/main` vert ; ESLint ciblé sans erreur (test ignoré par configuration).
- État non terminé : diffuseur, recruteur et attrait agents restent sans raccordement, il manque le scénario de progression `mgmtPasseGenerer` + soirées, la couverture sauvegarde/réparation, le test de plafond lent, le détail exact de la maquette et l’inscription explicite du nouveau test dans `test` et `test:watch`. Pas de migration. Ces limites n’autorisent pas à déclarer la tranche finie.

### Reprise 4 — contrôle avant poursuite (24/10/2026)

- Branche vérifiée : `p11-croissance`. `git log --oneline -12` montre les trois commits antérieurs inachevés; aucun changement de fichier de tranche n'était non commité au début. Les changements présents dans `.opencode/agents/*` et `opencode.json` n'appartiennent pas à cette tranche et restent intacts.
- Fiche, passage P9 demandé et maquette `UniCroissance.dc.html` consultés. Les trois tests actuels de `tests/mgmtLot56T1.test.js` passent, ainsi que les 13 tests de `tests/mgmtPasse.test.js` (empreintes comprises).
- Cette reprise n'a pas terminé les écarts déjà listés ci-dessus : effets non raccordés, déclenchement accueil non raccordé, progression réelle et tests de compatibilité/validation/réparation/plafond manquants; le fichier de test reste seulement en scripts dédiés et n'est pas explicitement dans les listes `test` et `test:watch`. La maquette de croissance est également seulement partiellement reprise dans l'écran. Aucune revendication de fin n'est faite.
- Vérifications restantes avant livraison : implémenter les intégrations et tests manquants, lancer ESLint et `node tools/verif-versions.js origin/main`, puis exécuter le test lent de plafond en arrière-plan. Pas de migration de sauvegarde connue; `croissanceActus` et `paliersAnnonces` restent facultatives.

### Reprise du 24/10/2026 — test de franchissement et annonce initiale

- Historique à la reprise : HEAD `4e195b6` (inachevé). Branche confirmée `p11-croissance`. Les seules modifications déjà présentes hors tranche (`.opencode/agents/*`, `opencode.json`) ont été laissées intactes.
- Changements : `mgmt-salles.js` n'annonce plus le palier régional de départ comme un franchissement ; `tests/mgmtLot56T1.test.js` corrige l'assertion de pureté et ajoute un test d'annonces uniques/compatibilité ancienne. `index.html` a été actualisé par `_bump.js` pour le JS modifié. Aucun changement de sauvegarde ni de version.
- Tests verts : `node --test tests/mgmtLot56T1.test.js` (3/3) et `node --test tests/mgmtPasse.test.js` (13/13, empreintes incluses). `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` passent.
- `node --test tests/mgmtReleveReduit.test.js` a dépassé la limite de 120 s de l'outil et a été interrompu ; plafond de nouvelle partie donc non revérifié cette reprise.
- État toujours **inachevé** : `mgmtPasseGenerer` et les soirées ne sont pas couverts pour les franchissements ; les effets des paliers ne sont pas raccordés aux systèmes existants ; pas d'annonce déclenchée au parcours Accueil ; maquette toujours seulement partiellement suivie. Il reste aussi à inscrire le test directement dans les listes `test` et `test:watch` : les hooks `pretest`/`pretest:watch` l'exécutent, mais le contrôle explicite des listes renvoie `false false`.
- Écarts/question : aucune nouvelle question. Les effets restent à implémenter ; aucune conclusion de fin de tranche n'est justifiée.

### Reprise 4 — poursuite (24/10/2026)

- `git log --oneline -12` et `git status` vérifiés sur `p11-croissance`. Aucun fichier de la tranche n'était modifié avant cette reprise; les modifications `.opencode/agents/*`, `opencode.json` préexistantes restent hors de cette tranche.
- Correction de l'inscription du test : `tests/mgmtLot56T1.test.js` est désormais explicitement référencé dans les scripts `test` et `test:watch` (la vérification Node renvoie `true true`).
- Vérifications : test de tranche 6/6, `mgmtPasse.test.js` 13/13 avec empreintes, audit `node tools/verif-versions.js origin/main` sans écart et `node_modules/.bin/eslint .` sans erreur.
- Toujours inachevé : pas d'intégration réelle des paliers diffuseur/recruteur/attrait agents; le franchissement via `mgmtPasseGenerer` et soirées n'est pas couvert; aucune preuve que les annonces sont déclenchées par le parcours Accueil; maquette partielle; validation/réparation facultative et plafond de sauvegarde neuve non revérifiés. Le test lent `mgmtReleveReduit.test.js` n'a pas été lancé cette reprise. Aucun résultat ci-dessus ne permet d'affirmer que toutes les cases sont finies.
- Lint global vert. Les changements personnels préexistants hors tranche ne sont pas ajoutés.

### Reprise 5 — vérification ciblée (24/10/2026)

- Historique et état Git vérifiés : branche `p11-croissance`, HEAD `86f9f1a`; les modifications `.opencode/agents/*` et `opencode.json` étaient préexistantes, hors de cette tranche, et restent non ajoutées.
- Correction du test « Croissance — chaque palier documente un effet borné et une annonce distincte » : l'unicité porte désormais sur le texte, pas sur la référence d'objet, et l'assertion vérifie que chaque annonce est une phrase marquée `relu:false`.
- Vérifications de cette reprise : `node --test tests/mgmtLot56T1.test.js` (6/6), `node --test tests/mgmtPasse.test.js` (13/13, empreintes inchangées), `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` passent.
- Non terminé : cette reprise n'a pas codé le raccordement paliers-diffuseur/recruteur/agents, le franchissement généré par soirées ni l'intégration d'annonces à l'accueil, l'écran reste incomplet vis-à-vis des valeurs de la maquette, et les tests de sauvegarde facultative/réparation et de plafond lent restent à vérifier. Le test de croissance demeure enregistré dans `test` et `test:watch`; le plafond n'est pas revendiqué comme vérifié ici. Pas de migration.
- Aucune question nouvelle ni `TOUT_EST_FINI` : les critères de fin de la tranche restent à faire.

### Reprise 6 — parcours réel ciblé (24/10/2026)

- Ajout du test « Croissance — une partie créée par le passé généré reste valide après des soirées » : création par `mgmtPasseGenerer('split',{soirees:3})`, une soirée jouée, puis validation et aller-retour de sauvegarde. Le contrôle confirme aussi qu'une partie issue de `mgmtDefault()` n'acquiert pas `croissanceActus` spontanément.
- `node --test tests/mgmtLot56T1.test.js` passe (7/7).
- Restent inachevés et non couverts : les effets réels du diffuseur, du budget recruteur et des agents libres ; annonce déclenchée dans le parcours Accueil après un vrai franchissement (la fonction d'annonce est testée isolément) ; détail exact de la maquette (barres/marches) ; test d'empreinte ancienne dédiée et sauvegarde facultative malformée/réparée ; plafond lent non relancé dans cette reprise. Le bonus de salle seul est branché. Aucun nouveau champ requis ni migration.
- L'écran existant expose l'aperçu mais ne reproduit pas tous les éléments aux valeurs exactes du HTML de la maquette ; écart assumé et non résolu. La tranche n'est pas déclarée terminée.

### Reprise 9 — effet recruteur et garde-fous sauvegarde (24/10/2026)

- Historique/branche consultés : `p11-croissance`, HEAD `648d5d0`. Les modifications hors tranche préexistantes (`.opencode/agents/*`, `opencode.json`) sont conservées sans staging. Aucun fichier de la tranche n'était modifié avant cette reprise.
- Ajout d'un effet de croissance réel au budget du recruteur : remise additive de 1 % par niveau (plafond 3 %), seulement en monde vivant ; les anciennes parties gardent strictement le coût d'origine. L'index `?v=` est monté.
- Ajout du test de validation/réparation des champs d'annonce facultatifs; les clés ne sont pas ajoutées à une partie ancienne.
- Tests verts : `node --test tests/mgmtLot56T1.test.js` (9/9) et `node --test tests/mgmtPasse.test.js` (13/13, empreintes incluses). `node tools/verif-versions.js origin/main` repasse sans écart après bump. Le test de tranche est explicitement listé dans `test` et `test:watch`.
- Restent non faits : effet diffuseur et attrait agents libres, scénario de franchissement effectif après soirées et vérification explicite des annonces sur ce parcours, reproduction complète aux valeurs de la maquette (marches détaillées), contrôle de plafond `mgmtReleveReduit.test.js` (timeout de 120 s) et correction des points incomplets dans les tests d'effet/rendu. `node_modules/.bin/eslint .` passe. Pas de changement de version de sauvegarde.
- Fichiers de cette reprise : `mgmt-recruteur.js` (remise de mission), `index.html` (version cache), `tests/mgmtLot56T1.test.js` (couvertures sauvegarde et effet recruteur), cette fiche (compte rendu). Écarts à la fiche : ci-dessus; aucune question nouvelle.
- État : **inachevé**, critère de fin non atteint; aucun `TOUT_EST_FINI`.

### Reprise 10 — état final de cette session (24/10/2026)

- Branche `p11-croissance`, historique et état consultés. Les commits de tranche déjà présents sont conservés. Les modifications préexistantes de `.opencode/agents/*` et `opencode.json` ne sont pas à cette tranche et n'ont pas été ajoutées.
- Vérifications relancées : `node --test tests/mgmtLot56T1.test.js` (9/9), `node --test tests/mgmtPasse.test.js` (13/13, empreintes), `node tools/verif-versions.js origin/main`, `node_modules/.bin/eslint .`; contrôle des scripts retourne `true true` pour `test` et `test:watch`.
- Le dernier travail livré auparavant raccorde le remplissage des salles et la remise du recruteur, mémorise et affiche les annonces dans l'accueil/fil de presse, dérive cinq paliers et ajoute des contrôles de sauvegarde facultative.
- Critères restant non atteints : pas d'effet relié au diffuseur ni à l'attrait des agents libres; test ne démontre pas de franchissement causé par `mgmtPasseGenerer` et soirées (le parcours testé ne fait que valider une partie après soirée); l'écran ne reproduit pas les quatre pistes détaillées de la planche; les assertions d'empreintes sont couvertes indirectement par `mgmtPasse.test.js`, pas dans le test de tranche. Le test de plafond `mgmtReleveReduit.test.js` n'a pas été mené à terme dans cette reprise, et la réparation facultative n'est pas suffisamment exercée avec toutes les formes malformées.
- Écart de procédure : aucun nouveau fichier n'a été commité pendant cette reprise; la tranche demeure inachevée et ne peut porter le commit final demandé ni `TOUT_EST_FINI`.

### Reprise 11 — pistes de croissance détaillées (24/10/2026)

- État à la reprise : HEAD `09f11df`, branche `p11-croissance`. Les seuls changements préexistants hors tranche (`.opencode/agents/*`, `opencode.json`) restent intacts et ne sont pas ajoutés.
- `mgmt-ecran-organisation.js` présente désormais quatre pistes distinctes et détaille les effets du prochain palier; `ui-cadre.css` ajoute les règles `cr3-track*` (22 px minimum). Le test de l’écran contrôle aussi les quatre familles et l’indication des conditions de la marche suivante. `index.html` a été mis à jour par `tools/_bump.js` pour les deux ressources modifiées.
- Tests : `node --test tests/mgmtLot56T1.test.js tests/mgmtPasse.test.js` passe (22/22, empreintes historiques comprises); `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` passent.
- État toujours inachevé et sans commit final : les effets diffuseur et attrait agents ne sont pas branchés sur des mécaniques existantes; le scénario n’établit pas un franchissement réel après les soirées; l’annonce n’est pas déclenchée directement au parcours Accueil; les tests demandés d’empreintes, réparations complètes et plafond lent restent incomplets/non rejoués. La planche complète n’est pas intégralement reproduite. Ces points sont du travail restant, pas des questions de spécification. Aucun changement de sauvegarde.
- Changements de cette reprise : `mgmt-ecran-organisation.js`, `ui-cadre.css`, `index.html`, `tests/mgmtLot56T1.test.js`, cette fiche. Aucun test ou fichier hors tranche n’a été modifié intentionnellement. Aucun `TOUT_EST_FINI`.
