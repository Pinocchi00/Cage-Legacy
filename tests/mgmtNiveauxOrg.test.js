"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT9_T3_NIVEAUX_INDEPENDANTS] — Monde lot 9 T3 (docs/lots/MONDE-LOT-9-T3.md, DÉCISION du 15/10/2026) ====
   Réécrit par le superviseur le 15/10/2026 : la première version simulait mgmtDivisionRanking avec un champ `rang` que le vrai
   classement ne porte pas, et une partie dont `m.org` était un identifiant (c'est le nom) ; elle passait alors que la puissance valait
   toujours 0 et que l'organisation du joueur n'avait aucun niveau. Ces tests lisent de vraies parties. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

const N=6, GRAINE=20261015;
function partie(avecMonde){
  const w=newGameWindow({runMain:true});
  w.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split',{soirees:${N}});`);
  if(avecMonde) w.eval(`mgmtMondeVivantGenerer(G.mgmt,{soirees:${N}});`);
  return w;
}
const lire=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ const m=G.mgmt; ${code} })())`));

test('Monde lot 9 T3 — sans monde vivant, seule l’organisation du joueur a ses quatre niveaux',()=>{
  const w=partie(false);
  try{
    const r=lire(w,`return {moi:mgmtOrgNiveaux(m,mgmtPredecesseurOrgId(m)),autre:mgmtOrgNiveaux(m,'garden-of-blood'),rangs:mgmtOrgNiveauxRangs(m)};`);
    assert.ok(r.moi,'Split a ses niveaux');
    for(const k of ['popularite','stade','notoriete','puissance']) assert.ok(Number.isFinite(r.moi[k]),k);
    assert.ok(r.moi.stade>0,'une salle'); assert.ok(r.moi.notoriete>0,'des combattants renommés');
    assert.ok(r.moi.puissance>0,'des combattants dans le top 10 mondial');
    assert.equal(r.autre,null);
    assert.equal(r.rangs.split.puissance,1);
  }finally{ w.close(); }
});

test('Monde lot 9 T3 — chaque niveau suit sa source, et seulement elle',()=>{
  const w=partie(false);
  try{
    const r=lire(w,`const id=mgmtPredecesseurOrgId(m), avant=mgmtOrgNiveaux(m,id);
      m.pop+=5; const pop=mgmtOrgNiveaux(m,id); m.pop-=5;
      const grande=m.salles.slice().sort((a,b)=>b.capacite-a.capacite)[0];
      const comptes=m.comptes; m.comptes=comptes.concat([{salle:grande.nom,salleId:grande.id,taux:0.95}]); const stade=mgmtOrgNiveaux(m,id); m.comptes=comptes;
      const vivants=m.roster.filter(f=>!mgmtIsRetired(f));
      const tete=allDivisions().map(d=>mgmtDivisionRanking(m,d.id,'world')[0]).find(x=>x&&vivants.some(f=>f.id===x.id));
      if(tete){ m.roster.find(f=>f.id===tete.id).retired='age'; mgmtRangsInvalider(m); }
      const sansTete=mgmtOrgNiveaux(m,id);
      return {avant,pop,stade,grande:grande.capacite,sansTete,tete:!!tete};`);
    assert.equal(r.pop.popularite,r.avant.popularite+5); assert.equal(r.pop.stade,r.avant.stade); assert.equal(r.pop.puissance,r.avant.puissance);
    assert.equal(r.stade.stade,r.grande,'la grande salle remplie à 95 % devient le stade'); assert.equal(r.stade.popularite,r.avant.popularite);
    assert.ok(r.tete,'Split a un numéro 1 mondial dans une catégorie');
    assert.ok(r.sansTete.puissance<r.avant.puissance,'perdre un numéro 1 mondial fait baisser la puissance');
    assert.equal(r.sansTete.popularite,r.avant.popularite);
  }finally{ w.close(); }
});

test('Monde lot 9 T3 — avec le monde vivant, les huit organisations ont leurs niveaux et un rang de 1 à 8, à graine égale identiques',()=>{
  const a=partie(true), b=partie(true);
  try{
    const code=`return {n:MGMT_ORGANISATIONS.map(o=>mgmtOrgNiveaux(m,o.id)),r:mgmtOrgNiveauxRangs(m)};`;
    const ra=lire(a,code), rb=lire(b,code);
    assert.deepEqual(ra,rb,'déterministe');
    assert.ok(ra.n.every(Boolean),'huit organisations');
    for(const k of ['popularite','stade','notoriete','puissance'])
      assert.deepEqual(Object.values(ra.r).map(x=>x[k]).sort((x,y)=>x-y),[1,2,3,4,5,6,7,8],k);
    assert.ok(ra.n.filter(x=>x.puissance>0).length>1,'la puissance se partage entre plusieurs organisations');
  }finally{ a.close(); b.close(); }
});

test('Monde lot 9 T4 — huit lignes, rangs sans trou, totaux et ordre explicables',()=>{
  const w=partie(true);
  try{
    const rows=lire(w,`return mgmtOrgClassement(m);`);
    assert.equal(rows.length,8);
    assert.deepEqual(rows.map(x=>x.rang),[1,2,3,4,5,6,7,8]);
    for(const x of rows) assert.equal(x.total,Object.values(x.rangs).reduce((s,n)=>s+n,0));
    for(let i=1;i<rows.length;i++){
      const a=rows[i-1],b=rows[i];
      const tieBreak=a.rangs.puissance<b.rangs.puissance||(a.rangs.puissance===b.rangs.puissance&&MGMT_ORGANISATIONS.findIndex(o=>o.id===a.id)<MGMT_ORGANISATIONS.findIndex(o=>o.id===b.id));
      assert.ok(a.total<b.total||(a.total===b.total&&tieBreak));
    }
  }finally{w.close();}
});

test('Monde lot 9 T4 — changer la popularité change les rangs seulement par les totaux',()=>{
  const w=partie(true);
  try{
    const r=lire(w,`const avant=mgmtOrgClassement(m), id=MGMT_ORGANISATIONS[7].id; m.orgs[id].pop+=100000; return {avant,apres:mgmtOrgClassement(m),id};`);
    const a=r.avant.find(x=>x.id===r.id), b=r.apres.find(x=>x.id===r.id);
    assert.notEqual(a.rangs.popularite,b.rangs.popularite);
    assert.notEqual(a.total,b.total);
    assert.notDeepEqual(r.avant.map(x=>x.id),r.apres.map(x=>x.id),'le changement de total modifie le classement global');
    const ordreTotaux=xs=>xs.slice().sort((x,y)=>x.total-y.total||x.rangs.puissance-y.rangs.puissance||MGMT_ORGANISATIONS.findIndex(o=>o.id===x.id)-MGMT_ORGANISATIONS.findIndex(o=>o.id===y.id)).map(x=>x.id);
    assert.deepEqual(r.apres.map(x=>x.id),ordreTotaux(r.apres));
  }finally{w.close();}
});

test('Monde lot 9 T4 — sans monde vivant, classement nul',()=>{
  const w=partie(false);
  try{assert.equal(lire(w,`return mgmtOrgClassement(m);`),null);}finally{w.close();}
});

test('Monde lot 9 T4 — à graine égale, le classement est identique',()=>{
  const a=partie(true),b=partie(true);
  try{assert.deepEqual(lire(a,`return mgmtOrgClassement(m);`),lire(b,`return mgmtOrgClassement(m);`));}finally{a.close();b.close();}
});
