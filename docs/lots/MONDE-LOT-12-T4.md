# Monde lot 12 T4 — Les retouches de l’arrivée et de la nouvelle partie

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Écarts relevés par le superviseur (16/10/2026)
- **Ton arrivée** (`maquettes/monde/refonte/MondeArrivee.html`, `mgmt-prise-en-main.js`) : il manque, sous « Ses douze champions », la ligne « Le plus long règne : {nom} · {catégorie} · champion depuis {année} · {N} défenses » et son lien « Ceintures › » (note LISEZ-MOI § 2) ; l’en-tête écrit « Montpellier » au lieu du nom de la salle (« Forum de Montpellier »).
- **Nouvelle partie** (`maquettes/monde/MondeNouvellePartie.dc.html`) : « 50000 € » → « 50 000 € » (espace des milliers).
## Tests
`Monde lot 12 T4 — l’arrivée donne le plus long règne`, `Monde lot 12 T4 — la caisse de départ s’écrit avec l’espace des milliers`. Commit `Monde lot 12 T4 : retouches de l’arrivée et de la nouvelle partie`.

## PRÉCISION du superviseur (17/10/2026, 15 h 40) — l'en-tête « Montpellier » : où et comment
- **Où** : la plaque de date en haut à droite de l'écran (« 16 FÉVRIER · MONTPELLIER ») est construite dans `mgmt-cadre.js` ligne ~261 : `const lieu=salle?String(salle.nom.length<=16||!salle.ville?salle.nom:salle.ville).toUpperCase():''` — un nom de salle de plus de 16 caractères est remplacé par la seule ville. La planche (`MondeArrivee.html` ligne 147) écrit `FORUM DE MONTPELLIER`.
- **Quoi** : relève la limite à **24 caractères** (au-delà, la ville seule comme avant) ; vérifie qu'à 1280 de large la plaque ne déborde pas (le texte reste sur une ligne, `white-space:nowrap` existe déjà côté `.lab`). Les tests qui figeaient « Montpellier » seul pour un nom de 20 caractères sont mis à jour en citant cette décision (planche validée).
- **Le plus long règne** : ajoute la ligne sous « Ses douze champions » dans `mgmt-prise-en-main.js` : « Le plus long règne : {nom} · {catégorie} · champion depuis {année} · {N} défenses » + lien « Ceintures › » (`CL.go('mgmt_ceintures')` ou l'écran qui existe pour les ceintures — cherche-le). Les règnes se lisent dans les ceintures de la partie (`m.belts` ou équivalent : cherche comment l'écran Ceintures calcule « depuis » et les défenses) ; ligne absente s'il n'y a aucun champion (charte R4).
- **Nouvelle partie** : « 50000 € » → « 50 000 € » (espace insécable fine comme ailleurs dans le jeu : réutilise le formateur d'argent existant).
- **Test à corriger au passage** (échec présent avant ta tranche, déjà réglé par le superviseur) : `tests/mgmtArrivee.test.js` « Accueil — seul le bloc héritage… » est réparé et commité ; ne le touche plus.
- Commite en fin de tranche. S'il reste du rouge, « (inachevé) » dans le message : jamais de travail non commité.
