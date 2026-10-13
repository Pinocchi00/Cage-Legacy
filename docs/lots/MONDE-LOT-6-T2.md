# Monde lot 6 T2 — La raison d'abord

## 1. Branche
`monde-lot-6-raisons` (courante et attendue, confirmée par T1 §13.1).
Le plan ne donne pas de nom explicite pour ce lot ; cette confirmation fait référence.
Dépendances : lot 1 fusionné (`d12bd9e`), T1 livrée et reprise (`8467100`).

## 2. Objectif
Construire une proposition neuve en choisissant une famille justifiée avant sa paire, sans répéter de famille dans le bloc.
Fondement : « T2 — La raison d'abord. `mgmtPickBulkPair` (`mgmt-carte.js`) reçoit la famille à servir. Ses règles de variété actuelles sont conservées : paire inédite, prénoms uniques, pas plus de deux combats de suite dans la même catégorie. »

## 3. Ce qui existe
- `mgmt-raisons.js:5-10,21-31,38-96` : `MGMT_RAISON_FAMILLES`, `mgmtRaisonsPourPaire(m,fa,fb)`, lecteur interne `mgmtRaisonsLire(m,fs)`. Porte ces conditions et preuves ; ne change aucun seuil de T1.
- Retour T1 : `{famille,fait}`, ids canoniques, indices dans `m.hist`/`m.facts`. Quinze identifiants : quatorze familles originales et `meme-categorie-jamais-affrontes`. Retour de blessure omis faute de date prouvable (compte rendu T1:138-151).
- `mgmt-carte.js:114-191` : `mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed)`. Porte sa collecte : disponibilité, champions exclus, engagements/réservations, genre, homonymes, repos, revanche immédiate, variété, rangs, coût des écrasements, inactivité et tirage seedé.
- `mgmt-carte.js:209-239` : `mgmtNewBulkAffair`, bloc complet ou `null`, après carte principale complète. Appelants : `mgmt-bureau.js:460`, `mgmtOfferBulk` à `mgmt-carte.js:721` (strict puis assoupli).
- Autre appel au picker : `mgmtSwapFight`, `mgmt-carte.js:264`. Plusieurs tests `mgmtCard.test.js` appellent directement l'ancienne signature.
- `mgmt-bureau.js:593-599` : la validation recopie les ids dans la carte sans conserver de métadonnée. Ne pas modifier en T2.
- Porte le harnais `newGameWindow` de `tests/mgmtRaisons.test.js:3-12` ; porte ses fixtures et vérifications de sources à `:14-29,45-62`.
- Régressions : `tests/mgmtCard.test.js:682-767` (rangs, repos, revanche immédiate, inactivité), `tests/mgmtPrelims.test.js:8-10,21-40` (booking et échange).
- Organisations : `mgmtDefault(orgRef)` (`mgmt-bureau.js:90`), `MGMT_ORGANISATIONS`, tests `mgmtOrganisations.test.js:12-20` ; scripts carte `index.html:1120`, raisons `:1135`, prédécesseur `:1139`.
- `@eclaireur` sollicité : refus « Subagent depth limit reached (1) ». Repérage et passages décisifs lus directement, sans modification de code.

## 4. Ce qui change
**`mgmt-raisons.js`** : ajouter une lecture groupée, pour éviter une copie JSON de toute la partie par paire et par famille.
`mgmtRaisonsIndex(m,paires)`
JSDoc : `/** Lit les preuves d'un ensemble de paires sans effet de bord. @param {Object} m Partie. @param {Array<Array<Object>>} paires Couples de combattants. @returns {Map<string,Array<Object>>} Clés ids triés joints par |, preuves {famille,fait}. */`
Copier la partie une fois ; pour chaque couple, reprendre la préparation canonique de T1 et appeler `mgmtRaisonsLire` sur cet état local. Restaurer `MGMT_ROLES_MEMO` dans `finally`. Résultats identiques au lecteur unitaire, dont la signature reste inchangée. Aucun cache durable, RNG ou mutation du jeu.

**`mgmt-carte.js`** : ancre neuve `MONDE_LOT6_T2_SELECTION`, conserver les ancres existantes.
- Étendre le picker par deux arguments finaux optionnels :
  `mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed,famille,raisonsIndex)`.
  JSDoc ajouté : `@param {string} [famille] Famille obligatoire pour ce tirage. @param {Map<string,Array<Object>>} [raisonsIndex] Preuves locales précalculées. @returns {Object|null} Paire existante, avec raison {famille,fait} seulement si une famille est demandée.`
