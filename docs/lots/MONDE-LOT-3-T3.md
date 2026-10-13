# Monde lot 3 T3 — La présentation du combat

## 1. Branche
`monde-lot-3-presentation`, vérifiée ; piste B, étape 3. Suffixe absent du plan : reprendre T1/T2.
Dépendances : lots 1 et 2 fusionnés ; T1 acceptée (83441e9), T2 acceptée (d6f94a9).

## 2. Objectif
Composer la brique publique, sourcée et déterministe de présentation d'une paire, avec trois pronostics nommés.
Fondement : « T3 — La présentation du combat, pronostics compris. Elle remplace l'avant-combat
actuel au lieu de s'y ajouter. » (brief lot 3, ligne 190).
Comme T2, T3 livre les données ; le remplacement visible de `mgmt_soiree_avant` sera fait en T5,
après T4, sans second écran d'avant-combat. Ne pas annoncer ce remplacement comme déjà livré.

## 3. Ce qui existe
- `mgmt-presentation-faits.js:26-50` : `mgmtFaitsBase({m,h?},id)` projette la population et les
  bilans avant h ; `:171-180`, `mgmtFaitsCombat` classe les faits de toutes les paires actives.
  Réutiliser ces portes ; schéma T1 : id, famille, groupe, valeur, sujets, sources, rarete,
  frequence, population. Familles de paire et valeurs : `:143-168`.
- Porte `mgmtPresentationTexte(modele,valeurs)` (`mgmt-presentation-combattant.js:4-7`),
  `mgmtPresentationPhrase(m,fait)` (`:8-18`) et `mgmtPresentationHistoire(m,id,h,faits)` (`:19-29`).
  Ne pas appeler tout le collectif T2 pour deux sujets : employer ses portes de phrases/histoire.
- Porte `mgmtObsAvant(m,id,h)` (`mgmt-soiree-show.js:141-147`). `mgmtObservation` (`:153-215`)
  appelle un rejeu (`:128,159`) : interdit ici, comme `mgmtAvantCote` (`:265-274`) et ses profils.
- `mgmtSoireeProgramme(m)` (`:70-86`) donne h, ids, rounds et titre sans rejouer ;
  `mgmtAvantCombat(m,i)` (`:299-330`) est l'ancien compositeur. Son appelant écran est
  `scr_mgmt_soiree_avant` (`mgmt-soiree-cadre.js:170-187`), ouvert par `CL.mgmtSoAvant` (`:263`).
- `mgmt-medias-data.js:13-24`, `mgmtMediaDe(id)` (`mgmt-medias.js:18`) : noms/voix déjà écrits.
- Porte les pièges T2 (`tests/mgmtPresentationCombattant.test.js:56-68`), reconstruction publique
  (`:72` et suivantes), et fixture Split 20261008, quatre soirées de T1/T2.
- `index.html:1177-1184` : soirée-show, faits, données T2, compositeur T2, combat, cadre soirée.
  Le harnais `tests/helpers/loadGame.js` lit cet ordre réel ; aucune liste parallèle à inventer.
Recherche `@eclaireur` tentée, refusée (limite de profondeur) ; passages décisifs lus directement.

## 4. Ce qui change
- Nouveau `mgmt-presentation-combat.js`, ancre `MGMT_PRESENTATION_COMBAT` (Monde lot 3 T3).
  Aucun DOM, HTML, G, cache, nouveau tirage ni écriture dans la partie.
- Nouveau `mgmt-presentation-combat-data.js`, constante `MGMT_PRESENTATION_COMBAT_TEXTES` (§6).
- `index.html` : données T3 puis compositeur T3 après compositeur T2, avant combat ; `?v=` et
  cache `sw.js` via `_bump.js`. Aucun autre changement de sw ni des anciens scripts.
- Nouveau `tests/mgmtPresentationCombat.test.js` ; `package.json` : ajouter aux listes `test`
  et `test:watch`, sans exclusion de `check:rapide`.
