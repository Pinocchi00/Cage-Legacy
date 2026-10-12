# Monde lot 2 T5 — L'écran « Nouvelle partie »

## Branche

`monde-lot-2-identites` (courante : `monde-lot-2-identites` — conforme).

## Objectif

Que chaque carte de l'écran « Nouvelle partie » montre la ville, l'année et la réputation de son organisation, en plus de
ses plus et contreparties, **aux valeurs exactes de la planche corrigée**. L'aperçu chiffré et « Créer ton organisation · À venir » restent.

Brief : « **T5 — L'écran « Nouvelle partie ».** Chaque organisation y montre sa ville, son année et sa réputation, en
plus de ses plus et contreparties. La planche actuelle est ajustée, pas refaite. »

## Ce qui existe

- `mgmt-nouvelle.js` (81 lignes) : `mgmtNouvelleOrgHtml(o,i,choisie)` (`:23`, seul appelant : `scr_mgmt_nouvelle`, `:37`),
  `mgmtNouvelleApercuHtml(o)` (`:18`), `scr_mgmt_nouvelle()` (`:34`). Le nom prend `mfCorps(o.nom,choisie?290:380,56,28)` (`:28`).
  `MF_PLUS_SVG` / `MF_MOINS_SVG` (`:14-15`) sont déjà ceux de la planche (croix #E9E6E1, trait #E23A2B, trait 4, 26 × 26).
- `ui-cadre.css:250-270` : toutes les règles `.mf-nouvelle`, `.mf-org*`. `.mf-panneau` (`:79-84`) : contour 2 / 5 px, coupes 18 / 17 / 14 = planche.
  Les cartes non choisies ont le niveau `cote` (filet 30 %), comme la planche : ne pas y toucher.
- `mgmtOrgIdentite(id)` (`mgmt-organisations.js:128`, posée par T1) : `{ville, pays, annee, reputation, …}` ou `null` ; les 8 ids ont une identité.
  `mfNet(s)` (`mgmt-cadre.js:161`) met en majuscules, accents gardés ; `mfAvance(s)` (`:155`) mesure en corps de lettre.
- **La planche** : `maquettes/monde/MondeNouvellePartie.dc.html` (1920 × 1080, styles en ligne ; validée par Anthony le 10/10/2026, corrigée
  le même jour : plus aucun texte sous 22 px). La lire en entier. Ses villes et réputations sont exactement celles de `MGMT_ORG_IDENTITES`
  (3 apostrophes droites dans les données, typographiques dans la planche : afficher la donnée telle quelle).

## Ce qui change

Valeurs relevées dans la planche. « Avant » = le jeu actuel (`ui-cadre.css`).

| Pièce | Planche | Avant |
| --- | --- | --- |
| Zone (left 56, top 128, 1808 × 856) | colonne, **gap 20 px**, début en haut | colonne, `space-between` (`:250`) |
| Grille | 4 × `440px`, **2 rangées de 322 px**, gap 16 | `minmax(0,1fr)`, pas de rangées (`:251`) |
| Carte | 322 px ; contour et niveaux inchangés ; 3e couche `overflow:hidden` | 322 px |
| Bandeau de carte | **60 px**, padding 0 16, gap **10**, fond `#252121` / choisie `#B32A1E` | 76 px, gap 12 |
| Nom | Saira Extra Condensed 800, **44 px**, interligne 0,8 ; **30 px au-delà de 18 caractères** | `mfCorps(…,56,28)` |
| « CHOISIE » | 600, 22 px, 0,06 em | identique |
| Corps de carte | padding **8 px 16 px**, colonne, gap **6 px** | 10 px 16 px, gap 8 px |
| **Ligne ville** (neuve) | 600, **22 px**, interligne 1, **0,04 em**, `rgba(233,230,225,.74)`, sans retour : `VILLE · DEPUIS ANNÉE` | absente |
| **Réputation** (neuve) | **22 px**, interligne **1,1**, hauteur **48 px**, `overflow:hidden` (deux lignes, le reste coupé) | absente |
| Lignes d'atout | **34 px**, gap 12, filet bas 2 px `rgba(233,230,225,.16)`, texte 22 px, icône 26 px | 40 px |
| Intertitres « Les plus » / « Les contreparties » | **aucun** : plus, puis contreparties, en une colonne | présents (`:259-260`) |
| Aperçu (96 px) | fond `#121010`, filet 2 px `rgba(233,230,225,.38)`, padding 0 16, gap 12 ; nom 40 px, `margin-right:8`, sans trait ; six tuiles de **270 px** fixes (gap 6 ; intitulé 22 px 0,04 em ; valeur 24 px) | fond `--mf-ligne`, trait après le nom, tuiles `flex:1` (`:263-267`) |
| Pied (60 px) | texte 24 px, interligne **1,1**, gap 20 ; à droite « Créer ton organisation / À VENIR » (40 px, filet 2 px **tireté** `.38`, padding 0 14, gap 12, 24 px, **sans** transparence ; « À VENIR » 600 22 px 0,06 em), puis le bouton, gap 20 | interligne 1,2 ; sans filet ; opacité `.74` (`:269-270`) |
| Bouton jaune | `#F0B220`, **64 px**, padding **0 24**, gap 14, coupe 14, touche 24 px, libellé 34 px | 60 px, padding 0 20 |

**`mgmt-nouvelle.js`**

- `mgmtNouvelleOrgHtml` : `const idn=mgmtOrgIdentite(o.id);` ; dans le corps, avant les lignes :
  `<div class="mf-org-ville">${esc(mfNet(idn.ville)+' · DEPUIS '+idn.annee)}</div><div class="mf-org-reputation">${esc(idn.reputation)}</div>`
  (si `idn` est `null`, rien pour ces deux lignes). Un seul `<div class="mf-org-lignes">` pour les plus puis les contreparties, sans titre.
  Nom : `style="font-size:${o.nom.length>18?30:44}px"` (remplace `mfCorps`). Garder `data-org`, `aria-label`, `aria-pressed`, `onclick`, la classe
  `auteur`, et « Verrouillée » (démo) à la place de « Choisie ».
- `scr_mgmt_nouvelle` : texte du bas, exact : `Le jeu crée tout le reste pour cette partie : six ans d’histoire, les combattants, les camps, les salles, la presse.`
  Regrouper `avenir` et le bouton dans un `<div class="mf-nouvelle-droite">` (gap 20). Le texte de « À venir » reste `À venir` (la majuscule vient de la CSS).
  Garder `mgmtNouvelleApercuHtml`, `MGMT_CREER_ORG_*`, `mgmtOrgApercu`.
- Ancre : ajouter en tête « Monde lot 2 T5 : valeurs de maquettes/monde/MondeNouvellePartie.dc.html » ; garder l'ancre existante.

**`ui-cadre.css`** — réécrire `:250-270` aux valeurs du tableau. Classes neuves : `.mf-org-ville`, `.mf-org-reputation`, `.mf-org-lignes`,
`.mf-nouvelle-droite`. Supprimer `.mf-org-bloc`, `.mf-org-titre`. Garder `.mf-org-ligne`, `.mf-org-nom`, `.mf-org-apercu*`, `.mf-org-tuile*`.
Ajouter `.mf-org .mf-p3{overflow:hidden}` et `.mf-nouvelle .mf-bouton{height:64px;padding:0 24px}`. Aucune `font-size` sous 22 px (garde `tests/mgmtCadre.test.js:34`).

## Sauvegarde

Non. Un écran ; les identités sont des données de code.

## Textes

Aucun écrit. Le texte du bas est celui de la planche, mot pour mot.

## Écran

Planche validée : `maquettes/monde/MondeNouvellePartie.dc.html` (si le dossier manque : `STOP : planche absente`).
Vérification UI obligatoire (charte §3) : lancer le jeu, ouvrir « Nouvelle partie » à 1920 × 1080, comparer carte par carte à la planche.
Règles : **rien ne se superpose** ; `esc()` sur toute donnée injectée ; aucun composant natif ; l'écran se joue au clavier (flèches, Entrée, Échap).

## Tests

Nouveau fichier `tests/mgmtNouvellePartie.test.js` (porte : `tests/mgmtOrganisations.test.js` pour `newGameWindow` / `result` ; `tests/mgmtCadre.test.js:12`
pour lire `ui-cadre.css` ; `tests/mgmtDefautsDemo.test.js:54` pour le non-débordement par `mfAvance`). L'ajouter à `package.json` (scripts `test` ET
`test:watch`, pas `test:ceintures`). Départ : `setSeed(5); CL.mgmtNouvelle(3);`.

