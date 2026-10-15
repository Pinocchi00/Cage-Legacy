# Monde lot 4 T4 — L’écran des dossiers

## Branche

`monde-lot-4-dossiers` (branche attendue et courante).

## Objectif

Intégrer les dossiers de Leïla à l’écran Carte comme mode de sélection réellement navigable, avec retour immédiat à la liste et confirmation du booking par la porte existante.

Phrase fondatrice du brief : « Un mode de l'écran Carte. Touches : ← et → pour défiler, Entrée pour choisir, Échap pour revenir, F pour la fiche complète, et une touche pour la liste. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, Lot 4, T4).

## Ce qui existe

- `mgmt-carte-cadre.js:149-204` rend l’écran Carte en trois colonnes, les combattants choisis, les boutons et les raccourcis clavier; conserver l’écran et son cadre.
- `mgmt-carte-cadre.js:230-236` `CL.mgmtCarteProposer()` remplit déjà `MGMT_CART.dossiers` avec la pile d’adversaires de T2, sans réserver ni booker.
- `mgmt-carte-cadre.js:208-228` contient les actions de liste, de catégorie et de fiche; `:241-265` branche les touches. Les flèches haut/bas naviguent encore la liste.
- `mgmt-carte.js` porte `mgmtDossiersCombattants` (T1), `mgmtDossiersAdversaires` (T2), `mgmtSelectable` et `mgmtBookMain` (porte unique de booking).
- `tests/mgmtDossiers.test.js` et `tests/mgmtCalendrier.test.js` couvrent déjà les sélections de données et la touche D sans booking; ajouter des tests d’intégration de l’état écran.
- Les planches validées sont `maquettes/monde/MondeDossiersCombattant.dc.html` et `maquettes/monde/MondeDossiersAdversaire.dc.html` (1920×1080). La première montre liste complète (L), Fiche (F), D’autres dossiers (D); la seconde ajoute Présentation du combat (P).

## Ce qui change

- `mgmt-carte-cadre.js` : compléter le mode dossiers depuis les piles déjà produites. Ajouter à `MGMT_CART` uniquement l’état éphémère nécessaire (étape, index courant, IDs déjà montrés par place/combattant); remettre cet état à zéro lorsque la place ou le combattant est abandonné, le booking confirmé, ou l’écran quitté. Pas de nouvelle fonction publique nécessaire; si une fonction privée de rendu/navigation est extraite, JSDoc :

```js
/** Rend le mode dossier courant de l’écran Carte à partir de l’état éphémère MGMT_CART.
 * N’écrit aucune donnée dans la partie et ne réserve aucun combattant.
 * @param {Object} m Partie en mémoire.
 * @returns {string} Fragment HTML de l’étape dossier courante.
 */
function mgmtCarteDossierHtml(m)
```

- `mgmt-carte-cadre.js` : étape 1 présente les dossiers de combattants de T1, raison en tête et navigation précédente/suivante; Entrée choisit le combattant et passe à l’étape 2 avec les adversaires T2. Étape 2 affiche la raison du dossier et le résumé « ce que serait ce combat » quand les données disponibles le permettent, sans inventer de texte auteur. Le bouton principal appelle le chemin existant `mgmtBookMain` (via l’action de confirmation existante), puis ferme le mode dossier.
- `mgmt-carte-cadre.js` : Échap à l’étape 1 revient à la liste normale; à l’étape 2 revient à l’étape 1/le choix du combattant. F ouvre la fiche du dossier courant. D demande une nouvelle pile en excluant les ID déjà montrés pour ce contexte; L bascule en liste complète et permet de revenir aux dossiers. P ouvre la présentation du combat seulement si la fonction du lot 3 est disponible et que sa paire correspond au dossier courant.
- `mgmt-carte-cadre.js` : souris et clavier couvrent les mêmes actions; clic sur les bords précédent/suivant et clic/glisser du dossier changent l’index. Pas de fenêtre superposée. Toutes les données joueur injectées dans HTML passent par `esc()`.
- `tests/mgmtDossiers.test.js` : ajouter les tests d’interaction ci-dessous. Modifier un test existant au besoin sans supprimer ses assertions T1/T2.
- Aucun changement attendu dans `index.html`, données textes, ni sauvegarde. Si un changement de script est nécessaire, maintenir l’ordre fragile des scripts et incrémenter sa version de cache selon la convention locale.

