"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 51 T1 — la blessure au camp permet de combattre diminué une seule fois',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{setSeed(9);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};const a=m.roster[0],b=m.roster.find(x=>x.id!==a.id);m.semaine={n:1,ev:[{f:'blessure_camp',j:'lundi',a:a.id,b:b.id,v:0,p:true}]};const html=scr_mgmt_semaine(),ok=mgmtSeChoisir(0,'A'),baisse=mgmtVieFormeBaisse(m,a,m.cycle),again=mgmtSeChoisir(0,'B');return {ok,baisse,again,html};})()`);assert.equal(r.ok,true);assert.equal(r.baisse,-6);assert.equal(r.again,false);assert.match(r.html,/blessure au camp/i);}finally{w.close();}
});

test('Monde lot 51 T1 — visa A retire la paire et enregistre une demande de revanche',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{setSeed(9);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};m.facts=[];const a=m.roster[0],b=m.roster.find(x=>x.id!==a.id);m.card.main=[{a:a.id,b:b.id,cycle:m.cycle,slot:'main'}];m.semaine={n:1,ev:[{f:'visa',j:'mardi',a:a.id,b:b.id,v:0,p:true}]};const ok=mgmtSeChoisir(0,'A');return {ok,empty:m.card.main.length===0,request:m.facts.some(x=>x.k==='demande'&&x.a===a.id&&x.target===b.id),r:m.semaine.ev[0].r};})()`);assert.deepEqual({...r},{ok:true,empty:true,request:true,r:'A'});}finally{w.close();}
});

test('Monde lot 51 T1 — le catalogue des choix couvre exactement les trois problèmes connus',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>({keys:Object.keys(MGMT_SEMAINE_CHOIX).sort(),unique:new Set(Object.values(MGMT_SEMAINE_CHOIX).flatMap(x=>[x.A.titre,x.A.texte,x.B.titre,x.B.texte])).size,unread:Object.values(MGMT_SEMAINE_CHOIX).every(x=>x.A.relu===false&&x.B.relu===false)}))()`);assert.deepEqual(Array.from(r.keys),['blessure_camp','poids','visa']);assert.equal(r.unique,12);assert.equal(r.unread,true);}finally{w.close();}
});

test('Monde lot 51 T1 — une soirée sans décision applique A à l’ouverture',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{setSeed(20261023);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};const a=m.roster[0],b=m.roster.find(x=>x.id!==a.id);m.semaine={n:1,ev:[{f:'blessure_camp',j:'lundi',a:a.id,b:b.id,v:0,p:true}]};const before=a.diminue;mgmtAgendaJouer=m=>{m.semaine.ev.forEach((e,i)=>{if(e.p&&!e.r)mgmtSeChoisir(i,'A');});return true;};mgmtAgendaJouer(m);return {r:m.semaine.ev[0].r,flag:a.diminue,cycle:m.cycle,before};})()`);assert.equal(r.r,'A');assert.equal(r.flag,r.cycle);assert.notEqual(r.before,r.flag);}finally{w.close();}
});

test('Monde lot 51 T1 — blessure B et visa B refusent le choix si la carte ne peut bouger',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{setSeed(9);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};const a=m.roster[0],b=m.roster.find(x=>x.id!==a.id);m.effectifs=2;m.card.main=[{a:a.id,b:b.id,cycle:m.cycle,slot:'main'}];m.semaine={n:1,ev:[{f:'blessure_camp',j:'lundi',a:a.id,b:b.id,v:0,p:true},{f:'visa',j:'mardi',a:a.id,b:b.id,v:0,p:true}]};return {injury:mgmtSeChoisir(0,'B'),visa:mgmtSeChoisir(1,'B'),decisions:m.semaine.ev.map(e=>e.r||null),fight:m.card.main.length};})()`);assert.equal(JSON.stringify(r),JSON.stringify({injury:false,visa:false,decisions:[null,null],fight:1}));}finally{w.close();}
});

test('Monde lot 51 T1 — les options affichent les libellés des trois familles',()=>{
  const w=newGameWindow();try{const r=w.eval(`(()=>{setSeed(31);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};const a=m.roster[0],b=m.roster.find(x=>x.id!==a.id);m.semaine={n:1,ev:[{f:'visa',j:'lundi',a:a.id,b:b.id,v:0,p:true}]};MGMT_SE_JOUR=0;return scr_mgmt_semaine();})()`);assert.match(r,/ON DÉCALE LE COMBAT/);assert.match(r,/ON LE REMPLACE/);assert.match(r,/se-option/);assert.match(r,/Le visa/);}finally{w.close();}
});
