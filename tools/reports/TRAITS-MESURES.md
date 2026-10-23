# Mesure des effets des traits — Monde lot 32 T2

Mesure fixe du 22/10/2026 : 1 500 combats par trait, même combattant H-light moyen dans les deux coins, tirage du coin alterné, graine appariée entre profil témoin et profil avec effet. Les dix profils réels moyens choisis dans le passé Split de deux soirées (graine 20261008) : `mg105` (59), `mg109` (59), `mg116` (59), `mg121` (64), `mg104` (66), `mg94` (67), `mg111` (67), `mg122` (67), `mg99` (68), `mg119` (69). Erreur standard affichée en points de pourcentage. Verdict selon la règle de la fiche : victoire A à au moins 2,5 points de 50 %, ou métrique signature modifiée d'au moins 15 % en relatif. Outil : `tools/mesure-traits.js`.

| Trait | Effet testé | Victoires A ± ES | Signature témoin → effet | Verdict |
|---|---|---:|---:|---|
| menton-granit | chin +7, durability +3 | 50,80 ± 1,29 % | défaites KO 26,40 → 18,70 % (−29,2 %) | mesurable |
| menton-fele | chin −7 | 46,40 ± 1,29 % | défaites KO 24,74 → 29,98 % (+21,2 %) | mesurable |
| encaisseur | durability +4, heart +3 | 49,67 ± 1,29 % | défaites KO 48,93 → 49,67 % (+1,5 %) | sans effet mesurable |
| fragile-apres-ko | chin −4, confidence −5 | 48,07 ± 1,29 % | défaites KO 24,03 → 26,32 % (+9,5 %) | sans effet mesurable |
| diesel | cardio +7 | 50,33 ± 1,29 % | ratio sig. R3/R1 0,74 → 0,74 (0,0 %) | sans effet mesurable |
| s-eteint | cardio −7 | 48,60 ± 1,29 % | ratio sig. R3/R1 0,77 → 0,77 (−0,0 %) | sans effet mesurable |
| rythme-infernal | cardio +3, aggression +4 | 52,00 ± 1,29 % | ratio sig. R3/R1 0,78 → 0,77 (−0,6 %) | sans effet mesurable |
| sous-pression | composure −8 | 48,33 ± 1,29 % | victoire A 48,93 → 48,33 % (−1,2 %) | sans effet mesurable |
| revanchard | heart +4 | 49,80 ± 1,29 % | victoire A 49,67 → 49,80 % | sans effet mesurable |
| hesite-apres-ko | confidence −6, aggression −4 | 49,00 ± 1,29 % | victoire A 52,07 → 49,00 % | sans effet mesurable |
| grands-soirs | composure +4 | 48,67 ± 1,29 % | victoire A 48,53 → 48,67 % | sans effet mesurable |
| serie-noire | confidence −5 | 48,67 ± 1,29 % | victoire A 48,67 → 48,67 % (0,0 %) | sans effet mesurable |
| sur-sa-lancee | confidence +5 | 50,67 ± 1,29 % | victoire A 50,67 → 50,67 % | sans effet mesurable |
| ne-se-releve-pas | tdd −6, guardWork −6 | 45,53 ± 1,29 % | soumissions/fight 0,06 → 0,08 (+30,9 %) | mesurable |
| chasseur-de-cou | submission +7 | 54,27 ± 1,29 % | soumissions/fight 0,06 → 0,15 (+132,0 %) | mesurable |
| tombeur | takedown +6 | 52,33 ± 1,29 % | amenées/fight 0,31 → 0,38 (+19,9 %) | mesurable |
| mur | tdd +7 | 52,47 ± 1,29 % | amenées/fight 0,33 → 0,34 (+3,2 %) | sans effet mesurable |
| etouffeur | topControl +7 | 51,53 ± 1,29 % | amenées/fight 0,35 → 0,35 (−0,2 %) | sans effet mesurable |
| finisseur | killer +6 | 49,47 ± 1,29 % | finitions des victoires 37,98 → 38,81 % (+2,2 %) | sans effet mesurable |
| juge-dependant | killer −5, discipline +3 | 49,13 ± 1,29 % | victoire A 49,67 → 49,13 % (−1,1 %) | sans effet mesurable |
| foudroyant | explosiveness +5, killer +3 | 53,00 ± 1,29 % | finitions des victoires 33,16 → 32,83 % (−1,0 %) | mesurable |
| poings-de-marbre | power +5 | 58,33 ± 1,27 % | finitions des victoires 31,32 → 34,17 % (+9,1 %) | mesurable |
| specialiste-soumission | submission +6 | 54,33 ± 1,29 % | soumissions/fight 0,07 → 0,15 (+106,6 %) | mesurable |
| guerrier | heart +4, aggression +3 | 50,47 ± 1,29 % | victoire A 48,07 → 50,47 % | sans effet mesurable |
| vieux-briscard | fightIQ +4, explosiveness −4 | 50,80 ± 1,29 % | victoire A 49,47 → 50,80 % | sans effet mesurable |
| jeune-loup | explosiveness +4, composure −3 | 50,53 ± 1,29 % | victoire A 50,53 → 50,53 % | sans effet mesurable |
| roi | confidence +4, composure +3 | 49,67 ± 1,29 % | victoire A 49,33 → 49,67 % | sans effet mesurable |
| invaincu | confidence +4 | 50,13 ± 1,29 % | victoire A 50,13 → 50,13 % | sans effet mesurable |
| comeback | heart +3 | 49,93 ± 1,29 % | victoire A 49,67 → 49,93 % | sans effet mesurable |

