# Monde lot 5 — rapport de fin de lot

**Verdict : non, pas prêt pour la relecture finale : `node tools/verif-versions.js` signale deux ressources modifiées dont les versions d’URL n’ont pas été remontées.**

## Tests du brief → couverture

| Test du brief (lot 5, lignes 273–277) | Couverture |
|---|---|
| 20 graines × 8 organisations : 2–3 combats valides et soirée au calendrier | `tests/mgmtCarteHeriteeSixAns.test.js` — « Monde lot 5 T1 — vingt graines et huit organisations héritent de combats valides » (matrice réduite à 2 graines × 8 par décision T2) |
| Places libres avec dossiers, carte complétable sans liste | **Absent** : décision T3 reporte les dossiers au lot 4 ; `tests/mgmtCartePremierJour.test.js` ne couvre que la provenance et son rendu répété. |
| Chaque promesse ouverte renvoie à une demande de l’archive | `tests/mgmtPromessesHeriteesSixAns.test.js` — « Monde lot 5 T2 — chaque promesse ouverte du premier jour renvoie à une demande de l’archive » |
| À graine égale, organisations avec cartes héritées différentes | `tests/mgmtCarteHeriteeSixAns.test.js` — « Monde lot 5 T1 — à graine égale les organisations héritent de combats différents » |
| Le joueur automatique termine la carte et joue la soirée | `tests/mgmtSuiteHeritee.test.js` — « Monde lot 5 T5 — le joueur automatique finit la carte héritée avec une reprise » |

## « Ce qu’on veut » du lot 5

| Attendu (lignes 257–261) | État |
|---|---|
| Deux ou trois combats signés, chacun avec présentation lisible | **Partiel** : carte héritée marquée (T3) et lecture de présentation absente de cette branche ; pas de présentation de ces combats. |
| Places libres s’ouvrant sur les dossiers de Leïla | **Absent** : les places restent sur l’affichage actuel ; dossiers reportés au lot 4. |
| Préliminaires de Leïla, chacun avec sa raison | **Partiel** : carte de la soirée et préliminaires existent, mais couverture explicite des raisons héritées non établie par T5. |
| Promesses, demandes sans réponse et fins de contrats laissées par le prédécesseur | **Partiel** : demandes répondues et promesses ouvertes testées ; contrats proches de l’échéance ne sont pas un attendu spécifiquement couvert au premier jour. |
| Carte différente par organisation, sans forçage | **Fait** selon le test T1 des cartes deux à deux distinctes ; politique commune utilisée, orientation par organisation reportée. |

## Sauvegarde et vérifications

- Version courante : **18**. Migrations séquentielles **16 → 17** (provenance facultative, non rétroactive), puis **17 → 18** (numéro seul ; motif de contrariété étendu). Test de chargement ancien : `tests/mgmtCartePremierJour.test.js` — « une ancienne sauvegarde ne reçoit aucune provenance » ; T4 inclut aussi « la contrariété survit à la sauvegarde sans se recréer ».
- `node tools/verif-versions.js` : **échec**, deux écarts face à `main` : `mgmt-ceintures.js` (URL `?v=b7x` inchangée) et `mgmt-screens.js` (URL `?v=m9xxxxxxx` inchangée). La version d’index doit être corrigée avant relecture.
- `npm run check` : **# pass 1085, # fail 0, # skipped 0** (tests ; durée rapportée 442427,9968 ms). Le check complet est vert.

## Écarts et risques

1. **Bloquant relecture — cache/version** : les ressources ci-dessus ne respectent pas l’audit de version. `index.html:1124` conserve `mgmt-ceintures.js?v=b7x` et `index.html:1161` conserve `mgmt-screens.js?v=m9xxxxxxx`, identiques aux références de `main`.
2. **Parcours central manquant selon décision T3** : pas d’action « Lire la présentation » puisque `mgmtPresentationCombat` est absent de la branche ; places libres sans dossiers. `docs/lots/MONDE-LOT-5-T3.md:127` et `:130` documentent le report/acceptation de T3, mais cela laisse le test brief sur dossiers absent.
3. **Contrôle visuel non réalisé** : aucun contrôle navigateur/capture aux largeurs 1280/1440/1920 px pour la confirmation héritée ; `docs/lots/MONDE-LOT-5-T4.md:150` et `:153–154` le réservent explicitement au bilan. La suite ne prouve pas l’absence de chevauchement ni l’activation native dans un vrai navigateur.
4. **Portée de la couverture longue réduite** : décision T2 ramène les matrices de 20 graines à 2 × 8 créations ; `docs/lots/MONDE-LOT-5-T1.md:94` et `T2.md:97–98`. Le rapport T6 confirme 16 créations et les vérifications rapides, mais ce n’est pas 20 graines.

## À regarder en jouant / textes à relire

- Carte au premier jour : distinguer « VIENT D’AVANT », action X et retrait d’un combat non hérité ; vérifier la lisibilité des combats hérités et le comportement des places libres.
- Annulation héritée : avertissement en ligne, confirmer/renoncer, modification d’un combat, X/Entrée, curseur et retour à la Carte ; tester visuellement 1280, 1440 et 1920 px. Puis jouer la soirée et reprendre une soirée interrompue jusqu’à Résultats.
- Textes ajoutés avec `relu:false` : **5** libellés dans `mgmt-data.js:24` (1 provenance, T3) et `mgmt-carte-cadre.js:15–17` (4 libellés de confirmation, T4). Aucun texte neuf en T1/T2/T5/T6.

## Questions pour Anthony

- Peux-tu faire corriger les deux références de cache signalées, puis relancer l’audit de versions ?
- Valides-tu le parcours de départ actuel malgré l’absence de présentations et de dossiers sur cette branche, ou faut-il intégrer les lots 3/4 avant la relecture fonctionnelle ?
- Peux-tu vérifier visuellement la confirmation d’annulation sur les trois largeurs demandées ?
