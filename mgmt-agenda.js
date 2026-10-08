"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7_AGENDA] — Brief du 06/10/2026, lot 7 : le calendrier du joueur. Les soirées ne
   tombent plus d'office toutes les cinq semaines : le joueur POSE ses soirées (une date, une taille) et le temps
   avance jusqu'à la prochaine soirée posée — ou d'un mois s'il n'en pose pas. Données dans m.cal, champ
   OPTIONNEL (absent = ancien rythme, la soirée en cours se joue puis la partie passe au calendrier ; le format
   de sauvegarde ne change pas de version, validateMgmt vérifie le champ quand il est là) :
     m.cal={actif, jour, vieJour, prochaines:[{jour,taille}], faites:[{n,jour,taille}]}
   `jour` compte les jours depuis MGMT_CALENDRIER_DEBUT ; `vieJour` le dernier jour auquel les âges ont avancé ;
   la date affichée se dérive toujours de `jour` (mgmt-calendrier.js). Deux tailles : la petite soirée de 9
   combats (5 + 4), la grosse de 13 (5 + 4 + 4 « early prelims »), une grosse au plus par mois. Les early
   prelims sont les premières places de card.prelims (card.sizeEarly). Aucun hasard ici : tout est décidé par le
   joueur ; aucun combat n'est joué sans qu'il ait validé la carte (principale posée par lui, proposition de
   Leïla validée). ==== */

const MGMT_AGENDA_PETITE=9;
const MGMT_AGENDA_GROSSE=13;
const MGMT_AGENDA_EARLY=4;
const MGMT_AGENDA_PASSER=30;
const MGMT_AGENDA_TAILLES=['petite','grosse'];

function mgmtAgendaActif(m){ return !!(m&&m.cal&&m.cal.actif===true); }

/** Crée l'agenda d'une partie neuve : aujourd'hui est le jour 0, rien n'est posé. */
function mgmtAgendaInit(m){
  m.cal={actif:true,jour:0,vieJour:0,prochaines:[],faites:[]};
  mgmtAgendaAjusterCarte(m,'petite');   /* corrections du 08/10, 1.1 : la carte d'une partie neuve a toujours la taille d'une soirée */
  mgmtSallesInit(m);
  mgmtContratsInit(m);
  return m.cal;
}

/** Une partie d'avant : l'agenda attend la fin de sa soirée en cours (actif:false), puis prend le relais. */
function mgmtAgendaPreparer(m){ if(m&&m.cal===undefined) m.cal={actif:false}; }
function mgmtAgendaActiver(m){
  if(!m||!m.cal||m.cal.actif!==false) return false;
  const j=Math.max(0,(Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0))*MGMT_EVENT_WEEKS*7;
  m.cal={actif:true,jour:j,vieJour:j,prochaines:[],faites:[]};
  mgmtSallesInit(m);
  mgmtContratsInit(m);
  return true;
}

/** Le jour (depuis le début) de la soirée n : posée, jouée, ou — avant l'agenda — selon l'ancien rythme. Pur. */
function mgmtAgendaJour(m,n){
  const c=m&&m.cal;
  if(c&&c.actif){
    const f=(c.faites||[]).find(x=>x.n===n); if(f) return f.jour;
    const i=n-((m.eventsPlayed||0)+1);
    if(i>=0&&c.prochaines[i]) return c.prochaines[i].jour;
    if(i<0) return (n-1)*MGMT_EVENT_WEEKS*7;
    return null;
  }
  return (n-1)*MGMT_EVENT_WEEKS*7;
}
function mgmtAgendaTaille(m,n){
  const c=m&&m.cal;
  if(c&&c.actif){
    const f=(c.faites||[]).find(x=>x.n===n); if(f) return f.taille;
    const i=n-((m.eventsPlayed||0)+1);
    if(i>=0&&c.prochaines[i]) return c.prochaines[i].taille;
  }
  return null;
}

/** Le mois (année*12+mois) d'un jour. */
function mgmtAgendaMois(jour){
  const d=new Date(MGMT_CALENDRIER_DEBUT+jour*86400000);
  return d.getUTCFullYear()*12+d.getUTCMonth();
}

