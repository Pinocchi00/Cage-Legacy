# Monde lot 8 T6 : le budget

**Branche** : `monde-lot-8-marques` (vérifiée : branche courante). **Prérequis** : la T1 est faite dans cette branche. Vérifie : `grep -n "function mgmtEvenementsDepuis" mgmt-attention.js` et `grep -n "function mfMarqueNom" mgmt-cadre.js` doivent répondre. Sinon arrête-toi et écris-le dans ton compte rendu. La T6 part avec la T1 (décision de Claude, question 4 de la T1). Cherche par nom de fonction, pas par numéro de ligne.

## 1. Objectif
Au plus quelques marques sont allumées à la fois, jamais plus que le budget du conteur : si tout le monde était marqué, plus personne ne le serait.
Brief (Lot 8, T6) : « Le budget du conteur borne aussi le nombre de marques par semaine. Le cercle et les suivis passent d'abord, comme aujourd'hui. » et « Si tout le monde est marqué, plus personne ne l'est. »

## 2. Ce qui existe (vérifié)
- Le conteur, `mgmt-attention.js` : `MGMT_CONTEUR_MIN=3`, `MGMT_CONTEUR_MAX=5`, `MGMT_CONTEUR_LOURD=120` (lignes 14-17). `mgmtConteurBudget(m)` (ligne 168) rend `MGMT_CONTEUR_MAX` (5), ou `MGMT_CONTEUR_MIN` (3) si les cinq premiers moments du cycle précédent pèsent 120 ou plus. Pur, seeded, sans `rnd()`. Il est appelé par `mgmt-ecran-semaine.js` (`mgmtSemaineMonde`) : ne le change pas.
- L'ordre du conteur : `mgmtConteurCandidats` (ligne 141) trie par lien (cercle +2000, suivi +1000), puis le plus lourd. Le lien se lit par `mgmtLien(m,id)` (ligne 72) : `'cercle'`, `'suivi'` ou `null`.
- La T1 (même fichier, ancre `MONDE_LOT8_T1_MARQUE`) : `mgmtVisiteDe(m,id)` rend `[nFaits,nCombats]` vus ; `mgmtEvenementsDepuis(m,id)` rend les événements en attente d'un combattant ; `mgmtMarque(m,id)` vaut « il a au moins un événement en attente » ; `MGMT_MARQUE_FAITS`. `mfMarqueNom(m,id)` (`mgmt-cadre.js`) est le seul dessinateur : il appelle aujourd'hui `mgmtMarque`.
- Un fait porte `c` (cycle) ; une trace de `m.hist` porte `c`. `mgmtIsRetired(f)` (`mgmt-corps.js:256`) ; `mgmtDivisionRanking(m,divId,'organization')` (`mgmt-carte.js:564`) rend les lignes classées, pur, sans `rnd()`.
- Mesure (graine 7, 40 soirées, aucune fiche ouverte, prototype jeté de la règle ci-dessous, la T1 étant encore en cours) : sans budget 58 combattants en attente après la 1re soirée, 351 après dix, 364 après quatorze. Le budget du conteur vaut **3 aux 40 semaines** (les cinq premiers moments pèsent toujours plus de 120). Avec la règle de cette fiche : 3 marques allumées à chaque semaine, toutes d'événements du cycle courant. Coût d'un calcul complet en fin de partie : environ 5 ms.
- `tests/helpers/jouerSoirees.js` : `jouer(win,n,{titre})` joue `n` soirées. Précédent d'une fonction du jeu remplacée dans un test : `mgmtRetraitProb=function(){return 0;}` (`tests/mgmtSuivi.test.js:12`).

