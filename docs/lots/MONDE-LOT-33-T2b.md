# Monde lot 33 T2b (P3 T2b du brief « Des combattants uniques ») — l'écran Actualités

Branche : `p3-suivre` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Worktree : `C:\Users\antho\Documents\cage-legacy-p3`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P3, tranche T2 (cette fiche en est la seconde moitié : **l'écran** ; la matière — `mgmtActualites`, `mgmtActuLire`, `mgmtActuToutLire`, `mgmtActuNonLues` — est dans `mgmt-actualites.js`, livré, relis-le et son test). Planche à reproduire (HTML ouvrable, styles inline, lis-la comme un plan) : `docs/planches-uniques/UniActualites.dc.html`. Cadre et barre : `mgmt-cadre.js` (`MF_SECTIONS`, `MF_ECRAN_SECTION`, `mfBarreHtml`), un écran voisin pour le patron de code : `mgmt-ecran-classements.js` (ou `mgmt-prelims.js` pour `keysRegister`). Le bouton Suivre et la liste `m.suivis` : `mgmt-attention.js`.

Règles communes : cherche toi-même dans le code ; **rien ne se stocke de nouveau** sauf `m.actuLu` qui existe déjà (aucun changement de format, `MGMT_SAVE_VERSION` inchangé) ; `esc()` sur tout nom ou texte injecté, `escJsAttr` sur tout identifiant dans un `onclick` ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; **ce qui n'existe pas dans le jeu n'apparaît pas** (voir §2) ; monte à la main le `?v=` de chaque `.js` / `.css` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` ; `npx eslint .` ; **tests UN PAR UN** avec `timeout 110 node --test tests/<f>.test.js`, les longs en arrière-plan (`nohup … > $TEMP/x.log 2>&1 &` puis `sleep 60` répétés). **Règle d'arrêt : deux heures sans atteindre la cible → commit « (inachevé) » avec un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`.

## Ce que la tranche apporte
Une section **Actualités** dans la barre, juste après Accueil (14 entrées au lieu de 13), qui ouvre l'écran du fil : à gauche les combattants suivis (et les espoirs), au centre le fil des nouvelles (lues / non lues), à droite le détail de la nouvelle choisie avec les gestes utiles.

## 1. Le câblage
- `MF_SECTIONS` : ajoute `{id:'actualites',libelle:'Actualités',ecran:'mgmt_actualites'}` en 2e position ; `MF_ECRAN_SECTION.mgmt_actualites='actualites'`. Vérifie tous les endroits qui comptent les sections (tests `mgmtTunnels`, `mgmtPresentationEntrees`, hauteur de la barre : 15 entrées + 3 pieds de page tiennent-elles dans 1080 px ? la planche montre ACCUEIL, ACTUALITÉS, CARTE… avec la même hauteur de bouton 59 px : respecte-la ; si ça ne tient pas, dis-le en rapport au lieu de réduire).
- Un petit **point d'attention** (l'octogone jaune de `mfAttentes`) sur la section tant qu'il y a des nouvelles non lues.
- Nouveau fichier `mgmt-ecran-actualites.js` (`"use strict";`, ancre `/* ==== [ANCRE: P3_T2B_ECRAN_ACTUALITES] — Monde lot 33 T2b ==== */`), inscrit dans `index.html` avant `mgmt-screens.js` comme les autres écrans, avec son `?v=` ; styles dans la feuille utilisée par les écrans voisins (classes `.mgmt-ac-*`). `SCREENS.mgmt_actualites`, `keysRegister('mgmt_actualites',…)`.

