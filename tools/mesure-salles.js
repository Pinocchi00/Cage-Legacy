"use strict";
/* Mesure du lot 8 : la recette d'une soirée selon la carte (faible, moyenne, forte) et la salle (petite, conseillée, trop grande).
   node tools/mesure-salles.js [parties]  — lit les mêmes fonctions que le jeu, rien n'est écrit. */
const {newGameWindow}=require('../tests/helpers/loadGame');
const N=Number(process.argv[2])||12;
const win=newGameWindow({runMain:true});
const out=JSON.parse(win.eval(`JSON.stringify((function(){
  mgmtRetraitProb=function(){return 0;};
  const cartes={faible:(a,b)=>mgmtStar(a)-mgmtStar(b),moyenne:(a,b)=>(a.id<b.id?-1:1),forte:(a,b)=>mgmtStar(b)-mgmtStar(a)};
  const res={};
  for(const [nom,tri] of Object.entries(cartes)){
    for(const choix of ['petite-salle','conseillee','grande-salle']){
      for(const taille of ['petite','grosse']){
        let somme=0,n=0,spect=0;
        for(let g=0;g<${N};g++){
          setSeed(2000+g); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
          const salles=m.salles.slice().sort((a,b)=>a.capacite-b.capacite);
          const salle=choix==='petite-salle'?salles[0]:(choix==='grande-salle'?salles[5]:mgmtSalleDefaut(m));
          mgmtAgendaPoser(m,12,taille,salle.id); m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
          const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)).sort(tri);
          for(let i=0;i<rows.length&&m.card.main.length<m.card.sizeMain;i++){ const a=rows[i]; const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b) mgmtBookMain(m,a.id,b.id); }
          const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
          const ev=mgmtAgendaJouer(m); if(!ev) continue; somme+=ev.finance.recette; spect+=ev.finance.spectateurs; n++;
        }
        res[nom+'/'+choix+'/'+taille]={recette:n?Math.round(somme/n*10)/10:null,spectateurs:n?Math.round(spect/n):null,n};
      }
    }
  }
  return res;})())`));
for(const [k,v] of Object.entries(out)) console.log(k.padEnd(34),String(v.recette).padStart(8),'k$ ',String(v.spectateurs).padStart(6),'spect.  n='+v.n);
