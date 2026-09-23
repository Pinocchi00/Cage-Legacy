# LOT 5 — Le monde qui parle

*Contrat écrit le 23/09/2026, non commencé.*

Répond à l'audit du 17/09 (§8 : « classements et ceintures, presse et callouts,
camps, recrutement ») et à ses manques M5, M7, M8, M9, au constat C10 ; reprend
ce que le lot 2B a laissé en attente (le recrutement, la mesure de l'économie
sur la durée de vie) et ce que le lot 3B n'a jamais codé (les cartes
incomplètes, QO-1 à QO-4 et QO-7, et les 4 tests ignorés).

**Ce lot est d'abord un lot d'auteur.** La moitié de sa valeur est dans des
textes que seul Anthony écrit. Le code livre les mécanismes et des emplacements
vides ; un bloc sans texte n'apparaît pas à l'écran. La liste complète de ce qui
est dû est au §6 — elle peut s'écrire dès maintenant, pendant que le code
avance.

---

## 0. Décisions d'auteur qui s'appliquent

- **La priorité de la vision** : d'abord la voix du monde (presse et callouts),
  ensuite les camps. Arbitres, juges, agents, chaînes et réseaux viennent après,
  un par un, chacun validé par la **règle d'entrée** : un élément n'entre dans le
  jeu que s'il change ce que le joueur voit ou décide.
- **La voix du monde ne parle que de combattants que le joueur peut connaître**
  (vision). Un nom inconnu dans la presse est le défaut qui a fait décrocher les
  joueurs de MMA Promoter.
- **Les formules** (addendum 2, fin du §« coût d'écriture ») : une voix n'est pas
  une réplique unique mais **une poignée de tournures qui se combinent avec des
  noms et des situations — dix à quinze par voix couvrent des centaines de cas,
  parce que c'est le contexte qui change, pas la phrase. Ces formules sont
  écrites par l'auteur. Aucun agent ne les rédige.** Un emplacement vide vaut
  mieux qu'une phrase générique.
- **Ni note, ni barème, ni jauge.**
- **Le recrutement** (décisions du 21/09, lot 2B §0 et §5) : salaire par combat
  et par victoire ; aucun plafond de vivier ; un écran neuf ; **le récit du
  premier combat d'une recrue, c'est la presse**.
- **La taille du monde** : 30 vivants par catégorie, deux classements sous une
  seule loi (lot 2B T1 bis).
- **Les textes des maquettes ne sont pas du contenu d'auteur** (lot 4 §1) : aucun
  ne s'affiche en jeu, « Cage Hebdo » compris.

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Voir des champions et des ceintures, booker des combats pour le titre en cinq
rounds ; lire ce qui se dit de ses combattants et de ses matchups avant et après
une soirée, et réagir à un callout en envisageant le combat ; sentir la pression
de ceux qu'il fait attendre ; recruter dans le monde extérieur un combattant
dont il connaît l'histoire, et le voir raconté à son premier combat ; sortir
d'une carte incomplète par les trois voies décidées le 14/09.

## 2. Comment parle le monde

**Un événement, une famille, une formule.** Le monde produit des événements que
le code sait déjà dériver — un combat bouclé, une finition, un classé qui monte,
un invaincu qui enchaîne dehors, un classé qui n'a pas combattu depuis N cycles.
Chaque événement appartient à une **famille** (§6). Une famille contient les
formules d'Anthony ; le code choisit l'une d'elles selon le contexte et y pose
les noms et la situation. **Le code n'écrit jamais une phrase.**

**Qui le joueur peut connaître** — proposition, à confirmer (§5) : les
combattants de Split ; ceux qu'il a déjà vus combattre (sur une de ses cartes ou
en rejeu) ; ceux dont il a ouvert la fiche ; les classés du top 15 mondial des
catégories où Split a au moins un combattant. Personne d'autre n'est nommé.

**Ce qui se garde.** Une ligne de presse parue est un fait : elle ne disparaît
plus (QO-9). On stocke la famille, la formule et ses paramètres, jamais le texte
composé — il se recompose à la lecture (règle du bureau).

**Ne pas se répéter.** Le moteur de carrière a déjà un mécanisme contre la
répétition des textes (`engine.js`, ancre `CORRECTIF_REPETITION_TEXTES`) : il
se réutilise, il ne se double pas.

