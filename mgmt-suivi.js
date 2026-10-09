"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT10_SUIVI] — Brief du 06/10/2026, lot 10 : le suivi du monde. Cinq écrans (classements,
   ceintures, camps, presse, résultats) lisent ce que la partie a déjà gardé : les faits, la trace de chaque combat
   (m.hist, jamais élaguée : « un combat de la première soirée se revoit à l'identique après quarante soirées ») et la
   carte. Rien de ce fichier ne se stocke, SAUF le fil de nouvelles (m.fil) : chaque nouvelle garde son type, sa date
   (le jour de l'agenda, ou le cycle) et le combat qu'elle concerne. Le fil se construit en lisant des faits, jamais
   en les inventant : rejouer deux fois la mise à jour n'ajoute rien (clé de déduplication).
   - Le classement de l'organisation se lit sur les résultats (mgmtDivisionRanking), jamais sur le niveau stocké ; les
     places gagnées ou perdues sont la différence entre le classement d'aujourd'hui et celui du cycle précédent.
   - La lignée d'une ceinture est relue dans les faits (title_initial, title_fight, retired) : tous les champions,
     dans l'ordre, sans trou, avec la soirée où chacun l'a prise et ses défenses.
   - Le prétendant numéro un est le mieux classé de la catégorie qui n'est pas champion.
   - Un camp est une salle, une ville, un coach ; ce qu'on y travaille (sa spécialité) pèse sur la progression du
     lot 2 pour les combattants de son style (agenda actif seulement).
   Les titres et phrases de presse sont d'auteur : les modèles ci-dessous sont des PROPOSITIONS (relu:false) que
   Anthony relira à la fin. ==== */

/** Combien de nouvelles le fil garde au plus (les plus anciennes tombent). */
const MGMT_FIL_MAX=200;
const MGMT_FIL_TYPES=['defi','presse','public','combattant'];
const MGMT_FIL_LIBELLES={defi:'Un défi',presse:'La presse',public:'Le public',combattant:'Un combattant'};
/** Les en-têtes de carte du fil ; les phrases viennent des modèles ci-dessous. */
const MGMT_FIL_MODELES={
  defi:{titre:'{a} défie {b}',relu:false},
  garde:{titre:'{a} garde sa ceinture',relu:false},
  prend:{titre:'{a} devient champion',relu:false},
  vacant:{titre:'{a} s’empare du titre vacant',relu:false},
  public:{titre:'Le public réclame ce combat',relu:false},
  attend:{titre:'{a} attend depuis {n} mois',relu:false},
  demande:{titre:'{a} fait une demande',relu:false},
};

/** Un nom de combattant : la ligne de Split, sinon la trace auto-portante d'un combat, sinon rien. */
function mgmtNomParId(m,id){
  const f=mgmtFighterById(m,id);
  if(f) return {name:f.name,first:f.first||'',last:f.last||f.name};
  for(let i=(m.hist||[]).length-1;i>=0;i--){
    const t=m.hist[i]; if(!t||!t.a||!t.b) continue;
    const s=t.a.id===id?t.a:(t.b.id===id?t.b:null);
    if(s) return {name:s.name,first:s.first||'',last:s.last||s.name};
  }
  const e=mgmtFicheLigne(m,id);
  if(e&&e.f) return {name:e.f.name,first:e.f.first||'',last:e.f.last||e.f.name};
  return {name:'',first:'',last:''};
}

/* ---- Les soirées jouées ----------------------------------------------------------------------------- */

/** Les soirées jouées, de la plus ancienne à la plus récente : [{n,c,idx,jour}] — idx : les index de leurs combats dans
 *  m.hist, dans l'ordre de passage. Le numéro de la dernière est m.eventsPlayed. Dérivé, jamais stocké. */
function mgmtSoirees(m){
  const out=[]; let cur=null;
  (m.hist||[]).forEach((t,i)=>{
    if(!t||!t.a||!t.b) return;
    if(!cur||cur.c!==t.c){ cur={n:0,c:t.c,idx:[],jour:null}; out.push(cur); }
    cur.idx.push(i);
  });
  const dernier=Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:out.length;
  out.forEach((s,k)=>{ s.n=Math.max(1,dernier-(out.length-1-k)); s.jour=mgmtSoireeJour(m,s.n); });
  return out;
}
/** Le jour (depuis le 12 janvier 2027) de la soirée n : l'agenda s'il l'a gardée, sinon l'ancien rythme ; null si perdu. */
function mgmtSoireeJour(m,n){
  if(n<=0) return 0;
  if(typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)){
    const f=(m.cal.faites||[]).find(x=>x.n===n); return f?f.jour:null;
  }
  return (n-1)*MGMT_EVENT_WEEKS*7;
}
/** L'ordre d'affichage d'une soirée : le combat principal d'abord (avec l'agenda, il est joué en dernier). */
function mgmtSoireeAffichage(m,s){
  const idx=s.idx.slice();
  const prelimAvant=idx.length>1&&m.hist[idx[0]].slot==='prelim'&&idx.some(i=>m.hist[i].slot==='main');
  return prelimAvant?idx.reverse():idx;
}
/** Le libellé de l'emplacement d'un combat dans l'ordre d'affichage (0 : le principal). */
function mgmtResultatEtiquette(m,t,rang,titre){
  if(t.slot!=='main') return 'Combat '+(rang+1);
  if(rang===0) return 'Combat principal';
  if(rang===1) return 'Co-principal';
  return 'Combat '+(rang+1);
}

/** L'issue d'un combat de titre pour le gagnant : 'garde' (il défendait), 'prend' (il prend la ceinture), 'vacant' (titre vacant), null si
 *  ce n'est pas un combat de titre. Lu dans la mémoire des titres (une seule traversée des faits). */
function mgmtTitreIssue(m,i){
  const fact=(m.facts||[]).find(x=>x&&x.k==='title_fight'&&x.fight===i); if(!fact) return null;
  const rows=typeof mgmtTitleMemoryRows==='function'?mgmtTitleMemoryRows(m):new Map();
  const lab=rows.get(fact)&&rows.get(fact).label;
  return lab===MGMT_FACT_LABELS.title_retained?'garde':(lab===MGMT_FACT_LABELS.title_vacant?'vacant':'prend');
}

/** Le détail d'un combat joué, lu sur sa trace : vainqueur, perdant, méthode, round, geste de finition. Le rejeu ne sert
 *  qu'à la méthode fine et n'est montré que fidèle (areneVerdictFidele) ; mémoïsé par trace. */
const MGMT_DETAIL_MEMO=new WeakMap();
function mgmtResultatDetail(m,i){
  const t=m.hist&&m.hist[i]; if(!t||!t.a||!t.b) return null;
  if(MGMT_DETAIL_MEMO.has(t)) return MGMT_DETAIL_MEMO.get(t);
  const nul=t.winner==='D';
  const g=nul?t.a:(t.winner==='A'?t.a:t.b), p=nul?t.b:(t.winner==='A'?t.b:t.a);
  let methode=MGMT_FAMILY_LABELS[t.family]||'', geste='', secoue='';
  let res=null;
  try{ res=mgmtReplayFight(t); }catch(e){ res=null; }
  if(res&&typeof areneVerdictFidele==='function'&&areneVerdictFidele(t,res)){
    methode=res.method||methode;
    if(typeof res.moveName==='string') geste=res.moveName;
    const cible=res.winner==='A'?'B':(res.winner==='B'?'A':null);
    const st=(cible&&res.stats)?res.stats[cible]:null;
    secoue=st?Math.max(0,Math.round(Number(st.wobbled)||0)):0;
  }
  const d={i,c:t.c,slot:t.slot,family:t.family,round:t.round,rounds:t.rounds,nul,gagnant:g,perdant:p,methode,geste,secoue,
    cat:g.div,titre:!!(m.facts||[]).some(x=>x&&x.k==='title_fight'&&x.fight===i)};
  MGMT_DETAIL_MEMO.set(t,d);
  return d;
}
/** Le round en toutes lettres : « 1er round », « 2e round » ; une décision se dit « après 5 rounds ». */
function mgmtRoundTexte(d){
  if(d.family==='dec'||d.family==='draw') return 'après '+d.rounds+' rounds';
  return d.round===1?'1er round':d.round+'e round';
}

/* ---- Le classement et son évolution ---------------------------------------------------------------- */

/** La série en cours d'un combattant de Split : {issue:'win'|'loss'|'draw',n} depuis son dernier combat, ou null. */
function mgmtSerie(m,f){
  const l=mgmtResultatsDetail(m,f); if(!l.length) return null;
  let n=0; for(const x of l){ if(x.issue===l[0].issue) n++; else break; }
  return {issue:l[0].issue,n};
}
function mgmtSerieTexte(s){
  if(!s) return '';
  if(s.issue==='win') return s.n===1?'1 victoire':s.n+' victoires de suite';
  if(s.issue==='loss') return s.n===1?'1 défaite':s.n+' défaites de suite';
  return s.n===1?'1 nul':s.n+' nuls de suite';
}

/** Les lignes d'une catégorie, du champion au dernier classé. `portee` : 'organization' ou 'world'. Chaque ligne :
 *  {id,rang (0 : champion),champion,delta (places gagnées si >0, perdues si <0, null : pas de comparaison,
 *  'nouveau' : absent hier),W,L,D,serie,dernier:{issue,famille,adv}|null}. Le delta est la différence entre le rang
 *  d'aujourd'hui et celui du classement du cycle précédent (mgmtDivisionRanking au cycle explicite). Dérivé. */
function mgmtClassementLignes(m,div,portee){
  const cur=mgmtDivisionRanking(m,div,portee);
  const prev=(Number.isSafeInteger(m.cycle)&&m.cycle>0)?mgmtDivisionRanking(m,div,portee,m.cycle-1):null;
  const belt=portee==='organization'?mgmtSplitTitle(m,div):{id:null};
  const lignes=[]; let n=0;
  cur.forEach((row,i)=>{
    const f=mgmtFighterById(m,row.id);
    let delta=null;
    if(prev){ const j=prev.findIndex(x=>x.id===row.id); delta=j<0?'nouveau':j-i; }
    const champion=!!belt.id&&row.id===belt.id;
    const dernier=(f?mgmtResultatsDetail(m,f)[0]:null)||null;
    lignes.push({id:row.id,rang:champion?0:0,champion,delta,W:row.W,L:row.L,D:row.D||0,
      serie:f?mgmtSerieTexte(mgmtSerie(m,f)):'',
      dernier:dernier?{issue:dernier.issue,famille:MGMT_FAMILY_LABELS[dernier.family]||'',adv:mgmtNomParId(m,dernier.adv).last}:null});
  });
  /* Le champion en tête, puis les rangs 1, 2, 3 : le champion ne prend pas de numéro. */
  const tete=lignes.filter(x=>x.champion), reste=lignes.filter(x=>!x.champion);
  reste.forEach(x=>{ x.rang=++n; });
  return tete.concat(reste);
}

/* ---- Les ceintures ----------------------------------------------------------------------------------- */

/** La lignée de la ceinture d'une catégorie : les règnes, du plus ancien au plus récent, relus dans les faits. Chaque règne :
 *  {id,depuis (soirée, 0 : au début),jusqua (soirée de la perte, null : en cours),defenses,derniere:{fight,adv,n}|null}. */
function mgmtCeintureLignee(m,div){
  const soirees=mgmtSoirees(m);
  const numero=c=>{ let n=0; for(const s of soirees){ if(s.c<=c) n=s.n; } return n; };
  const reigns=[]; let cur=null;
  const ferme=n=>{ if(cur&&cur.jusqua===null) cur.jusqua=n; cur=null; };
  const ouvre=(id,n)=>{ cur={id,depuis:n,jusqua:null,defenses:0,derniere:null}; reigns.push(cur); };
  for(const fact of m.facts||[]){
    if(!fact) continue;
    if(fact.k==='title_initial'&&fact.div===div){ if(fact.a) ouvre(fact.a,0); }
    else if(fact.k==='retired'){
      const id=typeof fact.a==='string'?fact.a:(fact.a&&fact.a.id);
      if(cur&&cur.id===id) ferme(numero(fact.c));
    }else if(fact.k==='title_fight'&&fact.div===div){
      const t=m.hist&&m.hist[fact.fight]; if(!t||!t.a||!t.b) continue;
      const gagnant=t.winner==='A'?t.a:(t.winner==='B'?t.b:null); if(!gagnant) continue;
      const adv=gagnant===t.a?t.b:t.a, n=numero(fact.c);
      if(cur&&cur.id===gagnant.id){ cur.defenses++; cur.derniere={fight:fact.fight,adv:adv.id,n}; }
      else{ ferme(n); ouvre(gagnant.id,n); }
    }
  }
  const belt=mgmtSplitTitle(m,div);
  const actuel=reigns.length&&belt.id&&reigns[reigns.length-1].id===belt.id?reigns[reigns.length-1]:null;
  return {div,reigns,actuel,vacant:!belt.id,since:belt.since};
}

/** Le prétendant numéro un : le mieux classé de l'organisation qui n'est pas champion. Avec, s'il est sur la carte, son
 *  adversaire. null si personne. */
function mgmtPretendant(m,div){
  const belt=mgmtSplitTitle(m,div);
  const row=mgmtDivisionRanking(m,div,'organization').find(r=>r.id!==belt.id); if(!row) return null;
  const cf=typeof mgmtCardFights==='function'?mgmtCardFights(m).find(x=>x.a===row.id||x.b===row.id):null;
  return {id:row.id,surCarte:cf?{adv:cf.a===row.id?cf.b:cf.a,slot:cf.slot}:null};
}

/** « Depuis 8 mois » : la durée entre deux soirées (en jours si on les connaît), sinon null. */
function mgmtDureeTexte(m,nDebut,nFin){
  const a=mgmtSoireeJour(m,nDebut), b=mgmtSoireeJour(m,nFin);
  if(a===null||b===null) return null;
  const j=Math.max(0,b-a);
  if(j<30) return j+' JOUR'+(j>1?'S':'');
  return Math.round(j/30)+' MOIS';
}

/* ---- Les camps --------------------------------------------------------------------------------------- */

/** Ce qu'on travaille dans un camp : une spécialité tirée de la salle (stable, jamais stockée). */
function mgmtCampSpecialite(camp){
  return MGMT_CAMP_SPECIALITES[duelFnv1a32('specialite|'+camp.ck+'|'+camp.ville+'|'+camp.k)%MGMT_CAMP_SPECIALITES.length];
}
/** Le surcroît de progression qu'apporte la spécialité de son camp à un combattant : plein s'il en a le style, moitié pour
 *  le travail de fond (le cardio), rien sinon. Agenda actif seulement. */
function mgmtCampSpecBonus(m,f){
  if(typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)||!m.roster.includes(f)||m.effectifs!==1) return 0;
  const sp=mgmtCampSpecialite(mgmtCamp(m,f,m.cycle));
  if(sp.tous) return MGMT_CAMP_SPEC/2;
  return sp.styles.includes(mgmtCombatProfile(f).style)?MGMT_CAMP_SPEC:0;
}

