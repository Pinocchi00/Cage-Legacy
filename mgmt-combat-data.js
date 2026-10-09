"use strict";
/* ==== [ANCRE: MGMT_LOT11_COMBAT_DATA] — Brief du 06/10/2026, lot 11 : les mots du combat.
   Données pures : aucune logique, aucun DOM.
   - Le NOM DU COUP : la planche « Règles 3 » veut une étiquette « à côté de celui qui frappe », tirée du nom que le
     moteur donne déjà à chaque coup. Ce nom est la clé de `byType` (engine-combat.js, taxonomie P8 lot 9) ; ce fichier
     n'ajoute que son libellé de planche (JAB, DIRECT, CROCHET, LOW KICK...). La puissance sert à l'image seule
     (taille de l'éclat), jamais au combat.
   - La VOIX du commentaire (en bas à gauche, toujours droite) et celle des COINS (en haut, chacun de son côté) : une
     seule pièce, deux emplacements (mfVoix, lot 4). Niveau 0 : voix posée ; 1 : voix qui monte ; 2 : cri.
   TOUS les textes ci-dessous sont des textes d'auteur écrits par l'agent, marqués `relu:false` : Anthony les relit à la
   fin. Les modèles portent des jetons : {X} celui qui agit, {Y} l'autre, {N} le round, {COUP} le nom du coup, {QUI}
   l'adversaire visé. Aucun texte de personnage nommé ici. ==== */

/** Libellés de planche des douze coups du moteur (clé = byType). */
const MGMT_COUP_NOMS={jab:'JAB',cross:'DIRECT',hook:'CROCHET',uppercut:'UPPERCUT',elbow:'COUDE',knee:'GENOU',
  legKick:'LOW KICK',bodyKick:'COUP AU CORPS',headKick:'HIGH KICK',spinning:'COUP TOURNANT',frontKick:'COUP DE PIED',groundPunch:'COUP AU SOL'};
/** Puissance de l'éclat à l'image (0 à 1) — présentation seule. */
const MGMT_COUP_PUISSANCE={jab:0.3,cross:0.5,hook:0.6,uppercut:0.55,elbow:0.5,knee:0.4,legKick:0.45,bodyKick:0.5,headKick:0.7,spinning:0.6,frontKick:0.35,groundPunch:0.35};
/** Les coups possibles par phase : le moteur ne propose ni coude ni genou à distance, ni coup de pied au sol. */
const MGMT_COUP_PHASES={
  debout:['jab','cross','hook','uppercut','legKick','bodyKick','headKick','spinning','frontKick'],
  clinch:['knee','elbow','hook','uppercut'],
  sol:['groundPunch','elbow',{l:0,t:'{X} reste lourd sur {Y}.'},{l:0,t:'{Y} essaie de se relever, {X} garde la position.'}],
};
/** Repli quand le combattant n'a lancé aucun coup de la phase (le compteur du moteur est à zéro). */
const MGMT_COUP_REPLI={debout:'jab',clinch:'knee',sol:'groundPunch'};
/** Les gestes qui ne sont pas des coups : un mot, sans résultat de frappe. */
const MGMT_GESTES={amenee:'AMENÉE AU SOL',retourne:'IL LE RETOURNE',releve:'IL SE RELÈVE',esquive:'ESQUIVE',bloque:'BLOQUÉ',sol:'AU SOL'};

