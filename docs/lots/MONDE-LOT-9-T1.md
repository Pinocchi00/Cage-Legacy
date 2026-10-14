# Monde lot 9 T1 — accélérer et mesurer la simulation

Branche attendue : `monde-lot-9-vitesse` — branche courante : `monde-lot-9-vitesse`.

## Objectif

Réduire la durée de création complète en appliquant les trois premiers leviers de performance, puis mesurer la création et une semaine sur les deux machines de référence.

> « T1 — La vitesse d'abord. Les trois premiers leviers ci-dessus, puis un outil qui chronomètre la création complète sur deux machines. Rien d'autre ne commence tant que les 3 minutes ne sont pas tenues. »

## Ce qui existe

- `mgmt-carte.js:573,614,661` : `mgmtDivisionRankingCalcule`, `mgmtDivisionRank`, `mgmtDivisionRanking`; classement conservé en mémoire issu du Monde lot 1 T1. Porte le mémo et les tests d'équivalence : ne pas le réécrire.
- Appelants nombreux de `mgmtDivisionRank` / `mgmtDivisionRanking` : notamment `mgmt-agenda.js:219`, `mgmt-attention.js:55-110`, `mgmt-ecran-semaine.js:32-33`, `mgmt-ecran-classements.js:236-238`. Garder signatures et résultats identiques.
- `tools/mesure-management.js` : porte le joueur automatique, le chronométrage six ans (62 soirées) et le rapport `tools/reports/MESURE-MANAGEMENT.md`. Le chrono existant mesure une seule organisation ; l'étendre plutôt que dupliquer le simulateur.
- `tests/mgmtClassementsMemoire.test.js` : preuve d'exactitude du mémo ; `tests/outillage.test.js` : contrat des outils de mesure.
- `MGMT_EVENT_WEEKS=5` : six ans font 62 soirées. Aucun écran visé.

## Ce qui change

- `mgmt-agenda.js` et/ou le fichier qui porte l'ouverture de semaine : factoriser l'ouverture commune de semaine, appelée une fois pour les huit organisations, sans changer l'ordre ni le résultat d'une partie. Préciser la fonction choisie après inspection des appelants ; pas de nouvel API publique sans nécessité.
- Booking automatique des sept prédécesseurs : chemin direct, sans produire les listes d'écran préparées. Le booking du joueur garde son chemin actuel. Ne l'introduire que dans cette tranche de performance.
- `tools/mesure-management.js` : étendre le scénario de création complète aux huit organisations et rapporter les durées réelles de création (pas une projection) et d'une semaine de jeu ; inclure paramètres et mesures séparées pour diagnostiquer les trois leviers. Exécuter le même scénario/graine sur chacune des deux machines.
- `tests/` : ajouter les tests ciblés ci-dessous. Aucun texte, donnée de texte, ni changement d'écran.

## Sauvegarde

Non. `MGMT_SAVE_VERSION` inchangée ; aucune donnée de partie n'est ajoutée.

## Textes

Aucun.

## Écran

Aucun.

## Tests

- `tests/mgmtClassementsMemoire.test.js` — tous les tests existants, notamment `Monde lot 1 T1 — la partie jouée avec le mémo est identique à la partie jouée sans : deux graines, vingt soirées, état comparé après chaque soirée`.
- `tests/mgmtMondeVitesse.test.js` (nouveau) :
  1. `Monde lot 9 T1 — semaine ouverte une fois pour huit organisations` — graine fixe ; vérifier exactement une ouverture par semaine et que les huit organisations obtiennent leur ouverture/calendrier attendu.
  2. `Monde lot 9 T1 — booking direct des prédécesseurs équivalent au booking préparé` — graine fixe ; mêmes combattants et même carte retenue que la voie de référence, sans construction des listes d'écran.
  3. `Monde lot 9 T1 — à graine égale la création complète est déterministe` — deux exécutions, mêmes huit organisations et états finaux strictement égaux.
- `tests/outillage.test.js` — `Monde lot 9 T1 — l'outil mesure création complète et semaine sur huit organisations` : arguments de mesure courte documentés par l'outil, huit organisations, durées positives, données JSON et rapport cohérents.

## Vérification

- `node --test tests/mgmtMondeVitesse.test.js`, puis `node --test tests/mgmtClassementsMemoire.test.js` et `node --test tests/outillage.test.js`.
- Petit essai de mesure : `node tools/mesure-management.js --help` (ajouter un mode huit organisations et une semaine courte, avec graine fixe ; afficher sa commande exacte dans le rapport). Mesure finale sur deux machines : création complète ≤ **180 s**, semaine de jeu ≤ **5 s**.
- Critère de fin : les deux seuils respectés sur les deux machines, avec paramètres, graine et durées consignés dans le rapport. Si la machine d'Anthony dépasse 180 s, arrêt avant toute autre tranche et décision d'Anthony sur les leviers supplémentaires.

## Hors périmètre

- Simulation complète persistée des huit organisations, classement d'organisations, niveaux, classement mondial, staff, contrats/recrutement, écrans et sauvegarde : tranches ultérieures.
- Calcul parallèle / multi-cœurs : levier 4, interdit ici.
- Ne pas modifier les règles de classement ni les appels d'affichage. Ne pas toucher aux textes.

## Pièges

- Le plan prévoit les leviers 2 et 3 du lot 9 T1 dans le lot 1 avant T3 seulement si la mesure dépasse trois minutes : vérifier l'état de la branche et réutiliser le travail déjà présent, sans le dupliquer.
- Le booking des prédécesseurs ne doit pas fabriquer les listes destinées à l'écran ; ne pas confondre le booking du joueur et celui des prédécesseurs.
- « Ouvrir la semaine une fois » ne signifie pas sauter les opérations propres à chacune des huit organisations. Préserver l'ordre déterministe et ne jamais introduire `Math.random()`.
- Chronométrer dans le contexte de simulation, pas autour du pont jsdom/Node ; distinguer mesure réelle et projection.
- Aucun ordre de scripts ne doit changer sans vérification de `index.html` et du harnais.

## Questions pour Anthony

- Quelles sont les deux machines de référence (identification/configuration) et qui exécute la mesure sur la seconde ? Le brief demande deux machines, mais n'en identifie qu'une explicitement (le PC d'Anthony) ; sans ce renseignement la validation du seuil à deux machines est bloquée.

## DÉCISION du superviseur — 14/10/2026 15 h 40 (réponse à la question sur les deux machines)
La question sur les machines ne bloque PAS le code. Le codeur fait : les trois leviers, l'outil de mesure étendu aux huit organisations (création complète et une semaine, graine fixe, rapport avec la commande exacte), les tests. La mesure officielle est faite ensuite : le superviseur la lance sur la machine de développement (celle d'Anthony) et inscrit le résultat dans le rapport ; la seconde machine sera mesurée plus tard avec la commande du rapport. Tu n'as donc aucune question à poser. Le STOP de tête est périmé.
