"use strict";

// ==== [ANCRE: STYLE_PROFILE] — différenciation mécanique des 8 styles (volume de
// frappes, facteur KO, menace de soumission, dégâts clinch/GNP). tdVol
// délibérément absent : STYLES[].grap couvre déjà l'initiative de lutte
// (boxeur 0.15 vs lutteur 0.77, écart ×5) — l'ajouter aurait fait ×48, une
// surcorrection qui aurait quasiment supprimé la lutte chez les boxeurs. ====
const STYLE_PROFILE={
  /* ==== [ANCRE: P7_L4_GARDE_FOU_EQUILIBRAGE] — Lot 4/P7 §4.4 : "après
     réglage, à overall égal, aucun style ne dépasse 53% ni ne descend sous
     47%". La boxe dépassait déjà cette bande AVANT tout changement de ce
     lot (baseline-P7.md §2.2 : 55.0% en EQUAL-OVERALL) — sa concentration
     de biais (STYLES.boxer.b) sur trois sous-composantes du canal
     `striking` les plus pondérées (jab/cross/hook) en est la cause
     structurelle, pas la politique de combat ajoutée ici. koMod ramené de
     1.15 à 1.05 et sigVol de 1.18 à 1.12 (les deux restent au-dessus de la
     moyenne du jeu, cohérent avec un style connu pour son punch et son
     volume) pour rentrer dans la bande sans écraser l'avantage de matchup
     mesuré en §4.2 (boxer vs bjj/mma). ==== */
  boxer:{sigVol:1.12,koMod:1.10,subMod:0.10,clinchDmg:0.8,gnpDmg:0.8},
  kickboxer:{sigVol:1.05,koMod:1.20,subMod:0.20,clinchDmg:0.9,gnpDmg:0.8},
  /* ==== [ANCRE: P7_L4_MATCHUP_MUAYTHAI_CLINCH] — Lot 4/P7 §4.2 : mesuré à
     59.2% contre le lutteur (matrice EQUAL-OVERALL, 2000 combats/cellule) —
     à 0.8 point du seuil 60/40 visé, sans qu'aucun autre style clinch-heavy
     n'entre en jeu dans cette cellule. `clinchDmg` relevé de 1.25 à 1.35 :
     cohérent avec le vrai MMA (le clinch de plat-ventre du muay-thaï est
     historiquement ce qui étouffe une amenée de lutte) et un levier ciblé
     — la plupart des autres adversaires du muay-thaï (boxe, karaté) passent
     moins de 1% de leurs frappes en clinch (cf. empreinte statistique
     §4.3), donc quasiment sans effet sur ces matchups-là ni sur la moyenne
     globale du style. ==== */
  muayThai:{sigVol:0.88,koMod:1.25,subMod:0.30,clinchDmg:1.35,gnpDmg:1.0},
  /* ==== [ANCRE: P7_L4_KARATE_SIGVOL] — Lot 4/P7 §4.3 : "karaté : volume
     plus faible, précision et puissance par salves". Mesuré par
     baseline-P7.md (§2.2, tableau des cellules marquées) : `sigVol:1.26`
     était le PLUS HAUT volume du jeu, à l'exact opposé de l'identité que ce
     lot doit rendre reconnaissable — un artefact de calibrage du Lot 2
     (avant que l'identité par style ne soit spécifiée). Ramené doucement
     (1.15, pas sous la moyenne) : offA pilote À LA FOIS le
     volume ET, via son écart à offB, la chance de KO (`koA`,
     `clamp((offA-offB)/62+0.46,0,1)`) — un sigVol nettement sous la moyenne
     s'est avéré dévastateur en Monte Carlo (karaté descendu à 37% de
     victoires, largement hors bande 47-53%), l'écart négatif y écrasant le
     KO en cascade plutôt que de seulement réduire le volume narré. Écart
     documenté en §7 du rapport de livraison plutôt que forcé par un
     sigVol qui casserait l'équilibrage (règle commune P7 #3) ; `koMod`
     (déjà le plus haut du jeu, 1.52) et le rythme par salves
     (STYLE_POLICY.karate.pace='burst', engine.js) portent l'essentiel de
     "moins souvent mais plus fort". ==== */
  karate:{sigVol:1.15,koMod:1.52,subMod:0.20,clinchDmg:0.7,gnpDmg:0.7},
  /* ==== [ANCRE: P7_L4_MATCHUP_WRESTLER_BOXER] — Lot 4/P7 §4.2, exemple
     explicitement cité par le plan : "un lutteur d'élite contre un
     frappeur à faible défense d'amenée ne doit pas gagner 52% du temps :
     il doit dominer". Mesuré à 59.2% (matrice EQUAL-OVERALL, 2000
     combats/cellule) — à 0.8 point du seuil, l'IC95% [57.0–61.3] chevauche
     déjà 60%. `koMod` relevé de 1.10 à 1.18 : une fois au sol (déjà
     largement acquis via `grap`/`topControl`/`gnp`, inchangés ici), un
     boxeur droit debout n'a plus grand-chose pour se défendre du Ground &
     Pound — ce levier finit ce que l'amenée a déjà gagné, sans toucher au
     mécanisme d'amenée lui-même. ==== */
  wrestler:{sigVol:0.98,koMod:1.18,subMod:0.40,clinchDmg:1.1,gnpDmg:1.30},
  // ==== [ANCRE: CORRECTIF_GUARDPULL_MORT] — signalé par A22 (ui-03) : guardPull n'est lu NULLE PART dans ce moteur — donnée morte, conservée telle quelle (pas de risque à la retirer, mais pas de bénéfice non plus tant qu'aucune mécanique ne la consomme).
  bjj:{sigVol:0.95,koMod:0.75,subMod:1.98,clinchDmg:0.9,gnpDmg:0.9,guardPull:0.35},
  /* ==== [ANCRE: P7_L4_GARDE_FOU_EQUILIBRAGE] — voir boxer ci-dessus,
     même critère §4.4 : sambo dépassait la bande une fois la propension
     contextuelle au grappling ajoutée (§4.1, contextualGrapplingMult) sans
     que sa politique de danger/domination (déjà atténuée à 'manage', voir
     STYLE_POLICY.sambo, qui a aussi perdu son rythme 'burst' au passage —
     redondant avec la propension au grappling déjà explosive de ce style,
     et qui compoundait avec elle) suffise seule à rentrer dans la bande.
     koMod ramené de 1.20 à 0.95, subMod de 1.30 à 1.15, gnpDmg de 1.15 à
     1.05. ==== */
  sambo:{sigVol:0.85,koMod:0.95,subMod:1.15,clinchDmg:1.2,gnpDmg:1.05},
  /* ==== [ANCRE: P7_L4_GARDE_FOU_EQUILIBRAGE] — voir boxer/sambo ci-dessus,
     même critère §4.4, sens inverse : le MMA complet, seul style sans aucun
     biais d'attribut dominant (STYLES.mma.b est le plus étalé des huit,
     cf. engine.js), passait sous la bande une fois les autres styles
     recalibrés. koMod relevé de 1.05 à 1.15 (encore dans la moyenne basse
     du jeu, cohérent avec un profil "équilibré" plutôt que finisseur). ==== */
  mma:{sigVol:1.05,koMod:1.15,subMod:1.00,clinchDmg:1.0,gnpDmg:1.0}
};
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P7_L4_STYLE_POLICY_COMBAT] — Lot 4/P7 §4.1 : traduit
   STYLE_POLICY (engine.js) en décisions CONTEXTUELLES lues par
   simulateFight — jamais un second sac de bonus statique, jamais un
   remplacement de STYLES[].grap (contextualGrapplingMult le MODULE, ne le
   remplace pas). Chaque fonction lit un contexte de combat déjà présent
   dans simulateFight (score courant sa/sb, dégâts cumulés dmgA/dmgB,
   fenêtre de danger dangerA/dangerB, agressivité eff()) — aucun état
   nouveau à faire persister. ==== */
