# Brief — Des combattants uniques

22/10/2026 · Anthony

> Copie du document Claude Docs https://claude.ai/artifact/QiUQgyAtbpUycAhuq2vuTo, faite le 22/10/2026 pour que les agents (Sonnet, OpenCode) puissent le lire. **Le document en ligne fait foi** : s'il change, cette copie est refaite. Les lots de ce brief sont préfixés « P » (P1 à P11) pour ne pas les confondre avec les lots « Monde » et « Combat ».

## En bref

Ce brief fait de chaque combattant un personnage unique, qui se reconnaît dans la cage et en dehors, et donne au matchmaker quelque chose à gagner, à perdre et à construire. Il répond au constat du 22/10/2026 : le monde est riche, mais le joueur n'a rien à gagner, rien à perdre, rien à construire et presque rien à décider.

**Le principe : des ajouts, pas un autre jeu.** Chaque lot s'emboîte dans le management actuel (Accueil, Carte, Effectif, Fiche, Soirée, Lendemain, Classements, Contrats, Recrutement, Presse). Rien n'est retiré, aucun écran n'est remplacé sans planche validée, aucune partie existante ne casse.

**Cinq règles valent pour tous les lots.**

1. **Poussé au maximum, jamais excessif.** Un ajout est complet ou il n'entre pas : pas de demi-système. Mais aucun ajout ne doit rendre le jeu plus lent à comprendre ou plus pénible à jouer.
2. **Jamais deux fois la même phrase.** Chaque texte sort d'une banque assez large et contextualisée (section Règles d'écriture).
3. **Pas toujours un problème.** Chaque événement a une probabilité ; une soirée calme est normale.
4. **Aucune promesse à gérer.** Les combattants se souviennent, se plaignent, refusent de prolonger ; le joueur n'a jamais une liste d'engagements à tenir.
5. **Tous les combattants restent, aucun portrait, aucun attribut ni note générale.** Les chiffres de ce qui s'est passé (statistiques, affluence, recettes, records) sont permis.

| Lot | Ce qu'il apporte | Dépend de |
| --- | --- | --- |
| P1 | Les statistiques UFC publiques, sur chaque fiche et chaque combat | — |
| P2 | Les traits gagnés et les surnoms gagnés | P1 |
| P3 | Le bouton Suivre et le fil des combattants suivis | — |
| P4 | Ce qui manque à chaque organisation, et les trois espoirs de Leïla | P1 |
| P5 | Le recruteur qu'on envoie | P1, P4 |
| P6 | L'avant-soirée : la semaine du combat et la mémoire des combattants | P2 |
| P7 | La soirée : la salle qui monte, les temps forts, les primes, les discours | P1, P2 |
| P8 | Le lendemain qui raconte | P6, P7 |
| P9 | Le contrat du matchmaker : objectifs, confiance, renvoi, offres | P8 |
| P10 | Les rivalités qui naissent seules et le classement de fin d'année | P9 |
| P11 | Les défis, le carnet du matchmaker, la croissance visible | P9, P10 |

## Ce qu'Anthony a décidé le 22/10

Ces décisions fixent le cadre ; rien ci-dessous ne les rediscute. Son envie la plus forte : **faire de chaque combattant un personnage unique, qui se retranscrit dans la cage et en dehors.**

