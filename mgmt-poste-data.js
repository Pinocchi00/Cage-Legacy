"use strict";
/* ==== [ANCRE: P9_T1_POSTE] — Monde lot 43 T1 ==== */
const MGMT_POSTE=Object.freeze({
  duree:365,salaire:3200,mi:183,
  types:Object.freeze(['manque','lourd-top15','rang-orgs','champion-top5','caisse','popularite','salle','titre-demande']),
  seuils:Object.freeze({augmente:{conf:4,tenus:0.75},condition:{conf:2,tenus:0.4},
    popularite:Object.freeze([25,35,45,55,65,75]),
    phrases:Object.freeze([
      Object.freeze({niveau:'Il est ravi',banque:Object.freeze([{texte:'Je suis fier de ce que tu as construit.',relu:false},{texte:'Je te fais confiance pour la suite.',relu:false},{texte:'Tu as trouvé ta place ici.',relu:false}]),mi:'Je suis ravi du chemin parcouru. Continuons ainsi.',relu:false}),
      Object.freeze({niveau:'Il est content',banque:Object.freeze([{texte:'Je suis content de ton travail.',relu:false},{texte:'Je vois les progrès.',relu:false},{texte:'Tu réponds à mes attentes.',relu:false}]),mi:'Je suis content de ce que je vois à mi-saison.',relu:false}),
      Object.freeze({niveau:'Il attend de voir',banque:Object.freeze([{texte:'Je veux voir la suite.',relu:false},{texte:'La saison n’a pas encore parlé.',relu:false},{texte:'Je garde mon jugement pour plus tard.',relu:false}]),mi:'J’attends de voir comment tu termines la saison.',relu:false}),
      Object.freeze({niveau:'Il commence à douter',banque:Object.freeze([{texte:'Je commence à douter.',relu:false},{texte:'Je ne suis pas convaincu.',relu:false},{texte:'Il faut redresser la situation.',relu:false}]),mi:'Je commence à douter de la direction prise.',relu:false}),
      Object.freeze({niveau:'Il n’y croit plus',banque:Object.freeze([{texte:'Je n’y crois plus.',relu:false},{texte:'Je ne vois pas comment continuer ainsi.',relu:false},{texte:'Tu as perdu ma confiance.',relu:false}]),mi:'Je ne suis plus convaincu par ce projet.',relu:false})
    ])
  })
});