/** Les salles où des combattants de Split s'entraînent ensemble (deux au moins, ou un champion) : celles que l'écran Camps fait
 *  défiler. Si presque aucune ne convient, les plus peuplées complètent. [{cle,nom,ville,pays,coach,specialite,membres:[ligne]}]. */
function mgmtCampsListe(m){
  const tous=mgmtCampsToutes(m), bons=tous.filter(g=>g.membres.length>=2||g.champion);
  return bons.length>=3?bons:tous.slice(0,Math.max(3,bons.length));
}
/** Toutes les salles où Split a au moins un combattant, les plus peuplées d'abord. */
function mgmtCampsToutes(m){
  const groupes=new Map();
  for(const f of m.roster||[]){
    if(!f||mgmtIsRetired(f)) continue;
    const c=mgmtCamp(m,f), cle=c.ck+'|'+c.ville+'|'+c.k;
    if(!groupes.has(cle)) groupes.set(cle,{cle,nom:c.nom,ville:c.ville,pays:COUNTRIES[c.ck].name,coach:c.coach,specialite:mgmtCampSpecialite(c),qualite:c.qualite,membres:[]});
    groupes.get(cle).membres.push(f);
  }
  const liste=[...groupes.values()];
  for(const g of liste){
    g.membres.sort((a,b)=>(mgmtDivisionRank(m,a)||99)-(mgmtDivisionRank(m,b)||99)||(a.id<b.id?-1:1));
    const ids=g.membres.map(f=>f.id), champions=new Set(allDivisions().map(d=>mgmtSplitTitle(m,d.id).id));
    g.champion=g.membres.some(f=>champions.has(f.id));
    g.refus=g.membres.some((a,i)=>g.membres.some((b,j)=>j>i&&a.div===b.div));
    g.ids=ids;
  }
  return liste.sort((a,b)=>b.membres.length-a.membres.length||(a.nom<b.nom?-1:(a.nom>b.nom?1:0))||(a.cle<b.cle?-1:1));
}

