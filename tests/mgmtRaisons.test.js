"use strict";
/* ==== [ANCRE: MONDE_LOT6_T1_TESTS] — Monde lot 6 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});
win.eval(`setSeed(9); window.RAISON_BASE=mgmtDefault(); mgmtNewRoster(RAISON_BASE); mgmtExteriorEnsure(RAISON_BASE);`);
const debut=`const m=JSON.parse(JSON.stringify(RAISON_BASE)); m.hist=[]; m.facts=[]; m.cycle=20;
  const div=m.roster[0].div; let [A,B,C]=m.roster.filter(f=>f.div===div);
  const combat=(a,b,winner='A',c=19)=>m.hist.push({a:{id:a.id,W:a.W,L:a.L,D:a.D},b:{id:b.id,W:b.W,L:b.L,D:b.D},winner,c,slot:'prelim',family:'dec',round:3,rounds:3});
  const lit=(a=A,b=B)=>mgmtRaisonsPourPaire(m,a,b);
  const aLa=famille=>lit().some(r=>r.famille===famille);`;
function resultat(code){return JSON.parse(win.eval(`JSON.stringify((()=>{${debut}${code}})())`));}
const cas=[
  ['revanche',`combat(A,B);`, `combat(A,B,'D');`],
  ['rivalite-ouverte',`m.facts=[{k:'demande',a:A.id,target:B.id,want:'revanche',c:20}];`, `m.facts=[{k:'demande',a:A.id,target:B.id,want:'revanche',c:16}]; m.cycle=21;`],
  ['series-croisees',`for(let i=0;i<3;i++){combat(A,C,'A',i);combat(B,C,'A',i);}`, `for(let i=0;i<2;i++){combat(A,C,'A',i);combat(B,C,'A',i);}`],
  ['classement-voisin',`const rang=mgmtClassementLignes(m,div,'organization'); A=mgmtFighterById(m,rang[0].id); B=mgmtFighterById(m,rang[1].id);`, `B.div=allDivisions().find(d=>d.id!==div).id;`],
  ['test-jeune',`A.age=24;A.W=1;A.L=0;A.D=0; B.age=33;`, `A.age=B.age=30;A.W=B.W=6;A.L=B.L=2;A.D=B.D=0;`],
  ['derniere-chance',`combat(C,A);combat(C,A);`, `combat(C,A);combat(C,A,'D');`],
  ['longue-attente',`A.lastCycle=B.lastCycle=0;`, `A.lastCycle=B.lastCycle=20;`],
  ['demande-promesse',`m.facts=[{k:'promesse',a:A.id,target:B.id,want:'revanche',c:19,due:22}];`, `m.facts=[{k:'promesse',a:A.id,target:B.id,want:'carte-principale',c:19,due:22}];`],
  ['fin-contrat',`A.ct={n:3,f:2,since:20};`, `A.ct=B.ct={n:3,f:3,since:20};`],
  ['styles-opposes',`const choisis={}; for(let i=0;i<300&&Object.keys(choisis).length<2;i++){const f={...A,id:'style-'+i,W:12,L:0,D:0}; const t=mgmtCarteStyleBilan(m,f).t; if(t==='Finit par KO'||t==='Finit au sol') choisis[t]=f;} Object.assign(A,choisis['Finit par KO']);Object.assign(B,choisis['Finit au sol']);`, `A.W=B.W=0;A.L=B.L=0;A.D=B.D=0;`],
  ['derby',`A.ck=B.ck='FR';`, `A.ck='FR';B.ck='US';`],
  ['debuts',``, `combat(A,B);`],
  ['veteran',`A.age=33;`, `A.age=B.age=32;A.W=B.W=10;A.L=B.L=9;A.D=B.D=0;`],
  ['reclame-public',`combat(A,B,'A',19);m.hist[0].slot='main';m.hist[0].family='ko';m.hist[0].round=1;m.hist[0].a.W=1;m.hist[0].a.L=2;m.hist[0].b.W=8;m.hist[0].b.L=0;`, `combat(A,B,'D');`],
  ['meme-categorie-jamais-affrontes',``, `combat(A,B,'D');`]
];

test('Monde lot 6 T1 — les quinze familles possèdent chacune une condition et une preuve',()=>{
  const catalogue=Array.from(win.eval('MGMT_RAISON_FAMILLES'));
  assert.equal(catalogue.length,15); assert.equal(new Set(catalogue).size,15);
  assert.deepEqual(catalogue,cas.map(c=>c[0]));
});
for(const [famille,positif,negatif] of cas){
  test(`Monde lot 6 T1 — ${famille} : condition positive et négative`,()=>{
    assert.equal(resultat(`${positif}return aLa('${famille}');`),true,famille+' positive');
    assert.equal(resultat(`${negatif}return aLa('${famille}');`),false,famille+' négative');
  });
}

/* ==== [ANCRE: MONDE_LOT6_T1_TEST_SOURCES] — Monde lot 6 T1 ==== */
const verifie=`const erreurs=[];
  for(const r of lit()){
    const p=r.fait, f=p.a&&mgmtFighterById(m,p.a);
    let ok=false;
    if(r.famille==='revanche'){const t=m.hist[p.i];ok=!!t&&t.c===p.c&&t.winner!=='D'&&(t.winner==='A'?t.a.id:t.b.id)===p.gagnant&&(t.winner==='A'?t.b.id:t.a.id)===p.perdant;}
    else if(p.source==='facts'){const x=m.facts[p.i];ok=!!x&&x.a===p.a&&x.target===p.target&&x.c===p.c&&(p.want===undefined||x.want===p.want)&&(p.due===undefined||p.due===x.due);}
    else if(p.source==='reclames') ok=mgmtReclamesRaisons(m).some(x=>x.a===p.a&&x.b===p.b&&x.c===p.c&&x.raison===p.raison);
    else if(p.source==='serie'){const l=p.combattants||[p];ok=l.every(x=>{const s=mgmtSerie(m,mgmtFighterById(m,x.a));return s&&s.issue===x.issue&&s.n===x.n;});}
    else if(p.source==='classement') ok=p.combattants.every(x=>mgmtClassementLignes(m,p.div,p.portee).some(y=>y.id===x.a&&y.rang===x.rang));
    else if(p.source==='roles'){const b=mgmtFighterById(m,p.b);ok=(mgmtRole(m,f)?.id||null)===p.role&&(mgmtRole(m,b)?.id||null)===p.contreRole&&p.age===f.age&&p.total===f.W+f.L+f.D&&p.contreAge===b.age&&p.contreTotal===b.W+b.L+b.D;}
    else if(p.source==='attente') ok=p.cycles===mgmtContratAttente(m,f)&&p.mois===Math.round(p.cycles*MGMT_EVENT_WEEKS/4.345)&&p.depuis===m.cycle-p.cycles;
    else if(p.source==='contrat') ok=p.n===f.ct.n&&p.f===f.ct.f&&p.restants===mgmtContratRestants(f);
    else if(p.source==='hist') ok=p.n===0&&(p.b?!mgmtAffrontements(m).has([p.a,p.b].sort().join('|'))&&p.div===f.div&&p.div===mgmtFighterById(m,p.b).div:!mgmtResultats(m,f).length);
    else if(p.source==='bilan') ok=p.age===f.age&&p.total===f.W+f.L+f.D;
    else if(p.source==='bilan-public') ok=p.combattants.every(x=>mgmtCarteStyleBilan(m,mgmtFighterById(m,x.a)).t===x.style);
    else if(p.source==='identite'){const b=mgmtFighterById(m,p.b);ok=mgmtIdentitePays(f)===p.pays&&mgmtIdentitePays(b)===p.pays&&(p.ville===null||mgmtIdentiteVille(f)===p.ville&&mgmtIdentiteVille(b)===p.ville);}
    if(!ok) erreurs.push(r);
  } return erreurs;`;
