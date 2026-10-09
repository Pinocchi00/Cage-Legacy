# Monde lot 2 T2 — D'où viennent les combattants

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites` — conforme).

## Objectif

Que les combattants de chaque organisation soient tirés avec le mélange de pays de son identité
(`paysPoids`), et non plus avec le mélange de Split en dur. Brief : « **T2 — D'où viennent les
combattants.** Chaque organisation a son propre mélange de pays, cohérent avec sa ville. » Constat
corrigé : « Les combattants de toutes les organisations sont tirés avec les pays de Split
(`mgmtPaysTire(rnd(),'split')`, `mgmt-bureau.js`). Huit organisations, un seul mélange de
nationalités. »

## Ce qui existe

- `mgmt-organisations-identites-data.js` — `paysPoids` déjà écrit pour les huit (commit `95e1fd0`,
  données de T1, jamais modifiées) : `split`→`null` ; dominants des sept autres : `garden-of-blood`
  US:40, `mma-korner` NL:30, `ultimate-rim` AU:38, `fighting-pacific-championship` JP:40, `organisation-6`
  GB:35, `organisation-7` US:15, `organisation-8` BR:42.
- `mgmt-organisations.js:128` — porte `mgmtOrgIdentite(id)` (T1) : résout `paysPoids:null` →
  `MGMT_PAYS_POIDS.split`, conserve les custom (même référence). `:11/17/23` — porte de résolution
  `mgmtOrgParNom`, `mgmtOrgNom(m)` (m.org est un NOM, repli `MGMT_ORG`), `mgmtOrgProfil(m)`.
- `mgmt-humanite-data.js:192` — `MGMT_PAYS_POIDS` ({split, monde}, sommes 100) ; `:198` —
  `mgmtPaysTire(u,loi)`, `loi ∈ {'split'|'monde'}` aujourd'hui ; `engine.js:337` — `COUNTRY_KEYS`
  (30 pays), `COUNTRIES[ck].name` = nom français.
- `mgmt-bureau.js:144` — `mgmtNewRoster(m)` : `:150` `mgmtOrgProfil(m)` ; `:167` et `:174`
  `mgmtPaysTire(rnd(),'split')`, les deux seuls endroits à changer. Portes de tests :
  `tests/mgmtHumanite.test.js:170` (balayage de u), `tests/mgmtIdentites.test.js` (harnais).

## Ce qui change

- **`mgmt-humanite-data.js`** — `mgmtPaysTire` (:198) accepte aussi un mélange de poids lui-même :
  corps inchangé sauf `const poids=typeof melange==='string'?MGMT_PAYS_POIDS[melange]:melange;`.
  Les appelants en chaîne (`mgmt-monde.js:91`, tests H3) ne bougent pas. JSDoc et signature
  remplacés par :

```js
/** Tirage pondéré : un seul tirage u dans [0,1), ordre stable de COUNTRY_KEYS.
 *  @param {number} u
 *  @param {'split'|'monde'|Object<string,number>} melange — loi de MGMT_PAYS_POIDS ou mélange de
 *    poids lui-même (paysPoids d'une organisation, Monde lot 2 T2)
 *  @returns {string} la clé de pays tirée */
