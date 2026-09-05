# Baseline P7 — LOT 1 : instrumentation et référence

> Rapport de référence pour le plan « P7 — Dégâts, fidélité MMA, identité des
> styles ». Aucun changement de comportement du moteur n'a été fait dans ce
> lot : ce fichier documente ce que mesurent les harnais Monte Carlo
> **existants et étendus** (`tools/monte-carlo-combat.js`) et **un nouveau**
> (`tools/matchup-matrix.js`), sur l'état du dépôt à la date ci-dessous. Les
> lots 2/3/4 comparent leurs propres mesures à celui-ci.
>
> Contrairement aux autres sorties de `tools/reports/` (ignorées par git,
> régénérées à volonté), **ce fichier est versionné** — voir `.gitignore`.

- **Date de génération** : 2026-09-05
- **Branche** : `claude/lot-1-8zg696` (rebasée sur `main`)
- **Seed harnais principal** (`monte-carlo-combat.js`) : `20260905`
- **Seed matrice de matchups** (`matchup-matrix.js`) : `20260905`
- **Reproduire ce rapport** :
  ```bash
  node tools/monte-carlo-combat.js 20260905      # 12 000 combats + 25 carrières (~70s)
  node tools/matchup-matrix.js 20260905 2000     # 2x 64 cellules x 2000 combats (~3.5 min)
  ```
  Le déterminisme seedé du moteur (`SEED`, LCG dans `engine.js`) garantit que
  ces deux commandes reproduisent exactement les chiffres ci-dessous (règle
  commune P7 #5).

---

## 1. Distribution des finitions et dégâts (12 000 combats)

```
KO/TKO               :  2659 (22.2%)
Soumission           :  1835 (15.3%)
Décision             :  4645 (38.7%)
Décision partagée    :  2860 (23.8%)
Égalité              :     1 (0.0%)

Finition R1          : 1654 (13.8%)
Finition R2          : 1361 (11.3%)
Finition R3          : 1127 (9.4%)
Finition R4/R5       : 352 (2.9%)
Allés aux cartes     : 7506 (62.5%)
Décisions partagées  : 38.1% de l'ensemble des décisions (cible L3 : < 15%)
```

### Moyennes par combat (par combattant), avec p50/p90/p99/max

| Métrique | Moyenne | σ | p50 | p90 | p99 | Max |
|---|--:|--:|--:|--:|--:|--:|
| Frappes significatives landées | 35.7 | 20.0 | 35 | 62 | 95 | 136 |
| Frappes significatives tentées | 89.7 | 51.3 | 88 | 156 | 245 | 363 |
| Total frappes landées | 57.8 | 30.7 | 59 | 97 | 144 | 193 |
| Total frappes tentées | 122.0 | 66.9 | 123 | 208 | 319 | 448 |
| Frappes puissantes | 19.1 | 12.1 | 18 | 35 | 56 | 84 |
| Amenées réussies | 0.5 | 0.8 | 0 | 2 | 3 | 5 |
| Amenées tentées | 2.1 | 1.9 | 2 | 4 | 8 | 15 |
| Contrôle total (s) | 37 | 59 | 0 | 121 | 248 | 503 |
| Contrôle clinch (s) | 15 | 37 | 0 | 64 | 170 | 348 |
| Contrôle sol (s) | 22 | 37 | 0 | 74 | 162 | 459 |
| Knockdowns | 0.17 | 0.41 | 0 | 1 | 2 | 4 |
| Sonné(s) | 1.12 | 1.22 | 1 | 3 | 5 | 10 |
| **Dégâts cumulés (tête+corps+jambes)** | **11.7** | **6.2** | **12** | **19** | **28** | **37** |

**Dégâts cumulés — comparaison directe avec le plan P7** (« État des lieux
mesuré » cite : moyenne 11,35, écart-type 6,23, p90 19, maximum 35 sur
24 000 relevés, mesuré sur `claude/horloge-continue-combat-xwm0ma`) :
mesuré ici sur l'état actuel du dépôt, moyenne 11.7, σ 6.2, p90 19, max 37 —
**confirme le chiffre du plan à la marge de bruit d'échantillonnage près**.
C'est la référence directe des critères d'acceptation L2 (§2, « écart-type
en hausse d'au moins 40%, moyenne stable à ±10% »).

Autres chiffres inchangés par rapport au plan, également confirmés à la
marge de bruit près : répartition cibles (Tête 64.1% / Corps 25.1% / Jambes
10.7%), répartition positions (Distance 90.2% / Clinch 4.5% / Sol 5.3%),
soumissions (0.3 tentative/combat), passes/renversements/relevés (≈0.0/0.1/0.1
par combat) : le sol n'a effectivement aucune hiérarchie de position, comme
décrit.

Invariants mathématiques : **0 violation** sur 24 000 relevés (100% cohérent).

---

## 2. Matrice de matchups style × style (§1.2 et §1.3)

Deux matrices indépendantes, 64 cellules ordonnées (8×8, y compris les
paires même style/même style), **2 000 combats par cellule** (256 000
combats au total), avec intervalle de confiance à 95% (Wilson) par cellule
— voir `tools/matchup-matrix.js`.

### 2.1 Matrice RAW (niveau non contrôlé — reflète le jeu tel quel)

Taux de victoire du style en ligne contre le style en colonne :

| | boxer | kickbox | muayThai | karate | wrestler | bjj | sambo | mma |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **boxer** | 51.0% | 57.4% | 55.6% | 49.4% | 55.1% | 60.3% | 49.9% | 56.0% |
| **kickboxer** | 43.8% | 50.1% | 46.9% | 47.9% | 58.8% | 61.4% | 53.3% | 52.9% |
| **muayThai** | 43.1% | 51.5% | 48.1% | 40.4% | 58.4% | 51.8% | 58.6% | 48.9% |
| **karate** | 52.3% | 52.9% | 57.8% | 50.1% | 53.3% | 54.2% | 50.7% | 52.6% |
| **wrestler** | 46.2% | 41.6% | 43.9% | 42.8% | 51.0% | 47.3% | 52.7% | 44.5% |
| **bjj** | 40.3% | 42.4% | 47.9% | 45.5% | 55.5% | 50.5% | 53.5% | 45.8% |
| **sambo** | 48.6% | 47.4% | 42.9% | 46.1% | 50.0% | 47.0% | 51.3% | 48.8% |
| **mma** | 46.8% | 46.9% | 49.0% | 47.8% | 54.7% | 53.6% | 53.6% | 50.5% |

Moyenne par style (tous adversaires confondus, 16 000 combats/style) :
boxer 54.3%, kickboxer 51.9%, muayThai 50.1%, karate 53.0%, wrestler 46.2%,
bjj 47.7%, sambo 47.8%, mma 50.4%. **Étendue : 46.2% – 54.3% (8.1 points).**

### 2.2 Matrice EQUAL-OVERALL ±2 (référence L4, §1.3)

Mêmes 64 cellules, mais les deux combattants de chaque combat sont générés
à overall égal (`overall()`, écart moyen mesuré 1.13 point, max 2 — recherche
itérative sur `makeFighter({level})`, cf. `makeFighterNearOverall()`) :
isole la contribution du style de celle du niveau brut.

| | boxer | kickbox | muayThai | karate | wrestler | bjj | sambo | mma |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **boxer** | 49.3% | 58.7% | 59.0% | 45.4% | 55.8% | 62.9% | 50.0% | 58.8% |
| **kickboxer** | 41.0% | 51.3% | 51.3% | 43.8% | 57.3% | 64.8% | 53.4% | 56.5% |
| **muayThai** | 42.2% | 48.3% | 52.4% | 36.7% | 58.1% | 54.4% | 62.1% | 52.6% |
| **karate** | 53.5% | 54.3% | 64.2% | 50.4% | 58.1% | 59.3% | 55.8% | 58.0% |
| **wrestler** | 46.9% | 45.5% | 43.3% | 43.4% | 50.7% | 51.4% | 53.0% | 44.0% |
| **bjj** | 36.9% | 36.6% | 49.1% | 43.2% | 51.8% | 52.4% | 51.6% | 46.6% |
| **sambo** | 48.6% | 47.1% | 41.6% | 45.7% | 47.9% | 49.6% | 50.9% | 48.5% |
| **mma** | 43.6% | 44.5% | 48.9% | 42.6% | 57.9% | 57.0% | 54.0% | 49.9% |

Moyenne par style (16 000 combats/style) : boxer 55.0%, kickboxer 52.4%,
muayThai 50.8%, karate 56.7%, wrestler 47.3%, bjj 46.0%, sambo 47.5%,
mma 49.8%. **Étendue : 46.0% – 56.7% (10.7 points) — plus large qu'à
niveau non contrôlé.**

Cellules les plus marquées (candidates naturelles pour le critère
d'acceptation L4 « au moins six cellules à 60/40 ou plus », déjà partiellement
approchées avant tout changement de L4) :

| Cellule | Taux (A) | IC95% | n |
|---|--:|--:|--:|
| karate vs muayThai | 64.2% | [62.1–66.3] | 2000 |
| kickboxer vs bjj | 64.8% | [62.7–66.9] | 2000 |
| boxer vs bjj | 62.9% | [60.8–65.0] | 2000 |
| muayThai vs sambo | 62.1% | [60.0–64.2] | 2000 |
| **muayThai vs karate** | **36.7%** | **[34.6–38.8]** | 2000 |
| **bjj vs kickboxer** | **36.6%** | **[34.6–38.8]** | 2000 |
| **bjj vs boxer** | **36.9%** | **[34.8–39.0]** | 2000 |

`muayThai vs karate` est déjà à 36.7/63.3 (≈ 37/63) à overall strictement
égal — à ~3 points du seuil 60/40 visé par L4, **sans qu'aucune politique de
combat n'ait encore été ajoutée** : l'écart vient uniquement des biais
d'attributs de départ (`STYLES[].b`) et du profil mécanique
(`STYLE_PROFILE` — karaté a `koMod:1.52`, le plus haut du jeu, et
`sigVol:1.26`). Point de départ utile pour calibrer l'ampleur des
ajustements de L4 (ne pas repartir de zéro).

**Écart d'overall observé entre les deux combattants (matrice
EQUAL-OVERALL)** : moyenne 1.13, maximum 2 — la contrainte ±2 du §1.3 est
respectée sur les 128 000 combats de cette matrice.

---

## 3. Empreinte statistique par style (§1.4, référence L4 §4.3)

Cible/position des frappes, contrôle moyen, tentatives de soumission, part
des combats allant aux cartes — sur les mêmes 12 000 combats que la
section 1 (répartition naturelle des divisions/niveaux, pas la matrice à
overall égal) :

| Style | Tête | Corps | Jambes | Distance | Clinch | Sol | Contrôle | Sub. tent. | Cartes |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| boxer | 65% | 25% | 11% | 98% | 1% | 1% | 11.6s | 0.00 | 66.2% |
| kickboxer | 63% | 24% | 12% | 94% | 3% | 3% | 26.0s | 0.00 | 65.7% |
| muayThai | 61% | 29% | 10% | 80% | 12% | 8% | 70.1s | 0.01 | 67.4% |
| karate | 65% | 23% | 13% | 99% | 0% | 1% | 7.5s | 0.00 | 61.4% |
| wrestler | 65% | 26% | 9% | 81% | 7% | 12% | 60.0s | 0.08 | 64.9% |
| bjj | 66% | 24% | 10% | 91% | 3% | 7% | 27.7s | 1.04 | 54.5% |
| sambo | 64% | 27% | 9% | 80% | 10% | 10% | 56.5s | 1.01 | 55.4% |
| mma | 64% | 25% | 11% | 90% | 4% | 6% | 36.0s | 0.41 | 65.2% |

Lecture : la répartition **cible** (tête/corps/jambes) est presque
identique d'un style à l'autre (64-66% tête partout) — le style ne
différencie aujourd'hui ni la cible ni la précision, seulement (un peu) la
position et nettement le volume de soumissions. C'est exactement le
diagnostic attendu avant L4 : « les profils de finition diffèrent
fortement — un style change *comment* on gagne, jamais *contre qui* » (à
nuancer : cf. §2, la matrice montre déjà un *contre qui* mesurable, plus
large que ce que le plan affirmait).

---

## 4. Sensibilité des attributs (inchangé, harnais existant)

```
Impact Kick 95 vs 15   : Kicks jambes réussis = 3776 vs 1401 (écart x2.7)
Impact Takedown vs TDD : 571 amenées réussies face à 1317 défenses
Impact Agressivité     : 48845 tent. (Agro 95) vs 41167 tent. (Agro 15) (écart +19%)
Survie KD Sang-froid   : Survie avec Sang-froid 95 = 29/43 vs 26/35 avec Sang-froid 15
```

## 5. Carrières complètes (25 simulées, inchangé)

```
Combats moyens par carrière : 31.3 combats (Bilan moyen: 21.2V - 10.0D)
Âge moyen de fin de parcours : 29.1 ans
Pic d'overall moyen         : 71.1
Champions titrés            : 8.0%
Champions du monde ultimes  : 0.0%
```

---

## 6. Écarts les plus criants avec le MMA réel, classés par ampleur

> Liste qualitative demandée par ce lot (§1, livrable). Les chiffres du
> jeu ci-dessous sont mesurés ; les repères MMA réel sont des **ordres de
> grandeur indicatifs, non sourcés** — le sourçage rigoureux (§3.4) est le
> travail explicite de L3, pas de ce lot.

1. **Absence totale de hiérarchie de positions au sol.** Le code ne connaît
   que `debout`/`clinch`/`sol` + un booléen `topIsA` (aucune garde,
   demi-garde, contrôle latéral, montée, dos). Mesuré : 0.03 passe de
   garde/combat, 0.10 renversement/combat, 0.10 relevé/combat, le sol ne
   représente que 5.3% des frappes significatives landées. En MMA réel, le
   jeu de position domine des pans entiers de combat (contrôle, transitions,
   menaces de soumission enchaînées) — c'est l'écart le plus structurel du
   plan, et la raison pour laquelle L3 doit précéder L4.
2. **Dégâts sans queue lourde — pas de coup qui change un combat d'un
   coup.** Mesuré : dégâts cumulés max/moyenne ≈ 37/11.7 ≈ x3.2 sur 24 000
   relevés ; le plafond par tick (`clamp(...,0,6)`, `engine-combat.js:389`)
   borne la somme d'un tick, pas l'amplitude d'un coup isolé. En MMA réel,
   un KO vient typiquement d'un ou deux coups isolés très supérieurs au
   volume moyen — un facteur nettement supérieur à x3 est attendu (valeur
   de design assumée, objet de L2).
3. **Décisions partagées très sur-représentées.** Mesuré : 38.1% de
   l'ensemble des décisions (cible L3 : <15%). Point important pour la
   suite : le score 10-8/10-7 pour domination nette/extrême **existe déjà**
   (`engine-combat.js` ANCRE `JUGES_10PT_SCORE`, lignes ~484-505), tout
   comme un bruit inter-juges corrélé partiel (`dissentJudge()`). Le taux
   élevé de décisions partagées vient donc d'ailleurs (probablement de la
   largeur de la « bande serrée » où `rDiff` tranche à 10-9 dans un sens ou
   l'autre quasi au hasard, lignes ~503-505) — **pas d'une absence de
   grille 10-8**, contrairement à ce que suggérait la formulation du plan
   L3 §3.3.
4. **Soumissions non construites, quasi jamais tirées hors spécialistes.**
   Mesuré : 0.3 tentative/combat toutes catégories confondues (1.04 chez
   bjj, ~0.00 chez boxer/karate). En MMA réel, un spécialiste grappling
   tente plusieurs soumissions par combat, souvent enchaînées depuis une
   séquence de position — ici c'est un tirage isolé (`subTop>2.5`,
   `engine-combat.js:224-225`) sans lien avec une position construite.
