# LOT 4 — La peau du jeu

*Contrat écrit le 23/09/2026, non commencé. Démarre quand le lot 3 (T4-T5) et le
lot 2B (T3-T4) sont livrés et fusionnés : ce lot rhabille des écrans que ces
deux chantiers sont en train de modifier.*

Répond à l'audit du 17/09 (§8 : « les écrans maquettés remplacent l'habillage
actuel, en commençant par la semaine et la soirée ») et à ses constats C7, C8,
C11 et B1 ; porte les réserves d'interface du lot 2 (§4 bis), la moitié
interface de QO-9 et de QO-10, et la décision du 22/09 sur le monde dérivé
(lot 2B §5 e).

**Ce que ce lot n'est pas.** Il ne crée aucun système de jeu. Il montre, dans la
forme des maquettes, ce que le code sait déjà. Tout ce qui, dans une maquette,
dépend d'un système qui n'existe pas encore — presse, callouts, ceintures, camps,
contrats — reste **absent** de l'écran jusqu'au lot 5. Absent, pas simulé.

---

## 0. Décisions d'auteur qui s'appliquent

- **Direction artistique (vision, 17/09).** Jeu PC en 1920×1080. Fond prune
  chaud et éclairé, jamais noir. Jaune en couleur principale, rouge réservé au
  danger et à l'adversaire. Typographie condensée italique pour les noms et les
  titres, texte courant léger. Motif octogonal pour les icônes et les cadres.
  Beaucoup d'air, peu d'éléments par écran. **Aucun portrait, aucune silhouette,
  aucune image générée de combattant.**
