"use strict";
/* ==== [ANCRE: MONDE_LOT1_T2_PREDECESSEUR] — Monde lot 1 T2 ====
   Le joueur automatique de l'outil de mesure (tools/mesure-management.js, lot 7.1 des corrections du 08/10/2026) devient une fonction du jeu :
   il joue UNE soirée de la partie qu'on lui donne, sans écran. L'outil l'appelle au lieu de la recopier.
   Il ne recrute pas, ignore les affaires (il les ferme), et n'utilise pas mgmtAgendaProposer : les chiffres qu'il produit sont des ordres de grandeur.
   Le corps est le code de partie() de l'outil déplacé tel quel : mêmes appels, même ordre, mêmes bornes. L'ordre d'appel fixe la graine consommée —
   rien ne se réordonne dans le joueur historique. T1 du lot 5 tire seulement la taille de la carte héritée via rnd().
   Le moteur lit G.mgmt (mgmtFightReady, mgmtSel, saveMgmt) : la fonction ne pose jamais G, elle exige G.mgmt === m. */

/** Les réglages du prédécesseur. Aujourd'hui un seul : titreCadence — le titre se met en jeu quand k % titreCadence === 0
 *  (2 = une soirée sur deux, 0 = jamais d'initiative). Le lot 2 T3 y ajoutera les autres réglages, par organisation.
 *  @returns {{titreCadence:number}} un objet neuf à chaque appel. */
function mgmtPredecesseurReglages(){ return {titreCadence:2}; }

/* ==== [ANCRE: MONDE_LOT1_T4BIS_PREDECESSEUR] — Monde lot 1 T4 bis : un matchmaker raisonnable garde ses combattants sous contrat et fait entrer des jeunes.
   Réglages OPT-IN (mgmtPredecesseurReglages garde ses défauts : l'outil de mesure et ses repères ne bougent pas) : `renouvelle` re-signe tout sans-contrat de l'effectif
   (la cause des 45 % de sans-contrat au premier jour : le jeu les laisse partir après une longue attente, et le prédécesseur ne les reprenait jamais) ;
   `recrues` fait entrer, par le mécanisme d'arrivée existant (le vivier : mgmtRecrutables, puis mgmtContratSigner qui appelle mgmtRecruter), le meilleur jeune
   de la catégorie quand elle est sous son plan — une catégorie sur `pas` à chaque soirée, à partir de la soirée `depuis`. Aucun tirage de la RNG. ==== */
/** Re-signe les sans-contrat de l'effectif (3 combats, à la bourse qu'ils demandent). @returns {number} les signatures acceptées. */
function mgmtPredecesseurResigne(m){
  let n=0;
  for(const f of m.roster){
    if(!f.libre||mgmtIsRetired(f)) continue;
    const r=mgmtContratSigner(m,f.id,3,mgmtBourseSouhaitee(m,f,false));
    if(r.ok) n++;
  }
  return n;
}
/** Fait entrer des jeunes du vivier dans les catégories sous leur plan. cfg : {depuis,pas,parSoiree,ageMax,fin,finAgeMax,plan:{divId:nombre}}. @returns {number} les recrues. */
function mgmtPredecesseurRecrute(m,k,cfg){
  if(!cfg||k<cfg.depuis) return 0;
  let n=0;
  allDivisions().forEach((d,i)=>{
    if((k+i)%cfg.pas!==0) return;
    /* Les dernières soirées, la catégorie encore sous son plan prend aussi des combattants plus âgés (finAgeMax) : l'effectif reste celui du plan. */
    const ageMax=k>=cfg.fin?cfg.finAgeMax:cfg.ageMax;
    for(let j=0;j<cfg.parSoiree;j++){
      if(m.roster.filter(f=>f.div===d.id&&!mgmtIsRetired(f)).length>=(cfg.plan[d.id]||0)) return;
      const x=mgmtRecrutables(m,d.id).find(y=>y.age<=ageMax);
      const cible=x&&mgmtExteriorPourOffre(m,x.id);
      if(!cible) return;
      if(mgmtContratSigner(m,x.id,3,mgmtBourseSouhaitee(m,cible,false)).ok) n++; else return;
    }
  });
  return n;
}
/* ==== [FIN ANCRE] ==== */

