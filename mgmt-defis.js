"use strict";
/* ==== [ANCRE: P11_T2_DEFIS_EVALUATION] — Monde lot 46 T1 ==== */
/* Les défis secondaires : lecture et évaluation (brief du 22/10/2026, P11 T2).

   m.defis est FACULTATIF et n'est créé qu'au premier défi réussi :
     {ok:{[idDefi]:{s:soiree}}}   — au plus MGMT_DEFIS_SAUVEGARDE_MAX entrées.
   Une fois réussi, un défi ne se perd jamais : l'état qui a permis de le
   réussir peut changer, la ligne reste. mgmtDefisSoiree est appelée une seule
   fois à la clôture de chaque soirée jouée (mgmt-corps.js, mgmtRunEvent) et
   rend les défis réussis à cette soirée. mgmtDefisListe rend le carnet.

   Aucun Math.random(), aucun rnd(), aucun écran. Un fait absent ne réussit
   jamais un défi : le test lit l'état, jamais une intention. */

const MGMT_DEFIS_SAISON_CYCLES=52;
const MGMT_DEFIS_SAUVEGARDE_MAX=60;
const MGMT_DEFIS_FINITIONS=Object.freeze(['ko','sub','stop']);

/** Le défi de données par son identifiant, ou null. Pur. */
function mgmtDefisTrouver(id){
  if(typeof id!=='string') return null;
  return MGMT_DEFIS.find(d=>d.id===id)||null;
}

/** Le côté de `id` dans un combat de m.hist, ou null. Pur. */
function mgmtDefisCote(t,id){
  if(!t||!t.a||!t.b) return null;
  if(t.a.id===id) return 'A';
  if(t.b.id===id) return 'B';
  return null;
}

/** Le bilan d'avant combat d'un coin de trace. Pur. */
function mgmtDefisBilan(side){
  if(!side) return 0;
  return (Number.isFinite(side.W)?side.W:0)-(Number.isFinite(side.L)?side.L:0);
}

/** Le combat a-t-il envoyé les deux combattants au tapis ? Pur. */
function mgmtDefisGuerre(t){
  if(!t||typeof mgmtReleveValide!=='function'||!mgmtReleveValide(t.s)) return false;
  const a=mgmtReleveCoin(t.s,'A'), b=mgmtReleveCoin(t.s,'B');
  return !!(a&&b&&a.kd>=1&&b.kd>=1);
}

/** La fiche financière de la soirée lue, ou null. Pur. */
function mgmtDefisFinanceSoiree(ctx){
  if(ctx.finance&&Number.isFinite(ctx.finance.spectateurs)) return ctx.finance;
  const c=ctx.comptes[ctx.comptes.length-1];
  return c&&Number.isFinite(c.spectateurs)?c:null;
}

/** Toutes les fiches de soirée connues (m.comptes, dernière soirée). Pur. */
function mgmtDefisFiches(ctx){
  const out=ctx.comptes.filter(c=>c&&Number.isFinite(c.spectateurs));
  if(ctx.finance&&Number.isFinite(ctx.finance.spectateurs)&&!out.some(c=>c.recette===ctx.finance.recette&&c.spectateurs===ctx.finance.spectateurs)) out.push(ctx.finance);
  return out;
}

/** Le maximum d'une liste de nombres finis. Pur. */
function mgmtDefisMax(liste){
  let m=0;
  for(const x of liste) if(Number.isFinite(x)&&x>m) m=x;
  return m;
}

/** Le contexte de lecture : les combats de la soirée, ceux de la saison
 *  (MGMT_DEFIS_SAISON_CYCLES cycles), les faits de titre, les fiches de
 *  soirée. Pur. */
