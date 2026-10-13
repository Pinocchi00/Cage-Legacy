STOP : planche non validée

# Monde lot 5 T3 — La carte du premier jour

## 1. Branche
`monde-lot-5-carte`, branche courante vérifiée le 13/10/2026.
Le plan ne nomme pas explicitement cette branche : piste A, lot 5 après les lots 1, 6 et 4 (`docs/PLAN-OPENCODE-MONDE.md:70,95–97`). Nom fixé par les fiches T1 et T2.
T1 et T2 sont présentes ; compte rendu T2 lu (§ Compte rendu). Aucun compte rendu T1 distinct trouvé.
**Cette fiche est un constat d'arrêt, pas une autorisation de coder une partie de T3.**

## 2. Objectif
Permettre de reconnaître et lire les combats hérités, puis de finir la première carte avec les dossiers de l'adjointe sans passer par la liste.
Brief, l.267 : « Les combats hérités portent une marque qui dit qu'ils viennent d'avant, et l'action “Lire la présentation”. Les places libres montrent les dossiers. »

## 3. Ce qui existe
- `mgmt-predecesseur.js:97–109`, `mgmtPredecesseurCarteHeritee(m,k,reglages)` : signe deux ou trois combats via `mgmtPredecesseurBooker`, sans jouer ; aucune marque d'origine n'y est ajoutée.
- `mgmt-carte-cadre.js:90–113`, `mgmtCarteCombatLigne(m,i,fight,etatMain)` : rend les combats confirmés et les places « À composer ». Réutiliser ce rendu actif, pas l'ancien `mgmtCartSlotHtml` de `mgmt-ecran-carte.js:116–137`.
- `mgmt-carte-cadre.js:145–206`, `scr_mgmt_carte_cadre()` : cinq places à gauche, comparaison au centre, liste à droite ; remplace `SCREENS.mgmt_carte` l.206. Les places libres n'ouvrent actuellement aucun dossier.
- `mgmt-carte-cadre.js:216–223`, `CL.mgmtCarteModifie(i)` : cliquer un combat confirmé le retire réellement via `mgmtRemoveMain`, puis sauvegarde. Ce n'est PAS une action de lecture.
- `mgmt-carte-cadre.js:98–101` : numéro et noms appellent cette modification ; bouton × appelle `CL.mgmtUnbook`. L'ouverture d'une présentation ne doit appeler ni l'un ni l'autre.
- `mgmt-carte-cadre.js:100,108,141` : `mfMarqueNom` signale des faits sur une personne ; ne pas détourner cette marque pour l'origine d'un combat.
- `tests/mgmtCarteHeritee.test.js:8–11,15–22,71–82,87–98` : modèle de génération courte, sauvegarde et joueur automatique. **Porte `partie()`**, graine 20261008 et trois soirées, pour les futures fixtures rapides T3.
- `index.html:1143,1161,1166` : ancien écran, contrôleur commun, puis cadre Carte ; le harnais charge cet ordre réel.
- Planches validées de destination : `maquettes/monde/MondePresentationCombat.dc.html`, `MondeDossiersCombattant.dc.html`, `MondeDossiersAdversaire.dc.html` (plan l.119–127 ; `maquettes/monde/LISEZ-MOI.md:3–12`). Elles ne sont pas une planche de la Carte du premier jour.

## 4. Ce qui change
**Aucun fichier de code maintenant.** Il manque la composition validée des nouvelles marques et actions sur la Carte.
Après validation, réécrire cette fiche avant de lancer le codeur : fichiers exacts, portes réelles des lots 3/4 et leurs appelants, positions/styles de la planche, signatures nouvelles et JSDoc complets.
Ne pas créer ici une fonction de présentation ou un second système de dossiers pour remplacer une dépendance absente.
Ne pas livrer la seule provenance technique en avance : elle doit suivre le contrat complet de cette tranche d'écran.

## 5. Sauvegarde
**Non pour cette fiche arrêtée** : `MGMT_SAVE_VERSION` reste 16 ; aucune migration ni modification de validation.
Le format de provenance à implémenter sera fixé dans la fiche débloquée après lecture des portes de sauvegarde ; ne pas le déduire de `jour===0`, du numéro de cycle ou de la position du combat.

## 6. Textes
Aucun à produire maintenant ; pas de commande à `@ecrivain` dans une tranche arrêtée.
« Lire la présentation » est déjà prescrit par le brief, pas une réplique à inventer.
La planche doit fixer le libellé exact de provenance ; aucun portrait, commentaire ou dialogue du prédécesseur à inventer.
Les textes des destinations restent ceux des lots 3 et 4, sans nouvelle variante T3.

