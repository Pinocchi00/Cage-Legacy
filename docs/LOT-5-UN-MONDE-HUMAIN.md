# LOT 5 — Un monde humain

*Contrat écrit le 30/09/2026 par Claude, à la demande d'Anthony. Il **étend et
réorganise** `docs/LOT-5-LE-MONDE-QUI-PARLE.md` (23/09) : les tranches T1 à T8 de
ce contrat restent valables et sont reprises au §7 ; ses règles d'écriture sont
révisées par les décisions du 30/09 (§0).*

Documents compagnons :
- `docs/CATALOGUE-HUMANITE.md` — les données : pays, villes, styles, surnoms,
  métiers, milieux, moments de vie, rituels, traits, rôles, trajectoires, avec
  leurs sources.
- `docs/LES-VOIX-DES-COMBATTANTS-v2.md` — quarante-huit voix, dix médias.

---

## 0. Décisions d'Anthony du 30/09/2026

1. **L'humanité d'abord.** « Remplir la vie de chaque combattant. » Chaque
   combattant a **un surnom, un pays et une ville**, et **ça change sa façon de
   combattre**. **Jamais deux carrières semblables.**
2. **Autant de temps à regarder les combattants qu'à combattre** : tout ce qui
   touche de près ou de loin au combattant entre dans le jeu.
3. **Plus de combattants par catégorie**, parce que 30 par catégorie n'est pas
   réaliste — **sans l'impression de trop-plein**, comme Football Manager qui
   laisse du temps entre les actions répétitives, ou Pound for Pound qui rend
   les combattants intéressants.
4. **Claude écrit des propositions** — voix, médias, surnoms, métiers, moments
   de vie — **appuyées sur des recherches**, y compris psychologiques. Cela
   révise l'interdit « aucune phrase écrite par un outil » du contrat du 23/09 :
   **les propositions de Claude sont autorisées ; la règle absolue des six voix
   demeure** — rien n'entre dans le jeu sans relecture et réécriture d'Anthony.
   OpenCode (GLM) et Sol n'écrivent toujours aucune phrase : ils branchent les
   textes validés.
7. **La relecture est différée** (30/09, plus tard dans la journée) : « mets
   côté écriture, je verrai après pour la relecture ». **Le travail n'attend
   pas Anthony.** Les tranches branchent **les propositions de Claude comme
   textes provisoires** : chaque texte porte la marque `relu:false` dans les
   données, et `tools/` produit la liste de ce qui reste à relire. Quand Anthony
   relit, il remplace le texte et passe la marque à `relu:true` ; aucun code ne
   change. **Aucun texte n'est définitif avant sa relecture.**
5. **Du mouvement** : des fils qui défilent, des popups, le temps qui passe à
   l'écran (décision du 30/09, première demande).
6. **Le cru est permis**, jamais le discriminatoire (voix v2, §2).

**Ce qui reste des décisions précédentes.** Ni note, ni barème, ni jauge. Rien de
dérivé n'est stocké. Aucun second système. La voix du monde ne nomme que des
combattants que le joueur peut connaître (la leçon de MMA Promoter). Les textes
des maquettes ne s'affichent pas en jeu.

---

## 1. Ce que disent les recherches

Le détail et les sources sont dans le catalogue. L'essentiel, et ce qu'on en
tire :

