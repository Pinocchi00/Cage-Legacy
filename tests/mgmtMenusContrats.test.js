"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('Contrats — anciens contrats, marché libre, mission et retours restent accessibles dans chaque sous-menu',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval('setSeed(7);CL.mgmtEnter(1)');
  for(const screen of ['mgmt_contrats','mgmt_recrutement','mgmt_recruteur_mission','mgmt_recruteur_retours']){
   w.eval(`CL.go('${screen}')`);const nav=w.document.querySelector('.rc-tabs-communs');assert.ok(nav,screen);
   const actions=[...nav.querySelectorAll('button')].map(x=>x.getAttribute('onclick'));
   for(const cible of ['mgmt_contrats','mgmt_recrutement','mgmt_recruteur_mission','mgmt_recruteur_retours'])assert.ok(actions.includes(`CL.go('${cible}')`),`${screen} → ${cible}`);
   for(const cible of ['mgmt_contrats','mgmt_recruteur_mission']){
    w.eval(`CL.go('${screen}')`);const bouton=[...w.document.querySelectorAll('.rc-tabs-communs button')].find(x=>x.getAttribute('onclick')===`CL.go('${cible}')`);bouton.click();assert.equal(w.eval('G.screen'),cible);
   }
  }
  w.eval(`CL.go('mgmt_contrats');CL.mgmtContratsMode('contrats')`);assert.ok(w.document.querySelector('.mf-ct-cours'));
  w.eval(`CL.mgmtContratsMode('recrutement')`);assert.match(w.document.querySelector('.mf-contenu').textContent,/SANS CONTRAT/);
 }finally{w.close();}
});

test('Menus préservés — vestiaire, affaires et quatre sous-menus utilisables au clavier',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval(`setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_effectif');keysHandle({key:'V',preventDefault(){}})`);assert.equal(w.eval('G.screen'),'mgmt_vestiaire');
  assert.ok(w.document.querySelector('.mgmt-vest-filtres'));
  w.eval(`keysHandle({key:'V',preventDefault(){}})`);assert.equal(w.eval('G.screen'),'mgmt_effectif');
  w.eval(`CL.go('mgmt_accueil')`);const affaires=[...w.document.querySelectorAll('button')].find(b=>b.textContent==='Les affaires');assert.ok(affaires);affaires.click();assert.equal(w.eval('G.screen'),'mgmt_bureau');
  w.eval(`CL.go('mgmt_recrutement');keysHandle({key:'Tab',shiftKey:true,preventDefault(){}})`);assert.equal(w.eval('G.screen'),'mgmt_contrats');
  assert.equal(w.document.activeElement.getAttribute('aria-current'),'page');
  w.eval(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}))`);assert.equal(w.eval('G.screen'),'mgmt_recrutement');
  w.eval(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}))`);assert.equal(w.eval('G.screen'),'mgmt_recruteur_mission');
  const original=w.eval('JSON.stringify(G.mgmt)');
  assert.equal(w.eval(`keysHandle({key:'Enter',target:document.activeElement,preventDefault(){throw Error('Activation native bloquée');}})`),false);
  assert.equal(w.eval('JSON.stringify(G.mgmt)'),original);
  w.eval(`document.querySelector('.rc-tabs-communs button').click()`);assert.equal(w.eval('G.screen'),'mgmt_contrats');
 }finally{w.close();}
});
