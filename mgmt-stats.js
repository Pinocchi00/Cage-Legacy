"use strict";
/* ==== [ANCRE: P1_T3_STATS] — Monde lot 31 T3 ==== */
const MGMT_STATS_CHIFFRES=['sigParMin','precision','defense','sigEncaisseParMin','ameneesPar15','reussiteAmenee','defenseAmenee','soumissionsPar15','controlePar15','kdDonnes','kdRecus','dureeMoyenne'];
/* Les taux et durées de dégâts subis, les knock-downs reçus et la durée : plus bas est meilleur. */
const MGMT_STATS_SENS={sigParMin:'haut',precision:'haut',defense:'haut',sigEncaisseParMin:'bas',ameneesPar15:'haut',reussiteAmenee:'haut',defenseAmenee:'haut',soumissionsPar15:'haut',controlePar15:'haut',kdDonnes:'haut',kdRecus:'bas',dureeMoyenne:'bas'};
const MGMT_STATS_MEMO=new WeakMap();
const MGMT_STATS_CATEGORIE_MEMO=new WeakMap();
const MGMT_STATS_KEYS=['sig','sigAtt','total','totalAtt','head','body','leg','dist','clinch','ground','td','tdAtt','tdDef','subAtt','kd','ctrlSec','pwr'];
function mgmtStatsNouveau(){
  const z=()=>Object.fromEntries(MGMT_STATS_KEYS.map(k=>[k,0]));
  return {n:0,tot:null,sec:0,pour:z(),contre:z(),victoires:0,defaites:0,nuls:0,vKO:0,vSub:0,vStop:0,vDec:0,dKO:0,dSub:0,dStop:0,dDec:0,finitionsR1:0,serieMax:0,_serie:0,titres:0,primes:0,_combats:[]};
}
function mgmtStatsCombattant(m,id){
  const f=(m.roster||[]).find(x=>x&&x.id===id)||(m.mondeVivant===true?Object.values(m.orgs||{}).flatMap(o=>o&&o.roster||[]).find(x=>x&&x.id===id):null)||mgmtExteriorCombattant(m,id);
  return f&&Number.isFinite(f.W)&&Number.isFinite(f.L)?Math.max(0,f.W+(f.L||0)+(f.D||0)):null;
}
function mgmtStatsPaire(t){return `${t.c}|${t.a&&t.a.id}|${t.b&&t.b.id}|${t.winner}|${t.family}|${t.round}|${t.duo?'duo':''}`;}
function mgmtStatsIndex(m){
  if(!m||typeof m!=='object') return new Map();
  const orgs=m.mondeVivant===true&&m.orgs&&typeof m.orgs==='object'?Object.values(m.orgs):[];
  const lengths=[Array.isArray(m.hist)?m.hist.length:0,...orgs.map(o=>Array.isArray(o.hist)?o.hist.length:0)];
  const vigueur=lengths.join(',');
  const memo=MGMT_STATS_MEMO.get(m); if(memo&&memo.vigueur===vigueur) return memo.index;
  const index=new Map(), vus=new Set();
  const parcourir=h=>{for(const t of Array.isArray(h)?h:[]){
    if(!t||!t.a||!t.b||!mgmtReleveValide(t.s)) continue;
    const key=mgmtStatsPaire(t); if(vus.has(key)) continue; vus.add(key);
    const a=mgmtReleveCoin(t.s,'A'),b=mgmtReleveCoin(t.s,'B'); if(!a||!b) continue;
    for(const [side,opp,coin,against] of [[t.a,t.b,a,b],[t.b,t.a,b,a]]){
      let x=index.get(side.id); if(!x){x=mgmtStatsNouveau();index.set(side.id,x);}
      x.n++; x.sec+=a.d; MGMT_STATS_KEYS.forEach(k=>{if(Number.isFinite(coin[k]))x.pour[k]+=coin[k];if(Number.isFinite(against[k]))x.contre[k]+=against[k];});
      const win=t.winner==='D'?'N':t.winner===(side===t.a?'A':'B')?'V':'D';
      const family=({ko:'KO',sub:'Sub',stop:'Stop',dec:'Dec'})[t.family];
      if(win==='V'){x.victoires++;if(family)x['v'+family]++;if(family&&family!=='Dec'&&t.round===1)x.finitionsR1++;x._serie++;x.serieMax=Math.max(x.serieMax,x._serie);}
      else if(win==='D'){x.defaites++;if(family)x['d'+family]++;x._serie=0;}else{x.nuls++;x._serie=0;}
      x._combats.push({t,slot:t.slot||'main',adversaire:{id:opp.id,name:opp.name||''},resultat:win,famille:t.family||null,round:t.round,rounds:t.rounds,pour:coin,contre:against,d:a.d});
    }
  }};
  parcourir(m.hist); for(const o of orgs) parcourir(o&&o.hist);
  for(const fact of m.facts||[]) if(fact&&fact.k==='title_fight'&&Number.isSafeInteger(fact.fight)){
    const t=(m.hist||[])[fact.fight]; if(!t||!t.a||!t.b||t.winner==='D') continue;
    const x=index.get(t.winner==='A'?t.a.id:t.b.id); if(x)x.titres++;
  }
  for(const [id,x] of index) x.tot=mgmtStatsCombattant(m,id);
  MGMT_STATS_MEMO.set(m,{vigueur,index}); return index;
}
function mgmtStatsCarriere(m,id){
  const x=mgmtStatsIndex(m).get(id); if(!x||!x.n)return null;
  const p=x.pour,c=x.contre,min=x.sec/60,quinze=x.sec/900;
  const pct=(a,b)=>b?a/b:null;
  const sigParMin=pct(p.sig,min), precision=pct(p.sig,p.sigAtt), defense=c.sigAtt?1-c.sig/c.sigAtt:null,
    sigEncaisseParMin=pct(c.sig,min), ameneesPar15=pct(p.td,quinze), reussiteAmenee=pct(p.td,p.tdAtt),
    defenseAmenee=c.tdAtt?1-c.td/c.tdAtt:null, soumissionsPar15=pct(p.subAtt,quinze), controlePar15=pct(p.ctrlSec,quinze),
    kdDonnes=p.kd,kdRecus=c.kd,dureeMoyenne=pct(x.sec,x.n);
  return {docs:x.n,bilan:x.tot,sigParMin,precision,defense,sigEncaisseParMin,ameneesPar15,reussiteAmenee,defenseAmenee,soumissionsPar15,controlePar15,kdDonnes,kdRecus,dureeMoyenne,
    vParMethode:{ko:x.vKO,sub:x.vSub,stop:x.vStop,dec:x.vDec},dParMethode:{ko:x.dKO,sub:x.dSub,stop:x.dStop,dec:x.dDec},finitionsR1:x.finitionsR1,serieMax:x.serieMax,titres:x.titres,primes:x.primes,
    repartition:{cibles:{head:p.sig?p.head/p.sig:null,body:p.sig?p.body/p.sig:null,leg:p.sig?p.leg/p.sig:null},positions:{dist:p.sig?p.dist/p.sig:null,clinch:p.sig?p.clinch/p.sig:null,ground:p.sig?p.ground/p.sig:null}}};
}
function mgmtStatsCategorie(m,divId){
  const idx=mgmtStatsIndex(m), memo=MGMT_STATS_CATEGORIE_MEMO.get(m);
  if(memo&&memo.index===idx&&memo.categories.has(divId)) return memo.categories.get(divId);
  const ids=new Set((m.roster||[]).filter(f=>f&&f.div===divId&&!mgmtIsRetired(f)).map(f=>f.id));
  if(m.mondeVivant===true) for(const f of mgmtExteriorEffectifs(m,divId))ids.add(f.id);
  const rows=[]; for(const id of ids){const x=idx.get(id);if(x&&x.n>=3){const s=mgmtStatsCarriere(m,id);if(s)rows.push([id,s]);}}
  const moyennes={};for(const k of MGMT_STATS_CHIFFRES){const vals=rows.map(([,s])=>s[k]).filter(Number.isFinite);moyennes[k]=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;}
  const rangs=new Map(); for(const [id] of rows)rangs.set(id,{});
  for(const k of MGMT_STATS_CHIFFRES){const ord=rows.filter(([,s])=>Number.isFinite(s[k])).sort((a,b)=>(MGMT_STATS_SENS[k]==='bas'?a[1][k]-b[1][k]:b[1][k]-a[1][k])||a[0].localeCompare(b[0]));ord.forEach(([id],i)=>{rangs.get(id)[k]=i+1;});}
  const result={n:rows.length,moyennes,rangs}, categories=memo&&memo.index===idx?memo.categories:new Map();
  categories.set(divId,result); MGMT_STATS_CATEGORIE_MEMO.set(m,{index:idx,categories}); return result;
}
function mgmtStatsCombats(m,id){const x=mgmtStatsIndex(m).get(id);return x?x._combats.slice().reverse().map(({_index,...c})=>c):[];}
function mgmtStatsDocumentes(m,id){const x=mgmtStatsIndex(m).get(id);return x?{docs:x.n,bilan:x.tot}:null;}
