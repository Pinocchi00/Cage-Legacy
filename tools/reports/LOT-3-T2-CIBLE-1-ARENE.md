# Lot 3 T2 — Cible 1 de l’arène neuve : l’image ne ment jamais sur le moteur

*Mesure du 2026-09-21 — tools/mesure-arene-cible1.js.*

**Commande :** `node tools/mesure-arene-cible1.js --n=2000 --seed=20260921 --pas=0.9`

## Le protocole

- 2000 combats réels du moteur (deux profils du générateur existant, `simulateFight` tel quel), le combat i part de `setSeed(20260921 + i)` — un run est intégralement reproductible.
- Échantillonnage régulier en temps de combat : pas de 0.9 s, sur toute la durée de chaque combat — **1383350 échantillons** mesurés (29753 exclus pour examen médical, 1380 pour fin du combat, 3446 pour fenêtre de réarrangement).
- Sondes sur **35047 moments du déroulé** (35018 avant / 35046 après) : chaque borne de moment est vérifiée des deux côtés.
- Durée de la mesure : 21.5 s.

## Les définitions (mètres sur le tapis, échelle réelle RS = 4,3 m)

| Phase du déroulé | Ce que l’image doit montrer | Seuil |
|---|---|---|
| sol | les deux pions en posture au sol, centres proches | d ≤ 0.80 m |
| clinch | les deux pions debout, corps en contact | d ≤ 0,75 m |
| clinch porté `pos:cage` | au moins un pion contre le grillage | bord ≤ 0,50 m |
| debout | les deux pions debout (un « au tapis » admis dans la fenêtre de 4 s d’un moment du déroulé qui le déclare), à distance | d ≥ 0.85 m |

Deux lectures d’honnêteté, toutes deux documentées et appliquées des deux côtés :

- **La fenêtre de réarrangement (ARENE_MORPH_S = 0.6 s).** Après un changement de phase (amenée, séparation, relance) ou de disposition au sol, les pions rejoignent leur géométrie en 0.6 s de combat. Un homme qui tombe met un temps à tomber : cette fenêtre est exclue de la mesure ; au-delà, tout écart est un défaut.
- **Le tapis (ARENE_TAPIS_S = 4 s).** Un pion allongé hors phase sol n’est admis QUE dans les 4 s qui suivent un moment du déroulé « X envoie Y au tapis » — et le contrôle inverse est fait : un pion au tapis hors fenêtre est un écart.

## Le chiffre

| Ce qui est mesuré | Valeur |
|---|---|
| Échantillons mesurés | 1383350 |
| — phase debout | 1113687 |
| — phase clinch | 71202 |
| — phase sol | 198461 |
| **Écarts phase/géométrie (échantillonnage)** | **0** |
| **Écarts aux bornes des 35047 moments** | **0** |
| Pions hors de la cage | 0 |
| Pions au tapis hors moment déclaré | 0 |
| Combats joués / finitions | 2000 / 1030 |

**CIBLE 1 ATTEINTE : 0 écart sur 1383350 échantillons et 35047 moments — l’image dit toujours ce que le moteur dit.**

