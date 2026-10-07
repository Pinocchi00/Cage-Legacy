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
  sol:['groundPunch','elbow'],
};
/** Repli quand le combattant n'a lancé aucun coup de la phase (le compteur du moteur est à zéro). */
const MGMT_COUP_REPLI={debout:'jab',clinch:'knee',sol:'groundPunch'};
/** Les gestes qui ne sont pas des coups : un mot, sans résultat de frappe. */
const MGMT_GESTES={amenee:'AMENÉE AU SOL',retourne:'IL LE RETOURNE',releve:'IL SE RELÈVE',esquive:'ESQUIVE',bloque:'BLOQUÉ',sol:'AU SOL'};

/** Le commentaire : situation → [{l,t,u?}] (l : niveau de voix ; t : modèle ; u : seconde ligne en cri). relu:false */
const MGMT_COMMENTAIRE={
  relu:false,
  salle:{
    vide:['Le haut des tribunes est resté fermé ce soir.','Une salle clairsemée : le haut des tribunes est bâché.'],
    deuxtiers:['La salle est aux deux tiers ce soir.','Presque aux deux tiers : la salle se remplit.'],
    pleine:['La salle est pleine pour {QUEL}.','Pas une place libre pour {QUEL}.'],
    monte:['La salle se remplit encore.','La salle se remplit, combat après combat.'],
  },
  debut:{l:1,t:['C’EST PARTI !','ON Y VA !']},
  round:{l:1,t:['ROUND {N} !','ET C’EST REPARTI !']},
  tourne:[{l:0,t:'{X} tourne, il garde ses distances.'},{l:0,t:'{X} cherche la bonne distance.'},{l:0,t:'{X} avance, {Y} recule.'}],
  coupe:[{l:1,t:'{X} LUI COUPE LA ROUTE !'},{l:1,t:'{X} AVANCE SANS S’ARRÊTER !'}],
  coup:[{l:0,t:'{COUP} de {X}.'}],
  bloque:[{l:0,t:'Bloqué. {X} avance encore.'},{l:0,t:'{Y} ferme sa garde.'}],
  esquive:[{l:0,t:'{Y} esquive.'},{l:0,t:'Dans le vide : {Y} n’était déjà plus là.'}],
  touche:[{l:1,t:'{Y} EST TOUCHÉ !'},{l:1,t:'{X} TOUCHE FORT !'}],
  tapis:[{l:2,t:'OH !',u:'{X} ENVOIE {Y} AU TAPIS !'}],
  clinchCage:[{l:1,t:'{X} L’ENFERME CONTRE LE GRILLAGE !'}],
  clinchCentre:[{l:0,t:'{X} s’accroche. Clinch au centre.'}],
  separe:[{l:0,t:'Il sort. Retour au centre.'},{l:0,t:'L’arbitre sépare. Retour au centre.'}],
  amene:[{l:1,t:'{X} L’AMÈNE AU SOL !'},{l:1,t:'{X} LE PREND ET L’AMÈNE AU SOL !'}],
  sol:[{l:0,t:'{X} contrôle. {Y} cherche la sortie.'},{l:0,t:'{X} garde le contrôle au sol.'}],
  releve:[{l:1,t:'{X} SE RELÈVE !'},{l:1,t:'{X} REMET LE COMBAT DEBOUT !'}],
  sub:[{l:1,t:'{X} CHERCHE LA SOUMISSION !'},{l:1,t:'ÇA SERRE ! {Y} DOIT SORTIR !'}],
  minute:[{l:0,t:'Dernière minute.'}],
  dix:[{l:1,t:'DIX SECONDES !'}],
  finRound:[{l:2,t:'FIN DU ROUND !'}],
  juges:[{l:0,t:'Les juges notent. Rien n’est joué.'},{l:0,t:'Le round est fini. Les juges décideront.'}],
  finKO:[{l:2,t:'C’EST FINI !',u:'{X} PAR KO !'}],
  finSub:[{l:2,t:'ÇA TAPE !',u:'{X} PAR SOUMISSION !'}],
  finStop:[{l:2,t:'LE COMBAT S’ARRÊTE !',u:'{X} GAGNE !'}],
};

/** Les coins : ce que crie l'équipe. Le coin d'un combattant parle pour lui, pas pour l'autre. relu:false */
const MGMT_COINS={
  relu:false,
  debut:['« Reste au centre ! »','« Tranquille, au centre ! »','« On respire, on joue la distance ! »'],
  avance:['« Coupe-lui la route ! »','« Avance, avance ! »'],
  cageDom:['« Garde-le là ! »','« Ne le lâche pas ! »'],
  cagePris:['« SORS DE LÀ ! »','« Tourne, tourne ! »'],
  encore:['« ENCORE ! ENCORE ! »','« Enchaîne ! »'],
  recule:['« Recule ! Recule ! »','« Ferme ta garde ! »'],
  solDessus:['« Garde-le au sol ! »','« Reste lourd ! »'],
  solDessous:['« Relève-toi ! »','« Cherche la sortie ! »'],
  dix:['« Dix secondes ! »','« Finis fort ! »'],
};
/* ==== [FIN ANCRE] ==== */
