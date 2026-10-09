# Monde lot 2 T1 — La fiche d'identité

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites` — conforme).

## Objectif

Rendre les huit fiches d'identité accessibles au jeu par une fonction d'accès, et vérifier
qu'elles sont complètes et que celle de Split ne fait que reprendre le contexte d'Anthony.

Brief : « **T1 — La fiche d'identité.** Pour chaque organisation : ville et pays, année de
création, réputation en une phrase, la blessure de son histoire, son organisation rivale, le
nom de ses soirées, ses salles, son adjointe (Leïla n'existe qu'à Split), et son prédécesseur :
son nom, la raison de son départ, où il travaille aujourd'hui. Écrite par Claude Code, marquée
`relu:false`. Pour Split, elle reprend ton contexte sans le réécrire. »

## Ce qui existe

- `mgmt-organisations-identites-data.js` — `MGMT_ORG_IDENTITES`, 8 entrées par id
  (commit `95e1fd0`, données pures). Champs : `ville`, `pays`, `annee`, `reputation`,
  `blessure`, `rivale`, `soirees`, `villesSalles` (null → `MGMT_SALLES_VILLES`),
  `adjointe{prenom,nom,age,parcours,voix,exemples}`, `predecesseur{prenom,nom,depart,posteActuel}`,
  `main{titres,jeunes,noms,contrats}`, `paysPoids` (null → `MGMT_PAYS_POIDS.split`),
  `relu:false`. Split seul porte `aConfirmer:['ville','annee','rivale']`.
- `mgmt-organisations.js:12` — porte `mgmtOrgParId(id)` : même modèle d'accès par id.
- `mgmt-organisations-data.js:17` — `MGMT_ORGANISATIONS`, 8 entrées, mêmes id.
- `mgmt-humanite-data.js:192` — `MGMT_PAYS_POIDS` ({split, monde}, sommes 100).
- `mgmt-salles.js:15` — `MGMT_SALLES_VILLES` (20 villes).
- `tests/mgmtOrganisations.test.js` — porte pour la structure des tests
  (node:test, assert strict, `newGameWindow`, `result(win,code)`).
- `tests/helpers/loadGame.js` — harnais : `newGameWindow()` charge les `<script>` d'index.html.
- `docs/SPLIT-CONTEXTE-DEPART.md` + `docs/SPLIT-CONTEXTE-COMPLEMENT.md` — le contexte de Split.

## Ce qui change

### `mgmt-organisations.js`

S'ajoute, ancre `MGMT_MONDE_LOT2_IDENTITES_FONCTIONS` (référence : Monde lot 2 T1) :

```js
/** L'identité d'une organisation, valeurs null résolues (villesSalles → MGMT_SALLES_VILLES,
 *  paysPoids → MGMT_PAYS_POIDS.split). Pur.
 *  @param {string} id — id d'organisation (celui de MGMT_ORGANISATIONS)
 *  @returns {object|null} l'identité résolue, null si id inconnu */
