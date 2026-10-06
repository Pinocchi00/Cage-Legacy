# Brief du 06/10/2026 — Lot 8 : la salle, le public et l'argent

Code : `mgmt-salles.js` (règles, aucun DOM), `mgmt-finances.js` (écran), le lieu dans `mgmt-calendrier.js`, l'agenda dans `mgmt-agenda.js`, la recette dans `mgmtRunEvent` (`mgmt-corps.js`).
Tests : `tests/mgmtSalles.test.js` (7), `tests/mgmtFinances.test.js` (4). Mesure : `node tools/mesure-salles.js [parties]`.
Tout ce qui suit ne vaut que pour une partie **à l'agenda actif** (lot 7) : l'ancien rythme garde ses constantes.

## Livré
- **Salles** : six par partie (`m.salles`), une ville, un nom (« Dôme de Lyon »), une capacité (de 800 à 9 000 places, mises à l'échelle par le profil de l'organisation).
  Dérivées de l'organisation, jamais tirées au hasard (même partie, mêmes salles).
- **Popularité** (`m.pop`, 5 à 100, départ = profil de l'organisation) : jamais affichée en jauge ; elle fixe le **plafond de remplissage**
  (600 + pop × 84 spectateurs) — une salle plus grande que ce plafond ne se remplit pas au-delà.
- **Remplissage** = min(salle, plafond) × (0,15 + 0,85 × qualité de la carte) × taille (petite 0,75, grosse 1) ; une grosse remplit plus et rapporte plus.
- **Recette** = billetterie (spectateurs × 65 €) + droits du diffuseur (formule d'avant) − cachets − bonus − **location de la salle** (4 € par place, pleine ou vide : le frein d'une salle trop grande).
- **Satisfaction** (0 à 100) sur trois critères, chacun pris seul la fait monter : les combats **réclamés** qui ont eu lieu (revanches et troisièmes combats appelés par les rivalités et
  les demandes ouvertes ; neutre à 0,5 quand rien n'est réclamé), les combats **finis avant la limite** (un nul compte pour serré), les **noms à l'affiche** (renom des deux derniers combats).
  Elle règle la popularité : (satisfaction − 55) / 6, moins 2 si la salle est remplie à moins de 35 %.
- **Lieu** choisi au Calendrier (V dans la pose d'une soirée, la salle conseillée par défaut) ; le lieu s'affiche partout où « À choisir » s'affichait.
- **Écran Finances** (planche) : six cartes — en caisse, dernière soirée, prochaine soirée (bourses déjà engagées sur la carte en cours de composition), découvert autorisé, bourses versées
  (les cinq dernières soirées), fins de contrat — ← → choisissent, Entrée montre le détail. **Montants en euros** (`mgmtEuros` : 1 k$ de la simulation = 1 000 €).
- La caisse après une soirée = la caisse d'avant + recettes − dépenses (testé), `lastEvent.finance` et `m.comptes` portent le détail.

## Calibrage (tools/mesure-salles.js, 8 parties par cas, petite soirée, salle conseillée)
Carte faible −22 k$, moyenne ≈ 0, forte +33 k$ ; en salle trop grande : −42 / −22 / +13 ; une grosse rapporte plus qu'une petite à carte égale. Sur 40 parties simulées (test), des soirées
faibles dans une salle trop grande perdent de l'argent à 38 parties sur 40 au moins ; la mesure à 200 parties se lance avec l'outil.

## Format de sauvegarde
Champs **optionnels** `m.salles`, `m.pop`, `m.comptes` et `salle` sur les soirées de l'agenda, validés (`mgmtSallesValide`) et réparés ; pas de changement de `MGMT_SAVE_VERSION`.

## Pas fait / décisions
- **Défis publics et presse** (sources des combats réclamés) : lot 10 ; aujourd'hui rivalités et demandes ouvertes seulement.
- **Fins de contrat** : « — » jusqu'au lot 9.
- **« Devant le combat, une salle plus ou moins pleine »** : affichage en soirée, lot 11 ; le remplissage est déjà calculé et gardé (`lastEvent.finance.spectateurs`).
- Valeurs (prix du billet, location, plafond, seuil de satisfaction) : propositions `relu:false`. Noms de villes et genres de salles : listes de travail, aucun nom de personnage.
- L'écran « Organisation » d'avant reste dans le code ; la section Finances de la barre ouvre le nouvel écran.
