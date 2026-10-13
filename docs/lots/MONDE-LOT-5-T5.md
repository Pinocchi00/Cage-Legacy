# Monde lot 5 T5 — La suite est inchangée

## 1. Branche
`monde-lot-5-carte`, branche courante vérifiée le 13/10/2026.
Le plan ne nomme pas cette branche : piste A, après les lots 1, 6 et 4 (`docs/PLAN-OPENCODE-MONDE.md:70,95–97`) ; nom établi par T1 à T4.
Fiches et comptes rendus T1 à T4 lus ; T3 et T4 acceptées par Claude. Les écarts visuels T4 restent au bilan, pas dans T5.

## 2. Objectif
Prouver que la première carte héritée rejoint le déroulement existant, se reprend sans rejouer et se referme normalement, sans nouvelle règle de soirée.
Brief, lot 5, l.269 : « La soirée se joue comme aujourd'hui, avec les corrections du “Brief vers la démo”. »

## 3. Ce qui existe
- `mgmt-agenda.js:167–172,195–206`, `mgmtAgendaPret(m)` et `mgmtAgendaJouer(m)` : blocages, date, simulation, retrait de la prochaine date et inscription dans les soirées faites.
- `mgmt-calendrier.js:162–166`, `CL.mgmtCalendrierJouer()` : vérifie les retraits puis joue, sauvegarde et ouvre `mgmt_soiree`. Réutiliser cette porte dans les tests de parcours.
- `mgmt-corps.js:594–681`, `mgmtRunEvent(m)` : préliminaires puis principale inversée, traces avant combat, contrats et finance appliqués une fois, `eventsPlayed++`, cartes vidées. Aucune lecture de `herite` dans le calcul.
- `mgmt-soiree-show.js:70–86`, `mgmtSoireeProgramme(m)` : programme lu sur `lastEvent` et la fin des traces du cycle, pas de nouvelle simulation.
- `mgmt-ecran-soiree.js:14–38`, `mgmtSoireeNeuve(i)`, `mgmtSoireeEnCours(m)`, `mgmtSoireeReprendre(m)` : index persisté dans `lastEvent.vu`, reprise depuis les traces.
- `mgmt-screens.js:370–387`, `CL.mgmtEnter(1)` : validation/chargement puis reprise prioritaire d'une soirée en cours.
- `mgmt-soiree-cadre.js:246–261,288–315` : commencer, regarder, passer, revoir ; fin vers le Lendemain **même sans touché**, correction démo déjà livrée.
- `mgmt-lendemain-cadre.js:78–87`, `CL.mgmtLendemainResultats()` : agenda suivant, pile suivante, sauvegarde, Résultats.
- **Porte `partie()` de `tests/mgmtCarteHeritee.test.js:8–12`**, graine 20261008, Split, trois soirées de passé ; porte son test du joueur automatique (:87–98), pas une copie du moteur.
- `tests/helpers/jouerSoirees.js:5–31`, `jouerSoirees(win,n,opts)` : finit une carte non vide ; option `recharge:true`. Cette aide répare les contrats et ouvre la pile suivante.
- Le joueur de `tools/mesure-management.js:34–67` porte déjà `mgmtPredecesseurSoiree` ; ce n'est pas un parcours de spectateur. Ne modifier ni recopier ce joueur.
- Corrections démo exécutables : `tests/mgmtSoireeReprise.test.js:19–82` (reprise/traces), `tests/mgmtLendemainDemo.test.js:16–36` (lendemain/finance), `tests/mgmtSoireeShow.test.js:29–117` (ordre, gestes, rejeu).
- Référence démo locale : `docs/BRIEF-06-10-LOT-11-LA-SOIREE-ET-LE-COMBAT.md:8–31,42` ; son ancien choix « lendemain seulement si touchés » est dépassé par la correction explicitement codée ci-dessus.

## 4. Ce qui change
**Tranche de non-régression uniquement : aucun fichier de production à modifier.** Les corrections de soirée sont déjà présentes ; T5 vérifie leur combinaison avec l'héritage.
- Ajouter `tests/mgmtSuiteHeritee.test.js`, ancre `MONDE_LOT5_T5_TESTS`, harnais `newGameWindow({runMain:true})`, fermeture des fenêtres dans `finally`/nettoyage de test.
- Helpers locaux nouveaux, avec ces JSDoc :
  - `partie()` : `/** Crée une partie Split déterministe avec trois soirées de passé et aucune soirée joueur. @returns {Window} Fenêtre du harnais. */`
  - `completer(win)` : `/** Complète la carte héritée sans réparer les contrats ni jouer la soirée. @param {Window} win Fenêtre du jeu. @returns {void} */`