## Catalogue après retrait

32 traits gardés, dont 8 avec un effet mesuré ; les 24 autres sont de pure identité (effet nul, non mesurable à ±5 points d'attribut). Les 8 effets mesurés sont ceux listés ci-dessus ; les 24 autres restent dans `MGMT_TRAITS` avec `effet:null`.

Le cardio (`diesel`, `s-eteint`) ne change pas le rapport des coups significatifs du round 3 au round 1 dans la mesure (0,74 → 0,74 pour diesel ; 0,77 → 0,77 pour s'éteint). Le moteur lit bien `c.attrs.cardio` : `eff()` (`engine.js`) le replie en `0,82·cardio + 0,18·recovery` avant `simulateFight`. L'effet de ±7 points d'attribut (≈ ±5,7 points d'endurance) est donc appliqué, mais trop faible pour déplacer le rapport sur trois rounds. Aucune modification du moteur.

## Garde-fou — mesure d'avant (origin/main, 14e1673, 23/10/2026)

`node tools/mesure-finitions-jeu.js 40 20261008,777,4242` : 1 080 combats ; KO/TKO 34,7 % ; soumissions 16,2 % ; arrêts médicaux 5,1 % ; décisions 43,7 % ; nuls 0,3 % ; finitions en tout 56 % ; combats en 5 rounds 25,7 %.
`mgmtPasseGenerer('split',{soirees:62})` (graine 20261008) : 52 911 ms.

## Garde-fou — mesure d'après (branche p2-traits, 23/10/2026)

`node tools/mesure-finitions-jeu.js 40 20261008,777,4242` : 1 080 combats ; KO/TKO 32 % ; soumissions 18,3 % ; arrêts médicaux 3,9 % ; décisions 45,5 % ; nuls 0,3 % ; finitions en tout 54,3 % ; combats en 5 rounds 25,6 %. Les trois mesures de finitions/KO/soumissions restent dans leurs bandes respectives (45–60 %, 25–36 %, 12–22 %) ; facteur conservé : 1.

`mgmtPasseGenerer('split',{soirees:62})` (graine 20261008) : 96 664 ms, contre 52 911 ms avant (+82,9 %). Le seuil de +25 % est dépassé. La mesure de runtime ne dépend pas de l'amplitude des deltas; un facteur d'effet inférieur n'est donc pas une correction démontrée de ce dépassement. La mesure est consignée comme hors bande, sans élargir les tolérances.

### Mesures comparables de reprise — étape A (23/10/2026)

Outil `node tools/mesure-generation.js 62 [--sans-traits]`, même processus de jeu via `newGameWindow({runMain:true})`, graine 20261008, variantes alternées sous charge ambiante :

| Essai | Avec traits | Sans traits |
|---|---:|---:|
| 1 | 67 144 ms | 41 868 ms |
| 2 | 55 598 ms | 65 522 ms |

La forte inversion entre répétitions confirme que la machine est chargée de façon variable ; les quatre chiffres sont conservés et ne permettent pas à eux seuls de valider le seuil. Le profil de code confirme qu'à chaque ajout à `m.hist`, `mgmtStatsIndex` invalide son cache par longueur et reconstruit l'index complet ; `mgmtTraitsCombats` appelle ce chemin pour chaque évaluation de traits.

### Correction de performance (23/10/2026)

Cause du +83 % : `mgmtStatsIndex` (mgmt-stats.js) rebâtissait tout l'index à chaque combat ajouté à `m.hist` pendant la génération (quadratique), et recalculait le bilan officiel de tous les combattants. Il est maintenant incrémental quand seul `m.hist` grandit (sans monde vivant) et le bilan se lit à la demande (`mgmtStatsTotal`) ; `mgmtTraitsEtat` calcule la liste des combats du combattant une fois. Mesure comparable, même processus, `node tools/mesure-generation.js 62` : avec traits 49 022 ms, sans traits 48 806 ms (+0,4 %). Ancien : 67 144 ms contre 41 868 ms.