```js
/** Pronostics publics d'une paire active de même catégorie. Déterministe, sans effet de bord.
 * @param {{m:object,h?:number}} contexte Frontière T1, h exclu.
 * @param {string} aid @param {string} bid
 * @returns {Array<object>} Trois voix dans l'ordre fixé ci-dessous, ou [] si paire invalide.
 */
function mgmtPronosticsCombat(contexte,aid,bid)
/** Présentation en texte brut, sans moteur ni état global.
 * @param {{m:object,h?:number}} contexte Frontière T1, h exclu.
 * @param {string} aid @param {string} bid
 * @returns {object|null} Schéma ci-dessous ; null si absent, inactif, identique ou hors catégorie.
 */
function mgmtPresentationCombat(contexte,aid,bid)
/** Adaptateur de la soirée calculée : impose la frontière du combat, pas celle de fin de soirée.
 * @param {object} m Partie explicite. @param {number} i Index entier du programme.
 * @returns {object|null} {i,etiquette,rounds,titre,presentation}, ou null sans trace valide.
 */
function mgmtPresentationCombatSoiree(m,i)
```
Présentation : `{ids,div,h,faits,cotes,histoire,pronostics}`. ids = deux ids croissants ; toutes
les lectures/asymétries suivent cet ordre, même si l'appel inverse aid/bid. h = borne T1.
faits = trois premiers faits de paire de familles distinctes dans l'ordre T1, objets
`{fait,texte,modele}`. Pas de quota d'ouverture pour les paires. cotes = deux `{id,faits}` :
pour chaque sujet, bilan puis les deux faits individuels les plus rares de familles distinctes,
par `mgmtFaitsCombattant` et `mgmtPresentationPhrase`. Aucun fait ni champ physique ajouté.
histoire = union des index non projetés des faits revanche/adversaire_commun, décroissants,
au plus trois, strictement <h : `{index,ids,recits,sources}` ; ids = côtés de la trace,
recits = `{id,texte}` pour chaque sujet de la paire dans cette trace, texte T2 ; source hist index.
Porter la substitution W/L/D de T2 si sa sélection de trois ne contient pas cette trace.
Variables de paire : valeur T1, plus noms publics résolus des ids ; styles et rangs sont triés
avant jonction « / » (ils ne prétendent pas associer une valeur à un côté). Jamais d'id affiché.
Pronostic : `{voix,nom,vainqueur,pourcentage,texte,modele,preuves}` ; voix est un id média,
nom vient de `mgmtMediaDe`, vainqueur est un des ids ; preuves = `[{critere,valeurs,sources}]`.
Ordre/règles : Cage Hebdo (`cage-hebdo`) compare les taux r=(W+0.5D)/(W+L+D), r=0.5 sans combat.
pA=arrondi(50+30*(rA-rB)) ; choisir A si pA>50, B si pA<50 ; égalité : id croissant.
Son pourcentage = max(pA,100-pA), entier 50..80 ; preuves bilans projetés et sources fiche T1.
Tableau Noir (`tableau-noir`) choisit le meilleur rang dans base.rang, absent = population+1 ;
preuves deux rangs + source classement T1, pourcentage null. Le Forum (`le-forum`) compare
la somme W=1/L=-1/D=0 des trois dernières traces avant h ; preuves résultats et index hist,
pourcentage null. Tous départages : id croissant. Aucune consultation du vainqueur courant.
Le texte cite {vainqueur} (nom public), Cage Hebdo cite aussi {pourcentage} ; nom de voix séparé.
L'adaptateur appelle `mgmtSoireeProgramme`, puis le compositeur avec `{m,h:p.h}` ; ne retourne
ni trace, ni fait de résultat, ni attribut moteur. Aucun appelant écran basculé dans T3.

## 5. Sauvegarde
Non. `MGMT_SAVE_VERSION` reste 16 (`mgmt-bureau.js:85`) ; migration/validation inchangées ; rien persisté.

## 6. Textes
Commande au codeur : `@ecrivain` — lire LES-SIX-VOIX-v1.1, SPLIT-CONTEXTE-DEPART et les règles
de MGMT_MEDIAS ; écrire **10 propositions relu:false** dans `mgmt-presentation-combat-data.js`,
`MGMT_PRESENTATION_COMBAT_TEXTES`, objets par clé `{id,texte,situation,relu:false}`.
Sept clés/familles : meme_age ({tranche}), revanche ({combats}), contraste_style ({styles}),
meme_camp ({nom}), rangs_voisins ({rangs}), adversaire_commun ({adversaire}), titre ({champion}).
Les deux dernières variables sont des noms publics ; titre signifie présence de la personne
détenant la ceinture, PAS une ceinture forcément en jeu. Trois clés média : cage-hebdo
({vainqueur},{pourcentage}), tableau-noir et le-forum ({vainqueur}). Respecter leurs voix existantes,
formulations épicènes utilisables en catégorie féminine ; aucune voix, personne ou histoire inventée.
Pas de phrase de remplacement écrite par le codeur. Si agent inaccessible et textes non livrés,
arrêt contenu explicite : demander au superviseur de livrer ces 10 propositions, sans stub.

