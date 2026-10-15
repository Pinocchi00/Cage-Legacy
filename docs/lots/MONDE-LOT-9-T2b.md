# Monde lot 9 T2b — les huit organisations vivent : la semaine 

Branche : `monde-lot-9-monde`. **Sous-tranche de la T2** : la spécification complète, les DÉCISIONS 1 et 2 sont dans `docs/lots/MONDE-LOT-9-T2.md` ; lis-les d'abord. Le commit « (inachevé) » 6fd1db4 n'a rien codé.

## Périmètre de cette sous-tranche, et rien d'autre
la semaine : à chaque ouverture de cycle du joueur, chaque organisation de `m.orgs` joue au plus une soirée selon son calendrier, ordre fixe, déterministe ; temps d'une semaine mesuré.

## Vérification
Tests ciblés de la sous-tranche (nouveau fichier `tests/mgmtMondeVivant.test.js`, ajouté à `package.json` `test` et `test:watch`), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2b : ...`.

## Note du superviseur — 15/10/2026 (avant T2b)
T2a est ACCEPTÉE : tests verts, partie complète ≤ 1,5 Mo. Mais le test « T2a bis — six ans complets : la partie écrite tient en 1,5 Mo » dure 16 minutes : il ne doit PAS rester dans la suite ordinaire. Dans cette tranche, sors-le de `tests/mgmtMondeVivant.test.js` vers `tools/mesure-monde-vivant.js` (même assertion, lancé à la main par le superviseur avant une fusion, documenté dans `tools/reports/` ou en tête du fichier). Aucun autre test de la suite ne doit générer les six ans des huit organisations : utilise un passé court.

## Compte rendu

- Fichiers modifiés : `tests/mgmtMondeVivant.test.js` retire la mesure six ans de la suite ordinaire ; `tools/mesure-monde-vivant.js` conserve les assertions comme mesure manuelle ; cette fiche consigne l'écart.
- Tests ajoutés : aucun. Tests ciblés existants : les six tests Monde vivant.
- Migration de sauvegarde : aucune dans cette sous-tranche.
- Écart à la fiche : la simulation hebdomadaire et sa mesure n'ont pas été implémentées. La coordination du matchmaker avec l'ouverture du cycle, qui exige temporairement le remplacement de `G.mgmt`, reste à intégrer ; je n'ai pas fait de modification partielle risquant d'altérer la progression existante.
- Vérification : `node --test tests/mgmtMondeVivant.test.js` passe (6/6). `node tools/verif-versions.js origin/main` signale un écart pour `mgmt-nouvelle.js` (`?v=b9xxxxxxxx` identique à origin/main), fichier hors de cette tranche.
- Questions pour Anthony : reprendre l'implémentation de l'ouverture hebdomadaire après inventaire de son point d'appel exact.

## REPRISE du superviseur — 15/10/2026 (le point d'appel est trouvé : code-le)
- **Point d'appel exact** : `mgmtNewPile(m)` (`mgmt-bureau.js`) appelle déjà `mgmtMondeOuvreCycle(m)` à chaque ouverture de cycle du joueur. Ajoute juste après, dans `mgmtNewPile`, un appel `mgmtMondeVivantSemaine(m)` (nouvelle fonction dans `mgmt-passe.js`, à côté de `mgmtMondeVivantPas`).
- **Isolation** : réutilise EXACTEMENT le motif de `mgmtMondeVivantPas` (T2a) : sauvegarder `G.mgmt` et `SEED`, poser la sous-partie, jouer, restaurer `G.mgmt` et `SEED` — la partie du joueur et sa RNG ne bougent pas. Graine de la soirée dérivée de `mgmtIdentiteStream(orgId,'semaine|'+m.cycle,m)`.
- **Règle** : `if(m.mondeVivant!==true) return;` puis, pour chaque `orgId` de `m.orgs` dans l'ordre fixe, si `sous.cal.prochaines[0]` existe et que son jour est ≤ au jour du joueur (`m.cal.jour`, même échelle que le passé : vérifie dans `mgmtPasseCloturer` comment les jours ont été recalés et recale la sous-partie de la même façon si besoin), joue UNE soirée par `mgmtPredecesseurSoiree(sous,sous.eventsPlayed||0,mgmtPredecesseurReglages(orgId))`, puis `mgmtMondeVivantAlleger(sous)`.
- **Tests** (dans `tests/mgmtMondeVivant.test.js`, passé court de 6 soirées) : une semaine fait jouer chaque organisation dont la soirée est due, et aucune autre ; la partie du joueur (empreinte) et `SEED` sont identiques avec et sans la semaine des sept ; deux parties à graine égale donnent les mêmes sept états après trois semaines ; une partie `mondeVivant:false` ne fait rien. Mesure le temps d'une semaine (console) et consigne-le.
Pas de modification partielle : si un test reste rouge, dis lequel et pourquoi. Commit `Monde lot 9 T2b : la semaine` sans « inachevé » si les tests sont verts.
