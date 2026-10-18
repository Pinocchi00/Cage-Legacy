# DUO-T1 — le moteur du Duo (sans écran)

Branche : `mode-duo`, **après DUO-T0** (sans T0, l'organisation de J2 ne joue plus de soirées et la sauvegarde se corrompt).
Brief : `docs/BRIEF-18-10-MODE-DUO.md`. Commit : `Duo T1 : le moteur (partie à deux, avancer, draft, super carte, rejeu, score)`.
Aucun écran, aucun texte affiché. Version de sauvegarde **inchangée** (champ facultatif `m.duo`).

## Le principe

Une partie Duo est une partie management normale, monde vivant (`m.mondeVivant===true`), dans un emplacement normal.
- **J1** (côté `'a'`) joue l'organisation de la partie : `m` lui-même.
- **J2** (côté `'b'`) joue une des sept organisations vivantes : `m.orgs[m.duo.b]`.
- Les soirées ordinaires des deux côtés sont jouées par le matchmaker automatique (`mgmtPredecesseurSoiree`). Aucun des
  deux joueurs ne booke une soirée ordinaire.
- Tous les `MGMT_DUO_PERIODE` jours (91), une super carte de 6 combats J1 contre J2.

## Fichier neuf `mgmt-duo.js`

`"use strict";` en tête, ancre `/* ==== [ANCRE: DUO_T1_MOTEUR] — Duo T1, docs/lots/DUO-T1.md ==== */`. Aucun DOM, aucun
`Math.random()`, JSDoc sur chaque fonction. Dans `index.html`, **juste après** `mgmt-passe.js` (il en lit les fonctions au
runtime seulement), avec un `?v=` neuf ; vérifie ensuite que `tests/helpers/loadGame.js` le charge (il lit `index.html`).

### Constantes

```js
const MGMT_DUO_PERIODE=91;          // décision d'Anthony du 18/10 : tous les 3 mois
const MGMT_DUO_COMBATS=6;           // 6 combats principaux
const MGMT_DUO_CARTES_SAISON=4;     // une saison = un an = 4 super cartes
const MGMT_DUO_NOM_MAX=16;          // longueur d'un nom de joueur
```

### L'état `m.duo` (seul champ ajouté à la partie)

```js
m.duo={
  v:1,
  b:'mma-korner',                    // orgId de J2 : une clé de m.orgs, jamais l'organisation de m
  noms:{a:'Joueur 1',b:'Joueur 2'},  // texte libre des joueurs, 1 à 16 caractères, toujours affiché avec esc()
  periode:91,
  prochaine:91,                      // jour (calendrier de m) de la prochaine super carte
  etape:'attente',                   // 'attente' | 'encheres' | 'draft' | 'pret' | 'soiree' | 'bilan'
  reperes:{ca:<m.cycle>,cb:<sous.cycle>},  // cycles à la dernière super carte (ou à la création) : le résumé part de là
  draft:null,                        // voir « Le draft »
  encheres:null,                     // réservé à DUO-T2 (reste null en T1)
  soiree:null,                       // {i:0..6} pendant la soirée : l'index du combat affiché
  cartes:[],                         // archive : voir mgmtDuoJouer
}
```

### Fonctions (noms exacts)

1. `mgmtDuoActif(m)` → `!!(m&&m.duo&&typeof m.duo==='object')`.
2. `mgmtDuoPartie(m,cote)` → `m` pour `'a'`, `m.orgs[m.duo.b]` pour `'b'`, sinon `null`.
3. `mgmtDuoAvec(m,cote,fn)` → pose `G.mgmt=mgmtDuoPartie(m,cote)`, appelle `fn(partie)`, **rend `G.mgmt` dans un `finally`**,
   renvoie le résultat. **Toute lecture ou écriture du côté `'b'` passe par elle** : `mgmtFightReady`, `mgmtDivisionRank`,
   `mgmtApplyFight`, `mgmtAvailable`, `mgmtContratsApresSoiree` lisent `G.mgmt`. Mesuré par Claude : `mgmtFightReady` d'un
   combattant de J2 ne rend pas le même profil selon que `G.mgmt` est sa partie ou celle de J1 (expérience, camp, rouille).
4. `mgmtDuoCreer(m,orgIdB,noms)` → pose `m.duo`. Refuse (rend `false`, ne touche rien) si `m.mondeVivant!==true`, si
   `orgIdB` n'est pas une clé de `m.orgs`, ou si c'est l'organisation de `m` (`mgmtPredecesseurOrgId(m)`). Les noms : `String`,
   espaces de bord retirés, coupés à 16, vides → `'Joueur 1'` / `'Joueur 2'`. `prochaine = m.cal.jour + MGMT_DUO_PERIODE`.
   `reperes` = cycles actuels. Rend `true`.
5. `mgmtDuoProchaineSoiree(m)` → le jour de la prochaine soirée ordinaire de J1 : `m.cal.prochaines[0].jour` s'il existe,
   sinon `m.cal.jour + MGMT_EVENT_WEEKS*7` (la règle de DUO-T0).
6. `mgmtDuoAvancerPas(m)` → **un pas** (l'écran l'appelle entre deux images, comme `mgmtNouvelleGenPas`). Exige
   `G.mgmt===m` et `m.duo.etape==='attente'`, sinon rend `{termine:true}` sans rien faire.
   - Si `mgmtDuoProchaineSoiree(m) <= m.duo.prochaine` : joue la soirée ordinaire de J1,
     `mgmtPredecesseurSoiree(m,m.eventsPlayed,mgmtPredecesseurReglages(mgmtPredecesseurOrgId(m)))` (elle ouvre le cycle
     suivant, qui fait jouer les sept organisations, dont celle de J2). Rend `{termine:false,jour:m.cal.jour,cible:m.duo.prochaine}`.
     **Si elle ne se joue pas** (`jouee:false`), passe au point suivant au lieu de boucler.
   - Sinon : `m.cal.jour=Math.max(m.cal.jour,m.duo.prochaine)`, puis `mgmtAdvanceRosterAges(m)` ; `m.duo.etape='draft'`
     (DUO-T2 y insérera `'encheres'`) ; `mgmtDuoDraftOuvrir(m)` ; `saveMgmt()` ; rend `{termine:true}`.
7. `mgmtDuoAvancer(m)` → les pas jusqu'au bout (tests, outils). Garde-fou : 20 pas au plus.

### Le draft — « je place, tu réponds »

`m.duo.draft={premier:'a'|'b', tour:'a'|'b', attente:'place'|'reponse', combats:[{place:'a'|'b',a:id|null,b:id|null,div}]}`

- `mgmtDuoDraftOuvrir(m)` : `premier` = le perdant de la dernière carte (`m.duo.cartes` : `gagnant` `'a'` → `'b'`, `'b'` → `'a'`) ;
  à la première carte ou après une égalité : `'b'` (J1 a choisi son organisation en premier). `tour=premier`, `attente='place'`, `combats=[]`.
- `mgmtDuoDisponibles(m,cote)` → les lignes du côté (copies `{id,name,div,W,L,D,age,rang}`) : non retirées (`mgmtIsRetired`),
  `mgmtAvailable(partie,f,null)` vrai, pas déjà dans `draft.combats`. `rang = mgmtDivisionRank(partie,f,'organization')`.
  Ordre : catégorie dans l'ordre de `allDivisions()`, puis rang (sans rang en dernier), puis `id`. Calcul dans `mgmtDuoAvec`.
- `mgmtDuoPlacables(m,cote)` → les disponibles du côté dont la catégorie a **au moins un** disponible chez l'autre.
- `mgmtDuoPlacer(m,id)` → exige `etape==='draft'`, `attente==='place'`, `id` dans `mgmtDuoPlacables(m,tour)`. Ajoute
  `{place:tour,[tour]:id,[autre]:null,div}`, puis `tour=autre`, `attente='reponse'`. Rend `true`/`false`.
- `mgmtDuoRepondre(m,id)` → exige `attente==='reponse'`, `id` disponible chez `tour`, **même `div`** que le dernier combat.
  Remplit le côté manquant. Puis : si `combats.length===MGMT_DUO_COMBATS` → `m.duo.etape='pret'`, `attente=null` ;
  sinon `attente='place'` et **`tour` ne change pas** (celui qui vient de répondre place le combat suivant). Ordre obtenu :
  P1 place, P2 répond ; P2 place, P1 répond ; … trois placements chacun.
- `mgmtDuoAnnuler(m)` → défait le **dernier geste** : une réponse (le combat redevient « à répondre ») ou un placement
  (le combat disparaît). Depuis `'pret'`, défait la dernière réponse et revient à `'draft'`. Rien à défaire : `false`.
- `saveMgmt()` après chaque geste réussi.
- Le combat `combats[0]` ouvre la soirée ; `combats[5]` est le **combat principal, en 5 rounds** ; les autres en 3 rounds.

### Le combat entre deux organisations

`mgmtDuoJouer(m)` → exige `etape==='pret'` et `G.mgmt===m`. **Vérifie d'abord les 6 combats** (les deux combattants
existent dans leur partie, `mgmtAvailable` vrai de chaque côté) : un seul échec → rend `null` sans rien muter. Puis, combat
par combat, dans l'ordre :

