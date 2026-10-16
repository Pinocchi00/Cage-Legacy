# Monde lot 9 T3b — La notoriété qui départage

## Branche
`monde-lot-9-classement` (tirée de `main` après la PR 181).

## Objectif
Décision d'Anthony du 15/10/2026 (« prends une mesure logique, la meilleure »), règle retenue par le superviseur. Constat : la notoriété de la T3
(moyenne de `mgmtStar` des cinq plus renommés) plafonne près de 1 ; sur une vraie partie, les huit organisations sont entre 0,88 et 0,96.

## Ce qui change
- `mgmt-organisations.js` : `mgmtRenom(sous,f)` = `f.W` + 2 × le nombre de combats de titre gagnés par `f` dans `sous` (faits `title_fight` de
  `sous.facts`, vainqueur lu dans `sous.hist[fait.fight]` comme le fait déjà la lecture des ceintures). Pur.
- `mgmtOrgNiveaux` : `notoriete` = somme de `mgmtRenom` des cinq combattants non retraités au plus fort renom (égalité : plus de combats,
  puis identifiant) ; ajoute `notoriete5` = ces cinq `{id,nom,W,titres}` (pour l'écran T11).
- Rien en sauvegarde ; les faits `title_fight` sont déjà gardés par les sous-parties (`MGMT_MONDE_FAITS_GARDES`).

## Tests (`tests/mgmtNiveauxOrg.test.js`, sur de vraies parties)
- `Monde lot 9 T3b — la notoriété départage les huit organisations` : au moins six valeurs distinctes sur huit ;
- `Monde lot 9 T3b — le renom compte les victoires et les titres` : un combattant qui gagne un combat de titre gagne 3 de renom (1 + 2) ;
- les tests T3 et T4 existants restent verts (adapter seulement les valeurs de notoriété, en citant cette fiche).

## Vérification
`node --test --test-name-pattern="T3|T4" tests/mgmtNiveauxOrg.test.js`. Pas de `check:rapide`. Commit `Monde lot 9 T3b : la notoriété qui départage`.

## Compte rendu
- `mgmt-organisations.js` : calcul pur du renom (victoires et titres gagnés), nouvelle somme des cinq meilleurs et détail `notoriete5` ; version de cache montée.
- `tests/mgmtNiveauxOrg.test.js` : deux tests ajoutés — « Monde lot 9 T3b — la notoriété départage les huit organisations » et « Monde lot 9 T3b — le renom compte les victoires et les titres ».
- Sauvegarde : aucune modification ni migration.
- Vérification ciblée T3/T4 : 9 tests réussis. `node tools/verif-versions.js origin/main` : aucun écart.
- Écarts à la fiche : aucun. Questions pour Anthony : aucune.
- Relecture par agent indisponible (sous-agent non appelable) ; relecture manuelle effectuée.

## Compte rendu — reprise demandée par le relecteur
- Les modifications non commitées de `.opencode/agents/*.md` et `opencode.json` ont été laissées intactes et hors du commit.
- L'historique de la branche comporte déjà les commits T2e (`19a2db8`, `2ea9fc4`) avant le commit T3b. Les changements T2e sont des commits antérieurs, et non des changements de l'arbre de travail ; les retirer du diff `main...HEAD` exige de réécrire l'historique de la branche et de rejouer T3b. Cette opération n'a pas été faite pour éviter de déplacer ou supprimer des commits préexistants sans instruction explicite. Écart restant : les changements T2e (`docs/lots/MONDE-LOT-9-T2e.md`, `mgmt-carte.js`, `tests/mgmtMondeVivant.test.js`, `index.html`, `sw.js`) restent dans le diff de branche.
- L'écart concernant les modifications non commitées des fichiers d'agents est corrigé pour cette tranche : aucun de ces fichiers n'est inclus dans les commits de reprise.
- Vérification de versions : `node tools/verif-versions.js origin/main` passe sans écart. Le test ciblé `node --test --test-name-pattern="T3|T4" tests/mgmtNiveauxOrg.test.js` a dépassé le délai de 120 s de l'outil avant d'afficher son bilan ; résultat indéterminé.
- Questions pour Anthony : confirmer si une réécriture de l'historique de la branche est souhaitée pour séparer T2e de T3b.