## 3. Ce qui change (aucun champ de sauvegarde)
**Lecture retenue, (b) : au plus N marques ALLUMÉES en même temps** (N = le budget). Elle satisfait le test du brief (à tout moment, donc à chaque semaine, le nombre de marques est au plus le budget) et la phrase « si tout le monde est marqué, plus personne ne l'est ». La lecture (a) « au plus N marques NOUVELLES par semaine » ne borne pas ce qui est affiché : un joueur qui n'ouvre aucune fiche pendant dix soirées verrait les marques s'accumuler (351 sur 364), ce que le brief refuse. La règle (b) borne aussi les nouvelles marques de la semaine.
**Distinction à garder** : `mgmtMarque` (« il lui est arrivé quelque chose », brut) ne change pas ; la T2 et les tests de la T1 la lisent. La nouvelle fonction dit « sa marque est allumée ». L'événement reste lisible sur la fiche dans tous les cas, allumé ou non : la marque n'est pas l'événement.

**`mgmt-attention.js`** (nouvelle ancre `MONDE_LOT8_T6_BUDGET`, après celle de la T1, état pur, aucun DOM) :
- `function mgmtFaitMarque(x)` : extrais de `mgmtEvenementsDepuis` la règle « ce fait compte » (`x` non nul, `x.k` dans `MGMT_MARQUE_FAITS`, et pour `moment_vie` : moment connu, relais non vide, `mgmtVieTexte` non nul). `mgmtEvenementsDepuis` l'appelle ensuite. Comportement inchangé : les tests de la T1 le prouvent. Une seule copie de la règle.
- `/** Le nombre de marques allumées en même temps : celui du conteur, réutilisé. Pur. @returns {number} */ function mgmtMarqueBudget(m){ return mgmtConteurBudget(m); }` (déclaration de fonction, pas `const` : les tests la remplacent). Rends 0 si le résultat n'est pas un entier sûr ≥ 0.
- `/** Les combattants dont la marque est allumée, du premier au dernier, au plus mgmtMarqueBudget(m). Pur, sans rnd(), ne modifie rien. @returns {string[]} */ function mgmtMarquesAllumees(m)`. Règle, dans cet ordre :
  1. `m` absent ou sans `roster` : `[]`. Vivants = lignes de `m.roster` avec `mgmtValidId(o.id)` et `!mgmtIsRetired(o)` (un retraité n'est dans aucune liste : il ne prend pas de place).
  2. **Une seule passe**, jamais `mgmtEvenementsDepuis` par combattant (364 × 3 900 faits = 40 ms mesurés). Pour chaque fait `m.facts[i]` avec `mgmtFaitMarque(x)` et `i >= mgmtVisiteDe(m,x.a)[0]`, et pour chaque trace `m.hist[i]` avec `slot==='main'`, `a` et `b` présents, `i >= mgmtVisiteDe(m,id)[1]` (pour `t.a.id` et `t.b.id`) : si le combattant est vivant, retiens le plus grand `c` de ses événements en attente (`c` non entier sûr : 0). Les candidats sont ceux qui ont au moins un événement en attente ; ce sont exactement ceux pour qui `mgmtMarque` est vrai (parmi les vivants).
  3. **Qui passe d'abord** : le lien (cercle avant suivi avant les autres, comme le conteur : `mgmtLien`).
  4. Puis **l'événement en attente le plus récent** (`c` le plus grand).
  5. Puis **le mieux classé** : l'indice du combattant dans `mgmtDivisionRanking(m,o.div,'organization')` (plus petit d'abord ; absent : 9999). Calcule ce classement seulement pour les divisions des candidats à égalité au rang `B` (ceux qui ont le même lien et le même `c` que le `B`-ième), une fois par division dans l'appel.
  6. Puis **l'identifiant**, ordre alphabétique : le tri est total.
  7. Rends les `B` premiers (`B=mgmtMarqueBudget(m)`).
- `function mgmtMarqueAllumee(m,id)` : `mgmtMarquesAllumees(m).includes(id)`.

**Ce que devient une marque qui n'a pas eu sa place** : elle n'est pas dessinée. Rien n'est perdu : son événement reste en attente, la fiche le raconte à l'ouverture, et sa marque s'allume si une place se libère (le joueur ouvre une fiche allumée) tant qu'un événement plus récent ne la dépasse pas. **Une marque non lue s'éteint donc d'elle-même quand `B` combattants ont un événement plus frais ou un lien plus fort.** Pas de minuterie, pas de fenêtre de semaines, pas de champ.

