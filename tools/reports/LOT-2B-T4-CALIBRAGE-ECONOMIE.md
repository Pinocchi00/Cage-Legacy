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
- Carrières demandées par profil : 1000 (paquets contigus, au plus 12 processus)
- Soirées enchaînées par carrière : 20 (--soirees — à 1 : chaque soirée repart d’une organisation neuve)
- Premières soirées jouées (la table des résultats) : oracle 1000, joueur d’écran 1000, réduite 1000, bâclée 1000
- Carrières interrompues par une soirée non composable (pot épuisé, la carrière s’arrête) : oracle 0, joueur d’écran 0, bâclée 0
- Référence D4 d’avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : 7212 écrans

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

## Résultats (graine de base 20260919, 20 soirées par organisation)

Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets
− bonus de victoire).
Les cibles se jugent sur la ligne du joueur d’écran, jamais sur l’oracle. Cette table est la soirée 1 — la table des soirées enchaînées, plus bas, porte la suite.

| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Bonus | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| oracle (borne haute — ne sert à aucune cible) | 1000 | 30.8 | 8.9 | 16 | 31 | 45 | 99.9 | 191.9 | 104.5 | 56.6 | 9.85 | 0.593 | 8650.1 | 745.6 | — |
| joueur d’écran (sert les cibles) | 1000 | 7 | 11.4 | -11 | 7 | 26 | 72 | 153.8 | 93 | 53.8 | 7.85 | 0.64 | 6995.4 | 839.3 | — |
| réduite (8, prélim faible retiré du joueur d’écran) | 1000 | 2.9 | 10.6 | -14 | 3 | 20 | 58.8 | 141.9 | 89.1 | 50 | 7.6 | 0.633 | 6757.9 | 821.9 | 28.1 % |
| bâclée (5+4 écrasée, déroulé réel) | 1000 | -10.4 | 9.7 | -25 | -11 | 6 | 13.4 | 124.8 | 84.1 | 51.1 | 6.33 | 0.682 | 5719.7 | 732.8 | — |

Gradient de lecture (contrainte de forme) : oracle (30.8 k$) > joueur d’écran (7 k$) > bâclé (-10.4 k$) — l’ordre tient sur R moyen et sur les % rentables.

Part de combats de préliminaires bâclés dans les propositions validées : 36.2 %
(joueur d’écran et oracle : attendue quasi nulle — Leïla est soigneuse sans écrasement ;
bâclée : au plafond du jeu, 0,65).

## Cibles du lot 3b T1 — mesurées avant et après

