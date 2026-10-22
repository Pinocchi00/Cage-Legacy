"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 34 T1 — les profils portent leurs manques et forces catégoriels',()=>{
  const win=newGameWindow();
  const result=JSON.parse(win.eval(`JSON.stringify(MGMT_ORGANISATIONS.map(o=>({nom:o.nom,manque:o.profil.manque,force:o.profil.force})))`));
  assert.equal(result.length,8);
  assert.ok(result.every(o=>o.manque&&o.force&&o.manque.id&&o.force.id&&Array.isArray(o.manque.categories)&&Array.isArray(o.force.categories)));
  assert.deepEqual(result.map(o=>[o.manque.id,o.force.id]),[['bons-poids-lourds','equilibree'],['espoirs','vedettes'],['potentiel-champion','legers-et-coqs'],['experimentes','jeunes-partout'],['finisseurs','mouches-et-coqs'],['soumissions','meilleures-combattantes'],['a-domicile','noms-achetes'],['bons-mouches','lourds']]);
});

test('Monde lot 34 T1 — poids et niveaux lisent les catégories et gardent les anciens profils',()=>{
  const win=newGameWindow();
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify((()=>{const p={fortes:[],faibles:[],force:{categories:['H-light']},manque:{categories:['H-heavy']}};const old={fortes:[],faibles:[]};return [mgmtOrgPoidsCategorie(p,'H-light'),mgmtOrgDecalageNiveau(p,'H-light'),mgmtOrgPoidsCategorie(p,'H-heavy'),mgmtOrgDecalageNiveau(p,'H-heavy'),mgmtOrgPoidsCategorie(old,'H-light'),mgmtOrgDecalageNiveau(old,'H-light')]})())`)),[1.5,3,0.5,-3,1,0]);
});
