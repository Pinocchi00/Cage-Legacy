"use strict";
/* Brief du 06/10/2026, lot 7 : la Carte dans le cadre — cinq combats, états confirmé / à confirmer / à composer, face-à-face, Entrée. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Carte — cinq emplacements à composer, premier choix, adversaire visé « à confirmer », Entrée confirme', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-car-slot').length`),5);
  assert.equal(win.eval(`document.querySelectorAll('.mf-car-slot.vide').length`),5);
  touche(win,'Enter');
  assert.ok(win.eval('MGMT_CART.pick'),'le premier choix est posé');
  assert.equal(win.eval(`document.querySelectorAll('.mf-car-slot.apreparer').length`),1,'le combat préparé est « à confirmer »');
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('Confirmer le combat')`));
  assert.equal(win.eval('G.mgmt.card.main.length'),0,'rien n’est posé tant que le joueur n’a pas confirmé');
  touche(win,'Enter');
  assert.equal(win.eval('G.mgmt.card.main.length'),1); assert.equal(win.eval(`document.querySelectorAll('.mf-car-slot.confirme').length`),1);
});

test('Carte — C change de catégorie, 1 retire un combat, la barre éclaire Carte', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte');`);
  const d0=win.eval('mgmtCarteDiv(G.mgmt)'); touche(win,'c'); assert.notEqual(win.eval('mgmtCarteDiv(G.mgmt)'),d0);
  touche(win,'Enter'); touche(win,'Enter'); assert.equal(win.eval('G.mgmt.card.main.length'),1);
  touche(win,'1'); assert.equal(win.eval('G.mgmt.card.main.length'),0);
  assert.equal(win.eval(`document.querySelector('.mf-barre-item.cur').dataset.section`),'carte');
});

test('Carte — un suspendu et un engagé restent visibles et muets ; la carte pleine ne prend plus rien', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte');`);
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=G.mgmt; const l=mgmtCarteListe(m); l[1].susp=m.cycle+9; render();
    const off=document.querySelectorAll('.mf-car-adv.off').length, txt=document.getElementById('app').textContent.includes('Indisponible');
    for(let k=0;k<7;k++){ const L=mgmtCarteListe(m); if(!L.length) break; CL.mgmtPick(L[0].id); const L2=mgmtCarteListe(m); const o=L2.find(f=>mgmtSelectable(m,f,MGMT_CART.pick)); if(o) CL.mgmtPick(o.id); else MGMT_CART.pick=null; CL.mgmtCarteCategorie(1); }
    return {off,txt,n:m.card.main.length,max:m.card.sizeMain};})())`));
  assert.ok(r.off>=1&&r.txt,'le suspendu est visible et dit pourquoi'); assert.ok(r.n<=r.max,'jamais plus de cinq combats');
});

test('Carte — un nom hostile s’affiche échappé, jamais injecté', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); const m=G.mgmt; const f=mgmtCartRows(m)[0]; f.name='<img src=x onerror=alert(1)>'; f.last='<img src=x onerror=alert(1)>'; f.first='<b>x</b>';
    CL.go('mgmt_carte'); CL.mgmtPick(f.id); render();`);
  assert.equal(win.eval(`document.querySelectorAll('#app img,#app b[onerror]').length`),0);
  assert.ok(win.eval(`document.getElementById('app').innerHTML.includes('&lt;')`));
});

test('Carte — un combat de champion se pose pour le titre d’un clic sur la pastille TITRE, jamais d’office', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); (()=>{ const m=G.mgmt,g=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=2);
    const champ=mgmtSplitTitle(m,g[0].div).id; mgmtBookMain(m,champ,g.find(f=>f.id!==champ).id); G.screen='mgmt_carte'; render(); })()`);
  const b=win.eval(`document.querySelector('.mf-car-titre')?document.querySelector('.mf-car-titre').getAttribute('aria-pressed'):null`);
  assert.equal(b,'false','aucun titre implicite au booking');
  win.eval(`document.querySelector('.mf-car-titre').click()`);
  assert.equal(win.eval('G.mgmt.card.main[0].title'),true);
});
