"use strict";
/* Monde lot 46 T1 (brief du 22/10/2026, P8 T1 et P11 T2) : le poids d'une
   histoire et les défis secondaires. Tout est calcul, aucun écran. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

/* Une soirée de référence complète, évaluée dans la fenêtre du jeu : un 13-1
   bat le n°1 mondial (surprise), une ceinture ordinaire est jouée, un record
   mineur tombe, un surnom est donné. Renvoie {m, histoires}. */
const REFERENCE=`(function(){
  const m=mgmtDefault('split');
  m.cycle=100; m.eventsPlayed=20;
  const ligne=(id,div,W,L)=>({id,name:id,first:id,last:id,div,age:29,W,L,D:0});
  m.roster=[ligne('w1','H-light',13,1),ligne('l1','H-light',20,1),ligne('t1','H-light',5,2),
    ligne('t2','H-light',4,3),ligne('r1','H-light',3,1),ligne('r2','H-light',2,2)];
  const coin=(sig)=>{ const a=Array(17).fill(0); a[1]=sig; return a; };
  const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
  const combat=(c,a,b,extra)=>m.hist.push(Object.assign({c,slot:'main',rounds:3,seed:0,round:3,winner:'A',family:'dec',
    a:trace(a.id,a.W,a.L),b:trace(b.id,b.W,b.L),s:{d:300,c:[coin(0),coin(0)]}},extra||{}));
  /* Un record mineur d'avant la soirée (sigAtt 4). */
  m.hist.push({c:96,slot:'main',rounds:3,seed:0,round:1,winner:'A',family:'ko',
    a:trace('r1',3,1),b:trace('r2',2,2),s:{d:60,c:[coin(4),coin(0)]}});
  /* La soirée : le record battu (sigAtt 6), le titre ordinaire, la surprise. */
  m.hist.push({c:100,slot:'main',rounds:3,seed:0,round:1,winner:'A',family:'ko',
    a:trace('r1',3,1),b:trace('r2',2,2),s:{d:60,c:[coin(6),coin(0)]}});
  combat(100,{id:'t1',W:5,L:2},{id:'t2',W:4,L:3},{slot:'main',round:3,winner:'A',family:'dec'});
  combat(100,{id:'w1',W:13,L:1},{id:'l1',W:20,L:1},{slot:'main',round:2,winner:'A',family:'ko'});
  m.facts=[{c:100,k:'title_fight',div:'H-light',fight:2},
    {c:100,k:'surnom',a:'t1',nom:'Le Calme',t:'serie',s:20}];
  m.lastEvent={cycle:100,fights:[],touched:[],finance:{spectateurs:5000,recette:100}};
  const histoires=mgmtHistoiresSoiree(m,20);
  return {histoires, types:histoires.map(x=>x.type), tete:histoires[0],
    titre:histoires.find(x=>x.type==='titre'), record:histoires.find(x=>x.type==='record'),
    surnom:histoires.find(x=>x.type==='surnom')};
})()`;

test('Lot 46 T1 — la soirée de référence : un 13-1 qui bat le n°1 mondial passe devant un titre ordinaire, un record mineur et un surnom', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify(${REFERENCE})`));
  assert.equal(r.tete.type,'surprise','la surprise ouvre le classement');
  assert.equal(r.tete.a,'w1');
  assert.ok(r.titre&&r.record&&r.surnom,'les trois autres histoires sont là');
  assert.ok(r.tete.poids>r.titre.poids,'la surprise passe devant le titre ordinaire');
  assert.ok(r.tete.poids>r.record.poids,'la surprise passe devant le record mineur');
  assert.ok(r.tete.poids>r.surnom.poids,'la surprise passe devant le surnom');
  assert.equal(r.tete.raison.ecart,7,'le 13-1 (bilan 12) bat un 20-1 (bilan 19)');
  assert.deepEqual(r.types.slice(0,3),['surprise','titre','record'],'la surprise, puis le titre, puis le record');
});

test('Lot 46 T1 — pureté : deux appels donnent le même résultat et m n’a pas changé (JSON avant/après)', () => {
  const win=newGameWindow();
  const x=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split'); m.cycle=100; m.eventsPlayed=20;
    const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
    const coin=(sig)=>{const a=Array(17).fill(0);a[1]=sig;return a;};
    m.roster=[trace('w1',13,1),trace('l1',20,1)];
    m.hist=[{c:100,slot:'main',rounds:3,seed:0,round:2,winner:'A',family:'ko',a:trace('w1',13,1),b:trace('l1',20,1),s:{d:120,c:[coin(2),coin(1)]}}];
    m.facts=[]; m.lastEvent={cycle:100,fights:[],touched:[],finance:{spectateurs:10,recette:1}};
    const seed=SEED, avant=JSON.stringify(m);
    const a=mgmtHistoiresSoiree(m,20), b=mgmtHistoiresSoiree(m,20);
    return {meme:JSON.stringify(a)===JSON.stringify(b),inchange:avant===JSON.stringify(m),rng:seed===SEED,n:a.length};
  })())`));
  assert.ok(x.meme,'deux appels identiques');
  assert.ok(x.inchange,'m est inchangé');
  assert.ok(x.rng,'aucun tirage consommé');
  assert.ok(x.n>=1);
});

