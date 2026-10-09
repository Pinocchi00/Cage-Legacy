"use strict";
/* Lot 7 du brief démo (09/10/2026) : booker en connaissance de cause. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('T1 — partie neuve : la ligne Style d’une paire du haut du classement dit la force du bilan, avec la mention « D’après son bilan »', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, rows=mgmtCartRows(m); let n=0, sources=0, interrogation=0;
    for(const f of rows.slice(0,12)){ const c=mgmtCarteColonne(m,f); n++; if(c.styleBilan) sources++; if(c.style==='?') interrogation++; }
    const f=rows.find(x=>mgmtCarteColonne(m,x).styleBilan), g=f&&rows.find(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id)); let html=''; if(g){ MGMT_CART.pick=f.id; MGMT_CART.cursor=mgmtCarteListe(m).findIndex(x=>x.id===g.id); CL.go('mgmt_carte'); html=document.getElementById('app').textContent; }
    return {n,sources,interrogation,html};`);
  assert.ok(r.sources>=1,'au moins un combattant du haut du classement a une ligne Style lisible'); assert.ok(r.html.includes('D’après son bilan'),'la source est dite une fois, dans les enjeux (retours du 09/10 : plus sous le texte du style)');
});

test('T1 — après un combat regardé, la ligne Style vient de ce que le joueur a vu, plus du bilan', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, f=mgmtCartRows(m).find(x=>mgmtCarteColonne(m,x).styleBilan); if(!f) return {saute:true};
    mgmtConnaissance=function(){ return {combat:true}; };
    const c=mgmtCarteColonne(m,f); return {bilan:c.styleBilan,style:c.style};`);
  if(r.saute) return;
  assert.equal(r.bilan,false); assert.notEqual(r.style,'?');
});

test('T2 — les trois derniers combats se remplissent avec les combats d’avant la partie, sur la carte comme sur l’effectif', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, rows=mgmtCartRows(m).slice(0,12); const longueurs=rows.map(f=>mgmtEffectifForme(m,f).length);
    const f=rows[0]; const html=mgmtCarteFormeHtml(m,f);
    return {longueurs,html:html.includes('mf-eff-forme'),tiret:html.includes("<b>—</b>")};`);
  assert.ok(r.longueurs.every(n=>n===3)); assert.equal(r.html,true); assert.equal(r.tiret,false);
});

test('T2 — les combats joués chez l’organisation passent avant ceux d’avant la partie', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, f=mgmtCartRows(m)[0], avant=mgmtEffectifForme(m,f).join('');
    m.hist.push({c:1,slot:'main',seed:1,rounds:3,a:{id:f.id,W:f.W,L:f.L,D:0,age:f.age,lastCycle:null},b:{id:'x',W:5,L:5,D:0,age:25,lastCycle:null},winner:'A',family:'dec',round:3});
    const apres=mgmtEffectifForme(m,f).join(''); return {avant,apres};`);
  assert.equal(r.apres.length,3); assert.equal(r.apres.charAt(2),'v');
});

test('T3 — avec un premier choix posé, l’adversaire que le public réclame porte la mention, avant toute confirmation', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); const a=rows[0], b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id));
    mgmtPublicReclame=function(){ return [{a:a.id,b:b.id,raison:'rivalite',texte:''}]; }; MGMT_CARTE_RECL=null;
    const avec=mgmtCarteNote(m,b,a.id), sans=mgmtCarteNote(m,b,null);
    mgmtPublicReclame=function(){ return []; }; MGMT_CARTE_RECL=null; const apres=mgmtCarteNote(m,b,a.id);
    return {avec,sans,apres};`);
  assert.equal(r.avec,'Le public réclame ce combat'); assert.notEqual(r.sans,r.avec); assert.notEqual(r.apres,r.avec);
});
