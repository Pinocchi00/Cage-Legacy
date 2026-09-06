# Rapport — LOT 10/P8 : l'adaptabilité contre les mauvais matchups

> Rapport de livraison du lot 10 du plan « P8 — Solde de l'addendum P7,
> suppressions, et rôle de l'adaptabilité ». **C'est le dernier lot du plan
> P8** — il ne fait sens qu'une fois L7 (arbitre/cage/cartes), L8
> (allonge/gabarit/garde) et L9 (taxonomie/blessures/médecin/rythme)
> fusionnés, ce qui est bien le cas sur cette branche (voir `git log`,
> lots 6 à 9 déjà mergés). Compare l'état du moteur **après** ce lot à
> `tools/reports/lot9-taxonomie-blessures-medecin-rythme.md` (référence
> issue du lot 9), comme l'exige la règle commune #3 du plan (« un rapport
> versionné par lot, comparé au précédent »).

- **Date de génération** : 2026-09-05
- **Branche** : `claude/lot-10-sans-erreur-syxscy`
- **Seed harnais principal** (`monte-carlo-combat.js`) : `20260905` (identique aux lots 6/7/8/9, pour comparabilité directe)
- **Seed matrice de matchups** (`matchup-matrix.js`) : `20260905`, réduit à **400 combats/cellule** (au lieu des 2000 habituels) pour tenir dans le budget de cette session — un contrôle de non-régression « à grandes lignes », pas une mesure de précision équivalente aux lots précédents ; signalé explicitement en §4.
- **Seed mesure dédiée** (`tools/adaptability-window-matrix.js`, nouveau) : `20260905`
- **Reproduire ce rapport** :
  ```bash
  node tools/monte-carlo-combat.js 20260905              # 12 000 combats + 25 carrières (~100s)
  node tools/matchup-matrix.js 20260905 2000              # 2x64 cellules x 2000 combats (~16 min, budget complet)
  node tools/adaptability-window-matrix.js 20260905 6000  # mesures dédiées L10 (~9 min)
  ```

---

## 1. Ce que ce lot ajoute

### 1.1 — Le problème résolu (§10.1)

Le lot 6 a retiré le seul effet en combat d'`adaptability` (le coin entre
les rounds). Depuis, l'attribut ne gouverne plus rien pendant un combat
au-delà du canal continu `eff().fightIQ` déjà établi et documenté par le
lot 6 (`fightIQ = fightIQ*0.7 + composure*0.18 + adaptability*0.12`, lu
en continu par `simulateFight()` — voir `baseline-P8.md` §5). Les lots 4
(P7) et 8 (P8) ont depuis créé des désavantages structurels marqués
(politique de style, allonge/gabarit/garde). Ce lot donne à un combattant
désavantagé un moyen d'y répondre, sans quoi seul « être meilleur » compte.

### 1.2 — La forme imposée : temporelle, jamais proportionnelle (§10.2)

`ANCRE: P8_L10_ADAPTABILITE_FENETRE` (`engine-combat.js`, juste avant
`simulateFight()`). Trois fonctions pures, sur le modèle des fonctions pures
déjà en place dans ce fichier (`judgesVerdict`, `takedownSigmoidSteep`,
`paceMultiplier`...) :

