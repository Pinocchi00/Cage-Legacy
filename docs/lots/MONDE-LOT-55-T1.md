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