1. **« Nouvelle partie — chaque carte montre la ville, l’année et la réputation de son organisation »** *(brief)*
   - `.mf-org[data-org="<id>"] .mf-org-ville` vaut, dans l'ordre des 8 : `LYON · DEPUIS 2004`, `NEW YORK · DEPUIS 1999`, `ROTTERDAM · DEPUIS 2011`,
     `MELBOURNE · DEPUIS 2020`, `TOKYO · DEPUIS 1997`, `MANCHESTER · DEPUIS 2012`, `DUBAÏ · DEPUIS 2018`, `SÃO PAULO · DEPUIS 2005` ;
   - `.mf-org-reputation` vaut `mgmtOrgIdentite(id).reputation` pour les 8 : 16 vérifications.
2. **« Nouvelle partie — le nom s’écrit en 44 px, en 30 px au-delà de 18 caractères, et tient dans la carte »**
   - `font-size` de `.mf-org-nom` : 44 px pour 7 cartes, 30 px pour `Fighting Pacific Championship` (29 caractères) ;
   - `mfAvance(mfNet(nom))*taille` ≤ 306 pour les 8 (394 de large utile − 10 de gap − ~78 pour « CHOISIE ») ; valeurs 73, 240, 188, 196, 301, 191, 179, 240.
3. **« Nouvelle partie — les lignes d’atout suivent le profil, sans intertitre, et la carte la plus chargée tient dans 322 px »**
   - nombre de `.mf-org-ligne` par carte `[2,3,3,3,3,4,3,3]` ; textes = `mgmtOrgAtouts(o.profil).plus.concat(.moins)` ; aucun `.mf-org-titre` ni `.mf-org-bloc` ;
   - chaque réputation ≤ 90 caractères (les huit : 47 à 78) ; sinon `overflow:hidden` la coupe en silence ;
   - hauteur : 8 + 22 + 6 + 48 + 6 + 4 × 34 + 8 = 234 ≤ 322 − 14 (contour) − 60 (bandeau) = 248, calculée avec les nombres lus dans `ui-cadre.css`.
