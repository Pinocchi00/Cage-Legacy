# Monde lot 5 T2 — Le prédécesseur répond aux demandes

## 1. Branche et dépendances
Branche : `monde-lot-5-carte`, branche courante vérifiée ; nom déjà fixé par T1 (le plan ne donne que la piste A, l.70 et 97).
Après les lots 1, 6 et 4 ; réutiliser T1 déjà codée. Le lot 2 T3 n'est pas requis : décision du 13/10 dans T1 §13, politique commune admise.
Fiche T1 lue, y compris ses décisions finales ; aucun compte rendu Monde lot 5 trouvé sur cette branche.

## 2. Objectif
Faire répondre le prédécesseur aux demandes réelles pendant le passé et transmettre leurs promesses encore ouvertes avec une échéance et un lien d'archive intact.
Brief l.266 : « Pendant les six ans, il promet ou refuse, comme un joueur. Au premier jour, il reste donc des promesses ouvertes avec leur échéance. »

## 3. Ce qui existe
- `mgmt-promesses.js:126–137` : `mgmtDemandesOuvertes(m)` rend `{i,a,want,target,c}` ; `i` est l'index dans `m.facts`, pas un identifiant autonome.
- `mgmt-promesses.js:168–203` : `mgmtDemandesOuvreCycle(m)`, demandes naturelles/imposées, une nouvelle par cycle, deux ouvertes maximum ; flux d'identité, sans RNG globale.
- `mgmt-promesses.js:208–216` : `mgmtRepondreDemande(m,i,reponse)` écrit une promesse ou un refus avec `d:i`, interdit une seconde réponse ; échéance `cycle+MGMT_PROMESSE_CYCLES` (=3).
- `mgmt-promesses.js:108–120` : `mgmtPromesses(m,f)` dérive tenue/rompue/en cours depuis `hist` et `cycle`, jamais depuis la carte signée.
- `mgmt-bureau.js:400–417,490–494` : `mgmtNewPile` incrémente le cycle et ouvre les demandes ; `mgmtAddFact` conserve tous les faits, sans troncature.
- `mgmt-predecesseur.js:120–147` : `mgmtPredecesseurSoiree(m,k,reglages,mesure)`, garde `G.mgmt===m`, renouvelle puis booke puis joue puis ouvre la pile suivante.
  Porte le joueur automatique de `tools/mesure-management.js` déjà installé ; ne pas recopier ni changer son booking. Le crochet T2 est actuellement un commentaire l.127.
- Appelants : `mgmt-passe.js:77–83`, `tools/mesure-management.js:54` et tests ; activer seulement le passé, pas tous les appelants.
- `mgmt-passe.js:87–117` : clôture idempotente ; recale les jours, pas les cycles, allège, puis signe la carte héritée. Dernière pile déjà ouverte par la dernière soirée.
- `mgmt-passe.js:154–165` : `mgmtPasseAlleger(m)` filtre `depart_attente/contrat/attend`, mais ne recale PAS les `d` ; c'est le défaut à corriger.
- `mgmt-passe.js:169–231` : compactage/déploiement conservent l'ordre des faits ; `mgmtSerialiser(m)` et `mgmtParseAndValidate` sont les portes de l'aller-retour.
- Tests modèles : `tests/mgmtPromesses.test.js:26–75`, `tests/mgmtArchive.test.js:54–68`, `tests/mgmtPredecesseur.test.js:67–121` ; harnais `tests/helpers/loadGame.js`.
- `mgmt-accueil.js:113–127` et `mgmt-ecran-fiche.js:220–233` lisent déjà les promesses ; aucun écran à modifier.

