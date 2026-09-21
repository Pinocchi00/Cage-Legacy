# LOT 2 — La carte principale

*Contrat de lot. Écrit le 19/09/2026 par Claude, sur décisions d'Anthony du 19/09.*

Répond aux constats **X1** (le joueur ne booke aucun combat), **C1** (accepter une
proposition de Leïla ne booke rien) et **M1** (la carte principale n'existe pas) de
`docs/AUDIT-17-09.md`. Troisième lot de la tranche verticale, après le lot 0 (les
documents) et le lot 1 (le style stable).

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`,
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/LOT-3B-CONTRAT.md` §1 (décisions
d'auteur), §2 (composer la carte) et §T2, dont ce contrat reprend l'essentiel en
l'adaptant aux décisions du 19/09.

---

## 0. Décisions d'auteur du 19/09/2026

- **La carte fait 9 combats : 5 en carte principale, 4 en préliminaires.** La carte
  principale est composée par le joueur, les préliminaires sont proposés par Leïla.
  Cette décision remplace le « 4 + 4 » du 15/09 (`LOT-3B-CONTRAT.md` §1, Q3) : la
  maquette `maquettes/02-semaine.html`, validée le 17/09, affiche « 3 combats bookés
  sur 5 », et la vision parle d'environ cinq combats de carte principale.
- **Le combat principal en 5 rounds n'est pas dans ce lot.** Tous les combats restent
  en 3 rounds. Les 5 rounds arrivent au lot 5, avec les classements et les ceintures.
  La maquette les annonce : c'est normal, elle décrit l'état visé, pas ce lot.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Composer lui-même les cinq combats de sa carte principale, combattant par combattant,
puis recevoir de Leïla une carte préliminaire cohérente, construite avec ce qui reste.
Rien d'autre ne change : la soirée se joue comme aujourd'hui, le lendemain aussi.

---

## 2. Découpage en tranches

Chaque tranche est livrable et vérifiable seule. **Une tranche à la fois**, relue par
Claude avant la suivante.

### T1 — La structure et le classement *(aucune interface)*

- **Carte `{main, prelims}`.** `m.card` devient
  `{sizeMain:5, sizePrelims:4, main:[], prelims:[]}`. `MGMT_CARD_SIZE` (`mgmt-data.js`)
  est remplacé par deux constantes nommées, `MGMT_MAIN_SIZE=5` et
  `MGMT_PRELIM_SIZE=4`. Aucun autre fichier de données touché.
- **`mgmtCardFull(m)`** vaut vrai quand la carte principale ET les préliminaires sont
  complets. La soirée joue les 9 combats, la carte principale d'abord.
- **Sauvegarde `MGMT_SAVE_VERSION` 4 → 5**, migration séquentielle 2 → 3 → 4 → 5, sans
  perte : les combats d'une carte en cours deviennent des préliminaires, la carte
  principale démarre vide. Aucun combat perdu, aucun ajouté d'office. `validateMgmt`,
  `mgmtRepair` et `mgmtValidEvent` couvrent la nouvelle structure. Une v1 reste
  refusée.
- **Emplacement porté par le combat** : chaque combat de la carte porte
  `slot:'main'|'prelim'`. `mgmtRunEvent` utilise ce champ au lieu de traiter tous les
  combats comme des préliminaires (garde posée au lot 3B T1).
- **Classement par catégorie, dérivé, jamais stocké** (règle du bureau, CDC §3) :
  fonction pure `mgmtDivisionRank(m, f)`. Ordre : victoires − défaites, puis victoires,
  puis ancienneté du dernier combat, le plus actif devant. Les suspendus gardent leur
  rang, les retraités médicaux sortent du classement.
- **Dernier combat** : `lastCycle` écrit sur la ligne au moment où le lot 3a écrit déjà
  le traumatisme. Absent = n'a jamais combattu sous Split. Un niveau 1 qui n'a jamais
  combattu ne stocke toujours rien.
- **Tests** : migration 4 → 5 sans perte et v1 refusée ; classement déterministe,
  identique d'un appel à l'autre, et jamais écrit sur la ligne ; carte complète à
  5 + 4 ; soirée qui joue 9 combats dans l'ordre.

### T2 — Le joueur compose *(interface — vérification charte §3 obligatoire)*

- **Le geste**, tiré de `LOT-3B-CONTRAT.md` §2 : dans la liste des combattants, choisir
  un combattant disponible, puis son adversaire. Le combat entre dans le premier
  emplacement libre de la carte principale. Un combat posé peut être retiré.
- **La liste montre**, pour chaque combattant : sa catégorie de poids et son rang dans
  la catégorie. **Aucune note, aucune recommandation, aucun pronostic, aucune jauge**
  (vision, addendum 2 §6 tel que modifié le 17/09).
- **Non sélectionnables** : suspendus (visibles avec leur rang), retraités médicaux
  (absents), et tout combattant déjà engagé sur la carte.
- **Souris d'abord, clavier en accélérateur** : navigation par `ui-11-keys.js`
  (`keysRegister`), comme les écrans existants. `esc()` sur tout nom affiché.
- **Mise en page** : 1440px, lisible dès 1280, trois colonnes — charte §L1. La maquette
  de référence est `maquettes/02-semaine.html` pour la carte et
  `maquettes/04-booker-un-combat.html` pour le geste de composition. **L'habillage
  complet des maquettes n'est pas dans ce lot** (c'est le lot 4, la peau du jeu) :
  ici, l'écran reprend l'habillage actuel du management, seule la structure est neuve.
- **Livrable de vérification** : la capture ou le relevé DOM exigé par la charte §3.

### T3 — Leïla et les préliminaires *(après T2)*

- **La proposition en bloc de Leïla devient la proposition des préliminaires**, et
  n'arrive **qu'une fois la carte principale complète**. Elle passe donc de début de
  pile à après la carte principale. Les autres affaires ne changent pas.
- **Extension de `mgmtPickBulkPair`**, jamais une fonction concurrente. Parmi les
  combattants disponibles hors carte principale :
  - même catégorie, rangs proches (écart borné par une constante nommée) ;
  - repos : pas de combattant ayant combattu à la soirée précédente
    (`lastCycle >= cycle - 1`), sauf en mode assoupli ;
  - priorité aux combattants inactifs depuis le plus longtemps ;
  - pas de revanche immédiate d'un combat de la soirée précédente.
- **Le coût de l'écrasement reste en place** (lot 2 du management, lot 3a §5) :
  propositions bâclées, avertissements qui se taisent, catégories croisées en mode
  bâclé.
- **C1 — accepter une proposition de Leïla booke vraiment.** Quand le joueur accepte
  une demande de placer un combat « dans les plus gros combats » (`mgmtDecide`, action
  `accept`), ce combat entre dans la carte principale. S'il n'y a plus d'emplacement
  libre, l'action n'est pas proposée.
- **Tests** : aucun combattant de la carte principale dans les préliminaires ; repos
  respecté hors mode assoupli ; suspendus jamais proposés ; pas de revanche
  immédiate ; la proposition de Leïla n'arrive pas avant que la carte principale soit
  complète ; accepter la demande de Leïla ajoute bien un combat.

### T4 — L'argent sur le déroulé réel *(après T3)*

Exigé par `LOT-3B-CONTRAT.md` §T2, et condition de la fusion dans `main`.

- `tools/monte-carlo-economie.js` joue le **vrai déroulé** : carte principale composée
  par un joueur-type (heuristique documentée dans le script), préliminaires issus de la
  vraie proposition de Leïla, soirée par `mgmtRunEvent`.
- Les cibles du lot 3B T1 sont revérifiées sur ce déroulé. Les constantes d'économie
  sont recalibrées si besoin — **jamais les cibles**, qui sont des décisions d'auteur.
- **Test** : sur une graine fixe, des soirées réelles non écrasées sont rentables. Il
  échoue si elles ne le sont jamais.
- Rapport de calibrage dans `tools/reports/`, format du lot 1.

---

## 3. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `ui-*.js` (sauf `ui-11-keys.js`
  si l'enregistrement d'une touche l'exige), `state/*.js`, `index.html`.
  `git diff <base> -- engine-*.js state/` doit rester vide.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Un texte manquant
  reste `[EMPLACEMENT AUTEUR]` et se signale. Les répliques existantes de Leïla ne se
  réécrivent pas.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test réécrit pour retrouver du vert** sans citer la décision qui change le
  comportement attendu. Les tests qui verrouillent l'ancienne carte (4 places,
  proposition en bloc en début de pile) se réécrivent en citant **ce contrat** ; les
  autres ne bougent pas.
