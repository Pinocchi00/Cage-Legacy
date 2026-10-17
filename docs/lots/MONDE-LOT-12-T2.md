# Monde lot 12 T2 — L’Accueil, comme sa planche

Branche : `monde-lot-12-fidelite`. Commun à toutes les tranches du lot 12 : **reproduis la planche validée** (positions, tailles, couleurs, ordre des blocs) en lisant son HTML et ses styles ; ses noms et chiffres sont des exemples d’une vraie partie, le code les lit dans la partie. Un bloc sans donnée n’est pas affiché (charte R4) ; aucun texte sous 22 px ; rien ne déborde à 1280, 1440, 1920. Pas de texte nouveau sauf ceux que la planche porte (marqués `relu:false`). Tests ciblés dans le fichier de test de l’écran ; `node tools/_bump.js` sur chaque fichier touché ; pas de `check:rapide`. Le superviseur compare l’écran à la planche dans le jeu.

## Planche
`maquettes/monde/MondeAccueil.dc.html`, capture `maquettes/monde/captures-monde/3-MondeAccueil.png`. Écran : l’Accueil (`mgmt-accueil.js`, données `mgmtAccueilContenu`).

## Écarts relevés par le superviseur (jeu sur `main`, 16/10/2026, 1920×1080, partie réelle après le passé)
1. Trois colonnes égales sur la planche (« Ce qui s’est passé », « Ce qui t’attend », « Et ailleurs ») ; le jeu met « Et ailleurs » sous la deuxième colonne.
2. Le bandeau : la planche montre « Prochaine soirée · Dans 34 j · Split Fight Night 15 », « Le lieu · Dôme · Lyon, 12 avril », « La carte · 3/5 · Deux places à finir » ; le jeu y montre prédécesseur, adjointe, première soirée (le contenu de l’arrivée).
3. La date : « Lundi 12 janvier 2027 » en minuscules dans la phrase ; le jeu écrit « Mardi 12 JANVIER 2027 ».
4. « Demandes et affaires ouvertes » : une ligne par affaire avec son action à droite (« Répondre › », « Décider › », « Prolonger › ») ; le jeu affiche des boutons PROMETTRE / REFUSER et coupe la liste avec un ascenseur.
5. Le bloc jaune : « La prochaine chose à faire », un titre, une phrase, la touche Entrée et l’action (« Ouvrir les dossiers ») une seule fois ; le jeu répète le titre.
6. La ligne « Prochaine étape » sous les touches n’est pas sur la planche (le bloc jaune la porte déjà).

## Tests (`tests/mgmtAccueil.test.js`)
`Monde lot 12 T2 — l’Accueil a trois colonnes, le bandeau de la prochaine soirée et une action par affaire`. Commit `Monde lot 12 T2 : l’Accueil comme sa planche`.

## Compte rendu

- `mgmt-accueil.js` : trois panneaux frères, bandeau de la prochaine soirée dès la première visite, mois en minuscules, action jaune sans répétition, une action par demande et liste complète des affaires ; panneaux sans donnée masqués (R4). Les demandes ouvrent leur fiche existante, les affaires gardent leur échange existant. Textes repris de la planche marqués `relu:false` dans la donnée de prochaine action.
- `ui-cadre.css` : colonnes égales, retours à la ligne et défilement du contenu global plutôt qu’un ascenseur dans les affaires.
- `mgmt-prise-en-main.js` : suppression de la ligne « Prochaine étape » sur l’Accueil uniquement.
- `index.html` et `sw.js` : versions de cache des trois fichiers et du service worker montées avec `_bump.js`, ordre des scripts inchangé.
- `tests/mgmtAccueil.test.js` : ajout de « Monde lot 12 T2 — l’Accueil a trois colonnes, le bandeau de la prochaine soirée et une action par affaire ». Adaptations des tests T5 (panneau vide masqué, règle R4 de cette fiche) et T6 (action Répondre, écart 4 de cette fiche).
- Vérifications locales : 10/10 tests Accueil, 8/8 tests Prise en main ; `node tools/verif-versions.js origin/main` sans écart. Aucun test lent touché ; `check:rapide` réservé au superviseur.
- Relecture locale du diff et de la planche effectuée sans sous-agent. La comparaison visuelle en jeu à 1280, 1440 et 1920 reste au superviseur ; elle n’est pas attestée par les tests DOM.
- Migration de sauvegarde : aucune. Modifications T2 déjà présentes au début de la session reprises et vérifiées ; configurations `.opencode` et `opencode.json` laissées hors commit.
- Écarts : colonnes égales selon l’écart 1 explicite de la fiche, bien que le HTML de la planche porte des proportions 5/5/3. Questions pour Anthony : aucune.

## Compte rendu — reprise bloquée

- Vérification préalable : branche `monde-lot-12-fidelite` conforme.
- Le point 1 de la reprise suppose des affaires de type promesse et contrat avec leur échange existant. Or `mgmt-save.js`, fonction `mgmtValidAffair()`, n'accepte que `leila_propose`, `leila_react`, `leila_bulk`, `leila_react_swap` et `leila_react_crush`. `mgmtAccueilContenu()` construit les lignes depuis les demandes ouvertes et cette pile uniquement ; aucune ligne promesse ou contrat n'y est produite. Les exemples de la planche ne constituent pas des échanges implémentés.
- Questions pour Anthony : faut-il ajouter à l'Accueil les promesses et les contrats issus des autres écrans ? Si oui, quels critères les font apparaître, et quelles actions existantes doivent ouvrir « Décider › » et « Prolonger › » ? Quelle action de la planche faut-il associer à chacun des cinq types d'affaires de Leïla ?
- Arrêt sur ce trou de spécification conformément à la règle de tranche. Aucun changement de simulation, de sauvegarde, de CSS ou de test ; aucun test ajouté. Les points 2 à 5 ne sont pas corrigés dans cette reprise. Les configurations non commitées restent hors livraison ; aucun travail des autres tranches n'est supprimé ni déplacé.
- Seule cette fiche est modifiée par cette reprise. Aucun résultat de vérification visuelle ou de test fonctionnel n'est revendiqué.

