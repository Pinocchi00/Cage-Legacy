"use strict";
/* ==== [ANCRE: DUO_T1_MOTEUR] — Duo T1, docs/lots/DUO-T1.md ==== */
/* Une partie Duo est une partie management normale en monde vivant : J1 (côté 'a') joue l'organisation de la partie (`m`),
   J2 (côté 'b') une des sept autres (`m.orgs[m.duo.b]`). Les soirées ordinaires des deux côtés sont jouées par le matchmaker
   automatique ; tous les MGMT_DUO_PERIODE jours, une super carte de six combats J1 contre J2.
   Aucun DOM, aucun Math.random(), rien d'affiché ici. Toute lecture ou écriture du côté 'b' passe par mgmtDuoAvec. */

const MGMT_DUO_PERIODE=91;          // décision d'Anthony du 18/10/2026 : tous les trois mois
const MGMT_DUO_COMBATS=6;           // six combats, le dernier en cinq rounds
const MGMT_DUO_CARTES_SAISON=4;     // une saison = un an = quatre super cartes
const MGMT_DUO_NOM_MAX=16;          // longueur d'un nom de joueur
const MGMT_DUO_GAIN={vainqueur:200,perdant:50,nul:125};   // k€ — la super carte rapporte le plus au vainqueur
const MGMT_DUO_ETAPES=['attente','encheres','draft','pret','soiree','bilan'];
const MGMT_DUO_PAS_MAX=20;          // garde-fou de mgmtDuoAvancer

/** Vrai si la partie est une partie Duo. @returns {boolean} */
function mgmtDuoActif(m){
  return !!(m&&m.duo&&typeof m.duo==='object');
}

/** La partie d'un côté : `m` pour 'a', l'organisation vivante de J2 pour 'b', sinon null. @returns {?object} */
function mgmtDuoPartie(m,cote){
  if(!mgmtDuoActif(m)) return null;
  if(cote==='a') return m;
  if(cote==='b') return (m.orgs&&m.orgs[m.duo.b])||null;
  return null;
}

/** Exécute `fn(partie)` avec G.mgmt posé sur la partie du côté demandé, et rend G.mgmt à J1 dans tous les cas.
 *  @returns {*} le résultat de `fn` */
function mgmtDuoAvec(m,cote,fn){
  try{
    G.mgmt=mgmtDuoPartie(m,cote);
    return fn(G.mgmt);
  }finally{
    G.mgmt=m;
  }
}

/** Le côté opposé. @returns {string} */
function mgmtDuoAutre(cote){
  return cote==='a'?'b':'a';
}

/** Pose `m.duo`. Refuse (sans rien toucher) hors monde vivant, pour une organisation inconnue ou celle de la partie.
 *  @param {object} m @param {string} orgIdB identifiant de l'organisation de J2 @param {{a:string,b:string}} [noms]
 *  @returns {boolean} */
function mgmtDuoCreer(m,orgIdB,noms){
  if(!m||m.mondeVivant!==true||!m.orgs||!m.orgs[orgIdB]) return false;
  if(orgIdB===mgmtPredecesseurOrgId(m)) return false;
  const valeurs=noms||{};
  const nom=(x,defaut)=>String(x==null?'':x).trim().slice(0,MGMT_DUO_NOM_MAX)||defaut;
  m.duo={
    v:1,
    b:orgIdB,
    noms:{a:nom(valeurs.a,'Joueur 1'),b:nom(valeurs.b,'Joueur 2')},
    periode:MGMT_DUO_PERIODE,
    prochaine:m.cal.jour+MGMT_DUO_PERIODE,
    etape:'attente',
    reperes:{ca:m.cycle,cb:m.orgs[orgIdB].cycle},
    draft:null,
    encheres:null,
    soiree:null,
    cartes:[],
    recrues:[]
  };
  return true;
}

/** Le jour de la prochaine soirée ordinaire de J1. @returns {number} */
function mgmtDuoProchaineSoiree(m){
  const p=m.cal&&m.cal.prochaines&&m.cal.prochaines[0];
  if(p&&Number.isFinite(p.jour)) return p.jour;
  return m.cal.jour+MGMT_EVENT_WEEKS*7;
}

/** Qui commence : le perdant de la dernière super carte ; à la première carte ou après une égalité, J2 (J1 a choisi son organisation en premier). @returns {string} */
function mgmtDuoPremier(m){
  const derniere=m.duo.cartes[m.duo.cartes.length-1];
  if(derniere&&derniere.gagnant==='b') return 'a';
  return 'b';
}

