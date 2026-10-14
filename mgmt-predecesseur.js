"use strict";
/* ==== [ANCRE: MONDE_LOT1_T2_PREDECESSEUR] — Monde lot 1 T2 ====
   Le joueur automatique de l'outil de mesure (tools/mesure-management.js, lot 7.1 des corrections du 08/10/2026) devient une fonction du jeu :
   il joue UNE soirée de la partie qu'on lui donne, sans écran. L'outil l'appelle au lieu de la recopier.
   Il ne recrute pas, ignore les affaires (il les ferme), et n'utilise pas mgmtAgendaProposer : les chiffres qu'il produit sont des ordres de grandeur.
   Le corps est le code de partie() de l'outil déplacé tel quel : mêmes appels, même ordre, mêmes bornes. L'ordre d'appel fixe la graine consommée —
    rien ne se réordonne dans le joueur historique. T1 du lot 5 tire seulement la taille de la carte héritée via rnd(). T2 répond aux demandes du passé par opt-in, sans tirage.
   Le moteur lit G.mgmt (mgmtFightReady, mgmtSel, saveMgmt) : la fonction ne pose jamais G, elle exige G.mgmt === m. */

/** Les réglages du prédécesseur. titreCadence — le titre se met en jeu quand k % titreCadence === 0
 *  (2 = une soirée sur deux, 0 = jamais d'initiative). Les autres clés ne sont là que si la politique de l'organisation
 *  les demande (voir mgmtPredecesseurPolitique) ; absentes, le joueur joue comme avant.
 *  @param {string} [orgId] identifiant d'organisation : sa politique vient alors s'ajouter à l'historique.
 *  Sans argument, l'objet historique INCHANGÉ — c'est le défaut de l'outil de mesure (tools/mesure-management.js,
 *  comparaison d'outillage du lot 1 T2) : il ne doit pas bouger.
 *  @returns {object} un objet neuf à chaque appel. */
function mgmtPredecesseurReglages(orgId){ return Object.assign({titreCadence:2}, mgmtPredecesseurPolitique(orgId)); }

/* ==== [ANCRE: MONDE_LOT2_T3_MAIN_PREDECESSEUR] — Monde lot 2 T3 : la main du prédécesseur ====
   Les quatre choix que l'identité de chaque organisation porte en `main` (MGMT_ORG_IDENTITES[id].main,
   mgmt-organisations-identites-data.js) deviennent la politique de son PRÉDÉCESSEUR dans mgmtPredecesseurSoiree.
   Ils ne sont jamais une règle du joueur : rien ici n'est lu par un écran, et aucun écran n'est créé.
   Table du superviseur du 14/10/2026 : « normal », « equilibre », « jamais » reproduisent EXACTEMENT le comportement
   actuel ; les autres valeurs le déplacent d'un cran. Aucun réglage n'est une exclusion (le plus jeune ou le plus âgé
   passe devant à SCORE ÉGAL, jamais à la place d'un autre choix), et rien n'est tiré : même graine, même résultat.
   Ces réglages ne valent que là où le prédécesseur agit : le passé (mgmt-passe.js) et la carte héritée. ==== */

/** Les quatre choix de la main, traduits en réglages. Valeur '' ou 0 : le comportement historique, la clé n'est pas rendue.
 *  Une valeur inconnue d'une fiche rend l'historique aussi — une fiche evolves ne casse pas le joueur automatique. */
const MGMT_PREDECESSEUR_MAIN={
  titres:{'souvent':1,'normal':2,'rarement':4},
  jeunes:{'fait-monter':'jeune','equilibre':'','protege-anciens':'ancien'},
  noms:{'souvent':1,'parfois':2,'jamais':0},
  contrats:{'garde':'garde','normal':'','laisse-filer':'laisse-filer'},
};

/** Les réglages que la main d'une organisation AJOUTE à l'historique ; objet vide si la fiche est inconnue. Pur.
 *  - titres : la cadence des titres en jeu (souvent 1, normal 2, rarement 4 soirées).
 *  - jeunes : le départage des égalités de score dans le choix de la carte (le plus jeune ou le plus âgé passe devant).
 *  - noms : la cadence du recrutement de noms connus (souvent chaque soirée, parfois une soirée sur deux, jamais jamais).
 *  - contrats : `garde` re-signe et renouvelle plus tôt, `laisse-filer` laisse partir — sauf le champion en titre.
 *  @param {string} [orgId] @returns {object} */
