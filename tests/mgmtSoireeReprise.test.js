"use strict";
/* Lot 1 du brief démo (09/10/2026) : quitter pendant une soirée ne casse plus la partie. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
/* Compose une carte pleine, la fait valider, et simule la soirée sans faire avancer la semaine. */
const JOUER=`function jouer(){ const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  for(const f of m.roster){ delete f.susp; f.lastCycle=-9; if(f.libre){ delete f.libre; f.ct={n:6,f:0,b:mgmtBourseSouhaitee(m,f,false),since:m.cycle}; } else if(f.ct&&f.ct.n-f.ct.f<=1) f.ct.n+=5; }
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
  const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let k=0;
  while(m.card.main.length<m.card.sizeMain&&k++<80){ const d=divs[k%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
  const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
  const ev=mgmtAgendaJouer(m); if(!ev) throw new Error('la soirée ne se joue pas'); return ev; }`;
const RECHARGER=`G.mgmt=null; MGMT_SOIREE=mgmtSoireeNeuve(0); CL.mgmtEnter(1);`;
const FINIR=`MGMT_SOIREE.index=G.mgmt.lastEvent.fights.length; CL.mgmtSoFin(); if(G.screen==='mgmt_lendemain') CL.mgmtLendemainNext();`;

test('Soirée interrompue au troisième combat : recharger la partie ramène sur la soirée, au troisième combat', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const cycle=G.mgmt.cycle; MGMT_SOIREE.index=3; ${RECHARGER}
    return {ecran:G.screen,index:MGMT_SOIREE.index,cycle:G.mgmt.cycle===cycle};`);
  assert.deepEqual(r,{ecran:'mgmt_soiree',index:3,cycle:true});
});

test('Soirée reprise puis terminée : la semaine avance d’un cran, une seule fois', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const c0=G.mgmt.cycle; MGMT_SOIREE.index=3; ${RECHARGER}
    ${FINIR}
    return {c0,c1:G.mgmt.cycle,enCours:mgmtSoireeEnCours(G.mgmt)};`);
  assert.equal(r.c1,r.c0+1); assert.equal(r.enCours,false);
});

test('Rien n’est à reprendre une fois la semaine avancée, ni sur une partie neuve', () => {
  const w=neuve();
  const r=res(w,`const avant=mgmtSoireeEnCours(G.mgmt); ${JOUER} jouer(); const pendant=mgmtSoireeEnCours(G.mgmt); mgmtNewPile(G.mgmt); return {avant,pendant,apres:mgmtSoireeEnCours(G.mgmt)};`);
  assert.deepEqual(r,{avant:false,pendant:true,apres:false});
});

test('Deux soirées enchaînées avec un rechargement au milieu de chacune : la seconde se montre, chaque combat a sa trace', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); MGMT_SOIREE.index=2; ${RECHARGER}
    ${FINIR}
    jouer(); MGMT_SOIREE.index=4; ${RECHARGER}
    const e=G.mgmt.lastEvent, traces=e.fights.map((_,i)=>!!mgmtSoireeTrace(G.mgmt,i));
    return {ecran:G.screen,index:MGMT_SOIREE.index,toutes:traces.every(Boolean),n:traces.length};`);
  assert.equal(r.ecran,'mgmt_soiree'); assert.equal(r.index,4); assert.equal(r.toutes,true);
});

test('Partie déjà touchée (deux soirées sous le même numéro de semaine) : la seconde se montre et se referme', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const c=G.mgmt.cycle;
    /* La seconde soirée se joue sans que la semaine ait avancé : le défaut d'avant le lot. */
    const ev=jouer(); const m=G.mgmt;
    const doubles=m.hist.filter(t=>t.c===c).length>ev.fights.length;
    const toutes=ev.fights.every((_,i)=>!!mgmtSoireeTrace(m,i));
    saveMgmt(); ${RECHARGER}
    ${FINIR}
    return {doubles,toutes,avance:G.mgmt.cycle===c+1};`);
  assert.equal(r.doubles,true); assert.equal(r.toutes,true); assert.equal(r.avance,true);
});

test('Écran de repli : « Continuer » referme la soirée et change d’écran, quel que soit le combat où l’on en était', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const c=G.mgmt.cycle; G.mgmt.hist.length=0; CL.go('mgmt_soiree');
    const avant=document.getElementById('app').textContent.includes('ne peut pas être montrée');
    CL.mgmtSoireeSortir(); if(G.screen==='mgmt_lendemain') CL.mgmtLendemainNext();
    return {avant,ecran:G.screen,avance:G.mgmt.cycle===c+1};`);
  assert.equal(r.avant,true); assert.notEqual(r.ecran,'mgmt_soiree'); assert.equal(r.avance,true);
});

test('« Menu principal » reste actif pendant la soirée', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); MGMT_SOIREE.index=2; CL.go('mgmt_soiree');
    const b=document.querySelector('.mf-barre-item[data-section="menu"]'); return {actif:!!b&&!b.disabled};`);
  assert.equal(r.actif,true);
});

test('Le joueur automatique, avec une variante qui recharge la partie au milieu de chaque soirée, enchaîne trois soirées', () => {
  const w=neuve();
  const jouerSoirees=require('./helpers/jouerSoirees');
  assert.equal(jouerSoirees(w,3,{recharge:true}),3);
});
