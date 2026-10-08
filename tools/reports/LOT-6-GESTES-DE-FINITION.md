# Lot 6 — Les gestes de finition (corrections du 08/10/2026)

**État : proposition, à valider par Anthony avant fusion.** Le taux de finition n'a pas bougé : 600 finitions (343 KO/TKO, 257 soumissions) sur les mêmes 1 173 combats avant et après, graine 20261008. Seul le choix du geste change.

## Ce que dit la réalité, et d'où ça vient

| Mesure | Valeur | Source |
|---|---|---|
| Part de l'étranglement arrière dans les soumissions de l'UFC | 32,7 % (3 123 combats, UFC 1 à 294) | [AgentMMA, d'après Fares et coll.](https://agentmma.com/mma-lab/most-common-ufc-submissions) |
| Part des étranglements dans les soumissions | 65,5 % | idem |
| Dans les étranglements : étranglement arrière / guillotine / triangle / triangle de bras | 49,1 % / 13,7 % / 8,8 % / 8,2 % | [Combat Sports Law, d'après Stellpflug et coll. (5 834 combats)](https://combatsportslaw.com/2020/12/26/physician-reviews-and-analyzes-all-choke-submissions-in-ufc-history/) |
| KO/TKO au poing : crochets / directs / uppercuts et overhands | 50,8 % / 35,2 % / 14,0 % (264 finitions, 2020 à 2022) | [AgentMMA](https://agentmma.com/mma-lab/most-common-ufc-knockout-punch) |
| Taux de finition de l'UFC en 2024 | 36 % KO/TKO, 15 % soumissions, 49 % décisions | [SI, UFC Wrapped 2024](https://www.si.com/fannation/mma/news/ufc-wrapped-2024-stats-knockouts-submissions-title-fights) |

**Estimations de l'agent, sans source chiffrée trouvée (à corriger par Anthony).** La part des frappes au sol, des coups de pied, des genoux et des coudes dans les KO. La rareté des gestes sautés ou retournés. Le poids des soumissions autres que les étranglements (clé de bras, kimura, clés de jambe). Les multiplicateurs de style (kickboxeur, muay-thaï, karatéka, lutteur, jiu-jitsu, sambo, boxeur).

## Ce qui change dans le code

`engine-combat-outcomes.js`, ancre `CORRECTIONS_08_10_LOT6_GESTES` : le tirage uniforme dans la zone devient un tirage pondéré (`FINISH_POIDS`), la zone la plus touchée doublant le poids, puis un facteur par style (`FINISH_STYLE_FACTEUR`). Un seul `rnd()` comme avant : la suite des tirages ne bouge pas. Les gestes appris (compétences) et la signature gardent leur logique.

## Avant (tirage uniforme dans la zone)

### KO et arrêts (343)

| Geste | Finitions | Part |
|---|---|---|
| Direct puissant | 35 | 10.2 % |
| Coup de pied retourné | 35 | 10.2 % |
| Crochet | 33 | 9.6 % |
| Superman punch | 32 | 9.3 % |
| High kick | 32 | 9.3 % |
| Uppercut | 32 | 9.3 % |
| Marteau au sol | 31 | 9.0 % |
| Jab chanceux | 27 | 7.9 % |
| Coup de genou sauté | 24 | 7.0 % |
| Overhand | 23 | 6.7 % |
| Coup de coude retourné | 22 | 6.4 % |
| Coup de pied au corps | 6 | 1.7 % |
| Crochet au foie | 6 | 1.7 % |
| Coup de genou au corps | 5 | 1.5 % |

### Soumissions (257)

| Geste | Finitions | Part |
|---|---|---|
| Triangle | 64 | 24.9 % |
| Anaconda | 63 | 24.5 % |
| Guillotine | 56 | 21.8 % |
| Rear Naked Choke | 53 | 20.6 % |
| Americana | 7 | 2.7 % |
| Kimura | 6 | 2.3 % |
| Twister | 5 | 1.9 % |
| Armbar | 3 | 1.2 % |

## Après (proposition)

### KO et arrêts (343)

| Geste | Finitions | Part |
|---|---|---|
| Crochet | 97 | 28.3 % |
| Direct puissant | 69 | 20.1 % |
| Marteau au sol | 54 | 15.7 % |
| Uppercut | 25 | 7.3 % |
| Overhand | 21 | 6.1 % |
| Low kick | 19 | 5.5 % |
| High kick | 12 | 3.5 % |
| Coup de pied au corps | 10 | 2.9 % |
| Coup de genou au corps | 10 | 2.9 % |
| Calf kick | 7 | 2.0 % |
| Crochet au foie | 6 | 1.7 % |
| Jab chanceux | 5 | 1.5 % |
| Coup de coude retourné | 4 | 1.2 % |
| Coup de pied retourné | 2 | 0.6 % |
| Coup de genou sauté | 1 | 0.3 % |
| Superman punch | 1 | 0.3 % |

### Soumissions (257)

| Geste | Finitions | Part |
|---|---|---|
| Rear Naked Choke | 94 | 36.6 % |
| Guillotine | 41 | 16.0 % |
| Armbar | 30 | 11.7 % |
| Kimura | 21 | 8.2 % |
| Triangle | 21 | 8.2 % |
| Anaconda | 17 | 6.6 % |
| Heel Hook | 13 | 5.1 % |
| Clé de cheville | 12 | 4.7 % |
| Americana | 7 | 2.7 % |
| Twister | 1 | 0.4 % |

## À décider

- Les poids de `FINISH_POIDS` et `FINISH_STYLE_FACTEUR` : garder, corriger, ou donner d'autres chiffres.
- Le coup de pied retourné, le genou sauté, le superman punch et le coude retourné restent possibles mais à moins de 1,5 % des KO chacun : est-ce assez rare pour qu'un seul reste un événement ?
