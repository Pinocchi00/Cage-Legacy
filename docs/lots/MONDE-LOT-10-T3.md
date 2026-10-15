# Monde lot 10 T3 — Résultats

## Branche
`monde-lot-10-ecrans` (branche courante attendue).

## Objectif
Refondre Résultats selon la planche validée : liste stable des soirées, combats groupés, détail du combat et de ses conséquences, prochaine action.

Fondement : « Trois colonnes : **quelle soirée** (liste), **quels combats** (le tableau), **ce combat et ce qu'il change** (le détail), et en bas à droite **la prochaine chose à faire**. » (`maquettes/monde/refonte/LISEZ-MOI.md`, §3, contrat lié à T3 par `MONDE-LOT-10-DECISIONS.md:8`).

## Ce qui existe
- `docs/lots/MONDE-LOT-10-DECISIONS.md:1-20` porte la branche, la validation des planches et les règles communes : aucune sauvegarde/règle de simulation, textes de planche `relu:false`, tests et vérification locale.
- `maquettes/monde/refonte/MondeResultats.html` est la planche validée ; `maquettes/monde/refonte/LISEZ-MOI.md:113-159` porte le contrat précis (états, sources, clavier, groupes, phrases).
- `mgmt-suivi-cadre.js:353-380` porte `mgmtSuResultatsListe`, `mgmtSuQui`, `mgmtSuRoundLigne`, `mgmtSuMethodeTexte`, `mgmtSuPrincipalLigne` et les calculs de place `mgmtSuPlaceTexte` (`:366-368`). Réutiliser les sources de résultat, pas leur rendu actuel.
- `mgmt-suivi-cadre.js:382-431` porte `scr_mgmt_resultats` et `SCREENS.mgmt_resultats`; `:508-547` porte ses gestes/navigations `CL.mgmtSuRe*`, revoir le combat et ouvrir le résultat d'un combat. Adapter les destinations/actions à la planche.
- Fonctions de données à réutiliser selon LISEZ-MOI : `mgmtSoireesAffichage`, `mgmtResultatDetail`, `mgmtTitreIssue`, `mgmtDivisionRanking`, `mgmtCeintureLignee`, `mgmtCombatRevoyable`, `mgmtSalleParId`, `mgmtContratRestants`, `mgmtAccueilContenu`, `mgmtFicheLigne`, `mgmtJourDate`.
- `tests/mgmtSuivi.test.js:209-237` porte l'archivage combat par combat et le rejeu fidèle après 40 soirées. `tests/mgmtLisibilite.test.js:42-61` porte des assertions sur Résultats et les combats du passé. Les préserver et les compléter.

## Ce qui change
- `mgmt-suivi-cadre.js` : remplacer le rendu de `scr_mgmt_resultats` par la planche : trois colonnes, sept lignes fixes dans la fenêtre de soirées, liste ne bougeant que lorsque sa sélection sort de la fenêtre, groupes « Tes soirées » / « Avant ton arrivée », sous-compte restant. Séparer carte principale/préliminaire et ordonner les combats comme LISEZ-MOI §3.
- Présenter chaque état prescrit : `joueur`, `passe`, `blessure`, `contrat`, `premier-jour`, `vide`. « Joueur » choisit à l'arrivée la dernière soirée et son combat principal; « passe » identifie le prédécesseur, sans spectateurs ni rejeu; premier-jour choisit la dernière soirée passée ou le vide; vide explique que les résultats arriveront après la première soirée. `mgmtResultatDetail` null donne la ligne « Un combat de cette soirée n'a pas pu être relu. » et jamais une ligne vide.
- Détail : lieu/date/spectateurs uniquement selon les règles des lignes 141-142; noms, place, bilans avant combat depuis les traces, méthode et geste seulement si rejeu fidèle. Conséquences ceinture/classement/corps/contrat suivant LISEZ-MOI §3 lignes 149-152. Les propositions et échéances viennent de `mgmtAccueilContenu(m).attend.prochaine`.
- Contrôles : `←/→` soirée, `↑/↓` combat, `R` rejeu si autorisé, `F` fiche du vainqueur si trouvée, `Entrée` prochaine chose à faire (jaune), Échap retour, A/E sections. Retirer Tab : chaque flèche a un seul sens. Ajouter clic liste/tableau/actions et molette dans la seule liste des soirées.
- `ui-cadre.css` : ajouter/modifier seulement les sélecteurs `.mf-re-*` nécessaires pour reproduire la planche; respect des valeurs et gabarits existants. Toute nouvelle fonction a un JSDoc décrivant paramètres, résultat et effet.
- `tests/mgmtSuivi.test.js` : compléter les assertions ci-dessous sans retirer celles des tests existants. Ajouter les vérifications d'audit typographique si elles ne sont pas déjà disponibles dans le harnais du fichier.

## Sauvegarde
Non. `MGMT_SAVE_VERSION` inchangée; aucun champ persistant.

