"use strict";
/* ==== [ANCRE: MONDE_LOT6_T3_TESTS] — Monde lot 6 T3 ==== */
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const fs=require('node:fs');
const path=require('node:path');
const jouerSoirees=require('./helpers/jouerSoirees');
const w=newGameWindow({runMain:true});
after(()=>w.close());
const ev=code=>JSON.parse(w.eval(`JSON.stringify((()=>{${code}})())`));
const remplir=`for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){
  const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null));let ok=false;
  for(const a of rows){const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id));
    if(b&&mgmtBookMain(m,a.id,b.id)){ok=true;break;}}if(!ok)break;}`;
const depart=`setSeed(7);const m=mgmtDefault();mgmtNewRoster(m);mgmtExteriorEnsure(m);${remplir}`;
test('Monde lot 6 T3 — la proposition conserve exactement la preuve choisie',()=>{
  const r=ev(`${depart}const original=mgmtBulkSelection;let ps;
    mgmtBulkSelection=(...args)=>(ps=original(...args));
    try{const aff=mgmtNewBulkAffair(m,new Set(),new Set(),false);
      const exact=aff.fights.every((f,i)=>JSON.stringify(f.raison)===JSON.stringify(ps[i].raison));
      const avant=JSON.stringify(aff);ps[0].raison.fait.source='modifie';
      return [exact,avant===JSON.stringify(aff),aff.fights.every(f=>f.origine==='leila')];
    }finally{mgmtBulkSelection=original;}`);
  assert.deepEqual(r,[true,true,true]);
});
/* ==== [ANCRE: MONDE_LOT6_T3_TEST_PERSISTANCE] — Monde lot 6 T3 ==== */
test('Monde lot 6 T3 — valider et recharger ne recalculent aucune cause',()=>{
  assert.deepEqual(ev(`${depart}const aff=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    const avant=JSON.stringify(aff.fights.map(f=>f.raison)),original=mgmtRaisonsLire;let calls=0;
    mgmtRaisonsLire=()=>{calls++;throw new Error('recalcul interdit');};
    try{const ok=mgmtDecide(m,aff.id,'validate');const recharge=mgmtParseAndValidate(mgmtSerialiser(m));
      return [ok,avant===JSON.stringify(m.card.prelims.map(f=>f.raison)),!!recharge,
        !!recharge&&avant===JSON.stringify(recharge.card.prelims.map(f=>f.raison)),calls];
    }finally{mgmtRaisonsLire=original;}`),[true,true,true,true,0]);
});
const fixture=`setSeed(9);const m=mgmtDefault();mgmtNewRoster(m);mgmtExteriorEnsure(m);m.hist=[];m.facts=[];m.cycle=20;
  const div=m.roster[0].div;let [A,B,C]=m.roster.filter(f=>f.div===div);
  const combat=(a,b,winner='A',c=18)=>m.hist.push({a:mgmtTraceSide(a),b:mgmtTraceSide(b),seed:9,winner,c,slot:'prelim',family:'dec',round:3,rounds:3});`;
