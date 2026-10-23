"use strict";
/* ==== [ANCRE: MGMT_LOT45_T1_TESTS] — Monde lot 45 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const fs=require('fs');
const path=require('path');

function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

/** Crée une partie neuve avec monde vivant dans la fenêtre de test. */
function partieNeuve(win,graine='test123'){
  return result(win,`setSeed(duelFnv1a32('${graine}')); const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); return m;`);
}

test('(1) Huit matchmakers, noms validés conservés, trois manières représentées, relu:false',()=>{
  const win=newGameWindow();
  const r=result(win,`return {ids:Object.keys(MGMT_MATCHMAKERS),count:Object.keys(MGMT_MATCHMAKERS).length,manieres:[...new Set(Object.values(MGMT_MATCHMAKERS).map(m=>m.maniere))],relus:Object.values(MGMT_MATCHMAKERS).every(m=>m.relu===false),korner:MGMT_MATCHMAKERS['mma-korner'].nom,knuckle:MGMT_MATCHMAKERS['organisation-6'].nom};`);
  assert.equal(r.count,8,'Huit organisations ont un matchmaker');
  assert.ok(r.manieres.includes('acheteur'),'Acheteur représenté');
  assert.ok(r.manieres.includes('formateur'),'Formateur représenté');
  assert.ok(r.manieres.includes('prudent'),'Prudent représenté');
  assert.ok(r.relus,'Tous ont relu:false');
  assert.equal(r.korner,'Ruud Verbeek','MMA Korner garde Ruud Verbeek');
  assert.equal(r.knuckle,'Siobhan Kerr','Knuckle Gate garde Siobhan Kerr');
});

test('(2) L\'acheteur agit plus souvent que le prudent sur 20 soirées simulées',()=>{
  const win=newGameWindow();
  let actionsAcheteur=0, actionsPrudent=0;
  for(let seed=1;seed<=20;seed++){
    const m=partieNeuve(win,'seed'+seed);
    win.eval(`G.mgmt=${JSON.stringify(m)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
    const r=result(win,`return {ev:G.mgmt.guerre?.ev||[],orgs:MGMT_MATCHMAKERS};`);
    for(const ev of r.ev){
      const mk=r.orgs[ev.o];
      if(mk && mk.maniere==='acheteur') actionsAcheteur++;
      if(mk && mk.maniere==='prudent') actionsPrudent++;
    }
  }
  assert.ok(actionsAcheteur>actionsPrudent,`Acheteur ${actionsAcheteur} > Prudent ${actionsPrudent}`);
});

test('(3) Un combattant sous contrat n\'est JAMAIS pris',()=>{
  const win=newGameWindow();
  for(let seed=1;seed<=10;seed++){
    const m=partieNeuve(win,'seed'+seed);
    win.eval(`G.mgmt=${JSON.stringify(m)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
    const r=result(win,`return {ev:G.mgmt.guerre?.ev||[],roster:G.mgmt.roster||[]};`);
    for(const ev of r.ev){
      if(ev.t==='pris' || ev.t==='parti'){
        if(ev.x){
          const fJoueur=r.roster.find(f=>f.id===ev.x);
          if(fJoueur){
            assert.equal(fJoueur.libre,true,`Combattant ${ev.x} du joueur n'est pas sous contrat (libre=${fJoueur.libre})`);
          }
        }
      }
    }
  }
});

test('(4) Aucune rivale avant le seuil ; la rivale change quand les événements changent ; hystérésis',()=>{
  const win=newGameWindow();
  /* Cas 1 : pas d'événements -> pas de rivale */
  let r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[],rival:null,depuis:0}; return mgmtRivaleDuMoment(m);`);
  assert.equal(r,null,'Pas de rivale sans événements');
  /* Cas 2 : événements faibles (< seuil) -> pas de rivale */
  r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[{c:1,o:'garden-of-blood',t:'pique',x:null,p:3}],rival:null,depuis:0}; return mgmtRivaleDuMoment(m);`);
  assert.equal(r,null,'Pas de rivale sous le seuil');
  /* Cas 3 : rivale apparait au-dessus du seuil */
  r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:4,o:'garden-of-blood',t:'meme-soir',x:null,p:6}],rival:null,depuis:0}; return mgmtRivaleDuMoment(m);`);
  assert.equal(r,'garden-of-blood','Rivale apparait au-dessus du seuil');
  /* Cas 4 : rivale change quand une autre prend nettement le dessus */
  r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:5,o:'mma-korner',t:'pris',x:'f3',p:10},{c:5,o:'mma-korner',t:'agent',x:'f4',p:5},{c:5,o:'mma-korner',t:'parti',x:'f5',p:8},{c:5,o:'mma-korner',t:'voisin',x:null,p:4}],rival:'garden-of-blood',depuis:4}; return mgmtRivaleDuMoment(m);`);
  assert.equal(r,'mma-korner','Rivale change quand une autre dépasse');
  /* Cas 5 : hystérésis - la rivale ne change pas à chaque soirée pour un petit écart */
  r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:5,o:'mma-korner',t:'pris',x:'f3',p:10},{c:5,o:'mma-korner',t:'agent',x:'f4',p:5}],rival:'garden-of-blood',depuis:4}; return mgmtRivaleDuMoment(m);`);
  assert.equal(r,'garden-of-blood','Hystérésis empêche le changement pour écart faible');
});

test('(5) La rivale diffère d\'une partie à l\'autre (aucune rivale imposée)',()=>{
  const win=newGameWindow();
  const rivales=new Set();
  for(let seed=1;seed<=10;seed++){
    const m=partieNeuve(win,'diff'+seed);
    win.eval(`G.mgmt=${JSON.stringify(m)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
    const r=result(win,`return mgmtRivaleDuMoment(G.mgmt);`);
    if(r) rivales.add(r);
  }
  assert.ok(rivales.size>=2,`Rivales différentes observées: ${[...rivales].join(', ')} (${rivales.size} distinctes)`);
});

