"use strict";
/* Brief du 06/10/2026, lot 9 : les contrats et le recrutement — un engagement par combattant, la bourse du contrat, l'offre et la
   réponse, la prime, le marché des sans-contrat, la fin de contrat, les paliers d'attente, la rouille. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
function neuve(){ const win=newGameWindow({runMain:true}); win.eval(`setSeed(7); CL.mgmtEnter(1);`); return win; }

test('Contrats — chaque combattant a un engagement : combats signés, faits, bourse par combat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; return {tous:m.roster.every(f=>f.ct&&f.ct.n>=2&&f.ct.n<=5&&f.ct.f===0&&f.ct.b>=1),valide:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.ok(r.tous); assert.ok(r.valide);
});

test('Contrats — la bourse payée le soir du combat est celle du contrat, pas celle que le palmarès calcule', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster[0]; f.ct.b=17; return {main:mgmtPurse(f,'main'),prelim:mgmtPurse(f,'prelim'),sans:mgmtPurse({W:5,L:1,D:0},'main')};`);
  assert.equal(r.main,17); assert.equal(r.prelim,17); assert.notEqual(r.sans,17);
});

test('Contrats — aucun recrutement n’est gratuit : la prime est débitée à la signature, et le geste d’avant est refusé', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const lib=allDivisions().flatMap(d=>mgmtRecrutables(m,d.id)); const x=lib[lib.length-1]; const direct=mgmtRecruter(m,x.id);
    const t0=m.treasury; const dem=mgmtBourseSouhaitee(m,mgmtExteriorPourOffre(m,x.id),false); const s=mgmtContratSigner(m,x.id,3,dem);
    return {n:lib.length,direct:direct===null,ok:s.ok,prime:s.prime,debit:t0-m.treasury,dans:m.roster.some(f=>f.id===x.id&&f.ct&&f.ct.n===3&&f.ct.b===dem)};`);
  assert.ok(r.n>0&&r.direct); assert.ok(r.ok&&r.prime>=1); assert.equal(r.debit,r.prime); assert.ok(r.dans);
});

test('Contrats — un combattant sous contrat ailleurs n’apparaît pas au recrutement et ne se signe pas', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const tous=m.exterieur.filter(e=>{ const t=mgmtExteriorTrace(e,m.cycle); return t&&!mgmtExteriorRetired(e,m.cycle); });
    const libres=new Set(allDivisions().flatMap(d=>mgmtRecrutables(m,d.id)).map(x=>x.id));
    const ailleurs=tous.find(e=>!libres.has(e.id)&&!m.roster.some(f=>f.id===e.id));
    const s=ailleurs?mgmtContratSigner(m,ailleurs.id,3,50):null;
    return {total:tous.length,libres:libres.size,ailleurs:!!ailleurs,refus:s&&s.raison};`);
  assert.ok(r.libres<r.total,'tous les extérieurs ne sont pas libres'); assert.ok(r.ailleurs); assert.equal(r.refus,'sous-contrat');
});

test('Contrats — le nombre de combats restants baisse d’un à chaque combat joué ; à zéro, sans renouvellement, il rejoint les sans-contrat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster[3]; f.ct.n=2; f.ct.f=0; const r0=mgmtContratRestants(f);
    mgmtContratsApresSoiree(m,[f.id]); const r1=mgmtContratRestants(f); const encore=!!f.ct&&!f.libre;
    mgmtContratsApresSoiree(m,[f.id]);
    return {r0,r1,encore,libre:f.libre===true,sansCt:f.ct===undefined,dispo:mgmtAvailable(m,f),fait:m.facts.some(x=>x.k==='fin_contrat'&&x.a===f.id)};`);
  assert.equal(r.r0,2); assert.equal(r.r1,1); assert.ok(r.encore); assert.ok(r.libre&&r.sansCt&&r.fait); assert.equal(r.dispo,false,'un sans-contrat ne se book plus');
});

/* Corrections du 08/10/2026 (effectif de 30 par catégorie) : les paliers d'attente d'une partie neuve valent 2,5 fois ceux de 140 combattants (mgmtCtSeuils) ; ce test les lit au lieu de les écrire en dur. */
test('Contrats — les quatre paliers d’attente se suivent dans l’ordre, un combat joué ramène au début, le dernier refuse tout combat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.cycle=90; const f=m.roster[4]; f.lastCycle=m.cycle; const p=[]; const s=mgmtCtSeuils(m);
    for(const a of [0,s[0]-1,s[0],s[1]-1,s[1],s[2]-1,s[2],s[3]-1,s[3],s[3]+4]){ f.lastCycle=m.cycle-a; p.push(mgmtContratPalier(m,f)); }
    f.lastCycle=m.cycle-s[3]; const refuse=!mgmtAvailable(m,f); const aff={a:f.id,b:m.roster.find(o=>o.div===f.div&&o.id!==f.id).id}; const acc=mgmtAcceptable(m,aff);
    f.lastCycle=m.cycle; const apres=mgmtContratPalier(m,f);
    return {p,refuse,acc,apres};`);
  assert.deepEqual(r.p,[0,0,1,1,2,2,3,3,4,4]); assert.ok(r.refuse); assert.equal(r.acc,false,'toute proposition de combat est refusée'); assert.equal(r.apres,0);
});

/* Corrections du 08/10/2026 (effectif de 30 par catégorie) : les paliers d'attente d'une partie neuve valent 2,5 fois ceux de 140 combattants (mgmtCtSeuils) ; ce test les lit au lieu de les écrire en dur. */
test('Contrats — la rouille agit sur le niveau à partir du troisième palier et s’efface au combat suivant', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.cycle=120; const f=m.roster[5]; const out=[]; const s2=mgmtCtSeuils(m)[2];
    for(const a of [0,s2-1,s2,s2+2,90]){ f.lastCycle=m.cycle-a; out.push(mgmtRouille(m,f,m.cycle)); }
    f.lastCycle=m.cycle; return {out,efface:mgmtRouille(m,f,m.cycle)};`);
  assert.equal(r.out[0],0); assert.equal(r.out[1],0); assert.ok(r.out[2]>0&&r.out[3]>r.out[2]); assert.equal(r.out[4],5,'bornée'); assert.equal(r.efface,0);
});