4. **« Nouvelle partie — les valeurs de la planche sont dans la feuille de style »**
   - `ui-cadre.css` contient `grid-template-columns:repeat(4,440px)`, `grid-template-rows:repeat(2,322px)`, `.mf-org-tete{height:60px`, `.mf-org-ligne{height:34px`,
     `.mf-org-reputation` (22 px, 48 px de haut), `.mf-org-ville` (22 px, `letter-spacing:.04em`), `.mf-nouvelle-pied{height:60px`.
5. **« Nouvelle partie — le texte du bas, l’aperçu, « Créer ton organisation » et le bouton jaune sont ceux de la planche »**
   - le texte contient la phrase exacte ci-dessus ; un seul `.mf-bouton.jaune` ; `.mf-org-apercu` présent avec 6 `.mf-org-tuile` ; `.mf-org-avenir` présent, `aria-disabled="true"`.
6. **« Nouvelle partie — une réputation hostile s’affiche échappée, jamais injectée »**
   - `MGMT_ORG_IDENTITES.split.reputation='<img src=x onerror=alert(1)>'` dans la fenêtre, puis `render()` : 0 `img` dans `#app`, et `.mf-org-reputation` contient `<img src=x`.

**Test existant à adapter (un seul)** — `tests/mgmtOrganisations.test.js:45` : le texte attendu du bas devient la phrase de la planche (« six ans d’histoire… la presse. »,
sans « ton assistante »). Décision citée en commentaire : planche validée par Anthony le 10/10/2026, corrigée le même jour. Les autres assertions (`:40-48`) et
`tests/mgmtCorrectionsLot12.test.js:20-31` (lignes, aperçu) ne changent pas. Aucun test ne cherche « Les plus » ni « Les contreparties ».

