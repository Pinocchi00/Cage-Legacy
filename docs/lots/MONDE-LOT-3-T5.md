# Monde lot 3 T5 — Les entrées des présentations
## 1. Branche
`monde-lot-3-presentation`, branche courante vérifiée ; le plan ne précise pas le suffixe du lot 3,
celui-ci est fixé par T1–T3. Piste B, étape 4 : lots 1/2 présents, T1/T2/T3 acceptées,
T3 acceptée par 03fdac0 ; T4 satisfaite par les planches validées du 10/10 (plan :119–127).
## 2. Objectif
Ouvrir les deux présentations publiques depuis les cinq entrées prévues, sans modifier le booking ni doubler l'avant-combat.
Fondement : « T5 — Les entrées. La présentation s'ouvre depuis la Carte, les Préliminaires,
la Soirée, la Presse et l'Accueil. » (brief lot 3 :192).
## 3. Ce qui existe
- Porte `mgmtPresentationCombattant({m,h?},id)` et `mgmtPresentationsCategorie` (`mgmt-presentation-combattant.js:32–83`) : quota collectif de six, faits/texte/histoire sourcés.
- Porte `mgmtPresentationCombat({m,h?},aid,bid)` et `mgmtPresentationCombatSoiree(m,i)` (`mgmt-presentation-combat.js:39–93`) : paire canonique, côtés, histoire, trois médias ; frontière p.h.
- `mgmt-carte-cadre.js:183–204,236–244` : boutons, `CL.mgmtCarteFiche`, confirmation ; `mgmtCarteModifie(:217)` RETIRE le combat : ne pas l'appeler pour lire.
- `mgmt-prelims.js:61–117,149–155` : emplacements proposés/validés et `CL.mgmtPrelimsFiche` ; ne pas valider/remplacer en ouvrant.
- `mgmt-soiree-cadre.js:170–187,263–279` : ancien écran `scr_mgmt_soiree_avant`, retour/regarder/focus ; remplacer son rendu, garder sa route.
- `mgmt-suivi-cadre.js:289–299,321–340,478–492` : Presse, `mgmtSuHeroPresse`, `CL.mgmtSuPrEntree` ; actions préparer/résultat à préserver.
- `mgmt-accueil.js:135–139,246–251` : `mgmtAccueilParts` et `CL.mgmtAccueilOuvrir`, noms internes ET extérieurs.
- `mgmt-screens.js:316–328` : `CL.mgmtFiche`/retour ; `mgmt-ecran-fiche.js:17–23` : `mgmtFicheVue` écrit les marques et sauvegarde ; ne pas l'appeler pour une présentation.
- Porte `mfEcran` (`mgmt-cadre.js:312–323`), cadre 1920×1080 et boutons souris/clavier ; porte seulement le contour des noms de `.mf-fb-nom` (`ui-cadre.css:1050`), pas ses lecteurs moteur.
- Tests modèles : `tests/mgmtCarteCadre.test.js:6–19` (keysHandle/DOM), `tests/mgmtSoireeShow.test.js:13–18,42–75` (quatre soirées), T2/T3 (sources, pièges, diversité).
- `@eclaireur` tenté, refus « Subagent depth limit reached (1) » ; passages décisifs lus directement.
## 4. Ce qui change
- Nouveau `mgmt-presentation-ecrans.js`, ancre `MGMT_PRESENTATION_ENTREES` (Monde lot 3 T5).
  État transitoire `MGMT_PRESENTATION_UI={pile:[]}` ; chaque cadre mémorise mode, ids, h, liste,
  index, page, nom sélectionné, écran retour. Aucun objet de cet état dans G.mgmt ni sauvegarde.
  SCREENS : `mgmt_presentation_combattant`, `mgmt_presentation_combat` ; keysRegister associés.
  Signatures nouvelles (les méthodes CL délèguent aux fonctions correspondantes) :
