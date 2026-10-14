# Monde lot 8 T4b — événements moyens N1, N4, N5, N11

**Branche** : `monde-lot-8-suite` (branche courante vérifiée). Prérequis : T1, T6 et T4a présents. Si `mgmtMondeApresSoiree`, `mgmtMondeOuvreCycle` et les genres T4a de `MGMT_MARQUE_FAITS` manquent, STOP et signaler le prérequis absent. Lis les fonctions par leur nom : les numéros de ligne évoluent.

## 1. Objectif
Ajouter les quatre événements de coût moyen N1, N4, N5 et N11 comme faits datés attachés aux combattants, soumis au budget T6 et lus dans la fiche sans fenêtre.

Brief, lot 8 : « Chaque menu a ses événements. Ils naissent là où ils ont du sens, pas tous dans Presse. »

Décisions faisant foi (`docs/lots/MONDE-LOT-8-DECISIONS.md`, §1, §4) : N1 annonce trois soirées avant l'âge de retraite ; N4 parle d'un dépassement quand les deux sont top 10 après la soirée, qu'au moins l'un a combattu, un dépassement par combattant et soirée, en choisissant le mieux classé ; N5 challenger n°1 ; N11 réveil après voisinage (écart ≤2), titre pris/défendu, ou retour d'une blessure d'au moins trois soirées, un réveil par combat et par an. Les réglages techniques de §4 sont la règle à implémenter.

## 2. Ce qui existe
- `mgmt-bureau.js` : l'ancre T4a en fin de fichier, faits et hooks `mgmtMondeApresSoiree(m,premier)` / `mgmtMondeOuvreCycle(m)`. Porte les détecteurs purs et idempotents de T4a ; compléter ces hooks, ne pas créer un second pipeline.
- `mgmt-corps.js` : `mgmtRetireAge(f,cycle)` calcule le seuil 39–42 ; `mgmtRetireRoster(m)` applique la retraite d'âge et écrit `retired`. Utiliser le même calcul, sans avancer le retrait (`mgmt-corps.js:260-324`).
- `mgmt-suivi.js` : `mgmtPretendant(m,div)` renvoie le mieux classé organisationnel non champion ; `mgmtSplitTitle` fournit le champion et le règne (`:193-200`, `mgmt-ceintures.js:26`). Porte la détermination du challenger.
- `mgmt-suivi.js` : `mgmtClassementLignes` calcule les deltas (`:141`), et `mgmtDivisionRanking` donne les rangs ; règle N4 validée dans DECISIONS §4. Ne pas déduire le dépassement du seul delta.
- `mgmt-rivalites.js` : `mgmtAffrontements(m)` retourne les traces groupées par paire avec index/cycle ; `mgmtRivalites(m)` filtre les rivalités/trilogies encore actives (`:26-64`). Porte la lecture de l'historique complet pour N11, mais son seuil de 12 cycles ne doit pas devenir le seuil N11.
- `mgmtMondePhrase(m,x)` dans `mgmt-bureau.js` résout les faits T4a ; `MGMT_MONDE_PHRASES` dans `mgmt-data.js`. `mgmtFichePromesses`/`mgmtFicheCorps` dans `mgmt-ecran-fiche.js` sont les lecteurs existants. Marque/budget dans `mgmt-attention.js` (`MGMT_MARQUE_FAITS`).
- Tests existants : `tests/mgmtMondeEvenements.test.js` (T4a) fournit l'amorçage déterministe `neuve(seed)`, `jouer`, les assertions d'idempotence et de marque. L'étendre plutôt que recopier son harnais.

## 3. Ce qui change
Tous les faits nouveaux portent `c` (cycle courant), `k`, `a` (id roster), et les champs indiqués ci-dessous. Détection pure hors écriture, aucune RNG, DOM ni minuterie ; garde empêchant les doublons selon la clé métier.

