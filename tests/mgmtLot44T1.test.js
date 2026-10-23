"use strict";
/* Cage Legacy — tests/mgmtLot44T1.test.js
   Monde lot 44 T1 : l'ambiance de salle entre deux combats, et les primes
   de la soirée. Aucun écran dans cette tranche : calculs, traces, caisse. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

function result(w,code){return JSON.parse(w.eval(`JSON.stringify((()=>{${code}})())`));}

/* Un combat terminé synthétique, lisible par mgmtSalleTypeCombat : le relevé
   porte les coups significatifs (coin A, colonne 0) et les knockdowns
   (colonne 10), comme mgmtReleveCoin les lit. */
const TRACE=`const trace=(m,h,o)=>{o=o||{};const t={c:Number.isSafeInteger(o.c)?o.c:(m.cycle||0),slot:o.slot||'main',seed:1,
  rounds:o.rounds||3,a:mgmtTraceSide(m.roster[(o.ia||0)%m.roster.length]),b:mgmtTraceSide(m.roster[(o.ib||1)%m.roster.length]),
  winner:o.winner||'A',family:o.family||'dec',round:o.round||3,h};
  t.s={d:900,c:[Array(17).fill(0),Array(17).fill(0)]};t.s.c[0][0]=o.sig||0;t.s.c[0][10]=o.kd||0;
  if(o.serre!==undefined)t.serre=o.serre;
  if(o.surprise){t.a.W=10;t.a.L=0;t.a.D=0;t.b.W=0;t.b.L=10;t.b.D=0;t.winner='B';}
  return t;};`;

test('Monde lot 44 T1 — l’ambiance monte sur une finition au 1er round et sur une surprise, retombe sur une décision molle, et ne change jamais pendant un combat',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);mgmtAgendaInit(m);
      mgmtAgendaPoser(m,m.cal.jour+10,'petite');${TRACE}
      const s0=mgmtSalleEtatInitial(m);
      const e1=mgmtSalleAmbiance(m,s0,trace(m,0,{family:'ko',round:1,sig:40}));
      const encore=mgmtSalleAmbiance(m,e1,trace(m,0,{family:'ko',round:1,sig:40}));
      const e2=mgmtSalleAmbiance(m,e1,trace(m,1,{family:'dec',round:3,sig:100,surprise:true}));
      const e3=mgmtSalleAmbiance(m,e2,trace(m,2,{family:'dec',round:3,sig:10}));
      return {p0:s0.palier,p1:e1.palier,p2:e2.palier,p3:e3.palier,t1:mgmtSalleTypeCombat(trace(m,0,{family:'ko',round:1,sig:40})),
        t2:mgmtSalleTypeCombat(trace(m,1,{family:'dec',round:3,sig:100,surprise:true})),t3:mgmtSalleTypeCombat(trace(m,2,{family:'dec',round:3,sig:10})),
        meme:encore===e1,memeH:encore.h===e1.h,phr:!!e1.phrase&&!!e2.phrase&&!!e3.phrase};`);
    assert.equal(r.p0,1);
    assert.equal(r.t1,'eclair');
    assert.ok(r.p1>r.p0,'une finition au 1er round fait monter la salle');
    assert.equal(r.t2,'surprise');
    assert.ok(r.p2>r.p1,'une surprise fait encore monter la salle');
    assert.equal(r.t3,'molle');
    assert.ok(r.p3<r.p2,'une décision molle fait retomber la salle');
    assert.ok(r.meme&&r.memeH,'le même combat ne met pas la salle à jour deux fois');
    assert.ok(r.phr);
  }finally{w.close();}
});

test('Monde lot 44 T1 — l’ordre des combats décide de la salle : la même carte jouée à l’envers ne finit pas au même palier',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);mgmtAgendaInit(m);
      mgmtAgendaPoser(m,m.cal.jour+10,'petite');${TRACE}
      const jouer=(premier)=>{let e=mgmtSalleEtatInitial(m);
        for(let i=0;i<2;i++){const eclair=i===premier;e=mgmtSalleAmbiance(m,e,trace(m,i,eclair?{family:'ko',round:1,sig:40}:{family:'dec',round:3,sig:10}));}
        return e;};
      const a=jouer(0),b=jouer(1);
      return {a:a.palier,b:b.palier,pa:a.phrase,pb:b.phrase};`);
    assert.equal(r.a,1,'éclair puis molle : +2 puis −2');
    assert.equal(r.b,2,'molle puis éclair : −1 puis +2');
    assert.notEqual(r.a,r.b);
  }finally{w.close();}
});

