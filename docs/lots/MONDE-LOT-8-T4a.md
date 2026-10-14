# Monde lot 8 T4a : cinq événements de coût petit, la demande restée sans réponse, le nom de la blessure

**Branche** : `monde-lot-8-suite` (vérifiée : branche courante). **Prérequis** : T1 et T6 codées dans la branche. Vérifie : `grep -n "MGMT_MARQUE_FAITS" mgmt-attention.js` et `grep -n "function mgmtMarquesAllumees" mgmt-attention.js` doivent répondre. Sinon arrête-toi et écris-le dans ton compte rendu. La T2 n'est pas codée : voir §11. Cherche par nom de fonction, pas par numéro de ligne.

## 1. Objectif
N3, N6, N7, N8 et N10 naissent comme des faits datés portant l'identifiant du combattant : ils allument la marque (T1) et passent par le budget (T6), sans jamais ouvrir de fenêtre. Une demande expirée écrit « restée sans réponse ». Le fait `injury` garde le nom de la blessure.
Brief (Lot 8) : « Chaque menu a ses événements. Ils naissent là où ils ont du sens » et « Jamais une fenêtre, jamais une minuterie. » Décisions du 10/10 (font foi) : N3, N6, N7, N8, N10 « petit, T4a » ; §2 « sa demande est restée sans réponse… un fait gardé, lisible dans sa fiche, qui allume sa marque » ; §4 « caps : 3, 5 et 10 défenses ; 12, 24 et 36 mois sur le trône. Un cap n'est dit qu'une fois » ; §5 « le nom est gardé dans le fait injury ».

