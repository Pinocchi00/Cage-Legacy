"use strict";
/* Corrections du 08/10/2026 (demande d'Anthony : « le top 5 doit bouger autant que dans la vraie vie ») : le classement pèse la forme récente et l'usure du temps. Une défaite
   fait chuter un leader, une série fait monter un outsider, et sur une année le top 5 se renouvelle de deux à trois noms. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('Top 5 — une défaite fait chuter le leader et une série fait monter l’outsider, alors que l’ancien écart W-L les aurait laissés', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.hist=[]; const div=m.roster.find(f=>m.roster.filter(g=>g.div===f.div).length>=8).div;
    const l=m.roster.filter(f=>f.div===div); l.forEach(f=>{ f.W=10; f.L=5; f.D=0; });
    const lead=l[0], out=l[1]; lead.W=30; lead.L=0; out.W=11; out.L=5; m.cycle=6;
    const avant=mgmtDivisionRanking(m,div,'organization').map(f=>f.id).indexOf(lead.id);
    /* le leader perd ses trois derniers combats, l'outsider gagne les siens */
    const tr=(f,W,L)=>({id:f.id,W,L,D:0,age:25,lastCycle:null}); const p=l[2];
    for(let c=1;c<=3;c++){ m.hist.push({c,slot:'main',seed:1,rounds:3,a:tr(lead,30-c+1,0),b:tr(p,10,5),winner:'B',family:'dec',round:3}); m.hist.push({c,slot:'main',seed:1,rounds:3,a:tr(out,10+c,5),b:tr(l[3],10,5),winner:'A',family:'dec',round:3}); }
    lead.L=3; lead.W=27; out.W=14; p.W=13; l[3].L=8;
    const apres=mgmtDivisionRanking(m,div,'organization').map(f=>f.id);
    return {avant,rangLeader:apres.indexOf(lead.id),rangOutsider:apres.indexOf(out.id)};`);
  assert.equal(r.avant,0);
  assert.ok(r.rangOutsider<r.rangLeader,'l’outsider en série passe devant le leader battu : '+JSON.stringify(r));
});

test('Top 5 — le classement vu d’hier et celui d’aujourd’hui suivent la même loi : aucun saut fantôme sans combat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.cycle=5; const div=m.roster.find(f=>m.roster.filter(g=>g.div===f.div).length>=8).div;
    const a=mgmtDivisionRanking(m,div,'organization').map(f=>f.id), b=mgmtDivisionRanking(m,div,'organization',m.cycle).map(f=>f.id);
    return {meme:JSON.stringify(a)===JSON.stringify(b)};`);
  assert.equal(r.meme,true);
});

test('Top 5 — sur douze soirées, le top 5 des catégories de dix combattants et plus se renouvelle d’au moins deux noms en moyenne', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const divs=[...new Set(m.roster.map(f=>f.div))].filter(d=>m.roster.filter(f=>f.div===d).length>=10);
    const top=()=>{ const o={}; for(const d of divs) o[d]=mgmtDivisionRanking(m,d,'organization').slice(0,5).map(f=>f.id); return o; }; const t0=top();
    for(let k=0;k<12;k++){ m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
      for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct||mgmtContratRestants(f)>1) continue; mgmtContratRenouveler(m,f.id,3,mgmtBourseSouhaitee(m,f,true)); }
      if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+35,'petite');
      const ds=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0; while(m.card.main.length<m.card.sizeMain&&e++<60){ const d=ds[(k+m.card.main.length+e)%ds.length]; const rows=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true); const b2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b2) mgmtDecide(m,b2.id,'validate');
      if(!mgmtAgendaJouer(m)) break; mgmtNewPile(m); }
    const t1=top(); let s=0; for(const d of divs) s+=t0[d].filter(id=>!t1[d].includes(id)).length;
    return {moy:s/divs.length,n:divs.length};`);
  assert.ok(r.n>=5); assert.ok(r.moy>=2,'renouvellement moyen : '+r.moy);
});
