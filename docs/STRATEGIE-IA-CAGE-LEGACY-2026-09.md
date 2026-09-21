# Cage Legacy — système de production avec les IA

14 septembre 2026. Proposition de méthode pour Anthony, auteur et développeur solo assisté par IA.

**Statut : proposition, pas nouvelle spécification du jeu.** Ce document ne remplace aucun CDC, ne valide aucune question ouverte et n'autorise aucune réécriture du moteur. Le code du jeu et les configurations des assistants n'ont pas été modifiés pour le produire.

Configuration déclarée : ancien usage de Claude Opus, abonnement principal désormais utilisé avec GPT‑5.6 Sol, OpenCode gratuit, Gemini Pro et Meta Muse Spark 1.3. L'édition exacte de Gemini et les droits de chaque abonnement restent à vérifier dans leurs interfaces. Aucun budget API supplémentaire n'est supposé.

## 1. Le résultat à viser

Construire un atelier dans lequel chaque demande devient une modification traçable, vérifiable, réversible et fidèle au jeu. La connaissance du projet appartient au dépôt ; les assistants sont remplaçables. Le jeu livré continue à fonctionner sans eux, sans serveur et sans abonnement.

Une garantie de production parfaite sur plusieurs mois n'est pas possible. Aucun modèle, nombre d'agents ou prompt ne la fournit. En revanche, on peut imposer des conditions concrètes de livraison et réduire systématiquement les erreurs qui se répètent. La perfection proclamée est remplacée par une preuve disponible pour chaque exigence importante.

L'excellence de Cage Legacy se juge sur deux plans distincts :

- **Solidité technique** : préserver les sauvegardes, reproduire les simulations, rendre les changements localisables, détecter les régressions, garder le jeu autonome.
- **Réussite du jeu** : faire éprouver le métier de matchmaker, les informations partielles des six regards, les conséquences différées et l'attachement à des combattants. Un joueur doit pouvoir raconter ce qui est arrivé à quelqu'un après trois heures, conformément au CDC §12.

Les tests vérifient le premier plan et certaines conditions du second. Ils ne prouvent ni l'émotion, ni le plaisir, ni la justesse des voix.

## 2. Ce que le dépôt montre déjà

Inspection de la branche `lot-3a-corps-soiree`, HEAD `b768830`, avec des modifications locales préexistantes. Ce sont des observations sur un travail en cours, pas le verdict d'un audit exhaustif de la version publiée.

### Des fondations utiles à conserver

- Le moteur de combat existe et le CDC demande de le conserver.
- `G` et `CL` sont identifiés ; le jeu utilise des scripts classiques partageant un environnement global.
- `tests/helpers/loadGame.js` charge le vrai code dans l'ordre lu dans `index.html`. Cette source unique est un avantage réel.
- La sauvegarde dispose d'une principale, d'un secours et de contrôles ; le management a désormais son propre circuit de persistance.
- Des simulations Monte Carlo et des outils de comparaison existent déjà dans `tools/`.
- Le CDC, ses addendums et le lot 3a contiennent des contraintes concrètes. Le lot 3a donne même des cibles statistiques et des critères de rechargement.
- `opencode.json` référence déjà le CDC, ses deux addendums et les six voix. Il faut harmoniser les autres assistants avec cette base.

### Les écarts à traiter en premier

1. **Une commande qualité décrite de deux façons.** `AGENTS.md:21` annonce lint, lint de contenu et tests. `package.json:11` exécute seulement lint puis tests. `CLAUDE.md` décrit cette seconde réalité. Un assistant peut donc annoncer avoir respecté les règles sans avoir vérifié le contenu.
2. **Deux orientations d'interface.** `CLAUDE.md:24` prescrit le mobile ; le CDC management §10 et l'addendum §24 prescrivent le PC. Le management doit être explicitement distingué de l'historique carrière. Il ne faut pas faire disparaître une exigence de la carrière en corrigeant celle du management.
3. **Une référence absente.** `AGENTS.md:41` renvoie à `docs/QUESTIONS-OUVERTES.md`, introuvable dans cet espace de travail. L'addendum y renvoie aussi. Il faut retrouver son historique ou constituer un registre actuel de questions, sans inventer ses anciennes réponses.
4. **Des inventaires périmés.** `CLAUDE.md` mentionne encore une version de sauvegarde 4 et 116 tests ; le code carrière utilise `SAVE_VERSION=5`, le management `MGMT_SAVE_VERSION=3`. Le contrôle exécuté ici découvre 230 tests. Ces chiffres doivent être générés ou datés, jamais copiés comme vérité durable.
5. **Du hasard hors graine dans une identité.** `engine.js:276`, `uniqueFighterId()`, emploie `Date.now()` et `Math.random()`. Cela ne prouve pas à lui seul que le vainqueur d'un combat est instable ; cela interdit de prétendre que tout l'état généré est déterministe. Il faut définir le périmètre exact de reproductibilité, puis le tester. Le moteur reste hors modification pour le lot 3a.
6. **Le contrôle actuel du contenu a une portée limitée.** Il émet 3 signalements, sort avec succès par défaut, et rapporte 0 pool enregistré. Sa vérification de longueur ne couvre actuellement que `data-people.js`. Ajouter son appel à `check` ne suffira pas à garantir les six voix ou tous les contenus management. Une occurrence signalée est dans un commentaire : ne pas corriger aveuglément.
7. **Le navigateur virtuel ne vérifie pas le dessin.** Le harnais remplace le Canvas 2D par un objet sans rendu et ne calcule pas la mise en page. Il vérifie des comportements utiles, pas la lisibilité de l'arène ou l'ergonomie PC.
8. **La mémoire demande une décision explicite.** L'addendum §1 évoque une dizaine de faits récents ; le §2 dit que le fait ne disparaît jamais. `mgmtAddFact()` supprime les plus anciens au-delà de `MGMT_FACTS_MAX=10`, et la réparation fait de même. Le lot 3a demande lui aussi dix faits maximum. Il faut préciser si une archive durable distincte est souhaitée, quels faits elle conserve et avec quelle limite. Aucune solution n'est choisie ici.
9. **Deux politiques de sauvegarde coexistent.** La carrière refuse explicitement les versions antérieures à 5, alors que des instructions générales parlent de migrations compatibles. Le management prévoit une migration 2 → 3. Les assistants doivent distinguer reset historique décidé, versions désormais prises en charge et engagements futurs.
10. **Pas de workflow GitHub Actions dans ce dossier.** Cela ne permet pas d'exclure un contrôle externe ; cela signifie qu'aucun contrôle de cette forme n'est versionné ici.
11. **La liste des tests est écrite à la main dans `package.json`.** Un nouveau fichier peut exister sans être lancé par `npm test`. Ajouter une découverte contrôlée ou vérifier automatiquement que tous les fichiers de tests attendus sont inclus. Le lot 3a demande explicitement l'inclusion de son futur fichier de tests.

