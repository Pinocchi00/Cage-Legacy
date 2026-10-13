
# Monde lot 5 T4 — Annuler un combat hérité

## 1. Branche
`monde-lot-5-carte`, branche courante vérifiée le 13/10/2026.
Le plan ne donne pas de nom de branche pour le lot 5 : piste A, après les lots 1, 6 et 4 (`docs/PLAN-OPENCODE-MONDE.md:70,95–97`). Nom établi par T1 à T3.
Fiches T1, T2, T3 et leurs comptes rendus intégrés lus ; T3 acceptée par le superviseur (§ final), provenance `herite:true` et sauvegarde v17 présentes.
Cette fiche constate un arrêt de T4 : **aucun code, aucun texte, aucun test à produire avant sa réécriture après validation**.

## 2. Objectif
Permettre d'annuler un combat hérité après un avertissement explicite, en conservant une contrariété pour chacun des deux combattants.
Brief, lot 5, l.268 : « Décidé le 09/10/2026 : le joueur peut l'annuler, les deux combattants en gardent une contrariété, et l'écran le dit clairement avant la confirmation. »

## 3. Ce qui existe
- `mgmt-carte.js:386–394`, `mgmtRemoveMain(m,idx)` : retrait par `splice`, booléen de succès ; actuellement aucune ligne/fait écrit. Réutiliser cette primitive, sans lui imposer une confirmation UI.
- `mgmt-screens.js:446–450`, `CL.mgmtUnbook(i)` : retrait immédiat, sauvegarde et rendu. Appelé par bouton × et touches 1 à 5.
- `mgmt-carte-cadre.js:100–103`, `mgmtCarteCombatLigne` : numéro et noms appellent `CL.mgmtCarteModifie(i)` ; × appelle `CL.mgmtUnbook(i)`.
- `mgmt-carte-cadre.js:218–225`, `CL.mgmtCarteModifie(i)` : retire immédiatement, sauvegarde, puis prépare la même paire. C'est une deuxième porte d'annulation réelle.
- `mgmt-carte-cadre.js:249–265` : touches 1 à 5 vers `mgmtUnbook`, Échap/Retour arrière vers `mgmtCarteLeave`. Ne pas laisser ces chemins contourner le futur avertissement.
- `mgmt-promesses.js:223–232`, `mgmtContrarieCharge(m,f,fin,fenetre)` : charge dérivée des faits `contrarie`, poids `p`, fenêtre existante. Réutiliser ce modèle ; pas de nouvelle jauge ni mutation directe de loyauté.
- `mgmt-promesses.js:238–265`, `mgmtContrariesApresSoiree(m,combats)` : exemples de deux faits, un par combattant ; **ne pas appeler cette fonction de fin de soirée pour annuler**.
- `mgmt-save.js:323–331` : validation des faits ; `why` fermé à `titre/jeune/coequipier/fratrie`, `p` entier de 10 à 30. Un motif d'annulation nouveau doit être explicitement admis.
- `mgmt-bureau.js:86` : `MGMT_SAVE_VERSION=17`.
- **Porte `partie()` de `tests/mgmtCartePremierJour.test.js:7–12`** : graine 20261008, Split, trois soirées de passé, aucune soirée joueur. Réutiliser pour les futures fixtures T4.
- `tests/mgmtCartePremierJour.test.js:58–69` : retrait/rebooking et changement de titre effacent la provenance ; maintenir ces assertions.
- `tests/mgmtPromesses.test.js:112–128` : modèle de preuve de charge et de sortie de fenêtre. `tests/mgmtCard.test.js:1121–1122` : retrait joueur existant à préserver.

## 4. Ce qui change
**Aucun fichier de code dans cette fiche arrêtée.** Le geste de confirmation n'est pas maquetté ; ne pas livrer séparément une pénalité silencieuse.
Après validation, réécrire cette fiche avec les fichiers exacts, signatures et JSDoc des portes de demande/confirmation, sélecteurs DOM, touches et valeurs de la planche.
La future implémentation devra couvrir les deux contrôleurs ci-dessus, conserver `mgmtRemoveMain` comme primitive sans écran, et écrire les faits uniquement après confirmation réussie.
Aucune nouvelle signature n'est autorisée maintenant : ne pas inventer une boîte native `confirm()`, un écran, un dialogue ou une fonction de contrôleur à partir de ce constat.

## 5. Sauvegarde
**Non pour la tranche arrêtée** : version 17 inchangée, aucune migration ni validation modifiée maintenant.
Décision technique pour la fiche débloquée : **oui, version 18**, puisque le vocabulaire persistant de `contrarie.why` s'étend à `annulation-heritee`.
Migration 17 → 18 : uniquement numéro de version ; conserver carte, provenance, faits, archive, contrats et agenda ; aucun fait rétroactif.
Validation future : ajouter exactement ce motif aux valeurs admises ; conserver les gardes existantes d'identifiant/cycle/poids (entier 10 à 30). Le producteur T4 écrit toujours `p:10`.
Ne pas persister un état de confirmation en attente. Les anciennes sauvegardes sans provenance ne deviennent pas héritées.