test('Monde lot 6 T1 — chaque raison est vérifiée contre sa source',()=>{
  for(const [famille,positif] of cas) assert.deepEqual(resultat(positif+verifie),[],famille);
});
test('Monde lot 6 T1 — la lecture est pure et déterministe',()=>{
  for(const [famille,positif] of cas){
  const r=resultat(`${positif}const avant=JSON.stringify(m),g=JSON.stringify(G),seed=SEED,memo={...MGMT_ROLES_MEMO};
    const x=JSON.stringify(lit()),y=JSON.stringify(lit()),z=JSON.stringify(lit(B,A));
    return [x===y,x===z,avant===JSON.stringify(m),g===JSON.stringify(G),seed===SEED,Object.keys(memo).every(k=>memo[k]===MGMT_ROLES_MEMO[k])];`);
  assert.deepEqual(r,[true,true,true,true,true,true],famille);
  }
});
test('Monde lot 6 T1 — le repli cite seulement la catégorie et l’absence de rencontre',()=>{
  const r=resultat(`const r=lit().find(r=>r.famille==='meme-categorie-jamais-affrontes'); B.div=allDivisions().find(d=>d.id!==div).id; return [r.fait.div,r.fait.n,aLa('meme-categorie-jamais-affrontes')];`);
  assert.equal(r[1],0);assert.equal(r[2],false);
});

