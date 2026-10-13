# Monde lot 6 T1 — Les quinze familles

## 1. Branche
- Courante : `monde-lot-6-raisons`.
- Le plan nomme le lot et sa dépendance, mais ne donne pas explicitement sa branche : confirmation demandée en §12. Ne pas changer de branche.
- Dépendance : lot 1 fusionné (`d12bd9e`), archive disponible. Aucune fiche ni aucun compte rendu du lot 6 trouvé.

## 2. Objectif
Définir quinze familles de raisons comme des lectures pures des faits existants, chacune fournissant une preuve vérifiable sans écrire de phrase ni choisir de combat.
Fondement : « T1 — Les quinze familles, chacune avec sa condition et le fait qu'elle cite. Fonctions pures, lues sur l'archive du lot 1. »

## 3. Ce qui existe
- `mgmt-prelims.js:43-53`, `mgmtPrelimsRaisons(m,fa,fb)` : raisons textuelles après le choix, à ne pas remplacer en T1. Appel à `:78` dans `scr_mgmt_prelims()`.
- `mgmt-carte-cadre.js:122-134`, `mgmtCarteNote(m,f,contre)` : attente à partir de deux cycles, convertie en mois par `Math.round(n*MGMT_EVENT_WEEKS/4.345)` ; sinon dernier résultat. Ce n'est pas un sélecteur de familles.
- `mgmt-rivalites.js:29-43`, `mgmtAffrontements(m)` : porte ce lecteur de paires ; preuve `i` dans `m.hist`, cycle `c`, gagnant/perdant calculés depuis `winner` (`A`, `B`, `D`).
- `mgmt-rivalites.js:48-64`, `mgmtRivalites(m)` : humiliation/trilogie, pas une mémoire explicite de défi sans réponse.
- `mgmt-rivalites.js:90`, `mgmtReclamesRaisons(m)` : paires réclamées, `{a,b,raison,texte,c}`. Réutiliser les données, pas analyser `texte`.
- `mgmt-attention.js:23-33`, `mgmtResultats(m,f)` : résultats du plus récent au plus ancien, depuis `m.hist`.
- `mgmt-suivi.js:127-130`, `mgmtSerie(m,f)` : `{issue,n}` ou `null` ; une série s'arrête au premier résultat différent.
- `mgmt-attention.js:92-119`, `mgmtRole(m,f,classements)` : rôle prioritaire ; espoir si âge <25 et total <6, vétéran si âge >34 ou total >30. Un autre rôle peut masquer ces critères.
- `mgmt-suivi.js:143-161`, `mgmtClassementLignes(m,div,portee)` : champion de rang 0, autres rangs à partir de 1, portée `organization` ou `world`.
- `mgmt-promesses.js:108-120`, `mgmtPromesses(m,f)` : preuve `i` dans `m.facts`, `want`, `target`, `c`, `due`, `etat`.
- `mgmt-promesses.js:126-136`, `mgmtDemandesOuvertes(m)` : demandes sans réponse non périmées, preuve `i`, `a`, `want`, `target`, `c`.
- `mgmt-contrats.js:97-108`, `mgmtContratAttente(m,f)` et `mgmtContratRestants(f)` : attente depuis `lastCycle` ou `ct.since`, restant `ct.n-ct.f` borné à zéro.
- `mgmt-corps.js:556-570` : `f.susp` porte l'échéance ; faits `injury`/`susp` ne gardent que `{c,k,a}`, pas la durée ni la date du retour.
- `mgmt-carte-cadre.js:62-65`, `mgmtCarteStyleBilan(m,f)` : libellé tiré de `mgmtAnciensBilan`, pas une classification des oppositions de styles.
- `mgmt-humanite.js:22-35`, `mgmtIdentitePays(f)` / `mgmtIdentiteVille(f)` : origine stable, RNG indépendante du flux de partie.
- `mgmt-recrutement.js:72` : fait `{c,k:'recrue',a}` ; présence dans l'archive à vérifier avant de parler de débuts.
- `tests/mgmtArchive.test.js:10-18,22-35` : porte le harnais `newGameWindow` et le passé court, graine 20261008, quatre soirées. Le passé allégé est dans `m.hist` en mémoire, pas dans `m.passe.archive`.
- Tests de régression disponibles : `tests/mgmtPrelims.test.js`, `tests/mgmtRivalites.test.js`, `tests/mgmtArchive.test.js`.
- Recherche `@eclaireur` tentée : refus technique « Subagent depth limit reached ». Lectures ciblées effectuées directement ; aucun code modifié.

