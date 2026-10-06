# Brief du 06/10/2026 — Lot 1 : les trois emplacements

Source : le « Brief complet » d'Anthony du 06/10/2026 (douze lots) et le canvas de
maquettes, planche « Management — Choisir une partie ». Le brief remplace le
« Brief des ajouts » du 03/10. Ce document dit ce qui a été livré pour son lot 1,
les écarts, et ce qui reste à trancher. **Numérotation** : les douze lots du brief
sont une nouvelle série ; les lots 0 à 5 du 17/09 restent valables comme historique.

## Ce qui est livré (codé par Claude, 06/10)

- **Trois emplacements.** `mgmt-save.js`, ancre `MGMT_BRIEF_LOT1_EMPLACEMENTS`.
  L'emplacement 1 garde la clé historique `cage-legacy-mgmt` et son secours : **aucune
  donnée n'est déplacée**, la partie d'avant le lot y est déjà. Les emplacements 2 et 3
  ont `cage-legacy-mgmt-2`, `cage-legacy-mgmt-3` et leur secours `…_backup`.
- **Un emplacement actif** (`MGMT_SLOT`). `saveMgmt()`, `loadMgmt()` et `hasMgmt()`
  travaillent sur lui. `CL.mgmtEnter(n)` ouvre l'emplacement `n` ; **sans argument,
  l'emplacement 1**.
- **Changer d'emplacement** (`mgmtSlotOuvrir`, `mgmt-emplacements.js`) vide `G.mgmt` et
  remet à zéro les dix états d'interface (`mgmtInterfaceRaz`) : sans cela la partie de
  l'un s'enregistrerait par-dessus celle de l'autre.
- **Le registre**, hors de l'état de la partie (`cage-legacy-mgmt-registre`) : la dernière
  partie jouée et la date du dernier enregistrement de chaque emplacement. Absent ou
  illisible, rien ne plante : la date ne s'affiche pas. **Le format de la partie ne
  change pas, `MGMT_SAVE_VERSION` reste à 13, aucune migration.**
- **L'écran « Choisis une partie »** (`scr_mgmt_parties`) : un emplacement occupé montre
  l'organisation, le numéro de la prochaine soirée, les soirées jouées, la caisse et la
  date de la dernière fois ; un vide, « Ici, tu peux lancer une nouvelle partie ».
  Entrée reprend ou lance, ← → choisissent, Suppr efface **après confirmation**, Échap
  revient à l'accueil ; tout se fait aussi à la souris. Composants de la charte
  actuelle : **l'habillage du canvas arrive au lot 4**.
- **L'accueil** : Management ouvre cet écran ; « Reprendre » reprend la dernière partie
  jouée (ou, si elle a été effacée, le premier emplacement occupé).
- Une nouvelle partie est une partie Split (le choix de l'organisation : lot 5).

## Écarts et points signalés

- **Un test existant a dû changer**, contre le critère « les 589 tests passent sans être
  modifiés » : `mgmtBureau.test.js`, « T8a accueil — partie absente », exigeait que le
  bouton Management appelle `CL.mgmtEnter()`. Le brief décide que ce bouton ouvre
  « Choisis une partie » : l'attente est devenue `CL.mgmtParties()`. C'est la seule ligne
  de test existante modifiée.
- **La caisse s'affiche en k$**, comme partout dans le jeu aujourd'hui (les euros : lot 8).
- **La prochaine soirée** s'affiche « Split N », sans date ni lieu (calendrier : lot 7,
  salles : lot 8).
- **La phrase de confirmation de l'effacement n'est pas décidée** (brief, « À trancher »).
  L'écran montre le titre « Effacer la partie ? », l'emplacement, l'organisation et le
  nombre de soirées jouées, et les deux boutons ; aucune phrase n'a été inventée.

## Correctif livré avec le lot (bug déjà dans `main`)

Le deuxième groupe de scénarios (PR 91) écrivait `target:null` dans une demande sans
cible (deuil, dernière danse, pause). `validateMgmt` refusait ce fait : **la partie ne
se rechargeait plus** (elle repartait du secours, ou d'une partie neuve). Constaté sur une
partie neuve de graine 99. Corrigé : la demande n'écrit plus de cible vide, et la
validation tolère `target:null` pour les parties déjà enregistrées. Deux tests ajoutés
dans `mgmtScenarios.test.js` (dont cinquante parties neuves validées).

## Tests

`tests/mgmtEmplacements.test.js` (9 tests) : la partie d'avant le lot dans l'emplacement 1 ;
jouer dans le 2 ne touche pas au 1 ; aller-retour intact ; l'état d'interface ne passe
pas ; le secours du même emplacement ; le registre absent ou illisible ; l'accueil ;
l'écran ; le clavier seul ; l'effacement confirmé qui ne touche pas aux autres.
