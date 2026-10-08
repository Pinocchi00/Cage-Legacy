"use strict";
/* Brief des corrections du 08/10/2026, lot 8 (D1) : le dernier palier d'attente a toujours une sortie. Le matchmaker peut tenter le combattant qui refuse tout combat
   avec un nom moins connu, le libérer en payant le reste de son contrat, ou le laisser — et s'il reste trop longtemps, il s'en va. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
/* Trois combattants disponibles d'une même catégorie, du plus connu au moins connu. */
const TROIS=`const m=G.mgmt; m.cycle=60; m.roster.forEach(f=>{ f.lastCycle=60; }); const div=m.roster.find(g=>mgmtAvailable(m,g)&&g.ct).div;
  const [grand,milieu,petit]=m.roster.filter(f=>f.div===div&&f.ct&&mgmtAvailable(m,f)).sort((x,y)=>mgmtStar(y)-mgmtStar(x)).filter((f,i,l)=>i===0||i===Math.floor(l.length/2)||i===l.length-1);
  const bloque=f=>{ f.lastCycle=m.cycle-mgmtCtSeuils(m)[3]-1; };`;

test('8 — Au dernier palier, il refuse tout combat sauf contre un nom moins connu que lui', () => {
  const win=neuve();
  const r=res(win,`${TROIS} bloque(milieu);
    return {palier:mgmtContratPalier(m,milieu),seul:mgmtAvailable(m,milieu),contreGrand:mgmtAvailable(m,milieu,grand),contrePetit:mgmtAvailable(m,milieu,petit),
      selectable:mgmtSelectable(m,milieu,petit.id),selectableGrand:mgmtSelectable(m,milieu,grand.id)};`);
  assert.equal(r.palier,4);
  assert.equal(r.seul,false); assert.equal(r.contreGrand,false);
  assert.equal(r.contrePetit,true); assert.equal(r.selectable,true); assert.equal(r.selectableGrand,false);
});

test('8 — Booker le combattant rouillé contre un nom moins connu marche, et le combat lui rend un palier normal', () => {
  const win=neuve();
  const r=res(win,`${TROIS} bloque(milieu); const ok=mgmtBookMain(m,petit.id,milieu.id);
    return {ok:!!ok,engage:mgmtEngaged(m,milieu)};`);
  assert.equal(r.ok,true); assert.equal(r.engage,true);
});

test('8 — Libérer un combattant paie le reste de son contrat, le rend sans contrat et se refuse si la caisse ne suffit pas ou s’il est sur la carte', () => {
  const win=neuve();
  const r=res(win,`${TROIS} const f=milieu; const du=mgmtContratRestants(f)*f.ct.b; const avant=m.treasury; const ind=mgmtContratIndemnite(f);
    m.treasury=du-1; const pauvre=mgmtContratLiberer(m,f.id); m.treasury=avant;
    mgmtBookMain(m,petit.id,grand.id); const carte=mgmtContratLiberer(m,grand.id);
    const ok=mgmtContratLiberer(m,f.id);
    return {du,ind,pauvre:pauvre.raison,carte:carte.raison,ok:ok.ok,paye:avant-m.treasury,libre:f.libre===true,sansCt:f.ct===undefined,fait:m.facts.some(x=>x.k==='libere'&&x.a===f.id)};`);
  assert.equal(r.ind,r.du); assert.equal(r.pauvre,'caisse'); assert.equal(r.carte,'carte');
  assert.equal(r.ok,true); assert.equal(r.paye,r.du); assert.ok(r.libre&&r.sansCt&&r.fait);
});

test('8 — Trois soirées après le dernier palier, le combattant demande son départ et s’en va, sans indemnité ; avant, il reste', () => {
  const win=neuve();
  const r=res(win,`${TROIS} const f=milieu;
    f.lastCycle=m.cycle-mgmtCtSeuils(m)[3]-mgmtCtDepart(m)+1; mgmtContratsOuvreCycle(m); const reste=!!f.ct&&!f.libre;
    f.lastCycle=m.cycle-mgmtCtSeuils(m)[3]-mgmtCtDepart(m); const avant=m.treasury; mgmtContratsOuvreCycle(m);
    return {reste,parti:f.libre===true&&f.ct===undefined,gratuit:m.treasury===avant,fait:m.facts.some(x=>x.k==='depart_attente'&&x.a===f.id)};`);
  assert.equal(r.reste,true); assert.ok(r.parti&&r.gratuit&&r.fait);
});

test('8 — L’écran des contrats propose « Libérer » avec son prix, et L fait sortir le combattant choisi', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_contrats')`);
  const t=win.eval(`document.getElementById('app').textContent`);
  assert.match(t,/Libérer/);
  const r=res(win,`const m=G.mgmt, x=mgmtContratsLignes(m)[MGMT_CONTRATS.curseur]; const id=x.id; CL.mgmtContratsLiberer(); return {libre:mgmtFighterById(m,id).libre===true};`);
  assert.equal(r.libre,true);
});