/** Ouvre le draft : le perdant de la dernière carte place le premier. */
function mgmtDuoDraftOuvrir(m){
  const premier=mgmtDuoPremier(m);
  m.duo.draft={premier,tour:premier,attente:'place',combats:[]};
}

/** Un pas du temps : soit la soirée ordinaire de J1 (et, avec elle, celles des sept organisations), soit l'ouverture du draft
 *  quand la super carte est due. La caisse des deux joueurs reste stable pendant les soirées ordinaires.
 *  @returns {{termine:boolean,jour?:number,cible?:number}} */
function mgmtDuoAvancerPas(m){
  if(G.mgmt!==m||!mgmtDuoActif(m)||m.duo.etape!=='attente') return {termine:true};
  if(mgmtDuoProchaineSoiree(m)<=m.duo.prochaine){
    const caisseA=m.treasury;
    const caisseB=mgmtDuoPartie(m,'b').treasury;
    const compte=mgmtPredecesseurSoiree(m,m.eventsPlayed,mgmtPredecesseurReglages(mgmtPredecesseurOrgId(m)));
    m.treasury=caisseA;
    mgmtDuoPartie(m,'b').treasury=caisseB;
    if(!compte||compte.jouee!==false) return {termine:false,jour:m.cal.jour,cible:m.duo.prochaine};
  }
  m.cal.jour=Math.max(m.cal.jour,m.duo.prochaine);
  mgmtAdvanceRosterAges(m);
  const lots=mgmtDuoLots(m);
  if(lots.length>0){
    const premier=mgmtDuoPremier(m);
    m.duo.etape='encheres';
    m.duo.encheres={i:0,premier,lots:lots.map(l=>Object.assign(l,{prix:0,meneur:null,tour:premier,passes:0,fini:false,gagnant:null}))};
  }else{
    m.duo.etape='draft';
    mgmtDuoDraftOuvrir(m);
  }
  saveMgmt();
  return {termine:true};
}

/** Tous les pas jusqu'à l'ouverture du draft (tests, outils). @returns {{termine:boolean}} */
function mgmtDuoAvancer(m){
  let r={termine:true};
  for(let i=0;i<MGMT_DUO_PAS_MAX;i++){
    r=mgmtDuoAvancerPas(m);
    if(r.termine) return r;
  }
  return r;
}

/* ==== [ANCRE: DUO_T1_DRAFT] — « je place, tu réponds » ==== */

/** Les combattants disponibles d'un côté, hors ceux déjà placés dans le draft : copies `{id,name,div,W,L,D,age,rang}`,
 *  par catégorie, puis rang (sans rang en dernier), puis identifiant. @returns {Array} */
function mgmtDuoDisponibles(m,cote){
  const pris=new Set();
  const draft=m.duo.draft;
  for(const c of (draft?draft.combats:[])){
    if(c[cote]) pris.add(c[cote]);
  }
  const ordre=allDivisions().map(d=>d.id);
  return mgmtDuoAvec(m,cote,partie=>{
    const lignes=[];
    for(const f of partie.roster){
      if(mgmtIsRetired(f)||pris.has(f.id)||!mgmtAvailable(partie,f,null)) continue;
      const rang=mgmtDivisionRank(partie,f,'organization');
      lignes.push({id:f.id,name:f.name,div:f.div,W:f.W,L:f.L,D:f.D,age:f.age,rang:Number.isFinite(rang)&&rang>0?rang:null});
    }
    lignes.sort((x,y)=>{
      const d=ordre.indexOf(x.div)-ordre.indexOf(y.div);
      if(d!==0) return d;
      const rx=x.rang===null?Infinity:x.rang, ry=y.rang===null?Infinity:y.rang;
      if(rx!==ry) return rx<ry?-1:1;
      return x.id<y.id?-1:x.id>y.id?1:0;
    });
    return lignes;
  });
}

/** Les disponibles d'un côté dont la catégorie a au moins un disponible en face. @returns {Array} */
function mgmtDuoPlacables(m,cote){
  const enFace=new Set(mgmtDuoDisponibles(m,mgmtDuoAutre(cote)).map(f=>f.div));
  return mgmtDuoDisponibles(m,cote).filter(f=>enFace.has(f.div));
}

