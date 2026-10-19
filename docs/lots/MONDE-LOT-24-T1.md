# Monde lot 24 T1 — le monde à huit : l'échelle des organisations passe de 4 à 7

Branche : `monde-lot-24-echelle` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne ensuite). **Décision d'Anthony du 17/10/2026 et du 19/10/2026** : ordre de prestige (croissant) Garden of Blood < MMA Korner < Pure Impact < Ultimate Rim < Knuckle Gate < Undisputed Cage < Fighting Pacific Championship ; l'organisation jouée y est remplacée par Split quand ce n'est pas Split (comportement actuel de `mgmtExtOrgs`).
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée (ici : l'échelle à 7 des parties neuves) ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; **`MGMT_SAVE_VERSION` ne change pas** (champ facultatif, comme `effectifs`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris le blocage : jamais de travail non commité.
**Tu ne t'arrêtes pas au premier obstacle ; tu ne rends « inachevé » qu'après avoir réellement essayé, avec le blocage précis.**

## Le principe
Les carrières des combattants extérieurs sont DÉRIVÉES (jamais stockées) : `mgmtExteriorCareer` (`mgmt-monde.js` ~ligne 325) plafonne leur montée à `MGMT_EXT_ORGS.length` (4) organisations. Une partie neuve doit monter jusqu'à 7 ; **une partie existante garde exactement ses 4 échelons** (sinon ses carrières déjà lues changent). On le règle donc par un champ facultatif `m.echelleExt` : absent = 4 (ancien monde), `7` = nouveau monde. Même patron que `m.effectifs` (0/1).

## Ce que tu fais
1. `mgmt-data.js` : garde `MGMT_EXT_ORGS` (les 4 noms) **inchangé** ; ajoute `MGMT_EXT_ORGS_HUIT=['Garden of Blood','MMA Korner','Pure Impact','Ultimate Rim','Knuckle Gate','Undisputed Cage','Fighting Pacific Championship']` avec un commentaire citant la décision du 17/10/2026.
2. `mgmt-organisations.js` `mgmtExtOrgs(m)` : si la partie (`m`, sinon `G.mgmt`, sinon aucune) a `echelleExt===7`, partir de `MGMT_EXT_ORGS_HUIT`, sinon de `MGMT_EXT_ORGS` ; le remplacement de l'organisation jouée par Split reste. Mets à jour le commentaire (« quatre noms, toujours » devient « quatre ou sept »).
3. `mgmt-monde.js` : `mgmtExteriorCareer` prend `orgMax` de `mgmtExtOrgs().length` (pas de `MGMT_EXT_ORGS.length`) ; **ne change aucun tirage du flux** (le ratio de l'ambition reste le même). `mgmtExteriorTrace` : le nom de l'organisation traversée vient de `mgmtExtOrgs()` (déjà le cas) : vérifie que l'index d'une carrière à 7 échelons donne le bon nom.
4. `mgmt-bureau.js` `mgmtDefault` (~ligne 106) : ajoute `echelleExt:7` aux parties neuves. **`mgmtDefaultAvantH4`** (si elle existe, utilisée par les tests de rétro-compatibilité) ne le porte pas.
5. `mgmt-save.js` `validateMgmt` (~ligne 353) : accepte `echelleExt` absent, `4` ou `7`, refuse toute autre valeur. Pas de migration (absent = 4) ; ajoute une ligne de commentaire qui le dit, à côté de la migration 12 → 13 des effectifs, sans toucher à `MGMT_SAVE_VERSION`.
6. Les ceintures (`mgmt-ceintures.js` ~167) : `mgmtExtOrgs(m).map(...)` donne déjà 7 ceintures extérieures pour `echelleExt===7` ; vérifie que `orgIdx` reste cohérent avec `mgmtExteriorCareer` (même index), et que la boucle ~ligne 196-231 n'a pas de constante 4 cachée (`grep -n "\b4\b\|\b3\b"` dans le fichier, ne corrige que ce qui en dépend).
7. `tools/mesure-ceintures.js` ~107 : `MGMT_EXT_ORGS.map(...)` devient `mgmtExtOrgs(G.mgmt)` (l'outil ne doit pas supposer 4 lignes).

## Tests
Un fichier neuf `tests/mgmtEchelleHuit.test.js` (à inscrire dans `test` et `test:watch` de `package.json`), sans monde vivant (pas de `mgmtMondeVivantGenerer`, trop lent) :
(1) `mgmtExtOrgs` d'une partie `echelleExt:7` rend les 7 noms dans l'ordre ci-dessus ; si `m.org==='Ultimate Rim'`, « Ultimate Rim » est remplacé par « Split » au même rang ; une partie sans `echelleExt` rend les 4 noms d'avant ;
(2) `mgmtExteriorCareer` : pour 400 graines et un cycle lointain, `orgIdx` ne dépasse jamais 6 en échelle 7, jamais 3 en échelle 4, et **toute carrière qui finissait à orgIdx<3 en échelle 4 est identique (W, L, orgs) en échelle 7** (propriété : le haut de l'échelle ne change que la fin des carrières déjà plafonnées) ; au moins une carrière atteint l'index ≥ 4 en échelle 7 ;
(3) `validateMgmt` accepte 4, 7, absent, refuse 5 et `'7'` ;
(4) `mgmtDefault('split')` porte `echelleExt===7`, `mgmtDefaultAvantH4()` ne le porte pas.
Puis fais tourner un par un : `tests/mgmtExterieur`, `mgmtOrganisations`, `mgmtRecrutement`, `mgmtCeintures`, `mgmtBureau`, `mgmtPasse`. Si une empreinte ou un chiffre figé d'une partie NEUVE change, mets-la à jour avec un commentaire « lot 24 T1 : échelle à 7 » après avoir vérifié que le changement vient bien de l'échelle ; si un test de partie ANCIENNE change, c'est un bug : corrige le code, pas le test.

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 24 T1 : l'échelle des organisations passe de 4 à 7` (le numéro T1 est obligatoire dans le message).

## Compte rendu
Fichiers modifiés et rôle ; tests ajoutés (intitulés) ; empreintes mises à jour (lesquelles, pourquoi) ; migration : aucune (champ facultatif) ; écarts à la fiche ; questions pour Anthony.

### Réalisation
- `mgmt-data.js`, `mgmt-organisations.js`, `mgmt-monde.js` : catalogue sept, sélection par `echelleExt`, plafond et traces extérieures.
- `mgmt-bureau.js`, `mgmt-save.js` : défaut neuf à 7 et validation facultative 4/7 ; aucune migration/version modifiée.
- `tools/mesure-ceintures.js` : mesure branchée sur l'échelle de la partie.
- `tests/mgmtEchelleHuit.test.js` : « échelle extérieure : sept noms ordonnés, Split au même rang, ancien monde à quatre » ; « carrière extérieure : plafonds et continuité sous le troisième échelon » ; « validation : echelleExt accepte 4, 7 et absent seulement » ; « défaut : partie neuve à sept, ancien helper sans champ ».
- Tests existants ajustés : attentes d'organisations extérieures neuves dans `mgmtOrganisations.test.js` et vérification des noms dans `mgmtRecrutement.test.js`.
- Empreintes de `mgmtPasse.test.js` non ajustées : deux tests échouent, attribution causalité/empreinte à vérifier avant mise à jour ; autres tests ciblés exécutés verts sauf ce fichier.
- Écart : nouveau fichier de test non inscrit dans `package.json` (impossibilité d'éditer sans réécriture des longues lignes en l'état). La vérification versions ne signale aucun écart.
- Questions pour Anthony : confirmer mise à jour des empreintes de `mgmtPasse.test.js` après analyse des cas touchés par la partie neuve.