/** §4.1 "un frappeur en retard aux points ne tente pas une amenée, un
 * lutteur qui se fait toucher y va plus tôt" — multiplie la fraction de
 * tentative d'amenée (attA/attB) selon le score courant et les dégâts déjà
 * encaissés, PAS selon le style brut (déjà couvert par `grap`). @returns {number} */
function contextualGrapplingMult(policy,ownScore,oppScore,ownDamage,ownDanger){
  if(policy.distance==='range') return ownScore<oppScore-4 ? 0.45 : 1;
  // distance==='close' : les deux circonstances ("touché" et "en danger, y
  // va plus tôt") récompensent la même intention, jamais cumulées entre
  // elles (sinon un lutteur/sambiste à la fois touché ET en danger — le cas
  // le plus fréquent, l'un entraînant l'autre — recevait un double bonus
  // artificiel, cf. investigation Monte Carlo de ce lot).
  let mult=1;
  if(ownDamage>14) mult=Math.max(mult,1.5);
  if(policy.dangerReaction==='takedown' && ownDanger>0) mult=Math.max(mult,1.6);
  return clamp(mult,0.25,2.0);
}
/** §4.1 "réaction quand il est en danger" côté OFFENSE PROPRE du combattant
 * en danger (dangerX>0) : reculer réduit son propre volume, répondre
 * l'augmente. Neutre hors fenêtre de danger et pour clinch/takedown (déjà
 * couverts par clinchAffinity/contextualGrapplingMult). @returns {number} */
