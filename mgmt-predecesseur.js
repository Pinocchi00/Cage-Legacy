"use strict";
/* ==== [ANCRE: MONDE_LOT1_T2_PREDECESSEUR] — Monde lot 1 T2 ====
   Le joueur automatique de l'outil de mesure (tools/mesure-management.js, lot 7.1 des corrections du 08/10/2026) devient une fonction du jeu :
   il joue UNE soirée de la partie qu'on lui donne, sans écran. L'outil l'appelle au lieu de la recopier.
   Il ne recrute pas, ignore les affaires (il les ferme), et n'utilise pas mgmtAgendaProposer : les chiffres qu'il produit sont des ordres de grandeur.
   Le corps est le code de partie() de l'outil déplacé tel quel : mêmes appels, même ordre, mêmes bornes. L'ordre d'appel fixe la graine consommée —
   rien ne se réordonne ici. Aucun rnd() ni Math.random() dans ce fichier : les tirages viennent des fonctions du jeu appelées.
   Le moteur lit G.mgmt (mgmtFightReady, mgmtSel, saveMgmt) : la fonction ne pose jamais G, elle exige G.mgmt === m. */

/** Les réglages du prédécesseur. Aujourd'hui un seul : titreCadence — le titre se met en jeu quand k % titreCadence === 0
 *  (2 = une soirée sur deux, 0 = jamais d'initiative). Le lot 2 T3 y ajoutera les autres réglages, par organisation.
 *  @returns {{titreCadence:number}} un objet neuf à chaque appel. */
function mgmtPredecesseurReglages(){ return {titreCadence:2}; }

/** Les champions de Split, un par catégorie (id ou null), dans l'ordre de allDivisions().
 *  @param {object} m la partie  @returns {Array<string|null>} */
function mgmtPredecesseurChampions(m){ return allDivisions().map(d=>(mgmtSplitTitle(m,d.id)||{}).id||null); }

/** Joue UNE soirée de la partie m comme le joueur automatique de l'outil de mesure : décisions de la semaine, carte,
 *  soirée jouée, puis ouverture de la semaine suivante (mgmtNewPile). Sans écran ; ne recrute pas, ignore les affaires.
 *  Exige G.mgmt === m (le moteur lit G.mgmt) : lève une Error sinon.
 *  @param {object} m la partie  @param {number} k l'indice de la soirée (0, 1, 2…) : fixe la rotation des catégories et la cadence du titre
 *  @param {object} [reglages] complété par mgmtPredecesseurReglages()
 *  @param {{bookingMs:number,combatsMs:number}} [mesure] si fourni, on y ajoute les durées (Date.now) du booking et du combat ; jamais lu pour décider
 *  @returns {{jouee:boolean,k:number,prolonges:number,refus:{'trop-grand':number,caisse:number,'trop-bas':number,offre:number},
 *   reclames:number,tetes:number,titres:number,champions:{avant:Array,apres:Array},decouvert:boolean,evenement:object|null}} */
function mgmtPredecesseurSoiree(m,k,reglages,mesure){
  if(typeof G==='undefined'||!G||G.mgmt!==m) throw new Error('mgmtPredecesseurSoiree : G.mgmt doit être la partie jouée');
  const cad=Object.assign(mgmtPredecesseurReglages(),reglages||{}).titreCadence;
  const refus={'trop-grand':0,caisse:0,'trop-bas':0,offre:0};
  let prolonges=0, reclames=0, tetes=0;
  const t0=Date.now();
  const champAvant=mgmtPredecesseurChampions(m);
  /* Lot 5 T2 : le prédécesseur répondra aux demandes ici. */
  m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  /* Il prolonge à l'avance : un contrat à un combat de la fin est renouvelé sur trois combats, à la bourse que le combattant demande. */
  for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct) continue; if(mgmtContratRestants(f)>1) continue;
    const b=mgmtBourseSouhaitee(m,f,true); const r=mgmtContratRenouveler(m,f.id,3,b); if(r.ok) prolonges++; else if(refus[r.raison]!==undefined) refus[r.raison]++; }
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite');
  /* La carte principale : les combats réclamés d'abord, puis les meilleures têtes d'affiche de chaque catégorie. */
  for(const r of mgmtPublicReclame(m)){ if(m.card.main.length>=m.card.sizeMain) break; const a=mgmtFighterById(m,r.a), b=mgmtFighterById(m,r.b);
    if(a&&b&&a.div===b.div&&mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id)){ if(mgmtBookMain(m,a.id,b.id)) reclames++; } }
  const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))];
  let essais=0;
  while(m.card.main.length<m.card.sizeMain&&essais++<60){
    const div=divs[(k+m.card.main.length+essais)%divs.length];
    const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x));
    const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b){ if(mgmtBookMain(m,a.id,b.id)) tetes++; } }
  m.card.main.forEach((cf,i)=>{ if(cad>0&&k%cad===0&&mgmtCanTitle(m,cf)) mgmtSetTitle(m,i,true); });
  const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true);
  const bulk2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk2) mgmtDecide(m,bulk2.id,'validate');
  m.pile.forEach(x=>{x.status='closed';});
  const titres=m.card.main.filter(x=>x.title===true).length;
  if(mesure) mesure.bookingMs+=Date.now()-t0;
  const t1=Date.now();
  const ev=mgmtAgendaJouer(m);
  if(mesure) mesure.combatsMs+=Date.now()-t1;
  const compte={jouee:!!ev,k,prolonges,refus,reclames,tetes,titres,champions:{avant:champAvant,apres:mgmtPredecesseurChampions(m)},decouvert:m.treasury<0,evenement:ev||null};
  if(!ev) return compte;
  mgmtNewPile(m);
  return compte;
}
/* ==== [FIN ANCRE] ==== */
