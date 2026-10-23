"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){return JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`));}
test('Monde lot 38 T1 — faits mesurés par profil et propos déterministes',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;return {manque:mgmtManque(m),a:mgmtEspoirsProposer(m),b:mgmtEspoirsProposer(m)};`);
 assert.ok(r.manque&&r.manque.titre&&r.manque.lignes.length<=3&&r.manque.leila);
 assert.deepEqual(r.a,r.b);assert.ok(r.a.length<=6);assert.equal(new Set(r.a.map(x=>x.id)).size,r.a.length);
 for(const x of r.a){assert.ok(x.angle&&x.etiquette&&x.fiche.bilan&&x.fiche.chiffres.length===2&&x.fiche.phrase);}
});
test('Monde lot 38 T1 — proposition fixée, suivi et plafond de trois',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt,rows=mgmtEspoirsFixer(m),ids=m.espoirsPropose.slice();const a=ids.slice(0,3).map(id=>mgmtEspoirGarder(m,id));return {ids,again:mgmtEspoirsFixer(m).map(x=>x.id),a,n:mgmtEspoirs(m).length,s:mgmtEstEspoir(m,ids[0]),bad:mgmtEspoirGarder(m,'inconnu')};`);
 assert.ok(r.ids.length<=6);assert.deepEqual(r.again,r.ids);assert.equal(r.a.filter(Boolean).length,3);assert.equal(r.n,3);assert.ok(r.s);assert.equal(r.bad,false);
});