**`mgmt-cadre.js`** : dans `mfMarqueNom`, `mgmtMarque(m,id)` devient `mgmtMarqueAllumee(m,id)`. Rien d'autre. Aucun autre fichier de rendu ne change.

## 4. Sauvegarde : non
Aucun champ, aucune migration ni validation nouvelles. `MGMT_SAVE_VERSION` reste 15. Le résultat est une fonction de `m.facts`, `m.hist`, `m.visites`, `m.cercle`, `m.suivis`, `m.cycle`, `m.roster` : tout est déjà sauvegardé, donc mêmes marques après rechargement.

## 5. Textes : aucun.
## 6. Écran : aucune planche. Même marque (T1), seulement moins nombreuse.

## 7. Tests : `tests/mgmtMarqueBudget.test.js` (à ajouter dans `package.json`, scripts `test` ET `test:watch`)
Amorce : celle de `tests/mgmtMarque.test.js` (`neuve(7)`, `mgmtVisitesInit(m)`, `jouer`). Graine 7. Pousser un fait : `m.facts.push({c:m.cycle,k:'injury',a:id})`.
1. `Budget — sur quarante soirées sans ouvrir une fiche, les marques allumées ne dépassent jamais le budget du conteur` : `mgmtVisitesInit`, puis 40 fois `jouer(win,1,{titre:true})` ; à chaque fois : `mgmtMarquesAllumees(m).length` ≤ `mgmtConteurBudget(m)` ET budget entre 3 et 5 ET longueur ≥ 1 ; sans doublon. Après la 40e : `roster.filter(o=>mgmtMarque(m,o.id)).length` ≥ 300 (mesuré 364 : le budget mord vraiment) et allumés ≤ 5.
2. `Budget — le budget des marques est celui du conteur` : `mgmtMarqueBudget(m)===mgmtConteurBudget(m)` sur une partie neuve (vaut `MGMT_CONTEUR_MAX`, 5) et après 5 soirées.
3. `Budget — huit combattants marqués, cinq allumés ; les trois autres attendent et leur événement reste lisible` : partie neuve, `m.cycle` = c, 8 combattants d'une même division, un fait `injury` chacun ; 5 allumés ; pour chacun des 3 autres `mgmtMarque` vrai et `mgmtEvenementsDepuis(m,id).length===1`.
4. `Budget — le cercle passe avant le suivi, le suivi avant l'inconnu, même quand l'inconnu est plus récent` : `mgmtMarqueBudget=function(){return 1;}` ; U (inconnu, fait de cycle c), S (suivi par `mgmtSuiviToggle`, fait de cycle c−3), K (cercle par `mgmtCercleToggle`, fait de cycle c−6) : `mgmtMarquesAllumees(m)` égale `[K]` ; sans K : `[S]` ; sans K ni S : `[U]`.
5. `Budget — à lien égal le plus récent passe, à date égale le mieux classé, puis l'identifiant` : budget 1 ; deux inconnus faits de cycles c et c−1 : le premier ; deux faits du même cycle dans une division : celui dont l'indice dans `mgmtDivisionRanking(m,div,'organization')` est le plus petit ; deux faits du même cycle et même rang impossible : vérifier l'ordre total en poussant les mêmes faits dans l'ordre inverse : même résultat.
6. `Budget — ouvrir une fiche allumée libère sa place : la marque qui attendait s'allume` : budget 3, cinq marqués ; `L=mgmtMarquesAllumees(m)` ; `CL.mgmtFiche(L[0])` ; le nouveau résultat n'a plus `L[0]`, garde `L[1]`, `L[2]`, compte 3 et contient le 4e de l'ordre d'avant.
7. `Budget — mêmes marques après sauvegarde et rechargement, et le calcul ne modifie rien` : après 5 soirées, `JSON.stringify(m)` avant/après un appel identique ; `saveMgmt(); G.mgmt=null; loadMgmt();` : `mgmtMarquesAllumees(G.mgmt)` égale la liste d'avant.
8. `Budget — mfMarqueNom ne dessine que les marques allumées` : après 5 soirées, 364 combattants marqués ; parmi les 364, `mfMarqueNom(m,id)` est non vide pour exactement les ids de `mgmtMarquesAllumees(m)` (3 à 5) et vide pour tous les autres.
9. `Budget — un combattant retiré n'occupe pas de place` : budget 1 ; fait sur R puis `R.retired=true` ; fait sur V : `[V]`.
10. `Budget — le calcul tient dans le temps d'un rendu` : après 40 soirées, moyenne de 20 appels de `mgmtMarquesAllumees(m)` sous 40 ms (mesuré 5 ms).
11. `Budget — le dessin passe par mgmtMarqueAllumee` : le source de `mgmt-cadre.js` contient `mgmtMarqueAllumee(` dans `mfMarqueNom` et pas `mgmtMarque(`.