## 7. Écran
**STOP : planche non validée.**
Le plan liste sept planches validées, aucune pour la Carte du premier jour (`docs/PLAN-OPENCODE-MONDE.md:107–127`).
`mgmt-carte-cadre.js:2–10` renvoie à l'ancienne planche « Management — Booking » ; elle décrit « confirmé / à confirmer / à composer », pas la provenance, la lecture ni les dossiers dans les places libres.
Les planches de présentation et de dossiers valident les destinations, non ces nouveaux gestes de départ.
Charte §3, l.75–78 : « Nouvel écran ou geste nouveau → maquette d'abord. » Aucun placement, badge, bouton ou raccourci ne doit être improvisé.

## 8. Tests
Fichier prévu après déblocage : `tests/mgmtCartePremierJour.test.js`. Aucun test à écrire ou exécuter en application de cette fiche arrêtée.
Intitulés et assertions métier à conserver dans la fiche débloquée (graine **20261008**, **3 soirées** de passé, **0 soirée joueur** au départ) :
1. `Monde lot 5 T3 — seuls les combats hérités portent la provenance` : 2 ou 3 combats hérités, autant de marques ; un combat signé ensuite par le joueur n'en porte aucune ; aucune marque ajoutée aux anciennes parties par lecture.
2. `Monde lot 5 T3 — lire une présentation ne modifie pas la carte` : une action « Lire la présentation » par combat hérité ; action réelle vers la bonne paire ; carte, agenda, contrats, faits et RNG inchangés ; retour vers la Carte sans retrait.
3. `Monde lot 5 T3 — les places libres reçoivent des dossiers sans ouvrir la liste` : **5 moins le nombre hérité** places libres accessibles aux dossiers dès l'arrivée, sans demande préalable ; compléter via les portes de dossiers, principale finale=5, cinq paires valides, aucune ouverture de la liste et toutes les paires héritées conservées. C'est le test du brief l.274, pas un test de remplissage automatique.
4. `Monde lot 5 T3 — la lecture répétée ne crée aucun héritage` : deux rendus, deux ouvertures/retours et aller-retour de sauvegarde ; mêmes paires et mêmes marques, aucun combat supplémentaire, aucune consommation RNG de rendu.
Les sélecteurs DOM, actions de contrôleur et données de provenance devront être nommés explicitement après validation ; aucun test fictif de porte inexistante.
Les tests du brief sur les cartes valides/différentes et le joueur automatique restent en T1 ; liens de promesses restent en T2. Ne pas dupliquer les matrices.

## 9. Vérification
Après déblocage seulement : `node --test tests/mgmtCartePremierJour.test.js tests/mgmtCarteHeritee.test.js`, puis `npm run check:rapide`.
Critère métier : **4/4** tests T3 verts, principale finie à **5/5**, **0** paire héritée perdue, **0** mutation liée à la lecture ; comparaison à la future planche et contrôle souris/clavier aux trois largeurs de la charte.
Aucune mesure Monte Carlo. Pas de génération de six ans nécessaire aux essais UI ; si un contrôle lent est ajouté lors de la réécriture, plafond **2 graines × 8 organisations = 16 créations**, décision T2 l.97–98, exécution à part.
La présente livraison est documentaire : vérifier son diff et son plafond de 150 lignes, pas lancer la suite du jeu.

## 10. Hors périmètre
Annulation/contrariété/confirmation (T4), déroulement de soirée (T5), réponses aux demandes (T2), politique des prédécesseurs, contrats, moteur, textes des présentations, redesign des écrans de destination.
Ne toucher ni au code ni à la modification locale préexistante de `tests/mgmtPredecesseurDemandes.test.js` ; commiter cette fiche seule.

## 11. Pièges
- L'ancien écran Carte n'est plus le rendu enregistré : modifier seulement `mgmt-ecran-carte.js` serait invisible dans le cadre.
- Les clics actuels sur les noms retirent le combat ; les réutiliser pour lire ferait une annulation silencieuse, hors T3 et contraire au parcours voulu.
- Le joueur automatique T1 complète via la liste et répare des contrats : son succès ne prouve pas le parcours dossiers du brief.
- Une place libre n'est pas un combat persistant ; ne jamais réserver ni signer une paire au simple rendu d'un dossier.
- `esc()` obligatoire sur toutes les données joueur ; aucune RNG dans les rendus, aucun `Math.random()`.
- `@eclaireur` demandé, mais indisponible (`Subagent depth limit reached (1)`) ; passages décisifs lus directement, aucun résultat délégué revendiqué.

## 12. Décisions et questions pour Anthony
- **Décision technique** : garder les invariants, tests courts et portes de booking existantes ; aucun seuil nouveau. Le STOP porte exclusivement sur un geste visible non maquetté, pas sur une règle technique.
- **Question pour Anthony** : faire produire puis valider une planche de la Carte du premier jour montrant les 2 ou 3 combats hérités, leur libellé exact de provenance, l'action « Lire la présentation » et l'accès immédiat aux dossiers des places libres, avec le retour depuis ces destinations. Quel fichier de planche validée doit faire foi pour T3 ?
- Après cette validation, la fiche est réécrite complètement ; le codeur ne doit pas compléter lui-même les points suspendus.
