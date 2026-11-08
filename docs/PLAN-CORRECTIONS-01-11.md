# Cage Legacy — plan d'amélioration (retours de jeu du 31/10)

Nov 1, 2026 · @Anthony

## Comment lire ce plan

Ce plan reprend les 41 remarques de ton PDF de corrections (38 pages, 40 captures d'écran), triées par écran et par thème. **Il intègre toutes tes réponses**, y compris celles du 1er novembre : chaque question est suivie de ta décision, recopiée mot pour mot, puis de ce qu'on fera concrètement. Je n'ai rien décidé à ta place : les réponses qui se contredisaient ou me laissaient un choix ont été tranchées par toi (section « Points tranchés le 1er novembre »). **Il ne reste aucune question ouverte avant les maquettes.**

- **Numérotation.** Chaque remarque garde son numéro d'origine (R1 à R41), dans l'ordre du PDF. Une remarque qui touche plusieurs sujets est citée en entier une fois, à son écran, et rappelée par son numéro dans les chantiers transversaux.
- **Texte.** Tes remarques et tes réponses sont recopiées mot pour mot, fautes de frappe comprises, pour ne rien perdre ni déformer.
- **Pour chaque remarque** : la capture, ce que j'en comprends (point par point), la cause probable quand je l'ai vérifiée dans le code (marquée « vérifié » ou « hypothèse »), la piste, puis pour chaque question : **la question**, **ta décision** et **ce qu'on fera**. Une piste écrite avant tes réponses et qui ne colle plus est marquée « mise à jour ».
- **Ce qui reste à faire avant le code** : les recherches sur le MMA réel, les listes que je dois te proposer (événements, scénarios, traits, noms…) et les choix à valider sur la maquette. Ils sont en fin de plan, avec le brief pour démarrer les maquettes.
- **Rien n'est codé.** Aucun fichier du jeu n'a été modifié. Le premier lot est la maquette de la charte visuelle, comme tu l'as demandé (L1).
- **Références.** Football Manager (FM26/27) est ta référence principale ; l'UFC sert de référence pour le réalisme du monde.

## Les chantiers transversaux

Onze chantiers reviennent sur presque tous les écrans ; les traiter d'abord évite de refaire chaque écran deux fois. Chaque chantier liste les remarques qui l'alimentent, ses questions (T1, T2…), ta décision et ce qu'on fera.

### T1 — Tout à la souris, fin des barres de touches (R11, R12, R16, R29, R39)

- **Constat.** Des barres « F / Entrée / Tab », « P pour poser une soirée », « Onglet suivant 0/60 » sont affichées partout. Tu écris : « il n'y a pas ça dans football manager, normalement tout peut être fait à la souris » et « le jeu entier doit pouvoir être fait que à la souris ».
- **Explication.** La règle actuelle du CLAUDE.md dit « souris d'abord, clavier en accélérateur ». Le clavier est codé dans `ui-11-keys.js` et chaque bouton porte sa touche (`mfBouton(…,{touche:'R'})`). Le problème n'est donc pas l'existence des raccourcis mais leur affichage permanent.
- **Piste.** Garder les raccourcis actifs mais invisibles (ou visibles au survol), retirer toutes les barres de touches, remplacer « Précédent / Suivant » par un glissement (swipe) ou des flèches souris.
- **Questions T1.** T1a : on garde les raccourcis clavier cachés, ou on les supprime ? T1b : le glissement doit-il marcher à la souris (cliquer-tirer), à la molette, ou les deux ?
- **Ta décision.** On cache et on cliquer-tirer (avec l'animation en conséquence)
- **Ce qu'on fera.** Retirer toutes les barres de touches (« F / Entrée / Tab », « P pour poser une soirée », « Onglet suivant 0/60 »…). Les raccourcis restent actifs mais invisibles (`ui-11-keys.js`). « Précédent / Suivant » devient un cliquer-tirer à la souris, avec une animation qui suit le geste. La règle du CLAUDE.md « souris d'abord, clavier en accélérateur » reste vraie ; on ajoute « aucune touche affichée ».

### T2 — Look minimaliste à la Football Manager 27, police et fond (R5, R11, R19, R31, R32, R39)

- **Constat.** « rendre l'écran plus "minimaliste" à la Football manager 27 afin de vraiment à chaque fois avoir le plus important » ; « La police d'écriture de partout m'énervent, je la trouve sans aucune vie, comme le fond par ailleurs cendré qui ne ressemble pas au jeu ». Ailleurs : manque de couleur (R19, R32), « un peu de vie » (R31), le grand carré blanc (R39).
- **Explication.** Le fond cendré (`images/cendre.jpg`, classe `.mf-fond`) a été gardé partout par ta décision du 25/10 : c'est un conflit (voir la partie Conflits).
- **Piste.** Une nouvelle charte : une police plus vivante, un fond sobre, des couleurs par sens (victoire, défaite, montée, alerte), moins de texte par écran. Je propose des maquettes de 2 ou 3 directions avant tout code.
- **Questions T2.** T2a : on abandonne le fond cendré ? T2b : tu veux voir 2 ou 3 polices au choix, ou tu en as une en tête ? T2c : on refait d'abord une maquette de charte complète avant de toucher aux écrans ?
- **Ta décision.** Oui mais j'aimerais garder un fond peut le dégradé d'une arène ou autre. J'aimerais plusieurs choix de polices ainsi que refaire une charte complète.
- **Ce qu'on fera.** Le fond cendré part (voir C1), mais il y a toujours un fond : je propose plusieurs fonds dans la maquette (dégradé d'arène, lumière de cage, autre). Je propose aussi plusieurs polices au choix. On refait une charte complète et elle est validée en maquette avant de toucher aux écrans (lot 1).

### T3 — Mouvement et vie à l'écran (R5, R19, R31)

- **Constat.** « il manque réellement de mouvement quand tu es sur un écran statistiques, comme un carrousel ou un point qui clignote ou n'importe quoi d'autre. Pour l'instant on ne dirait pas un vrai jeu vidéo passionné comme je le veux, je veux mêler le plaisir visuel avec un jeu de management. »
- **Piste.** Une petite bibliothèque d'effets commune : carrousel, compteur qui défile, point d'alerte qui pulse, apparition douce des cartes, graphiques animés.
- **Question T3.** T3 : quel niveau d'animation ? Discret (FM) ou plus spectaculaire (jeu d'arcade) ?
- **Ta décision.** Globalement discret pour le mouvement et le visuel. Mais j'accepte le spectaculaire pour tous ce qui touche au combat et à la soirée.
- **Ce qu'on fera.** Deux niveaux d'animation. Écrans de gestion et de statistiques : discret, façon FM (compteur qui défile, point qui pulse, apparition douce). Tout ce qui touche au combat et à la soirée : spectaculaire autorisé. Les deux niveaux sont montrés dans la maquette de charte.

### T4 — Barre latérale : repliable, icônes SVG, regroupements, nouveaux noms (R11)

- **Constat.** « un bouton avec un slide pour raccourcir tout les écrans de gauche en petite icône SVG très identifiable, et quand il y a l'octogone jaune, signe qu'il y a des choses à faire alors ça sera un petit octogone jaune plus petit dans l'angle en haut à droite du SVG ». Regroupements demandés : la presse et les camps ensemble ; résultats et calendrier ; finance et organisation ; ceinture, effectif et classement ; carte et préliminaires (sous-menu sur la carte). « Avec des nouveaux noms histoire qu'on comprenne tout ».
- **Explication.** La barre est dans `mgmt-cadre.js` et la navigation dans `mgmt-screens.js`. Passer à 5 groupes demande des sous-menus en haut de chaque écran, or R18 dit que les sous-menus « n'ont rien à faire tout en haut ».
- **Questions T4.** T4a : où vont les sous-menus d'un groupe (onglets dans l'écran, menu qui se déplie dans la barre) ? T4b : je te propose une liste de noms et d'icônes, ou tu as déjà des noms ? T4c : « Ceinture, effectif et classement » ensemble, et R22 propose de supprimer l'écran Ceintures : on fusionne ou on supprime ?
- **Ta décision.** Je suis d'accord pour les sous menu en haut, mais peut-être mieux agencer surtout. Je veux une liste, tous ces catégories ne sont pas obligés d'aller ensemble si une trop grande par exemple, c'est juste pour améliorer la compréhension et la lisibilité globale. Peut-être juste ceinture et classement, effectif c'est probablement trop gros. Et in peut fusionner mais faut donner un véritable sens à l'écran ceinture.
- **Ce qu'on fera.** Les sous-menus restent en haut de l'écran, mais mieux agencés (voir aussi Q18c). Je te propose une liste complète de groupes, de noms et d'icônes SVG ; les regroupements de R11 sont des exemples, pas une obligation. Piste retenue pour l'instant : Ceinture et Classement ensemble, l'Effectif à part (trop gros). Barre repliable en petites icônes SVG, avec le petit octogone jaune dans l'angle en haut à droite quand il y a quelque chose à faire. L'écran Ceintures : la maquette en montre une version avec un vrai sens, et tu décides alors de le garder ou de le supprimer (point tranché n° 2).

### T5 — Plus aucun texte de tutoriel (R1, R5, R16, R23, R29, R32)

- **Constat.** « Trop d'infos de tuto " un contrat se signe entre 1 et 8 combat" et ça c'est absolument partout de toutes les façons différentes dans tout le jeu, c'est pas normal. Le joueur le découvrira au moment de prolonger ou de signer un combattant. »
- **Piste.** Un inventaire de toutes les phrases d'aide, puis suppression ; l'info utile n'apparaît qu'au moment de l'action.
- **Question T5.** T5 : on garde un écran d'aide à part (un « ? »), ou plus rien du tout ?
- **Ta décision.** Oui on peut rajouter ça dans les options afin de regrouper les informations du jeu et les aides.
- **Ce qu'on fera.** Inventaire de toutes les phrases d'aide et de tutoriel du jeu, puis suppression à l'écran. L'information n'apparaît qu'au moment de l'action (par exemple la durée d'un contrat au moment de signer). Les aides et les informations du jeu sont regroupées dans les Options, dans une rubrique dédiée.

### T6 — Réécrire tous les textes avec une ligne éditoriale (R10, R11, R29)

- **Constat.** « Faut refaire chaque dialogue et phrase de littéralement tout le jeu, pour être sûr la même ligne éditoriale. »
- **Explication.** La règle en vigueur : j'écris, je marque à relire, tu valides. Le volume est très grand.
- **Questions T6.** T6a : quelle ligne éditoriale (ton journaliste sportif, ton vestiaire, sobre FM) ? T6b : on réécrit écran par écran au fil des refontes, ou en une seule passe à la fin ?
- **Ta décision.** Probablement sobre comme FM, c'est ce jeu où j'ai vraiment eu l'impression d'être un manager. On valide un petit échantillon puis on agrandit.
- **Ce qu'on fera.** Ligne éditoriale sobre, façon FM. Je réécris d'abord un petit échantillon (quelques écrans représentatifs) que tu valides ; ensuite on étend à tout le jeu, écran par écran, au fil des lots. Règle inchangée : j'écris, je marque à relire, tu valides.

### T7 — Bouton Retour partout et bug de la fiche (R4, R6, R8, R9, R16)

- **Constat.** Cliquer sur une fiche fait sauter une étape (R4 : « c'est pas la première qu'appuyer sur la fiche provoque ce genre de bug »), ouvre un écran inconnu (R6), et on ne peut pas revenir (R8, R9, R16).
- **Piste.** Un historique de navigation commun (pile d'écrans) avec un bouton Retour fixe, et la fiche ouverte par-dessus l'écran courant sans le quitter. Un test de non-régression par cas cité.
- **Question T7.** T7 : la fiche s'ouvre en panneau par-dessus (on garde l'écran derrière), ou en plein écran avec Retour ?
- **Ta décision.** Comme dans FM donc je suppose que c'est un panneau par dessus.
- **Ce qu'on fera.** La fiche s'ouvre en panneau par-dessus l'écran courant, comme FM, sans le quitter. Un historique de navigation commun et un bouton Retour fixe sur tous les écrans. Un test de non-régression par cas cité (R4, R6, R8, R9, R16).

### T8 — Réalisme du monde : palmarès, âges, inactivité, niveaux des organisations (R8, R9, R15, R20, R21, R22, R23, R28)

- **Constat.** Combattants vieux, plus de défaites que de victoires, « sans combat depuis 553 cycles », « 53 mois que j'attends », tout le monde attend 15 mois, 6 défenses en 18 mois contre 0 en 71 mois, KO en 0:01, 15 défenses de titre, « Je rejoins une organisation mondiale MMA pas une maison de retraite ». « le palmarès grandit avec l'âge sur chaque combattant, c'est pas similaire à la vraie vie ».
- **Explication (vérifié).** « 553 cycles » vient du texte du trait Rouillé (`mgmt-traits-textes.js` ligne 29 : `sans combat depuis {cyclesDepuisDernier} cycles`) : un compteur interne affiché tel quel. Le reste vient du monde généré avant ton arrivée (six ans simulés) sans règles de retraite, de rythme de combats ni de ceinture intérimaire.
- **Piste.** Un lot « monde crédible » : courbe âge/palmarès, 2 à 4 combats par an, retraites, ceinture intérimaire après une longue absence du champion, bornes sur les records, niveaux de palmarès par organisation.
- **Questions T8.** T8a : l'échelle des 8 organisations — voir la partie Conflits. T8b : quel nombre de combats par an vises-tu pour un combattant actif (2 ? 3 ?) ? T8c : au bout de combien de mois sans défense une ceinture intérimaire est-elle créée ?
- **Ta décision.** Comme dans la vraie vie, exemple UFC, pareil pour la ceinture intérimaire. (Tout dépend en fonction de chaque combattant.)
- **Ce qu'on fera.** Réalisme calqué sur la vraie vie (exemple UFC) : palmarès qui suivent l'âge de façon crédible, nombre de combats par an, ceinture intérimaire, tout cela variable selon chaque combattant. Les chiffres exacts viennent d'une recherche (voir « Recherches à faire ») que je te présente avant le code. « 553 cycles » et « 53 mois » sont des bugs d'affichage corrigés dans le lot des bugs. Ce lot touche la sauvegarde : migration obligatoire.

### T9 — Un monde avec un passé lisible (R21, R35)

- **Constat.** « Il faudrait pouvoir avoir des soirées avant, qu'on arrive et que quand on arrive ça reprend à 0 au lieu de faire un split fight night 63. Mais pouvoir comprendre que tout ça c'est passé avant. »
- **Piste.** Le passé reste simulé, mais il est rangé à part (« avant toi ») ; tes compteurs à toi (soirées, défis, carnet) partent de zéro.
- **Question T9.** T9 : la numérotation des soirées repart à 1 à ton arrivée, ou garde l'historique de l'organisation (voir aussi R29 sur les noms de soirées) ?
- **Ta décision.** On garde l'historique mais il faudrait présenter mon arrivée comme un renouveau, un départ à 0
- **Ce qu'on fera.** La numérotation garde l'historique de l'organisation, mais ton arrivée est présentée comme un renouveau, un départ à zéro : le passé est rangé à part (« avant toi ») et tes propres compteurs (soirées, défis, carnet) partent de zéro. Les noms des soirées suivent Q21c / Q29a.

### T10 — Une boîte de messages et un bouton Continuer, comme FM (R13, R17, R26, R33, R34)