## 2. Ce qui existe (vérifié)
- Faits `m.facts` `{c,k,a,…}` écrits par `mgmtAddFact` (mgmt-bureau.js:465), jamais élagués. Un genre absent de `validateMgmt` (mgmt-save.js:291-327) passe la porte sans contrôle (comme `injury`, `attend`).
- `mgmtRunEvent` (mgmt-corps.js:590) : la boucle écrit la trace `m.hist` (:638) et `title_fight` (:640) ; `premier` (:623) = index du 1er combat du soir ; `mgmtContratsApresSoiree` :647 (si agenda seulement) ; `mgmtContrariesApresSoiree` :667 ; `saveMgmt` :673.
- Blessure : `mgmtApplyFight` (mgmt-corps.js:514) — `injury=rollInjury()` rend `{name,fights}` (engine-progression.js:74) ; le fait écrit :566 ne garde pas le nom, qui ne survit que dans `m.lastEvent.touched`, écrasé à la soirée suivante.
- Retraites : d'âge, `mgmtRetireRoster` (mgmt-corps.js:303, fait `retired` :311, à l'ouverture du cycle) ; médicale, fait `retired` (mgmt-corps.js:563). `mgmtIsRetired` :256.
- Ceinture : `mgmtSplitTitle(m,div)` (mgmt-ceintures.js:26) rend `{org,div,id,defenses,since}`, pur ; la vacance est dérivée à la lecture (:43), jamais écrite. Porte `mgmtTitleMemoryRows` (:52) pour la relecture des faits suivant le champion d'une division.
- Top 15 mondial : `mgmtLendemainConstatsHtml` (mgmt-ecran-lendemain.js:169-192) compare `mgmtDivisionRanking(m,div,'world')` et `…,'world',m.cycle-1`, seuil `MGMT_CL_TOP=15` (mgmt-ecran-classements.js:61) ; entrée = dans le top courant et absent du classement précédent entier ; sortie = top 15 précédent devenu ≥15 ou absent.
- Contrats : `mgmtContratsApresSoiree(m,ids)` (mgmt-contrats.js:137) : `f.ct.f++`, à épuisement `fin_contrat` ; « Fin de contrat » est lu quand `mgmtContratRestants(f)===1` (:108). `f.ct={n,f,b,since}`.
- `mgmtMemeCamp(m,a,b)` (mgmt-camps.js:132) prend deux OBJETS combattant, pas deux ids.
- Demande expirée : filtre de lecture seul, `m.cycle-x.c>MGMT_DEMANDE_EXPIRE` (=3, mgmt-promesses.js:47) dans `mgmtDemandesOuvertes` (:126) ; réponse = fait `promesse`/`refus` portant `d` (index du fait demande, :212-215). Rien n'est écrit.
- Marque et budget : `MGMT_MARQUE_FAITS` (mgmt-attention.js:214), `mgmtFaitMarque` (:230), `mgmtEvenementsDepuis` (:245), `mgmtMarque`, `mgmtMarquesAllumees` (:342) : tout fait compté, daté et portant `a` allume et est budgété. Ajouter les genres à la liste suffit, rien à recoder.
- Mois d'un règne : `Math.round((m.cycle-since)*MGMT_VOIX_MOIS_PAR_CYCLE)` (constante mgmt-voix.js:21, vaut 60/52 ; modèle mgmt-suivi.js:335).
- Fiche : `mgmtFichePromesses` (mgmt-ecran-fiche.js:~201, « Ce qu'il demande ») et `mgmtFicheCorps` (:234, « Son corps », lit `MGMT_FACT_LABELS[x.k]`, mgmt-data.js:175).

## 3. Ce qui change
**Nouveaux faits** (`c=m.cycle`) : `top15` `{c,k,a,div,entre:bool,fight}` (`fight` = index dans `m.hist`, null si le classement a bougé sans qu'il combatte) ; `titre_vacant` `{c,k,a,div}` (`a` = le champion parti) ; `regne_cap` `{c,k,a,div,cap,since}` (`cap` ∈ `D3|D5|D10|M12|M24|M36` ; `since` = début du règne, sert à la garde « une fois ») ; `dernier_combat` `{c,k,a}` ; `carte_camp` `{c,k,a,b}` ; `sans_reponse` `{c,k,a,want,target?,d}` (`d` = index du fait demande) ; `injury` gagne `nom` (optionnel : les faits anciens n'en ont pas).

**`mgmt-bureau.js`** — nouvelle ancre `MONDE_LOT8_T4A_EVENEMENTS`, en fin de fichier. Détection pure : aucune RNG, aucun DOM, idempotent (chaque écriture gardée par « pas de fait identique déjà présent »).
- `/** Entrées et sorties du top MGMT_CL_TOP mondial d'une division, règle du lendemain. Pur. @returns {{entrees:Array<{id:string,rang:number}>,sorties:Array<{id:string,rang:number|null}>}} */ function mgmtTop15Mouvements(m,divId)` : même comparaison que mgmt-ecran-lendemain.js:172-191.
- `/** N3 : écrit top15 pour chaque combattant du roster entrant ou sortant, avec le combat qui l'explique. */ function mgmtMondeTop15(m,premier)` : divisions = celles des combattants des traces `m.hist.slice(premier)` ; pour chaque mouvement dont l'id est dans `m.roster` : `fight` = l'unique trace du soir le concernant, sinon null. Garde : pas de `top15` même `a` et même `c`.
- `/** N6 : les vacances créées par les faits retired, relues comme mgmtTitleMemoryRows. @returns {Array<{c:number,div:string,a:string}>} */ function mgmtMondeTitresVacants(m)` : champion par division via `title_initial`/`title_fight` ; un `retired` du champion = vacance à SA date. `a` peut être un objet `{id}` (ancien format) : accepter les deux. Écrit chaque vacance absente (garde même `div`,`a`,`c`).
- `/** N7 : les caps de règne atteints et jamais dits (décisions §4). */ function mgmtMondeRegneCaps(m)` : pour chaque division du roster, `t=mgmtSplitTitle` ; si `t.id` : `t.defenses` ∈ {3,5,10} non dit → `D`+n ; mois (formule §2) ≥ le plus haut cap non dit → UN seul `M` par appel. Garde : pas de `regne_cap` même `a`,`div`,`cap`,`since`.
- `/** N10 : un fait par combattant du roster ayant un coéquipier sur la soirée sans l'affronter. */ function mgmtMondeCoequipiers(m,premier)` : ids du soir dans l'ordre des traces, objets du roster ; pour chacun, le premier autre (ordre des traces) avec `mgmtMemeCamp` vrai et non adversaire → fait, puis `break`. Garde : pas de `carte_camp` même `a` et même `c`.
- `/** Après la soirée : N3, N6, N7, N10. @param {number} premier index du 1er combat du soir dans m.hist */ function mgmtMondeApresSoiree(m,premier)` : appelle les quatre détecteurs.
- `/** À l'ouverture du cycle : demandes expirées, N6 (retraite d'âge), N7 (mois). */ function mgmtMondeOuvreCycle(m)` : `mgmtDemandesExpire(m)`, `mgmtMondeTitresVacants`, `mgmtMondeRegneCaps`.
- `/** La phrase de fiche d'un fait T4a (gabarits MGMT_MONDE_PHRASES, relu:false). Texte brut, échappé au rendu. @returns {string|null} null si genre inconnu */ function mgmtMondePhrase(m,x)` : jetons `{adv}` (adversaire de `x.fight`), `{div}` (`mgmtDivisionLabel`), `{n}`, `{coeq}` (nom de `x.b`), `{want}` (`MGMT_DEMANDES[x.want].libelle`).
- Dans `mgmtNewPile`, après `mgmtDemandesOuvreCycle(m)` (:400) : ajouter `mgmtMondeOuvreCycle(m);`.

**`mgmt-corps.js`** : :566, le fait devient `mgmtAddFact(m,{c:m.cycle,k:injury?'injury':'susp',a:f.id,...(injury?{nom:injury.name}:{})})`. Dans `mgmtRunEvent`, juste après `mgmtContrariesApresSoiree(...)` (:667) : `mgmtMondeApresSoiree(m,premier);`. Rien d'autre.

**`mgmt-contrats.js`** (`mgmtContratsApresSoiree`, :137) : **APRÈS** `f.ct.f++`, et seulement si le contrat n'est pas épuisé (correction de Claude : N8 annonce qu'il RESTE un combat, pour que le joueur puisse prolonger avant), `if(f.ct.n-f.ct.f===1) mgmtAddFact(m,{c:m.cycle,k:'dernier_combat',a:f.id});`. Appelée seulement avec l'agenda (:647) : `dernier_combat` et `fin_contrat` ne sont donc jamais écrits le même soir : le premier tombe une soirée de combat avant le second.

