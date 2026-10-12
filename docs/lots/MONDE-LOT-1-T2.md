# Monde lot 1 T2 — le prédécesseur

**Date :** 10/10/2026
**Branche attendue :** `monde-lot-1-passe` — branche courante : `monde-lot-1-passe`.
**Autorité :** `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md` §Lot 1, T2 ; `docs/PLAN-OPENCODE-MONDE.md` (« Lot 1 T2 : porte le joueur automatique »). Les lignes ci-dessous sont relevées le 10/10 pendant la T1 (`tools/mesure-management.js` bouge encore) : repère-toi au texte cité, pas au seul numéro.

## 1. Objectif

Faire du joueur automatique de l'outil de mesure une fonction du jeu, sans écran, que l'outil appelle au lieu de la recopier.

> « Le joueur automatique de l'outil de mesure devient une fonction du jeu, pure et sans écran. L'outil l'appelle au lieu de la recopier, et un test d'outillage échoue si les deux divergent. »

## 2. Ce qui existe

- **Porte `partie()`** de `tools/mesure-management.js` (l.33-90). Dans la boucle `for(let k=0;k<SOIREES;k++)` (l.53-86), la décision d'une soirée tient en deux blocs : l.55-72 (booking) et l.76 (`mgmtAgendaJouer`), puis l.83 (`mgmtNewPile`). Dans l'ordre : ferme la pile (`status='closed'`, `decision='ignored'`, `m.open=null`) ; prolonge sur 3 combats tout contrat à un combat de la fin (`mgmtBourseSouhaitee(m,f,true)` puis `mgmtContratRenouveler`) ; pose une soirée `'petite'` à `jour+MGMT_EVENT_WEEKS*7` si rien n'est posé ; booke les combats réclamés (`mgmtPublicReclame`) ; complète par les têtes d'affiche, catégorie tournante `divs[(k+main.length+essais)%divs.length]`, tri `mgmtStar`, 60 essais au plus ; met le titre en jeu si `k%2===0` et `mgmtCanTitle` ; fait offrir (`mgmtOfferBulk(m,true)`) et valider (`mgmtDecide(m,id,'validate')`) la proposition de Leïla ; referme la pile.
- **Le « une fois sur deux » n'est pas un tirage** : c'est la parité de `k` (l.69, `k%2===0`). Aucun `rnd()` n'est appelé par le joueur lui-même. Les tirages viennent des fonctions du jeu qu'il appelle ; leur ordre d'appel fixe donc la graine consommée.
- Le joueur ne recrute pas, ne répond à aucune affaire (il les ferme en `'ignored'`) et n'utilise pas `mgmtAgendaProposer` (`mgmt-agenda.js:217`).
- **L'autre joueur automatique, `tests/helpers/jouerSoirees.js:5`**, est un outil de lecture, pas de mesure : il ne fixe aucune graine, triche sur les contrats (`f.libre` → contrat neuf, `ct.n+=5`), ne prend ni réclamés ni tri par `mgmtStar`, pose la soirée à `jour+10`, ne met le titre que sur le 1er combat (option), ne propose pas Leïla. Une quinzaine de fichiers de test l'utilisent : **il ne change pas** dans cette tranche.
- Fonctions du jeu appelées (signature exacte) : `mgmt-bureau.js` `mgmtDefault(orgRef):86`, `mgmtNewRoster(m):144`, `mgmtFighterById(m,id):257`, `mgmtNewPile(m):378`, `mgmtDecide(m,affairId,replyId):529` — `mgmt-carte.js` `mgmtBookMain(m,aid,bid):343` (rend le combat ou `null`), `mgmtSelectable(m,f,pick):399`, `mgmtCartRows(m):422`, `mgmtOfferBulk(m,selectWhenIdle):695` — `mgmt-ceintures.js` `mgmtSplitTitle(m,div):26`, `mgmtCanTitle(m,fight):115`, `mgmtSetTitle(m,idx,title):127` — `mgmt-contrats.js` `mgmtBourseSouhaitee(m,f,renouvellement):56`, `mgmtContratRestants(f):108`, `mgmtContratRenouveler(m,id,n,b):178` (rend `{ok,raison?,demande,prime}`) — `mgmt-corps.js` `mgmtIsRetired(f):256`, `mgmtRunEvent(m):593` — `mgmt-agenda.js` `mgmtAgendaInit(m):24`, `mgmtAgendaPoser(m,jour,taille,salle):102`, `mgmtAgendaJouer(m):195` (rend `m.lastEvent` ou `null`) — `mgmt-argent.js` `mgmtStar(f):133` — `mgmt-salles.js` `mgmtPublicReclame(m):108` — `mgmt-monde.js` `mgmtExteriorEnsure(m):141` — `engine.js` `setSeed(s):13`, `rnd():14`, `allDivisions:159`.

