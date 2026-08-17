"use strict";
/* CAGE LEGACY — js/ui-05-fight-resolution.js
   ============================================================================
   Fichier 5/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Le cœur de la résolution d'un combat (resolveFight, la plus grosse fonction du jeu), passage professionnel, succès, et petits formatteurs d'affichage.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

function isTitleEligible(f){
  if(f.org<1 || f.streak<=0) return false;
  if(f.history && f.history.length>=3){
    const recentLosses=f.history.slice(-3).filter(h=>h.res==='loss').length;
    if(recentLosses>=2) return false;
  }
  return (divRank(f)<=2 || ((f.streak||0)>=6 && divRank(f)<=4));
}
/* ==== [FIN ANCRE] ==== */
function fightKind(){ const f=G.f; if(f.champion) return 'defense'; if(isTitleEligible(f)) return 'title'; return 'normal'; }

function resolveFight(){ const {opp,rounds,kind}=G.fight;
  G.f.lastOpponentId=opp.id;
  G.f.recentOpps=G.f.recentOpps||[];
  G.f.recentOpps.unshift(opp.id);
  if(G.f.recentOpps.length>4) G.f.recentOpps.length=4;
  // ==== [ANCRE: RANGS_AVANT] — capturés avant simulateFight/applyResult, car la
  // victoire elle-même modifie le classement : le leapfrog doit juger la
  // situation AVANT le combat ("j'étais outsider, j'ai battu un top 3"),
  // pas après (sinon la condition échoue la plupart du temps — vérifié). ====
  const myRankBefore=divRank(G.f), oppRankBefore=divRank(opp);
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: META05] — boost temporaire "dernier tour de piste".
  // Le jeu ne connaît que l'âge en années entières (pas de calendrier précis),
  // donc "dernier combat avant la retraite" est approximé par : le combattant
  // est déjà dans sa dernière année avant le seuil de retraite forcée. ====
  let retAgeForLastFight=Math.max(39,42-(G.f.chinDegradationLevel||0)); if(G.f.skills&&G.f.skills.includes('meta01')) retAgeForLastFight+=2;
  const isLikelyLastFight=G.f.skills&&G.f.skills.includes('meta05')&&G.f.age>=retAgeForLastFight-1;
  const OFFENSIVE_CHANNELS=['power','handSpeed','kick','explosiveness','killer'];
  const savedAttrs={};
  if(isLikelyLastFight){ OFFENSIVE_CHANNELS.forEach(k=>{ savedAttrs[k]=G.f.attrs[k]; G.f.attrs[k]=clamp(G.f.attrs[k]+6,1,100); }); }
  // ==== [ANCRE: MALUS_EVENEMENT] — coupe de poids ratée / blessure mineure,
  // fusionné avec le mécanisme meta05 existant (même savedAttrs, restauration commune). ====
  if(G.fight.malus){ for(const k in G.fight.malus){
    if(savedAttrs[k]===undefined) savedAttrs[k]=G.f.attrs[k];
    G.f.attrs[k]=clamp(G.f.attrs[k]+G.fight.malus[k],1,100); } }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LOT7_OPPMALUS + LOT1_BUFFS_TEMPORAIRES] — G.fight.oppMalus
  // (sparring sur-mesure) n'était jusqu'ici jamais appliqué à l'adversaire ;
  // opp est un objet PERSISTANT du roster (pas recréé à chaque combat), donc
  // sa restauration doit être distincte de savedAttrs (celui du joueur). ====
  const oppSavedAttrs={};
  if(G.fight.oppMalus){ for(const k in G.fight.oppMalus){
    if(oppSavedAttrs[k]===undefined) oppSavedAttrs[k]=opp.attrs[k];
    opp.attrs[k]=clamp(opp.attrs[k]+G.fight.oppMalus[k],1,100); } }
  if(typeof checkAndApplyEra==='function') checkAndApplyEra();
  const eraSavedMe=(typeof eraBuffSnapshot==='function')?eraBuffSnapshot(G.f):{};
  const eraSavedOpp=(typeof eraBuffSnapshot==='function')?eraBuffSnapshot(opp):{};
  const tacticalSavedOpp=(typeof applyTacticalMemory==='function')?applyTacticalMemory(opp,G.f):{};
  // ==== [FIN ANCRE] ====
  const adaptivePlanForOpp=(typeof getAdaptiveNPCTactics==='function')?getAdaptiveNPCTactics(opp,G.f):null;
  const res=simulateFight(G.f,opp,rounds,G.fight.plan,adaptivePlanForOpp&&adaptivePlanForOpp.m); const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  if(typeof checkIronManDeath==='function') checkIronManDeath(res,null);
  if(typeof evaluateSponsor==='function') evaluateSponsor(res);
  // ==== [ANCRE: NARRATIF_APPEL] — calculé ici (mêmes données réelles qu'avant),
  // pour pouvoir à la fois l'afficher sur l'écran de résultat ET l'archiver
  // durablement dans f.history (Phase 6) — un seul générateur, pas de doublon. ====
  const narrative=generateNarrativeQuote(G.f,{win,method:res.method,res,opp,myRank:myRankBefore,oppRank:oppRankBefore});
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: HISTORIQUE_ENRICHI] — la dernière entrée poussée par applyResult()
  // (partagée avec les combats PNJ en coulisses, donc jamais modifiée elle-même)
  // est enrichie ici, seulement pour le joueur, avec les infos d'affichage que
  // scr_history() a besoin (adversaire, rang au moment du combat, année, narration). ====
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank=oppRankBefore; last.season=(G.season&&G.season.year)||1; last.narrative=narrative.txt(G.f); } }
  // ==== [FIN ANCRE] ====
  for(const k in savedAttrs){ G.f.attrs[k]=savedAttrs[k]; }
  for(const k in oppSavedAttrs){ opp.attrs[k]=oppSavedAttrs[k]; }
  if(typeof restoreSnapshot==='function'){ restoreSnapshot(G.f,eraSavedMe); restoreSnapshot(opp,eraSavedOpp); restoreSnapshot(opp,tacticalSavedOpp); }
  if(Object.keys(savedAttrs).length) G.f.overall=overall(G.f);
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: CACHET] — bourse en milliers $, structure Show/Win réaliste
  // (audit économie #9) : garantie de présence + prime de victoire séparées,
  // multiplicateur de champion différencié par palier, prime de performance
  // proportionnelle plutôt qu'un forfait fixe identique à tous les niveaux.
  // Lot 2 (contrat réel) : si un contrat existe (org pro), la bourse suit son
  // cachet fixé à la signature plutôt que le barème brut de l'organisation —
  // repli sur l'ancien barème pour l'amateur (pas de contrat) et les
  // sauvegardes migrées sans contrat encore assigné.
  // ORG_PURSES et CHAMP_MULT sont définis une seule fois dans engine.js
  // (cf. ANCRE: CORRECTIF_DUPLICATION_BOURSE) — ne jamais les redéclarer ici.
  let showPurse,winBonus;
  if(G.f.org>0 && G.f.contract){
    showPurse=G.f.contract.show; winBonus=G.f.contract.win;
    if(G.f.champion && !G.f.contract.isChampContract){ const m=CHAMP_MULT[G.f.org]||1; showPurse*=m; winBonus*=m; }
  } else {
    [showPurse,winBonus]=ORG_PURSES[G.f.org]||[0,0];
    if(G.f.champion){ const m=CHAMP_MULT[G.f.org]||1; showPurse*=m; winBonus*=m; }
  }
  const rivalryMult=(typeof getRivalryPurseMultiplier==='function')?getRivalryPurseMultiplier(G.f,opp):1.0;
  showPurse*=rivalryMult; winBonus*=rivalryMult;
  // ==== [ANCRE: EFFET_META03_CACHET_VIE] — la compétence 'Contrat à vie'
  // (meta03) avait une description ("verrouille un cachet minimum garanti
  // jusqu'à la fin de la carrière") mais aucun effet codé nulle part (fx:{}
  // vide, jamais référencée) — jugée inutile à raison. Implémentation
  // littérale : dès qu'elle est acquise, le cachet de présence ne peut plus
  // jamais redescendre sous le meilleur cachet déjà touché (protection contre
  // une rétrogradation d'organisation ou un contrat moins bon en fin de
  // carrière), plafond mis à jour vers le haut à chaque nouveau record.
  if(G.f.skills && G.f.skills.includes('meta03')){
    if(showPurse>(G.f.minGuaranteedShow||0)) G.f.minGuaranteedShow=showPurse;
    else showPurse=G.f.minGuaranteedShow;
  }
  let purse=showPurse;
  if(win) purse+=winBonus;
  if(win && !isDecisionLike(res.method)){ purse+=(G.f.org===6)?50:showPurse*0.25; }
  if(G.fight.pursePenalty) purse=Math.floor(purse*G.fight.pursePenalty*100)/100;
  const purseGross=purse;
  purse=Math.floor(purse*0.75*100)/100; // frais de camp fixes (manager, coach, salle) : ~25% de la bourse brute
  let agentFee=0;
  if(G.f.agentCut){ agentFee=Math.floor(purseGross*G.f.agentCut*100)/100; purse=Math.floor((purse-agentFee)*100)/100; }
  const campFee=+(purseGross-purse-agentFee).toFixed(2);
  G.f.earnings=(G.f.earnings||0)+purse;
  G.fight.purseDetail={gross:purseGross,fee:campFee,agentFee,net:purse};
  // ==== [ANCRE: CORRECTIF_MILESTONE_TDZ] — bug critique trouvé (introduit
  // pendant l'implémentation de la retraite liée au contrat) : `milestone`
  // était assigné ici (ligne "Dernière danse accomplie...") AVANT sa
  // déclaration `let milestone=''` plus bas dans la fonction. En JS, `let`
  // n'est jamais hoisté de façon utilisable (zone morte temporelle) — ceci
  // provoquait un vrai crash (ReferenceError) à chaque fois qu'un contrat
  // "dernière danse" arrivait à échéance. Déclaration remontée ici, avant
  // toute utilisation.
  let milestone='';
  // ==== [ANCRE: BILAN_CONTRAT] — trace chaque combat sous le contrat en
  // cours, pour pouvoir juger le bilan réel à l'échéance (item demandé),
  // plutôt qu'une rétrogradation aveugle basée seulement sur la série en
  // cours au moment précis d'une défaite.
  let contractExpiry=false;
  // ==== [ANCRE: RETRAITE_LIEE_AU_CONTRAT] — item demandé : si ce contrat a été
  // signé comme "dernière danse" (avertissement donné à la signature, cf.
  // generateContract/isFinalContract), la retraite ne doit plus tomber en
  // pleine série de combats — elle est désormais honorée précisément à
  // l'échéance de CE contrat, comme annoncé, plutôt qu'au hasard d'un combat
  // en cours de route.
  let lastDanceCompleted=false;
  if(G.f.org>0 && G.f.contract){
    if(!Array.isArray(G.f.contract.record)) G.f.contract.record=[];
    G.f.contract.record.push({res:win?'win':'loss',method:res.method});
    G.f.contract.fightsLeft--;
    if(G.f.contract.fightsLeft<=0){
      contractExpiry=true;
      if(G.f.contract.isFinalContract && !G.f.retired){
        G.f.retired=true; contractExpiry=false; lastDanceCompleted=true;
        milestone='Bonne retraite, bonne vacances.';
      }
    }
  }
  // ==== [ANCRE: NON_RENOUVELLEMENT] — à l'échéance, l'organisation évalue le
  // bilan RÉEL du contrat. Formule corrigée (item demandé : 1 défaite + 3
  // victoires aux points ne devrait PAS risquer le contrat — un bilan encore
  // largement gagnant ne doit jamais être une raison sérieuse de se faire
  // couper) : tant que le combattant reste gagnant ou à égalité (victoires >=
  // défaites), seul un "ennui" mineur lié aux décisions joue, plafonné bas.
  // Le vrai risque de non-renouvellement n'apparaît que sur un bilan
  // RÉELLEMENT perdant (plus de défaites que de victoires sur le contrat).
  let contractNonRenewed=false;
  if(contractExpiry && !lastDanceCompleted && G.f.contract && G.f.contract.record && G.f.contract.record.length){
    const rec=G.f.contract.record;
    const losses=rec.filter(r=>r.res==='loss').length;
    const wins=rec.filter(r=>r.res==='win').length;
    const decisionWins=rec.filter(r=>r.res==='win' && isDecisionLike(r.method)).length;
    let nonRenewChance;
    if(losses===0) nonRenewChance=0; // invaincu sur ce contrat : jamais de risque
    else if(wins>=losses) nonRenewChance=Math.min(0.15, decisionWins*0.03); // bilan gagnant/nul : ennui mineur seulement, plafonné à 15%
    else nonRenewChance=Math.min(0.9, losses*0.25 + decisionWins*0.05); // bilan réellement perdant
    if(rnd()<nonRenewChance){
      contractNonRenewed=true;
      G.f.contractNonRenewed=true;
      G.f.contractNonRenewalReason=`${losses} défaite(s) et ${decisionWins} victoire(s) aux points sur les ${rec.length} derniers combats du contrat`;
    } else {
      G.f.contractNonRenewed=false;
    }
  }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: RIVALITE] — une défaite, ou une décision très serrée, crée une animosité ====
  const scoreDiff=Math.abs((res.scoreA||0)-(res.scoreB||0));
  if(!win || (isDecisionLike(res.method) && scoreDiff<=8)){
    if(!G.f._rivalries) G.f._rivalries={};
    G.f._rivalries[opp.id]=(G.f._rivalries[opp.id]||0)+1;
    if(G.f._rivalries[opp.id]>=2) G.f.rivalId=opp.id;
  }
  // Némésis Faith : verrouillée dès la première vraie rivalité, ne change plus
  // jamais ensuite (contrairement à f.rivalId qui peut glisser vers l'animosité
  // la plus récente) — c'est le fil rouge narratif de toute la carrière.
  if(G.faith && !G.f.faithNemesisId && G.f.rivalId){ G.f.faithNemesisId=G.f.rivalId; }
  // Le "plus grand rival" compte TOUTES les confrontations (peu importe le
  // résultat) — avant, seule l'animosité (défaite/décision serrée) comptait,
  // donc un adversaire battu 15 fois de façon décisive n'était presque jamais
  // retenu comme rival marquant.
  if(!G.f._allMeetings) G.f._allMeetings={};
  G.f._allMeetings[opp.id]=(G.f._allMeetings[opp.id]||0)+1;
  if(!G.f.biggestRival || G.f._allMeetings[opp.id]>(G.f.biggestRival.count||0)){
    G.f.biggestRival={name:opp.name,flag:opp.flag,count:G.f._allMeetings[opp.id],W:opp.W,L:opp.L,style:opp.styleLabel};
  }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LEAPFROG_CUT] — traçage de la facilité des combats + bond de classement,
  // et sanction si le joueur enchaîne trop d'adversaires trop faciles. ====
  let forced=G.f.retired||false;
  const myRankNow=myRankBefore, oppRankNow=oppRankBefore;
  // ==== [ANCRE: ELO_UPDATE] — met à jour orgElo (poids 80% dans p4pScore) et
  // careerElo (20%) du joueur ET de l'adversaire, K-factor modulé selon la
  // méthode de finition et le round — remplace l'ancien comptage brut orgWins.
  if(opp.orgElo===undefined) opp.orgElo=eloBaseline(opp.org,opp.overall);
  if(opp.careerElo===undefined) opp.careerElo=eloBaseline(opp.org,opp.overall);
  const eloRes=calculateEloDelta(G.f.orgElo,opp.orgElo,res.winner,res.method,res.round);
  G.f.orgElo=Math.max(500,G.f.orgElo+eloRes.deltaA); opp.orgElo=Math.max(500,opp.orgElo+eloRes.deltaB);
  G.f.careerElo=Math.max(500,G.f.careerElo+Math.round(eloRes.deltaA*0.5)); opp.careerElo=Math.max(500,opp.careerElo+Math.round(eloRes.deltaB*0.5));
  G.f.inactivityCycles=0;
  // ==== [FIN ANCRE] ====
  if(win){
    // ==== [ANCRE: CORRECTIF_CHAMPION_EASYFIGHTS] — divRank() donne le rang 0
    // au champion (il est exclu du pool des challengers). Une défense contre
    // un challenger classé au-delà de #4 (proposé par genOpponents() lui-même
    // parmi ses 3 options de défense, qui vont jusqu'au 8e) déclenchait donc
    // à tort la pénalité "adversaire trop facile" pour un combat pourtant
    // légitime. Le champion est désormais immunisé contre cette pénalité.
    if(oppRankNow>myRankNow+4 && !opp.champion && !G.f.champion && !G.fight.isShortNotice){ G.f.easyFights=(G.f.easyFights||0)+1; } else { G.f.easyFights=0; }
    // ==== [ANCRE: LEAPFROG_PROPORTIONNEL] — battre un adversaire mieux classé
    // referme la moitié de l'écart de SCORE vers lui (pas juste un bonus fixe
    // réservé au top-3) : bat le 13e, tu te rapproches vraiment de sa place.
    // Remplace l'ancienne règle étroite (+60 fixe, seulement si adversaire
    // top-3), désormais couverte naturellement par la proportionnalité. ====
    const oppScoreNow=p4pScore(opp), myScoreNow=p4pScore(G.f);
    if(oppScoreNow>myScoreNow){
      const rankGap=myRankNow-oppRankNow;
      let leapMult=0.75;
      if(rankGap>=10) leapMult=1.5;
      else if(rankGap>=5) leapMult=1.0;
      G.f.rankBoost=(G.f.rankBoost||0)+Math.round((oppScoreNow-myScoreNow)*leapMult);
    } else {
      // ==== [ANCRE: CORRECTIF_PROGRESSION_ADVERSAIRE_INFERIEUR] — bug remonté
      // et confirmé par simulation sur le vrai makeOrgRoster() : le leapfrog
      // ci-dessus ne se déclenche QUE sur un upset (adversaire mieux classé).
      // Or genOpponents() propose très souvent un adversaire à ton niveau ou
      // juste en dessous (scénarios Statu Quo / Gatekeeper) — dans ce cas
      // très fréquent, aucun bonus de classement n'était jamais accordé, seul
      // l'ELO de base (modeste, puisque déjà favori) s'appliquait. Résultat
      // mesuré : 6 victoires d'affilée contre des adversaires juste en
      // dessous ne faisaient avancer que de 5 à 10 places sur un pool de 30.
      // Un plus petit bonus, proportionnel à la série en cours (jamais aussi
      // fort qu'un vrai upset), garantit qu'une série de victoires "normales"
      // fasse enfin progresser visiblement, sans dupliquer la récompense déjà
      // donnée par recordBonus (qui reste, elle, minime face à l'écart de
      // score total du pool).
      const streakBonus=Math.min(40, Math.max(0, (G.f.streak||0))*6);
      if(streakBonus>0) G.f.rankBoost=(G.f.rankBoost||0)+streakBonus;
    }
    // ==== [FIN ANCRE] ====
  } else if(res.winner==='D'){
    G.f.easyFights=0; // un match nul n'est ni un combat facile ni un vrai revers de classement
  } else {
    G.f.easyFights=0;
    // ==== [ANCRE: RANK_CRASH] — une défaite classé top-3 doit vraiment faire
    // chuter (vers la 4e place environ, comme en vrai MMA), pas juste reculer
    // proportionnellement au score : un gros capital de victoires rendait le
    // joueur insubmersible après une seule défaite (mesuré : #1 avec 1736 pts
    // restait #1 à 1601 pts après une perte, l'écart avec le n°2 étant trop
    // grand). ====
    if(myRankNow<=3){
      const sortedNow=G.roster.filter(o=>!o.champion).slice().sort((a,b)=>p4pScore(b)-p4pScore(a));
      const fallback={W:0,L:0,D:0,ko:0,sub:0,koLoss:0,streak:0,org:G.f.org,defenses:0,champion:null,orgWins:0};
      const targetScore=p4pScore(sortedNow[3]||sortedNow[sortedNow.length-1]||fallback);
      const scoreNoBoost=p4pScore(Object.assign({},G.f,{rankBoost:0}));
      if(scoreNoBoost>targetScore){ G.f.rankBoost=(G.f.rankBoost||0)-Math.round((scoreNoBoost-targetScore)*1.05); }
    }
    // ==== [FIN ANCRE] ====
    // ==== [ANCRE: CREDIBILITE_PRODIGE] — item demandé : les rôles de
    // matchmaking (ui-02/ui-06) promettaient déjà un enjeu réel pour le
    // "Prodige Régional" ('Très risqué pour votre crédibilité si battu')
    // sans qu'aucune mécanique ne le traduise — perte contre un jeune
    // débutant retombait sur le même calcul générique que n'importe quelle
    // autre défaite. Malus de crédibilité dédié : perte sèche de rankBoost
    // (indépendante du calcul RANK_CRASH ci-dessus, qui ne s'applique
    // qu'aux joueurs déjà top-3) + coup au moral, cohérent avec l'ampleur
    // d'un accident de parcours face à un inconnu. Ne s'applique qu'aux
    // combats issus du vrai flux de matchmaking (mmRole posé par
    // finishTrainingFlow/CL.opp), jamais aux combats Fantasy/Vs Ami/Legends
    // qui ne passent pas par genOpponents().
    if(G.fight.mmRole==='prospect'){
      G.f.rankBoost=(G.f.rankBoost||0)-8;
      G.f.morale=clamp(G.f.morale-10,0,100);
    }
  }
  // ==== [ANCRE: CASCADE_SERIE_DEFAITES] — item demandé : la rétrogradation
  // INSTANTANÉE en pleine série de défaites (mi-contrat) est remplacée par un
  // risque de NON-RENOUVELLEMENT calculé à l'échéance du contrat, à partir du
  // bilan réel des combats sous contrat (voir ANCRE: BILAN_CONTRAT et
  // ANCRE: NON_RENOUVELLEMENT plus bas). Les paliers 0 (amateur) et 1
  // (premier contrat pro) gardent leur sanction immédiate : il n'y a pas
  // encore de contrat pluriannuel à ce stade, la logique de "bilan de fin de
  // contrat" ne s'y applique pas.
  if(!forced && (G.f.streak||0)<=-3){
    if(G.f.org===1){
      if(!G.f.org1Warned){
        G.f.org1Warned=true; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null;
        G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampOffer=null; G.f.champChampDefenses=null;
        G.f.orgElo=eloBaseline(1,G.f.overall); G.f.rankBoost=0;
        milestone='Dernier avertissement du circuit pro. Une nouvelle série de défaites mettra fin à ton contrat.';
      } else {
        G.f.retired=true; forced=true; milestone='Renvoyé du circuit pro suite à vos défaites. Votre carrière s\u2019arrête ici.';
      }
    } else if(G.f.org===0 && (G.f.W<G.f.L || G.f.age>=26)){
      G.f.retired=true; forced=true; milestone='Éliminé du circuit amateur. Aucune organisation ne vous réengage.';
    }
  }
  // ==== [FIN ANCRE] ====
  if((G.f.easyFights||0)>=3){
    // ==== [ANCRE: CORRECTIF_CONTRAT_RETROGRADATION] — bug trouvé : f.org
    // était bien décrémenté (roster/elo regénérés à la baisse), mais
    // f.contract gardait ses termes de l'organisation supérieure — un
    // combattant rétrogradé en Continentale continuait de toucher le cachet
    // de l'Ultimate Rim. Le contrat est désormais régénéré pour coller à la
    // nouvelle organisation, comme pour toute autre signature.
    if(G.f.org>1){ G.f.org--; G.f.easyFights=0; G.f.champion=null; G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampOffer=null; G.f.champChampDefenses=null; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.contract=generateContract(G.f,G.f.org,false); milestone='Rétrogradé d\u2019organisation : refus des défis.'; G.roster=makeOrgRoster(G.f); }
    else if(G.f.org===1){
      if(!G.f.org1Warned){ G.f.org1Warned=true; G.f.easyFights=0; milestone='Dernier avertissement pour refus de combattre.'; }
      else { G.f.retired=true; forced=true; milestone='Contrat pro coupé pour refus de combattre. Retraite forcée.'; }
    }
    // ==== [ANCRE: CORRECTIF_RETRAITE_AMATEUR_SANS_PREAVIS] — bug trouvé : un
    // amateur (org 0) subissait une retraite DÉFINITIVE et IMMÉDIATE dès le
    // 1er déclenchement, sans le moindre avertissement préalable (contraire à
    // tous les autres paliers). Pire : ce compteur s'incrémente simplement
    // quand le matchmaking propose (et que le joueur accepte, sans intention
    // de "esquiver" quoi que ce soit) un adversaire classé 5+ rangs en
    // dessous — un simple prospect qui grimpe vite au classement peut
    // enchaîner ce cas de figure sans jamais avoir "refusé" un combat.
    // Amateur reçoit désormais le même palier d'avertissement que le pro
    // niveau 1, avec un message explicite sur la cause réelle.
    else if(G.f.org===0){
      if(!G.f.org0Warned){ G.f.org0Warned=true; G.f.easyFights=0; milestone='La fédération amateur s\u2019impatiente : trop d\u2019adversaires trop faibles pour ton niveau. Accepte des défis plus relevés, ou ta carrière amateur pourrait s\u2019arrêter là.'; }
      else { G.f.retired=true; forced=true; milestone='Éliminé du circuit amateur : trop d\u2019adversaires trop faciles acceptés malgré l\u2019avertissement.'; }
    }
    else { G.f.retired=true; forced=true; milestone='Contrat coupé par l\u2019organisation.'; }
  }
  // ==== [FIN ANCRE] ====
  G.f.orgWins=win?((G.f.orgWins||0)+1):Math.max(0,(G.f.orgWins||0)-1);
  const finish=!isDecisionLike(res.method);
  if(win && (G.f.bossUnimpressed||0)>0){
    if(finish){ G.f.bossUnimpressed=0; G.f.rankBoost=(G.f.rankBoost||0)+15; }
    else { G.f.bossUnimpressed--; G.f.rankBoost=(G.f.rankBoost||0)-10; }
  }
  let champChampDecision=false;
  // titre
  if(win && kind==='title'){
    G.f.champion=(G.f.org>=5?'monde':G.f.org===4?'europe':G.f.org===3?'national':G.f.org===2?'regional':'local'); G.f.titles++; G.roster.forEach(o=>o.champion=null);
    milestone=`<span class="gold" style="display:inline-flex;align-items:center;gap:4px">${SVG.medal} CEINTURE ${orgDisplayName(G.f).toUpperCase()}</span>`;
    recordTitleChange(G.f.org,G.f.divName,G.f.name,opp.name,orgDisplayName(G.f));
  }
  else if(win && kind==='defense'){ G.f.defenses++;
    // Un défenseur qui est déjà double champion doit le voir rappelé ici
    // (item #14 : le statut de double champion n'était visible nulle part
    // sur l'écran de résultat d'une défense ordinaire).
    milestone=G.f.champChampBelt?`Titre défendu (${G.f.defenses}) — toujours Double Champion (${G.f.divName} + ${G.f.champChampBelt})`:'Titre défendu ('+G.f.defenses+')';
    recordTitleDefense(G.f.org,G.f.divName,G.f.name); }
  else if(kind==='defense' && res.winner==='D'){ milestone='Titre conservé (match nul)'; }
  else if(win && kind==='champchamp_title'){
    // Supercombat pour la double ceinture : gagné. Ceinture stockée à part —
    // f.champion (ceinture d'origine) n'est jamais touché ici.
    G.f.champChampBelt=G.f.champChampOffer.targetDivName; G.f.champChampBeltDivId=G.f.champChampOffer.targetDivId; G.f.titles++;
    if(!G.f.champChampDefenses) G.f.champChampDefenses={};
    G.f.champChampDefenses[G.f.div]=G.f.defenses; G.f.champChampDefenses[G.f.champChampOffer.targetDivId]=0;
    milestone=`<span class="gold" style="display:inline-flex;align-items:center;gap:4px">${SVG.crown} DOUBLE CHAMPION — ${orgDisplayName(G.f).toUpperCase()}</span>`;
    recordTitleChange(G.f.org,G.f.champChampOffer.targetDivName,G.f.name,opp.name,orgDisplayName(G.f));
    G.f.champChampOffer=null;
    champChampDecision=true; // déclenche l'écran de choix de division après le résultat
  }
  else if(!win && res.winner!=='D' && kind==='champchamp_title'){
    // Supercombat perdu : on ne gagne pas la 2e ceinture, mais on garde la première.
    milestone='Supercombat perdu — votre ceinture actuelle reste intacte.';
    G.f.champChampOffer=null;
  }
  // ==== [ANCRE: CORRECTIF_KIND_CHAMPCHAMP_PERSISTANT] — bug majeur trouvé :
  // G.fight n'était jamais réinitialisé après résolution d'un combat. Comme
  // finishTrainingFlow() préserve intentionnellement G.fight.kind quand il
  // vaut déjà 'champchamp_title' (cf. CORRECTIF_KIND_CHAMPCHAMP plus haut),
  // ce kind restait figé pour TOUS les combats suivants une fois le premier
  // supercombat déclenché — chaque victoire ultérieure tentait alors de lire
  // G.f.champChampOffer.targetDivName alors que champChampOffer venait d'être
  // remis à null (ligne au-dessus / branche gagnée), provoquant un plantage
  // JS silencieux (bouton qui ne répond plus, victoires qui ne se valident
  // jamais). On efface explicitement le marqueur une fois ce combat consommé.
  if(kind==='champchamp_title') G.fight.kind=null;
  else if(!win && res.winner!=='D' && G.f.champion){ G.f.champion=null; G.f.defenses=0; milestone='Titre perdu'; }
  // Le président de l'organisation propose le supercombat après 3 défenses,
  // puis tous les 2 défenses supplémentaires si refusé — jamais déclenché par
  // le joueur, jamais un adversaire tiré au hasard (verrouillé à l'offre).
  let champChampOfferReady=false;
  if(G.f.champion && !G.f.champChampBelt && !G.f.champChampOffer && (G.f.defenses||0)>=3
     && (G.f.champChampLastOfferDefenses==null || G.f.defenses>=G.f.champChampLastOfferDefenses+2)){
    const divs=DIVISIONS[G.f.gender]||DIVISIONS.H; const idx=divs.findIndex(d=>d.id===G.f.div);
    const targetDiv=divs[idx+1]||divs[idx-1];
    if(targetDiv){
      const targetRoster=makeOrgRoster(Object.assign({},G.f,{div:targetDiv.id,divName:targetDiv.name}));
      const targetChamp=targetRoster.find(o=>o.champion)||targetRoster[0];
      if(targetChamp){ targetChamp.champion=targetChamp.champion||'monde';
        G.f.champChampOffer={targetDivId:targetDiv.id,targetDivName:targetDiv.name,champion:targetChamp};
        champChampOfferReady=true;
      }
    }
  }
  // compétence débloquée ?
  const skill=rollSkill(G.f);
  // ==== [ANCRE: SAISON_TRACKING] — enregistrement du combat pour le bilan annuel ====
  if(!G.season) G.season={year:1,fights:[]};
  G.season.fights.push({ win, method:res.method, round:res.round, scoreA:res.scoreA, scoreB:res.scoreB,
    st:{Me:res.stats.A, Op:res.stats.B}, myRank:myRankBefore, oppRank:oppRankBefore,
    isTitle:(kind==='title'||kind==='defense') });
  // ==== [FIN ANCRE] ====
  // vieillissement (1 an = N combats). Entre 18 et 23 ans (jeune prospect en
  // pleine activité), on vise 3 à 4 combats/an en moyenne — au-delà, rythme
  // plus posé (1 à 4) pour refléter les carrières confirmées/vétérans.
  // ==== [ANCRE: CORRECTIF_DUREE_CARRIERE] — item demandé : +5 combats en
  // moyenne sur la durée totale d'une carrière. Le rythme vétéran (1 à 3
  // combats/an, ~2/an) est remonté à 1-4 (~2,5/an) : sur une phase vétéran
  // typique d'une dizaine de saisons, le delta (+0,5/saison) ajoute
  // l'équivalent de ~5 combats sans changer le rythme jeune prospect (déjà
  // dense) ni l'âge de retraite.
  let endOfSeason=false;
  const fightsPerYear=(G.f.age>=18&&G.f.age<=23)?RI(3,4):RI(1,4);
  G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=fightsPerYear){ const declineLog=applyAging(G.f); G.f._fy=0; endOfSeason=true;
    // ==== [ANCRE: NOTIF_DECLIN_VIEILLESSE] (suite, voir applyAging) — le
    // joueur doit être informé explicitement quand l'âge fait baisser un
    // attribut, plutôt que de le découvrir sans explication sur sa fiche.
    // ==== [ANCRE: DECLIN_DANS_EVOLUTION_20] — item demandé : retirer la
    // phrase "l'âge se fait sentir" du milestone, et afficher les baisses
    // dues à l'âge directement dans le bloc "Évolution (sur 20)" en bas de
    // l'écran de résultat, en rouge (classe .dlt.dn), au même endroit que
    // les hausses d'attributs — plutôt qu'un paragraphe de texte séparé.
    if(declineLog && declineLog.length){
      if(!G.campApplied) G.campApplied={label:'',deltas:[]};
      G.campApplied.deltas=(G.campApplied.deltas||[]).concat(declineLog);
    }
    // ==== [ANCRE: SANTE_GFL] — Ultimate Rim : suivi médical premium. Le menton
    // (dommage neurologique) ne remonte JAMAIS, même ici — règle absolue. La
    // résistance générale (conditionnement physique, pas neuronal) reste un
    // vrai privilège de cette ligue, distinct du bonus classement d'Apex. ====
    if(G.f.org===5){ G.f.attrs.durability=clamp(G.f.attrs.durability+2,1,100); G.f.overall=overall(G.f); }
    // ==== [FIN ANCRE] ====
  }
  let retAge=Math.max(39,42-(G.f.chinDegradationLevel||0)); if(G.f.skills.includes('meta01')) retAge+=2;
  // ==== [ANCRE: RETRAITE_LIEE_AU_CONTRAT] (suite) — si le contrat en cours
  // porte déjà l'avertissement "dernière danse" (isFinalContract), on laisse
  // les combats restants du contrat se dérouler normalement : la retraite est
  // gérée précisément à l'échéance (bloc BILAN_CONTRAT plus haut), pas ici.
  // Filet de sécurité : si l'âge dérive vraiment trop loin au-delà de la
  // limite (contrat sans avertissement — ex. sauvegarde ancienne, ou org=0
  // sans contrat), on force quand même, personne ne doit dépasser la limite
  // indéfiniment sans jamais être rattrapé.
  const hasContractWarning=G.f.contract && G.f.contract.isFinalContract;
  if(!forced && !hasContractWarning && (G.f.age>=retAge || (G.f.age>=38 && G.f.overall<48))){
    G.f.retired=true; forced=true; milestone=milestone||'La commission médicale vous force à prendre votre retraite.';
  } else if(!forced && hasContractWarning && G.f.age>=retAge+3){
    G.f.retired=true; forced=true; milestone=milestone||'La commission médicale vous force à prendre votre retraite.';
  }
  // ==== [ANCRE: EVOLUTION_SURNOM] — item demandé : le surnom peut évoluer
  // (rarement, maximum 2 fois par carrière) quand le parcours du combattant
  // contredit ou dépasse nettement le surnom initial — l'ancien surnom reste
  // toujours consultable (nicknameHistory) sur l'écran de retraite et dans le
  // Panthéon. Vérifié uniquement si le combattant ne prend pas sa retraite ce
  // combat-ci (pas de sens à renommer quelqu'un qui raccroche les gants).
  // ==== [ANCRE: CORRECTIF_SURNOM_EMPLACEMENT] — bug remonté : le texte
  // "Surnom changé" était concaténé dans `milestone`, une carte à part plus
  // bas dans l'écran de résultat (ceinture gagnée, retraite, etc.), alors
  // qu'il doit apparaître au même endroit que le mouvement signature (bloc
  // moveFlavor, en haut de l'écran). Stocké séparément dans nickEvoHtml pour
  // être rendu à cet emplacement précis par scr_result().
  let nickEvoHtml='';
  if(!forced && !G.f.retired){
    const nickEvo=checkNicknameEvolution(G.f,win);
    if(nickEvo){ nickEvoHtml=`<span style="color:var(--gold);font-weight:bold">Surnom changé : « ${nickEvo.oldNick} » devient « ${nickEvo.newNick} » (${nickEvo.reason}).</span>`; }
  }
  // ==== [ANCRE: SYSTEME_CLASSES] (déclencheur) — item demandé : proposition
  // UNIQUE à 23 ans (choix définitif), jamais reproposée une fois tranchée.
  // Redirige vers un écran dédié après ce combat, sur le même principe que
  // contractExpiry plus haut — la sélection réelle se fait ailleurs
  // (CL.chooseClass), ce bloc ne fait que lever le drapeau.
  let classOffer=false;
  if(!forced && !G.f.retired && !G.f.classChosen && G.f.age>=23){
    classOffer=true;
  }
  // ==== [ANCRE: SYSTEME_CLASSES_31] (déclencheur) — même principe que
  // SYSTEME_CLASSES ci-dessus, décalé à 31 ans, avec une dépendance
  // supplémentaire : ne peut être proposé qu'après le choix à 23 ans
  // (classChosen) — sinon CLASSES_31[style][f.class] serait undefined côté
  // écran/contrôleur. classOffer et class31Offer sont mutuellement
  // exclusifs par construction (23 < 31, et classOffer se referme dès que
  // classChosen passe à true la fois où il est résolu), donc jamais les
  // deux en même temps sur un seul combat — pas besoin de priorité
  // explicite entre eux dans le routeur, mais class31Offer est quand même
  // placé après classOffer dans routeAfterCareerPending() par cohérence
  // chronologique (23 ans avant 31 ans).
  let class31Offer=false;
  if(!forced && !G.f.retired && G.f.classChosen && !G.f.class31Chosen && G.f.age>=31){
    class31Offer=true;
  }
  // ==== [ANCRE: CIRCUIT_AMATEUR] — remplace la promotion automatique org 0->1
  // par une offre de contrat pro (spectacle > ratio propre). Au-delà (org>=1),
  // la logique de promotion existante (canPromote) est inchangée, sauf à org 4
  // (Continentale) où elle bascule vers le dilemme Pacific Championship/Ultimate Rim.
  // Au-delà (org 5 ou 6), canPromote n'est plus jamais appelée : ligue terminale.
  let proOffer=null, topTierOffer=false, promoOffer=false;
  if(G.f.org===0){
    if((G.f.proOfferCooldown||0)>0) G.f.proOfferCooldown--;
    const warThisFight=(res.stats.A.sig+res.stats.B.sig>60) || (res.stats.A.kd+res.stats.B.kd>=2);
    if(oppRankBefore<=15 && (!win || isDecisionLike(res.method) || warThisFight)){
      G.f.amateurRivals=G.f.amateurRivals||[];
      if(!G.f.amateurRivals.find(r=>r.id===opp.id)) G.f.amateurRivals.push(opp);
    }
    // ==== [ANCRE: AMA_TOURNAMENT_RESOLVE] — bracket top-8 (quarts/demies/finale),
    // remplace l'ancien système "one-shot contre le rang #1". Les 3 autres matchs
    // de chaque tour sont simulés en coulisses via le vrai moteur (simulateFight),
    // pas un tirage arbitraire — les PNJ progressent selon un vrai résultat. ====
    if(G.tournament && G.tournament.active){
      const t=G.tournament;
      if(win){
        const survivors=[];
        t.matches.forEach(m=>{
          if(m.a.id===G.f.id || m.b.id===G.f.id){ survivors.push(G.f); }
          else {
            const npcRes=simulateFight(m.a,m.b,3);
            applyResult(m.a,m.b,npcRes,'A'); applyResult(m.b,m.a,npcRes,'B');
            survivors.push(npcRes.winner==='A'?m.a:m.b);
          }
        });
        if(t.step==='Quarts de finale'){
          t.step='Demi-finale';
          t.matches=[{a:survivors[0],b:survivors[3]},{a:survivors[1],b:survivors[2]}];
          milestone='Victoire en Quart ! Qualifié pour la Demi-finale.';
        } else if(t.step==='Demi-finale'){
          t.step='Finale';
          t.matches=[{a:survivors[0],b:survivors[1]}];
          milestone='Victoire en Demi ! Qualifié pour la Finale.';
        } else if(t.step==='Finale'){
          t.active=false; G.tournament=null;
          G.f.amaTitles=G.f.amaTitles||[]; G.f.amaTitles.push(t.cfg.id);
          G.f.amaAttempted=G.f.amaAttempted||[]; G.f.amaAttempted.push(t.cfg.id);
          G.f.rankBoost=(G.f.rankBoost||0)+100;
          milestone=`<span class="gold" style="display:inline-flex;align-items:center;gap:4px">${SVG.medal} Ceinture ${t.cfg.label} remportée !</span>`;
          recordTitleChange(0, t.cfg.name, G.f.name, opp.name, orgDisplayName(G.f));
          proOffer=evaluateProOffer(G.f,res,oppRankBefore);
        }
      } else {
        milestone=`Éliminé en ${t.step} du ${t.cfg.label}.`;
        G.f.amaAttempted=G.f.amaAttempted||[]; G.f.amaAttempted.push(t.cfg.id);
        t.active=false; G.tournament=null;
      }
    } else {
      const newCfg=checkAmaChampionship(G.f);
      if(newCfg && !G.tournament){ G.tournament=generateTournament(G.f,newCfg); milestone=milestone||`${newCfg.label} : qualifié dans le Top 8 pour le tournoi !`; }
    }
    // ==== [FIN ANCRE] ====
    if(win || G.f.age>=26){ proOffer=proOffer||evaluateProOffer(G.f,res,oppRankBefore); }
  } else if(G.f.org<5){
    if(!G.f.champion && canPromote(G.f) && (!G.f.promoCooldown || G.f.promoCooldown<=0)){
      if(G.f.org===4){ topTierOffer=true; }
      else { promoOffer=true; }
    }
    // Free Agency : un champion avec au moins 2 défenses attire les ligues supérieures
    else if(G.f.champion && G.f.defenses>=2 && (!G.f.promoCooldown || G.f.promoCooldown<=0)){
      if(G.f.org===4){ topTierOffer=true; }
      else { promoOffer=true; } // réutilise l'écran de promo, adapté pour signaler le transfert
    }
  }
  // (org>=5 : plus de rétrogradation immédiate en pleine série de défaites —
  // remplacée par le risque de non-renouvellement à l'échéance du contrat,
  // cf. ANCRE: NON_RENOUVELLEMENT.)
  if(G.f.promoCooldown>0) G.f.promoCooldown--;
  // ==== [FIN ANCRE] ====
  const newAch=checkAch();
  if(typeof checkScenarioState==='function'){
    checkScenarioState(res);
    if(G.lastMsg && G.lastMsg.includes('Scénario')){ milestone=G.lastMsg; G.lastMsg=null; }
    if(G.f.retired) forced=true;
  }
  G.pending={res,win,method:res.method,finish,milestone,nickEvoHtml,skill,newAch,forced,planLabel:G.fight.planLabel,endOfSeason,proOffer,topTierOffer,promoOffer,contractExpiry,contractNonRenewed,champChampDecision,champChampOfferReady,narrative,purseDetail:G.fight.purseDetail,classOffer,class31Offer,
    opp:{name:opp.name,flag:opp.flag}, camp:G.campApplied};
}
function turnPro(){ const f=G.f; f.amaRec={W:f.W,L:f.L}; f.stage='pro';
  f.W=f.L=f.D=f.ko=f.sub=f.dec=f.koLoss=f.streak=0; f.orgWins=0; f.easyFights=0; f.history=[]; f.champion=null; f.titles=0; f.defenses=0; f._fy=0;
  // ==== [ANCRE: CORRECTIF_CONTAMINATION_SAISON] — bug trouvé : turnPro()
  // nettoyait bien tous les compteurs du combattant, mais oubliait le
  // registre PARTAGÉ de la saison en cours (G.season.fights). Un passage pro
  // en milieu de saison amateur laissait les combats amateurs contaminer le
  // bilan de fin d'année pro (trophées "Upset de l'année" etc. calculés sur
  // des données amateurs obsolètes). L'année elle-même continue, seul le
  // registre des combats de la saison en cours est remis à zéro.
  G.season={year:G.season.year,fights:[]};
  f.nick=earnNickname(f); }
