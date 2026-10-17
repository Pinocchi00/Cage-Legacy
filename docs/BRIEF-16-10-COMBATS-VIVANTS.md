# Cage Legacy — brief de refonte des combats et des combattants vivants

Date : 16 octobre 2026. État audité : `main` et `origin/main` à `6bb604a`.

## 1. Ce que ce brief doit obtenir

Un combat doit permettre de reconnaître les deux combattants, comprendre ce qu'ils essaient de faire, voir pourquoi une action fonctionne ou échoue et retrouver ses conséquences après la soirée. L'animation, le récit, les statistiques, l'arbitre et les juges doivent décrire les mêmes faits.

Le critère de réussite est concret : **une séquence décisive doit pouvoir être expliquée par ce qui l'a précédée ; un combattant doit rester reconnaissable tout en pouvant apprendre, se tromper et vieillir.** « Deux fois plus réaliste que les autres simulateurs » exprime une ambition ; ce n'est pas une mesure vérifiable ni une promesse de classement.

Le périmètre est le combat et l'attachement aux combattants. Ce document ne remplace pas les fiches des autres lots de management et ne commande pas leur réécriture. Il propose l'ordre du chantier ; les choix non encore validés sont regroupés en section 8.

### Décisions à conserver

- **Environ 43 secondes de lecture pour un round de cinq minutes**, décision d'Anthony confirmée dans cette conversation. À compression uniforme, 300 / 7 = 42,86 secondes de combat actif affiché. Les pauses entre rounds sont distinctes.
- Le joueur reste **matchmaker** : il observe les stratégies et les coins, sans devoir piloter les frappes ni gérer chaque entraînement.
- JavaScript vanilla, canvas 2D, sans modules ES, bundler ni framework ; fonctionnement hors ligne et RNG déterministe. Un seul moteur décide des résultats. Conserver `G`, `CL`, l'ordre vérifié des scripts et `esc()` pour toute donnée joueur injectée en HTML.
- Pions à plat, sans portraits ni personnages illustrés. Aucun affichage de note, probabilité cachée, jauge d'endurance ou de traumatisme.
- Chaque écran garde la simplicité, la lisibilité et les contrôles souris/clavier exigés par la charte. Les effets et les textes ne doivent pas masquer le combat.
- Les dialogues et motivations restent du ressort de l'auteur. Ce brief n'en écrit aucun.
- La décision du **15 octobre** de retirer provisoirement métiers, milieux, moments de vie, rituels, libellés de rôles et trajectoires reste applicable. Aucun lot ci-dessous ne réactive ce catalogue.

Autorités : `VISION-MODE-MANAGEMENT.md`, `CHARTE-INTERFACE-MANAGEMENT.md`, puis décisions plus récentes explicites. Un document ancien décrivant une fonction comme absente ne suffit pas à prouver qu'elle manque encore.

## 2. L'état réel : acquis à conserver et manques vérifiés

### Déjà livré

Le lot `c162852`, intégré à `main`, corrige les frontières de round, le retour aux coins, les pauses après examens successifs, plusieurs faux gestes associés à des événements non offensifs, la confusion entre arrêt médical et KO, les annonces temporelles, le chronomètre après arrêt et un chevauchement de texte. Il reste une base à protéger, pas un chantier à refaire.

Le moteur possède déjà :

- huit styles différenciés, des attributs, compétences, gabarits, gardes et politiques de combat ;
- dégâts tête/corps/jambes, fatigue, état de danger, blessures locales et récupération ;
- clinch au centre ou contre la cage, six positions au sol, transitions, renversements, relevés et soumissions ;
- relances pour inactivité, fautes, retraits de points, disqualifications et examens médicaux ;
- trois évaluations de juge, des cartes par round et les différents types de décision ou de nul ;
- vieillissement, traumatisme, expérience, rouille, camps et coachs dans le management ;
- relecture des combats joués sous le joueur, options de lecture, plusieurs caméras et sons synthétisés.

Le monde vivant de plusieurs organisations est désormais présent. Il ne faut donc pas programmer une deuxième simulation extérieure pour donner une carrière aux combattants.

### Les manques qui justifient la refonte