/* ---- Le fil de nouvelles ------------------------------------------------------------------------------ */

function mgmtFilCle(x){ return [x.k,x.c,x.a,x.b||'',x.f===undefined?'':x.f,x.w||'',x.p===undefined?'':x.p].join('|'); }

/** Ajoute une nouvelle si elle n'est pas déjà là. @returns {boolean} */
function mgmtFilAjoute(m,x){
  if(!Array.isArray(m.fil)) m.fil=[];
  const cle=mgmtFilCle(x);
  if(m.fil.some(y=>mgmtFilCle(y)===cle)) return false;
  if(typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)) x.j=m.cal.jour;
  m.fil.push(x);
  while(m.fil.length>MGMT_FIL_MAX) m.fil.shift();
  return true;
}

/** Une réplique d'annonce du combattant `a` pour son défi à `b`, dans sa voix (texte des voix : relu:false). */
function mgmtFilParole(m,a,b){
  const f=mgmtFighterById(m,a), adv=mgmtFighterById(m,b); if(!f) return '';
  const genre=(divById(f.div)||{}).gender;
  const ctx=mgmtVoixContexte(m,f,'annonce'); if(adv) ctx.adv=adv.name;
  const essayer=voixId=>{
    const liste=mgmtVoixRepliquesDe(voixId,'annonce'); if(!liste.length) return null;
    const r=mgmtIdentiteStream(f.id,'fil|'+b+'|'+m.cycle), debut=Math.floor(r()*liste.length);
    for(let k=0;k<liste.length;k++){
      const plein=mgmtVoixRemplit(mgmtVoixAccorde(liste[(debut+k)%liste.length].texte,genre),ctx);
      if(plein!==null) return plein;
    }
    return null;
  };
  return essayer(mgmtVoixActuelle(m,f))||essayer(MGMT_VOIX_COMMUNE)||'';
}

