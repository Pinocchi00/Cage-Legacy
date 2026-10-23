"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

function game(){const w=newGameWindow({runMain:true});w.eval('setSeed(20261008); CL.mgmtEnter(1)');return w;}

test('Réserves — validation, réparation malformée et sauvegarde ancienne sans clé',()=>{
  const w=game();const result=w.eval(`(()=>{const m=G.mgmt;delete m.reserves;const absent=validateMgmt(m);mgmtRepair(m);const old=m.reserves===undefined&&mgmtReserves(m).length===0;m.reserves=['ok',3,'x'.repeat(81),'ok'];mgmtRepair(m);return {absent,old,repaired:m.reserves};})()`);
  assert.equal(result.absent,true);assert.equal(result.old,true);assert.deepEqual(Array.from(result.repaired),['ok']);
});

test('Réservation — réservation bloque les propositions, suivi seul ne bloque pas',()=>{
  const w=game();const r=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0];mgmtSuivre(m,f.id);const suiviLibre=!mgmtAgendaReserve(m,f);mgmtReserver(m,f.id);return {suiviLibre,reserve:mgmtAgendaReserve(m,f)};})()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)),{suiviLibre:true,reserve:true});
});

test('Suivi — un identifiant disparu est ignoré sans exception',()=>{
  const w=game();assert.doesNotThrow(()=>w.eval(`mgmtActualites({...G.mgmt,suivis:['disparu']})`));
});

test('Suivi — un combattant d’une organisation du monde apporte ses combats et son organisation',()=>{
  const w=game();const r=w.eval(`(()=>{setSeed(20261008);mgmtMondeVivantGenerer(G.mgmt,{soirees:6});const m=G.mgmt,[orgId,o]=Object.entries(m.orgs)[0],f=o.roster.find(x=>!mgmtIsRetired(x));m.mondeVivant=true;mgmtSuivre(m,f.id);o.hist=[{c:m.cycle,a:{id:f.id,name:f.name},b:{id:'rival-test',name:'Rival test'},winner:'A',family:'ko',round:2,slot:'main'}];return {id:f.id,org:o.name,news:mgmtActualites(m).map(x=>({id:x.id,nom:x.nom})),html:(()=>{MGMT_ACTUALITES_UI.id=f.id;return mgmtActualitesHtml()})()};})()`);
  assert.ok(r.news.some(x=>x.id===r.id&&x.nom));assert.match(r.html,/Garden of Blood ·/);
});

test('Accueil — les nouvelles suivies sont limitées à quatre, prioritaires et ouvrent la nouvelle lue',()=>{
  const w=game();const r=w.eval(`(()=>{const m=G.mgmt,id=m.roster[0].id;m.suivis=[id];m.hist=Array.from({length:6},(_,i)=>({c:m.cycle-i,a:{id,name:'Suivi'},b:{id:'adv'+i,name:'Adversaire '+i},winner:'A',family:'ko',round:1,slot:'main'}));const a=mgmtActualites(m);mgmtActuLire(m,a.find(x=>x.c===m.cycle).cle);const c=mgmtAccueilContenu(m),html=mgmtAccueilPasse(m,c);const keys=[...html.matchAll(/CL\.mgmtAccueilActu\\('([^']+)'\\)/g)].map(x=>x[1]);const target=keys[0];if(target)CL.mgmtAccueilActu(target);return {n:keys.length,priorite:keys.length>0&&a.find(x=>x.cle===keys[0]).lu===false,old:html.includes('mf-ac-ev'),screen:CL.currentScreen||G.screen,lu:target&&m.actuLu.includes(target),unread:mgmtActuNonLues(m),html};})()`);
  assert.ok(r.n<=4);assert.ok(r.priorite);assert.ok(r.old);assert.ok(r.lu);assert.match(r.html,/ACTUALITÉS/);assert.match(r.html,/non lues/);
});

test('Fiche — la réservation suit le suivi et le nom hostile est échappé sur l’Accueil',()=>{
  const w=game();const r=w.eval(`(()=>{const m=G.mgmt,f=m.roster[0],id=f.id;f.name='<img onerror=alert(1)>';m.suivis=[id];mgmtReserver(m,id);const fiche=mgmtFicheSuiviBouton(m,f);const visible=fiche.includes('Je le booke moi-même');mgmtSuivre(m,id);const decoche=!mgmtEstReserve(m,id);m.suivis=[id];m.hist=[{c:m.cycle,a:{id,name:f.name},b:{id:'x',name:'Rival'},winner:'A',family:'ko',round:1,slot:'main'}];const accueil=mgmtAccueilPasse(m,mgmtAccueilContenu(m));return {visible,decoche,hostile:accueil.includes('<img onerror'),escaped:accueil.includes('&lt;img onerror')};})()`);
  assert.equal(r.visible,true);assert.equal(r.decoche,true);assert.equal(r.hostile,false);assert.equal(r.escaped,true);
});
