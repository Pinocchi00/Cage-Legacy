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
| Poids mouche | H-fly | 8.42 % | 0 % | 24.06 % | 15.9 % | 19.98 % | 2.373 |
| Poids coq | H-bantam | 11 % | 0 % | 25.12 % | 17.32 % | 21.54 % | 1.958 |
| Poids plume | H-feather | 12.94 % | 0 % | 25.9 % | 17.02 % | 23 % | 1.777 |
| Poids léger | H-light | 10.82 % | 0 % | 28.96 % | 21.14 % | 20.56 % | 1.9 |
| Poids mi-moyen | H-welter | 14.56 % | 0 % | 23 % | 14.2 % | 25.98 % | 1.784 |
| Poids moyen | H-middle | 13.36 % | 0 % | 19.4 % | 10.7 % | 26.02 % | 1.948 |
| Poids mi-lourd | H-lheavy | 16.84 % | 0 % | 23.64 % | 16.56 % | 27.9 % | 1.657 |
| Poids lourd | H-heavy | 16.52 % | 0 % | 22.1 % | 12.7 % | 36.06 % | 2.183 |
| Poids paille | F-straw | 10.36 % | 0 % | 29.32 % | 22.34 % | 19.52 % | 1.884 |
| Poids mouche | F-fly | 12.44 % | 0 % | 33.76 % | 26.56 % | 26.56 % | 2.135 |
| Poids coq | F-bantam | 14.6 % | 0 % | 21.24 % | 12.34 % | 27.24 % | 1.866 |
| Poids plume | F-feather | 15.8 % | 0 % | 37.18 % | 30.98 % | 29.74 % | 1.882 |
| **Toutes catégories** | 60000 sain, 60000 léger, 60000 usé, 60000 usé-vs-sain | **0 %** | **26.14 %** | **18.15 %** | **25.34 %** | **13.14 %** | **1.929×** |

## Roster initial au-dessus du seuil (MGMT_BODY_THRESHOLD = 60)

| Mesure | Valeur |
|---|---|
| combattants générés | 892 |
| traumatisme > 60 | 15.25 % |
| traumatisme ≥ 60 | 15.25 % |

## Cibles §8 — mesuré contre cible

| Mesure §8 | Cible | Mesuré | Verdict |
|---|---|---|---|
| 1. Deux corps à traumatisme 0 — identiques au moteur nu, même graine | identique au moteur nu, même graine | 0 écart(s) sur 480 paires | ATTEINTE |
| 2. Fin de carrière sur un combat, corps < 30 | < 0,5 % | 0 % | ATTEINTE |
| 3. Suspension ≥ 90 j ou fin de carrière, corps ≥ 60 | 20 à 30 % | 26.14 % | ATTEINTE |
| 4. Fin de carrière sur un combat, corps ≥ 60 | 8 à 12 % | 18.15 % | MANQUÉE |
| 5. Défaite par KO, corps ≥ 60 contre corps sain de même niveau | au moins 1,5 × le taux sain | 1.929 × | ATTEINTE |
| 6. Roster initial au-dessus du seuil | 10 à 15 % | 15.25 % (> 60) | MANQUÉE |

## Cibles manquées — signalées, aucune constante modifiée

- **18.15 % mesuré contre « 8 à 12 % »** (4. Fin de carrière sur un combat, corps ≥ 60).
- **15.25 % (> 60) mesuré contre « 10 à 15 % »** (6. Roster initial au-dessus du seuil).

Reproductibilité : un même `--seed`/`--n` redonne exactement ces valeurs. Les pools sont
générés sous `setSeed(base + 100000 + lot*97)` ; chaque combat i de la catégorie d'index
di démarre sous `setSeed(base + (1..4)*1000009*di + i)` selon son scénario.