test('Lot 46 T1 — les entrées prime et discours valent 0 sans fait de ce type', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split'); m.cycle=100; m.eventsPlayed=20;
    const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
    m.roster=[trace('a',3,1),trace('b',2,2)];
    m.hist=[{c:100,slot:'main',rounds:3,seed:0,round:3,winner:'A',family:'dec',a:trace('a',3,1),b:trace('b',2,2)}];
    m.facts=[]; m.lastEvent={cycle:100,fights:[],touched:[],finance:{spectateurs:10,recette:1}};
    const sans=mgmtHistoiresSoiree(m,20);
    const poidsSans=[mgmtHistoirePoidsPrime(null),mgmtHistoirePoidsDiscours(undefined)];
    m.facts=[{c:100,k:'prime',a:'a',montant:250,nom:'Prime'},{c:100,k:'discours',a:'a',principal:true,surprise:true,fight:0}];
    const avec=mgmtHistoiresSoiree(m,20);
    return {sans:sans.filter(x=>x.type==='prime'||x.type==='discours').length,poidsSans,
      avec:avec.filter(x=>x.type==='prime'||x.type==='discours').map(x=>[x.type,x.poids])};
  })())`));
  assert.equal(r.sans,0,'aucune entrée sans fait');
  assert.deepEqual(r.poidsSans,[0,0],'les deux poids valent 0 sans fait');
  assert.equal(r.avec.length,2,'les deux faits sont lus quand ils existent');
  assert.ok(r.avec.every(([,p])=>p>0));
});

test('Lot 46 T1 — au moins quarante défis, répartition par famille, ids uniques, relu:false et types connus', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const familles={soiree:0,saison:0,carriere:0};
    for(const d of MGMT_DEFIS) familles[d.famille]++;
    return {n:MGMT_DEFIS.length,familles,uniques:new Set(MGMT_DEFIS.map(d=>d.id)).size,
      relu:MGMT_DEFIS.every(d=>d.relu===false),
      types:MGMT_DEFIS.every(d=>d.test&&MGMT_DEFIS_TEST_TYPES.includes(d.test.type)),
      titres:MGMT_DEFIS.every(d=>typeof d.titre==='string'&&d.titre.length>0&&typeof d.texte==='string'&&d.texte.length>0)};
  })())`));
  assert.ok(r.n>=40,'au moins quarante défis');
  assert.ok(r.familles.soiree>=10,'au moins dix défis de soirée');
  assert.ok(r.familles.saison>=15,'au moins quinze défis de saison');
  assert.ok(r.familles.carriere>=10,'au moins dix défis de carrière');
  assert.equal(r.uniques,r.n,'identifiants uniques');
  assert.ok(r.relu,'tous marqués relu:false');
  assert.ok(r.types,'chaque test a un type évaluable');
  assert.ok(r.titres,'chaque défi a un titre et un texte');
});

