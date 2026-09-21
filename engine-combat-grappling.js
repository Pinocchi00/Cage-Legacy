"use strict";

/* ==== [ANCRE: P7_L3_HIERARCHIE_POSITIONS] — Lot 3/P7 §3.1 : remplace le
   booléen unique `topIsA` (deux états seulement : sol-A-dessus / sol-B-dessus,
   jamais de position) par une position NOMMÉE parmi six — garde fermée,
   garde ouverte, demi-garde, contrôle latéral, montée, contrôle du dos —
   plus la position debout et le clinch (inchangés). Mesuré par le plan
   (baseline-P7.md §1, §6) : 0.1 passe/0.1 renversement/0.1 relevé par
   combat, le sol ne représentant que 5.3% des frappes significatives — le
   jeu ne connaissait AUCUNE hiérarchie de position, une soumission sortait
   d'un tirage isolé (`subTop>2.5`) sans lien avec quoi que ce soit de
   construit. `topIsA` est conservé tel quel (qui est en position dominante),
   `groundPos` s'y ajoute — jamais un système parallèle : les mêmes variables
   dmgA/dmgB/st.X.* de toujours reçoivent les mêmes flux, seule la
   PROPORTION de contrôle/frappe/soumission qu'ils reçoivent chaque tick
   dépend désormais de la position courante (GROUND_POS[pos].*). ====
   Chaque position définit : qui contrôle et combien (ctrlMult, lu par les
   juges via posProf.dominance — §3.3, cohérence panneau/cartes), le volume/
   dangerosité des frappes possibles (gnpMult), les soumissions accessibles
   depuis cette position ET son inverse (topSubMult/botSubMult — le dessous
   n'est jamais passif : garde fermée/ouverte offre triangle/armbar/guillotine,
   contrôle du dos est la position la plus dangereuse du jeu pour le DESSUS
   qui l'occupe, topSubMult le plus haut du tableau), et si le dessous peut
   se relever complètement (standupOk — uniquement depuis la garde, jamais
   depuis demi-garde/latéral/montée/dos, où se relever tout court n'est pas
   une option réaliste sans d'abord récupérer une garde). */
const GROUND_POS_ORDER=['closedGuard','openGuard','halfGuard','sideControl','mount','backControl'];
const GROUND_POS={
  closedGuard:{dominance:1.0, ctrlMult:0.55, gnpMult:0.75, topSubMult:0.55, botSubMult:2.30, standupOk:true},
  openGuard:  {dominance:1.1, ctrlMult:0.40, gnpMult:0.85, topSubMult:0.50, botSubMult:2.60, standupOk:true},
  halfGuard:  {dominance:2.0, ctrlMult:0.85, gnpMult:1.25, topSubMult:1.10, botSubMult:1.05, standupOk:false},
  sideControl:{dominance:3.0, ctrlMult:1.05, gnpMult:1.75, topSubMult:1.60, botSubMult:0.35, standupOk:false},
  mount:      {dominance:4.0, ctrlMult:1.25, gnpMult:2.20, topSubMult:2.40, botSubMult:0.14, standupOk:false},
  backControl:{dominance:4.2, ctrlMult:1.20, gnpMult:1.25, topSubMult:3.40, botSubMult:0.00, standupOk:false}
};
/** Chance par seconde réelle (avant mise à l'échelle dt/50) que le dessus fasse
 * progresser la position (passage de garde, avancée vers le dos) — §3.1,
 * gouvernée par topControl/strength/explosiveness du dessus contre le jeu de
 * garde (`guard`, canal dérivé de guardWork+flexibility) et la souplesse du
 * dessous. @returns {number} */
function groundPassChance(top,bot){
  const off=top.topControl*0.55+top.strength*0.30+top.explosiveness*0.15;
  const def=bot.guard*0.6+bot.flexibility*0.25+bot.strength*0.15;
  return clamp((off-def)/78+0.18,0.06,0.82);
}
/** Chance que le dessous récupère une position moins défavorable (demi-garde
 * plutôt que latéral, garde plutôt que demi-garde) sans renverser le combat —
 * gouvernée par guardWork/flexibility/explosiveness/strength du dessous
 * contre topControl du dessus. @returns {number} */
function groundRecoverChance(top,bot){
  const off=bot.guard*0.45+bot.flexibility*0.25+bot.explosiveness*0.15+bot.strength*0.15;
  const def=top.topControl*0.75+top.strength*0.15;
  return clamp((off-def)/150+0.07,0.015,0.45);
}
/** Chance d'un renversement complet (le dessous devient dessus) — plus rare
 * qu'une simple récupération de position, uniquement depuis garde/demi-garde
 * (§3.1 : "garde fermée offre balayages et soumissions"). @returns {number} */