1. **Le journal n'est pas une trace exhaustive d'actions.** Le moteur utilise des pas de trois secondes, mais ses lignes narratives sont sélectionnées. L'arène lit encore le temps et certaines transitions dans les phrases.
2. **Une partie des coups montrés est reconstruite.** Type, auteur et réussite sont encore tirés depuis les totaux finaux. Une répétition déterministe de cette reconstruction ne prouve pas qu'elle reproduit les échanges réellement calculés.
3. **La technique de finition peut être choisie après la décision d'arrêt.** Elle doit devenir la conséquence d'une action identifiée.
4. **Le corps calculé est mal transmis à l'image.** Les instantanés de dégâts ne traversent pas `areneBeats` ; les mobiles sont initialisés avec `leg:0` et `stam:1`, bien que les déplacements sachent lire ces valeurs.
5. **Certaines positions sont simplifiées à tort.** Une amenée peut aboutir à plusieurs positions dans le moteur ; l'arène impose encore une garde fermée à certaines transitions.
6. **L'arbitre ne joue pas encore visuellement toutes ses interventions.** Une ligne de temps mort ne décrit pas une interruption complète avec durée et reprise.
7. **La notation utilise des raccourcis.** L'écart de knockdowns peut imposer un score de round ; l'agressivité comme attribut intervient dans l'évaluation. Cela ne suffit pas à représenter l'efficacité des actions.
8. **L'adaptation n'est pas encore une mémoire détaillée du combat.** Une partie de ses effets dépend du round et des attributs ; elle ne démontre pas une réponse à des contres précisément observés.
9. **Le rejeu dépend du moteur actuel.** Les traces ne conservent pas une version de moteur ni la liste complète des événements. Le garde-fou compare l'issue résumée, ce qui peut laisser passer un déroulé différent ayant la même issue.
10. **L'écriture a un chantier propre.** La relecture du 15 octobre refuse notamment 30 des 65 textes de commentaire/coins examinés. Corriger leur déclenchement ne vaut pas validation de leur formulation.

Ces constats viennent du code et des décisions conservées dans le dépôt. Ils ne prétendent pas constituer une mesure actuelle du ressenti en jeu ni un inventaire de tous les défauts visuels possibles.

## 3. L'ordre de réalisation

L'ordre suivant est recommandé pour éviter de produire des effets visuels, des personnalités ou des commentaires sur des faits encore incertains. Chaque lot se découpe en petites tranches terminées et vérifiées. Un lot ne passe au suivant qu'après ses critères de sortie.

Cette numérotation concerne uniquement le chantier Combat ; elle ne renumérote pas les lots « Monde » existants.

### Lot 0 — Fixer la référence et protéger les décisions existantes

**But :** disposer d'une référence reproductible avant de toucher au moteur.

**À faire :** conserver des combats de contrôle couvrant décision, KO, TKO selon la nomenclature retenue, soumission, arrêt médical, faute, examen, sol et clinch ; relever les compteurs, résultats et temps de construction. Ajouter les cas de finitions proches de la cloche et de pauses successives déjà corrigés. Distinguer les textes acceptés, refusés et non encore validés, à partir de la relecture d'Anthony.

**Critères de sortie :** chaque défaut connu possède son scénario ; la version du moteur, la graine et les conditions du combat sont identifiables ; les mesures indiquent leur machine et leur périmètre. La validation humaine des textes reste séparée des tests du code.

**Dépendance :** aucune. Ce travail accompagne ensuite tous les lots ; les tests ne sont pas repoussés à la fin.

### Lot 1 — Préserver l'histoire avant toute modification des résultats

**But :** éviter qu'un combat passé change lorsque le moteur évolue.

**À faire :** définir un format de combat versionné et la politique de lecture des anciennes traces. Recommandation pour le format cible : conserver les événements utiles au rejeu des nouveaux combats jouables, avec les entrées réellement nécessaires, plutôt que compter uniquement sur la régénération du profil par son identifiant. Le lot 1 prépare ce contrat ; le lot 2 produira et enregistrera les événements. Les archives légères des six années d'avant restent distinctes : elles ne contiennent pas assez d'informations pour inventer rétroactivement une rediffusion exacte.

Séparer les données sportives persistantes des images calculées pour le canvas. Ne pas sauvegarder des milliers d'images à 60 Hz. Prévoir validation, migration séquentielle, secours et limites de taille. Le schéma de sauvegarde actuel est en version 21 ; son futur numéro se décide au moment de l'implémentation, avec les autres travaux.

**Critères de sortie :** contrat versionné défini et testé sur des cas de référence ; ancienne trace non reproductible traitée explicitement, sans réinterprétation silencieuse ; rejeu sans avance de la RNG de partie ; budget de sauvegarde mesuré sur des données représentatives. La fidélité des nouvelles chronologies persistées sera validée au lot 2, avant tout changement des résultats du moteur.

**Dépendance :** lot 0. Aucune refonte des probabilités avant cette protection.

### Lot 2 — Donner une chronologie structurée unique au combat

**But :** faire du texte et de l'animation deux lectures des mêmes événements.

**À faire :** chaque événement utile porte un identifiant, un ordre, le round, le temps sportif, sa nature, son auteur et sa cible éventuelle, la technique ou transition, son résultat et les changements d'état pertinents. Décrire séparément tentative, défense, touche, changement de position, intervention et arrêt. Le texte n'est plus utilisé pour retrouver la nature d'une action ou le temps écoulé.

