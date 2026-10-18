# Monde lot 12 T1 — Le chargement des six ans, comme sa planche

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Planche
`maquettes/monde/refonte/MondeChargement.html` (états `?etat=debut|chargement|fin|erreur`), sa note `maquettes/monde/refonte/LISEZ-MOI.md` § 1 (« Ce que le code devra lire », « Mouvement et clavier »). Écran : `scr_mgmt_nouvelle` pendant `MGMT_NOUVELLE.gen` (`mgmt-nouvelle.js`).

## Écarts relevés par le superviseur (jeu sur `main`, 16/10/2026, 1920×1080)
1. L’en-tête ne dit pas « Nouvelle partie · six ans avant ton arrivée » ni « Emplacement N ».
2. Il manque « Lyon · depuis 2004 » et « Six années se jouent avant ton arrivée. » à côté du nom.
3. Il manque la grande année (2026), « Six ans sont écrits » / « Split Fight Night k », « 62 soirées, de 2021 à 2026 » / « Soirée k sur n », et « Kader Malika compose (a composé) les N cartes ».
4. La barre : la planche a six tranches d’années avec leurs étiquettes posées à leur vraie place et des hachures qui défilent ; le jeu a une barre rouge pleine et des étiquettes « 2021 ✓ ».
5. Il manque « Le dernier fait marquant » (dernier changement de ceinture ou dernière retraite lus par `mgmtNouvelleLireFaits`).
6. Les cartons ne sont pas dans le panneau « Ce qu’il faut savoir » avec « Carton k sur 5 » et « ← → pour lire les autres » ; le bouton jaune « Entrer dans Split » n’a pas le gabarit de la planche.
Le quatrième compteur reste « blessures » (point 1 des écarts de la note : le passé produit trop peu de retraites) — garde-le.

## Tests (`tests/mgmtNouvelle.test.js` ou le fichier existant de l’écran)
`Monde lot 12 T1 — le chargement montre l’année, le prédécesseur, la barre en six années et le dernier fait` (état chargement puis fin, sur une vraie génération courte). Commit `Monde lot 12 T1 : le chargement comme sa planche`.

## Compte rendu

- `mgmt-nouvelle.js` : port de l’en-tête, de l’identité, de l’année, du prédécesseur, des repères annuels, du dernier fait et du panneau de lecture. Données issues de la génération et des identités ; quatrième compteur « blessures » conservé. Cartons actualisés sans reconstruire la barre ; hachures, mouvement réduit, états d’erreur et focus du bouton final. Textes de la planche non relus (`relu:false`).
- `ui-cadre.css` : dimensions, couleurs, typographie et panneaux de la planche, avec adaptation des noms longs. Cadre existant de 1920 × 1080 conservé, donc même mise à l’échelle aux trois résolutions.
- `tests/mgmtNouvelleChargement.test.js` : ajout de « Monde lot 12 T1 — le chargement montre l’année, le prédécesseur, la barre en six années et le dernier fait » et « Monde lot 12 T1 — la dernière retraite est lue une fois et les noms sont échappés ». Trois attentes textuelles anciennes ajustées aux libellés expressément remplacés par la planche. Fichier déjà inscrit dans les scripts de tests ; aucun fichier de test nouveau.
- `index.html`, `sw.js` : versions de cache montées par `tools/_bump.js` ; ordre des scripts inchangé.
- Sauvegardes : aucun changement de format, aucune migration. Les repères d’années restent dans l’état temporaire de création.
- Vérification locale : 18 tests ciblés verts (`mgmtNouvelleChargement.test.js`, `mgmtNouvellePartie.test.js`) ; audit `node tools/verif-versions.js origin/main` sans écart ; `git diff --check` sans erreur. `check:rapide` laissé au superviseur. L’appel facultatif à ESLint par `npx` a été refusé par les permissions et n’a pas été exécuté.
- Relecture : effectuée localement selon le repli sans sous-agent ; aucun verdict de relecteur indépendant. Comparaison visuelle dans le navigateur aux trois tailles laissée au superviseur, conformément à la fiche.
- Écarts : une génération courte n’affiche que ses années réelles ; les six repères sont vérifiés séparément sur le calendrier normal de 62 soirées. La barre mesure désormais ces soirées, comme la planche ; le bouton attend toujours aussi la fin des sept autres organisations. Le fait de retraite reprend le libellé de la planche au singulier (« Retraite »), sans inventer de récit.
- Questions pour Anthony : aucune question bloquante ; validation visuelle finale et relecture des textes restent à faire.
