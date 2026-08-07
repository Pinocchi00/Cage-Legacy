"use strict";
/* CAGE LEGACY — js/ui-01-roster-matchmaking.js
   ============================================================================
   Fichier 1/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Rosters d'organisation, classement (divRank), matchmaking, import/export de légendes, et quelques écrans annexes (Fantasy Fight, All-Stars, Vs Ami).

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

/* ==== [ANCRE: REFONTE_TACTIQUES] — item demandé : 3 tactiques par style au
   lieu de 4, avec des effets nettement plus extrêmes (gros bonus, gros
   malus) pour que chacune ait une vraie identité, titrée et décrite sur un
   ton satirique. Principe d'équilibre respecté sur les 24 entrées : chaque
   tactique sacrifie sévèrement au moins un canal (str/ko/def/ctrl/tdd...)
   en échange d'un pic sur un autre — jamais de tactique qui monte tout à la
   fois. Un adversaire qui exploite précisément le canal sacrifié punit la
   tactique choisie, donc aucune ne peut « battre tout le monde » — même
   logique de contrepartie que l'ancien système, juste poussée plus loin.
   Vérifié contre le clamp [1,150] de simulateFight() dans engine.js : les
   multiplicateurs restent sous ~2.3 pour ne pas gaspiller de bonus au-delà
   du plafond sur une stat déjà haute, et au-dessus de 0.2 pour ne jamais
   réduire un canal à une valeur ridicule et non-skill. Les seuils utilisés
   par l'IA adaptative (getAdaptiveNPCTactics, engine.js — tdd>1.1, def>1.2,
   str>1.1) restent valides sans modification : tous les nouveaux bonus les
   dépassent largement. ==== */