- Sans `famille` : comportement et ordre des tirages strictement inchangés ; pas de lecture de raisons. Cette voie sert les anciens tests et l'échange jusqu'à T3.
- Avec `famille` : filtrer les candidates sur une preuve de cette famille AVANT préférence clean/sloppy, priorité d'inactivité et `pick`. Famille inconnue ou aucune paire justifiée : `null`, jamais une autre famille silencieuse. Si l'index manque, en construire un local pour cet appel.
- La valeur `raison` rendue est la preuve exacte du filtre, pas une raison recalculée après le tirage. Garder `a,b,sloppy,warned,div`.
- Ajouter `mgmtBulkSelection(m,used,seen,n,stats,relaxed)`.
  JSDoc : `/** Choisit les familles puis leurs paires pour un bloc neuf. @param {Object} m Partie. @param {Set<string>} used Prénoms à exclure. @param {Set<string>} seen Paires à exclure. @param {number} n Nombre de combats. @param {Object} stats Écrasements. @param {boolean} relaxed Assouplissement existant. @returns {Array<Object>|null} n résultats du picker avec raison, ou null ; ensembles fournis inchangés en cas d'échec. */`
- Construire l'index une fois par sélection, sur les couples distincts du roster aptes selon les exclusions individuelles du picker, même genre et prénoms différents. Mémoriser chaque couple une fois, même s'il est examiné pour plusieurs familles.
- À chaque place, parcourir `MGMT_RAISON_FAMILLES` dans son ordre, en sautant les familles déjà servies ; appeler le picker filtré, retenir le premier succès. Une famille sans candidate reste disponible pour la place suivante. Aucun tirage de famille, aucune recherche rétroactive.
- Travailler sur copies de `used`/`seen`. Après succès : ajouter les deux prénoms et la paire ; mettre à jour `lastDiv/run`, et marquer la famille. Si une place échoue, rendre `null` sans publier un bloc partiel. Après succès complet, reporter les ensembles aux appelants.
- `mgmtNewBulkAffair` remplace sa boucle de choix par cette sélection pour les `n` préliminaires manquants ; sérialise exactement les anciens champs des combats, SANS `raison`. Conserver gardes, titre, id et ordre de proposition. Les preuves restent dans le résultat local de sélection, disponibles pour T3.
- Préliminaires déjà posés : T2 garantit la diversité du nouveau bloc seulement. L'unicité entre bloc et combats déjà posés, la mémoire après validation/chargement, l'échange et le remplacement manuel relèvent de T3 ; ne pas reconstituer une cause historique après coup.

**`tests/mgmtRaisonsSelection.test.js`** : nouveau fichier, tests ci-dessous ; **`package.json`** : l'inscrire dans `test` et `test:watch`, sans enlever de test.
**`index.html`, `sw.js`** : seules versions des deux scripts modifiés et du cache, via `node tools/_bump.js mgmt-raisons.js mgmt-carte.js` ; ne pas déplacer les scripts.

## 5. Sauvegarde
Non. `MGMT_SAVE_VERSION` inchangée ; aucun champ ajouté à `m`, `G`, la pile ou la carte, aucune migration/validation modifiée. Les objets `{famille,fait}` de sélection ne sont pas sauvegardés. T3 enregistre et transmet la vraie cause.

## 6. Textes
Aucun. Pas de commande à `@ecrivain` ; garder les formulations actuelles jusqu'à T4/T5.

## 7. Écran
Aucun. Ne toucher ni HTML de rendu, ni CSS, ni clavier. La sélection de paires est de la logique ; pas de nouvelle présentation visible à spécifier ici.