function earnNickname(f,excludeGrappler,excludeInvincible){ const a=f.attrs;
  const striker=['le Sniper','le Marteau','la Foudre','le Bourreau','Mains de Pierre','le Cogneur','le Fossoyeur','l\u2019Exécuteur','le Dynamiteur','Poings de Fer','le Chasseur','la Tempête','le Fauve','Double Détonation','le Dévastateur','l\u2019Incendiaire'];
  const grappler=['l\u2019Anaconda','le Python','le Boa','l\u2019Étau','le Nœud Coulant','le Suffocateur','la Pieuvre','le Verrou','l\u2019Étrangleur','le Chirurgien du Sol','la Tenaille','le Croc','l\u2019Ancre','le Serpent','le Cadenas'];
  const pressure=['le Bulldozer','le Rouleau','Cœur de Lion','la Machine','l\u2019Ouragan','le Métronome Infernal','l\u2019Increvable','le Marathonien','la Locomotive','le Mur','l\u2019Inébranlable','la Digue'];
  const tech=['le Chirurgien','le Professeur','l\u2019Horloger','l\u2019Architecte','le Stratège','l\u2019Échiquier','le Calculateur','le Précis','le Tacticien','le Fantôme','l\u2019Illusionniste'];
  // Surnoms liés au vrai parcours amateur — pas seulement aux attributs bruts
  const invincible=['l\u2019Invaincu','le Phénomène','la Prophétie','l\u2019Élu','le Miracle'];
  const gritty=['le Survivant','le Cœur Brisé','l\u2019Increvable du Ring','le Guerrier','le Cicatrisé','l\u2019Increvable'];
  const amaW=(f.amaRec&&f.amaRec.W)||0, amaL=(f.amaRec&&f.amaRec.L)||0, amaTotal=amaW+amaL;
  if(!excludeInvincible && amaTotal>=5 && amaL===0) return pick(invincible);
  if(amaTotal>=6 && amaL>=amaW) return pick(gritty);
  // ==== [ANCRE: CORRECTIF_SURNOM_GRAPPLER] — bug remonté ("l'Étau" attribué à
  // tort) : l'ancienne condition ne comparait QUE la soumission à deux stats
  // de frappe isolées (power, jab), ignorant takedown/contrôle au sol/ground
  // and pound — l'identité réelle d'un grappler — tout en ignorant crochet/
  // low kick/direct côté frappe. Un combattant pouvait ainsi hériter d'un
  // surnom de soumission avec un profil de frappeur pur, ou l'inverse. On
  // compare désormais deux scores agrégés représentatifs de chaque identité.
  const grappleScore=((a.submission||0)+(a.takedown||0)+(a.topControl||0)+(a.gnp||0)+(a.clinchStr||0))/5;
  const strikeScore=((a.power||0)+(a.jab||0)+(a.cross||0)+(a.hook||0)+(a.kick||0))/5;
  if(!excludeGrappler && grappleScore>=strikeScore && grappleScore>=55) return pick(grappler);
  if(a.power>=70 || a.killer>=70) return pick(striker);
  if(a.fightIQ>=70 || a.adaptability>=70) return pick(tech);
  if(a.heart>=70 || a.cardio>=70) return pick(pressure);
  return pick(striker.concat(tech));
}
// ==== [ANCRE: EVOLUTION_SURNOM] — item demandé : dans de rares cas, le
// surnom doit évoluer pour rester cohérent avec le parcours réel (positif OU
// négatif), avec trace de l'ancien surnom conservée. Règles :
// - Maximum 2 changements sur toute la carrière (f.nicknameChanges).
// - Cooldown de 8 combats minimum entre deux vérifications déclenchées,
//   pour éviter un surnom qui change trop souvent.
// - Chaque condition ci-dessous correspond à un cas concret remonté :
//   l'invaincu qui perd sa première défaite, l'élu qui stagne en division
//   inférieure, l'Anaconda qui ne soumet plus personne, la Machine qui
//   encaisse des KO. Une condition positive existe aussi (devenir champion
//   avec un surnom "modeste") — le surnom peut donc s'améliorer, pas
//   seulement se dégrader.
// - Tirage à 35% une fois la condition remplie : garde un peu d'aléatoire,
//   le changement n'est jamais garanti au combat exact qui l'a déclenché.
function checkNicknameEvolution(f,win){
  if(!f.nick || f.org===0) return null;
  const changes=f.nicknameChanges||0;
  if(changes>=2) return null;
  const invincible=['l\u2019Invaincu','le Phénomène','la Prophétie','l\u2019Élu','le Miracle'];
  const grappler=['l\u2019Anaconda','le Python','le Boa','l\u2019Étau','le Nœud Coulant','le Suffocateur','la Pieuvre','le Verrou','l\u2019Étrangleur','le Chirurgien du Sol','la Tenaille','le Croc','l\u2019Ancre','le Serpent','le Cadenas'];
  const pressure=['le Bulldozer','le Rouleau','C\u0153ur de Lion','la Machine','l\u2019Ouragan','le Métronome Infernal','l\u2019Increvable','le Marathonien','la Locomotive','le Mur','l\u2019Inébranlable','la Digue'];
  const totalFights=(f.W||0)+(f.L||0);
  let reason=null;
  let lostInvincibility=false;
  // ==== [ANCRE: CORRECTIF_SURNOM_MOMENT_INVINCIBILITE] — bug remonté : la
  // perte de l'invincibilité doit être détectée AU COMBAT MÊME où elle
  // survient. Avant, ce cas passait par le même cooldown anti-spam de 8
  // combats que les autres raisons (évite un surnom qui change trop souvent)
  // — si la première défaite du combattant "invaincu" arrivait avant que ce
  // cooldown ne soit écoulé, la vérification était sautée et le combat
  // suivant testait `!win` sur un TOUT AUTRE combat, sans lien avec la vraie
  // perte d'invincibilité. On sort donc ce cas précis du cooldown : il est
  // vérifié sur chaque combat, indépendamment de fightsSinceNickChange.
  if(invincible.includes(f.nick) && !win){ reason='a perdu son invincibilité'; lostInvincibility=true; }
  f.fightsSinceNickChange=(f.fightsSinceNickChange||0)+1;
  if(!reason){
    if(f.fightsSinceNickChange<8) return null;
    if(invincible.includes(f.nick) && (f.org||0)<=3 && totalFights>=25) reason='stagne loin du sommet malgré son surnom';
    else if(grappler.includes(f.nick) && totalFights>=10 && (f.sub||0)===0) reason='n\u2019a plus soumis personne depuis longtemps';
    else if(pressure.includes(f.nick) && (f.koLoss||0)>=3) reason='a montré des fissures inattendues';
    else if(!invincible.includes(f.nick) && f.champion && (f.titles||0)===1) reason='a enfin justifié tous les espoirs placés en lui';
  }
  if(!reason) return null;
  if(rnd()>=0.35) return null;
  // le combattant qui n'a plus soumis personne quitte l'identité "grappler" :
  // le nouveau surnom ne doit pas être repioché dans ce même pool sous prétexte
  // que ses attributs bruts de soumission restent élevés (sinon le changement
  // n'a aucun sens narratif — un boxeur qui ne finit jamais au sol hérite d'un
  // surnom de soumission).
  const excludeGrappler=grappler.includes(f.nick) && (f.sub||0)===0;
  // ==== [ANCRE: CORRECTIF_SURNOM_INVAINCU] — bug remonté : un combattant qui
  // vient de perdre (et donc de quitter le pool "invincible") pouvait se voir
  // réattribuer un surnom du MÊME pool — y compris littéralement "L'Invaincu"
  // — car earnNickname() se basait sur le record amateur (jamais réinitialisé
  // en cours de carrière), sans lien avec la défaite qui vient de survenir.
  const newNick=earnNickname(f,excludeGrappler,lostInvincibility);
  if(newNick===f.nick) return null;
  if(!f.nicknameHistory) f.nicknameHistory=[];
  f.nicknameHistory.push(f.nick);
  const oldNick=f.nick;
  f.nick=newNick;
  f.nicknameChanges=changes+1;
  f.fightsSinceNickChange=0;
  return {oldNick,newNick,reason};
}

