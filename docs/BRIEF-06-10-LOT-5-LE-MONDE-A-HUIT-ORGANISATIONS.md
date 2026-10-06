# Brief du 06/10/2026 — Lot 5 : le monde à huit organisations

Source : le « Brief complet » d'Anthony du 06/10/2026, lot 5, et la planche « Management — Nouvelle partie »
du canvas. Code : `mgmt-organisations-data.js`, `mgmt-organisations.js`, `mgmt-nouvelle.js`.

## Ce qui est livré (codé par Claude, 06/10)

- **L'organisation jouée est une donnée de la partie** (`m.org`). Toutes les lectures de « Split » passent par
  `mgmtOrgNom(m)` : l'en-tête de chaque écran, la semaine, le lendemain (« Préparer … N+1 »), le classement,
  les fiches, le recrutement (« X rejoint … »), les paroles et la presse (`{org}`), l'accueil et « Choisis une
  partie ». La validation accepte les huit noms ; la ligne d'un combattant porte l'organisation de la partie.
- **Huit organisations** (`MGMT_ORGANISATIONS`) : Split, les quatre que le code connaissait (Garden of Blood, MMA
  Korner, Ultimate Rim, Fighting Pacific Championship) et **trois emplacements d'auteur, `[ORGANISATION 6]` à
  `[ORGANISATION 8]`** : les noms sont à donner par Anthony, un seul fichier à changer.
- **L'écran « Nouvelle partie »** : dans un emplacement vide, Entrée ouvre le choix — huit organisations, chacune
  avec ses deux plus et ses deux moins (ceux des maquettes, tels quels), la choisie marquée ; flèches pour parcourir
  la grille de quatre colonnes, Entrée crée la partie, Échap revient aux emplacements. Le jeu annonce qu'il crée tout
  le reste (les combattants, les camps, les salles, la presse, l'assistante). **« Créer ton organisation » est visible,
  annoncé « À venir », et n'ouvre rien.**
- **Un profil par organisation règle la création du monde** : la **caisse de départ** (de 20 à 120 k$), la **taille de
  l'effectif** (de 70 % à 100 % des 130-150), l'**âge** (−3 ou +3 ans), les **catégories fortes et faibles** (pèsent
  1,5 ou 0,5 dans l'effectif, et ±3 points de niveau) ; popularité, taille des salles, niveau des bourses et entente des
  camps sont portés pour les lots 8, 9 et 10. Deux créations de même graine donnent le même effectif ; deux graines,
  deux effectifs différents. Le tirage de la partie reste consommé comme avant : une partie Split est identique à celle
  d'avant le lot (même profil neutre).
- **Les autres organisations restent un monde dérivé.** Quatre d'entre elles forment l'échelle des combattants
  extérieurs ; quand le joueur n'est pas chez Split, **Split prend la place de la sienne sur cette échelle**.
- **Aucun changement de format** : `MGMT_SAVE_VERSION` reste à 14. Une partie d'avant se charge chez Split, avec son
  monde intact.

## Décisions et trous (à dire)

- **L'assignation des profils aux noms n'est écrite nulle part.** La maquette ne nomme pas ses organisations 2 à 8 ;
  elles sont ici dans l'ordre de la maquette, les quatre noms connus sur les emplacements 2 à 5 (par prestige
  croissant), puis les trois noms d'auteur. *Trou de spécification, signalé, pas décidé.*
- **Les valeurs numériques des profils sont mes propositions** (`relu:false`), lues sur les plus et les moins : une
  caisse fragile = 20, riche = 120, effectif mince = 70 %, etc. Le brief demande à Anthony si les plus et les moins des
  maquettes sont les bons.
- **Les voix deviennent-elles des rôles sans nom fixe ?** et **les noms des médias fixes ou recréés ?** (brief,
  « À trancher », lot 5) : non traité. Les médias et les voix gardent leurs noms ; seul « Split » est devenu `{org}`.
- **« Recréer tout le reste à chaque partie »** : les combattants, les camps (gabarits), l'effectif sont déjà créés à
  chaque partie à graine ; **les salles et l'assistante n'existent pas encore** (lots 7 et 8) ; la presse et les voix
  restent écrites une fois. Ce lot ne les recrée pas.
- **Le libellé de « Créer ton organisation »** et de sa mention « À venir » est celui du brief ; le libellé définitif est
  une question ouverte.

## Tests

`tests/mgmtOrganisations.test.js` (9 tests) : huit organisations et trois emplacements d'auteur ; Entrée sur un
emplacement vide ouvre le choix ; l'écran (huit, la choisie, « Créer ton organisation » sans effet) ; le clavier ;
deux parties, deux effectifs, même graine même effectif ; le monde correspond au profil (caisse, taille, âge,
catégories) ; jamais « Split » comme organisation du joueur ailleurs que chez Split ; les paroles et la presse disent
l'organisation jouée, une partie d'avant garde Split ; la validation. Tests existants adaptés : `mgmtEmplacements`
(Entrée sur un vide ouvre le choix), `mgmtMedias` (l'emplacement `{org}`).
