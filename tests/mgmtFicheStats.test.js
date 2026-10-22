"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {newGameWindow}=require('./helpers/loadGame');
function monde(){const w=newGameWindow({runMain:true});w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");return w;}
function open(w,tab='stats'){w.eval(`(()=>{const m=G.mgmt,f=m.roster.find(x=>x&&mgmtStatsCarriere(m,x.id)?.docs>=3)||m.roster.find(x=>x&&mgmtStatsDocumentes(m,x.id));MGMT_FICHE={id:f.id,retour:'mgmt_effectif',cursor:0,onglet:${JSON.stringify(tab)}};G.screen='mgmt_fiche';render();})()`);}

test('Monde lot 31 T4 — onglet troisième, Tab dans l’ordre, Aperçu par défaut et phrase vide',()=>{
 const w=monde();assert.equal(w.eval("MGMT_FICHE_ONGLETS.map(x=>x.id).join(',')"),'apercu,style,stats,combats,contrat,ondit');
 w.eval("MGMT_FICHE={id:G.mgmt.roster[0].id,retour:'mgmt_effectif',cursor:0};G.screen='mgmt_fiche';render()");assert.equal(w.eval('MGMT_FICHE.onglet'),'apercu');
 w.eval('CL.mgmtFicheOnglet("stats")');assert.match(w.eval("document.querySelector('.mf-fi-corps').textContent"),/Pas encore de combat documenté/);
});
test('Monde lot 31 T4 — huit libellés, valeurs formatées, moyenne et rang sans valeurs invalides',()=>{
 const w=monde();open(w);const text=w.eval("document.querySelector('.mf-fi-corps').textContent"), data=JSON.parse(w.eval("(()=>{const f=mgmtFighterById(G.mgmt,MGMT_FICHE.id),s=mgmtStatsCarriere(G.mgmt,f.id);return JSON.stringify({s,value:mgmtFicheStatsFormat(s.sigParMin,'sigParMin'),pct:mgmtFicheStatsFormat(s.precision,'precision'),duration:mgmtFicheStatsFormat(s.dureeMoyenne,'dureeMoyenne')});})()"));
 for(const label of ['Coups significatifs donnés par minute','Précision','Encaissés par minute','Défense debout','Amenées par 15 minutes','Défense d’amenée','Soumissions tentées par 15 min','Contrôle au sol par 15 minutes']) assert.ok(text.includes(label),label);
 assert.ok(text.includes(String(data.s.docs)));assert.ok(text.includes(data.value));assert.ok(text.includes(data.pct));assert.ok(text.includes(data.duration));assert.ok(text.includes('moy.'));assert.doesNotMatch(text,/NaN|undefined|Infinity|null/);
});
test('Monde lot 31 T4 — contrôle au sol formaté en secondes par 15 minutes',()=>{
  const w=monde();
  assert.deepEqual(JSON.parse(w.eval("JSON.stringify([mgmtFicheStatsFormat(24,'controlePar15'),mgmtFicheStatsFormat(111,'controlePar15'),mgmtFicheStatsFormat(0,'controlePar15'),mgmtFicheStatsFormat(null,'controlePar15')])")),['0:24','1:51','0:00','—']);
});
test('Monde lot 31 T4 — les deux répartitions totalisent exactement 100',()=>{
 const w=monde();const out=w.eval("JSON.stringify([mgmtFicheStatsRepart([.61,.22,.17]),mgmtFicheStatsRepart([.88,.09,.03])])");
 for(const bar of JSON.parse(out))assert.equal(bar.reduce((a,b)=>a+b,0),100);
});
test('Monde lot 31 T4 — façon de gagner selon les méthodes et échappement',()=>{
 const w=monde();const r=w.eval("JSON.stringify([mgmtFicheStatsFacon({}),mgmtFicheStatsFacon({ko:1}),mgmtFicheStatsFacon({ko:2,sub:1,stop:1,dec:2}),mgmtFicheStatsFacon({ko:1,sub:0})])");
 assert.deepEqual(JSON.parse(r),['','1 KO · aucune soumission','2 KO · 1 soumission · 1 arrêt médical · 2 décisions','1 KO · aucune soumission']);
 open(w);w.eval("G.mgmt.roster[0].name='<b>test</b>'");const html=w.eval("mgmtFicheStatsHtml(G.mgmt,G.mgmt.roster[0])");assert.doesNotMatch(html,/<b>test<\/b>/);
});
test('Monde lot 31 T4 — bouton SUIVI, SUIVRE, aria-pressed et touche S',()=>{
  // Adapté selon la décision superviseur « REPRISE VISUELLE » : le contrôle suit la bannière, non la rangée d’onglets.
  const w=monde();open(w,'apercu');let html=w.eval("document.querySelector('.mf-fb-wrap').innerHTML");
  assert.match(html,/SUIVRE/);assert.match(html,/aria-pressed="false"/);assert.match(html,/CL\.mgmtSuivre/);
  w.eval('CL.mgmtSuivre(MGMT_FICHE.id)');html=w.eval("document.querySelector('.mf-fb-wrap').innerHTML");assert.match(html,/SUIVI/);assert.match(html,/aria-pressed="true"/);assert.match(html,/<svg/);
  assert.match(fs.readFileSync(require.resolve('../ui-cadre.css'),'utf8'),/\.mf-fb-suivi\.on\{[^}]*background:#F0B220/);
  const n=w.eval('mgmtSuivis(G.mgmt).length');w.eval("keysHandle({key:'s',preventDefault(){}})");assert.equal(w.eval('mgmtSuivis(G.mgmt).length'),n-1);
});
test('Monde lot 31 T4 — structure visuelle des panneaux, barres et échelles',()=>{
  const w=monde();open(w);const shape=JSON.parse(w.eval("JSON.stringify((()=>{const panels=[...document.querySelectorAll('.mf-fs-panel')],frames=[...document.querySelectorAll('.mf-fs-frame')],bars=[...document.querySelectorAll('.mf-fs-part')];return {panels:panels.length,frames:frames.length,layers:frames.map(x=>x.firstElementChild?.firstElementChild?.classList.contains('mf-fs-panel')?3:0),segments:bars.map(x=>x.querySelectorAll('.mf-fs-bar i').length),percent:bars.some(x=>x.querySelector('.mf-fs-bar').textContent.includes('%'))}})())"));
  assert.equal(shape.panels,3);assert.equal(shape.frames,3);assert.deepEqual(shape.layers,[3,3,3]);assert.deepEqual(shape.segments,[3,3]);assert.equal(shape.percent,false);
  const fills=JSON.parse(w.eval(`(()=>{const old=[mgmtStatsCarriere,mgmtStatsDocumentes,mgmtStatsCategorie];mgmtStatsCarriere=()=>({docs:3,sigParMin:3.12,precision:.58,sigEncaisseParMin:0,defense:0,ameneesPar15:.3,defenseAmenee:0,soumissionsPar15:0,controlePar15:0,dureeMoyenne:0,repartition:{cibles:{head:1,body:0,leg:0},positions:{dist:1,clinch:0,ground:0}},vParMethode:{}});mgmtStatsDocumentes=()=>({docs:3});mgmtStatsCategorie=()=>({n:3,moyennes:{},rangs:new Map()});const html=mgmtFicheStatsHtml(G.mgmt,mgmtFighterById(G.mgmt,MGMT_FICHE.id));[mgmtStatsCarriere,mgmtStatsDocumentes,mgmtStatsCategorie]=old;return JSON.stringify(html.split('width:').slice(1).map(x=>Number(x.split('%')[0])).filter(Number.isFinite))})()`));
  assert.ok(fills.includes(58));assert.ok(fills.includes(52));assert.ok(fills.includes(6));
});
test('Monde lot 31 T4 — rendu de fiche statistiques inférieur à 600 ms',()=>{
 const w=monde();open(w);const ms=w.eval("(()=>{const t=Date.now();render();return Date.now()-t})()");
 console.log('Monde lot 31 T4 — rendu fiche statistiques:',ms,'ms');assert.ok(ms<600);
});