Procéder en deux étapes : d'abord transmettre fidèlement ce que le moteur calcule déjà, sans changer ses résultats ; ensuite approfondir les échanges dans une nouvelle version explicitement calibrée. Certains compteurs actuels représentent des volumes pondérés par pas de temps : ils ne doivent pas être interprétés comme autant de coups individuels à animer.

Les statistiques et cartes finales doivent se rapprocher des événements sportifs, sans arrondis répétés qui créent ou effacent des actions. Toute éventuelle normalisation des volumes est spécifiée et testée.

Ce lot met en service la persistance prévue au lot 1 et vérifie qu'un nouveau combat rejoué conserve exactement sa chronologie après sauvegarde et chargement.

**Critères de sortie :** aucun impact sans événement offensif correspondant ; aucun changement de phase obtenu par une expression du commentaire ; aucun événement offensif après un arrêt ou dans une pause ; ordre stable lorsque plusieurs événements partagent le même instant. Les écarts de compteurs sont expliqués et supprimés à leur source.

**Dépendance :** lot 1.

### Lot 3 — Montrer fidèlement ce combat en environ 43 secondes par round

**But :** obtenir un premier gain visible avant d'ajouter de nouvelles mécaniques.

**À faire :** remplacer progressivement les coups de remplissage par des échanges provenant de la chronologie. Transmettre les instantanés du corps, du danger et de la position. Une amenée aboutit à la position réellement atteinte ; celui qui domine ou se relève est le bon combattant. Les gestes, impacts et sons utilisent le résultat du moteur sans nouveau tirage de réussite.

Conserver 300 secondes sportives. À x1 de lecture management, les condenser en environ 43 secondes actives ; x2/x4 accélèrent cette lecture. On peut sélectionner les gestes et mots mis en avant, mais pas modifier les faits omis : leur fatigue, leur position et leurs effets continuent d'exister. Le journal donne accès au détail.

Chaque durée et vitesse doit préciser son unité : temps sportif, temps de lecture, distance dans la cage ou pixels. Une limite de vitesse physique se contrôle avant la compression et le mouvement de caméra ; elle ne doit pas être confondue avec la vitesse apparente à l'écran.

Ne jamais utiliser les totaux finaux pour donner, dès le début, la mobilité ou le profil de domination que le combattant n'aura qu'après les échanges. Les déplacements décoratifs ne doivent pas contredire l'action, sa portée ou la cage.

**Critères de sortie :** à chaque instant échantillonné, phase, combattants, position, état et résultat visible concordent avec la chronologie ; une pause, un retour en arrière, une caméra ou une vitesse différente ne changent rien au combat. Tout fait commenté provient de la bonne fenêtre temporelle. Une action précise mise en avant est représentée fidèlement ; un résumé peut couvrir une séquence partiellement animée sans inventer de détail.

**Dépendance :** lot 2. Ce lot consomme d'abord le modèle physique existant ; il ne recrée pas une endurance parallèle dans l'arène.

### Lot 4 — Approfondir les échanges et leurs conséquences physiques

**But :** rendre les actions crédibles par leur préparation, leurs risques et leurs suites.

**À faire :** relier les frappes à une distance, une ouverture et une défense ; distinguer esquive, blocage, touche et gros impact. Une feinte prépare quelque chose, une entrée expose à un contre, une attaque au corps peut modifier le rythme. La technique de finition et la zone décisive viennent de l'action qui termine effectivement le combat.

Au clinch : entrée, contrôle, séparation et amenée doivent conserver leur continuité. Au sol : partir des six positions existantes, représenter les défenses, passages, renversements, retours debout et menaces de soumission sans transition impossible. Une tentative ne vaut pas une réussite ; une position favorable ne vaut pas automatiquement une menace décisive.

Conserver les canaux de dégâts déjà présents et leurs effets. Distinguer fatigue récupérable, danger immédiat, blessure et usure durable. Le repos peut améliorer la disponibilité sans effacer une jambe touchée ni faire disparaître une blessure. Si l'on veut montrer une jambe précise diminuée, il faut d'abord que le moteur distingue ce côté ; l'image ne l'invente pas.

**Critères de sortie :** aucune technique incompatible avec la position et le règlement choisi ; une finition possède sa chaîne causale ; les changements de mobilité et de rythme suivent l'état courant ; un même dommage n'est pas appliqué deux fois. Les résultats ne sont pas déduits d'une seconde simulation visuelle.

**Dépendances :** lots 2 et 3, règlement de référence fixé avant de spécifier les actions légales. Les changements de probabilités sont mesurés séparément des changements d'affichage.

### Lot 5 — Faire agir l'arbitre et le médecin

**But :** rendre les interruptions compréhensibles et sportivement cohérentes.

