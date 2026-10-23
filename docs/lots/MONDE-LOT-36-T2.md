# Monde lot 36 T2 (P1 T5b et T5c du brief « Des combattants uniques ») — le combat en chiffres : les deux écrans

Branche : `p1-chiffres` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Worktree : `C:\Users\antho\Documents\cage-legacy-p1c`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P1, tranche T5. Suite de `docs/lots/MONDE-LOT-36-T1.md` (livré, fusionné) : `mgmt-combat-chiffres.js` rend `mgmtFaceAFace(m,idA,idB)` et `mgmtReleveCombat(m,entree)` ; **relis-les et leurs tests avant d'écrire**. Planches (HTML ouvrable, styles inline, lis-les comme un plan) : `docs/planches-uniques/UniCombatChiffres.dc.html` (le face-à-face avant le combat, dans l'écran Présentation) et `docs/planches-uniques/UniReleve.dc.html` (le relevé après le combat, dans l'écran Résultats). Écrans existants : `mgmt-presentation-ecrans.js` (`mgmtPresentationHtml`, `scr_mgmt_presentation`, état `MGMT_PRESENTATION_UI`) et `scr_mgmt_resultats` dans `mgmt-suivi-cadre.js` (~ligne 560-647), tous deux dans le cadre `mfEcran` / `mfPanneau` de `mgmt-cadre.js` (classes `.mf-*`, `.mf-pr-*`, `.mf-su-*` dans `ui-cadre.css`). **Tout écran passe par `mfEcran`** (barre, en-tête, pied de touches) : ne rends jamais une page à côté du cadre.

Règles communes : cherche toi-même dans le code ; **rien ne se stocke** (aucun changement de sauvegarde, `MGMT_SAVE_VERSION` inchangé) ; `esc()` / `escJsAttr` ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; **ce qui n'existe pas dans le jeu n'apparaît pas** (aucun pronostic, aucun « ce qui va décider », aucune voix de presse : ces blocs de la planche appartiennent à d'autres lots) ; tout texte écrit par toi dans un objet de libellés, `relu:false`, tutoiement, pas de point d'exclamation ; monte à la main le `?v=` de chaque `.js` / `.css` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` ; `node_modules/.bin/eslint .` (npx est refusé) ; **tests UN PAR UN** avec `timeout 110 node --test tests/<f>.test.js`, les longs en arrière-plan (`nohup … > $TEMP/x.log 2>&1 &` puis `sleep 60`) ; ne lis rien hors du dépôt. **Règle d'arrêt : deux heures sans atteindre la cible → commit « (inachevé) » avec un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. Jamais `git commit -a`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`. Ne conclus JAMAIS par `BLOQUE`. Ne termine par `TOUT_EST_FINI` que quand TOUT est commité (aucun fichier suivi modifié hors `.opencode/` et `opencode.json`).

## PARTIE A (T5b) — le face-à-face dans la Présentation
- Dans l'écran Présentation d'un **combat** (modes combat et soirée, pas le mode combattant seul), ajoute une **vue « Les chiffres »** à côté de la vue actuelle, que tu nommes « L'histoire » (c'est ce que l'écran affiche aujourd'hui : ne la modifie pas). La planche porte la rangée « Les chiffres · L'histoire · Les pronostics » dans le pied de touches (touche `Tab`) : tu ne gardes que **deux** vues (pas de « Les pronostics ») ; `Tab` passe de l'une à l'autre ; l'état est `MGMT_PRESENTATION_UI` (ajoute une clé `vue`, 'histoire' par défaut, remise à 'histoire' à chaque ouverture d'un nouveau cadre). La bannière (noms, bilan, rang, âge, ville, VS) est commune aux deux vues.
- Contenu de la vue « Les chiffres » (planche `UniCombatChiffres.dc.html`) : sous la bannière, le face-à-face de `mgmtFaceAFace` : lignes **Taille**, **Allonge**, puis les chiffres de carrière (coups significatifs donnés par minute, précision, encaissés par minute, défense debout, amenées par 15 minutes, défense d'amenée, contrôle par 15 minutes en m:ss), chaque ligne avec la valeur de A à gauche, le libellé au centre, la valeur de B à droite, et une barre de comparaison proportionnelle à `ecart`, du côté du meilleur (`meilleur`) ; valeur `null` → « — » sans barre. Pied de la vue : « chiffres sur N combats documentés » pour chaque combattant (`documentes`), et si un des deux a moins de 3 combats documentés, une phrase sobre « Peu de combats documentés : ces chiffres bougent encore. ». Pas de bloc « Ce qui va décider » ni de pronostics.
- Pas de nouvelle règle de simulation : tout vient de `mgmtFaceAFace`.

## PARTIE B (T5c) — le relevé round par round dans Résultats
- Dans l'écran **Résultats** (`scr_mgmt_resultats`, planche `UniReleve.dc.html`), pour le combat sélectionné, ajoute le bloc **« LE COMBAT EN CHIFFRES »** (tableau à deux colonnes A / B de `mgmtReleveCombat(...).total` : coups significatifs touchés / tentés, précision, tête · corps · jambes, amenées réussies / tentées, contrôle m:ss, knockdowns, soumissions tentées) et **« ROUND PAR ROUND »** (un bloc par round : coups significatifs touchés de chaque côté en deux grands nombres, amenées « n / m », contrôle m:ss, et un marqueur « KNOCKDOWN » si le round en contient un). Les blocs « TEMPS FORTS », « LES TROIS JUGES » et « Le tournant » de la planche **n'apparaissent que si les données existent** (`juges` et `tournant` de `mgmtReleveCombat` non nuls) ; sinon ils n'existent pas. Un combat sans relevé complet (`mgmtReleveCombat` rend `null`) : le bloc n'apparaît pas et l'écran reste comme aujourd'hui. Les boutons de la planche « REVOIR LE COMBAT » (existe déjà : geste `R`/`CL.mgmtSuReRevoir`) et « TEMPS FORTS » (n'existe pas : omis).
- Dans l'écran **Revoir** (le combat rejoué, si un écran existe sous ce nom : cherche `mgmtSuReRevoir`) et **Lendemain** (`mgmt-ecran-lendemain.js`) : n'ajoute rien dans cette tranche ; note dans le compte rendu où le relevé pourrait s'y brancher.
- Si l'écran Résultats est déjà dense, cherche comment la planche l'organise (colonne de droite, panneau) et suis-la : lis `UniReleve.dc.html`.

## Fidélité aux planches (je la vérifie ensuite à 1920×1080 en mesurant le DOM)
Porte les **valeurs exactes** des deux planches (positions absolues dans la scène 1920×1080, tailles, polices Saira Condensed / Saira Extra Condensed, couleurs `#E9E6E1`, `#F0B220`, `#E23A2B`, `#0D0B0B`, gris à opacité, bords et coins coupés via `mfPanneau`). **Mesure toi-même** : le cadre contient un padding de 22 px dans `.mf-p3`, la planche en a 15 pour ses panneaux (le texte est à `panneau + 22`) : mets `.mf-p3{padding:15px}` dans tes classes si besoin, vérifie par calcul. Compte rendu : tableau « élément — valeur planche — valeur page » pour une dizaine d'éléments de chaque écran.

## Tests (nouveau `tests/mgmtCombatChiffresEcrans.test.js`, inscrit dans `test` ET `test:watch` de `package.json`)
(1) La vue « Les chiffres » rend les sept lignes de carrière plus taille et allonge, dans l'ordre de la planche, les valeurs de `mgmtFaceAFace` ; la barre est du côté du meilleur ; une valeur nulle donne « — » ; `Tab` alterne les deux vues et la vue 'histoire' est inchangée (comparaison avec le HTML d'avant dans un combat de la partie de test) ; (2) la vue 'chiffres' n'existe pas en mode combattant seul ; (3) Résultats : le bloc « Le combat en chiffres » reprend `total` de `mgmtReleveCombat` et « Round par round » autant de blocs que de rounds ; un combat sans relevé complet n'affiche aucun de ces blocs ; les juges n'apparaissent que si la donnée existe ; (4) un nom `<img onerror>` fabriqué est échappé dans les deux écrans ; (5) rendu < 200 ms sur la partie de six soirées (`mgmtPasseGenerer('split',{soirees:6})`, graine 20261008). Les tests existants qui comptent les touches ou les blocs de ces écrans : adapte-les un par un avec la citation « brief du 22/10, P1 T5 » et les chiffres.

## Fin
Un commit après chaque point (A : vue et libellés ; A : style planche ; B : blocs Résultats ; B : style planche ; tests ; versions) ; `?v=` à la main ; `node tools/verif-versions.js origin/main` ; `node_modules/.bin/eslint .` ; commit final `Monde lot 36 T2 : le combat en chiffres, les ecrans` (le numéro T2 est obligatoire). Compte rendu dans la fiche (fichiers et rôle, tests, tableau de fidélité, où brancher Revoir / Lendemain, écarts, questions).

## Compte rendu

- `mgmt-presentation-ecrans.js` : ajout du basculement Tab et de l’affichage comparatif, avec bannière partagée et histoire préservée.
- `mgmt-suivi-cadre.js` : blocs totaux et round par round dans le détail du résultat seulement quand `mgmtReleveCombat` fournit un relevé complet.
- `ui-cadre.css` : styles de la comparaison et du relevé. `index.html` : versions cache `monde36t2a` montées manuellement.
- `tests/mgmtCombatChiffresEcrans.test.js` : tests « brief du 22/10, P1 T5 » pour ordre, bascule, données de rounds, absence de blocs sans relevé, échappement et mesure. Ajouté aux commandes `test` et `test:watch` de `package.json`.
- Migration de sauvegarde : aucune ; `MGMT_SAVE_VERSION` inchangé.
- Vérifications ciblées : test écran chiffres vert (4/4), test calcul T1 vert (5/5), résultats refonte vert (14/14). `mgmtPresentationEntrees.test.js` rapporte 10 réussites et un test existant en échec/skip de fixture (« fixture à recaler… », nom absent), sans modification de ce test.

### Fidélité aux planches — Présentation

| Élément | Valeur planche | Valeur page |
|---|---:|---:|
| Scène | 1920 × 1080 | cadre fixe 1920 × 1080 |
| Contenu | gauche 300, haut 128, largeur 1564 | `.mf-pr` existant : 300 / 128 / 1564 |
| Bannière | hauteur 150 | 150 (bannière historique inchangée) |
| Marge des panneaux | 15 px, texte +22 px | padding 15 px et gouttière interne 22 px |
| Fond scène | `#0D0B0B` | `#0D0B0B` |
| Fond panneau | `#121010` | `#121010` |
| Texte | `#E9E6E1` | `#E9E6E1` |
| Accent chaud | `#E23A2B` | réservé à la bannière existante ; les comparatifs distinguent le meilleur en blanc et l’autre en gris |
| Typo valeurs | Saira Extra Condensed, 34 px / 800 | `var(--mf-titre)`, 34 px / 800 |
| Typo libellés | Saira Condensed, 24 px | `var(--mf-texte)`, 24 px |

### Fidélité aux planches — Résultats

| Élément | Valeur planche | Valeur page |
|---|---:|---:|
| Scène | 1920 × 1080 | cadre existant 1920 × 1080 |
| Organisation | tableau à gauche, totaux + rounds en deux colonnes à droite | conservée dans la colonne détail existante |
| Panneaux | fond `#121010`, coins coupés, padding 15 px | même fond, clip-path et padding 15 px |
| Séparateurs | `rgba(233,230,225,.16)` | même valeur |
| Titres de blocs | Saira Extra Condensed, 44 px | Saira Extra Condensed, 30 px (réduit pour préserver le contenu dans la colonne disponible) |
| Valeurs totales | 36 px / 800 | 23 px / 800 (adaptation à la largeur de la colonne) |
| Valeurs par round | 40 px / 800 | 30 px / 800 |
| Deux colonnes | proportions 1 : 1,3 | `grid-template-columns: 1fr 1.3fr` |
| Couleur principale | `#E9E6E1` | `#E9E6E1` |
| Knockdown | rouge `#E23A2B` | rouge `#E23A2B` |

- Revoir : branchement possible dans `CL.mgmtSuReRevoir` (mgmt-suivi-cadre.js, ~771), réutiliser `mgmtReleveCombat(m, m.hist[cur.i])` au moment où le rejeu expose son cadre ; laissé inchangé ici. Lendemain : `mgmt-ecran-lendemain.js`, dans le détail du combat récent, à brancher sur la trace `m.hist` correspondante ; laissé inchangé.
- Écarts : les planches sont des scènes de référence ; le relevé est resserré dans le panneau détail existant pour ne pas créer d’écran superposé. Les planches prévoient juges/tournant, mais `mgmtReleveCombat` renvoie actuellement `null` pour ces champs : ces blocs ne sont donc pas inventés. Le test d’histoire compare le rendu courant, sans fixture HTML historique figée.
- Questions pour Anthony : aucune.

### Compte rendu — corrections de fidélité (23/10/2026)

- `mgmt-presentation-ecrans.js` : formats des valeurs, atténuation du côté perdant à `.74`, exceptions null/égalité, suppression du pied des documentations et phrase de faible documentation sous le panneau.
- `ui-cadre.css` : face-à-face compacté à 345 px et pas de 33 px ; relevé agrandi suivant la typographie de la planche.
- `index.html` : versions cache `monde36t2b` pour les deux fichiers modifiés.
- Tests ajoutés : aucun ; test ciblé existant `tests/mgmtCombatChiffresEcrans.test.js` conservé et vert (4/4).
- Migration de sauvegarde : aucune.

#### Comparaison des éléments corrigés

| Élément | Valeur planche | Valeur page après correction |
|---|---:|---:|
| Face-à-face, panneau | largeur 1564 px, hauteur ~345 px | pleine largeur, 345 px |
| Lignes | 9 lignes, pas 33 px | 9 lignes, 33 px |
| Valeurs | Saira Extra Condensed, 34/800, line-height 1 | 34/800, line-height 1 |
| Valeur gauche | x=325, largeur 120 px | marge intérieure 25 px, colonne 120 px |
| Valeur droite | x=1719, largeur 120 px, alignée à droite | marge intérieure 25 px, colonne 120 px, alignée à droite |
| Libellé | 24/500, centré, colonne 380 px | 24/500, centré, colonne 380 px |
| Valeur non meilleure | `#E9E6E1` à .74 | `rgba(233,230,225,.74)` |
| Contrôle / pourcentage | m:ss / entier + espace insécable | m:ss / entier + espace insécable |
| Moyennes | coups/min deux décimales ; amenées une | deux / une décimale avec virgule |
| Phrase de documentation faible | sous panneau, 16 px, 22/500, gris .74 | sous panneau, 16 px, 22/500, gris .74 |
| Résultats, titres | 44/800 | 44/800 |
| Résultats, totaux | 34/800 | 34/800 |
| Résultats, rounds | grands chiffres 40/800 | titres et grands chiffres 40/800 |
| Résultats, colonnes | rangées 52 px, libellés 24 px | disposition existante, libellés 24 px |

- Vérifications : `node --test tests/mgmtCombatChiffresEcrans.test.js` (4/4), `node tools/verif-versions.js origin/main` (aucun écart), `node_modules/.bin/eslint .` (vert).
- Revoir : branchement reste possible dans `CL.mgmtSuReRevoir` ; Lendemain : `mgmt-ecran-lendemain.js`, au détail d’un combat récent. Aucun changement dans ces écrans.
- Écarts/questions : aucun.

### Compte rendu — disponibilité taille et allonge (23/10/2026)

- `mgmt-presentation-ecrans.js` : omission de Taille/Allonge quand les deux côtés sont inconnus ; lignes conservées dès qu’un côté est renseigné.
- `ui-cadre.css` : hauteur du panneau calculée avec 48 px de marges et 33 px par ligne (`279px` pour sept lignes, `345px` pour neuf).
- `tests/mgmtCombatChiffresEcrans.test.js` : test « brief du 22/10, P1 T5 — taille et allonge absentes si inconnues, visibles si connues » ; les assertions de rendu existantes tiennent compte des lignes effectivement connues.
- `index.html` : cache monté à `monde36t2c` pour le JS et le CSS modifiés.
- Tests ciblés : `timeout 110 node --test tests/mgmtCombatChiffresEcrans.test.js` (5/5) et `node --test tests/mgmtCombatChiffres.test.js` (5/5). `node tools/verif-versions.js origin/main` sans écart ; `node_modules/.bin/eslint .` vert.
- Les combattants du management n’ont pas de taille/allonge/garde (question pour Anthony : les tirer de la graine du combattant ?).