/** Met le fil à jour : les défis (demandes avec cible), les combats joués ce cycle (presse, ceintures), le public qui
 *  réclame une revanche ou un troisième combat, un combattant qui attend. Idempotent : rejouer n'ajoute rien. */
function mgmtFilMettreAJour(m){
  if(!m||m.effectifs!==1) return 0;
  let n=0; const c=m.cycle;
  for(const x of m.facts||[]){
    if(!x||x.c!==c||x.k!=='demande') continue;
    if(x.target){
      if(mgmtFilAjoute(m,{k:'defi',c,a:x.a,b:x.target,w:x.want,t:mgmtFilParole(m,x.a,x.target)})) n++;
    }else if(mgmtFilAjoute(m,{k:'combattant',c,a:x.a,w:'demande'})) n++;
  }
  const ev=m.lastEvent;
  if(ev&&ev.cycle===c&&Array.isArray(m.hist)){
    const rows=typeof mgmtTitleMemoryRows==='function'?mgmtTitleMemoryRows(m):new Map();
    const dernier=mgmtSoirees(m).filter(s=>s.c===c)[0];
    for(const fact of m.facts||[]){
      if(!fact||fact.k!=='title_fight'||fact.c!==c) continue;
      const t=m.hist[fact.fight]; if(!t||!t.a||!t.b) continue;
      const gagnant=t.winner==='A'?t.a:(t.winner==='B'?t.b:null); if(!gagnant) continue;
      const lab=rows.get(fact)&&rows.get(fact).label;
      const w=lab===MGMT_FACT_LABELS.title_retained?'garde':(lab===MGMT_FACT_LABELS.title_vacant?'vacant':'prend');
      if(mgmtFilAjoute(m,{k:'presse',c,a:gagnant.id,b:(gagnant===t.a?t.b:t.a).id,f:fact.fight,w})) n++;
    }
    if(dernier){
      /* Le combat principal de la soirée est la nouvelle de la semaine ; un titre en jeu l'a déjà dite à sa façon. */
      const tete=dernier.idx.map(i=>m.hist[i]).filter(t=>t.slot==='main'&&t.winner!=='D')[0];
      const ft=tete?m.hist.indexOf(tete):-1;
      if(tete&&!(m.facts||[]).some(x=>x&&x.k==='title_fight'&&x.fight===ft)){
        const g=tete.winner==='A'?tete.a:tete.b, p=tete.winner==='A'?tete.b:tete.a;
        if(mgmtFilAjoute(m,{k:'presse',c,a:g.id,b:p.id,f:ft,w:'resultat'})) n++;
      }
    }
    if(dernier&&typeof mgmtMediasLendemain==='function'){
      const tete=dernier.idx.map(i=>m.hist[i]).filter(t=>t.slot==='main'&&t.winner!=='D')[0];
      const fi=tete?m.hist.indexOf(tete):undefined;
      for(const l of mgmtMediasLendemain(m)){
        const b=tete?(tete.winner==='A'?tete.b:tete.a).id:'';
        if(mgmtFilAjoute(m,{k:'presse',c,a:l.id,b,f:fi,w:'media',x:l.media,t:l.texte})) n++;
      }
    }
  }
  if(typeof mgmtRivalites==='function'){
    for(const r of mgmtRivalites(m)){
      if(r.c!==c-1&&r.c!==c) continue;
      /* Brief démo, lot 4 (D3) : un seul combat réclamé, une seule carte — et la revanche est déjà portée par « Un défi ». */
      const meme=y=>y&&(y.k==='public'||y.k==='defi')&&((y.a===r.a&&y.b===r.b)||(y.a===r.b&&y.b===r.a));
      if((m.fil||[]).some(meme)) continue;
      if(mgmtFilAjoute(m,{k:'public',c,a:r.a,b:r.b,w:r.k,p:r.c})) n++;
    }
  }
  for(const x of m.facts||[]){
    if(!x||x.c!==c||x.k!=='attend') continue;
    const f=mgmtFighterById(m,x.a); if(!f) continue;
    const mois=Math.max(1,Math.round(mgmtContratAttente(m,f)*MGMT_VOIX_MOIS_PAR_CYCLE));
    if(mgmtFilAjoute(m,{k:'combattant',c,a:x.a,w:'attend',p:x.p,n:mois})) n++;
  }
  return n;
}