**À faire :** représenter observation, avertissement, séparation, interruption, examen, reprise et arrêt définitif comme des états ou événements explicites. Relier les relances à l'absence de progression réelle, et les arrêts à ce qui se passe, avec les capacités de défense encore observables. Distinguer KO, arrêt sur accumulation, soumission, blessure, arrêt médical et disqualification dans la cause sportive et la présentation.

Un temps mort bloque les attaques et possède un début, une durée de récupération et une reprise conforme au règlement retenu. Le médecin examine ; sa présence ne signifie pas automatiquement arrêt. L'arbitre se place et intervient au bon moment, au lieu de simplement patrouiller pendant la décision. Les gestes restent compatibles avec la représentation par pions.

Les cas plus rares, comme un combat sans résultat ou une décision technique après interruption, doivent être spécifiés selon cette même référence, sans être assimilés par défaut à un KO ou à une disqualification.

**Critères de sortie :** aucun coup durant une interruption ou après l'arrêt ; aucun retrait de point perdu ou doublé ; état de reprise et temps restant corrects ; intervention visible liée à un événement sportif. Les personnalités d'arbitres ne sont pas nécessaires pour livrer cette cohérence.

**Dépendances :** lots 2 à 4. Le règlement de référence doit être fixé avant de détailler les cas rares de faute et d'arrêt.

### Lot 6 — Reprendre l'évaluation des juges

**But :** rendre les cartes défendables à partir du round réellement disputé.

**À faire :** conserver les trois juges, les cartes par round et la classification des verdicts. Remplacer les automatismes liés au seul nombre de knockdowns et l'avantage lié à un attribut d'agressivité par l'efficacité des actions observées. Le contrôle stérile ne doit pas recevoir la valeur d'une menace effective. Les retraits restent rattachés à leur round.

Pour une référence ABC, la clarification de juillet 2025 valorise d'abord les effets des techniques ; frappe et grappling sont appréciés par leurs résultats. Domination et durée complètent cette lecture. Un 10-8 ne découle pas automatiquement de deux knockdowns ; une position tenue sans dommage ne suffit pas. Voir la source sportive en section 9.

Des différences d'appréciation peuvent exister sur un round serré ; elles ne servent pas à fabriquer artificiellement un taux de décisions partagées. L'explication détaillée des cartes appartient aux outils de contrôle ; elle ne doit pas révéler au joueur des notes physiologiques cachées.

**Critères de sortie :** évaluer chaque round séparément ; reconstruire exactement les totaux et le verdict ; réussir des cas opposant contrôle stérile et efficacité, knockdown isolé et reste du round, menace de soumission et simples tentatives. Aucun score ne doit dépendre de la réputation ou d'un résultat futur.

**Dépendances :** lots 2, 4 et 5.

### Lot 7 — Distinguer deux combattants du même style

**But :** reconnaître une manière de combattre, au-delà de l'étiquette boxeur ou lutteur.

**À faire :** distinguer capacité, préférence et décision. La puissance autorise certains résultats ; elle ne définit pas à elle seule la fréquence d'attaque. Deux spécialistes d'une même discipline doivent pouvoir différer par distance favorite, préparation, choix de cible, initiative, rythme, sortie après attaque et réaction au danger.

Construire cette différence à partir des attributs, compétences et politiques existants, puis n'ajouter que les préférences qui produisent un comportement observable. Identité stable par combattant, variations contextuelles pendant un combat. Un pressureur ne se reconnaît pas seulement à sa vitesse : il cherche à fermer une sortie. Un contreur n'a pas à reculer systématiquement sans pouvoir reprendre l'initiative.

Utiliser comme références les trois personnages déjà écrits dans la vision : Abdyldaev pour la lutte enchaînée, Swat pour le contre à distance, Montagné pour l'expérience face au déclin. Ils ne constituent pas une autorisation d'inventer de nouvelles motivations ou de trancher leurs failles non définies.

**Critères de sortie :** plusieurs combattants d'un même style produisent des tendances distinctes sur une série de graines ; un même combattant garde une signature face à plusieurs adversaires ; Anthony peut identifier les différences dans des séquences sans leur nom affiché. Un matchup compte sans déterminer à l'avance le vainqueur.

**Dépendances :** lots 3 et 4. Les cartes des juges doivent être stabilisées avant de calibrer une stratégie orientée vers une décision.

### Lot 8 — Mémoire du combat, adaptation et vraie fonction du coin

**But :** montrer des adversaires qui remarquent, tentent de répondre et n'y arrivent pas toujours.

**À faire :** garder une mémoire courte des entrées punies, défenses efficaces, sorties bloquées, cibles fragilisées et tentatives coûteuses. Les changements de plan se déclenchent sur ces observations, avec un délai, un coût et une exécution limitée par les capacités du combattant. Éviter une adaptation parfaite après un seul échec, ou automatique parce qu'un round supplémentaire commence.

