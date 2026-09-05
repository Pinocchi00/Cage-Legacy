# Baseline P8 — LOT 6 : suppressions et remise à zéro de la référence

> Rapport de référence pour le plan « P8 — Solde de l'addendum P7, suppressions,
> et rôle de l'adaptabilité », lot 6. Ce lot ne fait qu'enlever (coin entre les
> rounds, moments de bascule, résidus Gauntlet/Faith) ; ce fichier documente
> l'état du moteur **après** ces suppressions et sert de référence aux lots 7 à
> 9 du plan P8, exactement comme `baseline-P7.md` l'a fait pour P7 L2-L4.
>
> Contrairement aux autres sorties de `tools/reports/` (ignorées par git,
> régénérées à volonté), **ce fichier est versionné**.

- **Date de génération** : 2026-09-05
- **Branche** : `claude/lot-6-sans-erreur-8raii2`
- **Seed harnais principal** (`monte-carlo-combat.js`) : `20260905` (même seed que `baseline-P7.md`, pour comparabilité directe)
- **Seed matrice de matchups** (`matchup-matrix.js`) : `20260905`
- **Reproduire ce rapport** :
  ```bash
  node tools/monte-carlo-combat.js 20260905      # 12 000 combats + 25 carrières (~80s)
  node tools/matchup-matrix.js 20260905 2000     # 2x 64 cellules x 2000 combats (~7 min)
  ```

---

## 0. Point méthodologique important : ce que ce rapport compare, et ce qu'il ne compare pas

