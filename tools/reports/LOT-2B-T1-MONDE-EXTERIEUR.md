# Mesure Monte Carlo — le monde extérieur dérivé (lot 2B T1)

Outil : `tools/monte-carlo-monde-exterieur.js` — jeu réel (jsdom), moteur réel `simulateFight`,
passerelle réelle du jeu (`mgmtCombatProfile`), traces dérivées réelles (`mgmtExteriorTrace`).
Aucune constante modifiée : mesure seule.

*Remesuré le 25/09/2026 après le lot 2B T3 bis (les fondateurs reçoivent un passé) : les
deux cibles tiennent avec la cohorte plus âgée — r_extérieur 0,638 dans la bande
[0,7 × ; 1,3 ×] de r_roster 0,722, fins à ±0,031 du moteur au pire. Le pool extérieur
porte la cohorte d'ouverture (âges vivants de 20 à ~41 ans) plus trente cycles
d'entrants ; ses fins se lisent sur le même pont, ligne par ligne.*

- Graine de base : `20260921`
- Combats mesurés par pool : 4000 (paires de même catégorie, chaque combat sous sa propre graine)
- Pool « roster » : 949 lignes de `mgmtNewRoster` en 19 lots — LA référence (bilans générés par `correlatedRecord`)
- Pool « extérieur » : 6524 lignes du vivier dérivé (cohorte initiale + 30 cycles d'entrants), traces lues au cycle 30 — âge moyen 27.107 ans
- Combattants par catégorie (min sur les 12) : roster 63, extérieur 518

Les deux pools passent par le MÊME pont vers le moteur (`mgmtCombatProfile` : le bilan dérivé
devient un niveau, le niveau devient un profil de combat) — le monde extérieur n'a aucun
traitement de faveur et aucun traitement dégradé.

## Cible 1 — le bilan prédit le résultat (§3.1)

Pour chaque combat, x = écart des ratios de victoires des bilans (ce que l'écran montre),
y = résultat observé (1 victoire de A, 0,5 nul, 0 défaite). La corrélation de Pearson r mesure
à quel point le bilan annonce le combat. Verdict : le monde dérivé est réaliste si son r est
du MÊME ORDRE que celui du roster — dans la bande [0,7 × r_roster ; 1,3 × r_roster], même signe.

| Pool | n | r (bilan ↔ résultat) | nuls | Paires sautées |
|---|---|---|---|---|
| roster (correlatedRecord, référence) | 4000 | 0.722 | 5 | 0 |
| extérieur (monde dérivé) | 4000 | 0.638 | 3 | 0 |

Taux de victoire du favori du bilan (celui au meilleur ratio), par écart de bilan :

| Écart de bilan | n roster | favori roster | n extérieur | favori extérieur |
|---|---|---|---|---|
| 0 – 0,05 | 1289 | 65.5 % | 1080 | 63.7 % |
| 0,05 – 0,10 | 1138 | 89.8 % | 910 | 87.1 % |
| 0,10 – 0,20 | 1244 | 98.1 % | 1220 | 94.3 % |
| 0,20 – 0,35 | 328 | 99.7 % | 598 | 97.3 % |
| 0,35 et plus | 1 | 100 % | 192 | 94.8 % |

## Cible 2 — les fins de combats collent (§3.2)

Référence moteur : la distribution réelle des combats du pool roster (mêmes combats que la
cible 1). Côté monde dérivé : la somme des fins des traces pro. L'arrêt médical (stoppage par
coupure) compte dans le KO ; les nuls, rarissimes, sont comptés à part et exclus des parts.
Verdict : chaque part du monde dérivé à ±0,04 de la part mesurée du moteur.

| Famille | Moteur (n=3995) | Monde dérivé pro (n=89784) | Δ | Monde dérivé tout (n=163286) |
|---|---|---|---|---|
| KO (et arrêt médical) | 49.6 % | 52.1 % | 0.025 | 52.1 % |
| Soumission | 21 % | 21.6 % | 0.006 | 21.8 % |
| Décision | 29.5 % | 26.4 % | -0.031 | 26.1 % |
| Nuls (hors part, information) | 5 | 0 (la trace n'en dérive pas) | — | 0 |

Fins amateur du monde dérivé (information — la phase amateur est close avant l'entrée dans
le monde, ses combats ne passent pas par le moteur) : KO 52.2 %, soumission 22.1 %, décision 25.7 % (n=73502).

## Verdicts

| Cible (§3) | Critère | Mesuré | Verdict |
|---|---|---|---|
| 1. Le bilan prédit le résultat | r extérieur dans [0,7 × ; 1,3 ×] r roster, même signe | r_roster 0.722, r_ext 0.638 | ATTEINTE |
| 2. Les fins de combats collent | chaque part à ±0,04 du moteur | Δ KO 0.025, Δ soumission 0.006, Δ décision -0.031 | ATTEINTE |

Aucune cible interprétée à la main : les critères sont posés avant la mesure, la mesure
décide. Un écart mesuré est un défaut de la tranche : la dérivation se corrige, jamais la
cible (décision d'auteur, LOT-2B §3).

Reproductibilité : un même `--seed`/`--n` redonne exactement ces valeurs, en --serial comme
en parallèle (les pools repartent des graines de lots 20260921+100000+lot*97 et
20260921+300000+lot*97 ; chaque combat i démarre sous 20260921+1000000+i (roster) ou
20260921+2000000+i (extérieur)).
