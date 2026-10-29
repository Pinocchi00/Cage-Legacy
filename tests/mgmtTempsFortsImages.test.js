"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');
test('Temps forts — images fixes sur action, avenir masqué, lecture pure et verdict explicitement demandé',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:3});mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);jouerSoirees(w,1);
  assert.equal(w.eval(`(()=>{window.tfTrace=G.mgmt.hist.find(t=>t&&t.p!==true);return mgmtCombatOuvrir({trace:tfTrace,vue:'forts',retour:'mgmt_resultats'});})()`),true);
  assert.ok(w.document.querySelector('.mf-tf-cage svg'));assert.equal(w.document.querySelector('#mc-cv'),null);
  assert.equal(w.eval('MGMT_COMBAT.tempsFortActif'),0);assert.equal(w.document.querySelector('.mf-tf-verdict'),null);
  const caches=[...w.document.querySelectorAll('.mf-tf-repere:disabled')];assert.ok(caches.length>0);
  for(const e of caches){assert.equal(e.querySelector('span').textContent,'À découvrir');assert.match(e.getAttribute('aria-label'),/à découvrir$/);}
  const pur=JSON.parse(w.eval(`JSON.stringify((()=>{const C=MGMT_COMBAT,avant=JSON.stringify(G.mgmt),seed=SEED,lecture=JSON.stringify([C.d,C.real,C.tempsFortActif,C.mode]);mgmtReplayFight=()=>{throw new Error('Rendu ne doit pas rejouer');};render();mgmtCombatAvancer(120);return {partie:avant===JSON.stringify(G.mgmt)&&seed===SEED,image:lecture===JSON.stringify([C.d,C.real,C.tempsFortActif,C.mode])};})())`));
  assert.deepEqual(pur,{partie:true,image:true});
  w.eval(`keysHandle({key:'ArrowRight',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.tempsFortActif'),1);
  assert.equal(w.document.querySelectorAll('.mf-tf-score .mf-tf-initiale').length,2);
  const lecture=JSON.parse(w.eval(`JSON.stringify((()=>{const C=MGMT_COMBAT,image=mgmtCombatImageLecture(C,C.tempsFortActif),original=areneMoment,temps=[];try{areneMoment=(S,t)=>{temps.push(t);return original(S,t);};mgmtCombatImagesHtml();return {dernier:Math.max(...temps),t:image.t,moment:image.moment.t};}finally{areneMoment=original;}})())`));
  assert.ok(lecture.dernier<=lecture.t);assert.ok(lecture.t<=lecture.moment);
  assert.equal(w.document.querySelectorAll('.mf-tf-repere:disabled').length,caches.length-1);
  w.eval(`keysHandle({key:'ArrowLeft',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.tempsFortActif'),0);
  w.eval(`keysHandle({key:'Enter',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.tempsFortActif'),1);assert.equal(w.eval('MGMT_COMBAT.mode'),'fight');
  w.eval(`keysHandle({key:'P',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.mode'),'dec');assert.ok(w.document.querySelector('.mf-tf-verdict'));
  const cartes=JSON.parse(w.eval('JSON.stringify(MGMT_COMBAT.decision.cartes)'));
  assert.deepEqual([...w.document.querySelectorAll('.mf-tf-juge>b')].map(x=>x.textContent),cartes.map(x=>x.score));
  w.eval(`keysHandle({key:'R',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.tempsFortActif'),0);assert.equal(w.document.querySelector('.mf-tf-verdict'),null);
  assert.ok(w.document.querySelector('.mf-tf-repere:disabled'));
  w.eval(`keysHandle({key:'T',preventDefault(){}})`);assert.equal(w.eval('MGMT_COMBAT.vueCombat'),'complet');assert.ok(w.document.querySelector('#mc-cv'));assert.equal(w.document.querySelector('.mf-tf'),null);
 }finally{w.close();}
});