## 7. Écran
Aucun dans T3 ; planche validée réservée à T4/T5. Ne pas modifier l'ancien écran ni ajouter une entrée.

## 8. Tests
`tests/mgmtPresentationCombat.test.js` ; intitulés exacts et assertions :
- « Monde lot 3 T3 — paire canonique et invalides » : graine 'faits', 30 sujets, 0 soirée ;
  inverser ids et roster donne mêmes objets, ≤3 faits/familles, deux bilans ; invalides null/[] ;
  conserver le test T2 des 30 textes distincts et six ouvertures (ce quota n'est pas celui des paires).
- « Monde lot 3 T3 — trois voix nommées et pourcentage public » : fixture 0 soirée, ids a/b,
  bilans 8-2-0 et 2-8-0 : Cage Hebdo choisit a à 68 %, noms exacts des trois médias, deux null ;
  bilans nuls : a à 50 % ; 10-0/0-10 : a à 80 %. Reconstruire le chiffre depuis preuves sourcées.
- « Monde lot 3 T3 — les voix peuvent se contredire » : fixture 0 soirée simulée, trois traces
  contrôlées par sujet, a perd trois fois, b gagne trois fois, bilans 8-2/2-8 remplacés par
  8-3/3-8 cohérents : Cage Hebdo choisit a, Forum b ; égalité des séries départagée par id.
- « Monde lot 3 T3 — aucun niveau caché ni appel moteur » : pièges T2 sur roster et traces,
  profil/génération/rejeu/observation interdits ; compositeur, pronostics, adaptateur : 0 lecture/appel.
- « Monde lot 3 T3 — chaque phrase et preuve retrouve sa source » : Split 20261008, 4 soirées ;
  reconstruire valeurs T1, noms et résultats historiques ; 0 source orpheline, histoire <h,
  0 variable résiduelle, aucun moment privé ; titre non disputé n'est pas annoncé en jeu.
- « Monde lot 3 T3 — frontière soirée, pureté et rechargement » : même Split ; chaque p.h,
  h=0 et longueur hist ; résultats/familles/rounds à partir de h changés : objet inchangé ;
  bilans projetés inchangés, 0 histoire à h=0 ; deux appels gelés et G différent identiques,
  SEED/partie inchangées ; sérialiser/valider puis résultat identique ; mauvais index adaptateur null.
- « Monde lot 3 T3 — féminin et dix propositions exportables » : catégorie féminine, 0 soirée ;
  10 ids uniques relu:false, substitution sans masculin imposé ni accolade ; export retrouve les 10.

## 9. Vérification
`node --test tests/mgmtPresentationCombat.test.js tests/mgmtPresentationCombattant.test.js tests/mgmtPresentationFaits.test.js`.
Puis `npm run check:rapide` et `node tools/verif-versions.js` ; export temporaire avec --out,
pas de commit TEXTES-A-RELIRE. Pas de Monte Carlo. Fin : 0 échec/lecture cachée/source orpheline,
3 voix par paire valide, 10 propositions exportées ; test T2 de diversité toujours vert.

## 10. Hors périmètre
Écran/CSS/CL/navigation (T4/T5), bilan des voix T6, charte/anciens contrats T7, moteur, physique,
booking, passé, économie, nouvelles familles T1, sauvegarde, réécriture des textes livrés T2.

## 11. Pièges
La soirée est calculée d'un bloc : h et bilans projetés sont indispensables. Sources projetées ≥h
sont des bilans AVANT, jamais une histoire. T1 « titre » ne dit pas que la ceinture est disputée.
Les styles/rangs T1 suivent l'ordre du roster, pas les paramètres. Ne pas réutiliser les zones
rejouées ou l'allonge de l'ancien avant-combat. Ne pas changer son test « aucun pronostic » en T3.

## 12. Décisions et questions
Données d'abord, remplacement en T5 : suit l'étape 3 du plan et la séparation écran adoptée en T2.
Trois médias existants et règles distinctes : contradiction possible sans identité inventée ni moteur.
Zones/presse/enjeux futurs sans source T1 omis : ne pas déduire centre/cage/sol d'un style ou
inventer un effet sur classement/contrat ; leurs enrichissements attendront une source publique.
Questions pour Anthony : aucune décision à demander ; les textes passent par l'agent autorisé.
