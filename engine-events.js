"use strict";
/* CAGE LEGACY — js/engine-events.js
   Extrait d'engine.js (chantier 4 : refactorisation progressive du moteur).
   Regroupe les responsabilites "evenements & narration" du moteur : eres
   MMA, actualites (NPC + joueur, contextualisees aux vraies stats),
   memoire tactique, objectifs sponsor, personnalite,
   tactiques/entrainements exclusifs, Mue Martiale,
   synergies de competences, IA adaptative, tension economique de
   l'entrainement (camps), rivalites & hype (dont rivalryHeat/arcs
   narratifs, chantier 3), et le tick de simulation de fond (worldTick).

   Deplace a l'IDENTIQUE depuis engine.js : memes noms de fonctions, memes
   signatures, memes ancres ANCRE:/FIN ANCRE, comportement strictement
   inchange. Scope global classique (pas d'import/export) :
   depend des primitives d'engine.js (rnd/pick/clamp/num/DIVISIONS/STYLES/
   ATTR_KEYS/eloBaseline/p4pScore/divRank/isDeclining/applyDeltas/
   rollInjury/eff/overall...), donc CHARGE JUSTE APRES engine.js et AVANT
   state.js dans index.html — jamais avant engine.js, jamais apres
   state.js/ui-*.js qui appellent ces fonctions. */

/* ==== [ANCRE: LOT1_ECOSYSTEME] — écosystème vivant & méta-narratif.
   Note d'intégration : les buffs d'ère et de synergie s'appliquent aux
   ATTRIBUTS BRUTS (f.attrs), pas aux canaux calculés par eff() — 'kick',
   'footSpeed', 'durability', 'composure' n'existent QUE comme attributs
   bruts (repliés dans striking/footwork/chin/fightIQ par eff()), donc un
   buff sur ces clés appliqué à un objet de canaux eff() serait silencieusement
   ignoré. Ce choix mime exactement comment grantSkill() applique déjà fx. ==== */
const MMA_ERAS=[
  {id:'era_calf',name:"L\u2019Ère du Calf-Kick",buff:{kick:12},duration:4},
  {id:'era_daghestan',name:"L\u2019Âge d\u2019Or de la Lutte Daghestanaise",buff:{takedown:15,topControl:10},duration:5},
  {id:'era_boxing',name:"Le Renouveau du Noble Art",buff:{handSpeed:10,footSpeed:15},duration:4},
  {id:'era_bjj',name:"La Menace des Leglocks",buff:{submission:15,guardWork:10},duration:4},
  {id:'era_clinch',name:"L\u2019Ère de la Boxe Sale",buff:{clinchStr:15,chin:10},duration:5},
  {id:'era_karate',name:"L\u2019Avènement du Style Fuyant",buff:{footSpeed:15,fightIQ:10},duration:4}
];
function checkAndApplyEra(){
  if(!G.currentEra){ if(rnd()<0.15){ const era=pick(MMA_ERAS); G.currentEra={...era,startYear:(G.season&&G.season.year)||1}; } }
  else { if(((G.season&&G.season.year)||1)-G.currentEra.startYear>=G.currentEra.duration){ G.currentEra=null; } }
}
// Appelé une fois par combat sur chaque combattant (attributs bruts, temporaire —
// à restaurer après simulateFight comme le fait déjà le mécanisme meta05/malus).
function eraBuffSnapshot(f){
  const saved={};
  if(G.currentEra){ for(const k in G.currentEra.buff){ if(f.attrs[k]!==undefined){
    saved[k]=f.attrs[k]; f.attrs[k]=clamp(Math.round(f.attrs[k]*(1+G.currentEra.buff[k]/100)),1,100); } } }
  return saved;
}
function restoreSnapshot(f,saved){ for(const k in saved){ f.attrs[k]=saved[k]; } }