function mgmtDefisContexte(m){
  const hist=Array.isArray(m&&m.hist)?m.hist:[];
  let cycle=null;
  if(m&&m.lastEvent&&Number.isSafeInteger(m.lastEvent.cycle)) cycle=m.lastEvent.cycle;
  else for(const t of hist) if(t&&Number.isSafeInteger(t.c)&&(cycle===null||t.c>cycle)) cycle=t.c;
  const soiree=[], saison=[];
  if(cycle!==null){
    for(let i=0;i<hist.length;i++){
      const t=hist[i];
      if(!t||!Number.isSafeInteger(t.c)) continue;
      if(t.c===cycle) soiree.push({t,i});
      if(t.c>cycle-MGMT_DEFIS_SAISON_CYCLES&&t.c<=cycle) saison.push({t,i});
    }
  }
  const facts=Array.isArray(m&&m.facts)?m.facts:[];
  const titleFacts=[];
  for(const f of facts){
    if(!f||f.k!=='title_fight'||!Number.isSafeInteger(f.fight)) continue;
    const t=hist[f.fight];
    if(t) titleFacts.push({f,t,i:f.fight});
  }
  titleFacts.sort((x,y)=>x.i-y.i);
  const comptes=Array.isArray(m&&m.comptes)?m.comptes.filter(c=>c&&typeof c==='object'):[];
  return {m,hist,cycle,soiree,saison,facts,titleFacts,comptes,finance:m&&m.lastEvent&&m.lastEvent.finance?m.lastEvent.finance:null};
}

/** Le vainqueur d'un combat de m.hist, ou null (nul, ligne illisible). Pur. */
function mgmtDefisVainqueur(t){
  if(!t||(t.winner!=='A'&&t.winner!=='B')) return null;
  return t.winner==='A'?t.a:t.b;
}

/** Le nombre de combats d'une liste qui vérifient le prédicat. Pur. */
function mgmtDefisCompter(rows,pred){
  let n=0;
  for(const x of rows) if(pred(x.t,x.i)) n++;
  return n;
}

/** La plus longue série de victoires sur une liste de combats, par
 *  combattant, sans franchir le début de la liste. Pure. */
function mgmtDefisSerieMax(rows){
  const courante=new Map();
  let max=0;
  for(const {t} of rows){
    if(!t||!t.a||!t.b) continue;
    if(t.winner==='A'||t.winner==='B'){
      const gagne=t.winner==='A'?t.a.id:t.b.id, perd=t.winner==='A'?t.b.id:t.a.id;
      const n=(courante.get(gagne)||0)+1;
      courante.set(gagne,n); courante.set(perd,0);
      if(n>max) max=n;
    }else{
      courante.set(t.a.id,0); courante.set(t.b.id,0);
    }
  }
  return max;
}

/** Les défenses de titre d'une liste de faits de titre triés : un vainqueur
 *  déjà couronné par un fait antérieur défend. Pure. */
function mgmtDefisDefenses(titleFacts){
  const couronnes=new Set();
  let n=0;
  for(const {t} of titleFacts){
    const v=mgmtDefisVainqueur(t);
    if(!v) continue;
    if(couronnes.has(v.id)) n++; else couronnes.add(v.id);
  }
  return n;
}

/** Les champions couronnés d'une liste de faits de titre. Pure. */
function mgmtDefisChampions(titleFacts){
  const s=new Set();
  for(const {t} of titleFacts){ const v=mgmtDefisVainqueur(t); if(v) s.add(v.id); }
  return s;
}

/** Les nouveaux champions d'une fenêtre (premier couronnement de leur
 *  carrière, dans la fenêtre). Pure. */
function mgmtDefisNouveauxChampions(titleFacts,depuisCycle){
  const deja=new Set();
  let n=0;
  for(const {f,t} of titleFacts){
    const v=mgmtDefisVainqueur(t);
    if(!v) continue;
    if(!deja.has(v.id)){
      deja.add(v.id);
      if(f.c>depuisCycle) n++;
    }
  }
  return n;
}

/** Un combattant du roster au rang demandé, ou null. Pure. */
function mgmtDefisRosterRang(m,{div,portee,rangMax}={}){
  if(!m||!Array.isArray(m.roster)||typeof mgmtDivisionRank!=='function') return null;
  for(const f of m.roster){
    if(!f||f.retired||(div&&f.div!==div)) continue;
    let rang=null;
    try{ rang=mgmtDivisionRank(m,f,portee==='monde'?'world':'organization'); }catch(_){ rang=null; }
    if(Number.isSafeInteger(rang)&&rang<=rangMax) return {id:f.id,rang};
  }
  return null;
}

