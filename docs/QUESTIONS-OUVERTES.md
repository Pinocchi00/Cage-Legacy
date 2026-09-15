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

**Ce qui manque côté code.** La carte du bureau est une liste plate de 4 combats
(`m.card.fights`, `MGMT_CARD_SIZE = 4`) : il n'existe aucune structure
préliminaires/carte principale à laquelle « remonter » un combat ferait référence.
Aucune fonction, aucune donnée, aucune entrée d'interface.

**Où.** Structure de la carte : `mgmt-bureau.js` (`mgmtCardFull`, `mgmtNewBulkAffair`,
ancre `MGMT_LOT3A_CORPS`) ; rendu : `mgmt-screens.js` (`mgmtBulkFightHtml`,
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

**Statut.** Design arrêté (LOT-3B §E et décision F-4 : plancher fixe avant toute
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

**Statut.** Design arrêté (LOT-3B §E : remboursement avant tout bénéfice ;
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
déclenche que si l'audience a réellement baissé. Carte de 8 combats : 4 main card
choisis par le joueur, 4 prélims proposés par Leïla. Retraits : toutes causes
réelles, taux proche du réel. Détail et reste ouvert (geste de composition de la
main card) : `docs/LOT-3B-CONTRAT.md` §1 et §2.

**Où.** Garde actuelle : `mgmt-bureau.js` (`mgmtRunEvent`, `mgmtCardFull`) ;
déclencheur à modifier : `mgmt-screens.js` (`mgmtNextCycle`, `mgmtClosePile`). Test
marqué skip : `tests/mgmtBureau.test.js:842`.

---

## Résumé des tests skip concernés

| Test (tests/mgmtBureau.test.js) | Ligne | Entrée liée |
|---|---|---|
| MGMT sortie carte incomplète — remonter un combat des préliminaires | 782 | QO-1, QO-4 |
| MGMT sortie carte incomplète — short notice (Split ou autre organisation) | 789 | QO-2, QO-4 |
| MGMT sortie carte incomplète — combattant libre de contrat | 796 | QO-3, QO-4 |
| MGMT économie — short notice payable à découvert dans la limite du plafond | 830 | QO-5 |
| MGMT économie — remboursement du découvert sur la recette suivante | 837 | QO-6 |
| MGMT économie — au-delà du plafond : carte réduite avec pénalité | 842 | QO-7, QO-4 |

Chacun de ces tests porte la mention « comportement absent du code — voir
docs/QUESTIONS-OUVERTES.md ». Ils ne sont ni implémentés ni simulés : un
emplacement vide vaut mieux qu'un comportement simulé. Là où un texte serait
nécessaire un jour : les répliques existent déjà (LOT-3B, écrit par l'auteur),
seule la mécanique manque.
