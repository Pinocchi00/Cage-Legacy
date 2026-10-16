# Monde lot 12 T4 — Les retouches de l’arrivée et de la nouvelle partie

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Écarts relevés par le superviseur (16/10/2026)
- **Ton arrivée** (`maquettes/monde/refonte/MondeArrivee.html`, `mgmt-prise-en-main.js`) : il manque, sous « Ses douze champions », la ligne « Le plus long règne : {nom} · {catégorie} · champion depuis {année} · {N} défenses » et son lien « Ceintures › » (note LISEZ-MOI § 2) ; l’en-tête écrit « Montpellier » au lieu du nom de la salle (« Forum de Montpellier »).
- **Nouvelle partie** (`maquettes/monde/MondeNouvellePartie.dc.html`) : « 50000 € » → « 50 000 € » (espace des milliers).
## Tests
`Monde lot 12 T4 — l’arrivée donne le plus long règne`, `Monde lot 12 T4 — la caisse de départ s’écrit avec l’espace des milliers`. Commit `Monde lot 12 T4 : retouches de l’arrivée et de la nouvelle partie`.