```js
const sous=mgmtDuoPartie(m,'b'), fa=mgmtFighterById(m,c.a), fb=mgmtFighterById(sous,c.b);
const rounds=i===MGMT_DUO_COMBATS-1?5:3;
const traceA=mgmtTraceSide(fa), traceB=mgmtTraceSide(fb);
const seed=SEED;                                   // la RNG de la partie, comme mgmtRunEvent
const ra=mgmtDuoAvec(m,'a',p=>mgmtFightReady(fa,p.cycle));
const rb=mgmtDuoAvec(m,'b',p=>mgmtFightReady(fb,p.cycle));
const res=simulateFight(ra,rb,rounds);
const fam=mgmtMethodFamily(res.method,res.winner), round=Number.isSafeInteger(res.round)?res.round:rounds;
const t={c:m.cycle,slot:'main',seed,rounds,a:traceA,b:traceB,winner:res.winner,family:fam,round,
         duo:{b:m.duo.b,ca:m.cycle,cb:sous.cycle}};
m.hist.push(t);
sous.hist.push(Object.assign(JSON.parse(JSON.stringify(t)),{c:sous.cycle}));
mgmtDuoAvec(m,'a',p=>mgmtApplyFight(p,fa,fb,res,'A'));
mgmtDuoAvec(m,'b',p=>mgmtApplyFight(p,fb,fa,res,'B'));
mgmtRangsInvalider(m); mgmtRangsInvalider(sous);
```

