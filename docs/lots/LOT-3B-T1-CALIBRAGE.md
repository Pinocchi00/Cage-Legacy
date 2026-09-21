# CAGE LEGACY — LOT 3B T1
## Calibrage Monte Carlo — l'argent de l'organisation

**Date :** 15/09/2026 (révision 2 — reprise T1 : audience en écrans entiers,
mix de spectacle, droits au prorata des combats joués)
**Autorité :** `docs/LOT-3B-CONTRAT.md` §3 T1 (« Constantes nommées, calibrées
par Monte Carlo sur des cartes de 4 + 4 combats (outil dans `tools/`, graines
publiées) ») et §1 (décisions QO-5, QO-7).
**Outil :** `tools/monte-carlo-economie.js`. **Aucune modification du moteur,
des écrans, ou de toute autre partie du jeu.**

---

## 1. Méthode

L'outil charge le vrai jeu dans un DOM virtuel (jsdom), dans l'ordre exact des
`<script src>` d'`index.html`. Toute la finance vient des fonctions du jeu
(`mgmtStar`, `mgmtPurse`, `mgmtFightDraw`, `mgmtCardAttraction`, `mgmtPurses`,
`mgmtSpectacle`, `mgmtEventRecette`) — l'outil ne fait que composer des cartes
de 4 + 4 combats et les jouer avec le moteur réel (`simulateFight`), dans
l'ordre d'appel de `mgmtRunEvent`. Aucun `Math.random()` : chaque soirée `i`
utilise la RNG seedée du jeu (`setSeed(base + i)` pour les profils propre et
réduite, `setSeed(base + 1000000 + i)` pour le profil bâclé).

Trois profils de carte (proxies assumés, détaillés §4) :

- **propre (4+4)** — les huit meilleures paires éligibles (même catégorie,
  même genre, prénoms distincts) par attrait décroissant ; les quatre
  meilleures en main card, les suivantes en prélims ;
