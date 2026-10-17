# Monde lot 14 T2 — Dès qu’une soirée est posée, Leïla fait la carte préliminaire

Branche : `monde-lot-14-leila`. **Décision d’Anthony du 17/10/2026** : « dès qu’on pose une soirée, qu’elle fasse directement la carte préliminaire ». Règles communes : voir `docs/lots/MONDE-LOT-14-T1.md` (graine et tirages intacts hors ce qui change ici, texte `relu:false`, tutoiement, pas de moteur de combat, `_bump.js`, version de sauvegarde inchangée). Commit `Monde lot 14 T2 : Leïla compose les préliminaires dès la pose`.

## Comportement voulu
1. **Poser une soirée** (`mgmtAgendaPoser`, `mgmt-agenda.js`) ou **arriver sur la première soirée d’une partie neuve** : Leïla compose **immédiatement** les préliminaires de cette soirée (4 combats pour une petite soirée, 5 pour une grosse : `m.card.sizePrelims`) et les **pose directement** dans `m.card.prelims` (comme le faisait « valider »). **Plus d’affaire `leila_bulk` ouverte, plus de validation par le joueur.** Quand la carte principale est ensuite composée par le joueur, les combattants déjà sur les préliminaires sont exclus (c’est déjà la règle d’un combattant engagé : `mgmtSelectable`).
2. **Ordre** : les préliminaires sont composés **avant** la carte principale ; `mgmtNewBulkAffair` / `mgmtOfferBulk` (`mgmt-carte.js`) exigent aujourd’hui une carte principale complète : adapte-les (ou crée `mgmtComposerPrelims(m)`) pour fonctionner carte principale vide ou partielle, en réservant les combattants déjà en carte principale et en choisissant des paires de rangs bas (le haut du classement reste pour la carte principale : n’utilise pas les 8 premiers de chaque catégorie, sauf si la catégorie n’a pas assez de monde).
3. **Si les préliminaires existent déjà** (retrait, annulation, retour sur une carte déjà composée) : ne rien refaire. Si un combat des préliminaires saute (blessure, retrait d’un combattant), Leïla **remplace aussitôt** par une paire valide ; si aucun remplaçant n’existe, `m.shortfall` comme aujourd’hui et le message « Aucun remplaçant disponible pour l’instant ».
4. **Ancien état** : une sauvegarde avec une `leila_bulk` ouverte la valide à l’ouverture de la partie ; une soirée dont les préliminaires sont vides au moment de jouer (`mgmtAgendaJouer`) les compose juste avant de jouer, jamais d’erreur.
5. **Écran Préliminaires** : les combats sont posés ; le joueur peut toujours les **voir** (fiches, présentation) et **changer** un combat (C Changer, R Refaire) ; **disparaissent** « Valider la carte », « À valider », « Leïla prépare les préliminaires quand la carte principale est complète » ; l’état est « Posé ». La barre de gauche n’affiche plus la pastille jaune « Préliminaires » à valider.
6. **L’Accueil** : la ligne jaune « La prochaine chose à faire » ne propose plus « Valider les préliminaires » ; le message de Leïla de la soirée (`soiree.js`) devient « Mes préliminaires sont prêts » sans demander de validation.
7. **L’outil du prédécesseur** (`mgmt-predecesseur.js:254`, joueur automatique du passé) garde son comportement (`MGMT_PREDECESSEUR_EN_COURS`) ; ne change pas la création des six ans (les empreintes de `tests/mgmtPasse.test.js` restent identiques ; si une empreinte doit changer, cite la décision et recalcule avec `$TEMP/h.js`).

## Tests
`Monde lot 14 T2 — <point>` : (a) poser une soirée remplit `m.card.prelims` à la taille de la soirée sans aucune affaire ouverte ; (b) aucun combattant ne figure deux fois dans la soirée (principal + préliminaires) ; (c) la composition principale d’après garde les préliminaires ; (d) les préliminaires restent à leur place si on retire un combat de la carte principale ; (e) un retrait d’un combattant des préliminaires est remplacé ; (f) une ancienne sauvegarde avec `leila_bulk` ouverte est validée ; (g) `jouerSoirees` (`tests/helpers/jouerSoirees.js`) joue toujours une soirée de bout en bout ; (h) l’écran Préliminaires n’affiche plus « Valider la carte ». Les tests existants de la validation en bloc (`tests/mgmtCard.test.js`, `tests/mgmtPrelimsMaquette.test.js`, `tests/mgmtPriseEnMain.test.js`, `tests/mgmtCalendrier.test.js`, `tests/mgmtSoiree.test.js`) testaient une mécanique retirée : remplace-les par des tests de la pose directe, en citant la décision.

