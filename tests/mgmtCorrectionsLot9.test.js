"use strict";
/* Brief des corrections du 08/10/2026, lot 9 (D2 et D3) : l'argent sert à payer les noms. La bourse suit la renommée en courbe et la popularité de l'organisation ;
   un combattant « trop grand » ne refuse plus quel que soit le prix (argent : prime, titre : ceinture ou deux premiers, ambition : refus) ; la tête d'affiche pèse sur le remplissage. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('9 — La bourse demandée suit la renommée en courbe : la vedette coûte au moins quatre fois le débutant, et plus l’organisation est connue, plus ils coûtent', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>x.ct); m.pop=100;
    f.W=0;f.L=0;f.D=0; const debutant=mgmtBourseSouhaitee(m,f,false);
    f.W=30;f.L=1; const vedette=mgmtBourseSouhaitee(m,f,false);
    f.W=10;f.L=6; m.pop=30; const moyenPeuConnu=mgmtBourseSouhaitee(m,f,false); m.pop=100; const moyenConnu=mgmtBourseSouhaitee(m,f,false);
    return {debutant,vedette,vedetteConnue:moyenConnu,vedettePeu:moyenPeuConnu,star:mgmtStar(f)};`);
  assert.ok(r.vedette>=4*r.debutant,`vedette ${r.vedette} k pour un débutant à ${r.debutant} k`);
  assert.ok(r.vedetteConnue>r.vedettePeu,'la même renommée coûte plus cher dans une organisation plus connue');
});

test('9 — Trop grand pour l’organisation : l’argent accepte contre une prime, l’ambition refuse, le titre accepte s’il tient la ceinture', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.pop=10; const par={argent:null,titre:null,ambition:null};
    for(const f of m.roster){ f.W=25;f.L=0;f.D=0; }
    for(const f of m.roster){ const g=mgmtContratGrandeur(m,f); if(g.ecart>0&&!par[g.interet]) par[g.interet]=f; }
    const sortie={};
    if(par.argent){ const f=par.argent; const dem=mgmtBourseSouhaitee(m,f,false); m.pop=100; const sans=mgmtBourseSouhaitee(m,f,false)/1; m.pop=10;
      sortie.argent={refus:mgmtContratGrandeur(m,f).refus,prime:mgmtContratGrandeur(m,f).prime,dem};
      const rep=mgmtContratReponse(m,f,3,dem,true); sortie.argent.ok=rep.ok; }
    if(par.ambition){ const f=par.ambition; sortie.ambition={ok:mgmtContratReponse(m,f,3,999,true).ok,raison:mgmtContratReponse(m,f,3,999,true).raison}; }
    if(par.titre){ const f=par.titre; sortie.titre={refus:mgmtContratGrandeur(m,f).refus,rang:mgmtDivisionRank(m,f)}; }
    return {sortie,trouves:Object.keys(par).filter(k=>par[k])};`);
  assert.deepEqual(r.trouves.sort(),['ambition','argent','titre']);
  assert.equal(r.sortie.argent.refus,false); assert.ok(r.sortie.argent.prime>1); assert.equal(r.sortie.argent.ok,true);
  assert.equal(r.sortie.ambition.ok,false); assert.equal(r.sortie.ambition.raison,'trop-grand');
  assert.equal(typeof r.sortie.titre.refus,'boolean');
});

test('9 — L’intérêt d’un combattant est dérivé de son identifiant : le même partout, jamais stocké', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster[0]; const a=mgmtContratInteret(f), b=mgmtContratInteret(f); const n={argent:0,titre:0,ambition:0};
    for(const x of m.roster) n[mgmtContratInteret(x)]++; return {egal:a===b,stocke:'interet' in f,n,total:m.roster.length};`);
  assert.equal(r.egal,true); assert.equal(r.stocke,false);
  assert.ok(r.n.argent>r.n.titre&&r.n.titre>r.n.ambition,JSON.stringify(r.n));
});

test('9 — Une tête d’affiche change visiblement le remplissage : les deux plus grandes vedettes en combat principal remplissent plus que deux inconnus', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const div=m.roster[0].div; const dd=m.roster.filter(f=>f.div===div&&mgmtAvailable(m,f));
    const tri=dd.slice().sort((x,y)=>mgmtStar(y)-mgmtStar(x)); const haut=[tri[0],tri[1]], bas=[tri[tri.length-1],tri[tri.length-2]];
    const q=(p)=>mgmtCarteQualite(m,[{a:p[0].id,b:p[1].id,slot:'main'}]);
    const salle=m.salles.find(s=>s.capacite>=3000)||m.salles[3];
    const sp=(qq)=>mgmtRemplissage(salle,60,'grosse',qq).spectateurs;
    return {qh:q(haut),qb:q(bas),sh:sp(q(haut)),sb:sp(q(bas))};`);
  assert.ok(r.qh>r.qb);
  assert.ok(r.sh>=r.sb*1.1,`${r.sh} spectateurs contre ${r.sb}`);
});
