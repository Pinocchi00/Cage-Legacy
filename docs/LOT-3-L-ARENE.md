# LOT 3 — L'arène

*Contrat de lot. Écrit le 21/09/2026 par Claude, réécrit le même jour sur la
décision d'Anthony : l'arène est refaite à neuf, l'ancienne est retirée, et la
neuve sert les deux modes.*

Répond aux constats **C2** (la soirée ne se regarde pas), **C3** (les combats ne
laissent aucune trace), **M3** (regarder un combat : récit, moments clés, vue
animée) et **M4** (l'historique de chaque combattant) de `docs/AUDIT-17-09.md`.
Dernier lot de la tranche verticale : *une soirée que le joueur compose
lui-même, puis qu'il regarde*.

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`
(§ Direction artistique, § L'affichage du combat, § Les déplacements et le
réalisme — décidés le 17/09 après maquettes et prototypes),
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/AUDIT-17-09.md`.
**Référence visuelle et gestuelle** : `prototypes/arene.html`, validé le 17/09.

---

## 0. Décisions d'auteur du 21/09/2026

1. **L'arène est refaite à neuf.** `ui-09-arena.js` (655 lignes) est retirée.
2. **Une seule arène pour les deux modes** — management et Carrière Complète.
   Le mode carrière entre donc dans le périmètre des lots pour la première fois
   depuis le lot 0.
3. **Trois façons de traverser une soirée** : voir les combats un à un, tout
   simuler d'un coup, ou simuler un combat à la fois.
4. **« Je veux vraiment que tout n'ait pas l'air simulé, je veux du réalisme
   autant que possible. »** C'est l'exigence qui commande ce lot — traduite en
   cibles mesurables au §2.

---

## 1. Le principe fondateur : le moteur décide, l'arène met en scène

C'est la règle la plus importante du lot, et la plus facile à enfreindre sans
s'en apercevoir.

`prototypes/arene.html` **n'est pas un afficheur** : c'est un simulateur complet,
avec sa propre intelligence de combat (`thinkStanding`, `moveStanding`,
`escape`) et son propre tirage. Il décide lui-même qui touche et qui gagne.

**Il ne décidera plus rien.** La vision l'a déjà écrit : ses repères chiffrés
sont « à conserver **quand le moteur du jeu prendra le relais** ». Le prototype
apporte **l'allure et le geste** ; `simulateFight` apporte **la vérité**.

Deux références, chacune dans son domaine, et aucune des deux ne déborde :

| Ce que l'arène ne décide JAMAIS (le moteur le dit) | Ce que l'arène invente (le moteur ne le dit pas) |
|---|---|
| Qui touche, qui encaisse, quand | Où sont les deux pions sur le tapis |
| La phase à chaque moment (debout, clinch, sol) | Comment ils y sont arrivés : entrées, sorties, angles |
| Les amenées au sol, les positions nommées | Le rythme des pas, les feintes, la garde |
| Le vainqueur, la méthode, le round, le geste | La caméra, le juice, les ralentis |
| Les cartes des juges | Les temps morts entre deux moments du moteur |

**Vérifié le 21/09** : le moteur rend 41 moments pour un combat de trois rounds,
avec `phase` (`debout`, `clinch`, `sol`) et une position grossière (`cage`,
`closedGuard`, ou rien) — **aucune coordonnée, aucune distance, aucun angle**.
Entre deux moments du moteur, il s'écoule en moyenne une vingtaine de secondes
de combat. **C'est dans ces trous que le réalisme se gagne ou se perd**, et
c'est là que l'arène travaille.

Créer une seconde simulation des résultats est un **interdit dur** : le moteur
est calibré depuis des mois, deux simulations divergeraient, et tout le
calibrage deviendrait faux.

---

## 2. « Que ça n'ait pas l'air simulé » — traduit en cibles mesurables

L'exigence d'Anthony ne reste pas une intention. Un outil dans `tools/`
l'instrumente, comme le calibrage de l'économie et le monde extérieur.

**Cible 1 — Cohérence : l'image ne ment jamais sur ce que dit le moteur.**
À tout instant, la phase à l'écran est celle du moteur. Un moment au sol
n'affiche jamais deux pions debout, un clinch n'affiche jamais deux pions à
distance. Mesure : échantillonner l'état de l'arène à intervalles réguliers sur
un grand nombre de combats et comparer à la phase du déroulé. **Aucun écart
toléré : la cible est 100 %.**

*Décision d'Anthony du 23/09/2026 — la fenêtre de transition devient physique.*
Quand le moteur change de phase, les corps ont besoin de temps pour suivre : si
le déroulé dit « clinch » alors que les deux hommes sont à 3 m, il leur faut
environ une seconde pour se rejoindre. Cette approche n'est pas un mensonge de
l'image, c'est ce qu'on verrait dans une vraie cage. **Après chaque changement
de phase, la cible 1 tolère le temps qu'il faut pour franchir l'écart à une
vitesse humaine, au plus 1,5 s.** Hors de ces fenêtres, la cible reste 100 %.
La mesure publie la distribution de ces fenêtres : une fenêtre qui atteint
souvent son plafond de 1,5 s signale des pions mal placés avant la transition.

**Cible 2 — Continuité : personne ne se téléporte, et personne ne glisse.**
*Réécrite le 22/09/2026 après le constat d'Anthony sur le socle de la T2 : « les
combattants bougent si lentement ». La cible n'avait qu'un plafond et aucun
chiffre ; il lui manquait un plancher, et la mesure du socle ne la regardait
pas.*

L'octogone est à l'échelle réelle (vision § L'affichage du combat), donc une
vitesse se lit en mètres par seconde et se compare à un homme. **Trop lent est
un défaut au même titre que trop rapide** : un pion qui dérive glisse, il ne
combat pas.

Ce qui a été mesuré sur le socle de la T2, un combat réel de 553 s :

| | Mesuré | Référence humaine |
|---|---|---|
| Vitesse moyenne d'un pion | **0,08 m/s** | un homme qui marche : 1,4 m/s |
| Distance parcourue sur 9 min de combat | 44 m | — |
| Vitesse de pointe | **11,9 m/s** | sprint olympique : ~12 m/s |

Dix-sept fois trop lent en moyenne, et un saut à vitesse de sprinteur. Le
déplacement du socle est donc **figé, puis téléporté** — le pire des deux.

**Les bornes, posées avant la mesure de la T3 :**

- **En phase debout**, la vitesse instantanée d'un pion tient dans
  **[0,8 ; 2,0] m/s** l'essentiel du temps — l'ordre de grandeur d'un combattant
  qui se déplace en garde, entre le pas d'ajustement et l'entrée franche.
- **Aucune pointe au-dessus de 6 m/s**, jamais, dans aucune phase. Un homme de
  MMA qui explose vers l'avant ne dépasse pas cet ordre de grandeur.
- **Au sol et au clinch**, la contrainte porte sur la paire, pas sur le pion :
  les deux centres ne se séparent pas plus vite que les bornes ci-dessus.

**Et la mesure n'exclut plus la fenêtre de réarrangement.** La mesure de la
cible 1 livrée à la T2 l'excluait (`ARENE_MORPH_S`, 0,6 s après un changement de
phase) : c'est défendable pour juger d'une *phase*, et c'est exactement là que
vit la téléportation. **La cible 2 mesure toutes les images, sans exception.**
Un réarrangement est un déplacement comme un autre : un homme qu'on amène au sol
met un temps à tomber, il ne traverse pas la cage.

**Un seul saut au-dessus de 6 m/s est un défaut**, et une moyenne debout
en dehors de la fourchette aussi.

**Cible 3 — Ils ne tournent pas en rond.**
La vision l'exige mot pour mot. `prototypes/arene.html`, validé le 17/09, **est
la référence du déplacement** comme le moteur est la référence du résultat. Le
déplacement de la nouvelle arène doit avoir la même signature statistique que
celle du prototype — part de mouvement latéral contre avant-arrière, fréquence
des entrées et sorties, temps passé au centre contre le long du grillage. La
bande d'acceptation se pose **avant** de mesurer, et se publie.

*23/09/2026 : tenue par construction, sans campagne de mesure.* La T3 porte le
déplacement du prototype au lieu d'en inventer un (§3 T3). Même code de pas, même
signature. Aucune mesure statistique n'est exigée ; l'œil d'Anthony tranche.

**Cible 4 — On reconnaît un style au déplacement seul.**
« Le pressureur coupe la cage, le contreur recule et se fait enfermer. » Le
dépôt sait déjà prouver ce genre de chose : `tools/style-fingerprint-classify.js`
vérifie qu'on reconnaît le style d'un combattant à ses seules statistiques
(constat G1). Même exigence ici, sur le déplacement : la distance moyenne tenue,
le temps passé à couper la cage et le sens des déplacements doivent séparer un
pressureur d'un contreur **nettement mieux que le hasard**. Le seuil se pose
avant la mesure.

*23/09/2026 : la mesure est reportée, l'exigence demeure.* Le prototype règle
déjà son déplacement sur le style (`plan.aggr`, `plan.range`, `plan.angle`) :
le portage de la T3 l'obtient presque gratuitement, à condition de nourrir ces
paramètres. La campagne de classification ne se fera que si l'œil d'Anthony
ne reconnaît pas les styles.

**Ce que la mesure ne fera pas.** Elle attrape les défauts, elle ne crée pas la
beauté. Le timing, les accélérations, le poids d'un coup, le silence avant un
gros échange — ça ne se mesure pas, ça se regarde. **Chaque tranche qui touche
l'arène se joue devant Anthony avant d'être acceptée**, et son avis prime sur
les chiffres.

---

## 3. Découpage en tranches

Une tranche à la fois, relue par Claude avant la suivante.

### T1 — La trace *(aucune interface)*

- **Chaque combat laisse de quoi être rejoué**, et l'historique ne se perd plus à
  la soirée suivante (C3).
- **Ce qui est gardé, et ce qui se régénère.** Garder le déroulé complet de
  chaque combat ferait enfler la sauvegarde sans fin. Le dépôt a déjà répondu
  ailleurs : `mgmtCombatProfile` ne stocke que la graine et régénère à
  l'identique (lot 3a), le monde extérieur dérive tout de la sienne (lot 2B T1).
  **Même principe** : garder de quoi **rejouer** le combat, pas le combat.
- **Le piège** : les lignes changent après le combat (bilan, traumatisme).
  Rejouer sur les lignes d'aujourd'hui ne redonne pas le combat d'hier. Ce qui
  est gardé doit reconstituer l'état **d'avant combat**, et rien de plus.
- **Vérification exigée** : un combat rejoué depuis sa trace redonne exactement
  le même déroulé — même vainqueur, même méthode, même round, même déroulé,
  moment pour moment.
- **Coût mesuré** : la taille de la sauvegarde après vingt soirées, publiée.
- **Tests** : le rejeu est fidèle au moment près ; l'historique survit à
  plusieurs soirées ; la migration charge une sauvegarde d'avant le lot sans
  perte.

#### Relecture de la T1 (21/09/2026) — acceptée

Vérifications faites par Claude sur ses **propres graines**, et non reprises de
la livraison :

| Ce qui était en jeu | Comment | Résultat |
|---|---|---|
| `mgmtRunEvent` tire ses combats **exactement comme avant** (interdit dur) | Empreinte de 12 soirées sur 4 graines (5150, 90210, 271828, 1618) — appariements, vainqueurs, familles, rounds, recette, trésorerie — relevée avant et après la tranche | **identiques** |
| Le rejeu redonne le combat **réellement joué** | 5 graines × 4 soirées = **180 combats**, rejoués longtemps après, les lignes ayant changé entre-temps | **180/180**, aucune anomalie |
| Le rejeu est stable | Chaque combat rejoué deux fois, déroulés comparés | **180/180 identiques** |
| Le rejeu ne déplace pas la RNG du jeu | `SEED` relevé avant et après l'historique entier | **intact** |
| Interdits | `git diff` sur moteur, `state/`, `ui-*`, `index.html`, `mgmt-screens.js` | **vide** |
| Coût de la sauvegarde | Outil relancé, graine 20260919 | **79,8 Ko après 20 soirées**, dont 61 Ko d'historique — ~3,1 Ko/soirée |
| `npm run check` | Relancé par Claude | **312 tests, 308 passants, 0 échec, 4 skip** |

**Tests réécrits, à juste titre.** Quatre assertions de `mgmtCard.test.js`
figeaient `v5` en dur ; elles lisent désormais `MGMT_SAVE_VERSION`. C'est plus
fort qu'avant — elles ne seront plus à réécrire à la prochaine migration — et
rien n'est assoupli.

**Limite inhérente, signalée par OpenCode et à traiter à la T2.** Le rejeu est
fidèle *sous la version du moteur qui a produit la trace*. Si `engine-combat.js`
évolue, un vieux combat rejoué pourra diverger. L'issue, elle, ne se perd pas :
`winner`, `family` et `round` sont stockés et restent vrais.
**Conséquence pour l'arène : avant d'afficher un rejeu, comparer son issue à
celle qui est stockée, et refuser de montrer un rejeu divergent.** Une arène qui
montre un combat finissant autrement que ce que l'historique annonce est un
mensonge à l'écran — exactement ce que le §1 interdit. À inscrire dans la T2.

**Corroboration de QO-8, au passage.** La mesure relève **31 retraités médicaux
sur 48 lignes après 20 soirées**, et une autre graine n'a atteint que 18 soirées
en 150 cycles faute de combattants. C'est le vivier qui fond, mesuré une seconde
fois par un chemin indépendant.

### T2 — Le socle de l'arène neuve *(interface — vérification charte §3)*

- Un fichier neuf, l'octogone en vue de trois quarts à l'échelle réelle, tapis
  clair et grillage noir, pions à plat jamais surélevés, arbitre dans la cage.
- **Piloté par le déroulé du moteur**, jamais par une simulation propre (§1).
- Les phases se lisent à l'œil ; chaque action a sa signature (trait droit pour
  un poing, arc pour un pied, ruée pour une amenée au sol, arc qui se referme
  pour une soumission).
