"use strict";
/* ==== [ANCRE: MGMT_LOT45_T1_TESTS] — Monde lot 45 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const fs=require('fs');
const path=require('path');

function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

/** Historiques minimaux : le calcul de rivalité ne dépend pas de la génération du monde. */
function historiqueRivalite(win,ev,rival=null,cycle=5){
  return result(win,`return mgmtRivaleDuMoment({cycle:${cycle},org:'Split',guerre:${JSON.stringify({ev,rival,depuis:0})}});`);
}

/** Crée une partie neuve avec monde vivant dans la fenêtre de test. */
function partieNeuve(win,graine='test123'){
  return result(win,`setSeed(duelFnv1a32('${graine}')); const m=mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(m,{soirees:6}); return m;`);
}

test('(1) Huit matchmakers, noms validés conservés, trois manières représentées, relu:false',()=>{
  const win=newGameWindow();
  const r=result(win,`return {ids:Object.keys(MGMT_MATCHMAKERS),count:Object.keys(MGMT_MATCHMAKERS).length,manieres:[...new Set(Object.values(MGMT_MATCHMAKERS).map(m=>m.maniere))],relus:Object.values(MGMT_MATCHMAKERS).every(m=>m.relu===false)&&MGMT_MATCHMAKER_PIQUES_RELU===false&&MGMT_RIVALITE_RAISONS_RELU===false,piques:Object.values(MGMT_MATCHMAKER_PIQUES).every(x=>x.length>=3),raisons:Object.values(MGMT_RIVALITE_RAISONS_PHRASES).every(x=>x.length>=3),korner:MGMT_MATCHMAKERS['mma-korner'].nom,knuckle:MGMT_MATCHMAKERS['organisation-6'].nom};`);
  assert.equal(r.count,8,'Huit organisations ont un matchmaker');
  assert.ok(r.manieres.includes('acheteur'),'Acheteur représenté');
  assert.ok(r.manieres.includes('formateur'),'Formateur représenté');
  assert.ok(r.manieres.includes('prudent'),'Prudent représenté');
  assert.ok(r.relus,'Tous ont relu:false');
  assert.ok(r.piques,'Au moins trois piques par manière');
  assert.ok(r.raisons,'Au moins trois phrases par raison');
  assert.equal(r.korner,'Ruud Verbeek','MMA Korner garde Ruud Verbeek');
  assert.equal(r.knuckle,'Siobhan Kerr','Knuckle Gate garde Siobhan Kerr');
});

