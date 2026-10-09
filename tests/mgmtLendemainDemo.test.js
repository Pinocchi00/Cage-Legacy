"use strict";
/* Lot 6 du brief démo (09/10/2026) : le retour après la soirée. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const JOUER=`function jouer(){ const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  for(const f of m.roster){ delete f.susp; f.lastCycle=-9; if(f.libre){ delete f.libre; f.ct={n:6,f:0,b:mgmtBourseSouhaitee(m,f,false),since:m.cycle}; } else if(f.ct&&f.ct.n-f.ct.f<=1) f.ct.n+=5; }
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
  const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let k=0;
  while(m.card.main.length<m.card.sizeMain&&k++<80){ const d=divs[k%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
  const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
  const ev=mgmtAgendaJouer(m); if(!ev) throw new Error('la soirée ne se joue pas'); return ev; }`;

test('Le lendemain passe après chaque soirée, même sans blessé ni suspendu', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const m=G.mgmt; m.lastEvent.touched=[]; MGMT_SOIREE.index=m.lastEvent.fights.length; CL.mgmtSoFin();
    return {ecran:G.screen,cycle:m.cycle};`);
  assert.equal(r.ecran,'mgmt_lendemain');
});

test('Le lendemain affiche la salle, l’argent et la popularité de m.lastEvent.finance, au spectateur et à l’euro près', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const m=G.mgmt, f=m.lastEvent.finance; CL.go('mgmt_lendemain');
    const t=document.getElementById('app').textContent.replace(/\\s+/g,' ');
    return {spect:t.includes(String(f.spectateurs).replace(/\\B(?=(\\d{3})+(?!\\d))/g,' ')),cap:t.includes('sur '+f.capacite),rec:t.includes(mgmtEuros(Math.abs(f.recette)).replace(/\\s+/g,' ')),pop:t.includes(f.popAvant+' → '+f.popApres),note:t.includes(f.satisfaction+' SUR 100')};`);
  assert.deepEqual(r,{spect:true,cap:true,rec:true,pop:true,note:true});
});

test('Les trois raisons de la satisfaction sont gardées avec la soirée, validées, et rechargées', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const k=G.mgmt.lastEvent.finance.criteres; saveMgmt(); G.mgmt=null; loadMgmt();
    return {k,apres:G.mgmt.lastEvent.finance.criteres,valide:validateMgmt(G.mgmt)};`);
  assert.ok(r.k&&r.k.reclame>=0&&r.k.reclame<=1&&r.k.serres>=0&&r.k.noms>=0&&Number.isSafeInteger(r.k.reclames));
  assert.deepEqual(r.apres,r.k); assert.equal(r.valide,true);
});

test('Une carte sans combat réclamé, puis une carte avec un combat réclamé joué : la phrase sur les combats réclamés change', () => {
  const w=neuve();
  const r=res(w,`const sans=mgmtLendemainCriteres({criteres:{reclame:0.5,serres:0.8,noms:0.8,reclames:0}})[0].texte, avec=mgmtLendemainCriteres({criteres:{reclame:1,serres:0.8,noms:0.8,reclames:2}})[0].texte, rate=mgmtLendemainCriteres({criteres:{reclame:0,serres:0.8,noms:0.8,reclames:2}})[0].texte;
    return {sans,avec,rate};`);
  assert.notEqual(r.sans,r.avec); assert.notEqual(r.avec,r.rate); assert.notEqual(r.sans,r.rate);
});

test('Après une carte ratée, l’écran dit la détermination et jamais l’échec ; une carte réussie ne la dit pas', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const m=G.mgmt, f=m.lastEvent.finance;
    f.satisfaction=20; f.criteres={reclame:0,serres:0.1,noms:0.1,reclames:1}; CL.go('mgmt_lendemain'); const rate=document.getElementById('app').textContent;
    f.satisfaction=90; f.criteres={reclame:1,serres:1,noms:1,reclames:1}; CL.go('mgmt_lendemain'); const reussi=document.getElementById('app').textContent;
    return {det:rate.includes(MGMT_LD_CRITERES.determination.texte),echec:/échec/i.test(rate),detReussi:reussi.includes(MGMT_LD_CRITERES.determination.texte)};`);
  assert.deepEqual(r,{det:true,echec:false,detReussi:false});
});

test('Aucun montant en euros dans le panneau central du booking', () => {
  const w=neuve();
  const r=res(w,`CL.go('mgmt_carte'); const c=document.querySelector('.mf-car-cmp'); return {existe:!!c,euro:!!c&&c.textContent.includes('€')};`);
  assert.equal(r.existe,true); assert.equal(r.euro,false);
});

test('Les phrases du lendemain sont marquées non relues', () => {
  const w=neuve();
  const r=res(w,`const tous=[MGMT_LD_CRITERES.reclame.ok,MGMT_LD_CRITERES.reclame.non,MGMT_LD_CRITERES.reclame.neutre,MGMT_LD_CRITERES.serres.ok,MGMT_LD_CRITERES.serres.non,MGMT_LD_CRITERES.noms.ok,MGMT_LD_CRITERES.noms.non,MGMT_LD_CRITERES.determination]; return tous.every(x=>x.relu===false);`);
  assert.equal(r,true);
});
