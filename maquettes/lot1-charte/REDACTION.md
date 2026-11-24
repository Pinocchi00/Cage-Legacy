# Cage Legacy — rédaction de tous les écrans (T6, règle du 24/11)

**Date :** 24/11/2026, **validé le 24/11**. **Origine :** T6 (« refaire chaque dialogue et phrase de littéralement tout le jeu ») et la règle « Rédaction resserrée » du 24/11 (`REGLES-MAQUETTES.md`, section 9). **Périmètre :** les 27 fichiers `.js` de `maquettes/lot1-charte/`. Le code du jeu n'est pas touché.

Ce document relève **chaque texte changé**, écran par écran, avec la raison. Rien n'est tranché à ta place : les points ouverts sont listés à la fin et n'ont pas été touchés.

## 1. Les règles appliquées

1. **Étiquettes sans article ni possessif** : « Contrat », « Traits », « Prochain défi », « Reste », pas « Son contrat », « Ses traits », « Le prochain défi », « Il t'est resté ».
2. **Fonction seule** : « Médecin · hier », « Marco Ferri · recruteur », « Leïla Malika · adjointe ». Dans une phrase, le nom : « Dr Hélène Roux conseille… », « Gérard Vasseur fixe… ».
3. **Nombres en chiffres** dans les étiquettes, les cases, les titres et les messages : « 5 victoires de suite », « 2/3 », « Moment 2/5 », « 1/2 » (avertissements). **Rang parmi les huit** : « 2/8 », « 4/8 ou mieux ».
4. **Une phrase, une idée**, sans image ni tournure de roman : « Monte en régime quand les autres s'éteignent » devient « Garde son rythme quand l'autre fatigue ».
5. **Pas de tutoriel ni de consigne** : « Continue jusqu'à la semaine du combat » devient « Pesée le 15 février » ; « tu fixes son montant avant la soirée » devient « montant fixé dans les Finances ».
6. **Un même fait, un même texte** : objectifs (Arrivée, Ta carrière, Messages, fin de saison), « Gérard Vasseur fixe tes objectifs 2027 » (Messages, Arrivée, Calendrier), « 5 victoires sur 7 par soumission » (Accueil, Arrivée), « n° 1 chez Split » partout, « Reste » (Caisse, Résultats, Soirée, Calendrier, Primes), « Changements » (Messages, Soirée, fin de saison). `arrivee.js` et `messages.js` restent synchronisés.
7. **Les paroles restent des phrases**, plus courtes quand elles s'étiraient (Mezouar et Rachidi après leur combat, Leïla sur la carte). La presse garde son ton de journal : seuls ses titres passent en chiffres (« Rachidi, 5 victoires de suite »).
8. **Typographie** : apostrophe ’ partout (aucune apostrophe droite trouvée) ; **espace insécable** (U+00A0) avant « : ; ! ? » et à l'intérieur de « » ; mois abrégés vérifiés (janv., févr., sept. : aucun écart trouvé). Ce passage est fait par un script sur le seul contenu des chaînes, jamais sur le code.
9. **Identifiants intacts** : aucun `S.ecran`, `data-go`, clé, adresse ni nom d'écran de la barre n'a changé. Seul le texte affiché change ; aucun écran n'est redessiné.

## 2. Avant → après, écran par écran

Un « … » marque une valeur qui change selon la partie (nom, date, nombre). « (n endroits) » : le même texte remplacé à plusieurs endroits.

### Accueil (15)

| Avant | Après | Pourquoi |
|---|---|---|
| Il manque deux combats pour Split Fight Night 63 | Il manque 2 combats pour Split Fight Night 63 | nombre en chiffres ; même texte dans Messages (2 endroits) |
| Le médecin · hier · retour estimé le 2 février | Médecin · hier · retour estimé le 2 février | fonction seule |
| Le médecin · … · retour toujours prévu le 2 février | Médecin · … · retour toujours prévu le 2 février | fonction seule |
| Palier franchi : les diffuseurs nationaux regardent Split | Palier franchi : Diffusion nationale | le nom du palier, sans image (3 endroits) |
| Ton recruteur est disponible | Recruteur disponible | sans possessif (3 endroits) |
| Ce qui t’attend | Priorités | étiquette sans tournure ; « À faire » reste l’état des défis |
| La prochaine chose à faire | Prochaine étape | même mot que la ligne d’alerte |
| dernier combat de son contrat | dernier combat du contrat | sans possessif |
| Cinq victoires sur sept par soumission | 5 victoires sur 7 par soumission | chiffres |
| Cinq victoires de suite | 5 victoires de suite | chiffres |
| Ta saison, 2027 | Saison, 2027 | sans possessif |
| 2e, à garder | 2/8, à garder | rang parmi les huit (le 2e reste un point ouvert) (2 endroits) |
| 2 places à finir | 2 places libres | état de la carte, mot de la Carte (« Place libre ») |
| 2 places à finir, 3 places à finir | 2 places libres, 3 places libres | suit le texte de l’Accueil |
| Le temps s’arrête : nouveau message, …. | Nouveau message, …. | une idée |

### Fiche (28)

| Avant | Après | Pourquoi |
|---|---|---|
| Monte en régime quand les autres s’éteignent. | Garde son rythme quand l’autre fatigue. | sans image |
| Une guerre dont on parle encore | Sa guerre contre Belkacem | le fait, déjà cité dans Relation (« Depuis leur guerre ») |
| Jamais deux défaites de suite | Jamais 2 défaites de suite | chiffres (2 endroits) |
| Ses traits | Traits | sans possessif |
| Dernier combat le 3 octobre 2026, il y a 3 mois et 1 semaine | Dernier combat : 3 oct. 2026, il y a 3 mois et 1 semaine | date courte |
| Durée moyenne d’un combat | Durée moyenne | étiquette |
| Son contrat | Contrat | sans possessif |
| Aucune prime de performance pour l’instant. | Aucune prime de performance. | état vide simple |
| 27e sur 30 (classement des salaires) | 27/30 | rang en chiffres |
| Son point faible | Point faible | sans possessif |
| Ses projections partent de nulle part. | Ses projections se voient rarement venir. | sans image |
| Peu de boxeurs frappent aussi fort au corps : c’est ce qui casse les autres. | Peu de boxeurs frappent aussi fort au corps. | une idée |
| Il a soumis Parfait Nana, ce que personne d’autre n’a réussi. | Le seul à avoir soumis Parfait Nana. | une idée |
| Le clinch : c’est là que les autres le craignent le plus. | Le clinch : son point fort. | sans tournure |
| Son cardio : le même rythme du premier au dernier round. | Son cardio : le même rythme du 1er au dernier round. | chiffres |
| Au troisième round : il use l’autre, puis il le finit ou gagne aux points. | Au 3e round : il use l’autre, puis le finit ou gagne aux points. | chiffres |
| 8-0, huit finitions | 8-0, 8 finitions | chiffres |
| Sa première prime chez Split | Première prime chez Split | sans possessif |
| Après quatre victoires de suite | Après 4 victoires de suite | chiffres |
| Prolonge pour quatre combats | Prolonge pour 4 combats | chiffres |
| Deuxième défense réussie | 2e défense réussie | chiffres |
| Défendre sa ceinture trois fois, 2 sur 3 | Défendre sa ceinture 3 fois, 2/3 | chiffres |
| Après trois victoires de suite | Après 3 victoires de suite | chiffres |
| Sa meilleure place | Meilleure place | sans possessif |
| Son entourage | Entourage | sans possessif |
| Sa carrière | Carrière | sans possessif |
| Tu t’engages : la demande passe « en cours », et il s’en souviendra. | Engagement pris : demande en cours. | une idée, sans tutoriel |
| Son entraîneur | Entraîneur | fonction seule (2 endroits) |