/* ==== [ANCRE: NPC_NEWS_CONTEXTUALISEES] — Lot C01/2026 §C05 : generateNPCNews()
   retirée avec la carte « Actualités de la division » du hub (ui-06), son seul
   affichage. G.divisionNews restait alimenté par generatePlayerContextualNews()
   (chantier 3, narration procédurale), jugé hors périmètre à l'époque.
   Lot P3/2026 (sous-menus Combat/Dossier du hub) revérifie : aucun écran ne
   consommait G.divisionNews (grep sur tout le dépôt), la carte d'actualités
   du hub n'ayant jamais été réintroduite ailleurs — generatePlayerContextualNews()
   et G.divisionNews sont donc retirés à leur tour, plutôt que de laisser du
   code mort qui n'écrit que dans le vide. checkNarrativeArc() (juste plus
   bas) reste en place : f.narrativeArc est un champ persisté et validé
   (state-validation.js) distinct de G.divisionNews, hors périmètre de ce
   nettoyage précis. ==== */

// Mémoire tactique de rematch : boost temporaire ciblé sur l'adversaire (attributs
// bruts, restaurer après le combat) selon la méthode de la victoire du joueur au
// combat précédent contre ce même adversaire précis.
function applyTacticalMemory(npc,player){
  const saved={};
  if(!player.history) return saved;
  const pastFights=player.history.filter(h=>h.oppId===npc.id);
  if(pastFights.length>=1){
    const lastFight=pastFights[pastFights.length-1];
    if(lastFight.res==='win'){
      const method=lastFight.method||'';
      const keys=(method.startsWith('Soum'))?['tdd','fightIQ']:(method.startsWith('KO')?['footSpeed','chin']:[]);
      keys.forEach(k=>{ if(npc.attrs[k]!==undefined){ saved[k]=npc.attrs[k]; npc.attrs[k]=clamp(npc.attrs[k]+(k==='fightIQ'?5:15),1,100); } });
    }
  }
  return saved;
}

/* ==== [ANCRE: CORRECTIF_SUPPRESSION_OBJECTIF_SPONSOR] — Lot C01/2026
   §C10b : SPONSOR_OBJECTIVES, generateSponsorObjective() et
   evaluateSponsor() retirés — plus de promesse de gain chiffré liée à un
   sponsor avant combat. L'événement narratif sponsor_clash (pesée,
   ui-02-fight-prep-events.js) est conservé : sans rapport avec cet
   objectif chiffré, purement narratif. ==== */


function setPersonality(alignment){
  G.f.personality=alignment;
  if(alignment==='villain'){ G.f.hypeBonus=1.3; G.f.morale=clamp(G.f.morale-10,0,100); }
  else if(alignment==='humble'){ G.f.hypeBonus=1.0; G.f.morale=clamp(G.f.morale+15,0,100); G.f.attrs.focus=clamp((G.f.attrs.focus||50)+10,1,100); }
}
/* ==== [FIN ANCRE] ==== */



/* ==== [ANCRE: V2-42, lecture (a)] — "un combattant porteur d'une anomalie
   n'affiche plus d'étiquette tactique générique : son anomalie EST sa
   lecture." Les deux tactiques exclusives ("Sniper Hors-Portée",
   "Destruction Massive") issues des anomalies physiques sont retirées —
   remplacées par une vraie description lue sur l'adversaire
   (ANOMALY_READS/anomalyReadLine, ui-02 tacticalRead()), pas jouée comme
   un choix. getExclusiveTactics() est gardée (9 points d'appel dans
   ui-03/04/06/08, chacun réutilisé À L'IDENTIQUE côté affichage ET côté
   action choisie — les retirer un par un aurait risqué un désalignement
   d'index entre l'écran et le combattant réellement joué) mais réduite à
   un tableau toujours vide : le comportement de tous ses appelants
   converge naturellement vers "aucune tactique exclusive", sans toucher
   à leur code. getExclusiveTraining() (juste en dessous, écran
   d'entraînement, pas de plan de combat) n'est PAS concernée : ce n'est
   pas l'étiquette tactique visée par le document. */