/** Le joueur dont c'est le tour place un combattant : un combat naît, l'autre doit répondre. @returns {boolean} */
function mgmtDuoPlacer(m,id){
  if(!mgmtDuoActif(m)||m.duo.etape!=='draft'||!m.duo.draft||m.duo.draft.attente!=='place') return false;
  const draft=m.duo.draft;
  const ligne=mgmtDuoPlacables(m,draft.tour).find(f=>f.id===id);
  if(!ligne) return false;
  const autre=mgmtDuoAutre(draft.tour);
  draft.combats.push({place:draft.tour,[draft.tour]:id,[autre]:null,div:ligne.div});
  draft.tour=autre;
  draft.attente='reponse';
  saveMgmt();
  return true;
}

/** L'autre joueur répond dans la même catégorie. Au sixième combat le draft est prêt ; sinon celui qui vient de répondre
 *  place le suivant. @returns {boolean} */
function mgmtDuoRepondre(m,id){
  if(!mgmtDuoActif(m)||m.duo.etape!=='draft'||!m.duo.draft||m.duo.draft.attente!=='reponse') return false;
  const draft=m.duo.draft;
  const combat=draft.combats[draft.combats.length-1];
  const ligne=mgmtDuoDisponibles(m,draft.tour).find(f=>f.id===id);
  if(!combat||!ligne||ligne.div!==combat.div) return false;
  combat[draft.tour]=id;
  if(draft.combats.length===MGMT_DUO_COMBATS){
    m.duo.etape='pret';
    draft.attente=null;
  }else{
    draft.attente='place';
  }
  saveMgmt();
  return true;
}

/** Défait le dernier geste du draft : une réponse, ou un placement. Depuis 'pret', défait la dernière réponse.
 *  @returns {boolean} faux s'il n'y a rien à défaire */
function mgmtDuoAnnuler(m){
  if(!mgmtDuoActif(m)||!m.duo.draft) return false;
  const draft=m.duo.draft;
  const etape=m.duo.etape;
  if(etape!=='draft'&&etape!=='pret') return false;
  const dernier=draft.combats[draft.combats.length-1];
  if(!dernier) return false;
  if(etape==='pret'||draft.attente==='place'){
    dernier[draft.tour]=null;
    draft.attente='reponse';
    m.duo.etape='draft';
  }else{
    draft.combats.pop();
    draft.tour=dernier.place;
    draft.attente='place';
  }
  saveMgmt();
  return true;
}

/* ==== [ANCRE: DUO_T1_COMBAT] — le combat entre deux organisations ==== */

/** Vrai si les six combats du draft sont jouables des deux côtés. @returns {boolean} */
function mgmtDuoPret(m){
  const draft=m.duo.draft;
  if(!draft||draft.combats.length!==MGMT_DUO_COMBATS) return false;
  const sous=mgmtDuoPartie(m,'b');
  for(const c of draft.combats){
    const fa=mgmtFighterById(m,c.a), fb=mgmtFighterById(sous,c.b);
    if(!fa||!fb) return false;
    if(!mgmtAvailable(m,fa,null)||!mgmtAvailable(sous,fb,null)) return false;
  }
  return true;
}

/** Joue les six combats, applique les suites de chaque côté, verse l'argent, archive la carte et sauvegarde, avant tout
 *  affichage. Rien n'est muté si un combat n'est plus jouable. @returns {?object} la carte archivée, ou null */