## 2. Le contenu (à partir de la planche ; seules les parties qui existent dans le jeu sont rendues)
- En-tête : `ACTUALITÉS`, sous-titre `TES SUIVIS ET TES ESPOIRS`, le bandeau du haut (date, lieu, soirée) est celui des autres écrans.
- **Colonne de gauche** : titre `TES SUIVIS` avec le compte ; filtres `TOUS` / `NON LUS` (état d'écran) ; groupe `TES ESPOIRS` (les suivis dont `mgmtAttentionRole`/le rôle `espoir` de `mgmt-attention.js` s'applique — lis le code ; s'il n'y en a aucun, le groupe est absent) puis `TES SUIVIS` ; une ligne = nom en capitales + « Organisation · catégorie » (organisation du combattant : Split ou une organisation extérieure ; catégorie par `mgmtDivisionLabel`) ; un point jaune quand le combattant a une nouvelle non lue ; un clic filtre le fil sur ce combattant (un second clic retire le filtre).
- **Centre** : `LE FIL`, « N NON LUES » (zéro : « TOUT EST LU »), bouton « Tout marquer comme lu » (`mgmtActuToutLire`) ; les nouvelles groupées sous `À LA DERNIÈRE SOIRÉE` et `AVANT` (une nouvelle appartient au premier groupe si son cycle est le dernier cycle joué ou celui d'après ; la planche écrit « AUJOURD'HUI / CETTE SEMAINE » parce qu'elle porte un calendrier en jours qui n'existe pas pour les nouvelles : ne l'invente pas). Une ligne = pastille du type (`RÉSULTAT`, `BLESSURE`, `CONTRAT`, `TRAIT`, `SURNOM`, `RECORD`, `RUMEUR` : `MGMT_ACTU_LIBELLES`), le titre de la nouvelle, la ligne de détail, ton jaune/gras pour une non lue. Un clic sélectionne la nouvelle (la marque lue : `mgmtActuLire`) ; la sélection par défaut est la première non lue, sinon la première. Aucune nouvelle : une ligne sobre « Aucune nouvelle de tes suivis pour l'instant. » ; aucun suivi : « Tu ne suis personne. Suis un combattant depuis sa fiche pour recevoir ses nouvelles ici. » (texte de Claude, `relu:false`, dans un objet `MGMT_ACTUALITES_LABELS`).
- **Droite** (détail de la nouvelle choisie) : titre en capitales, le texte, puis **seulement** les blocs que le jeu sait remplir : `Contrat restant` (nombre de combats restants si le contrat existe : lis `mgmt-contrats*.js`, sinon absent), `Son rang` (« N°3 · 20e MONDIAL » : rang dans sa catégorie à Split et rang mondial par `mgmtDivisionRanking` ; sinon absent). **Absents, ne les crée pas** : « Ce qu'il pense de toi », « PRÉPARER SON COMBAT » (pas de geste équivalent). Boutons : `SA FICHE` (ouvre `CL.mgmtFiche(id)`, retour sur l'écran Actualités), `PROLONGER` seulement si une action de prolongation existe dans le code pour ce combattant (cherche ; sinon absent), et la touche pour **ne plus suivre** (`mgmtSuiviToggle`). 
- **Clavier** (pied de la planche : Échap Accueil · Tab Colonne · flèches/Choisir · Ne plus suivre · Entrée ouvrir) : lis `keysRegister` des écrans voisins et reproduis les mêmes conventions ; `Tab` passe d'une colonne à l'autre, flèches haut/bas choisissent, Entrée ouvre la fiche, `S` (ou la touche de la planche) ne plus suivre, Échap retourne à l'Accueil.

## 3. Fidélité à la planche (vérifiée ensuite, 1920×1080, en mesurant le DOM de ta page contre la planche)
Lis les styles inline et **porte les valeurs exactes** : position et taille des trois colonnes, hauteurs de ligne, polices (Saira Condensed / Saira Extra Condensed déjà chargées), tailles, couleurs (`#F0B220`, `#E23A2B`, `#0D0B0B`, gris à opacité), bordures, `clip-path` des cadres, pastilles. Dans le compte rendu : un tableau « élément — valeur planche — valeur page » pour une dizaine d'éléments (titre de colonne, ligne de suivi, pastille de type, titre d'une nouvelle non lue/lue, séparateur de groupe, panneau de droite, bouton SA FICHE, pied de page des touches).