function mgmtPaysTire(u,melange){
```

- **`mgmt-organisations.js`** — après l'ancre `MGMT_MONDE_LOT2_IDENTITES_FONCTIONS`, nouvelle
  ancre `MGMT_MONDE_LOT2_PAYS_FONCTIONS` (référence : Monde lot 2 T2) :

```js
/** Le mélange de pays de l'organisation jouée : paysPoids de son identité (null résolu en
 *  MGMT_PAYS_POIDS.split par mgmtOrgIdentite). Pur.
 *  @param {object} [m] — la partie (à défaut la partie en cours, comme mgmtOrgNom)
 *  @returns {Object<string,number>} les poids par clé de pays, somme 100 */
function mgmtOrgPaysPoids(m){
  const o=mgmtOrgParNom(mgmtOrgNom(m));
  return (o&&mgmtOrgIdentite(o.id).paysPoids)||MGMT_PAYS_POIDS.split;
}
```

- **`mgmt-bureau.js`** — dans `mgmtNewRoster` : après `:150`, `const paysPoids=mgmtOrgPaysPoids(m);`
  ; `:167` et `:174` deviennent `mgmtPaysTire(rnd(),paysPoids)` ; commentaire `:165` → « Monde lot
  2 T2 : un tirage pondéré au mélange de pays de l'organisation (paysPoids de son identité) par
  emplacement ; le retirage du prénom rejoue le même pays ».
- **`tests/mgmtPaysOrganisations.test.js`** — nouveau (tests ci-dessous), ajouté après
  `tests/mgmtIdentites.test.js` dans les scripts `test` et `test:watch` de `package.json` (pas
  `test:ceintures`). `?v=` montés par `tools/_bump.js` (`mgmt-humanite-data.js`,
  `mgmt-organisations.js`, `mgmt-bureau.js`) ; `sw.js` suit.

## Sauvegarde

Non. `ck` existe déjà sur chaque combattant ; aucun champ nouveau, aucune régénération de roster. `MGMT_SAVE_VERSION` reste à 14 (`mgmt-bureau.js:81`).

## Textes

Aucun. `@ecrivain` n'est pas appelé dans cette tranche.

## Écran

Aucun.

## Tests

Fichier : `tests/mgmtPaysOrganisations.test.js`. Portes : `tests/mgmtHumanite.test.js`,
`tests/mgmtIdentites.test.js`.

1. **« Pays — le mélange de pays de deux organisations n'est pas le même »** *(brief)*
   - les huit `paysPoids` résolus (`mgmtOrgIdentite(id).paysPoids`) sont deux à deux différents ;
   - graine `setSeed(4242)` avant chaque roster ; `split`, `fighting-pacific-championship`,
     `organisation-8` ; `mgmtDefault(id)` puis `mgmtNewRoster(m)` ; histogramme de `f.ck` en parts :
     le pays de plus gros poids en tête (FR, JP, BR), sa part ≥ 0,20, chaque paire différant
     d'au moins 0,10 sur un pays.
2. **« Pays — mgmtPaysTire tire avec le mélange donné, jamais un pays qui n'y figure pas »**
   - balayage `u=(i+0.5)/2000`, mélange = `mgmtOrgPaysPoids` de garden-of-blood : pour chaque clé, `compte/20` à ±0,5 du poids (les poids somment 100) ;
   - `TH` (absent du mélange de garden-of-blood) : 0 tirage sur 2000 ; les 2000 tirages avec
     `'split'` et avec `MGMT_PAYS_POIDS.split` sont identiques un à un.
3. **« Pays — mgmtOrgPaysPoids donne le mélange de l'organisation jouée »**
   - `mgmtOrgPaysPoids(mgmtDefault()) === MGMT_PAYS_POIDS.split` ; `mgmtOrgPaysPoids(mgmtDefault('garden-of-blood')) === MGMT_ORG_IDENTITES['garden-of-blood'].paysPoids`
     (égalité de référence : l'identité ne copie pas `paysPoids`) ;
   - `mgmtOrgPaysPoids({org:'Bidule'}) === MGMT_PAYS_POIDS.split` (repli de `mgmtOrgNom`) ;
   - `G={mgmt:mGoB}` puis `mgmtOrgPaysPoids()` sans argument : mélange de garden-of-blood.
4. **« Pays — chaque mélange est cohérent avec la ville de l'organisation »**
   - pour chaque entrée : `ckLocal=COUNTRY_KEYS.find(k=>COUNTRIES[k].name===it.pays)` ; une seule
     identité sans `ckLocal` : `organisation-7` (« Émirats arabes unis » absent de `COUNTRY_KEYS`) ;
     pour les sept autres, `ckLocal` est la clé de plus gros poids, strictement devant la seconde.

Les autres tests du brief sont à d'autres tranches : « deux archives qui diffèrent » (T3/T4) ; « chaque fiche a tous ses champs » et « la fiche de Split… » sont les tests 1 et 7 de T1.

## Vérification

`node --test tests/mgmtPaysOrganisations.test.js`. Pas de mesure. Critère de fin chiffré : **4 tests
verts, 8 mélanges résolus distincts, 7 cohérences ville → pays dominant sur 7, 3 rosters aux
dominants FR/JP/BR, 0 pays hors mélange sur 2000 tirages.** Puis `npm run check`, par `@verif`.

## Hors périmètre

- `mgmt-monde.js` : le vivier extérieur garde la loi `'monde'` (`:91`) — c'est le monde, pas une
  organisation. `engine.js` (`makeFighter`, uniforme — carrière), `mgmt-anciens.js`, `mgmt-camps.js`
  : pas les combattants d'effectif.
- `mgmt-organisations-identites-data.js` : `paysPoids` du commit `95e1fd0`, jamais modifié. Si un
  test échoue sur leur contenu : STOP et question à Anthony. T3 (`main`), T5 (écran), T6 (export).
- Aucun test existant ne se modifie : ni intitulé, ni graine, ni assertion.

## Pièges

- **Sept rosters qui bougent** : les tests seedés des huit organisations explorent d'autres
  effectifs pour les sept non-Split (`tests/mgmtCorrectionsLot12.test.js` « Aucune organisation
  n'est injouable » et le test des bourses, `tests/mgmtEffectif30.test.js`). Ils doivent passer
  **sans modification** ; si l'un échoue, STOP et compte rendu — pas d'assertion affaiblie.
- **Split inchangé** : `paysPoids:null` → `MGMT_PAYS_POIDS.split`, donc `mgmtPaysTire(u,'split')`
  et `mgmtPaysTire(u,mgmtOrgPaysPoids(mSplit))` donnent le même pays pour tout u : rosters seedés de
  Split et test H3 inchangés — le garant de non-régression.
- **Les deux tirages de `mgmtNewRoster`** (`:167` et le re-tirage `:174`) reçoivent le même
  `paysPoids` : oublier le second laisse les noms épuisés retomber sur Split.
- **`m.org` est un nom, pas un id** : `mgmtOrgNom`/`mgmtOrgParNom` (patron de `mgmtOrgProfil`,
  `:150`), jamais `mgmtOrgIdentite(m.org)`.
- **Ordre des `<script>`** : identites-data (index.html:1111) → organisations (:1112) → humanite-data
  (:1113) → bureau (:1119) ; `MGMT_PAYS_POIDS` et `COUNTRY_KEYS` se lisent à l'exécution.
- **`mgmtPaysTire` suppose une somme de 100** (`t=u*100`) : garantie par le test T1 — ne pas
  normaliser. JSDoc périmé de `mgmtNewRoster` (« les 30 origines sont couvertes avant toute
  répétition ») : faux depuis le lot 5 H3, tirage avec remise.

## Questions pour Anthony

- Le vivier extérieur garde le mélange du monde : une recrue venue d'ailleurs ne porte pas la
  nationalité de la ville. Cohérent pour moi (c'est « le monde »), mais le recrutement du lot 9
  voudra peut-être orienter ce vivier — à trancher alors, pas ici.
- Les sept mélanges `paysPoids` (écrits par Claude au commit `95e1fd0`) les voit-on validés par toi
  comme le reste des fiches, ou veux-tu les relire avant la fusion du lot 2 ?