test('Contrats — le renouvellement : les combats s’ajoutent, la bourse change, la prime est débitée ; le combattant peut refuser', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.cycle=60; const f=m.roster.find(x=>x.ct&&mgmtContratGrandeur(m,x).ecart===0); const n0=f.ct.n, dem=mgmtBourseSouhaitee(m,f,true);
    const bas=mgmtContratRenouveler(m,f.id,3,0.5); const t0=m.treasury;
    const ok=mgmtContratRenouveler(m,f.id,3,dem+2);
    f.lastCycle=m.cycle-mgmtCtSeuils(m)[2]; const plus=mgmtBourseSouhaitee(m,f,true), base=mgmtBourseSouhaitee(m,f,false);
    return {bas:bas.raison,ok:ok.ok,n:f.ct.n-n0,b:f.ct.b===dem+2,debit:t0-m.treasury===ok.prime,plus,base,hors:mgmtContratReponse(m,f,9,5,true).raison};`);
  assert.equal(r.bas,'trop-bas'); assert.ok(r.ok); assert.equal(r.n,3); assert.ok(r.b); assert.ok(r.debit); assert.ok(r.plus>=r.base,'il demande un peu plus après une longue attente'); assert.equal(r.hors,'offre');
});

/* Corrections du 08/10, lot 9 (D3) : la décision d'Anthony remplace « refus quel que soit le prix » — un combattant trop grand refuse selon ce qui l'intéresse (voir mgmtCorrectionsLot9.test.js). Ici : celui que l'ambition porte refuse toujours. */
test('Contrats — une vedette trop grande pour la popularité de l’organisation, que l’ambition porte, refuse quel que soit le prix', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; m.pop=5; for(const g of m.roster){ g.W=40; g.L=0; } const f=m.roster.find(g=>mgmtContratInteret(g)==='ambition'); return {star:mgmtStar(f),rep:mgmtContratReponse(m,f,3,999,true)};`);
  assert.ok(r.star*100>30); assert.equal(r.rep.ok,false); assert.equal(r.rep.raison,'trop-grand');
});