function mgmtDuoJouer(m){
  if(G.mgmt!==m||!mgmtDuoActif(m)||m.duo.etape!=='pret'||!mgmtDuoPret(m)) return null;
  const sous=mgmtDuoPartie(m,'b');
  const combats=[];
  const idsA=[], idsB=[];
  let victoiresA=0, victoiresB=0;
  m.duo.draft.combats.forEach((c,i)=>{
    const fa=mgmtFighterById(m,c.a), fb=mgmtFighterById(sous,c.b);
    const rounds=i===MGMT_DUO_COMBATS-1?5:3;
    const traceA=mgmtTraceSide(fa), traceB=mgmtTraceSide(fb);
    const seed=SEED;
    const ra=mgmtDuoAvec(m,'a',p=>mgmtFightReady(fa,p.cycle));
    const rb=mgmtDuoAvec(m,'b',p=>mgmtFightReady(fb,p.cycle));
    const res=simulateFight(ra,rb,rounds);
    const famille=mgmtMethodFamily(res.method,res.winner);
    const round=Number.isSafeInteger(res.round)?res.round:rounds;
    const t={c:m.cycle,slot:'main',seed,rounds,a:traceA,b:traceB,winner:res.winner,family:famille,round,
      duo:{b:m.duo.b,ca:m.cycle,cb:sous.cycle},s:mgmtReleveDeResultat(res,rounds)};
    m.hist.push(t);
    const h=m.hist.length-1;
    sous.hist.push(Object.assign(JSON.parse(JSON.stringify(t)),{c:sous.cycle}));
    mgmtDuoAvec(m,'a',p=>mgmtApplyFight(p,fa,fb,res,'A'));
    mgmtDuoAvec(m,'b',p=>mgmtApplyFight(p,fb,fa,res,'B'));
    mgmtRangsInvalider(m);
    mgmtRangsInvalider(sous);
    if(res.winner==='A') victoiresA++;
    else if(res.winner==='B') victoiresB++;
    idsA.push(c.a);
    idsB.push(c.b);
    combats.push({a:c.a,b:c.b,na:fa.name,nb:fb.name,div:c.div,winner:res.winner,family:famille,round,rounds,h});
  });
  mgmtDuoAvec(m,'a',p=>mgmtContratsApresSoiree(p,idsA));
  mgmtDuoAvec(m,'b',p=>mgmtContratsApresSoiree(p,idsB));
  const gagnant=victoiresA>victoiresB?'a':victoiresB>victoiresA?'b':'nul';
  const gain=cote=>gagnant==='nul'?MGMT_DUO_GAIN.nul:(gagnant===cote?MGMT_DUO_GAIN.vainqueur:MGMT_DUO_GAIN.perdant);
  const carte={n:m.duo.cartes.length+1,jour:m.cal.jour,combats,gagnant,gains:{a:gain('a'),b:gain('b')}};
  m.duo.cartes.push(carte);
  m.treasury+=carte.gains.a;
  sous.treasury+=carte.gains.b;
  m.duo.reperes={ca:m.cycle,cb:sous.cycle};
  m.duo.prochaine+=m.duo.periode;
  m.duo.draft=null;
  m.duo.etape='soiree';
  m.duo.soiree={i:0};
  saveMgmt();
  return carte;
}

/** Passe au combat suivant de la soirée ; après le sixième, le bilan. */
function mgmtDuoSoireeSuivante(m){
  if(!mgmtDuoActif(m)||m.duo.etape!=='soiree'||!m.duo.soiree) return;
  m.duo.soiree.i++;
  if(m.duo.soiree.i>=MGMT_DUO_COMBATS) m.duo.etape='bilan';
  saveMgmt();
}

/** Referme le bilan : retour à l'attente de la prochaine super carte. */
function mgmtDuoTerminer(m){
  if(!mgmtDuoActif(m)||m.duo.etape!=='bilan') return;
  m.duo.etape='attente';
  m.duo.soiree=null;
  saveMgmt();
}

/** Rejoue un combat de super carte avec les deux organisations : la RNG est remise à la graine de la trace avant les deux
 *  profils (même ordre qu'au combat) ; SEED et G.mgmt sont rendus dans tous les cas. @returns {?object} le résultat du moteur */
function mgmtDuoRejouer(t){
  if(!t||!t.duo||!G.mgmt) return null;
  const m=G.mgmt;
  if(!mgmtDuoActif(m)||!m.orgs||!m.orgs[t.duo.b]) return null;
  const sauvee=SEED;
  try{
    setSeed(t.seed);
    const ra=mgmtDuoAvec(m,'a',()=>mgmtFightReady(mgmtTraceLine(t.a),t.duo.ca));
    const rb=mgmtDuoAvec(m,'b',()=>mgmtFightReady(mgmtTraceLine(t.b),t.duo.cb));
    return simulateFight(ra,rb,t.rounds);
  }finally{
    setSeed(sauvee);
    G.mgmt=m;
  }
}

/* ==== [ANCRE: DUO_T1_LECTURES] — lectures pures pour les écrans ==== */

/** Le score : saison en cours (une saison = quatre cartes), numéro de la prochaine carte, cartes gagnées dans la saison et
 *  au total. @returns {{saison:number,numero:number,a:number,b:number,total:{a:number,b:number}}} */
