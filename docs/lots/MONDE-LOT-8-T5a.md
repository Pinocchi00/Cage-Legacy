STOP

# Monde lot 8 T5a — cinq scénarios à suite

## Branche
`monde-lot-8-suite` (branche courante vérifiée). Prérequis : T1, T6, T4a et T4b présents ; T4c est reportée après le festival et n'est pas un prérequis de cette tranche.

## Objectif
Compléter les suites acceptées regroupées en T5a, sans inventer leurs déclencheurs ou conséquences qui ne sont pas spécifiés.

Fondement du brief, Lot 8 T5 : « Des suites. Un événement peut en appeler un autre quelques semaines plus tard. La fiche dit qu'il y a quelque chose à suivre. »

## Ce qui existe
- `mgmt-scenarios.js:2-16` : modèle existant des scénarios dérivés de l'état, demandes imposées et faits persistants ; ne persiste pas le scénario lui-même.
- `mgmt-scenarios.js:53-95` : `mgmtScenarios(m)` calcule les scénarios déterministes des seules parties neuves de Split ; RNG par `mgmtIdentiteStream`, jamais `Math.random()`.
- `mgmt-scenarios.js:107-112` : `mgmtScenariosImposes(m)` convertit les scénarios en demandes, et applique déjà l'exception de pause promise.
- `mgmt-scenarios.js:114-118` : `mgmtScenariosDe(m,f)` rend les étiquettes sur la fiche. Ce modèle porte les scénarios « à suivre » uniquement si leur état et leur durée sont dérivables sans ambiguïté.
- `docs/lots/MONDE-LOT-8-INVENTAIRE.md:192,207-219` : état d'avancement des scénarios T5a, notamment hanté et remplaçant partiellement couverts.
- `docs/lots/MONDE-LOT-8-DECISIONS.md:29-43` : périmètre accepté en dix scénarios, regroupés T5a/T5b ; la T5a contient cinq entrées.

## Ce qui change
À définir après réponses d'Anthony : les fonctions, fichiers et comportements. Ne pas modifier le code avant levée du STOP. Périmètre prévu selon les décisions : promesse, hanté, remplaçant de luxe, retour de retraite, double emploi qui choisit. Ne pas étendre à T5b/T5c.

## Sauvegarde
Indéterminée. Ne pas modifier `MGMT_SAVE_VERSION` avant de savoir si les nouvelles étapes sont dérivables ou doivent être persistées.

## Textes
Indéterminé. Après arbitrage, demander à `@ecrivain` les formulations nécessaires, en précisant le nombre, les familles, l'accord féminin, le fichier de données et la variable ; toutes `relu:false`. Ne rien inventer avant décision.

## Écran
Aucun écran neuf n'est prescrit. La fiche existante peut afficher « à suivre » (brief Lot 8 T5), mais si une nouvelle interaction/écran est demandée, STOP jusqu'à planche validée.

## Tests
À spécifier après arbitrage. Le critère général du brief (Lot 8, test 5) à convertir en assertion : pour chaque scénario retenu, une suite attendue arrive dans sa fenêtre de semaines, ou s'annule proprement si le combattant quitte l'effectif. Graines, déclencheurs, fenêtre et valeurs attendues ne sont pas définis pour les cinq entrées T5a ; ne pas fabriquer de seuils.

## Vérification
Commande ciblée à déterminer avec le périmètre et les tests ; ensuite `npm run check:rapide`. Critère de fin chiffré à fixer après arbitrage, avec zéro échec ciblé et rapide vert.

## Hors périmètre
T5b, T5c, N2/T4c (reportée), N9/lot 9, nouveaux événements T4 et toute modification de la marque, du budget T6, des visites T1 ou de la sauvegarde hors migration spécifiée après décision.

## Pièges
- Les scénarios existants sont dérivés et non stockés ; leur demande, elle, est un fait. Une suite qui doit survivre au changement d'état peut exiger une donnée sauvegardée.
- `mgmtScenarios` ignore les organisations extérieures et les retraités : ne pas élargir ce comportement sans décision.
- Le hanté (n°30) et le remplaçant (n°8) sont déjà partiellement couverts ; ne pas dupliquer ni changer leurs chemins avant d'avoir défini exactement le manque.
- Les demandes imposées passent par `mgmtScenariosImposes`; les conséquences de promesse/refus sont gérées ailleurs. Vérifier tous les appelants et tests avant de toucher cette mécanique.
- Le catalogue et les scénarios à suite ne sont pas des textes affichables tels quels ; toute formulation de ce brief doit être écrite par `@ecrivain` et marquée `relu:false`.

## Questions pour Anthony
1. Pour chacun des cinq scénarios T5a, quel déclencheur exact, quelle demande/choix du joueur, quelle échéance (en cycles), quelles issues et quelle conséquence persistante sont voulus ? En particulier, que désigne « la promesse » dans la liste T5a de `MONDE-LOT-8-DECISIONS.md` ?
2. Le scénario « hanté » doit-il ajouter seulement le choix « combat de reprise ou arrêt » après le KO, ou aussi une règle de durée/annulation ? Le n°30 a déjà son changement de voix.
3. Que couvre exactement « remplaçant de luxe » par rapport au remplacement de combattant déjà présent sur une carte incomplète ? Quand et comment le rôle est-il attribué/retiré ?
4. Pour le retour de retraite, quel âge maximal, quelles conditions de réintégration, et un retraité redevient-il bookable dans le roster ?
5. Pour le double emploi qui choisit, quel seuil/événement fait quitter le métier, et comment le doute après une défaite se manifeste-t-il ?
6. Ces scénarios concernent-ils Split seulement ou toutes les organisations ? Les mécanismes actuels sont limités à Split.
7. Quelles suites doivent être dérivables, et lesquelles doivent être conservées en sauvegarde pour survivre à un départ/rechargement ?
8. Quels textes exacts sont requis par famille et dans quelles situations s'accordent-ils au féminin ?
