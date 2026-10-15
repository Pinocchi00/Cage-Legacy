# Monde lot 6 — Rapport (« La raison d'abord »)

Branche `monde-lot-6-raisons`. Bilan écrit par le superviseur le 15/10/2026, avant fusion dans `main`.

## 1. Tranches livrées
- **T1 — les quinze familles** (`mgmt-raisons.js`) : lecture pure des preuves (`mgmtRaisonsPourPaire`), aucune mutation, aucun RNG de partie. Le « retour de blessure » est omis : `injury` ne conserve pas la date de guérison.
- **T2 — la raison d'abord** : la famille est choisie avant la paire (`mgmtRaisonsIndex`, lecture groupée égale aux lectures unitaires). Variété maximale mais jamais bloquante (décision du 13/10).
- **T3 — la raison enregistrée** : la preuve est portée par la proposition, validée (`validateMgmt`) et rechargée sans recalcul. Migration 16 → 17 sur la branche (renumérotée 18 → 19 à la fusion, voir §4).
- **T4 — l'affichage** : `mgmtRaisonLignes(m,raison)` rend deux lignes échappées depuis la preuve ; rien pour `raison:null` ou origine joueur ; panneau Préliminaires.
- **T5 — les phrases** : trois formulations par famille, accord féminin par la catégorie de la paire (`mgmtAccord`), variante choisie par hachage stable (famille + ids triés), sans RNG. Phrases de la promesse, du derby et de la revanche reprises pour ne dire que ce que contient la preuve.

## 2. Tests du brief et couverture
- `tests/mgmtRaisons.test.js` (T1) : quinze familles, revanche et vrai vainqueur, preuve contre source, pureté, passé allégé sans rejouer les combats.
- `tests/mgmtRaisonsSelection.test.js` (T2) : famille avant paire, vingt graines × huit organisations (variété maximale), bloc strict varié, format inchangé, pas de bloc partiel, lecture groupée, déterminisme.
- `tests/mgmtRaisonsSauvegarde.test.js` (T3) : preuve conservée, validation/rechargement sans recalcul, causes mal formées rejetées, échange et montée de paire, pile ancienne chargeable, partie ancienne jouable.
- `tests/mgmtRaisonAffichage.test.js` (T4, T5) : deux lignes sans relecture, absence d'affichage (joueur, nul), trois formulations `relu:false` par famille, féminin, déterminisme, accord du nombre, et trois tests de fidélité (promesse, derby, revanche contre leur preuve).
- Présentation du combat (lot 3) : branchée à la fusion, voir le test de `mgmtRaisonAffichage`.

## 3. Sauvegarde
Voir la renumérotation de la fusion : la migration « raison enregistrée » est en 18 → 19 (`MGMT_SAVE_VERSION=19`), après les migrations 16 → 17 et 17 → 18 du lot 5.

## 4. Réserves connues
- La variété des raisons est « maximale mais jamais bloquante » : avec peu de familles justifiées, une famille peut se répéter sur une carte.
- Une catégorie peut n'avoir qu'un règne passé : les familles qui lisent l'histoire du titre y sont alors pauvres.
- Tous les textes de `MGMT_RAISON_PHRASES` sont `relu:false` (propositions du superviseur, sans personnage ni réplique) : à relire par Anthony.
- Le derby nomme toujours le pays, et la ville seulement si la preuve la porte.
- Famille « retour de blessure » non livrée (preuve insuffisante).