- **Ni note, ni barème, ni jauge** (T3 de l'audit, tranché le 17/09).
- **L'interface explique, les voix ne commentent pas l'écran** (QO-10, 21/09).
- **Les faits ne disparaissent jamais ; l'interface les range et les trie**
  (QO-9, 21/09).
- **Le monde se lit à travers un combattant**, plus trois à cinq informations
  sur le hub, choisies pour leur lien avec Split (lot 2B §5 e, 22/09).
- **Charte d'interface** (`docs/CHARTE-INTERFACE-MANAGEMENT.md`) : 1440 px de
  référence, lisible dès 1280, extensible à 1920 ; souris d'abord, clavier en
  accélérateur ; contraste 4,5:1 minimum (L2) ; vérification d'interface à
  chaque tranche (§3).

## 1. Le texte des maquettes n'est pas du contenu d'auteur

Les maquettes sont remplies de textes d'exemple : « Cage Hebdo », « Team
Atlas », « Karim Benali », les phrases de presse, la réplique de Leïla de la
maquette 02, le placeholder du patron de la maquette 08. **Aucun ne figure dans
les documents d'auteur.** Ce sont des illustrations de mise en page.

**Règle : aucun texte de maquette ne s'affiche en jeu.** Un bloc dont le texte
n'existe pas encore reste vide ou n'apparaît pas. Les seuls textes que ce lot
peut écrire lui-même sont des **constats factuels dérivés des données**, sans
voix ni opinion : « Swat entre au classement », « suspendu 60 jours »,
« 9 combattants, 3 classés ». Tout ce qui porte une voix, un jugement ou un
personnage est du contenu d'auteur (CLAUDE.md §0) et attend Anthony.

## 2. Ce que le joueur doit pouvoir faire à la fin du lot

Naviguer entre **la semaine, les combattants, les classements, l'organisation**
par une barre de navigation permanente, sur des écrans qui ressemblent aux
maquettes validées ; ouvrir la fiche de n'importe quel combattant — de Split ou
du monde extérieur — et y lire qui il est, où il combat, ce qu'il a fait et d'où
il vient ; lire les classements mondiaux et ceux de Split ; savoir, en un coup
d'œil sur la semaine, ce qui reste à faire et ce qui se passe dans le monde qui
le concerne.

## 3. Découpage en tranches

**La soirée (maquette 05) n'est pas dans ce lot** : le lot 3 T4 la construit
déjà dans la forme de sa maquette, avec l'arène. Ce lot en hérite tel quel.

Une tranche à la fois par fichier ; deux outils peuvent travailler en parallèle
**à partir de la T2**, sur des écrans différents, puisque la T1 donne un fichier
à chaque écran. **Chaque tranche d'interface se vérifie dans le jeu réel**
(charte §3) avant d'être acceptée.

### T1 — Le socle : un fichier par écran, la direction artistique, la navigation

- **Découpage de `mgmt-screens.js`** (904 lignes et cinq écrans au 24/09, après le lot 3) en un fichier
  par écran — `mgmt-ecran-semaine.js` (l'actuel bureau), `mgmt-ecran-carte.js`,
  `mgmt-ecran-soiree.js`, `mgmt-ecran-lendemain.js`, `mgmt-ecran-fiche.js` — plus ce qui reste commun
  (contrôleur, clavier). **Déplacement pur**, vérifié ligne à ligne comme les
  découpages du 21/09 : aucune ligne de code perdue, aucun test modifié, ancres
  déplacées avec leur code. `index.html` reste la seule source de l'ordre de
  chargement.
- **Les jetons de la direction artistique** en variables CSS, une seule fois :
  couleurs, typographies, motif octogonal. Les écrans les consomment ; aucun
  écran ne redéfinit une couleur.
- **La barre de navigation** : Semaine, Combattants, Classements, Organisation
  (et Panthéon si la T8 est confirmée). Les entrées dont l'écran n'existe pas
  encore n'apparaissent pas.
- **Les réserves de contraste du lot 2** : le survol `.opp:hover` qui tombe à
  3,54:1 (réserve 1), la ligne du cycle à 4,31:1 contre le haut du dégradé.
- **B1 — aucun texte de travail visible.** `mgmt-screens.js:354-357` affiche au
  joueur `[RÉPLIQUE MANQUANTE — Clara : annonce une fin de carrière]`. Un
  emplacement d'auteur vide ne s'affiche jamais tel quel : il n'affiche rien.
  Un test le garde, sur tous les écrans.
- **C7 — le niveau d'attachement ne s'affiche plus** (`MGMT_LEVEL_LABELS`,
  `mgmt-screens.js:40`). Le niveau continue d'exister et de compter ; il cesse
  d'être une étiquette.

**Relecture du 25/09 — acceptée** (`881863f`, Sol). Déplacement pur vérifié
ligne à ligne : les seules lignes qui diffèrent sont les changements d'interface
annoncés. Deux tests réécrits sur décision citée (C7 et la palette). Vérifiée
dans le jeu à 1280, 1440 et 1920 : aucun texte sous 4,5:1, aucun marqueur de
travail. Écarts et réserves : la barre n'a que « Semaine » (les autres écrans
n'existent pas encore) ; l'emplacement de la réplique de Clara a été **retiré**,
pas laissé vide — il faudra lui redonner une place quand le texte existera
(lot 5 §6) ; le contour de focus de la barre était masqué par l'octogone
(corrigé à la T5) ; à 1920 `#app.mgmt` reste plafonné à 1400 px (confié à la T3).

### T2 — La semaine *(maquette 02)*

L'écran d'accueil du management remplace l'actuel bureau.

- **La carte principale** en tête : places bookées, places libres, catégorie et
  **rangs** des deux combattants (« Poids léger, 13e contre 14e » — les deux
  classements existent depuis le lot 2B T1 bis), et le bouton pour booker.
- **Leïla** avec ses textes d'auteur existants, et **l'état `compose` expliqué
  par l'interface** (QO-10) : quand la pile est vide et que la carte principale
  est à composer, l'écran le dit et y mène. Réserve du lot 2, levée ici.
- **Le monde, trois à cinq lignes** (lot 2B §5 e). Constats factuels dérivés,
  choisis pour leur lien avec Split : un classé qui s'approche d'un combattant
  de Split, un ancien de Split qui brille ailleurs, une catégorie de Split trop
  mince alors qu'un invaincu y monte dehors. Critère : **une ligne qui ne change
  aucune décision du joueur n'a rien à faire là.** Aucune voix, aucune opinion.
- **C11 et QO-9 — la mémoire devient des faits, et ils ne disparaissent plus.**
  La colonne « Mémoire » cesse d'afficher des compteurs (« tu as écrasé 3 de ses
  cartes »). Les faits s'affichent comme des faits, rangés et triés par
  l'interface ; **le plafond `MGMT_FACTS_MAX` saute** et `mgmtAddFact` ne
  supprime plus rien (les deux moitiés de QO-9 vont ensemble). Le poids ajouté à
  la sauvegarde se mesure et se rapporte.
- Le bloc « Ce qui se dit » de la maquette **n'apparaît pas** : il attend la
  presse du lot 5.

**Relecture du 28/09 — acceptée après une reprise** (`7a43823`, `1791097`, Sol).
Carte principale en tête avec les deux rangs, état « compose » expliqué par
l'interface (QO-10), réplique de Leïla limitée à ~65 caractères par ligne.
Le monde : au plus cinq constats, une ligne par catégorie, deux par type ; le
lien « Voir la fiche » est la première entrée vers la fiche d'un combattant
extérieur. QO-9 codée : le plafond `MGMT_FACTS_MAX` a sauté, la mémoire range
par groupe (dix faits visibles, le reste replié) ; 500 faits = +33 Ko de
sauvegarde, rendu en 3 ms. **Écart** : aucun ancien de Split ne vit dans le
monde, ce type de constat n'existe pas encore. **Reste à faire sur la
semaine** : les lignes du monde n'appellent pas encore `mgmtDivisionLabel`
(« féminin ») et écrivent « de Omar » au lieu de « d'Omar ».

### T3 — Booker un combat *(maquette 04)*

L'écran de composition prend la forme de la maquette. Même logique qu'au lot 2 —
aucune règle de composition ne change. **Réserves 2 et 3 du lot 2** : une ligne
non choisissable ne s'allume plus au survol ; à 1920, la place supplémentaire
va à la carte autant qu'à la liste.

**Relecture du 28/09 — acceptée** (`5c8d294`, GLM). Face-à-face de la maquette
au premier choix, carte et liste séparées par le filet ; clavier inchangé ;
aucun test réécrit, trois ajoutés. `#app.mgmt` déplafonné à 1920 px : carte et
liste à 917 px chacune à 1920, 597 px à 1280. **Réserves** : à 1920 la réplique
de Leïla sur la semaine s'étale sur 1148 px (~140 caractères par ligne) — à
régler à la T2 ; le bouton « Voir la fiche » est pleine largeur à gauche,
compact à droite.

### T4 — Le lendemain *(maquette 06)*

- **Les résultats racontés par les faits du moteur** : méthode détaillée (geste
  de finition, round, « secoué deux fois » d'après les knockdowns du déroulé),
  avec **Revoir** (rejeu, lot 3 T5) et **Voir toute la soirée** (lot 3 T4).
- **Ce que ça a changé** : entrées et sorties de classement, suspensions,
  retraites — constats factuels dérivés. Les phrases de presse ou d'agent de la
  maquette (« son agent parle de retraite », « la presse se demande… »)
  **attendent le lot 5**.
- Le bloc « On en parle » n'apparaît pas avant le lot 5.

### T5 — La fiche d'un combattant *(maquette 03, écran neuf)*

- **Qui il est** : catégorie, organisation, âge, garde, taille et allonge
  (dérivées du profil régénéré), bilan, situation au classement (« aux portes
  du top 15 » se dérive du rang).
- **Où il combat** : l'octogone des zones où il se bat, et en rouge celles où il
  se fait enfermer — **dérivé des trajectoires de l'arène** (lot 3 T3) sur ses
  combats rejoués. Rien n'est stocké : la carte se recalcule à l'ouverture. Le
  coût se mesure et se rapporte.
- **Ses derniers combats**, avec Revoir (lot 3 T5).
- **Pour un combattant du monde extérieur : d'où il vient**, par la trace
  dérivée (`mgmtExteriorTrace`) — les organisations traversées, ses combats, sa
  progression. C'est la décision du 22/09 : le monde se lit ici. Une
  organisation à zéro combat (montée récente) ne s'affiche pas « × 0 ».
- Les blocs « Comment il combat », « Sa faille » et « Son camp » **attendent le
  lot 5** (formules d'auteur et camps).

**Relecture du 28/09 — acceptée après deux reprises** (`dfede0e`, `74c60c1`,
`a022e04`, Sol). Qui il est (deux rangs pour un combattant de Split), ses
combats avec Revoir, le parcours d'un combattant extérieur en durées lisibles
(aucun cycle négatif). La carte « Où il combat » lit les positions de l'arène
en trois anneaux (centre, mi-espace, bord) et place le rouge à l'angle réel
d'enfermement ; elle porte sur les **10 derniers combats** (choix de Claude,
non contesté) — ouverture à froid ~160 ms plafonnée, puis < 1 ms. Sur une
partie de neuf soirées : 0 à 43 % du temps au centre selon le combattant, rouge
pour 12 combattants sur 55. Focus clavier visible sur la barre et la fiche.
**Écart** : aucun écran ne mène encore à la fiche d'un combattant extérieur
(l'entrée viendra avec la T6).

### T6 — Les classements *(maquette 07, écran neuf)*

- Onglets par catégorie ; **classement mondial** et **classement de Split**
  (lot 2B T1 bis) ; organisation de chaque classé.
- **Tendance** (= / +1 / −1 / nouveau) et **ce qui a bougé cette semaine** :
  dérivés en comparant le rang courant au rang du cycle précédent — recalculé,
  jamais stocké.
- Le bloc « Champion » et « Ce que la presse réclame » **attendent le lot 5**
  (ceintures, presse).

### T7 — L'organisation *(maquette 08, écran neuf, partiel)*

- **L'effectif par catégorie** : nombre de combattants, nombre de classés, et le
  constat « effectif trop mince » quand une catégorie ne permet plus de composer.
- **Les finances** : la trésorerie de l'organisation (lot 3B T1) et le résultat
  des dernières soirées.
- Les onglets Contrats et Diffuseur, les décisions de contrat, le patron et les
  objectifs de saison **n'existent pas encore** et n'apparaissent pas (voir
  lot 5 et §5).

**Relecture du 28/09 — acceptée après deux reprises** (`8570909`, `83d0e70`,
`a9c66a5`, GLM). Nouvel écran `mgmt-ecran-organisation.js`, entrée
« Organisation » dans la barre (l'entrée courante se distingue). Effectif par
catégorie en deux groupes Hommes / Femmes : combattants, nombre dans le **top 15
mondial** (le classement de Split ne dépasse jamais 15, il ne disait rien),
disponibles, constat « effectif trop mince » sous deux disponibles. Trésorerie
et recettes telles qu'elles existent.

**Hors tranche, décision d'Anthony du 28/09** (`92a104c`, `84398f1`, GLM) : les
noms retrouvent apostrophe et trait d'union (13 entrées d'`engine.js` : O'Brien,
O'Sullivan, O'Connor, Nong-O, neuf prénoms coréens), les trois `onclick` qui
injectaient une valeur libre passent par `escJsAttr` ; dans le management, une
catégorie féminine s'écrit « Poids mouche féminin » (`mgmtDivisionLabel`,
dérivée, rien de stocké ; la carrière ne change pas).

### T8 — Les écrans de la carrière *(maquettes 01, 09, 10 — à confirmer)*

L'accueil (commun aux deux modes), le Panthéon et la carrière. **N'entre dans
le lot que si Anthony le confirme** (§5) : la carrière est hors des lots 0 à 5
depuis le 17/09, sauf l'arène.

## 4. Interdits, toutes tranches

- **Aucun système de jeu nouveau**, aucune règle de simulation modifiée : ce lot
  touche au rendu et à la présentation. La seule exception écrite est QO-9
  (`MGMT_FACTS_MAX` et `mgmtAddFact`), décidée avec sa moitié d'interface.
- **Aucun texte de maquette en jeu** (§1). Aucune voix, aucune opinion, aucun
  nom inventé.
- **Ni note, ni barème, ni jauge**, sur aucun écran.
- **`esc()` sur tout nom affiché**, sans exception.
- **Rien de dérivé n'est stocké** : rangs, tendances, zones de combat, trace du
  monde se recalculent à la lecture (règle du bureau, CDC §3).
- **Aucun test assoupli** sans citer la décision qui change le comportement
  attendu ; les tests qui verrouillent l'ancienne direction (audit B3) se
  réécrivent sur la décision, ils ne se « réparent » pas.
- **Tout fichier modifié monte sa version dans `index.html` (`?v=`)**, sinon un
  navigateur qui a déjà chargé le jeu garde l'ancien fichier. Oublié trois fois
  au lot 4 ; à l'intégration du 28/09, 18 fichiers modifiés depuis leur dernière
  version ont été montés à `r2809`.
- **Règle d'arrêt** : deux heures sans atteindre ce que la tranche demande,
  l'outil commite son état, rapporte, et s'arrête. Aucune sonde de débogage
  commitée.

## 4 bis. Fidélité aux maquettes, écran par écran *(décision du 28/09)*

**Le constat d'Anthony (28/09)** : la DA globale et la « maquette vidéo » de
l'arène ne sont pas retranscrites. **Décision : tout le jeu ressemble à ses
maquettes, chaque écran.** La T8 (accueil, Panthéon, carrière) **entre donc
dans le lot**.

**La cause, relevée par Claude.** La T1 a reçu la DA en mots (« fond prune
chaud, jaune, rouge ») : Sol a inventé une palette (`#543344`, Oswald et
Fraunces) au lieu de porter celle des maquettes (`#2B2327` / `#211B1E` avec
halo jaune, `#FFC83D`, `#E5322D`, `#FFF8EE`, `#D9CCC0`, Saira Condensed et
Saira — **police jamais chargée par `index.html`**, même l'arène tombe sur une
police de repli). L'arène du lot 3 a porté le dessin du prototype mais pas le
cadrage de la maquette 05 (octogone en grand, plein cadre, fil du combat
par-dessus). Les relectures mesuraient contraste et largeurs, jamais la
ressemblance.

**La règle qui en sort, pour toutes les tranches.** Un prompt d'écran cite les
valeurs de sa maquette et dit « porte ». Une relecture compare le jeu et la
maquette **côte à côte à 1920×1080** (taille de dessin des maquettes), puis
vérifie 1280 et 1440.

**Ce que « ressembler » veut dire.** Même palette, mêmes polices, même
disposition, même hiérarchie, mêmes proportions. Les blocs qui attendent un
système absent (presse, camps, patron, contrats, ceintures, formules d'auteur)
**n'apparaissent pas** (§1) ; la place qu'ils occupent se referme, elle ne se
remplit pas d'un texte inventé.

| Écran | Maquette | État au 28/09 | Tranche |
|---|---|---|---|
| Palette, polices, barre de navigation | 02 (et toutes) | inventées à la T1 | **F1** (Sol, en cours) |
| Arène | 05 + prototype | dessin porté, cadrage non | **F1** (Sol, en cours) |
| La semaine | 02 | blocs présents, disposition à reprendre (en-tête « Split 14 · J-21 », carte et Leïla à gauche, extrait de classement et résumé de l'organisation à droite) | F2 |
| Booker un combat | 04 | face-à-face porté (T3) | F2 (vérification après F1) |
| La fiche | 03 | structure portée (T5) | F2 (vérification après F1) |
| L'organisation | 08 | tuiles (T7) ; bloc « décisions » et patron absents (lot 5) | F2 |
| Le lendemain | 06 | ancien écran | T4, construite sur la maquette |
| Les classements | 07 | n'existe pas | T6, construite sur la maquette |
| L'accueil | 01 | ancien écran titre de la carrière | T8 |
| Le Panthéon | 09 | ancien écran de la carrière | T8 |
| La carrière | 10 | ancien hub de la carrière | T8 |

## 5. Ce qui attend Anthony

- ~~La T8 entre-t-elle dans le lot ?~~ **Oui, décision du 28/09** (§4 bis).
- **Contenu d'auteur dû pour ce lot : aucun.** Tout ce qui demande une voix est
  reporté au lot 5, où la liste complète est dressée.

## 6. Terminé pour le lot

1. **Chaque écran du jeu** — les dix maquettes, arène comprise — ressemble à sa
   maquette, comparé côte à côte à 1920 puis vérifié à 1280 et 1440, dans le
   jeu réel.
2. Aucun texte de travail, aucun texte de maquette, aucun niveau d'attachement
   ne s'affiche.
3. Les faits ne disparaissent plus et se lisent comme des faits.
4. Le monde extérieur se lit par la fiche d'un combattant et par trois à cinq
   lignes de la semaine.
5. `npm run check` vert, aucun test assoupli sans décision citée.