**`mgmt-promesses.js`** (après `mgmtDemandesOuvertes`) :
`/** Décision 2 du 10/10 : une demande périmée sans réponse devient un fait sans_reponse, une fois (d = index du fait demande). La demande reste dans m.facts. Aucune RNG. */ function mgmtDemandesExpire(m)` : ensembles répondus (`promesse`/`refus` portant `d`) et déjà dits (`sans_reponse` portant `d`) ; pour chaque `demande` d'index i avec `m.cycle-x.c>MGMT_DEMANDE_EXPIRE`, non répondue, non dite : `mgmtAddFact(m,{c:m.cycle,k:'sans_reponse',a:x.a,want:x.want,...(x.target?{target:x.target}:{}),d:i})`.

**`mgmt-attention.js`** (:214) : ajouter à `MGMT_MARQUE_FAITS` : `'top15','titre_vacant','regne_cap','dernier_combat','carte_camp','sans_reponse'`. Rien d'autre : marque et budget suivent seuls.

**`mgmt-data.js`** (après `MGMT_FACT_LABELS`) : `const MGMT_MONDE_PHRASES={…,relu:false};` — dix gabarits livrés par `@ecrivain` (§5).

**`mgmt-ecran-fiche.js`** : `mgmtFicheCorps` — un fait `injury` avec `x.nom` s'affiche `Blessure — ${nom}` (sans `nom` : libellé seul, comme avant). `mgmtFichePromesses` — après les promesses, un `<li>` par fait `sans_reponse` du combattant (le plus récent d'abord, 3 au plus) : `mgmtMondePhrase(m,x)`, échappé. Aucun CSS neuf.

**`mgmt-ecran-lendemain.js`** (:169-192) : le calcul entrées/sorties devient un appel à `mgmtTop15Mouvements(m,divId)` ; HTML de sortie strictement inchangé.

## 4. Sauvegarde : non
`MGMT_SAVE_VERSION` reste 15. Les événements sont des lignes de `m.facts`, déjà sauvegardé ; `nom` sur `injury` est optionnel (affichage de repli pour les faits anciens). Aucune migration, aucune version, aucun bloc de validation nouveau (§10).

## 5. Textes
**Les dix gabarits sont livrés ici par Claude (10/10/2026), propositions `relu:false` : pose-les tels quels dans `MGMT_MONDE_PHRASES`, n'appelle pas `@ecrivain`, n'en invente aucun autre.**

```js
const MGMT_MONDE_PHRASES={
  top15entre:'{Il} entre dans le top 15 mondial ({div}).',
  top15entreCombat:'{Il} entre dans le top 15 mondial ({div}) après son combat contre {adv}.',
  top15sortie:'{Il} sort du top 15 mondial ({div}).',
  top15sortieCombat:'{Il} sort du top 15 mondial ({div}) après son combat contre {adv}.',
  titreVacant:'Son départ laisse la ceinture sans champion ({div}).',
  regneCapDefenses:'{Il} en est à {n} défenses de sa ceinture.',
  regneCapMois:'{Il} tient sa ceinture depuis {n} mois.',
  dernierCombat:'Il ne {lui} reste qu’un combat sur son contrat.',
  carteCamp:'{Il} et {coeq}, du même camp, étaient sur la même soirée.',
  sansReponse:'Sa demande est restée sans réponse — {want}.',
  relu:false
};
```

