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

- **Découpage de `mgmt-screens.js`** (768 lignes, quatre écrans) en un fichier
  par écran — `mgmt-ecran-semaine.js`, `mgmt-ecran-carte.js`,
  `mgmt-ecran-soiree.js`, `mgmt-ecran-lendemain.js` — plus ce qui reste commun
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
- **B1 — aucun texte de travail visible.** `mgmt-screens.js:327` affiche au
  joueur `[RÉPLIQUE MANQUANTE — Clara : annonce une fin de carrière]`. Un
  emplacement d'auteur vide ne s'affiche jamais tel quel : il n'affiche rien.
  Un test le garde, sur tous les écrans.
- **C7 — le niveau d'attachement ne s'affiche plus** (`MGMT_LEVEL_LABELS`,
  `mgmt-screens.js:40`). Le niveau continue d'exister et de compter ; il cesse
  d'être une étiquette.

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

### T3 — Booker un combat *(maquette 04)*

L'écran de composition prend la forme de la maquette. Même logique qu'au lot 2 —
aucune règle de composition ne change. **Réserves 2 et 3 du lot 2** : une ligne
non choisissable ne s'allume plus au survol ; à 1920, la place supplémentaire
va à la carte autant qu'à la liste.

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
- **Règle d'arrêt** : deux heures sans atteindre ce que la tranche demande,
  l'outil commite son état, rapporte, et s'arrête. Aucune sonde de débogage
  commitée.

## 5. Ce qui attend Anthony

- **La T8 entre-t-elle dans le lot ?** Accueil, Panthéon et Carrière selon les
  maquettes 01, 09 et 10.
- **Contenu d'auteur dû pour ce lot : aucun.** Tout ce qui demande une voix est
  reporté au lot 5, où la liste complète est dressée.

## 6. Terminé pour le lot

1. Les écrans de la semaine, de la composition, du lendemain, de la fiche, des
   classements et de l'organisation ressemblent à leurs maquettes, à 1280, 1440
   et 1920, vérifiés dans le jeu réel.
2. Aucun texte de travail, aucun texte de maquette, aucun niveau d'attachement
   ne s'affiche.
3. Les faits ne disparaissent plus et se lisent comme des faits.
4. Le monde extérieur se lit par la fiche d'un combattant et par trois à cinq
   lignes de la semaine.
5. `npm run check` vert, aucun test assoupli sans décision citée.
