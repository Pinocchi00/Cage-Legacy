# Monde lot 10 T1 — Refonte du chargement des six ans

## Branche
`monde-lot-10-ecrans` (branche courante attendue).

## Objectif
Refondre l'écran de chargement des six ans selon la planche validée, sans reconstruire le DOM à chaque soirée et en affichant les compteurs réels.

Fondement du brief : « La barre ne doit PAS reconstruire l'écran entier à chaque soirée : on ne met à jour que la barre, l'année, les compteurs et le dernier fait » (décision de tranche T1 dans `docs/lots/MONDE-LOT-10-DECISIONS.md`, précisant les écarts à appliquer au brief).

## Ce qui existe
- `docs/lots/MONDE-LOT-10-DECISIONS.md:3-17` fixe la branche, la planche validée, les décisions de produit et les contraintes de cette tranche. Pas de sauvegarde ni de règle de simulation à modifier.
- `maquettes/monde/refonte/LISEZ-MOI.md:28-67` est le contrat de l'écran : états, données par zone, clavier, rendu incrémental et mouvement. Planche validée : `maquettes/monde/refonte/MondeChargement.html`.
- `mgmt-nouvelle.js:13-15` porte l'état de génération `MGMT_NOUVELLE.gen`. `:62-97` porte le rendu et les compteurs actuels; `:144-172` le pas de simulation, actuellement avec `render()` après chaque soirée; `:176-191` enregistre l'écran; `:218-232` lance la génération et les boucles; `:241-249` n'entre dans le jeu que sur action explicite.
- `mgmtNouvelleGenPas` porte déjà le séquencement d'une soirée par pas et la gestion de fin/exception. Réutiliser-le sans altérer le moteur de simulation. `mgmtNouvelleBarreBoucle` porte une animation indépendante de barre; ne pas la confondre avec le rerendu de l'écran.
- `tests/mgmtNouvelleChargement.test.js:25-94` porte les tests d'écran existants (attente du bouton, abandon, cartons, taille minimale, barre monotone). Les conserver et les compléter.

## Ce qui change
- `mgmt-nouvelle.js` : remplacer le rendu générique répété pendant la génération par un rendu initial par état (`debut`, `chargement`, `fin`, `erreur`) puis mise à jour ciblée des nœuds existants. Ne pas appeler `render()` à chaque soirée. Les changements de carton par flèches/pastilles peuvent rerendre uniquement le carton; les cinq textes restent ceux de `MGMT_NOUVELLE_LECTURES` avec `relu:false`.
- Ajouter une lecture incrémentale des faits depuis l'index `g.vus` : `title_initial` initialise le détenteur sans incrément; `title_fight` lit le vainqueur dans `g.m.hist[f.fight]`, incrémente uniquement si le détenteur change; `injury` incrémente les blessures. Le dernier fait marquant est le dernier changement de ceinture (nom + catégorie/soirée). Les faits déjà parcourus ne sont pas recomptés.
- Compteurs affichés : soirées `g.k`, combats `g.m.hist.length`, champions couronnés (changements effectifs depuis `title_initial`) et blessures (faits `injury`). Selon la décision lot 10, remplacer « Retraites » par « Blessures »; ne pas créer de retraite ni toucher à la simulation.
- Frise : six étiquettes d'années et positions des traits calculées selon `mgmtPasseAnnee(n,i)`, au premier indice correspondant à chacune des six années. En cours/terminées/à venir suivent le contrat du LISEZ-MOI. La barre ne recule jamais.
- États : au début, compteurs à zéro et aucune dernière nouvelle; génération, compteurs et dernière nouvelle à jour; fin avec barre pleine et bouton jaune « Entrer dans {org} » seulement; erreur avec création figée, recommencer/retour au choix. Respecter Échap, Entrée et mouvement réduit selon le LISEZ-MOI.
- Les mises à jour de progression changent seulement le texte des compteurs, de l'année et du dernier fait, ainsi que la largeur de barre. Pas de reconstruction du document à chaque soirée. JSDoc exigé pour toute nouvelle fonction, décrivant paramètres, résultat et effet; signatures à choisir selon le découpage interne (pas d'API publique imposée).
- `tests/mgmtNouvelleChargement.test.js` : ajouter assertions pour états/compteurs/frise/dernière nouvelle, quatre états de chargement, absence de rerendu complet pendant progression et erreurs; garder les tests existants.
- CSS éventuel dans `ui-cadre.css` uniquement pour les sélecteurs de la planche `MondeChargement`; aucun texte sous 22 px. Les textes fixes d'interface proposés par le LISEZ-MOI entrent avec `relu:false`.

## Sauvegarde
Non. `MGMT_SAVE_VERSION` inchangée; aucune donnée persistée.