- **Constat.** « Ce qui donne envie de jouer \[…\] c'est le fait que tu progresses de jour en jour \[…\] avec des messages, des news, des infos, tu te dis un jour en plus, puis encore un jour. Rajouter un écran continuer et éventuellement d'autres trucs que tu trouverais intéressant. » Les messages doivent recevoir : les paliers de croissance (R13), départ et retour du recruteur (R26), le choc des organisations (R34).
- **Explication.** Le jeu avance aujourd'hui par soirée (« cycle »), pas par jour. Passer au jour par jour touche le cœur du temps de jeu (`mgmt-calendrier.js`, `mgmt-agenda.js`).
- **Questions T10.** T10a : on passe vraiment au jour par jour, ou à la semaine ? T10b : idées en plus que je te propose pour le flux : convocation médicale, agent qui appelle, rumeur de presse, offre d'une autre organisation — tu veux que je les détaille ?
- **Ta décision.** On passe et le jeu s'arrête au jour où on reçoit le message (le retour du recruteur, la blessure d'un combattant sur une carte, le poids raté etc..) j'accepte l'offre d'une autre organisation mais faut que ça arrive de manière réaliste comme sur FM, pour l'instant c'est le seul supplémentaire que j'ai pas dit qui m'intéresse, faut trouver plus encore.
- **Ce qu'on fera.** Le temps avance avec un bouton Continuer et s'arrête automatiquement le jour où un message important arrive (retour du recruteur, blessure d'un combattant à l'affiche, poids raté, etc.). Les offres d'autres organisations sont retenues, mais elles doivent arriver de façon réaliste, comme dans FM. Je te propose une liste beaucoup plus longue d'autres événements, avec leurs probabilités, à valider avant le code (voir aussi Q17).

### T11 — Détails visuels communs (R15, R16, R18, R19, R21, R22, R23, R34)

- **Constat.** Octogones jamais remplis, « juste colorié et hachuré » (R16) ; coins rognés au lieu d'un octogone (R19) ; grandes barres de défilement (R21 : « affreuse », R23, R34 : « toujours la même slide bar qui est nul ») ; superpositions en haut d'écran (R18, R20, R23) ; croix et pastilles sans rôle (R15, R22) ; codes couleur victoire/défaite et montée/descente (R18).
- **Questions T11.** T11a : couleurs victoire / défaite proposées : vert / rouge, ou une autre paire ? T11b : montée / descente : vert / rouge aussi ? T11c : les surnoms (absents en R4, R9, R16, R20) s'affichent partout où il y a un nom ?
- **Ta décision.** Vert rouge me paraît bien et les infos importantes en jaune, positif vert, négatif rouge donc oui pour montée descente. Et les surnoms s'affiche là où c'est intéressant, pas partout mais en majorité.
- **Ce qu'on fera.** Code couleur commun : vert = victoire, positif, montée ; rouge = défaite, négatif, descente ; jaune = information importante. Les octogones sont vraiment remplis, plus de hachures. Les barres de défilement sont remplacées par un modèle plus fin, montré dans la charte. Les surnoms s'affichent là où ils apportent quelque chose (la majorité des écrans, pas tous) ; la liste des écrans concernés sera dans la maquette.

## Écran par écran

Les 41 remarques dans l'ordre du jeu, chacune avec sa capture, ta décision et ce qu'on fera.

### 1. L'arrivée (R1 à R4)

#### R1 — « Ton arrivée »

&#91;image: R1 — écran Ton arrivée\]

> Cet écran ne sert pas vraiment, beaucoup d'informations finalement on ne connait rien, ne comprends rien et c'est normal ok viens d'arriver dans une organisation, faudrait un autre écran mieux, lisible qui est visuellement impactant pour commencer le jeu parfaitement

- **Ce que je comprends.** L'écran déverse l'histoire de Split (« six ans avant toi », « ses douze champions », « ce qu'il t'a laissé », les promesses) à quelqu'un qui ne connaît encore personne.
- **Fichiers.** `mgmt-accueil.js`, `mgmt-predecesseur.js`, `mgmt-prise-en-main.js`.
- **Piste (mise à jour).** Une introduction façon FM, courte, lisible et visuellement impactante ; le prédécesseur n'apparaît que dans l'histoire de l'organisation.
- **Question Q1a.** Que doit montrer cet écran en priorité : l'organisation, tes stars, ou ta mission ?
- **Ta décision.** Comme dans FM, une introduction bien faîte.
- **Ce qu'on fera.** Un écran d'introduction bien fait, comme dans FM : visuellement impactant et lisible, il présente l'organisation, ta prise de poste et l'essentiel pour commencer, sans déverser tout le passé. Il est maquetté avant le code.
- **Question Q1b.** On garde le prédécesseur dans le jeu, mais ailleurs (messages), ou on le retire ?
- **Ta décision.** On le garde mais que dans l'histoire de l'organisation.
- **Ce qu'on fera.** Le prédécesseur reste dans le jeu, mais uniquement dans l'histoire de l'organisation, pas à l'arrivée et pas dans les messages.

#### R2 — Étape 1 « Ton contrat »

&#91;image: R2 — étape 1 Ton contrat\]

> Quand tu cliques sur composer ta soirée tu es directement amené sur cette écran. Ici la demande d'un poid lourd dans le top 15, le souci c'est qu'il y en a déjà un qui est classé top 2 mondial. Pareil pour finir dans le top 4 il faut être au moins 5 ème sinon on appelle ça rester. Et pareil il y a déjà un champion dans le top 5 mondial

- **Ce que je comprends.** Deux problèmes. (1) Le bouton « composer ta soirée » mène à cet écran au lieu de la carte. (2) Les trois objectifs sont déjà atteints au départ : un poids lourd est déjà 2e mondial (Min-ho Kwon), « finir dans le top 4 » n'a de sens que si Split est 5e ou plus bas, et un champion est déjà dans le top 5 mondial.
- **Cause (hypothèse).** Les objectifs sont tirés d'une liste fixe sans regarder l'état réel du monde à ton arrivée.
- **Piste.** Objectifs calculés depuis la situation réelle (toujours un cran au-dessus de l'existant), et le bouton mène bien à la carte.
- **Question Q2.** Un objectif déjà rempli à l'arrivée devient « conserver » (garder le top 4), ou il est remplacé par un objectif plus haut ?
- **Ta décision.** Les objectifs de chaque organisation sont toujours fixes à l'arrivée mais doivent s'adapter en fonction de la renouvèlement du contrat ou chaque année en fonction du jeu et si on change d'organisation.
- **Ce qu'on fera.** Chaque organisation a ses objectifs fixes à l'arrivée. Ils s'adaptent au renouvellement du contrat, chaque année selon le jeu, et quand tu changes d'organisation. Ils ne sont jamais déjà atteints à l'arrivée (« garder » quand c'est déjà acquis, ou un cran au-dessus), et l'objectif le plus haut qu'on puisse demander est le même pour toutes les organisations (point tranché n° 9). Le bouton « composer ta soirée » mène à la carte (bug).

#### R3 — Étape 2 « Ce qui manque »

&#91;image: R3 — étape 2 Ce qui manque\]

> l'étape 2 : ce qui manque. est exactement la même page

