# Monde lot 9 T3 — les quatre niveaux

Branche attendue : `monde-lot-9-monde` — branche courante : `monde-lot-9-monde`.

STOP — la puissance dépend du classement mondial de T5, qui n'existe pas encore, et le brief ne fixe pas si T3 attend T5 ni quelle valeur/API produit l'indicateur « puissance » avant T5.

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

## Questions pour Anthony

- T3 doit-elle attendre la T5 pour calculer les quatre niveaux, ou livrer d'abord popularité/stade/notoriété puis compléter puissance en T5 ? Cette décision bloque la tranche.
- Pour le « stade », quelle règle précise définit « sait remplir » : capacité ≤ plafond de remplissage (actuellement `mgmtPopPlafond(m.pop)`) ou tolérance différente ?
- Pour la notoriété, quel agrégat des « combattants les plus connus » veut-on (meilleur combattant seul, top N, moyenne, autre) ?
- La puissance est-elle le rang du meilleur combattant mondial de l'organisation, une combinaison de plusieurs rangs, ou autre règle ?
- Les quatre niveaux doivent-ils être recalculés à la lecture ou persistés dans la sauvegarde ?
