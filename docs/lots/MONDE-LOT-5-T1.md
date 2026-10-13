# Monde lot 5 T1 — Le prédécesseur s'arrête en plein travail

## 1. Branche et dépendances
Branche de travail : `monde-lot-5-carte` (branche courante vérifiée).
Le plan, l.70 et 97, place le lot 5 sur la piste A après les lots 1, 6 et 4 ; il ne donne pas le nom exact de cette branche.
Le lot 2 T3 doit orienter la main du prédécesseur (plan l.95). Aucune fiche `MONDE-LOT-2-T3*` ni aucun réglage par organisation dans `mgmtPredecesseurSoiree` sur cette branche.
Aucune fiche ni aucun compte rendu du lot 5 n'existe encore.
Ne pas lancer le codeur avant les réponses ci-dessous ; cette fiche devra alors être complétée sur les points signalés.

## 2. Objectif
Transmettre au joueur une prochaine soirée déjà posée et une carte principale comportant deux ou trois combats valides, issus du travail du prédécesseur.
Fondement, brief l.265 : « À la fin des six ans, la soirée suivante est posée au calendrier et deux ou trois combats principaux sont signés. Aucun combattant signé n'est blessé, suspendu ou en fin de contrat avant la soirée. »

## 3. Ce qui existe
- `mgmt-passe.js:61–83` : `mgmtPassePreparer(orgId,opts)` et `mgmtPasseSoiree(m,k)` ; `G.mgmt=m`, passé de 62 soirées par défaut, réglages communs à toutes les organisations.
- `mgmt-passe.js:87–113` : `mgmtPasseCloturer(m)`, idempotente ; re-signatures, recalage des jours à zéro, rétablissement caisse/popularité/salles, archive allégée et invalidation des rangs.
- Appelants : `mgmt-passe.js:232–236`, `mgmtPasseGenerer(orgId,opts)` (outils/tests), et `mgmt-nouvelle.js:149–154` (création par pas). Le point commun à modifier est la clôture, pas ces deux appelants.
- `mgmt-predecesseur.js:62–121` : `mgmtPredecesseurSoiree(m,k,reglages,mesure)` ; exige `G.mgmt===m`, pose la soirée, booke les réclamés puis les têtes d'affiche, valide Leïla, joue, ouvre la pile suivante.
  **Porte le booking du prédécesseur de `mgmt-predecesseur.js:76–109`**, pas une copie du joueur de mesure. Ne pas appeler la fonction entière pour préparer l'héritage : elle jouerait une soirée de plus.
- `mgmt-agenda.js:102–109` : `mgmtAgendaPoser(m,jour,taille,salle)` ; écrit l'agenda et synchronise les capacités. `mgmtAgendaSuivante(m)` (:35) est documentée comme appelée par l'interface, pas par le moteur.
- `mgmt-carte.js:344–367` : `mgmtBookMain(m,aid,bid)` rend le combat ou `null` ; garde catégorie, capacité, disponibilité et doublons ; gère les champions et leurs titres ; promeut les combattants, périme les propositions, propose les préliminaires seulement à carte pleine.
- `mgmt-carte.js:400–437` : `mgmtSelectable(m,f,pick)`, `mgmtCartRows(m)` ; réutiliser leur ordre et leurs gardes, jamais pousser directement dans `card.main`.
- `mgmt-corps.js:482–487` : `mgmtAvailable(m,f,contre)` ; suspension inclusive (`m.cycle<=f.susp`). La blessure du combat devient une suspension (:540–573), pas un champ persistant `f.injury` management.
- `mgmt-contrats.js:108–117,137–154` : restants en **combats**, refus d'attente, expiration après combat, départ d'attente excluant les combattants engagés. Pas d'échéance contractuelle en jours.
- `tests/helpers/jouerSoirees.js:5–31` sait déjà compléter une carte non vide ; il renouvelle artificiellement les contrats (:13). Ne pas s'en servir pour prouver leur validité initiale.
- Harnais : `tests/helpers/loadGame.js`, `newGameWindow({runMain:true})`, puis `win.eval` ; le chargement suit `index.html`.
- Tests réutilisables : `tests/mgmtPasse.test.js:18–26,69–109` (passé court, clôture, dates), `tests/mgmtPasseSixAns.test.js:16–49` (62 soirées et cache des résultats), `tests/mgmtPredecesseur.test.js:19–37` (joueur automatique).

