"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT43_T2] — Monde lot 43 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

/* Périmètre de la tranche 43 T2 (reprise du 23/10/2026) : seule l'étape « Ton contrat » de l'arrivée est livrée ; l'onglet « Ton poste » et le bilan sont reportés à la tranche suivante. */

test('Monde lot 43 T2 — partie générée suit les trois étapes et les classes po sont stylées',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);G.mgmt=m;mgmtEspArriveeOuvrir(1);const first=document.getElementById('app').textContent;CL.mgmtEspArriveeEtape(2);const second=document.getElementById('app').textContent;const html=mgmtEspArriveeHtml();const po=[...new Set([...html.matchAll(/class="([^"]*\\bpo-[^\"]*)"/g)].flatMap(x=>x[1].split(/\\s+/).filter(c=>c.startsWith('po-'))))];const styles=[...html.matchAll(/<style>([\\s\\S]*?)<\\/style>/g)].map(x=>x[1]).join(' ');return {screen:G.screen,first,second,po,styles}})()`);
  assert.match(r.first,/TON CONTRAT/);
  assert.match(r.first,/1 TON CONTRAT · 2 CE QUI MANQUE · 3 TES TROIS ESPOIRS/);
  assert.match(r.second,/CE QUI MANQUE/);
  for(const cls of r.po) assert.match(r.styles,new RegExp('\\.'+cls+'(?:[\\s:{.#>\\[]|$)'));
});


test('Monde lot 43 T2 — Ton contrat précède le manque avec les valeurs des objectifs',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);G.mgmt=m;mgmtEspArriveeOuvrir(1);const first=document.getElementById('app').textContent;const html=document.getElementById('app').innerHTML;CL.mgmtEspArriveeEtape(2);return {first,second:document.getElementById('app').textContent,html,objectif:mgmtPosteObjectifTexte(m.poste.obj[0],m),valeur:mgmtPosteValeurTexte(m,m.poste.obj[0])}})()`);
  assert.match(r.first,/TON CONTRAT/);
  assert.match(r.first,/1 TON CONTRAT · 2 CE QUI MANQUE · 3 TES TROIS ESPOIRS/);
  assert.match(r.second,/CE QUI MANQUE/);
  assert.match(r.html,new RegExp(r.objectif));
  assert.match(r.html,new RegExp('Aujourd.hui : '+r.valeur));
});

test('Fidélité arrivée — trois panneaux, leurs données et six cartes avec sélection réellement actionnable',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{
      setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);G.mgmt=m;mgmtEspArriveeOuvrir(1);
      const app=()=>document.getElementById('app'),key=k=>app().dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
      const contrat={panneaux:app().querySelectorAll('.po-panels>.po-card').length,etapes:app().querySelectorAll('.ma-step').length,patron:app().querySelector('.po-caption').textContent,manque:app().querySelector('.po-manque').textContent,source:JSON.stringify(m),seed:SEED};
      mgmtEspArriveeHtml();const pur=contrat.source===JSON.stringify(m)&&contrat.seed===SEED;
      CL.mgmtEspArriveeEtape(3);const rows=mgmtEspArriveePropositions(m),ordre=rows.map(x=>x.angle);
      key('ArrowRight');key('Enter');const garde=mgmtEspoirs(m).includes(rows[1].id),selection=MGMT_ESP_ARRIVEE.i;
      app().querySelectorAll('.ma-card')[4].click();const clic=mgmtEspoirs(m).includes(rows[4].id)&&MGMT_ESP_ARRIVEE.i===4;
      const etats=[...app().querySelectorAll('.ma-card')].map(e=>({selected:e.dataset.selected,kept:e.dataset.kept}));
      let ouvert=null;const fiche=CL.mgmtEspArriveeFiche;CL.mgmtEspArriveeFiche=id=>{ouvert=id;fiche(id);};key('F');
      return {contrat,pur,ordre,garde,selection,clic,etats,ouvert,attendu:rows[4].id,screen:G.screen};
    })())`));
    assert.equal(r.contrat.panneaux,3);assert.equal(r.contrat.etapes,3);assert.match(r.contrat.patron,/Jean-Michel Delatour/);
    assert.match(r.contrat.manque,/LEÏLA/);assert.equal(r.pur,true);
    assert.deepEqual(r.ordre,['reponse','monte','libre','jeune','oublie','revenant']);
    assert.equal(r.garde,true);assert.equal(r.selection,1);assert.equal(r.clic,true);
    assert.equal(r.etats.filter(x=>x.selected==='true').length,1);assert.equal(r.etats.filter(x=>x.kept==='true').length,2);
    assert.equal(r.ouvert,r.attendu);assert.equal(r.screen,'mgmt_fiche');
  }finally{w.close();}
});

test('Monde lot 43 T2 — une ancienne partie saute Ton contrat et échappe les valeurs joueur',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});delete m.poste;m.nom='<img src=x>';G.mgmt=m;mgmtEspArriveeOuvrir(1);const first=document.getElementById('app').textContent;const html=mgmtEspArriveeHtml();return {first,html}})()`);
  assert.doesNotMatch(r.first,/TON CONTRAT/);
  assert.match(r.first,/CE QUI MANQUE/);
  assert.doesNotMatch(r.html,/<img src=x>/);
});

/* Relevé visuel du 23/10/2026 à 1920×1080 : le salaire s'affichait « 3200000 € » (mgmtEuros attend des milliers d'euros), le patron de Split restait « le patron », et les deux cartes se superposaient (règle :nth-of-type qui comptait aussi le fil des étapes). */
test('Monde lot 43 T2 — le salaire se lit 3 200 €, le patron de Split porte son nom, les deux cartes sont côte à côte',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);G.mgmt=m;mgmtEspArriveeOuvrir(1);const t=document.getElementById('app').textContent;const html=document.getElementById('app').innerHTML;return {t,gauche:html.includes('.po-card+.po-card'),non:html.includes('nth-of-type(2){right:0}')};})())`));
  assert.match(r.t,/3\s200\s€\sPAR MOIS/);
  assert.doesNotMatch(r.t,/3200000/);
  assert.match(r.t,/Jean-Michel Delatour/);
  assert.equal(r.gauche,true);
  assert.equal(r.non,false);
});
