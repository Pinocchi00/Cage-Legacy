# LOT 2B — Le vivier se renouvelle

*Contrat de lot. Écrit le 21/09/2026 par Claude, sur les décisions d'Anthony des
20 et 21/09.*

Répond à **QO-8** (`docs/QUESTIONS-OUVERTES.md`) : l'organisation s'use et rien
n'y entre. Défaut reconnu par Anthony le 21/09/2026.

**Numérotation.** « 2B » et non « 3 » : les lots 3 (l'arène), 4 (la peau du jeu)
et 5 (le monde qui parle) gardent leurs numéros et leur contenu. Ce lot s'insère
**juste après le lot 2 et avant l'arène**, parce qu'il touche l'économie que le
lot 2 T4 vient de calibrer : plus il attend, plus ce calibrage est une vérité à
durée limitée. Même précédent de nommage que les lots 3a et 3B.

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`,
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/CDC-MODE-MANAGEMENT.md` §3 (la
règle du bureau et les trois niveaux) et `docs/LOT-3B-CONTRAT.md` §C (le vivier
extérieur, textes d'auteur déjà écrits).

---

## 0. Décisions d'auteur (20 et 21/09/2026)

1. **Le déclin du vivier est un défaut**, pas une pression de jeu voulue. Une
   organisation est censée se renouveler.
2. **Les nouveaux sont régénérés**, sur le modèle des *newgens* de Football
   Manager : ils combattent en amateur et dans d'autres organisations avant que
   Split ne les voie. Ils arrivent avec un passé, jamais vierges.
3. **Le monde extérieur est dérivé, pas simulé.** Aucun second moteur ne tourne à
   côté de Split. Mais il doit être **réaliste** au sens mesurable du §4.
4. **L'histoire d'un nouveau est sa trace de carrière**, pas une biographie
   écrite : bilan amateur, organisations traversées, manière dont ses combats se
   sont finis, âge et trajectoire. **Dérivée à la lecture, jamais stockée** —
   comme le classement du lot 2 T1. **La raison de se battre reste au niveau 2**
   (`MGMT_RAISONS`, CDC §3) : la règle du bureau n'est pas touchée.
5. **Flux régulier de recrutables, mais le joueur recrute et lui seul.** Le jeu
   ne signe jamais à sa place.
6. **L'arrivée n'est pas un événement** : personne ne l'annonce, aucune réplique
   ne se déclenche. C'est **son premier combat sous Split** qui porte le récit —
   **par la presse**, donc au lot 5 (§5 bis B).
7. **Les partants partent à la retraite**, simplement. Aucune autre sortie.
8. **Un seul monde extérieur.** Celui de QO-2 et QO-3 (short notice, combattant
   libre de contrat) et celui des nouveaux sont **le même** — jamais deux
   systèmes côte à côte.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Voir arriver, cycle après cycle, des combattants qu'il ne connaît pas, lire d'où
ils viennent et ce qu'ils ont fait ailleurs, en recruter ceux qu'il veut — et
continuer à composer des cartes rentables à la dixième soirée comme à la
première, parce que son vivier ne fond plus.

---

## 2. Découpage en tranches

Une tranche à la fois, relue par Claude avant la suivante.

### T1 — Le monde extérieur, dérivé *(aucune interface)*

- **Un combattant extérieur ne stocke que son identité** : une graine, sa
  catégorie, son pays, sa date de naissance sportive (le cycle où il entre dans
  le monde). Tout le reste — bilan amateur, organisations traversées, fins de
  combats, âge courant — est **dérivé par fonction pure** à partir de ces
  champs et du cycle courant. Rien n'est écrit sur la ligne (règle du bureau,
  CDC §3).
- **Réutiliser `makeName()` et `correlatedRecord()`** (`engine.js`,
  `ui-01-roster-matchmaking.js`), déjà employés par `mgmtNewRoster`. Jamais un
  second générateur.
- **La trace progresse sans le moteur** : un combattant non recruté continue de
  combattre ailleurs, et son bilan avance — par abstraction, jamais par
  `simulateFight`. Reproductible : même graine, même cycle, même trace.
- **Aucun `Math.random()`**, RNG à graine uniquement.
- **Tests** : trace déterministe et identique d'un appel à l'autre ; jamais
  écrite sur la ligne ; un bilan qui ne régresse jamais ; deux combattants de
  graines différentes ne produisent pas la même trace.

### T2 — Le recrutement *(interface — vérification charte §3 obligatoire)*

- **Le flux** : des recrutables sont visibles cycle après cycle. **Aucun nombre
  fixe** (décision 2) — combien s'en présentent dépend du monde extérieur
  lui-même, comme le reste. Ils ne rejoignent Split que par le geste du joueur, et
  **aucun plafond de vivier** ne le limite (décision 1).
- **Ce que l'écran montre** : nom, catégorie, âge, bilan, et la trace de
  carrière du §T1 — d'où il vient et ce qu'il a fait. **Aucune note, aucune
  recommandation, aucun pronostic, aucune jauge** (vision, addendum 2 §6).
- **Le geste de recrutement**, souris d'abord, clavier en accélérateur
  (`ui-11-keys.js`), `esc()` sur tout nom affiché.
- **Le recruté entre au niveau 1**, comme n'importe quelle ligne : sa raison de
  se battre ne s'attribue qu'au niveau 2, quand le joueur s'y intéresse.
- **Mise en page** : 1440px, lisible dès 1280 — charte §L1.
- **Livrable de vérification** : la capture ou le relevé DOM exigé par la
  charte §3.

### T3 — Les départs *(après T2)*

- **La retraite**, seule sortie ordinaire. Elle retire le combattant du vivier
  et des classements, sans drame et sans réplique (décision 6).
- **Sauvegarde** : évolution du format par la migration du circuit management
  (`mgmtMigrate`) et sa validation (`validateMgmt`, `mgmtRepair`). Jamais de
  plantage au chargement, jamais de contamination avec la carrière.
- **Tests** : un retraité sort du vivier et du classement ; la migration charge
  une sauvegarde d'avant le lot sans perte.

### T4 — Le salaire à la victoire, et l'économie sur la durée de vie *(après T3 — condition de fusion)*

- **Le salaire par combat et par victoire** (décision 1) : le cachet existant
  reste le salaire de combat ; un **bonus de victoire** s'y ajoute, calculé après
  les combats et passé à `mgmtEventRecette`, qui ne le prend pas aujourd'hui.
  Constantes nommées, comme tous les poids d'argent. Le commentaire de l'ancre
  `MGMT_LOT3B_T1_ECONOMIE` (« payé avant la soirée ») est à corriger.
- `tools/monte-carlo-economie.js` mesure désormais des organisations **qui se
  renouvellent**, sur `--soirees=K` avec K assez grand pour voir la dixième
  soirée.
- **Mesure demandée (§5 c)** : recruter sans retenue est-il la stratégie
  dominante ? Comparer un joueur qui recrute tout à un joueur qui recrute peu.
- **La cible de QO-8** : le joueur d'écran reste dans la bande 70 à 80 % de
  soirées rentables **sur la durée de vie de l'organisation**, et non plus
  seulement à la première soirée. Les constantes d'économie sont recalibrées si
  besoin — **jamais les cibles**, qui sont des décisions d'auteur.
- **Test** : sur une graine fixe, la rentabilité ne s'effondre plus avec l'âge de
  l'organisation.
- Rapport de calibrage dans `tools/reports/`, format du lot 2 T4.

---

## 3. Ce que « réaliste » veut dire, et comment on le mesure

Le monde dérivé doit être **indiscernable d'un monde simulé sur les statistiques
observables**. Deux cibles, vérifiables par Monte Carlo avec l'outillage existant :

1. **Le bilan prédit le résultat.** Un combattant donné pour 18-4 se comporte
   comme un 18-4 quand `simulateFight` le fait combattre : la corrélation entre
   le bilan dérivé et le taux de victoire observé doit être du même ordre que
   celle mesurée sur le roster actuel, généré par `correlatedRecord`.
2. **Les fins de combats collent.** La répartition KO / soumission / décision de
   la trace dérivée suit celle que le moteur produit réellement — référence :
   `tools/reports/LOT-3A-CALIBRAGE-SOIREE.md`.

Un écart mesuré est un défaut de la tranche, pas une tolérance.

---

## 4. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `ui-*.js` (sauf
  `ui-11-keys.js` si l'enregistrement d'une touche l'exige), `state/*.js`,
  `index.html`. `git diff <base> -- engine-*.js state/` doit rester vide.
- **Jamais un second système** à côté d'un système existant : un seul monde
  extérieur (décision 8), un seul générateur de noms, un seul générateur de
  bilans.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Un texte
  manquant reste `[EMPLACEMENT AUTEUR]` et se signale. Les raisons de se battre
  existantes ne se réécrivent pas.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test réécrit pour retrouver du vert** sans citer la décision qui change
  le comportement attendu.
- **Aucune fusion dans `main`** avant la fin de T4.

---

## 5. Décisions d'Anthony du 21/09/2026 (les cinq points du cadrage)

1. **Recruter ne coûte rien à la signature.** Les combattants ont un **salaire par
   combat et par victoire** : le coût arrive quand ils combattent, pas quand ils
   signent. **En théorie le joueur peut recruter autant qu'il veut** — aucun
   plafond artificiel de vivier ; dans les faits, on ne recrute que les
   intéressants.
2. **Aucun nombre fixe de recrutables par cycle** : cela dépend des combattants
   eux-mêmes, comme tout le reste du monde extérieur.
3. **La retraite dépend du combattant** : l'âge, le corps (traumatisme du lot 3a)
   et les résultats jouent tous, et pas de la même façon d'un homme à l'autre.
   Aucune règle uniforme.
4. **Le recrutement se fait sur un écran neuf.**
5. **Le récit du premier combat, c'est la presse** — et la presse n'existe pas
   encore (voir §5 bis).

### 5 bis. Deux conséquences que ces décisions entraînent

**A. Le salaire à la victoire n'existe pas dans le code.** Aujourd'hui
`mgmtPurse(f, slot)` paie **un cachet par combat**, dérivé du nom et de
l'emplacement, et le commentaire de l'ancre `MGMT_LOT3B_T1_ECONOMIE` pose en
principe qu'il est « payé avant la soirée ». Un bonus de victoire ne se connaît
qu'**après** : il faudra que `mgmtRunEvent` calcule les bonus une fois les combats
joués et les passe à `mgmtEventRecette`, qui n'en prend pas aujourd'hui. Ce n'est
pas difficile — `mgmtRunEvent` joue déjà les combats avant d'appeler la finance —
mais c'est une **modification du modèle d'argent**, donc un recalibrage. Elle
entre dans ce lot, à la **T4**.

**B. La presse appartient au lot 5.** `docs/VISION-MODE-MANAGEMENT.md` en fait
« la voix du monde » (§73) et dit déjà comment on découvre un combattant : « un
14-0 avec 14 finish dans une orga inférieure dont on voit passer les highlights…
la presse qui parle d'une pépite » (§49). Le récit du premier combat est donc
**décidé et différé** : il se fera au lot 5, avec le reste de la voix du monde.
**Le lot 2B n'invente aucune presse** — pas même un embryon : ce serait un second
système à côté de celui que le lot 5 doit construire (interdit du §4). L'écran de
recrutement de la T2 montre donc la trace de carrière, des faits ; la presse
l'enrichira plus tard.

### 5 c. Un point à surveiller, sans décision demandée

Un vivier sans plafond et sans coût de détention rend le **stockage gratuit** :
recruter tout le monde serait strictement avantageux, puisqu'un combattant non
booké ne coûte rien et élargit le choix. Le contrepoids existe déjà et il est
d'auteur — la raison de se battre `addiction` dit que « l'inactivité le détruit…
ne rien proposer est le mauvais choix ». À mesurer à la T4 : si recruter sans
retenue reste la stratégie dominante, le flux perd son sens. Aucune décision
n'est demandée ici, seulement une mesure à produire.

## 5 d. Relecture de la T1 (21/09/2026) — acceptée

Branche `lot-2b-t1-monde-exterieur`. Vérifications faites par Claude sur l'état
réel, et non reprises de la livraison :

| Ce qui était en jeu | Comment je l'ai vérifié | Résultat |
|---|---|---|
| La dérivation ne consomme aucun tirage de la RNG du jeu | Suite de `rnd()` relevée après `setSeed(4242)`, puis 114 lectures de trace, puis la même suite | **Identique** |
| Deux lectures donnent la même trace | Deux appels d'affilée, comparaison sérialisée | **Identiques** |
| Rien n'est écrit sur la ligne | Clés de la ligne après lecture | `born,ck,div,id,seed` — les cinq, rien de plus |
| Le bilan ne régresse jamais | 38 lignes × 120 cycles = **4 560 lectures** | **0 régression** |
| Les chiffres s'additionnent | Bilan = combats, fins = combats, sur les mêmes 4 560 lectures | **0 incohérence** |
| Les deux cibles de réalisme | Mesure relancée à `--n=1000` | r_roster 0,733 / r_ext 0,615 ; fins Δ +0,016 / −0,005 / −0,011 — **les deux atteintes** |
| Les interdits | `git diff main` sur `engine-*.js`, `state/`, `index.html`, `mgmt-screens.js`, `ui-*.js` | **vide** |
| `npm run check` | Relancé par Claude | **305 tests, 301 passants, 0 échec, 4 skip** |

*Note de méthode : ma première sonde appelait `mgmtExteriorTrace(m, ligne, cycle)`
alors que la signature est `(ligne, cycle)` — elle recevait `null` et ne vérifiait
rien. Refaite avec la bonne signature avant de conclure.*

**Écart accepté : la loi de bilan est réécrite, pas réutilisée.** Le contrat
demandait de réutiliser `correlatedRecord`. OpenCode l'utilise pour le bilan
amateur (phase close, tirage en bloc) mais dérive le bilan professionnel combat
par combat, sous constantes `MGMT_EXT_RATIO_*` qui reprennent exactement la loi de
`correlatedRecord` (`ui-01-roster-matchmaking.js:465`). La raison est juste :
`correlatedRecord` rend un bilan entier d'un coup et consomme `rnd()` — appelé à
chaque cycle, il re-mélangerait tout le passé et le bilan régresserait, ce que le
contrat interdit durement. La propriété de préfixe ne s'obtient pas autrement.

**Réserve qui en découle, à traiter.** Les deux lois sont aujourd'hui identiques
mais rien ne les tient ensemble : modifier `correlatedRecord` les ferait diverger
en silence. Un test de non-dérive est peu coûteux — vérifier que le ratio moyen de
`correlatedRecord` à un niveau donné reste `MGMT_EXT_RATIO_BASE + t ×
MGMT_EXT_RATIO_SPAN`. À ajouter au découpage de `mgmt-bureau.js`, ou plus tôt.

**Réserve mineure.** Les bandes d'acceptation des deux cibles — `[0,7× ; 1,3×]`
pour la corrélation, `±0,04` pour les fins — ont été posées par OpenCode, pas par
le contrat, qui disait « du même ordre ». Elles sont raisonnables et ont été
fixées avant la mesure, ce qui est la bonne méthode. Elles sont désormais **la
référence du lot** : les tranches suivantes les reprennent au lieu d'en inventer
d'autres.

**Sauvegarde : le report du numéro de version est sans risque.** `m.exterieur` est
ajouté sans faire passer `MGMT_SAVE_VERSION` de 5 à 6, le bump étant prévu en T3.
Vérifié : le code de `main` accepte une sauvegarde portant `exterieur` — aucune
partie ne se retrouve illisible entre les deux états.

**Ce qui attend Anthony.** `MGMT_EXT_ORGS` contient quatre `null` :
**[EMPLACEMENT AUTEUR]**, les noms des organisations extérieures. La trace rend
déjà le nombre, les périodes et les combats par organisation. Ces noms deviennent
visibles à la **T2**, quand l'écran de recrutement les affichera — ils ne sont pas
nécessaires avant.

### 5 e. Décision d'Anthony du 22/09/2026 — le monde dérivé prend un écran au lot 4

**Le monde extérieur dérivé par la T1 est affiché au lot 4 (la peau du jeu).**

Ce que la décision règle. La T1 est livrée, couverte par dix-sept appels de
tests, et `mgmtExteriorTrace` (`mgmt-monde.js:247`) n'est appelée par aucun
chemin du jeu — l'inventaire du code mort du 21/09 la classe « vivante pour
les tests seuls » (`tools/reports/INVENTAIRE-CODE-MORT.md` §5). Ce n'est pas
du code mort : c'est du travail fini que personne ne voit. Le lot 4 lui donne
sa fenêtre, sans attendre la T2.

**Conséquence sur ce qu'Anthony doit écrire, et quand.** Le §5 d disait que les
quatre noms de `MGMT_EXT_ORGS` — **[EMPLACEMENT AUTEUR]** — deviendraient
visibles à la T2. Ils le deviennent désormais **au lot 4**, qui vient avant.
Ces quatre noms sont donc dus plus tôt que prévu.

**Conséquence sur le périmètre du lot 4.** L'audit du 17/09 (§8) définit le
lot 4 comme le remplacement de l'habillage par les écrans maquettés, et place
le recrutement au lot 5. Un écran du monde extérieur y est un écran **neuf**,
pas un rhabillage. Le lot 4 accueillait déjà le rangement et le tri des faits
(QO-9) ; il accueille maintenant cette fenêtre. À porter dans le contrat du
lot 4 quand il sera écrit — il ne l'est pas encore.

**La forme de la fenêtre, tranchée le 22/09.** Deux endroits, et deux seulement.

1. **Le monde se lit toujours à travers un combattant.** La trace s'affiche sur
   la fiche du combattant qu'on regarde — d'où il vient, ce qu'il a fait, dans
   quelles organisations. Jamais une liste du monde pour elle-même. La raison
   d'Anthony est la bonne : *« sinon on verrait des noms que personne ne
   connaîtrait »*. Un nom d'organisation ne veut rien dire tant qu'il n'est pas
   accroché à quelqu'un dont le joueur a une raison de s'occuper.
2. **Trois à cinq informations sur le hub d'accueil.** Pas un résumé du monde :
   **les plus pertinentes, et en lien avec Split.** Le critère de pertinence est
   donc *« est-ce que ça concerne mon organisation ? »*, pas *« est-ce que c'est
   gros ? »*. C'est le point le plus difficile du futur contrat, et il se mesure :
   une information qui ne change rien à une décision du joueur n'a rien à faire
   sur le hub.

La règle du bureau s'applique aux deux : la trace est **dérivée à la lecture**,
jamais stockée — `mgmtExteriorTrace(line, cycle)` est déjà écrite ainsi.

**Les quatre noms d'organisations, écrits par Anthony le 22/09.** `MGMT_EXT_ORGS`
attendait quatre `[EMPLACEMENT AUTEUR]` ; les voici :

- **MMA Korner**
- **Ultimate Rim**
- **Fighting Pacific Championship**
- **Garden of Blood**

Avec Split, le monde compte donc **cinq organisations** — ce qui recoupe
exactement l'objectif du patron dans `SPLIT-CONTEXTE-DEPART.md` §8 (« entrer
dans le top 5 des organisations », puis « passer top 3 ») et la place de Split,
« au milieu, ni la plus grosse ni la plus mauvaise ».