```js
/** Ouvre sans mutation métier ; false si présentation indisponible.
 * @param {'combattant'|'combat'|'soiree'} mode @param {string[]} ids
 * @param {{h?:number,i?:number,liste?:Array<{ids:string[],h?:number,i?:number}>,retour?:string}} [opts]
 * @returns {boolean} */
function mgmtPresentationOuvrir(mode,ids,opts={})
/** HTML échappé du cadre courant ; chaîne vide sans cadre valide.
 * @param {object} m @param {object} vue @returns {string} */
function mgmtPresentationHtml(m,vue)
/** Écran complet du cadre courant ; retour d'origine si devenu invalide. @returns {string} */
function scr_mgmt_presentation()
/** Déplace dans la liste figée, bornée sans boucle ; remet page/nom à zéro. @param {number} delta */
function mgmtPresentationAutre(delta)
/** Choisit un nom historique, borné sans boucle. @param {number} delta */
function mgmtPresentationNom(delta)
/** Tourne les pages du même contenu, bornées sans boucle. @param {number} delta */
function mgmtPresentationPage(delta)
/** Ouvre le nom choisi dans une présentation enfant ; fiche existante si T2 retourne null. */
function mgmtPresentationNomOuvrir()
/** Ouvre la fiche complète du sujet (premier côté pour une paire), retour au cadre conservé. */
function mgmtPresentationFiche()
/** Regarde seulement le prochain combat réel en mode soirée ; sinon aucune action. */
function mgmtPresentationRegarder()
/** Dépile ; revient à la présentation parente ou à l'écran d'origine. */
function mgmtPresentationRetour()
```
  Exposer sur CL les huit gestes ci-dessus sans `scr_`/Html : mêmes noms/signatures/JSDoc.
  ←/→ autre sujet/combat ; ↑/↓ nom ; Entrée nom choisi (hors soirée), regarder (soirée) ;
  F/f fiche complète ; Échap retour ; Tab page suivante, Shift+Tab précédente ; boutons équivalents.
  Liste individuelle : population T2 de même catégorie triée par id ; liste paire : celle fournie
  par l'entrée, sinon paire seule. Valider chaque cible avec T2/T3 ; invalide ignorée sans navigation.
  Normaliser les listes au schéma opts.liste ; retour par défaut G.screen ; soirée : liste du programme, i obligatoire, ids issus de p ; noms sélectionnables dans l'ordre rendu, ids dédoublonnés.
  Une entrée racine remet la pile à zéro ; une ouverture historique empile, conserve h et parent. Ne réutiliser aucun cadre d'une autre partie.
- `mgmt-carte-cadre.js` : bouton « Présentation » pour A seul ou A/B visés ; sur chaque slot confirmé,
  ajouter le même bouton avec paire et liste m.card.main, sans remplacer le geste modifier/retirer.
  Entrées passent uniquement des ids et la liste ; F existant reste la fiche complète.
- `mgmt-prelims.js` : bouton « Présentation » pour le slot contenant une paire, liste des slots
  avec fight (proposés compris), ordre affiché ; trous : aucun bouton. Fiches/validation inchangées.
- `mgmt-suivi-cadre.js` : bouton secondaire « Présentation » dans le pied de la nouvelle choisie :
  paire x.a/x.b valide, sinon sujet x.a valide. Si x.f est un index hist valide, h=x.f (avant ce combat),
  ids pris dans cette trace ; sinon h absent. Garder Entrée/préparer/résultat/demande tels quels.
- `mgmt-accueil.js` : noms internes actifs et sélection d'événement ouvrent T2 ; noms extérieurs
  ou retraités restent dans la fiche existante (T2 ne les couvre pas). Aucun contenu Accueil ajouté.
- `mgmt-soiree-cadre.js` : `scr_mgmt_soiree_avant` délègue au rendu commun en mode soirée,
  adapter à l'index focus courant ; `CL.mgmtSoAvant` initialise ce cadre, retour vers mgmt_soiree.
  ←/→ parcourent le programme avec son h propre ; synchroniser focus, JAMAIS index.
  Regarder visible seulement si focus effectif===MGMT_SOIREE.index et index<programme.length ;
  déléguer à `CL.mgmtSoAvantRegarder`. Ni jeu/rejeu automatique ni seconde page avant-combat.