/** Les champions de Split, un par catégorie (id ou null), dans l'ordre de allDivisions().
 *  @param {object} m la partie  @returns {Array<string|null>} */
function mgmtPredecesseurChampions(m){ return allDivisions().map(d=>(mgmtSplitTitle(m,d.id)||{}).id||null); }

/* ==== [ANCRE: MONDE_LOT5_T1_BOOKING_PORTE] — Monde lot 5 T1 ==== */
/** Booking commun porté du joueur historique : même ordre, mêmes gardes et titres.
 * limite borne la carte sans jeter de combats ; contrats ajoute seulement la garde de l'héritage. */
function mgmtPredecesseurBooker(m,k,cfg,limite,contrats){
  const cad=cfg.titreCadence, plafond=Math.min(limite,m.card.sizeMain);
  const admissible=f=>!contrats||!!(f&&!f.libre&&mgmtContratRestants(f)>0);
  let reclames=0, tetes=0;
  /* La carte principale : les combats réclamés d'abord, puis les meilleures têtes d'affiche de chaque catégorie. */
  for(const r of mgmtPublicReclame(m)){ if(m.card.main.length>=plafond) break; const a=mgmtFighterById(m,r.a), b=mgmtFighterById(m,r.b);
    if(a&&b&&admissible(a)&&admissible(b)&&a.div===b.div&&mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id)){ if(mgmtBookMain(m,a.id,b.id)) reclames++; } }
  const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))];
  /* Décision du 12/10/2026 : le prédécesseur fait tourner les combats de titre. Une catégorie qui n'a qu'un règne (ou aucun) est servie d'abord, chaque soirée,
     et son titre est mis en jeu : le champion contre le mieux placé des autres. Aucune issue forcée : le moteur joue le combat. Opt-in : rotationTitres = la soirée à partir de laquelle il s'applique (la première moitié du passé n'est pas touchée). */
  /* Deux catégories par soirée au plus (le plafond des titres d'une carte) (à tour de rôle) : les têtes d'affiche des autres catégories gardent leurs places, la caisse d'une petite organisation aussi. */
  const manque=(Number.isSafeInteger(cfg.rotationTitres)&&k>=cfg.rotationTitres)?divs.filter(d=>mgmtCeintureLignee(m,d).reigns.length<2):[];
  const besoin=new Set(manque.length?[manque[k%manque.length],manque[(k+1)%manque.length]]:[]);
  const surCarte=d=>m.card.main.some(x=>{ const f=mgmtFighterById(m,x.a); return f&&f.div===d; });
  let essais=0;
  while(m.card.main.length<plafond&&essais++<60){
    const prio=[...besoin].find(d=>!surCarte(d)&&mgmtCartRows(m).filter(f=>f.div===d&&admissible(f)&&mgmtSelectable(m,f,null)).length>=2);
    const div=prio||divs[(k+m.card.main.length+essais)%divs.length];
    const rows=mgmtCartRows(m).filter(f=>f.div===div&&admissible(f)&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x));
    /* Le champion d'une catégorie délaissée peut être au dernier palier d'attente : il n'est plus « sélectionnable » seul, mais accepte un adversaire moins connu
       que lui (mgmtContratIndispo). On le prend quand même, avec le mieux placé de ceux qu'il accepte. */
    const champ=prio&&mgmtFighterById(m,mgmtSplitTitle(m,div).id);
    const cOk=champ&&admissible(champ)&&!champ.libre&&!mgmtIsRetired(champ)&&!mgmtEngaged(m,champ);
    const a=cOk?champ:rows[0];
    let b=null;
    if(a&&prio){
      /* Le challenger est celui qui a le plus de chances : la meilleure valeur de combat (lue, sans tirage) parmi ceux que le champion accepte. Le combat, lui, est joué. */
      let mieux=-1;
      for(const x of rows){ if(x.id===a.id||!mgmtSelectable(m,x,a.id)||!mgmtAvailable(m,a,x)) continue;
        const v=mgmtFightReady(x,m.cycle).overall; if(v>mieux){ mieux=v; b=x; } }
    }else b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id));
    if(a&&b){ if(mgmtBookMain(m,a.id,b.id)) tetes++; else if(prio) besoin.delete(prio); } else if(prio) besoin.delete(prio); }
  const ordreTitre=m.card.main.map((cf,i)=>i).sort((i,j)=>{
    const di=(mgmtFighterById(m,m.card.main[i].a)||{}).div, dj=(mgmtFighterById(m,m.card.main[j].a)||{}).div;
    return (besoin.has(dj)?1:0)-(besoin.has(di)?1:0)||i-j; });
  ordreTitre.forEach(i=>{ const cf=m.card.main[i], d=(mgmtFighterById(m,cf.a)||{}).div;
    if(((cad>0&&k%cad===0)||besoin.has(d))&&mgmtCanTitle(m,cf)) mgmtSetTitle(m,i,true); });
  return {reclames,tetes};
}

