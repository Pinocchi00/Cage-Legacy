# Monde lot 19 T14 — mode Duo : le bilan et la partie complète

Branche : `mode-duo`. **Spécification : `docs/lots/DUO-T4.md` (lis-la en entier ; cette fiche en retient UNE PART) ; planches validées par Anthony : `maquettes/duo/` (elles priment pour tout ce qui se voit ; valeurs dans `maquettes/duo/src/duo.css`).** Le moteur `mgmt-duo.js` (T0 à T6, T2 enchères) et le QG (T9) sont livrés. Tout va dans `mgmt-duo-ecrans.js`, CSS dans `ui-cadre.css` sous l'ancre `DUO_T4_ECRANS`, classes `mf-duo-`. Règle des deux joueurs : l'écran dit en haut, en grand, à qui c'est (J1 `#E23A2B`, J2 `#1B8C8F` / texte `#3FB7BA`). `esc()` sur tout nom. Aucun texte sous 22 px.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu écris le code en lisible (une instruction par ligne), tu ne t'arrêtes pas au premier obstacle : si un test échoue, tu le corriges ; tu ne rends « inachevé » qu'après avoir réellement essayé et seulement avec le blocage précis.**

## Ce que tu fais (DUO-T4 §4 et le récapitulatif clavier)
L'écran `mgmt_duo_bilan` (bandeau vainqueur ou `Égalité`, score, six combats avec `Revoir`, `L'argent de la super carte`, `Recrues des enchères`, la saison à la 4e carte, `Retour au QG` → `mgmtDuoTerminer(G.mgmt)` puis `mgmt_duo`), les `keysRegister` de tous les écrans Duo (récapitulatif de DUO-T4), puis un test de partie complète.

## Tests
**Un monde coûte 40 à 90 s : n'en crée qu'un par test** (voir `tests/mgmtDuo.test.js`, helpers `AVANCER` et `DRAFT`). Un fichier à la fois, délai 590 s. Complète `tests/mgmtDuoEcrans.test.js`, intitulés `Duo T4 — <point>`. Points (7) bilan : vainqueur, six lignes, retour au QG avec l'étape `attente` et la date suivante ; (10) partie complète : création courte, avancer, enchères (une mise de chaque côté), draft complet, soirée en `P`, bilan, puis une deuxième super carte où le perdant commence. Ne lance PAS `npm run check` (le superviseur s'en charge).

## Fin
`node tools/_bump.js`, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T14 : le bilan de la super carte et la partie complète`.

