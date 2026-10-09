"use strict";
/* Lot 4 du brief démo (09/10/2026) : les dix défauts relevés en jouant, un test par défaut. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const JOUER=`function jouer(){ const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
  for(const f of m.roster){ delete f.susp; f.lastCycle=-9; if(f.libre){ delete f.libre; f.ct={n:6,f:0,b:mgmtBourseSouhaitee(m,f,false),since:m.cycle}; } else if(f.ct&&f.ct.n-f.ct.f<=1) f.ct.n+=5; }
  if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
  const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let k=0;
  while(m.card.main.length<m.card.sizeMain&&k++<80){ const d=divs[k%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
  const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
  const ev=mgmtAgendaJouer(m); if(!ev) throw new Error('la soirée ne se joue pas'); return ev; }`;

test('D1 — un vainqueur du top 15 ne sort pas du top 15 à cause de sa victoire', () => {
  for(const seed of [7,11,23]){
    const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed}); CL.mgmtEnter(1);`);
    const r=res(w,`${JOUER} const ev=jouer(), m=G.mgmt, sortis=[];
      for(const f of ev.fights){ const win=f.winner==='A'?f.a:(f.winner==='B'?f.b:null); if(!win) continue; const fr=mgmtFighterById(m,win);
        const cur=mgmtDivisionRanking(m,fr.div,'world').findIndex(x=>x.id===win)+1, prev=mgmtDivisionRanking(m,fr.div,'world',m.cycle-1).findIndex(x=>x.id===win)+1;
        if(prev>0&&prev<=MGMT_CL_TOP&&cur>MGMT_CL_TOP) sortis.push(fr.name); }
      return sortis;`);
    assert.deepEqual(r,[],'graine '+seed);
  }
});

test('D2 — la légende d’une citation de presse nomme les deux combattants du combat cité', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const m=G.mgmt, i=m.hist.length-1, t=m.hist[i], autre=m.roster.find(f=>f.id!==t.a.id&&f.id!==t.b.id);
    const s=mgmtSuPresseSous(m,{k:'presse',w:'media',f:i,a:t.a.id,b:autre.id});
    return {s,a:mgmtSuCourt(m,t.a.id),b:mgmtSuCourt(m,t.b.id),autre:mgmtSuCourt(m,autre.id)};`);
  assert.ok(r.s.includes(r.a)&&r.s.includes(r.b)); assert.ok(!r.s.includes(r.autre)||r.autre===r.a||r.autre===r.b);
});

test('D3 — un combat réclamé qui a déjà sa carte « Un défi » n’en reçoit pas une seconde, d’un cycle à l’autre', () => {
  const w=neuve();
  const r=res(w,`${JOUER} jouer(); const m=G.mgmt, t=m.hist[m.hist.length-1], A=t.a.id, B=t.b.id;
    mgmtRivalites=function(){ return [{k:'rivalite',a:A,b:B,c:m.cycle}]; };
    m.fil=[{k:'defi',c:m.cycle,a:A,b:B,w:'revanche',t:''}];
    mgmtFilMettreAJour(m); m.cycle++; mgmtFilMettreAJour(m);
    const avecDefi=m.fil.filter(x=>x.k==='public').length;
    m.fil=[]; mgmtFilMettreAJour(m); m.cycle++; mgmtFilMettreAJour(m);
    return {avecDefi,sansDefi:m.fil.filter(x=>x.k==='public').length};`);
  assert.equal(r.avecDefi,0); assert.equal(r.sansDefi,1);
});

test('D4 — l’écran Nouvelle partie annonce l’effectif que la partie crée vraiment', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, ap=mgmtOrgApercu({profil:mgmtOrgProfil(m)}), v=ap.find(x=>x.k==='Effectif').v;
    return {annonce:Number(v.replace(/\\D/g,'')),reel:m.roster.length};`);
  assert.ok(Math.abs(r.annonce-r.reel)/r.reel<0.12,`annoncé ${r.annonce}, créé ${r.reel}`);
});

test('D5 — le nom de la bannière s’adapte à sa longueur et ne passe pas sous le VS', () => {
  const w=neuve();
  const r=res(w,`const long={first:'Anne',last:'Phetcharatwongsakul',name:'Anne Phetcharatwongsakul'}, court={first:'Léa',last:'Dos',name:'Léa Dos'};
    const h=mgmtCarteBanniere(long,long,'x'); const tailles=[...h.matchAll(/<b style="font-size:(\\d+)px">/g)].map(x=>Number(x[1]));
    return {tailles,larg:tailles.map(t=>mfAvance(mfNet('Phetcharatwongsakul'))*t),court:[...mgmtCarteBanniere(court,court,'x').matchAll(/<b style="font-size:(\\d+)px">/g)].map(x=>Number(x[1]))};`);
  assert.ok(r.tailles.every(t=>t<96)); assert.ok(r.larg.every((l,i)=>l<=262+1||r.tailles[i]===26)); assert.ok(r.court.every(t=>t===96));
});

test('D6 — une demande de combattant ouvre la fiche sur « On en dit », et la légende dit ce que fait Entrée', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, f=m.roster[0]; m.fil=[{k:'combattant',c:m.cycle,a:f.id,w:'demande'}]; MGMT_SU_PR.i=0; MGMT_SU_PR.filtre=null;
    const legende=mgmtSuPresseEntreeTexte(m,m.fil[0]); CL.go('mgmt_presse'); CL.mgmtSuPrEntree();
    return {legende,ecran:G.screen,onglet:MGMT_FICHE.onglet};`);
  assert.deepEqual(r,{legende:'Sa fiche',ecran:'mgmt_fiche',onglet:'ondit'});
});

test('D7 — la réponse de Leïla après un refus se lit sans bloquer la soirée', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';});
    m.pile.push({id:'zz1',kind:'leila_react',exchange:'leila_refused',speaker:'leila',a:m.roster[0].id,b:m.roster[1].id,status:'open',decision:null,title:''});
    return {ouvertes:mgmtOpenCount(m),bloquantes:mgmtAffairesBloquantes(m),blocages:mgmtAgendaBlocages(m).filter(x=>x.k==='affaires').length};`);
  assert.deepEqual(r,{ouvertes:1,bloquantes:0,blocages:0});
});

test('D8 — après un combat confirmé, le curseur se pose sur un combattant libre', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.card.main=[]; const l=mgmtCarteListe(m), a=l.find(f=>mgmtSelectable(m,f,null)); MGMT_CART.cursor=0; CL.mgmtPick(a.id);
    const b=mgmtCarteListe(m).find(f=>f.id!==a.id&&mgmtSelectable(m,f,a.id)); CL.mgmtPick(b.id);
    const l2=mgmtCarteListe(m), f=l2[MGMT_CART.cursor];
    return {libre:!!f&&mgmtSelectable(m,f,null),engage:m.card.main.length};`);
  assert.deepEqual(r,{libre:true,engage:1});
});

test('D9 — une proposition de Leïla dont un combattant est booké ailleurs est retirée', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.card.main=[]; m.card.prelims=[]; m.pile=[];
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); const d=rows[0].div, mm=rows.filter(f=>f.div===d);
    const [a,b,c,e]=mm;
    m.pile.push({id:'p1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:a.id,b:b.id,status:'open',decision:null,title:''});
    m.pile.push({id:'p2',kind:'leila_bulk',exchange:'leila_bulk',speaker:'leila',a:b.id,b:e.id,fights:[{a:b.id,b:e.id,slot:'prelim'},{a:c.id,b:mm[4].id,slot:'prelim'}],status:'open',decision:null,title:''});
    mgmtBookMain(m,a.id,c.id);
    return {propose:m.pile[0].status,bulk:m.pile[1].fights.length,restant:m.pile[1].fights.every(x=>x.a!==a.id&&x.b!==a.id&&x.a!==c.id&&x.b!==c.id)};`);
  assert.equal(r.propose,'closed'); assert.equal(r.bulk,1); assert.equal(r.restant,true);
});

test('D10 — les messages « camp terminé » des réseaux ne sortent que dans la dernière semaine', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.hist=[]; m.pile=m.pile||[];
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); mgmtBookMain(m,rows[0].id,rows.find(x=>x.id!==rows[0].id&&mgmtSelectable(m,x,rows[0].id)).id);
    m.cal.prochaines=[{jour:m.cal.jour+35,taille:'petite'}]; const loin=mgmtParolesDeLaSemaine(m).filter(x=>x.reseaux).length;
    m.cal.prochaines=[{jour:m.cal.jour+5,taille:'petite'}]; const pres=mgmtParolesDeLaSemaine(m).filter(x=>x.reseaux).length;
    return {loin,pres};`);
  assert.equal(r.loin,0); assert.ok(r.pres>=1);
});