Après les 6 combats : `mgmtContratsApresSoiree` de chaque côté (dans `mgmtDuoAvec`, avec les identifiants de ce côté) ;
puis l'archive, les repères, l'étape :

```js
m.duo.cartes.push({n:m.duo.cartes.length+1,jour:m.cal.jour,
  combats:[{a,b,na:fa.name,nb:fb.name,div,winner,family,round,rounds,h:<index de t dans m.hist>}],   // ×6
  gagnant:'a'|'b'|'nul'});   // le plus de combats gagnés ; un nul ne compte pour personne
m.duo.reperes={ca:m.cycle,cb:sous.cycle}; m.duo.prochaine+=m.duo.periode;
m.duo.draft=null; m.duo.etape='soiree'; m.duo.soiree={i:0};
saveMgmt();
```

Rend la carte archivée. **Tout est joué et sauvegardé avant tout affichage** : recharger ne rejoue rien (comme `mgmtRunEvent`).

- `mgmtDuoSoireeSuivante(m)` → `soiree.i++` ; à `i>=6`, `etape='bilan'`. `saveMgmt()`.
- `mgmtDuoTerminer(m)` → depuis `'bilan'` : `etape='attente'`, `soiree=null`. `saveMgmt()`.

### Le rejeu (revoir un combat de super carte)

`mgmtDuoRejouer(t)` → `null` si `!t.duo`. La partie de J1 est `G.mgmt` (elle porte `orgs`), celle de J2
`G.mgmt.orgs[t.duo.b]`. Profils d'avant combat comme au combat : côté A avec `G.mgmt` = partie de J1 et le cycle
`t.duo.ca`, côté B avec `G.mgmt` = partie de J2 et `t.duo.cb`, sur `mgmtTraceLine(t.a)` / `mgmtTraceLine(t.b)` ;
`setSeed(t.seed)` **avant** les deux profils (même ordre qu'au combat) ; `simulateFight(ra,rb,t.rounds)` ; `SEED` et `G.mgmt`
rendus dans un `finally`.

**Seule modification d'un fichier existant pour le rejeu** : `mgmtReplayFight` (`mgmt-corps.js`, vers la ligne 401),
juste après le test `t.p===true` :

```js
if(t.duo&&typeof mgmtDuoRejouer==='function') return mgmtDuoRejouer(t);   /* Duo T1 : un combat de super carte se rejoue avec les deux organisations */
```

Ainsi la fiche, les résultats et l'écran de combat animé (`mgmtCombatOuvrir`) revoient un combat de super carte sans autre
changement. Si le rejeu n'est plus fidèle (une sous-partie allégée depuis), `areneVerdictFidele` le refuse et l'écran de
refus existant s'affiche : jamais un faux combat.

### Lectures pour les écrans (pures)

- `mgmtDuoScore(m)` → `{saison, numero, a, b, total:{a,b}}` : `saison = Math.floor(cartes.length/4)+1` tant que la saison
  n'est pas finie (après la 4e carte d'une saison, la saison suivante commence), `numero` = la prochaine carte dans la saison
  (1 à 4), `a`/`b` = cartes gagnées dans la saison en cours, `total` = depuis le début.
