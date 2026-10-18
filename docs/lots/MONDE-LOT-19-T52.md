# Monde lot 19 T52 — mode Duo : les enchères, au balisage exact de la planche

Branche : `duo-p3` (la branche courante de ce dossier ; copie de travail de `duo-int` ; commits ICI, sur `duo-p3`, le superviseur fusionne ensuite). **Pourquoi cette tranche** : l'écran existe et fonctionne mais il n'a PAS l'apparence de la planche validée par Anthony (page nue, texte géant). Le superviseur a posé la base : `ui-duo.css` (la feuille des planches portée telle quelle sous `.duo-s`, GÉNÉRÉE par `tools/duo-css.js` : ne la modifie jamais, n'écris aucun autre CSS), `mgmt-duo-ui.js` (aides `duoCadre`, `duoEntete`, `duoPan`, `duoTitre`, `duoForme`, `duoTouches`, `duoEuros`, `duoEsc`, `duoMaj`…) et le **QG déjà porté** : `mgmtDuoQGHtml` dans `mgmt-duo-ecrans.js` est ton MODÈLE (même démarche).
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu ne t'arrêtes pas au premier obstacle ; tu ne rends « inachevé » qu'après avoir réellement essayé, avec le blocage précis.**

## Ce que tu fais
1. Lis le bloc de la planche **DuoEncheres** dans `maquettes/duo/src/construire.js` (lignes 176 à 215) : c'est le balisage exact de chaque état. Lis aussi `maquettes/duo/LISEZ-MOI.md`.
2. Réécris `l'écran `mgmt_duo_encheres`` (mgmt-duo-encheres.js) pour qu'elle émette **exactement ce balisage** (mêmes éléments, mêmes classes, mêmes textes fixes, même ordre) avec les données du jeu à la place de `donnees.json`, enveloppé par `duoCadre(...)`. Un seul état est émis à la fois (celui de la partie) : pas d'attribut `data-etat`, pas de `.vis` nécessaire.
3. Supprime ce qui devient inutile : les classes `mf-duo-*` de cet écran et le fichier `ui-duo-encheres.css` (retire sa balise `<link>` d'`index.html`). **N'ajoute aucun CSS.**
4. Garde les fonctions `CL.*` et les touches (`keysRegister`) existantes ; rends cliquables (`onclick`) les éléments que la planche montre comme boutons ou touches. Tout nom affiché passe par `duoEsc`.
5. Si la planche montre une donnée que le jeu ne fournit pas encore (champ absent), calcule-la avec les fonctions de `mgmt-duo.js` (jamais d'invention) ; sinon note-le dans le compte rendu.

## Tests
Le HTML contient `duo-s` et les classes du bandeau « À {nom} de miser » (`tour`), du lot, du prix, des caisses ; l'adjudication et le refus de caisse (état `caisse` de la planche) sont rendus comme la planche. Un monde coûte 40 à 90 s à créer : n'en crée qu'un par test (helpers `AVANCER`, `DRAFT` de `tests/mgmtDuo.test.js`). Un fichier à la fois, délai 590 s. Les tests existants de cet écran restent verts ; n'adapte une assertion de texte que si la planche change le libellé (cite-le).

## Fin
`node tools/_bump.js` sur chaque `.js` et `.css` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T52 : <titre court>` (le numéro T52 est obligatoire dans le message).
