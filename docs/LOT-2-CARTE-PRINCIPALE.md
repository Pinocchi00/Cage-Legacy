# LOT 2 — La carte principale

*Contrat de lot. Écrit le 19/09/2026 par Claude, sur décisions d'Anthony du 19/09.*

Répond aux constats **X1** (le joueur ne booke aucun combat), **C1** (accepter une
proposition de Leïla ne booke rien) et **M1** (la carte principale n'existe pas) de
`docs/AUDIT-17-09.md`. Troisième lot de la tranche verticale, après le lot 0 (les
documents) et le lot 1 (le style stable).

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`,
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/LOT-3B-CONTRAT.md` §1 (décisions
d'auteur), §2 (composer la carte) et §T2, dont ce contrat reprend l'essentiel en
l'adaptant aux décisions du 19/09.

---

## 0. Décisions d'auteur du 19/09/2026

- **La carte fait 9 combats : 5 en carte principale, 4 en préliminaires.** La carte
  principale est composée par le joueur, les préliminaires sont proposés par Leïla.
  Cette décision remplace le « 4 + 4 » du 15/09 (`LOT-3B-CONTRAT.md` §1, Q3) : la
  maquette `maquettes/02-semaine.html`, validée le 17/09, affiche « 3 combats bookés
  sur 5 », et la vision parle d'environ cinq combats de carte principale.
- **Le combat principal en 5 rounds n'est pas dans ce lot.** Tous les combats restent
  en 3 rounds. Les 5 rounds arrivent au lot 5, avec les classements et les ceintures.
  La maquette les annonce : c'est normal, elle décrit l'état visé, pas ce lot.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Composer lui-même les cinq combats de sa carte principale, combattant par combattant,
puis recevoir de Leïla une carte préliminaire cohérente, construite avec ce qui reste.
Rien d'autre ne change : la soirée se joue comme aujourd'hui, le lendemain aussi.

---

## 2. Découpage en tranches

Chaque tranche est livrable et vérifiable seule. **Une tranche à la fois**, relue par
Claude avant la suivante.

### T1 — La structure et le classement *(aucune interface)*

- **Carte `{main, prelims}`.** `m.card` devient
  `{sizeMain:5, sizePrelims:4, main:[], prelims:[]}`. `MGMT_CARD_SIZE` (`mgmt-data.js`)
  est remplacé par deux constantes nommées, `MGMT_MAIN_SIZE=5` et
  `MGMT_PRELIM_SIZE=4`. Aucun autre fichier de données touché.
- **`mgmtCardFull(m)`** vaut vrai quand la carte principale ET les préliminaires sont
  complets. La soirée joue les 9 combats, la carte principale d'abord.
- **Sauvegarde `MGMT_SAVE_VERSION` 4 → 5**, migration séquentielle 2 → 3 → 4 → 5, sans
  perte : les combats d'une carte en cours deviennent des préliminaires, la carte
  principale démarre vide. Aucun combat perdu, aucun ajouté d'office. `validateMgmt`,
  `mgmtRepair` et `mgmtValidEvent` couvrent la nouvelle structure. Une v1 reste
  refusée.
- **Emplacement porté par le combat** : chaque combat de la carte porte
  `slot:'main'|'prelim'`. `mgmtRunEvent` utilise ce champ au lieu de traiter tous les
  combats comme des préliminaires (garde posée au lot 3B T1).
- **Classement par catégorie, dérivé, jamais stocké** (règle du bureau, CDC §3) :
  fonction pure `mgmtDivisionRank(m, f)`. Ordre : victoires − défaites, puis victoires,
  puis ancienneté du dernier combat, le plus actif devant. Les suspendus gardent leur
  rang, les retraités médicaux sortent du classement.
- **Dernier combat** : `lastCycle` écrit sur la ligne au moment où le lot 3a écrit déjà
  le traumatisme. Absent = n'a jamais combattu sous Split. Un niveau 1 qui n'a jamais
  combattu ne stocke toujours rien.
- **Tests** : migration 4 → 5 sans perte et v1 refusée ; classement déterministe,
  identique d'un appel à l'autre, et jamais écrit sur la ligne ; carte complète à
  5 + 4 ; soirée qui joue 9 combats dans l'ordre.

### T2 — Le joueur compose *(interface — vérification charte §3 obligatoire)*

- **Le geste**, tiré de `LOT-3B-CONTRAT.md` §2 : dans la liste des combattants, choisir
  un combattant disponible, puis son adversaire. Le combat entre dans le premier
  emplacement libre de la carte principale. Un combat posé peut être retiré.
- **La liste montre**, pour chaque combattant : sa catégorie de poids et son rang dans
  la catégorie. **Aucune note, aucune recommandation, aucun pronostic, aucune jauge**
  (vision, addendum 2 §6 tel que modifié le 17/09).
- **Non sélectionnables** : suspendus (visibles avec leur rang), retraités médicaux
  (absents), et tout combattant déjà engagé sur la carte.
- **Souris d'abord, clavier en accélérateur** : navigation par `ui-11-keys.js`
  (`keysRegister`), comme les écrans existants. `esc()` sur tout nom affiché.
- **Mise en page** : 1440px, lisible dès 1280, trois colonnes — charte §L1. La maquette
  de référence est `maquettes/02-semaine.html` pour la carte et
  `maquettes/04-booker-un-combat.html` pour le geste de composition. **L'habillage
  complet des maquettes n'est pas dans ce lot** (c'est le lot 4, la peau du jeu) :
  ici, l'écran reprend l'habillage actuel du management, seule la structure est neuve.
- **Livrable de vérification** : la capture ou le relevé DOM exigé par la charte §3.

### T3 — Leïla et les préliminaires *(après T2)*

- **La proposition en bloc de Leïla devient la proposition des préliminaires**, et
  n'arrive **qu'une fois la carte principale complète**. Elle passe donc de début de
  pile à après la carte principale. Les autres affaires ne changent pas.
- **Extension de `mgmtPickBulkPair`**, jamais une fonction concurrente. Parmi les
  combattants disponibles hors carte principale :
  - même catégorie, rangs proches (écart borné par une constante nommée) ;
  - repos : pas de combattant ayant combattu à la soirée précédente
    (`lastCycle >= cycle - 1`), sauf en mode assoupli ;
  - priorité aux combattants inactifs depuis le plus longtemps ;
  - pas de revanche immédiate d'un combat de la soirée précédente.
- **Le coût de l'écrasement reste en place** (lot 2 du management, lot 3a §5) :
  propositions bâclées, avertissements qui se taisent, catégories croisées en mode
  bâclé.
- **C1 — accepter une proposition de Leïla booke vraiment.** Quand le joueur accepte
  une demande de placer un combat « dans les plus gros combats » (`mgmtDecide`, action
  `accept`), ce combat entre dans la carte principale. S'il n'y a plus d'emplacement
  libre, l'action n'est pas proposée.
- **Tests** : aucun combattant de la carte principale dans les préliminaires ; repos
  respecté hors mode assoupli ; suspendus jamais proposés ; pas de revanche
  immédiate ; la proposition de Leïla n'arrive pas avant que la carte principale soit
  complète ; accepter la demande de Leïla ajoute bien un combat.

### T4 — L'argent sur le déroulé réel *(après T3)*

Exigé par `LOT-3B-CONTRAT.md` §T2, et condition de la fusion dans `main`.

- `tools/monte-carlo-economie.js` joue le **vrai déroulé** : carte principale composée
  par un joueur-type (heuristique documentée dans le script), préliminaires issus de la
  vraie proposition de Leïla, soirée par `mgmtRunEvent`.
- Les cibles du lot 3B T1 sont revérifiées sur ce déroulé. Les constantes d'économie
  sont recalibrées si besoin — **jamais les cibles**, qui sont des décisions d'auteur.
- **Test** : sur une graine fixe, des soirées réelles non écrasées sont rentables. Il
  échoue si elles ne le sont jamais.
- Rapport de calibrage dans `tools/reports/`, format du lot 1.

---

## 3. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `ui-*.js` (sauf `ui-11-keys.js`
  si l'enregistrement d'une touche l'exige), `state/*.js`, `index.html`.
  `git diff <base> -- engine-*.js state/` doit rester vide.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Un texte manquant
  reste `[EMPLACEMENT AUTEUR]` et se signale. Les répliques existantes de Leïla ne se
  réécrivent pas.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test réécrit pour retrouver du vert** sans citer la décision qui change le
  comportement attendu. Les tests qui verrouillent l'ancienne carte (4 places,
  proposition en bloc en début de pile) se réécrivent en citant **ce contrat** ; les
  autres ne bougent pas.
