# Lot 2B T2 bis - Le temps passe

Mesure unique executee le 22/09/2026 avec `node tools/mesure-temps-passe.js`.
Graine `20260922`, vingt soirees par le vrai deroule `mgmtNewPile` ->
composition de la carte principale -> decision de Leila -> `mgmtRunEvent`.

## Resultat du calendrier

- 20 soirees jouees, aucun echec de composition.
- 48 combattants au debut et a la fin.
- Age moyen : 28,17 ans au debut, 29,17 ans a la fin.
- Cycle final : 20.
- Reste calendaire final : 48 semaines.
- Chaque ligne a donc pris exactement un an en 100 semaines. La seconde annee
  ne tombe pas avant les 104 semaines imposees par `MGMT_EXT_YEAR_WEEKS`.

Pyramide initiale :

`22:6, 23:4, 24:5, 25:1, 26:4, 27:1, 28:2, 29:2, 30:4, 31:6, 32:5, 33:3, 34:2, 35:3`

Pyramide apres vingt soirees :

`23:6, 24:4, 25:5, 26:1, 27:4, 28:1, 29:2, 30:2, 31:4, 32:6, 33:5, 34:3, 35:2, 36:3`

## Sorties par cause

- Retraites medicales : **1**.
- Sorties dues au declin d'age : **0**.
- Entrees dans la zone de declin : **0**.

Le zero d'age est attendu dans cette tranche : la T2 bis rend l'age et le
declin reels, mais la retraite d'age reste explicitement reservee a la T3. Le
roster initial culmine a 35 ans et n'atteint que 36 ans dans cette fenetre.

## Preuve du declin

Meme identifiant `aging-proof-1`, meme division `H-welter`, meme bilan 18-6,
meme niveau derive :

- A 26 ans : overall arrondi 82 ; somme `footSpeed + handSpeed + cardio +
  explosiveness` = **310**.
- A 38 ans : overall arrondi 82 ; meme somme = **307**.
- Usure derivee : `footSpeed -1`, `handSpeed -1`, `cardio -1`,
  `explosiveness -0`.

L'overall entier masque ici les trois points perdus parmi trente attributs,
mais les attributs qui alimentent effectivement le combat sont mesurablement
plus faibles. La ligne persistante reste sans `attrs`, sans `overall` et sans
`agedCeilings`.

## Validite

L'etat final passe `validateMgmt`. Le script sort en erreur si les vingt
soirees ne sont pas jouees, si la sauvegarde est invalide, ou si le profil de
38 ans n'est pas moins bon sur les attributs de declin que le meme profil a
26 ans.
