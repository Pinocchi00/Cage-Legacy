# Cage Legacy — Brief du début de partie : un monde qui a vécu

09/10/2026 · Anthony

> Copie du document Claude Docs https://claude.ai/artifact/QW2hCgdnJysbf1nTFDQQbr, faite le 09/10/2026 pour que les agents OpenCode puissent le lire. **Le document en ligne fait foi** : s'il change, cette copie est refaite. Le « tu » s'adresse à Anthony. Les numéros de lot de ce brief sont préfixés « Monde » dans le dépôt (Monde lot 1, Monde lot 2…) pour ne pas les confondre avec ceux du « Brief vers la démo ». Plan d'exécution : docs/PLAN-OPENCODE-MONDE.md.

## En bref

Huit lots font du début de partie l'arrivée dans une organisation qui a six ans d'histoire, une carte déjà commencée, et des combattants que l'on découvre en lisant plutôt qu'en parcourant une liste. Tout repose sur le lot 1 : sans passé commun, les présentations, les raisons de Leïla et les événements n'ont rien de vrai à raconter.

| Lot | Ce qu'il apporte | Dépend de |
| --- | --- | --- |
| 1 | Six ans de soirées, de champions et de rivalités générés à la création | — |
| 2 | Huit organisations dont le passé ne se ressemble pas | Lot 1 |
| 3 | La présentation à lire : un combattant, puis un combat | Lot 1 |
| 4 | Les dossiers de Leïla : un combattant, puis son adversaire | Lot 3 |
| 5 | La première carte, déjà commencée par un autre | Lots 1, 3 et 4 |
| 6 | Les raisons de Leïla, une quinzaine de familles | Lot 1 |
| 7 | La section Accueil, première de la barre | Lots 3 et 8 |
| 8 | Les événements attachés aux noms, dans tous les menus | Lot 1 |
| 9 | Un staff à gérer, huit organisations qui vivent et se classent, une carrière pour le joueur | Lots 1 et 2 |

Un neuvième lot s'est ajouté le 09/10/2026 après ta réponse à la question 1 : le staff et la puissance des organisations. Il vient après les huit autres et n'est pas nécessaire à la démo.

Ce brief s'ajoute au « Brief vers la démo et l'early access Steam ». Il en remplace deux parties : le lot 8 (la prise en main) et le lot 7 (booker en connaissance de cause), qui trouvent ici une réponse plus large.

## Ce qui est décidé

Tes décisions du 9 octobre 2026 fixent le cadre de ce brief. Rien ci-dessous ne les rediscute.

| Sujet | Ta décision |
| --- | --- |
| Le passé | Le jeu génère six ans en arrière, pour les huit organisations. Trois minutes de chargement au plus, avec une barre visible, puis le jeu commence simplement. Cinq secondes au plus par semaine de jeu. |
| La première carte | Une carte déjà commencée, à finir. Chaque combat a une présentation à lire. Un combat hérité peut être annulé, avec une contrariété dite clairement. |
| Le choix des combattants | Leïla pose des dossiers que l'on fait défiler. Un combattant choisi, ses adversaires possibles arrivent sous la même présentation. La même façon de faire sert aux cartes suivantes. |
| Les raisons de Leïla | Acceptées en entier : explicites, tirées de faits, jamais deux fois la même sur une carte. |
| Les pronostics | Des voix. Un pourcentage est permis, tant qu'il ne montre ni les statistiques ni le niveau d'un combattant. |
| Les organisations | Huit vies et huit héritages différents ; le tableau du lot 2 est validé. Leïla n'existe qu'à Split. Le prédécesseur a un nom, une raison de départ et un poste actuel. |
| Le staff et les niveaux | Un staff à gérer comme dans Football Manager. Huit organisations simulées et classées. Le joueur peut être viré, libre, embauché ailleurs ou partir de lui-même. |
| Les textes | Claude Code écrit tout, y compris les répliques de Leïla et les voix. Tout est marqué à relire. |
| Les événements | Des événements dans les menus, qui donnent envie d'ouvrir une fiche. |
| L'accueil | Une première section « Accueil », sur un écran neuf, sans l'affiche de la soirée en fond. |
| Le visuel | Tout s'intègre à la direction visuelle actuelle, sans rien superposer. |

### Les règles propres à ce brief

Les règles communes du « Brief vers la démo » s'appliquent toutes : une PR par lot, `npm run check` vert, un test par comportement, aucune partie perdue. Quatre règles s'ajoutent.

- **Une planche avant le code** pour tout écran neuf ou recomposé : l'Accueil, la présentation, les dossiers. Tu la valides, puis on code. C'est ta méthode du 04/10/2026.
- **Rien ne se superpose.** Aucun panneau transparent, aucune fenêtre posée sur un écran. Un contenu qui ne tient pas dans son panneau défile ou passe à la page suivante.
- **Tous les textes de ce brief sont écrits par Claude Code**, sur ta décision. Ils entrent en jeu marqués `relu:false`, pour que tu puisses les retrouver et les reprendre.
- **Aucune scène à minuterie, aucune règle maison par organisation.** Tu les as écartées le 08/10/2026 : ce brief n'en contient pas.

## Lot 1 — Six ans de passé

À la création d'une partie, le jeu fait vivre l'organisation pendant six ans avant l'arrivée du joueur : des soirées, des champions, des revanches, des blessures, des départs. Le joueur arrive la septième année.

### Constat

- Aujourd'hui, un combattant naît avec un bilan déjà écrit, par exemple 17-5-2 (`mgmtNewRoster`, `mgmt-bureau.js`).
- Ses anciens combats sont reconstitués contre des noms inventés, hors de l'effectif (`mgmtAncienAdversaire`, `mgmt-anciens.js`). Deux combattants de la même organisation n'ont donc aucun passé ensemble.
- Au premier jour, Résultats est vide, aucune ceinture n'a d'ancien champion, et cinq rôles ne sont jamais attribués faute de mémoire : ancien champion, gatekeeper, bête noire, revenant, remplaçant de luxe (`mgmtRole`, `mgmt-attention.js`).
- Un joueur automatique existe déjà, mais comme outil de mesure hors du jeu (`tools/mesure-management.js`) : il booke les combats réclamés, puis les têtes d'affiche, met un titre en jeu, valide Leïla et prolonge les contrats.

Deux mesures faites le 09/10/2026 fixent les contraintes.

| Mesure | Valeur | Ce que ça donne sur six ans |
| --- | --- | --- |
| Durée d'une soirée simulée, sur ma machine de test (lente) | 2,5 secondes | Environ 62 soirées à raison d'une toutes les cinq semaines, soit plus de 2 minutes |
| Poids d'un combat dans la sauvegarde | 513 octets | Environ 560 combats, soit 290 Ko de plus pour une partie de 277 Ko |

