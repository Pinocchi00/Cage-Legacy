# P7 — Addendum : audit de réalisme

Audit du moteur tel qu'il est sur `main` (`a86db43`, P6 inclus, `dt=3`). Tout ce qui suit a été vérifié dans le code, pas déduit.

Cet addendum complète le plan P7. Il **corrige** deux points de ce plan, en **confirme** deux autres, et ajoute ce qui manquait.

---

## Corrections à apporter au plan P7

### Le bruit corrélé entre juges existe déjà — le problème est son réglage

Le plan (§3.3) demandait d'ajouter un bruit corrélé entre juges, en supposant trois tirages indépendants. C'est faux. `engine-combat.js:506` part d'un score commun `[sA,sB]` pour les trois juges, puis fait dissenter le juge 2 avec la probabilité `dissent2` et le juge 3 avec `dissent3`. Le modèle corrélé est là.

Le problème est ailleurs, et il est chiffré :

```
dissent2 = clamp(0.35 - margin*0.004, 0.04, 0.35)
dissent3 = clamp(0.15 - margin*0.002, 0.02, 0.15)
```

Sur un round serré (`margin` proche de 0), le juge 2 dissente **une fois sur trois** et le juge 3 une fois sur sept. Sur un combat de trois rounds, la probabilité qu'au moins un juge diverge devient très élevée — d'où les 40 % de décisions partagées. En MMA professionnel, les trois juges s'accordent sur le vainqueur dans la très large majorité des combats.

**À faire à la place de §3.3 :** ne pas réécrire le modèle, recalibrer `dissent2` et `dissent3`, et vérifier la fonction `dissentJudge()` — sur un round 10-9 avec `|rDiff| <= 20`, elle **inverse entièrement le round**. Un juge qui voit un round serré à l'envers, c'est réaliste ; qu'il le fasse un tiers du temps ne l'est pas.

### Les 10-8 et les 10-7 existent déjà

Le plan (§3.3) demandait de vérifier leur présence et de les ajouter au besoin. Ils sont là (`ANCRE: JUGES_10PT_SCORE`, seuils `rDiff > 32` pour un 10-8 et `> 44` pour un 10-7, plus des règles sur les knockdowns). Ce point du plan devient une **vérification de fréquence** : quelle proportion de rounds finit 10-8 aujourd'hui, et comment se compare-t-elle au réel ?

### Le second souffle existe déjà

`heartResistA` (ligne 186) réduit la fatigue à partir du round 3 ou au-delà de 30 points de dégâts, piloté par `heart` et `durability`. Le plan P7 le mentionnait comme s'il fallait le créer. À conserver tel quel.

---

## Ce que le plan P7 couvre correctement

- **Dégâts sans queue de distribution** (lot 2) : confirmé, `clamp(..., 0, 6)` par tick.
- **Sol sans positions** (lot 3) : confirmé, un seul booléen `topIsA`, `standups` incrémenté à un seul endroit (ligne 298) comme simple retour à `debout`.
- **Styles sans politique de combat** (lot 4) : confirmé.

---

## Ce qui manque et n'est nulle part dans le plan

Vérifié par recherche exhaustive dans `engine-combat.js` et `engine.js` : **zéro occurrence** pour chacun des concepts ci-dessous.

### Niveau 1 — change l'issue des combats

**1. L'allonge et le gabarit ne jouent pas dans les échanges.** `reachEdge(A,B)` existe mais n'est appelé qu'à deux endroits : le calcul initial de propension au grappling (ligne 96) et un départage final (ligne 854). Il n'intervient **jamais** dans la mécanique de frappe. Un combattant avec 15 cm d'allonge en plus devrait toucher plus souvent à distance, se faire toucher moins, et subir la pression de celui qui ferme la distance. Aujourd'hui l'allonge est décorative. C'est l'un des facteurs les plus déterminants du vrai MMA.