### Contrôles exécutés pour ce diagnostic

- `npm run check` : sortie 1 ; **230 tests, 228 réussites, 2 échecs, 0 ignoré, 0 annulé**. Durée rapportée : environ 103 secondes.
- Échecs : `tests/mgmtBureau.test.js:680`, « MGMT auto-cycle — vider la pile ouvre le cycle suivant sans permission », et `:689`, « MGMT bouton discret — pile née vide : texte et liseré, sans aplat ».
- `npm run lint:content` : sortie 0 ; **3 signalements**.
- L'ordre réel des balises de chargement a été lu. Il contient notamment `ui-11-keys.js`, les trois fichiers `mgmt-*` et enfin `main.js`.

Ces deux échecs doivent être confrontés au nouveau déroulement imposé par le lot 3a. Ils peuvent révéler une régression, une attente devenue obsolète ou les deux ; cette inspection ne tranche pas la cause. Il serait incorrect de changer les assertions seulement pour retrouver du vert.

## 3. Une seule mémoire de projet, plusieurs portes d'entrée

### La hiérarchie proposée

1. Décision explicite d'Anthony sur la demande courante.
2. CDC validé et amendements explicitement applicables au sujet.
3. Contrat du lot et critères d'acceptation validés.
4. Contrats techniques du domaine.
5. Code et tests : preuve du comportement actuel, qui peut différer du comportement voulu.
6. Conversations, résumés et mémoire automatique : aides à retrouver les décisions, jamais autorité supérieure.

Une date récente ne suffit pas à rendre un document prioritaire. Un remplacement doit indiquer ce qu'il remplace. En cas de conflit réel entre deux documents d'autorité, l'agent pose la question sur ce point et poursuit seulement les parties indépendantes.

### Les documents utiles

Faire évoluer les documents existants avant d'en multiplier les copies :

- **`AGENTS.md`** : constitution courte, règles stables, commandes exactes et chemins d'accès. Éviter d'y recopier le jeu entier ou tous les incidents.
- **`docs/INDEX-PROJET.md`**, à créer : document d'entrée indiquant quels textes sont applicables à la carrière, au management et au lot actif ; statut, section remplacée, dernière vérification.
- **`docs/ETAT-DES-LIEUX.md`**, à actualiser : responsabilités, zones conservées, zones retirées, branche et révision observées. L'inventaire historique reste identifiable comme historique.
- **Registre des questions**, à restaurer ou créer : question exacte, documents en désaccord, parties dépendantes, réponse d'Anthony et décision correspondante.
- **Décisions techniques**, introduites lorsqu'un choix mérite d'être retenu : problème, choix, options écartées et motif, conséquences, périmètre. Pas un document par renommage.
- **Contrat de lot et rapport de lot** : une intention vérifiable puis les preuves de ce qui a effectivement été livré.
- **Exemples acceptés et refusés par Anthony** : captures, comportements, contenus d'auteur et raisons du choix. Ces exemples enseignent la direction artistique et l'ergonomie beaucoup mieux qu'un adjectif tel que « premium ».

### Comment les outils lisent la même chose

