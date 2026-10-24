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
    const renduOffre=w.eval(`mgmtPosteRendu(G.mgmt)`);
    for(const raison of ['Effectif expérimenté','Résultats récents','Projet sportif','Confiance de la direction']) assert.ok(renduOffre.includes(raison),`raison d'offre absente: ${raison}`);
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

test('Monde lot 69 T1 — les écrans choc et discours exposent les blocs validés par les planches Uni*',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(6902);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);G.mgmt=m;`);
    w.eval(`G.mgmt.choc={orgId:Object.keys(G.mgmt.orgs).find(id=>id!=='garden-of-blood'),div:'PAILLE F',jour:14,annee:mgmtChocAnnee(G.mgmt),etat:'recu',propose:true,a:G.mgmt.roster[0].id,b:Object.values(G.mgmt.orgs).flatMap(o=>o.roster||[])[0].id};`);
    assert.equal(w.eval(`mgmtChocValide(G.mgmt.choc)`),true);
    w.eval(`G.screen='mgmt_choc';`);
    const choc=w.eval(`scr_mgmt_choc()`);
    for(const texte of ['SPLIT','CHAMPIONNE','MOITIÉ CHACUNE','SI SPLIT GAGNE 2 SUR 3','ACCEPTER','CONTRE-PROPOSER','REFUSER']) assert.ok(choc.includes(texte),`bloc choc absent: ${texte}`);
    assert.match(choc,/<span class="mf-k">Échap<\/span><span>Répondre plus tard<\/span>/);
    assert.match(choc,/<span class="mf-k">P<\/span><span>Contre-proposer<\/span>/);
    assert.match(choc,/<span class="mf-k or">Entrée<\/span><span>Accepter<\/span>/);
    assert.match(choc,/ch3-vs/);
    w.eval(`MGMT_DISCOURS_UI={item:{a:G.mgmt.roster[0].id,ton:'fier',motif:'principal',lignes:['Une citation de contrôle.']},retour:null};G.screen='mgmt_discours';`);
    const discours=w.eval(`scr_mgmt_discours()`);
    for(const texte of ['di3-nom','di3-lignes','Une citation de contrôle.','di3-suite','Continuer']) assert.ok(discours.includes(texte),`bloc discours absent: ${texte}`);
  }finally{w.close();}
});
