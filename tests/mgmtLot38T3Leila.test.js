"use strict";
/* Constat du 23/10/2026 (vérification dans le jeu réel à 1920×1080) : la ligne de Leïla de « Ce qui manque » était positionnée en absolu
   à left:-810px et disparaissait derrière l'autre panneau. La planche la place dans le panneau « Ce qui manque », sous les chiffres,
   en italique entre guillemets (UniArriveeContrat.dc.html). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('Monde lot 38 T3 — la ligne de Leïla est dans le panneau Ce qui manque, avec ses guillemets, sans position absolue',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);CL.mgmtEnter(1);MGMT_ESP_ARRIVEE.etape=1;const h=SCREENS.mgmt_espoirs_arrivee();
    return {h,iLeila:h.indexOf('class="ma-leila-nom"'),iSide:h.indexOf('mf-panneau normal ma-side'),iPanel:h.indexOf('mf-panneau choisi ma-panel')};})())`));
  assert.ok(r.iLeila>r.iPanel&&r.iLeila<r.iSide,'LEÏLA entre le début du panneau Ce qui manque et le panneau de l\'objectif');
  assert.match(r.h,/LEÏLA<\/div><div>« [^<]+ »<\/div>/);
  assert.doesNotMatch(r.h,/\.ma-leila\{[^}]*position:absolute/);
});
