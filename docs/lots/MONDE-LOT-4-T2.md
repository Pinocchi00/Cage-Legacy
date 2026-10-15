# Monde lot 4 T2 — La pile d'adversaires

## Branche

`monde-lot-4-dossiers` (branche attendue et courante).

## Objectif

Après le choix d'un combattant, produire une pile déterministe de quatre à six adversaires libres de sa catégorie, chacun accompagné d'une raison vérifiable pour ce combat, en remplacement de la proposition unique de la touche D.

Phrase fondatrice du brief : « Même chose pour un combattant choisi, dans sa catégorie. Elle remplace la proposition unique de la touche D. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, Lot 4, T2).

## Ce qui existe

- `mgmt-carte.js:856` `mgmtDossiersCombattants(m, exclureId, dejaVus)` produit déjà la pile de combattants; réutiliser son modèle de filtrage, sélection sans réservation, variété et déterminisme.
- `mgmt-carte.js:414` `mgmtBookMain(m,aid,bid)` est l'unique porte pour poser un combat. `mgmt-carte.js:470` `mgmtSelectable(m,f,pick)` vérifie le booking, et `mgmt-carte.js:...` `mgmtEngaged(m,f)` l'engagement sur la carte.
- `mgmt-raisons.js:21` `mgmtRaisonsPourPaire(m,fa,fb)` fournit des raisons et preuves structurées; `:35` `mgmtRaisonsIndex(m,paires)` construit l'index des paires. Réutiliser cette source, aucune raison ne se fabrique.
- `mgmt-agenda.js:217` `mgmtAgendaProposer(m,id)` est la proposition unique actuelle.
- `mgmt-carte-cadre.js:187,231-233,253-254` présente le bouton et route la touche D/d vers `CL.mgmtCarteProposer`; la liste et son curseur restent les options de repli.
- `tests/mgmtDossiers.test.js` couvre déjà la T1 : pile, raison et preuve, exclusions, non-répétition, déterminisme et pureté. `tests/mgmtCalendrier.test.js:127-133` vérifie la proposition et le déplacement du curseur.
- Les planches validées sont `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html`.

## Ce qui change

- `mgmt-carte.js` : ajouter une fonction pure exposée globalement, sans changer les fonctions existantes.

```js
/** Sélectionne les dossiers d'adversaires libres pour le combattant choisi.
 * Chaque dossier contient l'adversaire, une raison vérifiable et sa preuve.
 * Ne modifie ni la partie, ni la carte, ni la RNG globale.
 * @param {Object} m Partie en mémoire.
 * @param {string} combattantId ID du combattant choisi.
 * @param {Array<string>} dejaVus IDs d'adversaires déjà montrés pour ce choix.
 * @returns {Array<{combattant:Object, adversaire:Object, raison:Object}>} De 4 à 6 dossiers, ou tous ceux restant si moins de 4.
 */
function mgmtDossiersAdversaires(m, combattantId, dejaVus=[])
```

  La fonction ne booke ni ne réserve. Le combattant choisi doit être valide et sélectionnable; autrement retourner `[]`. Les candidats sont exclusivement dans la même catégorie et organisation, sélectionnables pour ce combattant, non engagés sur la carte, distincts de lui et de `dejaVus`. Une paire sans raison issue de `mgmtRaisonsPourPaire` ne produit pas de dossier. Les familles de raisons sont distinctes dans la pile. Maximum six; s'il reste moins de quatre candidats admissibles, les retourner tous. Garder l'ordre catalogue des familles et l'ordre stable des IDs avant tirage; toute sélection aléatoire utilise exclusivement la RNG seedée existante.
