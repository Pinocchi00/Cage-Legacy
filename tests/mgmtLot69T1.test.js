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
     const ancien=w.eval(`mgmtOrgNom(G.mgmt)`);
     const serialized=w.eval(`(()=>{const m=G.mgmt,ok=mgmtOffreAccepter(m,0);G.mgmt=m;return ok?'OK:'+mgmtSerialiser(m):'NON'})()`);
    assert.notEqual(serialized,'NON');
    assert.equal(w.eval(`G.screen`),'mgmt_arrivee');
    const org=w.eval(`mgmtPredecesseurOrgId(G.mgmt)`);
    assert.equal(org,'garden-of-blood');
     const arrivee=w.eval(`(()=>{const m=G.mgmt;return {org:mgmtOrgNom(m),html:scr_mgmt_arrivee()}})()`);
      assert.ok(arrivee.org);
      assert.ok(arrivee.html.includes(arrivee.org),'l’écran d’arrivée doit afficher la nouvelle organisation');
      assert.notEqual(arrivee.org,ancien,'l’arrivée ne doit pas conserver l’organisation quittée dans l’en-tête');
     const identiteNouvelle=w.eval(`(()=>{const m=G.mgmt;return {nom:m.org,roster:Array.isArray(m.roster)&&m.roster.length>0}})()`);
     assert.equal(identiteNouvelle.nom,arrivee.org,'le contrat doit être rattaché à la nouvelle organisation');
     assert.equal(identiteNouvelle.roster,true,'l’effectif du nouvel employeur doit être visible dans la partie');
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
     for(const texte of ['SPLIT','CHAMPIONNE','MOITIÉ CHACUNE','SI SPLIT GAGNE 2 SUR 3','ACCEPTER','CONTRE-PROPOSER','REFUSER','ch3-title','ch3-split','ch3-adverse','ch3-quote','ch3-detail']) assert.ok(choc.includes(texte),`bloc choc absent: ${texte}`);
    assert.match(choc,/<span class="mf-k">Échap<\/span><span>Répondre plus tard<\/span>/);
    assert.match(choc,/<span class="mf-k">P<\/span><span>Contre-proposer<\/span>/);
    assert.match(choc,/<span class="mf-k or">Entrée<\/span><span>Accepter<\/span>/);
    assert.match(choc,/ch3-vs/);
    w.eval(`MGMT_DISCOURS_UI={item:{a:G.mgmt.roster[0].id,ton:'fier',motif:'principal',lignes:['Une citation de contrôle.']},retour:null};G.screen='mgmt_discours';`);
     const discours=w.eval(`scr_mgmt_discours()`);
     for(const texte of ['di3-nom','di3-lignes','Une citation de contrôle.','di3-suite','Continuer']) assert.ok(discours.includes(texte),`bloc discours absent: ${texte}`);
     const css=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','ui-cadre.css'),'utf8');
     for(const selecteur of ['.ch3-title','.ch3-split','.ch3-adverse','.ch3-vs','.ch3-fight','.ch3-quote','.ch3-detail','.ch3-condition','.ch3-actions','.di3-scene','.di3-nom','.di3-lignes','.di3-suite']) assert.ok(css.includes(selecteur),`style de maquette absent: ${selecteur}`);
     assert.match(css,/\.ch3-title[^\{]*\{[^}]*linear-gradient\(90deg,#E9E6E1[^}]*#E23A2B/s,'le bandeau choc conserve les deux couleurs de la planche');
     assert.match(css,/\.ch3-title \.ch3-vs[^\{]*\{[^}]*#F0B220/s,'le VS du choc reste jaune');
     assert.match(css,/\.di3-nom[^\{]*\{[^}]*font:800 clamp\(88px,12vw,230px\)/s,'le nom du discours reste traité en très grand');
     assert.doesNotMatch(css,/\.ch3-[\w-]+[^\{]*\{[^}]*animation\s*:/s,'aucune animation CSS ne doit être ajoutée au choc');
  }finally{w.close();}
});

test('Monde lot 69 T1 — les raisons d’offre restent échappées dans le bilan du poste',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(6903);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});mgmtPosteInit(m);m.offres=[{orgId:Object.keys(m.orgs)[0],poste:'ENTRAÎNEUR',salaire:4321,texte:'Offre de contrôle',raisons:['<img src=x onerror=alert(1)>','Résultats récents','Projet sportif','Confiance de la direction'],refuse:false}];G.mgmt=m;`);
    const rendu=w.eval('mgmtPosteRendu(G.mgmt)');
    assert.ok(rendu.includes('&lt;img src=x onerror=alert(1)&gt;'));
    assert.ok(!rendu.includes('<img src=x onerror=alert(1)>'));
    assert.equal(w.eval('new Set(G.mgmt.offres[0].raisons).size'),4,'les quatre raisons d’offre doivent rester distinctes');
    for(const raison of ['Résultats récents','Projet sportif','Confiance de la direction']) assert.ok(rendu.includes(raison),`raison absente du bilan: ${raison}`);
  }finally{w.close();}
});
