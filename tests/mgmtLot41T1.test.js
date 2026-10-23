"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow,readScriptOrder}=require('./helpers/loadGame');
function run(w,s){return JSON.parse(w.eval(`JSON.stringify((()=>{${s}})())`));}
test('P6 T1 — catalogue complet, équilibré et relu=false',()=>{
  const w=newGameWindow();try{const r=run(w,`return {f:MGMT_SEMAINE_FAMILLES.map(x=>({id:x.id,ton:x.ton,textes:x.textes,relu:x.relu})),order:(${JSON.stringify(readScriptOrder())})};`);assert.ok(r.f.length>=20);assert.ok(r.f.filter(x=>x.ton==='bon').length>=7);assert.ok(r.f.filter(x=>x.ton==='neutre').length>=7);assert.ok(r.f.filter(x=>x.ton==='probleme').length>=6);for(const f of r.f){assert.ok(f.textes.length>=3);assert.equal(f.relu,false);for(const t of f.textes)assert.match(t,/{(?:nom|adversaire|ville|salle)}/);}}finally{w.close();}
});
test('P6 T1 — dosage déterministe, sauvegarde facultative et textes échappés',()=>{
  const w=newGameWindow();try{const r=run(w,`const m={graine:'lot41',eventsPlayed:0,roster:[{id:'a',name:'<img onerror=alert(1)>'},{id:'b',name:'Adversaire'}],card:{main:[{a:'a',b:'b'}],prelims:[]}};let none=0,one=0,many=0,problems=0,maxProblems=0;for(let n=1;n<=200;n++){m.eventsPlayed=n-1;delete m.semaine;mgmtSemaineTirer(m);const s=m.semaine;maxProblems=Math.max(maxProblems,s.ev.filter(e=>e.p).length);if(!s.ev.length)none++;else if(s.ev.length===1)one++;else many++;if(s.ev.some(e=>e.p))problems++;}m.eventsPlayed=0;delete m.semaine;const before=JSON.stringify(m);const first=JSON.stringify(mgmtSemaineTirer(m));delete m.semaine;mgmtSemaineTirer(m);const deterministic=first===JSON.stringify(m.semaine);const hostile=mgmtSemaineTexte(m,{f:MGMT_SEMAINE_FAMILLES[0].id,j:'lundi',a:'a',b:'b',v:0,p:false});return {none,one,many,problems,maxProblems,deterministic,hostile,untouched:!before.includes('semaine'),valid:mgmtSemaineValide(m.semaine)};`);for(const k of ['none','one','many'])assert.ok(Math.abs(r[k]/200-1/3)<.08);assert.ok(r.problems/200<.45);assert.equal(r.maxProblems,1);assert.ok(r.deterministic&&r.untouched&&r.valid);assert.ok(!r.hostile.includes('<img'));}finally{w.close();}
});
test('P6 T1 — validation et réparation de semaine invalide',()=>{
  const w=newGameWindow();try{assert.equal(run(w,`return mgmtSemaineValide({n:1,ev:[{f:'inconnu',j:'lundi',a:'a',b:null,v:0,p:false}]});`),false);const r=run(w,`const m={semaine:{n:0,ev:[]}};mgmtRepair(m);return Object.hasOwn(m,'semaine');`);assert.equal(r,false);}finally{w.close();}
});
test('P6 T2 — aucune phrase ne revient pour un combattant en cinquante soirées',()=>{
  const w=newGameWindow();try{const r=run(w,`const m={graine:'anti-repetition',eventsPlayed:0,roster:[{id:'a',name:'Combattant'},{id:'b',name:'Rival'}],card:{main:[{a:'a',b:'b'}],prelims:[]}},seen=new Set();let duplicate=false;for(let n=1;n<=50;n++){m.eventsPlayed=n-1;delete m.semaine;const s=mgmtSemaineTirer(m);for(const e of s.ev)if(e.a==='a'){const key=e.f+'|'+e.v;if(seen.has(key))duplicate=true;seen.add(key);}}return {duplicate,size:seen.size};`);assert.equal(r.duplicate,false);}finally{w.close();}
});
