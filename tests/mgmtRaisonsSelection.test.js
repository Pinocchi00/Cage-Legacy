"use strict";
/* ==== [ANCRE: MONDE_LOT6_T2_TESTS] — Monde lot 6 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});
win.eval(`setSeed(9); window.RAISON_BASE=mgmtDefault(); mgmtNewRoster(RAISON_BASE); mgmtExteriorEnsure(RAISON_BASE);`);
const debut=`const m=JSON.parse(JSON.stringify(RAISON_BASE)); m.hist=[]; m.facts=[]; m.cycle=20;
  const div=m.roster[0].div; let [A,B,C]=m.roster.filter(f=>f.div===div);
  const combat=(a,b,winner='A',c=18)=>m.hist.push({a:{id:a.id,W:a.W,L:a.L,D:a.D},b:{id:b.id,W:b.W,L:b.L,D:b.D},winner,c,slot:'prelim',family:'dec',round:3,rounds:3});
  const lit=(a=A,b=B)=>mgmtRaisonsPourPaire(m,a,b);
  const tire=famille=>mgmtPickBulkPair(m,new Set(),new Set(),null,0,{total:0,streak:0},false,famille);`;
const resultat=code=>JSON.parse(win.eval(`JSON.stringify((()=>{${debut}${code}})())`));
const remplir=`for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){
  const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
  for(const a of rows){const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id));
    if(b&&mgmtBookMain(m,a.id,b.id)){ok=true;break;}}
  if(!ok) break;
}`;

test('Monde lot 6 T2 — la famille demandée précède le choix de paire',()=>{
  const r=resultat(`setSeed(20261008); m.roster=[A,B,C]; m.card.main=[];m.card.prelims=[];m.champions={};
    A.lastCycle=B.lastCycle=18; C.lastCycle=0; combat(A,B);
    const p=tire('revanche'); const unknown=tire('inconnue');m.hist=[];
    return [p&&[p.a.id,p.b.id].sort(),[A.id,B.id].sort(),p&&p.raison,unknown,tire('revanche')];`);
  assert.deepEqual(r[0],r[1]);assert.equal(r[2].famille,'revanche');
  assert.equal(r[2].fait.i,0);assert.equal(r[3],null);assert.equal(r[4],null);
});

test('Monde lot 6 T2 — la revanche choisie cite le vrai vainqueur',()=>{
  for(const winner of ['A','B','D']){
    for(const inverse of [false,true]){
      const r=resultat(`m.roster=[A,B];m.card.main=[];m.card.prelims=[];m.champions={};
        A.lastCycle=B.lastCycle=18; combat(${inverse?'B,A':'A,B'},'${winner}',18);
        const p=tire('revanche'),t=m.hist[0];return [p&&p.raison.fait,
          t.winner==='A'?t.a.id:t.b.id,t.winner==='A'?t.b.id:t.a.id];`);
      if(winner==='D') assert.equal(r[0],null);
      else assert.deepEqual(r[0],{source:'hist',i:0,c:18,gagnant:r[1],perdant:r[2]});
    }
  }
});

/* ==== [ANCRE: MONDE_LOT6_T2_TEST_POPULATION] — Monde lot 6 T2 ==== */
let population;
function blocs(){
  if(population) return population;
  population=JSON.parse(win.eval(`JSON.stringify((()=>{
    const blocs=[], violations={paire:0,prenom:0,division:0,indisponible:0,engage:0,champion:0,reserve:0,suspendu:0,revanche:0};
    for(let seed=20261001;seed<=20261020;seed++) for(const org of MGMT_ORGANISATIONS){
      setSeed(seed);const m=mgmtDefault(org.id);mgmtNewRoster(m);mgmtExteriorEnsure(m);${remplir}
      const n=m.card.sizePrelims,ps=mgmtBulkSelection(m,new Set(),new Set(),n,mgmtCrushStats(m),false);
      if(!ps){blocs.push({seed,org:org.id,n,ps:null});continue;}
      const seen=new Set(),used=new Set(),ch=mgmtChampionIds(m);let last=null,run=0;
      for(const p of ps){const key=[p.a.id,p.b.id].sort().join('|');
        if(seen.has(key))violations.paire++;seen.add(key);
        run=p.div===last?run+1:1;last=p.div;if(run>=3)violations.division++;
        for(const f of [p.a,p.b]){
          if(used.has(f.first))violations.prenom++;used.add(f.first);
          if(!mgmtAvailable(m,f))violations.indisponible++;
          if(mgmtEngaged(m,f))violations.engage++;
          if(ch.has(f.id))violations.champion++;
          if(mgmtAgendaReserve(m,f))violations.reserve++;
          if(f.susp>m.cycle)violations.suspendu++;
        }
        if(m.lastEvent?.fights?.some(f=>[f.a,f.b].sort().join('|')===key))violations.revanche++;
      }
      blocs.push({seed,org:org.id,n,main:m.card.main.length,sizeMain:m.card.sizeMain,
        ps:ps.map(p=>({famille:p.raison.famille,preuve:mgmtRaisonsPourPaire(m,p.a,p.b).some(r=>JSON.stringify(r)===JSON.stringify(p.raison))}))});
    }
    return {blocs,violations};
  })())`));
  return population;
}
test('Monde lot 6 T2 — vingt graines et huit organisations ne répètent aucune famille',()=>{
  const {blocs:bs}=blocs();assert.equal(bs.length,160);
  for(const b of bs){assert.ok(b.ps,JSON.stringify(b));assert.equal(b.main,b.sizeMain);
    assert.equal(b.ps.length,b.n);assert.equal(new Set(b.ps.map(p=>p.famille)).size,b.n);
    assert.ok(b.ps.every(p=>p.preuve),JSON.stringify(b));}
});
test('Monde lot 6 T2 — le bloc strict conserve paires prénoms et catégories variés',()=>{
  assert.deepEqual(blocs().violations,{paire:0,prenom:0,division:0,indisponible:0,engage:0,champion:0,reserve:0,suspendu:0,revanche:0});
});

