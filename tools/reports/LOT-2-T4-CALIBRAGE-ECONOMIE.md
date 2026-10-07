# Calibrage Monte Carlo — l’argent sur le déroulé réel (lot 2 T4, reprise du 21/09)

Outil : `tools/monte-carlo-economie.js` — jeu réel (jsdom), VRAI déroulé : le joueur-type
compose sa carte principale par le geste du jeu (`mgmtBookMain`), Leïla propose les
préliminaires (`mgmtNewBulkAffair`), la soirée se joue par `mgmtRunEvent` — attrait et
cachets lus sur les lignes d’avant combat, conséquences réelles (`mgmtApplyFight`).
Reprise demandée par la relecture du 21/09 (docs/LOT-2-CARTE-PRINCIPALE.md §4 bis) :
la T4 livrée (933ce41) calibrait sur un joueur qui voit ce que l’écran lui cache.

- Graine de base : `20260919`
- Carrières demandées par profil : 4000 (paquets contigus, au plus 12 processus)
- Soirées enchaînées par carrière : 6 (--soirees — à 1 : chaque soirée repart d’une organisation neuve)
- Premières soirées jouées (la table des résultats) : oracle 4000, joueur d’écran 4000, réduite 4000, bâclée 4000
- Carrières interrompues par une soirée non composable (pot épuisé, la carrière s’arrête) : oracle 19, joueur d’écran 26, bâclée 21
- Référence D4 d’avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : 7231 écrans

## Heuristiques des joueurs-types (documentées, aucun tirage caché)

**Seul le joueur d’écran sert les cibles.** L’oracle est une borne haute qui ne sert à
aucune cible : il montre uniquement l’écart entre un joueur ordinaire et un joueur
parfait. Le joueur bâclé est la borne basse du déroulé réel (le coût de l’écrasement).

| Profil | Carte principale | Préliminaires |
|---|---|---|
| **joueur d’écran** (sert les cibles) | il ne voit et n’utilise que ce que l’écran affiche — catégorie (f.div), rang dans la catégorie (mgmtDivisionRank) et bilan ; à chaque place libre, le combattant disponible le mieux classé de sa catégorie (plus petit rang dans la sienne, à égalité le premier dans l’ordre de la liste mgmtCartRows), apparié au disponible de la même catégorie au rang le plus proche ; refus de `mgmtBookMain` : essai du candidat suivant, puis du combattant suivant — jamais d’abandon ; la règle n’appelle jamais mgmtFightDraw, mgmtStar, mgmtPurse, mgmtCardAttraction ni mgmtEventRecette | la vraie proposition de Leïla (`mgmtNewBulkAffair`), validée sans écrasement |
| oracle (borne haute — aucune cible) | la meilleure paire disjointe de même catégorie disponible, par attrait décroissant (`mgmtFightDraw`) — il maximise la grandeur que l’écran ne montre pas | idem joueur d’écran |
| bâclé | cinq paires tirées au hasard seedé parmi les paires de même catégorie bâclées au sens du jeu (écart de bilan ≥ 8 combats, ou écart de rang > 3) ; complétées au hasard à défaut | cinq propositions de Leïla ÉCRASÉES, la sixième validée (coût de l’écrasement, addendum §12) |
| réduite | — | la carte du joueur d’écran moins son prélim d’attrait le plus faible (QO-7) — **hors déroulé réel**, voir plus bas |

## Résultats (graine de base 20260919, 6 soirées par organisation)

Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets).
Les cibles se jugent sur la ligne du joueur d’écran, jamais sur l’oracle. À --soirees=6, la première soirée de chaque carrière repart d’une organisation neuve : cette table est la soirée 1, exactement la mesure de --soirees=1 (mêmes graines de première soirée).

| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| oracle (borne haute — ne sert à aucune cible) | 4000 | 17.6 | 5.8 | 8 | 17 | 27 | 99.8 | 121.7 | 104.1 | 9.81 | 0.67 | 8838.4 | 805.3 | — |
| joueur d’écran (sert les cibles) | 4000 | 5.3 | 6.2 | -5 | 5 | 16 | 77.4 | 98.8 | 93.5 | 7.93 | 0.705 | 7223.5 | 862.2 | — |
| réduite (8, prélim faible retiré du joueur d’écran) | 4000 | 1.5 | 5.6 | -8 | 1 | 11 | 55.7 | 91 | 89.5 | 7.68 | 0.702 | 6989.1 | 858.8 | 38 % |
| bâclée (5+4 écrasée, déroulé réel) | 4000 | -4.8 | 5.4 | -13 | -5 | 5 | 16.1 | 79.4 | 84.2 | 6.35 | 0.728 | 5827.8 | 765.7 | — |