- `completer` ferme les affaires de fixture (`status='closed',decision='ignored'`, `m.open=null`), comme l'aide existante, sans effacer les faits/demandes/promesses.
- Compléter uniquement les places manquantes par `mgmtBookMain` : catégories dans l'ordre de `mgmtCartRows`, rotation comme l'aide, plafond **80 essais**, candidats `mgmtSelectable` ET non libres ET `mgmtContratRestants>0`. Choisir les deux premiers compatibles, sans RNG supplémentaire.
- Valider ensuite la proposition ouverte `leila_bulk` par `mgmtDecide(m,id,'validate')`. Exiger principale=5, préliminaires=4 et `mgmtAgendaPret===true` ; jamais effacer suspension, renouveler ou signer un contrat pour faire passer ces assertions.
- Désactiver les retraits aléatoires **dans les seules fixtures T5**, après génération : `mgmtRetraitProb=function(){return 0;}`. Ne pas modifier les blessures du moteur.
- `package.json` : ajouter ce seul fichier aux listes explicites `test` et `test:watch`. Il reste rapide, donc aucun ajout à `LENTS`.
- Aucun autre helper global, aucune signature de production, aucun changement de cache/index/service worker nécessaire.

## 5. Sauvegarde
**Non : `MGMT_SAVE_VERSION` reste 18.** Aucun nouveau champ, migration ou durcissement de validation.
Utiliser `saveMgmt`, la lecture validée existante et `CL.mgmtEnter(1)` pour tester la reprise ; `lastEvent.vu` est déjà persistant.
Vérifier `validateMgmt===true` avant lancement et après reprise/fin ; ne pas recréer la carte héritée au chargement.

## 6. Textes
Aucun ; aucune commande à `@ecrivain`. Réutiliser tous les libellés existants ; aucun commentaire, pronostic ou réaction nouveau.

## 7. Écran
Aucun écran ni geste ajouté ou modifié. Les tests traversent les écrans existants ; aucune nouvelle planche requise.
Ne pas ajouter les présentations/dossiers absents : les décisions finales T3 ont reporté ces dépendances. Ne pas faire passer un remplissage technique pour une preuve du parcours dossiers.

