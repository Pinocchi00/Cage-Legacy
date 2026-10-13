"use strict";
/* ==== [ANCRE: MONDE_LOT1_T3_PASSE] — Monde lot 1 T3 la génération des six ans, T4 le passage de témoin ====
   À la création d'une partie (écran Nouvelle partie seulement), l'organisation vit six ans sous la main du prédécesseur
   (mgmt-predecesseur.js) avant l'arrivée du joueur. Simulation pure et synchrone, aucun DOM : l'ÉCRAN appelle les pas un par un
   entre deux rafraîchissements pour que la barre avance.
     mgmtPassePreparer(orgId,opts)  → la partie à l'ouverture du passé (effectif six ans plus jeune), G.mgmt posé
     mgmtPasseSoiree(m,k)           → joue UNE soirée du passé, rend l'avancement {k,n,jouee,annee,termine}
     mgmtPasseCloturer(m)           → le temps (T3) et le passage de témoin (T4)
     mgmtPasseGenerer(orgId,opts)   → les trois d'un coup (tests, outils)
   Le temps (fiche T3 §3) : la partie du passé tourne en jours 0…2205 ; à la clôture le calendrier avance d'un cycle et tous les jours sont
   recalés de `origine` : cal.jour = 0 (12 janvier 2027, comme une partie sans passé), les soirées du passé ont des jours négatifs
   (février 2021 à décembre 2026). m.cycle, m.eventsPlayed et les identifiants ne bougent pas : la numérotation des soirées continue.
   Le passage de témoin (T4) : caisse, popularité et salles reprennent le profil de l'organisation ; contrats, blessures, attentes,
   faits, classements, ceintures et historique sont l'héritage.
   Aucun rnd() ici : les tirages viennent des fonctions du jeu appelées. m.passe est le seul champ ajouté à la partie. */

/** Les six ans : 62 soirées de MGMT_EVENT_WEEKS semaines (312 semaines). */
const MGMT_PASSE_SOIREES=62;
/** L'effectif naît reculé de six ans. */
const MGMT_PASSE_RECUL_ANS=6;
/** Les combats que les six ans apportent en moyenne à un combattant (mesuré : 62 soirées × 18 places / 362 combattants ≈ 3,1). */
const MGMT_PASSE_COMBATS_ATTENDUS=3;
/** Borne des jours négatifs et de l'origine acceptés par les validateurs (≈ 55 ans). */
const MGMT_PASSE_JOURS_MAX=20000;
/** T4 bis : les recrues entrent pendant les dernières soirées du passé (dix-huit : un an et demi), une catégorie sur trois à chaque soirée, des jeunes de 23 ans au plus. */
const MGMT_PASSE_FENETRE_RECRUES=4;
const MGMT_PASSE_RECRUES_PAS=1;
const MGMT_PASSE_RECRUES_PAR_SOIREE=4;
const MGMT_PASSE_RECRUES_AGE_MAX=23;
const MGMT_PASSE_RECRUES_FIN=2;
const MGMT_PASSE_RECRUES_FIN_AGE_MAX=27;

/** Les soirées jouées par le joueur : celles de la partie moins celles du passé. Pur. @returns {number} */
function mgmtSoireesJoueur(m){
  const joues=m&&Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0;
  const passe=m&&m.passe&&Number.isSafeInteger(m.passe.soirees)?m.passe.soirees:0;
  return Math.max(0,joues-passe);
}

/** Le champ m.passe est-il bien formé ? (validateMgmt et mgmtRepair) Pur. @returns {boolean} */
function mgmtPasseValide(p){
  if(!p||typeof p!=='object'||Array.isArray(p)) return false;
  if(!Number.isSafeInteger(p.soirees)||p.soirees<0||p.soirees>1000) return false;
  if(p.enCours!==undefined&&typeof p.enCours!=='boolean') return false;
  for(const k of ['nHist','nFacts']){ if(p[k]!==undefined&&(!Number.isSafeInteger(p[k])||p[k]<0)) return false; }
  if(p.origineJours!==undefined&&(!Number.isSafeInteger(p.origineJours)||p.origineJours<0||p.origineJours>MGMT_PASSE_JOURS_MAX)) return false;
  for(const k of ['reculAns','combatsAttendus']){ if(p[k]!==undefined&&(!Number.isSafeInteger(p[k])||p[k]<0||p[k]>50)) return false; }
  return true;
}

/** L'année civile de la soirée d'indice k (0 = la première) d'un passé de n soirées, une toutes les MGMT_EVENT_WEEKS semaines,
 *  la dernière à une cadence du premier jour du joueur. Pur. @returns {number} */