### Effectif (6)

| Avant | Après | Pourquoi |
|---|---|---|
| Il reste payé jusqu’à la fin de son contrat. | Payé jusqu’à la fin du contrat. | une idée |
| Trois combats durs en quatorze mois, à 37 ans. | 3 combats durs en 14 mois, à 37 ans. | chiffres |
| Le médecin conseille trois mois sans sparring dur après son prochain combat. | Dr Hélène Roux conseille 3 mois sans sparring dur après son prochain combat. | son nom dans une phrase, chiffres |
| Voir le détail vue experte | Vue experte | bouton court |
| Revenir à la vue essentielle | Vue essentielle | bouton court |
| : écran Contrats, hors de cette maquette. | : écran Recrutement, hors de cette maquette. | nom actuel de l’écran |

### Carte (22)

| Avant | Après | Pourquoi |
|---|---|---|
| Nana, 37 ans : trois mois sans sparring dur conseillés après ce combat. | Nana, 37 ans : 3 mois sans sparring dur conseillés après ce combat. | chiffres |
| Lecomte sort de suspension le 6 février : dix jours pour se préparer. | Lecomte sort de suspension le 6 février : 10 jours pour se préparer. | chiffres |
| Van Belle : dernier combat de son contrat. | Van Belle : dernier combat du contrat. | sans possessif, même texte que l’Accueil |
| Rachidi a gagné ses cinq derniers combats. | Rachidi a gagné ses 5 derniers combats. | chiffres |
| Darras est de Lille : le Forum sera pour lui, et Belkacem aime ce genre de soirée. | Darras est de Lille : le Forum sera pour lui. | une idée |
| Deux poids légers qui n’ont pas combattu depuis l’été. Leïla veut les relancer. | 2 poids légers sans combat depuis l’été. Leïla veut les relancer. | chiffres, plus court |
| Les deux meilleures du classement, libres | Les 2 meilleures du classement, libres | chiffres |
| Les deux meilleurs mi-moyens libres | Les 2 meilleurs mi-moyens libres | chiffres |
| Deux séries de victoires | 2 séries de victoires | chiffres |
| reste sur trois victoires | reste sur 3 victoires | chiffres |
| Relance deux inactifs | Relance 2 inactifs | chiffres |
| Deux noms peu connus du public | 2 noms peu connus du public | chiffres |
| Sa demande est tenue | Demande tenue | sans possessif |
| Sa demande n’est pas tenue | Demande non tenue | sans possessif |
| Les dossiers de Leïla · | Dossiers de Leïla · | sans article, comme le titre « Dossiers de Leïla » (2 endroits) |
| L’enjeu | Enjeu | sans article |
| Les combattants et leurs camps seront prévenus dès la confirmation. | Combattants et camps prévenus à la confirmation. | plus court |
| Carte validée. Continue jusqu’à la semaine du combat. | Carte validée. Pesée le 15 février. | le fait, sans consigne ; la semaine du combat n’existe plus (pesée, 22/11) |
| La carte est complète : vérifie ce qu’il reste à régler, puis valide. | Carte complète. Des points restent à régler. | sans consigne |
| La carte est complète : tu peux la valider. | Carte complète, prête à valider. | sans consigne (2 endroits) |
| Carte validée. Les combattants et leurs camps sont prévenus. | Carte validée. Combattants et camps prévenus. | plus court |
| Tu t’engages : Belkacem aura un adversaire du top 3 avant l’été. | Engagement pris : un adversaire du top 3 pour Belkacem avant l’été. | même tournure que la fiche |

### Messages (48)

