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

## Compte rendu

- `mgmt-duo-ecrans.js` : ajout du QG à deux colonnes, données des organisations/joueurs, score, caisse, classement, champions, combats récents échappés, action d'étape et progression asynchrone.
- `ui-cadre.css` : styles du QG et de sa progression, sous l'ancre dédiée T9.
- `tests/mgmtDuoEcrans.test.js` : tests « Duo T9 — le QG montre les deux organisations, les deux noms échappés et le bouton de l’étape », « Duo T9 — mgmtDuoAvancer atteint la date et le QG montre l’étape suivante », « Duo T9 — le QG ne contient aucun texte de travail ».
- Migration de sauvegarde : aucune ; `MGMT_SAVE_VERSION` inchangée.
- Vérification des versions : le contrôle signale l'écart préexistant de `mgmt-salles.js` face à `origin/main` ; ce fichier n'appartient pas à la tranche et n'a pas été modifié.
- Reprise après relecture : les boutons d'effectif et les touches `1`/`2` sélectionnent maintenant le côté J1/J2 ; `Super cartes passées` et `H` sont affichés/actifs uniquement si `m.duo.cartes` contient des cartes.
- Contrôle visuel/captures : non effectué. Aucun navigateur/capteur n'a été exécuté ; les captures obligatoires du QG, de l'effectif et de la création aux résolutions 1280, 1440 et 1920 px restent à produire. Pas de captures jointes.
- Fichiers modifiés pour la reprise : `mgmt-duo-ecrans.js` (sélection du côté des effectifs, historique et raccourci H) ; `index.html` (version cache montée par `node tools/_bump.js`). Les modifications locales `.opencode/agents/*.md`, `opencode.json` et `sw.js` sont hors périmètre et laissées non ajoutées au commit.
- Tests : suite `tests/mgmtDuoEcrans.test.js`, 12 passés ; aucun intitulé de test ajouté. Vérification versions : écart préexistant `mgmt-salles.js` inchangé.
- Écarts à la fiche : contrôle visuel obligatoire non réalisé, donc aucune capture ne peut être jointe.
- Questions pour Anthony : aucune.