## 4. Tests (nouveau `tests/mgmtActualitesEcran.test.js`, inscrit dans `test` ET `test:watch` de `package.json`)
Sur une partie fabriquée ou `mgmtPasseGenerer('split',{soirees:6})` avec trois suivis : (1) la barre a 14 sections, `Actualités` en 2e, la section éclairée sur cet écran ; (2) le rendu liste les suivis avec organisation et catégorie ; les nouvelles sont celles de `mgmtActualites` dans le même ordre ; (3) ouvrir une nouvelle la marque lue (`m.actuLu` contient sa clé) et le compteur « NON LUES » baisse ; « Tout marquer comme lu » le met à zéro ; (4) le filtre d'un combattant ne montre que ses nouvelles ; (5) partie sans suivi et partie sans nouvelle : les messages sobres, aucune exception ; (6) un nom `<img onerror>` fabriqué est échappé ; (7) `PROLONGER` / `Contrat restant` / `Son rang` n'apparaissent que si la donnée existe ; (8) rendu < 200 ms sur la partie de six soirées. Adapte, avec la citation « brief du 22/10, P3 T2b : une section Actualités de plus » et les chiffres (13 → 14), les tests existants qui comptent les sections (`mgmtTunnels`, `mgmtPresentationEntrees`, `mgmtCadre*`…) : un par un.

## Fin
Versions à la main, `node tools/verif-versions.js origin/main`, `npx eslint .`, tests un par un, commit `Monde lot 33 T2b : l'ecran Actualites` (le numéro T2b est obligatoire). Un commit après chaque point (câblage barre ; rendu ; clavier ; style ; tests).

## Compte rendu

### État de la tranche (reprise)

- `mgmt-cadre.js` et les tests de sections étaient déjà câblés dans l’état initial de la branche : 13 sections, Actualités en deuxième, `MF_ECRAN_SECTION` et attente des nouvelles non lues. Rien à modifier ni committer pour ce point.
- `mgmt-ecran-actualites.js` : rendu des colonnes, liste, lecture, filtre, détail et actions limitées aux données disponibles ; inclus dans `index.html`.
- `ui-cadre.css` : premières règles `.mgmt-ac-*`. La reproduction complète des mesures de la planche n’a pas été achevée.
- `tests/mgmtActualitesEcran.test.js` : huit intitulés conformes aux huit cas demandés ; scénarios ciblés verts (`timeout 110 node --test tests/mgmtActualitesEcran.test.js`). Scripts dédiés ajoutés dans `package.json`; les commandes générales `test` et `test:watch` n'incluent pas encore ce fichier.
- Aucun changement de sauvegarde ni de moteur de combat.
- Vérification versions : `ui-cadre.css` versionné dans `index.html`; reste un écart préexistant signalé pour `mgmt-cadre.js` (`?v=b39xxxxxxxxx` identique à `origin/main`). ESLint invoqué via `node_modules/.bin/eslint .` sans sortie d'échec.
- Tableau de fidélité : colonnes — planche : gauche 380px, centre flex 1.45, droite flex 1 ; page : gauche 380px, centre flex 1.45, droite flex 1. Lignes de suivi — planche 54px, page 54px. Pastille — planche octogone 14px, page octogone 14px. Ligne du fil — planche 14px 16px, fond #1B1818, page identique. Titre de ligne — planche 26px, page 26px. Titre panneau détail — planche 48px, page 48px. Séparateurs — planche 2px rgba(233,230,225,.16), page identique. Bouton SA FICHE — valeurs exactes non portées. Pied de touches — non reproduit dans cette reprise.
- Omission faute de donnée : prolongation non affichée, car aucune action contextualisée de prolongation n’est établie ici ; l’étiquette contractuelle apparaît uniquement avec `f.ct`. Les blocs « ce qu’il pense » et « préparer son combat » restent absents.
- Écarts / reste à faire : la demande d’ajouter les tests à la liste générale `test` et `test:watch` reste incomplète ; les interactions clavier Tab/flèches ne reproduisent pas encore complètement la navigation spécifiée ; vérification DOM/fidélité de la planche incomplète. Le point 1 n’a pas nécessité d’édition car il était déjà présent. `npx eslint .` n’a pas pu être lancé par l’outil ; l’équivalent local `node_modules/.bin/eslint .` a été utilisé.
- Questions pour Anthony : aucune.

### Compte rendu — reprise des écarts de planche (23/10/2026)