| Sujet | Décision |
| --- | --- |
| Statistiques publiques façon UFC | Grand oui. Pas d'attributs, pas de note générale |
| Chiffres | Acceptés (résultats, affluence, recettes, records) |
| Portraits | Toujours aucun |
| Effectif | Tous les combattants restent |
| Traits | Acceptés |
| Surnoms gagnés | Oui, dans la limite du réalisme |
| Suivre un combattant | Un bouton Suivre comme dans Football Manager, à la place du cercle et des suivis |
| Organisations | Chacune manque de quelque chose (Split : peu de bons poids lourds, comme l'UFC) |
| Les trois espoirs de Leïla | Accepté |
| Recrutement | Comme un tirage, mais on envoie le recruteur et on choisit où : par style, par catégorie |
| Contrat du matchmaker | Contrat court et peu payé au début, renvoi possible, autres organisations possibles. Rejoindre plus fort doit avoir un sens alors que les organisations ne se mélangent pas (lot P9), et on doit pouvoir devenir le plus fort en restant |
| Semaine du combat | Acceptée, avec énormément de contextes, des probabilités, jamais l'impression d'avoir toujours un problème |
| Mémoire des combattants | Ils se souviennent, se plaignent, refusent ou acceptent de prolonger. **Aucune promesse.** L'avant-soirée doit compter autant que la soirée et que l'après-soirée |
| La salle qui monte | Acceptée, sans devenir pénible |
| Combats en temps forts | Pour les combats qui intéressent moins |
| Combat et Performance de la soirée | Acceptés, inscrits sur les fiches. Le joueur ne les attribue pas |
| Discours d'après-combat | Seulement pour les miracles, les combats fous, les grosses surprises (Sean Sharaf contre Gable Steveson) et les combats principal et co-principal |
| Lendemain qui raconte | Très important |
| Rival | Il naît tout seul, jamais imposé : on est en guerre contre plusieurs organisations, avec un vrai enjeu au classement de fin d'année |
| Trois boucles emboîtées | Acceptées, avec des défis secondaires |
| Carnet du matchmaker | Accepté, en secondaire |
| Croissance visible | Liée à la popularité et au classement, avec une logique, comme dans Football Manager |
| Planches | À refaire quand le périmètre sera délimité, sur signal d'Anthony |

**À venir, hors de ce brief.** Trois modes sont annoncés « À venir » dans le menu, sans code :

- **Le mode histoire**, à débloquer ;
- **Le mode Patron** (créer ou diriger son organisation), qui remplace l'actuel « Créer ton organisation · À venir » ;
- **Dirigeant de salle** : on dirige une salle dont les combattants combattent dans plusieurs organisations (modèle : Nicolas Ott).

## Les lots

Chaque lot dit ce qu'il apporte au joueur, ce qu'il réutilise dans le code, ses tranches et ce qui prouve qu'il est fini. Les textes sont écrits par Claude, marqués `relu:false`.

### P1 — Les statistiques publiques, façon UFC

**Ce que le joueur gagne.** Un combattant se lit dès le premier jour, comme sur la page d'un athlète de l'UFC, sans attribut ni note. Les chiffres disent comment il combat ; on les compare, on y repère une pépite, une faille, un record.

**Ce qui existe.** Le moteur calcule déjà les coups significatifs (tête, corps, jambes ; distance, clinch, sol), les tentatives, les amenées tentées et réussies, les soumissions tentées, le contrôle en secondes et les knockdowns. Mais `m.hist` ne garde que la trace de rejeu : la fiche rejoue les huit derniers combats (`mgmtObs`, `mgmt-soiree-show.js`) pour en tirer quelques lignes. L'archive des six ans ne garde que le résultat, la méthode et le round.

**Tranches.**

- **T1 — Le relevé de chaque combat.** À la fin de chaque combat, un relevé compact est écrit avec la trace, par round et au total, pour les deux coins : coups significatifs donnés et tentés par cible et par position, coups totaux, amenées, soumissions tentées, contrôle, knockdowns, durée. Rien n'est rejoué pour l'afficher. Mesurer d'abord le poids par combat et pour les six ans des huit organisations ; plafond de la partie fixé avant le code.
- **T2 — Le passé a aussi ses chiffres.** Les combats des six ans portent le même relevé, généré par le vrai moteur pendant la création. Les combats d'avant les six ans (bilan reconstitué) n'ont pas de relevé : la fiche le dit (« chiffres sur 14 combats documentés »).
- **T3 — Les chiffres de carrière.** Fonctions pures : coups significatifs donnés et encaissés par minute, précision, défense, amenées par 15 minutes, réussite, défense d'amenée, soumissions tentées par 15 minutes, contrôle par 15 minutes, knockdowns, durée moyenne, victoires et défaites par méthode, finitions au premier round, plus longue série, combats de titre, primes (P7). Chaque chiffre a sa moyenne de catégorie et son rang dans la catégorie.
- **T4 — L'onglet Statistiques de la fiche.** Modèle : la page d'un athlète sur ufc.com. Les grands chiffres en tête, chacun face à la moyenne de la catégorie ; la répartition des coups par cible et par position ; les victoires par méthode ; ses records personnels. Planche à faire.
- **T5 — Le combat en chiffres.** Avant : le face-à-face (taille, allonge, âge, garde, et les huit chiffres de carrière côte à côte). Après : le relevé round par round, comme une page de combat sur ufcstats. Dans Présentation, Revoir, Lendemain et Résultats.
- **T6 — Les leaders et les records.** Dans Classements : les meneurs de chaque catégorie (plus de finitions, meilleure défense d'amenée, plus gros volume…). Le livre des records de l'organisation (plus de coups significatifs en un combat, KO le plus rapide, plus de défenses de titre). Un record battu devient une nouvelle (P3, P8).

**Fini quand.** Chaque combattant de chaque organisation a ses chiffres dès le premier jour ; la fiche, la présentation et le lendemain les affichent ; un test vérifie que la somme des relevés par round donne le total, et que les chiffres de carrière sont ceux des relevés.

### P2 — Les traits et les surnoms gagnés

**Ce que le joueur gagne.** Deux combattants au même bilan ne se ressemblent plus. Chacun porte deux à quatre traits nés de ce qu'il a vécu, qui changent sa façon de combattre, et que l'on voit dans la cage, dans le commentaire, dans la presse.

**Les traits.** Un trait est un fait, jamais un chiffre. Il a une condition d'obtention lue dans les relevés (P1) et l'historique, une condition de perte, une visibilité et un effet dans le combat.

| Famille | Exemples | D'où il vient | Effet dans la cage |
| --- | --- | --- | --- |
| Menton | Menton de granit, Menton fêlé | KO encaissés, coups lourds absorbés sans tomber | S'appuie sur le traumatisme existant (`trauma`) |
| Cardio | Diesel, S'éteint au 3e | Rounds gagnés ou perdus selon le moment | Rythme et usure |
| Mental | Perd ses moyens sous la pression, Revanchard, Hésite après un KO | Défaites sous la pression, revanches, KO subis | Politique de combat (reculer, défendre) |
| Sol | Ne se relève pas, Chasseur de cou | Soumissions subies ou obtenues, contrôle | Choix d'amenée et défense au sol |
| Finition | Finisseur, Juge-dépendant | Séries d'arrêts ou de décisions | Prise de risque |
| Lieu et moment | Chez lui à Lyon, Lent à démarrer, Rouillé | Combats à domicile, premiers rounds, inactivité | Petit bonus ou malus situé |

- **T1 — Le catalogue.** Trente à quarante traits, chacun avec sa règle, sa phrase de fiche, ses phrases de commentaire et de presse. Plafond : quatre traits visibles par combattant.
- **T2 — L'effet dans la cage.** Les traits passent par les leviers que le moteur a déjà (profils de style, politiques, rythme dans `engine-combat-tactics.js`, traumatisme). Feu vert conditionnel du 22/10 : chaque effet est mesuré avant/après avec `tools/combat-reference.js` ; un trait sans effet mesurable est retiré.
- **T3 — Ce qu'on sait.** Certains traits se voient tout de suite dans les chiffres, d'autres restent cachés jusqu'à ce qu'un combat, le recruteur (P5) ou la presse les révèle. La fiche écrit « Ce qu'on ne sait pas encore ».
- **T4 — Les traits dans le combat montré.** Le commentaire et la présentation citent le trait au moment où il joue (« Swat recule encore. Sous la pression, il perd ses moyens. »).

**Les surnoms gagnés.** Aujourd'hui chaque combattant naît avec un surnom tiré au sort. Désormais, dans les parties neuves, environ la moitié des combattants arrivent sans surnom (réalisme : beaucoup de combattants n'en ont pas). La presse en donne un après une performance qui le justifie : trois arrêts sur coupures, un KO par coup de pied retourné, une série de finitions au premier round, une guerre mémorable. Rare : quelques-uns par saison dans toute l'organisation. Les parties existantes gardent leurs surnoms.

- **T5 — Les surnoms gagnés.** Banques par déclencheur et par langue, un événement « La presse l'appelle désormais… », le surnom inscrit sur la fiche avec la soirée qui l'a donné.

**Fini quand.** Sur une partie de six ans, chaque combattant actif a au moins un trait vu ou caché ; deux combattants de même style et même bilan diffèrent par leurs traits ; la mesure de référence montre l'effet de chaque trait.

### P3 — Le bouton Suivre

**Ce que le joueur gagne.** Comme dans Football Manager : un bouton Suivre sur n'importe quel combattant, de n'importe quelle organisation, et un fil d'actualités de ceux qu'il suit.

- **T1 — Un seul geste.** Le cercle (5) et les suivis (15) deviennent une seule liste, sans plafond gênant. Touche et bouton Suivre sur la fiche, les listes, les dossiers. Migration : cercle et suivis fusionnent, rien ne se perd.
- **T2 — Le fil.** Une section Actualités et un bloc sur l'Accueil : résultats, blessures, traits gagnés, surnoms, records, mouvements au classement, fins de contrat, déclarations, rumeurs venues des autres organisations. Lu, non lu ; filtre par combattant.
- **T3 — Les combattants des autres organisations.** On peut suivre un combattant de Garden of Blood : son fil arrive aussi. C'est l'éclaireur du recrutement et des rivalités.

**Décidé (Anthony, 22/10).** Suivre sert à s'informer et ne réserve pas le combattant : Leïla peut le placer. Une case « Je le booke moi-même » sur la fiche garde la réservation actuelle (`mgmt-agenda.js`).

### P4 — Ce qui manque à chaque organisation, et les trois espoirs

**Ce que le joueur gagne.** Chaque organisation a un manque visible dès l'arrivée, qui donne au joueur un chantier personnel, et Leïla lui confie trois espoirs à faire grandir.

**Ce qui existe.** Les profils ont déjà des catégories fortes et faibles (`mgmt-organisations-data.js`), mais seules Knuckle Gate et Undisputed Cage en ont.

Tableau validé par Anthony le 22/10 :

| Organisation | Ce qui lui manque | Sa force |
| --- | --- | --- |
| Split | De bons poids lourds | Équilibrée partout ailleurs |
| Garden of Blood | Des espoirs | Des vedettes, des salles pleines |
| MMA Korner | Un potentiel champion | Des poids légers et coq qui progressent |
| Ultimate Rim | Des combattants expérimentés | Des jeunes partout |
| Fighting Pacific Championship | Des finisseurs | Des poids mouche et coq solides |
| Knuckle Gate | Des soumissions | Les meilleures combattantes |
| Pure Impact | Des combattants à domicile | Des noms achetés ailleurs |
| Undisputed Cage | De bons poids mouche | Les lourds |

- **T1 — Le manque dans le monde.** Les profils se remplissent ; la génération et le passé en tiennent compte (moins de combattants, moins bons, champion contesté dans la catégorie faible ; pour un manque de style — finisseurs, soumissions — moins de combattants de ce profil).
- **T2 — Le manque à l'écran.** « Ce qui manque à Split » sur l'arrivée, l'Accueil et Organisation ; Leïla en parle ; la presse le relève. Il nourrit un objectif de saison (P9).
- **T3 — Les trois espoirs.** À l'arrivée, Leïla présente six espoirs (de l'effectif ou à recruter, angles variés, au moins un qui répond au manque). Le joueur en garde trois : ils sont suivis, marqués « Ton espoir », et Leïla donne de leurs nouvelles. Aucune promesse, aucune obligation. Chaque nouvelle saison, Leïla peut en proposer un nouveau.