## REPRISE 2 — décisions du superviseur (17/10/2026) : le trou de spécification est comblé
Ces décisions **remplacent** l’écart 1 initial et le point 1 de la reprise précédente. Tout le reste de la reprise (points 2 à 6) est à faire.
- **Colonnes : les proportions de la planche, 5 / 5 / 3** (lis les largeurs dans `maquettes/monde/MondeAccueil.dc.html`) : « Ce qui s’est passé » ≈ 590 px, « Ce qui t’attend » ≈ 582 px, « Et ailleurs » ≈ 355 px à 1920, avec 18 px d’écart. Les trois panneaux ont la même hauteur (de 285 px à 985 px).
- **Pas de promesses ni de contrats à l’Accueil.** Aucune ligne « Kader avait promis… » ni « Le contrat de X se termine » : la donnée n’existe pas et Anthony veut le minimum. Les lignes de « Demandes et affaires ouvertes » sont : (a) **les demandes** de combattants (`mgmtDemandesOuvertes`), (b) **les affaires de Leïla** (`m.pile`, types `leila_propose`, `leila_react`, `leila_bulk`, `leila_react_swap`, `leila_react_crush`), **une seule ligne par affaire**, jamais les boutons « 1 D’accord… 2 Non… » développés.
- **Actions** : demande → « Répondre › » (ouvre la fiche du combattant, comme aujourd’hui) ; toute affaire de Leïla → « Décider › » (ouvre l’écran Les affaires sur cette affaire : l’échange existant, `CL.go('mgmt_bureau')`). Le texte de la ligne d’une affaire est le **résumé d’une phrase** de l’affaire (pour `leila_propose` : « Leïla propose {A} contre {B} », avec le palmarès en sous-ligne), jamais la réplique de Leïla.
- **Bandeau** : « Le lieu » affiche le nom de la salle en majuscules (ex. « FORUM DE MONTPELLIER ») et en dessous « {Ville}, {jour} {mois en minuscules} » (ex. « Montpellier, 16 février ») : aujourd’hui le mois reste en majuscules.
- **Pas de clic sur un nom coupé, pas d’ascenseur** : le contenu de chaque panneau tient ; si ça ne tient pas, on limite à 5 lignes dans « Ce qui s’est passé », 4 dans « Demandes et affaires » (le reste ouvre l’écran d’origine par « Voir tout ›»), jamais de texte coupé.
- **Bloc jaune** : le titre est en minuscules sauf la première lettre (« Finir la carte »), la phrase dessous, puis la touche Entrée et l’action sur **la même ligne** que la phrase, à droite (comme la planche).
- Tests : un test par point, `Monde lot 12 T2 — reprise 2 — <point>`. Commit `Monde lot 12 T2 : reprise 2`.

## Compte rendu — reprise 2

- `mgmt-accueil.js` : salle en majuscules et date en minuscules ; résumés des cinq types d'affaires de Leïla, marqués `relu:false`, sans réplique développée. « Décider › » sélectionne l'affaire et ouvre le bureau existant ; les demandes gardent leur fiche. Les raccourcis de réponse 1/2/3 sont retirés de l'Accueil pour ne pas décider d'un échange invisible.
- Listes limitées au rendu à cinq événements et quatre demandes/affaires ; curseur borné aux événements affichés. « Voir tout › » ouvre l'Effectif pour les événements/demandes, Les affaires pour la pile de Leïla. Si les deux familles débordent, chacune a son lien vers son écran d'origine. Aucune promesse ni aucun contrat ajouté.
- `ui-cadre.css` : proportions 5/5/3, écart de 18 px, panneaux étirés à hauteur commune (minimum 700 px), suppression du défilement de l'Accueil et du rognage interne ; phrase et action du bloc jaune restent sur la même ligne. Titre rendu en casse phrase.
- `index.html`, `sw.js` : versions montées par `_bump.js` pour les deux fichiers de production ; ordre des scripts inchangé, index conservé en LF.
- `tests/mgmtAccueil.test.js` : six tests ajoutés, préfixés `Monde lot 12 T2 — reprise 2 —` : `colonnes 5 / 5 / 3` ; `seulement demandes et affaires de Leïla` ; `actions et résumé sans échange développé` ; `lieu en majuscules et mois en minuscules` ; `listes limitées et Voir tout sans nom coupé` ; `bloc jaune en casse phrase et action à droite`. Tests existants adaptés uniquement pour les décisions explicites de cette reprise (bureau, proportions, limite de quatre lignes). Le test de limite des événements relève localement le budget du conteur pour exercer le débordement sans changer la simulation.
- Vérification : audit `node tools/verif-versions.js origin/main` sans écart ; tests Accueil 16/16 et Prise en main 8/8 verts. Aucun nouveau fichier de test, aucune migration de sauvegarde, aucun test lent touché. `check:rapide` non lancé, réservé au superviseur.
- Relecture locale du diff contre les six décisions et le HTML de la planche effectuée en repli sans sous-agent ; aucun verdict de relecteur indépendant. La vérification visuelle dans le navigateur à 1280, 1440 et 1920 reste au superviseur : les assertions DOM/CSS ne constituent pas une mesure des débordements réels.
- Écarts de spécification : aucun déclaré ; questions pour Anthony : aucune. Configurations `.opencode` et `opencode.json` préexistantes laissées hors commit.
