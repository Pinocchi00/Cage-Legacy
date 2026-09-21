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

**Cible 2 — Continuité : personne ne se téléporte.**
L'octogone est à l'échelle réelle (vision § L'affichage du combat). Le
déplacement d'un pion entre deux images reste sous une vitesse humaine plausible,
en mètres par seconde. Mesure : le déplacement maximal observé sur un grand
nombre de combats, rapporté à l'échelle de la cage. **Un seul saut au-dessus du
seuil est un défaut.**

**Cible 3 — Ils ne tournent pas en rond.**
La vision l'exige mot pour mot. `prototypes/arene.html`, validé le 17/09, **est
la référence du déplacement** comme le moteur est la référence du résultat. Le
déplacement de la nouvelle arène doit avoir la même signature statistique que
celle du prototype — part de mouvement latéral contre avant-arrière, fréquence
des entrées et sorties, temps passé au centre contre le long du grillage. La
bande d'acceptation se pose **avant** de mesurer, et se publie.

**Cible 4 — On reconnaît un style au déplacement seul.**
« Le pressureur coupe la cage, le contreur recule et se fait enfermer. » Le
dépôt sait déjà prouver ce genre de chose : `tools/style-fingerprint-classify.js`
vérifie qu'on reconnaît le style d'un combattant à ses seules statistiques
(constat G1). Même exigence ici, sur le déplacement : la distance moyenne tenue,
le temps passé à couper la cage et le sens des déplacements doivent séparer un
pressureur d'un contreur **nettement mieux que le hasard**. Le seuil se pose
avant la mesure.

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

- Les combattants tiennent leur distance, feintent, entrent, ressortent, et ne
  prennent un angle que pour une raison. Ils changent de plan en cours de combat.
- **Cibles 2, 3 et 4 atteintes et publiées**, rapport dans `tools/reports/`.
- Le juice suit l'importance : petit éclat pour une touche, secousse et ralenti
  pour un gros coup, anneau pointillé pour un combattant sonné.
- **Ni note, ni barème, ni jauge.** L'état d'un combattant se lit à son pion et
  à ce qu'il fait.
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
