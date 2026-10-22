"use strict";
/* ==== [ANCRE: P2_T2_MESURE_TRAITS] — Monde lot 32 T2 ==== */
/* Usage : node tools/mesure-traits.js [combats=1500] [trait,trait,…] [--json] */
const {newGameWindow}=require('../tests/helpers/loadGame');
const args=process.argv.slice(2).filter(x=>!x.startsWith('--'));
const total=Number(args[0]||1500), filtre=args[1]?new Set(args[1].split(',')):null;
if(!Number.isSafeInteger(total)||total<1)throw new Error('Le nombre de combats doit être un entier positif.');
const w=newGameWindow({runMain:true});
w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:2});");
const fighters=JSON.parse(w.eval(`JSON.stringify(G.mgmt.roster.filter(f=>!mgmtIsRetired(f)&&f.div==='H-light').map(f=>({id:f.id,overall:mgmtCombatProfile(f).overall,profile:mgmtCombatProfile(f)})).sort((a,b)=>a.overall-b.overall).slice(0,Math.max(10,G.mgmt.roster.length)))`));
if(fighters.length<10)throw new Error(`Dix combattants H-light requis, trouvés : ${fighters.length}`);
const moyens=fighters.slice(Math.max(0,Math.floor(fighters.length/2)-5),Math.floor(fighters.length/2)+5).slice(0,10);
const traits=JSON.parse(w.eval('JSON.stringify(MGMT_TRAITS.filter(t=>t.effet).map(t=>({id:t.id,effet:t.effet})))')).filter(t=>!filtre||filtre.has(t.id));
const rand=(()=>{let s=20261008;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();
const choix=()=>moyens[Math.floor(rand()*moyens.length)];
const mesure=[];
for(const trait of traits){
  const x={id:trait.id,effet:trait.effet,n:0,v:0,koV:0,koD:0,subV:0,subD:0,td:0,tdAtt:0,sig1:0,sig3:0,sigN:0};
  for(let i=0;i<total;i++){
    const base=choix(), a=JSON.parse(JSON.stringify(base.profile)), b=JSON.parse(JSON.stringify(base.profile));
    w.eval(`mgmtTraitEffetAppliquer(${JSON.stringify(trait.effet)},${JSON.stringify(a)})`);
    const flip=i%2===1, A=flip?b:a, B=flip?a:b, r=w.simulateFight(A,B,3), won=r.winner===(flip?'B':'A');
    x.n++;if(won)x.v++;
    const fam=r.method&&r.method.startsWith('KO')?'ko':r.method&&r.method.startsWith('Soum')?'sub':null;
    if(fam==='ko'){if(won)x.koV++;else x.koD++;}if(fam==='sub'){if(won)x.subV++;else x.subD++;}
    const s=r.stats&&r.stats[flip?'B':'A'];if(s){x.td+=Number(s.td)||0;x.tdAtt+=Number(s.tdAtt)||0;x.sigN++;x.sig1+=Number(s.round1&&s.round1.sig)||0;x.sig3+=Number(s.round3&&s.round3.sig)||0;}
  }
  x.vPct=100*x.v/x.n;x.es=100*Math.sqrt((x.v/x.n)*(1-x.v/x.n)/x.n);x.finPct=x.v?100*(x.koV+x.subV)/x.v:0;x.koLossPct=100*x.koD/Math.max(1,x.n-x.v);x.subPerFight=(x.subV+x.subD)/x.n;x.tdPerFight=x.td/x.n;x.sigRatio=x.sig1?x.sig3/x.sig1:null;
  const family=/menton|fragile/.test(x.id)?'menton':/diesel|eteint|rythme/.test(x.id)?'cardio':/cou|soumission|releve/.test(x.id)?'sol':/tombeur|mur|etouffeur/.test(x.id)?'lutte':/finisseur|foudroyant|poings/.test(x.id)?'finition':'mental';
  x.signature=family==='menton'?x.koLossPct:family==='cardio'?x.sigRatio:family==='sol'?x.subPerFight:family==='lutte'?x.tdPerFight:family==='finition'?x.finPct:x.vPct;
  x.verdict=Math.abs(x.vPct-50)>=2.5?'mesurable':'sans effet mesurable';
  mesure.push(x);
}
const output={combatsParTrait:total,graine:20261008,echantillon:moyens.map(f=>({id:f.id,overall:f.overall})),mesure};
console.log(process.argv.includes('--json')?JSON.stringify(output):JSON.stringify(output,null,2));
