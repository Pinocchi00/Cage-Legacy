# Monde lot 32 T2 (P2 T2 du brief « Des combattants uniques ») — l'effet des traits dans la cage, mesuré

Branche : `p2-traits` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Worktree : `C:\Users\antho\Documents\cage-legacy-p2`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P2, tranche T2. Suite de `docs/lots/MONDE-LOT-32-T1.md` (le catalogue `MGMT_TRAITS` de 32 traits dérivés, `mgmtTraitsDe(m,id,cycle)`). **Feu vert conditionnel d'Anthony (22/10) : le moteur de combat n'est touché que pour un effet MESURÉ avant/après ; un trait sans effet mesurable est retiré.**

Règles communes : cherche toi-même dans le code ; **aucune modification de `engine-combat*.js`** (les effets passent par les attributs du combattant préparé, voir §1) ; aucun texte nouveau ; aucun `Math.random()` ; `MGMT_SAVE_VERSION` ne change pas, rien ne se stocke (les traits restent dérivés) ; un test existant n'est réécrit que pour une décision citée **et avec les chiffres mesurés** ; monte à la main le `?v=` de chaque `.js` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` sur ton commit ; **lance les tests UN PAR UN avec `timeout 110 node --test tests/<f>.test.js`** ; tout ce qui dure plus (mesures, tests de génération) en **arrière-plan avec redirection** (`nohup … > $TEMP/x.log 2>&1 &`) puis `sleep 60` répétés : tu ATTENDS, tu n'écris jamais « non mesuré » sans avoir essayé. **Règle d'arrêt : deux heures sans atteindre la cible → tu commites l'état avec « (inachevé) » et un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`.

## Ce que la tranche apporte
Les traits changent la façon de combattre : un menton de granit encaisse, un diesel tient la distance, un chasseur de cou finit au sol. L'effet est **faible, lisible et mesuré**, et chaque trait qui n'a pas d'effet mesurable est **retiré du catalogue**.

## 1. Où l'effet s'applique : `mgmtFightReady` (`mgmt-corps.js` ~ligne 204)
`mgmtFightReady(f,cycle)` prépare le combattant du management pour le moteur : il copie son profil (`c.attrs`, `c.dynamic`…) et y applique déjà le traumatisme (menton, durabilité), l'expérience, la forme et le camp. **Ajoute là, après ces ajustements,** `mgmtTraitsAppliquer(partie,f,cycle,c)` qui lit `mgmtTraitsDe(partie,f.id,cycle)` (T1 ; `partie = G.mgmt`) et pour chaque trait porteur d'un `effet` ajuste `c.attrs[clé]` : `c.attrs[k]=clamp(round(c.attrs[k]+delta),1,100)` (même borne que le traumatisme), puis `c.overall=overall(c)` si le code voisin le fait. **Le rejeu d'un combat passé doit retrouver exactement le même combattant** : `mgmtTraitsDe(partie,id,cycle)` ne lit que les combats de cycle < `cycle` (T1 le garantit) ; vérifie-le par un test (le rejeu d'un combat de `m.hist` donne le même résultat avant et après l'ajout de combats plus récents). Un combattant sans relevé (partie ancienne) n'a que les traits neutres, donc **aucun effet** : une partie d'avant se comporte comme avant.
Les attributs disponibles (`c.attrs`) : jab, cross, hook, kick, clinchStr, takedown, tdd, topControl, gnp, submission, guardWork, fightIQ, composure, aggression, heart, discipline, adaptability, killer, focus, confidence, power, handSpeed, footSpeed, cardio, strength, chin, recovery, explosiveness, flexibility, durability.

## 2. La table des effets (première proposition de Claude, `relu:false` — c'est la mesure qui tranche)
Remplis `effet` (objet `{attribut: delta}`) dans `MGMT_TRAITS`. Les `delta` sont en points d'attribut (échelle 1-100). Les traits « états » sans effet propre sont notés `—` : ils restent dans le catalogue comme information (T3 les affiche), exemptés de la règle de retrait.

| trait | effet |
| --- | --- |
| menton-granit | chin +7, durability +3 |
| menton-fele | chin −7 |
| encaisseur | durability +4, heart +3 |
| fragile-apres-ko | chin −4, confidence −5 |
| diesel | cardio +7 |
| s-eteint | cardio −7 |
| rythme-infernal | cardio +3, aggression +4 |
| sous-pression | composure −8 |
| revanchard | heart +4 |
| hesite-apres-ko | confidence −6, aggression −4 |
| grands-soirs | composure +4 |
| serie-noire | confidence −5 |
| sur-sa-lancee | confidence +5 |
| ne-se-releve-pas | tdd −6, guardWork −6 |
| chasseur-de-cou | submission +7 |
| tombeur | takedown +6 |
| mur | tdd +7 |
| etouffeur | topControl +7 |
| finisseur | killer +6 |
| juge-dependant | killer −5, discipline +3 |
| foudroyant | explosiveness +5, killer +3 |
| poings-de-marbre | power +5 |
| specialiste-soumission | submission +6 |
| guerrier | heart +4, aggression +3 |
| comeback | heart +3 |
| vieux-briscard | fightIQ +4, explosiveness −4 |
| jeune-loup | explosiveness +4, composure −3 |
| roi | confidence +4, composure +3 |
| invaincu | confidence +4 |
| rouille, debutant, routinier | — (rouille est déjà lue par `mgmtRouille`) |

## 3. L'outil de mesure `tools/mesure-traits.js`
`node tools/mesure-traits.js [combats=1500] [trait,trait,…] [--json]` : pour chaque trait porteur d'un `effet`, simule `combats` combats **entre deux copies d'un même combattant moyen** (prends dix combattants réels de niveau moyen de la catégorie `H-light` d'une partie `mgmtPasseGenerer('split',{soirees:2})`, graine fixe, et répartis les combats ; alterne les coins A/B) où **le combattant A a l'effet du trait appliqué à ses attributs (via la même fonction que le jeu, `mgmtTraitsAppliquer` ou son noyau pur) et B ne l'a pas**. Seule la RNG de graine (`setSeed`) tire ; aucun `Math.random()`. Pour chaque trait il affiche : victoires de A en % (± erreur standard), part des victoires de A par finition, part de ses défaites par KO, soumissions réussies/subies par combat, amenées réussies par combat, coups significatifs aux rounds 1 et 3 (relevé) — et **le verdict** :
- **mesurable** si la victoire de A s'écarte de 50 % d'au moins 2,5 points (soit environ 2 erreurs standard à 1 500 combats), **ou** si la métrique signature du trait bouge d'au moins 15 % en relatif : menton (chin, durability, fragile) → part des défaites de A par KO ; cardio (diesel, s-eteint, rythme) → rapport coups significatifs du round 3 sur ceux du round 1 (relevé complet) ; sol (chasseur, specialiste, ne-se-releve-pas) → soumissions réussies ou subies ; (tombeur, mur, etouffeur) → amenées ou contrôle ; finition (finisseur, foudroyant, poings) → part de ses victoires par finition ; mental (composure, confidence, heart, aggression) → la victoire seule ;
- **sans effet mesurable** sinon.
Écris le tableau complet dans `tools/reports/TRAITS-MESURES.md` (une ligne par trait : effet appliqué, victoire A ± ES, métrique signature avant/après, verdict).

## 4. Le retrait et le garde-fou de calibrage
- Un trait « sans effet mesurable » est **retiré du catalogue** (`MGMT_TRAITS`) et de la table de test T1 ; le compte (« 32 traits ») devient le nombre restant, noté dans le rapport. Les traits exemptés (`rouille`, `debutant`, `routinier`, et ceux sans `effet` par construction) restent. Si un trait mesurable a un effet **trop fort** (victoire de A ≥ 62 % ou ≤ 38 %), divise son delta par deux et remesure.
- **Garde-fou global** : avec les effets branchés, `node tools/mesure-finitions-jeu.js 40 20261008,777,4242` ne doit pas sortir des bandes du jeu : finitions 45–60 %, KO/TKO 25–36 %, soumissions 12–22 % (mesure d'avant sur `origin/main` : écris-la d'abord dans le rapport, puis celle d'après). Si on sort des bandes, multiplie **tous** les delta par un même facteur (0,75 puis 0,5) jusqu'à y rentrer, et dis le facteur retenu. Mesure aussi le temps de `mgmtPasseGenerer('split',{soirees:62})` avant/après : ≤ +25 %.

## Tests
(1) **Un trait, un effet** : pour 5 traits de familles différentes, `mgmtFightReady` d'un combattant fabriqué qui porte le trait (relevés réduits fabriqués dans `m.hist`) a l'attribut ajusté du delta attendu, borné à [1,100] ; sans le trait, l'attribut est inchangé ; un combattant sans relevé n'est pas modifié. (2) **Le rejeu reste identique** : sur une partie de six soirées, `mgmtObs`/le rejeu d'un combat de `m.hist` (par sa graine et ses côtés) redonne le même résultat avant et après l'ajout de combats postérieurs. (3) **Pas de lecture du futur** : `mgmtFightReady(f,c)` ne change pas quand on ajoute à `m.hist` un combat de cycle ≥ c. (4) Le catalogue après retrait : tous les traits restants sont soit avec un effet mesurable dans `tools/reports/TRAITS-MESURES.md`, soit exemptés ; le fichier existe. (5) Les tests de génération et d'empreinte qui bougent légitimement (`mgmtPasse`, `mgmtPasseSixAns`, `combatFinitionsJeu`, `moteurRecalibrage`, `mgmtEffectif30`…) : **un par un**, adapte avec la citation « brief du 22/10, P2 T2 : les traits changent les combats » et les chiffres mesurés ; jamais d'élargissement sans mesure ; les empreintes se recalculent en vérifiant d'abord par comparaison de JSON avec `origin/main` que seuls les résultats de combat (et ce qui en découle) changent. Nouveau fichier `tests/mgmtTraitsEffets.test.js`, inscrit dans `test` ET `test:watch` de `package.json`.

## Fin
Versions à la main dans `index.html` (`mgmt-traits.js`, `mgmt-corps.js`), `node tools/verif-versions.js origin/main`, tests touchés un par un, commit `Monde lot 32 T2 : l'effet des traits dans la cage, mesuré` (le numéro T2 est obligatoire). Fais un commit **après chaque partie** (1 branchement ; 2 outil de mesure ; 3 mesures et retrait ; 4 garde-fou ; 5 tests adaptés).

