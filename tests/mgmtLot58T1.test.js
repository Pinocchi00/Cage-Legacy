"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT58_T1] — Monde lot 58 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 58 T1 — offres facultatives, validées et réparées sans création sur ancienne partie',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});const absent=!Object.hasOwn(m,'offres');const base=validateMgmt(m);m.offres=[];const vide=validateMgmt(m);m.offres=[{orgId:'split',poste:'Matchmaker',salaire:3200,texte:'Proposition.',relu:false,refuse:false,raisons:['a','b','c','d']}];const valide=validateMgmt(m);const mauvais=JSON.parse(JSON.stringify(m));mauvais.offres[0].salaire=-1;const refuse=mgmtOffreRefuser(m,0);const refuseValide=validateMgmt(m);const rep=mgmtRepair(mauvais);return {absent,base,vide,valide,refuse,refuseValide,repare:!Object.hasOwn(rep,'offres')}})())`));
  assert.deepEqual(r,{absent:true,base:true,vide:true,valide:true,refuse:true,refuseValide:true,repare:true});
});

test('Monde lot 58 T1 — quatre raisons de rejoindre plus fort sont des informations concrètes',()=>{
  const w=newGameWindow({runMain:true});
  const n=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});if(!m.poste)mgmtPosteInit(m);const r=mgmtPosteRaisons(m,'split');const offers=mgmtOffresCreer(m);G.mgmt=m;return {r,offers,html:scr_mgmt_poste()}})())`));
  assert.equal(n.r.length,4);
  assert.equal(new Set(n.r).size,4);
  assert.match(n.r[0],/Scène/);
  assert.match(n.r[1],/Meilleurs du monde/);
  assert.match(n.r[2],/Agents libres/);
  assert.match(n.r[3],/Choc des organisations/);
  assert.ok(n.offers.length<=3);
  assert.ok(n.offers.every(o=>o.relu===false&&o.texte.includes('matchmaker')));
  assert.match(n.html,/LES OFFRES/);
});

test('Monde lot 58 T1 — les invitations conservent le poste et une formulation cohérente',()=>{
  const w=newGameWindow({runMain:true});
  const n=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=0;m.poste.obj.forEach(o=>o.e='cours');return mgmtOffresCreer(m).map(o=>({poste:o.poste,texte:o.texte,relu:o.relu}))})())`));
  assert.ok(n.length<=3);
  assert.ok(n.every(o=>o.poste==='matchmaker'&&o.texte.toLowerCase().includes(o.poste)&&o.relu===false));
});

test('Monde lot 58 T1 — un bilan positif ouvre la voie aux approches avant le renouvellement',()=>{
  const w=newGameWindow({runMain:true});
  const n=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=4;m.poste.obj.forEach(o=>{o.e='tenu';});G.mgmt=m;const html=scr_mgmt_poste_bilan();const renouvellement=mgmtPosteRenouveler(m,mgmtPosteBilan(m).issue);return {html,renouvele:!!renouvellement}})())`));
  assert.match(n.html,/mgmtOffresCreer\(G\.mgmt\);mgmtPosteRenouveler/);
  assert.equal(n.renouvele,true);
});

test('Monde lot 58 T1 — le joueur peut attendre après le renvoi sans changer d’organisation',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=0;m.poste.obj.forEach(o=>o.e='cours');m.offres=[];mgmtOffresCreer(m);const org=m.org;const attendu=mgmtOffresAttendre(m);return {attendu,refusees:m.offres.every(o=>o.refuse),orgIdentique:m.org===org,poste:!!m.poste}})())`));
  assert.deepEqual(r,{attendu:true,refusees:true,orgIdentique:true,poste:true});
});

test('Monde lot 58 T1 — une proposition refusee reste facultative et ne signe aucun changement',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=0;m.poste.obj.forEach(o=>o.e='cours');const active=mgmtPredecesseurOrgId(m),offers=mgmtOffresCreer(m),changed=offers.length?mgmtOffreRefuser(m,0):false;return {changed:changed||offers.length===0,active:mgmtPredecesseurOrgId(m)===active,valid:validateMgmt(m),refused:offers.length===0||offers[0].refuse}})())`));
  assert.deepEqual(r,{changed:true,active:true,valid:true,refused:true});
});

test('Monde lot 58 T1 — refuser toutes les offres puis progresser prolonge le contrat de Split',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);const org=m.org;m.poste.conf=0;m.poste.obj.forEach(o=>{o.e='cours';});const offers=mgmtOffresCreer(m);offers.forEach((_,i)=>mgmtOffreRefuser(m,i));const refusees=offers.every(o=>o.refuse);m.poste.conf=4;m.poste.obj.forEach(o=>{o.e='tenu';});const bilan=mgmtPosteBilan(m),renouvele=mgmtPosteRenouveler(m,bilan.issue);return {refusees,org:m.org===org,issue:bilan.issue,renouvele:!!renouvele,saison:m.poste.saison}})())`));
  assert.deepEqual(r,{refusees:true,org:true,issue:'prolonge-augmente',renouvele:true,saison:2});
});

test('Monde lot 58 T1 — la génération des offres ne consomme pas la graine de simulation',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=0;m.poste.obj.forEach(o=>o.e='cours');const avant=SEED;const une=JSON.stringify(mgmtOffresCreer(m));const apres=SEED;const deux=JSON.stringify(mgmtOffresCreer(m));return {avant,apres,stable:une===deux}})())`));
  assert.equal(r.apres,r.avant);
  assert.equal(r.stable,true);
});

test('Monde lot 58 T1 — le rang améliore l’acceptation du choc sans déplacer la graine',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const m=mgmtPasseGenerer('split',{soirees:3});const seed=SEED;const p=[1,2,4,8].map(mgmtChocProbabiliteAcceptation);const first=mgmtChocTirageAcceptation(m,'split');const second=mgmtChocTirageAcceptation(m,'split');return {p,stable:first===second,seed:SEED===seed}})())`));
  assert.deepEqual(r.p,[0.9,0.82,0.66,0.34]);
  assert.equal(r.stable,true);
  assert.equal(r.seed,true);
});
