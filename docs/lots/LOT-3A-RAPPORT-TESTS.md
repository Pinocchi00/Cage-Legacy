# CAGE LEGACY — LOT 3A-TESTS
## Rapport — réécriture des tests de cycle périmés (mgmtBureau.test.js)

**Date :** 15/09/2026
**Périmètre touché :** `tests/mgmtBureau.test.js`, `docs/QUESTIONS-OUVERTES.md` (créé),
`docs/lots/LOT-3A-RAPPORT-TESTS.md` (créé). **Aucun fichier du jeu.**
**Autorités :** `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md` §5 et §11,
`docs/LOT-3A-TESTS-CONTRAT.md` (v2), `docs/ETAT-14-09.md`.

---

## 1. Commit de départ

`b7688308f98ab0866980aac169befe8270978787` (`b768830`, « Mode management lot 2 »),
branche `lot-3a-corps-soiree`, avec les changements du lot 3a non commités dans
l'arbre de travail (état décrit par `docs/ETAT-14-09.md` : 230 tests, 228 verts,
2 rouges aux lignes 680 et 689 de `mgmtBureau.test.js`).

## 2. Étape 0 — recherche du doublon prévu par le contrat

Le §11 du lot 3a prévoit `tests/mgmtSoiree.test.js` avec le test « carte incomplète
quand la pile est vide : le cycle ne se ferme pas, et une nouvelle proposition de
Leïla arrive en tête de pile ».

**Vérifié : ce fichier n'existe pas.** Ni dans `tests/`, ni dans la chaîne `npm test`
de `package.json`. Aucun autre test ne portait la règle 3a-§5 au démarrage (le test
« MGMT nouveau cycle », déjà réécrit avant cette session, en couvrait un fragment :
la reproposition, mais pas le cycle bloqué ni la soirée). **Conclusion : pas de
doublon, les deux tests périmés ont été réécrits ici** ; la couverture complète de la
règle 3a-§5 vit désormais dans `mgmtBureau.test.js` (ancre `MGMT_LOT1G`). Le
`mgmtSoiree.test.js` du lot 3a reste à créer au moment venu — le lot 3a est toujours
en cours côté code.

## 3. Tests réécrits et ajoutés (numéros de ligne du fichier final)

Ancre `MGMT_LOT1G` (lignes 688-695), en-tête mis à jour : la règle du lot 1g est
remplacée par la règle 3A-§5 (décision de référence du contrat).