## 6. Textes
Aucun à produire dans cette fiche arrêtée ; aucune commande à `@ecrivain` maintenant.
Le sens de l'avertissement est fixé par le brief, mais sa formulation visible et les actions doivent accompagner la planche validée. Ne pas inventer de dialogue, de réaction individuelle ou de voix du prédécesseur.
Après validation, la fiche réécrite indiquera les libellés validés et, si nécessaire, la commande à `@ecrivain` (fichier/variable/nombre/famille/féminin), après lecture des références de voix.

## 7. Écran
**STOP : planche non validée.** Aucun chemin de planche validée ne couvre T4.
Le plan l.112–127 et `maquettes/monde/LISEZ-MOI.md:3–12` valident sept destinations (nouvelle partie, présentations, dossiers, Accueil), pas l'avertissement d'annulation sur la Carte.
La dérogation T3 (§ décision et acceptation finales) autorise seulement son marquage minimal : **elle ne valide pas la confirmation T4**.
Charte l.75–78 : « Nouvel écran ou geste nouveau → maquette d'abord. » La planche doit montrer la paire visée, la conséquence pour les deux combattants avant validation, confirmer/renoncer, et le retour à la Carte.
Le brief impose une confirmation malgré la règle générale S6 : son avertissement ne doit pas être remplacé par une pénalité après clic. Modalité et placement restent à valider visuellement, pas à choisir par le codeur.

## 8. Tests
Fichier prévu après déblocage : `tests/mgmtAnnulationHeritee.test.js`. Aucun test à écrire maintenant.
Fixture commune : porte `partie()`, graine **20261008**, **3 soirées de passé**, **0 soirée joueur**, cycle=4 ; photographier la paire et le JSON avant chaque action.
Intitulés exacts à reprendre lors de la réécriture, avec sélecteurs/actions précisés par la planche :
1. `Monde lot 5 T4 — avertir avant de retirer un combat hérité` : demande via × puis dans une fixture distincte via modification ; paire et conséquence pour chacun visibles avant confirmation ; carte/faits/contrats/agenda/RNG inchangés, zéro sauvegarde déclenchée.
2. `Monde lot 5 T4 — renoncer conserve exactement le combat hérité` : renoncement souris et Échap ; JSON et RNG identiques, marque conservée, zéro fait ajouté, zéro sauvegarde.
3. `Monde lot 5 T4 — confirmer contrarie exactement les deux combattants` : principale de n à n−1 ; exactement deux faits `{c:4,k:'contrarie',a:<id>,p:10,why:'annulation-heritee'}`, un par ID photographié ; charge de chacun augmentée de 10 via `mgmtContrarieCharge`, tiers inchangés ; une sauvegarde, zéro soirée jouée, RNG inchangée.
4. `Monde lot 5 T4 — souris clavier et modification ne contournent pas la confirmation` : ×, numéro, noms et touches 1 à 5 sur des fixtures indépendantes ; zéro retrait avant validation ; modification confirmée prépare le premier combattant et vise l'ancien adversaire comme aujourd'hui.
5. `Monde lot 5 T4 — une confirmation périmée ou répétée ne retire aucun autre combat` : après une première confirmation, réitération sans effet ; si la paire visée n'est plus au même index, ne retirer ni elle ni sa remplaçante ; zéro fait/sauvegarde supplémentaire.
6. `Monde lot 5 T4 — un combat joueur reste retirable sans contrariété héritée` : signer une paire sans `herite`, retirer via la porte existante ; un retrait, zéro fait T4, pas d'avertissement T4. Rebooker la paire héritée annulée ne restaure ni marque ni nouvelle pénalité.
7. `Monde lot 5 T4 — la contrariété survit à la sauvegarde sans se recréer` : aller-retour `mgmtSerialiser` → `mgmtParseAndValidate` ; deux faits identiques et retrait conservé, validation vraie ; seconde lecture zéro ajout. Fixture v17 migre à 18 sans fait créé ; motif inconnu et poids hors 10–30 rejetés.
Les tests généraux du brief l.273–277 restent couverts par T1/T2/T3 ; pas de matrice six ans nouvelle pour T4, ni de promesse fabriquée pour l'annulation.

## 9. Vérification
Maintenant : diff documentaire et plafond **150 lignes** seulement ; aucune suite de code à lancer.
Après réécriture : `node --test tests/mgmtAnnulationHeritee.test.js tests/mgmtCartePremierJour.test.js tests/mgmtCard.test.js tests/mgmtPromesses.test.js`, puis `npm run check:rapide`.
Critère futur : **7/7 tests T4 verts**, **2** faits par confirmation héritée, **0** mutation avant confirmation/après renoncement, **0** retrait d'une autre paire, **0** consommation RNG.
Contrôle souris/clavier et captures à **1280/1440/1920 px**, console sans erreur, conformité aux valeurs de la planche. Pas de mesure Monte Carlo ni de génération de six ans nécessaire.