- **Aucune fusion dans `main`** avant la fin de T4 puis T5 (décision du 20/09,
  §4 bis « Ordre de fusion ») : une seule PR, la branche étant linéaire.

## 4. Règles de vitesse

- Essais de mesure avec `--n=1000` ; une seule mesure complète en fin de tranche.
- Entre deux essais, seulement le fichier de test concerné (`node --test tests/…`).
- `npm run check` une fois, à la fin de la tranche.
- `tools/monte-carlo-soiree.js` tourne sur les douze cœurs depuis le 20/09
  (`--jobs=N`, `--serial` pour l'ancien comportement) : mesure complète en 1 min 54
  au lieu de 9 min, chiffres identiques à la version sur un seul cœur.

## 4 bis. Relectures — état au 20/09/2026

**T1, T2 et T3 sont livrées, relues contre ce contrat et vérifiées dans le jeu réel**
(`npm run check` relancé par Claude : 287 tests, 283 passants, 0 échec, 4 skip).
Vérifié manette en main pour T2 et T3 : le geste de composition, le clavier, le
compteur de carte, l'apparition de la proposition de Leïla à la cinquième place
posée, l'absence de combattant de carte principale dans les préliminaires, le repos
et l'absence de revanche sur un second cycle joué, et C1 (accepter booke vraiment,
la réponse disparaît quand la carte est pleine).

