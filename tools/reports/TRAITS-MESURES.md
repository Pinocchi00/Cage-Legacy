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

8 traits mesurables conservés : `menton-granit`, `menton-fele`, `ne-se-releve-pas`, `chasseur-de-cou`, `tombeur`, `foudroyant`, `poings-de-marbre`, `specialiste-soumission`.

21 traits retirés : `encaisseur`, `fragile-apres-ko`, `diesel`, `s-eteint`, `rythme-infernal`, `sous-pression`, `revanchard`, `hesite-apres-ko`, `grands-soirs`, `serie-noire`, `sur-sa-lancee`, `mur`, `etouffeur`, `finisseur`, `juge-dependant`, `guerrier`, `vieux-briscard`, `jeune-loup`, `roi`, `invaincu`, `comeback`. Les effets retirés n'ont atteint ni le seuil de victoire ni le seuil de signature sur les mesures finales. Le catalogue conserve donc 11 traits : les 8 mesurables et les trois états exemptés `rouille`, `debutant`, `routinier`.
