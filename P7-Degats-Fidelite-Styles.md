# P7 — Dégâts, fidélité MMA, identité des styles

Plan en **quatre lots séquentiels**. Chacun devient un prompt distinct envoyé dans une session neuve. Ne les fusionne pas : chaque lot modifie le comportement du moteur, et si deux changements arrivent ensemble tu ne pourras plus attribuer une dérive de distribution à l'un ou à l'autre.

Ordre imposé : **L1 → L2 → L3 → L4**. L1 pose l'outillage de mesure, L2 refait les dégâts, L3 refait le sol, L4 donne leur identité aux styles. L4 en premier ne servirait à rien : sans sol crédible, un jiu-jitsu ne peut pas se distinguer.

---

## État des lieux mesuré

Tout ce qui suit a été mesuré sur la branche `claude/horloge-continue-combat-xwm0ma`, 12 000 combats, pas déduit du code.

**Dégâts** — `engine-combat.js:389` : `dmgA += clamp(offB*0.22*0.22, 0, 6) * (dt/50)`. Un flux quasi constant, borné à 6 par tick, réparti ensuite par `RI(1,3)` sur une zone tirée au sort (`:451`). Aucun coup lourd, aucune queue de distribution. Résultat : dégâts cumulés moyens 11,35, écart-type 6,23, p90 19, **maximum 35 sur 24 000 relevés**. Une raclée extrême et un combat moyen sont séparés par un facteur 3. Dans le vrai MMA, ce facteur est bien plus grand.

**Sol** — 0,1 passage de garde, 0,1 renversement, 0,1 relevé, 0,3 tentative de soumission, 36 s de contrôle par combat. Il n'y a pas de positions : le code connaît `debout`, `clinch`, `sol`, et au sol un unique booléen `topIsA`. Pas de garde, de demi-garde, de contrôle latéral, de montée, de dos. Pourtant le jiu-jitsu gagne 48,9 % de ses combats par soumission — les soumissions sortent donc d'un tirage, pas d'une position construite.

**Styles** — `engine.js:135` : un style est un sac de bonus plats de +3 à +11 sur quelques attributs, plus un scalaire `grap` (propension au grappling, de 0,15 à 0,77). Rien d'autre. Sur 2 400 à 2 550 combats par style, les taux de victoire tiennent tous entre **49,0 % et 51,3 %** : le style ne décide pratiquement rien, l'overall décide tout. Les profils de finition, eux, diffèrent fortement — un style change donc *comment* on gagne, jamais *contre qui*.

**Décisions** — 24,6 % de décisions partagées, soit environ 39 % de toutes les décisions. Les cartes sont trop souvent à pile ou face.

---

## LOT 1 — Instrumentation et référence

> Aucun changement de comportement dans ce lot. Tu mesures, tu documentes, tu ne corriges rien.

**1.1 — Étendre le harnais.** `tools/monte-carlo-combat.js` affiche déjà moyenne, écart-type et p90 depuis le lot précédent. Ajoute, pour chaque métrique de combat : **p50, p99 et maximum**. Les queues de distribution sont l'objet de tout ce plan ; une moyenne ne les voit pas.

**1.2 — Matrice de matchups exploitable.** La matrice style contre style existe mais n'est pas exposée en sortie lisible. Produis un tableau 8×8 des taux de victoire, avec l'effectif de chaque cellule et un intervalle de confiance à 95 %. Sans l'intervalle, tu ne sauras pas distinguer un vrai avantage d'un artefact d'échantillonnage — dimensionne l'échantillon pour que chaque cellule ait au moins 2 000 combats.

**1.3 — Contrôler l'effet de l'overall.** La matrice actuelle mélange des combattants de niveaux différents, donc l'écart de style est noyé. Ajoute un mode où les deux combattants ont **le même overall** (à ±2 près), pour isoler la contribution du style. C'est cette matrice-là qui sert de référence à L4.

**1.4 — Empreinte statistique par style.** Pour chaque style : répartition des frappes par cible et par position, temps de contrôle, tentatives de soumission, taux de finition, part des combats allant aux cartes. C'est la carte d'identité que L4 devra rendre reconnaissable.

