"use strict";
/* Constat du 23/10/2026 (vérification dans le jeu réel de la PR 218) : une partie créée par l'écran « Nouvelle partie » porte toujours
   un objet m.passe (les six ans écrits) ; la garde de mgmtArriveeFin le prenait pour « passé en cours » et ne montrait jamais
   « ce qui manque » ni les trois espoirs. Les tests de la PR 218 créaient des parties sans passé et ne le voyaient pas. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const result=(win,code)=>JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`));
test('Monde lot 38 T3 — une partie au passé écrit passe par ce qui manque et les espoirs avant la carte',()=>{
  const w=newGameWindow({runMain:true});
  const r=result(w,`setSeed(20261008);mgmtPasseGenerer('split',{soirees:3});const m=G.mgmt;const avecPasse=!!m.passe&&m.passe.enCours!==true;
    CL.mgmtArriveeFin();const ecran=G.screen,etape=MGMT_ESP_ARRIVEE.etape,propose=Array.isArray(G.mgmt.espoirsPropose)?G.mgmt.espoirsPropose.length:0;return {avecPasse,ecran,etape,propose};`);
  assert.equal(r.avecPasse,true,'la partie générée porte bien un passé terminé');
  assert.equal(r.ecran,'mgmt_espoirs_arrivee');
  assert.equal(r.etape,1);
  assert.equal(r.propose,6);
});
test('Monde lot 38 T3 — un passé encore en cours ne déclenche pas l\'écran des espoirs',()=>{
  const w=newGameWindow({runMain:true});
  const r=result(w,`setSeed(20261008);const m=mgmtPassePreparer('split',{soirees:2});const enCours=m.passe.enCours===true;
    CL.mgmtArriveeFin();return {enCours,ecran:G.screen,espoirs:G.mgmt?G.mgmt.espoirsPropose:'aucune partie'};`);
  assert.equal(r.enCours,true);
  assert.notEqual(r.ecran,'mgmt_espoirs_arrivee');
  assert.ok(!Array.isArray(r.espoirs),'rien n\'est fixé tant que le passé se joue');
});
