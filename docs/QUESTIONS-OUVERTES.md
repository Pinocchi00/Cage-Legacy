# CAGE LEGACY — QUESTIONS OUVERTES

Manques constatés en cours de lot et laissés sans décision de code. Personne ne
comble un trou de spécification par une supposition : chaque entrée décrit ce qui
manque, où le manque se situe, et quel document porte le design s'il a été arrêté.
Créé le 15/09/2026 lors de la réécriture des tests du bureau
(`tests/mgmtBureau.test.js`, ancre `MGMT_LOT1G`, règle du §5 du lot 3a, contrat
`docs/LOT-3A-TESTS-CONTRAT.md`).

Le design des « sorties de carte incomplète » a été arrêté par l'auteur dans
`docs/LOT-3B-CARTE-INCOMPLETE.md` (décisions du 14/09/2026) : ce que ces entrées
documentent est le **manque côté code**, pas un trou de design — sauf mention
explicite.

---

## QO-1 — Remonter un combat des préliminaires (sortie de carte incomplète)

**Statut.** Design arrêté (LOT-3B §B : Leïla ne mentionne que les prélims, première
fois seulement ; interface porte l'action). **Code absent.**

**Ce qui manque côté code.** La structure existe désormais — carte
`{sizeMain,sizePrelims,main,prelims}` avec `MGMT_MAIN_SIZE=5` et
`MGMT_PRELIM_SIZE=4` (lot 2 T1, `docs/LOT-2-CARTE-PRINCIPALE.md` §T1). Il n'existe
toujours aucun geste « remonter » un combat des préliminaires vers un trou de la
carte principale : aucune fonction, aucune entrée d'interface.

**Où.** Structure de la carte : `mgmt-bureau.js` (`mgmtCardFull`, `mgmtNewBulkAffair`,
ancre `MGMT_LOT2_CARTE`) ; rendu : `mgmt-screens.js` (`mgmtBulkFightHtml`,
`scr_mgmt_bureau`). Le test qui attend ce comportement est marqué skip :
`tests/mgmtBureau.test.js:782` (« remonter un combat des préliminaires »).

---

## QO-2 — Short notice : combattant de son organisation ou d'une autre organisation

**Statut.** Design arrêté (LOT-3B §C : acceptation, refus, cachet suffisant,
cachet insuffisant — répliques d'auteur écrites). **Code absent.**

**Ce qui manque côté code.** Aucun mécanisme de recrutement n'existe côté bureau : le
roster est fixé à la génération (`mgmtNewRoster`, 40 à 60 noms) et rien ne fait
entrer un combattant extérieur. Le short notice existant du mode carrière
(`ui-02-fight-prep-events.js:635`, `ui-08-controller-arena.js:385`) est une mécanique
du combattant-joueur, sans lien avec le bureau — réutiliser son nom ne suffirait pas,
la donnée à booker n'est pas la même.

**Où.** Génération du roster : `mgmt-bureau.js` (`mgmtNewRoster`, ancre
`MGMT_LOT1_BUREAU`) ; aucune fonction d'ajout au roster. Test marqué skip :
`tests/mgmtBureau.test.js:789`.

---

## QO-3 — Engager un combattant libre de contrat

**Statut.** Design arrêté (LOT-3B §C3/C4 : Benoit Beko, le cachet fait la réponse).
**Code absent.**

**Ce qui manque côté code.** Il n'existe aucun vivier de combattants libres côté mode
management (ni liste, ni génération, ni disponibilité). Le marché libre du mode
carrière (`ui-07-contracts-legacy-screens.js`, « Free Agency ») appartient à un autre
mode et ne fournit rien au bureau.

**Où.** `mgmt-bureau.js` (aucune donnée de libre) ; test marqué skip :
`tests/mgmtBureau.test.js:796`.

---

## QO-4 — Signalisation des trois sorties dans l'interface du bureau

**Statut.** Design arrêté (LOT-3B « Principe » et décision F1 : l'interface porte les
trois sorties, Leïla ne propose que les prélims). **Code absent.**

**Ce qui manque côté code.** L'écran du bureau n'offre aujourd'hui que les réponses
des échanges de Leïla (valider / échanger / écraser, ignorer quand la carte est
complète — `mgmtVisibleReplies`, `mgmt-screens.js`). Aucune sous-option, aucune
signalisation des trois sorties. Les répliques éventuelles sont du ressort de
l'auteur — les quatorze du registre LOT-3B §G font foi ; rien n'est à inventer.

**Où.** `mgmt-screens.js` (`mgmtVisibleReplies`, `MGMT_ACTION_LABELS`,
`scr_mgmt_bureau`). Tests marqués skip : lignes 782, 789, 796.

---

## QO-5 — Plafond de découvert du short notice

**Statut. LIVRÉ au lot 3B T1 (11/09/2026 ; relu et fusionné dans `main` le
21/09).** `mgmtOverdraftCap` et `mgmtCanAfford` existent, leurs deux tests sont
dé-skippés. L'entrée reste ici comme trace de la décision. Design arrêté (LOT-3B
§E et décision F-4 : plancher fixe avant toute
soirée, puis recette nette de la dernière, puis moyenne des deux dernières ; la
dette est portée par l'organisation, F-5). **Code absent.**

**Ce qui manque côté code.** Il n'existe ni trésorerie, ni recette, ni découvert dans
l'état du bureau : `mgmtDefault()` ne porte aucun champ d'argent, et `m.lastEvent`
(`mgmtRunEvent`) ne stocke que combats et touchés — aucune recette nette. Le plancher
fixe applicable avant la première soirée n'a pas de valeur arrêtée côté code
(LOT-3B §E dit « plancher fixe » sans le chiffrer).

**Décision du 15/09/2026 (Anthony).** Aucun découvert possible avant la première
soirée : plancher fixe = 0. Le reste du calcul est délégué ; formalisation dans
`docs/LOT-3B-CONTRAT.md` §1 (un seul solde, plafond `max(0, …)`), en attente de
validation du contrat.

**Où.** État du bureau : `mgmt-bureau.js` (`mgmtDefault`, `mgmtRunEvent`, ancre
`MGMT_LOT3A_CORPS`) ; validation : `validateMgmt` (nouveaux champs à couvrir). Test
marqué skip : `tests/mgmtBureau.test.js:830`.

---

## QO-6 — Remboursement du découvert sur la recette suivante

**Statut. LIVRÉ au lot 3B T1 (11/09/2026 ; relu et fusionné dans `main` le
21/09).** Le remboursement est automatique — un seul solde, `T ← T + R` dans
`mgmtRunEvent` — et son test est dé-skippé. L'entrée reste ici comme trace de la
décision. Design arrêté (LOT-3B §E : remboursement avant tout bénéfice ;
réplique patron E1, conditionnée à une dette effectivement déduite). **Code absent.**

**Ce qui manque côté code.** Dépend de QO-5 : aucune comptabilité n'existe entre deux
soirées. `mgmtRunEvent()` ne produit aucune valeur financière, `m.lastEvent` n'en
conserve pas.

**Où.** `mgmt-bureau.js` (`mgmtRunEvent`) ; test marqué skip :
`tests/mgmtBureau.test.js:837`.

---

## QO-7 — Soirée en carte réduite avec pénalité, au-delà du plafond

**Statut.** Design arrêté (LOT-3B §D : la carte réduite est une sortie décidée,
répliques D1-D4 ; première carte réduite → boss froid D2, dès la deuxième → boss
agressif D3, diffuseur D4). **Code absent, et un reste à trancher.**

**Ce qui manque côté code.** `mgmtRunEvent()` refuse aujourd'hui toute carte
incomplète (`mgmtCardFull(m)` en garde d'entrée, `mgmt-bureau.js`) — la soirée en
carte réduite demandera une exception assumée à la règle « carte complète un mois
avant ». **Reste ouvert de design : la nature exacte de la pénalité mécanique.**
LOT-3B décrit la pénalité ressentie (répliques du patron et du diffuseur) mais ne
chiffre aucun effet (audience, recette, réputations) ; les répliques d'auteur
existent, la mécanique qu'elles accompagnent n'est pas définie.

**Décision du 15/09/2026 (Anthony).** La recette baisse ; l'audience dépend de la
qualité de la carte ; la relation « promoteur » varie selon l'ambiance ; la relation
du patron baisse le temps d'une soirée. Le promoteur est Stephen Tarpit ; D4 ne se
déclenche que si l'audience a réellement baissé. ~~Carte de 8 combats : 4 main card
choisis par le joueur, 4 prélims proposés par Leïla.~~ **Prémisse périmée
(21/09/2026) : la carte fait 9 combats, 5 en carte principale et 4 en
préliminaires, depuis la décision du 19/09 (`docs/LOT-2-CARTE-PRINCIPALE.md` §0),
livrée au lot 2 T1. **Confirmé par Anthony le 21/09/2026 : la carte fait bien 9
combats.** Le fond de la décision tient ; seule la taille de la carte change sous
elle. La carte réduite se lira donc sur 9, pas sur 8.** Retraits : toutes causes
réelles, taux proche du réel. Détail et reste ouvert (geste de composition de la
main card) : `docs/LOT-3B-CONTRAT.md` §1 et §2.

**Où.** Garde actuelle : `mgmt-bureau.js` (`mgmtRunEvent`, `mgmtCardFull`) ;
déclencheur à modifier : `mgmt-screens.js` (`mgmtNextCycle`, `mgmtClosePile`). Test
marqué skip : `tests/mgmtBureau.test.js:842`.

---

## QO-8 — L'organisation s'use : le vivier fond, la soirée cesse d'être rentable

**Statut.** Mesure faite. **Décision d'Anthony du 21/09/2026 : c'est un défaut du
jeu. Le vivier est censé se renouveler.** Reste à écrire : le comment (voir
« Ce qui reste à cadrer »).

**Le constat.** Relevé le 21/09/2026 par le calibrage du lot 2 T4
(`tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md`, 4000 organisations, six soirées
chacune, joueur d'écran). L'économie est calibrée sur la **première** soirée d'une
organisation neuve, où elle atteint sa cible. Elle se dégrade ensuite, soirée après
soirée :

| Soirée | % de soirées rentables | R moyen | Combattants disponibles | Suspensions en cours |
|---|---|---|---|---|
| 1 | 77,4 % | +5,3 k$ | 48,6 | 0 |
| 2 | 56,5 % | +1,6 k$ | 41,6 | 6,9 |
| 3 | 47,3 % | +0,3 k$ | 34,6 | 13,9 |
| 4 | 37,3 % | −1,5 k$ | 27,9 | 20,6 |
| 5 | 31,0 % | −2,6 k$ | 25,1 | 23,3 |
| 6 | 25,5 % | −3,7 k$ | 23,5 | 24,8 |

**Ce qui manque côté code.** Rien n'entre dans le vivier. `mgmtNewRoster()` le
peuple une fois ; les suspensions médicales et les retraits en sortent des
combattants, et aucun ne les remplace. À la sixième soirée, la moitié du vivier est
indisponible et le joueur compose ses cinq combats avec ce qui reste — d'où la chute
de l'attrait, de l'audience et de la recette. Ce n'est pas un défaut de calibrage :
aucun poids d'argent ne compense un vivier qui fond.

**Ce qui est déjà décidé ailleurs.** Le vivier extérieur (combattants d'une autre
organisation, libres de contrat) est le sujet de [QO-2] et [QO-3], et la tranche T5
de `docs/LOT-3B-CONTRAT.md` le porte — écrit, pas codé. Il répond au short notice ;
reste à décider s'il répond aussi au **recrutement ordinaire**, c'est-à-dire si une
organisation recrute entre deux soirées.

**Décision d'Anthony, 21/09/2026.** Le déclin du vivier est un **défaut**, pas une
pression de jeu voulue. Une organisation est censée se renouveler. La cible
« rentable dans 70 à 80 % des soirées » se lit donc sur la **durée de vie** de
l'organisation, et non sur sa seule première soirée : une fois le renouvellement en
place, le calibrage du lot 2 T4 sera à revérifier sur plusieurs soirées enchaînées
(`node tools/monte-carlo-economie.js --soirees=K`, l'outil sait déjà le mesurer).

**Les quatre « comment », tranchés le 21/09/2026 :**

1. **D'où viennent les nouveaux.** Ils sont **régénérés**, sur le modèle des
   *newgens* de Football Manager : une génération de combattants naît, puis
   **combat en amateur et dans d'autres organisations** avant que Split ne les
   voie. Ils arrivent donc avec un passé, pas vierges.
2. **Rythme et recrutement.** Un **flux régulier** de combattants recrutables —
   mais **le joueur recrute, et lui seul**. Rien n'entre dans le vivier sans son
   geste. Le jeu ne signe jamais à sa place (règle du bureau, CDC §3).
3. **Annonce.** L'arrivée d'un combattant **n'est pas un événement** : personne ne
   l'annonce, aucune réplique ne se déclenche. En revanche **son premier combat
   sous Split peut porter du récit** — c'est là que l'histoire se raconte, pas à la
   signature.
4. **Les partants.** Ils **partent à la retraite**, simplement. Aucune autre sortie
   à inventer.

**Ce qui reste à cadrer, et qui est mécanique, pas d'auteur.** « Ils combattent en
amateur et dans d'autres organisations » peut se coder de deux façons, et le choix
décide du coût :

- **monde simulé** : les combattants extérieurs livrent de vrais combats
  (`simulateFight`) cycle après cycle. Fidèle, cher — c'est une deuxième
  simulation qui tourne en permanence à côté de Split.
- **monde dérivé** : ils naissent avec un bilan plausible et le font progresser par
  une abstraction légère, sans passer par le moteur. Bien moins cher, et
  indiscernable pour le joueur, qui ne voit qu'une ligne et un bilan.

À trancher au moment du contrat de lot. Le lien avec [QO-2] et [QO-3] est direct :
le vivier extérieur qu'elles décrivent est **le même monde** que celui des
nouveaux — il ne doit pas en exister deux (règle : jamais un système parallèle à
un système existant).

**Où.** `mgmt-bureau.js` (`mgmtNewRoster`, `mgmtAvailable`, `mgmtApplyFight`),
`docs/LOT-3B-CONTRAT.md` §T5. Aucun test skip associé : le comportement mesuré est
celui du code actuel. Il est désormais **reconnu comme un défaut à corriger**, et
attend son contrat de lot.

---

## QO-9 — La mémoire des faits : rien ne s'efface

**Statut. Décision d'Anthony du 21/09/2026.** Tranchée, pas encore codée.

**Le conflit.** L'addendum §2 dit « le fait ne disparaît jamais ». Le code dit le
contraire : `mgmtAddFact` coupe au-delà de `MGMT_FACTS_MAX = 10`
(`mgmt-data.js:30`, appliqué en `mgmt-bureau.js:662` et `:1623`). L'arbitrage
n'avait jamais été rendu ; il figurait dans la dette du `CLAUDE.md`.

**Décision.** **Les faits ne disparaissent jamais.** Le plafond saute. En
contrepartie, **l'interface les range et les trie** — c'est l'affichage qui rend
une mémoire longue lisible, pas l'oubli.

**Ce que cela implique.** Deux chantiers distincts : retirer le plafond côté
données (et vérifier que la sauvegarde encaisse une liste qui grandit sans fin —
`validateMgmt`, `mgmtRepair`), puis ranger et trier côté écran (lot 4, la peau du
jeu). Le premier sans le second donnerait un mur de faits illisible : ils vont
ensemble.

---

## QO-10 — Leïla parle trop

**Statut. Direction donnée par Anthony le 21/09/2026.** Le principe est tranché ;
la portée reste à cadrer.

**Le constat d'Anthony.** « Leïla parle trop, tout le temps, ce n'est pas
réaliste. Le jeu, l'interface doit expliquer tout ça. »

**Décision immédiate.** Là où le lot 2 T5 laissait un manque — l'écran du bureau,
pile vide et carte principale à composer, ne dit pas au joueur ce qu'on attend de
lui — **la réponse n'est pas une réplique de Leïla. C'est l'interface qui
l'explique.** Aucun `[EMPLACEMENT AUTEUR]` n'est donc dû à cet endroit ; c'est une
tâche de lot 4 (la peau du jeu), pas une tâche d'auteur.

**Règle qui s'en dégage.** Une voix de personnage sert à porter une intention, une
relation ou un désaccord — jamais à expliquer une règle du jeu ni à commenter un
état d'écran. Ce qui relève de l'état se lit ; ce qui relève de l'humain se dit.

**Ce qui reste à cadrer.** La portée : s'agit-il seulement de **ne pas en
ajouter** — ce qui est acquis — ou faut-il aussi **alléger l'existant** ? Le mode
management est aujourd'hui construit sur la pile d'affaires de Leïla : toucher à
sa densité toucherait le cœur du bureau. Question ouverte, à rouvrir au lot 5 (le
monde qui parle), quand les autres voix arriveront et que sa part relative
baissera peut-être d'elle-même.

---

## Résumé des tests skip concernés

Relevé sur l'état réel du dépôt le 21/09/2026 (après la fusion du lot 2, PR 62).
**Quatre skips**, tous dans `tests/mgmtBureau.test.js` — les deux tests de QO-5 et
QO-6 ont été dé-skippés par le lot 3B T1 et ne figurent plus ici.

| Test (tests/mgmtBureau.test.js) | Ligne | Entrée liée |
|---|---|---|
| MGMT sortie carte incomplète — remonter un combat des préliminaires | 951 | QO-1, QO-4 |
| MGMT sortie carte incomplète — short notice (Split ou autre organisation) | 958 | QO-2, QO-4 |
| MGMT sortie carte incomplète — combattant libre de contrat | 965 | QO-3, QO-4 |
| MGMT économie — au-delà du plafond : carte réduite avec pénalité | 1187 | QO-7, QO-4 |

Chacun de ces tests porte la mention « comportement absent du code — voir
docs/QUESTIONS-OUVERTES.md ». Ils ne sont ni implémentés ni simulés : un
emplacement vide vaut mieux qu'un comportement simulé. Là où un texte serait
nécessaire un jour : les répliques existent déjà (LOT-3B, écrit par l'auteur),
seule la mécanique manque.

**QO-8 n'a aucun test skip** : le déclin du vivier est le comportement du code
actuel, mesuré, désormais reconnu comme un défaut — il attend un contrat de lot,
pas une implémentation déjà spécifiée.

**Les numéros de ligne bougent à chaque tranche.** Avant de t'y fier, relance
`grep -n "skip:" tests/*.js`.