- **réduite (7)** — la carte propre moins son prélim d'attrait le plus faible
  (QO-7 : pas de malus arbitraire, moins de combats = moins d'attrait) ;
- **bâclée (4+4)** — huit paires bâclées au sens du jeu (inter-catégories ou
  gros écart de bilan ≥ `MGMT_SLOPPY_GAP`), tirées au hasard seedé ; proxy de
  la carte écrasée (coût de l'écrasement, addendum §12) — c'est la borne
  haute du bâclé : une vraie carte écrasée garde des combats soigneux et se
  situe entre les deux profils.

Commande du run de référence :

```
node tools/monte-carlo-economie.js --seed=20260915 --cards=4000
```

## 2. Résultats (graine de base 20260915, 4000 soirées par profil)

Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette
(revenus − cachets).

| Profil | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Attrait | Spectacle | Audience | Aud écart |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| propre (4+4 soignée) | **+3,7** | 5,2 | −5 | +4 | +12 | **73,1 %** | 106,5 | 102,8 | 8,63 | 0,638 | 7 684 | 801 |
| réduite (7, prélim faible retiré) | **−1,2** | 4,5 | −9 | −1 | +6 | 34,7 % | 95,3 | 96,5 | 8,17 | 0,632 | 7 260 | 785 |
| bâclée (4+4 écrasée) | **−11,6** | 4,4 | −18 | −12 | −4 | **0,6 %** | 68,3 | 79,9 | 5,47 | 0,706 | 4 990 | 729 |

**Audience ≥ référence (profil réduite) : 31,2 %** des soirées. La référence
est celle de D4 (QO-7) : la moyenne des audiences des soirées précédentes, ou,
avant toute soirée, `mgmtAudienceRef` sans historique (7 743 écrans).

**Recette moyenne, carte réduite contre carte propre : −1,2 k$ contre
+3,7 k$** (écart ≈ 5 k$). Il se décompose ainsi : retirer un combat retire
7/8ᵉ des droits du diffuseur (prorata de l'addendum §16, ≈ −8 k$) et une part
de billetterie (attrait 8,17 contre 8,63, ≈ −3 k$), pour deux cachets
économisés (≈ +6 k$). Une carte réduite d'un combat faible est donc à peine
perdante en moyenne — elle perd surtout son audience (31 % seulement la
gardent) et sa marge : c'est le diffuseur, pas la recette brute, qui la punit.

## 3. Cibles du contrat et mesures

| Cible (contrat §3 T1) | Mesure | Verdict |
|---|---|---|
| Une carte complète moyenne est rentable dans **70 à 80 %** des soirées | 73,1 % (propre, 4000 soirées) | atteinte |
| Une carte d'appariements médiocres perd de l'argent **plus souvent qu'elle n'en gagne** | 0,6 % de rentables (bâclée, borne extrême) | atteinte |
| Une carte réduite d'un combat faible garde **son audience de référence dans une part mesurable** des cas | 31,2 % (réduite) | atteinte |

Remarque de calibrage : la part de finitions d'une carte bâclée (0,706) dépasse
celle d'une carte propre (0,638) — les combats déséquilibrés se terminent plus
souvent avant la décision. C'est le moteur, pas un artefact de l'outil ; la
bâclée perd malgré un meilleur spectacle, parce que son attrait (5,47 contre
8,63) pèse sur la billetterie comme sur les droits du diffuseur. Le mix
d'audience (base 0,7, QO-7 : l'audience est décidée surtout avant la soirée)
stabilise l'audience autour de son niveau d'attrait (écart ≈ 10 %) : une
soirée sans finition ne s'effondre plus à zéro, elle descend sous la base.

## 4. Constantes retenues (`mgmt-bureau.js`, ancre `MGMT_LOT3B_T1_ECONOMIE`)

| Constante | Valeur | Rôle |
|---|---|---|
| `MGMT_TREASURY_START` | 50 | trésorerie au premier jour (k$) — ordre de grandeur de l'exemple QO-5 (T=50 refuse un short notice à 60, P=0) |
| `MGMT_STAR_FIGHTS` | 8 | saturation d'activité du nom (demi-vie en combats) |
| `MGMT_STAR_W_RATIO` | 0,35 | poids du bilan dans le nom |
| `MGMT_STAR_W_LVL` | 0,65 | poids du niveau dérivé dans le nom |
| `MGMT_PURSE_BASE` | 1 | cachet plancher (k$) |
| `MGMT_PURSE_PER_STAR` | 4 | cachet par point de nom (k$) |
| `MGMT_PURSE_PRELIM_W` | 1 | poids du cachet en prélim |
| `MGMT_PURSE_MAIN_W` | 2,5 | poids du cachet en main card |
| `MGMT_ATTR_PRELIM_W` | 1 | poids d'attrait d'un prélim |
| `MGMT_ATTR_MAIN_W` | 2,5 | poids d'attrait d'un combat de main card |
| `MGMT_ATTR_GAP` | 0,6 | morsure de l'écart de nom sur l'attrait |
| `MGMT_TICKET_PER_DRAW` | 7 | billetterie (k$) par point d'attrait |
| `MGMT_AUD_BASE` | 0,7 | part d'audience acquise avant la soirée (le spectacle observé ne pèse que sur le reste) |
| `MGMT_AUD_PER_DRAW` | 1000 | écrans par point d'attrait × mix de spectacle (audience stockée en écrans entiers) |
| `MGMT_TV_PER_AUD` | 6 | droits du diffuseur (k$) pour 1000 écrans |
| `MGMT_TV_ECRANS` | 1000 | unité de `MGMT_TV_PER_AUD` (écrans) |
| `MGMT_CARD_CONTRACT` | 8 | carte contractuelle du diffuseur — les droits sont payés au prorata des combats joués (addendum §16) |
| `MGMT_DRAW_AVG` | 0,62 | attrait d'un combat moyen (mesuré : 0,616) |
| `MGMT_SPECTACLE_REF` | 0,64 | part de finitions de référence (mesurée : 0,638) |

Cohérence D4 : `mgmtAudienceRef` sans historique vaut 7 743 écrans, contre une
audience moyenne mesurée de 7 684 pour une carte complète (écart < 1 %). La
référence d'avant première soirée est donc celle qu'une carte moyenne aurait
produite, comme demandé par QO-7.

Tout est ajustable par Anthony après avoir joué ; recalibrer ne demande que
relancer l'outil après modification des constantes.

## 5. Hypothèses et limites

- **Proxies d'appariement.** Le profil propre imite un joueur qui met ses
  meilleurs noms en main card et des prélims soigneux (Leïla sans écrasement) ;
  le profil bâclé imite la carte écrasée (paires bâclées au sens du lot 2,
  tirées au hasard) — c'est la borne extrême du bâclé. Le comportement réel du
  joueur introduira des cartes intermédiaires — la mesure donne les deux bornes.
- **La carte réduite est mesurée le soir même** : sept combats de la carte
  propre, moins le prélim le plus faible. À la T7, la carte réduite en jeu sera
  exactement ce cas (les combats restants gardent leur attrait), la mesure
  transfère.
- **Purses d'avant combat.** Cachets et attrait sont lus sur les lignes
  d'avant combat, avant toute mutation du bilan — l'ordre exact de
  `mgmtRunEvent`.
- Les taux (blessures, suspensions) du lot 3a ne sont pas repris ici : ils
  touchent le corps, pas la recette d'une soirée.

## 6. Reproductibilité

Un même `--seed` et un même `--cards` donnent le même tableau bit à bit : la
RNG du jeu est la seule source de tirage et chaque soirée reprend sa graine
individuelle. La graine de base publiée est `20260915` (date du lot).
