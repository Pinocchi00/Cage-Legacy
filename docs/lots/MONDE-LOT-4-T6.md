# Monde lot 4 T6 — Les cartes suivantes

## Branche

`monde-lot-4-dossiers` (branche attendue et courante).

## Objectif

Offrir les dossiers de Leïla sur toute place principale libre, quelle que soit la carte à venir, et pour remplacer un combattant qui se retire.

Phrase fondatrice du brief : « La même demande est offerte sur chaque place libre de chaque carte, et pour remplacer un combattant qui se retire. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, Lot 4, T6).

## Ce qui existe

- `mgmt-carte.js` porte les piles pures `mgmtDossiersCombattants(m, exclureId, dejaVus)` (T1) et `mgmtDossiersAdversaires(m, combattantId, dejaVus)` (T2), ainsi que l'unique porte de booking `mgmtBookMain(m, aid, bid)`. Les réutiliser sans modifier leurs règles.
- `mgmt-carte-cadre.js:145-205` porte l'écran Carte/liste et ses emplacements; `:214-255` porte le rendu de dossiers; `:258-289` porte les gestes. Le mode dossiers dépend de `MGMT_CART.mode`, `MGMT_CART.etape`, `MGMT_CART.dossiers`, `index` et du contexte courant.
- `mgmt-ecran-carte.js:113-136` porte le rendu des places principales et l'action « retirer » via `CL.mgmtUnbook(i)`. Une place rendue vide y est aujourd'hui passive.
- `mgmt-calendrier.js:155-166` porte l'entrée vers la carte du prochain événement. Le commentaire de `:164-165` décrit le retrait de veille `mgmtRetraitsAvantSoiree(m)`; après ce retrait, le joueur retourne à l'Accueil et la carte est incomplète.
- `tests/mgmtDossiers.test.js` porte les tests T1/T2/T4/T5 des piles, navigation, booking, non-répétition et déterminisme. `tests/mgmtCalendrier.test.js` couvre le calendrier et la proposition de dossiers.
- `docs/lots/MONDE-LOT-4-T4.md` porte le contrat d'intégration et les gardes de booking; T5 précise que navigation ne réserve rien. `docs/lots/MONDE-LOT-4-T5.md` porte le comportement souris.

## Ce qui change

- `mgmt-carte-cadre.js` : activer l'entrée en dossiers depuis chaque emplacement principal vide, pas uniquement la prochaine place implicite. Le contexte doit identifier la place ciblée et être conservé entre les étapes combattant/adversaire; sélectionner un combattant puis confirmer l'adversaire pose exactement ce combat dans cette place via `mgmtBookMain`. Une place déjà remplie n'offre pas de pile de combattants.
- `mgmt-ecran-carte.js` : rendre chaque place libre activable pour demander des dossiers, en conservant le booking par liste et l'action de retrait existants. La demande ouvre le mode dossiers sur cette place précise, sans réserver de combattant.
- Retrait : rendre immédiatement accessible la demande de dossiers pour combler la place libérée; si le retrait de veille intervient depuis le Calendrier, l'Accueil doit permettre de rejoindre la Carte et choisir cette place. Ne pas booker automatiquement ni substituer un combattant sans choix du joueur.
- Aucun nouvel API public requis. Toute nouvelle fonction privée d'activation de place porte ce JSDoc (adapter le nom à la convention locale, garder les paramètres et contrat) :

```js
/** Ouvre les dossiers pour l'emplacement principal libre demandé.
 * Ne réserve aucun combattant et conserve l'emplacement jusqu'à confirmation.
 * @param {number} index Index zéro-based de l'emplacement dans m.card.main.
 * @returns {void}
 */
function mgmtCarteDossiersOuvrir(index)
```

- Maintenir l'état d'emplacement uniquement en mémoire d'interface; annuler/revalider le contexte lors d'un changement d'écran ou si la place n'est plus libre. À la confirmation, vérifier à nouveau les deux combattants avec la garde existante et ne changer aucune autre place.
- `tests/mgmtDossiers.test.js` : tests dédiés ci-dessous. Si l'intégration nécessite des assertions de Calendrier, les ajouter dans `tests/mgmtCalendrier.test.js`.
- Aucun nouveau script attendu. Vérifier l'ordre fragile des scripts et bump les versions de cache des fichiers modifiés avec `node tools/_bump.js <fichier>`.

## Sauvegarde

Non. L'index de place visé et le mode dossier sont temporaires; la carte ne change que par le booking existant, déjà sauvegardé normalement.

## Textes

Aucun. Réutiliser les libellés de la planche validée; pas de texte auteur nouveau.

## Écran

Planche validée : `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html`. Aucun nouvel écran ni modification de planche. Garder l'interface conforme aux deux planches.

## Tests

Fichier principal : `tests/mgmtDossiers.test.js`.

