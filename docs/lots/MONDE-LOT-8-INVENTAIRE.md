# Lot 8 — Les événements dans les menus : l'inventaire (tranche T3)

Branche `monde-lot-8-marques`. Relevé fait dans le code le 10/10/2026, en lecture seule : aucun fichier de code n'a été touché.
Source : `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, section « Lot 8 », et `docs/CATALOGUE-HUMANITE.md` / `docs/LOT-5-UN-MONDE-HUMAIN.md` pour les scénarios.

Un mot sur le vocabulaire. Le brief dit « semaine ». Dans le code, la seule horloge qui date un événement est le **cycle** (`m.cycle`). Un cycle ne dure pas une semaine du calendrier : voir l'annexe A4. Dans les parties 1 à 6 de ce document, « semaine » veut dire « cycle ».

---

## 1. En bref

Le jeu produit aujourd'hui **40 sortes d'événements** attachés à un combattant (tableau de la partie 2). Les 40 se rattachent à un des sept menus du brief, mais **34 sans hésiter et 6 demandent ton arbitrage** ; seules **12 s'affichent déjà dans le menu où elles devraient naître** (5 dans Presse, 2 dans Contrats, et 1 chacune dans Effectif, Classements, Ceintures, Camps et Résultats) : les 28 autres se lisent ailleurs (La semaine, le lendemain d'une soirée, la fiche) ou nulle part.

Le tableau du brief propose **15 événements** hors Presse. **3 existent déjà**, **5 existent en partie** et **7 n'existent pas**. Au total **11 événements sont à valider par toi** avant d'être codés (partie 3, de N1 à N11) : les 7 qui n'existent pas, plus la partie manquante de 4 de ceux qui existent en partie.

Le brief parle de quatre scénarios à suite : le code en contient davantage (partie 4). Et le catalogue en prévoit **20 autres** qui ne sont pas codés, chacun avec sa case d'accord.

---

## 2. Ce qui existe déjà

Lecture du tableau.
- **Menu** : le menu où la sorte devrait naître, parmi les sept du brief. C'est une proposition de ma part ; « (à arbitrer) » marque les 6 rattachements qui ne vont pas de soi.
- **Attaché à un nom** : le jeu sait de quel combattant il s'agit.
- **Daté par semaine** : le jeu garde le cycle où l'événement s'est produit. « non » veut dire que l'événement se calcule au moment de l'affichage et n'a pas de date gardée.
- Les phrases citées sont celles du jeu aujourd'hui ; beaucoup sont des propositions non relues (`relu:false`).

| N° | Sorte d'événement | Exemple de ce que le joueur lit | Où il s'affiche aujourd'hui | Menu où il devrait naître | Nom ? | Semaine ? |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Un combattant rejoint l'organisation | « Nom rejoint Split, venu de Garden of Blood » | La semaine, défilé de début de semaine | Effectif | oui | oui |
| S2 | Un forfait la veille d'une soirée (et ce qu'on fait ensuite : remonter un combat, short notice, carte réduite) | Leïla : « J'ai une mauvaise nouvelle à vous annoncer, Nom est indisponible pour son combat. » | Écran La semaine, bloc « Carte incomplète » | Effectif | oui | oui |
| S3 | Une blessure ou une suspension après un combat | « Nom, 29 ans, blessé » puis « Commotion — suspendu 60 jours. » ; « Blessé, 8 semaines » | Lendemain (« Ce qui change »), Effectif (statut), fiche (« Son corps »), Mémoire de La semaine | Effectif | oui | oui |
| S4 | Une retraite médicale | « Nom, 38 ans, fin de carrière médicale » | Lendemain, fiche (« Son corps »), Mémoire | Effectif | oui | oui |
| S5 | Une retraite d'âge (sans annonce, sans réplique) | « Cycle 12 · Retraite · Nom » (ligne de Mémoire) | Mémoire de La semaine, fiche (« Son corps »). Le combattant disparaît des classements | Effectif | oui | oui |
| S6 | Un moment de vie (famille, santé, argent, justice, lieux, autour de la cage) | « Nom : perd un parent, la semaine est dure » ; fiche : « Décès d'un parent via Cage Hebdo » | La semaine, défilé, carte qui glisse (cercle et suivis), fiche (« Sa vie »), pastille du Vestiaire | Effectif (à arbitrer) | oui | oui |
| S7 | Le deuil (n°10) | « Nom demande : la carte principale », étiquette de fiche « Un deuil » | La semaine, fiche, Presse (« fait une demande ») | Effectif | oui | oui |
| S8 | La descente aux enfers (n°29) | « Nom demande : une pause », étiquette « La descente » | idem | Effectif | oui | oui |
| S9 | La fratrie (n°23) : deux frères ou sœurs dans le vestiaire | « Sa famille chez Split : Nom » ; sur la carte : « Frère et sœur : les opposer les contrarie » | Fiche (« Ses rivaux »), écran Carte | Effectif | oui | non (c'est un lien, pas un événement) |
| S10 | Un combattant entre dans le top 15 mondial ou en sort | « Nom entre dans le top 15 » / « Nom sort du top 15 » + « Poids moyen · 3ᵉ au classement mondial. » | Lendemain, seulement pour les catégories qui ont combattu ce soir | Classements | oui | non |
| S11 | Places gagnées ou perdues depuis la soirée précédente | une flèche et un nombre, ou « nouveau » | Écran Classements (colonne Évolution) | Classements | oui | non |
| S12 | Un combattant d'une autre organisation voisin d'un des tiens au classement mondial | « Nom, 4ᵉ mondial en Poids moyen, au voisinage de Nom (5ᵉ). » | La semaine (« Le monde autour de Split ») | Classements (à arbitrer) | oui (deux noms) | non |
| S13 | Un invaincu hors de l'organisation | « Poids moyen : 3 combattants chez Split ; Nom, 5-0 hors de Split. » | La semaine | Classements (à arbitrer) | oui | non |
| S14 | Une ceinture qui se joue : elle est gardée, elle change de main, elle revient à quelqu'un après une vacance | « NOM GARDE SA CEINTURE » / « NOM DEVIENT CHAMPION » / « NOM PREND LE TITRE VACANT » | Presse, Résultats (« Garde sa ceinture. »), Ceintures (lignée des champions) | Ceintures | oui | oui |
| S15 | Le blues du champion (n°24) | « Nom demande : une pause », étiquette « Le blues du champion » | La semaine, fiche, Presse | Ceintures | oui | oui |
| S16 | Un combattant attend un combat | « NOM ATTEND DEPUIS 4 MOIS » + « Veut un combat. » ; Contrats : « Attend un combat » | Presse, écran Contrats (colonne Situation) | Contrats | oui | oui |
| S17 | Un combattant sans combat depuis plusieurs cycles | « Nom : dernier combat sous Split il y a 5 cycles. » | La semaine | Contrats | oui | non |
| S18 | Un combattant s'en va après avoir trop attendu | aucune phrase ; il devient « Sans contrat » | Nulle part comme événement ; seulement l'état « Sans contrat » dans Effectif et Contrats | Contrats | oui | oui |
| S19 | Un contrat s'achève | écran Contrats : « Fin de contrat » (un combat restant) puis « Sans contrat » | Contrats (état), Effectif (« Sans contrat ») ; l'événement lui-même n'est lu par aucun écran | Contrats | oui | oui |
| S20 | Une promesse (en cours, tenue, rompue) | « Promesse tenue : Le troisième combat — Nom » | Fiche seule (« Ce qu'il demande ») | Contrats (à arbitrer) | oui | oui |
| S21 | Un changement de camp ou de coach (six moments de vie) | fiche, « Son camp » : « Change de camp » + « Rodage dans le nouveau camp. » | Fiche seule. L'écran Camps ne le montre pas | Camps | oui | oui |
| S22 | Le coéquipier (n°3) : deux combattants du même camp opposés | « Même camp : les opposer les contrarie » (Carte) ; « Les opposer les contrarie » (Camps) | Écran Carte, écran Camps | Camps | oui | non (c'est un lien) |
| S23 | Un défi (un combattant en vise un autre : revanche, troisième combat, un classé) | « NOM DÉFIE NOM » + « Réclame sa revanche. » | Presse, La semaine (« Nom demande : un classé — Nom »), fiche | Presse | oui | oui |
| S24 | Une demande sans adversaire (la carte principale, une pause) | « NOM FAIT UNE DEMANDE » + « Attend ta réponse. » | Presse, La semaine, fiche, bouton « Demande en attente » | Presse | oui | oui |
| S25 | Le public réclame un combat (revanche après une humiliation, troisième combat) | « LE PUBLIC RÉCLAME CE COMBAT » + « Nom contre Nom » | Presse, écran Carte (« Combat réclamé ») | Presse | oui | oui |
| S26 | Le public réclame un combat (appel au micro, chambrage sur les réseaux) | « Combat réclamé : appel au micro après sa victoire » | Écran Carte seulement. Jamais dans Presse | Presse | oui | non |
| S27 | Une citation de média sur le combat principal de la soirée, plus un résultat marquant (dix médias ; inclut la pionnière n°32 et la guerre de l'année n°20) | Cage Hebdo : « {a} a battu {b} à Split 12, au round 2. Il monte dans sa division. » | Presse, lendemain (« Ce qu'en dit la presse »), La semaine | Presse | oui | oui |
| S28 | Une citation de média sur l'affiche de la prochaine soirée (inclut les rencontres de voix) | « {a} et {b} sont en tête d'affiche de Split 12, en Poids moyen. Qui va gagner ? » | La semaine, défilé | Presse | oui | non |
| S29 | Une citation de média sur un combattant remis sur la carte vite après un KO | La Pesée : « {a} remonte dans la cage cinq semaines après son KO. Qui l'a décidé ? On ne sait pas. » | La semaine | Presse | oui | non |
| S30 | Le résultat du combat principal en titre de presse | « NOM BAT NOM » | Presse | Presse | oui | oui |
| S31 | Une parole du combattant (après son combat, à l'affiche, quand il attend) | « Nom : « Merci à Dieu, à mon équipe et à Split. … Maintenant, je veux un classé. » » | La semaine (« Ce qui se dit »), défilé, fiche (« Ce qu'on dit de lui ») | Presse | oui | non |
| S32 | Une publication sur les réseaux la veille d'une soirée | « Nom (réseaux) : … » | La semaine, défilé | Presse | oui | non |
| S33 | Les deux combattants répondent quand le joueur propose leur combat | « Nom « … » » sous la carte | Écran Carte, pendant le cycle seulement | Presse (à arbitrer) | oui | non |
| S34 | La voix du combattant change | « Il ne parle plus comme avant. » | Fiche (« Ce qu'on dit de lui ») | Presse (à arbitrer) | oui | non |
| S35 | Un combat joué (le résultat lui-même) | « Nom bat Nom » | Résultats, lendemain, fiche (« Ses derniers combats »), Classements (colonne Dernier combat) | Résultats | oui | oui |
| S36 | Une revanche due (défaite humiliante en carte principale) | « Nom et Nom : revanche due » | La semaine, défilé, fiche (« Ses rivaux »), Presse (comme un défi) | Résultats | oui | oui |
| S37 | Le troisième combat (une victoire chacun) | « Nom et Nom : le troisième combat » | idem | Résultats | oui | oui |
| S38 | Un tueur de hype : il bat un invaincu d'au moins 5 victoires | « Nom bat Nom, invaincu jusque-là » | La semaine, défilé | Résultats | oui | oui |
| S39 | Le train de la hype (n°5) : 12 victoires de suite | « Nom demande : un classé », étiquette « Le train de la hype » | La semaine, fiche, Presse | Résultats | oui | oui |
| S40 | La dernière danse (n°4) : vétéran, 4 défaites de suite | « Nom demande : la carte principale », étiquette « La dernière danse » | La semaine, fiche, Presse | Résultats | oui | oui |

Ce qui n'est pas dans ce tableau, volontairement : les nouvelles qui portent sur une catégorie ou sur la salle et non sur un nom (« Poids moyen : 1 combattant disponible pour la carte principale », la satisfaction du public, l'argent), les moments qui se jouent pendant un combat, et les décisions du joueur (booker, refuser, libérer, renouveler un contrat, mettre au cercle). Elles sont listées en annexe A1.

Pour mémoire, **deux familles d'événements du catalogue sont produites mais jamais lues** : les faits « fin de contrat », « départ après attente », « libéré » et « contrat signé ou renouvelé » sont écrits dans la partie et aucun écran ne les lit (S18 et S19 n'ont donc d'événement que dans la mémoire). Et **34 des 109 moments de vie du catalogue sont prévus mais jamais déclenchés** (voir la partie 6).

---

## 3. Ce que le tableau du brief demande et qui n'existe pas

Pour chaque événement du tableau du brief : « existe déjà » renvoie à la partie 2 ; « en partie » dit ce qui manque ; « n'existe pas » est ce qu'il est. Seuls les événements à produire sont numérotés et attendent ton accord.

Coût : **petit** = la donnée existe, il suffit de la lire et de la dater ; **moyen** = il faut une règle de déclenchement neuve ou un fait neuf en plus de la donnée ; **gros** = il manque un mécanisme du jeu.

### Effectif

| Événement du brief | État |
| --- | --- |
| Une arrivée | **Existe déjà** (S1). Rien à produire, seulement à rattacher. |
| Un départ | **Existe en partie.** Sont produits : la retraite d'âge (S5), la retraite médicale (S4), le départ après trop d'attente (S18), la fin de contrat (S19). Rien de neuf à produire pour eux : ils ne sont pas dits comme des départs. Ce qui n'existe pas, le départ vers une organisation rivale, est traité avec N9. |
| Une retraite annoncée | **N'existe pas** (N1). |
| Un changement de catégorie | **N'existe pas** (N2). |

**N1. Un combattant annonce qu'il va prendre sa retraite, quelques semaines avant qu'elle arrive.** — Ce que le jeu sait déjà pour le produire : l'âge de retraite de chaque combattant est calculé d'avance (de 39 à 42 ans selon l'état de son corps) ; le catalogue contient un moment « il annonce sa retraite » avec son texte et ses médias, jamais déclenché. Aujourd'hui la retraite d'âge tombe sans aucune annonce. — coût : moyen.
Accord d'Anthony : [ ] oui  [ ] non

**N2. Un combattant change de catégorie de poids.** — Ce que le jeu sait déjà pour le produire : les deux moments « monte d'une catégorie » et « descend d'une catégorie » existent au catalogue, jamais déclenchés ; les scénarios 12 (la descente de catégorie) et 13 (la montée) sont prévus. Mais la catégorie d'un combattant ne change jamais dans le jeu : elle est fixée à sa création. — coût : gros.
Accord d'Anthony : [ ] oui  [ ] non

### Classements

| Événement du brief | État |
| --- | --- |
| Une entrée ou une sortie du top | **Existe en partie** (S10) : dite au lendemain, pour le top 15 mondial seulement et seulement dans les catégories qui ont combattu. Il manque le combat qui l'explique (N3). |
| Un dépassement, avec le combat qui l'explique | **N'existe pas** (N4). Les flèches de places gagnées ou perdues (S11) ne disent ni qui est dépassé ni pourquoi. |

**N3. Entrée ou sortie du top, avec le combat qui l'explique.** — Ce que le jeu sait déjà pour le produire : le classement du cycle précédent et celui d'aujourd'hui (c'est ce qui sert déjà à dire « entre dans le top 15 »), et la trace de chaque combat joué, jamais effacée. — coût : petit.
Accord d'Anthony : [ ] oui  [ ] non

**N4. Un dépassement : « X passe devant Y » après tel combat.** — Ce que le jeu sait déjà pour le produire : le nombre de places gagnées ou perdues de chaque combattant depuis la soirée précédente, et la trace des combats. Il faudra choisir à partir de combien de places on en parle, sinon chaque soirée en produit des dizaines. — coût : moyen.
Accord d'Anthony : [ ] oui  [ ] non

### Ceintures

| Événement du brief | État |
| --- | --- |
| Un challenger qui se déclare | **N'existe pas** (N5). Le prétendant numéro un se lit sur l'écran Ceintures mais ne « se déclare » jamais ; le défi existant (S23) vise « un classé », pas la ceinture. |
| Un titre vacant | **Existe en partie.** L'état se lit (« TITRE VACANT » sur l'écran Ceintures) et le combat qui le remplit est dit (S14). Il manque l'annonce de la vacance elle-même (N6). |
| Un règne qui passe un cap | **N'existe pas** (N7). |

**N5. Un challenger se déclare pour la ceinture.** — Ce que le jeu sait déjà pour le produire : le prétendant numéro un de chaque catégorie, le champion et sa durée de règne ; les défis existants (un combattant qui en vise un autre, avec une réplique de sa voix). — coût : moyen.
Accord d'Anthony : [ ] oui  [ ] non

**N6. Un titre devient vacant (le champion prend sa retraite, ou part).** — Ce que le jeu sait déjà pour le produire : la ceinture est recalculée à partir des combats de titre et des retraites ; elle devient vide dès que son porteur se retire. L'événement de la vacance n'est écrit nulle part. — coût : petit.
Accord d'Anthony : [ ] oui  [ ] non

**N7. Un règne passe un cap (par exemple N défenses, ou N mois sur le trône).** — Ce que le jeu sait déjà pour le produire : le nombre de défenses et la durée de chaque règne, déjà affichés sur l'écran Ceintures. Les seuils du « cap » sont à choisir par toi. — coût : petit.
Accord d'Anthony : [ ] oui  [ ] non

### Contrats

| Événement du brief | État |
| --- | --- |
| Un dernier combat de contrat | **Existe en partie.** L'écran Contrats écrit « Fin de contrat » en face d'un combattant qui n'a plus qu'un combat à faire, mais aucun événement n'est produit (N8). |
| Une organisation rivale qui approche un combattant | **N'existe pas** (N9). |

**N8. Un combattant entame le dernier combat de son contrat.** — Ce que le jeu sait déjà pour le produire : le nombre de combats signés et faits de chaque contrat (déjà lu pour écrire « Fin de contrat » dans Contrats) et le fait « fin de contrat » écrit quand le contrat s'achève. — coût : petit.
Accord d'Anthony : [ ] oui  [ ] non

**N9. Une organisation rivale approche un combattant (et, à la suite, il peut partir).** — Ce que le jeu sait déjà pour le produire : les quatre organisations extérieures (Garden of Blood, MMA Korner, Ultimate Rim, Fighting Pacific Championship) ; la façon dont un combattant « trop grand pour l'organisation » refuse un renouvellement selon son intérêt (argent, titre, ambition) ; deux moments de vie du catalogue (« offre d'une autre organisation », « clash avec une autre organisation ») jamais déclenchés ; le scénario 14 (le transfuge). Il n'existe aucun mécanisme pour qu'un combattant quitte l'organisation du joueur pour une autre. — coût : gros.
Accord d'Anthony : [ ] oui  [ ] non

### Camps

| Événement du brief | État |
| --- | --- |
| Un changement de salle ou de coach | **Existe déjà** (S21). Il naît comme moment de vie et se lit dans la fiche. Rien à produire, seulement à le rattacher à Camps. |
| Deux combattants qui préparent le même combat | **N'existe pas** (N10). Le jeu ne regarde que le cas où deux coéquipiers sont opposés (S22). |

**N10. Deux combattants du même camp sont sur la même soirée (sans se combattre).** — Ce que le jeu sait déjà pour le produire : le camp de chaque combattant, la carte de la soirée, et l'outil qui dit si deux combattants sont du même camp. Le brief est court sur ce cas ; je l'ai lu ainsi : deux coéquipiers à l'affiche de la même soirée. À confirmer. — coût : petit.
Accord d'Anthony : [ ] oui  [ ] non

### Presse

Ce qui existe déjà, sans rien à ajouter : S23 à S34 (défis, demandes, réclames, citations, résultat du combat principal, paroles, réseaux).

### Résultats

| Événement du brief | État |
| --- | --- |
| Un ancien combat qui redevient d'actualité | **Existe en partie.** Une défaite humiliante ou une victoire partout ramène un combat d'actualité, mais seulement pendant 12 cycles (S36, S37). Au-delà, rien. N11 couvre ce qui manque. |
| Une revanche possible | **Existe déjà** (S36). Elle naît dans Presse et La semaine, jamais dans Résultats : rien à produire, seulement à rattacher. |

**N11. Un ancien combat, vieux de plus de 12 cycles, redevient d'actualité.** — Ce que le jeu sait déjà pour le produire : la trace complète de tous les combats joués, qui n'est jamais effacée (« un combat de la première soirée se revoit à l'identique après quarante soirées »), et la liste des affrontements par paire de combattants. Il faut décider ce qui le « réveille » : une nouvelle rencontre au classement, un titre, un retour de blessure. — coût : moyen.
Accord d'Anthony : [ ] oui  [ ] non

---

## 4. Les scénarios à suite

### Ce que le brief dit, et ce que le code contient

Le brief dit : « Quatre scénarios à suite sont codés : la hype, la dernière danse, le deuil, la descente ». C'est exact pour ce qu'on appelle un « scénario à suite » au sens strict (un déclencheur, une demande imposée, une promesse à tenir dans un délai). Mais le code contient plus : cinq scénarios de ce type dans `mgmt-scenarios.js` (les quatre plus le blues du champion), et sept autres numéros du catalogue sont codés sous une autre forme. **Au total 12 numéros du catalogue sur 32 sont codés** ; le brief en cite quatre. Le catalogue les numérote de 1 à 32 ; le brief dit « au moins jusqu'à 29 », ce qui est juste.

### Les quatre scénarios du brief

La suite commune à tous, dans le code : le combattant formule une **demande** ; le joueur **promet** ou **refuse** ; si le joueur promet, il a **3 cycles** pour tenir sa promesse ; une promesse tenue renforce la loyauté du combattant, une promesse rompue ou un refus la rongent et chargent sa vie (jamais affiché en chiffre).

1. **La hype (n°5).** Raconte : un combattant de Split enchaîne douze victoires et veut se tester. Étapes : (1) sa série de victoires atteint exactement 12 ; (2) il demande « un classé » (un des cinq premiers de sa catégorie) ; (3) le joueur promet (le combat doit avoir lieu en 3 cycles) ou refuse (le protéger, c'est refuser) ; (4) tenue ou rompue.
2. **La dernière danse (n°4).** Raconte : un vétéran qui vient d'enchaîner les défaites veut son dernier grand soir. Étapes : (1) 36 ans ou plus, 15 victoires de carrière au moins, exactement 4 défaites de suite ; (2) il demande la carte principale ; (3) promettre ou refuser ; (4) tenue si un combat de la carte principale se joue avant l'échéance.
3. **Le deuil (n°10).** Raconte : un proche ou son coach est mort, il veut combattre pour lui. Étapes : (1) un moment de vie « décès d'un parent », « décès d'un frère ou d'une sœur » ou « son coach meurt » au dernier ou avant-dernier cycle, puis une chance sur deux ; (2) il demande la carte principale ; (3) promettre, ou refuser (reporter, c'est refuser) ; (4) tenue ou rompue.
4. **La descente (n°29).** Raconte : un combattant à bout de forces enchaîne les défaites. Étapes : (1) deux défaites de suite et une charge de vie au-delà de 300 ; (2) il demande « une pause » ; (3) promettre (la promesse se tient en **ne** le bookant **pas** ; elle est rompue s'il combat) ou refuser ; (4) jamais redemandée dans les 6 cycles qui suivent une pause promise. Le document `docs/LOT-5-UN-MONDE-HUMAIN.md` note que la descente n'a jamais eu lieu dans la mesure de 52 cycles.

### Codés mais que le brief ne cite pas

5. **Le blues du champion (n°24)**, même mécanique : un champion qui vient de prendre la ceinture, une fois sur deux, demande « une pause ».
6. **La fratrie (n°23)**, sans suite : 10 % des paires de même nom de famille et de même pays sont de la même famille ; les opposer pèse 30 de charge sur chacun ; la fiche écrit « Sa famille chez Split : Nom ».
7. **La rivalité (n°1)**, avec suite : une défaite humiliante hors préliminaires (KO ou soumission au premier round, subie par celui des deux qui avait le meilleur bilan) crée une revanche due pendant 12 cycles ; le perdant la demande à coup sûr.
8. **La trilogie (n°2)**, avec suite : une victoire chacun, le perdant du dernier combat réclame le troisième ; elle se clôt au troisième.
9. **Le tueur de hype (n°6)** : un combattant bat un invaincu de 5 victoires ou plus. Dans le code il se lit seulement (une ligne dans La semaine), il ne déclenche aucune demande.
10. **Le coéquipier (n°3)** : opposer deux combattants du même camp pèse 15 de charge sur chacun. « L'un quitte le camp » n'est pas codé.
11. **La guerre de l'année (n°20)** et 12. **La pionnière en tête d'affiche (n°32)** : lignes de presse sans décision du joueur.

Deux numéros sont codés en partie : le **n°30 (le hanté)** pour sa seule moitié « sa voix change après un KO très lourd » (pas le choix « un combat de reprise ou l'arrêt »), et le **n°8 (le remplaçant)** que la carte incomplète (forfait, short notice) couvre pour l'essentiel sans porter son nom.

### Ceux que le catalogue prévoit et qui ne sont pas codés (20)

La colonne « Besoin » reprend ce que `docs/LOT-5-UN-MONDE-HUMAIN.md` dit lui-même ; « non évalué » veut dire que je n'ai rien vérifié.

| N° | Nom | En une phrase | Besoin | Accord d'Anthony |
| --- | --- | --- | --- | --- |
| 7 | La pesée ratée | Coupe de poids trop dure : le coach s'énerve, l'adversaire accepte ou refuse. Le joueur maintient, remplace ou annule. | une décision (selon le document) | [ ] oui  [ ] non |
| 8 | Le remplaçant | Retrait tardif : un remplaçant dit oui. **Couvert pour l'essentiel** par la carte incomplète ; reste le rôle « Remplaçant de luxe », non attribué. | en partie codé | [ ] oui  [ ] non |
| 9 | La fuite | Un combat non officialisé fuite dans la presse ; le joueur confirme ou change. | non évalué | [ ] oui  [ ] non |
| 11 | Le jeûne | La soirée tombe pendant le mois de jeûne d'un combattant ; respecter ou imposer. | non évalué | [ ] oui  [ ] non |
| 12 | La descente de catégorie | Un combattant veut descendre d'une catégorie ; coupe dangereuse. | un système absent : le changement de catégorie (N2) | [ ] oui  [ ] non |
| 13 | La montée | Après une série de défaites, un nouveau départ dans une autre catégorie. | le changement de catégorie (N2) | [ ] oui  [ ] non |
| 14 | Le transfuge | Une organisation plus riche l'approche ; retenir ou laisser partir. | un système absent : le départ vers une autre organisation (N9) | [ ] oui  [ ] non |
| 15 | Le retour de retraite | Un retraité de moins de 40 ans veut revenir ; le reprendre ou non. | non évalué | [ ] oui  [ ] non |
| 16 | La garde à vue | Un moment de vie grave ; le joueur suspend ou soutient. | non évalué | [ ] oui  [ ] non |
| 17 | Le coach qui part | Dispute publique avec son coach ; l'orienter vers un autre camp. | non évalué | [ ] oui  [ ] non |
| 18 | La promesse | On lui a promis un combat de titre, le champion se blesse ; tenir, rompre ou contourner. | non évalué (le mécanisme général des promesses existe) | [ ] oui  [ ] non |
| 19 | Le vol | Décision partagée contestée ; revanche immédiate ou non. | le moteur ne publie pas le détail des décisions partagées (selon le document) | [ ] oui  [ ] non |
| 21 | Le prodige | Un Timide de 19 ans très doué grandit ; le protéger ou l'exposer. | non évalué | [ ] oui  [ ] non |
| 22 | La pépite de l'étranger | Un invaincu dans une petite organisation que la presse de son pays célèbre ; le recruter. | non évalué (le recrutement existe) | [ ] oui  [ ] non |
| 25 | La mère qui revient | Retour après grossesse, calendrier contraint. | un système absent (selon le document) | [ ] oui  [ ] non |
| 26 | Le visa | Combattant étranger, problème de visa, carte incomplète. | un système absent (selon le document) | [ ] oui  [ ] non |
| 27 | La soirée à domicile | Un combattant demande à combattre dans sa ville. | un système absent (selon le document) | [ ] oui  [ ] non |
| 28 | Le vendeur | Un Méchant de catch fait la promo d'un autre combat ; lui donner un micro. | non évalué | [ ] oui  [ ] non |
| 30 | Le hanté | Après un KO très lourd, sa voix change ; un combat de reprise ou l'arrêt. **La moitié « la voix change » est codée.** | en partie codé | [ ] oui  [ ] non |
| 31 | Le double emploi qui choisit | La bourse suffit enfin, il quitte son métier ; s'il perd ensuite, il doute. | non évalué | [ ] oui  [ ] non |

---

## 5. Annexe pour les développeurs

### A1. Les faits gardés dans la partie (`m.facts`)

Format commun : `{c, k, a, ...}` où `c` est le cycle (`m.cycle`) et `k` le genre. Aucune limite de longueur (`validateMgmt` n'en impose pas). Un fait a presque toujours `a` (identifiant du combattant) ; les exceptions sont signalées. Les faits d'un genre non vérifié par `validateMgmt` (mgmt-save.js:287-326) passent sans contrôle.

| Genre de fait | Écrit par (`fichier:ligne`, fonction) | Champs | Lu par un écran ? |
| --- | --- | --- | --- |
| `moment_vie` | mgmt-vie.js:181 (`mgmtVieOuvreCycle`) | `c,a,m` (m = identifiant du moment) | oui (voir S6, S21) |
| `demande` | mgmt-promesses.js:182 (imposée) et :199-202 (naturelle) (`mgmtDemandesOuvreCycle`) | `c,a,want,target?` | oui |
| `promesse` | mgmt-promesses.js:212 (`mgmtRepondreDemande`) | `c,a,want,target?,due,d` | oui (fiche) |
| `refus` | mgmt-promesses.js:215 | `c,a,d` | non (compte seulement dans la loyauté et la charge) |
| `contrarie` | mgmt-promesses.js:246, 253, 260, 263 (`mgmtContrariesApresSoiree`) | `c,a,p,why` (why : coequipier, fratrie, titre, jeune) | non |
| `attend` | mgmt-contrats.js:154 (`mgmtContratsOuvreCycle`) | `c,a,p` (p vaut 1 ou 2 seulement) | oui, via le fil |
| `depart_attente` | mgmt-contrats.js:151 | `c,a` | **non** |
| `fin_contrat` | mgmt-contrats.js:141 (`mgmtContratsApresSoiree`) | `c,a` | **non** |
| `libere` | mgmt-contrats.js:132 (`mgmtContratLiberer`) | `c,a` | **non** (décision du joueur) |
| `contrat` | mgmt-contrats.js:181, 198 | `c,a` | **non** (décision du joueur) |
| `recrue` | mgmt-recrutement.js:71 (`mgmtRecruter`) | `c,a` | oui |
| `retrait` | mgmt-retraits.js:59 (`mgmtRetraitsAvantSoiree`) | `c,a,adv,slot` | oui (bureau) |
| `retrait_sortie` | mgmt-retraits.js:131, 162, 172 | `c,s` (**pas de `a`**) | non |
| `offre` | mgmt-retraits.js:154 | `c,a` | non |
| `engage` | mgmt-retraits.js:161 | `c,a,src` | non |
| `reduite` | mgmt-retraits.js:171 | `c` (**pas de `a`**) | oui (lendemain, patron) |
| `injury` / `susp` | mgmt-corps.js:566 (`mgmtApplyFight`) | `c,a` (le nom de la blessure et le nombre de jours **ne sont pas** dans le fait) | oui |
| `retired` | mgmt-corps.js:311 (âge, `mgmtRetireRoster`) et :563 (médicale) | `c,a` ; certains anciens formats ont `a` en objet `{id}` (voir mgmt-suivi.js:176, mgmt-ceintures.js:59) | oui |
| `title_fight` | mgmt-corps.js:640 | `c,div,fight` (**pas de `a`** : il pointe `m.hist[fight]`) | oui |
| `title_initial` | mgmt-ceintures.js:19 | `c,div,a` | non |
| `booked`, `refused`, `ignored`, `reaction_seen`, `crushed` | mgmt-bureau.js:545, 548, 558, 577, 583, 614 | `c,a,b` | oui (Mémoire de La semaine) |
| `swapped` | mgmt-carte.js:269 | `c,a,b,na,nb` | oui (Mémoire) |

Autres sources de données qui ne sont pas des faits :
- `m.hist` : la trace de chaque combat, jamais élaguée, `{c,slot,seed,rounds,a,b,winner,family,round}` avec `a.id`, `b.id` (mgmt-corps.js:638).
- `m.lastEvent` : la dernière soirée seulement, avec `touched[] = {id,retired,injury,days}` (mgmt-corps.js:668). Écrasé à chaque soirée.
- `m.fil` : le fil de nouvelles de la presse, **limité à 200 nouvelles, les plus anciennes tombent** (mgmt-suivi.js:19, :255-263). Chaque nouvelle : `{k,c,a,b?,f?,j?,w?,t?,x?,p?,n?}`, `j` étant le jour du calendrier (seulement avec l'agenda). Les genres : `defi`, `presse`, `public`, `combattant`.
- `m.cercle` et `m.suivis` : listes d'identifiants, sans date (mgmt-attention.js:68-103).
- `m.exterieur` : les combattants du monde extérieur, identité seulement ; leur carrière, leurs moments de vie, leur retraite sont dérivés de `(id, cycle)`, jamais stockés (mgmt-monde.js:162, :260 ; mgmt-vie.js:105-123).

### A2. Relevé sorte par sorte

Légende de la colonne Conteur : **oui** = passe par `mgmtConteur` (mgmt-attention.js:178, `mgmtConteurCandidats` :141, budget `mgmtConteurBudget` :168 : 5 informations, 3 après une semaine dont les informations pèsent 120 ou plus) ; **budget** = compté dans le même plafond sur l'écran La semaine (`mgmtSemaineMonde`, mgmt-ecran-semaine.js:50) mais ne passe pas par `mgmtConteur` ; **non** = hors de ce plafond. Les colonnes Semaine et Identifiant disent si l'objet **gardé** porte le cycle `c` et l'identifiant du combattant `a`.

| N° | Producteur (`fichier:ligne`, fonction) | Champ de stockage | Conteur | Porte une semaine | Porte un identifiant |
| --- | --- | --- | --- | --- | --- |
| S1 | mgmt-recrutement.js:71 `mgmtRecruter` (appelée aussi par mgmt-contrats.js:196 et mgmt-retraits.js:158) ; lecture :76, :90 | `m.facts` `recrue` | budget (ecran-semaine.js:65) | oui | oui |
| S2 | mgmt-retraits.js:58-59 `mgmtRetraitsAvantSoiree` ; sorties :131, :154, :161-162, :171-172 | `m.facts` `retrait`, `retrait_sortie`, `offre`, `engage`, `reduite` ; texte à l'écran dans `MGMT_RETRAIT_UI` (état d'écran, **nom écrit, pas d'identifiant**, jamais sauvegardé) | non | oui | `retrait`, `offre`, `engage` oui ; `retrait_sortie`, `reduite` non |
| S3 | mgmt-corps.js:566 dans `mgmtApplyFight` (:514) | `m.facts` `injury`/`susp` ; détail dans `m.lastEvent.touched` | non | oui | oui |
| S4 | mgmt-corps.js:563 | `m.facts` `retired` ; `ligne.retired='medical'` | non | oui | oui |
| S5 | mgmt-corps.js:311 `mgmtRetireRoster` (:303) | `m.facts` `retired` ; `ligne.retired='age'`. **Le fait ne distingue pas âge et médical** : c'est la ligne du roster qui le dit | non | oui | oui (ancien format : objet) |
| S6 | mgmt-vie.js:181 `mgmtVieOuvreCycle` (:170) ; tirage `mgmtVieMomentAt` (:90) | `m.facts` `moment_vie` ; combattants extérieurs : dérivé, rien de stocké | **oui** (mgmt-attention.js:150-162) | oui | oui |
| S7 | déclencheur dérivé mgmt-scenarios.js:76-80 (`mgmtScenarios` :55) ; fait mgmt-promesses.js:182 | `m.facts` `demande` (want `carte-principale`) ; le scénario lui-même n'est pas stocké | budget (demande) | oui (la demande) | oui |
| S8 | mgmt-scenarios.js:81-84 | `m.facts` `demande` (want `pause`) | budget | oui (la demande) | oui |
| S9 | mgmt-scenarios.js:100 `mgmtFratrie` ; conséquence mgmt-promesses.js:253 | lien dérivé de l'identité ; `m.facts` `contrarie` why `fratrie` quand ils sont opposés | non | le lien non ; la conséquence oui | oui |
| S10 | mgmt-ecran-lendemain.js:159 `mgmtLendemainConstatsHtml` ; ancien écran mgmt-ecran-classements.js:150 `mgmtClassementsStepsHtml` | rien (calculé à l'affichage, comparé au classement du cycle précédent) | non | non | oui |
| S11 | mgmt-suivi.js:141 `mgmtClassementLignes` (delta) | rien | non | non | oui |
| S12 | mgmt-ecran-semaine.js:109-126 | rien | budget (`add()`) | non | oui (deux) |
| S13 | mgmt-ecran-semaine.js:127-142 | rien | budget | non | oui |
| S14 | mgmt-corps.js:640 ; fil mgmt-suivi.js:296-304 ; lecture mgmt-ceintures.js:52 `mgmtTitleMemoryRows`, mgmt-suivi.js:86 `mgmtTitreIssue` | `m.facts` `title_fight` (**sans `a`**) ; `m.fil` `{k:'presse',w:'garde'|'prend'|'vacant',a,b,f}` | non | oui | fait : **non** (via `m.hist[fight]`) ; fil : oui |
| S15 | mgmt-scenarios.js:86-93 (champion dont `since` ≥ cycle−1) | `m.facts` `demande` (want `pause`) | budget | oui (la demande) | oui |
| S16 | mgmt-contrats.js:154 ; fil mgmt-suivi.js:332-337 | `m.facts` `attend` ; `m.fil` `{k:'combattant',w:'attend',p,n}` | non | oui | oui |
| S17 | mgmt-ecran-semaine.js:143-148 | rien (calculé sur `ligne.lastCycle`) | budget | non | oui |
| S18 | mgmt-contrats.js:151 `mgmtContratsOuvreCycle` (:147) | `m.facts` `depart_attente` ; `ligne.libre=true` | non | oui | oui |
| S19 | mgmt-contrats.js:141 `mgmtContratsApresSoiree` (:137) | `m.facts` `fin_contrat` ; `ligne.libre=true` ; contrat restant : `ligne.ct={n,f,b,since}` | non | oui | oui |
| S20 | mgmt-promesses.js:212 `mgmtRepondreDemande` (:208) ; état dérivé `mgmtPromesses` (:108) | `m.facts` `promesse` `{due}` ; tenue/rompue dérivée de `m.hist` | non | oui (`c` et `due`) | oui |
| S21 | mgmt-vie.js:181 (les 6 moments : change-de-camp, dispute-coach-publique, demenage-autre-ville, etranger-camp, coach-meurt, coach-retraite, liste mgmt-camps-data.js:17) ; lecture mgmt-camps.js:77 `mgmtCampChangements`, fiche :140 | `m.facts` `moment_vie` | oui (s'ils ont des médias, tous en ont un) | oui | oui |
| S22 | mgmt-promesses.js:246 ; lien mgmt-camps.js:132 `mgmtMemeCamp` ; constante mgmt-camps-data.js:43 | `m.facts` `contrarie` why `coequipier` quand ils sont opposés | non | la conséquence oui, le lien non | oui |
| S23 | mgmt-promesses.js:182 / :199 ; fil mgmt-suivi.js:290 `mgmtFilMettreAJour` (:284) | `m.facts` `demande` avec `target` **et** `m.fil` `{k:'defi',a,b,w,t}` | budget (La semaine, jusqu'à 2 demandes, mgmt-ecran-semaine.js:57-63) | oui (`c`, et `j` avec l'agenda) | oui (`a`,`b`) |
| S24 | idem ; fil mgmt-suivi.js:291 | `m.facts` `demande` sans `target` **et** `m.fil` `{k:'combattant',w:'demande'}` | budget | oui | oui |
| S25 | source dérivée mgmt-rivalites.js:48 `mgmtRivalites` ; fil mgmt-suivi.js:323-331 | `m.fil` `{k:'public',w:'rivalite'|'trilogie',a,b,p}` | non | oui | oui |
| S26 | mgmt-rivalites.js:90 `mgmtReclamesRaisons` (micro, réseaux) ; lecture mgmt-salles.js:108 `mgmtPublicReclame`, mgmt-carte-cadre.js:54, :170 | rien. **Jamais envoyé au fil** : `mgmtFilMettreAJour` ne lit que `mgmtRivalites` | non | non | oui |
| S27 | mgmt-medias.js:171 `mgmtMediasLendemain` ; fil mgmt-suivi.js:314-321 | `m.fil` `{k:'presse',w:'media',a,b,f,x,t}` (le texte est stocké) | non | oui | oui (`a` = le vainqueur) |
| S28 | mgmt-medias.js:130 `mgmtMediasAffiche` | rien | budget (ecran-semaine.js:80) | non | oui |
| S29 | mgmt-medias.js:193 `mgmtMediasRebook` | rien | budget | non | oui |
| S30 | mgmt-suivi.js:305-312 | `m.fil` `{k:'presse',w:'resultat',a,b,f}` | non | oui | oui |
| S31 | mgmt-voix.js:206 `mgmtParoleRecente`, :237 `mgmtParolesDeLaSemaine` | rien | budget (ecran-semaine.js:75) | non | oui |
| S32 | mgmt-voix.js:258-270 (même fonction) | rien | budget | non | oui |
| S33 | mgmt-voix.js:287 `mgmtReponsesProposition`, :303 | `MGMT_PROPOSITION` (état d'écran, jamais sauvegardé, lignes `{id,name,texte}`) | non | seul le cycle courant (`c`) | oui |
| S34 | mgmt-voix.js:86 `mgmtVoixChangement` | rien (dérivé de `m.hist`) | non | non | oui |
| S35 | mgmt-corps.js:638 | `m.hist` | non | oui | oui (`a.id`,`b.id`) |
| S36 | mgmt-rivalites.js:48-65 `mgmtRivalites` ; lignes :150 ; demande imposée :168 | rien (dérivé de `m.hist`) ; la demande « revanche » est un fait `demande` | budget (ecran-semaine.js:70) | oui (cycle du dernier combat, dérivé) | oui |
| S37 | idem | idem (want `trilogie`) | budget | oui (dérivé) | oui |
| S38 | mgmt-rivalites.js:137 `mgmtTueursDeHype` ; ligne :159 | rien | budget | oui (cycle du combat, dérivé) | oui |
| S39 | mgmt-scenarios.js:64-71 | `m.facts` `demande` (want `un-classe`) ; seuil `MGMT_HYPE_SERIE=12` | budget | oui (la demande) | oui |
| S40 | mgmt-scenarios.js:72-75 | `m.facts` `demande` (want `carte-principale`) | budget | oui (la demande) | oui |

Autres écrans qui lisent ces sortes en dehors du conteur : le défilé de début de semaine `mgmtFilLignes` (mgmt-mouvement.js:29-43) reprend **tous** les candidats du conteur sans le plafond de 3 à 5, dans la limite de 8 lignes ; la carte qui glisse `mgmtPopupsDeLaSemaine` (mgmt-mouvement.js:47) prend 2 moments du cercle ou des suivis ; la pastille du Vestiaire `mgmtVestiaireSigne` (mgmt-ecran-vestiaire.js:18) allume un signe pour une demande en attente ou un moment relayé d'au moins 30 de poids (tout moment relayé pour le cercle et les suivis) datant du cycle courant ou précédent.

Les moments de vie, en détail : 109 au total dans `MGMT_MOMENTS` (mgmt-humanite-data.js:248), 7 familles (Famille 20, Santé et corps 20, Argent et travail 14, Justice et incidents 8, Carrière et camp 20, Lieux et vie 14, Autour de la cage 13). 75 sont tirables au hasard (`mgmtVieEligibles`, mgmt-vie.js:82), 71 d'entre eux ont à la fois un texte et au moins un média, donc sont lisibles ; 4 restent privés. Les 34 autres sont « contextuels » (`MGMT_VIE_CONTEXTUELS`, mgmt-vie.js:39) : ils existent, avec texte et médias, et **aucun code ne les déclenche**.

### A3. Les décisions du joueur (écrites dans les faits, pas des événements du monde)

`booked`, `refused`, `ignored`, `reaction_seen`, `crushed` (mgmt-bureau.js), `swapped` (mgmt-carte.js:269), `promesse` / `refus` (mgmt-promesses.js:212, 215), `libere` / `contrat` (mgmt-contrats.js:132, 181, 198), `engage` / `offre` / `retrait_sortie` / `reduite` (mgmt-retraits.js), et les listes `cercle` / `suivis`. Elles restent dans la Mémoire de La semaine (`MGMT_WEEK_MEMORY_GROUPS`, mgmt-ecran-semaine.js:189) et ne demandent pas de marque.

### A4. Ce qu'est une « semaine » dans le code

- Le compteur est `m.cycle`. Il avance dans `mgmtNewPile` (mgmt-bureau.js:383), appelée : au départ d'une partie (mgmt-screens.js:369), par le bouton Continuer de La semaine (`mgmtNextCycle`, mgmt-screens.js:577-593), et après le lendemain d'une soirée (mgmt-screens.js:634 et mgmt-lendemain-cadre.js:83).
- Avec le calendrier du joueur, le temps se laisse passer par pas de 30 jours au plus (`mgmtAgendaPasser`, mgmt-agenda.js:151) **sans ouvrir de cycle**. Un cycle s'ouvre donc après chaque soirée jouée ; le bouton Continuer de La semaine en ouvre aussi un (je n'ai pas vérifié s'il reste accessible avec le calendrier). Tant qu'aucun cycle ne s'ouvre, des jours passent sans qu'aucun moment de vie, demande ou nouvelle ne soit produit.
- La date en jours (`m.cal.jour`) n'est copiée que dans le fil (`j`, mgmt-suivi.js:259). Les faits ne portent que `c`.
- `MGMT_EVENT_WEEKS=5` (mgmt-data.js:173) sert au vieillissement et au calendrier, pas à dater les faits.

### A5. Les sources de données de chaque événement manquant (partie 3)

| Événement | Données déjà dans la partie |
| --- | --- |
| N1 retraite annoncée | `mgmtRetireAge(f,cycle)` mgmt-corps.js:287 ; moment `annonce-retraite` (contextuel) |
| N2 changement de catégorie | aucune : `ligne.div` ne change jamais (aucune affectation dans mgmt-*.js) ; moments `monte-categorie`, `descend-categorie` (contextuels) |
| N3 entrée/sortie du top + combat | `mgmtDivisionRanking(m,div,portee,cycle)` ; `m.hist` ; code déjà dans mgmt-ecran-lendemain.js:159 |
| N4 dépassement | `mgmtClassementLignes(...).delta` mgmt-suivi.js:141 ; `m.hist` |
| N5 challenger | `mgmtPretendant` mgmt-suivi.js:193 ; `mgmtSplitTitle` mgmt-ceintures.js:26 ; `mgmtCeintureLignee` mgmt-suivi.js:166 |
| N6 titre vacant | `mgmtSplitTitle(...).id===null` ; faits `retired` |
| N7 règne qui passe un cap | `mgmtSplitTitle(...).defenses` et `.since` ; `mgmtDureeTexte` mgmt-suivi.js:201 |
| N8 dernier combat de contrat | `ligne.ct` ; `mgmtContratRestants` mgmt-contrats.js:108 ; fait `fin_contrat` |
| N9 organisation rivale | `MGMT_EXT_ORGS` mgmt-data.js ; `mgmtContratGrandeur` mgmt-contrats.js:73 ; moments `offre-autre-organisation`, `clash-autre-organisation` (contextuels) ; aucun mécanisme de départ vers une autre organisation |
| N10 deux du même camp | `mgmtMemeCamp` mgmt-camps.js:132 ; `mgmtCardFights` |
| N11 ancien combat réveillé | `m.hist` complet ; `mgmtAffrontements` mgmt-rivalites.js:29 ; extinction à 12 cycles : `MGMT_RIVALITE_CYCLES` mgmt-rivalites.js:23 |

---

## 6. Ce qui pose problème

Dit simplement. Ce sont des constats, pas des décisions.

**Pour la marque (T1) : des sortes sans semaine ou sans identifiant.**

1. **Sans semaine gardée (14 sortes) :** S9, S10, S11, S12, S13, S17, S22, S26, S28, S29, S31, S32, S33, S34. S9 et S22 (la fratrie, le coéquipier) sont des liens : ils ne produisent un événement daté que lorsque les deux sont opposés sur une carte. S33 n'existe que pendant le cycle courant. Le jeu les recalcule à chaque affichage, souvent en comparant avec le cycle précédent. Une marque posée sur eux ne saurait pas dire « depuis ma dernière visite » : il faudra les dater au moment où ils naissent, ou ne pas les marquer.
2. **Les scénarios n'ont pas de date à eux.** Les cinq scénarios à suite sont dérivés de l'état du jeu et ne sont pas gardés : la seule trace datée est la demande qu'ils déclenchent. Un scénario qui n'a pas produit de demande (le tueur de hype S38, la fratrie S9) n'a pas de date gardée de lui-même.
3. **Sans identifiant de combattant dans le fait gardé (4 cas) :** `title_fight` (il pointe le combat, `m.hist[fight]`, qui contient les deux combattants) ; `retrait_sortie` et `reduite` (ils parlent de la carte, pas d'un combattant) ; et deux états d'écran jamais sauvegardés, `MGMT_RETRAIT_UI` (le nom est écrit en toutes lettres) et `MGMT_PROPOSITION`.
4. **Un ancien format.** Le fait `retired` peut porter `a` sous forme d'objet `{id}` au lieu d'un texte (mgmt-suivi.js:176, mgmt-ceintures.js:59). Toute lecture de la marque devra accepter les deux.
5. **Âge et médical se confondent.** Les faits `retired` d'âge et de retraite médicale sont identiques ; seule la ligne du roster (`retired:'age'` ou `'medical'`) les distingue. Le nom de la blessure n'est pas dans le fait `injury` : il n'existe que dans `m.lastEvent.touched`, écrasé à la soirée suivante. La fiche d'un blessé il y a trois soirées ne peut plus dire de quelle blessure il s'agit.
6. **Le fil de presse oublie.** `m.fil` est borné à 200 nouvelles, les plus anciennes tombent. Les faits, eux, ne tombent jamais (décision de QO-9). Pour la tranche T7 (« les événements du passé lisibles dès le premier jour »), il faut lire les faits et `m.hist`, pas le fil.
7. **Les combattants du monde extérieur n'ont aucun événement gardé.** Leurs moments de vie, leur retraite, leurs changements d'organisation se recalculent à partir de leur identifiant et du cycle. Le conteur ne les montre que pour ceux que le joueur suit (cercle, suivis). Une marque pour eux sera donc toujours recalculée.

**Pour la règle « jamais une fenêtre, jamais une minuterie ».**

8. Le jeu a **déjà** deux mécanismes qui s'en écartent, sur l'écran La semaine : le défilé de début de semaine, qui se ferme tout seul au bout de 2 à 4 secondes (mgmt-mouvement.js:89-90), et la carte qui glisse, fermable, qui s'affiche par-dessus l'écran pour un moment du cercle ou des suivis. Le test « aucune sorte d'événement n'ouvre de fenêtre par-dessus un écran » ne passera pas tant qu'ils existent.
9. **Une demande qui attend finit par disparaître en silence.** Au bout de 3 cycles sans réponse, `mgmtDemandesOuvertes` ne la compte plus (`MGMT_DEMANDE_EXPIRE=3`, mgmt-promesses.js:47) et aucun fait « refus » n'est écrit. La règle du brief (« un événement qui attend une réponse attend dans la fiche et sur l'Accueil ») suppose qu'elle ne s'efface pas.

**Pour le choix des menus.**

10. **« L'Accueil » du brief n'a pas d'équivalent clair.** Dans le code, « Accueil » est l'écran titre (`mfTitre`, mgmt-cadre.js), qui n'affiche aucun événement. L'écran sur lequel on arrive dans la partie est « Carte » (`mgmtEnter`, mgmt-screens.js:352-380). L'écran qui reçoit aujourd'hui les événements de la semaine, « La semaine » (`mgmt_bureau`), **n'est pas dans la barre des onze sections** (`MF_ECRAN_SECTION.mgmt_bureau=null`, mgmt-cadre.js:65). Où doit attendre une demande ? À trancher.
11. **Six rattachements à arbitrer :** S6 (moments de vie), S12 et S13 (monde extérieur), S20 (promesses), S33 (réponse à une proposition), S34 (la voix change). Aucun des sept menus ne leur va naturellement.
12. **Trois familles de nouvelles n'ont aucune place dans les sept menus** et ne sont pas comptées parmi les 40 sortes : les nouvelles sur une catégorie (pénurie de combattants), celles sur la salle et l'argent, et les décisions du joueur (annexe A3).

**Pour le budget (T6) et les doublons.**

13. **Un même événement s'affiche à plusieurs endroits** avec des règles de plafond différentes. Une demande, par exemple, apparaît dans La semaine (jusqu'à 2), dans le défilé (sans plafond autre que 8), dans Presse (via le fil), dans la fiche, dans la pastille du Vestiaire (règle à elle) et dans le libellé du bouton Continuer. La marque devra lire la source gardée (le fait), jamais l'un des écrans.
14. **Le conteur ne plafonne que les moments de vie** (`mgmtConteur` garde `budget−1` moments). Les demandes, la recrue, la rivalité, la parole et la presse sont ajoutées à côté, sous un test `news.length<budget-1` répété dans `mgmtSemaineMonde`. Compter les marques dans le même budget suppose de choisir qui passe d'abord ; aujourd'hui l'ordre est : demandes, recrue, rivalité, parole, presse, moments, puis les nouvelles du monde.
15. **Trente-quatre moments de vie sont prévus et jamais déclenchés.** Parmi eux : entrée et sortie du top 15, devient champion, perd sa ceinture, annonce de retraite, offre d'une autre organisation, rival qui appelle, monte et descend de catégorie, changement d'agent, demande d'augmentation. Le catalogue a déjà écrit leurs textes et leurs médias ; c'est la source la plus proche de N1, N2, N3, N6 et N9.
16. **Quatre faits sont écrits et jamais lus** (`fin_contrat`, `depart_attente`, `libere`, `contrat`) : ce sont des événements du menu Contrats qui n'ont aujourd'hui aucune présence.
17. **Le brief compte quatre scénarios, le code en a douze** (partie 4). Le chiffre du brief est à corriger avant d'écrire la tranche T5.
