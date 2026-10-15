# Monde lot 4 — Les dossiers de Leïla : cadre de travail (superviseur, 15/10/2026)

**Branche attendue et courante : `monde-lot-4-dossiers`** (créée le 15/10 à partir de la branche du lot 6 pour disposer des raisons, `mgmt-raisons.js`). Elle sera fusionnée APRÈS le lot 6 ; ne fusionne jamais `main` toi-même. Ce n'est PAS une erreur de branche.
Planches VALIDÉES par Anthony le 10/10 : `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html`. La tranche T3 du brief (la planche) est donc FAITE : la chaîne est T1, T2, T4, T5, T6.
Règles : aucun sous-agent n'est appelable depuis le codeur (pas de @ecrivain, @verif, @relecteur) — il vérifie lui-même avec `node tools/verif-versions.js origin/main` et `npm run check:rapide`. Les textes fixes sont copiés des planches, marqués `relu:false`. Le superviseur tranche toute question technique : aucun STOP pour une question technique. Les dossiers posent le combat par `mgmtBookMain` (pas de second système de booking) ; la liste complète reste accessible.

## Vérification des versions (superviseur, 15/10 11 h)
Cette branche part du lot 6, plus ancien que `main` : `node tools/verif-versions.js origin/main` y signale des écarts hérités (par exemple `mgmt-bureau.js`) qui ne viennent PAS du lot 4. Ils seront réglés à la fusion par le superviseur. Ne t'arrête pas pour eux : seuls comptent les fichiers que ta tranche modifie (monte leur `?v=` avec `node tools/_bump.js`). T1 est ACCEPTÉE (check rapide vert) ; les réserves du relecteur sont à reprendre au bilan.