| Avant | Après | Pourquoi |
|---|---|---|
| Lille, c’est dans 35 jours. Nana contre Mezouar et Rachidi contre Meziane sont prêts. Belkacem n’a pas encore d’adversaire, et le quatrième combat reste à construire. Tant que l’affiche n’est pas complète, la presse n’en parle pas. | Lille, c’est dans 35 jours. Nana–Mezouar et Rachidi–Meziane sont prêts. Belkacem attend un adversaire, et le 4e combat reste à faire. Tant que la carte n’est pas complète, la presse n’en parle pas. | paroles de Leïla, plus courtes |
| La carte principale · | Carte principale · | sans article |
| Ils attendent un combat | En attente d’un combat | étiquette sans pronom |
| Les idées de Leïla, data-msidees | Idées de Leïla, data-msidees | même mot que la case |
| Paolo s’est tordu la cheville gauche à l’entraînement. Ce n’est pas grave, et il n’est pas à l’affiche du 16 février. | Paolo s’est tordu la cheville gauche à l’entraînement. Rien de grave, et il n’est pas à l’affiche du 16 février. | plus court |
| Repos, kiné trois fois par semaine | Repos, kiné 3 fois par semaine | chiffres |
| Split atteint le palier « Diffusion nationale » : une chaîne nationale peut désormais retransmettre tes grandes soirées. | Split atteint le palier « Diffusion nationale ». Une chaîne nationale peut retransmettre les grandes soirées. | une idée par phrase |
| Une sur trois → | 1 sur 3 → | chiffres |
| Ce que demandent les agents | Demandes des agents | étiquette |
| 68 %, ton record | 68 %, record actuel | sans possessif |
| Le meilleur : …, n° … | Meilleur : …, n° … | même forme que l’Accueil |
| Cage Hebdo te consacre sa une cette semaine. | Cage Hebdo te consacre sa une. | plus court |
| Ce qu’écrit Cage Hebdo | Article | étiquette |
| Le ton de l’article | Ton de l’article | sans article |
| Ce qu’en disent les autres | Autres avis | étiquette |
| Là où l’effectif est le plus faible | Catégories les plus faibles | étiquette (2 endroits) |
| Un voyage, selon sa durée | Durée du voyage | étiquette (2 endroits) |
| Pendant le voyage, il n’est pas joignable. | Injoignable pendant le voyage. | plus court (3 endroits) |
| Il reste un combat à Jens. Il se plaît chez Split, mais d’autres organisations l’ont contacté. Voici sa demande pour prolonger. | Il reste 1 combat à Jens. Il se plaît chez Split, mais d’autres organisations l’ont contacté. Voici sa demande. | chiffres, plus court |
| Ils l’ont contacté | Contacté par | étiquette |
| Son agent | Agent | sans possessif |
| 1, bonus de la soirée | 1, prime de soirée | même mot que la fiche (« Primes de soirée ») |
| Écran Contrats, hors de cette maquette. | Négociation hors de cette maquette. | « Contrats » n’existe plus |
| Elle | Challenger | étiquette sans pronom |
| La championne | Championne | sans article |
| C’est noté sur sa fiche, dans « Ses demandes » | Noté sur sa fiche, dans « Ses demandes » | même texte que la réponse |
| Ce que Gérard Vasseur attend de ta saison | Gérard Vasseur fixe tes objectifs 2027 | même texte que le Calendrier |
| 2e, des 8 organisations | 2/8, place | rang parmi les huit, comme l’Arrivée |
| Par où commencer | Priorités | sans tutoriel, même mot que l’Accueil |
| Ce message attend ta décision. Le supprimer quand même ? | Décision en attente. Supprimer quand même ? | plus court |
| Supprimer ce message laisse les choses en l’état. | Rien ne change si tu le supprimes. | plus court |
| Impossible de continuer : … Choisis quoi faire. | Impossible de continuer : … Réponds au message. | dit quoi faire |
| Sofiane Belkacem est blessé et il est à l’affiche. | Sofiane Belkacem est blessé et à l’affiche. | plus court |
| est blessé, et il est à l’affiche | est blessé et à l’affiche | plus court, même texte que l’alerte |
| six points de suture | 6 points de suture | chiffres |
| Coupure à l’arcade gauche, six points | Coupure à l’arcade gauche, 6 points | chiffres |
| Le risque | Risque | sans article |
| Belkacem reste à l’affiche. Le médecin te répond le 5 février. | Belkacem reste à l’affiche. Avis du médecin le 5 février. | plus court |
| Le médecin · … | Médecin · … | fonction seule |
| Le temps s’arrête, … : message important du médecin. | Message important du médecin, …. | même forme que l’Accueil |
| ton adjointe | adjointe | fonction seule (2 endroits) |
| ton recruteur | recruteur | fonction seule (3 endroits) |
| n° 4 Split · | n° 4 chez Split · | forme majoritaire (« n° 1 chez Split »), partout |
| n° 8 Split · | n° 8 chez Split · | idem |
| Il peut combattre | Retour possible | étiquette sans pronom (la date ne change pas) |
| Ce qu’il regarde en premier | Priorité | étiquette |
| Il a fondé Split, En 2004 | Fondateur de Split, 2004 | étiquette |
| Ce qu’il surveille | Chiffres suivis | étiquette |

### Classements (32)

| Avant | Après | Pourquoi |
|---|---|---|
| Le plus de finitions | Finitions | étiquette sans article |
| Le plus gros volume | Volume | étiquette sans article |
| Le plus précis | Précision | étiquette sans article |
| La meilleure défense | Défense | étiquette sans article |
| Le lutteur | Amenées au sol | étiquette, le fait mesuré |
| Le mur | Défense de lutte | étiquette sans image |
| Le chasseur de soumission | Soumissions | étiquette sans image |
| La plus longue série | Plus longue série | sans article |
| Victoires de suite, sur toute sa carrière | Victoires de suite, en carrière | plus court |
| Les 30 meilleur… …, toutes catégories, d’après leur rang mondial | Top 30 … | plus court |
| Classement mondial · les 30 premiers | Classement mondial · top 30 | plus court |
| Le KO le plus rapide | KO le plus rapide | sans article |
| Record encore en cours | Record en cours | plus court |
| Le plus jeune champion | Plus jeune champion | sans article |
| Spectateurs, la salle la plus pleine | Spectateurs en une soirée | plus court |
| La plus grosse recette | Plus grosse recette | sans article |
| Téléspectateurs, le record | Téléspectateurs en une soirée | même forme que les spectateurs |
| Cinquième défense, puis la retraite | 5e défense, puis la retraite | chiffres |
| Son club forme des lutteurs. Deux de ses élèves cherchent une organisation. | Son club forme des lutteurs. 2 de ses élèves cherchent une organisation. | chiffres |
| Voir ses deux élèves | Voir ses 2 élèves | chiffres |
| Deux de ses élèves invaincus chez les amateurs, à 6-0 et 5-0. | 2 de ses élèves invaincus chez les amateurs, à 6-0 et 5-0. | chiffres |
| Un bon combat bien raconté attire plus de spectateurs à la soirée suivante. | *(retiré)* | explique une mécanique (T5, H5) |
| Il regrette deux décisions serrées à Split Fight Night 61. | Il regrette 2 décisions serrées à Split Fight Night 61. | chiffres |
| Il représente quatre combattants, dont Sofiane Belkacem | Il représente 4 combattants, dont Sofiane Belkacem | chiffres |
| Il cherche un deuxième entraîneur de lutte. | Il cherche un 2e entraîneur de lutte. | chiffres |
| Ces dernières semaines | Dernières semaines | sans déterminant |
| Ses records chez Split / Son record chez Split | Records chez Split / Record chez Split | sans possessif |
| Son meilleur classement | Meilleur classement | sans possessif |
| Le KO le plus rapide de Split | KO le plus rapide de Split | sans article |
| Sa carrière | Carrière | sans possessif |
| Ce qu’… pense de … | Avis sur … | étiquette courte |
| Son contrat | Contrat | sans possessif |

### Ceintures (5)

| Avant | Après | Pourquoi |
|---|---|---|
| La lignée | Lignée | sans article |
| Le prochain défi | Prochain défi | sans article |
| fait1= Leur dernier combat | fait1= Dernier affrontement | sans possessif (2 endroits) |
| Derrière lui / Derrière elle | Prétendants | étiquette sans pronom |
| variable « qui » (elle / lui) | retirée, plus utilisée | variable devenue inutile |

### Recrutement (30)