5. **Écart de win-rate par style réel, mais plus large — et plus
   asymétrique par cellule — que ce que dit le plan.** Le plan cite
   « 49,0% à 51,3% » sur 2 400-2 550 combats/style ; mesuré ici sur 16 000
   combats/style (deux méthodologies indépendantes, RAW et EQUAL-OVERALL,
   seed 20260905) : **46.2%–54.3%** (RAW, niveau non contrôlé) et
   **46.0%–56.7%** (EQUAL-OVERALL ±2, § 2.2) — soit jusqu'à 10.7 points
   d'étendue, pas 2.3. Certaines cellules individuelles (`muayThai vs
   karate` à 36.7/63.3 à overall égal) sont déjà à quelques points du seuil
   60/40 que L4 doit atteindre, sans qu'aucune politique de combat n'ait
   encore été ajoutée. Voir §7 ci-dessous : ceci est un écart avec le plan
   P7 lui-même, pas seulement avec le MMA réel — à prendre en compte pour
   calibrer l'ampleur des changements de L4 (l'écart de base est plus
   généreux que prévu, donc les leviers de L4 peuvent viser des
   ajustements plus modestes qu'anticipé pour atteindre la cible).

---

## 7. Écarts constatés entre le plan P7 / CLAUDE.md et l'état réel du dépôt

- **Spread de win-rate par style plus large que celui cité par le plan.**
  Le plan (« État des lieux mesuré », mesuré sur
  `claude/horloge-continue-combat-xwm0ma`, 12 000 combats) cite 49,0%-51,3%.
  Mesuré ici sur l'état actuel de `main` (deux runs indépendants, 12 000 +
  2×128 000 combats, seed 20260905) : 46.2%-54.3% (RAW) et 46.0%-56.7%
  (EQUAL-OVERALL). Les autres chiffres cités par le plan (dégâts cumulés,
  part des décisions partagées, quasi-absence de sol) sont, eux, confirmés
  à la marge de bruit près — voir §1 et §6.
- **Score 10-8/10-7 des juges : déjà implémenté**, contrairement à ce que
  suggère la formulation conditionnelle de L3 §3.3 (« Vérifie s'ils
  existent ; s'ils n'existent pas, ajoute-les »). Voir `engine-combat.js`
  ANCRE `JUGES_10PT_SCORE`. L3 devra vérifier ce point avant de se lancer
  dans un ajout inutile, et concentrer son effort sur le bruit inter-juges
  et la cohérence panneau/cartes, déjà partiellement présents également
  (`dissentJudge()`, `roundStats[]` traçable round par round).
- **CLAUDE.md §7 (« 39 tests, répartis sur 9 fichiers ») est dépassé.**
  `npm test` exécute aujourd'hui **74 tests sur 10 fichiers** (le fichier
  `tests/hubCombatDossier.test.js`, absent de l'énumération de CLAUDE.md,
  existe et passe). `npm run check` reste vert (voir §8).
- **CLAUDE.md §4 (`SAVE_VERSION`) cite `3` « au moment de la rédaction »** ;
  la valeur réelle actuelle est **`4`** (`state/state-migration.js:4`,
  confirmé par le test « SAVE_VERSION est bien à 4 et migrate() amène
  toute sauvegarde à cette version »). Non corrigé ici (hors périmètre de
  ce lot, purement documentaire), signalé pour une mise à jour ultérieure
  de CLAUDE.md.

---

## 8. Performance et validation

- `node tools/monte-carlo-combat.js` : 12 000 combats simulés en **10.0s**
  (bien sous le repère « quelques dizaines de secondes » de la règle
  commune #6) ; 25 carrières complètes en 57.8s (harnais existant, non
  modifié dans ce lot).
- `node tools/matchup-matrix.js 20260905 2000` : 256 000 combats (2
  matrices de 128 000) en **≈3.5 minutes** (95.3s + 115.1s). C'est un outil
  de mesure dédié à la génération ponctuelle de ce rapport, pas le harnais
  visé par la règle commune #6 (12 000 combats) — mais à surveiller si un
  lot suivant en a besoin plus souvent : la hiérarchie de positions de L3
  est le risque de performance identifié par le plan, pas ce lot.
- `npm run check` : **vert** — voir sortie collée ci-dessous.

```
$ npm run lint
> eslint .
(aucune sortie = 0 erreur)

$ npm test
...
# tests 74
# suites 0
# pass 74
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

---

## 9. Fichiers livrés dans ce lot

- `tools/monte-carlo-combat.js` — étendu (p50/p99/max, 12 000 combats,
  échantillon de dégâts cumulés, empreinte statistique par style, seed CLI).
  Aucune formule de simulation modifiée.
- `tools/matchup-matrix.js` — **nouveau**. Matrice 8×8 RAW et EQUAL-OVERALL
  ±2, IC95% Wilson par cellule.
- `.gitignore` — `tools/reports/` devient `tools/reports/*` + exception
  ciblée pour permettre à ce fichier de rester versionné.
- `tools/reports/baseline-P7.md` — ce fichier.