test('Monde lot 44 T1 — jamais deux fois la même phrase d’ambiance de suite',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);mgmtAgendaInit(m);
      mgmtAgendaPoser(m,m.cal.jour+10,'petite');${TRACE}
      const types=[{family:'ko',round:1,sig:40},{family:'dec',round:3,sig:10},{family:'dec',round:3,sig:100,surprise:true},
        {family:'dec',round:5,sig:120,kd:2},{family:'sub',round:3,sig:80},{family:'dec',round:3,sig:80}];
      let e=mgmtSalleEtatInitial(m),doublon=false,vides=0,prec='';
      for(let i=0;i<48;i++){e=mgmtSalleAmbiance(m,e,trace(m,i,types[i%types.length]));
        if(!e.phrase)vides++;if(e.phrase&&e.phrase===prec)doublon=true;prec=e.phrase;}
      return {doublon,vides,n:e.n,h:e.h};`);
    assert.equal(r.doublon,false);
    assert.equal(r.vides,0);
    assert.equal(r.n,48);
  }finally{w.close();}
});

/* Une soirée synthétique prête pour les primes : deux combats au moins,
   la caisse et les recettes alignées, `lastEvent` posé comme le fait la
   clôture (premier = index du premier combat de la soirée). */
const SOIREE=`const soiree=(m,cycle,combats)=>{m.cycle=cycle;m.eventsPlayed=cycle;m.treasury=500;m.recettes=[500];
  m.comptes=[{n:1,recette:500,taux:0.5}];m.hist=[];m.facts=[];
  combats.forEach((o,i)=>{const t=trace(m,i,Object.assign({c:cycle,ia:2*i,ib:2*i+1},o));delete t.h;m.hist.push(t);});
  m.lastEvent={cycle,premier:0,fights:m.hist.map(t=>({a:t.a.id,b:t.b.id,winner:t.winner,family:t.family,round:t.round})),touched:[],
    finance:{attraction:1,spectacle:0.5,audience:1,ticketing:200,tv:80,purses:100,bonuses:20,recette:160}};
  return mgmtPrimesSoiree(m);};`;

test('Monde lot 44 T1 — le combat de la soirée et deux performances distinctes tombent sur les combats que les relevés désignent',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const a=soiree(m,1,[{slot:'prelim',family:'dec',round:3,sig:80},{slot:'main',family:'ko',round:1,sig:40}]);
      const idsA=a.filter(x=>x.type==='pf').map(x=>x.a);
      const csA=a.find(x=>x.type==='cs');
      const b=soiree(m,2,[{slot:'prelim',family:'ko',round:1,sig:40},{slot:'main',family:'dec',round:5,sig:120,kd:2,rounds:5}]);
      const csB=b.find(x=>x.type==='cs');
      const idsB=b.filter(x=>x.type==='pf').map(x=>x.a);
      const c=soiree(m,3,[{slot:'main',family:'dec',round:3,sig:10}]);
      return {a:a.map(x=>x.type),csA:csA&&csA.fight.slot,idsA,expA:[m.roster[2].id,m.roster[3].id],distinctA:new Set(idsA).size,
        b:b.map(x=>x.type),csBi:csB&&csB.i,csBkd:csB&&csB.fight.s&&csB.fight.s.c[0][10],idsB,expB:[m.roster[0].id,m.roster[1].id],distinctB:new Set(idsB).size,
        c:c.length,pr3:m.lastEvent.finance.primes,tres3:m.treasury};`);
    assert.deepEqual(r.a,['cs','pf','pf']);
    assert.equal(r.csA,'main');
    assert.equal(r.distinctA,2);
    assert.deepEqual(r.idsA,r.expA);
    assert.deepEqual(r.b,['cs','pf','pf']);
    assert.equal(r.csBi,1);
    assert.equal(r.csBkd,2);
    assert.deepEqual(r.idsB,r.expB);
    assert.equal(r.distinctB,2);
    assert.equal(r.c,0);
    assert.equal(r.pr3,0);
    assert.equal(r.tres3,500);
  }finally{w.close();}
});

