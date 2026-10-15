# Monde lot 9 T2a — les huit organisations vivent : la création et la sauvegarde 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
la création et la sauvegarde : à la création d'une partie avec passé, les sept autres organisations vivent leurs six ans (`m.orgs`, format de la DÉCISION 2), `m.mondeVivant=true` ; migration 18 → 20 (`m.mondeVivant=false`, ancien monde inchangé), validation, sérialisation par `mgmtPasseCompacter` ; taille mesurée. AUCUN lecteur n'est encore branché : les écrans lisent toujours l'ancien monde.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2a : ...`.

## Compte rendu (T2a)
- Code : `mgmt-passe.js` (ancre MONDE_LOT9_T2A_ORGS_VIVANTES : `mgmtMondeVivantPreparer/Pas/Generer/Valide`, `mgmtSerialiserCorps`, `mgmtSerialiser` écrit aussi `m.orgs`), `mgmt-save.js` (migration 18 → 20 `mondeVivant=false`, `validateMgmt`, `mgmtParseAndValidate` redéploie et valide chaque sous-partie), `mgmt-bureau.js` (`MGMT_SAVE_VERSION=20`), `mgmt-nouvelle.js` (la création réelle, sans `MGMT_NOUVELLE.soirees` imposé, ou avec `MGMT_NOUVELLE.monde=true`, fait vivre les sept à la suite, barre comprise). Aucun lecteur branché.
- Isolation : chaque pas sauvegarde/restaure `G.mgmt` et `SEED` ; graine de chaque sous-partie par `mgmtIdentiteStream(orgId,'monde',m)`. Partie du joueur et RNG finale identiques avec et sans les sept (testé).
- Tests : `tests/mgmtMondeVivant.test.js` (6) ; tests v18 → v20 mis à jour avec commentaire citant la décision (mgmtAnnulationHeritee, CartePremierJour, Effectifs, Emplacements, Humanite, Marque, Niveau, PredecesseurDemandes).
- Mesures (création complète, graine 20261015, machine de dev) : passé du joueur 45,7 s, sept organisations 280,9 s, total 326,6 s ; partie sérialisée 2 973 540 octets (joueur seul 393 106 ; environ 368 Ko par organisation). **Réserve : 2,97 Mo dépasse le budget de 2 Mo de la DÉCISION 2.**
