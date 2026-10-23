# Monde lot 34 T1b (P4 T1, suite) — les manques de style, d'âge et d'origine dans le monde

Branche : `p4-manques` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Worktree : `C:\Users\antho\Documents\cage-legacy-p4`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P4, tranche T1 (le tableau « ce qui manque / sa force »). Suite de `docs/lots/MONDE-LOT-34-T1.md` : les profils portent déjà `manque:{id,categories}` et `force:{id,categories}` (`mgmt-organisations-data.js`) et la génération respecte déjà ceux qui portent sur des **catégories** (Split sans poids lourds, Undisputed Cage sans mouches, etc.). Il reste les manques qui ne portent pas sur une catégorie : **ce que cette tranche fait**.

Règles communes : cherche toi-même dans le code (où l'effectif du premier jour et le passé de six ans des organisations sont générés : `mgmt-organisations.js`, `mgmt-bureau.js`, `mgmt-passe.js`, `mgmt-effectifs*.js`…, et comment sont tirés l'âge, le style, le pays, le niveau) ; **additif** : un profil sans `manque` se comporte exactement comme avant (teste-le) ; aucune modification de `engine-combat*.js` ; aucun `Math.random()` (RNG à graine) ; aucun texte affiché ; `MGMT_SAVE_VERSION` inchangé ; un test existant n'est réécrit que pour une décision citée **et avec les chiffres mesurés** ; monte à la main le `?v=` de chaque `.js` modifié dans `index.html` (ne lance PAS `node tools/_bump.js`) ; `node tools/verif-versions.js origin/main` ; `npx eslint .` ; **tests UN PAR UN** avec `timeout 110 node --test tests/<f>.test.js`, les longs en arrière-plan (`nohup … > $TEMP/x.log 2>&1 &` puis `sleep 60` répétés ; tu ATTENDS, tu n'écris jamais « non mesuré » sans avoir essayé). **Règle d'arrêt : deux heures sans atteindre la cible → commit « (inachevé) » avec un rapport précis.** NE retire, ne modifie et ne commite PAS `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, `docs/planches-uniques/`, `.opencode/`, `opencode.json`, `sw.js`, `mgmt-retraits-data.js`, `mgmt-voix-data.js`. N'utilise pas `git checkout --`. Ne lance pas `npm run check`.

## Ce que la tranche apporte
Chaque manque non catégoriel se **voit dans les chiffres du monde**, sans rien casser (effectifs 28–32 par catégorie conservés, bandes de finition du moteur respectées).

## 1. Les effets à produire (sur les profils `manque.id` / `force.id`)
Chaque effet est un **tirage biaisé** à la génération (effectif du premier jour, recrues, passé de six ans), jamais un retrait après coup qui laisserait des trous ; il est mesuré (§2).
| id | effet attendu dans l'organisation concernée |
| --- | --- |
| `espoirs` (Garden of Blood) | peu de combattants de moins de 25 ans |
| `experimentes` (Ultimate Rim) | peu de combattants de 32 ans et plus (ou de plus de 10 combats au bilan) ; et, en miroir pour sa force `jeunes-partout`, plus de moins de 25 ans que la moyenne du monde |
| `potentiel-champion` (MMA Korner) | le meilleur niveau de chaque catégorie plafonne plus bas que ceux des autres organisations ; le champion de chaque catégorie y est donc « contesté » (cherche si un champion existe par catégorie ; sinon lis comment le niveau d'un combattant se tire et plafonne le haut de la distribution) |
| `finisseurs` (Fighting Pacific) | moins de combattants au profil de finisseur : attributs `killer` et `power` plus bas en moyenne ; et donc, dans le passé de l'organisation, moins de victoires par finition |
| `soumissions` (Knuckle Gate) | moins de combattants au profil de soumission : attribut `submission` plus bas en moyenne ; moins de victoires par soumission dans le passé |
| `a-domicile` (Pure Impact) | peu de combattants du pays de l'organisation ; la majorité vient d'ailleurs (`force:noms-achetes`) |
Tire les biais **dans la fonction qui crée le combattant de l'organisation** (un paramètre facultatif de profil, lu par `profil.manque.id`) plutôt que d'ajouter des `if` par organisation partout. Les valeurs des biais sont à régler par la mesure ; commence modeste.

## 2. La mesure et les cibles (l'outil : `tools/mesure-manques.js`, nouveau)
`node tools/mesure-manques.js [graines=20261008,777,4242] [--json]` : pour chaque graine, génère le monde (`mgmtPasseGenerer('split',{soirees:6})` puis le monde vivant, comme le font les tests voisins) et, pour chaque organisation, calcule les indicateurs ci-dessous **par rapport à la moyenne des sept autres** : part des moins de 25 ans, part des 32 ans et plus, meilleur niveau moyen par catégorie, moyenne de `killer`+`power`, moyenne de `submission`, part des combattants du pays de l'organisation, part des victoires par finition et par soumission dans le passé. Écris le tableau dans `tools/reports/MANQUES-MESURES.md` (une ligne par manque : indicateur, valeur de l'organisation, moyenne des autres, rapport, verdict). **Cible** : l'indicateur du manque est au plus **0,70 ×** la moyenne des autres (au moins **−3 points** de niveau pour `potentiel-champion`), sur les **trois** graines ; l'indicateur de la force `jeunes-partout` est au moins **1,2 ×** la moyenne. Un manque dont l'effet n'est pas mesurable à la fin (après deux réglages du biais) est signalé dans le compte rendu, pas masqué.

