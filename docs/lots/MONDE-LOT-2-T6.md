# Monde lot 2 T6 — L'export des textes

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites` — conforme).

## Objectif

Que `node tools/exporter-textes.js` écrive dans `docs/TEXTES-A-RELIRE.md` les huit fiches d'identité, une
organisation par bloc, un texte par ligne avec sa situation.

Brief : « **T6 — L'export des textes.** `tools/exporter-textes.js` inclut ces fiches, pour que tu puisses les
relire d'un bloc. »

## Ce qui existe

- `tools/exporter-textes.js` (54 lignes). Il charge le jeu dans jsdom (`newGameWindow({runMain:false})`, `:24`),
  puis pour chaque famille de `FAMILLES` (`:16-23`, paires `[titre, fichier]`) appelle `lire(fichier)` (`:25`).
  `lire` lit le **fichier source**, relève ses `const NOM_MAJUSCULE=` de premier niveau (`:27`), évalue chacune dans la
  fenêtre et marche dans l'objet : un objet `relu:false` n'est gardé que s'il porte une clé texte parmi
  `texte, libelle, nom, surnom, titre, t` (`:30`). Il rend `[{chemin,t,situation}]`.
- Sortie (`:43-49`) : `## titre — N textes`, `Fichier : \`f\``, puis une ligne par texte :
  ``- [ ] `chemin` (situation) : texte``. Le total va dans le titre du fichier (`:50`).
- `:14` `DEJA` = les cinq familles nommées. `:15` `AUTRES` = tout autre `.js` de la racine qui porte `relu:false`
  (regex `/relus*:s*false/` : elle ne reconnaît que `relu:false` sans espace, ce qui suffit ici).
- **État mesuré le 10/10/2026** (sortie vers un fichier temporaire) : 1801 textes. Le fichier
  `mgmt-organisations-identites-data.js` sort dans `AUTRES` avec **0 texte**, car ses entrées (`MGMT_ORG_IDENTITES`,
  8 clés par id) n'ont aucune clé texte au bon niveau. Même `mgmt-organisations-data.js` sort avec 8 « textes » (les noms) :
  hors périmètre, on n'y touche pas.
- `MGMT_ORG_IDENTITES` (`mgmt-organisations-identites-data.js:22`) : par id, `relu:false`, `ville, pays, annee,
  reputation, blessure`, `adjointe{prenom,nom,parcours,voix,exemples}`, `predecesseur{prenom,nom,depart,posteActuel}`.
  Split : `adjointe.exemples` vaut `null` (Leïla). Les sept autres : 3 exemples. `main`, `paysPoids`, `villesSalles`,
  `rivale`, `soirees` ne sont pas des textes à relire.
- `tests/outillage.test.js:37` — test « 7.3 » : lance l'outil vers `os.tmpdir()` (`execFileSync`, `timeout:120000`).
  `tests/mgmtTextesDemo.test.js:11` exige que chaque fichier `.js` portant `relu:false` soit cité en
  `` `fichier.js` `` dans l'export.

## Ce qui change

### `tools/exporter-textes.js`

1. `:14` — ajouter `'mgmt-organisations-identites-data.js'` à `DEJA` : il ne sort plus dans « Écrans et mécanismes ».
2. `:16-23` — ajouter, après l'entrée « Combat » et avant `...AUTRES` :
   `['Fiches d’identité des huit organisations (Monde lot 2)', 'mgmt-organisations-identites-data.js']`.
3. Nouvelle fonction, à côté de `lire` :

```js
/** Les fiches d'identité marquées relu:false : un bloc par organisation, dans l'ordre de MGMT_ORG_IDENTITES.
 *  @returns {Array<{titre:string,textes:Array<{chemin:string,t:string,situation:string}>}>} */
const lireIdentites = () => JSON.parse(win.eval(`JSON.stringify(Object.entries(MGMT_ORG_IDENTITES)
  .filter(([, f]) => f.relu === false).map(([id, f]) => { ... }))`));
```

   Le corps du `map` (dans la chaîne évaluée) rend, pour chaque `[id, f]` :
   `titre` = `nom + ' — ' + f.ville + ', ' + f.pays + ', depuis ' + f.annee`, où `nom` vient de
   `MGMT_ORGANISATIONS.find(o => o.id === id).nom` ; et `textes`, dans cet ordre, avec `chemin` de la forme
   `MGMT_ORG_IDENTITES['<id>'].<champ>` (crochets et guillemets simples, les ids ont des tirets) :

