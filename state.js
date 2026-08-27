"use strict";
/* CAGE LEGACY — state.js (en cours d'extraction vers state/*.js)
   Panthéon persistant. G/esc/setTheme : state/state-core.js. Meta-stats/
   analytics : state/state-analytics.js. save/load/hasSave/wipe/
   parseAndValidate/SAVE_KEY/SAVE_BACKUP_KEY : state/state-save.js. migrate/
   SAVE_VERSION : state/state-migration.js. validateSave/repairFighter/
   validateState : state/state-validation.js (tous chargés avant ce fichier). */
/* Panthéon (HOF_KEY, loadHOF/saveHOF, LEGEND_TIER_COLOR, legendTierColor,
   legendDecoStyle, equipPantheonDecoration, unequipPantheonDecoration,
   hofScore, enshrine) : déplacés vers state/state-hof.js. */
/* ==== [ANCRE: LOT13_REGISTRE_MONDIAL] — META_STATS_KEY, ACH_KEY, loadAch,
   saveAch, metaStatsDefaults, migrateMetaStats, loadMetaStats, saveMetaStats,
   recordCareerStart, getAnalytics : déplacés vers state/state-analytics.js. ==== */
/* ==== [ANCRE: REJOUABILITE_RECORD_GAUNTLET] — meta.gauntletBest{bracket64,
   ladder_100,boss_run} : record persistant par format, lu au menu (ui-06) et
   à l'écran de fin de run (ui-04). Sémantique par format (plus haut = mieux
   SAUF ladder_100 où le rang #1 est le sommet, donc "plus BAS = mieux") :
   bracket64 -> meilleur roundStep atteint (1 à 7=victoire) ; ladder_100 ->
   meilleur (plus bas) rang atteint (100 au départ, 1 = sommet) ; boss_run ->
   meilleur streak KO enchaîné (0 à 5). N'écrit JAMAIS d'attribut/potentiel —
   même garde-fou que LOT14_SALLE_LEGENDES ci-dessus. ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — meta.gauntletBest[mode] était un SCALAIRE
   (un record unique par format). Avec les paliers d'Ascension, un record de
   palier 0 et un record de palier 3 ne sont plus comparables : le champ
   devient un dictionnaire {niveauAscension: valeur}. migrateGauntletBest()
   convertit l'ancien scalaire en {0:valeur} au premier accès — aucune perte
   de record existant. recordGauntletBest() garde sa signature à 3 arguments
   (les 6 appels existants dans ui-08 restent valides) : le niveau est lu sur
   G.arcade.asc quand il n'est pas passé explicitement.
   RÈGLE LOT14 RESPECTÉE : aucune de ces fonctions n'écrit d'attribut, de
   potentiel ni de vitesse — uniquement des compteurs de méta-progression. ==== */
const GAUNTLET_ASC_MAX=5;
function migrateGauntletBest(meta){
  if(!meta.gauntletBest){ meta.gauntletBest={}; return meta; }
  for(const k in meta.gauntletBest){
    if(typeof meta.gauntletBest[k]==='number') meta.gauntletBest[k]={0:meta.gauntletBest[k]};
  }
  return meta;
}
function gauntletAscLevel(meta,mode){ return (meta.gauntletAscension&&meta.gauntletAscension[mode])||0; }
function gauntletBestGet(meta,mode,asc){
  migrateGauntletBest(meta);
  const per=meta.gauntletBest[mode]; if(!per) return undefined;
  return per[asc===undefined?0:asc];
}
/* ==== [ANCRE: TOUR_ASCENSION_CONDITIONS_MESUREES] — item demandé : "vérifier
   les conditions d'équilibrage des paliers et réorganiser en fonction du
   taux de réussite le plus adapté". Mesuré au Monte-Carlo (250-400 runs
   simulées par palier et par format, via simulateFight, progression de camp
   incluse) — ce que le code d'origine reconnaissait ne jamais avoir fait
   ("aucun Monte Carlo derrière", cf. ANCRE GAUNTLET_ASCENSION, ui-03).
   Résultat au palier 0, avec l'ancienne condition « remporter le format » :
     Bracket 64  — tournoi remporté .... 1,8 %
     Boss Run    — 5 boss battus ....... 2,0 %
     Ladder 100  — rang 1 atteint ...... 0,0 %
   Les 5 paliers × 3 formats étaient donc du contenu mort : impossible
   d'ouvrir l'Ascension 1, donc aucune des suivantes. La difficulté des
   combats n'est PAS touchée (ce serait un changement de sensation de jeu
   bien plus risqué) : seule change la performance qui ouvre le palier
   suivant, recalée sur ~20-27 % de réussite au palier 0 — un objectif qui
   demande une bonne run sans exiger un quasi-sans-faute :
     Bracket 64  — quarts de finale .... 27 %
     Boss Run    — 2 boss battus ....... 21 %
     Ladder 100  — top 30 .............. ~25 %
   Remporter le format débloque toujours, forcément (le seuil est inclus).
   'better' dit dans quel sens va la progression : le Ladder se compte à
   l'envers (rang 1 = meilleur), les deux autres montent. ==== */
