
# Monde lot 6 T3 — La raison enregistrée

## 1. Branche
`monde-lot-6-raisons`, branche courante et attendue confirmée par T1 §13.1 ; le plan ne donne pas son nom explicitement.
Dépendances : lot 1 fusionné ; T1 reprise (`8467100`) ; T2 acceptée et précisée (`2aeae8e`).
Cette fiche est bloquée : ne pas lancer le codeur avant réponses et révision des contrats concernés.

## 2. Objectif
Conserver la preuve effectivement choisie avec chaque combat proposé, puis dans la carte et la sauvegarde, sans lui substituer une justification recalculée.
Fondement : « T3 — La raison enregistrée avec chaque combat proposé. Le format de la pile change : migration et validation. »
Et : « La raison est enregistrée avec le combat : ce que le joueur lit est la vraie cause du choix. »

## 3. Ce qui existe
- `mgmt-raisons.js:70-135`, `mgmtRaisonsLire(m,fs,lectures)` : porte les preuves `{famille,fait}` de T1 ; quinze identifiants livrés, retour de blessure omis. Aucun texte.
- `mgmt-raisons.js:38-62`, lecture groupée : copie locale, index par paire canonique, restauration du mémo des rôles. Porte ce modèle pour éviter un index par famille.
- `mgmt-carte.js:195-199`, picker : rend déjà `raison` quand une famille est demandée ; voie sans famille conservée pour compatibilité.
- `mgmt-carte.js:215-251`, `mgmtBulkSelection(m,used,seen,n,stats,relaxed)` : choisit une cause avant la paire, mais compte les familles du bloc neuf seulement.
- `mgmt-carte.js:270-294`, `mgmtNewBulkAffair` : jette la cause à :286 ; combat enregistré `{a,b,slot,sloppy,warned}`. Appelé par bureau :460 et `mgmtOfferBulk` :776.
- `mgmt-carte.js:301-333`, `mgmtSwapFight` : picker sans famille à :319, nouvelle paire sans cause ; réaction et fait portent les combattants retirés.
- `mgmt-carte.js:337-349`, `mgmtBulkRemplacer` : changement manuel de A ou B, sans sélection de famille ni trace ; une ancienne cause deviendrait fausse.
- `mgmt-carte.js:352-363`, `mgmtBulkMonter` : appelle `mgmtBookMain` puis retire la proposition ; `mgmtBookMain` :399-422 renvoie l'objet posé mais peut déjà déclencher une nouvelle proposition.
- `mgmt-bureau.js:584-602`, branche validate de la décision : recopie ids/cycle/slot dans `m.card`, perd les métadonnées à :598.
- `mgmt-save.js:58-80`, `mgmtValidAffair(a)` ; `:227-335`, `validateMgmt(raw)` ; `:362-489`, `mgmtMigrate(raw)` ; porte cette migration séquentielle.
- Version réelle `MGMT_SAVE_VERSION=16` (`mgmt-bureau.js:85`) : lot 8 déjà fusionné, contrairement à l'ancien calendrier.
- `tests/mgmtRaisonsSelection.test.js:7-19,30-39,45-65` : porte fixtures, booking et vérification de revanche. Le test 160 départs coûte environ 1 005 s selon T2.
- `tests/mgmtSauvegarde14.test.js:15-46` : porte vraie fixture v14 et `tests/helpers/jouerSoirees` pour charger puis jouer une soirée ; ne pas régénérer la fixture historique.
- `mgmt-prelims.js:43-52,78` : rendu ancien, indépendant du champ à ajouter ; aucun changement d'écran en T3.
- `@eclaireur` sollicité : refus technique `Subagent depth limit reached (1)` ; passages décisifs lus directement en secours.