## 4. Ce qui change
Les conditions et valeurs sont celles du §13 ; le codeur les applique.
- Ajouter `mgmt-raisons.js` : catalogue des quinze identifiants et lecteurs de preuves, sans texte affichable, sans mutation, sans RNG de partie.
- Ajouter `tests/mgmtRaisons.test.js` : tests des conditions et des preuves, cas positif et négatif pour chaque famille.
- `index.html` : charger ce fichier après les lecteurs requis ; aucune exécution au chargement. Aujourd'hui carte à :1120, attention :1126, promesses :1127, rivalités :1128, suivi :1132, contrats :1133, préliminaires :1167.
- Contrat de fonction (complet, §13) :
  `mgmtRaisonsPourPaire(m,fa,fb)`.
  JSDoc : `/** Lit les familles justifiées pour deux combattants, sans mutation ni texte. @param {Object} m Partie en mémoire. @param {Object} fa Premier combattant. @param {Object} fb Second combattant. @returns {Array<Object>} Preuves structurées ; schémas et ordre à fixer après décisions. */`
- Les champs par famille, seuils et cas limites doivent être inscrits ici avant toute implémentation ; ni objet de sauvegarde ni sélection de raison dominante en T1.

## 5. Sauvegarde
Non. Ne pas monter `MGMT_SAVE_VERSION`, ne pas modifier migration, validation ou archive. L'enregistrement des raisons appartient à T3.

## 6. Textes
Aucun. Les formulations, leurs variantes et leurs accords sont T5 ; pas de commande à `@ecrivain` en T1.

## 7. Écran
Aucun. Pas de HTML, CSS, changement des Préliminaires ou présentation. L'affichage appartient à T4.

## 8. Tests
Fichier nouveau : `tests/mgmtRaisons.test.js`. Intitulés exacts réservés :
- `Monde lot 6 T1 — les quinze familles possèdent chacune une condition et une preuve` : exactement 15 identifiants, aucun doublon ; une condition positive et une négative par famille, à chiffrer après §12.
- `Monde lot 6 T1 — la revanche cite un combat de l'archive et son vrai vainqueur` : passé Split, graine 20261008, 4 soirées ; sélectionner une trace décisive réelle, preuve `i` identique, gagnant/perdant conformes à `winner` ; un nul ne fournit aucune défaite.
- `Monde lot 6 T1 — chaque raison est vérifiée contre sa source` : pour les 15 familles, retrouver exactement la trace, le fait ou la valeur publique cités ; zéro preuve orpheline. Fixtures chiffrées bloquées par §12.
- `Monde lot 6 T1 — la lecture est pure et déterministe` : deux appels sur le même état donnent le même JSON ; état sérialisé et graine inchangés, y compris après inversion des interlocuteurs selon le contrat à fixer.
- `Monde lot 6 T1 — un passé allégé suffit sans rejouer les combats` : graine 20261008, 4 soirées ; aucune invocation de `mgmtReplayFight` lors de la lecture des raisons.
Répartition explicite des autres tests du brief : diversité sur 20 graines × 8 organisations en T2/T3 ; disparition de la phrase passe-partout en T4/T5 ; deux lignes au féminin en T4/T5 ; ancienne pile chargeable et affichable en T3/T4. Ne pas les déclarer réussis en T1.

## 9. Vérification
- Après les décisions du §13 : `node --test tests/mgmtRaisons.test.js tests/mgmtArchive.test.js tests/mgmtRivalites.test.js tests/mgmtPrelims.test.js`, puis `npm run check:rapide`.
- Mesure : aucune. Pas de génération complète des six ans pour cette tranche.
- Critère final à compléter après réponses : 15 familles, 30 cas de condition minimum, 0 preuve fausse, 0 mutation, 0 échec ciblé et rapide.
- Cette fiche bloquée ne nécessite pas d'exécuter les tests du jeu ; elle ne livre aucun code.

## 10. Hors périmètre
Booking (`mgmtPickBulkPair`), variété des cartes/piles, choix de priorité entre familles, sauvegarde, export de textes, écrans et simulation du monde extérieur. Ne pas altérer les règles existantes pour faire réussir une condition.

## 11. Pièges
- Archive disque compacte ≠ état mémoire : lire `m.hist`/`m.facts` ; les traces `p:true` ne sont pas rejouables.
- Une absence prolongée n'est pas une preuve de blessure ; un rôle revenant n'établit pas sa cause.
- Une rivalité d'humiliation n'est pas un défi sans réponse ; les réclames dérivées ne mémorisent pas un refus de défi.
- Ne pas analyser des phrases pour déduire conditions ou styles ; ne jamais lire attributs cachés/niveau moteur pour justifier un fait public.
- Caches des rôles (`mgmt-attention.js:49-68`) indexés notamment par longueur : modifier une fixture à longueur constante peut rendre le résultat périmé. Employer des états frais.
- `mgmtRole` n'est pas un ensemble de rôles ; `mgmtClassementLignes` distingue champion 0 et premier classé 1.
- Les demandes de pause/carte principale ne justifient pas automatiquement un préliminaire. Ne pas prétendre tenir une promesse incompatible.
- Scripts globaux sans modules ; le harnais lit l'ordre réel d'`index.html`. Aucun `Math.random()`.

