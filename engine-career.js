"use strict";
/* CAGE LEGACY — js/engine-career.js
   Extrait d'engine.js (chantier 4 : refactorisation progressive du moteur).
   Regroupe les responsabilites "carriere & classement" : echelle
   d'organisations (ORGS, cachets ORG_PURSES/CHAMP_MULT, noms d'ambiance
   ORG_FLAVORS), promotion (canPromote, applyOrgAdvancementBoost), base Elo
   par palier (eloBaseline), generation de contrat (generateContract), gain/
   perte Elo par combat (calculateEloDelta), et le classement P4P
   (p4pScore/rankPool/standing/p4pRank).

   Deplace a l'IDENTIQUE depuis engine.js : memes noms de fonctions, memes
   signatures, memes ancres ANCRE:/FIN ANCRE, comportement strictement
   inchange. Scope global classique (pas d'import/export) : depend des
   primitives d'engine.js (num/clamp/eff/reachEdge/overall...) et
   d'applyDeltas (reste dans engine.js), donc CHARGE JUSTE APRES engine.js
   dans index.html — jamais avant engine.js, jamais apres state.js/ui-*.js
   qui appellent ces fonctions. */

/* ------------------------- ORGS / CLASSEMENT / ÂGE ------------------------ */
const ORGS=['Amateur','Circuit local','Circuit régional','Circuit national','Continentale','Ultimate Rim (Argent)','Pacific Championship (Gloire)'];
// ==== [ANCRE: CORRECTIF_LISIBILITE_NIVEAU_ORGA] — item demandé : les écrans
// d'offre affichaient juste "Niveau ${o.org}" (l'indice brut 0-6), difficile
// à situer sans connaître ORGS par cœur. Étiquette lisible réutilisable :
// nom du palier + position numérique explicite sur l'échelle complète.
function orgLevelTag(orgId){ return `${ORGS[orgId]||'?'} \u2014 Niveau ${orgId+1}/${ORGS.length}`; }
const ORG_PROMO_SCORE=[0,115,290,520,750,1035,1035]; // score ELO requis par palier
// ==== [ANCRE: RALENTISSEMENT_PROMOTIONS] — item demandé : les organisations
// se proposaient trop vite (score p4p absolu facile à atteindre via quelques
// finitions + une série en cours) par rapport au rythme réel de progression
// au classement (rankPool relatif, qui bouge lentement car le reste du
// roster gagne aussi de l'Elo en arrière-plan via advanceRoster()). Seuils
// ORG_PROMO_SCORE remontés d'environ 15%, et exigences de canPromote()
// resserrées (orgWins 5→6, winRate 60%→63%) pour que chaque promotion
// arrive une fois réellement mérité, pas seulement possible. Premier passage
// de tuning, à valider via l'audit Monte Carlo existant avant réglage fin.
// ==== [ANCRE: CORRECTIF_DUPLICATION_BOURSE] — ORG_PURSES et CHAMP_MULT
// étaient dupliqués À L'IDENTIQUE dans generateContract() (ce fichier) ET
// dans resolveFight() (ui-05-fight-resolution.js) — exactement le genre de
// duplication qui avait causé le décalage Ultimate Rim (un seul des deux
// tableaux avait été recalibré, l'autre gardait les anciennes valeurs).
// Source unique désormais, référencée aux deux endroits.
// ==== [ANCRE: RECALIBRAGE_ULTIMATE_RIM] — item demandé : Ultimate Rim
// (Argent) passait de 250k$/combat à 0$ de prime de victoire — écart bien
// trop grand avec Pacific Championship (30k$/30k$) pour une ligue pourtant
// présentée comme "juste en dessous" du sommet. Recalé à 75k$ le combat +
// 75k$ la victoire, cohérent avec son identité "Argent" (bon salaire fixe
// ET bonne prime) sans écraser Pacific Championship (Gloire — prestige et
// multiplicateur de titre bien plus haut : x5 contre x2 ici).
const ORG_PURSES=[[0,0],[0.6,0.6],[2,2],[5,5],[15,15],[75,75],[30,30]]; // [cachet, prime de victoire] en k$, par palier d'organisation
// ==== [ANCRE: CORRECTIF_PARITE_CHAMPION_SOMMET] — bug remonté : les deux
// offres du Sommet (scr_toptier) affichaient EXACTEMENT le même salaire pour
// un combattant déjà champion (cas fréquent, cf. ligne 477 ui-05 : offre
// déclenchée aussi pour un champion avec 2+ défenses). Cause : coïncidence
// numérique pure — 30(Pacific)×5.0 = 75(Ultimate Rim)×2.0 = 150. Multiplicateur
// Pacific ajusté à 5.3 (reste nettement le plus haut, identité "Gloire"
// préservée) pour casser cette égalité sans toucher aux cachets de base ni
// au multiplicateur Ultimate Rim, déjà recalibrés et documentés ailleurs.
const CHAMP_MULT=[1,2.0,2.2,2.5,2.5,2.0,5.3]; // multiplicateur de bourse pour un champion, par palier d'organisation
// ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_DIFFERENCIE] — table remontée au
// niveau module (au lieu d'être recréée à chaque déblocage dans
// pickFinishMove) pour pouvoir être réutilisée telle quelle par
// signatureMoveCard() (ui-06-career-screens.js), qui recalculait sinon un
// boost générique et FAUX (submission+killer / power+killer pour tout,
// ignorant la zone) — même bug de duplication que ORG_PURSES/CHAMP_MULT.
const SIGNATURE_BOOST_PTS=6;
const SIGNATURE_BOOST_BY_ZONE={
  sub:{'tête':['submission','cardio'],'corps':['submission','strength'],'jambes':['submission','explosiveness']},
  ko:{'tête':['power','killer'],'corps':['power','cardio'],'jambes':['power','explosiveness']}
};
/* ==== [ANCRE: ORG_FLAVOR] — Version A validée : cosmétique uniquement, aucune
   incidence mécanique. Amateur (0) et Pacific Championship/Ultimate Rim (5/6, déjà nommés)
   n'ont pas de variante. Noms négociables. ==== */
