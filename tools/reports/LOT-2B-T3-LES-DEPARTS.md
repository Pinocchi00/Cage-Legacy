# Lot 2B T3 — Les départs

*Mesure de fin de tranche, 23/09/2026. Outil : `tools/mesure-departs.js`
(graine 20260922, jeu réel chargé dans l'ordre d'`index.html`). Contrat :
`docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md` §T3.*

## 1. Ce que la tranche pose

- **La retraite d'âge** — seconde sortie ordinaire à côté de la retraite
  médicale. À l'ouverture du cycle, après le vieillissement et avant
  l'arrivée extérieure : chaque ligne dont l'âge atteint sa retraite prend
  `retired:'age'` (mgmt-corps.js, ancre `MGMT_LOT2B_T3_RETRAITE`). Sans
  drame, sans réplique (décision 6) ; un fait `retired` est posé, comme
  pour la sortie médicale. Elle sort du vivier, des classements et des
  propositions par un **test générique** `mgmtIsRetired` — les six
  endroits qui filtraient sur `retired!=='medical'` sont remplacés
  (mgmt-carte.js ×3, mgmt-monde.js, mgmt-save.js ×2), et `validateMgmt`
  accepte `'medical'` et `'age'`, que `mgmtRepair` n'efface plus.
- **Une semaine d'anniversaire par combattant**, dérivée de son
  identifiant (`mgmtBirthdayWeek` = `duelFnv1a32('mgmt-anniversaire|'+id)`
  modulo 52). Aucun champ ajouté à la ligne. Un combattant prend un an
  quand le calendrier franchit SA semaine — au plus une fois par cycle de
  cinq semaines, exactement dix années sur 520 semaines, comme avant la
  T3. Un combattant recruté change de maison sans changer d'anniversaire.
