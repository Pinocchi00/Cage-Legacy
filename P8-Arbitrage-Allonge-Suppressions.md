# P8 — Solde de l'addendum P7, suppressions, et rôle de l'adaptabilité

**Statut : LOT 6 livré** (suppressions, cf. `tools/reports/baseline-P8.md` pour la nouvelle référence chiffrée). Lots 7 à 10 restants, non commencés.

Plan en **cinq lots séquentiels**. Chacun devient un prompt distinct dans une session neuve. Ne les fusionne pas : les règles communes de P7 (§ « Règles communes aux quatre lots ») s'appliquent intégralement ici — une PR par lot, ancre systématique, avant/après sur 12 000 combats, `npm run check` vert, déterminisme seedé non négociable.

Ordre imposé : **L6 → L7 → L8 → L9 → L10**. L6 retire du comportement et doit donc établir une nouvelle référence avant que L7 à L9 n'en ajoutent. L10 règle un correctif d'écart et doit passer en dernier : il n'a de sens qu'une fois que tous les écarts qu'il corrige existent.

---

## État des lieux vérifié sur `main`

Les ancres `P7_L1_*` à `P7_L5_*` sont en place. L'addendum P7 est consommé aux exceptions suivantes, toutes vérifiées dans le code, pas déduites :

- **Point 1 (allonge)** — non fait. `reachEdge()` (`engine.js:421`) a toujours exactement deux appelants : `engine-combat.js:413` (propension au grappling) et `engine-combat.js:1575` (départage final). Jamais dans la mécanique de frappe.
- **Point 2 (arbitre)** — non fait. Aucune relance debout, aucune faute, aucun retrait de point, aucune disqualification. Le mot « arbitre » n'apparaît que dans du texte de log.
- **Point 3 (taxonomie de frappes)** — non fait. Coudes et genoux n'existent que comme **noms** de prises signature dans les tables de `engine-combat.js:1427` et `:1446`. Aucune mécanique.
- **Point 5 (garde orthodoxe/gauchère)** — non fait, zéro occurrence.
- **Point 6 (blessures en combat)** — non fait.
- **Point 7 (examen médical entre les rounds)** — non fait. L'arrêt médical existe (`P7_L2_ARRET_MEDICAL`), l'examen non.
- **Point 9 (décision majoritaire)** — non fait, et devenu contradictoire : `JUGES_10PT_VERDICT` (`engine-combat.js:1305`) calcule bien un vote majoritaire, mais `engine-combat.js:1312` reste `method: unanimous ? 'Décision' : 'Décision partagée'`. Le moteur sait ce qu'est un 2-1, l'affichage ne sait pas le dire.
- **Point 10 (dos à la cage)** — non fait, zéro occurrence.
- **Point 11 (rythme par round)** — non fait.

**Régression déjà active** : le lot 3 a rendu le contrôle au sol rentable (`GROUND_POS`, `engine-combat.js:276-281` — `sideControl` et `mount` ont `standupOk:false` et un `ctrlMult` élevé). Le seul relevé possible vient du combattant de dessous depuis la garde. Un contrôle stérile n'est donc jamais sanctionné, exactement ce que l'addendum annonçait. C'est le point 2 qui le corrige, et c'est pour ça qu'il passe avant tout le reste.

**Dette d'instrumentation** : `tools/reports/` ne contient que `baseline-P7.md`. Aucun rapport après-lot n'est versionné, donc rien dans le dépôt ne prouve les critères d'acceptation de L2, L3 et L4. Chaque lot ci-dessous versionne son rapport.

---

## LOT 6 — Suppressions et remise à zéro de la référence

