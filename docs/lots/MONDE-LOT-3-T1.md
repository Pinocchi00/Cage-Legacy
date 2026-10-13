> **Le STOP est levé : toutes les questions du §12 sont tranchées au §13 (Claude, 13/10/2026). Code la tranche.**

# Monde lot 3 T1 — Le tri des faits

## 1. Branche
`monde-lot-3-presentation` (branche courante vérifiée). Le plan place le lot 3 sur la piste B,
étape 3, après les fusions des lots 1 et 2 ; il ne donne pas de nom de branche explicite pour ce lot.
Les commits de fusion des lots 1 et 2 sont présents. Aucune fiche ni compte rendu Monde lot 3 antérieur.

## 2. Objectif
Produire sans mutation les faits publics d'un combattant et d'une paire, ordonnés par rareté et vérifiables à leur source.
Fondement : « Une fonction pure donne, pour un combattant puis pour une paire, la liste de ses faits
classés du plus rare au plus commun. » (brief, lot 3 T1, ligne 188).
Cette fiche est bloquée : ne pas coder les choix signalés en section 12 ; la compléter après réponse.

## 3. Ce qui existe
- `mgmt-carte.js:573` : `mgmtDivisionRankingCalcule(m,divId,scope,cycle)`, voie pure du classement.
  `:614` : `mgmtDivisionRank(m,f,scope)` appelle le classement mémorisé (`:661`).
  Réutiliser les lois de classement, pas une seconde formule. Les portées sont `organization` et `world`.
- `mgmt-passe.js:127-146` : `mgmtPasseCote`, `mgmtPasseLigne`, `mgmtPasseEntree`.
  Les combats du passé restent dans `m.hist`, marqués `p:true`, avec résultat, famille et round,
  mais sans profil moteur. `mgmtPasseAlleger(m)` (`:150`) supprime les faits `contrat`, `attend`, `depart_attente` du passé.
- `mgmt-ceintures.js:26` : `mgmtSplitTitle(m,div)` lit `title_initial` et `title_fight`.
  Porte `mgmtTitleMemoryRows(m)` (`:52`) pour reconstituer le champion AU MOMENT du combat,
  plutôt que déduire une victoire sur champion à partir de la ceinture actuelle.
- `mgmt-humanite.js:32,49` : `mgmtIdentiteVille(f)`, `mgmtIdentiteMetier(f)`.
  Éviter `mgmtIdentite(m,f)` (`:148`) pour ce tri : il calcule aussi des traits non demandés.
- `mgmt-vie.js:148` : `mgmtVieRelayes(m,f)` filtre les moments lisibles ; `mgmtVieDe` (`:105`)
  contient aussi des moments privés, à ne pas exposer.
- `mgmt-soiree-show.js:140` : `mgmtObsAvant(m,id,h)` exclut le combat courant et ses suivants.
  Porte cette frontière temporelle pour les futurs lecteurs de Soirée, sans appeler le rejeu.
- `mgmt-ecran-fiche.js:258-271` : garde/allonge publiques viennent de `mgmtCombatProfile(f).phys`.
  Or `mgmt-corps.js:164-188`, `mgmtCombatProfile(f)`, lit le niveau (`:177`), génère un combattant
  moteur et applique l'usure. Les aides `mgmtAllongeCm` et `mgmtAllongeTexte`
  (`mgmt-soiree-show.js:221-225`) passent aussi par ce profil : pas de raccourci autorisé sans décision.
- `tests/mgmtArchive.test.js:12-20` : modèle de fixture, graine 20261008, Split, quatre soirées.
  `:28-51` vérifie les identifiants et bilans ; `:54-69` le chargement de l'archive.
- `tests/helpers/loadGame.js:23-44` : `newGameWindow` charge les vrais scripts d'`index.html`.
  Ordre vérifié : humanité 1118, carte 1120, passé 1138, soirée-show 1177.
Recherche déléguée à `@eclaireur` tentée, indisponible (limite de profondeur) ; passages ci-dessus lus directement.

## 4. Ce qui change
décision prise (§13) levé le 13/10/2026 par les décisions du §13. Emplacements prévus après clarification :
- Nouveau `mgmt-presentation-faits.js` : extraction publique, provenance et classement des faits,
  sans DOM, sans texte rédigé, sans RNG, sans lecture de `G` ni modification des entrées.
- `index.html` : charger cette logique après ses dépendances ; pas de modification d'écran.
- Nouveau `tests/mgmtPresentationFaits.test.js` : tests ciblés ci-dessous.
- `package.json` : inclure ce test dans les listes explicites `test` et `test:watch` ; vérifier
  sa présence effective dans `check:rapide`, sans ajouter une exclusion.