- **Ce que je comprends.** L'étape 2 affiche le même contenu que l'étape 1. C'est un bug d'affichage (ou deux étapes qui ne devraient en faire qu'une).
- **Fichiers.** `mgmt-manque.js`, `mgmt-ecran-espoirs-arrivee.js`.
- **Question Q3.** On garde deux étapes distinctes (« ce qu'il attend », puis « ce qui manque »), ou on les fusionne en une seule ?
- **Ta décision.** On peut fusionner
- **Ce qu'on fera.** Les étapes « Ton contrat » et « Ce qui manque » fusionnent en une seule étape ; le doublon disparaît avec la fusion.

#### R4 — « Tes trois espoirs »

&#91;image: R4 — Tes trois espoirs\]

> L'écran est vide et fait tableau, que des combattants très peu intéressant avec peu d'authenticité, on n'a pas vraiment envie de choisir quelqu'un là dedans, pas de surnom, pas d'infos original. J'ai cliqué sur la fiche sans avoir choisi, et ça m'a fait sauter cette étape, c'est pas la première qu'appuyer sur la fiche provoque ce genre de bug

- **Ce que je comprends.** (1) Les six espoirs (Raynaud, Kaddour, Abashidze, Musaev, Lambert, Romero) n'ont rien qui donne envie : pas de surnom, rien d'original, présentation en tableau. (2) Bug : ouvrir la fiche fait sauter l'étape du choix (voir T7).
- **Piste (mise à jour).** 2 espoirs à choisir parmi 6, présentés en cartes de combattant claires (particularité, style de combat), sans histoire ; la fiche en panneau ne quitte pas l'écran ; un test sur le bug.
- **Question Q4.** Combien d'espoirs à choisir parmi combien (aujourd'hui 3 parmi 6 d'après la capture) ?
- **Ta décision.** 2 sur 6 mais je ne veux pas d'histoire, juste des meilleures présentation de combattant, plus utile, chacun avec sa petite particularité, son style de combat etc..
- **Ce qu'on fera.** Tu choisis 2 espoirs parmi 6. Pas d'histoire : une meilleure présentation de chaque combattant, plus utile, avec sa particularité et son style de combat. La fiche s'ouvre en panneau sans sauter l'étape, avec un test sur ce bug.

### 2. L'accueil (R5, R6)

#### R5 — Accueil, semaine 63

&#91;image: R5 — Accueil\]

> Ce qui s'est passé est sûrement assez utile mais pas au début du jeu car on ne connait pas suffisamment le jeu ça n'a pas de sens, beaucoup de noms dans le vide. Pareil avec les demandes et les promesses, ainsi que l'écran qui n'est franchement pas visuellement accueillant il manque réellement de mouvement quand tu es sur un écran statistiques, comme un carrousel ou un point qui clignote ou n'importe quoi d'autre. Pour l'instant on ne dirait pas un vrai jeu vidéo passionné comme je le veux, je veux mêler le plaisir visuel avec un jeu de management. Il y aussi tout l'écran de droite qui regorge d'incohérence.

- **Ce que je comprends.** (1) « Ce qui s'est passé », « demandes » et « promesses » arrivent trop tôt : des noms qu'on ne connaît pas. (2) L'écran est statique (voir T3). (3) La colonne de droite (« Ta saison », « Le patron », « Ton recruteur ») est incohérente — tu ne détailles pas lesquelles ; je les relèverai une par une en jouant.
- **Note.** Le brief du 22/10 disait « aucune promesse » ; elles sont pourtant à l'écran (voir Conflits).
- **Piste.** Un accueil façon FM : la prochaine soirée, les messages non lus, 2 ou 3 alertes, tes stars ; le passé de l'organisation devient un onglet à part.
- **Question Q5a.** L'accueil et la boîte de messages (R13, R17) deviennent-ils un seul écran, comme le portail de FM ?
- **Ta décision.** Non mais possibilité de voir les messages dans l'accueil avec une possibilité d'ouvrir l'écran message.
- **Ce qu'on fera.** L'accueil et la messagerie restent deux écrans. L'accueil montre les derniers messages, avec un lien qui ouvre l'écran des messages.
- **Question Q5b.** Peux-tu me dire quelles incohérences tu as vues à droite, ou je les relève moi-même en jouant ?
- **Ta décision.** Tu verras en jouant, je veux juste de la cohérence.
- **Ce qu'on fera.** Pas de liste à fournir : je relève moi-même les incohérences de l'accueil en jouant et je les corrige. Objectif : de la cohérence partout.

#### R6 — Clic sur un combattant des promesses

&#91;image: R6 — écran ouvert depuis les promesses\]

> j'ai cliquer sur le combattant qui voulait se combattre dans les promesses et ça m'a mis cette écran, je ne sais pas ce que c'est, c'est pas normal

- **Ce que je comprends.** Le clic ouvre la présentation EFFECTIF (14/17, Ricardo Ibarra 8-11-0) avec « Ce que les gens en pensent » vide : mauvais écran de destination et panneau vide.
- **Piste.** Ce clic doit ouvrir la fiche du combattant (en panneau, T7) ; corriger le lien et ajouter un test.
- **Question Q6.** Les promesses restent-elles dans le jeu ? (voir Conflits)
- **Ta décision.** Oui  mais après la première soirée. Et plus joliment fait, car la c'est juste une petite phrase sur le combattant qui se superpose et d'où on ne garde aucun trace ni obligations.
- **Ce qu'on fera.** Les combattants font des demandes, et le joueur peut s'y engager après la première soirée : le système marche comme des promesses (trace, obligations, conséquences si l'engagement n'est pas tenu), mais le mot « promesse » n'apparaît pas dans le jeu (point tranché n° 1). Le clic sur ce combattant ouvrira sa fiche en panneau, avec un test.

### 3. Les dossiers de Leïla (R7 à R9)

#### R7 — Dossier, combat 3

&#91;image: R7 — dossier de Leïla, combat 3\]

> j'ai quand même l'impression que le dossier, ne donne pas une bonne impression du jeu, j'ai pas l'impression que quelqu'un comprendra vraiment quoi faire ici, et surtout pourquoi choisir ces combattants précisément, "le combat 3" n'a en soit pas de sens dis comme ça. faudrait comprendre, avoir un œil sur le matchmaking en cours je pense. Les infos marqué n'ont que trop peu d'intérêt, ça ne me convainc pas que je vais le choisir, actuellement c'est que le palmarès. En plus ça parle de revanche, ça nous choisit presque déjà notre adversaire sans vraiment qu'on s'en occupe.

- **Ce que je comprends.** (1) On ne sait pas quoi faire ni pourquoi ces combattants. (2) « Le combat 3 » ne veut rien dire sans voir la carte en cours. (3) Seul le palmarès est montré : rien ne donne envie. (4) « Revanche » choisit l'adversaire à ta place.
- **Fichiers.** `mgmt-carte.js`, `mgmt-ecran-carte.js`, `mgmt-carte-cadre.js`.
- **Piste (mise à jour).** Tu composes toi-même par défaut ; les dossiers de Leïla s'ouvrent à la demande, à côté de la carte, avec des raisons de choisir (forme, série, style, ce que le public veut). L'adversaire n'est jamais imposé.
- **Question Q7.** Les dossiers de Leïla restent-ils une étape à part, ou deviennent-ils des suggestions directement dans l'écran de la carte ?
- **Ta décision.** De base tu choisis toi mais tu peux demander les dossiers de Leïla si tu manques d'idées par exemple.
- **Ce qu'on fera.** Par défaut, tu choisis toi-même les combats depuis la carte. Les dossiers de Leïla deviennent une aide à la demande (« Demander à Leïla »), par exemple quand tu manques d'idées. L'adversaire n'est jamais imposé.

#### R8 — Dossier de Chan-ho Yeom

&#91;image: R8 — dossier Chan-ho Yeom\]

> ça montre des combattants vieux, avec plus de défaite que de victoire, qui n'ont pas combattue mais qui a marqué sort d'un KO récent ??? Il y a un manque de logique derrière. Cette écran des dossiers et aussi la pour qu'on trouve des nouveaux chouchous à aimer avec un bouton suivre ici aussi, un bouton pour le voir en détail, des boutons retour aussi ça serait pas mal. On devrait voir la carte avant de voir les dossiers. Ici on pourrait trouver un 3-0 encore bas classé mais qui a mis 2 KO et ensuite on peut lui proposer un défi très relevé, de même niveau ou facile pour qui grimpe au échelon, il y a tellement de possibilités de scénario, on peut tous les adapter en fonction avec des écrans adapté

- **Ce que je comprends.** (1) Contradiction : Yeom « attend depuis 17 mois », « Rouillé », mais aussi « Fragile après un KO – sort d'un K.-O. récent ». (2) Les dossiers proposent des profils peu attirants (vieux, plus de défaites). (3) Demandes : bouton Suivre, bouton Détail, bouton Retour, voir la carte avant les dossiers. (4) Idée de scénarios : un 3-0 bas classé avec 2 KO à qui on propose un défi très relevé, de même niveau, ou facile.
- **Cause (hypothèse).** Le trait « Fragile après un KO » ne regarde pas la date du KO.
- **Piste (mise à jour).** Chaque dossier propose plusieurs confrontations différentes et propres au combattant, chacune avec son histoire ; aucun « niveau de défi » ni « combat facile ».
- **Question Q8a.** Tu veux ces trois niveaux de défi systématiquement, ou seulement pour les jeunes en montée ?
- **Ta décision.** C'est pas vraiment des défis mais plutôt des confrontations différentes pour chaque combattants
- **Ce qu'on fera.** Pas de niveaux de défi : chaque dossier propose des confrontations différentes et propres à chaque combattant.
- **Question Q8b.** Quels autres scénarios veux-tu (revanche, retour de blessure, combat de la dernière chance…) ? Je peux t'en proposer une liste.
- **Ta décision.** J'en veux énormément car c'est ça qui fait l'esprit du jeu, c'est les histoires derrière. Mais faut pas que ça rentre dans des phases tuto ou faire perdre l'authenticité des autres combattant en le nommant "combat facile" les deux doivent avoir de la véritable originalité.
- **Ce qu'on fera.** Un très grand nombre de scénarios et d'histoires derrière les combats, c'est l'esprit du jeu. Aucune étiquette de tutoriel et jamais de « combat facile » : les deux combattants ont une vraie originalité. Je te propose une longue liste de scénarios à valider avant le code.

#### R9 — Étape 2, l'adversaire

&#91;image: R9 — étape 2, adversaire Gwenaël Vaillant\]

> J'ai choisi Yeom mais je ne me rappelle plus de son classement, j'ai oublié de voir sa fiche, je ne peux pas faire de retour arrière. Ici il y a marqué qu'il a perdu contre mais il est deux fois mieux classé, par KO en plus. Et dans son histoire il y a marqué juste Yeom, ça ne veut rien dire, ensuite il y a marqué rouillé depuis 553 cycles, ça ne doit pas être là, ça ne signifie rien non plus, le grand rectangle rouge ne sert à rien, il n'y a pas les surnoms non plus. Ils ont tous pas de combat depuis tant de mois, j'ai l'impression que personne ne combat en 6 ans, et aussi les classements n'ont aucun sens comme les palmarès, ici on est à chaque fois censé être dans les 8 meilleurs organisation du monde, ce n'est pas censé être des palmarès visible ou alors faut bien délimiter le niveau de chaque ( split = one championship, le premier l'UFC, la dernière l'ares) est là on peut faire des palmarès différents et logique avec les âges différents aussi, ce qui rendrait tout bien différent. Pareil avec les combattants vieux qui ont des palmarès énorme, le palmarès grandit avec l'âge sur chaque combattant, c'est pas similaire à la vraie vie .

- **Ce que je comprends.** (1) Pas de retour arrière (T7) et le classement du combattant choisi n'est plus visible. (2) Incohérence : Vaillant (n°10) a perdu contre Yeom, mais il est deux fois mieux classé. (3) « Son histoire ici : Chan-ho Yeom » n'est qu'un nom. (4) « Rouillé – sans combat depuis 553 cycles » : chiffre interne (vérifié, T8). (5) Le grand rectangle rouge ne sert à rien. (6) Pas de surnoms. (7) Tout le monde est inactif depuis des mois. (8) Les palmarès doivent dépendre du niveau de l'organisation : « split = one championship, le premier l'UFC, la dernière l'ares ». (9) Les vieux ont des palmarès énormes.
- **Piste.** Garder le combattant choisi visible (rang, bilan, surnom) pendant le choix de l'adversaire ; expliquer une revanche en une phrase claire (« Yeom l'a mis KO en 2025, Vaillant veut sa revanche ») ; retirer le rectangle rouge ; le reste relève de T8.
- **Question Q9a.** L'échelle des organisations (UFC en haut, ONE pour Split, Ares en bas) remplace-t-elle l'ordre de prestige du 17/10 ? (voir Conflits)
- **Ta décision.** Faut un classement comme actuellement mais que si tu prends le dernier tu as des palmarès comme l'ares et l'hexagone, beaucoup de joueurs très jeunes, très peu de combat, alors qu'à l'UFC tu as de tout des gens en 30-12 comme des gens en 10-0, la comparaison avec les organisations existante c'est pour mieux comprendre mon envie, pas une obligation.
- **Ce qu'on fera.** On garde l'ordre de prestige actuel (voir C2), mais il bouge avec les résultats (Q32a). Le palmarès suit le rang : en bas de l'échelle, des profils comme l'Ares ou l'Hexagone (beaucoup de jeunes, très peu de combats) ; en haut, de tout, du 30-12 au 10-0. Les vraies organisations servent de comparaison, pas d'obligation.
- **Question Q9b.** Un combattant classé qui a perdu contre un moins bien classé : on garde (c'est possible en vrai) en l'expliquant, ou on corrige le calcul du classement pour que la victoire pèse plus ?
- **Ta décision.** La victoire doit plus peser, comme si il y a une finition ou pas, comme dans UFC encore, c'est des recherches à faire.
- **Ce qu'on fera.** Le calcul du classement donne plus de poids à la victoire, et tient compte de la finition, comme à l'UFC. Les règles exactes viennent d'une recherche (voir « Recherches à faire »).

### 4. La présentation du combat et le face-à-face (R10)

#### R10 — Yeom contre Fedorov

&#91;image: R10 — présentation Yeom contre Fedorov\]

&#91;image: R10 — face-à-face\]

> Cette écran de présentation de combat ne sert à rien, regarde attentivement, tu verras que ça n'apporte rien dutout, c'est pas clair "avantages à droite" c'est vide, il y a que un qui donne des pronostics, tableau noir je ne sais pas ce que c'est. Et on voit même pas les sous menus tout en haut. Ensuite dans le face à face d'en haut, c'est mieux sur les statistiques l'un contre l'autre même si il manque un petit marqueur montrant qui "gagne" entre l'un et l'autre sur chaque stat pour qu'on comprenne d'un seul coup d'œil et ensuite tout en bas, c'est pareil, des infos déjà vu qui servent à rien. Et à chaque fois il y a marqué peu de combat documenté alors que d'un côté on a 11 combat et de l'autre 27. Et dans d'autres combat, "leur histoire" et j'en passe ne sont que très peu compréhensible.

- **Ce que je comprends.** Présentation : « Avantage à droite » vide ; un seul média sur trois donne un pronostic ; « Tableau Noir » n'est pas expliqué ; les sous-menus du haut sont cachés. Face-à-face : bon principe, mais il manque un marqueur « qui gagne » sur chaque stat ; le bas répète des infos ; « Peu de combats documentés » s'affiche à tort ; « Leur histoire » est peu claire.
- **Cause (vérifié).** « Peu de combats documentés » s'affiche quand l'un des deux a moins de 3 combats avec statistiques détaillées (`mgmt-presentation-ecrans.js` ligne 86). Ce compteur ne prend que les combats détaillés, pas le palmarès entier (11 et 27) : d'où le message trompeur.
- **Piste (mise à jour).** Deux écrans distincts (présentation, face-à-face), chacun riche en informations uniques au combat ; stats face à face avec un point ou une couleur du côté gagnant ; trois médias renommés et présentés ; une histoire lisible.
- **Question Q10a.** On fusionne les deux écrans en un seul ?
- **Ta décision.** Non le but c'est d'avoir plein d'info personnalisé et unique pour chaque combat, présentation et face à face.
- **Ce qu'on fera.** On garde deux écrans distincts, présentation et face-à-face, chacun avec beaucoup d'informations personnalisées et uniques pour chaque combat. On ne fusionne pas.
- **Question Q10b.** Le marqueur gagnant : une flèche, une couleur, ou la barre qui déborde vers le meilleur ?
- **Ta décision.** Un point devant la barre où une couleur oui.
- **Ce qu'on fera.** Le meilleur côté est marqué par un point devant la barre ou par une couleur ; les deux sont montrés dans la maquette.
- **Question Q10c.** On garde les trois médias (Cage Hebdo, Tableau Noir, Le Forum) en les présentant, ou on en retire ?
- **Ta décision.** Des noms plus originaux mais compréhensible en les présentant.
- **Ce qu'on fera.** Les trois médias restent mais changent de nom : plus originaux, compréhensibles, et présentés au joueur. Je te propose des noms à valider.

### 5. L'interface générale (R11, R17)

#### R11 — Textes, look FM, barre latérale, police, fond (sans capture)

> Faut refaire chaque dialogue et phrase de littéralement tout le jeu, pour être sûr la même ligne éditoriale. Et je veux aussi rendre l'écran plus "minimaliste" à la Football manager 27 afin de vraiment à chaque fois avoir le plus important, un bouton avec un slide pour raccourcir tout les écrans de gauche en petite icône SVG très identifiable, et quand il y a l'octogone jaune, signe qu'il y a des choses à faire alors ça sera un petit octogone jaune plus petit dans l'angle en haut à droite du SVG. Aussi essayer de voir pour enlever des éléments de la side bar, rajouter un sous menu sur la carte pour les préliminaires. La presse et les camps ensemble, résultats et calendrier, finance et organisation, ceinture, effectif et classement, carte et préliminaires. Avec des nouveaux noms histoire qu'on comprenne tout et que tout soit plus lisible à l'écran, on va garder l'essentiel. La police d'écriture de partout m'énervent, je la trouve sans aucune vie, comme le fond par ailleurs cendré qui ne ressemble pas au jeu, pareil ici s'inspirer de Football manager.

- **Traitée dans** T2 (look, police, fond), T4 (barre latérale, regroupements, noms) et T6 (textes). Les questions sont là-bas.
- **Regroupements demandés, mot pour mot :** presse + camps ; résultats + calendrier ; finance + organisation ; ceinture + effectif + classement ; carte + préliminaires.
- **Question Q11.** Les écrans qui ne sont dans aucun groupe (Contrats, Recrutement, Recruteur, Actualités, Poste, Carnet, Croissance) : où les ranges-tu ? Je peux te proposer un schéma complet.
- **Ta décision.** Oui il faut ranger de manière plus logique et organisé, pas forcément ce que j'ai demandé c'était des exemples.
- **Ce qu'on fera.** Je te propose un schéma de navigation complet et logique, qui range aussi Contrats, Recrutement, Recruteur, Actualités, Poste, Carnet et Croissance. Tes regroupements de R11 servent d'exemples. Le schéma est validé avec la maquette.

#### R17 — La référence Football Manager : avancer jour après jour

&#91;image: R17 — capture de référence Football Manager\]

> Ce qui donne envie de jouer, de connaître les combattants ou les joueurs, c'est le fait que tu progresses de jour en jour jusqu'au infos, aux décisions d'entraîneur, avec des messages, des news, des infos, tu te dis un jour en plus, puis encore un jour. Rajouter un écran continuer et éventuellement d'autres trucs que tu trouverais intéressant.

- **Ce que montre la capture.** Le portail de FM : vue d'ensemble, messages, et le bouton « Continuer » en haut à droite.
- **Traitée dans** T10. Mes idées en plus, à valider : un bouton Continuer toujours au même endroit qui s'arrête sur chaque message important ; un résumé de la journée ; des événements entre les soirées (blessure à l'entraînement, agent qui réclame, rumeur, offre d'une autre organisation).
- **Question Q17.** Lesquelles de ces idées gardes-tu ?
- **Ta décision.** Oui avec plus d'événements, autant que FM en gardant des probabilités de chaque action réaliste.
- **Ce qu'on fera.** Toutes les idées sont retenues, avec autant d'événements que FM et des probabilités réalistes pour chacun. La liste d'événements et leurs probabilités sont à valider avant le code (lié à T10).

### 6. La carte (R12)

#### R12 — Composer la carte

&#91;image: R12 — carte à 3 sur 5\]

&#91;image: R12 — carte à 2 sur 5\]

> L'écran de la carte et assez farfelu avec des quantités d'informations dans tout les sens et surtout, toutes ces touches clavier de partout sur chaque écran, c'est pas normal, il n'y a pas ça dans football manager, normalement tout peut être fait à la souris seulement sans bouton comme précédent et suivant normalement on peut swipe juste. Ensuite le combat du dossier était pour le n°3 maintenant il se met en 1 et je ne peux pas interchangé chaque place de la carte, ce qui n'a pas de sens, avec un bouton annuler sur chaque combat alors que normalement ça devrait se trouver au milieu quand tu cliques sur le combat, comme présentation, qui est déjà ici et donc n'a rien à faire à gauche sur les combat. Les phrases en dessous des combattants, on s'en fout, on ne sait pas ce que ça signifie, faudrait que le plus important lisible en un coup d'œil. L'écran quand tu ne choisis pas de combattant et vide comme tu peux le voir avec une phrase de l'ancien combattant déjà choisi. À droite que 5 combattant par 5 ça donne pas envie d'aller voir les autres, ni de comprendre quel combat il mérite. Une fois que j'ai rempli toute la carte, je ne peux pas valider les combat ni avoir un résumé, enfaite globalement j'ai pas assez de liberté sur cette écran alors que c'est le plus important, c'est celui ou les gens passeront la moitié de leur temps. C'est à refaire en cliquant. Plein de combattant sont marqués indisponible sans raison dont des fois ceux qui veulent des promesses. Faudrait s'inspirer de Football manager et faire un écran infirmerie pour garder un œil sur les blessé, et toutes les infos.

- **Ce que je comprends, point par point.**
  1. Trop d'informations dans tous les sens, touches clavier partout (T1).
  2. Pas de « Précédent / Suivant » : on doit pouvoir glisser.
  3. Bug : le combat prévu en n°3 se place en n°1.
  4. On ne peut pas échanger deux places de la carte.
  5. Le bouton Annuler \[X\] est sur chaque combat à gauche ; il devrait être au centre, quand on clique sur le combat, comme la présentation.
  6. Les phrases sous les combattants n'apportent rien ; il faut l'essentiel lisible d'un coup d'œil.
  7. Sans combattant choisi, le centre est vide et garde une phrase de l'ancien combattant.
  8. La liste de droite montre 5 combattants à la fois : on ne va pas voir les autres et on ne voit pas quel combat chacun mérite.
  9. Carte remplie : pas de validation ni de résumé.
  10. Pas assez de liberté sur l'écran où l'on passera « la moitié de leur temps » : à refaire en cliquant.
  11. Beaucoup de combattants « Indisponible » sans raison, dont certains qui réclament un combat dans les promesses.
  12. Créer un écran Infirmerie façon FM.
- **Piste.** Une carte refaite en glisser-déposer : les places à gauche (échangeables), la liste complète à droite (défilante, avec filtres et le niveau de combat mérité), le combat sélectionné au centre avec Présentation et Annuler, un bouton Valider qui ouvre un résumé. Chaque « Indisponible » affiche sa raison (blessé, refuse, déjà pris).
- **Question Q12a.** Glisser-déposer pour placer et échanger les combats, ça te va ?
- **Ta décision.** Oui. Et en plus c'est satisfaisant pour le joueur.
- **Ce qu'on fera.** Carte en glisser-déposer pour placer et échanger les combats, avec une sensation satisfaisante (animation au dépôt).
- **Question Q12b.** L'Infirmerie : un écran à part, ou un onglet de l'Effectif ?
- **Ta décision.** Comme tu préfères, sûrement dans l'effectif.
- **Ce qu'on fera.** Tu me laisses choisir : l'Infirmerie devient un onglet de l'Effectif (proposition, visible dans le schéma de navigation).
- **Question Q12c.** Que doit contenir le résumé après validation (recette prévue, intérêt du public, risques) ?
- **Ta décision.** Recette estimé, un bilan de la carte, intérêt, risque,  en soit ça peut regrouper énormément d'informations, mais il faudrait ces infos avant de valider afin de faire la carte en fonction, et que les préliminaires soit concerné que en très petite partie.
- **Ce qu'on fera.** Un bilan visible pendant la composition, avant de valider : recette estimée, bilan de la carte, intérêt du public, risques. Le joueur compose la carte en fonction. Les préliminaires ne comptent que pour une très petite part de ce bilan.

### 7. Les actualités (R13)

#### R13 — Actualités en trois colonnes

&#91;image: R13 — écran Actualités\]

> L'écran Actualites est enfaite un interface message, faut aussi ici s'inspirer de Football manager avec leur acceuil et leur interface message. Ici trois colonnes dont celle tout à droite inutile et celle à gauche ou les suivis ne devrait pas être là, plutôt les messages et en centre le message sur lequel on a cliquer et trouver un autre emplacement plus adapté pour le fil et les suivis. D'ailleurs l'événement de croissance devrait être considéré comme un message pallier franchi plutôt que dans le fil.

- **Ce que je comprends.** Devenir une vraie boîte de messages FM : à gauche la liste des messages, au centre le message ouvert ; supprimer la colonne de droite ; déplacer « Le fil » et « Tes suivis » ailleurs ; l'événement de croissance devient un message « palier franchi ».
- **Fichiers.** `mgmt-actualites.js`, `mgmt-ecran-actualites.js`.
- **Question Q13.** Où vont « Le fil » et « Tes suivis » : dans la Presse (R28), sur l'accueil, ou dans l'Effectif ?
- **Ta décision.** Ou tu penses que ça sera le mieux dans la réorganisation.
- **Ce qu'on fera.** Tu me laisses choisir dans la réorganisation : je place « Le fil » et « Tes suivis » dans le schéma de navigation, que tu valides.

### 8. Les préliminaires (R14)

#### R14 — Plus de combats féminins (sans capture)

> Faire en sorte que les préliminaires fasse un peu plus de combats entre femmes car les joueurs en font très peu et faut que ça bouge quand même. Peut-être passer à 5 préliminaires ou 6.

- **Ce que je comprends.** Les préliminaires sont composés automatiquement (`mgmt-prelims.js`) ; le joueur place peu de femmes, donc les préliminaires doivent compenser pour que les divisions féminines vivent. Et passer à 5 ou 6 préliminaires.
- **Question Q14a.** Combien de préliminaires : 5 ou 6 ?
- **Ta décision.** 6 pour 4 principal je pense. À tester et il faut qu'on est pareil un résumé des préliminaires avant la carte et après la soirée.
- **Ce qu'on fera.** 6 préliminaires pour 4 combats principaux, à tester en jeu. Un résumé des préliminaires est affiché avant la carte et après la soirée.
- **Question Q14b.** Une part minimale de combats féminins (par exemple au moins 2) ou simplement une priorité aux combattantes inactives ?
- **Ta décision.** Priorité aux inactif et inactive avec au moins 2 par prelis du moment que ça ne le fait pas trop de combat par ans, à doser en fonction de ça.
- **Ce qu'on fera.** Priorité aux combattants et combattantes inactifs, avec au moins 2 combats féminins par préliminaires, dosé pour ne pas dépasser un nombre de combats par an réaliste.
- **Question Q14c.** Avec le sous-menu « carte et préliminaires » (R11), le joueur peut-il aussi modifier les préliminaires à la main ?
- **Ta décision.** Oui si il le souhaite.
- **Ce qu'on fera.** Le joueur peut modifier les préliminaires à la main s'il le souhaite ; sinon ils sont composés automatiquement.

### 9. L'effectif (R15)

#### R15 — Effectif, poids légers

&#91;image: R15 — effectif poids légers\]

> cette écran est illisible, déjà en haut le 29 combattant en poid léger c'est pas top. Ensuite il y a des croix dont une vide qui ne servent pas. Les trois derniers combats on ne sait pas ça se lit dans quel sens, d'ailleurs les 5 derniers combats seraient plus intéressant, il y en a un qui refuse tout combat mais ça, ça devrait arriver en jouant avec une raison, comme faire pour changer cette avis au lieu de juste refuser tout alors que je viens d'arriver.

- **Ce que je comprends.** (1) « 29 combattants en poids léger » en titre n'est pas un bon en-tête. (2) Des croix (dont une vide) sans rôle. (3) Les 3 derniers combats (ronds V/D) : sens de lecture inconnu ; en montrer 5. (4) « Refuse tout combat » (Ndong) dès l'arrivée : le refus doit naître en jouant, avec une raison et un moyen de faire changer d'avis.
- **Piste.** Un tableau façon FM : colonnes triables, forme sur 5 combats lue de gauche (ancien) à droite (récent) avec une flèche, statut lisible (blessé 15 semaines, mécontent…) ; aucun refus au départ.
- **Question Q15a.** Que doivent être les raisons de refus (salaire, adversaire jugé indigne, attente trop longue, blessure mal soignée…) et les moyens de faire changer d'avis (augmentation, promesse de titre, discussion) ?
- **Ta décision.** Plein plein plein de raison, le but c'est l'authenticité de chaque combattant avec des raisons honnête et réaliste, et avec des solutions de même niveau. Un taux de combattant qui refusent juste et avec de bonnes probabilité.
- **Ce qu'on fera.** Beaucoup de raisons de refus différentes, honnêtes et réalistes, propres à chaque combattant, chacune avec une solution de même niveau. Un taux de refus juste, avec des probabilités réalistes. Je te propose la liste des raisons et des solutions à valider.
- **Question Q15b.** Au départ, zéro refus, ou un ou deux cas préparés pour lancer une histoire ?
- **Ta décision.** Peu de cas oui. Peut-être dans les messages.
- **Ce qu'on fera.** Peu de cas au départ, qui peuvent arriver par les messages.

### 10. La fiche du combattant (R16)

#### R16 — Fiche de Raúl « El Yunque » Acosta

&#91;image: R16 — fiche, onglet Contrat\]

> Dans cette écran déjà les champions on des contrats immense et illogique. Ensuite l'écran globalement ne sert à rien, il faut rendre chaque écran à l'essentiel seulement, y combiné deux écrans si nécessaire. Trop d'infos de tuto " un contrat se signe entre 1 et 8 combat" et ça c'est absolument partout de toutes les façons différentes dans tout le jeu, c'est pas normal. Le joueur le découvrira au moment de prolonger ou de signer un combattant. Je vais faire simple mais l'écran on en dit c'est pareil, on ne comprends rien, on ne veux pas comprendre. Le bouton onglet suivant, avec le 0/60 rejoins ce que je disais sur le "tuto" constant + les touches de clavier partout. Le sous menu combat prend trop de place pour rien, l'octogone n'est jamais rempli à chaque fois juste colorié et hachuré. Et les combat peuvent être simplifier raccourcis, lisible, avec même plus d'information que là . Toujours pas de bouton Retour, j'ai cliqué qui sur un autre combattant dans combat et j'ai pas pu faire retour arrière. Pour Statistiques, ça va, mais ça manque vraiment de compréhension, donc le curseur de la moyenne de l'organisation dans cette catégorie suis n'est pas là des codes couleurs neutres, dans les finitions "arrêt" ça ne signifie rien non plus. C'est globalement peaufinable. Dans Style, c'est peaufinable aussi, ici force et faille fait semblé à un jeu vidéo et pas la vraie vie, ça ne démontre pas le style mais plutôt une analyse des combats passé, encore l'octogone qui sert à rien, la profession avec les points c'est censé être une donnée qui ne s'affiche pas, toutes les informations ici sont franchement oubliable. L'aperçu tiens la route mais ça se peaufine aussi en prenant tout les conseils de chacun des autres messages. Octogone toujours vide. Ce qu'il pense de toi, devrait être placé autre part et plus compréhensible. Surnom pas affiché.

- **Ce que je comprends, onglet par onglet.**
  1. **Contrat.** Les champions ont des contrats énormes et illogiques ; l'onglet ne sert pas tel quel ; le texte « Un contrat se signe pour 1 à 8 combats » est un tutoriel à retirer (T5) ; fusionner deux onglets si besoin.
  2. **On en dit.** Incompréhensible, « on ne veux pas comprendre ».
  3. **Onglet suivant 0/60.** Tutoriel et touche clavier (T1, T5).
  4. **Combats.** Le sous-menu prend trop de place ; l'octogone n'est jamais rempli, seulement colorié et hachuré ; les combats peuvent être plus courts, plus lisibles et plus riches ; pas de Retour après un clic sur un adversaire.
  5. **Statistiques.** Correct mais peu compréhensible : il manque un curseur de la moyenne de l'organisation dans la catégorie, des couleurs neutres ; « arrêt » ne veut rien dire dans les finitions.
  6. **Style.** « Force » et « Faille » font jeu vidéo ; ce n'est pas un style mais une analyse des combats passés ; octogone inutile ; la « profession avec les points » est une donnée qui ne devrait pas s'afficher ; tout est oubliable.
  7. **Aperçu.** Tient la route, à peaufiner avec toutes les autres remarques ; octogone vide ; « Ce qu'il pense de toi » à déplacer et rendre clair ; surnom absent.
- **Fichiers.** `mgmt-ecran-fiche.js`, `mgmt-fiche-*.js`, `mgmt-contrats*.js`.
- **Piste (mise à jour).** Autant d'onglets que nécessaire, chacun optimisé ; surnom sous le nom ; statistiques comparées à la moyenne de la catégorie ; plusieurs versions de l'octogone à essayer ; « On en dit » rendu intéressant ; un onglet combattant et organisation ; bouton Retour (T7).
- **Question Q16a.** Combien d'onglets veux-tu, et lesquels fusionner ?
- **Ta décision.** Autant que nécessaire, mais que chacun soit bien optimisé.
- **Ce qu'on fera.** Autant d'onglets que nécessaire, chacun bien optimisé. Je te propose le découpage en maquette.
- **Question Q16b.** « On en dit » (avis des médias et du public) : on le supprime de la fiche ou on le déplace vers la Presse ?
- **Ta décision.** On le laisse mais on le rend interressant, c'est ce qui permet de connaître le combattant en dehors des statistiques
- **Ce qu'on fera.** « On en dit » reste dans la fiche mais devient intéressant : il fait connaître le combattant en dehors des statistiques.
- **Question Q16c.** L'octogone : on le remplit avec une note (par exemple la note globale), ou on le retire des fiches ?
- **Ta décision.** On essaie plusieurs possibilités.
- **Ce qu'on fera.** Plusieurs versions de l'octogone sont essayées dans la maquette avant de choisir.
- **Question Q16d.** « Ce qu'il pense de toi » : où le mettre (Aperçu en haut, ou dans le Contrat au moment de négocier) ?
- **Ta décision.** Peut être dans un onglet relatif au combattant et à l'organisation.
- **Ce qu'on fera.** « Ce qu'il pense de toi » va dans un onglet consacré au combattant et à l'organisation (sa relation avec Split et avec toi).
- **Question Q16e.** Quel niveau de salaire pour un champion de Split, comparé à un combattant moyen (par exemple 3 fois, 5 fois) ?
- **Ta décision.** faudrait trier les salaires comme dans la vraie vie.
- **Ce qu'on fera.** Les salaires suivent une échelle réaliste, comme dans la vraie vie (recherche sur les barèmes réels, voir « Recherches à faire »).

### 11. Les classements (R18, R19, R20, R21)

#### R18 — Classement de Split, poids légers

&#91;image: R18 — classement Split poids légers\]

> Sûrement un des écrans les plus complets même si il manque les tunnel rouge, le logo sur le n°1 et n°2 ainsi qu'un combattant (n°4) qui n'a ni série ni dernier combat. Et peut-être trouver un code couleur pour les victoires et une pour les défaites, car rouge ne fait pas victoire et noir sur blanc on ne fait pas vraiment attention. Pareil pour les montée et les descentes ici les descentes en rouge et les montée en blanc c'est dommage. Tout en haut, il y a de la superposition et l'emplacement des sous menu n'a rien à faire tout en haut

- **Ce que je comprends.** Écran jugé parmi les plus complets. Il manque : (1) le « tunnel rouge » (le cadre de l'écran de discours, voir R37) ; (2) le logo sur les n°1 et n°2 ; (3) le n°4 (Morgan) n'a ni série ni dernier combat. Couleurs : victoire et défaite à distinguer (le rouge ne dit pas « victoire », le noir sur blanc ne se voit pas) ; montées et descentes aussi (descente rouge, montée blanche = dommage). En haut : superposition, et les sous-menus n'ont rien à faire tout en haut.
- **Cause probable.** Morgan : combattant généré sans historique détaillé (même famille que T9, le passé du monde). Superposition : bandeau d'onglets en conflit avec l'en-tête (T4).
- **Question Q18a.** Quel code couleur veux-tu pour victoire / défaite et montée / descente (par exemple vert / rouge, ou deux couleurs de la charte) ?
- **Ta décision.** Vert rouge
- **Ce qu'on fera.** Vert / rouge pour victoire / défaite et montée / descente, comme le code couleur commun (T11).
- **Question Q18b.** « Le logo sur le n°1 et n°2 » : le logo de Split, ou le logo de l'organisation d'origine du combattant ?
- **Ta décision.** C'est pas le logo de Split, c'est le logo du jeu.
- **Ce qu'on fera.** On ajoute le logo du jeu (pas celui de Split) sur le n°1 et le n°2, où il manque aujourd'hui.
- **Question Q18c.** Où placer les sous-menus (Classement / Les meilleurs / Mondial / Records) s'ils ne sont plus en haut : dans la barre latérale, ou en onglets sous le titre ?
- **Ta décision.** ça peut être en haut mais peut-être moins haut, c'est à peaufiner.
- **Ce qu'on fera.** Les sous-menus (Classement / Les meilleurs / Mondial / Records) restent en haut, mais un peu plus bas qu'aujourd'hui, sans superposition ; à peaufiner sur la maquette.

#### R19 — « Les meilleurs »

&#91;image: R19 — les meilleurs\]

> Quand je clique tout en haut sur les meilleurs ça ouvre ça, on dirait une DA complètement différente. La différence homme femme est bien. Je ne sais pas pourquoi il y a autant d'écran dans le jeu qui on les coins rogné Au lieu d'un octogone, les deuxième et troisième sont probablement bugué et des fois inexistant et quand je clique sur un cadre ça ouvre le combattant au lieu de la liste dans l'ordre des stats de tout les combattants logiquement. Dans les sous menu un écran mondial apparaît. Manque de couleur, un écran "vitrine" comme ça à moyen de faire des choses vraiment intéressant.

- **Ce que je comprends.** (1) Direction artistique différente du reste. (2) La séparation hommes / femmes est bonne (à garder). (3) Beaucoup d'écrans ont des coins rognés au lieu d'un octogone. (4) Les 2e et 3e places semblent buguées, parfois absentes (Balogun apparaît partout). (5) Cliquer sur un cadre ouvre le combattant ; il faudrait ouvrir le classement complet de cette statistique. (6) Un écran « Mondial » apparaît dans les sous-menus (voir R20). (7) Manque de couleur ; écran « vitrine » à exploiter.
- **Cause probable.** Peu de combattants avec assez de combats détaillés, donc un seul nom remplit les cadres (même cause que « Peu de combats documentés », `mgmt-combat-chiffres.js:9`). À vérifier.
- **Question Q19a.** Le clic sur un cadre : il ouvre la liste complète de la statistique, et le clic sur un nom de cette liste ouvre la fiche. D'accord ?
- **Ta décision.** Oui.
- **Ce qu'on fera.** Le clic sur un cadre ouvre la liste complète de la statistique ; le clic sur un nom de cette liste ouvre la fiche en panneau.
- **Question Q19b.** Coins rognés : on remplace par la forme octogonale partout dans le jeu, ou seulement sur certains éléments (lesquels) ?
- **Ta décision.** Tous on peut essayer.
- **Ce qu'on fera.** On essaie la forme octogonale partout à la place des coins rognés, d'abord dans la maquette de charte.

#### R20 — Classement mondial

&#91;image: R20 — classement mondial poids mouches\]

> L'écran mondial est pire que l'écran classement, au début je n'avais pas compris que c'était les classements mondiaux. On ne voit pas qui est dans quel organisation, ni les séries en cours ni les derniers combats, ni les combat programmé de leur côté, il n'y a plus de surnoms, toujours un énorme bug visuel tout en haut et des palmarès complètement insensé avec ce qui se fait dans les vrai organisation.

- **Ce que je comprends.** Titre peu clair (on ne comprend pas que c'est mondial). Il manque : l'organisation de chaque combattant, la série, le dernier combat, le prochain combat prévu, le surnom. Bug visuel en haut (T4). Palmarès irréalistes : David 48-10-1, Kerr 55-7-0 (T8, réalisme).
- **Cause probable.** Les organisations IA simulent trop de combats par combattant sur la durée (aussi la cause des 15 défenses de R21 et des séries de R22).
- **Question Q20a.** Quel palmarès maximum est crédible pour un vétéran (par exemple 30 combats, 40) ? Combien de combats par an pour un combattant d'une organisation IA (2 ou 3, comme à l'UFC) ?
- **Ta décision.** Oui se fier entièrement à l'UFC pour les palmares ou d'autres organisations mondial
- **Ce qu'on fera.** Les palmarès et le rythme de combats suivent entièrement l'UFC et les grandes organisations mondiales (recherche, voir « Recherches à faire »).
- **Question Q20b.** Un seul écran de classement avec un filtre « Split / Monde », ou deux écrans séparés ?
- **Ta décision.** J'ai envie de dire que je préfère le visuel le plus intéressant.
- **Ce qu'on fera.** Tu me laisses choisir le visuel le plus intéressant : je montre les deux formules (un écran avec filtre Split / Monde, ou deux écrans) dans la maquette.

#### R21 — Records

&#91;image: R21 — records\]

> Je trouve l'écran des records drôlement vide et peu intéressant, quand je vois ça je ne suis pas surpris, on dirait une extension de les meilleurs mais en moins bien avec des statistiques complètement ahurissant (KO en 0 01) (15 défense de titre). Le tout mal expliqué sans couleur, sans voir le combattant, ce qu'il devient etc.. d'ailleurs la barre de slide au milieu est affreuse et n'a rien à faire ici. Il faudrait pouvoir avoir des soirées avant, qu'on arrive et que quand on arrive ça reprend à 0 au lieu de faire un split fight night 63. Mais pouvoir comprendre que tout ça c'est passé avant. Les traits sont d'ailleurs trop similaire, pour la plupart aucun intérêt ni impact et tout le monde possède les mêmes.

- **Ce que je comprends.** (1) Écran vide, « extension des Meilleurs en moins bien ». (2) Records impossibles : KO en 0:01, 15 défenses de titre, 361 coups. (3) Pas expliqué, sans couleur, sans voir le combattant ni ce qu'il devient. (4) La barre de défilement horizontale au milieu est affreuse (elle revient en R23 et R34). (5) Le passé : des soirées ont existé avant l'arrivée du joueur, mais la numérotation doit repartir de zéro pour lui au lieu de « Split Fight Night 63 », tout en faisant comprendre que ce passé existe (T9). (6) Les traits : trop semblables, sans intérêt ni effet, tout le monde a les mêmes.
- **Question Q21a.** Records : on garde un écran à part, ou on le fond dans « Les meilleurs » (onglet « Records historiques ») ?
- **Ta décision.** Peut-être un onglet qui cumule tout bien départagé
- **Ce qu'on fera.** Les records deviennent un onglet qui regroupe tout, bien séparé par type de record.
- **Question Q21b.** Les traits : on réduit leur nombre et on les rend rares avec un effet visible, ou on les retire de l'affichage ? Quels traits comptent pour toi ?
- **Ta décision.** On les rends plus rares mais on augmente leur nombre et je préfère que ce soit comme des caractéristiques sur FM (expert low kick (comme José Aldo), énorme cardio (volk ou merab), Muay Thai énergique (comme Carlos prates mais je ne sais pas comment définir) bref il y a énormément de possibilités, le menton, le Qi, les points, les finitions, les amenee, positif ou négatif mais qui on un vrai impact. Pour l'instant les traits ne me plaît pas trop.
- **Ce qu'on fera.** Les traits sont refaits comme des caractéristiques à la FM : plus nombreux au total, mais plus rares par combattant, positifs ou négatifs, avec un vrai impact sur les combats. Exemples cités : expert du low kick (José Aldo), énorme cardio (Volkanovski, Merab), Muay Thaï énergique (Carlos Prates), le menton, le QI de combat, les points, les finitions, les amenées au sol. Je te propose une liste complète à valider. Les traits actuels sont remplacés.
- **Question Q21c.** Numérotation : la première soirée du joueur s'appelle comment (Split Fight Night 1, ou un nom sans numéro) ? (Lié à R29 sur les noms de soirées.)
- **Ta décision.** S'appelle Split 1 pour les grandes soirée et Split : combattant 1 VS 2 pour le fight night (ex : Carlos prates vs Sean Brady)
- **Ce qu'on fera.** Grandes soirées : « Split 1 », « Split 2 »… Fight nights : « Split : combattant 1 vs combattant 2 » (exemple : Carlos Prates vs Sean Brady).

### 12. Les ceintures (R22)

#### R22 — Écran des ceintures

&#91;image: R22 — ceintures\]

> Beaucoup de choses sur cette écran ne vont pas, déjà c'est moche, c'est censé être TES champions, les meilleurs actuellement pourtant j'ai juste mal aux yeux, j'ai pas l'impression que c'est des bons combattant, juste des noms, puis pareil la logique. Certains on 6 défense en 18 mois, ce qui relève du miracle et d'autres on 0 défense en 71 mois, dans la vraie vie, c'est impossible. À moins d'une blessure, d'une retraite, mais à ce moment il y a la ceinture intérimaire, qui devient la ceinture principale après autant de temps. Bref la logique et le réalisme est à revoir en entier. Je ne sais pas pourquoi il y a une pastille sur le combattant en bas à droite. Je ne sais même pas si cette écran vaut le coup, car on a l'écran classement déjà. À la limite tu rajoutes le nombre de défense, le temps sur les champions et cette écran ne s'est plus à rien .

- **Ce que je comprends.** (1) Laid, ne met pas en valeur « tes » champions. (2) Illogique : David 6 défenses en 18 mois (miracle), Bertrand 0 défense en 71 mois, Wesołowski 2 en 58 mois. (3) Règle réelle : sans défense pendant longtemps (blessure, retraite), une ceinture intérimaire est créée et devient la ceinture principale. (4) Pastille inexpliquée sur Kwon en bas à droite. (5) Proposition : ajouter défenses et durée de règne au Classement, et supprimer cet écran.
- **Cause probable.** Pas de rythme de défense imposé à la simulation des ceintures, ni de règle d'intérim. À vérifier dans `mgmt-ceintures*.js`.
- **Question Q22a.** On supprime l'écran Ceintures et on ajoute défenses et durée de règne au Classement ? (Voir le conflit avec R11 dans la section Conflits.)
- **Ta décision.** Peut-être oui car je ne vois pas quoi faire de cette écran.
- **Ce qu'on fera.** La maquette montre une version de l'écran Ceintures avec un vrai sens (lignée des champions, règnes, intérims, prochain défi, regroupé avec le Classement) ; tu décides alors de le garder ou de le supprimer (point tranché n° 2). Défenses et durée de règne seront visibles dans le Classement quoi qu'il arrive.
- **Question Q22b.** Règle d'intérim : au bout de combien de mois sans défense une ceinture intérimaire est-elle créée, et au bout de combien devient-elle la ceinture principale ?
- **Ta décision.** C'est très varié et surtout très rare, regarde en vrai comment ça se passe à l'UFC globalement
- **Ce qu'on fera.** Ceintures intérimaires très variées et rares, d'après ce qui se passe réellement à l'UFC (recherche, voir « Recherches à faire »).
- **Question Q22c.** Rythme cible des défenses : environ 2 par an au maximum ?
- **Ta décision.** Tout dépend des combattants comme dans la vraie vie UFC, faire des recherches.
- **Ce qu'on fera.** Le rythme des défenses dépend de chaque champion, comme à l'UFC (recherche, voir « Recherches à faire »).

### 13. Contrats et recrutement (R23, R24, R25)

#### R23 — Contrats, poids mouches

&#91;image: R23 — contrats poids mouches\]

> Encore beaucoup de choses à dire là, déjà la quantité de menus, sous menu, c'est illisible ça va dans tout les sens. ça se chevauche de partout, ça se coupe de partout, la moitié refuse les combat, alors que quand je clique dessus, il y a marqué 53 mois que j'attends (c'est impossible vraiment c'est trop, c'est pas réaliste) je suis en forme, alors qu'il refuse, d'autres reviens rouillé. Je rejoins une organisation mondiale MMA pas une maison de retraite. Là je vois 14k par combat mais il y a marqué qui demande 10k que je propose 10k mais j'ai rien proposé. Des phrases tuto sont absolument partout. J'ai du mal à savoir qui doit avoir un renouvellement urgent, et qui est large. Je ne sais pas si les cases vides doivent être prolongé ou si c'est ceux avec les cases remplis. Il y a marqué la catégorie alors que quand je clique que sur les mouches il y a quand même marque qu'ils sont en mouche. Faudrait aussi un endroit où on voit tout les plus urgents sinon on cherchera partout. il y a encore la grande barre de slide il en affiche que 9 alors que je pourrais slide les 28 sans problème. Là je vois un combattant qui reste 2 combat en cours alors que en dessous il y a marqué qu'il en à fait que 3 sur 8. On ne voit pas ni le "il dit" ni ce que "clé de bras en dit" d'ailleurs on nous dit jamais que ce sont des médias, donc c'est bizarre si on ne le sait pas. Et je ne pense pas que ce soit l'endroit où affiché ça. Des fois, le numéro 1 est classé devant le champion.

- **Ce que je comprends, point par point.**
  1. Trop de menus et sous-menus, illisible, ça se chevauche et se coupe partout.
  2. La moitié refuse les combats, alors que la fiche dit « 53 mois que j'attends » (irréaliste) et « je suis en forme » ; d'autres reviennent rouillés. « Une organisation mondiale, pas une maison de retraite. »
  3. Incohérence d'argent : 14 000 € (capture : 21 000 €) par combat affiché, mais « il demande 10 000 €, tu proposes 10 000 € » (capture : 27 000 € et 27 000 €) alors que le joueur n'a rien proposé.
  4. Phrases de tutoriel partout (T5).
  5. On ne voit pas qui a un renouvellement urgent ou qui a de la marge.
  6. Les cases vides ou remplies (combats restants) : on ne sait pas lesquelles signalent une prolongation.
  7. La catégorie est répétée sur chaque ligne alors qu'on filtre déjà sur les mouches.
  8. Il manque un endroit qui regroupe tous les plus urgents.
  9. La grande barre de défilement : 9 visibles alors qu'on pourrait faire défiler les 28.
  10. Un combattant « reste 2 combats » mais « 3 sur 8 faits » (2 + 3 ≠ 8).
  11. « Il dit » et « Clé de bras en dit » ne s'affichent pas ; on n'explique jamais que Clé de bras est un média ; pas le bon endroit pour ça.
  12. Parfois, le n°1 est classé devant le champion.
- **Cause probable.** Point 10 : soit le texte « reste » compte autre chose (combats avant échéance prévue), soit une donnée de contrat est fausse ; à vérifier dans `mgmt-contrats*.js`. Points 2 et 3 : le compteur d'attente (« 553 cycles » vient de `mgmt-traits-textes.js:29`, compteur interne affiché tel quel) et une « demande » préremplie affichée comme une proposition. Point 12 : tri de la liste sur le rang sans placer le champion en premier.
- **Question Q23a.** Combien de temps maximum un combattant peut-il rester sans combattre avant d'être relâché ou de réclamer (par exemple 12 mois) ?
- **Ta décision.** Je pense qu'il se plaint dans les messages et demande soit un combat soit d'être relâcher, faut que ça soit assez rare pour ne pas obstrué les messages. Tout dépend le combattant, certains se plaignent au bout de 7 mois d'autres à l'UFC ça fait de 2 ans qu'ils ont pas combattu ,car blessure ou d'autres raisons.
- **Ce qu'on fera.** Un combattant inactif se plaint par message et demande soit un combat, soit d'être libéré. C'est rare pour ne pas encombrer les messages. Le délai dépend du combattant : de 7 mois pour certains à 2 ans pour d'autres (blessure ou autres raisons).
- **Question Q23b.** Un écran ou un encart « À renouveler en priorité » : dans Contrats en haut, dans l'accueil, ou dans la messagerie ?
- **Ta décision.** Dans les messages, la liste des combattants en fin de contrat,  affiché les palmares les séries en cours, les combattants classé de top 18 à champion, le reste des combattants on voit on peut s'en occuper ou délégué à Leila.
- **Ce qu'on fera.** Un message liste les combattants en fin de contrat avec leur palmarès, leur série en cours, et les combattants classés du top 15 au champion (tu as confirmé top 15, point tranché n° 3). Pour les autres, tu t'en occupes toi-même ou tu délègues à Leïla.
- **Question Q23c.** « Il dit » et l'avis des médias : on les retire des Contrats ? On les met dans la fiche, ou dans la Presse ?
- **Ta décision.** Dans le fiche je pense.
- **Ce qu'on fera.** « Il dit » et l'avis des médias quittent les Contrats et vont dans la fiche du combattant.
- **Question Q23d.** À l'arrivée du joueur, combien de combattants peuvent être mécontents ou rouillés (aucun, ou quelques-uns pour créer des situations) ?
- **Ta décision.** Que quelques uns mais très peu. Et faut quand même qu'on les voit sinon on les mettra pas.
- **Ce qu'on fera.** Très peu de combattants mécontents ou rouillés à l'arrivée, mais toujours visibles (dans l'Effectif et la fiche).

#### R24 — Recrutement, agents libres

&#91;image: R24 — meilleurs combattants libres\]

> Par où commencer, c'est quoi ce truc. Même toi tu n'as pas envie de recruter, tu ne comprends rien, une quantité de sous menus terrifiante. Les meilleurs combattant libres ?? Mal réparti. Enfin bref, tout est à refaire vraiment tout là.

- **Ce que je comprends.** Tout est à refaire : on ne comprend rien, beaucoup trop de sous-menus, « Les meilleurs combattants libres » ne veut rien dire, mauvaise répartition. Sur la capture : Korobov, 37 ans, 35-2, venu de Garden of Blood ; rubriques « Sa trace » et « Ce que recruter change ».
- **Piste.** Un seul écran de recrutement façon FM : liste filtrable (catégorie, âge, statut libre / fin de contrat, prix demandé), fiche courte à droite, bouton « Faire une offre » qui ouvre la négociation (R25).
- **Question Q24.** Les deux écrans de recrutement (agents libres et fins de contrat ailleurs) deviennent un seul écran avec un filtre ? (Voir R25.)
- **Ta décision.** Oui
- **Ce qu'on fera.** Un seul écran de recrutement, avec un filtre (agents libres, fins de contrat ailleurs).

#### R25 — Deuxième écran de recrutement

&#91;image: R25 — recrutement mi-lourds\]

> Surprise, il y a deuxième écran de recrutement tout en haut à côté de sous contrat qui à exactement le même intérêt que l'autre, mais avec des infos complètement inutile déjà je ne sais pas qui sont ces gens, juste qu'ils sont classés dans l'ordre d'organisation là où ils viennent c'est pas normal que les meilleures organisation sont dans l'ordre pour les combattants. Normal que je ne les ai jamais vu combattre, je ne sais même pas si c'est possible. Recrutement à les mêmes sous menu. Je ne peux pas négocier les contrats comme dans football manager. Pareil que l'autre écran de recrutement, c'est à refaire.

- **Ce que je comprends.** (1) Un deuxième écran de recrutement, en haut à côté de « Sous contrat », a le même rôle que l'autre. (2) Infos inutiles : on ne sait pas qui sont ces gens ; ils sont triés par organisation d'origine, ce qui n'a pas de sens. (3) « Tu l'as vu : JAMAIS » : normal, et on ne sait pas si c'est possible de les voir. (4) Mêmes sous-menus. (5) Pas de négociation de contrat comme dans Football Manager. (6) À refaire.
- **Question Q25a.** Négociation façon FM : quels leviers veux-tu (salaire par combat, nombre de combats, prime de victoire, prime de signature, promesse de titre) ? Combien d'allers-retours avant que le combattant parte ?
- **Ta décision.** Oui et entre 2 et 4 comme dans FM
- **Ce qu'on fera.** Négociation façon FM avec les leviers proposés (salaire par combat, nombre de combats, prime de victoire, prime de signature, et un engagement de chance au titre, sous le même nom que les demandes des combattants, jamais « promesse »). Entre 2 et 4 allers-retours avant que le combattant parte.
- **Question Q25b.** « Tu l'as vu » : on le retire, ou on le relie aux recruteurs (un combattant « vu » = repéré par un recruteur, avec plus d'infos) ?
- **Ta décision.** On le retire normalement on connaît le palmarès ces dernières victoire, après les détails se débloque après le signature ou si on envoie un recruteur qui débloque tout et on voit dans message.
- **Ce qu'on fera.** « Tu l'as vu » est retiré. On connaît toujours le palmarès et les dernières victoires ; les détails se débloquent après la signature, ou si tu envoies un recruteur, dont le rapport arrive dans les messages.

### 14. Le recruteur (R26)

#### R26 — Envoyer les recruteurs

&#91;image: R26 — recruteur\]

> Sur cette écran pour envoyer les recruteurs. Déjà "les chances d'y trouver une pépite" je suis d'accord mais pas d'après les voyages passé, enfin faudrait qu'il y a autant de chance de partout, c'est le hasard qui doit décider, il n'y a pas un meilleur centre d'entraînement dans un pays plutôt qu'un autre. Pourquoi les prix diffèrent autant, ça coûte pareil ce qui va toucher au prix, c'est le temps et la distance en fonction de l'emplacement de l'organisation de manière réaliste. Marqué le nombre de profils n'as aucun sens, c'est toujours le même. On devrait pouvoir chercher n'importe quel catégorie de poids surtout que ici certains on juste disparu. Les chances de pépites ça doit être les mêmes partout. Le seul truc qui diffère c'est les combattants particulier, donc si je veux un brésilien champion amateur de BJJ, bah je vais au Brésil. Si je veux un combattant de boxe française, je vais aller en France pas au pays bas, ou au Daghestan, chacun à ses particularités, donc les styles sont recherchés que en fonction des pays. C'est déjà un peu le cas mais on devrait pas chercher un style entre lutteur frappeur, grappler et complet, mais on devrait avoir des choix aléatoire avec une probabilité plus grande de tomber sur un combattant dans les spécialité viennent du pays. Et ils manquent des pays ainsi que des styles. Et l'écran "ses retours" ne sert à rien, ça devrait arriver dans les messages avec le message qui part et qui revient quand, le prix etc.. et le message quand il arrive etc..

- **Ce que je comprends, point par point.**
  1. Les chances de trouver une pépite doivent être les mêmes partout (le hasard décide), pas « d'après ses voyages passés ».
  2. Les prix (de 5 940 € à 23 760 €) varient sans raison ; le prix doit dépendre du temps et de la distance depuis le siège de l'organisation.
  3. Le nombre de profils (3 à 5) n'a pas de sens, c'est toujours le même.
  4. Pouvoir chercher n'importe quelle catégorie de poids (certaines ont disparu de la liste).
  5. Ce qui change selon le pays, ce sont les spécialités : Brésil = BJJ, France = boxe française, Daghestan = lutte, etc.
  6. Ne plus choisir un style (Lutteur / Frappeur / Grappler / Complet) : le tirage est aléatoire, avec plus de chances de tomber sur les spécialités du pays.
  7. Il manque des pays et des styles.
  8. L'écran « Ses retours » ne sert à rien : tout passe par la messagerie (départ, date de retour, prix, rapport à l'arrivée).
- **Question Q26a.** Où est le siège de Split (pour calculer les distances et donc les prix) ?
- **Ta décision.** Il y a marqué ou elle sont basés dans le jeu, Split est à Lyon.
- **Ce qu'on fera.** Le siège de Split est à Lyon (déjà indiqué dans le jeu) ; il sert au calcul des distances et des prix.
- **Question Q26b.** Quels pays et quelles spécialités ajouter ? (Je peux proposer une liste à valider : par exemple Mexique boxe, Géorgie lutte, Corée taekwondo, Nigeria lutte, Irlande boxe, Suède, Chine sanda, Cuba boxe…)
- **Ta décision.** Faut des vrais style, pas juste pays + discipline. Mais oui il faut rajouter des styles et des pays, les plus connus après ce que j'ai déjà dans le MMA. Pays comme style.
- **Ce qu'on fera.** Des vrais styles de combat, pas « pays + discipline ». On ajoute les pays et les styles les plus connus du MMA en plus de ceux qui existent. Je te propose la liste à valider.
- **Question Q26c.** On garde le choix de la catégorie de poids par mission, ou le recruteur ramène toutes catégories ?
- **Ta décision.** Il ramène toute catégorie.
- **Ce qu'on fera.** Le recruteur ramène toutes les catégories de poids ; plus de choix de catégorie par mission.
- **Question Q26d.** Le nombre de profils ramenés : fixe (combien ?) ou variable selon la durée du voyage ?
- **Ta décision.** variables selon la durée 2/4/6
- **Ce qu'on fera.** Le nombre de profils ramenés varie selon la durée du voyage : 2, 4 ou 6.

### 15. Les camps d'entraînement (R27)

#### R27 — Salles et camps

&#91;image: R27 — camps d'entraînement\]

> L'écran possède 92 salles sans réel intérêt, travaillant toujours la même chose en majorité, c'est censé être des spécialisation plutôt. C'est bien de voir le coach mais ça signifie rien de particulier, il faudrait plus de compréhension globale. Par rapport à la vraie vie 92 salles c'est peu, et ici devoir swipe de gauche à droite 92 fois pour tout voir sans que ça apporte quoi que ce soit d'utile pour le joueur. Globalement le même nombre de combattant. Même combattant, même catégorie, évidemment que si il se battent il le prennent mal c'est évident. Faudrait des classement, améliorer comme Nicolas ott, Trevor Whitman, Atch etc..

- **Ce que je comprends.** (1) 92 salles sans intérêt, la plupart travaillent la même chose ; ce devrait être des spécialisations. (2) Voir le coach (ex. Batoumi Fight Club, Merab Bolkvadze) est bien mais ne signifie rien ; il faut une compréhension globale. (3) 92, c'est peu pour la vraie vie, mais défiler 92 fois à l'horizontale n'apporte rien. (4) Toutes les salles ont à peu près le même nombre de combattants. (5) « Même salle, même catégorie, ils le prennent mal s'ils se battent » : évident, inutile de l'afficher. (6) Il faut un classement des salles et des coachs à améliorer, à la manière de coachs réels (Nicolas Ott, Trevor Wittman, Atch…).
- **Point d'attention.** Les noms réels de coachs cités sont des exemples de profils ; le jeu utilise des noms inventés (règle des noms fictifs).
- **Question Q27a.** Les salles : une liste verticale avec un classement (réputation, champions formés) et une spécialité par salle. D'accord ?
- **Ta décision.** Oui
- **Ce qu'on fera.** Les salles en liste verticale, avec un classement (réputation, champions formés) et une spécialité par salle.
- **Question Q27b.** « Améliorer » : tu veux que le joueur puisse investir dans une salle ou un coach (partenariat), ou que les salles progressent seules selon leurs résultats ?
- **Ta décision.** Salles progressent seul ou régressent.
- **Ce qu'on fera.** Les salles progressent ou régressent seules selon leurs résultats ; pas d'investissement du joueur.
- **Question Q27c.** Combien de salles au total, et des tailles différentes (grosses écuries, petits clubs) ?
- **Ta décision.** Regarde par rapport au nombre de salles écuries club autant que l'UFC
- **Ce qu'on fera.** Autant de salles, d'écuries et de clubs que dans le paysage de l'UFC, de tailles différentes (recherche, voir « Recherches à faire »).

### 16. La presse (R28)

#### R28 — Presse

&#91;image: R28 — presse\]

> l'écran presse est vraiment important, pour trouver les défis, trouver aussi son combattant qui se fait complimenter pour savoir ce que le public pense globalement, après savoir qu'un combattant attend depuis 15 mois on s'en fout, surtout que si on regarde tout les combattants attendent depuis 15 mois c'est vide de sens. Pareil les envies du publique qui veulent voir tout le monde combattre ensemble. Après je ne vois pas trop quoi faire spécialement de cette écran, + de précision dans les infos données par la presse, comme quel finition (coude de coude) en un temps précis (50 secondes)

- **Ce que je comprends.** Écran jugé important : trouver les défis (call-outs), voir quel combattant est complimenté, savoir ce que pense le public. À retirer : « attend depuis 15 mois » (tout le monde attend 15 mois, vide de sens) et les envies du public qui veulent voir tout le monde contre tout le monde. À ajouter : plus de précision (« KO sur coup de coude à 0:50 »). 158 articles sur la capture.
- **Question Q28a.** On garde l'écran tel quel dans sa structure et on corrige le contenu (précision, moins de répétitions), ou tu veux aussi le refaire visuellement ?
- **Ta décision.** J'aimerais des nouveaux exemples visuel.
- **Ce qu'on fera.** Je te prépare de nouveaux exemples visuels de l'écran Presse avant toute refonte (avec la maquette de charte).
- **Question Q28b.** Les « envies du public » : on les retire, ou on les limite aux affiches vraiment demandées (deux ou trois à la fois) ?
- **Ta décision.** On les limites exceptionnellement quand vraiment grosse occasion (chimaev vs Imavov, tsarukyan vs topuria, jon Jones vs ngannou)
- **Ce qu'on fera.** Les « envies du public » n'apparaissent qu'exceptionnellement, pour les très grosses affiches (du niveau Chimaev vs Imavov, Tsarukyan vs Topuria, Jon Jones vs Ngannou).

### 17. Le calendrier (R29)

#### R29 — Calendrier des soirées

&#91;image: R29 — calendrier\]

> pour le calendrier, déjà enlevé petite ou grande, le nombre de combat on s'en fiche, il faudrait juste avoir des noms différents entre les grands et les petites soirées comme à l'UFC. Le nombre sur les soirées (soirée 62) ça ne sert à rien, normalement les UFC fight night c'est le deux combats principaux et ensuite il y a ufc numéroté. Le combat principal marqué de cette façon ne raconte rien, c'est vraiment simple peu intéressant pourquoi faire, tu vois. Savoir où en est la soirée n'apporte pas d'infos supplémentaires. Enfaite globalement les informations, la disposition, l'écriture faites ne sont pas intéressant. À droite le p pour poser une soirée est une sorte de tuto sans sens.

- **Ce que je comprends.** (1) Retirer « petite / grande » et « 9 combats ». (2) Distinguer les soirées par leur nom, comme à l'UFC : les petites portent le nom des deux têtes d'affiche (« Fight Night : X vs Y »), les grandes sont numérotées. (3) Le numéro « Soirée 62 » ne sert à rien. (4) Le combat principal affiché ainsi ne raconte rien. (5) « Où en est la soirée » n'apporte rien. (6) Informations, disposition et écriture pas intéressantes. (7) « P pour poser une soirée » = tutoriel sans sens (T1, T5).
- **Question Q29a.** Noms : grandes soirées « Split 1, Split 2… » et petites « Split Fight Night : Nom vs Nom ». D'accord, ou un autre format ?
- **Ta décision.** Oui d'accord
- **Ce qu'on fera.** Noms validés : « Split 1, Split 2… » pour les grandes soirées et « Split : Nom vs Nom » pour les fight nights (comme Q21c).
- **Question Q29b.** Que doit raconter le calendrier pour chaque soirée (enjeu, ceinture en jeu, ville, salle) ?
- **Ta décision.** Oui même d'autres informations.
- **Ce qu'on fera.** Le calendrier montre pour chaque soirée l'enjeu, la ceinture en jeu, la ville, la salle, et d'autres informations utiles.

### 18. Les résultats (R30, R41)

#### R30 — Résultats d'une soirée

&#91;image: R30 — résultats\]

> Je pense que tu vois par toi même le soucis de cette écran. C'est à refaire complètement en gardant les remarques que j'ai pu dire avant.

- **Ce que je vois.** Split Fight Night 62, une liste de résultats dense et peu lisible, un bloc « Ce que ça change » ; mêmes défauts que les autres écrans (tutoriel, couleurs, surnoms, sens de lecture).
- **Piste.** Refaire en appliquant toutes les remarques précédentes, et en intégrant R41 ci-dessous (le « lendemain » et le relevé de combat).
- **Question Q30.** Pour chaque combat, que veux-tu voir d'un coup d'œil (vainqueur en couleur, méthode, round et temps, surnoms, mouvement au classement, bonus) ?
- **Ta décision.** Oui je pense toutes les infos importantes.
- **Ce qu'on fera.** Pour chaque combat, toutes les informations importantes d'un coup d'œil : vainqueur en couleur, méthode, round et temps, surnoms, mouvement au classement, bonus.

#### R41 — Le lendemain et le relevé de combat (sans image)

> l'écran le lendemain la suite, je ne trouve plus, j'ai enlevé trop vite ça doit se trouver dans les résultats. Dans le relevé du combat on ne voit pas les trois juges le nom de ce qui gagne même si il y a eu une finition. On comprend pas que c'est les coups sur le round par round.

- **Ce que je comprends.** (1) L'écran du lendemain (R40) a disparu trop vite et on ne le retrouve plus ; il doit rester consultable depuis les Résultats. (2) Dans le relevé du combat : les trois juges, et le nom du vainqueur même en cas de finition. (3) On ne comprend pas que le tableau round par round montre les coups.
- **Cause probable.** Le bouton « Tous les résultats » de la fin de soirée fait `CL.go("mgmt_resultats")` sans passer par `CL.mgmtSoFin()` (`mgmt-soiree-cadre.js:305` et `:325`) : la soirée n'est pas clôturée proprement, d'où probablement le blocage (R39) et le lendemain perdu. Hypothèse à confirmer par un test.
- **Question Q41.** Juges : on affiche les trois cartes de score même en cas de finition (scores des rounds terminés), ou seulement pour les décisions ?
- **Ta décision.** Même en cas de finition mais mettre le nom du combattant qui a 10 au lieu de 10-9
- **Ce qu'on fera.** Les trois cartes des juges sont affichées même en cas de finition (rounds terminés), avec le nom du combattant qui a eu 10 au lieu de « 10-9 ».

### 19. Les finances (R31)

#### R31 — Finances

&#91;image: R31 — finances\]

> Il manque sûrement des informations financières, ainsi que des graphiques, s'inspirer de Football manager. Un peu de vie sur cet écran pour combler les trous.

- **Ce que je comprends.** Six cartes en grande partie vides. Ajouter des informations et des graphiques façon FM, combler les trous.
- **Piste.** Courbe du solde, recettes et dépenses par soirée (billetterie, diffusion, sponsors, bourses, primes, recruteurs), masse salariale par catégorie, budget restant.
- **Question Q31.** Quelles informations financières veux-tu en priorité ? Le joueur a-t-il un budget à respecter fixé par l'organisation ?
- **Ta décision.** Toutes les infos nécessaires et non c'est en fonction des recettes des soirées, salaire ect..
- **Ce qu'on fera.** Toutes les informations financières nécessaires. Pas de budget imposé par l'organisation : l'argent disponible dépend des recettes des soirées, des salaires, etc.

### 20. L'organisation, la croissance, le poste et le carnet (R32, R33, R34, R35)

#### R32 — Organisation

&#91;image: R32 — organisation\]

> Dans cette écran d'organisation, des informations peu compréhensible sont présent, la popularité, la salle, la notoriété et la puissance, c'est pas extrêmement clair. En plus ça veut dire que c'est d'après la soirée 62 de chaque organisation alors qu'elle ne sont pas créé en même temps. Garden of blood est deuxième alors qu'elle gagne de partout. Manque de couleur et visuellement peu addictif, toutes les infos tuto sur la droite sont mal écrites. Le juste devant et juste derrière est inversé. Aucun rival ne s'est encore imposé mais personne doit s'imposer, il manque d'informations compréhensible et visible au premier coup d'œil.

- **Ce que je comprends.** (1) Popularité, salle, notoriété, puissance : pas clair. (2) « Après la soirée 62 » pour toutes les organisations, alors qu'elles n'ont pas été créées en même temps. (3) Garden of Blood est 2e alors qu'elle gagne partout. (4) Manque de couleur, peu attirant ; textes de tutoriel à droite mal écrits. (5) « Juste devant / juste derrière » inversé. (6) « Aucune rivale ne s'est encore imposée » : personne n'a à s'imposer. (7) Il manque des infos lisibles au premier coup d'œil.
- **Cause probable.** Point 5 : `mgmt-organisations.js:142-147` définit `devant` = l'organisation classée une place au-dessus et `derriere` = une place en dessous ; l'écran inverse probablement les libellés. Hypothèse à confirmer. Point 3 : l'ordre de prestige fixe (décidé le 17/10) prime sur les résultats ; voir la section Conflits.
- **Question Q32a.** Le classement des organisations doit-il bouger selon les résultats (Garden of Blood pourrait monter), ou rester fixe par prestige ?
- **Ta décision.** Ça doit bouger
- **Ce qu'on fera.** Le classement des organisations bouge selon les résultats.
- **Question Q32b.** Quelles mesures garder (popularité, notoriété, puissance, salle) et comment les nommer simplement ?
- **Ta décision.** On peut les garder peut être un peu renommée pour que ce soit compréhensible en une vue
- **Ce qu'on fera.** On garde les mesures (popularité, notoriété, puissance, salle), un peu renommées pour être comprises en un coup d'œil. Je te propose les noms.

#### R33 — Croissance

&#91;image: R33 — croissance\]

> La croissance est vraiment l'écran important, pour en fonction de certaines organisations, le développement ne doit pas être le même. Et surtout toutes les informations marqué sont du mensonge. Les recruteurs ne sont pas que en France. Les agents libres on a vu que non. Le diffuseur on a pas d'infos, pour les salles ce devrait être les nombres de places disponibles peut importe les stades, car les événements de MMA se passe dans plusieurs pays en même temps dans plusieurs villes du monde. Faudrait voir les informations pour améliorer chaque point, c'est pas les mêmes défi pour monter le recruteur que les salles etc..

- **Ce que je comprends.** (1) Écran important ; le développement doit différer selon l'organisation. (2) Les informations affichées sont fausses : recruteur « France » alors qu'on voyage dans 9 pays ; agents libres annoncés alors qu'on a vu que non ; diffuseur sans infos. (3) Salles : parler en nombre de places, pas en types (Gymnase / Palais / Dôme / Aréna), car les soirées se tiennent dans plusieurs villes et pays. (4) Montrer comment améliorer chaque piste, avec des défis différents par piste.
- **Cause probable.** Les textes de palier sont fixes et ne lisent pas l'état réel du jeu (même constat qu'en R34 et R35).
- **Question Q33a.** Quelles pistes de croissance garder (salles, diffuseur, recruteur, agents libres, autres) ?
- **Ta décision.** ça ça me paraît bien mais faut voir si il n'y a pas autre chose.
- **Ce qu'on fera.** On garde les pistes de croissance actuelles (salles, diffuseur, recruteur, agents libres) et je cherche s'il en manque, liste à te proposer.
- **Question Q33b.** « Le développement ne doit pas être le même selon l'organisation » : pour Split, quel point de départ et quelle progression ?
- **Ta décision.** En fonction de l'organisation être logique.
- **Ce qu'on fera.** Le point de départ et la progression dépendent de l'organisation, de façon logique (une petite organisation ne démarre pas comme une grande).

#### R34 — Ton poste

&#91;image: R34 — poste\]

> Globalement vide, il manque des succès, des palmarès, mais ça c'est à développer au fil du jeu, j'ai déjà le choc des organisations alors que je viens de rejoindre et c'est censé être une information qui tombe dans les messages de base. Graphiquement ça ne parle pas, pour la réputation etc.. toujours la même slide bar qui est nul, faudrait des écran plus adapté, mieux rempli avec les infos, et les objectifs à droite sont comme dans la croissance, la majorité est là alors que il y a marqué que c'est pas encore le cas, j'ai comme l'impression que c'est pas relié au jeu. Je ne sais pas c'est quoi répondre à ce qui manque. Ça ne dis pas jusqu'à quand. Bref beaucoup d'éléments à refaire.

- **Ce que je comprends.** (1) Vide : succès et palmarès du joueur à construire au fil du jeu. (2) « Le choc des organisations » est déjà là à l'arrivée ; ce devrait être un message dans la messagerie. (3) Graphiquement muet (réputation…) ; encore la barre de défilement horizontale. (4) Objectifs à droite : affichés comme atteints alors que c'est marqué « pas encore » ; pas relié au jeu. (5) « Répondre à ce qui manque » : on ne comprend pas. (6) Pas d'échéance (« jusqu'à quand »). Sur la capture : « Il attend de voir ».
- **Question Q34a.** Les objectifs du patron : quelle échéance (fin de saison, 6 mois) et que se passe-t-il en cas d'échec (avertissement, renvoi) ?
- **Ta décision.** Fin de saison et avertissement puis renvoi.
- **Ce qu'on fera.** Les objectifs du patron sont jugés en fin de saison : un avertissement d'abord, puis le renvoi en cas de nouvel échec.
- **Question Q34b.** On fusionne Poste et Carnet (R35) en un seul écran « Ma carrière » ?
- **Ta décision.** Oui
- **Ce qu'on fera.** Poste et Carnet fusionnent en un seul écran (nom à proposer dans le schéma de navigation).

#### R35 — Carnet du matchmaker

&#91;image: R35 — carnet\]

> Je viens d'arriver comment je peux avoir des infos sur ce que j'ai fait, les défis sont déjà complété alors que j'ai absolument rien fait, remplir une grande salle alors que c'est que 8000 place, les informations ne sont pas dutout adapté à moi, c'est adapté à l'organisation mais il faudrait les deux. Ici c'est pour l'organisation il n'y a pas marqué de salle pleine ou prime de la soirée ce qui n'a pas de sens non plus. Marqué que je suis matchmaker depuis le 12 janvier alors que le jeu commence au 16 février. Il y a marqué 33 sur 44 défi, ça fait beaucoup, les développé dans l'ordre 9 par 9 peut être les relié à la croissance.

- **Ce que je comprends.** (1) Le carnet montre l'historique de l'organisation (62 soirées, 558 combats, 124 champions) comme si c'était celui du joueur. (2) Défis déjà complétés (33 sur 43 ou 44) sans rien avoir fait. (3) « Remplir une grande salle » alors qu'il n'y a que 8 000 places. (4) Il faut deux parties : le joueur et l'organisation ; celle de l'organisation n'indique ni salle pleine ni prime de la soirée. (5) « Matchmaker depuis le 12 janvier » alors que la partie commence le 16 février. (6) Trop de défis d'un coup : les débloquer 9 par 9, éventuellement reliés à la croissance.
- **Cause probable.** Les défis sont évalués sur l'historique global au lieu de partir de l'arrivée du joueur. La date vient de `depuis.jour/mois/ts` (`mgmt-ceremonie.js:245`) ; l'écart 12 janvier / 16 février n'est pas encore vérifié.
- **Question Q35a.** Les défis : par paliers de 9, débloqués quand le palier précédent est fini, ou reliés aux paliers de croissance ?
- **Ta décision.** Débloquer quand ancien fini
- **Ce qu'on fera.** Les défis se débloquent par paliers : le palier suivant s'ouvre quand le précédent est fini.
- **Question Q35b.** « Remplir une grande salle » : quel seuil (par exemple 15 000 places) ?
- **Ta décision.** Non fait comme dans la vraie vie la définition d'une grande salle dans le MMA.
- **Ce qu'on fera.** « Grande salle » suit la définition réelle dans le MMA (recherche, voir « Recherches à faire »), pas un seuil inventé.

### 21. La soirée en direct (R36)

#### R36 — Soirée en cours

&#91;image: R36 — soirée en direct\]

> Cette écran est pas mal mais il doit être fortement peaufiner. Comprendre la salle, comprendre l'ambiance et les recettes aussi. L'écran Résultat est affreux, et il s'enlève tout seul sans que je puisse rien faire.

- **Ce que je comprends.** Écran correct, à fortement peaufiner : rendre lisibles la salle (707 / 4 000 sur la capture), l'ambiance et les recettes (− 22 000 €). L'écran de résultat d'un combat est affreux et disparaît seul, sans que le joueur puisse agir.
- **Question Q36a.** Le résultat d'un combat reste affiché jusqu'à un clic du joueur (« Combat suivant ») ? D'accord ?
- **Ta décision.** Oui d'ailleurs l'écran Resultat est vraiment moche.
- **Ce qu'on fera.** Le résultat d'un combat reste affiché jusqu'au clic « Combat suivant ». L'écran Résultat est entièrement refait (tu le trouves vraiment moche).
- **Question Q36b.** Les recettes : on les affiche en direct pendant la soirée, ou seulement à la fin ?
- **Ta décision.** À la fin
- **Ce qu'on fera.** Les recettes ne sont affichées qu'à la fin de la soirée.

### 22. Le discours après combat (R37)

#### R37 — Prise de parole dans la cage

&#91;image: R37 — discours\]

> Pourquoi il parle après une décision partagé ? Il call out le combattant qui vient de gagner, à droite des informations vides , qui n'ont pas d'intérêt d'être mis. Le "tunnel rouge" est pas mal cadré et proportionné. Il m'a compter le combat 6 comme co-principal. J'avais demandé une interview que au combat principal et co principal, 8 et 9 et que si il y a un surprise exceptionnel (miracle statistiques)

- **Ce que je comprends.** (1) Un discours après une décision partagée n'a pas de sens. (2) Gvazava défie (call-out) un combattant qui vient lui-même de gagner (Lacroix). (3) À droite, « Il réclame » et « Dans la salle » sont vides et inutiles. (4) Le « tunnel rouge » est bien cadré et proportionné (à garder, et à reprendre dans le Classement, R18). (5) Le combat 6 a été compté comme co-principal, étiqueté « COMBAT PRINCIPAL ». (6) Rappel de la règle demandée : interview seulement après le combat principal et le co-principal (combats 8 et 9), ou après une surprise exceptionnelle (miracle statistique).
- **Cause probable.** Dans `mgmt-discours.js:4-18` : le principal et le co-principal sont repérés par `combat.position` (0 = principal, 1 = co-principal quand `slot==='main'`) ; cet indice ne correspond probablement pas à l'ordre réel de la carte (hypothèse). La « surprise » est décidée par `1/(rang+1) < 0,25`, trop grossier. Aucune exclusion des décisions partagées, ni contrôle de la cible du défi.
- **Question Q37a.** Après une décision partagée, aucun discours du tout, ou un discours sans call-out ?
- **Ta décision.** Discours que si celui qui gagne est en combat principal ou co-principal ou qu'il avait très peu de chance de gagner
- **Ce qu'on fera.** Un discours n'a lieu que si le vainqueur est en combat principal ou co-principal, ou s'il avait très peu de chances de gagner. Une décision partagée en combat principal ou co-principal donne quand même un discours (point tranché n° 7).
- **Question Q37b.** « Surprise exceptionnelle » : quel seuil (par exemple vainqueur donné à moins de 15 % de chances, ou écart de 5 rangs et plus) ?
- **Ta décision.** Écart de 10 ou vainqueur donné moins de 25% de chance
- **Ce qu'on fera.** « Surprise exceptionnelle » = écart de 10 rangs ou plus, ou vainqueur donné à moins de 25 % de chances.
- **Question Q37c.** Le panneau de droite : on le supprime, ou on le remplit (bilan du combat, prochain adversaire possible) ?
- **Ta décision.** On remplit, et on met rien si il n'y a pas de callout.
- **Ce qu'on fera.** Le panneau de droite est rempli (bilan du combat, prochain adversaire possible) ; il reste vide s'il n'y a pas de call-out.

### 23. Les temps forts (R38)

#### R38 — Temps forts d'un combat

&#91;image: R38 — temps forts\]

> Refaire tout le temps fort

- **Ce que je comprends.** L'écran des temps forts (Alieva contre Lewis, « moment 2 sur 2 ») est à refaire en entier.
- **Question Q38.** Que doit montrer un temps fort : un récit texte du moment clé (round, temps, coup), une animation dans l'arène, les statistiques du round, ou un mélange ? Combien de moments par combat ?
- **Ta décision.** Une animation dans l'arène vu du dessus, un mélange, et quelques moments en fonction du combat ( pas de début de combat puis KO 2 round à chaque combat)
- **Ce qu'on fera.** Un temps fort = une animation de l'arène vue du dessus, mêlée au récit. Quelques moments seulement, qui varient selon le combat : jamais le même schéma « début de combat puis KO au 2e round » à chaque fois.

### 24. La fin de soirée (R39)

#### R39 — Bilan de fin de soirée

&#91;image: R39 — fin de soirée\]

> L'écran est intéressant, beaucoup de bonnes idées, mais les couleurs à refaire surtout le grand carré blanc, le jeu entier doit pouvoir être fait que à la souris. Le bouton tout les résultats m'as fait bugué le jeu. Et j'aurais bien aimé voir les combattants qui ont gagné et revoir les combat, ainsi que pouvoir augmenter les primes dans le jeu, si ça rapporte trop les combattants peuvent se plaindre de ne pas être assez payé, ni des assez grosse primes.

- **Ce que je comprends.** (1) Bonnes idées ; couleurs à refaire, surtout le grand carré blanc (combat de la soirée). (2) Tout le jeu doit se jouer à la souris seule (T1). (3) Le bouton « Tous les résultats » a bloqué le jeu. (4) Voir les vainqueurs et pouvoir revoir les combats. (5) Pouvoir augmenter les primes (1 000 € de prime de performance sur la capture) ; si la soirée rapporte beaucoup, les combattants peuvent se plaindre d'être mal payés ou d'avoir de trop petites primes. Capture : salle 2 020 / 4 000, − 22 000 €.
- **Cause probable.** Point 3 : voir R41, `mgmt-soiree-cadre.js:305` et `:325` (`CL.go("mgmt_resultats")` sans `CL.mgmtSoFin()`). Hypothèse à confirmer.
- **Question Q39a.** Primes : le joueur fixe le montant des primes de la soirée (dans une fourchette) ? Voir le conflit avec le brief du 22/10 dans la section Conflits.
- **Ta décision.** Oui il fixe entre 1000 et 100000K
- **Ce qu'on fera.** Le joueur fixe lui-même les primes de la soirée, entre 1 000 € et 100 000 € par prime (confirmé, point tranché n° 4).
- **Ajout du 07/11 (maquette de la fiche, onglet Contrat).** Trois primes de performance : **Combat de la soirée**, **Performance de la soirée** et une nouvelle **prime de finition** (versée pour une victoire avant la limite). Leurs montants sont fixés **pour toute l'organisation** et modifiables par le joueur (même fourchette de 1 000 € à 100 000 €). Une prime de finition plus haute **motive les combattants** à chercher la finition. La fiche, onglet Contrat, montre les primes de performance touchées depuis son arrivée : un total par type, puis la liste détaillée qui défile.
- **Question Q39b.** « Revoir les combats » : rejouer le combat dans l'arène, ou relire le récit et les temps forts ?
- **Ta décision.** Au choix
- **Ce qu'on fera.** « Revoir les combats » laisse le choix au joueur : rejouer le combat dans l'arène, ou relire le récit et les temps forts.

### 25. Le lendemain (R40, avec R41)

#### R40 — Le lendemain de la soirée

&#91;image: R40 — lendemain\]

> Sûrement un des meilleurs écran, à peaufiner tout de même.

- **Ce que je comprends.** Un des meilleurs écrans (surprise, finition, guerre, Cage Hebdo), à peaufiner. R41 demande qu'il reste accessible depuis les Résultats, car il disparaît trop vite.
- **Question Q40.** Qu'aimerais-tu peaufiner en priorité ici, ou j'applique simplement les règles générales (couleurs, surnoms, souris, Retour) et l'accès depuis les Résultats ?
- **Ta décision.** Les phrases, les barre de slide  à refaire, peut-être de la couleur et du mouvement sinon tu peux appliquer aussi les règles et l'accès
- **Ce qu'on fera.** Le lendemain est refait : les phrases, les barres de défilement, et sans doute de la couleur et du mouvement. On y applique aussi les règles générales (couleurs, surnoms, souris, Retour) et l'accès depuis les Résultats.

## Les conflits avec des décisions déjà prises : tranchés

Ces remarques contredisaient une décision prise avant (dates de la mémoire du projet). Voici ce que tu as tranché ; la mémoire du projet sera mise à jour en conséquence.

1. **Le fond cendré (T2, R11).** Avant : décision du 25/10, garder le fond cendré (`images/cendre.jpg`, classe `.mf-fond`) partout. **Ta décision (C1) :** « Oui on met un autre fond ». **Ce qu'on fera :** le fond cendré est retiré ; plusieurs fonds sont proposés dans la maquette de charte (dégradé d'arène ou autre, voir T2).
2. **L'échelle des organisations (R9, R32, T8a).** Avant : décision du 17/10, du plus petit au plus grand : Garden of Blood < MMA Korner < Pure Impact < Ultimate Rim < Knuckle Gate < Undisputed Cage < Fighting Pacific Championship, Split prenant la place de l'organisation jouée. **Ta décision (C2) :** « on garde et oui ». **Ce qu'on fera :** on garde cet ordre de départ, et il bouge avec les résultats ; les palmarès suivent le rang (bas d'échelle : jeunes et peu de combats ; haut : de tout), voir Q9a et Q32a.
3. **Les primes (R39).** Avant : brief du 22/10, primes fixées par l'organisation. **Ta décision (C3) :** « Oui ». **Ce qu'on fera :** le joueur fixe lui-même les primes, entre 1 000 € et 100 000 € par prime (Q39a, point tranché n° 4), et des combattants mal payés peuvent se plaindre (R39).
4. **Les promesses (R5, R6, R12).** Avant : brief du 22/10, pas de promesses. **Ta décision (C4) :** « J'accepte que des combattants demande un combat par exemple ou d'autres choses mais pas de promesses. » Puis, le 1er novembre : « ça ressemble à des promesses mais sans que ça s'appelle des promesses. » **Ce qu'on fera :** des demandes des combattants auxquelles le joueur peut s'engager, avec trace et obligations, sans jamais le mot « promesse » (point tranché n° 1).
5. **Les ceintures (R11, R22, T4c).** **Ta décision (C5) :** « Déjà répondu plus haut ». **Ce qu'on fera :** l'écran Ceintures est montré avec un vrai sens dans la maquette, et tu décides alors de le garder ou de le supprimer (point tranché n° 2).
6. **La négociation de recrutement (R25).** **Ta décision (C6) :** « Oui ». **Ce qu'on fera :** négociation façon FM ajoutée, 2 à 4 allers-retours (Q25a). Elle touche les contrats existants : migration de sauvegarde obligatoire.
7. **Le nombre de préliminaires (R14).** **Ta décision (C7 = Q14a) :** 6 préliminaires pour 4 combats principaux, à tester.
8. **Le clavier (T1).** **Ta décision (C8 = T1a) :** raccourcis cachés mais actifs, plus aucune barre de touches.
9. **Les textes d'auteur (T6).** Règle en vigueur : les textes sont écrits par Claude et validés par toi. **Ta décision (T6) :** ton sobre façon FM ; un petit échantillon validé d'abord, puis on étend au fil des lots.