| Observation | Source | Ce que le jeu en tire |
|---|---|---|
| 674 combattants à l'UFC, de 30 (lourds) à 102 (légers) par catégorie | effectifs de février 2025 | Le monde passe de 30 à **30-150 par catégorie**, proportionnel au réel (§3.1) |
| Une Fight Night = **12 combats** ; 1,7 combat par an en moyenne | UFC, FightAlpha | La soirée passe à **5 + 7** ; Split à **~140 combattants** donne 1,8 combat par an (§3.1) |
| Carrière moyenne : moins de 4 combats dans l'organisation | Yahoo Sports | Les départs du lot 2B tiennent ; les **rôles** disent qui compte (catalogue §9) |
| Les styles ont une géographie (Daghestan, Brésil, Thaïlande, Mexique…) | MiddleEasy, ESPN, Skillset | **Le style vient du pays et de la ville** (catalogue §2) |
| 2 500 surnoms : personnalité, métiers, animaux, armes, provenance ; 2/3 uniques ; 79 % en anglais | mmanicknames | **Un surnom par combattant**, dans sa langue, tiré de ce qu'il est (catalogue §3) |
| Stress de vie : Holmes et Rahe ; les événements négatifs prédisent la blessure (Andersen et Williams) | Wikipedia, ScienceDirect | **Moments de vie pondérés**, une **charge** qui pèse sur la blessure et la forme (catalogue §6) |
| La plupart des blessures arrivent au camp ; 94 % reviennent | Bloody Elbow, PubMed | Retraits au camp, retours (lot 3B T3) |
| Coupe de poids : irritabilité, brouillard, 39 % déshydratés | PMC | Pesées ratées, coupes dangereuses, Clara |
| Blues d'après-combat, crise de la retraite | Yahoo Sports, Frontiers | Inactivité volontaire, voix du Hanté, retraite racontée |
| Football Manager : **7 traits cachés**, montrés en **un mot** ; promesses ; boîte de réception ; **Continuer** qui s'arrête quand il faut ; connaissance des joueurs qui se construit | FM Scout, Sports Interactive | Traits cachés, promesses, **le conteur**, **la connaissance progressive sans pourcentage** (§3) |
| Pound for Pound : personnalité, mémoire, **relation avec l'organisation**, demandes | Steam | Loyauté, demandes, promesses (catalogue §8) |
| Crusader Kings 3 : **agir contre sa nature stresse** | PC Gamer | Décisions contraires aux traits = moments de vie |
| RimWorld : un **conteur** dose les événements, relâche quand tout va mal | Game Developer | **Budget d'événements par semaine**, rythme (§3.4) |
| Nemesis : **l'ennemi se souvient** et revient changé | Game Developer | **Mémoire des rivalités**, revanches dues (§5) |
| Dunbar : **5, 15, 50, 150** relations qu'un humain peut suivre | Dunbar, PMC | **Les cercles** du joueur (§3.2) |

---

## 2. Les principes

1. **Une personne avant une fiche.** Chaque combattant a une origine, un passé,
   une voix, des proches, des habitudes, un corps qui coupe du poids, une peur.
2. **Tout se déduit, sauf ce qui arrive.** L'identité se recalcule depuis
   l'identifiant ; les **moments de vie**, les **promesses** et les **combats**
   sont des faits qui se gardent (QO-9).
3. **Le monde est grand, le joueur voit ce qu'il peut connaître.** Plus de
   combattants ne veut pas dire plus d'écrans à lire (§3).
4. **L'origine oriente, jamais n'enferme.** Un pays donne une probabilité de
   style, pas un caractère.
5. **Les causes sont lisibles.** Une forme en baisse a une raison que le joueur
   peut trouver : un divorce relayé, une coupe difficile, un coach parti.
6. **Pas de chiffre sur l'humain.** Traits, charge, loyauté, connaissance : des
   mots et des comportements.
7. **Le joueur fait partie de la vie des combattants.** Ses bookings, ses refus,
   ses promesses deviennent des moments de leur vie.
8. **Le moteur de combat n'est pas touché.** Le style, la forme (`dynamic`) et
   les attributs passent par les options que `makeFighter` a déjà.

---

## 3. Plus de combattants, sans trop-plein

### 3.1 Les effectifs

| | Aujourd'hui | Proposé | Pourquoi |
|---|---|---|---|
| Monde, par catégorie | 30 | lourds 45 · mi-lourds 60 · moyens 100 · mi-moyens 130 · légers 150 · plumes 125 · coqs 125 · mouches 75 ; femmes : paille 70 · mouches 65 · coqs 50 · plumes 30 | ~1,5 fois l'UFC, pour cinq organisations ; **total ≈ 1 025** |
| Vestiaire de Split | 40 à 60 | **130 à 150**, réparti comme le monde | ~14 % du monde |
| Soirée | 5 + 4 | **5 + 7 (12 combats)** | Format réel d'une Fight Night |
| Combats par an et par combattant de Split | ~1,2 | **~1,8** | Réel : 1,7 |

**Mesures obligatoires avant de figer** : le temps de rendu de chaque écran
(la semaine s'affiche en 8 ms aujourd'hui), le temps de `mgmtExteriorEnsure` et
d'un cycle complet, et **l'économie sur vingt soirées** avec l'outil du lot 2
T4 (`tools/monte-carlo-economie.js`) : douze combats coûtent plus que neuf.

### 3.2 Les cercles