- `mgmt-screens.js` : accepter les deux routes nouvelles ET mgmt_soiree_avant comme retour de fiche ;
  après retour de fiche, conserver la pile/page ; ne pas détourner globalement CL.mgmtFiche.
- `ui-cadre.css` : styles `.mf-pr-*` sous ancre T5, sans modifier la fiche ni les anciens écrans.
- `index.html` : charger le nouvel écran après mgmt-accueil, avant main ; dépendances et CL déjà
  chargés. `_bump.js` pour les ressources modifiées, `sw.js` seulement cache produit par cet outil.
- Nouveau `tests/mgmtPresentationEntrees.test.js` ; `package.json` : listes test/test:watch,
  inclus dans check:rapide. `tests/mgmtSoireeShow.test.js:51–52` : nouvelles rubriques/voix attendues,
  conserver les assertions de route, barre grisée et déroulé ; ne pas supprimer les tests anciens de données.
## 5. Sauvegarde
Non : MGMT_SAVE_VERSION reste 16 ; aucune migration/validation nouvelle. La fiche complète garde
son comportement de marque existant ; les présentations seules n'éteignent aucune marque.
## 6. Textes
Aucun nouveau : réutiliser les 16 modèles T2 et les 10 T3 corrigés/acceptés, sans les réécrire.
Les libellés de rubriques viennent des planches ; aucun exemple Swat/Damagaev ni citation de maquette copié comme donnée.
## 7. Écran
Planches validées : `maquettes/monde/MondePresentationCombattant.dc.html` et `MondePresentationCombat.dc.html` ; preuve : plan :119–127 et LISEZ-MOI :19–26.
Porter leurs valeurs : stage 1920×1080 ; barre 260, logo 128, 12 entrées 69 ; en-tête x300/y20,
1564×64 ; contenu x300/y128,1564×856, gaps16 ; pied x300/y1010,h48,gap28,texte24.
Fond #0D0B0B, texte #E9E6E1, rouge #E23A2B, jaune #F0B220 ; panneaux #121010, lignes #252121,
bords 2px ; corps 22/24/25, titres40 ; Saira Condensed 500/600, Extra Condensed 800.
Combattant : bannière260, tunnel x−234.6/y−356,1728×972 ; prénom64/nom200, x32/bas30,
cartouche x1094/y20,470×220 ; bas226, colonnes3:2. Combat : bannière150, tunnel x90.9/y−226.3,
1071.4×602.6 ; noms40/116, bords32/bas22 ; VS92,x632,w300 ; bas338, trois colonnes égales.
Images locales : images/cendre.jpg et images/accueil-octogones.jpg ; jamais URL /_blob ni réseau.
Rendu : faits T2→distingue, histoire→histoire ; gagner/perdre sélectionnés→points forts ;
T3 faits→unique, cotes→ce que chacun impose (noms+faits publics, PAS centre/cage/sol), histoire→histoire,
pronostics→trois noms de médias + textes + seul pourcentage public. Données absentes : panneau sans ligne,
aucune affirmation de remplacement ; monde/ce qu'on en dit/enjeux futurs restent sans ligne (décision T3).
Palmarès de bannière : bilan public à h via mgmtFaitsBase ; pas de profil/physique ni résultat courant.
Ne pas inventer rang mondial/contrat projeté absent : valeur « — ». Afficher titre/rounds seulement
depuis carte/programme explicite. Nom historique cliquable si une fiche existe, sinon texte simple.
Porter mf-stage responsive existant ; noms ajustés par mfCorps, minimum22, jamais ellipsés ; corps wrap.
Si débordement, tourner des pages dans les mêmes panneaux (brief :184), sans overlay ni défilement horizontal :
répartir les lignes entières selon leur hauteur rendue, minimum une ligne/page ; boutons page précédente/suivante
seulement si nécessaires ; découper un texte trop haut aux espaces, sans perte ni ajout. Ne jamais réduire le corps sous22.
## 8. Tests
`tests/mgmtPresentationEntrees.test.js` ; porter keysHandle/DOM, Split 20261008, quatre soirées sauf indication.
- « Monde lot 3 T5 — cinq entrées et retour exact » : ouvrir à la souris depuis les cinq écrans,
  bonne paire/sujet/route ; Échap revient à chacun ; 0 combat booké/retiré/validé, curseurs conservés.