## Textes
Aucun appel à `@ecrivain` (interdit par `MONDE-LOT-10-DECISIONS.md:19-20`). Copier les libellés/phrases proposés dans `LISEZ-MOI.md` §3 tels quels, marqués `relu:false`; aucun texte narratif nouveau.

## Écran
Planche validée : `maquettes/monde/refonte/MondeResultats.html`; contrat : `maquettes/monde/refonte/LISEZ-MOI.md`, §3.

## Tests
Fichier : `tests/mgmtSuivi.test.js`.
- `Résultats — chaque soirée jouée est archivée, combat par combat, avec méthode et possibilité de revoir` (conserver; vérifier les regroupements principaux/préliminaires et navigation/actions conformes).
- `Résultats — un combat de la première soirée se revoit à l’identique après quarante soirées` (conserver).
- Ajouter `Résultats — états joueur, passe, blessure, contrat, premier-jour et vide` : utiliser la partie Split graine `20261008`, 62 soirées passées, plus une soirée joueur; vérifier badge et présence/absence des actions de rejeu/spectateurs pour passé vs joueur; chaque état sélectionne le combat/soirée prévu; partie sans passé/soirée affiche le texte d'état vide.
- Ajouter `Résultats — soirées groupées, dates longues et fenêtre stable` : « Tes soirées » ne contient que `s.n > m.passe.soirees`, « Avant ton arrivée » contient le passé; exactement sept lignes (six avec « Ta première soirée »), sélection d'une soirée hors fenêtre recentre, sélection dedans ne déplace pas les autres; format de date « 16 février 2027 ».
- Ajouter `Résultats — combats séparés et détail des conséquences` : comptages/principaux/préliminaires égalent `mgmtSoireeAffichage`; pour trace de test titre, rangs avant/après et lignée cohérents; faits injury/susp/fin_contrat du cycle apparaissent uniquement selon la règle prescrite; contrat « un dernier combat » seulement dernière soirée et `mgmtContratRestants(f)===1`.
- Ajouter `Résultats — combat illisible est signalé sans ligne vide` : détail null affiche exactement le message prescrit.
- Ajouter `Résultats — clavier, souris, prochaine action et texte ≥22 px` : R ne lance le rejeu que si revoyable, F ouvre le vainqueur si sa fiche existe, Entrée appelle la prochaine action issue de `mgmtAccueilContenu`, flèches ont sens unique, clic/molette agissent sur la liste seulement; audit sans texte sous 22 px.

## Vérification
- `node --test tests/mgmtSuivi.test.js tests/mgmtLisibilite.test.js`
- Vérification visuelle dans le jeu, Split graine `20261008`, partie avant première soirée et après soirée joueur, aux largeurs 1280, 1440, 1920; contrôler les six états et tous les liens/gestes.
- Critère de fin : six états conformes, données alignées aux sources, zéro ligne de combat muette, fenêtre stable et bornée, aucun texte sous 22 px, aucun débordement/chevauchement, tests ciblés verts.

## Hors périmètre
Ne pas modifier les simulations, résultats/archives, sauvegarde/version, classement ou booking; ne pas modifier les autres écrans de suivi ni les règles de rejeu. Ne pas changer l'Accueil : la prochaine action n'est que lue depuis sa source. Ne pas inventer de données ou de textes.

## Pièges
- `scr_mgmt_resultats` inverse `mgmtSoirees(m)` pour l'ordre récent; les index `MGMT_SU_RE.s` sont relatifs à cette liste inversée, tandis que `s.n` reste le numéro chronologique.
- Le rendu courant ne groupe pas les soirées comme demandé : il prend les cinq récentes puis une fenêtre glissante d'anciennes (`:395-402`); ce calcul fait justement bouger les soirées lors d'une sélection.
- `mgmtSuResultatsListe` filtre les détails null (`:353-355`), ce qui masquerait le cas « combat illisible »; conserver une correspondance explicite à chaque combat affiché.
- `mgmtSoireeAffichage` fournit les index, mais `m.hist[i].slot` détermine le groupe; numérotation séparée pour principaux et préliminaires.
- Pas de spectateurs déduits pour l'historique : afficher `m.lastEvent.finance.spectateurs` uniquement pour la dernière soirée, jamais pour les soirées passées.
- Classement de cycle c inclut les combats de cycle `< c`; rang après = cycle `t.c+1`, sauf si égal à `m.cycle`. Écarter le champion avant de numéroter les autres.
- `title_fight` n'est pas toujours un changement de champion; s'appuyer sur `mgmtTitreIssue`/lignée, pas sur le seul drapeau titre.
- Le `geste` n'est affichable que si le rejeu est fidèle. Les noms issus du joueur vont dans HTML avec `esc()`.

## Questions pour Anthony
Aucune question bloquante restante : planche, états et sources sont spécifiés dans `LISEZ-MOI.md` §3; la décision de T3 est consignée dans `MONDE-LOT-10-DECISIONS.md`.