Une troisième mesure, faite le même jour, dit où part ce temps. Les combats ne pèsent presque rien.

| Étape d'une soirée simulée | Temps | Part |
| --- | --- | --- |
| Les neuf combats | 0,04 s | 2 % |
| Le reste de la soirée et l'ouverture de la semaine suivante | 0,4 s | 14 % |
| Les listes de booking et le recalcul des classements | 2,4 s | 84 % |

La cause est précise : `mgmtDivisionRank` est appelée environ 18 000 fois par soirée, et chaque appel recalcule le classement entier d'une catégorie.

### Ce qu'on veut

- Les six ans sont joués par le vrai moteur, sous la main d'un prédécesseur. Rien n'est inventé après coup : un résultat du passé est un combat qui a eu lieu.
- Le bilan d'un combattant se lit en deux parts : ses combats d'avant ces six ans, reconstitués comme aujourd'hui, et ses combats des six ans, contre de vrais collègues.
- Au premier jour, Résultats contient les soirées passées, Ceintures montre la lignée de chaque titre, la fiche renvoie à des adversaires que l'on peut ouvrir.
- Le monde extérieur a les mêmes six ans.
- La caisse, la popularité et les salles du premier jour restent celles du profil de l'organisation. Le passé produit l'histoire, pas la richesse.
- La même graine donne le même passé.

### Tranches

- **T1 — Mesurer avant de construire.** La mesure est faite : 84 % du temps part dans le recalcul des classements. La première tâche est donc de garder un classement en mémoire et de ne le recalculer que lorsqu'un résultat le change. Ensuite, chronométrer les six ans sur ton PC. L'attente est acceptée, même longue (décision du 09/10/2026) : une barre de chargement visible, puis le jeu commence simplement.
- **T2 — Le prédécesseur.** Le joueur automatique de l'outil de mesure devient une fonction du jeu, pure et sans écran. L'outil l'appelle au lieu de la recopier, et un test d'outillage échoue si les deux divergent.
- **T3 — La génération.** L'effectif naît six ans plus jeune, avec des bilans plus courts. Le prédécesseur joue les soirées une à une : vieillissement, blessures, retraites, départs et arrivées compris. Les bilans du premier jour restent dans les fourchettes actuelles. Le monde extérieur, déjà calculé semaine par semaine, avance du même nombre de semaines : piste à vérifier.
- **T4 — Le passage de témoin.** À la fin des six ans, la caisse, la popularité et les salles reprennent les valeurs du profil. Les contrats en cours, les blessures et les attentes sont conservés tels quels : c'est l'héritage.
- **T5 — L'archive légère.** Un combat du passé garde l'essentiel : qui, quand, où sur la carte, le résultat, la méthode, le round, le titre. Objectif : moins de 80 Ko pour les six ans. La liste des soirées faites, plafonnée à 24 dans le calendrier, ne suffit pas : l'archive est à part.
- **T6 — Ce que le passé allume.** Résultats parcourt les soirées passées. Ceintures affiche les règnes. Les cinq rôles à mémoire sont attribués. Les rivalités se lisent sur de vrais combats.
- **T7 — Les parties existantes.** Une partie créée avant ce lot se charge et se joue sans changement. Son passé reste reconstitué à l'ancienne.

### Tests

- Deux créations avec la même graine donnent la même archive.
- Au premier jour : chaque combat de l'archive nomme deux combattants que l'on peut retrouver, retraités compris.
- Pour chaque combattant, les victoires, défaites et nuls de l'archive, ajoutés à sa part d'avant, donnent son bilan affiché.
- Chaque catégorie a un champion, et sa ceinture a au moins un règne passé.
- La caisse et la popularité du premier jour sont celles du profil.
- Le poids de la partie au premier jour reste sous le plafond fixé à la T5.
- Une sauvegarde d'avant ce lot se charge, se valide et joue une soirée.

## Lot 2 — Huit organisations, huit héritages

Choisir une organisation doit changer ce que l'on trouve en arrivant : d'autres champions, d'autres problèmes, une autre histoire. Aujourd'hui, une organisation se résume à huit chiffres.

### Constat

- `mgmt-organisations-data.js` donne à chaque organisation un profil chiffré : caisse, taille et âge de l'effectif, popularité, salles, bourses, catégories fortes et faibles. Aucun texte, aucune ville, aucune histoire.
- Le même fichier signale un trou : quel profil va à quel nom n'a jamais été décidé.
- Les combattants de toutes les organisations sont tirés avec les pays de Split (`mgmtPaysTire(rnd(),'split')`, `mgmt-bureau.js`). Huit organisations, un seul mélange de nationalités.
- Seule Split a un contexte, dicté par toi (`docs/SPLIT-CONTEXTE-DEPART.md`).

### Ce qu'on veut

Une organisation est faite de deux choses. Son identité est écrite. Son héritage est généré par le lot 1, mais orienté par la façon dont son prédécesseur a travaillé.

Ce réglage porte sur le prédécesseur, jamais sur le joueur : ce n'est pas une règle maison. Le joueur reçoit une situation, et il en fait ce qu'il veut.

Le tableau part de tes « plus » et « contreparties » actuels. Tu as validé la dernière colonne le 09/10/2026.

| Organisation | Tes plus et contreparties | Ce que son passé devrait montrer |
| --- | --- | --- |
| Split | Caisse saine ; encore peu connue | Ton contexte : une organisation au milieu, partagée entre le haut et le bas |
| Garden of Blood | Très populaire, grandes salles ; bourses lourdes | Des salles pleines, des vedettes sous longs contrats chers |
| MMA Korner | Bourses modestes ; caisse modeste, public à gagner | De petites soirées, et des champions partis vers plus gros |
| Ultimate Rim | Jeunes combattants ; peu connue, petites salles | Des ceintures créées récemment, des premiers champions encore en place |
| Fighting Pacific Championship | Caisse confortable, public acquis ; effectif vieillissant | De longs règnes, des champions proches de la retraite |
| Knuckle Gate | Public acquis, meilleures combattantes ; caisse modeste, peu d'hommes classés | Des combats principaux féminins, des catégories masculines minces |
| Pure Impact | Beaucoup d'argent, grandes salles ; public à gagner | Des noms achetés ailleurs, devant des salles à moitié vides |
| Undisputed Cage | Caisse saine, public acquis ; catégories dégarnies | Des lourds dominants, des titres restés vacants ailleurs |

### Tranches