const TACTICS = {
  boxer: [
    { id: 'bx1', lbl: 'Sac de Frappe Ambulant', desc: 'Le plan : noyer l\u2019adversaire sous les jabs jusqu\u2019à la décision. Le public s\u2019endort, les juges adorent, personne ne se souvient du combat le lendemain.', m: { str: 2.2, ko: 0.25 } },
    { id: 'bx2', lbl: 'Tout Ou Rien, Menton Compris', desc: 'Une seule idée en tête : l\u2019éteindre. La garde reste grande ouverte — si ça ne marche pas au premier round, ça risque de très mal finir.', m: { ko: 2.3, def: 0.3 } },
    { id: 'bx3', lbl: 'Le Marathonien Du Ring', desc: 'Courir, esquiver, pointer de loin, ne jamais s\u2019engager. Gagner au style, c\u2019est bien. Gagner au menton, c\u2019est mieux. Au moins tu rentres chez toi entier.', m: { def: 2.2, ko: 0.2, str: 0.7 } }
  ],
  bjj: [
    { id: 'bj1', lbl: 'Bienvenue Au Sol, Direction Obligatoire', desc: 'Debout, tu n\u2019existes pas. Chaque seconde loin du tapis est une seconde perdue — au pire, tu prends une droite en te jetant sur les jambes.', m: { td: 2.2, gi: 1.8, str: 0.25 } },
    { id: 'bj2', lbl: 'La Chasse À L\u2019Anaconda', desc: 'Chaque échange devient une pêche au trésor pour un bras ou un cou. Tant pis pour la position — si ça échoue, tu te retrouves en dessous, à découvert.', m: { sub: 2.3, ctrl: 0.3, tdd: 0.4 } },
    { id: 'bj3', lbl: 'L\u2019Araignée Renversée', desc: 'Tu te jettes volontairement sur le dos et tu attends que l\u2019adversaire vienne se faire piéger dans ta toile. Génial si ça marche, catastrophique face au Ground and Pound.', m: { sub: 1.9, gi: 1.6, ctrl: 0.2, td: 0.3 } }
  ],
  wrestler: [
    { id: 'wr1', lbl: 'Le Rouleau Compresseur', desc: 'Amener, se faire repousser, recommencer. Encore. Encore. Jusqu\u2019à ce que l\u2019un des deux n\u2019ait plus de jambes pour tenir debout.', m: { td: 2.2, gi: 1.8, str: 0.3 } },
    { id: 'wr2', lbl: 'Marteau-Piqueur Humain', desc: 'Une fois au sol, oublie la position parfaite — juste frapper, frapper, encore frapper, jusqu\u2019à ce que l\u2019arbitre intervienne ou que tes mains lâchent.', m: { gnp: 2.3, ctrl: 0.35, sub: 0.4 } },
    { id: 'wr3', lbl: 'Refuse De Perdre, Refuse De Finir', desc: 'L\u2019objectif n\u2019est pas de gagner spectaculairement, c\u2019est de ne jamais perdre. Ennuyer trois juges pendant 15 minutes : une carrière entière résumée dans un seul plan.', m: { ctrl: 2.2, tdd: 1.6, gnp: 0.3, sub: 0.25 } }
  ],
  kickboxer: [
    { id: 'kb1', lbl: 'Marche Ou Crève', desc: 'Avancer, toujours avancer, quitte à marcher droit dans un contre. La pression finit toujours par payer — ou par coûter très cher, tout de suite.', m: { str: 2.2, def: 0.3 } },
    { id: 'kb2', lbl: 'Le Fantôme À Distance', desc: 'Rester hors de portée, ne rien risquer, attendre l\u2019unique ouverture pour placer le coup qui compte. Zéro volume, zéro compromis, zéro filet de sécurité.', m: { def: 2.2, ko: 1.7, str: 0.3 } },
    { id: 'kb3', lbl: 'La Jambe D\u2019Abord, Le Reste Attendra', desc: 'Oublie la tête, détruis la jambe d\u2019appui coup après coup. Méthodique, presque médical — mais si l\u2019adversaire encaisse bien, tu n\u2019as plus l\u2019ombre d\u2019un plan B.', m: { str: 1.9, ko: 0.3, def: 1.4 } }
  ],
  muayThai: [
    { id: 'mt1', lbl: 'Le Mur T\u2019Écrase', desc: 'Ferme la distance, colle-toi au clinch, martèle de genoux jusqu\u2019à l\u2019effondrement. Le seul souci : un bon lutteur adore ce genre d\u2019invitation à terre.', m: { str: 2.1, tdd: 0.35 } },
    { id: 'mt2', lbl: 'Chasseur De Têtes Certifié', desc: 'Chaque frappe part pour tuer. La garde ? Un détail sans importance. Soit tu l\u2019endors en un round, soit tu regardes le plafond du plancher.', m: { ko: 2.3, def: 0.3 } },
    { id: 'mt3', lbl: 'Béton Armé', desc: 'Ne pas bouger. Encaisser. Attendre. Contrer. Une stratégie qui demande un menton en granit et une patience que peu de gens possèdent vraiment.', m: { def: 2.1, tdd: 1.6, ko: 0.3, str: 0.6 } }
  ],
  karate: [
    { id: 'ka1', lbl: 'Blitzkrieg Ou Rien', desc: 'Une explosion, un coup, la lumière qui s\u2019éteint — ou ta propre garde qui s\u2019effondre au même instant. Aucun entre-deux n\u2019existe dans ce plan.', m: { ko: 2.3, def: 0.3, str: 0.6 } },
    { id: 'ka2', lbl: 'Le Fantôme Assumé', desc: 'Toucher et disparaître avant même que l\u2019adversaire ne réalise qu\u2019il a été touché. Magnifique à regarder, terriblement frustrant à devoir conclure.', m: { def: 2.2, ko: 0.3, str: 0.7 } },
    { id: 'ka3', lbl: 'Le Contre Kamikaze', desc: 'Attendre l\u2019engagement adverse pour placer le high kick ou le coup d\u2019arrêt parfait. Rate ta fenêtre et tu te retrouves à découvert des deux côtés à la fois.', m: { ko: 2.2, str: 0.4, def: 0.4 } }
  ],
  sambo: [
    { id: 'sb1', lbl: 'Suplex Ou Silence', desc: 'Chaque échange se termine en vol plané. Spectaculaire pour le public, terrifiant pour ton dos le jour où ça ne fonctionne pas comme prévu.', m: { td: 2.2, gnp: 1.6, str: 0.3 } },
    { id: 'sb2', lbl: 'Le Voleur De Chevilles', desc: 'Plonger sur la jambe, verrouiller, tordre. Fonctionne à merveille — sauf contre quelqu\u2019un qui sait exactement où placer un coude pendant que tu es occupé en bas.', m: { sub: 2.3, ctrl: 0.3, tdd: 0.35 } },
    { id: 'sb3', lbl: 'Overhand Généralisé', desc: 'Cacher chaque tentative d\u2019amenée derrière un crochet capable de tout terminer d\u2019un seul coup. Le double jeu parfait — quand il fonctionne vraiment.', m: { ko: 2.0, td: 1.5, def: 0.3 } }
  ],
  mma: [
    { id: 'mm1', lbl: 'Anti-Tout', desc: 'Refuser catégoriquement le sol, punir chaque tentative d\u2019amenée à coups de poing. Le cauchemar absolu des lutteurs, le paradis de personne d\u2019autre.', m: { tdd: 2.0, str: 1.7, td: 0.3, sub: 0.3 } },
    { id: 'mm2', lbl: 'Chain Everything', desc: 'Frappe, amène, contrôle, recommence — sans jamais s\u2019arrêter pour penser à sa propre défense. Un rouleau compresseur qui finit parfois par s\u2019écraser lui-même.', m: { gi: 1.6, str: 1.6, td: 1.6, def: 0.3 } },
    { id: 'mm3', lbl: 'Le Joker', desc: 'Ne rien initier. Attendre l\u2019erreur adverse et la punir immédiatement, peu importe la méthode. Fonctionne à merveille contre les impatients, s\u2019effondre contre plus patient que soi.', m: { def: 2.0, ko: 1.7, sub: 1.4, str: 0.3 } }
  ]
};
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: SYSTEME_CLASSES] — item demandé : à 23 ans, choix UNIQUE et
   DÉFINITIF d'une Classe parmi 3 par style — spécialisation permanente qui
   combine effet mécanique réel (delta d'attributs, comme les mouvements
   signature +6/+6 déjà en jeu, mais légèrement plus marqué car permanent et
   unique dans la carrière) et habillage cosmétique (nom affiché partout à la
   place du style brut). Volontairement plus modeste que les tactiques
   (+8/+6/-6 contre des multiplicateurs x2+) car cumulatif avec TOUT le reste
   pour le restant de la carrière — un effet à l'échelle des tactiques aurait
   cassé l'équilibre déjà validé par l'audit Monte Carlo. Le joueur choisit
   librement parmi les 3 (pas de verrouillage) ; l'écran affiche un indice de
   cohérence avec son palmarès réel plutôt que de le forcer. */
