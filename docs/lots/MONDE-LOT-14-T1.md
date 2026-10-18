# Monde lot 14 T1 — Leïla ne propose plus de choix

Branche : `monde-lot-14-leila`. **Décision d’Anthony du 17/10/2026** : « enlever les choix de Leïla ». Le joueur ne reçoit plus d’affaires à accepter ou refuser (« D’accord, je vous fais confiance » / « Non, désolé »). **Règles communes du lot 14** : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; **la graine et les tirages ne bougent pas** (garde chaque appel `rnd()`/`pick()` à sa place, pour que les parties et les six ans générés restent identiques) ; un test existant n’est réécrit que pour cette décision, citée (`décision d’Anthony du 17/10/2026`) ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide` ; la version de sauvegarde ne change pas ; commit `Monde lot 14 T1 : Leïla ne propose plus de choix`.

## Ce qui disparaît
Les affaires de types `leila_propose`, `leila_react`, `leila_react_swap`, `leila_react_crush` n’arrivent plus jamais devant le joueur : ni sur **l’Accueil** (lignes « affaire »), ni sur **Les affaires** (`mgmt_bureau`, `mgmt-ecran-semaine.js` : colonne de dialogue, boutons de réponse, « Ignorer l’affaire »), ni dans les **pastilles** de la barre.

## Comment (sans toucher aux tirages ni à la sauvegarde)
1. `mgmtNewPile` (`mgmt-bureau.js`) construit la pile **exactement comme avant** (mêmes tirages), puis marque chaque affaire de ces quatre types `status:'closed', decision:'ignored'` **sans écrire de fait** `ignored` (aucun `mgmtAddFact`). Un test vérifie que deux parties de même graine ont la même suite de faits avant et après le lot (hors l’absence de faits `ignored`).
2. `mgmtValidAffair` (`mgmt-save.js`) continue d’accepter ces types : une ancienne sauvegarde se charge. À l’ouverture d’une partie (`mgmtRepair` ou équivalent), toute affaire de ces types encore `open` est fermée de la même façon.
3. **Les dossiers de Leïla** de la Carte (choix d’un combattant puis d’un adversaire parmi six dossiers) **restent** : c’est l’outil de composition du joueur, pas une affaire à trancher.
4. Les textes d’échange (`MGMT_EXCHANGES` : `leila_propose`, réactions) restent dans les données (additif) mais ne sont plus lus à l’écran.
5. **Les affaires de la carte préliminaire (`leila_bulk`) sont traitées par la tranche T2**, ne les touche pas.
6. Les écrans **Accueil** et **Les affaires** : si plus rien n’est à régler, le panneau « Demandes et affaires ouvertes » n’affiche que les demandes de combattants (`mgmtDemandesOuvertes`) ; « Les affaires » devient « Le monde autour de Split » (carte, monde, classement) sans colonne vide.

## Tests
`Monde lot 14 T1 — <point>` : (a) après `mgmtNewPile`, aucune affaire de ces types n’est `open` ; (b) l’Accueil n’affiche aucune ligne d’affaire de Leïla ; (c) « Les affaires » n’affiche ni « D’accord » ni « Non, désolé » ni « Ignorer l’affaire » ; (d) une sauvegarde d’avant ce lot avec une affaire `leila_propose` ouverte se charge et l’affaire est fermée ; (e) mêmes faits, même graine. Corrige les tests existants (`tests/mgmtBureau.test.js`, `tests/mgmtCard.test.js`, `tests/mgmtEconomie.test.js`, `tests/mgmtSoiree.test.js`, etc.) qui répondaient à ces affaires : ils testaient une mécanique retirée ; remplace-les par des tests de la composition directe (`mgmtBookMain`) en citant la décision.

## Compte rendu

### Fichiers modifiés et rôle
- `mgmt-bureau.js` : `mgmtFermeChoixLeila(m)` (ancre `LEILA_CHOIX_RETIRES`) ferme sans fait toute affaire des quatre types `open` ; appelée en fin de `mgmtNewPile` (ancre `LEILA_PILE_FERMEE`) — la pile se construit exactement comme avant (mêmes tirages) — et après chaque création de réaction dans `mgmtDecide` (ancres `LEILA_REFUS_FERME`, `LEILA_CRUSH_FERME`). `m.open` recalé sur la première affaire réellement ouverte (le bloc, sinon `null`).
- `mgmt-carte.js` : idem après la réaction `leila_react_swap` de `mgmtSwapFight` (ancre `LEILA_SWAP_FERME`). Les dossiers de la Carte ne bougent pas.
- `mgmt-save.js` : `mgmtRepair` ferme toute affaire des quatre types encore `open` à l'ouverture d'une partie (ancre `LEILA_ANCIENNE_PILE_FERME`), sans écrire de fait `ignored`. `MGMT_SAVE_VERSION` inchangée (aucun format nouveau ; une sauvegarde d'avant se charge).
- `mgmt-ecran-semaine.js` : `scr_mgmt_bureau` (ancre `LEILA_MONDE_SANS_CHOIX`) sans affaire ouverte : titre « Le monde autour de {org} », colonnes « Échange » et « Affaires » supprimées ; la carte, le monde et le classement restent seuls. Pas de colonne vide.
- `mgmt-cadre.js` : la plaque de `mfAncien` pour `mgmt_bureau` devient « Le monde autour de {org} » quand `mgmtOpenCount===0` (ancre `LEILA_PLAQUE_MONDE`) ; `l'Accueil` filtrait déjà sur `status==='open'`, rien à changer.
- `index.html` : `?v=` remontés sur les cinq fichiers ci-dessus (`node tools/_bump.js`).