Le nombre de Dunbar dit qu'un humain suit **5 proches, 15 amis, 50
connaissances, 150 contacts**. Le jeu donne à chaque couche une densité
différente :

| Cercle | Taille | Qui | Ce que le joueur en voit |
|---|---|---|---|
| **Ton cercle** | 5 | Choisis par le joueur (champions, protégés) | Tout : chaque moment de vie, chaque phrase |
| **Tes suivis** | 15 | Épinglés par le joueur, comme la liste de Football Manager | Les moments importants, les demandes |
| **Le vestiaire** | ~140 | Tout Split | Les moments majeurs ; lu par **rôles** |
| **Le monde** | ~1 000 | Les autres organisations | Par la presse, les classements, le recrutement — **seulement ceux que le joueur peut connaître** |

Le cercle et les suivis sont **un choix du joueur** : ils se gardent.

### 3.3 Les outils qui soulagent

- **Le rôle en un mot** à côté de chaque nom (Espoir, Journeyman, Gatekeeper,
  Contender…, catalogue §9) : on lit un vestiaire de 140 en dix secondes.
- **Leïla boucle les préliminaires.** Par défaut, les sept préliminaires sont
  proposés par Leïla, selon ses convictions (sa voix) ; le joueur valide, change
  un combat ou reprend tout. **Le joueur booke les cinq combats de la carte
  principale, et c'est là que se jouent ses décisions.** C'est exactement ce que
  dit la maquette 02 : « Leïla a bouclé les préliminaires ».
- **La connaissance progressive** (Football Manager, sans pourcentage). Ce qu'on
  sait d'un combattant se remplit : **« Comment il combat »** quand on l'a vu
  combattre, **« Sa faille »** après deux combats vus ou une analyse de
  Tableau Noir, **« Sa vie »** au fil des moments relayés. Ce qu'on ignore
  s'écrit « On ne sait pas encore ». Aucune jauge.
- **Filtres du vestiaire** : catégorie, rôle, disponible, cercle, suivis.

### 3.4 Le conteur

Inspiré de RimWorld et de la boîte de réception de Football Manager.

