# LOT 3B — Contrat de lot : carte incomplète

**Date :** 15/09/2026
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
| Le « dernier mois » avant la soirée | N'existe pas. Aujourd'hui, pile vide + carte complète → soirée immédiate (`mgmtClosePile`). Or le retrait d'un combattant (A1) arrive **sur une carte déjà constituée** : il lui faut une période entre verrouillage et soirée. Le lot 3a §10 l'annonce (« imprévus du dernier mois »). |
| Le retrait d'un combattant (A1/A2) | **Absent de QO-1 à QO-7.** C'est pourtant le déclencheur de tout le lot. |
| Préliminaires | La carte est une liste plate de 4 combats (`MGMT_CARD_SIZE`). Aucun prélim n'existe à « remonter ». |
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
Il délègue le reste du calcul à Claude. Formalisation proposée :

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

Anthony, 15/09/2026 :

1. **Recette** : oui, elle baisse.
2. **Audience** : dépend de la qualité de la carte — une carte réduite mais bonne
   peut tenir.
3. **Relation « promoteur »** : varie selon l'ambiance de la soirée.
4. **Patron** : sa relation baisse **le temps d'une soirée**, puis revient.

Traduction technique proposée :
- Recette et audience découlent du **même calcul** que pour une carte complète,
  appliqué aux combats réellement présents. Pas de malus arbitraire en plus : moins
  de combats = moins d'attrait, et c'est la qualité des combats restants qui décide.
- Patron : un fait `{k:'reduced_card'}` dans `m.facts`, dont le poids ne compte que
  jusqu'à la soirée suivante (le fait reste, son poids tombe — addendum §2).
- Promoteur : un fait lié à l'ambiance, voir la question Q1 ci-dessous.
- D2 (première carte réduite) puis D3 (à partir de la deuxième) : compteur
  `reducedCards` dans l'état, jamais D3 sans D2 déjà passé.

---

## 2. Questions à Anthony (bloquent seulement leur tranche)

- **Q1 — Qui est « le promoteur » ?** Les six voix n'en ont pas. L'addendum §3 dit
  que le **diffuseur** juge le spectacle : hypothèse = Stephen Tarpit. Si c'est
  Delatour (le patron), la « relation patron » et la « relation promoteur » ne font
  qu'une et il faut préciser comment elles se combinent. → bloque T6.
- **Q2 — D4 est-elle conditionnelle ?** Tarpit dit « ça a niqué l'audience ». Si
  l'audience tient (carte réduite mais bonne), la réplique sonnerait faux — même
  logique que ta condition sur E1. Proposition : D4 seulement si l'audience a baissé.
  → bloque T6.
- **Q3 — Les préliminaires.** Combien de combats ? Qui les propose (Leïla, comme la
  sous-carte) ? Remonter un prélim laisse-t-il un trou en prélims, sans conséquence ?
  → bloque T3.
- **Q4 — Le retrait.** Qu'est-ce qui fait qu'un combattant se retire pendant le
  dernier mois, et à quelle fréquence à peu près ? Proposition : blessure au camp,
  probabilité liée au traumatisme caché existant (lot 3a), réutilisant
  `rollInjury()`. La cause reste silencieuse à l'écran (règle de silence). → bloque T2.

---

## 3. Découpage en tranches

Chaque tranche : une branche de travail `lot-3b`, `npm run check` vert à la fin,
diff relu par Claude avant la tranche suivante.

### T1 — L'argent de l'organisation *(ne dépend d'aucune question)*
- État : `m.treasury` (entier k$), `m.recettes` (les deux dernières `R`),
  `m.eventsPlayed`. Cachet par combattant calculé à partir de la ligne existante
  (bilan, niveau) — fonction pure, jamais stocké par combattant de niveau 1
  (règle du bureau, CDC §3).
- `mgmtRunEvent` calcule revenus, cachets et `R`, l'ajoute à `T` et le stocke dans
  `m.lastEvent` **dans le même calcul unique** (anti-rechargement du lot 3a).