- **T1 — La fiche d'identité.** Pour chaque organisation : ville et pays, année de création, réputation en une phrase, la blessure de son histoire, son organisation rivale, le nom de ses soirées, ses salles, son adjointe (Leïla n'existe qu'à Split), et son prédécesseur : son nom, la raison de son départ, où il travaille aujourd'hui. Écrite par Claude Code, marquée `relu:false`. Pour Split, elle reprend ton contexte sans le réécrire.
- **T2 — D'où viennent les combattants.** Chaque organisation a son propre mélange de pays, cohérent avec sa ville.
- **T3 — La main du prédécesseur.** Quatre réglages du joueur automatique par organisation : à quelle fréquence il met un titre en jeu, s'il fait monter les jeunes ou protège les anciens, s'il recrute des noms, s'il laisse filer les contrats.
- **T4 — L'attribution des profils.** Le trou signalé dans le fichier est fermé : chaque nom reçoit son profil, comme dans le tableau.
- **T5 — L'écran « Nouvelle partie ».** Chaque organisation y montre sa ville, son année et sa réputation, en plus de ses plus et contreparties. La planche actuelle est ajustée, pas refaite.
- **T6 — L'export des textes.** `tools/exporter-textes.js` inclut ces fiches, pour que tu puisses les relire d'un bloc.

### Tests

- À graine égale, deux organisations donnent deux archives qui diffèrent sur des mesures précises : âge moyen des champions, nombre de changements de titre, part de combats principaux féminins, nombre de départs.
- Le mélange de pays de deux organisations n'est pas le même.
- Chaque fiche d'identité a tous ses champs, et aucune organisation n'est sa propre rivale.
- La fiche de Split ne contient aucune phrase absente de ton contexte.

## Lot 3 — La présentation : un combattant, puis un combat

La présentation est une page à lire, qui dit en quelques lignes pourquoi ce combattant ou ce combat mérite l'attention. C'est la brique commune des lots 4, 5, 7 et 8.

### Constat

- Le jeu sait déjà beaucoup de choses sur un combattant, mais elles sont réparties dans cinq onglets de fiche et sur plusieurs écrans : force et faille d'après le bilan, rôle, pays, ville, ancien métier, milieu, moments de vie, demandes, attente, contrat, rivaux.
- L'avant-combat de la soirée (`mgmt_soiree_avant`) existe déjà. En début de partie, il répond « Personne ne sait » aux trois questions du centre, de la cage et du sol.
- La presse, les réseaux, les défis et les réclames du public existent, rangés dans l'écran Presse.
- La charte d'interface interdit toute note, jauge, étoile ou barème (règle H1) : la qualité d'un combat « s'exprime par une phrase dans la voix d'un personnage ». Plusieurs contrats de lot écrivent aussi « aucun pronostic ».

### Ce qu'on veut

Deux présentations, une même grammaire.

|  | Présentation d'un combattant | Présentation d'un combat |
| --- | --- | --- |
| Ce qui le distingue | Les trois faits qui le séparent du reste de l'effectif | Ce qui rend ce combat unique : revanche, séries qui se croisent, titre, derby |
| Les points forts | Sa force, sa faille, ce qu'on n'a pas encore vu | Ce que chacun impose à l'autre : au centre, contre la cage, au sol |
| Son histoire ici | Ses combats marquants des six ans, avec des noms que l'on peut ouvrir | Leurs adversaires communs, leur éventuel premier combat |
| Les pronostics | — | Deux ou trois voix qui nomment un vainqueur, et qui peuvent se contredire |
| Ce qu'on en dit | Presse, réseaux, son camp | Presse, réseaux, public |
| Le monde | Son rang mondial, qui le réclame, quelle organisation le regarde | Ce que le résultat change : classement, ceinture, contrat |

- **Toujours différent.** La présentation ne remplit pas les mêmes cases pour tout le monde. Elle choisit les faits les plus rares : le seul gaucher de sa catégorie, la plus longue série en cours, celui qui n'a jamais été fini, le dernier combat d'un contrat.
- **Les pronostics sont des voix.** Un média, un coach ou le public donne un vainqueur avec ses mots. Un pourcentage est permis (décision du 09/10/2026), tant qu'il ne montre ni les statistiques ni le niveau d'un combattant.
- **Un pronostic ne sait que ce que le joueur peut lire** : bilans, classement, séries, combats passés. Il ne lit jamais le niveau caché, donc il peut se tromper.
- **Rien ne se superpose.** Si tout ne tient pas dans un écran, la présentation se tourne page par page, comme les onglets de la fiche.

### Tranches

- **T1 — Le tri des faits.** Une fonction pure donne, pour un combattant puis pour une paire, la liste de ses faits classés du plus rare au plus commun. Une vingtaine de familles : série, rang et mouvement, âge, garde, allonge, façon de gagner, façon de perdre, invaincu, ancien champion, vainqueur d'un champion, revanche à prendre, même camp, ville, ancien métier, moment de vie, contrat, attente, demande, rôle, blessure.
- **T2 — La présentation du combattant**, bâtie sur ce tri.
- **T3 — La présentation du combat**, pronostics compris. Elle remplace l'avant-combat actuel au lieu de s'y ajouter.
- **T4 — Les planches** des deux présentations, à valider par toi avant le code.
- **T5 — Les entrées.** La présentation s'ouvre depuis la Carte, les Préliminaires, la Soirée, la Presse et l'Accueil.
- **T6 — Qui avait raison.** Le lendemain dit quelles voix ont vu juste. Tranche facultative, qui peut attendre.
- **T7 — Les documents.** La décision du 09/10/2026 est inscrite : les pronostics existent, sous forme de voix, et un pourcentage est permis. La règle H1 de la charte est amendée en conséquence. Les lignes « aucun pronostic » des anciens contrats de lot sont annotées, pas effacées.

Les phrases de présentation sont des propositions de Claude Code, marquées `relu:false`, comme celles des anciens combats.

### Tests

- Dans une catégorie de 30 combattants, aucune présentation n'est identique à une autre, et la même famille de fait n'ouvre pas plus de six présentations.
- Les fonctions de présentation ne lisent ni le niveau caché ni les attributs du moteur, comme `mgmt-soiree-show.js` le fait déjà.
- Un pronostic nomme toujours sa voix. S'il donne un pourcentage, ce chiffre ne dépend que de ce que le joueur peut lire lui-même.
- À chaque fait affiché correspond un combat de l'archive, une ligne de contrat ou une donnée de la fiche que le test retrouve.

## Lot 4 — Les dossiers de Leïla

Pour remplir une place sur la carte, Leïla pose quatre à six dossiers que l'on fait défiler un par un. Un combattant choisi, elle pose ses adversaires possibles de la même façon. La liste complète reste accessible à tout moment.

### Constat