| Avant | Après | Pourquoi |
|---|---|---|
| Une chance au titre s’il gagne ses deux premiers combats | Une chance au titre s’il gagne ses 2 premiers combats | chiffres |
| Au moins trois combats par an | Au moins 3 combats par an | chiffres (2 endroits) |
| Pouvoir partir s’il reste six mois sans combat | Pouvoir partir s’il reste 6 mois sans combat | chiffres |
| Le voyage et l’hôtel pour trois personnes de son équipe | Le voyage et l’hôtel pour 3 personnes de son équipe | chiffres (2 endroits) |
| Combattre souvent : quatre combats par an | Combattre souvent : 4 combats par an | chiffres |
| Une chance au titre avant la fin 2028 | Une chance au titre avant fin 2028 | même texte que l’autre demande |
| Pro depuis deux ans, personne ne l’a encore signé | Pro depuis 2 ans, jamais signé | chiffres, plus court |
| Pure Impact ne l’a pas prolongé après deux défaites. | Pure Impact ne l’a pas prolongé après 2 défaites. | chiffres |
| Il n’aime pas qu’on le mette dos à la cage : c’est là qu’on le bat. | Son point faible : dos à la cage. | plus court |
| Ton recruteur y va | Recruteur en route | sans possessif |
| Ton recruteur part le voir. Rapport vers le | Recruteur en route. Rapport vers le | sans possessif (2 endroits) |
| Personne dans cette catégorie pour l’instant. | Personne dans cette catégorie. | état vide simple |
| On connaît son palmarès et ses combats. Ses statistiques et son style se sauront à la signature, ou quand ton recruteur l’aura vu. | Palmarès et combats connus. Statistiques et style après le rapport du recruteur, ou à la signature. | plus court |
| Dernier combat de son contrat chez …. Tu peux trouver un accord maintenant : … signera chez Split après. | Dernier combat du contrat chez …. Accord possible maintenant : … signera chez Split ensuite. | plus court |
| Ton recruteur part voir … …. Son rapport arrivera dans tes messages vers le | Marco Ferri part voir … …. Rapport dans les Messages vers le | son nom dans une phrase |
| Rapport de ton recruteur, … | Rapport du recruteur, … | sans possessif |
| demande: Il demande | demande: Demande | étiquette sans pronom |
| Il demande | Demande | étiquette sans pronom |
| Où vous en êtes | Négociation | étiquette |
| … | … | plus court |
| Ce qu’il demande | Sa demande | plus court |
| Ce qu’il demande | Demande | étiquette sans pronom |
| Tu t’engages : $ | Engagements : $ | même mot que la fiche |
| Mettre dans ton offre ce qu’il veut | Reprendre ses chiffres dans l’offre | plus court |
| La prime de signature est versée tout de suite. | Prime de signature versée aujourd’hui. | plus court |
| Tes offres | Offres | sans possessif |
| Il veut Tu proposais | Demande Offre | étiquettes sans pronom |
| La discussion | Discussion | sans article |
| Sa situation | Situation | sans possessif |
| En attente de ton offre | En attente d’une offre | sans possessif |

### Recruteur (18)

| Avant | Après | Pourquoi |
|---|---|---|
| Ton recruteur l’a vu… à … le …. | Vu… par Marco Ferri à … le …. | son nom, sans possessif |
| Ce qu’il coûte | Coût | étiquette |
| Ce qu’il va chercher | Spécialités | même mot que la liste des destinations |
| Le rapport de Marco : … profils | Rapport de Marco Ferri : … profils | sans article, chiffres |
| Ce qu’il recommande · | Recommandés · | étiquette |
| Son avis Il demande | Avis Demande | sans possessif, même mot que Recrutement |
| Son message de départ est dans tes messages. | Message de départ dans les Messages. | sans possessif |
| Le temps s’arrête, … : Marco est rentré …. | Marco Ferri est rentré …, …. | même forme que les autres arrêts |
| Ce qu’on y trouve | Spécialités | même mot que la liste |
| Son message de départ | Message de départ | sans possessif |
| Combien de temps sur place | Durée sur place | étiquette |
| Son bilan, année par année | Bilan par année | sans possessif |
| Faire encore deux ou trois combats | Faire encore 2 ou 3 combats | chiffres |
| Son rapport arrivera le …. | Rapport le …. | plus court |
| Ses rapports | Rapports | sans possessif |
| Sa carrière | Carrière | sans possessif |
| Son entourage | Entourage | sans possessif |
| Ses objectifs | Objectifs | sans possessif |

### Camps (6)

| Avant | Après | Pourquoi |
|---|---|---|
| … · … de tes combattants | … · … combattants de Split | sans possessif |
| s.split.length\|\|—, de tes combattants | s.split.length\|\|—, combattants de Split | sans possessif, même texte que la liste |
| Il entraîne seul : pas d’adjoint dans la salle. | Pas d’adjoint dans la salle. | une idée |
| Tes combattants ici | Combattants de Split | sans possessif |
| Le monde (filtre) | Monde | sans article, même mot que les Classements |
| Tes combattants | Chez Split | sans possessif, court pour la case |

### Finances (4)

| Avant | Après | Pourquoi |
|---|---|---|
| La caisse · Les bourses · Les primes (onglets) | Caisse · Bourses · Primes | onglets sans article |
| Le solde, depuis janvier 2026 · la meilleure soirée : la … | Solde, depuis janvier 2026 · meilleure soirée : la … | sans article |
| La plus haute | Plus haute | sans article |
| Bourses les plus hautes | Plus hautes bourses | plus court |

### Primes (9)

| Avant | Après | Pourquoi |
|---|---|---|
| Ecart, L’écart | Ecart, Écart | sans article |
| Il te serait resté / Il t’est resté | Reste, à ces montants / Reste | même mot que la Caisse (« Reste ») |
| set pmNetL, Il te serait resté / Il t’est resté | set pmNetL, Reste, à ces montants / Reste | idem, mise à jour en direct |
| À venir, rien n’est encore versé | À venir, rien de versé | plus court |
| Il est resté / Il serait resté (colonne) | Reste | même mot partout ; « À ces montants » est la colonne voisine |
| Les combattants, pmRelire | Combattants, pmRelire | sans article |
| À ces montants, plus personne ne s’en plaindrait. | À ces montants, plus aucune plainte. | plus court |
| Ce qu’ils disaient / Ce qu’ils pourraient dire / Ce qu’ils ont dit | Réactions d’avant / Réactions possibles / Réactions | étiquettes courtes |
| Les montants | Montants | sans article |

### Organisation (19)

