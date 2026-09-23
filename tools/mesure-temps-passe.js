"use strict";
/* CAGE LEGACY - Lot 2B T2 bis : mesure unique du temps sur vingt soirees.
   Meme graine et meme vrai deroule que la mesure T1 ter. Cette sonde ne
   modifie aucun reglage : elle releve les ages, les sorties et un profil
   temoin regenere a bilan et niveau egaux. */
const { newGameWindow } = require('../tests/helpers/loadGame');

const SEED=20260922;
const SOIREES=20;

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
    function pyramid(roster){
      const out={};
      for(const f of roster) out[f.age]=(out[f.age]||0)+1;
      return out;
    }
    function mean(roster){
      return roster.reduce((n,f)=>n+f.age,0)/roster.length;
    }

    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
    const initial={cycle:m.cycle,ageWeeks:m.ageWeeks,mean:mean(m.roster),pyramid:pyramid(m.roster)};
    const medical=new Set();
    let failure=null;
    for(let e=1;e<=${SOIREES};e++){
      mgmtNewPile(m);
      for(const a of m.pile.slice()){
        if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id);
      }
      if(!composeMainEcran(m)){ failure={soiree:e,stage:'main'}; break; }
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')){ failure={soiree:e,stage:'prelims'}; break; }
      if(!mgmtRunEvent(m)){ failure={soiree:e,stage:'event'}; break; }
      for(const f of m.roster){ if(f.retired==='medical') medical.add(f.id); }
    }
    const final={cycle:m.cycle,ageWeeks:m.ageWeeks,mean:mean(m.roster),pyramid:pyramid(m.roster)};
    const mk=age=>({id:'aging-proof-1',name:'Probe Test',first:'Probe',last:'Test',W:18,L:6,D:0,
      age:age,div:'H-welter',divName:'Poids mi-moyen',org:MGMT_ORG,level:1,raison:null,interactions:0});
    const p26=mgmtCombatProfile(mk(26)), p38=mgmtCombatProfile(mk(38));
    const keys=['footSpeed','handSpeed','cardio','explosiveness'];
    const sum=p=>keys.reduce((n,k)=>n+p.attrs[k],0);
    return JSON.stringify({seed:${SEED},targetSoirees:${SOIREES},played:m.eventsPlayed,failure,
      roster:m.roster.length,initial,final,
      exits:{medical:medical.size,ageDecline:m.roster.filter(f=>f.retired==='age').length},
      enteredDecline:m.roster.filter(f=>f.age>=(f.div==='H-heavy'||f.div==='H-lheavy'?39:37)).length,
      proof:{id:'aging-proof-1',age26:{overall:p26.overall,affectedSum:sum(p26)},
        age38:{overall:p38.overall,affectedSum:sum(p38)},wear:mgmtAgingWear(mk(38))},
      valid:validateMgmt(m)});
  })()`));
}

const result=measure();
console.log(JSON.stringify(result,null,2));
if(result.played!==SOIREES||result.failure||!result.valid||
  !(result.proof.age38.affectedSum<result.proof.age26.affectedSum)) process.exitCode=1;