- Le booking actuel montre la liste d'une catégorie, triée par classement, avec le curseur sur le champion.
- Leïla sait déjà proposer un adversaire : la touche D (« Proposer ») appelle `mgmtAgendaProposer`, qui donne le combattant libre le plus proche au classement. Une seule proposition, sans raison affichée.
- Ta décision du 06/10/2026 tient toujours : Leïla ne prépare un combat de la carte principale que si tu le lui demandes, aucune carte n'est à elle, et tu gardes un œil sur tout.

### Ce qu'on veut

1. Sur une place libre, le joueur demande des dossiers. Leïla en pose quatre à six.
2. Un dossier occupe le centre de l'écran : c'est la présentation du combattant (lot 3), avec en tête la raison pour laquelle Leïla l'a sorti.
3. Le joueur fait défiler les dossiers, puis en choisit un.
4. Leïla pose alors quatre à six adversaires possibles, sous la même présentation. Chaque dossier dit en plus ce que serait ce combat-là.
5. Le joueur choisit l'adversaire, lit s'il le veut la présentation du combat, et confirme. Le combat entre sur la carte.

- **Ce n'est pas un second système de booking.** Les dossiers posent le combat par la même fonction que la liste (`mgmtBookMain`). Ils changent la façon de choisir, pas les règles.
- **La liste reste là.** Une touche passe des dossiers à la liste complète de la catégorie, et retour. Le joueur peut toujours booker n'importe quel combattant libre.
- **Les dossiers ne se ressemblent pas.** Leïla ne sort pas les six premiers du classement. Elle mélange les angles : celui qui a demandé, celui qui attend, celui que le public réclame, celui qui monte, celui qui revient de blessure.
- **On peut en redemander.** « D'autres dossiers » en pose de nouveaux, sans limite et sans repasser ceux déjà vus, jusqu'à épuisement de la catégorie.
- **Le mouvement reste sobre**, comme décidé les 05 et 06/10/2026 : le dossier glisse, rien ne clignote, rien ne se pose par-dessus.

### Tranches

- **T1 — La pile de combattants.** Une fonction pure rend quatre à six combattants libres pour une place, chacun avec sa raison (lot 6). Jamais deux raisons de la même famille dans une pile.
- **T2 — La pile d'adversaires.** Même chose pour un combattant choisi, dans sa catégorie. Elle remplace la proposition unique de la touche D.
- **T3 — La planche du dossier**, à valider par toi avant le code : où va la carte, où va le dossier, comment on voit qu'il en reste.
- **T4 — L'écran.** Un mode de l'écran Carte. Touches : ← et → pour défiler, Entrée pour choisir, Échap pour revenir, F pour la fiche complète, et une touche pour la liste.
- **T5 — La souris.** Un clic sur le bord gauche ou droit fait défiler, un glisser aussi. Chaque geste du clavier existe à la souris.
- **T6 — Les cartes suivantes.** La même demande est offerte sur chaque place libre de chaque carte, et pour remplacer un combattant qui se retire.

### Tests

- Une pile contient quatre à six combattants, tous bookables, aucun déjà sur la carte. S'il en reste moins de quatre dans la catégorie, elle montre ceux qui restent.
- Choisir un combattant puis un adversaire par les dossiers laisse la partie dans le même état que le même choix fait par la liste.
- Redemander des dossiers ne repasse aucun combattant déjà montré tant qu'il en reste d'autres.
- La même partie, au même moment, pose les mêmes dossiers après un rechargement.

## Lot 5 — La première carte, déjà commencée

Le joueur n'arrive pas devant une carte vide : son prédécesseur a déjà posé la soirée et signé deux ou trois combats de la carte principale. Il lit, il complète les places restantes avec les dossiers de Leïla, et il joue sa première soirée.

### Constat

- Aujourd'hui, une partie neuve s'ouvre sur une carte à 0 sur 5, dans 35 jours, avec la phrase « Choisis son adversaire dans la liste ».
- La pile de départ ne contient qu'une proposition de Leïla, et une demande d'un combattant apparaît dans Presse sans que rien ne l'annonce.
- Le joueur automatique du lot 1 ignore les affaires et les demandes : s'il reste tel quel, le prédécesseur ne laisse aucune promesse derrière lui.

### Ce qu'on veut

- **Des combats signés avant toi.** Deux ou trois combats de la carte principale sont posés. Chacun a sa présentation à lire (lot 3) : c'est ainsi que le joueur rencontre ses quatre à six premiers combattants.
- **Des places à finir.** Les deux ou trois places restantes s'ouvrent sur les dossiers de Leïla (lot 4), déjà posés sans qu'il faille les demander.
- **Les préliminaires de Leïla**, chacun avec sa raison (lot 6).
- **Ce que l'autre a laissé.** Des promesses faites et pas encore tenues, des demandes restées sans réponse, des contrats qui arrivent à leur fin. Ce sont les vraies traces des six ans, pas un scénario écrit.
- **Une carte différente par organisation**, sans rien forcer : elle découle du passé que le lot 2 a orienté.

### Tranches

- **T1 — Le prédécesseur s'arrête en plein travail.** À la fin des six ans, la soirée suivante est posée au calendrier et deux ou trois combats principaux sont signés. Aucun combattant signé n'est blessé, suspendu ou en fin de contrat avant la soirée.
- **T2 — Le prédécesseur répond aux demandes.** Pendant les six ans, il promet ou refuse, comme un joueur. Au premier jour, il reste donc des promesses ouvertes avec leur échéance.
- **T3 — La carte du premier jour.** Les combats hérités portent une marque qui dit qu'ils viennent d'avant, et l'action « Lire la présentation ». Les places libres montrent les dossiers.
- **T4 — Annuler un combat hérité.** Décidé le 09/10/2026 : le joueur peut l'annuler, les deux combattants en gardent une contrariété, et l'écran le dit clairement avant la confirmation.
- **T5 — La suite est inchangée.** La soirée se joue comme aujourd'hui, avec les corrections du « Brief vers la démo ».

### Tests

- Au premier jour, pour vingt graines et les huit organisations : la carte principale compte deux ou trois combats signés, tous valides, et la soirée est posée au calendrier.
- Les places libres reçoivent des dossiers, et la carte peut être complétée sans ouvrir la liste.
- Les promesses ouvertes du premier jour renvoient chacune à une demande que l'archive contient.
- À graine égale, deux organisations n'héritent pas des mêmes combats.
- Le joueur automatique des tests sait finir cette carte et jouer la soirée.

## Lot 6 — Les raisons de Leïla

Chaque combat que Leïla propose porte une raison que l'on comprend en une ligne, tirée d'un fait vérifiable, et jamais la même deux fois sur une carte.

### Constat

- Aujourd'hui, Leïla forme ses paires d'abord, puis le jeu leur cherche une raison après coup (`mgmtPrelimsRaisons`, `mgmt-prelims.js`).
- Quatre raisons seulement existent : « attend depuis », « battu par », « a battu », « nul contre ». Sinon s'affiche « Deux combattants libres de la même catégorie », y compris pour un combat féminin.
- En début de partie, faute de passé, c'est cette phrase passe-partout qui sort presque toujours.