| Avant | Après | Pourquoi |
|---|---|---|
| A signé en décembre trois combattants classés qui venaient de Fighting Pacific. | A signé en décembre 3 combattants classés venus de Fighting Pacific. | chiffres |
| et trois combattants classés partis chez Pure Impact. | et 3 combattants classés partis chez Pure Impact. | chiffres |
| Finir la saison 4e ou mieux | 4/8 ou mieux en fin de saison | rang parmi les huit, même texte que les défis de Ta carrière |
| sur les sept soirées de 2026 | sur les 7 soirées de 2026 | chiffres |
| Diffusé dans huit pays d’Europe | Diffusé dans 8 pays d’Europe | chiffres |
| Un deuxième recruteur | Un 2e recruteur | chiffres |
| deux voyages en même temps | 2 voyages en même temps | chiffres |
| Les salles | Salles | sans article |
| Le diffuseur | Diffuseur | sans article |
| Le recruteur | Recruteur | sans article |
| Les agents libres | Agents libres | sans article |
| Les partenaires | Partenaires | sans article |
| Le recruteur | Recruteur | lien sans article |
| la plus proche | plus proche | sans article |
| Tu es ici | Aujourd’hui | étiquette sans pronom |
| Ce que ça donne | À la clé | étiquette courte |
| Les soirées | Soirées | lien sans article |
| La caisse | Caisse | lien sans article, nom de l’onglet (2 endroits) |
| Le recrutement | Recrutement | lien sans article |

### Carrière (20)

| Avant | Après | Pourquoi |
|---|---|---|
| La carte | Carte | lien sans article |
| Ta première soirée | Première soirée | sans possessif |
| Une finition dans ta soirée | Une finition dans la soirée | sans possessif |
| tu fixes son montant avant la soirée | montant fixé dans les Finances | sans tutoriel |
| Le recrutement | Recrutement | lien sans article |
| Un rapport de ton recruteur, , Le recruteur | Un rapport du recruteur, , Recruteur | sans possessif |
| après ta soirée | après la soirée | sans possessif |
| n:1, Tes débuts | n:1, Débuts | nom de palier sans possessif |
| Les grandes soirées | Grandes soirées | sans article |
| Les ceintures | Ceintures | sans article |
| Le sommet | Sommet | sans article |
| elle se fait soirée après soirée | aucune soirée jouée | le fait, sans image |
| 6e / 4e · n° 8 / n° 5 | 6/8 · n° 8 | rang « 6/8 » ; la cible n’est plus répétée : elle est dans le libellé (« top 4 ») et les octogones |
| Arrivée chez Split, Leïla t’accueille | Arrivée chez Split | une idée |
| Ton parcours | Parcours | sans possessif |
| Split avant toi | Split depuis 2004 | étiquette sans pronom |
| data-resultats>Les soirées › | data-resultats>Soirées › | lien sans article |
| depuis 2004, sous ton prédécesseur | sous ton prédécesseur | « depuis 2004 » passe dans le titre |
| Tes défis | Défis | sans possessif |
| s’ouvre quand le palier … est fini / … sur … · le palier … s’ouvre quand celui-ci est fini | après le palier … / …/… · palier … ensuite | chiffres, sans tutoriel |

### Calendrier (17)

| Avant | Après | Pourquoi |
|---|---|---|
| Le message | Message | lien sans article |
| une soirée se pose au moins 10 semaines avant, le temps de vendre l | une soirée se pose 10 semaines avant au moins, le temps de vendre l | même tournure que la règle des 3 semaines |
| il faut 3 semaines au moins entre deux soirées. | il faut 3 semaines au moins entre 2 soirées. | chiffres |
| Ton arrivée chez Split | Arrivée chez Split | même texte que Ta carrière |
| Ta soirée | Soirée de Split | légende sans possessif |
| Un rendez-vous | Rendez-vous | légende sans article |
| Un rendez-vous (jour survolé) | Rendez-vous | même mot que la légende |
| Les six mois d’avant / Les six mois d’après | 6 mois avant / 6 mois après | chiffres, plus court |
| la prochaine … | prochaine … | sans article |
| Elle se compose une fois la soirée du … jouée. / Elle se compose dans l’écran Carte. | Carte à composer après la soirée du …. / Carte à composer. | le fait, sans renvoi d’écran |
| Une ceinture au moins doit y être en jeu. | Au moins 1 ceinture en jeu. | chiffres, plus court |
| Ce qu’il reste | Reste | même mot que la Caisse (2 endroits) |
| La soirée › | Soirée › | lien sans article (3 endroits) |
| Les résultats › | Résultats › | lien sans article (2 endroits) |
| ton record · | record de Split · | sans possessif |
| L’enjeu | Enjeu | sans article (2 endroits) |
| La ceinture | Ceinture | sans article |

### Résultats (16)

| Avant | Après | Pourquoi |
|---|---|---|
| deux juges sur trois | 2 juges sur 3 | chiffres |
| Les soirées | Soirées | sans article |
| L’enjeu | Enjeu | sans article |
| Le récit | Récit | sans article |
| La ceinture | Ceinture | sans article |
| La finition | Finition | sans article |
| Le combat de la soirée, Trois rounds à fond | Combat de la soirée, 3 rounds à fond | sans article, chiffres |
| sur deux cartes sur trois. 43 frappes contre 41, le Forum debout. | sur 2 cartes sur 3. 43 frappes contre 41. | chiffres, sans image |
| Le classement | Classement | sans article |
| On en parle | Réactions | étiquette sans pronom |
| Dans les vestiaires | Vestiaires | plus court |
| La soirée | Soirée | sans article |
| Le public | Public | sans article |
| Ce qu’il te reste | Reste | même mot que la Caisse |
| La popularité de Split | Popularité de Split | sans article |
| Le lendemain | Lendemain | onglet sans article |

### Presse (14)

| Avant | Après | Pourquoi |
|---|---|---|
| Ta soirée, Tes combattants | Soirée, Combattants | filtres sans possessif |
| Leur combat de 2025 | Combat de 2025 | sans possessif (l’année ne change pas) |
| Rachidi, cinq victoires de suite | Rachidi, 5 victoires de suite | titre de presse en chiffres |
| Cinq victoires de suite, dont trois avant la limite | 5 victoires de suite, dont 3 avant la limite | chiffres |
| Darras, trois rounds sur quinze | Darras, 3 rounds sur 15 | titre de presse en chiffres |
| Trois rounds sur quinze sur les cartes des juges | 3 rounds sur 15 sur les cartes des juges | chiffres |
| Tes combattants dans la presse | Combattants de Split dans la presse | sans possessif |
| Les trois médias | Médias | sans article |
| Les pronostics | Pronostics | sans article |
| Les défis | Défis | sans article |
| Le public réclame | Demande du public | étiquette de même longueur (la plus longue poussait le bas du panneau) |
| Ta carte du 16 février | Carte du 16 février | sans possessif |
| Le sujet | Sujet | lien sans article |
| sur ta soirée, sur tes combattants | sur la soirée du 16 février, sur les combattants de Split | état vide sans possessif |

