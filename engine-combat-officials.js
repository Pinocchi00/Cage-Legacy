"use strict";

/* ==== [ANCRE: P8_L7_ARBITRE_RELANCE] — Lot 7/P8 §7.1 : "un temps de
   contrôle sans progression... au-delà d'un seuil déclenche le retour
   debout... le seuil doit dépendre de la position". Seuils en SECONDES
   d'horloge réelle (roundLen/dt, ANCRE HORLOGE_CONTINUE) avant qu'une
   position sans progression ne soit relancée par l'arbitre — appliqué
   INDÉPENDAMMENT de GROUND_POS[pos].standupOk (qui ne gouverne que le
   relevé COMPÉTITIF du dessous, cf. groundStandupChance) : c'est
   exactement ce qui corrige la régression signalée par l'état des lieux du
   plan ("le contrôle au sol est rentable depuis le Lot 3 : sideControl et
   mount ont standupOk:false, le seul relevé possible vient du dessous
   depuis la garde, un contrôle stérile n'est donc jamais sanctionné").
   backControl est délibérément le seuil le plus haut ("presque
   indéfiniment", §7.1) : la position la plus dominante du jeu
   (GROUND_POS.backControl.dominance=4.2) ne doit pas être vidée de son
   intérêt par une relance systématique — seul un immobilisme VRAIMENT
   prolongé y met fin. ==== */
/* ==== [ANCRE: P8_L7_ARBITRE_RELANCE_CALIBRAGE] — première mesure (Monte
   Carlo 12 000 combats, seed 20260905) avec des seuils 42/42/55/60/75/130 :
   seulement 777 relances sur 12 000 combats (6.5%) et un temps de contrôle
   moyen des lutteurs INCHANGÉ contre baseline-P8.md (52.3s vs 52.4s,
   négligeable) — la plupart des séquences de contrôle sont déjà interrompues
   par une transition normale (passage de garde, tentative de soumission...)
   bien avant ces seuils, donc le mécanisme corrigeait le cas extrême sans
   toucher au gros du contrôle "actif" que Lot 3/P7 a construit. Seuils
   resserrés (environ -35 à -40%) pour que la relance intervienne aussi sur
   des séquences sensiblement plus courtes, sans pour autant punir une
   position tenue activement (un GNP ou une menace de soumission réels
   continuent de remettre l'horloge à zéro, cf. ANCRE P8_L7_ARBITRE_RELANCE
   ci-dessus) — backControl reste délibérément le seuil le plus haut. ==== */
const REF_STANDUP_THRESHOLD={closedGuard:26,openGuard:26,halfGuard:34,sideControl:37,mount:46,backControl:85};
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L7_ARBITRE_FAUTES] — Lot 7/P8 §7.1 : "la probabilité
   dépend d'attributs déjà présents (aggression, composure, fightIQ) —
   n'invente pas d'attribut nouveau". Neutre (~0.32% par tick à stats
   moyennes 50/50/50, avant mise à l'échelle dt/50) : un combattant agressif
   et impulsif (aggression haute, composure/fightIQ basses) commet
   sensiblement plus de fautes qu'un technicien discipliné, sans jamais
   dépasser un plafond raisonnable (0.03/tick, clampé). @returns {number} */
function foulChance(f){ return clamp((f.aggression-50)*0.00035-(f.composure-50)*0.00022-(f.fightIQ-50)*0.00018+0.0032,0.0006,0.03); }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L7_VOCABULAIRE_DECISIONS] — Lot 7/P8 §7.3 : fonction PURE
   (comme contextualGrapplingMult/takedownSigmoidSteep ci-dessus — exposée
   pour être testée directement plutôt que déduite d'un Monte Carlo bruité,
   cf. leur ANCRE respective), qui classe le verdict final des trois juges
   parmi les six libellés réels du sport. Remplace le vote binaire
   votesA/votesB (qui traitait une égalité de juge comme un simple non-vote
   et pouvait déclarer une "Décision" à un combattant n'ayant recueilli
   qu'UN SEUL juge décisif contre deux égalités — un vrai panel MMA rend ça
   un NUL majoritaire, jamais une victoire) par la classification complète
   des 10 répartitions possibles de trois votes de juge (A/B/égalité chacun).
   Reprise telle quelle par tools/monte-carlo-combat.js (win.judgesVerdict)
   pour recalculer un verdict hypothétique sans l'effet d'un retrait de
   point — un seul point de vérité, jamais une logique dupliquée qui
   pourrait diverger. @returns {{winner:string, method:string,
   judgeVerdicts:string[]}} */
function judgesVerdict(j1A,j1B,j2A,j2B,j3A,j3B){
  const judgeVerdict=(x,y)=>x>y?'A':x<y?'B':'D';
  const judgeVerdicts=[judgeVerdict(j1A,j1B),judgeVerdict(j2A,j2B),judgeVerdict(j3A,j3B)];
  const nA=judgeVerdicts.filter(v=>v==='A').length, nB=judgeVerdicts.filter(v=>v==='B').length, nD=judgeVerdicts.filter(v=>v==='D').length;
  if(nA===3||nB===3) return {winner:nA===3?'A':'B',method:'Décision unanime',judgeVerdicts};
  if(nD===3) return {winner:'D',method:'Nul unanime',judgeVerdicts};
  if(nA===2&&nD===1) return {winner:'A',method:'Décision majoritaire',judgeVerdicts};
  if(nB===2&&nD===1) return {winner:'B',method:'Décision majoritaire',judgeVerdicts};
  if(nA===2&&nB===1) return {winner:'A',method:'Décision partagée',judgeVerdicts};
  if(nB===2&&nA===1) return {winner:'B',method:'Décision partagée',judgeVerdicts};
  if(nD===2) return {winner:'D',method:'Nul majoritaire',judgeVerdicts};
  return {winner:'D',method:'Nul partagé',judgeVerdicts}; // 1-1-1, la seule combinaison restante
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L9_EXAMEN_MEDICAL] — Lot 9/P8 §9.3 : "distinct de l'arrêt
   médical déjà implémenté... la majorité des examens doivent laisser
   continuer". Fonction PURE : calcule la probabilité d'arrêt À L'ISSUE d'un
   examen ENTRE LES ROUNDS, à partir des mêmes compteurs déjà accumulés
   (coupures, blessures) — jamais un second système de gravité en parallèle
   de CUT_SEVERE_THRESHOLD/l'arrêt médical mi-round (CLAUDE.md §8). Plafonnée
   à 0.5 : un examen reste un examen, jamais une sentence automatique.
   @returns {number} */
function ringsideExamStopChance(cuts,hasInjury){
  return clamp((cuts||0)*0.035+(hasInjury?0.09:0),0,0.5);
}
/* ==== [FIN ANCRE] ==== */