### Ce qu'on veut

Leïla choisit d'abord une raison, puis la paire qui lui correspond. La raison est enregistrée avec le combat : ce que le joueur lit est la vraie cause du choix.

| Famille | Le fait cité | Source |
| --- | --- | --- |
| Revanche | L'un a perdu contre l'autre, telle soirée | Archive |
| Rivalité ouverte | Un défi lancé, resté sans réponse | Rivalités, presse |
| Séries qui se croisent | Deux séries de victoires en cours | Archive |
| Classement voisin | Deux rangs qui se suivent, le vainqueur passe devant | Classements |
| Test pour un jeune | Un espoir face à un nom installé | Rôles |
| Dernière chance | Deux ou trois défaites de suite | Archive |
| Retour de blessure | Absent depuis tant de mois | Blessures |
| Longue attente | Sans combat depuis tant de mois | Attente |
| Demande ou promesse | Il l'a demandé, ou on le lui a promis | Demandes, promesses |
| Fin de contrat | Dernier combat de son contrat | Contrats |
| Styles opposés | Ce que le bilan de l'un dit contre celui de l'autre | Fiche |
| Derby | Même ville ou même pays | Identité |
| Débuts dans l'organisation | Premier combat sous cette affiche | Recrutement |
| Vétéran avant la sortie | L'âge, le nombre de combats | Rôles |
| Réclamé par le public | Le public le demande | Réclames |

- **Explicite.** La raison cite son fait avec son chiffre ou son nom, puis dit en une seconde ligne ce que le combat peut changer.
- **Jamais deux fois la même famille** parmi les préliminaires d'une carte, ni dans une pile de dossiers.
- **Toujours une raison.** « Classement voisin » s'applique à n'importe quelle paire : la phrase passe-partout disparaît.
- **Des faits, pas une réplique.** La raison s'affiche comme une ligne d'information, pas comme une phrase dite par Leïla.

### Tranches

- **T1 — Les quinze familles**, chacune avec sa condition et le fait qu'elle cite. Fonctions pures, lues sur l'archive du lot 1.
- **T2 — La raison d'abord.** `mgmtPickBulkPair` (`mgmt-carte.js`) reçoit la famille à servir. Ses règles de variété actuelles sont conservées : paire inédite, prénoms uniques, pas plus de deux combats de suite dans la même catégorie.
- **T3 — La raison enregistrée** avec chaque combat proposé. Le format de la pile change : migration et validation.
- **T4 — L'affichage** sur les Préliminaires, en tête des dossiers du lot 4 et dans la présentation du combat. Les deux lignes tiennent dans le panneau actuel.
- **T5 — Les phrases.** Trois formulations au moins par famille, accordées au féminin quand il le faut. Propositions de Claude Code, marquées `relu:false`.

### Tests

- Sur vingt graines et les huit organisations, aucune carte de préliminaires ne porte deux fois la même famille.
- La chaîne « Deux combattants libres de la même catégorie » n'existe plus dans le dépôt.
- Chaque raison est vérifiée contre sa source : pour une revanche, l'archive contient bien le combat cité, avec le bon vainqueur.
- Un préliminaire féminin : les deux lignes sont au féminin.
- Une pile ancienne, sans raison enregistrée, se charge et s'affiche sans erreur.

## Lot 7 — La section Accueil

« Accueil » devient la première section de la barre et l'écran sur lequel on arrive. Elle dit où en est l'organisation, ce qui s'est passé depuis la dernière fois, et ce qui attend le joueur.

### Constat

- La barre compte onze sections, de Carte à Finances (`MF_SECTIONS`, `mgmt-cadre.js`). Aucune n'est un point de départ.
- Ouvrir une partie mène tout droit à la Carte (`mgmtEnter`, `mgmt-screens.js`).
- L'écran « Les affaires » joue déjà un peu ce rôle : la carte en cours, le monde autour, les demandes. Mais il n'est dans aucune entrée de la barre et son contenu se coupe en bas.
- Le Calendrier sait dire ce qui manque avant la soirée (`mgmtAgendaBlocages`), mais seulement sur son propre écran.

### Ce qu'on veut

L'Accueil répond à quatre questions, dans cet ordre.

| Question | Ce que l'Accueil montre | D'où ça vient |
| --- | --- | --- |
| Où suis-je ? | L'organisation, la date, la prochaine soirée et son lieu | Lot 2, calendrier |
| Que s'est-il passé ? | Les événements de la semaine, chacun attaché à un nom que l'on peut ouvrir | Lot 8 |
| Qu'est-ce qui m'attend ? | La prochaine chose à faire, puis les demandes et les affaires ouvertes | `mgmtAgendaBlocages`, pile, demandes |
| Et ailleurs ? | Une ou deux nouvelles du monde extérieur | Monde, presse |

- **La toute première fois**, l'Accueil présente l'héritage : l'identité de l'organisation, ses champions en place, sa dernière soirée, la carte commencée, les promesses laissées. C'est la réponse à « on choisit une organisation, et ensuite ? ».
- **Les affaires rejoignent l'Accueil.** Cela règle la décision n°6 du « Brief vers la démo » : plus d'écran caché derrière un lien de blocage.
- **Pas un tableau de bord.** Peu de chiffres, des noms et des phrases courtes. Les chiffres restent dans Finances.
- **Rien ne se superpose.** Les nouvelles de la semaine s'affichent dans l'Accueil, pas dans une fenêtre posée par-dessus un autre écran.

### Tranches

- **T1 — La section.** « Accueil » s'ajoute en tête de `MF_SECTIONS`. Ouvrir une partie y mène. Pendant une soirée, elle est grisée comme les autres.
- **T2 — Le contenu.** Une fonction pure rend les blocs de l'Accueil pour l'état courant de la partie. Elle ne crée aucune donnée : elle lit.
- **T3 — La planche**, à valider par toi avant le code. Décidé le 09/10/2026 : l'Accueil est un écran neuf, sans l'affiche de la soirée en fond.
- **T4 — L'écran**, sur la planche validée.
- **T5 — La première arrivée.** Elle se reconnaît à l'état de la partie (aucune soirée jouée par le joueur), sans rien ajouter à la sauvegarde.
- **T6 — Les affaires.** Leurs fonctions restent ; leur écran est remplacé par les blocs de l'Accueil. Le lien « Les affaires » du Calendrier mène à l'Accueil.
- **T7 — La prochaine chose à faire.** C'est la première ligne de `mgmtAgendaBlocages`, avec son lien. Elle remplace la tranche T3 du lot 8 du « Brief vers la démo ».

