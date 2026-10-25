# Monde lot 77 T1 — la soirée, l'ouverture, la fin de soirée et le discours : plus aucune coupure, même avec des noms de 27 lettres

Branche : `fid-soiree2` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md`.** Dossier de travail pour l'outil : `C:/Users/antho/Documents/cage-legacy-p77`.

## Écrans : `soiree`, `soireeOuverture`, `soireeFin`, `discours` (+ leurs variantes `…Long`)
Fichiers : `mgmt-ecran-soiree.js`, `mgmt-soiree-cadre.js`, `mgmt-presentation-ecrans.js`, `mgmt-ecran-discours.js` (classes `di3-*`).

### Constat sur main (25/10) (audit avec le détecteur strict)
- **`soiree`** : 7 textes coupés : `FORUM DE MONTPELLIER` (SPAN de l'en-tête, `coupé(propre)`), `PRÉLIM 2 POIDS PAILLE FÉMININ` (`so3-categorie`, plus large que sa boîte : « PRÉLIM 2 » et « POIDS PAILLE FÉMININ » se touchent), `POIDS PAILLE FÉMININ` (SMALL) ; mêmes défauts sur `soireeLong` (9). → colonne de catégorie plus large (la planche : « PRÉLIM 1 » 22 px au-dessus, « POIDS MI-LOURD » 22 px dessous, colonne de ~190 px), nom de salle de l'en-tête sur une ligne **sans coupure** (l'élément s'élargit, ou la taille descend jusqu'à 22 px).
- **`soireeOuverture` et `soireeFin`** : « FORUM DE MONTPELLIER » (SPAN) `coupé(propre)` dans l'en-tête. **`soireeOuvertureLong` : 19 chevauchements** (« 1 » `mf-so-nb` sur « MI-LOURD » `mf-so-cat`, et les noms « PAPADOPOULOS-KARAGEORGIA… » coupés dans l'affiche d'ouverture) : l'affiche de combat doit **s'adapter** (taille du nom calculée selon sa longueur : ≤ 14 lettres 72 px, ≤ 22 → 56 px, sinon 44 px ; retour à la ligne entre prénom et nom ; jamais sous 40 px).
- **`discoursLong`** : `Papadopoulos-Karageorgia…` (`di3-nom`) plus large que l'écran (le nom en 230 px est trop grand pour 27 lettres) : **taille du nom calculée selon sa longueur** (≤ 9 lettres 230 px ; ≤ 14 → 170 px ; ≤ 20 → 120 px ; sinon 84 px, césure au tiret autorisée).
Ne touche pas au reste de ces écrans (structure déjà proche de la planche).

 Écrans à contrôler : `soiree,soireeLong,soireeOuverture,soireeOuvertureLong,soireeFin,soireeFinLong,discours,discoursLong`.

## Compte rendu

- `mgmt-soiree-cadre.js` : noms de combattants sur deux lignes et tailles adaptées à la longueur dans l'affiche d'ouverture.
- `mgmt-ecran-discours.js` : taille du patronyme adaptée (230/170/120/84 px) et césure possible pour les noms longs.
- `ui-cadre.css` : colonne catégorie portée à 190 px, rang resserré et ligne de salle conservée sur une ligne à 22 px ; adaptations de l'affiche.
- `index.html` : versions cache montées pour les deux scripts et la feuille CSS.
- `tests/mgmtMondeLot77T1.test.js` : test « Monde lot 77 T1 — les noms longs de soirée et de discours restent adaptables ».
- Sauvegarde : aucune modification ; `MGMT_SAVE_VERSION` inchangé.
- Écarts : le chemin `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md` est inaccessible dans l'environnement d'outil ; j'ai appliqué les règles prioritaires présentes dans la demande. Les écrans `soiree`, `soireeLong`, `soireeOuverture`, `soireeOuvertureLong`, `soireeFin`, `soireeFinLong`, `discours`, `discoursLong` restent à contrôler visuellement par le superviseur.
- Tests : le test de tranche et `mgmtSoireeShow.test.js` passent. Le test lent `mgmtSoireeShow.test.js` a dépassé le délai initial de 120 s, puis a réussi en relance avec un délai adapté.
- Reprise : `node --test tests/mgmtMondeLot77T1.test.js` (1/1), `node --test tests/mgmtSoireeShow.test.js` (18/18, 214 s), `node tools/verif-versions.js origin/main` (aucun écart) et `node_modules/.bin/eslint .` (OK). Le contrôle a révélé que le nouveau test n’était pas référencé dans les scripts génériques `test` et `test:watch` malgré ses alias dédiés ; les deux scripts génériques ont été corrigés et le contrôle d’inclusion retourne maintenant `true`/`true`.
- Questions pour Anthony : aucune.