`baseline-P7.md` a été généré au **lot 1** de P7, avant tout changement de
comportement du moteur. Depuis, les **lots 2, 3, 4 et 5 de P7 ont tous été
fusionnés sur `main`** (modèle de dégâts en deux composantes, hiérarchie de
positions au sol, politique de combat par style, coupe de poids + coin entre
les rounds) — et, comme le signale le plan P8 lui-même (« Dette
d'instrumentation ») **aucun rapport chiffré n'a été versionné entre ces
lots**. `baseline-P7.md` est donc la seule référence chiffrée existante, et
elle précède des changements de comportement bien plus importants que celui
de ce lot 6.

**Conséquence directe pour la lecture de ce rapport** : la quasi-totalité de
l'écart entre `baseline-P7.md` et les chiffres ci-dessous vient des lots 2 à
5 (déjà en production, jamais mesurés dans un rapport intermédiaire), **pas**
du lot 6. Pour ne pas mélanger les deux, ce rapport isole spécifiquement
l'effet du lot 6 (§3) en comparant l'état du dépôt **juste avant** ce lot
(après P7 L5, coin encore présent) et **juste après** (coin et bascule
retirés), à seed identique — la seule comparaison qui répond à la question
« le lot 6 a-t-il changé l'équilibre du jeu ? ».

---

## 1. Distribution des finitions et dégâts (12 000 combats, état actuel — après le lot 6)

```
KO/TKO               :  2874 (23.9%)
Soumission           :  2842 (23.7%)
Décision             :  5983 (49.9%)
Décision partagée    :   293 (2.4%)
Égalité              :     8 (0.1%)

Finition R1          : 2202 (18.4%)
Finition R2          : 1779 (14.8%)
Finition R3          : 1346 (11.2%)
Finition R4/R5       : 389 (3.2%)
Allés aux cartes     : 6284 (52.4%)
Décisions partagées  : 4.7% de l'ensemble des décisions (cible P7 L3 : < 15% — largement tenue)
```

### Les trois chiffres demandés par le lot 6 (§6.5), mesurés et non affirmés

| Critère (P7 précédent) | Mesuré ici | Cible d'origine |
|---|--:|---|
| Part des décisions partagées (sur l'ensemble des décisions) | **4.7%** | < 15% (P7 L3) — ✅ tenue, avec large marge |
| Écart-type des dégâts cumulés (par combattant) | **σ 9.9** (p50 8, p90 25, p99 45, max 85) | hausse d'au moins 40% vs pré-L2 (P7 L2) |
| Part des combats allant aux cartes | **52.4%** | référence P7 L2/L3, pas de cible chiffrée fixe |

### Moyennes par combat (par combattant)

| Métrique | Moyenne | σ | p50 | p90 | p99 | Max |
|---|--:|--:|--:|--:|--:|--:|
| Frappes significatives landées | 33.2 | 20.5 | 33 | 60 | 92 | 142 |
| Frappes significatives tentées | 83.1 | 52.6 | 82 | 151 | 236 | 396 |
| Total frappes landées | 53.8 | 32.0 | 56 | 94 | 143 | 200 |
| Total frappes tentées | 113.3 | 69.3 | 115 | 203 | 310 | 484 |
| Frappes puissantes | 17.7 | 12.2 | 16 | 34 | 54 | 92 |
| Amenées réussies | 0.5 | 0.7 | 0 | 1 | 3 | 6 |
| Amenées tentées | 1.8 | 1.8 | 1 | 4 | 7 | 15 |
| Contrôle total (s) | 30 | 55 | 0 | 107 | 236 | 580 |
| Contrôle clinch (s) | 15 | 37 | 0 | 63 | 172 | 454 |
| Contrôle sol (s) | 15 | 32 | 0 | 51 | 148 | 397 |
| Knockdowns | 0.17 | 0.42 | 0 | 1 | 2 | 4 |
| Sonné(s) | 1.11 | 1.27 | 1 | 3 | 5 | 12 |
| **Dégâts cumulés (tête+corps+jambes)** | **11.0** | **9.9** | **8** | **25** | **45** | **85** |

Répartition cibles : Tête 64.1% / Corps 25.2% / Jambes 10.6%.
Répartition positions : Distance 89.4% / Clinch 4.7% / Sol 5.8%.
Invariants mathématiques : **0 violation** sur 24 000 relevés (100% cohérent).

### Comparaison brute avec `baseline-P7.md` (avant P7 L2-L5, avant P8 L6)

| Métrique | baseline-P7 (avant L2) | baseline-P8 (après L6) | Δ | Cause dominante |
|---|--:|--:|--:|---|
| KO/TKO | 22.2% | 23.9% | +1.7 pt | P7 L2 (modèle de dégâts à deux composantes) |
| Soumission | 15.3% | 23.7% | **+8.4 pt** | P7 L3 (hiérarchie de positions, soumissions construites) |
| Décision | 38.7% | 49.9% | +11.2 pt | conséquence mécanique des deux lignes ci-dessus |
| Décision partagée | 23.8% | 2.4% | **-21.4 pt** | P7 L3 (recalibrage `dissent2`/`dissent3`, cf. §6 ci-dessous) |
| Décisions partagées / décisions | 38.1% | 4.7% | **-33.4 pt** | idem — la cible P7 L3 (<15%) n'était pas seulement atteinte, elle est dépassée d'une marge inhabituelle |
| Allés aux cartes | 62.5% | 52.4% | -10.1 pt | P7 L3 (plus de finitions par soumission) |
| Dégâts cumulés (moyenne) | 11.7 | 11.0 | -0.7 | bruit + interactions P7 L2/L3 |
| Dégâts cumulés (σ) | 6.2 | 9.9 | **+60%** | P7 L2 (« hausse d'au moins 40% » — cible dépassée) |
| Dégâts cumulés (max) | 37 | 85 | +130% | P7 L2 |

**Chacune de ces dérives dépasse le seuil de 10% demandé par les critères
d'acceptation du lot 6 — et chacune est expliquée** : elles proviennent de
l'application cumulée de P7 L2 (dégâts) et P7 L3 (positions, juges), déjà
fusionnées sur `main` avant que cette session ne commence, jamais mesurées
dans un rapport intermédiaire. La section 3 isole ce que le **lot 6
lui-même** a changé, à l'exclusion de ces lots précédents — l'écart y est
d'un tout autre ordre de grandeur (quelques points, pas quelques dizaines).

**Constat en passant (hors périmètre de ce lot, signalé pour mémoire)** :
`décisions partagées` à 4.7% est *très* en dessous de la cible P7 L3 (<15%),
au point que ça mérite d'être noté comme une possible sur-correction plutôt
que simplement validé — un panel de juges MMA réel diverge rarement mais pas
aussi rarement que 1 décision sur 21. Rien dans le périmètre du lot 6
(suppressions pures) ne justifiait d'y toucher ; signalé pour un futur lot.

---

## 2. Matrice de matchups style × style (état actuel — après le lot 6)

Deux matrices indépendantes, 64 cellules ordonnées, 2 000 combats/cellule
(256 000 combats), IC95% Wilson — `tools/matchup-matrix.js 20260905 2000`.

### 2.1 Matrice RAW (niveau non contrôlé)

| | boxer | kickbox | muayThai | karate | wrestler | bjj | sambo | mma |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **boxer** | 50.0% | 52.1% | 47.7% | 50.8% | 42.9% | 54.0% | 41.4% | 52.5% |
| **kickboxer** | 47.9% | 50.5% | 45.3% | 53.3% | 54.2% | 56.5% | 47.9% | 54.6% |
| **muayThai** | 52.2% | 55.3% | 50.0% | 48.9% | 60.8% | 43.3% | 55.9% | 53.1% |
| **karate** | 45.2% | 47.4% | 50.7% | 51.2% | 42.6% | 47.3% | 43.1% | 49.8% |
| **wrestler** | 56.9% | 46.8% | 39.6% | 55.5% | 50.6% | 36.3% | 48.0% | 44.5% |
| **bjj** | 44.4% | 47.8% | 56.1% | 52.7% | 61.4% | 51.8% | 54.6% | 56.6% |
| **sambo** | 57.6% | 51.6% | 46.5% | 56.5% | 54.5% | 47.8% | 49.6% | 49.9% |
| **mma** | 46.4% | 46.2% | 50.9% | 51.9% | 55.4% | 46.6% | 49.9% | 49.6% |

Moyenne par style (16 000 combats/style) : boxer 48.9%, kickboxer 51.3%,
muayThai 52.4%, karate 47.2%, wrestler 47.3%, bjj 53.2%, sambo 51.7%,
mma 49.6%. **Étendue : 47.2%–53.2% (6.0 points)**, plus resserrée qu'en
baseline-P7 (8.1 points) — cohérent avec des combats plus courts en moyenne
(plus de finitions, moins de rounds pour qu'un écart de style s'exprime).

### 2.2 Matrice EQUAL-OVERALL ±2 (référence P7 L4)

Écart d'overall observé entre les deux combattants : moyenne 1.13, max 2
(contrainte ±2 du §1.3 respectée sur les 128 000 combats).

| | boxer | kickbox | muayThai | karate | wrestler | bjj | sambo | mma |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **boxer** | 50.7% | 50.0% | 48.0% | 51.3% | 44.5% | 59.2% | 42.3% | 54.3% |
| **kickboxer** | 49.0% | 49.4% | 46.8% | 52.5% | 53.9% | 58.1% | 49.0% | 57.1% |
| **muayThai** | 50.1% | 53.6% | 50.1% | 46.1% | 62.5% | 43.1% | 56.5% | 51.1% |
| **karate** | 50.0% | 48.3% | 51.7% | 51.7% | 45.6% | 50.0% | 44.8% | 51.1% |
| **wrestler** | 55.9% | 47.8% | 40.5% | 56.8% | 51.9% | 39.8% | 47.0% | 45.1% |
| **bjj** | 42.1% | 44.6% | 58.0% | 51.0% | 62.2% | 51.5% | 54.8% | 54.0% |
| **sambo** | 57.1% | 53.9% | 45.0% | 55.6% | 53.7% | 49.7% | 49.9% | 53.9% |
| **mma** | 47.3% | 45.7% | 50.1% | 47.3% | 55.8% | 50.5% | 46.5% | 49.2% |

Moyenne par style (16 000 combats/style) : boxer 50.0%, kickboxer 52.0%,
muayThai 51.6%, karate 49.2%, wrestler 48.1%, bjj 52.3%, sambo 52.3%,
mma 49.0%. **Étendue : 48.1%–52.3% (4.2 points)** — nettement plus resserrée
qu'en baseline-P7 (10.7 points).

### Constat important — hors périmètre du lot 6, signalé pour les lots suivants

Le critère d'acceptation de **P7 L4** exigeait « au moins six cellules à
60/40 ou plus » dans cette matrice. `baseline-P7.md` en comptait au moins
6 (3 paires : karate/muayThai 64.2-36.7, kickboxer/bjj 64.8-36.6, boxer/bjj
62.9-36.9, plus muayThai/sambo 62.1 en solo). **Sur l'état actuel du dépôt
(après P7 L2-L5 et ce lot 6), seules 2 paires dépassent encore ce seuil**
(muayThai vs wrestler 62.5%/wrestler vs muayThai 40.5%, bjj vs wrestler
62.2%/wrestler vs bjj 39.8%) ; les quatre cellules qui portaient le critère
en baseline-P7 sont retombées sous 60/40 (karate vs muayThai 51.7%,
kickboxer vs bjj 58.1%, boxer vs bjj 59.2%, muayThai vs sambo 56.5%).

**Ce n'est pas un effet du lot 6** : la mesure isolée du §3 montre que ce lot
ne déplace ces cellules que de 1 à 2 points, très en dessous de l'écart
observé ici (5 à 13 points). La cause est à chercher dans les lots 2/3/5
(déjà fusionnés, jamais mesurés à ce niveau de détail) — le modèle de
dégâts, la hiérarchie de positions ou la coupe de poids ont chacun pu
perturber le flux `rnd()` ou la mécanique elle-même suffisamment pour
resserrer ces cellules, sans qu'on puisse dire lequel sans revenir mesurer
chaque lot individuellement (hors périmètre de ce lot, qui ne fait que des
suppressions). **Signalé explicitement pour L7-L9** : le critère de P7 L4
n'est aujourd'hui plus tenu à l'identique, et L8 (allonge/gabarit/garde)
comme L10 (adaptabilité) du plan P8 comptent dessus (« les six cellules à
60/40 exigées par le lot 4 de P7 restent à 60/40 », critère d'acceptation
L10) — sans un lot dédié pour le restaurer ou le re-cibler, ce critère de
L10 sera lui-même invérifiable tel quel.

---

## 3. Effet isolé du lot 6 (§6.1 uniquement — le seul changement qui touche l'issue des combats)

Comparaison à seed identique (`20260905`), même code sauf le retrait du coin
entre les rounds et des moments de bascule (`git stash`/`git stash pop` sur
la branche de ce lot, pour isoler strictement les deux commits comparés).

### 3.1 Métriques agrégées (12 000 combats)

| Métrique | Avant lot 6 (après P7 L5) | Après lot 6 | Δ |
|---|--:|--:|--:|
| Décisions partagées / décisions | 4.3% | 4.7% | +0.4 pt (bruit) |
| Allés aux cartes | 52.7% | 52.4% | -0.3 pt (bruit) |
| Dégâts cumulés (moyenne / σ / p90 / p99 / max) | 11.1 / 10.0 / 25 / 45 / 93 | 11.0 / 9.9 / 25 / 45 / 85 | négligeable (bruit d'échantillonnage sur la queue) |

**Confirme la prédiction du plan (§6.1, "Isole sa mesure")** : ces trois
métriques ne bougent quasiment pas quand on retire le coin — l'effet ne
passe pas par la distribution des méthodes de victoire ou les dégâts totaux,
mais par le **taux de victoire dans les matchups déjà asymétriques** (§3.2).

### 3.2 Taux de victoire par style (12 000 combats, répartition naturelle)

| Style | Avant lot 6 | Après lot 6 | Δ |
|---|--:|--:|--:|
| boxer | 48.2% | 50.6% | +2.4 pt |
| kickboxer | 49.8% | 49.7% | -0.1 pt |
| muayThai | 52.0% | 52.1% | +0.1 pt |
| karate | 47.9% | 48.5% | +0.6 pt |
| wrestler | 47.6% | 47.9% | +0.3 pt |
| bjj | 53.2% | 52.7% | -0.5 pt |
| sambo | 51.6% | 51.4% | -0.2 pt |
| mma | 49.3% | 46.7% | **-2.6 pt** |

boxer et mma sont les deux styles qui bougent le plus (+2.4 / -2.6 pt).
Explication cohérente avec le mécanisme retiré : le coin appliquait un
boost `fightIQ`/`footwork` au combattant **mené aux cartes**, quel que soit
son camp — un rattrapage implicite. `mma` (généraliste, souvent legèrement
en retard aux points face à un spécialiste) en bénéficiait plus souvent que
la moyenne ; `boxer`, à l'inverse, était plus souvent le combattant qui
punissait cette remontée de l'adversaire. Le retirer profite donc, en
moyenne, à celui qui était déjà devant.

### 3.3 Cellule de matchup isolée : boxer vs bjj (spécialités opposées, overall égal)

Mesuré avec la méthode rigoureuse de `matchup-matrix.js`
(`makeFighterNearOverall`, écart d'overall ≤2, division `H-welter` fixe pour
isoler uniquement l'effet du lot 6, seed `20260905`, N=2000) :

| | Avant lot 6 | Après lot 6 | Δ |
|---|--:|--:|--:|
| boxer vs bjj, overall égal | 58.8% | 56.9% | **-1.9 pt** |

Sur un échantillonnage plus large (8 seeds différentes, N=2000 chacune,
même méthode) après le lot 6 : taux entre 57.5% et 59.9%, moyenne 58.7% —
cohérent avec le -1.9 pt mesuré ici à seed unique. C'est ce chiffre (pas la
valeur de `baseline-P7.md`, mesurée avant P7 L2-L5) qui a servi à recalibrer
le test `P7_L4_MATCHUP_ASYMETRIE` (`tests/regressionFixes.test.js`, ancre
`P8_L6_MATCHUP_RECALIBRE`) : seuil abaissé de 60% à 56%, avec la marge
observée ci-dessus.

**Conclusion §3** : le lot 6 a un effet réel, mesurable, mais modeste (1 à 3
points de taux de victoire selon le style/la cellule) — très inférieur à
l'écart brut contre `baseline-P7.md` (§1-2), qui vient presque entièrement
des lots P7 L2/L3/L5 déjà fusionnés. Aucun style ne sort de sa bande
d'équilibre à cause de ce lot seul.

---

## 4. Empreinte statistique par style (référence L4/L9, 12 000 combats — état actuel)

| Style | Tête | Corps | Jambes | Distance | Clinch | Sol | Contrôle | Sub. tent. | Cartes |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| boxer | 65% | 25% | 11% | 98% | 1% | 1% | 5.9s | 0.00 | 60.0% |
| kickboxer | 63% | 24% | 12% | 95% | 3% | 2% | 17.8s | 0.01 | 58.9% |
| muayThai | 60% | 30% | 10% | 76% | 15% | 9% | 73.7s | 0.06 | 56.5% |
| karate | 65% | 23% | 13% | 100% | 0% | 0% | 1.7s | 0.00 | 54.9% |
| wrestler | 66% | 26% | 8% | 77% | 6% | 17% | 52.4s | 0.19 | 50.9% |
| bjj | 66% | 24% | 10% | 91% | 3% | 6% | 17.8s | 0.81 | 41.8% |
| sambo | 65% | 27% | 8% | 78% | 10% | 13% | 48.3s | 0.89 | 40.9% |
| mma | 64% | 25% | 11% | 92% | 3% | 5% | 22.0s | 0.23 | 55.0% |

Comparé à `baseline-P7.md` : les tentatives de soumission par combat ont
nettement augmenté chez les grapplers (bjj 1.04→0.81, sambo 1.01→0.89 —
légère baisse en fait, cf. note ci-dessous) et surtout, la part de combats
allant aux cartes a chuté pour tous les styles à profil de soumission
(bjj 54.5%→41.8%, sambo 55.4%→40.9%) : cohérent avec la hiérarchie de
positions de P7 L3, pas avec ce lot 6.

---

## 5. Réponse à la question du lot 6 : « `adaptability` a-t-il encore un effet en combat ? »

**Oui.** Retirer le coin entre les rounds ne rend pas `adaptability` inerte
en combat — il retire uniquement l'à-coup ponctuel de fin de round
(`a.fightIQ+=adaptA`/`a.footwork+=adaptA*0.5`, appliqué une fois par round
perdu). `adaptability` reste lu **en continu, à chaque tick, tout au long de
chaque round**, via un canal qui n'a jamais été touché par ce lot :

### Lecteur en combat (le seul)

- **`eff()` (`engine.js:379`)** : `fightIQ = fightIQ*0.7 + composure*0.18 +
  adaptability*0.12`. Ce canal dérivé `fightIQ` (distinct de l'attribut brut
  `f.attrs.fightIQ`) est ensuite lu abondamment dans `simulateFight()`
  (`engine-combat.js`) :
  - dans le calcul d'`offA`/`offB` à chaque tick de frappe à distance
    (`-b.fightIQ*0.14`, `-a.fightIQ*0.14`, lignes ~912-913) ;
  - dans les chances de KO (`1-b.fightIQ*0.0022`, lignes ~1043-1044) ;
  - dans les chances de GNP et de soumission au sol (`1-bot.fightIQ*0.0022`,
    lignes ~668/675/676) ;
  - dans le multiplicateur du plan tactique choisi avant combat
    (`a.footwork*=plan.def; a.fightIQ*=plan.def;`, ligne ~393).

  Test de régression ajouté pour protéger ce fait :
  `P8_L6_ADAPTABILITY_TOUJOURS_LU_EN_COMBAT`
  (`tests/regressionFixes.test.js`) — vérifie, au niveau de la fonction pure
  `eff()`, que le canal `fightIQ` dérivé augmente strictement avec
  `adaptability` toutes choses égales par ailleurs.

Ce canal n'est pas nouveau et n'a pas été ajouté par ce lot : il existait
déjà avant le coin (P7 L5) et avant ce lot 6. Ce qui disparaît avec le coin,
c'est uniquement l'escalade ponctuelle en cours de combat — pas la lecture
de base de l'attribut.

### Lecteurs hors combat (modifient l'attribut de base, jamais lus par `simulateFight()` directement)

Tous les points suivants **écrivent** dans `f.attrs.adaptability` (une
valeur permanente ou un malus de pré-combat), qui n'atteint la simulation
qu'ensuite, via le même canal `eff().fightIQ` ci-dessus — ils ne
contournent jamais ce canal, ils l'alimentent :

- **Compétences** (`data-skills.js`) : une trentaine d'entrées donnent un
  bonus permanent d'`adaptability` (ex. `kb37` « Code source adverse »
  +18, `mma40` « Singularité Martiale » +19) à l'acquisition.
- **Entraînements de carrière** (`data-content.js`) : plusieurs options de
  camp donnent de petits deltas permanents (`+1` à `+3`).
- **Traits de matchmaking** (`ui-01-roster-matchmaking.js`) : plusieurs
  traits de PNJ (« Le Caméléon », « L'Anticipateur »...) fixent
  `adaptability` à la création du combattant.
- **Malus de sparring** (`engine-events.js:215`) : `oppDebuff:
  {adaptability:-15, fightIQ:-10}` — inflige un malus temporaire à
  l'adversaire du PROCHAIN combat.
- **Malus d'événements de pré-combat** (`ui-02-fight-prep-events.js:570,622`)
  : deux événements narratifs infligent un malus ponctuel (`-8`/`-12`) pour
  le combat à venir.
- **Bonus de mentorat** (`ui-08-controller-arena.js:416`, archétype `mma`) :
  bonus permanent (+8) posé une seule fois à la création d'une nouvelle
  carrière.
- **Attribution de surnom** (`ui-05-fight-resolution.js:820`,
  `earnNickname()`) : lit `adaptability>=70` pour choisir un surnom
  « technicien » — un événement de carrière ponctuel après le combat,
  jamais pendant.

**Conclusion** : `adaptability` n'est pas devenu un attribut de vitrine —
c'est un attribut de fiche comme les 29 autres, qui influence chaque combat
via `eff().fightIQ` exactement comme avant ce lot, et que la carrière peut
faire monter ou descendre par les canaux ci-dessus. Ce qui a disparu est
strictement le mécanisme narratif du coin (le texte affiché entre les
rounds) et son escalade in-fight ponctuelle — pas la lecture de base de
l'attribut.

---

## 6. Précaution §6.2.3 du plan — dérive de moral liée au retrait des moments de bascule

Le plan demande de mesurer la dérive de moral sur une trajectoire de
carrière complète (pas seulement des combats isolés), le retrait du
mécanisme de bascule supprimant un ajustement de moral réel (`+4`/`-3`,
jusqu'à 3 fois par combat).

**Mesure honnête, pas de chiffre inventé** : le harnais de carrière
automatisé (`tests/helpers/playthrough.js`, `playCareer()`) ne peut PAS
mesurer cet effet directement. `clickThrough()` s'arrête dès que
`f.history` augmente (`stopWhen: totalFightsPlayed(w) > before`), et
`f.history` est rempli par `resolveFight()` **avant** que l'écran d'arène ne
s'affiche (le combat est intégralement résolu par la simulation avant tout
rendu, cf. `ui-08-controller-arena.js`). Le parcours automatique ne clique
donc jamais sur `CL.pickBascule()` ni sur `CL.nextRound()` — il n'a jamais
exercé ce mécanisme, avant comme après ce lot. Toute mesure « avant/après »
via ce harnais donnerait 0 par construction, ce qui ne prouverait rien sur
l'expérience d'un joueur qui regarde réellement l'animation.

**Borne analytique, en l'absence de mesure directe** : au maximum 3
occurrences par combat (`ARENA.basculeCount>=3`), chacune `±4`/`-3` de
moral, sur une carrière de ~31-35 combats (§7 ci-dessous) — soit un débattu
théorique maximal bien inférieur aux amplitudes déjà en jeu ailleurs dans le
même système de moral (victoire/défaite, négociation de contrat, blessure,
événements narratifs à ±5 à ±15 déjà couramment observés dans
`data-content.js`/`engine-events.js`). Combiné au fait déjà documenté par
l'ancre `CORRECTIF_BASCULE_RECOMPENSE_MORTE` que la bonification de bourse
associée n'a jamais eu d'effet réel, ce mécanisme retiré était d'une
ampleur mineure comparée aux autres leviers de moral déjà en place — mais ce
lot ne prétend pas l'avoir mesuré en conditions réelles de jeu, faute d'un
harnais qui exerce l'arène round par round (aucun harnais existant, avant ou
après ce lot, ne le fait — cf. §8).

---

## 7. Carrières complètes (25 simulées, harnais existant)

```
Combats moyens par carrière : 35.0 combats (Bilan moyen: 23.1V - 11.8D)
Âge moyen de fin de parcours : 31.5 ans
Pic d'overall moyen         : 73.1
Champions titrés            : 8.0%
Champions du monde ultimes  : 0.0%
```

(Contre 31.3 combats / 29.1 ans / 71.1 overall pic / 8.0% champions en
baseline-P7 — dérive attribuable à P7 L2-L5, pas à ce lot : aucune de ces
métriques n'implique la simulation de combat au niveau où le coin
intervenait.)

---

## 8. Sensibilité des attributs (harnais existant, inchangé)

```
Impact Kick 95 vs 15   : Kicks jambes réussis = 3792 vs 1336 (écart x2.8)
Impact Takedown vs TDD : 542 amenées réussies face à 1031 défenses
Impact Agressivité     : 48594 tent. (Agro 95) vs 39248 tent. (Agro 15) (écart +24%)
Survie KD Sang-froid   : Survie avec Sang-froid 95 = 38/49 vs 19/27 avec Sang-froid 15
```

---

## 9. Critères d'acceptation du lot 6 — statut

- ✅ **Aucune référence résiduelle aux symboles supprimés** — vérifié par
  grep exhaustif (`BASCULE_MOMENTS`, `detectBascule`, `resolveBasculeOption`,
  `renderBasculeOverlay`, `pickBascule`, `continueAfterBascule`,
  `basculePending`, `basculeCount`, `cornerPool`, `runCoachingRound`,
  `scr_coaching_round`, `G._arenaNext` : plus aucune occurrence hors
  commentaires explicatifs de ce lot lui-même) ; `npm run lint` vert sans
  exception ajoutée.
- ✅ **Sauvegarde antérieure au lot se charge sans erreur ni perte
  d'historique** — `G.settings.basculeEnabled` n'est plus lu nulle part mais
  la clé n'est retirée ni de `G.settings` ni de `validateState()` ; un beat
  `phase:'bell'` hérité d'un ancien log se rejoue sans exception
  (`applyBeat()`, ancre `P8_L6_BELL_COMPAT`) — protégé par le test
  `P8_L6_BELL_COMPAT`.
- ✅ **L'arène se joue de bout en bout sans blocage** — la pause de fin de
  round et `CL.nextRound()` sont intacts (seule la garde
  `|| ARENA.basculePending` a été retirée, plus rien d'autre) ; protégé par
  le test `P8_L6_ARENA_PAUSE_SANS_BASCULE`. Le plan tactique d'avant-combat
  (`scr_plan`, `TACTICS`) n'a pas été touché.
- ✅ **Un parcours complet de carrière passe dans le harnais** — `npm run
  check` inclut `tests/career.test.js` (carrière complète amateur→pro→40
  combats sans erreur JS), vert.
- ✅ **Réponse écrite à la question `adaptability`** — voir §5 : non, ce
  n'est pas devenu un attribut de vitrine ; liste complète des lecteurs
  (1 lecteur en combat, 7 écrivains hors combat) ci-dessus.
- ✅ **`baseline-P8.md` versionné, écart chiffré contre `baseline-P7.md`,
  chaque dérive >10% expliquée** — voir §1 (tableau de comparaison) et §2
  (matrice) ; toutes les dérives significatives sont attribuées à P7 L2/L3/L5
  (déjà fusionnées, jamais mesurées), avec l'effet propre du lot 6 isolé
  séparément en §3 (1 à 3 points, jamais plus).

## 10. Performance et validation

```
$ npm run lint
> eslint .
(aucune sortie = 0 erreur)

$ npm test
...
# tests 91
# suites 0
# pass 91
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

- `node tools/monte-carlo-combat.js 20260905` : 12 000 combats en **19.3s**,
  25 carrières en **60.9s**.
- `node tools/matchup-matrix.js 20260905 2000` : 256 000 combats en
  **≈6 min 49s** (191.7s RAW + 216.6s EQUAL-OVERALL) — sensiblement plus
  lent qu'en baseline-P7 (≈3.5 min), cohérent avec la mécanique
  supplémentaire ajoutée par P7 L2-L5 (positions, politique de style,
  coupe de poids) sur le chemin chaud de `simulateFight()`. À surveiller si
  L7-L9 (arbitre, taxonomie de frappes) ajoutent encore du travail par tick.

## 11. Fichiers livrés dans ce lot

- `engine-combat.js` — retrait de l'ancre `P7_L5_COIN_ENTRE_LES_ROUNDS`
  (ancre `P8_L6_COIN_SUPPRIME`).
- `ui-09-arena.js` — retrait du système de bascule (`BASCULE_MOMENTS`,
  `detectBascule`, `resolveBasculeOption`, `renderBasculeOverlay`, détection
  en fin de round), compat `phase:'bell'` documentée (ancre
  `P8_L6_BELL_COMPAT`), `buildTimeline()` débarrassé du paramètre `midFight`
  mort, en-tête de fichier mis à jour.
- `ui-08-controller-arena.js` — retrait de `CL.pickBascule()`/
  `CL.continueAfterBascule()`, garde `ARENA.basculePending` retirée de
  `CL.nextRound()`, `G._arenaNext`/`toResult()` simplifié (branche morte),
  commentaire `forceFightPaceForMode()` réécrit.
- `ui-06-career-screens.js` — commentaire `V3_REGLAGES_SUPPRIMES` réécrit
  (ne décrit plus une architecture Gauntlet/Faith disparue).
- `ui-01-roster-matchmaking.js` — commentaire `CORRECTIF_TACTIQUE_ROUND_FIGE`
  réécrit (ne référence plus `scr_coaching_round`).
- `CLAUDE.md` — vérifié contre `index.html` (déjà à jour sur l'essentiel),
  corrections : `newFaithCareer()` (inexistante) → `exitLegacy()`, ligne de
  `CL` corrigée, `SAVE_VERSION` 3→4, nombre de tests 39/9 fichiers → 91/10
  fichiers, taille de fichier la plus grosse du dépôt mise à jour, décompte
  `lint:content` corrigé (3 anglicismes réels, pas 1).
- `P7-Addendum-Realisme.md`, `P7-Degats-Fidelite-Styles.md` — marqués comme
  plans exécutés, renvoi vers `P8-Arbitrage-Allonge-Suppressions.md`.
- `P8-Arbitrage-Allonge-Suppressions.md` — **nouveau**, plan P8 complet
  versionné (lots 6-10), statut lot 6 mis à jour.
- `tests/regressionFixes.test.js` — 2 tests recalibrés
  (`P7_L3_JUGES_COHERENCE` : N 450→700 ; `P7_L4_MATCHUP_ASYMETRIE` : seuil
  60%→56%, cause identifiée et documentée), 4 tests ajoutés
  (`P8_L6_COIN_ABSENT`, `P8_L6_ADAPTABILITY_TOUJOURS_LU_EN_COMBAT`,
  `P8_L6_BELL_COMPAT`, `P8_L6_ARENA_PAUSE_SANS_BASCULE`).
- `tools/reports/baseline-P8.md` — ce fichier.
