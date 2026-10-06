# Brief du 06/10/2026 — Lot 7 complet : le calendrier, les soirées, l'assistante

Code : `mgmt-agenda.js` (état et règles, aucun DOM), `mgmt-calendrier.js` (écran), `mgmt-carte-cadre.js` (Carte), `mgmt-prelims.js` (Préliminaires).
Tests : `tests/mgmtCalendrier.test.js` (11), `mgmtCarteCadre`, `mgmtPrelims`.

## Livré
- **Le joueur pose ses soirées** (P sur le Calendrier : date par ← → (1 jour) et ↑ ↓ (1 semaine), taille avec T, Entrée pose ; Suppr retire). Aucune
  soirée imposée : **le temps avance jusqu'à la prochaine soirée posée**, ou de 30 jours au plus avec L (« laisser passer »), jamais au-delà d'une soirée posée.
  Les âges avancent des jours réellement écoulés (`mgmtAdvanceRosterAges`, semaines = jours / 7).
- **Deux tailles** : petite 9 combats (5 + 4), grosse 13 (5 + 4 + 4 early prelims) ; **une grosse par mois au plus** (aussi contre les soirées déjà jouées). Les
  places de la carte suivent la prochaine soirée posée tant que la carte est vide (`card.sizeEarly` = 4 pour une grosse) ; une carte déjà composée refuse l'autre taille.
- **Aucun combat joué sans validation** : la soirée n'est « prête » qu'avec une soirée posée, la carte pleine (ou réduite décidée), aucune affaire ni proposition de
  Leïla ouverte. Avec l'agenda `mgmtClosePile` rend `'prete'` (jamais `'event'`) : le joueur lance la soirée (Entrée sur le Calendrier).
- **Ordre de passage** : early prelims, préliminaires, puis les combats 5, 4, 3, le co-principal, le principal en dernier (agenda actif seulement ; l'ancien ordre reste pour une partie d'avant).
- **Réservation** : le cercle et les suivis du joueur ; Leïla ne les place jamais (`mgmtAgendaReserve`, filtre de `mgmtPickBulkPair`).
- **Préparation à la demande** : sur la Carte, premier choix posé puis D (« Proposer ») : l'assistante place le curseur sur l'adversaire le plus proche au classement.
- **Catégorie du combat** : choisie sur la Carte (C), comme avant.
- **Les trois sorties d'une carte incomplète** : inchangées (mgmt-retraits.js ; la vérification des retraits se fait aussi au lancement de la soirée).

## Format de sauvegarde et migration
Champ **optionnel** `m.cal={actif,jour,vieJour,prochaines:[{jour,taille}],faites:[{n,jour,taille}]}` et `card.sizeEarly` : validés par `validateMgmt` et réparés par
`mgmtRepair` ; pas de changement de `MGMT_SAVE_VERSION` (champs absents = ancien rythme). **Partie d'avant** : à l'ouverture elle reçoit `cal:{actif:false}` ; sa soirée en cours se
joue comme avant, puis au cycle suivant (`mgmtAgendaActiver`, depuis le lendemain ou la fin de soirée) elle passe au calendrier au jour `soirées jouées × 35`. Partie neuve : agenda actif, jour 0 = 12 janvier 2027, rien de posé.

## Décisions et limites
- Le cycle reste l'unité de la simulation (affaires de Leïla, blessures, vie) : il s'ouvre après chaque soirée ; un mois passé sans soirée fait vieillir mais n'ouvre pas de cycle.
- « Réservés » = cercle ∪ suivis (brief : « bâtie sur le cercle et les suivis existants »). Une réservation propre n'existe pas encore.
- Le lieu reste « À choisir » jusqu'au lot 8.
- Les valeurs (30 jours, 12 janvier 2027) sont des propositions `relu:false`.