## Points tranchés le 1er novembre

Tes réponses du 1er novembre aux derniers points. Il ne reste aucune question ouverte ; certains choix se valident directement sur la maquette.

1. **Les demandes des combattants (Q6 et C4).** Ta réponse : « Oui enfaite ça ressemble à des promesses mais sans que ça s'appelle des promesses. » **Ce qu'on fera :** les combattants font des demandes (un combat, une revanche, une augmentation…), à partir de la première soirée. Le joueur peut s'y engager ; l'engagement est gardé en trace, avec des obligations et des conséquences s'il n'est pas tenu. Le mot « promesse » n'apparaît nulle part dans le jeu : je te propose un nom dans la maquette. Dans la négociation (Q25a), la chance au titre devient un engagement du même type.
2. **L'écran Ceintures (T4 et Q22a).** Ta réponse : « Oui. » **Ce qu'on fera :** la maquette montre une version de l'écran Ceintures avec un vrai sens (lignée des champions, règnes, intérims, prochain défi, regroupé avec le Classement) ; tu décides alors de le garder ou de le supprimer.
3. **Top 15 (Q23b).** Ta réponse : « Oui. » **Ce qu'on fera :** le message de fin de contrat détaille les combattants classés du top 15 au champion.
4. **Les primes (Q39a).** Ta réponse : « Oui c'est le joueur qui l'ajoute. » **Ce qu'on fera :** le joueur fixe lui-même chaque prime, entre 1 000 € et 100 000 €.
5. **Les choix que tu m'as laissés.** Infirmerie dans l'Effectif (Q12b), place de « Le fil » et « Tes suivis » (Q13), classement Split / Monde en un ou deux écrans (Q20b), « Revoir les combats » au choix (Q39b), versions de l'octogone (Q16c). Je fais une proposition pour chacun dans la maquette et le schéma de navigation ; **tu valides sur la maquette.**
6. **Les surnoms (T11).** « Là où c'est intéressant, pas partout mais en majorité. » Je te propose la liste des écrans concernés dans la maquette ; **tu valides.**
7. **Le discours après une décision partagée (Q37a).** Ta réponse : « Oui quand même. » **Ce qu'on fera :** une décision partagée en combat principal ou co-principal donne quand même un discours ; la règle de Q37a vaut pour toutes les issues.
8. **L'arrivée (Q1a, Q3, Q4).** Avec la fusion de « Ton contrat » et « Ce qui manque », et le choix de 2 espoirs, l'arrivée compte moins d'étapes. Je te propose le déroulé complet en maquette ; **tu valides.**
9. **Les objectifs à l'arrivée (R2, Q2).** Ta réponse : « Oui mais le maximum à atteindre est le même partout. » **Ce qu'on fera :** les objectifs fixes de chaque organisation ne sont jamais déjà atteints à l'arrivée (« garder » quand c'est déjà acquis, ou un cran au-dessus). L'objectif le plus haut qu'on puisse demander est le même pour toutes les organisations.