- **Un budget par semaine** : trois à cinq informations sur la semaine (décision
  du 22/09, lot 2B §5 e). Le conteur les choisit par **cercle** (ton cercle
  d'abord), puis par **intensité** (un deuil passe avant un sponsor).
- **Un rythme** : une semaine lourde est suivie d'une semaine plus calme ; la
  tension monte avant une soirée, retombe après ; quand tout va mal, **le
  conteur relâche**, pour que l'histoire se déroule au lieu de s'effondrer.
- **Jamais deux informations sur le même combattant la même semaine**, sauf dans
  un scénario (§5).
- **Le bouton Continuer** fait avancer le temps et **ne s'arrête que quand le
  joueur a quelque chose à décider** : une affaire, une promesse qui arrive à
  échéance, un retrait. Son libellé le dit (« Répondre à Leïla », « Carte
  incomplète »).

### 3.5 Le temps qui passe à l'écran (le mouvement)

- **Le fil qui défile.** Quand le joueur clique sur Continuer, **les moments de
  la semaine défilent** pendant deux à quatre secondes, comme l'écran de
  traitement de Football Manager : « Samir Adjani a signé un nouveau sponsor »,
  « Pesée ratée à Tijuana », « Le Forum réclame une revanche ». **Un clic ou une
  touche le passe.** C'est la réponse au « temps entre chaque action
  répétitive ».
- **Les popups.** Un moment du cercle ou des suivis s'ouvre en carte qui glisse,
  avec le portrait textuel du combattant et, si besoin, un bouton d'action
  (« Envisager ce combat », « Lui trouver un combat », « L'appeler »).
- **Transitions** entre écrans et semaines, **désactivées** si le système
  demande moins d'animations (`prefers-reduced-motion`).

---

## 4. Un combattant entier

Chaque couche est dans le catalogue ; elles se lisent sur la **fiche** (maquette
03 étendue) et dans **le vestiaire** (écran neuf).

| Couche | Catalogue | Change le combat ? | Se voit |
|---|---|---|---|
| Pays, ville | §1 | **Oui** : le style (§2) | Fiche, presse |
| Surnom | §3 | Non | Partout, à côté du nom |
| Ancien métier, double emploi | §4 | Disponibilité, camp plus court | Fiche |
| Milieu | §5 | Non ; oriente la voix | Fiche |
| Moments de vie, charge | §6 | **Oui** : forme (`dynamic`), blessure au camp | « Sa vie », presse, Clara |
| Rituel | §7 | Seulement s'il est rompu | Fiche, Micro Tendu |
| Traits cachés | §8 | Sang-froid en carte principale, discipline et pesée | Un mot, des comportements |
| Voix | voix v2 | Non | Partout où il parle |
| Rôle | §9 | Non | À côté du nom |
| Trajectoire | §10 | **Oui** : où il se place dans la loi de vieillissement | Sa courbe, avec le temps |
| Liens (rival, ami, coéquipier, fratrie) | §10.2 | Refus de combattre un ami | Fiche, « Ses liens » |
| Camp et coach | lot 5 T7 | Évolution du style | « Son camp » |

**La fiche devient l'écran le plus riche du jeu** : identité (surnom, ville,
pays, milieu, métier, style d'origine), comment il combat et sa faille
(connaissance progressive), sa vie (les moments, datés), son corps (poids,
pesées, blessures), ses liens, son camp, ce qu'on dit de lui (presse), sa voix
(ses dernières phrases), ses combats (avec Revoir).

**Le vestiaire** (écran neuf, sans maquette aujourd'hui) : les 140 de Split,
filtrables, lus par rôles, avec le surnom et un signe pour ceux qui ont
quelque chose (une demande, un moment récent). **Une maquette 11 est à dessiner
avant la tranche** (Claude peut la proposer).

---

## 5. Les scénarios

Un scénario est **une machine à histoires** : un déclencheur dérivé de l'état du
jeu, quelques semaines de développements, une ou plusieurs décisions du joueur,
et des faits qui restent. **Aucun n'est écrit à l'avance** : les voix et les
médias habillent ce que les systèmes produisent.

| # | Scénario | Déclencheur | Ce qui se passe | Décision du joueur |
|---|---|---|---|---|
| 1 | **La rivalité** (Nemesis) | Défaite humiliante ou décision contestée | Provocations publiques, le Forum s'en mêle, revanche due | La donner, la faire attendre, la refuser |
| 2 | **La trilogie** | Une victoire partout entre deux rivaux | La presse réclame le troisième combat | Combat principal ou pas |
| 3 | **Le coéquipier** | Deux combattants du même camp proposés l'un contre l'autre | Refus ; si le joueur insiste, l'un quitte le camp | Insister ou renoncer |
| 4 | **La dernière danse** | Vétéran, Clara défavorable | Tarpit veut l'audience, Delatour la recette, le vétéran veut y aller | Booker ou protéger |
| 5 | **Le train de la hype** | Un Invaincu qui monte | Clé de Bras s'emballe | Le protéger (faire-valoir) ou le tester (gatekeeper) |
| 6 | **Le tueur de hype** | Un journeyman bat un invaincu | Il devient Bête noire, la presse l'adopte | Lui donner sa chance |
| 7 | **La pesée ratée** | Discipline basse, coupe dure | Delatour jure ; l'adversaire accepte ou refuse selon sa voix | Maintenir, remplacer, annuler |
| 8 | **Le remplaçant** | Retrait tardif | Un Rescapé ou un Remplaçant de luxe dit oui en deux secondes | Qui appeler (lot 3B T5) |
| 9 | **La fuite** | Sources Proches annonce un combat non officialisé | Tarpit furieux, l'agent jubile | Confirmer ou changer, et en payer le prix |
| 10 | **Le deuil** | Décès d'un proche pendant le camp | Il veut combattre pour le défunt, ou s'effondrer | Le laisser combattre, reporter |
| 11 | **Le jeûne** | Soirée pendant le mois de jeûne d'un combattant | Il demande un report ; il accepte quand même s'il n'a pas le choix | Respecter ou imposer (stress, loyauté) |
| 12 | **La descente de catégorie** | Il veut descendre | Coupe dangereuse, Clara, La Pesée si hospitalisation | Autoriser ou non |
| 13 | **La montée** | Série de défaites | Nouveau départ, nouveaux adversaires | L'accompagner |
| 14 | **Le transfuge** | Offre d'une organisation plus riche | Sa loyauté contre l'argent ; Sources Proches | Retenir (promesse, bourse) ou laisser partir |
| 15 | **Le retour de retraite** | Retraité de moins de 40 ans, trajectoire Vieux lion | Clara réservée, la presse divisée | Le reprendre ou non |
| 16 | **La garde à vue** | Moment de vie | Clé de Bras, Delatour, suspension possible | Le suspendre, le soutenir |
| 17 | **Le coach qui part** | Dispute publique | Chute ou éclosion tardive | L'orienter vers un autre camp (lot 5 T7) |
| 18 | **La promesse** | Tu lui as promis un combat de titre | Le champion se blesse | Tenir (attendre), rompre, contourner |
| 19 | **Le vol** | Décision partagée contestée | Tableau Noir tranche dans un sens, le Forum dans l'autre | Revanche immédiate ou non |
| 20 | **La guerre de l'année** | Deux Violents heureux, un combat au bout | Les deux blessés, bonus, Clara | Les laisser se reposer ou non |
| 21 | **Le prodige** | Timide de 19 ans très doué | Il grandit ; sa voix change après dix combats | Le protéger ou l'exposer |
| 22 | **La pépite de l'étranger** | Invaincu dans une petite organisation | La presse du pays le célèbre | Le recruter (lot 5 T5) |
| 23 | **La fratrie** | Deux frères ou sœurs chez Split | Ne se combattront jamais ; l'un porte l'autre | Les garder ensemble |
| 24 | **Le blues du champion** | Ceinture gagnée | Il disparaît, ne veut pas défendre | Delatour exige une défense ; attendre ou lui retirer |
| 25 | **La mère qui revient** | Retour après grossesse | Calendrier contraint | Adapter la date |
| 26 | **Le visa** | Combattant étranger, problème de visa | Carte incomplète | Remplacer, reporter |
| 27 | **La soirée à domicile** | Il demande à combattre dans sa ville | Pression, billetterie en hausse | Le placer en tête d'affiche |
| 28 | **Le vendeur** | Un Méchant de catch fait la promo d'un autre combat | L'audience monte, les autres râlent | Lui donner un micro |
| 29 | **La descente aux enfers** | Charge au-delà de 300 | Défaites, Forum cruel | Lui offrir une pause (promesse), le laisser combattre, le libérer |
| 30 | **Le hanté** | Premier KO très lourd | Sa voix change ; Clara | Un combat de reprise, ou l'arrêt |
| 31 | **Le double emploi qui choisit** | La bourse suffit enfin | Il quitte son métier ; s'il perd ensuite, il doute | L'encourager ou non |
| 32 | **La pionnière en tête d'affiche** | Une combattante très populaire | Première soirée menée par une femme | Oser le combat principal |

**Plusieurs scénarios se chevauchent**, comme dans RimWorld : un deuil pendant
une rivalité, une pesée ratée pendant une hype. C'est voulu.

---

## 6. La mémoire

- **Le combattant se souvient** (Nemesis) : de qui l'a battu et comment, de
  **qui a booké ce combat**, des promesses tenues et rompues, des refus.
- Ces souvenirs sont **les faits déjà gardés** (combats, moments de vie,
  promesses) : **aucune mémoire parallèle**, on relit l'historique.
- Ils changent **ce qu'il dit** (voix), **ce qu'il accepte** (traits), et
  parfois **qui il devient** (changement de voix, de surnom, de camp).

---

## 7. Découpage en tranches

Sol (GPT-6) prend le long et le difficile ; GLM 5.3 Flash (OpenCode) le plus
simple. Les tranches de l'ancien contrat gardent leur nom (T1 à T8) ; les
nouvelles s'appellent **H1 à H10**.

| Tranche | Outil | Contenu | Dépend de |
|---|---|---|---|
| **H1** — Les données | GLM | Nouveau fichier `mgmt-humanite-data.js`, **données pures** : villes, poids de style par pays et par ville, surnoms, métiers, milieux, moments de vie (id, poids, relais, effet), rituels, rôles, trajectoires, identifiants et poids des voix. Tests de forme (sommes à 100, aucun doublon, tous les pays connus) | — |
| **H2** — Les nouveaux pays | GLM | Seize pays dans `COUNTRIES` (`engine.js`) avec prénoms et noms réels, apostrophes et traits d'union, tests (même méthode que la T3 bis « noms » du 28/09) | — |
| **H3** — L'identité déduite | Sol | `mgmt-humanite.js` : identité d'un combattant sur des flux séparés ; **le style tiré du pays et de la ville**, passé à `makeFighter` par `opt.style` ; **un marqueur de génération** pour que les combattants des parties en cours gardent leur style (**migration 11 → 12** : la 10 → 11 est prise par les ceintures, T1) | H1, H2 |
| **H4** — Plus de combattants | Sol | Effectifs du §3.1, soirée à 5 + 7, **Leïla propose les préliminaires** ; mesures de temps et d'économie | H3 |
| **H5** — Les moments de vie | GLM | Tirage par cycle (flux `'vie'`), faits gardés, charge dérivée, effets simples (indisponibilité, `dynamic`), bloc « Sa vie » de la fiche | H1, H3 |
| **H6** — L'attention | Sol | Cercles et suivis, rôles, connaissance progressive, **le conteur**, Continuer qui s'arrête | H4, H5 |
| **H7** — Traits, demandes, promesses | Sol | Traits cachés et leur mot, décisions contraires (moments), demandes, promesses gardées, loyauté | H5 |
| **H8** — La fiche et le vestiaire | GLM | Fiche étendue, écran du vestiaire (maquette 11 d'abord) | H6 |
| **H9** — Le mouvement | GLM | Fil qui défile, popups, transitions, `prefers-reduced-motion` | H6 |
| **H10** — Mémoire et scénarios | Sol | Rivalités, revanches dues, trilogies, puis les scénarios du §5 par groupes | H7 |
| T1 — Ceintures, titres en 5 rounds | Sol | Inchangée (contrat du 23/09) | — |
| T2 + T3 — La voix branchée | GLM | Le mécanisme choisit une réplique des voix v2 (provisoire, `relu:false`) selon la voix et la situation ; les médias | H3 |
| T5 — Le recrutement | Sol | Inchangée, sur le monde agrandi | H4 |
| T6 — Cartes incomplètes | GLM | Inchangée (4 tests ignorés au vert) | — |
| T7 — Les camps | Sol | **Entre dans le lot (confirmé le 30/09)** : le catalogue en dépend (changement de camp, noms thaïs) ; noms de salles à écrire | H5 |
| T8 — Classement des organisations | — | Toujours bloquée par QO-11 | Anthony |

**Ordre proposé.** Sol finit d'abord le lot 4 (T8b, l'écran de carrière), puis
H3 → H4 → H6 → H7 → H10, avec T1 quand il a une fenêtre. GLM commence **tout de
suite** par H1 puis H2, H5, H8, H9, T6.

---

## 8. Interdits, toutes tranches

- **Aucune phrase écrite par Sol ou GLM.** Ils branchent les textes du catalogue
  et des voix v2 **tels quels**, marqués `relu:false` tant qu'Anthony ne les a
  pas relus (§0, décision 7). Un texte absent des documents n'est jamais
  inventé : l'emplacement reste vide.
- **Ni note, ni barème, ni jauge** : traits, charge, loyauté, connaissance en
  mots.
- **Rien de dérivé n'est stocké** ; seuls les faits (combats, moments,
  promesses) et les choix du joueur (cercle, suivis) se gardent.
- **Aucun second système** : vieillissement, classement, anti-répétition,
  mémoire des faits, trace de l'extérieur se réutilisent.
- **Le moteur de combat n'est pas modifié.**
- **Rien de discriminatoire**, nulle part.
- Versions de cache montées pour tout `.js` modifié ; `npm run check` vert ;
  captures maquette et jeu à 1920 pour tout écran.
- **Règle d'arrêt** : deux heures bloqué, on commite, on rapporte, on s'arrête.

---

## 9. Ce qui attend Anthony

**Décisions — toutes acceptées par Anthony le 30/09/2026 (« oui à tout »).**
1. ~~Les effectifs du §3.1~~ **Oui** : ≈ 1 025 dans le monde, 130 à 150 chez
   Split, soirée à 12 combats (5 + 7).
2. ~~Leïla propose les préliminaires par défaut~~ **Oui.**
3. ~~Seize nouveaux pays~~ **Oui**, la liste du catalogue §1.2.
4. ~~Les parties en cours~~ **Gardent leurs styles** : marqueur de génération,
   migration 11 → 12 (H3 ; la version 11 est celle des ceintures).
5. ~~Les camps~~ **Entrent dans le lot** : la T7 part.

**Écriture (relire et réécrire) — différée, sans bloquer le code (§0,
décision 7).** Les quarante-huit voix et les dix médias ; les surnoms ; les
libellés des moments de vie, des rituels, des rôles, des trajectoires ; les
noms de salles et de coachs (T7, proposés par Claude au moment de la tranche).
La liste de ce qui reste marqué `relu:false` sert d'ordre du jour.

---

## 9 bis. Relectures

- **H1 — acceptée** (`aa76b0e`, GLM, relue le 30/09) : `mgmt-humanite-data.js`,
  données pures chargées après `mgmt-data.js`. **Comparée table par table au
  catalogue par un script** : 233 villes dans 30 pays, 30 lignes de style à
  100, 38 décalages de ville, 14 villes-écoles, 210 surnoms, 156 métiers,
  22 milieux, 109 moments de vie (libellés et poids identiques), 50 rituels,
  12 rôles, 15 trajectoires — **aucun écart, rien d'inventé**. Chaque texte
  porte `relu:false`, ni les villes ni les poids. Deux retouches à
  l'intégration : `test:watch` ne portait ni le nouveau test ni celui de la T4
  (resynchronisé sur `test`), et le catalogue annonçait « 120 » moments pour
  109 lignes (corrigé). Intégration : 413 tests, 409 passants, 0 échec.

- **T1 — acceptée après une reprise** (`99a1f52`, Sol, relue le 02/10) :
  `mgmt-ceintures.js`. Chaque catégorie de Split a un champion (le premier
  classé au départ, zéro défense) ; un combat de titre est un fait gardé
  (`title_fight`, qui renvoie au combat de `m.hist`) ; les quatre organisations
  extérieures dérivent leurs champions et leurs défenses de la trace, rien de
  stocké. Le joueur choisit le titre par une case « Pour le titre · 5 rounds »
  sur le combat posé ; le premier combat de la carte principale est en cinq
  rounds ; le rejeu est fidèle. Bloc Champion aux classements. **Migration de
  sauvegarde 10 → 11.** La reprise : rien n'était commité ; la semaine
  affichait « Mémoire · 12 faits » avec une liste vide sur une partie neuve —
  les attributions de départ ne comptent plus et ne s'affichent plus, un
  combat de titre s'affiche (« Ceinture conservée », « Ceinture perdue »,
  « Ceinture attribuée »), et le compteur vaut le nombre de lignes rendues.
  Vérifiée dans le jeu à 1920 (partie neuve, case de titre, classements).
  Intégration : 424 tests, 420 passants, 0 échec.
  **Décisions rapportées par Sol comme prises par Anthony le 02/10, à
  confirmer** : premier classé champion au départ ; titre choisi
  explicitement ; un nul conserve le titre sans défense gagnée ; un nul pour
  un titre vacant le laisse vacant ; départ du champion = vacance ; maquette
  `maquettes/04b-combat-de-titre.html`.
  **À remesurer après H4** : le champion ne tombe que dans 13,7 % des combats
  de titre (une championne à 12 défenses en 20 soirées) — les challengers sont
  faibles tant que Split n'a que quatre combattants par catégorie.

- **H2 — acceptée après une reprise** (`9520428`, `14c092e`, GLM, relue le
  03/10) : seize pays dans `COUNTRIES` (BE CH MA DZ SN PL NL ES IT DE SE KZ KG
  CN AU CA), chacun avec 20 à 30 noms de famille réels, 15 à 20 prénoms
  masculins et autant de féminins (`firstF`, lu par `makeName` comme `first`) ;
  `COUNTRY_MMA_PREFIX` complété (sans lui, « undefinedMMA » aux championnats
  amateurs). Un test réécrit sur la décision des seize pays. **La reprise** :
  les listes permettaient de générer le nom complet de sportifs célèbres
  (« Achraf Hakimi », « Riyad Mahrez », « Islam Slimani ») et « Zhong Guo »
  (« Chine ») ; GLM les a retirés, en a trouvé d'autres lui-même (Belgique,
  Suède, Australie, Canada, Chine), et un test balaie toutes les combinaisons
  prénom × nom contre une liste d'interdits. À l'intégration, trois versions de
  cache montées (`engine.js`, `mgmt-humanite-data.js`, `mgmt-bureau.js`).
  Vérifiée dans le jeu (30 pays à la création de carrière, vestiaire neuf).
  **Signalé par GLM, à décider** : les compétences de pays de la carrière
  (`data-skills.js`, 20 par pays) n'existent pas pour les seize nouveaux pays.
  **Relevé à la relecture** : les quatorze anciens pays (sauf KR et GE pour les
  hommes) tirent encore leurs prénoms dans les listes communes — d'où « Leon
  Kondo » ou une Coréenne prénommée Bianca. Une petite tranche (H2 bis) leur
  donnera `first` et `firstF` propres.