### Tests

- Ouvrir une partie neuve ou reprise mène à l'Accueil. Une partie laissée en pleine soirée mène à la soirée, comme le demande le lot 1 du « Brief vers la démo ».
- La première arrivée passe une fois, et ne revient pas après la première soirée.
- Chaque nom affiché sur l'Accueil ouvre la fiche du bon combattant.
- Une demande ou une affaire ouverte se règle depuis l'Accueil, et la soirée se débloque.
- Captures en 1920 × 1080 et en 1366 × 768 avec le cas le plus chargé : rien n'est coupé, rien ne se chevauche.

## Lot 8 — Les événements dans les menus

Un événement est toujours attaché à un nom, et il se voit partout où ce nom apparaît. Se promener dans les menus devient la façon de découvrir ses combattants, un par un.

### Constat

- Le jeu produit déjà des événements : défis, demandes, attentes, réclames du public, citations de médias, résultats marquants, moments de vie (`mgmt-suivi.js`, `mgmt-vie.js`).
- Un « conteur » les rationne : cinq informations par semaine, trois après une semaine lourde, le cercle et les suivis d'abord (`mgmtConteur`, `mgmt-attention.js`).
- Presque tout aboutit dans l'écran Presse. Dans l'Effectif, les Classements, les Camps ou les Contrats, rien ne signale qu'il est arrivé quelque chose à quelqu'un.
- Quatre scénarios à suite sont codés (`mgmt-scenarios.js`) : la hype, la dernière danse, le deuil, la descente. Leur numérotation va au moins jusqu'à 29 : le catalogue en prévoit d'autres.

### Ce qu'on veut

- **Une marque sur le nom.** Partout où un combattant est listé, une marque dit qu'il lui est arrivé quelque chose depuis la dernière fois que le joueur a ouvert sa fiche.
- **La fiche répond.** En tête, « depuis ta dernière visite » raconte l'événement. La marque s'éteint alors partout.
- **Chaque menu a ses événements.** Ils naissent là où ils ont du sens, pas tous dans Presse.
- **Des suites.** Un événement peut en appeler un autre quelques semaines plus tard. La fiche dit qu'il y a quelque chose à suivre.
- **Rare, donc lisible.** Un budget par semaine garde les marques peu nombreuses. Si tout le monde est marqué, plus personne ne l'est.
- **Jamais une fenêtre, jamais une minuterie.** Un événement qui attend une réponse attend dans la fiche et sur l'Accueil.

| Menu | Les événements qui y naissent |
| --- | --- |
| Effectif | Une arrivée, un départ, une retraite annoncée, un changement de catégorie |
| Classements | Une entrée ou une sortie du top, un dépassement, avec le combat qui l'explique |
| Ceintures | Un challenger qui se déclare, un titre vacant, un règne qui passe un cap |
| Contrats | Un dernier combat de contrat, une organisation rivale qui approche un combattant |
| Camps | Un changement de salle ou de coach, deux combattants qui préparent le même combat |
| Presse | Les défis, les réclames, les citations : ce qui existe déjà |
| Résultats | Un ancien combat qui redevient d'actualité : une revanche possible |

Cette liste est une proposition. La tranche T3 commence par un inventaire, et rien de neuf n'est codé sans ton accord.

### Tranches

- **T1 — La marque.** La partie retient, pour chaque combattant, la dernière semaine où sa fiche a été ouverte. C'est un changement de format : migration et validation. Un seul morceau de code dessine la marque, pour toutes les listes.
- **T2 — « Depuis ta dernière visite »** en tête de la fiche, dans la grammaire actuelle de ses onglets.
- **T3 — L'inventaire.** Chaque sorte d'événement existante est rattachée au menu où elle naît. Celles du tableau qui manquent sont listées pour ton accord.
- **T4 — Les événements nouveaux**, menu par menu, après ton accord.
- **T5 — Les suites.** D'autres scénarios du catalogue sont codés sur le modèle des quatre existants. La fiche affiche « à suivre » tant qu'une suite est attendue.
- **T6 — Le budget.** Le budget du conteur borne aussi le nombre de marques par semaine. Le cercle et les suivis passent d'abord, comme aujourd'hui.
- **T7 — Les six ans aussi.** Les événements du passé sont lisibles sur la fiche dès le premier jour, sans marque.
- **T8 — Les textes.** Propositions de Claude Code, marquées `relu:false`. Une étiquette de catalogue ne s'affiche jamais telle quelle.

### Tests

- Un événement sur un combattant allume sa marque dans chaque liste où son nom figure.
- Ouvrir sa fiche éteint la marque partout, et elle reste éteinte après un rechargement.
- Sur quarante soirées, le nombre de marques par semaine ne dépasse jamais le budget.
- Chaque sorte d'événement a un menu, et aucune n'ouvre de fenêtre par-dessus un écran.
- Une suite attendue arrive dans sa fenêtre de semaines, ou s'annule proprement si le combattant part.

## Lot 9 — Le staff et la puissance des organisations

Ta réponse à la question 1 ouvre un neuvième lot : une organisation est faite de personnes que l'on gère comme dans Football Manager, et elle a un rang parmi les autres, comme un club dans sa ligue. C'est ce qui lui permet de vivre avant le joueur et de continuer après lui.

### Ce qui est décidé

Tes réponses du 09/10/2026, reportées ici pour qu'elles ne se perdent pas.

| Sujet | Ta décision |
| --- | --- |
| Les sept autres organisations | Simulées, comme celle du joueur. Trois minutes de chargement au plus à la création, cinq secondes au plus par semaine de jeu. |
| Qui est dans le staff | Le patron, le matchmaker, l'adjointe, un recruteur, un responsable presse, un médecin. Pour chaque métier, plus de candidats que de postes. |
| Ce que change un membre du staff | Ses qualités pèsent : un bon recruteur donne de meilleurs dossiers, un bon médecin des retours de blessure plus sûrs. |
| Comment se lisent ses qualités | En mots, jamais en chiffres. |
| Comment se lisent les niveaux d'une organisation | En rang dans un classement, en chiffres s'il le faut. |
| La notoriété | Elle se mesure aux combattants les plus connus de l'organisation. |
| La puissance | Elle se mesure à ses combattants les mieux placés au classement mondial. |
| Le classement mondial | La section Classements reçoit un classement mondial de chaque combattant, toutes organisations confondues. |
| Les ligues | Un seul classement. Les huit organisations sont les meilleures du jeu, et les seules pour l'instant. |
| La fin d'un poste | Quatre cas : viré, agent libre, embauché ailleurs, parti alors que l'organisation voulait le garder. |
| Pourquoi on est viré | Une mauvaise gestion des combattants ou des soirées, ou une organisation qui recule par rapport aux autres. |
| La fiche du joueur | Le joueur a sa fiche, qui se met à jour tout au long de la partie. |
| Les règles du dépôt | Celles que ce brief contredit sont amendées : tu l'acceptes. |

