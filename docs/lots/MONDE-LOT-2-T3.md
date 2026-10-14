# Monde lot 2 T3 — La main du prédécesseur

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites`, conforme).

## Objectif

Rendre les quatre choix de travail inscrits dans l'identité de chaque organisation effectifs dans la politique de simulation de son prédécesseur, sans en faire des règles pour le joueur.

Brief : « **T3 — La main du prédécesseur.** Quatre réglages du joueur automatique par organisation : à quelle fréquence il met un titre en jeu, s'il fait monter les jeunes ou protège les anciens, s'il recrute des noms, s'il laisse filer les contrats. » Le brief précise : « Ce réglage porte sur le prédécesseur, jamais sur le joueur : ce n'est pas une règle maison. »

## Ce qui existe

- `mgmt-organisations-identites-data.js:18-20` documente déjà `main` et son vocabulaire : `titres` (`souvent|normal|rarement`), `jeunes` (`fait-monter|equilibre|protege-anciens`), `noms` (`souvent|parfois|jamais`), `contrats` (`garde|normal|laisse-filer`). Les huit objets portent ces valeurs (`:35`, `:53`, `:71`, `:89`, `:107`, `:125`, `:143`, `:161`).
- `mgmt-predecesseur.js:10-13` porte `mgmtPredecesseurReglages()`, qui rend actuellement `{titreCadence:2}` neuf à chaque appel. Son commentaire réserve expressément les autres réglages par organisation à cette T3.
- `mgmt-predecesseur.js:139-173` porte `mgmtPredecesseurSoiree(m,k,reglages,mesure)` et consomme `cfg` via `Object.assign(mgmtPredecesseurReglages(),reglages||{})`. Le booking passe par `mgmtPredecesseurBooker` (`:58-97`), avec cadence de titre `cfg.titreCadence` (`:59`, `:94-95`); renouvellement anticipé des contrats (`:148-150`); éventuelles options existantes `renouvelle`, `recrues`, `demandes` (`:151-158`).
- `mgmt-predecesseur.js:20-47` porte déjà les auxiliaires opt-in de renouvellement des sans-contrat et de recrutement de jeunes (`mgmtPredecesseurResigne`, `mgmtPredecesseurRecrute`). Ne pas recopier ces mécaniques.
- `mgmt-organisations.js` porte `mgmtOrgIdentite(id)` et les résolutions organisation par nom/id (T1/T2). `mgmt-bureau.js` crée les parties avec `m.org` comme nom (`mgmtDefault`, T4 indique ligne 86). Les données d'identité sont chargées avant les fonctions d'organisations.
- `tools/mesure-management.js` utilise la main automatique portée en T1 lot 1; la vérification d'identité/différence outil-jeu est spécifiée par `docs/lots/MONDE-LOT-1-T2.md`. `tests/helpers/jouerSoirees.js` est un autre joueur de test, distinct, et n'est pas la porte de l'automatique historique.

## Ce qui change

À définir après réponse d'Anthony : la traduction des valeurs catégorielles en réglages numériques/structurés et leurs effets précis. Ne pas implémenter sur la base d'une interprétation personnelle.

Fichiers prévisibles, à confirmer au déblocage :
- `mgmt-predecesseur.js` : faire évoluer `mgmtPredecesseurReglages` pour résoudre la politique de l'organisation et la traduire en options consommées par la simulation. JSDoc/signature à spécifier après arbitrage ; signature actuelle `function mgmtPredecesseurReglages()`.
- `tests/mgmtPredecesseurOrganisations.test.js` (nouveau, nom provisoire) : tests déterministes des quatre politiques, et non-régression du joueur automatique historique.
- `package.json` : inclure le test nouveau dans `test` et `test:watch`, en respectant les ajouts déjà présents.
- Si la source d'organisation ne peut être résolue sans toucher le jeu : documenter l'obstacle et demander un complément plutôt que d'ajouter un champ sauvegardé.

## Sauvegarde

Non prévu : aucun état joueur nouveau. `MGMT_SAVE_VERSION` ne doit pas changer sans preuve qu'une donnée persistée est nécessaire et décision explicite.

## Textes

Aucun. Les quatre choix sont des données de réglage, pas des textes à produire par `@ecrivain`.

## Écran

Aucun.

## Tests

À arrêter avec Anthony avant d'écrire des assertions : les catégories de données sont énumérées, mais le brief ne donne ni leur traduction exacte en comportement/valeurs, ni le protocole quantitatif permettant de prouver les effets. Au minimum devront être spécifiés : les huit configurations produites, un test déterministe sur graine, et la non-régression du comportement par défaut utilisé par l'outil de mesure.

## Vérification

Bloquée jusqu'à clarification des réglages et de leurs critères mesurables. Après clarification : `node --test tests/mgmtPredecesseurOrganisations.test.js`, puis les tests ciblés existants de l'outil de mesure et du prédécesseur. Mesure/critère chiffré à convenir avec Anthony ; aucune valeur ne peut être inventée.

## Hors périmètre

- Le comportement du joueur humain ; le brief réserve explicitement ces choix au prédécesseur.
- Génération du passé et passage de témoin (lot 1), évolution complète des huit organisations (lot 9), identité textuelle, écrans, nationalités (T2), attribution des profils (T4).
- Modifier `tests/helpers/jouerSoirees.js`, les graines figées ou les catalogues de combattants sans instruction dédiée.

## Pièges

- `mgmtPredecesseurReglages()` est aussi le défaut historique de l'outil de mesure. Ne pas changer ce défaut globalement : distinguer politique explicite d'une organisation et mode historique, et conserver la comparaison d'outillage du lot 1 T2.
- `mgmtPredecesseurSoiree` fusionne les réglages fournis sur les défauts. Un changement de noms de champs/options a plusieurs consommateurs possibles, notamment `mgmtPredecesseurCarteHeritee` (`mgmt-predecesseur.js:105-113`) et le moteur de passé (`mgmt-passe.js`).
- La propriété `m.org` est un nom, alors que `mgmtOrgIdentite` attend un identifiant. Réutiliser les portes `mgmtOrgNom`/`mgmtOrgParNom`, pas d'accès direct par `m.org` comme id.
- Les commentaires des identités disent que la T3 lit `main`; l'ancre T1 et les données ont déjà été ajoutées. Ne pas réécrire ni modifier les textes `relu:false`.
- La politique « recrute des noms » ne désigne pas clairement s'il s'agit de vedettes déjà présentes ou de recrutement externe : ne pas confondre avec le recrutement de jeunes déjà porté par `mgmtPredecesseurRecrute`.

## Questions pour Anthony

1. Quelle correspondance exacte entre chaque valeur (`souvent/normal/rarement`, etc.) et les réglages exécutables ? Pour les titres, quelles fréquences/cadences ? Pour « fait-monter » et « protège-anciens », quels critères d'âge et de booking ?
2. « Recrute des noms » signifie-t-il recruter des combattants connus depuis le vivier, et comment définir « connu »/« souvent »/« parfois » ? Est-ce distinct de l'arrivée ciblée de jeunes déjà implémentée ?
3. « Laisse filer les contrats » : quelle différence concrète entre `garde`, `normal` et `laisse-filer` concernant renouvellement anticipé et ressignature des combattants sans contrat ?
4. Pour les parties ordinaires, où et quand la politique organisationnelle doit-elle être fournie à `mgmtPredecesseurSoiree` ? La comparaison automatique historique de l'outil doit-elle conserver strictement ses valeurs actuelles ?
5. Quels seuils/graines et quelles valeurs attendues valident séparément les quatre effets, sans test statistique instable ?

## Compte rendu

Fiche préparatoire arrêtée avant implémentation : les choix catégoriels existent dans les données, mais leur traduction comportementale n'est pas déterminée par le brief.

## DÉCISION du superviseur — 14/10/2026 15 h 50 (réponses aux cinq questions ; Anthony laisse le technique à Claude)
Le STOP de tête est périmé : TOUT ce qui suit est tranché, écris le code. Ne pose aucune question.
**Principe** : un réglage « normal / equilibre / parfois-garde-historique » reproduit EXACTEMENT le comportement actuel. Les autres valeurs le déplacent d'un cran, jamais d'une règle d'exclusion ; tout reste déterministe (pas de `Math.random`).
1. **titres** → `titreCadence` (une mise en titre toutes les N soirées où un couple champion–challenger valide existe ; lis `:59` et `:94-95` pour confirmer le sens) : `souvent` = 1, `normal` = 2 (= défaut historique), `rarement` = 4.
2. **jeunes** : `equilibre` = historique. `fait-monter` : dans le choix des combattants de la carte principale, à égalité de score le PLUS JEUNE passe avant ; `protege-anciens` : à égalité de score le PLUS ÂGÉ passe avant. Un seul critère de départage, jamais une exclusion ; lis `mgmtPredecesseurBooker` pour trouver où se tranchent les égalités et ne change aucun score.
3. **noms** : `jamais` = historique. `souvent` : à chaque soirée où l'effectif a une place libre, il recrute le combattant libre de plus haut renom (réutilise la mesure de renom déjà dans le code, `grep -n "renom" mgmt-*.js`) ; `parfois` : une soirée sur deux (soirée de rang pair). C'est distinct du recrutement de jeunes de `mgmtPredecesseurRecrute` : ajoute un critère `renom` à cette même fonction plutôt qu'un second mécanisme.
4. **contrats** : `normal` = historique. `garde` : renouvelle un contrat dès qu'il lui reste 2 combats (au lieu du seuil actuel) et re-signe les sans-contrat à chaque soirée ; `laisse-filer` : ne renouvelle pas en anticipé et ne re-signe pas les sans-contrat, SAUF le champion en titre (on ne laisse pas filer la ceinture).
5. **Où** : `mgmtPredecesseurReglages(orgId)` accepte un identifiant d'organisation OPTIONNEL. Sans argument il rend l'objet historique INCHANGÉ (c'est le défaut de l'outil de mesure : ne le change pas). Avec un `orgId` il lit `mgmtOrgIdentite(orgId).main` et traduit selon les règles 1 à 4. `mgmtPredecesseurCarteHeritee` et le moteur de passé (`mgmt-passe.js`) passent l'identifiant de l'organisation de la partie (résous le nom `m.org` par `mgmtOrgParNom`). Aucune donnée sauvegardée, `MGMT_SAVE_VERSION` inchangée.
6. **Tests** (déterministes, sans statistique) dans `tests/mgmtPredecesseurOrganisations.test.js` : (a) `mgmtPredecesseurReglages()` sans argument est strictement égal à l'historique ; (b) les huit organisations produisent des réglages conformes à la table 1-4 (test de table) ; (c) à graine fixe que tu choisis ET que tu documentes dans le test, sur 8 soirées de prédécesseur : `titres:souvent` met strictement plus de titres en jeu que `rarement` ; `contrats:laisse-filer` renouvelle moins que `garde` ; `jeunes:fait-monter` a un âge moyen de carte principale ≤ à `protege-anciens` ; `noms:souvent` a un renom moyen de recrues ≥ à `jamais`. Si une graine ne départage pas, prends-en une autre : jamais d'assertion floue.
7. Ajoute le test à `package.json` (`test` et `test:watch`), monte les `?v=` (`node tools/_bump.js`), `node tools/verif-versions.js origin/main`, `npm run check:rapide`, commit `Monde lot 2 T3 : ...`.

## REPRISE du superviseur — 14/10/2026 17 h 10
Le code est ÉCRIT sur le disque (non commité) : `mgmt-predecesseur.js`, `mgmt-passe.js`, `tests/mgmtPredecesseurOrganisations.test.js` (non suivi). NE le réécris PAS : termine-le. Trois des neuf tests du fichier sont rouges :
1. « sans identifiant, mgmtPredecesseurReglages rend l'historique inchangé : {titreCadence:2}, neuf à chaque appel » ;
2. « les huit organisations produisent les réglages de la table (titres, jeunes, noms, contrats) » ;
3. « laisse-filer : personne n'est renouvelé, sauf le champion en titre » : le champion en titre est renouvelé malgré « laisse-filer » (attendu : `true` pour l'exception, lis ce que le test mesure exactement).
Pour chacun : lis d'abord ce que le test fabrique et ce que `mgmtPredecesseurReglages(orgId)` rend ; corrige le CODE si la règle de la DÉCISION n'est pas respectée, corrige le TEST seulement si son montage est faux (cite la DÉCISION dans le commit). Puis `node tools/_bump.js` pour chaque .js modifié, `node tools/verif-versions.js origin/main`, `npm run check:rapide` vert, commit `Monde lot 2 T3 : la main du prédécesseur` (sans `inachevé`). Tu ne dois PAS toucher à T2 : elle est déjà commitée (`09c6436`).
