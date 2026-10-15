# Monde lot 4 T1 — La pile de combattants

## Branche

`monde-lot-4-dossiers` (branche attendue et courante ; créée depuis la branche du lot 6 pour disposer de `mgmt-raisons.js`).

## Objectif

Fournir, pour une place libre de carte principale, une pile déterministe de quatre à six combattants disponibles et chacun accompagné d'une raison vérifiable, sans répéter de famille dans la pile.

Phrase fondatrice du brief : « Une fonction pure rend quatre à six combattants libres pour une place, chacun avec sa raison (lot 6). Jamais deux raisons de la même famille dans une pile. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, Lot 4, T1).

## Ce qui existe

- `mgmt-carte.js:117` `mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed,famille,raisonsIndex)` : sélectionne une paire avec famille de raison imposée ; réutiliser sa logique de candidats plutôt que créer un autre système.
- `mgmt-carte.js:217` `mgmtBulkSelection(m,used,seen,n,stats,relaxed,contexte=[])` : sélection en bloc existante ; ne pas détourner le choix de préliminaires en booking principal.
- `mgmt-raisons.js:21` `mgmtRaisonsPourPaire(m,fa,fb)` et `:35` `mgmtRaisonsIndex(m,paires)` : raisons/preuves déterministes, lectures sans mutation ; `mgmtRaisonsPourPaire` porte la lecture pure des raisons.
- `mgmt-carte.js:44` `mgmtCardFights(m)`, `:53` `mgmtCardFull(m)` et `mgmtBookMain` sont les références pour les combats de carte et les gardes de booking. La pose effective reste réservée à la sélection du joueur.
- `tests/mgmtRaisonsSelection.test.js` couvre sélection de raisons, preuves, variété, pureté et déterminisme. `tests/mgmtCard.test.js` couvre les gardes de booking.
- La fiche superviseur `docs/lots/MONDE-LOT-4-DECISIONS.md` précise la branche, les planches validées et l'ordre du lot ; aucune fiche T antérieure du lot 4 n'existe.

## Ce qui change

- `mgmt-carte.js` : ajouter à côté des fonctions de sélection une fonction pure exposée globalement. Chaque dossier contient le combattant et sa raison, ainsi que la paire de preuve interne utile au test (combattant proposé en adversaire) ; cette paire n'est pas bookée. Signature publique :

```js
/** Sélectionne des dossiers de combattants libres pour une place principale.
 * Chaque entrée contient le combattant et une raison vérifiable ; aucune
 * famille n'est répétée. Ne modifie ni la partie, ni la carte, ni la RNG globale.
 * @param {Object} m Partie en mémoire.
 * @param {string|null} exclureId Combattant déjà choisi pour cette place, sinon null.
 * @param {Array<string>} dejaVus IDs montrés dans les piles antérieures de cette place.
 * @returns {Array<{combattant:Object, raison:Object, adversaire:Object}>} De 4 à 6 dossiers, ou tous ceux restant si moins de 4.
 */
function mgmtDossiersCombattants(m, exclureId=null, dejaVus=[])
```

  La fonction ne réserve ni ne booke les candidats. Inclure uniquement des combattants de l'organisation du joueur satisfaisant les gardes `mgmtSelectable` pour une place principale, sans combattant déjà engagé sur la carte ni l'ID exclu. Réutiliser les raisons produites par `mgmtRaisonsPourPaire` et leur preuve ; aucune raison ne peut être fabriquée. Sélectionner de 4 à 6 dossiers (maximum 6), avec des familles distinctes ; s'il reste moins de 4 candidats admissibles, retourner tous ceux-ci. Respecter l'ordre de catalogue des familles et l'ordre stable des IDs avant tirage ; tout tirage éventuel emploie exclusivement la RNG seedée déjà disponible.
- `tests/mgmtDossiers.test.js` : ajouter les tests listés ci-dessous.
- Pas de changement d'écran, de sauvegarde, ni de nouveaux textes.

## Sauvegarde

Non. La pile est calculée à la demande et ne constitue pas un état persistant.

## Textes

Aucun : les raisons sont les données structurées du lot 6, aucun texte de contenu auteur nouveau dans cette tranche.

