# Monde lot 9 T4 — le classement des organisations

STOP — le brief ne tranche pas la règle de classement. Ne pas coder avant réponse d’Anthony.

## Branche

`monde-lot-9-monde` — branche courante : `monde-lot-9-monde`.

## Objectif

Classer les huit organisations dans un classement unique, lisible d’abord par le rang.

Phrase fondatrice (brief, lot 9, T4) : « Le classement des organisations. Un seul classement des huit, lu d'abord par le rang. Il ferme QO-11. »

## Ce qui existe

- `mgmt-organisations.js:52-77` porte `mgmtOrgNiveaux(m,orgId)` : valeurs dérivées `{popularite,stade,notoriete,puissance}`, sans persistance.
- `mgmt-organisations.js:79-88` porte `mgmtOrgNiveauxRangs(m)` : classe actuellement les huit organisations séparément pour chacun des quatre niveaux, ordre décroissant, égalités départagées par `MGMT_ORGANISATIONS`, organisation absente = `null`.
- La T3 a créé le contrat existant et ses tests, `tests/mgmtNiveauxOrg.test.js`. Ne pas dupliquer le calcul des niveaux ni altérer la T3.
- `docs/QUESTIONS-OUVERTES.md:331` documente QO-11, classement des organisations rivales de Split.

## Ce qui change

À déterminer après réponse : fichiers, API de classement global et tests ne peuvent être spécifiés sans inventer comment les quatre rangs de niveau se combinent en un seul rang. Ne pas supposer que le rang d’un niveau particulier est prioritaire, ni inventer une somme/pondération.

## Sauvegarde

Non, sous réserve de la décision attendue : le classement actuel de T3 est dérivé à la lecture. Ne pas ajouter de champs ni incrémenter `MGMT_SAVE_VERSION` sans nécessité spécifiée.

## Textes

Aucun.

## Écran

Aucun. T4 est un classement de données ; l’écran organisation relève de T11, et aucune planche d’écran T4 n’est demandée.

## Tests

Fichier et intitulés à fixer après décision sur l’API et la règle unique. Le test du brief devra vérifier par assertions que le rang change quand la valeur source retenue change, et qu’il ne change jamais sans cause retraçable. Les huit organisations et les égalités doivent avoir un résultat déterministe. Le brief n’indique ni métrique à classer en premier ni formule pour arbitrer les quatre niveaux : aucun attendu chiffré ne peut être honnêtement fixé avant réponse.

## Vérification

Après réponse : commande de test ciblée à choisir selon les fichiers et tests retenus, puis `npm run check:rapide`. Aucun outil de mesure demandé. Critère final selon décision : les huit organisations ont un rang unique et déterministe, et le test de changement/non-changement fondé sur cette règle passe.

## Hors périmètre

Les quatre niveaux de T3 et leurs formules ; le classement mondial des combattants T5 ; tout écran d’organisation T11 ; staff et carrière T6-T10 ; sauvegarde et simulation des soirées.

## Pièges

- `mgmtOrgNiveauxRangs` existe déjà, mais produit quatre classements distincts, pas le classement unique demandé par T4. Le réutiliser sans le confondre avec le résultat attendu.
- Les niveaux sont dérivés et peuvent être `null` pour les organisations absentes d’une partie sans monde vivant (`mondeVivant!==true`).
- La puissance dépend du classement mondial lu par `mgmtDivisionRanking`; ne pas recréer un calcul de puissance.
- Ne pas ajouter un second état sauvegardé pour un résultat déjà dérivé. L’ordre de chargement des scripts est fragile si un nouveau fichier est proposé.

## Questions pour Anthony

- Quelle règle produit le rang unique : un niveau prioritaire (lequel), une combinaison des rangs des quatre niveaux, ou une autre règle ? Comment départager les égalités de cette règle ?
- Pour une partie sans monde vivant, le classement doit-il porter uniquement sur l’organisation du joueur, comme le permet T3, ou conserver les huit organisations simulées/évaluées ?
