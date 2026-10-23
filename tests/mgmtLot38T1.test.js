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
test('Monde lot 38 T1 — profils identifiés, trois faits au plus et libellés par id',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;return MGMT_ORGANISATIONS.map(o=>{m.org=o.id;const x=mgmtManque(m);return {id:x&&x.id,titre:x&&x.titre,n:x&&x.lignes.length,leila:x&&x.leila};});`);
 assert.equal(r.length,8);for(const x of r){assert.ok(x.id&&x.titre&&x.leila);assert.ok(x.n<=3);}
});
test('Monde lot 38 T1 — les lignes mesurées ne contiennent pas de valeurs manquantes',()=>{
 const w=newGameWindow();const rows=result(w,`setSeed(20261008);CL.mgmtEnter(1);return mgmtManque(G.mgmt).lignes;`);
 assert.ok(rows.every(x=>![x.libelle,x.valeur,x.sous||''].some(v=>/undefined|NaN|\[object/i.test(String(v)))));
});
test('Monde lot 38 T1 — des candidats distincts et sans champion de Split',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt,x=mgmtEspoirsProposer(m);return {x,champs:[...mgmtChampionIds(m)]};`);
 assert.equal(new Set(r.x.map(x=>x.id)).size,r.x.length);assert.ok(r.x.every(x=>!r.champs.includes(x.id)));
});
test('Monde lot 38 T1 — garder un quatrième espoir est refusé et rendre ne désuit pas',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(27);CL.mgmtEnter(1);const m=G.mgmt,ids=mgmtEspoirsFixer(m).map(x=>x.id);ids.slice(0,3).forEach(id=>mgmtEspoirGarder(m,id));const fourth=ids[3],kept=mgmtEspoirGarder(m,fourth);const id=ids[0];mgmtEspoirRendre(m,id);return {kept,followed:mgmtSuivis(m).includes(id),n:mgmtEspoirs(m).length};`);
 assert.equal(r.kept,false);assert.equal(r.followed,true);assert.equal(r.n,2);
});
test('Monde lot 38 T1 — les clés facultatives ne sont pas ajoutées aux sauvegardes anciennes',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;delete m.espoirs;delete m.espoirsPropose;const before=JSON.stringify(m);mgmtMigrate(m);return {before,after:JSON.stringify(m),has:Object.hasOwn(m,'espoirs')||Object.hasOwn(m,'espoirsPropose')};`);
 assert.equal(r.after,r.before);assert.equal(r.has,false);
});
test('Monde lot 38 T1 — la source espoir est inscrite au registre',()=>{
 const w=newGameWindow();const r=result(w,`return MGMT_ACTU_SOURCES.some(x=>x.type==='espoir');`);assert.equal(r,true);
});
test('Monde lot 38 T1 — les fonctions rendent des données et non du HTML',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;const x=mgmtEspoirsProposer(m)[0];return {manque:mgmtManque(m),x};`);
 assert.equal(typeof r.x.id,'string');assert.ok(!JSON.stringify(r).includes('<img'));
});