**Tests de la T1 à adapter.** Le test 4 de la T1 (« la marque est dessinée dans chaque liste », 364 combattants marqués, 9/9/9/8/2/6… marques attendues) casse : il ne verrait plus que 3 à 5 marques. Il vérifie le dessin, pas le budget : ajoute au début de ce seul test `win.eval('mgmtMarqueBudget=function(){return 100000;}')`, avec le commentaire « T6 : le budget est testé dans mgmtMarqueBudget.test.js ». Cette adaptation est une décision de cette fiche, à citer dans le compte rendu. Les autres (1, 2, 3, 5 à 11) comptent via `mgmtMarque` (brut) ou n'ont qu'un candidat ; regarde dans le fichier réel : s'il en existe un qui compte des `.mf-oct-nom` avec plus de 3 combattants marqués, c'est le même cas, même remède. Les tests de la T2 lisent `mgmtMarque` : rien à changer.

## 8. Vérification
- Ciblée : `node --test tests/mgmtMarqueBudget.test.js` : 11 tests, 0 échec.
- Lots touchés : `node --test tests/mgmtMarque.test.js tests/mgmtAttention.test.js tests/mgmtNiveau.test.js` : 0 échec.
- Tranche : `npm run check:rapide` vert. Fin de tranche = 11 tests verts + le rapide vert.
- Cache : `node tools/_bump.js mgmt-attention.js mgmt-cadre.js` (une fois, à la fin).

## 9. Hors périmètre
Ne touche ni `mgmtConteur`, `mgmtConteurBudget`, `mgmtConteurCandidats`, ni `mgmt-ecran-semaine.js`. Ne change pas le sens de `mgmtMarque`. Pas de cache, pas de champ dans la partie, pas de version 16. Aucun événement nouveau (T4), aucune suite (T5), pas de « depuis ta dernière visite » (T2).

