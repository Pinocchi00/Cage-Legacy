"use strict";
/* =========================================================================
   CAGE LEGACY — MOTEUR v2 (reconstruction)
   30 attributs (Technique/Mental/Physique) internes /100, AFFICHÉS /20.
   Génération profonde (origine + motivation + potentiel caché). Combat qui
   produit de vraies statistiques de round + log lisible. Échelle d'orgs.
   Classement/GOAT corrigés (les défaites pèsent lourd). Pas d'argent.
   Cadre de compétences uniques. Aucune dépendance externe (Node pur).
   ========================================================================= */
/* Dépend de : data-skills.js (SKILLS), data-content.js (ORIGINS, MOTIVATIONS).
   Doit être chargé après ces deux fichiers. */
let SEED=(Date.now()^0x9e3779b9)>>>0;
function setSeed(s){ SEED=(s>>>0)||1; }
function rnd(){ SEED=(SEED*1664525+1013904223)>>>0; return SEED/4294967296; }
const RI=(a,b)=>Math.floor(rnd()*(b-a+1))+a;
const R=(a,b)=>a+rnd()*(b-a);
const pick=a=>a[Math.floor(rnd()*a.length)];
const clamp=(v,lo=1,hi=100)=>v<lo?lo:v>hi?hi:v;
function gauss(m,sd,lo,hi){ let u=0,v=0; while(!u)u=rnd(); while(!v)v=rnd(); let g=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); let x=Math.round(m+g*sd); if(lo!=null)x=Math.max(lo,x); if(hi!=null)x=Math.min(hi,x); return x; }
const sigmoid=x=>1/(1+Math.exp(-x));
const d20=v=>Math.max(1,Math.min(20,Math.round(v/5)));   // /100 -> /20 affiché
/* ==== [ANCRE: IS_DECISION_LIKE] — un seul point de vérité pour "ce combat s'est
   terminé aux cartes des juges" (Décision, Décision partagée, OU Égalité).
   Avant : 13 vérifications startsWith('Déc') éparpillées dans le code, toutes
   cassées par l'ajout du Draw ('Égalité' ne commence pas par 'Déc'). ==== */
function isDecisionLike(m){ return !!m && (m.startsWith('Déc')||m==='Égalité'); }
/* ==== [FIN ANCRE] ==== */

/* --------------------------- 30 ATTRIBUTS --------------------------------- */
const ATTR={
  tech:[['jab','Jab'],['cross','Direct'],['hook','Crochets'],['kick','Coups de pied'],['clinchStr','Lutte debout'],
        ['takedown','Amenées au sol'],['tdd','Défense lutte'],['topControl','Contrôle au sol'],['gnp','Sol offensif'],
        ['submission','Soumissions'],['guardWork','Jeu de garde']],
  ment:[['fightIQ','Intelligence'],['composure','Sang-froid'],['aggression','Agressivité'],['heart','Cœur'],
        ['discipline','Discipline'],['adaptability','Adaptation'],['killer','Instinct de finition'],['focus','Concentration'],['confidence','Confiance']],
  phys:[['power','Puissance'],['handSpeed','Vitesse des mains'],['footSpeed','Jeu de jambes'],['cardio','Cardio'],
        ['strength','Force'],['chin','Menton'],['recovery','Récupération'],['explosiveness','Explosivité'],['flexibility','Souplesse'],['durability','Résistance']],
};
const ALL_ATTR=[].concat(ATTR.tech,ATTR.ment,ATTR.phys);
const ATTR_KEYS=ALL_ATTR.map(a=>a[0]);
const CHIN='chin';                                  // ne monte jamais
const TRAINABLE=ATTR_KEYS.filter(k=>k!==CHIN);
const attrLabel=k=>(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1];

/* ------------------------- DIVISIONS & STYLES ----------------------------- */
const DIVISIONS={
 H:[{id:'H-fly',name:'Poids mouche',h:168,r:170,kg:56.7},{id:'H-bantam',name:'Poids coq',h:171,r:173,kg:61.2},
    {id:'H-feather',name:'Poids plume',h:173,r:175,kg:65.8},{id:'H-light',name:'Poids léger',h:175,r:178,kg:70.3},
    {id:'H-welter',name:'Poids mi-moyen',h:180,r:184,kg:77.1},{id:'H-middle',name:'Poids moyen',h:184,r:189,kg:83.9},
    {id:'H-lheavy',name:'Poids mi-lourd',h:188,r:193,kg:93.0},{id:'H-heavy',name:'Poids lourd',h:191,r:196,kg:120.2}],
 F:[{id:'F-straw',name:'Poids paille',h:163,r:164,kg:52.2},{id:'F-fly',name:'Poids mouche',h:165,r:166,kg:56.7},
    {id:'F-bantam',name:'Poids coq',h:168,r:169,kg:61.2},{id:'F-feather',name:'Poids plume',h:170,r:172,kg:65.8}],
};
DIVISIONS.H.forEach(d=>d.gender='H'); DIVISIONS.F.forEach(d=>d.gender='F');
const allDivisions=()=>DIVISIONS.H.concat(DIVISIONS.F);
const divById=id=>allDivisions().find(d=>d.id===id);

/* biais de style : quels attributs sont naturellement plus hauts au départ */
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

function generateNPCNews(){
  if(!G.divisionNews) G.divisionNews=[];
  const top15=G.roster.filter(o=>!o.champion).slice(0,15);
  if(top15.length<2) return;
  if(rnd()<0.12){
    const p1=pick(top15); let p2=pick(top15); while(p1.id===p2.id) p2=pick(top15);
    const events=[
      `Altercation en coulisses entre ${p1.name} et ${p2.name}. La tension monte.`,
      `${p1.name} a subi une grave blessure à l\u2019entraînement.`,
      `${p2.name} évoque une montée de catégorie imminente.`,
      `${p1.name} provoque publiquement ${p2.name} sur les réseaux sociaux.`
    ];
    G.divisionNews.unshift({year:(G.season&&G.season.year)||1,text:pick(events)});
    if(G.divisionNews.length>20) G.divisionNews.length=20;
  }
}

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
      const keys=(lastFight.method.startsWith('Soum'))?['tdd','fightIQ']:(lastFight.method.startsWith('KO')?['footSpeed','chin']:[]);
      keys.forEach(k=>{ if(npc.attrs[k]!==undefined){ saved[k]=npc.attrs[k]; npc.attrs[k]=clamp(npc.attrs[k]+(k==='fightIQ'?5:15),1,100); } });
    }
  }
  return saved;
}

const SPONSOR_OBJECTIVES=[
  {id:'td_3',text:"+15 000$ si 3 takedowns réussis",reward:15,check:(st)=>st.A.td>=3},
  {id:'sig_50',text:"+20 000$ si plus de 50 frappes significatives",reward:20,check:(st)=>st.A.sig>=50},
  {id:'ko_r1',text:"+30 000$ si victoire par KO au Round 1",reward:30,check:(st,res)=>res.method.startsWith('KO')&&res.round===1&&res.winner==='A'},
  {id:'no_td',text:"+10 000$ si 0 takedown subi",reward:10,check:(st)=>st.B.td===0}
];
function generateSponsorObjective(f){ if(f.org>0 && rnd()<0.25){ G.activeSponsor=pick(SPONSOR_OBJECTIVES); } else { G.activeSponsor=null; } }
function evaluateSponsor(res){
  if(G.activeSponsor && G.activeSponsor.check(res.stats,res)){
    G.f.earnings=(G.f.earnings||0)+G.activeSponsor.reward;
    G.lastMsg=`Objectif sponsor validé : +${G.activeSponsor.reward}k$.`;
  }
  G.activeSponsor=null;
}

function attemptChampChamp(targetDivId){
  if(!G.f.champion) return {success:false,msg:"Vous devez déjà posséder une ceinture."};
  G.f.champChampTarget=targetDivId;
  G.f.champChampDefenses={[G.f.div]:G.f.defenses,[targetDivId]:0};
  return {success:true,msg:`Objectif Champ-Champ : vous visez la catégorie ${targetDivId}.`};
}
function resolveChampChampDefense(foughtDivId,win){
  if(!G.f.champChampTarget) return null;
  const neglectedDiv=foughtDivId===G.f.div?G.f.champChampTarget:G.f.div;
  if(win){
    if(!G.f.champChampDefenses) G.f.champChampDefenses={};
    G.f.champChampDefenses[foughtDivId]=(G.f.champChampDefenses[foughtDivId]||0)+1;
    G.f.champChampInactivity=0;
    return null;
  }
  G.f.champChampInactivity=(G.f.champChampInactivity||0)+1;
  if(G.f.champChampInactivity>=3){ G.f.champChampTarget=null; G.f.champChampInactivity=0;
    return `Destitution ! Vous avez perdu votre statut dans la division ${neglectedDiv} pour inactivité.`; }
  return null;
}

