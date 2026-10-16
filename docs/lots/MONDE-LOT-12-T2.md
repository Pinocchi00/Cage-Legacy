# Monde lot 12 T2 — L’Accueil, comme sa planche

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Planche
`maquettes/monde/MondeAccueil.dc.html`, capture `maquettes/monde/captures-monde/3-MondeAccueil.png`. Écran : l’Accueil (`mgmt-accueil.js`, données `mgmtAccueilContenu`).

## Écarts relevés par le superviseur (jeu sur `main`, 16/10/2026, 1920×1080, partie réelle après le passé)
1. Trois colonnes égales sur la planche (« Ce qui s’est passé », « Ce qui t’attend », « Et ailleurs ») ; le jeu met « Et ailleurs » sous la deuxième colonne.
2. Le bandeau : la planche montre « Prochaine soirée · Dans 34 j · Split Fight Night 15 », « Le lieu · Dôme · Lyon, 12 avril », « La carte · 3/5 · Deux places à finir » ; le jeu y montre prédécesseur, adjointe, première soirée (le contenu de l’arrivée).
3. La date : « Lundi 12 janvier 2027 » en minuscules dans la phrase ; le jeu écrit « Mardi 12 JANVIER 2027 ».
4. « Demandes et affaires ouvertes » : une ligne par affaire avec son action à droite (« Répondre › », « Décider › », « Prolonger › ») ; le jeu affiche des boutons PROMETTRE / REFUSER et coupe la liste avec un ascenseur.
5. Le bloc jaune : « La prochaine chose à faire », un titre, une phrase, la touche Entrée et l’action (« Ouvrir les dossiers ») une seule fois ; le jeu répète le titre.
6. La ligne « Prochaine étape » sous les touches n’est pas sur la planche (le bloc jaune la porte déjà).

## Tests (`tests/mgmtAccueil.test.js`)
`Monde lot 12 T2 — l’Accueil a trois colonnes, le bandeau de la prochaine soirée et une action par affaire`. Commit `Monde lot 12 T2 : l’Accueil comme sa planche`.