test('Monde lot 6 T3 — la revanche enregistrée conserve la source et le vrai vainqueur',()=>{
  for(const winner of ['A','B','D']) for(const inverse of [false,true]){
    const r=ev(`${fixture}combat(${inverse?'B,A':'A,B'},'${winner}');
      const raison=mgmtRaisonsPourPaire(m,A,B).find(r=>r.famille==='revanche');if(!raison)return null;
      m.card.prelims=[{a:A.id,b:B.id,slot:'prelim',cycle:20,origine:'leila',raison}];
      const recharge=mgmtParseAndValidate(mgmtSerialiser(m)),t=m.hist[0];
      return [raison,recharge&&recharge.card.prelims[0].raison,t.winner==='A'?t.a.id:t.b.id,t.winner==='A'?t.b.id:t.a.id];`);
    if(winner==='D')assert.equal(r,null);
    else{assert.deepEqual(r[0],r[1]);assert.deepEqual(r[0].fait,{source:'hist',i:0,c:18,gagnant:r[2],perdant:r[3]});}
  }
});
/* ==== [ANCRE: MONDE_LOT6_T3_TEST_SCHEMAS] — Monde lot 6 T3 ==== */
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
test('Monde lot 6 T3 — les causes mal formées sont rejetées',()=>{
  for(const [famille,code] of positifs){
    const r=ev(`${fixture}${code}const raison=mgmtRaisonsPourPaire(m,A,B).find(r=>r.famille==='${famille}');
      if(!raison)return {valide:false};const valide=mgmtRaisonValide(raison,A.id,B.id),bad=[];
      const mutation=fn=>{const x=JSON.parse(JSON.stringify(raison));fn(x);bad.push(mgmtRaisonValide(x,A.id,B.id));};
      mutation(x=>x.famille='inconnue');mutation(x=>x.fait.source='inconnue');mutation(x=>delete x.fait);mutation(x=>x.fait=[]);
      /* Schéma fermé : une clé en trop dans le fait ou dans un de ses
         sous-objets est refusée, comme une clé attendue en moins. */
      mutation(x=>x.fait.champEnTrop=1);mutation(x=>{delete x.fait.source;});
      if(raison.fait.combattants){mutation(x=>x.fait.combattants[0].champEnTrop=1);
        mutation(x=>{delete x.fait.combattants[0].a;});}
      mutation(x=>{const f=x.fait;const cle=['a','gagnant'].find(k=>f[k]!==undefined);if(cle)f[cle]='hors-paire';else f.combattants[0].a='hors-paire';});
      const f=raison.fait;for(const cle of ['i','n','cycles','total','f','rang'])if(f[cle]!==undefined){
        mutation(x=>x.fait[cle]=-1);mutation(x=>x.fait[cle]=0.5);mutation(x=>x.fait[cle]=NaN);}
      if(f.combattants){mutation(x=>x.fait.combattants[1].a=x.fait.combattants[0].a);
        for(const cle of ['n','rang'])if(f.combattants[0][cle]!==undefined)mutation(x=>x.fait.combattants[0][cle]=NaN);}
      return {valide,bad};`);
    assert.equal(r.valide,true,famille);assert.ok(r.bad.every(x=>!x),famille);
  }
  assert.deepEqual(ev(`${fixture}return [mgmtCombatRaisonValide({a:A.id,b:B.id,raison:null},true),
    mgmtCombatRaisonValide({a:A.id,b:B.id},true),mgmtCombatRaisonValide({a:A.id,b:B.id,origine:'leila',raison:null},true),
    mgmtCombatRaisonValide({a:A.id,b:B.id,origine:'joueur',raison:null},true)];`),[true,false,false,true]);
});
/* ==== [ANCRE: MONDE_LOT6_T3_TEST_GESTES] — Monde lot 6 T3 ==== */
test('Monde lot 6 T3 — changer une paire ne conserve pas sa vieille cause',()=>{
  assert.deepEqual(ev(`${fixture}${remplir}const aff=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    const old={...aff.fights[0]},original=mgmtBulkSelection;let p;
    mgmtBulkSelection=(...args)=>{const ps=original(...args);p=ps?.[0];return ps;};
    let exact,ok;try{ok=mgmtSwapFight(m,aff.id);exact=ok&&JSON.stringify(aff.fights[0].raison)===JSON.stringify(p.raison);}
    finally{mgmtBulkSelection=original;}
    const nouveau=aff.fights[0],fait=m.facts.find(f=>f.k==='swapped');
    const differente=[old.a,old.b].sort().join('|')!==[nouveau.a,nouveau.b].sort().join('|');
    const avant=JSON.stringify(aff);mgmtBulkSelection=()=>null;let echec;
    try{echec=!mgmtSwapFight(m,aff.id)&&avant===JSON.stringify(aff);}finally{mgmtBulkSelection=original;}
    const nf=m.roster.find(f=>f.div===mgmtFighterById(m,nouveau.a).div&&f.id!==nouveau.a&&f.id!==nouveau.b
      &&mgmtSelectable(m,f,nouveau.a)&&!aff.fights.some(x=>x.a===f.id||x.b===f.id));
    const preuve=mgmtRaisonsPourPaire(m,mgmtFighterById(m,nouveau.a),nf)[0]||null;
    const manuel=mgmtBulkRemplacer(m,aff.id,0,nf.id,'b');
    const avec=manuel&&nouveau.origine==='joueur'&&JSON.stringify(nouveau.raison)===JSON.stringify(preuve);
    const nf2=m.roster.find(f=>f.div===mgmtFighterById(m,nouveau.a).div&&f.id!==nouveau.a&&f.id!==nouveau.b
      &&mgmtSelectable(m,f,nouveau.a)&&!aff.fights.some(x=>x.a===f.id||x.b===f.id));
    const lecteur=mgmtRaisonsPourPaire;mgmtRaisonsPourPaire=()=>[];let sans;
    try{sans=mgmtBulkRemplacer(m,aff.id,0,nf2.id,'b')&&nouveau.origine==='joueur'&&nouveau.raison===null;}
    finally{mgmtRaisonsPourPaire=lecteur;}
    return [ok,exact,differente,fait.a===old.a&&fait.b===old.b&&fait.na===p.a.id&&fait.nb===p.b.id,echec,avec,sans];`),Array(7).fill(true));
});
test('Monde lot 6 T3 — faire monter conserve la cause sans en inventer au booking manuel',()=>{
  assert.deepEqual(ev(`${fixture}${remplir}const aff=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    const f=aff.fights[0],avant=JSON.stringify(f.raison),retire=m.card.main.pop();
    const monte=mgmtBulkMonter(m,aff.id,0),pose=m.card.main.find(x=>x.a===f.a&&x.b===f.b);
    m.card.main.pop();const manuel=mgmtBookMain(m,retire.a,retire.b);
    return [monte,!!pose&&JSON.stringify(pose.raison)===avant,!!manuel&&!Object.hasOwn(manuel,'raison')];`),[true,true,true]);
});
test('Monde lot 6 T3 — les familles posées comptent dans la nouvelle proposition',()=>{
  assert.deepEqual(ev(`${depart}setSeed(20261008);const aff=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    const premier=aff.fights[0];m.card.prelims.push({...premier,cycle:m.cycle});aff.status='closed';
    const original=mgmtPickBulkPair,appels=[];mgmtPickBulkPair=(...args)=>{appels.push(args[7]);return original(...args);};
    let nouveau;try{nouveau=mgmtNewBulkAffair(m,new Set(),new Set(),false);}finally{mgmtPickBulkPair=original;}
    const initial=MGMT_RAISON_FAMILLES.find(f=>f!==premier.raison.famille);
    const avant=JSON.stringify(m),selection=mgmtBulkSelection;
    mgmtPickBulkPair=(...args)=>args[7]===premier.raison.famille?{a:m.roster[0],b:m.roster[1],div:m.roster[0].div,raison:premier.raison}:null;
    let seule;try{seule=selection(m,new Set(),new Set(),1,mgmtCrushStats(m),false,[premier]);}finally{mgmtPickBulkPair=original;}
    return [!!nouveau,appels[0]===initial,seule?.length===1,JSON.stringify(m)===avant];`),[true,true,true,true]);
});
/* ==== [ANCRE: MONDE_LOT6_T3_TEST_ANCIENNES] — Monde lot 6 T3 ==== */
test('Monde lot 6 T3 — une pile ancienne charge et se rend sans erreur',()=>{
  assert.deepEqual(ev(`${depart}const bloc=m.pile.find(a=>a.kind==='leila_bulk'&&Array.isArray(a.fights)&&a.fights.length);
    const avant=m.pile.map(a=>({id:a.id,status:a.status,ids:(a.fights||[]).map(f=>[f.a,f.b])}));
    const gardee=JSON.stringify(bloc.fights[0].raison),origine=bloc.fights[0].origine;
    m.v=16;for(const a of m.pile)for(const f of a.fights||[]){delete f.raison;delete f.origine;}
    /* Une preuve déjà portée n'est jamais écrasée par la migration. */
    bloc.fights[0].raison=JSON.parse(gardee);bloc.fights[0].origine=origine;
    const recharge=mgmtParseAndValidate(JSON.stringify(m));G.mgmt=recharge;G.screen='mgmt_prelims';
    return [!!recharge&&recharge.v===21, /* décision du 15/10/2026 : migration du lot 6 renumérotée 18 → 19, puis lot 9 T2a 19 → 20, puis T2d 20 → 21 */ !!recharge&&validateMgmt(recharge),
      JSON.stringify(avant)===JSON.stringify(recharge.pile.map(a=>({id:a.id,status:a.status,ids:(a.fights||[]).map(f=>[f.a,f.b])}))),
      recharge.pile.filter(a=>a.id!==bloc.id).every(a=>(a.fights||[]).every(f=>f.raison===null))
        &&JSON.stringify(recharge.pile.find(a=>a.id===bloc.id).fights[0].raison)===gardee,
      typeof scr_mgmt_prelims()==='string'&&scr_mgmt_prelims().length>0];`),Array(5).fill(true));
});
test('Monde lot 6 T3 — une partie ancienne joue une soirée après migration',()=>{
  const ancien=fs.readFileSync(path.join(__dirname,'fixtures','mgmt-sauvegarde-14.json'),'utf8');
  const reprise=newGameWindow({runMain:true});
  try{reprise.__texte=ancien;reprise.eval(`setSeed(5);stockageEcrire(mgmtSlotKey(1),window.__texte);CL.mgmtEnter(1);`);
    const brut=JSON.parse(ancien);assert.equal(reprise.eval('G.mgmt.eventsPlayed'),3);
    assert.equal(jouerSoirees(reprise,1),1);assert.equal(reprise.eval('G.mgmt.eventsPlayed'),4);
    assert.equal(reprise.eval('validateMgmt(G.mgmt)'),true);
    const apres=JSON.parse(reprise.eval('JSON.stringify({hist:G.mgmt.hist,facts:G.mgmt.facts})'));
    assert.deepEqual(apres.hist.slice(0,brut.hist.length),brut.hist);assert.deepEqual(apres.facts.slice(0,brut.facts.length),brut.facts);
  }finally{reprise.close();}
});
