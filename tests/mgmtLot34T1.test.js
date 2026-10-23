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

/* ==== [ANCRE: MONDE34T1_EFFECTIFS] — Monde lot 34 T1 ==== */
test('Monde lot 34 T1 — Split : les poids lourds sont dégarnis au premier jour',()=>{
  const win=newGameWindow();
  const stats=JSON.parse(win.eval(`JSON.stringify((()=>{const out={};for(let s=1;s<=3;s++){setSeed(s);const m=mgmtDefault('split');mgmtNewRoster(m);for(const d of allDivisions())(out[d.id]??=[]).push(m.roster.filter(x=>x.div===d.id).length)}return out})())`));
  const heavy=stats['H-heavy'].reduce((a,b)=>a+b,0)/3;
  const others=Object.entries(stats).filter(([id])=>id.startsWith('H-')&&id!=='H-heavy').flatMap(([,v])=>v);
  assert.ok(heavy<(others.reduce((a,b)=>a+b,0)/others.length)/2,`poids lourds ${heavy}, moyenne autres catégories hommes ${others.reduce((a,b)=>a+b,0)/others.length}`);
});

test('Monde lot 34 T1 — Undisputed Cage : poids mouche dégarnis et lourds fournis',()=>{
  const win=newGameWindow();
  const stats=JSON.parse(win.eval(`JSON.stringify((()=>{const out={};for(let s=1;s<=3;s++){setSeed(s);const m=mgmtDefault('organisation-8');mgmtNewRoster(m);for(const id of ['H-fly','H-heavy','H-lheavy'])(out[id]??=[]).push(m.roster.filter(x=>x.div===id).length)}return out})())`));
  const mean=id=>stats[id].reduce((a,b)=>a+b,0)/3;
  assert.ok(mean('H-fly')<15,`H-fly moyen ${mean('H-fly')}`);
  assert.ok(mean('H-heavy')>mean('H-fly')*2&&mean('H-lheavy')>mean('H-fly')*2,`H-heavy ${mean('H-heavy')}, H-lheavy ${mean('H-lheavy')}, H-fly ${mean('H-fly')}`);
});

test('Monde lot 34 T1 — Garden of Blood : catégories non concernées inchangées',()=>{
  const win=newGameWindow();
  const stats=JSON.parse(win.eval(`JSON.stringify((()=>{const out={};for(let s=1;s<=3;s++){setSeed(s);const m=mgmtDefault('garden-of-blood');mgmtNewRoster(m);for(const d of allDivisions())(out[d.id]??=[]).push(m.roster.filter(x=>x.div===d.id).length)}return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.reduce((a,b)=>a+b,0)/3]))})())`));
  const reference={'H-fly':29.6666666667,'H-bantam':30,'H-feather':31,'H-light':29.3333333333,'H-welter':29.6666666667,'H-middle':30.3333333333,'H-lheavy':29.6666666667,'H-heavy':28.6666666667,'F-straw':31,'F-fly':29.3333333333,'F-bantam':29.6666666667,'F-feather':30};
  for(const [id,value] of Object.entries(reference)) assert.ok(Math.abs(stats[id]-value)<1e-9,`${id}: ${stats[id]} au lieu de ${value}`);
});
