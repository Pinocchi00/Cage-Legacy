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

## Compte rendu

**Branche** `monde-lot-2-identites`. **Tranche inachevée à l'arrêt demandé : 3 tests verts sur 4,
1 test casse le garde `tests/mgmtEffectif30.test.js` exigé vert.** Voir ci-dessous l'analyse.

### Fichiers modifiés et rôle

- `mgmt-humanite-data.js` — `mgmtPaysTire(u,melange)` : la signature/JSDoc de la fiche
  (loi `'split'|'monde'` **ou** mélange de poids lui-même), corps inchangé
  (`const poids=typeof melange==='string'?MGMT_PAYS_POIDS[melange]:melange;`). `?v=` bumpé
  (`lot5h3bxx`).
- `mgmt-organisations.js` — ancre `MGMT_MONDE_LOT2_PAYS_FONCTIONS` (Monde lot 2 T2) après
  l'ancre T1, avec `mgmtOrgPaysPoids(m)` tel que la fiche le donne (résolution via
  `mgmtOrgNom`/`mgmtOrgParNom`/`mgmtOrgIdentite`, repli `MGMT_PAYS_POIDS.split`). `?v=` bumpé
  (`b9xx`).
- `mgmt-bureau.js` — `mgmtNewRoster` : `const paysPoids=mgmtOrgPaysPoids(m);` après le profil ;
  les **deux** tirages (`:169` et le re-tirage `:176`) reçoivent `paysPoids` ; commentaire
  remplacé par la formulation de la fiche (le JSDoc périmé « 30 origines » reste en l'état comme
  le veut la tranche : seul le commentaire `:165` change). `?v=` bumpé (`b42xx`), `sw.js` suit
  (SW_VERSION `b71`).
- `package.json` — `tests/mgmtPaysOrganisations.test.js` ajouté après `tests/mgmtIdentites.test.js`
  dans `test` et `test:watch` uniquement (`test:ceintures` pas touché).
- `tests/mgmtPaysOrganisations.test.js` — nouveau, les 4 tests de la fiche, intitulés exacts,
  jamais modifié par rapport à ce que la fiche impose.
- Aucun texte (`@ecrivain` non appelé), aucun écran, `MGMT_SAVE_VERSION` reste 14 : aucune
  migration (aucun champ nouveau, aucun roster régénéré).

### Tests ajoutés (intitulés)

1. « Pays — le mélange de pays de deux organisations n'est pas le même » **— ÉCHOUANT en état**
   (voir bloquant).
2. « Pays — mgmtPaysTire tire avec le mélange donné, jamais un pays qui n'y figure pas » ✔
3. « Pays — mgmtOrgPaysPoids donne le mélange de l'organisation jouée » ✔
4. « Pays — chaque mélange est cohérent avec la ville de l'organisation » ✔
   (8 mélanges résolus distincts ✔, cohérences ville → pays dominant : 7/7 ✔ uniquement
   parce que les échecs du test 1 ne sélectionnent pas leurs assertions frères ; les tests 2-4
   balayent les 2000 u : 0 pays hors mélange ✔.)