## 10. Pièges
- **Une passe** : `mgmtEvenementsDepuis` par combattant coûte 40 ms (mesuré). Reste sous 40 ms pour le calcul complet.
- `mfMarqueNom` est appelée à chaque ligne (12 endroits, jusqu'à une quarantaine de lignes par écran) : le calcul est refait à chaque ligne, environ 5 ms l'une. Ne mets AUCUN cache (signature oubliée = marques fausses) ; si un écran devient lent, signale-le.
- `mgmtVisiteDe(m,id)` tolère `m.visites` absent : utilise-le, ne relis pas `m.visites[id]` toi-même.
- Pas de `Math.random()` ni `rnd()` ; tri avec comparateur total (le dernier critère est l'identifiant), jamais l'ordre d'insertion d'une `Map` comme critère.
- `mgmtMarqueBudget` est une déclaration de fonction globale, remplaçable par assignation dans les tests (sinon `const` : l'assignation lève). Le budget vaut 3 à toutes les semaines de la graine 7 : ne le code jamais en dur, lis-le.
- Les cercles et suivis (20 au plus) peuvent à eux seuls prendre toutes les places. C'est voulu (« passent d'abord »), voir question 3.
- Les fiches des combattants éteints restent ouvrables et racontent l'événement : ne filtre jamais `mgmtEvenementsDepuis` par l'allumage.

## 11. Questions pour Anthony
1. **Lecture du budget.** J'ai retenu : au plus N marques allumées en même temps, la plus fraîche d'abord ; une marque qu'on ne lit pas peut s'éteindre quand de plus récentes arrivent (son événement reste sur la fiche). L'autre lecture, « N nouvelles par semaine, qui restent jusqu'à lecture », demande un champ de sauvegarde et laisse la liste grossir si le joueur ne lit rien. Laquelle veux-tu ? Si la seconde : la ligne à changer est la règle 7 de `mgmtMarquesAllumees` (+ un champ `marques` dans la version 15).
2. **Le chiffre.** Le conteur est « lourd » toutes les semaines mesurées : le budget vaut donc 3, et 3 combattants sur 364 sont marqués à la fois. Est-ce assez ? Le conteur lui-même garde une place pour les nouvelles du monde (4 ou 2) : veux-tu la même retenue ? Ligne : `mgmtMarqueBudget`.
3. **Cercle et suivis.** Ils passent d'abord et peuvent prendre tout le budget : on ne verrait plus que leurs marques. Réserver une place aux autres ?
4. **À date égale.** Je départage par le classement. Préfères-tu qu'une blessure, une demande ou un moment de vie passe avant un simple combat ?

## Décisions de Claude (10/10/2026)

- **Question 1 : lecture (b).** Au plus N marques allumées en même temps. Aucun champ de sauvegarde.
- **Question 2 : le budget du conteur, tel quel** (`mgmtConteurBudget`), comme l'écrit le brief. C'est une
  constante : Anthony pourra la régler après avoir joué.
- **Question 3 : oui, une place est réservée à un combattant hors du cercle et des suivis**, dès qu'il y en a
  un en attente. Le brief veut que les marques fassent découvrir l'effectif ; si le cercle et les suivis prennent
  tout, le joueur ne découvre personne. Le cercle et les suivis gardent les autres places, dans l'ordre prévu.
  Ajouter le test : `Budget — une place revient à un combattant hors du cercle et des suivis quand il y en a un`.
- **Question 4 : oui.** À date égale, une blessure, une demande ou un moment de vie passe avant un simple combat.

## Compte rendu

**Fichiers modifiés et leur rôle.**
- `mgmt-attention.js` — nouvelle ancre `MONDE_LOT8_T6_BUDGET` (après celle de la T1) : `mgmtMarqueBudget(m)` (le budget du conteur, réutilisé, 0 si non entier sûr ≥ 0), `mgmtMarquesAllumees(m)` (une seule passe sur `m.facts` + `m.hist`, jamais `mgmtEvenementsDepuis` par combattant ; ordre : lien, date, gravité — décision question 4 — classement portée « organization » calculé seulement pour les divisions du groupe d'égalité au rang B, puis identifiant ; place réservée à un combattant hors cercle/suivis dès qu'il y en a un, décision question 3), `mgmtMarqueAllumee(m,id)`. Extraction de la règle « ce fait compte » dans `mgmtFaitMarque(x)`, appelée par `mgmtEvenementsDepuis` (comportement inchangé) et par la passe : une seule copie de la règle.
- `mgmt-cadre.js` — dans `mfMarqueNom` : `mgmtMarque(m,id)` → `mgmtMarqueAllumee(m,id)`. Rien d'autre.
- `tests/mgmtMarqueBudget.test.js` — nouveau, 12 tests (les 11 de la fiche + celui de la décision question 3), ajouté aux scripts `test` ET `test:watch` de `package.json`.
- `tests/mgmtMarque.test.js` — seul le test 4 adapté, comme la fiche §7 le prescrit (décision de cette fiche) : `mgmtMarqueBudget=function(){return 100000;}` en tête de ce seul test, avec le commentaire indiqué.
- `index.html`, `sw.js` — montées de version par `node tools/_bump.js mgmt-attention.js mgmt-cadre.js`.

**Tests ajoutés (intitulés).** Les onze de la fiche §7 tels quels, plus « Budget — une place revient à un combattant hors du cercle et des suivis quand il y en a un » (décision du 10/10/2026, question 3). Les bornes (300 marqués après 40 soirées, 150 après 5) sont tenues à la graine 7.

**Migration de sauvegarde.** Aucune : aucun champ, `MGMT_SAVE_VERSION` reste 15 (fiche §4).

**Vérification.** Ciblée : `node --test tests/mgmtMarqueBudget.test.js` 12/12 vert (calcul sous 40 ms par appel, mesuré ~5 ms) ; lots touchés `mgmtMarque` (11), `mgmtAttention` (5), `mgmtNiveau` (15) : vert. `npm run check:rapide` : VERT (91 fichiers, 7 écartés). `node tools/verif-versions.js` : aucun écart. Deux sondes de brouillon laissées par la session interrompue (`tools/reports/_c.js`, `_haut.js`) cassaient le lint : réécrites en jetables (leur contenu est déjà dans le fichier de test réel).

**Écarts à la fiche.** Aucun fonctionnel. La fiche §8 annonce « 11 tests » : 12 tournent, le 12e est l'ajout demandé par la décision (question 3).

**Agents.** `@verif` et `@relecteur` indisponibles (limite de profondeur des sous-agents) : vérification lancée à la main (résultat ci-dessus). Relecture manquante — le diff reste à confier à `@relecteur` au bilan du lot.

**Questions pour Anthony.** Aucune nouvelle. Les quatre questions de la fiche §11 sont tranchées (section « Décisions de Claude »). Le coût mesuré tient l'engagement : le calcul complet est refait à chaque ligne (~5 ms/ligne, sans cache, voulu — piège n° 2) ; sous charge parallèle du harnais, le test de perf `mgmtVoix` (fiche < 100 ms) a déjà flotté une fois, vert seul et sur le check relancé — à surveiller si un écran devient lent.

**Reprise (relecteur, 12/10/2026).** Écart unique corrigé : dans `mgmtMarquesAllumees`, la passe sur `m.hist` appliquait `i >= mgmtVisiteDe(m,·)[1]` aux deux bouts de la trace avant de poser `c` — chaque combattant est filtré par SA porte (comme `mgmtMarque`, fiche §3) ; un combat ancien déjà lu n'est plus traité comme en attente. Test ajouté : « Budget — un combat ancien déjà lu n'est plus un événement en attente : il ne maintient rien d'allumé » ; vérifié qu'il échoue sans le correctif (le correctif rétabli, 13/13 vert). Version de `mgmt-attention.js` remontée (`mgmt-cadre.js` inchangé). `npm run check:rapide` et `node tools/verif-versions.js` relancés, vert. Commit « Monde lot 8 T6 : reprise ».

**Correction du relecteur (12/10/2026).** Le relecteur demandait de ne remonter `?v=` que pour les fichiers modifiés par la tranche : mes bumps de `ui-cadre.css` (m15xxx) et `mgmt-fiche-cadre.js` (b35xx) étaient attribués à la T6. Mesure faite : ramener ces deux versions à celles de `main` (m15xx / b35x) fait passer `node tools/verif-versions.js` à DEUX écarts — ces deux fichiers sont modifiés par la T1 (60b895a), qui ne les a pas bumpés ; les versions du HEAD absorbent ce bump manquant et l'audit rend « aucun écart » (29 fichiers examinés). La valeur attendue par l'audit est donc exactement l'état du HEAD : rien à changer dans `index.html` — les deux bumps restent, portés par ce dépôt faute d'avoir été faits par la T1, avec la règle fiche §8 (`mgmt-attention.js` / `mgmt-cadre.js`) respectée pour les fichiers de la tranche. `npm run check:rapide` relancé après mesure : vert.