function getExclusiveTactics(f){ return []; }
function getExclusiveTraining(f){
  const trainings=[]; const tags=(f.phys&&f.phys.tags)||[];
  if(tags.includes('explosivité rare (type Cormier)')){
    trainings.push({t:['all'],label:'Surcharge Pliométrique',hint:'Affûter les fibres blanches pour des entrées en lutte terrifiantes.',d:[['explosiveness',4],['takedown',3],['form',-3]]});
  }
  if(tags.includes('gabarit hors-norme pour la division')){
    trainings.push({t:['all'],label:'Cutting de la Mort',hint:'Conditionnement drastique pour faire le poids malgré une ossature gigantesque.',d:[['cardio',3],['recovery',3],['durability',-2],['morale',-6]]});
  }
  return trainings;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT4_MUE_MARTIALE] — reconversion de style ==== */
function checkMueMartialeEligibility(f){
  const isBlocked=f.age>=30 && (f.orgWins||0)>=10 && !canPromote(f);
  const isLosing=(f.streak||0)<=-3;
  return isLosing||isBlocked;
}
function triggerMueMartiale(f,newStyleId){
  if(!checkMueMartialeEligibility(f)) return {success:false,msg:"Les conditions pour une Mue Martiale ne sont pas réunies."};
  if(!STYLES[newStyleId]) return {success:false,msg:"Style martial invalide."};
  f.style=newStyleId; f.styleLabel=styleLabel(newStyleId); f._drought=0;
  G.lastMsg=`Mue Martiale effectuée avec succès. Vous abordez désormais l\u2019octogone dans un style différent.`;
  return {success:true};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT5_SYNERGIES] — synergies de compétences (mêmes règles que le
   Lot 1 : clés d'attributs bruts, à vérifier contre le vrai catalogue avant
   usage — les IDs ci-dessous sont indicatifs et non confirmés) ==== */
const SKILL_SYNERGIES=[
  {requires:['boxer28','bjj29'],label:'Prédateur Hybride',desc:'La terreur debout ouvre des opportunités terrifiantes au sol.',effect:{power:6,submission:6,fightIQ:3}},
  {requires:['wrestler32','muayThai34'],label:'Forteresse Vivante',desc:'Une fondation inébranlable couplée à une résistance à la douleur absolue.',effect:{tdd:8,durability:8,heart:4}},
  {requires:['karate38','kickboxer31'],label:'Ombre Mortelle',desc:'Des déplacements imperceptibles couplés à des frappes indétectables.',effect:{footSpeed:10,fightIQ:5,composure:5}}
];
function getActiveSynergies(f){ if(!f.skills) return []; return SKILL_SYNERGIES.filter(syn=>syn.requires.every(id=>f.skills.includes(id))); }
// Appliqué aux attributs bruts au moment de la création du combattant ou d'un
// nouveau skill (permanent, contrairement aux buffs temporaires ci-dessus).
function applySynergyBuffs(f){
  if(!f._appliedSynergies) f._appliedSynergies=[];
  getActiveSynergies(f).forEach(syn=>{
    const key=syn.requires.join('+');
    if(f._appliedSynergies.includes(key)) return; // déjà appliquée cette carrière, jamais deux fois
    f._appliedSynergies.push(key);
    for(const k in syn.effect){ if(f.attrs[k]!==undefined){ f.attrs[k]=clamp(f.attrs[k]+syn.effect[k],1,100); } }
  });
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT6_IA_ADAPTATIVE] — IA adaptative en rematch/trilogie. Les
   clés de TACTICS[].m (td,tdd,str,ko,sub,gnp,ctrl,def) et leur mapping vers
   les canaux eff() (takedown,tdd,striking,power,submission,ground,topControl,
   footwork+fightIQ) sont vérifiées EXACTES contre le vrai code — c'est le même
   mapping que celui déjà utilisé par le plan tactique du joueur dans
   simulateFight(). Contrairement aux lots 1/5, celui-ci s'applique donc bien
   aux canaux calculés (car c'est un multiplicateur temporaire de combat, pas
   un buff permanent d'attribut). ==== */
function getAdaptiveNPCTactics(npc,player){
  if(!player.history) return null;
  const encounters=player.history.filter(h=>h.oppId===npc.id);
  if(encounters.length<2) return null;
  const lastEncounter=encounters[encounters.length-1];
  const npcStyleTactics=TACTICS[npc.style]||TACTICS.mma;
  if(lastEncounter.res==='win'){
    const method=lastEncounter.method||'';
    if(method.startsWith('Soum')||method.includes('sol')||method.includes('Décision')){
      const antiLutteTactic=npcStyleTactics.find(t=>t.m&&(t.m.tdd>1.1||t.m.def>1.1));
      if(antiLutteTactic) return antiLutteTactic;
    } else if(method.startsWith('KO')){
      const defensiveTactic=npcStyleTactics.find(t=>t.m&&(t.m.def>1.2||t.m.td>1.1));
      if(defensiveTactic) return defensiveTactic;
    }
  } else if(lastEncounter.res==='loss'){
    const method=lastEncounter.method||'';
    if(method.startsWith('KO')){
      const aggressiveTactic=npcStyleTactics.find(t=>t.m&&t.m.str>1.1);
      if(aggressiveTactic) return aggressiveTactic;
    }
  }
  return null;
}
// Applique le plan adaptatif directement aux canaux eff() de l'adversaire,
// juste avant simulateFight (même mapping que le plan tactique du joueur).
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT7_TENSION_ECO] — tension économique de l'entraînement.
   G.fight.malus (attributs bruts, restauré après combat) n'était appliqué
   QU'AU JOUEUR jusqu'ici — jamais à l'adversaire. G.fight.oppMalus est un
   nouveau champ, l'application à opp.attrs + sa restauration doivent être
   ajoutées dans resolveFight() (ui.js), au même endroit que G.fight.malus. ==== */
