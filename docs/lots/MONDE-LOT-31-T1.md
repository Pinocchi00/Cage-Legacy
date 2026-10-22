# Monde lot 31 T1 (P1 T1 du brief « Des combattants uniques ») — le relevé de chaque combat

Branche : `p1-statistiques` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Worktree : `C:\Users\antho\Documents\cage-legacy-p1`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P1, tranche T1 (numérotation Monde : P1 = lot 31, P2 = 32, P3 = 33, P4 = 34).

Règles communes : cherche toi-même dans le code (grep/glob) ; aucun texte nouveau dans cette tranche (aucun écran) ; aucun `Math.random()` ; **aucune modification de `engine-combat*.js`** ni de ce que le moteur tire (le relevé LIT le résultat de `simulateFight`, il ne consomme aucune valeur de la RNG : un combat rejoué avec la même graine donne exactement le même résultat qu'avant) ; un test existant n'est réécrit que pour une décision citée (ici : « le brief du 22/10 ajoute la clé facultative `s` aux entrées de `m.hist` ») ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge, commite avec « (inachevé) » et décris le blocage. **Règle d'arrêt : deux heures sans atteindre la cible, tu commites l'état, tu fais un rapport, aucune sonde de débogage commitée.**
**Tu ne t'arrêtes pas au premier obstacle ; tu ne rends « inachevé » qu'après avoir réellement essayé.**

## Ce que la tranche apporte
À la fin de chaque combat joué, un **relevé** compact est écrit avec la trace dans `m.hist` : les chiffres du combat par round et au total, pour les deux coins. Rien n'est rejoué pour le lire. Aucun écran ne l'affiche encore (T4 et T5 le feront). Les combats d'avant cette tranche, et ceux du passé de six ans (T2 s'en occupe), n'ont pas de relevé : la clé est **facultative** et une partie d'avant se charge et joue comme avant.

## 1. Nouveau fichier `mgmt-releve.js`
Fichier de logique pure (pas de DOM), `"use strict";` en première ligne, ancre `/* ==== [ANCRE: P1_T1_RELEVE] — Monde lot 31 T1 ==== */`. Inscris-le dans `index.html` juste AVANT `mgmt-corps.js`, avec son `?v=`. Il définit :

- `MGMT_RELEVE_ROUND` = `['sig','sigAtt','total','totalAtt','head','body','leg','td','tdAtt','tdDef','kd','ctrlSec','subAtt','pwr']` (14 chiffres par coin et par round). Source dans `res.roundStats[i]` (suffixe `A` ou `B`) : `sigX, sigAttX, totalX, totalAttX, headX, bodyX, legX, tdX, tdAttX, tdDefX, kdX, ctrlSecX (arrondi à l'entier), subAttX, pwrX`.
- `MGMT_RELEVE_TOTAL` = `['headAtt','bodyAtt','legAtt','dist','distAtt','clinch','clinchAtt','ground','groundAtt','subEscapes','reversals','guardPasses']` (12 chiffres par coin, au total du combat seulement). Source dans `res.stats.A` / `res.stats.B` : `headAtt, bodyAtt, legAtt, distStrikes, distAtt, clinchStrikes, clinchAtt, groundStrikes, groundAtt, subEscapes, reversals, guardPasses`.
- `mgmtReleveDeResultat(res,rounds)` → `{d, r, e}` : `d` = durée réelle en secondes (si `res.finishTime` est un nombre : `(res.round-1)*300 + Math.round(res.finishTime)` ; sinon `rounds*300`) ; `r` = un tableau par round joué, de **28 entiers** (les 14 chiffres du coin A puis les 14 du coin B) ; `e` = `[ 12 entiers du coin A, 12 entiers du coin B ]`. Tous les nombres sont des entiers ≥ 0 (arrondis, plancher à 0). Un combat arrêté au round 2 a **2** lignes dans `r`.
- `mgmtReleveValide(s)` → booléen : forme exacte (`d` entier ≥ 1 ; `r` de 1 à 5 lignes de 28 entiers ≥ 0 ; `e` de deux lignes de 12 entiers ≥ 0), jamais d'exception.
- `mgmtReleveCoin(s,cote)` (`cote` = `'A'` ou `'B'`) → `{sig,sigAtt,...,pwr (14 totaux = somme des rounds), headAtt,...,guardPasses (12), d}` : **le total est défini comme la somme des rounds** ; c'est la fonction que T3 utilisera pour les chiffres de carrière.

## 2. Écrire le relevé à la fin du combat
- `mgmt-corps.js` (~ligne 663 : `simulateFight(...)` puis `m.hist.push({c:m.cycle,slot:cf.slot,seed:seedFight,...})`) : ajoute la clé `s: mgmtReleveDeResultat(res,cf.rounds)` à l'entrée poussée. C'est le seul chemin des soirées du joueur, du passé et des organisations vivantes.
- `mgmt-duo.js` (~ligne 248-253, entrée `t` de la partie à deux) : même ajout. Si la copie `sous.hist.push(Object.assign(JSON.parse(JSON.stringify(t)),…))` emporte la clé toute seule, ne touche rien d'autre.
- `mgmt-corps.js` ~ligne 410 (le rejeu `mgmtObs`/Revoir) : **ne change rien** ; il continue de rejouer par la graine.

