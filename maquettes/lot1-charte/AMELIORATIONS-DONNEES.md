# Cage Legacy : améliorations à faire sur les données

**Date :** 23/11/2026. **Origine :** retour d'Anthony sur la fin de saison : « revoir toute la taille des salles, des salaires, de tout partout ; chaque info doit être tirée de source réelle ; faut tout noter ».

Ce document **note** ce qu'il faut revoir. Il ne change aucune valeur de la maquette ni du jeu : chaque remplacement reste à valider. Une valeur sans source reste marquée « hypothèse » : rien n'est inventé pour combler un manque.

## 1. Règle de texte, pour tout le jeu

- **« patron », jamais « le patron »** dans les titres, les étiquettes et les fonctions : « Gérard Vasseur · patron ». Dans une phrase, on utilise son nom : « Gérard Vasseur fixe tes objectifs ».
- **Fait dans la maquette** : Accueil, Arrivée, Calendrier, Messages, Options, Ta carrière, fin de saison.
- **À faire dans le jeu** : `mgmt-poste.js`, `mgmt-ceremonie.js`, `mgmt-ecran-poste.js`, `mgmt-accueil.js`, `mgmt-retraits-data.js` et toute autre occurrence (à chercher au moment du lot).
- **Écart à trancher** : patron de Split, Jean-Michel Delatour dans le jeu, Gérard Vasseur dans la maquette.
- **Rédaction resserrée** (24/11/2026), sur chaque écran : étiquettes sans article ni possessif (« Contrat », « Place », « Prime ») ; rang « 4/8 » et « 4/8 ou mieux », jamais « 4e des huit » ; « Recette · 50/50 » ; fonction seule (« Matchmaker ») ; chiffres plutôt que lettres (« 3/5 », « 2 défenses »). Les citations d'un personnage restent des phrases.
- **Fait dans la maquette** : fin de saison en entier, et les étiquettes d'Accueil, Arrivée, Affiche, Calendrier, Camps, Carte, Ceintures, Finances, Menu, Messages, Organisation, Présentation, Presse, Primes, Recrutement, Recruteur, Résultats, Soirée, Ta carrière.
- **À faire dans le jeu** : le même passage sur `mgmt-*` et `ui-*`, au moment du lot.

## 2. Les soirées entre deux organisations (le choc)

### Ce que montrent les vraies soirées

