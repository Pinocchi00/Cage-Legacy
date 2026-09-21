# Cage Legacy — Audit du mode management

*Audit du 17/09/2026, état du dépôt au commit `35ca7de`.*

## Résumé

Le socle est solide, mais le mode management actuel construit le jeu que tu viens d'abandonner. Aujourd'hui, le joueur ne booke aucun combat lui-même : il valide ou refuse les cartes de Leïla. Le style d'un combattant n'existe pas : à cause d'un bug, deux adversaires ont presque toujours le même style, et ce style change à chaque soirée. La soirée ne se regarde pas, elle s'affiche en quatre lignes. Enfin, chaque agent qui ouvre le dépôt est automatiquement briefé sur l'ancienne direction.

La bonne nouvelle : le moteur de combat contient déjà ce que la vision demande. Il distingue huit styles de façon mesurable et produit des moments narratifs round par round. Le mode management ne s'en sert simplement pas.

## Méthode

- **État audité :** branche `main`, commit `35ca7de` du 15/09/2026 (merge du lot 3a).
- **Lu en entier :** `mgmt-data.js`, `mgmt-bureau.js`, `mgmt-screens.js`, tous les documents de `docs/`, `AGENTS.md`, `CLAUDE.md`, `opencode.json`, la liste des tests du mode.
- **Lu en partie :** `engine-combat.js` (styles, résultat d'un combat), `engine.js` (génération des combattants).
- **Exécuté :** `npm run check` (241 tests : 235 verts, 6 ignorés, 0 rouge), plus des vérifications ciblées dans le vrai code du jeu pour les constats marqués **vérifié**.

## Mise à jour du 17/09 au soir

Le code n'a pas bougé depuis l'audit : tous les constats restent valables. Ce qui a changé, ce sont les décisions, et elles rendent plusieurs points encore plus urgents.

- **Les visuels sont tranchés : aucun portrait, aucune silhouette.** Le jeu repose sur la typographie, les schémas et l'arène. Cela supprime le poste de travail le plus lourd et rend la lisibilité du combat critique.
- **Le combat se regarde de trois quarts, en semi-3D, avec des pions à plat.** Octogone à l'échelle, grillage, arbitre dans la cage, phases lisibles, juice proportionnel, texte réservé aux moments clés. Prototype jouable validé.
- **Les combattants s'adaptent en cours de combat**, et le coin donne une consigne entre les rounds qui change leur comportement.
- **Le réalisme est chiffré** : une décision toutes les 4 à 9 secondes, précision autour de 45 %, 1 à 6 amenées au sol par tranche de 15 minutes, finitions par KO, TKO, soumission, arrêt médical ou décision de trois juges.
- **La direction artistique est fixée** : fond prune chaud, jaune en couleur principale, rouge pour le danger, typographies condensées italiques, motif octogonal, tapis clair dans l'arène.
- **Dix écrans sont maquettés** : accueil, semaine, fiche combattant, booking, soirée, lendemain, classements, organisation, Panthéon, carrière.

**Mode d'emploi :** chaque constat porte un numéro (X, C, D, B, G, M, T). Commente-le avec ta décision : retirer, modifier ou garder. Rien n'a été modifié dans le dépôt.

## 1. Les trois constats bloquants

Tant que ces trois points restent en l'état, tout ce qui sera construit par-dessus partira dans la mauvaise direction.

### X1 — Le joueur ne booke aucun combat

**Constat.** La seule carte du jeu compte 4 combats, tous proposés en bloc par Leïla. Le joueur peut valider, écraser ou « échanger » un combat, mais l'échange remplace le combat par une paire tirée au hasard : le joueur ne choisit jamais qui affronte qui. Il n'existe pas de carte principale. La réplique de Leïla elle-même parle de « carte préliminaire » et de sa hâte de voir la carte principale, qui n'existe nulle part.

**Où.** `mgmt-data.js` (`MGMT_CARD_SIZE=4`) ; `mgmt-bureau.js` (`mgmtNewBulkAffair`, `mgmtSwapFight` qui appelle `mgmtPickBulkPair`).

**Vision.** Le joueur trouve des combattants qu'il apprécie et les booke. Leïla gère la carte préliminaire, le joueur la carte principale (environ 5 combats).

**Proposition.** Garder la carte de Leïla comme carte préliminaire, et construire une carte principale composée par le joueur, combattant par combattant.

### X2 — Le style d'un combattant n'existe pas (bug) — vérifié

**Constat.** Un combattant du mode management n'a pas de style enregistré : son profil de combat est régénéré à chaque soirée. Le lot 3a demandait de le régénérer à partir d'une graine propre à chaque combattant, mais cette étape manque dans le code. Résultat : tous les combattants générés au même instant reçoivent le même style.

- Trois combattants tirés au même moment : sambo, sambo, sambo.
- Soirée test de 4 combats : MMA contre MMA, sambo contre sambo, sambo contre sambo, muay-thaï contre muay-thaï.
- Même combattant, autre graine : il passe de sambo à lutteur.

**Où.** `mgmt-bureau.js`, `mgmtCombatProfile` (il sauvegarde et restaure la graine mais n'appelle jamais `setSeed(mgmtHashId(f.id))`, contrairement au §3.2 du lot 3a).

**Vision.** Le style est une façon de combattre, et chaque combattant se remarque immédiatement par sa façon de combattre.

**Proposition.** Attribuer à chaque combattant un style et un profil de combat stables et sauvegardés, qui évoluent seulement par le jeu. Ajouter le test prévu par le lot 3a : même combattant, même profil, à chaque appel.

### X3 — Les agents sont briefés sur l'ancienne direction

**Constat.** `opencode.json` charge automatiquement le cahier des charges, ses deux addendums et les six voix au début de chaque session d'agent. `AGENTS.md` précise que le cahier des charges « fait foi ». Ces documents décrivent la règle du bureau, la pile d'affaires comme écran principal et le quota de 3 à 5 décisions. La page de vision n'est pas dans le dépôt.

**Où.** `opencode.json` (`instructions`), `AGENTS.md` (« Documents de référence »).

**Proposition.** Exporter la page de vision dans `docs/`, la placer en tête des instructions et d'`AGENTS.md` comme document qui prime, et marquer dans le cahier des charges les sections remplacées (voir D1 à D3). C'est le correctif le moins cher, et il conditionne tous les autres.

## 2. Ce qui contredit la vision dans le code

- **C1 — Accepter une proposition de Leïla ne booke rien (vérifié).** Quand Leïla demande de placer un combat « dans les plus gros combats » et que le joueur accepte, les deux combattants montent de niveau, mais rien n'entre sur la carte (0 combat avant, 0 après). *Où :* `mgmtDecide`, action `accept`. *Proposition :* ce combat doit entrer sur la carte principale (dépend de X1).
- **C2 — La soirée ne se regarde pas.** Elle se calcule d'un coup dès que la dernière affaire est traitée, puis s'affiche en quatre lignes par combat : noms, vainqueur, famille de méthode, round. Le code interdit explicitement le détail du combat, les statistiques et toute étiquette descriptive. *Où :* `mgmtRunEvent`, `scr_mgmt_soiree` (ancre `MGMT_LOT3A_SOIREE`). *Vision :* un mélange de récit, de moments clés et de vue animée ; savoir qui a gagné, de quelle façon, et ce que ça a changé. *Proposition :* brancher la soirée sur le récit et les moments que le moteur produit déjà (voir G1, G2).
- **C3 — Les combats ne laissent aucune trace.** Seuls le vainqueur, la famille et le round sont gardés, et uniquement pour la dernière soirée : la suivante les écrase. Le déroulé (`res.log`), les statistiques (`res.stats`) et le geste de finition sont jetés. Impossible de revoir un combat ou de raconter une carrière. *Où :* `mgmtRunEvent`, `m.lastEvent`. *Proposition :* un historique des combats par combattant.
- **C4 — Le monde est figé (vérifié).** Le roster est généré une fois et plus aucun combattant n'entre ensuite. Personne ne vieillit : après 10 soirées, l'âge est identique. Les retraités ne sont jamais remplacés : 5 sur 44 après 10 soirées dans le test. *Où :* `mgmtNewRoster`, aucun mécanisme de vieillissement ni d'arrivée. *Vision :* des carrières qui montent et déclinent (Guy Montagné), des pépites qui apparaissent.
- **C5 — Les catégories sont vides (vérifié).** 40 à 60 combattants répartis au hasard sur 12 catégories. Dans le test : 1 poids moyen, 2 poids légers, 2 mi-moyens. Aucun classement, aucun top 15, aucune ceinture. *Où :* `mgmtNewRoster`. *Vision :* toutes les catégories de l'UFC, avec des duels à l'entrée du top 15.
- **C6 — Rien n'existe hors de Split.** Pas d'autres organisations avec des combattants, pas de combattants libres, pas de petites organisations. Les façons de découvrir un combattant décrites dans la vision (un 14-0 ailleurs, une pépite dont parle la presse, un combattant qui rêve de signer chez nous) sont impossibles. *Où :* `mgmt-bureau.js` (voir aussi QO-2 et QO-3).
- **C7 — L'attachement est un compteur affiché.** Un combattant passe « Nom », « Dossier » puis « Attaché » après trois interactions. Valider une carte compte comme interaction pour les 8 combattants d'un coup : au bout de trois validations, un combattant que le joueur n'a jamais regardé devient « Attaché ». Ce libellé s'affiche sur chaque fiche. *Où :* `mgmtPromote`, `mgmtLineCard`, `MGMT_LEVEL_LABELS`. *Vision :* on s'attache à une façon de combattre, quand le joueur remarque quelqu'un. *Proposition :* retirer l'affichage du niveau et revoir ce qui le fait monter.
- **C8 — La fiche d'un combattant est vide.** Nom, bilan, âge, catégorie et niveau, rien d'autre : ni style, ni historique, ni raison de se battre. Le commentaire du code annonce des « statistiques complètes » au déroulé, mais n'affiche rien de plus. Un test verrouille ce vide (« niveau 1, rien d'autre »). *Où :* `mgmtLineCard`, `mgmtBulkFightHtml`.
- **C9 — Leïla compose ses combats sans regarder les styles.** Une paire est choisie sur la catégorie et l'écart de nombre de combats. Après des écrasements, elle peut même proposer des combats entre deux catégories. *Où :* `mgmtPickBulkPair`. *Vision :* le matchup crée l'histoire.
- **C10 — Tous les combats durent 3 rounds.** Pas de main event ni de combat pour le titre en 5 rounds. *Où :* `simulateFight(A,B,3)` dans `mgmtRunEvent`.
- **C11 — La mémoire affiche des compteurs.** La colonne « Mémoire » affiche par exemple « tu as écrasé 3 de ses cartes, dont 2 de suite », soit un journal de l'interface plutôt qu'une histoire. *Où :* `mgmtMemoryLines`. *Vision :* jamais un tableur.

## 3. Ce qui contredit la vision dans les documents

Ces documents sont lus par les agents (voir X3). Un document faux produit du code faux, même avec un bon prompt.

- **D1 — La règle du bureau est toujours la règle.** Le cahier des charges décrit un combattant qui n'existe en profondeur qu'en croisant le bureau (§3), une pile d'affaires comme écran principal (§4.1), 3 à 5 décisions par soirée (§4.2, §9). L'addendum fixe cinq déclencheurs « exhaustifs » (§4). *Où :* `docs/CDC-MODE-MANAGEMENT.md`, `docs/CDC-MODE-MANAGEMENT-ADDENDUM.md`. *Vision :* règle abandonnée, le joueur a un vrai travail.
- **D2 — Le joueur ne choisit que deux combats.** Le cahier des charges limite le joueur au main event et au co-main, avec des combattants du roster uniquement (addendum §10). *Vision :* le joueur gère toute la carte principale, et les décisions du 14/09 ouvrent déjà le recrutement extérieur.
- **D3 — Interdiction de raconter.** L'addendum 2 pose que les voix « ne racontent rien » (§1) et interdit toute étiquette descriptive après un combat (§6). Le lot 3a applique cette règle à l'écran de soirée. *Vision :* le storytelling entre les combats, les finitions, les commentaires de la presse. C'est la contradiction la plus directe avec la vision.
- **D4 — Les priorités de l'écosystème sont inversées.** Le cahier des charges construit le mode autour de six personnages de l'institution (patron, agent, diffuseur, médecin, vétéran, adjointe), et met le journaliste « en réserve pour la v2 » (§5). *Vision :* d'abord la voix du monde (presse et callouts) et les camps (salle et coach).
- **D5 — Les camps semblent interdits.** « Pas de construction de salle, pas d'entraînement de combattants par le joueur » (§8). Ce n'est pas contradictoire si les camps sont des éléments du monde et non gérés par le joueur, mais un agent peut lire l'interdit au sens large. *Voir T6.*
- **D6 — Le guide d'architecture est périmé.** `CLAUDE.md` impose « mobile-first » alors que le mode vise le PC. Il ignore les fichiers du mode management, annonce 116 tests (241 en réalité) et une version de sauvegarde 4 (5 en réalité). Un agent qui s'y fie part sur de fausses bases.
- **D7 — L'état du 14/09 est dépassé.** `docs/ETAT-14-09.md` décrit deux tests rouges qui ont depuis été réécrits. Sans objet, mais trompeur.

## 4. Bugs et écarts indépendants de la vision

- **B1 — Un texte de travail s'affiche en jeu.** L'écran du lendemain montre au joueur « [RÉPLIQUE MANQUANTE — Clara : annonce une blessure] » et ses variantes. Le lot 1 prévoyait que ces emplacements ne s'affichent jamais tels quels. *Où :* `mgmtTouchedCard` dans `mgmt-screens.js`.
- **B2 — Le lot 3a a été fusionné sans ses tests ni son calibrage.** Le lot demandait `tests/mgmtSoiree.test.js`, un script Monte Carlo et son rapport (§8), et `LOT-3A-RAPPORT.md` (§12). Aucun n'existe, et aucun test ne couvre le traumatisme, le profil de combat ou la soirée. Le test « même profil à chaque appel » aurait attrapé X2. Les cibles de blessures et de fins de carrière n'ont donc jamais été mesurées.
- **B3 — Les tests verrouillent l'ancienne direction.** Les 76 tests du mode management (`mgmtBureau.test.js`, `mgmtCard.test.js`) fixent par exemple une carte de 4 places, l'attaché après trois bookings, ou une fiche réduite au nom et au bilan. Changer de direction les fera passer au rouge. **Règle à donner aux agents :** un test rouge qui décrit l'ancienne direction se réécrit sur ta décision, il ne se « répare » pas pour repasser au vert.
- **B4 — Un fichier sans rapport dans le dépôt.** `docs/plan-implantation-qualiopi.docx` a été ajouté au lot 1 et n'a aucun lien avec le jeu. Il est public sur GitHub. *Voir T7.*
- **B5 — Six tests ignorés.** Ils attendent les sorties de carte incomplète décidées le 14/09 (remonter un prélim, short notice, combattant libre, découvert). Le premier suppose une carte préliminaire et une carte principale : il dépend de X1.

## 5. Ce qui va dans le bon sens

À garder. Plusieurs pièces maîtresses de la vision existent déjà.

- **G1 — Le moteur distingue vraiment les styles.** Huit styles avec des profils mécaniques différents (volume, puissance, soumissions, clinch, sol). Un outil vérifie qu'on peut reconnaître le style d'un combattant à partir des seules statistiques d'un combat. *Où :* `STYLE_PROFILE` dans `engine-combat.js`, `tools/style-fingerprint-classify.js`.
- **G2 — Le moteur produit déjà des moments à raconter.** Chaque combat génère 4 à 8 moments par round, un déroulé, des statistiques, le geste de finition et son récit, les cartes des juges. L'arène animée du mode carrière lit déjà ces moments. *Où :* `simulateFight`, `ui-09-arena.js`.
- **G3 — Le corps garde la mémoire des combats.** Un traumatisme caché qui ne redescend jamais, un menton et une résistance qui s'usent, des suspensions et des fins de carrière médicales. À garder, et à rendre perceptible par les combats et la presse plutôt que par un chiffre.
- **G4 — Aucun chiffre ni jauge à l'écran.** Pas de note de combat, pas de note de carte, pas d'impact chiffré affiché. Conforme à « jamais un tableur Excel ».
- **G5 — Leïla est déjà l'adjointe des débuts de carte.** Sa proposition en bloc, le coût de l'écrasement (elle cesse de prévenir) et sa voix collent à la décision « Leïla gère la carte préliminaire ».
- **G6 — Les textes de l'auteur sont protégés du générique.** Répliques reprises mot pour mot, et règle « un emplacement vide vaut mieux qu'une phrase générique ».
- **G7 — Les raisons de se battre changent les décisions.** Nécessité, passion, hasard, addiction, reconversion : chacune change la réponse à une proposition. Bonne base pour des combattants qui refusent, réclament ou font des callouts.
- **G8 — Le contexte de Split donne de vraies obligations.** Objectifs de saison du patron, légendes perdues visibles au classement mondial, rivalité Mukoku contre Saint-Roc coupée en deux organisations.
- **G9 — Les décisions du 14/09 sont documentées.** Les trois sorties de carte incomplète et le découvert sont écrits (LOT-3B) et attendent leur code.
- **G10 — Le socle technique est sain.** Tirages à graine, sauvegarde versionnée avec secours et migration, échappement systématique, 0 test rouge.

## 6. Ce qui manque

Ce que la vision demande et dont il n'existe aucune ligne de code dans le mode management.

- **M1 — La carte principale du joueur**, et la séparation entre carte préliminaire et carte principale.
- **M2 — Un style stable par combattant**, visible par sa façon de combattre et non par une étiquette.
- **M3 — Regarder un combat** : récit, moments clés et vue animée.
- **M4 — L'historique de chaque combattant** : ses combats, contre qui, comment, quand, pour pouvoir les revoir.
- **M5 — Classements, ceintures et combats de titre**, par catégorie, avec des combats en 5 rounds.
- **M6 — Un monde qui vit** : vieillissement, progression et déclin, nouveaux combattants, autres organisations, combattants libres, petites organisations où naît une pépite.
- **M7 — La voix du monde** : presse et callouts, commentaires du public et de la presse après une soirée, recommandations. Y compris la pression des combattants qu'on fait attendre : rien ne mémorise aujourd'hui depuis quand un combattant n'a pas combattu.
- **M8 — Les camps** : salles et coachs, et le changement de camp qui transforme une trajectoire.
- **M9 — Le recrutement** : short notice et combattants libres (décisions du 14/09, QO-2 et QO-3).

## 7. À trancher

Des décisions qui appartiennent à l'auteur. Aucun agent ne doit les prendre à sa place. T3 a été tranché le 17/09 ; les autres restent ouverts.

- [ ] **T1 — Le cahier des charges :** le réécrire à partir de la page de vision, ou le garder en marquant les sections remplacées ?
- [ ] **T2 — Les cinq autres personnages** (patron, agent, diffuseur, médecin, vétéran) : restent-ils au programme, et avant ou après la voix du monde et les camps ?
- [x] **T3 — Tranché le 17/09 :** la règle devient « ni note, ni barème, ni jauge ». Le jeu nomme les coups, les phases et les positions, et raconte les moments clés.
- [ ] **T4 — Qui écrit la presse et les callouts ?** `AGENTS.md` interdit aux agents d'écrire des répliques, mais la voix du monde demande beaucoup de textes. Piste déjà prévue dans l'addendum 2 : l'auteur écrit une poignée de formules, et c'est le contexte du combat qui les fait varier.
- [ ] **T5 — Le Duel entre amis :** `docs/ETAT-DES-LIEUX.md` le classe « à jeter », alors qu'il avait été gardé le 06/09. Un agent pourrait le supprimer en suivant ce document.
- [ ] **T6 — Les camps :** éléments du monde que le joueur observe et subit, sans gérer d'entraînement ?
- [ ] **T7 — Le fichier Qualiopi :** le retirer du dépôt ?
- [ ] **T8 — La taille du monde :** combien de combattants sous contrat, et combien par catégorie pour qu'un top 15 ait un sens ?

## 8. Ordre proposé

1. **Lot 0, les documents (X3, D1 à D7).** La vision, la direction artistique et les règles de l'arène entrent dans le dépôt et priment sur le cahier des charges, dont les sections périmées sont marquées. Aucun code.
2. **Lot 1, le style stable (X2, B2).** Chaque combattant reçoit un style et un profil de combat sauvegardés, avec les tests que le lot 3a n'a jamais livrés.
3. **Lot 2, la carte principale (X1, C1, M1).** Le joueur compose lui-même environ cinq combats, et la carte de Leïla devient les préliminaires.
4. **Lot 3, l'arène (C2, C3, M3, M4).** La soirée se regarde en vue de trois quarts comme le prototype, et chaque combat laisse une trace consultable.

Ces quatre lots forment la tranche verticale : une soirée que le joueur compose lui-même, puis qu'il regarde. Viennent ensuite le lot 4, la peau du jeu, où les écrans maquettés remplacent l'habillage actuel en commençant par la semaine et la soirée, et le lot 5, le monde qui parle : classements et ceintures, presse et callouts, camps, recrutement (M5 à M9).

## Limites de cet audit

- Il couvre le mode management et ses documents. Le mode carrière n'a pas été audité ligne à ligne.
- Il compare un texte et du code. Il ne juge ni le ressenti, ni l'interface, ni la qualité artistique : ça, c'est le test de jeu.
- Les vérifications par exécution portent sur quelques cas, pas sur une campagne de mesures.
- Il décrit l'état du dépôt au commit `35ca7de`. Tout travail poussé depuis n'est pas pris en compte.