## 8. Tests
Fichier : `tests/mgmtRaisonsSelection.test.js`. Intitulés exacts et assertions :
- `Monde lot 6 T2 — la famille demandée précède le choix de paire` : graine 20261008, fixture T1 avec trois combattants, une seule paire en revanche et une paire plus inactive sans revanche ; famille `revanche` rend uniquement la première avec sa preuve. Famille inconnue et revanche sans archive rendent `null`.
- `Monde lot 6 T2 — la revanche choisie cite le vrai vainqueur` : fixture, cycle 20, trace décisive au cycle 18 ; indice 0, cycle 18, gagnant/perdant conformes à `winner`. Inverser A/B et tester `winner:'B'` ; un nul ne justifie pas cette famille. Couvre le test de source du brief pour la sélection.
- `Monde lot 6 T2 — vingt graines et huit organisations ne répètent aucune famille` : graines 20261001 à 20261020 incluses, les 8 ids du catalogue, 0 soirée simulée. Pour chacun : `mgmtDefault(id)`, `mgmtNewRoster`, `mgmtExteriorEnsure`, carte principale remplie par le geste de `mgmtPrelims.test.js:8-10` sans modifier les règles ; appeler la sélection avec ensembles frais et le nombre prévu de préliminaires. Exiger 160 blocs non nuls, tous complets, et autant de familles distinctes que de combats. Vérifier chaque preuve par `mgmtRaisonsPourPaire`. Ne pas ignorer un shortfall pour faire passer le test.
- `Monde lot 6 T2 — le bloc strict conserve paires prénoms et catégories variés` : mêmes 160 blocs ; zéro paire répétée, zéro prénom répété, zéro série de 3 divisions identiques, aucun engagé/champion/réservé/suspendu, aucune revanche immédiate. Compter explicitement les violations : toutes à 0.
- `Monde lot 6 T2 — une proposition neuve utilise la sélection sans changer son format` : graine 7, carte principale complète, `mgmtNewBulkAffair` ; espion délégant sur la sélection, exactement 1 appel. Nombre de combats égal aux places manquantes ; aucun champ `raison` dans le JSON de l'affaire.
- `Monde lot 6 T2 — le manque de familles ne produit pas de bloc partiel` : graine 9, deux combattants d'une catégorie, demander 2 combats en strict ; résultat `null`, ensembles initiaux inchangés, aucun id/affaire/card ajouté. Ne pas exiger le retour arrière de la RNG.
- `Monde lot 6 T2 — la lecture groupée égale les lectures unitaires et reste pure` : fixtures positives de T1, une paire par famille livrée ; JSON des preuves identique, `m`, `G`, `SEED` et mémo des rôles inchangés ; inversion des ids identique. Instrumenter le lecteur groupé : une construction d'index par bloc, pas une par famille.
- `Monde lot 6 T2 — une même graine donne les mêmes familles paires et tirages` : deux fenêtres fraîches, graine 20261008, même fixture et sélection de 4 places ; résultats et `SEED` final identiques. Aucun `Math.random` dans le code ajouté.
Répartition du reste du brief : diversité persistée/après échange T3 ; suppression de la phrase passe-partout et féminin T4/T5 ; pile ancienne chargeable T3 et affichable T4. Ne pas les annoncer livrés ici.

## 9. Vérification
- `node --test tests/mgmtRaisonsSelection.test.js tests/mgmtRaisons.test.js tests/mgmtCard.test.js tests/mgmtPrelims.test.js`, puis `npm run check:rapide` et `node tools/verif-versions.js`.
- Pas de mesure longue ni de génération de six ans. Le contrôle structurel de coût est l'index local unique par sélection ; ne pas lancer Monte Carlo.
- Fin : 160/160 blocs complets, 0 doublon de famille et 0 violation stricte, 15 identifiants T1 inchangés, 0 preuve fausse, 0 échec ciblé/rapide/version, `git diff --check` vert.

## 10. Hors périmètre
T3 (persistance, migrations, anciennes piles, échanges et raccord aux préliminaires déjà validés), T4/T5 (écrans et phrases), dossiers lot 4, archive, règles de carrière, classements, probabilités d'écrasement, recrutement, monde extérieur. Ne pas modifier les anciens tests pour assouplir leurs assertions. Exclure du commit `mgmt-retraits-data.js` et `mgmt-voix-data.js`, déjà modifiés avant cette fiche.

## 11. Pièges
- Sans famille, les tests du picker attendent les anciens tirages ; ajouter des tirages ou filtrer cette voie les casse.
- Le mode assoupli existant relâche prénoms, repos et catégories successives ; conserver cette exception, mais jamais répéter une famille du bloc. Les assertions de variété de cette tranche portent sur le mode strict.
- Une paire `seen` est canonique `ids.sort().join('|')` ; `used` contient des prénoms, pas des ids. La sécurité du picker et l'exclusion d'engagement restent obligatoires.
- `mgmtRaisonsPourPaire` clone toute la partie ; ne pas l'appeler dans chaque boucle famille × paire. Aucun index réutilisé après mutation d'état.
- Raisons chargé après carte : ne lire le catalogue qu'au runtime, jamais dans une constante évaluée au chargement de carte. Le harnais lit l'ordre réel d'`index.html`.
- La preuve originale n'est pas conservée par la validation actuelle ; le rendu reste ancien en T2. Ne pas présenter une preuve recalculée comme cause sauvegardée.