function mgmtPasseAnnee(n,k){
  const jours=MGMT_EVENT_WEEKS*7*(n-Math.max(0,Math.min(k,n-1)));
  return new Date(MGMT_CALENDRIER_DEBUT-jours*86400000).getUTCFullYear();
}

/** Ouvre le passé : la partie neuve dont l'effectif naît six ans plus jeune, posée comme partie courante (le moteur lit G.mgmt).
 *  Même enchaînement que la création sans passé (roster, pile, agenda) ; la graine de la partie est lue sur la RNG à cet instant.
 *  @param {string} orgId @param {{soirees?:number,reculAns?:number,combatsAttendus?:number}} [opts] @returns {object} la partie */
function mgmtPassePreparer(orgId,opts){
  const o=Object.assign({soirees:MGMT_PASSE_SOIREES,reculAns:MGMT_PASSE_RECUL_ANS,combatsAttendus:MGMT_PASSE_COMBATS_ATTENDUS},opts||{});
  if(typeof G==='undefined'||!G) G={theme:'dark'};
  const m=mgmtDefault(orgId);
  m.graine=mgmtGraineNeuve();
  const plan={};
  mgmtNewRoster(m,{reculAns:o.reculAns,combatsAttendus:o.combatsAttendus,sansJeunes:true,plan});
  mgmtNewPile(m);
  mgmtAgendaInit(m);
  m.passe={enCours:true,soirees:o.soirees,reculAns:o.reculAns,combatsAttendus:o.combatsAttendus,plan};
  G.mgmt=m;
  return m;
}

/** Joue UNE soirée du passé (la k-ième, de 0 à n−1). Si la soirée ne peut pas se jouer, le passé s'arrête là (termine, jouee:false).
 *  @returns {{k:number,n:number,jouee:boolean,termine:boolean,annee:number}} k = soirées faites après ce pas */
function mgmtPasseSoiree(m,k){
  const n=m.passe.soirees;
  /* T4 bis : il re-signe ses sans-contrat et recrute des jeunes en fin de passé (réglages opt-in du prédécesseur). */
  const reglages={renouvelle:true,rotationTitres:n-20,recrues:{depuis:Math.max(0,n-MGMT_PASSE_FENETRE_RECRUES),pas:MGMT_PASSE_RECRUES_PAS,parSoiree:MGMT_PASSE_RECRUES_PAR_SOIREE,ageMax:MGMT_PASSE_RECRUES_AGE_MAX,fin:Math.max(0,n-MGMT_PASSE_RECRUES_FIN),finAgeMax:MGMT_PASSE_RECRUES_FIN_AGE_MAX,plan:m.passe.plan||{}}};
  const s=mgmtPredecesseurSoiree(m,k,reglages);
  const fait=s.jouee?k+1:k;
  return {k:fait,n,jouee:s.jouee,termine:!s.jouee||fait>=n,annee:mgmtPasseAnnee(n,Math.min(fait,n-1))};
}

/** Clôt le passé : le temps (T3), puis le passage de témoin (T4). Idempotent : un passé clos ne se reclôt pas. @returns {object} la partie */
function mgmtPasseCloturer(m){
  const p=m&&m.passe;
  if(!p||p.enCours!==true) return m;
  const c=m.cal;
  /* T4 bis : sa dernière action — il re-signe ceux que l'ouverture du dernier cycle a laissés partir, pour que l'héritage ne soit pas un effectif sans contrat. */
  mgmtPredecesseurResigne(m);
  p.soirees=Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:p.soirees;
  /* Le temps : un cycle de plus (les âges suivent), puis le jour d'arrivée du joueur devient le jour 0. */
  c.jour+=MGMT_EVENT_WEEKS*7;
  mgmtAdvanceRosterAges(m);
  const origine=c.jour;
  c.jour=0; c.vieJour=0;
  for(const x of c.faites) x.jour-=origine;
  for(const x of c.prochaines) x.jour-=origine;
  if(Array.isArray(m.fil)){ for(const x of m.fil){ if(x&&Number.isSafeInteger(x.j)) x.j-=origine; } }
  p.origineJours=origine;
  delete p.enCours; delete p.plan;
  /* Le passage de témoin : la richesse reprend le profil, l'histoire reste. */
  const profil=mgmtOrgProfil(m);
  m.treasury=profil.caisse;
  m.recettes=[]; m.audiences=[]; m.comptes=[]; m.lastEvent=null;
  m.salles=mgmtSallesCreer(m);
  delete m.pop;
  mgmtSallesInit(m);
  mgmtPasseAlleger(m);
  mgmtRangsInvalider(m);
  /* ==== [ANCRE: MONDE_LOT5_T1_PASSAGE_CARTE] — Monde lot 5 T1 ==== */
  if(mgmtAgendaPoser(m,MGMT_EVENT_WEEKS*7,'petite').ok){
    mgmtPredecesseurCarteHeritee(m,p.soirees);
  }
  return m;
}