- **Cible 1 (cohérence) atteinte et publiée** à la fin de cette tranche.
- **L'ancienne arène n'est pas encore retirée** : les deux coexistent le temps
  d'une tranche, la carrière continue d'utiliser l'ancienne.

### T3 — Le déplacement *(le cœur du réalisme)*

**Troisième cadrage, 23/09/2026 : on porte le déplacement du prototype, on ne
l'invente plus.** À lire avant tout le reste de cette section.

*Pourquoi.* La première tentative a duré douze heures sans commit. Elle a
construit un déplacement par images-clés — des segments interpolés puis
raccordés — et ce modèle produit des sauts à ses raccords par nature : 74,6 m/s
mesurés à l'entrée d'un clinch, pire que les 11,9 m/s du socle. Deux causes,
et la première est de la supervision : **le contrat que l'outil avait dans son
répertoire ne contenait pas la cible 2 réécrite** (base `f29edac`, antérieure
à la réécriture) ; la seconde est que la tranche demandait d'*inventer* un
modèle qui existait déjà. Le travail est archivé hors dépôt ; l'arbitre y
était réglé (1,75 m/s de pointe), l'idée se refait en dix lignes.

*Ce que la tranche fait.* `prototypes/arene.html` — validé par Anthony le 17/09
— contient un déplacement complet : `moveStanding` (l. 176) et `escape`
(l. 200). Pas à durée (0,16 à 0,3 s) et vitesse propres, distance préférée,
recul, échappée vers le côté ouvert quand on est plaqué, miroir latéral à
courte distance. **Il fonctionne par la physique** : la position intègre une
vitesse, la vitesse est lissée — **une téléportation y est impossible par
construction.** La T3 porte ces deux fonctions dans l'arène neuve, et les
nourrit avec ce que dit le déroulé du moteur :

