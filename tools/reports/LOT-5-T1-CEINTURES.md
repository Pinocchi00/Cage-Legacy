# Lot 5 T1 — Ceintures et combats de titre

## Contrat et décisions

Contrat : `docs/LOT-5-LE-MONDE-QUI-PARLE.md` §T1, repris au §7 du monde humain.
Décisions d’Anthony du 02/10/2026 : premier classé champion initial de Split, zéro défense ; titre explicitement choisi ; premier combat de carte principale en cinq rounds ; extérieur dérivé des résultats existants, titre vacant attribué au premier classé actif, départ du champion = vacance.
Maquette du nouveau geste validée : `maquettes/04b-combat-de-titre.html`.
Cas limites validés le même jour : un nul conserve le titre sans défense gagnée ; un nul pour un titre vacant le laisse vacant. À l’extérieur, le champion battu ne reprend pas le titre pendant le même cycle, même s’il reste premier classé.

## Protocole reproductible

`node tools/mesure-ceintures.js --seed=20261002 --n=3 --soirees=20`
Ordre des scripts lu dans index.html. Le moteur de combat reste intact. Chaque partie enchaîne les vraies soirées et leurs blessures, suspensions, bilans, vieillissement et retraites. Le joueur-type privilégie le champion disponible et le meilleur challenger classé disponible ; titre choisi par mgmtSetTitle ; préliminaires validés par le vrai geste de Leïla. Les catégories tournent par date du dernier combat du champion. Aucun résultat ne sert à choisir les paires.
Une carte impossible attend un nouveau cycle : aucun corps réinitialisé ni combattant ajouté artificiellement. Les cycles d’attente sont publiés. Les extérieurs ne sont pas simulés par le moteur : les défenses sont leurs victoires de carrière déjà dérivées ; une défaite libère le titre, qui va au premier classé actif restant. Aucun adversaire de titre fictif n’est nommé.

## Split — vingt soirées par partie

- Graine 20261002 : 20 soirées, jusqu’au cycle 20 (0 cycles sans carte complète) ; 9 changements, 91 défenses gagnées, 0 titres vacants attribués, 0 nuls, 0 vacances après soirée.
- Graine 20261003 : 20 soirées, jusqu’au cycle 20 (0 cycles sans carte complète) ; 13 changements, 87 défenses gagnées, 0 titres vacants attribués, 0 nuls, 0 vacances après soirée.
- Graine 20261004 : 20 soirées, jusqu’au cycle 20 (0 cycles sans carte complète) ; 19 changements, 81 défenses gagnées, 0 titres vacants attribués, 0 nuls, 0 vacances après soirée.

Total : 300 combats de titre, 41 changements de champion, 259 défenses gagnées. Parmi les titres avec un champion et un vainqueur : 13.7 % de changements.
Les attributions vacantes et retraites ne sont pas comptées comme des défaites de champion ; un nul ne gagne pas de défense.

## Extérieur — même période de calendrier

- Garden of Blood : 36 successions après défaite, 75 défenses gagnées, 37 défaites de champion, 20 départs vers une autre organisation, 0 retraites, 20 autres attributions. 4 ceintures vacantes au dernier cycle (sur 36 observations).
- MMA Korner : 76 successions après défaite, 117 défenses gagnées, 76 défaites de champion, 25 départs vers une autre organisation, 0 retraites, 25 autres attributions. 0 ceintures vacantes au dernier cycle (sur 36 observations).
- Ultimate Rim : 58 successions après défaite, 134 défenses gagnées, 58 défaites de champion, 41 départs vers une autre organisation, 0 retraites, 38 autres attributions. 3 ceintures vacantes au dernier cycle (sur 36 observations).
- Fighting Pacific Championship : 49 successions après défaite, 129 défenses gagnées, 49 défaites de champion, 0 départs vers une autre organisation, 12 retraites, 12 autres attributions. 0 ceintures vacantes au dernier cycle (sur 36 observations).

## Verdict de la mesure

Les vingt soirées sont atteintes sur chaque graine.
La mesure contient des champions battus et des défenses réussies : ni chute systématique, ni invincibilité systématique.
Les chiffres détaillés par soirée et par graine sont conservés dans le JSON voisin. Le test de fidélité compare aussi le déroulé complet du rejeu en cinq rounds à l’original.

## Persistance et intégration

- Split : faits `title_initial` datés et `title_fight` référant le combat de `m.hist`. Aucun historique tronqué ; compteur et détenteur relus depuis ces faits.
- Extérieur : seuls les cinq champs d’identité existants sont sauvegardés ; ceintures, défenses et chronologie sont éphémères.
- Migration 10 → 11 : ceintures attribuées au classement courant, aucun ancien combat requalifié ; anciennes traces conservées avec leurs trois rounds.
- **Intégration H3** : la version 11 est désormais prise par T1. La migration d’identité prévue 10 → 11 au contrat H3 devra partir de 11 → 12 après intégration de cette branche.
- Charte : R1/H4, libellés factuels ; R4, case absente pour un titre impossible ; S5/S6, case native et retour immédiat avec focus conservé ; L2/L4, noms enroulés et texte lisible.
