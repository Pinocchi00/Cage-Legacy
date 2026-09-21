# LOT 3 — L'arène

*Contrat de lot. Écrit le 21/09/2026 par Claude.*

Répond aux constats **C2** (la soirée ne se regarde pas), **C3** (les combats ne
laissent aucune trace), **M3** (regarder un combat : récit, moments clés, vue
animée) et **M4** (l'historique de chaque combattant) de `docs/AUDIT-17-09.md`.
Quatrième et dernier lot de la tranche verticale : *une soirée que le joueur
compose lui-même, puis qu'il regarde* (audit §8).

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`
(§ Direction artistique et § L'affichage du combat, décidés le 17/09 après
maquettes et prototypes), `docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis
`docs/AUDIT-17-09.md` (constats C2, C3, M3, M4, G1, G2).
**Référence visuelle** : `prototypes/arene.html`, validé le 17/09.

---

## 0. Le point de départ : tout existe déjà, et tout est jeté

Ce lot n'invente presque rien. Le moteur **produit déjà** ce qu'il faut pour
regarder un combat — constat G2 de l'audit, vérifié sur le code le 21/09 :

`simulateFight` rend, pour chaque combat, `log` (le déroulé granulaire, une
entrée par moment, avec `phase`, `pos`, `by`, `text`, `momentum` et deux
instantanés d'état `snapA`/`snapB`), `stats`, `roundStats`, `judges`, `moveName`,
`moveFlavor`, `zone`, `finishTime`, `detail`, les blessures et les cartes des
juges.

**Et `mgmtRunEvent` jette tout**, sauf le vainqueur, la famille de méthode et le
round — et seulement pour la dernière soirée, que la suivante écrase. C'est
exactement le constat C3.

L'arène animée du mode carrière (`ui-09-arena.js`, 655 lignes, Canvas 2D) lit
déjà ce `log` pour animer un combat. **Elle n'est pas réutilisable en l'état** :
voir §2.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Regarder sa soirée au lieu d'en lire le résultat : voir les combats se dérouler
dans l'octogone, lire les moments clés, savoir qui a gagné et de quelle façon.
Puis, plus tard, rouvrir la fiche d'un combattant et **revoir** n'importe lequel
de ses combats.

---

## 2. L'obstacle, et la décision qu'il demande

`ui-09-arena.js` ne se branche pas sur le management tel quel. Sa fonction
d'entrée `buildTimeline()` lit **l'état de la carrière en dur** :
`G.pending.res`, `G.f`, `G.fight.opp`, `G.pending.win`. Le management n'a rien de
tout cela.

Trois issues, une seule est bonne :

1. **Écrire une seconde arène pour le management.** Interdit : « ne jamais créer
   un système parallèle à un système existant » (`CLAUDE.md` §8). Ce serait
   655 lignes de Canvas dupliquées, à maintenir en double pour toujours.
2. **Fabriquer un faux état de carrière** avant d'appeler l'arène. Fragile,
   pollue `G`, et casse à la première évolution de la carrière.
3. **Déplacer la couture** : `buildTimeline()` reçoit son résultat et ses deux
   noms **en paramètres** au lieu de les lire dans `G` ; la carrière lui passe ce
   qu'elle lisait déjà. Le rendu, lui, ne change pas d'une ligne.

**La troisième demande d'ouvrir `ui-09-arena.js`, normalement interdit.** C'est
le même geste que le découpage de `mgmt-bureau.js` du 21/09 : un déplacement de
couture, sans changement de comportement, gardé par les tests existants de la
carrière et du duel. **Décision demandée à Anthony** (§6, point 1).

---

## 3. Découpage en tranches

Une tranche à la fois, relue par Claude avant la suivante.

### T1 — La trace *(aucune interface)*

- **Chaque combat laisse de quoi être rejoué**, et l'historique ne se perd plus à
  la soirée suivante (C3). `m.lastEvent` garde son rôle ; un **historique par
  combattant** s'y ajoute.
- **Ce qui est gardé, et ce qui se régénère.** Garder le `log` complet de chaque
  combat de chaque soirée ferait enfler la sauvegarde sans fin — neuf combats par
  soirée, une douzaine de moments chacun, avec deux instantanés par moment. Le
  dépôt a déjà répondu à cette question ailleurs : `mgmtCombatProfile` **ne
  stocke que la graine** et régénère le profil à l'identique (lot 3a), et le monde
  extérieur du lot 2B dérive tout de sa graine. **Même principe ici** : la trace
  garde de quoi **rejouer** le combat, pas le combat.
- **Attention, le piège** : les lignes changent après le combat (bilan,
  traumatisme). Rejouer `simulateFight` sur les lignes d'aujourd'hui ne redonne
  **pas** le combat d'hier. Ce qui est gardé doit donc suffire à reconstituer
  l'état **d'avant combat** des deux combattants, et rien de plus.
- **Vérification exigée** : un combat rejoué depuis sa trace redonne
  **exactement** le même déroulé — même vainqueur, même méthode, même round,
  même `log`, moment pour moment. Un test le prouve.
- **Coût mesuré** : la taille de la sauvegarde après vingt soirées, publiée.
- **Tests** : rejouer est fidèle au moment près ; l'historique survit à plusieurs
  soirées ; la sauvegarde encaisse la croissance (`validateMgmt`, `mgmtRepair`) ;
  la migration charge une sauvegarde d'avant le lot sans perte.

### T2 — La couture de l'arène *(déplacement pur — voir §2)*

- `buildTimeline()` reçoit son résultat et ses noms en paramètres. La carrière
  lui passe ce qu'elle lisait dans `G`. **Aucun changement de rendu, aucun test
  de carrière ni de duel modifié.**
- Rien d'autre dans `ui-09-arena.js` ne bouge.
- **Vérification** : l'arène de la carrière se joue en jeu réel, à l'identique.

### T3 — La soirée se regarde *(interface — vérification charte §3 obligatoire)*

- La soirée branche l'arène sur chaque combat (C2, M3). Vue de trois quarts,
  pions à plat, octogone à l'échelle, arbitre dans la cage — vision
  § L'affichage du combat, référence `prototypes/arene.html`.
- **Le texte est réservé aux moments clés**, une ligne à la fois ; le reste part
  dans le journal du combat.
- **Ni note, ni barème, ni jauge à l'écran.** L'état d'un combattant se lit à son
  pion et à ce qu'il fait.
- **Deux vitesses et un bouton « moment suivant »** suffisent : les temps morts
  défilent vite, les échanges ralentissent.
- **L'habillage complet des maquettes n'est pas dans ce lot** — c'est le lot 4.
  Ici, l'écran reprend l'habillage actuel du management ; seule l'arène est
  neuve.

### T4 — L'historique consultable *(après T3)*

- La fiche d'un combattant montre ses combats : contre qui, comment, quand
  (M4) — et permet d'en **revoir** un, par le rejeu de la T1 et l'arène de la T3.
- `esc()` sur tout nom affiché, souris d'abord, clavier en accélérateur.

---

## 4. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `state/*.js`, `index.html`.
  `git diff <base> -- engine-*.js state/` doit rester vide.
- **`ui-09-arena.js` : uniquement la couture de la T2**, et rien d'autre. Les
  autres `ui-*.js` restent intacts, sauf `ui-11-keys.js` si une touche l'exige.
- **Jamais une seconde arène.** Un seul moteur de rendu de combat dans le dépôt.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Les textes que
  l'arène affiche viennent du moteur, qui les produit déjà — on n'en écrit aucun.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test existant assoupli** sans citer la décision qui change le
  comportement attendu.

---

## 5. Terminé pour le lot

1. La soirée se regarde : chaque combat se déroule dans l'octogone, les moments
   clés se lisent.
2. Un combat rejoué depuis sa trace redonne exactement le même déroulé.
3. L'historique d'un combattant se consulte, et un combat passé se revoit.
4. L'arène de la carrière est inchangée, vérifiée en jeu.
5. `npm run check` vert, aucun test existant assoupli.
6. La vérification d'interface de la charte §3 est livrée pour T3 et T4.

---

## 6. Ce qui n'est pas tranché, et qu'Anthony doit décider

1. **Ouvrir `ui-09-arena.js` pour la couture de la T2 ?** (§2) Sans cela, le lot
   est impossible sans dupliquer l'arène — ce que les règles interdisent.
2. **Une soirée se regarde-t-elle combat par combat, ou d'un seul tenant ?** Neuf
   combats animés à la suite, c'est long. Le joueur doit-il pouvoir en sauter un,
   n'en regarder que la fin, ou tout enchaîner ? La vision donne deux vitesses et
   un « moment suivant » **à l'intérieur** d'un combat, mais ne dit rien de
   l'enchaînement des neuf.
