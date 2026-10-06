# Brief du 06/10/2026 — Lot 2 : un niveau propre à chaque combattant

Source : le « Brief complet » d'Anthony du 06/10/2026, lot 2. Code : `mgmt-niveau.js` ; points
d'accroche dans `mgmt-bureau.js`, `mgmt-corps.js`, `mgmt-monde.js`, `mgmt-recrutement.js`, `mgmt-save.js`.
Mesures : `tools/mesure-niveaux.js`.

## Ce qui est livré (codé par Claude, 06/10)

- **Trois valeurs stockées par combattant** (partie à niveaux, `m.niveaux===1`) : `niv` son niveau actuel
  (40 à 80, l'échelle du profil de combat), `pot` son potentiel (50 à 80), `pic` l'âge de son pic (26 à 30).
  Tirées sur le flux d'identité de la ligne (`mgmtIdentiteStream`), jamais sur la RNG de la partie. **Aucun chiffre
  de niveau n'est affiché.**
- **Le profil de combat lit ce niveau** (`mgmtNiveauCombat`) au lieu de le recalculer à chaque combat depuis le ratio
  de victoires. Deux combattants au même palmarès peuvent avoir un niveau très différent.
- **La loi d'évolution** : avant le pic, le niveau monte vers le potentiel à chaque combat (au plus 3,5 points, 14 % de
  l'écart) et à chaque anniversaire (au plus 2 points, 10 % de l'écart) ; **le camp accélère ou freine** (qualité du
  camp ±20 % de cette progression, `mgmtCamp`). Après le pic, un combat ne donne plus rien et le niveau décline avec
  l'âge (1,2 point par an, à partir de pic + 3). **Une défaite coûte un point, jamais plus.** L'usure du corps existante
  (`mgmtAgingWear`, traumatisme) reste, à côté.
- **Le palmarès est une conséquence** : à la création on tire d'abord le niveau, puis un bilan cohérent avec lui, gonflé
  ou dégonflé par un biais d'organisation d'origine (−11,7 à +14,3 points de niveau, plus souvent gonflé). Le tirage
  `RI(40,80)` d'avant reste consommé : la suite des tirages d'une partie neuve ne bouge pas.
- **La trace d'un combat enregistre le niveau d'avant combat** (`mgmtTraceSide`) : le rejeu retrouve le même combat.
  Une trace d'avant le lot n'en porte pas et garde l'ancienne loi (le bilan) : **les anciens combats se rejouent à
  l'identique**, et aucune rouille ne s'applique sur eux.
- **Un recruté arrive avec le niveau que sa carrière dérivée lui donne aujourd'hui** (`mgmtExteriorTrace` expose
  `niveau`), son pic est le sien, son potentiel se déduit de l'écart d'âge au pic.
- **Le point d'accroche de la rouille du lot 9** (`mgmtRouille`) : après 12 cycles sans combat, une baisse passagère
  de forme (0,5 point de dynamique par cycle de plus, au plus 5), effacée dès que le combattant combat (`lastCycle`
  avance). Le lot 9 y branchera ses paliers.
- **Migration 13 → 14** (`MGMT_SAVE_VERSION` = 14) : `niveaux = 1` ; chaque ligne reçoit comme niveau actuel celui que
  lui donnait son palmarès (`mgmtLevelForRecord`), un potentiel et un pic déduits de son identifiant et de son âge.
  Validation : `niv`/`pot` entre 40 et 80, `pic` entier entre 26 et 30, tolérés absents ; `mgmtRepair` complète une
  ligne qui n'en a pas ; une trace avec ou sans niveau est valide.

## Mesures (200 mondes, graine fixe — `tools/mesure-niveaux.js`)

- 27 888 combattants ; niveau moyen 60,5, potentiel moyen 65,2.
- **3 837 combattants à plus de 75 % de victoires, dont 659 (17 %) sous le niveau médian de leur catégorie** : des
  palmarès gonflés existent, comme le brief le demande.
- **156 combattants autour de 50 % de victoires dans la première moitié de leur classement.**
- **6 696 groupes de combattants au même palmarès, dont 2 398 avec un écart d'au moins 10 points de niveau.**
- **Carrières : 1 000 sur 1 000 montent jusqu'au pic puis baissent** (le critère demande 9 sur 10).
- Une défaite ne change jamais le niveau de plus d'un point (test).

## Décisions ouvertes (brief, « À trancher », lot 2)

- **L'âge de pic** : tiré par combattant (26 à 30 ans), le même flux pour toutes les catégories et tous les styles.
  À dire si la catégorie (les lourds plus tard, les petits plus tôt) ou le style doit le décaler.
- **La part de palmarès gonflés** chez les combattants venus d'ailleurs : aujourd'hui un biais de −11,7 à +14,3 points
  de niveau (`MGMT_NIV_BIAIS_BAS`, `MGMT_NIV_BIAIS_ETENDUE`) ; ~14 % des combattants à plus de 75 % de victoires sont
  sous la médiane de leur catégorie dans ce monde de départ.

## Tests

`tests/mgmtNiveau.test.js` (10 tests) : le tirage ; une partie neuve et le profil de combat ; la défaite, la montée,
le pic ; la carrière (monte puis baisse) ; le palmarès conséquence sur 200 mondes ; la trace et le rejeu (avec et sans
niveau) ; la migration ; la validation ; le recruté ; la rouille.
