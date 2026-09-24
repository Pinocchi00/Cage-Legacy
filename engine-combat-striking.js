"use strict";

/* ==== [ANCRE: P7_L2_DEGATS_USURE_COUPS_LOURDS] — Lot 2/P7 §2.1 : remplace le
   flux unique borné par tick (`dmgA+=clamp(offB*0.22*0.22,0,6)*(dt/50)`,
   mesuré par le plan à moyenne 11,35/σ 6,23/p90 19/max 35 sur 24 000 relevés
   — cf. tools/reports/baseline-P7.md) par deux composantes : une usure
   continue de faible amplitude (WEAR_*), et des coups lourds rares à queue
   épaisse (HEAVY_*) dont le plafond porte sur UN coup, jamais sur la somme
   d'un tick ou d'un round. Unifie au passage deux pools de dégâts qui
   vivaient chacun leur vie sans le moindre lien : dmgA/dmgB (fatigue,
   jamais remis à zéro par la cloche que pour SA part fatigue, ANCRE
   RECUP_INTER_ROUND) d'une part, et st.X.dmgHead/dmgBody/dmgLegs — la
   métrique "dégâts cumulés" mesurée par le plan et par
   tools/monte-carlo-combat.js (samples.dmgTotal) — de l'autre, cette
   dernière étant jusqu'ici alimentée par un tirage aléatoire (`rDmg`,
   40%/30%/30% tête/corps/jambes) totalement DÉCONNECTÉ de la frappe
   réellement portée ce tick (headA/bodyA/legA). Les deux composantes
   alimentent désormais les deux pools À LA FOIS, avec la même répartition
   de zone que la frappe qui les a produites — un seul mécanisme de dégâts,
   deux composantes, jamais un système parallèle (CLAUDE.md §8). ==== */
const WEAR_PER_LANDED=0.16;      // usure : fond continu, faible, proportionnel au volume réellement touché
const HEAVY_BASE_CHANCE=0.030;   // proba de base qu'un coup PARTICULIER de ce tick soit un coup lourd
const HEAVY_TAIL_ALPHA=1.5;      // pente de la queue de Pareto (plus petit = queue plus épaisse)
const HEAVY_TAIL_CAP=6;          // plafond du facteur de queue tiré, avant mise à l'échelle puissance/menton
const HEAVY_BASE_AMP=3.0;        // amplitude de base d'un coup lourd "moyen"
const HEAVY_MIN_AMP=2.5;         // en dessous, ce n'est qu'une frappe parmi d'autres (déjà couverte par l'usure)
const HEAVY_MAX_AMP=38;          // plafond par ÉVÉNEMENT (jamais par tick ni par round, cf. §2.1)
const HEAVY_WOBBLE_AMP=9;        // amplitude à partir de laquelle un coup lourd sonne son destinataire
const DANGER_TICKS_KD=15;        // fenêtre de danger (secondes d'horloge) ouverte par un knockdown non conclu
const DANGER_TICKS_HEAVY=9;      // ouverte par un coup lourd qui sonne sans mettre à terre
const DANGER_TICKS_WOBBLE=6;     // ouverte par l'ancien seuil "sonné" (pA/pB>=8)
const CUT_SEVERE_THRESHOLD=3;    // nombre d'ouvertures avant qu'une coupure devienne matière à arrêt médical
/** Probabilité qu'un coup PARTICULIER touche lourd ce tick, sachant les canaux
 * eff() de l'attaquant, la fatigue courante du défenseur et s'il traverse déjà
 * une fenêtre de danger (vulnérabilité du moment, §2.1). @returns {number} */
