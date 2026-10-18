# Monde lot 19 T9 — mode Duo : le QG (écran mgmt_duo) et la progression

Branche : `mode-duo`. **Spécification : `docs/lots/DUO-T3.md` (lis-la en entier ; cette fiche en retient UNE PART, les autres parts sont d'autres tranches) ; planches validées par Anthony : `maquettes/duo/` (elles priment sur la fiche pour tout ce qui se voit).** Le moteur `mgmt-duo.js` est livré (T0 à T6) : lis ses fonctions, n'y change que ce que cette fiche demande.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu écris le code en lisible (une instruction par ligne), tu ne t'arrêtes pas au premier obstacle : si un test échoue, tu le corriges ; tu ne rends « inachevé » qu'après avoir réellement essayé et seulement avec le blocage précis.**

## Ce que tu fais (DUO-T3 §3)
L'écran `mgmt_duo` (deux colonnes égales, score de la saison, caisse, classement, champions, « Depuis la dernière super carte », bouton jaune de l'étape selon `m.duo.etape`, touches `1`, `2`, `H`, Échap), et `CL.mgmtDuoAvancer()` (un pas `mgmtDuoAvancerPas` par image, barre de progression, aucune touche pendant la progression, message `La progression s'est arrêtée. Réessayer` en cas d'erreur, `G.mgmt` rendu). Les écrans de la T4 (`mgmt_duo_encheres`, `mgmt_duo_draft`, `mgmt_duo_soiree`, `mgmt_duo_bilan`) n'existent pas encore : le bouton n'est pas affiché si l'écran est absent de `SCREENS`, l'étape s'écrit en texte. Valeurs exactes de la planche `maquettes/duo/` (DuoQG) ; CSS dans `ui-cadre.css` sous `DUO_T3_ECRANS`. Tous les noms passent par `esc()`.

## Tests — complète `tests/mgmtDuoEcrans.test.js`
Points (6) le QG montre les deux organisations, les deux noms (esc), le bouton de l'étape, (7) `CL.mgmtDuoAvancer()` va jusqu'à la date et le QG montre l'étape suivante, (9) aucun texte de travail (`EMPLACEMENT AUTEUR`, `TODO`).

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T9 : le QG du Duo et la progression`.