/** Le commentaire : situation → [{l,t,u?}] (l : niveau de voix ; t : modèle ; u : seconde ligne en cri). relu:false */
const MGMT_COMMENTAIRE={
  relu:false,
  salle:{
    vide:['Le haut des tribunes est resté fermé ce soir.','Une salle clairsemée : le haut des tribunes est bâché.','Les tribunes du haut sont vides, on voit le toit.','Peu de monde ce soir : le haut est fermé.'],
    deuxtiers:['La salle est aux deux tiers ce soir.','Presque aux deux tiers : la salle se remplit.','Environ deux tiers de la salle sont là ce soir.','Le public arrive, la salle approche les deux tiers.'],
    pleine:['La salle est pleine pour {QUEL}.','Pas une place libre pour {QUEL}.','Salle comble pour {QUEL}, on ne passe plus dans les allées.','Tout est plein pour {QUEL}.'],
    monte:['La salle se remplit encore.','La salle se remplit, combat après combat.','Le public continue d’arriver.','La salle se remplit, on sent la soirée monter.'],
  },
  debut:{l:1,t:['C’EST PARTI !','ON Y VA !','LES COMBATTANTS SONT PRÊTS !','LA CLOCHE ! C’EST PARTI !']},
  round:{l:1,t:['ROUND {N} !','ET C’EST REPARTI !']},
  tourne:[{l:0,t:'{X} tourne, il garde ses distances.'},{l:0,t:'{X} cherche la bonne distance.'},{l:0,t:'{X} avance, {Y} recule.'},{l:0,t:'{X} et {Y} se testent à distance.'},{l:0,t:'{X} tourne autour de {Y}.'},{l:0,t:'Rien de décisif pour l’instant : {X} observe.'}],
  coupe:[{l:1,t:'{X} LUI COUPE LA ROUTE !'},{l:1,t:'{X} AVANCE SANS S’ARRÊTER !'},{l:1,t:'{X} FERME LE CENTRE !'},{l:1,t:'{X} POUSSE {Y} VERS LA CAGE !'}],
  coup:[{l:0,t:'{COUP} de {X}.'},{l:0,t:'{X} lance {COUP}.'},{l:0,t:'{COUP}, côté {X}.'}],
  bloque:[{l:0,t:'Bloqué. {X} avance encore.'},{l:0,t:'{Y} ferme sa garde.'},{l:0,t:'{Y} bloque et reste en place.'},{l:0,t:'La garde de {Y} tient bon.'}],
  esquive:[{l:0,t:'{Y} esquive.'},{l:0,t:'Dans le vide : {Y} n’était déjà plus là.'},{l:0,t:'{Y} évite le coup de justesse.'},{l:0,t:'{X} manque sa cible : {Y} a bougé à temps.'}],
  touche:[{l:1,t:'{Y} EST TOUCHÉ !'},{l:1,t:'{X} TOUCHE FORT !'},{l:1,t:'{X} PLACE UN GROS COUP !'},{l:1,t:'{Y} ENCAISSE ET RECULE !'}],
  tapis:[{l:2,t:'OH !',u:'{X} ENVOIE {Y} AU TAPIS !'},{l:2,t:'ÇA TOMBE !',u:'{Y} EST AU TAPIS !'}],
  clinchCage:[{l:1,t:'{X} L’ENFERME CONTRE LE GRILLAGE !'},{l:1,t:'{X} PLAQUE {Y} CONTRE LES BARRES !'},{l:1,t:'{Y} EST COINCÉ CONTRE LE GRILLAGE !'}],
  clinchCentre:[{l:0,t:'{X} s’accroche. Clinch au centre.'},{l:0,t:'Corps à corps au centre : {X} serre {Y}.'},{l:0,t:'Clinch au centre, personne ne lâche.'}],
  separe:[{l:0,t:'Il sort. Retour au centre.'},{l:0,t:'L’arbitre sépare. Retour au centre.'},{l:0,t:'L’arbitre ramène les deux au centre.'},{l:0,t:'Séparation. On repart debout.'}],
  amene:[{l:1,t:'{X} L’AMÈNE AU SOL !'},{l:1,t:'{X} LE PREND ET L’AMÈNE AU SOL !'},{l:1,t:'{X} PROJETTE {Y} AU SOL !'},{l:1,t:'{X} ENTRAÎNE {Y} VERS LE SOL !'}],
  sol:[{l:0,t:'{X} contrôle. {Y} cherche la sortie.'},{l:0,t:'{X} garde le contrôle au sol.'}],
  releve:[{l:1,t:'{X} SE RELÈVE !'},{l:1,t:'{X} REMET LE COMBAT DEBOUT !'},{l:1,t:'{X} RETROUVE SES JAMBES !'},{l:1,t:'{X} S’ÉCHAPPE ET SE LÈVE !'}],
  sub:[{l:1,t:'{X} CHERCHE LA SOUMISSION !'},{l:1,t:'ÇA SERRE ! {Y} DOIT SORTIR !'},{l:1,t:'{X} VISE UNE CLÉ !'},{l:1,t:'{Y} SERRE LES DENTS, ÇA TIENT ENCORE !'}],
  minute:[{l:0,t:'Dernière minute.'},{l:0,t:'Une minute à jouer dans ce round.'}],
  dix:[{l:1,t:'DIX SECONDES !'},'« Dix secondes, tout donner ! »','« Finis ce round ! »'],
  finRound:[{l:2,t:'FIN DU ROUND !'}],
  juges:[{l:0,t:'Les juges notent. Rien n’est joué.'},{l:0,t:'Le round est fini. Les juges décideront.'},{l:0,t:'Chaque juge se fait son avis. On verra les cartes.'},{l:0,t:'Le round est terminé, tout se jouera aux points.'}],
  finKO:[{l:2,t:'C’EST FINI !',u:'{X} PAR KO !'},{l:2,t:'KO !',u:'{X} A GAGNÉ SUR UN GROS COUP !'}],
  finSub:[{l:2,t:'ÇA TAPE !',u:'{X} PAR SOUMISSION !'},{l:2,t:'ÇA TAPE ENCORE !',u:'{X} FAIT ABANDONNER {Y} !'}],
  finStop:[{l:2,t:'LE COMBAT S’ARRÊTE !',u:'{X} GAGNE !'},{l:2,t:'L’ARBITRE ARRÊTE TOUT !',u:'{X} EST DÉCLARÉ VAINQUEUR !'}],
};

/** Les coins : ce que crie l'équipe. Le coin d'un combattant parle pour lui, pas pour l'autre. relu:false */
const MGMT_COINS={
  relu:false,
  debut:['« Reste au centre ! »','« Tranquille, au centre ! »','« On respire, on joue la distance ! »','« Tranquille, on regarde sa garde ! »','« Respire, ne te presse pas ! »'],
  avance:['« Coupe-lui la route ! »','« Avance, avance ! »','« Ferme le centre ! »','« Pousse, pousse ! »'],
  cageDom:['« Garde-le là ! »','« Ne le lâche pas ! »','« Reste dessus ! »','« Ne lui laisse pas de place ! »'],
  cagePris:['« SORS DE LÀ ! »','« Tourne, tourne ! »','« Pivote ! »','« Sors par le côté ! »'],
  encore:['« ENCORE ! ENCORE ! »','« Enchaîne ! »','« Continue, continue ! »','« Ne t’arrête pas ! »'],
  recule:['« Recule ! Recule ! »','« Ferme ta garde ! »','« Protège-toi ! »','« Reviens au centre ! »'],
  solDessus:['« Garde-le au sol ! »','« Reste lourd ! »','« Bien lourd, bien lourd ! »','« Contrôle, pas de panique ! »'],
  solDessous:['« Relève-toi ! »','« Cherche la sortie ! »','« Respire, cherche un appui ! »','« Garde ta tête protégée ! »'],
  dix:['« Dix secondes ! »','« Finis fort ! »'],
};
/* ==== [FIN ANCRE] ==== */
