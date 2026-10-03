"use strict";
/* CAGE LEGACY - mesure du lot 5 H4 : les effectifs.
   Partie neuve (graine fixe) : taille et répartition du vestiaire contre la
   table du monde, temps de rendu de chaque écran, temps de mgmtExteriorEnsure
   et d'un cycle complet, combats par an et par combattant de Split sur
   cinq ans, taille de la sauvegarde. Aucun DOM utile : les écrans rendent du
   texte. Usage : node tools/mesure-effectifs.js [--output=tools/reports/lot-5-h4/effectifs.json] */
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('../tests/helpers/loadGame');
const SEED=20261003;
const CYCLES=52;

const w=newGameWindow();
try{
  const report=JSON.parse(w.eval(`JSON.stringify((function(){
    const t=()=>performance.now();
    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m);
    const t0=t(); mgmtExteriorEnsure(m); const ensureMs=t()-t0;
    G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
    const roster=m.roster.length;
    const repartition=allDivisions().map(d=>({div:d.id,split:m.roster.filter(o=>o.div===d.id).length,
      monde:mgmtWorldLivingCount(m,d.id),cible:MGMT_WORLD_SIZE[d.id]}));
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
    const ecrans={};
    function mesureEcran(nom,fn){
      fn(); const s=t(); let i=0; for(;i<5;i++) fn(); ecrans[nom]=(t()-s)/5;
    }
    const cycles=[]; let soirees=0;
    for(let i=0;i<${CYCLES};i++){
      const s=t();
      mgmtNewPile(m); m.pile=[]; m.open=null;
      if(bookEvent()) soirees++;
      cycles.push(t()-s);
    }
    const fid=m.roster[0].id;
    mesureEcran('bureau',()=>scr_mgmt_bureau());
    mesureEcran('carte',()=>scr_mgmt_carte());
    mesureEcran('classements',()=>scr_mgmt_classements());
    mesureEcran('organisation',()=>scr_mgmt_organisation());
    MGMT_FICHE={id:fid,retour:'mgmt_bureau',cursor:0};
    mesureEcran('fiche',()=>scr_mgmt_fiche());
    const combats={};
    for(const h of m.hist){ for(const id of [h.a.id,h.b.id]){ combats[id]=(combats[id]||0)+1; } }
    const annees=${CYCLES}/(MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS);
    const parAn=m.roster.map(o=>(combats[o.id]||0)/annees);
    const moyenne=parAn.reduce((a,b)=>a+b,0)/parAn.length;
    const sans=parAn.filter(x=>x===0).length;
    return {seed:${SEED},roster,repartition,ensureMs,soirees,combatsParSoiree:m.hist.length/Math.max(1,soirees),
      cycleMoyenMs:cycles.reduce((a,b)=>a+b,0)/cycles.length,cycleMaxMs:Math.max(...cycles),
      ecransMs:ecrans,combatsParAnMoyenne:moyenne,sansCombat:sans,
      saveOctets:JSON.stringify(m).length,valide:validateMgmt(m),
      lignesExterieur:m.exterieur.length};
  })())`));
  const output=process.argv.find(a=>a.startsWith('--output='));
  if(output){
    const file=path.resolve(__dirname,'..',output.slice(9));
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
  }
  console.log(JSON.stringify(report,null,2));
}finally{ w.close(); }