## Compte rendu

### État de reprise (23/10/2026)

- `mgmt-traits.js` était déjà commité avant la reprise (`aa978f7 Monde lot 32 T2 : le catalogue garde ses 32 traits, 8 ont un effet mesuré`), conformément au message demandé.
- `tools/reports/TRAITS-MESURES.md` : remplacé le retrait par le maintien des 32 traits / 8 effets mesurés et noté que `engine-combat.js` lit le cardio sur `a.cardio` / `b.cardio`, pas sur `c.attrs.cardio`. Commit `2eef411`.
- `tests/mgmtTraits.test.js` : table restaurée à 32 traits depuis `origin/main`, test de retrait de « série noire » supprimé et assertions de 32/8 ajoutées. Test ciblé échoue sur une contradiction à clarifier : les 32 entrées réelles utilisent **six** valeurs de `famille` (`menton`, `cardio`, `mental`, `sol`, `finition`, `moment`), alors que la demande de reprise exige « quatre familles ». Aucun remaniement de catégories n'est fait sans décision.
- Non réalisés : mesure de garde-fou et de génération avant/après, tests `mgmtTraitsEffets.test.js`, adaptations de tests d'empreinte, vérifications de versions/lint et commit final.

## Compte rendu de reprise (23/10/2026)

- Mesure d'avant et mesure d'après reprises dans `tools/reports/TRAITS-MESURES.md`. La distribution de combats reste dans les bandes avec le facteur 0,75 déjà appliqué aux effets (finitions 54,3 %, KO/TKO 32 %, soumissions 18,3 %). Le temps 62 soirées est de 96 664 ms contre 52 911 ms (+82,9 %), hors seuil de +25 %.
- L'amplitude des deltas n'a aucun lien démontré avec le temps de génération; je ne réduis pas arbitrairement les effets et ne prétends pas satisfaire le garde-fou runtime. Le point 3 reste bloqué par ce dépassement.
- Points 4 à 6 non réalisés dans cette reprise. Aucun test d'effet ajouté ni test d'empreinte lancé.
- Fichiers modifiés dans cette reprise : rapport de mesure (résultats et écart au garde-fou), cette fiche (compte rendu). Questions pour Anthony : aucune question ouverte; blocage objectif du runtime noté ci-dessus.

