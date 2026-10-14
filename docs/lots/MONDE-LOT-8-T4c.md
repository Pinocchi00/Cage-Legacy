STOP

# Monde lot 8 T4c — N2, changement de catégorie

## Branche
`monde-lot-8-suite` (branche courante vérifiée). Prérequis hérités : T1, T6,
T4a et T4b présents. Cette fiche est bloquée par les décisions listées en §11 ;
ne pas coder avant leurs réponses.

## Objectif
Ajouter au monde le changement de catégorie de poids (N2), prérequis aux
scénarios de montée et de descente acceptés par Anthony.

Fondement du brief (Lot 8) : « Un combattant change de catégorie de poids. »
Le brief précise : « Mais la catégorie d'un combattant ne change jamais dans
le jeu : elle est fixée à sa création. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`,
§ Lot 8, N2).

## Ce qui existe
- `mgmt-humanite-data.js:280-281` : moments de vie `monte-categorie` et
  `descend-categorie`, contextuels, jamais déclenchés. Le catalogue fournit
  donc des identifiants de moments, pas une règle de changement.
- `mgmt-vie.js` : `MGMT_VIE_CONTEXTUELS` identifie ces moments comme non tirés
  aléatoirement. Réutiliser la mécanique de moments existante seulement si la
  réponse d'Anthony confirme qu'il s'agit du texte voulu.
- `mgmt-bureau.js:694-711` : `mgmtMondeTop15` émet les faits N3 ; ses faits
  sont datés, idempotents et rattachés au roster. C'est un modèle pour les
  événements, pas une implémentation du transfert de catégorie.
- `mgmt-bureau.js:918+` : `mgmtMondePhrase` traduit les faits Monde. Les genres
  reconnus par la marque sont dans `MGMT_MARQUE_FAITS` (`mgmt-attention.js`).
- `mgmt-corps.js:121-143` : `mgmtAgingWear` dépend de `f.div` et l'identité
  déterministe. La catégorie impacte donc l'évolution calculée.
- `mgmt-ceintures.js`, `mgmt-suivi.js`, `mgmt-carte.js`, `mgmt-agenda.js` et
  les écrans Classements/Effectif/Contrats/Ceintures lisent `f.div` pour
  filtrage, éligibilité, rangs et titres. Sa mutation a des effets transverses.
- `docs/lots/MONDE-LOT-8-DECISIONS.md:22-23,38-43` accepte N2 comme gros
  événement T4c et les scénarios 12/13, mais ne spécifie pas le mécanisme.
- Pas de fiche T4c ni de rapport de tranche antérieur trouvé.

## Ce qui change
À définir après arbitrage : fichiers et signatures. Ne pas inventer de
fonction, de mutation de `f.div`, de règle de disponibilité, ni de dialogue.
Le périmètre attendu est N2 ; les scénarios 12/13 ne sont pas automatiquement
inclus dans la tranche, leur articulation doit être confirmée.

## Sauvegarde
Indéterminé. Le changement envisagé touche potentiellement un champ de roster
déjà sauvegardé (`div`), mais la règle d'historique et de migration n'est pas
spécifiée. Ne pas modifier `MGMT_SAVE_VERSION` avant arbitrage.

## Textes
Indéterminé. Les deux entrées de catalogue existent (`relu:false`), mais on ne
sait pas si elles sont le texte exact à produire, ni s'il faut des gabarits
supplémentaires. Aucune commande à `@ecrivain` avant réponse.

## Écran
Aucun écran ne peut être spécifié. La mutation peut affecter plusieurs menus ;
si une interaction nouvelle est demandée, la tranche s'arrête jusqu'à planche
validée.

## Tests
À écrire après décisions. Le minimum issu du brief à traduire en assertions
sera : un changement vers une catégorie adjacente produit l'événement
correspondant ; le nouvel état est cohérent dans chaque lecteur concerné ;
aucun événement ne naît sans changement effectif. Les conditions, graines,
durées et valeurs attendues restent à définir : ne pas transformer ces
propositions en tests arbitraires.

## Vérification
Commande ciblée à fixer avec les tests après arbitrage, puis `npm run
check:rapide`. Critère de fin chiffré à définir avec la règle de transition et
les tests (aucun seuil de durée ou de volume n'est donné pour N2).

## Hors périmètre
N9 (lot 9), scénarios T5 sauf inclusion explicitement décidée, T7/T8 ; aucun
changement d'organisation, de contrat, de calendrier de soirée, de niveau de
combat ou de données des combattants extérieurs sans décision explicite.

## Pièges
- `f.div` est consommé dans de nombreux systèmes ; changer seulement le champ
  peut laisser incohérents rangs, titre, carte, contrat ou cache.
- `mgmtAgingWear` utilise `f.div` pour déterminer le profil d'usure : une
  mutation peut modifier le résultat régénéré à âge égal.
- Les événements Monde passent par des faits datés/idempotents et la marque
  exige un genre reconnu et un identifiant roster ; ne pas créer un simple
  changement d'état sans définir son fait.
- Les moments de catégorie sont contextuels : ne pas les déclencher via le
  tirage générique de moments.
- Aucun RNG non déterministe (`Math.random`) dans la simulation.

## Questions pour Anthony
1. Qui ou quoi décide le changement : décision directe du joueur, scénario
   12/13, évolution automatique, ou combinaison ? À quel moment de la partie ?
2. Quelles catégories sont accessibles depuis chacune, et une transition
   signifie-t-elle exactement une catégorie adjacente ? Les catégories de sexe
   différent sont-elles totalement interdites ?
3. Quelles conditions ouvrent la montée et la descente (âge, série de résultats,
   santé, coupe de poids), et quelles conditions peuvent les empêcher ? Quels
   effets mécaniques sont voulus ?
4. Le combattant conserve-t-il historique, contrat, rang, ceinture et calendrier
   de combats ? Que deviennent classement et ceinture dans l'ancienne catégorie ?
5. N2 exige-t-il un fait daté `monte-categorie`/`descend-categorie` allumant la
   marque T1 et compté par le budget T6 ? Quel menu de naissance, conformément
   au tableau du brief, et quelle lecture dans la fiche ?
6. Les textes catalogue existants sont-ils à réutiliser tels quels, ou faut-il
   demander des gabarits `relu:false` à `@ecrivain` ?
7. T4c code-t-elle seulement N2, ou également les suites 12/13 acceptées dans
   `MONDE-LOT-8-DECISIONS.md` ? Si elles sont incluses, quelles étapes et issues
   exigent-elles précisément ?
8. Une interaction nouvelle est-elle attendue ? Si oui, fournir/valider sa
   planche avant de lancer le codeur.
