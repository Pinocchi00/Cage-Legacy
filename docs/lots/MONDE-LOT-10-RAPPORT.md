# Monde lot 10 — rapport de fin de lot (la refonte des trois écrans)

Branche `monde-lot-10-ecrans`. Contrat : `docs/lots/MONDE-LOT-10-DECISIONS.md` et les planches de `maquettes/monde/refonte/` (validées par Anthony le 14/10/2026). Aucune règle de simulation touchée ; `MGMT_SAVE_VERSION` inchangée.

## Livré

- **T1 — le chargement des six ans** (`mgmt-nouvelle.js`, `ui-cadre.css`) : la barre ne reconstruit plus l'écran à chaque soirée (mise à jour de la barre, de l'année, des compteurs et du dernier fait seulement) ; compteurs réels, « Blessures » à la place de « Retraites » (décision §1) ; bouton « Entrer dans {org} » à la fin seulement, jamais d'entrée automatique ; état d'erreur. Tests : `tests/mgmtNouvelleChargement.test.js` (10).
- **T2 — « Votre arrivée »** (`mgmt-prise-en-main.js`) : états `premiere` et `sans-passe` ; l'arrivée porte l'héritage (prédécesseur, six ans en chiffres, champions, promesses, contrats). Entrée mène à la Carte, Échap à l'Accueil ; l'Accueil retire son seul bloc « héritage » (décision §2). Promesses datées « au plus tard : {Organisation} Fight Night 63 » ; mois en minuscules (§4). Ligne « sa fille » retirée (§3). Tests : `tests/mgmtArrivee.test.js` (10).
- **T3 — Résultats** (`mgmt-suivi-cadre.js`) : états `joueur`, `passe`, `blessure`, `contrat`, `premier-jour`, `vide`. Tests : `tests/mgmtResultatsRefonte.test.js` (14), dont « aucun texte sous 22 px ».
- Tests existants alignés sur les décisions : `mgmtAccueil`, `mgmtArchive`, `mgmtFidelite`, `mgmtLisibilite`, `mgmtPasseT6`, `mgmtSauvegarde14`, `mgmtSuivi`, et `mgmtPriseEnMain` (T1 : après l'arrivée, l'écran est `mgmt_carte`, décision §2 ; la partie reprise ouvre toujours l'Accueil).

## Écarts connus à la planche

- **T3, combat nul** : le résultat nul n'a pas de variante de planche ; il est rendu avec la mise en forme des autres résultats.
- **T3, « Avant ton arrivée »** : affiché quand le prédécesseur est inconnu, faute de nom à citer.
- **T3, compteur de soirées listées** : calculé sur les soirées réellement listées, pas sur le total de l'archive.
- **T3, « Ce que ça change »** : section masquée quand elle est vide.
- **T3, « N soirées plus récentes »** : ligne ajoutée pour les soirées au-delà de celles affichées.
- `mgmtAccueilHeritage()` (`mgmt-accueil.js`) n'est plus appelée depuis le retrait du bloc d'héritage de l'Accueil ; elle est **laissée en place** (additif par défaut).
- Textes fixes d'interface ajoutés, tous marqués `relu:false` (copiés du LISEZ-MOI des planches).

## Notes de suivi

- **Aucune retraite en six ans** (le plus vieux a 36 ans, seuil d'âge de 39 à 42) : à examiner par Anthony (décision §1).
- « Sa fille » sous Leïla : aucune donnée, ligne retirée, rien d'inventé.

## Vérification

`npm run check` complet : résultat consigné dans le message de fusion du superviseur. Vérification visuelle dans le jeu réel, aux trois largeurs, laissée au superviseur.
