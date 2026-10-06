# Brief du 06/10/2026 — Lot 7, première tranche : l'écran Calendrier

Code : `mgmt-calendrier.js`, bloc `.mf-cal-*` de `ui-cadre.css`. Planche « Management — Calendrier ».

## Livré
Trois soirées côte à côte (la précédente, la courante, la suivante), huit onglets « Soirée N », ← → pour parcourir, Entrée ouvre la carte
pour la soirée en cours seulement. La courante montre l'état de sa carte (principale x/5, préliminaires y/7, « Il manque N combats »).
Une soirée passée montre son combat principal (« X a battu Y », lu dans la trace).

## Décisions et trous
- **Les dates sont dérivées** du numéro de soirée (jamais stockées) : première soirée le 12 janvier 2027, puis toutes les 5 semaines. Valeur
  proposée, `relu:false`. Le brief demande des dates choisies par le joueur : **reste à faire** (tranche suivante).
- **Le lieu n'existe pas** (lot 8) : « À choisir ».
- **Reste du lot 7** : poser une soirée à la date choisie, petite (9) / grosse (13), une grosse par mois, temps qui avance sans soirée, états
  à composer / à confirmer / confirmé, validation avant jeu, réservation, préparation à la demande, catégorie choisie sur la carte, ordre de passage.