## Recherches à faire sur le MMA réel

Tu veux le réalisme de l'UFC et des grandes organisations mondiales. Avant le code, je fais ces recherches et je te présente un résumé chiffré, à valider :

- **Palmarès** selon l'âge et le niveau de l'organisation (de l'Ares ou l'Hexagone jusqu'à l'UFC), et palmarès maximum crédible d'un vétéran (T8, Q9a, Q20a).
- **Rythme des combats** : combats par an d'un combattant actif, par profil (T8, Q14b, Q20a).
- **Inactivité** : délais réels avant plainte ou libération (7 mois à 2 ans selon les cas) (Q23a).
- **Ceintures intérimaires** : quand et à quelle fréquence l'UFC en crée, et quand elles deviennent la ceinture principale (T8, Q22b).
- **Rythme des défenses** de titre selon les champions (Q22c).
- **Calcul des classements** : poids de la victoire, de la finition, de l'adversaire (Q9b).
- **Salaires** : échelle réelle entre débutants, combattants classés et champions (Q16e).
- **Grande salle** : ce qu'on appelle une grande salle dans le MMA (Q35b).
- **Salles, écuries et clubs** : combien, de quelles tailles, dans le paysage de l'UFC (Q27c).
- **Pays et styles** les plus connus du MMA, à ajouter à ceux du jeu (Q26b).
- **Offres d'autres organisations** : comment elles arrivent de façon réaliste dans FM (T10).

