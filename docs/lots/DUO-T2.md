# DUO-T2 — les enchères sur les combattants libres (sans écran)

Branche : `mode-duo`, après DUO-T1. Brief : `docs/BRIEF-18-10-MODE-DUO.md`. Commit : `Duo T2 : les enchères ouvertes avant chaque super carte`.
Aucun écran. Version de sauvegarde inchangée (`m.duo.encheres` passe de « toujours null » à la forme ci-dessous ; `mgmtDuoValide` s'élargit).

## La règle (décision d'Anthony du 18/10 : « ouvertes, à tour de rôle »)

Avant chaque super carte, **3 combattants libres** sont mis aux enchères, l'un après l'autre. Les deux joueurs, devant le
même écran, enchérissent à tour de rôle : **Miser** (le prix monte d'un palier) ou **Passer**. Quand un joueur passe alors que
l'autre mène, celui qui mène signe le combattant à ce prix. Si personne ne mise, le combattant reste libre. Le prix est payé
sur la caisse de l'organisation du gagnant ; il signe un contrat de **3 combats** à la bourse qu'il demande. Le joueur qui a
perdu la dernière super carte commence (J2 à la première, comme le draft).

Où l'on recrute dans le jeu solo, pour mémoire : **Contrats → onglet Recrutement** (`mgmt-contrats-ecran.js`), qui liste
les sans-contrat du monde. Le Duo lit **la même liste** (`mgmtRecrutables`) : pas de second marché.

**Depuis la décision du 18/10** (caisse stable pendant les soirées des adjoints, gains de la super carte : DUO-T1), une caisse
ne plonge plus en dehors des enchères : la mise reste bornée par `mgmtCanAfford`. **Question encore ouverte pour Anthony** : le
prix d'ouverture (aujourd'hui la prime de signature, 5 000 à 8 000 € dans la partie des planches) — passer à la valeur du
contrat (3 × la bourse) ? Tant qu'il n'a pas répondu, code la prime, comme écrit ci-dessous.

## Ce qui change

### `mgmt-duo.js` (ancre `/* ==== [ANCRE: DUO_T2_ENCHERES] — Duo T2, docs/lots/DUO-T2.md ==== */`)

```js
const MGMT_DUO_LOTS=3;            // combattants mis aux enchères par super carte
const MGMT_DUO_CONTRAT=3;         // combats du contrat signé
const MGMT_DUO_PALIER=0.10;       // le palier = 10 % du prix d'ouverture, arrondi au-dessus, au moins 1 k$
```

1. `mgmtDuoLots(m)` → les combattants mis aux enchères. Pour chaque catégorie de `allDivisions()`, le **premier** de
   `mgmtRecrutables(m,div.id)` (ordre du classement mondial) dont l'organisation (`mgmtExteriorCombattant(m,id).orgId`)
   n'est **pas** celle de J2 (`m.duo.b`) ; puis tri par `rang` croissant, `mgmtStar` décroissant, `id` ; les
   `MGMT_DUO_LOTS` premiers (`mgmtStar` lu sur la ligne rendue par `mgmtExteriorCombattant`). Lu avec `G.mgmt===m`. Pour chacun :
   - `b = mgmtBourseSouhaitee(m, mgmtExteriorPourOffre(m,id), false)` — sert **seulement** à fixer le prix d'ouverture, le même pour les deux joueurs
     (la bourse dépend de la popularité et du profil de l'organisation qui la lit : on la lit chez J1 pour l'ouverture, puis chez le gagnant pour son contrat) ;
   - `ouverture = mgmtContratPrime(MGMT_DUO_CONTRAT,b)` ; `pas = Math.max(1,Math.ceil(ouverture*MGMT_DUO_PALIER))`.
   Rend `[{id,name,div,orgId,rang,b,ouverture,pas}]`.
2. **Branchement dans `mgmtDuoAvancerPas`** (DUO-T1) : à l'arrivée à la date, si `mgmtDuoLots(m)` n'est pas vide,
   `etape='encheres'` et
   `m.duo.encheres={i:0,premier,lots:lots.map(l=>Object.assign(l,{prix:0,meneur:null,tour:premier,passes:0,fini:false,gagnant:null}))}`
   (`premier` = même règle que `mgmtDuoDraftOuvrir`) ; sinon `'draft'` comme avant.
3. `mgmtDuoMiser(m)` → lot courant `L=encheres.lots[encheres.i]`, joueur `L.tour`. Nouveau prix : `L.ouverture` si
   `L.meneur===null`, sinon `L.prix+L.pas`. Refuse (`{ok:false,raison:'caisse'}`) si
   `!mgmtCanAfford(mgmtDuoPartie(m,L.tour),prix)` (lu dans `mgmtDuoAvec`). Sinon `L.prix=prix`, `L.meneur=L.tour`,
   `L.passes=0`, `L.tour=autre`. `saveMgmt()`. Rend `{ok:true,prix}`.
4. `mgmtDuoPasser(m)` → si `L.meneur!==null` : le meneur gagne (`mgmtDuoAdjuger`). Sinon `L.passes++` : à 1, `L.tour=autre` ;
   à 2, le lot est fini sans gagnant. Puis lot suivant (`encheres.i++`) ; après le dernier, `etape='draft'`,
   `m.duo.encheres=null`, `mgmtDuoDraftOuvrir(m)`. `saveMgmt()`.
5. `mgmtDuoAdjuger(m,L)` → `L.fini=true`, `L.gagnant=L.meneur`, puis `mgmtDuoTransferer(m,L.id,L.meneur,L.prix)`.
   Si le transfert échoue (le combattant n'est plus libre ou n'existe plus), le lot est fini sans gagnant, rien n'est payé.
6. `mgmtDuoTransferer(m,id,cote,prix)` → le combattant entre dans la partie du côté, avec un contrat. **Réutilise**
   `mgmtRecruterVivant` (`mgmt-recrutement.js`) en lui ajoutant un 3e paramètre facultatif `cible` (défaut : `m`) :
   la ligne quitte sa sous-partie comme aujourd'hui, mais entre dans `cible.roster`, avec `org:mgmtOrgNom(cible)`, et le
   fait `recrue` s'écrit dans `cible` au cycle de `cible`. Sans 3e argument, la fonction fait **exactement** ce qu'elle fait
   aujourd'hui (le solo n'a pas à bouger : vérifie avec les tests de recrutement existants). Ensuite, dans `mgmtDuoAvec(m,cote,…)` :
   `b=mgmtBourseSouhaitee(cible,f,false)` (la bourse que le combattant demande à SON nouvel employeur),
   `f.ct={n:MGMT_DUO_CONTRAT,f:0,b,since:cible.cycle}`, `delete f.libre`, `cible.treasury-=prix`,
   `mgmtAddFact(cible,{c:cible.cycle,k:'contrat',a:id})`, `mgmtRangsInvalider(cible)`. Archive :
   `m.duo.recrues.push({n:<numéro de la super carte à venir>,id,name,cote,prix})` (créer `recrues:[]` à `mgmtDuoCreer`, 200 au plus).