## Sauvegarde

Non. L’étape, l’index et les combattants déjà présentés sont temporaires à l’écran; rien n’est persisté dans la partie.

## Textes

Aucun texte auteur à demander. Reprendre les libellés d’interface exacts de la planche; ne pas reprendre ses noms, faits ou répliques d’exemple. Aucun nouveau texte narratif.

## Écran

Planche validée : `maquettes/monde/MondeDossiersCombattant.dc.html` et `maquettes/monde/MondeDossiersAdversaire.dc.html`.

## Tests

Fichier : `tests/mgmtDossiers.test.js`.

- `Monde lot 4 T4 — Entrée choisit le combattant du dossier courant puis affiche ses adversaires` : sur place libre seedée, Entrée passe exactement de l’étape 1 à l’étape 2 avec le combattant du dossier actif et une pile d’adversaires non vide; aucun combat n’est encore posé.
- `Monde lot 4 T4 — les flèches font défiler les dossiers sans changer la carte` : gauche/droite font circuler l’index dans les deux étapes; la carte et la liste des combats restent identiques.
- `Monde lot 4 T4 — Échap revient à la liste ou à l’étape précédente` : depuis l’étape 1, liste normale; depuis l’étape 2, étape 1 avec le combattant conservé; aucun booking.
- `Monde lot 4 T4 — confirmer un adversaire passe par mgmtBookMain et pose le combat choisi` : espionner la porte; exactement un appel avec les IDs du dossier actif, combat posé uniquement après Entrée/confirmation.
- `Monde lot 4 T4 — F ouvre la fiche du dossier courant` : la fiche ouverte porte l’ID courant, tant à l’étape combattant qu’adversaire.
- `Monde lot 4 T4 — D’autres dossiers ne répète aucun candidat déjà montré` : appels successifs dans le même contexte excluent les IDs montrés; si épuisement, la pile est vide et aucun ID ancien ne revient.
- `Monde lot 4 T4 — L bascule entre dossiers et liste complète sans perdre le choix` : aller-retour liste/dossiers conserve le combattant choisi et ne pose aucun combat.
- `Monde lot 4 T4 — les actions souris correspondent aux actions clavier` : clic bord gauche/droit et glisser modifient l’index comme ←/→; activation des contrôles déclenche la même action que la touche affichée.
- `Monde lot 4 T4 — la présentation du combat porte sur la paire active` : P ouvre la présentation lot 3 pour exactement le combattant et l’adversaire actifs, sans booking.
- `Monde lot 4 T4 — les noms joueurs injectés dans le rendu sont échappés` : utiliser un nom contenant `<`, `>`, `&`, guillemets; rendu sans balise injectée et valeur HTML échappée.
- `Monde lot 4 T4 — dossiers et liste laissent le même état après le même booking` : deux parties identiques, même paire sélectionnée par dossiers dans l’une et par liste dans l’autre; après confirmation, comparer les états de carte et les combattants engagés, qui doivent être identiques.
- `Monde lot 4 T4 — le mode dossiers ne change pas après rechargement du même état seedé` : ouvrir les dossiers deux fois sur le même état et la même graine; ordre des IDs et raisons strictement identiques.

Les tests traduisent aussi les critères du brief lot 4 (pile bookable de 4–6, état équivalent à la liste, non-répétition, même résultat au rechargement) au niveau de l’interface. T1/T2 restent couverts par leurs tests existants.

## Vérification