const CLASSES = {
  boxer: [
    { id:'cl_bx1', lbl:'Le Puncheur', desc:'Une seule question compte désormais : combien de temps l\u2019adversaire tient debout.', fx:{power:8,killer:6,cardio:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.4 },
    { id:'cl_bx2', lbl:'Le Technicien', desc:'Chaque échange devient un problème de géométrie à résoudre, pas une bagarre à gagner par la force.', fx:{fightIQ:8,jab:6,power:-6},
      fit:f=>((f.dec||0)/Math.max(1,f.W))>=0.4 },
    { id:'cl_bx3', lbl:'Le Roc', desc:'On ne le fait pas reculer. On ne le fait même pas cligner des yeux.', fx:{chin:8,durability:6,footSpeed:-6},
      fit:f=>(f.koLoss||0)===0 && (f.L||0)>=2 }
  ],
  bjj:[
    { id:'cl_bj1', lbl:'Le Chasseur de Soumission', desc:'Le combat ne se termine qu\u2019à un endroit : au bout de son bras.', fx:{submission:8,flexibility:6,takedown:-6},
      fit:f=>((f.sub||0)/Math.max(1,f.W))>=0.5 },
    { id:'cl_bj2', lbl:'Le Contrôleur', desc:'Gagner un round, ce n\u2019est pas frapper le plus fort. C\u2019est ne jamais laisser l\u2019autre respirer.', fx:{topControl:8,gnp:6,submission:-6},
      fit:f=>(f.defenses||0)>=2 },
    { id:'cl_bj3', lbl:'L\u2019Araignée', desc:'Se retrouver en dessous n\u2019a jamais été un problème quand c\u2019est exactement là qu\u2019on voulait être.', fx:{guardWork:8,submission:6,tdd:-6},
      fit:f=>((f.sub||0)/Math.max(1,f.W))>=0.3 }
  ],
  wrestler:[
    { id:'cl_wr1', lbl:'L\u2019Amenée Parfaite', desc:'Le combat commence debout et se termine toujours ailleurs.', fx:{takedown:8,explosiveness:6,chin:-6},
      fit:f=>(f.W||0)>=8 },
    { id:'cl_wr2', lbl:'Le Marteau', desc:'Une fois au sol, il ne reste plus qu\u2019une seule question de mathématiques : combien de coups avant l\u2019arrêt.', fx:{gnp:8,strength:6,cardio:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.3 },
    { id:'cl_wr3', lbl:'Le Verrou', desc:'Il n\u2019a besoin ni de finir ni d\u2019impressionner. Juste de ne jamais lâcher.', fx:{topControl:8,tdd:6,gnp:-6},
      fit:f=>((f.dec||0)/Math.max(1,f.W))>=0.4 }
  ],
  kickboxer:[
    { id:'cl_kb1', lbl:'Le Bombardier', desc:'Chaque jambe adverse est un projet de démolition en cours.', fx:{kick:8,power:6,footSpeed:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.4 },
    { id:'cl_kb2', lbl:'Le Mobile', desc:'Impossible à trouver, impossible à toucher, à peine possible à suivre des yeux.', fx:{footSpeed:8,handSpeed:6,power:-6},
      fit:f=>(f.koLoss||0)===0 },
    { id:'cl_kb3', lbl:'Le Mur Défensif', desc:'La lutte adverse vient s\u2019écraser ici et nulle part ailleurs.', fx:{tdd:8,composure:6,aggression:-6},
      fit:f=>(f.defenses||0)>=1 }
  ],
  muayThai:[
    { id:'cl_mt1', lbl:'Le Clinch Roi', desc:'Une fois collé, il ne lâche plus — et ses genoux non plus.', fx:{clinchStr:8,strength:6,footSpeed:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.35 },
    { id:'cl_mt2', lbl:'Le Bourreau', desc:'Chaque round n\u2019a qu\u2019un seul objectif : abréger le suivant.', fx:{power:8,killer:6,chin:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.5 },
    { id:'cl_mt3', lbl:'Le Mur Thaï', desc:'On peut le frapper. On ne peut pas le faire reculer.', fx:{durability:8,chin:6,handSpeed:-6},
      fit:f=>(f.koLoss||0)===0 && (f.L||0)>=1 }
  ],
  karate:[
    { id:'cl_ka1', lbl:'L\u2019Éclair', desc:'Le temps que l\u2019adversaire comprenne ce qui vient de se passer, c\u2019est déjà terminé.', fx:{footSpeed:8,explosiveness:6,durability:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.35 },
    { id:'cl_ka2', lbl:'Le Maître Du Point', desc:'Un combat, c\u2019est une équation. Lui, il connaît toutes les solutions.', fx:{fightIQ:8,composure:6,power:-6},
      fit:f=>((f.dec||0)/Math.max(1,f.W))>=0.4 },
    { id:'cl_ka3', lbl:'Le Kamikaze', desc:'Chaque coup de pied part pour terminer le combat. Tant pis pour la suite s\u2019il rate.', fx:{kick:8,killer:6,composure:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.5 }
  ],
  sambo:[
    { id:'cl_sb1', lbl:'Le Projeteur', desc:'Il n\u2019y a pas de meilleure façon de commencer un round qu\u2019en finissant l\u2019autre dans les airs.', fx:{takedown:8,strength:6,submission:-6},
      fit:f=>(f.W||0)>=8 },
    { id:'cl_sb2', lbl:'Le Casse-Membres', desc:'Une articulation à la fois, jusqu\u2019à ce que l\u2019un des deux cède.', fx:{submission:8,flexibility:6,strength:-6},
      fit:f=>((f.sub||0)/Math.max(1,f.W))>=0.4 },
    { id:'cl_sb3', lbl:'Le Bulldozer', desc:'Avancer, encaisser, avancer encore. La fatigue, c\u2019est le problème de l\u2019autre.', fx:{power:8,gnp:6,cardio:-6},
      fit:f=>((f.ko||0)/Math.max(1,f.W))>=0.35 }
  ],
  mma:[
    { id:'cl_mm1', lbl:'Le Généraliste Complet', desc:'Aucune faiblesse identifiable — et c\u2019est bien ça le problème pour ceux d\u2019en face.', fx:{fightIQ:8,adaptability:6,power:-6},
      fit:f=>(f.L||0)<=2 && (f.W||0)>=6 },
    { id:'cl_mm2', lbl:'Le Finisseur Universel', desc:'Peu importe où le combat se déroule — debout, au sol, dans un coin — ça finit toujours pareil.', fx:{killer:8,power:6,composure:-6},
      fit:f=>(((f.ko||0)+(f.sub||0))/Math.max(1,f.W))>=0.5 },
    { id:'cl_mm3', lbl:'Le Stratège', desc:'Chaque round est un problème résolu avant même d\u2019entrer dans la cage.', fx:{composure:8,discipline:6,aggression:-6},
      fit:f=>((f.dec||0)/Math.max(1,f.W))>=0.4 }
  ]
};
/* ==== [FIN ANCRE] ==== */
const RAR_COLORS={C:'var(--text)',R:'#4DA6FF',E:'var(--gold)',L:'var(--blood)',M:'#8b5cf6'};
/* --------------------------- roster / classement -------------------------- */
/* ==== [ANCRE: AMA_CHAMPIONSHIPS] — un seul combat décisif (version légère
   validée), aucune incidence sur f.org/ORGS, amateurs uniquement. Config-driven
   pour ajouter facilement d'autres pays plus tard sans dupliquer de logique. ==== */
const AMA_CHAMPIONSHIPS=[
 {id:'wma',label:'WMA',name:'Championnat du monde amateur',country:null,rankMin:1,rankMax:2},
 ...COUNTRY_KEYS.map(ck=>{ const pfx=COUNTRY_MMA_PREFIX[ck]; const label=pfx+'MMA';
   return {id:label.toLowerCase(),label,name:`Championnat ${COUNTRIES[ck].name} amateur`,country:ck,rankMin:2,rankMax:5}; })
];
function amaScopedPool(f,cfg){ return G.roster.filter(o=>o.org===0 && o.div===f.div && (o.W+o.L+(o.D||0))>=5 && (!cfg.country || o.countryKey===cfg.country)); }
function amaScopedRank(f,cfg){ const pool=amaScopedPool(f,cfg).filter(o=>o.id!==f.id).concat([f]); return rankPool(pool).findIndex(o=>o===f)+1; }
function generateTournament(f,cfg){
  const pool=amaScopedPool(f,cfg);
  let top8=rankPool(pool).filter(o=>o.id!==f.id).slice(0,7);
  top8.push(f);
  top8=rankPool(top8); // reseeding avec le joueur inclus
  const matches=[{a:top8[0],b:top8[7]},{a:top8[1],b:top8[6]},{a:top8[2],b:top8[5]},{a:top8[3],b:top8[4]}];
  return {cfg,step:'Quarts de finale',matches,active:true};
}
function checkAmaChampionship(f){
  if(f.org!==0 || (f.W+f.L+(f.D||0))<5) return null;
  if(!f.amaTitles) f.amaTitles=[];
  if(!f.amaAttempted) f.amaAttempted=[];
  // Plafond de réalisme : être top 8 d'un pool national restreint ne suffit
  // pas si le classement général est médiocre (confirmé : joueur classé #44
  // au global repêché pour un tournoi censé représenter l'élite du pays,
  // à cause d'un pool pays/division trop petit). On exige en plus d'être
  // dans le premier quart du classement général de la division.
  const globalCeiling=Math.max(8, Math.round(G.roster.length*0.25));
  if(divRank(f)>globalCeiling) return null;
  for(const cfg of AMA_CHAMPIONSHIPS){
    if(f.amaAttempted.includes(cfg.id)) continue;
    if(cfg.country && f.countryKey!==cfg.country) continue;
    // Le bracket a besoin de 7 AUTRES participants réels : un pool scoped trop
    // petit (style/pays rare) ne peut pas remplir 8 places sans planter sur des
    // indices vides.
    if(amaScopedPool(f,cfg).filter(o=>o.id!==f.id).length<7) continue;
    const rnk=amaScopedRank(f,cfg);
    if(rnk>=1 && rnk<=8) return cfg; // n'importe qui du Top 8 est repêché pour le bracket
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: LINEAGE] — registre des ceintures (Phase 6). Array de règnes,
   pas de clé composite string (évite toute ambiguïté de parsing) ; groupé par
   org+divName seulement à l'affichage (scr_beltLineage). Année réelle prise
   sur G.season.year (G.year n'existe nulle part dans l'état du jeu). ==== */
function recordTitleChange(org,divName,champion,dethroned){
  if(!G.titleHistory) G.titleHistory=[];
  G.titleHistory.unshift({org,divName,champion,year:(G.season&&G.season.year)||1,defenses:0,dethroned:dethroned||'Aucun'});
  if(G.titleHistory.length>200) G.titleHistory.length=200;
}
function recordTitleDefense(org,divName,champion){
  if(!G.titleHistory) G.titleHistory=[];
  const reign=G.titleHistory.find(r=>r.org===org&&r.divName===divName&&r.champion===champion);
  if(reign) reign.defenses+=1;
}
/* ==== [FIN ANCRE] ====*/
// ==== [ANCRE: DIFFICULTE_GLOBALE] — barème initial abaissé de 9 points sur
// /100 (le jeu était trop dur), puis réajusté à la hausse sur les paliers
// les plus bas (item demandé : amateur +4, palier 1 +2, palier 2 +2) car ce
// premier abaissement les avait rendus trop faciles. Paliers 3+ inchangés.
function orgLevel(org){ return [33,39,47,52,58,64,64][org]||31; }
function makeOrgRoster(f, oldRoster=null){ const base=orgLevel(f.org); const pool=[];
  const isAmateur=(f.org===0);
  const needed=isAmateur?100:30; // pro : 1 champion + 15 contenders classés + 14 non classés
  // Array.isArray est nécessaire : oldRoster peut valoir le sentinel 'PRO_TRANSITION'
  // (une chaîne, qui a un .length mais pas de .filter) — sans cette garde, ça plante.
  if(!isAmateur && oldRoster && Array.isArray(oldRoster) && oldRoster.length>0){
    const survivors=oldRoster.filter(o=>o.id!==f.id && !o.champion).slice(0,4);
    survivors.forEach(o=>{ o.attrs.fightIQ=clamp(o.attrs.fightIQ+RI(1,3),1,100); o.overall=overall(o); pool.push(o); });
  }
  if(!isAmateur && oldRoster==='PRO_TRANSITION' && f.amateurRivals){
    // ==== [ANCRE: CORRECTIF_ELO_RIVAUX_AMATEURS] — bug trouvé : org et
    // overall étaient bien mis à niveau pro, mais orgElo/careerElo gardaient
    // leur valeur amateur (~800), très en dessous du reste du roster pro
    // fraîchement généré (eloBaseline(f.org,...) ≈ 1000+). Ces rivaux
    // s'effondraient au fond de tout classement trié par Elo et devenaient
    // structurellement injoignables par le matchmaking de proximité.
    f.amateurRivals.forEach(r=>{ r.org=f.org; r.overall=clamp(r.overall+RI(5,12),35,95); r.isAmateurRival=true; r.orgWins=RI(0,2);
      r.orgElo=eloBaseline(r.org,r.overall); r.careerElo=eloBaseline(r.org,r.overall); pool.push(r); });
  }
  const toGenerate=needed-pool.length;
  for(let i=0;i<toGenerate;i++){ const lv=clamp(base+RI(-10,14),20,97);
    const age=isAmateur?RI(17,24):RI(22,35);
    const o=makeFighter({gender:f.gender,div:f.div,level:lv,potential:lv+RI(2,12),age});
    o.org=f.org; // bug confirmé et corrigé : restait à 0 par défaut, faussant le x1.4 Pacific Championship
    o.W=isAmateur?RI(0,15):RI(6,24); o.L=isAmateur?RI(0,6):RI(1,8);
    o.ko=RI(0,o.W);
    o.streak=(o.L===0)?o.W:RI(-2,Math.min(5,o.W));
    if(!isAmateur) o.amaRec={W:RI(2,12),L:RI(0,4)};
    if(f.org>=3){ // durcissement de l'IA en ligue haute — évite les victoires faciles par spam
      o.attrs.tdd=clamp(o.attrs.tdd+RI(8,16),1,100);
      o.attrs.fightIQ=clamp(o.attrs.fightIQ+RI(6,12),1,100);
      o.attrs.durability=clamp(o.attrs.durability+RI(5,10),1,100);
      o.overall=overall(o);
    }
    // le PNJ est censé être établi DANS cette orga depuis un moment — sans ça,
    // la dynamique Elo (orgElo pèse 80%) donnerait un roster entièrement plat.
    // Pour l'amateur (org 0), seul careerElo compte dans p4pScore : il DOIT être
    // corrélé au record généré, sinon un PNJ classé peut afficher un palmarès
    // perdant (1-4) tout en étant classé #1 — confirmé, c'était le cas.
    const bias=Math.round((o.W-o.L)*18);
    if(!isAmateur){ o.orgElo=eloBaseline(f.org,o.overall)+bias+RI(-40,40); o.careerElo=eloBaseline(f.org,o.overall)+Math.round(bias*0.6); }
    else { o.careerElo=eloBaseline(0,o.overall)+bias+RI(-20,20); }
    pool.push(o); }
  const ranked=rankPool(pool);
  if(f.org>=1){ ranked[0].champion=(f.org>=5?'monde':f.org===4?'europe':f.org===3?'national':f.org===2?'regional':'local'); ranked[0].defenses=RI(0,4); ranked[0].orgElo=Math.max(ranked[0].orgElo||0,eloBaseline(f.org,ranked[0].overall)+RI(150,300)); }
  return ranked;
}
// ==== [ANCRE: CORRECTIF_DOUBLE_RANG_1] — bug trouvé : divRank(x) ajoutait
// TOUJOURS le fighter passé en argument à son propre pool de classement,
// jamais le vrai joueur (G.f) quand on classait un ADVERSAIRE. Résultat : le
// joueur pouvait être rang #1 ET un adversaire proposé être calculé comme
// rang #1 lui aussi (chacun manquant l'autre dans son propre calcul) — deux
// "rang #1" simultanés, exactement le cas signalé (adversaire "Challenger #1"
// alors que le joueur est déjà #1). Le pool de classement est maintenant
// construit UNE SEULE FOIS, en y incluant toujours le vrai joueur (sauf s'il
// est déjà champion, comme pour tout autre classement de la division).
function divRank(target){
  const pool=rankPool(G.roster.filter(o=>!o.champion).concat(G.f.champion?[]:[G.f]));
  return pool.findIndex(o=>o===target)+1;
}
function advanceRoster(){
  if(typeof generateNPCNews==='function') generateNPCNews();
  const allFighters=G.roster.concat(G.f.champion?[]:[G.f]);
  const oldRanks={}; rankPool(allFighters).forEach((o,i)=>oldRanks[o.id]=i);
  const r=G.roster.filter(o=>!o.champion);
  const simCount=Math.min(Math.floor(r.length/1.5),20); // plafonné : roster amateur = 100, sans cap ça ferait ~66 combats simulés à chaque cycle
  const fought=new Set();
  for(let n=0;n<simCount;n++){ const a=pick(r),b=pick(r); if(a===b)continue; const res=simulateFight(a,b,3); applyResult(a,b,res,'A'); applyResult(b,a,res,'B');
    if(a.orgElo===undefined) a.orgElo=eloBaseline(a.org,a.overall); if(a.careerElo===undefined) a.careerElo=eloBaseline(a.org,a.overall);
    if(b.orgElo===undefined) b.orgElo=eloBaseline(b.org,b.overall); if(b.careerElo===undefined) b.careerElo=eloBaseline(b.org,b.overall);
    const d=calculateEloDelta(a.orgElo,b.orgElo,res.winner,res.method,res.round);
    a.orgElo=Math.max(500,a.orgElo+d.deltaA); b.orgElo=Math.max(500,b.orgElo+d.deltaB);
    a.careerElo=Math.max(500,a.careerElo+Math.round(d.deltaA*0.5)); b.careerElo=Math.max(500,b.careerElo+Math.round(d.deltaB*0.5));
    a.inactivityCycles=0; b.inactivityCycles=0; fought.add(a.id); fought.add(b.id);
  }
  // Décroissance d'inactivité (Rank Rust) : un PNJ non-combattant depuis 3+
  // cycles perd progressivement en crédibilité Elo.
  G.roster.forEach(o=>{ if(fought.has(o.id))return;
    if(o.inactivityCycles===undefined) o.inactivityCycles=0;
    o.inactivityCycles++;
    if(o.inactivityCycles>3){
      if(o.orgElo!==undefined) o.orgElo=Math.max(600,Math.round(o.orgElo*0.985));
      if(o.careerElo!==undefined) o.careerElo=Math.max(600,Math.round(o.careerElo*0.985));
    }
  });
  // ==== [ANCRE: CYCLE_VIE_PNJ] — manque confirmé : aucun PNJ ne vieillissait ni
  // ne prenait sa retraite en dehors des régénérations complètes de roster. Le
  // roster restait figé indéfiniment entre deux changements d'organisation.
  const freshR=[];
  G.roster.forEach(o=>{
    if(o.champion){ freshR.push(o); return; } // un champion ne part jamais sur un tirage aléatoire
    if(rnd()<0.15) o.age=(o.age||20)+1;
    const isNemesis=G.faith && o.id===G.f.faithNemesisId; // vieillit normalement, mais ne peut jamais être remplacée par un nouveau prospect
    const isTooOld=!isNemesis && (o.age>=39 && rnd()<0.5);
    const isWashedUp=!isNemesis && ((o.streak||0)<=-4);
    const totalOF=o.W+o.L;
    const isGatekeeper=!isNemesis && (totalOF>=15 && o.L>o.W+4);
    if(isTooOld||isWashedUp||isGatekeeper){
      const lv=clamp(orgLevel(G.f.org)+RI(-8,15),20,97);
      const prospect=makeFighter({gender:o.gender,div:o.div,level:lv,potential:lv+RI(3,14),age:RI(20,23)});
      prospect.org=o.org; prospect.W=0; prospect.L=0; prospect.D=0; prospect.streak=0;
      prospect.orgElo=Math.max(500,eloBaseline(o.org,prospect.overall)-60);
      prospect.careerElo=eloBaseline(o.org,prospect.overall);
      freshR.push(prospect);
    } else { freshR.push(o); }
  });
  G.roster=freshR;
  // ==== [FIN ANCRE] ====
  G.roster=rankPool(G.roster);
  rankPool(G.roster.concat([G.f])).forEach((o,i)=>{ const oldRk=oldRanks[o.id]; o.lastRankDelta=oldRk!==undefined?(oldRk-i):0; });
}

/* --------------------------- 3 adversaires + % ---------------------------- */
/* ==== [ANCRE: LEGENDS_RECONSTRUCT] — reconstruit un combattant simulable à
   partir des données figées du Panthéon. Utilise l.div (vrai ID de division)
   et l.styleKey (vrai ID de style) — PAS l.style/l.divName qui sont des noms
   d'affichage humains, incompatibles avec divById()/STYLES[] qui cherchent
   par ID exact. ==== */
// Neutralise l'avantage d'allonge entre deux combattants pour un combat
// d'exhibition inter-catégories (Fantasy Fight, Vs Ami, All-Stars) : on
// juge le combattant, pas son gabarit. N'affecte jamais les combats de
// carrière réels, qui restent intra-division par construction.
function neutralizeWeightGap(A,B){
  const avgReach=Math.round((((A.phys&&A.phys.reach)||0)+((B.phys&&B.phys.reach)||0))/2);
  if(A.phys) A.phys.reach=avgReach;
  if(B.phys) B.phys.reach=avgReach;
}
// Export/import d'une légende sous forme de code texte copiable — permet à un
// ami de partager une légende de SON Panthéon (stocké uniquement sur son
// appareil, il n'y a pas de serveur) pour l'affronter dans Vs Ami. Le code
// encode exactement la même forme d'objet que les entrées du Panthéon
// (voir enshrine() dans state.js), donc reconstructLegend() les traite de
// façon identique, qu'elles viennent de ton Panthéon ou d'un import.
function encodeLegendCode(l){
  try{ return btoa(unescape(encodeURIComponent(JSON.stringify(l)))); }catch(e){ return null; }
}
function decodeLegendCode(code){
  try{
    const obj=JSON.parse(decodeURIComponent(escape(atob((code||'').trim()))));
    if(!obj || !obj.name || !obj.attrs) return null;
    return obj;
  }catch(e){ return null; }
}
function reconstructLegend(l){
  const f=makeFighter({gender:'H',div:l.div||'H-welter',style:l.styleKey||'mma',first:l.name,age:l.age||35});
  if(l.attrs) f.attrs=JSON.parse(JSON.stringify(l.attrs));
  if(l.skills) f.skills=l.skills.slice();
  if(l.phys) f.phys=l.phys;
  if(l.overall) f.overall=l.overall;
  f.id=l.id||('legend_'+RI(1000,9999));
  f.name=l.name; f.first=l.name; f.last=l.name; f.nick=l.nick; f.flag=l.flag; f.styleLabel=l.style||l.styleKey; f.divName=l.divName||l.div;
  f.W=l.W; f.L=l.L; f.ko=l.ko; f.sub=l.sub; f.champion='monde';
  return f;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: CARD_SLOT_POSTER] — placement sur la carte d'événement et
   affiche officielle, jamais construits auparavant (confirmé absent). ==== */
/* ==== [ANCRE: CORRECTIF_PLACEMENT_CARTE] — bug remonté : le placement ne
   regardait QUE le rang du joueur, jamais celui de l'adversaire — un joueur
   classé #23 affrontant un adversaire #8 atterrissait quand même en Early
   Prelims, alors qu'un tel choc de haut niveau appartient au minimum à la
   Main Card. Le placement suit désormais le MEILLEUR des deux classements
   (le combattant le mieux classé "tire" le combat vers le haut de l'affiche),
   comme en pratique réelle où l'affiche se construit autour du nom le plus
   fort, pas du statut de celui qu'on suit. ==== */
function getCardSlot(f,opp,kind){
  if(f.org===0) return "CARTE AMATEUR";
  if(kind==='title'||kind==='defense'||kind==='champchamp_title') return "MAIN EVENT";
  const rnkF=divRank(f);
  // Sécurité : divRank() renvoie 0 si l'adversaire n'est pas trouvé dans le
  // roster de l'organisation courante (combat spécial, invité hors roster,
  // adversaire d'une autre org) — dans ce cas on ignore son rang plutôt que
  // de mal interpréter 0 comme "meilleur combattant du monde".
  const rnkOppRaw=(opp && opp.org===f.org)?divRank(opp):0;
  const rnkOpp=rnkOppRaw>0?rnkOppRaw:rnkF;
  const rnk=Math.min(rnkF,rnkOpp);
  if(rnk<=3) return "CO-MAIN EVENT";
  if(rnk<=7) return "MAIN CARD";
  if(rnk<=12) return "PRELIMS";
  return "EARLY PRELIMS";
}
function renderFightPoster(f,opp,kind){
  const slot=getCardSlot(f,opp,kind);
  const slotColors={'CARTE AMATEUR':'var(--muted)','EARLY PRELIMS':'var(--line)','PRELIMS':'#4DA6FF','MAIN CARD':'var(--sage)','CO-MAIN EVENT':'var(--blood)','MAIN EVENT':'var(--gold)'};
  const borderColor=slotColors[slot]||'var(--gold-d)';
  const orgName=orgDisplayName(f).toUpperCase();
  const fLast=esc(f.last||f.name).toUpperCase();
  const oppLast=esc(opp.last||opp.name).toUpperCase();
  return `<div class="card glass raise" style="text-align:center;background:linear-gradient(180deg,var(--panel2) 0%,var(--bg) 100%);border-color:${borderColor};padding:24px 16px;margin-bottom:24px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;left:-20px;font-size:120px;opacity:0.03;font-family:'Oswald';font-weight:700;color:var(--gold);pointer-events:none;z-index:0">${orgName}</div>
    <div class="eyebrow gold mb" style="position:relative;z-index:2;letter-spacing:0.3em">${orgName} // ${slot}</div>
    <div class="disp" style="position:relative;z-index:2;font-size:clamp(32px,9vw,42px);line-height:1.1;margin:12px 0">
      <span style="color:var(--text)">${fLast}</span><br>
      <span class="muted" style="font-size:18px;display:inline-block;margin:8px 0;font-family:'JetBrains Mono'">VS</span><br>
      <span style="color:var(--sage)">${oppLast}</span>
    </div>
    <div class="mono small muted mt" style="position:relative;z-index:2;border-top:1px solid var(--line);padding-top:12px">${(f.divName||'').toUpperCase()} BOUT · ${(kind==='title'||kind==='defense')?'5 ROUNDS':'3 ROUNDS'}</div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_FANTASY_SETUP] ==== */
function scr_fantasySetup(){
  const list=loadHOF();
  if(list.length<2){
    return `<div class="scr center intro"><div class="eyebrow gold">Fantasy Fight</div><h2 class="disp">Choc des légendes</h2><p class="lede">Il faut au moins 2 légendes au Panthéon pour simuler un combat.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  }
  let selA=G.fantasyA!==undefined?G.fantasyA:0;
  let selB=G.fantasyB!==undefined?G.fantasyB:(list.length>1?1:0);
  const lA=list[selA], lB=list[selB];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Sandbox</div>
    <h2 class="disp">Fantasy Fight</h2>
    <p class="lede small">Sélectionne deux anciennes gloires du Panthéon pour un super-fight virtuel (5 rounds). Leurs attributs de fin de carrière sont préservés.</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:32px 0">
       <div style="flex:1;text-align:center">
         <div class="hero-name" style="font-size:22px;color:var(--blood)">${esc(lA.name)} ${lA.flag}</div>
         <div class="muted small mb">${lA.style} · ${lA.W}-${lA.L}</div>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(0,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(0,1)">▶</button>
       </div>
       <div class="disp gold" style="font-size:24px;padding:0 12px">VS</div>
       <div style="flex:1;text-align:center">
         <div class="hero-name" style="font-size:22px;color:var(--sage)">${esc(lB.name)} ${lB.flag}</div>
         <div class="muted small mb">${lB.style} · ${lB.W}-${lB.L}</div>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(1,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(1,1)">▶</button>
       </div>
    </div>
    <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.launchFantasyFight()">SIMULER LE CHOC</button>
    <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_ALLSTARS] ==== */
function scr_allstars(){
  const t=G.allstars;
  if(!t) return `<div class="scr center intro"><p class="lede">Aucun tournoi en cours.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">Tournoi All-Stars</span><span class="eyebrow x" onclick="CL.leaveAllStars()">✕</span></div>
         <h2 class="disp gold" style="font-size:32px">CHOC DES TITANS</h2>`;
  if(t.champion){
    h+=`<div class="card glass raise" style="text-align:center;padding:32px 16px;background:var(--panel2);border-color:var(--gold)">
          <div class="eyebrow gold mb">VAINQUEUR DU TOURNOI</div>
          <div style="font-size:60px">${getStyleEmoji(t.champion.styleLabel||t.champion.style)}</div>
          <div class="disp" style="font-size:42px;margin:16px 0">${esc(t.champion.name).toUpperCase()} ${t.champion.flag}</div>
          <p class="muted small">${getFighterBlurb(t.champion)}</p>
        </div>
        <button class="btn ghost mt" onclick="CL.leaveAllStars()">Retour à la Salle des Légendes</button>`;
  } else {
    h+=`<div class="eyebrow mb" style="color:var(--text);border-bottom:1px solid var(--line);padding-bottom:8px">${t.step.toUpperCase()}</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">`;
    t.matches.forEach(m=>{
      h+=`<div class="card glass" style="background:var(--panel2);padding:12px;display:flex;justify-content:space-between;align-items:center;opacity:${m.winner?0.55:1}">
            <div style="flex:1;text-align:right;font-family:'Oswald';font-size:18px">${getStyleEmoji(m.a.styleLabel||m.a.style)} ${esc(m.a.name)} ${m.a.flag}</div>
            <div class="mono muted" style="padding:0 16px;font-size:12px">${m.winner?(m.winner===m.a?'◀ GAGNE':'GAGNE ▶'):'VS'}</div>
            <div style="flex:1;text-align:left;font-family:'Oswald';font-size:18px">${m.b.flag} ${esc(m.b.name)} ${getStyleEmoji(m.b.styleLabel||m.b.style)}</div>
          </div>`;
    });
    const remaining=t.matches.filter(m=>!m.winner).length;
    h+=`</div><button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.advanceAllStars()">${remaining?'COMBAT SUIVANT':'PASSER AU TOUR SUIVANT'}</button>`;
  }
  if(t.history && t.history.length>0){
    h+=`<div class="card mt"><div class="eyebrow mb">Résultats précédents</div>`;
    t.history.forEach(log=>{ h+=`<div class="mono small" style="color:var(--sage);padding:4px 0;border-bottom:1px dotted var(--line)">${esc(log)}</div>`; });
    h+=`</div>`;
  }
  h+=`</div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_VS_FRIEND] ==== */
/* ==== [ANCRE: VSFRIEND_SERIE] — écran relais entre les manches d'une série
   Best-of-3 (5 rounds décisifs en cas d'égalité 1-1). ==== */
function scr_vs_friend_next(){
  const s=G.vsFriendScore, A=G.vsFriendLegendA, B=G.vsFriendLegendB;
  if(!s||!A||!B) return `<div class="scr center intro"><p class="lede">Série interrompue.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  return `<div class="scr center intro">
    <div class="eyebrow gold">Défi Multijoueur — Série</div>
    <h2 class="disp">${A.name} ${s.A} - ${s.B} ${B.name}</h2>
    <p class="lede">${s.A===1&&s.B===1?'Égalité. La manche décisive se jouera en 5 rounds.':`Manche ${s.round+1} sur 3 maximum.`}</p>
    <button class="btn primary mt" onclick="CL.launchVsFriend()">MANCHE SUIVANTE</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_vs_friend(){
  const list=loadHOF();
  const imported=G.importedFriendLegend;
  if(list.length===0){
    return `<div class="scr center intro"><div class="eyebrow gold">Défi Multijoueur</div><h2 class="disp">Panthéon vide</h2><p class="lede">${imported?`La légende de ${esc(imported.name)} a bien été importée, mais il te faut aussi au moins 1 légende dans TON propre Panthéon pour te représenter.`:'Il te faut au moins 1 légende au Panthéon pour défier un ami.'}</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  }
  if(list.length<2 && !imported){
    return `<div class="scr center intro">
      <div class="eyebrow gold">Défi Multijoueur</div>
      <h2 class="disp">Combattant d\u2019un ami</h2>
      <p class="lede small">Colle ici le LIEN ou le code que ton ami t\u2019a envoyé (généré depuis son Panthéon, bouton "Exporter"). Sans ça, il te faut au moins 2 légendes dans ton propre Panthéon.</p>
      ${G.lastMsg?(()=>{ const m=G.lastMsg; G.lastMsg=null; return `<div class="card glass" style="border-left:3px solid var(--loss);background:var(--panel2);padding:10px 14px;margin-top:12px"><span class="small">${esc(m)}</span></div>`; })():''}
      <textarea id="friend_code" placeholder="Colle ici le lien ou le code que ton ami t\u2019a envoyé..." style="width:100%;min-height:80px;background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:10px;font-family:'JetBrains Mono';font-size:12px;margin-top:16px"></textarea>
      <button class="btn primary mt" onclick="CL.importFriendCode()">IMPORTER LE CODE</button>
      <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
    </div>`;
  }
  let selA=G.vsFriendSelA!==undefined?G.vsFriendSelA:0;
  let selB=G.vsFriendSelB!==undefined?G.vsFriendSelB:(list.length>1?1:0);
  const lA=list[selA];
  const lB=imported||list[selB];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Défi Multijoueur</div>
    <h2 class="disp">Combattant d\u2019un ami</h2>
    <p class="lede small">Choisis ta légende. ${imported?'La légende de ton ami a été importée.':'Choisis la légende de ton Panthéon que ton ami incarne, ou importe son lien/code ci-dessous.'} Le combat se déroule dans ta catégorie de poids.</p>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin:32px 0;gap:16px">
      <div style="flex:1;text-align:center">
         <div class="eyebrow mb">Ta légende</div>
         <div class="hero-name" style="font-size:22px;color:var(--blood)">${esc(lA.name)}</div>
         <div class="muted small mb">${lA.style} · OVR ${lA.overall||'?'}</div>
         <div><button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(0,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(0,1)">▶</button></div>
      </div>
      <div class="disp gold" style="font-size:24px;padding-top:20px">VS</div>
      <div style="flex:1;text-align:center">
         <div class="eyebrow mb">${imported?'Légende importée de l\u2019ami':'Légende de l\u2019ami'}</div>
         <div class="hero-name" style="font-size:22px;color:var(--sage)">${esc(lB.name)}</div>
         <div class="muted small mb">${lB.style} · OVR ${lB.overall||'?'}</div>
         ${imported?`<button class="btn ghost" style="width:auto;padding:8px" onclick="CL.clearImportedFriend()">Retirer l\u2019import</button>`:
           `<div><button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(1,-1)">◀</button>
           <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(1,1)">▶</button></div>`}
      </div>
    </div>
    ${!imported?`<div class="glass card mb" style="background:var(--panel2);padding:12px;text-align:left">
      <div class="eyebrow mb">Importer une vraie légende d\u2019ami</div>
      <textarea id="friend_code" placeholder="Colle ici le lien ou le code de ton ami..." style="width:100%;min-height:60px;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px"></textarea>
      <button class="btn ghost mt" style="width:auto;padding:6px 12px" onclick="CL.importFriendCode()">Importer</button>
    </div>`:''}
    <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.launchVsFriend()">LANCER LE DÉFI</button>
    <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

