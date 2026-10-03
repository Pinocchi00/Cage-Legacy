"use strict";
/* CAGE LEGACY - mesure du lot 5 H10 (deuxième groupe) : combien de scénarios
   s'ouvrent par cycle, lesquels, et combien de temps coûte leur calcul.
   Partie neuve, graine fixe, 52 cycles réservés comme dans mesure-effectifs.js.
   Usage : node tools/mesure-scenarios.js */
const {newGameWindow}=require('../tests/helpers/loadGame');
const SEED=20261003;
const w=newGameWindow();
try{
  const rapport=JSON.parse(w.eval(`JSON.stringify((function(){
    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
    function bookEvent(){
      const pairs=[];
      for(const d of allDivisions()){
        const pool=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&!mgmtIsRetired(o)&&o.div===d.id);
        for(let i=0;i+1<pool.length;i+=2) pairs.push([pool[i],pool[i+1]]);
      }
      const nMain=m.card.sizeMain,nPre=m.card.sizePrelims;
      if(pairs.length<nMain+nPre) return null;
      m.card.main=pairs.slice(0,nMain).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
      m.card.prelims=pairs.slice(nMain,nMain+nPre).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));
      return mgmtRunEvent(m);
    }
    const parType={}; let cycles=0, ms=0, max=0, soirees=0;
    for(let i=0;i<52;i++){
      mgmtNewPile(m); m.pile=[]; m.open=null;
      if(bookEvent()) soirees++;
      const t=performance.now(); const s=mgmtScenarios(m); const d=performance.now()-t; ms+=d; max=Math.max(max,d); cycles++;
      for(const x of s) parType[x.k]=(parType[x.k]||0)+1;
    }
    return {soirees,cycles,parType,parCycle:Object.fromEntries(Object.entries(parType).map(([k,v])=>[k,+(v/cycles).toFixed(2)])),msMoyen:+(ms/cycles).toFixed(1),msMax:+max.toFixed(1),combats:m.hist.length};
  })())`));
  console.log(JSON.stringify(rapport,null,1));
}finally{ w.close&&w.close(); }