function groundSweepChance(top,bot){
  const off=bot.guard*0.4+bot.explosiveness*0.3+bot.strength*0.3;
  const def=top.topControl*0.85+top.strength*0.2;
  return clamp((off-def)/220+0.02,0.004,0.18);
}
/** Chance que le dessous se relève complètement (retour debout) — uniquement
 * depuis garde fermée/ouverte, cf. GROUND_POS[pos].standupOk. @returns {number} */
function groundStandupChance(top,bot,topFat){
  return clamp((bot.guardWork*0.35+bot.explosiveness*0.25+bot.footwork*0.25-top.topControl*0.35-topFat*0.4)/180,0.01,0.28);
}
/** Chance que le dessus saute une étape et prenne directement le dos, depuis
 * contrôle latéral ou montée — rare, gouvernée par topControl/submission/
 * explosivité du dessus contre le jeu de garde/souplesse du dessous. @returns {number} */
function groundBackTakeChance(top,bot){
  const off=top.topControl*0.4+top.submission*0.25+top.explosiveness*0.2;
  const def=bot.guard*0.5+bot.flexibility*0.3;
  return clamp((off-def)/150+0.025,0.006,0.21);
}
/** Chance que le dessous s'échappe du contrôle du dos (seule sortie possible
 * depuis cette position, vers la demi-garde) — gouvernée par flexibility/
 * strength/explosiveness du dessous contre topControl/strength du dessus.
 * @returns {number} */
function groundBackEscapeChance(top,bot){
  const off=bot.flexibility*0.35+bot.strength*0.3+bot.explosiveness*0.35;
  const def=top.topControl*0.7+top.strength*0.2;
  return clamp((off-def)/200+0.02,0.006,0.16);
}
/** La garde fermée s'ouvre (plus dynamique, plus de menace de soumission/
 * balayage pour le dessous, moins de contrôle pour le dessus) quand le
 * dessous a le jeu de garde/l'explosivité pour la maintenir active.
 * @returns {number} */
function groundGuardOpenChance(bot){ return clamp((bot.guardWork+bot.explosiveness)/1400+0.05,0.03,0.14); }
/** La garde ouverte se referme (repli défensif du dessous). @returns {number} */
function groundGuardCloseChance(bot){ return clamp(bot.guardWork/900+0.03,0.02,0.10); }
/** Position au sol par défaut après une amenée réussie — la plupart
 * atterrissent en garde fermée (majorité des amenées MMA réelles), mais une
 * amenée nettement dominante (grand écart takedown+strength+explosiveness du
 * preneur contre guard+flexibility du défenseur) a une chance de passer
 * directement en demi-garde, voire contrôle latéral (double jambe explosif
 * qui passe la garde dans le même geste). @returns {string} */
function initialGroundPos(top,bot){
  const dom=(top.takedown+top.strength*0.3+top.explosiveness*0.3)-(bot.guard+bot.flexibility*0.3);
  if(dom>34) return rnd()<0.35?'sideControl':'halfGuard';
  if(dom>16) return rnd()<0.3?'halfGuard':'closedGuard';
  return 'closedGuard';
}
/** Multiplicateur de défense contre une soumission — §3.2 : "elle se
 * défend (flexibility, composure, strength)". Neutre (1) pour un défenseur
 * aux stats moyennes (50 chacune), plus dur à finir au-dessus, plus facile
 * en dessous. @returns {number} */
function submissionDefenseMult(def){
  return clamp(1-((def.flexibility+def.composure+def.strength)/300-0.5)*0.7,0.5,1.3);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L7_CAGE_POSITION] — Lot 7/P8 §7.2 : "ajoute l'adossement
   comme position, dans la même structure que GROUND_POS — pas un système
   parallèle". Le clinch n'était jusqu'ici qu'un état binaire (clinché ou
   non) sans lieu — CLINCH_POS distingue désormais le clinch au CENTRE de la
   cage du clinch CONTRE LA CAGE, avec son propre profil de contrôle
   (ctrlMult), de volume de frappe (volMult), de propension à nourrir une
   amenée (tdMult — "porte d'entrée naturelle des amenées et de la lutte de
   cage", §7.2 : la cage est structurellement plus propice à une amenée que
   le centre, cf. tout lutteur qui pousse son adversaire contre le grillage
   en MMA réel) et de facilité à s'en dégager vers l'autre position
   (breakMult, lu par les transitions ci-dessous, ANCRE
   P8_L7_CAGE_TRANSITIONS). ==== */
const CLINCH_POS={
  center:{ctrlMult:0.85, volMult:0.88, tdMult:0.80, breakMult:1.25},
  cage:  {ctrlMult:1.20, volMult:1.12, tdMult:1.30, breakMult:0.70}
};
/* ==== [FIN ANCRE] ==== */
