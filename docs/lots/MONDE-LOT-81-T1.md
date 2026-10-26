# Monde lot 81 T1 — l'onglet « LA CROISSANCE » (écran `croissance`) identique à `UniCroissance`

Branche : `fid-croissance` (la branche courante de ce dossier ; commits ICI ; le superviseur contrôle puis fusionne : **tu n'ouvres aucune PR**). **Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md`** (règles ; **le fond cendré reste**). Dossier de travail pour l'outil : `C:/Users/antho/Documents/cage-legacy-p81`. Tu es le SEUL à toucher `mgmt-ecran-organisation.js` et la ligne `mgmt_organisation:` de `mgmt-screens.js`.

## 1. Où en est le code (vérifié le 26/10)
- L'écran est `scr_mgmt_organisation` dans `mgmt-ecran-organisation.js` ; il est enregistré dans `mgmt-screens.js` par `mgmt_organisation:mgmtWithNav(scr_mgmt_organisation)` : **c'est l'ANCIEN écran, posé dans le cadre de compatibilité (`mf-ancien`)**. Il affiche « L'EFFECTIF, PAR CATÉGORIE » + « LES FINANCES » + une petite liste « LA CROISSANCE ». La planche n'a RIEN de cela.
- Les écrans déjà faits dans ce style (modèles à copier pour l'en-tête, les onglets, les panneaux) : `scr_mgmt_carnet` (`mgmt-ceremonie.js`, se dessine avec `mfEcran`, enregistré **sans** `mgmtWithNav`) et `scr_mgmt_poste` (`mgmt-ecran-poste.js`). Onglets : `mgmtOrgOnglets(m,'mgmt_organisation')`.
- Données : `mgmtPaliers*`, `MGMT_PALIERS`, `m.croissance`, `mgmtOrgMoneyHtml`, `mgmtPaliersHtml` : **réutilise, n'invente aucune règle de jeu**.

## 2. La planche — lis-la d'abord
`node C:/Users/antho/AppData/Local/Temp/p1/planche-outline.js "C:/Users/antho/Documents/Default Project/planches-uniques/project/UniCroissance.dc.html" 30` : porte chaque valeur. Forme attendue :
1. En-tête commun : plaque `ORGANISATION`, libellé « SPLIT · 4e DES HUIT », à droite « Dans 34 jours », date/lieu, « SPLIT FIGHT NIGHT n » (n en rouge) ; rangée d'onglets DANS le contenu (LE CLASSEMENT DES HUIT / **LA CROISSANCE** actif en fond ivoire / TON POSTE / TON CARNET) avec « Popularité 43 ▲ +3 » à droite (« 43 » EXTRA 32 px, flèche jaune).
2. **Un grand panneau de quatre échelles** (cadre triple `mf-panneau`) : LES SALLES (Gymnase 1 500 places · Palais 4 000 · Dôme 9 000 · Aréna 16 000), LE DIFFUSEUR (Régional · National · Européen · Mondial), LE RECRUTEUR (La France · L'Europe · Le monde 1 mission · Le monde 2 missions), LES AGENTS LIBRES (Les oubliés · Les bons · Les très bons · Les meilleurs). Pour chaque échelle : à gauche titre EXTRA 30 px + explication 22 px grise ; puis **4 marches ≈ 56 px de diamètre reliées par un trait horizontal** : **rond blanc avec ✓ noir = franchie ; rond JAUNE = en cours ; rond au contour gris foncé, vide = à venir** ; le trait est **jaune** sur la partie franchie, **gris** sur la suite ; nom de la marche dessous (22-24 px, capitales, jaune pour la marche en cours) puis sa précision (22 px grise : « 9 000 places », « Toute la France »).
3. **Panneau « LA PROCHAINE MARCHE » à droite** : libellé jaune 22 px, nom EXTRA 40 px (« L'ARÉNA DE LYON »), texte 22-24 px, puis trois lignes label gris / valeur EXTRA 28 px à droite (Popularité 43 / 50, Rang des huit 4e / 3e, Salles pleines de suite 1 / 3), note grise en bas du panneau.
**Le jeu actuel a des octogones gris pleins sans trait** (version tentée par un autre codeur, abandonnée) : ne reprends pas cette version.

## 3. À NE PAS CASSER — un autre codeur a déjà échoué ici (PR fermée, 6 tests rouges). Lance AVANT de coder : `node --test` sur : `tests/mgmtLot56T1.test.js tests/mgmtLot48T1.test.js tests/mgmtCadre.test.js tests/mgmtOrganisations.test.js tests/mgmtSoiree.test.js tests/mgmtFidelite.test.js tests/nomsApostrophe.test.js tests/mgmtLot67T1.test.js tests/mgmtEcransAccessibles.test.js` (ils passent sur main ; note le nombre de réussites). Ce qu'ils EXIGENT de l'écran organisation :
- `mgmtLot48T1` : le HTML de l'écran contient le texte **« Ton poste »** (le lien/onglet suffit).
- `mgmtLot56T1` : (a) **les classes `cr3-*` de l'écran ont chacune une règle dans `ui-cadre.css` et aucun texte < 22 px** (si tu changes de préfixe de classes, adapte le test en gardant la vérification + commentaire `/* Décision : planches Uni* validées par Anthony ; l'écran suit UniCroissance */`) ; (b) le HTML contient **LES SALLES, LE DIFFUSEUR, LE RECRUTEUR, LES AGENTS LIBRES** ; (c) le HTML contient le texte **« Popularité N et rang N ou mieux »** (ou « Le sommet atteint ») : c'est la condition de la prochaine marche : écris-la dans le panneau « LA PROCHAINE MARCHE ».
- `mgmtOrganisations` : **jamais « Split » comme organisation du joueur** dans une partie commencée ailleurs : le nom vient de `mgmtOrgNom(m)`, jamais d'une constante.
- `mgmtCadre` « Écrans anciens… navigation d'origine intacte dans le HTML » : pour `mgmt_organisation` le test attend 4 vrais ; si l'écran n'est plus un écran ancien, **mets ce test à jour en conservant la vérification des autres écrans** (retire seulement `mgmt_organisation` de la liste des écrans anciens, avec le commentaire de décision).
- `mgmtSoiree.test.js` (≈ ligne 473 « navigation mgmt_organisation ») : au moins 1 bouton de navigation dans l'écran (les onglets comptent).
- `mgmtFidelite.test.js` (≈ ligne 75) : nombre de panneaux `.mf-ancien .mf-panneau.mf-sem-p` pour `mgmt_organisation` : passe à **0** (l'écran n'est plus ancien), avec le commentaire de décision.
- `nomsApostrophe` : toute donnée dans un `onclick="…'…'…"` passe par **`escJsAttr()`** (un nom d'organisation avec apostrophe a déjà cassé un bouton : « Unexpected identifier 'Eclair' ») ; noms affichés via `esc()`/`mfNet()`.
- **Garde dans le HTML, dans une zone qui défile SOUS la planche** (ou derrière le même onglet), « L'EFFECTIF, PAR CATÉGORIE » et « LES FINANCES » (des tests anciens les lisent : cherche `tests/*Organisation*`, `mgmtEconomie*`, `mgmtLot5*`).

## 4. Critères d'acceptation (tu ne dis `TOUT_EST_FINI` que si TOUT est vrai, sinon écris précisément ce qui reste)
1. `bash C:/Users/antho/AppData/Local/Temp/p1/audit.sh C:/Users/antho/Documents/cage-legacy-p81 croissance` : lignes `croissance` et `croissanceLong` à `0 0 0` (chevauchements, <22px, coupés) ; `moyen` ≤ 22 et `grosBlocs` ≤ 16 (départ : 27,5 / 20,5).
2. Les 9 fichiers de test du §3 verts. `npx eslint .` propre. `node tools/_bump.js` sur chaque fichier modifié puis `node tools/verif-versions.js origin/main` : « aucun écart ». **Jamais `sw.js`.**
3. Aucune PR : tu commites dans la branche ; ton compte rendu liste fichiers modifiés, tests mis à jour (avec la décision citée), lignes CONTRÔLE avant/après.

## Compte rendu

- `mgmt-ecran-organisation.js` : l'écran `croissance` devient un écran `mfEcran` et réutilise les paliers de croissance ainsi que les onglets d'organisation. Les informations historiques restent dans le HTML, masquées sous le nouvel écran.
- `mgmt-screens.js` : enregistrement direct de `scr_mgmt_organisation`, sans `mgmtWithNav`.
- `ui-cadre.css` : styles préfixés `cr3-*` pour l'en-tête d'onglets, les échelles et le panneau de prochaine marche.
- `index.html` : versions des deux scripts et de la feuille CSS modifiés.
- Tests mis à jour : `mgmtCadre.test.js` (retrait de l'écran de la liste des anciens), `mgmtFidelite.test.js` (zéro panneau ancien), `mgmtSoiree.test.js` (navigation par onglets), `nomsApostrophe.test.js` (navigation du cadre). Les mises à jour portent le commentaire de décision `/* Décision : planches Uni* validées par Anthony ; l'écran suit UniCroissance */`.
- Tests exigés : 72 réussites, 0 échec pour les neuf fichiers ciblés. ESLint et vérification de versions : aucun écart relevé. Pas de nouvelle sauvegarde ni migration.
- Contrôle avant : `croissance` / `croissanceLong` — chevauchements 8, textes <22 px 4, coupés 0, défilent 1 ; moyen 24,3, grosBlocs 17,1.
- Contrôle après capture de `shoot.js` : `croissance` et `croissanceLong` — chevauchements 0, textes <22 px 0, coupés 0, défilent 0 ; moyen 20,3, grosBlocs 13,9.
- Écart assumé : les valeurs variables d'en-tête restent dérivées de la partie via `mfEcran` (organisation, soirée et date) au lieu d'être figées sur les valeurs d'exemple de la planche.
- Questions pour Anthony : aucune.
