"use strict";
/* ==== [ANCRE: TESTS_MGMT_NOUVELLE_CHARGEMENT] — Monde lot 2 T7 (décision d'Anthony du 12/10/2026) :
   l'écran de création des six ans se lit, avance en douceur, et attend le bouton du joueur. ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');

function lancer(soirees){
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(11); CL.mgmtNouvelle(2); MGMT_NOUVELLE.soirees=${soirees}; MGMT_NOUVELLE.i=0; CL.mgmtNouvelleLancer();`);
  return win;
}
async function attendrePret(win){
  const debut=Date.now();
  while(Date.now()-debut<170000){
    await new Promise(r=>setTimeout(r,100));
    if(win.eval('!!(MGMT_NOUVELLE.gen&&MGMT_NOUVELLE.gen.pret)')) return;
  }
  throw new Error('la création n’a pas fini');
}

test('Chargement — la partie attend le bouton : G.mgmt reste null, Entrée ouvre la partie', async () => {
  const win=lancer(2);
  /* Entrée ne relance rien pendant la génération */
  win.eval(`keysHandle({key:'Enter',code:'Enter',preventDefault(){}})`);
  assert.equal(win.eval('!!MGMT_NOUVELLE.gen'),true);
  await attendrePret(win);
  assert.equal(win.eval('G.mgmt'),null,'rien ne s’ouvre tout seul');
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle');
  const html=win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Prêt. Six ans d’histoire sont écrits.'));
  assert.ok(/Entrer dans /.test(html)&&html.includes('mf-bouton jaune'),'le bouton jaune est là');
  win.eval(`keysHandle({key:'Enter',code:'Enter',preventDefault(){}})`);
  assert.notEqual(win.eval('G.screen'),'mgmt_nouvelle');
  assert.ok(win.eval('!!G.mgmt'),'la partie est ouverte');
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — Échap pendant la génération abandonne proprement', () => {
  const win=lancer(2);
  win.eval(`keysHandle({key:'Escape',code:'Escape',preventDefault(){}})`);
  assert.equal(win.eval('MGMT_NOUVELLE.gen'),null);
  assert.equal(win.eval('G.mgmt'),null);
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle');
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — les cinq lectures s’affichent une à une, → et ← les parcourent, aucun minuteur après la sortie', async () => {
  const win=lancer(2);
  const titre=()=>win.document.querySelector('.mf-lecture-titre').textContent;
  const vus=[titre()];
  assert.equal(win.eval('MGMT_NOUVELLE_LECTURES.length'),5);
  assert.equal(win.document.querySelectorAll('.mf-lecture-pastille').length,5);
  for(let i=0;i<4;i++){ win.eval(`keysHandle({key:'ArrowRight',code:'ArrowRight',preventDefault(){}})`); vus.push(titre()); }
  assert.equal(new Set(vus).size,5,'cinq cartons différents');
  win.eval(`keysHandle({key:'ArrowLeft',code:'ArrowLeft',preventDefault(){}})`);
  assert.equal(titre(),vus[3]);
  win.document.querySelectorAll('.mf-lecture-pastille')[1].click();
  assert.equal(titre(),vus[1],'une pastille est cliquable');
  assert.notEqual(win.eval('MGMT_GEN_TIMERS.lecture'),null,'un seul minuteur vivant');
  await attendrePret(win);
  win.eval('CL.mgmtNouvelleRetour()');
  assert.equal(win.eval('MGMT_NOUVELLE.gen'),null);
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — aucun texte sous 22 px dans l’écran de création', () => {
  const regles=[...css.matchAll(/(\.mf-(?:genese|lecture)[^{]*)\{([^}]*)\}/g)];
  assert.ok(regles.length>10);
  for(const [,sel,corps] of regles){
    const f=corps.match(/font-size:(\d+)px/);
    if(f) assert.ok(+f[1]>=22,sel+' : '+f[1]+' px');
  }
  const win=lancer(2);
  const html=win.document.getElementById('app').innerHTML;
  for(const m of html.matchAll(/font-size:(\d+)px/g)) assert.ok(+m[1]>=22,'style en ligne '+m[1]);
  assert.ok(!css.split(/\r?\n/).filter(l=>/mf-genese|mf-lecture/.test(l)).some(l=>/animation|keyframes/.test(l)),'aucune animation en feuille de style');
  assert.ok(fs.readFileSync(path.join(__dirname,'..','mgmt-nouvelle.js'),'utf8').includes('prefers-reduced-motion'),'la lueur est coupée sous prefers-reduced-motion');
  win.eval('CL.mgmtNouvelleAbandonner()');
});

test('Chargement — la largeur de la barre est monotone et finit à 100 %', () => {
  const win=newGameWindow({runMain:true});
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    let aff=0, cible=0, prev=0, ok=true, pas=0;
    for(let k=0;k<=62;k++){ cible=100*k/62; for(let i=0;i<5;i++){ aff=mgmtNouvelleBarreSuivante(aff,cible); if(aff<prev) ok=false; prev=aff; pas++; } }
    cible=100; for(let i=0;i<200&&aff<100;i++){ aff=mgmtNouvelleBarreSuivante(aff,cible); if(aff<prev) ok=false; prev=aff; }
    return {ok,aff};})())`));
  assert.equal(r.ok,true);
  assert.equal(r.aff,100);
});
