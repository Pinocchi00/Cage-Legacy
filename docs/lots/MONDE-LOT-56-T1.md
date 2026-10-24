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