## 12. Questions pour Anthony
Toutes les décisions ci-dessous bloquent le contrat T1 ; répondre puis réviser la fiche avant `/tranche 6 1`.
1. Confirme-tu `monde-lot-6-raisons` comme branche attendue ? Le plan ne fournit pas ce nom explicitement.
2. « Classement voisin » exige-t-il deux rangs consécutifs, ou couvre-t-il toute paire comme le repli promis ? Dans ce second cas, quel fait et quel enjeu sont vrais pour des rangs éloignés, et faut-il réellement garantir que le vainqueur passe devant ?
3. Quels seuils retenir pour séries de victoires, longue attente et vétéran avant la sortie ? « Dernière chance » vaut-elle exactement 2 ou 3 défaites, ou au moins 2 ? Pour test d'un jeune, quels rôles qualifient le « nom installé », et utilise-t-on les critères espoir/vétéran même si un rôle prioritaire les masque ?
4. Quel fait existant constitue le « défi lancé, resté sans réponse » ? Les paires micro/réseaux de `mgmtReclamesRaisons` suffisent-elles, ou faut-il une autre preuve ? Humiliation/trilogie ne prouvent pas un défi sans réponse.
5. Quand « retour de blessure » devient-il recevable, pendant combien de temps, et depuis quelle date compter les mois ? Les faits `injury` ne conservent pas de durée ; faut-il citer le temps depuis le dernier combat sans l'attribuer intégralement à la blessure ?
6. Quelles oppositions du bilan public définissent « styles opposés » ? Le lecteur actuel ne rend qu'un libellé et aucune matrice d'oppositions ; le codeur ne doit pas en inventer une.
7. Pour « demande ou promesse », ne retenir que celles qu'un préliminaire contre cette paire peut satisfaire ? Pour les débuts, faut-il un fait `recrue`, ou zéro combat dans l'archive de l'organisation suffit-il aussi pour un membre de l'effectif initial ?

## 13. Décisions de Claude du 13/10/2026 (réponses aux questions du §12 ; Anthony laisse le technique à Claude)
1. Branche `monde-lot-6-raisons` : confirmée.
2. **Classement voisin** : deux rangs au plus d'écart dans la même catégorie. Le repli promis est une famille distincte « même catégorie, jamais affrontés » qui n'affirme rien sur le classement ni sur qui passe devant.
3. **Seuils** : série = au moins 3 victoires de suite ; longue attente = au moins 6 mois ; vétéran = 33 ans ou plus, ou au moins 20 combats ; dernière chance = au moins 2 défaites de suite ; jeune à tester = rôle espoir ou invaincu ; « nom installé » = rôle contender, champion ou vétéran ; les critères espoir/vétéran s'appliquent même si un rôle prioritaire les masque.
4. **Défi resté sans réponse** : les paires micro/réseaux de `mgmtReclamesRaisons` et les demandes de revanche sans réponse suffisent. Aucune autre preuve à inventer.
5. **Retour de blessure** : recevable s'il existe un fait `injury` du combattant et qu'il n'a pas combattu depuis, pendant 3 cycles après sa guérison. On cite le temps écoulé depuis son dernier combat, sans l'attribuer entièrement à la blessure.
6. **Styles opposés** : paire « frappeur » contre « lutteur ou soumission », d'après les libellés publics du bilan. Le codeur écrit une petite table constante de ces libellés lue dans les données existantes (grep), sans matrice inventée ; un libellé hors table ne produit pas cette famille.
7. **Demande ou promesse** : seules celles qu'un préliminaire contre cette paire peut satisfaire. **Débuts** : zéro combat dans l'archive de l'organisation suffit, y compris pour un membre de l'effectif initial (pas de fait `recrue` exigé).

## 14. DÉCISION FINALE du 13/10/2026 — lis ceci en dernier, elle prime
Il n'y a AUCUN STOP : le §13 répond à toutes les questions du §12 et cette fiche est exécutable. « Pure » veut dire déterministe et sans effet de bord (ne modifie ni `G`, ni la partie, ni l'état du générateur aléatoire global) ; les accessoires publics existants à flux local à graine fixe sont autorisés. Tu choisis toi-même la signature exacte de la fonction (nom et arguments les plus cohérents avec `mgmtReclamesRaisons` et le lecteur existant, vérifie par grep), la forme du retour (famille, fait cité, priorité) et les fichiers touchés ; tu documentes ces choix dans le compte rendu. Les quinze familles et leurs seuils sont ceux du brief et du §13 ; si une famille manque de donnée lisible, elle est omise et listée dans le compte rendu (jamais de fait inventé). Écris le code, les tests (un par famille livrée, repli, déterminisme), vérifie, et commite « Monde lot 6 T1 : les quinze familles » (sans « inachevé »).

