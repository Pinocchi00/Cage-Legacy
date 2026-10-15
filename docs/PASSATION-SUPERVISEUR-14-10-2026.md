# Passation du poste de superviseur — Cage Legacy, brief « Un monde qui a vécu »

Écrit le 14/10/2026 à 19 h 30 par Claude (superviseur sortant) pour Codex (superviseur entrant).
Les chiffres sont des observations datées : **revérifie l'état réel avec `git` avant d'agir** (les commandes sont plus bas).

## 0. En une page

- **Le projet** : Cage Legacy, jeu de MMA en vanilla JavaScript (`index.html`, aucun build, aucun backend). Le mode « management » : le joueur est matchmaker d'une organisation (Split). Dépôt GitHub `Pinocchi00/Cage-Legacy`.
- **Le brief** : « Un monde qui a vécu », 9 lots, copie dans `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`. Le jeu doit commencer par six ans de passé simulés, un prédécesseur, des présentations de combattants, une carte déjà commencée, des raisons pour chaque combat proposé par Leïla (l'adjointe), un Accueil, des marques « depuis ta dernière visite », et à terme huit organisations qui vivent.
- **L'utilisateur** : Anthony, francophone, auteur, **non développeur**. Réponds-lui en français simple, avec des estimations d'heures. Il décide du contenu d'auteur et du design visible ; **le technique est à toi** (ne le lui demande jamais). Il veut aller vite et en bon état.
- **Où on en est** : `main` contient les lots 1, 2, 3, 5, 7, 8 (T1, T2, T4a, T4b, T6) et 9 T1. Restent pour la démo : lot 6 (T4, T5, bilan), lot 10 (T2, T3, bilan), lot 4 (6 tranches). Puis, après le festival : lot 9 T2 à T11, lot 8 T4c/T5/T7/T8.
- **La démo (Split seul)** = lots 1 à 7 + trois premières tranches du lot 8 (brief, §« Ce qu'il faut pour la démo »). Plus la passe design des trois écrans (lot 10) que l'utilisateur a demandée.

## 1. Le dépôt et les dossiers de travail (worktrees)

Racine : `C:\Users\antho\Documents\`. Chaque piste a son dossier git (`git worktree`), sa branche, son `node_modules`.

| Dossier | Branche | État au 14/10 19 h 30 |
|---|---|---|
| `cage-legacy-docs` | `main` (3139108 « Monde lot 8 T4a et T4b… (#170) ») | Référence. **Les PR fusionnent ici** (voir §6). Serveur d'aperçu : configuration `cage-legacy-docs`, port 8768 |
| `cage-legacy-suivi` | `monde-lot-6-raisons` | Lot 6 : T1, T2, T3 faites et commitées (T3 : `77d2c36` + reprise `0f205c3`), `check:rapide` **vert** (995 tests) sur T3. **Reste T4, T5, bilan, fusion.** Aucune fiche T4 ni T5 n'est écrite. Arbre propre, rien d'inachevé |
| `cage-legacy-arene` | `monde-lot-10-ecrans` | Lot 10 : T1 faite (`195f9c1`) ; fiches T1 et T2 écrites (T2 prête, **aucun code de T2 écrit**). Reste T2 (arrivée), T3 (Résultats : fiche à écrire), bilan. Arbre propre. Contient des commits d'outillage local (`.opencode/`, `opencode.json`) **à retirer avant la PR** (§6) |
| `cage-legacy-corps` | `monde-lot-9-vitesse` | Fusionnée (PR 169). Libre. Contient un `git stash` « relecteur lot 9 : modifications non vérifiées » (ignorable) |
| `cage-legacy-fetes` | `monde-lot-8-suite` | Fusionnée (PR 170). Libre |
| `Default Project`, `cage-check` | anciennes branches | **N'y touche pas** pour le jeu (copie ancienne) |

**À la passation (14/10 19 h 45), plus aucun processus OpenCode ni aucun contrôle ne tourne**, et les arbres de travail sont propres (hors le bruit de fins de ligne de `mgmt-retraits-data.js` et `mgmt-voix-data.js`). Tu pars donc d'un état stable ; si tu relances des chefs OpenCode, n'en lance qu'un par dossier.

Pour repartir d'un dossier libre : `git fetch origin && git switch -c <nouvelle-branche> origin/main`.
Un `.codex/worktrees/combat-coherence` existe : c'est un travail de Codex déjà fusionné (c162852).

## 2. Règles non négociables (AGENTS.md et CLAUDE.md priment)

- Vanilla JS, `"use strict";` en tête de chaque fichier, **jamais `import`/`export`**, scripts classiques à portée globale. `index.html` est la seule source de l'ordre de chargement.
- **Aucun `Math.random()` dans la simulation** : RNG à graine (`setSeed`/`rnd`, flux `mgmtIdentiteStream`).
- `esc()` sur toute donnée injectée en HTML. **Aucun texte sous 22 px.** Rien ne déborde ni ne se superpose à 1280, 1440, 1920 px (cadre 1920×1080 mis à l'échelle comme dans le jeu, `mfAjuste`).
- **Additif par défaut**, ne jamais créer un système parallèle à un système existant. Toute évolution de format de sauvegarde passe par `mgmtMigrate` + `validateMgmt` ; `MGMT_SAVE_VERSION` est **18** sur `main`.
- **Un test n'est jamais assoupli sans citer la décision qui change le comportement attendu.** Un bug corrigé = un test.
- **La liste des tests est écrite à la main dans `package.json`** (scripts `test` ET `test:watch`) : un nouveau fichier de test doit y être ajouté ou il ne tourne jamais.
- Chaque `.js` modifié monte son `?v=` dans `index.html` (`node tools/_bump.js <fichier…>`, qui monte aussi `SW_VERSION` de `sw.js`), contrôlé par `node tools/verif-versions.js origin/main` (**à lancer après le commit de fusion**, pas avant).
- **Contenu d'auteur** : les textes écrits par l'IA sont marqués `relu:false` et listés pour l'utilisateur. Ne jamais inventer un texte de personnage ou de voix pour une organisation que l'utilisateur n'a pas fournie (les textes de Split viennent uniquement de ce qu'il a fourni). Jamais de « garde à vue » ni de « jeûne » (refusés par l'utilisateur).
- **Données** : aucun modèle d'IA marqué « entraînement : utilisé » n'a accès au dépôt (règle AGENTS.md).
- Numérotation continue des soirées : la première soirée du joueur est « Fight Night 63 ».
- Taille de la partie au premier jour ≤ **420 Ko** (mesuré 389 Ko). Création complète ≤ 180 s, semaine de jeu ≤ 5 s (mesuré : Split 78,8 s, semaine 1,6 s).

## 3. Ce qui est fait (dans `main`)

| Lot | Contenu | PR |
|---|---|---|
| 1 | Six ans de passé, archive légère, prédécesseur, passage de témoin | 161 |
| 2 | Huit organisations, identités, pays, noms, écran Nouvelle partie ; **T3 : la main du prédécesseur (quatre réglages par organisation)** | 162, 168 |
| 3 | Présentations du combattant et du combat (faits publics par rareté, 26 textes `relu:false`), entrées depuis Carte/Préliminaires/Soirée/Presse/Accueil | 166 |
| 5 | Carte héritée : le prédécesseur s'arrête en plein travail, promesses, « vient d'avant », annulation d'un combat hérité | 167 |
| 7 | Accueil | 164 |
| 8 | T1 marque, T2 « depuis ta dernière visite », T6 budget ; **T4a** (cinq événements de coût petit) ; **T4b** (retraite annoncée, dépassement, challenger, ancien combat) | 163, 170 |
| 9 | **T1 la vitesse** (création mesurée, booking des prédécesseurs direct, outil `tools/mesure-management.js --creation --semaine`) | 169 |

## 4. Ce qui reste, dans l'ordre

### A. Pour la démo

1. **Lot 6 — Les raisons de Leïla** (`cage-legacy-suivi`). Déjà : T1 quinze familles de raisons (`mgmt-raisons.js`), T2 la raison d'abord dans la sélection (`mgmt-carte.js`), T3 la raison enregistrée sur chaque combat. **À faire : T4 (affichage des raisons), T5 (phrases), bilan, fusion.**
   - **Renumérotation obligatoire à la fusion** : la branche a `MGMT_SAVE_VERSION=17` avec une migration 16→17 (« raison enregistrée ») ; `main` est à 18 (le lot 5 a pris 17 et 18). La migration du lot 6 doit devenir **18→19**, `MGMT_SAVE_VERSION=19`, et les tests qui attendent `17` (`mgmtMarque`, `mgmtEffectifs`, `mgmtEmplacements`, `mgmtNiveau`, `mgmtHumanite`…) passent à 19, avec la décision citée.
   - Réserves connues : compromis de variété des raisons (« maximale mais jamais bloquante »), limite « une catégorie peut avoir un seul règne passé ». Textes `relu:false` à lister.
2. **Lot 10 — La refonte de trois écrans** (`cage-legacy-arene`). Les planches validées par l'utilisateur (« validé », 14/10) sont dans `maquettes/monde/refonte/` (`LISEZ-MOI.md` = contrat de chaque écran : états, zones, « ce que le code devra lire »). Décisions : `docs/lots/MONDE-LOT-10-DECISIONS.md`.
   - T1 chargement des six ans : **faite**. T2 « Votre arrivée » (`scr_mgmt_arrivee`, `mgmt-prise-en-main.js`) : fiche prête, code à écrire. T3 Résultats (`scr_mgmt_resultats`, `mgmt-suivi-cadre.js`) : fiche à écrire puis code. Bilan.
   - Le codeur OpenCode s'est arrêté deux fois sur T2 par littéralisme (la fiche lui interdit d'appeler des sous-agents, sa méthode lui en prescrit) : la section « PRÉCISION » de `MONDE-LOT-10-T2.md` tranche. Si tu codes toi-même, ignore ce point.
   - Décisions déjà prises (ne pas rouvrir) : compteur « Retraites » remplacé par « Blessures » (le passé de six ans ne produit aucune retraite : à signaler à l'utilisateur) ; l'arrivée porte l'héritage et l'Accueil retire son bloc « héritage » ; la ligne « Sa fille » est retirée ; mois en minuscules ; « au plus tard : {Organisation} Fight Night 63 » au lieu de « cycle 63 ».
   - Après chaque écran : **comparaison visuelle avec la planche** aux trois largeurs, sur une partie avec passé (le chargement de six ans se gèle quand le panneau du navigateur est caché : utiliser une fenêtre visible).
3. **Lot 4 — Les dossiers de Leïla** (6 tranches, brief §Lot 4). Dépend des lots 3 (fait) et 6. **Les planches existent déjà** (`maquettes/monde/MondeDossiersCombattant.html`, `MondeDossiersAdversaire.html`, validées le 10/10) : la T3 du brief est donc faite, il reste le code. T1 pile de combattants (fonction pure, 4 à 6, une raison chacun, jamais deux de la même famille), T2 pile d'adversaires (remplace la touche D), T4 écran (mode de l'écran Carte, ← → Entrée Échap F + touche liste), T5 souris, T6 cartes suivantes. **Le défaut de fond** (le meilleur choix reste-t-il évident ?) se vérifie en jouant après ce lot.
4. **Finition démo** : relecture par l'utilisateur de tous les textes `relu:false` (lot 3 : 26 ; lots 5, 6, 8, 10 à lister par `grep -rn "relu:false"`) ; retouches Accueil (défilement, captures 1366×768) ; nettoyage de l'ancien écran « La semaine » ; contrôle visuel final 1280/1440/1920 ; mesure de la création sur la seconde machine (commande : `node tools/mesure-management.js --creation --semaine --graine 20261008 --json`).

### B. Après le festival

- **Lot 9 T2 à T11** : huit organisations qui vivent (T2), quatre niveaux (T3), classement des organisations (T4, ferme QO-11), classement mondial des combattants (T5), staff (T6), qualités (T7), fiche de staff (T8, **planche à valider**), engager/garder/perdre (T9), carrière du joueur (T10), écran de l'organisation (T11, **planche à valider**). Brief §Lot 9.
- **Lot 8 reporté** : T4c (N2 changement de catégorie : système neuf, fiche `docs/lots/MONDE-LOT-8-T4c.md`, cinq questions de conception), T5a/b/c (suites des scénarios : la fiche T5a porte un `STOP` et des questions de contenu), T7 (les six ans lisibles sur la fiche : **c'est ce qui rendra utiles les faits d'événement que la clôture du passé écarte aujourd'hui**, `MGMT_PASSE_FAITS_PERDUS` dans `mgmt-passe.js`), T8 (textes).
- Les scénarios 12 et 13 dépendent de N2.

## 5. Protocole d'une tranche (ce qui a fonctionné)

1. **Fiche** `docs/lots/MONDE-LOT-<N>-T<K>.md` : branche, objectif, ce qui existe (fichiers et fonctions), ce qui change, sauvegarde, textes, écran, tests (intitulés exacts), vérification, hors périmètre, pièges. Tu tranches toi-même toute question technique et tu l'écris dans une section `## DÉCISION` ; `STOP` en tête de fiche seulement pour du contenu d'auteur ou une décision de design visible.
2. **Code** par l'agent codeur (OpenCode) ou directement par toi.
3. **Vérification** : tests ciblés (`node --test tests/<fichier>`), `node tools/verif-versions.js origin/main`, `npm run check:rapide` (≈ 5 min).
4. **Relecture** du diff contre la fiche ; vérifier qu'aucun test n'a été assoupli.
5. **Commit** `Monde lot <N> T<K> : <sujet>` ; jamais `inachevé` sauf impossibilité réelle (et le dire).
6. **Fusion d'un lot** : voir §6.

## 6. Protocole de fusion et de PR (le plus piégeux)

Depuis le dossier du lot :

1. `git checkout origin/main -- .opencode opencode.json` puis commit « Retire l'outillage local de la branche » (les modèles d'agents de session ne vont pas dans `main`).
2. `git fetch origin && git merge origin/main`.
3. Résoudre les conflits récurrents :
   - **`package.json`** : union des listes `test` et `test:watch` (ordre de `main`, puis les fichiers propres à la branche).
   - **`index.html`** : prendre la version de `main` sur les blocs en conflit, **puis** `node tools/_bump.js` pour chaque `.js` que la branche a modifié (`verif-versions` indique lesquels).
   - **`sw.js`** : `SW_VERSION` = max des deux + 1.
   - **`tools/check-rapide.js`** (liste `LENTS`) : garder `main`.
   - **`mgmt-save.js` / `mgmt-bureau.js`** : renuméroter `MGMT_SAVE_VERSION` et la chaîne `mgmtMigrate` (lot 6 → 19).
   - Tests d'empreintes (`tests/mgmtPasse.test.js`) : si de nouveaux faits sont écrits, recalculer les empreintes **en citant la décision** (précédents : lot 2 T2, lot 8 T4a/T4b).
   - Tests qui comptent `m.facts.length` : compter hors des genres nouveaux (précédent : faits `challenger`).
4. Commit de fusion, puis `node tools/verif-versions.js origin/main` (doit dire « aucun écart » ; sinon `_bump` puis recommit).
5. `npm run check` **complet** (≈ 8 à 10 min), qui doit être vert.
6. `git push origin <branche>`, puis `bash docs/passation/pr.sh <branche> "<titre>" "<corps>"` : crée la PR **et** la fusionne en squash (`gh` est absent sur cette machine). Le script lit le jeton par `git credential fill` et met ensuite `main` à jour dans `cage-legacy-docs` ; adapte ce chemin si besoin.

## 7. Pièges appris

- **Ne jamais arrêter un processus `node` par un motif de nom de fichier de test** : la ligne de commande d'un `node --test` contient la liste complète des tests et tuerait aussi le contrôle d'une autre piste. Arrête par numéro de processus.
- **Pas plus de deux contrôles complets en parallèle** : sous charge, des tests de durée échouent (« six ans en trois minutes » : 217 s en charge, 50 s seul ; « l'écran rend vite »). Relance le test seul avant de conclure.
- **Un sous-agent ne peut pas appeler d'autres sous-agents** (« Subagent depth limit reached ») : une fiche ne doit jamais demander `@ecrivain`, `@verif`, `@relecteur`, `@eclaireur` au codeur. Les textes fixes sont copiés du LISEZ-MOI des planches ou écrits par le superviseur, marqués `relu:false`.
- **`STOP` en première ligne d'une fiche arrête la chaîne** ; une section `## DÉCISION` du superviseur la rend exécutable. Retire aussi les puces « **STOP —** … » du corps après les avoir tranchées.
- L'architecte attend la **branche nommée dans le brief** (`monde-lot-2-identites` pour le lot 2…) : une autre branche le fait s'arrêter.
- Les tests créés par un codeur ont souvent un **montage faux** (catégorie qui n'existe pas, écran non ouvert, compteur calculé après l'opération) alors que le code est juste : lis ce que le test fabrique avant de toucher au code.
- Les tests qui relancent une génération réelle doivent appeler `CL.mgmtNouvelleAbandonner()` en fin de test, sinon le processus ne se termine pas.
- `MGMT_PASSE_FAITS_PERDUS` (`mgmt-passe.js`) écarte à la clôture du passé les faits que personne ne lit ; tout nouveau genre de fait écrit pendant les six ans doit y être ajouté tant que la T7 du lot 8 n'existe pas, sinon la taille dépasse 420 Ko.
- Un `mgmtDivisionRanking` appelé en pleine soirée amorce un mémo : appeler `mgmtRangsInvalider(m)` après lecture (cause du test « le rang d'hier se retrouve »).
- Ne jamais lancer `git checkout -- .` ni une commande qui détruit du travail non commité : mets de côté avec `git stash`.
- Les fichiers `mgmt-retraits-data.js` et `mgmt-voix-data.js` apparaissent « modifiés » après les tests (fins de ligne) : c'est du bruit, ne pas les commiter.
- Le navigateur intégré gèle les minuteries quand son panneau est caché : le chargement des six ans ne progresse pas ; juge visuellement avec une fenêtre visible.

## 8. Outillage

- **OpenCode** (`opencode run --agent chef --command enchainer <lot> <tranches…> [bilan]`) pilote les agents définis dans `.opencode/agents/` : `architecte` (fiches), `chef` (enchaîne), `codeur`, `eclaireur`, `ecrivain`, `juge` (bilan, `docs/lots/MONDE-LOT-<N>-RAPPORT.md`), `relecteur`, `verif`. Commandes dans `.opencode/commands/`. Le chef s'arrête au premier problème, ne code jamais, ne peut lancer que git et ls. **Tu peux aussi coder directement sans OpenCode** : le protocole ci-dessus vaut dans les deux cas.
- Modèles : tous les agents sur `openai/gpt-6-luna` (abonnement ChatGPT Plus de l'utilisateur, option « améliorer le modèle » désactivée). Les modèles gratuits d'OpenCode (`cat-jam-free`, `space-bunny-free`) se sont montrés lents ou indisponibles : ne pas compter dessus. Limite d'usage : « The usage limit has been reached » (fenêtre de 5 h glissante).
- Scripts de supervision de la session (copies dans `docs/passation/`) : `supervise2.sh <dossier> <journal> <lot> <tranches…>` relance le chef s'il reste muet 30 min ; `veille.sh` émet commit, relance et état.
- Validation : `npm run lint`, `npm test`, `npm run check` (lint + lint:content + test), `npm run check:rapide` (sans les fichiers de `LENTS`).

## 9. Décisions de l'utilisateur à ne pas rouvrir

- Événements du lot 8 : tous acceptés **sauf** « la garde à vue » et « le jeûne ». Défilé à minuterie et carte glissante retirés ; « La semaine » remplacée par l'Accueil. Une demande sans réponse expire, mais le jeu le dit.
- Pronostics : voix nommées plus un pourcentage borné, jamais de statistique du joueur ni de niveau explicite.
- On peut annuler un combat signé par le prédécesseur, avec une contrariété explicite pour les deux combattants.
- Leïla peut sortir en dossier un combattant du cercle ou des suivis, jamais dans ses préliminaires.
- Les combats des six ans ne se revoient pas en images (on les lit) ; seuls les combats joués sous le joueur se revoient.
- Création : l'utilisateur accepte d'attendre, avec une barre qui montre la lecture, jamais de démarrage automatique (bouton « Entrer dans … »).
- La démo est limitée à Split ; la passe design des trois écrans a été validée le 14/10.

## 10. Questions qui attendent l'utilisateur (contenu ou design)

1. Relire les textes `relu:false` (lots 3, 5, 6, 8, 10) avant diffusion.
2. **Aucune retraite pendant les six ans** (le plus âgé a 36 ans, retraite à 39–42 ans) : veut-il que le passé en produise ?
3. Lot 9 : planches à valider avant code (fiche de staff, écran de l'organisation, classement des organisations, classement mondial).
4. Lot 8 T4c/T5 : décisions de conception (changement de catégorie ; suites de scénarios) quand on les reprendra.
5. Seconde machine de mesure (qui exécute la commande ?).

## 11. Message de démarrage à donner à Codex

> Tu reprends le poste de superviseur du brief « Un monde qui a vécu » du dépôt `Pinocchi00/Cage-Legacy`. Lis d'abord `AGENTS.md`, `CLAUDE.md` et `docs/PASSATION-SUPERVISEUR-14-10-2026.md`, puis vérifie l'état réel (`git log -5` dans `cage-legacy-docs`, `cage-legacy-suivi`, `cage-legacy-arene`). Ordre : finir le lot 6 (T4, T5, bilan, fusion avec renumérotation en 19), finir le lot 10 (T2, T3, bilan, comparaison visuelle aux planches de `maquettes/monde/refonte/`), puis le lot 4, puis la finition démo. Tu décides seul de tout le technique ; tu ne demandes à l'utilisateur que le contenu d'auteur et le design visible. Réponds-lui en français simple avec des estimations d'heures. Chaque lot fusionné exige `npm run check` vert.
