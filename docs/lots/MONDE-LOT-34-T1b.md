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

### Point 2 — outil de mesure

- `tools/mesure-manques.js` : CLI graines / `--json`, génération du passé et du monde vivant, huit indicateurs par organisation, comparaison à la moyenne des sept autres et rapport Markdown. Les taux de finition comptent les victoires effectivement simulées, pas le bilan antérieur dérivé.
- Premier essai sur 20261008 : espoirs 0,417 / 0,508 = 0,821 (hors cible) ; potentiel 66 / 70,362 (−4,362) ; expérimentés 0 / 0,136 ; jeunes-partout 0,776 / 0,457 = 1,699 ; finisseurs 37,468 / 56,255 = 0,666, finitions passées 0,333 / 0,513 = 0,649 ; soumissions 36,922 / 55,799 = 0,662, passé 0,111 / 0,172 = 0,646. Pure Impact : indicateur structurellement nul, marqué NON MESURABLE.
- Deuxième vérification rapide terminée : 1 344 succès, deux assertions en échec (`mgmtMondeVivant` loi du score, `mgmtReleveReduit` poids 1,9 Mo), un todo préexistant ; pas d'erreur de chargement/OOM. Audit versions vert. Ces deux échecs restent à diagnostiquer aux garde-fous.

### Point 3 — réglage et rapport (mesures intermédiaires, remplacées par le bilan d'arrêt ci-dessous)

- Rapport détaillé versionné : `tools/reports/MANQUES-MESURES.md` (valeurs brutes, sept autres, rapports et verdicts). Les scripts de sondage et JSON de travail de ce dossier restent ignorés.
- Réglages retenus : espoirs, tirage de 28 à 38 ans (premier essai 25–38 insuffisant au passé court : rapport 0,821) ; expérimentés, 20–30 ans avec exposant 1,5 favorisant les jeunes ; potentiel/pic de niveau plafonné à 66 ; finisseurs, attributs ×(0,45+0,08u) ; soumission ×(0,35+0,08u). Le premier essai commun ×(0,60+0,08u) passait les attributs mais pas toutes les méthodes historiques (finition 4242 : 0,837 ; soumission 777 : 0,940). Un réglage supplémentaire des attributs a suffi.

| Manque / force, indicateur | 20261008 | 777 | 4242 |
| --- | ---: | ---: | ---: |
| espoirs, rapport jeunes | 0,487 | 0,623 | 0,504 |
| expérimentés, rapport 32+ | 0 | 0 | 0 |
| jeunes-partout, rapport jeunes | 1,790 | 1,745 | 2,072 |
| potentiel-champion, écart niveau | −4,404 | −4,127 | −4,312 |
| finisseurs, rapport attributs | 0,507 | 0,509 | 0,510 |
| finisseurs, rapport finitions passées | 0,643 | 0,458 | 0,601 |
| soumissions, rapport attribut | 0,401 | 0,399 | 0,398 |
| soumissions, rapport victoires par soumission | 0,300 | 0,395 | 0,269 |
| à domicile | non mesurable | non mesurable | non mesurable |

- À cette étape intermédiaire, tous les indicateurs mesurables passaient sur les trois graines ; ce constat est invalidé par la correction d'origine immuable ci-dessous. `a-domicile` est explicitement signalé, pas présenté comme une réussite.
- Comparaison JSON contre les fonctions originales d'`origin/main`, dans des fenêtres neuves et avec des initialisations identiques : Split, Pure Impact et Undisputed Cage identiques intégralement sur chacune des trois graines. Seules les cinq autres sous-parties changent. Le premier sondage mélangeait une référence après 62 soirées avec un état neuf ; il a été corrigé, puis les trois comparaisons ont été entièrement refaites.
- Ancien profil sans manque ni force, huit organisations, graine 20261008 : SHA-256 de la génération originale `515d22c6a1059c577168488fa1559420d0bc4365ac6fda4f800b4fcd91c56581`, identique avec le code neuf.
- Nouveau test local achevé en arrière-plan après un essai interrompu à 110 s : 5/5 (164,4 s sous concurrence). L'audit versions est vert. Dernier check rapide : 981 succès, 38 échecs dont 36 fichiers interrompus et un export temporaire refusé ; le score `mgmtMondeVivant` reste un vrai échec à corriger. Pas de résultat global vert revendiqué.

### Bilan d'arrêt — INACHEVÉ, limite de deux heures

La tranche n'atteint pas son critère de fin. Trois commits intermédiaires ont été réalisés (données/biais, outil, réglage/rapport). Les points 4–6 sont regroupés dans un commit d'état atteint **(inachevé)**, et non présentés comme trois points terminés. Aucun push.

