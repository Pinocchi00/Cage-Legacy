# Calibrage Monte Carlo — l’argent sur le déroulé réel (lot 2B T4, le salaire à la victoire)

Outil : `tools/monte-carlo-economie.js` — jeu réel (jsdom), VRAI déroulé : le joueur-type
compose sa carte principale par le geste du jeu (`mgmtBookMain`), Leïla propose les
préliminaires (`mgmtNewBulkAffair`), la soirée se joue par `mgmtRunEvent` — attrait et
cachets lus sur les lignes d’avant combat, conséquences réelles (`mgmtApplyFight`).
Lot 2B T4 (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T4, décision 1 du 21/09) : le cachet
reste le salaire de combat et le VAINQUEUR touche un bonus — calculé après les combats,
déduit de la recette. Le modèle d’argent change, donc le calibrage de la T4 du lot 2
(caduc depuis la T1 ter de toute façon) est refait ici. Les cibles se jugent sur la
soirée 1 du joueur d’écran ; la lecture « durée de vie » attend le recrutement (T2) —
sans lui, le roster ne peut que fondre et la table des soirées enchaînées mesure cette
fonte, pas un défaut de calibrage.

- Graine de base : `20260919`
- Carrières demandées par profil : 4000 (paquets contigus, au plus 12 processus)
- Soirées enchaînées par carrière : 1 (--soirees — à 1 : chaque soirée repart d’une organisation neuve)
- Premières soirées jouées (la table des résultats) : oracle 4000, joueur d’écran 4000, réduite 4000, bâclée 4000
- Carrières interrompues par une soirée non composable (pot épuisé, la carrière s’arrête) : oracle 0, joueur d’écran 0, bâclée 0
- Référence D4 d’avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : 8523 écrans

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

## Résultats (graine de base 20260919, 1 soirée par organisation)

Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets
− bonus de victoire).
Les cibles se jugent sur la ligne du joueur d’écran, jamais sur l’oracle.

| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Bonus | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| oracle (borne haute — ne sert à aucune cible) | 4000 | 24 | 6.3 | 14 | 24 | 34 | 100 | 226.2 | 132.9 | 69.2 | 13.45 | 0.539 | 11591.3 | 704.7 | — |
| joueur d’écran (sert les cibles) | 4000 | 11.6 | 8 | -2 | 11 | 25 | 91.7 | 205.5 | 127.2 | 66.8 | 12.2 | 0.551 | 10558.3 | 801.4 | — |
| réduite (8, prélim faible retiré du joueur d’écran) | 4000 | 8.4 | 7.6 | -4 | 8 | 21 | 85.4 | 194.4 | 123.5 | 62.5 | 11.98 | 0.537 | 10313.3 | 795.1 | 99 % |
| bâclée (5+4 écrasée, déroulé réel) | 4000 | -25.8 | 9.2 | -41 | -26 | -11 | 0.3 | 138.8 | 104.8 | 59.8 | 8.23 | 0.563 | 7150.4 | 786.6 | — |

Gradient de lecture (contrainte de forme) : oracle (24 k$) > joueur d’écran (11.6 k$) > bâclé (-25.8 k$) — l’ordre tient sur R moyen et sur les % rentables.

Part de combats de préliminaires bâclés dans les propositions validées : 22.4 %
(joueur d’écran et oracle : attendue quasi nulle — Leïla est soigneuse sans écrasement ;
bâclée : au plafond du jeu, 0,65).

## Cibles du lot 3b T1 — mesurées avant et après

