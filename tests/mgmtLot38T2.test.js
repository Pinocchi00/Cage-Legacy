"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){return JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`));}
test('Monde lot 38 T2 — écran d’arrivée en deux étapes et six propositions',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);MGMT_ESP_ARRIVEE.etape=1;const a=SCREENS.mgmt_espoirs_arrivee();MGMT_ESP_ARRIVEE.etape=2;const b=SCREENS.mgmt_espoirs_arrivee();return {a,b,n:mgmtEspoirsProposer(G.mgmt).length};`);
  assert.match(r.a,/CE QUI MANQUE À SPLIT/i);assert.match(r.a,/objectif/i);assert.equal(r.n,6);assert.match(r.b,/TES TROIS ESPOIRS/);
});
test('Monde lot 38 T2 — texte joueur échappé dans les cartes',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt;mgmtEspoirsFixer(m);for(const f of mgmtEspoirsCandidats(m))f.name='<img onerror=alert(1)>';MGMT_ESP_ARRIVEE.etape=2;return SCREENS.mgmt_espoirs_arrivee();`);
  assert.doesNotMatch(r,/<img onerror=/);assert.match(r,/&lt;img/);
});
test('Monde lot 38 T2 — les gestes de garder et rendre respectent le plafond',()=>{
  const w=newGameWindow();
  const r=result(w,`CL.mgmtEnter(1);const m=G.mgmt,ids=mgmtEspoirsFixer(m).map(x=>x.id);ids.slice(0,3).forEach(id=>mgmtEspoirGarder(m,id));const refus=mgmtEspoirGarder(m,ids[3]);mgmtEspoirRendre(m,ids[0]);return {n:mgmtEspoirs(m).length,refus,html:SCREENS.mgmt_espoirs_arrivee()};`);
  assert.equal(r.n,2);assert.equal(r.refus,false);assert.match(r.html,/6/);
});
test('Monde lot 38 T2 — les liens d’Organisation et d’Accueil ouvrent les espoirs calculés',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt;const rows=mgmtEspoirsFixer(m);mgmtEspoirGarder(m,rows[0].id);const accueil=SCREENS.mgmt_accueil(),org=SCREENS.mgmt_organisation();return {accueil,org,aucun:(()=>{const sauvegarde=m.espoirs;m.espoirs=[];const html=SCREENS.mgmt_accueil();m.espoirs=sauvegarde;return html.includes('TES ESPOIRS');})()};`);
  assert.match(r.accueil,/TES ESPOIRS/);assert.match(r.accueil,/N°|des /);assert.match(r.accueil,/mgmtEspArriveeOuvrir\(2,'mgmt_accueil'\)/);
  assert.match(r.org,/mgmtEspArriveeOuvrir\(1,'mgmt_organisation'\)/);assert.equal(r.aucun,false);
});
test('Monde lot 38 T2 — le rendu des cartes reste sous 200 ms',()=>{
  const w=newGameWindow();
  const ms=result(w,`setSeed(9);CL.mgmtEnter(1);mgmtEspoirsFixer(G.mgmt);MGMT_ESP_ARRIVEE.etape=2;const start=performance.now();SCREENS.mgmt_espoirs_arrivee();return performance.now()-start;`);
  assert.ok(ms<200,`rendu en ${ms} ms`);
});
test('Monde lot 38 T2 — fiches espoirs : bilan extérieur, catégorie, chiffres et phrases',()=>{
  const w=newGameWindow();
  const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt,rows=mgmtEspoirsFixer(m);return rows.map(x=>x.fiche);`);
  assert.equal(r.length,6);
  for(const f of r){assert.doesNotMatch(f.bilan,/undefined|NaN|—/);assert.match(f.description,/Poids|Léger|Mouche|Welter|Moyen|Plume/i);assert.ok(f.chiffres.length>=2);for(const c of f.chiffres){assert.ok(c.libelle);assert.ok(c.valeur);assert.doesNotMatch(c.valeur,/undefined|NaN|—/);}}
  assert.ok(r.every(f=>!/^Série de 1 victoires/.test(f.phrase)));
});
test('Monde lot 38 T2 — six cartes bornées dans la scène',()=>{
  const w=newGameWindow();const r=result(w,`setSeed(9);CL.mgmtEnter(1);mgmtEspoirsFixer(G.mgmt);MGMT_ESP_ARRIVEE.etape=2;return SCREENS.mgmt_espoirs_arrivee();`);
  assert.equal((r.match(/class="ma-card"/g)||[]).length,6);
  assert.match(r,/grid-template-rows:repeat\(2,337px\)/);assert.match(r,/\.ma-card\{height:337px/);
});
test('Monde lot 38 T2 — étape 1 reprend la géométrie mesurée de la planche',()=>{
  const w=newGameWindow();const r=result(w,`CL.mgmtEnter(1);MGMT_ESP_ARRIVEE.etape=1;return SCREENS.mgmt_espoirs_arrivee();`);
  assert.match(r,/\.ma-title\{font:800 72px\/\.85/);
  assert.match(r,/\.ma-line\{padding:14px 0/);
  assert.match(r,/\.ma-leila\{position:absolute;left:-810px;top:100px/);
  assert.match(r,/\.ma-leila:before\{content:"LEÏLA"/);
});