### Arrivée (19)

| Avant | Après | Pourquoi |
|---|---|---|
| Cinq victoires sur sept par soumission, Cinq victoires de suite | 5 victoires sur 7 par soumission, 5 victoires de suite | chiffres, même texte que l’Accueil |
| Ce que tu signes, et ce que Gérard Vasseur attend de ta saison. | Contrat et objectifs 2027. | sous-titre court |
| un des six ci-dessous | parmi les 6 ci-dessous | chiffres |
| Choisis-en deux. Leïla te donnera de leurs nouvelles chaque semaine. | Choisis-en 2. Leïla donne de leurs nouvelles chaque semaine. | chiffres, plus court |
| Ta première soirée | Première soirée | sans possessif |
| Ton équipe | Équipe | sans possessif |
| Marco Ferri, Ton recruteur | Marco Ferri, Recruteur | fonction seule |
| Dr Hélène Roux, Le médecin de Split | Dr Hélène Roux, Médecin de Split | fonction seule |
| Il veut | Cible | étiquette sans pronom, mot de la fin de saison |
| Ce qui manque | Reste à faire | étiquette |
| Ce qu’il attend de ta saison | Objectifs 2027 | même titre que Ta carrière et Messages |
| ceinture mise en jeu : … sur … | ceinture mise en jeu : …/… | chiffres |
| Durée, Une saison | Durée, 1 saison | chiffres, comme Ta carrière (2 endroits) |
| Ce que Gérard Vasseur attend de ta saison | Gérard Vasseur fixe tes objectifs 2027 | même titre partout |
| Tes deux espoirs<span | 2 espoirs<span | chiffres, sans possessif |
| PP_MSGS 2 .Tes deux espoirs : | PP_MSGS 2 .2 espoirs : | idem |
| Quatre absents au 4 janvier<span | 4 absents au 4 janvier<span | chiffres |
| Le médecin · aujourd’hui · Rizzo revient le 2 février | Médecin · aujourd’hui · Rizzo revient le 2 février | fonction seule |
| Deux espoirs au plus : | 2 espoirs au plus : | chiffres |

### Présentation (3)

| Avant | Après | Pourquoi |
|---|---|---|
| … | … | sans article |
| Les chiffres | Chiffres | sans article |
| le meilleur | meilleur | légende sans article |

### Pesée (3)

| Avant | Après | Pourquoi |
|---|---|---|
| La pesée (titre de l’écran) | Pesée | titre sans article, comme les autres écrans |
| Quinze secondes sans un geste. | 15 secondes sans un geste. | chiffres |
| La carte de la soirée | Carte de la soirée | sans article |

### Soirée (24)

| Avant | Après | Pourquoi |
|---|---|---|
| Le plan, c’était de l’emmener dans les rounds de championnat. Au 3e, il me touche beaucoup, je le sens. Au 4e, il laisse une ouverture en se relevant : je passe dans le dos et je ne lâche plus. | Le plan, c’était les rounds de championnat. Au 3e, il me touche beaucoup. Au 4e, il se relève mal : je prends le dos et je ne lâche plus. | paroles plus courtes |
| Oui. Je prends le premier et le dernier round, et je touche plus sur l’ensemble. Mais c’était serré, je ne vais pas dire le contraire : | Oui. Je prends le premier et le dernier round, et je touche plus. Mais c’était serré : | paroles plus courtes |
| Le regarder en (accessibilité) | Voir en | étiquette courte |
| La carte, Le regarder en | Carte, Voir en | sans article |
| La salle | Salle | sans article |
| L’ambiance | Ambiance | sans article |
| L’ambiance | Ambiance | sans article |
| Moment … sur … | Moment …/… | chiffres |
| Les trois juges donnent la victoire à | Les 3 juges donnent la victoire à | chiffres, comme les Résultats |
| les trois juges, round par round vide : non noté | les 3 juges, round par round vide : non noté | chiffres |
| Le combat en chiffres | Combat en chiffres | sans article |
| Les juges | Juges | sans article |
| Ce que ça change | Changements | même mot que Messages |
| Ce qu’il gagne / Ce qu’elle gagne | Progression | étiquette sans pronom ; le panneau ne montre que le vainqueur |
| en direct : la presse reprendra le défi. | en direct. | sans annonce de mécanique (H5) |
| Ce qu’il te reste | Reste | même mot que la Caisse |
| Les vainqueurs, … l’arène … le récit | Vainqueurs, … arène … récit | sans article |
| Les primes | Primes | sans article |
| data-finances>Les finances › | data-finances>Finances › | lien sans article |
| L’arène › | Arène › | lien sans article |
| Le bilan · Le résultat (bouton) | Bilan · Résultat | bouton sans article |
| Le discours (bouton) | Discours | bouton sans article |
| return Le lendemain | return Lendemain | bouton sans article, nom de l’onglet des Résultats |
| … le meilleur · durée | … meilleur · durée | légende sans article, comme le face-à-face |

### Options (41)

