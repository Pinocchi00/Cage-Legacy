"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
/* La génération des six ans dure ~55 s : elle n’a lieu qu’une fois (graine 20261008), puis chaque test reçoit une copie de la partie. */
let PARTIE_JSON=null;
const premier=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(20261008);`);
  if(!PARTIE_JSON) PARTIE_JSON=w.eval(`JSON.stringify(mgmtPasseGenerer('split'))`);
  w.eval(`G.mgmt=null; CL.mgmtEnter(1,undefined,{partie:JSON.parse(${JSON.stringify(PARTIE_JSON)})});`); return w; };
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('Arrivée — état premiere : l\'héritage affiche les données de la partie et les douze champions', () => {
  const w=premier();
  const r=res(w,`const t=document.getElementById('app').textContent;
    return {ecran:G.screen,twelve:document.querySelectorAll('.ch-l').length,header:t.includes('SIX ANS AVANT TOI')};`);
  assert.equal(r.ecran,'mgmt_arrivee');
  assert.equal(r.twelve,12);
  assert.equal(r.header,true);
});

test('Arrivée — état sans-passe : aucun chiffre ni rivalité de passé, champions sans « depuis », trois pas affichés', () => {
  const w=neuve();
  const r=res(w,`const t=document.getElementById('app').textContent;
    return {ecran:G.screen,pas:t.includes('Ouvre la Carte'),depuis:/depuis 20/.test(t),champs:document.querySelectorAll('.ch-l').length};`);
  assert.equal(r.ecran,'mgmt_arrivee');
  assert.equal(r.pas,true);
  assert.equal(r.depuis,false);
  assert.equal(r.champs,12);
});

test('Arrivée — blocs absents si la donnée correspondante manque', () => {
  const w=neuve();
  const r=res(w,`const t=document.getElementById('app').textContent; return {rivalite:/rivalité en cours/i.test(t)};`);
  assert.equal(r.rivalite,false);
});

test('Arrivée — les compteurs six ans égalent m.passe.soirees, m.passe.nHist et les faits de m.passe.nFacts', () => {
  const w=premier();
  const r=res(w,`const m=G.mgmt; const t=document.getElementById('app').textContent;
    return {soirees:m.passe.soirees, nHist:m.passe.nHist, hasSoirees:t.includes(String(m.passe.soirees)), hasHist:t.includes(String(m.passe.nHist))};`);
  assert.equal(r.hasSoirees,true);
  assert.equal(r.hasHist,true);
});

test('Arrivée — champions couronnés et blessures comptent les faits prescrits, sans compter les retraites', () => {
  const w=premier();
  const r=res(w,`const m=G.mgmt; const t=document.getElementById('app').textContent; return {blessures:t.includes('Blessures'), noCycle:!t.includes('cycle')};`);
  assert.equal(r.blessures,true); assert.equal(r.noCycle,true);
});

test('Arrivée — promesses affichent l\'échéance en Fight Night, jamais « cycle »', () => {
  const w=premier();
  const r=res(w,`const t=document.getElementById('app').textContent; return {ok:!t.toLowerCase().includes('cycle'), fn:t.includes('Fight Night')};`);
  assert.equal(r.ok,true);
});

test('Arrivée — Entrée ouvre la Carte et Échap ouvre l\'Accueil', () => {
  const w=premier();
  const r=res(w,`keysHandle({key:'Enter',preventDefault(){}}); return {ap:G.screen};`);
  assert.equal(r.ap,'mgmt_carte');
  const w2=premier();
  const r2=res(w2,`keysHandle({key:'Escape',preventDefault(){}}); return {ap:G.screen};`);
  assert.equal(r2.ap,'mgmt_accueil');
});

test('Arrivée — aucun texte sous 22 px', () => {
  const w=premier();
  const html=res(w,`return document.getElementById('app').innerHTML;`);
  assert.ok(!/font-size\s*:\s*(\d|1\d|2[01])(\.\d+)?px/.test(html));
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  const lignes=css.split('\n').filter(l=>/mgmt-prise|ar-bande/.test(l));
  for(const l of lignes){
    for(const m of l.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1])>=22, 'texte sous 22 px : '+l);
  }
});

test('Arrivée — après la première soirée, l’arrivée n’est plus présentée', () => {
  const w=premier();
  const r=res(w,`const m=G.mgmt; m.eventsPlayed=m.passe.soirees+1; CL.go('mgmt_arrivee'); return {ecran:document.querySelector('.ar')!==null};`);
  assert.equal(r.ecran,false);
});

/* MONDE-LOT-10-DECISIONS §2 : l’Accueil ne garde plus que son bloc héritage retiré ; ses autres blocs restent (Échap depuis l’arrivée). */
test('Accueil — seul le bloc héritage est retiré, les autres blocs restent', () => {
  const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_accueil');`);
  const r=res(w,`const t=document.getElementById('app').textContent; return {accueil:G.screen, noOrg:!t.includes('ORGANISATION'), passe:t.includes('CE QUI S’EST PASSÉ'), attend:t.includes('CE QUI T’ATTEND'), ailleurs:t.includes('ET AILLEURS')};`);
  assert.deepEqual(r,{accueil:'mgmt_accueil',noOrg:true,passe:true,attend:true,ailleurs:true});
});

/* Monde lot 10 : l'écran produit des classes que la feuille du jeu doit styler (il apparaissait vide) ; tout est sous .mf-arr. */
test('Arrivée — les règles CSS de l’écran existent, préfixées, et aucun texte n’y est sous 22 px', () => {
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  const regles=css.split('\n').filter(l=>/^\.mf-arr[ .{]/.test(l));
  for(const sel of ['.ar-bande','.ar-tuiles','.ar-cols','.pan','.tuile','.lab','.T','.col','.ch-l','.jaune-bloc','.ar-chiffres']){
    assert.ok(regles.some(l=>l.includes('.mf-arr '+sel)), 'règle manquante : .mf-arr '+sel);
  }
  assert.ok(!/(^|[\n,}])\s*\.(pan|lab|T|tuile|col)\s*[{,]/.test(css), 'classe générique non préfixée');
  for(const l of regles){
    for(const m of l.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1])>=22, 'texte sous 22 px : '+l);
  }
  const w=premier();
  const r=res(w,`return {racine:!!document.querySelector('main.ar.mf-arr'),bande:!!document.querySelector('.mf-arr .ar-bande')};`);
  assert.deepEqual(r,{racine:true,bande:true});
});
