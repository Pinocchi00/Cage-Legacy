# LOT 1 — Sauvegardes et intégrité des registres

Base : `0fdef05`, après fusion du lot 0 (PR #59). Référence du plan : `cd224ce7ea1acaa95f0ec106c01be3bf9876b63e`. Branche : `lot-1-sauvegardes-registres`.

## Corrections

- **B02** : restauration de la principale sans rotation du secours ; une sauvegarde normale ne recopie plus une principale corrompue. Si la réécriture échoue, la carrière récupérée reste en mémoire et le secours reste intact. Deux copies illisibles ne remplacent plus une partie en mémoire.
- **B03** : parsing, validation et migration sur un candidat isolé ; `validateState(state=G)` garde la compatibilité des appels existants. Si le premier rendu échoue, l'état, le thème et les éléments de l'écran précédent sont restaurés. L'import n'écrit qu'après ce rendu réussi.
- **B04** : version strictement égale à `SAVE_VERSION`, finitude des nombres imbriqués, compteurs entiers entre 0 et `Number.MAX_SAFE_INTEGER`, âge entre 0 et 100, organisation dans le catalogue. Les champs numériques attendus refusent les chaînes. Les âges fractionnaires et les attributs supérieurs à 100 restent autorisés conformément au moteur ; aucune conversion ni modification d'équilibrage.
- **B05** : schémas de lecture pour Panthéon, statistiques, succès et codex. Les entrées invalides sont exclues de la vue ; les autres restent consultables. Une archive endommagée est conservée intégralement dans sa clé et toute réécriture est refusée après relecture. Une alerte explique le problème. Aucun stockage de migration ou de quarantaine ajouté.
- **R01** : `saveHOF()` retourne un booléen et vérifie la relecture. L'intronisation prépare un clone, vérifie l'entrée complète, puis seulement scelle la retraite. Quota, écriture ignorée, exclusion par le plafond existant et disparition d'archive empêchent la purge. Les tentatives répétées préservent le récap et évitent les doublons d'archives/statistiques.

Aucun coefficient ni comportement du moteur de combat modifié. L'ordre des scripts, les dépendances runtime et les ancres existantes sont conservés.

## Preuves de non-régression

`tests/lot1Integrity.test.js` ajoute **20 tests** et est inclus dans `npm test` et `npm run test:watch`.

- Sur `cd224ce` : **19 échecs, 1 réussite**, code de sortie 1.
- Sur la base après lot 0, après `git stash` des corrections : **19 échecs, 1 réussite**, code de sortie 1. Corrections rétablies avec `git stash pop` sans conflit.
- Après corrections : **20 réussites, aucun échec**.
- L'import valide constitue le contrôle positif déjà réussi avant correction. Chaque identifiant B02, B03, B04, B05 et R01 possède des cas en échec avant correction.

Couverture : récupération et échec de réécriture, double corruption, imports rejetés/valides et exceptions, valeurs non finies et compteurs impossibles, `{}`/`null`/JSON cassé dans chacun des quatre registres, archives mixtes, quota, écritures ignorées, reprise après interruption, plafond du Panthéon et vérification avant purge.

Le test existant de `tests/saveSystem.test.js` qui acceptait une version 2 est mis à jour vers `SAVE_VERSION` : cette ancienne attente contredisait le refus des versions antérieures décidé au lot 0 et appliqué au validateur dans B04. Aucun test supprimé ni ignoré.

## Vérification navigateur

Recette automatisée sur le vrai jeu dans **Microsoft Edge 152.0.4191.66**, fenêtre mobile **390 × 844**, contexte de stockage isolé :

- principale corrompue + secours sain, puis deux copies corrompues : données préservées ;
- import invalide puis valide via le contrôleur et les boîtes de dialogue natives ;
- `{}` et `null` dans chacun des quatre registres : écrans utilisables et originaux conservés après tentative d'écriture ;
- stockage réellement rempli jusqu'à `QuotaExceededError` (4 716 tentatives d'ajout de blocs de 1 Kio) : carrière inchangée, retraite non scellée ;
- libération des seules données de remplissage du test, nouvelle intronisation réussie, clic réel sur « Retour au menu » : carrière purgée et légende conservée ;
- **aucune erreur JavaScript de page** ; capture de l'écran de retraite examinée.

L'outil navigateur est installé uniquement dans le dossier de travail extérieur au dépôt. Aucun navigateur personnel ni donnée réelle de joueur n'a été utilisé pour remplir le stockage.

## Observations et limites

- La copie locale `D:\Cage-Legacy` était antérieure au plan ; elle n'a pas été modifiée. Le travail part de la dernière branche `main` distante, après fusion du lot 0.
- `CL.importSave()` existe mais aucun bouton du jeu ne l'appelle actuellement. Son exposition dans l'interface n'a pas été ajoutée : elle ne figure pas au lot 1. Les tests navigateur invoquent ce contrôleur et ses vraies boîtes de dialogue.
- Le plafond existant de 20 légendes peut exclure une nouvelle entrée au score inférieur. Sa règle de classement n'est pas changée : le joueur est averti et conserve la carrière pour libérer une place puis réessayer.
- Une archive corrompue reste protégée en lecture seule ; aucun écran de réparation ou de récupération manuelle n'est créé dans ce lot.
- Les statistiques et le codex disposent désormais d'écritures contrôlées avec avertissement. Ils ne forment pas une transaction multi-clés avec le Panthéon : ce dernier reste la condition nécessaire avant de sceller ou purger la carrière.
- Les autres lots et les décisions de conception en annexe restent hors périmètre. Aucune question de conception bloquante rencontrée.

## Validation finale

`npm ci --ignore-scripts` : installation verrouillée réussie, aucune vulnérabilité signalée.

`npm run check` : ESLint réussi ; **165 tests réussis, 0 échec, 0 test ignoré**, durée 88,1 s. `git diff --check` réussi. La sortie intégrale de la vérification est jointe en fin de description de la PR.