- **la cible de chaque instant** vient de la phase du moteur : distance de
  travail debout (1,5 à 2,5 m, variable), contact au clinch, grillage si le
  clinch est porté `pos:cage`, position nommée au sol ;
- **les paramètres de style** du prototype (`plan.aggr`, `plan.range`,
  `plan.angle`, vitesse) se dérivent de ce que chaque combattant **a fait** selon
  le résultat (`res.stats` : part des frappes à distance, au clinch, tentatives
  d'amenée) — jamais de `G`, l'entrée de l'arène reste `(res, noms)` ;
- **sonné, au tapis** viennent des moments du déroulé qui le déclarent.

*Ce que le prototype fait et que l'arène ne doit PAS reprendre* : `thinkStanding`
et tout ce qui choisit un coup, un résultat ou un moment. Le prototype était un
simulateur ; seule sa **marche** est reprise (§1). Son `rng()` devient le tirage
local à graine de l'arène (`areneAlea`), jamais `Math.random()`.

*L'arbitre* suit la même physique, du côté le plus ouvert, et **mémorise son
côté** : il n'en change que si l'autre devient nettement plus ouvert (marge de
l'ordre de 0,9 m, valeur de la première tentative).

*Ce qui remplace la T3 bis.* Il n'y a plus de T3 bis : la cible 3 est tenue par
construction et la mesure de la cible 4 est reportée (§2). La T3 publie les
cibles 1 et 2, rien d'autre.

*Le cadrage du 22/09 ci-dessous reste valable pour le constat* (la glisse, la
distance debout, l'arbitre) ; c'est la méthode qui change.


*Recadrée le 22/09/2026 : Anthony a regardé le socle de la T2 et a relevé deux
choses — « les combattants bougent si lentement » et « l'arbitre fait des
va-et-vient ». Les deux sont vérifiées, localisées, et deviennent le cœur de la
tranche.*

**Le défaut à corriger, précisément.** `arene-etat.js` (fonction `areneMoment`)
remplit l'intervalle entre deux moments du moteur par **une seule interpolation
lissée**, de la position de départ vers la position d'arrivée, étalée sur tout
le segment. Il n'y a ni pas, ni appui, ni retour : il y a une translation. D'où
les 0,08 m/s mesurés, et l'impression de glisse. La « respiration latérale »
(±5 cm sinusoïdaux) ne compense rien — elle ajoute du flottement, pas du
déplacement.

- Les combattants **tiennent leur distance, feintent, entrent, ressortent**, et
  ne prennent un angle que pour une raison. Ils changent de plan en cours de
  combat. Un pas est un pas : il a une longueur, un début et une fin.
- **La distance debout est une distance de frappe, pas un contact.**
  `ARENE_DEBOUT_MIN` vaut 0,85 m dans une cage de 8,6 m : à l'œil, les deux pions
  se touchent presque pendant que le bandeau annonce « À DISTANCE ». La distance
  de travail réelle tient plutôt entre **1,5 et 2,5 m**, et elle **varie** —
  c'est sa variation qui fait lire l'échange.
- **L'arbitre cesse de faire des va-et-vient.** Le défaut est dans
  `areneRefAvance` (`arene-etat.js`) : l'arbitre vise un point à 2,3 m
  perpendiculairement à l'axe des deux combattants, et **choisit son côté à
  chaque image** par `areneBordDist(c1) > areneBordDist(c2)`. Sans hystérésis :
  quand les deux côtés se valent, le choix alterne et la cible saute de 4,6 m en
  travers de la cage ; et quand les combattants pivotent l'un par rapport à
  l'autre, la perpendiculaire change de signe et les deux côtés s'échangent. Il
  faut **mémoriser le côté choisi et n'en changer que s'il devient nettement
  moins bon**. Un arbitre se déplace aussi comme un homme : les bornes de la
  cible 2 s'appliquent à lui.
- **Cibles 1 et 2 atteintes et publiées** (23/09 : la 3 est tenue par
  construction, la mesure de la 4 est reportée), rapport dans `tools/reports/`.
  La cible 2 porte un plancher autant qu'un plafond et **se mesure sur toutes les
  images, sans exception** (§2) ; la cible 1 tolère la fenêtre de transition
  physique décidée le 23/09.
- Le juice suit l'importance : petit éclat pour une touche, secousse et ralenti
  pour un gros coup, anneau pointillé pour un combattant sonné.
- **Ni note, ni barème, ni jauge.** L'état d'un combattant se lit à son pion et
  à ce qu'il fait.
- **Le moteur décide toujours tout** (§1). Un déplacement plus riche ne donne
  aucune décision à l'arène : qui touche, qui gagne et quand restent au déroulé.
  Si la T3 a besoin de savoir quelque chose que le déroulé ne dit pas, elle
  l'invente **pour l'œil**, jamais pour le résultat.
- **Se joue devant Anthony avant d'être acceptée.**

### T4 — Les deux modes basculent, l'ancienne arène est retirée

- La soirée du management se regarde (C2, M3), avec les **trois commandes**
  (décision 3) : voir un à un, tout simuler, simuler un par un.
- La carrière bascule sur l'arène neuve.
- **`ui-09-arena.js` est retirée.**
- **Les gardes de régression se déplacent, elles ne disparaissent pas.** Une
  vingtaine de lignes de `tests/regressionFixes.test.js` couvrent l'ancienne
  arène et encodent de vrais bugs déjà corrigés — le halo de soumission qui ne
  s'allumait plus, le round de la cloche toujours faux, la pause entre rounds
  qui figeait. Ces tests se réécrivent **en citant la décision 1 du 21/09**, et
  la nouvelle arène doit couvrir **les mêmes comportements**. Un comportement
  dont la garde disparaît est un défaut de la tranche.
- **Se joue devant Anthony**, dans les deux modes, avant d'être acceptée.

### T5 — L'historique consultable *(après T4)*

- La fiche d'un combattant montre ses combats : contre qui, comment, quand
  (M4) — et permet d'en **revoir** un, par le rejeu de la T1 et l'arène de la T3.
- `esc()` sur tout nom affiché, souris d'abord, clavier en accélérateur.

---

## 4. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `state/*.js`.
  `git diff <base> -- engine-*.js state/` doit rester vide.
- **Jamais une seconde simulation des résultats** (§1). L'arène met en scène ce
  que le moteur a décidé, elle ne décide rien.
- **Jamais deux arènes à la fin.** La coexistence de la T2 et de la T3 est
  temporaire ; à la fin de la T4 il n'en reste qu'une.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Les textes que
  l'arène affiche viennent du moteur, qui les produit déjà.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test assoupli** sans citer la décision qui change le comportement
  attendu ; et aucune garde de régression supprimée sans équivalent (T4).
- `index.html` : uniquement les lignes `<script src>` qu'exigent l'arrivée de la
  nouvelle arène et le retrait de l'ancienne.
- **Règle d'arrêt** *(23/09/2026, décision d'Anthony après douze heures sans
  commit)*. Si la cible de la tranche n'est pas atteinte au bout de **deux heures
  de travail**, l'outil s'arrête : il commite son état sur sa branche avec un
  message qui le dit, et rapporte ce qui marche, ce qui bloque et ce qu'il a
  essayé. On décide ensuite à deux, au lieu de s'enfoncer.
- **Les sondes de débogage restent hors du dépôt.** Seul l'outil de mesure livré
  entre dans `tools/` ; les scripts d'exploration vivent ailleurs et ne sont
  jamais commités.

---

## 5. Terminé pour le lot

1. La soirée se regarde, avec les trois commandes ; la carrière aussi.
2. Un combat rejoué depuis sa trace redonne exactement le même déroulé.
3. L'historique d'un combattant se consulte, et un combat passé se revoit.
4. Les quatre cibles du §2 sont atteintes et publiées.
5. Il ne reste qu'une arène dans le dépôt, et aucune garde de régression perdue.
6. `npm run check` vert.
7. La vérification d'interface de la charte §3 est livrée pour T2, T4 et T5, et
   **Anthony a joué** les tranches T3 et T4.

---

## 6. Ce qui n'est pas tranché

1. **Le son.** Rien dans la vision ni dans les maquettes n'en parle, et le jeu
   n'en a aucun. Une arène muette est un choix — il n'a pas été fait.
2. **Les trois commandes de la T4 : que voit-on quand on « simule » ?** Le
   résultat seul, ou un résumé des moments clés ? La décision 3 donne les trois
   portes, pas ce qu'il y a derrière deux d'entre elles.
