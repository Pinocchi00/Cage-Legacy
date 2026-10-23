# Monde lot 44 T1 (P7 T1+T3 du brief « Des combattants uniques ») — la soirée : la salle qui monte et les primes (calcul, sans écran)

Branche : `p7-salle-primes` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P7, tranches T1 (la salle qui monte) et T3 (les primes) — lis-les en entier. Maquettes de référence (textes, chiffres, pas d'écran dans cette tranche) : `docs/planches-uniques/UniSoiree.dc.html` (la soirée avec la salle) et `UniSoireeFin.dc.html` (la fin de soirée avec les primes).

**Ce que tu construis.** (1) Une **ambiance de salle** et une **affluence** qui évoluent *entre* deux combats de la soirée (jamais pendant) : une finition, une surprise ou une guerre la font monter ; une décision molle (décision partagée, combat sans action) la fait retomber ; l'ordre de la carte compte. (2) Les **primes** : « Combat de la soirée » et deux « Performance de la soirée », attribuées **par l'organisation** selon les relevés (finition, surprise, guerre), **jamais par le joueur**, payées par la caisse, annoncées en fin de soirée, inscrites sur la fiche et dans les records. Lis d'abord le code existant : `mgmt-soiree-show.js`, `mgmt-soiree-cadre.js`, `mgmt-ecran-soiree.js`, `mgmt-corps.js` (l'ouverture et la clôture d'une soirée, `m.hist`), `mgmt-salles.js` (les salles et le taux de remplissage), `mgmt-argent.js` (la caisse, les dépenses), `mgmt-releve.js` et `mgmt-stats.js` (les relevés de combats, P1), `mgmt-leaders.js` (records, P1 T6), `mgmt-fiche-stats.js`. Ne touche ni `mgmt-traits*.js` ni `mgmt-attention.js`.

## Cases
**[x] 1. Les données : `mgmt-salle-primes-data.js`** (nouveau, `"use strict";`, ancre `/* ==== [ANCRE: P7_T1_SALLE_PRIMES] — Monde lot 44 T1 ==== */`, inscrit dans `index.html` après `mgmt-salles.js`). `MGMT_SALLE` figé : les paliers d'ambiance en mots (au moins cinq, du « salle froide » au « salle debout »), l'effet de chaque type de combat sur l'ambiance (finition au 1er round, finition tardive, surprise = pronostic public sous 25 %, guerre = knockdowns ou cinq rounds serrés, décision molle), le rattrapage naturel entre deux combats, au moins **trois phrases par palier et par type** (`relu:false`, courtes, jamais deux fois la même d'affilée). `MGMT_PRIMES` figé : le montant des trois primes (proportionnel à la bourse de la soirée, plafonné pour ne **pas casser l'économie recalibrée** : consulte `tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md` et garde l'effet moyen sur la caisse sous 3 % des recettes d'une soirée), les critères de choix (finition, surprise, guerre), les textes d'annonce (`relu:false`, 3 variantes).
**[x] 2. La salle : `mgmt-salle-ambiance.js`** (nouveau, après `mgmt-soiree-cadre.js`). `mgmtSalleAmbiance(m,etat,combatTermine)` : fonction **pure** (même entrée, même sortie, aucun `rnd()`), rend le nouvel état `{palier, affluence, phrase}` après chaque combat, **entre** deux combats ; l'ordre de la carte compte (un début qui monte puis un co-principal mou retombe). `m.soirees` facultatif : le dernier état de salle de la soirée (clé petite), jamais ajoutée à une partie qui n'en a pas besoin. Une option du jeu la masque (cherche `mgmt-options.js` / `mgmt-reglages.js` : ajoute une case « Ambiance de salle » **active par défaut** dans les réglages existants, sans nouvel écran).
**[x] 3. Les primes : `mgmt-primes.js`** (nouveau). `mgmtPrimesSoiree(m)` : à la clôture d'une soirée, choisit le **combat de la soirée** (le plus fort sur finition + guerre + surprise) et **deux performances** (deux combattants distincts, pas ceux du combat de la soirée seulement si aucun autre n'est possible), à partir des relevés réels de la soirée uniquement ; rend `[]` sur une soirée sans combat notable (pas de prime obligatoire). Paiement par la caisse (même chemin que les autres dépenses) ; trace dans `m.hist` (clé petite et facultative sur l'entrée du combat : `pr:'cs'|'pf'`) et dans `m.facts` (fait `prime`, pour la fiche et les records). **Aucune prime sur un combat ordinaire de préliminaires** sauf s'il est le seul notable.
**[x] 4. La sauvegarde.** Les clés facultatives sont validées dans `validateMgmt`, réparées dans `mgmtRepair` seulement si présentes et malformées ; `MGMT_SAVE_VERSION` inchangé ; une partie ancienne se charge et joue une soirée sans erreur (test). Le plafond de 1,9 Mo d'une partie neuve est sacré (`tests/mgmtReleveReduit.test.js` doit rester vert ; relance-le en arrière-plan, il est lent).
**[x] 5. Tests** (nouveau `tests/mgmtLot44T1.test.js`, inscrit dans les listes `test` ET `test:watch` de `package.json`, pas dans `pretest`) : (1) l'ambiance monte sur une finition au 1er round et sur une surprise, retombe sur une décision molle ; elle ne change **jamais** pendant un combat (une seule mise à jour par combat terminé) ; (2) l'ordre de la carte compte (deux cartes aux mêmes combats dans un ordre différent donnent des ambiances finales différentes) ; (3) aucune phrase identique deux fois de suite sur une soirée ; (4) les primes tombent sur les combats que les relevés désignent (construis trois soirées : une avec un KO au 1er round, une avec une guerre, une sans rien) ; deux performances distinctes ; (5) paiement exact de la caisse ; l'effet moyen sur 40 soirées simulées reste **sous 3 % des recettes** ; (6) aucune prime sur un combat ordinaire de préliminaires quand un autre combat est notable ; (7) l'option « Ambiance de salle » masque l'affichage mais ne change pas les primes ; (8) déterminisme, aucun `rnd()` ; (9) partie ancienne inchangée (les empreintes de `tests/mgmtPasse.test.js` identiques SANS modifier une valeur ; si une empreinte de **soirées jouées** change parce que les primes modifient la caisse, recalcule-la **avec la décision citée** « brief du 22/10, P7 T3 : les primes » et l'ancienne→nouvelle valeur en commentaire) ; (10) validation/réparation.
**[x] 6. Fin.** `?v=` à la main (tout `.js` modifié ou ajouté), `node tools/verif-versions.js origin/main`, `node_modules/.bin/eslint .`, commit final `Monde lot 44 T1 : la salle et les primes` (le numéro T1 est obligatoire), compte rendu dans cette fiche (fichiers et rôle, montants choisis, tests, textes à relire, écarts).