Gradient de lecture (contrainte de forme) : oracle (17.6 k$) > joueur d’écran (5.3 k$) > bâclé (-4.8 k$) — l’ordre tient sur R moyen et sur les % rentables.

Part de combats de préliminaires bâclés dans les propositions validées : 37.4 %
(joueur d’écran et oracle : attendue quasi nulle — Leïla est soigneuse sans écrasement ;
bâclée : au plafond du jeu, 0,65).

## Cibles du lot 3b T1 — mesurées avant et après

| Cible (lot 3b T1) | Avant | Après (joueur d’écran) | Verdict |
|---|---|---|---|
| 1. Le joueur d’écran (carte complète moyenne) est rentable dans 70 à 80 % des soirées | 10.3 % (joueur d’écran, avant recalibrage — sonde du 21/09 : 9.5 %) | 77.4 % (joueur d’écran) | ATTEINTE |
| 2. Le joueur bâclé perd de l'argent plus souvent qu'il n'en gagne | 0.3 % de rentables (T4 livrée — profil inchangé) | 16.1 % (bâclé) | ATTEINTE |
| 3. La carte réduite (du joueur d'écran) garde son audience de référence dans une part mesurable des cas | 1.8 % (réduite du joueur d’écran, avant recalibrage, réf de l’ancien déroulé) | 38 % (réduite, réf 7231 écrans) | ATTEINTE |

## Pourquoi la T4 livrée était fausse, et ce que cette reprise corrige

La T4 livrée (933ce41) mesurait un joueur qui choisissait par `mgmtFightDraw`
décroissant — la grandeur qui produit la billetterie et les droits du diffuseur,
invisible à l’écran (§T2 : catégorie, rang, bilan — rien d’autre). Un joueur qui
voit ce que le jeu lui cache, pas un joueur. Le joueur d’écran, lui, ne dispose que
de la catégorie, du rang et du bilan : avant recalibrage, R moyen -6.6 k$
(médiane -7) pour 10.3 % de rentables — **R = −6 k$ est l’ordre de
grandeur NORMAL d’un joueur qui ne dispose que de l’écran** : la sonde du 21/09 le
mesurait à -6.5 k$ (9.5 % de rentables, soirées abandonnées au premier
refus), l’outil le mesure à -6.6 k$ (10.3 % de rentables, la règle du réessai
composant toutes les soirées). C’était la médiane de sa distribution, pas « un tirage
sous le 5e centile » comme l’expliquait à tort le rapport de la T4 livrée. C’est ce
que le recalibrage corrige : la soirée réelle jouée en jeu le 20/09 (R = −6,
trésorerie 50 → 44) n’était pas malchanceuse, elle était représentative. L’écart
oracle − joueur d’écran (12.3 k$ de R moyen) est le prix du joueur
parfait : un joueur qui choisit exactement ce que le jeu vend.

## Ce qui reste hors déroulé réel (le profil réduite)

La réduite (QO-7 : la carte moins son prélim d’attrait le plus faible) n’est PAS
jouée par `mgmtRunEvent` : le jeu refuse une carte incomplète (la carte contractuelle
est de 9 combats, 5 + 4). Elle se mesure sur les clones d’avant combat (`mgmtFightReady`),
avec la vraie finance (`mgmtEventRecette`, droits au prorata 8/9 des combats joués) —
l’attrait et les cachets sont ceux de la carte du joueur d’écran avant la soirée,
le spectacle vient des huit combats rejoués sous une graine du même run. Elle est un
proxy assumé, mesuré comme tel : c’est la lecture de la cible 3, pas une soirée que
le jeu peut produire.

Aucune cible manquée.

## Soirées enchaînées — l’organisation qui vieillit (--soirees=6)

K soirées enchaînées sur la MÊME organisation (mgmtNewPile entre chaque ; le bilan et
la notoriété des combattants évoluent, le corps s’use, Leïla respecte le repos).
Chaque ligne est l’index de la soirée dans la carrière de l’organisation.
« Disponibles » : les lignes que la liste de composition laisse choisir au moment
de composer (mesuré sur la carrière du joueur d’écran) ; « suspensions » : les
combattants sous suspension médicale à ce moment.

| Soirée | Profil | n | R moyen | R méd | R p5 | R p95 | % rentables | Audience | Disponibles | Suspensions |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | oracle | 4000 | 17.6 | 17 | 8 | 27 | 99.8 | 8838.4 | — | — |
| 2 | oracle | 4000 | 10.5 | 10 | 1 | 20 | 96.3 | 7966.4 | — | — |
| 3 | oracle | 4000 | 5.3 | 5 | -4 | 15 | 79 | 7332.4 | — | — |
| 4 | oracle | 3998 | 5.6 | 6 | -5 | 16 | 78.9 | 7403.3 | — | — |
| 5 | oracle | 3993 | 4.3 | 4 | -7 | 15 | 72.5 | 7281.4 | — | — |
| 6 | oracle | 3981 | 1.3 | 2 | -10 | 12 | 56.4 | 6954.6 | — | — |
| 1 | joueur d’écran | 4000 | 5.3 | 5 | -5 | 16 | 77.4 | 7223.5 | 48.6 | 0 |
| 2 | joueur d’écran | 4000 | 1.6 | 1 | -8 | 12 | 56.5 | 6922.4 | 41.6 | 6.9 |
| 3 | joueur d’écran | 4000 | 0.3 | 0 | -10 | 11 | 47.3 | 6856.6 | 34.6 | 13.9 |
| 4 | joueur d’écran | 3996 | -1.5 | -2 | -12 | 10 | 37.3 | 6708.4 | 27.9 | 20.6 |
| 5 | joueur d’écran | 3989 | -2.6 | -3 | -13 | 9 | 31 | 6615.1 | 25.1 | 23.3 |
| 6 | joueur d’écran | 3971 | -3.7 | -4 | -14 | 8 | 25.5 | 6517.9 | 23.5 | 24.8 |
| 1 | réduite | 4000 | 1.5 | 1 | -8 | 11 | 55.7 | 6989.1 | — | — |
| 2 | réduite | 4000 | -1.9 | -2 | -11 | 8 | 33.5 | 6716.1 | — | — |
| 3 | réduite | 4000 | -3.2 | -3 | -13 | 7 | 26.6 | 6650.6 | — | — |
| 4 | réduite | 3996 | -4.7 | -5 | -14 | 6 | 18.7 | 6519.6 | — | — |
| 5 | réduite | 3989 | -5.9 | -6 | -16 | 5 | 14.4 | 6426.8 | — | — |
| 6 | réduite | 3971 | -6.8 | -7 | -17 | 4 | 11.9 | 6356.8 | — | — |
| 1 | bâclée | 4000 | -4.8 | -5 | -13 | 5 | 16.1 | 5827.8 | — | — |
| 2 | bâclée | 4000 | -4.2 | -4 | -13 | 5 | 19.9 | 5984.4 | — | — |
| 3 | bâclée | 4000 | -3.4 | -4 | -13 | 7 | 25.2 | 6158.6 | — | — |
| 4 | bâclée | 4000 | -4.7 | -5 | -14 | 6 | 19.7 | 6028.8 | — | — |
| 5 | bâclée | 3996 | -5.9 | -6 | -16 | 5 | 16.2 | 5913.5 | — | — |
| 6 | bâclée | 3979 | -6.2 | -6 | -17 | 5 | 16 | 5939.4 | — | — |

**Information de design : l’hypothèse inverse est mesurée.** Le joueur d’écran est
rentable à la première soirée (R moyen 5.3 k$, 77.4 % de rentables) et
il SE DÉGRADE d’une soirée à l’autre : R moyen -3.7 k$ à la sixième
(25.5 % de rentables),
audience 7223.5 → 6517.9 écrans, vivier 48.6 → 23.5 disponibles,
suspensions en cours 0 → 24.8, et des soirées qui ne se
composent plus (4000 → 3971 carrières complètes).
L’hypothèse « l’organisation vieillissante s’enrichit quand ses noms montent » n’est
PAS vérifiée à K=6 : la notoriété monte, mais le corps s’use et les
suspensions retirent les meilleurs noms de la rotation, plus vite que les noms ne
montent. C’est une information de design, pas un détail — la jeunesse de
l’organisation est son âge d’or, et le déclin des cartes suit l’usure du vivier.

## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-bureau.js)

Les cibles du lot 3b T1 sont des décisions d’auteur — jamais touchées. Ce sont les
poids d’argent qui ont bougé, pour porter le joueur d’écran (le seul qui sert les
cibles) dans la bande 70-80 %. Effets mesurés : comparaison des essais --n=600
(avant recalibrage : -6.6 k$ / 10.3 % ; après : 5.3 k$ / 77.4 %).

| Constante | Ancienne | Nouvelle | Effet mesuré |
|---|---|---|---|
| `MGMT_PURSE_PER_STAR` | 4 | 3.35 | cachet par point de nom — LE levier de cette reprise : le joueur d’écran book les mieux classés, donc les bilans les plus lourds et les mieux payés ; cachets du joueur d’écran 104.7 → 93.2 k$ (essais --n=600), R moyen -6.6 → 5.3 k$, rentables 10.3 % → 77.4 % — l’écart de cachets entre un rang 1 et un reste-de-liste subsiste (prime au nom conservée) |
| `MGMT_TICKET_PER_DRAW` | 7 | 7 | INCHANGÉ — billetterie (k$) par point d’attrait |
| `MGMT_TV_PER_AUD` | 6 | 6 | INCHANGÉ — droits du diffuseur (k$) pour 1000 écrans |
| `MGMT_PURSE_BASE` | 1 | 1 | INCHANGÉ — cachet plancher |
| `MGMT_PURSE_PRELIM_W` | 1 | 1 | INCHANGÉ — poids du cachet en prélim |
| `MGMT_PURSE_MAIN_W` | 2.5 | 2.5 | INCHANGÉ — poids du cachet en carte principale |
| `MGMT_ATTR_PRELIM_W` | 1 | 1 | INCHANGÉ — poids d’attrait d’un prélim |
| `MGMT_ATTR_MAIN_W` | 2.5 | 2.5 | INCHANGÉ — poids d’attrait d’un combat de carte principale |
| `MGMT_ATTR_GAP` | 0.6 | 0.6 | INCHANGÉ — morsure de l’écart de nom sur l’attrait (baisser aurait aidé le bâclé plus que le joueur d’écran : ordre du gradient menacé) |
| `MGMT_AUD_BASE` | 0.7 | 0.7 | INCHANGÉ — part d’audience acquise avant la soirée |
| `MGMT_AUD_PER_DRAW` | 1000 | 1000 | INCHANGÉ — écrans par point d’attrait × mix de spectacle |
| `MGMT_DRAW_AVG` | 0.59 | 0.48 | MESURE reposée sur le joueur d’écran — attrait moyen mesuré d’un combat : 0.481 ; mgmtAudienceRef sans historique (7231 écrans) reste l’audience moyenne du joueur d’écran (écart mesuré < 1 %, QO-7) |
| `MGMT_SPECTACLE_REF` | 0.67 | 0.71 | MESURE reposée sur le joueur d’écran — part de finitions mesurée : 0.705 |
| `MGMT_TREASURY_START` | 50 | 50 | INCHANGÉ — décision QO-5 |
| `MGMT_TV_ECRANS` | 1000 | 1000 | INCHANGÉ — définition, pas un réglage |
| `MGMT_CARD_CONTRACT` | 9 | 9 | INCHANGÉ — la carte complète du lot 2 (5 + 4), définition |

Reproductibilité : un même `--seed`/`--n`/`--soirees` redonne exactement ces valeurs. Chaque
carrière r démarre sous `setSeed(base + r)` (oracle), `setSeed(base + 1000000 + r)` (joueur
d’écran et sa réduite) et `setSeed(base + 2000000 + r)` (bâclé).
Parallélisme : les paquets contigus de carrières sont indépendants (graine propre à chaque
carrière) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.
