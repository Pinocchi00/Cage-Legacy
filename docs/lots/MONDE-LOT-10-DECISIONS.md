# Monde lot 10 — La refonte des trois écrans (chargement, arrivée, Résultats)

**PLANCHES VALIDÉES PAR ANTHONY le 14/10/2026** (« validé ») : ne mets aucun STOP pour « planche non validée ». Branche : `monde-lot-10-ecrans`. Origine : Anthony a jugé vides et laids les écrans de chargement, « Votre arrivée » et Résultats (retours du 11 et 12/10/2026). Les trois planches sont dessinées et se trouvent dans `maquettes/monde/refonte/` : `MondeChargement.html`, `MondeArrivee.html`, `MondeResultats.html` (états par `?etat=…`, captures dans `captures/`). **`maquettes/monde/refonte/LISEZ-MOI.md` est le contrat de chaque écran** : états, zones, et pour chaque zone « ce que le code devra lire ». Les valeurs de style sont celles de `ui-cadre.css`. Aucune règle de simulation n'est touchée ; aucune donnée n'est ajoutée à la sauvegarde (`MGMT_SAVE_VERSION` inchangée).

## Les trois tranches
- **T1 — Le chargement des six ans** : `mgmt-nouvelle.js` (écran `mgmt_nouvelle` pendant `MGMT_NOUVELLE.gen`), planche `MondeChargement.html`. La barre ne doit PAS reconstruire l'écran entier à chaque soirée : on ne met à jour que la barre, l'année, les compteurs et le dernier fait (`mgmtNouvelleGenPas` appelle aujourd'hui `render()` à chaque pas). Bouton « Entrer dans {org} » seulement à la fin (jamais d'entrée automatique).
- **T2 — « Votre arrivée »** : `scr_mgmt_arrivee`, `mgmt-prise-en-main.js`, planche `MondeArrivee.html`. États `premiere` et `sans-passe`.
- **T3 — Résultats** : `scr_mgmt_resultats`, `mgmt-suivi-cadre.js`, planche `MondeResultats.html`. États `joueur`, `passe`, `blessure`, `contrat`, `premier-jour`, `vide`.

## Décisions de Claude (14/10/2026) sur les quatre points « à trancher » de la planche
1. **Retraites.** Le passé de six ans ne produit aucune retraite (le plus vieux a 36 ans, le seuil d'âge est de 39 à 42). On ne touche PAS à la simulation. Le compteur « Retraites » du chargement et du bloc « six ans en chiffres » de l'arrivée est REMPLACÉ par « Blessures » (le nombre de faits `injury` du passé). Une note de suivi sera ajoutée au rapport du lot : « aucune retraite en six ans : à examiner par Anthony ».
2. **Arrivée et Accueil.** L'arrivée porte l'héritage (le prédécesseur, les six ans, les champions, les promesses, les contrats). Entrée mène directement à la carte, Échap à l'Accueil. L'Accueil retire son propre bloc « héritage » (et seulement lui) ; le reste de l'Accueil, validé le 10/10, ne bouge pas.
3. **« Sa fille » sous Leïla.** Aucune donnée ne la fournit : la ligne est RETIRÉE de la planche et de l'écran. Ne jamais inventer un texte d'auteur.
4. **Petits défauts.** Les mois sont affichés en minuscules dans les phrases (« 12 janvier », jamais « 12 JANVIER »). Les promesses ne disent jamais « cycle 63 » : elles disent « au plus tard : {Organisation} Fight Night 63 » (numérotation continue décidée : la première soirée du joueur est la 63).

## Règles de la tranche
Aucun texte sous 22 px, rien ne déborde ni ne se superpose à 1280 / 1440 / 1920 (le cadre 1920×1080 est mis à l'échelle comme dans le jeu, `mfAjuste`). Les textes fixes d'interface « proposés » dans le LISEZ-MOI sont écrits par Claude : marque-les `relu:false`. Aucun chiffre inventé : chaque zone lit la donnée citée par le LISEZ-MOI. `esc()` sur toute donnée du joueur. Un test par état d'écran et un test « aucun texte sous 22 px » (même méthode que `tests/mgmtCadre.test.js`). Vérification visuelle dans le jeu réel (partie avec passé), comparée à la planche, aux trois largeurs.

## Règle pour toutes les fiches du lot 10 (ajoutée le 14/10 19 h 15)
Une fiche ne demande JAMAIS d'appeler un sous-agent (@ecrivain, @eclaireur, @verif, @relecteur) : le codeur ne peut pas les appeler (« subagent depth limit reached »). Les textes fixes sont copiés du LISEZ-MOI des planches, marqués `relu:false`. La vérification se fait par `node tools/verif-versions.js origin/main` et `npm run check:rapide` lancés par le codeur lui-même.


## PRÉCISION du superviseur — 14/10/2026 19 h 35 (ceci n'est PAS une contradiction avec ta méthode)
Ta méthode prévoit d'appeler `@verif` et `@relecteur`. Ils sont INDISPONIBLES depuis toi (limite de profondeur des sous-agents). La procédure de repli est celle que le chef t'a déjà donnée : lance toi-même `node tools/verif-versions.js origin/main` puis `npm run check:rapide` (ou les tests ciblés), puis commite. Exécute ce repli et CONTINUE : ne t'arrête jamais pour cette raison.
