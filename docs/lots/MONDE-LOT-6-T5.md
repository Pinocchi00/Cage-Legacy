# Monde lot 6 T5 — Les phrases

## 1. Branche
- Branche attendue : `monde-lot-6-raisons` (confirmée par T1 §13.1 et les fiches T2–T4).
- Branche courante : `monde-lot-6-raisons`.
- Dépendances : T1–T4 du lot 6 ; T4 a déjà livré une formulation par famille.

## 2. Objectif
Ajouter des formulations variées et accordées au féminin aux raisons affichées pour les combats proposés par Leïla.

Phrase fondatrice : « T5 — Les phrases. Trois formulations au moins par famille, accordées au féminin quand il le faut. Propositions de Claude Code, marquées `relu:false`. » (brief, lot 6, ligne 322).

## 3. Ce qui existe
- `mgmt-raisons.js:5-10` : `MGMT_RAISON_FAMILLES`, 15 identifiants livrés (14 familles du brief et le repli `meme-categorie-jamais-affrontes`; retour de blessure omis faute de fait vérifiable, voir T1 §compte rendu).
- `mgmt-raisons.js:14-32` : constante `MGMT_RAISON_PHRASES`, une entrée par famille, actuellement `{l1,l2,relu:false}` ; porte les formulations provisoires de T4. Les conserver comme première variante, pas les remplacer ni réécrire les faits qu'elles citent.
- `mgmt-raisons.js:34-51` : `mgmtRaisonLignes(m,raison)` rend les deux lignes échappées depuis la preuve persistée, sans relire les raisons ; toute évolution doit préserver ce contrat de rendu.
- `tests/mgmtRaisonAffichage.test.js:8-25` : tests T4 du rendu, de `relu:false`, de l'absence d'affichage pour cause nulle/origine joueur et du rendu Préliminaires sans erreur.
- `docs/lots/MONDE-LOT-6-T4.md:73-89` : compte rendu et décisions de supervision. La phrase passe-partout est supprimée ; origine joueur et raison nulle ne s'affichent pas. T4 affiche uniquement sur Préliminaires sur cette branche.
- Le compte rendu T4 indique que les formulations existantes sont provisoires et sans accords féminins ; T5 doit compléter la même constante.
- `@eclaireur` sollicité pour les fonctions/appelants/tests : refus `Subagent depth limit reached (1)`. Les passages décisifs ont été lus directement ; aucun résultat indépendant d'appelants supplémentaires.

## 4. Ce qui change
Fiche bloquée par la question Q1 (§12). Ne pas commencer le code avant sa réponse et la reprise de la fiche.
- `mgmt-raisons.js` : enrichir chaque entrée de `MGMT_RAISON_PHRASES` avec au moins deux formulations alternatives, soit au moins trois formulations au total par identifiant, et leurs formes féminines quand l'accord grammatical l'exige. Toutes les chaînes doivent rester `relu:false`.
- Conserver la forme de sortie de `mgmtRaisonLignes(m,raison)` : `{l1,l2}` ou `null`, HTML échappé ; préserver l'absence d'affichage pour origine joueur, preuve absente/inconnue, et les lignes fondées sur les champs de preuve enregistrés.
- **Contrat bloqué** : la sélection d'une formulation/variante et la source du genre ne sont pas définies par le brief ni les décisions T4. Ne pas ajouter de RNG, champ sauvegardé, heuristique de genre ou signature avant décision d'Anthony.
- `tests/mgmtRaisonAffichage.test.js` : compléter les tests de couverture du catalogue, des variantes, du féminin et du déterminisme après décision Q1. Ajouter une ancre T5 pour les nouveaux tests ; ne pas réécrire les ancres T4.
- Selon le contrat de sélection décidé : adapter uniquement les fonctions/tests nécessaires, leurs versions cache avec `node tools/_bump.js`, sans déplacer les scripts de `index.html`.

## 5. Sauvegarde
Non. Pas de champ persistant ni changement de `MGMT_SAVE_VERSION`, migration, validation ou format de la preuve. Les variantes sont des données statiques de présentation.

