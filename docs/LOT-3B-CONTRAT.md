# LOT 3B — Contrat de lot : carte incomplète

**Date :** 15/09/2026 (révision 2 — réponses d'Anthony aux questions Q1 à Q4)
**Statut :** brouillon — **à valider par Anthony avant toute ligne de code**
**Rédigé par :** Claude (orchestration). **Implémentation :** OpenCode, GLM 5.3.
**Sources qui font foi :** `docs/LOT-3B-CARTE-INCOMPLETE.md` (textes et décisions
d'auteur du 14/09), `docs/QUESTIONS-OUVERTES.md` (QO-1 à QO-7), CDC management et
addendums, `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md` (§5 et §10).
**Base :** `main` à `35ca7de`, `npm run check` vert (241 tests, 235 passants, 6 skip).

---

## 0. Ce que révèle l'inspection du code

Le lot 3B décrit des conséquences (dette, recette, audience, humeur du patron) qui
reposent sur des fondations **absentes du code** au 15/09 :

| Fondation | État dans le code |
|---|---|
| Trésorerie, cachets, recette d'une soirée | Aucun champ d'argent dans `mgmtDefault()`. `m.lastEvent` ne stocke que combats et touchés. |
| Audience | Rien. |
| Relations patron / diffuseur | Rien de calculé. Seule existe la liste de faits `m.facts` (`mgmtAddFact`, 10 max). L'addendum §1 dit que la réputation est **la somme pondérée des faits** : c'est ce socle qu'il faut étendre, pas un second système. |
| Structure de la carte | Liste plate de 4 combats (`MGMT_CARD_SIZE = 4`), alimentée par Leïla. Ni main card, ni prélims. |
| Le « dernier mois » avant la soirée | N'existe pas. Aujourd'hui, pile vide + carte complète → soirée immédiate (`mgmtClosePile`). Le retrait arrive **sur une carte déjà constituée** : il lui faut une période entre verrouillage et soirée (annoncée par le lot 3a §10). |
| Le retrait d'un combattant (A1/A2) | **Absent de QO-1 à QO-7.** C'est pourtant le déclencheur de tout le lot. |
| Vivier extérieur (autre organisation, libres) | Rien : le roster est figé à la génération (`mgmtNewRoster`). |

Conséquence : le lot est découpé en tranches qui posent d'abord ces fondations,
chacune jouable et vérifiable seule.

**Collision de nom à connaître :** le lot 3a §10 annonçait « Exception : Clara —
mises en œuvre au lot 3b ». Le document `LOT-3B-CARTE-INCOMPLETE.md` a pris ce
nom pour autre chose. Clara reste **hors périmètre** de ce contrat.

---

## 1. Décisions d'auteur intégrées (15/09/2026)

### QO-5 — Plafond de découvert

Anthony : *« en théorie c'est impossible d'être à découvert la première soirée »*.
Il délègue le reste du calcul à Claude. Formalisation :

**Un seul solde.** L'organisation a une trésorerie `T` (entier, en k$). Le découvert
n'est pas un compteur séparé : c'est `T` sous zéro. `dette = max(0, −T)`.

**Recette nette d'une soirée** `R` = revenus − cachets. Elle peut être négative.
On garde les deux dernières : `R₁` (la plus récente) et `R₂`.

**Plafond** `P` :

| Soirées déjà jouées | Plafond |
|---|---|
| 0 | `P = 0` (plancher fixe = 0 : aucun découvert possible avant la première soirée) |
| 1 | `P = max(0, R₁)` |
| 2 ou plus | `P = max(0, arrondi((R₁ + R₂) / 2))` |

**Short notice autorisé** si et seulement si `T − coût ≥ −P`.
Au-delà, le short notice n'est plus proposé ; restent les prélims et la carte réduite.

**Remboursement « avant tout bénéfice » :** automatique, puisque la recette s'ajoute
au solde : `T ← T + R`. Tant que `T < 0`, rien n'est bénéfice.

**Réplique E1** (patron) : déclenchée si et seulement si `T < 0` avant la soirée
**et** `R > 0` (une dette a effectivement été déduite).

Pourquoi ces choix :
- `max(0, …)` : une soirée perdante ne donne aucun crédit. Sans ce plancher, un
  mauvais résultat produirait un plafond négatif, qui n'a pas de sens.
- La moyenne des deux dernières lisse une soirée chanceuse : un seul coup d'éclat
  n'ouvre pas une ligne de crédit démesurée.
- Le plafond est calculé sur la recette de la soirée **avant** remboursement : il
  mesure ce que l'organisation sait produire, pas ce qui lui reste.
- Si la soirée suivante ne couvre pas toute la dette, le reste est reporté
  (`T` reste négatif) et réduit d'autant la marge du short notice suivant.

Exemples :
- Avant la 1ʳᵉ soirée, `T = 50`. Un short notice à 60 donnerait `T = −10 < −0` : refusé.
- `R₁ = 120` → `P = 120`. `T = 30`, short notice à 100 → `T = −70 ≥ −120` : accepté.
  Soirée suivante `R = 90` → `T = 20`, E1 se déclenche.
- `R₁ = −40`, `R₂ = 120` → `P = 40`.

**Hors périmètre, à signaler :** l'addendum §23 (« le patron comble, une fois,
ensuite avertissement ») concerne une trésorerie sous zéro **après** remboursement.
Les avertissements du patron (§22) n'existent pas : ce lot n'implémente pas §23 et
n'invente aucune règle à sa place.

### QO-7 — Pénalité de la carte réduite

Anthony :

1. **Recette** : oui, elle baisse.
2. **Audience** : dépend de la qualité de la carte — une carte réduite mais bonne
   peut tenir.
3. **Relation du promoteur = Stephen Tarpit (diffuseur)** : varie selon l'ambiance
   de la soirée.
4. **Patron** : sa relation baisse **le temps d'une soirée**, puis revient.
5. **D4 est conditionnelle** : Tarpit ne dit « ça a niqué l'audience » que si
   l'audience a réellement baissé.

Traduction technique :
- Recette et audience découlent du **même calcul** que pour une carte complète,
  appliqué aux combats réellement présents. Pas de malus arbitraire en plus : moins
  de combats = moins d'attrait, et c'est la qualité des combats restants qui décide.
- **Audience de référence** pour D4 : la moyenne d'audience des soirées précédentes
  (ou, avant toute soirée, l'audience qu'aurait eue une carte complète d'attrait
  moyen). D4 si l'audience de la soirée est inférieure à cette référence.
- **Ambiance** = spectacle observé de la soirée (addendum §3 : le diffuseur juge
  finitions, guerres, surprises). Fait Tarpit `{k:'tarpit_mood'}` au signe de
  l'ambiance, pondéré comme les autres faits.
- **Patron** : fait `{k:'reduced_card'}` dans `m.facts`, dont le poids ne compte que
  jusqu'à la soirée suivante (le fait reste, son poids tombe — addendum §2).
- D2 (première carte réduite) puis D3 (à partir de la deuxième) : compteur
  `reducedCards` dans l'état, jamais D3 sans D2 déjà passé.
- Aucune relation n'est affichée en chiffre ni en jauge (addendum §1). Ce lot stocke
  les faits ; il n'invente aucune conséquence que le CDC n'a pas décidée (les
  avertissements du patron viendront avec §22).

### Structure de la carte (Q3)

Anthony : **8 combats par soirée — 4 en main card, 4 en prélims.** Les prélims sont
proposés par Leïla. La main card est choisie par le joueur (CDC §4.2 : « main event
et co-main, tu les choisis toi »).

Conséquences :
- `MGMT_CARD_SIZE` n'a plus un sens unique : la carte devient
  `{main:[…4], prelims:[…4]}`. Carte complète = 4 + 4.
- La proposition en bloc actuelle de Leïla (4 combats) **devient la proposition des
  prélims**. Valider / échanger / écraser et le coût de l'écrasement (lot 2) restent
  identiques, appliqués aux prélims.
- La main card est une **action nouvelle du joueur** (voir T2).
- Migration v3 → v4 : les combats d'une carte v3 en cours deviennent les prélims ; la
  main card démarre vide. Aucun combat n'est perdu, aucun n'est ajouté d'office.
- « Remonter un prélim » (B1/B2) = déplacer un combat des prélims vers un trou de la
  main card. Le trou laissé en prélims est comblé par la reproposition de Leïla, déjà
  existante (lot 3a §5).

### Le retrait (Q4)

Anthony : **toutes les causes réelles** (coupe de poids, blessure, problème
personnel, etc.) **avec un taux proche du réel.**

**Sur le taux réel.** Aucune statistique agrégée fiable des retraits par carte n'a été
trouvée. Le seul chiffre publié repéré : **5,4 %** des combats annulés pendant la
seule période d'examen médical d'avant-combat (Calgary, 2010-2016) — sans les retraits
à l'entraînement, qui sont les plus nombreux. L'observation courante des grandes
cartes (un à trois changements par soirée d'une douzaine de combats) donne l'ordre de
grandeur retenu :

- **Paramètre proposé : 10 % de probabilité par combat** qu'un des deux combattants
  se retire pendant le dernier mois. Sur 8 combats, cela donne au moins un retrait
  dans environ **57 %** des soirées (`1 − 0,9⁸`), et deux ou plus dans environ 19 %.
- Constante nommée `MGMT_WITHDRAW_RATE`, mesurée par Monte Carlo et ajustable par
  Anthony après avoir joué.

**Causes et répartition proposée** (ordres de grandeur de jeu, pas des statistiques
sourcées) :

| Cause | Part | Effet mécanique |
|---|---|---|
| Blessure à l'entraînement (coupure, genou, épaule…) | ~55 % | `rollInjury()` existant, suspension et fait comme au lot 3a |
| Maladie | ~10 % | Aucun effet sur le corps, indisponible pour cette soirée |
| Coupe de poids ratée ou refusée médicalement | ~15 % | Indisponible pour cette soirée |
| Problème personnel | ~15 % | Indisponible pour cette soirée |
| Administratif (visa, licence) | ~5 % | Indisponible pour cette soirée |

- La probabilité de blessure est majorée par le **traumatisme caché** du lot 3a
  (un corps usé se blesse plus au camp), jamais affichée.
- **Règle de silence** (LOT-3B §F-2) : A1 et A2 ne disent jamais la cause. La cause
  est stockée dans le fait `{k:'withdraw', cause}` pour qu'un dialogue futur puisse la
  citer si le contexte le justifie.
- Tirages par `rnd()` seedé, calculés une seule fois et sauvegardés avant affichage
  (anti-rechargement).

---

## 2. Question restante

- **Q5 — Comment le joueur compose sa main card ?** Le CDC dit qu'il la choisit, sans
  décrire le geste. Proposition conforme au principe du LOT-3B (« l'interface rend
  l'action possible, sous-options dans la liste des combattants ») : dans la liste des
  combattants, choisir un combattant disponible, puis son adversaire dans la même
  catégorie ; le combat entre dans le premier trou de la main card. Aucun score, aucune
  recommandation affichée. → bloque T2.

---

## 3. Découpage en tranches

Chaque tranche : branche de travail `lot-3b`, `npm run check` vert à la fin, diff relu
par Claude avant la tranche suivante.

### T1 — L'argent de l'organisation *(ne dépend d'aucune question)*
- État : `m.treasury` (entier k$), `m.recettes` (les deux dernières `R`),
  `m.audiences` (historique pour la référence de D4), `m.eventsPlayed`.
- Cachet par combattant calculé à partir de la ligne existante (bilan, niveau) —
  fonction pure, jamais stocké par combattant de niveau 1 (règle du bureau, CDC §3).
  Un combat de main card rapporte et coûte plus qu'un prélim (poids nommés).
- `mgmtRunEvent` calcule revenus, cachets, audience et `R`, ajoute `R` à `T` et
  stocke le tout dans `m.lastEvent` **dans le même calcul unique** (anti-rechargement).
- Fonctions pures : `mgmtOverdraftCap(m)`, `mgmtCanAfford(m, cost)`,
  `mgmtAudienceRef(m)`.
- Revenus = billetterie (attrait de la carte avant la soirée) + droits du diffuseur
  (audience = attrait × spectacle observé : part de finitions). Constantes nommées,
  **calibrées par Monte Carlo** sur des cartes de 4 + 4 combats (outil dans `tools/`,
  graines publiées). Cibles proposées, à valider : carte complète moyenne rentable
  dans 70 à 80 % des soirées ; une carte d'appariements médiocres perd de l'argent
  plus souvent qu'elle n'en gagne ; une carte réduite d'un combat faible garde son
  audience de référence dans une part mesurable des cas.
- T1 écrit les calculs pour une carte `{main, prelims}` mais **ne change pas encore
  la structure en jeu** (c'est T2) : tant que T2 n'est pas livrée, les combats
  actuels comptent comme prélims.
- Sauvegarde : `MGMT_SAVE_VERSION` 3 → 4. Migration sans perte :
  `treasury = MGMT_TREASURY_START`, `recettes = []`, `audiences = []`,
  `eventsPlayed = 0`. `validateMgmt` et `mgmtValidEvent` étendus. Une v3 se charge,
  une v1 reste refusée.
- Tests : dé-skipper « payable à découvert dans la limite du plafond » et
  « remboursement du découvert sur la recette suivante ». Ajouter : plafond aux trois
  paliers, plafond jamais négatif, E1 seulement si dette déduite, migration 3 → 4,
  recharger après la soirée ne recompte pas la recette.
- **Aucune réplique, aucun affichage** dans cette tranche.

### T2 — La carte en 4 + 4 *(après Q5)*
- Structure `{main, prelims}`, migration de la carte en cours (combats v3 → prélims).
- Proposition en bloc de Leïla appliquée aux prélims, règles du lot 2 et du lot 3a
  inchangées. Main card composée par le joueur (geste de Q5).
- Carte complète = 4 + 4 ; la soirée joue les 8 combats.
- Tests existants de la carte : réécrits **uniquement** là où la décision Q3 change le
  comportement, en citant ce contrat.

### T3 — Le dernier mois et le retrait *(après T2)*
- Phase entre verrouillage de la carte et soirée. Tirages de retrait selon §1
  « Le retrait ».
- A1 (Leïla) puis A2 (le combattant retiré), mot pour mot. Aucune cause affichée.
- La carte redevient incomplète : la soirée ne se lance pas (règle 3a §5 conservée).

### T4 — Remonter un prélim *(après T3)*
- Déplacer un prélim vers un trou de main card ; Leïla repropose pour le trou des
  prélims.
- B1 (Leïla, **première fois seulement**), B2 (Mark Sanchez).
- Dé-skipper le test « remonter un combat des préliminaires ».

### T5 — Short notice et combattant libre *(après T1, T3)*
- Vivier extérieur de niveau 1 (autre organisation, libres de contrat), généré à la
  demande, réutilisant `makeName()` et `correlatedRecord()`.
- Acceptation : C1 (accepte), C2 (refuse — ni favori, ni bonnes conditions),
  C3/C4 (cachet suffisant ou non). Paiement via `mgmtCanAfford`.
- Addendum §10 (« faire venir un nom de l'extérieur passe par un agent ») vise le main
  event et le co-main ; le short notice du 3B est une autre situation. Si Anthony lit
  ces deux règles comme contradictoires, trancher avant T5.
- Dé-skipper les tests « short notice » et « combattant libre de contrat ».

### T6 — Les trois sorties dans l'interface *(après T4, T5)*
- Sous-options dans la liste des combattants (`mgmt-screens.js`), PC 1440px, souris
  et clavier. Libellés d'interface neutres ; toute parole de personnage vient du
  registre LOT-3B §G.
- Affichage de la trésorerie (CDC §7 : l'argent est la pression visible).

### T7 — La soirée en carte réduite *(après T1, T6)*
- Exception assumée à la garde `mgmtCardFull` de `mgmtRunEvent`, seulement quand le
  short notice n'est plus payable.
- D1 au moment du choix ; D2/D3 au lendemain selon le compteur ; D4 seulement si
  l'audience est sous la référence.
- Faits patron (poids limité à une soirée) et Tarpit (selon l'ambiance).
- Dé-skipper « au-delà du plafond : carte réduite avec pénalité ».

---

## 4. Interdits pour OpenCode (toutes tranches)

- Aucune réplique inventée, retouchée ou « corrigée ». Les 14 répliques du LOT-3B §G
  sont intégrées **mot pour mot, fautes et ponctuation comprises** (D1 : ne pas
  corriger « .. »). Tout texte manquant : `[EMPLACEMENT AUTEUR]`, signalé.
- **Aucun chiffre dans les répliques ni à côté d'elles.**
- Aucune modification de `engine-*.js`, `state/*.js`, `ui-01` à `ui-10`.
- Aucun `Math.random()` : `rnd()` seedé uniquement.
- Aucun test existant réécrit ou assoupli pour retrouver du vert. Un test qui change
  doit citer la décision de ce contrat qui change le comportement attendu.
- Aucun second système : relations = faits pondérés existants ; argent = un seul solde.
- Un nouveau fichier de test est ajouté aux scripts `test` et `test:watch` de
  `package.json`.
- `esc()` sur tout nom injecté en HTML.

## 5. Définition de « terminé » pour le lot

- Les 6 tests skip du lot sont actifs et verts, plus les tests ajoutés par tranche.
- `npm run check` vert sur la version intégrée, relancé par Claude.
- Sauvegarde v3 existante chargée sans perte ; recharger ne rejoue ni soirée, ni
  recette, ni tirage de retrait.
- Parcours jouable préparé pour Anthony : une partie seedée qui mène directement à un
  retrait, puis à chacune des trois sorties.
- Rapport de lot : `docs/lots/LOT-3B-RAPPORT.md` (réalisé, vérifié, non vérifié,
  écarts, calibrage Monte Carlo avec graines).
