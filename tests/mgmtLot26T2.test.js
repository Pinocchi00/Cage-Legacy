"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT26_T2] — Monde lot 26 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 26 T2 — vestiaire trié par catégorie puis rang',()=>{
  const w=newGameWindow();
  const resultat=JSON.parse(w.eval(`(function(){setSeed(20261008);const m=mgmtDefault('split');mgmtNewRoster(m);G={theme:'dark',mgmt:m};MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0};const l=mgmtVestiaireLignes(m).filter(x=>!x.signe);const ds=allDivisions().map(d=>d.id);return JSON.stringify(l.map(x=>ds.indexOf(x.f.div)))})()`));
  assert.ok(resultat.every((d,i)=>i===0||resultat[i-1]<=d),'les catégories doivent être monotones');
});

test('Monde lot 26 T2 — les contrats expliquent l’échelle des barres',()=>{
  const w=newGameWindow({runMain:true});
  const html=w.eval(`(function(){setSeed(20261008);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtExteriorEnsure(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};mgmtAgendaInit(m);MGMT_CONTRATS.mode='contrats';return scr_mgmt_contrats()})()`);
  assert.match(html,/1 barre = 1 combat au contrat/);
});
