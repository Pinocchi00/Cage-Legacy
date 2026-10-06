# Brief du 06/10/2026 — Lot 4 : le socle de l'interface

Source : le « Brief complet » d'Anthony du 06/10/2026 (lot 4) et les planches « Règles 1 » et
« Règles 2 » du canvas de maquettes, plus les planches « Management — Choisir une partie »,
« Confirmation » et « Accueil — Version finale ». Ce document dit ce qui est livré, les écarts, et
ce qui attend une décision ou un fichier. Code : `ui-cadre.css` et `mgmt-cadre.js`.

## Ce qui est livré (codé par Claude, 06/10)

- **Le cadre fixe de 1920 × 1080**, mis à l'échelle de la fenêtre (`mfAjuste` : un seul rapport,
  `--mf-s`) sans jamais se réorganiser : 1280 × 720, 1920 × 1080 et 2560 × 1440 donnent le même
  HTML, seulement agrandi ou rétréci. Le texte n'est pas sélectionnable, le clic droit n'ouvre plus le
  menu du navigateur sur un écran du cadre.
- **Les 7 couleurs et leurs usages** (noir `#0D0B0B`, panneau `#121010`, ligne `#252121`, blanc cassé
  `#E9E6E1`, rouge `#B32A1E`, rouge vif `#E23A2B`, jaune `#F0B220` ; texte secondaire 74 %,
  séparations 16 %, bord des plaques 38 %) ; **le fond cendré** derrière chaque écran, jamais un noir plein.
- **La grille** : barre de 260 px, en-tête à 20 px du haut (64 px de haut), contenu de 1564 × 856 à
  300 / 128, rangée de touches à 1010 px.
- **Le contour des panneaux** (filet 2 px, liseré noir 5 px, coins coupés à 45° en haut à gauche et en
  bas à droite ; choisi 100 %, normal 50 %, de côté 30 %) et **les neuf pièces** comme fonctions de
  rendu : `mfPanneau`, `mfCartouche`, `mfLigne`, `mfPuce`, `mfOnglet`, `mfBouton`, `mfTouche`,
  `mfMarque` (V, D, N), `mfVoix`. Tout texte injecté passe par `esc()`.
- **La barre des sections** : Carte, Préliminaires, Effectif, Classements, Ceintures, Contrats, Camps,
  Presse, Calendrier, Résultats, Finances, plus Options et Menu principal. La courante est éclairée
  (blanc cassé), ce qui attend une action porte l'octogone jaune, **le soir toute la barre est grisée**.
- **La transition** : un écran ancien reste en service, dans son habillage actuel, posé dans le cadre
  sous la barre (`mfAncien`) ; sa navigation d'origine reste dans le HTML (les tests la lisent) et
  le cadre la masque. Une section dont le lot n'est pas livré ouvre l'écran ancien qui lui correspond
  (Carte → la carte, Préliminaires → la semaine, Effectif → le vestiaire, Classements, Contrats → le
  recrutement, Finances → l'organisation) ou **reste grisée** (Ceintures, Camps, Presse, Calendrier,
  Résultats, Options). Une fiche éclaire la section d'où on l'a ouverte.
- **Le gabarit des noms** (`mfAfficheMise`, `mfCorps`) : portage exact de l'algorithme des maquettes
  (table d'avance de chaque lettre, quatre modes de mise en page) — un nom rétrécit quand il est long,
  rien ne déborde ; les trois planches de test (courts, égaux, longs) tiennent.
- **L'accueil** : le titre, le menu (Management, Carrière, Duel entre amis, Panthéon, puis Succès,
  Options, Quitter), les touches ; **l'affiche de la prochaine soirée en plein écran** — les deux noms
  en colonnes, le VS, la boîte du poids, la fiche de chaque combattant (nom, palmarès, rang, âge, trois
  dernières marques), « Aussi à l'affiche » — ou le logo à droite quand aucune soirée n'est prévue.
  ↑ ↓ choisissent en sautant le grisé, Entrée valide, R reprend la dernière partie jouée.
- **« Choisis une partie »** (lot 1) et **la confirmation « Retour au menu principal »** habillées dans
  le cadre ; Menu principal sauvegarde puis revient à l'accueil.
- **Le mouvement sobre** : l'entrée (vite, en biais, se pose droite) ne se joue qu'à l'arrivée sur un
  écran, jamais quand il se redessine (une flèche, un clic), et tout vit sous
  `prefers-reduced-motion:no-preference`.

## Écarts, et ce qui attend

- **La police des titres n'est pas la bonne.** Les maquettes demandent Saira Extra Condensed 800 ; le
  dépôt n'a que Saira et Saira Condensed. Le nom de famille `Saira Extra Condensed` pointe en attendant
  sur Saira Condensed 800 (un peu plus large), avec un interlettrage de −0,06 em et une table
  d'avance recalée (`MF_ADV_ECHELLE`) pour que les mises en page tombent aux mêmes endroits. **À poser
  quand le fichier est dans `fonts/`** : changer la source du `@font-face` (ui-cadre.css), mettre
  `--mf-titre-ls` à 0 et `MF_ADV_ECHELLE` à 1. Le critère « aucune police de repli » n'est donc pas
  tenu à la lettre. *Je n'ai pas téléchargé le fichier : c'est à Anthony de dire si je le fais.*
- **La texture cendrée des maquettes est un fichier image.** Le fond du cadre est dessiné en CSS (dégradés
  et grain) en attendant ; de même, **l'affiche d'accueil n'a pas ses huit textures** (rouge, bleu, or,
  émeraude, orange, magenta, blanc, turquoise) : la couleur de l'affiche est une teinte choisie par
  hachage du combat sur le fond cendré, les couleurs sont des approximations.
- **Écrans anciens** : ils gardent leurs textes de moins de 22 px et leurs barres de défilement
  natives, tant que leurs remplaçants (lots 6 à 11) ne sont pas livrés. Le critère « aucun texte sous
  22 px » vaut pour tout ce qui est neuf.
- **Le nom de la soirée** : l'accueil et « Choisis une partie » écrivent « SPLIT FIGHT NIGHT 15 » comme
  les maquettes ; ailleurs le jeu écrit encore « Split 15 ». La date et le lieu de l'affiche attendent le
  calendrier et les salles (lots 7 et 8) : rien n'est inventé.
- **Options et Quitter** (accueil) sont affichés et grisés : les options arrivent au lot 12, Quitter avec la
  version PC.
- **Tests existants modifiés** (décision du brief : l'accueil du canvas remplace l'accueil T8a) :
  `mgmtBureau.test.js` (« reprise à froid » : l'accueil n'affiche plus les résultats de la dernière
  soirée ; les lectures pures `titleMgmtLastEvent` et `titleMgmtUpcoming` restent testées en direct),
  `mgmtOrganisation.test.js` (« aucun onglet Contrats » : ne lit plus que le contenu ancien, la barre du
  cadre porte un Contrats), `mgmtEmplacements.test.js` (classes du nouvel écran).

## Tests

`tests/mgmtCadre.test.js` (12 tests) : les 7 couleurs et la grille ; jamais de texte sous 22 px, de
composant natif ni de sélection ; les trois échelles ; le clic droit ; les gabarits de noms ; la barre
(onze sections, courante, attente, grisé, soir) ; les écrans anciens dans le cadre ; l'accueil sans et avec
soirée (noms échappés) ; le clavier de l'accueil ; la confirmation ; le mouvement.