## Compte rendu

### Livraison et contrat
- Branche vérifiée : `monde-lot-6-raisons`. Les changements de la tranche déjà présents dans le répertoire de travail ont été repris, examinés et complétés.
- `mgmt-raisons.js` : catalogue constant et lecteur `mgmtRaisonsPourPaire(m,fa,fb)`, porté sur les lecteurs existants, sans sélection de combat ni formulation. Retour : tableau de `{famille,fait}`, au plus une preuve par famille, dans l'ordre du catalogue (aucune priorité de booking). Les interlocuteurs sont triés par identifiant : inverser les arguments rend le même JSON. Les indices `i` désignent `m.hist` ou `m.facts` d'origine ; les autres preuves citent les valeurs des lecteurs publics et leurs identifiants.
- Lecture sur copie locale de la partie et des combattants ; restauration du mémo global des rôles dans `finally`. Aucun changement de `G`, de la partie fournie ou de la graine. Les identités et bilans publics utilisent leurs flux locaux existants, sans attribut caché ni analyse de phrase.
- `tests/mgmtRaisons.test.js` : 28 tests, dont un cas positif et un cas négatif pour chacun des 15 identifiants livrés, contrôle des sources, des seuils, du repli et du passé court.
- `index.html` : chargement après suivi/contrats et les autres lecteurs requis ; version `mgmt-raisons.js` montée par `node tools/_bump.js mgmt-raisons.js`.
- `package.json` : nouveau test inscrit dans `test` et `test:watch`.
- `sw.js` : version de cache montée par l'outil. Cette fiche : compte rendu.
- `mgmt-retraits-data.js` et `mgmt-voix-data.js`, signalés modifiés mais sans diff hors espaces/fins de ligne, restent exclus du commit.

### Tests ajoutés (intitulés)
Tous commencent par `Monde lot 6 T1 — ` :
- `les quinze familles possèdent chacune une condition et une preuve`.
- `<famille> : condition positive et négative`, pour chacun de : `revanche`, `rivalite-ouverte`, `series-croisees`, `classement-voisin`, `test-jeune`, `derniere-chance`, `longue-attente`, `demande-promesse`, `fin-contrat`, `styles-opposes`, `derby`, `debuts`, `veteran`, `reclame-public`, `meme-categorie-jamais-affrontes`.
- `chaque raison est vérifiée contre sa source`.
- `la lecture est pure et déterministe`.
- `le repli cite seulement la catégorie et l’absence de rencontre`.
- `classement voisin accepte deux rangs mais pas trois`.
- `longue attente franchit le seuil public de six mois`.
- `vingt combats suffisent au vétéran malgré son âge`.
- `une réponse éteint le défi et une autre cible ne satisfait pas la promesse`.
- `une promesse tenue ou rompue ne justifie plus la paire`.
- `aucune guérison n’est inventée à partir d’une blessure`.
- `une paire absente ou identique ne donne aucune preuve`.
- `la revanche cite un combat de l'archive et son vrai vainqueur`.
- `un passé allégé suffit sans rejouer les combats`.

### Vérification et relecture
- `node --test tests/mgmtRaisons.test.js` : 28/28 verts.
- Commande ciblée du §9 (raisons, archive, rivalités, préliminaires) : 47/47 verts.
- `node tools/verif-versions.js` : aucun écart.
- `npm run check:rapide` : VERT, 976 tests réussis, 103 fichiers lancés, 12 écartés par l'outillage actuel. Aucune mesure complète, aucun test lent modifié ; check complet réservé au bilan du lot.
- Appels à `@eclaireur`, `@verif` et `@relecteur` tentés : refus technique `Subagent depth limit reached (1)`. Lectures ciblées et vérifications locales de secours effectuées ; aucun verdict indépendant de relecteur disponible.

### Sauvegarde, écarts et questions pour Anthony
- Aucune migration : format, version, validation et archive inchangés. Aucun écran, texte joueur ou changement du booking.
- Selon l'autorisation du §14, **retour de blessure omis** : les faits `injury` ne conservent pas leur échéance de guérison. `f.susp` est une échéance courante, pas une date historique rattachée à la blessure citée ; impossible de prouver la fenêtre de trois cycles sans inventer le fait.
- Donc **14 familles du brief plus le repli distinct** `meme-categorie-jamais-affrontes`, soit 15 identifiants livrés, et non les 15 familles originales toutes implémentées. Aucun enjeu de dépassement au classement n'est affirmé.
- Questions pour Anthony : aucune question bloquante restante selon le §14. Si le retour de blessure doit être livré ultérieurement, il faudra conserver une échéance de guérison associée au fait ; rien n'a été ajouté à la sauvegarde dans cette tranche.