### Tests ajoutés (`tests/mgmtBureau.test.js`)
- « Monde lot 14 T1 — après mgmtNewPile, aucune affaire retirée ouverte » (point a)
- « Monde lot 14 T1 — l’Accueil n’affiche aucune ligne d’affaire de Leïla » (point b)
- « Monde lot 14 T1 — Les affaires sans réponses ni colonne vide » (point c)
- « Monde lot 14 T1 — ancienne sauvegarde ouverte chargée et fermée » (point d, sans fait `ignored`)
- « Monde lot 14 T1 — mêmes faits, même graine avant et après » (point e : `mgmtNewPile` re-joué sans le crochet de clôture, `facts`/`roster`/`exterieur`/`rnd()` identiques)

### Tests existants corrigés (décision d'Anthony du 17/10/2026 citée dans chaque fichier)
- `tests/mgmtBureau.test.js` : entrée (« aucun choix de Leïla ouvert »), voix, échanges, accepter (composition directe `mgmtBookMain` — le fait `booked` était propre au chemin `accept`, le compte attendu passe de 13 à 12 faits hors `challenger`), refuser/ignorer (réponse périmée ne crée rien), titres, ouverture (`m.open===null` quand tout est fermé), réparation, hiérarchie, compteur zéro (plus de colonne d'échange vide), paroles (bloc préliminaire uniquement), mémoire, auto-cycle, L1-R1 (décision persistée via la carte), L1-R2.
- `tests/mgmtCard.test.js` : « écraser — réaction » vérifie désormais la réaction fermée `status:'closed'`/`decision:'ignored'` au lieu de l'ouverture.
- `tests/mgmtSoiree.test.js` : « corps » — le titre de la semaine est « Le monde autour de Split ».
- `tests/mgmtEcranLendemain.test.js` : le fallback de sécurité rend la semaine, dont le titre peut être celui du monde.
- `tests/mgmtEconomie.test.js`, `tests/mgmtAttention.test.js`, `tests/mgmtCategoriesFeminines.test.js`, `tests/mgmtCorrectionsLot1.test.js`, `tests/mgmtDefautsDemo.test.js`, `tests/mgmtAccueil.test.js` : verts sans modification (construisent leurs affaires à la main ou ne touchent pas les choix retirés).

### Migration de sauvegarde
Aucune : la version de sauvegarde ne change pas. La fermeture des quatre types se fait en lecture (`mgmtRepair`), sans perte de donnée et sans fait écrit.

### Écarts à la fiche
Aucun point ignoré. Le titre « Le monde autour de {org} » est celui cité par la fiche elle-même (`relu:false`), posé en chaîne dans le code avec commentaire.

### Vérification
`node tools/verif-versions.js origin/main` : aucun écart (22 fichiers examinés). Tests ciblés verts : `mgmtBureau` 74/74, `mgmtCard` 48/48, `mgmtEconomie` 18/18, `mgmtSoiree` 14/14, `mgmtAccueil`+`mgmtEcranLendemain` 16/16, `mgmtAttention`+`mgmtCategoriesFeminines` 15/15, `mgmtCorrectionsLot1`+`mgmtDefautsDemo` 16/16. `check:rapide` non lancé (délai 120 s, règle du superviseur).

### Relecture
Auto-relecture (REPLI SANS SOUS-AGENT) : tirages inchangés (dates/exterieur/reaction testés) ; pas de `Math.random` ; `esc()` sur les deux injections nouvelles ; ancres fines vérifiées ; `leila_bulk` épargné ; dossiers de la Carte intacts.

### Questions pour Anthony
Aucune — la fiche était complète. Le comportement exact de la réponse périmée (`mgmtReply` sur une affaire fermée) reste no-op silencieuse pour robustesse, à confirmer en jeu pour éviter toute surprise à l'ancien clavier 1-3.
