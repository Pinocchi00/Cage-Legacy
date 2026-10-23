"use strict";
/* ==== [ANCRE: P2_T5_SURNOMS_GAGNES_CALCUL] — Monde lot 40 T1 ==== */
const MGMT_SURNOMS_GAGNES_TYPES=Object.freeze(['ko','eclair','soumission','guerre','serie']);
function mgmtSurnomsGagnesValide(s){
  if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).length>200) return false;
  return Object.entries(s).every(([id,x])=>id.length<=80&&x&&typeof x==='object'&&typeof x.n==='string'&&x.n.length<=24&&Number.isSafeInteger(x.s)&&x.s>=0&&MGMT_SURNOMS_GAGNES_TYPES.includes(x.t));
}
function mgmtSurnomsGagnesReparer(s){
  if(!s||typeof s!=='object'||Array.isArray(s)) return undefined;
  for(const [id,x] of Object.entries(s)) if(id.length>80||!x||typeof x!=='object'||typeof x.n!=='string'||x.n.length>24||!Number.isSafeInteger(x.s)||x.s<0||!MGMT_SURNOMS_GAGNES_TYPES.includes(x.t)) delete s[id];
  if(Object.keys(s).length>200) for(const id of Object.keys(s).slice(200)) delete s[id];
  return s;
}
function mgmtSurnomsGagnesCombats(m,id){return (m.hist||[]).filter(t=>t&&t.a&&t.b&&(t.a.id===id||t.b.id===id)).sort((a,b)=>a.c-b.c);}
function mgmtSurnomsGagnesVictoire(t,id){return !!t&&((t.a.id===id&&t.winner==='A')||(t.b.id===id&&t.winner==='B'));}
function mgmtSurnomsGagnesSerie(combats,id,n,predicat){
  const suite=combats.slice(-n);
  return suite.length===n&&suite.every(t=>mgmtSurnomsGagnesVictoire(t,id)&&predicat(t));
}
function mgmtSurnomsGagnesEvaluer(m){
  if(!m||m.surnomsGagnes!==true||!Array.isArray(m.hist)) return [];
  if(!m.surnoms||typeof m.surnoms!=='object') m.surnoms={};
  if(Object.keys(m.surnoms).length>=200) return [];
  const duCycle=m.hist.filter(t=>t&&t.c===m.cycle),ids=[...new Set(duCycle.flatMap(t=>[t.a&&t.a.id,t.b&&t.b.id]).filter(Boolean))];
   if(!ids.length) return [];
   const saison=Math.floor(Math.max(0,(Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0)-1)/12),deja=Object.values(m.surnoms).filter(x=>Math.floor(Math.max(0,x.s-1)/12)===saison).length;
  if(deja>=4) return [];
  const candidats=[];
  for(const id of ids){
     const f=mgmtFighterById(m,id); if(m.surnoms[id]||!f||mgmtIdentiteSurnom(m,f)==='') continue;
     const combats=mgmtSurnomsGagnesCombats(m,id),parType={ko:0,eclair:0,soumission:0,guerre:0,serie:0};
     const wins=combats.filter(t=>mgmtSurnomsGagnesVictoire(t,id));
     if(mgmtSurnomsGagnesSerie(combats,id,3,t=>t.family==='ko')) parType.ko=1;
     if(mgmtSurnomsGagnesSerie(combats,id,2,t=>t.round===1&&['ko','sub','stop'].includes(t.family))) parType.eclair=1;
     if(mgmtSurnomsGagnesSerie(combats,id,3,t=>t.family==='sub')) parType.soumission=1;
     if(duCycle.some(t=>{
       if(t.rounds!==5||!t.s||!mgmtReleveValide(t.s)) return false;
       const cote=t.a.id===id?'A':t.b.id===id?'B':null,coin=cote&&mgmtReleveCoin(t.s,cote);
       return !!coin&&coin.kd>=2;
     })) parType.guerre=1;
     if(m.org==='Split'&&mgmtSurnomsGagnesSerie(combats,id,6,()=>true)) parType.serie=1;
     const type=MGMT_SURNOMS_GAGNES_TYPES.find(t=>parType[t]); if(type) candidats.push({id,type,wins:wins.length});
  }
  candidats.sort((a,b)=>b.wins-a.wins||a.id.localeCompare(b.id));
  for(const c of candidats){
    const f=mgmtFighterById(m,c.id),banque=MGMT_SURNOMS_GAGNES[c.type],langue=mgmtIdentiteLangue(mgmtIdentitePays(f)),variantes=banque.noms[langue]||banque.noms.en;
    const pris=mgmtIdentiteSurnomsDe(m,f.div),dispo=variantes.filter(n=>!pris.has(n)); if(!dispo.length) continue;
    const nom=dispo[Math.floor(mgmtIdentiteStream(c.id,'surnom-gagne|'+c.type,m)()*dispo.length)];
    m.surnoms[c.id]={n:nom,s:m.eventsPlayed||0,t:c.type};
    mgmtAddFact(m,{c:m.cycle,k:'surnom',a:c.id,nom,t:c.type,s:m.eventsPlayed||0});
    return [{id:c.id,nom,t:c.type,s:m.eventsPlayed||0}];
  }
  return [];
}