Gardes exigés verts par la fiche, vérifiés **sans modification** :
`tests/mgmtIdentites.test.js` 7/7 ✔, `tests/mgmtHumanite.test.js` 11/11 ✔ (Split inchangé,
`mgmtPaysTire(u,'split')` ≡ `mgmtPaysTire(u,MGMT_PAYS_POIDS.split)` un à un),
`tests/mgmtCorrectionsLot12.test.js` 4/4 ✔ (« Aucune organisation n'est injouable » compris).
`tests/mgmtEffectif30.test.js` **ÉCHOUANT** (voir bloquant) ; vérifié qu'il passait **avant**
les modifications T2 (stash/diff : 3/3 verts sur HEAD).

### Bloquant (STOP prévu par la fiche, question à Anthony)

Le test 1 exige, à graine 4242, la part du pays dominant du mélange ≥ 0,20 pour trois rosters :
Split (FR 37) ✔ 36,2 % ; fighting-pacific-championship (JP 40) ✖ **14,6 %** ; organisation-8
(BR 42) ✖ **14,8 %**. Le tirage pondéré lui-même est exact (500 tirages nus au même `rnd()` :
JP sortait à 42 % pour un poids de 40 — mesuré par sonde, `tools/reports/`, jamais commitée).
L'écart vient du refus des noms répétés dans `mgmtNewRoster` : un pays dominant demande
~140-150 combattants sur un effectif de ~360, mais le plafond de répétitions de prénom
(`MGMT_PRENOMS_REPETES_PART=0.012` → ~4 doublons tolérés par roster, commentaire du code
périmé qui dit « 2 % », ligne 136 de `mgmt-bureau.js`) limite un pays à
**~(prénoms distincts de son catalogue) + 4 + les doublons forcés à la garde 400** ≈ 13-15 %.
Le catalogue FR a été étendu en place par `engine.js:334-336` (123 prénoms, ~250 familles),
d'où FR à 36 % chez Split qui masque le phénomène ; JP (37 prénoms) et BR (43) franchissent
le plafond à ~13-14 %.

Conséquence en chaîne : le garde `tests/mgmtEffectif30.test.js` (« ≥ 98 % de prénoms et de noms
de famille distincts », demande d'Anthony du 08/10) passe avant T2 (tout le monde à Split, aucun
pays dominant au-delà du plafond FR) et casse dès que les sept mélanges concentraient leurs
tirages : à graine 508, garden-of-blood passe de … à 95-97 % de prénoms distincts (les pays
dominants US/JP/BR/GB demandent plus de slots que leurs catalogues). Ce n'est PAS un bug de la
tranche : c'est une **contradiction entre la demande du 08/10 (≥ 98 % distinct) et le brief du
09/10 (mélange dominant 35-42 % par organisation)**, au vu des catalogues de prénoms actuels.

Ce que j'ai essayé avant de m'arrêter : mesure par sondes (tirage nu, parts des trois rosters,
valeur réelle de `MGMT_PRENOMS_REPETES_PART`, catalogues exacts de JP/BR/FR, états HEAD vs
modifié pour `mgmtEffectif30`). Aucune voie conforme n'existe dans le périmètre (le test 1 et
l'assertion viennent de la fiche et ne se modifient pas ; `paysPoids` « jamais modifié » ;
`MGMT_PRENOMS_REPETES_PART` et les catalogues de prénoms hors périmètre). J'ai refusé les trois
tentations : affaiblir l'assertion du test 1, modifier `mgmtEffectif30`, retoucher les `paysPoids`.

Le code livré implémente correctement la mécanique demandée (tests 2-4, gardes Split/Identités
verts, Lot12 vert) ; c'est le seuil du test 1 et le garde du 08/10 qui exigent un arbitrage d'Anthony.

### Écart à la fiche

- Le critère de fin chiffré (« 4 tests verts ») manque : bloquant ci-dessus.
- Fait exactement : les sept autres points de « Ce qui change » (signature de `mgmtPaysTire`,
  `mgmtOrgPaysPoids` sous la nouvelle ancre, les deux tirages de `mgmtNewRoster`, commentaire
  `:165`/`:167`, test ajouté dans `package.json`, `?v=` bumpés, `sw.js` suit, migration non
  applicable).

### Questions pour Anthony (nouvelles)

1. **Arbitrage 08/10 ⟷ 09/10.** Le test `tests/mgmtEffectif30.test.js` (≥ 98 % de prénoms et de
   noms de famille distincts par organisation) est-il périmé depuis le brief « Un monde qui a
   vécu » (les organisations ont des populations nationales concentrées, leurs noms se
   répètent mécaniquement davantage) ? Si oui : quel seuil ? Si non : faut-il inversement élargir
   les `paysPoids` des sept (moins de concentration, pays dominants sous 20 %) ou élargir les
   catalogues de noms des pays dominants (JP/BR/US…) — deux données marquées hors périmètre ici ?