- `Monde lot 4 T6 — chaque place libre de la carte ouvre ses dossiers` : avec une carte comportant au moins deux places libres, activer chacune; le mode est dossiers et son contexte cible exactement l'index demandé, sans modifier `m.card.main`.
- `Monde lot 4 T6 — confirmer un dossier remplit uniquement la place visée` : sélectionner combattant et adversaire admissibles sur une place libre non première; espionner `mgmtBookMain`, vérifier un appel avec leurs IDs et que seule cette place reçoit le combat.
- `Monde lot 4 T6 — les dossiers ne s'ouvrent pas sur une place occupée` : activer une place bookée ne remplace ni ne retire son combat et ne lance aucun booking.
- `Monde lot 4 T6 — un retrait libère une place accessible aux dossiers` : booker une paire puis la retirer; ouvrir les dossiers sur l'index libéré, confirmer une autre paire valide et vérifier que la carte contient ce combat à l'index libéré.
- `Monde lot 4 T6 — le retrait de veille laisse la place libre et remplaçable` : graine déterministe déclenchant `mgmtRetraitsAvantSoiree`; après retour au jeu, la place retirée reste vide, peut recevoir des dossiers puis être complétée manuellement, sans réservation automatique.
- `Monde lot 4 T6 — dossiers sur toutes les cartes programmées sans altérer les autres` : poser deux soirées, remplir les places sur la carte de la seconde via dossiers, vérifier qu'aucun combat de la première carte ni donnée de calendrier n'est modifié. (Les dossiers servent la carte actuellement ouverte; ils ne changent pas le calendrier.)
- `Monde lot 4 T6 — le choix par dossier garde les mêmes règles que la liste` : dans deux états identiques, même paire bookée par dossiers et par liste sur une même place; comparer exactement les cartes résultantes.

Les assertions T1/T2/T4/T5 existantes restent intactes.

## Vérification

- `node --test tests/mgmtDossiers.test.js tests/mgmtCalendrier.test.js tests/mgmtCarteCadre.test.js`
- `npm run check:rapide` et `node tools/verif-versions.js origin/main` (les écarts hérités signalés dans `MONDE-LOT-4-DECISIONS.md` ne comptent pas; vérifier tous les scripts modifiés).
- Critère de fin : chaque place libre de la carte ouverte est adressable; 0 booking automatique; toute confirmation remplit exactement la place demandée par un appel valide à `mgmtBookMain`; 0 changement des autres combats ou soirées; les tests T1 à T5 ciblés restent verts.

## Hors périmètre

Ne pas modifier le catalogue/sélection des piles T1/T2, les raisons du lot 6, les règles de `mgmtBookMain`, le calendrier, le processus aléatoire de retrait, le contenu des cartes, la sauvegarde, les textes, les planches ou les autres écrans. Ne pas créer de système alternatif de booking. Ne pas retirer le booking par liste. Le choix d'un remplaçant reste manuel.

## Pièges

- Le mode dossiers existant est bâti autour du contexte de sélection courant et ne porte pas explicitement, dans son contrat T4, l'index de place visée; ne pas déduire la cible de `main.length` pour les trous non terminaux.
- `mgmtBookMain` est l'unique porte de pose et possède ses propres gardes. Une pile affichée n'est ni réservation ni garantie de validité ultérieure.
- `mgmtCarteDossiersCombattants`/`Adversaires` excluent les combattants déjà engagés. Lors d'un remplacement, il faut d'abord libérer l'ancien combat via l'action existante; ne pas laisser l'ancien adversaire engagé par erreur.
- Le retrait de veille est déclenché dans `mgmtCalendrierJouer` avant `mgmtAgendaJouer`, puis renvoie à l'Accueil; le test doit traverser ce chemin réel plutôt que simuler un retrait de pile seulement.
- Les données d'écran sont globales et le mode de l'écran peut survivre à un rendu; nettoyer ou revalider l'index ciblé en cas de sortie, changement de carte ou occupation concurrente.
- Les scripts de `index.html` sont ordonnés et les caches contrôlés par `sw.js`; éviter tout nouveau script.

## Décisions et questions

- Décision technique : index zéro-based correspondant à l'emplacement réel dans `m.card.main`, et non à `main.length`; ainsi les trous intermédiaires et les retraits sont correctement adressés.
- Décision technique : dossiers utilisables pour la carte actuellement affichée dans l'écran Carte. Les « cartes suivantes » du brief désignent les soirées suivantes lorsqu'elles deviennent la carte active, pas un booking anticipé sur une soirée non ouverte; l'interface et `mgmtBookMain` sont conçus pour un seul tableau de combats courant.
- Décision technique : une annulation laisse un emplacement libre; on ne remplace pas automatiquement le combattant retiré. Le joueur choisit et confirme le nouveau combat, conformément à « demande » et au principe de contrôle de booking.
- Décision technique : tests de retrait de veille utilisent une graine fixe obtenue par recherche dans le test, puis verrouillée; ne pas rendre le hasard non déterministe pour faciliter le test.
- Question pour Anthony : aucune.

## Compte rendu

- `mgmt-carte-cadre.js` : ajout d'une action Dossiers sur les emplacements vides et d'un contexte temporaire de cible; confirmation repasse par `mgmtBookMain`.
- `index.html` et `sw.js` : versions de cache montées par `node tools/_bump.js mgmt-carte-cadre.js`.
- Tests ajoutés : aucun. Tests ciblés existants exécutés : `mgmtDossiers.test.js`, `mgmtCalendrier.test.js`, `mgmtCarteCadre.test.js` (46 réussis).
- Migration de sauvegarde : aucune.
- Écart : T6 incomplète, notamment assertions dédiées absentes. La cible intermédiaire engendre un tableau `main` clairsemé; sa compatibilité avec tous les consommateurs du tableau nécessite un traitement plus large avant livraison.
- Questions pour Anthony : faut-il autoriser explicitement les trous dans `m.card.main` et adapter tous ses consommateurs, ou maintenir une représentation compacte avec un index de place distinct ?
