"use strict";
/* ==== [ANCRE: P7_T1_PRIMES] — Monde lot 44 T1 ==== */
/* Brief du 22/10/2026, P7 T3 : trois primes attribuées par l'organisation à
   la clôture, sur les seuls relevés de la soirée. Le combat de la soirée
   (deux versements) et deux performances (deux combattants distincts). La
   caisse paie, m.hist garde pr:'cs'|'pf', m.facts garde le fait prime. */

/** Le montant d'un versement : 1 % de la bourse, plafonné à 2,9 % des
 *  recettes brutes pour les quatre versements. 0 : pas de prime. Pur. */
function mgmtPrimesMontant(finance){
  if(!finance||typeof finance!=='object') return 0;
  const bourse=Number.isFinite(finance.purses)&&finance.purses>0?finance.purses:0;
  const brut=(Number.isFinite(finance.ticketing)?finance.ticketing:0)+(Number.isFinite(finance.tv)?finance.tv:0);
  if(!bourse||!brut) return 0;
  let par=Math.max(MGMT_PRIMES.minimum,Math.round(bourse*MGMT_PRIMES.partBourse));
  const plafond=Math.floor(brut*MGMT_PRIMES.plafondRecettes);
  if(4*par>plafond) par=Math.floor(plafond/4);
  return par>=MGMT_PRIMES.minimum?par:0;
}

/** Le total payé pour une liste de prix. Pur. */
function mgmtPrimesTotal(awards){
  return (Array.isArray(awards)?awards:[]).reduce((n,a)=>{
    if(!a||!Number.isSafeInteger(a.montant)) return n;
    return n+(a.type==='cs'?2*a.montant:a.montant);
  },0);
}

/** Les combats de la soirée avec leur type et leur score, du plus récent au
 *  plus ancien. Pur. */
function mgmtPrimesCandidats(m){
  if(!m||!m.lastEvent||!Array.isArray(m.hist)) return [];
  const ev=m.lastEvent, cycle=Number.isSafeInteger(ev.cycle)?ev.cycle:null;
  const from=Number.isSafeInteger(ev.premier)?Math.max(0,Math.min(m.hist.length,ev.premier)):0;
  const out=[];
  for(let i=from;i<m.hist.length;i++){
    const t=m.hist[i];
    if(!t||(cycle!==null&&t.c!==cycle)) continue;
    const type=mgmtSalleTypeCombat(t);
    out.push({i,t,type,score:MGMT_PRIMES.criteres[type]||0});
  }
  return out;
}

/** Le combat de la soirée : le plus fort sur finition + guerre + surprise,
 *  toutes cartes confondues. Un préliminaire ordinaire (score 0) n'est jamais
 *  candidat ; à score égal, la carte principale passe devant. Pur. */
function mgmtPrimesCombatDeLaSoiree(candidats){
  const notables=(candidats||[]).filter(x=>x.score>0);
  if(!notables.length) return null;
  const principal=x=>x.t&&x.t.slot==='main'?1:0;
  return notables.slice().sort((a,b)=>b.score-a.score||principal(b)-principal(a)||b.i-a.i||String(a.t.a&&a.t.a.id).localeCompare(String(b.t.a&&b.t.a.id)))[0]||null;
}

/** Deux performances distinctes, hors du combat de la soirée quand d'autres
 *  combattants existent. Pur. */
function mgmtPrimesPerformances(candidats,cs){
  const notables=(candidats||[]).filter(x=>x.score>0);
  const csIds=cs?new Set([cs.t.a&&cs.t.a.id,cs.t.b&&cs.t.b.id].filter(Boolean)):new Set();
  const sides=[];
  for(const x of notables){
    const a=x.t.a&&x.t.a.id, b=x.t.b&&x.t.b.id, w=x.t.winner;
    if(a) sides.push({id:a,score:x.score,win:w==='A'?1:0,i:x.i,t:x.t});
    if(b) sides.push({id:b,score:x.score,win:w==='B'?1:0,i:x.i,t:x.t});
  }
  const ordre=(a,b)=>b.score-a.score||b.win-a.win||b.i-a.i||String(a.id).localeCompare(String(b.id));
  const choisis=[],vus=new Set();
  const prendre=(pool,allowCs)=>{
    for(const s of pool.slice().sort(ordre)){
      if(choisis.length>=2) break;
      if(!s.id||vus.has(s.id)||(!allowCs&&csIds.has(s.id))) continue;
      vus.add(s.id); choisis.push(s);
    }
  };
  prendre(sides,false);
  if(choisis.length<2) prendre(sides,true);
  return choisis.slice(0,2);
}