| chemin (après l'id) | situation |
| --- | --- |
| `.reputation` | `réputation` |
| `.blessure` | `blessure de son histoire` |
| `.adjointe.parcours` | `adjointe <prenom> <nom>, parcours` |
| `.adjointe.voix` | `adjointe <prenom> <nom>, voix` |
| `.adjointe.exemples[i]` (i = 0, 1, 2 ; rien si `exemples` est `null`) | `adjointe <prenom> <nom>, exemple <i+1>` |
| `.predecesseur.depart` | `prédécesseur <prenom> <nom>, raison du départ` |
| `.predecesseur.posteActuel` | `prédécesseur <prenom> <nom>, poste actuel` |

   Un texte vide ou absent est sauté. Le texte `t` est celui du fichier, **sans aucune modification**.
4. Boucle d'écriture (`:43-49`) : si `fichier === 'mgmt-organisations-identites-data.js'`, utiliser `lireIdentites()` ;
   pour chaque bloc écrire `### <titre>`, une ligne vide, puis ses lignes au format existant
   ``- [ ] `chemin` (situation) : texte``, puis une ligne vide. `total` augmente du nombre de textes de tous les
   blocs ; l'en-tête de famille garde la forme `## titre — N textes` et la ligne `Fichier : \`…\`` (obligatoire,
   voir Pièges). Pour les autres familles, rien ne change.
5. Mettre à jour le commentaire d'en-tête (`:3-6`) : ajouter la famille « fiches d'identité (mgmt-organisations-identites-data.js) ».

### `docs/TEXTES-A-RELIRE.md`

Régénéré une fois, à la fin, par `node tools/exporter-textes.js` (jamais à la main). Le fichier est suivi par git ;
son diff montrera aussi les textes ajoutés par d'autres tranches depuis la dernière génération : c'est normal.

## Sauvegarde

Non. Un outil, aucun format de partie.

## Textes

Aucun écrit. L'outil ne modifie aucun texte. `@ecrivain` n'est pas appelé.

## Écran

Aucun.

## Tests

Fichier : `tests/outillage.test.js` (existant, déjà dans `package.json` : rien à y ajouter). Porte : le test « 7.3 »
(`:37`) ; ajouter `const {newGameWindow}=require('./helpers/loadGame');` en tête.

1. **« Monde lot 2 T6 — l’export des textes contient les huit fiches d’identité, une organisation par bloc, un texte par ligne avec sa situation »** *(brief)*
   - lance l'outil vers un fichier temporaire (`textes-a-relire-identites.md`) ; coupe le fichier avec
     `split(/^## /m)` et retient la section qui commence par `Fiches d’identité` : elle existe, et son titre se termine par `— 69 textes` ;
   - `section.split(/^### /m).slice(1)` donne **8 blocs**, dont les titres commencent, dans l'ordre, par `Split — Lyon, France, depuis 2004`,
     `Garden of Blood`, `MMA Korner`, `Ultimate Rim`, `Fighting Pacific Championship`, `Knuckle Gate`, `Pure Impact`, `Undisputed Cage` ;
   - nombre de lignes `- [ ] ` par bloc : **6** pour Split (Leïla n'a pas d'exemples), **9** pour chacun des sept autres ; total 69 ;
   - avec `newGameWindow()` et `JSON.parse(win.eval('JSON.stringify(MGMT_ORG_IDENTITES)'))` : pour chaque organisation, son bloc
     contient mot pour mot `reputation`, `blessure`, `adjointe.parcours`, `adjointe.voix`, les trois `exemples` (sauf Split),
     `predecesseur.depart` et `predecesseur.posteActuel`, et les situations `(réputation)`, `(blessure de son histoire)`,
     `(adjointe Leïla Malika, parcours)` pour Split, `(adjointe Rachel Okafor, exemple 3)` pour Garden of Blood,
     `(prédécesseur Kader Malika, poste actuel)` pour Split ;
   - la ligne `Fichier : \`mgmt-organisations-identites-data.js\`` apparaît **une fois** et `Écrans et mécanismes — mgmt-organisations-identites-data.js`
     n'apparaît **plus**.
2. **« Monde lot 2 T6 — l’export des fiches ne modifie aucun fichier de données »**
   - lit `mgmt-organisations-identites-data.js` et `mgmt-organisations-data.js` avant et après l'export : contenus identiques.

Les deux tests existants restent verts sans modification : « 7.3 » (plus de 800 lignes `- [ ] `, cinq familles) et
`tests/mgmtTextesDemo.test.js` « T1 ».

## Vérification

`node --test tests/outillage.test.js tests/mgmtTextesDemo.test.js` (le test « 7.1 » joue 10 soirées : compte ~1 minute).
Puis `node tools/exporter-textes.js` : la dernière ligne annonce `1870 textes` environ (1801 − 0 + 69, plus les ajouts
des autres tranches) et `grep -c "^### " docs/TEXTES-A-RELIRE.md` donne **8**.
Critère de fin chiffré : **2 nouveaux tests verts, 8 blocs, 69 lignes (6 + 7 × 9), 0 fichier de données modifié.**
Puis `npm run check` (par `@verif`).

## Hors périmètre

- Ne pas toucher `lire` (`:25-40`) ni les regex des lignes 14-15 (la regex `/relus*:s*false/` est étrange mais fonctionne ;
  `tests/mgmtTextesDemo.test.js` a la bonne).
