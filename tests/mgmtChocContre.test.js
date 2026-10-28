"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('Choc — contre-proposition des combats : brouillon annulable, adversaires valides, accord/refus et calendrier uniques',()=>{
 const w=newGameWindow({runMain:true});
 try{
  w.eval(`setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:6});mgmtMondeVivantGenerer(m,{soirees:6});G.mgmt=m;
   if(!mgmtChocProposition(m))throw new Error('Proposition réelle absente');window.chocAvant=JSON.stringify(m);G.screen='mgmt_choc';render();
   window.remiseChoc=()=>{G.mgmt=JSON.parse(chocAvant);MGMT_CHOC_CHOIX=null;};
   window.autresCombats=()=>{const c=G.mgmt.choc,p=c.paires.map(p=>({...p})),autre=mgmtChocPairesDisponibles(G.mgmt,c.orgId).find(q=>!p.some(x=>x.div===q.div));if(!autre)throw new Error('Alternative absente');p[0]=autre;return p;};
   keysHandle({key:'P',preventDefault(){}});`);
  assert.ok(w.document.querySelector('.ch3-choix'));assert.equal(w.eval('JSON.stringify(G.mgmt)'),w.chocAvant);
  w.eval(`const choix=autresCombats();mgmtChocChoisirCombat(0,choix[0].div);`);
  assert.equal(w.eval('JSON.stringify(G.mgmt)'),w.chocAvant,'la prévisualisation ne modifie pas la sauvegarde');
  const select=w.document.querySelector('select');assert.equal(w.eval(`keysHandle({key:'Enter',target:document.querySelector('select'),preventDefault(){throw new Error('Clavier natif intercepté');}})`),false);assert.ok(select);
  w.eval(`keysHandle({key:'Escape',preventDefault(){}})`);assert.equal(w.document.querySelector('.ch3-choix'),null);assert.equal(w.eval('JSON.stringify(G.mgmt)'),w.chocAvant);
  const lecture=code=>JSON.parse(w.eval(`JSON.stringify((()=>{${code}})())`));
  for(const mutation of ["p[1]=p[0]","p[0]={...p[0],a:p[0].b}","p.pop()"]){
   assert.equal(w.eval(`(()=>{remiseChoc();const p=autresCombats();${mutation};return mgmtChocEnvoyerContre(G.mgmt,p);})()`),false);assert.equal(w.eval('JSON.stringify(G.mgmt)'),w.chocAvant);
  }
  assert.equal(w.eval('mgmtChocEnvoyerContre(G.mgmt,G.mgmt.choc.paires)'),false);
  const accepte=lecture(`remiseChoc();mgmtChocTirageAcceptation=()=>true;const m=G.mgmt,p=autresCombats(),ok=mgmtChocEnvoyerContre(m,p);return {ok,p,retenu:m.choc.paires,div:m.choc.div,a:m.choc.a,b:m.choc.b,etat:m.choc.etat,agenda:m.cal.prochaines.filter(x=>x.jour===m.choc.jour).length,valide:validateMgmt(m)&&mgmtMondeVivantValide(m),sauve:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.equal(accepte.ok,true);assert.equal(accepte.etat,'programme');assert.deepEqual(accepte.retenu,accepte.p);assert.equal(accepte.a,accepte.p[0].a);assert.equal(accepte.b,accepte.p[0].b);assert.equal(accepte.div,accepte.p[0].div);assert.equal(accepte.agenda,1);assert.equal(accepte.valide,true);assert.equal(accepte.sauve,true);
  assert.equal(w.eval('mgmtChocEnvoyerContre(G.mgmt,autresCombats())'),false,'une soirée déjà programmée est figée');
  const refuse=lecture(`remiseChoc();mgmtChocTirageAcceptation=()=>false;const m=G.mgmt,avant=JSON.stringify(m.cal);return {ok:mgmtChocEnvoyerContre(m,autresCombats()),etat:m.choc.etat,agenda:avant===JSON.stringify(m.cal),valide:validateMgmt(m)};`);
  assert.deepEqual(refuse,{ok:true,etat:'refuse',agenda:true,valide:true});
  const bloque=lecture(`remiseChoc();mgmtChocTirageAcceptation=()=>true;mgmtAgendaPoser=()=>({ok:false});const ok=mgmtChocEnvoyerContre(G.mgmt,autresCombats());return {ok,intact:JSON.stringify(G.mgmt)===chocAvant};`);
  assert.deepEqual(bloque,{ok:false,intact:true});
 }finally{w.close();}
});
