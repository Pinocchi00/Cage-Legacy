# Monde lot 3 T2 — La présentation du combattant

## 1. Branche
`monde-lot-3-presentation`, branche courante vérifiée. Piste B, étape 3 du plan ; le plan
ne donne pas de suffixe explicite pour ce lot : reprendre la branche acceptée de T1.
Dépendances : lots 1 et 2 fusionnés, T1 livrée et acceptée au §18 de sa fiche (83441e9).

## 2. Objectif
Composer une présentation textuelle publique, sourcée et déterministe de chaque combattant à partir de T1.
Fondement : « T2 — La présentation du combattant, bâtie sur ce tri. » (brief, ligne 189).
Cette tranche livre la brique de données et de phrases ; aucun écran ni entrée de navigation.

## 3. Ce qui existe
- `mgmt-presentation-faits.js:26-50` : `mgmtFaitsBase(contexte,id)` projette la population active
  et les bilans avant `h` ; `:136-140`, `mgmtFaitsCombattant({m,h?},id)` rend le tri public.
  Réutiliser ses faits sans recalculer leur rareté. Schéma : id, famille, groupe, valeur,
  sujets, sources, frequence, population, rarete (`:76-77`, `:21-24`).
- `:9-11` : ordre des familles ; `:78-127` : 13 familles individuelles réellement livrées.
  Garde/allonge absentes, conformément à la décision finale T1 §17 ; ne pas les réintroduire.
- Porte `mgmtObsAvant(m,id,h)` (`mgmt-soiree-show.js:141-147`) pour lire les combats passés.
  Ne pas appeler `mgmtObservation` : `:158-159` appelle `mgmtObsResume`, qui rejoue (`:128`).
- `mgmt-attention.js:173-187` : `mgmtCommentIlCombat` et `mgmtSaFaille` lisent le profil
  et ses attributs : interdits ici, même si `mgmt-ecran-fiche.js:209-215` les affiche aujourd'hui.
- Porte la fixture 30 de `tests/mgmtPresentationFaits.test.js:19-23,161-167` ; son ancien
  intitulé conserve « six ouvertures », mais ce quota n'est PAS testé par T1. T2 le teste enfin.
- Porte la reconstruction des sources du même test (`:58-135`) et sa fixture Split
  graine 20261008, quatre soirées (`:52-55`). Pas de six ans complets dans les tests ciblés.
- `tools/exporter-textes.js:15-40` découvre les fichiers JS portant `relu:false` et leurs
  constantes majuscules ; `mgmt-medias-data.js:29-35` porte le modèle `{texte,relu:false}`.
- `index.html:1177-1180` charge soirée-show puis faits ; harnais réel : `tests/helpers/loadGame.js`.
Recherche `@eclaireur` tentée, refusée (limite de profondeur) ; passages décisifs lus directement.

## 4. Ce qui change
- Nouveau `mgmt-presentation-combattant.js`, ancre `MGMT_PRESENTATION_COMBATTANT` (Monde lot 3 T2).
  Aucun DOM, HTML, accès à `G`, cache global, tirage nouveau ou état dérivé persistant.
- Nouveau `mgmt-presentation-data.js`, constante `MGMT_PRESENTATION_COMBATTANT_TEXTES` (§6).
- `index.html` : données puis compositeur immédiatement après faits, avant combat ; versions
  des scripts/cache par l'outillage `_bump.js`, `sw.js` seulement pour sa version de cache.
- Nouveau `tests/mgmtPresentationCombattant.test.js` ; `package.json` : ajouter ce fichier
  aux listes `test` et `test:watch`, sans exclusion dans `check:rapide`.