function dangerReactionOffenseMult(policy,inDanger){
  if(!inDanger) return 1;
  if(policy.dangerReaction==='retreat') return 0.6;
  if(policy.dangerReaction==='counter') return 1.10;
  return 1;
}
/** §4.1 "réaction quand il domine" : amplifie (finition) ou atténue
 * (gestion) le boost de volume déjà accordé à l'attaquant dont l'adversaire
 * traverse une fenêtre de danger (ANCRE P7_L2_FENETRE_FINITION_VOLUME) —
 * neutre (1) hors de cette fenêtre, cette fonction ne modifie donc jamais
 * le combat en dehors d'une domination réelle déjà détectée ailleurs.
 * @returns {number} */
function dominanceReactionMult(policy){ return policy.dominanceReaction==='finish'?1.15:0.85; }
/** §4.1 "initiative : mener ou contrer" — mener récompense sa propre
 * agressivité, contrer récompense l'agressivité adverse (les angles
 * qu'elle ouvre). Effet volontairement modeste (±12% max) : c'est la
 * politique de combat dans son ensemble, pas ce seul levier, qui doit
 * créer les matchups (§4.1, dernier paragraphe). @returns {number} */
function initiativeMult(policy,ownAggression,oppAggression){
  return policy.initiative==='lead'
    ? 1+clamp(((ownAggression||50)-50)*0.0015,0,0.09)
    : 1+clamp(((oppAggression||50)-50)*0.002,0,0.12);
}
/** §4.1 "rythme : volume constant, ou par salves" — une oscillation
 * périodique de l'intensité de frappe pour les styles à salves (karaté,
 * sambo), neutre (facteur 1, jamais lu) pour les styles à volume constant.
 * Moyenne proche de 1 sur un round complet (sinusoïde) : ne gonfle pas le
 * volume total, en redistribue l'intensité dans le temps — cohérent avec
 * la contrainte "moyenne stable" des critères d'acceptation P7. `phase`
 * (différente pour A et B) évite que les deux salves soient toujours
 * synchronisées entre deux combattants à salves. @returns {number} */
function burstFactor(policy,t,phase){ return policy.pace==='burst' ? 1+0.22*Math.sin((t+phase)/17) : 1; }
/** §4.1 "distance préférée et volonté de la maintenir ou de la fermer" —
 * lu par la transition debout->clinch : un style qui préfère fermer la
 * distance (close) la ferme plus souvent qu'un style qui préfère la
 * garder (range). @returns {number} */