function heavyShotChance(att,defFat,defInDanger){
  const offense=clamp((att.power*0.38+att.cross*0.22+att.hook*0.18+att.killer*0.12+att.handSpeedRaw*0.10)/70,0.35,1.9);
  const vuln=1+clamp(defFat,0,28)*0.045+(defInDanger?0.9:0);
  return clamp(HEAVY_BASE_CHANCE*offense*vuln,0,0.12);
}
/** Amplitude d'un coup lourd qui vient de toucher — tirage à queue épaisse
 * (type Pareto), mis à l'échelle par la puissance de l'attaquant et le
 * menton/résistance du défenseur (§2.1 : "l'amplitude dépend de power et du
 * chin/durability de celui qui encaisse"). @returns {number} */
function heavyShotAmplitude(att,def){
  const powerFactor=clamp(att.power/72,0.5,1.7);
  const chinFactor=clamp(120/((def.chin*0.6+def.durability*0.4)+50),0.55,1.6);
  const tail=Math.min(HEAVY_TAIL_CAP,1/Math.pow(1-Math.min(rnd(),0.992),1/HEAVY_TAIL_ALPHA));
  return clamp(HEAVY_BASE_AMP*powerFactor*chinFactor*tail,HEAVY_MIN_AMP,HEAVY_MAX_AMP);
}
/** Répartit un montant de dégâts entre tête/corps/jambes selon les MÊMES
 * proportions que la frappe qui vient de le produire (headW/bodyW/legW),
 * au lieu d'un tirage uniforme déconnecté — voir ANCRE ci-dessus. */
