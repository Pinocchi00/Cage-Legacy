# LOT 3A — Le corps et la soirée : rapport de lot

Base : `lot-0-documents` (lot 0, documents). Références : `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md`
(§3.2, §8, §11, §12) et `docs/VISION-MODE-MANAGEMENT.md`. Livré sur la branche
`lot-1-style-stable`, en même temps que le lot 1 le style stable (audit du 17/09 :
X2, B2 — le §11 du lot 3a n'avait jamais été livré, ni ses tests, ni son calibrage).

## Ce qui a été fait

- **Le correctif X2 (§3.2 du lot 3a)** — `mgmt-bureau.js`, `mgmtCombatProfile` :
  `setSeed(mgmtHashId(f.id))` est désormais appelé avant `makeFighter`. Le SEED
  de la partie est toujours sauvegardé puis restauré dans le `finally`. Le profil
  reste régénéré à chaque appel, jamais stocké ; `MGMT_SAVE_VERSION` reste à 4,
  aucune évolution de format. Sans ce correctif, tous les profils étaient tirés
  depuis la même position du flux restauré : même style pour tous les
  combattants d'un instant, et un style qui changeait d'une soirée à l'autre.
- **`tests/mgmtSoiree.test.js` (§11 du lot 3a)** — 11 tests, ajoutés aux scripts
  `test` et `test:watch` de `package.json`. Couverture : profil identique d'un
  appel à l'autre, après sauvegarde et rechargement, et quand le bilan change ;
  pureté de `mgmtTrauma` et `mgmtCombatProfile` sur la suite de `rnd()` ;
  régression X2 (seuil : 5 styles distincts sur le roster initial — avec 40 à 60
  tirages indépendants sur 8 styles, la probabilité de tomber sous 5 est
  inférieure à 1e-7, et le bug donnait exactement 1) ; combat strictement
  identique au moteur nu à traumatisme 0, même graine ; traumatisme monotone
  borné [0,100] ; fin de carrière médicale définitive (jamais reproposé, jamais
  remis en carte, refus de jouer sans mutation) ; suspension respectée puis
  levée ; soirée calculée une seule fois (recharger ne rejoue rien) ; aucune
  valeur de traumatisme dans le DOM des écrans bureau, soirée et lendemain.
- **Preuve que les tests mordent** — `setSeed(mgmtHashId(f.id))` retiré
  temporairement : **5 tests passent au rouge sur 11** (« profil identique d'un
  appel à l'autre », « profil identique après sauvegarde puis rechargement »,
  « style identique quand le bilan change », « régression X2 » — un seul style
  sur 46 combattants, « traumatisme 0 identique au moteur nu »). Correctif
  remis : 11/11 verts.
- **`tools/monte-carlo-soiree.js` et son rapport (§8 du lot 3a)** —
  `tools/reports/LOT-3A-CALIBRAGE-SOIREE.md`. 20 000 combats par catégorie
  (12 catégories, 240 000 combats au total ; 5 000 par scénario et par
  catégorie), combattants générés par le vrai `mgmtNewRoster` avec leur
  traumatisme dérivé (§3.1), chaque combat joué par
  `simulateFight(mgmtFightReady(A),mgmtFightReady(B),3)` et appliqué par
  `mgmtApplyFight` — le chemin exact de `mgmtRunEvent`. Graine de base
  20260917, entièrement reproductible.
- **Aucune modification du moteur** : `git diff lot-0-documents -- engine-*.js
  ui-*.js state/` est vide. Aucun texte de personnage, aucune étiquette de
  style affichée, `mgmt-screens.js` et `mgmt-data.js` intacts.

## Tableau du §8 — mesuré

Cible par cible (extrait du rapport de calibrage ; tableaux complets par
catégorie dans `tools/reports/LOT-3A-CALIBRAGE-SOIREE.md`) :

| Mesure §8 | Cible | Mesuré | Verdict |
|---|---|---|---|
| 1. Deux corps à traumatisme 0 — identiques au moteur nu, même graine | identique | 0 écart sur 480 paires | ATTEINTE |
| 2. Fin de carrière sur un combat, corps < 30 | < 0,5 % | 0 % | ATTEINTE |
| 3. Suspension ≥ 90 j ou fin de carrière, corps ≥ 60 | 20 à 30 % | 22,08 % | ATTEINTE |
| 4. Fin de carrière sur un combat, corps ≥ 60 | 8 à 12 % | 10,38 % | ATTEINTE |
| 5. Défaite par KO, corps ≥ 60 contre corps sain de même niveau | au moins 1,5 × | 1,905 × | ATTEINTE |
| 6. Roster initial au-dessus du seuil | 10 à 15 % | 13,57 % (> 60) | ATTEINTE |

Lecture des taux : par corps usé, par combat joué par ce corps. Les corps
« usés » sont les combattants du roster dont le traumatisme dérivé (§3.1) est
au-dessus de `MGMT_BODY_THRESHOLD` (60, jamais au-dessus de 85 — personne ne
commence retraité) ; les corps « légers » sous 30 ; les corps « sains » à 0.
La répartition du traumatisme est donc celle que le jeu produit réellement,
pas un tirage uniforme dans la bande.

## Calibrage — constantes du corps modifiées

Trois essais à `--n=1000` (`node --test tests/mgmtSoiree.test.js` entre deux),
puis une mesure complète à `--n=20000` : les six cibles ATTEINTE en même temps.
Aucun test existant ajusté, aucun fichier du moteur touché.

| Constante | Ancienne | Nouvelle | Effet mesuré (n=20000) |
|---|---|---|---|
| `MGMT_KO_TRAUMA` | 20 | 19 | Défaut : 1 KO encaissé de plus par combattant dérivé pour dépasser le seuil ; cible 6 passe de 15,25 % à 13,57 % (< 15). |
| `MGMT_INJURY_BASE` | 0,02 | 0,03 | Probabilité de blessure hors KO : +0,01 uniforme ; cible 4 passe de 18,15 % à 9,78 % (commotion sur corps > 60 — la fin de carrière). |
| `mgmtTraumaGain` — défaite par KO, plancher | 22 | 11 | Trop de corps dérivés atteignaient 100 d'un coup ; cible 4 passe de 9,78 % à 10,38 % après l'essai suivant — la combinaison tient. |
| `MGMT_INJURY_TRAUMA` | 0,001 | 0,0015 | Probabilité de blessure proportionnelle à l'usure : +0,03 à +0,04 pour un corps usé (T0 60-85) ; cible 3 passe de 19,53 % à 22,08 % (suspensions ≥ 90 j, fractures et déchirures — sans fin de carrière). |

## Questions rencontrées

- **Lecture de « corps ≥ 60 »** : la cible est mesurée par corps usé, par
  combat joué par ce corps, et non par paire (deux corps usés par combat
  doublerait l'événement mesuré). Le rapport de calibrage documente la
  définition ; si la lecture attendue était différente, le script la mesure
  avec le même outillage.
- **Cible 1 — identité au moteur nu** : 480 paires sont mesurées (toutes les
  catégories), pas une seule — l'égalité est à 0 écart.
- Le plafond de départ (`MGMT_TRAUMA_START_CAP=85`) tient : aucun corps du
  roster initial ne démarre à 100.

## Vérification finale

`npm run check` (lint + lint:content + tests) : **265 tests, 261 passants,
0 échec, 4 skip** — les 4 skip sont ceux du §5 lot 3b (sorties de carte
incomplète, QO), aucun test existant supprimé ni ignoré, aucun test existant
ajusté : les tests existants n'ont pas bougé (ils verrouillent des structures,
pas des vainqueurs). Le diff `engine-*.js`, `ui-*.js`, `state/` contre
`lot-0-documents` est vide.
