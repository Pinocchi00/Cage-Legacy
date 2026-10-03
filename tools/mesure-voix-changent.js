"use strict";
/* CAGE LEGACY - mesure du lot 5 (les voix qui changent) : après 52 cycles de
   booking aléatoire (graine fixe), combien de combattants ont changé de voix,
   et vers laquelle. Usage : node tools/mesure-voix-changent.js */
const {newGameWindow}=require('../tests/helpers/loadGame');
const w=newGameWindow();
try{
  console.log(w.eval(`JSON.stringify((function(){
    setSeed(20261003); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
    function bookEvent(){const pairs=[];for(const d of allDivisions()){const pool=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&!mgmtIsRetired(o)&&o.div===d.id);for(let i=0;i+1<pool.length;i+=2)pairs.push([pool[i],pool[i+1]]);}
      const nMain=m.card.sizeMain,nPre=m.card.sizePrelims; if(pairs.length<nMain+nPre) return null;
      m.card.main=pairs.slice(0,nMain).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
      m.card.prelims=pairs.slice(nMain,nMain+nPre).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));return mgmtRunEvent(m);}
    const par={}; const sortie=[];
    for(let i=0;i<52;i++){ mgmtNewPile(m); m.pile=[]; m.open=null; bookEvent();
      if(i===12||i===25||i===51){ const v={}; let n=0; for(const f of m.roster){ const c=mgmtVoixChangement(m,f); if(c){ v[c.vers+':'+c.raison]=(v[c.vers+':'+c.raison]||0)+1; n++; } } sortie.push({cycle:i+1,changes:n,roster:m.roster.length,parVoix:v}); } }
    const t=performance.now(); for(const f of m.roster) mgmtVoixActuelle(m,f); const ms=+(performance.now()-t).toFixed(1);
    return {sortie,msRoster:ms};
  })())`));
}finally{ w.close&&w.close(); }