- **Le monde extérieur part sous la même loi** : la fin de carrière d'une
  ligne est dérivée (`mgmtExteriorTimeline`, flux `'ext-retraite'`
  séparé — les carrières déjà dérivées ne bougent pas d'un tirage), la
  ligne reste en base (QO-9), cesse de compter parmi les vivants
  (`mgmtWorldLivingCount`) et sort du classement mondial. Le quota fait
  entrer un jeune à la place — 648 lignes à 240 cycles, aucune supprimée.
- **Le partant emporte ses combats posés** : au cycle de son départ, les
  combats de la carte qui le portaient sont retirés (même geste que
  `mgmtRepair` pour une ligne disparue) — sinon la soirée se retrouverait
  bloquée par un combat impossible. Conséquence mécanique, signalée ici.

## 2. La correspondance publiée (T3 étape 2)

La carrière dit : `retAge = max(39, 42 − chinDegradationLevel)`
(`engine-career.js:161`). Le management n'a pas de
`chinDegradationLevel` (ce champ n'est d'ailleurs jamais incrémenté dans
la carrière : la loi y vaut 42). L'équivalent retenu, **dix points de
menton perdu par niveau, borné à 3 niveaux** (`MGMT_CHIN_LEVEL_POINTS=10`)
— les deux seules forces qui usent le menton d'une ligne du mode :

1. **le déclin d'âge** : la perte cumulée de `attrs.chin` par
   `mgmtAgingWear` (T2 bis, RI(0,cap) par an à partir de 38 ans) ;
2. **le traumatisme acquis** : la perte que `mgmtTraumaFactor` (lot 3a)
   applique au chin régénéré — lue sur le profil réel du combattant
   (`mgmtCombatProfile`), pas sur une approximation.

Cas dirigés (mgmtTrauma forcé, 27 ans, 12-6) :

| Traumatisme | Perte de menton | Niveau | Retraite |
|---|---|---|---|
| 0 | 0 | 0 | **42** |
| 30 | 9,5 | 0 | **42** |
| 50 | 17,5 | 1 | **41** |
| 70 | 24,9 | 2 | **40** |
| 95 | 33,5 | 3 | **39** |

Roster d'ouverture (48 lignes, traumatisme 0-3) : 48 au niveau 0, tous à
42 ans — personne n'est retraité d'avance. Le vieillissement prend le
relais : passé 38 ans, la perte annuelle de menton monte le niveau sans
aucun coup reçu. Le bonus `meta01` de la carrière (+2 ans) n'existe pas
ici : le management n'a pas de compétences.

## 3. Les anniversaires (T3 étape 3)

Le compteur global de la T2 bis faisait prendre un an aux 48 lignes à la
même soirée (+1,00 an pile sur vingt soirées, relevé à la relecture). La
T3 dérive la semaine d'anniversaire de chaque ligne de son id :
`mg1` → semaine 51, `mg2` → 26, `mg3` → 1. Sur 104 cycles : chaque ligne
prend exactement dix ans, aucun cycle ne fait prendre plus d'un an, et le
premier anniversaire de `mg1` tombe toujours au onzième cycle — mais à sa
semaine à lui, plus à une date commune. Testé par
`tests/mgmtBureau.test.js` (T2 bis + T3) et par la migration 7 → 9
(`tests/mgmtTrace.test.js`), réécrite en citant le contrat.

## 4. Le monde extérieur (T3 étape 4)

Ages des lignes **extérieures vivantes** (l'ouverture compte 312 lignes
extérieures — le quota de 360 est mondial, Split compris) :

| Cycle | Années | Lignes totales | Vivantes ext. | Médiane | p10 | p90 | Moins de 25 ans |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 312 | 312 | **25** | 20 | 29 | 147 (47 %) |
| 60 | 5,8 | 312 | 312 | 30 | 26 | 34 | **0** |
| 120 | 11,5 | 359 | 312 | 35 | 28 | 39 | 17 (5 %) |
| 240 | 23 | 648 | 312 | **31** | 24 | 37 | 32 (10 %) |

La cohorte fondatrice **a entièrement passé la main** (plus aucune ligne
`born 0` vivante à 240 cycles) ; 336 lignes nées après l'ouverture l'ont
remplacée, une à une, à chaque sortie. Contre le monde sans départs de la
T1 bis (48 de médiane, 264 lignes de plus de 45 ans), le renouvellement
fonctionne.

### ⚠ Deux sous-cibles du contrat, mesurées et manquées — question posée

Le contrat §T3 fixe : *« l'âge médian du monde extérieur reste dans la
même décennie qu'à l'ouverture »* (25 → décennie 20-29) et *« à tout
cycle, des combattants de moins de 25 ans dans chaque catégorie »*.
Mesuré : **médiane 31 à 240 cycles** (décennie 30-39), et **deux
catégories sans moins de 25 ans** à ce cycle (H-feather, F-bantam) —
voire aucune, dans tout le monde, au cycle 60.

Ce n'est pas un défaut d'implémentation, c'est l'arithmétique de la loi
elle-même, et le choix n'appartient pas à la tranche :

- des entrants de 20 à 30 ans (`MGMT_EXT_AGE_MIN/SPREAD`, calibrage T1)
  et une sortie à 39-42 ans (la même loi que le roster, exigée par la
  T3) donnent une population vivante qui s'étale de 20 à 41 ans —
  médiane ≈ 31, structurellement ;
- faire entrer la médiane dans les années 20 demanderait des entrants de
  moins de 18 ans, ou une sortie bien avant 39 — c'est-à-dire casser
  soit le calibrage T1 du monde, soit la loi de retraite commune.

**La question posée à Anthony :** la cible dit-elle ce qu'elle veut dire
(une décennie exacte — alors il faut trancher l'un des deux leviers
ci-dessus), ou veut-elle dire « le monde se renouvelle au lieu de
vieillir en bloc » — ce qui est mesuré, atteint (48 → 31, cohorte
fondatrice remplacée) ? En attendant la réponse, les tests gardent les
garanties que le mécanisme tient : quota tenu partout, cohortes qui
passent la main, jeunesse réelle du monde (32 lignes de moins de 25 ans
à 240 cycles, minimum 20 ans), lignes jamais supprimées.

## 5. Roster : la retraite d'âge sur l'horizon joué

Sur vingt soirées réelles (deux ans de jeu), aucune retraite d'âge : le
roster d'ouverture a 22-35 ans, sa retraite dérivée est à 42. La sortie
d'âge est le terme long de la carrière — la sortie médicale reste la
sortie courte (T1 ter). La projection de la correspondance (§2) donne
l'horizon : un corps épargné part à 42, un corps à traumatisme 95 part à
39.

## 6. Chemin de migration

`MGMT_SAVE_VERSION` 8 → 9. Rien à convertir : aucune valeur `'age'` ne
peut figurer sur une v8 ; les âges et `ageWeeks` sont conservés tels
quels ; la semaine d'anniversaire de chaque combattant se dérive de son
identifiant à la lecture. `validateMgmt` accepte `'medical'` et `'age'`
(toute autre valeur refusée) ; `mgmtRepair` n'efface plus une retraite
d'âge — le partant ne ressuscite pas. Test de survie : un retraité d'âge
subit une sauvegarde puis un chargement sans changer d'état
(`tests/mgmtBureau.test.js`).

## 7. Vérifications

- `npm run check` : 332 tests, 328 passants, 0 échec, 4 skip (les 4 skip
  sont les sorties de carte du lot 3B, hors périmètre).
- Nouveaux tests : la loi de retraite (cas dirigés), le départ à
  l'ouverture du cycle (hors carte, hors vivier, hors classement, fait
  posé), la survie du retraité d'âge à la sauvegarde, la frontière exacte
  d'une carrière extérieure (vivante à `retireCycle−1`, partie à
  `retireCycle`, bilan gelé sans régression), le remplacement par le
  quota, le renouvellement à 240 cycles.
- Deux tests réécrits en citant le contrat (CLAUDE.md §7) : le test T2
  bis du calendrier d'âge et la migration 7 → 8 → 9 — tous deux
  supposaient l'anniversaire global que la T3 remplace.