function mgmtOrgIdentite(id){
  const it=MGMT_ORG_IDENTITES[id];
  if(!it) return null;
  return Object.assign({},it,{
    villesSalles:it.villesSalles||MGMT_SALLES_VILLES,
    paysPoids:it.paysPoids||MGMT_PAYS_POIDS.split,
  });
}
```

### `tests/mgmtIdentites.test.js`

Nouveau. Voir les tests ci-dessous.

## Sauvegarde

Non. Les identités sont des données de code, pas de partie. Aucune migration,
aucune montée de `MGMT_SAVE_VERSION` (valeur actuelle : 14, `mgmt-bureau.js:81`).

## Textes

Aucun. Les huit fiches sont déjà écrites (commit `95e1fd0`, tous `relu:false`).
`@ecrivain` n'est pas appelé dans cette tranche.

## Écran

Aucun. L'écran « Nouvelle partie » est la tranche T5.

## Tests

Fichier : `tests/mgmtIdentites.test.js`.
Porte : `tests/mgmtOrganisations.test.js` (structure) et `tests/mgmtHumaniteData.test.js`
(vérification de données avec `fs.readFileSync`).

1. **« Identités — chaque fiche a tous ses champs, aucune organisation n'est sa propre
   rivale »** *(brief)*
   - `Object.keys(MGMT_ORG_IDENTITES).length === 8`
   - chaque entrée porte les clés `ville, pays, annee, reputation, blessure, rivale, soirees,
     villesSalles, adjointe, predecesseur, main, paysPoids, relu`
   - chaque `adjointe` porte `prenom, nom, parcours, voix` ; chaque `predecesseur` porte
     `prenom, nom, depart, posteActuel` ; chaque `main` porte `titres, jeunes, noms, contrats`
   - pour chaque entrée : `rivale !== id`, et `rivale` est une clé de `MGMT_ORG_IDENTITES`

2. **« Identités — les ids sont ceux des huit organisations du profil »**
   - `Object.keys(MGMT_ORG_IDENTITES).sort()` est égal à
     `MGMT_ORGANISATIONS.map(o=>o.id).sort()`

3. **« Identités — Leïla n'existe qu'à Split »** *(piège du plan)*
   - exactement une entrée dont `adjointe.prenom === 'Leïla'`, et sa clé est `'split'`

4. **« Identités — les réglages de la main sont dans les quatre énumérations »**
   - `titres` ∈ {`souvent`, `normal`, `rarement`}
   - `jeunes` ∈ {`fait-monter`, `equilibre`, `protege-anciens`}
   - `noms` ∈ {`souvent`, `parfois`, `jamais`}
   - `contrats` ∈ {`garde`, `normal`, `laisse-filer`}

5. **« Identités — les mélanges de pays sont valides »**
   - chaque `paysPoids` non-null : somme des poids = 100, chaque clé ∈ `COUNTRY_KEYS`
   - `MGMT_ORG_IDENTITES.split.paysPoids === null` (le défaut est résolu par `mgmtOrgIdentite`)

6. **« Identités — mgmtOrgIdentite résout les nulls et refuse un id inconnu »**
   - `mgmtOrgIdentite('split').villesSalles === MGMT_SALLES_VILLES` (null résolu)
   - `mgmtOrgIdentite('split').paysPoids === MGMT_PAYS_POIDS.split` (null résolu)
   - `mgmtOrgIdentite('garden-of-blood').paysPoids.US === 40` (mélange custom conservé)
   - `mgmtOrgIdentite('inconnu') === null`

7. **« Identités — la fiche de Split ne contient aucune phrase absente de son contexte »**
   *(brief)*
   - lit `docs/SPLIT-CONTEXTE-DEPART.md` + `docs/SPLIT-CONTEXTE-COMPLEMENT.md` via
     `fs.readFileSync` (côté Node, pas dans la fenêtre jsdom)
   - normalise les deux côtés : apostrophes (`'`, `'`, `` ` ``) → `'` ; markdown gras/italique
     (`**`, `*`, `__`, `_`) supprimés ; espaces multiples → un ; casse → minuscule ;
     ponctuation finale (`.`, `!`, `?`, `;`, `:`) retirée de la phrase cherchée
   - pour chacune des 6 phrases de `split` (`reputation`, `blessure`, `adjointe.parcours`,
     `adjointe.voix`, `predecesseur.depart`, `predecesseur.posteActuel`) : la phrase normalisée
     est une sous-chaîne du contexte normalisé

## Vérification

```
node --test tests/mgmtIdentites.test.js
```

Pas de mesure (aucune simulation dans cette tranche).
Critère de fin chiffré : **8 organisations, 0 champ manquant, 0 auto-rivale, 6 phrases de
Split retrouvées dans le contexte, 7 tests verts.**

## Hors périmètre

- **T2** (`paysPoids` → `mgmtPaysTire`, `mgmt-bureau.js`) — le mélange de pays par organisation.
- **T3** (`main` → réglages du joueur automatique de `tools/mesure-management.js`).
- **T5** (écran « Nouvelle partie ») et **T6** (`tools/exporter-textes.js`).
- Ne pas modifier `mgmt-organisations-identites-data.js` : les données sont celles du commit
  `95e1fd0`. Si un test échoue sur leur contenu, STOP et question à Anthony.
- Ne pas toucher `mgmt-bureau.js`, `mgmt-save.js`, `mgmt-salles.js`, `mgmt-humanite-data.js`,
  ni aucun écran.

## Pièges

- **Ordre des `<script>`** : `mgmt-organisations-identites-data.js` (index.html:1111) charge
  AVANT `mgmt-organisations.js` (:1112) — la fonction voit `MGMT_ORG_IDENTITES`.
  En revanche `MGMT_PAYS_POIDS` (`mgmt-humanite-data.js`, :1113) et `MGMT_SALLES_VILLES`
  (`mgmt-salles.js`) se chargent APRÈS : la fonction les lit à l'exécution, pas au chargement.
  Ne jamais les évaluer au niveau du module.
