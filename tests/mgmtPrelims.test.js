"use strict";
/* Brief du 06/10/2026, lot 7 : l'écran Préliminaires — validé / à valider / à trouver, valider la carte, changer un combat. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

function carteComplete(win){
  win.eval(`setSeed(7); CL.mgmtEnter(1); (()=>{ const m=G.mgmt; for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
    for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; } })()`);
}

test('Préliminaires — sans carte principale complète, tous « à trouver » ; la barre éclaire la section', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_prelims');`);
  assert.equal(win.eval('G.screen'),'mgmt_prelims');
  assert.equal(win.eval(`document.querySelectorAll('.mf-pre-slot.atrouver').length`),win.eval('G.mgmt.card.sizePrelims'));
  assert.equal(win.eval(`document.querySelector('.mf-barre-item.cur').dataset.section`),'preliminaires');
});

test('Préliminaires — la carte principale complète amène la proposition « à valider » ; Entrée la valide', () => {
  const win=newGameWindow({runMain:true});
  carteComplete(win);
  assert.equal(win.eval('G.mgmt.card.main.length'),win.eval('G.mgmt.card.sizeMain'));
  win.eval(`CL.go('mgmt_prelims');`);
  const n=win.eval(`document.querySelectorAll('.mf-pre-slot.avalider').length`);
  assert.ok(n>0,'des préliminaires attendent la validation');
  touche(win,'ArrowDown'); assert.equal(win.eval('MGMT_PRELIMS.i'),1);
  touche(win,'Enter');
  assert.equal(win.eval('G.mgmt.card.prelims.length'),win.eval('G.mgmt.card.sizePrelims'),'valider pose tous les préliminaires');
});

test('Préliminaires — C change le combat choisi sans toucher aux autres', () => {
  const win=newGameWindow({runMain:true});
  carteComplete(win); win.eval(`CL.go('mgmt_prelims');`);
  const avant=JSON.parse(win.eval(`JSON.stringify(mgmtPrelimsEmplacements(G.mgmt).slots.map(s=>s.fight&&s.fight.a+s.fight.b))`));
  touche(win,'c');
  const apres=JSON.parse(win.eval(`JSON.stringify(mgmtPrelimsEmplacements(G.mgmt).slots.map(s=>s.fight&&s.fight.a+s.fight.b))`));
  assert.notEqual(avant[0],apres[0],'le premier combat est remplacé');
  assert.deepEqual(avant.slice(1),apres.slice(1));
});