> Ce lot ne fait qu'enlever. Un seul des retraits touche l'issue des combats (l'ajustement `adaptability` du coin), mais cela suffit à invalider la référence existante : ce lot en produit une nouvelle.

### 6.1 Supprimer le coin entre les rounds

Retirer l'ancre `P7_L5_COIN_ENTRE_LES_ROUNDS` (`engine-combat.js:1221-1255`) **en entier** : les beats `phase:'bell'` et les `cornerPool`.

**Retire aussi l'ajustement d'attributs** qui vit sous cette ancre (`a.fightIQ += adaptA`, `a.footwork += adaptA*0.5`, et les deux symétriques côté B). Il est antérieur à l'ancre, qui n'avait fait qu'ajouter le log, mais la décision est de tout enlever : plus de coin du tout, ni visible ni invisible.

Conséquence à vérifier et à documenter dans la PR : `adaptability` ne gouverne alors probablement plus rien pendant un combat et redevient un simple terme dans le calcul d'overall. Cherche tous ses autres lecteurs en combat avant de conclure, et **dis-le explicitement** dans le rapport si c'est bien le cas — c'est un attribut affiché au joueur, décrit dans la fiche, et modifié par des événements de carrière (`engine-events.js:215`, malus de sparring). Un attribut vitrine est un problème de design à signaler, pas à corriger dans ce lot.

C'est le seul changement de ce lot qui touche réellement l'issue des combats. Isole sa mesure.

Le handler `applyBeat()` de `ui-09-arena.js:357` (`if(b.phase==='bell'){ ... }`) devient inatteignable puisque plus aucun beat `bell` ne sera émis. **Garde-le quand même** : une sauvegarde antérieure peut contenir un log qui en comporte, et le rejeu ne doit pas casser dessus. Signale-le en commentaire au lieu de le supprimer.

### 6.2 Supprimer les moments de bascule

Il n'y a plus aucun choix demandé au joueur pendant un combat. Retire l'ancre `V2-29` dans sa totalité :

- `BASCULE_MOMENTS` (`ui-09-arena.js:253`) et les quatre situations qu'il contient ;
- la détection en fin de round (`ui-09-arena.js:196-198`), `detectBascule()` (`:318`) et son plafond `ARENA.basculeCount >= 3`, `resolveBasculeOption()` (`:337`), `renderBasculeOverlay()` (`:345-353`) et l'aiguillage `if(ARENA.basculePending)` de `:242` ;
- `CL.pickBascule()` et `CL.continueAfterBascule()` (`ui-08-controller-arena.js:465-485`), l'ancre `CORRECTIF_BASCULE_RECOMPENSE_MORTE` et les effets de moral qu'elle pose (`G.f.morale +4 / -3`) ;
- la garde `|| ARENA.basculePending` dans `CL.nextRound()` (`ui-08:457`), qui n'a plus d'objet ;
- la lecture du réglage `G.settings.basculeEnabled` (`ui-09-arena.js:320`). **Ne retire pas la clé de `G.settings` ni de `validateState()` (`state/state-validation.js:86`)** : elle est là pour la compatibilité des sauvegardes, et son point d'accès joueur a déjà été supprimé par ailleurs (ancre `V3_REGLAGES_SUPPRIMES`, `ui-06-career-screens.js:341`). Cette ancre décrit en revanche un état périmé — elle parle encore de Gauntlet, de Faith et de `state.js` au singulier — donc réécris son commentaire, cf. §6.3.

**Quatre précautions.**

1. **La pause de fin de round reste.** L'écran « Fin du round N → Round suivant ▸ » (`ui-09-arena.js:244`) et toute la machinerie `roundPause` / `pauseOffset` / `resumeArenaPlayback()` ne font pas partie de ce système : c'est le rythme de lecture de l'arène. Ne les touche pas. Seul l'overlay de choix disparaît, la pause et son bouton restent.
2. **Le plan tactique d'avant-combat est conservé.** `scr_plan()`, `CL.choosePlan()`, la table `TACTICS` et les modificateurs `plan.*` de `engine-combat.js:384-389` restent en place, intacts. Ce lot ne touche qu'aux choix qui surviennent **pendant** un combat.
3. **L'effet réel est faible, mais il n'est pas nul.** Le combat est intégralement simulé avant que l'arène ne le rejoue, donc une bascule n'a jamais pu changer une issue — l'ancre `CORRECTIF_BASCULE_RECOMPENSE_MORTE` le documente déjà pour la bonification de bourse. En revanche le moral, lui, était réellement modifié, et le moral se propage à la carrière. Mesure la dérive sur une trajectoire de carrière complète, pas seulement sur des combats isolés.
4. **`attrLabel()` reste.** Elle est définie dans `engine.js:132` et utilisée par une dizaine d'écrans ; seule son utilisation dans l'overlay disparaît.

### 6.3 Purger les résidus de Gauntlet et de Faith

Ces symboles n'existent plus, seules leurs traces subsistent : `runCoachingRound`, `scr_coaching_round`, `G._arenaNext` (`ui-08:592-596`, dont la branche `G.screen=G._arenaNext||'result'` est morte), le paramètre `midFight` de `buildTimeline()` (`ui-09-arena.js:56`, ancre `CORRECTIF_RENDU_ROUND_PAR_ROUND`), et le commentaire de `ui-01-roster-matchmaking.js:36`.

Deux commentaires décrivent en plus une architecture qui n'existe plus et doivent être réécrits, pas seulement effleurés : `V3_REGLAGES_SUPPRIMES` (`ui-06-career-screens.js:341`, qui parle de Gauntlet, de Faith, de `scr_faith_fight_pending()` et de `state.js`) et le voisinage de `forceFightPaceForMode()` (`ui-08:42-49`), qui force `fightPace` par mode alors qu'il n'y a plus qu'un mode.

Supprime le code mort et **corrige les commentaires** plutôt que de les laisser décrire un système absent. Un commentaire faux coûte plus cher qu'un commentaire absent : c'est lui que la prochaine session lira comme une vérité.

### 6.4 Remettre la documentation d'aplomb

`CLAUDE.md` mentionne huit fois Faith et Gauntlet, alors qu'`index.html` ne charge plus que 23 scripts et qu'il n'existe plus ni `ui-04`, ni `state-faith/gauntlet/shop`, ni `data-faith-content.js`. Réécris `CLAUDE.md` sur l'architecture réelle, en repartant de la liste `<script>` d'`index.html` et non d'une supposition. Retire aussi les mentions du coin entre les rounds et des moments de bascule.

Les deux documents `P7-*.md` sont désormais des plans exécutés : déplace-les dans un dossier d'archive ou marque-les comme livrés en tête de fichier, avec la liste des points restants renvoyée vers ce document.

### 6.5 Nouvelle référence

Produis `tools/reports/baseline-P8.md`, même format et mêmes métriques que `baseline-P7.md`, sur 12 000 combats, après les suppressions. Inclus **la matrice 8×8 à overall égal** et les empreintes par style : c'est la référence de L7 à L9.

Le rapport doit aussi contenir, mesurés et non affirmés, les trois chiffres qui prouvent ou infirment les critères d'acceptation des lots P7 précédents : part des décisions partagées, écart-type des dégâts cumulés (p50/p90/p99/max), part des combats allant aux cartes.

### Critères d'acceptation du lot 6

- aucune référence résiduelle aux symboles supprimés, `npm run lint` vert sans exception ajoutée ;
- une sauvegarde produite avant ce lot se charge sans erreur et sans perte d'historique ;
- l'arène se joue de bout en bout sans blocage : la pause de fin de round et son bouton fonctionnent toujours, aucun combat ne reste figé sur un overlay qui n'existe plus ;
- un parcours complet de carrière passe dans le harnais, plan tactique compris ;
- réponse écrite à la question « `adaptability` a-t-il encore un effet en combat ? », avec la liste de ses lecteurs restants ;
- `baseline-P8.md` versionné, avec l'écart chiffré contre `baseline-P7.md` et l'explication de chaque dérive supérieure à 10 %.

---

## LOT 7 — Arbitre, cage et cartes

> Points 2, 9 et 10 de l'addendum. C'est le lot qui répare une régression active.

### 7.1 Arbitre

- **Relance debout sur inactivité.** Un temps de contrôle sans progression (ni frappes significatives, ni changement de position, ni menace de soumission) au-delà d'un seuil déclenche le retour debout. Le seuil doit dépendre de la position : un `mount` inactif est toléré plus longtemps qu'une `closedGuard` inactive, et `backControl` presque indéfiniment. C'est ce qui rend le contrôle stérile non rentable sans le rendre inutile.
- **Fautes.** Coup illégal (arrière du crâne, coup bas, cage grip), avec trois niveaux de conséquence : avertissement, temps mort de récupération pour le fautif subi, retrait d'un point. La probabilité dépend d'attributs déjà présents (`aggression`, `composure`, `fightIQ`) — n'invente pas d'attribut nouveau sans le dire.
- **Disqualification** comme méthode de victoire à part entière, remontée jusqu'à `f.history` et aux écrans, comme l'a été l'arrêt médical.

Le retrait de point doit traverser la notation : une victoire aux points peut s'inverser sur un point retiré. C'est le seul intérêt du mécanisme.

### 7.2 Dos à la cage

Ajoute l'adossement comme position, dans la même structure que `GROUND_POS` — pas un système parallèle. Elle doit être la porte d'entrée naturelle des amenées et de la lutte de cage, avec son propre profil de contrôle, de volume de frappes et de transitions. Le clinch au centre et le clinch contre la cage ne sont pas la même chose.

### 7.3 Vocabulaire complet des décisions

Remplace `engine-combat.js:1312` par le jeu complet : décision unanime, décision majoritaire (2-0-1), décision partagée (2-1), nul unanime, nul majoritaire, nul partagé. Le vote existe déjà dans `JUGES_10PT_VERDICT` ; il ne manque que la traduction en méthode.

Vérifie que `isDecisionLike()` couvre les nouvelles valeurs, et que les écrans de résultat, l'historique, le Panthéon et les analytics ne cassent pas sur une méthode inconnue. Ne renomme pas les valeurs existantes en base : une carrière chargée doit continuer d'afficher ses anciens combats.

### Critères d'acceptation du lot 7

- part des combats se terminant par une relance debout de l'arbitre à un ordre de grandeur crédible, sourcé ou assumé comme valeur de design ;
- temps de contrôle des lutteurs en baisse mesurable contre `baseline-P8.md`, sans que leur taux de victoire ne sorte de la bande 47-53 % à overall égal ;
- au moins un combat sur l'échantillon de 12 000 se terminant par disqualification, et au moins un renversement de décision par retrait de point, tous deux traçables dans le log ;
- répartition des six libellés de décision produite dans le rapport, avec les décisions partagées toujours sous 15 % du total des décisions.

---

## LOT 8 — Allonge, gabarit et garde

> Points 1 et 5. Les deux facteurs de matchup purement physiques, indépendants du style.

### 8.1 L'allonge entre dans les échanges

`reachEdge(A,B)` existe et renvoie déjà un écart borné à ±6. Il doit désormais intervenir dans la mécanique de frappe à distance :

- celui qui a l'allonge touche plus souvent à distance longue et se fait toucher moins ;
- fermer la distance contre une allonge supérieure a un coût — passage sous les coups, exposition à l'entrée ;
- l'avantage s'inverse au clinch et au corps à corps, où l'allonge devient une gêne.

Le gabarit (taille, densité) doit entrer dans la même mécanique, distinctement de l'allonge : `engine.js:271-275` découple déjà l'allonge de la taille via l'indice de singe et pose les tags `allonge démesurée` et `allonge hors-norme`. Ces tags doivent enfin avoir un effet.

L'addendum désignait ce point comme le plus rentable des trois de son lot 5 : peu coûteux, la primitive existe, et il crée une dimension de matchup qui ne dépend d'aucun style. C'est aussi le seul qui donne un sens aux mensurations déjà modélisées par division.

### 8.2 Garde orthodoxe et gauchère

Ajoute une stance par combattant, distribuée de façon plausible (les gauchers sont minoritaires et surreprésentés en MMA — dis quel chiffre tu retiens et sur quelle base). Un affrontement de gardes opposées change la géométrie : angles d'ouverture différents, main arrière plus courte, low kick extérieur plus disponible, avantage au pied avant.

L'effet doit être lisible dans les statistiques sans être décisif — une stance ne fait pas gagner un combat, elle décale les profils de frappe.

### Critères d'acceptation du lot 8

- à overall égal et style égal, un écart d'allonge marqué produit un écart de taux de victoire net et monotone — donne la courbe, pas un seul point ;
- l'avantage s'inverse effectivement au clinch, mesuré séparément ;
- écart mesurable et documenté sur les affrontements de gardes opposées, sans que la stance ne sorte aucun style de la bande 47-53 % ;
- matrice 8×8 à overall égal inchangée dans ses grandes lignes contre `baseline-P8.md` : ce lot ajoute un axe physique, il ne doit pas réécrire l'équilibre des styles.

---

## LOT 9 — Taxonomie de frappes, blessures, médecin, rythme

> Points 3, 6, 7 et 11. Regroupés parce qu'ils s'enchaînent : les coudes ouvrent les coupures, les coupures appellent le médecin, les blessures et le rythme donnent sa texture au round.

### 9.1 Taxonomie de frappes réelle

La frappe est aujourd'hui un scalaire réparti a posteriori sur une zone. Ajoute des **types** de frappe, chacun avec sa disponibilité par position, son profil de dégâts et sa propension à ouvrir une coupure : poing (direct, crochet, uppercut), coude, genou, kick (jambe, corps, tête), coup tournant, front kick.

Contraintes :

- les coudes sont l'ouvreur principal de coupures et ne sont disponibles qu'au clinch et au sol ;
- les genoux au corps sont l'arme du clinch ;
- les coups tournants sont rares, coûteux en cas d'échec, et à haut potentiel de finition.

Les noms de prises signature déjà présents (`engine-combat.js:1427`, `:1446`) doivent être **branchés** sur cette taxonomie plutôt que tirés indépendamment : une signature « coude du chirurgien » ne doit sortir que sur une frappe qui est réellement un coude.

### 9.2 Blessures en combat

Main cassée, genou lâché, arcade fermée. Une blessure dégrade une capacité précise pour le reste du combat — pas un malus global — et peut, dans les cas extrêmes, terminer le combat. Elle doit être visible dans le déroulé au moment où elle survient, sinon elle ne sert à rien.

### 9.3 Examen médical entre les rounds

Distinct de l'arrêt médical déjà implémenté. Le médecin monte, examine une coupure ou une blessure, et laisse continuer ou arrête. La majorité des examens doivent laisser continuer : l'intérêt est la tension, pas la fin.

### 9.4 Rythme par round

Le round 1 se joue aujourd'hui exactement comme le round 5. Ajoute un profil temporel : phase d'observation en ouverture, sursaut de fin de round, accélération des dernières secondes chez celui qui se sait mené aux points. Ce dernier point doit s'appuyer sur la lecture de score déjà disponible côté juges, pas sur une variable nouvelle.

### Critères d'acceptation du lot 9

- répartition des frappes par type produite dans le rapport, cohérente avec l'empreinte de chaque style : le muay-thaï doit être le premier utilisateur de genoux, la boxe quasi exclusivement aux poings ;
- coupures ouvertes majoritairement par des coudes, chocs de têtes et coups lourds, dans cet ordre de contribution ;
- taux de blessure en combat crédible et documenté, avec la part de blessures qui terminent le combat ;
- part des frappes significatives dans les trente dernières secondes de round en hausse mesurable contre `baseline-P8.md` ;
- aucune régression sur les critères des lots 6, 7 et 8, ni sur ceux de P7 L2 à L4.

---

## LOT 10 — L'adaptabilité contre les mauvais matchups

> Ne commence ce lot qu'une fois L7, L8 et L9 fusionnés. Il règle l'amplitude d'écarts créés par ces trois lots ; le régler avant reviendrait à calibrer contre des chiffres qui vont changer.

### 10.1 Le problème que ce lot résout

Le lot 6 a retiré le seul effet en combat d'`adaptability`, qui est depuis un attribut de vitrine. Le lot 4 de P7, puis le lot 8 de ce plan, ont délibérément créé des désavantages structurels marqués : un style qui en piège un autre, une allonge très supérieure, une garde défavorable. Rien ne permet aujourd'hui à un combattant d'y répondre autrement qu'en étant simplement meilleur.

`adaptability` devient donc la réponse à un mauvais matchup — et rien d'autre. Elle ne doit avoir aucun effet sur un affrontement neutre.

### 10.2 Le piège à éviter, et la forme imposée

Une réduction d'écart appliquée en continu détruirait le travail du lot 4 de P7 et du lot 8 : la plupart des combattants ont une adaptabilité moyenne, donc tous les écarts se resserreraient partout et la matrice retomberait vers 50/50 — exactement l'état que ces lots ont corrigé.

**La forme imposée est temporelle, pas proportionnelle.** L'adaptabilité ne réduit pas le désavantage, elle en **raccourcit la durée** :

- **round 1** : le désavantage s'applique en entier, quelle que soit l'adaptabilité. Personne ne résout un mauvais matchup dans les trente premières secondes.
- **rounds suivants** : le désavantage se referme partiellement, d'autant plus vite que l'adaptabilité est élevée. Une adaptabilité faible le subit jusqu'à la cloche finale.
- **le plafond de fermeture est partiel, jamais total.** Une adaptabilité à 100 ne doit pas annuler un mauvais matchup, seulement le rendre survivable.

Deux conséquences voulues : un combattant très adaptable peut toujours se faire finir au round 1 avant d'avoir eu le temps de s'ajuster ; et sur un combat en cinq rounds, l'adaptabilité vaut nettement plus que sur un combat en trois. C'est le comportement recherché, pas un effet de bord — vérifie-le et rapporte-le séparément par format de combat.

### 10.3 Périmètre : tous les désavantages, pas seulement les styles

L'effet doit s'appliquer uniformément à **tout** désavantage structurel identifiable : matchup de style (politique de combat, L4 de P7), écart d'allonge et de gabarit (L8), garde défavorable (L8), et le cas échéant l'infériorité positionnelle au sol (L3 de P7).

Un mécanisme qui ne marcherait que sur les styles produirait une règle arbitraire, invisible au joueur et impossible à expliquer. Si un de ces axes doit être exclu, dis lequel et pourquoi plutôt que de l'omettre silencieusement.

### 10.4 Lisibilité

Le joueur doit pouvoir constater l'effet sans lire le code. L'ajustement doit apparaître dans le déroulé du combat au moment où il se produit — une ligne de log au passage du round, du même registre que les autres beats, sans chiffre affiché.

C'est aussi ce qui redonne à l'attribut le support narratif que le lot 6 lui a retiré en supprimant le coin. Cette fois l'effet précède le texte, et non l'inverse.

### Critères d'acceptation du lot 10

- sur un affrontement neutre (styles compatibles, allonge et garde équivalentes), l'adaptabilité n'a **aucun** effet mesurable : c'est le premier test à écrire ;
- sur les cellules les plus asymétriques de la matrice 8×8 à overall égal, un écart d'adaptabilité marqué réduit l'écart de taux de victoire sans jamais l'annuler — donne l'amplitude, cellule par cellule ;
- les six cellules à 60/40 exigées par le lot 4 de P7 restent à 60/40 à adaptabilité moyenne : ce lot ne doit pas les racheter ;
- aucun style hors de la bande 47-53 % en moyenne après réglage ;
- effet mesuré et rapporté séparément sur trois et sur cinq rounds ;
- taux de finition au round 1 inchangé contre `baseline-P8.md` : l'adaptabilité ne doit protéger de rien avant d'avoir eu le temps d'agir.

---

## Rappels non négociables

1. **Ancre systématique** sur chaque changement de modèle, avec la justification et le chiffre mesuré qui l'a motivé. Format existant : `/* ==== [ANCRE: NOM] ==== */`, référence du lot incluse (`P8_L7_ARBITRE_RELANCE`, `P8_L10_ADAPTABILITE_FENETRE`, etc.).
2. **Une PR par lot**, jamais deux lots dans la même branche.
3. **Un rapport versionné par lot** dans `tools/reports/`, comparé au précédent. C'est la dette la plus visible de P7 : ne la répète pas.
4. **`npm run check` vert** à chaque lot. Les tests d'invariants ne sont jamais assouplis : s'ils cassent, c'est le modèle qui est faux.
5. **Déterminisme seedé** : un même seed reproduit le même combat après chaque lot.
6. **Ne jamais compenser un écart par un facteur correctif** sans en avoir identifié la cause.
7. **Ne relis jamais l'ordre des scripts de mémoire** : `index.html` fait foi, et il a changé.