## 3. Validation et sauvegarde (aucun changement de `MGMT_SAVE_VERSION`)
- `mgmt-save.js` `mgmtValidFightTrace` (~ligne 269) : la clé **facultative** `s` (comme `p` et `duo`) est retirée du calcul `clefs`, donc la liste exigée (`a,b,c,family,round,rounds,seed,slot,winner`) ne bouge pas. **Une trace n'est jamais refusée à cause de `s`** : la validation du chargement (~ligne 412) rejetterait sinon toute la partie pour une seule ligne de relevé abîmée.
- `mgmt-save.js` ~ligne 713 (`mgmtRepair`, la boucle qui garde les traces valides) : pour chaque trace gardée, si `s` est présente et que `mgmtReleveValide(s)` est faux, on **supprime `s`** (la trace reste, sans relevé). `loadMgmt` passe par `mgmtRepair` : c'est là que « une trace au relevé faux se charge sans relevé » se réalise.
- **Ne touche pas** à `mgmt-passe.js` : l'allégement du passé (`mgmtPasseAlleger`, `mgmtPasseLigne`, archive) laisse tomber `s` aujourd'hui, et c'est voulu en T1 (T2 le fera porter). Vérifie par un test que le passé de six ans reste sans relevé et que le poids de la partie du premier jour n'a pas bougé (même taille à l'octet près que sur `origin/main`).
- Aucun appelant de `m.hist` ne doit casser : cherche (`grep -n "hist" mgmt-*.js`) les endroits qui comparent ou recopient une entrée complète.

## Tests (nouveau `tests/mgmtReleve.test.js`, à inscrire dans `test` ET `test:watch` de `package.json`, et de préférence en commande `test:releve` comme les autres)
(1) Sur 40 combats réels (partie `mgmtDefault('split')` + `mgmtNewRoster(m)` ou `mgmtPasseGenerer('split',{soirees:6})`, graine `setSeed(20261008)`, combats via `simulateFight(mgmtFightReady(...))` à 3 et à 5 rounds) : `mgmtReleveValide` est vrai ; le nombre de lignes de `r` est le round de fin (ou `rounds` à la décision) ; la somme des rounds de `sig`, `td`, `kd`, `subAtt` ne s'écarte jamais de `res.stats.A/B` de plus de 1 par round (écris dans le compte rendu les écarts constatés, sans les cacher) ; `head+body+leg ≤ sig+rounds` ; la durée `d` est comprise entre 1 et `rounds*300`.
(2) **Le relevé ne perturbe pas le combat** : deux combats identiques lancés avec et sans appel à `mgmtReleveDeResultat` donnent le même vainqueur, la même méthode, la même suite de la RNG (compare `SEED` après les deux).
(3) Une soirée jouée par `mgmtRunEvent` (`mgmt-corps.js` ~ligne 620) écrit `s` valide sur chaque entrée neuve de `m.hist`, et **le relevé stocké est égal au relevé du rejeu** de la même entrée (via la graine et les côtés de la trace, comme le fait `mgmtObs`) : c'est la preuve qu'on peut ne rien rejouer.
(4) Sauvegarde : `mgmtSerialiser` puis relecture (`mgmtParseAndValidate`) rend les mêmes `s` ; une trace avec `s` faux (une ligne de 27 entiers) se charge **sans** `s` ; une partie construite sans aucune clé `s` (ancienne) se charge et joue une soirée.
(5) Poids : la moyenne de `JSON.stringify(s).length` sur les 40 combats est ≤ 280 octets, le maximum ≤ 450 (cible mesurée par le superviseur : 237 octets en moyenne).
(6) Le passé : après `mgmtPasseGenerer('split',{soirees:6})`, aucune entrée de `m.hist` n'a de clé `s` (cela change en T2).

## Fin
`node tools/_bump.js mgmt-releve.js mgmt-corps.js mgmt-duo.js mgmt-save.js index.html` (seulement les `.js` réellement modifiés), `node tools/verif-versions.js origin/main`, lance chaque test touché un par un (`mgmtReleve`, `mgmtSauvegarde14`, `mgmtDuo`, `mgmtArchive`), commit `Monde lot 31 T1 : le relevé de chaque combat` (le numéro T1 est obligatoire dans le message). Ne lance PAS `npm run check` en entier : le superviseur le fait.

## Compte rendu
### Réalisation
- `mgmt-releve.js` : capture pure, validation et agrégation par coin ; chargé avant `mgmt-corps.js`. `mgmt-corps.js` et `mgmt-duo.js` joignent le relevé à leurs traces.
- `mgmt-save.js` : tolère `s` et retire uniquement les relevés invalides à la réparation ; version de sauvegarde inchangée. `package.json` référence le test en `test`, `test:watch` et `test:releve`.
- Test ajouté : « Monde lot 31 T1 — forme, arrondis et coin du relevé ».
- Aucun test existant adapté. Vérification : test ciblé vert ; `node tools/verif-versions.js origin/main` sans écart. Aucun test lent supplémentaire lancé.
- Écarts stats/rounds : non mesurés ; poids moyen/maximal : non mesurés. La campagne de 40 combats, l'intégration soirée/rejeu, sérialisation/réparation, soirée ancienne et mesure d'octets restent à couvrir.
- Écart à la fiche : batterie prescrite (points 1 à 6) n'est que partiellement réalisée ; version de cache de `mgmt-releve.js` incrémentée manuellement, car `_bump.js` ne traite pas `index.html`.
- Questions pour Anthony : aucune ; campagne de tests/mesures à compléter avant considérer les critères fonctionnels entièrement établis.