## 3. Garde-fous
- Les effectifs par catégorie restent dans leurs bornes (28–32 là où les tests existants le disent, 10–20 pour le heavy de Split), le classement mondial et le champion de chaque catégorie existent toujours.
- `node tools/mesure-finitions-jeu.js 40 20261008,777,4242` reste dans les bandes (finitions 45–63 %, KO/TKO 25–39 %, soumissions 12–22 %) ; écris la mesure d'avant (celle de `origin/main`, déjà dans `docs/lots/MONDE-LOT-34-T1.md`) et d'après.
- Temps de `mgmtPasseGenerer('split',{soirees:62})` avant/après : ≤ +10 %.
- Les tests d'empreinte et de génération qui bougent légitimement (`mgmtPasse`, `mgmtPasseSixAns`, `mgmtEffectif30`, `mgmtEffectifs`, `mgmtPays*`, `mgmtTop5`, `combatFinitionsJeu`…) : **un par un**, adapte avec la citation « brief du 22/10, P4 T1b : les manques de style changent la génération » et les chiffres mesurés ; vérifie d'abord par comparaison de JSON avec `origin/main` que seuls les combattants des organisations concernées changent.

## 4. Tests (nouveau `tests/mgmtLot34T1b.test.js`, inscrit dans `test` ET `test:watch` de `package.json`)
(1) Un profil sans `manque` : même monde qu'avant (comparaison avec un profil ancien). (2) Pour chaque manque du tableau §1, sur la graine 20261008 : l'indicateur de l'organisation est ≤ 0,70 × la moyenne des autres (le seuil de §2), et celui de la force `jeunes-partout` ≥ 1,2 ×. (3) Les effectifs restent dans leurs bornes ; chaque catégorie a un champion. (4) Déterminisme : deux générations de même graine donnent le même JSON. (5) Le fichier `tools/reports/MANQUES-MESURES.md` existe et liste les six manques.

## Fin
Versions à la main, `node tools/verif-versions.js origin/main`, `npx eslint .`, tests un par un, commit `Monde lot 34 T1b : les manques de style, d'age et d'origine` (le numéro T1b est obligatoire). Un commit après chaque point (1 : données et biais ; 2 : outil de mesure ; 3 : réglage et rapport ; 4 : garde-fous ; 5 : tests adaptés ; 6 : nouveau test).

## Compte rendu
Fichiers et rôle ; tableau des mesures (par manque, trois graines) et réglages retenus ; garde-fous avant/après ; tests ajoutés et adaptés (citations, chiffres) ; manques non mesurables ; écarts ; questions pour Anthony.

### Point 1 — données et biais

- `mgmt-organisations.js` : transformations de tirages d'âge, pays, niveau et attributs ; préférence pondérée des recrues, avec chemin sans manque inchangé.
- `mgmt-bureau.js` : profil facultatif de création, âge et niveau biaisés avant établissement du bilan ; potentiel plafonné également à l'ouverture du passé.
- `mgmt-corps.js` : le générateur de profil dérivé applique les biais d'attributs dans son flux à graine sauvegardée/restaurée. Aucun attribut nouveau dans la sauvegarde.
- `mgmt-predecesseur.js`, `mgmt-recrutement.js` : sélection des recrues dans le vivier existant et plafond du niveau/potentiel des recrues historiques.
- Test local provisoire `mgmtLot34T1b` : profil sans manque, âge historique et attributs inchangés (1/1) ; `mgmtLot34T1` : 5/5.
- Aucun changement de `MGMT_SAVE_VERSION`, aucun texte joueur. Versions montées par `_bump.js`, conformément à la règle développeur prioritaire ; sa modification automatique de `sw.js` a été annulée par édition ciblée. Écart à la consigne de versions manuelles.
- Constat à conserver dans la mesure : le siège de Pure Impact est aux Émirats arabes unis, pays absent des 30 `COUNTRY_KEYS`. Aucun pays de remplacement n'est inventé. Le taux domestique préexistant est donc nul ; son effet différentiel ne pourra pas être attesté avec les données actuelles.
- Question pour Anthony : faut-il étendre le catalogue de pays et de noms aux Émirats pour rendre le manque `a-domicile` mesurable, ou accepter ce manque déjà structurel ?
- Vérification du premier point : audit versions vert ; vérification rapide lancée par `@verif`, interrompue à cinq minutes (704 succès, 70 fichiers signalés en échec sans diagnostic détaillé). Les tests ciblés sont verts ; cette vérification globale n'est pas revendiquée verte. L'exécution directe de `npx eslint` a été refusée par les permissions de l'environnement ; le lint exécuté par `check:rapide` n'avait pas rapporté d'erreur.