Le combattant et son coin n'ont pas accès aux cartes exactes encore secrètes ni aux attributs internes adverses. Leur appréciation du combat vient de ce qu'ils peuvent observer. Une revanche peut utiliser un passé effectivement connu, sans donner accès à des détails absents des archives.

Le moteur a historiquement supprimé le vieux bonus de coin entre rounds. La vision demande un changement de comportement après une consigne : il faut donc spécifier cette fonction nouvelle, pas rétablir un bonus forfaitaire. Le joueur la regarde ; il ne devient pas entraîneur. Aucune réplique n'est écrite dans ce lot technique.

**Critères de sortie :** chaque adaptation peut être reliée à un fait antérieur ; elle ne repose pas sur le futur ni sur les cartes internes ; elle change des choix observables, peut échouer et consomme les ressources prévues. Sans fait déclencheur, pas de retournement tactique arbitraire.

**Dépendances :** lots 4 à 7. Les modalités exactes du coin demandent une décision d'auteur avant codage.

### Lot 9 — Faire continuer le combat dans la carrière

**But :** retrouver après la soirée ce que l'on a vu dans la cage.

**À faire :** relier blessures, suspensions, repos, fatigue résiduelle, usure et confiance observable aux faits du combat. Conserver les mécanismes existants de traumatisme, âge, expérience et rouille ; ne pas leur superposer un deuxième système de santé.

Faire évoluer progressivement certaines habitudes par l'expérience réelle, les difficultés rencontrées et l'entraînement du camp. Les camps ont déjà salle, coach, qualité et rodage : approfondir leurs effets techniques et leurs limites, sans transformer un changement de camp en guérison ni en hausse universelle de toutes les capacités.

Attention à l'état actuel : les changements de camp sont lus dans des faits `moment_vie`, dont la production est maintenant désactivée. Les camps initiaux et les faits anciens restent lisibles ; une source nouvelle de changements sportifs doit être décidée et créée avant de promettre des changements futurs de camp ou de coach sans réactiver le catalogue retiré.

Le déclin doit pouvoir modifier ce qu'un combattant tente et réussit : moins de marge physique, davantage de gestion si ses capacités le permettent, parfois incapacité à s'adapter. Une défaite n'enseigne pas automatiquement la réponse parfaite. Aucun résultat futur n'est forcé pour satisfaire un arc narratif.

**Critères de sortie :** même blessure dans le combat, le lendemain et la disponibilité ; un changement durable se retrouve dans plusieurs combats suivants ; les combats anciens conservent leurs profils d'époque ; les écrans ne divulguent pas le traumatisme caché. Le lien avec les faits de camp doit fonctionner sans réactiver les moments de vie refusés.

**Dépendances :** lots 1, 4, 7 et 8. Les préférences acquises et leur persistance doivent être spécifiées avant migration.

### Lot 10 — Faire parler les bons faits, avec les textes validés

**But :** que commentaire, coin, fiche, avant-combat et presse parlent du combattant que l'on a observé.

**À faire :** brancher les formulations sur des événements et leur contexte réel. Séparer sortie volontaire, relevé compétitif et relance arbitrale ; une menace de soumission ne suffit pas à dire qu'une clé précise est engagée ; un coup bloqué ne justifie pas d'annoncer une blessure.

Les commentaires suivent l'importance et le déroulement, ne révèlent pas l'issue avant l'arrêt et évitent les répétitions inutiles. Les pronostics et l'avant-combat ne lisent que les informations publiques ou connues. Les réactions de presse peuvent interpréter ou se tromper ; elles ne doivent pas inventer le résultat, une blessure ou une consigne comme un fait établi.

Réutiliser les écrans et le monde vivant existants. Faire remonter les changements sportifs qui méritent l'attention, au lieu de multiplier les notifications. Le travail éditorial est distinct : 30 textes de combat, 417 voix et 75 textes médias figurent parmi les refus de la relecture du 15 octobre. Leur existence dans le catalogue ne vaut pas permission de réemploi.

Ces décomptes sont ceux de l'export du 15 octobre, pas une affirmation que tous ces textes restent actifs. Rapprocher cet export des catalogues et déclencheurs actuels avant de constituer le travail éditorial restant.

Après les priorités camps et voix du monde, la vision permet d'approfondir les autres acteurs. Des officiels identifiables peuvent alors garder une continuité et des différences d'appréciation limitées, sans modifier les règles ni fabriquer des décisions injustes. Une identité ou une fonction nouvelle n'entre que si elle change réellement ce que le joueur voit ou décide ; son écriture reste à valider.