test('Lot 46 T1 — chaque défi peut être réussi : au moins trente états minimaux, un par défi', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const base=()=>({org:'Split',cycle:100,eventsPlayed:20,hist:[],facts:[],roster:[],suivis:[],espoirs:[],comptes:[],treasury:0,lastEvent:null,pop:40,salles:[]});
    const coin=(kd)=>{const a=Array(17).fill(0);a[14]=kd||0;return a;};
    const F=(o)=>{o=o||{};const a=Object.assign({id:'a',W:1,L:0,D:0,div:'H-light',age:29},o.a||{});const b=Object.assign({id:'b',W:0,L:1,D:0,div:'H-light',age:29},o.b||{});
      return {c:o.c===undefined?100:o.c,slot:o.slot||'main',rounds:o.rounds||3,seed:0,winner:o.winner||'A',family:o.family||'dec',round:o.round===undefined?3:o.round,a,b,s:{d:o.d===undefined?300:o.d,c:[coin(o.kdA||0),coin(o.kdB||0)]}};};
    const fin=(m,n,fam,round,slot)=>{for(let i=0;i<n;i++)m.hist.push(F({family:fam||'ko',round:round===undefined?1:round,slot:slot||'main',a:{id:'a'+i},b:{id:'b'+i}}));};
    const titres=(m,n,id)=>{for(let i=0;i<n;i++){m.hist.push(F({a:{id:id||('t'+i),W:5,L:0,D:0},b:{id:'x'+i,W:2,L:2,D:0}}));m.facts.push({c:100,k:'title_fight',div:'H-light',fight:m.hist.length-1});}};
    const victoires=(m,n,id)=>{for(let i=0;i<n;i++)m.hist.push(F({a:{id:id||'champ',W:10,L:0,D:0},b:{id:'v'+i,W:1,L:3,D:0}}));};
    const cas={};
    cas['soiree-trois-finitions-r1']=m=>fin(m,3,'ko',1);
    cas['soiree-cinq-finitions']=m=>fin(m,5,'sub',2);
    cas['soiree-trois-ko']=m=>fin(m,3,'ko',2);
    cas['soiree-deux-soumissions']=m=>fin(m,2,'sub',3);
    cas['soiree-une-decision']=m=>fin(m,3,'ko',1);
    cas['soiree-une-guerre']=m=>{m.hist=[F({kdA:1,kdB:1})];};
    cas['soiree-deux-titres']=m=>titres(m,2);
    cas['soiree-grande-salle']=m=>{fin(m,2);m.lastEvent={cycle:100,finance:{spectateurs:8000,recette:1}};};
    cas['soiree-grosse-recette']=m=>{fin(m,2);m.lastEvent={cycle:100,finance:{spectateurs:1,recette:500}};};
    cas['soiree-trois-finitions-prelim']=m=>fin(m,3,'ko',1,'prelim');
    cas['soiree-ko-trente-secondes']=m=>{m.hist=[F({family:'ko',round:1,d:20})];};
    cas['soiree-deux-surprises']=m=>{m.hist=[F({a:{id:'s1',W:2,L:2,D:0},b:{id:'f1',W:9,L:1,D:0}}),F({a:{id:'s2',W:1,L:3,D:0},b:{id:'f2',W:8,L:2,D:0}})];};
    cas['soiree-neuf-combats']=m=>fin(m,9,'dec',3);
    cas['saison-quarante-combats']=m=>fin(m,40,'dec',3);
    cas['saison-vingt-victoires']=m=>victoires(m,20);
    cas['saison-douze-finitions']=m=>fin(m,12,'ko',2);
    cas['saison-six-finitions-r1']=m=>fin(m,6,'ko',1);
    cas['saison-trois-guerres']=m=>{for(let i=0;i<3;i++)m.hist.push(F({kdA:2,kdB:1,a:{id:'g'+i},b:{id:'h'+i}}));};
    cas['saison-deux-titres']=m=>titres(m,2);
    cas['saison-deux-defenses']=m=>titres(m,3,'roi');
    cas['saison-nouveau-champion']=m=>titres(m,1,'neuf');
    cas['saison-serie-six']=m=>victoires(m,6,'serie');
    cas['saison-invaincu-six']=m=>victoires(m,6,'invaincu');
    cas['saison-deux-surnoms']=m=>{m.facts=[{c:99,k:'surnom',a:'a',nom:'Un',t:'ko',s:19},{c:100,k:'surnom',a:'b',nom:'Deux',t:'ko',s:20}];};
    cas['saison-dix-soirees']=m=>{for(let c=91;c<=100;c++)m.hist.push(F({c}));};
    cas['saison-poids-lourd-classe']=m=>{m.roster=[{id:'p',div:'H-heavy',age:29,W:10,L:1,D:0}];};
    cas['saison-top-cinq-mondial']=m=>{m.roster=[{id:'p',div:'H-light',age:29,W:10,L:1,D:0}];};
    cas['saison-trois-espoirs']=m=>{m.espoirs=['e1','e2','e3'];m.suivis=['e1','e2','e3'];};
    cas['saison-espoir-classe']=m=>{m.roster=[{id:'e',div:'H-light',age:24,W:8,L:1,D:0}];m.espoirs=['e'];m.suivis=['e'];};
    cas['carriere-zero-zero-champion']=m=>{m.hist=[F({a:{id:'z',W:0,L:0,D:0},b:{id:'x',W:3,L:1,D:0}})];m.facts=[{c:100,k:'title_fight',div:'H-light',fight:0}];};
    cas['carriere-salle-pleine']=m=>{m.comptes=[{n:1,recette:100,spectateurs:7600,capacite:8000,taux:0.95}];};
    cas['carriere-huit-mille-spectateurs']=m=>{m.comptes=[{n:1,recette:100,spectateurs:8000,capacite:9000,taux:0.88}];};
    cas['carriere-recette-million']=m=>{m.comptes=[{n:1,recette:1000,spectateurs:100,capacite:9000,taux:0.01}];};
    cas['carriere-cent-victoires']=m=>victoires(m,100);
    cas['carriere-cent-finitions']=m=>fin(m,100,'ko',2);
    cas['carriere-cinq-titres']=m=>titres(m,5);
    cas['carriere-trois-champions']=m=>{titres(m,1,'c1');titres(m,1,'c2');titres(m,1,'c3');};
    cas['carriere-cinq-defenses']=m=>titres(m,6,'roi');
    cas['carriere-dix-victoires-suite']=m=>victoires(m,10,'dix');
    cas['carriere-cinquante-soirees']=m=>{m.eventsPlayed=50;};
    cas['carriere-caisse-cinq-cent-mille']=m=>{m.treasury=500;};
    cas['carriere-espoir-champion']=m=>{m.espoirs=['e'];m.suivis=['e'];m.hist=[F({a:{id:'e',W:4,L:0,D:0},b:{id:'x',W:2,L:1,D:0}})];m.facts=[{c:100,k:'title_fight',div:'H-light',fight:0}];};
    cas['carriere-premier-mondial']=m=>{m.roster=[{id:'p',div:'H-light',age:29,W:10,L:1,D:0}];};
    const resultats={};
    for(const id of Object.keys(cas)){ const m=base(); cas[id](m); m.lastEvent=m.lastEvent||{cycle:100,fights:[],touched:[],finance:{spectateurs:0,recette:0}}; resultats[id]=mgmtDefiReussi(m,id); }
    return {resultats,n:Object.keys(cas).length,connus:Object.keys(cas).every(id=>!!mgmtDefisTrouver(id))};
  })())`));
  assert.ok(r.n>=30,'au moins trente situations construites');
  assert.ok(r.connus,'chaque situation vise un défi connu');
  for(const [id,ok] of Object.entries(r.resultats)) assert.equal(ok,true,'défi réussi : '+id);
});

test('Lot 46 T1 — un défi réussi ne se perd jamais quand l’état change ensuite', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split'); m.cycle=100; m.eventsPlayed=7;
    const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
    m.roster=[trace('a',3,1),trace('b',2,2)];
    const f=(round)=>({c:100,slot:'main',rounds:3,seed:0,round,winner:'A',family:'ko',a:trace('a',3,1),b:trace('b',2,2)});
    m.hist=[f(1),f(1),f(1)];
    m.lastEvent={cycle:100,fights:[],touched:[],finance:{spectateurs:10,recette:1}};
    const gagnes=mgmtDefisSoiree(m);
    const cible=gagnes.find(x=>x.id==='soiree-trois-finitions-r1');
    m.hist=[]; m.lastEvent=null;
    const ligne=mgmtDefisListe(m).find(x=>x.id==='soiree-trois-finitions-r1');
    return {gagne:!!cible,s:cible&&cible.s,ligne,okApres:ligne.ok,sApres:ligne.s};
  })())`));
  assert.ok(r.gagne,'le défi est réussi à la clôture');
  assert.equal(r.s,7,'la soirée est notée');
  assert.equal(r.okApres,true,'il reste réussi après la disparition de l’état');
  assert.equal(r.sApres,7,'la soirée d’origine reste inscrite');
});

