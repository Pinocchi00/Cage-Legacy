# Monde lot 6 T6 — Réparer les tests après la fusion avec main

## Branche
`monde-lot-6-raisons` (branche attendue et courante). `main` y est déjà fusionné ; la migration du lot 6 est renumérotée 18 → 19 (`MGMT_SAVE_VERSION=19`). NE fusionne PAS `main` à nouveau.

## Objectif
Le contrôle complet (superviseur, 15/10) donne 1233/1243. Les échecs à traiter :
1. `Monde lot 5 T4 — la contrariété survit à la sauvegarde sans se recréer` (false au lieu de true).
2. `Monde lot 5 T3 — une ancienne sauvegarde ne reçoit aucune provenance` (false au lieu de true).
   Ces deux tests (lot 5, fichiers trouvés par grep) passent sur `main`. Ils sont cassés par la fusion : très probablement par la chaîne de migration renumérotée (16→17, 17→18 du lot 5 puis 18→19 du lot 6) ou par la migration du lot 6 qui touche la pile et les cartes. Lis-les, trouve la cause dans `mgmt-save.js`/`mgmtMigrate`, corrige le CODE (pas le test). Une partie de version 16 ou 17 doit passer par toutes les étapes dans l'ordre et garder ses contrariétés et l'absence de provenance.
3. Empreintes de `tests/mgmtPasse.test.js` (« une partie créée sans le passé », « l'optimisation du booking ») : la raison est désormais enregistrée sur chaque combat proposé (lot 6 T3), l'état change : recalcule les empreintes avec le commentaire « Décision du lot 6 T3 (raison enregistrée) : empreintes recalculées ; la propriété gardée est le déterminisme. ».
4. `Monde lot 1 T3 — les six ans complets` (deux tests) et `Monde lot 1 T4 bis — des recrues…` : ils ont échoué sur leur DURÉE (259 s et 611 s) parce que la machine faisait tourner deux contrôles complets ; lance-les SEULS (`node --test tests/mgmtPasseSixAns.test.js`). S'ils passent seuls, n'y touche pas et dis-le. S'ils échouent seuls, explique pourquoi.

## Vérification
`node --test` sur chaque fichier concerné, `node tools/_bump.js` des .js modifiés, `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur relance le contrôle complet). Commit `Monde lot 6 T6 : tests réparés après la fusion`.

## Hors périmètre
Aucune nouvelle fonction ; aucun texte.