- `mgmtDuoResume(m,cote)` → ce qui s'est passé depuis `reperes` dans la partie du côté : `{soirees, combats, champions}`.
  `combats` = les combats `slot:'main'` de `partie.hist` avec `c > repere`, hors combats de super carte (`!t.duo`), du plus
  récent au plus ancien, 12 au plus : `{a:t.a.name,b:t.b.name,div:t.a.div,winner,family,round,rounds}`. `soirees` = nombre de
  cycles distincts parmi eux. `champions` = `allDivisions().map(d=>({div:d.id,id:(mgmtSplitTitle(partie,d.id)||{}).id||null}))`,
  le nom lu sur la ligne. Calcul dans `mgmtDuoAvec`.

### Validation (`mgmt-save.js`)

`mgmtDuoValide(d,raw)` dans `mgmt-save.js` (les validateurs y vivent) ; dans `validateMgmt`, une ligne :
`if(raw.duo!==undefined&&!mgmtDuoValide(raw.duo,raw)) return false;`. Contrôles : objet ; `v===1` ; `raw.mondeVivant===true` ;
`b` clé de `raw.orgs` et différente de l'organisation de la partie ; `noms.a`/`noms.b` chaînes de 1 à 16 caractères ;
`periode`, `prochaine` entiers ≥ 0 ; `etape` dans la liste ; `reperes.ca`/`cb` entiers ; `draft` `null` ou de la forme
ci-dessus (au plus 6 combats, identifiants `mgmtValidId` ou `null`) ; `encheres` `null` (DUO-T2 l'élargira) ; `soiree` `null`
ou `{i}` entier de 0 à 6 ; `cartes` tableau (au plus 200) d'objets à 6 combats. `mgmtRepair` ne touche pas `m.duo`.

**La trace d'un combat de super carte porte une clé de plus, `duo` — deux validateurs existants la refusent aujourd'hui**
(vérifié par Claude le 18/10 : avec une trace `duo` dans `m.hist`, `validateMgmt(m)` rend `false`) :
- `mgmtValidFightTrace` (`mgmt-save.js`, vers la ligne 269) n'accepte que les clés `a,b,c,family,round,rounds,seed,slot,winner`
  (+ `p`). Ajoute `duo` comme clé facultative, comme `p` : `{b,ca,cb}`, `b` un identifiant de `MGMT_ORGANISATIONS`, `ca` et
  `cb` entiers ≥ 0, rien d'autre. **Sans cela, `mgmtRepair` (qui filtre `m.hist` par ce validateur, vers la ligne 662) jetterait
  les combats de super carte au chargement**, et `validateMgmt` refuserait la partie.
- `mgmtPasseAlleger` (`mgmt-passe.js`, vers la ligne 166), appelé chaque semaine sur les sept organisations
  (`mgmtMondeVivantAlleger`), reconstruit chaque combat d'après l'effectif (`mgmtPasseEntree(par,r)`) et **abandonne tout
  l'allègement** si un combattant n'y est plus. La copie d'un combat de super carte dans la partie de J2 contient un
  combattant de J1 qui n'est pas dans cet effectif : l'organisation de J2 ne s'allégerait plus jamais (sa sauvegarde grossit
  sans fin). Correctif : dans `mgmtPasseAlleger`, quand un identifiant manque à l'effectif, prendre le côté de la trace
  elle-même (`t.a` / `t.b` : il porte `id,name,first,last,div` et, le cas échéant, `ck,generation`) au lieu d'abandonner.
  Le même défaut existe déjà dans `main` pour un combattant recruté hors d'une organisation vivante (ses anciens combats
  restent dans la sous-partie qu'il a quittée) : ce correctif le règle aussi. Une partie sans combattant manquant s'allège
  **exactement** comme avant (test d'empreinte).

## Tests — nouveau fichier `tests/mgmtDuo.test.js` (dans `test` et `test:watch` de `package.json`)

Création courte : `setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`
Intitulés `Duo T1 — <point>` :

1. la création pose `m.duo` et refuse l'organisation de la partie, une organisation inconnue, une partie sans monde vivant ;
2. `mgmtDuoAvancer` joue les soirées de J1 jusqu'à la date, J2 en a joué aussi (`eventsPlayed` des deux parties monte), `etape==='draft'`, `m.cal.jour>=91` ;
3. le draft : `mgmtDuoPlacer` refuse un combattant dont la catégorie n'a personne en face, `mgmtDuoRepondre` refuse une autre catégorie, l'ordre P1/P2/P2/P1… donne trois placements chacun, `mgmtDuoAnnuler` défait réponse puis placement ;
4. `mgmtDuoJouer` : 6 combats, le dernier en 5 rounds, bilans des 12 lignes mis à jour dans **leur** partie, une trace dans chaque `hist`, `etape==='soiree'`, `prochaine` avancée de 91 ;
5. **rejeu fidèle** : pour chaque combat archivé, `areneVerdictFidele(m.hist[h],mgmtReplayFight(m.hist[h]))` est vrai ;
6. **équité** : le profil de combat du combattant de J2 est calculé avec sa propre partie (espionner `mgmtFightReady` ou comparer à `mgmtDuoAvec(m,'b',…)`) ;
7. les classements des deux parties se calculent sans erreur après la carte (`mgmtDivisionRanking(p,div,'organization')` pour chaque catégorie, chaque côté) ;
8. `G.mgmt` est la partie de J1 après chaque fonction publique, même quand une lève (forcer une erreur dans `fn`) ;
9. sauvegarde puis chargement (`saveMgmt`, `G.mgmt=null`, `loadMgmt`) gardent `m.duo` à l'identique, à chaque étape ;
10. `validateMgmt` refuse un `m.duo` abîmé (b inconnu, nom de 17 caractères, 7 combats, étape inconnue) ;
11. déterminisme : deux fenêtres, même graine, mêmes gestes → `mgmtSerialiser(G.mgmt)` identique ;
12. une partie sans `duo` se charge et se joue exactement comme avant (empreinte d'une soirée inchangée) ;
13. après une super carte, `validateMgmt(G.mgmt)` est vrai et un `saveMgmt`/`loadMgmt` garde les 6 traces `duo` dans `m.hist` (aucune jetée par `mgmtRepair`) ;
14. après une super carte puis une soirée ordinaire, la partie de J2 s'est allégée (`mgmtPasseAlleger` rend `true` sur elle ; sa copie de trace `duo` est devenue une entrée `p:true`) ;
15. un combattant recruté hors d'une organisation vivante (`mgmtRecruterVivant`) n'empêche plus cette organisation de s'alléger.

## Vérification

`node --test tests/mgmtDuo.test.js tests/mgmtDuoMonde.test.js tests/mgmtMondeVivant.test.js`, puis `npm run check:rapide`.
`node tools/_bump.js mgmt-duo.js mgmt-corps.js mgmt-save.js mgmt-passe.js` (et tout `.js` touché), `node tools/verif-versions.js origin/main`.

## Hors périmètre

Enchères (DUO-T2). Écrans (DUO-T3, T4). Argent de la super carte. Titre en jeu.

## Pièges

- **`G.mgmt` doit toujours redevenir la partie de J1** : `saveMgmt` écrit `G.mgmt` (DUO-T0 bloque l'écriture d'une
  sous-partie, mais une partie restée posée sur J2 casserait tous les écrans).
- `mgmtApplyFight` tire `rnd()` pour les blessures : garde l'ordre A puis B, combat après combat.
- Les identifiants de J2 sont préfixés (`o3mg12`) : ne les reconstruis jamais, lis-les sur les lignes.
- `mgmtDuoAvancerPas` peut prendre plusieurs secondes : **un seul** appel à `mgmtPredecesseurSoiree` par pas.
- Ne crée pas un second système de soirée : la super carte n'est pas une `m.card` et ne passe pas par `mgmtRunEvent`.
