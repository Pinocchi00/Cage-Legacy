"use strict";
/* CAGE LEGACY - mesure du brief du 06/10 (lot 2) : le niveau propre à chaque combattant.
   200 mondes simulés à graine fixe : ce que le palmarès dit du niveau (des gonflés, des 50 % en haut du
   classement, deux mêmes palmarès, deux niveaux très différents) et la forme des carrières (monte jusqu'au
   pic puis baisse). Usage : node tools/mesure-niveaux.js */
const {newGameWindow}=require('../tests/helpers/loadGame');
const w=newGameWindow();
try{
  console.log(w.eval(`JSON.stringify((function(){
    let total=0, gonfles=0, dessous=0, moyens=0, ecart=0, rec=0, bilans=0;
    const niv=[], pots=[];
    for(let s=1;s<=200;s++){
      setSeed(s*17); const m=mgmtDefault(); mgmtNewRoster(m); total+=m.roster.length;
      for(const d of allDivisions()){
        const l=m.roster.filter(f=>f.div===d.id); if(l.length<8) continue;
        const tri=l.map(f=>f.niv).sort((a,b)=>a-b); const med=tri[Math.floor(tri.length/2)];
        for(const f of l){ const t=f.W+f.L; niv.push(f.niv); pots.push(f.pot); if(t<8) continue; const p=f.W/t; rec++;
          if(p>0.75){ gonfles++; if(f.niv<med) dessous++; } if(p>=0.42&&p<=0.58&&f.niv>=med) moyens++; }
      }
      const par={}; for(const f of m.roster){ const k=f.W+'-'+f.L; (par[k]=par[k]||[]).push(f.niv); }
      for(const v of Object.values(par)){ if(v.length>1){ bilans++; if(Math.max(...v)-Math.min(...v)>=10) ecart++; } }
    }
    const moy=a=>+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
    /* carrières */
    setSeed(5); const m=mgmtDefault(); let mpb=0; const n=1000;
    for(let i=0;i<n;i++){ const f={id:'mg'+(9000+i),ck:'FR',generation:MGMT_IDENTITE_GENERATION,W:0,L:0,D:0,div:'H-light',age:19};
      Object.assign(f,mgmtNiveauTire(f.id,19)); m.roster=[f]; const s=[f.niv];
      for(let a=0;a<19;a++){ for(let k=0;k<2;k++) mgmtNiveauApresCombat(m,f,(i+k+a)%3===0?'loss':'win'); f.age++; mgmtNiveauAnniversaire(m,f); s.push(f.niv); }
      const p=s.indexOf(Math.max(...s)); if(p>0&&p<s.length-1&&s[s.length-1]<s[p]&&s[p]>s[0]) mpb++; }
    return {mondes:200,combattants:total,niveauMoyen:moy(niv),potentielMoyen:moy(pots),avecBilanPlus8:rec,
      plusDe75pc:gonfles,dontSousLaMediane:dessous,dontPartSousLaMediane:+(dessous/Math.max(1,gonfles)).toFixed(3),
      autour50EnHautDuClassement:moyens,memePalmaresGroupes:bilans,dontEcartDe10Points:ecart,
      carrieresMontePuisBaisse:mpb+'/'+n};
  })())`));
}finally{ w.close&&w.close(); }
