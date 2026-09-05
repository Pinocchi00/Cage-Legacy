# Rapport — LOT 9/P8 : Taxonomie de frappes, blessures, médecin, rythme

> Rapport de livraison du lot 9 du plan « P8 — Solde de l'addendum P7,
> suppressions, et rôle de l'adaptabilité » (points 3, 6, 7 et 11 de
> l'addendum P7). Compare l'état du moteur **après** ce lot à
> `tools/reports/lot8-allonge-gabarit-garde.md` (référence issue du lot 8),
> comme l'exige la règle commune #3 du plan (« un rapport versionné par
> lot, comparé au précédent »).

- **Date de génération** : 2026-09-05
- **Branche** : `claude/lot-9-sans-erreur-cvuyim`
- **Seed harnais principal** (`monte-carlo-combat.js`, `matchup-matrix.js`) : `20260905` (identique aux lots 6/7/8, pour comparabilité directe)
- **Reproduire ce rapport** :
  ```bash
  node tools/monte-carlo-combat.js 20260905      # 12 000 combats + 25 carrières (~90s)
  node tools/matchup-matrix.js 20260905 2000     # 2x64 cellules x 2000 combats (~16 min)
  ```

---

## 1. Ce que ce lot ajoute

### 9.1 — Taxonomie de frappes réelle

`ANCRE: P8_L9_TAXONOMIE_FRAPPES` (`engine-combat.js`). La frappe était un
scalaire réparti a posteriori sur une zone (tête/corps/jambes) — ce lot
ajoute une classification par **type** au-dessus de cette même zone, sans
toucher une seule ligne de dégâts/score/points juges déjà calibrée par
P7/L8 :

- **`standingStrikeMix(att, zone)`** — fonction pure : répartit le volume
  de zone *déjà décidé* (`headA`/`bodyA`/`legA`, inchangés) entre poing
  (jab/cross/hook/uppercut, pondérés par les attributs propres de
  l'attaquant), kick (jambe/corps/tête), coup tournant (rare, ≤5% côté
  tête) et front kick (rare, ≤6% côté corps). Coude et genou n'y
  apparaissent **jamais** — §9.1 : « ne sont disponibles qu'au clinch et
  au sol ».
- **Clinch** (`ANCRE: P8_L9_TAXONOMIE_FRAPPES`, bloc clinch) — une part de
  `bodyHits`/`headHits` (déjà décidés) est classée genou/coude, pondérée
  par `STYLE_PROFILE[style].clinchDmg` — le muay-thaï et la lutte (clinch
  lourd) en reçoivent naturellement plus, sans second sac de bonus.
- **Sol** — le Ground & Pound existant est décomposé en coude/« GNP
  générique », pondéré par `posProf.gnpDmg` du style dominant.
- **Coudes = premier ouvreur de coupures** (§9.1) : une nouvelle coupure de
  clinch pondérée par `STRIKE_CUT_MULT.elbow`, plus le mécanisme de
  coupure au sol déjà existant (Lot 2/P7) désormais explicitement attribué
  à la source « coude » (`st.X.cutSrc.elbow`).
- **Chocs de têtes** (§9.1, deuxième source) — nouveau mécanisme
  (`HEAD_CLASH_CHANCE`), phase-agnostique (clinch/sol), indépendant des
  frappes elles-mêmes.
- **Coups lourds** (§9.1, troisième source) — les deux mécanismes de
  coupure déjà existants (Lot 2/P7 : cross/hook puissants, coup lourd à
  queue épaisse) sont conservés à l'identique et simplement classés
  `cutSrc.heavy`, plus un nouvel apport modeste de high kicks très lourds
  (`STRIKE_CUT_MULT.headKick`).
- **Signature branchée sur la taxonomie** : hors périmètre pour les gestes
  de `FINISH_MOVES`/`GENERIC_KO` eux-mêmes (leur tirage reste inchangé,
  §8, additif) — en revanche `pickFinishMove()` reçoit toujours la zone du
  geste réellement joué (`ANCRE: CORRECTIF_ZONE_AFFICHEE`, inchangé), et
  la nouvelle décomposition par type est exposée dans `st.X.byType` pour
  que le rapport (et un futur lot UI) puisse vérifier la cohérence
  type/signature sans dupliquer de logique.