Contrats proposés, à finaliser avec les décisions (ils ne constituent pas une autorisation de coder) :
```js
/** Faits publics d'un combattant, avec sources, triés par rareté. Pur.
 * @param {object} contexte Contexte public explicite, population et frontière temporelle à préciser.
 * @param {string} id Identifiant du combattant.
 * @returns {Array<object>} Schéma du fait et règle de départage à fixer après réponses.
 */
function mgmtFaitsCombattant(contexte,id)
/** Faits publics d'une paire, avec sources, triés par rareté. Pur.
 * @param {object} contexte Même contexte public que pour un combattant.
 * @param {string} aid @param {string} bid
 * @returns {Array<object>} Même schéma ; référence de rareté des paires à préciser.
 */
function mgmtFaitsCombat(contexte,aid,bid)
```
Ne pas figer des seuils, des regroupements, un quota ou un schéma implicite en attendant les réponses.

## 5. Sauvegarde
Non : fonctions dérivées uniquement. `MGMT_SAVE_VERSION` reste 16 (`mgmt-bureau.js:85`).
Aucune migration ni modification de validation. Si une donnée publique persistante devient nécessaire,
réouvrir cette section et coordonner le changement de version, ne pas l'ajouter discrètement.

## 6. Textes
Aucun : descripteurs de faits, pas de phrases de présentation. Les textes relu:false sont pour T2/T3.

## 7. Écran
Aucun : T1 n'intègre ni n'affiche une présentation. Les planches validées concernent les tranches d'écran.

## 8. Tests
Fichier prévu : `tests/mgmtPresentationFaits.test.js`. Intitulés exacts à conserver :
- « Monde lot 3 T1 — mêmes données publiques, mêmes faits sans mutation ni tirage » : deux appels,
  entrées gelées, sérialisation avant/après identique et SEED inchangée ; 0 soirée simulée.
- « Monde lot 3 T1 — aucun accès au niveau caché ni aux attributs moteur » : getters interdits qui
  lèvent, appels moteur piégés ; 0 lecture et 0 appel. Périmètre garde/allonge bloqué par Q3.
- « Monde lot 3 T1 — chaque fait possède une source publique retrouvable » : sur Split,
  graine 20261008 et quatre soirées, retrouver toutes les sources dans l'historique en mémoire,
  un contrat ou une donnée publique de fiche ; 0 source orpheline, 0 moment privé.
- « Monde lot 3 T1 — le passé allégé reste une source après rechargement » : même fixture,
  `mgmtSerialiser` puis `mgmtParseAndValidate`, listes avant/après identiques.
- « Monde lot 3 T1 — trente combattants ont trente signatures et au plus six ouvertures par famille » :
  fixture contrôlée de 30 dans une catégorie, 0 soirée ; signatures fondées sur le contenu,
  pas sur les seuls noms/identifiants. Attendus : 30 signatures distinctes, maximum 6.
  Assertion du brief réservée ici au futur tri utilisé pour ouvrir les présentations ; sa définition
  exacte reste bloquée par Q2. Ne pas prétendre tester déjà les pages de T2/T3.
- « Monde lot 3 T1 — les faits de paire sont sourcés et classés par rareté » : fixture contrôlée,
  0 soirée ; valeurs de fréquence et ordre attendus à inscrire après Q1/Q4, pas de test tautologique.
Le test des voix et pourcentages du brief appartient à T3, pas à cette tranche sans pronostic.

## 9. Vérification
Après les décisions du §13 : `node --test tests/mgmtPresentationFaits.test.js tests/mgmtArchive.test.js`,
puis `npm run check:rapide`. Pas de mesure Monte Carlo. Fin : 0 échec ; 0 lecture cachée,
0 mutation, 0 source orpheline ; 30 signatures et maximum 6 selon la définition validée.
Aujourd'hui : fiche seule ; aucun test de code exécuté pour prétendre valider la tranche.

## 10. Hors périmètre
T2/T3 (phrases, pages et pronostics), navigation T5, bilan T6, amendements T7, génération du passé,
booking, moteur, économie, refonte de la fiche, ajout de faits inventés et changements de sauvegarde.

