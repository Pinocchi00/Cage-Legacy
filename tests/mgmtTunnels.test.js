"use strict";
/* Reprise de fidélité du 07/10/2026 : les tunnels d'octogones reviennent sur les planches où ils figurent — rouge derrière la bannière de la Fiche, jaune derrière
   un champion, la carte du champion des Classements et la ceinture ouverte — et la Fiche est refaite sur ses six planches (aperçu, style, combats, contrat, on en dit). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const racine=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(racine,'ui-cadre.css'),'utf8');
function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,2,{titre:true});
  win.eval(`const m=G.mgmt; if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');`);
  return win;
}
const app=win=>win.document.getElementById('app');

test('Les deux tunnels sont des images du dépôt, déclarées dans le cache hors ligne', () => {
  for(const f of ['images/accueil-octogones.jpg','images/tunnel-or.jpg']) assert.ok(fs.statSync(path.join(racine,f)).size>10000,f);
  assert.match(css,/\.mf-fb-img\{[^}]*accueil-octogones\.jpg/,'rouge derrière un combattant');
  assert.match(css,/\.mf-fb\.or \.mf-fb-img\{[^}]*tunnel-or\.jpg/,'jaune derrière un champion');
  assert.match(css,/\.mf-su-champ-in::before\{[^}]*tunnel-or\.jpg/,'jaune derrière la carte du champion des Classements');
  assert.match(css,/\.mf-su-det-in::before\{[^}]*tunnel-or\.jpg/,'jaune derrière la ceinture ouverte');
  const sw=fs.readFileSync(path.join(racine,'sw.js'),'utf8');
  assert.ok(sw.includes('images/tunnel-or.jpg')&&sw.includes('images/accueil-octogones.jpg'),'précachées');
});

const champion=(win,oui)=>win.eval(`(function(){ const m=G.mgmt; const f=m.roster.find(f=>{ const t=mgmtSplitTitle(m,f.div); return !!(t&&t.id===f.id)===${oui}; }); return f?f.id:null; })()`);

test('La Fiche : cinq onglets, la bannière rouge, et le retour n’est pas un onglet', () => {
  const win=neuve();
  const id=champion(win,false); assert.ok(id,'fixture : un combattant sans ceinture');
  win.eval(`CL.mgmtFiche(${JSON.stringify(id)})`);
  const a=app(win);
  assert.equal(a.querySelectorAll('.mf-fiche-onglets .mf-onglet:not(.mf-fiche-retour)').length,5);
  assert.ok(a.querySelector('.mf-fb:not(.or) .mf-fb-img'),'bannière rouge');
  assert.ok(a.querySelector('.mf-fb .mf-fb-nom .n')&&a.querySelector('.mf-fb .mf-fb-pal b'),'le nom et le palmarès');
  for(const o of ['apercu','style','combats','contrat','ondit']){
    win.eval(`CL.mgmtFicheOnglet('${o}')`);
    assert.ok(a.querySelector('.mf-fi-corps').children.length>0,o+' : un corps');
  }
});

test('La Fiche d’un champion : la bannière jaune, avec « C » pour rang', () => {
  const win=neuve();
  const id=champion(win,true); assert.ok(id,'fixture : un champion Split');
  win.eval(`CL.mgmtFiche(${JSON.stringify(id)})`);
  assert.ok(app(win).querySelector('.mf-fb.or'),'bannière jaune');
  assert.equal(app(win).querySelector('.mf-fb-rang').textContent,'C');
});

test('La Fiche : aucune injection par le nom d\'un adversaire dans l\'onglet Combats', () => {
  const win=neuve();
  win.eval(`(function(){ const m=G.mgmt, t=m.hist[0]; t.b.name='<b id=x>boum</b>'; t.a.name='<b id=x>boum</b>'; CL.mgmtFiche(m.hist[0].a.id); CL.mgmtFicheOnglet('combats'); })()`);
  assert.equal(app(win).querySelector('#x'),null);
});
