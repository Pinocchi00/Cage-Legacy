"use strict";
/* ==== [ANCRE: P1_T6A_MEILLEURS] — Monde lot 31 T6a ==== */
const MGMT_LEADERS_MEMO=new WeakMap();
function mgmtLeadersFighter(m,id){
  return (m.roster||[]).find(f=>f&&f.id===id)||(m.mondeVivant===true?Object.values(m.orgs||{}).flatMap(o=>o&&o.roster||[]).find(f=>f&&f.id===id):null)||mgmtExteriorCombattant(m,id);
}
function mgmtMeilleurs(m,{divId,portee}={}){
  if(!m||!divId||(portee!=='split'&&portee!=='monde')) return [];
  const idx=mgmtStatsIndex(m),ids=new Set((m.roster||[]).filter(f=>f&&f.div===divId&&!mgmtIsRetired(f)).map(f=>f.id));
  if(portee==='monde'){
    if(m.mondeVivant===true){
      for(const o of Object.values(m.orgs||{})) for(const f of o&&o.roster||[]) if(f&&f.div===divId&&!mgmtIsRetired(f))ids.add(f.id);
    }else{
      for(const f of mgmtDivisionRanking(m,divId,'world')) ids.add(f.id);
    }
  }
  if(ids.size===0)return [];
  const defs=[['finitions',s=>s.vParMethode.ko+s.vParMethode.sub+s.vParMethode.stop,3],['volume',s=>s.sigParMin,5],['precis',s=>s.precision,5],['defense',s=>s.defense,5],['lutteur',s=>s.ameneesPar15,3],['mur',s=>s.defenseAmenee,5],['cou',s=>s.soumissionsPar15,3],['serie',s=>s.serieMax,3]];
  return defs.map(([id,val,min])=>({id,rang:Array.from(ids).map(fid=>{const s=mgmtStatsCarriere(m,fid),f=mgmtLeadersFighter(m,fid);return {id:fid,nom:f&&(f.nom||f.name)||fid,valeur:s&&s.docs>=min?val(s):null,docs:s?s.docs:0};}).filter(x=>x.valeur!==null&&Number.isFinite(x.valeur)&&(id!=='mur'||x.valeur!==null)).sort((a,b)=>b.valeur-a.valeur||b.docs-a.docs||a.id.localeCompare(b.id)).slice(0,3).map(({id:fid,nom,valeur})=>({id:fid,nom,valeur}))}));
}
function mgmtRecords(m){
  if(!m||!Array.isArray(m.hist))return {unCombat:[],carriere:[],battu:null};
  const vigor=m.hist.length,old=MGMT_LEADERS_MEMO.get(m);if(old&&old.vigor===vigor)return old.value;
  const one=[['sigAtt',(a,b)=>Math.max(a.sigAtt,b.sigAtt)],['koRapide',null],['amenees',(a,b)=>Math.max(a.td,b.td)],['knockdowns',(a,b)=>a.kd+b.kd],['controle3',(a,b)=>Math.max(a.ctrlSec,b.ctrlSec)],['corps',(a,b)=>Math.max(a.body,b.body)]];
  const single=new Map(one.map(([id])=>[id,null])), streaks=new Map(), titleRuns=new Map(); let maxCycle=-Infinity,battu=null;
  const rosterIds=new Set((m.roster||[]).map(f=>f&&f.id).filter(Boolean)), titleFacts=new Set((m.facts||[]).filter(f=>f&&f.k==='title_fight'&&Number.isSafeInteger(f.fight)).map(f=>f.fight));
  const label=(id)=>{const f=mgmtLeadersFighter(m,id);return {id,nom:f&&(f.nom||f.name)||id};};
  const setRecord=(id,value,fight,opp)=>{const prev=single.get(id);if(prev&&!(id==='koRapide'?value<prev.valeur:value>prev.valeur))return;single.set(id,{id,valeur:value,combattant:label(fight.id),adversaire:opp?label(opp.id):undefined,c:fight.t.c,soiree:fight.t.c,avant:prev?{valeur:prev.valeur,combattant:prev.combattant,soiree:prev.soiree}:null});const r=single.get(id);if(fight.t.c===maxCycle&&r.avant){const ratio=Math.abs(value-r.avant.valeur)/(Math.abs(r.avant.valeur)||1);if(!battu||ratio>battu.ratio)battu={...r,ratio};}};
  for(const t of m.hist){if(!t||!t.a||!t.b||!mgmtReleveValide(t.s))continue;const aa=mgmtReleveCoin(t.s,'A'),bb=mgmtReleveCoin(t.s,'B');if(!aa||!bb)continue;
    if(Number.isFinite(t.c)&&t.c>maxCycle){maxCycle=t.c;battu=null;}
    const sides=[[t.a,t.b,aa,bb,'A'],[t.b,t.a,bb,aa,'B']];
    for(const [fighter,opp,a,b,side] of sides){for(const [id,fn] of one){if(!fn)continue;const v=fn(a,b);if(id==='controle3'&&t.rounds!==3)continue;setRecord(id,v,{id:fighter.id,t},opp);}if(t.family==='ko'&&t.winner===side)setRecord('koRapide',t.s.d,{id:fighter.id,t},opp);}
    if(t.winner==='A'||t.winner==='B'){const win=t.winner==='A'?t.a:t.b,lose=t.winner==='A'?t.b:t.a,id=win.id;streaks.set(id,(streaks.get(id)||0)+1);streaks.set(lose.id,0);}
    else {streaks.set(t.a.id,0);streaks.set(t.b.id,0);}
  }
  const carriere=[];
  const best=(id,get)=>{let b=null;for(const [fighter,value] of get())if(!b||value>b.valeur)b={id,valeur:value,combattant:label(fighter),c:maxCycle,soiree:maxCycle,avant:null};if(b)carriere.push(b);};
  best('finitions',()=>{const out=new Map();for(const [id,x] of mgmtStatsIndex(m))if(rosterIds.has(id))out.set(id,x.vKO+x.vSub+x.vStop);return out;});
  best('victoiresSuite',()=>Array.from(streaks));
  best('combats',()=>Array.from(mgmtStatsIndex(m),([id,x])=>[id,x.n]).filter(([id])=>rosterIds.has(id)));
  for(let i=0;i<m.hist.length;i++){
    const t=m.hist[i]; if(!t||!t.a||!t.b||!mgmtReleveValide(t.s))continue;
    if(titleFacts.has(i)){
      if(t.winner==='A'||t.winner==='B'){const id=(t.winner==='A'?t.a:t.b).id;titleRuns.set(id,(titleRuns.get(id)||0)+1);}
      else titleRuns.clear();
    }
  }
  best('defensesTitre',()=>Array.from(titleRuns).map(([id,n])=>[id,Math.max(0,n-1)]));
  best('plusJeuneChampion',()=>{let b=null;for(const i of titleFacts){const t=m.hist[i];if(!t||!t.a||!t.b||!mgmtReleveValide(t.s)||!['A','B'].includes(t.winner))continue;const fighter=t.winner==='A'?t.a:t.b,side=fighter===t.a?'a':'b',age=t[side]&&t[side].age;if(rosterIds.has(fighter.id)&&Number.isFinite(age)&&(!b||age<b[1]))b=[fighter.id,age];}return b?[[b[0],b[1]]]:[];});
  const result={unCombat:one.map(([id])=>single.get(id)).filter(Boolean),carriere,battu};MGMT_LEADERS_MEMO.set(m,{vigor,value:result});return result;
}