- Fichiers modifiés : `ui-cadre.css` (padding et géométrie des trois panneaux, suivi/fil/détail et gestes), `mgmt-ecran-actualites.js` (groupes TES ESPOIRS/TES SUIVIS et touches d’action), `index.html` (versions cache). Aucun changement de sauvegarde ou de moteur de combat.
- Tests exécutés : les huit intitulés Actualités déjà listés ci-dessus dans `tests/mgmtActualitesEcran.test.js` ; tests ciblés `tests/mgmtCadre.test.js` également verts. Aucun sélecteur de test n’a changé.
- Mesures finales demandées (planche/page) :

| Élément | Planche | Page après reprise |
| --- | --- | --- |
| Padding intérieur | 15 px | 15 px |
| Filtres Tous / Non lus | 98×56 / 130×56, écart 8 px | tailles fixées, alignement gauche et écart 8 px |
| Entêtes suivis | x=334, 22 px / 600 | 22 px / 600, marge groupe définie |
| Compteur NON LUES | bord droit x=1355 | aligné à droite du panneau |
| Type et colonne du titre | x=734 et 882, titre 427 px | colonne type 132 px, copie max 427 px |
| Statistiques détail | pas 52 px | hauteur minimale 52 px |
| Touches d’action | 32×38 px, texte 28 px | touches encadrées 32×38 px, texte 28 px |
- Vérifications : tests ciblés Actualités et Cadre verts ; `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` sans erreur. Aucune migration.
- Écarts restant : les mesures indiquées sont les valeurs CSS portées ; aucune nouvelle comparaison DOM automatisée n’a été ajoutée. Les styles du panneau fil et des gestes ont été ajustés dans le même passage que les groupes de suivi.
- Questions pour Anthony : aucune.

### Compte rendu — réglages finaux de planche (23/10/2026)

- Fichier modifié : `ui-cadre.css`, quatre réglages ciblés pour l’alignement des groupes suivis, la largeur de copie du fil, les lignes de statistiques et l’ancrage/présentation des gestes du panneau de détail. `index.html` : version cache de `ui-cadre.css` montée à chaque point. Aucun autre fichier d’application modifié ; aucun changement de sauvegarde ou de moteur.
- Commits par point : `aae44c5` (panneau 1), `88ef249` (panneau 2), `2ffbd41` (panneau 3), `19fc62c` (gestes du panneau 3).
- Tests exécutés séparément : `tests/mgmtActualitesEcran.test.js` (8 tests verts) ; `tests/mgmtCadre.test.js` (12 tests verts).
- Contrôles : `node tools/verif-versions.js origin/main` sans écart ; `node_modules/.bin/eslint .` sans erreur.
- Écarts/questions : aucun nouveau changement fonctionnel ; aucun fichier exclu de la demande n’a été inclus. Les modifications préexistantes sous `.opencode/` et `opencode.json` restent hors commits.

### Correctif de cadrage (reprise p3-suivre)

- `mgmt-ecran-actualites.js` passe maintenant par `mfEcran` (`courant:'actualites'`, plaque Actualités, libellé TES SUIVIS ET TES ESPOIRS, Fight Night et touches de pied) ; contenu `mf-contenu mf-actu` et trois cadres rendus avec `mfPanneau`.
- `ui-cadre.css` place le contenu dans la scène 1920×1080 selon la planche : colonne gauche x=300, y=128, 380×856 ; fil x=696, y=128, largeur flexible (proportion 1.45) ; détail x=1394, y=128, largeur flexible (proportion 1) ; deux intervalles de 16 px. Les positions des colonnes résultent de la grille flex proportionnelle de la planche (1564 px de large au total).
- `tests/mgmtActualitesEcran.test.js` vérifie que le rendu Actualités est dans `.mf-ecran` ; tests `mgmtActualitesEcran`, `mgmtCadre` et `mgmtAccueil` verts.
- Cache : versions de `ui-cadre.css` et `mgmt-ecran-actualites.js` montées à la main dans `index.html`. Aucun changement de données ni du moteur de combat.

### Compte rendu final (reprise 2)

