# Calibrage Monte Carlo — le corps et la soirée (lot 3a §8)

Outil : `tools/monte-carlo-soiree.js` — jeu réel (jsdom), moteur réel `simulateFight`,
conséquences réelles `mgmtApplyFight`. Aucune constante modifiée : mesure seule.

- Graine de base : `20260917`
- Combats par catégorie : 20000 (12 catégories — 240000 combats au total)
- Combats par scénario et par catégorie : 5000 (60000 par scénario au total)
- Combattants générés comme le roster de Split : 892 (traumatisme dérivé sur les ids d'origine)
- Paires identité (cible 1) : 480 paires, toutes catégories

## Définitions mesurées

| Scénario | Définition |
|---|---|
| sain | deux corps à traumatisme 0, même niveau (même bilan) — taux de défaite par KO du corps A |
| léger | deux corps de traumatisme dérivé < 30 — fin de carrière du corps A, par combat joué par ce corps |
| usé | deux corps de traumatisme dérivé ≥ 60 — fin de carrière du corps A (cible 4) ; suspension ≥ 90 j ou fin de carrière du corps A (cible 3) |
| usé-vs-sain | corps usé ≥ 60 (traumatisme dérivé) contre corps sain à 0 de même niveau — taux de défaite par KO du corps usé |

Un corps mesuré démarre sous 100 : toute fin de carrière est atteinte pendant le combat,
jamais héritée d'un état déjà à 100. La suspension ≥ 90 j se lit sur `t.days` renvoyé par
`mgmtApplyFight` : 90 j (fracture) ou 180 j (commotion, déchirure), ou la fin de carrière.

## Résultats par catégorie

| Catégorie | Id | Sain (n) | Fin carrière < 30 | Susp ≥ 90 j ou fin ≥ 60 | Fin carrière ≥ 60 | KO subi, corps usé | KO subi, corps sain | Ratio usé/sain |
|---|---|---|---|---|---|---|---|---|
| Poids mouche | H-fly | 5000 | 0 % | 19.42 % | 7.46 % | 19.46 % | 8.42 % | 2.311 |
| Poids coq | H-bantam | 5000 | 0 % | 22.26 % | 10.94 % | 21.28 % | 11 % | 1.935 |
| Poids plume | H-feather | 5000 | 0 % | 23.98 % | 12.18 % | 21.2 % | 12.94 % | 1.638 |
| Poids léger | H-light | 5000 | 0 % | 24.24 % | 12.54 % | 20.2 % | 10.82 % | 1.867 |
| Poids mi-moyen | H-welter | 5000 | 0 % | 21.68 % | 8.84 % | 27.1 % | 14.56 % | 1.861 |
| Poids moyen | H-middle | 5000 | 0 % | 18.44 % | 6.92 % | 26.72 % | 13.36 % | 2 |
| Poids mi-lourd | H-lheavy | 5000 | 0 % | 21.62 % | 9.62 % | 28.6 % | 16.84 % | 1.698 |
| Poids lourd | H-heavy | 5000 | 0 % | 20.02 % | 8.36 % | 34.66 % | 16.52 % | 2.098 |
| Poids paille | F-straw | 5000 | 0 % | 20.64 % | 9.2 % | 19.12 % | 10.36 % | 1.846 |
| Poids mouche | F-fly | 5000 | 0 % | 24.78 % | 13.5 % | 26.08 % | 12.44 % | 2.096 |
| Poids coq | F-bantam | 5000 | 0 % | 20.54 % | 8.38 % | 26.8 % | 14.6 % | 1.836 |
| Poids plume | F-feather | 5000 | 0 % | 27.3 % | 16.62 % | 29.14 % | 15.8 % | 1.844 |
| **Toutes catégories** | | 60000 sain, 60000 léger, 60000 usé, 60000 usé-vs-sain | **0 %** | **22.08 %** | **10.38 %** | **25.03 %** | **13.14 %** | **1.905×** |

## Roster initial au-dessus du seuil (MGMT_BODY_THRESHOLD = 60)

| Mesure | Valeur |
|---|---|
| combattants générés | 892 |
| traumatisme > 60 | 13.57 % |
| traumatisme ≥ 60 | 14.46 % |

## Cibles §8 — mesuré contre cible

| Mesure §8 | Cible | Mesuré | Verdict |
|---|---|---|---|
| 1. Deux corps à traumatisme 0 — identiques au moteur nu, même graine | identique au moteur nu, même graine | 0 écart(s) sur 480 paires | ATTEINTE |
| 2. Fin de carrière sur un combat, corps < 30 | < 0,5 % | 0 % | ATTEINTE |
| 3. Suspension ≥ 90 j ou fin de carrière, corps ≥ 60 | 20 à 30 % | 22.08 % | ATTEINTE |
| 4. Fin de carrière sur un combat, corps ≥ 60 | 8 à 12 % | 10.38 % | ATTEINTE |
| 5. Défaite par KO, corps ≥ 60 contre corps sain de même niveau | au moins 1,5 × le taux sain | 1.905 × | ATTEINTE |
| 6. Roster initial au-dessus du seuil | 10 à 15 % | 13.57 % (> 60) | ATTEINTE |

Aucune cible manquée.

Reproductibilité : un même `--seed`/`--n` redonne exactement ces valeurs. Les pools sont
générés sous `setSeed(base + 100000 + lot*97)` ; chaque combat i de la catégorie d'index
di démarre sous `setSeed(base + (1..4)*1000009*di + i)` selon son scénario.
