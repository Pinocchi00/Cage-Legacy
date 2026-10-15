# Monde lot 9 T3 — les quatre niveaux

Branche attendue : `monde-lot-9-monde` — branche courante : `monde-lot-9-monde`.


## Objectif

Donner aux huit organisations leurs quatre niveaux lisibles et fondés sur leur état réel.

Brief, § Lot 9, tranche T3 : « La popularité est ce que le public pense : elle existe. Le stade est la plus grande salle que l'organisation sait remplir : les salles existent. La notoriété se mesure à ses combattants les plus connus : le renom d'un combattant existe déjà dans le code, sans être affiché. La puissance se mesure à ses combattants les mieux placés au classement mondial de la T5. »

## Ce qui existe

- `mgmt-salles.js:12-27` : capacités, bornes de popularité et paramètres. `mgmtSallesInit(m)` (`:50`) initialise `m.salles`, `m.pop`, `m.comptes`. Les salles ont `{id,ville,nom,capacite}` (`:32-46`). `mgmtSalleDefaut(m)` (`:67`) choisit la salle conseillée selon le plafond de remplissage. À réutiliser pour « stade », sans confondre salle la plus grande et salle remplissable.
- `mgmt-monde.js:73-87` : `mgmtExteriorEffectifs(m,divId)` fournit les effectifs extérieurs vivants. `:90-101` `mgmtExteriorCombattant(m,id)` résout un combattant selon le mode de monde. Porte commune des lectures vivantes/historiques : à réutiliser pour une valeur commune aux organisations ; les huit parties sont la partie du joueur et `m.orgs` (T2, T2c).
- `mgmt-contrats.js:54-63` : `mgmtBourseSouhaitee` s'appuie sur `mgmtStar(f)` ; `:65+` montre les usages du renom. `mgmtStar` existe déjà comme mesure de renom. S'en servir comme donnée, ne pas exposer niveau caché ni attributs du moteur.
- `mgmt-organisations.js:99-112` : `mgmtOrgApercu(o)` expose la popularité et une capacité de salle dérivées du profil de création, non de la partie vivante. Ne pas reprendre ces valeurs statiques pour les niveaux en cours de partie.
- `tests/mgmtOrganisations.test.js` existe pour les règles et aperçus d'organisations. Ajouter les tests de T3 là sans remplacer ses assertions.

## Ce qui change

À préciser après réponse aux questions bloquantes : le brief ne détermine ni fonctions/fichiers d'API, ni formule de l'agrégat « les plus connus » (combien de combattants et quel agrégat), ni articulation temporelle avec T5. N'inventer aucune formule et ne créer aucune migration avant cette décision.

## Sauvegarde

À trancher après décision sur représentation/persistance. Les niveaux peuvent être dérivés ou stockés ; le brief ne tranche pas. Ne pas incrémenter `MGMT_SAVE_VERSION` par supposition.

## Textes

Aucun.

## Écran

Aucun : T3 est une tranche de données/calculs, aucun écran n'est demandé. T11 est l'écran organisation.

## Tests

Fichier à déterminer avec l'API après décision. Exigences traduites en assertions à couvrir :
- popularité lue de l'état courant de l'organisation, et changement de `m.pop` reflété ;
- stade égal à la plus grande salle dont la capacité est compatible avec la popularité / plafond qu'a défini Anthony ;
- notoriété déterminée par le renom des combattants de l'organisation, sans lire niveau caché ni attributs du moteur ;
- puissance égale à la règle retenue à partir du classement mondial T5 ;
- mêmes résultats pour la partie du joueur et chacune des sept organisations vivantes, déterministes à état identique.

Intitulés exacts impossibles à figer avant les signatures convenues. Aucun test ne doit figer un seuil/formule supposé.

## Vérification

Après levée du STOP : `node --test tests/mgmtOrganisations.test.js` (ou le fichier ciblé retenu avec les nouvelles assertions), puis `npm run check:rapide`. Mesure : aucune. Critère de fin chiffré : les quatre niveaux sont calculés pour les huit organisations et les tests ci-dessus passent ; formule de puissance alignée sur T5.

## Hors périmètre

Classement des organisations (T4), classement mondial lui-même (T5), staff (T6-T9), carrière (T10), écran (T11), changements de simulation de semaine/création (T2), nouveaux textes.

## Pièges

- `mgmtOrgApercu` est fondé sur le profil statique, pas l'état réel de la partie.
- `mgmtSalleDefaut` signifie salle conseillée ; ce n'est pas automatiquement le niveau « stade » défini par le brief.
- Les organisations extérieures sont des sous-parties `m.orgs[id]`, et les anciennes parties gardent `mondeVivant:false` et le monde dérivé. Employer les portes T2c sans modifier l'ancien chemin.
- Le renom (`mgmtStar`) est déjà lu dans les contrats ; ne pas le confondre avec un niveau affichable. Aucun `Math.random()`.
- Ne pas attribuer un rang mondial avant T5. Ordre des scripts fragile si un nouveau fichier est proposé.

