"use strict";
/* Brief des corrections du 08/10/2026, lot 4 : la fiche du combattant. Une seule notation de rang, « C » puis 1, 2, 3 (4.3) ; la soirée par son nom et sa date,
   jamais « Cycle » (4.5) ; aucun mot technique ni doublé ; les deux compteurs séparés ; le panneau de droite habillé (4.1). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,2,{titre:true});
  return win;
}
const texte=win=>win.eval(`document.getElementById('app').textContent`);

test('4.3 — Une seule notation de rang : « C » pour le champion, puis 1, 2, 3 sans compter le champion, sur la carte comme sur la fiche', () => {
  const win=neuve();
  const r=win.eval(`(function(){ const m=G.mgmt; const out=[];
    for(const d of allDivisions().slice(0,4)){ const t=mgmtSplitTitle(m,d.id); const l=mgmtDivisionRanking(m,d.id,'organization').filter(x=>!(t&&t.id===x.id));
      const champ=t&&t.id?mgmtFighterById(m,t.id):null;
      out.push({champ:champ?mgmtRangTexte(m,champ):null,premier:l[0]?mgmtRangTexte(m,mgmtFighterById(m,l[0].id)):null,second:l[1]?mgmtRangTexte(m,mgmtFighterById(m,l[1].id)):null}); }
    return out; })()`);
  for(const x of r){ if(x.champ) assert.equal(x.champ,'C'); if(x.premier) assert.equal(x.premier,'N°1','le premier prétendant est N°1'); if(x.second) assert.equal(x.second,'N°2'); }
  /* Le même rang sur la carte et sur la fiche. */
  const id=win.eval(`(function(){ const m=G.mgmt; const f=m.roster.find(x=>{ const t=mgmtSplitTitle(m,x.div); return !(t&&t.id===x.id)&&mgmtDivisionRank(m,x)>1; }); return f.id; })()`);
  const carte=win.eval(`mgmtCarteColonne(G.mgmt,mgmtFighterById(G.mgmt,${JSON.stringify(id)})).rang`);
  win.eval(`CL.mgmtFiche(${JSON.stringify(id)})`);
  const fiche=win.eval(`document.querySelector('.mf-fb-rang').textContent`);
  assert.equal(carte,fiche,'N° identique sur la carte et sur la fiche');
  assert.match(fiche,/^N°\d+$/);
  const champ=win.eval(`(function(){ const m=G.mgmt; return m.roster.find(x=>{ const t=mgmtSplitTitle(m,x.div); return t&&t.id===x.id; }).id; })()`);
  win.eval(`CL.mgmtFiche(${JSON.stringify(champ)})`);
  assert.equal(win.eval(`document.querySelector('.mf-fb-rang').textContent`),'C');
  assert.ok(win.eval(`!!document.querySelector('.mf-fb.or')`),'l’octogone jaune');
});

test('4.5 — L’onglet Combats nomme la soirée et sa date, jamais « Cycle », et « Sa vie » ne double aucun mot', () => {
  const win=neuve();
  const id=win.eval(`G.mgmt.hist[0].a.id`);
  win.eval(`CL.mgmtFiche(${JSON.stringify(id)}); CL.mgmtFicheOnglet('combats')`);
  const t=texte(win);
  assert.ok(!/Cycle \d/.test(t),'aucun « Cycle N »');
  assert.match(t,/Fight Night \d+, \d+ [A-ZÉÛa-zéû]+/,'le nom et la date de la soirée');
  /* « Revient sur les réseaux » + relais « Réseaux » : le relais déjà dit n'est pas répété. */
  const h=win.eval(`mgmtFicheRelaisHtml({libelle:'Revient sur les réseaux',relais:['Réseaux','Cage Hebdo']})`);
  assert.ok(!/Réseaux/.test(h)&&/via Cage Hebdo/.test(h));
  assert.equal(win.eval(`mgmtFicheRelaisHtml({libelle:'Adopte un chien',relais:[]})`),'');
});

test('4.5 — « Ton cercle » et « Tes suivis » sont deux boutons séparés ; 4.1 — le panneau de droite a ses marges et ses titres', () => {
  assert.match(css,/\.mf-lien\{[^}]*gap:16px/);
  assert.match(css,/\.mf-fi-ancien h3\{[^}]*margin:26px 0 10px/);
  assert.match(css,/\.mf-fi-ancien p,[^{]*\{font-size:24px/);
  const win=neuve();
  win.eval(`CL.mgmtFiche(G.mgmt.roster[1].id); CL.mgmtFicheOnglet('ondit')`);
  assert.ok(win.eval(`!!document.querySelector('.mgmt-fiche-lien.mf-lien')`));
});