/** Un espoir au rang mondial demandé, ou null. Pure. */
function mgmtDefisEspoirRang(m,rangMax){
  if(!m||!Array.isArray(m.espoirs)||!Array.isArray(m.roster)||typeof mgmtDivisionRank!=='function') return null;
  for(const id of m.espoirs){
    const f=m.roster.find(x=>x&&x.id===id);
    if(!f||f.retired) continue;
    let rang=null;
    try{ rang=mgmtDivisionRank(m,f,'world'); }catch(_){ rang=null; }
    if(Number.isSafeInteger(rang)&&rang<=rangMax) return {id,rang};
  }
  return null;
}

/* Le catalogue des tests : chaque type lit le contexte et ses paramètres.
   Aucune écriture, aucun tirage. */
const MGMT_DEFIS_TESTS=Object.freeze({
  soiree_combats:(c,t)=>c.soiree.length>=t.min,
  soiree_finitions:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family))>=t.min,
  soiree_finitions_r1:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family)&&x.round===1)>=t.min,
  soiree_ko:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&x.family==='ko')>=t.min,
  soiree_soumissions:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&x.family==='sub')>=t.min,
  soiree_decisions_max:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&x.family==='dec')<=t.max,
  soiree_guerres:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>mgmtDefisGuerre(x))>=t.min,
  soiree_titres:(c,t)=>c.facts.filter(f=>f&&f.k==='title_fight'&&f.c===c.cycle).length>=t.min,
  soiree_affluence:(c,t)=>{ const f=mgmtDefisFinanceSoiree(c); return !!f&&f.spectateurs>=t.min; },
  soiree_recette:(c,t)=>{ const f=mgmtDefisFinanceSoiree(c); return !!f&&Number.isFinite(f.recette)&&f.recette>=t.min; },
  soiree_finitions_prelim:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family)&&x.slot==='prelim')>=t.min,
  soiree_ko_rapide:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>x&&x.family==='ko'&&x.s&&Number.isFinite(x.s.d)&&x.s.d<=t.maxSecondes)>=1,
  soiree_surprise:(c,t)=>mgmtDefisCompter(c.soiree,(x)=>{
    if(!x||(x.winner!=='A'&&x.winner!=='B')) return false;
    const g=x.winner==='A'?x.a:x.b, p=x.winner==='A'?x.b:x.a;
    return mgmtDefisBilan(p)>mgmtDefisBilan(g);
  })>=t.min,

  saison_combats:(c,t)=>c.saison.length>=t.min,
  saison_victoires:(c,t)=>mgmtDefisCompter(c.saison,(x)=>x&&(x.winner==='A'||x.winner==='B'))>=t.min,
  saison_finitions:(c,t)=>mgmtDefisCompter(c.saison,(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family))>=t.min,
  saison_finitions_r1:(c,t)=>mgmtDefisCompter(c.saison,(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family)&&x.round===1)>=t.min,
  saison_guerres:(c,t)=>mgmtDefisCompter(c.saison,(x)=>mgmtDefisGuerre(x))>=t.min,
  saison_titres:(c,t)=>c.titleFacts.filter(({f})=>f.c>c.cycle-MGMT_DEFIS_SAISON_CYCLES).length>=t.min,
  saison_defenses:(c,t)=>{ const set=new Set(); let n=0; for(const {f,t:tr} of c.titleFacts){ const v=mgmtDefisVainqueur(tr); if(!v) continue; const defense=set.has(v.id); set.add(v.id); if(defense&&f.c>c.cycle-MGMT_DEFIS_SAISON_CYCLES) n++; } return n>=t.min; },
  saison_champion:(c,t)=>mgmtDefisNouveauxChampions(c.titleFacts,c.cycle-MGMT_DEFIS_SAISON_CYCLES)>=t.min,
  saison_serie:(c,t)=>mgmtDefisSerieMax(c.saison)>=t.min,
  saison_invaincu:(c,t)=>{ const bilan=new Map(); for(const {t} of c.saison){ if(!t||!t.a||!t.b) continue; for(const [id,cote] of [[t.a.id,'A'],[t.b.id,'B']]){ const x=bilan.get(id)||{w:0,l:0}; if(t.winner===cote)x.w++; else if(t.winner==='A'||t.winner==='B')x.l++; bilan.set(id,x); } } for(const x of bilan.values()) if(x.w>=t.min&&x.l===0) return true; return false; },
  saison_surnoms:(c,t)=>c.facts.filter(f=>f&&f.k==='surnom'&&Number.isSafeInteger(f.c)&&f.c>c.cycle-MGMT_DEFIS_SAISON_CYCLES).length>=t.min,
  saison_soirees:(c,t)=>new Set(c.saison.map(x=>x.t.c)).size>=t.min,
  saison_classement:(c,t)=>!!mgmtDefisRosterRang(c.m,{div:t.div,portee:t.portee,rangMax:t.rangMax}),
  saison_classement_monde:(c,t)=>!!mgmtDefisRosterRang(c.m,{div:t.div,portee:'monde',rangMax:t.rangMax}),
  saison_espoirs:(c,t)=>Array.isArray(c.m&&c.m.espoirs)&&c.m.espoirs.length>=t.min,
  saison_espoir_classe:(c,t)=>!!mgmtDefisEspoirRang(c.m,t.rangMax),

  carriere_champion_zero_zero:(c)=>c.titleFacts.some(({t})=>{ const v=mgmtDefisVainqueur(t); return !!v&&Number(v.W)===0&&Number(v.L)===0&&(!Number.isFinite(v.D)||Number(v.D)===0); }),
  carriere_salle_pleine:(c,t)=>mgmtDefisFiches(c).some(f=>Number.isFinite(f.capacite)&&f.capacite>=t.capaciteMin&&f.spectateurs>=f.capacite*t.tauxMin),
  carriere_affluence:(c,t)=>mgmtDefisMax(mgmtDefisFiches(c).map(f=>f.spectateurs))>=t.min,
  carriere_recette:(c,t)=>mgmtDefisMax(mgmtDefisFiches(c).map(f=>f.recette))>=t.min,
  carriere_victoires:(c,t)=>mgmtDefisCompter(c.hist.map((x,i)=>({t:x,i})),(x)=>x&&(x.winner==='A'||x.winner==='B'))>=t.min,
  carriere_finitions:(c,t)=>mgmtDefisCompter(c.hist.map((x,i)=>({t:x,i})),(x)=>x&&MGMT_DEFIS_FINITIONS.includes(x.family))>=t.min,
  carriere_titres:(c,t)=>c.titleFacts.length>=t.min,
  carriere_champions:(c,t)=>mgmtDefisChampions(c.titleFacts).size>=t.min,
  carriere_defenses:(c,t)=>mgmtDefisDefenses(c.titleFacts)>=t.min,
  carriere_serie:(c,t)=>mgmtDefisSerieMax(c.hist.map((x,i)=>({t:x,i})))>=t.min,
  carriere_soirees:(c,t)=>Number.isSafeInteger(c.m&&c.m.eventsPlayed)&&c.m.eventsPlayed>=t.min,
  carriere_caisse:(c,t)=>Number.isFinite(c.m&&c.m.treasury)&&c.m.treasury>=t.min,
  carriere_espoir_champion:(c)=>c.titleFacts.some(({t})=>{ const v=mgmtDefisVainqueur(t); return !!v&&Array.isArray(c.m&&c.m.espoirs)&&c.m.espoirs.includes(v.id); }),
  carriere_classement_premier:(c,t)=>!!mgmtDefisRosterRang(c.m,{portee:'monde',rangMax:Number.isSafeInteger(t.rangMax)?t.rangMax:1}),
});