**Chaînage avec la T2 (décision de Claude) :** si `grep -n "function mgmtDepuisVisite" mgmt-*.js` répond (la T2 est alors codée), branche `mgmtMondePhrase` dedans pour les six genres, sans changer sa mise en page, et ajoute une assertion au test 10. Sinon ne fais rien de plus.

Ancienne commande, pour mémoire seulement : Commande à passer à `@ecrivain` — dix gabarits de phrase de fiche pour `MGMT_MONDE_PHRASES` (mgmt-data.js), marqués `relu:false`, une phrase courte à la troisième personne (style « Depuis ta dernière visite »), jetons `{il}` acceptés (le féminin passe par `mgmtAccord` au rendu) : 1. `top15entre` `{div}` ; 2. `top15entreCombat` `{div},{adv}` ; 3. `top15sortie` `{div}` ; 4. `top15sortieCombat` `{div},{adv}` ; 5. `titreVacant` `{div}` ; 6. `regneCapDefenses` `{n}` ; 7. `regneCapMois` `{n}` ; 8. `dernierCombat` (sans jeton) ; 9. `carteCamp` `{coeq}` ; 10. `sansReponse` `{want}` (« restée sans réponse »). Matériau déjà écrit (`relu:false`), à adapter sans copier servilement : les moments du catalogue `entre-top-15`, `sort-top-15`, `devient-champion`, `perd-ceinture` (mgmt-humanite-data.js:356-359). Une étiquette de catalogue ne s'affiche jamais telle quelle (décisions §4). Le codeur n'invente aucun texte : il pose ce que livre `@ecrivain`.

## 6. Écran
Aucun écran nouveau, aucune planche : les faits ne se lisent que dans deux sections de fiche existantes (« Ce qu'il demande », « Son corps ») et par la marque (T1/T6). Aucune fenêtre, aucune minuterie (le défilé et la carte qui glisse partent au lot 7, hors d'ici).

