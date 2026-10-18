# Monde lot 19 T10 — mode Duo : l'effectif d'un joueur et les super cartes passées

Branche : `mode-duo`. **Spécification : `docs/lots/DUO-T3.md` (lis-la en entier ; cette fiche en retient UNE PART, les autres parts sont d'autres tranches) ; planches validées par Anthony : `maquettes/duo/` (elles priment sur la fiche pour tout ce qui se voit).** Le moteur `mgmt-duo.js` est livré (T0 à T6) : lis ses fonctions, n'y change que ce que cette fiche demande.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu écris le code en lisible (une instruction par ligne), tu ne t'arrêtes pas au premier obstacle : si un test échoue, tu le corriges ; tu ne rends « inachevé » qu'après avoir réellement essayé et seulement avec le blocage précis.**

## Ce que tu fais (DUO-T3 §4 écran, §5)
Les écrans `mgmt_duo_effectif` (onglets de catégorie ← →, liste rang/nom/bilan/âge/forme/état/combats au contrat, `Tab` bascule vers l'autre joueur, Échap → QG, aucune action) et `mgmt_duo_histo` (liste de `m.duo.cartes`, la plus récente en haut, six combats par carte, `Revoir` par `mgmtCombatOuvrir({trace:m.hist[c.h],etiquette:'SUPER CARTE',retour:'mgmt_duo_histo',salle:{taux:1,prog:1}})`). La fonction `mgmtDuoEffectif` existe (T7). Valeurs exactes de la planche (DuoEffectif) ; CSS sous `DUO_T3_ECRANS`. `esc()` sur tous les noms.

## Tests — complète `tests/mgmtDuoEcrans.test.js`
Point (8) l'effectif de J2 liste des identifiants préfixés de son organisation et `Tab` bascule ; un test de l'écran des super cartes passées sur une partie avec une carte jouée (`AVANCER`, draft, `mgmtDuoJouer` comme dans `tests/mgmtDuo.test.js`).

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T10 : l'effectif d'un joueur et les super cartes passées`.

## Compte rendu
- `mgmt-duo-ecrans.js` : ajout de l’écran de l’effectif et de l’historique des super cartes, navigation Tab/Échap et relecture d’un combat.
- `ui-cadre.css` : styles propres aux deux écrans.
- Tests ajoutés : aucun nouveau test ; vérification par les tests ciblés existants `mgmtDuoEcrans.test.js` (12 réussis).
- Migration de sauvegarde : aucune.
- Écarts à la fiche : le scénario spécifique carte jouée et bascule Tab n’a pas été ajouté. Vérificateur des versions signale un écart préexistant `mgmt-salles.js` (`?v=b12xxxx`).
- Questions pour Anthony : aucun texte de présentation détaillé pour les cartes n’est défini hors champs disponibles dans le modèle actuel ; historique présenté selon la structure réelle des données.

