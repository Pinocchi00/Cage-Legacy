# Monde lot 10 T2 — « Votre arrivée »

## Branche
`monde-lot-10-ecrans` (branche courante attendue).

## Objectif
Refondre « Votre arrivée » en écran d'héritage fidèle à la planche validée, avec les états `premiere` et `sans-passe`.

Fondement du brief : « À la création d'une partie, le jeu fait vivre l'organisation pendant six ans avant l'arrivée du joueur : des soirées, des champions, des revanches, des blessures, des départs. » (`docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, lot 1).

## Ce qui existe
- `docs/lots/MONDE-LOT-10-DECISIONS.md:3-17` fixe la branche, planche, comportements, aucun changement de simulation/sauvegarde et les décisions d'affichage.
- `maquettes/monde/refonte/MondeArrivee.html` est la planche validée par Anthony le 14/10/2026. `maquettes/monde/refonte/LISEZ-MOI.md:71-109` est le contrat fonctionnel et la source des données des blocs.
- `mgmt-prise-en-main.js:83-107` porte `scr_mgmt_arrivee`, son branchement, bouton et navigation actuels. La fonction lit déjà le profil, les faits du passé et les champions, mais n'implémente pas les états ni l'héritage demandé; Entrée/Échap vont encore à l'Accueil.
- `mgmtAccueilContenu(m)` porte les sources `ou` et `attend.prochaine` (voir LISEZ-MOI §2). Réutiliser, sans recalculer une seconde version des blocages.
- Sources à réutiliser : `mgmtPasseAnnee`, `mgmtSoireesJoueur`, `mgmtSplitTitle`, `mgmtCeintureLignee`, `mgmtRivalites`, `mgmtContratRestants`, `mgmtFicheLigne`, `mgmtDivisionLabel`, `mgmtOrgIdentite` et `mgmtAccueilContenu` selon les disponibilités/contextes précisés dans LISEZ-MOI.
- `tests/mgmtArrivee.test.js:11-49` porte les tests de présence conditionnelle des blocs, chiffres actuels du passé et lisibilité minimale. `tests/mgmtAccueil.test.js:37` couvre déjà le bloc héritage de l'Accueil : adapter ce test au retrait du seul bloc héritage.

## Ce qui change
- `mgmt-prise-en-main.js` : remplacer le rendu actuel par les trois colonnes de la planche et les données prescrites par `LISEZ-MOI.md:73-109`. État `premiere` si `mgmtSoireesJoueur(m)===0 && m.passe`, sinon `sans-passe` si zéro soirée joueur sans passé. Ne pas afficher de blocs vides; en `sans-passe`, pas de chiffres/rivalité de passé ni de « depuis » pour les champions, et afficher « Par où commencer » avec les trois pas prescrits.
- Afficher identité du prédécesseur et de l'adjointe, résumé des six ans, les douze champions (vacance comprise), rivalité et blessures présentes lorsqu'elles existent, la prochaine action issue de `mgmtAccueilContenu(m).attend.prochaine`, promesses et fins de contrat. Les sources, filtres, formats et échéances sont ceux du LISEZ-MOI §2, pas de chiffres approximatifs.
- Appliquer `docs/lots/MONDE-LOT-10-DECISIONS.md`: « Retraites » devient « Blessures » (faits `injury` des `m.passe.nFacts` premiers faits); retirer « Sa fille »; mois en minuscules dans les phrases; échéances en numéro de soirée (`{org} Fight Night …`), jamais « cycle ».
- Ajouter les interactions prescrites : Entrée ouvre la Carte (bloc jaune), Échap mène à l'Accueil, liens/noms vers l'écran ou la fiche correspondante. Après la première soirée l'écran ne doit plus être présenté. Mettre à jour l'Accueil pour retirer uniquement son bloc « héritage », sans modifier ses autres blocs.
- `ui-cadre.css` : styles ciblés de l'écran selon la planche/LISEZ-MOI, sans toucher aux styles globaux non nécessaires.
- `tests/mgmtArrivee.test.js` : conserver/adapter les tests existants et ajouter un test par état et les assertions détaillées ci-dessous. `tests/mgmtAccueil.test.js` : confirmer que seul le bloc d'héritage disparaît.
- Toute nouvelle fonction doit avoir un JSDoc qui décrit paramètres, résultat et effet. Aucune API nouvelle n'est imposée; découpage interne libre.

## Sauvegarde
Non. `MGMT_SAVE_VERSION` inchangée; aucune donnée persistée.