## 8. Tests
Fichier : `tests/mgmtSuiteHeritee.test.js`. Tous partent de **20261008, Split, 3 soirées de passé, cycle=4, J=0, 0 soirée joueur**, sauf comparaison en deux fenêtres.
1. `Monde lot 5 T5 — la première soirée conserve les paires héritées et leur ordre de passage` : photographier paires héritées/contrats avant `completer`, tous restants>0 ; compléter, photographier les 5 paires main et les 4 prelim, puis `CL.mgmtCalendrierJouer()`. Écran=soirée, événements=4, soirées joueur=1, cycle=4, jour=35, prochaine date consommée une fois, dernière faite à J35. Exactement 9 nouvelles traces : les 4 prelim dans leur ordre puis les 5 main en ordre inversé ; chaque paire héritée exactement une fois ; programme=ces traces, aucune trace nulle ; carte vide, validation vraie.
2. `Monde lot 5 T5 — la provenance ne change ni le combat ni la recette` : deux fenêtres issues du même état complété et du même SEED ; dans la seconde supprimer seulement `herite` des combats avant lancement. Lancer par la même porte ; JSON complet de `G.mgmt` après lancement et SEED identiques, événements=4 dans les deux. Ne pas comparer seulement le vainqueur.
3. `Monde lot 5 T5 — regarder passer et revoir ne rejouent pas la première soirée` : après lancement, commencer ; regarder le premier combat, passer à la décision et revenir, passer le suivant, revoir le premier puis revenir. Index final=2, événements=4, cycle=4, traces/finance/contrats et SEED identiques au départ de la consultation. Comparer le JSON entier de la partie en neutralisant **seulement** `lastEvent.vu` dans les copies ; vérifier séparément `vu===2`. Utiliser les portes réelles `mgmtSoRegarder`, `mgmtCbPasser`, `mgmtCbRetour`, `mgmtSoPasser`, `mgmtSoRevoir`.
4. `Monde lot 5 T5 — reprendre la première soirée mène au lendemain puis aux résultats` : après lancement, commencer et passer 3 combats ; sauver, photographier JSON/SEED, vider `G.mgmt`, réinitialiser `MGMT_SOIREE=mgmtSoireeNeuve(0)`, `CL.mgmtEnter(1)`. Écran=soirée, index=vu=3, cycle=4, événements=4, JSON et SEED inchangés ; toutes les traces retrouvées. Passer les 6 restants ; fin via `CL.mgmtSoFin` → Lendemain sans avance de cycle ; `CL.mgmtLendemainResultats` → Résultats, cycle=5, événements=4, joueur=1, soirée non en cours, validation vraie. Une autre copie/fixture avec `lastEvent.touched=[]` doit aussi passer au Lendemain ; ne pas exiger une double activation de sa sortie hors écran.
5. `Monde lot 5 T5 — le joueur automatique finit la carte héritée avec une reprise` : photographier les paires et contrats **avant** l'aide ; `jouerSoirees(win,1,{recharge:true})===1`, événements=4, joueur=1, cycle=5 ; exactement 5 nouvelles traces main, chaque paire héritée une fois, validation vraie. L'aide prouve le test du brief l.277, pas la gestion économique ni les dossiers.
Tests du brief l.273/276 (cartes valides/différentes) = T1, l.275 (liens d'archive) = T2 ; l.274 (dossiers) reporté par décision T3. Les conserver, ne pas assouplir ni dupliquer les matrices.

## 9. Vérification
- Ciblée : `node --test tests/mgmtSuiteHeritee.test.js tests/mgmtCarteHeritee.test.js tests/mgmtSoireeReprise.test.js tests/mgmtSoireeShow.test.js tests/mgmtLendemainDemo.test.js`.
- Puis `npm run check:rapide` et `node tools/verif-versions.js`. Pas de mesure Monte Carlo ni de mesure management : aucune règle ni performance nouvelle.
- Fin chiffrée : **5/5 tests T5 verts**, **9 traces** pour la première soirée, **1** soirée joueur, **0** combat hérité perdu/dupliqué, **0** simulation pendant la consultation/reprise, **0** échec ciblé/rapide.
- Fin de lot : `npm run check` complet par `@verif` ; matrices lentes existantes à part, plafond fixé par T2 **2 graines × 8 organisations = 16 créations par matrice**, jamais 160 ni commande bloquante >100 s pour ces matrices.
- Contrôles navigateur T4 à 1280/1440/1920 px réservés à Claude au bilan (acceptation T4 finale), pas une nouvelle obligation visuelle T5.

## 10. Hors périmètre
Tout code du jeu, moteur, UI/CSS, textes, sauvegarde, contrats, promesses, politique du prédécesseur, dossiers/présentations et corrections démo non liées à la soirée.
Pas de fusion de dépendances, réécriture des six ans, second simulateur ou réparation des anciens tests lents dans cette tranche.

## 11. Pièges
- Ordre vérifié : `index.html:1135,1144,1161,1165,1177–1180` : agenda, ancien écran soirée, contrôleur, calendrier, show, combat, cadre soirée, cadre lendemain. Le harnais charge cet ordre ; les cadres remplacent les anciens écrans.
- `jouerSoirees` ouvre déjà la pile suivante : ne pas l'utiliser pour préparer un test de reprise/fin UI. Le remplissage local ne joue rien.
- `MGMT_SOIREE.index` écrit `lastEvent.vu` et sauvegarde : « aucune mutation de consultation » ne veut pas dire JSON strictement identique avec cet index inclus.
- `mgmtRunEvent` calcule tout au lancement et sauvegarde ; regarder n'appelle jamais le moteur. La marque `herite` ne se transmet pas aux traces.
- `CL.mgmtCalendrierJouer` peut revenir à l'Accueil sur retrait ; d'où l'isolation explicite des retraits dans les fixtures, pas un contournement en production.
- Scope global partagé ; pas de `Math.random`, pas de reseeding entre lancement et reprise, pas de cache de fenêtre entre tests. `esc()` et rendus existants inchangés.
- `@eclaireur` sollicité, indisponible (`Subagent depth limit reached (1)`) ; recherche ciblée et passages décisifs lus directement, aucun résultat délégué revendiqué.

## 12. Décisions et questions
- **Tests seuls** : défaut le plus simple conforme à « suite inchangée » ; les corrections nécessaires sont déjà codées et testées, aucune règle nouvelle justifiée.
- **Une graine, passé court, Split** pour cette intégration ; les huit organisations/six ans appartiennent aux matrices existantes, inutile de multiplier la simulation pour un déroulé commun.
- **Aucune réparation de contrat dans le parcours UI** : prouve l'héritage réel sans masquer un défaut ; l'aide automatique conserve son contrat historique, explicitement limité au test 5.
- **Reprise à l'index 3 et fin au cycle 5** : mêmes repères que les tests démo existants, sans seuil arbitraire ni scénario d'auteur.
- Questions pour Anthony : **aucune**.