/** Une soirée peut-elle se poser là, de cette taille ? Pur. @returns {{ok:boolean,raison?:string}} */
function mgmtAgendaVerifier(m,jour,taille,salle){
  if(!mgmtAgendaActif(m)) return {ok:false,raison:'inactif'};
  if(!Number.isSafeInteger(jour)||!MGMT_AGENDA_TAILLES.includes(taille)) return {ok:false,raison:'invalide'};
  if(salle!==undefined&&salle!==null&&!mgmtSalleParId(m,salle)) return {ok:false,raison:'salle'};
  const c=m.cal;
  if(jour<=c.jour) return {ok:false,raison:'passee'};
  if(c.prochaines.some(x=>x.jour===jour)) return {ok:false,raison:'occupee'};
  if(taille==='grosse'){
    const mois=mgmtAgendaMois(jour);
    if(c.prochaines.concat(c.faites||[]).some(x=>x.taille==='grosse'&&mgmtAgendaMois(x.jour)===mois)) return {ok:false,raison:'grosse-du-mois'};
  }
  /* La carte en cours est composée pour une soirée : une autre taille attend qu'elle soit jouée ou vidée. */
  const premiere=!c.prochaines.length||jour<c.prochaines[0].jour;
  /* Une carte d'une taille qui ne correspond à aucune soirée ne bloque rien : elle se recadre à la pose (corrections du 08/10, 1.1). */
  /* Une carte composée peut grandir (plus de places à remplir) ; elle ne peut pas rétrécir sous ce qu'elle porte déjà. */
  if(premiere&&!mgmtAgendaCarteVide(m)&&taille==='petite'&&(m.card.prelims||[]).length>MGMT_AGENDA_PETITE-MGMT_MAIN_SIZE) return {ok:false,raison:'carte-composee'};
  return {ok:true};
}

/** Pose une soirée. @returns {{ok:boolean,raison?:string}} */
function mgmtAgendaPoser(m,jour,taille,salle){
  const v=mgmtAgendaVerifier(m,jour,taille,salle); if(!v.ok) return v;
  const c=m.cal;
  const lieu=salle||(mgmtSalleDefaut(m)||{}).id;
  c.prochaines.push(lieu?{jour,taille,salle:lieu}:{jour,taille});
  c.prochaines.sort((a,b)=>a.jour-b.jour);
  mgmtAgendaSynchroCarte(m);
  return {ok:true};
}

function mgmtAgendaRetirer(m,i){
  if(!mgmtAgendaActif(m)||!Number.isSafeInteger(i)||i<0||i>=m.cal.prochaines.length) return false;
  m.cal.prochaines.splice(i,1);
  mgmtAgendaSynchroCarte(m);
  return true;
}

function mgmtAgendaCarteVide(m){ return !m.card||((m.card.main||[]).length===0&&(m.card.prelims||[]).length===0); }
/** La taille que dit la carte en cours (ses places), ou null si elle ne correspond à aucune. */
function mgmtAgendaTailleCarte(m){
  const t=(m.card.sizeMain||0)+(m.card.sizePrelims||0);
  return t===MGMT_AGENDA_GROSSE?'grosse':(t===MGMT_AGENDA_PETITE?'petite':null);
}
/** Les places de la carte suivent la prochaine soirée posée, tant que la carte est vide. */
function mgmtAgendaSynchroCarte(m){
  const p=m.cal.prochaines[0];
  if(!p) return;
  if(mgmtAgendaTailleCarte(m)!==p.taille) mgmtAgendaAjusterCarte(m,p.taille);
}
/** Donne à la carte les places d'une soirée (petite : 5 + 4, grosse : 5 + 8). Les préliminaires en trop, les derniers posés, se détachent. */
function mgmtAgendaAjusterCarte(m,taille){
  if(!m||!m.card) return;
  const grosse=taille==='grosse';
  m.card.sizeMain=MGMT_MAIN_SIZE;
  m.card.sizePrelims=grosse?MGMT_AGENDA_PETITE-MGMT_MAIN_SIZE+MGMT_AGENDA_EARLY:MGMT_AGENDA_PETITE-MGMT_MAIN_SIZE;
  m.card.sizeEarly=grosse?MGMT_AGENDA_EARLY:0;
  if(Array.isArray(m.card.prelims)&&m.card.prelims.length>m.card.sizePrelims) m.card.prelims.length=m.card.sizePrelims;
}

/** Les semaines qui séparent deux calendriers pour le vieillissement : l'ancien rythme, ou les jours écoulés. */
function mgmtAgendaSemaines(m){
  if(!mgmtAgendaActif(m)) return MGMT_EVENT_WEEKS;
  const w=Math.max(0,Math.round((m.cal.jour-m.cal.vieJour)/7));
  m.cal.vieJour=m.cal.jour;
  return w;
}

/** Laisse passer le temps : trente jours au plus, jamais au-delà de la prochaine soirée posée.
 *  @returns {number} jours écoulés (0 si une soirée est due ce jour-là). */
function mgmtAgendaPasser(m){
  if(!mgmtAgendaActif(m)) return 0;
  const c=m.cal, p=c.prochaines[0];
  const jours=p?Math.min(MGMT_AGENDA_PASSER,p.jour-c.jour):MGMT_AGENDA_PASSER;
  if(jours<=0) return 0;
  c.jour+=jours;
  mgmtAdvanceRosterAges(m);
  return jours;
}

/** La soirée peut se jouer : une soirée posée, la carte pleine (ou réduite décidée), aucune proposition à valider. */
function mgmtAgendaPret(m){
  if(!mgmtAgendaActif(m)||!m.cal.prochaines.length) return false;
  if(mgmtOpenCount(m)>0) return false;
  return mgmtCardFull(m)||(typeof mgmtReduiteOuverte==='function'&&mgmtReduiteOuverte(m));
}