const CAMP_TIERS=[
  {id:'gratuit',name:'Camp local (Gratuit)',cost:0,risk:0.05,buff:null,oppDebuff:null},
  {id:'premium',name:'Camp Premium',cost:15,risk:0.0,buff:{morale:5,form:5},oppDebuff:null},
  {id:'sparring',name:'Sparring Sur-Mesure',cost:35,risk:0.0,buff:{form:5},oppDebuff:{adaptability:-15,fightIQ:-10}}
];
/* ==== [ANCRE: CAMPTIER_CODE_MORT] — audit : aucun appel à executeCampTier()
   nulle part dans le repo (engine, state, fichiers ui, index.html, onclick
   inline grepés), alors que finishTrainingFlow() (ui-02-fight-prep-events.js) gère
   déjà tout le flux d'entraînement réel. Fonction exposée publiquement mais
   inutilisée — contient un TypeError latent (G.fight.oppMalus si G.fight
   n'existe pas encore) qui ne se déclenche jamais faute d'appelant. Laissée
   en place telle quelle : ni patchée, ni supprimée sans confirmation. ==== */
function executeCampTier(f,tierId,trainingOpt){
  const tier=CAMP_TIERS.find(t=>t.id===tierId);
  if(!tier) return {success:false,msg:"Tier invalide."};
  if((f.earnings||0)<tier.cost) return {success:false,msg:"Fonds insuffisants pour ce camp."};
  f.earnings-=tier.cost;
  if(tier.risk>0 && rnd()<tier.risk){
    const inj=rollInjury(); f.injury={name:inj.name,left:inj.fights};
    f.form=clamp(f.form-15,0,100); f.morale=clamp(f.morale-10,0,100);
    return {success:true,injured:true,msg:"Blessure pendant le camp !"};
  }
  const appliedDeltas=applyDeltas(f,trainingOpt.d);
  if(tier.buff){ if(tier.buff.morale) f.morale=clamp(f.morale+tier.buff.morale,0,100); if(tier.buff.form) f.form=clamp(f.form+tier.buff.form,0,100); }
  if(tier.oppDebuff){ if(!G.fight.oppMalus) G.fight.oppMalus={}; for(const key in tier.oppDebuff){ G.fight.oppMalus[key]=tier.oppDebuff[key]; } }
  return {success:true,injured:false,deltas:appliedDeltas};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT8_RIVALITE_HYPE] — rivalités & prime hype ==== */