## 4. Ce qui change
Contrats acquis ci-dessous ; les cas signalés §12 restent interdits d'implémentation avant réponse.
- **`mgmt-carte.js`** : enregistrer dans chaque combat neuf une copie JSON détachée de `p.raison`, exactement `{famille,fait}`. Ne stocker ni phrase, ni combattant entier, ni index local Map.
- Étendre `mgmtBulkSelection(m,used,seen,n,stats,relaxed,contexte)` par un dernier argument optionnel.
  JSDoc ajouté : `/** @param {Array<Object>} [contexte=[]] Combats déjà conservés sur cette carte, dans leur ordre ; leurs raisons enregistrées initialisent les usages. */`
  Contexte fourni par la proposition : préliminaires déjà posés. Pour l'échange : préliminaires posés puis autres combats du bloc, sans le combat retiré.
  Les usages comptent uniquement les familles enregistrées ; traitement des raisons absentes/anciennes bloqué par Q1.
- Appliquer l'acceptation finale T2 : inédites, puis famille la moins utilisée différente de la précédente (ordre catalogue à égalité), puis précédente si elle seule permet une paire apte. Ne pas conserver la priorité spéciale au repli, dépassée par cette précision.
  Le code actuel :233-243 omet le dernier essai de la précédente ; corriger ce raccord conformément à la décision déjà écrite, pas une nouvelle décision d'auteur.
- `mgmtSwapFight` : sélection raisonnée d'une place avec contexte, exclusion de l'ancienne paire, copie de la preuve choisie. Garder les réactions/faits existants ; aucune mutation du bloc si échec.
- `mgmtBulkRemplacer` : ne jamais garder la cause de l'ancienne paire ; contrat de succès/échec et cause du geste joueur bloqués par Q2.
- `mgmtBulkMonter` : transmettre la copie de cause dans l'objet réellement renvoyé par `mgmtBookMain`, sans ajouter de cause aux bookings entièrement manuels.
- **`mgmt-bureau.js`** : version 17 ; validation du bloc recopie la cause sans la recalculer, ni modifier les promotions, capacités ou faits.
- **`mgmt-save.js`** : migration 16 → 17 et validation des raisons ; schéma exact des exceptions anciennes bloqué par Q1.
  Nouvelle signature : `mgmtRaisonValide(raison,aid,bid)`.
  JSDoc : `/** Vérifie une preuve enregistrée pour la paire, sans recalculer son actualité. @param {Object} raison Preuve {famille,fait}. @param {string} aid Premier id. @param {string} bid Second id. @returns {boolean} Structure et références de paire conformes au schéma T1. */`
  Décrire avant code une table de schémas correspondant exactement aux retours `mgmt-raisons.js:83-134` : famille/source compatibles, champs requis, types et bornes ; pas de simple test « fait est un objet ».
  Vérifier les ids cités contre la paire, nombres finis et compteurs/indices entiers non négatifs ; tableaux de deux combattants sans doublon lorsqu'exigés. Ne pas exiger que rang, contrat ou série soient encore actuels au chargement.
- **`tests/mgmtRaisonsSauvegarde.test.js`** : tests ci-dessous ; **`tests/mgmtRaisonsSelection.test.js`** : remplacer uniquement l'assertion T2 qui interdisait le champ sauvegardé, devenue périmée.
- **`package.json`** : inscrire le nouveau fichier dans `test` et `test:watch` ; **`index.html`, `sw.js`** : versions seulement via outil `_bump`, ordre inchangé.
- Toute ancre ajoutée porte `MONDE_LOT6_T3_…` et la référence Monde lot 6 T3 ; conserver les ancres existantes.

## 5. Sauvegarde
Oui : **17**, après 16. Aucun changement des clés d'emplacements, backups ou version du mode carrière.
La migration garde paires, ordre, statuts, faits, historique, visites et carte ; aucune nouvelle simulation, aucun tirage, aucun combat perdu.
Ne pas reconstruire une « vraie cause » ancienne à partir de l'état courant ; décision sur l'absence explicite attendue en Q1.
Validation : appliquer `mgmtRaisonValide` aux causes des combats de bloc et de carte, y compris affaires fermées ; politique des champs absents/null à fixer après Q1/Q2.
Ne pas revalider les seuils publics contre l'état courant : une preuve sauvegardée est un instantané du choix, pas une raison recalculée à chaque chargement.
Ne pas modifier `hist`, archive compacte ou `lastEvent` pour y propager les causes : T3 couvre pile et carte en préparation seulement.

