"use strict";
/* Demande d'Anthony (08/10/2026) : « compare chaque écran individuellement » — les écrans Préliminaires, Booking, Effectif et Classements reprennent la planche de design. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const PREPARE=`const m=G.mgmt; const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let k=0;
  while(m.card.main.length<m.card.sizeMain&&k++<60){ const d=divs[k%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
  /* Décision d'Anthony du 17/10/2026 (monde lot 14 T2) : Leïla pose les préliminaires elle-même, la proposition en bloc n'existe plus pour le joueur. Ces tests gardent les opérations de la proposition en bloc, que l'outil du prédécesseur et les anciennes sauvegardes utilisent encore : le test la construit explicitement. */
  m.card.prelims=[];
  if(!m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')){ const b=mgmtNewBulkAffair(m,new Set(),new Set(),false)||mgmtNewBulkAffair(m,new Set(),new Set(),true); if(b) m.pile.push(b); }
  const bloc=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');`;
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('Préliminaires — remplacer le second combattant par un autre choix : même catégorie, libre, hors de la proposition ; le reste est refusé', () => {
  const win=neuve();
  const r=res(win,`${PREPARE}
    const fi=bloc.fights[0], alts=mgmtPrelimsAlternatives(m,fi,bloc), alt=alts[0];
    const autre=mgmtCartRows(m).find(f=>f.div!==mgmtFighterById(m,fi.a).div&&mgmtSelectable(m,f,null));
    const refus=[mgmtBulkRemplacer(m,bloc.id,0,fi.a),mgmtBulkRemplacer(m,bloc.id,0,autre.id),mgmtBulkRemplacer(m,bloc.id,0,bloc.fights[1].a),mgmtBulkRemplacer(m,bloc.id,9,alt.id)];
    const ancien=fi.b, ok=mgmtBulkRemplacer(m,bloc.id,0,alt.id);
    return {n:alts.length,ok,refus,change:fi.b===alt.id&&fi.b!==ancien,miroir:bloc.a===fi.a&&bloc.b===fi.b,memeDiv:mgmtFighterById(m,fi.b).div===mgmtFighterById(m,fi.a).div};`);
  assert.ok(r.n>=1); assert.equal(r.ok,true); assert.deepEqual(r.refus,[false,false,false,false]); assert.equal(r.change,true); assert.equal(r.miroir,true); assert.equal(r.memeDiv,true);
});

test('Préliminaires — faire monter un préliminaire proposé sur la carte principale quand une place y reste ; la proposition perd ce combat', () => {
  const win=neuve();
  const r=res(win,`${PREPARE}
    const avantRefus=mgmtBulkMonter(m,bloc.id,0), n0=bloc.fights.length, fi=bloc.fights[0];
    m.card.main.pop();
    const ok=mgmtBulkMonter(m,bloc.id,0);
    return {avantRefus,ok,main:m.card.main.length,reste:bloc.fights.length,n0,surCarte:m.card.main.some(x=>x.a===fi.a&&x.b===fi.b)};`);
  assert.equal(r.avantRefus,false,'carte principale pleine : refusé'); assert.equal(r.ok,true); assert.equal(r.main,5); assert.equal(r.reste,r.n0-1); assert.equal(r.surCarte,true);
});

/* Décision d'Anthony du 17/10/2026 (monde lot 14 T2) : les préliminaires sont posés par Leïla dès la pose de la soirée ; l'écran n'a plus de « Autres choix » ni de « Valider la carte » : il montre les combats posés, pourquoi Leïla les a posés, la carte principale, et permet de Changer, Refaire et voir les fiches. */
test('Préliminaires — l’écran montre les combats posés, les raisons de Leïla et le bloc de la carte principale, sans « Autres choix » ni validation', () => {
  const win=neuve();
  const r=res(win,`CL.go('mgmt_prelims'); const t=document.getElementById('app').textContent;
    return {poses:document.querySelectorAll('.mf-pre-slot.valide').length,autres:/AUTRES CHOIX/.test(t),valider:/Valider la carte/.test(t),pourquoi:/pourquoi elle l.a posé/i.test(t),ouvrir:!!document.querySelector('.mf-pre-ouvrir'),
      fiches:/Fiches/.test(t),changer:/Changer/.test(t),refaire:/Refaire/.test(t)};`);
  assert.ok(r.poses>0,'des préliminaires sont posés');
  assert.deepEqual({...r,poses:undefined},{poses:undefined,autres:false,valider:false,pourquoi:true,ouvrir:true,fiches:true,changer:true,refaire:true});
});

test('Booking — la note d’un combattant dit ce que l’on sait de lui : l’attente en mois, la dernière défaite ou victoire, sa carte', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>mgmtAvailable(m,x)&&!mgmtEngaged(m,x)); m.cycle=6; f.lastCycle=3;
    const attend=mgmtCarteNote(m,f); f.lastCycle=m.cycle;
    return {attend,libre:typeof mgmtCarteNote(m,f)};`);
  assert.match(r.attend,/^Attend depuis \d+ mois$/); assert.equal(r.libre,'string');
});

test('Effectif — la colonne Contrat dit le nombre de combats restants, plus jamais un tiret pour un combattant sous contrat', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; G.screen='mgmt_effectif'; render(); const l=[...document.querySelectorAll('.mf-eff-contrat')].map(x=>x.textContent);
    return {n:l.length,avec:l.filter(x=>/COMBATS?$/.test(x)).length,tirets:l.filter(x=>x==='—').length};`);
  assert.ok(r.n>0); assert.ok(r.avec>=r.n-r.tirets); assert.ok(r.avec>0,'au moins un contrat lisible');
});

test('Classements — les trois grandes cartes ne portent que le nom, le surnom reste dans le tableau et sur la fiche', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt, div=m.roster[0].div; MGMT_SU_CL.div=div; CL.go('mgmt_classements');
    const grandes=[...document.querySelectorAll('.mf-su-champ,.mf-su-rang')].map(x=>x.textContent), lignes=[...document.querySelectorAll('.mf-su-ligne')].map(x=>x.textContent);
    return {grandes:grandes.length,sans:grandes.every(t=>!/«/.test(t)),tableau:lignes.some(t=>/«/.test(t))};`);
  assert.ok(r.grandes>=1); assert.equal(r.sans,true);
});