## 12. Décisions et questions
- Ordre fixe du catalogue T1 comme priorité : défaut le plus simple, déterministe, sans nouveau contenu d'auteur ni pondération cachée.
- Si toutes les familles disponibles échouent : `null` et filet shortfall existant, jamais raison inventée ou famille répétée. Le repli T1 exige réellement une paire jamais affrontée ; ne pas l'étendre à toute paire.
- Compatibilité : arguments finaux optionnels et ancienne voie intacte ; la génération neuve utilise la nouvelle voie dès T2, les gestes qui nécessitent la mémoire de la cause attendent T3.
- Pas de backtracking ni nouveau cache global : limite le changement au sélectionneur actuel ; les 160 blocs complets sont la preuve de suffisance sur la population de début retenue.
- Questions pour Anthony : aucune. L'omission du retour de blessure autorisée et documentée en T1 demeure ; aucune décision d'auteur supplémentaire demandée.

## Compte rendu

### État : inachevé — arrêt sur contradiction du critère de fin

Le 13/10/2026, sur la branche attendue `monde-lot-6-raisons`. Le code de sélection et les huit tests ont été écrits, mais T2 **n'est pas livrée** : le critère 160/160 blocs complets est incompatible avec au moins une population de début prévue par la fiche. Aucun seuil de T1, règle de booking, roster ou ancien test n'a été changé pour masquer cet échec.

### Fichiers modifiés et rôle

- `mgmt-raisons.js` : `mgmtRaisonsIndex`, copie unique de la partie, préparation canonique et restauration du mémo des rôles dans `finally`. Les lectures publiques coûteuses sont mémorisées seulement dans l'appel groupé, sur l'état local identique ; une paire apportant des combattants différents du roster reçoit des lectures séparées. Aucun cache durable ni tirage.
- `mgmt-carte.js` : arguments optionnels du picker et filtrage par preuve ; collecte des couples admissibles ; sélection dans l'ordre des familles, sans répétition, sur copies des ensembles ; publication seulement après bloc complet ; raccord de `mgmtNewBulkAffair` sans sérialiser `raison`.
- `tests/mgmtRaisonsSelection.test.js` : les huit tests exigés, sources, pureté, déterminisme, manque de familles et population de 160 départs sans soirée simulée.
- `package.json` : ajout du nouveau fichier à `test` et `test:watch`, aucun ancien test retiré.
- `index.html`, `sw.js` : versions seulement, via `node tools/_bump.js mgmt-raisons.js mgmt-carte.js` ; ordre des scripts inchangé.
- Cette fiche : compte rendu et question bloquante.
- `mgmt-retraits-data.js` et `mgmt-voix-data.js` restent exclus : modifications antérieures, sans différence de contenu dans le diff courant.

### Tests ajoutés (intitulés exacts)

- `Monde lot 6 T2 — la famille demandée précède le choix de paire`
- `Monde lot 6 T2 — la revanche choisie cite le vrai vainqueur`
- `Monde lot 6 T2 — vingt graines et huit organisations ne répètent aucune famille`
- `Monde lot 6 T2 — le bloc strict conserve paires prénoms et catégories variés`
- `Monde lot 6 T2 — une proposition neuve utilise la sélection sans changer son format`
- `Monde lot 6 T2 — le manque de familles ne produit pas de bloc partiel`
- `Monde lot 6 T2 — la lecture groupée égale les lectures unitaires et reste pure`
- `Monde lot 6 T2 — une même graine donne les mêmes familles paires et tirages`

### Vérifications et essais

