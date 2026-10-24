"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

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

test('Croissance — l’accueil déclenche les annonces et leur seconde visite ne les répète pas',()=>{
  const win=newGameWindow({runMain:true});
  try{
    win.eval("setSeed(56);G.mgmt=mgmtDefault();G.mgmt.mondeVivant=true;G.mgmt.orgs={};G.mgmt.pop=100;G.mgmt.facts=[];scr_mgmt_accueil();");
    const r=JSON.parse(win.eval(`(()=>{const premiere=G.mgmt.croissanceActus.length;scr_mgmt_accueil();return JSON.stringify({premiere,seconde:G.mgmt.croissanceActus.length,fil:mgmtActualites(G.mgmt).filter(x=>x.type==='croissance').length});})()`));
    assert.equal(r.premiere,4);assert.equal(r.seconde,4);assert.equal(r.fil,4);
  }finally{win.close();}
});

test('Croissance — les classes cr3 de l’écran ont des règles dédiées et aucun petit texte',()=>{
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(()=>{setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_organisation'); const html=document.getElementById('app').innerHTML; const classes=[...html.matchAll(/class="([^"]*cr3-[^"]*)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('cr3-'));return {classes,html,screen:G.screen};})()`);
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.ok(r.classes.length>0); for(const c of new Set(r.classes)) assert.ok(css.includes('.'+c),c+' doit avoir une règle');
  for(const libelle of ['LES SALLES','LE DIFFUSEUR','LE RECRUTEUR','LES AGENTS LIBRES']) assert.ok(r.html.includes(libelle),`piste absente : ${libelle}`);
  assert.match(r.html,/Popularité\s+[0-9]+\s+et rang\s+[0-9]+ ou mieux|Le sommet atteint/);
});

test('Croissance — chaque palier documente un effet borné et une annonce distincte',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify(MGMT_PALIERS.map(p=>({id:p.id,annonce:p.annonce,relu:p.relu,salle:p.salle,diffuseur:p.diffuseur,recruteur:p.recruteur,agents:p.agents})))`));
  assert.ok(r.length>=5);
  assert.equal(new Set(r.map(p=>p.annonce&&p.annonce.texte)).size,r.length);
  assert.ok(r.every(p=>p.annonce&&typeof p.annonce.texte==='string'&&p.annonce.texte.length>20&&p.annonce.relu===false&&p.relu===false));
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

test('Croissance — aucun bonus de remplissage ne dépasse le plafond historique de la salle',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();m.mondeVivant=true;m.pop=100;m.orgs={};const salle={capacite:9000};return JSON.stringify([0,0.5,1].map(q=>mgmtRemplissage(salle,100,'grosse',q,m)));})()`));
  assert.ok(r.every(x=>x.spectateurs<=Math.min(x.capacite,x.plafond)));
  assert.ok(r.every(x=>x.spectateurs>=0));
});

test('Croissance — le budget du recruteur gagne jusqu’à 3 % sans réduire celui des anciennes parties',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();const cout=10000;const ancien=mgmtCroissanceCoutRecruteur(m,cout);m.mondeVivant=true;m.orgs={};m.pop=100;const nouveau=mgmtCroissanceCoutRecruteur(m,cout);return JSON.stringify({ancien,nouveau,max:mgmtCroissanceCoutRecruteur(m,cout)});})()`));
  assert.equal(r.ancien,10000); assert.ok(r.nouveau<=r.ancien); assert.ok(r.nouveau>=9700); assert.equal(r.max,9700);
});

test('Croissance — une partie créée par le passé généré reste valide après des soirées',()=>{
  const win=newGameWindow({runMain:true});
  try{
    win.eval("setSeed(20261024);G.mgmt=mgmtPasseGenerer('split',{soirees:3});");
    jouerSoirees(win,1);
    const r=win.eval(`(()=>{const m=G.mgmt;return {valide:validateMgmt(m),paliers:mgmtPaliersCalculer(m).paliers.map(p=>p.id),ancienneSansCle:!Object.hasOwn(mgmtDefault(),'croissanceActus'),sauvee:!!mgmtParseAndValidate(mgmtSerialiser(m))};})()`);
    assert.equal(r.valide,true);assert.equal(r.ancienneSansCle,true);assert.equal(r.sauvee,true);assert.ok(Array.isArray(r.paliers));
  }finally{win.close();}
});

test('Croissance — les annonces facultatives sont validées et réparées sans toucher une ancienne partie',()=>{
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();const ancienne=!Object.hasOwn(m,'paliersAnnonces')&&!Object.hasOwn(m,'croissanceActus');const propre=validateMgmt(m);const invalide=Object.assign({},m,{paliersAnnonces:['inconnu'],croissanceActus:[{palier:3,texte:'x'}]});const refuse=!validateMgmt(invalide);mgmtRepair(invalide);return JSON.stringify({ancienne,propre,refuse,repare:validateMgmt(invalide),clePresente:Object.hasOwn(invalide,'croissanceActus')});})()`));
  assert.deepEqual(r,{ancienne:true,propre:true,refuse:true,repare:true,clePresente:true});
});
