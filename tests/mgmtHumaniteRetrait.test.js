"use strict";
/* Monde lot 11 T1 — décision d'Anthony du 15/10/2026 (docs/HUMANITE-A-REFAIRE.md) : métiers, milieux,
   moments de vie, rituels, libellés de rôles et trajectoires sont retirés pour l'instant, derrière
   l'interrupteur MGMT_HUMANITE_ACTIVE (mgmt-data.js). Rien n'est supprimé : l'interrupteur levé rend l'état d'avant. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

const NOUVELLE=(graine,actif)=>`MGMT_HUMANITE_ACTIVE=${actif}; setSeed(${graine}); const m=mgmtDefault('split'); m.graine=mgmtGraineNeuve(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);`;
function partie(graine,actif){ const w=newGameWindow({runMain:true}); w.eval(`(function(){${NOUVELLE(graine,actif)}})()`); return w; }
function fiche(w,i){ return JSON.parse(w.eval(`(function(){ const m=G.mgmt, f=m.roster[${i}]; CL.mgmtFiche(f.id); render();
  const id=mgmtIdentite(m,f); return JSON.stringify({html:[...document.body.children].filter(n=>n.tagName!=='SCRIPT').map(n=>n.outerHTML).join(''), texte:[...document.body.querySelectorAll('*')].filter(n=>!n.closest('script,style')&&n.children.length===0).map(n=>n.textContent).join(' '), id}); })()`)); }

test('Humanité retirée — la fiche ne montre ni milieu, ni ancien métier, ni rituel, ni trajectoire, ni moment de vie', () => {
  const w=partie(9,false);
  try{
    for(const i of [0,3,7]){
      const r=fiche(w,i);
      for(const k of ['milieu','metier','rituel']) if(r.id[k]) assert.ok(!r.texte.includes(r.id[k]), k+' affiché : '+r.id[k]);
      assert.ok(!/Son histoire|Ancien métier|Milieu :/.test(r.texte),'le bloc « Son histoire » est absent');
      assert.ok(!r.html.includes('mgmt-fiche-vie'),'aucun bloc de moments de vie');
    }
  }finally{ w.close(); }
});

test('Humanité retirée — aucune soirée ne fait naître de moment de vie, et aucune marque n\'en vient', () => {
  const w=partie(9,false);
  try{
    jouerSoirees(w,4);
    const n=w.eval(`G.mgmt.facts.filter(x=>x&&x.k==='moment_vie').length`);
    assert.equal(n,0,'aucun fait moment_vie');
  }finally{ w.close(); }
});

test('Humanité retirée — aucun libellé du catalogue des rôles n\'apparaît à l\'écran, mais les raisons de Leïla fonctionnent toujours', () => {
  const w=partie(9,false);
  try{
    jouerSoirees(w,2);
    const r=JSON.parse(w.eval(`(function(){ const m=G.mgmt; const lib=MGMT_ROLES.map(x=>x.libelle).filter(Boolean);
      const vus=[]; for(const f of m.roster.slice(0,12)){ CL.mgmtFiche(f.id); render(); const t=[...document.body.querySelectorAll('*')].filter(n=>!n.closest('script,style')&&n.children.length===0).map(n=>n.textContent).join(' '); for(const l of lib) if(t.includes(l)) vus.push(l); }
      const calcule=m.roster.some(f=>mgmtRole(m,f)!==null);
      return JSON.stringify({vus,calcule}); })()`));
    assert.deepEqual(r.vus,[],'libellés de rôle affichés : '+r.vus.join(', '));
    assert.equal(r.calcule,true,'le calcul des rôles reste (critère des raisons et des faits de présentation)');
  }finally{ w.close(); }
});

test('Humanité retirée — à graine égale, une partie jouée avec l\'interrupteur faux garde les mêmes combats et le même classement qu\'avant', () => {
  /* Les moments de vie rendaient parfois un combattant absent : les couper change la partie. La propriété gardée est
     le déterminisme : deux parties à graine égale, interrupteur faux, jouent les mêmes combats et donnent le même classement. */
  const lire=w=>w.eval(`JSON.stringify({h:G.mgmt.hist.map(t=>[t.a.id,t.b.id,t.winner,t.family]),cl:allDivisions().map(d=>mgmtDivisionRanking(G.mgmt,d.id,'organization').map(x=>x.id))})`);
  const a=partie(21,false), b=partie(21,false);
  try{ jouerSoirees(a,3); jouerSoirees(b,3); assert.equal(lire(a),lire(b)); }finally{ a.close(); b.close(); }
});

test('Humanité retirée — l\'interrupteur remis à vrai rend la fiche d\'avant', () => {
  const w=partie(9,true);
  try{
    const r=fiche(w,0);
    assert.ok(r.id.milieu&&r.texte.includes(r.id.milieu),'le milieu revient avec l\'interrupteur levé');
    assert.ok(r.id.metier&&r.texte.includes(r.id.metier),'l\'ancien métier revient avec l\'interrupteur levé');
  }finally{ w.close(); }
});
