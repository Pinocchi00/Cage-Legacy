# Rapport — LOT 7/P8 : Arbitre, cage et cartes

> Rapport de livraison du lot 7 du plan « P8 — Solde de l'addendum P7,
> suppressions, et rôle de l'adaptabilité » (points 2, 9 et 10 de l'addendum
> P7). Compare l'état du moteur **après** ce lot à `tools/reports/baseline-P8.md`
> (référence issue du lot 6), comme l'exige la règle commune #3 du plan
> (« un rapport versionné par lot, comparé au précédent »).

- **Date de génération** : 2026-09-05
- **Branche** : `claude/lot-7-sans-erreur-0ucl3p`
- **Seed harnais principal** (`monte-carlo-combat.js`) : `20260905` (identique à `baseline-P8.md`, pour comparabilité directe)
- **Seed matrice de matchups** (`matchup-matrix.js`) : `20260905`
- **Reproduire ce rapport** :
  ```bash
  node tools/monte-carlo-combat.js 20260905      # 12 000 combats + 25 carrières (~85s)
  node tools/matchup-matrix.js 20260905 2000     # 2x64 cellules x 2000 combats (~6 min)
  ```

---

## 1. Ce que ce lot ajoute

### 7.1 — Arbitre

- **Relance debout sur inactivité** (`ANCRE: P8_L7_ARBITRE_RELANCE`,
  `engine-combat.js`) : une horloge d'inactivité (`groundInactivity`, remise
  à zéro par round) s'accumule pendant la phase `'sol'` tant qu'aucune
  frappe significative (`gHits>1.0`), aucune menace de soumission réelle
  (`subTop>2.5` ou `subBot>2.5`) et aucun changement de position
  (`transitioned`) n'a eu lieu ce tick. Passé un seuil qui dépend de la
  position (`REF_STANDUP_THRESHOLD`), le combat repart debout —
  **indépendamment de `GROUND_POS[pos].standupOk`**, ce qui corrige
  directement la régression relevée par l'état des lieux du plan : `mount`
  et `sideControl` (`standupOk:false`) pouvaient jusqu'ici être tenus
  indéfiniment sans jamais être sanctionnés.
  ```
  closedGuard: 26s   openGuard: 26s   halfGuard: 34s
  sideControl: 37s   mount: 46s       backControl: 85s (délibérément le
                                       plus haut — la position la plus
                                       dominante du jeu ne doit pas être
                                       vidée de son intérêt)
  ```
  Ces seuils ont été resserrés une fois en cours de lot : un premier
  calibrage (42/42/55/60/75/130s) ne produisait que 777 relances sur
  12 000 combats et un temps de contrôle des lutteurs quasi inchangé
  (52.3s contre 52.4s en référence) — la plupart des séquences de contrôle
  sont déjà interrompues par une transition normale bien avant ces seuils.
  Resserré à 26/26/34/37/46/85s (voir §3.2 pour l'effet mesuré).
- **Fautes** (`ANCRE: P8_L7_ARBITRE_FAUTES`) : un jet phase-agnostique par
  tick et par combattant (`foulChance()`, pilotée par `aggression` (+),
  `composure` (−) et `fightIQ` (−) — aucun attribut inventé), avec quatre
  issues en cascade **classées du plus probable au moins probable** :
  70% avertissement (aucun effet, non journalisé pour ne pas noyer le log),
  ~22% temps mort de récupération pour la victime (allège légèrement sa
  fatigue), ~7.7% retrait de point, 0.3% faute flagrante et disqualification
  immédiate. Cet ordre ascendant est délibéré et non cosmétique : de
  nombreux tests de ce dépôt forcent `win.rnd=()=>0` pour construire un
  scénario pire-cas déterministe (`ANCRE P7_L5_GAUSS_RND_ZERO`), ce qui rend
  **toute** comparaison `rnd()<seuil positif` vraie — classer la branche la
  moins perturbatrice en premier garantit qu'un flux dégénéré tombe
  systématiquement sur l'avertissement plutôt que sur la disqualification.
  (Découvert en pratique : `CORRECTIF_KD_SOL` cassait exactement ainsi avant
  cette réorganisation — voir §4.)
- **Retrait de point traversant la notation** (`ANCRE JUGES_10PT_SCORE`) :
  `roundFoulPtsA/B` (remis à zéro chaque round) sont soustraits
  identiquement des **trois** cartes de juges pour le round où la faute a
  eu lieu (plancher à 6). Un deuxième retrait contre le même combattant
  déclenche la disqualification automatique.
- **Disqualification** comme méthode de victoire à part entière
  (`method:'Disqualification'`), remontée à `f.history`, aux écrans de
  résultat (`ui-06-career-screens.js`, via `finishTxt`/`moveName` vidé —
  voir §2) et à l'arène (`ui-09-arena.js`), exactement comme l'a été
  l'arrêt médical.

### 7.2 — Cage

- **`CLINCH_POS`** (`ANCRE: P8_L7_CAGE_POSITION`, `engine-combat.js`) :
  distingue le clinch **au centre** du clinch **contre la cage**, dans la
  même structure que `GROUND_POS` (table de profils, jamais un système
  parallèle) — `ctrlMult` (contrôle), `volMult` (volume de frappe),
  `tdMult` (propension à nourrir une amenée) et `breakMult` (facilité à se
  dégager). La cage nourrit nettement plus les amenées que le centre
  (`tdMult` 1.30 contre 0.80) : « porte d'entrée naturelle des amenées et
  de la lutte de cage » (§7.2), mesuré et vérifié (§3.3, test dédié).
  Position initiale biaisée par la propension au grappling des deux
  combattants (`clinchPos=rnd()<(0.35+0.3*Math.max(giA,giB))?'cage':'center'`),
  puis transitions stochastiques persistantes (`ANCRE P8_L7_CAGE_TRANSITIONS` :
  0.18/tick vers la cage, 0.10/tick vers le centre — cohérent avec le MMA
  réel, où un clinch fini généralement contre le grillage). Deux pools de
  texte narratif distincts (« au centre de l'octogone » vs « contre le
  grillage »).

### 7.3 — Vocabulaire complet des décisions

- **`judgesVerdict()`** (fonction pure, `engine-combat.js`, exposée comme
  `contextualGrapplingMult`/`takedownSigmoidSteep` pour être testée
  directement) classe les 10 répartitions possibles de trois votes de juge
  (A/B/égalité chacun) vers les six libellés réels du sport : décision
  unanime (3-0), décision majoritaire (2-0-1), décision partagée (2-1), nul
  unanime (0-0-0 côté votes décisifs, trois égalités), nul majoritaire
  (deux égalités + un décisif), nul partagé (1-1-1). Remplace le vote
  binaire `votesA/votesB` qui traitait une égalité de juge comme un simple
  non-vote — un combattant avec UN SEUL juge décisif contre deux égalités
  aurait été déclaré vainqueur par « Décision », alors qu'un vrai panel MMA
  rend ça un nul majoritaire.
  `isDecisionLike()` (engine.js) reconnaît désormais aussi `startsWith('Nul')`
  en plus de `startsWith('Déc')` et `'Égalité'` (conservé tel quel pour la
  compatibilité des sauvegardes antérieures — voir §5).
  `tools/monte-carlo-combat.js` réutilise `win.judgesVerdict()` (jamais une
  logique dupliquée) pour recalculer, à des fins de mesure, le verdict
  hypothétique qu'aurait rendu le panel sans un retrait de point donné.

---

## 2. Fichiers modifiés

- **`engine.js`** — `isDecisionLike()` étendu (`startsWith('Nul')`).
- **`engine-combat.js`** — cœur du lot : `REF_STANDUP_THRESHOLD`,
  `CLINCH_POS`, `foulChance()`, `judgesVerdict()`, état de l'arbitre
  (`foulPointsA/B`, `foulWarnA/B`, `refStandupCount`), relance debout,
  fautes/retrait de point/disqualification, position de clinch et ses
  transitions, verdict à 6 libellés, overrides `moveName`/`moveFlavor` pour
  la disqualification (repli identique à l'arrêt médical).
- **`ui-09-arena.js`** — libellé de fin de combat (`ÉGALITÉ`/`DISQUALIFICATION`)
  reconnaît les nouveaux libellés de nul et la disqualification (repli
  générique `SOUMISSION` corrigé pour ne plus absorber la disqualification
  par défaut).
- **`ui-03-contracts-arcade-data.js`** — `upset` compare désormais à
  `'Décision unanime'` (au lieu de l'ancien `'Décision'`, devenu obsolète).
- **`engine-career.js`** — `calculateEloDelta()` : `'Décision majoritaire'`
  reçoit le même kFactor réduit (24) que `'Décision partagée'`.
- **`tools/monte-carlo-combat.js`** — `methodCounts` à 9 clés (6 décisions/nuls
  + KO/TKO + Soumission + Disqualification), classification par
  correspondance exacte des clés plutôt qu'un `else` fourre-tout, métriques
  arbitre (relances, retraits de point, renversements, disqualifications),
  répartition des six libellés.
- **`tests/regressionFixes.test.js`** — 5 tests ajoutés (voir §4).
- **`CLAUDE.md`** — décompte de tests mis à jour (91→96, 50→55 dans
  `regressionFixes.test.js`).
- **`tools/reports/lot7-arbitre-cage-cartes.md`** — ce fichier.

Aucun fichier créé ni supprimé, `index.html` inchangé : l'ordre de
chargement documenté par `CLAUDE.md` §3 reste exact.

---

## 3. Mesures (12 000 combats + matrice 8×8, seed 20260905)

### 3.1 Distribution des méthodes de victoire

| Méthode | baseline-P8 | après Lot 7 | Δ |
|---|--:|--:|--:|
| KO/TKO | 23.9% | 23.8% | −0.1 pt |
| Soumission | 23.7% | 23.1% | −0.6 pt |
| Disqualification | — (n'existait pas) | 0.03% (4) | nouveau |
| Décision (unanime) | 49.9%¹ | 50.5% | +0.6 pt |
| Décision majoritaire | — (n'existait pas) | 0.1% (11) | nouveau |
| Décision partagée | 2.4% | 2.2% | −0.2 pt |
| Nul (unanime+majoritaire+partagé) | 0.1%¹ (« Égalité ») | 0.4% (0.2+0.1+0.0) | +0.3 pt |

¹ `baseline-P8.md` ne distinguait que « Décision »/« Décision partagée »/« Égalité ».

**Répartition des six libellés parmi les décisions/nuls** (critère
d'acceptation direct du lot) :

```
Décision unanime     : 6059 (95.1%)
Décision majoritaire :   11 (0.2%)
Décision partagée    :  264 (4.1%)   <-- toujours < 15%, cf. critère
Nul unanime          :   25 (0.4%)
Nul majoritaire      :   11 (0.2%)
Nul partagé          :    0 (0.0%)
```

Décisions partagées : **4.1%** de l'ensemble des décisions/nuls — largement
sous le seuil de 15% exigé. Décisions majoritaires et nuls sont, comme
attendu pour un panel de juges corrélé (`ANCRE P7_L3_JUGES_SENSIBILITES`,
Lot 3/P7), des événements rares : les trois juges partagent une lecture
commune du round, ils ne divergent qu'à la marge.

Dégâts cumulés : **11.0** (σ 9.9, p50 8, p90 25, p99 46, max 85) — quasiment
identique à `baseline-P8.md` (11.0/9.9/8/25/45/85), cohérent : ce lot ne
touche pas au modèle de dégâts.

### 3.2 Arbitre (critères d'acceptation du lot)

```
Relances debout (arbitre) : 998 sur 12 000 combats (0.083 par combat en moyenne)
Retraits de point         : 101 au total
Renversements par retrait : 21
Disqualifications         : 4 (0.033%)
```

- ✅ **Ordre de grandeur crédible** : ~1 relance debout toutes les 12
  combats. Assumé comme valeur de design plutôt que sourcé sur des
  statistiques d'organisation réelles (aucune source chiffrée fiable et
  comparable trouvée) — cohérent avec l'intuition que la relance reste un
  événement notable, pas un mécanisme systématique.
- ✅ **Temps de contrôle des lutteurs en baisse mesurable** : `wrestler`
  passe de **52.4s** (`baseline-P8.md`, empreinte par style) à **49.4s**
  (−5.7%). L'effet est réel mais modeste — explication honnête plutôt que
  gonflée : la grande majorité du temps de contrôle mesuré est un contrôle
  **actif** (passes de garde, tentatives de soumission, GNP réel), qui
  remet l'horloge d'inactivité à zéro en continu ; seule la queue de
  séquences réellement stériles est concernée par la relance. Resserrer
  encore les seuils punirait un contrôle légitime, contraire à la consigne
  du plan (« sans le rendre inutile »).
- ✅ **Taux de victoire des lutteurs dans la bande 47-53% à overall égal** :
  **48.0%** (matrice EQUAL-OVERALL, moyenne tous adversaires confondus,
  16 000 combats) — contre 48.1% en référence (`baseline-P8.md`), stable.
- ✅ **Au moins une disqualification et un renversement par retrait de
  point, traçables** : 4 disqualifications et 21 renversements sur
  l'échantillon (méthode de détection : `win.judgesVerdict()` recalculé
  sans l'effet du retrait, cf. §1 — reproduite à l'identique dans
  `tests/regressionFixes.test.js`, test `P8_L7_ARBITRE_FAUTES`).

### 3.3 Cage — effet mesuré (test dédié, hors Monte Carlo 12 000)

Sur un échantillon ciblé (grappler dominant en clinch vs frappeur faible en
clinch, N=400, seed 24681, `tests/regressionFixes.test.js` test
`P8_L7_CAGE_POSITION`) : les deux positions (`center`/`cage`) apparaissent
bien dans le journal, et le taux d'amenée observé **depuis un clinch de
cage dépasse toujours** celui observé **depuis un clinch de centre** —
vérifié à chaque exécution du test (assertion stricte, pas un seuil
statistique approximatif).

### 3.4 Matrice de matchups 8×8 à overall égal (référence L4/P7, contexte)

| Style | baseline-P8 (EQUAL-OVERALL) | après Lot 7 | Δ |
|---|--:|--:|--:|
| boxer | 50.0% | 50.5% | +0.5 pt |
| kickboxer | 52.0% | 51.3% | −0.7 pt |
| muayThai | 51.6% | 52.2% | +0.6 pt |
| karate | 49.2% | 49.4% | +0.2 pt |
| wrestler | 48.1% | 48.0% | −0.1 pt |
| bjj | 52.3% | 51.2% | −1.1 pt |
| sambo | 52.3% | 51.8% | −0.5 pt |
| mma | 49.0% | 48.1% | −0.9 pt |

**Aucun style ne sort de la bande 47-53%.** Les mouvements (±0.1 à ±1.1
point) sont cohérents avec le bruit attendu d'un décalage du flux
pseudo-aléatoire partagé (chaque nouveau `rnd()` consommé par tick — jets
de faute, position de clinch, transitions de cage — décale la suite des
tirages pour tout ce qui vient après dans le même combat, sans changer le
déterminisme **pour un seed donné** ; cf. `ANCRE P7_L5_SEED_ROBUSTE`,
`tests/regressionFixes.test.js`, déjà documenté lors du Lot 6). Aucun de
ces mouvements n'a nécessité de recalibrage de test : `P7_L4_MATCHUP_ASYMETRIE`
(seuil 56% sur boxer vs bjj) passe toujours, mesuré ici à 57.6% en
EQUAL-OVERALL sur ce seed.

### 3.5 Carrières complètes (25 simulées)

```
Combats moyens par carrière : 37.8 (Bilan moyen: 25.9V - 11.8D)
Âge moyen de fin de parcours : 31.5 ans
Pic d'overall moyen         : 75.6
Champions titrés            : 12.0%
```

Contre 35.0 combats / 31.5 ans / 73.1 pic / 8.0% champions en
`baseline-P8.md` — dérive attribuable au bruit d'échantillonnage sur
seulement 25 carrières (déjà signalé comme un échantillon modeste dans les
rapports précédents), pas à un changement structurel de ce lot : aucune
des mécaniques de ce lot n'intervient dans la progression de carrière
elle-même (uniquement dans la simulation de combat).

---

## 4. Tests ajoutés (`tests/regressionFixes.test.js`)

1. **`P8_L7_VOCABULAIRE_DECISIONS`** (classification) — couvre les 10
   répartitions de votes vers les 6 libellés, en comparant champ par champ
   (le retour de `judgesVerdict()` vit dans le realm jsdom de `win` :
   `assert.deepEqual` échoue dessus avec « same structure but not
   reference-equal », un piège cross-realm classique évité ici).
2. **`P8_L7_VOCABULAIRE_DECISIONS`** (couverture `isDecisionLike`/`isKOMethod`)
   — les six nouveaux libellés ET les anciens (`'Décision'`, `'Égalité'`)
   restent correctement classés ; `'Disqualification'`/`'Arrêt médical'`
   restent exclus des deux.
3. **`P8_L7_ARBITRE_FAUTES`** — sur 1500 combats de combattants très
   fautifs (aggression 100/composure 1/fightIQ 1), observe statistiquement
   au moins une disqualification, un retrait de point, et un renversement
   de décision par retrait de point (recalcul via `judgesVerdict()`).
4. **`P8_L7_ARBITRE_RELANCE`** — un contrôleur au sol sans la moindre
   menace de frappe/soumission (gnp/submission/power/killer au plancher)
   finit, sur 300 combats, par déclencher au moins une relance debout —
   régression directe de la rentabilité du contrôle stérile signalée par
   l'état des lieux du plan.
5. **`P8_L7_CAGE_POSITION`** — les deux positions de clinch apparaissent
   réellement dans le journal sur 400 combats, et le taux d'amenée depuis
   la cage dépasse celui depuis le centre (assertion stricte).

**Découverte en cours de route** : `CORRECTIF_KD_SOL` (test préexistant,
seed dégénéré `win.rnd=()=>0`) cassait à cause de l'ordre des branches de
sévérité des fautes — corrigé en classant les branches du plus probable
(avertissement) au moins probable (disqualification flagrante), voir §1
et le commentaire `ANCRE P8_L7_ARBITRE_FAUTES` dans `engine-combat.js`. Un
flux `rnd()` dégénéré tombe désormais systématiquement sur la branche la
moins perturbatrice, protégeant tous les tests existants qui utilisent ce
motif.

---

## 5. Compatibilité des sauvegardes

Aucune évolution du format de sauvegarde dans ce lot : `f.history[].method`
continue de stocker une chaîne libre, jamais validée par un enum fermé.
Une entrée d'historique antérieure à ce lot (`'Décision'`, `'Décision
partagée'`, `'Égalité'`) reste lisible et correctement classée par
`isDecisionLike()`/`isKOMethod()` (tous deux rétrocompatibles, testé
explicitement). Aucune valeur existante n'a été renommée en base — seuls
les combats **simulés après ce lot** émettent le nouveau vocabulaire
complet. `SAVE_VERSION` reste à 4, `migrate()` inchangé.

---

## 6. Déterminisme

Un même seed reproduit un combat identique après ce lot : toutes les
nouvelles sources d'aléa (jets de faute, position de clinch, transitions
de cage) passent exclusivement par `rnd()` (PRNG seedé, `engine.js`),
jamais par `Math.random()`/`Date.now()`. Vérifié implicitement par
l'ensemble des tests seedés de la suite (`npm run check` vert) et par la
reproductibilité du rapport Monte Carlo lui-même (seed `20260905`, deux
exécutions successives lors du calibrage des seuils de relance produisant
des totaux identiques au run correspondant).

---

## 7. Validation

```
$ npm run lint
> eslint .
(aucune sortie = 0 erreur)

$ npm test
...
# tests 96
# suites 0
# pass 96
# fail 0
# cancelled 0
# skipped 0
# todo 0

$ npm run lint:content
=== ANGLICISMES (3) ===
  ui-01-roster-matchmaking.js — "MAIN EVENT" (×3, hors périmètre de ce lot,
  déjà signalé dans baseline-P8.md)
=== LOI 6 — phrases visibles trop longues (0) ===
=== CHAMPS G.f./G.faith./G.arcade. écrits mais jamais relus (0) ===
```

- `node tools/monte-carlo-combat.js 20260905` : 12 000 combats en **17.6s**,
  25 carrières en **66.3s**.
- `node tools/matchup-matrix.js 20260905 2000` : 256 000 combats en
  **≈6 min 22s** (180.3s RAW + 201.4s EQUAL-OVERALL) — stable par rapport à
  `baseline-P8.md` (≈6 min 49s), malgré le travail supplémentaire ajouté
  par tick (jets de faute, position de clinch, relance debout).

## 8. Critères d'acceptation du lot 7 — statut

- ✅ Part des combats se terminant par une relance debout de l'arbitre : à
  un ordre de grandeur crédible, assumé comme valeur de design (§3.2).
- ✅ Temps de contrôle des lutteurs en baisse mesurable (−5.7%, §3.2), taux
  de victoire des lutteurs dans la bande 47-53% à overall égal (48.0%, §3.2).
- ✅ Au moins une disqualification (4/12 000) et un renversement de décision
  par retrait de point (21/12 000) sur l'échantillon, tous deux traçables
  dans le log et reproduits par un test dédié (§3.2, §4).
- ✅ Répartition des six libellés de décision produite dans le rapport
  (§3.1), décisions partagées à 4.1% — toujours sous 15%.

## 9. Écarts constatés entre `CLAUDE.md` et l'état réel du dépôt

Aucun. `index.html` et l'ordre de chargement des scripts sont inchangés ;
seul le décompte de tests a été mis à jour (§ livrables, `CLAUDE.md` §7).
