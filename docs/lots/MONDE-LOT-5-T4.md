
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
Les fichiers exacts, signatures et sélecteurs sont à choisir par le codeur d’après le code existant.
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
Pas de planche : décision du 13/10 (voir la fin de la fiche), STOP LEVÉ.
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
Code la tranche maintenant (la modification locale de `tests/mgmtPredecesseurDemandes.test.js` peut être commitée avec ta tranche : c’est l’alignement version 17).
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
- Aucun seuil ou choix de compatibilité technique n'est renvoyé à Anthony. Le STOP est levé.

## DÉCISION du 13/10/2026 (Claude) — le STOP « planche non validée » est levé
Pas de planche : la tranche réutilise la grammaire EXISTANTE (composants de l'écran Carte, mécanisme de contrariété déjà codé pour les retraits ; vérifie par grep `mgmtContrarie` et le flux « retrait » de `mgmt-carte.js`). Aucune fenêtre par-dessus l'écran : la confirmation est EN LIGNE, dans l'emplacement du combat.
1. Sur un combat hérité (provenance du T3) de la carte principale, une action « Annuler ce combat » (bouton du composant, touche libre vérifiée dans `keysRegister`).
2. Premier appui : l'emplacement affiche en ligne l'avertissement « Annuler ce combat contrarie {a} et {b} : ils en gardent une contrariété. » et deux boutons « Confirmer l'annulation » et « Renoncer » (Échap = renoncer). Textes : propositions Claude, `relu:false`, 22 px minimum, épicènes.
3. Confirmer : le combat est retiré, les deux combattants reçoivent la contrariété EXISTANTE (même mécanisme que l'annulation d'un combat signé), la place redevient libre ; la provenance du combat disparaît ; retour à la Carte au même curseur.
4. Renoncer : rien ne change.
5. Tests : l'avertissement précède toute écriture ; confirmer retire le combat et pose les deux contrariétés ; renoncer ne change aucun état ; un combat non hérité n'offre pas cette action ; version de sauvegarde inchangée (17).
Plus aucune question : code, vérifie (check:rapide, jamais plus de 16 créations de six ans), commit « Monde lot 5 T4 : annuler un combat hérité ».

## DÉCISION FINALE du 13/10/2026 (Claude) — elle prime sur tout ce qui précède, plus aucune question
1. **STOP levé, planche dispensée** : confirmation en ligne dans la grammaire existante (décision ci-dessus). Plus rien à valider.
2. **Version 18 : OUI** (migration 17 → 18 seulement numéro de version, vocabulaire `contrarie.why` étendu à `annulation-heritee`, aucune rétroactivité), avec mise à jour des assertions de version 17 → 18 dans les tests de partie neuve, citant « décision du 13/10/2026, lot 5 T4 ». Les fixtures 14 à 17 migrent sans perte jusqu'à 18.
3. **Portes à protéger** : `CL.mgmtUnbook(i)` (bouton ×, touches 1 à 5) et `CL.mgmtCarteModifie(i)` ne retirent plus immédiatement un combat HÉRITÉ : ils passent par la confirmation en ligne. Pour un combat non hérité, rien ne change.
4. **Touche d'annulation** : `X` si libre dans `keysRegister`, sinon la première libre parmi `K`, `Suppr` ; documente le choix dans le compte rendu.
5. Les six écarts du relecteur : traite-les dans la même tranche si ce sont des défauts de code ou de test ; liste dans le compte rendu ceux que tu juges hors fiche, sans arrêter.
Code, vérifie, commit « Monde lot 5 T4 : annuler un combat hérité » (sans « inachevé »).

## Compte rendu

- Décision finale du 13/10 appliquée : confirmation en ligne, pas de fenêtre ni de nouvelle jauge ; primitive `mgmtRemoveMain` inchangée.
- `mgmt-carte-cadre.js` : avertissement à la place du combat, libellés de la décision repris exactement et `relu:false`, confirmation commune, garde index/identité/provenance et reprise de modification.
- `mgmt-screens.js` : les retraits hérités passent par cette porte ; Échap renonce sans réinitialiser le choix ni le curseur.
- `ui-cadre.css` : disposition dans le flux, boutons repliables et corps de 22 px minimum.
- `mgmt-bureau.js`, `mgmt-save.js` : version 18, validation du motif exact `annulation-heritee`, migration 17 → 18 limitée au numéro ; aucun fait rétroactif. L'attente reste hors sauvegarde.
- `index.html`, `sw.js` : versions de cache montées par `tools/_bump.js`, ordre des scripts conservé ; `index.html` reste LF.
- `tests/mgmtAnnulationHeritee.test.js`, `package.json` : sept tests dédiés, inscrits dans `test` et `test:watch` ; fixture `partie()` reprise avec graine 20261008 et trois soirées de passé.
- Assertions de version alignées, avec citation de la décision T4 : `tests/mgmtCartePremierJour.test.js`, `mgmtEmplacements.test.js`, `mgmtEffectifs.test.js`, `mgmtMarque.test.js`, `mgmtNiveau.test.js`, `mgmtHumanite.test.js`, `mgmtPredecesseurDemandes.test.js`.
- Touche retenue : **X**, libre dans la carte `keysRegister('mgmt_carte')` ; elle vise le combat hérité du combattant au curseur de la liste. Les chiffres 1–5 restent protégés. Entrée confirme l'attente ; les boutons gardent leur activation native, y compris Renoncer au clavier.

Tests ajoutés (intitulés exacts) :
1. `Monde lot 5 T4 — avertir avant de retirer un combat hérité`
2. `Monde lot 5 T4 — renoncer conserve exactement le combat hérité`
3. `Monde lot 5 T4 — confirmer contrarie exactement les deux combattants`
4. `Monde lot 5 T4 — souris clavier et modification ne contournent pas la confirmation`
5. `Monde lot 5 T4 — une confirmation périmée ou répétée ne retire aucun autre combat`
6. `Monde lot 5 T4 — un combat joueur reste retirable sans contrariété héritée`
7. `Monde lot 5 T4 — la contrariété survit à la sauvegarde sans se recréer`

Vérification et écarts :
- Tests T4 : **7/7 verts** ; commande ciblée T4/T3/Card/Promesses : **71/71 verts**. Dernière relance T4 après ajout d'Entrée : 7/7.
- `@eclaireur`, `@ecrivain`, `@verif` et `@relecteur` sollicités mais indisponibles (`Subagent depth limit reached (1)`). Aucun verdict indépendant revendiqué ; aucun texte nouveau inventé, seuls les libellés Claude de la fiche sont repris.
- Repli demandé : `node tools/verif-versions.js` sans écart ; `npm run check:rapide` **VERT, 970/970 tests**, lint et lint:content inclus. Première passe rouge seulement sur deux assertions v17 supplémentaires, alignées par la décision finale puis revérifiées.
- Pas de check complet ni de création de monde de six ans pour les essais T4. Les tests lents écartés restent à lancer au bilan du lot.
- Tests souris simulés via les actions HTML, clavier via la carte existante ; pas de captures navigateur à 1280/1440/1920 px réalisées : conformité visuelle à vérifier séparément.
- Les « six écarts du relecteur » mentionnés par la décision finale ne sont pas détaillés dans cette fiche ; pas de liste inventée. Relecteur indisponible pour les restituer.
- `mgmt-retraits-data.js` et `mgmt-voix-data.js` : modifications de fins de ligne dues à la vérification, diff sans espaces vide, exclues du commit.
- Questions pour Anthony : aucune décision fonctionnelle ouverte ; restent la vérification visuelle et la relecture indépendante indisponibles dans cette session.

## Compte rendu — reprise des écarts du relecteur

- `mgmt-carte-cadre.js` : le bouton « Annuler ce combat » arrête la propagation d'Entrée/Espace comme Confirmer/Renoncer, sans empêcher l'activation native. `index.html` et `sw.js` : versions montées par `tools/_bump.js` ; ordre inchangé, index LF.
- `tests/mgmtAnnulationHeritee.test.js` : intitulés des sept tests conservés. Test 4 : cinq fenêtres/parties indépendantes, carte complétée par `mgmtBookMain`, paire héritée déplacée à chaque index ; validation vraie et dix identifiants distincts. Chaque événement clavier réel 1–5 laisse le JSON entier, les faits, les sauvegardes et la RNG inchangés avant confirmation.
- Test 4 : Entrée est émise depuis le bouton focalisé et traverse le véritable écouteur DOM ; absence de `preventDefault` et de mutation vérifiée. jsdom ne génère pas l'activation native : le clic est ensuite explicite, ce qui ne remplace pas la preuve navigateur attendue.
- Test 3 : photographie JSON complète avant confirmation ; état attendu obtenu uniquement par retrait ciblé et ajout des deux faits. Égalité complète après confirmation, avec conservation des références roster/contrats, agenda et pile (demandes) ; les promesses/faits préexistants sont couverts par l'égalité complète.
- Vérification : T4 **7/7 verts** ; `npm run check:rapide` **970/970 verts**, lint et lint:content inclus ; `node tools/verif-versions.js` sans écart. Première tentative interrompue par le délai outil de 120 s, relance à 600 s réussie. Aucune nouvelle migration (version 18 conservée).
- Agents `@eclaireur`, `@verif`, `@relecteur` sollicités mais indisponibles (`Subagent depth limit reached (1)`) ; contrôles exécutés directement, aucun verdict indépendant revendiqué.
- **Écart 4 non résolu** : aucune capture ni contrôle navigateur à 1280/1440/1920 px, donc ni absence de chevauchement/découpe ni console navigateur sans erreur certifiées. Playwright, @playwright/test et Puppeteer non résolus dans l'environnement ; installation demandée mais refusée par les permissions `npm install*`. Aucun contournement tenté. Les tests jsdom ne sont pas présentés comme preuve visuelle.
- Questions pour Anthony : fournir un outil navigateur autorisé ou les captures/contrôles manuels pour terminer l'écart 4. Reprise partielle, pas d'acceptation finale revendiquée. Fichiers de données réécrits uniquement en fins de ligne exclus du commit.

## ACCEPTATION du 13/10/2026 par Claude (superviseur)
T4 est **ACCEPTÉE** : check:rapide vert (970/970), versions vérifiées, les portes × et 1 à 5 passent par la confirmation. Le contrôle navigateur aux largeurs 1280, 1440 et 1920 px (écart 4 du relecteur) est fait par Claude au bilan du lot 5, pas par le codeur. Passe à T5.