function setPersonality(alignment){
  G.f.personality=alignment;
  if(alignment==='villain'){ G.f.hypeBonus=1.3; G.f.morale=clamp(G.f.morale-10,0,100); }
  else if(alignment==='humble'){ G.f.hypeBonus=1.0; G.f.morale=clamp(G.f.morale+15,0,100); G.f.attrs.focus=clamp((G.f.attrs.focus||50)+10,1,100); }
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT2_MODES] — modes de jeu alternatifs ==== */
const SCENARIOS=[
  {id:'scen_sauveur',name:"Le Sauveur de la Ligue",
    desc:"Vétéran de 35 ans sur une série de 3 défaites doit remporter le titre avant sa retraite forcée.",
    init:(f)=>{ f.age=35; f.streak=-3; f.org=3; f.W=15; f.L=8; f.stage='pro'; },
    checkWin:(f)=>!!f.champion, checkLoss:(f)=>f.retired||f.streak<=-5},
  {id:'scen_undersized',name:"L\u2019Undersized Heavyweight",
    desc:"Poids Moyen tentant la catégorie Poids Lourds.",
    init:(f)=>{ f.div='H-heavy'; f.phys.height=184; f.phys.reach=189; f.org=2; },
    checkWin:(f)=>f.org>=5 && !!f.champion, checkLoss:(f)=>f.retired},
  {id:'scen_invasion',name:"L\u2019Invasion de l\u2019Est",
    desc:"Sambo/Lutte, champion mondial sans concéder un seul takedown.",
    init:(f)=>{ f.style='sambo'; f.org=4; f.W=10; f.L=0; f.tdConceded=0; },
    checkWin:(f)=>f.org>=5 && !!f.champion && f.tdConceded===0, checkLoss:(f)=>f.tdConceded>0||f.retired}
];
function checkScenarioState(res){
  if(!G.activeScenario) return;
  const scen=SCENARIOS.find(s=>s.id===G.activeScenario);
  if(!scen) return;
  if(scen.id==='scen_invasion' && res && res.stats && res.stats.B.td>0){ G.f.tdConceded=(G.f.tdConceded||0)+res.stats.B.td; }
  if(scen.checkWin(G.f)){ G.lastMsg=`Scénario accompli : ${scen.name} !`; G.activeScenario=null; }
  else if(scen.checkLoss(G.f)){ G.lastMsg=`Échec du scénario : ${scen.name}. Retraite forcée.`; G.f.retired=true; G.activeScenario=null; }
}
function checkIronManDeath(res,injury){
  if(!G.ironMan) return;
  const isLoss=res && res.winner!=='A' && res.winner!=='D';
  const isGraveInjury=injury && injury.fights>=3;
  if(isLoss||isGraveInjury){ G.f.retired=true; G.lastMsg="MODE IRON MAN : défaite ou blessure grave. Fin définitive de la carrière."; }
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT3_TAGS_PHYSIQUES] — exploitation des tags physiques rares ==== */
function getExclusiveTactics(f){
  const tactics=[]; const tags=(f.phys&&f.phys.tags)||[];
  if(tags.includes('allonge hors-norme')||tags.includes('allonge démesurée')){
    tactics.push({id:'ex_reach',lbl:'Sniper Hors-Portée',desc:'Exploite une envergure anormale pour détruire à distance en restant intouchable.',m:{str:1.3,def:1.4,ko:0.8,tdd:1.2}});
  }
  if(tags.includes('densité rare (type Ngannou)')){
    tactics.push({id:'ex_dense',lbl:'Destruction Massive',desc:'Avance avec une masse inarrêtable. Sacrifice total de la mobilité pour la létalité.',m:{ko:1.6,tdd:1.3,def:0.6,str:0.8}});
  }
  return tactics;
}
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
  f.style=newStyleId; f._drought=0;
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
function getRivalryPurseMultiplier(f,opp){ if(f.rivalId===opp.id){ return +(1.5+rnd()*0.5).toFixed(2); } return 1.0; }
function triggerRivalPressConference(f,opp){
  if(f.rivalId!==opp.id||f._rivalryPressDone) return null;
  f._rivalryPressDone=true;
  const moraleGain=rnd()<0.5?15:-15;
  f.morale=clamp(f.morale+moraleGain,0,100);
  return {title:"Tension maximale en conférence",text:`La conférence de presse contre ${opp.name} a failli tourner à la bagarre générale. L\u2019animosité est à son comble.`,moraleEffect:moraleGain};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT9_CODEX] — codex interactif des compétences (logique pure —
   la construction de l'écran UI va dans ui.js) ==== */
const CODEX_KEY='cage-legacy-codex';
function loadCodex(){ try{ return JSON.parse(localStorage.getItem(CODEX_KEY))||[]; }catch(e){ return []; } }
function saveToCodex(skillId){
  const unlocked=loadCodex();
  if(!unlocked.includes(skillId)){ unlocked.push(skillId); try{ localStorage.setItem(CODEX_KEY,JSON.stringify(unlocked)); }catch(e){} }
}
function syncPlayerSkillsToCodex(f){ if(!f||!f.skills) return; f.skills.forEach(skillId=>saveToCodex(skillId)); }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT10_SCOUTING] — outils de scouting/analyse (logique — le
   rendu HTML va dans ui.js) ==== */
function getScoutingReport(f,opp){
  if(f.stage!=='pro') return null;
  const report={chinWarning:false,potentialGapText:null};
  if(opp.koLoss>=1||opp.attrs.chin<65||opp.attrs.durability<65){ report.chinWarning=true; }
  const gap=opp.potential-opp.overall;
  if(gap>=15) report.potentialGapText="Diamant brut (progression fulgurante attendue)";
  else if(gap>=6) report.potentialGapText="En pleine évolution (marge de progression solide)";
  else if(gap<=0) report.potentialGapText="Plafond atteint (potentiel maximisé)";
  else report.potentialGapText="Progression marginale restante";
  return report;
}
/* ==== [FIN ANCRE] ==== */

const STYLES={
  boxer:{label:'Boxe',b:{jab:8,cross:9,hook:8,handSpeed:8,footSpeed:5,power:4,tdd:3},grap:0.15},
  kickboxer:{label:'Kickboxing',b:{kick:11,cross:8,clinchStr:7,footSpeed:6,power:5,tdd:4},grap:0.2},
  muayThai:{label:'Muay-thaï',b:{kick:11,clinchStr:11,hook:6,strength:5,durability:5,power:4,tdd:4},grap:0.3},
  karate:{label:'Karaté',b:{footSpeed:11,kick:8,jab:6,handSpeed:6,fightIQ:5,tdd:3},grap:0.15},
  wrestler:{label:'Lutte',b:{takedown:9,tdd:9,topControl:8,strength:7,cardio:5},grap:0.77},
  bjj:{label:'Jiu-jitsu',b:{submission:12,guardWork:10,gnp:7,flexibility:6,composure:5,tdd:4,takedown:4},grap:0.72},
  sambo:{label:'Sambo',b:{takedown:8,submission:9,topControl:7,strength:6,heart:5,tdd:4},grap:0.66},
  mma:{label:'MMA complet',b:{fightIQ:7,adaptability:7,cardio:7,tdd:8,cross:7,hook:5,takedown:4,kick:5},grap:0.5},
};
const STYLE_KEYS=Object.keys(STYLES);
const styleLabel=s=>(STYLES[s]||{label:s}).label;