- **Codex** : règles stables dans `AGENTS.md`, procédures spécialisées dans des skills chargées selon la tâche. La documentation officielle décrit ces mécanismes : [instructions de projet](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills).
- **Claude Code** : après résolution des contradictions, transformer `CLAUDE.md` en porte d'entrée qui importe `@AGENTS.md` et renvoie aux détails nécessaires. Extraire auparavant les informations utiles de son ancien guide pour ne rien perdre. Claude Code documente cette importation et recommande de la vérifier dans le contexte chargé : [mémoire Claude Code](https://code.claude.com/docs/en/memory).
- **OpenCode** : garder `AGENTS.md` et utiliser `instructions` pour charger les textes communs utiles ; c'est déjà partiellement fait. Les références textuelles ne sont pas toutes des imports automatiques. Ne pas supposer que Claude et OpenCode chargent la même chose parce que deux fichiers existent : [règles OpenCode](https://opencode.ai/docs/rules/).
- **Gemini CLI, si utilisé** : un `GEMINI.md` court peut importer les règles communes ; l'outil permet aussi de configurer les noms des fichiers de contexte. Cela ne décrit pas le fonctionnement de l'application web Gemini. Dans une conversation web, fournir le paquet de contexte du lot : [contexte Gemini CLI](https://geminicli.com/docs/cli/gemini-md/).
- **Muse** : si utilisé à travers OpenCode, profiter des règles d'OpenCode et vérifier le contexte effectivement transmis. S'il est utilisé dans une autre interface, fournir le même paquet de contexte explicitement.

Un test d'accueil simple vérifie chaque outil : retrouver la source du lot, les fichiers interdits, le rôle de `G`, le circuit de sauvegarde concerné et les contenus réservés à l'auteur. Une bonne réponse prouve seulement qu'il a compris ce paquet, pas qu'il obéira toujours.

### Le paquet d'une session

L'agent prépare : objectif, révision de base, changements locaux présents, extraits du CDC nécessaires, points d'entrée et appelants, données modifiées, invariants, tests utiles, décisions non résolues et définition de « terminé ». Les sources complètes restent consultables.

Au passage de relais, il écrit : réalisé, vérifié, non vérifié, fichiers changés, décisions prises avec source, problème restant et prochaine action. Une nouvelle conversation reprend ce dossier au lieu de demander une nouvelle autobiographie du projet.

Pas de base vectorielle nécessaire au départ : recherche dans le dépôt, index clair et symboles du code suffisent pour commencer. N'ajouter un index sémantique que si des tâches documentées échouent à retrouver l'information ; ses résultats devront toujours citer le fichier et la version. Le fine-tuning n'est pas une mémoire fiable d'un dépôt changeant chaque semaine.

## 4. Répartition de tes IA

Les rôles ci-dessous sont un **point de départ à mesurer sur Cage Legacy**, pas un classement universel.

### GPT‑5.6 Sol : responsable de l'intégration

Utiliser ton outil principal pour préparer les lots, suivre les dépendances, implémenter les parties délicates, analyser les sauvegardes et intégrer le travail. Sol est bien documenté avec outils, entrées image et raisonnement réglable ; ces capacités ne prouvent pas à elles seules qu'il gagnera ton évaluation locale. [Fiche officielle Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

Régler l'effort selon le travail : ordinaire pour une modification locale claire, plus poussé pour une migration, une ambiguïté de contrat ou un défaut de simulation. Le maximum systématique n'est pas un critère de qualité. Garder une réserve d'usage pour la revue et les corrections après intégration.

### Gemini Pro : lecteur critique du cahier des charges et de l'interface

Lui donner un rôle initial de confrontation : liste des exigences omises, scénario qui contredit l'implémentation, comparaison de captures au CDC. Il reçoit les sources et le changement, puis cherche des contre-exemples. Une critique doit citer une règle ou un comportement reproductible.

Conserver le modèle effectivement disponible dans ton abonnement et noter son nom exact lors des évaluations. Google publie une liste distinguant familles et versions ; « Pro » seul ne fixe ni la version ni l'accès API. [Modèles Gemini](https://ai.google.dev/gemini-api/docs/models).

### Muse Spark 1.3 et modèles gratuits OpenCode : missions bornées

Commencer par la lecture : retrouver des appelants, dresser une liste de champs de sauvegarde, extraire une matrice exigence/preuve, proposer des scénarios de test. Leur ouvrir ensuite des changements localisés si leur évaluation est satisfaisante. Le statut gratuit n'est ni une preuve d'incompétence ni une preuve de fiabilité.

OpenCode est l'outil d'exécution ; le modèle choisi et le fournisseur déterminent les capacités et les conditions d'usage. Son catalogue actuel distingue Muse Spark 1.3 payant de « Muse Spark 1.3 Contributor Free ». Il décrit plusieurs offres gratuites comme temporaires et indique que les échanges du niveau Contributor peuvent servir à l'entraînement. Cela compte pour tes dialogues inédits et ta bible d'auteur : avant d'y envoyer ces éléments, choisir explicitement le niveau et les conditions acceptés. [Catalogue et confidentialité OpenCode Zen](https://opencode.ai/docs/zen/).

La méthode doit continuer à fonctionner si une offre gratuite disparaît. Pas de recharge API automatique ou de bascule payante implicite dans un dispositif conçu autour de tes abonnements.

### Claude Opus : second avis lorsqu'il est déjà accessible

L'utiliser pour une revue ciblée difficile ou comme candidat lors d'une évaluation comparative. Ne pas souscrire un deuxième abonnement permanent sans bénéfice mesuré. Un autre modèle peut proposer un contre-exemple que le premier n'a pas vu ; il peut aussi partager son erreur.

### Combien en même temps

Par défaut : **un agent écrit, un autre vérifie** pour un changement à risque. Une correction triviale peut être faite et contrôlée par le principal. Une lecture indépendante n'a pas besoin d'écrire dans le dépôt. Les lots parallèles ne deviennent utiles que si leurs interfaces et fichiers sont séparés et si le temps d'intégration reste inférieur au temps gagné.

Les worktrees permettent des répertoires de travail distincts sur le même dépôt, mais ne règlent pas les conflits de conception. Chaque changement doit être revu puis testé sur la version intégrée. [Worktrees Codex](https://learn.chatgpt.com/docs/environments/git-worktrees).

Pas de vote à la majorité entre modèles. Un désaccord se résout par le CDC, une reproduction ou une décision d'auteur.

## 5. Choisir les modèles avec une évaluation Cage Legacy

Créer progressivement une petite batterie tirée d'incidents et de lots réels, d'abord six cas, puis environ douze à vingt. Les volumes proposés servent à amorcer l'évaluation, pas à annoncer une précision statistique.

Cas adaptés au dépôt :

1. Repérer la contradiction de `check` sans prétendre l'avoir corrigée.
2. Ajouter un champ management avec migration d'une sauvegarde prise en charge et secours conservé.
3. Ajouter une dérivation de profil qui ne consomme pas la RNG de la partie.
4. Trouver pourquoi un nom joueur s'affiche dangereusement dans un nouveau chemin HTML.
5. Faire respecter l'unique combat déroulé sans perdre la sélection au clavier.
6. Identifier une fuite d'information cachée par un titre, un libellé ou un attribut accessible.
7. Détecter une action rejouée après chargement.
8. Garder la carrière intacte après un changement management.
9. Signaler une réplique manquante sans inventer de voix.
10. Détecter un conflit d'autorité et formuler la question minimale.
11. Préserver les ancres et la portée globale lors d'une extraction autorisée.
12. Analyser une cible Monte Carlo avec graines et dénominateurs corrects.

Chaque candidat reçoit le même état initial, le même dossier et des moyens comparables. Répéter les cas critiques au lieu de sélectionner la meilleure tentative. Conserver quelques cas non montrés lors de l'amélioration des instructions.

Mesurer séparément : exigences satisfaites, violations graves, défauts échappés, régressions, fausses alertes, temps de correction par Anthony, délai et coût réel ou quota consommé. Un test modifié sans justification ou une réplique inventée constitue un échec critique, même si le code s'exécute.

La métrique de décision est le **coût d'un lot accepté et stable**, comprenant la relecture et les reprises. Un score unique ne doit pas permettre à dix réussites faciles de masquer une sauvegarde détruite.

Réévaluer les rôles lors d'un changement majeur de modèle ou quand des échecs répétés apparaissent ; faire une courte revue mensuelle. Aucun achat supplémentaire sans amélioration observable sur les tâches qui te ralentissent. La documentation OpenAI recommande des évaluations propres à la tâche, continues, confrontées au jugement humain ; l'évaluation peut rester locale sans API dédiée. [Bonnes pratiques d'évaluation](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## 6. L'architecture à faire grandir

Conserver les contraintes : JavaScript classique, Canvas 2D, global partagé, zéro dépendance d'exécution, `G`, `CL`, pas de modules ES, pas de framework ni de bundler. Les outils de développement peuvent avoir leurs dépendances ; ils ne doivent pas devenir une condition pour lancer la version livrée.

### Les frontières proposées

- **Données** : définitions et contenu d'auteur ; pas de mutation de la partie ni d'accès au DOM.
- **Simulation** : profils, combats, conséquences, calendrier et décisions ; fonctions testables, hasard explicite.
- **Persistance** : chargement, migration, validation et secours. Distinguer les contrats carrière et management avant de décider si une consolidation a un intérêt.
- **Présentation** : convertir l'état en ce que le joueur peut percevoir ; respecter l'information imparfaite et `esc()`.
- **Contrôleur** : recevoir l'action, vérifier qu'elle est autorisée, appliquer une transition, sauvegarder au moment prévu et demander le rendu.

Ce sont des directions de dépendance, pas une obligation de créer immédiatement cinq nouveaux dossiers. Aujourd'hui `mgmt-bureau.js` porte plusieurs responsabilités. Les extraire seulement lorsqu'un lot le permet, avec une preuve de comportement conservé. Le lot 3a interdit explicitement certaines zones : ce plan ne les rouvre pas.

### Contrat de chaque domaine

Documenter pour chaque fonction structurante : entrées, sorties, champs lus/écrits, RNG consommée, effets sur sauvegarde, préconditions, erreurs et visibilité joueur. Définir en priorité les transitions du cycle et les identités de combattants.

Progressivement, faire calculer les nouvelles règles à partir de paramètres explicites et centraliser leurs mutations. Les anciennes fonctions globales peuvent rester des points d'entrée. Éviter un second état concurrent à `G`, un deuxième moteur de combat ou un bus d'événements général sans besoin constaté.

### Contrôler les frontières par la machine

Introduire un contrôle syntaxique adapté aux scripts classiques, idéalement fondé sur un parseur JavaScript, pour vérifier les symboles déclarés, collisions globales et accès interdits. Le linter actuel extrait ses globaux par expressions régulières : il ne prouve pas à lui seul l'ordre des dépendances ou l'absence de collision entre fichiers.

Ce contrôle doit connaître les fichiers réellement chargés depuis `index.html`, détecter les références manquantes et les redéclarations interdites, distinguer exécution au chargement et appels ultérieurs, interdire DOM/Canvas dans le nouveau code de simulation, et limiter hasard/horloge aux frontières autorisées. Introduire ces règles progressivement avec un état de référence explicite pour l'historique ; aucune tolérance silencieuse sur le nouveau code.

JSDoc peut préciser les structures sans changer le langage. Ajouter éventuellement une vérification de types sur les zones prêtes, comme outil de développement, après un essai qui mesure les erreurs utiles et les faux positifs.

La limite de quarante lignes du guide historique peut signaler une fonction confuse ; une extraction mécanique pour satisfaire un chiffre peut aussi nuire. Une amélioration d'architecture doit montrer quelle modification devient plus simple, quel risque baisse et quel comportement reste identique.

## 7. Déterminisme et preuve de causalité

Définir précisément ce qui doit être reproductible : avec la même version, la même graine, le même état initial et les mêmes actions, obtenir le même état métier et les mêmes conséquences. L'animation peut utiliser un hasard distinct, à condition de ne jamais influer sur la simulation.

Pour les générations locales de profil, préserver le contexte aléatoire même en cas d'exception. Vérifier aussi les compteurs et autres états secondaires : restaurer uniquement `SEED` ne prouve pas que la fonction n'a aucun autre effet. Séparer création d'une identité de partie et reconstruction d'un profil existant.

Conserver un enregistrement technique de reproduction : version, graine, état initial, actions et résultat. Ne pas le confondre avec une nouvelle mémoire narrative en jeu. Les événements de diagnostic ne deviennent pas une nouvelle mécanique.

Un écran de diagnostic réservé au développement peut expliquer pourquoi une proposition, une blessure ou un silence survient. Il lit les mêmes décisions que le jeu ; il ne recalcule pas sa propre version des règles. Les notes cachées peuvent y être examinées par le développeur, sans les exposer dans l'interface joueur. Dans un jeu entièrement local, un nombre caché à l'écran n'est pas un secret contre quelqu'un qui inspecte le code.

## 8. La chaîne de qualité

### Niveau rapide : chaque changement cohérent

Contrôle de syntaxe, règles d'architecture applicables, tests liés au changement et vérification des exigences touchées. Un bug nouveau ou reproduit appelle un test comportemental qui échoue avant sa correction, sauf impossibilité expliquée. Un simple changement documentaire n'exige pas une fausse suite de tests.

### Niveau complet : chaque livraison de code

Lancer `npm run check` sur la version intégrée. Faire inclure l'appel du contrôle de contenu dans le lot d'outillage approprié, puis distinguer erreurs certaines et signalements éditoriaux. Ajouter un contrôle dédié pour les contraintes management ; ne pas transformer en interdiction automatique les anciennes recommandations de prose.

Les preuves doivent donner révision ou empreinte des fichiers contrôlés, commande, résultat, date et échecs. Une exécution sans permission suffisante ou interrompue est « non vérifiée », jamais « verte ». Ne pas relancer un contrôle réussi sans changement ou raison nouvelle.

Conserver les scripts de vérification dans le dépôt. Une intégration continue peut les exécuter sur les propositions de modification et avant publication, avec les mêmes dépendances verrouillées et une version de Node identifiée. Vérifier la découverte des nouveaux tests. Sur un poste sans service distant, exécuter les mêmes contrôles localement avant intégration ; le fournisseur d'IA n'est jamais l'unique gardien du résultat.

### Les sauvegardes comme engagement envers le joueur

Conserver des exemples de chaque version officiellement prise en charge. Vérifier migrations successives, principale corrompue, secours valide, stockage plein, formats futurs refusés proprement et absence de contamination entre carrière et management. Le chargement invalide ne doit pas publier un état partiellement réparé dans `G`.

Tester l'enchaînement sauvegarder → fermer → recharger → continuer, pas seulement la fonction `migrate()` isolée. Vérifier qu'une soirée déjà calculée ne rejoue pas et qu'une écriture échouée a le comportement décidé. Les modalités de récupération doivent être spécifiées avant qu'un agent invente un reset.

### Vérifier des séquences, pas seulement des exemples

Générer des suites d'actions légales avec graine ; vérifier les invariants après chaque étape. Réduire une séquence fautive à une reproduction courte. On peut compléter le harnais existant ou évaluer `fast-check`, uniquement en dépendance de développement. [Tests par propriétés](https://fast-check.dev/docs/introduction/).

Exemples d'invariants propres au lot 3a : traumatisme non décroissant et borné, retraite médicale définitive, exclusion des suspendus, carte verrouillée avant résolution, pas d'ajout de combat sans action prévue, aucune double conséquence au rechargement. Leur présence dans ce plan ne signifie pas qu'ils ont tous été vérifiés aujourd'hui.

### Tester la capacité des contrôles à trouver une faute

Sur quelques protections critiques, introduire temporairement une erreur dans une copie de test : omettre l'échappement d'un nom, laisser passer un suspendu, consommer la graine lors d'une consultation, rejouer la soirée. Le contrôle correspondant doit échouer. Retirer la mutation ensuite. Un grand nombre de tests verts ne sert pas si ces fautes passent.

### Le navigateur réel

Ajouter quelques parcours automatisés avec captures : entrée dans le management, proposition, ouverture/fermeture d'un combat, souris et clavier, soirée, lendemain et rechargement. Vérifier console, focus, erreurs réseau et texte visible. Les comparaisons d'images doivent être stabilisées et les nouvelles références examinées, pas acceptées en bloc. [Comparaisons visuelles Playwright](https://playwright.dev/docs/test-snapshots).

Utiliser les dimensions management prévues par le CDC : 1280, 1440 et 1920 pixels. Tester le zoom et les noms longs. Fixer ultérieurement les navigateurs pris en charge et le matériel de référence ; ils ne sont pas décidés par ce rapport.

Mesurer avant d'optimiser : délai entre action et retour visible, temps de résolution d'une soirée, temps de rendu de l'arène, taille des sauvegardes et croissance de la mémoire après des saisons longues. Publier les conditions et les percentiles utiles, puis convenir de budgets sur le matériel retenu. Éviter de recalculer un profil stable à chaque rendu, mais vérifier qu'un éventuel cache ne conserve pas un état périmé. Aucune amélioration de vitesse ne justifie de changer les résultats ou la consommation de RNG sans décision explicite.

### Simulation lourde et équilibrage

Réutiliser les outils existants. Pour le lot 3a, le cahier des charges demande au moins 20 000 combats par catégorie : c'est une exigence du lot, pas une nouvelle recommandation arbitraire.

Publier graines, version, générateur des combattants, taille des groupes, définition précise de « corps sain », dénominateur de chaque taux, mesures et incertitude. Comparer les variantes sur les mêmes graines et garder d'autres graines pour la confirmation. Des résultats proches d'un seuil demandent une analyse d'incertitude ; un taux ponctuel qui tombe dans la cible ne suffit pas.

Tester aussi des saisons longues : usure du roster, disponibilité, remplacement, accumulation des faits et impossibilité éventuelle de compléter une carte. Les agents peuvent chercher une stratégie dominante ; ils ne doivent pas l'éliminer en inventant de nouvelles règles. L'expression « aucune stratégie d'optimisation » du CDC est une intention à rendre testable avec Anthony, pas un théorème promis par un modèle.

## 9. Le trajet d'une idée jusqu'à une version jouable

1. **Anthony exprime l'effet recherché.** Situation du joueur, changement souhaité, exemple accepté et limite à ne pas franchir. Même une idée séduisante reste examinable : quelle décision réelle améliore-t-elle ?
2. **L'agent confronte l'idée au canon.** Il cite le CDC, les conséquences, le coût d'écriture et les conflits. Il pose uniquement les questions qui changent le résultat.
3. **L'agent écrit le contrat du lot.** Comportements attendus et interdits, fichiers autorisés, données, sauvegarde, contenus d'auteur, critères mesurables, sortie jouable et méthode de retour arrière.
4. **Le travail part d'un état identifié.** Sauvegarder les modifications en cours par le procédé convenu ; ne jamais les effacer pour obtenir une base propre. Une branche ou un worktree porte le lot ; pas deux rédacteurs simultanés sur les mêmes fichiers.
5. **L'agent implémente une tranche complète.** Action → état → présentation → sauvegarde → reprise. Limiter les changements aux besoins du lot.
6. **Les vérifications sont exécutées.** Les tests ne sont pas assouplis pour correspondre après coup au code. Si le comportement attendu a changé, citer la décision et garder une preuve de l'ancien périmètre encore valide.
7. **Un regard indépendant examine les risques.** Recevoir le contrat et le changement avant le récit justificatif du premier agent. Rendre des défauts reproductibles ou des questions précises, avec gravité et preuves.
8. **Anthony joue le résultat.** Le principal prépare une partie ou une graine permettant d'atteindre immédiatement le cas. Anthony juge l'ergonomie et le sens ; il ne reconstitue pas lui-même le montage de test.
9. **L'intégration est vérifiée.** Exécuter les contrôles nécessaires après fusion des changements ; le succès d'une branche isolée ne certifie pas l'ensemble.
10. **La mémoire du projet est mise à jour.** Rapport, décisions, questions et exemples acceptés. Chaque erreur récurrente reçoit une prévention adaptée, pas obligatoirement une nouvelle règle dans `AGENTS.md`.

### « Terminé » a un sens vérifiable

Un lot est terminé lorsque ses exigences validées sont réalisées, les vérifications requises passent sur le bon état, les contenus d'auteur nécessaires sont fournis, les risques restants sont explicités et le parcours jouable est disponible. Une absence de réponse d'Anthony à une question de conception ne devient jamais une approbation par délai.

Si deux tentatives reviennent à la même impasse, imposer un changement de méthode : reproduction réduite, lecture d'un autre contrat, nouvelle hypothèse ou critique indépendante. Continuer tant qu'une action utile est possible ; suspendre la partie dépendante lorsqu'il manque une décision réelle. Une boucle sans critère d'arrêt peut consommer le quota et dégrader le code sans améliorer le jeu.

## 10. Des procédures spécialisées, peu nombreuses et testables

Commencer avec quatre procédures, puis ajouter les deux suivantes lorsqu'elles deviennent récurrentes. Elles sont proposées ici ; aucun skill ou agent n'a été installé.

- **Préparer un lot** : lit les autorités, identifie l'état, rassemble le contexte, produit un contrat et les questions bloquantes.
- **Protéger les sauvegardes** : classe le changement de schéma, définit compatibilité et reprise, exécute les cas de migration et secours.
- **Vérifier déterminisme et simulation** : recense hasard, compteurs et temps, produit les reproductions et la comparaison statistique applicable.
- **Livrer et reprendre** : exécute les contrôles, prépare le parcours jouable, écrit un rapport fondé sur les résultats et le prochain point de reprise.
- **Contrôler une interface management** : visibilité des informations, unique combat ouvert, souris/clavier, densité PC et captures.
- **Intégrer le contenu d'auteur** : relie chaque texte à sa source, contrôle les variables et conditions, signale les manques ; ne rédige jamais les voix.

Chaque procédure décrit déclencheur, entrées, fichiers à lire, étapes, preuve de sortie et limites. Elle passe elle-même un cas réel. Un agent « architecte » avec une personnalité et aucun critère de sortie ajoute peu de valeur.

Les hooks peuvent rappeler ou déclencher ces vérifications, mais le script du dépôt doit rester exécutable indépendamment de l'assistant. Les protections de publication doivent être contrôlées hors de la seule conversation. L'exécution automatique ne doit ni modifier le CDC, ni fusionner un choix de design, ni publier sur simple consensus des modèles. [Hooks Claude Code](https://code.claude.com/docs/en/hooks-guide).

## 11. La signature d'auteur et l'indépendance

### Ce qu'Anthony garde

La vision, les voix, les noms et motivations des personnages, les raisons de se battre, la sélection des situations, les critères de justesse et la décision finale. Les documents des six voix et des légendes déjà écrits constituent les sources ; l'agent ne les complète pas de sa propre initiative.

L'agent peut établir la liste des situations qui manquent, les conditions d'une réplique, les personnes concernées et les contraintes de variables. Anthony écrit le texte. Le texte validé reçoit une référence stable et son intégration respecte sa formulation.

Une réplique manquante reste absente avec le signalement de développement prévu. Pour une version publique, la fonctionnalité qui en dépend reste incomplète tant que l'auteur ne l'a pas fournie. Aucun texte générique ne doit faire passer ce travail pour fini.

### Ce qui fait disparaître l'impression de production générique

Une direction d'archives cohérente, des silences qui ont une cause, des témoignages partiels et des conséquences durables. Évaluer la répétition réelle, les phrases hors contexte, la différence entre voix et le rythme des demandes. Changer de modèle de rédaction ne résout pas un manque d'intention artistique.

Pour l'image et le son, partir d'une charte et d'exemples choisis par Anthony. Les IA disponibles peuvent servir à explorer une texture ou un essai visuel hors jeu, mais aucun générateur supplémentaire n'est indispensable au système. L'interface existante et les éléments vectoriels doivent être travaillés comme tels. Le CDC déconseille déjà la multiplication de portraits IA.

### Indépendance technique

Livrer tous les scripts, styles, polices et médias nécessaires localement, contrôler l'absence de requêtes externes indispensables et tester le mode de distribution retenu sans réseau. Le jeu ne doit pas appeler un modèle pour choisir une réponse, générer un combattant ou expliquer un résultat.

L'outillage et les services IA servent à fabriquer le jeu. Les sauvegardes, sources, contenus et décisions restent exportables. Prévoir un paquet de version identifié, des sauvegardes de référence et un essai de restauration depuis une copie distincte. Une copie locale dans le même dossier n'est pas une stratégie complète de sauvegarde.

Avant diffusion, établir la provenance des médias et vérifier les conditions de la plateforme retenue à cette date. L'objectif est une identité d'auteur assumée et une qualité cohérente ; il ne nécessite pas de mentir sur les outils employés.

## 12. Ordre de mise en place

Les phases suivantes sont ordonnées par dépendance. Elles ne promettent pas une durée sans connaître ton temps disponible. Une phase se termine sur ses preuves, pas parce que sa semaine est écoulée.

### Phase 1 — Réunifier la vérité

Traiter le chargement des consignes, les différences carrière/management, les documents absents et les chiffres périmés. Établir l'état de référence et analyser les deux échecs observés. Garder le travail 3a en cours identifiable. Sortie : tous les assistants retrouvent les mêmes sources ; les questions réellement ouvertes sont visibles.

### Phase 2 — Fermer les trous de contrôle

Mettre la commande qualité et sa documentation en accord, étendre le contrôle du contenu au périmètre voulu, ajouter les premières vérifications d'architecture et de navigateur. Restaurer une exécution complète verte par correction justifiée. Sortie : une faute critique volontaire sur les protections choisies est effectivement détectée.

### Phase 3 — Fiabiliser un lot réel

Appliquer la méthode au lot management en cours sans l'élargir. Pour le 3a : corps, soirée, lendemain, sauvegarde et mesures prévus par sa spécification. Les voix demeurent hors périmètre. Sortie : parcours rejouable, tests, calibrage avec incertitude et rapport des écarts.

### Phase 4 — Évaluer puis spécialiser les IA

Comparer Sol, Gemini et Muse sur les premiers cas historiques. Attribuer les rôles selon les résultats. Mettre en forme uniquement les procédures qui ont déjà fonctionné. Sortie : une nouvelle conversation peut reprendre un lot sans explication orale de toute l'histoire.

### Phase 5 — Développer par tranches jouables

Intégrer les voix et systèmes dans l'ordre prévu par le CDC et les décisions d'Anthony. À chaque tranche : fonctionnalité, sauvegarde, comportement visible et contrôles. Ne pas ouvrir tous les futurs modes en parallèle. Sortie : amélioration perceptible du jeu, pas seulement augmentation du nombre de fichiers.

### Phase 6 — Vérifier la durée et préparer la diffusion

Saisons longues, restauration, coût du rendu, répétition des contenus et sessions de trois heures. Préparer un paquet offline et une procédure de retour à une version stable compatibles avec les engagements de sauvegarde. Les choix de boutique, de support navigateur et de politique d'anciennes sauvegardes sont fixés explicitement avant publication.

### Rythme sur les mois

- Chaque lot : une intention, un auteur responsable, une preuve, une revue proportionnée et un rapport.
- Chaque semaine de travail : une courte revue de ce qui a réellement amélioré le jeu et de ce qui a coûté des reprises.
- Chaque mois : tester une restauration, relire les questions et décisions périmées, examiner les défauts échappés et réévaluer seulement les modèles qui le nécessitent.
- Après un défaut important : ajouter sa reproduction puis choisir la meilleure prévention ; supprimer ou simplifier les règles devenues inutiles.

## 13. Les arbitrages que ce plan ne décide pas à ta place

- Historique durable des faits contre limite des dix faits actifs : quelle mémoire doit encore permettre de rappeler un grief des années plus tard ?
- Distinction exacte entre avis médical que le joueur peut ignorer et suspension réglementaire non contournable : le CDC semble distinguer ces cas, mais le contrat technique doit le rendre explicite.
- Conditions réelles où une soirée « bonne » abîme quelqu'un, et ce qui compte comme stratégie dominante indésirable. Les vérifier en partie, sans transformer le brouillard humain en bruit aléatoire arbitraire.
- Navigateurs, matériel de référence, forme de distribution et versions de sauvegarde soutenues dans la durée.
- Conditions d'utilisation des niveaux gratuits pour les textes inédits et modèles effectivement accessibles par abonnement.

Ces questions n'empêchent pas l'harmonisation des règles, l'évaluation des assistants ou la préparation des contrôles indépendants.

## 14. Mise à l'épreuve de la méthode

**Risque : fabriquer une bureaucratie.** Commencer par les documents existants et un seul lot. Retirer tout document ou agent qui n'évite pas une erreur ou une reprise réelle.

**Risque : tous les modèles approuvent une mauvaise idée.** Leur demander des contre-exemples, séparer la revue du récit du rédacteur, préserver les critères du CDC et faire jouer Anthony puis des personnes extérieures quand c'est possible. Des joueurs humains ne sont pas des codéveloppeurs supplémentaires ; ils apportent une preuve que les IA ne peuvent pas produire.

**Risque : tests satisfaits, jeu médiocre.** Garder le test des trois heures, observer compréhension, fatigue des décisions et souvenirs précis. Les métriques internes ne remplacent pas ce retour.

**Risque : agent qui arrange les preuves.** Conserver la base, les logs et les attentes ; examiner tout changement des tests ou des seuils en même temps que le code. Tester l'efficacité de quelques contrôles par défauts volontaires.

**Risque : documentation qui se périme.** Générer les inventaires mécaniques, associer une date aux observations, relier chaque décision à son sujet et à ce qu'elle remplace.

**Risque : coût et orchestration excessifs.** Un rédacteur, une revue si utile, modèles évalués et plafond explicite pour tout usage API. Gratuité temporaire et nouvelles annonces ne dictent pas l'architecture.

**Risque : dépendance à une conversation ou à une marque.** Faire reprendre un lot par un autre assistant avec le seul dépôt et son dossier. S'il manque une information essentielle, l'inscrire à sa source ; ne pas agrandir indéfiniment le prompt.

**Risque : refonte architecturale sans bénéfice joueur.** Exiger un défaut précis, une frontière à améliorer et une preuve de conservation. Les systèmes hors périmètre restent fermés.

**Risque : boucle de perfection sans fin.** Fixer l'acceptation avant l'implémentation et changer de méthode lorsqu'une tentative n'apporte plus de preuve. Le système doit savoir dire ce qui est terminé et ce qui attend une décision, sans masquer l'un par l'autre.

## 15. Comment tu formules tes prochaines demandes

Tu n'as pas à répéter « sois parfait ». Pour chaque changement, donne d'abord la situation du joueur, l'effet recherché et ce que tu refuses. L'agent doit ensuite faire le travail de mise en forme.

Exemple de consigne opérationnelle, sans nouveau choix de jeu :

> Prépare le prochain lot de Cage Legacy à partir des décisions déjà validées. Identifie la branche et les modifications en cours, lis les autorités nécessaires, retrouve les comportements existants et les contrôles utiles. Présente les contradictions qui changent le résultat. Écris le contrat du lot avec parcours jouable, limites, sauvegardes et preuves d'acceptation. N'invente aucun contenu d'auteur. Une fois le périmètre établi, réalise et vérifie les parties autorisées, puis livre le résultat et son dossier de reprise.

Le système proposé doit te laisser consacrer ton attention à la vision, aux voix et à la partie jouée. Il donne aux IA assez d'autonomie pour produire, et assez de contraintes vérifiables pour que leurs erreurs ne deviennent pas discrètement les règles de Cage Legacy.