**Critères de sortie :** chaque affirmation factuelle pointe vers sa source ; aucune variante ne change le sens de l'action ; seuls les textes autorisés sont utilisés ; l'absence de formulation adaptée laisse du silence. Les goûts, croyances et motivations nouveaux attendent l'auteur.

**Dépendances :** lots 2 et 3 pour commencer, puis 8 et 9 pour parler des adaptations et des trajectoires. La véracité des anciens commentaires doit être surveillée dès le lot 0, sans attendre cette finition éditoriale.

### Lot 11 — Lisibilité finale, son, performance et preuve en jeu

**But :** rendre la profondeur perceptible sans augmenter la charge du joueur.

**À faire :** caméra qui laisse comprendre les séquences ; signes d'impact proportionnés ; position et état compréhensibles à travers les pions ; effets qui ne masquent ni noms, ni horloge, ni combattants. Les sons de coups, interruptions et salle suivent les mêmes événements. Le son existe déjà : il doit être synchronisé et affiné, pas recréé comme un système absent.

Valider une soirée complète à la souris et au clavier, plusieurs résolutions prévues et les options de lecture. Contrôler superpositions, noms longs, contrastes et taille utile. Le mode carrière et les parties sans agenda utilisant encore l'arène d'origine, vérifier les deux parcours du moteur partagé.

Mesurer aussi création du monde vivant, passage de semaine, soirée, sauvegarde et rejeux successifs. Conserver les événements utiles, éviter les copies inutiles et les recalculs de moteur pour dessiner une image. Déterminer les budgets sur la machine cible, puis empêcher leurs régressions.

**Critères de sortie :** validations de la section 5 satisfaites ; aucun événement ni conséquence perdu dans les données par la compression, même si seuls certains gestes sont animés ; aucun changement de résultat lorsque l'on regarde ou passe ; lecture claire en environ 43 secondes actives par round ; Anthony reconnaît des combattants et peut expliquer leurs différences après plusieurs soirées.

**Dépendance :** tous les lots concernés. Les contrôles de lisibilité, de performance et de déterminisme s'appliquent dès leur première tranche, pas seulement dans ce dernier lot.

## 4. Ce que l'on doit pouvoir constater en jouant

- Après des attaques répétées aux jambes, le combattant adapte ou subit réellement ses déplacements ; ce n'est pas une animation de boiterie sans conséquence sportive.
- Un lutteur doit installer son entrée, rencontrer une défense, pouvoir enchaîner ou renoncer ; une tentative réussie conduit à la bonne position.
- Un contreur peut se faire enfermer, mais ses sorties et sa capacité de réponse dépendent de lui et de son adversaire, pas d'une rotation décorative.
- Un vétéran conserve une façon de choisir ses actions alors que ses capacités peuvent baisser ; « expérimenté » ne lui garantit pas la victoire.
- Le gagnant d'une séquence, la cible touchée, le commentaire, les dégâts, l'intervention éventuelle et les statistiques concordent.
- Un combat serré aux points est compréhensible sans montrer des notes cachées. Une décision contestable ne résulte pas simplement d'un tirage de spectacle.
- Après plusieurs combats, on voit une continuité : préférences, failles, adaptations, usure et effets des camps. Le jeu ne réécrit pas le personnage à chaque soirée.

Ces exemples décrivent des comportements à rendre possibles. Ils ne prescrivent ni vainqueur, ni fréquence garantie de spectacle, ni histoire personnelle nouvelle.

## 5. Validation exigée à chaque étape

### Vérité sportive et causalité

Une tentative possible précède chaque impact. La défense et la cible sont identifiées. Les changements de position sont valides. Les effets physiques et statistiques se rapprochent des événements. Un arrêt clôt les actions sportives. Un temps mort gèle l'action sans effacer l'état du corps. Les cartes et pénalités produisent exactement le verdict annoncé.

### Déterminisme et mémoire

Mêmes entrées et même version : mêmes événements. Regarder, passer, revoir, changer de vitesse, caméra, son ou option ne touche pas à la RNG de partie ni à ses résultats. Sauvegarder puis charger conserve ces propriétés. Les profils acquis ne changent pas les anciennes rediffusions. Les modes anciens et le monde vivant restent couverts.

### Calibration du modèle

Petits échantillons pendant les essais ; campagne complète en fin de changement de moteur. Examiner distributions, durée, méthodes de victoire, volumes, précision, transitions, efficacité du grappling, scores, fatigue et blessures, par catégorie et contexte. Étudier les matchups et les profils au même niveau de capacité, sans imposer à tous les styles de gagner exactement aussi souvent contre chaque adversaire.

Les repères de la vision et les rapports P7/P8 sont des références datées, pas des mesures actuelles. Ne pas régler plusieurs coefficients pour obtenir un taux isolé au prix de séquences absurdes. Comparer les variantes à conditions identiques, conserver les graines des cas aberrants et vérifier la cohérence de chaque dénominateur statistique.