| Avant | Après | Pourquoi |
|---|---|---|
| Le combat · L’affichage · Le son · La soirée · Les touches · La partie · L’aide | Combat · Affichage · Son · Soirée · Touches · Partie · Aide | titres sans article |
| Les touches | Touches | sans article |
| La vitesse du combat quand il commence. Tu peux la changer pendant le combat. | Vitesse au début du combat, modifiable ensuite. | une idée |
| Ce que crient les deux coins pendant le combat. | Les consignes criées par les 2 coins. | chiffres, plus court |
| L’image tremble sur les gros coups. À couper si ça te gêne. | L’image tremble sur les gros coups. | sans conseil |
| La salle | Salle | sans article |
| Les coups | Coups | sans article |
| La soirée · L’argent · Les repères (familles de l’aide) | Soirée · Argent · Repères | familles sans article |
| La carte | Carte | sans article |
| Les rounds | Rounds | sans article |
| Les juges | Juges | sans article |
| Les fins de combat | Fins de combat | sans article |
| Les termes du combat | Termes du combat | sans article |
| Le discours | Discours | sans article |
| Les contrats | Contrats | sans article |
| La négociation | Négociation | sans article |
| Le recruteur | Recruteur | sans article |
| Les camps | Camps | sans article |
| Le découvert | Découvert | sans article |
| Les primes | Primes | sans article |
| Les huit organisations | 8 organisations | chiffres, sans article |
| La croissance | Croissance | sans article |
| Les objectifs | Objectifs | sans article |
| Le calendrier | Calendrier | sans article |
| Les ceintures | Ceintures | sans article |
| Les couleurs | Couleurs | sans article |
| Les marques | Marques | sans article |
| Les médailles | Médailles | sans article |
| Sans finition, trois juges décident. Chacun note chaque round sur 10 : le gagnant du round reçoit 10 points, le perdant 9 ou moins. | Sans finition, 3 juges décident. Chacun note chaque round sur 10 : 10 au gagnant, 9 ou moins au perdant. | chiffres, plus court |
| les trois juges donnent le même vainqueur | les 3 juges donnent le même vainqueur | chiffres |
| deux juges pour lui, un pour l’autre | 2 juges pour lui, 1 pour l’autre | chiffres |
| deux juges pour lui, le troisième à égalité | 2 juges pour lui, le 3e à égalité | chiffres |
| Chaque combat se regarde de trois façons. | Chaque combat se regarde de 3 façons. | chiffres |
| Le vainqueur prend la parole dans trois cas | Le vainqueur prend la parole dans 3 cas | chiffres |
| la recette nette des deux dernières soirées | la recette nette des 2 dernières soirées | chiffres |
| Le rang additionne les places sur quatre mesures | Le rang additionne les places sur 4 mesures | chiffres |
| Ton patron fixe les objectifs de la saison | Gérard Vasseur fixe les objectifs de la saison | son nom, jamais « le patron » ; la suite (seuil) n’est pas touchée |
| Entre deux soirées | Entre 2 soirées | chiffres |
| Revoir mon arrivée | Revoir l’arrivée | sans possessif |
| L’écran de ton arrivée : l’organisation, ce que tu hérites, la première soirée. | L’organisation, ce que tu hérites, la première soirée. | plus court |
| Ouvre les trois emplacements. | Ouvre les 3 emplacements. | chiffres |

### Menu (12)

| Avant | Après | Pourquoi |
|---|---|---|
| Au milieu. Ni la plus grosse organisation, ni la plus mauvaise. | Au milieu des huit : ni la plus grosse, ni la plus petite. | sans jugement |
| On y vient pour l’argent et pour la lumière. | Les plus grosses bourses. | sans image |
| Une petite maison sérieuse, où les champions apprennent avant de partir. | Petite et sérieuse : on y forme des champions, qui partent ensuite. | sans image |
| La jeune organisation de l’autre bout du monde, qui mise tout sur ses espoirs. | La plus jeune des huit, qui mise sur ses espoirs. | le fait (fondée en 2020) |
| La maison des meilleures combattantes du monde. | Les meilleures combattantes du monde. | sans image |
| Les poids lourds les plus durs du monde, et des catégories qui se cherchent. | Les meilleurs poids lourds du monde les autres catégories sont plus faibles. | sans image |
| L’affichage, le son, les touches | Affichage, touches | sans article |
| Les trois emplacements sont pris. | Les 3 emplacements sont pris. | chiffres |
| Six ans avant ton arrivée< | 6 ans avant ton arrivée< | chiffres |
| aria-Les six ans | aria-6 ans | chiffres |
| Six ans sont écrits · Six ans avant ton arrivée | 6 ans écrits · 6 ans avant ton arrivée | chiffres, plus court |
| 6e, 1re, 8e… (rang de chaque organisation) | 6/8, 1/8, 8/8… | rang parmi les huit, comme le panneau voisin (« Place 6/8 ») |

### Fin de saison (19)

| Avant | Après | Pourquoi |
|---|---|---|
| Avertissements, 1 sur 2 | Avertissements, 1/2 | chiffres |
| Avertissements, 2 sur 2 | Avertissements, 2/2 | chiffres |
| Saison … · la décision de … | Saison … · décision de … | sans article |
| 1er janv. 2028 · ce que Gérard Vasseur attend de toi | 1er janv. 2028 · objectifs de Gérard Vasseur | étiquette courte |
| … sur … objectifs | …/… objectifs | chiffres, comme la liste des saisons |
| Objectifs, … sur …, tenus | Objectifs, …/…, tenus | chiffres |
| Carte, … sur 5 | Carte, …/5 | chiffres |
| Ton champion est indisponible | Champion indisponible | sans possessif |
| Change au moins un combat. | Change au moins 1 combat. | chiffres |
| Tes combattants | Combattants de Split | sans possessif |
| Tes combattants, restent chez Split | Combattants de Split, restent chez Split | sans possessif |
| Finir ma carrière, data-fin | Finir la carrière, data-fin | bouton sans possessif |
| Finir ma carrière | Finir la carrière | idem |
| Les prix | Prix | onglet sans article |
| Les prix (bouton) | Prix | bouton sans article |
| Ce que ça a changé | Changements | même mot que Messages |
| La direction de … | qui:fdCourt o.nom, direction | l’organisation, puis la fonction seule, sans élision fautive (« de Undisputed ») (2 endroits) |
| Le choc | Choc | onglet sans article |
| / Sa fiche, data-fiche= | / Voir la fiche, data-fiche= | bouton verbe d’abord, comme « Voir le combat » à côté |

## 3. Typographie, partout

- **544 espaces insécables** posées dans 26 fichiers : avant « : ; ! ? » et à l'intérieur de « ». C'est l'usage français (l'usage québécois n'en met pas devant ; ! ?). L'espace fine insécable (U+202F) n'est pas utilisée : la police Saira ne la garantit pas.
- « Night 63 » est lié par une espace insécable dans le titre du message de Leïla, pour ne plus laisser « 63 » seul en début de ligne.
- Contrôlé et sans écart : aucune apostrophe droite dans un texte affiché ; tous les mois abrégés sont corrects (janv., févr., avr., juil., sept., oct., nov., déc.).
- Le `split(' :')` de la présentation lit une donnée passée par la même règle : il reste cohérent.

## 4. Cas limites (choix faits, à relire)