## 3. Ce qui change

**`mgmt-predecesseur.js`** (neuf, à la racine). Ligne 1 : `"use strict";`. Puis l'ancre `/* ==== [ANCRE: MONDE_LOT1_T2_PREDECESSEUR] — Monde lot 1 T2 ==== */` et son `/* ==== [FIN ANCRE] ==== */`. Simulation et état : aucun DOM, aucun `CL`, aucun `window`. Déclarations de premier niveau en colonne 0 (ESLint les lit ainsi).

```js
/** Les réglages du prédécesseur. Aujourd'hui un seul : titreCadence — le titre se met en jeu quand k % titreCadence === 0
 *  (2 = une soirée sur deux, 0 = jamais d'initiative). Le lot 2 T3 y ajoutera les autres réglages, par organisation.
 *  @returns {{titreCadence:number}} un objet neuf à chaque appel. */
function mgmtPredecesseurReglages(){ return {titreCadence:2}; }

/** Joue UNE soirée de la partie m comme le joueur automatique de l'outil de mesure : décisions de la semaine, carte,
 *  soirée jouée, puis ouverture de la semaine suivante (mgmtNewPile). Sans écran ; ne recrute pas, ignore les affaires.
 *  Exige G.mgmt === m (le moteur lit G.mgmt) : lève une Error sinon.
 *  @param {object} m la partie  @param {number} k l'indice de la soirée (0, 1, 2…) : fixe la rotation des catégories et la cadence du titre
 *  @param {object} [reglages] complété par mgmtPredecesseurReglages()
 *  @param {{bookingMs:number,combatsMs:number}} [mesure] si fourni, on y ajoute les durées (Date.now) du booking et du combat ; jamais lu pour décider
 *  @returns {{jouee:boolean,k:number,prolonges:number,refus:{'trop-grand':number,caisse:number,'trop-bas':number,offre:number},
 *   reclames:number,tetes:number,titres:number,champions:{avant:Array,apres:Array},decouvert:boolean,evenement:object|null}} */
function mgmtPredecesseurSoiree(m,k,reglages,mesure){ … }
```

Sens du compte rendu : `prolonges` = contrats renouvelés (`r.ok`) ; `refus` = nombre de refus par raison, pour ces quatre raisons seulement (comme l.58 : `refus[r.raison]!==undefined`) ; `reclames` / `tetes` = appels de `mgmtBookMain` qui ont rendu un combat, dans la boucle des réclamés / des têtes d'affiche ; `titres` = `m.card.main.filter(x=>x.title===true).length` après le booking ; `champions.avant` = `allDivisions().map(d=>(mgmtSplitTitle(m,d.id)||{}).id||null)` pris **au début** (la ceinture ne dérive que de `m.facts`, que le booking ne touche pas) ; `champions.apres` = le même tableau pris **juste après `mgmtAgendaJouer`, avant `mgmtNewPile`** ; `decouvert` = `m.treasury<0` à ce même instant ; `evenement` = ce que rend `mgmtAgendaJouer`. Si `mgmtAgendaJouer` rend `null` : `jouee:false`, `evenement:null`, **`mgmtNewPile` n'est pas appelé** (comme le `break` de l.76).

