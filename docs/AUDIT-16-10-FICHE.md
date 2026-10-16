# Audit du jeu du 16/10/2026 — la fiche à cocher

Relevé fait en **jouant le jeu** (version en ligne du 16/10, partie de 63 soirées, une soirée jouée en entier) à 1920×1080, écran par écran.
Chaque ligne est une chose à corriger. **Coche** quand c'est réglé.

Légende : 🔴 erreur · 🟠 illogique · 🟡 réalisme · 🔵 visuel · ⚪ texte.
**[x]** = déjà corrigé dans la branche `monde-tout-connu` (pas encore en ligne).

---

## 0. Tes trois demandes du 16/10

- [x] 🟠 **Tout est connu d'un combattant** : style, façon de combattre, faille, force dans chaque zone se lisent sans l'avoir « vu combattre ». Les blocs « Ce que tu ne sais pas » et « Jamais vu » ont disparu (fiche, avant-combat).
- [x] 🟠 **Écran d'arrivée qu'on ne revoit jamais** : une ligne « Revoir mon arrivée » est ajoutée dans Options → Partie.
- [ ] 🟠 **Échap ramène à l'Accueil** (aujourd'hui il ramène à la Carte depuis Effectif, Préliminaires, Contrats, Finances, Calendrier, Classements…). Demande d'Anthony du 16/10 : à faire, deux tests à réécrire (décision du 08/10 à remplacer).
- [ ] 🟠 **Il reste des « inconnus »** (voir C1 à C4 ci-dessous) : noms vides dans des listes de classement, cage vide sur la fiche, « — » sur la présentation.

---

## A. Règles générales du jeu