### `mgmt-save.js`

`mgmtDuoValide` accepte `encheres` `null` ou `{i,premier,lots}` : `i` entier de 0 à `lots.length`, au plus 3 lots, chacun avec
`id` (`mgmtValidId`), `b`, `ouverture`, `pas`, `prix` entiers ≥ 0, `meneur` et `gagnant` `null|'a'|'b'`, `tour` `'a'|'b'`,
`passes` 0 à 2, `fini` booléen ; `recrues` tableau d'au plus 200 objets. Une partie DUO-T1 sans `recrues` reste valide
(`mgmtRepair` pose `recrues:[]` si absent).

## Tests — dans `tests/mgmtDuo.test.js`, intitulés `Duo T2 — <point>`

1. les lots : au plus 3, aucun de l'organisation de J2, aucun de la partie de J1, tous libres, ordre du classement mondial ;
2. miser/passer : J2 commence la première fois ; ouverture puis palier ; passer quand l'autre mène adjuge au meneur ;
   deux passes sans mise : le lot reste libre et on passe au suivant ;
3. la caisse : une mise au-delà de `mgmtCanAfford` est refusée et ne change rien ;
4. le transfert vers J1 : la ligne quitte sa sous-partie, entre dans `m.roster` avec `ct` de 3 combats, la caisse baisse du prix ;
5. le transfert vers J2 : la même chose dans `m.orgs[m.duo.b]`, et **rien** n'entre dans `m.roster` ;
6. une recrue des enchères est disponible au draft qui suit (`mgmtDuoDisponibles`) ;
7. après le dernier lot : `etape==='draft'`, `encheres===null`, le draft est ouvert ;
8. `mgmtRecruterVivant` sans 3e argument : les tests existants (`tests/mgmtRecrutement.test.js`, `tests/mgmtMondeVivant.test.js`, `tests/mgmtContrats.test.js`) passent à l'identique ;
9. sauvegarde/chargement au milieu d'une enchère (après une mise) : l'enchère reprend au même lot, même prix, même tour ;
10. le perdant de la carte précédente commence les enchères suivantes.

## Vérification

`node --test tests/mgmtDuo.test.js` puis `npm run check:rapide`. `node tools/_bump.js mgmt-duo.js mgmt-recrutement.js mgmt-save.js`,
`node tools/verif-versions.js origin/main`.

## Hors périmètre

Le débauchage d'un combattant sous contrat chez l'autre joueur (idée en attente, brief §6). Les enchères sous pli.

## Pièges

- `mgmtRecrutables` lit `G.mgmt` indirectement (classement) : appelle-le avec `G.mgmt===m`.
- Un combattant libre peut avoir été signé par une organisation entre deux soirées : `mgmtDuoTransferer` revérifie tout.
- La caisse de J2 est `m.orgs[m.duo.b].treasury` : ne débite jamais `m.treasury` pour J2.
