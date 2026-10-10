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
  mgmtNewRoster(m,{reculAns:o.reculAns,combatsAttendus:o.combatsAttendus});
  mgmtNewPile(m);
  mgmtAgendaInit(m);
  m.passe={enCours:true,soirees:o.soirees,reculAns:o.reculAns,combatsAttendus:o.combatsAttendus};
  G.mgmt=m;
  return m;
}

/** Joue UNE soirée du passé (la k-ième, de 0 à n−1). Si la soirée ne peut pas se jouer, le passé s'arrête là (termine, jouee:false).
 *  @returns {{k:number,n:number,jouee:boolean,termine:boolean,annee:number}} k = soirées faites après ce pas */
function mgmtPasseSoiree(m,k){
  const n=m.passe.soirees;
  const s=mgmtPredecesseurSoiree(m,k);
  const fait=s.jouee?k+1:k;
  return {k:fait,n,jouee:s.jouee,termine:!s.jouee||fait>=n,annee:mgmtPasseAnnee(n,Math.min(fait,n-1))};
}

/** Clôt le passé : le temps (T3), puis le passage de témoin (T4). Idempotent : un passé clos ne se reclôt pas. @returns {object} la partie */
function mgmtPasseCloturer(m){
  const p=m&&m.passe;
  if(!p||p.enCours!==true) return m;
  const c=m.cal;
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
  delete p.enCours;
  /* Le passage de témoin : la richesse reprend le profil, l'histoire reste. */
  const profil=mgmtOrgProfil(m);
  m.treasury=profil.caisse;
  m.recettes=[]; m.audiences=[]; m.comptes=[]; m.lastEvent=null;
  m.salles=mgmtSallesCreer(m);
  delete m.pop;
  mgmtSallesInit(m);
  mgmtRangsInvalider(m);
  return m;
}

/** Les trois pas d'un coup, pour les tests et les outils. @returns {object} la partie close, posée en G.mgmt */
function mgmtPasseGenerer(orgId,opts){
  const m=mgmtPassePreparer(orgId,opts);
  let k=0, r;
  do{ r=mgmtPasseSoiree(m,k); k=r.k; }while(!r.termine);
  return mgmtPasseCloturer(m);
}
/* ==== [FIN ANCRE] ==== */