### P5 — Le recruteur qu'on envoie

**Ce que le joueur gagne.** Le plaisir d'ouvrir un tirage, sans boutique : on choisit où envoyer le recruteur et ce qu'on cherche, et on attend son retour avec l'espoir d'une pépite.

**Ce qui existe.** L'écran Recrutement liste des combattants libres ou d'autres organisations. Les catalogues de noms par pays existent (`MGMT_NOMS_AJOUTS`). Le staff a été abandonné le 19/10 : le recruteur est un personnage nommé (nom proposé par Claude, validé par Anthony), sans gestion de staff.

- **T1 — La mission.** Le joueur choisit une destination (Daghestan, Kirghizistan, Brésil, États-Unis, Pologne, Pays-Bas, Thaïlande, Japon, France… — liste validée le 22/10), une catégorie et un style cherché (lutteur, frappeur, grappler, complet). La mission coûte un budget de voyage et dure deux à quatre semaines. Une mission à la fois.
- **T2 — Ce que chaque scène donne.** Chaque destination a ses styles dominants (lutte et sambo au Daghestan, jiu-jitsu au Brésil, kickboxing aux Pays-Bas et en Thaïlande, lutte universitaire aux États-Unis…), ses circuits régionaux, ses chances de pépite. Le recruteur peut revenir bredouille.
- **T3 — Le retour.** Trois à cinq profils, dévoilés un par un : bilan régional, organisations, chiffres partiels de ses combats documentés (P1), un trait révélé (P2), et la phrase du recruteur. La pépite est rare et se reconnaît (14-0 avec 14 finitions dans une petite organisation). Planche à faire.
- **T4 — Signer ou suivre.** Chaque profil se signe par l'écran Contrats existant, ou se suit (P3). Un profil non signé peut être approché par une organisation rivale (P10).

