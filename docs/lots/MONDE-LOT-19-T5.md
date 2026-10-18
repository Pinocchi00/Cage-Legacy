# Monde lot 19 T5 — mode Duo : le moteur, première moitié (partie à deux, avancer, draft)

Branche : `mode-duo`. **La spécification complète est `docs/lots/DUO-T1.md` (lis-la en entier, elle fait foi pour chaque fonction) ; cette fiche en retient UNE PART.** La tranche T1 d'origine était trop vaste pour un seul passage : elle est découpée en T5 (partie à deux, avancer, draft) puis T6 (combat, rejeu, lectures, validation). Le brief est `docs/BRIEF-18-10-MODE-DUO.md`.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.

## Ce que tu fais
1. **Réécris `mgmt-duo.js` en entier** : le fichier existant (commit `43e245d`) est un amorçage illisible en lignes uniques et incomplet ; garde les noms mais écris le code **lisible, une instruction par ligne**, JSDoc sur chaque fonction. Le routage `mgmtReplayFight` de `mgmt-corps.js` (une ligne) reste tel quel.
2. Implémente de DUO-T1 : les constantes ; `m.duo` ; fonctions 1 à 7 (`mgmtDuoActif`, `mgmtDuoPartie`, `mgmtDuoAvec`, `mgmtDuoCreer`, `mgmtDuoProchaineSoiree`, `mgmtDuoAvancerPas`, `mgmtDuoAvancer`, y compris **la caisse stable** des deux côtés) ; tout « Le draft » (`mgmtDuoDraftOuvrir`, `mgmtDuoDisponibles`, `mgmtDuoPlacables`, `mgmtDuoPlacer`, `mgmtDuoRepondre`, `mgmtDuoAnnuler`, `saveMgmt()` après chaque geste réussi).
3. **Pas dans cette tranche** (T6) : `mgmtDuoJouer`, `mgmtDuoSoireeSuivante`, `mgmtDuoTerminer`, `mgmtDuoRejouer`, `mgmtDuoScore`, `mgmtDuoResume`, la validation `mgmtDuoValide` et les deux validateurs/allègement. Laisse-les absents.

## Tests — `tests/mgmtDuo.test.js` (nouveau, à inscrire dans `test` et `test:watch` de `package.json`, à la suite de `tests/mgmtDuoMonde.test.js`)
**La création d'un monde coûte 40 à 90 s** : n'en crée qu'UN par test et regroupe plusieurs vérifications dans le même test quand elles se suivent (création → avancer → draft). Intitulés `Duo T1 — <point>`, pour les points 1, 2, 3, 8, 9 (sauvegarde/chargement à chaque étape créée), 11 (déterminisme, deux fenêtres), 12 (une partie sans `duo` se joue comme avant) et 16 (caisse stable) de la liste « Tests » de DUO-T1. Un fichier à la fois, délai 590 s.

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T5 : le moteur du Duo, première moitié (partie à deux, avancer, draft)` (sans « inachevé » si tout est vert).

## Compte rendu
- Fichiers modifiés : `mgmt-duo.js` — formatage et correction des noms par défaut lors de la création.
- Tests ajoutés : aucun.
- Migration de sauvegarde : aucune.
- Écarts à la fiche : tranche non terminée ; le draft complet et les tests prescrits ne sont pas implémentés. Le fichier contenait également plusieurs fonctions T6 hors périmètre, laissées en place.
- Questions pour Anthony : compléter l'implémentation et les tests T5 avant de considérer la tranche livrée.

