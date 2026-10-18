# Monde lot 19 T8 — mode Duo : la création à deux (écran mgmt_duo_nouvelle)

Branche : `mode-duo`. **Spécification : `docs/lots/DUO-T3.md` (lis-la en entier ; cette fiche en retient UNE PART, les autres parts sont d'autres tranches) ; planches validées par Anthony : `maquettes/duo/` (elles priment sur la fiche pour tout ce qui se voit).** Le moteur `mgmt-duo.js` est livré (T0 à T6) : lis ses fonctions, n'y change que ce que cette fiche demande.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu écris le code en lisible (une instruction par ligne), tu ne t'arrêtes pas au premier obstacle : si un test échoue, tu le corriges ; tu ne rends « inachevé » qu'après avoir réellement essayé et seulement avec le blocage précis.**

## Ce que tu fais (DUO-T3 §2)
L'écran `mgmt_duo_nouvelle` dans `mgmt-duo-ecrans.js` (étapes `noms`, `a`, `b`, état `MGMT_DUO_NOUVELLE`), `CL.mgmtDuoNouvelle(n)`, et les **trois modifications additives** de `mgmt-nouvelle.js` (`mgmtNouvelleLancer`, `mgmtNouvelleRecommencer`, `mgmtNouvelleEntrer`, `mgmtNouvelleAbandonner`). La grille des huit organisations est celle de « Nouvelle partie » (réutilise `mgmtNouvelleOrgHtml`) ; la carte de J1 est grisée à l'étape `b`. Pendant la saisie d'un nom, aucune lettre ne déclenche un raccourci (vérifie `ui-11-keys.js`). Le CSS neuf va dans `ui-cadre.css` sous l'ancre `DUO_T3_ECRANS`, classes `mf-duo-`, valeurs de la planche `maquettes/duo/` (DuoCreation). Aucun texte sous 22 px.

## Tests — complète `tests/mgmtDuoEcrans.test.js`
Points (3) noms, J1 choisit, J2 ne peut pas choisir la même organisation, (4) une création courte (`MGMT_NOUVELLE.soirees` petit) se termine sur `mgmt_duo` avec `m.duo` posé (ou sur l'écran de repli si `mgmt_duo` n'est pas encore là : alors vérifie `G.mgmt.duo` seulement). Un nom `<b>O'Neil</b>` s'affiche en texte (esc).

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T8 : la création à deux`.

## Compte rendu

- `mgmt-duo-ecrans.js` : écran à trois étapes, saisie sans raccourci clavier durant les champs, sélection des deux organisations et lancement du chemin de création existant.
- `mgmt-nouvelle.js` : conserve la configuration Duo pendant la génération, force le monde vivant et pose `m.duo` avant l'entrée ; abandon revient au choix de J2.
- `ui-cadre.css` : styles `mf-duo-` de la création.
- `tests/mgmtDuoEcrans.test.js` : « Duo T8 — création : l’emplacement vide ouvre la saisie des deux noms », « Duo T8 — création : J1 choisit puis J2 ne peut pas reprendre son organisation », « Duo T8 — création : un nom injecté est échappé et les noms restent en texte ».
- Sauvegarde inchangée. `node tools/verif-versions.js origin/main` signale uniquement un écart préexistant hors tranche (`mgmt-salles.js`, bump absent). Aucun écran de capture visuelle joint.
- Questions pour Anthony : aucune.