## 4. Ce qui change — contrat à finaliser après les réponses
- `mgmt-predecesseur.js` : isoler une préparation partielle sans jeu ni nouvelle pile, avec une sélection issue de la politique du prédécesseur, nombre borné à 2 ou 3 ; conserver les gardes de booking et ajouter la garde contractuelle décidée en question 2.
  Signature prévue : `mgmtPredecesseurCarteHeritee(m,k,reglages)`.
  JSDoc prévu : `/** Prépare sans jouer la carte principale transmise au joueur ; exige G.mgmt===m. @param {object} m Partie après recalage et passage de témoin. @param {number} k Indice de la prochaine soirée. @param {object} [reglages] Politique du prédécesseur. @returns {number} Nombre de combats signés (2 ou 3 en génération normale). */`
  **Ne pas implémenter cette signature avant d'avoir fixé la sélection et le seuil de contrat.** Ne pas transformer les défauts du joueur de mesure pour contourner l'absence du lot 2 T3.
- `mgmt-passe.js` : appeler la préparation une seule fois dans `mgmtPasseCloturer`, après le recalage des dates, le rétablissement des salles/caisse et l'invalidation des rangs. Poser via `mgmtAgendaPoser`, jamais via une écriture directe de `cal.prochaines`.
  Conserver l'idempotence, les 62 soirées du passé et les jours négatifs ; ne pas jouer, avancer le temps, ouvrir une nouvelle pile ni écrire une sauvegarde.
  La date/taille et la règle 2/3 seront explicitement renseignées après la question 3 ; aucune boucle infinie ou remise à zéro médicale si le booking échoue.
- `tests/mgmtCarteHeritee.test.js` : tests rapides ci-dessous, sans fichier de données ou écran neuf.
- `tests/mgmtCarteHeriteeSixAns.test.js` : matrice complète ci-dessous ; ne pas remplacer les 62 soirées par un passé court pour l'acceptation.
- `tests/mgmtPasse.test.js:100` : remplacer l'attente « prochaines = 0 » par la prochaine soirée effectivement décidée ; l'appel ultérieur de `mgmtAgendaSuivante` reste un no-op.
- `index.html` : incrémenter seulement les `?v=` des scripts modifiés ; aucun déplacement, aucune nouvelle dépendance de chargement.

## 5. Sauvegarde
Changement de format : **non** ; `MGMT_SAVE_VERSION` reste **16** (`mgmt-bureau.js:85`). Aucune migration ni marque héritée en T1.
L'agenda et `card.main` sont déjà persistés. `validateMgmt` (`mgmt-save.js:252–267`) contrôle la forme, les slots et l'agenda, **pas** la disponibilité métier d'une paire.
Tester la validité métier séparément, puis l'aller-retour `mgmtSerialiser` → `mgmtParseAndValidate`. Ne pas re-booker lors d'un chargement, notamment pour les anciennes parties.

## 6. Textes
Aucun. Pas de commande à `@ecrivain` : raisons, promesses, marque et présentations relèvent d'autres tranches.

## 7. Écran
Aucun. Ne modifier aucun rendu ; T3 porte la marque, l'action de lecture et les dossiers visibles.

## 8. Tests — intitulés exacts et assertions
`tests/mgmtCarteHeritee.test.js` (graine **20261008**, passé réduit à **3 soirées**, sauf mention) :
1. `Monde lot 5 T1 — la clôture prépare sans jouer une carte partielle` : événements=3, passé=3, soirées joueur=0, cycle=4, jour=vieJour=0 ; principale de 2 ou 3 combats, taille principale=5 ; prochaine soirée strictement après jour 0 ; dates faites=[-105,-70,-35].
2. `Monde lot 5 T1 — la préparation respecte les indisponibilités et les contrats` : fixtures isolées blessure/suspension active, retraite, sans contrat, contrat épuisé, doublon ; aucun ne peut entrer dans les combats hérités. Ajouter le cas de frontière du seuil décidé en question 2, sans assimiler sélectionnabilité et contrat valable.
3. `Monde lot 5 T1 — la clôture est idempotente et déterministe` : seconde clôture, JSON et RNG inchangés ; deux fenêtres, même graine/org/3 soirées, JSON identiques.
4. `Monde lot 5 T1 — la carte héritée se sauvegarde sans se recréer` : validation vraie et aller-retour identique pour agenda et combats ; seconde lecture n'ajoute rien ; ancienne partie sans héritage reste vide au chargement.
5. `Monde lot 5 T1 — le joueur automatique finit la carte héritée et joue une soirée` : photographier les paires initiales, `jouerSoirees(win,1)` rend 1 ; événements=4, soirées joueur=1 ; chaque paire héritée figure une fois dans les combats nouveaux, principale de 5 combats. Vérifier les contrats **avant** l'aide qui les répare.