/* ==== [ANCRE: MONDE_LOT1_T5_ARCHIVE] — Monde lot 1 T5 l'archive légère ====
   Un combat du passé garde l'essentiel — qui, quand, où sur la carte, le résultat, la méthode, le round — et ne se revoit pas (décision du 09/10 : on lit le résultat).
   EN MÉMOIRE, à la clôture : m.hist garde ses entrées (un seul endroit pour tous les lecteurs : Résultats, fiche, affrontements, classements, ceintures) mais allégées
   et marquées p:true — côtés d'avant combat sans corps ni niveau, seed 0 ; les faits du passé que personne ne relit (le va-et-vient des contrats : départ après une longue
   attente, re-signature, palier d'attente) sont écartés, tous les autres restent. m.passe.nHist et m.passe.nFacts disent combien d'entrées de tête sont du passé.
   SUR DISQUE (mgmtSerialiser) : ces entrées de tête sont écrites en tableaux de nombres derrière des tables de chaînes (m.passe.archive), et redéployées à l'identique
   au chargement (mgmtParseAndValidate → mgmtPasseDeployer). Le format compact n'existe que dans le fichier ; si quelque chose d'inattendu s'y oppose, la partie s'écrit
   en clair (plus lourde, jamais fausse). Aucun second système : la partie en mémoire est la même avec ou sans archive. */
/** Les sortes de faits du passé qui ne servent à aucun lecteur : écartés à la clôture (QO-9 ne vaut que pour les faits du joueur). */
const MGMT_PASSE_FAITS_PERDUS=['depart_attente','contrat','attend'];

/** Le côté d'un combat du passé, reconstitué de la ligne de l'effectif et du bilan d'avant combat. Pur. */
function mgmtPasseCote(f,age,W,L,D){
  const s={id:f.id,name:f.name,first:f.first,last:f.last,div:f.div,age,W,L,D,trauma:null,traumaFloor:null,lastCycle:null};
  if(f.generation===MGMT_IDENTITE_GENERATION){ s.ck=f.ck; s.generation=f.generation; }
  return s;
}
/** La ligne de nombres d'un combat (complet ou allégé) : [cycle, 1 si principal, A, âge, V, D, N, B, âge, V, D, N, 0/1/2, famille, round, rounds], ou null. Pur. */
function mgmtPasseLigne(t){
  if(!t||!t.a||!t.b) return null;
  const r=[t.c,t.slot==='main'?1:0,t.a.id,t.a.age,t.a.W,t.a.L,t.a.D,t.b.id,t.b.age,t.b.W,t.b.L,t.b.D,'ABD'.indexOf(t.winner),t.family,t.round,t.rounds];
  for(const i of [0,3,4,5,6,8,9,10,11,14,15]){ if(!Number.isSafeInteger(r[i])||r[i]<0) return null; }
  if(r[12]<0||typeof r[2]!=='string'||typeof r[7]!=='string'||typeof r[13]!=='string') return null;
  return r;
}
/** L'entrée de m.hist d'un combat du passé, depuis sa ligne et l'effectif (par identifiant), ou null. Pur. */
function mgmtPasseEntree(par,r){
  const fa=par.get(r[2]), fb=par.get(r[7]);
  if(!fa||!fb) return null;
  return {c:r[0],slot:r[1]===1?'main':'prelim',seed:0,rounds:r[15],a:mgmtPasseCote(fa,r[3],r[4],r[5],r[6]),b:mgmtPasseCote(fb,r[8],r[9],r[10],r[11]),
    winner:'ABD'[r[12]],family:r[13],round:r[14],p:true};
}

/** À la clôture : allège m.hist, écarte les faits perdus, note la part du passé. @returns {boolean} faux si un combat n'a pas pu s'alléger (rien n'est alors changé). */
function mgmtPasseAlleger(m){
  const par=new Map(m.roster.map(f=>[f.id,f]));
  const hist=[];
  for(const t of m.hist){
    const r=mgmtPasseLigne(t), e=r&&mgmtPasseEntree(par,r);
    if(!e||!mgmtValidFightTrace(e)) return false;
    hist.push(e);
  }
  m.hist=hist;
  m.facts=m.facts.filter(x=>!(x&&MGMT_PASSE_FAITS_PERDUS.includes(x.k)));
  m.passe.nHist=hist.length; m.passe.nFacts=m.facts.length;
  return true;
}

