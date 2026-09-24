# Lot 3 T4 — arène unique

## Vérification

- `npm.cmd run check` : 329 tests, 325 réussis, 4 ignorés, aucun échec.
- `git diff -- engine-*.js state/ mgmt-corps.js mgmt-monde.js mgmt-data.js mgmt-save.js mgmt-argent.js` : vide.
- Captures comparatives à 1920×1080 : `t4-prototype.png` et `t4-arene-neuve.png`. Même instant affiché : round 2, 3:53, à distance ; combattants et déplacements différents, car le prototype simule son propre combat et l'arène neuve lit celui du moteur. Captures prises dans le navigateur avec le script d'exploration conservé hors dépôt.
- Contrôles de régression : ancienne arène absente ; cloche héritée, pause entre rounds, halo de soumission ; 3 combats à graine fixe, chaque image des deux combattants et de l'arbitre sous 6 m/s.

## Écarts de rendu et changements hors geste demandé

- `arene-vue.js` : le pion utilisait `c.s` absent et dessinait une ellipse de dimension invalide ; son échelle est maintenant `vue.SC`. Les points temporaires du grillage ne sont plus écrasés avant le trait : les panneaux et leurs poteaux retrouvent leur projection du prototype.
- Logo central : opacité rouge de `.85` à `.34` pour conserver les pions lisibles dessus ; lettrage du tapis et étiquettes en Saira Condensed avec repli sans-serif, comme dans le prototype. Étiquettes remontées de 0,9 taille de caractère pour dégager les pions.
- Hauteur du canvas : limitée à `innerHeight - 340px` (plancher 360px) pour garder HUD, journal et commandes dans 1080px ; le ratio historique 0,58 est conservé quand il tient dans la fenêtre. `#app` prend 1920px au maximum pendant l'arène puis retrouve sa largeur normale en sortie.
- `arene-ecran.js` : le rejeu et le combat de carrière réemploient les mêmes commandes ; l'écran n'anime plus de canvas sans largeur avant le premier layout, pour ne pas lancer une boucle sans image dans le harnais.
- `ui-08-controller-arena.js` : les anciennes fonctions de thème non appelées ont été retirées avec `ui-09-arena.js`. La donnée des thèmes reste dans `data-content.js` et les sauvegardes ne sont pas modifiées.
- `tests/mgmtBureau.test.js` : le parcours d'une soirée traverse désormais effectivement neuf combats avant d'avancer le cycle, conformément à la décision 3 du 21/09.

Les constantes de physique et le RNG de la simulation ne changent pas. Les libellés du moteur restent ses propres textes. L'avis de jeu d'Anthony sur le rendu et les trois parcours de soirée reste la validation visuelle prévue par le contrat.

## Reprise T4 — trois correctifs

- **Diff :** `arene-ecran.js`, `mgmt-screens.js`, `ui-08-controller-arena.js`, `tests/areneSocle.test.js`, `tests/mgmtTrace.test.js`, ce rapport et `t4-reprise-cote-a-cote.png`. Aucun fichier moteur, `state/`, ni aucun des cinq fichiers management réservés à l'autre session n'a été modifié.
- **Moments clés :** `areneMomentsCles` regroupe les `sub` contigus en un épisode, retire les textes identiques après suppression de l'horodatage, limite à cinq et garde la finition. Une décision sans moment donne zéro ligne supplémentaire. Le test synthétique éprouve 70 lignes de menace, les doublons, la finition et la borne ; un test supplémentaire vérifie les neuf résumés d'une soirée réelle.
- **Marqueurs :** `areneTextePublic` retire `[CRITIQUE]` et `[ARBITRAGE]` au seul affichage. Le bandeau, le fil latéral et le résumé l'utilisent ; les logs du moteur restent inchangés. La finition du fil latéral se distingue par la couleur jaune, sans étiquette.
- **En-tête :** noms condensés italiques sous des barres jaune/rouge, style seulement si un `styleLabel` existant accompagne les noms, badge octogonal central, fond prune du prototype posé sur `body` pendant la lecture puis restauré exactement à la sortie. Le bouton de retour passe dans les commandes pour retirer le titre supplémentaire.
- **Capture côte à côte :** [t4-reprise-cote-a-cote.png](t4-reprise-cote-a-cote.png), largeur 1920px, à partir de deux vues source 1920×1080 au même instant affiché (R2 3:53, distance). Les combattants diffèrent : le prototype et le moteur ne jouent pas le même combat. Script de capture gardé hors dépôt.
- **Vérification :** `npm.cmd run check` — 334 tests, 330 passants, 4 ignorés, aucun échec. `git diff --check` et diff sur les fichiers interdits vérifiés avant commit.

**Écarts et raisons, au-delà du résumé demandé :** le même filtre de cinq moments s'applique aussi au fil latéral animé pour qu'il ne déborde pas en regardant le combat ; sa liste est mise en cache une fois par session pour ne pas relire le log complet à chaque image. Le `styleLabel` des combattants de carrière et de l'écran de démonstration est transmis avec leurs noms, sans le déduire des statistiques ; en management la trace ne contient aucun libellé de style, donc la ligne reste absente. La palette de texte et le fond prune sont confinés à l'arène et restitués à la sortie. Aucun seuil ou constante de simulation ne change.