test('Monde lot 44 T1 — la caisse paie exactement les primes, et la recette, les deux dernières recettes et le compte de la soirée suivent',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const a=soiree(m,1,[{slot:'prelim',family:'dec',round:3,sig:80},{slot:'main',family:'ko',round:1,sig:40}]);
      const cs=a.find(x=>x.type==='cs'),pf=a.filter(x=>x.type==='pf');
      const attendu=2*cs.montant+pf.reduce((n,x)=>n+x.montant,0);
      return {total:mgmtPrimesTotal(a),attendu,tres:m.treasury,recette:m.lastEvent.finance.recette,primes:m.lastEvent.finance.primes,
        recettes:m.recettes.slice(),compte:m.comptes[0].recette,cs:cs.montant,pf:pf.map(x=>x.montant),negatif:m.lastEvent.finance.recette<0};`);
    assert.equal(r.total,r.attendu);
    assert.equal(r.primes,r.attendu);
    assert.equal(r.tres,500-r.attendu);
    assert.equal(r.recette,160-r.attendu);
    assert.deepEqual(r.recettes,[160-r.attendu]);
    assert.equal(r.compte,160-r.attendu);
    assert.ok(r.cs>=1&&r.pf.length===2&&r.pf.every(x=>x>=1));
    assert.ok(r.negatif===false);
  }finally{w.close();}
});

test('Monde lot 44 T1 — sur quarante soirées réelles, les primes restent sous 3 % des recettes brutes',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(4401);(function(){const m=mgmtDefault('split');m.graine=mgmtGraineNeuve();mgmtNewRoster(m);mgmtNewPile(m);
      G={theme:'dark',mgmt:m};mgmtAgendaInit(m);})()`);
    let brut=0,primes=0,soirees=0;
    for(let k=0;k<40;k++){
      const n=jouerSoirees(w,1,{});
      if(!n) break;
      const f=JSON.parse(w.eval('JSON.stringify(G.mgmt.lastEvent&&G.mgmt.lastEvent.finance||null)'));
      if(!f) break;
      brut+=(f.ticketing||0)+(f.tv||0);
      primes+=Number.isSafeInteger(f.primes)?f.primes:0;
      assert.ok(!Number.isFinite(f.primes)||f.primes>=0);
      soirees++;
    }
    assert.equal(soirees,40);
    assert.ok(brut>0);
    assert.ok(primes/brut<0.03,`primes ${primes} / brut ${brut} = ${(primes/brut*100).toFixed(2)} %`);
  }finally{w.close();}
});

test('Monde lot 44 T1 — un préliminaire ordinaire ne reçoit rien quand un combat principal est notable',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const a=soiree(m,1,[{slot:'prelim',family:'dec',round:3,sig:80},{slot:'main',family:'ko',round:1,sig:40}]);
      const prel=[m.hist[0].a.id,m.hist[0].b.id];
      return {csSlot:a.find(x=>x.type==='cs').fight.slot,pr0:m.hist[0].pr,
        faitsPrel:m.facts.filter(f=>f.k==='prime'&&prel.includes(f.a)).length,
        types:a.map(x=>x.type)};`);
    assert.equal(r.csSlot,'main');
    assert.equal(r.pr0,undefined);
    assert.equal(r.faitsPrel,0);
    assert.deepEqual(r.types,['cs','pf','pf']);
  }finally{w.close();}
});

test('Monde lot 44 T1 — l’option « ambiance de salle » est allumée par défaut et ne change jamais les primes',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const carte=[{slot:'prelim',family:'dec',round:3,sig:80},{slot:'main',family:'ko',round:1,sig:40}];
      const a=soiree(m,1,carte);const t1=m.treasury,f1=JSON.stringify(m.facts);
      MGMT_REGLAGES.affichage.salleAmbiance=false;const actif=mgmtSalleAmbianceActive();
      const b=soiree(m,1,carte);const t2=m.treasury,f2=JSON.stringify(m.facts);
      MGMT_REGLAGES.affichage.salleAmbiance=true;
      return {defaut:MGMT_REGLAGES.affichage.salleAmbiance===true,active:mgmtSalleAmbianceActive(),actif,
        memePrix:JSON.stringify(a)===JSON.stringify(b)&&t1===t2&&f1===f2,
        ligne:MGMT_OP_LIGNES.affichage.some(l=>l.cle==='salleAmbiance')};`);
    assert.equal(r.defaut,true);
    assert.equal(r.active,true);
    assert.equal(r.actif,false);
    assert.equal(r.memePrix,true);
    assert.equal(r.ligne,true);
  }finally{w.close();}
});