## Questions (toutes tranchées par la DÉCISION ci-dessous)

- T3 doit-elle attendre la T5 pour calculer les quatre niveaux, ou livrer d'abord popularité/stade/notoriété puis compléter puissance en T5 ? Tranché ci-dessous.
- Pour le « stade », quelle règle précise définit « sait remplir » : capacité ≤ plafond de remplissage (actuellement `mgmtPopPlafond(m.pop)`) ou tolérance différente ?
- Pour la notoriété, quel agrégat des « combattants les plus connus » veut-on (meilleur combattant seul, top N, moyenne, autre) ?
- La puissance est-elle le rang du meilleur combattant mondial de l'organisation, une combinaison de plusieurs rangs, ou autre règle ?
- Les quatre niveaux doivent-ils être recalculés à la lecture ou persistés dans la sauvegarde ?

## DÉCISION du superviseur — 15/10/2026 18 h 45 (le STOP est levé ; aucune question pour Anthony)
1. **Ordre** : T3 n'attend pas T5. La puissance lit `mgmtDivisionRanking(m,div,'world')`, le classement mondial calculé qui existe déjà ; T5 en fera un vrai classement **sans changer cette API**, la puissance suivra d'elle-même.
2. **Popularité** : la valeur existante (`m.pop`, `mgmtOrgProfil(m).popularite` pour une sous-partie vivante).
3. **Stade** : la plus grande capacité parmi les salles où une des 12 dernières soirées de l'organisation a rempli à 80 % ou plus (`finance.taux` des soirées passées : utilise l'historique existant des soirées ; s'il n'en garde pas assez, la dernière soirée de chaque salle) ; à défaut, la plus petite salle de l'organisation.
4. **Notoriété** : la moyenne de `mgmtStar(f)` des 5 combattants non retirés les plus renommés de l'effectif (moins de 5 : la moyenne de ceux qui existent ; aucun : 0).
5. **Puissance** : pour chaque catégorie, chaque combattant de l'organisation classé dans le top 10 mondial rapporte `11 - rang` points ; la puissance est la somme.
6. **Lecture, pas de sauvegarde** : une fonction pure `mgmtOrgNiveaux(m,orgId)` → `{popularite,stade,notoriete,puissance}` (chiffres) et `mgmtOrgNiveauxRangs(m)` → pour chacune des huit organisations son rang (1 à 8) sur chaque niveau, égalités départagées par l'ordre de `MGMT_ORGANISATIONS`. Recalculé à la lecture ; aucun champ ajouté à la sauvegarde, aucune migration. Partie sans monde vivant (`m.mondeVivant!==true`) : seule l'organisation du joueur a des niveaux, les autres renvoient `null`.
7. Pas d'écran dans T3 (l'écran de l'organisation est T11).

## Compte rendu

- `mgmt-organisations.js` : ajout des calculs dérivés de niveaux et rangs.
- `mgmt-salles.js` : conservation du nom de salle dans l'historique.
- `index.html` : versions des fichiers JavaScript modifiés.
- `package.json` : test ajouté à `test` et `test:watch`.
- `tests/mgmtNiveauxOrg.test.js` : « Niveaux organisations — dérivés, déterministes et liés aux sources courantes ».
- Migration : aucune.
- Écarts : aucun ; les tests indépendants couvrent le stade, la notoriété, la puissance et les organisations vivantes.
- Questions pour Anthony : aucune.
Tests (`tests/mgmtNiveauxOrg.test.js`, ajouté à `test` et `test:watch` de `package.json`) : déterminisme à graine égale ; chaque niveau change quand sa source change (popularité, une salle remplie, un combattant plus renommé, un combattant qui entre dans le top 10 mondial) et pas les autres ; partie sans monde vivant. Tests ciblés seulement (délai 120 s), pas de `check:rapide`.

## Compte rendu — reprise

- `mgmt-organisations.js` : stade résolu avec l'historique disponible et puissance fondée sur le rang explicite, par organisation.
- `mgmt-salles.js` : identifiant stable de salle ajouté aux nouveaux comptes ; anciens comptes reliés par leur nom conservé.
- `tests/mgmtNiveauxOrg.test.js` : cas indépendants stade/notoriété/puissance et organisations vivantes ; intitulés inclus dans les tests.
- Migration : aucune ; aucun format de sauvegarde modifié. Écarts et questions pour Anthony : aucun.