`tests/mgmtCarteHeriteeSixAns.test.js` :
6. `Monde lot 5 T1 — vingt graines et huit organisations héritent de combats valides` : graines **20261008 à 20261027 incluses**, huit IDs de `MGMT_ORGS`, **62 soirées** par création (160 cas). Pour chaque cas : événements=passé=62, soirées joueur=0, cycle=63, jour=0 ; agenda posé ; principale=2 ou 3 ; 4 ou 6 IDs distincts, même catégorie par paire, présents au roster, non retraités, non suspendus, sous contrat selon question 2 ; `validateMgmt(m)===true`.
7. `Monde lot 5 T1 — à graine égale les organisations héritent de combats différents` : réutiliser les 160 résultats ; pour chaque graine comparer les paires normalisées (ordre des côtés puis des combats), sans comparer seulement le champ organisation. Les huit cartes doivent être différentes deux à deux.
Les tests « places libres reçoivent des dossiers » et « promesses renvoient à une demande de l'archive » appartiennent respectivement à T3 et T2, pas à T1.

## 9. Vérification
Pendant le codage : `node --test tests/mgmtCarteHeritee.test.js tests/mgmtPasse.test.js tests/mgmtPredecesseur.test.js`.
Acceptation T1 : `node --test tests/mgmtCarteHeriteeSixAns.test.js`, puis `npm run check:rapide`.
Critère chiffré : **160/160** créations à 62 soirées satisfont les invariants ; **20/20** graines donnent huit cartes distinctes ; **0** échec ciblé ou rapide. Aucun seuil de temps nouveau et aucune mesure Monte Carlo demandée.
Ne pas lancer la matrice complète à chaque essai ; tests à 3 soirées pendant les ajustements. Fin de lot : `npm run check` complet.

## 10. Hors périmètre
Promesses/réponses (T2), marque et dossiers (T3), annulation/contrariété (T4), résolution de soirée (T5), textes, UI/CSS, règles du moteur, refonte contrats, migration des parties existantes, réécriture des six ans ou du monde extérieur.
Ne pas réaliser clandestinement le lot 2 T3, ni inventer un prédécesseur spécifique à chaque organisation.

## 11. Pièges
- Ordre réellement lu : `index.html:1135–1138`, agenda → save → prédécesseur → passé ; création :1158. Scope global partagé, pas de module.
- Le booking accepte les blessés si leur suspension est échue et ne teste pas `mgmtContratRestants` ; appeler `mgmtBookMain` seul n'établit pas la garantie du brief.
- Ne pas tester `mgmtSelectable` **après** signature pour affirmer la validité : un engagé est justement non sélectionnable.
- `mgmtBookMain` a des effets sur niveaux/propositions/titres ; pas de carte complète suivie d'un `slice(0,3)` : les effets des combats jetés resteraient.
- Ne pas signer avant le recalage : la nouvelle date et la salle appartiennent au calendrier/salles du premier jour. Invalider le cache de classement après les changements du passé.
- Toute nouvelle consommation RNG change la suite ; pas de `Math.random`, pas de `setSeed` dans le jeu, pas de choix piloté par durée ou horloge.
- L'aide de test modifie les contrats ; le cache des mesures de six ans contient des résultats, pas une fenêtre réutilisable pour jouer.
- Recherche `@eclaireur` tentée mais outil refusé (« Subagent depth limit reached ») ; références décisives lues directement, aucune exploration déléguée obtenue.

## 12. Questions pour Anthony
1. **Bloquante — dépendance.** Le lot 2 T3 (main du prédécesseur) n'est pas présent ici : faut-il le réaliser/fusionner avant T1, conformément au plan, ou autorises-tu la sélection commune actuelle pour cette tranche, avec l'orientation par organisation différée ?
2. **Bloquante — contrat.** « En fin de contrat avant la soirée » interdit-il seulement les sans-contrat/contrats épuisés, ou aussi un combattant dont le combat hérité serait le dernier (`mgmtContratRestants(f)===1`) ? Le modèle compte des combats, pas une date de fin ; quel seuil exact faut-il garantir ?
3. **À préciser avec la sélection.** Pour cette première soirée, confirmes-tu une petite soirée à J+35 (rythme actuel), et quel critère doit faire hériter de deux plutôt que trois combats : deux fixes admis, ou variation déterministe demandée ? Aucune règle n'est écrite dans le brief.

## 13. Décisions de Claude du 13/10/2026 (réponses aux questions du §12 ; Anthony laisse le technique à Claude)
1. **Dépendance** : le lot 2 T3 n'est PAS un prérequis. Utiliser la sélection commune actuelle du prédécesseur ; l'orientation par organisation viendra avec le lot 2 T3, plus tard.
2. **Contrat** : sont exclus les sans-contrat et les contrats épuisés (`mgmtContratRestants(f)<=0`). Un combattant dont le combat hérité est son DERNIER (`mgmtContratRestants(f)===1`) est ADMIS : l'événement « dernier combat de contrat » du lot 8 le signalera. Aucun autre seuil.
3. **Soirée** : une petite soirée à J+35 (rythme actuel). Le nombre de combats hérités (2 ou 3) est tiré par la RNG à graine du prédécesseur au moment de la clôture, de façon déterministe : même graine, même nombre. Jamais de `Math.random`.