## 11. Pièges
Une rareté sur valeur exacte rend presque tout unique (âge/allonge/rang) et ne garantit pas la diversité.
Un tri indépendant peut ouvrir 30 fois sur la même famille : le quota de six n'en découle pas.
`m.hist` en mémoire n'est pas l'archive compactée sur disque ; ne pas lire deux fois le passé.
Les titres sont des faits séparés des traces. Les moments sans relais sont privés.
Le mémo de classement peut être périmé après une mutation de fixture : voie pure ou invalidation explicite.
La soirée est calculée d'un bloc : ne pas présenter comme connus des résultats postérieurs au combat.

## 12. Questions pour Anthony
1. **Bloquante :** quelle population mesure la rareté (effectif actif de la catégorie, organisation,
   monde), et quelles valeurs/regroupements et seuils retient chaque famille, notamment âge, allonge,
   rang/mouvement, séries, méthodes, attente ? Quel départage entre faits également rares ?
2. **Bloquante :** le maximum de six ouvertures par famille doit-il contraindre T1 par une sélection
   collective des 30 combattants, ou seulement T2 ? Que faire si les faits disponibles ne permettent
   pas ce quota, et que signifie « aucune présentation identique » pour un tri sans texte ?
3. **Bloquante :** autorises-tu un adaptateur limité aux données physiques publiques garde/allonge
   malgré le passage actuel par `mgmtCombatProfile`, ou faut-il une source publique indépendante
   ne lisant jamais le niveau ni le moteur ? L'interdiction porte-t-elle aussi sur ces lectures indirectes ?
4. **Bloquante :** la rareté d'une paire se mesure-t-elle parmi toutes les paires de la catégorie,
   les paires bookables ou les combats de la carte ? Quelles familles sont propres à la paire,
   et faut-il aussi fusionner les faits individuels ? Quel instant de référence avant un combat ?