test('Monde lot 6 T2 — une proposition neuve utilise la sélection sans changer son format',()=>{
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{setSeed(7);const m=mgmtDefault();mgmtNewRoster(m);mgmtExteriorEnsure(m);${remplir}
    const original=mgmtBulkSelection;let calls=0;
    mgmtBulkSelection=(...args)=>{calls++;return original(...args);};
    try{const aff=mgmtNewBulkAffair(m,new Set(),new Set(),false);return {calls,aff,n:m.card.sizePrelims-m.card.prelims.length};}
    finally{mgmtBulkSelection=original;}
  })())`));
  assert.equal(r.calls,1);assert.ok(r.aff);assert.equal(r.aff.fights.length,r.n);
  assert.equal(JSON.stringify(r.aff).includes('raison'),false);
  for(const f of r.aff.fights)assert.deepEqual(Object.keys(f).sort(),['a','b','sloppy','slot','warned']);
});
test('Monde lot 6 T2 — le manque de familles ne produit pas de bloc partiel',()=>{
  assert.deepEqual(resultat(`setSeed(9);m.roster=[A,B];m.card.main=[];m.card.prelims=[];m.champions={};
    const used=new Set(['déjà']),seen=new Set(['déjà|vu']),before=JSON.stringify(m);
    const ps=mgmtBulkSelection(m,used,seen,2,{total:0,streak:0},false);
    return [ps,[...used],[...seen],before===JSON.stringify(m)];`),[null,['déjà'],['déjà|vu'],true]);
});

/* ==== [ANCRE: MONDE_LOT6_T2_TEST_INDEX] — Monde lot 6 T2 ==== */
const positifs=[
  ['revanche',`combat(A,B);`],
  ['rivalite-ouverte',`m.facts=[{k:'demande',a:A.id,target:B.id,want:'revanche',c:20}];`],
  ['series-croisees',`for(let i=0;i<3;i++){combat(A,C,'A',i);combat(B,C,'A',i);}`],
  ['classement-voisin',`const rang=mgmtClassementLignes(m,div,'organization');A=mgmtFighterById(m,rang[0].id);B=mgmtFighterById(m,rang[1].id);`],
  ['test-jeune',`A.age=24;A.W=1;A.L=0;A.D=0;B.age=33;`],
  ['derniere-chance',`combat(C,A);combat(C,A);`],
  ['longue-attente',`A.lastCycle=B.lastCycle=0;`],
  ['demande-promesse',`m.facts=[{k:'promesse',a:A.id,target:B.id,want:'revanche',c:19,due:22}];`],
  ['fin-contrat',`A.ct={n:3,f:2,since:20};`],
  ['styles-opposes',`const choisis={};for(let i=0;i<300&&Object.keys(choisis).length<2;i++){const f={...A,id:'style-'+i,W:12,L:0,D:0};const t=mgmtCarteStyleBilan(m,f).t;if(t==='Finit par KO'||t==='Finit au sol')choisis[t]=f;}Object.assign(A,choisis['Finit par KO']);Object.assign(B,choisis['Finit au sol']);`],
  ['derby',`A.ck=B.ck='FR';`],['debuts',``],['veteran',`A.age=33;`],
  ['reclame-public',`combat(A,B,'A',19);m.hist[0].slot='main';m.hist[0].family='ko';m.hist[0].round=1;m.hist[0].a.W=1;m.hist[0].a.L=2;m.hist[0].b.W=8;m.hist[0].b.L=0;`],
  ['meme-categorie-jamais-affrontes',``]
];
test('Monde lot 6 T2 — la lecture groupée égale les lectures unitaires et reste pure',()=>{
  for(const [famille,code] of positifs){
    assert.deepEqual(resultat(`${code}const before=JSON.stringify(m),g=JSON.stringify(G),seed=SEED,memo={...MGMT_ROLES_MEMO};
      const index=mgmtRaisonsIndex(m,[[A,B],[B,A],[A,C]]),key=[A.id,B.id].sort().join('|');
      const x=index.get(key),y=lit(),z=mgmtRaisonsIndex(m,[[B,A]]).get(key);
      return [x.some(r=>r.famille==='${famille}'),JSON.stringify(x)===JSON.stringify(y),JSON.stringify(x)===JSON.stringify(z),
        JSON.stringify(index.get([A.id,C.id].sort().join('|')))===JSON.stringify(lit(A,C)),
        before===JSON.stringify(m),g===JSON.stringify(G),seed===SEED,Object.keys(memo).every(k=>memo[k]===MGMT_ROLES_MEMO[k])];`),Array(8).fill(true),famille);
  }
  assert.deepEqual(resultat(`const original=mgmtRaisonsIndex;let calls=0,unique=true;
    mgmtRaisonsIndex=(m,ps)=>{calls++;unique=new Set(ps.map(p=>p.map(f=>f.id).sort().join('|'))).size===ps.length;return original(m,ps);};
    try{const ps=mgmtBulkSelection(m,new Set(),new Set(),4,{total:0,streak:0},false);return [calls,unique,ps?.length];}
    finally{mgmtRaisonsIndex=original;}`),[1,true,4]);
});
test('Monde lot 6 T2 — une même graine donne les mêmes familles paires et tirages',()=>{
  const results=[];
  for(let i=0;i<2;i++){
    const w=newGameWindow({runMain:true});
    results.push(w.eval(`(()=>{setSeed(9);window.RAISON_BASE=mgmtDefault();mgmtNewRoster(RAISON_BASE);mgmtExteriorEnsure(RAISON_BASE);
      ${debut}setSeed(20261008);const ps=mgmtBulkSelection(m,new Set(),new Set(),4,{total:0,streak:0},false);
      return JSON.stringify({ps:ps?.map(p=>({a:p.a.id,b:p.b.id,raison:p.raison,sloppy:p.sloppy,warned:p.warned})),seed:SEED});})()`));
    w.close();
  }
  assert.deepEqual(results[0],results[1]);assert.equal(JSON.parse(results[0]).ps.length,4);
});