const ORG_FLAVORS=[
 null,
 ['Octogone MMA','Waouh FC','PVM'],
 ['Calathea','Monstera','Arboricola'],
 ['Philestine','U-Krenne','Konn GO'],
 ['Constrictor','Iguana Iguana','Spatule'],
 null, null
];
function orgDisplayName(f){ if(f.org===0||f.org>=5) return ORGS[f.org]; return f.orgFlavor||ORGS[f.org]; }
/* ==== [FIN ANCRE] ==== */
function canPromote(f){ const n=f.org+1; const totalOrg=f.W+f.L+(f.D||0);
  const winRate=totalOrg>0?f.W/totalOrg:0;
  return n<ORGS.length && (f.orgWins||0)>=6 && winRate>=0.63 && p4pScore(f)>=ORG_PROMO_SCORE[n]; }
/* ==== [ANCRE: P4P_SCORE_80_20] — le classement pesait 100% le palmarès de
   CARRIÈRE (jamais remis à zéro entre deux paliers pro), alors que seul
   turnPro() (amateur->pro) réinitialise W/L. Une promotion tier 1->2 gardait
   donc tout le poids des victoires du tier 1, faisant atterrir un combattant
   n'ayant jamais combattu dans son nouveau palier à un rang aléatoire du
   genre #12. Nouvelle formule : 80% palmarès DANS l'orga actuelle (orgWins,
   défenses, titre — tous déjà remis à zéro à chaque promotion), 20% palmarès
   de carrière global (élan/réputation qui traverse les paliers). L'amateur
   (org 0) garde l'ancienne formule à 100% : il n'y a qu'un seul palier, pas
   de promotion interne à corriger. ==== */
