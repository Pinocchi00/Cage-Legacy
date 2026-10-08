"use strict";
/* Brief des corrections du 08/10/2026, lot 13 (D7) : « que du recrutement pour les jeunes » et « on peut libérer un combattant en lui laissant le reste de ce qu'on lui doit ».
   Aucune relève automatique : le marché propose des jeunes, le joueur en signe, et il peut se séparer de qui il veut. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('13 — Après huit soirées, le marché offre toujours des jeunes de 24 ans et moins, et en signer un le met dans l’effectif avec un contrat', () => {
  const win=neuve(); jouer(win,8,{titre:true});
  const r=res(win,`const m=G.mgmt; let jeunes=[]; for(const d of allDivisions()) for(const x of mgmtRecrutables(m,d.id)) if(x.age<=24) jeunes.push(x);
    const x=jeunes.find(j=>true); const avant=m.roster.length; let sign=null;
    for(const j of jeunes){ const cible=mgmtExteriorPourOffre(m,j.id); if(!cible) continue; const b=mgmtBourseSouhaitee(m,cible,false); const rep=mgmtContratSigner(m,j.id,3,b); if(rep.ok){ sign=j.id; break; } }
    const f=sign?mgmtFighterById(m,sign):null;
    return {n:jeunes.length,avant,apres:m.roster.length,sign:!!sign,contrat:!!(f&&f.ct&&f.ct.n===3),age:f&&f.age};`);
  assert.ok(r.n>=10,'au moins dix jeunes sur le marché : '+r.n); assert.ok(r.sign,'un jeune a pu être signé');
  assert.equal(r.apres,r.avant+1); assert.ok(r.contrat); assert.ok(r.age<=25);
});

test('13 — Un combattant libéré rejoint le marché : le joueur peut le reprendre, et la libération coûte le reste de son contrat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.roster.forEach(f=>{ f.lastCycle=m.cycle; }); const f=m.roster.find(x=>x.ct&&mgmtAvailable(m,x)&&!mgmtEngaged(m,x)); m.treasury=500; const du=mgmtContratRestants(f)*f.ct.b; const av=m.treasury;
    const lib=mgmtContratLiberer(m,f.id); MGMT_CONTRATS.mode='recrutement'; MGMT_CONTRATS.sexe=divById(f.div).gender; MGMT_CONTRATS.div='';
    const sur=mgmtContratsLignes(m).some(x=>x.id===f.id&&x.ancien);
    const reprise=mgmtContratSigner(m,f.id,2,mgmtBourseSouhaitee(m,f,false));
    return {lib:lib.ok,paye:av-m.treasury-(reprise.ok?reprise.prime:0),du,sur,reprise:reprise.ok,libre:f.libre===true};`);
  assert.equal(r.lib,true,JSON.stringify(r)); assert.equal(r.paye,r.du); assert.equal(r.sur,true); assert.equal(r.reprise,true); assert.equal(r.libre,false);
});

test('13 — Aucune relève automatique : sans recrutement, l’effectif ne reçoit aucun jeune de plus au fil des soirées', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const ids=new Set(m.roster.map(f=>f.id)); const n0=m.roster.length;
    for(let k=0;k<6;k++){ m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null; if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+35,'petite');
      const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0; while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[(k+m.card.main.length+e)%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true); const b2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b2) mgmtDecide(m,b2.id,'validate');
      if(!mgmtAgendaJouer(m)) break; mgmtNewPile(m); }
    const nouveaux=m.roster.filter(f=>!ids.has(f.id)).length; return {nouveaux,n0,n1:m.roster.length};`);
  assert.equal(r.nouveaux,0,'personne ne s’ajoute sans que le joueur le signe');
});
