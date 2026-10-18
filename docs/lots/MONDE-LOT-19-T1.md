# Monde lot 19 T1 — mode Duo : le moteur du Duo (m.duo, création, avancer, draft, combat, score)

Branche : `mode-duo`. **Ta spécification complète est `docs/lots/DUO-T1.md` : lis-la en entier, c'est elle qui fait foi pour le code** ; le brief est `docs/BRIEF-18-10-MODE-DUO.md` (le pourquoi) ; les planches validées par Anthony sont dans `maquettes/duo/` (elles priment sur la fiche pour tout ce qui se voit).
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Commit** : `Monde lot 19 T1 : <le message de commit donné par DUO-T1, sans le préfixe « Duo T1 : »>`.

## Compte rendu

- Fichiers modifiés : `mgmt-duo.js` (amorçage incomplet de constantes et fonctions de base), `mgmt-corps.js` (routage du rejeu Duo), `index.html` (chargement), fiche (présent compte rendu).
- Tests ajoutés : aucun. La suite exigée `tests/mgmtDuo.test.js` n'a pas été écrite ; aucun test ciblé n'a donc été lancé.
- Migration : aucune (la validation de `m.duo` n'est pas implémentée).
- Écarts : tranche incomplète ; restent notamment le draft intégral, l'avancement sécurisé, les combats, validations, allègement et les 17 tests demandés.
- Blocage : implémentation trop vaste pour être livrée de façon fiable dans ce passage. `node tools/verif-versions.js origin/main` passe ; pas de verdict relecteur (sous-agent indisponible).
- Questions pour Anthony : aucune question de spécification identifiée ; l'état incomplet est à reprendre.
