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
    "texte": "Je suis dans la meilleure forme de ma vie. {adv} est un bon combattant, mais samedi vous verrez la meilleure version de moi.",
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
    "texte": "Merci à Dieu, à mon équipe et à {org}. J'avais dit que j'étais [prêt|prête]. Maintenant, je veux un classé.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "C'était pas mon soir. Bravo à {adv}. Je vais revenir plus [fort|forte].",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Le camp s'est bien passé. Je suis [prêt|prête]. {adv} aussi, mais je suis plus [prêt|prête].",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je remercie mon équipe pour ce camp. Samedi, on montre ce qu'on a travaillé.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je suis très concentré. {adv} est dangereux, je le sais. Je serai prêt.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Dernière séance avant samedi. Merci à mes partenaires d'entraînement.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Pesée faite, poids bon. Maintenant on se repose.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci à tout le monde. Une grosse pensée pour ma famille. On continue.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "{adv} est costaud, mais on avait un plan. Ça a marché. Merci au coach.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je n'ai rien à dire de plus. Bravo à {adv}. On retourne travailler.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ça arrive. Je ne vais pas chercher d'excuse. Je reviens plus [fort|forte].",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Ça fait {mois} mois sans combat. Je m'entraîne tous les jours, appelez-moi.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "{mois} mois que j'attends. Je suis en forme, il me faut juste une date.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, ça me va. Envoyez-moi le contrat.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Pourquoi pas. Je veux juste savoir la date.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Je me suis [blessé|blessée] au camp. Je suis déçu, mais je serai de retour.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Entraînement fini. Combat samedi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je rentre dormir.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Perdu. On corrige.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Quand ? Oui.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Pas ce mois-ci. Le dos.",
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
    "texte": "{adv}, mon ami, samedi je prends ta place au classement. Round deux, gauche au foie. Tu rentres en taxi, c'est moi qui paye.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Météo de samedi pour {adv} : couvert au début, averses au deuxième round, fin de soirée allongée.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, prédiction juste",
    "texte": "Je vous l'avais dit ! Round {round}. Les gens paient pour ça, et moi je livre.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv}, prépare ton plus beau sourire. Samedi, tu le montres au plafond.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Il paraît que {adv} dort bien. Dites-lui de profiter de ses dernières nuits.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Round {round}. Je l'avais dit. Maintenant je mange.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ce soir, le scénario a changé. Je reprends mon stylo.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Mon nom en gros sur l'affiche, et c'est oui.",
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
    "texte": "Je respecte {adv}. Le résultat, c'est Dieu qui le décide. Moi, je fais ma part : je m'entraîne, je dors, je mange.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Ce qui doit arriver arrivera. Je serai dans la cage, c'est déjà beaucoup.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ça devait finir comme ça. Je n'y suis pour rien.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je savais. Ce n'est pas grave.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Si c'est écrit, c'est oui.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Une blessure. Elle devait arriver un jour.",
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
    "texte": "Je ne pense pas à {adv}. Je pense au moment où la porte se ferme. Il n'y a plus de classement, juste deux [hommes|femmes] qui ont peur. Et qui avancent quand même.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "La cage est petite. Le ciel est grand. Samedi, je regarde les deux.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je regarde mes mains. Elles ont gagné, moi je suis resté calme.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Perdre apprend ce que gagner cache.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Une montagne, un matin. Encore trois jours.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je vais y réfléchir un moment. Oui.",
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
    "texte": "{adv} a l'air d'un mec bien, mais il boxe comme mon oncle au mariage. J'ai mal au genou depuis un mois, mais je vais le finir quand même.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Le matchmaker de {org} m'a mis contre {adv}. Soit il ne m'aime pas, soit il n'a jamais vu un combat. Peut-être les deux.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je vous avais dit qu'il ne fallait pas parier contre moi ! Respect au mec, il m'a mis une droite, j'ai vu ma grand-mère. Et j'ai faim.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il était meilleur que moi, rien à dire. J'étais nul ce soir. Je vais boire un coup, on en reparle lundi.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Ça fait {mois} mois que {org} me paye sans que je combatte. Je ne me plains pas, mais je préfère taper des gens.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition, lutteur",
    "texte": "Lui ? Il va me coller au grillage quinze minutes. Non merci, je ne suis pas venu pour ça.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est nul. Dites-le-lui de ma part. Samedi, je lui montre aussi.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Quelqu'un m'a dit de me calmer. J'ai ri tellement fort que j'en ai cassé ma chaise.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Dix minutes de travail, deux heures de bar. Mon plan est parfait.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu. Ça m'emmerde. Je ne vais pas dire que c'est de sa faute.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Lui ? Il a l'air gentil. Moi pas. Allez, oui.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Une cheville. J'ai marché sur un truc. Ne me demandez pas quoi.",
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
    "texte": "(par son interprète) Il remercie son équipe et son pays. Il a dit aussi quelque chose sur {adv}. Je ne le traduis pas.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "(par son interprète) Il dit qu'il a bien travaillé. Il dit que {adv} aussi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(par son interprète) Il dit merci. Il pense à sa famille.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(par son interprète) Il dit qu'il reviendra. Il dit aussi qu'il a faim.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Publication sans texte. Une photo de ses mains bandées.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "(par son interprète) Il dit oui. Il veut d'abord savoir si c'est loin.",
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
    "texte": "{adv} est {rang_adv} [mondial|mondiale], je suis {rang}. Si je gagne, j'entre dans le top 10. Cet été, je veux le titre. C'est simple.",
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
    "texte": "Chaque mois sans combat est un mois perdu. Je l'ai calculé : à ce rythme, {org} me coûte une ceinture.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Il est derrière moi au classement, ça m'apporte rien. Trouve-moi un classé.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est {rang_adv}. Je suis {rang}. Une victoire me rapproche du titre.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Étape huit sur dix. Tout est dans les temps.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Un de plus dans le classement. Prochain objectif : le top 5.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ça retarde le plan. Je change une ligne du tableau, pas le tableau.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Il est mieux classé que moi ? Alors oui.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "{mois} mois sans combat. Mon plan prévoyait trois semaines. Appelez-moi.",
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
    "texte": "Avant, je travaillais la nuit sur des chantiers et je dormais quatre heures. {adv}, avec respect, quinze minutes dans une cage ne me font pas peur.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Cette bourse va chez ma mère. Elle n'a jamais regardé un de mes combats, mais cette bourse, elle va la regarder.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai connu pire que {adv}. Beaucoup pire. Samedi, ça va aller.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ça me fait du bien. J'avais oublié ce que ça faisait de gagner.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai déjà perdu plus que ça. Demain, je retourne travailler.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. J'ai besoin de combattre. Je ne dis pas non.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "{mois} mois sans combat. Je ne sais pas faire autre chose.",
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
    "texte": "Je suis très content. Je respecte beaucoup {adv}. Ça va être un beau combat, venez nombreux !",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci à {adv}. Il m'a posé des problèmes. Au deuxième round, j'ai senti sa droite. Bravo à lui.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je suis ravi de combattre {adv}. Beau combat en vue, j'espère que vous viendrez.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci à {adv}, un vrai guerrier. Merci à {org}. Je suis content, vraiment.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Bravo à lui. Je corrige mes erreurs et je reviens.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Avec plaisir. Dites-moi où signer.",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "Je ne me plains pas, mais si {org} a une date, je suis là.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} ? Encore un qui ne mérite pas d'être là. Mais je le prends.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Maintenant, le classé. Je ne le répéterai pas.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "C'est une erreur. Je veux la revanche. Maintenant.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Jour 190 sans réponse. Les classés me bloquent ou me fuient.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Ce n'est pas ce que je demandais. Mais d'accord, une dernière fois.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} frappe fort, moi je mange fort. Qui tiendra le plus longtemps ?",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'ai gagné et j'ai faim. Bonne soirée à tous, je vais au restaurant.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu, mais j'ai eu un super sandwich avant. Ça compense.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Pesée : 200 grammes de trop. J'ai couru, j'ai pleuré, j'ai ri. Ça passe.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Il y aura un traiteur ? Alors c'est oui.",
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
    "texte": "J'ai hâte de discuter avec {adv}. On ne s'est jamais vraiment parlé. Samedi, on aura quinze minutes rien que tous les deux.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv}, tu es un bon gars. Je vais te dire plein de choses samedi. Tu vas aimer.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Il n'a pas voulu discuter. Je lui ai raconté ma semaine, ça lui a suffi.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il m'a fait taire, une fois. Je ne lui en veux pas.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "On parle un peu ? Non ? Alors oui, c'est bon.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Je cherche quelqu'un pour discuter. Pas un combattant. Un humain.",
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
    "texte": "Mesdames et messieurs, soyons clairs : {adv} n'est pas un combattant, c'est un figurant. Il est là pour se tenir à côté de moi sur l'affiche. Et samedi, il va même rater ça.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Chère ville de samedi, vous méritez mieux que {adv}. Je vous le dis avec amour.",
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
    "texte": "Ce soir, j'ai combattu {adv}, l'arbitre, les juges, et une intoxication alimentaire. Trois contre un.",
    "relu": false
   },
   {
    "situation": "sur-laffiche-dun-autre",
    "etiquette": "Sur l'affiche d'un autre",
    "texte": "Si ces deux-là se battent, moi je paie ma place. Et je paie jamais.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Mesdames et messieurs, {adv} est venu ici pour tomber. Je suis venu pour l'aider.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Huez-moi. Ça ne change rien : je suis le meilleur, et vous l'avez vu.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Un incident. Une erreur d'arbitrage. Une mouche. Je cherche encore.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Chère salle de samedi : mettez vos meilleurs vêtements. Je viens vous décevoir.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Mon nom en gros et ma bourse en plus gros. Alors oui.",
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
    "texte": "{adv} a une coupe de cheveux de prof de géo. Je vais lui arranger ça, avec les coudes.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci, vous êtes des malades, je vous aime tous. Même toi là-bas, qui m'as insulté à la pesée !",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire, la rupture",
    "texte": "Attendez. Il y a deux semaines, on a enterré un ami. Il ne parlait à personne. Les gars, si ça ne va pas, parlez. À n'importe qui, à moi si vous voulez. Je préfère que vous pleuriez sur mon épaule.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je suis dégoûté, mais je vais bien, vraiment. On se voit au pub.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais être sincère : j'ai peur, mais je suis content d'être là. Merci de m'écouter.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je pleure comme un enfant. C'est la plus belle soirée de ma vie.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je suis triste. Je vous remercie quand même d'être venus. Vous êtes super.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Une photo de mon coach qui m'enlace. Trois jours avant, il me dit de pas pleurer.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, avec tout mon cœur. Merci de penser à moi.",
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
    "texte": "(en langue des signes) On me demande si le bruit du public me manque. Non. Moi, je n'entends pas {adv} parler. C'est un avantage.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(en langue des signes) Il y a des millions de sourds dans le monde. Ce soir, ils ont tous gagné avec moi.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "(en langue des signes) Je n'ai pas peur du bruit. Je sens la salle dans mes pieds.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(en langue des signes) Je dédie ça à ceux qui m'ont dit que ce n'était pas possible.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(en langue des signes) Ce soir, il a été plus rapide. Je ne l'ai pas vu venir.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "(en langue des signes) Oui. Et faites en sorte que l'interprète soit à l'heure.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "(par son interprète) Il dit qu'il a médité sur {adv}. Il dit que c'est un frère.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "(par son interprète) Il dit que la nuit lui a parlé. Je n'ai pas tout compris.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "(par son interprète) Il dit que ce n'est pas une défaite, c'est une page.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Une photo d'un arbre. Pas de texte. Il reste trois jours.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "(par son interprète) Il a regardé la lune. La lune dit oui.",
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
    "texte": "On me demande si c'est dur de reprendre après ma fille. J'ai accouché pendant trente heures. {adv} ne me fait pas peur.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Entraînement à 6 h, crèche à 8 h, sparring à 11 h. Moi, [fatigué|fatiguée] ? Non. Enfin si. Mais pas moi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ma fille est dans la salle. Elle a trois ans. Elle ne se souviendra pas de ce soir, mais un jour je lui montrerai la vidéo.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Ce qui me fait mal, ce n'est pas le coup. C'est que mon fils regardait.",
    "relu": false
   },
   {
    "situation": "proposition-refusee",
    "etiquette": "Proposition refusée",
    "texte": "Pas ce mois-là. C'est l'anniversaire du petit. Le mois d'après, qui tu veux.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Ce matin, j'ai préparé le sac de mon fils, puis le mien. Samedi, c'est moi qui gagne.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je vais rentrer et je ferai des crêpes. Merci à ma mère qui garde les enfants.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu. Mon petit m'a dit : maman, ce n'est pas grave. Il a raison.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Réveil à 5 h. Biberon, entraînement, école. Samedi, je me bats.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je dois d'abord vérifier le calendrier de l'école. Après, oui.",
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
    "texte": "Mission remplie. Je remercie les gars du camp. C'est eux qui ont fait le travail.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Mission claire : tenir trois rounds, finir au quatrième. On connaît son plan.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Mission accomplie. Merci à l'équipe. On rentre.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Échec de mission. Je prends la faute, on analyse, on repart.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Briefing terminé. Rassemblement samedi 9 h.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Reçu. Dites-moi l'heure.",
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
    "texte": "Les petits du quartier, je sais que vous regardez. La rue ne vous donnera rien. Moi, j'ai failli y rester.",
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
    "texte": "Quand je ne combats pas, je tourne en rond. Et quand je tourne en rond, je connais la suite. Donnez-moi un combat.",
    "relu": false
   },
   {
    "situation": "forfait",
    "etiquette": "Forfait",
    "texte": "Blessure. Je suis resté chez moi, je le précise. Je sais ce que les gens vont penser.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai fait des erreurs, j'en fais moins. {adv} va le sentir samedi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dédie ça à ceux qui croient encore en moi. Ils sont peu, mais ils comptent.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je ne vais pas craquer. Je rentre, je m'entraîne, je reviens.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Pas de bar ce soir. Seulement du thé et du sommeil.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. J'ai besoin d'un objectif, sinon je tourne en rond.",
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
    "texte": "Wesh {adv}, tu as vu mes combats ? Si tu les avais vus, tu aurais refusé. Samedi, tu vas manger.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Toute la team au premier rang samedi ! Ramenez le bruit, on va faire trembler la salle.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "C'est pour la ville ! Pour les grands, pour les petits, pour ma mère qui me disait d'arrêter la boxe. Regarde maman !",
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
    "texte": "Lui ? Il n'a aucun abonné, personne ne le connaît, même sa mère ne regarde pas ses combats. Trouve-moi un vrai nom.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv}, viens, on s'explique dans la cage. Le quartier sera là, il regardera.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "C'est pour le quartier ! Pour la bande, pour ceux d'en bas, pour maman !",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu, mais on reste fiers. On rentre manger, on en reparle demain.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Toute la rue sera là. Gardez la place pour les petits, devant.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Lui ? Je le connais pas, mais ok, c'est bon. Envoie.",
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
    "texte": "{adv} est un danseur. Je vais le mettre au sol, m'asseoir dessus, et le noyer pendant quinze minutes. Ce n'est pas beau, mais c'est efficace.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais prendre ses jambes, l'amener au sol, et attendre que ça passe. C'est sûr.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Quinze minutes au sol, ça fait mal aux genoux. Ça valait le coup.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il s'est relevé trop vite. Je dois mieux contrôler. Je retourne au tapis.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Séance de lutte du matin. Dix fois la même prise, jusqu'à ce que ça marche.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Un grand frappeur ? Très bien. Je l'emmène au sol, il va voir.",
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
    "texte": "Frère, {adv} est un bon garçon, je ne lui veux aucun mal. Mais mon père sera au premier rang. Je ne peux pas perdre devant mon père.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Toute la famille sera dans la salle. Je ne peux pas perdre devant eux.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dédie cette victoire à mes oncles, à ma tante, à toute la famille.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai déçu les miens. On parle à la maison. Après, on verra.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Trois cars de la famille arrivent samedi. Ils vont chanter fort.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je demande à mon père. Il dit oui.",
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
    "texte": "Samedi, ce n'est pas moi qui entre dans la cage. C'est tout le {pays}. J'ai reçu des messages de gens que je ne connais pas.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Tout le {pays} regarde samedi. Je ne veux pas les décevoir.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Pour tous ceux qui ont veillé là-bas. Je rentre à la maison avec un sourire.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je m'excuse auprès du {pays}. Je reviendrai avec la tête haute.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Les messages du {pays} arrivent par centaines. Je les lis tous.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Pour mon pays, oui.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais le finir au troisième round. Ce n'est pas un défi, c'est un calendrier.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Troisième round, comme prévu. Je n'ai pas de mérite, je lis.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je m'étais trompé de round. Je corrige ma prédiction.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Rappel pour samedi : troisième round. Notez-le.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Il tombera en trois rounds. D'accord.",
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
    "texte": "{adv} a un problème simple. Il baisse la main droite quand il lance son crochet gauche. Samedi, interrogation surprise.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} fait toujours la même erreur au deuxième round. Samedi, on la corrige.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Bon exercice. Je lui mets 12 sur 20, mais il a progressé.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai raté mon cours. L'élève était meilleur que prévu.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Séance de vidéo. Quatre-vingts minutes de notes. Tout est prêt.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Voyons son dossier. Très bien, c'est oui.",
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
    "texte": "{adv} est le boss du niveau 3. Moi, je suis au niveau 9. Quelqu'un doit lui dire qu'il a raté des mises à jour.",
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
    "texte": "Combo complet, sa barre de vie à zéro, je n'ai même pas utilisé mon ultime. Merci pour les points d'expérience.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est un ennemi de niveau 5. Moi je suis niveau 12. Pas de souci.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Combo parfait. Il m'a donné des points d'expérience. Merci {adv}.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Game over. Je recharge la sauvegarde et je recommence.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Nouvelle compétence débloquée : esquive de gauche. Je la teste samedi.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Un boss de fin ? Oui. Je prends toujours les boss.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est venu pour se battre ? Alors on sera deux. Ça va saigner un peu.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Quel combat ! Je lui dois une bière. Et un pansement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu, mais c'était un super combat. Je recommence quand tu veux.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Nez cassé à l'entraînement. Troisième fois. Je suis content.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Quelqu'un qui frappe fort ? Oui, avec plaisir.",
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
    "texte": "Quelque part, un enfant regarde ça et pense qu'il ne peut pas. Samedi, c'est pour lui. {adv} est un grand combattant, mais moi, j'ai une mission.",
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
    "texte": "Je parle aux gamins de chez moi : on vous dira que c'est impossible. C'est faux. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Aujourd'hui je suis tombé. Demain je me relève. C'est ça la leçon. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Quelque part, un jeune regarde. Samedi, je lui montre que c'est possible.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "À tous les jeunes qui regardent : travaillez, croyez, relevez-vous. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je suis tombé. Je me relève demain. Voilà la vraie leçon. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "4 h 40. Un grand verre d'eau. Aujourd'hui, on bouge. On se voit au sommet.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je prends. Chaque combat est une leçon pour quelqu'un.",
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
    "texte": "Quand j'ai commencé, on se battait dans des parkings. Le vainqueur prenait l'enveloppe, le perdant repartait sans dents. {adv} est né l'année de mon premier nez cassé.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} est né quand j'avais déjà dix combats. Samedi, il apprend un truc.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Le métier, ça ne s'achète pas. Merci à ceux qui me l'ont appris.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il était plus rapide. À mon âge, c'est normal. Je ne regrette rien.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Chaque matin, mes genoux me disent bonjour. Chaque soir, je leur réponds.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Un jeune, encore ? Oui. Il faut bien que quelqu'un leur montre.",
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
    "texte": "Je me bats pour une bourse qui paye à peine mon camp. Ce n'est pas grave : {org} a besoin d'argent pour ses néons.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je vais me battre pour presque rien. Ça ne change pas grand-chose pour moi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'ai gagné. La bourse, vous la connaissez. Je n'ai rien d'autre à dire.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Perdu. Les juges, vous connaissez leur travail. Moi, le mien.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Soirée sold out. Ma bourse : la même qu'avant. Quelqu'un a compris le système ?",
    "relu": false
   },
   {
    "situation": "inactivite",
    "etiquette": "Inactivité",
    "texte": "{mois} mois sans combat. Je paie mon loyer avec du vent.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Euh… je vais faire de mon mieux. Merci à ceux qui viennent.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci… merci beaucoup. Je… j'espère que ma mère regarde.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, si c'est bien pour la carte. Je vous fais confiance.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Camp terminé. Euh… voilà.",
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
    "texte": "{adv} a demandé ce combat pour avoir des vues. Je comprends, moi aussi j'aimerais être moi. Code FIGHT10 sur la boisson énergisante, lien en bio.",
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
    "texte": "Allez vous abonner à {adv}. Il en a besoin : il a plus de dents que d'abonnés.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "{adv} n'a pas autant d'abonnés que moi, mais il a plus de dents. On verra samedi.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Dix millions de vues sur ce KO. Abonnez-vous, likez, partagez.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Défaite. Mais mon contenu de ce soir est incroyable. Vidéo bientôt.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Teasing de la pesée : vous n'allez pas croire ce que j'ai mangé avant.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Combien de vues ? Dites-moi ça, après on parle.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai quitté mon pays pour pouvoir faire ça. Samedi, je n'ai pas le droit de rater.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dédie ça à ceux qui sont restés là-bas et qui regardent sur un téléphone.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je suis tombé. Je me relève. J'ai déjà traversé pire.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Chaque combat me rapproche des papiers.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Tout le monde connaît mon nom. Samedi, ils vont connaître ma boxe.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Mon père m'a serré la main. C'est la première fois qu'il le fait en public.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je ne veux pas qu'on parle de mon père. Je veux qu'on parle du combat.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Un entraînement, un jus d'orange. Je n'ai pas de passe-droit, juste de la fatigue.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Choisissez-moi quelqu'un de difficile. Je veux le mériter.",
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
    "texte": "Dans mon village, il n'y avait aucune fille dans les salles. Aujourd'hui, il y en a onze. Samedi, c'est pour les onze.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Encore un gars qui me dit de faire du yoga. Viens au sparring demain, on fera du yoga ensemble.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Il y a dix ans, nous étions trois dans la salle. Aujourd'hui, il y en a trente. Samedi, c'est pour elles.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dédie cette victoire à toutes celles qui ont commencé avant moi.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je ne suis pas la première à perdre. Je ne serai pas la dernière à gagner.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "On m'a demandé si je me bats comme un homme. Je me bats comme moi.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Et prenez-moi quelqu'un de fort, je ne suis pas là pour faire joli.",
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
    "texte": "J'ai échangé deux gardes avec un collègue pour le camp. Je lui dois un week-end et un kebab.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Combat samedi, boulot lundi. J'ai posé une demi-journée, j'ai hâte.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je dormirai peu cette nuit. Lundi 6 h, je suis au travail. Je souris déjà.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Lundi, mes collègues vont me demander ce qui s'est passé. Je vais mentir un peu.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Entraînement à 6 h, boulot de 9 h à 17 h, salle jusqu'à 21 h. Samedi, je me repose. Enfin non.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je dois voir si mon chef me libère. Normalement, oui.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai un examen mercredi et un combat samedi. Je ne sais pas lequel est le plus dur.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "La bourse paiera mon loyer pour trois mois. Merci {adv}, sincèrement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je prends deux jours de repos. Après, je retourne aux cours. On verra.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Révision de physiologie dans le vestiaire. Avant, pendant, après la pesée.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, tant que ça ne tombe pas pendant les partiels.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Combat un vendredi 13 ? Non merci. Changez la date, ou je ne viens pas.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Même chaussettes, même caleçon, même chemin. Ça marche, je ne change rien.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Quelqu'un a marché sur mon sac dans le vestiaire. Voilà. Je ne dis rien de plus.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "J'ai trouvé un trèfle à quatre feuilles dans le parking. Samedi, c'est bon.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Quelle date ? Quel chiffre ? Dites-moi tout avant.",
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
    "texte": "Il y a cinq ans, j'étais comptable et je pesais 110 kilos. Je ne suis pas en retard : je suis en avance sur celui que j'étais.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "À mon âge, on ne court plus après le temps. Samedi, je cours après {adv}.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je ne pensais pas gagner un jour. Le moi de vingt ans rigole.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai perdu, et alors ? J'ai gagné quelque chose avant d'arriver ici.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Footing à 6 h. Pesée à midi. Je fête mes 40 ans la semaine prochaine, on verra.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, dites-moi seulement l'heure. Je me couche tôt.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Dans mon ancien sport, on gagnait aux points. Ici, on gagne en frappant. Je m'adapte.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ma vieille prise a servi. Ça marche aussi dans une cage.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il a frappé là où mon ancien sport ne frappe pas. Je corrige.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Séance de sparring avec mon ancien club. Ils me regardent bizarrement. Moi aussi.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Je veux continuer à apprendre.",
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
    "texte": "{adv}, ton cardio est comme un poème qui s'arrête à la deuxième strophe. Moi, je finis mes textes et mes combats.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Samedi, j'écris un couplet sur le visage de {adv}. Je le chanterai après.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "J'ai gagné. Le refrain est trouvé. Merci à tous, à vendredi pour le son.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Cette défaite fera un très bon morceau. Ne vous inquiétez pas.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Un nouveau texte ce soir. Un nouveau KO samedi. Même combat, même rythme.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, avec un bon éclairage et un bon son. Je fais ça aussi.",
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
    "texte": "Je vais être honnête : je dors mal depuis mon dernier combat. Mais je veux savoir si je suis encore moi. Samedi, je saurai.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je ne dors plus bien. Mais je suis là. C'est déjà beaucoup.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Je ne sais pas ce que je ressens. Peut-être du soulagement.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je crois que c'est moins grave que ce que je craignais. Mais je ne sais pas.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Je vais y penser. Je vais dire oui. Je crois.",
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
    "texte": "J'ai quatre petits frères. Deux vont à l'école, un est apprenti, un veut faire comme moi. Je vais lui dire non. Mais d'abord, samedi.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je me bats pour mes frères et sœurs. Samedi, je ne les décevrai pas.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Ça fait une année scolaire payée pour ma petite sœur. C'est ma ceinture.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je dis à ma mère que ça va. Je suis fatigué, mais ça va.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Réveil à 5 h, entraînement, dîner, devoirs de mon petit frère. Je dors à 23 h.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Dites-moi combien, et je signe.",
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
    "texte": "J'ai pleuré en signant le contrat. Je pleurerai sans doute à la pesée. Et samedi, je le frapperai très fort. Les deux sont vrais.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je suis très ému à l'idée d'y aller. J'ai déjà pleuré deux fois ce matin.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Merci, merci, merci. Je ne pensais pas que j'allais y arriver.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "J'ai pleuré dans le vestiaire. Je reviens plus fort, je promets.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Mon coach m'a pris dans ses bras. Je n'ai plus de larmes.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, et merci de penser à moi. Ça me touche.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "J'ai trois plans. Samedi, {adv} n'en verra qu'un. Il choisira le mauvais.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "Le plan B était meilleur que le plan A. Je ne dis pas ce qu'est le plan C.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Il a lu mon jeu au premier round. Je note. On change tout.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Une photo d'un échiquier. Pas de texte. Il reste deux jours.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Donnez-moi sa vidéo. Après, je dirai oui ou non.",
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
    "texte": "Le camp s'est très bien passé. Enfin, les deux dernières semaines. Les deux premières, c'était plutôt un camp de base.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Combat samedi, soirée dimanche. Je ne dis pas où, mais il y aura de la musique.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "On rentre tard. On rentre bien. Merci à tous, je paye la tournée.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "On va fêter ça quand même. Perdre, c'est aussi une occasion de boire à la santé des autres.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "J'ai promis de dormir tôt. J'ai menti. Voilà, c'est dit.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui, tant qu'il y a une fête après.",
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
    "texte": "Il y a six ans, je ne montais pas un escalier sans m'arrêter. Samedi, je monte dans une cage. Je sais lequel était le plus dur.",
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
   },
   {
    "situation": "annonce",
    "etiquette": "Annonce",
    "texte": "Je me suis levé tous les matins pendant cinq ans. Samedi, on voit si ça a payé.",
    "relu": false
   },
   {
    "situation": "victoire",
    "etiquette": "Victoire",
    "texte": "À celui que j'étais : regarde-moi. À ceux qui m'ont suivi : merci.",
    "relu": false
   },
   {
    "situation": "defaite",
    "etiquette": "Défaite",
    "texte": "Je ne perds pas, j'apprends. Le moi d'avant n'aurait pas essayé.",
    "relu": false
   },
   {
    "situation": "reseaux",
    "etiquette": "Réseaux",
    "texte": "Un vieux pantalon trop grand, accroché dans le vestiaire. Il me rappelle tout.",
    "relu": false
   },
   {
    "situation": "proposition",
    "etiquette": "Proposition",
    "texte": "Oui. Je veux continuer à me surprendre.",
    "relu": false
   }
  ]
 }
];
/* ==== [FIN ANCRE] ==== */
