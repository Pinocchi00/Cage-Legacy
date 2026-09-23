# LOT 2B — Le vivier se renouvelle

*Contrat de lot. Écrit le 21/09/2026 par Claude, sur les décisions d'Anthony des
20 et 21/09.*

Répond à **QO-8** (`docs/QUESTIONS-OUVERTES.md`) : l'organisation s'use et rien
n'y entre. Défaut reconnu par Anthony le 21/09/2026.

**Numérotation.** « 2B » et non « 3 » : les lots 3 (l'arène), 4 (la peau du jeu)
et 5 (le monde qui parle) gardent leurs numéros et leur contenu. Ce lot s'insère
**juste après le lot 2 et avant l'arène**, parce qu'il touche l'économie que le
lot 2 T4 vient de calibrer : plus il attend, plus ce calibrage est une vérité à
durée limitée. Même précédent de nommage que les lots 3a et 3B.

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`,
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/CDC-MODE-MANAGEMENT.md` §3 (la
règle du bureau et les trois niveaux) et `docs/LOT-3B-CONTRAT.md` §C (le vivier
extérieur, textes d'auteur déjà écrits).

---

## 0. Décisions d'auteur (20 et 21/09/2026)

1. **Le déclin du vivier est un défaut**, pas une pression de jeu voulue. Une
   organisation est censée se renouveler.
2. **Les nouveaux sont régénérés**, sur le modèle des *newgens* de Football
   Manager : ils combattent en amateur et dans d'autres organisations avant que
   Split ne les voie. Ils arrivent avec un passé, jamais vierges.
3. **Le monde extérieur est dérivé, pas simulé.** Aucun second moteur ne tourne à
   côté de Split. Mais il doit être **réaliste** au sens mesurable du §4.
4. **L'histoire d'un nouveau est sa trace de carrière**, pas une biographie
   écrite : bilan amateur, organisations traversées, manière dont ses combats se
   sont finis, âge et trajectoire. **Dérivée à la lecture, jamais stockée** —
   comme le classement du lot 2 T1. **La raison de se battre reste au niveau 2**
   (`MGMT_RAISONS`, CDC §3) : la règle du bureau n'est pas touchée.
5. **Flux régulier de recrutables, mais le joueur recrute et lui seul.** Le jeu
   ne signe jamais à sa place.
6. **L'arrivée n'est pas un événement** : personne ne l'annonce, aucune réplique
   ne se déclenche. C'est **son premier combat sous Split** qui porte le récit —
   **par la presse**, donc au lot 5 (§5 bis B).
7. **Les partants partent à la retraite**, simplement. Aucune autre sortie.
8. **Un seul monde extérieur.** Celui de QO-2 et QO-3 (short notice, combattant
   libre de contrat) et celui des nouveaux sont **le même** — jamais deux
   systèmes côte à côte.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Voir arriver, cycle après cycle, des combattants qu'il ne connaît pas, lire d'où
ils viennent et ce qu'ils ont fait ailleurs, en recruter ceux qu'il veut — et
continuer à composer des cartes rentables à la dixième soirée comme à la
première, parce que son vivier ne fond plus.

---

## 2. Découpage en tranches

Une tranche à la fois, relue par Claude avant la suivante.

### T1 — Le monde extérieur, dérivé *(aucune interface)*

- **Un combattant extérieur ne stocke que son identité** : une graine, sa
  catégorie, son pays, sa date de naissance sportive (le cycle où il entre dans
  le monde). Tout le reste — bilan amateur, organisations traversées, fins de
  combats, âge courant — est **dérivé par fonction pure** à partir de ces
  champs et du cycle courant. Rien n'est écrit sur la ligne (règle du bureau,
  CDC §3).
- **Réutiliser `makeName()` et `correlatedRecord()`** (`engine.js`,
  `ui-01-roster-matchmaking.js`), déjà employés par `mgmtNewRoster`. Jamais un
  second générateur.
- **La trace progresse sans le moteur** : un combattant non recruté continue de
  combattre ailleurs, et son bilan avance — par abstraction, jamais par
  `simulateFight`. Reproductible : même graine, même cycle, même trace.
- **Aucun `Math.random()`**, RNG à graine uniquement.
- **Tests** : trace déterministe et identique d'un appel à l'autre ; jamais
  écrite sur la ligne ; un bilan qui ne régresse jamais ; deux combattants de
  graines différentes ne produisent pas la même trace.

### T1 bis — Le monde à l'échelle *(aucune interface — avant la T2)*

*Ajoutée le 22/09/2026. Elle naît de QO-11 bis : le monde dérivé de la T1 est
trop petit et trop mal réparti pour porter un classement. Elle précède la T2
parce que le recrutement se feuillette autrement dans un vivier de 35 et dans un
vivier de 330 — construit sur le petit, l'écran serait à refaire.*

- **Le monde se peuple par catégorie, pas en vrac.** Aujourd'hui
  `mgmtExteriorEnsure` / `mgmtExteriorArrive` tirent un effectif global que le
  hasard répartit entre les 12 catégories (`DIVISIONS`, `engine.js:150`) : au
  cycle 12, `H-fly` se retrouve à 0 extérieur et `H-lheavy` à 5. Le quota
  devient **par catégorie** — « au moins N vivants dans chacune ». C'est la
  seule forme qui garantisse un classement partout.
- **La cible, fixée par Anthony le 22/09 : 30 vivants par catégorie**, soit
  **360 dans le monde** — un top 15 plein et quinze prétendants derrière lui.
  Le quota porte sur le monde **entier**, Split compris : l'extérieur complète
  ce que le roster ne fournit pas dans cette catégorie, et se réajuste quand un
  combattant est recruté, prend sa retraite ou meurt sportivement. Un
  recrutement ne doit donc pas vider le monde de l'un pour remplir l'autre.
- **Compter les vivants, pas les lignes.** Un retraité médical ne compte pas
  dans le quota (`mgmtDivisionRank` l'exclut déjà) — sans quoi le monde se
  remplirait de combattants qui ne combattent plus, ce qui est exactement le
  défaut QO-8 transposé à l'extérieur.
- **Le coût est mesuré et négligeable** : une ligne pèse 66 octets, une carrière
  se dérive en 0,036 ms. 330 lignes = ~22 Ko de sauvegarde et 13 ms pour tout
  dériver, contre ~80 Ko déjà pris par l'historique après 20 soirées. **Aucune
  optimisation n'est à inventer** : si la tranche en réclame une, c'est que la
  règle du bureau a été enfreinte quelque part.
- **La règle du bureau tient, sans exception.** Une ligne ne gagne aucun champ.
  Le rang, le bilan, les organisations traversées restent **dérivés à la
  lecture** (`mgmtExteriorTrace(line, cycle)`). Un monde plus grand ne justifie
  aucun cache : le coût mesuré ci-dessus est la preuve qu'il n'en faut pas.
- **Deux classements, une seule loi** (décision d'Anthony du 22/09). Le mode en
  porte deux, et ils ne disent pas la même chose :

  | Classement | Population triée | Ce qu'il décide |
  |---|---|---|
  | **Mondial** | Split **et** l'extérieur | ce que vaut un combattant — son prestige, ce qu'il coûte, ce que son arrivée rapporte |
  | **De l'organisation** | le roster de Split seul | qui est le prochain pour la ceinture, qui mérite la carte principale |

  **Ce n'est pas un second système au sens de CLAUDE.md §5** — c'est **une seule
  fonction de tri** (écart W−L, puis victoires, puis récence) appliquée à deux
  populations. Une seule loi, deux portées. Si la tranche produit deux lois de
  tri distinctes, elle est refusée : les deux classements doivent diverger par
  qui ils contiennent, jamais par comment ils trient.

  `mgmtDivisionRank` (`mgmt-carte.js:389`) **est déjà le classement de
  l'organisation** : il trie `m.roster` et rien d'autre. Il ne disparaît pas, il
  ne change pas de loi — la tranche lui ajoute une portée mondiale à côté.

- **Les prétendants ne sont pas une notion séparée** : ce sont les rangs 16 et
  suivants de la liste mondiale. Rien à construire, rien à stocker.
- **Un combattant porte donc deux rangs à la fois**, et l'écart entre les deux
  raconte quelque chose : 3e chez Split et 24e mondial, ce n'est pas la même
  histoire que 3e chez Split et 4e mondial. C'est de la matière pour le lot 4 ;
  la tranche se contente de rendre les deux nombres justes.
- **Le combattant recruté ne change pas de rang en changeant de maison.** Signer
  quelqu'un le fait entrer chez Split, pas monter au classement — sinon le
  classement récompenserait le recrutement au lieu des résultats.
- **Compatibilité des sauvegardes** : une partie enregistrée avec l'ancien monde
  doit se charger. Le quota par catégorie complète les catégories creuses au
  chargement plutôt que de refuser la partie ; `validateMgmt` / `mgmtRepair`
  restent la porte d'entrée.
- **Tests** : chaque catégorie atteint 30 vivants à l'ouverture et les tient
  après 20 cycles ; le classement mondial contient bien Split **et**
  l'extérieur ; le classement de l'organisation ne contient que Split ; les deux
  rendent le même ordre relatif sur deux combattants de Split (preuve qu'il n'y
  a qu'une loi) ; recruter quelqu'un ne déplace pas son rang mondial et ne vide
  pas sa catégorie ; un retraité médical sort des deux classements et du quota ;
  une sauvegarde d'avant la tranche se charge et se complète ; la trace reste
  déterministe et rien n'est écrit sur la ligne.
- **Le sort des lignes mortes, à mesurer avant de trancher.** Le quota porte sur
  les **vivants** ; les lignes, elles, s'accumulent. QO-8 a montré qu'à
  l'intérieur de Split, 31 combattants sur 48 se retrouvent retraités médicaux
  après 20 soirées. Si l'extérieur suit un rythme comparable, tenir 360 vivants
  sur 20 cycles peut demander deux à trois fois plus de lignes — 800 à 1000,
  soit 55 à 66 Ko, sur une sauvegarde qui en pèse déjà 80. **La tranche mesure
  ce chiffre et le rapporte ; elle ne décide pas seule d'élaguer.** Jeter les
  lignes mortes ferait disparaître le passé du monde, ce qui contredirait QO-9
  (« le fait ne disparaît jamais ») ; les garder fait grossir le fichier. Le
  choix revient à Anthony, une fois le nombre connu.
- **Mesure attendue** : la répartition par catégorie à l'ouverture et après
  20 cycles, le nombre de lignes **vivantes et totales**, le poids réel de la
  sauvegarde, et le temps de dérivation complet. Une seule mesure, en fin de
  tranche.

### T1 ter — Le corps tient la durée *(aucune interface — après T1 bis, avant T2 bis)*

*Ajoutée le 22/09/2026. Constat d'Anthony : « les traumas ne sont pas du tout
réalistes ». Mesuré, il a raison, et le défaut n'est pas où on l'attendait.*

**Ce qui a été mesuré** (graine 20260922, vingt soirées jouées par le vrai
déroulé : `mgmtNewPile`, `mgmtBookMain`, `mgmtDecide`, `mgmtRunEvent`).

Le roster **arrive déjà abîmé**, avant le premier combat sous Split :

| | Valeur |
|---|---|
| Traumatisme moyen | **33,6 / 100** |
| Le plus atteint | **83 / 100** |
| Déjà au-dessus de 60 (seuil de retraite sur commotion) | **6 sur 48** |

Et le vivier s'effondre :

| Soirée | Disponibles | Suspendus | Retraités | Traumatisme moyen |
|---|---|---|---|---|
| 1 | 44 | 4 | 0 | 33,6 |
| 5 | 24 | **23** | 1 | 46,7 |
| 10 | 18 | 22 | 8 | 58,8 |
| 15 | **13** | 12 | **23** | 58,6 |

**À la seizième soirée, aucune carte n'est composable : la partie s'arrête.**
Le mode est injouable au-delà d'un an et demi de temps de jeu.

**Ce qui n'est PAS le défaut.** Le gain par combat est défendable : 2 à 3 pour
une victoire, 3,6 pour une défaite aux points, 10,1 par soumission, **14,8 par
KO** — soit 24 combats en moyenne pour finir une carrière, l'ordre de grandeur
d'une vraie. **Ne pas y toucher en premier.**

**Les trois défauts, et les décisions d'Anthony du 22/09 :**

1. **La dérivation de départ charge tout d'avance.** `mgmtTrauma` estime que
   26 % des défaites passées étaient des KO (`MGMT_KO_SHARE`) et compte
   **19 points par KO estimé** (`MGMT_KO_TRAUMA`) : cinq KO au palmarès et le
   combattant arrive à 95, retraité d'avance. **Décision : un combattant jeune
   au palmarès propre arrive à un traumatisme quasi nul.** C'est le premier
   levier à regarder, avant tout autre.

2. **Le traumatisme ne redescend jamais — et cela change.** **Décision : il
   récupère, partiellement et lentement.** Le temps passé sans combattre efface
   une part des dégâts récents, **jamais la totalité** : une part reste
   définitivement acquise, sinon une carrière n'a plus de fin. C'est ce qui rend
   une longue carrière possible, et c'est physiologiquement juste.

   ⚠ **Cette décision renverse un invariant écrit, et un test le garde.**
   « Le traumatisme ne descend jamais » figure à quatre endroits :
   `mgmt-corps.js` (en-tête ligne 5, en-tête ligne 26, commentaire de
   `mgmtTraumaGain` ligne 228) et `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md:294`.
   **Et le test `tests/mgmtSoiree.test.js:162` — « MGMT corps : le traumatisme
   ne descend jamais et reste dans [0,100] » — passera au rouge.**

   C'est le cas prévu par `CLAUDE.md` §7 : un test ne se réécrit jamais pour
   retrouver du vert **sans citer la décision qui change le comportement
   attendu**. La tranche réécrit ce test en citant cette décision du 22/09, et
   le nouveau test garde ce qui reste vrai : le traumatisme reste borné à
   [0,100], **une part acquise ne se récupère jamais**, et un combat n'en fait
   jamais descendre le total. Un test qui disparaît sans être remplacé est un
   motif de refus de la tranche.

3. **Gagner coûte 2 à 3 points.** Un combattant invaincu qui n'a jamais été
   touché dérive vers la retraite forcée en 43 combats. **Décision : ça ne doit
   pas exister.** Une victoire sans dégâts encaissés ne coûte rien ; ce sont les
   coups reçus qui comptent, pas le fait d'avoir combattu.

**Les suspensions sont un chantier distinct, et peut-être le vrai coupable.**
23 suspendus sur 48 dès la cinquième soirée — bien avant que les retraites ne
pèsent. **La tranche les mesure séparément avant de toucher à quoi que ce soit**
et rapporte le partage : combien d'indisponibilités viennent d'une suspension,
combien d'une retraite. On ne règle pas les deux à l'aveugle en même temps.

**Cibles mesurables, posées avant la mesure :**

- **À la vingtième soirée, la partie se joue encore** — une carte complète reste
  composable, et **au moins 30 des 48 lignes sont disponibles**. Aujourd'hui :
  injouable à la seizième, 13 disponibles à la quinzième.
- **Un combattant qui gagne tout ne prend jamais sa retraite médicale.**
- **Un combattant de 22 ans au palmarès propre arrive sous 5 de traumatisme.**
- **La carrière médiane avant retraite médicale reste dans l'ordre de 20 à 30
  combats** — la cible n'est pas d'abolir la retraite médicale, mais qu'elle
  frappe une minorité, tard.

**Ce qui ne bouge pas.** Dérivation pure et déterministe, aucun tirage consommé
(`mgmtTrauma` est pure aujourd'hui, elle le reste) ; règle du bureau — la
récupération se **dérive du temps écoulé**, elle ne s'écrit pas cycle par cycle
sur la ligne ; le traumatisme reste **caché** au joueur (CDC : ni note, ni jauge).

**Effet de bord à signaler.** Moins de suspensions et de retraites, c'est plus
de combattants disponibles, donc des cartes différentes et une recette
différente : le calibrage de l'économie (`tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md`)
sera à refaire après cette tranche. Le signaler, ne pas le corriger ici.

**Mesure attendue** : le tableau ci-dessus rejoué à l'identique (même graine,
vingt soirées), plus le partage suspension/retraite, la distribution du
traumatisme de départ, et la longueur de carrière médiane. Une seule mesure, en
fin de tranche.

### T2 — Le recrutement *(interface — après T1 bis — vérification charte §3 obligatoire)*

- **Le flux** : des recrutables sont visibles cycle après cycle. **Aucun nombre
  fixe** (décision 2) — combien s'en présentent dépend du monde extérieur
  lui-même, comme le reste. Ils ne rejoignent Split que par le geste du joueur, et
  **aucun plafond de vivier** ne le limite (décision 1).
- **Ce que l'écran montre** : nom, catégorie, âge, bilan, et la trace de
  carrière du §T1 — d'où il vient et ce qu'il a fait. **Aucune note, aucune
  recommandation, aucun pronostic, aucune jauge** (vision, addendum 2 §6).
- **Le geste de recrutement**, souris d'abord, clavier en accélérateur
  (`ui-11-keys.js`), `esc()` sur tout nom affiché.
- **Le recruté entre au niveau 1**, comme n'importe quelle ligne : sa raison de
  se battre ne s'attribue qu'au niveau 2, quand le joueur s'y intéresse.
- **Mise en page** : 1440px, lisible dès 1280 — charte §L1.
- **Livrable de vérification** : la capture ou le relevé DOM exigé par la
  charte §3.

### T2 bis — Le temps passe *(aucune interface — après T1 ter, avant la T3)*

*Ajoutée le 22/09/2026. Constat d'Anthony en regardant une partie : « les
combattants n'ont pas l'âge pour partir autant à la retraite ». Il a raison, et
la cause est plus profonde que le réglage.*

**Ce qui a été vérifié, et qui n'était écrit nulle part :**

| Constat | Preuve |
|---|---|
| `f.age` n'est **jamais écrit** dans tout le mode | lu et recopié 4 fois, incrémenté 0 fois |
| **Aucune retraite d'âge n'existe** | `f.retired='medical'` (`mgmt-corps.js:327`) est le seul endroit du mode qui retire quelqu'un |
| L'âge ne pèse **rien** sur un combattant régénéré | à niveau égal, `makeFighter` rend un overall de 15,7 à 22 ans **comme à 42 ans** |
| Le monde extérieur, lui, **vieillit** | `mgmtExteriorCareer` dérive l'âge du cycle courant |
| 20 soirées = **1 an 11 mois** | `MGMT_EVENT_WEEKS = 5` |

Roster de départ mesuré (graine 20260922) : 48 combattants de 22 à 35 ans,
moyenne 28,2, **20 d'entre eux sous 27 ans**, tous à traumatisme 0. Sur ces deux
ans, QO-8 a mesuré **31 retraites médicales sur 48** — et pas un combattant n'a
vieilli d'un jour. Le monde d'à côté prend de l'âge pendant que la maison du
joueur est figée, et la seule porte de sortie est l'infirmerie.

**Ce que la tranche fait.**

- **L'âge avance avec le calendrier.** Un cycle dure 5 semaines : un anniversaire
  tombe tous les ~10,4 cycles, pas à chaque soirée. La loi est celle du monde
  extérieur (`MGMT_EXT_YEAR_WEEKS`), **pas une seconde loi** — le roster et
  l'extérieur vieillissent au même rythme, comme les deux classements trient
  sous la même loi (T1 bis).
- **L'âge pèse sur la dérivation, exactement comme le traumatisme.** Le patron
  existe déjà et ne se double pas : `mgmtTrauma` → `mgmtChinWear` → attributs
  réduits sur le clone régénéré (`mgmt-corps.js`). L'âge suit ce chemin. **Rien
  n'est stocké sur la ligne** : pas d'`attrs`, pas d'overall figé — règle du
  bureau, CDC §3.
- **Attention au piège de `applyAging`.** `engine-progression.js:33` porte déjà la
  loi de déclin de la carrière (attributs, menton après 38 ans, `f.age++`). Elle
  **ne se réutilise pas telle quelle ici** : elle mute un combattant persistant
  qui porte ses `attrs`, alors que le management n'en garde aucun, et elle
  consomme `rnd()`. La tranche reprend **sa courbe**, pas son mécanisme — et si
  elle touche à la RNG, c'est sous le motif « SEED sauvegardé / restauré ».
  Deux lois de déclin différentes entre les deux modes seraient un défaut.
- **Vieillir n'est pas se blessér.** Le traumatisme monte avec les coups reçus,
  le déclin vient de l'âge. Les deux s'additionnent sur le clone mais restent
  **deux causes distinctes**, lisibles séparément — sinon on ne saura jamais
  lequel des deux a vidé le vivier.
- **Sauvegarde** : `MGMT_SAVE_VERSION` monte, `mgmtMigrate` complète les parties
  d'avant la tranche (l'âge d'une ligne existante est son âge actuel, le
  calendrier repart de là), `validateMgmt` / `mgmtRepair` restent la porte.

**Ce que la tranche ne fait pas.** Elle **ne code pas la retraite d'âge** —
c'est la T3. Elle rend l'âge réel ; la T3 en tire une sortie. Dans cet ordre,
parce qu'une retraite d'âge dans un monde où personne ne vieillit ne se
déclencherait jamais.

**Décision d'Anthony du 22/09 : on reprend tout, déclin et menton.** La loi de
la carrière (`applyAging`, `engine-progression.js:33`) devient celle du
management, sans variante. Le jeu n'a qu'une seule vérité sur le
vieillissement. Elle dit exactement ceci :

| | Loi de la carrière, adoptée telle quelle |
|---|---|
| Pic stable | de 27 ans à l'entrée en déclin — rien ne bouge |
| Entrée en déclin | **37 ans**, et **39 ans** pour `H-heavy` et `H-lheavy` (`isDeclining`/`isHeavy`) |
| Attributs qui baissent | `footSpeed`, `handSpeed`, `cardio`, `explosiveness` ; **plus `power` et `recovery` à partir de 39 ans** |
| Rythme | `RI(0,1)` par an les **trois premières** années de déclin, `RI(0,2)` ensuite (ancre V2-39 : « déclin plus progressif ») |
| Menton | baisse à partir de **38 ans**, au même rythme |
| Moral | une chance sur trois de perdre 5 points l'année où l'on décline |

**Deux adaptations obligatoires, et elles ne changent pas la courbe.**

1. **Le tirage devient une dérivation.** `applyAging` consomme `rnd()` (les
   `RI(0,cap)` et le jet de moral). Le management dérive sans toucher à la RNG
   de la partie : le déclin d'un combattant se calcule de façon **déterministe
   à partir de son identifiant et de son âge**, patron `duelFnv1a32` +
   `mulberry32` déjà en place, ou motif « SEED sauvegardé / restauré ». Même
   courbe, même ampleur, aucun tirage consommé.
2. **`agedCeilings` ne se transpose pas, et n'a pas à l'être.** En carrière, ce
   champ fige le plafond atteint pour qu'une compétence ne fasse pas remonter un
   attribut décliné. Le management ne stocke aucun attribut : il régénère le
   combattant à chaque lecture, à l'âge courant. Le plafond est donc automatique
   — un homme de 40 ans est toujours dérivé comme un homme de 40 ans. La règle
   du bureau rend le mécanisme inutile.

**Ce que cette décision ne règle pas, et qu'il ne faut pas croire réglé.** Le
déclin commence à 37 ans. Le roster de départ va de 22 à 35 ans (moyenne 28,2) :
**personne n'y est en déclin**, et sur les deux ans que font 20 soirées, seuls
les plus vieux atteindront 37. Faire vieillir le vivier **ne réduira donc pas
les retraites médicales** — ça ajoute une seconde sortie, plus lente, à côté de
la première. Les 31 départs sur 48 en deux ans (QO-8) restent un problème
**de calibrage du traumatisme**, distinct de l'âge. La mesure de fin de tranche
(sorties par cause) est ce qui permettra de le traiter ensuite, sur des chiffres
au lieu d'une impression.

**Tests** : l'âge avance d'un an tous les ~10,4 cycles et jamais plus vite ; un
combattant de 38 ans régénéré est mesurablement moins bon que le même à 26 ans,
niveau et bilan égaux ; aucune ligne ne gagne d'`attrs` ni d'overall ; le roster
et l'extérieur vieillissent au même rythme ; une sauvegarde d'avant la tranche se
charge ; traumatisme et déclin restent distinguables.

**Mesure attendue** : sur 20 soirées, la pyramide des âges du roster au début et
à la fin, et la répartition des sorties **par cause** — retraite médicale contre
déclin d'âge. C'est le chiffre qui dira si le vivier cesse enfin de se vider par
l'infirmerie.

### T3 — Les départs *(après T2 bis)*

- **La retraite**, seule sortie ordinaire. Elle retire le combattant du vivier
  et des classements, sans drame et sans réplique (décision 6).
- **La règle de la retraite est celle de la carrière**, une seule loi comme pour
  le déclin (23/09) : `engine-career.js:161` — retraite obligatoire à **42 ans**,
  avancée jusqu'à **39** selon la dégradation du menton
  (`max(39, 42 − chinDegradationLevel)`). Le management n'a pas de
  `chinDegradationLevel` : son équivalent se dérive du traumatisme acquis et du
  déclin du menton (T1 ter, T2 bis). La correspondance retenue est écrite,
  mesurée et publiée — pas choisie en silence.
- **Sauvegarde** : évolution du format par la migration du circuit management
  (`mgmtMigrate`) et sa validation (`validateMgmt`, `mgmtRepair`). Jamais de
  plantage au chargement, jamais de contamination avec la carrière.
- **⚠ Le monde extérieur doit partir lui aussi.** *Ajouté le 22/09/2026, après
  la relecture de la T1 bis.* La T3 ne parlait que du roster de Split. Mesuré
  sur la T1 bis livrée (graine 20260922, quota de 30 vivants par catégorie) :

  | Cycle | Années | Lignes extérieures | Âge médian | Plus de 45 ans |
  |---|---|---|---|---|
  | 0 | 0 | 312 | 25 | 0 |
  | 60 | 5,8 | 312 | 30 | 0 |
  | 120 | 11,5 | 312 | 36 | 0 |
  | **240** | **23** | **312** | **48** | **264** |

  Les **mêmes 312 lignes**, vieillissant en bloc, indéfiniment. À vingt-trois ans
  de jeu, le joueur recrute des hommes de 48 ans à 85 combats professionnels.

  **Et le quota aggrave le défaut au lieu de le révéler.** Il maintient 30
  vivants par catégorie ; comme personne ne s'arrête dehors, le quota est
  toujours satisfait, donc **aucun jeune n'entre jamais**. Le monde devient une
  cohorte fermée — l'inverse exact du titre de ce lot.

  Ce n'est **pas un défaut de la T1 bis** : son contrat portait sur le quota et
  les classements, et les deux sont justes. C'est un trou **entre** les tranches.
  La T3 le comble : **une ligne extérieure a une fin de carrière**, dérivée
  comme le reste de sa trace, sous la même loi de vieillissement que le roster
  (T2 bis — déclin à 37 ans, 39 pour les lourds). Un partant libère sa place
  dans le quota, et **c'est ce départ qui fait entrer un jeune**.

  **Rien ne se supprime** : la ligne du partant est conservée, comme celle d'un
  retraité médical de Split (QO-9 — le passé du monde ne disparaît pas). Elle
  cesse simplement de compter parmi les vivants.

- **⚠ Les anniversaires ne tombent pas tous le même jour.** *Ajouté le
  22/09/2026, relecture de la T2 bis.* La T2 bis fait vieillir le roster par un
  **compteur global** (`m.ageWeeks`) : toutes les 52 semaines, les 48
  combattants prennent un an à la même soirée — mesuré, +1,00 an pile sur vingt
  soirées. C'était sans conséquence tant que rien ne dépendait de l'âge. **La
  retraite d'âge de cette tranche en dépendra** : avec un anniversaire commun,
  toute une classe d'âge franchirait son seuil ensemble et partirait à la même
  soirée. La T3 donne donc à chaque combattant **sa propre date dans l'année,
  dérivée de son identifiant** (aucun champ ajouté à la ligne), comme le monde
  extérieur dérive déjà l'âge de chacun depuis son propre `born`. Un combattant
  recruté de l'extérieur ne doit pas changer d'âge en changeant de maison.
- **Cible mesurable ajoutée** : à 240 cycles (23 ans), **l'âge médian du monde
  extérieur reste dans la même décennie qu'à l'ouverture** — un monde vivant
  renouvelle sa population, il ne vieillit pas en bloc. Et à tout cycle, il
  existe des combattants de moins de 25 ans dans chaque catégorie.
- **Tests** : un retraité sort du vivier et du classement ; la migration charge
  une sauvegarde d'avant le lot sans perte ; **une ligne extérieure en fin de
  carrière sort des vivants sans être supprimée, et sa sortie déclenche un
  remplacement par le quota** ; après 240 cycles, chaque catégorie contient
  encore des combattants de moins de 25 ans.

### T4 — Le salaire à la victoire, et l'économie sur la durée de vie *(après T3 — condition de fusion)*

- **Le salaire par combat et par victoire** (décision 1) : le cachet existant
  reste le salaire de combat ; un **bonus de victoire** s'y ajoute, calculé après
  les combats et passé à `mgmtEventRecette`, qui ne le prend pas aujourd'hui.
  Constantes nommées, comme tous les poids d'argent. Le commentaire de l'ancre
  `MGMT_LOT3B_T1_ECONOMIE` (« payé avant la soirée ») est à corriger.
- `tools/monte-carlo-economie.js` mesure désormais des organisations **qui se
  renouvellent**, sur `--soirees=K` avec K assez grand pour voir la dixième
  soirée.
- **⚠ Ce qui attend le recrutement (23/09).** Le recrutement (T2) attend la
  presse du lot 5. Sans lui, rien n'entre chez Split : après la T3, le roster ne
  peut que fondre, et une mesure « sur la durée de vie » ne mesurerait que cette
  fonte. Cette tranche fait donc **maintenant** le salaire à la victoire et le
  recalibrage de l'économie **sur vingt soirées** (le calibrage du lot 2 T4 est
  caduc depuis la T1 ter) ; **la cible sur la durée de vie et la mesure
  ci-dessous passent avec la T2**, quand des combattants pourront arriver.
- **Mesure demandée (§5 c), reportée avec la T2** : recruter sans retenue
  est-il la stratégie dominante ? Comparer un joueur qui recrute tout à un
  joueur qui recrute peu.
- **La cible de QO-8** : le joueur d'écran reste dans la bande 70 à 80 % de
  soirées rentables **sur la durée de vie de l'organisation**, et non plus
  seulement à la première soirée. Les constantes d'économie sont recalibrées si
  besoin — **jamais les cibles**, qui sont des décisions d'auteur.
- **Test** : sur une graine fixe, la rentabilité ne s'effondre plus avec l'âge de
  l'organisation.
- Rapport de calibrage dans `tools/reports/`, format du lot 2 T4.

---

## 3. Ce que « réaliste » veut dire, et comment on le mesure

Le monde dérivé doit être **indiscernable d'un monde simulé sur les statistiques
observables**. Deux cibles, vérifiables par Monte Carlo avec l'outillage existant :

1. **Le bilan prédit le résultat.** Un combattant donné pour 18-4 se comporte
   comme un 18-4 quand `simulateFight` le fait combattre : la corrélation entre
   le bilan dérivé et le taux de victoire observé doit être du même ordre que
   celle mesurée sur le roster actuel, généré par `correlatedRecord`.
2. **Les fins de combats collent.** La répartition KO / soumission / décision de
   la trace dérivée suit celle que le moteur produit réellement — référence :
   `tools/reports/LOT-3A-CALIBRAGE-SOIREE.md`.

Un écart mesuré est un défaut de la tranche, pas une tolérance.

---

## 4. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `ui-*.js` (sauf
  `ui-11-keys.js` si l'enregistrement d'une touche l'exige), `state/*.js`,
  `index.html`. `git diff <base> -- engine-*.js state/` doit rester vide.
- **Jamais un second système** à côté d'un système existant : un seul monde
  extérieur (décision 8), un seul générateur de noms, un seul générateur de
  bilans.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Un texte
  manquant reste `[EMPLACEMENT AUTEUR]` et se signale. Les raisons de se battre
  existantes ne se réécrivent pas.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test réécrit pour retrouver du vert** sans citer la décision qui change
  le comportement attendu.
- **Aucune fusion dans `main`** avant la fin de T4.

---

## 5. Décisions d'Anthony du 21/09/2026 (les cinq points du cadrage)

1. **Recruter ne coûte rien à la signature.** Les combattants ont un **salaire par
   combat et par victoire** : le coût arrive quand ils combattent, pas quand ils
   signent. **En théorie le joueur peut recruter autant qu'il veut** — aucun
   plafond artificiel de vivier ; dans les faits, on ne recrute que les
   intéressants.
2. **Aucun nombre fixe de recrutables par cycle** : cela dépend des combattants
   eux-mêmes, comme tout le reste du monde extérieur.
3. **La retraite dépend du combattant** : l'âge, le corps (traumatisme du lot 3a)
   et les résultats jouent tous, et pas de la même façon d'un homme à l'autre.
   Aucune règle uniforme.
4. **Le recrutement se fait sur un écran neuf.**
5. **Le récit du premier combat, c'est la presse** — et la presse n'existe pas
   encore (voir §5 bis).

### 5 bis. Deux conséquences que ces décisions entraînent

**A. Le salaire à la victoire n'existe pas dans le code.** Aujourd'hui
`mgmtPurse(f, slot)` paie **un cachet par combat**, dérivé du nom et de
l'emplacement, et le commentaire de l'ancre `MGMT_LOT3B_T1_ECONOMIE` pose en
principe qu'il est « payé avant la soirée ». Un bonus de victoire ne se connaît
qu'**après** : il faudra que `mgmtRunEvent` calcule les bonus une fois les combats
joués et les passe à `mgmtEventRecette`, qui n'en prend pas aujourd'hui. Ce n'est
pas difficile — `mgmtRunEvent` joue déjà les combats avant d'appeler la finance —
mais c'est une **modification du modèle d'argent**, donc un recalibrage. Elle
entre dans ce lot, à la **T4**.

**B. La presse appartient au lot 5.** `docs/VISION-MODE-MANAGEMENT.md` en fait
« la voix du monde » (§73) et dit déjà comment on découvre un combattant : « un
14-0 avec 14 finish dans une orga inférieure dont on voit passer les highlights…
la presse qui parle d'une pépite » (§49). Le récit du premier combat est donc
**décidé et différé** : il se fera au lot 5, avec le reste de la voix du monde.
**Le lot 2B n'invente aucune presse** — pas même un embryon : ce serait un second
système à côté de celui que le lot 5 doit construire (interdit du §4). L'écran de
recrutement de la T2 montre donc la trace de carrière, des faits ; la presse
l'enrichira plus tard.

### 5 c. Un point à surveiller, sans décision demandée

Un vivier sans plafond et sans coût de détention rend le **stockage gratuit** :
recruter tout le monde serait strictement avantageux, puisqu'un combattant non
booké ne coûte rien et élargit le choix. Le contrepoids existe déjà et il est
d'auteur — la raison de se battre `addiction` dit que « l'inactivité le détruit…
ne rien proposer est le mauvais choix ». À mesurer à la T4 : si recruter sans
retenue reste la stratégie dominante, le flux perd son sens. Aucune décision
n'est demandée ici, seulement une mesure à produire.

## 5 d. Relecture de la T1 (21/09/2026) — acceptée

Branche `lot-2b-t1-monde-exterieur`. Vérifications faites par Claude sur l'état
réel, et non reprises de la livraison :

| Ce qui était en jeu | Comment je l'ai vérifié | Résultat |
|---|---|---|
| La dérivation ne consomme aucun tirage de la RNG du jeu | Suite de `rnd()` relevée après `setSeed(4242)`, puis 114 lectures de trace, puis la même suite | **Identique** |
| Deux lectures donnent la même trace | Deux appels d'affilée, comparaison sérialisée | **Identiques** |
| Rien n'est écrit sur la ligne | Clés de la ligne après lecture | `born,ck,div,id,seed` — les cinq, rien de plus |
| Le bilan ne régresse jamais | 38 lignes × 120 cycles = **4 560 lectures** | **0 régression** |
| Les chiffres s'additionnent | Bilan = combats, fins = combats, sur les mêmes 4 560 lectures | **0 incohérence** |
| Les deux cibles de réalisme | Mesure relancée à `--n=1000` | r_roster 0,733 / r_ext 0,615 ; fins Δ +0,016 / −0,005 / −0,011 — **les deux atteintes** |
| Les interdits | `git diff main` sur `engine-*.js`, `state/`, `index.html`, `mgmt-screens.js`, `ui-*.js` | **vide** |
| `npm run check` | Relancé par Claude | **305 tests, 301 passants, 0 échec, 4 skip** |

*Note de méthode : ma première sonde appelait `mgmtExteriorTrace(m, ligne, cycle)`
alors que la signature est `(ligne, cycle)` — elle recevait `null` et ne vérifiait
rien. Refaite avec la bonne signature avant de conclure.*

**Écart accepté : la loi de bilan est réécrite, pas réutilisée.** Le contrat
demandait de réutiliser `correlatedRecord`. OpenCode l'utilise pour le bilan
amateur (phase close, tirage en bloc) mais dérive le bilan professionnel combat
par combat, sous constantes `MGMT_EXT_RATIO_*` qui reprennent exactement la loi de
`correlatedRecord` (`ui-01-roster-matchmaking.js:465`). La raison est juste :
`correlatedRecord` rend un bilan entier d'un coup et consomme `rnd()` — appelé à
chaque cycle, il re-mélangerait tout le passé et le bilan régresserait, ce que le
contrat interdit durement. La propriété de préfixe ne s'obtient pas autrement.

**Réserve qui en découle, à traiter.** Les deux lois sont aujourd'hui identiques
mais rien ne les tient ensemble : modifier `correlatedRecord` les ferait diverger
en silence. Un test de non-dérive est peu coûteux — vérifier que le ratio moyen de
`correlatedRecord` à un niveau donné reste `MGMT_EXT_RATIO_BASE + t ×
MGMT_EXT_RATIO_SPAN`. À ajouter au découpage de `mgmt-bureau.js`, ou plus tôt.

**Réserve mineure.** Les bandes d'acceptation des deux cibles — `[0,7× ; 1,3×]`
pour la corrélation, `±0,04` pour les fins — ont été posées par OpenCode, pas par
le contrat, qui disait « du même ordre ». Elles sont raisonnables et ont été
fixées avant la mesure, ce qui est la bonne méthode. Elles sont désormais **la
référence du lot** : les tranches suivantes les reprennent au lieu d'en inventer
d'autres.

**Sauvegarde : le report du numéro de version est sans risque.** `m.exterieur` est
ajouté sans faire passer `MGMT_SAVE_VERSION` de 5 à 6, le bump étant prévu en T3.
Vérifié : le code de `main` accepte une sauvegarde portant `exterieur` — aucune
partie ne se retrouve illisible entre les deux états.

**Ce qui attend Anthony.** `MGMT_EXT_ORGS` contient quatre `null` :
**[EMPLACEMENT AUTEUR]**, les noms des organisations extérieures. La trace rend
déjà le nombre, les périodes et les combats par organisation. Ces noms deviennent
visibles à la **T2**, quand l'écran de recrutement les affichera — ils ne sont pas
nécessaires avant.

### 5 e. Décision d'Anthony du 22/09/2026 — le monde dérivé prend un écran au lot 4

**Le monde extérieur dérivé par la T1 est affiché au lot 4 (la peau du jeu).**

Ce que la décision règle. La T1 est livrée, couverte par dix-sept appels de
tests, et `mgmtExteriorTrace` (`mgmt-monde.js:247`) n'est appelée par aucun
chemin du jeu — l'inventaire du code mort du 21/09 la classe « vivante pour
les tests seuls » (`tools/reports/INVENTAIRE-CODE-MORT.md` §5). Ce n'est pas
du code mort : c'est du travail fini que personne ne voit. Le lot 4 lui donne
sa fenêtre, sans attendre la T2.

**Conséquence sur ce qu'Anthony doit écrire, et quand.** Le §5 d disait que les
quatre noms de `MGMT_EXT_ORGS` — **[EMPLACEMENT AUTEUR]** — deviendraient
visibles à la T2. Ils le deviennent désormais **au lot 4**, qui vient avant.
Ces quatre noms sont donc dus plus tôt que prévu.

**Conséquence sur le périmètre du lot 4.** L'audit du 17/09 (§8) définit le
lot 4 comme le remplacement de l'habillage par les écrans maquettés, et place
le recrutement au lot 5. Un écran du monde extérieur y est un écran **neuf**,
pas un rhabillage. Le lot 4 accueillait déjà le rangement et le tri des faits
(QO-9) ; il accueille maintenant cette fenêtre. À porter dans le contrat du
lot 4 quand il sera écrit — il ne l'est pas encore.

**La forme de la fenêtre, tranchée le 22/09.** Deux endroits, et deux seulement.

1. **Le monde se lit toujours à travers un combattant.** La trace s'affiche sur
   la fiche du combattant qu'on regarde — d'où il vient, ce qu'il a fait, dans
   quelles organisations. Jamais une liste du monde pour elle-même. La raison
   d'Anthony est la bonne : *« sinon on verrait des noms que personne ne
   connaîtrait »*. Un nom d'organisation ne veut rien dire tant qu'il n'est pas
   accroché à quelqu'un dont le joueur a une raison de s'occuper.
2. **Trois à cinq informations sur le hub d'accueil.** Pas un résumé du monde :
   **les plus pertinentes, et en lien avec Split.** Le critère de pertinence est
   donc *« est-ce que ça concerne mon organisation ? »*, pas *« est-ce que c'est
   gros ? »*. C'est le point le plus difficile du futur contrat, et il se mesure :
   une information qui ne change rien à une décision du joueur n'a rien à faire
   sur le hub.

La règle du bureau s'applique aux deux : la trace est **dérivée à la lecture**,
jamais stockée — `mgmtExteriorTrace(line, cycle)` est déjà écrite ainsi.

**Les quatre noms d'organisations, écrits par Anthony le 22/09.** `MGMT_EXT_ORGS`
attendait quatre `[EMPLACEMENT AUTEUR]` ; les voici :

- **MMA Korner**
- **Ultimate Rim**
- **Fighting Pacific Championship**
- **Garden of Blood**

Avec Split, le monde compte donc **cinq organisations** — ce qui recoupe
exactement l'objectif du patron dans `SPLIT-CONTEXTE-DEPART.md` §8 (« entrer
dans le top 5 des organisations », puis « passer top 3 ») et la place de Split,
« au milieu, ni la plus grosse ni la plus mauvaise ».

**L'ordre, tranché le 22/09.** `MGMT_EXT_ORGS` est une échelle de prestige
**croissant** — un combattant y monte après `MGMT_EXT_ORG_MIN_FIGHTS` combats,
sur une série de victoires. L'ordre d'Anthony :

| Rang | Organisation | Ce qu'elle dit d'un combattant qui en vient |
|---|---|---|
| 1 | **Garden of Blood** | il a commencé en bas, sans filet |
| 2 | **MMA Korner** | il a trouvé un cadre |
| 3 | **Ultimate Rim** | il a percé |
| 4 | **Fighting Pacific Championship** | le sommet extérieur — celui que Split rivalise sans le dépasser |

Mesuré sur trente-cinq lignes du monde dérivé (graine 20260922, cycle 12) : 35
passent par Garden of Blood, 24 atteignent MMA Korner, 15 Ultimate Rim, 8 le
Fighting Pacific. La pyramide se resserre à chaque échelon — c'est ce qu'on
attend d'une échelle de prestige, et ça ne demande aucun réglage.

**Un point pour le lot 4.** La trace peut porter une organisation à **zéro
combat** (un combattant qui vient d'y monter et n'a pas encore combattu). «
Ultimate Rim × 0 » se lirait mal sur un écran. À traiter à l'affichage, pas
dans la dérivation — la donnée est juste.

## 6. Terminé pour le lot

1. Des combattants inconnus arrivent régulièrement, avec une trace de carrière
   complète et cohérente, et le joueur en recrute qui il veut.
2. Les partants prennent leur retraite ; le vivier ne fond plus.
3. Le monde dérivé tient les deux cibles de réalisme du §3.
4. `npm run check` vert, aucun test existant assoupli sans décision citée.
5. La vérification d'interface de la charte §3 est livrée pour T2.
6. L'économie reste dans la bande 70 à 80 % **sur la durée de vie** de
   l'organisation — la réponse mesurée à QO-8 — salaire de victoire compris.