const GAUNTLET_ASC_UNLOCK={
  bracket64:{need:4,better:'up',goal:'atteindre les quarts de finale'},
  ladder_100:{need:30,better:'down',goal:'entrer dans le top 30'},
  boss_run:{need:2,better:'up',goal:'battre 2 boss'}
};
/** Objectif d'ouverture du palier suivant, en clair, pour l'affichage.
 * @param {string} mode @returns {string} */
function gauntletAscUnlockGoal(mode){ return (GAUNTLET_ASC_UNLOCK[mode]||GAUNTLET_ASC_UNLOCK.bracket64).goal; }
/** La performance de la run ouvre-t-elle le palier suivant ?
 * @param {string} mode @param {number} progress profondeur atteinte (rang pour le Ladder)
 * @returns {boolean} */
function gauntletAscUnlockReached(mode,progress){
  const r=GAUNTLET_ASC_UNLOCK[mode];
  if(!r || progress===undefined || progress===null) return false;
  return r.better==='down' ? progress<=r.need : progress>=r.need;
}
/* ==== [FIN ANCRE] ==== */
function recordGauntletAscension(meta,mode,asc){
  if(!meta.gauntletAscension) meta.gauntletAscension={};
  const cur=meta.gauntletAscension[mode]||0;
  const next=Math.min(GAUNTLET_ASC_MAX,(asc||0)+1);
  if(next>cur){ meta.gauntletAscension[mode]=next; return true; }
  return false;
}
/* ==== [ANCRE: PROCHAIN_OBJECTIF] — un joueur qui ouvre le jeu pour la
   première fois ne sait pas par où entrer. Un encart d'amorçage le lui dit,
   au menu du Gauntlet, et disparaît dès qu'il a joué une run : passé ce
   cap, il sait où il va et l'écran n'a plus à le lui répéter. La version
   précédente restait affichée en permanence et changeait de cible au fil de
   la progression — jugée trop encombrante, ramenée à ce seul rôle. ==== */
/** L'amorçage, et lui seul : ce qu'il faut faire quand on n'a encore rien
 * joué. Une fois la première run terminée, il n'y a plus rien à afficher —
 * le joueur sait où il va, l'encart s'efface.
 * @returns {?{titre:string,detail:string,cta:{label:string,onclick:string}}} */