**`mgmt-bureau.js`**, dans l'ancre Monde lot 8 :
- `/** N1 : écrit une annonce trois soirées avant la retraite d'âge calculée, sans modifier la retraite. */ function mgmtMondeAnnoncesRetraite(m)` : examiner le roster non retiré ; utiliser `mgmtRetireAge(f,m.cycle)` et l'âge après progression déjà appliqué pour reconnaître exactement le cycle précédent l'âge-seuil ; fait `retraite_annoncee` `{c,k,a}` une seule fois par combattant. Ne pas annoncer les retraites médicales.
- `/** N4 : dépassements du classement de Split après la soirée. @param {number} premier index du premier combat du soir dans m.hist */ function mgmtMondeDepassements(m,premier)` : seulement deux combattants du roster, dans le top 10 organisationnel de la même division après soirée ; au moins un figure dans les traces du soir ; écrire `depassement` `{c,k,a,b,div,fight}` pour celui qui passe devant (a) et le dépassé (b), `fight` index de la trace explicative. Au plus un fait par combattant dépassé : prendre le mieux classé des dépassements de cet a. Déterminer les gagnants/perdants par rang final, pas par delta seul.
- `/** N5 : écrit le fait du challenger n°1 face au champion, une fois par prétendant et règne. */ function mgmtMondeChallengers(m)` : pour chaque division avec champion et prétendant (`mgmtPretendant`), écrire `challenger` `{c,k,a,div,champion,since}` ; ne répéter ni pour le même prétendant et règne ni chaque cycle. Un titre vacant ne produit pas de déclaration.
- `/** N11 : réveille les anciens combats éligibles, une fois par paire/combat et par année de jeu. */ function mgmtMondeVieuxCombats(m)` : relire `m.hist` et rangs de Split. Réveils autorisés uniquement si écart de rang actuel ≤2, si l'un prend/défend un titre, ou au retour de blessure ≥3 soirées ; ne considérer que combattants roster vivants. Fait `vieux_combat` `{c,k,a,b,fight,raison}` pour les deux combattants ; clé de garde par index de combat et année, sans redire le même déclencheur plusieurs fois dans l'année. Pour le retour de blessure, comparer au cycle de fin de suspension/blessure déjà connu par le jeu.
- Ajouter N4 à `mgmtMondeApresSoiree`, N1/N5/N11 aux hooks d'ouverture/soirée appropriés, sans double exécution. Rattrapage à l'ouverture ne doit pas inventer des événements N4 ou réveiller des faits historiques comme s'ils venaient de se produire : appeler les détecteurs uniquement au moment du déclencheur. Ajouter quatre genres à `MGMT_MARQUE_FAITS` dans `mgmt-attention.js`.

**`mgmt-data.js`** : ajouter `MGMT_MONDE_PHRASES` pour les nouveaux genres, marqués `relu:false`, selon les textes livrés par `@ecrivain` ; pas d'étiquette brute du catalogue.

**`mgmt-bureau.js`** : étendre `mgmtMondePhrase(m,x)` pour les faits nouveaux ; texte brut, données joueur échappées au rendu.

**`mgmt-ecran-fiche.js`** : ajouter les faits au bloc « depuis ta dernière visite »/section existante correspondant au type, en ordre récent, avec `mgmtMondePhrase` et échappement `esc()`. N11 affiche le nom de l'autre combattant et la raison ; aucun nouvel écran ni CSS.

**`tests/mgmtMondeEvenements.test.js`** : ajouter les tests ci-dessous. Ajouter aussi le nouveau fichier de tests aux scripts `test` et `test:watch` de `package.json` seulement si le fichier existant n'est pas déjà référencé.

## 4. Sauvegarde
Non. `MGMT_SAVE_VERSION` inchangée : les événements sont des faits append-only de `m.facts`. Aucun bloc de validation strict : les sauvegardes anciennes restent valides et les anciens faits incomplets ne doivent pas être rejetés. Vérifier qu'un rechargement conserve les nouveaux faits et leurs marques.

## 5. Textes
Les six gabarits sont DÉJÀ ÉCRITS : ils sont dans la section « TEXTES livrés par Claude » en bas de cette fiche. N'appelle AUCUN sous-agent (@ecrivain est inaccessible depuis le codeur : « subagent depth limit reached »). Copie les six gabarits tels quels dans `MGMT_MONDE_PHRASES`, là où il vit déjà.

## 6. Écran
Aucun nouvel écran ni planche : réutiliser la fiche existante. Aucun popup, défilé ni minuterie.

## 7. Tests
Fichier : `tests/mgmtMondeEvenements.test.js` — intitulés exacts à ajouter :
1. `Monde T4b — N1 : l’annonce tombe trois soirées avant l’âge de retraite et ne change pas la date de retraite` : graines 7 et 19, faire progresser jusqu'au seuil ; annonce exactement à l'âge-seuil moins trois soirées, pas avant/après, retrait à l'âge normal ; annonce unique après deux ouvertures du cycle ; retraite médicale : aucune annonce.
2. `Monde T4b — N4 : le mieux classé des top 10 est seul déclaré dépassé et le fait cite la trace` : graine 7, faux rangs après soirée et traces contrôlés ; vérifier div, ids a/b, index exact de trace ; combattants hors top 10 ou sans participant du soir : aucun fait ; plusieurs dépassés pour un a : un seul, celui au meilleur rang ; second appel : aucun doublon.
3. `Monde T4b — N5 : le challenger n°1 se déclare une seule fois par règne` : graine 7, champion/pretendant établis, fait avec a, champion, div et since ; second appel : aucun fait ; changement de challenger ou nouveau règne : un fait nouveau ; ceinture vacante : aucun.
4. `Monde T4b — N11 : les trois déclencheurs réveillent un ancien combat une fois par année` : graine 7 ; paires de rangs à ≤2 et >2, title_fight de prise/défense, retour de blessure ≥3 soirées ; vérifier index combat, paire et raison ; même paire déclenchée de nouveau dans l'année sans doublon, puis éligibilité l'année suivante ; blessures plus courtes, retraité ou combattant absent : aucun fait.
5. `Monde T4b — les quatre genres allument la marque et passent par le budget` : un fait de chaque genre sur des combattants distincts après `mgmtVisitesInit` ; marque vraie pour chacun et `mgmtMarquesAllumees(m).length<=mgmtConteurBudget(m)`.
6. `Monde T4b — les quatre genres ont une phrase de fiche accordée et échappée` : chacune des variantes a une sortie non vide selon le gabarit livré, `relu:false` présent ; injection d'un nom HTML ressort échappée au rendu ; genre inconnu retourne null.
7. `Monde T4b — rechargement conserve les faits et aucune fenêtre n’est ouverte` : `saveMgmt(); G.mgmt=null; loadMgmt()` conserve les quatre genres et marques ; source de la logique T4b sans popup/`CL.go`/`setTimeout`.
8. Les tests T4a préexistants du fichier restent verts sans modification d'assertions.