function applyZoneDamage(st,amount,headW,bodyW,legW){
  if(amount<=0) return;
  const total=headW+bodyW+legW;
  if(total<=0){ st.dmgHead+=amount; return; } // repli tête, cohérent avec l'ancien biais 40%
  st.dmgHead+=amount*(headW/total);
  st.dmgBody+=amount*(bodyW/total);
  st.dmgLegs+=amount*(legW/total);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L9_TAXONOMIE_FRAPPES] — Lot 9/P8 §9.1 : "la frappe est
   aujourd'hui un scalaire réparti a posteriori sur une zone. Ajoute des
   TYPES de frappe... les noms de prises signature doivent être branchés
   sur cette taxonomie plutôt que tirés indépendamment". Les montants de
   zone (headA/bodyA/legA en debout, headHits/bodyHits en clinch, gHits au
   sol) restent calculés EXACTEMENT comme avant ce lot — aucune ligne de
   dégâts/points/score n'est modifiée, jamais un second système de dégâts
   (CLAUDE.md §8). Cette classification est une couche PUREMENT ADDITIVE
   par-dessus un montant déjà décidé : elle alimente st.X.byType
   (répartition par type, rapport §9 "cohérente avec l'empreinte de chaque
   style") et la propension à ouvrir une coupure (STRIKE_CUT_MULT, coude
   très supérieur au reste — §9.1 "les coudes sont l'ouvreur principal de
   coupures"), jamais l'issue du combat elle-même. Coudes et genoux restent
   indisponibles à distance (§9.1 : coude "disponible qu'au clinch et au
   sol", genou "arme du clinch") — standingStrikeMix() ne les propose donc
   JAMAIS, ils n'apparaissent que dans les blocs clinch/sol ci-dessous. ==== */
const STRIKE_CUT_MULT={jab:0.5,cross:1.3,hook:1.5,uppercut:1.1,elbow:4.5,knee:0.9,legKick:0.1,bodyKick:0.6,headKick:1.8,spinning:1.6,frontKick:0.4,groundPunch:1.0};
/** Répartit un volume de frappes significatives DÉJÀ décidé pour une zone
 * ('head'|'body'|'leg') en phase debout entre les familles poing/kick/
 * tournant, selon les attributs PROPRES de l'attaquant (jab/cross/hook/kick,
 * déjà lus ailleurs dans ce fichier) — jamais un second jet qui changerait
 * le volume total atterri. @returns {Object<string,number>} fractions qui
 * somment à 1. */
function standingStrikeMix(att,zone){
  if(zone==='leg') return {legKick:1};
  const kickBias=clamp(((att.kick||50)-35)/115,0.04,0.5);
  const kickShare=zone==='body'?kickBias*0.55:kickBias*0.30;
  const frontKickShare=zone==='body'?Math.min(0.06,kickBias*0.12):0;
  const spinShare=zone==='head'?Math.min(0.05,kickBias*0.10):0;
  /* ==== [ANCRE: CORRECTIF_TAXONOMIE_MIX_SOMME] — bug trouvé par le test
     dédié (regressionFixes.test.js) : `spinShare` est déjà PRÉLEVÉ SUR
     `kickShare` (headKick=kickShare-spinShare ci-dessous, jamais une part
     séparée qui s'ajouterait à kickShare) — le soustraire une SECONDE fois
     ici faisait retomber la somme des fractions à `1-spinShare` au lieu de
     1 (jusqu'à 5% de frappes "perdues", jamais classées nulle part). Ne
     jamais soustraire spinShare deux fois : une seule fois, au moment où
     il est effectivement prélevé (headKick). ==== */
  const punchShare=Math.max(0,1-kickShare-frontKickShare);
  /* ==== [FIN ANCRE] ==== */
  const wJab=Math.max(1,(att.jab||50)+15), wCross=Math.max(1,(att.cross||50)+5),
        wHook=Math.max(1,(att.hook||50)), wUpper=Math.max(1,((att.hook||50)+(att.power||50))*0.35);
  const wSum=wJab+wCross+wHook+wUpper;
  return {
    jab:punchShare*wJab/wSum, cross:punchShare*wCross/wSum, hook:punchShare*wHook/wSum, uppercut:punchShare*wUpper/wSum,
    bodyKick:zone==='body'?kickShare:0, headKick:zone==='head'?kickShare-spinShare:0, spinning:spinShare, frontKick:frontKickShare
  };
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L9_BLESSURES] — Lot 9/P8 §9.2 : "main cassée, genou
   lâché, arcade fermée... dégrade une capacité précise pour le reste du
   combat — pas un malus global — et peut, dans les cas extrêmes, terminer
   le combat". Constantes calibrées par Monte Carlo (voir rapport de lot) :
   volontairement rares (une poignée de combats sur 12 000), la majorité
   dégradant sans jamais terminer le combat — voir §7 du rapport pour les
   chiffres mesurés. ==== */
const INJURY_HAND_AMP_THRESHOLD=15;   // amplitude d'un coup lourd à partir de laquelle SON AUTEUR risque sa propre main
const INJURY_HAND_CHANCE=0.60;        // proba par tick qu'un tel coup blesse la main de son auteur (avant mise à l'échelle dt/50)
const INJURY_HAND_POWER_MULT=0.55;    // dégradation de power pour le reste du combat (canal précis, jamais un malus global)
const INJURY_HAND_END_CHANCE=0.10;    // proba que la blessure mette fin au combat sur le coup (cas extrême, §9.2)
const INJURY_KNEE_CHANCE=0.010;       // proba par tick de scramble au sol qu'un genou lâche (avant dt/50)
const INJURY_KNEE_MULT=0.55;          // dégradation takedown/footwork pour le reste du combat
const INJURY_KNEE_END_CHANCE=0.12;
const INJURY_EYE_CUTS_THRESHOLD=2;    // nombre de coupures déjà ouvertes avant qu'une arcade puisse "fermer" pour de bon
const INJURY_EYE_CHANCE=0.16;         // proba, une fois ce seuil de coupures atteint, que ça devienne une vraie blessure
const INJURY_EYE_MULT=0.85;           // dégradation composure/footwork (vision troublée), jamais un malus global
const HEAD_CLASH_CHANCE=0.032;       // proba par tick en clinch/sol d'un choc de tête accidentel (ouvre une coupure, §9.1 "chocs de têtes")
/* ==== [FIN ANCRE] ==== */
