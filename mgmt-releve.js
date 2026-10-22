"use strict";
/* ==== [ANCRE: P1_T1_RELEVE] — Monde lot 31 T1 ==== */
const MGMT_RELEVE_ROUND=['sig','sigAtt','total','totalAtt','head','body','leg','td','tdAtt','tdDef','kd','ctrlSec','subAtt','pwr'];
const MGMT_RELEVE_TOTAL=['headAtt','bodyAtt','legAtt','dist','distAtt','clinch','clinchAtt','ground','groundAtt','subEscapes','reversals','guardPasses'];
function mgmtReleveEntier(x){ return Math.max(0,Math.round(Number.isFinite(x)?x:0)); }
function mgmtReleveDeResultat(res,rounds){
  const stats=res&&res.stats||{}, parRound=Array.isArray(res&&res.roundStats)?res.roundStats:[];
  const n=Math.max(1,Math.min(5,parRound.length|| (Number.isSafeInteger(res&&res.round)?res.round:rounds)));
  const r=Array.from({length:n},(_,i)=>['A','B'].flatMap(c=>MGMT_RELEVE_ROUND.map(k=>mgmtReleveEntier(parRound[i]&&parRound[i][(k==='ctrlSec'?'ctrlSec':k)+c]))));
  const e=['A','B'].map(c=>MGMT_RELEVE_TOTAL.map(k=>mgmtReleveEntier(stats[c]&&stats[c][({dist:'distStrikes',clinch:'clinchStrikes',ground:'groundStrikes'})[k]||k])));
  const d=Number.isFinite(res&&res.finishTime)?(n-1)*300+Math.round(res.finishTime):rounds*300;
  return {d:Math.max(1,d),r,e};
}
function mgmtReleveValide(s){
  try{return !!s&&typeof s==='object'&&!Array.isArray(s)&&Number.isSafeInteger(s.d)&&s.d>=1&&Array.isArray(s.r)&&s.r.length>=1&&s.r.length<=5&&s.r.every(x=>Array.isArray(x)&&x.length===28&&x.every(v=>Number.isSafeInteger(v)&&v>=0))&&Array.isArray(s.e)&&s.e.length===2&&s.e.every(x=>Array.isArray(x)&&x.length===12&&x.every(v=>Number.isSafeInteger(v)&&v>=0));}catch(_){return false;}
}
function mgmtReleveCoin(s,cote){
  if(!mgmtReleveValide(s)||(cote!=='A'&&cote!=='B')) return null;
  const start=cote==='A'?0:14, total=cote==='A'?0:1, out={};
  MGMT_RELEVE_ROUND.forEach((k,i)=>{out[k]=s.r.reduce((sum,row)=>sum+row[start+i],0);});
  MGMT_RELEVE_TOTAL.forEach((k,i)=>{out[k]=s.e[total][i];});
  out.d=s.d; return out;
}