- « Monde lot 3 T5 — soirée sans doublon ni fuite du résultat » : route historique unique, 3 voix,
  h=p.h ; modifier résultats à partir de h laisse contenu identique ; barre grisée, index inchangé ;
  futur : pas de regarder ; prochain : regarder/retour avance index de exactement1 par porte existante.
- « Monde lot 3 T5 — clavier, noms et fiche complète » : ←→ bornées, ↑↓/Entrée ouvrent le bon id,
  h conservé dans enfant ; Échap parent ; F puis retour retrouve page/id, 5 onglets toujours présents.
- « Monde lot 3 T5 — présentation sans moteur ni mutation » : pièges T2/T3 avant ouverture/rendu
  des deux modes et soirée, hors action F/regarder ; 0 lecture niv/attribut caché/appel profil/rejeu ;
  JSON G.mgmt et SEED inchangés, marques inchangées ; 2 rendus donnent mêmes faits/textes.
- « Monde lot 3 T5 — trente contenus distincts et six ouvertures » : porte fixture T2 graine 'faits',
  30 sujets, 0 soirée ; 30 textes rendus distincts hors noms/ids, chaque famille ouvre ≤6 fois.
- « Monde lot 3 T5 — voix, pourcentage et sources affichées » : porte fixture T3 a/b 8–2/2–8,
  0 soirée, Cage Hebdo a à68%, trois noms exacts ; Split quatre soirées : chaque phrase rendue
  égale sa phrase T2/T3 et chaque source retrouvable ; 0 histoire ≥h, 0 variable résiduelle.
- « Monde lot 3 T5 — échappement, absents et pagination » : nom hostile reste texte, 0 élément
  injecté ; paire invalide ne navigue pas, trou sans bouton, extérieur Accueil ouvre fiche ; texte
  long féminin sur plusieurs pages : toutes les phrases accessibles sans perte, 0 superposition.
## 9. Vérification
`node --test tests/mgmtPresentationEntrees.test.js tests/mgmtPresentationCombattant.test.js tests/mgmtPresentationCombat.test.js tests/mgmtSoireeShow.test.js` ; puis `npm run check:rapide` et `node tools/verif-versions.js`.
Pas de Monte Carlo. Navigateur offline : cinq parcours souris puis clavier, captures1280/1440/1920,
0 erreur console, 0 chevauchement/défilement horizontal ; tailles stage≥22 (décision plan), contraste≥4.5:1
sur données décisionnelles ; 7 nouveaux tests verts, 30 textes distincts, quota≤6, 0 fuite/mutation.

## 10. Hors périmètre
Moteur, économie, booking, compositeurs/familles T1–T3, sauvegarde, dossiers lot4, refonte Accueil,
bilan des pronostics T6, amendements documentaires T7, nouveaux textes/voix et données monde fictives.

## 11. Pièges
Soirée calculée d'un bloc : h par combat même pour un enfant ; ids T3 triés ≠ côtés du programme.
FicheVue sauvegarde ; lecture simple ≠ visite de fiche. SCREENS/keys sont écrasés par chargement tardif :
vérifier ordre réel index.html (harnais le lit). Pas de cache dérivé durable ; changer cible réinitialise page.

## 12. Décisions et questions
Routes indépendantes et ancien nom soirée conservé : compatibilité des appelants/tests, sans second avant-combat.
Extérieurs/retraités restent en fiche : défaut simple conforme au domaine T2, pas de compositeur parallèle.
Omettre les enrichissements absents suit T3 acceptée : la planche fixe la forme, pas des faits à inventer.
Questions pour Anthony : aucune.