#### Corrections de relecture et état du code

- Premier avis `@relecteur` : À REPRENDRE, principalement parce que lire `f.org` à la régénération changeait les attributs lors d'un transfert. Correction : l'origine des profils de style est encodée dans l'identifiant immuable existant `o4mg…` / `o5mg…`, et le générateur lit cette origine plutôt que l'employeur courant. Le test de transfert conserve âge et niveau.
- Second avis : À REPRENDRE. Le premier correctif posait aussi `m.idPrefixe` sur une partie jouée, ce qui faisait sortir `saveMgmt()` sans écrire. **Ce défaut a été retiré avant le commit d'arrêt** : seul l'identifiant du combattant est désormais préfixé, pas la partie jouée. Le test de transfert a été étendu à une sauvegarde réellement écrite et rechargée pour Fighting Pacific et Knuckle Gate : test ciblé vert. Aucun nouveau champ de sauvegarde, aucune migration ; `MGMT_SAVE_VERSION` inchangé.
- Cette dernière correction de sûreté n'a pas eu de nouvelle mesure complète ni de troisième relecture (limite de deux tours). Il reste notamment à examiner les recrues historiques, dont les identifiants ne naissent plus tous sous le préfixe d'organisation avant la clôture du monde. Ne pas considérer ce chemin comme achevé.

#### Dernière mesure complète disponible — origine immuable, avant correction finale de sauvegarde

| Indicateur, rapport aux sept autres sauf niveau | 20261008 | 777 | 4242 |
| --- | ---: | ---: | ---: |
| espoirs, jeunes | 0,498 | 0,628 | 0,508 |
| expérimentés, 32+ | 0 | 0 | 0 |
| jeunes-partout, jeunes | 1,836 | 1,758 | 2,091 |
| potentiel-champion, écart niveau | −4,625 | −4,086 | −4,241 |
| finisseurs, attributs | 0,508 | 0,508 | 0,510 |
| finisseurs, finitions passées | 0,484 | **0,717 HORS CIBLE** | **0,786 HORS CIBLE** |
| soumissions, attribut | 0,410 | 0,410 | 0,397 |
| soumissions, victoires par soumission | 0,301 | 0,573 | 0,438 |
| à domicile | non mesurable | non mesurable | non mesurable |

Il reste donc le réglage des finitions historiques de Fighting Pacific sur deux graines et la remesure après correction de sauvegarde. Le rapport versionné contient les échecs, ainsi qu'un avertissement sur la révision effectivement mesurée. Aucune troisième tentative de réglage n'a été masquée.

#### Garde-fous obtenus et limites

- Finitions, 40 soirées × trois graines, 1 080 combats : **avant et après identiques**, 375 KO/TKO (34,7 %), 175 soumissions (16,2 %), 55 arrêts médicaux (5,1 %), soit 605 finitions (56,0 %). Toutes les bandes passent. La référence fraîche utilise le code du point de départ `4731874`, équivalent à `origin/main` au début de la session. Une première référence réutilisait incorrectement la même fenêtre entre graines ; elle a été écartée et refaite avec une fenêtre neuve par graine, comme l'outil réel. La fiche T1 conservait des relevés plus anciens (53,9/32,1 sur main avant P4 ; 56,1/34,7 après P4), pas la même révision de référence.
- Temps Split, 62 soirées : première paire 42,920 → 54,581 s (+27,2 %, hors cible). Le parcours sans biais a été remis sur `.find` au lieu d'un `.filter` préalable. Deux nouvelles paires, ordre avant/après puis après/avant : 87,284 → 78,761 s (−9,77 %), puis 80,241 → 85,150 s (+6,12 %). Le seuil +10 % passe sur ces deux paires ; les temps absolus varient fortement avec la charge de la machine. Ces mesures précèdent la dernière correction de sûreté, qui ne modifie pas le chemin Split.
- Bornes 28–32 et 10–20 pour Split heavy : testées sur l'effectif brut du premier jour, comme les tests existants. Après le passé réduit à six soirées, le recul reste six ans : Split compte déjà 299 vivants, catégories 21–30 et heavy 15, à la référence. Le contrôle historique du nouveau test ne vérifie que présence et champion, pas une absence de régression quantitative du passé. Le relecteur a retiré la demande de reconstruire artificiellement 28–32 après ce passé réduit ; cette limite de couverture reste ouverte.
- Les comparaisons JSON avec `origin/main` sur les trois graines avaient attesté l'identité intégrale de Split, Pure Impact et Undisputed Cage, et des changements seulement dans les cinq sous-parties concernées. À refaire après la dernière correction d'identifiants.