## Listes que je dois te proposer

Ces contenus sont décidés sur le principe ; je te propose la liste, tu valides avant le code :

- **Événements du jour par jour** : autant que FM, avec leurs probabilités (T10, Q17).
- **Scénarios et histoires de combats** : une très longue liste, sans tutoriel ni « combat facile » (Q8b).
- **Raisons de refus et solutions** de même niveau (Q15a).
- **Traits** façon caractéristiques FM, positifs et négatifs, avec leur effet (Q21b).
- **Pays et styles** de combat (Q26b).
- **Noms et icônes SVG** de la barre latérale, et schéma de navigation complet (T4, Q11).
- **Noms des trois médias** (Q10c) et **des mesures de l'organisation** (Q32b).
- **Pistes de croissance** manquantes (Q33a).
- **Échantillon de textes** réécrits en ton sobre FM (T6).
- **Exemples visuels de la Presse** (Q28a).

## Récapitulatif des décisions

- **Visuel :** nouvelle charte complète, plusieurs polices et plusieurs fonds au choix (plus de fond cendré), vert / rouge / jaune, octogone partout à l'essai, mouvement discret sauf combat et soirée (T2, T3, T11, C1, Q19b).
- **Navigation :** tout à la souris, raccourcis cachés, cliquer-tirer animé, sous-menus en haut mieux agencés, barre latérale repliable en icônes SVG, aides dans les Options, fiche en panneau et bouton Retour (T1, T4, T5, T7, Q11, Q18c).
- **Temps de jeu :** bouton Continuer, le temps s'arrête sur les messages importants, beaucoup plus d'événements, offres d'autres organisations réalistes (T10, Q17).
- **Monde :** réalisme UFC (palmarès, rythme, intérims, défenses), organisations dont le classement bouge, victoire et finition qui pèsent plus au classement, ton arrivée présentée comme un renouveau (T8, T9, Q9a, Q9b, Q32a).
- **Arrivée et accueil :** intro façon FM, prédécesseur dans l'histoire de l'organisation, objectifs fixes par organisation qui s'adaptent, deux étapes fusionnées, 2 espoirs sur 6, messages visibles depuis l'accueil (Q1 à Q5).
- **Matchmaking :** tu composes, Leïla à la demande, confrontations propres à chaque combattant, énormément de scénarios, présentation et face-à-face séparés et uniques (Q7, Q8, Q10).
- **Carte :** glisser-déposer, bilan avant validation, 6 préliminaires pour 4 combats principaux, au moins 2 combats féminins, préliminaires modifiables (Q12, Q14).
- **Combattants :** refus réalistes, onglets optimisés, « On en dit » enrichi, salaires réalistes, traits refaits façon FM, surnoms en majorité (Q15, Q16, Q21b, T11).
- **Contrats et recrutement :** plaintes rares par message, fins de contrat listées dans les messages avec délégation à Leïla, un seul écran de recrutement, négociation FM en 2 à 4 tours, « Tu l'as vu » retiré, recruteur depuis Lyon toutes catégories 2/4/6 profils, salles qui évoluent seules (Q23 à Q27).
- **Soirée :** noms « Split 1 » et « Split : X vs Y », résultat jusqu'au clic, recettes à la fin, discours selon la règle de Q37, temps forts animés vus du dessus, primes fixées par le joueur, cartes des juges avec le nom du gagnant du round (Q21c, Q29, Q36 à Q41).
- **Organisation et carrière :** finances complètes sans budget imposé, mesures renommées, croissance logique selon l'organisation, objectifs jugés en fin de saison (avertissement puis renvoi), Poste et Carnet fusionnés, défis par paliers (Q31 à Q35).