/** Attribue les trois primes de la soirée et les paie. Rend [] si la soirée
 *  n'a aucun combat notable ou si elle a déjà été payée. */
function mgmtPrimesSoiree(m){
  /* Le passé du prédécesseur est déjà écrit : ses soirées ne paient pas de
     prime, sinon la caisse du passé changerait les retraites et la carte des
     six ans (tests mgmtPasse). Le joueur, lui, paie dès sa première soirée. */
  if((typeof MGMT_PREDECESSEUR_EN_COURS!=='undefined'&&MGMT_PREDECESSEUR_EN_COURS===true)||(m&&m.passe&&m.passe.enCours===true)) return [];
  if(!m||!m.lastEvent||!m.lastEvent.finance) return [];
  const ev=m.lastEvent, fin=ev.finance;
  if(Number.isSafeInteger(fin.primes)) return [];
  const candidats=mgmtPrimesCandidats(m);
  const cs=mgmtPrimesCombatDeLaSoiree(candidats);
  if(!cs){ fin.primes=0; return []; }
  const montant=mgmtPrimesMontant(fin);
  if(!montant){ fin.primes=0; return []; }
  const pf=mgmtPrimesPerformances(candidats,cs);
  const awards=[{type:'cs',i:cs.i,fight:cs.t,a:cs.t.a&&cs.t.a.id,b:cs.t.b&&cs.t.b.id,montant}];
  for(const s of pf) awards.push({type:'pf',i:s.i,fight:s.t,a:s.id,montant});
  const total=mgmtPrimesTotal(awards);
  fin.primes=total;
  fin.recette-=total;
  m.treasury=(Number.isSafeInteger(m.treasury)?m.treasury:0)-total;
  if(Array.isArray(m.recettes)&&m.recettes.length) m.recettes[m.recettes.length-1]=fin.recette;
  if(Array.isArray(m.comptes)&&m.comptes.length){ const c=m.comptes[m.comptes.length-1]; if(c&&Number.isSafeInteger(c.recette)) c.recette=fin.recette; }
  const marquer=(i,type)=>{ const t=m.hist[i]; if(!t) return; if(type==='cs'||t.pr!=='cs') t.pr=type; };
  marquer(cs.i,'cs');
  for(const s of pf) marquer(s.i,'pf');
  for(const aw of awards){
    if(aw.type==='cs'){
      for(const id of [aw.a,aw.b]) if(id) mgmtAddFact(m,{c:ev.cycle,k:'prime',a:id,fight:aw.i,type:'cs',m:aw.montant});
    }else if(aw.a) mgmtAddFact(m,{c:ev.cycle,k:'prime',a:aw.a,fight:aw.i,type:'pf',m:aw.montant});
  }
  if(typeof mgmtStatsInvalider==='function') mgmtStatsInvalider(m);
  return awards;
}

/** Le fait prime est-il bien formé ? (validation et réparation) */
function mgmtPrimeFactValide(f,hist){
  if(!f||typeof f!=='object'||Array.isArray(f)||f.k!=='prime') return false;
  if(Object.keys(f).sort().join(',')!=='a,c,fight,k,m,type') return false;
  if(!mgmtValidId(f.a)||!Number.isSafeInteger(f.c)||f.c<0) return false;
  if(!Number.isSafeInteger(f.fight)||f.fight<0||!Array.isArray(hist)||f.fight>=hist.length) return false;
  if(f.type!=='cs'&&f.type!=='pf') return false;
  if(!Number.isSafeInteger(f.m)||f.m<1) return false;
  const t=hist[f.fight];
  return !!(t&&t.c===f.c&&((t.a&&t.a.id===f.a)||(t.b&&t.b.id===f.a)));
}

/** Une annonce de prime, prête pour l'écran suivant. Pure. */
function mgmtPrimesAnnonce(award,nom){
  const texte=MGMT_PRIMES.annonces[Math.abs(Number.isSafeInteger(award&&award.i)?award.i:0)%MGMT_PRIMES.annonces.length];
  const prix=MGMT_PRIMES.libelles[award&&award.type]||MGMT_PRIMES.libelles.pf;
  return texte.replace('{prix}',prix).replace('{nom}',String(nom||'')).replace('{montant}',mgmtEuros(award&&award.montant||0));
}