/** Le fil à lire, la plus récente d'abord ; `filtre` : null (tout) ou un des types. */
function mgmtFilListe(m,filtre){
  /* Une ligne de média n'est pas une nouvelle : elle commente celle du même combat (mgmtFilVoisine). */
  const l=(m.fil||[]).map((x,i)=>({x,i})).filter(o=>o.x.w!=='media'&&(!filtre||o.x.k===filtre));
  return l.sort((p,q)=>q.x.c-p.x.c||q.i-p.i).map(o=>o.x);
}

/** La ligne de média qui commente la nouvelle `x` : celle du même combat, sinon la plus récente. */
function mgmtFilVoisine(m,x){
  const liste=(m.fil||[]).filter(l=>l.k==='presse'&&l.w==='media'&&l.t);
  const memeCombat=Number.isSafeInteger(x.f)?liste.filter(l=>l.f===x.f):[];
  const pool=memeCombat.length?memeCombat:liste;
  return pool.length?pool[pool.length-1]:null;
}

/** « Il y a 2 jours » : l'âge d'une nouvelle (en jours de l'agenda, sinon en soirées). */
function mgmtFilAge(m,x){
  if(Number.isSafeInteger(x.j)&&typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)){
    const d=Math.max(0,m.cal.jour-x.j);
    if(d===0) return 'Aujourd’hui';
    if(d<14) return 'Il y a '+d+' jour'+(d>1?'s':'');
    if(d<60) return 'Il y a '+Math.round(d/7)+' semaines';
    return 'Il y a '+Math.round(d/30)+' mois';
  }
  const s=Math.max(0,m.cycle-x.c);
  return s===0?'Cette semaine':'Il y a '+s+' soirée'+(s>1?'s':'');
}

