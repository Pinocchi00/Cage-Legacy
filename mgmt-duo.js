"use strict";
/* ==== [ANCRE: DUO_T1_MOTEUR] — Duo T1, docs/lots/DUO-T1.md ==== */
const MGMT_DUO_PERIODE = 91;
const MGMT_DUO_COMBATS = 6;
const MGMT_DUO_CARTES_SAISON = 4;
const MGMT_DUO_NOM_MAX = 16;
const MGMT_DUO_GAIN = { vainqueur: 200, perdant: 50, nul: 125 };

/** Indique si une partie est une partie Duo. */
function mgmtDuoActif(m) { return !!(m && m.duo && typeof m.duo === 'object'); }
/** Renvoie la partie correspondant au joueur. */
function mgmtDuoPartie(m, cote) { return !mgmtDuoActif(m) ? null : cote === 'a' ? m : cote === 'b' ? m.orgs[m.duo.b] || null : null; }
/** Exécute une opération dans le contexte de partie attendu et restaure J1 même en cas d'erreur. */
function mgmtDuoAvec(m, cote, fn) { try { G.mgmt = mgmtDuoPartie(m, cote); return fn(G.mgmt); } finally { G.mgmt = m; } }
/** Initialise l'état Duo si les organisations sont valides. */
function mgmtDuoCreer(m, orgIdB, noms) {
  if (!m || m.mondeVivant !== true || !m.orgs || !m.orgs[orgIdB] || orgIdB === mgmtPredecesseurOrgId(m)) return false;
  const valeurs = noms || {};
  const nom = (x, defaut) => String(x == null ? '' : x).trim().slice(0, MGMT_DUO_NOM_MAX) || defaut;
  m.duo = { v: 1, b: orgIdB, noms: { a: nom(valeurs.a, 'Joueur 1'), b: nom(valeurs.b, 'Joueur 2') }, periode: MGMT_DUO_PERIODE,
    prochaine: m.cal.jour + MGMT_DUO_PERIODE, etape: 'attente', reperes: { ca: m.cycle, cb: m.orgs[orgIdB].cycle },
    draft: null, encheres: null, soiree: null, cartes: [] };
  return true;
}
/** Jour de prochaine soirée de J1. */
function mgmtDuoProchaineSoiree(m) { return m.cal.prochaines && m.cal.prochaines[0] ? m.cal.prochaines[0].jour : m.cal.jour + MGMT_EVENT_WEEKS * 7; }
/** Ouvre un draft avec priorité au perdant de la carte précédente. */
function mgmtDuoDraftOuvrir(m) { const last = m.duo.cartes[m.duo.cartes.length - 1], premier = last && last.gagnant === 'a' ? 'b' : last && last.gagnant === 'b' ? 'a' : 'b'; m.duo.draft = { premier, tour: premier, attente: 'place', combats: [] }; }
/** Avance le temps d'un pas déterministe jusqu'à la super carte ou soirée ordinaire. */
function mgmtDuoAvancerPas(m){if(G.mgmt!==m||!mgmtDuoActif(m)||m.duo.etape!=='attente')return{termine:true};if(mgmtDuoProchaineSoiree(m)<=m.duo.prochaine){const a=m.treasury,b=mgmtDuoPartie(m,'b').treasury;const r=mgmtPredecesseurSoiree(m,m.eventsPlayed,mgmtPredecesseurReglages(mgmtPredecesseurOrgId(m)));m.treasury=a;mgmtDuoPartie(m,'b').treasury=b;if(r&&r.jouee)return{termine:false,jour:m.cal.jour,cible:m.duo.prochaine};}m.cal.jour=Math.max(m.cal.jour,m.duo.prochaine);mgmtAdvanceRosterAges(m);m.duo.etape='draft';mgmtDuoDraftOuvrir(m);saveMgmt();return{termine:true};}
/** Avance jusqu'à la fin du pas courant avec un garde-fou. */
function mgmtDuoAvancer(m){let r;for(let i=0;i<20;i++){r=mgmtDuoAvancerPas(m);if(r.termine)return r;}return r||{termine:true};}
/** Classement saisonnier et historique des victoires. */
function mgmtDuoScore(m){const n=m.duo.cartes.length,saison=Math.floor(n/MGMT_DUO_CARTES_SAISON)+1,act=m.duo.cartes.slice(Math.floor(n/MGMT_DUO_CARTES_SAISON)*MGMT_DUO_CARTES_SAISON);return{saison,numero:act.length+1,a:act.filter(x=>x.gagnant==='a').length,b:act.filter(x=>x.gagnant==='b').length,total:{a:m.duo.cartes.filter(x=>x.gagnant==='a').length,b:m.duo.cartes.filter(x=>x.gagnant==='b').length}};}
/** Résumé des soirées ordinaires d'une partie depuis le repère. */
function mgmtDuoResume(m,cote){const partie=mgmtDuoPartie(m,cote),cycle=cote==='a'?m.duo.reperes.ca:m.duo.reperes.cb;return mgmtDuoAvec(m,cote,p=>{const ts=(p.hist||[]).filter(t=>t.slot==='main'&&t.c>cycle&&!t.duo).sort((a,b)=>b.c-a.c).slice(0,12);return{soirees:new Set(ts.map(t=>t.c)).size,combats:ts.map(t=>({a:t.a.name,b:t.b.name,div:t.a.div,winner:t.winner,family:t.family,round:t.round,rounds:t.rounds})),champions:allDivisions().map(d=>({div:d.id,id:(mgmtSplitTitle(partie,d.id)||{}).id||null}))};});}
/** Rejoue une trace de super carte dans le contexte des deux organisations. */
function mgmtDuoRejouer(t){if(!t||!t.duo||!G.mgmt)return null;const m=G.mgmt,sous=m.orgs[t.duo.b],saved=SEED;try{setSeed(t.seed);const a=mgmtDuoAvec(m,'a',()=>mgmtFightReady(mgmtTraceLine(t.a),t.duo.ca)),b=mgmtDuoAvec(m,'b',()=>mgmtFightReady(mgmtTraceLine(t.b),t.duo.cb));return simulateFight(a,b,t.rounds);}finally{setSeed(saved);G.mgmt=m;}}