### Réserves d'interface, ouvertes

1. **Contraste au survol (charte L2).** `.opp:hover` (`index.html:100`, hérité de
   l'interface de carrière) éclaircit le fond ; le texte de 13 px tombe alors à
   **3,54:1**, sous le 4,5:1 de la charte. Touche déjà tous les écrans du
   management, pas seulement la carte. À traiter au **lot 4** (la peau du jeu).
2. **Une ligne non cliquable s'allume au survol** : un suspendu ou un combattant
   déjà en carte réagit comme s'il était choisissable. Le mot dit le refus, le
   survol le contredit.
3. **À 1920, seule la colonne du milieu s'élargit** (320 / 658 / 360) : la place
   supplémentaire va à la liste, pas à la carte. À regarder en jouant.

### Questions de règle — tranchées par Anthony le 20/09/2026

4. **Le calendrier attend le joueur.** Carte principale incomplète et pile vide,
   « Cycle suivant » faisait avancer le cycle : vérifié en jeu, trois clics
   passaient du cycle 6 au cycle 9 avec un seul combat posé et aucune soirée
   jouée, contre le lot 3a §10. **Décision : le calendrier attend le joueur** —
   le cycle ne se ferme pas tant que la carte principale n'est pas composée.
   L'autre option (une soirée manquée coûte quelque chose) demande une
   conséquence, donc un texte d'auteur : elle reste au lot 3B T3 et n'est pas
   écartée. Objet de la **T5** ci-dessous.
5. **La composition reste enfermée dans une catégorie de poids.**
   `mgmtBookMain` refuse le croisement (`mgmt-bureau.js`, `fa.div!==fb.div`) et
   `mgmtSelectable` filtre déjà la liste dès qu'un combattant est choisi —
   l'écran annonce « Adversaires — *catégorie* », le refus n'est pas muet.
   **Décision : on garde.** Le croisement est la punition de la carte écrasée
   par Leïla ; libre et sans coût côté joueur, il viderait cette punition de son
   sens et le classement par catégorie posé en T1 avec elle. Le catchweight
   assumé, avec son coût visible, relèvera du lot 5 (classements et ceintures).
6. **`mgmtClosePile` renvoyait `'stuck'` dans deux situations différentes** : le
   pot de combattants est épuisé, ou la carte principale n'est pas composée
   (état normal). C'est la même ligne que la question 4 — depuis la T3,
   `mgmtOfferBulk` refuse de proposer tant que la carte principale est
   incomplète, donc `mgmtRefillBulk` rend faux, donc `'stuck'`, et
   `CL.mgmtNextCycle` ferme le cycle. **Réglé par la T5, en même temps que la
   question 4.**

### Ordre de fusion — tranché par Anthony le 20/09/2026

La branche `lot-2-carte-principale` est une **chaîne linéaire de 18 commits**
au-dessus de `main`, qui porte dans l'ordre : lot 3B T1 (l'argent) → lot 0 →
lot 1 → lot 2 T1/T2/T3. `lot-3b`, `lot-0-documents` et `lot-1-style-stable` sont
tous ancêtres de `HEAD`. Le commit de l'économie étant **en bas** de la pile,
aucune fusion partielle n'est possible sans cherry-pick : tout ce qui passe
emporte l'économie perdante.

