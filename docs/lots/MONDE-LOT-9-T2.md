STOP

# Monde lot 9 T2 — les huit organisations vivent

Branche attendue : `monde-lot-9-monde` — branche courante : `monde-lot-9-monde`.

## Objectif

Remplacer le monde extérieur calculé à la demande par huit organisations réellement simulées, chacune avec son effectif, sa caisse, sa popularité, ses salles, son calendrier et son matchmaker automatique.

> « T2 — Les huit organisations vivent. Chacune a son effectif, sa caisse, sa popularité, ses salles, son calendrier et un matchmaker automatique. Le monde extérieur calculé à la demande est remplacé. Une partie créée avant ce lot garde l'ancien monde et se joue sans changement. »

## Condition préalable bloquante

Le plan dit : « Rien d'autre ne commence tant que les 3 minutes ne sont pas tenues. » Le rapport `tools/reports/MESURE-MANAGEMENT.md` mesure la création à **252,3 s** (seuil ≤ 180 s) et une semaine à **5,57 s** (seuil ≤ 5 s), sur la machine de développement. La T1 n'a donc pas atteint ses seuils ; ne pas démarrer le code de T2 avant décision d'Anthony.

## Ce qui existe

- `mgmt-monde.js:20-55` porte le monde extérieur dérivé : ses lignes ne stockent que l'identité, les carrières sont calculées à la lecture. `mgmtExteriorCreate`, `mgmtExteriorEnsure`, `mgmtExteriorArrive` (`:84`, `:141`, `:163`) entretiennent ce vivier ; `mgmtExteriorTrace` (`:371`) dérive les combattants.
- `mgmt-bureau.js:151` `mgmtNewRoster(m,opts)` crée un effectif ; `mgmt-bureau.js:403` le renouvelle au cycle. À réutiliser pour les huit rosters, sans recopier la génération.
- `mgmt-predecesseur.js:128` `mgmtPredecesseurBooker(m,k,cfg,limite,contrats,reclamations)` et `:217` `mgmtPredecesseurSoiree(m,k,reglages,mesure)` portent le matchmaker automatique. T1 ajoute le booking direct, sans listes d'écran ; le réutiliser.
- `mgmt-ecran-semaine.js:50` `mgmtSemaineMonde(m)` lit les actualités du monde dérivé. Repérer tous ses usages et ceux de `mgmtExterior*` avant remplacement ; les parties anciennes doivent conserver leur parcours.
- `mgmtPassePreparer` / `mgmtPasseGenerer` sont exercées en génération de passé ; `tests/mgmtMondeVitesse.test.js` porte les tests T1 d'ouverture, booking direct et déterminisme. Ne pas casser ces contrats.

## Ce qui change — à réaliser après levée du STOP

- `mgmt-monde.js` : remplacer le vivier dérivé des sept organisations extérieures par des états persistés complets pour les huit organisations ; préserver explicitement l'ancien chemin aux parties déjà créées. Spécifier au codeur, après inspection des consommateurs, l'API de sélection et de simulation, sans maintenir deux systèmes parallèles pour les nouvelles parties.
- Fichier(s) de simulation/semaine à déterminer après inventaire des appelants : une semaine commune ouvre chaque organisation une fois, fait jouer son matchmaker, et met à jour son calendrier, sa caisse, sa popularité et ses salles selon les mécanismes existants ; ordre stable et RNG injectée.
- `tests/` : ajouter des tests ciblés de création, déterminisme, avancée hebdomadaire et compatibilité des anciennes parties (intitulés exacts à établir après validation du périmètre et des API).
- Pas de fonction nouvelle spécifiée tant que la décision de reprise/performance n'est pas donnée.

## Sauvegarde

À décider avant implémentation : les sept états complets et leurs calendriers deviennent persistés. La fiche ne fixe ni version cible ni format de migration. STOP, ne pas choisir de version ni définir une migration par supposition.

## Textes

Aucun.

## Écran

Aucun.

## Tests

La T1 n'étant pas validée et le rapport de mesure indiquant des seuils dépassés, aucun contrat de test T2 n'est prescrit ici : les assertions devront suivre la décision d'Anthony sur le traitement de la performance et des parties antérieures.

## Vérification

Après décision seulement : tests ciblés à préciser. Mesure existante : `node tools/mesure-management.js --creation --semaine --graine 20261008`. Seuil préalable déjà fixé : création ≤ **180 s**, semaine ≤ **5 s** ; actuellement **252,3 s** et **5,57 s** sur la machine de développement.

## Hors périmètre

Classement des organisations (T4), niveaux (T3), classement mondial (T5), staff (T6-T9), carrière du joueur (T10) et écran de l'organisation (T11). Ne pas modifier ces sujets dans T2.

## Pièges

- `mgmt-monde.js` déclare que le monde extérieur est dérivé et non simulé ; c'est le système existant à remplacer pour les nouvelles parties, pas à doubler.
- Le brief exige que les parties créées avant le lot gardent l'ancien monde et restent jouables : le choix de mode doit être fiable à travers chargement/sauvegarde.
- La T1 a déjà un chemin de booking direct pour le prédécesseur ; ne pas reconstruire les listes d'écran.
- Ordre de chargement des scripts fragile : toute modification de `index.html` impose de contrôler son ordre et le harnais.
- Déterminisme obligatoire : jamais `Math.random()` ; ne pas dépendre de l'ordre accidentel d'itération ni changer l'ordre des tirages des parties existantes.

## Questions pour Anthony

- La mesure T1 est hors seuil sur la machine de développement (252,3 s et 5,57 s). Faut-il suspendre le lot 9 T2 jusqu'à ce que T1 soit ramenée sous ses deux seuils, ou autorises-tu explicitement à poursuivre malgré ces résultats ? Cette décision bloque la tranche conformément au plan.
- Si tu autorises la poursuite, quelle version de sauvegarde et quelle frontière de compatibilité veux-tu pour le stockage des sept organisations simulées, alors que le brief exige le maintien jouable des anciennes parties sans fixer la migration ?