function mgmtDuoScore(m){
  const cartes=m.duo.cartes;
  const debut=Math.floor(cartes.length/MGMT_DUO_CARTES_SAISON)*MGMT_DUO_CARTES_SAISON;
  const saison=cartes.slice(debut);
  const gagnees=(liste,cote)=>liste.filter(c=>c.gagnant===cote).length;
  return {saison:Math.floor(cartes.length/MGMT_DUO_CARTES_SAISON)+1,numero:saison.length+1,
    a:gagnees(saison,'a'),b:gagnees(saison,'b'),total:{a:gagnees(cartes,'a'),b:gagnees(cartes,'b')}};
}

/** Ce qui s'est passé dans la partie d'un côté depuis la dernière super carte : les douze combats les plus récents (hors
 *  super cartes), le nombre de soirées et les champions de chaque catégorie. @returns {{soirees:number,combats:Array,champions:Array}} */
function mgmtDuoResume(m,cote){
  const repere=cote==='a'?m.duo.reperes.ca:m.duo.reperes.cb;
  return mgmtDuoAvec(m,cote,partie=>{
    const traces=(partie.hist||[]).filter(t=>t.slot==='main'&&t.c>repere&&!t.duo).reverse();
    const combats=traces.slice(0,12).map(t=>({a:t.a.name,b:t.b.name,div:t.a.div,winner:t.winner,family:t.family,round:t.round,rounds:t.rounds}));
    const champions=allDivisions().map(d=>{
      const f=mgmtSplitTitle(partie,d.id);
      return {div:d.id,id:(f&&f.id)||null,nom:(f&&f.name)||null};
    });
    return {soirees:new Set(traces.map(t=>t.c)).size,combats,champions};
  });
}

/* ==== [ANCRE: MONDE_LOT_19_T7_EFFECTIF] — Monde lot 19 T7 ==== */
/** Lecture pure de l'effectif d'un joueur. @returns {Array<object>} */
function mgmtDuoEffectif(m,cote,divId){
  return mgmtDuoAvec(m,cote,partie=>{
    const classe=mgmtDivisionRanking(partie,divId,'organization');
    const rangs=new Map(classe.map((f,i)=>[f.id,i+1]));
    return (partie.roster||[]).filter(f=>f.div===divId).map(f=>{
      const rang=rangs.has(f.id)?rangs.get(f.id):null;
      let etat='dispo';
      if(f.susp>=partie.cycle) etat='blesse';
      else if(f.libre) etat='libre';
      else if(mgmtContratIndispo(partie,f)) etat='refuse';
      const forme=mgmtResultatsDetail(partie,f).slice(0,3).reverse().map(r=>r.issue==='win'?'v':r.issue==='loss'?'d':'n');
      return {id:f.id,name:f.name,rang,W:f.W||0,L:f.L||0,D:f.D||0,age:f.age,etat,restants:mgmtContratRestants(f),forme};
    }).sort((a,b)=>(a.rang==null?Infinity:a.rang)-(b.rang==null?Infinity:b.rang));
  });
}

/* ==== [ANCRE: DUO_T2_ENCHERES] — Duo T2, docs/lots/DUO-T2.md ==== */
const MGMT_DUO_LOTS=3;            // combattants mis aux enchères par super carte
const MGMT_DUO_CONTRAT=3;         // combats du contrat signé
const MGMT_DUO_PALIER=0.10;       // le palier = 10 % du prix d'ouverture, arrondi au-dessus, au moins 1 k€

/** Les combattants mis aux enchères : le premier recrutable (ordre du classement mondial) de chaque catégorie qui n'est pas de l'organisation de J2, les
 *  meilleurs d'abord ; le prix d'ouverture est la valeur du contrat (3 × la bourse demandée, décision du 18/10/2026). Exige G.mgmt===m.
 *  @returns {Array<{id:string,name:string,div:string,orgId:string,rang:number,b:number,ouverture:number,pas:number}>} */