## 7. Tests : `tests/mgmtMondeEvenements.test.js` (à ajouter dans `package.json`, scripts `test` ET `test:watch`)
Amorce : `tests/mgmtMarque.test.js` (`neuve(7)`, `jouer` de `tests/helpers/jouerSoirees.js`). Graine 7. Remplacer une fonction du jeu par `win.eval('…=function(){…}')` : précédents `tests/mgmtMarqueBudget.test.js` et `tests/mgmtSuivi.test.js:12`.
1. `Monde T4a — N3 : une entrée et une sortie du top 15 écrivent un fait daté avec le combat qui l’explique` : `mgmtDivisionRanking` remplacé (X absent du classement précédent, 3e du courant ; Y 15e du précédent, 20e du courant), une trace `main` poussée pour X ; `mgmtMondeApresSoiree(m,premier)` : `top15` `{entre:true,fight:<index de la trace>}` pour X, `{entre:false,fight:null}` pour Y, `c===m.cycle` ; second appel : aucun fait de plus.
2. `Monde T4a — N3 : le lendemain affiche exactement comme avant` : `tests/mgmtEcranLendemain.test.js` vert sans aucune retouche.
3. `Monde T4a — N6 : la retraite du champion écrit la vacance à sa date, une seule fois` : fait `retired` poussé pour le champion d'une division : `titre_vacant` `{div,a}` avec le `c` du fait retired ; ancien format `a:{id}` : idem ; `retired` d'un non-champion : rien ; second appel : rien.
4. `Monde T4a — N7 : un règne dit ses caps une fois chacun` : champion à 3 défenses (faits `title_fight` + traces gagnées) : `regne_cap` `D3` ; rappel : rien ; `m.cycle` avancé de 11 : `M12` ; champion à 2 défenses : rien.
5. `Monde T4a — N8 : le dernier combat d’un contrat est dit, puis fin_contrat comme avant` : `f.ct={n:3,f:1,b:100,since:0}` ; `mgmtContratsApresSoiree(m,[f.id])` : `dernier_combat` écrit, pas de `fin_contrat`, `f.ct.f===2` ; second appel (il combat son dernier combat) : `fin_contrat` écrit comme avant, `f.ct` supprimé, `f.libre` vrai, pas de second `dernier_combat` ; un contrat `{n:1,f:0}` : `fin_contrat` seul, jamais de `dernier_combat`.
6. `Monde T4a — N10 : deux coéquipiers sur la même soirée sont dits, leurs adversaires non` : `mgmtMemeCamp` remplacé (vrai pour X/Z) ; traces X-Y puis Z-W : `carte_camp` pour X (`b`=Z) et Z (`b`=X), rien pour Y ni W ; X et Y coéquipiers mais adversaires : rien ; second appel : rien.
7. `Monde T4a — une demande périmée écrit « restée sans réponse » une fois, et la fiche la lit` : demande de cycle c−4 sans réponse : fait `sans_reponse` `{want,d}` ; rappel : rien ; demande répondue (promesse portant `d`) ou fraîche (c−1) : rien ; `mgmtFichePromesses(m,f)` contient la phrase de `mgmtMondePhrase`, échappée.
8. `Monde T4a — le fait injury garde le nom de la blessure et la fiche l’affiche` : `rollInjury` remplacé (`{name:'Fracture du nez',fights:3}`), `mgmtApplyFight` avec `method:'Blessure'` subie : le fait porte `nom:'Fracture du nez'` ; `mgmtFicheCorps` le contient ; un fait ancien sans `nom` : libellé seul, aucune erreur.
9. `Monde T4a — les six genres allument la marque et passent par le budget` : un fait de chaque genre pour 8 combattants après `mgmtVisitesInit` : `mgmtMarque` vrai pour chacun ; `mgmtMarquesAllumees(m).length<=mgmtConteurBudget(m)` (T6 non modifiée) ; les tests T1 et T6 restent verts sans retouche.
10. `Monde T4a — mgmtMondePhrase couvre les six genres et les variantes` : phrase non vide et égale au gabarit `MGMT_MONDE_PHRASES` substitué pour `top15` (avec et sans `fight`), `titre_vacant`, `regne_cap` (D et M), `dernier_combat`, `carte_camp`, `sans_reponse` ; `relu:false` présent ; genre inconnu : null.
11. `Monde T4a — rechargement propre et aucune fenêtre` : après les faits ci-dessus, `saveMgmt(); G.mgmt=null; loadMgmt()` : partie valide, faits présents, mêmes marques ; `jouer(win,1)` sur une partie neuve ne lève rien ; lecture du source : le bloc `MONDE_LOT8_T4A_EVENEMENTS` ne contient ni `CL.go`, ni `popup`, ni `setTimeout`.

## 8. Vérification
- Ciblée : `node --test tests/mgmtMondeEvenements.test.js` : 11 tests, 0 échec.
- Lots touchés : `node --test tests/mgmtMarque.test.js tests/mgmtMarqueBudget.test.js tests/mgmtContrats.test.js tests/mgmtPromesses.test.js tests/mgmtEcranLendemain.test.js tests/mgmtCeintures.test.js tests/mgmtSoiree.test.js` : 0 échec.
- Tranche : `npm run check:rapide` vert. Fin de tranche = 11 tests verts + le rapide vert.
- Cache : `node tools/_bump.js mgmt-bureau.js mgmt-corps.js mgmt-contrats.js mgmt-promesses.js mgmt-attention.js mgmt-data.js mgmt-ecran-fiche.js mgmt-ecran-lendemain.js` (une fois, à la fin).

## 9. Hors périmètre
T4b (N1, N4, N5, N11), T4c (N2), N9 (lot 9), les suites (T5), « Depuis ta dernière visite » (T2), les six ans (T7). Aucun affichage dans les écrans Classements, Ceintures, Contrats, Camps, Presse, Résultats : les événements naissent comme faits et marques seulement ; le combat qui explique ne s'ajoute pas au lendemain. Le fil `m.fil` n'est pas alimenté. Ne touche ni `mgmt-scenarios.js`, ni `mgmt-suivi.js`, ni `mgmt-vie.js`, ni `mgmtConteur`, ni le budget T6, ni la table des visites T1. Les entrées/sorties du top des combattants extérieurs restent un constat du lendemain, sans fait ni marque (question 1). Aucune demande périmée n'est retirée.