| Soirée | Combats entre organisations | Champions | À retenir | Source |
|---|---|---|---|---|
| Bellator contre Rizin, 31 déc. 2022, Saitama, 23 661 spectateurs | 5 | 1 duel entre champions en titre (Pitbull–Koike Erbst). McKee, ancien champion, affronte de Souza, champion de Rizin. Le reste : anciens champions et combattants de premier plan | 10 autres combats sur la même soirée. Règles de l'organisation hôte. Bellator gagne 5-0 | [Wikipédia](https://en.wikipedia.org/wiki/Rizin_40), [ESPN](https://africa.espn.com/mma/story/_/id/35372415/do-know-how-put-samurai-suit-scenes-ambitious-bellator-rizin-crossover-japan) |
| PFL contre Bellator, 24 févr. 2024, Riyad | Carte présentée « champions contre champions » | 4 duels de champions prévus, 2 modifiés avant la soirée | Un champion blessé est remplacé, parfois à un poids convenu. Un combat a été annulé le jour de la pesée. Des combats sans lien avec le choc sont sur la carte | [Wikipédia](https://en.wikipedia.org/wiki/PFL_vs._Bellator), [Cageside Press](https://cagesidepress.com/2024/02/24/pfl-champions-vs-bellator-champions-full-results) |
| Bellator x Rizin 2, 30 juil. 2023, Saitama | 4 | Un titre Rizin vacant réellement en jeu (Archuleta–Ougikubo), un champion Rizin battu dans un combat de Grand Prix | Un forfait à quatre jours remplacé par un champion, à poids convenu | [Wikipédia](https://en.wikipedia.org/wiki/Bellator_MMA_x_Rizin_2) |

**Conclusion : une double soirée n'est pas faite que de combats pour le titre.** Elle mêle champions, anciens champions et classés, et elle doit gérer les forfaits.

### Ce que fait la maquette (à valider)

- La proposition compte **5 combats** : 2 entre champions, 3 entre classés. Il faut garder au moins un duel entre champions.
- **Négocier** remplace « Contre-proposer » : tu choisis un de tes champions disponibles. L'écran dit si leur champion de la même catégorie peut venir. Sinon, ils proposent leur meilleur classé disponible. Le filtre **Classés** permet aussi de mettre un combattant qui n'est pas champion : en face, leur classé libre le plus proche au mondial (hypothèse, à valider).
- Il faut gagner 3 combats sur 5. Les ceintures restent en place.

### Écarts avec le jeu

- Le jeu limite le choc à **3 combats, tous entre champions** (`mgmtChocPaires`) et demande un champion des deux côtés.
- Le jeu ne regarde pas si un champion est blessé ou déjà à l'affiche.
- Le jeu tire au sort la réponse à une contre-proposition (de 90 % pour la 1re à 34 % pour la 8e). La maquette accepte toujours.
- **Non trouvé :** aucun partage réel de la recette entre deux organisations. « Recette · 50/50 » reste une hypothèse du jeu.
- **À décider :** une vraie ceinture peut-elle être en jeu ? Bellator x Rizin 2 l'a fait pour un titre vacant.

## 3. Les salles

| Dans la maquette | Places | Ce que disent les sources | À faire |
|---|---:|---|---|
| Lyon, Palais des sports | 5 800 | Gerland : 5 910 places ([Wikipédia EN](https://en.wikipedia.org/wiki/Palais_des_Sports_de_Gerland)), 6 500 en maximum ([liste FR](https://fr.wikipedia.org/wiki/Liste_de_salles_de_spectacle_en_France)) | Passer à 5 910 |
| Marseille, Dôme | 8 000 | Le Dôme : 8 500 ([liste FR](https://fr.wikipedia.org/wiki/Liste_de_salles_de_spectacle_en_France)) | Passer à 8 500 |
| Nice, Palais Nikaïa | 5 000 | 6 250 assis, 9 000 avec le debout ([Wikipédia](https://en.wikipedia.org/wiki/Palais_Nika%C3%AFa)) | Passer à 6 250 |
| Lille, Forum de Lille | 4 000 ou 4 200 | Salle absente des listes lues. Zénith de Lille : 7 000 ([Wikipédia](https://en.wikipedia.org/wiki/Z%C3%A9nith_de_Lille)) | Choisir une vraie salle. **Touche le point ouvert 4 000 / 4 200** |
| Grenoble, Halle de Grenoble | 4 000 | Salle absente des listes lues. Summum : 5 000. Palais des sports : 8 973 (liste FR) ou 12 000 ([liste EN](https://en.wikipedia.org/wiki/List_of_indoor_arenas_in_France)) | Choisir une vraie salle et vérifier la capacité |
| Bordeaux, Palais des sports | 3 800 | Salle absente des listes lues. Arkéa Arena : 8 000 assis, 11 300 avec le debout ([Wikipédia](https://en.wikipedia.org/wiki/Ark%C3%A9a_Arena)). Mériadeck : 4 800 ou 7 250 selon la liste | Choisir une vraie salle |
| Nantes (soirée 65, inventée) | 3 980 spectateurs | Palais des sports de Beaulieu : 5 500. Zénith : 8 500 à 9 000 (listes EN et FR) | Fixer la salle |
| « Grande salle » | 15 000 et plus | Accor Arena : 20 300. UFC Paris 2022 : 15 405 spectateurs ([Wikipédia](https://en.wikipedia.org/wiki/UFC_Fight_Night:_Gane_vs._Tuivasa)) | Seuil cohérent |

Prévoir pour chaque salle **la capacité en configuration MMA**, souvent inférieure au maximum : les listes donnent surtout des maximums de concert.

## 4. Les bourses et les salaires

| Valeur | Dans la maquette | Repère réel | Constat |
|---|---|---|---|
| Bourse de Nana (champion de Split) | 120 000 € | Oktagon 67 : de 750 € à 75 000 € pour une défense de titre, **origine des chiffres non précisée** ([Sporty Salaries](https://www.sportysalaries.com/2025/02/oktagon-67-salaries-purse-payouts.html)) | **Illogique** : plus qu'un champion d'Oktagon, pour une organisation à 4 800 spectateurs. Sur une billetterie de 264 792 € à la soirée 63 (4 012 × 66 €), elle pèse 45 % si elle est versée en entier, 23 % pour la part fixe de 60 000 € que touche Nana battu |
| Bourses des autres combattants | 10 000 à 52 000 € | Cage Warriors : beaucoup à moins de 2 000, 10 000 € pour le combat principal ([Boxing News](https://boxingnews.com/news/oktagon-mma-will-need-more-than-money-to-break-through)) | Probablement trop hautes pour une organisation de second rang |
| Repère haut | — | UFC 331 : 12 000 à 650 000 $ déclarés ([Agent MMA](https://agentmma.com/mma-lab/ufc-fighter-pay-explained)) | Sert de plafond pour Garden of Blood |
| Salaire du matchmaker | 3 200 € par mois | **Aucune source trouvée**, y compris pour les matchmakers de l'UFC | Hypothèse à garder ou à remplacer |
| Hausse à la prolongation | + 25 % | Aucune source | Règle du jeu, hypothèse |
| Salaire d'une offre | ± 10 % par place, borné à ± 30 % | Aucune source | Règle du jeu. Une organisation mieux classée peut payer moins que Split : à revoir |
| Primes de la soirée | 50 000 / 50 000 / 20 000 € | UFC : 100 000 $, et 25 000 $ pour une finition sans autre prime (Agent MMA). Oktagon : 5 000 € (section « Les primes » des règles) | Montants de niveau UFC pour une organisation de second rang |

## 5. Les recettes

| Valeur | Dans la maquette | Repère réel | À faire |
|---|---|---|---|
| Billet moyen | 52 à 66 € | UFC Paris : 3 242 837 $ pour 15 405 spectateurs, soit environ 210 $ | Trouver un repère pour une organisation européenne de second rang |
| Location des salles | 95 000 à 130 000 € | Aucune source | À sourcer auprès des salles |
| Diffuseur, partenaires, bar, VIP | Hypothèses | Aucune source | À sourcer |
| Part des combattants dans le revenu | 58 à 83 % avec les primes | Aucune part publique fiable (Agent MMA) | Le niveau actuel paraît trop haut : à recalculer après les bourses |

## 6. Prolonger ou libérer un combattant (maquette validée le 26/11)

### Ce que disent les sources

| Point | Repère réel | Statut | Source |
|---|---|---|---|
| Forme du contrat | Une bourse fixe, et une prime de victoire du même ordre ; sous six chiffres, la victoire double en général la bourse | Explicatif de presse (2022) | [Boardroom](https://boardroom.tv/ufc-fight-contract-explainer/) |
| Hausse d'un contrat | La bourse monte par palier à chaque victoire : Khabib Nurmagomedov de 21 000 $ + 21 000 $, puis +3 000 $ par victoire ; l'UFC a envisagé de passer l'entrée de gamme de 10 000 $ + 10 000 $ à 14 000 $ + 14 000 $ | Déclaré (pièces du procès Le c. Zuffa) | [Sherdog](https://www.sherdog.com/news/articles/New-UFC-Antitrust-Filings-Give-Further-Insight-into-Fighter-Negotiations-Compensation-163437) |
| Prolonger avant le dernier combat | L'UFC renégocie souvent quand il reste un combat, mais laisse parfois le combattant finir son contrat (Chookagian 2022, Larkin) | Témoignages de combattants | [MMA News](https://www.mmanews.com/article/katlyn-chookagian-becomes-a-free-agent-after-ufc-vegas-46-win), [ESPN](https://www.espn.com/blog/mma/post/_/id/23423/larkin-talks-free-agency-slap-in-the-face-ufc-fight) |
| Refuser de jouer son dernier combat sans garantie | Paulo Costa : « le combat prévu, plus d'argent, ou la libération » | Presse | [LowKick MMA](https://www.lowkickmma.com/paulo-costa-ufc-ultimatum-contract-hunter-campbell/) |
| Après la fin du contrat | 60 jours de négociation exclusive, puis un droit d'aligner une offre pendant un an ; un champion voit son contrat prolongé d'un an ou de 3 combats | Contrat type Zuffa de 2007, revu depuis | [Sherdog](https://www.sherdog.com/news/articles/Inside-the-Standard-Zuffa-Contract-9734) |
| Libérer | Le promoteur peut mettre fin au contrat après une défaite ; en cas de rupture, ce qui reste dû se paie « hors primes de victoire » ; une blessure prolonge la durée du contrat | Contrat type Zuffa de 2007 | [Sherdog](https://www.sherdog.com/news/articles/Inside-the-Standard-Zuffa-Contract-9734) |
| Libérés ou non prolongés | Des combattants partent après 2 ou 3 défaites, d'autres ne sont pas prolongés à la fin du contrat, sans raison donnée | Presse | [Deadspin](https://deadspin.com/why-the-ufc-released-undefeated-bantamweight-farid-basharat/) |
| Organisation de second rang | Cage Warriors prolonge ses combattants pour « plusieurs combats » ; un champion, pour 3 combats | Communiqués et presse | [Fightful](https://www.fightful.com/mma/cage-warriors-resigns-two-champions) |

### Ce que fait la maquette

- **Van Belle** (7 000 € + 7 000 €, 1 combat restant, contrat de la fiche) demande **9 000 € + 9 000 € sur 4 combats et 4 000 € à la signature**. La hausse de 29 % vient des offres de MMA Korner et Pure Impact : **hypothèse**, plus forte que le palier de Khabib (+14 % par victoire).
- **Kessler** (9 000 € + 9 000 €, 2 défaites de suite) demande **le même prix sur 3 combats** et 3 000 € à la signature : il cherche la sécurité, pas une hausse. Hypothèse.
- **Les autres combattants de Split** : hausse de 0 à 25 % selon leurs 3 derniers combats (+10 % par victoire au-delà de la première, sur les 3 derniers combats, 25 % pour un champion), 2 combats à 33 ans et plus, 5 à 24 ans et moins, 4 sinon. **Hypothèse.**
- **Prime de signature** : 10 % du contrat, règle du jeu (`MGMT_CT_PRIME_PART`).
- **Un accord remplace le combat restant** : le nouveau contrat commence aujourd'hui (le combat du 16 février en est le 1er). Comme une renégociation réelle avant le dernier combat.
- **Libérer** paie la **bourse fixe** de ce qui reste, sans la prime de victoire (Kessler : 9 000 €). Proche de la clause Zuffa « hors primes de victoire ».
- **Refus** : à l'affiche (règle du jeu, `mgmtContratLiberer` refuse « carte ») ; blessé (hypothèse, d'après la clause Zuffa qui prolonge le contrat d'un blessé) ; négociation rompue, 2 mois sans nouvelle offre (règle du Recrutement, validée le 09/11).
- **Une soirée jouée garde le contrat de son jour** : la caisse ne recalcule pas les soirées passées avec la nouvelle bourse.

### Écarts avec le jeu

- Le jeu **ajoute** les combats prolongés aux combats restants (`mgmtContratRenouveler`) ; la maquette les **remplace**.
- Le jeu paie à la libération **toute la bourse** des combats restants (`mgmtContratIndemnite` : « Libérer · 52 000 € » pour 4 combats à 13 000 €) ; la maquette paie la bourse fixe seule.
- Le jeu majore la demande de 10 % au renouvellement (`MGMT_CT_RENOUV_MAJORATION`) ; la section 4 notait « + 25 % » sans source.
- Le jeu ne refuse pas de libérer un blessé.

## 7. Le mode Duo (maquette du 26/11, validée)

### Ce que disent les sources

| Point | Repère réel | Statut | Source |
|---|---|---|---|
| Enchère sur un combat (boxe) | Quand les deux camps ne s'entendent pas, la fédération ouvre une enchère : chaque promoteur fait **une offre**, la plus haute gagne et verse une part d'avance | Encyclopédie | [Wikipédia](https://en.wikipedia.org/wiki/Purse_bid) |
| Montants réels | WBC, Sandoval–Yafai (13 mars 2026) : 625 000 $ contre 411 000 $ ; 10 % de la bourse au vainqueur du combat | Officiel (WBC) | [WBC](https://wbcboxing.com/en/matchroom-boxing-wins-purse-bid-for-wbc-flyweight-unification-bout-between-ricardo-sandoval-and-galal-yafai) |
| Montants réels | IBF, Ennis–Crowley (déc. 2024) : 3 910 000 $ contre 2 000 000 $ ; partage 85/15 (règle 10.E) | Presse | [The Ring](https://www.ringmagazine.com/news/jaron-ennis-cody-crowley-matchroom-boxing-outbids-tgb-promotions-to-land-ibf-title-fight-3cy94q4m4V60U9mN0m7fqU) |
| Ordre d'un draft | En serpent : l'ordre s'inverse à chaque tour (1-10, 10-1, 1-10…) | Officiel (ESPN) | [ESPN](https://support.espn.com/hc/en-us/articles/360000067532-Live-Online-Snake-Drafts) |
| Soirée entre organisations | Bellator contre Rizin, 31 déc. 2022, 23 661 spectateurs ; PFL contre Bellator, 24 févr. 2024, 4 duels de champions prévus, 2 changés | Encyclopédie | [Rizin 40](https://en.wikipedia.org/wiki/Rizin_40), [PFL vs. Bellator](https://en.wikipedia.org/wiki/PFL_vs._Bellator) |

### Ce que fait la maquette

- **Enchères ouvertes, à tour de rôle** (décision du 18/10), alors que les vraies enchères sur un combat sont **sous pli, en une offre**. Ouverture à 3 × la bourse demandée, palier de 10 % de l'ouverture : règle du jeu, sans repère réel.
- **Draft « je place, tu réponds »** : J2, J1, J1, J2, J2, J1… C'est l'ordre en serpent à deux joueurs.
- **200 000 € / 50 000 € / 125 000 €** : décision du 18/10, **hypothèse** (aucun partage publié entre deux organisations, section 2).
- **Caisse stable hors super carte** (décision du 18/10) : la caisse de Split est celle du 4 janvier (952 200 €, Finances) ; les soirées des adjoints ne la font pas bouger.
- **Caisses de départ des sept autres** : Garden of Blood 1 384 500 € et MMA Korner 212 400 € (parties inventées de l'écran Parties), les cinq autres **inventées** (Ultimate Rim 318 000, Fighting Pacific 1 120 000, Knuckle Gate 236 000, Pure Impact 2 450 000, Undisputed Cage 905 000 €).

### Écarts avec le jeu

- Le jeu commence Split à 50 000 € et MMA Korner à 20 000 € : la première ouverture (105 000 € dans la capture du jeu) est hors de portée des deux joueurs. Il faut choisir : caisses de départ plus hautes, ou ouverture plus basse.
- Le jeu met aux enchères des libres que la maquette ne retrouve pas (le marché du Recrutement validé n'est pas celui du jeu).

## 8. Encore à vérifier, écran par écran

- [ ] Spectateurs, records et top 30 des huit organisations.
- [ ] Nombre de soirées par an et écart entre deux soirées.
- [ ] Nombre de combats par combattant et par an.
- [ ] Âge des champions, durée des règnes et nombre de défenses.
- [ ] Durée et nombre de combats des contrats (prolongation : repères en section 6, chiffres de la maquette encore hypothèses).
- [ ] Coût du recruteur, de l'interprète et des voyages.
- [ ] Salaires de l'équipe (Leïla, Marco, Dr Roux).
- [ ] Caisse de départ : 50 000 € dans le jeu, 952 200 € à l'Arrivée.

## 9. Méthode pour chaque valeur

1. Noter la valeur actuelle et l'écran où elle apparaît.
2. Chercher un repère réel à la bonne échelle : une organisation de second rang ne se compare pas à l'UFC.
3. Citer la source et dire si le chiffre est officiel, déclaré ou estimé.
4. Sans source, écrire « hypothèse ».
5. Faire valider le changement, puis l'appliquer partout en même temps.
