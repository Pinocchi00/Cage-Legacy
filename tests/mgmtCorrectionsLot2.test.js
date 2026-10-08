"use strict";
/* Brief des corrections du 08/10/2026, lot 2 : le booking dit ce qu'il sait — le contrat restant (2.1), la ceinture en jeu ou non (2.2), le combat réclamé (2.3),
   les coéquipiers et fratries (2.4), les homonymes (2.6), la rangée de boutons qui tient dans le panneau (2.7). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
const app=win=>win.document.getElementById('app');
function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1); (function(){ const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null; })();`);
  return win;
}
/** Premier choix posé sur un combattant libre, curseur sur son adversaire de catégorie. */
function pairer(win){
  return win.eval(`(function(){ const m=G.mgmt; const rows=mgmtCartRows(m); const a=rows.find(f=>mgmtSelectable(m,f,null)); MGMT_CART.pick=a.id;
    const b=mgmtCartRows(m).filter(f=>f.div===a.div&&f.id!==a.id).find(f=>mgmtSelectable(m,f,a.id)); MGMT_CART.cursor=mgmtCarteListe(m).findIndex(x=>x.id===b.id);
    G.screen='mgmt_carte'; render(); return {a:a.id,b:b.id}; })()`);
}

test('2.1 — « Contrat restant » affiche le même nombre que l’écran Contrats, pour les deux combattants', () => {
  const win=neuve(); const p=pairer(win);
  const att=win.eval(`[mgmtContratRestants(mgmtFighterById(G.mgmt,'${p.a}')),mgmtContratRestants(mgmtFighterById(G.mgmt,'${p.b}'))]`);
  const ligne=win.eval(`[...document.querySelectorAll('.mf-car-comp')].find(x=>/Contrat restant/.test(x.textContent)).textContent`);
  assert.ok(ligne.includes(att[0]+' COMBAT')&&ligne.includes(att[1]+' COMBAT'),'« '+ligne+' » doit porter '+att);
  win.eval(`G.screen='mgmt_prelims'; render();`);   // la même fonction sert les préliminaires
  assert.equal(win.eval(`mgmtCarteContratTexte(mgmtFighterById(G.mgmt,'${p.a}'))`),att[0]+' COMBAT'+(att[0]>1?'S':''));
});

test('2.2 — La ceinture en jeu ou non se lit sur la carte, sans doute possible, et un champion sans ceinture le dit à l’avant-combat', () => {
  const win=neuve();
  win.eval(`(function(){ const m=G.mgmt; const f=m.roster.find(x=>{const t=mgmtSplitTitle(m,x.div); return t&&t.id===x.id;}); const adv=m.roster.find(x=>x.div===f.div&&x.id!==f.id&&mgmtAvailable(m,x));
    m.card.main=[{a:f.id,b:adv.id,cycle:m.cycle,slot:'main'}]; G.screen='mgmt_carte'; render(); })()`);
  assert.match(app(win).textContent,/SANS TITRE/,'éteint, le bouton dit « sans titre »');
  win.eval(`mgmtSetTitle(G.mgmt,0,true); render();`);
  assert.match(app(win).textContent,/TITRE EN JEU/);
  const T=win.eval(`MGMT_SOIREE_TEXTES.sansCeinture`);
  assert.equal(T,'Ceinture pas en jeu');
  const e=win.eval(`mgmtSoireeEnjeux(G.mgmt,{titre:false,h:0,trace:{c:0,a:{id:'x'},b:{id:'y'}}},{rang:'C',last:'X',attente:0},{rang:'N°1',last:'Y',attente:0})`);
  assert.ok(e.includes(T),'l’avant-combat annonce qu’un champion combat sans sa ceinture');
});

test('2.3 et 2.4 — Le booking marque le combat réclamé et prévient pour les coéquipiers et les frères et sœurs', () => {
  const win=neuve(); const p=pairer(win);
  win.eval(`window.__rec=[{a:'${p.a}',b:'${p.b}'}]; mgmtPublicReclame=function(){ return window.__rec; }; render();`);
  assert.match(app(win).textContent,/Combat réclamé/);
  win.eval(`window.__rec=[]; mgmtMemeCamp=function(){ return true; }; render();`);
  assert.match(app(win).textContent,/Même camp : les opposer les contrarie/);
  assert.ok(!/Combat réclamé/.test(app(win).textContent));
  win.eval(`mgmtMemeCamp=function(){ return false; }; mgmtFratrie=function(m,f){ return ['${p.b}']; }; render();`);
  assert.match(app(win).textContent,/Frère et sœur : les opposer les contrarie/);
  /* L'écran Camps dit la même chose que la règle (une charge, pas un refus). */
  const src=fs.readFileSync(path.join(__dirname,'..','mgmt-suivi-cadre.js'),'utf8');
  assert.ok(src.includes('Les opposer les contrarie')&&!src.includes('refusent de s’affronter'));
});

test('2.6 — Deux combattants de même nom se distinguent dans la liste par l’initiale du prénom', () => {
  const win=neuve(); const p=pairer(win);
  win.eval(`(function(){ const m=G.mgmt; const l=mgmtCarteListe(m); l[0].last='LE GALL'; l[0].first='Hugo'; l[1].last='LE GALL'; l[1].first='Marc'; MGMT_CART.cursor=0; render(); })()`);
  const noms=win.eval(`[...document.querySelectorAll('.mf-car-adv-nb b')].map(b=>b.textContent)`);
  assert.ok(noms.includes('H. LE GALL')&&noms.includes('M. LE GALL'),noms.join(' | '));
  assert.ok(win.eval(`mgmtCarteHomonymes([{last:'A'},{last:'B'}]).size`)===0,'un nom unique reste seul');
  void p;
});

test('2.7 — La rangée de boutons du booking passe à la ligne au lieu de déborder', () => {
  assert.match(css,/\.mf-car-boutons\{[^}]*flex-wrap:wrap/);
});

test('2.5 — La liste des répliques « proposition » qui se lisent comme un refus est remise à Anthony', () => {
  const doc=fs.readFileSync(path.join(__dirname,'..','docs','CORRECTIONS-08-10-REPLIQUES-REFUS.md'),'utf8');
  assert.match(doc,/non merci/);
});