/* ==== [ANCRE: MONDE_LOT6_T1_TEST_LIMITES] — Monde lot 6 T1 ==== */
test('Monde lot 6 T1 — classement voisin accepte deux rangs mais pas trois',()=>{
  for(const [ecart,attendu] of [[2,true],[3,false]]){
    assert.equal(resultat(`const rang=mgmtClassementLignes(m,div,'organization');
      A=mgmtFighterById(m,rang[0].id); B=mgmtFighterById(m,rang[${ecart}].id);
      return aLa('classement-voisin');`),attendu);
  }
});
test('Monde lot 6 T1 — longue attente franchit le seuil public de six mois',()=>{
  for(const [cycles,attendu] of [[5,false],[6,true]]){
    assert.equal(resultat(`A.lastCycle=B.lastCycle=20-${cycles};
      return aLa('longue-attente');`),attendu);
  }
  assert.equal(resultat(`A.lastCycle=B.lastCycle=14;
    return lit().find(r=>r.famille==='longue-attente').fait.mois;`),7);
});
test('Monde lot 6 T1 — vingt combats suffisent au vétéran malgré son âge',()=>{
  assert.equal(resultat(`A.age=B.age=30; A.W=10;A.L=10;A.D=0;
    B.W=10;B.L=9;B.D=0;return aLa('veteran');`),true);
});
test('Monde lot 6 T1 — une réponse éteint le défi et une autre cible ne satisfait pas la promesse',()=>{
  assert.deepEqual(resultat(`m.facts=[{k:'demande',a:A.id,target:B.id,want:'revanche',c:20},
    {k:'refus',a:A.id,d:0,c:20},
    {k:'promesse',a:A.id,target:C.id,want:'revanche',c:20,due:22}];
    return [aLa('rivalite-ouverte'),aLa('demande-promesse')];`),[false,false]);
});
test('Monde lot 6 T1 — une promesse tenue ou rompue ne justifie plus la paire',()=>{
  assert.equal(resultat(`m.facts=[{k:'promesse',a:A.id,target:B.id,want:'revanche',c:18,due:22}];
    combat(A,B,'A',19);return aLa('demande-promesse');`),false);
  assert.equal(resultat(`m.facts=[{k:'promesse',a:A.id,target:B.id,want:'revanche',c:18,due:19}];
    return aLa('demande-promesse');`),false);
});
test('Monde lot 6 T1 — aucune guérison n’est inventée à partir d’une blessure',()=>{
  assert.equal(resultat(`m.facts=[{k:'injury',a:A.id,c:18}];A.susp=19;
    return lit().some(r=>r.famille==='retour-blessure');`),false);
});
test('Monde lot 6 T1 — une paire absente ou identique ne donne aucune preuve',()=>{
  assert.deepEqual(resultat(`return [mgmtRaisonsPourPaire(m,A,A),mgmtRaisonsPourPaire(m,A,null),
    mgmtRaisonsPourPaire(null,A,B)];`),[[],[],[]]);
});

/* ==== [ANCRE: MONDE_LOT6_T1_TEST_ARCHIVE] — Monde lot 6 T1 ==== */
const passe=newGameWindow({runMain:true});
passe.eval(`setSeed(20261008); mgmtPasseGenerer('split',{soirees:4});`);
test("Monde lot 6 T1 — la revanche cite un combat de l'archive et son vrai vainqueur",()=>{
  const r=JSON.parse(passe.eval(`JSON.stringify((()=>{const m=G.mgmt;
    for(let i=m.hist.length-1;i>=0;i--){const t=m.hist[i]; if(t.winner==='D')continue;
      const a=mgmtFighterById(m,t.a.id),b=mgmtFighterById(m,t.b.id);if(!a||!b)continue;
      const p=mgmtRaisonsPourPaire(m,a,b).find(r=>r.famille==='revanche').fait;
      return [p.i===i,p.gagnant===(t.winner==='A'?a.id:b.id),p.perdant===(t.winner==='A'?b.id:a.id),t.p===true];}
  })())`));
  assert.deepEqual(r,[true,true,true,true]);
  assert.equal(resultat(`combat(A,B,'D');return aLa('revanche');`),false);
});
test('Monde lot 6 T1 — un passé allégé suffit sans rejouer les combats',()=>{
  assert.equal(passe.eval(`(()=>{const original=mgmtReplayFight;mgmtReplayFight=()=>{throw new Error('replay interdit');};try{const m=G.mgmt,t=m.hist[0];return mgmtRaisonsPourPaire(m,mgmtFighterById(m,t.a.id),mgmtFighterById(m,t.b.id)).length>0;}finally{mgmtReplayFight=original;}})()`),true);
});
