# Étude — changer d'organisation sans recréer la partie

## État observé

Une partie monde vivant porte `mondeVivant: true`, un nom d'organisation courant dans `m.org`, et les autres organisations dans `m.orgs[id]`. Le code de classement (`mgmtOrgNiveaux`) lit les données de la partie active pour son organisation et les objets persistés de `m.orgs` pour les autres. Chaque organisation est donc une partie autonome, pas seulement un profil : son effectif (`roster`), ses résultats, son calendrier, son économie, ses salles, ses contrats et les autres systèmes propres à la partie y évoluent.

Les huit identifiants viennent de `MGMT_ORGANISATIONS` (`split`, `garden-of-blood`, `mma-korner`, `ultimate-rim`, `fighting-pacific-championship`, `organisation-6`, `organisation-7`, `organisation-8`). Le nom affiché de l'organisation courante est `m.org`; `mgmtPredecesseurOrgId(m)` identifie son entrée canonique. `mgmtOrgProfil(m)` dérive le profil depuis ce nom. `mgmtExtOrgs(m)` substitue actuellement l'organisation courante par Split dans l'échelle des combattants extérieurs : ce comportement doit être réexaminé pour éviter de faire apparaître une organisation active une deuxième fois.

## Passage envisagé

Le changement ne doit ni générer un nouveau monde, ni remplacer la sauvegarde par `m.orgs[cible]`. Il doit échanger les rôles actif/stocké en conservant les deux objets intacts :

1. Vérifier que la cible est un des sept identifiants distincts de l'identifiant actif et que `m.orgs[cible]` est complet et valide.
2. Déposer dans `m.orgs[actif]` l'état actif nécessaire pour reprendre cette organisation ultérieurement, puis promouvoir l'objet `m.orgs[cible]` en état actif.
3. Retirer la cible de `m.orgs` (ou appliquer une représentation canonique équivalente), actualiser `m.org` et les champs qui désignent explicitement l'organisation active.
4. Recalculer les dérivés de l'organisation active (profil, rang, références de recrutement/extérieur, écrans), sans réinitialiser le calendrier, la caisse, les combattants, les contrats, les rivalités ni l'historique de la partie promue.
5. Valider l'ensemble et sauvegarder de manière atomique. En cas d'échec, restaurer exactement l'état pré-opération.

La forme précise de l'état « partie autonome » doit être déterminée par comparaison d'une partie neuve et d'un objet `m.orgs[id]` issu d'une vraie sauvegarde. Ne pas supposer que copier quelques champs de `m` suffit : tous les lecteurs qui supposent une partie active unique doivent être recensés.

## Risques de sauvegarde et de simulation

- Une promotion partielle peut perdre des données de carrière, ou faire reprendre une organisation avec un agenda différent de celui qu'elle avait en dernier.
- Des identifiants de combattants ou des références croisées peuvent entrer en collision entre roster actif et roster extérieur.
- Les systèmes de classement, titres, combats, contrats, recrutement et génération d'extérieur lisent des formes différentes de l'organisation courante ; la substitution par Split dans `mgmtExtOrgs` peut devenir incorrecte.
- L'ancienne sauvegarde peut ne pas contenir `m.orgs`, certaines organisations, ou les nouveaux champs requis. La migration doit conserver le parcours antérieur et ne créer aucun monde vivant fictif.
- Les snapshots, l'historique, la RNG à graine et l'ordre des tirages ne doivent pas changer pour une partie qui ne change pas d'organisation.
- Il faut empêcher une sauvegarde invalide ou une erreur en cours d'échange de laisser la partie à moitié basculée.

## Plan de tranches proposé

1. **Inventaire et contrat de données** : tracer la création, validation/réparation, sauvegarde/chargement et tous les lecteurs de `m.orgs`; comparer les schémas avec tests de sauvegardes anciennes.
2. **Conversion pure et tests** : construire une fonction pure qui prépare l'échange, teste les huit directions et vérifie conservation profonde des deux états, identifiants et historiques. Pas encore d'action joueur.
3. **Transaction et persistance** : appliquer atomiquement l'échange, valider avec `validateMgmt`, ajouter migration uniquement si un nouveau format est indispensable et couvrir rollback/chargement.
4. **Intégration interface et flux** : proposer le choix aux étapes validées du parcours, rafraîchir les dérivés et adapter proprement le monde extérieur; aucune superposition d'écran.
5. **Tests bout en bout** : partir de Split, avancer les deux calendriers, passer vers chacune des sept organisations, sauvegarder/recharger et vérifier classement, contrats, agenda, roster et retour possible. Exécuter ensuite le contrôle rapide et les mesures prévues pour le lot.

Cette étude n'implémente aucun changement d'organisation. L'échange réel reste à valider par l'inventaire de la première tranche ; en particulier, la liste exhaustive des champs actifs et le comportement des contrats du joueur lors du départ doivent être définis avant le code.