### Preuve visible et utilité

Les tests de phases, de vitesse, de rejeu, de cartes, de superposition et de migration restent nécessaires. Ajouter des observations sur plusieurs combats complets, dont cinq rounds et plusieurs pauses. Une assertion sur une structure de données ne prouve pas, à elle seule, que l'image est lisible ou le combattant reconnaissable.

Après chaque lot : vérifications adaptées, puis `npm run check` complet avant livraison/fusion et contrôle des versions de cache si le code livré change. Pour un écran ou un geste nouveau, appliquer la maquette et la validation prévues par la charte.

## 6. Ce qui n'est pas prioritaire ou serait une mauvaise réponse

- Ajouter des biographies, métiers ou rituels pour masquer des comportements identiques ; leur chantier a été suspendu explicitement.
- Ajouter des dizaines de styles ou d'attributs sans différence observable et testable.
- Accroître seulement le volume de phrases ou les effets de caméra.
- Diminuer le pas de simulation en espérant que cela crée, à lui seul, de meilleures décisions.
- Ajouter une physique de corps articulés, des portraits ou une dépendance externe : cela détournerait le projet de sa représentation et de son architecture actuelles.
- Fabriquer une fin spectaculaire, une blessure ou une rivalité pour chaque combat. Les moments rares doivent garder leur valeur.
- Introduire une nouvelle simulation des organisations extérieures alors que le monde vivant est déjà livré.
- Faire de la pression publique, du statut de favori ou d'un scénario narratif une garantie de résultat.
- Présenter les valeurs de calibration cachées au joueur sous forme de jauges ou d'un tableau d'optimisation.

## 7. Jalons utiles

**Jalon A — le combat dit vrai : lots 0 à 3.** L'histoire est protégée ; temps, phase, coups, corps montré, commentaire et résultat ne se contredisent plus sur les faits transmis. C'est le premier gain majeur à rechercher.

**Jalon B — les séquences et les décisions sont crédibles : lots 4 à 6.** Échanges, transitions, fins de combat, arbitre et juges se comprennent à partir de ce qui s'est passé.

**Jalon C — les combattants deviennent reconnaissables et évoluent : lots 7 à 9.** Préférences, réactions, apprentissage, limites et carrière restent propres à chacun.

**Jalon D — cette profondeur se lit sans surcharge : lots 10 et 11.** Les mots validés, l'image et le son rendent les différences perceptibles sur plusieurs soirées.

Aucun délai de réalisation n'est chiffré ici : une estimation utile demande d'abord le prototype de trace, sa mesure et la politique de compatibilité. Aucun ordre de grandeur de performance ancien n'est recyclé comme promesse actuelle.

## 8. Décisions encore nécessaires avant les tranches concernées

1. **Compatibilité des rediffusions anciennes — lot 1.** Recommandation : événements persistants pour les nouveaux combats ; comportement ancien explicite pour les traces historiques ; aucune rediffusion inventée pour les archives légères. Il reste à choisir jusqu'où maintenir les anciennes versions de moteur.
2. **Règlement sportif — avant le lot 4, détaillé au lot 5.** Fixer la référence et sa version avant de définir les actions légales. Recommandation : une base professionnelle cohérente pour les organisations du jeu, sans prétendre qu'un même règlement est appliqué partout dans le MMA réel. Les variantes éventuelles viennent après.
3. **Coin tactique — lot 8.** La vision en demande l'effet comportemental et l'ancien mécanisme a été retiré. Arrêter la fréquence, les informations disponibles, la manière de choisir une consigne et ses limites ; ne pas inventer les répliques.
4. **Ralentis dans le format court — lot 11.** Les 43 secondes sont validées. Un ralenti compensé par une accélération ailleurs est une possibilité de mise en scène, pas une décision prise ; la première version peut conserver la compression uniforme actuelle.
5. **Humanité éditoriale.** Respecter `HUMANITE-A-REFAIRE.md` : chantier séparé, familles à garder/supprimer/refaire, auteur et petit échantillon validé avant production en volume. Ce brief ne répond pas à ces questions à la place d'Anthony.
6. **Changements de camp et de coach — avant le lot 9.** Choisir quels faits sportifs peuvent les produire et comment ils sont conservés. Le circuit existant dépend des moments de vie désormais suspendus ; il ne suffit pas d'écrire de nouveaux commentaires.
7. **Budgets de temps et de stockage.** Les mesurer sur le jeu actuel et la machine cible, notamment avec plusieurs organisations simulées. Aucune limite nouvelle ne doit supprimer silencieusement l'histoire.

La question de la durée des rounds est déjà tranchée et n'est pas à reposer.

## 9. Références et contrôle des affirmations

### Sources de conception