test('(2) L\'acheteur agit plus souvent que le prudent sur 100 soirées simulées',()=>{
  const win=newGameWindow();
  let actionsAcheteur=0, actionsPrudent=0, dureeMaxMs=0;
  const m=partieNeuve(win,'seed1');
  for(let soiree=1;soiree<=100;soiree++){
    m.cycle=soiree;
    const debut=process.hrtime.bigint();
    win.eval(`G.mgmt=${JSON.stringify(m)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
    dureeMaxMs=Math.max(dureeMaxMs,Number(process.hrtime.bigint()-debut)/1e6);
    const r=result(win,`return {ev:G.mgmt.guerre?.ev||[],orgs:MGMT_MATCHMAKERS};`);
    for(const ev of r.ev){
      const mk=r.orgs[ev.o];
      if(mk && mk.maniere==='acheteur') actionsAcheteur++;
      if(mk && mk.maniere==='prudent') actionsPrudent++;
    }
    m.guerre=null;
  }
  assert.ok(actionsAcheteur>actionsPrudent,`Acheteur ${actionsAcheteur} > Prudent ${actionsPrudent}`);
  assert.ok(dureeMaxMs<300,`Clôture simulée sous 300 ms (${dureeMaxMs.toFixed(1)} ms max)`);
});

test('(3) Un combattant sous contrat n\'est JAMAIS pris',()=>{
  const win=newGameWindow();
  const base=partieNeuve(win,'contract-base');
  for(let seed=1;seed<=20;seed++){
    const m=JSON.parse(JSON.stringify(base));
    m.graine='seed'+seed;
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
  let r=historiqueRivalite(win,[]);
  assert.equal(r,null,'Pas de rivale sans événements');
  /* Cas 2 : événements faibles (< seuil) -> pas de rivale */
  r=historiqueRivalite(win,[{c:1,o:'garden-of-blood',t:'pique',x:null,p:3}]);
  assert.equal(r,null,'Pas de rivale sous le seuil');
  /* Cas 3 : rivale apparait au-dessus du seuil */
  r=historiqueRivalite(win,[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:4,o:'garden-of-blood',t:'meme-soir',x:null,p:6}]);
  assert.equal(r,'garden-of-blood','Rivale apparait au-dessus du seuil');
  /* Cas 4 : rivale change quand une autre prend nettement le dessus */
  r=historiqueRivalite(win,[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:5,o:'mma-korner',t:'pris',x:'f3',p:10},{c:5,o:'mma-korner',t:'agent',x:'f4',p:5},{c:5,o:'mma-korner',t:'parti',x:'f5',p:8},{c:5,o:'mma-korner',t:'voisin',x:null,p:4}], 'garden-of-blood');
  assert.equal(r,'mma-korner','Rivale change quand une autre dépasse');
  /* Cas 5 : hystérésis - la rivale ne change pas à chaque soirée pour un petit écart */
  r=historiqueRivalite(win,[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:5,o:'mma-korner',t:'pris',x:'f3',p:10},{c:5,o:'mma-korner',t:'agent',x:'f4',p:5}], 'garden-of-blood');
  assert.equal(r,'garden-of-blood','Hystérésis empêche le changement pour écart faible');
  const debut=process.hrtime.bigint();
  historiqueRivalite(win,[{c:5,o:'garden-of-blood',t:'pris',x:'f1',p:10},{c:5,o:'garden-of-blood',t:'agent',x:'f2',p:5},{c:4,o:'garden-of-blood',t:'meme-soir',x:null,p:6}]);
  const dureeMs=Number(process.hrtime.bigint()-debut)/1e6;
  assert.ok(dureeMs<300,`Calcul de rivalité sous 300 ms (${dureeMs.toFixed(1)} ms)`);
});

test('(5) La rivale diffère d\'une partie à l\'autre (aucune rivale imposée)',()=>{
  const win=newGameWindow();
  const rivales=new Set();
  const base=partieNeuve(win,'rival-base');
  for(let seed=1;seed<=20;seed++){
    const m=JSON.parse(JSON.stringify(base));
    m.graine='diff'+seed;
    win.eval(`G.mgmt=${JSON.stringify(m)}; mgmtOrgsAgir(G.mgmt); mgmtRivaleMettreAJour(G.mgmt);`);
    const r=result(win,`return mgmtRivaleDuMoment(G.mgmt);`);
    if(r) rivales.add(r);
  }
  assert.ok(rivales.size>=2,`Rivales différentes observées: ${[...rivales].join(', ')} (${rivales.size} distinctes)`);
});

test('(6) Les trois raisons sont des phrases lisibles sans undefined',()=>{
  const win=newGameWindow();
  const r=result(win,`const m={cycle:5,guerre:{ev:[{c:5,o:'mma-korner',t:'pris',x:'mg1',p:10},{c:5,o:'mma-korner',t:'meme-soir',x:null,p:6},{c:4,o:'mma-korner',t:'voisin',x:null,p:4}],rival:'mma-korner',depuis:5}}; return mgmtRivaleRaisons(m,'mma-korner');`);
  assert.ok(r.length>0,'Au moins une raison');
  assert.equal(r.length,3,'Les trois raisons les plus lourdes sont rendues');
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
  assert.ok(!/\brnd\s*\(/.test(codeOrgs),'mgmt-orgs-agissent.js n\'utilise pas de RNG globale');
  assert.ok(!/\brnd\s*\(/.test(codeRiv),'mgmt-rivalite-orgs.js n\'utilise pas de RNG globale');
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
  m.guerre.fondu={'garden-of-blood':{n:2,p:17}};
  r=result(win,`const m=${JSON.stringify(m)}; return validateMgmt(m);`);
  assert.ok(r,'Compteur fondu valide');
  const malformedCounter=JSON.parse(JSON.stringify(m));
  malformedCounter.guerre.fondu['garden-of-blood'].n=-1;
  r=result(win,`const m=${JSON.stringify(malformedCounter)}; return mgmtRepair(m);`);
  assert.ok(!r.guerre,'Compteur fondu malformé supprimé avec la guerre');
  const overflowing=JSON.parse(JSON.stringify(m));
  overflowing.guerre.ev=Array.from({length:41},(_,i)=>({c:i,o:'garden-of-blood',t:'pique',x:null,p:3}));
  r=result(win,`const m=${JSON.stringify(overflowing)}; return mgmtRepair(m);`);
  assert.equal(r.guerre.ev.length,40,'Réparation conserve au plus 40 événements');
  assert.equal(r.guerre.fondu['garden-of-blood'].n,3,'Événement ancien fondu dans le compteur');
  const source=result(win,`const src=MGMT_ACTU_SOURCES.find(x=>x.type==='rivale'); return src&&src.lire({guerre:{rival:'mma-korner',depuis:5}},['fighter'],0);`);
  assert.equal(source[0].type,'rivale','L’annonce de rivalité passe par le registre de presse');
  m.suivis=[m.roster[0].id];
  r=result(win,`const m=${JSON.stringify(m)}; return mgmtActualites(m).filter(x=>x.type==='rivale');`);
  const orgName=result(win,`return MGMT_ORGANISATIONS.find(o=>o.id==='garden-of-blood').nom;`);
  assert.ok(r.some(x=>x.titre===orgName+' devient ta rivale du moment'),'La presse publie le changement de rivale');
});

test('(10) Échappement d\'un nom hostile',()=>{
  const win=newGameWindow();
  const r=result(win,`const original=mgmtExteriorCombattant; mgmtExteriorCombattant=()=>({name:'<script>alert(1)</script>'}); const m={cycle:1,guerre:{ev:[{c:1,o:'garden-of-blood',t:'pris',x:'hostile',p:10}],rival:'garden-of-blood',depuis:1}}; const out=mgmtRivaleRaisons(m,'garden-of-blood'); mgmtExteriorCombattant=original; return out;`);
  assert.ok(r[0].raison.includes('&lt;script&gt;'),'Le nom hostile est échappé avant son insertion dans la phrase');
  assert.ok(!r[0].raison.includes('<script>'),'La phrase ne contient pas de balise active');
});