## 13. Décisions de Claude du 13/10/2026 (réponses aux questions du §12 ; Anthony laisse le technique à Claude)
1. **Rareté** : mesurée sur l'effectif actif de la CATÉGORIE de poids, dans l'organisation du joueur (pas le monde). Rareté d'un fait = part de la catégorie qui le partage ; plus c'est rare, plus il passe en premier. Départage : ordre fixe des familles (l'ordre de la liste de la fiche), puis identifiant. Valeurs : âge par tranches (≤22, 23–26, 27–30, 31–34, 35+) ; garde et allonge = valeur dans le quintile haut ou bas de la catégorie ; rang = top 3 de la catégorie ; mouvement = au moins 3 places gagnées ou perdues ; série = au moins 3 victoires ou 3 défaites de suite ; façon de gagner = une méthode qui fait au moins 60 % de ses victoires, avec au moins 4 victoires ; attente = au moins 6 mois.
2. **Quota de six ouvertures par famille** : il contraint T2 (l'affichage), pas T1. T1 rend la liste triée de chaque combattant sans quota. Si les faits manquent, la liste est plus courte : jamais de fait inventé. « Aucune présentation identique » est vérifié par T2 sur le texte, pas par T1.
3. **Données physiques** : un adaptateur limité aux champs publics garde et allonge est autorisé, même via `mgmtCombatProfile`, à condition de ne lire ni le niveau ni aucune statistique cachée du moteur, même indirectement. Interdit : tout ce qui permet de déduire le niveau.
4. **Rareté d'une paire** : mesurée parmi toutes les paires possibles de la catégorie (effectif actif). Familles propres à la paire : même tranche d'âge, revanche ou trilogie, contraste de style (libellés publics), même camp, rangs voisins, adversaire commun, enjeu de titre. La présentation d'une paire peut ensuite compléter par les faits individuels des deux. Instant de référence : l'état courant de la partie (`m.cycle`) avant le combat.

## Compte rendu

- **État : inachevé, arrêt sur une ambiguïté de spécification.** Branche vérifiée : `monde-lot-3-presentation`. Le STOP historique du §12 est bien levé par le §13 ; l'arrêt ci-dessous porte sur la formulation nouvelle du §13.1.
- **Fichier modifié :** cette fiche uniquement, pour consigner le blocage et les vérifications. Aucun code de simulation, écran ou texte joueur ajouté.
- **Tests ajoutés (intitulés) :** aucun ; les tests exigés ne sont pas présentés comme réalisés.
- **Migration de sauvegarde :** aucune ; version inchangée.
- **Ce qui a été essayé :** recherche déléguée à `@eclaireur`, indisponible (limite de profondeur), puis lecture ciblée. `engine.js:438` définit la garde publique par `orthodox` ou `southpaw` : ce n'est pas une grandeur numérique. `mgmt-corps.js:164-188` confirme que le profil existant lit le niveau et appelle le moteur ; il ne peut pas être utilisé tel quel dans cette tranche.
- **Vérification :** `@verif` et `@relecteur` indisponibles (limite de profondeur). Secours : `node tools/verif-versions.js` réussi ; `npm run check:rapide` réussi, 948 tests, 0 échec. Le premier lancement du check a été interrompu au délai de 120 secondes ; la relance avec un délai suffisant est verte. Ces résultats vérifient l'état existant, pas une implémentation de T1.
- **Écarts à la fiche :** extraction et tests non codés pour ne pas inventer la règle manquante ; aucun verdict de relecture disponible.
- **Question pour Anthony :** le §13.1 demande « garde et allonge = valeur dans le quintile haut ou bas ». Quelle règle appliquer à la garde catégorielle `orthodox`/`southpaw` : chaque garde constitue-t-elle un fait dont la rareté est sa fréquence dans la catégorie, sans quintile, ou faut-il une autre sélection explicitement définie ? L'allonge reste une grandeur numérique ; cette question ne remet pas en cause ses quintiles.

## 14. Précision du 13/10/2026 (réponse au codeur : la garde est catégorielle)
La garde (`orthodox` / `southpaw`) n'a pas de quintile : sa rareté est la part de la catégorie qui partage la même garde, comme pour tout fait catégoriel. Un gaucher n'est « rare » que s'il est moins de 35 % de la catégorie ; sinon la famille garde ne sort pas. L'allonge reste numérique : quintile haut ou bas de la catégorie. Le codeur n'a plus de question ouverte : il termine T1 et fait un commit « Monde lot 3 T1 : le tri des faits » (sans « inachevé »).

## Compte rendu — reprise après le §14

- **État : inachevé, arrêt sur le contrat de l'adaptateur physique.** La question sur la garde est résolue ; elle n'est pas le motif de cet arrêt. Branche vérifiée : `monde-lot-3-presentation` ; arbre propre avant intervention.
- **Fichiers modifiés et rôle :** cette fiche uniquement, pour rendre explicite le conflit restant. Aucun code, texte joueur ou écran ajouté.
- **Tests ajoutés (intitulés) :** aucun. Les critères de fin de T1 ne sont pas atteints.
- **Migration de sauvegarde :** aucune ; version 16 inchangée.
- **Ce qui a été essayé :** appel à `@eclaireur`, refusé par la limite de profondeur ; recherches et lectures ciblées de secours. Le roster construit dans `mgmt-bureau.js:211-220` ne conserve ni garde ni allonge. `mgmtCombatProfile` (`mgmt-corps.js:164-188`) lit le niveau, appelle `makeFighter` et restaure ensuite SEED. La physique est produite dans `engine.js:424-440` par `gauss`, `rnd` et `RI` ; `makeFighter` (`:481-486`) consomme également les tirages de style, pays et nom avant cette physique. Restaurer SEED ne signifie donc pas zéro tirage. Appeler directement `makePhysical` sous le hachage de l'id ne porterait pas la physique publique existante : il manquerait ce préfixe de tirages.
- **Vérification :** `@verif` indisponible (limite de profondeur). Secours exécuté dans l'ordre demandé : `node tools/verif-versions.js` réussi, puis `npm run check:rapide` vert, 948 tests réussis, 0 échec, 102 fichiers lancés. Ces vérifications portent sur l'état existant, pas sur une implémentation de T1. Aucun test lent touché.
- **Écarts à la fiche :** code et tests non livrés ; le §13.3 autorise un adaptateur physique sans lecture cachée, mais le §4 interdit la RNG et le §8 exige zéro appel moteur. Aucune nouvelle loi de physique ni migration introduite pour contourner ces contraintes.
- **Relecture :** appel à `@relecteur` tenté après vérification, indisponible (limite de profondeur). Aucun verdict de relecture disponible.
- **Question pour Anthony :** l'adaptateur physique autorisé au §13.3 peut-il rejouer uniquement le préfixe de génération publique existant (style/pays/nom puis `makePhysical`), sans niveau, attributs ni création de combattant, sous une graine locale ou sauvegardée/restaurée ? Si oui, préciser que les interdictions de tirages et d'appels moteur des §4/8 concernent l'extraction et le moteur de combat, et non cet adaptateur public. Sinon, quelle source de garde/allonge existantes doit alimenter le contexte explicite, puisque le roster ne les stocke pas ?

## 15. Décision du 13/10/2026 (conflit signalé par le codeur : le physique est régénéré par tirage)
Le physique public (garde, allonge) n'existe pas comme donnée gardée : le lire ferait un tirage ou un appel au moteur, ce que T1 s'interdit. **Décision : les familles « garde » et « allonge » sont RETIRÉES de T1.** Elles seront ajoutées quand une source publique gardée existera. T1 rend les autres familles (âge, rang, mouvement, série, façon de gagner, attente, camp, rôle, bilan, etc.) ; aucun tirage, aucun appel au moteur, aucune lecture du niveau. Retire du test et du code ce qui concerne garde et allonge, garde les autres, fais le commit « Monde lot 3 T1 : le tri des faits » (sans « inachevé »). Il n'y a plus de question ouverte.

## Compte rendu — reprise après le §15

- **État : non livré, arrêt sur les sources du camp et du style.** Les décisions des §14–15 sont appliquées à la lecture : garde et allonge ne sont plus demandées. Branche vérifiée : `monde-lot-3-presentation` ; arbre propre avant intervention.
- **Fichier modifié et rôle :** cette fiche uniquement, pour consigner le conflit restant ; aucun système parallèle, adaptateur, écran ni texte joueur ajouté.
- **Tests ajoutés (intitulés) :** aucun. Les tests et critères de fin de T1 ne sont pas atteints.
- **Migration de sauvegarde :** aucune ; version 16 inchangée.
- **Ce qui a été essayé :** appel à `@eclaireur` refusé par la limite de profondeur, puis lectures ciblées. Le camp exigé au §15 vient de `mgmtCamp` (`mgmt-camps.js:93`), qui appelle `mgmtCampInitial` (`:62`) et tire via `mgmtIdentiteStream` (`:65–69`) ; `mgmtCampFait` tire aussi (`:55–58`). Le contraste de style exigé au §13.4 vient de `mgmtIdentiteStyle` (`mgmt-humanite.js:43–47`), qui tire lui aussi. Ces flux passent par `mgmtIdentiteStream` (`:14–16`) et `mgmtSel` (`:8–10`), qui lit `G.mgmt`. Ce ne sont pas des attributs cachés, mais ce sont bien des tirages et une dépendance indirecte à `G`, interdits par les §4/15. Le roster initial (`mgmt-bureau.js:211–220`) ne garde ni camp ni style.
- **Vérification :** `@verif` indisponible (limite de profondeur). Secours exécuté dans l'ordre demandé : `node tools/verif-versions.js` réussi ; `npm run check:rapide` vert, 948 tests réussis, 0 échec, 102 fichiers lancés. Aucun test lent touché. Ces résultats vérifient l'état existant, pas une implémentation de T1.
- **Écarts à la fiche :** extraction et tests non livrés. Ni suppression silencieuse des familles camp/style, ni exception implicite pour les flux locaux, ni ajout de données persistantes. Aucun verdict de relecture disponible : `@relecteur` également indisponible (limite de profondeur).
- **Question pour Anthony :** quelle source autoriser pour le camp et le style ? Soit autoriser explicitement un contexte de fiches publiques pré-calculées par les portes existantes hors extraction (en précisant qui le construit et comment sa provenance est retrouvée), soit autoriser leurs flux locaux et rendre leur sel explicite sans lecture de `G`, soit retirer ces familles comme garde/allonge. En l'état, choisir l'une de ces options modifierait la spécification sans décision.

## 16. DÉCISION FINALE du 13/10/2026 — elle remplace les §4 et §8 sur ce point et les §14 et §15 (lis ceci en dernier)
Le mot « pure » du brief veut dire : **déterministe et sans effet de bord** (même partie → même résultat ; la fonction ne modifie ni `G`, ni la partie, ni l'état du générateur aléatoire global). Il n'interdit PAS d'appeler les accessoires publics existants qui utilisent un flux local à graine fixe par combattant et qui sauvegardent puis restaurent la graine (`mgmtCombatProfile` lu pour la seule garde et l'allonge ; `mgmtCamp` ; `mgmtIdentiteStyle`). Ces appels sont AUTORISÉS dans l'extraction, à ces conditions : (1) on ne lit jamais le niveau ni un attribut caché du moteur ; (2) un test vérifie que l'état du générateur global (`getSeed` ou l'équivalent du dépôt, cherche-le par grep) est identique avant et après l'extraction, et que deux appels rendent le même résultat ; (3) aucun nouveau système, aucune donnée persistante.
**Les familles garde et allonge sont donc RÉINTÉGRÉES**, avec les seuils du §13 (garde catégorielle du §14). Camp et contraste de style sont conservés. Le §15 est annulé. Il n'y a plus aucune question ouverte : code T1, vérifie, commit « Monde lot 3 T1 : le tri des faits » (sans « inachevé »).
