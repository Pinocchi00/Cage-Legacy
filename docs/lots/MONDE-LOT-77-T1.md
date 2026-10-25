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