- Fonctions pures : `mgmtOverdraftCap(m)`, `mgmtCanAfford(m, cost)`.
- Revenus = billetterie (attrait de la carte avant la soirée) + droits du diffuseur
  (audience = attrait × spectacle observé : part de finitions). Constantes nommées,
  **calibrées par Monte Carlo** (outil dans `tools/`, graines publiées). Cibles
  proposées, à valider : carte complète moyenne rentable dans 70 à 80 % des soirées ;
  une carte faite d'appariements médiocres perd de l'argent plus souvent qu'elle
  n'en gagne.
- Sauvegarde : `MGMT_SAVE_VERSION` 3 → 4. Migration sans perte :
  `treasury = MGMT_TREASURY_START`, `recettes = []`, `eventsPlayed = 0`.
  `validateMgmt` et `mgmtValidEvent` étendus. Une v3 se charge, une v1 reste refusée.
- Tests : dé-skipper « payable à découvert dans la limite du plafond » et
  « remboursement du découvert sur la recette suivante ». Ajouter : plafond aux trois
  paliers, plafond jamais négatif, E1 seulement si dette déduite, migration 3 → 4,
  recharger après la soirée ne recompte pas la recette.
- **Aucune réplique, aucun affichage** dans cette tranche.

### T2 — Le dernier mois et le retrait *(après Q4)*
- Phase entre verrouillage de la carte et soirée. Tirage de retrait seedé.
- A1 (Leïla) puis A2 (le combattant retiré), mot pour mot. Aucune cause affichée.
- La carte redevient incomplète : la soirée ne se lance pas (règle 3a §5 conservée).

### T3 — Remonter un prélim *(après Q3)*
- Structure prélims dans la carte, migration comprise.
- B1 (Leïla, **première fois seulement**), B2 (Mark Sanchez).
- Dé-skipper le test « remonter un combat des préliminaires ».

### T4 — Short notice et combattant libre *(après T1)*
- Vivier extérieur de niveau 1 (autre organisation, libres de contrat), généré à la
  demande, réutilisant `makeName()` et `correlatedRecord()`.
- Acceptation : C1 (accepte), C2 (refuse — ni favori, ni bonnes conditions),
  C3/C4 (cachet suffisant ou non). Paiement via `mgmtCanAfford`.
- Addendum §10 (« faire venir un nom de l'extérieur passe par un agent ») vise le main
  event et le co-main ; le short notice du 3B est une autre situation. Si Anthony
  lit ces deux règles comme contradictoires, trancher avant T4.
- Dé-skipper les tests « short notice » et « combattant libre de contrat ».

### T5 — Les trois sorties dans l'interface *(après T2, T3, T4)*
- Sous-options dans la liste des combattants (`mgmt-screens.js`), PC 1440px,
  souris et clavier. Libellés d'interface neutres ; toute parole de personnage vient
  du registre LOT-3B §G.
- Affichage de la trésorerie (CDC §7 : l'argent est la pression visible).

### T6 — La soirée en carte réduite *(après T1, T5, Q1, Q2)*
- Exception assumée à la garde `mgmtCardFull` de `mgmtRunEvent`, seulement quand le
  short notice n'est plus payable.
- D1 au moment du choix, D2/D3 au lendemain selon le compteur, D4 selon Q2.
- Faits patron (poids limité à une soirée) et promoteur (selon l'ambiance, Q1).
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
- Sauvegarde v3 existante chargée sans perte ; recharger ne rejoue ni soirée ni recette.
- Parcours jouable préparé pour Anthony : une partie seedée qui mène directement à un
  retrait, puis à chacune des trois sorties.
- Rapport de lot : `docs/lots/LOT-3B-RAPPORT.md` (réalisé, vérifié, non vérifié,
  écarts, calibrage Monte Carlo avec graines).