## Écran

Aucun dans T1. Les planches validées pour les tranches d'écran du lot sont `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html` ; T1 n'en modifie pas le rendu.

## Tests

Fichier : `tests/mgmtDossiers.test.js`.

- `Monde lot 4 T1 — une pile contient quatre à six combattants libres avec des familles distinctes` : créer une place libre seedée ; tous les IDs sont distincts, disponibles, non engagés/non bookés, et les familles des raisons sont uniques ; taille comprise entre 4 et 6.
- `Monde lot 4 T1 — moins de quatre candidats admissibles sont tous retournés` : fixture où il reste 1, 2 puis 3 candidats ; la fonction retourne exactement chacun des candidats admissibles et aucun autre.
- `Monde lot 4 T1 — la raison de chaque dossier correspond à une preuve de la paire` : pour chaque entrée, la raison correspond exactement à un élément de `mgmtRaisonsPourPaire(m, dossier.combattant, dossier.adversaire)` ; l'adversaire est bookable, de la même catégorie, et n'est pas posé sur la carte.
- `Monde lot 4 T1 — redemander une pile ne répète pas les combattants déjà montrés` : passer tous les IDs de la pile précédente en `dejaVus` ; aucune répétition tant qu'il reste des candidats admissibles.
- `Monde lot 4 T1 — la même graine et le même état donnent la même pile sans effet de bord` : comparer les résultats après rechargement avec même graine/état ; JSON de `m`, `G` et valeur de graine inchangés après lecture.

## Vérification

- `node --test tests/mgmtDossiers.test.js`
- Critère de fin : les cinq tests ci-dessus passent ; 4–6 dossiers lorsque quatre candidats admissibles ou plus existent, sinon exactement tous les candidats restants.

## Hors périmètre

Ne pas faire la pile d'adversaires (T2), l'écran ou le mode dossier (T4), la souris (T5), les cartes suivantes (T6), ni changer `mgmtBookMain`, les règles de booking, la sauvegarde, le catalogue des raisons ou les planches. Aucun second système de booking.

## Pièges

- `mgmtRaisonsPourPaire` dans `mgmt-raisons.js` prend deux combattants : aucun dossier ne peut prétendre à une raison sans paire de preuve. L'adversaire associé est seulement informatif à cette étape, pas réservé ni booké.
- La fonction de raison et les lecteurs appelés ont des caches globaux ; s'appuyer sur leurs enveloppes pures et ne pas écrire dans `G`, l'état de partie, les mémos ni la graine.
- Les fonctions de sélection en bloc de `mgmt-carte.js` servent les préliminaires de Leïla et intègrent leurs contraintes de variété ; elles ne sont pas un booking de carte principale. La place reste libre jusqu'à confirmation et `mgmtBookMain` demeure l'unique porte de booking.
- Vérifier `index.html` avant d'insérer un nouveau script : l'ordre de chargement est fragile. Préférer le fichier existant si aucune nécessité de nouvel ordre n'est démontrée.

## Décisions et questions

- Décision technique : si une paire n'a pas de raison vérifiable, elle n'alimente pas un dossier. Le brief exige une raison par dossier et le lot 6 fournit le lecteur de preuve ; un dossier sans fait serait trompeur.
- Décision technique : maximum six dossiers, et tous les candidats restants sous quatre ; c'est la règle explicite du brief, sans compléter artificiellement une pile.
- Décision technique : les ID déjà vus sont exclus localement au contexte de la place, et non persistés. Le brief demande l'absence de répétition pendant les demandes successives, pas un changement de sauvegarde.
- Question pour Anthony : aucune.

## Compte rendu
- Fichiers modifiés : mgmt-carte.js (fonction mgmtDossiersCombattants, ancre MONDE_LOT4_T1_DOSSIERS) ; index.html/sw.js (version bump mgmt-carte.js) ; package.json (ajout du test) ; tests/mgmtDossiers.test.js.
- Tests ajoutés : cinq tests Monde lot 4 T1 (taille/familles, retour sous quatre, preuve paire, non-répétition, déterminisme/pureté).
- Pas de migration de sauvegarde.
- Écarts à la fiche : aucun.
- Questions pour Anthony : aucune.