test('Lot 46 T1 — déterminisme : aucun tirage consommé, deux lectures identiques', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split'); m.cycle=100; m.eventsPlayed=20;
    const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
    m.hist=[{c:100,slot:'main',rounds:3,seed:0,round:2,winner:'A',family:'ko',a:trace('a',3,1),b:trace('b',9,1)}];
    const seed=SEED;
    const a=JSON.stringify(mgmtHistoiresSoiree(m,3)), b=JSON.stringify(mgmtHistoiresSoiree(m,3));
    const c=JSON.stringify(mgmtDefisListe(m));
    return {meme:a===b,rng:seed===SEED,liste:c===JSON.stringify(mgmtDefisListe(m)),seed:SEED};
  })())`));
  assert.ok(r.meme,'deux appels identiques');
  assert.ok(r.rng,'la graine n’a pas bougé');
  assert.ok(r.liste,'le carnet est stable');
});

test('Lot 46 T1 — partie ancienne : version inchangée, aucun m.defis créé, chargement et soirée sans erreur', () => {
  const win=newGameWindow({runMain:true});
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split');
    const avant=Object.prototype.hasOwnProperty.call(m,'defis');
    return {v:MGMT_SAVE_VERSION,avant,valide:validateMgmt(JSON.parse(JSON.stringify(m)))};
  })())`));
  assert.equal(r.v,21,'MGMT_SAVE_VERSION inchangé');
  assert.equal(r.avant,false,'une partie neuve ne porte pas m.defis');
  assert.ok(r.valide,'une partie sans m.defis reste valide');
  win.eval(`setSeed(20261008); mgmtPasseGenerer('split',{soirees:2});`);
  assert.doesNotThrow(()=>jouerSoirees(win,1),'une partie d’avant joue une soirée');
  const apres=JSON.parse(win.eval(`JSON.stringify((function(){ const m=G.mgmt; return {defis:m.defis===undefined?null:m.defis,valide:m.defis===undefined||mgmtDefisValide(m.defis)}; })())`));
  assert.ok(apres.valide,'m.defis reste valide après la soirée');
});

