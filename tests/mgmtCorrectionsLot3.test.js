"use strict";
/* Brief des corrections du 08/10/2026, lot 3 : le lendemain parle du bon combat (3.1, 3.2) et la presse n'affiche plus de libellé de catalogue (3.3). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
function neuve(n){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,n||2,{titre:true});
  return win;
}

test('3.1 — Le libellé « Combat principal » du lendemain désigne le dernier combat de la carte principale, « Co-main » l’avant-dernier', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_lendemain')`);
  const items=win.eval(`[...document.querySelectorAll('.mgmt-ld-results .mgmt-ld-item')].map(x=>({slot:(x.querySelector('.mgmt-ld-slot')||{}).textContent||'',titre:x.querySelector('.mgmt-ld-title').textContent}))`);
  const idx=win.eval(`(function(){ const m=G.mgmt, e=m.lastEvent; const mains=[]; e.fights.forEach((f,i)=>{ const t=mgmtSoireeTrace(m,i); if(t&&t.slot==='main') mains.push(i); }); return mains; })()`);
  assert.ok(idx.length>=2);
  assert.equal(items[idx[idx.length-1]].slot,'Combat principal','le dernier combat joué de la carte principale');
  assert.equal(items[idx[idx.length-2]].slot,'Co-main');
  for(const k of idx.slice(0,-2)) assert.equal(items[k].slot,'','les autres n’ont pas de libellé');
});

test('3.2 — La presse du lendemain parle d’abord du combat principal, puis du résultat le plus marquant', () => {
  const win=neuve();
  const r=win.eval(`(function(){ const m=G.mgmt, c=m.lastEvent.cycle; const mains=m.hist.filter(t=>t&&t.c===c&&t.slot==='main'&&t.winner!=='D'); const principal=mains[mains.length-1];
    const l=mgmtMediasLendemain(m); return {n:l.length,id:l[0]&&l[0].id,gagnant:principal?(principal.winner==='A'?principal.a.id:principal.b.id):null}; })()`);
  assert.ok(r.n>=1);
  assert.equal(r.id,r.gagnant,'la première ligne parle du vainqueur du combat principal, pas du combat d’ouverture');
  /* Un champion battu pèse plus qu'un favori fini au premier round, qui pèse plus qu'un résultat ordinaire. */
  const p=win.eval(`(function(){ const m=G.mgmt; const t=m.hist[m.hist.length-1]; const base={c:t.c,family:'ko',round:1,winner:'A',a:Object.assign({},t.a,{W:5,L:5}),b:Object.assign({},t.b,{W:9,L:1})}; return [mgmtMediasMarquant(m,base,0), mgmtMediasMarquant(m,Object.assign({},base,{family:'dec',round:3}),0), mgmtMediasMarquant(m,Object.assign({},base,{winner:'D'}),0)]; })()`);
  assert.equal(JSON.stringify(p),'[2,0,0]','favori fini au premier round : 2 ; décision ou nul : 0');
});

test('3.3 — Sans texte d’auteur, un moment de vie ne paraît jamais dans la presse, ni le libellé du catalogue tel quel', () => {
  const win=neuve(1);
  win.eval(`MGMT_MOMENTS.forEach(x=>{ delete x.texte; }); const m=G.mgmt; m.cycle=m.cycle||3; for(const f of m.roster.slice(0,8)) m.facts.push({c:m.cycle,k:'moment_vie',a:f.id,m:'deces-parent'}); for(const f of m.roster.slice(0,8)) m.cercle=(m.cercle||[]).concat(f.id).slice(0,5);`);
  assert.equal(win.eval(`mgmtConteurCandidats(G.mgmt,G.mgmt.cycle).length`),0,'aucun candidat sans texte');
  win.eval(`G.screen='mgmt_bureau'; render();`);
  assert.ok(!win.eval(`document.getElementById('app').textContent`).includes('Décès d’un parent')&&!win.eval(`document.getElementById('app').textContent`).includes("Décès d'un parent"));
  win.eval(`MGMT_MOMENTS.forEach(x=>{ x.texte='Un texte écrit.'; });`);
  assert.ok(win.eval(`mgmtConteurCandidats(G.mgmt,G.mgmt.cycle).length`)>0,'avec un texte d’auteur, le moment reparaît');
  assert.equal(win.eval(`mgmtVieTexte(null)`),null);
});

test('3.3 — Sur vingt semaines simulées, aucun libellé du catalogue ne sort tel quel sur les écrans de presse', () => {
  const win=neuve(4);
  win.eval(`MGMT_MOMENTS.forEach(x=>{ delete x.texte; });`);
  const libs=win.eval(`MGMT_MOMENTS.map(x=>x.libelle)`);
  for(const ecran of ['mgmt_bureau','mgmt_presse','mgmt_lendemain']){
    win.eval(`G.screen=${JSON.stringify(ecran)}; render();`);
    const t=win.eval(`document.getElementById('app').textContent`);
    for(const l of libs) assert.ok(!t.includes(l),ecran+' ne doit pas afficher « '+l+' »');
  }
});