**1.5 — Rapport de référence.** Écris tout ça dans `tools/reports/baseline-P7.md`, versionné celui-là (contrairement aux rapports courants). Chaque lot suivant compare à ce fichier.

**Livrable** : le rapport, plus une liste des écarts les plus criants avec le MMA réel, classés par ampleur.

---

## LOT 2 — Modèle de dégâts

> Objectif : que le dégât arrive par **pics** et non par flux, et qu'il **laisse des traces** pendant le combat.

### 2.1 Deux composantes au lieu d'une

Remplace le flux unique par :

- **l'usure** — un fond continu, faible, produit par le volume de frappes. C'est à peu près le modèle actuel, mais avec une amplitude nettement réduite ;
- **les coups lourds** — des événements rares dont l'amplitude suit une **distribution à queue épaisse**. Un coup lourd doit pouvoir valoir dix fois l'usure d'un round entier.

La fréquence d'un coup lourd dépend de `power`, `cross`, `hook`, `killer`, `handSpeed`, et de la vulnérabilité du moment (adversaire fatigué, sonné, adossé, en train de tenter une amenée). Son amplitude dépend de `power` et du `chin`/`durability` de celui qui encaisse.

**Le plafond par tick (`clamp(..., 0, 6)`) doit sauter.** Il est aujourd'hui le principal responsable de la queue coupée. Borne l'amplitude **d'un coup**, jamais la somme d'un tick ou d'un round.

### 2.2 Le dégât doit avoir des conséquences

Aujourd'hui `dmgHead`, `dmgBody`, `dmgLegs` sont des compteurs d'affichage. Ils doivent rétroagir sur le combat, avec un effet **progressif et non binaire** :

- **jambes** → dégradation de `footSpeed` et du volume de kicks ; au-delà d'un seuil, chute de la mobilité et vulnérabilité aux amenées ;
- **corps** → dégradation de `cardio` et accélération de la fatigue ; réduction du volume de frappes en fin de combat ;
- **tête** → dégradation de `chin` et de `composure` ; chaque knockdown encaissé abaisse durablement le seuil du suivant.

C'est ce dernier point qui produit la texture des vrais combats : un combattant touché une fois devient plus facile à toucher, et les finitions arrivent en cascade plutôt qu'à froid.

### 2.3 Fenêtre de finition