**Ce qui reste à trancher : l'ordre.** `MGMT_EXT_ORGS` est une **échelle de
prestige croissant** — la première est la petite organisation de départ, un
combattant y monte les échelons après trois combats et une série de victoires
(`MGMT_EXT_ORG_MIN_FIGHTS`, `MGMT_EXT_ORG_MOVE_MIN`). L'ordre n'est donc pas
cosmétique : il décide de ce que « il arrive de Garden of Blood avec huit
combats » raconte au joueur. Les noms sont posés, leur rang ne l'est pas. Tant
qu'il ne l'est pas, `MGMT_EXT_ORGS` reste `[null,null,null,null]` : la trace
dérivée porte déjà le nombre, les périodes et les combats par organisation sans
le nom, et rien ne casse.

## 6. Terminé pour le lot

1. Des combattants inconnus arrivent régulièrement, avec une trace de carrière
   complète et cohérente, et le joueur en recrute qui il veut.
2. Les partants prennent leur retraite ; le vivier ne fond plus.
3. Le monde dérivé tient les deux cibles de réalisme du §3.
4. `npm run check` vert, aucun test existant assoupli sans décision citée.
5. La vérification d'interface de la charte §3 est livrée pour T2.
6. L'économie reste dans la bande 70 à 80 % **sur la durée de vie** de
   l'organisation — la réponse mesurée à QO-8 — salaire de victoire compris.