| # | Test | Lignes | Ce qu'il vérifie (règle 3A-§5) |
|---|---|---|---|
| 1 | `MGMT auto-cycle — pile vidée avec carte complète : la soirée s'ouvre d'abord, le cycle avance après` | 696-714 | Pile vidée + carte complète : écran `mgmt_soiree`, cycle encore 1, `lastEvent` calculé une fois, carte vidée ; après « Continuer » soirée puis lendemain, cycle 2, bureau rouvert, pile fraîche |
| 2 | `MGMT bouton discret — carte incomplète (0/4) : « Cycle suivant » repropose, il n'avance pas` | 716-733 | Carte 0/4 : le déclencheur manuel (discret, sans aplat or) ne ferme pas le cycle — un bloc de Leïla arrive en tête de pile, ouvert et sélectionné d'office |
| 3 | `MGMT cycle suivant — carte complète : le déclencheur manuel fait avancer le cycle` | 735-754 | Le même bouton, carte complète cette fois : la soirée se joue (cycle encore 1), puis le cycle avance |
| 4 | `MGMT sortie de carte incomplète — la reproposition validée complète la carte, le cycle avance normalement` | 756-775 | Depuis 0/4 : « Cycle suivant » → reproposition ; valider ce bloc complète la carte (preuve : `lastEvent` de 4 combats, soirée ouverte d'elle-même) puis le cycle avance normalement |
| 5 | `MGMT absence de blocage — même à court de propositions, le cycle avance toujours` | 802-824 | État `'stuck'` (roster de 2, aucune paire possible même assoupli) : « Cycle suivant » fait avancer le cycle — aucun état ne bloque le joueur |
| C1 | `MGMT bloc non ignorable — carte incomplète : seuls valider, échanger, écraser restent` (contrat §5) | 851-869 | `mgmtIgnore` refuse le bloc tant que la carte est incomplète, l'interface ne propose pas Ignorer ; carte complète : Ignorer redevient disponible |
| C2 | `MGMT aucun remplissage d'office — rien n'entre en carte sans valider ou échanger` (contrat §5) | 871-909 | Drain réel sans valider (écrasements, acceptations, ignores, fermetures, repropositions) : carte revérifiée après chaque action, jamais remplie ; état `'stuck'` : rien d'office |

Six tests marqués **skip** (comportements attendus mais absents du code — voir §6) :
lignes 782, 789, 796 (trois sorties) et 830, 837, 842 (économie du short notice).
Chaque corps de test skipped documente en commentaire ce qu'il devra vérifier ;
là où un texte manquerait : `[EMPLACEMENT AUTEUR]` — en pratique, les répliques
existent déjà dans `docs/LOT-3B-CARTE-INCOMPLETE.md`, seule la mécanique manque.
Aucune réplique n'a été écrite, réécrite ou retouchée.

Aucune assertion existante n'a été assouplie, supprimée ou contournée. Les deux
tests d'origine ont été réécrits sur la règle 3A-§5, jamais sur le comportement
observé ; leurs assertions visuelles toujours vraies (bouton présent, pas d'aplat
or) et la vérification de pile fraîche sont conservées.

## 4. Preuves que les tests mordent — cassures volontaires

Pour chaque preuve : règle cassée dans le code du jeu, test relancé, échec observé,
code d'origine remis. Les deux fichiers (`mgmt-bureau.js`, `mgmt-screens.js`) ont
été sauvegardés avant la première cassure et vérifiés par empreinte SHA-256 après
chaque remise (`mgmt-bureau.js` B9D60D47…C56C3, `mgmt-screens.js` 8C3D3C0F…FCA9 :
identiques à l'octet à l'état d'avant les cassures).

| Preuve | Règle cassée | Cassure (fichier, lieu) | Résultat observé | Assertion qui a mordu |
|---|---|---|---|---|
| 1a | Pile vide + carte complète → la soirée s'ouvre | `mgmt-screens.js`, `CL.mgmtReply` : `if(r==='event')` renommé `'jamais-event'` | ✖ test 1 échoue | « la soirée s'ouvre d'abord » — `mgmt_bureau` au lieu de `mgmt_soiree` (ligne 704) |
| 1b | Après « Continuer » soirée puis lendemain, le cycle vaut 2 | `mgmt-screens.js`, `mgmtSoireeNext`/`mgmtLendemainNext` : appels `mgmtNewPile` retirés | ✖ test 1 échoue | « après la soirée puis le lendemain, le cycle vaut 2 » — `1 !== 2` (ligne 711) |
| 2 | Carte incomplète → le cycle ne se ferme pas, Leïla repropose | `mgmt-bureau.js`, `mgmtClosePile` : `return mgmtRefillBulk(m)?'refill':'stuck'` → `return 'stuck'` | ✖ test 2 échoue | « 'Cycle suivant' ne fait pas avancer le cycle » — `2 !== 1` (ligne 729) |
| 3 | Carte complète → « Cycle suivant » fait avancer le cycle (via la soirée) | `mgmt-bureau.js`, `mgmtCardFull` → `return false` | ✖ test 3 échoue | « carte complète : la soirée se joue » — `mgmt_bureau` au lieu de `mgmt_soiree` (ligne 750) ; les tests 1 et 4 tombent aussi (même règle) |
| 4 | Valider la reproposition complète la carte | `mgmt-bureau.js`, `mgmtDecide` branche `validate` : ligne `m.card.fights=aff.fights.map(…)` retirée | ✖ test 4 échoue | « carte complétée : la soirée s'ouvre d'elle-même » — `mgmt_bureau` au lieu de `mgmt_soiree` (ligne 768) |
| 5 | Aucun état ne bloque l'avancement du cycle (`'stuck'` → fallback `mgmtNewPile`) | `mgmt-screens.js`, `mgmtNextCycle` : `else if(r==='stuck'){ render(); return; }` inséré | ✖ test 5 échoue | « aucun état ne laisse le joueur incapable de faire avancer le cycle » — `0 !== 1` (ligne 823) |
| 6 | Bloc non ignorable tant que la carte est incomplète | `mgmt-bureau.js`, `mgmtIgnore` : garde `if(aff.kind==='leila_bulk'&&!mgmtCardFull(m)) return false` retirée | ✖ test C1 échoue | « ignorer le bloc est refusé tant que la carte est incomplète » — `true !== false` (ligne 859) |
| 7 | Aucun remplissage d'office | `mgmt-bureau.js`, `mgmtRefillBulk` : `m.card.fights=bulk.fights.map(…)` ajouté avant l'unshift (la reproposition remplirait seule) | ✖ test C2 échoue | « rempli d'office à l'action 2 » (détection après chaque action du drain, ligne 878) |

Premier essai de la preuve 7 (remplissage détecté seulement en fin de drain) ne
mordait pas : la soirée de fin de drain vidait la carte et masquait la cassure. Le
test a été resserré (vérification de la carte après chaque action, pas seulement à
la fin) — la cassure a alors mordu à l'action 2. Premier essai de la preuve 1b
(`m.cycle++` retiré de `mgmtNewPile`) mordait au garde-fou d'entrée plutôt que sur
la règle visée ; la cassure a été déplacée dans les « Continuer » pour viser la
règle elle-même.

Après la dernière remise : `git diff --stat` identique à l'état d'avant cassures
pour tous les fichiers du jeu (`index.html` 4, `mgmt-bureau.js` 434, `mgmt-data.js`
12, `mgmt-screens.js` 195, `state/state-save.js` 14, `tests/mgmtCard.test.js` 52,
`ui-08-controller-arena.js` 7 — valeurs relevées avant la première modification de
tests). **Aucun fichier du jeu n'a été laissé modifié.**

## 5. `npm run check`

| Moment | Résultat |
|---|---|
| Avant (état ETAT-14-09) | lint : 0 erreur. Tests : 230 exécutés, 228 pass, **2 fail** (les deux tests lot 1g), 0 skip |
| Après réécriture (avant cassures) | 53 tests du fichier : 47 pass, 0 fail, 6 skip |
| Après (état final, code d'origine remis) | lint : 0 erreur. Tests : **241 exécutés, 235 pass, 0 fail, 6 skip** |

L'« Error: Uncaught [TypeError … 'flag'] » visible dans la sortie des tests de
carrière est préexistant (il figurait déjà dans la sortie de référence du 14/09) et
ne fait échouer aucun test.

## 6. Questions ouvertes inscrites (`docs/QUESTIONS-OUVERTES.md`, créé)

Le design des sorties est arrêté dans `docs/LOT-3B-CARTE-INCOMPLETE.md` (textes
d'auteur complets, lot non démarré côté code) ; ces entrées documentent le manque
**côté code**, plus un reste à trancher sur la pénalité :

- **QO-1** — Remonter un combat des préliminaires : pas de structure
  préliminaires/carte principale (carte plate de 4). Test skip ligne 782.
- **QO-2** — Short notice depuis Split ou une autre organisation : pas de
  mécanisme de recrutement côté bureau. Test skip ligne 789.
- **QO-3** — Combattant libre de contrat : aucun vivier de libres côté management.
  Test skip ligne 796.
- **QO-4** — Signalisation des trois sorties dans l'interface du bureau
  (`mgmtVisibleReplies` n'offre que valider/échanger/écraser + ignorer).
- **QO-5** — Plafond de découvert (plancher fixe / recette de la dernière / moyenne
  des deux dernières) : aucune trésorerie ni recette dans l'état du bureau
  (`mgmtDefault`, `mgmtRunEvent`) ; le plancher fixe n'est pas chiffré. Test skip
  ligne 830.
- **QO-6** — Remboursement du découvert sur la recette suivante avant tout
  bénéfice : aucune comptabilité entre deux soirées. Test skip ligne 837.
- **QO-7** — Soirée en carte réduite avec pénalité : `mgmtRunEvent` refuse toute
  carte incomplète (exception à assumer) ; **reste ouvert** : la nature exacte de la
  pénalité mécanique (LOT-3B décrit la pénalité ressentie par les répliques D1-D4,
  aucun effet n'est chiffré). Test skip ligne 842.

## 7. Observations hors périmètre (rien n'a été touché)

- `AGENTS.md` s'est trouvé modifié dans l'arbre de travail **pendant la session**
  (2 lignes ajoutées après « l'ordre des `<script>`… ») : il n'apparaissait ni dans
  le `git status` ni dans le `git diff --stat` relevés en début de session, et
  aucune commande de ce lot n'écrit ce fichier. Signalé tel quel, non touché.
- Deux documents nouveaux ont paru pendant la session hors de ce lot :
  `docs/LOT-3A-TESTS-CONTRAT.md` et `docs/LOT-3B-CARTE-INCOMPLETE.md`. Le contrat a
  été appliqué (étape 0 ci-dessus, tests C1-C2 ajoutés, preuves 6-7) ; les textes
  d'auteur de LOT-3B ont été utilisés comme référence de design, jamais copiés.
