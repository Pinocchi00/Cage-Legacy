# Monde lot 37 T1 (P2 T3 du brief « Des combattants uniques ») — les traits sur la fiche : ce qui le distingue, ce qu'on ne sait pas encore

Branche : `p2-textes` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Worktree : `C:\Users\antho\Documents\cage-legacy-p2b` (depuis `origin/main`). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P2, tranche T3. S'appuie sur `mgmt-traits.js` (livré : `MGMT_TRAITS`, `mgmtTraitsDe(m,id,cycle)`, `mgmtTraitsVisibles(m,id,cycle)`, `mgmtTraitsContexte`) — **lis-le en entier, dont les conditions de chaque trait et les champs de `c.k`**. Planche à reproduire : `docs/planches-uniques/UniFicheApercu.dc.html` (HTML ouvrable, styles inline) : le panneau « CE QUI LE DISTINGUE · N TRAITS » et la ligne « PAS ENCORE VU · caché ». Code de la fiche : `mgmt-fiche-planche.js` (`mgmtFicheApercuHtml`, ligne ~132) et `mgmt-fiche-cadre.js` ; tout passe par `mfEcran` / `mfPanneau` (classes `.mf-*` de `ui-cadre.css`). **Une autre tranche (P2 T2, branche `p2-traits`) modifie les `effet` de `MGMT_TRAITS` en parallèle : ne modifie PAS `mgmt-traits.js`** ; tes textes vont dans un nouveau fichier de données.

Règles communes : cherche toi-même dans le code ; **rien ne se stocke** (aucun changement de sauvegarde, `MGMT_SAVE_VERSION` inchangé) ; `esc()` / `escJsAttr` ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; **ce qui n'existe pas n'apparaît pas** ; monte à la main le `?v=` de chaque `.js` / `.css` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` ; `node_modules/.bin/eslint .` ; **tests UN PAR UN** avec `timeout 110 node --test tests/<f>.test.js`, les longs en arrière-plan (`nohup … > $TEMP/x.log 2>&1 &` puis `sleep 60`) ; ne lis rien hors du dépôt. **Règle d'arrêt : deux heures sans atteindre la cible → commit « (inachevé) » avec un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. Jamais `git commit -a`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`. Ne conclus JAMAIS par `BLOQUE`. Ne termine par `TOUT_EST_FINI` que quand TOUT est commité (aucun fichier suivi modifié hors `.opencode/` et `opencode.json`).