/* ------------------------------ succès ------------------------------------ */
/* ==== [ANCRE: SVG_ICONS] — width/height en 1em (pas 24 fixe) : hérite du
   font-size du conteneur. Sans ça, la légende de fin de carrière (font-size:60px)
   afficherait une icône minuscule 24px au lieu de remplir l'espace comme le
   faisait l'emoji. Les .ico des listes de succès (font-size:19px en CSS)
   héritent aussi correctement de cette façon. ==== */
const ACH=[
 {id:'debut',cat:'Carrière & Titres',ico:SVG.glove,h:'Baptême',d:'Gagner ton 1er combat',t:f=>f.W>=1||f.amaRec},
 {id:'pro',cat:'Carrière & Titres',ico:SVG.pro,h:'Passage pro',d:'Devenir professionnel',t:f=>f.stage==='pro'},
 {id:'euro',cat:'Carrière & Titres',ico:SVG.medal,h:'Roi d\u2019Europe',d:'Ceinture européenne',t:f=>f.titles>=1&&f._euro},
 {id:'world',cat:'Carrière & Titres',ico:SVG.crown,h:'Champion du monde',d:'Ceinture mondiale',t:f=>f._world},
 {id:'defend5',cat:'Carrière & Titres',ico:SVG.shield,h:'Dynastie',d:'5 défenses de titre',t:f=>f.defenses>=5,prog:f=>[Math.min(f.defenses||0,5),5]},
 {id:'undef',cat:'Carrière & Titres',ico:SVG.diamond,h:'L\u2019Invaincu',d:'Champion sans défaite pro',t:f=>f._world&&f.L===0},
 {id:'ko1',cat:'Finitions & Séries',ico:SVG.ko,h:'Bonne nuit',d:'Gagner par KO',t:f=>f.ko>=1},
 {id:'sub1',cat:'Finitions & Séries',ico:SVG.sub,h:'Le piège',d:'Gagner par soumission',t:f=>f.sub>=1},
 {id:'streak8',cat:'Finitions & Séries',ico:SVG.fire,h:'Intouchable',d:'8 victoires d\u2019affilée',t:f=>f.streak>=8,prog:f=>[Math.min(Math.max(f.streak||0,0),8),8]},
 {id:'koking',cat:'Finitions & Séries',ico:SVG.skull,h:'Machine à KO',d:'12 victoires par KO',t:f=>f.ko>=12,prog:f=>[Math.min(f.ko||0,12),12]},
 {id:'subking',cat:'Finitions & Séries',ico:SVG.web,h:'Le finisseur du sol',d:'12 soumissions',t:f=>f.sub>=12,prog:f=>[Math.min(f.sub||0,12),12]},
 {id:'skill3',cat:'Technique & Héritage',ico:SVG.skill,h:'Arsenal secret',d:'Débloquer 3 compétences',t:f=>f.skills.length>=3,prog:f=>[Math.min(f.skills.length,3),3]},
 {id:'skill8',cat:'Technique & Héritage',ico:SVG.dna,h:'Prodige technique',d:'Débloquer 8 compétences',t:f=>f.skills.length>=8,prog:f=>[Math.min(f.skills.length,8),8]},
 {id:'legend',cat:'Technique & Héritage',ico:SVG.goat,h:'Légende vivante',d:'Mondial + 5 défenses',t:f=>f._world&&f.defenses>=5},
 {id:'vet',cat:'Technique & Héritage',ico:SVG.veteran,h:'Vétéran',d:'30 combats pro',t:f=>f.stage==='pro'&&(f.W+f.L+f.D)>=30,prog:f=>[Math.min((f.W||0)+(f.L||0)+(f.D||0),30),30]},
 {id:'amachamp',cat:'Carrière & Titres',ico:SVG.trophy,h:'Champion amateur',d:'Remporter un tournoi amateur (WMA/DMMA)',t:f=>!!(f.amaTitles&&f.amaTitles.length>=1)},
 {id:'amachamp2',cat:'Carrière & Titres',ico:SVG.flag,h:'Double couronne amateur',d:'Remporter 2 tournois amateurs différents',t:f=>!!(f.amaTitles&&f.amaTitles.length>=2),prog:f=>[Math.min((f.amaTitles||[]).length,2),2]},
 {id:'pacific',cat:'Carrière & Titres',ico:SVG.compass,h:'Gloire internationale',d:'Signer avec Pacific Championship',t:f=>f.org===6},
 {id:'ultimaterim',cat:'Carrière & Titres',ico:SVG.gem,h:'Contrat en argent',d:'Signer avec Ultimate Rim',t:f=>f.org===5},
 {id:'rivalry',cat:'Finitions & Séries',ico:SVG.mask,h:'Rivalité légendaire',d:'4 confrontations contre le même rival',t:f=>!!(f.biggestRival&&f.biggestRival.count>=4),prog:f=>[Math.min((f.biggestRival&&f.biggestRival.count)||0,4),4]},
 {id:'skill9',cat:'Technique & Héritage',ico:SVG.book,h:'Encyclopédie vivante',d:'Débloquer 9 compétences',t:f=>f.skills.length>=9,prog:f=>[Math.min(f.skills.length,9),9]},
 // ==== [ANCRE: LOT8_VENGEANCE] ====
 {id:'vengeance_ultime',cat:'Finitions & Séries',ico:SVG.target,h:'Vengeance Ultime',d:'Finir par KO ou Soumission un rival qui vous a battu lors de votre première rencontre.',
   t:f=>{ if(!f.history) return false; const rivalIds=Object.keys(f._rivalries||{});
     // `==` volontaire (pas une erreur) : Object.keys() renvoie toujours des
     // chaînes, alors que h.oppId peut être un nombre pour d'anciennes
     // sauvegardes (avant le passage à un identifiant unique en chaîne). Le
     // remplacer par === casserait la comparaison pour ces anciennes données.
     for(const rId of rivalIds){ const encounters=f.history.filter(h=>h.oppId==rId);
       if(encounters.length>=2){ const first=encounters[0], last=encounters[encounters.length-1];
         if(first.res==='loss' && last.res==='win' && (last.method.startsWith('KO')||last.method.startsWith('Soum'))) return true; } }
     return false; }},
 // ==== [FIN ANCRE] ====
 // ==== [ANCRE: FAITH_ACHIEVEMENTS] — Lot 3 du mode MMA Faith ====
 {id:'f_phenix',cat:'Carrière & Titres',ico:SVG.phoenix,h:'Phénix',d:'Remonter d\u2019une série de 3 défaites pour devenir champion.',
   t:f=>f.champion && f.history && f.history.length>5 && f.history.slice(-4).filter(x=>x.res==='loss').length>=3},
 {id:'f_murdutemps',cat:'Carrière & Titres',ico:SVG.hourglass,h:'Le Mur du Temps',d:'Rester invaincu professionnellement jusqu\u2019à l\u2019âge de 35 ans.',
   t:f=>f.L===0 && f.age>=35 && f.stage==='pro'},
 {id:'f_doublemonarque',cat:'Carrière & Titres',ico:SVG.infinity,h:'Double Monarque',d:'Remporter le supercombat et devenir double champion de deux catégories différentes.',
   t:f=>!!f.champChampBelt},
 {id:'f_cyborg',cat:'Technique & Héritage',ico:SVG.gem,h:'Cyborg',d:'Subir moins de 50 dégâts crâniens sur une série de 10 combats.',
   t:f=>G.season && G.season.fights && G.season.fights.length>=10 && G.season.fights.slice(-10).reduce((acc,fight)=>acc+((fight.st&&fight.st.Me&&fight.st.Me.dmgHead)||0),0)<50},
 {id:'f_ruine',cat:'Carrière & Titres',ico:SVG.compass,h:'Hémorragie Financière',d:'Se retrouver ruiné (gains négatifs) après un événement ou investissement payant.',
   t:f=>(f.earnings||0)<0},
 {id:'f_bourreau',cat:'Technique & Héritage',ico:SVG.veteran,h:'Bourreau des Légendes',d:'Battre 3 adversaires distincts ayant un Elo supérieur à 1800.',
   t:f=>f.history && [...new Set(f.history.filter(h=>h.res==='win' && h.oppElo>1800).map(h=>h.oppId))].length>=3},
 {id:'f_plafondverre',cat:'Finitions & Séries',ico:SVG.star,h:'Plafond de Verre Percé',d:'Gagner par KO alors que votre puissance brute est inférieure à 40.',
   t:f=>f.attrs && f.attrs.power<40 && f.history && f.history.length>0 && f.history[f.history.length-1].method.startsWith('KO') && f.history[f.history.length-1].res==='win'},
 // ==== [FIN ANCRE] ====
 /* ==== [ANCRE: GAUNTLET_SUCCES] — checkAch() tournait DÉJÀ en arcade (cf.
    ANCRE REJOUABILITE_ACH_ARCADE, ui-03) mais aucune des 29 entrées n'était
    atteignable autrement qu'en carrière : plusieurs conditions (champion,
    defenses, retraite) ne peuvent structurellement jamais se produire dans un
    run. Ces entrées lisent l'état de la run sur le global G.arcade — même style
    que les succès Faith existants qui lisent déjà G.season. La garde
    `G.arcade &&` est obligatoire : ACH est parcouru intégralement à CHAQUE
    combat de carrière, où G.arcade vaut null. checkAch() est appelé deux fois
    en arcade — pendant le combat (resolveArcadeFight) et en fin de run
    (finaliseGauntletRun, ui-08) — donc les conditions de fin de run sont bien
    évaluées avant que G.arcade.active ne soit remis à false ailleurs. ==== */
 {id:'g_mise',cat:'Gauntlet',ico:SVG.fire,h:'Tout ou Rien',d:'Atteindre un multiplicateur de mise ×4 dans une run du Gauntlet.',
   t:()=>!!(G.arcade && (G.arcade.riskMult||1)>=4)},
 {id:'g_contrat',cat:'Gauntlet',ico:SVG.medal,h:'Parole Tenue',d:'Terminer une run du Gauntlet en ayant rempli son contrat de run.',
   t:()=>!!(G.arcade && G.arcade.contract && G.arcade.contract.done)},
 {id:'g_ascension',cat:'Gauntlet',ico:SVG.crown,h:'Vertige',d:'Terminer une run lancé en Ascension 3 ou plus.',
   t:()=>!!(G.arcade && (G.arcade.asc||0)>=3)},
 {id:'g_vengeance',cat:'Gauntlet',ico:SVG.hammer,h:'Dossier Clos',d:'Battre un némésis qui vous avait éliminé lors d\\u2019un run précédent.',
   t:()=>!!(G.arcade && (G.arcade.bounties||0)>=1)},
 {id:'g_maudit',cat:'Gauntlet',ico:SVG.skull,h:'Le Prix du Pouvoir',d:'Accepter deux pactes de camp maudits dans une même run.',
   t:()=>!!(G.arcade && (G.arcade.cursedTaken||0)>=2)},
 {id:'g_estropie',cat:'Gauntlet',ico:SVG.shield,h:'Sur les Rotules',d:'Encaisser 3 séquelles dans une même run et continuer malgré tout.',
   t:()=>!!(G.arcade && (G.arcade.runInjuries||[]).length>=3)},
 {id:'g_daily',cat:'Gauntlet',ico:SVG.hourglass,h:'Rendez-vous Quotidien',d:'Terminer un Défi du Jour du Gauntlet.',
   t:()=>!!(G.arcade && G.arcade.daily && !G.arcade.active)},
 {id:'g_intact',cat:'Gauntlet',ico:SVG.diamond,h:'Sans une Égratignure',d:'Remporter une run du Gauntlet sans la moindre séquelle.',
   t:()=>!!(G.arcade && G.arcade.victory && !(G.arcade.runInjuries||[]).length)}
 /* ==== [FIN ANCRE] ==== */
];
/* ==== [FIN ANCRE] ==== */
function checkAch(){
  let globalAch=loadAch();
  if(G.f.champion==='monde')G.f._world=true; if(G.f.champion==='europe')G.f._euro=true;
  const got=[];
  for(const a of ACH){ if(!globalAch.includes(a.id)&&a.t(G.f)){ globalAch.push(a.id); got.push(a); } }
  saveAch(globalAch);
  G.ach=globalAch;
  return got;
}