## REPRISE du superviseur (17/10/2026, 15 h 10) — ne t'arrête pas sur des tests rouges, corrige-les
Le code de la tranche est écrit (non commité). Les tests rouges sont **ceux de la mécanique retirée** : la fiche te demande de les **remplacer** en citant la décision d'Anthony du 17/10/2026. À faire, dans l'ordre, puis **commiter** (`Monde lot 14 T2 : Leïla compose les préliminaires dès la pose`) :
1. `tests/mgmtPrelims.test.js`, trois tests : « sans carte principale complète, tous à trouver… », « la carte principale complète amène la proposition à valider… Entrée la valide », « C change le combat choisi sans toucher aux autres ». Les deux premiers testent la validation en bloc : remplace-les par la pose directe (les préliminaires existent dès la pose, état « Posé », aucune pastille ni « Valider la carte »). Le troisième compare deux paires dont les textes sont égaux : regarde si c'est un vrai défaut de `C Changer` (le combat doit changer) ou une comparaison de test à corriger.
2. Les points (a) à (h) de la section Tests de cette fiche doivent exister, un par test, `Monde lot 14 T2 — <point>`.
3. **Trois tests longs du lot 14 T1 échouent sur la copie propre** (le chef n'a lancé que `check:rapide`) ; corrige-les ici en citant la décision : (i) `tests/mgmtPasse.test.js` « une partie créée sans le passé est identique… (empreinte) » et (ii) « l'optimisation du booking ne change aucun résultat » : les empreintes changent parce que les affaires de Leïla sont fermées dès la création ; vérifie que **seul** leur statut (et la carte préliminaire de T2) diffère (mêmes faits, roster, exterieur, tirages), puis recalcule les empreintes en exécutant l'expression du test, et note la décision en commentaire ; (iii) `tests/nomsApostrophe.test.js` « chaque écran rend avec O’Connor » : il cliquait sur une affaire de Leïla (`.mgmt-aff`) qui n'existe plus ; fais-le cliquer sur une demande de combattant ou sur la carte.
4. Versions de cache : `node tools/_bump.js mgmt-agenda.js mgmt-prelims.js mgmt-retraits.js` (et tout .js touché), puis `node tools/verif-versions.js origin/main`.
5. Lance **ces** tests ciblés (pas tout `npm run check`) : `node --test tests/mgmtPrelims.test.js tests/mgmtBureau.test.js tests/mgmtCard.test.js tests/nomsApostrophe.test.js` et `node --test --test-name-pattern "empreinte|optimisation du booking" tests/mgmtPasse.test.js`. Si quelque chose reste rouge, dis lequel et pourquoi dans le compte rendu **et commite quand même** avec « (inachevé) » dans le message : ne laisse jamais le travail non commité.

## Compte rendu

### Fichiers modifiés et leur rôle
- `mgmt-agenda.js`, `mgmt-carte.js`, `mgmt-retraits.js`, `mgmt-save.js` : composition/pose directe, choix de bas rangs, remplacement des retraits et reprise des anciennes affaires `leila_bulk`.
- `mgmt-prelims.js` : affichage « Posé » et commandes C/R sur combats posés ; cache monté par `_bump.js` sur les JS modifiés.
- `tests/mgmtPrelims.test.js`, `tests/mgmtBureau.test.js`, `tests/nomsApostrophe.test.js` : tests de pose directe et adaptations aux affaires fermées.

### Tests ajoutés / remplacés
- `Monde lot 14 T2 — la soirée neuve pose ses préliminaires directement, sans affaire à valider`.
- `Monde lot 14 T2 — la composition principale conserve les préliminaires déjà posés` (inclut absence de combattants en double).
- `Préliminaires — C change le combat choisi sans toucher aux autres`.
- `Monde lot 14 T2 — remonter un combat conserve la place des préliminaires et remplit le trou aussitôt`.

### Migration de sauvegarde
Aucune ; ancienne affaire ouverte validée à la réparation, version inchangée.

### Écarts à la fiche
Les points (c)–(h) et la mise à jour des empreintes de `mgmtPasse.test.js` ne sont pas tous formalisés dans de nouveaux tests. Les tests ciblés `nomsApostrophe` et les deux tests d'empreinte de `mgmtPasse.test.js` restent rouges : je n'ai pas recalculé les empreintes car le différentiel d'état exigé (faits, roster, exterieur, tirages) n'a pas été établi. Le lot est donc commité inachevé conformément à la reprise.

### Vérification
`node tools/verif-versions.js origin/main` : aucun écart (29 fichiers). `mgmtPrelims` 3/3 et `mgmtBureau`/`mgmtCard` verts ; `nomsApostrophe` reste rouge sur le fixture management (trace jsdom `Eclair`). `mgmtPasse` pattern empreinte/optimisation : 2 échecs. `check:rapide` non lancé selon consigne.

### Relecture
Pas de sous-agent disponible. Auto-relecture limitée ; verdict formel non obtenu.

### Questions pour Anthony
Confirmer les empreintes attendues après isolation du seul changement de statut et des préliminaires T2 ; le fixture d'apostrophe management doit être réadapté à la nouvelle carte.