## 10. Terminé pour le lot

1. Chaque combattant a un pays, une ville, un surnom, un passé, une voix, des
   habitudes et des liens ; **son style vient de son origine**.
2. Le monde compte ~1 000 combattants, Split ~140, une soirée douze combats, et
   **le joueur n'est jamais noyé** : cercles, rôles, Leïla, conteur.
3. Des moments de vie arrivent, pèsent, se lisent, et changent des carrières.
4. Les combattants demandent, se souviennent, refusent, partent.
5. Le temps passe à l'écran.
6. Les scénarios du §5 naissent sans être écrits.
7. `npm run check` vert, aucun test assoupli sans décision citée, chaque écran
   comparé à sa maquette à 1920.

---

## Annexe — Consignes prêtes à envoyer

### Sol — lot 4 T8b (la dernière du lot 4)

```
NOUVEAU TRAVAIL — Lot 4 T8b : l'écran de carrière porte la maquette 10.
Worktree cage-legacy-arene, branche lot-4-t8b-carriere depuis origin/main (2cb9d56).
Contrat : docs/LOT-4-LA-PEAU-DU-JEU.md §T8 et §4 bis.

Porte maquettes/10-carriere.html sur le hub de la carrière (ui-06-career-screens.js),
avec les jetons DA déjà posés par la T8a. N'invente rien : valeurs de la maquette —
padding 40px 64px 48px, grille 560px / minmax(0,1fr) / 420px, titre 76px,
texte 18 à 20px, historique en grille 90px / minmax(0,1fr).
Blocs : ton combattant, ce que tu es devenu, le camp de la semaine, ton prochain
combat (+ Étudier ses combats), ta carrière, ton état, ce qu'on dit de toi.
Chaque bloc lit des données qui existent ; sinon il n'apparaît pas. Aucun texte
de maquette en jeu (§1). « Ton agent » n'apparaît pas.
Corrige aussi le lien mort opponent_card (ui-06-career-screens.js, deux appels).

Preuves : captures jeu/maquette côte à côte à 1920, puis 1280 et 1440, souris et
clavier ; npm run check vert ; ?v= montés pour tout .js modifié.
Règle d'arrêt : 2 h bloqué → commit, rapport, stop.
```