## 6. Textes
Commande à `@ecrivain` après levée du STOP : écrire **deux formulations alternatives par famille** (15 familles/identifiants, 30 variantes au minimum), en gardant comme première formulation chacune des entrées actuelles T4 ; fournir les formulations au féminin quand l'accord le nécessite. Textes informatifs, pas des répliques de Leïla ; chaque formulation doit rester fidèle aux champs disponibles dans le fait, sans inventer de chiffre, nom ou cause. Fichier de données : `mgmt-raisons.js`, constante `MGMT_RAISON_PHRASES` ; toutes les entrées `relu:false`. Ne pas introduire de contenu pour « retour de blessure », famille non livrée.

## 7. Écran
Aucun nouvel écran ni planche. T5 ne modifie pas la mise en page ; les lignes existantes restent celles du panneau Préliminaires selon T4. Toute modification visuelle est hors périmètre.

## 8. Tests
Fichier existant : `tests/mgmtRaisonAffichage.test.js`. Intitulés à ajouter après décision Q1 :
- `Monde lot 6 T5 — chaque famille possède trois formulations marquées relu:false` : parcourir exactement les 15 identifiants livrés, chacune dispose de trois formulations complètes au minimum et chaque formulation/entrée porte `relu:false`; zéro entrée pour la famille blessure omise.
- `Monde lot 6 T5 — les variantes respectent la preuve sans inventer de fait` : pour une preuve par famille, chaque formulation rendue conserve les valeurs/noms issus de la preuve ; vérifier notamment revanche et vrai vainqueur, longue attente avec 7 mois, et que les substitutions HTML restent échappées.
- `Monde lot 6 T5 — les accords féminins sont corrects` : combattantes des deux côtés, assertions sur les lignes obtenues pour les familles grammaticalement accordées ; fixture et choix de forme selon Q1.
- `Monde lot 6 T5 — le choix de formulation est déterministe` : assertion à fixer selon Q1 (même état/preuve et contexte identiques donnent la même variante ; graine identique si et seulement si une sélection seedée est décidée).
- Conserver sans modification les intitulés T4 : `Monde lot 6 T4 — mgmtRaisonLignes rend deux lignes depuis la preuve sans relecture`, `Monde lot 6 T4 — origine joueur et preuve absente ne produisent aucune ligne`, `Monde lot 6 T4 — les préliminaires omettent une raison nulle sans exception`.

## 9. Vérification
- Après levée du STOP : `node --test tests/mgmtRaisonAffichage.test.js tests/mgmtRaisonsSauvegarde.test.js` ; puis `npm run check:rapide` et `node tools/verif-versions.js`.
- Mesure : aucune.
- Critère de fin après décision : au moins 3 formulations × 15 identifiants ; tous marqués `relu:false` ; féminin testé ; 0 fait inventé, 0 texte passe-partout, 0 régression T4, 0 échec ciblé/rapide/version.

## 10. Hors périmètre
Sélection des familles/paires et leurs seuils (T1/T2), persistance/migration (T3), affichage et autres surfaces (T4), dossiers du lot 4 et présentation du combat du lot 3, ajout d'une famille, retour de blessure, nouvel écran, changement de sauvegarde ou de comportement de simulation.

## 11. Pièges
- `MGMT_RAISON_PHRASES` n'a actuellement que `{l1,l2,relu:false}` et `mgmtRaisonLignes` choisit directement cette formulation : ne pas décider seul du schéma de variantes ni de leur sélection.
- La preuve stockée ne contient pas nécessairement le genre. Ne pas déduire le féminin du prénom ou du nom ; identifier une source fiable dans l'état du jeu ou demander une décision.
- Plusieurs faits sont structurés différemment selon la famille ; une formulation ne doit pas citer un champ absent ni remplacer un fait manquant par une affirmation générique présentée comme preuve.
- `mgmtRaisonLignes` échappe les lignes à la fin via `esc()` ; toute interpolation joueur demeure non fiable.
- Les textes sont informatifs, pas une prise de parole de Leïla ; ne pas écrire de dialogue.
- Scripts globaux et ordre fragile : vérifier l'ordre réel dans `index.html`, ne déplacer aucun script. Aucun `Math.random()`.
- T3 a fixé les preuves persistées ; le rendu ne doit pas appeler `mgmtRaisonsPourPaire` pour réinventer une cause actuelle.

