# Monde lot 32 T1 (P2 T1 du brief « Des combattants uniques ») — le catalogue des traits : ce que chaque combattant a vécu

Branche : `p2-traits` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Worktree : `C:\Users\antho\Documents\cage-legacy-p2`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P2, tranche T1. S'appuie sur P1 : `mgmt-stats.js` (`mgmtStatsCombats`, `mgmtStatsCarriere`, `mgmtStatsIndex`) et `mgmt-releve.js` ; **lis ces deux fichiers en entier avant d'écrire**.

Règles communes : cherche toi-même dans le code ; **aucun texte de phrase dans cette tranche** (seuls les noms de traits ci-dessous, écrits par le superviseur, `relu:false` ; les phrases de fiche, de commentaire et de presse viennent après la mesure des effets, tranche T4) ; fonctions **pures, dérivées, rien ne se stocke** (aucun changement de sauvegarde, `MGMT_SAVE_VERSION` ne change pas, aucune clé nouvelle dans la partie) ; aucun `Math.random()` ; **aucune modification de `engine-combat*.js`** ; un test existant n'est réécrit que pour une décision citée ; monte à la main le `?v=` de chaque `.js` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` sur ton commit ; **lance les tests UN PAR UN avec `timeout 110 node --test tests/<f>.test.js`**, un test long en arrière-plan avec redirection (`nohup node --test tests/<f>.test.js > $TEMP/x.log 2>&1 &`) puis `sleep 60` répétés ; n'écris jamais « non mesuré » sans avoir essayé. **Règle d'arrêt : deux heures sans atteindre la cible, tu commites l'état avec « (inachevé) » et un rapport.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`.

## Ce que la tranche apporte
Deux combattants au même bilan ne se ressemblent plus : chacun porte **de un à quatre traits**, nés de ce qu'il a vécu et lus dans ses combats documentés (relevés) et dans son historique. Un trait est **un fait, jamais un chiffre** ; il a une condition d'obtention, une condition de perte, un sens public ou caché, et (tranche T2) un effet dans la cage. **Tout est dérivé à la demande** de `m.hist` : rien ne se stocke, rien ne migre. La tranche livre le catalogue et la dérivation ; pas d'effet dans la cage (T2), pas d'écran (T3), pas de phrase (T4).

## 1. Nouveau fichier `mgmt-traits.js` (logique pure, `"use strict";`, ancre `/* ==== [ANCRE: P2_T1_TRAITS] — Monde lot 32 T1 ==== */`), inscrit dans `index.html` après `mgmt-stats.js`, avec son `?v=`

### Le catalogue `MGMT_TRAITS`
Un tableau d'objets `{id, famille, nom, public, temporaire, effet:null, condition(c), conserve(c)}` où `c` est le **contexte d'un combattant à un cycle donné** (voir `mgmtTraitsContexte`) et `effet` reste `null` en T1 (rempli en T2). `public:true` = se lit dans les chiffres dès qu'il existe (T3 écrira l'affichage) ; `public:false` = caché tant qu'un combat, le recruteur ou la presse ne l'a pas révélé. `temporaire:true` = un état qui passe (il disparaît seul dès que `condition` n'est plus vraie ; les autres, une fois acquis, ne se perdent que si `conserve(c)` devient faux — une hystérésis évite que le trait clignote d'un combat à l'autre). **Trente-trois traits**, six familles ; `c.k` = les accumulateurs de la carrière documentée **avant le cycle donné** (voir plus bas) :

| id | nom | famille | public | temporaire | condition (obtention) | conserve (tant que) |
| --- | --- | --- | --- | --- | --- | --- |
| menton-granit | Menton de granit | menton | oui | non | ≥ 3 knockdowns encaissés et aucune défaite par KO, ≥ 5 combats documentés | aucune défaite par KO dans les 6 derniers combats |
| menton-fele | Menton fêlé | menton | non | non | ≥ 2 défaites par KO dans les 6 derniers combats | pas 4 combats consécutifs sans défaite par KO |
| encaisseur | Encaisseur | menton | oui | non | coups significatifs encaissés ≥ 4,0 par minute, ≥ 5 combats, au moins 45 % de victoires | ≥ 3,5 par minute |
| fragile-apres-ko | Fragile après un KO | menton | non | oui | dernière défaite par KO dans ses 2 derniers combats | — |
| diesel | Diesel | cardio | oui | non | ≥ 3 victoires de round ≥ 3 (finition au round ≥ 3, ou décision dans un combat de ≥ 3 rounds) | ≥ 2 |
| s-eteint | S'éteint au troisième | cardio | non | non | ≥ 3 défaites dont la fin tombe au round ≥ 3 (ou décision perdue en 5 rounds) | ≥ 2 |
| rythme-infernal | Rythme infernal | cardio | oui | non | coups significatifs donnés ≥ 5,0 par minute, ≥ 5 combats | ≥ 4,5 |
| sous-pression | Perd ses moyens sous la pression | mental | non | non | ≥ 4 combats de carte principale, victoires ≤ 35 % en principale | ≥ 4 combats principale et ≤ 45 % |
| revanchard | Revanchard | mental | non | non | ≥ 2 victoires contre un adversaire qui l'avait battu | ≥ 1 |
| hesite-apres-ko | Hésite après un KO | mental | non | oui | a subi un KO dans son dernier combat | — |
| grands-soirs | Se lève pour les grands soirs | mental | non | non | ≥ 4 combats de carte principale, victoires ≥ 70 % en principale | ≥ 60 % |
| serie-noire | En plein doute | mental | oui | oui | 3 défaites d'affilée (série en cours) | — |
| sur-sa-lancee | Sur sa lancée | mental | oui | oui | 4 victoires d'affilée (série en cours) | — |
| ne-se-releve-pas | Ne se relève pas | sol | non | non | ≥ 3 défaites par soumission ou arrêt, où l'adversaire a contrôlé ≥ 120 secondes en moyenne | ≥ 2 |
| chasseur-de-cou | Chasseur de cou | sol | oui | non | ≥ 3 victoires par soumission | ≥ 2 |
| tombeur | Tombeur | sol | oui | non | amenées ≥ 3,0 par 15 minutes et réussite ≥ 45 %, ≥ 5 combats | amenées ≥ 2,5 |
| mur | Mur anti-lutte | sol | oui | non | défense d'amenée ≥ 80 % sur au moins 10 amenées adverses | ≥ 75 % |
| etouffeur | Étouffeur | sol | oui | non | contrôle ≥ 240 secondes par 15 minutes, ≥ 5 combats | ≥ 200 |
| finisseur | Finisseur | finition | oui | non | ≥ 4 victoires dont ≥ 70 % par finition | ≥ 60 % |
| juge-dependant | Juge-dépendant | finition | oui | non | ≥ 5 combats dont ≥ 70 % allés à la décision | ≥ 60 % |
| foudroyant | Foudroyant | finition | oui | non | ≥ 3 victoires par finition au premier round | ≥ 2 |
| poings-de-marbre | Poings de marbre | finition | oui | non | ≥ 4 victoires par KO | ≥ 3 |
| specialiste-soumission | Spécialiste de la soumission | finition | oui | non | ≥ 3 victoires par soumission et ≥ 40 % de ses victoires | ≥ 30 % |
| guerrier | Guerrier | finition | non | non | ≥ 2 combats avec un knockdown de chaque côté | ≥ 1 |
| rouille | Rouillé | moment | oui | oui | dernier combat il y a ≥ 12 cycles (lis `mgmtRouille` et réutilise son seuil s'il existe) | — |
| vieux-briscard | Vieux briscard | moment | oui | non | ≥ 36 ans et ≥ 20 combats au bilan | ≥ 34 ans |
| jeune-loup | Jeune loup | moment | oui | non | ≤ 24 ans, ≥ 3 victoires et aucune défaite par KO | ≤ 26 ans |
| roi | Roi de la catégorie | moment | oui | non | ≥ 3 défenses de titre (faits `title_fight` gagnés comme champion) | ≥ 2 |
| invaincu | Invaincu | moment | oui | non | ≥ 6 victoires et aucune défaite, aucun nul | aucune défaite |
| debutant | Débutant | moment | oui | non | moins de 3 combats au bilan | moins de 6 |
| routinier | Routinier | moment | oui | non | ≥ 10 combats au bilan et aucun autre trait ne s'applique | — |
| comeback | Revenu de loin | mental | oui | oui | victoire juste après ≥ 2 défaites d'affilée | — |

(Table à recopier telle quelle.) Écris `condition` et `conserve` en JS clair, sans nombre magique caché : les seuils sont des constantes nommées en tête de fichier (`MGMT_TRAITS_SEUILS`), commentées avec « proposition de Claude, relu:false ».

### Le contexte `mgmtTraitsContexte(m,id,cycle)`
Rend les accumulateurs du combattant **à partir de ses seuls combats documentés dont le cycle est strictement inférieur à `cycle`** (le rejeu d'un combat passé doit retrouver les mêmes traits : jamais une lecture « du futur » ; sans `cycle`, tous les combats). S'appuie sur `mgmtStatsCombats(m,id)` : chaque combat a `c`, `slot`, `adversaire`, `resultat`, `famille`, `round`, `rounds`, `pour`, `contre`, `d`. Il rend `{n, dernier (liste des 6 derniers combats), bilan:{W,L,D}, age, victoires par famille, défaites par famille, kdRecus, kdDonnes, serieVictoires, serieDefaites, principale:{n,victoires}, revanches, titres, secondes, sig…}` — tout ce qu'il faut pour les conditions (choisis les noms, documente-les).

### L'API
- `mgmtTraitsDe(m,id,cycle)` → liste des ids de traits (ordre stable : famille puis ordre du catalogue), **au plus 4 retenus** : si plus de 4 s'appliquent, garde d'abord les temporaires, puis ceux de la famille la moins représentée, puis l'ordre du catalogue ; `debutant`/`routinier` ne comptent que si rien d'autre ne s'applique. Un combattant sans combat documenté ne reçoit qu'un trait neutre (`debutant` si moins de 3 combats au bilan, sinon `routinier`). **Hystérésis** : un trait acquis ne se perd que par `conserve` ; pour cela `mgmtTraitsDe` rejoue la suite des combats du plus ancien au plus récent (une passe) pour décider de l'état à chaque combat.
- `mgmtTraitInfo(id)` → l'entrée du catalogue (jamais mutée).
- `mgmtTraitsVisibles(m,id,cycle)` rend pour l'instant les traits `public:true` (T3 y ajoutera la révélation).
- Mémoïsation par `WeakMap` sur `m` avec invalidation quand la longueur de `m.hist` (et des `hist` des organisations) change, comme `mgmtStatsIndex`.

## 2. Tests (nouveau `tests/mgmtTraits.test.js`, à inscrire dans `test` ET `test:watch` de `package.json`, et en commande `test:traits`)
Fixtures : `mgmtPasseGenerer('split',{soirees:6})` à la graine 20261008 (rapide, via le cache de test s'il existe), et des combattants **fabriqués à la main** (entrées de `m.hist` avec des `s` réduits de valeurs connues) pour chaque condition. (1) Le catalogue : 33 traits, identifiants uniques, chaque famille représentée, `effet:null`, aucune phrase ; `etouffeur` existe. (2) **Une condition, un test** : pour chaque trait, un combattant fabriqué qui l'obtient et un qui en est juste en dessous (seuil moins un) qui ne l'obtient pas — table pilotée par les données, pas 33 tests écrits à la main. (3) Hystérésis : un trait acquis ne disparaît pas quand le chiffre redescend entre `conserve` et `condition`, disparaît sous `conserve` ; un trait temporaire disparaît dès que sa condition cesse. (4) Plafond : un combattant à 6 traits possibles n'en reçoit que 4, dans l'ordre défini ; `debutant`/`routinier` n'apparaissent jamais avec un autre trait. (5) **Pas de lecture du futur** : `mgmtTraitsDe(m,id,c)` ne change pas quand on ajoute à `m.hist` un combat de cycle ≥ c. (6) Pureté : deux appels donnent le même résultat ; `JSON.stringify(m)` est identique avant et après ; aucune clé nouvelle. (7) Sur la partie de six soirées : chaque combattant actif de Split a **au moins un trait** ; compte et consigne la répartition des traits (combien de combattants par trait) ; temps de `mgmtTraitsDe` pour tous les combattants de Split après le premier appel < 50 ms (mesure consignée). (8) Une partie ancienne (sans aucun relevé) ne plante jamais : seuls `debutant` ou `routinier` (d'après le bilan) apparaissent.

## Fin
Versions montées à la main dans `index.html`, `node tools/verif-versions.js origin/main`, tests touchés un par un, commit `Monde lot 32 T1 : le catalogue des traits` (le numéro T1 est obligatoire). Compte rendu dans la fiche : fichiers et rôle, tests (intitulés), **la répartition mesurée des traits sur la partie de six soirées**, les seuils que tu as trouvés trop larges ou trop serrés (un trait que 60 % des combattants portent, ou que personne ne porte, est un seuil à revoir : dis-le sans le corriger), écarts, questions.

## Compte rendu

- `mgmt-traits.js` : catalogue et première version de dérivation des traits ; `index.html` : script ajouté après `mgmt-stats.js`.
- `tests/mgmtTraits.test.js` : huit tests créés avec les intitulés de la fiche, mais le test 2 ne pilote pas encore des jeux de données au seuil et juste en dessous.
- Pas de migration de sauvegarde.
- Écart / blocage : le test ciblé (`timeout 110 node --test tests/mgmtTraits.test.js`) échoue sur sept tests. Il a révélé un catalogue à 32 entrées, des contextes qui manquent des noms attendus par les conditions (`principale`/`principale`), et une expression régulière incorrecte dans le test de texte. Le calcul plante donc avant les mesures et aucun résultat de répartition/temps n'a été obtenu. `package.json` n'a pas encore été inscrit dans `test`, `test:watch` et `test:traits`.
- Commits intermédiaires : pas 1 `7bda0d4`, pas 2 `35f039a`. Pas 3 à commiter en état inachevé ; reste à corriger avant livraison finale.
- Questions pour Anthony : aucune question de spécification ; la tranche est inachevée par défauts d'implémentation et tests non verts.
