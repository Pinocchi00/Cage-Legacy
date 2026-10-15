# L'humanité des combattants — à refaire (terrain préparé le 15/10/2026)

## Pourquoi ce document

Anthony a relu les 1904 textes marqués `relu:false` (page de relecture, 15/10/2026 ; export complet : `docs/RELECTURE-ANTHONY-15-10-2026.md`). Toute la couche « humanité » des combattants est refusée :

| Catalogue (`mgmt-humanite-data.js`) | Textes | OK | Refusés |
|---|---|---|---|
| `MGMT_SURNOMS` | 420 | 191 | 229 |
| `MGMT_SURNOMS_PROVENANCE` | 8 | 8 | 0 |
| `MGMT_METIERS` (anciens métiers) | 312 | 0 | 312 |
| `MGMT_MILIEUX` (milieux d'origine) | 44 | 0 | 44 |
| `MGMT_MOMENTS` (moments de vie) | 109 | 0 | 109 |
| `MGMT_RITUELS` | 100 | 0 | 100 |
| `MGMT_ROLES` (libellés de rôles) | 12 | 0 | 12 |
| `MGMT_TRAJECTOIRES` | 15 | 0 | 15 |

Sa décision (15/10/2026) : **« pas fan de la façon dont ça a été fait ; mettre pour plus tard et tout enlever pour l'instant : métiers, milieux, moments de vie, rituels, rôles, trajectoires. Ce sera un gros chantier à revoir complètement dans une autre conversation. »**

## Ce qui est fait maintenant (lot 11, branche `monde-humanite-retrait`)

Un seul interrupteur, `MGMT_HUMANITE_ACTIVE=false` (`mgmt-data.js`), retire ces six couches **de ce que le joueur voit et de ce qui se déclenche**, sans supprimer les données ni casser les mécanismes qui en dépendent :
- la fiche ne montre plus milieu, ancien métier, rituel, trajectoire ;
- les moments de vie ne naissent plus et ne s'affichent plus (ni fiche, ni marque, ni conteur) ;
- les libellés de rôles ne s'affichent plus ; le **calcul** des rôles reste (les raisons de Leïla et les faits de présentation s'en servent comme critères, sans afficher le mot du catalogue) ;
- les voix qui citaient le métier ne le citent plus ;
- les surnoms restent (191 acceptés ; les 229 refusés sont à retirer dans le chantier).
Remettre l'interrupteur à `true` restaure l'état d'avant, à l'identique. Aucune donnée de sauvegarde ne change.

## Où vit cette couche (inventaire pour le chantier)

- **Données** : `mgmt-humanite-data.js` (les catalogues ci-dessus, chacun `relu:false`).
- **Tirage de l'identité** : `mgmt-humanite.js` → `mgmtIdentite(m,f)` (ville, milieu, métier, surnom, rituel, trajectoire, sept traits), `mgmtIdentiteMetier`, `mgmtIdentiteSurnom*`, flux à graine `mgmtIdentiteStream`.
- **Moments de vie** : `mgmt-vie.js` (catalogue `MGMT_MOMENTS`, flux `vie`, moments contextuels `MGMT_VIE_CONTEXTUELS`) ; relais dans `mgmt-attention.js` (marques), `mgmt-ecran-semaine.js`, `mgmt-scenarios.js`, `mgmt-corps.js`, `mgmt-camps.js`, `mgmt-retraits.js`, `mgmt-mouvement.js`.
- **Rôles** : calcul dans `mgmt-attention.js` (`mgmtRole`, `mgmtRoleMemoire`, `mgmtRolesMemoire`) ; libellés lus par `mgmt-ecran-fiche.js`, `mgmt-ecran-vestiaire.js`, `mgmt-mouvement.js` ; critères utilisés par `mgmt-raisons.js` (lot 6) et `mgmt-presentation-faits.js` (lot 3).
- **Affichage** : `mgmt-ecran-fiche.js` (« Son histoire » : milieu, ancien métier), `mgmt-fiche-planche.js` (`mgmtFicheVie`), `mgmt-fiche-cadre.js`, `mgmt-voix.js` (jeton `metier`).
- **Outils** : `tools/exporter-textes.js` (export des textes à relire).

## Pour le chantier (prochaine conversation)

À trancher avec Anthony, avant toute écriture :
1. Ce que l'humanité doit apporter au jeu (qui est ce combattant, pourquoi on s'y attache) et où elle se lit (fiche, présentation, soirée, presse).
2. Qui écrit : Anthony, ou des propositions sur un gabarit qu'il valide d'abord sur un petit échantillon (10 textes par famille) avant tout volume.
3. Pour chaque famille (métiers, milieux, moments, rituels, rôles, trajectoires) : la garder, la fusionner ou la supprimer.
4. Les 229 surnoms refusés : retrait pur, ou remplacement.
5. Les autres familles de la relecture (voix 417 refusées, médias 75, fiches d'identité des organisations 68, écrans) : traitées dans le même chantier ou à part.

Message de démarrage proposé pour la nouvelle conversation :
> Chantier « l'humanité des combattants » de Cage Legacy. Lis `docs/HUMANITE-A-REFAIRE.md` et `docs/RELECTURE-ANTHONY-15-10-2026.md`. Tout est retiré du jeu derrière `MGMT_HUMANITE_ACTIVE=false`. Commence par me poser les questions de la section « Pour le chantier », une par une, avant de proposer quoi que ce soit.