/* ==== [ANCRE: LOT8_RIVALITE_HEAT] — chantier 3 (génération procédurale
   avancée) : rivalryHeat en RENFORT de f._rivalries (compteur d'animosité)
   et f._allMeetings (compteur total de confrontations), tous deux déjà posés
   par ui-05 (ANCRE: RIVALITE) — aucun nouveau champ persisté, juste une
   lecture combinée des deux compteurs existants, donc aucune migration de
   sauvegarde nécessaire. Paliers demandés par le plan : adversaire normal ->
   rival potentiel -> rivalité -> rivalité majeure -> rivalité historique. */
const RIVALRY_TIERS=[
  {min:0,key:'normal',label:'Adversaire normal'},
  {min:20,key:'potential',label:'Rival potentiel'},
  {min:40,key:'rivalry',label:'Rivalité'},
  {min:65,key:'major',label:'Rivalité majeure'},
  {min:85,key:'historic',label:'Rivalité historique'}
];
/** Chaleur de rivalité 0-100 entre f et l'adversaire oppId, dérivée des
 * compteurs déjà tenus par ui-05 (ANCRE: RIVALITE) : chaque confrontation
 * pèse un peu, chaque épisode d'animosité (défaite ou décision serrée) pèse
 * plus lourd.
 * @param {Fighter} f @param {string|number} oppId @returns {number} */
function rivalryHeat(f,oppId){
  if(!f||oppId==null) return 0;
  const meetings=(f._allMeetings&&f._allMeetings[oppId])||0;
  const animosity=(f._rivalries&&f._rivalries[oppId])||0;
  return clamp(Math.round(meetings*8+animosity*15),0,100);
}
/** Palier de rivalité correspondant à une chaleur donnée.
 * @param {number} heat @returns {{min:number,key:string,label:string}} */