## 6. Textes
Aucun. Pas de commande à `@ecrivain` : les deux lignes, variantes et féminin appartiennent à T4/T5.

## 7. Écran
Aucun changement de rendu, HTML, CSS ou contrôleur. Le test de compatibilité appelle l'écran existant sans le modifier ; planche non requise pour cette tranche de données.

## 8. Tests
Fichier nouveau : `tests/mgmtRaisonsSauvegarde.test.js`. Intitulés exacts :
- `Monde lot 6 T3 — la proposition conserve exactement la preuve choisie` : graine 7, 0 soirée, carte principale remplie par le geste T2 ; espion délégant sur sélection, chaque cause du bloc égale celle du résultat ; changer l'objet local ensuite ne change pas la copie enregistrée.
- `Monde lot 6 T3 — valider et recharger ne recalculent aucune cause` : même départ ; JSON des causes identique avant validation, dans les préliminaires et après `mgmtSerialiser`/`mgmtParseAndValidate` ; lecteur de raisons remplacé par une fonction qui lève pendant validation et recharge, 0 invocation.
- `Monde lot 6 T3 — la revanche enregistrée conserve la source et le vrai vainqueur` : fixture T2, cycle 20, combat archive cycle 18 indice 0 ; winner A puis B, inversion des ids ; preuve après aller-retour identique avec gagnant/perdant exacts. Nul : aucune revanche choisie.
- `Monde lot 6 T3 — les causes mal formées sont rejetées` : une preuve positive par chacun des 15 identifiants T1 puis mutations famille/source inconnue, fait absent/tableau, id hors paire, indice négatif/fractionnaire, compteur NaN avant sérialisation ; 15 valides, toutes mutations invalides. Cas absence/null à compléter après Q1/Q2.
- `Monde lot 6 T3 — changer une paire ne conserve pas sa vieille cause` : graine 9, fixture T2 ; échange réussi, cause issue du résultat de sélection, vieille paire exclue, faits swapped conformes ; échec sans paire : JSON du bloc inchangé. Assertions du remplacement manuel bloquées par Q2.
- `Monde lot 6 T3 — faire monter conserve la cause sans en inventer au booking manuel` : graine 9, libérer une place main après proposition ; combat monté porte la même preuve, un booking manuel neuf ne porte aucune cause de Leïla.
- `Monde lot 6 T3 — les familles posées comptent dans la nouvelle proposition` : graine 20261008, conserver un préliminaire avec preuve puis demander les places restantes ; famille déjà comptée, priorité aux inédites vérifiable par espion du picker. Seule précédente disponible : une place obtenue, pas null.
- `Monde lot 6 T3 — une pile ancienne charge et se rend sans erreur` : v16 construite sans raisons, graine 7, 0 soirée ; après migration v17, mêmes ids/ordre/statuts, validateMgmt vrai, scr_mgmt_prelims rend une chaîne non vide sans exception. Valeur migrée des raisons bloquée par Q1.
- `Monde lot 6 T3 — une partie ancienne joue une soirée après migration` : vraie fixture v14, graine de reprise 5 ; chargement par emplacement puis `jouerSoirees(w,1)===1`, eventsPlayed 3 → 4, validateMgmt vrai ; hist/facts d'avant conservés comme préfixes.
Le test du brief 20 graines × 8 organisations reste couvert par T2 : 160/160 blocs complets et preuves vérifiées ; diversité maximale selon décision finale, pas promesse absolue sur un départ sans passé.
Pour sa persistance, étendre ce test EXISTANT, sans seconde boucle coûteuse : chaque preuve enregistrée dans l'affaire puis carte égale le résultat sélectionné et survit à la sérialisation. Garder les variantes avec passé (sept familles) et sans passé (au moins six sur sept).
Phrase passe-partout supprimée et deux lignes féminines : T4/T5, ne pas les annoncer livrées. Compatibilité d'affichage ancien : test sans exception ci-dessus, pas nouvelle présentation.