### 9.2 — Blessures en combat

`ANCRE: P8_L9_BLESSURES` (`engine-combat.js`). Trois blessures, chacune
dégradant **un canal précis**, jamais un malus global, et pouvant, dans
les cas extrêmes, terminer le combat via une méthode de victoire dédiée
(`'Blessure'`) :

| Blessure | Déclencheur | Canal dégradé | Mult. | Chance de fin immédiate |
|---|---|---|--:|--:|
| Main cassée | coup lourd de son propre auteur, amplitude ≥ 15 | `power` | ×0.55 | 10% |
| Genou lâché | scramble réel au sol (`transitioned`) | `takedown` + `footwork` | ×0.55 | 12% |
| Arcade fermée | ≥2 coupures déjà ouvertes | `composure` + `footwork` | ×0.85 | — (voir examen médical) |

- **Main cassée** : risque porté par l'**auteur** du coup lourd, jamais sa
  cible — cohérent avec la réalité du sport. Dégrade `power` (canal
  autrement jamais recalculé par tick, cf. `basePowerA`/`basePowerB`
  capturés une fois, comme `baseFootworkA` etc. pour les dégâts
  progressifs de Lot 2/P7).
- **Genou lâché** : indépendant de qui est dessus/dessous (un scramble met
  les deux à l'épreuve).
- **Arcade fermée** : liée directement au compteur de coupures déjà
  existant (§9.1/Lot 2 P7) — un combattant qui encaisse trop de coupures
  voit sa vision se troubler (composure/footwork), avant même d'atteindre
  le seuil de l'arrêt médical.
- `isKOMethod('Blessure')` → `true` (comme `'Arrêt médical'`, extension du
  point de vérité existant plutôt qu'un second système — CLAUDE.md §8) ;
  `isDecisionLike('Blessure')` → `false`. `pickFinishMove()`/l'arène
  (`ui-09-arena.js`) reçoivent le même repli explicite que
  `'Disqualification'` (nom de mouvement vidé, flavor dédié).
- **Aucun impact sur `f.attrs`** : la dégradation est purement locale à
  `simulateFight()` (comme `chinVulnA`/`chinVulnB`, Lot 2/P7) — une main
  cassée en combat n'use jamais la fiche du combattant à vie.

### 9.3 — Examen médical entre les rounds

`ANCRE: P8_L9_EXAMEN_MEDICAL` (`engine-combat.js`). Nouveau **point de
contrôle**, distinct de l'arrêt médical mi-round déjà implémenté (Lot 2/P7) :
après chaque round non-final, si un combattant porte ≥1 coupure ou une
blessure, le médecin l'examine. `ringsideExamStopChance(cuts, hasInjury)`
(fonction pure) calcule la probabilité d'arrêt, plafonnée à 0.5 — jamais un
second système de gravité parallèle à `CUT_SEVERE_THRESHOLD` : mêmes
compteurs, nouveau moment de lecture. Réutilise les méthodes de victoire
**existantes** (`'Arrêt médical'` pour une coupure, `'Blessure'` pour une
blessure sans coupure sévère associée) plutôt que d'en inventer une
troisième.

### 9.4 — Rythme par round

`ANCRE: P8_L9_RYTHME_ROUND` (`engine-combat.js`). `paceMultiplier(t,
roundLen, lagging)`, fonction pure : phase d'observation les 35 premières
secondes (×0.80→×1.0), sursaut de fin de round les 40 dernières (×1.18),
accélération supplémentaire dans les 30 dernières secondes pour le
combattant mené aux points (×1.22 en plus) — lu sur les totaux de juges
**déjà accumulés** des rounds précédents (`j1A+j2A+j3A` vs `j1B+j2B+j3B`,
calculé une fois par round dans `simulateFight`), jamais une variable
nouvelle. Nul au round 1 (aucun total accumulé) : le round 1 ne joue donc
plus « exactement comme le round 5 », exactement le symptôme du plan.
Appliqué uniquement au volume de frappe debout (`offA`/`offB`), symétrique
pour l'ouverture/le sursaut (identique aux deux combattants), donc
neutre en moyenne sur un round complet — même logique que `burstFactor()`
(Lot 4/P7).

---

## 2. Mesures — critères d'acceptation du lot 9

### 2.1 Répartition des frappes par type (§9.1)

Sur 12 000 combats (`monte-carlo-combat.js`, section 3c) :

| Style | Poings | Coude | Genou | Kick jambe/corps/tête | GNP |
|---|--:|--:|--:|--:|--:|
| boxer | **83.2%** | 0.2% | 0.2% | 11.3/1.9/1.8% | 0.5% |
| kickboxer | 77.1% | 0.5% | 0.6% | 13.1/2.8/2.8% | 1.5% |
| muayThai | 69.7% | 3.2% | **4.2%** | 10.4/2.3/2.2% | 7.2% |
| karate | 79.0% | 0.1% | 0.0% | 13.4/2.8/2.8% | 0.2% |
| wrestler | 69.4% | **4.8%** | 1.3% | 8.8/1.2/1.3% | 12.9% |
| bjj | 79.0% | 1.4% | 0.4% | 10.5/1.5/1.5% | 5.2% |
| sambo | 73.0% | 3.4% | 2.1% | 9.1/1.2/1.2% | 9.6% |
| mma | 77.6% | 1.2% | 0.7% | 11.4/2.2/2.1% | 3.8% |

✅ **Le muay-thaï est le premier utilisateur de genoux** (4.2%, devant
sambo 2.1% et tous les autres < 1.3%) — critère d'acceptation direct.
✅ **La boxe a la part de poings la plus haute** (83.2%, devant bjj/karate
à 79.0%) et la part de coude/genou la plus basse du jeu (0.2%/0.2%).

**Écart honnête avec « quasi exclusivement »** : `kickRatioA`/`kickRatioB`
(Lot 2/2026, inchangé par ce lot) imposent un **plancher** de 10% de kicks
même à attribut `kick` minimal — un boxeur jette donc mécaniquement ~11%
de low kicks, jamais 0%. Ce plancher préexiste à ce lot (zone de code non
touchée, pour ne pas rouvrir l'équilibrage L8) ; le lot 9 ne fait que le
**rendre visible** dans les statistiques pour la première fois. Signalé
ici plutôt que masqué.

### 2.2 Coupures par source (§9.1)

Sur 12 000 combats :

| Source | Combats | Part |
|---|--:|--:|
| Coude | 2 984 | **60.9%** |
| Choc de tête | 1 232 | **25.1%** |
| Coup lourd | 683 | **13.9%** |

✅ **Ordre respecté** : coude > choc de tête > coup lourd, exactement
l'ordre de contribution exigé par le plan.

### 2.3 Blessures en combat (§9.2)

Sur 12 000 combats (24 000 côtés combattant) :

- **218 blessures** observées (0.91% des côtés combattant/combat,
  0.018 par combat en moyenne) — décomposition : arcade fermée très
  majoritaire (liée au volume de coupures déjà en place depuis Lot 2/P7),
  main cassée et genou lâché nettement plus rares (mesurés à l'unité sur
  cet échantillon, confirmés > 0 sur l'échantillon dédié plus large des
  tests, cf. §4).
- **24 combats terminés par blessure** (0.200% des combats) — soit
  **11.0% des blessures observées**, la grande majorité (89%) dégradant
  sans terminer le combat, conforme à « la majorité des examens doivent
  laisser continuer »/« peut, dans les cas extrêmes, terminer le combat ».

### 2.4 Examen médical entre les rounds (§9.3)

- **3 972 examens** sur 12 000 combats (0.331 par combat).
- **261 arrêts** classés `'Arrêt médical'`/`'Blessure'` toutes causes
  confondues (mi-round Lot 2/P7 **et** examen entre les rounds Lot 9,
  indissociables sans instrumentation supplémentaire) — 2.17% des combats.
  Un test dédié (`P8_L9_EXAMEN_MEDICAL`, `tests/regressionFixes.test.js`)
  isole spécifiquement `res.examCount` et confirme statistiquement que
  le nombre d'arrêts reste **très inférieur** au nombre d'examens sur un
  échantillon de combattants qui saignent abondamment : la majorité des
  examens laissent donc bien continuer.

### 2.5 Rythme par round (§9.4)

Comparaison A/B à seed identique (`20260905`, 12 000 combats), rythme
actif contre rythme neutralisé (`win.paceMultiplier = () => 1`, aucune
autre ligne du moteur touchée — même code, un seul levier coupé) :

| | Frappes des 30 dernières secondes | Frappes debout totales | Part |
|---|--:|--:|--:|
| Rythme actif (Lot 9) | 54 490 | 688 437 | **7.92%** |
| Rythme neutralisé | 45 486 | 687 753 | 6.61% |
| **Écart** | | | **+1.30 point (+19.7% relatif)** |

✅ **Hausse mesurable**, avec une méthodologie A/B directe (même seed,
même code, un seul levier coupé) plutôt qu'une comparaison approximative
contre `baseline-P8.md` qui ne mesurait pas cette métrique (elle
n'existait pas avant ce lot). Le volume total de frappes debout reste
quasiment stable entre les deux runs (688 437 vs 687 753, +0.1%) : le
mécanisme redistribue l'intensité dans le temps, il ne gonfle pas le
volume moyen — cf. §9.4, même logique que `burstFactor()` (Lot 4/P7).

---

## 3. Non-régression — lots 6, 7, 8 et P7 L2-L4

Comparé à `lot8-allonge-gabarit-garde.md` (état « après lot 8 »), sur
12 000 combats au seed identique :

| Métrique | Après lot 8 | Après lot 9 | Δ |
|---|--:|--:|--:|
| Décisions partagées (part des décisions/nuls) | 4.6% | 4.2% | −0.4 pt (toujours < 15%, critère L3/P7) |
| Relances debout arbitre | 1 018 | 927 | −91 (bruit — nouveaux tirages `rnd()` ajoutés plus tôt dans chaque tick, décalent le flux partagé, cf. note méthodologique ci-dessous) |
| Disqualifications | 8 (0.067%) | 4 (0.033%) | bruit (petits effectifs, déjà noté ainsi par `lot8-allonge-gabarit-garde.md` pour son propre delta 4→8) |
| Dégâts cumulés (moy/σ/p50/p90/p99/max) | 11.2/10.0/8/25/46/84 | 11.0/9.8/8/25/45/94 | stable (référence L2/P7) |
| Invariants mathématiques | 0 violation | 0 violation | inchangé |

**Note méthodologique (décalage du flux `rnd()`)** : ce lot ajoute des
dizaines de nouveaux tirages aléatoires par combat (classification de
type, blessures, chocs de têtes, examen médical) — mécaniquement, cela
décale la position de chaque tirage ultérieur dans le flux seedé partagé,
exactement le phénomène déjà documenté par `lot8-allonge-gabarit-garde.md`
pour son propre écart de disqualifications (4→8, lot7→lot8). Toutes les
métriques ci-dessus restent dans le même ordre de grandeur que les
lots précédents ; aucune n'indique une dérive structurelle.

### Matrice 8×8 EQUAL-OVERALL ±2 (référence L4/P7, `matchup-matrix.js`, seed 20260905, 2000 combats/cellule)

| Style | Après lot 8 | Après lot 9 | Δ |
|---|--:|--:|--:|
| boxer | 50.6% | 50.4% | −0.2 pt |
| kickboxer | 52.4% | 51.9% | −0.5 pt |
| muayThai | 51.8% | **53.0%** | **+1.2 pt** |
| karate | 49.6% | 49.4% | −0.2 pt |
| wrestler | 48.1% | 47.7% | −0.4 pt |
| bjj | 50.8% | 50.8% | 0.0 pt |
| sambo | 51.8% | 52.3% | +0.5 pt |
| mma | 48.0% | 48.1% | +0.1 pt |

⚠️ **muayThai touche exactement la borne haute de la bande (53.0%),
sans la dépasser.** Explication plausible et cohérente avec le
mécanisme : le muay-thaï a le profil clinch le plus lourd du jeu
(`STYLE_PROFILE.muayThai.clinchDmg=1.35`, le plus haut), donc reçoit
mécaniquement la plus grande part d'élbow/genou classés par ce lot — et
donc la plus grande part des nouvelles opportunités de coupure au clinch
(§9.1), qui alimentent l'arrêt médical/l'examen entre les rounds. Un
avantage de finition cohérent avec l'identité du style (« le clinch de
plat-ventre du muay-thaï est historiquement ce qui étouffe... et coupe »),
pas un artefact aléatoire — mouvement du même ordre de grandeur que le
maximum déjà observé lot7→lot8 (1.1 pt, kickboxer). **À surveiller au lot
10** si un axe supplémentaire venait à l'amplifier encore.

Cellules ≥60/40 héritées de P7/L4 (les mêmes que `lot8-allonge-gabarit-garde.md` §3.1) :

| Cellule | Après lot 8 | Après lot 9 | Δ |
|---|--:|--:|--:|
| muayThai vs wrestler | 62.2% | 62.8% | +0.6 pt |
| wrestler vs muayThai | 40.8% | 39.9% | −0.9 pt |
| bjj vs wrestler | 60.2% | 60.5% | +0.3 pt |
| wrestler vs bjj | 37.5% | 40.3% | **+2.8 pt** |

✅ **Les quatre cellules restent nettement asymétriques** (aucune ne
retombe vers 50/50) — mouvement maximal 2.8 pt (wrestler vs bjj),
supérieur aux deltas mesurés lot7→lot8 pour ces mêmes cellules (jusqu'à
1.3 pt), mais dans le même sens que la tendance déjà notée par le lot 8
(un resserrement, pas un élargissement) : `bjj`/`muayThai` contre
`wrestler` sont précisément les paires où le temps de sol/clinch est le
plus élevé (empreinte par style, §2.1 ci-dessus : wrestler 12.9% de GNP,
le plus haut du jeu), donc les plus exposées aux nouveaux mécanismes de
coupure/blessure qui y vivent. **Aucune inversion de sens, aucune sortie
de la bande ≥60/40.**

✅ **Matrice 8×8 inchangée dans ses grandes lignes** (critère d'acceptation
direct du lot 8, reconduit ici) : confirmé.

---

## 4. Fichiers modifiés/créés

- **`engine-combat.js`** — cœur du lot : taxonomie de frappes
  (`STRIKE_CUT_MULT`, `standingStrikeMix()`), blessures (constantes
  `INJURY_*`, fermetures `tryEyeInjury`/`tryHandFracture`/`tryKneeInjury`),
  examen médical (`ringsideExamStopChance()`), rythme (`paceMultiplier()`),
  plus l'instrumentation associée (`st.X.byType`, `st.X.cutSrc`,
  `st.X.lateSig`, `res.injuriesA/B`, `res.examCount`). Toutes les nouvelles
  ANCREs portent le préfixe `P8_L9_*`.
- **`engine.js`** — `isKOMethod()` étendu pour reconnaître `'Blessure'`
  (extension du point de vérité existant, comme pour `'Arrêt médical'`).
- **`ui-09-arena.js`** — label d'arène pour la méthode `'Blessure'`
  (`ANCRE: P8_L9_BLESSURES`), et repli pour ne pas jouer l'animation
  d'impact sur un beat d'examen médical qui ne termine pas le combat
  (`ANCRE: P8_L9_EXAMEN_MEDICAL`).
- **`tools/monte-carlo-combat.js`** — section 3c (répartition par type) et
  section 6 (blessures/examen/rythme) ajoutées au rapport, purement
  additif.
- **`tests/regressionFixes.test.js`** — 10 tests ajoutés (voir §5).
- **`CLAUDE.md`** — §7 (compte de tests) et §9 (correction d'un écart
  préexistant sur le fichier le plus gros du dépôt, voir §6 ci-dessous).
- **`tools/reports/lot9-taxonomie-blessures-medecin-rythme.md`** — ce
  rapport.

Aucune modification du format de sauvegarde : les blessures/examens sont
purement locaux à `simulateFight()` (comme `chinVulnA`/les blessures
n'affectent jamais `f.attrs`), aucun nouveau champ persistant sur `G.f` ou
un combattant du roster. `migrate()`/`SAVE_VERSION` (4) inchangés.

---

## 5. Tests ajoutés (`tests/regressionFixes.test.js`)

1. `P8_L9_TAXONOMIE_FRAPPES` — `standingStrikeMix()` ne propose jamais
   coude/genou, fractions sommant à 1 (a débusqué et corrigé un vrai bug
   d'implémentation, voir §7).
2. `P8_L9_TAXONOMIE_FRAPPES` — le muay-thaï est le premier utilisateur de
   genoux sur un échantillon statistique.
3. `P8_L9_TAXONOMIE_COUPURES` — ordre coude > choc de tête > coup lourd.
4. `P8_L9_BLESSURES` — `'Blessure'` classée KO/TKO, jamais décision.
5. `P8_L9_BLESSURES` — main cassée/genou lâché/arcade fermée surviennent,
   au moins un combat se termine par blessure.
6. `P8_L9_BLESSURES` — une main cassée dégrade `power` sans jamais
   modifier `f.attrs` à vie.
7. `P8_L9_EXAMEN_MEDICAL` — `ringsideExamStopChance()` minoritaire,
   croissante, plafonnée.
8. `P8_L9_EXAMEN_MEDICAL` — l'examen survient et laisse majoritairement
   continuer sur un échantillon de combattants qui saignent.
9. `P8_L9_RYTHME_ROUND` — `paceMultiplier()` : ouverture réduite, sursaut
   de fin de round, relance uniquement pour le combattant mené.
10. `P8_L9_RYTHME_ROUND` — neutraliser le rythme fait redescendre la part
    de frappes des 30 dernières secondes (A/B).

**`npm run check` final** :
```
# tests 111
# suites 0
# pass 111
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
(101 tests avant ce lot + 10 nouveaux ; `npm run lint` : 0 erreur ;
`npm run lint:content` : 3 signalements, tous préexistants et hors
périmètre — 3 occurrences de « MAIN EVENT », déjà documentées au §9 de
`CLAUDE.md`, 0 nouveau signalement introduit par ce lot.)

---

## 6. Écarts constatés entre `CLAUDE.md` et l'état réel du dépôt

`CLAUDE.md` §9 affirmait que `ui-06-career-screens.js` (~1199 lignes) est
« le plus gros fichier du dépôt » — c'était déjà inexact **avant** ce lot :
`engine-combat.js` faisait 1943 lignes avant le lot 9 (et en fait 2340
après), largement devant `ui-06-career-screens.js`. Corrigé dans ce
document (§9) : `ui-06-career-screens.js` reste le plus gros fichier
**côté UI**, mais `engine-combat.js` est de très loin le plus gros fichier
du dépôt tous fichiers confondus, et le lot 9 l'a encore fait grossir de
~400 lignes.

---

## 7. Un bug trouvé et corrigé pendant ce lot

`standingStrikeMix()` soustrayait `spinShare` deux fois (une fois dans
`punchShare`, une seconde fois implicitement dans `headKick = kickShare -
spinShare`) : les fractions retournées pour la zone tête ne sommaient
qu'à `1 - spinShare` au lieu de 1, jusqu'à 5% de frappes « perdues »,
jamais classées dans aucun type. Trouvé par le test dédié
(`P8_L9_TAXONOMIE_FRAPPES`, premier de la liste ci-dessus) avant tout
commit, jamais en production — documenté et corrigé sur place
(`ANCRE: CORRECTIF_TAXONOMIE_MIX_SOMME`, `engine-combat.js`) plutôt que
silencieusement ; n'affecte que la classification statistique
(`st.X.byType`), jamais les dégâts/points/score réels d'un combat (déjà
calculés indépendamment, avant que cette fonction ne soit appelée).

---

## 8. Dette et pistes pour le lot 10

- Le plancher de 10% de kicks (`kickRatioA`/`kickRatioB`, préexistant)
  limite à quel point la boxe peut devenir « quasi exclusivement » aux
  poings dans les statistiques — un futur ajustement de ce plancher est
  hors périmètre de ce lot (risquerait de rouvrir l'équilibrage L8) mais
  reste une piste si un futur lot veut pousser plus loin l'identité de
  style par la frappe.
- `muayThai` termine ce lot à la borne haute de la bande 47-53%
  (EQUAL-OVERALL) — le lot 10 (adaptabilité) doit vérifier qu'aucun de ses
  propres ajustements ne le pousse au-delà, conformément à son critère
  « aucun style hors de la bande 47-53% en moyenne après réglage ».
- Le genou lâché reste la plus rare des trois blessures (mesurée à
  l'unité sur l'échantillon dédié de test) — cohérent avec « la majorité
  des blessures ne terminent pas le combat », mais si un futur audit
  souhaite le rendre plus visible, le levier est `INJURY_KNEE_CHANCE`
  (`engine-combat.js`), isolé et documenté.