- `mgmt-carte-cadre.js` : remplacer l'action D/d de proposition unique par l'exposition de la pile d'adversaires via l'état de sélection déjà utilisé par l'écran. Au clic/Entrée de choix, conserver le chemin existant de réservation par `mgmtBookMain`; pas de changement d'écran (c'est T4).
- `tests/mgmtDossiers.test.js` : ajouter les tests ci-dessous. `tests/mgmtCalendrier.test.js` : adapter le test de D pour vérifier que les dossiers sont proposés plutôt que déplacer automatiquement le curseur vers un seul adversaire.
- Aucun changement de sauvegarde, de données de textes, ni de `index.html` attendu. Si une modification d'ordre de chargement s'avère indispensable, l'expliciter et mettre à jour la version du script selon la convention.

## Sauvegarde

Non. Les dossiers sont calculés à la demande; aucun état persistant nouveau.

## Textes

Aucun. Les raisons sont des données structurées du lot 6; cette tranche n'introduit aucun contenu auteur.

## Écran

Pas de nouvel écran ni de changement de planche dans T2. Planche validée disponible : `maquettes/monde/MondeDossiersAdversaire.html`; son rendu relève de T4.

## Tests

Fichier : `tests/mgmtDossiers.test.js`.

- `Monde lot 4 T2 — une pile contient quatre à six adversaires libres de la catégorie du combattant` : combattant choisi et place libre seedés; taille 4–6, IDs distincts, même organisation/catégorie, sélectionnables, non engagés et hors carte.
- `Monde lot 4 T2 — moins de quatre adversaires admissibles sont tous retournés` : fixtures avec 1, 2 et 3 admissibles; taille et IDs retournés correspondent exactement aux candidats restants.
- `Monde lot 4 T2 — chaque raison correspond à une preuve de la paire choisie` : chaque raison est exactement présente dans `mgmtRaisonsPourPaire(m, combattant, adversaire)`.
- `Monde lot 4 T2 — une pile ne répète aucune famille de raison` : les familles de toutes les raisons sont uniques.
- `Monde lot 4 T2 — redemander une pile ne répète pas les adversaires déjà montrés` : passer les IDs reçus dans `dejaVus`; aucune répétition tant qu'il reste des candidats admissibles.
- `Monde lot 4 T2 — combattant absent ou invalide ne produit aucun adversaire` : ID inconnu, indisponible ou engagé donne `[]`.
- `Monde lot 4 T2 — la même graine et le même état donnent la même pile sans effet de bord` : deux fenêtres/rechargements identiques donnent le même JSON; `m`, `G` et graine restent identiques après l'appel.
- `Monde lot 4 T2 — la touche D affiche plusieurs dossiers sans booker` (`tests/mgmtCalendrier.test.js`) : après D, la carte et `mgmtBookMain` ne sont pas modifiés et les choix proposés sont ceux de la pile.

## Vérification

- `node --test tests/mgmtDossiers.test.js tests/mgmtCalendrier.test.js`
- Critère de fin : tous les tests ci-dessus passent; 4–6 entrées si au moins quatre candidats admissibles, sinon exactement tous les candidats restants; aucun combat n'est posé avant confirmation.

## Hors périmètre

Ne pas coder le rendu du mode dossiers (T4), la pile de combattants (T1), les interactions souris (T5), les cartes suivantes (T6), de nouveaux textes, une migration, ni un système de booking alternatif. Ne pas supprimer la liste complète : elle reste accessible.

## Pièges

- La touche D passe par `CL.mgmtCarteProposer()` et `mgmtAgendaProposer`; plusieurs usages appellent encore la sélection de liste et le déplacement de curseur. La remplacer uniquement pour l'action prévue, sans casser le booking par liste.
- `mgmtBookMain` valide lui-même la paire et peut échouer si la partie a changé : ne considérer aucun dossier comme réservé avant confirmation.
- Les fonctions de raisons et lecteurs s'appuient sur des caches globaux; respecter leurs enveloppes pures, ne pas modifier `G`, les mémos ou la graine.
- La même catégorie est nécessaire mais insuffisante : respecter aussi organisation, disponibilité et absence de réservation sur la carte.
- L'ordre des `<script>` dans `index.html` est fragile; préférer les fichiers chargés existants. La fonction doit rester cohérente avec les versions de cache gérées par `sw.js`.

## Décisions et questions

- Décision technique : le combattant absent, indisponible ou engagé renvoie une pile vide plutôt qu'une sélection de secours; cela empêche de présenter des choix impossibles.
- Décision technique : ne pas filtrer les adversaires sur leur seule disponibilité générale; appeler la garde de booking avec l'ID du combattant choisi, afin que la fonction effective (`mgmtBookMain`) reste la référence de compatibilité.
- Décision technique : exclure les candidats sans raison vérifiable, car le brief requiert une raison dans chaque dossier et les données du lot 6 en sont la source de vérité.
- Question pour Anthony : aucune.

## Compte rendu

- Fichiers modifiés : `mgmt-carte.js` (ajout de `mgmtDossiersAdversaires` sous l’ancre `MONDE_LOT4_T2_DOSSIERS_ADVERSAIRES`) ; `mgmt-carte-cadre.js` (`mgmtCarteProposer` expose la pile de dossiers d’adversaires sans booker, sans déplacer le curseur ni changer d’écran) ; `tests/mgmtDossiers.test.js` (tests T2) ; `tests/mgmtCalendrier.test.js` (adaptation du test de D) ; `docs/lots/MONDE-LOT-4-T2.md` (compte rendu).
- Tests ajoutés : les sept intitulés T2 listés dans la fiche (pile 4–6, moins de quatre candidats retournés tous, raison = preuve, familles distinctes, non-répétition via `dejaVus`, combattant absent/invalide, déterminisme/sans effet de bord) plus l’adaptation de la touche D.
- Migration de sauvegarde : aucune (dossiers calculés à la demande).
- Écarts à la fiche : aucun.
- Questions pour Anthony : aucune.