## Vérification

`node --test tests/mgmtNouvellePartie.test.js tests/mgmtOrganisations.test.js tests/mgmtCorrectionsLot12.test.js tests/mgmtCadre.test.js tests/mgmtDemo.test.js`.
Puis `node tools/_bump.js ui-cadre.css mgmt-nouvelle.js`. Pas de mesure.
Critère de fin chiffré : **6 tests neufs verts, 16 textes neufs vérifiés (8 villes, 8 réputations), 1 assertion existante changée, `npm run check` vert.**

## Hors périmètre

- Ce qui est déjà conforme (en-tête, logo, rangée de touches à 1010 px, contour des panneaux, filet à 30 %) ; les cinq autres planches `Monde*`.
- `mgmt-organisations-identites-data.js` et `mgmt-organisations-data.js` : jamais (données de T1 et T4).
- Le verrou de la démo (« Verrouillée », `CL_DEMO_ORG`, `tests/mgmtDemo.test.js:32`) : garder tel quel.

## Pièges

- Ordre des `<script>` : `mgmt-organisations.js` (index.html:1112) charge avant `mgmt-cadre.js` (:1154) et `mgmt-nouvelle.js` (:1156) : `mgmtOrgIdentite` et `mfNet`
  sont connus à l'exécution. Pas de nouveau `.js`, donc pas de balise à ajouter.
- Versions : `ui-cadre.css?v=m15x` (:1017) et `mgmt-nouvelle.js?v=b9` (:1156) ; `node tools/_bump.js ui-cadre.css mgmt-nouvelle.js` monte aussi `SW_VERSION`.
- `tests/mgmtOrganisations.test.js:39` lit `.mf-org-nom` : garder la classe et le texte `o.nom` (la majuscule vient de la CSS). Garder `.mf-org-ligne`, `.mf-org-tuile`, `.mf-org-avenir` : des tests les lisent.
- `FIGHTING PACIFIC CHAMPIONSHIP` à 30 px mesure 301 px ; choisie, il côtoie « CHOISIE ». C'est dans la planche : ne pas réduire davantage.
- `index.html` est déjà modifié par un autre agent : n'y change que les deux `?v=` demandés.

## Questions pour Anthony

Aucune qui bloque. À confirmer au passage : la planche corrigée redessine aussi l'aperçu (fond `#121010`, filet, tuiles de 270 px, sans trait après le nom), le pied
(filet tireté autour de « Créer ton organisation », gap 20 au lieu de `space-between`) et le bouton (64 px), pas seulement les cartes. La fiche les porte tels quels ;
pour garder leur style actuel, retirer les lignes « Aperçu », « Pied » et « Bouton jaune » du tableau.

## Décision de Claude (10/10/2026)

- **Seules les cartes d'organisation changent.** L'aperçu chiffré, le pied (« Créer ton organisation · À venir »)
  et le bouton jaune gardent le style actuel du jeu (`ui-cadre.css`) : la planche les redessine à la main,
  mais le brief dit « la planche actuelle est ajustée, pas refaite ». Du pied, seul le texte change.
- Anthony a confirmé les planches corrigées le 10/10/2026 : la tranche peut partir.


## Compte rendu

### Fichiers modifiés et leur rôle

