# Monde lot 6 T4 — L'affichage de la raison


## 1. Branche
- Branche attendue : `monde-lot-6-raisons` (branche désignée par T1 et confirmée dans les comptes rendus T1–T3).
- Branche courante : `monde-lot-6-raisons`.
- Dépendances : T1–T3 du lot 6 ; les lots 3 et 4 fournissent les deux surfaces d'affichage prévues.

## 2. Objectif
Afficher la preuve réellement enregistrée pour chaque combat proposé par Leïla sur les Préliminaires, en tête des dossiers et dans la présentation du combat, sur deux lignes d'information.

Phrase fondatrice : « T4 — L'affichage sur les Préliminaires, en tête des dossiers du lot 4 et dans la présentation du combat. Les deux lignes tiennent dans le panneau actuel. » (brief, lot 6, ligne 321).

## 3. Ce qui existe
- `mgmt-prelims.js:42-53`, `mgmtPrelimsRaisons(m,fa,fb)` : ancien dérivé des résultats et du classement ; ne donne pas la cause choisie et contient encore la phrase passe-partout. À remplacer pour les propositions enregistrées, jamais à utiliser comme reconstitution d'une ancienne cause.
- `mgmt-prelims.js:61-89`, `scr_mgmt_prelims()` : surface existante des Préliminaires ; la zone `pourquoi` est conditionnée à proposition à valider (`:78-79`). Elle doit lire `f.raison` du combat, pas recalculer une preuve.
- `mgmt-carte.js:291`, `:328`, `:356`, `:368-371` : raisons conservées sur la proposition, l'échange et le remplacement manuel. `origine` distingue `leila` et `joueur`.
- `mgmt-bureau.js:607` : la raison est copiée avec le combat posé sur la carte.
- `mgmt-save.js` : `raison:null` est licite pour les anciennes piles ; `origine:'joueur'` peut aussi avoir une raison nulle. Ne rien inventer ni recalculer au rendu.
- T1 compte rendu : les preuves disponibles sont `{famille,fait}` pour 14 familles du brief plus le repli `meme-categorie-jamais-affrontes`. Le retour de blessure est omis car l'archive ne prouve pas la guérison.
- Les planches validées le 10/10 sont présentes : `maquettes/monde/MondePresentationCombat.dc.html`, `MondeDossiersCombattant.dc.html`, `MondeDossiersAdversaire.dc.html`. La planche de présentation du combat relève du lot 3 T4 ; les deux dossiers, du lot 4 T3.
- Les recherches `@eclaireur` ont été tentées mais le sous-agent a refusé (`Subagent depth limit reached (1)`). Les appels/tests précis des surfaces dossier et présentation n'ont donc pas pu être établis par lui ; ils sont à relever avant de coder.