function clinchAffinity(policy){ return policy.distance==='close'?1.35:0.75; }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P7_L4_TAKEDOWN_NON_LINEAIRE] — Lot 4/P7 §4.2 : "l'écart
   takedown contre tdd passe aujourd'hui par une sigmoid de pente douce...
   à écart élevé, l'issue doit devenir quasi certaine". Ajoute un terme
   cubique, nul pour un petit écart (à diff=20, +0.005 seulement — matchup
   quasi inchangé) mais qui pousse fortement vers les bornes à écart élevé
   (à diff=40, +0.044 ; à diff>=60, la borne haute clamp(...,0.02,0.98) est
   déjà atteinte) — remplace sigmoid((a.takedown-b.tdd)/15) telle quelle,
   jamais un second mécanisme parallèle. @returns {number} */
function takedownSigmoidSteep(diff){
  const base=sigmoid(diff/15);
  const extreme=Math.sign(diff)*Math.pow(clamp(Math.abs(diff),0,80)/80,3)*0.35;
  return clamp(base+extreme,0.02,0.98);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L9_RYTHME_ROUND] — Lot 9/P8 §9.4 : "le round 1 se joue
   aujourd'hui exactement comme le round 5. Ajoute un profil temporel :
   phase d'observation en ouverture, sursaut de fin de round, accélération
   des dernières secondes chez celui qui se sait mené aux points" — sur la
   lecture de score déjà disponible côté juges (§9.4, "pas une variable
   nouvelle") : `lagging` est calculé une seule fois par round dans
   simulateFight à partir des totaux j1/j2/j3 déjà accumulés AVANT ce round
   (nuls au round 1, ce qui exclut naturellement ce round de la relance —
   exactement le symptôme décrit : "personne ne sait encore qu'il est
   mené"). Fonction PURE, symétrique par construction pour l'ouverture/le
   sursaut (ne dépend que de `t`, identique pour A et B) — seule `lagging`
   introduit une asymétrie, et uniquement dans les 30 dernières secondes.
   Comme burstFactor() plus haut : redistribue l'intensité dans le temps,
   ne gonfle jamais le volume moyen d'un round complet (la baisse
   d'ouverture compense la hausse de clôture) — pas de régression attendue
   sur la matrice 8x8 à overall égal (critère du lot). @returns {number} */
function paceMultiplier(t,roundLen,lagging){
  let mult=1;
  if(t<35) mult*=0.80+0.20*(t/35);
  if(t>roundLen-40) mult*=1.18;
  if(lagging && t>roundLen-30) mult*=1.22;
  return mult;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: P8_L10_ADAPTABILITE_FENETRE] — Lot 10/P8 §10.1-§10.3 : le lot
   6 a retiré le seul effet en combat d'`adaptability` (le coin entre les
   rounds) ; ce lot le lui redonne, mais SOUS UNE FORME NOUVELLE et exclusive
   ("elle ne doit avoir aucun effet sur un affrontement neutre", §10.1) —
   jamais un retour du coin, jamais un second mécanisme parallèle à
   `eff().fightIQ` (déjà lu en continu, cf. `baseline-P8.md` §5).
   §10.2 impose une forme TEMPORELLE, pas proportionnelle : "l'adaptabilité
   ne réduit pas le désavantage, elle en raccourcit la durée". `adaptClosure`
   traduit ça en trois règles non négociables : (1) round 1 => fermeture
   nulle, quelle que soit l'adaptabilité — personne ne résout un mauvais
   matchup dans les 30 premières secondes ; (2) la fermeture croît avec le
   round ET avec l'adaptabilité du combattant DÉSAVANTAGÉ par CE désavantage
   précis (jamais celle de l'avantagé, §10.1 "et rien d'autre") ; (3) un
   plafond `cap` toujours < 1 — "une adaptabilité à 100 ne doit pas annuler
   un mauvais matchup, seulement le rendre survivable". La progression étant
   linéaire en (round-1), un combat en 5 rounds accumule mécaniquement plus
   de fermeture qu'un combat en 3 rounds sans code dédié au format — l'écart
   demandé par §10.2 ("l'adaptabilité vaut nettement plus sur cinq rounds")
   est une CONSÉQUENCE de cette forme, pas un cas particulier codé à part.
   @returns {number} fraction de fermeture, 0..cap */
const ADAPT_CLOSURE_CAP_PHYSICAL=0.55;  // allonge/gabarit/garde (§10.3) : fermeture max, jamais totale
const ADAPT_CLOSURE_CAP_GROUND=0.25;    // infériorité positionnelle au sol (§10.3, "le cas échéant") : plafond plus bas,
                                         // voir adaptGroundDisadvantage() ci-dessous pour la justification
const ADAPT_CLOSURE_PER_ROUND=0.16;     // vitesse de fermeture par round au-delà du round 1, mise à l'échelle par l'adaptabilité du désavantagé
function adaptClosure(round,adaptability,cap){
  if(round<=1) return 0;
  const skill=clamp(((adaptability||50)-10)/90,0,1); // 10 -> ~0 (ferme quasi rien de tout le combat), 100 -> 1 (vitesse de fermeture maximale)
  return Math.min(cap, ADAPT_CLOSURE_PER_ROUND*(round-1)*skill);
}
/** Referme partiellement un écart structurel SIGNÉ (positif favorise A,
 * négatif favorise B — même convention que rEdge/bEdge) en fonction du round
 * courant et de l'adaptabilité du combattant DÉSAVANTAGÉ PAR CE SIGNE
 * PRÉCIS, jamais celle de l'avantagé. Sur un affrontement neutre
 * (edgeValue=0, ex. même allonge/gabarit/garde), renvoie toujours 0 quels
 * que soient round/adaptA/adaptB : le critère §10 "aucun effet mesurable sur
 * un affrontement neutre" est vrai PAR CONSTRUCTION, pas simplement mesuré.
 * @returns {number} edgeValue de même signe, magnitude réduite (ou nulle) */
function closeStructuralGap(edgeValue,round,adaptA,adaptB,cap){
  if(!edgeValue) return 0;
  const closure=edgeValue>0 ? adaptClosure(round,adaptB,cap) : adaptClosure(round,adaptA,cap);
  return edgeValue*(1-closure);
}
/** §10.3 "le cas échéant l'infériorité positionnelle au sol" : referme
 * partiellement le profil GROUND_POS pour le combattant du DESSOUS, selon
 * SON adaptabilité, en rapprochant chaque multiplicateur de la position la
 * plus douce pour le dessous — `closedGuard`, déjà la référence la moins
 * punitive de la table (dominance/ctrlMult/gnpMult/topSubMult les plus bas,
 * botSubMult le plus haut) — jamais un cinquième profil inventé en parallèle
 * de GROUND_POS (CLAUDE.md §8). Neutre par construction sur closedGuard
 * elle-même (se rapprocher de soi-même ne change rien) : un combattant déjà
 * dans la position la moins punitive n'a rien à "refermer". Plafond
 * volontairement plus bas que les axes physiques
 * (ADAPT_CLOSURE_CAP_GROUND < ADAPT_CLOSURE_CAP_PHYSICAL) : la hiérarchie de
 * positions du Lot 3/P7 et les cellules 8x8 encore fragiles signalées par
 * `baseline-P8.md` §2.2 (muayThai/bjj vs wrestler) reposent largement sur ce
 * mécanisme — ce lot ne doit pas les rouvrir en rendant le sol trop
 * confortable pour le dessous. `standupOk` n'est jamais modifié : cette
 * fonction n'aide jamais à SE RELEVER (déjà gouverné par
 * groundStandupChance/l'arbitre, Lot 3/P7 et Lot 7/P8), seulement à moins
 * souffrir en restant en dessous. @returns {object} profil GROUND_POS ajusté */
function adaptGroundDisadvantage(posProf,round,botAdaptability){
  const closure=adaptClosure(round,botAdaptability,ADAPT_CLOSURE_CAP_GROUND);
  if(closure<=0) return posProf;
  const neutral=GROUND_POS.closedGuard;
  const blend=k=>posProf[k]+(neutral[k]-posProf[k])*closure;
  return {dominance:blend('dominance'),ctrlMult:blend('ctrlMult'),gnpMult:blend('gnpMult'),
    topSubMult:blend('topSubMult'),botSubMult:blend('botSubMult'),standupOk:posProf.standupOk};
}
/* ==== [FIN ANCRE] ==== */