**Décision : une seule fusion, une seule PR, après la T4 et la T5.** `main` ne
contient ainsi jamais un état où jouer une soirée coûte de l'argent.

### Relecture de la T4 (21/09/2026) — reprise demandée

La T4 livrée (commit `933ce41`) rejoue un **vrai** déroulé : `mgmtNewPile`,
composition par `mgmtBookMain`, proposition de Leïla par `mgmtOfferBulk`,
validation par `mgmtDecide`, soirée par `mgmtRunEvent`. Cette partie est juste et
se garde. Les interdits sont tenus : moteur, `state/`, `ui-*`, `index.html`,
`mgmt-data.js` et `mgmt-screens.js` intacts, aucun `Math.random()`, aucune
réplique. Les constantes d'argent ne sont pas touchées ; seules `MGMT_DRAW_AVG`
et `MGMT_SPECTACLE_REF`, qui sont des mesures, suivent le déroulé réel.

**Mais le joueur-type est un oracle.** `composeMainPropre` choisit ses cinq
combats par `mgmtFightDraw` décroissant, c'est-à-dire en maximisant directement
la grandeur qui produit la billetterie et les droits du diffuseur. C'est la
quantité que l'écran ne montre pas : le joueur ne voit que la catégorie, le rang
et le bilan (§T2 — aucune note, aucune jauge). Le test ajouté recopie la même
heuristique et hérite du même biais.

Mesure de contrôle faite par Claude le 21/09 : même outil, même graine, même
déroulé, seule l'heuristique remplacée par un joueur qui n'utilise que
`mgmtDivisionRank` et la catégorie (le mieux classé disponible, apparié au plus
proche en rang) — 600 soirées par profil.

| Joueur-type de la carte principale | R moyen | % rentables | Attrait de carte |
|---|---|---|---|
| oracle (`mgmtFightDraw` décroissant — la T4 livrée) | +3,6 k$ | **73,8 %** | 9,78 |
| joueur d'écran (catégorie et rang seuls) | **−6,5 k$** | **9,5 %** | 7,95 |
| bâclé (inchangé) | −14,4 k$ | 0,3 % | 6,39 |

Le joueur d'écran retombe sur **R ≈ −6,5 k$**, c'est-à-dire exactement la soirée
réelle jouée en jeu le 20/09 (R = −6, trésorerie 50 → 44). Le rapport de la T4
explique cette soirée comme « un tirage sous le 5e centile » : c'est faux — elle
est la **médiane** du joueur qui ne dispose que de l'écran. La cible « une carte
complète moyenne est rentable dans 70 à 80 % des soirées » n'est donc pas
atteinte ; elle l'est seulement pour un joueur qui voit ce que le jeu lui cache.

