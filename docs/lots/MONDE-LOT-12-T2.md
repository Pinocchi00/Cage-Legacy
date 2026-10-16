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

## Compte rendu

- `mgmt-accueil.js` : trois panneaux frères, bandeau de la prochaine soirée dès la première visite, mois en minuscules, action jaune sans répétition, une action par demande et liste complète des affaires ; panneaux sans donnée masqués (R4). Les demandes ouvrent leur fiche existante, les affaires gardent leur échange existant. Textes repris de la planche marqués `relu:false` dans la donnée de prochaine action.
- `ui-cadre.css` : colonnes égales, retours à la ligne et défilement du contenu global plutôt qu’un ascenseur dans les affaires.
- `mgmt-prise-en-main.js` : suppression de la ligne « Prochaine étape » sur l’Accueil uniquement.
- `index.html` et `sw.js` : versions de cache des trois fichiers et du service worker montées avec `_bump.js`, ordre des scripts inchangé.
- `tests/mgmtAccueil.test.js` : ajout de « Monde lot 12 T2 — l’Accueil a trois colonnes, le bandeau de la prochaine soirée et une action par affaire ». Adaptations des tests T5 (panneau vide masqué, règle R4 de cette fiche) et T6 (action Répondre, écart 4 de cette fiche).
- Vérifications locales : 10/10 tests Accueil, 8/8 tests Prise en main ; `node tools/verif-versions.js origin/main` sans écart. Aucun test lent touché ; `check:rapide` réservé au superviseur.
- Relecture locale du diff et de la planche effectuée sans sous-agent. La comparaison visuelle en jeu à 1280, 1440 et 1920 reste au superviseur ; elle n’est pas attestée par les tests DOM.
- Migration de sauvegarde : aucune. Modifications T2 déjà présentes au début de la session reprises et vérifiées ; configurations `.opencode` et `opencode.json` laissées hors commit.
- Écarts : colonnes égales selon l’écart 1 explicite de la fiche, bien que le HTML de la planche porte des proportions 5/5/3. Questions pour Anthony : aucune.
