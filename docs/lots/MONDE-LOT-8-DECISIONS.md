# Monde lot 8 — Les décisions d'Anthony sur l'inventaire (10/10/2026)

Source : la liste à cocher « Événements du lot 8 : oui ou non »
(https://claude.ai/code/artifact/5ec06cbe-99f6-4d16-913e-d187444cb9e9), relevée
le 10/10/2026 à 15 h 20, révision 43. Les numéros N1 à N11 et les problèmes 8 à
10 renvoient à `docs/lots/MONDE-LOT-8-INVENTAIRE.md`. Ce fichier fait foi pour
les tranches T4 et T5 : rien n'y est codé qui n'est pas coché ici.

## 1. Les onze événements nouveaux : tous acceptés

| N° | Événement | Coût | Tranche |
| --- | --- | --- | --- |
| N3 | Entrée ou sortie du top, avec le combat qui l'explique | petit | T4a |
| N6 | Un titre devient vacant | petit | T4a |
| N7 | Un règne passe un cap | petit | T4a |
| N8 | Le dernier combat d'un contrat | petit | T4a |
| N10 | Deux coéquipiers sur la même soirée | petit | T4a |
| N1 | Une retraite annoncée | moyen | T4b |
| N4 | Un dépassement | moyen | T4b |
| N5 | Un challenger se déclare pour la ceinture | moyen | T4b |
| N11 | Un vieux combat redevient d'actualité | moyen | T4b |
| N2 | Un changement de catégorie | gros | T4c |
| N9 | Une organisation rivale approche un combattant | gros | lot 9 |

N9 est accepté, et codé avec le lot 9 (« le staff et la puissance des
organisations ») : c'est là que les organisations rivales agissent pour de bon.
Le coder avant créerait un mécanisme à refaire.

## 2. Les scénarios à suite

**Acceptés, faisables avec ce que le jeu sait faire (10)** — tranches T5a et T5b :

- T5a : la promesse, le hanté, le remplaçant de luxe, le retour de retraite, le
  double emploi qui choisit.
- T5b : la pépite de l'étranger, le coach qui part, le prodige, le vendeur, la
  fuite.

**Acceptés, demandent un mécanisme neuf (7)** :

- La descente et la montée de catégorie : avec N2, tranche T4c.
- Le transfuge : avec N9, lot 9.
- La pesée ratée, le vol, la mère qui revient, le visa, la soirée à domicile :
  tranche T5c, une fiche par mécanisme si nécessaire.

**Refusés — ne jamais les coder, ni les proposer dans un texte :** la garde à
vue, le jeûne.

## 3. Les trois points du jeu actuel

1. **Le défilé à minuterie et la carte qui glisse sont retirés.** Leurs
   nouvelles passent dans l'Accueil, sans minuterie. → lot 7 (l'Accueil).
   Le test du brief « aucune sorte d'événement n'ouvre de fenêtre par-dessus un
   écran » devient vrai à ce moment-là, pas avant.
2. **Une demande sans réponse expire toujours, mais le jeu le dit** : « sa
   demande est restée sans réponse », et le combattant s'en souvient (un fait
   gardé, lisible dans sa fiche, qui allume sa marque). → T4a.
3. **L'Accueil remplace « La semaine »**, qui disparaît. → lot 7.

## 4. Réglages choisis par Claude (techniques, modifiables par Anthony)

- **N4, le dépassement.** On n'en parle que si les deux combattants sont dans
  les dix premiers du classement de Split de leur catégorie après la soirée, si
  l'un des deux a combattu ce soir-là, et pour un seul dépassement par
  combattant et par soirée (le mieux classé des dépassés).
- **N7, le cap d'un règne.** Caps : 3, 5 et 10 défenses ; 12, 24 et 36 mois sur
  le trône. Un cap n'est dit qu'une fois.
- **N1, la retraite annoncée.** L'annonce tombe trois soirées avant l'âge de
  retraite calculé. Elle n'avance ni ne retarde la retraite.
- **N11, le vieux combat.** Il se réveille dans trois cas, tous lisibles : les
  deux combattants redeviennent voisins au classement (deux places d'écart au
  plus), l'un des deux prend ou défend un titre, l'un des deux revient d'une
  blessure d'au moins trois soirées. Un même combat ne se réveille qu'une fois
  par an.
- **Les nouveaux événements passent par le budget de la tranche T6.** Aucun ne
  s'affiche par-dessus un écran. Chacun a un menu de naissance (celui du tableau
  du brief) et écrit un fait daté portant l'identifiant du combattant.
- **Les textes** sont proposés par Claude ou par `@ecrivain`, marqués
  `relu:false`. Une étiquette de catalogue ne s'affiche jamais telle quelle.

## 5. Ce que Claude règle sans décision (défauts techniques)

- La fiche d'un blessé oublie le nom de sa blessure après une soirée : le nom
  est gardé dans le fait `injury`.
- Le fil de presse perd ses nouvelles au-delà de 200 : la fiche et la tranche T7
  lisent les faits et `m.hist`, jamais le fil.