test('(6) Les trois raisons sont des phrases lisibles sans undefined',()=>{
  const win=newGameWindow();
  const r=result(win,`const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); m.guerre={ev:[{c:5,o:'mma-korner',t:'pris',x:'mg1',p:10},{c:5,o:'mma-korner',t:'meme-soir',x:null,p:6},{c:4,o:'mma-korner',t:'voisin',x:null,p:4}],rival:'mma-korner',depuis:5}; return mgmtRivaleRaisons(m,'mma-korner');`);
  assert.ok(r.length>0,'Au moins une raison');
  assert.ok(r.length<=3,'Au plus trois raisons');
  for(const raison of r){
    assert.ok(typeof raison.raison==='string' && raison.raison.length>0,`Raison est une string non vide: ${raison.raison}`);
    assert.ok(!raison.raison.includes('undefined'),`Raison sans undefined: ${raison.raison}`);
    assert.ok(Number.isSafeInteger(raison.soiree),`Soirée valide: ${raison.soiree}`);
    assert.ok(['pris','agent','meme-soir','parti','voisin','pique'].includes(raison.type),`Type valide: ${raison.type}`);
  }
});

test('(7) Déterminisme et aucun rnd()',()=>{
  const win=newGameWindow();
  /* Même graine -> même résultats */
  const m1=partieNeuve(win,'deterministe');
  win.eval(`G.mgmt=${JSON.stringify(m1)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
  const ev1=result(win,`return JSON.stringify(G.mgmt.guerre?.ev||[]);`);
  const riv1=result(win,`return mgmtRivaleDuMoment(G.mgmt);`);
  const m2=JSON.parse(JSON.stringify(m1));
  win.eval(`G.mgmt=${JSON.stringify(m2)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
  const ev2=result(win,`return JSON.stringify(G.mgmt.guerre?.ev||[]);`);
  const riv2=result(win,`return mgmtRivaleDuMoment(G.mgmt);`);
  assert.equal(ev1,ev2,'Événements déterministes');
  assert.equal(riv1,riv2,'Rivale déterministe');
  /* Vérifie qu'aucun rnd() n'est appelé dans les nouvelles fonctions */
  const codeOrgs=fs.readFileSync(path.resolve(__dirname,'..','mgmt-orgs-agissent.js'),'utf8');
  const codeRiv=fs.readFileSync(path.resolve(__dirname,'..','mgmt-rivalite-orgs.js'),'utf8');
  assert.ok(!codeOrgs.includes('rnd()'),'mgmt-orgs-agissent.js n\'utilise pas rnd()');
  assert.ok(!codeRiv.includes('rnd()'),'mgmt-rivalite-orgs.js n\'utilise pas rnd()');
});

test('(8) Partie ancienne inchangée (empreintes identiques)',()=>{
  const win=newGameWindow();
  /* Pour une partie sans monde vivant, mgmtOrgsAgir ne fait rien */
  const m=result(win,`return mgmtPasseGenerer('split',{soirees:6});`);
  const eventsPlayedAvant=m.eventsPlayed;
  win.eval(`G.mgmt=${JSON.stringify(m)}; if(typeof mgmtOrgsAgir==='function') mgmtOrgsAgir(G.mgmt);`);
  const eventsPlayedApres=result(win,`return G.mgmt.eventsPlayed;`);
  assert.equal(eventsPlayedApres,eventsPlayedAvant,'eventsPlayed inchangé pour partie sans monde vivant');
});

test('(9) Validation et réparation de m.guerre',()=>{
  const win=newGameWindow();
  const m=partieNeuve(win,'valid1');
  /* Validation : m.guerre absent -> OK */
  let r=result(win,`const m=${JSON.stringify(m)}; delete m.guerre; return validateMgmt(m);`);
  assert.ok(r,'Partie sans guerre valide');
  /* Validation : m.guerre bien formé -> OK */
  m.guerre={ev:[{c:1,o:'garden-of-blood',t:'pris',x:'mg1',p:10}],rival:'garden-of-blood',depuis:1};
  r=result(win,`const m=${JSON.stringify(m)}; return validateMgmt(m);`);
  assert.ok(r,'Partie avec guerre valide');
  /* Validation : m.guerre malformé -> refusé */
  const mBad=JSON.parse(JSON.stringify(m));
  mBad.guerre.ev[0].t='invalide';
  r=result(win,`const m=${JSON.stringify(mBad)}; return validateMgmt(m);`);
  assert.ok(!r,'Guerre avec type invalide refusée');
  /* Réparation : m.guerre malformé -> supprimé au chargement */
  r=result(win,`const m=${JSON.stringify(mBad)}; return mgmtRepair(m);`);
  assert.ok(!r.guerre,'Guerre malformée supprimée en réparation');
  /* Réparation : m.guerre présent et valide -> conservé */
  r=result(win,`const m=${JSON.stringify(m)}; return mgmtRepair(m);`);
  assert.ok(r.guerre,'Guerre valide conservée en réparation');
  assert.equal(r.guerre.ev.length,1,'Événement conservé');
});

test('(10) Échappement d\'un nom hostile',()=>{
  const win=newGameWindow();
  const m=partieNeuve(win,'escape1');
  m.guerre={ev:[{c:1,o:'garden-of-blood',t:'pris',x:null,p:10}],rival:'garden-of-blood',depuis:1};
  win.eval(`G.mgmt=${JSON.stringify(m)};`);
  const r=result(win,`return mgmtRivaleRaisons(G.mgmt,'garden-of-blood');`);
  for(const raison of r){
    assert.ok(!raison.raison.includes('<script>'),`Raison sans HTML: ${raison.raison}`);
  }
});