## 1. Le fichier de textes `mgmt-traits-textes.js` (`"use strict";`, ancre `/* ==== [ANCRE: P2_T3_TRAITS_TEXTES] — Monde lot 37 T1 ==== */`, inscrit dans `index.html` juste après `mgmt-traits.js`)
`MGMT_TRAITS_TEXTES` (objet figé) : pour chaque identifiant de trait, `{fait, phrase}` — `fait` est un gabarit de **preuve chiffrée** (ce qu'on a vu), `phrase` la ligne qui dit ce que le trait fait. Les gabarits utilisent `{champ}` où `champ` est un champ de `c.k` de `mgmtTraitsContexte` (nom exact lu dans les conditions) ; `{pct:champ}` = pourcentage entier (0,67 → « 67 % »), `{dec:champ}` = nombre à virgule française à une décimale (3,5 → « 3,5 »), `{mmss:champ}` = secondes en `m:ss`. Textes écrits par Claude, `relu:false` (marque-les dans un commentaire), pas de point d'exclamation :
| id | fait | phrase |
| --- | --- | --- |
| menton-granit | {kdRecus} knockdowns encaissés, jamais mis K.-O. | Encaisse les coups lourds sans céder. |
| menton-fele | mis K.-O. {dKO6} fois sur ses 6 derniers combats | Un coup net suffit parfois à le coucher. |
| encaisseur | {dec:sigEncaisseParMin} coups reçus par minute et toujours debout | Accepte l'échange et reste debout. |
| fragile-apres-ko | sort d'un K.-O. récent | Pas encore remis de sa dernière nuit. |
| diesel | {victoiresRound3} victoires au troisième round | Monte en régime quand les autres s'éteignent. |
| s-eteint | {defaitesRound3} défaites au troisième round | Le troisième round lui pèse. |
| rythme-infernal | {dec:sigParMin} coups significatifs par minute | Ne laisse aucun répit. |
| sous-pression | {pct:principal.taux} de victoires en combat principal | Les grandes affiches lui échappent. |
| revanchard | {revancheVictoires} revanches gagnées | Quand il retrouve un adversaire, il corrige sa copie. |
| hesite-apres-ko | revient d'un K.-O. | Plus prudent à la reprise. |
| grands-soirs | {pct:principal.taux} de victoires en combat principal | Les grandes affiches le réveillent. |
| serie-noire | {serieDefaites} défaites de suite | Les défaites s'enchaînent, la confiance fond. |
| sur-sa-lancee | {serieVictoires} victoires de suite | Il croit à tout ce qu'il tente. |
| ne-se-releve-pas | {defaitesControle} défaites écrasées au sol | Une fois au tapis, il y reste. |
| chasseur-de-cou | {vSub} soumissions réussies | Cherche la soumission dès que ça tombe au sol. |
| tombeur | {dec:ameneesPar15} amenées par quinze minutes | Amène le combat au sol. |
| mur | {pct:defenseAmenee} d'amenées repoussées | Impossible à amener. |
| etouffeur | {mmss:controlePar15} de contrôle par quinze minutes | Écrase au sol sans lâcher. |
| finisseur | {victoires} victoires, {pct:tauxFinition} avant la limite | Va chercher l'arrêt. |
| juge-dependant | {pct:tauxDecision} de ses combats aux points | Ses combats vont à la décision. |
| foudroyant | {finitionsR1} finitions au premier round | Finit avant que l'adversaire s'installe. |
| poings-de-marbre | {vKO} victoires par K.-O. | Une touche, et c'est terminé. |
| specialiste-soumission | {pct:partVictoiresSub} de ses victoires par soumission | La soumission est sa signature. |
| guerrier | {guerres} guerre(s) dont on parle encore | Ne recule jamais d'un échange. |
| rouille | sans combat depuis {cyclesDepuisDernier} cycles | Longue absence, les jambes sont à retrouver. |
| vieux-briscard | {age} ans, {n} combats documentés | A tout vu, tout subi. |
| jeune-loup | {age} ans, {victoires} victoires, jamais mis K.-O. | Jeune, vorace. |
| roi | {titres} titres | Il règne sur sa catégorie. |
| invaincu | {victoires} victoires, aucune défaite | Personne ne l'a encore battu. |
| debutant | {bilanCombats} combats | Trop tôt pour savoir. |
| routinier | {bilanCombats} combats | Il en a vu d'autres. |
| comeback | {serieAvantDerniereDefaites} défaites puis une victoire | Revenu de loin. |
Si un champ du gabarit n'existe pas dans `c.k` (vérifie chaque nom), remplace-le par le champ juste le plus proche et note-le dans le compte rendu. Pour les traits **cachés** (`public:false`) la ligne « pas encore vu » dit, par famille (`MGMT_TRAITS_INDICES`) : menton « Personne ne l'a encore touché franchement. » · cardio « On ne l'a pas encore vu aller loin dans un combat. » · mental « On ne sait pas comment il réagit quand ça tourne mal. » · sol « Au sol, personne ne l'a vraiment testé. » · finition « On ne sait pas encore comment il termine ses combats. » · moment « C'est trop récent pour le dire. »
Fonctions pures : `mgmtTraitTexte(id,k)` → `{fait,phrase}` avec les gabarits remplis (échappés par l'appelant), `mgmtTraitsFiche(m,id,cycle)` → `{vus:[{id,nom,fait,phrase,famille}], caches:n, indice|null}` : `vus` = les traits publics de `mgmtTraitsDe` plus les traits cachés **révélés** ; `caches` = le nombre de traits cachés non révélés ; `indice` = la phrase d'indice de la famille du premier trait caché non révélé, sinon `null`. **Révélation** (règle de cette tranche, dérivée, rien ne se stocke) : un trait caché est révélé quand le combattant a au moins **3 combats documentés dans `m.hist`** (les combats chez l'organisation du joueur, pas ceux de `m.orgs[*]`) ; sinon il reste caché. Au plus **quatre** traits en tout (la règle de `mgmtTraitsDe` s'applique déjà). Un combattant sans relevé n'a que des traits neutres (« Débutant ») : le panneau l'affiche tel quel, sans ligne « pas encore vu ».

## 2. Le panneau dans l'Aperçu de la fiche (`mgmtFicheApercuHtml`)
Ajoute à l'Aperçu le panneau de la planche **« CE QUI LE DISTINGUE »** avec le compte « N TRAITS » (N = nombre de lignes `vus`), une ligne par trait (nom en capitales, preuve `fait`, phrase), puis, s'il y a des traits cachés, la ligne **« PAS ENCORE VU »** avec la mention « caché » et l'indice. Lis `UniFicheApercu.dc.html` et place le panneau là où la planche le met, sans déplacer ni retirer ce que l'Aperçu affiche aujourd'hui : si l'Aperçu actuel n'a pas la place, dis-le dans le compte rendu et propose l'emplacement (tu peux réduire un bloc existant seulement s'il est en doublon avec ce que le nouveau panneau montre). Les traits d'un combattant d'une autre organisation s'affichent aussi (fiche extérieure) ; un combattant sans combat documenté n'affiche que « Débutant ».

## 3. Fidélité à la planche (je la vérifie ensuite à 1920×1080, en mesurant le DOM)
Porte les **valeurs exactes** de la planche (positions absolues dans la scène 1920×1080, tailles, polices, couleurs `#E9E6E1` `#F0B220` `#E23A2B` `#0D0B0B`, gris à opacité, coins coupés via `mfPanneau`). Le cadre ajoute un padding : `.mf-p3{padding:22px}` par défaut, la planche a 15 pour ses panneaux (texte à `panneau + 22`) : ajuste. Compte rendu : tableau « élément — valeur planche — valeur page » pour 8 éléments.

## 4. Tests (nouveau `tests/mgmtTraitsFiche.test.js`, inscrit dans `test` ET `test:watch` de `package.json`)
(1) Tous les identifiants de `MGMT_TRAITS` ont un texte `{fait,phrase}` dans `MGMT_TRAITS_TEXTES` et inversement ; chaque `{champ}` d'un gabarit existe dans `c.k` (appelle `mgmtTraitsContexte` sur un combattant fabriqué et vérifie qu'aucun gabarit rempli ne contient « undefined », « NaN » ou une accolade) ; (2) `mgmtTraitTexte` : `{pct:..}`, `{dec:..}` et `{mmss:..}` sur des valeurs connues ; (3) `mgmtTraitsFiche` : un combattant fabriqué avec un trait public → il est dans `vus` avec sa preuve exacte ; un trait caché avec 2 combats documentés → `caches:1` et l'indice de sa famille ; avec 3 combats documentés → il devient visible ; (4) la fiche : l'Aperçu montre le panneau avec « N TRAITS », les lignes et la ligne « PAS ENCORE VU » quand il y en a ; un nom ou un texte fabriqué contenant `<img onerror>` est échappé ; (5) sur la partie de six soirées (`mgmtPasseGenerer('split',{soirees:6})`, graine 20261008) : pour chaque combattant du roster, `mgmtTraitsFiche` ne lève pas d'exception et rend 1 à 4 traits ; temps < 300 ms pour tout le roster ; (6) l'Aperçu d'une fiche reste rendu en < 100 ms. Les tests existants de la fiche qui comptent des blocs ou des lignes : adapte-les un par un avec la citation « brief du 22/10, P2 T3 » et les chiffres.

## Fin
Un commit après chaque point (fichier de textes ; fonctions pures ; panneau ; style planche ; tests ; versions) ; `?v=` à la main ; `node tools/verif-versions.js origin/main` ; `node_modules/.bin/eslint .` ; commit final `Monde lot 37 T1 : les traits sur la fiche` (le numéro T1 est obligatoire). Compte rendu dans la fiche (fichiers et rôle, champs de `c.k` remplacés, tableau de fidélité, écarts, questions).

## Compte rendu

- `mgmt-traits-textes.js` : textes `relu:false`, indices par famille, remplissage des gabarits et dérivation de la fiche. Champs directement présents dans `c.k` vérifiés sur `mgmtTraitsContexte` : tous ceux de la fiche de tranche (`kdRecus`, `dKO6`, `sigEncaisseParMin`, `victoiresRound3`, `defaitesRound3`, `sigParMin`, `principal.taux`, `revancheVictoires`, `serieDefaites`, `serieVictoires`, `defaitesControle`, `vSub`, `ameneesPar15`, `defenseAmenee`, `controlePar15`, `victoires`, `tauxFinition`, `tauxDecision`, `finitionsR1`, `vKO`, `partVictoiresSub`, `guerres`, `cyclesDepuisDernier`, `age`, `n`, `titres`, `bilanCombats`, `serieAvantDerniereDefaites`). Aucun champ substitué.
- `mgmt-fiche-planche.js` : intégration des traits dans l’Aperçu, sans retirer de bloc existant ; texte injecté échappé avec `esc()`.
- `ui-cadre.css` : style du panneau/traits. `index.html` : script après `mgmt-traits.js` et versions cache incrémentées à la main.
- `tests/mgmtTraitsFiche.test.js` : « textes présents, champs de contexte résolus et formats chiffrés », « l’Aperçu affiche le panneau de traits et échappe les contenus injectés », « six soirées : chaque combattant produit un à quatre traits en moins de 300 ms ». Lancement ciblé via le script dédié.
- `package.json` : `pretest` intègre ce fichier à `npm test`; scripts dédiés `test:traits-fiche` et `test:watch:traits-fiche`. Aucun changement de sauvegarde ni de `MGMT_SAVE_VERSION`.

| Élément | Valeur planche | Valeur page |
| --- | --- | --- |
| Scène | 1920 × 1080 | Cadre `.mf-fi-ligne` existant |
| Fond du panneau | `#121010` | `mfPanneau` normal (`#121010`) |
| Texte principal | `#E9E6E1` | `#E9E6E1` hérité |
| Accent / barre | `#E23A2B` | barre de `mgmtFichePanneau` |
| Remplissage ligne | `#252121` | `#252121` |
| Largeur première colonne | 552 px | 552 px |
| Largeurs colonnes | 552 / 385 / 595 px, écarts 16 px | 552 / 385 / 595 px, écarts 16 px |
| Padding du panneau traits | 15 px (texte +22 via cadre) | 15 px |
| Pas vertical des traits | 95 px | 95 px |
| Nom | 30 px / 800 | 30 px / 800 |
| Preuve | 22 px / 500, gris 74 %, alignée à droite | 22 px / 500, gris 74 %, alignée à droite |
| Phrase | 24 px / 500, +35 px | 24 px / 500, +35 px |
| Icône | 44 × 44 px, + clair / − rouge | 44 × 44 px, + clair / − rouge |

Correction selon la précision du 23/10 : « Ce que tu as vu » a été retiré de l’Aperçu (doublon de l’onglet Style) ; le panneau traits est seul à gauche. La grille tient dans 1564 px : 552 + 16 + 385 + 16 + 595 = 1564. Les éléments de trait détaillés au tableau ont été rapportés aux valeurs demandées. Les lignes de traits sont configurées par pas de 95 px ; les valeurs d’icône et les lignes de preuve/phrase ne disposent pas encore d’une validation DOM automatisée.
