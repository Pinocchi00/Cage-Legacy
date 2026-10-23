"use strict";
/* Lot 52 T1 : mesure du poids et de la vitesse de la sauvegarde (brut / compressée) sur une partie neuve. Usage : node tools/mesure-sauvegarde.js */
const {newGameWindow}=require('../tests/helpers/loadGame');
const w=newGameWindow({runMain:true});
const r=JSON.parse(w.eval(`JSON.stringify((()=>{
  setSeed(20261008); CL.mgmtEnter(1); mgmtPasseGenerer('split',{soirees:62}); mgmtMondeVivantGenerer(G.mgmt,{soirees:62});
  const T=f=>{ const t=performance.now(); const v=f(); return [Math.round(performance.now()-t),v]; };
  const brut=mgmtSerialiser(G.mgmt);
  const [tc,z]=T(()=>mgmtCompresser(brut));
  const [td,d]=T(()=>mgmtDecompresser(z));
  const [s1]=T(()=>saveMgmt());            /* première sauvegarde : mémo vide */
  const stocke=stockageLire(mgmtSlotKey(MGMT_SLOT));
  G.mgmt.cycle+=0; G.mgmt.roster[0]&&(G.mgmt.roster[0]._m=(G.mgmt.roster[0]._m||0)+1);
  const [s2]=T(()=>saveMgmt());            /* après une action : les gros blocs inchangés viennent du mémo */
  const [s3]=T(()=>saveMgmt());
  const [tl,ok]=T(()=>!!loadMgmt());
  const exact=mgmtSerialiser(G.mgmt).length===brut.length+(ok?0:0)||true;
  return {brut:brut.length,compresseUnFlux:z.length,stocke:stocke.length,ratio:+(stocke.length/brut.length).toFixed(3),exactUnFlux:d===brut,
    msCompressionUnFlux:tc,msDecompression:td,msSavePremiere:s1,msSaveApresAction:s2,msSaveSuivante:s3,msLoad:tl,charge:ok};
})())`));
console.log(JSON.stringify(r));
