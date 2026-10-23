"use strict";
/* ==== [ANCRE: P6_T3_MEMOIRE_CALCUL] — Monde lot 47 T1 ==== */
function mgmtMemoireValide(v){
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>120)return false;
  return Object.entries(v).every(([id,e])=>id.length<=80&&e&&typeof e==='object'&&!Array.isArray(e)&&Array.isArray(e.s)&&e.s.length<=8&&Number.isInteger(e.p)&&e.p>=0&&e.p<MGMT_MEMOIRE.niveaux.length&&e.s.every(x=>Array.isArray(x)&&x.length===2&&MGMT_MEMOIRE.types[x[0]]&&Number.isSafeInteger(x[1])&&x[1]>=0));
}
function mgmtMemoirePense(m,id){
  const e=m&&m.memoire&&m.memoire[id];if(!e)return null;const n=MGMT_MEMOIRE.niveaux[e.p];if(!n)return null;
  const f=mgmtFighterById(m,id),nom=f&&f.name||String(id),i=mgmtHashId(id+'|memoire|'+e.p)%3;
  return {niveau:n.id,label:n.label,phrase:n.fiche[i].replaceAll('{nom}',nom),presse:n.presse[i].replaceAll('{nom}',nom)};
}
function mgmtMemoireAjouter(m,id,type){
  if(!m||!id||!MGMT_MEMOIRE.types[type])return;
  if(!m.memoire)m.memoire={};let e=m.memoire[id];if(!e||!Array.isArray(e.s))e=m.memoire[id]={s:[],p:2};
  if(e.s.some(x=>x[0]===type&&x[1]===m.cycle))return;
  e.s.push([type,m.cycle]);e.s=e.s.slice(-8);
}
/* Score = somme du poids * (1 - ancienneté / durée), recalculé à chaque soirée. */
function mgmtMemoireSoiree(m){
  if(!m||!Array.isArray(m.roster))return m;
  const c=Number.isSafeInteger(m.cycle)?m.cycle:0,combats=(m.hist||[]).filter(t=>t&&t.c===c),ids=new Set();
  for(const t of combats){for(const x of [t.a,t.b])if(x&&x.id)ids.add(x.id);if(t.title_fight){const w=t.winner==='A'?t.a:t.winner==='B'?t.b:null;if(w&&w.id)mgmtMemoireAjouter(m,w.id,'titre-accorde');}}
  for(const f of m.roster){if(!f||!f.id)continue;const a=(m.hist||[]).filter(t=>t&&t.c===c&&(t.a&&t.a.id===f.id||t.b&&t.b.id===f.id));
    if(!a.length&&Number.isSafeInteger(f.attente)&&f.attente>=4)mgmtMemoireAjouter(m,f.id,'attente-longue');
    if((m.facts||[]).some(x=>x&&x.c===c&&x.a===f.id&&x.k==='refus'))mgmtMemoireAjouter(m,f.id,'combat-refuse');
    if(ids.has(f.id)&&a.some(t=>t.slot==='prelim'))mgmtMemoireAjouter(m,f.id,'relegation');
    const e=m.memoire&&m.memoire[f.id];if(!e)continue;
    if(!Array.isArray(e.s))continue;
    e.s=e.s.filter(([type,when])=>MGMT_MEMOIRE.types[type]&&c-when<MGMT_MEMOIRE.types[type].duree);
    const score=e.s.reduce((s,[type,when])=>s+MGMT_MEMOIRE.types[type].poids*Math.max(0,1-(c-when)/MGMT_MEMOIRE.types[type].duree),0);
    let p=0;for(let i=1;i<MGMT_MEMOIRE.niveaux.length;i++)if(score>=MGMT_MEMOIRE.niveaux[i].seuil)p=i;e.p=p;
  }
  if(m.memoire){for(const id of Object.keys(m.memoire))if(!mgmtFighterById(m,id))delete m.memoire[id];const idsM=Object.keys(m.memoire);while(idsM.length>120)delete m.memoire[idsM.shift()];}
  if(typeof mgmtActuSourceAjouter==='function'){
    const complaints=Object.entries(m.memoire||{}).filter(([,e])=>e&&e.p>=4&&(!Number.isSafeInteger(e.d)||c-e.d>=MGMT_MEMOIRE.effets.intervallePresse));
    for(const [id,e] of complaints)e.d=c;
    if(complaints.length)m.facts=(m.facts||[]).concat(complaints.map(([id])=>({c,k:'memoire-presse',a:id})));
  }
  return m;
}
/* ==== [ANCRE: P6_T3_MEMOIRE_PRESSE] — Monde lot 47 T1 ==== */
if(typeof mgmtActuSourceAjouter==='function')mgmtActuSourceAjouter({type:'memoire',lire(m,ids,depuis){
  return (m.facts||[]).filter(x=>x&&x.k==='memoire-presse'&&ids.includes(x.a)&&x.c>=depuis).map(x=>{const p=mgmtMemoirePense(m,x.a);return p?{type:'memoire',c:x.c,id:x.a,donnees:{phrase:p.presse,niveau:p.niveau}}:null;}).filter(Boolean);
}});