/* ------------------------------ NOMS -------------------------------------- */
const COUNTRIES={
 FR:{name:'France',flag:'🇫🇷',last:['Moreau','Lefevre','Dubois','Girard','Faure','Roussel','Blanc','Mercier']},
 BR:{name:'Brésil',flag:'🇧🇷',last:['Silva','Souza','Oliveira','Costa','Almeida','Pereira','Lima','Rocha']},
 US:{name:'États-Unis',flag:'🇺🇸',last:['Johnson','Williams','Brown','Miller','Davis','Wilson','Carter','Reed']},
 DAG:{name:'Daghestan',flag:'🏔️',last:['Nurmagomedov','Aliev','Magomedov','Gadzhiev','Ramazanov','Shamilov','Umarov']},
 JP:{name:'Japon',flag:'🇯🇵',last:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Kobayashi','Nakamura']},
 NG:{name:'Nigéria',flag:'🇳🇬',last:['Adeyemi','Okafor','Balogun','Eze','Okoye','Abubakar','Nwosu']},
 GB:{name:'Royaume-Uni',flag:'🇬🇧',last:['Smith','Taylor','Walker','Wright','Hughes','Ward','Bennett']},
 RU:{name:'Russie',flag:'🇷🇺',last:['Volkov','Petrov','Sokolov','Ivanov','Popov','Kozlov','Orlov']},
 MX:{name:'Mexique',flag:'🇲🇽',last:['Hernández','García','Martínez','López','Ramírez','Torres','Flores']},
 IE:{name:'Irlande',flag:'🇮🇪',last:['Murphy','Kelly','OBrien','Byrne','Ryan','Walsh','McCarthy']},
 TH:{name:'Thaïlande',flag:'🇹🇭',last:['Sittichai','Petchyindee','Kiatmoo','Sor','Rungravee']},
 KR:{name:'Corée',flag:'🇰🇷',last:['Kim','Lee','Park','Choi','Jung','Kang','Yoon']},
 CM:{name:'Cameroun',flag:'🇨🇲',last:['Ngannou','Mbappe','Etoo','Nkemdirim','Fotso','Biya']},
 GE:{name:'Géorgie',flag:'🇬🇪',last:['Dvalishvili','Beridze','Kvaratskhelia','Chikadze','Gogitidze']},
};
const COUNTRY_KEYS=Object.keys(COUNTRIES);
/* ==== [ANCRE: COUNTRY_MMA_PREFIX] — 1re lettre du nom FR, 2 lettres si collision
   (Royaume-Uni/Russie et Corée/Cameroun partagent leur 1re lettre). ==== */
const COUNTRY_MMA_PREFIX={FR:'F',BR:'B',US:'E',DAG:'D',JP:'J',NG:'N',GB:'RO',RU:'RU',MX:'M',IE:'I',TH:'T',KR:'CO',CM:'CA',GE:'G'};
/* ==== [FIN ANCRE] ==== */
const FIRST_M=['Alex','Marcus','Diego','Ivan','Kenji','Samuel','Leon','Rashid','Tariq','Bruno','Kai','Omar','Noah','Yuki','Malik','Hugo','Sean','Nikolai','Andre','Felix','Jamal','Ravi','Enzo','Kofi','Dante'];
const FIRST_F=['Amara','Lena','Sofia','Nadia','Yuki','Maya','Zara','Ana','Ines','Kira','Fatima','Nina','Rosa','Aiko','Elena','Sara','Leïla','Tara','Bianca','Hana'];
function makeName(gender,ck,firstOverride){ const c=COUNTRIES[ck]; const first=firstOverride||pick(gender==='F'?FIRST_F:FIRST_M); const last=pick(c.last); return {first,last,name:first+' '+last,flag:c.flag,countryKey:ck}; }

/* ------------------------- CRÉATION D'UN COMBATTANT ----------------------- */
let _id=1;
function makePhysical(div){ const D=div||pick(allDivisions());
  let height=gauss(D.h,4,D.h-9,D.h+11);
  const tags=[];
  // Anomalie statistique rare : une taille réellement hors-norme pour la division
  if(rnd()<0.02){ height=D.h+RI(16,24); tags.push('gabarit hors-norme pour la division'); }
  // Allonge découplée de la taille (indice de singe), plutôt que dérivée de D.h/D.r directement
  let apeIndex=gauss(0,5,-8,12);
  if(rnd()<0.02){ apeIndex=RI(15,22); tags.push('allonge démesurée'); } // anomalie rare, indépendante de la taille
  let reach=Math.round(height+apeIndex); if(reach<height-1)reach=height-1;
  if(apeIndex>=7 && !tags.includes('allonge démesurée'))tags.push('allonge hors-norme');
  if(rnd()<0.02)tags.push('densité rare (type Ngannou)'); if(rnd()<0.02)tags.push('explosivité rare (type Cormier)');
  return {height,reach,tags};
}
/* ------------------ CUTTING — trait VARIABLE, retiré à chaque combat (pas un
   poids de forme figé à la création) : reflète les fluctuations naturelles
   entre deux camps, moyenne ~9%, profils extrêmes jusqu'à ~24%. ---------------- */
function weightCutInfo(f){ const D=divById(f.div); const limit=D?D.kg:70;
  const cutPct=gauss(9,5,0,24);
  const walk=+(limit/(1-cutPct/100)).toFixed(1);
  const cutKg=+(walk-limit).toFixed(1);
  return {limit,walk,cutKg,cutPct};
}
function baseAttrs(style,level,predis){ const o={}; const bias=(STYLES[style]||{b:{}}).b;
  for(const k of ATTR_KEYS){ let v=gauss(level, 9, 6, 96); if(bias[k])v=clamp(v+bias[k]); o[k]=v; }
  if(predis){ if(predis.includes('densité'))o.power=clamp(o.power+RI(8,16)); if(predis.includes('explosivité')){o.explosiveness=clamp(o.explosiveness+RI(8,14));o.takedown=clamp(o.takedown+RI(5,10));} }
  return o;
}
function makeFighter(opt={}){ const gender=opt.gender||pick(['H','F']);
  const div=divById(opt.div)|| (gender==='H'?pick(DIVISIONS.H):pick(DIVISIONS.F));
  const style=opt.style||pick(STYLE_KEYS); const ck=opt.countryKey||pick(COUNTRY_KEYS);
  const nm=makeName(gender,ck,opt.first);
  const phys=makePhysical(div);
  const level=opt.level!=null?opt.level:gauss(46,10,20,80);
  const attrs=baseAttrs(style,level,phys.tags.join(' '));
  const potential=opt.potential!=null?opt.potential:gauss(64,12,34,97);   // caché
  const dynamic=0;                                                         // moral/forme caché ±
  const mot=pick(MOTIVATIONS); const origin=pick(ORIGINS);
  const f={ id:_id++, gender, div:div.id, divName:div.name, style, styleLabel:styleLabel(style),
    first:nm.first,last:nm.last,name:nm.name,flag:nm.flag,countryKey:ck,
    phys, attrs, potential, dynamic, morale:60, form:55,
    stage:'amateur', org:0, orgWins:0, age:opt.age!=null?opt.age:RI(18,22),
    W:0,L:0,D:0,ko:0,sub:0,dec:0,koLoss:0,streak:0, champion:null, titles:0, defenses:0,
    skills:[], history:[], origin, motivation:mot.short, drive:mot.drive, amaRec:null, amaTitle:false, nick:null, epithets:[] };
  f.overall=overall(f);
  f.orgElo=eloBaseline(0,f.overall); f.careerElo=eloBaseline(0,f.overall); f.inactivityCycles=0;
  // ==== [ANCRE: GENETIQUE] — jet unique à la création, jamais via rollSkill ====
  const GENETIC_CHANCE=0.10;
  if(rnd()<GENETIC_CHANCE){
    const genPool=SKILLS.filter(s=>s.fam==='gen');
    if(genPool.length>0) grantSkill(f, genPool[Math.floor(rnd()*genPool.length)]);
  }
  // ==== [FIN ANCRE] ====
  return f;
}

/* ------------------- canaux de combat dérivés des 30 attributs ------------ */
function eff(f){ const a=f.attrs; const dyn=(f.morale-50)*0.10+(f.form-50)*0.10; // moral/forme -> ±
  const ch={
    striking: a.jab*0.24+a.cross*0.24+a.hook*0.2+a.kick*0.18+a.clinchStr*0.14 + a.fightIQ*0.06,
    power:    a.power + a.strength*0.12,
    handSpeed:a.handSpeed*0.85 + a.footSpeed*0.15,
    footwork: a.footSpeed*0.8 + a.flexibility*0.2,
    clinch:   a.clinchStr*0.8 + a.strength*0.2,
    takedown: a.takedown*0.78 + a.strength*0.12 + a.explosiveness*0.08,
    tdd:      a.tdd*0.88 + a.strength*0.08 + a.flexibility*0.06 + 2,
    topControl:a.topControl*0.82 + a.strength*0.18,
    ground:   a.gnp*0.82 + a.power*0.18,
    submission:a.submission*0.9 + a.flexibility*0.1,
    guard:    a.guardWork*0.85 + a.flexibility*0.15,
    cardio:   a.cardio*0.82 + a.recovery*0.18,
    chin:     a.chin*0.72 + a.durability*0.28,
    fightIQ:  a.fightIQ*0.7 + a.composure*0.18 + a.adaptability*0.12,
    killer:   a.killer, heart:a.heart, aggression:a.aggression,
  };
  for(const k in ch){ if(k!=='chin'&&k!=='killer'&&k!=='heart'&&k!=='aggression') ch[k]=clamp(ch[k]+dyn,1,100); }
  // bonus de compétences débloquées
  for(const sid of f.skills){ const S=SKILLS.find(s=>s.id===sid); if(S&&S.fx){} }
  return ch;
}
function overall(f){ const a=f.attrs;
  // récompense la spécialisation : le coeur des meilleurs attributs pèse plus
  const vals=ATTR_KEYS.map(k=>a[k]).sort((x,y)=>y-x);
  const top=vals.slice(0,10), topAvg=top.reduce((s,v)=>s+v,0)/top.length;
  const allAvg=vals.reduce((s,v)=>s+v,0)/vals.length;
  let ov=topAvg*0.68+allAvg*0.32 + (f.dynamic||0)*0.3;
  return clamp(Math.round(ov),1,100);
}
function groupAvg(f){ const a=f.attrs; const g=k=>Math.round(k.reduce((s,x)=>s+a[x[0]],0)/k.length);
  return {tech:g(ATTR.tech),ment:g(ATTR.ment),phys:g(ATTR.phys)}; }
/* ------------------ MENACE DE FINITION (remplace "Danger") ---------------- */
function getMenace(f){ const a=f.attrs;
  const menaceScore=(a.power*0.4)+(a.submission*0.4)+(a.killer*0.2);
  return clamp(Math.round(menaceScore),1,100);
}

/* ------------------------------- COMBAT ----------------------------------- */
function reachEdge(A,B){ return clamp((A.phys.reach-B.phys.reach)*0.14,-6,6); }
/* ==== [ANCRE: EQUILIBRAGE_MC] - recalibrage Monte-Carlo (audit d'equilibrage).
   Mesure avant/apres sur 10000+ combats simules : victoire ecrasante a 97%
   des un ecart de niveau modere, soumissions quasi jamais declenchees (4%).
   4 leviers touches : seuil/probabilite de mise au sol, sensibilite du KO
   debout, bruit du score par round, chance de soumission au sol - plus une
   modulation par categorie de poids basee sur la vraie taille des divisions
   (pas une liste de noms). Le filtre par style (kickboxer vs kickboxer ne va
   quasiment jamais au sol, wrestler vs wrestler si) etait DEJA correct et n'a
   pas eu besoin d'etre touche - verifie explicitement avant d'y toucher.
   Complété ici par un journal granulaire (plusieurs lignes de texte par
   round, momentum, dégâts par zone tête/corps/jambes) lu par l'arène —
   AUCUNE formule de résolution du combat n'est modifiée, uniquement des
   sous-événements narratifs générés en plus, pour l'affichage. ==== */
function weightFactor(f){ const divs=DIVISIONS[f.gender]||DIVISIONS.H; const d=divById(f.div);
  if(!d) return 0.5;
  const heights=divs.map(x=>x.h); const min=Math.min(...heights), max=Math.max(...heights);
  return max>min ? (d.h-min)/(max-min) : 0.5; }
// ==== [ANCRE: STYLE_PROFILE] — différenciation mécanique des 8 styles (volume de
// frappes, facteur KO, menace de soumission, dégâts clinch/GNP). tdVol
// délibérément absent : STYLES[].grap couvre déjà l'initiative de lutte
// (boxeur 0.15 vs lutteur 0.77, écart ×5) — l'ajouter aurait fait ×48, une
// surcorrection qui aurait quasiment supprimé la lutte chez les boxeurs. ====
const STYLE_PROFILE={
  boxer:{sigVol:1.30,koMod:1.15,subMod:0.10,clinchDmg:0.8,gnpDmg:0.8},
  kickboxer:{sigVol:1.20,koMod:1.20,subMod:0.20,clinchDmg:0.9,gnpDmg:0.8},
  muayThai:{sigVol:1.10,koMod:1.25,subMod:0.30,clinchDmg:1.35,gnpDmg:1.0},
  karate:{sigVol:0.80,koMod:1.35,subMod:0.20,clinchDmg:0.7,gnpDmg:0.7},
  wrestler:{sigVol:0.75,koMod:0.90,subMod:0.40,clinchDmg:1.1,gnpDmg:1.30},
  bjj:{sigVol:0.65,koMod:0.70,subMod:1.60,clinchDmg:0.9,gnpDmg:0.9,guardPull:0.35},
  sambo:{sigVol:0.85,koMod:1.20,subMod:1.25,clinchDmg:1.2,gnpDmg:1.15},
  mma:{sigVol:1.00,koMod:1.00,subMod:1.00,clinchDmg:1.0,gnpDmg:1.0}
};
/* ==== [FIN ANCRE] ==== */
function simulateFight(A,B,rounds=3,plan=null,planB=null){ const a=eff(A),b=eff(B);
  const profA=A._styleProfileOverride||STYLE_PROFILE[A.style]||STYLE_PROFILE.mma, profB=B._styleProfileOverride||STYLE_PROFILE[B.style]||STYLE_PROFILE.mma;
  const wf=weightFactor(A);
  const koWeightMult=1+(wf-0.5)*0.5;
  const noiseWeightMult=1+(wf-0.5)*0.4;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: PLAN_TACTIQUE] — modificateurs du vestiaire (audit §11), appliqués
  // une seule fois sur les canaux de A avant la boucle des rounds. Clés vérifiées
  // contre les canaux réels de eff() : striking, power, footwork/fightIQ (def),
  // takedown (td), tdd, submission (sub), ground (gnp), topControl (ctrl). ====
  let myGi=STYLES[A.style].grap;
  if(plan){
    if(plan.gi) myGi*=plan.gi;
    if(plan.td) a.takedown*=plan.td;
    if(plan.tdd) a.tdd*=plan.tdd;
    if(plan.str) a.striking*=plan.str;
    if(plan.ko) a.power*=plan.ko;
    if(plan.sub) a.submission*=plan.sub;
    if(plan.gnp) a.ground*=plan.gnp;
    if(plan.ctrl) a.topControl*=plan.ctrl;
    if(plan.def){ a.footwork*=plan.def; a.fightIQ*=plan.def; }
    for(const k in a){ if(typeof a[k]==='number') a[k]=clamp(a[k],1,150); }
  }
  // ==== [ANCRE: PLAN_TACTIQUE_B] — même mécanisme que ci-dessus, côté B cette
  // fois. Sert à l'IA adaptative en rematch (getAdaptiveNPCTactics) qui, faute
  // de ce paramètre, ne pouvait modifier que des canaux jamais lus (eff() étant
  // recalculé en interne à chaque appel de simulateFight, un ajustement fait
  // depuis l'extérieur n'avait aucun effet réel). ====
  if(planB){
    if(planB.td) b.takedown*=planB.td;
    if(planB.tdd) b.tdd*=planB.tdd;
    if(planB.str) b.striking*=planB.str;
    if(planB.ko) b.power*=planB.ko;
    if(planB.sub) b.submission*=planB.sub;
    if(planB.gnp) b.ground*=planB.gnp;
    if(planB.ctrl) b.topControl*=planB.ctrl;
    if(planB.def){ b.footwork*=planB.def; b.fightIQ*=planB.def; }
    for(const k in b){ if(typeof b[k]==='number') b[k]=clamp(b[k],1,150); }
  }
  // ==== [FIN ANCRE] ====
  const giA=myGi, giB=STYLES[B.style].grap; const rEdge=reachEdge(A,B);
  let sa=0,sb=0,dmgA=0,dmgB=0,finish=null; const log=[];
  // ==== [ANCRE: CHIN_TEMPORAIRE] — un round brutal fragilise le menton pour LE
  // RESTE DE CE COMBAT uniquement (variable locale), jamais l'attribut permanent
  // du combattant : encaisser un round dur ne doit pas user le menton à vie,
  // sans que le joueur en soit jamais informé. ====
  let chinVulnA=0, chinVulnB=0;
  // ==== [FIN ANCRE] ====
  const st={ // statistiques de combat (dmgHead/Body/Legs : purement narratif, additif)
    A:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0},
    B:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0} };
  let momentum=50; // jauge narrative (50=neutre), n'influence aucun calcul de combat
  // ==== [ANCRE: JUGES_10PT] — vrai 10-point must, round par round, 3 juges ====
  const roundStats=[]; let j1A=0,j1B=0,j2A=0,j2B=0,j3A=0,j3B=0;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: ANTI_REPETITION] — évite de tirer deux fois de suite la même phrase ====
  let lastTemplates=[]; // les 2 derniers modèles de phrase (nom neutralisé), pas la chaîne finale
  const normalizeTxt=(txt)=>txt.split(A.name).join('§').split(B.name).join('§');
  const getUniqueLog=(pool)=>{ let txt=pick(pool); let tpl=normalizeTxt(txt); let tries=0;
    while(lastTemplates.includes(tpl)&&tries<8){ txt=pick(pool); tpl=normalizeTxt(txt); tries++; }
    lastTemplates.push(tpl); if(lastTemplates.length>2) lastTemplates.shift();
    return txt; };
  // ==== [FIN ANCRE] ====
  const formatTime=(k,tot)=>{ let sec=300-Math.floor((k/tot)*300); let m=Math.floor(sec/60); let s=sec%60; return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };
  const getTags=f=>(f.skills||[]).map(id=>{ const s=SKILLS.find(x=>x.id===id); return s?(s.tags||[]):[]; }).flat();
  const tagsA=getTags(A), tagsB=getTags(B);
  for(let r=1;r<=rounds && !finish;r++){
    // ==== [ANCRE: JUGES_10PT_SNAP] ====
    const _startSa=sa, _startSb=sb, _kdA0=st.A.kd, _kdB0=st.B.kd, _sigA0=st.A.sig, _sigB0=st.B.sig, _tdA0=st.A.td, _tdB0=st.B.td, _ctrlA0=st.A.ctrl||0, _ctrlB0=st.B.ctrl||0;
    // ==== [FIN ANCRE] ====
    // ==== [ANCRE: MICRO_SEQUENCES] — chaque round de 5 minutes est découpé en 6
    // micro-séquences de 50 secondes. La phase (debout/clinch/sol) persiste
    // d'une séquence à l'autre DANS le même round, mais repart toujours de
    // 'debout' à la cloche — permet de vrais retournements de situation dans
    // un même round (domination debout, takedown, puis sol, par exemple). ====
    let currentPhase='debout', topIsA=false;
    const cardioFactorA=(a.cardio<60)?0.09:0.06, cardioFactorB=(b.cardio<60)?0.09:0.06;
    const roundPenalty=(r>=4)?1.3:1.0;
    for(let k=0;k<6 && !finish;k++){
      const outA=st.A.sig+st.A.tdAtt*0.6, outB=st.B.sig+st.B.tdAtt*0.6;
      const fatA=clamp(((dmgA+outA*0.2)-a.cardio)*cardioFactorA*roundPenalty,0,28);
      const fatB=clamp(((dmgB+outB*0.2)-b.cardio)*cardioFactorB*roundPenalty,0,28);

      if(currentPhase==='sol'){
        const top=topIsA?a:b, bot=topIsA?b:a, topF=topIsA?A:B, botF=topIsA?B:A, topFat=topIsA?fatA:fatB;
        const topProf=topIsA?profA:profB, botProf=topIsA?profB:profA;
        const control=clamp((top.topControl-bot.guard)*0.32,0,11)*0.2;
        const gnp=clamp((top.ground*0.5+top.power*0.45)-bot.guard*0.55-topFat,0,45)*topProf.gnpDmg*0.2;
        const subTop=clamp(top.submission-bot.guard*0.85,0,45)*(1+top.killer*0.004)*topProf.subMod*0.2;
        const subBot=clamp(bot.submission-top.topControl*0.7-top.ground*0.4,0,35)*botProf.subMod*0.2;
        const topPts=1.2+control*0.5+gnp*0.46+subTop*0.22; const botPts=subBot*0.9+clamp(bot.guard-top.topControl,0,22)*0.032+0.6;
        if(topIsA){sa+=topPts;sb+=botPts;dmgB+=gnp*0.32;st.A.ctrl+=0.2;st.A.sig+=Math.round(gnp*0.4);} else {sb+=topPts;sa+=botPts;dmgA+=gnp*0.32;st.B.ctrl+=0.2;st.B.sig+=Math.round(gnp*0.4);}
        const heartR=1-(bot.heart*0.0016);
        const koGnp=clamp((top.power-bot.chin)/56,0,.72)*clamp(gnp/9,0,1)*0.62*(1-bot.fightIQ*0.0022)*heartR*topProf.koMod*0.32;
        const subChT=clamp((top.submission-bot.guard)/17,0,.84)*0.68*(1-bot.fightIQ*0.0022)*topProf.subMod*0.4;
        const subChB=clamp((bot.submission-top.submission)/42,0,.7)*0.44*(1-top.fightIQ*0.0022)*botProf.subMod*0.4;
        if(rnd()<subChT){finish={by:topF,loser:botF,method:'Soumission',round:r};(topIsA?st.A:st.B).sub++;}
        else if(rnd()<koGnp){finish={by:topF,loser:botF,method:'KO/TKO',round:r,detail:'coups au sol'};(topIsA?st.B:st.A).kd++;}
        else if(rnd()<subChB){finish={by:botF,loser:topF,method:'Soumission',round:r,detail:'par le bas'};(topIsA?st.B:st.A).sub++;}
        const isMe=topIsA; momentum=clamp(momentum+(isMe?RI(3,8):-RI(3,8)),5,95);
        const atk=isMe?A:B, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
        tgt.dmgBody+=RI(0,2); tgt.dmgHead+=RI(0,1);
        let txtPool=[`${atk.name} consolide son contrôle.`,`${atk.name} maintient une lourde pression.`,`Lutte de position : ${atk.name} prend l\u2019avantage.`,`${atk.name} verrouille les hanches de son adversaire.`];
        if(tgs.includes('GNP')) txtPool.push(`${atk.name} fait pleuvoir un lourd Ground & Pound.`);
        if(tgs.includes('Soumission')) txtPool.push(`${atk.name} cherche l\u2019ouverture pour soumettre.`);
        log.push({r,phase:'sol',top:topIsA?'A':'B',by:isMe?'me':'op',text:`[${formatTime(k,6)}] `+getUniqueLog(txtPool),momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
          last.text=`[00:00] [CRITIQUE] L\u2019arbitre s\u2019interpose ! Victoire par ${finish.method} de ${finish.by.name}.`; }
        else {
          const evadeCh=clamp((bot.footwork+bot.fightIQ-topFat*0.5)/280,0.06,0.28);
          if(rnd()<evadeCh){ if(rnd()<0.5){ topIsA=!topIsA; } else { currentPhase='debout'; } }
        }
      } else if(currentPhase==='clinch'){
        const clinchA=(a.clinch*0.6+a.striking*0.25+a.power*0.15)*profA.clinchDmg-fatA;
        const clinchB=(b.clinch*0.6+b.striking*0.25+b.power*0.15)*profB.clinchDmg-fatB;
        const diff=clinchA-clinchB;
        if(Math.abs(diff)>8){
          const domIsA=diff>0; const dom=domIsA?A:B;
          const hits=RI(0,4); (domIsA?st.A:st.B).sig+=hits; if(domIsA) dmgB+=hits*1.8; else dmgA+=hits*1.8;
          (domIsA?st.B:st.A).dmgBody+=RI(0,2);
          momentum=clamp(momentum+(domIsA?RI(3,7):-RI(3,7)),5,95);
          if(rnd()<0.28){ currentPhase='sol'; topIsA=domIsA; (domIsA?st.A:st.B).td++;
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(k,6)}] ${dom.name} utilise son contrôle en clinch pour amener au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            log.push({r,phase:'clinch',by:domIsA?'me':'op',text:`[${formatTime(k,6)}] ${dom.name} domine contre la cage avec ${hits} coups courts.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else {
          currentPhase='debout';
          log.push({r,phase:'clinch',by:'me',text:`[${formatTime(k,6)}] Séparation, le combat reprend au centre de la cage.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
        }
      } else { // debout
        const attA=giA*(0.55+rnd()*0.45), attB=giB*(0.55+rnd()*0.45);
        let handled=false;
        if(attA>0.14 && rnd()<0.18){ st.A.tdAtt++; handled=true;
          const tdChanceA=sigmoid((a.takedown-b.tdd)/15)*attA;
          if(rnd()<clamp(tdChanceA,0.05,0.85)){ st.A.td++; currentPhase='sol'; topIsA=true;
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(k,6)}] Takedown validé par ${A.name} !`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(k,6)}] Bonne défense de ${B.name} sur la tentative d\u2019amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        } else if(attB>0.14 && rnd()<0.18){ st.B.tdAtt++; handled=true;
          const tdChanceB=sigmoid((b.takedown-a.tdd)/15)*attB;
          if(rnd()<clamp(tdChanceB,0.05,0.85)){ st.B.td++; currentPhase='sol'; topIsA=false;
            log.push({r,phase:'debout',by:'op',text:`[${formatTime(k,6)}] Takedown explosif de ${B.name}, le combat passe au sol.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          } else {
            log.push({r,phase:'debout',by:'me',text:`[${formatTime(k,6)}] ${A.name} repousse une tentative d\u2019amenée.`,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          }
        }
        if(!handled && currentPhase==='debout'){
          const offA=(a.striking*0.72+a.power*0.35+a.handSpeed*0.22+a.footwork*0.14+a.clinch*0.14*profA.clinchDmg+rEdge*0.85-b.footwork*0.2-b.fightIQ*0.14-fatA)*profA.sigVol;
          const offB=(b.striking*0.72+b.power*0.35+b.handSpeed*0.22+b.footwork*0.14+b.clinch*0.14*profB.clinchDmg-rEdge*0.85-a.footwork*0.2-a.fightIQ*0.14-fatB)*profB.sigVol;
          const noiseAmt=Math.round(6*noiseWeightMult);
          const pA=clamp(offA*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20), pB=clamp(offB*0.42*0.22+RI(-noiseAmt,noiseAmt),0,20);
          sa+=pA;sb+=pB;dmgA+=clamp(offB*0.22*0.22,0,6);dmgB+=clamp(offA*0.22*0.22,0,6);
          st.A.sig+=clamp(Math.round(pA*0.5),0,10); st.B.sig+=clamp(Math.round(pB*0.5),0,10);
          const koA=clamp((a.power-(b.chin-chinVulnB))/62,0,.93)*clamp((offA-offB)/62+0.46,0,1)*0.6*koWeightMult*(1-b.fightIQ*0.0022)*(1+a.killer*0.003)*(1-b.heart*0.0016)*profA.koMod*0.22;
          const koB=clamp((b.power-(a.chin-chinVulnA))/62,0,.93)*clamp((offB-offA)/62+0.46,0,1)*0.6*koWeightMult*(1-a.fightIQ*0.0022)*(1+b.killer*0.003)*(1-a.heart*0.0016)*profB.koMod*0.22;
          const isKdA=rnd()<koA*1.5, isKdB=!isKdA&&rnd()<koB*1.5;
          let kdText=null;
          if(isKdA){ st.A.kd++; if(rnd()<0.6){ finish={by:A,loser:B,method:'KO/TKO',round:r}; } else kdText={by:'me',txt:`${A.name} envoie ${B.name} au tapis, mais l\u2019arbitre laisse le combat continuer !`}; }
          else if(isKdB){ st.B.kd++; if(rnd()<0.6){ finish={by:B,loser:A,method:'KO/TKO',round:r}; } else kdText={by:'op',txt:`${B.name} envoie ${A.name} au tapis, mais l\u2019arbitre laisse le combat continuer !`}; }
          const isMe=rnd()<(offA/(offA+offB+1));
          momentum=clamp(momentum+(isMe?RI(4,9):-RI(4,9)),5,95);
          const atk=isMe?A:B, tgs=isMe?tagsA:tagsB, tgt=isMe?st.B:st.A;
          const rDmg=rnd(); if(rDmg<0.4) tgt.dmgHead+=RI(1,3); else if(rDmg<0.7) tgt.dmgBody+=RI(1,3); else tgt.dmgLegs+=RI(1,3);
          let txt=kdText?kdText.txt:getUniqueLog([`${atk.name} touche avec une belle combinaison.`,`${atk.name} trouve l\u2019ouverture en striking.`,`Superbe échange remporté par ${atk.name}.`,`Le bras arrière de ${atk.name} fait mouche.`,`${atk.name} casse la distance et punit.`,`${tgs.includes('Kick')?atk.name+' claque un lourd kick.':atk.name+' place une combinaison nette.'}`]);
          log.push({r,phase:'debout',by:kdText?kdText.by:(isMe?'me':'op'),text:`[${formatTime(k,6)}] `+txt,momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
          if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
            last.text=`[00:00] [CRITIQUE] KO foudroyant de ${finish.by.name} !`; }
          else if(rnd()<0.15){ currentPhase='clinch'; }
        }
      }
    }
    // ==== [FIN ANCRE] ====
    if(dmgA>45&&rnd()<.4)chinVulnA+=8;
    if(dmgB>45&&rnd()<.4)chinVulnB+=8;
    // ==== [ANCRE: JUGES_10PT_SCORE] — 10-9 par défaut, 10-8 si domination nette, 10-7 en cas extrême ====
    const rSigA=st.A.sig-_sigA0, rSigB=st.B.sig-_sigB0;
    const rTdA=st.A.td-_tdA0, rTdB=st.B.td-_tdB0;
    const rCtrlA=(st.A.ctrl||0)-_ctrlA0, rCtrlB=(st.B.ctrl||0)-_ctrlB0;
    const kdDiff=(st.A.kd-_kdA0)-(st.B.kd-_kdB0);
    // 1 amenée = 4 frappes sig, 1 round complet de contrôle (6 ticks à 0.2 = 1.2) = ~14.4 pts
    const rDiff=(rSigA-rSigB)+(rTdA-rTdB)*4+(rCtrlA-rCtrlB)*12;
    let sA=10,sB=10;
    if((rDiff>44&&kdDiff>=0)||kdDiff>=3){ sA=10;sB=7; }
    else if((rDiff>32&&kdDiff>=0)||kdDiff>=2){ sA=10;sB=8; }
    else if((rDiff>3&&kdDiff>=0)||kdDiff===1){ sA=10;sB=9; }
    else if((rDiff<-44&&kdDiff<=0)||kdDiff<=-3){ sA=7;sB=10; }
    else if((rDiff<-32&&kdDiff<=0)||kdDiff<=-2){ sA=8;sB=10; }
    else if((rDiff<-3&&kdDiff<=0)||kdDiff===-1){ sA=9;sB=10; }
    else if(rDiff>0){ sA=10;sB=9; } // bande serrée mais A garde un léger avantage réel
    else if(rDiff<0){ sA=9;sB=10; } // bande serrée mais B garde un léger avantage réel
    else { if(rnd()<0.5){sA=10;sB=9;} else {sA=9;sB=10;} } // égalité mathématique exacte, rarissime
    let j1=[sA,sB], j2=[sA,sB], j3=[sA,sB];
    // Dissidence des juges : la probabilité baisse avec l'écart du round mais
    // n'atteint jamais 0% — même un round net (10-7/10-8) peut voir un juge
    // s'écarter d'un point. Avant, la dissidence n'était possible QUE sur les
    // rounds ultra-serrés (|rDiff|<=6), rendant l'unanimité totale obligatoire
    // sur tout round net — confirmé irréaliste (3 juges identiques à chaque
    // round d'un combat entier n'arrive jamais en vrai MMA).
    const margin=Math.max(Math.abs(rDiff),Math.abs(kdDiff)*20);
    const dissent2=clamp(0.35-margin*0.004,0.04,0.35);
    const dissent3=clamp(0.15-margin*0.002,0.02,0.15);
    if(rnd()<dissent2) j2=[sB===10?9:10, sA===10?9:10];
    if(rnd()<dissent3) j3=[sB===10?9:10, sA===10?9:10];
    j1A+=j1[0];j1B+=j1[1];j2A+=j2[0];j2B+=j2[1];j3A+=j3[0];j3B+=j3[1];
    roundStats.push({r,j1,j2,j3,sigA:st.A.sig-_sigA0,sigB:st.B.sig-_sigB0,tdA:st.A.td-_tdA0,tdB:st.B.td-_tdB0,kdA:st.A.kd-_kdA0,kdB:st.B.kd-_kdB0});
    // ==== [ANCRE: RECUP_INTER_ROUND] — la minute de repos entre rounds allège
    // une partie des dégâts accumulés, proportionnellement à la vraie stat de
    // récupération (pas la fatigue/cardio, qui reste dérivée à chaque round). ====
    dmgA=Math.max(0,dmgA-(A.attrs.recovery||50)*0.15);
    dmgB=Math.max(0,dmgB-(B.attrs.recovery||50)*0.15);
    // ==== [FIN ANCRE] ====
  }
  let res;
  if(finish){
    const loserSt=(finish.loser===A)?st.A:st.B;
    const zones={tête:loserSt.dmgHead,corps:loserSt.dmgBody,jambes:loserSt.dmgLegs};
    const finishZone=Object.keys(zones).reduce((a,b)=>zones[b]>zones[a]?b:a,'tête');
    finish.zone=finishZone;
    finish.moveName=pickFinishMove(finish.by, finish.method==='Soumission'?'sub':'ko', finishZone);
    res={winner:finish.by===A?'A':'B',method:finish.method,round:finish.round,detail:finish.detail||'',moveName:finish.moveName,zone:finishZone}; }
  else {
    // ==== [ANCRE: JUGES_10PT_VERDICT] — le vainqueur vient du vote MAJORITAIRE des
    // juges (pas d'un total sa/sb caché), pour que les cartes affichées soient
    // toujours cohérentes avec le résultat annoncé. ====
    const votesA=[j1A>j1B,j2A>j2B,j3A>j3B].filter(Boolean).length;
    const votesB=[j1A<j1B,j2A<j2B,j3A<j3B].filter(Boolean).length;
    if(votesA===votesB){ res={winner:'D',method:'Égalité'}; }
    else { const winnerSide=votesA>votesB?'A':'B'; const unanimous=votesA===3||votesB===3;
      res={winner:winnerSide,method:unanimous?'Décision':'Décision partagée'}; }
    // ==== [FIN ANCRE] ====
  }
  res.scoreA=j1A+j2A+j3A; res.scoreB=j1B+j2B+j3B;
  res.judges={j1:[j1A,j1B],j2:[j2A,j2B],j3:[j3A,j3B]}; res.roundStats=roundStats;
  res.log=log; res.stats=st;
  // ==== [ANCRE: CHIN_PERMANENT] — dégâts neurologiques cumulatifs et
  // irréversibles, demandés explicitement malgré la règle "jamais de
  // dégradation silencieuse" établie plus tôt : ici le déclencheur est
  // toujours explicite et compréhensible (KO subi, ou guerre confirmée),
  // jamais un tirage aléatoire déconnecté d'un événement précis.
  if(finish && finish.method==='KO/TKO'){
    const loserAttrs=(finish.loser===A)?A.attrs:B.attrs;
    loserAttrs.chin=clamp(loserAttrs.chin-RI(1,3),1,100);
  }
  if(st.A.dmgHead>=15 && rnd()<0.4) A.attrs.chin=clamp(A.attrs.chin-1,1,100);
  if(st.B.dmgHead>=15 && rnd()<0.4) B.attrs.chin=clamp(B.attrs.chin-1,1,100);
  // ==== [FIN ANCRE] ====
  return res;
}
function applyResult(F,opp,res,side){ const isDraw=res.winner==='D'; const win=!isDraw&&res.winner===side; const m=res.method;
  if(isDraw){ F.D=(F.D||0)+1; F.morale=clamp(F.morale+RI(-2,2),0,100); }
  else if(win){ F.W++; F.streak=Math.max(1,F.streak+1); if(m.startsWith('KO'))F.ko++; else if(m.startsWith('Soum'))F.sub++; else F.dec++; F.morale=clamp(F.morale+RI(6,12),0,100); }
  else { F.L++; F.streak=Math.min(-1,F.streak-1); if(m.startsWith('KO'))F.koLoss++; F.morale=clamp(F.morale-RI(8,16),0,100); }
  F.form=clamp(F.form+(win?RI(3,8):isDraw?0:-RI(5,12)),0,100);
  // ==== [ANCRE: META04_06] — planchers de moral. Le jeu n'a pas de système de
  // popularité distinct : ces deux compétences sont adaptées sur `morale`,
  // le champ existant le plus proche (au lieu d'un f.pop qui n'existe pas). ====
  if(F.skills&&F.skills.includes('meta06')){ if(F.morale<75) F.morale=75; }
  else if(F.skills&&F.skills.includes('meta04')){ if(F.morale<45) F.morale=45; }
  // ==== [FIN ANCRE] ====
  // OPTIMISATION MÉMOIRE — seul le profil du joueur conserve l'historique narratif
  // détaillé (vérifié : aucun affichage ne lit jamais l'historique d'un PNJ, seuls
  // last5()/scr_history()/l'succès a4 lisent G.f.history spécifiquement).
  if(G.f && F.id===G.f.id){
    F.history.push({res:isDraw?'draw':(win?'win':'loss'),method:m,round:res.round||null,oppId:opp&&opp.id,
      oppName:opp&&opp.name,oppFlag:opp&&opp.flag,oppWasChamp:!!(opp&&opp.champion),oppRecord:opp?`${opp.W}-${opp.L}`:null,oppElo:opp&&opp.orgElo});
    if(F.history.length>60)F.history=F.history.slice(-60);
  }
  return win;
}
/* ------------------ FINISHERS SIGNATURE — noms de finish débloqués par compétence ---------------- */
const FINISH_MOVES={
 sub:[
  {id:'bjj29',name:'étranglement Anaconda',zone:'tête'},{id:'bjj30',name:'Peruvian Necktie',zone:'tête'},
  {id:'bjj35',name:'clé de cheville éclair',zone:'jambes'},{id:'bjj36',name:'Twister',zone:'jambes'},
  {id:'bjj39',name:'étranglement invisible',zone:'tête'},{id:'bjj40',name:'toile de soumissions sans fin',zone:'tête'},
  {id:'sambo29',name:'clé arrachée à la force brute',zone:'jambes'},{id:'sambo35',name:'clé de jambe fatale',zone:'jambes'},
  {id:'sambo38',name:'broyage articulaire',zone:'jambes'},{id:'sambo40',name:'double clé du Dernier Empereur',zone:'jambes'},
 ],
 ko:[
  {id:'karate28',name:'direct du samouraï',zone:'tête'},{id:'karate20',name:'coup de pied en crochet à l\u2019angle mort',zone:'tête'},
  {id:'boxer28',name:'crochet qui termine tout',zone:'tête'},{id:'boxer33',name:'uppercut surgi de nulle part',zone:'tête'},
  {id:'boxer36',name:'frappe qu\u2019on ne voit jamais partir',zone:'tête'},{id:'boxer40',name:'coup de l\u2019Interrupteur',zone:'tête'},
  {id:'kb28',name:'high kick mortel',zone:'tête'},{id:'kb40',name:'tibia du Cro Cop',zone:'tête'},
  {id:'mt30',name:'coude du chirurgien',zone:'tête'},{id:'mt35',name:'genou assassin',zone:'corps'},{id:'mt40',name:'tibia de l\u2019Héritier de Buakaw',zone:'jambes'},
  {id:'wrestler40',name:'takedown destructeur',zone:'corps'},{id:'sambo37',name:'enclume du Tsar',zone:'corps'},
  {id:'mma30',name:'Ground and Pound de l\u2019enfer',zone:'tête'},{id:'mma37',name:'instinct de destruction',zone:'tête'},
 ]
};
const GENERIC_SUB=[{name:'étranglement arrière (rear-naked choke)',zone:'tête'},{name:'guillotine',zone:'tête'},{name:'kimura',zone:'corps'},{name:'clé de bras (armbar)',zone:'corps'},{name:'triangle',zone:'tête'},{name:'clé de cheville',zone:'jambes'},{name:'heel hook',zone:'jambes'},{name:'étranglement de côté (arm-triangle)',zone:'tête'}];
const GENERIC_KO=[{name:'crochet au menton',zone:'tête'},{name:'direct explosif',zone:'tête'},{name:'uppercut',zone:'tête'},{name:'coup de pied à la tête',zone:'tête'},{name:'coup de pied circulaire au corps',zone:'corps'},{name:'genou en clinch',zone:'corps'},{name:'low kick qui casse l\u2019appui',zone:'jambes'},{name:'coude au sol',zone:'tête'},{name:'enchaînement de coups au sol',zone:'tête'}];
function pickFinishMove(winner,type,zone){ // type: 'sub' ou 'ko' — priorité aux compétences signature possédées, puis à la zone la plus endommagée
  const owned=(winner.skills||[]).filter(id=>FINISH_MOVES[type].some(m=>m.id===id));
  if(owned.length && rnd()<0.6){ const chosenId=pick(owned); return FINISH_MOVES[type].find(m=>m.id===chosenId).name; }
  const generic=type==='sub'?GENERIC_SUB:GENERIC_KO;
  const zoned=zone?generic.filter(m=>m.zone===zone):[];
  return (zoned.length?pick(zoned):pick(generic)).name;
}
function winProbEstimate(A,B){ const a=eff(A),b=eff(B);
  const oa=A.overall+a.killer*0.05+reachEdge(A,B), ob=B.overall+b.killer*0.05;
  let p=sigmoid((oa-ob)/12); p=clamp(p*100+RI(-8,8),3,97)/100; return p; // bruit volontaire
}

/* ------------------------- ORGS / CLASSEMENT / ÂGE ------------------------ */
const ORGS=['Amateur','Circuit local','Circuit régional','Circuit national','Continentale','Pacific Championship (Gloire)','Ultimate Rim (Argent)'];
const ORG_PROMO_SCORE=[0,100,250,450,650,900,900]; // score ELO requis par palier
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
  return n<ORGS.length && (f.orgWins||0)>=3 && winRate>=0.55 && p4pScore(f)>=ORG_PROMO_SCORE[n]; }
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
function eloBaseline(org,overallVal){ const b=[800,1000,1200,1450,1700,2000,2100][org]||1000; return Math.round(b+((overallVal||50)-50)*8); }
// Gain/perte Elo dynamique après un combat, K-factor modulé selon la méthode
// de finition (KO/Soumission pèsent plus qu'une décision) et le round.
function calculateEloDelta(ratingA,ratingB,winnerSide,method,round){
  const expectedA=1/(1+Math.pow(10,(ratingB-ratingA)/400)); const expectedB=1-expectedA;
  const scoreA=winnerSide==='A'?1:(winnerSide==='D'?0.5:0), scoreB=winnerSide==='B'?1:(winnerSide==='D'?0.5:0);
  let kFactor=32;
  if(method&&method.startsWith('KO')) kFactor=48; else if(method&&method.startsWith('Soum')) kFactor=44; else if(method==='Décision partagée') kFactor=24;
  if(round===1) kFactor*=1.25;
  return {deltaA:Math.round(kFactor*(scoreA-expectedA)), deltaB:Math.round(kFactor*(scoreB-expectedB))};
}
/* ==== [FIN ANCRE] ==== */
function p4pScore(f){ const fights=f.W+f.L+f.D;
  if(fights===0) return 0; // statut "non classé" (NR)
  if(f.careerElo===undefined) f.careerElo=eloBaseline(f.org,f.overall);
  if(f.orgElo===undefined) f.orgElo=eloBaseline(f.org,f.overall);
  const leapfrog=f.rankBoost||0;
  if(f.org===0) return Math.max(1, f.careerElo+f.defenses*30+(f.champion?50:0)+leapfrog);
  let score=f.orgElo*0.8+f.careerElo*0.2+f.defenses*30+(f.champion?50:0)+leapfrog;
  if(f.org===5) score*=1.4;
  return Math.max(1, score);
}
/* ==== [FIN ANCRE] ==== */
function rankPool(list){ return list.slice().sort((x,y)=>p4pScore(y)-p4pScore(x)); }
function isDeclining(f){ return f.age>=(isHeavy(f)?35:33); }
function isHeavy(f){ return f.div==='H-heavy'||f.div==='H-lheavy'; }
function applyAging(f){ const A=f.age; if(isDeclining(f)){ // déclin, poids lourds plus tardif
    const dec=k=>f.attrs[k]=clamp(f.attrs[k]-RI(0,2),1,100);
    dec('footSpeed');dec('handSpeed');dec('cardio');dec('explosiveness'); if(A>=36){dec('power');dec('recovery');} f.attrs.chin=clamp(f.attrs.chin-(A>=35?RI(0,2):0),1,100);
    if(rnd()<0.3) f.morale=clamp(f.morale-5,0,100); // voir ses capacités chuter mine le moral
  } else if(A>=27){ /* pic : stable */ }
  f.age++; f.overall=overall(f);
}
/* ------------------ INFIRMERIE — catalogue de blessures ---------------- */
const INJURY_TYPES=[
 {name:'Déchirure ligamentaire (genou)',fights:5},
 {name:'Fracture orbitale',fights:4},
 {name:'Fracture de la main',fights:3},
 {name:'Commotion cérébrale sévère',fights:3},
 {name:'Entorse grave à la cheville',fights:2},
];
function rollInjury(){ return pick(INJURY_TYPES); }
/* progression BORNÉE : un choix applique un delta net d'attributs ( up/down),
   plafonné par le potentiel — pas d'amélioration infinie. */
function applyDeltas(f,deltas){ const applied=[]; for(const [k,dv] of deltas){
    if(k==='morale'){ f.morale=clamp(f.morale+dv,0,100); applied.push(['Moral',dv]); continue; }
    if(k==='form'){ f.form=clamp(f.form+dv,0,100); applied.push(['Forme',dv]); continue; }
    const before=f.attrs[k]; let after=before+dv;
    // borne haute = potentiel — mais ne DOIT JAMAIS redescendre en-dessous de la
    // valeur déjà acquise (ex: via une compétence, non bornée par le potentiel) :
    // le plafond bloque une nouvelle progression, il ne reprend jamais l'existant.
    if(dv>0) after=Math.min(after, Math.max(before, (f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4));
    f.attrs[k]=clamp(after,1,100); const real=Math.round(f.attrs[k]-before);
    if(real!==0) applied.push({key:k,label:attrLabel(k),delta:real,before,after:f.attrs[k]});
  } f.overall=overall(f); return applied;
}
/* ==== [ANCRE: TIRAGE] — moteur de compétences en deux temps (plan §6/§18).
   Corrigé par rapport à la version brute reçue : les attributs vivent dans
   f.attrs (pas f.stats), le pays est f.countryKey (pas f.country), et le
   générateur aléatoire doit être rnd() (seedé, reproductible) et non
   Math.random(). Bornes /1-100 et recalcul de l'overall ajoutés, comme le
   faisait l'ancien rollSkill(). ==== */
const SKILL_CONSTANTS = {
  BASE_RATE: 0.095, DROUGHT_INC: 0.01, MYTHIC_CHANCE: 0.0009,
  MAX_CAREER_SKILLS: 9, AGE_META: 34,
};
function tirerRarete(){ const roll=rnd()*100;
  if(roll<58.3) return 'C'; if(roll<87.4) return 'R'; if(roll<97.1) return 'E'; return 'L';
}
function poolEligible(f, isEndOfCareer, isCapped){
  return SKILLS.filter(s=>{
    if(f.skills && f.skills.includes(s.id)) return false;
    if(s.fam==='gen') return false;                 // jamais tiré en carrière, seulement à la création
    if(s.fam==='meta') return isEndOfCareer;
    if(isCapped) return false;
    if(s.fam==='style' && s.key===f.style) return true;
    if(s.fam==='country' && s.key===f.countryKey) return true;
    return false;
  });
}
function getFallbackSkill(pool, baseRarity){ const hierarchy=['L','E','R','C'];
  let startIndex=hierarchy.indexOf(baseRarity); if(startIndex===-1) startIndex=0;
  for(let i=startIndex;i<hierarchy.length;i++){ const available=pool.filter(s=>s.rar===hierarchy[i]);
    if(available.length>0) return available[Math.floor(rnd()*available.length)]; }
  return null;
}
function grantSkill(f, skill){ if(!f.skills) f.skills=[]; f.skills.push(skill.id);
  if(skill.fx){ for(const stat in skill.fx){ if(f.attrs && f.attrs[stat]!==undefined) f.attrs[stat]=clamp(f.attrs[stat]+skill.fx[stat],1,100); } }
  if(typeof applySynergyBuffs==='function') applySynergyBuffs(f);
  f.overall=overall(f); return skill;
}
function rollSkill(f){
  if(!f._drought) f._drought=0; if(!f.skills) f.skills=[];
  let careerCount=0, hasMythic=false;
  f.skills.forEach(skillId=>{ const s=SKILLS.find(x=>x.id===skillId); if(s){ if(s.fam==='style'||s.fam==='country') careerCount++; if(s.rar==='M') hasMythic=true; } });
  const isCapped=careerCount>=SKILL_CONSTANTS.MAX_CAREER_SKILLS;
  const isEndOfCareer=(f.age>=SKILL_CONSTANTS.AGE_META);
  // 1) Jet Mythique — entièrement séparé, testé à CHAQUE combat, indépendant
  //    du plafond et de la sécheresse (sinon il ne se déclenche presque jamais,
  //    comme observé lors des tests : 0% au lieu des ~4%/carrière visés).
  if(!hasMythic && rnd()<SKILL_CONSTANTS.MYTHIC_CHANCE){
    const mythics=SKILLS.filter(s=>s.rar==='M' && s.fam==='style' && s.key===f.style && !(f.skills||[]).includes(s.id));
    if(mythics.length>0) return grantSkill(f, mythics[Math.floor(rnd()*mythics.length)]);
  }
  // 2) Pool éligible pour le tirage normal (style/pays/méta selon contexte)
  const pool=poolEligible(f, isEndOfCareer, isCapped);
  if(pool.length===0) return null;
  const unlockChance=SKILL_CONSTANTS.BASE_RATE + (f._drought*SKILL_CONSTANTS.DROUGHT_INC);
  if(rnd()>unlockChance){ f._drought++; return null; }
  f._drought=0;
  if(isEndOfCareer){ const metaPool=pool.filter(s=>s.fam==='meta');
    if(metaPool.length>0 && rnd()<0.25) return grantSkill(f, metaPool[Math.floor(rnd()*metaPool.length)]); }
  if(isCapped) return null;
  const rarityDrawn=tirerRarete(); const finalSkill=getFallbackSkill(pool, rarityDrawn);
  if(finalSkill) return grantSkill(f, finalSkill);
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* épithètes de fin de carrière (uniques, certains liés à la catégorie) */
function epithets(f){ const e=[]; const fights=f.W+f.L+f.D; const wr=f.W/Math.max(1,fights);
  if(f.ko>=12)e.push('Machine à KO'); if(f.sub>=12)e.push('Le chasseur de cou');
  if(f.titles>=1&&f.L===0)e.push('L\u2019Invaincu'); if(f.defenses>=5)e.push('Le monarque');
  if(f.attrs.power>=92&&/plume|paille|mouche|coq/i.test(f.divName))e.push('Le Ngannou des petits gabarits');
  if(f.skills.includes('bjj29'))e.push('L\u2019Anaconda'); if(f.skills.includes('bjj36'))e.push('Le Tordeur');
  if(f.morale>=85&&f.titles>=1)e.push('Le favori du public'); if(wr>=0.85&&fights>=15)e.push('Le prodige');
  if(f.koLoss>=6)e.push('La guerre l\u2019a marqué'); if(!e.length)e.push('L\u2019artisan de la cage');
  return e;
}
