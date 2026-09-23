# Lot 3 T3 — Cohérence des phases et vitesse du pas physique

*Mesure du 2026-09-23 — tools/mesure-arene-cible1.js.*

**Commande :** `node tools/mesure-arene-cible1.js --n=200 --seed=20260921 --pas=0.9`

## Le protocole

- 200 combats réels du moteur (deux profils du générateur existant, `simulateFight` tel quel), le combat i part de `setSeed(20260921 + i)` — un run est intégralement reproductible.
- Échantillonnage régulier en temps de combat : pas de 0.9 s, sur toute la durée de chaque combat — **138005 échantillons** mesurés (3359 exclus pour examen médical, 129 pour fin du combat, 170 pour fenêtre de réarrangement).
- Sondes sur **2767 moments du déroulé** (2766 avant / 2665 après) : chaque borne de moment est vérifiée des deux côtés.
- Durée de la mesure : 82.2 s.

## Les définitions (mètres sur le tapis, échelle réelle RS = 4,3 m)

| Phase du déroulé | Ce que l’image doit montrer | Seuil |
|---|---|---|
| sol | les deux pions en posture au sol, centres proches | d ≤ 0.80 m |
| clinch | les deux pions debout, corps en contact | d ≤ 0,75 m |
| clinch porté `pos:cage` | au moins un pion contre le grillage | bord ≤ 0,50 m |
| debout | les deux pions debout (un « au tapis » admis dans la fenêtre de 4 s d’un moment du déroulé qui le déclare), à distance | d ≥ 1.50 m |

Deux lectures d’honnêteté, toutes deux documentées et appliquées des deux côtés :

- **Fenêtres de transition physiques.** Après un changement de phase ou de disposition, la fenêtre dépend de l’écart réel au seuil de la nouvelle phase, divisé par 2,5 m/s, augmenté de 0,18 s pour accélérer et freiner, plafonné à 1.5 s. Exclues de la cible 1, incluses sans exception dans la mesure de vitesse de la cible 2.
- **Le tapis (ARENE_TAPIS_S = 4 s).** Un pion allongé hors phase sol n’est admis QUE dans les 4 s qui suivent un moment du déroulé « X envoie Y au tapis » — et le contrôle inverse est fait : un pion au tapis hors fenêtre est un écart.

## Le chiffre

Vitesse sur **toutes les images** (pas 1/60 s, deux combattants et arbitre ; pointe sans exclusion) : moyenne debout **0.897 m/s**, pointe **4.200 m/s**. Part des images debout dans [0,8 ; 2,0] : 55.6 %.
Fenêtres de transition physiques : 331 ; durée moyenne 0.511 s, maximum 1.458 s ; tranches [0 ; 0,375[, [0,375 ; 0,75[, [0,75 ; 1,125[, [1,125 ; 1,5] : 103 / 199 / 28 / 1 ; au plafond : 0.

| Ce qui est mesuré | Valeur |
|---|---|
| Échantillons mesurés | 138005 |
| — phase debout | 116673 |
| — phase clinch | 6641 |
| — phase sol | 14691 |
| **Écarts phase/géométrie (échantillonnage)** | **0** |
| **Écarts aux bornes des 2767 moments** | **0** |
| Pions hors de la cage | 0 |
| Pions au tapis hors moment déclaré | 0 |
| Combats joués / finitions | 200 / 99 |

**CIBLE 1 ATTEINTE : 0 écart sur 138005 échantillons et 2767 moments — l’image dit toujours ce que le moteur dit.**

Cible 2 : atteinte.