## 9. Vérification
Après levée du STOP : `node --test tests/mgmtRaisonsSauvegarde.test.js tests/mgmtPrelims.test.js tests/mgmtSauvegarde14.test.js`.
Puis `node --test tests/mgmtRaisonsSelection.test.js` (prévoir 1 200 000 ms), `npm run check:rapide`, `node tools/verif-versions.js`, `git diff --check`.
Aucune mesure Monte Carlo ni six ans supplémentaires ; porter le test de population existant, pas le recopier.
Fin : version 17, 160/160 blocs persistés, 0 cause remplacée au chargement, 0 preuve fausse, 0 perte ancienne, 1 soirée reprise, 0 échec ciblé/rapide/version.
Fiche seule : pas de tests de code exécutés pour prétendre lever les questions.

## 10. Hors périmètre
Écrans/textes T4/T5, dossiers lot 4, retour de blessure, seuils T1, effectifs, RNG/probabilités, nouvelles règles de booking, cache durable, moteur et monde extérieur. Ne pas refaire les fixtures anciennes ni assouplir des assertions sans rapport avec le nouveau champ.

## 11. Pièges
- Scripts globaux : carte `index.html:1120`, raisons :1135, save :1138 ; accès aux raisons au runtime seulement, aucun déplacement de scripts. Le harnais lit cet ordre réel.
- T2 acceptée ≠ précision finale implémentée : la voie qui reprend la précédente manque encore ; reprendre uniquement ce raccord explicitement décidé.
- `used` contient des prénoms, `seen` des ids triés joints par `|`. Index de preuves local, à reconstruire après changement de paire/état ; aucun `Math.random()`.
- `mgmtBookMain` peut retirer la proposition et en ouvrir une autre avant son retour : garder la preuve avant l'appel, recopier dans le combat renvoyé, pas chercher l'ancienne affaire ensuite.
- Sérialisation du passé compacte ≠ mémoire : indices T1 renvoient à hist/facts ; ne pas supprimer/réordonner ces sources pour normaliser une preuve.
- Les seuils d'une preuve peuvent cesser d'être vrais après promotions, recrutement ou soirée ; rejeter une sauvegarde pour cette raison détruirait la mémoire du choix.

## 12. Questions pour Anthony
1. **Bloquante — piles anciennes :** accepter une cause absente explicitement (par exemple `raison:null`, « cause non enregistrée » réservée à l'affichage T4), ou reconstruire une justification actuelle marquée comme telle ? La vraie cause historique est irrécupérable. Quelle politique vaut aussi pour affaires fermées et combats déjà posés ?
2. **Bloquante — remplacement manuel :** le joueur peut aujourd'hui choisir toute paire autorisée, sans cause de Leïla. Doit-on conserver ce geste avec une origine joueur et sans cause de Leïla, ou exiger une preuve disponible pour la nouvelle paire (et refuser si aucune) ? Si une preuve est affichée, faut-il la distinguer explicitement d'une cause choisie par Leïla ?
Ne pas répondre à ces questions à sa place ; les réponses déterminent la migration, les exceptions de validation et les assertions du geste manuel.

## DÉCISION du 13/10/2026 (Claude) — le STOP est levé, les deux questions sont tranchées
1. **Piles anciennes, affaires fermées, combats déjà posés** : cause absente EXPLICITE, `raison:null` (« cause non enregistrée », réservé à l'affichage de T4, qui n'affiche alors rien). Aucune reconstruction d'une justification actuelle : la vraie cause historique est irrécupérable et on ne la fabrique pas. La validation accepte `null` pour ces cas et exige une raison non nulle pour toute pile créée après la migration.
2. **Remplacement manuel par le joueur** : le geste est CONSERVÉ, jamais refusé. Il enregistre `{origine:'joueur', raison:<preuve si une famille s'applique à la nouvelle paire, sinon null>}` ; quand une preuve existe, elle est marquée comme trouvée pour le choix du joueur (`origine:'joueur'`), distincte d'une cause choisie par Leïla (`origine:'leila'`).
3. **Version** : sur cette branche la version réelle est 16, tu passes à 17 (migration 16 → 17). Le superviseur renumérotera à la fusion avec les lots 5 (déjà 18) et 8 ; ne t'en occupe pas.
Plus aucune question : code, vérifie, commit « Monde lot 6 T3 : la raison enregistrée » (sans « inachevé »).
