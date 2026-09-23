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