## Textes
**Textes : aucun sous-agent.** N'appelle AUCUN agent (@ecrivain est inaccessible depuis le codeur : « subagent depth limit reached »). Les textes fixes d'interface sont ceux « proposés » dans `maquettes/monde/refonte/LISEZ-MOI.md` §2 (bande d'arrivée, préfixe de la prochaine chose à faire) : copie-les tels quels dans `mgmt-prise-en-main.js`, marqués `relu:false`. Aucune réplique, aucun personnage inventé. Si un libellé manque dans le LISEZ-MOI, écris le plus simple et signale-le dans le compte rendu.

## Écran
Planche validée : `maquettes/monde/refonte/MondeArrivee.html`; contrat : `maquettes/monde/refonte/LISEZ-MOI.md`, §2 et « Écarts et questions ».

## Tests
Fichier : `tests/mgmtArrivee.test.js`.
- `Arrivée — état premiere : l'héritage affiche les données de la partie et les douze champions`
- `Arrivée — état sans-passe : aucun chiffre ni rivalité de passé, champions sans « depuis », trois pas affichés`
- `Arrivée — blocs absents si la donnée correspondante manque`
- `Arrivée — les compteurs six ans égalent m.passe.soirees, m.passe.nHist et les faits de m.passe.nFacts`
- `Arrivée — champions couronnés et blessures comptent les faits prescrits, sans compter les retraites`
- `Arrivée — promesses affichent l'échéance en Fight Night, jamais « cycle »`
- `Arrivée — Entrée ouvre la Carte et Échap ouvre l'Accueil`
- `Arrivée — aucun texte sous 22 px`
- `Accueil — seul le bloc héritage est retiré, les autres blocs restent`

Assertions obligatoires : utiliser une partie de Split graine `20261008` avec passé et soirée jouée comme fixture de référence; l'écran compte les soirées/combat depuis les champs prescrits (`m.passe.soirees`, `m.passe.nHist`), et les champions/blessures depuis les `m.passe.nFacts` premiers faits. Couvrir explicitement les douze ceintures, y compris vacantes; le plus long règne départagé par `defenses`; une promesse `p.due===m.cycle` libellée « ta première soirée »; sinon échéance `{org} Fight Night {eventsPlayed + 1 + (p.due - m.cycle)}`. Test de navigation de l'écran après une soirée jouée : l'arrivée n'est plus accessible comme arrivée initiale.

Fichier : `tests/mgmtAccueil.test.js`.
- `T5 — la première arrivée : héritage avant la première soirée, semaine ensuite, rien dans la sauvegarde` (adapter : l'héritage est désormais porté par l'écran arrivée; vérifier que les autres contenus Accueil demeurent).

## Vérification
- `node --test tests/mgmtArrivee.test.js tests/mgmtAccueil.test.js`
- Vérification visuelle dans le jeu avec partie Split graine `20261008`, aux largeurs 1280, 1440 et 1920, états `premiere` et `sans-passe`; aucun débordement/chevauchement, aucun texte sous 22 px, clics/clavier fonctionnels.
- Critère de fin : les deux états affichent les seules données prescrites, les douze ceintures et les échéances sont exactes, navigation conforme, accueil sans son seul bloc héritage, tests ciblés verts et contrôle visuel réussi aux trois largeurs.

## Hors périmètre
Ne pas toucher à la simulation du passé, aux faits/archives, aux contrats, au moteur de classement, aux règles de booking, aux données d'identité, à la sauvegarde, à la planche, ni aux autres blocs de l'Accueil. N'ajouter aucun fait, texte d'auteur ou champ persistant.

## Pièges
- Le code existant route `mgmtArriveeFin()` vers `mgmt_accueil` pour Entrée **et** Échap (`mgmt-prise-en-main.js:105-107`); ces deux actions ont désormais des destinations différentes.
- Le LISEZ-MOI précise que le rang affiché retire le champion avant de numéroter les autres; ne pas reprendre directement un classement qui numérote le champion.
- `m.passe.nFacts` borne les faits historiques : ne pas compter des faits postérieurs au passé. `title_fight` n'est pas forcément un changement de champion; même logique incrémentale que T1 pour compter les changements.
- Une catégorie peut être vacante; `mgmtSplitTitle` peut ne pas fournir de nom. R4 de la charte : supprimer un bloc/élément sans donnée, pas le griser ni rendre une ligne vide.
- `mgmtJourDate` produit des mois en capitales; convertir uniquement les mois des phrases en minuscules, pas les plaques d'en-tête.
- L'Accueil et l'arrivée partagent des sources, pas le même contenu : ne supprimer que `heritage` de l'Accueil.
- `esc()` pour toute donnée joueur injectée en HTML; ne pas coder « Leïla » en dur pour l'adjointe.

## Questions pour Anthony
Aucune question bloquante restante : planche et écarts sont tranchés dans `MONDE-LOT-10-DECISIONS.md`.

## RAPPEL du superviseur — 14/10/2026 19 h 15
Tu n'appelles AUCUN sous-agent (@eclaireur, @ecrivain, @verif, @relecteur sont inaccessibles depuis toi). Lis le code toi-même, écris les textes toi-même, lance toi-même `node tools/verif-versions.js origin/main` puis `npm run check:rapide` (ou les tests ciblés `node --test tests/<fichier>` si le lancement en bloc échoue), et commite. Le superviseur relit et compare à la planche.


## PRÉCISION du superviseur — 14/10/2026 19 h 35 (ceci n'est PAS une contradiction avec ta méthode)
Ta méthode prévoit d'appeler `@verif` et `@relecteur`. Ils sont INDISPONIBLES depuis toi (limite de profondeur des sous-agents). La procédure de repli est celle que le chef t'a déjà donnée : lance toi-même `node tools/verif-versions.js origin/main` puis `npm run check:rapide` (ou les tests ciblés), puis commite. Exécute ce repli et CONTINUE : ne t'arrête jamais pour cette raison.