test('Contrats — aucune bourse n’apparaît sur l’écran de la carte', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_carte'); CL.mgmtCarteEntree(); CL.mgmtCarteEntree();`);
  const t=win.eval(`document.getElementById('app').textContent`);
  assert.ok(!/€|k\$/.test(t),'ni bourse, ni montant sur la carte');
});

test('Contrats — sur 40 parties simulées, signer des combattants sans les faire combattre fait baisser la caisse et leur forme', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`let baisseCaisse=0, rouilles=0, total=0;
    for(let g=0;g<40;g++){
      setSeed(3000+g); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
      const t0=m.treasury; const cibles=allDivisions().flatMap(d=>mgmtRecrutables(m,d.id)).slice(-4); const signes=[];
      for(const x of cibles){ const dem=mgmtBourseSouhaitee(m,mgmtExteriorPourOffre(m,x.id),false); const s=mgmtContratSigner(m,x.id,4,dem); if(s.ok) signes.push(x.id); }
      m.cycle+=60;
      total++; if(signes.length&&m.treasury<t0) baisseCaisse++;
      if(signes.length&&signes.every(id=>{ const f=mgmtFighterById(m,id); return mgmtRouille(m,f,m.cycle)>0||mgmtContratPalier(m,f)>=4; })) rouilles++;
    }
    return {total,baisseCaisse,rouilles};`);
  assert.equal(r.total,40); assert.ok(r.baisseCaisse>=38,`la caisse baisse (${r.baisseCaisse}/40)`); assert.ok(r.rouilles>=38,`leur forme baisse (${r.rouilles}/40)`);
});

test('Contrats — l’écran : R bascule entre sous contrat et recrutement, ← → le nombre de combats, Entrée propose, + − la bourse', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_contrats');`);
  assert.equal(win.eval(`document.querySelector('.mf-barre-item.cur').dataset.section`),'contrats');
  assert.ok(win.eval(`document.querySelectorAll('.mf-ct-ligne').length`)>0);
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_CONTRATS.n'),4); touche(win,'ArrowLeft'); touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_CONTRATS.n'),2);
  touche(win,'+'); assert.ok(Number.isFinite(win.eval('MGMT_CONTRATS.b')));
  touche(win,'r'); assert.equal(win.eval('MGMT_CONTRATS.mode'),'recrutement');
  assert.ok(win.eval(`document.querySelectorAll('.mf-ct-ligne').length`)>0);
  const t0=win.eval('G.mgmt.treasury'); const ros=win.eval('G.mgmt.roster.length');
  for(let i=0;i<6;i++) touche(win,'+');
  touche(win,'Enter');
  assert.ok(win.eval('MGMT_CONTRATS.msg').length>0,'la réponse du combattant s’affiche');
  if(win.eval('G.mgmt.roster.length')>ros){ assert.ok(win.eval('G.mgmt.treasury')<t0,'la signature coûte'); }
});

test('Contrats — la fiche : l’onglet Contrat montre les combats un par un, la bourse et la suite', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_effectif'); CL.mgmtEffectifOuvrir(); CL.mgmtFicheOnglet('contrat');`);
  assert.equal(win.eval('MGMT_FICHE.onglet'),'contrat');
  const t=win.eval(`document.getElementById('app').textContent`);
  assert.ok(t.includes('Le prochain')&&t.includes('DURÉE')&&t.includes('ENSUITE'),'les combats un par un, la durée et la suite');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fiche-grise').length`),0);
});

test('Contrats — la validation du format : un contrat abîmé est refusé', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const bon=validateMgmt(JSON.parse(JSON.stringify(m)));
    const a=JSON.parse(JSON.stringify(m)); a.roster[0].ct.b=-1; const b=JSON.parse(JSON.stringify(m)); b.roster[0].libre=true; const c=JSON.parse(JSON.stringify(m)); delete c.roster[0].ct; c.roster[0].libre=true;
    return {bon,a:validateMgmt(a),b:validateMgmt(b),c:validateMgmt(c)};`);
  assert.ok(r.bon); assert.equal(r.a,false); assert.equal(r.b,false,'ni contrat ni libre ensemble'); assert.ok(r.c,'un sans-contrat est valide');
});
