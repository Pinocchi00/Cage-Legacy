"use strict";
/* Constat du 23/10/2026 (vérification dans le jeu réel à 1920×1080) : l'étape « Tes trois espoirs » s'affichait en texte brut, le balisage
   (mf-esp-*) ne correspondant à aucune règle de style (ma-*) ; le bouton « Entrer » recouvrait la sixième carte, les noms longs étaient coupés
   et « À RECRUTER · » restait orphelin quand le pays est inconnu. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
/* Décision du 23/10/2026 (brief du 22/10, P9 T1 : le contrat du matchmaker) : une partie neuve porte `m.poste` et son arrivée compte trois étapes ; ce test décrit les étapes d'une partie sans poste (voir mgmtLot43T2.test.js pour le chemin à trois étapes). */
test('Monde lot 38 T3 — chaque classe du balisage des cartes a sa règle de style',()=>{
  const w=newGameWindow({runMain:true});
  const h=w.eval(`setSeed(20261008);CL.mgmtEnter(1);delete G.mgmt.poste;MGMT_ESP_ARRIVEE.etape=2;SCREENS.mgmt_espoirs_arrivee()`);
  const style=(h.match(/<style>[\s\S]*?<\/style>/g)||[]).join('');
  const classes=new Set();
  for(const m of h.replace(/<style>[\s\S]*?<\/style>/g,'').matchAll(/class="([^"]*)"/g))for(const c of m[1].split(/\s+/))if(c.startsWith('ma-'))classes.add(c);
  assert.ok(classes.size>=10,'le balisage porte les classes ma-*');
  for(const c of classes)assert.ok(style.includes('.'+c),`la classe ${c} a une règle de style`);
  assert.doesNotMatch(h,/mf-esp-/);
});
test('Monde lot 38 T3 — le bouton Entrer ne recouvre plus la carte ; pas de pays inconnu après « À RECRUTER »',()=>{
  const w=newGameWindow({runMain:true});
  const h=w.eval(`setSeed(20261008);CL.mgmtEnter(1);delete G.mgmt.poste;MGMT_ESP_ARRIVEE.etape=2;SCREENS.mgmt_espoirs_arrivee()`);
  assert.match(h,/\.ma-enter\{display:none\}/);
  assert.doesNotMatch(h,/À RECRUTER\s*·\s*<\/button>/i);
});
