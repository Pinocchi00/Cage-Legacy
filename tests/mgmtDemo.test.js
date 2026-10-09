"use strict";
/* Lot 10 du brief démo (09/10/2026) : le périmètre de la démo, derrière un seul interrupteur (CL_DEMO). */
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
  return mgmtAgendaJouer(m); }`;

test('Sans l’interrupteur, l’accueil offre tous les modes', () => {
  const w=newGameWindow({runMain:true});
  const r=res(w,`G.screen='title'; render(); const t=document.getElementById('app').textContent; return {n:mfMenu().length,total:MF_MENU.length,carriere:t.includes('Carrière'),duel:t.includes('Duel entre amis')};`);
  assert.equal(r.n,r.total); assert.equal(r.carriere,true); assert.equal(r.duel,true);
});

test('Avec l’interrupteur, l’accueil n’offre que le management, les options et Quitter, et aucune touche ne mène ailleurs', () => {
  const w=newGameWindow({runMain:true});
  const r=res(w,`CL_DEMO=true; G.screen='title'; MF_ACCUEIL.i=0; render(); const t=document.getElementById('app').textContent; const vus=[];
    for(let k=0;k<8;k++){ vus.push(mfMenu()[MF_ACCUEIL.i].id); CL.mfMenuDeplacer(1); }
    CL_DEMO=false;
    return {ids:mfMenu().length,carriere:t.includes('Carrière'),duel:t.includes('Duel entre amis'),pantheon:t.includes('Panthéon'),succes:t.includes('Succès'),vus:[...new Set(vus)]};`);
  assert.equal(r.carriere,false); assert.equal(r.duel,false); assert.equal(r.pantheon,false); assert.equal(r.succes,false);
  assert.ok(r.vus.every(id=>['management','options','quitter'].includes(id)));
});

test('Avec l’interrupteur, seule Split se crée ; les autres organisations restent visibles et verrouillées', () => {
  const w=newGameWindow({runMain:true});
  const r=res(w,`CL_DEMO=true; CL.mgmtNouvelle(2); const i0=MGMT_ORGANISATIONS[MGMT_NOUVELLE.i].id; const t=document.getElementById('app').textContent;
    const autre=MGMT_ORGANISATIONS.findIndex(o=>o.id!==CL_DEMO_ORG); MGMT_NOUVELLE.i=autre; G.mgmt=null; CL.mgmtNouvelleCreer(); const refuse=!G.mgmt;
    MGMT_NOUVELLE.i=MGMT_ORGANISATIONS.findIndex(o=>o.id===CL_DEMO_ORG); CL.mgmtNouvelleCreer(); const ok=!!G.mgmt&&G.mgmt.org==='Split';
    CL_DEMO=false; return {i0,verrous:(t.match(/Verrouillée/g)||[]).length,total:MGMT_ORGANISATIONS.length,refuse,ok};`);
  assert.equal(r.i0,'split'); assert.equal(r.verrous,r.total-1); assert.equal(r.refuse,true); assert.equal(r.ok,true);
});

test('Après la dernière soirée permise, « Jouer la soirée » n’est plus proposé et l’écran de fin passe une seule fois', () => {
  const w=neuve();
  const r=res(w,`CL_DEMO=true; MGMT_DEMO_FIN_VUE=false; ${JOUER} G.mgmt.eventsPlayed=CL_DEMO_SOIREES-1; const ev=jouer(); const m=G.mgmt;
    const apres=m.eventsPlayed; MGMT_SOIREE.index=m.lastEvent.fights.length; CL.mgmtLendemainNext(); const ecran1=G.screen;
    const pret=mgmtAgendaPret(m), rejoue=jouer();
    CL.go('mgmt_carte'); mgmtDemoApresSoiree(); const ecran2=G.screen;
    CL_DEMO=false; const sans=mgmtDemoTerminee(m);
    return {ok:!!ev,apres,ecran1,pret,rejoue:!!rejoue,ecran2,sans};`);
  assert.equal(r.apres,5); assert.equal(r.ecran1,'mgmt_demo_fin'); assert.equal(r.pret,false); assert.equal(r.rejoue,false); assert.equal(r.ecran2,'mgmt_carte'); assert.equal(r.sans,false);
});

test('Sans l’interrupteur, rien ne limite le nombre de soirées', () => {
  const w=neuve();
  const r=res(w,`${JOUER} G.mgmt.eventsPlayed=7; const ev=jouer(); return {ok:!!ev,fin:mgmtDemoTerminee(G.mgmt)};`);
  assert.equal(r.ok,true); assert.equal(r.fin,false);
});

test('Le texte de l’écran de fin est une proposition non relue', () => {
  const w=neuve();
  const r=res(w,`return [MGMT_DEMO_FIN.titre.relu,MGMT_DEMO_FIN.corps.relu];`);
  assert.deepEqual(r,[false,false]);
});
