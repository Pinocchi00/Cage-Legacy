# Mesure Monte Carlo — le monde extérieur dérivé (lot 2B T1)

Outil : `tools/monte-carlo-monde-exterieur.js` — jeu réel (jsdom), moteur réel `simulateFight`,
passerelle réelle du jeu (`mgmtCombatProfile`), traces dérivées réelles (`mgmtExteriorTrace`).
Aucune constante modifiée : mesure seule.

- Graine de base : `20260921`
- Combats mesurés par pool : 4000 (paires de même catégorie, chaque combat sous sa propre graine)
- Pool « roster » : 1718 lignes de `mgmtNewRoster` en 35 lots — LA référence (bilans générés par `correlatedRecord`)
- Pool « extérieur » : 2625 lignes du vivier dérivé (cohorte initiale + 30 cycles d'entrants), traces lues au cycle 30 — âge moyen 27.475 ans
- Combattants par catégorie (min sur les 12) : roster 133, extérieur 62

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
| roster (correlatedRecord, référence) | 4000 | 0.727 | 5 | 0 |
| extérieur (monde dérivé) | 4000 | 0.628 | 6 | 0 |

Taux de victoire du favori du bilan (celui au meilleur ratio), par écart de bilan :

| Écart de bilan | n roster | favori roster | n extérieur | favori extérieur |
|---|---|---|---|---|
| 0 – 0,05 | 1272 | 69.4 % | 1292 | 61.5 % |
| 0,05 – 0,10 | 1138 | 90.3 % | 482 | 78.8 % |
| 0,10 – 0,20 | 1251 | 97.9 % | 884 | 91.6 % |
| 0,20 – 0,35 | 336 | 99.7 % | 843 | 94.7 % |
| 0,35 et plus | 3 | 100 % | 499 | 96.8 % |

## Cible 2 — les fins de combats collent (§3.2)

Référence moteur : la distribution réelle des combats du pool roster (mêmes combats que la
cible 1). Côté monde dérivé : la somme des fins des traces pro. L'arrêt médical (stoppage par
coupure) compte dans le KO ; les nuls, rarissimes, sont comptés à part et exclus des parts.
Verdict : chaque part du monde dérivé à ±0,04 de la part mesurée du moteur.

| Famille | Moteur (n=3995) | Monde dérivé pro (n=38147) | Δ | Monde dérivé tout (n=70777) |
|---|---|---|---|---|
| KO (et arrêt médical) | 48.8 % | 50.9 % | 0.021 | 51.1 % |
| Soumission | 21.2 % | 21 % | -0.002 | 21.7 % |
| Décision | 30.1 % | 28.1 % | -0.019 | 27.2 % |
| Nuls (hors part, information) | 5 | 0 (la trace n'en dérive pas) | — | 0 |

Fins amateur du monde dérivé (information — la phase amateur est close avant l'entrée dans
le monde, ses combats ne passent pas par le moteur) : KO 51.3 %, soumission 22.6 %, décision 26.1 % (n=32630).

## Verdicts

| Cible (§3) | Critère | Mesuré | Verdict |
|---|---|---|---|
| 1. Le bilan prédit le résultat | r extérieur dans [0,7 × ; 1,3 ×] r roster, même signe | r_roster 0.727, r_ext 0.628 | ATTEINTE |
| 2. Les fins de combats collent | chaque part à ±0,04 du moteur | Δ KO 0.021, Δ soumission -0.002, Δ décision -0.019 | ATTEINTE |

Aucune cible interprétée à la main : les critères sont posés avant la mesure, la mesure
décide. Un écart mesuré est un défaut de la tranche : la dérivation se corrige, jamais la
cible (décision d'auteur, LOT-2B §3).

## Calibrage effectué pendant la tranche

L'outil ne modifie aucune constante ; la dérivation, si, a été corrigée une fois sur preuve
mesurée (essais à --n=600) :

| Constante | Avant | Après | Effet mesuré (n=600) |
|---|---|---|---|
| `MGMT_EXT_FIN_KO` | 0,47 | 0,52 | KO dérivé 45,7 % contre 50,5 % mesurés au moteur (Δ −0,048, hors bande ±0,04) ; après correction, les Δ mesurés à n=4000 sont KO +0,021, soumission −0,002, décision −0,019 — dans la bande. `MGMT_EXT_FIN_SUB` inchangé (0,22) : la soumission collait déjà (Δ −0,009). |

## Reproductibilité

Un même `--seed`/`--n` redonne exactement ces valeurs, en --serial comme
en parallèle (les pools repartent des graines de lots 20260921+100000+lot*97 et
20260921+300000+lot*97 ; chaque combat i démarre sous 20260921+1000000+i (roster) ou
20260921+2000000+i (extérieur)). La répartition des fins du monde dérivé est lue une seule
fois (processus couvrant l'indice 0) : le découpage en processus ne change aucun chiffre.
