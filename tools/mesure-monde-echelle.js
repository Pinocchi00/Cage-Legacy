"use strict";
/* CAGE LEGACY - mesure du lot 2B T1 bis : le monde a l'echelle.
   Charge le jeu dans l'ordre reel d'index.html, joue vingt cycles avec des
   cartes de meme categorie quand le roster le permet, puis mesure une fois
   la population, la sauvegarde UTF-8 et la derivation de toutes les traces. */
const { newGameWindow } = require('../tests/helpers/loadGame');

const SEED=20260922;
const CYCLES=20;

function measure(){
  const win=newGameWindow();
  const raw=win.eval(`(function(){
    function distribution(m){
      return allDivisions().map(d=>({
        div:d.id,
        vivants:mgmtWorldLivingCount(m,d.id),
        total:m.roster.filter(o=>o&&o.div===d.id).length+m.exterieur.filter(o=>o&&o.div===d.id).length,
        splitVivants:m.roster.filter(o=>o&&o.div===d.id&&o.retired!=='medical').length,
        exterieur:m.exterieur.filter(o=>o&&o.div===d.id).length,
      }));
    }
    function bookEvent(m){
      const pairs=[];
      for(const d of allDivisions()){
        const pool=m.roster.filter(o=>o&&o.div===d.id&&mgmtAvailable(m,o));
        for(let i=0;i+1<pool.length;i+=2) pairs.push([pool[i],pool[i+1]]);
      }
      if(pairs.length<MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE) return false;
      m.card.main=pairs.slice(0,MGMT_MAIN_SIZE).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
      m.card.prelims=pairs.slice(MGMT_MAIN_SIZE,MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE)
        .map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));
      return !!mgmtRunEvent(m);
    }
    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
    G={theme:'dark',mgmt:m};
    const ouverture=distribution(m);
    let soirees=0;
    for(let i=0;i<${CYCLES};i++){
      mgmtNewPile(m);
      m.pile=[]; m.open=null;
      if(bookEvent(m)) soirees++;
    }
    const apres=distribution(m);
    const start=performance.now();
    let traces=0;
    for(const line of m.exterieur){ if(mgmtExteriorTrace(line,m.cycle)) traces++; }
    const derivationMs=performance.now()-start;
    return JSON.stringify({ouverture:ouverture,apres:apres,soirees:soirees,cycle:m.cycle,
      traces:traces,derivationMs:derivationMs,save:JSON.stringify(m),valide:validateMgmt(m)});
  })()`);
  const result=JSON.parse(raw);
  result.saveBytes=Buffer.byteLength(result.save,'utf8');
  delete result.save;
  result.ouvertureVivantes=result.ouverture.reduce((n,d)=>n+d.vivants,0);
  result.ouvertureTotales=result.ouverture.reduce((n,d)=>n+d.total,0);
  result.apresVivantes=result.apres.reduce((n,d)=>n+d.vivants,0);
  result.apresTotales=result.apres.reduce((n,d)=>n+d.total,0);
  return result;
}

const result=measure();
console.log(JSON.stringify({seed:SEED,cycles:CYCLES,...result},null,2));
if(!result.valide||result.apres.some(d=>d.vivants!==30)) process.exitCode=1;