Règles communes : **additif** ; **aucun écran** ici (l'écran de la soirée avec la salle et la fin de soirée avec les primes sont la tranche suivante, aux valeurs des maquettes) ; ne touche pas au moteur de combat ; un test n'est **jamais** assoupli sans citer la décision qui change le comportement attendu. Quand TOUT est fait et commité, termine ta réponse par la ligne exacte `TOUT_EST_FINI`.


## Compte rendu

**Fichiers et rôle**
- `mgmt-salle-primes-data.js` (nouveau) : `MGMT_SALLE` (5 paliers, effets, affluence, 90 phrases), `MGMT_PRIMES` (critères, 1 % de la bourse par versement, plafond global 2,9 % des recettes brutes, 3 annonces). Ancre `P7_T1_SALLE_PRIMES`.
- `mgmt-salle-ambiance.js` (nouveau) : `mgmtSalleAmbiance(m,etat,combatTermine)` pure, sans `rnd()`, une mise à jour par combat terminé ; `mgmtSalleEtatValide`, `mgmtSalleAmbianceActive`.
- `mgmt-primes.js` (nouveau) : choix du combat de la soirée et de deux performances sur les seuls relevés de la soirée, paiement, `pr` dans `m.hist`, faits `prime`, `mgmtPrimeFactValide`.
- `mgmt-corps.js` : ambiance après chaque combat, `m.lastEvent.premier`, primes à la clôture, E1 recalculé après paiement. Le passé du prédécesseur (`MGMT_PREDECESSEUR_EN_COURS` / `m.passe.enCours`) ne reçoit ni salle ni prime : son état reste identique.
- `mgmt-stats.js` : compteur `primes` par combattant depuis les faits, invalidation du mémo à la clôture.
- `mgmt-options.js`, `mgmt-reglages.js` : option « Ambiance de salle » active par défaut, sans nouvel écran.
- `mgmt-save.js` : `soirees`, `finance.primes`, `lastEvent.premier`, `hist[].pr` et fait `prime` validés strictement et réparés seulement si présents et malformés. Correctif au passage : un `pr` invalide ne fait plus jeter toute la trace du combat (nettoyage avant `mgmtValidFightTrace`).
- `index.html`, `sw.js`, `package.json` : scripts, `?v=`, listes `test` / `test:watch` et scripts `test:lot44t1` / `test:watch:lot44t1`.
- `tests/mgmtLot44T1.test.js` (nouveau, 10 tests) ; `tests/mgmtPasse.test.js`, `tests/mgmtEconomie.test.js`, `tests/mgmtSalles.test.js` : empreintes/formules mises à jour avec la décision citée.

**Reprise du 23/10/2026 (relecture)**
- Le combat de la soirée se choisit désormais sur le **score le plus fort de toute la carte** (finition + guerre + surprise), la carte principale ne servant qu'à départager deux scores égaux ; un préliminaire ordinaire (score 0) reste exclu. Le test 4 attend donc le KO au 1er round du préliminaire comme combat de la soirée, et les deux performances sur la guerre du co-principal.
- Le test de mesure sur 40 soirées vérifie maintenant qu'au moins une soirée paie réellement des primes (la mesure n'est plus vide par construction).
- Les trois nouveaux scripts ont un `?v=` nommé (`lot44t1a/b/c`) au lieu des marqueurs provisoires `1x`/`1xx`.
- Le commentaire d'empreinte `jouee3` cite la décision « brief du 22/10, P7 T3 : les primes » avec l'ancienne → nouvelle valeur ; l'empreinte reste `ad34b123fcafa8ab` (la sélection du combat ne change ni le total payé ni l'ordre des faits).