## 4. Ce qui change
**`mgmt-predecesseur.js`** : ajouter l'ancre `MONDE_LOT5_T2_DEMANDES` et cette fonction de premier niveau :
`mgmtPredecesseurDemandes(m)`.
JSDoc : `/** Répond une fois aux demandes ouvertes, sans écran ni tirage RNG. @param {object} m Partie courante ; exige G.mgmt===m. @returns {{promises:number,refusees:number}} Réponses effectivement enregistrées. */`
- Même garde que `mgmtPredecesseurSoiree`, levée avant mutation. Photographier `mgmtDemandesOuvertes(m)` dans son ordre natif.
- Pour chaque demande : promettre si son combattant existe, n'est pas retraité, n'est pas libre et `mgmtContratRestants(f)>0`.
- Si `target` existe, il doit aussi exister, être non retraité, non libre, avoir des combats de contrat restants et être de même catégorie ; sinon refuser.
- Pas de test de suspension, d'engagement ou de rang : une promesse porte sur trois cycles futurs, pas une disponibilité immédiate. Même règle pour `pause` ; aucune sélection spéciale par famille.
- Répondre exclusivement par `mgmtRepondreDemande(m,d.i,'promettre'|'refuser')` ; compter seulement les retours `true`. Aucun fait inventé ni réponse aux demandes expirées.
- Réglage opt-in `reglages.demandes===true` : appel APRES prolongations/re-signatures/recrues (l.133), AVANT pose et booking (l.134). Remplacer le commentaire l.127 par une explication de cet ordre.
- `mgmtPredecesseurReglages()` reste exactement `{titreCadence:2}` ; aucun champ ajouté au compte rendu de soirée. Mettre à jour le commentaire de fichier, conserver les ancres existantes.
**`mgmt-passe.js`** : ajouter `demandes:true` aux réglages de `mgmtPasseSoiree` ; rien à appeler pendant la clôture.
- Dans `mgmtPasseAlleger`, après validation de tous les combats et avant remplacement des faits : construire une correspondance ancien index → nouvel index des faits conservés.
- Conserver ordre et contenu des faits ; pour chaque `promesse`/`refus` dont `d` désigne une ancienne `demande`, remplacer `d` par son index conservé (copie du fait avec seul `d` changé).
- Les demandes ne sont jamais filtrées. Les `d` anciens qui ne désignent aucune demande restent inchangés : pas de réparation conjecturale des fixtures/parties historiques mal liées.
- Noter `passe.nFacts` APRES filtrage et recalage. L'échec d'allègement des combats reste sans mutation. Aucun nouvel état ni nouvelle fonction nécessaire ici.
**`tests/mgmtPredecesseurDemandes.test.js`** : neuf, tests rapides ci-dessous.
**`tests/mgmtPromessesHeriteesSixAns.test.js`** : neuf, matrice complète et résultats mis en cache uniquement dans ce fichier.
**`package.json`** : inscrire les deux fichiers dans `test` et `test:watch` ; **`tools/check-rapide.js`** : inscrire seulement la matrice dans `LENTS`.
**`index.html`, `sw.js`** : cache uniquement, via `node tools/_bump.js mgmt-predecesseur.js mgmt-passe.js` ; aucun déplacement de script.

## 5. Sauvegarde
Changement de format : **non**, `MGMT_SAVE_VERSION` reste **16** (`mgmt-bureau.js:85`). Pas de migration ni nouveau champ.
Correction des références à la clôture des nouvelles générations seulement ; aucun recalcul au chargement des parties déjà closes.
`validateMgmt`, `mgmt-save.js:321–329`, contrôle déjà `a/c/want/target/due/d` (types et bornes), pas l'intégrité référentielle de `d` : ne pas le durcir pour casser les anciennes parties.
L'intégrité métier des nouveaux liens est vérifiée par les tests avant et après la porte de lecture ; les promesses et refus restent dans l'archive compacte v1.

## 6. Textes
Aucun : réutiliser les familles et libellés existants. Pas de commande à `@ecrivain`, pas de nouvelle phrase ni de voix du prédécesseur.

## 7. Écran
Aucun. L'Accueil et la fiche lisent les faits existants ; marque héritée, dossiers et confirmation d'annulation appartiennent à T3/T4.

## 8. Tests — fichiers et intitulés exacts
`tests/mgmtPredecesseurDemandes.test.js` : harnais `newGameWindow({runMain:true})`, graine **20261008**, aucune soirée sauf mention.
1. `Monde lot 5 T2 — promettre ou refuser réutilise la réponse du joueur` : fixture cycle=10, faits demande pour deux combattants sous contrat (principale et revanche ciblée), un libre, un contrat épuisé, une cible retraitée et une cible d'autre catégorie ; résultat `{promises:2,refusees:4}`, six réponses, `due=13`, `d` exact, cible conservée, zéro demande répondue encore ouverte.
2. `Monde lot 5 T2 — la réponse est idempotente et ne consomme pas la RNG` : même fixture ; seconde réponse `{promises:0,refusees:0}`, JSON et état RNG inchangés ; premier appel ne change pas la RNG non plus. Mauvais `G.mgmt` lève avant mutation ; demandes expirées et demande d'un retraité ne reçoivent aucun fait.
3. `Monde lot 5 T2 — seul le passé active les réponses` : partie neuve Split, une demande éligible injectée ; une soirée sans réglage n'ajoute aucune réponse, la même fixture dans une autre fenêtre avec `{demandes:true}` en ajoute exactement une ; dans un passé de **3 soirées**, les demandes photographiées avant chaque `mgmtPasseSoiree` reçoivent exactement une réponse. Vérifier l'appel après re-signature avec un demandeur libre re-signable et `{renouvelle:true,demandes:true}`.
4. `Monde lot 5 T2 — alléger recale les références des promesses et des refus` : préparer un passé de **3 soirées**, avant clôture injecter des faits perdus intercalés entre deux demandes et leurs réponses réelles ; après clôture, les deux `d` désignent les bonnes demandes (même `a/want/target` pour la promesse), ordre conservé, perdus absents, `nFacts` exact ; seconde clôture ne change rien. Inclure une ancienne réponse à `d` invalide, conservée sans invention.
5. `Monde lot 5 T2 — les échéances survivent au passage de témoin et à la sauvegarde` : passé **3 soirées**, injecter une demande et la promettre au dernier cycle avant clôture ; `due=c+3` inchangé, état `en cours`, demande dans les premiers `nFacts`. `mgmtSerialiser` porte `passe.archive`, `mgmtParseAndValidate` rend faits/liens/états identiques et `validateMgmt===true`. Partie v16 sans passé sans réponses : zéro réponse créée au chargement.
6. `Monde lot 5 T2 — une promesse héritée se tient ou se rompt selon les règles existantes` : fixture précédente ; sans combat, état en cours à `cycle=due`, rompue à `due+1` ; dans une copie, trace principale à `c+1` avec le demandeur → tenue. Aucun fait de résolution ajouté, une simple signature de carte ne tient pas la promesse.
`tests/mgmtPromessesHeriteesSixAns.test.js` : **20261008 à 20261027 incluses × les huit IDs de `MGMT_ORGANISATIONS`**, **62 soirées**, 160 créations.
7. `Monde lot 5 T2 — chaque promesse ouverte du premier jour renvoie à une demande de l'archive` : pour chaque création, événements=passé=62, soirées joueur=0, cycle=63, jour=0, validation vraie ; toutes les réponses (promesse ET refus) ont un `d` entier dans `[0,nFacts)`, fait demande même `a`, et même `want/target` pour promesse ; `due=c+3`. Pour chaque promesse en cours, `due>=63`, demande retrouvée après aller-retour compact, état et lien identiques. Sur l'ensemble, nombre de promesses en cours **>0** : assertion non vacue, sans quota artificiel par partie.
Les autres tests du brief (carte valide/différente, joueur automatique) restent ceux de T1 ; places libres avec dossiers = T3. Ne pas les recopier ni assouplir leurs assertions.