*Réserve de méthode : la mesure de contrôle abandonne la soirée quand
`mgmtBookMain` refuse une paire au lieu d'essayer la suivante — 412 soirées
composées sur 600. C'est une sonde, pas un calibrage ; elle établit l'ordre de
grandeur et la concordance avec le jeu réel, pas le chiffre définitif.*

### Relecture de la T4 bis (21/09/2026) — acceptée

Commit `400fc42`. Le défaut de la T4 est corrigé à la racine : `composeMainEcran`
ne lit que `mgmtCartRows`, `mgmtSelectable`, `mgmtDivisionRank` et la catégorie —
la liste telle que l'écran la montre. Aucun appel à `mgmtFightDraw`, `mgmtStar`,
`mgmtPurse`, `mgmtCardAttraction` ni `mgmtEventRecette` pour **choisir** ; ces
fonctions ne servent plus qu'à **mesurer**. Le refus de `mgmtBookMain` fait essayer
le candidat suivant au lieu d'abandonner la soirée — la solution est meilleure que
la sonde du 21/09, qui abandonnait. L'ancienne heuristique subsiste comme profil
**oracle**, borne haute explicitement exclue des cibles. Le test reprend
l'heuristique de l'écran à l'identique.

Vérifications faites par Claude, pas reprises de la livraison :

- **Le test mord** : `MGMT_TICKET_PER_DRAW` mise à 0 fait échouer
  `tests/mgmtEconomie.test.js:130` (« au moins une soirée réelle non écrasée est
  rentable ») ; constante restaurée.
- **Le calibrage se reproduit** : `--n=600 --soirees=1` redonne 74,8 % de soirées
  rentables pour le joueur d'écran (77,4 % à `--n=4000`), gradient oracle > écran
  > bâclé tenu, les trois cibles atteintes.
- **Interdits tenus** : `engine-*.js`, `state/`, `ui-*.js`, `index.html`,
  `mgmt-data.js`, `mgmt-screens.js` inchangés entre `933ce41` et `400fc42`.
- **Un seul poids d'argent touché** : `MGMT_PURSE_PER_STAR` 4 → 3.35. Les
  références D4 (`MGMT_DRAW_AVG` 0.48, `MGMT_SPECTACLE_REF` 0.71) sont des mesures
  reposées sur le joueur d'écran.

**Réserve, sans conséquence sur l'acceptation.** Le test ne garde plus le plancher
global de soirées rentables qu'il portait à la T4 (`>= 0.25`) : il vérifie qu'au
moins une soirée par graine est rentable. C'est ce que le contrat demande, et
c'est cohérent avec la consigne « aucun nombre du calibrage figé en dur ». Une
garde plus solide serait de vérifier une **propriété** plutôt qu'un chiffre — que
le joueur d'écran reste plus rentable que le joueur bâclé. À faire à la T5 si on
veut, pas avant.

**Ce que la mesure a révélé, et qui sort du lot 2** : l'économie tient à la
première soirée d'une organisation neuve, puis se dégrade jusqu'à 25,5 % de
soirées rentables à la sixième, parce que le vivier fond sans que rien n'y entre.
Ce n'est pas un défaut de calibrage — aucun poids d'argent ne compense un vivier
qui fond. Consigné en **QO-8** (`docs/QUESTIONS-OUVERTES.md`), en attente d'une
décision d'Anthony.

### Relecture de la T5 (21/09/2026) — acceptée

`mgmtClosePile` sépare les deux anciens `'stuck'` : `'compose'` (carte principale
incomplète et encore composable — le joueur a la main) et `'stuck'` (pot épuisé —
le cycle avance, lot 1g). `CL.mgmtNextCycle` ne ferme plus le cycle sur
`'compose'`, et le déclencheur « Cycle suivant » n'est plus proposé dans cet état.
Aucun texte neuf, aucun `[EMPLACEMENT AUTEUR]` posé : OpenCode a pris la voie
« ne pas proposer une action qui ne ferait rien » (charte S6).

**Vérifié manette en main par Claude** (jeu réel, `http://localhost:8765`,
partie neuve, cycle 1) :