test('Monde lot 44 T1 — ambiance et primes sont déterministes, sans Math.random ni rnd()',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const e0=mgmtSalleEtatInitial(m);
      const x=mgmtSalleAmbiance(m,e0,trace(m,0,{family:'ko',round:1,sig:40}));
      const y=mgmtSalleAmbiance(m,e0,trace(m,0,{family:'ko',round:1,sig:40}));
      const meme=JSON.stringify(x)===JSON.stringify(y);
      const carte=[{slot:'prelim',family:'dec',round:5,sig:120,kd:2,rounds:5},{slot:'main',family:'ko',round:1,sig:40}];
      const a=soiree(m,1,carte);const t1=m.treasury,fa=JSON.stringify(m.facts),h1=JSON.stringify(m.hist.map(t=>t.pr));
      const b=soiree(m,1,carte);const t2=m.treasury,fb=JSON.stringify(m.facts),h2=JSON.stringify(m.hist.map(t=>t.pr));
      return {meme,primes:JSON.stringify(a)===JSON.stringify(b),caisse:t1===t2,faits:fa===fb,marques:h1===h2,
        sansRnd:!String(mgmtSalleAmbiance).includes('rnd(')&&!String(mgmtPrimesSoiree).includes('rnd(')};`);
    assert.equal(r.meme,true);
    assert.equal(r.primes,true);
    assert.equal(r.caisse,true);
    assert.equal(r.faits,true);
    assert.equal(r.marques,true);
    assert.equal(r.sansRnd,true);
  }finally{w.close();}
});

test('Monde lot 44 T1 — validation stricte des clés neuves et réparation sans perte d’une ancienne partie',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=result(w,`setSeed(4401);const m=mgmtDefault('split');mgmtNewRoster(m);mgmtNewPile(m);${TRACE}${SOIREE}
      const a=soiree(m,1,[{slot:'main',family:'ko',round:1,sig:40}]);
      m.soirees=mgmtSalleAmbiance(m,mgmtSalleEtatInitial(m),trace(m,0,{family:'ko',round:1,sig:40}));
      const base=JSON.parse(JSON.stringify(m));
      const vbase=JSON.parse(JSON.stringify(base));
      const valide=mgmtParseAndValidate(mgmtSerialiser(vbase))!==null;
      const diag={tr:mgmtValidFightTrace(base.hist[0]),ev:mgmtValidEvent(base.lastEvent),so:mgmtSalleEtatValide(base.soirees),sa:mgmtSallesValide(base),h:base.hist.length,lf:Object.keys(base.lastEvent||{})};
      const ancien=mgmtDefault();mgmtNewRoster(ancien);mgmtNewPile(ancien);
      const ancienOk=mgmtParseAndValidate(mgmtSerialiser(ancien))!==null;
      const tr=trace(m,0,{family:'ko',round:1,sig:40});delete tr.h;
      const traceOk=mgmtValidFightTrace(Object.assign({},tr,{pr:'cs'}));
      const traceKo=mgmtValidFightTrace(Object.assign({},tr,{pr:'xx'}));
      const etatOk=mgmtSalleEtatValide(m.soirees),etatKo=mgmtSalleEtatValide({palier:9});
      const fait={c:m.cycle,k:'prime',a:tr.a.id,fight:0,type:'cs',m:2};
      const faitOk=mgmtPrimeFactValide(fait,m.hist),faitKo=mgmtPrimeFactValide(Object.assign({},fait,{m:0}),m.hist);
      const rep=JSON.parse(JSON.stringify(base));rep.hist[0].pr='xx';rep.soirees={bad:1};
      rep.facts.push({c:m.cycle,k:'prime',a:'zz',fight:0,type:'cs',m:2});rep.lastEvent.finance.primes=-3;mgmtRepair(rep);      return {valide,ancienOk,traceOk,traceKo,etatOk,etatKo,faitOk,faitKo,
        repPr:rep.hist[0].pr,repSo:rep.soirees,repFaits:rep.facts.filter(f=>f.k==='prime').length,repBad:rep.facts.filter(f=>f.k==='prime'&&f.a==='zz').length,
        repFin:rep.lastEvent.finance.primes,repPremier:rep.lastEvent.premier,hist:rep.hist.length};`);
    assert.equal(r.valide,true);
    assert.equal(r.ancienOk,true);
    assert.equal(r.traceOk,true);
    assert.equal(r.traceKo,false);
    assert.equal(r.etatOk,true);
    assert.equal(r.etatKo,false);
    assert.equal(r.faitOk,true);
    assert.equal(r.faitKo,false);
    assert.equal(r.repPr,undefined);
    assert.equal(r.repSo,undefined);
    assert.equal(r.repBad,0);
    assert.equal(r.repFaits,4);
    assert.equal(r.repFin,undefined);
    assert.equal(r.repPremier,0);
  }finally{w.close();}
});
