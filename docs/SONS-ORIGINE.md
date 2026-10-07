# Origine et licence des sons — lot 12 (brief du 06/10/2026)

**Le dépôt ne contient aucun fichier de son.** Tout ce que le jeu fait entendre est **synthétisé à l'exécution** avec l'API Web Audio du navigateur
(`mgmt-son.js`) : du bruit déterministe filtré, des oscillateurs et des enveloppes écrits dans le code. Il n'y a donc ni licence tierce à respecter, ni droit
à acheter pour vendre le jeu : ces sons sont du code du jeu, propriété de l'auteur du jeu, au même titre que le reste.

| Son | Où | Comment il est fabriqué |
|---|---|---|
| Musique des menus et de la soirée | `mgmtSonMusique` | Quatre accords (`MGMT_SON_ACCORDS`), quatre oscillateurs triangle par accord, enveloppe lente, un accord toutes les 3,2 s. Jamais pendant le combat. |
| La salle (le public) | `mgmtSonCtx`, `mgmtSonSalle` | Deux secondes de bruit blanc calculé (congruence linéaire à graine fixe), lues en boucle à travers un filtre passe-bande à 700 Hz. Le niveau suit le remplissage de la salle (lot 8). |
| Les coups dans la cage | `mgmtSonCoup` | Un souffle de bruit filtré passe-bas plus un grave sinusoïdal qui descend de 130 à 48 Hz. Plus fort sur un coup décisif. |
| L'interface | `mgmtSonClic` | Un petit son triangle de 880 à 440 Hz, 70 ms, à chaque bouton. |

Aucun `Math.random()` : le bruit vient d'une suite calculée, le décalage de lecture d'un compteur.

## Images (version installable)
Les icônes `icons/icone-192.png` et `icons/icone-512.png` sont **dessinées par calcul** (`tools/faire-icones.js`) : un cadre, une bande, aucun visuel tiers.
Les polices du dépôt ont leur licence dans `fonts/OFL*.txt`.

## Si des fichiers de son sont ajoutés un jour
Chacun doit être listé ici avec son nom de fichier, sa source, son auteur, sa licence (qui doit autoriser la vente) et le lien de téléchargement.
Un test (`tests/mgmtOptions.test.js`) refuse tout fichier audio du dépôt dont le nom n'apparaît pas dans ce document.