const MGMT_DEFIS_TEST_TYPES=Object.freeze(Object.keys(MGMT_DEFIS_TESTS));

/** Un défi est-il réussi par l'état actuel ? Pure : ne modifie rien, ne tire
 *  rien, ne lève jamais. @returns {boolean} */
function mgmtDefiReussi(m,id){
  const d=mgmtDefisTrouver(id);
  if(!d||!d.test||!MGMT_DEFIS_TESTS[d.test.type]) return false;
  let ctx=null;
  try{ ctx=mgmtDefisContexte(m); }catch(_){ return false; }
  try{ return !!MGMT_DEFIS_TESTS[d.test.type](ctx,d.test); }catch(_){ return false; }
}

/** Évalue les défis non encore réussis à la clôture d'une soirée, enregistre
 *  les nouveaux dans m.defis (créé au premier succès) et rend les défis
 *  réussis à cette soirée. Un défi réussi ne se perd jamais. Jamais de rnd().
 *  @returns {Array<{id,titre,texte,famille,ok,s}>} */
function mgmtDefisSoiree(m){
  if(!m||typeof m!=='object') return [];
  const nouveaux=[];
  for(const d of MGMT_DEFIS){
    if(m.defis&&m.defis.ok&&m.defis.ok[d.id]) continue;
    if(!mgmtDefiReussi(m,d.id)) continue;
    if(!m.defis||typeof m.defis!=='object'||Array.isArray(m.defis)) m.defis={ok:{}};
    if(!m.defis.ok||typeof m.defis.ok!=='object'||Array.isArray(m.defis.ok)) m.defis.ok={};
    if(Object.keys(m.defis.ok).length>=MGMT_DEFIS_SAUVEGARDE_MAX) break;
    const s=Number.isSafeInteger(m.eventsPlayed)&&m.eventsPlayed>=0?m.eventsPlayed:0;
    m.defis.ok[d.id]={s};
    nouveaux.push({id:d.id,titre:d.titre,texte:d.texte,famille:d.famille,ok:true,s});
  }
  return nouveaux;
}