Un point à noter pour que personne ne le prenne pour une erreur : le 08/10/2026, tu avais écarté une proposition qui contenait des « niveaux de notoriété ». Ta réponse d'aujourd'hui les demande pour les organisations. C'est elle qui fait foi.

### Constat

- Le staff n'existe presque pas dans le code. Leïla est une voix, pas une personne avec un parcours. Les coachs des camps sont des noms tirés au hasard, sans fiche (`mgmtCoachNom`, `mgmt-camps.js`). Le patron n'apparaît que dans des textes du lendemain.
- Une organisation a aujourd'hui trois grandeurs : une popularité de 0 à 100, une liste de salles, une caisse.
- Il n'y a pas de classement des organisations. `docs/QUESTIONS-OUVERTES.md` le signale depuis le 22/09/2026 (QO-11).
- Seule l'organisation du joueur est simulée. Les sept autres n'existent que par leurs combattants, calculés à la demande : elles n'ont ni soirées, ni caisse, ni popularité, ni staff.

### Ce que cela demande

Décidé le 09/10/2026 : les huit organisations sont simulées, et la création d'une partie ne dépasse pas 3 minutes de chargement. Voici ce que ce plafond demande.

|  | Aujourd'hui, sur ma machine de test | Pour tenir 3 minutes |
| --- | --- | --- |
| Soirées à simuler | 8 organisations × 62 soirées = 496 | 496 |
| Temps par soirée | 2,8 secondes | 0,36 seconde |
| Temps total | 23 minutes | 3 minutes |

Il faut donc aller huit fois plus vite. C'est atteignable, parce que le temps perdu est presque tout au même endroit. Les leviers, dans l'ordre :

1. **Garder les classements en mémoire** (lot 1, T1). C'est 84 % du temps d'une soirée.
2. **Un booking direct pour les prédécesseurs.** Ils n'ont pas besoin des listes préparées pour l'écran.
3. **Ouvrir la semaine une fois pour les huit organisations**, pas huit fois.
4. **En dernier recours, calculer sur plusieurs cœurs à la fois.** Le navigateur le permet sans rien ajouter au jeu.

Mon estimation après les trois premiers leviers : autour de 0,4 seconde par soirée sur ma machine, qui est lente. Le PC d'un joueur fera mieux, mais je ne peux pas le garantir avant de l'avoir mesuré. Le plafond se vérifie donc sur deux machines : ton PC, et un PC modeste.

Trois conséquences à connaître avant de lancer ce lot.

- **La sauvegarde grossit.** Une partie pèse 277 Ko aujourd'hui, dont 104 Ko pour un seul effectif. Avec huit effectifs et huit archives, elle dépassera le méga-octet. Le stockage du navigateur ne suffit plus pour trois emplacements et leurs copies : les sauvegardes en fichiers du « Brief vers la démo » (lot 2) deviennent obligatoires.
- **Chaque semaine de jeu coûte plus cher.** Quand le temps avance, les sept autres organisations jouent aussi leurs soirées. Décidé le 09/10/2026 : 5 secondes au plus par semaine de jeu.
- **Le monde extérieur actuel est remplacé.** Aujourd'hui, les combattants des autres organisations sont calculés à la demande, sans être stockés. Les simuler pour de vrai remplace ce système au lieu de s'y ajouter. C'est une exception à la règle « additif par défaut », à écrire noir sur blanc.

### Tranches

- **T1 — La vitesse d'abord.** Les trois premiers leviers ci-dessus, puis un outil qui chronomètre la création complète sur deux machines. Rien d'autre ne commence tant que les 3 minutes ne sont pas tenues.
- **T2 — Les huit organisations vivent.** Chacune a son effectif, sa caisse, sa popularité, ses salles, son calendrier et un matchmaker automatique. Le monde extérieur calculé à la demande est remplacé. Une partie créée avant ce lot garde l'ancien monde et se joue sans changement.
- **T3 — Les quatre niveaux.** La popularité est ce que le public pense : elle existe. Le stade est la plus grande salle que l'organisation sait remplir : les salles existent. La notoriété se mesure à ses combattants les plus connus : le renom d'un combattant existe déjà dans le code, sans être affiché. La puissance se mesure à ses combattants les mieux placés au classement mondial de la T5.
- **T4 — Le classement des organisations.** Un seul classement des huit, lu d'abord par le rang. Il ferme QO-11.
- **T5 — Le classement mondial des combattants.** Par catégorie, toutes organisations confondues, dans la section Classements. Le rang mondial de chacun se lit aussi sur sa fiche. Il existe déjà sous une forme calculée ; il devient un vrai classement.
- **T6 — Les personnes du staff.** Six métiers par organisation, et un marché où il y a plus de candidats que de postes. Chacun a un parcours sur les six ans : l'archive du lot 1 retient qui a signé chaque carte.
- **T7 — Les qualités et leurs effets.** Une ou deux qualités par métier, décrites en mots et jamais en chiffres, chacune reliée à un effet nommé et mesurable : les dossiers de recrutement pour le recruteur, les retours de blessure pour le médecin, la popularité et la notoriété pour le responsable presse, les préliminaires pour l'adjointe.
- **T8 — La fiche de staff**, dans la grammaire de la fiche de combattant. Le joueur a la sienne, mise à jour tout au long de la partie : ses organisations, ses soirées, ses champions, ses départs. Planche à valider avant le code.
- **T9 — Engager, garder, perdre.** Un membre du staff a un contrat. Il peut être engagé, partir en fin de contrat, ou être débauché par une autre organisation. Le prédécesseur en est le premier exemple.
- **T10 — La carrière du joueur.** Les quatre fins de poste que tu as listées. On est viré pour une mauvaise gestion des combattants ou des soirées, ou quand l'organisation recule par rapport aux autres. La partie ne s'arrête pas : sans poste, le temps passe et des offres arrivent ; dans une nouvelle organisation, l'Accueil rejoue la première arrivée avec son héritage. L'organisation quittée continue avec un matchmaker automatique.
- **T11 — L'écran de l'organisation.** L'écran actuel, resté sans planche, devient la page où se lisent le rang, les quatre niveaux et le staff. Planche à valider.

### Tests