function mgmtPredecesseurPolitique(orgId){
  const fiche=orgId&&mgmtOrgIdentite(orgId), main=fiche&&fiche.main;
  if(!main) return {};
  const out={titreCadence:MGMT_PREDECESSEUR_MAIN.titres[main.titres]||2};
  const jeunes=MGMT_PREDECESSEUR_MAIN.jeunes[main.jeunes];
  if(jeunes) out.agePrefere=jeunes;
  const noms=MGMT_PREDECESSEUR_MAIN.noms[main.noms];
  if(noms) out.nomsCadence=noms;
  const contrats=MGMT_PREDECESSEUR_MAIN.contrats[main.contrats];
  if(contrats==='garde'){ out.renouvelle=true; out.contratSeuil=2; }
  /* On ne laisse pas filer la ceinture : le champion reste renewé et re-signé comme avant. */
  if(contrats==='laisse-filer'){ out.renouvelle=false; out.laisseFiler=true; }
  return out;
}

/** L'identifiant d'organisation de la partie. m.org est un NOM : on passe par mgmtOrgNom puis mgmtOrgParNom,
 *  jamais par m.org comme identifiant. @param {object} m @returns {string|null} */
function mgmtPredecesseurOrgId(m){ const o=mgmtOrgParNom(mgmtOrgNom(m)); return (o&&o.id)||null; }

/** Un combattant porte-t-il une ceinture de l'organisation ? (le champion en titre d'une catégorie)
 *  @param {object} m @param {object} f @returns {boolean} */
function mgmtPredecesseurCeinture(m,f){ return !!f&&mgmtPredecesseurChampions(m).indexOf(f.id)>=0; }

/** Le départage des égalités de score du choix de la carte (monde lot 2 T3, main « jeunes ») : le plus jeune passe devant
 *  pour `fait-monter`, le plus âgé pour `protege-anciens`, et RIEN pour l'équilibre — le tri reste celui d'avant.
 *  Un score n'est jamais changé, aucun combattant n'est écarté : seul l'ordre change, et seulement à score égal.
 *  @param {object} x @param {object} y @param {object} cfg @returns {number} */
