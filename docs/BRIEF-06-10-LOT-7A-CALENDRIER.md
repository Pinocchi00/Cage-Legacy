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

## Deuxième tranche : la Carte (Booking) — `mgmt-carte-cadre.js`
Planche « Booking » : à gauche les cinq combats (principal, co-principal, 3, 4, 5) avec leur état — **confirmé**, **à confirmer** (le combat que
le joueur prépare : premier choix + adversaire visé, jamais persisté), **à composer** ; au centre le face-à-face (bannière, mêmes six lignes de
comparaison pour les deux : classement, palmarès, allonge, style, trois derniers combats, contrat restant) et « Confirmer le combat » ;
à droite les adversaires de la catégorie (C change de catégorie, F ouvre la fiche, 1 à 5 retirent un combat). La pastille TITRE remplace la case
du lot 5. **Aucune règle de composition ne change** et le format de sauvegarde non plus : un combat n'entre sur la carte que par la confirmation
du joueur, donc aucun combat n'est joué sans avoir été validé. Contrat restant et enjeux de presse/public : « — » / absents tant que les lots 8-10
n'existent pas ; les enjeux affichés sont « Titre possible » et le nombre de rounds.
**Tests** : les tests qui lisaient le DOM de l'ancien écran (`mgmtCard`, `mgmtCategoriesFeminines`, `mgmtCeintures`, `nomsApostrophe`) tournent sur
la fonction ancienne `scr_mgmt_carte` (restée dans le code) via `tests/helpers/loadGameCarteAncienne.js` ; décision : « ressemble exactement » (Anthony,
06/10). Le comportement est re-testé sur le nouvel écran dans `tests/mgmtCarteCadre.test.js`.
