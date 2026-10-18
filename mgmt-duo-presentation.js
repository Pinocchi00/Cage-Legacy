"use strict";
/* ==== [ANCRE: DUO_T58_PRESENTATION] — Monde lot 19 T58 ==== */
var MGMT_DUO_PRESENTATION={partie:null,index:0};

function mgmtDuoVueMonde(m,carte){
  if(!mgmtDuoActif(m)||!m.orgs||!carte||!Array.isArray(carte.combats)) return null;
  const sous=m.orgs[m.duo.b];
  if(!sous||!Array.isArray(m.roster)||!Array.isArray(sous.roster)) return null;
  const premier=carte.combats.reduce((n,c)=>Math.min(n,c.h),m.hist.length);
  if(!Number.isSafeInteger(premier)||premier<0) return null;
  const avantCycle=carte.combats[0]&&m.hist[carte.combats[0].h]&&m.hist[carte.combats[0].h].duo
    ?m.hist[carte.combats[0].h].duo.cb-1:sous.cycle;
  const hist=(m.hist||[]).slice(0,premier).concat((sous.hist||[]).filter(t=>t&& !t.duo&&t.c<=avantCycle));
  const roster=m.roster.concat(sous.roster).map(f=>({...f}));
  const vue=Object.assign({},m,{roster,hist,idPrefixe:'duo-vue'});
  /* Les deux lignes sont ramenées au bilan attesté avant leur combat ; aucun résultat
     de la carte ne doit contaminer l'identité publique de la présentation. */
  for(const c of carte.combats){
    const t=m.hist[c.h]; if(!t) continue;
    for(const [id,l] of [[c.a,t.a],[c.b,t.b]]){
      const f=vue.roster.find(x=>x.id===id);
      if(f) Object.assign(f,{W:l.W,L:l.L,D:l.D,age:l.age,lastCycle:l.lastCycle});
    }
  }
  return vue;
}

Object.assign(CL,{
  mgmtDuoPresentation(){
    const m=G&&G.mgmt;
    if(!mgmtDuoActif(m)||!m.duo.soiree) return false;
    const carte=m.duo.cartes[m.duo.cartes.length-1],i=m.duo.soiree.i,c=carte&&carte.combats[i],t=c&&m.hist[c.h];
    const vue=mgmtDuoVueMonde(m,carte);
    if(!c||!t||!vue) return false;
    MGMT_DUO_PRESENTATION={partie:m,index:i};
    try{
      G.mgmt=vue;
      const liste=carte.combats.map(x=>({ids:[x.a,x.b],h:Math.min(...carte.combats.map(y=>y.h))}));
      return mgmtPresentationOuvrir('combat',[c.a,c.b],{h:Math.min(...carte.combats.map(x=>x.h)),retour:'mgmt_duo_presentation_retour',liste});
    }catch(e){G.mgmt=m;throw e;}
  },
  mgmtDuoPresentationRetour(){
    const m=MGMT_DUO_PRESENTATION.partie;
    if(m) G.mgmt=m;
    MGMT_DUO_PRESENTATION.partie=null;
    if(m&&mgmtDuoActif(m)&&m.duo.soiree){m.duo.soiree.i=MGMT_DUO_PRESENTATION.index;CL.go('mgmt_duo_soiree');}
    else CL.go('mgmt_duo');
  }
});
SCREENS.mgmt_duo_presentation_retour=()=>{CL.mgmtDuoPresentationRetour();return '';};