- `node --test tests/mgmtDossiers.test.js tests/mgmtCalendrier.test.js`
- Critère de fin : tous les tests nouveaux et existants ciblés passent; aucune confirmation implicite, aucun booking avant confirmation, navigation clavier/souris équivalente, 0 réapparition d’ID précédemment montré tant qu’une pile nouvelle est disponible.

## Hors périmètre

Ne pas modifier les règles de sélection T1/T2, le catalogue de raisons du lot 6, `mgmtBookMain`, la sauvegarde, les textes, le système de présentation du lot 3 ou le comportement des autres écrans. Ne pas faire T5 (mouvements souris supplémentaires au-delà des gestes prévus dans la planche), ni T6 (places des cartes suivantes/remplacements). Aucun second système de booking.

## Pièges

- `MGMT_CART.dossiers` existe déjà pour la pile T2 mais le rendu actuel ne l’affiche pas et `mgmtCarteProposer` ne déclenche pas lui-même `render()`; l’intégration doit actualiser l’écran sans booking ni déplacement accidentel de curseur.
- D est actuellement le déclencheur de la pile adversaire; dans l’étape combattant il signifie « d’autres dossiers » et doit appeler T1, dans l’étape adversaire T2. Les usages liste et navigation hors mode dossier restent inchangés.
- La sélection de première partie, le curseur de liste et `MGMT_CART.pick` sont des états distincts. Échap, changement de place/catégorie et abandon doivent éviter un dossier périmé ou un adversaire choisi pour un autre combattant.
- `mgmtBookMain` est l’unique porte qui valide effectivement les gardes. Les cartes/dossiers ne sont jamais des réservations; revalider à la confirmation et garder l’écran cohérent en cas d’échec.
- Le code du jeu utilise le scope global, pas de modules. Vérifier l’ordre des scripts dans `index.html` avant tout nouveau fichier; éviter d’en ajouter.
- Charte : toute action à la souris (S5), retour visible (S6), deux à quatre réponses (S3), aucune superposition; escaper les valeurs issues des combattants.

## Décisions et questions

- Décision technique : garder les IDs déjà montrés seulement dans l’état d’écran courant, séparément pour la place (combattants) et pour le combattant choisi (adversaires); réinitialiser quand le contexte change. Le brief exige l’absence de répétition pendant les nouvelles demandes, mais pas une persistance inter-session.
- Décision technique : la touche L ouvre la liste complète et conserve le dossier/contexte en mémoire; Esc depuis cette liste revient au dossier. C’est l’interprétation minimale de la bascule demandée dans la planche, sans perdre le choix.
- Décision technique : à épuisement, afficher la liste vide/état d’absence existant plutôt que recycler des dossiers, conformément à « sans repasser ceux déjà vus ».
- Décision technique : le mode dossiers est disponible uniquement quand une place principale est libre et l’agenda permet le booking; la liste ordinaire reste le recours pour tout autre état.
- Question pour Anthony : aucune.

## Compte rendu

- `mgmt-carte-cadre.js` : ajout du mode dossiers navigable (étape 1/2) à partir des piles T1/T2 et de `mgmtCarteDossierHtml`; clavier/souris équivalents (←/→, Entrée, Échap, F, D, L, P), échappement HTML.
- `mgmt-ecran-carte.js` / `mgmt-emplacements.js` : état éphémère étendu dans `MGMT_CART`.
- `index.html`, `sw.js` : montée de version de cache.
- `tests/mgmtDossiers.test.js` : ajout des tests T4 d’interaction (navigation, Échap, booking espionné, F/D/L/P, souris, échappement, équivalence, rechargement).
- Reprise : liaison de `mgmtDossierSwipe()` aux bords et clavier, sécurisation des IDs en attributs, affichage des raccourcis F et D, état vide existant, confirmation garantissant `mgmtBookMain`, restauration explicite du dossier à l’étape 1.
- Questions pour Anthony : aucune.