2. **Seuil du test 1.** La part ≥ 0,20 du pays dominant a été calibrée en pensant qu'elle suivait
   le poids (40 %). Franchir 0,20 exige que les capacités du pays à ~360 combattants
   (≈ 1,5 × les catalogues, ou des doublons de prénoms ouverts) passent avant : quelle barre
   veux-tu (0,20 tient pour FR/Split, pas pour JP/BR/US/…) ?
3. Les questions reprises ci-dessus depuis la fiche (vivier `'monde'`, validation des sept
   `paysPoids` de `95e1fd0`) restent posées.


## Décision de Claude après le blocage (10/10/2026) — la tranche reprend

Le blocage est réel et bien mesuré. Il n'y a pas de contradiction à arbitrer : la règle du 08/10 (98 % de noms
distincts) et les mélanges du brief tiennent ensemble **si les catalogues de noms suivent**, exactement comme
la France a été agrandie le 08/10 (`engine.js`, sous `COUNTRIES` : 267 noms, 109 prénoms, 74 prénoms féminins
pour 37 % d'un effectif de 360). Aucun test n'est assoupli, aucun plafond n'est relevé.

**Ce qui s'ajoute à la tranche :**

1. **Mesurer le besoin.** Pour chaque pays et chaque organisation : combattants attendus = poids du pays ÷ 100
   × effectif de l'organisation (profil compris). Retenir, par pays, le plus grand besoin des huit
   organisations. Cibles, sur le modèle de la France : noms de famille ≥ 2 × le besoin ; prénoms masculins
   ≥ 0,8 × le besoin ; prénoms féminins ≥ 0,55 × le besoin. Écrire le tableau (pays, besoin, tailles actuelles,
   manque) dans le compte rendu.
2. **Agrandir les catalogues** des pays en manque — d'abord les six pays dominants (US, NL, AU, JP, GB, BR),
   puis tout pays dont le besoin dépasse son catalogue (BE, IE, KR, RU, DAG, CN, MA… selon le tableau).
   Les listes sont demandées à `@ecrivain`, pays par pays, avec les nombres exacts du tableau : prénoms et
   noms **courants et réels** du pays, en écriture latine, sans doublon avec la liste existante du même pays,
   sans nom de combattant ou de célébrité reconnaissable (prénom et nom ne sont jamais fournis en paire).
   Forme : la même que pour la France (`COUNTRIES.XX.last.push(…)`, `.first.push(…)`, `.firstF.push(…)`),
   sous un commentaire « Monde lot 2 T2 … propositions de Claude (à relire) ».
3. **Si un test existant casse parce que des tirages de noms changent** (carrière, duel, graines figées) : on ne
   touche pas au test. Les noms ajoutés vont alors dans un catalogue propre au management
   (`mgmt-humanite-data.js`, lu par `mgmtNewRoster` seulement), et `COUNTRIES` reste comme avant.
4. **Tests** : le test 1 de la fiche reste tel quel (part du pays dominant ≥ 0,20 à graine 4242). S'ajoute, dans
   `tests/mgmtPaysOrganisations.test.js` :
   `Pays — les huit organisations gardent 98 % de prénoms et de noms distincts avec leur propre mélange` —
   graines 508 et 4242, pour chacune des huit organisations : prénoms distincts ≥ 98 % et noms de famille
   distincts ≥ 98 % (même mesure que `tests/mgmtEffectif30.test.js`), et part du pays dominant ≥ 0,25.
   `tests/mgmtEffectif30.test.js` doit repasser sans modification.
5. Le commentaire périmé « 2 % » de `mgmt-bureau.js` (la constante vaut 0,012) est corrigé au passage.

Les trois questions du codeur sont closes par cette décision. Commit final : `Monde lot 2 T2 : d'où viennent les combattants`.