## 3. Découpage en tranches

Les tranches T1 et T6 sont de la logique pure : elles peuvent tourner **en
parallèle du lot 4** une fois sa T1 livrée, sur des fichiers disjoints. Les
autres affichent dans les écrans du lot 4 et partent après lui.

### T1 — Les ceintures et les combats de titre *(logique, M5, C10)*

- Chaque organisation — Split et les quatre extérieures — a un champion par
  catégorie, et un nombre de défenses. Pour l'extérieur, **dérivé** de la trace
  comme le reste ; pour Split, **un combat de titre est un fait** qui se garde.
- **Combats en cinq rounds** : le combat principal de chaque soirée, et tout
  combat pour un titre (C10 : aujourd'hui `mgmtRunEvent` force trois rounds,
  `mgmt-corps.js:477`). Le rejeu lit déjà le nombre de rounds dans la trace
  (`mgmt-corps.js:275`) : un combat en cinq rounds se rejouera juste.
- Le bloc « Champion » de l'écran des classements (lot 4 T6) se remplit.
- **Mesure** : sur vingt soirées, combien de changements de champion, combien de
  défenses — un champion qui tombe à chaque soirée ou jamais est un défaut.

### T2 — Le mécanisme de la voix *(logique, sans texte)*

- Les familles, leurs emplacements, le choix d'une formule selon le contexte, la
  règle de qui peut être nommé (§2), l'anti-répétition réutilisée.
- **Livrée sans aucune formule** : les emplacements restent vides, les blocs
  n'apparaissent pas. Un jeu de formules de **test**, jamais chargé en jeu,
  prouve la mécanique dans les tests.

### T3 — Ce qui se dit *(interface ; attend les formules des familles A à D)*

Les quatre endroits réservés par le lot 4 se remplissent : « Ce qui se dit » sur
la semaine, « On en parle » au lendemain, « Ce que la presse réclame » aux
classements, « Comment il combat » et « Sa faille » sur la fiche. Un callout
porte l'action **Envisager ce combat**, qui ouvre la composition avec la paire.

### T4 — La pression de l'attente *(attend la famille E)*

Un classé que le joueur laisse sans combattre le fait savoir, publiquement.
Dérivé de la date de son dernier combat (`lastCycle`). **Par sa voix ou par la
presse seulement** : les agents viennent plus tard, par la règle d'entrée.

### T5 — Le recrutement *(M9 ; reprend le lot 2B T2 et le reste de sa T4)*

- L'écran de recrutement (neuf, décision du 21/09) : chercher dans le monde de
  30 par catégorie, par catégorie et par rang ; chaque recrutable montre **sa
  trace** — d'où il vient, ce qu'il a fait. Aucune note, aucun pronostic.
- Le recruté entre chez Split au niveau 1, sans changer d'âge ni de rang mondial.
- **Son premier combat est raconté par la presse** (famille F).
- **La mesure laissée par le lot 2B T4** : l'économie sur la durée de vie de
  l'organisation (cible 70 à 80 % de soirées rentables, joueur d'écran), et
  recruter tout contre recruter peu — est-ce la stratégie dominante ?

### T6 — Les cartes incomplètes *(logique + interface ; lot 3B T3 à T5)*

Le retrait, **remonter un prélim** (QO-1), le **short notice** — combattant de
son organisation ou d'une autre (QO-2) —, le **combattant libre** (QO-3), leur
signalisation (QO-4) et la carte réduite avec pénalité (QO-7). Toutes ont leur
design arrêté depuis le 14/09 et leurs textes d'auteur écrits
(`docs/LOT-3B-CARTE-INCOMPLETE.md`). **Les 4 tests ignorés passent au vert.**

### T7 — Les camps *(M8 — seulement si Anthony confirme le §5)*

Salles et coachs comme éléments du monde, que le joueur observe et subit sans
gérer d'entraînement. Un changement de camp infléchit une trajectoire —
progression, déclin — et l'explique. Le bloc « Son camp » de la fiche se
remplit.

### T8 — Le classement des organisations et les objectifs du patron