- **Noms d'écran, d'onglet et d'étape gardés tels quels**, parce qu'ils servent de repère d'un écran à l'autre et que les noms d'écran restent un choix ouvert : Ton arrivée, Ton contrat, Tes espoirs (Arrivée) ; Les huit, La croissance, Ta carrière, Tes saisons (Organisation) ; À la une, Les défis, Le fil (Presse) ; Les meilleurs (Classements) ; Mes parties (Menu) ; Tes soirées, Avant toi (Résultats). Proposition si tu veux appliquer la règle jusque-là : Arrivée, Contrat, Espoirs ; Organisations, Croissance, Carrière, Saisons ; Une, Défis, Fil ; Meilleurs ; Parties ; Depuis ton arrivée, Avant ton arrivée.
- **Onglets changés**, parce que le nom seul reste clair : Caisse, Bourses, Primes (Finances) ; Lendemain (Résultats) ; titres des Options et familles de l'Aide.
- **Paroles et presse** : les nombres restent en lettres dans les paroles d'un personnage et le corps des articles (« Cinq victoires de suite. Et maintenant ? »), comme à l'oral et dans un journal. Les titres de presse passent en chiffres.
- **« n° 1 chez Split »** est la forme gardée partout ; les deux « n° 4 Split » de Messages s'alignent dessus.
- **Ta carrière, objectifs** : la cible « / 4e » n'est plus répétée à côté de la valeur : elle est déjà dans le libellé (« Finir dans le top 4 ») et dans les octogones. La forme longue « 4/8 ou mieux » ne tenait pas dans la case.
- **Classements › Les meilleurs** : « Le mur », « Le lutteur », « Le chasseur de soumission » deviennent ce qu'ils mesurent (Défense de lutte, Amenées au sol, Soumissions).
- **Textes retirés** parce qu'ils expliquaient une mécanique (T5, charte H5) : « Un bon combat bien raconté attire plus de spectateurs à la soirée suivante » (fiche de Yacine Ferhat), « la presse reprendra le défi » (discours de Rachidi), « À couper si ça te gêne » (Options).
- **Textes inventés réécrits**, toujours à relire : descriptions des huit organisations (Nouvelle partie), traits de Nana, style des combattants, réponses de Mezouar et Rachidi, message de Leïla sur la carte.
- **« Pesée le 15 février »** remplace « Continue jusqu'à la semaine du combat » : la pesée a lieu la veille de la soirée (écran validé le 22/11).
- **Médecin** : dans une phrase, son nom (« Dr Hélène Roux conseille 3 mois sans sparring dur… ») ; dans une ligne « auteur · date », la fonction seule (« Médecin · hier »).

## 5. Points ouverts, non touchés

Rien n'a changé sur : Split 6e ou 2e (« Rester dans le top 2 » reste, seul « 2e » devient « 2/8 ») ; le seuil des objectifs manqués (« Manqués au 31 déc. : un avertissement… » inchangé) ; la 56 ; 4 000 ou 4 200 places ; les soirées le mardi ; « qu'il avait battu en 2025 » et tout le récit de 2025 ; les champions de 22-23 ans face au record de Kovač ; défenses et durée du règne dans le Classement ; le message des 46 % à Lille, Rizzo « 23 mars », les dates de Mezouar ; les noms des médias (Q10c) ; les objectifs de l'Accueil face à Ta carrière ; les combats pour un titre hors combat principal ; l'accompagnement de Leïla dans les Options (texte inchangé) ; primes, cumul, onglet Contrat ; poids manqué ; les 22 familles d'événements ; Leïla sans écran ; le choix de l'organisation à la création ; « À venir » en jaune ; la caisse 50 000 € / 952 200 € ; les noms des titres de la barre ; fin de contrat et Recrutement ; composition et recette du choc ; Gérard Vasseur ou Jean-Michel Delatour.

**À trancher, trouvé pendant la relecture :**

1. **Blessure de Rizzo** : l'Infirmerie dit « Élongation à la cuisse droite », le message du médecin « Entorse de la cheville gauche ». Un même fait, deux textes : non corrigé, c'est un fait à choisir.
2. **Patron dans l'aide des Options** : « Ton patron fixe les objectifs… » devient « Gérard Vasseur fixe les objectifs… », comme partout dans la maquette. Si le patron devient Jean-Michel Delatour, ce texte suit.
3. **Noms d'écran à possessif** (section 4) : les garder, ou appliquer la règle jusqu'aux onglets.

## 6. Vérification

- **Relevé automatique** : 10 099 chaînes lues dans les 27 fichiers (script sur l'arbre syntaxique : chaînes et gabarits).
- **430 remplacements** sur 459 endroits, appliqués par script depuis la version de `main` : une ligne introuvable bloque tout. Syntaxe des 27 fichiers vérifiée (`node --check`).
- **101 états** capturés avant et après, à 1920 × 1080 et 1280 × 720, dans un Chrome sans profil, un contexte neuf par état (aucune sauvegarde touchée) : chaque écran, onglet, message, confirmation, refus et état vide.
- **Console** : 0 erreur, avant comme après.
- **Débordements** : mêmes comptes qu'avant partout, sauf des lignes de Messages qui remontent sous le pli d'une liste défilante (texte plus court) : vérifié à l'œil, rien n'est coupé. Deux vraies régressions trouvées puis corrigées : la cible des objectifs de Ta carrière, et « Demandé par le public » (Presse), ramené à « Demande du public ».
- **Constaté, sans lien avec ce passage** : dans le résumé « Valider la carte », les noms des préliminaires n'apparaissent pas à la capture (seules les catégories), avant comme après.
- `?v=` monté pour les 26 fichiers modifiés. `mouvement.js` et toutes les feuilles de style sont inchangés.

## 7. Sources

- [FM27 : Clearer Interface & Smoother Navigation](https://www.footballmanager.com/node/1099) (Sports Interactive) : entrées renommées d'après le métier du manager ; l'information posée dans le message plutôt que derrière un clic ; doublons regroupés.
- [FM26 : l'interface réinventée](https://www.footballmanager.com/fr/features/football-total-controle-total-linterface-utilisateur-reinventee-de-fm26) (Sports Interactive) : efficacité, familiarité, prévisibilité ; filtres en mots courts (Tout, Nouveau, Tâches, Non lus) ; l'essentiel d'abord, le détail en creusant.
- [Elastic UI, Writing guidelines](https://eui.elastic.co/docs/content/writing/guidelines) : pas d'article dans un bouton, verbe + nom, pas d'« Erreur » en tête d'un message, l'information critique en premier.
- [Typographie française (équipe de traduction Debian)](https://www.debian.org/international/french/typographie) : espace insécable avant « : ; ! ? » et à l'intérieur des guillemets « » ; à défaut d'espace fine, « on peut toujours au moins en mettre une » (insécable).
- [OQLF, espacement avant et après les signes de ponctuation](https://vitrinelinguistique.oqlf.gouv.qc.ca/22039/la-typographie/espacement/espacement-avant-et-apres-les-signes-de-ponctuation-et-les-symboles) : même règle pour le deux-points, les unités et le % ; l'usage québécois diffère pour ; ! ? (pas d'espace), d'où le choix de l'usage français.
- Règles internes : `REGLES-MAQUETTES.md` (sections 6, 9, 11, 13), `docs/PLAN-CORRECTIONS-01-11.md` (T5, T6, R10, R11, R29), `docs/CHARTE-INTERFACE-MANAGEMENT.md` (H1 à H5, S7).