- Nouveau fichier : **7 tests verts, 1 rouge**, exécution entière terminée en environ 956 secondes. Le test des 160 départs n'ignore aucun shortfall. Les violations strictes comptées sur les blocs effectivement rendus sont toutes à zéro ; cela ne prouve pas 160 blocs complets.
- `node --test tests/mgmtRaisons.test.js tests/mgmtCard.test.js tests/mgmtPrelims.test.js` : **79/79 verts**. Les quinze familles de T1 et les anciens tirages du picker sans famille restent couverts.
- `@eclaireur`, `@verif`, `@relecteur` : appels refusés, `Subagent depth limit reached (1)`. Repérage direct limité aux passages de la fiche ; aucun verdict indépendant de relecture disponible.
- Repli demandé : `node tools/verif-versions.js` **vert**, puis `npm run check:rapide` **rouge : 983/984 tests verts**, seul échec : le test des 160 départs ci-dessus. Seule la fin des sorties du repli a été affichée/lue. Pas de check complet ni Monte Carlo.
- `git diff --check` : **vert** avant le compte rendu ; revérifié avant commit.
- Essais de coût : deux premières exécutions interrompues par délai (120 et 600 secondes) ; partage local des lectures publiques ajouté sans changer leurs conditions ; exécution entière ensuite menée à terme. Le nouveau contrôle reste lent.
- Diagnostic isolé du contre-exemple : même graine, même organisation, même geste de booking, puis index de **tous** les couples aptes (disponibilité, champions, engagements, réservations, genre et homonymes). Pas d'assouplissement, pas de recherche rétroactive, pas de modification de population.

### Contre-exemple et questions pour Anthony

Graine **20261001**, id **`fighting-pacific-championship`**, 0 soirée simulée, `mgmtDefault(id)` → `mgmtNewRoster` → `mgmtExteriorEnsure` → booking porté de `mgmtPrelims.test.js:8-10` : carte principale complète **5/5**, **7** préliminaires demandés, roster de **359** combattants.

L'index complet du roster admissible ne contient que **six** familles (nombre de couples justifiés) :

- `classement-voisin` : 640 ;
- `styles-opposes` : 1172 ;
- `derby` : 6454 ;
- `debuts` : 31198 ;
- `veteran` : 26796 ;
- `meme-categorie-jamais-affrontes` : 4647.

Toutes les autres familles sont absentes, même avant les exclusions progressives de prénoms/paires/divisions. La sélection trouve six combats puis rend `null` au septième, conformément au §12. Sept familles distinctes sont donc impossibles ici, indépendamment d'un changement de graine de tirage ou d'un backtracking.

**Question bloquante : quelle exigence faut-il réviser pour cette population (sept préliminaires, diversité sans répétition, ou hypothèse de suffisance des populations de début) ?** Une décision explicite et une fiche reprise sont nécessaires ; aucune alternative n'a été choisie par le codeur.

### Sauvegarde et écarts

Aucune migration : `MGMT_SAVE_VERSION`, validation et format des affaires/cartes inchangés. Aucun texte, écran ou changement T3/T4/T5 livré. Écart principal : le critère de fin n'est pas atteint et le check rapide reste rouge. Le partage des lectures à l'intérieur du lecteur groupé est local uniquement, pour éviter de recalculer les classements et rôles par paire ; les preuves restent produites par `mgmtRaisonsLire` et comparées aux lectures unitaires. Commit de l'état **inachevé**, pas une livraison validée ; pas de push.

## DÉCISION du 13/10/2026 (Claude) sur le contre-exemple « sept familles impossibles »
Le contre-exemple est une partie créée SANS passé (0 soirée, `mgmtDefault`) : elle n'a ni série, ni retour de blessure, ni revanche possibles, donc six familles seulement. Ce n'est pas le cas du jeu réel (six ans d'histoire, lot 1). **Règle retenue : la variété est maximale mais jamais bloquante.**
1. Toutes les familles distinctes TANT QUE possible sur la carte ; quand les familles disponibles sont épuisées, la sélection autorise de REPRENDRE la famille de repli `meme-categorie-jamais-affrontes` (puis, à défaut, la famille la moins utilisée), mais jamais deux fois de suite et jamais pour un couple déjà choisi. Plus aucun `null` quand un couple apte existe.
2. Les règles de variété existantes sont conservées (paire inédite, prénoms uniques, au plus deux combats de suite dans la même catégorie).
3. Tests : (a) sur une partie AVEC passé (`mgmtPasseGenerer` à graine fixe, test lent éventuel) : sept raisons toutes de familles différentes ; (b) sur une partie SANS passé (graine 20261001, fighting-pacific-championship) : sept préliminaires obtenus, au moins six familles distinctes, au plus un doublon, jamais deux de suite.
4. L'exigence « jamais la même deux fois sur une carte » du brief reste l'objectif ; elle est garantie dès que l'histoire fournit assez de familles. C'est un compromis de supervision, à signaler à Anthony au bilan.
Aucune question ouverte : fais le commit « Monde lot 6 T2 : la raison d'abord » (sans « inachevé »).