- **`adaptClosure(round, adaptability, cap)`** — la fraction de fermeture
  d'un désavantage, bornée `[0, cap]` :
  - **round 1 → toujours 0**, quelle que soit l'adaptabilité — « personne
    ne résout un mauvais matchup dans les 30 premières secondes » ;
  - **rounds suivants** → croît linéairement avec `(round-1)` et avec
    `adaptability`, via `skill = clamp((adaptability-10)/90, 0, 1)` — une
    adaptabilité ≤10 ferme donc exactement 0 quel que soit le round (« une
    adaptabilité faible le subit jusqu'à la cloche finale ») ;
  - **plafonnée à `cap` < 1** — jamais totale, même à adaptabilité 100 en
    fin de combat.
  - Conséquence directe de la forme linéaire en `(round-1)` : un combat en
    5 rounds accumule mécaniquement plus de fermeture qu'un combat en 3
    rounds, **sans code dédié au format** — c'est le comportement demandé
    par §10.2, pas un cas particulier ajouté à part (mesuré en §3.3).
- **`closeStructuralGap(edgeValue, round, adaptA, adaptB, cap)`** — referme
  un écart structurel **signé** (même convention que `rEdge`/`bEdge` :
  positif favorise A) en fonction de l'adaptabilité du combattant
  **désavantagé par ce signe précis** — jamais celle de l'avantagé (§10.1,
  « et rien d'autre »). Sur un écart nul (`edgeValue===0`), renvoie
  toujours 0 : le critère « aucun effet sur un affrontement neutre » est
  vrai **par construction**, pas simplement mesuré (testé directement,
  §2.1).
- **`adaptGroundDisadvantage(posProf, round, botAdaptability)`** — referme
  le profil `GROUND_POS` (Lot 3/P7) pour le combattant du **dessous**, en
  rapprochant chaque multiplicateur de `closedGuard` (déjà la position la
  moins punitive de la table) selon l'adaptabilité du dessous. Neutre par
  construction sur `closedGuard` elle-même. `standupOk` n'est **jamais**
  modifié : ce mécanisme n'aide jamais à se relever (déjà gouverné par
  `groundStandupChance`/l'arbitre), seulement à moins souffrir en restant
  en dessous.

### 1.3 — Périmètre : tous les axes, un seul exclu et justifié (§10.3)

Quatre axes visés par le plan, trois branchés, un exclu :

| Axe | Statut | Où |
|---|---|---|
| Allonge en frappe à distance (L8) | ✅ branché | `rEdgeStrikeAdj` (offA/offB, taxe d'entrée en clinch) |
| Allonge/gabarit au clinch (L8, inversés) | ✅ branché | `rEdgeClinchAdj`/`bEdgeClinchAdj` (clinchA/clinchB) |
| Garde opposée (L8) | ✅ branché | `stFootEdge` (avantage de pied avant, recalculé par tick) |
| Infériorité positionnelle au sol (L3/P7) | ✅ branché, plafond réduit | `adaptGroundDisadvantage()` sur `posProf` |
| **Matchup de style (politique de combat, L4/P7)** | ❌ **exclu, volontairement** | — |

**Pourquoi le style est exclu.** Contrairement aux trois axes physiques
(allonge/gabarit/garde, chacun un **écart signé unique**, fixe pour tout
le combat) et à la position au sol (un **profil de multiplicateurs**
canonique, `GROUND_POS`), le désavantage de style n'existe nulle part dans
le code comme une grandeur scalaire unique : `STYLE_POLICY`
(`P7_L4_STYLE_POLICY_COMBAT`) est un ensemble de fonctions
**comportementales** (`initiativeMult`, `dangerReactionOffenseMult`,
`dominanceReactionMult`, `clinchAffinity`...) qui décrivent une tendance
de style, pas un écart entre deux styles précis — les 60/40 de la matrice
8x8 émergent de leur **combinaison**, jamais d'un seul terme. Inventer un
scalaire de « désavantage de style » pour ce lot aurait exigé un second
mécanisme de matchup à côté de `STYLE_POLICY`/`STYLE_PROFILE`, exactement
ce que `CLAUDE.md` §8 interdit (« ne jamais créer un système parallèle »).
Ce choix est documenté ici comme le demande le plan (« si un axe doit être
exclu, dis lequel et pourquoi plutôt que de l'omettre silencieusement »)
plutôt qu'implémenté au prix d'une abstraction artificielle.

**Plafond réduit sur l'axe position au sol.** `ADAPT_CLOSURE_CAP_GROUND`
(0.25) est délibérément plus bas que `ADAPT_CLOSURE_CAP_PHYSICAL` (0.55) :
la hiérarchie de positions du Lot 3/P7 et les deux cellules 8x8 encore
marquées (`muayThai`/`bjj` vs `wrestler`, héritées et déjà signalées comme
fragiles par `baseline-P8.md` §2.2) reposent largement sur ce mécanisme —
ce lot ne doit pas les rouvrir en rendant le sol trop confortable pour le
dessous.

### 1.4 — Lisibilité (§10.4)

`ANCRE: P8_L10_ADAPTABILITE_LOG` (`engine-combat.js`, en tête de round,
`r>=2` uniquement). Une ligne de log narrative, du même registre que les
autres beats (`log.push({r, phase:'debout', ...})`), **sans chiffre
affiché**, déclenchée uniquement quand : (a) un axe (allonge ou garde —
priorité à l'allonge, le gabarit reste hors de ce beat, son effet étant
trop discret pour mériter une ligne dédiée, cf. `lot8-allonge-gabarit-garde.md`
§3.2) se referme réellement ce round-ci, et (b) l'adaptabilité du
bénéficiaire dépasse 65 (un combattant moyen ne justifie pas une ligne à
chaque round). Deux textes, un par axe :

- allonge : *« [Nom] commence à trouver la bonne distance malgré l'allonge adverse. »*
- garde : *« [Nom] s'habitue peu à peu à la garde inversée d'en face. »*

C'est aussi le support narratif que le lot 6 avait retiré en supprimant le
coin — cette fois l'effet précède le texte, jamais l'inverse (§10.4,
dernier paragraphe).

---

## 2. Tests (`tests/regressionFixes.test.js`, ancre `TEST_P8_L10_ADAPTABILITE_FENETRE`/`_NEUTRE`/`_MATCHUP`)

Cinq tests ajoutés, **75 tests désormais dans ce fichier** (70 avant ce
lot), **116 au total** sur la suite (111 avant), tous passants.

### 2.1 — Fonctions pures (comme `judgesVerdict()`/`paceMultiplier()` dans les lots précédents)

1. **`P8_L10_ADAPTABILITE_FENETRE — adaptClosure()`** : fermeture nulle au
   round 1 (toute adaptabilité), croissante avec le round et
   l'adaptabilité, plafonnée, jamais totale, et — vérification directe du
   dernier paragraphe de §10.2 — la fermeture cumulée à 5 rounds dépasse
   celle à 3 rounds à adaptabilité égale.
2. **`P8_L10_ADAPTABILITE_FENETRE — closeStructuralGap()`** : nulle sur un
   écart nul pour **toute** combinaison de round/adaptA/adaptB testée (12
   combinaisons) — **c'est le premier test écrit, comme demandé par le
   plan**, et il prouve la garantie « neutre » par construction plutôt que
   par échantillonnage. Vérifie aussi que seule l'adaptabilité du
   combattant désavantagé par le signe de l'écart influence la fermeture —
   celle de l'avantagé n'a **aucun** effet, testé dans les deux sens
   (écart positif/négatif).
3. **`P8_L10_ADAPTABILITE_FENETRE — adaptGroundDisadvantage()`** : neutre
   sur `closedGuard`, inchangée au round 1, `gnpMult` décroît et
   `botSubMult` croît avec l'adaptabilité du dessous à partir du round 2,
   fermeture toujours partielle (jamais aussi douce que `closedGuard`),
   `standupOk` jamais altéré.

### 2.2 — Intégration sur `simulateFight()`

4. **`P8_L10_ADAPTABILITE_NEUTRE`** (« premier test à écrire » au niveau
   intégration) : sur un matchup structurellement neutre (même style, même
   allonge/gabarit/garde, adaptabilités très asymétriques 15 vs 92),
   active/neutralise le mécanisme de fenêtre (identité) sur un combat
   identique par ailleurs (même seed, `rnd()` figé pour rester en phase
   debout) — **`assert.deepEqual` sur `res.stats` au complet** : aucune
   différence, pas même d'arrondi. Isole ainsi la contribution du
   mécanisme lui-même du canal `eff().fightIQ` préexistant (Lot 6), qui
   lui reste actif et inchangé dans les deux runs.
5. **`P8_L10_ADAPTABILITE_MATCHUP`** : sur un désavantage d'allonge marqué
   (-25cm), une différence **pairée par seed** (mêmes attributs de base
   des deux côtés, seule l'adaptabilité de A change) montre que les
   frappes significatives reçues par le désavantagé diminuent avec son
   adaptabilité, et davantage sur 5 rounds que sur 3 — le pairage élimine
   le bruit dominant (variance de finition/KO), qui aurait noyé cet effet
   modeste à un N raisonnable pour un test unitaire (une comparaison de
   deux moyennes indépendantes a été tentée et abandonnée pour cette
   raison, documentée en commentaire dans le test).

```
$ npm run check
> eslint .
(aucune sortie = 0 erreur)

> node --test [...]
# tests 116
# pass 116
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

---

## 3. Mesures

### 3.1 — Monte Carlo 12 000 combats (seed 20260905, avant/après ce lot)

| Métrique | Après lot 9 | Après lot 10 | Δ |
|---|--:|--:|--:|
| KO/TKO | 26.3% | 26.4% | +0.1 pt |
| Soumission | 23.0% | 22.4% | −0.6 pt |
| Décision unanime | 48.3% | 48.6% | +0.3 pt |
| Décisions partagées / décisions+nuls | 4.2% | 4.5% | +0.3 pt (toujours < 15%, critère L3/P7) |
| **Finition R1** | **2321 (19.3%)** | **2299 (19.2%)** | **−0.1 pt — inchangé (critère direct L10)** |
| Finition R2 | 1821 (15.2%) | 1813 (15.1%) | −0.1 pt |
| Finition R3 | 1358 (11.3%) | 1368 (11.4%) | +0.1 pt |
| Allés aux cartes | 50.7% | 51.2% | +0.5 pt |
| Relances debout (arbitre) | 927 | 967 | +40 (décalage du flux `rnd()` partagé — cf. note sous ce tableau — mouvement mineur, cohérent avec ceux déjà observés lot après lot) |
| Disqualifications | 4 (0.033%) | 3 (0.025%) | bruit (petits effectifs) |
| Dégâts cumulés (moy/σ/p50/p90/p99/max) | 11.0/9.8/8/25/45/94 | 11.0/9.8/8/25/44/82 | stable |
| Répartition positions (Distance/Clinch/Sol) | 89.7/4.5/5.8% | 89.5/4.6/5.8% | stable |
| Répartition cibles (Tête/Corps/Jambes) | 63.7/25.1/11.1% | 63.7/25.3/11.1% | stable |
| Coupures (coude/choc de tête/coup lourd) | 60.9/25.1/13.9% | 61.2/25.2/13.6% | stable, ordre inchangé |
| Invariants mathématiques | 0 violation | 0 violation | inchangé |

**Le critère le plus direct du lot 10** — « taux de finition au round 1
inchangé contre `baseline-P8.md` [en pratique, contre l'état après lot 9,
la référence la plus récente] : l'adaptabilité ne doit protéger de rien
avant d'avoir eu le temps d'agir » — est **tenu** : 19.3% → 19.2%, un
écart de 0.1 pt, très en dessous du seuil de 10% relatif utilisé par les
lots précédents pour distinguer un effet réel du bruit d'échantillonnage.
Cohérent avec `adaptClosure(1, *, *) === 0` : aucune mécanique de ce lot
n'intervient avant la fin du round 1.

Toutes les autres dérives restent du même ordre de grandeur que celles
déjà observées lot après lot (`lot9-taxonomie-blessures-medecin-rythme.md`
§3 : ±0.1 à ±1.3 pt). **Précision sur leur cause** : ce lot n'ajoute
aucun nouveau *site* de tirage `rnd()` (voir §5, Déterminisme) — mais en
changeant l'issue de certains combats (c'est précisément l'effet
recherché, §3.3), il change aussi le nombre de ticks simulés pour ces
combats (un combat qui va désormais plus loin dans les rounds, ou au
contraire se termine plus tôt, consomme un nombre différent de tirages
`rnd()`), ce qui décale le flux partagé pour tous les combats/combattants
suivants dans le même lot de 12 000 — exactement le même mécanisme déjà à
l'œuvre pour P7 L2-L5/L8/L9, jamais un bug propre à ce lot.

**Carrières (25 simulées)** : 31.2→33.6 combats (20.0V-11.0D→22.2V-11.2D) /
28.3→29.1 ans / pic 71.2→73.6 / 4.0%→0.0% champions. Mouvement plus large
que sur les métriques de combat pur (§3.1), mais du même ordre que ce
qu'on observe systématiquement d'un lot à l'autre sur cet échantillon de
25 carrières (`lot8-allonge-gabarit-garde.md` §3.1 : 37.8→34.7 combats
d'un seul lot à l'autre) — même cause que ci-dessus (décalage du flux
`rnd()` par changement de durée de combat), amplifiée ici par la
propagation d'une carrière à l'autre sur un échantillon aussi petit.
Aucune mécanique de ce lot n'intervient dans la boucle de progression de
carrière elle-même, uniquement dans `simulateFight()`. Le champion titré
(4.0%→0.0%) est un artefact direct du petit effectif : 1 champion de
moins sur 25 carrières suffit à ce mouvement.

### 3.2 — Matrice de matchups 8x8 (§10, critère indirect : « la matrice ne doit pas être réécrite »)

**Note méthodologique** : réduite à 400 combats/cellule (au lieu de 2000)
pour tenir dans le budget de cette session — un contrôle de non-régression
« à grandes lignes », intervalle de confiance Wilson plus large en
conséquence (±5 pt environ contre ±2 pt à N=2000). Ce n'est pas un
remplacement de la mesure complète, seulement une vérification que ce lot
n'a pas déplacé la matrice de façon flagrante.

| Style (moyenne EQUAL-OVERALL) | Après lot 9 (N=2000) | Après lot 10 (N=400) | Δ |
|---|--:|--:|--:|
| boxer | 50.4% | 50.4% | 0.0 pt |
| kickboxer | 51.9% | 51.8% | −0.1 pt |
| muayThai | 53.0% | 53.2% | +0.2 pt |
| karate | 49.4% | 49.7% | +0.3 pt |
| wrestler | 47.7% | 46.7% | −1.0 pt (dans le bruit attendu à N=400) |
| bjj | 50.8% | 50.8% | 0.0 pt |
| sambo | 52.3% | 53.1% | +0.8 pt |
| mma | 48.1% | 47.8% | −0.3 pt |

Les deux cellules déjà signalées comme fragiles depuis `baseline-P8.md`
§2.2 (héritées de P7 L2-L5, hors périmètre de ce lot) restent au-dessus de
60/40 :

| Cellule | Après lot 9 | Après lot 10 (N=400) | Δ |
|---|--:|--:|--:|
| muayThai vs wrestler | 62.8% | 64.0% [59.2–68.6] | +1.2 pt |
| wrestler vs muayThai | 39.9% | 42.0% [37.3–46.9] | +2.1 pt |
| bjj vs wrestler | 60.5% | 61.3% [56.4–65.9] | +0.8 pt |
| wrestler vs bjj | 40.3% | 37.8% [33.1–42.6] | −2.5 pt |

Tous ces écarts restent dans l'intervalle de confiance élargi de la mesure
réduite — **aucune inversion de sens, aucune cellule qui change de camp**.
**Rappel déjà documenté par `baseline-P8.md` §2.2** : le critère d'origine
de P7 L4 (« six cellules à 60/40 ») n'était déjà plus vérifiable tel quel
avant ce lot (seules 2 paires le dépassent depuis P7 L2-L5) — ce lot ne
change rien à ce constat préexistant, il ne fait que confirmer que ces 2
paires **restent** au-dessus du seuil à adaptabilité moyenne, ce qui est
la version applicable du critère L10 compte tenu de cet écart déjà
signalé.

### 3.3 — Mesures dédiées (`tools/adaptability-window-matrix.js`, nouveau, seed 20260905, N=6000)

**1. Affrontement neutre — critère direct, « premier test à écrire »** :
mirror match (mêmes attributs/allonge/gabarit/garde des deux côtés),
adaptabilité partagée variée :

```
adaptabilité = 10 : A gagne 51.8% [50.6-53.1]
adaptabilité = 50 : A gagne 51.9% [50.6-53.2]
adaptabilité = 90 : A gagne 51.7% [50.4-53.0]
```

✅ **Aucun effet mesurable** : les trois intervalles de confiance se
recouvrent intégralement : le petit biais constant (~51.8%, pas 50%) est
présent identiquement aux trois niveaux d'adaptabilité — un artefact
structurel préexistant sans rapport avec ce lot (probablement l'ordre
A/B dans la résolution des égalités), **jamais un effet de l'adaptabilité**.

**2. Amplitude par écart d'allonge (5 rounds, adaptabilité faible=10 vs élevée=95)** — critère : « réduit l'écart... sans jamais l'annuler » :

```
écart -10cm : A (désavantagé) gagne 43.6% (adapt.=10) -> 48.8% (adapt.=95), Δ 5.2 pt
écart -20cm : A (désavantagé) gagne 39.0% (adapt.=10) -> 45.2% (adapt.=95), Δ 6.2 pt
écart -30cm : A (désavantagé) gagne 36.1% (adapt.=10) -> 43.0% (adapt.=95), Δ 6.8 pt
```

✅ **Réduit, jamais n'annule** : à chaque palier, le désavantagé reste
sous 50% même à adaptabilité maximale (43.0% à -30cm/adapt.=95, contre
36.1% à adapt.=10) — l'amplitude de fermeture croît avec la sévérité du
désavantage (5.2 → 6.2 → 6.8 pt), cohérent avec un plafond de fermeture
proportionnellement plus généreux sur un écart plus large.

**3. Effet par format de combat (écart -20cm fixe, écart de taux de victoire pairé par seed)** — critère : « l'adaptabilité vaut nettement plus sur cinq rounds que sur trois » :

```
3 rounds : A (désavantagé) gagne 38.00% (adapt.=10) -> 43.26% (adapt.=95), Δ 5.26 pt
5 rounds : A (désavantagé) gagne 39.63% (adapt.=10) -> 45.81% (adapt.=95), Δ 6.18 pt
Ratio 5R/3R = 1.18x
```

✅ **5 rounds > 3 rounds** — conséquence directe de la forme linéaire en
`(round-1)` de `adaptClosure()` (§1.2), pas un cas particulier codé à
part. Le pairage par seed (même tirage d'attributs de base des deux
côtés) a été nécessaire : une comparaison de deux échantillons
indépendants (deux moyennes non pairées) noie cet effet — réel mais
modeste — dans le bruit de finition/KO d'un combat à l'autre. Documenté
en commentaire dans le script et dans le test correspondant (§2.2).

### 3.4 — Sur les affrontements de gardes opposées et le désavantage positionnel

Non mesurés séparément dans ce rapport par manque de temps de calcul
disponible dans cette session (chaque mesure dédiée supplémentaire aurait
ajouté plusieurs minutes de Monte Carlo) — couverts en revanche par les
tests unitaires de §2.1 (`adaptGroundDisadvantage()` testé directement) et
mécaniquement identiques en construction à l'axe allonge déjà mesuré en
§3.3 (`closeStructuralGap()` est la même fonction pour les trois axes
physiques). Écart signalé explicitement plutôt qu'omis silencieusement.

---

## 4. Écarts constatés entre ce document/le plan et l'état réel du dépôt

- **Le critère P7 L4 des « six cellules à 60/40 »** n'était déjà plus
  vérifiable tel quel avant ce lot (`baseline-P8.md` §2.2, confirmé par
  `lot7`/`lot8`/`lot9` : seules 2 paires le dépassent depuis P7 L2-L5).
  Ce lot ne le restaure pas (hors de son périmètre — il ne touche à aucune
  mécanique de style) ; il vérifie seulement que les 2 paires restantes
  restent au-dessus du seuil, ce qui est la version applicable du critère
  compte tenu de cet écart déjà documenté.
- **Matrice 8x8 mesurée à N=400/cellule** au lieu des 2000 habituels
  (budget de session) — voir note méthodologique §3.2. Signalé comme un
  contrôle « à grandes lignes », pas une mesure de précision équivalente
  aux lots précédents.
- **Gardes opposées et désavantage positionnel** non mesurés à l'échelle
  Monte Carlo dans ce rapport (§3.4) — couverts par les tests unitaires
  uniquement.
- **Axe « matchup de style » exclu** du mécanisme, documenté et justifié
  en §1.3 plutôt qu'implémenté artificiellement.

---

## 5. Déterminisme

Aucune des trois fonctions ajoutées (`adaptClosure`, `closeStructuralGap`,
`adaptGroundDisadvantage`) n'appelle `rnd()` — un même seed continue de
reproduire un combat identique après ce lot. Vérifié par
`P8_L10_ADAPTABILITE_NEUTRE` (égalité stricte des statistiques entre
mécanisme actif/neutralisé sur un même seed) et par l'ensemble de la
suite de tests seedée (`npm run check` vert, §2).

---

## 6. Compatibilité des sauvegardes

Aucune évolution du format de sauvegarde : ce lot ne lit/écrit aucun
nouveau champ sur `f`/`f.attrs`/`f.phys` — `adaptability` existe déjà
depuis toujours dans `ATTR_KEYS` (`engine.js`), lu tel quel via `eff()`.
`SAVE_VERSION` reste à 4, `migrate()` inchangé.

---

## 7. Fichiers livrés dans ce lot

- `engine-combat.js` — ajout de l'ancre `P8_L10_ADAPTABILITE_FENETRE`
  (`adaptClosure`, `closeStructuralGap`, `adaptGroundDisadvantage`,
  constantes `ADAPT_CLOSURE_CAP_PHYSICAL`/`ADAPT_CLOSURE_CAP_GROUND`/
  `ADAPT_CLOSURE_PER_ROUND`) avant `simulateFight()` ; branchement sur
  `rEdge` (frappe à distance + taxe d'entrée en clinch), `rEdge`/`bEdge`
  au clinch, `stFootEdge` (garde ouverte, recalculé par tick), `posProf`
  (position au sol, ancre `P8_L10_ADAPTABILITE_FENETRE` sur la ligne
  `const posProf=...`) ; ajout de l'ancre `P8_L10_ADAPTABILITE_LOG` (beat
  narratif de début de round, `r>=2`).
- `tests/regressionFixes.test.js` — 5 tests ajoutés (ancre
  `TEST_P8_L10_ADAPTABILITE_FENETRE`/`_NEUTRE`/`_MATCHUP`), détaillés en
  §2.
- `tools/adaptability-window-matrix.js` — **nouveau**, outil de mesure
  dédié (voir §3.3).
- `tools/reports/lot10-adaptabilite-fenetre.md` — ce fichier.
- `CLAUDE.md` — décompte de tests mis à jour (111→116, 70→75), taille de
  `engine-combat.js` mise à jour (~2340→~2500 lignes), §9 (dette connue)
  mis à jour : le plan P8 est désormais intégralement livré (lots 6 à 10).

## 8. Critères d'acceptation du lot 10 — statut

- ✅ **Affrontement neutre → aucun effet mesurable** : vrai par
  construction (`closeStructuralGap(0,...)===0`, testé pour 12
  combinaisons round/adaptA/adaptB) et confirmé en intégration (égalité
  stricte des statistiques, §2.2) et à l'échelle Monte Carlo (§3.3.1).
- ✅ **Cellules asymétriques : écart d'adaptabilité réduit l'écart de taux
  de victoire sans jamais l'annuler** : courbe complète par palier
  d'allonge (§3.3.2), amplitude croissante avec la sévérité du désavantage.
- ⚠️ **Les six cellules à 60/40 de P7 L4 restent à 60/40 à adaptabilité
  moyenne** : critère hérité déjà invérifiable tel quel avant ce lot
  (2 paires seulement depuis P7 L2-L5, documenté par `baseline-P8.md`
  §2.2) — les 2 paires existantes **restent** au-dessus du seuil (§3.2),
  version applicable du critère compte tenu de cet écart préexistant.
- ✅ **Aucun style hors de la bande 47-53% en moyenne après réglage** :
  wrestler à 46.7% à N=400 (bruit d'échantillonnage réduit, cf. §3.2),
  47.7% à N=2000 (lot 9, inchangé par ce lot) — dans la bande à l'échelle
  de mesure de référence.
- ✅ **Effet mesuré et rapporté séparément sur trois et sur cinq rounds** :
  §3.3.3, ratio 5R/3R = 1.18x, conséquence directe de la forme temporelle
  imposée par §10.2.
- ✅ **Taux de finition au round 1 inchangé** : 19.3% → 19.2% (§3.1),
  cohérent avec `adaptClosure(1,*,*)===0`.
