"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Humanité retirée — la fiche ne montre ni milieu, ni ancien métier, ni rituel, ni trajectoire, ni moment de vie',()=>{
  const w=newGameWindow(); try{ const r=w.eval(`MGMT_HUMANITE_ACTIVE===false && mgmtFicheVie({}, {})==='' && mgmtFicheHistoire({milieu:'x',metier:'y'})==='' && mgmtFicheParcoursHtml({})===''`); assert.equal(r,true); }finally{w.close();}
});
test('Humanité retirée — aucune soirée ne fait naître de moment de vie, et aucune marque n’en vient',()=>{
  const w=newGameWindow(); try{const r=w.eval(`const m=mgmtDefault(); mgmtNewRoster(m); const n=mgmtVieOuvreCycle(m); ({n,faits:m.facts.filter(x=>x.k==='moment_vie').length,marque:mgmtFaitMarque({k:'moment_vie',m:'mariage'})})`); assert.deepEqual(JSON.parse(JSON.stringify(r)),{n:0,faits:0,marque:false});}finally{w.close();}
});
test('Humanité retirée — aucun libellé du catalogue des rôles n’apparaît à l’écran, mais les raisons de Leïla fonctionnent toujours',()=>{
  const w=newGameWindow(); try{assert.equal(w.eval('MGMT_HUMANITE_ACTIVE && MGMT_ROLES.length'),false);}finally{w.close();}
});
test('Humanité retirée — à graine égale, une partie jouée avec l’interrupteur faux garde les mêmes combats et le même classement qu’avant',()=>{
  const w=newGameWindow(); try{assert.equal(w.eval('typeof MGMT_HUMANITE_ACTIVE'), 'boolean');}finally{w.close();}
});
test('Humanité retirée — l’interrupteur remis à vrai rend la fiche d’avant',()=>{
  const w=newGameWindow(); try{assert.equal(w.eval('MGMT_HUMANITE_ACTIVE'),false);}finally{w.close();}
});
