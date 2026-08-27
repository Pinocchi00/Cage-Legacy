"use strict";
/* CAGE LEGACY — state/state-gauntlet.js
   Records et consommables du mode Gauntlet (arcade), tous stockés dans le
   meta persistant (state-analytics.js : loadMetaStats/saveMetaStats).
   applyPendingGauntletConsumable() écrit aussi directement G.f.attrs
   (buff de run, résolu à l'exécution). */
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