```js
/** Présentations de toute la catégorie active projetée, avec ouvertures coordonnées. Pur.
 * @param {{m:object,h?:number}} contexte Même frontière et projection que T1.
 * @param {string} divId Catégorie du roster de l'organisation.
 * @returns {Array<object>} Présentations triées par id ; catégorie absente : [].
 */
function mgmtPresentationsCategorie(contexte,divId)
/** Présentation individuelle identique à celle du lot collectif. Pur.
 * @param {{m:object,h?:number}} contexte Contexte explicite de T1.
 * @param {string} id Combattant actif à la frontière considérée.
 * @returns {object|null} Présentation ou null si absent/inactif.
 */
function mgmtPresentationCombattant(contexte,id)
```
Résultat exact : `{id,div,h,ouverture,faits,histoire}`. `ouverture` = famille du premier fait
ou null ; `faits` = au plus trois objets `{fait,texte,modele}` où `fait` conserve tout le
descripteur T1, `modele` identifie la proposition de texte. Texte brut, jamais HTML.
`h` reprend l'index borné par T1 ; appel individuel = chercher dans le résultat collectif.
`histoire` = au plus trois `{index,adversaire,texte,sources}` ; adversaire est un id ouvrable
par la future navigation, sources = `[{type:'hist',index}]`. Aucun nom ne devient un identifiant.
Sélection collective : ids croissants, candidats dans l'ordre T1, une capacité de SIX par
famille. Utiliser un appariement capacitaire par chemins augmentants déterministes : tenter
chaque candidat, déplacer si nécessaire les occupants (ids croissants), sans visiter deux fois
la même famille dans une recherche. Conserver le premier fait de la famille attribuée.
Après attribution, retenir l'ouverture puis le bilan (sauf déjà retenu), puis les faits les
plus rares de familles encore absentes jusqu'à trois. Ne jamais dupliquer une famille.
Sans attribution possible : ouverture null, faits vides ; histoire reste disponible.
Ne pas déguiser en ouverture un quatrième fait ni inventer une famille pour satisfaire le quota.
Histoire : combats présents dans les sources non projetées de `victoire_champion` d'abord,
puis les plus récents via `mgmtObsAvant`, sans doublon, tous strictement avant h.
Texte d'histoire factuel : adversaire, résultat W/L/D du sujet, méthode et round documentés ;
omettre un champ absent plutôt que le deviner. Nom adverse lu sur le côté de la trace.
Chaque variable de phrase vient de `fait.valeur` ou d'une source publique conservée ; les
moments utilisent le libellé existant de `mgmtVieMomentById`, pas une biographie inventée.
Substitution : moment → libellé, adversaire → nom sourcé, autres valeurs → chaîne publique ;
les clés restent celles de valeur, le descripteur original n'est jamais réécrit.
T2 n'ajoute pas de rubrique force/faille, presse ou monde sans source T1 : la méthode gagnante
reste un fait de bilan, pas une compétence cachée. Ces enrichissements ne bloquent pas la brique.

## 5. Sauvegarde
Non. `MGMT_SAVE_VERSION` reste 16 ; aucune migration, aucun changement de validation.
Les modèles de phrases sont des données de jeu, les présentations ne sont jamais sauvegardées.

## 6. Textes
Commande au codeur : `@ecrivain` — écrire dans `mgmt-presentation-data.js`, constante
`MGMT_PRESENTATION_COMBATTANT_TEXTES`, **16 propositions = 13 faits + 3 résultats d'histoire**.
Familles : age, rang, mouvement, serie, methode, attente, camp, role, bilan, ville,
metier, moment, victoire_champion ; résultats d'histoire : W/L/D.
Objet par clé : `{id,texte,situation,relu:false}`. Clés de faits = familles, histoire = W/L/D.
Variables des faits : exactement les clés de leur `valeur` T1 ; histoire : `{adversaire}`,
`{methode}`, `{round}` (les deux derniers valent chaîne vide si absents). Ne pas ajouter `{nom}`
pour rendre artificiellement les présentations différentes. Formulations épicènes sans pronom
masculin imposé, y compris champion et ancien métier ; fournir les libellés nécessaires sans
inventer une voix, un nom ou un événement. Lire LES-SIX-VOIX-v1.1 et SPLIT-CONTEXTE-DEPART.
Narration factuelle, pas dialogue de Leïla, pas pronostic ; réutiliser les libellés existants.
Le codeur ne rédige aucun texte de remplacement. Exporter ces 16 propositions pour relecture.

## 7. Écran
Aucun. Les planches validées du 10/10 sont réservées à l'intégration après T4 ; T5 fera les
entrées. Ne pas modifier la fiche à cinq onglets ni l'avant-combat, réservé à T3.

## 8. Tests
`tests/mgmtPresentationCombattant.test.js`, intitulés exacts et assertions :
- « Monde lot 3 T2 — trente textes distincts et six ouvertures au maximum » : porte la fixture
  30 T1 (graine explicite 'faits', 0 soirée) ; 30 présentations, 30 textes distincts après retrait
  des noms/ids, 30 ouvertures non nulles, chaque famille ≤6, chaque liste ≤3 ; bilan conservé.
- « Monde lot 3 T2 — appariement stable et manque de faits sans invention » : stub contrôlé
  du tri, 30 sujets avec seulement age : 6 ouvertures et 24 null ; ids a0 à a6, a0={age,bilan},
  a1 à a6={age} : déplacement attendu, a0 ouvre bilan, les six autres age, 0 ouverture null.
  Inverser le roster ne change ni l'ordre par id ni les présentations ; 0 soirée.
