# Calibrage Monte Carlo — l’argent sur le déroulé réel (lot 2 T4)

Outil : `tools/monte-carlo-economie.js` — jeu réel (jsdom), VRAI déroulé : le joueur-type
compose sa carte principale par le geste du jeu (`mgmtBookMain`), Leïla propose les
préliminaires (`mgmtNewBulkAffair`), la soirée se joue par `mgmtRunEvent` — attrait et
cachets lus sur les lignes d’avant combat, conséquences réelles (`mgmtApplyFight`).
Remplace le profil « 8 meilleures paires possibles » du lot 3b T1 (carte 4 + 4).

- Graine de base : `20260919`
- Soirées demandées par profil : 4000 (paquets contigus, au plus 12 processus)
- Soirées jouées : propre 4000, réduite 4000, bâclée 4000 — non jouables (pot épuisé : 0)
- Référence D4 d’avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : 8771 écrans

## Heuristiques des joueurs-types (documentées, aucun tirage caché)

| Profil | Carte principale | Préliminaires |
|---|---|---|
| propre | cinq meilleures paires disjointes de même catégorie disponibles, par attrait décroissant (mgmtFightDraw), posées par `mgmtBookMain` | la vraie proposition de Leïla (`mgmtNewBulkAffair`), validée sans écrasement |
| bâclé | cinq paires tirées au hasard seedé parmi les paires de même catégorie bâclées au sens du jeu (écart de bilan ≥ 8 combats, ou écart de rang > 3) ; complétées au hasard à défaut | cinq propositions de Leïla ÉCRASÉES, la sixième validée (coût de l’écrasement, addendum §12) |
| réduite | — | la carte propre moins son prélim d’attrait le plus faible (QO-7), mesurée sur les clones d’avant combat |

## Résultats (graine de base 20260919)

Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets).

| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| propre (5+4, déroulé réel) | 4000 | 3.8 | 5.2 | -5 | 4 | 12 | 74.6 | 121.7 | 117.9 | 9.81 | 0.67 | 8838.4 | 805.3 | — |
| réduite (8, prélim faible retiré) | 4000 | -0.5 | 4.7 | -8 | 0 | 7 | 41.4 | 113 | 113.5 | 9.58 | 0.669 | 8623.9 | 800.4 | 43 % |
| bâclée (5+4 écrasée, déroulé réel) | 4000 | -14.4 | 4.8 | -22 | -15 | -6 | 0.3 | 79.6 | 94 | 6.37 | 0.722 | 5837.8 | 759.9 | — |

Part de combats de préliminaires bâclés dans les propositions validées : 32.3 %
(propre : attendue quasi nulle — Leïla est soigneuse sans écrasement ; bâclée : au plafond du jeu).

## Cibles du lot 3b T1 — mesurées avant et après

| Cible (lot 3b T1) | Avant (outil lot 3b, 4 + 4) | Après (déroulé réel) | Verdict |
|---|---|---|---|
| 1. Une carte complète moyenne est rentable dans 70 à 80 % des soirées | 73.1 % (déroulé synthétique 4 + 4) | 74.6 % (propre, déroulé réel) | ATTEINTE |
| 2. Une carte d'appariements médiocres perd de l'argent plus souvent qu'elle n'en gagne | 0.6 % de rentables (bâclée) | 0.3 % (bâclée) | ATTEINTE |
| 3. Une carte réduite d'un combat faible garde son audience de référence dans une part mesurable des cas | 31.2 % (réduite) | 43 % (réduite, réf 8771 écrans) | ATTEINTE |

## Pourquoi le déroulé réel est meilleur que la mesure du lot 3b T1

La relecture du lot 3b T1 prévoyait une économie perdante (une soirée réelle mesurée à
R = −6 k$ : trésorerie 50 → 44). Ce pessimisme venait du déroulé synthétique 4 + 4 :
il joue 8 combats contre une carte contractuelle passée à 9 (lot 2 T1) — les droits du
diffuseur au prorata 8/9, ≈ −5 k$ — et un attrait de carte à 14 au lieu de 16.5 (cinq
places de carte principale à leur poids, quatre préliminaires). Sur le VRAI déroulé :
cinq combats de carte principale (poids d’attrait 2.5, prorata complet 9/9 des droits)
et la vraie proposition de Leïla — des préliminaires à cachets proches du plancher —
les poids d’argent atteignent les trois cibles sans être touchés. La soirée mesurée à
R = −6 est un tirage sous le 5e centile (p5 = -5 k$) : une soirée malchanceuse,
pas la moyenne — 74.6 % des soirées réelles non écrasées sont rentables (R moyen
+3.8 k$).

Aucune cible manquée.

## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-bureau.js)

Les poids d’argent du lot 3b T1 sont inchangés : les trois cibles sont atteintes
sur le déroulé réel sans les toucher. Seules les références D4 (mesures, jamais des
cibles) suivent le déroulé réel — mgmtAudienceRef sans historique doit rester
l’audience moyenne d’une carte complète (écart mesuré < 1 %, QO-7).

| Constante | Ancienne (lot 3b T1) | Nouvelle (lot 2 T4) | Effet mesuré |
|---|---|---|---|
| `MGMT_DRAW_AVG` | 0.62 | 0.59 | attrait moyen mesuré d’un combat (carte propre, réel) : 0.595 — la référence D4 sans historique repasse à moins de 1 % de l’audience moyenne mesurée |
| `MGMT_SPECTACLE_REF` | 0.64 | 0.67 | part de finitions mesurée (carte propre, réel) : 0.67 |

Toutes les autres constantes du lot 3b T1 (§4 du rapport d’origine) sont inchangées :

| Constante | Valeur |
|---|---|
| `MGMT_TREASURY_START` | 50 |
| `MGMT_STAR_FIGHTS` | 8 |
| `MGMT_STAR_W_RATIO` | 0.35 |
| `MGMT_STAR_W_LVL` | 0.65 |
| `MGMT_PURSE_BASE` | 1 |
| `MGMT_PURSE_PER_STAR` | 4 |
| `MGMT_PURSE_PRELIM_W` | 1 |
| `MGMT_PURSE_MAIN_W` | 2.5 |
| `MGMT_ATTR_PRELIM_W` | 1 |
| `MGMT_ATTR_MAIN_W` | 2.5 |
| `MGMT_ATTR_GAP` | 0.6 |
| `MGMT_TICKET_PER_DRAW` | 7 |
| `MGMT_AUD_BASE` | 0.7 |
| `MGMT_AUD_PER_DRAW` | 1000 |
| `MGMT_TV_PER_AUD` | 6 |
| `MGMT_TV_ECRANS` | 1000 |
| `MGMT_CARD_CONTRACT` | 9 |

Reproductibilité : un même `--seed`/`--cards` redonne exactement ces valeurs. Chaque soirée i
démarre sous `setSeed(base + i)` (propre et sa réduite) et `setSeed(base + 1000000 + i)` (bâclée).
Parallélisme : les paquets contigus de soirées sont indépendants (graine propre à chaque
soirée) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.