**Le corps est le code de `partie()` déplacé, pas réécrit** (mêmes appels, même ordre, mêmes bornes, `m` partout, jamais `G.mgmt`, sauf la garde). Se déplacent : l.55 (fermeture de la pile) ; l.56-58 (prolongations) ; l.59 (pose) ; l.61-62 (réclamés) ; l.63-68 (têtes d'affiche) ; l.69 (titre, `k%2===0` devient `cad>0&&k%cad===0`, `cad=Object.assign(mgmtPredecesseurReglages(),reglages||{}).titreCadence`) ; l.70-72 (Leïla, fermeture) ; l.76 (`mgmtAgendaJouer`) ; l.83 (`mgmtNewPile`). Seuls ajouts : la garde, les compteurs du compte rendu, les deux prises de `champions`, `decouvert`, et les `Date.now()` de `mesure` (booking : du début à la fin de l.72 ; combat : autour de l.76). Laisse, à l'endroit de la l.55, un commentaire `/* Lot 5 T2 : le prédécesseur répondra aux demandes ici. */` sans rien d'autre.

**`index.html`** : une ligne `<script src="mgmt-predecesseur.js?v=p1"></script>` placée juste après la ligne `mgmt-save.js`, avant le commentaire d'ancre `MGMT_LOT4_T1_ECRANS`. Raison : le fichier n'exécute rien au chargement (aucune constante lue), il n'appelle les fonctions qu'à l'usage ; mais il est de la logique, donc il précède les écrans, et tout ce qu'il utilise (`mgmt-agenda.js`, `mgmt-contrats.js`, `mgmt-carte.js`, `mgmt-ceintures.js`, `mgmt-salles.js`, `mgmt-corps.js`, `mgmt-argent.js`, `mgmt-save.js`) est déjà chargé. Monte aussi `SW_VERSION` de `sw.js` d'un cran. Ne touche à aucune autre ligne.

**`tools/mesure-management.js`** : dans `partie()`, **reste** (préparation et mesure) l.35-52 : `mgmtRetraitProb=…`, création de la partie, `G={theme:'dark',mgmt:m}`, `mesure`, `top5`, et le compte de `refus`, `titres`, `cartes`, `changes`, `joues`, `decouvert`. **Disparaissent** l.55-72 et l.76 et l.83. La boucle devient :

```js
const chrono={bookingMs:0,combatsMs:0}; let totalMs=0;           // remplace la l.41 ; suiteMs = totalMs-bookingMs-combatsMs (l.87)
for(let k=0;k<N;k++){ const t0=Date.now();
  const s=mgmtPredecesseurSoiree(m,k,undefined,chrono);
  for(const r of ['trop-grand','caisse','trop-bas','offre']) refus[r]+=s.refus[r];
  if(!s.jouee) break;
  joues++; cartes++; titres+=s.evenement.fights.filter(f=>f.title).length;
  changes+=s.champions.avant.filter((x,i)=>x!==s.champions.apres[i]).length;
  if(s.decouvert) decouvert++;
  if(POINTS.includes(joues)) mesure(joues);
  totalMs+=Date.now()-t0; }
```
`res.chrono` garde exactement ses clés (`soirees,totalMs,combatsMs,bookingMs,suiteMs`, lues dans `chrono`). Le commentaire d'en-tête dit que le joueur est maintenant `mgmtPredecesseurSoiree`. Le reste du fichier (rapport, `--six-ans`, `--graine`) ne bouge pas.

## 4. Sauvegarde

**Non.** `MGMT_SAVE_VERSION` reste 14 (`mgmt-bureau.js`). La fonction n'ajoute aucun champ à `m` : elle n'appelle que des fonctions qui écrivent ce que le jeu écrit déjà ; `mesure` et le compte rendu vivent hors de `m`. Vérifié : après trois soirées, `mgmtParseAndValidate(JSON.stringify(m))` accepte la partie, `m.v===14` (test 6).

## 5. Textes

Aucun.

## 6. Écran

Aucun.

## 7. Tests

**`tests/mgmtPredecesseur.test.js`** (neuf ; `tests/helpers/loadGame.js` : `newGameWindow({runMain:true})`, `readScriptOrder`). Une partie se crée comme l'outil : `setSeed(g); m=mgmtDefault('split'); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);`.

1. `Monde lot 1 T2 — mgmt-predecesseur.js est chargé après mgmt-agenda.js et mgmt-save.js, avant mgmt-ecran-semaine.js, avec un ?v=`
2. `Monde lot 1 T2 — le prédécesseur est sans écran : ni document, ni CL, ni window, ni localStorage, ni Math.random` — source sans commentaires ; ligne 1 `"use strict";` ; l'ancre y est.
3. `Monde lot 1 T2 — la cadence du titre vient des réglages : aucun k%2 en dur, titreCadence lu, réglages par défaut neufs à chaque appel` — le source sans commentaires ne contient pas `k%2` et contient `titreCadence` ; `mgmtPredecesseurReglages()` rend `{titreCadence:2}` ; muter l'objet rendu ne change pas l'appel suivant. (Pas de test de comportement : graine 20261008, deux ceintures sont déjà posées par les champions, la cadence ne change rien aux deux premières soirées, mesuré avec les cadences 0, 1 et 2 : états identiques.)
4. `Monde lot 1 T2 — deux soirées de la graine 20261008 : compte rendu complet, neuf combats, cycle +1, garde G.mgmt` — soirée k=0 : `jouee`, `evenement.fights.length===9`, `m.eventsPlayed===1`, `m.cycle===2`, `reclames===0`, `tetes===5`, `titres===2`, `champions.avant.length===allDivisions().length`, quatre compteurs de `refus` entiers. Soirée k=1 : `reclames===1`, `tetes===4`. Avec `G.mgmt` ≠ `m`, la fonction lève une `Error`.
5. `Monde lot 1 T2 — même graine, deux parties, quatre soirées : état sérialisé identique après chaque soirée ; une autre graine donne un autre état` — graines 20261008 (×2) et 20261009 ; `JSON.stringify(m)` comparé après chaque soirée.
6. `Monde lot 1 T2 — la partie jouée reste valide : mgmtParseAndValidate accepte le JSON après trois soirées` — graine 20261008 ; et `m.v===MGMT_SAVE_VERSION`.

**`tests/outillage.test.js`** (ajout de deux tests ; les tests 7.1 à 7.4 et le test T1 du chrono restent tels quels, intacts) :

7. `Monde lot 1 T2 — l'outil de mesure ne contient plus aucune décision du joueur : il appelle mgmtPredecesseurSoiree` — source de `tools/mesure-management.js` sans commentaires (comme `corpsAllOnclicks`) : aucun des motifs `mgmtBookMain`, `mgmtContratRenouveler`, `mgmtBourseSouhaitee`, `mgmtPublicReclame`, `mgmtCartRows`, `mgmtSetTitle`, `mgmtCanTitle`, `mgmtOfferBulk`, `mgmtDecide`, `mgmtAgendaPoser`, `mgmtAgendaJouer` ; `mgmtNewPile` au plus une fois (la création) ; `mgmtPredecesseurSoiree(` présent.
8. `Monde lot 1 T2 — l'outil et la fonction du jeu donnent les mêmes chiffres : graine 20261008, split, dix soirées` — lance `node tools/mesure-management.js 10 --orgs split --json` ; dans une fenêtre jsdom, joue 10 soirées avec `mgmtPredecesseurSoiree` (même préparation que l'outil, `mgmtRetraitProb=()=>0` compris) ; compare au point `'10'` : `caisse` (`Math.round(m.treasury*1000)`), `pop`, `effectif` (roster sans `mgmtIsRetired`), `retraites`. Égalité stricte. Si l'outil recopie une décision, ces chiffres divergent.

**Pourquoi cette forme.** Garder deux copies pour les comparer est ce que le brief interdit. Avec une seule source, la divergence est impossible par construction : le test 7 garantit la construction, le test 8 garantit que l'outil ne triche pas autour. Un état figé (empreinte de `JSON.stringify(m)` enregistrée) casserait à chaque lot qui touche la création ; il sert **une fois**, en vérification (§8), pas en test permanent.

Ajoute `tests/mgmtPredecesseur.test.js` à `package.json`, dans **`test` et `test:watch`** (à la main). S'il dépasse 60 s, ajoute-le aussi à la liste `LENTS` de `tools/check-rapide.js` (comme la T1).

## 8. Vérification

- **Avant de toucher au code** : `node tools/mesure-management.js 10 --orgs split --json 2>/dev/null > ../mesure-avant.txt` (hors dépôt, ~16 s), puis la même avec `--graine 20261009` vers `../mesure-avant2.txt`. Repères relevés le 10/10 (graine 20261008, soirée 10) : `effectif` 366, `caisse` 299000, `changementsDeChampion` 8, `refus` 1 / 26 / 0 / 0, `decouvert` 4, `titresParCarte` 2.
- **Après** : mêmes deux commandes vers `../mesure-apres*.txt`. Comparer **sans la clé `chrono`** (les durées changent) : `node -e "const l=f=>{const s=require('fs').readFileSync(f,'utf8');const r=JSON.parse(s.slice(s.indexOf('{')));delete r.split.chrono;return JSON.stringify(r)};process.exit(l('../mesure-avant.txt')===l('../mesure-apres.txt')?0:1)"` doit sortir 0, pour les deux graines. Supprime ces fichiers ensuite.
- `node --test tests/mgmtPredecesseur.test.js`, puis `node --test tests/outillage.test.js` (7.1 à 7.4, le test T1 du chrono et les deux nouveaux).
- `npm run lint`, `node tools/verif-versions.js`.
- **Critère de fin chiffré** : 6 tests neufs verts dans `mgmtPredecesseur.test.js`, 2 dans `outillage.test.js`, les 5 tests d'outillage existants verts sans modification ; les deux comparaisons avant/après sortent 0 ; `tools/mesure-management.js` ne contient plus aucun des 11 motifs du test 7.

## 9. Hors périmètre

- La génération des six ans (T3), le passage de témoin (T4), l'archive (T5), les parties existantes (T7).
- Les promesses et les réponses aux demandes du prédécesseur (lot 5 T2), ses combats déjà signés (lot 5 T1).
- Les réglages par organisation (lot 2 T3) : ne crée ni leurs noms ni leur logique. Seul `titreCadence` existe.
- `tests/helpers/jouerSoirees.js` et ses quinze fichiers de test. Aucune autre ligne d'`index.html`. Aucun fichier de jeu hors `mgmt-predecesseur.js`. Aucun test existant assoupli.

## 10. Pièges

- **Le moteur lit `G.mgmt`, pas `m`** : `mgmtFightReady` (`mgmt-corps.js:213`), `mgmtSel` (`mgmt-humanite.js:9`), `saveMgmt` (`mgmt-save.js:661`). La fonction ne pose jamais `G` (la garde lève une `Error` si `G.mgmt!==m`) ; l'outil et les tests posent `G={theme:'dark',mgmt:m}` eux-mêmes. Dans le corps, `m` partout.
- **Ordre = graine.** Ne réordonne rien, n'« optimise » ni la boucle `essais` ni le tri. Le `k` entre aussi dans la rotation des catégories, pas seulement dans le titre. La fonction n'appelle ni `rnd()` ni `Math.random()`.
- **`mgmtNewPile` est dans la fonction** (brief : « ouverture de la semaine suivante »). Il retire les joueurs âgés (`mgmtRetireRoster`, `mgmt-corps.js:303`) et peut vider une ceinture : `champions.apres` et `decouvert` se prennent donc **avant**, sinon `changementsDeChampion` change dans le rapport.
- **`mgmtRetraitProb=function(){return 0;}`** (l.35) reste dans l'outil, tel quel. Cette fonction ne sert que `mgmtRetraitsAvantSoiree` (`mgmt-retraits.js:48`), que seule l'interface appelle (`mgmt-calendrier.js:160`, `mgmt-screens.js:583`). Le prédécesseur ne l'appelle pas, comme l'outil : pas de retrait de combattant booké.
- **Classement en mémoire (T1)** : `mgmtRangsInvalider(m)` est appelé par `mgmtRunEvent`, `mgmtNewPile`, `mgmtRecruter`, `mgmtNewRoster`. Le prédécesseur ne mute que par les fonctions du jeu : n'écris jamais `f.retired=`, `m.hist.push`, `m.roster.push` dans son corps.
- `mgmtRunEvent` appelle `saveMgmt()` à chaque soirée (écriture localStorage jsdom) : normal, ne le contourne pas.
- `Date.now()` ne sert qu'à `mesure` : jamais dans une condition ni dans un résultat.
- Le joueur ne recrute pas et ignore les affaires : les chiffres sont des ordres de grandeur. Ne l'« améliore » pas, ce serait changer la mesure.
- Une fonction ajoutée = un appelant orphelin ne casse qu'à l'exécution : lance le test 8 et l'outil, pas seulement le lint.

## 11. Questions pour Anthony

Aucune bloquante. *(Non bloquante : le brief dit « pure ». Je lis « sans écran et sans global posé » : la fonction écrit dans la partie qu'on lui donne, comme tout le jeu. Si tu voulais « sans écriture », c'est une autre fonction ; la T3 n'en a pas besoin.)*

## Compte rendu

**Fichiers.** `mgmt-predecesseur.js` (neuf : `mgmtPredecesseurReglages`, `mgmtPredecesseurSoiree`, et une petite aide `mgmtPredecesseurChampions` qui factorise le tableau des champions pris deux fois) ; `index.html` (une balise `mgmt-predecesseur.js?v=p1` après `mgmt-save.js`) ; `sw.js` (`SW_VERSION` b73 → b74) ; `tools/mesure-management.js` (la boucle appelle la fonction du jeu) ; `tests/mgmtPredecesseur.test.js` (neuf) ; `tests/outillage.test.js` (deux tests ajoutés, aucun existant touché) ; `package.json` (`test` et `test:watch`) ; `tools/check-rapide.js` (LENTS).

**Tests ajoutés.** Les six de la fiche, intitulés exacts, dans `mgmtPredecesseur.test.js` (6/6 verts, 63 s) ; les deux de la fiche dans `outillage.test.js` (7/7 verts avec les cinq existants). `npm run lint` propre ; `node tools/verif-versions.js` : aucun écart ; `npm run check:rapide` : 856 tests, 856 passants, 0 échec (90 fichiers lancés, 9 écartés dont le nouveau).

**Chiffres avant/après** (split, 10 soirées, graines 20261008 et 20261009, sans la clé `chrono`) : les deux comparaisons sortent 0, JSON identique. Repères de la fiche retrouvés (effectif 366, caisse 299000, 8 changements de champion, refus 1/26/0/0, découvert 4, titres par carte 2). Chrono (même PC, bruit près) : 14,1 s avant, 14,4 s après ; booking 10,6 s → 10,7 s.

**Écarts à la fiche.**
- `?v=` de la balise laissé à `p1` comme la fiche le dit (l'outil `_bump.js` l'avait passé à `p1x` ; remis à `p1`, `verif-versions` content).
- Deux textes du rapport Markdown de l'outil changent (le gabarit « Chrono des six ans ») : `(mgmtAgendaJouer)` devient `(les combats de la soirée)` et `, mgmtNewPile compris` devient `comprise`. Nécessaire pour que le test 7 (source sans commentaires, 11 motifs, `mgmtNewPile` au plus une fois) passe : ces noms n'étaient que dans le texte du rapport, pas dans le code. Le test T1 du chrono (`**Combats**`, `**Suite**`, `**Booking**`) reste vert.
- `mgmtPredecesseur.test.js` dépasse 60 s (test 5 : trois parties × quatre soirées, état sérialisé à chaque soirée) : ajouté à LENTS de `check-rapide.js`, lancé à part (6/6).
- Test 2 vérifie en plus l'absence de `rnd(` et `setSeed` dans le source (la fonction ne consomme aucun tirage elle-même).

**Questions pour Anthony.** Aucune. (Reprise de la note non bloquante de la fiche : « pure » lu comme « sans écran et sans global posé ».)