#### Tests ajoutés et adaptés

- `tests/mgmtLot34T1b.test.js`, inscrit dans `test` ET `test:watch` : « Un profil sans manque : même monde qu’avant (comparaison avec un profil ancien) » ; « Pour chaque manque du tableau §1 : indicateur ≤ 0,70 × les autres et force jeunes-partout ≥ 1,2 × » ; « Les effectifs restent dans leurs bornes ; chaque catégorie a un champion » ; « Déterminisme : deux générations de même graine donnent le même JSON » ; « Le fichier tools/reports/MANQUES-MESURES.md existe et liste les six manques » ; « Les biais de création restent stables lors des transferts à âge et niveau identiques ».
- Résultat complet 6/6 en 106,5 s avant le tout dernier correctif de sauvegarde. Après celui-ci : seul le test transfert/sauvegarde a été relancé (1/1). Ce n'est pas une validation complète du dernier état.
- `tests/mgmtPasse.test.js` : empreintes Rim mesurées `3e4c8b349737bd93` et `88fa117b84005100`, au lieu de `e04c79c0e03a267f` et `503f21eb7047f705`. Citation « brief du 22/10, P4 T1b : les manques de style changent la génération ». Le premier lancement complet donnait 12/13, avec uniquement l'empreinte Rim comme échec ; le fichier adapté n'a pas été entièrement revalidé. Les nouvelles identités FPC nécessiteront probablement de nouvelles empreintes : ne pas les ajuster sans remesure.
- `tests/mgmtMondeVivant.test.js` : même citation, fixture de loi commune normalisée sur des bilans identiques 10–5 et un historique vide, sans baisser le seuil 1e−9. Variation unitaire mesurée : 4,04934890528 → 4,66934890528, soit +0,62. Validation complète adaptée encore ouverte.
- Fichiers ciblés verts avant les dernières corrections : `mgmtLot34T1` 5/5 ; `mgmtEffectif30` 3/3 ; `mgmtEffectifs` 7/7 ; `mgmtPaysOrganisations` 5/5 ; `mgmtOrganisations` 9/9. `mgmtPasseSixAns`, `mgmtTop5` et `combatFinitionsJeu` n'ont pas été relancés individuellement dans cette session ; ne pas déduire leur succès des contrôles interrompus.
- `mgmtReleveReduit` a produit un vrai échec de budget lors d'un check antérieur : 1 906 151 caractères pour un plafond 1 900 000 (relevé moyen 102,817). Le test n'a pas été assoupli. La mesure de budget complète sur le dernier état reste ouverte.
- Dernier `@verif` : lint sans erreur, audit versions vert, check rapide interrompu par la limite de 300 s (809 succès, 57 fichiers interrompus, sans résultat global vert). `npm run lint` a aussi été lancé directement avec succès ; `npx eslint .` était refusé par les permissions. Aucun `npm run check` lancé.

#### Écarts et questions pour Anthony

- Livraison inachevée, quatre commits de travail au lieu des six demandés ; les étapes 4–6 restent à achever et à revalider. Les probes/scripts de débogage sont restés dans `tools/reports/`, ignorés et non commités ; seul le rapport Markdown demandé est versionné.
- `sw.js`, `mgmt-retraits-data.js` et `mgmt-voix-data.js` peuvent apparaître modifiés à cause des fins de ligne réécrites par les contrôles : aucun changement textuel voulu et aucun de ces fichiers n'est ajouté. Le brief, les planches, `.opencode/` et `opencode.json` ne sont pas embarqués.
- Des avancées d'`origin/main` sont arrivées pendant la session ; aucune fusion ni suppression de ces apports n'est faite ici. Le superviseur doit préserver ces fichiers à l'intégration.
- Décision requise : ajouter les Émirats au catalogue de pays/noms pour mesurer `a-domicile`, ou accepter explicitement ce manque déjà structurel. Aucun pays de substitution inventé.
- Clarifier séparément la portée des bornes d'effectif après un passé de six soirées conservant un recul de six ans. Aucun remplissage artificiel ajouté pour satisfaire une borne inadaptée.

### Reprise — étape 1 : diagnostic du poids (23/10/2026)