- [ ] 🟠 **A1** Leïla appelle le joueur **« Patron »** (Les affaires : « Patron, j'ai un très bon combat à vous proposer »). Le joueur est le **matchmaker**, pas le patron (le patron est un autre personnage — lot 9).
- [ ] 🟠 **A2** **Tu / vous mélangés.** L'interface tutoie (« Tu quittes le management »), Leïla vouvoie (« Votre adjointe », « Faites-les défiler, puis choisissez », « Validez la carte »), la fin de démo vouvoie (« Vous avez monté cinq soirées »).
- [ ] 🟠 **A3** **La numérotation des soirées ne colle pas.** Première soirée du joueur = « Split Fight Night 63 », mais Finances dit « Après Split Fight Night 1 », l'écran Parties dit « Soirées jouées 62 » avant d'en avoir joué une (63 après), et le Lendemain affiche « SPLIT FIGHT NIGHT 64 » en haut pour la soirée qui vient d'avoir lieu.
- [ ] 🔵 **A4** La ligne du bas **« Prochaine étape… »** double le bloc jaune de l'Accueil et touche le bord bas de l'écran (elle se cogne à la légende des touches).
- [ ] ⚪ **A5** **Accents perdus en majuscules** : « CEDRIC TCHAKOUTE » (Résultats), « TUBARAO » (Classements). Ailleurs « Cédric » est bien accentué.
- [ ] ⚪ **A6** **Apostrophes** droites et courbes mélangées (Nouvelle partie : « l'argent », « l'autre bout du monde » ; ailleurs « ’ »).
- [ ] ⚪ **A7** **Langues mélangées** : surnoms en anglais et en français (« Steel Toe », « The Beast », « La Marée », « Le Petit de Milwaukee ») ; la présentation d'un combat écrit « sambo et wrestler » alors que le jeu dit « Lutte ».
- [ ] 🟠 **A8** Le menu principal propose toujours **Carrière, Duel entre amis, Panthéon, Succès** (en attente de ta décision pour la démo).
- [ ] 🟠 **A9** Écran **« La semaine » (ancien)** : on peut tomber dessus (le Lendemain sans soirée jouée) ; il est étroit, centré, et **coupe les mots au milieu** (« Tchakou-te », « Ekaterin-e Janelidz-e »). À supprimer ou à brancher sur le nouveau cadre.
- [ ] 🟠 **A10** Écran **Organisation** (ancien) : bouton « ← Retour à la semaine » (cet écran n'existe plus), seulement l'effectif et la trésorerie, la liste des Femmes est coupée en bas, c'est « Finances » qui est surligné dans la barre. Le vrai écran de l'organisation est le lot 9 T11.

---

## B. L'argent (réalisme et logique)

- [ ] 🔴 **B1** **Une soirée type fait perdre ~100 000 €** (relevé : recettes 232 000 €, dépenses 328 000 €, soit −96 000 €) alors que la caisse de départ est de **50 000 €**. La caisse passe à −46 000 € / −53 000 € dès la première soirée.
- [ ] 🔴 **B2** « Découvert autorisé **0 €** » mais « Utilisé **46 000 €** » (Finances après la soirée) : contradiction.
- [ ] 🟠 **B3** Avant la 1re soirée : « Prochaine soirée **114 000 €** de bourses déjà engagées » pour seulement 3 combats sur 9, avec 50 000 € en caisse : aucun avertissement.
- [ ] 🟡 **B4** Les **primes** (115 000 €) font plus de la moitié des **bourses** (203 000 €) : à vérifier, c'est très lourd.
- [ ] 🟠 **B5** Contrats : Sorokin (champion) touche **16 000 € par combat** ; pour le renouvellement « il demande 11 000 € ». Il demande moins que ce qu'il gagne.
- [ ] 🔵 **B6** Finances : le panneau « Bourses versées » est **vide** (seulement « En milliers d'euros, par soirée »), « Fins de contrat » aussi, « Dernière soirée » aussi : trois cases vides sur six.
- [ ] 🟠 **B7** Lendemain : « Le public 63 sur 100 : **Les combats réclamés n'ont pas eu lieu** » à côté de « Des noms connus à l'affiche » : à vérifier, la ligne a l'air de contredire le critère calculé.

---

## C. Combattants — informations inconnues ou fausses

- [ ] 🟠 **C1** **Noms vides dans les mini-classements** : Les affaires → « Poids léger » affiche les rangs 194 et 195 **sans nom** ; la mémoire des faits affiche des rangs 22 et 23 sans nom.
- [ ] 🟠 **C2** Lendemain : « **COMBATTANT** SORT DU TOP 15 » (le nom manque) pour un poids léger 16e.
- [ ] 🟠 **C3** Fiche : l'octogone **« Dans la cage » est vide** (aucune marque rouge/hachurée) même pour un combattant qui a 2 combats chez Split, avec la légende « Numéros : ses combats vus » sans aucun numéro.
- [ ] 🟠 **C4** Présentation d'un combattant : **« Au monde — » et « Contrat — »** (cases vides) ; panneaux **« Ce qu'on en dit »** et **« Le monde »** avec leur titre mais **vides**.
- [ ] 🔴 **C5** Fiche → Combats : **l'âge des anciens combats est faux**. Nathan Cortez a 28 ans, ses combats d'avant Split sont indiqués « à 28 ans, 27, 27, 26… » alors qu'il combat chez Split depuis 2021 et que ses combats Split (2023, 2025) viennent plus tard. L'âge est calculé depuis l'âge d'aujourd'hui, pas depuis la date du combat (`mgmt-anciens.js`).
- [ ] 🟠 **C6** Fiche → Combats : les **deux combats chez Split n'ont pas de « FORCE / FAILLE »**, leur date est **coupée** (« 22 AVRIL 2… »), et celui qui est sélectionné n'a pas sa pastille V.
- [ ] 🟠 **C7** **Rang incohérent** pour le même combattant : Cortez est « N°1 » sur sa fiche mais « **Numéro 2** de sa catégorie » sur sa présentation (le champion est compté d'un côté et pas de l'autre).
- [ ] 🟠 **C8** « **Refuse tout combat** » : Tessier, Jacob (9-0, 4e), Besson, Busch, Garcia… sans aucune raison affichée, et ils sont nombreux.
- [ ] 🟠 **C9** « **Libre** » s'affiche pour des combattants sous contrat (Sorokin 3 combats, Stepanov 3 combats). Le mot veut dire « disponible », mais « libre » est aussi « sans contrat ».
- [ ] 🟡 **C10** **Classement incohérent avec le palmarès** : Eduardo Gomes (**1-0-0**) est 5e de l'organisation ; Mickaël Rémy (24-8, trois défaites de suite) est 28e mais fait le combat principal.
- [ ] 🟠 **C11** Présentation : « Bilan : 9 victoires, **1 défaites** » (pluriel) ; « CHEZ **Split** » (casse différente) ; le **surnom** manque.
- [ ] 🟠 **C12** Fiche → Aperçu : le panneau « Ce que tu as vu » ne contient qu'une ligne et laisse la moitié du panneau vide ; « Prochain combat — » vide dans Effectif.
- [ ] 🟠 **C13** Les **dossiers de Leïla** (Carte) : dans « Combat 4 · poids **léger** », 2 dossiers sur 6 viennent d'**autres catégories** (Azevedo/Lira = lourd ; Ramazanov/Cortez = mouche).
- [ ] 🟠 **C14** Dossier : le bloc « **Sa force · sa faille** » affiche **deux défaites** (pas une force), et recopie « Son histoire ici » mot pour mot.
- [ ] 🟠 **C15** Dossier : la petite carte du dossier précédent dit « Ramazanov : **Cortez** n'a plus combattu depuis 21 mois » (le nom du texte n'est pas celui du combattant).
- [ ] 🟠 **C16** Présentation → « **Ses points forts** » recopie « Son histoire ici » (les deux listent les mêmes combats). Bug connu du lot 12 T3.
- [ ] 🟡 **C17** **Âges** : l'effectif va de **20 à 36 ans** seulement (personne de 37+ ni de moins de 20 sauf un) ; le vivier, lui, monte jusqu'à 39 ans.

---

## D. Classements, matchmaking et combats (réalisme)

- [ ] 🟡 **D1** **Les classements bougent trop** après une soirée : Owona 2e → 13e après une défaite aux points ; Mansfield 2e → 16e ; François 6e → 19e ; Stassen 29e → 13e en gagnant ; Conti 5e → 19e ; Tchakoute 12e → 2e. En vrai, une défaite coûte 1 à 4 places.
- [ ] 🟠 **D2** **Le classement mondial et le Lendemain se contredisent** : le Lendemain annonce « Warre Thys sort du top 15 · 90e », « Mansfield sort du top 15 · 92e » alors que le classement mondial lu juste après n'a pas changé (11e → 11e, 13e → 13e).
- [ ] 🟡 **D3** **Une affiche absurde est possible** : combat principal Rémy (28e de l'organisation, **197e mondial**, trois défaites de suite) contre Tchakoute (2e, 25e mondial). Rien n'oblige la carte à rester cohérente.
- [ ] 🟡 **D4** **Pronostic** : « Les chiffres donnent la victoire à Tchakoute à **51 %** » pour un 2e contre un 28e.
- [ ] 🟡 **D5** **Titres mal placés** : 2 combats de titre sur 3, mais le combat principal (5 rounds) **n'est pas** un titre ; en poids léger le champion Stepanov n'a pas défendu depuis 2 mois et ne figure pas sur la carte.
- [ ] 🟡 **D6** **Champions inactifs** : Bouazza 0 défense depuis 14 mois, Fontaine 0 défense depuis 19 mois.
- [ ] 🟡 **D7** **Trop de finitions** : sur les 558 combats du passé, 64 % finissent avant la décision (KO 42,5 %, soumission 17 %, arrêt 4 %). En réalité ~50-55 % (KO ~30-35 %). 43 % des finitions tombent au 1er round.
- [ ] 🟡 **D8** **Trop de combats en 5 rounds** : 26 % (co-principal et principal chaque soirée). En réalité : principal + titres.
- [ ] 🟡 **D9** **Blessures** : 185 blessures pour 558 combats (1 sur 3) ; Zélie Masson : « Commotion cérébrale sévère — suspendue 180 jours » après une **décision** (« secoué une fois ») ; cinq combattants « suspendus 60 jours » d'un coup.
- [ ] 🟠 **D10** « **BLESSÉ** » n'est pas accordé au féminin (« ZÉLIE MASSON, 33 ANS, BLESSÉ »).
- [ ] 🟠 **D11** **Heure de fin à vérifier** : le combat de Rémy contre Tchakoute finit « 01:34 » alors que le moteur donne 206 s : l'affichage montre peut-être le temps **restant** et non le temps écoulé (en MMA on annonce le temps écoulé).

---

## E. Écran par écran

### Accueil
- [ ] 🔵 **E1** Le panneau « Demandes et affaires ouvertes » est **coupé en bas** (« Kurmanbek Musaev contre Salim Chevalier — Ouverte » rogné).
- [ ] ⚪ **E2** « Uche Chukwu **demande : un classé — Nolan Fontaine** » : phrase bancale (aussi dans Les affaires).
- [ ] ⚪ **E3** « Sources Proches **: Info :** » : l'étiquette est doublée.
- [ ] ⚪ **E4** Dates : « Mardi 12 JANVIER 2027 » (jour en minuscule, mois en majuscules) ; partout ailleurs « 8 décembre 2026 » ou « 8 DÉCEMBRE ».
- [ ] 🟠 **E5** « Ce qui s'est passé · Cette semaine » liste des faits vieux de **5 semaines**.
- [ ] 🔵 **E6** Refonte de l'Accueil à faire comme sa planche (lot 12 T2).

### Carte
- [ ] 🔵 **E10** L'étiquette **« TITRE EN JEU » est coupée** (« TITRE EN J ») sur le co-principal et le combat 3.
- [ ] 🔵 **E11** **« Annuler ce combat [X] »** et la petite croix **×** font la même chose, côte à côte.
- [ ] ⚪ **E12** Étiquette **« VIENT D'AVANT »** : on ne comprend pas ce que ça veut dire.
- [ ] 🔵 **E13** La liste est **coupée en bas** (le mot « Dossiers » du combat 5 est à moitié caché).
- [ ] 🔵 **E14** Le panneau central est **presque vide** (« Choisis son adversaire dans la liste » dans une grande case noire).

### Préliminaires
- [ ] 🔵 **E20** « ? VS ? / POIDS MOUCHE » + un grand panneau vide tant que la carte n'est pas finie ; sept raccourcis (C, R, F, M, Tab, Entrée…) affichés sans rien à faire.

### Effectif
- [ ] 🔵 **E30** Le panneau de droite est **vide en dessous** des quatre lignes (grande case noire).

### Classements
- [ ] 🔵 **E40** **Texte qui se chevauche** sur la carte du n°1 : « CHUKWUEMEKA » passe par-dessus « 3 victoires de suite ».
- [ ] 🟠 **E41** « Série en cours : 1 victoire » pour **tous** les combattants de la liste ; la colonne « Dernier combat » dit tous « V ».
- [ ] 🟠 **E42** Flèches d'évolution : **▼1** pour les rangs 3, 4, 5 (ils reculent de 1 parce que Tchakoute monte de 10) : à lire correctement.

### Ceintures
- [ ] 🟡 **E50** « 0 DÉFENSE depuis 14 mois » : ce champion n'a rien défendu en plus d'un an.

### Contrats
- [ ] 🔵 **E60** **La légende des touches (L Libérer · Entrée Proposer) passe par-dessus le bouton jaune « Proposer ce contrat »** : les deux se superposent à 1920×1080.
- [ ] 🟠 **E61** La colonne « Contrat » dessine des barres de longueur différente (8 pour Sorokin, 4 pour Cortez…) : l'échelle n'est pas expliquée.

### Camps
- [ ] 🟠 **E70** « **Ses 9 combattants chez toi** » n'en montre que **6** (le reste est caché).
- [ ] 🔵 **E71** « BOXING CLUB DE … » est **tronqué** sur la carte de droite.
- [ ] ⚪ **E72** « Les opposer les contrarie » : phrase sans explication (qui ? pourquoi ?).

### Presse
- [ ] 🔵 **E80** La carte « à la une » a un **grand triangle rouge vide** à la place d'une image.
- [ ] 🟠 **E81** « **188 nouvelles cette semaine** » alors que tout est daté « Il y a 5 semaines ».
- [ ] ⚪ **E82** Quatre cartes sur cinq disent la même chose : « X attend depuis N mois — Veut un combat. » avec le nom de famille seul.

### Résultats (soirées passées)
- [ ] ⚪ **E90** « CEDRIC TCHAKOUTE » sans accent (voir A5).
- [ ] 🟠 **E91** « Poids léger · en 5 rounds » ; « Ceinture · » avec un séparateur seul.
- [ ] 🟡 **E92** « Conti recule de la 5e à la 19e place » (voir D1).

### Finances
- [ ] 🔵 **E100** Trois cases vides (voir B6).

### Vestiaire
- [ ] 🟠 **E110** **Tri incohérent** : la liste commence par Uche Chukwu (poids lourd) puis passe aux poids mouche (ordre alphabétique des prénoms puis catégories ?).
- [ ] 🔵 **E111** « INDISPONIBLE » est **coupé** (« INDISPONIB »).
- [ ] 🔵 **E112** Aucune entrée de la barre n'est surlignée sur cet écran.
- [ ] 🔵 **E113** Panneau de droite presque vide.

### Recrutement
- [ ] 🔴 **E120** **Poids mouche : « Personne à recruter »** alors que 132 mouches existent dans le monde ; les 11 autres catégories sont bien fournies.
- [ ] 🟡 **E121** Le meilleur du vivier est inatteignable de fait : n°5 mondial **33-0** disponible à Split (Kolesnikov).

### Organisation (ancien)
- Voir A10.

### Les affaires
- [ ] 🟠 **E130** Leïla propose **« un très bon combat »** : Seán Brennan **47-5-1 contre Alain Njoya 1-0-0**.
- [ ] 🟠 **E131** Voir A1 (« Patron »), A2, C1.

### Fiche d'un combattant
- [ ] 🟠 **E140** La barre de gauche surligne **« Accueil »** alors que l'en-tête dit « EFFECTIF » (quand on arrive depuis l'Accueil).
- [ ] 🔵 **E141** Onglets **Style** et **Combats** : grande carte vide à gauche (voir C3).
- [ ] 🟠 **E142** Onglet **On en dit** : « Cortez attend depuis **15 mois** » juste au-dessus de sa phrase « **21 mois** que j'attends » (et la Carte dit 21 mois) : deux durées pour la même attente.
- [ ] ⚪ **E143** Onglet **Style** : « +1 **points** » (pluriel), « Chaque combat joué **chez nous** » (le jeu dit « chez Split » ailleurs), et « ses **quatre** combats » alors que l'onglet Combats en liste **dix**.
- [ ] 🟡 **E144** Onglet **Contrat** : Cortez (n°1 des mouches) touche **6 000 € par combat** quand le champion en touche 16 000 : écart énorme, rien ne l'explique.

### Présentation d'un combattant / d'un combat
- [ ] 🟠 **E150** « **Ce que chacun impose** » : un seul combattant, et le texte n'est pas ce qu'il impose (bilan, classement).
- [ ] 🟠 **E151** « **Leur histoire** » : la même défaite listée **deux fois**, une par côté.
- [ ] 🔵 **E152** « Ce qu'on en dit » et « Ce que ça change » : titres sans contenu.

### Soirée, avant-combat, combat
- [ ] 🔵 **E160** Soirée : écran d'ouverture correct (relevé 1920×1080) ; **la barre de gauche est grisée** pendant la soirée (voulu).
- [ ] 🟠 **E161** Avant-combat : « Stassen a **9 cm d'allonge** de plus » : phrase sans interprétation (est-ce bien ou mal ?).
- [ ] 🟠 **E162** Avant-combat : les deux combattants de chaque prélim ont souvent **le même profil** (« Frappe de loin et touche juste » des deux côtés).

- [ ] 🟠 **E164** Présentation d'un combat : « **Cette paire s'est déjà affrontée 1 fois** » et l'enjeu « Salhi battu par Masson », mais le panneau « Leur histoire » ne montre **aucun combat entre eux** (seulement chacune contre Leah Dawson).
- [ ] ⚪ **E165** Présentation : « Deux styles s'opposent : **mma** et **wrestler** » (minuscules, mot anglais).
- [ ] 🔵 **E166** Résultats d'une soirée jouée : le bloc « Ce que ça change » affiche des **cases à cocher vides** (« □ Blessure pour Tchakoute », « □ Tchakoute : un dernier combat à son contrat ») sans dire de quoi il s'agit ni quelle blessure.
- [ ] 🔵 **E167** Combat (arène) : au tout début, un grand « **ROUND 1** » fantôme reste affiché derrière le plateau, la salle est très sombre (cage lisible mais combattants minuscules : deux points « R » et « T »).

### Lendemain
- [ ] ⚪ **E170** « COIN ROUGE : On a retrouvé Mickaël Rémy dans sa salle après Split 63. Il a apporté des **croissants** pour tout le monde. On est fans. » : un blague **déplacée** pour un KO au 1er round.
- [ ] ⚪ **E171** « LE PLATEAU : En un seul round ! … Incroyable. » : cliché répété à chaque KO rapide.
- [ ] 🟠 **E172** « KO/TKO au round 3 · Marteau au sol » : le mot « Marteau » est du jargon de ring non expliqué.

### Écrans de démarrage
- [ ] 🟠 **E180** Parties : « Soirées jouées **62** » avant la première soirée du joueur (voir A3).
- [ ] 🟠 **E181** Nouvelle partie : « Créer ton organisation — **À venir** » : un bouton qui n'existe pas.
- [ ] 🔵 **E182** Écran de chargement, Accueil, Présentations, Arrivée : à refaire comme leurs planches (lot 12, en attente de quota).

---

## F. Ce qu'on n'a pas pu voir (à compléter)

- [ ] 🔵 **F1** L'arène pendant un combat : je n'ai pu voir que l'ouverture (ROUND 1, tableau de score, voix du coin). Les coups, la caméra, la fin du combat, la décision au tableau sont **à regarder ensemble** : mes captures automatiques ne tiennent pas une animation de 43 secondes.
- [ ] 🔵 **F2** Les écrans Calendrier (pose d'une soirée), Contrat (onglet), Style (fiche), Options (autres onglets).
