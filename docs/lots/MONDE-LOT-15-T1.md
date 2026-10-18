# Monde lot 15 T1 — la carte laissée par l'ancien matchmaker (places 4 et 5)

Branche : `monde-lot-15-heritage`. **Décisions d'Anthony du 17/10/2026** : « la carte faite soit les deux premiers combats (5,4) de la carte principale seulement, en faisant des combats logiques, et pas des combats entre champions » ; « ce n'est pas Leïla qui compose, c'est la carte en cours que l'ancien matchmaker a laissée » (les préliminaires restent posés avec elle) ; « combat titre en jeu soit raccourci… ou "vient d'avant" est à enlever ».

## Ce qui change
- **La carte héritée** (`mgmtPredecesseurCarteHeritee`, `mgmt-predecesseur.js`) : exactement **deux** combats, jamais un champion, jamais de titre en jeu, deux combattants **voisins au classement de leur catégorie** (rangs 6 à 20, sinon n'importe quel non-champion en dernier recours), une catégorie par combat quand c'est possible. Un seul tirage seedé choisit la catégorie de départ (le test du source exige un seul `rnd(`).
- **Sans trou dans `m.card.main`** (tableau dense, ~100 usages) : les combats d'ouverture portent `ouverture:true` et restent en **fin de tableau** ; un combat que le joueur pose (`mgmtBookMain`, remontée d'un préliminaire) s'**insère devant** (`mgmtCarteInserer`, `mgmt-carte.js`). Le premier combat posé reste le combat principal (index 0, cinq rounds), les ouvertures se jouent en premier. `mgmtCartePlaces(m)` donne l'ordre d'affichage : places 1 à 3 pour le joueur, 4 et 5 pour l'héritage.
- **L'écran Carte** affiche les places (`mgmtCarteCombatLigne(m,i,fight,etat,idx)` : `i` = place, `idx` = index réel pour les actions) ; les touches 1 à 5 retirent le combat de **la place** (`CL.mgmtUnbookPlace`) ; le numéro du dossier (« COMBAT k ») suit la première place libre.
- **Étiquettes** : « VIENT D'AVANT » supprimée (la classe `herite` et le bouton « Annuler ce combat [X] » restent) ; « TITRE EN JEU » devient « TITRE » (l'infobulle garde « Titre en jeu »).
- **Sauvegarde** : `ouverture` n'est valide que sur un combat de la carte principale ; `mgmtRepair` remet les ouvertures en fin de carte (partition stable). Aucun changement de version de sauvegarde : un champ facultatif.

## Tests adaptés (décision citée)
`mgmtCartePremierJour` (deux combats hérités, le joueur s'insère devant, plus d'étiquette), `mgmtAnnulationHeritee` (index réels, touches 4 et 5), `mgmtCorrectionsLot2` (« TITRE »), `mgmtCarteHeriteeSixAns` (deux combats pour les huit organisations, deux graines : vérifié).

## Hors périmètre (noté)
Leïla ne touche qu'aux préliminaires (décision) : ses **dossiers de la carte principale** existent encore — question posée à Anthony, rien retiré.