- Ne pas toucher `mgmt-organisations-identites-data.js` ni `mgmt-organisations-data.js` (8 noms exportés comme « textes » : à laisser).
- Ne pas exporter `main`, `paysPoids`, `villesSalles`, `soirees`, `rivale`, `age` : pas des textes à relire.
- Aucun bump `?v=` : `tools/` n'est pas chargé par `index.html`.

## Pièges

- `MGMT_ORG_IDENTITES` est une `const` de premier niveau : `win.eval('…MGMT_ORG_IDENTITES…')` la voit (comme `eval(n)` à `:38`),
  mais seulement dans la fenêtre jsdom, pas dans Node.
- Les ids ont des tirets (`garden-of-blood`, `organisation-6`) : chemin en `['id']`, jamais `.id`.
- `Object.entries` garde l'ordre d'écriture du fichier (Split en premier) : ne pas trier.
- Les textes contiennent des apostrophes droites et des guillemets simples échappés : le fichier `.md` les garde tels quels.
- `tests/mgmtTextesDemo.test.js:15` exige que `` `mgmt-organisations-identites-data.js` `` figure dans l'export : garde la ligne `Fichier :`.
- Le test d'outillage lance jsdom : mets `timeout:120000` comme le test « 7.3 ». `npm run lint` couvre `tools/` : pas de variable inutilisée.
- Le fichier régénéré est gros (~1900 lignes). Ne le relis pas en entier ; vérifie avec `grep -n "^### "`.

## Questions pour Anthony

Aucune. Une organisation par bloc, un texte par ligne avec sa situation : c'est la forme du brief et du format existant.

## Compte rendu

### Fichiers modifiés et leur rôle

- `tools/exporter-textes.js` — `mgmt-organisations-identites-data.js` ajouté à `DEJA` (ne sort plus dans « Écrans et mécanismes ») ; famille « Fiches d’identité des huit organisations (Monde lot 2) » insérée après « Combat » ; nouvelle fonction `lireIdentites()` (ancre `[ANCRE: OUTIL_EXPORT_IDENTITES]`) qui évalue `MGMT_ORG_IDENTITES` dans la fenêtre jsdom et rend un bloc `{titre, textes}` par organisation (titre `nom — ville, pays, depuis année`, chemins `MGMT_ORG_IDENTITES['<id>'].<champ>`, situations conformes au tableau de la fiche, textes vides ou absents sautés, `exemples` null de Leïla géré) ; le format de ligne (``- [ ] `chemin` (situation) : texte``) est factorisé dans `ligne` ; la boucle d'écriture branche la nouvelle famille (en-tête `Fichier :` conservé, `###` par bloc) ; commentaire d'en-tête mis à jour. `lire` et les regex des lignes 14-15 (autre numérotation) non touchés.
- `tests/outillage.test.js` — les deux tests exigés par la fiche, avec les intitlés exacts ; `const {newGameWindow}=require('./helpers/loadGame')` ajouté en tête.
- `docs/TEXTES-A-RELIRE.md` — régénéré une fois par `node tools/exporter-textes.js` : 1870 textes, 8 blocs `###`, section « 69 textes ».

### Tests ajoutés

- « Monde lot 2 T6 — l’export des textes contient les huit fiches d’identité, une organisation par bloc, un texte par ligne avec sa situation »
- « Monde lot 2 T6 — l’export des fiches ne modifie aucun fichier de données »

### Migration de sauvegarde

Aucune (outil de relecture, aucun format de partie).

### Vérification

- `node --test tests/outillage.test.js tests/mgmtTextesDemo.test.js` : 10/10 verts (les existants « 7.1 », « 7.2 », « 7.3 », « 7.4 », « T1 »–« T4 » compris).
- `node tools/verif-versions.js` : aucun écart par rapport à `main` (aucun bump `?v=` nécessaire : `tools/` et `docs/` ne sont pas chargés par `index.html`).
- `npm run check:rapide` : VERT, 93 fichiers de test lancés, 7 écartés (comme prévu), `fail 0`.
- Critère de fin chiffré atteint : 2 nouveaux tests verts, 8 blocs, 69 lignes (6 + 7 × 9), 0 fichier de données modifié.
- Le check complet `npm run check` reste à faire au bilan du lot.

### Écarts à la fiche

- Aucun sur le fond. Détail d'implémentation : la ligne `- [ ] …` est factorisée dans une petite fonction `ligne` au lieu d'être écrite deux fois (les autres familles gardent exactement le même format qu'avant).
- Premier passage de `npm run check:rapide` : un échec ponctuel d'assertion, non identifié (sortie tronquée) et non reproduit au passage suivant, qui est VERT. Rien dans la tranche ne joue de l'aléatoire ; à surveiller au bilan du lot si ça revient.

### Questions pour Anthony

Aucune.

### Relecture

`@relecteur` et `@verif` n'ont pas pu être appelés (limite de profondeur des sous-agents dans cette session) ; la vérification a été lancée manuellement comme prévu par la procédure de repli, et le diff a été relu manuellement contre la fiche.