- `mgmt-nouvelle.js` — `mgmtNouvelleOrgHtml` : `mgmtOrgIdentite(id)` ; ligne ville (`mfNet(ville) · DEPUIS annee`, `esc()`) et réputation (`esc()`, la donnée telle quelle) ; plus puis contreparties de `mgmtOrgAtouts(o.profil)` en une seule colonne `.mf-org-lignes`, sans intertitre ; nom en style inline 44 px / 30 px au-delà de 18 caractères ; « Verrouillée » (démo), `data-org`, `aria-label`, `aria-pressed`, `onclick`, classe `auteur` conservés. `scr_mgmt_nouvelle` : phrase du pied = celle de la planche, mot pour mot ; `avenir` et le bouton regroupés dans `.mf-nouvelle-droite`. Ancre `MGMT_BRIEF_LOT5_NOUVELLE_PARTIE` gardée, complétée en tête « Monde lot 2 T5 : valeurs de maquettes/monde/MondeNouvellePartie.dc.html ».
- `ui-cadre.css` — bloc `:250-270` réécrit aux valeurs de la planche pour les cartes (colonne gap 20, grille 4 × 440 / 2 × 322, tête 60 px fond `#252121` / choisie `#B32A1E` gap 10, corps `8px 16px` gap 6, neuves `.mf-org-ville`, `.mf-org-reputation`, `.mf-org-lignes`, `.mf-nouvelle-droite`, ligne d'atout 34 px filet 2 px `.16`, `.mf-org .mf-p3{overflow:hidden}`). `.mf-org-bloc` et `.mf-org-titre` supprimés ; `.mf-org-ligne`, `.mf-org-nom`, `.mf-org-apercu*`, `.mf-org-tuile*` gardés ; rien sous 22 px.
- `tests/mgmtNouvellePartie.test.js` (neuf).
- `tests/mgmtOrganisations.test.js` — une seule assertion changée (l.45) : le texte attendu du bas devient la phrase de la planche, décision citée en commentaire. Rien d'autre.
- `package.json` — le test neuf ajouté aux scripts `test` ET `test:watch` (pas `test:ceintures`).
- `index.html`, `sw.js` — `?v=` montés : `ui-cadre.css?v=m15xxx`, `mgmt-nouvelle.js?v=b9x`, `SW_VERSION='b76'`.

### Tests ajoutés (intitulés)

1. « Nouvelle partie — chaque carte montre la ville, l’année et la réputation de son organisation » (16 vérifications : 8 villes aux valeurs de la planche, 8 réputations = `mgmtOrgIdentite(id).reputation`).
2. « Nouvelle partie — le nom s’écrit en 44 px, en 30 px au-delà de 18 caractères, et tient dans la carte » (44/30 selon la longueur ; `mfAvance` : 73, 240, 188, 196, 301, 191, 179, 240, tous ≤ 306).
3. « Nouvelle partie — les lignes d’atout suivent le profil, sans intertitre, et la carte la plus chargée tient dans 322 px » (textes = plus-contreparties du profil ; `[2,3,3,3,3,4,3,3]` ; aucun `.mf-org-titre`/`.mf-org-bloc` ; réputations 47–78 ≤ 90 ; hauteur 8 + 22 + 6 + 48 + 6 + 4 × (34 + 2) + 8 = 238 ≤ 248, calculée avec les nombres lus dans `ui-cadre.css` — reprise : les bordures basses des lignes d'atout comptées, gaps du corps inclus).
4. « Nouvelle partie — les valeurs de la planche sont dans la feuille de style ».
5. « Nouvelle partie — le texte du bas, l’aperçu, « Créer ton organisation » et le bouton jaune sont ceux de la planche » (phrase exacte ; un bouton jaune ; aperçu 6 tuiles ; `aria-disabled="true"`).
6. « Nouvelle partie — une réputation hostile s’affiche échappée, jamais injectée » (0 `img` dans `#app`, texte échappé).

Une assertion existante changée (tests/mgmtOrganisations.test.js:45), décision citée en commentaire.

### Sauvegarde

Non concernée : un écran ; les identités sont des données de code.

### Écart à la fiche

1. **La planche n'était pas dans ce dépôt.** `maquettes/monde/` est absent de `cage-legacy-arene` ; la planche existe, exactement au nom cité, dans le dépôt docs voisin (`cage-legacy-docs/maquettes/monde/MondeNouvellePartie.dc.html`, le dépôt où Claude fusionne). La fiche prévoyait « STOP : planche absente » si le dossier manquait — la planche était donc absente du dépôt de code mais présente dans le dépôt docs, validée (confirmation du 10/10/2026 en bas de fiche) : j'ai codé d'après celle-là, sans la recopier ici. À valider : les planches des écrans des tranches suivantes subissent le même écart d'emplacement.
2. **Contradiction interne de la fiche, tranchée par sa « Décision de Claude »** : le tableau « Ce qui change » (lignes Aperçu, Pied, Bouton jaune) et la règle `.mf-nouvelle .mf-bouton{height:64px;padding:0 24px}` exigée par le § ui-cadre.css contredisent la décision finale (« seules les cartes changent… du pied, seul le texte change »). J'ai suivi la décision : aucun changement visuel à l'aperçu, au pied ni au bouton ; du pied, la phrase et le regroupement `.mf-nouvelle-droite` ; pas de règle `.mf-nouvelle .mf-bouton`.

### Questions pour Anthony

- Les planches du monde vivent dans `cage-legacy-docs` et les fiches les citent comme si elles étaient dans le dépôt de code : ok comme écart d'emplacement, ou préférer une copie dans chaque dépôt ?
- La règle `.mf-nouvelle .mf-bouton{height:64px;padding:0 24px}` (bouton de la planche, contredite par la décision du 10/10) : rester sur la décision, ou poser le bouton de la planche ?

### Vérification

- `node --test tests/mgmtNouvellePartie.test.js tests/mgmtOrganisations.test.js tests/mgmtCorrectionsLot12.test.js tests/mgmtCadre.test.js tests/mgmtDemo.test.js` : 37 tests, 0 échec.
- `node tools/check-rapide.js tests/mgmtCorrectionsLot12.test.js` : VERT — 95 fichiers lancés, 1 remis (le test lent concerné), 6 écartés. Le check complet est fait au bilan du lot.
- `node tools/verif-versions.js` : un écart détecté et corrigé (`ui-cadre.css` a dû être remonté une deuxième fois, la version `m15xx` étant déjà celle de main) ; ensuite « aucun écart par rapport à main ».

Sonde jetable : `tools/reports/sonde-t5-noms.js` (non commitée, ignorée par git, à supprimer librement).

### Reprise (2e tour, écarts du relecteur corrigés)

1. ui-cadre.css : huit sélecteurs (.mf-org-apercu, .mf-org-apercu-nom, .mf-org-tuile, .mf-org-tuile span, .mf-org-tuile b, .mf-nouvelle-pied, .mf-nouvelle-texte, .mf-org-avenir) étaient définis deux fois (277-284) ; une seule définition garde-à-portée, la première.
2. ui-cadre.css : .mf-org-avenir définissait margin-left:auto dans la copie fantôme seulement ; une seule définition, sans margin-left:auto (son conteneur .mf-nouvelle-droite porte le margin-left:auto).
3. ui-cadre.css : .mf-org-nom.long{font-size:30px} supprimée (morte : la taille est injectée en ligne).
4. tests/mgmtNouvellePartie.test.js : le calcul de hauteur compte les border-bottom:2px de chaque ligne d'atout (lues dans ui-cadre.css) : 8 + 22 + 6 + 48 + 6 + 4 × (34 + 2) + 8 = 238 ≤ 248.
5. mgmt-retraits-data.js et mgmt-voix-data.js : fins de ligne réécrites par un test, hors périmètre ; working tree nettoyé (contenu de HEAD réécrit tel quel, puis autocrlf normalisé).