**Fini quand.** Dix missions vers la même destination ne rendent jamais deux fois le même profil ; la répartition des styles suit la destination ; un test fixe la rareté des pépites.

### P6 — L'avant-soirée : la semaine du combat et la mémoire

**Ce que le joueur gagne.** Les semaines avant la soirée comptent autant que la soirée : des combattants qui parlent, se préparent, se blessent, se provoquent, et qui se souviennent de la façon dont on les a traités.

**Ce qui existe.** Les forfaits, le remplacement au pied levé et la carte réduite (`mgmt-retraits.js`, probabilité de base 1,5 % par combattant, un forfait au plus par soirée), les raisons de combattre, les demandes, l'attente, les camps.

- **T1 — Les événements de la semaine.** Un catalogue d'au moins vingt familles, positives autant que négatives : blessure au camp, poids manqué (poids intermédiaire avec amende versée à l'adversaire, ou annulation), visa, maladie, changement de coach, conférence de presse, face-à-face qui dégénère, combattant qui demande à monter sur la carte, préventes qui s'emballent, vidéo du camp qui circule, adversaire qui provoque sur les réseaux.
- **T2 — Le dosage.** Chaque famille a sa probabilité, liée au contexte (charge de combats, âge, trait, camp, rivalité). Cible par soirée : environ un tiers sans événement notable, un tiers avec un seul, le reste avec deux ou trois, dont au plus un problème à régler. Un test sur 200 soirées vérifie la répartition.
- **T3 — La mémoire des combattants.** Chaque combattant garde ce que le matchmaker lui a fait : attente longue, combat refusé, relégation en préliminaires, chance donnée au pied levé, prime reçue, titre accordé ou refusé. Ces souvenirs sont des faits, jamais des promesses. Ils changent ses réponses : accepter un combat, le refuser, se plaindre dans la presse, prolonger ou partir.
- **T4 — Ce qu'il pense de toi.** Sur la fiche, en mots et sans jauge : « Te doit sa carrière », « Estime qu'on le cache », « Ne prolongera pas ». La presse et le fil (P3) le relaient.