function nextObjective(){
  const meta=loadMetaStats();
  if(meta.totalFights>0) return null;
  return {titre:'Lance une première run de Gauntlet',
    detail:'Un combattant tiré au sort, des adversaires à enchaîner : la façon la plus rapide de voir à quoi ressemble le jeu.',
    cta:{label:'Commencer',onclick:"CL.go('gauntlet_menu')"}};
}
/* ==== [FIN ANCRE] ==== */
function recordGauntletBest(meta,mode,value,asc){
  migrateGauntletBest(meta);
  const lvl=(asc===undefined||asc===null)
    ?((typeof G!=='undefined'&&G&&G.arcade&&G.arcade.asc)||0)
    :asc;
  if(!meta.gauntletBest[mode]) meta.gauntletBest[mode]={};
  const cur=meta.gauntletBest[mode][lvl];
  const better=(mode==='ladder_100')?(cur===undefined||value<cur):(cur===undefined||value>cur);
  if(better){ meta.gauntletBest[mode][lvl]=value; return true; }
  return false;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — couche 1 de la méta-progression du
   mode Faith : une carrière scellée disparaît avec le combattant (retiré,
   enshrine() l'a déjà copié dans le Panthéon), mais rien ne restait pour
   comparer une carrière à celle d'avant — chaque partie recommençait de
   zéro sans mémoire du record personnel. meta.faithLegends conserve les 12
   meilleures carrières Faith jamais scellées (triées par score), et
   meta.faithBest/meta.faithRuns le record et le nombre total de carrières
   pour l'affichage "précédent record" sans avoir à parcourir la liste.
   Même discipline que meta.gauntletBest ci-dessus (RÈGLE LOT14 RESPECTÉE) :
   entry est un résumé de surface (score, identité, palmarès), jamais un
   attribut, un potentiel ni une vitesse — aucune de ces fonctions ne
   redonne le moindre avantage à une future carrière. ==== */
const FAITH_LEGENDS_MAX=12;
function recordFaithLegend(entry){
  const meta=loadMetaStats();
  if(!meta.faithLegends) meta.faithLegends=[];
  meta.faithLegends.push(entry);
  meta.faithLegends.sort((a,b)=>(b.score||0)-(a.score||0));
  if(meta.faithLegends.length>FAITH_LEGENDS_MAX) meta.faithLegends.length=FAITH_LEGENDS_MAX;
  meta.faithBest=Math.max(meta.faithBest||0,entry.score||0);
  meta.faithRuns=(meta.faithRuns||0)+1;
  saveMetaStats(meta);
}
function getFaithBest(){ return loadMetaStats().faithBest||0; }
/* ==== [FIN ANCRE] ==== */
/* Profil du joueur : max 1 titre + 1 effet affichés à la fois (compte
   entier, pas par combattant — les combattants arcade sont jetables et non
   persistés, cf. règle déjà établie ailleurs dans ce fichier). */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — meta.gauntletBest[mode][asc]
   reste un SCALAIRE global partagé par les 23+ archétypes (comportement
   inchangé, lu par gauntletMenuBestTag/finaliseGauntletRun) : y ajouter une
   dimension archétype en place aurait exigé de migrer sa forme partout où
   il est lu, avec le risque de casser le record global déjà en place chez
   des joueurs existants. À la place, meta.gauntletBestByArchetype[mode]
   [asc][archetypeNick] est une structure PARALLÈLE et INDÉPENDANTE, jamais
   lue par l'ancien système : aucune migration nécessaire, aucun risque sur
   les records déjà enregistrés. archetypeNick = G.f.nick au moment du run
   (identifiant stable posé par makeArcadeArchetype(), jamais modifié en
   arcade — pas d'évolution de surnom hors mode carrière). ==== */
function gauntletBestByArchetypeGet(meta,mode,asc,archetypeNick){
  const perMode=meta.gauntletBestByArchetype&&meta.gauntletBestByArchetype[mode];
  const perAsc=perMode&&perMode[asc===undefined?0:asc];
  return perAsc?perAsc[archetypeNick]:undefined;
}
function recordGauntletBestByArchetype(meta,mode,value,asc,archetypeNick){
  if(!archetypeNick) return false;
  const lvl=asc===undefined||asc===null?0:asc;
  if(!meta.gauntletBestByArchetype) meta.gauntletBestByArchetype={};
  if(!meta.gauntletBestByArchetype[mode]) meta.gauntletBestByArchetype[mode]={};
  if(!meta.gauntletBestByArchetype[mode][lvl]) meta.gauntletBestByArchetype[mode][lvl]={};
  const per=meta.gauntletBestByArchetype[mode][lvl];
  const cur=per[archetypeNick];
  const better=(mode==='ladder_100')?(cur===undefined||value<cur):(cur===undefined||value>cur);
  if(better){ per[archetypeNick]=value; return true; }
  return false;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : registre
   PARALLÈLE et INDÉPENDANT à meta.gauntletBestByArchetype ci-dessus, même
   principe (pas de migration, aucun risque sur les records déjà enregistrés).
   Stocke, pour la MEILLEURE run connue par mode/palier/archétype, la liste
   ordonnée des snapshots de chaque combat de cette run (dégâts subis par
   zone + amenées au sol + knockdowns — seules données déjà suivies par le
   moteur, cf. res.stats.A dans engine.js). Écrasé uniquement quand
   recordGauntletBestByArchetype() renvoie true (nouveau record), jamais
   avant — cf. finaliseGauntletRun() (ui-08). ==== */
function gauntletGhostLogGet(meta,mode,asc,archetypeNick){
  const perMode=meta.gauntletGhostLog&&meta.gauntletGhostLog[mode];
  const perAsc=perMode&&perMode[asc===undefined?0:asc];
  return perAsc?perAsc[archetypeNick]:undefined;
}
function recordGauntletGhostLog(meta,mode,asc,archetypeNick,fights){
  if(!archetypeNick) return;
  const lvl=asc===undefined||asc===null?0:asc;
  if(!meta.gauntletGhostLog) meta.gauntletGhostLog={};
  if(!meta.gauntletGhostLog[mode]) meta.gauntletGhostLog[mode]={};
  if(!meta.gauntletGhostLog[mode][lvl]) meta.gauntletGhostLog[mode][lvl]={};
  meta.gauntletGhostLog[mode][lvl][archetypeNick]=(fights||[]).map(x=>({dmgHead:x.dmgHead||0,dmgBody:x.dmgBody||0,dmgLegs:x.dmgLegs||0,td:x.td||0,kd:x.kd||0}));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_DAILY] — graine du jour. Aucun serveur, aucun compte :
   la graine est DÉRIVÉE de la date locale (YYYYMMDD), donc identique pour
   tout le monde le même jour sans échange réseau, et _rollGauntletSeed()
   (ui-08) sait déjà hacher une chaîne numérique. Une seule tentative par
   jour et par format, mémorisée dans meta (clé localStorage séparée de la
   sauvegarde, donc survit au fait qu'une run Gauntlet n'est JAMAIS persisté —
   cf. ANCRE SAVE_GARDE_ARCADE ci-dessus). ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* updateMetaStatsOnRetirement : déplacé vers state/state-analytics.js.
   filterHallOfFame : déplacé vers state/state-hof.js. */

/* LEGEND_UNLOCKABLES, awardLegendPoints, checkLegendUnlock, purchaseLegendUnlock : déplacés vers state/state-shop.js. */
/* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026) :
   nouvelle section boutique, consommables à USAGE UNIQUE, appliqués
   AUTOMATIQUEMENT au début de la PROCHAINE run Gauntlet (pas de réserve —
   un seul en attente à la fois, cf. purchaseGauntletConsumable ci-dessous).
   ⚠️ Le Gauntlet n'a pas de forme/moral (juste le flag interne formBroken,
   cf. GAUNTLET_SANS_MORAL_FORME ailleurs) — aucun consommable ne cible donc
   forme/moral, conformément à la mise en garde de la spec. ⚠️ Toutes les
   valeurs fx sont exprimées ici en échelle BRUTE 1-100 (déjà converties
   depuis l'échelle affichée /20 de la spec : facteur ×5, cf. d20() dans
   engine.js — ex. "+3 Cardio" /20 devient fx.cardio:+15). ==== */
const GAUNTLET_CONSUMABLES=[
  {id:'cons_veto',name:'Droit de véto',cost:70,kind:'veto',desc:'Annule le 1er adversaire généré de la prochaine run, un autre est tiré à sa place.'},
  {id:'cons_shelter',name:'Mise à l\u2019abri automatique',cost:60,kind:'autobank',desc:'Sécurise automatiquement une petite somme dès le 1er combat gagné de la run.'},
  {id:'cons_safetynet',name:'Filet de sécurité',cost:90,kind:'safetynet',desc:'Offre une 2e chance si tu perds le 1er combat de la run — l\u2019adversaire est retiré sans mettre fin à la run.'},
  {id:'cons_strength',name:'Potion de force',cost:50,kind:'buff',fx:{power:15},desc:'Boost temporaire de Puissance (+3), actif pour toute la run.'},
  {id:'cons_dope',name:'Dopage légal',cost:65,kind:'buff',fx:{cardio:15,power:20,durability:-5},desc:'+3 Cardio, +4 Puissance, -1 Résistance, actif pour toute la run.'},
  {id:'cons_camp',name:'Camp d\u2019entraînement rigoureux',cost:65,kind:'buff',fx:{strength:10,composure:10,fightIQ:10},desc:'+2 Force, +2 Sang-froid, +2 Intelligence, actif pour toute la run.'}
];
function purchaseGauntletConsumable(meta,itemId){
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===itemId);
  if(!item) return {success:false,msg:'Consommable invalide.'};
  if(meta.gauntletPendingConsumable) return {success:false,msg:'Un consommable est déjà en attente pour ta prochaine run — pas de réserve possible.'};
  if((meta.legendPoints||0)<item.cost) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=item.cost; meta.gauntletPendingConsumable=itemId;
  return {success:true,msg:`${item.name} appliqué à ta prochaine run Gauntlet.`};
}
/* Appelée UNE SEULE FOIS à la création de G.arcade (startArcade/startBossRun/
   startLadder100, ui-03/ui-08) : consomme le consommable en attente (plus de
   réserve après ça) et pose les drapeaux/effets correspondants sur la run
   qui démarre. Les effets 'veto'/'autobank'/'safetynet' sont de simples
   drapeaux lus/consommés ailleurs (selectDraft pour veto, afterResult pour
   autobank et safetynet, ui-08) — 'buff' est appliqué immédiatement ici,
   directement sur G.f.attrs (permanent pour la durée de la run, même
   principe que les deltas de camp d'entraînement). */
function applyPendingGauntletConsumable(a){
  const meta=loadMetaStats();
  const itemId=meta.gauntletPendingConsumable;
  if(!itemId) return;
  meta.gauntletPendingConsumable=null; saveMetaStats(meta);
  const item=GAUNTLET_CONSUMABLES.find(i=>i.id===itemId);
  if(!item) return;
  a.activeConsumable=itemId;
  if(item.kind==='buff' && typeof G!=='undefined' && G && G.f){
    Object.entries(item.fx).forEach(([k,v])=>{ G.f.attrs[k]=clamp((G.f.attrs[k]||50)+v,1,100); });
  } else if(item.kind==='veto'){ a.consumableVeto=true; }
  else if(item.kind==='autobank'){ a.consumableAutobank=true; }
  else if(item.kind==='safetynet'){ a.consumableSafetynet=true; }
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
   UNIQUEMENT en Gauntlet. Coût "astronomique", volontairement croissant
   avec la profondeur déjà atteinte (plus tu es allé loin, plus cher de
   sauver la run — cohérent avec "astronomique" et avec le fait qu'une run
   profonde vaut plus la peine d'être sauvée). Fonction pure (aucune
   dépendance à G) : lit uniquement l'objet arcade passé en argument, pour
   rester utilisable aussi bien à l'affichage (scr_gameover, ui-04) que dans
   la validation d'achat (CL.buyDevilContinue, ui-08). ==== */
function gauntletDevilCost(mode,a){
  let depth=0;
  if(mode==='boss_run') depth=a.streak||0;
  else if(mode==='ladder_100') depth=Math.max(0,100-(a.rank||100));
  else depth=(a.tournament&&a.tournament.roundStep)||1;
  return 500+depth*150;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* migrate()/SAVE_VERSION : state/state-migration.js.
   validateSave()/repairFighter()/validateState() : state/state-validation.js. */
/* ==== [ANCRE: PERSON_REGISTRY] — Plan V3 LOT 0 §4.1. « Le jeu n'a pas de
   notion d'être humain persistant. » Avant ce correctif, le coach était la
   chaîne littérale 'Le coin' (ui-04), l'agent un archétype sans nom
   (FAITH_AGENTS), et le partenaire d'entraînement affiché était recalculé
   par tri à chaque rendu (topPartner=F.gym.slice().sort(...)[0]) — c'est
   la cause EXACTE du bug remonté « Marcus est devenu Sean sans raison » :
   il n'était jamais désigné, seulement premier au tri.

   G.people = {byId, byKey, nextId} est le registre. Une Person mintée pour
   une clé stable (directeur d'une organisation, agent en poste, coach
   principal, journaliste qui suit la carrière) est TOUJOURS récupérée par
   personEnsure(), jamais reminée — c'est ce qui garantit qu'un
   personId stocké sur G.faith (F.coachId, F.sparringIds[]...) ne change
   que par un événement explicite portant une cause (state.leftReason),
   jamais par un recalcul de tri. Les rôles sans clé stable (sparring,
   fighter générique) mintent une personne réellement nouvelle à chaque
   appel — c'est le comportement voulu pour peupler un roster.

   Ce lot construit le REGISTRE et sa migration ; le RACCORDEMENT des
   écrans existants (scr_faith_contacts, F.agent, FAITH_DIRECTORS[org]...)
   à des Person réelles est le travail des LOTs 2 (coach/salle/contacts) et
   4 (agent) — les rattacher tous ici aurait mélangé fondation et
   contenu/écrans, contrairement à l'ordre de dépendance du document. ==== */
/** Représente humainement un rôle (LOT 2, 5.2.1c : 5 axes de relation, pas
 * une jauge unique — `debt`/`distance` étendent le triplet trust/respect/
 * resentment déjà écrit en §4.1 ; superset qui satisfait les deux
 * descriptions du document sans migration douloureuse plus tard).
 * @typedef {{id:number, firstName:string, lastName:string,
 *   nickname:?string, flag:string, born:string,
 *   role:'coach'|'sparring'|'agent'|'director'|'journalist'|'fighter',
 *   bio:{origin:string,past:string,trait:string},
 *   rel:{since:number,trust:number,respect:number,resentment:number,
 *     debt:number,distance:number,arc:{year:number,text:string}[]},
 *   state:{gymId:?string,active:boolean,leftAt:?number,leftReason:?string},
 *   memory:string[], extra:?object}} Person */
function ensurePeopleRegistry(){
  if(!G.people || typeof G.people!=='object' || !G.people.byId){
    G.people = { byId:{}, byKey:{}, nextId:1 };
  }
  if(!G.people.byKey || typeof G.people.byKey!=='object') G.people.byKey={};
  return G.people;
}
function personDefaultRel(){
  return { since:(G.faith&&G.faith.year)||(G.season&&G.season.year)||1,
    trust:50, respect:50, resentment:0, debt:0, distance:0, arc:[] };
}
/** Clé de dédoublonnage stable — deux appels avec la même clé renvoient
 * TOUJOURS la même Person (jamais reminée). null = pas de dédoublonnage
 * (sparrings/fighters génériques : chaque appel doit créer quelqu'un de
 * réellement nouveau).
 * @param {string} role @param {object} ctx @returns {?string} */
function personKeyFor(role,ctx){
  if(ctx && ctx.key!=null) return role+':'+ctx.key;
  if(role==='director') return 'director:'+((ctx&&ctx.org)||0);
  if(role==='agent') return 'agent:'+((ctx&&ctx.slot)||'main');
  if(role==='coach') return 'coach:'+((ctx&&ctx.slot)||'main');
  if(role==='journalist') return 'journalist:main';
  return null;
}
/** Construit une Person neuve à partir des pools de data-people.js pour
 * les rôles nommés, ou d'une identité générée (makeName, engine.js) pour
 * les rôles sans pool dédié. Jamais appelée directement par un écran —
 * seulement par personEnsure(). @param {string} role @param {object} ctx
 * @returns {Person} */
function personMint(role,ctx){
  ctx = ctx||{};
  const reg = ensurePeopleRegistry();
  const id = reg.nextId++;
  const base = { id, nickname:null, role, bio:{origin:'',past:'',trait:''},
    rel:personDefaultRel(), state:{gymId:ctx.gymId||null,active:true,leftAt:null,leftReason:null}, memory:[] };
  if(role==='director'){
    const pool=(typeof FAITH_DIRECTORS!=='undefined')?FAITH_DIRECTORS:[];
    const d=pool[ctx.org]||pool[0]||{name:'Inconnu',lastName:'',archetype:'loyaliste',trait:''};
    return Object.assign(base,{firstName:d.name,lastName:d.lastName||'',flag:'',born:'',
      bio:{origin:'Dirige l’organisation.',past:d.trait||'',trait:d.trait||''},
      extra:{archetype:d.archetype,grants:d.grants,refuses:d.refuses,counter:d.counter}});
  }
  if(role==='agent'){
    const pool=((typeof FAITH_AGENT_ROSTER!=='undefined')?FAITH_AGENT_ROSTER:[]).filter(a=>!reg.byId[reg.byKey['agent:'+a.id]]);
    const a=pick(pool.length?pool:((typeof FAITH_AGENT_ROSTER!=='undefined')?FAITH_AGENT_ROSTER:[{firstName:'Agent',lastName:'',archetype:'fidele',ck:'FR',trait:''}]));
    const flag=(typeof COUNTRIES!=='undefined'&&COUNTRIES[a.ck])?COUNTRIES[a.ck].flag:'';
    return Object.assign(base,{firstName:a.firstName,lastName:a.lastName,flag,born:a.ck||'',
      bio:{origin:'Agent de combattants.',past:a.trait||'',trait:a.trait||''},
      extra:{archetype:a.archetype}});
  }
  if(role==='coach'){
    const pool=(typeof FAITH_COACHES!=='undefined')?FAITH_COACHES:[];
    const c=ctx.coachId?pool.find(x=>x.id===ctx.coachId):pick(pool.length?pool:[{firstName:'Coach',lastName:'',specialty:'mental',palmares:'',flaw:'',cost:0}]);
    return Object.assign(base,{firstName:c.firstName,lastName:c.lastName,nickname:c.nickname||null,flag:'',born:'',
      bio:{origin:c.palmares||'',past:c.flaw||'',trait:c.specialty||''},
      extra:{specialty:c.specialty,cost:c.cost,requirement:c.requirement,coachId:c.id}});
  }
  if(role==='journalist'){
    const names=(typeof FAITH_JOURNALIST_NAMES!=='undefined')?FAITH_JOURNALIST_NAMES:['Anonyme'];
    const full=pick(names);
    const parts=full.split(' '); const traits=(typeof FAITH_JOURNALIST_TRAITS!=='undefined')?FAITH_JOURNALIST_TRAITS:{};
    const media=(typeof FAITH_PRESSE_MEDIAS!=='undefined'&&FAITH_PRESSE_MEDIAS.length)?pick(FAITH_PRESSE_MEDIAS):'';
    return Object.assign(base,{firstName:parts[0]||full,lastName:parts.slice(1).join(' '),flag:'',born:'',
      bio:{origin:media,past:traits[full]||'',trait:traits[full]||''},
      extra:{media,sentiment:0}});
  }
  // sparring / fighter / rôle inconnu : identité générée, jamais inventée
  // "à la volée" par un écran — c'est makeName() (engine.js) qui la
  // produit, la même fonction que pour tout combattant du jeu.
  const gender=ctx.gender||(rnd()<0.5?'F':'H');
  const ck=ctx.countryKey||pick(COUNTRY_KEYS);
  const nm=makeName(gender,ck);
  const bio={origin:(typeof pick==='function'&&typeof ORIGINS!=='undefined')?pick(ORIGINS):'',
    past:(typeof MOTIVATIONS!=='undefined')?pick(MOTIVATIONS):'',
    trait:(typeof PERSON_TRAITS!=='undefined')?pick(PERSON_TRAITS):''};
  return Object.assign(base,{firstName:nm.first,lastName:nm.last,flag:nm.flag,born:ck,bio,
    nickname:(role==='sparring'&&typeof FAITH_GYM_NEWCOMER_NICKS!=='undefined')?pick(FAITH_GYM_NEWCOMER_NICKS):null});
}
/** Crée ou récupère une Person. Aucun écran n'a le droit d'inventer un nom
 * à la volée — c'est le seul point d'entrée pour peupler G.people.
 * @param {'coach'|'sparring'|'agent'|'director'|'journalist'|'fighter'} role
 * @param {object} [ctx] @returns {Person} */
function personEnsure(role,ctx){
  const reg=ensurePeopleRegistry();
  const key=personKeyFor(role,ctx);
  if(key && reg.byKey[key]!=null && reg.byId[reg.byKey[key]]) return reg.byId[reg.byKey[key]];
  const p=personMint(role,ctx);
  reg.byId[p.id]=p;
  if(key) reg.byKey[key]=p.id;
  return p;
}
/** Source unique d'affichage d'une Person — jamais recomposer "prénom nom"
 * ailleurs, sinon deux écrans peuvent finir par afficher deux formats
 * différents pour la même personne. @param {Person} p
 * @param {{short?:boolean,withNick?:boolean}} [opts] @returns {string} */
function personName(p,opts){
  if(!p) return '';
  opts=opts||{};
  if(opts.short) return p.firstName||'';
  const full=[p.firstName,p.lastName].filter(Boolean).join(' ');
  if(opts.withNick && p.nickname) return `${full} « ${p.nickname} »`;
  return full;
}
/** Marque une Person comme partie EXPLICITEMENT — jamais un simple
 * "disparaît sans qu'on sache pourquoi" (Loi 3 : la perte doit être
 * traçable). Ajoute l'entrée datée à rel.arc AVANT de figer l'état.
 * @param {Person} p @param {string} reason texte daté, lisible tel quel */
function personDepart(p,reason){
  if(!p) return;
  const year=(G.faith&&G.faith.year)||(G.season&&G.season.year)||1;
  p.rel.arc.push({year,text:reason});
  p.state.active=false; p.state.leftAt=year; p.state.leftReason=reason;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_GYMS_ELIGIBILITE] — Plan V4 LOT 5 §C11 : les 10 salles
   nommées de FAITH_GYMS (data-people.js) n'étaient lues par aucun écran ;
   scr_faith_camps() (ui-04) tournait toujours sur FAITH_CAMPS, 6 stages
   anonymes. Le stage reste le même geste (six semaines, un lieu, un
   effet chiffré sur 3 attributs) — seule la source change : une salle
   réelle, avec ville, spécialité et coach nommé, plutôt qu'un nom de
   discipline. GYM_SPECIALTY_ATTRS reprend la logique déjà écrite pour
   FAITH_CAMPS (trois attributs par famille) ; GYM_REP_TIER dérive coût
   d'accès en fraîcheur/risque du niveau de réputation de la salle (le
   coût en argent, lui, vient du coach principal qui l'anime — déjà
   chiffré dans FAITH_COACHES, jamais dupliqué ici). */
const GYM_SPECIALTY_ATTRS={
  frappe:['jab','cross','power'],
  lutte:['takedown','tdd','topControl'],
  soumission:['submission','guardWork','gnp'],
  cardio:['cardio','strength','explosiveness'],
  dur_au_mal:['chin','durability','recovery'],
  mental:['focus','composure','discipline']
};
const GYM_REP_TIER={
  'régionale':{minOrg:0,freshCost:-15,risk:0.04},
  'nationale':{minOrg:2,freshCost:-20,risk:0.05},
  'internationale':{minOrg:4,freshCost:-25,risk:0.07}
};
/** Famille de spécialités qu'un style de combat rend légitimes chez lui —
 * les spécialités "universelles" (cardio/mental/dur_au_mal) s'entraînent
 * n'importe où, jamais filtrées par le style. @type {Object<string,string[]>} */
const STYLE_TO_GYM_SPECIALTY={
  boxer:['frappe'],kickboxer:['frappe'],muayThai:['frappe'],karate:['frappe'],
  wrestler:['lutte'],sambo:['lutte'],bjj:['soumission'],
  mma:['frappe','lutte','soumission']
};
/** Une salle est éligible si sa réputation correspond au niveau de
 * l'organisation (f.org) et si sa spécialité correspond au style du
 * combattant (ou est universelle). L'argent n'entre pas dans ce filtre :
 * il reste un signal d'affordabilité affiché carte par carte (§C11),
 * jamais une raison de faire disparaître une salle de la liste.
 * @param {object} gym @param {object} f @returns {boolean} */
function faithGymEligible(gym,f){
  const tier=GYM_REP_TIER[gym.reputation]||GYM_REP_TIER['régionale'];
  if((f.org||0)<tier.minOrg) return false;
  if(['cardio','mental','dur_au_mal'].includes(gym.specialty)) return true;
  const fam=STYLE_TO_GYM_SPECIALTY[f.style]||[];
  return fam.includes(gym.specialty);
}
/** @param {object} f @returns {object[]} salles éligibles, ordre de FAITH_GYMS */
function faithEligibleGyms(f){
  return (typeof FAITH_GYMS!=='undefined'?FAITH_GYMS:[]).filter(g=>faithGymEligible(g,f));
}
/** Tirage idempotent d'au plus 3 salles parmi les éligibles, figé pour tout
 * le mois d'intersaison courant (même schéma que faithEnsureIntersaisonDraw,
 * data-faith-content.js/ui-08 : re-visiter l'écran ne doit jamais réduire
 * le choix). @param {object} f @param {object} F @returns {object[]} */
function faithEnsureCampGyms(f,F){
  const elig=faithEligibleGyms(f);
  if(F.currentCampGyms && F.currentCampGyms.month===F.month){
    const ids=F.currentCampGyms.ids;
    const byId=elig.filter(g=>ids.includes(g.id));
    if(byId.length) return byId;
  }
  let picks=elig;
  if(elig.length>3){
    const bag=elig.slice(); picks=[];
    while(picks.length<3 && bag.length) picks.push(bag.splice(RI(0,bag.length-1),1)[0]);
  }
  F.currentCampGyms={month:F.month,ids:picks.map(g=>g.id)};
  return picks;
}
/** Traduit une salle (FAITH_GYMS) dans la même forme que jouait un ancien
 * camp anonyme (FAITH_CAMPS) — id, coût, famille d'attributs, fraîcheur/
 * risque, texte — pour que faithCampChoose() (ui-08) n'ait qu'une seule
 * mécanique à résoudre. Le coût vient du coach principal de la salle
 * (FAITH_COACHES), jamais dupliqué sur la salle elle-même.
 * @param {object} gym @returns {?object} */
function faithGymAsCamp(gym){
  if(!gym) return null;
  const coach=(typeof FAITH_COACHES!=='undefined'?FAITH_COACHES:[]).find(c=>c.id===gym.coachId);
  const tier=GYM_REP_TIER[gym.reputation]||GYM_REP_TIER['régionale'];
  return {
    id:gym.id,name:gym.name,cost:(coach&&coach.cost)||0,
    freshCost:tier.freshCost,risk:tier.risk,
    attrs:GYM_SPECIALTY_ATTRS[gym.specialty]||[],
    text:`${gym.culture} Vous progressez sous l’œil de ${(coach&&coach.firstName)||''} ${(coach&&coach.lastName)||''}.`,
    repeatText:`Retour à ${gym.name} : la salle n’a plus rien de nouveau à vous apprendre — le travail rapporte moins.`
  };
}
/* ==== [ANCRE: FAITH_COACH_CHOICE_C12] — Plan V4 LOT 5 §C12 : les 24 coachs
   de FAITH_COACHES n'étaient tirés qu'au hasard, une seule fois, à la
   création (personMint('coach',...)). "Chercher un préparateur au-dessus"
   (evt_br_regional_coach, data-faith-content.js) ouvre maintenant un vrai
   choix parmi eux plutôt qu'un delta d'attributs — mais un coach qui a
   mené des champions ne prend pas n'importe qui : COACH_LEGITIMACY_CHECK
   traduit en code le champ `requirement` déjà écrit (texte libre) pour les
   7 coachs qui en portent un ; les 17 autres n'ont aucune exigence
   déclarée, donc toujours légitimes. Portée réduite assumée : deux
   exigences ("2 ans de pratique du sol", "une finition cette année") n'ont
   pas de compteur dédié dans f — approximées par la lecture la plus proche
   déjà disponible (attributs de sol, dernières entrées de f.history),
   plutôt que d'ajouter un champ rien que pour ce texte. */
const COACH_LEGITIMACY_CHECK={
  co_nakamura:f=>(f.attrs.submission||0)>=40 || (f.attrs.guardWork||0)>=40,
  co_ferreira:f=>(f.W||0)>=8,
  co_silva:f=>{
    const n=(G.faith&&G.faith.fightsThisYear)||0;
    if(n<=0) return false;
    return (f.history||[]).slice(-n).some(h=>h.res==='win' && (h.method==='Soumission'||h.method==='KO/TKO'));
  },
  co_kravets:f=>(f.age||0)>=25,
  co_johansen:f=>f.style==='wrestler'||f.style==='mma',
  co_essien:f=>(f.attrs.discipline||0)>=60,
  co_park:f=>(f.W||0)>=5
};
/** Un coach sans exigence déclarée (`requirement===null`) est toujours
 * légitime ; les 7 qui en ont une sont vérifiés via COACH_LEGITIMACY_CHECK.
 * @param {object} coach @param {object} f @returns {boolean} */
function faithCoachLegitimate(coach,f){
  const check=COACH_LEGITIMACY_CHECK[coach.id];
  return check?check(f):true;
}
/** @param {object} f @returns {object[]} coachs légitimes, ordre de FAITH_COACHES */
function faithEligibleCoaches(f){
  return (typeof FAITH_COACHES!=='undefined'?FAITH_COACHES:[]).filter(c=>faithCoachLegitimate(c,f));
}
/** Tirage idempotent d'au plus 3 coachs légitimes, figé pour la durée de
 * l'écran (jamais recalculé au fil des rendus — même raison que
 * faithEnsureCampGyms : re-visiter l'écran ne doit jamais changer le choix
 * proposé). @param {object} f @param {object} F @returns {object[]} */
function faithEnsureCoachChoices(f,F){
  if(F.currentCoachChoices){
    const byId=F.currentCoachChoices.map(id=>FAITH_COACHES.find(c=>c.id===id)).filter(Boolean);
    if(byId.length) return byId;
  }
  const elig=faithEligibleCoaches(f);
  let picks=elig;
  if(elig.length>3){
    const bag=elig.slice(); picks=[];
    while(picks.length<3 && bag.length) picks.push(bag.splice(RI(0,bag.length-1),1)[0]);
  }
  F.currentCoachChoices=picks.map(c=>c.id);
  return picks;
}
/** Remplace le coach principal : l'ancien PART (Loi 3, personDepart — jamais
 * un simple écrasement silencieux), le nouveau est minté sur l'id choisi de
 * FAITH_COACHES et prend la même clé stable ('coach:main') pour que
 * faithCoachPerson()/personEnsure() le retrouvent ensuite sans le reminer.
 * @param {string} coachId @param {string} reason texte daté pour l'ancien coach
 * @returns {Person} le nouveau coach */
function faithHireCoach(coachId,reason){
  const F=G.faith, reg=ensurePeopleRegistry();
  const old=F.coachId?reg.byId[F.coachId]:null;
  if(old) personDepart(old,reason);
  const p=personMint('coach',{coachId,slot:'main'});
  reg.byId[p.id]=p;
  reg.byKey['coach:main']=p.id;
  F.coachId=p.id;
  return p;
}
/* ==== [FIN ANCRE] ==== */
/* validateState() : déplacé vers state/state-validation.js. */
/* ==== [FIN ANCRE] ==== */