## 12. Questions pour Anthony
1. **Bloquante — source du féminin :** quel champ déjà fiable doit déterminer le genre des combattants pour accorder les formulations, et quelle règle appliquer aux preuves sans genre explicite ou aux paires mixtes ? Le brief demande l'accord mais n'indique ni donnée ni règle ; aucune inférence par prénom n'est acceptable.
2. **Bloquante — sélection des variantes :** comment choisir entre les trois formulations (cycle déterministe par carte, état/graine, ou autre) ? La sortie actuelle ne reçoit que `(m,raison)` et aucune fréquence ni portée de variété n'est spécifiée. Confirmer si le résultat doit rester pur/déterministe et si un nouvel argument est autorisé ; ne pas ajouter de champ à la sauvegarde par supposition.

## DÉCISION du superviseur — 15/10/2026 (les deux questions sont tranchées, aucune pour Anthony)
1. **Féminin** : une paire de combattants est toujours dans la même catégorie ; le genre se lit sur la catégorie (catégorie féminine = féminin), par la fonction d'accord déjà utilisée par le jeu (`mgmtAccord` ou son équivalent trouvé par grep, jamais une seconde règle). Une preuve sans combattant identifié prend la forme de la catégorie de la paire. Aucune paire mixte n'existe.
2. **Choix de la variante** : pur et déterministe, sans RNG de partie : l'index de la variante = un hachage simple et stable de (famille, identifiants triés des deux combattants) modulo le nombre de variantes. Un troisième argument OPTIONNEL `mgmtRaisonLignes(m,raison,paire)` est autorisé ; sans lui, la première variante (comportement de T4 inchangé, les tests de T4 restent verts).
3. Textes : trois formulations par famille (ligne 1 et ligne 2), écrites par toi, marquées `relu:false`, sans réplique ni personnage inventés ; elles citent le fait avec son chiffre ou son nom.

## Compte rendu

Reprise de T5 après relecture (6 écarts). Aucun sous-agent n'était joignable (« depth limit reached ») : textes écrits directement, vérification faite localement.

### Fichiers modifiés
- `mgmt-raisons.js` — `MGMT_RAISON_PHRASES` passe à trois formulations par famille (`variantes:[{l1,l2,relu:false},…]`, la première étant celle de T4, entrée `relu:false` conservée pour T4) ; `mgmtRaisonLignes(m,raison,paire)` accepte le troisième argument optionnel, choisit la variante par hachage stable (djb2, aucun RNG) de `famille|ids triés` modulo le nombre de variantes, applique `mgmtAccord` selon la catégorie de la paire (`divById`), et reste sur la première variante sans `paire`. Ancres `MONDE_LOT6_T5_RAISON_VARIANTES` et `MONDE_LOT6_T5_RAISON_SELECTION` ajoutées ; ancres T4 conservées.
- `mgmt-prelims.js:78` — l'appel d'affichage passe la paire `[fa,fb]` (écart 2 : sans troisième argument, la variante ne changeait jamais à l'écran).
- `index.html` — `?v=` de `mgmt-raisons.js` et `mgmt-prelims.js` montés par `node tools/_bump.js` (LF conservé).
- `tests/mgmtRaisonAffichage.test.js` — ancre `MONDE_LOT6_T5_TEST_VARIANTES` et quatre tests T5 ; les trois tests T4 sont inchangés.
- `sw.js` — changement de fins de ligne non lié, retiré (`git checkout sw.js`).

### Tests ajoutés
- `Monde lot 6 T5 — chaque famille possède trois formulations marquées relu:false`
- `Monde lot 6 T5 — les variantes respectent la preuve sans inventer de fait`
- `Monde lot 6 T5 — les accords féminins sont corrects`
- `Monde lot 6 T5 — le choix de formulation est déterministe`

### Sauvegarde
Aucune : pas de champ persistant, `MGMT_SAVE_VERSION`, migration ou validation touchés.

### Écarts à la fiche
- L'appel `mgmt-prelims.js:78` transmet la paire ; la fiche (§7) ne listait pas ce fichier, mais la décision du superviseur (§2) autorise le troisième argument, et sans lui ni variante ni accord n'apparaissaient à l'écran.
- `node tools/verif-versions.js origin/main` signale un écart **pré-existant** : `mgmt-bureau.js` modifié sur la branche (commit T3 `77d2c36`) sans montée de `?v=` (identique à origin/main). Hors périmètre T5, non corrigé ici.
- `sw.js` : seule une réécriture de fins de ligne était présente, restaurée.

### Questions pour Anthony
- L'écart de version `mgmt-bureau.js` (T3) doit-il être corrigé dans une tranche dédiée (montée `?v=`) ? Il est antérieur à T5.