/* ==== [ANCRE: MONDE_LOT5_T1_CARTE_HERITEE] — Monde lot 5 T1 ==== */
/** Prépare sans jouer la carte principale transmise au joueur ; exige G.mgmt===m.
 * @param {object} m Partie après recalage et passage de témoin.
 * @param {number} k Indice de la prochaine soirée.
 * @param {object} [reglages] Politique du prédécesseur.
 * @returns {number} Nombre de combats signés (2 ou 3 en génération normale). */
function mgmtPredecesseurCarteHeritee(m,k,reglages){
  if(typeof G==='undefined'||!G||G.mgmt!==m) throw new Error('mgmtPredecesseurCarteHeritee : G.mgmt doit être la partie préparée');
  const cfg=Object.assign(mgmtPredecesseurReglages(),reglages||{});
  const limite=2+Math.floor(rnd()*2);
  const r=mgmtPredecesseurBooker(m,k,cfg,limite,true);
  return r.reclames+r.tetes;
}

/* ==== [ANCRE: MONDE_LOT5_T1_JOUEUR_BOOKING_COMMUN] — Monde lot 5 T1 ==== */
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
  const cfg=Object.assign(mgmtPredecesseurReglages(),reglages||{});
  const refus={'trop-grand':0,caisse:0,'trop-bas':0,offre:0};
  let prolonges=0, resignes=0, recrues=0;
  const t0=Date.now();
  const champAvant=mgmtPredecesseurChampions(m);
  /* Lot 5 T2 : le prédécesseur répondra aux demandes ici. */
  m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  /* Il prolonge à l'avance : un contrat à un combat de la fin est renouvelé sur trois combats, à la bourse que le combattant demande. */
  for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct) continue; if(mgmtContratRestants(f)>1) continue;
    const b=mgmtBourseSouhaitee(m,f,true); const r=mgmtContratRenouveler(m,f.id,3,b); if(r.ok) prolonges++; else if(refus[r.raison]!==undefined) refus[r.raison]++; }
  if(cfg.renouvelle===true) resignes=mgmtPredecesseurResigne(m);
  if(cfg.recrues) recrues=mgmtPredecesseurRecrute(m,k,cfg.recrues);
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite');
  const {reclames,tetes}=mgmtPredecesseurBooker(m,k,cfg,m.card.sizeMain,false);
  const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true);
  const bulk2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk2) mgmtDecide(m,bulk2.id,'validate');
  m.pile.forEach(x=>{x.status='closed';});
  const titres=m.card.main.filter(x=>x.title===true).length;
  if(mesure) mesure.bookingMs+=Date.now()-t0;
  const t1=Date.now();
  const ev=mgmtAgendaJouer(m);
  if(mesure) mesure.combatsMs+=Date.now()-t1;
  const compte={jouee:!!ev,k,prolonges,resignes,recrues,refus,reclames,tetes,titres,champions:{avant:champAvant,apres:mgmtPredecesseurChampions(m)},decouvert:m.treasury<0,evenement:ev||null};
  if(!ev) return compte;
  mgmtNewPile(m);
  return compte;
}
/* ==== [FIN ANCRE] ==== */
