"use strict";
/* ==== [ANCRE: MGMT_LOT5_T2T3_VOIX_DONNEES] — Lot 5 T2 + T3 : les quarante-huit
   voix des combattants (docs/LES-VOIX-DES-COMBATTANTS-v2.md §3), GÉNÉRÉ par
   tools/extraire-voix.js — ne pas éditer à la main : on corrige le document,
   puis on relance l'outil. Les répliques sont celles du document, telles
   quelles, chacune relu:false jusqu'à la relecture d'Anthony (règle
   absolue : les voix sont écrites par Anthony). Emplacements : {adv} {cat}
   {rang} {rang_adv} {mois} {round} {jours} {classe} {pays} {metier}
   {surnom} ; accords [masculin|féminin] du locuteur. ==== */
const MGMT_VOIX=[
 {
  "id": "la-voix-commune",
  "nom": "La voix commune",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Franchement je suis dans la meilleure forme de ma vie, on a fait un gros camp avec l'équipe, {adv} c'est un bon combattant mais samedi vous allez voir la meilleure version de moi.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Camp terminé. Plus que quelques jours. Merci à toute l'équipe.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci à Dieu, merci à mon équipe, merci à {org}, j'avais dit que j'étais [prêt|prête] et voilà, maintenant je veux un classé.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "C'était pas mon soir, bravo à {adv}, je vais revenir plus [fort|forte], c'est tout ce que je peux dire.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Ça fait {mois} mois que j'attends, je suis [prêt|prête], n'importe qui, n'importe quand.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je prends, pas de souci, dis-moi juste la date.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "[Blessé|Blessée] à l'entraînement, je suis [dégoûté|dégoûtée], je reviens vite.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-metronome",
  "nom": "Le métronome",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je m'entraîne. Je combats. C'est tout.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Travail fait. Je rentre.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il était meilleur ce soir. On retravaille.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Je suis disponible. (Une fois.)",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "D'accord. / Non.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "[Blessé|Blessée]. Je reviendrai.",
    "relu": false
   },
   {
    "situation": "la-felure",
    "etiquette": "La fêlure",
    "texte": "Il parle beaucoup. Samedi il va fermer sa gueule.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-metteur-en-scene",
  "nom": "Le metteur en scène",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Bon {adv} mon ami, j'ai appelé ton déménageur, samedi on vide ta place au classement, round deux, gauche au foie, tu rentres en taxi, c'est moi qui paye.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Météo de samedi pour {adv} : couvert en début de soirée, averses au deuxième round, fin de soirée allongée.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, prédiction juste",
    "texte": "Je vous l'avais dit ou pas ?? Round {round}, j'avais même donné l'heure, les gens ils paient pour ça, et moi je livre.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, prédiction fausse",
    "texte": "J'avais dit round deux, j'ai été gentil, il a eu droit à du rab.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition, inconnu",
    "texte": "Tu veux que je fasse un spectacle devant qui, devant ses cousins ?",
    "relu": false
   }
  ]
 },
 {
  "id": "le-fataliste",
  "nom": "Le fataliste",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je respecte {adv}, le résultat c'est Dieu qui décide, moi je fais ma part, je m'entraîne, je dors, je mange, c'est tout.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Dieu merci. Merci à mes parents, à mon coach, à {adv} aussi qui est venu se battre. C'était écrit.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Dieu merci quand même. Aujourd'hui c'était son jour, pas le mien.",
    "relu": false
   },
   {
    "situation": "la-menace-froide",
    "etiquette": "La menace froide",
    "texte": "Parle de moi autant que tu veux. Tu as parlé de ma famille. Samedi on règle ça.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "C'est une épreuve. Ça pouvait être pire.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-contemplatif",
  "nom": "Le contemplatif",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je pense pas à {adv}, je pense à l'instant où la porte se ferme, là il y a plus de passé, plus de classement, juste deux [hommes|femmes] qui ont peur et qui avancent quand même.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Levé avant le soleil. Le bois est froid. Encore six jours.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "La peur était là, je l'ai laissée s'asseoir à côté de moi.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Mon corps était dans la cage, ma tête était déjà à la fin du combat. C'est ma faute.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "L'hiver aussi, c'est une saison.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-sans-filtre",
  "nom": "Le sans-filtre",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Écoute {adv} c'est un mec bien je pense, il paye ses impôts tout ça, mais il boxe comme mon oncle bourré au mariage, et moi j'ai le genou en vrac depuis un mois, je m'en bats les couilles, je vais le finir quand même.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Le matchmaker de {org} m'a mis contre {adv}, soit il m'aime pas soit il a jamais regardé un combat de sa putain de vie, les deux c'est possible.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Voilà ! Je vous avais dit que c'était une connerie de parier contre moi, respect au mec, il m'a mis une droite j'ai vu ma grand-mère, putain j'ai faim.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a défoncé, y a rien à dire, j'étais une merde ce soir, je vais boire un coup et on en reparle lundi.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Ça fait {mois} mois que {org} me paye à rien foutre, remarque je me plains pas, mais je préfère taper des gens.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition, lutteur",
    "texte": "Lui ? Il va me frotter contre le grillage quinze minutes, non merci, je suis pas venu me faire peloter.",
    "relu": false
   }
  ]
 },
 {
  "id": "linterprete",
  "nom": "L'interprété",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "(par son interprète) Il dit qu'il est prêt. Il dit que {adv} sait pourquoi.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Publication en russe, sans traduction. Une photo : une balance, 70,3 kg.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(par son interprète) Il remercie son équipe et son pays. Il a dit aussi quelque chose sur {adv}, je préfère pas traduire.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(par son interprète) Il ne veut pas parler.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "(par son interprète) Il demande pourquoi personne ne dit son nom.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "(par son interprète) Il a dit oui. Enfin, il a dit « quand ».",
    "relu": false
   }
  ]
 },
 {
  "id": "le-plan-de-carriere",
  "nom": "Le plan de carrière",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est {rang_adv} [mondial|mondiale], je suis {rang}, si je gagne je rentre dans le top 10 et cet été je veux le titre, c'est simple.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Étape sept sur dix.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ça repousse tout de six mois. Je reprends le plan.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Chaque mois sans combat c'est un mois perdu, je l'ai calculé, à ce rythme {org} me coûte une ceinture.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Il est derrière moi au classement, ça m'apporte rien. Trouve-moi un classé.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-rescape",
  "nom": "Le rescapé",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Avant je travaillais la nuit sur les chantiers, je dormais quatre heures, alors {adv} avec tout le respect, quinze minutes dans une cage ça me fait pas peur.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Cette bourse elle va chez ma mère. Elle a jamais regardé un de mes combats, mais la bourse elle va la regarder ahah.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai connu pire. Beaucoup pire. Demain je suis à la salle.",
    "relu": false
   },
   {
    "situation": "proposition-a-court-preavis",
    "etiquette": "Proposition à court préavis",
    "texte": "Dans {jours} jours ? Je prends. Je prends toujours.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Le pire c'est pas la blessure, c'est les mois sans paie.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-bon-client",
  "nom": "Le bon client",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Franchement je suis trop content, {adv} je le respecte énormément, ça va être un beau combat pour les gens, venez nombreux ahah.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci à {adv}, il m'a posé des problèmes franchement, au deuxième round j'ai senti sa droite, je lui dis bravo.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "C'est le jeu, il m'a eu sur les entrées, j'ai des choses à travailler. Merci à vous en tout cas.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Si {org} a une place je suis là, sans pression hein ahah.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-reclamant",
  "nom": "Le réclamant",
  "repliques": [
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Jour 187 sans combat. {classe}, ou n'importe qui du top 15, je m'en fous lequel. Personne répond. Bizarre.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Voilà. Maintenant {classe}, arrête de te cacher. {org}, t'as mon numéro.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite, décision",
    "texte": "Je veux la revanche. Tout de suite. Les juges ont vu un autre combat.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite, KO",
    "texte": "Revanche.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Encore un combat pour rien. Vous me faites tourner en rond.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-gros-rieur",
  "nom": "Le gros rieur",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} il est fort, moi je suis gros, on va voir ce qui gagne.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Pesée ratée de 200 grammes. J'ai pissé. C'est bon.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je voulais juste finir vite parce que j'avais envie de chier depuis la pesée. Voilà. Merci {org}.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, question sur sa stratégie",
    "texte": "Ma stratégie c'était de taper. Ça a marché.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a endormi. C'était la meilleure sieste de ma semaine.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Il y a un buffet après ? Alors oui.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Je me suis pété le dos en me levant du canapé. C'est pas une blague. Enfin si, mais c'est vrai.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-bavard-de-la-cage",
  "nom": "Le bavard de la cage",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai hâte de discuter avec {adv}, on s'est jamais vraiment parlé, samedi on aura quinze minutes rien que tous les deux.",
    "relu": false
   },
   {
    "situation": "pendant-le-combat",
    "etiquette": "Pendant le combat",
    "texte": "T'as pas faim ? Moi j'ai faim.",
    "relu": false
   },
   {
    "situation": "pendant-le-combat",
    "etiquette": "Pendant le combat",
    "texte": "Oh pardon. Non en vrai, pas pardon.",
    "relu": false
   },
   {
    "situation": "pendant-le-combat",
    "etiquette": "Pendant le combat, l'adversaire tente une amenée",
    "texte": "Encore ? On a dit pas de lutte aujourd'hui.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Il m'a pas répondu de tout le combat, c'est malpoli franchement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Là il m'a fermé la bouche, je le reconnais, c'est rare.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-mechant-de-catch",
  "nom": "Le méchant de catch",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Mesdames et messieurs, je vais être très clair, {adv} n'est pas un combattant, c'est un figurant, on l'a engagé pour se tenir debout à côté de moi sur l'affiche, et samedi il va même rater ça.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Chère ville de samedi, j'ai vu vos restaurants, j'ai vu vos femmes et vos hommes, et je vous le dis avec amour : vous méritez mieux que {adv}.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Huez-moi. Allez-y. Plus fort. Vous paierez quand même la prochaine fois.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ce soir j'ai combattu {adv}, l'arbitre, les juges, et une intoxication alimentaire que je ne détaillerai pas. Trois contre un.",
    "relu": false
   },
   {
    "situation": "sur-laffiche-dun-autre",
    "etiquette": "Sur l'affiche d'un autre",
    "texte": "Si ces deux-là se battent, moi je paie ma place. Et je paie jamais.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-coeur-ouvert",
  "nom": "Le cœur ouvert",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} il a une coupe de cheveux de prof de géo, je vais lui faire une faveur, je vais lui arranger ça avec les coudes.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci merci, vous êtes des malades, je vous aime tous, même toi là-bas qui m'as insulté à la pesée ahah.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, la rupture",
    "texte": "Attendez. Il y a deux semaines on a enterré un pote. Il parlait à personne. Les gars, si ça va pas dans votre tête, parlez, à n'importe qui, à moi si vous voulez. Je préfère que vous pleuriez sur mon épaule que d'aller à votre enterrement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je suis dégoûté, mais je vais bien, vraiment. On se voit au pub.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-signeur",
  "nom": "Le signeur",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "(en langue des signes) Tout le monde me demande si le bruit du public me manque. Non. Moi j'entends pas {adv} parler. C'est un avantage.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(en langue des signes) Il y a des millions de sourds dans le monde. Ce soir ils ont tous gagné avec moi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, sur la technique",
    "texte": "(en langue des signes) Ses épaules parlent avant ses poings. Je lis les épaules.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(en langue des signes) Il a été meilleur. Je reviens.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "(en langue des signes) Oui. Mais trouvez-moi un bon interprète pour la conférence, le dernier traduisait comme un pied.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-mystique",
  "nom": "Le mystique",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je me suis entraîné avec les chevaux cette année. Pas à côté des chevaux. Avec.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "La lune était pleine hier. {adv} le sait. {adv} a vu.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(par son interprète) Il dit… qu'il remercie la montagne. Je crois. Ou sa mère. C'est le même mot.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Le tigre ne dort pas. Le tigre attend.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Il faut que je demande à mon corps. (Il ferme les yeux longtemps.) Il dit oui.",
    "relu": false
   }
  ]
 },
 {
  "id": "la-mere",
  "nom": "La mère",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Les gens me demandent si c'est dur de reprendre après ma fille. J'ai accouché. Pendant trente heures. {adv} me fait pas peur.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Entraînement à 6 h, crèche à 8 h, sparring à 11 h. Qui c'est qui est [fatigué|fatiguée] ? Pas moi. Enfin si. Mais pas moi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ma fille est dans la salle. Elle a trois ans. Elle se souviendra pas de ce soir, mais un jour je lui montrerai la vidéo.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ce qui me fait mal c'est pas le coup, c'est que mon fils était devant la télé.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Pas ce mois-là. C'est l'anniversaire du petit. Le mois d'après, qui tu veux.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-soldat",
  "nom": "Le soldat",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Objectif identifié. On a étudié {adv} pendant huit semaines, on connaît son terrain, samedi on exécute.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Dernière séance. Le groupe est prêt.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Mission remplie. Je remercie les gars qui étaient avec moi dans le camp, c'est eux qui ont fait le boulot.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai pris une mauvaise décision au deuxième round. C'est moi qui l'ai prise. On corrige.",
    "relu": false
   },
   {
    "situation": "proposition-a-court-preavis",
    "etiquette": "Proposition à court préavis",
    "texte": "J'ai déjà été [appelé|appelée] avec deux heures de préavis pour des choses beaucoup moins drôles. Oui.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-repenti",
  "nom": "Le repenti",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "À vingt ans j'étais en cellule avec un mec qui voulait me planter pour une clope. {adv} franchement, c'est des vacances.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Les petits du quartier qui regardent, je sais que vous regardez, la rue elle vous rendra rien, moi j'ai failli y rester.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu un combat. Avant je perdais des années. Ça va.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Quand je combats pas, je tourne en rond, et quand je tourne en rond je connais la suite. Donnez-moi un combat.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Blessure. Pas de connerie, je suis resté chez moi. Je le précise parce que je sais ce que les gens vont penser.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-quartier",
  "nom": "Le quartier",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Wesh {adv}, t'as vu mes combats ou pas ? Nan parce que si t'as vu, t'aurais refusé frérot. Samedi tu vas manger, sah.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Toute la team au premier rang samedi, ramenez le bruit, on va faire trembler la salle de ouf.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "C'est pour la ville ça ! Pour les grands, pour les petits, pour ma mère qui m'a dit arrête la boxe t'es bête, regarde maman !",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a allumé, je peux rien dire, il m'a allumé. Bon, on rentre, kebab.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Lui ? Frère il a zéro abonné, personne le connaît, même sa mère elle regarde pas ses combats, trouve-moi un vrai nom.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-lutteur-de-fac",
  "nom": "Le lutteur de fac",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} c'est un danseur. Je vais le mettre au sol, m'asseoir dessus, et le noyer pendant quinze minutes. C'est pas beau, c'est efficace.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Six heures de lutte aujourd'hui. Demain sept.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je vous avais dit que c'était pas beau. Vous voulez du beau, allez au ballet.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Mon cardio a lâché au troisième. C'est pas lui, c'est moi. Je retourne courir.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition, frappeur",
    "texte": "Un frappeur ? Parfait. Il va découvrir le sol.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-clan",
  "nom": "Le clan",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Frère, {adv} c'est un bon garçon, je lui souhaite rien de mal. Mais mon père sera au premier rang. Je peux pas perdre devant mon père.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dédie au village. Mon père m'a regardé, il a hoché la tête. Pour moi c'est plus qu'une ceinture.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai fait honte à ma famille ce soir. Je rentre, je parle avec mon père, après on verra.",
    "relu": false
   },
   {
    "situation": "provocation-recue",
    "etiquette": "Provocation reçue",
    "texte": "Frère, tu parles beaucoup. Chez nous ceux qui parlent beaucoup, on les voit plus.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je dois appeler mon père. (Il rappelle dix minutes plus tard.) C'est oui.",
    "relu": false
   }
  ]
 },
 {
  "id": "lenfant-du-pays",
  "nom": "L'enfant du pays",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Samedi c'est pas moi qui entre dans la cage. C'est tout le {pays}. J'ai reçu des messages de gens que je connais même pas.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(il pleure) C'est pour vous, là-bas. Pour les gamins qui s'entraînent sur du béton. Un jour ce sera vous ici.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je demande pardon à mon pays. Je vous ai déçus ce soir.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Au pays on me demande tous les jours quand je combats. Je sais plus quoi leur répondre.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-prophete",
  "nom": "Le prophète",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais le mettre KO au premier round. C'est pas une provocation, c'est une information.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, juste",
    "texte": "Je vous l'avais dit. C'est tout.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, fausse",
    "texte": "J'avais dit premier round. Je me suis trompé. Ça m'arrive pas souvent.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je ne l'avais pas vu. C'est la première fois que je ne vois pas.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-prof",
  "nom": "Le prof",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} a un problème très simple : il baisse la main droite quand il lance le crochet gauche. Samedi on fera une interrogation surprise.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Rappel : le coude est une articulation, pas une option.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Copie rendue. Je lui mets 4 sur 20, mais c'est pour l'encourager.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il connaissait la leçon mieux que moi. Je retourne réviser.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-geek",
  "nom": "Le geek",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} c'est le boss du niveau 3. Moi je suis au niveau 9. Il faut que quelqu'un lui explique qu'il a raté des mises à jour.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Nouvelle attaque spéciale débloquée. Samedi on la teste en ligne.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Combo complet, pas une barre de vie restante, j'ai même pas utilisé mon ultime. Il m'a filé des points d'expérience, merci à lui.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Game over. J'ai pas sauvegardé. Je relance une partie.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Lui ? C'est un mob de début de jeu. Donne-moi un boss.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-violent-heureux",
  "nom": "Le violent heureux",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'espère que {adv} vient pour de vrai. Si on sort pas tous les deux défigurés, les gens ont été volés.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Nez cassé à l'entraînement. Troisième fois. On y va.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Regardez sa tête, regardez la mienne. Ça c'est un combat. Je l'aime ce mec.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite, guerre",
    "texte": "J'ai perdu, mais putain c'était beau. Je signerais pour le refaire demain.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite, décision fade",
    "texte": "Il a couru pendant quinze minutes. Il a gagné. Ça me donne envie de vomir.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-predicateur",
  "nom": "Le prédicateur",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Il y a un enfant quelque part qui regarde ça et qui pense qu'il peut pas. Samedi c'est pour lui. {adv} est un grand combattant, mais moi j'ai une mission.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "4 h 50. Tout le monde dort. Pas moi. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je veux parler aux gamins à la maison : on vous dira que c'est impossible. C'est faux. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Aujourd'hui je suis tombé. Demain je me relève. C'est ça la leçon. On se voit au sommet.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-vieux-de-la-vieille",
  "nom": "Le vieux de la vieille",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Quand j'ai commencé on se battait dans des parkings, le vainqueur repartait avec l'enveloppe et le perdant avec les dents dans la poche. {adv} il est né l'année où j'ai eu mon premier nez cassé.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Le petit il frappe fort, hein. Mais à mon âge on sait où sont les portes.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a sorti. Bravo gamin. Moi je vais aller mettre de la glace partout.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Un jeune ? Envoie. Il faut bien que quelqu'un leur apprenne.",
    "relu": false
   }
  ]
 },
 {
  "id": "laigri",
  "nom": "L'aigri",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je combats pour une bourse qui paye à peine mon camp. Mais c'est pas grave, {org} a besoin de sous pour ses néons.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Soirée de {org} : 4 000 places vendues. Ma bourse : pareil que l'an dernier. Cherchez l'erreur.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'ai gagné. Je vais recevoir une prime qui paiera à peine le taxi. Merci à moi.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite, décision",
    "texte": "Trois juges, zéro yeux. Je fais appel. Je sais que ça sert à rien, je fais appel quand même.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Combien ? (Il ne demande rien d'autre.)",
    "relu": false
   }
  ]
 },
 {
  "id": "le-timide",
  "nom": "Le timide",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Euh… je suis content. Voilà. Merci.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Euh… merci. Merci à ma mère. Et… voilà. Merci {org}. Désolé je sais pas trop parler.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(il ne vient pas en conférence de presse ; son coach parle pour lui)",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Euh, oui, si vous pensez que c'est bien, oui.",
    "relu": false
   }
  ]
 },
 {
  "id": "linfluenceur",
  "nom": "L'influenceur",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} a demandé ce combat pour avoir des vues, et franchement je comprends, moi aussi j'aurais voulu être moi. Code FIGHT10 sur la boisson énergisante, lien en bio.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "VLOG DE PESÉE EN LIGNE. Je vous montre tout. Même ce qu'il faut pas.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Allez vous abonner à {adv}, il en a besoin, là il a plus de dents que d'abonnés.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Vidéo demain. Je vous dis TOUT. Ce qui s'est vraiment passé. (Rien ne s'est passé.)",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Il fait pas de vues. Désolé mais il fait pas de vues.",
    "relu": false
   }
  ]
 },
 {
  "id": "lexile",
  "nom": "L'exilé",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai traversé des choses pour être ici. Samedi c'est quinze minutes. Je sais faire quinze minutes.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ma mère n'a pas pu venir, elle n'a pas le visa. Maman, j'ai gagné. Je t'appelle ce soir.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu un combat. Je n'ai pas perdu ma place. C'est différent.",
    "relu": false
   },
   {
    "situation": "moment-de-vie-papiers-obtenus",
    "etiquette": "Moment de vie : papiers obtenus",
    "texte": "Aujourd'hui j'ai eu mes papiers. Je peux combattre partout maintenant. Même chez lui.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-fils-de",
  "nom": "Le fils de",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Les gens viennent voir le nom. Samedi je veux qu'ils repartent avec le mien.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Papa était au premier rang. Pour une fois il a rien dit. Je crois que c'est un compliment.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Allez-y, dites-le, il n'est pas son père. Je sais. Je le sais depuis que j'ai huit ans.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "On croit que j'ai des passe-droits. J'attends comme tout le monde. Plus, même.",
    "relu": false
   }
  ]
 },
 {
  "id": "la-pionniere",
  "nom": "La pionnière",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Dans mon village il y avait zéro fille dans les salles. Aujourd'hui il y en a onze. Samedi c'est pour les onze.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Encore un gars qui me dit que je devrais faire du yoga. Mon gars, viens au sparring demain, on fera du yoga ensemble.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Les petites qui regardent : on vous dira que c'est pas pour vous. C'est pour vous.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu. Ça veut pas dire qu'on avait tort d'essayer.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-double-emploi",
  "nom": "Le double emploi",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai échangé deux gardes avec un collègue pour le camp, je lui dois un week-end et un kebab.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Lundi 7 h je suis au boulot. Les collègues vont me chambrer toute la journée, et j'ai hâte.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Bon. Lundi 7 h je suis au boulot. Au moins là-bas personne me tape.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Pas ce mois-là, je suis de nuit toute la semaine. Je peux pas lâcher l'équipe.",
    "relu": false
   }
  ]
 },
 {
  "id": "letudiant",
  "nom": "L'étudiant",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai mon partiel de pharmacologie mardi et mon combat samedi. Je sais lequel me fait le plus peur.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je vais pouvoir payer l'inscription de l'année prochaine. Merci {adv}, sincèrement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Traumatisme crânien léger, d'après le médecin. Je sais ce que ça veut dire, j'ai eu le cours. C'est pas rassurant.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-superstitieux",
  "nom": "Le superstitieux",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Combat le 13 ? Non. Je plaisante pas. Changez la date ou changez de combattant.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Chaussettes lavées par erreur par ma copine. Je suis en deuil.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Vous voyez ? Même chaussettes. Je vous l'avais dit.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai croisé un chat noir dans le parking. Je dis rien de plus.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-converti-tardif",
  "nom": "Le converti tardif",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Il y a cinq ans j'étais comptable et je pesais 110 kilos. Je suis pas en retard, je suis en avance sur celui que j'étais.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Le type que j'étais à trente ans ne me croirait pas. Salut à lui.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je perds un combat. J'ai déjà perdu une vie entière, alors ça va.",
    "relu": false
   }
  ]
 },
 {
  "id": "lancien-dun-autre-sport",
  "nom": "L'ancien d'un autre sport",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Au judo on m'a appris à tomber. Ici j'apprends à ne pas tomber. C'est pas le même métier.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Projection de hanche, vingt ans que je la fais. Elle marche aussi avec des coups de poing, apparemment.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a frappé à un endroit où, au judo, personne frappe jamais. Leçon.",
    "relu": false
   }
  ]
 },
 {
  "id": "lartiste",
  "nom": "L'artiste",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv}, t'as le cardio d'un poème qui s'arrête à la deuxième strophe, moi je finis mes textes et je finis mes combats.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Nouveau son vendredi. Nouveau KO samedi. Même label : moi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'avais écrit le couplet avant le combat. Il manquait juste la fin. Là, je l'ai.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ce soir j'écris un morceau triste. Il va être très bon.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-hante",
  "nom": "Le hanté",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais être honnête. Je dors mal depuis le dernier. Mais je veux savoir si je suis encore moi. Samedi je saurai.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'ai gagné. Je sais pas encore si je suis content. Laissez-moi un peu.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je crois que c'est fini. Je crois. Je vous dirai.",
    "relu": false
   }
  ]
 },
 {
  "id": "laine",
  "nom": "L'aîné",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai quatre petits frères. Deux à l'école, un à l'apprentissage, un qui veut faire comme moi. Je vais lui dire non. Mais d'abord, samedi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "L'inscription au permis de ma petite sœur est payée. Ça, c'est une ceinture.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Chaque mois sans combat, c'est un mois où c'est ma mère qui compte. Je veux pas que ma mère compte.",
    "relu": false
   }
  ]
 },
 {
  "id": "lhypersensible",
  "nom": "L'hypersensible",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai pleuré en signant le contrat. Je vais sûrement pleurer à la pesée. Et samedi je vais le frapper très fort. Les deux sont vrais.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(il pleure) Pardon. Pardon. Merci. J'ai eu tellement peur toute la semaine.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai mal au cœur plus qu'au visage. C'est normal je crois.",
    "relu": false
   }
  ]
 },
 {
  "id": "le-stratege",
  "nom": "Le stratège",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Vous me demandez mon plan ? Vous le verrez samedi. Lui aussi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Round deux, j'ai changé de garde. Pourquoi ? Question suivante.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il avait un meilleur plan. Je voudrais bien savoir lequel.",
    "relu": false
   },
   {
    "situation": "micro-tendu",
    "etiquette": "Micro Tendu",
    "texte": "Q. Tu joues aux échecs ? — R. Pourquoi, vous voulez perdre ?",
    "relu": false
   }
  ]
 },
 {
  "id": "le-fetard",
  "nom": "Le fêtard",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Le camp s'est super bien passé. Enfin les deux dernières semaines. Les deux premières, on va dire que c'était un camp de base.",
    "relu": false
   },
   {
    "situation": "pesee-ratee",
    "etiquette": "Pesée ratée",
    "texte": "J'avais oublié que c'était aujourd'hui. Je suis pas fier. Enfin un peu quand même, il était bon ce burger.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "On se retrouve tous au bar d'en face, c'est moi qui paye. Enfin c'est {org} qui paye, c'est ma bourse.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je vais faire la fête quand même. On fête la défaite aussi, sinon on fête jamais rien.",
    "relu": false
   }
  ]
 },
 {
  "id": "la-transformation",
  "nom": "La transformation",
  "repliques": [
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Il y a six ans je montais pas un escalier sans m'arrêter. Samedi je monte dans une cage. Je sais lequel des deux était le plus dur.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Photo de moi à 128 kilos, à côté de la pesée d'hier. Je la garde dans mon téléphone. Elle me regarde.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "À tous ceux qui se regardent dans la glace et qui ont honte : moi aussi. Et regardez maintenant.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu. Mais le vieux moi, je l'ai battu il y a longtemps.",
    "relu": false
   }
  ]
 }
];
/* ==== [FIN ANCRE] ==== */