function mgmtDuoLots(m){
  const retenus=[];
  for(const d of allDivisions()){
    for(const r of mgmtRecrutables(m,d.id)){
      const f=mgmtExteriorCombattant(m,r.id);
      if(!f||f.orgId===m.duo.b) continue;
      retenus.push({id:f.id,name:f.name,div:d.id,orgId:f.orgId,rang:r.rang,star:mgmtStar(f)});
      break;
    }
  }
  retenus.sort((x,y)=>x.rang-y.rang||y.star-x.star||(x.id<y.id?-1:x.id>y.id?1:0));
  return retenus.slice(0,MGMT_DUO_LOTS).map(l=>{
    const b=mgmtBourseSouhaitee(m,mgmtExteriorPourOffre(m,l.id),false);
    const ouverture=MGMT_DUO_CONTRAT*b;
    return {id:l.id,name:l.name,div:l.div,orgId:l.orgId,rang:l.rang,b,ouverture,pas:Math.max(1,Math.ceil(ouverture*MGMT_DUO_PALIER))};
  });
}

/** Le lot courant des enchères, ou null. @returns {?object} */
function mgmtDuoLotCourant(m){
  const e=mgmtDuoActif(m)&&m.duo.etape==='encheres'?m.duo.encheres:null;
  return e&&e.lots[e.i]?e.lots[e.i]:null;
}

/** Le joueur dont c'est le tour mise : l'ouverture d'abord, puis un palier de plus que le meneur. Refusé si sa caisse ne peut pas suivre.
 *  @returns {{ok:boolean,prix?:number,raison?:string}} */
function mgmtDuoMiser(m){
  const L=mgmtDuoLotCourant(m);
  if(!L) return {ok:false,raison:'etape'};
  const prix=L.meneur===null?L.ouverture:L.prix+L.pas;
  const peut=mgmtDuoAvec(m,L.tour,partie=>mgmtCanAfford(partie,prix));
  if(!peut) return {ok:false,raison:'caisse'};
  L.prix=prix;
  L.meneur=L.tour;
  L.passes=0;
  L.tour=mgmtDuoAutre(L.tour);
  saveMgmt();
  return {ok:true,prix};
}

/** Le joueur dont c'est le tour passe : si l'autre mène, il signe le combattant ; deux passes sans mise laissent le combattant libre. */
function mgmtDuoPasser(m){
  const L=mgmtDuoLotCourant(m);
  if(!L) return;
  if(L.meneur!==null){
    mgmtDuoAdjuger(m,L);
  }else{
    L.passes++;
    if(L.passes<2){
      L.tour=mgmtDuoAutre(L.tour);
      saveMgmt();
      return;
    }
    L.fini=true;
  }
  mgmtDuoLotSuivant(m);
}

/** Passe au lot suivant ; après le dernier, le draft s'ouvre. */
function mgmtDuoLotSuivant(m){
  const e=m.duo.encheres;
  e.i++;
  if(e.i>=e.lots.length){
    m.duo.etape='draft';
    m.duo.encheres=null;
    mgmtDuoDraftOuvrir(m);
  }
  saveMgmt();
}

/** Le meneur gagne le lot au prix mené ; si le transfert échoue (plus libre, plus là), le lot finit sans gagnant et rien n'est payé. */
function mgmtDuoAdjuger(m,L){
  L.fini=true;
  if(mgmtDuoTransferer(m,L.id,L.meneur,L.prix)) L.gagnant=L.meneur;
}

/** Le combattant libre entre dans la partie du côté, avec un contrat de trois combats à la bourse qu'il demande à son nouvel employeur ; le prix sort
 *  de la caisse de cette organisation. Réutilise mgmtRecruterVivant (jamais un second marché). @returns {boolean} */
function mgmtDuoTransferer(m,id,cote,prix){
  const cible=mgmtDuoPartie(m,cote);
  const f=mgmtExteriorCombattant(m,id);
  if(!cible||!f||f.libre!==true) return false;
  if(cote==='b'&&f.orgId===m.duo.b) return false;
  const ligne=mgmtRecruterVivant(m,id,cible);
  if(!ligne) return false;
  mgmtDuoAvec(m,cote,partie=>{
    const bourse=mgmtBourseSouhaitee(partie,ligne,false);
    ligne.ct={n:MGMT_DUO_CONTRAT,f:0,b:bourse,since:partie.cycle};
    delete ligne.libre;
    partie.treasury-=prix;
    mgmtAddFact(partie,{c:partie.cycle,k:'contrat',a:id});
    mgmtRangsInvalider(partie);
  });
  if(!Array.isArray(m.duo.recrues)) m.duo.recrues=[];
  m.duo.recrues.push({n:m.duo.cartes.length+1,id,name:ligne.name,cote,prix});
  if(m.duo.recrues.length>200) m.duo.recrues.shift();
  return true;
}
