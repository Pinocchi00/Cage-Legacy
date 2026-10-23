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
  const x={id:trait.id,effet:trait.effet,n:0,v:0,finishV:0,koD:0,subV:0,subD:0,td:0,ctrl:0,sig1:0,sig3:0,baseV:0,baseFinishV:0,baseKoD:0,baseKoLoss:0,baseSub:0,baseTd:0,baseCtrl:0,baseSig1:0,baseSig3:0};
  for(let i=0;i<total;i++){
    const base=choix();let a=JSON.parse(JSON.stringify(base.profile));const b=JSON.parse(JSON.stringify(base.profile));
    const flip=i%2===1, seed=(20261008+i*7919)>>>0;
    w.setSeed(seed);
    const baseRes=w.simulateFight(flip?b:a,flip?a:b,3), baseWon=baseRes.winner===(flip?'B':'A'), baseFam=baseRes.method&&baseRes.method.startsWith('KO')?'ko':baseRes.method&&baseRes.method.startsWith('Soum')?'sub':null, baseSide=flip?'B':'A';
    if(baseWon){x.baseV++;if(!String(baseRes.method||'').startsWith('Décision'))x.baseFinishV++;}if(baseFam==='ko'&&!baseWon)x.baseKoD++;if(baseFam==='ko'&&!baseWon)x.baseKoLoss++;
    if(baseFam==='sub')x.baseSub++;
    for(const rd of baseRes.roundStats||[]){if(rd.r===1)x.baseSig1+=rd[`sig${baseSide}`]||0;if(rd.r===3)x.baseSig3+=rd[`sig${baseSide}`]||0;}
    const bs=baseRes.stats&&baseRes.stats[baseSide];if(bs){x.baseTd+=Number(bs.td)||0;x.baseCtrl+=Number(bs.ctrlSec)||0;}
    a=JSON.parse(w.eval(`(function(){const c=${JSON.stringify(a)};return JSON.stringify(mgmtTraitEffetAppliquer(${JSON.stringify(trait.effet)},c));})()`));
    w.setSeed(seed);
    const A=flip?b:a, B=flip?a:b, r=w.simulateFight(A,B,3), won=r.winner===(flip?'B':'A');
    x.n++;if(won){x.v++;if(!String(r.method||'').startsWith('Décision'))x.finishV++;}
    const fam=r.method&&r.method.startsWith('KO')?'ko':r.method&&r.method.startsWith('Soum')?'sub':null;
    if(fam==='ko'){if(won)x.koV++;else x.koD++;}if(fam==='sub'){if(won)x.subV++;else x.subD++;}
    const s=r.stats&&r.stats[flip?'B':'A'];if(s){x.td+=Number(s.td)||0;x.ctrl+=Number(s.ctrlSec)||0;}
    for(const rd of r.roundStats||[]){if(rd.r===1)x.sig1+=rd[`sig${flip?'B':'A'}`]||0;if(rd.r===3)x.sig3+=rd[`sig${flip?'B':'A'}`]||0;}
  }
  x.vPct=100*x.v/x.n;x.es=100*Math.sqrt((x.v/x.n)*(1-x.v/x.n)/x.n);x.finPct=x.v?100*x.finishV/x.v:0;x.baseFinPct=x.baseV?100*x.baseFinishV/x.baseV:0;x.koLossPct=100*x.koD/Math.max(1,x.n-x.v);x.baseKoLossPct=100*x.baseKoLoss/Math.max(1,x.n-x.baseV);x.subPerFight=(x.subV+x.subD)/x.n;x.baseSubPerFight=x.baseSub/x.n;x.tdPerFight=x.td/x.n;x.baseTdPerFight=x.baseTd/x.n;x.ctrlPerFight=x.ctrl/x.n;x.baseCtrlPerFight=x.baseCtrl/x.n;x.sigRatio=x.sig1?x.sig3/x.sig1:null;x.baseSigRatio=x.baseSig1?x.baseSig3/x.baseSig1:null;
  const family=/menton|fragile/.test(x.id)?'menton':/diesel|eteint|rythme/.test(x.id)?'cardio':/cou|soumission|releve/.test(x.id)?'sol':/tombeur|mur|etouffeur/.test(x.id)?'lutte':/finisseur|foudroyant|poings/.test(x.id)?'finition':'mental';
  const signature=family==='menton'?[x.baseKoLossPct,x.koLossPct]:family==='cardio'?[x.baseSigRatio,x.sigRatio]:family==='sol'?[x.baseSubPerFight,x.subPerFight]:family==='lutte'?[x.baseTdPerFight,x.tdPerFight]:family==='finition'?[x.baseFinPct,x.finPct]:[100*x.baseV/x.n,x.vPct];
  x.signature={avant:signature[0],apres:signature[1],variationRelative:signature[0]?100*(signature[1]-signature[0])/signature[0]:null};
  x.verdict=Math.abs(x.vPct-50)>=2.5||Math.abs(x.signature.variationRelative||0)>=15?'mesurable':'sans effet mesurable';
  mesure.push(x);
}
const output={combatsParTrait:total,graine:20261008,echantillon:moyens.map(f=>({id:f.id,overall:f.overall})),mesure};
console.log(process.argv.includes('--json')?JSON.stringify(output):JSON.stringify(output,null,2));