## Textes
Commande `@ecrivain` : aucun texte à produire. Réutiliser les cartons existants `MGMT_NOUVELLE_LECTURES` marqués `relu:false`. Pour « Leïla t'aide », lire `ident.adjointe.prenom` selon le LISEZ-MOI, sans écrire de nouvelle réplique.

## Écran
Planche validée : `maquettes/monde/refonte/MondeChargement.html`; contrat détaillé : `maquettes/monde/refonte/LISEZ-MOI.md` sections 1 et « Écarts et questions ».

## Tests
Fichier : `tests/mgmtNouvelleChargement.test.js`.
- `Chargement — la partie attend le bouton : G.mgmt reste null, Entrée ouvre la partie`
- `Chargement — Échap pendant la génération abandonne proprement`
- `Chargement — les cinq lectures s’affichent une à une, → et ← les parcourent, aucun minuteur après la sortie`
- `Chargement — aucun texte sous 22 px dans l’écran de création`
- `Chargement — la largeur de la barre est monotone et finit à 100 %`
- Ajouter des tests vérifiables : états debut/chargement/fin/erreur; pour 2 soirées, g.k progresse 0→2 et la fin affiche 100 %; les combats égalent `hist.length`; un `title_initial` seul ajoute 0 champion, un `title_fight` avec changement ajoute 1, une défense ajoute 0; chaque `injury` ajoute 1 blessure; dernier fait rapporte le dernier changement de ceinture; année/frise cohérentes avec `mgmtPasseAnnee`; progression ne reconstruit pas l'écran ni ses nœuds; erreur conserve l'écran de création et propose Recommencer/Choisir.

## Vérification
- `node --test tests/mgmtNouvelleChargement.test.js`
- Mesure manuelle sur la génération complète (62 soirées) : vérifier que l'écran est rendu initialement une fois et que les mises à jour de progression ne remplacent pas le DOM complet; pas de seuil temporel demandé pour T1.
- Critère de fin : tous les états et compteurs concordent avec les données de la partie, barre monotone terminant à 100 %, aucune reconstruction complète par soirée, tests ciblés verts, et comparaison visuelle à la planche sans débordement/chevauchement aux largeurs 1280, 1440 et 1920, textes ≥22 px.

## Hors périmètre
Ne pas toucher aux règles de génération, de classement, à `mgmtPassePreparer`/`mgmtPasseSoiree`/`mgmtPasseCloturer`, aux retraites, à l'écran « Votre arrivée », à Résultats, à l'Accueil, aux sauvegardes, ni au contenu des cartons de lecture.

## Pièges
- `mgmtNouvelleGenPas` fait aujourd'hui un `render()` à chaque pas (`mgmt-nouvelle.js:166`); c'est précisément le rerendu à supprimer, mais le rendu initial, la fin et l'erreur doivent rester cohérents avec `G.screen`.
- Le renderer lit `MGMT_NOUVELLE.gen`; préserver la référence `g` vérifiée par les boucles et le nettoyage de minuteurs. Ne pas laisser d'intervalle/animation après abandon ou sortie.
- Les calculs de compteurs sont incrémentaux : respecter `g.vus` et éviter de recompter les anciens faits à chaque pas. Un `title_fight` n'est pas nécessairement un changement de champion.
- L'identité fournit l'adjointe; ne pas coder « Leïla » en dur (Garden of Blood a Rachel). Échapper toute donnée injectée en HTML avec `esc()`.
- Pour les années, ne pas répartir six marqueurs uniformément : utiliser les indices réels donnés par `mgmtPasseAnnee`.
- Les changements de carton et la barre animée ont leurs propres mises à jour; ne pas les laisser appeler un rerendu complet pendant la génération.

## Questions pour Anthony
Aucune question bloquante restante : les décisions listées dans `MONDE-LOT-10-DECISIONS.md` tranchent les écarts de la planche pour T1.

## Compte rendu
- `mgmt-nouvelle.js` : compteurs incrémentaux de titres/blessures, progression ciblée sans rendu complet par soirée, positions de frise et état erreur/recommencer; version de cache montée.
- `tests/mgmtNouvelleChargement.test.js` : ajout de `Chargement — états, compteurs, frise et dernier changement de ceinture` et `Chargement — une progression conserve les nœuds de l’écran`.
- Sauvegarde : aucune migration.
- Écarts : le check rapide a échoué (45 fichiers de test en échec au lancement parallèle; test ciblé vert). `@verif` et `@relecteur` indisponibles. Restent à compléter les assertions des quatre états, l'erreur, l'affichage du dernier fait dans le compteur, et l'inscription dans package.json; aucune comparaison visuelle n'a pu être faite. Pas de commit tant que ces critères ne sont pas satisfaits.
- Questions pour Anthony : aucune nouvelle question; demande de suivi sur le rendu d'erreur et sur les critères visuels non contrôlés.