- **Aucune fusion dans `main`** avant la fin de T4.

## 4. Règles de vitesse

- Essais de mesure avec `--n=1000` ; une seule mesure complète en fin de tranche.
- Entre deux essais, seulement le fichier de test concerné (`node --test tests/…`).
- `npm run check` une fois, à la fin de la tranche.
- `tools/monte-carlo-soiree.js` tourne sur les douze cœurs depuis le 20/09
  (`--jobs=N`, `--serial` pour l'ancien comportement) : mesure complète en 1 min 54
  au lieu de 9 min, chiffres identiques à la version sur un seul cœur.

## 4 bis. Relectures — état au 20/09/2026

**T1, T2 et T3 sont livrées, relues contre ce contrat et vérifiées dans le jeu réel**
(`npm run check` relancé par Claude : 287 tests, 283 passants, 0 échec, 4 skip).
Vérifié manette en main pour T2 et T3 : le geste de composition, le clavier, le
compteur de carte, l'apparition de la proposition de Leïla à la cinquième place
posée, l'absence de combattant de carte principale dans les préliminaires, le repos
et l'absence de revanche sur un second cycle joué, et C1 (accepter booke vraiment,
la réponse disparaît quand la carte est pleine).

### Réserves d'interface, ouvertes

1. **Contraste au survol (charte L2).** `.opp:hover` (`index.html:100`, hérité de
   l'interface de carrière) éclaircit le fond ; le texte de 13 px tombe alors à
   **3,54:1**, sous le 4,5:1 de la charte. Touche déjà tous les écrans du
   management, pas seulement la carte. À traiter au **lot 4** (la peau du jeu).
2. **Une ligne non cliquable s'allume au survol** : un suspendu ou un combattant
   déjà en carte réagit comme s'il était choisissable. Le mot dit le refus, le
   survol le contredit.
3. **À 1920, seule la colonne du milieu s'élargit** (320 / 658 / 360) : la place
   supplémentaire va à la liste, pas à la carte. À regarder en jouant.

### Questions de règle, à trancher par Anthony

4. **Le calendrier peut avancer sans soirée.** Carte principale incomplète et pile
   vide, « Cycle suivant » fait avancer le cycle : vérifié en jeu, trois clics
   passent du cycle 6 au cycle 9 avec un seul combat posé et aucune soirée jouée.
   La carte en cours est conservée. Contredit le lot 3a §10 (« le calendrier impose
   une soirée à la fin de chaque cycle »). Deux options : le calendrier attend le
   joueur, ou une soirée manquée coûte quelque chose (relève alors du lot 3B T3).
   **À trancher avant de clore le lot 2.**
5. **Le joueur ne peut composer qu'à l'intérieur d'une catégorie de poids**
   (`mgmtBookMain` refuse le croisement). Choix fait par OpenCode, conforme à la
   maquette ; mais Leïla, elle, croise les catégories quand le joueur écrase ses
   cartes.
6. **`mgmtClosePile` renvoie `'stuck'` dans deux situations différentes** : le pot
   de combattants est épuisé, ou la carte principale n'est pas composée (état
   normal). Le déclencheur manuel les traite pareil.

### État de l'économie

Une soirée réelle jouée le 20/09 (9 combats, carte composée par le joueur,
préliminaires de Leïla validés) donne **R = −6 k$** : la trésorerie passe de 50 à
44. C'est l'objet de la T4, et la raison de l'interdiction de fusionner.

## 5. Terminé pour le lot

1. Le joueur compose cinq combats, Leïla en propose quatre, la soirée en joue neuf.
2. Une sauvegarde v2, v3 ou v4 se charge sans perte en v5.
3. `npm run check` vert, aucun test existant assoupli sans décision citée.
4. La vérification d'interface de la charte §3 est livrée pour T2.
5. L'économie mesurée sur le déroulé réel permet des soirées rentables.