## Compte rendu — reprise performance (23/10/2026)

- Étape A committée (`b417068`) : `tools/mesure-generation.js` réalise la comparaison dans le même harnais et avec la même graine ; quatre mesures ajoutées à `tools/reports/TRAITS-MESURES.md` (avec traits : 67 144 et 55 598 ms ; sans traits : 41 868 et 65 522 ms). La variation de charge est élevée et inverse l'écart entre les paires, donc le seuil n'est pas encore validé.
- Diagnostic par lecture des appels : `mgmtFightReady` appelle `mgmtTraitsAppliquer`, qui appelle `mgmtTraitsDe`; `mgmtTraitsCombats` appelle `mgmtStatsCombats`, et celui-ci déclenche `mgmtStatsIndex`. Ce dernier invalide son index à chaque changement de longueur de `hist`, puis reparcourt tous les combats documentés. L'hypothèse de coût quadratique est confirmée par le chemin de code.
- Vérification ciblée exécutée : `node --test tests/mgmtTraits.test.js` — 9 tests réussis, dont les tests de pureté et d'absence de lecture du futur.
- Non réalisés : optimisation du calcul/index, remesure après correction, tests `mgmtTraitsEffets.test.js`, tests de génération affectés, contrôles de versions/lint et commit final. Aucun code de gameplay n'a été changé, donc pas d'effet de trait validé/modifié dans cette reprise.
- Fichiers ajoutés/modifiés et rôle : `tools/mesure-generation.js` (mesure A/B), `tools/reports/TRAITS-MESURES.md` (mesures avant correction), cette fiche (état de reprise).
- Écart/limite : les quatre temps montrent une charge ambiante non stable. Le comportement des traits est préservé ; leur optimisation reste à faire avant de pouvoir atteindre le critère de fin. Questions pour Anthony : aucune.
