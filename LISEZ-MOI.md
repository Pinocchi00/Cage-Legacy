# Cage Legacy — livraison des correctifs

## Contenu de cette livraison

- **nouvelle-version/** — les 9 fichiers modifiés, prêts à remplacer ceux du repo GitHub (`Pinocchi00/Cage-Legacy`).
- **version-originale/** — les mêmes 9 fichiers tels qu'ils étaient AVANT toute intervention (récupérés depuis la branche `main` du repo, intacte — aucun push n'a été fait pendant ce travail).

## Pour appliquer les correctifs

Remplace dans ton repo local ces 9 fichiers par ceux de `nouvelle-version/` :

```
engine.js
index.html
ui-01-roster-matchmaking.js
ui-02-fight-prep-events.js
ui-03-contracts-arcade-data.js
ui-04-faith-arcade-screens.js
ui-06-career-screens.js
ui-07-contracts-legacy-screens.js
ui-08-controller-arena.js
```

Aucun autre fichier n'a été touché (`ui-05-fight-resolution.js`, `state.js`, `main.js`, `data-skills.js`, `data-content.js` sont restés strictement identiques à l'original tout du long).

## Pour tout annuler (rollback complet)

Remplace les 9 fichiers ci-dessus par leurs équivalents dans `version-originale/` — tu retombes exactement sur l'état du repo avant cette session, fichier pour fichier.

## Où voir chaque changement en jeu

| Changement | Écran / façon d'y accéder |
|---|---|
| Bug fiche complète (boost signature, cartes recouvertes, retour navigation) | Écran **Fiche complète** (bouton "Bilan technique complet" depuis le vestiaire ou le hub) |
| Voile `.glass`/boutons qui lavait le texte (correctif racine) | Visible partout, mais le plus flagrant sur les **CTA principaux** (ex. "ÉVALUER LES CONTRATS" au hub, "1. MMA FAITH" à l'écran-titre) |
| Gauntlet consolidé (cartes fusionnées, bascules avec retour tactile) | Menu **Gauntlet** → Boss Run / Ladder 100 / Bracket 64, en cours de run |
| Bug bracket/scénarios "cliquables" qui ne faisaient rien | **Bracket 64** → "VOIR LE TABLEAU COMPLET" ; **Salle des Légendes** → scénarios verrouillés |
| Couleur du bandeau "DERNIÈRE DANSE" désynchronisée | Offre de contrat en fin de carrière avec un **contrat final** (Sommet ou agence libre) |
| Classes `.blood`/`.sage`/`.raise`/`.fade` manquantes (noms des combattants, écran d'arène) | **N'importe quel combat** — écran d'arène en direct |
| Niveaux de "juice" 1 à 4 (hit-stop, zoom, particules, halo, ralenti, chromatic aberration, foule) | **N'importe quel combat** — écran d'arène en direct, effets plus visibles sur un KO/soumission |
| Nom de légende importé non échappé | Écran **Défi entre amis**, après avoir importé un code d'ami |
| Typographie (chiffres alignés), boutons dorés en dégradé, micro-feedback au tap | Visible partout où `.mono` affiche des chiffres, et sur tout bouton doré (ex. "ENCAISSER ET SORTIR") |
| Entrée à ressort des écrans + cascade des listes (`.stagger`) | **Tout changement d'écran** (ressort) ; liste d'adversaires (**matchmaking**) et **Panthéon** (cascade) |
| Accent froid "nouveau record" | Fin d'un run **Gauntlet** qui bat ton record personnel existant (Ladder/Bracket/Boss Run) |
| Test grain/texture | Écran **Fiche complète**, uniquement si le combattant est **champion en titre** (carte "Statut de championnat") |
| Icône `belt` neuve | Écran **Registre des ceintures** (bouton depuis le hub), dans le titre |
| Icône `pact` neuve | N'importe quel run **Gauntlet** avec un contrat de run actif, dans le bloc "État du run" |
| Test densité variable (carte Technique en vedette) | Écran **Fiche complète** — comparer au bas de l'écran (Mental/Physique désormais côte à côte, plus petits) |

## Validation effectuée

Tous les fichiers livrés ont été vérifiés avec `node --check` (syntaxe) et `eslint` (0 erreur) avant livraison, plus des simulations de combat complètes rejouées via un harnais Node/vm chargeant le vrai code du jeu (sans navigateur) pour confirmer l'absence d'exception à l'exécution.