function departageAge(x,y,cfg){
  if(cfg.agePrefere==='jeune') return (x.age||0)-(y.age||0);
  if(cfg.agePrefere==='ancien') return (y.age||0)-(x.age||0);
  return 0;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE_LOT1_T4BIS_PREDECESSEUR] — Monde lot 1 T4 bis : un matchmaker raisonnable garde ses combattants sous contrat et fait entrer des jeunes.
   Réglages OPT-IN (mgmtPredecesseurReglages garde ses défauts : l'outil de mesure et ses repères ne bougent pas) : `renouvelle` re-signe tout sans-contrat de l'effectif
   (la cause des 45 % de sans-contrat au premier jour : le jeu les laisse partir après une longue attente, et le prédécesseur ne les reprenait jamais) ;
   `recrues` fait entrer, par le mécanisme d'arrivée existant (le vivier : mgmtRecrutables, puis mgmtContratSigner qui appelle mgmtRecruter), le meilleur jeune
   de la catégorie quand elle est sous son plan — une catégorie sur `pas` à chaque soirée, à partir de la soirée `depuis`. Aucun tirage de la RNG. ==== */
/** Re-signe les sans-contrat de l'effectif (3 combats, à la bourse qu'ils demandent). `pilote`, si fourni, ne garde que
 *  les combattants qu'il accepte — le lot 2 T3 s'en sert pour ne pas laisser filer le champion en titre. @returns {number} les signatures acceptées. */
function mgmtPredecesseurResigne(m,pilote){
  let n=0;
  for(const f of m.roster){
    if(!f.libre||mgmtIsRetired(f)) continue;
    if(pilote&&!pilote(f)) continue;
    const r=mgmtContratSigner(m,f.id,3,mgmtBourseSouhaitee(m,f,false));
    if(r.ok) n++;
  }
  return n;
}
/** Fait entrer des jeunes du vivier dans les catégories sous leur plan. cfg : {depuis,pas,parSoiree,ageMax,fin,finAgeMax,plan:{divId:nombre},renom}.
 *  `renom` (lot 2 T3 : la main « recrute des noms ») remplace le critère d'âge par le renom — le plus connu du vivier
 *  prend la place, tous âges confondus : une vedette n'est pas un jeune. Même fonction, même mécanisme, un critère de plus.
 *  @returns {number} les recrues. */
function mgmtPredecesseurRecrute(m,k,cfg){
  if(!cfg||k<cfg.depuis) return 0;
  let n=0;
  allDivisions().forEach((d,i)=>{
    if((k+i)%cfg.pas!==0) return;
    /* Les dernières soirées, la catégorie encore sous son plan prend aussi des combattants plus âgés (finAgeMax) : l'effectif reste celui du plan. */
    const ageMax=k>=cfg.fin?cfg.finAgeMax:cfg.ageMax;
    for(let j=0;j<cfg.parSoiree;j++){
      /* Une place libre, ce n'est pas la place d'un recrue attendue : c'est une place LAISSÉE par quelqu'un — parti sans contrat, ou retiré.
         C'est ce qui distingue la main « recrute des noms » du recrutement de jeunes, qui remplit les places prévues par le plan du passé. */
      const dispo=mgmtRecrutables(m,d.id);
      const x=cfg.renom?(m.roster.some(f=>f.div===d.id&&(f.libre||mgmtIsRetired(f)))?dispo.reduce((meilleur,y)=>(meilleur&&mgmtStar(meilleur)>=mgmtStar(y)?meilleur:y),null):null)
                       :(m.roster.filter(f=>f.div===d.id&&!mgmtIsRetired(f)).length<(cfg.plan[d.id]||0)?dispo.find(y=>y.age<=ageMax):null);
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
 * limite borne la carte sans jeter de combats ; contrats ajoute seulement la garde de l'héritage.
 * reclamations, si fourni, est le relevé public précédant les réponses de cette soirée. */
function mgmtPredecesseurBooker(m,k,cfg,limite,contrats,reclamations){
  const cad=cfg.titreCadence, plafond=Math.min(limite,m.card.sizeMain);
  const admissible=f=>!contrats||!!(f&&!f.libre&&mgmtContratRestants(f)>0);
  /* Monde lot 9 T1 : chemin direct — on lit le roster filtré sans construire la liste préparée pour l'écran (mgmtCartRows).
     Même tri que mgmtCartRows (catégorie puis rang mémorisé), même rang, sans produire la vue d'écran. */
  const _order=allDivisions().map(d=>d.id);
  const _dx=o=>{ const i=_order.indexOf(o.div); return i<0?_order.length:i; };
  const _rangs=new Map();
  const _lignes=m&&Array.isArray(m.roster)?m.roster.filter(o=>o&&!mgmtIsRetired(o)):[];
  for(const o of _lignes) _rangs.set(o,mgmtDivisionRank(m,o)||0);
  _lignes.sort((x,y)=>{ const a=_dx(x), b=_dx(y); if(a!==b) return a-b; const rx=_rangs.get(x), ry=_rangs.get(y); if(rx!==ry) return rx-ry; return x.id<y.id?-1:1; });
  let reclames=0, tetes=0;
  /* La carte principale : les combats réclamés d'abord, puis les meilleures têtes d'affiche de chaque catégorie. */
  /* ==== [ANCRE: MONDE_LOT5_T6_RECLAMATIONS_BOOKING] — Monde lot 5 T6 ==== */
  for(const r of reclamations||mgmtPublicReclame(m)){ if(m.card.main.length>=plafond) break; const a=mgmtFighterById(m,r.a), b=mgmtFighterById(m,r.b);
    if(a&&b&&admissible(a)&&admissible(b)&&a.div===b.div&&mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id)){ if(mgmtBookMain(m,a.id,b.id)) reclames++; } }
  const divs=[...new Set(_lignes.map(f=>f.div))];
  /* Décision du 12/10/2026 : le prédécesseur fait tourner les combats de titre. Une catégorie qui n'a qu'un règne (ou aucun) est servie d'abord, chaque soirée,
     et son titre est mis en jeu : le champion contre le mieux placé des autres. Aucune issue forcée : le moteur joue le combat. Opt-in : rotationTitres = la soirée à partir de laquelle il s'applique (la première moitié du passé n'est pas touchée). */
  /* Deux catégories par soirée au plus (le plafond des titres d'une carte) (à tour de rôle) : les têtes d'affiche des autres catégories gardent leurs places, la caisse d'une petite organisation aussi. */
  const manque=(Number.isSafeInteger(cfg.rotationTitres)&&k>=cfg.rotationTitres)?divs.filter(d=>mgmtCeintureLignee(m,d).reigns.length<2):[];
  const besoin=new Set(manque.length?[manque[k%manque.length],manque[(k+1)%manque.length]]:[]);
  const surCarte=d=>m.card.main.some(x=>{ const f=mgmtFighterById(m,x.a); return f&&f.div===d; });
  let essais=0;
  while(m.card.main.length<plafond&&essais++<60){
    const prio=[...besoin].find(d=>!surCarte(d)&&_lignes.filter(f=>f.div===d&&admissible(f)&&mgmtSelectable(m,f,null)).length>=2);
    const div=prio||divs[(k+m.card.main.length+essais)%divs.length];
    const rows=_lignes.filter(f=>f.div===div&&admissible(f)&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x)||departageAge(x,y,cfg));
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
  const cfg=Object.assign(mgmtPredecesseurReglages(mgmtPredecesseurOrgId(m)),reglages||{});
  const limite=2+Math.floor(rnd()*2);
  /* ==== [ANCRE: MONDE_LOT5_T3_PROVENANCE] — Monde lot 5 T3 ==== */
  const existants=new Set(m.card.main);
  const r=mgmtPredecesseurBooker(m,k,cfg,limite,true);
  for(const fight of m.card.main){ if(!existants.has(fight)) fight.herite=true; }
  return r.reclames+r.tetes;
}

/* ==== [ANCRE: MONDE_LOT5_T2_DEMANDES] — Monde lot 5 T2 ==== */
/** Répond une fois aux demandes ouvertes, sans écran ni tirage RNG. @param {object} m Partie courante ; exige G.mgmt===m. @returns {{promises:number,refusees:number}} Réponses effectivement enregistrées. */
function mgmtPredecesseurDemandes(m){
  if(typeof G==='undefined'||!G||G.mgmt!==m) throw new Error('mgmtPredecesseurDemandes : G.mgmt doit être la partie jouée');
  const demandes=mgmtDemandesOuvertes(m), compte={promises:0,refusees:0};
  const admissible=f=>!!(f&&!mgmtIsRetired(f)&&!f.libre&&mgmtContratRestants(f)>0);
  for(const d of demandes){
    const f=mgmtFighterById(m,d.a), cible=d.target&&mgmtFighterById(m,d.target);
    const promettre=admissible(f)&&(!d.target||(admissible(cible)&&cible.div===f.div));
    if(mgmtRepondreDemande(m,d.i,promettre?'promettre':'refuser')) compte[promettre?'promises':'refusees']++;
  }
  return compte;
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
   /* Lot 5 T2 : les réponses opt-in suivent les contrats et arrivées, avant pose et booking : elles jugent trois cycles futurs, pas la carte immédiate. */
  m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  /* Il prolonge à l'avance : un contrat à un combat de la fin est renouvelé sur trois combats, à la bourse que le combattant demande.
     Monde lot 2 T3 : `contratSeuil` (la main « garde », qui attend moins longtemps) et `laisseFiler` (qui ne laisse pas partir le champion). */
  const seuil=Number.isSafeInteger(cfg.contratSeuil)&&cfg.contratSeuil>1?cfg.contratSeuil:1;
  for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct) continue;
    if(cfg.laisseFiler===true&&!mgmtPredecesseurCeinture(m,f)) continue;
    const seuilCombats=cfg.laisseFiler===true&&mgmtPredecesseurCeinture(m,f)?Math.max(2,seuil):seuil;
    if(mgmtContratRestants(f)>seuilCombats) continue;
    const b=mgmtBourseSouhaitee(m,f,true); const r=mgmtContratRenouveler(m,f.id,3,b); if(r.ok) prolonges++; else if(refus[r.raison]!==undefined) refus[r.raison]++; }
  if(cfg.renouvelle===true) resignes=mgmtPredecesseurResigne(m);
  /* La main « laisse filer » : les sans-contrat partent, sauf le champion en titre — on ne lâche pas la ceinture. */
  else if(cfg.laisseFiler===true) resignes=mgmtPredecesseurResigne(m,f=>mgmtPredecesseurCeinture(m,f));
  if(cfg.recrues) recrues=mgmtPredecesseurRecrute(m,k,cfg.recrues);
   /* Monde lot 2 T3 : la main « recrute des noms » passe par la MÊME fonction de recrutement (critère `renom`), jamais par un second mécanisme.
      Le plan vient des recrues de jeunes quand le passé en donne un — sans plan, la catégorie est déjà à sa taille et rien n'entre. */
   if(cfg.nomsCadence&&k%cfg.nomsCadence===0) recrues+=mgmtPredecesseurRecrute(m,k,{renom:true,depuis:0,pas:1,parSoiree:1,plan:(cfg.recrues&&cfg.recrues.plan)||{}});
   /* ==== [ANCRE: MONDE_LOT5_T2_SOIREE_DEMANDES] — Monde lot 5 T2 ==== */
   /* ==== [ANCRE: MONDE_LOT5_T6_RECLAMATIONS_AVANT_REPONSES] — Monde lot 5 T6 ==== */
   /* Répondre ferme la demande, pas la réclamation déjà connue pour cette carte.
      Photographier celle-ci préserve le booking porté ; ses gardes restent appliquées. */
   const reclamations=cfg.demandes===true?mgmtPublicReclame(m):undefined;
   if(cfg.demandes===true) mgmtPredecesseurDemandes(m);
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite');
  const {reclames,tetes}=mgmtPredecesseurBooker(m,k,cfg,m.card.sizeMain,false,reclamations);
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