/** Le titre d'une nouvelle (modèle relu:false). */
function mgmtFilTitre(m,x){
  const a=mgmtNomParId(m,x.a).last, b=x.b?mgmtNomParId(m,x.b).last:'';
  const modele=(cle)=>MGMT_FIL_MODELES[cle].titre.replace('{a}',a).replace('{b}',b).replace('{n}',x.n===undefined?'':x.n);
  if(x.k==='defi') return modele('defi');
  if(x.k==='public') return MGMT_FIL_MODELES.public.titre;
  if(x.k==='combattant') return modele(x.w==='attend'?'attend':'demande');
  if(x.w==='garde'||x.w==='prend'||x.w==='vacant') return modele(x.w);
  if(x.w==='resultat') return a+' bat '+b;
  return x.t||'';
}

/** Une nouvelle de défi peut-elle se préparer maintenant ? Les deux combattants se choisissent sur la carte. */
function mgmtFilPreparable(m,x){
  if(!x||x.k!=='defi'&&x.k!=='public') return false;
  const a=mgmtFighterById(m,x.a), b=mgmtFighterById(m,x.b); if(!a||!b||a.div!==b.div) return false;
  return mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id);
}
/** Le combat de la nouvelle est-il déjà sur la carte ? */
function mgmtFilSurCarte(m,x){
  return mgmtCardFights(m).some(c=>(c.a===x.a&&c.b===x.b)||(c.a===x.b&&c.b===x.a));
}

/** Le fil est-il bien formé ? (validateMgmt et mgmtRepair) */
function mgmtFilValide(fil){
  if(!Array.isArray(fil)||fil.length>MGMT_FIL_MAX) return false;
  return fil.every(x=>x&&typeof x==='object'&&MGMT_FIL_TYPES.includes(x.k)&&Number.isSafeInteger(x.c)&&x.c>=0
    &&typeof x.a==='string'&&(x.b===undefined||typeof x.b==='string')&&(x.f===undefined||Number.isSafeInteger(x.f))
    &&(x.j===undefined||Number.isSafeInteger(x.j))&&(x.w===undefined||typeof x.w==='string')
    &&(x.t===undefined||typeof x.t==='string')&&(x.x===undefined||typeof x.x==='string')
    &&(x.p===undefined||Number.isSafeInteger(x.p))&&(x.n===undefined||Number.isSafeInteger(x.n)));
}
/* ==== [FIN ANCRE] ==== */
