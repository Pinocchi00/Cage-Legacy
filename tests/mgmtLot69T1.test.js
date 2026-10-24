"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT69_T1] — Monde lot 69 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 69 T1 — offre acceptée, changement, arrivée, soirée et lendemain avec sauvegarde intermédiaire',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(6901);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);mgmtOffresCreer(m);const cible=Object.keys(m.orgs)[0];m.offres=[{orgId:cible,poste:'ENTRAÎNEUR',salaire:4321,texte:'Proposition de recrutement.',raisons:['Effectif expérimenté','Résultats récents','Projet sportif','Confiance de la direction'],refuse:false}];window.confirm=()=>true;window.__lot69Partie=m;G.mgmt=m;`);
    const serialized=w.eval(`(()=>{const m=G.mgmt,ok=mgmtOffreAccepter(m,0);G.mgmt=m;return ok?'OK:'+mgmtSerialiser(m):'NON'})()`);
    assert.notEqual(serialized,'NON');
    assert.equal(w.eval(`G.screen`),'mgmt_arrivee');
    const org=w.eval(`mgmtPredecesseurOrgId(G.mgmt)`);
    assert.equal(org,'garden-of-blood');
    const saved=serialized.slice(3);
    assert.equal(w.eval(`mgmtSerialiser(G.mgmt)`),saved);
    w.eval(`G.screen='mgmt_accueil';`);
    assert.equal(jouerSoirees(w,1),1);
    const lendemain=w.eval(`(()=>{const m=G.mgmt;return {valid:validateMgmt(m),org:mgmtPredecesseurOrgId(m),played:m.eventsPlayed,loaded:!!mgmtParseAndValidate(mgmtSerialiser(m))}})()`);
    assert.equal(lendemain.org,'garden-of-blood');
    assert.ok(lendemain.played>0);
  }finally{w.close();}
});