*(bloqué par QO-11)*. « Entrer dans le top 5 des organisations » n'a pas de sens
dans un monde de cinq. Tant qu'Anthony n'a pas tranché, cette tranche ne part
pas. Elle portera aussi la voix de Jean-Michel Delatour sur les objectifs de
saison (maquette 08).

## 4. Interdits, toutes tranches

- **Aucune phrase écrite par un outil.** Formules, noms de médias, de salles, de
  coachs : Anthony. Un emplacement vide n'affiche rien.
- **Aucun nom inconnu du joueur** dans la voix du monde (§2).
- **Ni note, ni barème, ni jauge.**
- **Rien de dérivé n'est stocké** ; seuls les faits se gardent (§2).
- **Aucun second système** : le classement, le vieillissement, l'anti-répétition,
  la trace existent déjà — ils se réutilisent.
- **Règle d'arrêt** : deux heures sans atteindre ce que la tranche demande,
  l'outil commite son état, rapporte, s'arrête. Aucune sonde commitée.

## 5. Ce qui attend Anthony — décisions

1. **Les camps** (audit T6) : éléments du monde que le joueur observe et subit,
   sans gérer d'entraînement ? *Oui → la T7 part ; non → elle sort du lot.*
2. **QO-11** : le monde compte cinq organisations ; l'objectif « top 5 » se
   reformule-t-il, ou d'autres organisations peuplent-elles le classement ?
   *La T8 attend.*
3. **Qui le joueur peut connaître** : la proposition du §2 convient-elle ?
4. **Les contrats de la maquette 08** (« encore 2 combats », renégocier,
   prolonger) supposent des agents. La vision les fait venir après, un par un.
   *Hors de ce lot sauf décision contraire.*
5. **Les cinq autres personnages** (patron, agent, diffuseur, médecin, vétéran —
   audit T2) : seule la voix du patron entre ici, par la T8.

## 6. Ce qui attend Anthony — l'écriture

À écrire **dès maintenant**, sans attendre le code. L'addendum 2 compte dix à
quinze formules par voix ; pour une famille, une poignée suffit à commencer.

**Déjà dues aujourd'hui, dans le code du jeu :**
- Clara annonce une **blessure**, une **suspension**, une **fin de carrière**
  (`mgmt-screens.js`) ;
- Leïla **prend acte d'un refus** (`mgmt-data.js`) ;
- l'arène, quand **un combat ne peut pas être rejoué** (`arene-ecran.js`).

**Les noms :** le ou les médias de MMA (la maquette dit « Cage Hebdo » : exemple
seulement), les comptes des réseaux s'il y en a ; si la T7 part, les salles et
les coachs.

**Les familles de formules :**

| Famille | Qui parle | Quand | Exemple de situation |
|---|---|---|---|
| A — Le matchup | la presse | avant une soirée | un pressureur contre un contreur |
| B — L'après-combat | la presse | au lendemain | une finition, une guerre, une surprise |
| C — Ce que la presse réclame | la presse | aux classements | deux classés voisins, tous deux chez Split |
| D — Comment il combat, sa faille | la presse | sur la fiche | une par style (8 styles), une par faille |
| E — L'attente | le combattant, ou la presse | un classé inactif depuis N cycles | « on m'oublie » |
| F — Le premier combat d'une recrue | la presse | après ses débuts chez Split | un inconnu qui s'impose, un attendu qui déçoit |
| G — Le callout | le combattant, sur les réseaux | à tout moment | défier un classé, répondre à un défi, rêver de signer chez Split |
| H — La pépite | la presse | quand un invaincu enchaîne dehors | un 14-0 dans une petite organisation |

**Et pour la T8, si elle part :** Jean-Michel Delatour sur les objectifs de
saison.

## 7. Terminé pour le lot

1. Des champions, des défenses, des combats de titre en cinq rounds.
2. Le monde parle — avant et après les soirées, sur la fiche, aux classements —
   avec les formules d'Anthony, et ne nomme que des combattants que le joueur
   peut connaître.
3. Un classé qu'on fait attendre le fait savoir.
4. Le joueur recrute dans le monde extérieur ; l'économie tient sur la durée de
   vie de l'organisation.
5. Les trois sorties de carte incomplète existent ; les 4 tests ignorés sont
   verts.
6. `npm run check` vert, aucun test assoupli sans décision citée.