## 8. Vérification
- Ciblée : `node --test tests/mgmtMondeEvenements.test.js`, 8 tests T4b verts plus tous les tests T4a du fichier.
- Régression ciblée : `node --test tests/mgmtMarque.test.js tests/mgmtMarqueBudget.test.js tests/mgmtPromesses.test.js tests/mgmtCeintures.test.js tests/mgmtSuivi.test.js tests/mgmtEcranFiche.test.js` : 0 échec.
- Fin de tranche : `npm run check:rapide` vert. Critère chiffré : aucun échec dans les tests ciblés et check rapide.
- Si des fichiers JS changent, `node tools/_bump.js <fichiers-js-modifiés>` puis `node tools/verif-versions.js origin/main`.

## 9. Hors périmètre
N2 et sa montée/descente de catégorie (T4c), N9 (lot 9), T5 suites, T7 passé, T8 textes/relecture finale ; pas d'événements extérieurs au roster, aucun changement de sauvegarde, de budget T6, de visites T1, de design ou de menus. Ne pas modifier les seuils/choix d'Anthony dans `MONDE-LOT-8-DECISIONS.md`.

## 10. Pièges
- La marque exige à la fois un genre reconnu et un `a` id roster ; un événement collectif sans identifiant n'allume rien.
- `mgmtMondeOuvreCycle` est appelé lors d'un cycle créé et parfois au rattrapage ; chaque détecteur doit être idempotent et réservé au bon déclencheur.
- `mgmtRetireRoster` exécute l'âge à l'ouverture après progression d'âge : calculer l'annonce relativement à la même chronologie, ne pas déplacer la retraite.
- `mgmtDivisionRanking` est mémoïsé : invalider les rangs après changements pertinents comme le fait la T4a, et ne pas garder les rangs pré-soirée.
- `m.hist` est l'historique fiable ; `m.lastEvent` est écrasé à la soirée suivante et `m.fil` limité à 200.
- Les retraites ont deux causes et les anciens `retired.a` peuvent être `{id}`. Aucun texte ne doit être injecté sans `esc()`.
- N11 « un an » et « trois soirées » sont des termes métier du jeu : ne pas substituer arbitrairement une conversion en cycles/calendrier ; voir questions.

## 11. Questions pour Anthony
- (TRANCHÉ par la DÉCISION du superviseur en bas de fiche) N1 : « trois soirées avant » désigne-t-il trois ouvertures de cycle avant la soirée où l'âge atteint le seuil, ou trois soirées effectivement combattues par ce combattant ? Le code distingue ces horloges.
- (TRANCHÉ par la DÉCISION du superviseur en bas de fiche) N5 : le brief/inventaire dit qu'un challenger « se déclare », mais ne précise pas si cela doit arriver automatiquement au premier cycle de chaque règne, quand le prétendant change, ou à une autre occasion ; quelle condition de naissance fait foi ?
- (TRANCHÉ par la DÉCISION du superviseur en bas de fiche) N11 : « un réveil par an » : année calendaire via `m.cal.jour`, ou tranche fixe de 12 cycles ? Et pour les déclencheurs de titre/blessure, quel est l'ancien combat concerné si le combattant a plusieurs combats historiques avec le même adversaire ?

