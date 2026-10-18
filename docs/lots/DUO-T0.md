# DUO-T0 — deux correctifs du monde vivant (avant tout le reste)

Branche : `mode-duo`. Brief : `docs/BRIEF-18-10-MODE-DUO.md` §4. Commit : `Duo T0 : le monde vivant continue après sa première soirée, et la sauvegarde n'écrit plus une autre organisation`.
Aucun écran, aucun texte, version de sauvegarde inchangée.

## Défaut 1 — les sept organisations ne jouent qu'une soirée

**Où** : `mgmtMondeVivantSemaine(m)`, `mgmt-passe.js` (ancre `MONDE_LOT9_T2B_SEMAINE`, vers la ligne 345).

**Cause** : la fonction saute une organisation qui n'a pas de soirée posée (`if(!prochaine||…) continue;`). Or
`mgmtPredecesseurSoiree` (`mgmt-predecesseur.js`) ne pose la soirée suivante (`mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite')`)
qu'au moment de la jouer. Après sa première soirée (celle que `mgmtPasseCloturer` avait posée au jour 35), une organisation
n'a donc plus jamais de soirée posée, et ne joue plus.

**Correctif (exact)** : le jour de la prochaine soirée d'une organisation est celui de sa soirée posée, **sinon**
`sous.cal.jour + MGMT_EVENT_WEEKS*7` (le jour où son prédécesseur la poserait). Elle joue si ce jour est `<= m.cal.jour`.
Le reste de la fonction ne change pas : même graine par organisation et par cycle, au plus une soirée par organisation à
chaque ouverture de cycle de la partie du joueur, `mgmtMondeVivantAlleger` après.

```js
const sous=m.orgs[orgId], p=sous&&sous.cal&&Array.isArray(sous.cal.prochaines)?sous.cal.prochaines[0]:null;
const jour=p&&Number.isFinite(p.jour)?p.jour:(sous&&sous.cal&&Number.isFinite(sous.cal.jour)?sous.cal.jour+MGMT_EVENT_WEEKS*7:Infinity);
if(jour>m.cal.jour) continue;
```

**Mesuré par Claude (18/10, graine 20261015, passé de 6 soirées)** : après 6 soirées de Split, MMA Korner passe de 1 soirée
jouée (cycle 8, jour 35) à 6 (cycle 13, jour 210, le même que Split).

## Défaut 2 — `saveMgmt` écrit la sous-partie d'une autre organisation

**Où** : `saveMgmt()`, `mgmt-save.js` (vers la ligne 813).

**Cause** : pendant `mgmtMondeVivantSemaine`, `G.mgmt` vaut la sous-partie d'une organisation ; sa soirée passe par
`mgmtAgendaJouer` → `mgmtRunEvent` → `saveMgmt()`, qui écrit `G.mgmt` dans l'emplacement du joueur. Mesuré : l'emplacement
passe de « Split » (avec `orgs`) à « Undisputed Cage » (sans `orgs`) après une seule soirée de Split.

**Correctif (exact)** : une sous-partie d'organisation vivante porte toujours `idPrefixe` (posé par
`mgmtMondeVivantPrefixer`), la partie du joueur jamais. En tête de `saveMgmt`, après le test du passé en cours :

```js
/* Duo T0 : une organisation vivante ne s'écrit jamais à la place de la partie du joueur (elle s'écrit DANS m.orgs, avec elle). */
if(G.mgmt.idPrefixe!==undefined) return true;
```

Vérifie avant de coder qu'aucun autre endroit ne pose `idPrefixe` sur la partie du joueur (`grep -n "idPrefixe" *.js`).

## Tests — nouveau fichier `tests/mgmtDuoMonde.test.js` (à ajouter dans `test` ET `test:watch` de `package.json`)

Création courte comme `tests/mgmtMondeVivant.test.js` : `setSeed(20261015); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});`

- `Duo T0 — les sept organisations continuent de jouer leurs soirées` : après 6 appels
  `mgmtPredecesseurSoiree(G.mgmt,G.mgmt.eventsPlayed,mgmtPredecesseurReglages('split'))`, chaque `m.orgs[id].eventsPlayed`
  a augmenté de 6 et `m.orgs[id].cycle === G.mgmt.cycle`.
- `Duo T0 — l'emplacement garde la partie du joueur après une soirée` : `saveMgmt()`, une soirée comme ci-dessus, puis
  `mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)))` a `org==='Split'` et des `orgs`.
- `Duo T0 — même graine, même monde` : deux fenêtres, même création, mêmes 3 soirées → `mgmtSerialiser(G.mgmt)` identique.

## Tests existants qui peuvent changer (décision à citer : Duo T0, défaut 1)

Tout test qui joue plusieurs soirées avec `mondeVivant` et compare une empreinte ou un état des sept organisations
(cherche `mondeVivant` et `m.orgs` dans `tests/`). Une empreinte ne se recalcule que si **seules** les sous-parties
diffèrent : la partie du joueur, ses tirages et ses combats doivent rester identiques — vérifie-le en comparant
`mgmtSerialiser` sans `orgs` avant et après. Si la partie du joueur change, arrête-toi et écris pourquoi.

## Vérification

`node --test tests/mgmtDuoMonde.test.js tests/mgmtMondeVivant.test.js tests/mgmtNiveauxOrg.test.js tests/mgmtMondeVitesse.test.js`,
puis `npm run check:rapide`. `node tools/_bump.js mgmt-passe.js mgmt-save.js`, `node tools/verif-versions.js origin/main`.

**Mesure à consigner dans le compte rendu (ne bloque pas la tranche)** : `node tools/mesure-management.js --creation --semaine --graine 20261008`
avant et après (environ 4 minutes chacune). Le monde qui vit vraiment coûte plus cher : sur la machine de Claude, 6 soirées de Split passent de
5,8 s à 22 s. Le seuil de la semaine (≤ 5 s) est une décision d'Anthony : donne les deux chiffres, ne l'optimise pas ici.

## Hors périmètre

Optimiser la vitesse du monde. Toucher `mgmtPredecesseurSoiree`. Tout ce qui est Duo.

## Pièges

- La graine par organisation (`mgmtIdentiteStream(orgId,'semaine|'+m.cycle,m)`) ne change pas : seul le test de date change.
- `G.mgmt` et `SEED` sont rendus dans le `finally` existant : ne déplace pas ce bloc.
- Ne remplace pas le garde du défaut 2 par un drapeau global : un drapeau oublié à `true` couperait toute sauvegarde.