function rivalryTier(heat){
  let tier=RIVALRY_TIERS[0];
  for(const t of RIVALRY_TIERS){ if(heat>=t.min) tier=t; }
  return tier;
}
/* ==== [FIN ANCRE] ==== */
function getRivalryPurseMultiplier(f,opp){
  if(f.rivalId===opp.id){ return +(1.5+rnd()*0.5).toFixed(2); }
  /* ==== [ANCRE: LOT8_RIVALITE_HEAT_BOURSE] — chantier 3, conséquence concrète
     de la chaleur de rivalité : un adversaire pas encore déclaré rival
     (f.rivalId, cas ci-dessus, INCHANGÉ — garde exactement son ancien calcul
     1.5-2.0x) mais déjà "chaud" (heat>=20, paliers RIVALRY_TIERS) génère un
     intérêt médiatique croissant et donc une bourse légèrement supérieure :
     +0% à heat=20 (rival potentiel), jusqu'à +25% à heat=100 (compression
     volontaire — un vrai rival déclaré doit toujours rapporter davantage que
     ce cas intermédiaire). Strictement additif : avant ce chantier, ce
     second cas renvoyait toujours 1.0 sans exception. */
  const heat=rivalryHeat(f,opp.id);
  if(heat>=20) return +(1+heat/400).toFixed(2);
  return 1.0;
}
function triggerRivalPressConference(f,opp){
  if(f.rivalId!==opp.id||f._rivalryPressDone) return null;
  f._rivalryPressDone=true;
  const pastEncounters=(f.history||[]).filter(h=>h.oppId===opp.id);
  const lastEncounter=pastEncounters[pastEncounters.length-1];
  let text=`La conférence de presse contre ${opp.name} a failli tourner à la bagarre générale. L\u2019animosité est à son comble.`;
  let moraleGain=rnd()<0.5?15:-15;
  if(lastEncounter){
    const method=lastEncounter.method||'';
    if(isDecisionLike(method)){
      text=`Les journalistes ressortent la décision controversée de votre dernier affrontement contre ${opp.name}. Il promet de ne pas laisser les juges s\u2019en mêler cette fois.`;
    } else if(lastEncounter.res==='loss' && method.startsWith('KO')){
      text=`${opp.name} mime votre dernier KO en pleine conférence. Humiliation publique.`;
      moraleGain=-20;
    } else if(lastEncounter.res==='win' && method.startsWith('Soum')){
      text=`${opp.name} refuse de reparler de sa dernière soumission. Vous en rajoutez une couche devant les caméras.`;
      moraleGain=18;
    }
  }
  if(f.personality==='villain'){
    text=`Vous avez insulté le camp d\u2019entraînement et la famille de ${opp.name}. Les caméras adorent, mais vous vous êtes fait un ennemi mortel.`;
    moraleGain=20;
  }
  f.morale=clamp(f.morale+moraleGain,0,100);
  return {title:"Tension maximale en conférence",text,moraleEffect:moraleGain};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT_ARCS_NARRATIFS] — chantier 3 : arcs après plusieurs
   défaites (camp de rédemption) et plusieurs victoires (ascension/comeback),
   demandés en renfort de f.streak (compteur déjà tenu par applyResult(),
   engine.js) — aucun nouveau compteur de série créé. Un seul champ persisté,
   f.narrativeArc, jamais un attribut/potentiel : juste de quoi savoir où on
   en est dans l'arc en cours, pour ne raconter chaque palier qu'une seule
   fois. Défaut tolérant (null) posé dans validateState() (state.js). */
const NARRATIVE_ASCENSION_TIERS=[
  {streak:3,tier:1,label:'Espoir qui monte'},
  {streak:6,tier:2,label:'Contender légitime'},
  {streak:9,tier:3,label:'Prétendant au titre'},
  {streak:12,tier:4,label:'Superstar en devenir'}
];
/** Fait avancer l'arc narratif de f selon sa série en cours (f.streak, déjà à
 * jour au moment de l'appel — applyResult() vient de tourner) et renvoie le
 * "beat" franchi cette fois-ci (ou null si rien de nouveau). Ne modifie
 * jamais un attribut, un potentiel ni l'équilibrage du combat.
 * @param {Fighter} f @returns {?object} */
function checkNarrativeArc(f){
  if(!f) return null;
  const streak=f.streak||0;
  let beat=null;
  if(streak<=-2){
    if(!f.narrativeArc||f.narrativeArc.type!=='redemption'){
      f.narrativeArc={type:'redemption',stage:'camp'};
      beat={kind:'redemption_start',streak};
    }
  } else if(f.narrativeArc && f.narrativeArc.type==='redemption' && f.narrativeArc.stage==='camp' && streak>=1){
    f.narrativeArc.stage='comeback';
    beat={kind:'redemption_comeback',streak};
  } else if(f.narrativeArc && f.narrativeArc.type==='redemption' && f.narrativeArc.stage==='comeback'){
    f.narrativeArc=null; // arc résolu, refermé silencieusement — prêt à en raconter un nouveau plus tard
  } else if(streak>=3){
    const eligible=NARRATIVE_ASCENSION_TIERS.filter(t=>streak>=t.streak);
    const best=eligible[eligible.length-1];
    if(best && (!f.narrativeArc||f.narrativeArc.type!=='ascension'||f.narrativeArc.tier<best.tier)){
      f.narrativeArc={type:'ascension',tier:best.tier};
      beat={kind:'ascension',tier:best.tier,label:best.label,streak};
    }
  } else if(streak<=0 && f.narrativeArc && f.narrativeArc.type==='ascension'){
    f.narrativeArc=null;
  }
  return beat;
}
/* ==== [FIN ANCRE] ==== */


