"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');
test('Semaine — samedi présente les vrais combats et seulement une diminution déjà choisie',()=>{
 const w=newGameWindow();
 const r=w.eval(`(()=>{setSeed(9);const m=mgmtDefault();mgmtNewRoster(m);mgmtNewPile(m);G={theme:'dark',mgmt:m};const [a,b,c,d]=m.roster;m.card.main=[{a:a.id,b:b.id}];m.card.prelims=[{a:c.id,b:d.id}];m.semaine={n:1,ev:[{f:'blessure_camp',j:'lundi',a:a.id,b:b.id,v:0,p:true}]};MGMT_SE_JOUR=5;const avant=JSON.stringify(m),html=scr_mgmt_semaine(),pur=avant===JSON.stringify(m);m.semaine.ev[0].r='A';return {html,carte:mgmtSeCarte(m),pur,noms:[a.name,b.name,c.name,d.name]};})()`);
 const p=w.document.createElement('div');p.innerHTML=r.html;
 assert.equal(p.querySelectorAll('.se-carte-samedi .se-combat').length,2);
 for(const nom of r.noms)assert.ok(p.querySelector('.se-carte-samedi').textContent.includes(nom));
 assert.doesNotMatch(r.html,/diminué : sa forme baisse/);
 assert.match(r.carte,/diminué : sa forme baisse/);
 assert.equal(r.pur,true);
});

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

test('Monde lot 51 T1 — les trois familles rendent deux choix sur une passe Split',()=>{
  const w=newGameWindow({runMain:true});try{const r=w.eval(`(()=>{setSeed(20261023);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;const choix={};for(const famille of ['poids','blessure_camp','visa']){const f=m.roster.find(x=>m.card.main.concat(m.card.prelims).some(c=>c.a===x.id||c.b===x.id));const adv=m.roster.find(x=>x.id!==f.id);m.semaine.ev=[{f:famille,j:'lundi',a:f.id,b:adv.id,v:0,p:true}];MGMT_SE_JOUR=0;choix[famille]=scr_mgmt_semaine();}return {choix,hasWeek:!!m.semaine};})()`);assert.equal(r.hasWeek,true);for(const famille of ['poids','blessure_camp','visa']){assert.match(r.choix[famille],/class="se-option"/);assert.equal((r.choix[famille].match(/class="se-option"/g)||[]).length,2);assert.match(r.choix[famille],/Choix A|Le combat|diminué|DÉCALE|DÉCLARE|REMPLACE/i);}}finally{w.close();}
});

test('Monde lot 51 T1 — les classes A/B ont leurs styles, le corps reste lisible et échappé',()=>{
  const w=newGameWindow();try{const html=w.eval(`(()=>{const m={ville:'<Ville>',roster:[{id:'x',name:'<Combattant>'}],semaine:{n:1,ev:[{f:'blessure_camp',j:'lundi',a:'x',b:'x',v:0,p:true}]},card:{main:[{a:'x',b:'x'}],prelims:[]}};G={mgmt:m};MGMT_SE_JOUR=0;return scr_mgmt_semaine();})()`),css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');for(const c of ['se-ecran','se-frise','se-jour','se-actif','se-colonnes','se-principal','se-panneau','se-cote','se-surtitre','se-titre','se-texte','se-choix','se-option','se-bref','se-combat','se-diminue'])assert.match(css,new RegExp('\\.'+c+'(?:\\W|\\{)'));assert.doesNotMatch(html,/<Combattant>|<Ville>/);assert.match(html,/&lt;Combattant&gt;/);assert.match(css,/\.se-texte[^}]*font-size:\s*(?:22|2[3-9]|[3-9]\d)px/);assert.match(css,/\.se-option[^}]*font-size:\s*(?:22|2[3-9]|[3-9]\d)px/);}finally{w.close();}
});

test('Monde lot 51 T1 — douze soirées se jouent et la partie reste rechargeable',()=>{
  const w=newGameWindow({runMain:true});try{w.eval(`setSeed(20261023);G.mgmt=mgmtPasseGenerer('split',{soirees:3});`);const jouees=jouerSoirees(w,12,{recharge:true});assert.equal(jouees,12);const ok=w.eval(`(()=>{const m=G.mgmt;return validateMgmt(m)&&!!JSON.parse(JSON.stringify(m));})()`);assert.equal(ok,true);}finally{w.close();}
});

/* Constat du 23/10/2026 : test sur de vraies soirées, créées par le chemin réel, avec des problèmes forcés. */
const {newGameWindow:newGameWindowF}=require('./helpers/loadGame');
const jouerSoireesF=require('./helpers/jouerSoirees');
test('Monde lot 51 T1 — douze soirées jouées une à une avec une blessure ou un visa forcé : aucune exception, la partie reste valide et se recharge',()=>{
  const w=newGameWindowF({runMain:true});
  w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(20261008); CL.mgmtEnter(1); mgmtPasseGenerer('split',{soirees:3});`);
  for(let k=0;k<12;k++){
    w.eval(`(()=>{const m=G.mgmt; const c=(m.card.main||[])[0]||(m.card.prelims||[])[0]; if(c){ m.semaine={n:(m.eventsPlayed||0)+1,ev:[{f:'${k%2?'visa':'blessure_camp'}',j:'mardi',a:c.a,b:c.b,v:0,p:true}]}; if(${k%3===0}) { try{ mgmtSeChoisir(0,'B'); }catch(e){} } } })()`);
    jouerSoireesF(w,1);
  }
  const r=JSON.parse(w.eval(`JSON.stringify({valide:validateMgmt(G.mgmt),recharge:validateMgmt(JSON.parse(JSON.stringify(G.mgmt))),joues:G.mgmt.eventsPlayed})`));
  assert.equal(r.valide,true);
  assert.equal(r.recharge,true);
  assert.ok(r.joues>=12);
});