- **Test Split, phrases tronquées** : les données commencent les phrases par une majuscule et
  terminent par un point, alors que le contexte les a souvent en milieu de phrase (ex.
  « …carte — sous le nom… »). Sans retrait de la ponctuation finale, la comparaison échoue.
- **Test Split, markdown** : le contexte contient du gras (`**parce qu'ils n'étaient pas
  respectés.**`) qui casse la sous-chaîne. Retirer `**`, `*`, `__`, `_` avant de comparer.
- **`soirees`** (`'Split Fight Night'`) est un nom, pas une phrase : ne pas l'inclure dans le
  test de contexte (le brief dit « aucune phrase absente », pas « aucune valeur »).
- **`MGMT_ORG_IDENTITES`** est un objet plat, pas un tableau : `Object.entries()`, pas `.map()`.
- **Deux mondes dans le test** : les phrases viennent de la fenêtre de jeu (`win.eval` ou
  `result(win, …)`), le contexte du disque (`fs`). Le code de comparaison vit en Node.js.

- **Test Split, citations** (ajout de Claude après relecture) : la phrase de `adjointe.voix`
  est dans une citation du contexte, coupée sur deux lignes dont la seconde commence par `> `.
  La normalisation retire aussi `>` et les espaces en début de chaque ligne, avant de fusionner
  les espaces. Vérifié par Claude : avec ce retrait, les six phrases sont retrouvées.

## Questions pour Anthony

- ~~`soirees:'Split Fight Night'` vient-il d'ailleurs ?~~ Réponse de Claude : oui, c'est le nom
  que le jeu donne déjà aux soirées (`mgmt-calendrier.js:20`, `mgmtOrgNom(m)+' Fight Night '+n`).
  Rien à faire.

## Compte rendu

### Fichiers modifiés

- `mgmt-organisations.js` — nouvelle ancre `MGMT_MONDE_LOT2_IDENTITES_FONCTIONS` (Monde lot 2 T1),
  après les ancres fermées du brief lot 5 : `mgmtOrgIdentite(id)` telle que la fiche la donne,
  code copié verbatim. Les nulls se résolvent à l'exécution (jamais au chargement) :
  `villesSalles` → `MGMT_SALLES_VILLES`, `paysPoids` → `MGMT_PAYS_POIDS.split`.
- `tests/mgmtIdentites.test.js` — nouveau, 7 tests (intitulés de la fiche), porte
  `mgmtOrganisations` (harnais `newGameWindow`/`result`) et `mgmtHumaniteData`
  (vérification de données, comparaisons système/fenêtre).
- `package.json` — `tests/mgmtIdentites.test.js` ajouté après `mgmtOrganisations.test.js`
  dans les scripts `test` et `test:watch`.
- `index.html` — seul `?v=` de `mgmt-organisations.js` monté (b9 → suivant, via `tools/_bump.js`) ;
  aucune balise nouvelle (aucun fichier .js nouveau côté jeu).
- `sw.js` — `SW_VERSION` b66 → b67, monté automatiquement par `tools/_bump.js` à la livraison.

### Tests ajoutés (intitulés)

1. Identités — chaque fiche a tous ses champs, aucune organisation n'est sa propre rivale
2. Identités — les ids sont ceux des huit organisations du profil
3. Identités — Leïla n'existe qu'à Split
4. Identités — les réglages de la main sont dans les quatre énumérations
5. Identités — les mélanges de pays sont valides
6. Identités — mgmtOrgIdentite résout les nulls et refuse un id inconnu
7. Identités — la fiche de Split ne contient aucune phrase absente de son contexte

### Migration de sauvegarde

Aucune (fiche §Sauvegarde) : les identités sont des données de code, `MGMT_SAVE_VERSION`
reste à 14.

### Vérification

- `node --test tests/mgmtIdentites.test.js` : 7 pass.
- `npm run check` (via @verif) : tout vert — 933 tests, 0 échec, lint et lint:content sans
  erreur bloquante.
- `@relecteur` : ACCEPTÉ, premier tour.

### Écarts à la fiche

Aucun. Critère de fin chiffré atteint : 8 organisations, 0 champ manquant, 0 auto-rivale,
6 phrases de Split retrouvées dans le contexte, 7 tests verts.

### Questions pour Anthony

Aucune nouvelle ; la question du commit 95e1fd0 (`soirees`) est déjà close dans la section
précédente.