**2. Aucun arbitre.** Pas de relance debout sur un sol inactif, pas de faute, pas de retrait de point, pas de coup illégal, pas de temps mort. Conséquences : un contrôle au sol stérile n'est jamais sanctionné (ce qui va poser un problème direct au lot 3, dès que le contrôle deviendra rentable), et un combattant ne peut jamais perdre par disqualification ni voir une victoire aux points s'inverser sur un point retiré.

**3. Aucune taxonomie de frappes.** Pas de coudes, pas de genoux, pas de coups tournants, pas de front kick. La frappe est un scalaire réparti a posteriori sur une zone. Or les coudes ouvrent la majorité des coupures, les genoux au corps sont l'arme du clinch, et les coups tournants sont la signature du karaté. Sans cette taxonomie, le lot 2 (coupures) et le lot 4 (empreinte de style) resteront superficiels.

**4. La coupe de poids n'a aucun effet en combat.** Le système de cutting existe côté carrière (`cutting lines`, C18/C19) et affiche des avertissements, mais rien n'atteint `engine-combat.js` : `weightCut` y a zéro occurrence. Une coupe sévère devrait dégrader le cardio et la résistance sur les rounds tardifs. C'est un système déjà écrit qui ne sert à rien.

### Niveau 2 — change la texture

**5. Pas de garde orthodoxe / gauchère.** Aucun système de stance. C'est un des matchups les plus lisibles du MMA et il est absent.

**6. Pas de blessure en combat.** Main cassée, genou lâché, arcade fermée : rien. Un combat ne peut se terminer que par KO, soumission ou décision.

**7. Pas de médecin.** Le lot 2 prévoit l'arrêt médical sur coupure ; il faut aussi l'examen entre les rounds, qui crée de la tension sans terminer le combat.

**8. Pas de coin entre les rounds.** Aucune consigne, aucun ajustement. `adaptability` est censé gouverner la recalibration tactique après un round perdu — vérifier s'il est réellement lu ailleurs que dans le calcul d'overall. Sans coin, l'attribut n'a pas de support narratif.

**9. Pas de décision majoritaire.** Ligne 591 : `method = unanimous ? 'Décision' : 'Décision partagée'`. Il manque la décision majoritaire (2-0-1), le nul majoritaire et le nul partagé. Le jeu ne distingue même pas décision unanime et décision majoritaire — deux cartes très différentes affichées sous le même libellé.

**10. Pas de position dos à la cage.** Le clinch existe, mais pas l'adossement, qui est pourtant la position de départ de la moitié des amenées et de la lutte de cage.

### Niveau 3 — habillage

**11. Aucun rythme par round.** Le round 1 se joue exactement comme le round 5. Pas de round d'observation, pas de sursaut de fin de round, pas d'accélération des dernières secondes quand un combattant sait qu'il est mené.

**12. Le déroulé ne raconte pas de séquences.** Les beats sont des événements isolés ; le lot 2 corrige ce point pour les finitions, pas pour le reste du combat.

---

## Ordre recommandé

Le plan P7 reste valable tel quel pour les lots 2 à 4. Les points ci-dessus se répartissent ainsi :

- **À intégrer au lot 2** : coupures liées aux coudes (point 3 partiel), médecin (point 7), blessures en combat (point 6).
- **À intégrer au lot 3** : arbitre et relance debout (point 2), dos à la cage (point 10), recalibrage de `dissent2`/`dissent3` et fréquence des 10-8 (corrections ci-dessus), décision majoritaire (point 9).
- **À intégrer au lot 4** : taxonomie de frappes complète (point 3), garde orthodoxe/gauchère (point 5), rythme par round (point 11).
- **Lot 5, nouveau** : allonge et gabarit dans les échanges (point 1), effet de la coupe de poids (point 4), coin entre les rounds (point 8). Ces trois-là sont indépendants du reste et peuvent être traités en dernier sans bloquer quoi que ce soit.

**Le point 1 est le plus rentable des trois du lot 5** : il est peu coûteux, `reachEdge()` existe déjà, et il ajoute une dimension de matchup qui ne dépend d'aucun style — un grand contre un petit, ce qui manque cruellement à un jeu qui modélise pourtant les mensurations par division.