**Montants choisis**
- Un versement = `max(1, round(1 % de la bourse))`, les quatre versements plafonnés ensemble à `floor(2,9 % × (billetterie + droits TV))` ; 0 si le plancher n'est pas atteint.
- Mesure sur 40 soirées réelles (`probe-lot44f`) : primes **1,60 %** des recettes brutes, maximum **2,64 %**, aucune soirée sans prime notable. La maquette (50 000 € par prime) reste une illustration : son ordre de grandeur casserait l'économie recalibrée (98,8 k$ brut / 5,3 k$ net sur l'ancien rapport). Écart signalé, pas corrigé ici.

**Tests ajoutés (intitulés)**
1. l'ambiance monte sur une finition au 1er round et sur une surprise, retombe sur une décision molle, et ne change jamais pendant un combat ;
2. l'ordre des combats décide de la salle : la même carte jouée à l'envers ne finit pas au même palier ;
3. jamais deux fois la même phrase d'ambiance de suite ;
4. le combat de la soirée et deux performances distinctes tombent sur les combats que les relevés désignent ;
5. la caisse paie exactement les primes, et la recette, les deux dernières recettes et le compte de la soirée suivent ;
6. sur quarante soirées réelles, les primes restent sous 3 % des recettes brutes ;
7. un préliminaire ordinaire ne reçoit rien quand un combat principal est notable ;
8. l'option « ambiance de salle » est allumée par défaut et ne change jamais les primes ;
9. ambiance et primes sont déterministes, sans `Math.random` ni `rnd()` ;
10. validation stricte des clés neuves et réparation sans perte d'une ancienne partie.

**Sauvegarde**
- `MGMT_SAVE_VERSION` inchangé. Une partie d'avant les clés facultatives se charge, se répare et joue une soirée (test 10). `tests/mgmtReleveReduit.test.js` reste vert : **1 899 325 octets** pour une partie neuve (plafond 1 900 000, marge 675 o).

**Empreintes `mgmtPasse`**
- Les six soirées du prédécesseur sont **inchangées** (`20261008` `8b2e000b5d88db19`, `20261009` `413a790d63563e36`) : salle et primes n'y écrivent rien.
- Seule `jouee3` change, parce que les soirées du joueur portent maintenant `pr`, `m.soirees`, `finance.primes` et les faits : `5280d7d504885a51` → `ad34b123fcafa8ab` (décision « brief du 22/10, P7 T3 : les primes », commentaire dans le test).
- `mgmtEconomie` et `mgmtSalles` : la recette nette déduit désormais `finance.primes`, avec la décision citée en commentaire.

**Textes à relire**
- 90 phrases d'ambiance et 3 annonces de prime, toutes marquées `relu:false`, dans `mgmt-salle-primes-data.js`. Aucun nom de personnage, aucune réplique inventée.

**Écarts à la fiche**
- Les primes ne sont pas encore dans l'écran Records : le compteur `primes` est calculé dans `mgmtStats` et les faits sont prêts, mais l'ajout d'une carte Records est la tranche écran suivante. L'écran actuel continue d'afficher huit cartes et « sans primes ».
- Le passé du prédécesseur ne paie **aucune** prime (pas seulement l'absence de faits) : payer changeait la caisse, donc les retraites et la carte des six ans, et cassait les empreintes `mgmtPasse`. Le joueur, lui, paie dès sa première soirée.
- Le code de `mgmt-leaders.js` n'est pas modifié (seules des fins de ligne l'ont touché, `git diff --ignore-all-space` vide) : il n'est pas commité.

**Questions pour Anthony**
- Les 90 phrases et les annonces sont-elles au ton voulu (salle froide → salle debout) ?
- La maquette affiche 50 000 € par prime ; on garde le calibrage à 1,6 % des recettes, ou tu veux un montant fixe plus spectaculaire au prix de l'économie ?