| État atteint en jeu | `mgmtClosePile` | « Cycle suivant » | Cycle |
|---|---|---|---|
| Pile vidée, carte 0/5 | `compose` | absent | ne bouge pas |
| `CL.mgmtNextCycle()` appelé trois fois dans cet état | `compose` | — | **reste à 1, carte intacte** |
| Carte 5/5 posée par le vrai geste | `none` puis `refill` | — | proposition de Leïla ouverte (T3 intacte) |
| Proposition validée | `event` | — | soirée jouée, 9 combats |

Le bug du 20/09 est éteint : trois déclenchements ne font plus passer le cycle de
6 à 9. La soirée réelle jouée au passage donne **R = 0** (trésorerie 50 → 50) —
un seul tirage, pas une mesure, mais à comparer au R = −6 d'avant le recalibrage.

`npm run check` relancé par Claude : **293 tests, 289 passants, 0 échec, 4 skip**.

**Écart accepté, et pourquoi.** OpenCode n'a pas appliqué la décision 4 à la
lettre : il n'attend que si un combat est *encore composable*
(`mgmtMainPosable`), sinon `'stuck'` avance le cycle. Pris au pied de la lettre,
« le cycle ne se ferme pas tant que la carte n'est pas composée » enfermerait le
joueur pour toujours quand le vivier fond (QO-8) — et contredirait le lot 1g
(« aucun blocage »). La garde est juste ; elle raffine la décision 4 sans la
trahir. Si Anthony veut l'attente sans garde, c'est une ligne — mais le blocage
définitif devient possible.

**Réserve d'interface, ouverte.** Dans l'état `compose`, l'écran du bureau
affiche « La pile est vide. », le déclencheur a disparu, et rien n'invite le
joueur à aller composer : seul le bouton « Carte principale » en tête de page
mène quelque part. C'est correct et silencieux, mais c'est l'endroit où une
phrase de Leïla manque — **texte d'auteur, à écrire par Anthony**. À traiter
avec les réserves d'interface 1 à 3 (lot 4).

**Réserve de contraste, ouverte.** La ligne du cycle (13 px) tombe à 4,31:1
contre le haut du dégradé, sous le 4,5:1 de la charte L2. `index.html` étant
interdit au lot 2, elle rejoint la réserve 1 au lot 4.

### État de l'économie

Une soirée réelle jouée le 20/09 (9 combats, carte composée par le joueur,
préliminaires de Leïla validés) donne **R = −6 k$** : la trésorerie passe de 50 à
44. C'est l'objet de la T4, et la raison de l'interdiction de fusionner.

### T5 — Le calendrier attend le joueur *(après T4, décision 4 du 20/09)*

- **`mgmtClosePile` distingue les deux `'stuck'`** : un code propre pour « la
  carte principale n'est pas composée, le joueur a la main » et un autre pour
  « le pot de combattants est épuisé ». Fonction pure, jamais une fonction
  concurrente ; la JSDoc dit les quatre issues.
- **`CL.mgmtNextCycle` ne ferme plus le cycle** dans le premier cas : le bureau
  reste ouvert, le joueur compose. Le pot épuisé continue d'avancer le cycle,
  comme aujourd'hui (lot 1g : aucun blocage).
- **Aucune réplique, aucun texte neuf.** Si l'écran doit dire pourquoi le cycle
  n'avance pas, c'est `[EMPLACEMENT AUTEUR]` et c'est signalé.
- **Tests** : carte principale incomplète et pile vide, le cycle ne bouge pas ;
  pot épuisé, il bouge encore ; carte complète, c'est la soirée.
- Vérification d'interface de la charte §3 si l'écran change.

## 5. Terminé pour le lot

1. Le joueur compose cinq combats, Leïla en propose quatre, la soirée en joue neuf.
2. Une sauvegarde v2, v3 ou v4 se charge sans perte en v5.
3. `npm run check` vert, aucun test existant assoupli sans décision citée.
4. La vérification d'interface de la charte §3 est livrée pour T2.
5. L'économie mesurée sur le déroulé réel permet des soirées rentables.
