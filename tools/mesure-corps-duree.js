"use strict";
/* CAGE LEGACY - Lot 2B T1 ter : mesure unique du corps sur vingt soirees.
   Graine et deroule imposes par le contrat du 22/09/2026 : vrai mgmtNewPile,
   cinq bookings par mgmtBookMain selon la liste ecran, decision de Leila et
   vrai mgmtRunEvent. Ce fichier ne modifie aucun reglage. */
const { newGameWindow } = require('../tests/helpers/loadGame');

const SEED=20260922;
const SOIREES=20;

function median(values){
  if(values.length===0) return null;
  const a=values.slice().sort((x,y)=>x-y);
  const mid=Math.floor(a.length/2);
  return a.length%2?a[mid]:(a[mid-1]+a[mid])/2;
}

function measure(){
  const win=newGameWindow();
  return JSON.parse(win.eval(`(function(){
    function composeMainEcran(m){
      for(let k=0;k<MGMT_MAIN_SIZE;k++){
        const liste=mgmtCartRows(m).filter(o=>mgmtSelectable(m,o,null));
        if(liste.length===0) return false;
        const pos=new Map(), rang=new Map();
        liste.forEach((o,i)=>{ pos.set(o.id,i); rang.set(o.id,mgmtDivisionRank(m,o)); });
        const choix=liste.slice().sort((x,y)=>rang.get(x.id)-rang.get(y.id)||pos.get(x.id)-pos.get(y.id));
        let pose=false;
        for(const f of choix){
          const rf=rang.get(f.id);
          const adversaires=liste.filter(o=>o.id!==f.id&&o.div===f.div)
            .sort((x,y)=>Math.abs(rang.get(x.id)-rf)-Math.abs(rang.get(y.id)-rf)||pos.get(x.id)-pos.get(y.id));
          for(const b of adversaires){
            if(mgmtBookMain(m,f.id,b.id)){ pose=true; break; }
          }
          if(pose) break;
        }
        if(!pose) return false;
      }
      return true;
    }
    function state(m,soiree){
      const retired=m.roster.filter(o=>o.retired==='medical').length;
      const suspended=m.roster.filter(o=>o.retired!=='medical'&&Number.isSafeInteger(o.susp)&&m.cycle<=o.susp).length;
      const available=m.roster.filter(o=>mgmtAvailable(m,o)).length;
      const trauma=m.roster.map(o=>mgmtTrauma(o,m.cycle));
      return {soiree,cycle:m.cycle,available,suspended,retired,
        traumaMean:trauma.reduce((a,b)=>a+b,0)/trauma.length};
    }
    function distribution(values){
      const sorted=values.slice().sort((a,b)=>a-b);
      const q=p=>sorted[Math.floor((sorted.length-1)*p)];
      return {n:sorted.length,min:sorted[0],q1:q(0.25),median:q(0.5),q3:q(0.75),max:sorted[sorted.length-1],
        mean:sorted.reduce((a,b)=>a+b,0)/sorted.length,
        above60:sorted.filter(x=>x>=60).length,
        buckets:{under5:sorted.filter(x=>x<5).length,from5to19:sorted.filter(x=>x>=5&&x<20).length,
          from20to39:sorted.filter(x=>x>=20&&x<40).length,from40to59:sorted.filter(x=>x>=40&&x<60).length,
          from60:sorted.filter(x=>x>=60).length}};
    }

    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
    const initialLines=JSON.parse(JSON.stringify(m.roster));
    const initial=distribution(m.roster.map(o=>mgmtTrauma(o,m.cycle)));
    const rows=[], careerLengths=[];
    let failure=null;
    for(let e=1;e<=${SOIREES};e++){
      mgmtNewPile(m);
      for(const a of m.pile.slice()){
        if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id);
      }
      if(!composeMainEcran(m)){ failure={soiree:e,stage:'main'}; break; }
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')){ failure={soiree:e,stage:'prelims'}; break; }
      const retiredBefore=new Set(m.roster.filter(o=>o.retired==='medical').map(o=>o.id));
      if(!mgmtRunEvent(m)){ failure={soiree:e,stage:'event'}; break; }
      for(const o of m.roster){
        if(o.retired==='medical'&&!retiredBefore.has(o.id)) careerLengths.push(o.W+o.L+o.D);
      }
      rows.push(state(m,e));
    }

    /* La fenetre de vingt soirees censure les carrieres longues. Chaque
       ligne initiale poursuit donc sa carriere a rythme constant (un combat
       tous les deux cycles), par le vrai moteur et mgmtApplyFight, jusqu'a
       sa retraite medicale ou 60 combats supplementaires. */
    const completeCareerLengths=[], completeCareerRecords=[];
    let completeCareerCensored=0;
    for(let i=0;i<initialLines.length;i++){
      const f=JSON.parse(JSON.stringify(initialLines[i]));
      const cm={cycle:0,facts:[],roster:[f]};
      setSeed(${SEED}+500000+i*997);
      let bouts=0;
      for(;bouts<60&&!f.retired;bouts++){
        const opp=JSON.parse(JSON.stringify(f));
        opp.id='career-opp-'+i; opp.name='Opponent'; opp.first='Opponent'; opp.last='Probe';
        opp.trauma=0; opp.traumaFloor=0; opp.lastCycle=cm.cycle;
        const res=simulateFight(mgmtFightReady(f,cm.cycle),mgmtFightReady(opp,cm.cycle),3);
        mgmtApplyFight(cm,f,opp,res,'A');
        cm.cycle+=2;
      }
      if(f.retired){
        completeCareerLengths.push(bouts);
        completeCareerRecords.push(f.W+f.L+f.D);
      }
      else completeCareerCensored++;
    }

    const clean={id:'probe-clean-22',W:10,L:1,D:0,age:22};
    const perfect={id:'probe-perfect',name:'Probe Perfect',first:'Probe',last:'Perfect',W:0,L:0,D:0,
      age:22,div:'H-light',divName:'Poids léger',org:MGMT_ORG,level:1,raison:null,interactions:0};
    const probeM={cycle:0,facts:[],roster:[perfect]};
    const noDamage={winner:'A',method:'Décision',round:3,
      stats:{A:{dmgHead:0,wobbled:0},B:{dmgHead:10,wobbled:0}}};
    for(let i=0;i<60;i++) mgmtApplyFight(probeM,perfect,null,noDamage,'A');
    return JSON.stringify({seed:${SEED},targetSoirees:${SOIREES},roster:m.roster.length,initial,rows,failure,
      played:rows.length,careerLengths,completeCareerLengths,completeCareerRecords,completeCareerCensored,
      clean22:mgmtTrauma(clean,0),
      perfect:{fights:perfect.W+perfect.L+perfect.D,trauma:mgmtTrauma(perfect,probeM.cycle),retired:perfect.retired||null},
      valid:validateMgmt(m)});
  })()`));
}

const result=measure();
result.careerMedian=median(result.careerLengths);
result.completeCareerMedian=median(result.completeCareerLengths);
result.completeCareerRecordMedian=median(result.completeCareerRecords);
console.log(JSON.stringify(result,null,2));
if(result.played!==SOIREES||!result.valid) process.exitCode=1;