## Ordre des lots

Ton choix (L1) : « d'abord maquette charte visuel ». Chaque lot sera découpé en tranches pour OpenCode, relu par moi, avec `npm run check` vert et un test par bug corrigé.

1. **Maquette de la charte visuelle** (T2, T3, T11, C1, Q10b, Q16c, Q19b, Q28a) : plusieurs polices, plusieurs fonds (dégradé d'arène…), code couleur vert / rouge / jaune, octogone partout, barres de défilement, mouvement discret et spectaculaire, barre latérale repliable en icônes SVG, exemples d'écrans (accueil, carte, fiche, presse, Ceintures pour le point tranché n° 2, nom des demandes des combattants pour le point tranché n° 1). Maquettes seulement, aucun code du jeu ; **tu choisis avant la suite.** L'échantillon de textes en ton sobre (T6) est joint à cette étape.
2. **Bugs et erreurs de fait** : bouton « Tous les résultats » qui bloque et lendemain perdu (R39, R41) ; « juste devant / juste derrière » inversé (R32) ; combat 6 compté co-principal (R37) ; « 553 cycles » et « 53 mois » affichés bruts (R23) ; « reste 2 / 3 sur 8 » (R23) ; proposition affichée alors que rien n'est proposé (R23) ; n°1 devant le champion (R23) ; date « depuis le 12 janvier » (R35) ; défis déjà complétés (R35) ; objectifs non reliés au jeu (R33, R34) ; « composer ta soirée » qui mène au contrat (R2) ; étape 2 identique à l'étape 1 (R3) ; fiche qui saute une étape ou ouvre un écran inconnu (R4, R6) ; logo du jeu manquant sur le n°1 et le n°2, tunnel rouge manquant et n°4 sans série ni dernier combat (R18). Un test par bug.
3. **Navigation** (T1, T4, T5, T7, Q11, C8) : application de la charte validée, barre latérale regroupée, fin des barres de touches et des textes de tutoriel, aides dans les Options, fiche en panneau, bouton Retour.
4. **Recherches MMA réel** : résumé chiffré à valider (voir « Recherches à faire »), en parallèle des lots 2 et 3 puisqu'il n'y a pas de code.
5. **Messagerie et temps jour par jour** (T10, Q5a, Q15b, Q17, Q23a, Q23b, R13, R26, R34) : bouton Continuer, arrêts sur messages, événements validés.
6. **Monde crédible** (T8, T9, C2, Q9, Q20, Q22, Q32a) : palmarès, rythme, intérims, classements, organisations qui bougent. Touche la sauvegarde : migration obligatoire.
7. **La carte et la soirée** (R10, R12, R14, R36 à R41, C3) : glisser-déposer, bilan, préliminaires, présentation et face-à-face, résultat, discours, temps forts, primes, lendemain.
8. **Les écrans d'information** : effectif et fiche (R15, R16), classements, meilleurs et records (R18 à R22), traits (Q21b), presse (R28), calendrier et résultats (R29, R30).
9. **Les écrans de gestion** : contrats, recrutement et négociation (R23 à R25, C6, migration), recruteur (R26), camps (R27), finances (R31).
10. **L'organisation et ta carrière** : organisation, croissance, poste et carnet fusionnés (R32 à R35), arrivée et accueil (R1 à R9).
11. **Textes** (T6) : après l'échantillon validé au lot 1, la réécriture avance écran par écran avec chaque lot ; ce lot final reprend ce qui reste.

## Pour démarrer les maquettes dans une nouvelle discussion

Ce plan est complet : il n'y a plus de question ouverte. Pour lancer le lot 1, ouvre une nouvelle discussion dans le projet Cage Legacy et colle le message ci-dessous.

> Lot 1 du plan de corrections : la maquette de la charte visuelle. Le plan complet, avec toutes mes décisions, est dans ce doc : https://claude.ai/artifact/9rgLUwf7Zyxdvfr1qMN8cK. Lis d'abord « Comment lire ce plan », les chantiers T1 à T11, « Points tranchés le 1er novembre » et « Ordre des lots ». Fais uniquement des maquettes, sans toucher au code du jeu, et ne décide rien à ma place.

**Ce que la maquette doit montrer** (lot 1 et points à valider sur la maquette) :

- **Charte** : plusieurs polices et plusieurs fonds au choix (plus de fond cendré), code couleur vert / rouge / jaune, octogone partout à l'essai et ses versions (Q16c), barres de défilement, mouvement discret sur les écrans et spectaculaire en combat et en soirée (T2, T3, C1, Q19b).
- **Navigation** : barre latérale repliable en icônes SVG avec la liste des groupes et des noms, sous-menus en haut, schéma de navigation complet, aucune barre de touches ni texte de tutoriel (T1, T4, T5, Q11).
- **Écrans d'exemple** : accueil, carte, fiche en panneau, presse (Q28a), et l'écran Ceintures avec un vrai sens pour décider de le garder ou non (point tranché n° 2).
- **Choix à valider sur la maquette** : nom des demandes des combattants, sans le mot « promesse » (point n° 1) ; infirmerie dans l'Effectif (Q12b) ; place de « Le fil » et « Tes suivis » (Q13) ; classement Split / Monde en un ou deux écrans (Q20b) ; « Revoir les combats » (Q39b) ; liste des écrans avec surnoms (T11) ; déroulé complet de l'arrivée (point n° 8).
- **Échantillon de textes** réécrits en ton sobre façon FM (T6), à valider avant d'étendre.

**Contraintes à rappeler** : cible PC 1920×1080, lisible dès 1280, tout à la souris ; vanilla JS sans dépendance, 100 % hors ligne ; Football Manager comme référence d'interface et l'UFC pour le réalisme. Tu choisis sur la maquette avant que le lot 2 commence.
