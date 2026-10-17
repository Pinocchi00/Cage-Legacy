"use strict";
/* Brief des corrections du 08/10/2026, lot 11 (D5) : un combat de titre est un événement. Au plus deux par carte ; un champion ne combat que pour sa ceinture ;
   un combat de titre pèse sur l'attrait de la carte. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
/* Une catégorie avec son champion et deux adversaires disponibles, plus les mêmes dans deux autres catégories. */
const CHAMPS=`const m=G.mgmt; m.roster.forEach(f=>{ f.lastCycle=m.cycle; });
  const champs=[...mgmtChampionIds(m)].map(id=>mgmtFighterById(m,id));
  const groupe=c=>({c,autres:m.roster.filter(f=>f.div===c.div&&f.id!==c.id&&mgmtAvailable(m,f))});`;

test('11 — Un champion booké en carte principale met sa ceinture en jeu d’office, et le joueur ne peut pas la retirer', () => {
  const win=neuve();
  const r=res(win,`${CHAMPS} const g=groupe(champs[0]); const fight=mgmtBookMain(m,g.c.id,g.autres[0].id);
    const retire=mgmtSetTitle(m,0,false);
    return {n:champs.length,title:fight&&fight.title,retire,garde:m.card.main[0].title};`);
  assert.ok(r.n>0); assert.equal(r.title,true); assert.equal(r.retire,false); assert.equal(r.garde,true);
});

test('11 — Au plus deux combats de titre par carte : le troisième champion ne peut pas être booké', () => {
  const win=neuve();
  const r=res(win,`${CHAMPS} const res=[]; for(const c of champs.slice(0,3)){ const g=groupe(c); const x=g.autres.find(o=>mgmtSelectable(m,o,c.id)&&mgmtSelectable(m,c,null)); res.push(!!(x&&mgmtBookMain(m,c.id,x.id))); }
    return {res,titres:m.card.main.filter(x=>x.title).length,champs:champs.length};`);
  assert.ok(r.champs>=3); assert.deepEqual(r.res,[true,true,false]); assert.equal(r.titres,2);
});

/* Décision d'Anthony du 17/10/2026 (monde lot 14 T2) : Leïla pose elle-même les préliminaires (à la pose de la soirée, ou quand ils manquent) ; la garantie reste : aucun champion n'y figure. */
test('11 — Un champion n’est jamais un préliminaire : Leïla ne le pose pas', () => {
  const win=neuve();
  const r=res(win,`${CHAMPS} const ids=new Set(champs.map(c=>c.id)); m.pile.forEach(x=>{x.status='closed';}); m.open=null;
    const compte=()=>{ let champ=0; for(const f of m.card.prelims) if(ids.has(f.a)||ids.has(f.b)) champ++; return champ; };
    const aLaPose={poses:m.card.prelims.length,champ:compte()};
    const lib=()=>m.roster.filter(f=>!ids.has(f.id)&&mgmtSelectable(m,f,null)&&!mgmtEngaged(m,f));
    for(let k=0;k<60&&m.card.main.length<m.card.sizeMain;k++){ const rows=lib(); let ok=false; for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; }
    m.card.prelims=[]; mgmtOfferBulk(m,true);
    return {principale:m.card.main.length,aLaPose,remplaces:m.card.prelims.length,champ:compte(),affaire:m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')};`);
  assert.equal(r.principale,5); assert.ok(r.aLaPose.poses>0,'Leïla a posé des préliminaires à la pose'); assert.equal(r.aLaPose.champ,0);
  assert.ok(r.remplaces>0,'Leïla repose des préliminaires quand ils manquent'); assert.equal(r.champ,0); assert.equal(r.affaire,false,'plus aucune proposition à valider');
});

test('11 — Un combat de titre ajoute à l’attrait de la carte', () => {
  const win=neuve();
  const r=res(win,`${CHAMPS} const g=groupe(champs[0]); const a=g.c.id,b=g.autres[0].id;
    const sans=mgmtCardAttraction(m,[{a,b,slot:'main'}]), avec=mgmtCardAttraction(m,[{a,b,slot:'main',title:true}]);
    return {sans,avec};`);
  assert.ok(r.avec>r.sans+0.4);
});