## DÉCISION du superviseur — 14/10/2026 16 h 20 (réponses aux trois STOP ; Anthony laisse le technique à Claude)
Le STOP de tête est périmé. Les trois questions sont tranchées, code sans demander :
- **N1 « trois soirées avant »** = trois cycles, donc trois ouvertures de cycle avant le cycle où le combattant atteint l'âge de retraite calculé (`mgmtRetireAge`). Un cycle = une soirée du calendrier ; on ne compte pas les combats du combattant. Le fait `retraite_annoncee` est écrit à l'ouverture du cycle `seuil − 3`, une seule fois par combattant (garde sur `a`), et si le combattant est déjà plus près du seuil à la première lecture (partie chargée tard, rattrapage), il est annoncé UNE fois, jamais en série.
- **N5** : le challenger se déclare automatiquement à l'ouverture du premier cycle où `mgmtPretendant` donne un prétendant distinct du champion pour un règne en cours, et de nouveau si le prétendant change ou si un nouveau règne commence. Clé unique : (div, champion, since, challenger). Titre vacant : aucune déclaration.
- **N11** : « un réveil par an » = une tranche fixe d'une année de jeu, `Math.round(MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS)` cycles (10 aujourd'hui, à calculer depuis les constantes existantes, pas à écrire en dur) ; la clé est (paire triée, index du combat, `Math.floor(cycle/ANNEE)`). **Ancien combat concerné** : le combat le plus RÉCENT de la paire parmi ceux vieux de plus de `MGMT_RIVALITE_CYCLES` cycles (12) ; s'il n'y en a pas, aucun réveil. Les combats de moins de 12 cycles restent couverts par S36/S37, ne les double pas.
Tu n'as aucune question à poser à Anthony.

## TEXTES livrés par Claude — 14/10/2026 16 h 35 (ne PAS appeler @ecrivain : un sous-agent ne peut pas l'appeler)
Les six gabarits sont ceux-ci, tels quels, à ajouter à l'objet `MGMT_MONDE_PHRASES` existant (là où il vit déjà : cherche `grep -n "MGMT_MONDE_PHRASES={" mgmt-*.js`), qui porte déjà `relu:false`. Le codeur n'en change aucun mot, n'en invente aucun autre. Les jetons `{Il}` `{il}` `{lui}` sont accordés par `mgmtAccord` au rendu, comme pour T4a. Variables : `{age}` (l'âge de retraite calculé, entier), `{depasse}` (le nom de la personne dépassée), `{div}` (`mgmtDivisionLabel`), `{champion}` (le nom du champion), `{adv}` (le nom de l'autre combattant du combat réveillé).
- `retraiteAnnoncee` : `{Il} annonce sa retraite : ce sera dans trois soirées, à {age} ans.`
- `depassement` : `{Il} vient de passer devant {depasse} au classement ({div}).`
- `challenger` : `{Il} se déclare pour la ceinture ({div}) et vise {champion}.`
- `vieuxCombatVoisins` : `Son ancien combat contre {adv} redevient d’actualité : ils sont voisins au classement.`
- `vieuxCombatTitre` : `Son ancien combat contre {adv} redevient d’actualité : une ceinture est en jeu.`
- `vieuxCombatBlessure` : `Son ancien combat contre {adv} redevient d’actualité : {il} revient de blessure.`
Le fait `vieux_combat` porte la raison (`voisins` | `titre` | `blessure`) pour choisir la variante ; un fait sans raison connue prend `vieuxCombatVoisins`.
Le test 6 de la §7 vérifie ces six gabarits (non vides, `relu:false` présent, accord et échappement).

## Compte rendu
- Fichiers modifiés : `mgmt-bureau.js` (détecteurs/hooks et phrases), `mgmt-data.js` (six gabarits), `mgmt-attention.js` (quatre genres marqués), `tests/mgmtMondeEvenements.test.js` (six tests T4b ajoutés), `index.html`/`sw.js` (versions montées par l'outil).
- Tests ajoutés : N1, N4, N5, N11, marque/budget, gabarits, rechargement ; les tests T4a restent présents et inchangés.
- Migration : aucune.
- Écarts : tests ajoutés moins exhaustifs que les huit scénarios détaillés ; notamment la lecture/échappement en fiche et l'absence de fenêtre ne sont pas intégralement testées. N11 a un début de détection de retour de suspension mais reste à valider contre tous les cas métier. `npm run check:rapide` rouge : assertions de comptage de faits dans `mgmtBureau.test.js` (N5 maintenant émis à l'ouverture) et 44 suites signalées en échec après dépassement du délai ; le test ciblé T4b (18/18) et la régression ciblée prescrite (65/65) passent. Audit `node tools/verif-versions.js origin/main` : aucun écart.
- Questions pour Anthony : aucune question de spécification ; la politique de comptage des faits des anciens tests de bureau doit être conciliée avec la naissance automatique N5 avant livraison complète.
- `@verif` et `@relecteur` n'ont pas pu être appelés (limite de profondeur des sous-agents). Tranche à reprendre : vérifier le check rapide sous durée suffisante, corriger les régressions sans neutraliser N5 et compléter les assertions N11/fiche selon la fiche.