| Cible (lot 3b T1) | Avant | Après (joueur d’écran) | Verdict |
|---|---|---|---|
| 1. Le joueur d’écran (carte complète moyenne) est rentable dans 70 à 80 % des soirées | 0 % (joueur d’écran, bonus de victoire sans remontée des revenus) | 91.7 % (joueur d’écran, soirée 1) | MANQUÉE |
| 2. Le joueur bâclé perd de l'argent plus souvent qu'il n'en gagne | 0 % de rentables (bonus sans remontée des revenus) | 0.3 % (bâclé, soirée 1) | ATTEINTE |
| 3. La carte réduite (du joueur d'écran) garde son audience de référence dans une part mesurable des cas | 38 % (réduite du joueur d’écran, bonus sans remontée des revenus) | 99 % (réduite, réf 8523 écrans) | ATTEINTE |

## Ce que le bonus de victoire change, et ce que le recalibrage corrige

Le bonus de victoire (lot 2B T4) alourdit une soirée d’environ la moitié de sa masse
de cachets : le vainqueur de chacun des neuf combats touche son cachet une seconde
fois (partage show/win du sport réel, `MGMT_WIN_BONUS_SHARE=1`). Avant remontée des
revenus, le joueur d’écran mesurait R moyen -49.4 k$ (médiane -49)
pour 0 % de rentables — la soirée perdait ~50 k$ en moyenne. C’est ce que le
recalibrage corrige : les deux leviers de revenu (billetterie et droits du diffuseur)
suivent le coût, dans leurs proportions d’avant. L’écart oracle − joueur d’écran
(12.4 k$ de R moyen) reste le prix du joueur parfait : un joueur qui choisit
exactement ce que le jeu vend. Le bonus frappe aussi le joueur d’écran plus fort que
le bâclé — ses vainqueurs sont les mieux payés — et c’est voulu : booker les bons
numéros coûte leur salaire.

## Ce qui reste hors déroulé réel (le profil réduite)

La réduite (QO-7 : la carte moins son prélim d’attrait le plus faible) n’est PAS
jouée par `mgmtRunEvent` : le jeu refuse une carte incomplète (la carte contractuelle
est de 9 combats, 5 + 4). Elle se mesure sur les clones d’avant combat (`mgmtFightReady`),
avec la vraie finance (`mgmtEventRecette`, droits au prorata 8/9 des combats joués,
bonus de victoire des huit combats rejoués compris) —
l’attrait et les cachets sont ceux de la carte du joueur d’écran avant la soirée,
le spectacle et les vainqueurs viennent des huit combats rejoués sous une graine du
même run. Elle est un proxy assumé, mesuré comme tel : c’est la lecture de la cible 3,
pas une soirée que le jeu peut produire.

## Cibles manquées — signalées

- **91.7 % (joueur d’écran, soirée 1) mesuré contre « 70 à 80 % »** (1. Le joueur d’écran (carte complète moyenne) est rentable dans 70 à 80 % des soirées).

## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-argent.js)

Les cibles sont des décisions d’auteur — jamais touchées. Ce sont les poids d’argent
qui ont bougé, pour porter le joueur d’écran (le seul qui sert les cibles) dans la
bande 70-80 % malgré le bonus de victoire. Effets mesurés : comparaison des essais
--n=200 --soirees=20 (avant recalibrage : -49.4 k$ / 0 % ; après : 11.6 k$ / 91.7 %, soirée 1).

| Constante | Ancienne | Nouvelle | Effet mesuré |
|---|---|---|---|
| `MGMT_WIN_BONUS_SHARE` | — (nouveau) | 1 | NOUVEAU (lot 2B T4) — part du cachet reversée au vainqueur : 1, la pratique show/win du sport réel ; le vainqueur des neuf combats touche son cachet une seconde fois, le nul ne bonus personne |
| `MGMT_TICKET_PER_DRAW` | 7 | 11.4 | billetterie (k$) par point d’attrait — LE levier de revenu de ce recalibrage : le bonus de victoire alourdit le coût d’une soirée de ~50 k$, la billetterie suit (7 → 11.4) ; R moyen -49.4 → 11.6 k$, rentables 0 % → 91.7 % (soirée 1) |
| `MGMT_TV_PER_AUD` | 6 | 9.2 | droits du diffuseur (k$) pour 1000 écrans — second levier de revenu, monté dans ses proportions avec la billetterie (6 → 9.2) |
| `MGMT_PURSE_PER_STAR` | 3.35 | 3.35 | INCHANGÉ — cachet par point de nom (calibrage T4 du lot 2 : le joueur d’écran book les mieux classés, la prime au nom subsiste) |
| `MGMT_PURSE_BASE` | 1 | 1 | INCHANGÉ — cachet plancher |
| `MGMT_PURSE_PRELIM_W` | 1 | 1 | INCHANGÉ — poids du cachet en prélim |
| `MGMT_PURSE_MAIN_W` | 2.5 | 2.5 | INCHANGÉ — poids du cachet en carte principale |
| `MGMT_ATTR_PRELIM_W` | 1 | 1 | INCHANGÉ — poids d’attrait d’un prélim |
| `MGMT_ATTR_MAIN_W` | 2.5 | 2.5 | INCHANGÉ — poids d’attrait d’un combat de carte principale |
| `MGMT_ATTR_GAP` | 0.6 | 0.6 | INCHANGÉ — morsure de l’écart de nom sur l’attrait (baisser aurait aidé le bâclé plus que le joueur d’écran : ordre du gradient menacé) |
| `MGMT_AUD_BASE` | 0.7 | 0.7 | INCHANGÉ — part d’audience acquise avant la soirée |
| `MGMT_AUD_PER_DRAW` | 1000 | 1000 | INCHANGÉ — écrans par point d’attrait × mix de spectacle |
| `MGMT_DRAW_AVG` | 0.48 | 0.49 | MESURE reposée sur le joueur d’écran — attrait moyen mesuré d’un combat : 0.626 ; mgmtAudienceRef sans historique (8523 écrans) reste l’audience moyenne du joueur d’écran (QO-7) |
| `MGMT_SPECTACLE_REF` | 0.71 | 0.64 | MESURE reposée sur le joueur d’écran — part de finitions mesurée : 0.551 |
| `MGMT_TREASURY_START` | 50 | 50 | INCHANGÉ — décision QO-5 |
| `MGMT_TV_ECRANS` | 1000 | 1000 | INCHANGÉ — définition, pas un réglage |
| `MGMT_CARD_CONTRACT` | 9 | 12 | INCHANGÉ — la carte complète du lot 2 (5 + 4), définition |

Reproductibilité : un même `--seed`/`--n`/`--soirees` redonne exactement ces valeurs. Chaque
carrière r démarre sous `setSeed(base + r)` (oracle), `setSeed(base + 1000000 + r)` (joueur
d’écran et sa réduite) et `setSeed(base + 2000000 + r)` (bâclé).
Parallélisme : les paquets contigus de carrières sont indépendants (graine propre à chaque
carrière) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.