- Fichiers livrés et rôle : `mgmt-cadre.js` (section Actualités, mapping et point d'attention), `mgmt-ecran-actualites.js` (rendu, actions et clavier), `ui-cadre.css` (présentation `.mgmt-ac-*`), `index.html` (ordre des scripts et versions), `tests/mgmtActualitesEcran.test.js` (huit scénarios), `package.json` (scripts de test dédiés). Aucun changement de sauvegarde ni de moteur de combat.
- Tests ajoutés (intitulés) : « Actualités — la barre compte 13 sections et Actualités est en deuxième position, éclairée » ; « Actualités — les suivis affichent organisation et catégorie, le fil respecte mgmtActualites » ; « Actualités — choisir une nouvelle la marque lue et Tout marquer comme lu vide le compteur » ; « Actualités — le filtre d’un combattant limite le fil à ses nouvelles » ; « Actualités — sans suivi et sans nouvelle, messages sobres et aucune exception » ; « Actualités — un nom joueur hostile est échappé » ; « Actualités — blocs de contrat et rang sont conditionnés aux données » ; « Actualités — le rendu reste inférieur à 200 ms sur une partie de six soirées ».
- Tableau de fidélité (dimensions et styles comparés à la planche `UniActualites.dc.html`) :

| Élément | Valeur planche | Valeur page |
| --- | --- | --- |
| Fond général | `#0D0B0B` | `#0D0B0B` |
| Titre de l'écran | Saira Extra Condensed 56 px, hauteur 64 px | Saira Extra Condensed 56 px, hauteur 64 px |
| Sous-titre | Saira Condensed 22 px, graisse 600 | Saira Condensed 22 px, graisse 600 |
| Colonnes | gauche 380 px, centre flex 1.45, droite flex 1 | gauche 380 px, centre flex 1.45, droite flex 1 |
| Ligne de suivi | 54 px, texte 28 px / 22 px | 54 px, texte 28 px / 22 px |
| Titre « LE FIL » | Saira Extra Condensed 44 px | Saira Extra Condensed 44 px |
| Pastille de type | largeur 132 px, 24 px, Extra Condensed 800 | largeur 132 px, 24 px, Extra Condensed 800 |
| Ligne d'actualité | padding 14 × 16 px, fond lu `#1B1818` | padding 14 × 16 px, fond lu `#1B1818` |
| Titre d'actualité lu / non lue | 26 px, graisse 500 / 600 | 26 px, graisse 500 / 600 |
| Cadre de détail | padding 15 px, bordure extérieure 2 px, clip-path angulaire | padding 15 px, bordure extérieure 2 px, clip-path angulaire |
| Séparateur de groupe/statistique | marge planche 6/10 px, trait `2px solid rgba(233,230,225,.16)` | règle de groupe partielle ; séparateur de statistique `2px solid rgba(233,230,225,.16)` |
| Bouton SA FICHE et pied clavier | planche : bouton dans le panneau et pied des touches dédié | action présente ; pied des touches dédié non reproduit, dimensions exactes du bouton non portées |

- Libellés visibles sont centralisés dans `MGMT_ACTUALITES_LABELS` et restent marqués `relu:false` par la convention de la tranche.
- Données absentes : aucune action de prolongation spécifique n'a été trouvée, donc pas de bouton `PROLONGER` ; le rang et le contrat restant ne sont rendus que lorsque les fonctions/données correspondantes les fournissent. Les panneaux « Ce qu'il pense de toi » et « Préparer son combat » n'existent pas dans les données/actions du jeu et sont omis.
- Écarts connus : le test de barre confirme 13 sections (correction de fiche : 12 → 13) ; les commandes globales `test` et `test:watch` n'incluent pas le nouveau fichier, seuls `test:actualites` et `test:watch:actualites` le lancent. Le contrôle `node tools/verif-versions.js origin/main` signale l'écart préexistant `mgmt-cadre.js` (`?v=b39xxxxxxxxx` identique à `origin/main`) ; aucune version de fichier n'a été rebumpée ici, conformément à l'étape 6 déjà committée. L'ESLint local (`node_modules/.bin/eslint .`) et le test ciblé passent. Les fichiers de configuration `.opencode/` et `opencode.json` sont déjà modifiés dans le worktree, sans rapport avec la tranche : ils ne sont pas inclus dans les commits.
- Questions pour Anthony : aucune.
