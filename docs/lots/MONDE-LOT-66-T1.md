# Monde lot 66 T1 — fidélité aux maquettes : le lendemain en deux écrans

Branche : `fid-lendemain` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Les maquettes (`docs/planches-uniques/Uni*.dc.html`) sont validées par Anthony : l'écran du jeu doit leur ressembler.** Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` : un outil capture ton écran à 1920×1080 et le compare à la maquette (`cmp-<écran>.png` : jeu à gauche, maquette à droite). **Utilise-le après chaque étape.**

Écrans de ta tranche : `lendemain` (maquette `UniLendemain`) et `lendemainSuite` (maquette `UniLendemainSuite`). Fichiers : `mgmt-lendemain-cadre.js`, `mgmt-ecran-lendemain.js`, `mgmt-histoires*.js`, `ui-cadre.css`. Le compte rendu du lot 54 est en bas de `docs/lots/MONDE-LOT-54-T1.md`.

## Écart constaté le 24/10 (majeur, écart 33 %)
Le jeu affiche **l'ancien lendemain** (trois cases rouges LA SALLE / L'ARGENT / LA POPULARITÉ, puis « LE PUBLIC 52 SUR 100 » et un petit cadre « CE QUI CHANGE » qui contient « LES TROIS MOMENTS » écrasés et coupés, puis « TOUS LES RÉSULTATS » en bas). **La maquette est toute autre** : (1) en haut **trois grandes cartes** « LA SURPRISE », « LA FINITION », « LA GUERRE » (étiquette, catégorie, noms en très grand, pronostic ou temps, phrase), chacune avec la touche R « revoir » ; (2) en dessous **« CE QUE ÇA CHANGE POUR TOI »** (liste à puces : suivis, espoirs, objectifs du contrat, patron) ; (3) la carte **presse** « CAGE HEBDO · LA UNE » (gros titre, chapeau, citation du discours en bas) ; (4) **« LES CHIFFRES »** (salle, argent, popularité, public) ; (5) touches « R Revoir un moment · ↓ La suite · Tab Bloc suivant · Entrée Préparer Split Fight Night 65 ». **La suite** (`UniLendemainSuite`) : la presse en entier, les mouvements notables, les résultats complets, en trois colonnes.
Les données existent déjà : le poids d'une histoire (`mgmt-histoires*.js`), les primes, les discours, les suivis et espoirs, la presse (`mgmt-actualites*.js`), l'argent et la salle. **Ne crée aucune mécanique** ; branche l'existant.

## Cases
**[ ] 1.** Recompose `mgmt_lendemain` sur `UniLendemain` : trois cartes (les trois moments avec Revoir, déjà calculés), « Ce que ça change pour toi », carte presse « la une », « Les chiffres ». L'ancien contenu disparaît de cet écran (il vit dans la suite ou n'existe plus).
**[ ] 2.** Recompose `mgmt_lendemain_suite` sur `UniLendemainSuite`.
**[ ] 3.** Navigation : R revoit le moment sélectionné, ↓ ou Tab passent à la suite, Entrée prépare la soirée suivante, Échap ne casse rien ; le chemin `fin de soirée → lendemain` (lot 65 refait la fin de soirée en parallèle : ne touche pas ses fichiers) reste atteignable.
**[ ] 4.** Capture et `cmp-…png` à chaque étape ; objectif : `grosBlocs` ≤ 20 %, aucun bloc manquant, aucun chevauchement, aucun texte sous 22 px, aucune animation CSS (décision du 07/10).
**[ ] 5.** Tests : les existants (notamment `mgmtLot54T1`, `mgmtLot48T1`, `mgmtSoireeShow`) restent verts ; ceux qui décrivaient l'ancienne structure sont **mis à jour en citant la décision** (« planches Uni* validées par Anthony ; l'écran suit la planche ») ; ajoute des tests de présence des blocs et « chaque classe a sa règle ».
**[ ] 6.** `?v=`, versions, lint ; commit final `Monde lot 66 T1 : le lendemain fidèle aux planches` ; compte rendu honnête (avant/après) ; `TOUT_EST_FINI`.

Règles communes : **additif** pour les données ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