- « Monde lot 3 T2 — aucun niveau caché ni appel moteur » : porte les pièges T1 : getters niv,
  niveau, level, stats, phys, skills, trauma ; profil, génération et rejeu interdits : 0 lecture/appel.
- « Monde lot 3 T2 — chaque phrase retrouve sa source publique » : Split 20261008, 4 soirées ;
  reconstruire les valeurs de tous les faits retenus, retrouver chaque histoire/adversaire dans
  hist ; 0 source orpheline, 0 variable non remplacée, 0 moment privé ; ne pas tester les ids seuls.
- « Monde lot 3 T2 — frontière historique et rechargement déterministes » : même Split,
  h=0 puis moitié de hist puis longueur ; 0 histoire à h=0, aucun index d'histoire ≥h ;
  après sérialisation/validation, résultat identique ; deux appels sur entrées gelées, G.mgmt
  remplacé par une autre partie : mêmes résultats, SEED et sérialisation des entrées inchangées.
- « Monde lot 3 T2 — féminin et propositions exportables » : catégorie féminine, 0 soirée,
  modèles tous relu:false, 16 ids uniques ; aucune variable résiduelle, aucune flexion masculine
  imposée par les nouveaux modèles ; export temporaire retrouve les 16 textes et leurs ids.
Les tests de voix/pourcentages du brief appartiennent à T3, pas à T2 sans pronostic.

## 9. Vérification
`node --test tests/mgmtPresentationCombattant.test.js tests/mgmtPresentationFaits.test.js` puis
`npm run check:rapide` et `node tools/verif-versions.js`. Export avec `--out` dans le répertoire
temporaire pré-approuvé, ne pas commiter TEXTES-A-RELIRE.md. Pas de Monte Carlo.
Fin : 0 échec, 30 textes distincts, maximum 6 ouvertures, 0 lecture cachée/source orpheline.

## 10. Hors périmètre
Écrans, CSS, CL, navigation, pronostics, amendement de charte, booking, physique, moteur,
simulation du passé, économie, nouvelles familles T1, sauvegarde et réécriture des anciens textes.

## 11. Pièges
Noms/ids seuls ne prouvent pas la diversité. Un compteur au fil des appels rend le résultat
dépendant de la navigation : interdit. Le quota porte sur les ouvertures, pas sur les trois faits.
Sources hist de projection T1 peuvent être ≥h : elles sourcent un bilan AVANT, pas une histoire.
Ne pas appeler les lecteurs HTML de fiche ni les générateurs médias pour créer de fausses sources.
Les déclarations const globales ne sont pas window ; le harnais/export les lit par eval.

## 12. Décisions et questions
T2 est un compositeur sans écran : respecte la séparation T4/T5 sans inventer une mise en page.
Appariement plutôt que quota glouton : satisfait six quand les faits le permettent, sans hasard.
Bilan toujours retenu : distingue réellement la fixture 30 ; aucune garantie impossible sur une
population sans données distinctives, aucune phrase inventée pour contourner cette limite.
Rubriques sans source omises : respecte le brief « toujours différent » et l'interdiction du niveau.
Questions pour Anthony : aucune ; textes confiés à l'agent autorisé, relecture de fin de lot prévue.

## Compte rendu

- État : inachevé, arrêté avant implémentation le 13/10/2026. Branche vérifiée :
  `monde-lot-3-presentation` ; arbre de travail initial propre.
- Fichier modifié : cette fiche uniquement, pour consigner le blocage. Aucun code,
  modèle de phrase, script de cache ou fichier de test modifié.
- Tests ajoutés : aucun ; les six tests du §8 restent à réaliser.
- Migration de sauvegarde : aucune ; version inchangée.
- Blocage et essais : les appels à `@eclaireur`, `@ecrivain`, `@verif` et `@relecteur`
  sont tous refusés avec « Subagent depth limit reached (1) ». Le §6 et les règles
  du dépôt interdisent au codeur d'écrire les textes à la place de `@ecrivain`.
- Vérification de secours demandée : `node tools/verif-versions.js` indique aucun
  écart ; `npm run check:rapide` affiche VERT, 958 tests réussis, zéro échec
  (103 fichiers lancés, 12 écartés). Le terminal signale néanmoins un dépassement
  du délai de 120 secondes après avoir rendu ce bilan final.
- Relecture : aucun verdict, agent inaccessible. Ces vérifications portent sur
  l'état existant et ne valident pas une implémentation de T2.
- Écart à la fiche : tranche non implémentée, aucun critère de fin T2 revendiqué.
- Question pour Anthony : rendre `@ecrivain` accessible (augmenter la profondeur
  autorisée des sous-agents), puis reprendre cette tranche avec ses 16 propositions.