/* ============================== ÉCRANS ==================================== */
function last5(f){ const h=f.history.slice(-5); if(!h.length)return '<span class="muted small">Pas encore de combat</span>';
  return '<div class="l5">'+h.map(x=>{ const ko=x.method&&x.method.startsWith('KO'),sub=x.method&&x.method.startsWith('Soum');
    const letter=x.res==='win'?'V':(x.res==='draw'?'N':'D'); const cls=x.res==='win'?'w':(x.res==='draw'?'d':'l');
    return `<span class="p ${cls}" title="${x.method||''}">${letter}<i>${ko?'KO':sub?'SUB':'DÉC'}</i></span>`; }).join('')+'</div>'; }
function formatCtrl(v){ const totalSec=Math.round((v||0)*100); const m=Math.floor(totalSec/60), s=totalSec%60; return `${m}:${s<10?'0':''}${s}`; }
function formatArgent(kMontant){ const total=Math.round((kMontant||0)*1000);
  // ==== [ANCRE: CORRECTIF_DOLLAR_INSECABLE] — bug remonté : le symbole "$"
  // se retrouvait décalé/repoussé à la ligne suivante dans les conteneurs
  // flex étroits (ex. "Frais de camp (manager, coach, salle)"), car l'espace
  // avant "$" était un espace normal (cassable). Espace insécable (\u00A0)
  // pour garder le montant et le symbole solidaires sur une seule ligne.
  if(total>=1000000) return (total/1000000).toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:1}).replace(/\s/g,'\u00A0')+'\u00A0M\u00A0$';
  return total.toLocaleString('fr-FR').replace(/\s/g,'\u00A0')+'\u00A0$';
}
function recordStr(f){ return `${f.W}<span class="muted">-</span><span class="loss">${f.L}</span>${f.D?('<span class="muted">-</span>'+f.D):''}`; }
// ==== [ANCRE: CORRECTIF_CODE_MORT] — orgTag() supprimée : définie mais
// jamais appelée nulle part (vérifié par comptage d'usage). Elle utilisait
// le nom brut ORGS[f.org] sans tenir compte des noms d'ambiance (PVM,
// Iguana Iguana...) — orgDisplayName(f), utilisée partout ailleurs dans le
// jeu, l'a visiblement remplacée sans que ce reliquat soit nettoyé.
function gauge(v){ return `<span class="gauge"><span style="width:${clamp(d20(v)/20*100,0,100)}%"></span></span>`; }

/* ==== [ANCRE: ECRAN_TITRE] — sas d'entrée séparant Carrière et Arcade.
   Adapté aux vrais gestionnaires existants : CL.go('intro') pour la carrière
   (reprendre/créer/panthéon), CL.startArcade() pour le Gauntlet — pas
   d'initCareer()/initArcade() qui n'existent pas. ==== */