// ==== [ANCRE: ELO_BASELINE] — base Elo selon le palier, biaisée par l'overall.
// Utilisée à la fois pour l'initialisation d'un combattant ET pour la remise à
// zéro de orgElo à chaque changement d'organisation (c'est ÇA qui corrige le
// bug "classé trop haut en rejoignant une nouvelle orga" — contrairement à la
// proposition Elo brute qui ne réinitialisait jamais rien). ====
// Boost d'adaptation lors d'une montée d'organisation : accès à de meilleurs
// préparateurs/infrastructures à mesure que le combattant grimpe les échelons.
// Corrige la sensation de progression trop lente face à des adversaires dont
// le niveau de base grimpe nettement plus vite (orgLevel : +6 à +8 par palier).
function applyOrgAdvancementBoost(f, org){
  const amount=2+org; // org1:+3, org2:+4 ... org6:+8
  applyDeltas(f, [['cardio',amount],['strength',amount],['fightIQ',amount],['durability',amount],['recovery',amount]]);
}
function eloBaseline(org,overallVal){
  // ==== [ANCRE: RECALIBRAGE_ULTIMATE_RIM] — Ultimate Rim (org 5) avait un elo
  // de référence (2100) plus élevé que Pacific Championship (org 6, 2000),
  // alors que ce dernier est la ligue "sommet" — incohérent. Abaissé à 1900,
  // sous Pacific Championship, tout en restant au-dessus de Continentale (1700).
  const b=[800,1000,1200,1450,1700,1900,2000][org]||1000; return Math.round(b+((overallVal||50)-50)*8);
}
// ==== [ANCRE: CONTRAT_GENERATION] — génère un contrat de 4 combats à cachet
// fixe (mêmes barèmes que ORG_PURSES/CHAMP_MULT déjà validés dans
// resolveFight, jamais dupliqués ni réinventés ici). L'agent (Cercle "Le
// Requin") améliore le cachet de base ; une revalorisation forcée réussie
// l'améliore encore ; être déjà champion au moment de la signature déclenche
// le même multiplicateur de titre que celui utilisé pour la bourse en combat. ====
function generateContract(f,org,raise){
  // ==== [ANCRE: SWAP_PACIFIC_ULTIMATE] — item demandé : Pacific Championship
  // (Gloire) passe au niveau 6 (sommet), Ultimate Rim (Argent) au niveau 5.
  // Chaque organisation garde exactement son identité mécanique d'origine
  // (cachet, multiplicateur de titre, elo de référence) — seul l'INDEX
  // change, comme demandé, pas le comportement propre à chaque ligue.
  const base=ORG_PURSES[org]||[1,1];
  let mult=1;
  if(raise) mult+=0.40;
  if(f.agentCut>0) mult+=0.25;
  // Popularité (#3) : hypeBonus (1.0 à ~1.8 selon origine/personnalité/mode de
  // vie choisis) fait varier le cachet réel — un combattant charismatique
  // négocie mieux, peu importe son niveau technique.
  const hype=f.hypeBonus||1;
  mult*=(0.75+hype*0.35);
  const isChampContract=!!f.champion;
  if(isChampContract) mult*=(CHAMP_MULT[org]||1);
  const repTier=hype>=1.5?'Superstar':hype>=1.2?'Attraction montante':hype>=0.9?'Solide':'Discret';
  // ==== [ANCRE: DUREE_CONTRAT_REPUTATION] — avant : durée fixe de 4 combats
  // pour tout le monde. Un combattant plus réputé représente une valeur plus
  // sûre pour l'organisation, qui sécurise l'investissement avec un contrat
  // plus long — cohérent avec le palier de réputation déjà calculé ci-dessus.
  const fightsByRep={Discret:3,Solide:4,'Attraction montante':5,Superstar:6};
  const fightsLeft=(fightsByRep[repTier]||4)+(isChampContract?1:0);
  // ==== [ANCRE: RETRAITE_LIEE_AU_CONTRAT] — item demandé : avertir explicitement
  // à la SIGNATURE quand ce contrat sera la dernière danse, en indiquant quel
  // combat précis du contrat (son nombre total de combats, fightsLeft) sera
  // le dernier avant que la retraite ne devienne obligatoire. Seuil : l'âge
  // atteindra ou dépassera retAge-1 avant la fin du contrat dans l'immense
  // majorité des cas (le vieillissement avance d'environ 1 an tous les 1 à 4
  // combats), donc on avertit dès que l'âge actuel est à 1 an ou moins du
  // seuil de retraite.
  const retAge=Math.max(39,42-(f.chinDegradationLevel||0))+((f.skills&&f.skills.includes('meta01'))?2:0);
  const isFinalContract=(f.age||18)>=retAge-1;
  // ==== [ANCRE: PLAFOND_BOURSE_SOMMET] — bug remonté : les multiplicateurs
  // cumulés (raise, agent, hype, champion) pouvaient pousser Pacific
  // Championship et Ultimate Rim bien au-delà de leurs plafonds voulus
  // (174 900$/174 900$ et 165 000$/165 000$ observés), écrasant l'identité
  // "Argent" (paie, org 5) vs "Gloire" (prestige, org 6) des deux ligues.
  // Plafond dur appliqué après tous les multiplicateurs.
  let show=+(base[0]*mult).toFixed(2), win=+(base[1]*mult).toFixed(2);
  if(org===5){ show=Math.min(show,125); win=Math.min(win,125); }
  else if(org===6){ show=Math.min(show,75); win=Math.min(win,75); }
  return { fightsLeft, show, win, org, isChampContract, reputation:repTier, record:[], isFinalContract, finalFightNumber:isFinalContract?fightsLeft:null };
}
/* ==== [ANCRE: V2-37] — bug remonté : "Contrat : 0 combat" pouvait
   s'afficher (un champion en 3-1 en était un cas). Cause : `fightsLeft`
   compte à rebours (ui-05-fight-resolution.js, `G.f.contract.fightsLeft--`)
   jusqu'à l'échéance, moment où `contractExpiry` déclenche la
   renégociation (scr_result, ui-06) — mais tant que le joueur n'a pas
   effectivement renégocié, `f.contract` reste l'ANCIEN objet, avec
   `fightsLeft` à 0 (ou même négatif : `--` n'était pas gardé), lisible
   sur le hub/la fiche entre-temps. Correctif à deux niveaux : (1) le
   décompte est désormais gardé au plancher 0 (ui-05) ; (2) 0 n'est plus
   jamais interpolé tel quel nulle part — ce point unique de formatage,
   utilisé par tous les écrans qui affichent fightsLeft, fait qu'un seul
   endroit à corriger vaut pour tous. ==== */