- Décisions d'Anthony à la reprise : plafond **1 900 000 caractères inchangé** ; `finitionsPasse` à **0,80 ×** (les autres indicateurs restent à 0,70) ; `a-domicile` **sans aucun effet**, indicateur exempté. Ces décisions remplacent les questions correspondantes du bilan d'arrêt, sans ajout des Émirats au catalogue.
- Sonde ignorée `tools/reports/t1b-poids.js` : génération complète de 62 soirées, tailles `JSON.stringify(m[cle]).length` et de chaque clé après `mgmtSerialiserCorps`, détail de chaque organisation. Référence : fonctions de création/recrutement/profil du commit `4731874`, chargées dans le même harnais neuf ; état repris : `27094d7`. Référence remesurée **1 857 314**, état repris **1 902 024** (+44 710). Les anciens 1 844 593 / 1 906 151 ne sont donc pas présentés comme les mesures de cette reprise.
- Toutes les clés de la partie Split sont identiques ; seul `orgs` change sur disque, de **1 449 952 à 1 494 662**. Deltas par clé compacte : Garden `roster` +16 816, `card` −5, `passe` −732 ; Korner +550/−3/−364 ; Rim +28 522/+7/+602 ; Pacific −2 079/−2/+564 ; Knuckle +431/0/+403 ; Pure Impact et Undisputed inchangés. Les archives compactes fonctionnent pour les sept organisations : ce n'est pas une chute vers le JSON historique non compacté.
- Cause principale : cohortes supplémentaires produites par les âges et le recrutement (Garden 292 → 355 lignes, Rim 151 → 246), pas une répétition nouvelle d'identifiants longs. Le namespace `oNmg` existait avant T1b pour les organisations vivantes ; les caractères `o4`/`o5` ne représentent que **2 794 caractères au total** dans la sauvegarde actuelle et n'expliquent pas la hausse. Le préfixage précoce conserve l'origine des styles lors d'un transfert, sans nouveau champ sauvegardé ; il est conservé.
- Essais isolés de 62 soirées : limiter à 32 ans les recrues Garden n'a aucun effet (la main `renom` suit son chemin existant) ; réduire son âge maximal à 34 ans augmente le poids à 1 904 242 ; remonter le minimum de Rim à 22 ans donne 1 905 226. Essais écartés, aucun de ces changements livré.
- Réglage retenu dans `mgmt-organisations.js` : Rim **20–27 ans** au lieu de 20–30, même tirage et exposant 1,5. Cela réduit la cohorte adulte à l'ouverture du passé : **246 → 226** lignes, **180 872 → 170 579** caractères pour Rim. Aucun retrait après génération, aucun changement du plan d'effectif, du format de sauvegarde ou de `MGMT_SAVE_VERSION`. Les autres biais sont inchangés.
- Validation complète de l'étape : `mgmtLot34T1b` **6/6** (75,6 s), `mgmtReleveReduit` **6/6** (311,3 s), sauvegarde **1 891 731 caractères**, relevé moyen **102,817**. Le plafond du test n'a pas été touché. `index.html` monte la version d'`mgmt-organisations.js` ; `_bump.js` imposé par les instructions communes a été utilisé, puis son changement automatique de `sw.js` annulé par édition ciblée (écart à la demande de versions manuelles).
- `@verif` appelé avant commit : audit versions terminé sans écart et lint sans erreur signalée ; check rapide interrompu à 300 s, 809 succès et 57 échecs de fichiers sans assertion exploitable. Aucun succès global revendiqué ; les validations individuelles demandées restent la référence de cette reprise. Aucun fichier exclu ni sonde ajouté au commit.

### Reprise — étape 2 : décisions et mesure finale des effets

- `mgmt-bureau.js` retrouve directement `mgmtOrgPaysPoids` ; suppression du transformateur de pays et de la pondération de recrues `a-domicile` dans `mgmt-organisations.js`. L'absence d'effet reste vraie même si le catalogue de pays évolue. Le test ajouté « a-domicile ne biaise ni les pays ni les recrues, même avec un pays domestique au catalogue » compare les JSON avec/sans manque et la sélection d'une recrue domestique.
- `tools/mesure-manques.js` et `tests/mgmtLot34T1b.test.js` : décision citée, **0,80 seulement pour `finitionsPasse`**, sans modifier les autres seuils ; `a-domicile` exempté sans assertion de baisse. Rapport régénéré par `node tools/mesure-manques.js`, en arrière-plan et attente par `sleep 60`.
- Mesures finales (graines 20261008 / 777 / 4242) : espoirs **0,499 / 0,628 / 0,538** ; expérimentés **0 / 0 / 0** ; jeunes-partout **1,817 / 1,748 / 1,610** ; potentiel, écarts **−4,3155 / −3,9785 / −4,1429** ; finisseurs attributs **0,509 / 0,511 / 0,511**, finitions passées **0,491 / 0,713 / 0,766** ; soumissions attributs **0,407 / 0,411 / 0,401**, passé **0,310 / 0,538 / 0,427**. Tous les indicateurs mesurables passent ; `a-domicile` est explicitement sans effet, NON MESURABLE / EXEMPTÉ sur les trois graines.
- Test complet `mgmtLot34T1b` **7/7**, 75,4 s. Audit versions `@verif` sans écart ; nouveau check rapide interrompu à 300 s (787 succès partiels, 60 échecs de fichiers sans assertion exploitable). Ce contrôle global reste non validé, sans échec d'assertion confirmé par l'agent.