## 10. Pièges
- Ordre dans `mgmtRunEvent` : l'appel va après `mgmtContrariesApresSoiree` (:667), avant `m.lastEvent` (:668) et `saveMgmt` (:673) ; la carte est vidée :669 — lis `m.hist.slice(premier)`, jamais `m.card`.
- Idempotence : les tests rappellent les détecteurs ; chaque écriture a sa garde. Au premier passage après la tranche, une vacance d'avant la tranche est écrite avec sa vraie date : c'est voulu.
- Un combattant ne combat qu'une fois par soirée : « le combat qui l'explique » est unique ; prévois quand même `fight:null` (classement bougé par les résultats des autres).
- La retraite d'un champion peut écrire le même cycle trois faits (`retired`, `titre_vacant`, `top15` sortie) : une seule marque, c'est voulu.
- Ne redéfinis ni `MGMT_CL_TOP` (mgmt-ecran-classements.js:61), ni `MGMT_VOIX_MOIS_PAR_CYCLE` (mgmt-voix.js:21), ni `MGMT_DEMANDE_EXPIRE` (mgmt-promesses.js:47) : lis-les.
- `mgmtSplitTitle` et `mgmtDivisionRanking` coûtent O(faits) : un appel par division, jamais par combattant.
- `validateMgmt` : n'ajoute AUCUN bloc strict pour les nouveaux genres — les `injury` anciens n'ont pas `nom`, et des tests poussent des faits minimaux avant un rechargement ; les genres inconnus passent déjà la porte.
- `MGMT_MARQUE_FAITS` : ajoute sans retirer ; les tests T1/T6 doivent passer sans retouche.
- `esc()` sur tout ce que la fiche injecte ; `mgmtMondePhrase` rend du texte brut (les `{il}` sont accordés par `mgmtAccord` au rendu de la fiche, cf. T2).
- Aucun `Math.random()` ni `rnd()` : deux appels de suite donnent le même résultat.

## 11. Questions — tranchées par Claude le 10/10 : 1. oui, roster seulement ; 2. on garde la règle du lendemain ; 3. voir §5 (chaînage)
1. N3 n'écrit des faits que pour les combattants du roster (la marque et la fiche ne suivent que Split) ; l'extérieur garde le constat du lendemain, sans fait. Te convient-il ?
2. La règle du lendemain dit « entrée » seulement si le combattant était absent du classement précédent entier (un 18e devenu 12e n'est pas dit). Je la garde, pour que le fait et le lendemain restent d'accord. Dire plutôt toute entrée dans les 15 premiers ?
3. Note de chaînage (pas une question) : la T2 n'est pas codée à l'écriture de cette fiche. Quand elle partira, son `mgmtDepuisVisite` devra appeler `mgmtMondePhrase` pour ces six genres — je l'écrirai dans la fiche T2. D'ici là, seuls « Ce qu'il demande » et « Son corps » lisent les faits T4a.

## REPRISE du 14/10/2026 15 h 20 (superviseur) — état du disque, à terminer
Le code de la tranche est ÉCRIT sur le disque (non commité) : mgmt-attention.js, mgmt-bureau.js, mgmt-contrats.js, mgmt-corps.js, mgmt-data.js, mgmt-ecran-fiche.js, mgmt-ecran-lendemain.js, mgmt-fiche-planche.js, mgmt-promesses.js, package.json, tests/mgmtMondeEvenements.test.js. NE le réécris PAS : corrige-le.
Quatre tests de `tests/mgmtMondeEvenements.test.js` sont rouges ; ils parlent tous de l'écriture « une seule fois » (idempotence) :
1. « N6 : la retraite du champion écrit la vacance à sa date, une seule fois » : un non-champion laisse 2 vacances au lieu de 0.
2. « N7 : un règne dit ses caps une fois chacun » : 2 au lieu de 1 au premier passage.
3. « une demande périmée écrit « restée sans réponse » une fois » : 2 au lieu de 1.
4. « les six genres allument la marque et passent par le budget » : un genre n'allume pas sa marque.
Cause probable commune : le fait est écrit deux fois (une fois par le chemin de l'événement, une fois par le chemin de rattrapage/rechargement), ou une clé d'idempotence manque. Trouve-la, corrige le CODE (jamais assouplir un test sans décision citée).
Ensuite : `node tools/_bump.js` pour chaque fichier .js modifié (9 écarts de version signalés), `node tools/verif-versions.js origin/main`, `npm run check:rapide`, puis commit `Monde lot 8 T4a : ...` (pas `inachevé` sauf impossibilité réelle, dis alors précisément ce qui manque).
