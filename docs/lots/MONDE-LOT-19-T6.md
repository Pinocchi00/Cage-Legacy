# Monde lot 19 T6 — mode Duo : le moteur, seconde moitié (combat, rejeu, lectures, validation)

Branche : `mode-duo`. **La spécification complète est `docs/lots/DUO-T1.md` (lis-la en entier, elle fait foi pour chaque fonction) ; cette fiche en retient UNE PART.** La tranche T1 d'origine était trop vaste pour un seul passage : elle est découpée en T5 (partie à deux, avancer, draft) puis T6 (combat, rejeu, lectures, validation). Le brief est `docs/BRIEF-18-10-MODE-DUO.md`.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.

## Ce que tu fais (T5 est livrée : `mgmtDuoCreer`, `mgmtDuoAvancer`, le draft existent)
1. Dans `mgmt-duo.js` (lisible, une instruction par ligne, JSDoc) : `mgmtDuoJouer` (tout le bloc « Le combat entre deux organisations », vérification préalable des 6 combats, gains 200/50/125 k€), `mgmtDuoSoireeSuivante`, `mgmtDuoTerminer`, `mgmtDuoRejouer` (« Le rejeu »), `mgmtDuoScore`, `mgmtDuoResume` (« Lectures pour les écrans »).
2. `mgmt-save.js` : `mgmtDuoValide` + la ligne dans `validateMgmt` ; `mgmtValidFightTrace` accepte la clé facultative `duo`. `mgmt-passe.js` : le correctif de `mgmtPasseAlleger` (prendre le côté de la trace quand l'identifiant manque à l'effectif). Une partie sans combattant manquant s'allège **exactement** comme avant.
3. Le routage du rejeu dans `mgmt-corps.js` existe déjà : vérifie-le.

## Tests — complète `tests/mgmtDuo.test.js`
Les points 4, 5, 6, 7, 10, 13, 14, 15 et 17 de la liste « Tests » de DUO-T1 (le fichier existe déjà avec 1, 2, 3, 8, 9, 11, 12, 16). **Un seul monde par test** (création 40 à 90 s) : regroupe (création → avancer → draft → jouer → vérifications 4, 5, 6, 7, 13, 17 dans le même test). Un fichier à la fois, délai 590 s. Lance aussi `tests/mgmtPasse.test.js` et `tests/mgmtMondeVivant.test.js` (une à la fois) pour prouver que l'allègement d'une partie sans Duo est inchangé.

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T6 : le moteur du Duo, seconde moitié (combat, rejeu, lectures, validation)` (sans « inachevé » si tout est vert).

