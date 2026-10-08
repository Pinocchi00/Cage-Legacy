# Les événements graves en début de partie (corrections du 08/10/2026, 3.3)

Mesure remise à Anthony. **Aucun réglage n'a été touché** : la fréquence est une règle du jeu, donc ta décision.

**Méthode.** 30 parties neuves (graines 1 à 30), deux soirées jouées avec le joueur automatique de `tests/helpers/jouerSoirees.js`, tous les faits `moment_vie` posés aux cycles 0 à 2, lus sur les vraies fonctions du jeu. Un moment « lourd » est un moment de poids 60 ou plus du catalogue (`mgmt-humanite-data.js`). Ordre de grandeur, pas valeur exacte.

| Mesure | Résultat |
|---|---|
| Parties avec au moins un moment lourd sur les deux premiers cycles | **30 sur 30** |
| « Condamnation » | 30 occurrences sur 30 parties |
| « Décès d'un parent » | 24 occurrences sur 30 parties |
| « Décès d'un frère ou d'une sœur » | 6 occurrences sur 30 parties |

Les moments légers dominent le total (« Revient sur les réseaux », « Adopte un chien », « Chante l'hymne… »), mais un joueur voit presque toujours un moment lourd dès le début. À toi de dire si c'est voulu.

**Ce qui a changé dans le code.** Sans `texte` d'auteur sur le moment, la presse (la semaine, le fil, la carte du cercle et des suivis) n'affiche plus le libellé du catalogue : l'événement n'y paraît pas. La fiche d'un combattant (« Sa vie ») garde sa liste. Pour qu'un moment reparaisse dans la presse, il faut lui écrire un champ `texte` dans `MGMT_MOMENTS`.