/** Tout ce qui empêche de lancer la soirée, une ligne par blocage : {k,texte,label,onclick}. Vide quand la soirée est prête. Pur.
 *  Corrections du 08/10, 1.2 et 1.3 : chaque ligne mène à l'écran où le régler. */
function mgmtAgendaBlocages(m){
  const out=[];
  if(!mgmtAgendaActif(m)) return out;
  if(!m.cal.prochaines.length) return [{k:'pose',texte:'Aucune soirée n’est posée.',label:'Poser une soirée',onclick:"CL.go('mgmt_calendrier')"}];
  if(typeof mgmtReduiteOuverte==='function'&&mgmtReduiteOuverte(m)&&mgmtOpenCount(m)===0) return out;
  const c=m.card||{}, main=(c.main||[]).length, prel=(c.prelims||[]).length;
  const sm=Number.isSafeInteger(c.sizeMain)?c.sizeMain:MGMT_MAIN_SIZE, sp=Number.isSafeInteger(c.sizePrelims)?c.sizePrelims:MGMT_PRELIM_SIZE;
  const pl=n=>n>1?'s':'';
  if(main<sm) out.push({k:'main',texte:`Il manque ${sm-main} combat${pl(sm-main)} en carte principale.`,label:'Ouvrir la carte',onclick:"CL.go('mgmt_carte')"});
  if(prel<sp){
    const sm1=main>=sm;
    out.push({k:'prelims',texte:`Il manque ${sp-prel} préliminaire${pl(sp-prel)}.`,label:sm1?'Trouver un remplaçant':'Ouvrir les préliminaires',onclick:sm1?'CL.mgmtPrelimsRemplacer()':"CL.go('mgmt_prelims')"});
  }
  const n=mgmtOpenCount(m);
  if(n>0) out.push({k:'affaires',texte:`${n} affaire${pl(n)} ou demande${pl(n)} à régler.`,label:'Les affaires',onclick:"CL.go('mgmt_bureau')"});
  return out;
}

/** Joue la prochaine soirée posée : le temps avance jusqu'à sa date. @returns {object|null} m.lastEvent. */
function mgmtAgendaJouer(m){
  if(!mgmtAgendaPret(m)) return null;
  const c=m.cal, p=c.prochaines[0];
  const avant=c.jour;
  c.jour=Math.max(c.jour,p.jour);
  const ev=mgmtRunEvent(m);
  if(!ev){ c.jour=avant; return null; }
  mgmtAdvanceRosterAges(m);
  c.prochaines.shift();
  c.faites.push(p.salle?{n:m.eventsPlayed,jour:p.jour,taille:p.taille,salle:p.salle}:{n:m.eventsPlayed,jour:p.jour,taille:p.taille});
  while(c.faites.length>24) c.faites.shift();
  return ev;
}
/** Réservé : le cercle et les suivis du joueur. Leïla ne place jamais un combattant réservé (agenda actif). Pur. */
function mgmtAgendaReserve(m,f){
  if(!mgmtAgendaActif(m)||!f) return false;
  return (Array.isArray(m.cercle)&&m.cercle.includes(f.id))||(Array.isArray(m.suivis)&&m.suivis.includes(f.id));
}

/** La préparation à la demande : le joueur a désigné un combattant, l'assistante lui propose l'adversaire le plus proche au
 *  classement dans sa catégorie — disponible, libre, non réservé, déjà jamais deux fois le même (ordre stable). Pur.
 *  @returns {object|null} la ligne de l'adversaire. */
function mgmtAgendaProposer(m,id){
  const f=mgmtFighterById(m,id); if(!f) return null;
  const rg=mgmtDivisionRank(m,f)||0;
  const c=mgmtCartRows(m).filter(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id)&&!mgmtAgendaReserve(m,x));
  c.sort((x,y)=>Math.abs((mgmtDivisionRank(m,x)||0)-rg)-Math.abs((mgmtDivisionRank(m,y)||0)-rg)||(x.id<y.id?-1:1));
  return c[0]||null;
}

/** Le champ m.cal est-il bien formé ? (validateMgmt et mgmtRepair) */
function mgmtAgendaValide(c){
  if(!c||typeof c!=='object'||Array.isArray(c)||typeof c.actif!=='boolean') return false;
  if(!c.actif) return true;
  if(!Number.isSafeInteger(c.jour)||c.jour<0||!Number.isSafeInteger(c.vieJour)||c.vieJour<0||c.vieJour>c.jour) return false;
  if(!Array.isArray(c.prochaines)||!Array.isArray(c.faites)) return false;
  for(const p of c.prochaines){ if(!p||!Number.isSafeInteger(p.jour)||!MGMT_AGENDA_TAILLES.includes(p.taille)||(p.salle!==undefined&&typeof p.salle!=='string')) return false; }
  for(const f of c.faites){ if(!f||!Number.isSafeInteger(f.n)||f.n<1||!Number.isSafeInteger(f.jour)||f.jour<0||!MGMT_AGENDA_TAILLES.includes(f.taille)) return false; }
  return true;
}
/* ==== [FIN ANCRE] ==== */
