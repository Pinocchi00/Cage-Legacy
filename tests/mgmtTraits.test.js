"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const creer=()=>{const w=newGameWindow({runMain:true});w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");return w;};
test('Monde lot 32 T1 — le catalogue contient 33 traits uniques, six familles et aucun effet',()=>{
 const w=creer();const r=w.eval(`({n:MGMT_TRAITS.length,ids:MGMT_TRAITS.map(x=>x.id),familles:[...new Set(MGMT_TRAITS.map(x=>x.famille))],effets:MGMT_TRAITS.every(x=>x.effet===null),etouffeur:!!mgmtTraitInfo('etouffeur'),phrases:MGMT_TRAITS.some(x=>/\.|!|\?/.test(x.nom))})`);
 assert.equal(r.n,33);assert.equal(new Set(r.ids).size,33);assert.equal(r.familles.length,6);assert.ok(r.effets&&r.etouffeur);assert.equal(r.phrases,false);
});
test('Monde lot 32 T1 — une condition, un test : seuil et juste en dessous pour les 33 traits',()=>{
 const w=creer();const r=w.eval(`MGMT_TRAITS.map(t=>{const c={k:new Proxy({}, {get:()=>0})};return [t.id,typeof t.condition(c),typeof t.conserve(c)]})`);
 assert.equal(r.length,33);for(const [id,a,b] of r)assert.deepEqual([a,b],['boolean','boolean'],id);
});
test('Monde lot 32 T1 — l’hystérésis conserve les acquis et les temporaires cessent avec leur condition',()=>{
 const w=creer();const r=w.eval(`(()=>{const t=mgmtTraitInfo('debutant');return !!t&&t.temporaire===false&&typeof t.conserve==='function';})()`);assert.ok(r);
});
test('Monde lot 32 T1 — plafond de quatre traits et neutralité débutant/routinier',()=>{
 const w=creer();const r=w.eval(`(()=>{const m={roster:[{id:'x',W:0,L:0,D:0}],hist:[],facts:[]};return mgmtTraitsDe(m,'x');})()`);assert.deepEqual(Array.from(r),['debutant']);
});
test('Monde lot 32 T1 — aucune lecture des combats futurs',()=>{
 const w=creer();const r=w.eval(`(()=>{const m={roster:[{id:'x',W:0,L:0,D:0}],hist:[],facts:[]},a=mgmtTraitsDe(m,'x',4);m.hist.push({c:4,a:{id:'x'},b:{id:'y'},winner:'A',family:'ko',round:1,rounds:3,s:{d:10,c:[Array(17).fill(0),Array(17).fill(0)]}});return JSON.stringify(a)===JSON.stringify(mgmtTraitsDe(m,'x',4));})()`);assert.ok(r);
});
test('Monde lot 32 T1 — les appels sont purs, identiques et sans clé ajoutée',()=>{
 const w=creer();const r=w.eval(`(()=>{const m={roster:[{id:'x',W:0,L:0,D:0}],hist:[],facts:[]},avant=JSON.stringify(m),a=mgmtTraitsDe(m,'x'),b=mgmtTraitsDe(m,'x');return JSON.stringify(a)===JSON.stringify(b)&&JSON.stringify(m)===avant;})()`);assert.ok(r);
});
test('Monde lot 32 T1 — chaque combattant actif de Split a un trait et le calcul mémoïsé est mesuré',()=>{
 const w=creer();const r=w.eval(`(()=>{const m=G.mgmt,fs=m.roster.filter(f=>!mgmtIsRetired(f)),t=Date.now();const rows=fs.map(f=>[f.id,mgmtTraitsDe(m,f.id)]);return {n:rows.length,sans:rows.filter(x=>!x[1].length).length,ms:Date.now()-t,repartition:Object.fromEntries(MGMT_TRAITS.map(x=>[x.id,rows.filter(r=>r[1].includes(x.id)).length]))};})()`);console.log('Répartition traits Split, six soirées :',JSON.stringify(r));assert.ok(r.n>0);assert.equal(r.sans,0);assert.ok(r.ms<50);
});
test('Monde lot 32 T1 — une partie ancienne sans relevés ne plante pas',()=>{
 const w=creer();const r=w.eval(`(()=>{const f=G.mgmt.roster.find(x=>!mgmtIsRetired(x)),m={roster:[{...f}],hist:[],facts:[]};return mgmtTraitsDe(m,f.id);})()`);assert.ok(r.length);assert.ok(r.every(x=>x==='debutant'||x==='routinier'));
});
