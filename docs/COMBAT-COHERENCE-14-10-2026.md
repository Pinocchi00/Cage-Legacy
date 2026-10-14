# Combat — cohérence du déroulé, 14 octobre 2026

Cette tranche répond aux incohérences signalées par Anthony entre les actions,
les mots, les rounds, l'arbitrage et l'affichage. Elle constitue le premier
travail de correction de la demande de combats plus réels et de personnages
qui paraissent vivants. Elle ne constitue pas la refonte complète du moteur.

## Corrections de cette tranche

- La cloche ouvre chaque round à son heure. Le premier commentaire du round
  peut arriver plus tard sans prolonger le round précédent ni sa position au sol.
- Pendant la pause, les combattants regagnent leur coin. La reprise part de ces
  coordonnées, sans interpolation à travers la coupure du temps de combat.
- Plusieurs examens médicaux entre les rounds conservent une pause à chaque
  frontière. Un examen suivi d'un arrêt est également précédé du retour au coin.
- Temps mort, retrait de point, adaptation, blessure sans frappe et défense
  d'amenée portent une nature explicite. Ils ne déclenchent plus la signature
  visuelle d'un coup. La lecture des anciens journaux conserve un repli textuel.
- Une disqualification ou un arrêt médical ne met plus automatiquement le
  perdant au tapis. Une blessure qui termine le combat n'est plus décrite comme
  un KO ; l'auteur de la finition correspond au vainqueur du moteur.
- Les annonces de dernière minute, dix secondes et fin de round suivent le
  chronomètre sportif, y compris avec la compression du temps. Une finition
  proche de la cloche reste prioritaire et interdit les annonces postérieures.
- Le chronomètre se fige à l'instant de l'arrêt. Le commentaire peut continuer
  pendant l'attente des cartes des juges.
- Des compteurs de tentatives explicitement à zéro ne produisent plus
  d'échanges de remplissage ; zéro réussite ne produit plus de réussite tirée
  au hasard dans ces échanges. Renommer un combattant ne change plus leurs gestes.
- La consigne affichée de l'arbitre réserve sa place avant les étiquettes des
  coups, afin d'éviter leur superposition.

Les changements de journal n'ajoutent aucun tirage à la simulation. Le résultat,
les probabilités de combat et la notation des juges restent ceux du moteur
existant. Les textes de personnages et les répliques restent ceux de l'auteur.

## Vérification reproductible

`tests/areneSocle.test.js` ajoute dix cas de régression : frontières de rounds,
retour aux coins, examens successifs, événements sans frappe, arrêts sans KO,
annonces temporelles, arrêt du chrono et parole des juges, KO proche de la cloche,
statistiques nulles et indépendance du nom.

`tests/mgmtSoireeShow.test.js` vérifie le parcours de soirée, la lecture, les
réglages, les coups et les décisions. `tests/arenaSuperposition.test.js` dessine
tous les combats d'une soirée et mesure les chevauchements de textes.

La livraison exige également `npm run check` complet et
`node tools/verif-versions.js main`.

Validation du 14 octobre 2026 : `npm run check` passe, avec 1 064 tests réussis,
zéro échec et aucun test ignoré. Les trois signalements de contenu déjà présents
sur « MAIN EVENT » demeurent. Le contrôle des versions de cache passe également.

## Travail restant pour le réalisme demandé

Le point central reste une chronologie de faits issue du moteur. Aujourd'hui,
`arene-coups.js` répartit encore des gestes d'après des statistiques finales et
`arene-etat.js` déduit plusieurs transitions des descriptions. Les correctifs
ci-dessus n'en font pas une trace précise de chaque échange.

La prochaine spécification doit couvrir un même événement pour le temps,
l'auteur, la cible, l'action tentée, son résultat, la position avant/après et
ses conséquences physiques. L'animation, le commentaire et l'arbitrage doivent
consommer ce fait, avec un contrôle des actions possibles dans chaque position.

Les autres chantiers identifiés sont les dommages et la fatigue visibles,
l'intervention réelle de l'arbitre, la notation fondée sur l'efficacité des
actions, les habitudes propres à chaque combattant, son adaptation pendant le
combat et l'évolution de sa manière de combattre au cours de sa carrière.
Leurs choix de design et leurs textes devront respecter la vision du management
et les décisions de l'auteur ; aucune nouvelle motivation de personnage n'est
créée par cette tranche.