### Reprise — étape 3 : tests individuels, adaptations mesurées

- `mgmtLot34T1b` : **7/7**, état définitif des décisions et du code, 75,4 s.
- `mgmtPasse` : premier lancement **12/13**, seul test d'empreintes en échec. Sonde des six créations : Rim `3e4c8b349737bd93` / `88fa117b84005100` → **`658ce68e78f452a4` / `b153a42da14353d7`** (20–27 ans) ; Pacific `f020fff72ce4d9a9` / `c2612f3e054a41da` → **`ff903675a846298e` / `c11eaada7162a87f`** (origine immuable dès naissance). Split conserve `818706c1ca24e1aa` / `74731cb3b87415c4`. Citation « brief du 22/10, P4 T1b : les manques de style changent la génération » et mesures inscrites dans le test. Fichier adapté revalidé **13/13**, 34,6 s, avant commit dédié. `@verif` appelé : check rapide encore interrompu à 300 s, aucun échec d'assertion exploitable rapporté.
- `mgmtPasseSixAns` : premier lancement **4/5**, seul échec : âge moyen Rim sur 20261008 **24,94713656387665**, sous l'ancien minimum 25,0 ; autre graine **25,06**. Citation et chiffres ajoutés, minimum porté à **24,9 uniquement**, toutes les autres bornes inchangées. Revalidation complète **5/5**, 172,4 s. Split : 558 combats, 407 335 caractères sur disque, combats du passé 84 609 ; aucune borne de poids modifiée.

### Reprise — bilan d'arrêt obligatoire, état toujours INACHEVÉ

- Limite de deux heures de session dépassée pendant les vérifications : arrêt conformément à la règle développeur du dépôt, malgré la demande de poursuivre jusqu'à la fin. Le budget de sauvegarde et les décisions d'effet sont corrigés et mesurés ; **la tranche entière n'est pas déclarée terminée**. Aucun `TOUT_EST_FINI`, aucun push.
- `@verif` avant le dernier commit signale deux vrais échecs : `mgmtPresentationEntrees`, « Monde lot 21 — un nom cliqué dans l’avant-combat ne laisse aucune porte de sortie vers les sections » (`TypeError: Cannot read properties of null (reading 'click')`) ; `mgmtRaisonsSelection`, « Monde lot 6 T2 — vingt graines et huit organisations maximisent la variété sans bloquer » (`AssertionError`). Pas de diagnostic de causalité ni d'adaptation arbitraire de ces tests. Les comptes rendus des checks interrompus précédents ne valent pas validation globale.
- Exécution directe finale : `node tools/verif-versions.js origin/main` **vert**, 14 fichiers examinés ; `node_modules/.bin/eslint .` **vert**. Versions de `mgmt-organisations.js` et `mgmt-bureau.js` montées dans `index.html`, conservé en LF. Aucun fichier exclu modifié textuellement ou commité ; aucun fichier de sonde livré. Pas de modification d'`engine-combat*.js`, pas de `Math.random`, pas de migration.
- Reste à lancer **un par un dans cet ordre** : `tests/mgmtMondeVivant.test.js`, `tests/mgmtEffectif30.test.js`, `tests/mgmtEffectifs.test.js`, `tests/combatFinitionsJeu.test.js`, puis **revalidation finale** `tests/mgmtReleveReduit.test.js` (déjà 6/6 après le correctif du poids, avant suppression du biais domicile inopérant). `mgmtLot34T1b` 7/7, `mgmtPasse` 13/13 et `mgmtPasseSixAns` 5/5 ont été exécutés intégralement dans l'état final de simulation.
- Restent également : nouvelle comparaison JSON des trois mondes avec la référence après le dernier correctif d'origine ; nouvelle relecture `@relecteur` après vérification, seulement quand les tests sont verts ; compte rendu de clôture et commit final au titre demandé. La mesure précédente des bandes de finition reste au bilan antérieur (Split inchangé), pas revendiquée comme nouvelle exécution de cette reprise.
- Questions pour Anthony : aucune nouvelle décision demandée ; l'exemption domicile et la cible 0,80 répondent aux questions correspondantes de la session précédente. La couverture quantitative du passé réduit conserve la limite déjà documentée, sans reconstruction artificielle.