## 4. Ce qui change
À préciser après résolution de Q1 (ci-dessous), sans créer de format de sauvegarde.
- `mgmt-prelims.js` : remplacer l'affichage dérivé de `mgmtPrelimsRaisons` par le rendu de la cause enregistrée ; conserver les actions, le panneau et la structure générale de l'écran.
- Dossier lot 4 : afficher la cause attachée au candidat, en tête du dossier ; ne pas déduire une nouvelle cause de l'état courant.
- Présentation du combat lot 3 : afficher la cause enregistrée quand le combat a été proposé par Leïla. Respecter la distinction d'origine joueur et l'absence explicite de cause.
- Toute nouvelle fonction de rendu devra avoir JSDoc indiquant les paramètres (preuve, origine et contexte d'affichage) et le retour HTML échappé ; signature à fixer après inspection des interfaces réellement livrées par les lots 3/4.
- Ne modifier aucun champ de sauvegarde ni aucun lecteur de preuve. Ne pas appeler `mgmtRaisonsPourPaire` pour reconstituer la cause.

## 5. Sauvegarde
Non. Version inchangée (T3 a introduit la version 17 sur cette branche). Aucune migration, validation ni donnée persistée à modifier.

## 6. Textes
À clarifier avec Q1. Les formulations par famille et variantes sont prévues en T5, donc aucune commande à `@ecrivain` avant que soit tranchée la dépendance d'ordre. Le codeur n'invente aucune phrase.

## 7. Écran
Planches validées : `maquettes/monde/MondePresentationCombat.dc.html`, `maquettes/monde/MondeDossiersCombattant.dc.html`, `maquettes/monde/MondeDossiersAdversaire.dc.html`. Respecter les positions/tailles de ces planches et la charte d'interface. Ne pas refaire ces écrans.

## 8. Tests
À compléter après inspection des tests et interfaces lots 3/4. Assertions minimales imposées par le brief :
- Préliminaires : une proposition Leïla montre la raison persistée et son fait, sans appeler le lecteur de raisons ; la phrase « Deux combattants libres de la même catégorie » est absente du dépôt.
- Dossiers : la cause de chaque combattant/adversaire apparaît en tête du dossier et correspond à la preuve conservée ; aucune famille n'est substituée.
- Présentation du combat : même cause conservée, pas de reconstitution au rendu ; la cause est affichée comme information et non comme réplique.
- Cas féminin : raison et formulations affichées correctement accordées pour un préliminaire féminin, vérifiables sur un combat de deux combattantes.
- Pile historique avec `raison:null` : affichage sans exception, sans texte de raison fabriqué.
- Remplacement par le joueur : ne pas attribuer au choix du joueur la cause d'origine Leïla ; couvrir `origine:'joueur'` avec raison et avec `null`.
- Vérifier les deux lignes visibles dans les trois surfaces concernées et la conservation des gestes existants.

## 9. Vérification
- Commande ciblée : à inscrire après identification des fichiers de tests réellement concernés par les lots 3 et 4 ; au minimum `node --test tests/mgmtPrelims.test.js tests/mgmtRaisonsSauvegarde.test.js`.
- Puis `npm run check:rapide` et `node tools/verif-versions.js`.
- Mesure : aucune.
- Critère de fin : 0 phrase passe-partout dans le dépôt, 0 preuve recalculée au rendu, 0 exception pour les causes absentes, accord féminin vérifié, deux lignes présentes sur les 3 surfaces, 0 échec ciblé/rapide/version.

## 10. Hors périmètre
T5 (écriture des formulations/variantes), nouvelle famille de preuve ou seuil T1, sélection et variété T2, persistance/migration T3, mécanisme de booking des dossiers, refonte graphique, changement de sauvegarde, archive et simulation.

## 11. Pièges
- Raison absente (`null`) est un état historique explicite : ne jamais la remplacer par une raison calculée « actuelle ».
- Un combat `origine:'joueur'` n'est pas une proposition de Leïla, même si une preuve a été enregistrée pour aider le joueur.
- L'ancien renderer utilise `mgmtCarteNote` et choisit un fallback. Le supprimer sans conserver l'affichage de la preuve persistée ferait perdre la vraie cause.
- `esc()` obligatoire pour tout fait ou nom injecté dans HTML.
- Scripts globaux, ordre fragile dans `index.html` ; ne pas supposer l'ordre, ni déplacer de scripts. Aucun `Math.random()`.
- T3 a introduit `MGMT_SAVE_VERSION=17` localement ; ne pas toucher aux migrations ou versions.

## 12. Questions pour Anthony
1. **Bloquante — ordre T4/T5 :** T4 doit-il afficher dès maintenant des formulations lisibles alors que le brief place l'écriture des phrases et variantes en T5 ? Faut-il attendre T5, ou livrer T4 avec un rendu provisoire fondé uniquement sur les champs structurés `fait` (sans phrase inventée), puis le remplacer/compléter en T5 ?
2. Pour `origine:'joueur'` avec une preuve, faut-il afficher cette preuve dans les trois surfaces ou seulement signaler la raison des combats proposés par Leïla ? T3 distingue explicitement ces origines, mais T4 ne précise pas leur rendu.
3. Confirme-t-on que, pour `raison:null`, les zones de raison sont entièrement omises dans les Préliminaires, dossiers et présentation (T3 dit « réservé à l'affichage de T4, qui n'affiche alors rien ») ?

## Compte rendu
Fiche en attente : le codeur ne démarre pas tant que la question bloquante 1 n'est pas tranchée et que les tests/appelants des interfaces lot 3/4 ne sont pas repérés.

## DÉCISION du superviseur — 15/10/2026 (les trois questions sont tranchées ; aucune question pour Anthony)
1. **Ordre T4/T5** : T4 livre l'affichage avec UNE formulation par famille, écrite par toi d'après la colonne « Le fait cité » du brief (lot 6, tableau des quinze familles) : ligne 1 = le fait avec son chiffre ou son nom (lu dans les champs structurés de la raison, jamais inventé), ligne 2 = ce que le combat peut changer, sobre. Constante `MGMT_RAISON_PHRASES` (une entrée par famille, `relu:false`). T5 ajoutera ensuite deux variantes par famille et les accords au féminin dans cette même constante. Une seule fonction pure `mgmtRaisonLignes(m,raison)` rend `{l1,l2}` ou `null` : elle sera réutilisée par les dossiers du lot 4 (qui n'existent pas encore dans cette branche : n'affiche donc que sur les Préliminaires et dans la présentation du combat).
2. **`origine:'joueur'`** : rien n'est affiché. La raison est celle de Leïla ; un combat posé par le joueur n'en porte pas à l'écran.
3. **`raison:null`** (piles anciennes) : les zones sont entièrement omises, sans erreur.
Les deux lignes tiennent dans le panneau actuel, aucun texte sous 22 px, `esc()` sur tout. Pas de sous-agent : textes écrits par toi, vérification par `node tools/verif-versions.js origin/main` et `npm run check:rapide`. Ne fusionne jamais `main`.
