"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');

test('Croissance — cinq paliers sont dérivés sans mutation et répondent à la popularité et au rang',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault(); m.mondeVivant=true; m.orgs={}; m.pop=100; const avant=JSON.stringify(m); const p=mgmtPaliersCalculer(m); return JSON.stringify({n:MGMT_PALIERS.length,pop:p.popularite,rang:p.rang,paliers:p.paliers.map(x=>x.id),avant:JSON.stringify(m)===avant});})()`));
  assert.equal(r.n,5); assert.equal(r.pop,100); assert.ok(r.paliers.length>=1); assert.equal(r.avant,true);
});

test('Croissance — les franchissements sont publiés une seule fois et restent sans effet sur les anciennes parties',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();m.mondeVivant=true;m.orgs={};m.pop=100;m.facts=[];const a=mgmtPaliersAnnoncer(m),b=mgmtPaliersAnnoncer(m);return JSON.stringify({a:a.length,b:b.length,annonces:m.croissanceActus.map(x=>({palier:x.palier,relu:x.relu})),ancienne:mgmtPaliersAnnoncer(Object.assign(mgmtDefault(),{facts:[]})).length});})()`));
  assert.equal(r.a,4); assert.equal(r.b,0); assert.equal(r.ancienne,0);
  assert.deepEqual(r.annonces.map(x=>x.palier),['national','europeen','mondial','sommet']);
  assert.ok(r.annonces.every(x=>x.relu===false));
});

test('Croissance — les classes cr3 de l’écran ont des règles dédiées et aucun petit texte',()=>{
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(()=>{setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_organisation'); const html=document.getElementById('app').innerHTML; const classes=[...html.matchAll(/class="([^"]*cr3-[^"]*)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('cr3-'));return {classes,screen:G.screen};})()`);
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.ok(r.classes.length>0); for(const c of new Set(r.classes)) assert.ok(css.includes('.'+c),c+' doit avoir une règle');
});

test('Croissance — chaque palier documente un effet borné et une annonce distincte',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify(MGMT_PALIERS.map(p=>({id:p.id,annonce:p.annonce,relu:p.relu,salle:p.salle,diffuseur:p.diffuseur,recruteur:p.recruteur,agents:p.agents})))`));
  assert.ok(r.length>=5);
  assert.equal(new Set(r.map(p=>p.annonce)).size,r.length);
  assert.ok(r.every(p=>p.annonce&&p.relu===false));
  for(const effet of ['salle','diffuseur','recruteur','agents']){
    assert.ok(r.every(p=>Number.isFinite(p[effet])&&p[effet]>=0&&p[effet]<=3),effet+' doit rester borné et additif');
    assert.ok(r.some((p,i)=>i&&p[effet]>r[i-1][effet]),effet+' doit ouvrir quelque chose de progressif');
  }
});

test('Croissance — bonus de remplissage additif, plafonné et nul pour une partie ancienne',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();m.mondeVivant=true;m.pop=100;m.orgs={};const salle={capacite:9000};const ancien=mgmtRemplissage(salle,100,'grosse',0.8).spectateurs;const nouveau=mgmtRemplissage(salle,100,'grosse',0.8,m).spectateurs;return JSON.stringify({ancien,nouveau,bonus:mgmtCroissanceRemplissageBonus(m)});})()`));
  assert.equal(r.bonus,0.03); assert.ok(r.nouveau>=r.ancien); assert.ok(r.nouveau<=9000);
});