test('Lot 46 T1 — validation et réparation de m.defis', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split');
    const bon={ok:{'soiree-trois-finitions-r1':{s:3},'saison-vingt-victoires':{s:12}}};
    const inconnu={ok:{'defi-qui-nexiste-pas':{s:1}}};
    const mauvaisS={ok:{'soiree-trois-finitions-r1':{s:'3'}}};
    const mauvaisDefi={ok:{'soiree-trois-finitions-r1':{s:-1}}};
    const trop={ok:{}};
    for(const d of MGMT_DEFIS) trop.ok[d.id]={s:1};
    const enveloppe={pasOk:true};
    const avecBon=JSON.parse(JSON.stringify(m)); avecBon.defis=bon;
    const avecInconnu=JSON.parse(JSON.stringify(m)); avecInconnu.defis=inconnu;
    m.defis={ok:{'soiree-trois-finitions-r1':{s:5},'inconnu':{s:1},'saison-vingt-victoires':{s:'x'}}};
    const repare=mgmtRepair(m);
    return {bon:mgmtDefisValide(bon),inconnu:mgmtDefisValide(inconnu),mauvaisS:mgmtDefisValide(mauvaisS),
      mauvaisDefi:mgmtDefisValide(mauvaisDefi),trop:mgmtDefisValide(trop),enveloppe:mgmtDefisValide(enveloppe),
      valideBon:validateMgmt(avecBon),valideInconnu:validateMgmt(avecInconnu),repare:repare.defis};
  })())`));
  assert.equal(r.bon,true,'un m.defis bien formé passe');
  assert.equal(r.inconnu,false,'un identifiant inconnu est refusé');
  assert.equal(r.mauvaisS,false,'une soirée non entière est refusée');
  assert.equal(r.mauvaisDefi,false,'une soirée négative est refusée');
  assert.equal(r.trop,true,'quarante-trois entrées connues restent sous le plafond');
  assert.equal(r.enveloppe,false,'une enveloppe sans ok est refusée');
  assert.equal(r.valideBon,true,'validateMgmt accepte le champ');
  assert.equal(r.valideInconnu,false,'validateMgmt refuse un identifiant inconnu');
  assert.deepEqual(r.repare,{ok:{'soiree-trois-finitions-r1':{s:5}}},'la réparation ne garde que le lisible');
});

test('Lot 46 T1 — échappement : aucun texte de défi ne porte de balise, esc neutralise une donnée', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=mgmtDefault('split'); m.cycle=100; m.eventsPlayed=20;
    const trace=(id,W,L)=>({id,name:id,first:id,last:id,div:'H-light',age:29,W,L,D:0});
    m.hist=[{c:100,slot:'main',rounds:3,seed:0,round:2,winner:'A',family:'ko',a:trace('a',3,1),b:trace('b',2,2)}];
    m.facts=[{c:100,k:'surnom',a:'a',nom:'<b>Le Marteau</b>',t:'ko',s:20}];
    const histoires=mgmtHistoiresSoiree(m,20);
    const surnom=histoires.find(x=>x.type==='surnom');
    return {balises:MGMT_DEFIS.every(d=>!/[<>]/.test(d.titre+d.texte)),esc:esc('<b>Le Marteau</b>'),raison:surnom&&surnom.raison.nom};
  })())`));
  assert.ok(r.balises,'titres et textes sans balise');
  assert.equal(r.esc,'&lt;b&gt;Le Marteau&lt;/b&gt;','esc échappe');
  assert.equal(r.raison,'<b>Le Marteau</b>','la donnée reste brute, l’écran l’échappe');
});
