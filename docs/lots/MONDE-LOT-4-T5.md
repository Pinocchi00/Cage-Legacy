# Monde lot 4 T5 — La souris

## Branche

`monde-lot-4-dossiers` (branche attendue et courante).

## Objectif

Compléter le mode dossier pour que le défilement au clic et au glisser fournisse à la souris toutes les actions de navigation déjà disponibles au clavier.

Phrase fondatrice du brief : « Un clic sur le bord gauche ou droit fait défiler, un glisser aussi. Chaque geste du clavier existe à la souris. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, Lot 4, T5).

## Ce qui existe

- `mgmt-carte-cadre.js` porte le mode dossiers et ses interactions clavier/souris ajoutées en T4. Réutiliser la navigation précédente/suivante et le rendu existants, sans créer un second mode.
- `tests/mgmtDossiers.test.js` porte déjà `Monde lot 4 T4 — les actions souris correspondent aux actions clavier` (autour des lignes 312-322) : les boutons Précédent/Suivant appellent la navigation, mais le glisser du dossier n'est pas vérifié.
- `docs/lots/MONDE-LOT-4-T4.md` décrit l'état éphémère `MGMT_CART`, les modes et les gardes de booking; `docs/lots/MONDE-LOT-4-DECISIONS.md` fixe la branche et confirme que T3 (planche) est faite.

## Ce qui change

- `mgmt-carte-cadre.js` : compléter les interactions souris du mode dossiers. Un clic dans le bord gauche/droit du dossier actif déclenche exactement Précédent/Suivant; un glisser horizontal change le dossier au relâchement dans la direction du geste. Les gestes sont actifs aux étapes combattant et adversaire, avec index borné/enroulé selon le comportement clavier déjà présent. Les clics sur boutons/liens ne doivent pas déclencher en plus un défilement de bord; ignorer les gestes non horizontaux et les glissements commencés hors du dossier.
- Toute nouvelle fonction privée de geste porte ce JSDoc :

```js
/** Branche les gestes de souris du dossier sur la navigation existante.
 * N'altère que l'index éphémère du dossier et ne modifie pas la carte.
 * @param {HTMLElement} element Élément dossier rendu à l'écran.
 * @returns {void}
 */
function mgmtCarteDossierGestes(element)
```

- `tests/mgmtDossiers.test.js` : ajouter les assertions de clic de bord et glisser, sans enlever ni affaiblir les assertions T4. Mettre à jour `?v=`/cache de tout script modifié selon la convention existante; aucun nouveau script attendu.

## Sauvegarde

Non. Les événements et éventuel point de départ du glisser sont uniquement état d'interface éphémère.

## Textes

Aucun. Réutiliser les libellés présents sur la planche, sans créer de texte auteur.

## Écran

Planche validée : `maquettes/monde/MondeDossiersCombattant.html` et `maquettes/monde/MondeDossiersAdversaire.html`.

## Tests

Fichier : `tests/mgmtDossiers.test.js`.

- `Monde lot 4 T5 — un clic sur le bord gauche ou droit défile d’un dossier` : aux deux étapes du mode, chaque clic modifie l’index comme la touche directionnelle correspondante, sans modifier les combats de la carte.
- `Monde lot 4 T5 — un glisser horizontal défile d’un dossier dans le sens du geste` : glisser vers la gauche puis vers la droite change l’index comme les actions clavier correspondantes, dans les deux étapes, sans booking.
- `Monde lot 4 T5 — les clics sur les contrôles et les gestes verticaux ne déclenchent pas de défilement parasite` : cliquer sur un bouton d’action exécute une seule action; un mouvement vertical conserve l’index et l’état de la carte.
- `Monde lot 4 T5 — un geste commencé hors du dossier ne change pas le dossier` : simuler début/fin de glissement hors de l’élément; index inchangé.

## Vérification

- `node --test tests/mgmtDossiers.test.js`
- Critère de fin : les tests ciblés T5 et T4 passent; chaque direction de navigation souris correspond à un seul pas de l’index, 0 booking involontaire et 0 changement de la carte sur navigation.

## Hors périmètre

Ne pas modifier T1/T2 et leurs critères de sélection, le booking `mgmtBookMain`, les raisons, les textes, la sauvegarde, le système de présentation du lot 3, ni les autres écrans. Ne pas faire T6 (offrir les dossiers sur les cartes suivantes et remplacements). Pas de changement visuel ou de contenu de planche.

## Pièges

- Le clavier et les boutons T4 possèdent déjà la navigation : déléguer à ces mêmes actions plutôt que dupliquer la logique et risquer un index différent.
- Les dossiers ne réservent pas de combattants; seul le chemin de confirmation appelle `mgmtBookMain`. Un geste de navigation ne doit jamais booker ni déplacer la sélection de liste sous-jacente.
- Les clics sur les contrôles du dossier peuvent remonter par propagation; distinguer les contrôles interactifs du clic sur le bord pour éviter une double action.
- `index.html` a un ordre de scripts fragile. Ne pas ajouter de fichier sans nécessité; inspecter et incrémenter la version de cache de tout script touché.

## Décisions et questions

- Décision technique : le seuil de bord est un quart de la largeur utile de la carte de dossier de chaque côté; la zone centrale ne défile pas au clic. Le quart fournit des zones d'action manifestes sans capturer la majorité des contrôles centraux.
- Décision technique : le glisser déclenche au relâchement, une seule fois, lorsque le déplacement horizontal atteint au moins 24 px et dépasse le déplacement vertical. Ce seuil ignore les tremblements sans exiger un long geste.
- Décision technique : les déplacements par geste suivent l'enroulement de l'index existant pour conserver la même affordance que les flèches clavier.
- Question pour Anthony : aucune.