## 10. Hors périmètre
Ne toucher aucun code maintenant, ni la modification locale préexistante de `tests/mgmtPredecesseurDemandes.test.js` ; commiter cette fiche seule.
Après déblocage : pas de refonte des contrats, camps, moteur, promesses, pénalités des combats joueur, présentations/dossiers absents, déroulement T5 ou politique du prédécesseur.
Ne pas rouvrir les écarts T3 acceptés ; ne pas appliquer la pénalité au simple changement de titre, à un rendu ou à une lecture de sauvegarde.

## 11. Pièges
- `splice` décale les indices : la future confirmation doit mémoriser l'identité de la paire et vérifier index ET paire, non retenir l'index seul.
- Modifier un combat le retire aujourd'hui : protéger seulement × laisserait une annulation silencieuse par noms/numéro.
- `mgmtRemoveMain` est aussi appelée directement par les tests ; lui ajouter un écran casserait son contrat et les outils.
- Ordre vérifié dans `index.html:1120,1127,1161,1166` : carte, promesses, contrôleur commun, cadre actif. Pas de déplacement ni dépendance exécutée au chargement vers un script ultérieur.
- Scope global partagé, harnais lisant cet ordre ; aucune RNG de rendu, aucun `Math.random`, `esc()` sur les noms et données joueur.
- `@eclaireur` sollicité mais indisponible (`Subagent depth limit reached (1)`) ; recherches ciblées et passages décisifs lus directement, aucun résultat délégué revendiqué.

## 12. Décisions et questions pour Anthony
- **Poids tranché : 10 par combattant**, plus petit poids déjà valide et égal au refus existant ; annuler n'est pas rompre automatiquement une promesse. Aucun nouveau seuil de loyauté ni malus contractuel.
- **Population tranchée : uniquement la paire dont `herite===true` au moment de la confirmation**, un fait par personne, même cycle ; pas de condition de trait ni de nouvelle RNG. Cela suit strictement le périmètre du brief.
- **Primitive pure conservée**, effet de contrariété dans la future porte de confirmation commune aux deux contrôleurs : évite de pénaliser les appels techniques/tests et empêche les contournements UI.
- **Confirmation périmée rejetée**, sans rechercher la paire ailleurs : défaut le plus simple et sûr face au décalage des indices. Contrats, agenda, demandes et promesses inchangés.
- **Version future 18 et migration sans rétroactivité** : extension explicite du vocabulaire validé, sans fabriquer un scénario historique.
- **Question pour Anthony (seule bloquante)** : faire produire puis valider la planche du geste T4 sur la Carte (paire, avertissement sur les deux contrariétés, libellés confirmer/renoncer, souris/clavier, retour ou reprise de modification) ; quel fichier de planche validée doit faire foi ?
- Aucun seuil ou choix de compatibilité technique n'est renvoyé à Anthony. Après validation, réécrire cette fiche avant de lancer le codeur ; ce STOP n'autorise aucune livraison partielle.

## DÉCISION du 13/10/2026 (Claude) — le STOP « planche non validée » est levé
Pas de planche : la tranche réutilise la grammaire EXISTANTE (composants de l'écran Carte, mécanisme de contrariété déjà codé pour les retraits ; vérifie par grep `mgmtContrarie` et le flux « retrait » de `mgmt-carte.js`). Aucune fenêtre par-dessus l'écran : la confirmation est EN LIGNE, dans l'emplacement du combat.
1. Sur un combat hérité (provenance du T3) de la carte principale, une action « Annuler ce combat » (bouton du composant, touche libre vérifiée dans `keysRegister`).
2. Premier appui : l'emplacement affiche en ligne l'avertissement « Annuler ce combat contrarie {a} et {b} : ils en gardent une contrariété. » et deux boutons « Confirmer l'annulation » et « Renoncer » (Échap = renoncer). Textes : propositions Claude, `relu:false`, 22 px minimum, épicènes.
3. Confirmer : le combat est retiré, les deux combattants reçoivent la contrariété EXISTANTE (même mécanisme que l'annulation d'un combat signé), la place redevient libre ; la provenance du combat disparaît ; retour à la Carte au même curseur.
4. Renoncer : rien ne change.
5. Tests : l'avertissement précède toute écriture ; confirmer retire le combat et pose les deux contrariétés ; renoncer ne change aucun état ; un combat non hérité n'offre pas cette action ; version de sauvegarde inchangée (17).
Plus aucune question : code, vérifie (check:rapide, jamais plus de 16 créations de six ans), commit « Monde lot 5 T4 : annuler un combat hérité ».