**Fini quand.** Sur 200 soirées simulées, la répartition du dosage est tenue ; aucune phrase ne revient deux fois sur 50 soirées pour un même combattant ; aucun écran ne demande de suivre un engagement.

### P7 — La soirée : la salle, les temps forts, les primes, les discours

**Ce que le joueur gagne.** Une soirée qui se vit comme un spectacle qui monte, où l'on regarde en entier les combats qui comptent et en temps forts les autres.

- **T1 — La salle qui monte.** Entre deux combats (jamais pendant), une ligne : l'ambiance de la salle et l'affluence. Une finition, une surprise ou une guerre la font monter ; une décision molle la fait retomber. L'ordre de la carte compte. Discret, sans bruit ni répétition ; une option la masque.
- **T2 — Les temps forts.** Trois façons de voir chaque combat : complet (l'arène), en temps forts (les quatre à huit moments clés du déroulé réel, environ 45 secondes), ou le résultat seul. Par défaut : principal et co-principal en entier, les autres en temps forts. Le choix se règle combat par combat sur l'écran de la soirée.
- **T3 — Les primes.** « Combat de la soirée » et deux « Performance de la soirée », attribuées par l'organisation selon les relevés (finition, surprise, guerre), jamais par le joueur. Payées par la caisse (économie recalibrée), annoncées en fin de soirée, inscrites sur la fiche et dans les records. Le combattant s'en souvient (P6).
- **T4 — Les discours.** Seulement pour le principal et le co-principal, les grosses surprises (pronostic public sous 25 %), et les combats fous (knockdowns des deux côtés, retournement, finition dans les dernières secondes). Le vainqueur parle : il interpelle un nom (graine de rivalité, P10), remercie, pleure, annonce sa retraite. Le modèle : l'émotion de Sean Sharaf après sa victoire sur Gable Steveson.

**Fini quand.** Une soirée de neuf combats se joue en 15 à 20 minutes avec deux combats complets ; les primes tombent sur les combats que les relevés désignent ; aucun discours sur un combat ordinaire de préliminaires.

### P8 — Le lendemain qui raconte

**Ce que le joueur gagne.** Le récit de sa soirée, du plus fort au plus faible, puis les semaines qui suivent, qui prolongent l'histoire jusqu'à la soirée suivante.

- **T1 — Le poids d'une histoire.** Une fonction pure classe tout ce qui s'est passé : ampleur de la surprise (pronostic public), titre, record, série, trait gagné, surnom, discours, prime, combattant suivi ou espoir, rivalité.
- **T2 — Le lendemain recomposé.** Dans l'ordre : les trois moments (la surprise, la finition, la guerre) avec Revoir ; les primes ; les discours ; ce que ça change pour tes suivis et tes espoirs ; les titres de presse, qui parlent d'abord de la plus grosse histoire ; les chiffres (salle, argent, popularité, objectifs P9) ; les mouvements notables ; les résultats complets. Planche à refaire.
- **T3 — L'après.** Dans les semaines suivantes, l'histoire continue sur l'Accueil et le fil : réponses aux interpellations, réactions sur les réseaux, suspensions médicales connues, demandes de revanche, réactions des autres organisations.
- **T4 — Des classements qui racontent une montée.** Préalable : la correction D1 de l'audit du 16/10 (une défaite coûte une à quatre places). Sans elle, une victoire ne se lit pas comme une montée.

**Fini quand.** Sur la soirée de référence, la victoire d'un 13-1 sur le n°1 ouvre le lendemain et fait le premier titre de presse.

### P9 — Le contrat du matchmaker

**Ce que le joueur gagne.** Un poste qui peut se perdre. Comme dans Football Manager : un premier contrat court et peu payé, des objectifs, une confiance qui monte ou s'effrite, un renvoi possible, et des offres d'ailleurs.

**Ce qui existe.** Jean-Michel Delatour, le patron de Split, existe dans les données ; ses objectifs n'ont jamais été codés. Les huit organisations vivent et se classent (Monde lot 9).

- **T1 — Le contrat.** Un an, un salaire modeste (proposition de Claude acceptée le 22/10), affichés sur l'arrivée. À la fin : prolongation et augmentation, prolongation sous condition, ou renvoi.
- **T2 — Les objectifs de saison.** Trois à cinq, fixés par le patron selon l'organisation : combler son manque (P4), finir à un rang du classement des organisations, une popularité, un champion dans le top 5 mondial, une caisse positive. Chaque soirée peut porter un ou deux objectifs du patron ou du diffuseur.
- **T3 — La confiance.** En mots, jamais en jauge : « Le patron est ravi », « Il commence à douter ». Elle bouge aux soirées, aux objectifs, à la caisse. Un rendez-vous de mi-saison la dit en face.
- **T4 — Le renvoi et les offres.** Renvoyé, le joueur reçoit des offres d'organisations plus petites, ou attend. Bien noté, il est approché par de plus grandes. Il peut refuser.
- **T5 — Changer d'organisation.** Étude d'abord : le monde vivant porte déjà les sept autres organisations ; passer de l'une à l'autre sans recréer la partie. La tranche ne se code qu'après cette étude.

**Pourquoi rejoindre plus fort, alors que les organisations ne se mélangent pas.** Quatre raisons, à coder ensemble :

1. **La scène.** Plus grandes salles, plus gros diffuseur, plus gros budget de recruteur.
2. **Les meilleurs du monde.** La puissance d'une organisation se mesure à ses combattants au classement mondial : chez la plus forte, on booke le n°1 mondial.
3. **Les agents libres.** Les meilleurs combattants libres choisissent d'abord les organisations bien classées (P10).
4. **Le choc des organisations.** Une soirée commune, champion contre champion, au plus une fois par an : une autre organisation la propose et le joueur accepte ou refuse, ou c'est le joueur qui la propose et l'autre organisation répond. Le réel l'a fait (Rizin contre Bellator en 2022, PFL contre Bellator en 2025). Une organisation bien classée reçoit plus de propositions et voit les siennes plus souvent acceptées, et y gagner fait monter l'organisation.

**Devenir le plus fort sans partir.** Rester dans la même organisation doit être une vraie voie : faire monter Split au classement des huit jusqu'à la première place, par les soirées, le recrutement, les paliers de croissance (P11) et la guerre au classement (P10). Chaque rang gagné change ce que l'organisation peut faire (salles, diffuseur, budget, attrait pour les agents libres), et la presse le raconte. Partir et rester sont deux carrières possibles, aucune n'est la bonne.

### P10 — Les rivalités qui naissent seules, et le classement de fin d'année

**Ce que le joueur gagne.** Une guerre contre plusieurs organisations, avec un vrai enjeu au classement de fin d'année. Aucune rivale imposée : elle naît de ce qui arrive, et change d'une partie à l'autre.

- **T1 — Les organisations agissent.** Chaque organisation a un matchmaker nommé (noms proposés par Claude, validés par Anthony), avec sa manière (acheteur, formateur, prudent). Il vise les agents libres, approche les combattants en fin de contrat (que la mémoire de P6 rend plus ou moins fidèles), pose ses grosses soirées.
- **T2 — La rivalité se calcule.** Entre Split et chaque organisation : combattants pris ou perdus, agent libre disputé, soirées le même week-end, combattant parti chez elle, voisinage au classement, piques dans la presse. La plus forte devient « la rivale du moment » ; la presse la nomme ; elle peut changer.
- **T3 — La guerre au classement.** Le classement des huit (popularité, plus grande salle remplie, notoriété, puissance) s'affiche avec ses duels : qui est juste devant, qui est juste derrière, ce qui a fait bouger.
- **T4 — La fin d'année.** Le rang final a des conséquences, comme une place en championnat : palier du diffuseur, budget, attrait pour les agents libres, confiance du patron, propositions pour le choc des organisations.

### P11 — Les boucles, les défis, le carnet, la croissance

**Ce que le joueur gagne.** Une raison de jouer « encore une soirée » à chaque échelle de temps.

| Boucle | Durée | Ce qu'on vise | Ce qui le dit |
| --- | --- | --- | --- |
| La soirée | Cinq semaines | Un ou deux objectifs, la salle, les primes | Le lendemain (P8) |
| La saison | Un an | Objectifs du patron, rang chez les huit, combler le manque | La cérémonie de fin d'année |
| La carrière | Plusieurs années | Réputation, offres, champions faits | Le carnet du matchmaker |

- **T1 — La cérémonie de fin d'année.** Combattant, KO, soumission, combat, révélation et retour de l'année, choisis par la presse sur les relevés. Inscrits sur les fiches. Bilan du patron, classement final des huit.
- **T2 — Les défis secondaires.** Une quarantaine : faire d'un 0-0 un champion, remplir la plus grande salle, trois finitions au premier round dans une soirée, un poids lourd classé chez Split… Ils servent aussi de succès Steam.
- **T3 — Le carnet du matchmaker.** Section secondaire : champions couronnés sous toi, espoirs devenus classés, records de tes soirées, primes, cérémonies, défis.
- **T4 — La croissance visible.** Des paliers liés à la popularité et au rang chez les huit : salles accessibles, palier du diffuseur, budget du recruteur, attrait pour les agents libres. Chaque palier franchi est annoncé et se lit sur Organisation, avec la marche suivante.

## Règles d'écriture et de dosage

Tout texte du jeu, ancien ou nouveau, doit pouvoir se lire cent fois sans qu'on reconnaisse une phrase. Les textes sont écrits par Claude, marqués `relu:false`, jamais par les codeurs.

**Une phrase est faite de trois couches.** Le fait (qui, quoi, le chiffre), le contexte (trait, rivalité, série, ville, âge, organisation, adversaire commun, historique avec le joueur) et la voix (qui parle : presse, combattant, Leïla, coin, public). Chaque couche a sa banque ; la phrase finale les combine.

**Tailles minimales des banques.**

| Type de texte | Variantes par situation | Contextes combinables |
| --- | --- | --- |
| Événement de la semaine (P6) | 12 | Au moins 3 par famille |
| Titre de presse du lendemain (P8) | 15 par type d'histoire | Ampleur, trait, rivalité, série |
| Discours d'après-combat (P7) | 20 par cas | Interpellation, émotion, retraite |
| Ligne de commentaire liée à un trait (P2) | 8 par trait | Round, avance au score |
| Profil du recruteur (P5) | 10 par destination | Style, rareté |

**La mémoire des phrases.** La partie retient les dernières variantes servies par famille et par combattant : une variante ne revient pas avant que toutes les autres soient passées. Graine de partie, aucun `Math.random()`.

**Le dosage.** Chaque événement a une probabilité écrite dans le code, avec sa justification. Les cibles :

- environ un tiers des soirées sans événement de semaine notable ;
- au plus un problème à régler par soirée, jamais un par combat ;
- autant de bonnes nouvelles que de mauvaises ;
- un discours sur deux à trois combats par soirée au plus ;
- un surnom gagné tous les quelques mois de jeu, pas à chaque soirée.

**Le test de répétition.** Un outil joue 50 soirées et compte les phrases identiques par famille. Cible : aucune phrase complète répétée pour un même combattant, moins de 2 % entre combattants.

## Exécution, planches et acceptation

**L'ordre.** Trois vagues, chacune jouable à sa fin.

1. **Les combattants** : P1, P2, P3, P4. On sait qui l'on booke, et pourquoi il est unique.
2. **Le cycle d'une soirée** : P6, P7, P8, puis P5. L'avant, le pendant et l'après pèsent autant.
3. **Les enjeux** : P9, P10, P11. On peut gagner, perdre, être renvoyé, monter.

**Les planches.** À refaire sur signal d'Anthony, avant le code des écrans concernés : onglet Statistiques de la fiche, combat en chiffres, retour du recruteur, écran de la soirée avec la salle et le choix de vue, lendemain recomposé, Actualités, contrat et objectifs, classement des huit avec ses duels, cérémonie, carnet. Chaque planche dose l'information : peu d'éléments par écran, beaucoup d'air, la direction visuelle actuelle, aucun texte sous 22 px. Les tranches sans écran neuf (moteur, données, fonctions pures) n'attendent pas les planches.

**Les règles de chaque tranche** (celles des briefs précédents, inchangées) :

- `npm run check` vert, un test par comportement, la liste des tests dans `package.json` ;
- toute évolution de sauvegarde passe par `mgmtMigrate` et `validateMgmt` ; une partie d'avant se charge et joue une soirée ;
- tout `.js` modifié monte son `?v=` dans `index.html` ;
- un écran se vérifie dans le jeu réel, à 1920, à côté de sa planche ;
- le moteur de combat n'est touché que pour un effet mesuré avant/après (P2) ;
- les fiches de tranche sont petites (un écran ou trois lignes d'audit), la branche est donnée exactement.

**Le test des trois moments.** À la fin de chaque vague, Anthony joue trois soirées et répond : un combattant compte-t-il pour moi ? Une décision m'a-t-elle coûté ? Un moment m'a-t-il surpris ? Une vague n'est acceptée qu'avec trois oui.

**Questions tranchées par Anthony le 22/10** (les propositions de Claude sont acceptées) : le tableau des manques (réécrit par lui, ci-dessus) ; suivre ne réserve pas ; la liste des destinations ; les noms du recruteur et des sept matchmakers (Claude propose, Anthony valide) ; le choc des organisations ; le premier contrat d'un an, salaire modeste.

**Sources.** [Pound for Pound](https://store.steampowered.com/app/4289560/Pound_for_Pound_MMA_Promotion_Simulator/) · [Cage Empire](https://store.steampowered.com/app/5062590/Cage_Empire_MMA_Manager/) · [Football Manager](https://stratpack.blog/2019/01/25/football-manager-addictive-spreadsheet/) · [Basketball GM](https://zengm.com/blog/2014/03/new-feature-achievements/) · [Darkest Dungeon](https://www.dreadcentral.com/editorials/483362/darkest-dungeon-builds-exciting-characters-from-game-mechanics/) · [Shadow of Mordor](https://gamerant.com/middle-earth-shadow-of-mordor-nemesis-system-character-development-good/) · [Balatro](https://gmtk.substack.com/p/balatros-cursed-design-problem) · [Sean Shelby](https://squaremile.com/sport/sean-shelby-james-elliott-interview/) · [Combats UFC modifiés en 2022](https://mmasucka.com/every-ufc-fight-change-and-cancellation-of-2022/).