/** Les combats et les faits de tête (la part du passé) en tableaux de nombres, ou null si quelque chose d'inattendu s'y oppose. Pur. */
function mgmtPasseCompacter(m){
  const p=m&&m.passe;
  if(!p||!Number.isSafeInteger(p.nHist)||!Number.isSafeInteger(p.nFacts)||p.nHist+p.nFacts===0) return null;
  if(m.hist.length<p.nHist||m.facts.length<p.nFacts) return null;
  const s=[], si=new Map(), g=[], gi=new Map(), h=[], f=[];
  const S=x=>{ let i=si.get(x); if(i===undefined){ i=s.length; si.set(x,i); s.push(x); } return i; };
  for(let i=0;i<p.nHist;i++){
    const t=m.hist[i], r=t&&t.p===true?mgmtPasseLigne(t):null;
    if(!r) return null;
    h.push([r[0],r[1],S(r[2]),r[3],r[4],r[5],r[6],S(r[7]),r[8],r[9],r[10],r[11],r[12],S(r[13]),r[14],r[15]]);
  }
  for(let i=0;i<p.nFacts;i++){
    const x=m.facts[i];
    if(!x||typeof x!=='object'||Array.isArray(x)) return null;
    const cles=Object.keys(x);
    if(cles[0]!=='c'||cles[1]!=='k'||!Number.isSafeInteger(x.c)||x.c<0||typeof x.k!=='string') return null;
    const sig=x.k+'|'+cles.slice(2).join(',');
    let gx=gi.get(sig); if(gx===undefined){ gx=g.length; gi.set(sig,gx); g.push([x.k,cles.slice(2)]); }
    const row=[x.c,gx];
    for(const k of cles.slice(2)){
      const v=x[k];
      if(typeof v==='string') row.push(-(S(v)+1));
      else if(Number.isSafeInteger(v)&&v>=0) row.push(v);
      else if(v===true||v===false||v===null) row.push(v);
      else return null;
    }
    f.push(row);
  }
  return {v:1,s,g,h,f};
}

/** Redéploie l'archive d'une partie lue sur le disque : les entrées de tête de m.hist et de m.facts reviennent telles qu'elles étaient en mémoire. @returns {object|null} la partie, ou null si l'archive est illisible. */
function mgmtPasseDeployer(m){
  const p=m&&m.passe, a=p&&p.archive;
  if(!a) return m;
  try{
    if(a.v!==1||!Array.isArray(a.s)||!Array.isArray(a.g)||!Array.isArray(a.h)||!Array.isArray(a.f)) return null;
    if(a.h.length!==p.nHist||a.f.length!==p.nFacts) return null;
    const par=new Map(m.roster.map(f=>[f.id,f]));
    const hist=[];
    for(const r of a.h){
      const e=mgmtPasseEntree(par,[r[0],r[1],a.s[r[2]],r[3],r[4],r[5],r[6],a.s[r[7]],r[8],r[9],r[10],r[11],r[12],a.s[r[13]],r[14],r[15]]);
      if(!e) return null;
      hist.push(e);
    }
    const facts=[];
    for(const r of a.f){
      const sig=a.g[r[1]]; if(!sig) return null;
      const x={c:r[0],k:sig[0]};
      sig[1].forEach((k,i)=>{ const v=r[2+i]; x[k]=typeof v==='number'&&v<0?a.s[-v-1]:v; });
      facts.push(x);
    }
    delete p.archive;
    m.hist=hist.concat(m.hist); m.facts=facts.concat(m.facts);
    return m;
  }catch(e){ return null; }
}

/** La partie écrite pour le disque : la part du passé en archive compacte, le reste tel quel. @returns {string} */
function mgmtSerialiser(m){
  const a=mgmtPasseCompacter(m);
  if(!a) return JSON.stringify(m);
  return JSON.stringify(Object.assign({},m,{hist:m.hist.slice(m.passe.nHist),facts:m.facts.slice(m.passe.nFacts),passe:Object.assign({},m.passe,{archive:a})}));
}
/* ==== [FIN ANCRE] ==== */

/** Les trois pas d'un coup, pour les tests et les outils. @returns {object} la partie close, posée en G.mgmt */
function mgmtPasseGenerer(orgId,opts){
  const m=mgmtPassePreparer(orgId,opts);
  let k=0, r;
  do{ r=mgmtPasseSoiree(m,k); k=r.k; }while(!r.termine);
  return mgmtPasseCloturer(m);
}
/* ==== [FIN ANCRE] ==== */
