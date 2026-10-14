# Monde lot 3 — rapport de fin de lot

**Verdict : prêt pour la relecture finale** — T1, T2, T3 et T5 sont livrés, les planches T4 étaient déjà validées et le check complet passe ; T6 est facultative et reste hors de cette livraison.

## Tests du brief → couverture

| Test du brief (BRIEF, lignes 198–203) | Couverture constatée |
|---|---|
| 30 présentations distinctes ; une famille au plus six fois | `tests/mgmtPresentationCombattant.test.js` — « Monde lot 3 T2 — trente textes distincts et six ouvertures au maximum » ; également rendu T5. |
| Aucun niveau caché ni attribut moteur consulté | `tests/mgmtPresentationFaits.test.js` — « Monde lot 3 T1 — aucun accès au niveau caché ni aux attributs moteur » ; T2/T3/T5 ont leurs tests dédiés. |
| Pronostics nommés, pourcentage seulement public | `tests/mgmtPresentationCombat.test.js` — « Monde lot 3 T3 — trois voix nommées et pourcentage public ». |
| Chaque fait affiché a une source publique retrouvable | `tests/mgmtPresentationFaits.test.js` — « Monde lot 3 T1 — chaque fait possède une source publique retrouvable » ; T2/T3/T5 testent aussi la reconstruction. |

Le brief prévoit les tests au niveau lot, sans imposer leur intitulé pour les entrées T5. Couverture complémentaire : les sept tests `Monde lot 3 T5` de `tests/mgmtPresentationEntrees.test.js` (entrées/retour, soirée, clavier, absence de mutation, diversité, sources et échappement/pagination). Les tests exacts des fiches T1/T2/T3/T5 figurent dans leurs comptes rendus ; ils sont tous présents et inclus au check.

## « Ce qu’on veut » du brief

- Deux présentations avec une grammaire commune : **fait** (compositeurs publics T2/T3, rendu commun T5).
- Combattant : trois faits distinctifs ordonnés par rareté : **fait**, avec allocation collective limitée à six ouvertures par famille.
- Combat unique (revanche, âge, styles, camp, rangs, adversaire commun, titre) : **partiel** — familles disponibles et sourcées par T1 ; seules les trois premières familles distinctes sont retenues et les faits non disponibles ne sont pas inventés.
- Forces/faiblesses et zones centre/cage/sol : **partiel** — aucun accès aux attributs cachés ; le rendu expose des faits publics/cotes, pas une analyse de zones.
- Histoire, combats marquants : **fait**, avec adversaire/résultat et sources d’historique.
- Pronostics : **fait**, trois voix nommées, règles publiques distinctes ; Cage Hebdo peut afficher un pourcentage borné de 50 à 80 %.
- Presse/réseaux/public et conséquences de classement, ceinture ou contrat : **partiel** — pas de rubrique alimentée faute de sources publiques T1 ; aucun effet futur n’est affirmé.
- « Toujours différent » et pas de superposition : **fait** pour la diversité T2 ; pagination multi-page et bornée T5.

## Sauvegarde

Version `MGMT_SAVE_VERSION` : **16**, inchangée. Aucune donnée de présentation persistée ; aucune migration. Chargement ancien : couvert par `tests/mgmtPresentationFaits.test.js` — « Monde lot 3 T1 — le passé allégé reste une source après rechargement » (sérialisation puis `mgmtParseAndValidate`), et par les tests T2/T3 de frontière/rechargement. Aucun test distinct de sauvegarde antérieure à la version 16 n’est ajouté par ce lot.

## Vérification

`node tools/verif-versions.js` : **aucun écart** par rapport à `main` (39 fichiers examinés).
`npm run check` : `# pass 1084`, `# fail 0`, `# skipped 0` (durée rapportée : 369 924 ms).

## Écarts et risques

1. Le périmètre livré ne comprend pas T6 (« Qui avait raison », facultative) ni la tranche documentaire T7. Les lignes « aucun pronostic » des anciens contrats et l’amendement H1 ne sont donc pas traités ici. `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md:193-194`.
2. Les rubriques pour lesquelles T1 n’a pas de faits publics (presse, monde, effet sur contrat/classement/ceinture) restent vides ou à « — », conformément aux fiches ; le contenu est moins riche que toutes les cases du tableau idéal. `mgmt-presentation-ecrans.js:147-151,157-161`.
3. Vérification de versions et check complets verts, mais aucun verdict indépendant d’agent relecteur n’est documenté dans les fiches (limite de profondeur des sous-agents). Relecture finale humaine à faire.

## À regarder en jouant

- Carte, Préliminaires, Presse, Accueil : entrée combattant/combat et retour exact ; vérifier trous, extérieurs et retraités.
- Soirée : présentation d’un combat passé puis du prochain, navigation ←/→, « Regarder » uniquement sur le prochain, et absence de fuite du résultat courant.
- Présentations : navigation clavier/souris, fiche complète puis retour, pages sur textes longs, noms avec apostrophes/HTML hostile, catégorie féminine ; surtout constater les rubriques volontairement absentes et les pronostics.
- Textes `relu:false` ajoutés : `mgmt-presentation-data.js` (**16**) et `mgmt-presentation-combat-data.js` (**10**), soit **26** propositions.

## Questions pour Anthony

1. Confirmer que la moindre richesse des rubriques sans source publique est acceptable avant intégration ultérieure.
2. Souhaites-tu traiter T6 et T7 dans un lot séparé ?
3. Relire les 26 textes marqués `relu:false` avant diffusion.
