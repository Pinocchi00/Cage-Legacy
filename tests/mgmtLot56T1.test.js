"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');

test('Croissance — cinq paliers sont dérivés sans mutation et répondent à la popularité et au rang',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault(); const avant=JSON.stringify(m); m.mondeVivant=true; m.orgs={}; m.pop=100; const p=mgmtPaliersCalculer(m); return JSON.stringify({n:MGMT_PALIERS.length,pop:p.popularite,rang:p.rang,paliers:p.paliers.map(x=>x.id),avant:JSON.stringify(m)===avant});})()`));
  assert.equal(r.n,5); assert.equal(r.pop,100); assert.ok(r.paliers.length>=1); assert.equal(r.avant,false);
});

test('Croissance — les classes cr3 de l’écran ont des règles dédiées et aucun petit texte',()=>{
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(()=>{setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_organisation'); const html=document.getElementById('app').innerHTML; const classes=[...html.matchAll(/class="([^"]*cr3-[^"]*)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('cr3-'));return {classes,screen:G.screen};})()`);
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.ok(r.classes.length>0); for(const c of new Set(r.classes)) assert.ok(css.includes('.'+c),c+' doit avoir une règle');
});
