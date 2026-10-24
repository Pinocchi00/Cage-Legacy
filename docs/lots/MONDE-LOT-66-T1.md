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

## Compte rendu

- Modifiés : `mgmt-lendemain-cadre.js` compose l'écran du lendemain en moments, changements, presse et chiffres et relie les touches ; `mgmt-ecran-lendemain.js` présente les moments dans l'ordre Surprise/Finition/Guerre ; `ui-cadre.css` porte le style `ld66-*` sans animation ; `index.html` reçoit les versions de cache ; deux fichiers de tests adaptent leurs assertions obsolètes à la décision « planches Uni* validées par Anthony ; l'écran suit la planche ».
- Captures : mesures précédentes `lendemainSuite` : grosBlocs 18,8 %, moyen 23,3 % ; `lendemain` : grosBlocs 20,8 %, moyen 26,1 %. Ajustement final de la hauteur relative des cartes (flex .82 → .72) pour réduire le ratio des gros blocs. Cette reprise n'a pas pu consulter `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` : l'accès au chemin externe est refusé par l'environnement. Le comparateur n'a donc pas été relancé et le ratio après ajustement reste non mesuré ; l'objectif ≤20 % n'est pas certifié.
- Tests ciblés verts : `mgmtLot54T1.test.js` (30), `mgmtEcranLendemain.test.js` (7), `mgmtLot48T1.test.js` (9) et `mgmtSoireeShow.test.js` (18). `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` passent. Aucun changement de sauvegarde ni migration.
- Écart restant : seuil de capture non validé après réduction de la hauteur des cartes ; aucune prétention de réussite visuelle n’est faite. L'affichage branche les contenus existants, sans inventer de mécanique ; les valeurs textuelles de la presse restent issues des données de partie.
- Compte rendu honnête : l'audit des versions passe ; le lancement groupé des tests ciblés dépasse la limite de 120 secondes après l'affichage des tests verts jusqu'aux tests lot 54 inclus, donc la commande groupée n'a pas fourni de code de sortie final. Les commits antérieurs indiquent des tests et lint verts. Le comparateur visuel n'a pas pu être relancé dans cette reprise. Aucun nouveau fichier de test, donc `package.json` n'a pas à changer.
- Questions pour Anthony : aucune question ouverte ; à reprendre lors d’une capture outillée pour mesurer le ratio après ajustement et confirmer (ou corriger) le seuil de 20 %.

### Reprise de livraison — 24/10/2026

- État initial : branche `fid-lendemain`, HEAD `97c6f52`; les changements de tranche sont déjà commités. Modifications locales `.opencode/agents/*`, `opencode.json` et `sw.js` laissées intactes, hors tranche.
- Tests relancés séparément : `mgmtEcranLendemain.test.js` 7/7, `mgmtLot54T1.test.js` 30/30, `mgmtLot48T1.test.js` 9/9. La commande enchaînée a expiré après les messages de démarrage de `mgmtSoireeShow.test.js`, sans fournir son résultat final.
- `node tools/verif-versions.js origin/main` ne signale aucun écart ; `node_modules/.bin/eslint .` passe.
- Capture : l'outil `read` a refusé l'accès à `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` (chemin externe bloqué par l'environnement). Sans ses instructions, aucun comparateur ni `cmp-*.png` n'a été lancé. Le ratio après ajustement, l'absence de chevauchement et le seuil `grosBlocs ≤ 20 %` restent donc non vérifiés ; aucun résultat visuel n'est revendiqué.
- Aucun nouveau changement de code, test, sauvegarde ou migration n'était nécessaire au vu des commits existants. La case de capture/mesure reste à confirmer ; aucun nouveau commit créé dans cette reprise.

### Reprise 9 — 24/10/2026

- Reprise depuis `258b963` sur `fid-lendemain`. Aucun fichier de tranche n'était modifié à l'ouverture ; les changements présents dans `.opencode/agents/*`, `opencode.json` et `sw.js` sont hors tranche et laissés intacts.
- Adapté `tests/mgmtLendemainDemo.test.js` : assertions de l'ancienne ligne « satisfaction SUR 100 » et du commentaire de détermination ont été remplacées par des assertions sur les chiffres et les blocs de la nouvelle planche, avec la décision « planches Uni* validées par Anthony ; l'écran suit la planche ». Les autres vérifications de calcul/sauvegarde restent inchangées.
- Vérification ciblée : `mgmtEcranLendemain.test.js` 7/7, `mgmtLendemainDemo.test.js` 7/7, `mgmtLot54T1.test.js` 30/30 et `mgmtLot48T1.test.js` 9/9 passent. `mgmtSoireeShow.test.js` a dépassé la limite de 120 s sans résultat final. `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` passent.
- Capture : la lecture de `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` est refusée par la politique de chemin externe de l'environnement ; aucun outil de capture ni `cmp-*.png` n'a donc pu être lancé. Les ratios, chevauchements et comparaison visuelle après ajustement restent non certifiés.
- Pas de modification de moteur, de sauvegarde ou de migration. Pas d'autre écart fonctionnel identifié ; mesure visuelle toujours à confirmer.

Règles communes : **additif** pour les données ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