Quand un combattant est `wobbled`, ouvre une **fenêtre courte de danger maximal** (quelques secondes d'horloge, pas un tick) pendant laquelle :

- l'attaquant augmente son volume en fonction de `killer` et d'`aggression` ;
- le défenseur récupère en fonction de `composure`, `heart`, `recovery` et `chin` ;
- une finition devient nettement probable, sans être automatique.

Une victoire par KO doit se lire dans le déroulé : un coup lourd, un knockdown, un enchaînement, l'arrêt. Pas une ligne isolée.

### 2.4 Coupures et arrêt médical

`cuts` existe et n'est jamais exploité. Une coupure ouverte par un coup de coude, un coup lourd ou un choc de têtes, aggravée par le volume de frappes sur la zone, doit pouvoir déclencher un **arrêt médical** — méthode de victoire distincte du KO, à faire remonter jusqu'à `f.history` et aux écrans.

### 2.5 Récupération entre les rounds

`recovery` doit gouverner ce que la cloche efface : une partie de la fatigue, une partie de l'état `wobbled`, **jamais** les dégâts cumulés aux jambes et au corps. Un combattant qui a pris quarante low kicks au round 2 ne repart pas neuf au round 3.

### Critères d'acceptation du lot 2

Sur 12 000 combats, comparés à `baseline-P7.md` :

- écart-type des dégâts cumulés **en hausse d'au moins 40 %**, p99 et maximum en hausse nette — c'est l'objectif même du lot ;
- moyenne des dégâts cumulés stable à ±10 % : on redistribue, on n'inflate pas ;
- part des KO/TKO en hausse vers la cible de L3, sans dépasser 40 % ;
- aucun combat à dégâts nuls ni à dégâts aberrants (contrôle du p99,9) ;
- les invariants existants passent sans modification.

---

## LOT 3 — Fidélité au MMA réel

> Deux chantiers : le sol, qui n'existe pas, et la notation, qui produit trop de décisions partagées.

### 3.1 Hiérarchie de positions au sol

Remplace le booléen `topIsA` par une **position nommée** : garde fermée, garde ouverte, demi-garde, contrôle latéral, montée, contrôle du dos, plus la position debout et le clinch contre la cage.

Chaque position définit :

- **qui contrôle** et combien de contrôle par seconde elle rapporte ;
- **le volume et la dangerosité des frappes** possibles depuis cette position ;
- **les soumissions accessibles** depuis cette position et depuis son inverse ;
- **les transitions possibles**, avec leur probabilité, gouvernées par les attributs concernés : `topControl`, `guardWork`, `submission`, `flexibility`, `strength`, `explosiveness`, `scrambles`.

Le dessous n'est pas passif : garde fermée offre balayages et soumissions ; contrôle du dos est la position la plus dangereuse du jeu. C'est ce qui rend un jiu-jitsu redoutable au sol même dominé positionnellement, et c'est aujourd'hui totalement absent.

Les compteurs existants (`guardPasses`, `reversals`, `standups`, `subAtt`, `subEscapes`) deviennent alors des sorties naturelles des transitions au lieu de tirages isolés.

### 3.2 Soumissions construites

Une soumission ne doit plus tomber d'un tirage : elle s'amorce depuis une position, se défend (`flexibility`, `composure`, `strength`), et se conclut ou échoue. Une tentative ratée coûte souvent la position — c'est le risque qui rend le grappling intéressant.

Cible : plusieurs tentatives par combat chez les spécialistes, une part significative des rounds au sol comportant au moins une menace, contre 0,3 tentative par combat toutes catégories aujourd'hui.

### 3.3 Notation des juges

Trois corrections :

- **10-8 quand la domination est franche.** Vérifie s'ils existent ; s'ils n'existent pas, ajoute-les selon les critères unifiés (dégâts, durée de domination, absence de riposte). Leur absence force des cartes serrées et gonfle les décisions partagées.
- **Bruit corrélé entre juges.** Trois juges qui tirent indépendamment produisent trop de désaccords. Ils doivent partager une lecture commune du round et ne diverger qu'à la marge, avec des sensibilités différentes — un juge plus sensible au contrôle, un autre aux dégâts.
- **Cohérence panneau / cartes.** Un round où le panneau montre une domination nette ne doit pas pouvoir être donné à l'autre. Rends la formule de notation traçable : pour chaque round, les composantes du score de chaque juge doivent être inspectables par le harnais.

Cible : **décisions partagées ramenées sous 15 % de l'ensemble des décisions**, contre 39 % aujourd'hui.

### 3.4 Étalonnage sur des références réelles

Établis une table de comparaison entre le moteur et le MMA professionnel sur : part des KO/TKO, des soumissions et des décisions ; précision des frappes significatives ; frappes significatives par minute ; précision et défense d'amenées ; temps de contrôle moyen ; knockdowns par combat.

**Cite tes sources publiques et donne les chiffres retenus.** N'utilise pas les fourchettes du rapport Monte Carlo existant : elles sont affirmées sans référence et certaines sont douteuses. Si une cible ne peut pas être sourcée, dis-le et propose une valeur de design assumée plutôt qu'un faux benchmark.

### Critères d'acceptation du lot 3

- décisions partagées sous 15 % des décisions ;
- part des combats allant aux cartes ramenée vers 50 %, contre 63 % ;
- tentatives de soumission, passages de garde, renversements et relevés à des ordres de grandeur crédibles, avec des écarts marqués entre spécialistes et non-spécialistes ;
- temps de contrôle nettement supérieur pour les lutteurs et les grapplers, faible pour les frappeurs ;
- table d'étalonnage sourcée, avec l'écart moteur/réel pour chaque ligne.

---

## LOT 4 — Identité et matchups des styles

> Objectif : que chaque style se démarque nettement **dans les affrontements**, tout en restant globalement équilibré.

### 4.1 Le style devient un comportement, pas un sac de bonus

Garde les bonus d'attributs, mais ajoute à chaque style une **politique de combat** :

- **distance préférée** et volonté de la maintenir ou de la fermer ;
- **initiative** : mener ou contrer ;
- **rythme** : volume constant, ou par salves ;
- **propension au grappling** — `grap` existe déjà, mais il doit devenir une décision contextuelle et non un scalaire fixe : un frappeur en retard aux points ne tente pas une amenée, un lutteur qui se fait toucher y va plus tôt ;
- **réaction quand il est en danger** : reculer, clincher, chercher l'amenée, répondre ;
- **réaction quand il domine** : chercher la finition ou gérer.

C'est cette politique, bien plus que les bonus, qui crée les matchups.

### 4.2 Asymétrie assumée

Le point clé, et le critère qui décide de la réussite du lot : **la moyenne par style reste proche de 50 %, mais les cellules de la matrice s'écartent franchement.**

Cible : au moins une cellule à **60/40 ou plus marqué** dans les affrontements de spécialités opposées, à overall égal. Un lutteur d'élite contre un frappeur à faible défense d'amenée ne doit pas gagner 52 % du temps : il doit dominer. Et le contre-style doit exister — le frappeur à excellente défense d'amenée doit punir le lutteur qui insiste.

Cela suppose une **non-linéarité** : l'écart `takedown` contre `tdd` passe aujourd'hui par une sigmoïde de pente douce (`sigmoid((a.takedown-b.tdd)/15)`). À écart élevé, l'issue doit devenir quasi certaine, pas seulement favorable.

### 4.3 Empreinte statistique reconnaissable

Chaque style doit être identifiable **à l'aveugle** à partir de sa feuille de statistiques :

- boxe : frappes à la tête très majoritaires, quasi tout à distance, volume élevé, peu de contrôle ;
- muay-thaï : part importante de corps et jambes, temps de clinch significatif ;
- karaté : volume plus faible, précision et puissance par salves, distance longue, taux de KO élevé ;
- lutte : temps de contrôle élevé, beaucoup d'amenées, frappes majoritairement au sol ;
- jiu-jitsu : nombreuses tentatives de soumission, temps important en position inférieure, taux de soumission élevé ;
- sambo : profil intermédiaire lutte/soumission, amenées explosives ;
- kickboxing et MMA complet : profils équilibrés, mais distincts l'un de l'autre.

### 4.4 Garde-fou d'équilibrage

L'asymétrie ne doit pas produire un style dominant. Après réglage, à overall égal, **aucun style ne dépasse 53 % ni ne descend sous 47 %** en moyenne sur tous ses adversaires. Si un style sort de cette bande, corrige la politique ou les bonus — jamais en écrasant les asymétries de cellule, qui sont l'objectif du lot.

### Critères d'acceptation du lot 4

- matrice 8×8 à overall égal, chaque cellule sur au moins 2 000 combats, avec intervalles de confiance ;
- au moins six cellules à 60/40 ou plus marqué, dans des sens cohérents avec la logique des styles ;
- moyenne par style dans la bande 47–53 % ;
- empreintes statistiques distinctes, vérifiées par un test qui identifie le style à partir des seules statistiques de combat ;
- aucune régression sur les critères des lots 2 et 3.

---

## Règles communes aux quatre lots

1. **Ancre systématique** sur chaque changement de modèle, avec la justification et le chiffre mesuré qui l'a motivé.
2. **Avant/après sur 12 000 combats** à chaque lot, avec moyenne, écart-type, p50, p90, p99 et maximum. Une moyenne seule ne prouve rien : le lot précédent a montré qu'une distribution peut se resserrer de 9 % en écart-type sans qu'aucune moyenne ne bouge.
3. **Ne jamais compenser un écart par un facteur correctif** sans avoir identifié sa cause. Si un chiffre dérive, on trouve pourquoi avant de le rattraper — un facteur appliqué à l'aveugle masque le mécanisme et le rend indébogable.
4. **`npm run check` vert** à chaque lot. Les tests d'invariants ne doivent jamais être assouplis : s'ils cassent, c'est le modèle qui est faux.
5. **Le déterminisme seedé est non négociable.** Un même seed reproduit le même combat après chaque lot.
6. **Performance** : le harnais doit rester exécutable en quelques dizaines de secondes pour 12 000 combats. La hiérarchie de positions du lot 3 est le risque principal — mesure avant et après.
7. Une PR par lot, jamais deux lots dans la même branche.