| Cible (lot 3b T1) | Avant | Après (joueur d’écran) | Verdict |
|---|---|---|---|
| 1. Le joueur d’écran (carte complète moyenne) est rentable dans 70 à 80 % des soirées | 0 % (joueur d’écran, bonus de victoire sans remontée des revenus) | 72 % (joueur d’écran, soirée 1) | ATTEINTE |
| 2. Le joueur bâclé perd de l'argent plus souvent qu'il n'en gagne | 0 % de rentables (bonus sans remontée des revenus) | 13.4 % (bâclé, soirée 1) | ATTEINTE |
| 3. La carte réduite (du joueur d'écran) garde son audience de référence dans une part mesurable des cas | 38 % (réduite du joueur d’écran, bonus sans remontée des revenus) | 28.1 % (réduite, réf 7212 écrans) | ATTEINTE |

## Ce que le bonus de victoire change, et ce que le recalibrage corrige

Le bonus de victoire (lot 2B T4) alourdit une soirée d’environ la moitié de sa masse
de cachets : le vainqueur de chacun des neuf combats touche son cachet une seconde
fois (partage show/win du sport réel, `MGMT_WIN_BONUS_SHARE=1`). Avant remontée des
revenus, le joueur d’écran mesurait R moyen -49.4 k$ (médiane -49)
pour 0 % de rentables — la soirée perdait ~50 k$ en moyenne. C’est ce que le
recalibrage corrige : les deux leviers de revenu (billetterie et droits du diffuseur)
suivent le coût, dans leurs proportions d’avant. L’écart oracle − joueur d’écran
(23.8 k$ de R moyen) reste le prix du joueur parfait : un joueur qui choisit
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

Aucune cible manquée.

## Soirées enchaînées — l’organisation qui vieillit (--soirees=20)

K soirées enchaînées sur la MÊME organisation (mgmtNewPile entre chaque ; le bilan et
la notoriété des combattants évoluent, le corps s’use, Leïla respecte le repos).
Chaque ligne est l’index de la soirée dans la carrière de l’organisation.
« Disponibles » : les lignes que la liste de composition laisse choisir au moment
de composer (mesuré sur la carrière du joueur d’écran) ; « suspensions » : les
combattants sous suspension médicale à ce moment.

| Soirée | Profil | n | R moyen | R méd | R p5 | R p95 | % rentables | Audience | Disponibles | Suspensions |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | oracle | 1000 | 30.8 | 31 | 16 | 45 | 99.9 | 8650.1 | — | — |
| 2 | oracle | 1000 | 19.7 | 20 | 4 | 35 | 97.9 | 7927.5 | — | — |
| 3 | oracle | 1000 | 16.6 | 16 | 1 | 32 | 95.6 | 7768.1 | — | — |
| 4 | oracle | 1000 | 12.7 | 13 | -3 | 28 | 89.6 | 7559.8 | — | — |
| 5 | oracle | 1000 | 8.7 | 9 | -9 | 25 | 77.8 | 7362.1 | — | — |
| 6 | oracle | 1000 | 5.4 | 6 | -11 | 22 | 68 | 7186.5 | — | — |
| 7 | oracle | 1000 | 4.9 | 5 | -13 | 23 | 65.9 | 7194 | — | — |
| 8 | oracle | 1000 | 2 | 2 | -16 | 20 | 55.8 | 7040.9 | — | — |
| 9 | oracle | 1000 | 0 | 0 | -18 | 19 | 47.5 | 6970.6 | — | — |
| 10 | oracle | 1000 | -2.4 | -2 | -23 | 17 | 40.1 | 6849.9 | — | — |
| 11 | oracle | 1000 | -5.5 | -6 | -26 | 15 | 31.5 | 6701.6 | — | — |
| 12 | oracle | 1000 | -8.7 | -9 | -29 | 12 | 22.1 | 6549.4 | — | — |
| 13 | oracle | 1000 | -10.8 | -11 | -32 | 10 | 20.2 | 6451.3 | — | — |
| 14 | oracle | 1000 | -13.3 | -13 | -34 | 8 | 15 | 6329.4 | — | — |
| 15 | oracle | 1000 | -16.3 | -16 | -36 | 4 | 9.5 | 6183.3 | — | — |
| 16 | oracle | 1000 | -19 | -20 | -39 | 4 | 7.5 | 6052.1 | — | — |
| 17 | oracle | 1000 | -21.3 | -22 | -41 | 0 | 4.9 | 5949.1 | — | — |
| 18 | oracle | 1000 | -24.2 | -25 | -44 | -2 | 3.4 | 5819.7 | — | — |
| 19 | oracle | 1000 | -26.6 | -28 | -45 | -4 | 2.1 | 5693.7 | — | — |
| 20 | oracle | 1000 | -28.7 | -30 | -46 | -8 | 1.1 | 5600.4 | — | — |
| 1 | joueur d’écran | 1000 | 7 | 7 | -11 | 26 | 72 | 6995.4 | 45 | 0 |
| 2 | joueur d’écran | 1000 | 0.8 | 1 | -18 | 20 | 50.4 | 6771.2 | 39.2 | 5.8 |
| 3 | joueur d’écran | 1000 | -4.3 | -5 | -23 | 15 | 33.3 | 6601.6 | 33.5 | 11.6 |
| 4 | joueur d’écran | 1000 | -7.7 | -8 | -28 | 13 | 26.5 | 6488.1 | 31.2 | 13.8 |
| 5 | joueur d’écran | 1000 | -11.6 | -12 | -30 | 9 | 15.3 | 6345.4 | 29.9 | 15.2 |
| 6 | joueur d’écran | 1000 | -14.8 | -15 | -34 | 6 | 11.3 | 6218.5 | 28.6 | 16.4 |
| 7 | joueur d’écran | 1000 | -16.5 | -17 | -36 | 5 | 9.4 | 6167.8 | 27.5 | 17.5 |
| 8 | joueur d’écran | 1000 | -18.5 | -19 | -37 | 2 | 7.5 | 6105.1 | 27.2 | 17.8 |
| 9 | joueur d’écran | 1000 | -20.3 | -21 | -40 | 2 | 6.8 | 6047.7 | 27.1 | 17.9 |
| 10 | joueur d’écran | 1000 | -22.8 | -23 | -43 | -1 | 4.2 | 5943.2 | 26.9 | 18.1 |
| 11 | joueur d’écran | 1000 | -25 | -26 | -44 | -2 | 3.7 | 5857 | 26.7 | 18.4 |
| 12 | joueur d’écran | 1000 | -26 | -27 | -46 | -3 | 3 | 5828.2 | 26.6 | 18.4 |
| 13 | joueur d’écran | 1000 | -27.6 | -29 | -47 | -5 | 2.6 | 5763.4 | 26.3 | 18.7 |
| 14 | joueur d’écran | 1000 | -29.2 | -30 | -49 | -5 | 2.5 | 5685.2 | 26.2 | 18.8 |
| 15 | joueur d’écran | 1000 | -31.1 | -32 | -51 | -9 | 1.8 | 5623.1 | 26 | 19 |
| 16 | joueur d’écran | 1000 | -32.1 | -33 | -51 | -8 | 1.7 | 5560.1 | 25.8 | 19.1 |
| 17 | joueur d’écran | 1000 | -33.6 | -35 | -52 | -11 | 0.8 | 5491.6 | 25.6 | 19.2 |
| 18 | joueur d’écran | 1000 | -33.8 | -35 | -53 | -9 | 1.6 | 5509.2 | 25.5 | 19.3 |
| 19 | joueur d’écran | 1000 | -34.8 | -36 | -54 | -11 | 1.2 | 5459.1 | 25.1 | 19.6 |
| 20 | joueur d’écran | 1000 | -36.1 | -37 | -55 | -12 | 1.2 | 5413.6 | 24.9 | 19.6 |
| 1 | réduite | 1000 | 2.9 | 3 | -14 | 20 | 58.8 | 6757.9 | — | — |
| 2 | réduite | 1000 | -3.4 | -4 | -21 | 15 | 36.8 | 6539.6 | — | — |
| 3 | réduite | 1000 | -8 | -9 | -26 | 12 | 21.5 | 6420 | — | — |
| 4 | réduite | 1000 | -11.3 | -12 | -31 | 9 | 15.8 | 6320.9 | — | — |
| 5 | réduite | 1000 | -15.2 | -16 | -33 | 4 | 8.9 | 6202.1 | — | — |
| 6 | réduite | 1000 | -18.2 | -19 | -37 | 3 | 7 | 6089.5 | — | — |
| 7 | réduite | 1000 | -20.1 | -21 | -39 | 1 | 5.3 | 6011.7 | — | — |
| 8 | réduite | 1000 | -22.1 | -23 | -40 | -3 | 3.4 | 5962.6 | — | — |
| 9 | réduite | 1000 | -23.9 | -25 | -43 | -3 | 2.7 | 5891.3 | — | — |
| 10 | réduite | 1000 | -26 | -26 | -45 | -4 | 2.7 | 5837.2 | — | — |
| 11 | réduite | 1000 | -28.4 | -29 | -47 | -8 | 1.7 | 5727 | — | — |
| 12 | réduite | 1000 | -29.2 | -31 | -48 | -6 | 1.1 | 5714.4 | — | — |
| 13 | réduite | 1000 | -30.6 | -31 | -50 | -9 | 1.6 | 5659.8 | — | — |
| 14 | réduite | 1000 | -32.5 | -34 | -52 | -9 | 1 | 5561.9 | — | — |
| 15 | réduite | 1000 | -34.1 | -35 | -53 | -12 | 1.1 | 5504 | — | — |
| 16 | réduite | 1000 | -35.1 | -36 | -53 | -12 | 1 | 5457.9 | — | — |
| 17 | réduite | 1000 | -36.6 | -38 | -55 | -14 | 0.6 | 5385.8 | — | — |
| 18 | réduite | 1000 | -36.7 | -38 | -55 | -14 | 1.1 | 5415.5 | — | — |
| 19 | réduite | 1000 | -37.7 | -39 | -56 | -16 | 0.7 | 5366.3 | — | — |
| 20 | réduite | 1000 | -39 | -41 | -57 | -17 | 0.6 | 5300.8 | — | — |
| 1 | bâclée | 1000 | -10.4 | -11 | -25 | 6 | 13.4 | 5719.7 | — | — |
| 2 | bâclée | 1000 | -8.8 | -9 | -25 | 9 | 17.7 | 5899 | — | — |
| 3 | bâclée | 1000 | -10.8 | -11 | -28 | 8 | 17.1 | 5818.5 | — | — |
| 4 | bâclée | 1000 | -12.8 | -14 | -30 | 7 | 13.1 | 5721.8 | — | — |
| 5 | bâclée | 1000 | -14.2 | -15 | -32 | 5 | 10.7 | 5664.1 | — | — |
| 6 | bâclée | 1000 | -15.7 | -17 | -34 | 4 | 8.7 | 5623 | — | — |
| 7 | bâclée | 1000 | -16.6 | -17 | -35 | 3 | 7.7 | 5598.4 | — | — |
| 8 | bâclée | 1000 | -17.7 | -19 | -36 | 4 | 8.2 | 5543 | — | — |
| 9 | bâclée | 1000 | -19.8 | -21 | -38 | 0 | 5 | 5455.1 | — | — |
| 10 | bâclée | 1000 | -20.3 | -21 | -38 | 1 | 5.1 | 5455.8 | — | — |
| 11 | bâclée | 1000 | -21.4 | -22 | -40 | 1 | 5.2 | 5409.8 | — | — |
| 12 | bâclée | 1000 | -21.8 | -23 | -41 | 1 | 5.7 | 5409.1 | — | — |
| 13 | bâclée | 1000 | -23.4 | -24 | -41 | -2 | 3.1 | 5303.9 | — | — |
| 14 | bâclée | 1000 | -23.3 | -24 | -42 | 0 | 5 | 5363.8 | — | — |
| 15 | bâclée | 1000 | -24.3 | -25 | -43 | -1 | 3.6 | 5318.1 | — | — |
| 16 | bâclée | 1000 | -25.5 | -26 | -45 | -3 | 3 | 5272.4 | — | — |
| 17 | bâclée | 1000 | -25.6 | -27 | -44 | -2 | 3.3 | 5279.2 | — | — |
| 18 | bâclée | 1000 | -25.9 | -26 | -46 | -2 | 3.6 | 5277.7 | — | — |
| 19 | bâclée | 1000 | -27 | -28 | -47 | -3 | 3.3 | 5245.4 | — | — |
| 20 | bâclée | 1000 | -28.3 | -30 | -48 | -5 | 3.1 | 5181.8 | — | — |

**Information de design : l’hypothèse inverse est mesurée.** Le joueur d’écran est
rentable à la première soirée (R moyen 7 k$, 72 % de rentables) et
il SE DÉGRADE d’une soirée à l’autre : R moyen -36.1 k$ à la dernière
(1.2 % de rentables),
audience 6995.4 → 5413.6 écrans, vivier 45 → 24.9 disponibles,
suspensions en cours 0 → 19.6, et des soirées qui ne se
composent plus (1000 → 1000 carrières complètes).
L’hypothèse « l’organisation vieillissante s’enrichit quand ses noms montent » n’est
PAS vérifiée à K=20 : la notoriété monte, mais le corps s’use et les
suspensions retirent les meilleurs noms de la rotation, plus vite que les noms ne
montent. C’est une information de design, pas un détail — la jeunesse de
l’organisation est son âge d’or, et le déclin des cartes suit l’usure du vivier.

## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-argent.js)

Les cibles sont des décisions d’auteur — jamais touchées. Ce sont les poids d’argent
qui ont bougé, pour porter le joueur d’écran (le seul qui sert les cibles) dans la
bande 70-80 % malgré le bonus de victoire. Effets mesurés : comparaison des essais
--n=200 --soirees=20 (avant recalibrage : -49.4 k$ / 0 % ; après : 7 k$ / 72 %, soirée 1).

| Constante | Ancienne | Nouvelle | Effet mesuré |
|---|---|---|---|
| `MGMT_WIN_BONUS_SHARE` | — (nouveau) | 1 | NOUVEAU (lot 2B T4) — part du cachet reversée au vainqueur : 1, la pratique show/win du sport réel ; le vainqueur des neuf combats touche son cachet une seconde fois, le nul ne bonus personne |
| `MGMT_TICKET_PER_DRAW` | 7 | 11.4 | billetterie (k$) par point d’attrait — LE levier de revenu de ce recalibrage : le bonus de victoire alourdit le coût d’une soirée de ~50 k$, la billetterie suit (7 → 11.4) ; R moyen -49.4 → 7 k$, rentables 0 % → 72 % (soirée 1) |
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
| `MGMT_DRAW_AVG` | 0.48 | 0.49 | MESURE reposée sur le joueur d’écran — attrait moyen mesuré d’un combat : 0.476 ; mgmtAudienceRef sans historique (7212 écrans) reste l’audience moyenne du joueur d’écran (QO-7) |
| `MGMT_SPECTACLE_REF` | 0.71 | 0.64 | MESURE reposée sur le joueur d’écran — part de finitions mesurée : 0.64 |
| `MGMT_TREASURY_START` | 50 | 50 | INCHANGÉ — décision QO-5 |
| `MGMT_TV_ECRANS` | 1000 | 1000 | INCHANGÉ — définition, pas un réglage |
| `MGMT_CARD_CONTRACT` | 9 | 9 | INCHANGÉ — la carte complète du lot 2 (5 + 4), définition |

Reproductibilité : un même `--seed`/`--n`/`--soirees` redonne exactement ces valeurs. Chaque
carrière r démarre sous `setSeed(base + r)` (oracle), `setSeed(base + 1000000 + r)` (joueur
d’écran et sa réduite) et `setSeed(base + 2000000 + r)` (bâclé).
Parallélisme : les paquets contigus de carrières sont indépendants (graine propre à chaque
carrière) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.