/** Le carnet : chaque défi dans l'ordre du catalogue, réussi ou non. Ne
 *  modifie rien. @returns {Array<{id,titre,texte,famille,ok,s}>} */
function mgmtDefisListe(m){
  return MGMT_DEFIS.map(d=>{
    const v=m&&m.defis&&m.defis.ok?m.defis.ok[d.id]:null;
    const ok=!!v;
    return {id:d.id,titre:d.titre,texte:d.texte,famille:d.famille,ok,s:ok&&Number.isSafeInteger(v.s)?v.s:null};
  });
}

/** m.defis est-il bien formé ? Les identifiants connus, au plus soixante
 *  entrées, une soirée entière par entrée. Pure. */
function mgmtDefisValide(d){
  if(!d||typeof d!=='object'||Array.isArray(d)) return false;
  if(Object.keys(d).some(k=>k!=='ok')) return false;
  if(!d.ok||typeof d.ok!=='object'||Array.isArray(d.ok)) return false;
  const ids=Object.keys(d.ok);
  if(ids.length>MGMT_DEFIS_SAUVEGARDE_MAX) return false;
  for(const id of ids){
    if(!mgmtDefisTrouver(id)) return false;
    const x=d.ok[id];
    if(!x||typeof x!=='object'||Array.isArray(x)) return false;
    if(Object.keys(x).some(k=>k!=='s')) return false;
    if(!Number.isSafeInteger(x.s)||x.s<0) return false;
  }
  return true;
}

/** Réparation tolérante de m.defis : on garde chaque entrée lisible d'un
 *  défi connu, on écarte le reste, on plafonne à soixante. Rend null quand
 *  l'enveloppe elle-même est illisible (l'appelant efface le champ). Pure
 *  sur son argument (nouvel objet). */
function mgmtDefisReparer(d){
  if(!d||typeof d!=='object'||Array.isArray(d)) return null;
  if(!d.ok||typeof d.ok!=='object'||Array.isArray(d.ok)) return null;
  const ok={};
  for(const [id,x] of Object.entries(d.ok)){
    if(Object.keys(ok).length>=MGMT_DEFIS_SAUVEGARDE_MAX) break;
    if(!mgmtDefisTrouver(id)) continue;
    if(!x||typeof x!=='object'||Array.isArray(x)) continue;
    if(!Number.isSafeInteger(x.s)||x.s<0) continue;
    ok[id]={s:x.s};
  }
  return {ok};
}