- [Vision management](VISION-MODE-MANAGEMENT.md) : attachement par la manière de combattre, matchmaker, représentation, absence de jauges, adaptation et règle d'entrée de l'écosystème.
- [Charte d'interface](CHARTE-INTERFACE-MANAGEMENT.md) : paroles d'auteur, information observable, simplicité et lisibilité mesurable.
- [Principe de l'arène](LOT-3-L-ARENE.md) : un seul moteur décide des résultats ; le rendu les met en scène.
- [Combat et soirée déjà livrés](BRIEF-06-10-LOT-11-LA-SOIREE-ET-LE-COMBAT.md) et [options/son](BRIEF-06-10-LOT-12-OPTIONS-SON-PC.md).
- [Correctifs du 14 octobre](COMBAT-COHERENCE-14-10-2026.md) : périmètre exact du lot intégré.
- [Humanité à refaire](HUMANITE-A-REFAIRE.md) et [relecture du 15 octobre](RELECTURE-ANTHONY-15-10-2026.md) : décisions récentes à respecter.
- [Monde vivant T2d](lots/MONDE-LOT-9-T2d.md) : identifiants, comptes et sauvegarde v21 ; ne pas doubler le vivier.

### Repères de code vérifiés sur `6bb604a`

- `engine-combat.js:288` : pas de trois secondes ; `:456` : effets des dégâts par zone ; `:480` : blessures ; `:513` : fatigue ; `:698` : transitions au sol ; `:746` : relances ; `:1363` : fautes ; `:1431` : juges ; `:1438` : raccourcis de score par knockdowns ; `:1510` : examens ; `:1540` : ancien coin retiré ; `:1557` : récupération ; `:1578` : technique de finition choisie après l'arrêt.
- `engine-combat-tactics.js:8` et `engine.js:225` : profils et politiques des styles ; `engine-combat-tactics.js:211` : adaptation selon round et attributs.
- `engine-combat-grappling.js:46` et `:117` : positions et position initiale d'une amenée.
- `engine-combat-officials.js:32`, `:59` : relances et classification des verdicts.
- `arene-etat.js:107`, `:117`, `:153` : lecture du journal ; `:188` : état mobile ; `:231` : arbitre ; `:295` : images précalculées ; `:491` : position initiale au sol simplifiée ; `:752` : garde-fou de rejeu résumé.
- `arene-coups.js:66` à `:137` : reconstruction d'échanges ; `:186` : commentaires de déplacement choisis par présentation.
- `mgmt-combat.js:16`, `:76`, `:161` : compression, construction et son.
- `mgmt-corps.js:164`, `:203`, `:364`, `:401` : profil, état prêt à combattre, instantané et rejeu ; `:519` : conséquences corporelles.
- `mgmt-camps.js:90`, `:123` et `mgmt-anciens.js:115` : changements de camp, forme et expérience.
- `mgmt-data.js:24` : humanité provisoirement désactivée ; `mgmt-bureau.js:96` : sauvegarde v21.

Ces lignes sont des repères datés, à rechercher par fonction si le code change.

### Références sportives primaires consultées le 16 octobre 2026

- [ABC — Unified Rules of MMA, révision juillet 2024](https://www.abcboxing.com/wp-content/uploads/2024/07/unified-mma-rules-rev-july-2024.pdf) : référence consultée pour la durée des rounds et du repos, l'autorité de l'arbitre, les interruptions et les remises debout. Elle sert à spécifier un règlement choisi, pas à affirmer une adoption universelle par les commissions.
- [ABC — clarification des critères de jugement, juillet 2025](https://www.abcboxing.com/wp-content/uploads/2025/08/ABC-MMA-Scoring-Criteira-Clarification-7.2025.pdf) : référence consultée pour l'efficacité, les dommages, la domination, la durée, les scores et les pénalités.

### État de la vérification

Le présent brief provient d'une lecture du code et des documents du commit indiqué, avec une relecture technique séparée. La validation à 1 064 tests du 14 octobre est un résultat historique du lot de cohérence ; elle n'est pas présentée comme le bilan du `main` enrichi depuis.

Vérification du 16 octobre 2026 sur `6bb604a` : **`npm run check` réussi ; 1 326 tests réussis, aucun échec et aucun test ignoré.** ESLint et lint:content passent ; ce dernier conserve trois signalements « MAIN EVENT » non bloquants. Les tests ont duré 21 min 17,778 s, avec une autre suite exécutée en parallèle : ce temps n'est pas un benchmark du jeu. Aucun fichier suivi du dépôt n'a été modifié pour préparer ce brief.

Aucun benchmark de performance nouveau ni test de reconnaissance des combattants par Anthony n'est revendiqué. Les tests verts vérifient le logiciel existant ; ils ne valident pas par avance les améliorations proposées ni le ressenti final.
