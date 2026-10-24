"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');
test('Lot 59 T1 — le parcours réel conserve au plus quatre discours et permet de les afficher une seule fois',()=>{
  const w=newGameWindow({runMain:true});
  w.eval(`mgmtRetraitProb=()=>0;setSeed(20261023);CL.mgmtEnter(1);mgmtPasseGenerer('split',{soirees:3});`);
  assert.equal(jouerSoirees(w,1),1);
  const resultat=JSON.parse(w.eval(`JSON.stringify((()=>{const m=G.mgmt,d=m.discours.d.find(x=>x.interpelle)||m.discours.d[0];MGMT_SOIREE_UI.commence=m.lastEvent.cycle;MGMT_SOIREE.index=0;mgmtDiscoursEcran(m,d,()=>{});const html=scr_mgmt_discours();return {count:m.discours.d.length,html,seed:d.interpelle,screen:!!SCREENS.mgmt_discours};})())`));
  assert.ok(resultat.count<=4);
  assert.equal(resultat.screen,true);
  assert.match(resultat.html,/di3-nom/);
  assert.match(resultat.html,/Continuer/);
  assert.ok(resultat.html.includes('S’ADRESSE À')||!resultat.seed,'une interpellation présente est montrée; le lot 50 autorise une cible absente');
});
test('Lot 59 T1 — l’écran échappe chaque texte et l’option sans discours supprime seulement sa présentation',()=>{
  const w=newGameWindow({runMain:true});
  const rendu=w.eval(`(()=>{G.mgmt={org:'ufc',eventsPlayed:1,roster:[{id:'hostile',name:'<img src=x onerror=alert(1)>'}],hist:[]};MGMT_REGLAGES.soiree.sansDiscours=false;mgmtDiscoursEcran(G.mgmt,{a:'hostile',adv:'x',motif:'surprise',ton:'emu',interpelle:'hostile',lignes:['<script>alert(1)</script>']},()=>{});const html=scr_mgmt_discours();MGMT_REGLAGES.soiree.sansDiscours=true;const visible=mgmtDiscoursEcran(G.mgmt,{a:'hostile',lignes:['texte']},()=>{});return {html,visible,css:requireCss()};function requireCss(){return ''}})()`);
  assert.doesNotMatch(rendu.html,/<script>|<img src=x/);
  assert.match(rendu.html,/&lt;script&gt;/);
  assert.match(rendu.html,/S’ADRESSE À/);
  assert.equal(rendu.visible,false);
  const source=fs.readFileSync('ui-cadre.css','utf8');
  const classes=[...rendu.html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('di3-'));
  for(const c of classes) assert.match(source,new RegExp(`\\.${c}(?:[,:{\\s])`),`classe styliée: ${c}`);
  assert.equal(/\.di3-[^{]+\{[^}]*font-size:\s*(1[0-9]|20|21)px/.test(source),false);
});
test('Lot 59 T1 — SOIRÉE expose le réglage de masquage',()=>{
  const source=fs.readFileSync('mgmt-options.js','utf8');
  assert.match(source,/id:'soiree',lib:'SOIRÉE'/);
  assert.match(source,/cle:'sansDiscours'/);
});