## 9. Vérification
Pendant les essais : `node --test tests/mgmtPredecesseurDemandes.test.js tests/mgmtPromesses.test.js tests/mgmtPredecesseur.test.js tests/mgmtArchive.test.js tests/mgmtCarteHeritee.test.js`.
Acceptation une fois : `node --test tests/mgmtPromessesHeriteesSixAns.test.js`, puis `npm run check:rapide` ; fin de lot, contrôle complet selon le plan.
Critère : **160/160** états valides, **0** lien nouveau orphelin avant/après sauvegarde, **au moins 1** promesse ouverte sur la matrice, **0** échec ciblé ou rapide. Pas de mesure de performance nouvelle ni Monte Carlo.
Attention : `tests/mgmtCarteHeriteeSixAns.test.js:14–15,45–47` boucle actuellement sur 2 graines mais attend 20/160 : échec préexistant à signaler séparément, pas à corriger ou prendre pour modèle de couverture en T2.

## 10. Hors périmètre
UI/CSS, textes, nouvelles familles, nouvelle règle de tenue (notamment `un-classe`), priorité de booking des promesses, politique par organisation, annulation, dossiers, recrutement/contrats/rangs/moteur, refonte des six ans, réparation rétroactive des anciens liens, correction de la matrice T1.
Ne pas répondre à la dernière pile lors de la clôture : elle contient les demandes laissées au joueur. Ne pas réinitialiser ni prolonger les échéances pour fabriquer un héritage.

## 11. Pièges
- `d` indexe tout `facts` : le filtrage suffit à casser les liens même si demande et promesse restent présentes. Recaler aussi les refus, sinon les demandes déjà refusées réapparaissent.
- Les jours deviennent négatifs mais cycles et échéances restent positifs ; pas de soustraction d'`origineJours` à `c/due`.
- Les promesses modifient loyauté/charge et donc potentiellement résultats/blessures : conserver les repères de l'outil par opt-in, pas en assouplissant ses tests.
- Ne pas boucler sur un `facts` qui s'allonge ; photographier les demandes. Aucun `Math.random`, horloge de décision ou RNG globale supplémentaire.
- Ordre vérifié : `index.html:1127,1137–1138`, promesses avant prédécesseur avant passé ; harnais lit ces balises, aucune dépendance à un rendu.
- Recherche `@eclaireur` tentée mais refusée (« Subagent depth limit reached ») ; passages décisifs lus directement.

## 12. Décisions et questions
- Politique commune : promettre aux demandeurs et cibles encore sous contrat, refuser les demandes devenues impossibles ; défaut technique le plus simple, sans pourcentage arbitraire ni portrait d'auteur.
- Opt-in du passé : respecte les appelants et les mesures historiques ; trois cycles restent le délai existant, même avec une suspension temporaire.
- Pas de minimum par graine : l'héritage doit découler des demandes réelles, non d'une promesse injectée ; la matrice impose une preuve non vide et vérifie toutes les promesses présentes.
- Pas de montée de version : seul un index déjà existant est corrigé avant son premier enregistrement ; aucune nouvelle structure ni migration rétroactive.
- Questions pour Anthony : **aucune**.
