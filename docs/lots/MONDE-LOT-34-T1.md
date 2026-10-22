# Monde lot 34 T1 (P4 T1 du brief « Des combattants uniques ») — ce qui manque à chaque organisation : les données et les catégories

Branche : `p4-manques` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). Worktree : `C:\Users\antho\Documents\cage-legacy-p4`. Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P4, tranche T1 et son tableau (validé par Anthony le 22/10). Numérotation Monde : P1 = lot 31, P2 = 32, P3 = 33, P4 = 34.

Règles communes : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification de `engine-combat*.js` ; un test existant n'est réécrit que pour une décision citée (ici : « brief du 22/10, P4 : le tableau de ce qui manque à chaque organisation ») ; `node tools/_bump.js` sur chaque `.js` modifié, puis **vérifie à la main que `index.html` porte le nouveau `?v=` de chaque fichier modifié** ; `node tools/verif-versions.js origin/main` ; `MGMT_SAVE_VERSION` ne change pas ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge, commite avec « (inachevé) » et décris le blocage. **Règle d'arrêt : deux heures sans atteindre la cible, tu commites l'état, tu fais un rapport, aucune sonde de débogage commitée.** Tu ne rends « inachevé » qu'après avoir réellement essayé.

## Ce que la tranche apporte
Chaque organisation a un **manque** et une **force** écrits dans ses données, et la génération du monde (effectif du premier jour, niveaux, passé de six ans) les respecte quand ils portent sur des catégories. Aucun écran dans cette tranche (le texte « Ce qui manque à Split » est la tranche T2, avec sa planche). Les manques qui portent sur un style, un âge ou une origine (finisseurs, soumissions, expérimentés, espoirs, domicile, potentiel champion) sont **écrits dans les données, sans effet encore** : une tranche T1b leur donnera leur effet. Ne les implémente pas ici.

## 1. Les données (`mgmt-organisations-data.js`)
Ajoute à chaque `profil` deux clés **nouvelles** (les clés existantes `fortes`/`faibles` ne bougent pas, pour que le texte affiché des atouts et `tests/mgmtAttributionProfils.test.js` restent exacts) :
- `manque:{id, categories:[...]}` ; `force:{id, categories:[...]}` (`categories` vide quand le manque ou la force n'est pas une catégorie). Les identifiants de catégorie sont ceux du fichier (`'H-heavy'`, `'H-fly'`…).

| Organisation | `manque` | `force` |
| --- | --- | --- |
| Split | `{id:'bons-poids-lourds', categories:['H-heavy']}` | `{id:'equilibree', categories:[]}` |
| Garden of Blood | `{id:'espoirs', categories:[]}` | `{id:'vedettes', categories:[]}` |
| MMA Korner | `{id:'potentiel-champion', categories:[]}` | `{id:'legers-et-coqs', categories:['H-light','H-bantam']}` |
| Ultimate Rim | `{id:'experimentes', categories:[]}` | `{id:'jeunes-partout', categories:[]}` |
| Fighting Pacific Championship | `{id:'finisseurs', categories:[]}` | `{id:'mouches-et-coqs', categories:['H-fly','H-bantam']}` |
| Knuckle Gate | `{id:'soumissions', categories:[]}` | `{id:'meilleures-combattantes', categories:[]}` |
| Pure Impact | `{id:'a-domicile', categories:[]}` | `{id:'noms-achetes', categories:[]}` |
| Undisputed Cage | `{id:'bons-mouches', categories:['H-fly']}` | `{id:'lourds', categories:['H-heavy','H-lheavy']}` |

## 2. La génération (`mgmt-organisations.js`, `mgmt-bureau.js`)
`mgmtOrgPoidsCategorie(profil,divId)` et `mgmtOrgDecalageNiveau(profil,divId)` (`mgmt-organisations.js` ~lignes 38-49) lisent aussi `profil.force.categories` (poids ×1,5 et niveau +3, comme `fortes`) et `profil.manque.categories` (poids ×0,5 et niveau −3, comme `faibles`). Un profil ancien sans ces clés se comporte exactement comme avant (teste-le). Les catégories de `fortes`/`faibles` et celles de `force`/`manque` ne se cumulent pas sur une même catégorie (une catégorie dans les deux listes ne compte qu'une fois : prends le cas le plus marqué). Le passé de six ans et le monde vivant passent par ces deux fonctions : vérifie par une mesure que Split a **nettement moins de poids lourds, et plus faibles, que dans les autres catégories** au premier jour, et que le champion de cette catégorie est le moins bien classé des champions de Split (écris la mesure dans le compte rendu : effectif moyen par catégorie, niveau moyen du top 3 par catégorie, sur 3 graines).

## Tests (nouveau `tests/mgmtLot34T1.test.js`, à inscrire dans `test` ET `test:watch` de `package.json`)
(1) Les huit profils portent `manque` et `force` exactement comme le tableau ci-dessus ; les identifiants sont uniques par organisation ; toute catégorie citée existe. (2) Les deux fonctions de poids et de niveau donnent ×1,5/+3 sur une catégorie de `force`, ×0,5/−3 sur une de `manque`, et se comportent comme avant sur un profil sans ces clés. (3) Split : au premier jour, l'effectif des poids lourds est inférieur à la moitié de la moyenne des autres catégories hommes (±), sur 3 graines (`setSeed`). (4) Undisputed Cage : ses poids mouche sont dégarnis, ses lourds fournis (même mesure). (5) Une autre partie (Garden of Blood, 3 graines) a des effectifs inchangés par catégorie par rapport à `origin/main` pour les catégories sans `force`/`manque` (sinon la tranche a trop bougé). Les tests existants qui figent les effectifs ou le passé de Split (`mgmtEffectif30`, `mgmtPasseSixAns`, `mgmtPasse`, `mgmtCartePremierJour` et ceux que les échecs désignent) peuvent bouger : adapte leurs bornes **en citant la décision du 22/10** et dis lesquelles dans le compte rendu ; n'élargis jamais une borne sans la mesure.

## Fin
`node tools/_bump.js` sur chaque `.js` touché, vérifie `index.html`, `node tools/verif-versions.js origin/main`, lance chaque test touché un par un (le nouveau, `mgmtOrganisations`, `mgmtAttributionProfils`, `mgmtEffectif30`, `mgmtPasse`, `mgmtPasseSixAns` — ce dernier est long, une seule fois), commit `Monde lot 34 T1 : ce qui manque à chaque organisation` (le numéro T1 est obligatoire). Ne lance PAS `npm run check` en entier : le superviseur le fait.

## Compte rendu
Fichiers modifiés : `mgmt-organisations-data.js` porte les deux nouvelles clés de profil ; `mgmt-organisations.js` fait lire les catégories par les deux fonctions ; `index.html` porte les versions montées ; `tests/mgmtLot34T1.test.js` teste les profils et les modificateurs ; cette fiche.
Tests ajoutés : « Monde lot 34 T1 — les profils portent leurs manques et forces catégoriels » ; « Monde lot 34 T1 — poids et niveaux lisent les catégories et gardent les anciens profils ».
Tests existants adaptés : aucun. Mesures de génération : non réalisées. Écart : le test `mgmtOrganisations` échoue sur l'effectif mince ; les mesures et contrôles demandés restent à faire. Le nouveau test n'est pas inscrit dans `package.json`.
Questions pour Anthony : aucune question de spécification identifiée. État inachevé : impossible de terminer et de vérifier la tranche dans la session ; vérification ciblée `mgmtLot34T1` verte (2/2), mais `mgmtOrganisations` rouge (1 échec / 9) ; vérification de versions sans écart.