- La création complète d'une partie tient sous 3 minutes, et une semaine de jeu sous 5 secondes, sur les deux machines de référence. C'est un outil de mesure qui le vérifie, pas un test automatique.
- À graine égale, deux créations donnent les mêmes huit organisations, le même staff et les mêmes classements.
- Le classement des organisations change quand un niveau change, et jamais sans raison que le test sache retrouver.
- Le rang mondial d'un combattant est le même dans Classements et sur sa fiche.
- Remplacer le recruteur par un meilleur change les dossiers proposés, dans le sens attendu, sur vingt graines.
- Pour chacune des quatre fins de poste : la partie continue, l'organisation quittée joue sa soirée suivante, et rien n'est perdu de son archive.
- Une sauvegarde d'avant ce lot se charge et joue une soirée.

### Ce qui sera chiffré en codant

Tout est tranché. Deux choses restent à chiffrer au moment de les coder, et te seront soumises avec leur tranche.

- **Les seuils de « mauvaise gestion »** (T10). Il faut des mesures que le joueur peut voir venir : par exemple des combattants laissés sans combat ou partis, des soirées qui déçoivent le public plusieurs fois de suite, un rang d'organisation qui baisse.
- **Le nombre de candidats par métier** sur le marché du staff (T6).

## L'ordre des lots et le lien avec la démo

Le lot 1 passe en premier et sa première tranche est une mesure : tant qu'on ne sait pas combien de temps prennent six ans, on ne construit rien dessus.

1. **Lot 1**, en commençant par la mesure. En parallèle, les lots 1 et 2 du « Brief vers la démo » : une partie plus lourde rend les sauvegardes en fichiers encore plus nécessaires.
2. **Lots 2 et 6.** Ce sont des règles et des textes, sans écran neuf. Ils avancent pendant que tu valides les planches.
3. **Lot 3**, planches puis code. Tout ce qui suit en dépend.
4. **Lot 4, puis lot 5.**
5. **Lot 8, puis lot 7.** L'Accueil vient en dernier parce qu'il affiche ce que les autres lots produisent.

Le lot 9 vient ensuite, après le festival. Sa première tranche, la vitesse, sert aussi le lot 1 : elle peut être faite dès maintenant.

### Ce que ce brief change dans le « Brief vers la démo »

| Dans le brief vers la démo | Ce qui change |
| --- | --- |
| Lot 7, booker en connaissance de cause | Remplacé par les lots 3 et 4 d'ici |
| Lot 8, la prise en main | Remplacé par les lots 5 et 7 d'ici |
| Lot 5, l'écran des affaires | Les affaires rejoignent l'Accueil ; la décision n°6 est réglée |
| Lot 2, les sauvegardes | Inchangé, mais plus urgent |
| Lot 9, les textes | Le nombre de textes à relire augmente |
| Lots 1, 3, 4, 6, 10 et 11 | Inchangés |

### Ce qu'il faut pour la démo, et ce qui peut attendre

Si la démo reste limitée à Split, voici le minimum : le lot 1 en entier, le lot 2 pour Split seulement, les lots 3 à 7, et les trois premières tranches du lot 8. Les sept autres organisations, les événements nouveaux et le lot 9 peuvent suivre après le festival.

### Trois réserves

- **Le temps de création.** Six ans simulés, c'est plus de deux minutes sur ma machine de test. Sur un PC ordinaire ce sera moins, mais personne ne le sait avant la mesure.
- **Le volume de textes.** Quinze familles de raisons, une vingtaine de familles de faits, les pronostics, huit identités, les événements : mon estimation est de 250 à 300 phrases courtes en plus, toutes marquées à relire.
- **Le défaut de fond n'est pas encore prouvé réglé.** Les dossiers changent la façon de choisir, mais les règles qui récompensent une carte ne changent pas. Après le lot 4, il faudra vérifier en jouant si le meilleur choix reste évident.

## Les décisions qui t'attendent

Tu as répondu dans le tableau le 09/10/2026. Tes réponses sont reportées dans les lots, et ce qui reste ouvert est listé sous le tableau.

| N° | Lot | La question | Ma proposition |
| --- | --- | --- | --- |
| 1 | 1 | « L'organisation continue après moi » : le joueur peut-il partir ou être remplacé, l'organisation continuant avec un autre matchmaker ? | Gestion de staff comme dans football manager en gardant les fiche de combattant mais en les adaptant pour le staff, avec des vrai niveaux de popularité, de stade, de notoriété, de "puissance" comme des clubs de foot dans football manager et les ligues. |
| 2 | 1 | Combien de temps accepte-t-on d'attendre à la création, et que voit-on pendant ce temps ? | on peut attendre longtemps c'est pas grave avec une barre de chargement qu'on voit puis on commence le jeu simplement |
| 3 | 1 | Peut-on revoir en images un combat des six ans, ou seulement en lire le résultat ? | Seulement le lire. On ne revoit en images que les combats joués sous le joueur. |
| 4 | 2 | Les huit lignes « ce que son passé devrait montrer » sont-elles les bonnes ? | C'est bon |
| 5 | 2 et 5 | L'adjointe s'appelle-t-elle Leïla dans les huit organisations ? Le prédécesseur a-t-il un nom et une raison de départ ? | Leïla que Split. Un prédécesseur nommé, dans la fiche d'identité. Et raison de départ et où il est actuellement |
| 6 | 3 | Les pronostics sont des voix, jamais un pourcentage : est-ce bien ce que tu veux ? | On peut rajouter des pourcentages, du moment que ça ne montre pas les stats du joueur, ou son niveau de manière explicite |
| 7 | 3, 6 et 8 | Les phrases de présentation, de raison et d'événement sont-elles écrites par Claude Code, comme les organisations ? | Oui, marquées à relire. |
| 8 | 4 | Leïla peut-elle sortir en dossier un combattant de ton cercle ou de tes suivis ? | Oui en dossier, puisque tu choisis. Jamais dans ses préliminaires, comme aujourd'hui. |
| 9 | 5 | Peut-on annuler un combat signé par le prédécesseur ? | Oui, avec une contrariété pour les deux combattants. De manière explicite |
| 10 | 7 | L'Accueil essaie-t-il l'affiche de la soirée en fond, comme tu l'imaginais le 04/10/2026 ? | Non nouvel écran |

### Ce qui reste ouvert

- **Plus aucune question ouverte.** Les deux points à chiffrer du lot 9 viendront avec leur tranche.
- **Questions 3 et 8** : tu les as laissées telles quelles, donc mes propositions s'appliquent. On ne revoit en images que les combats joués sous le joueur, et Leïla peut sortir en dossier un combattant de ton cercle.
- **Sept adjointes à créer**, une par organisation, avec leur nom et leur façon de parler. Claude Code les écrit.
- **Trois règles du dépôt sont amendées**, avec ton accord du 09/10/2026 : la règle H1 de la charte (les pourcentages des pronostics), la règle « l'auteur écrit les voix » de `AGENTS.md` et `CLAUDE.md` (Claude Code écrit tout), et la règle « additif par défaut » (le monde extérieur est remplacé).