### GLM — lot 5 H1 (les données)

```
NOUVEAU TRAVAIL — Lot 5 H1 : les données de l'humanité.
Worktree cage-legacy-corps, branche lot-5-h1-donnees depuis origin/main.
Lis docs/LOT-5-UN-MONDE-HUMAIN.md §7 (H1) et docs/CATALOGUE-HUMANITE.md.

Crée mgmt-humanite-data.js : DONNÉES PURES, aucune fonction, "use strict" en
tête, chargé dans index.html juste après mgmt-data.js (avec ?v=).
Recopie du catalogue, sans rien inventer ni reformuler :
- MGMT_VILLES (§1.3) et MGMT_VILLES_ECOLES
- MGMT_STYLE_PAYS (§2.2, clés de STYLES dans engine.js) et MGMT_STYLE_VILLE
- MGMT_SURNOMS par langue et thème (§3.3)
- MGMT_METIERS par famille (§4.3), MGMT_MILIEUX (§5)
- MGMT_MOMENTS (§6.3) : {id, famille, libelle, poids, relais, effet}
- MGMT_RITUELS (§7.3), MGMT_ROLES (§9.2), MGMT_TRAJECTOIRES (§10.2)
Les pays qui n'existent pas encore dans COUNTRIES restent dans les tables : H2
les ajoutera.
Chaque texte écrit (surnom, métier, milieu, libellé de moment, rituel, rôle,
trajectoire) porte relu:false — ce sont des propositions qu'Anthony relira plus
tard. Les villes et les poids n'en portent pas.

Tests (tests/mgmtHumaniteData.test.js, à ajouter dans package.json) :
chaque ligne de MGMT_STYLE_PAYS fait 100 ; chaque clé de style existe dans
STYLES ; aucun doublon dans chaque liste ; chaque ville-école existe dans
MGMT_VILLES ; chaque moment a un poids entre 0 et 100 ; chaque texte a sa
marque relu.
npm run check vert. Règle d'arrêt : 2 h bloqué → commit, rapport, stop.
```