function contractFightsLeftLabel(contract){
  const n=(contract&&contract.fightsLeft)||0;
  if(n<=1) return 'Dernier combat du contrat';
  return `${n} combats restants`;
}
// Gain/perte Elo dynamique après un combat, K-factor modulé selon la méthode
// de finition (KO/Soumission pèsent plus qu'une décision) et le round.
function calculateEloDelta(ratingA,ratingB,winnerSide,method,round){
  ratingA=num(ratingA,1000); ratingB=num(ratingB,1000);
  const expectedA=1/(1+Math.pow(10,(ratingB-ratingA)/400)); const expectedB=1-expectedA;
  const scoreA=winnerSide==='A'?1:(winnerSide==='D'?0.5:0), scoreB=winnerSide==='B'?1:(winnerSide==='D'?0.5:0);
  let kFactor=32;
  if(method&&method.startsWith('KO')) kFactor=48; else if(method&&method.startsWith('Soum')) kFactor=44; else if(method==='Décision partagée') kFactor=24;
  if(round===1) kFactor*=1.25;
  const rawDeltaA=kFactor*(scoreA-expectedA), rawDeltaB=kFactor*(scoreB-expectedB);
  return {deltaA:Math.round(rawDeltaA<0?rawDeltaA*1.5:rawDeltaA), deltaB:Math.round(rawDeltaB<0?rawDeltaB*1.5:rawDeltaB)};
}
/* ==== [FIN ANCRE] ==== */
function p4pScore(f){ const fights=f.W+f.L+f.D;
  if(fights===0) return 0; // statut "non classé" (NR)
  if(f.careerElo===undefined) f.careerElo=eloBaseline(f.org,f.overall);
  if(f.orgElo===undefined) f.orgElo=eloBaseline(f.org,f.overall);
  const leapfrog=f.rankBoost||0;
  // ==== [ANCRE: COMPOSANTE_PALMARES] — item demandé : le classement Elo pur
  // pouvait laisser un 8-0 quasi immobile (rang #23) si ses victoires venaient
  // toutes contre des adversaires de niveau proche/inférieur (peu de gain Elo
  // par victoire "attendue"), alors qu'un palmarès aussi net devrait peser
  // plus lourd. On ajoute une composante directe basée sur le PALMARÈS RÉEL :
  // différentiel victoires/défaites, bonus finition (KO/soumission valent
  // plus qu'une décision), et série en cours (positive = victoires, négative
  // = défaites — capture les deux à la fois via le signe de f.streak).
  const recordBonus=(f.W||0)*5-(f.L||0)*5+((f.ko||0)+(f.sub||0))*10+(f.streak||0)*8;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: RETRAIT_BONUS_CHAMPION] — item demandé : le statut de
  // champion (simple ou double) ne donne plus de bonus au score de
  // classement P4P. La reconnaissance du titre se fait désormais uniquement
  // via un badge dédié dans la fiche complète (scr_profile), pas via un
  // avantage chiffré caché dans le classement.
  if(f.org===0) return Math.max(1, f.careerElo+f.defenses*30+leapfrog+recordBonus);
  let score=f.orgElo*0.8+f.careerElo*0.2+f.defenses*30+leapfrog+recordBonus;
  if(f.org===6) score*=1.4;
  return Math.max(1, score);
}
/* ==== [FIN ANCRE] ==== */
function rankPool(list){
  return list.slice().sort((x,y)=>{
    if(x.champion && !y.champion) return -1;
    if(y.champion && !x.champion) return 1;
    return p4pScore(y)-p4pScore(x);
  });
}
/* ==== [ANCRE: V2-12] — le document demande une fonction `standing()`
   composite (rang + qualité du palmarès + série + palier d'org +
   récence) partagée par tous les filtres de matchmaking. p4pScore()
   (juste au-dessus) couvre déjà l'essentiel sans qu'il soit utile de la
   dupliquer : orgElo/careerElo (eloBaseline) intègrent déjà le palier
   d'organisation ET la qualité des adversaires battus — un système Elo
   récompense structurellement plus une victoire sur un adversaire mieux
   coté qu'un palmarès brut ne le ferait — recordBonus ajoute le
   différentiel victoires/défaites et les finitions, f.streak la série en
   cours, et la décroissance d'inactivité (Rank Rust, advanceRoster())
   pénalise déjà la récence AVANT que rankPool()/p4pScore() ne classent
   qui que ce soit. `standing()` réutilise donc strictement ce calcul —
   un alias assumé, jamais un second système parallèle qui risquerait de
   désynchroniser deux notions différentes du "niveau réel" d'un
   combattant. ==== */
function standing(f){ return p4pScore(f); }
/* ==== [ANCRE: V4_C17_P4P_RANG_MONDIAL] — Plan V4 LOT 6 C17 : p4pScore()
   triait déjà les propositions et l'onglet P4P (scr_rankings, ui-06, ANCRE
   V3_RANKINGS_P4P_TAB) mais n'était jamais montré au joueur comme SA
   position. p4pRank() réutilise strictement le même tri (p4pScore pur,
   sans l'exception "champion toujours premier" de rankPool) sur le même
   pool que l'onglet P4P — la portée "mondiale" reste le roster de
   l'organisation/division courante, aucun second système de classement.
   Correctif d'affichage : p4pScore() lui-même n'est pas modifié. ==== */
function p4pRank(f){
  if(typeof G==='undefined'||!G||!Array.isArray(G.roster)) return null;
  const sorted=G.roster.concat([f]).slice().sort((a,b)=>p4pScore(b)-p4pScore(a));
  const idx=sorted.indexOf(f);
  return idx>=0?idx+1:null;
}
/* ==== [FIN ANCRE] ==== */
