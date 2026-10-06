# Brief du 06/10/2026 — Lot 6 (première moitié) : l'écran Effectif

Source : planche « Management — Effectif » du canvas. Code : `mgmt-effectif.js`, bloc `.mf-eff-*` de `ui-cadre.css`.

## Livré
- La section **Effectif** de la barre remplace le Vestiaire dans la navigation : une catégorie à la fois, le champion en tête,
  rang, forme, situation (Libre / Sur la carte / Blessé N semaines), aperçu du combattant choisi à droite.
- Clavier : ↑↓ choisir, G sexe, Tab catégorie, Entrée la fiche, Échap retour.
- L'ancien écran vestiaire reste dans le code (ses fonctions servent ailleurs), il n'est plus dans la navigation.
- Les trois derniers noms d'organisation sont ceux d'Anthony : Knuckle Gate, Pure Impact, Undisputed Cage.

## Reste du lot 6
La Fiche à cinq onglets (Aperçu, Style, Combats, Contrat grisé jusqu'au lot 9, On en dit), la bannière, le savoir trait par trait.

## Fiche (livrée ensuite, `mgmt-fiche-cadre.js`)
Bannière au nom (rétrécit si long), chiffres à gauche, cinq onglets (Aperçu, Style, Combats, Contrat grisé jusqu'au lot 9, On en dit),
Tab onglet suivant, ← → autre combattant de la catégorie, Entrée prépare son combat (ou revoit un combat dans Combats), Échap retour.
Le contenu des onglets réutilise les blocs existants de l'ancienne fiche (même habillage intérieur) ; le savoir « Vu contre X » trait par trait
et le diagramme de cage refait restent à faire. L'ancienne `scr_mgmt_fiche` reste dans `mgmt-ecran-fiche.js` (ses blocs servent).
