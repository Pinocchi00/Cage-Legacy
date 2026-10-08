"use strict";
/* Brief du 06/10/2026, lot 7 : le calendrier du joueur — poser une soirée (date, taille), une grosse par mois,
   le temps qui avance sans soirée imposée, aucun combat joué sans validation, ordre de passage, migration. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

/* Demande d'Anthony du 08/10/2026 : l'ouverture pose elle-même la première soirée (mgmtAgendaSuivante) ; ces tests étudient le calendrier vide, ils la retirent d'abord. */
function neuve(){ const win=newGameWindow({runMain:true}); win.eval(`setSeed(7); CL.mgmtEnter(1); G.mgmt.cal.prochaines=[]; mgmtAgendaSynchroCarte(G.mgmt);`); return win; }
function ouverte(){ const win=newGameWindow({runMain:true}); win.eval(`setSeed(7); CL.mgmtEnter(1);`); return win; }
const COMPOSE=`(()=>{ const m=G.mgmt; for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
    for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; } })()`;
/** Compose une carte principale complète puis valide les préliminaires de Leïla. */
function carteComplete(win){
  win.eval(`(()=>{ const m=G.mgmt; m.pile.forEach(x=>{ x.status='closed'; x.decision='ignored'; }); m.open=null; })()`);
  win.eval(COMPOSE);
  win.eval(`(()=>{ const m=G.mgmt; const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate'); })()`);
}

test('Agenda — une partie neuve commence sans soirée posée ; la date se dérive du jour, rien d’autre n’est stocké', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; return {actif:mgmtAgendaActif(m),n:m.cal.prochaines.length,jour:m.cal.jour,d1:mgmtJourDate(0),d2:mgmtJourDate(35),cles:Object.keys(m.cal).sort()};`);
  assert.ok(r.actif); assert.equal(r.n,0); assert.equal(r.jour,0);
  assert.equal(Math.round((r.d2.ts-r.d1.ts)/86400000),35); assert.deepEqual(r.cles,['actif','faites','jour','prochaines','vieJour']);
});

test('Agenda — on pose une soirée à une date et à une taille ; le passé, un jour pris et une deuxième grosse du mois sont refusés', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt;
    return {passe:mgmtAgendaPoser(m,0,'petite').raison,invalide:mgmtAgendaPoser(m,5,'enorme').raison,ok:mgmtAgendaPoser(m,10,'grosse').ok,
      pris:mgmtAgendaPoser(m,10,'petite').raison,deuxieme:mgmtAgendaPoser(m,15,'grosse').raison,petiteOk:mgmtAgendaPoser(m,20,'petite').ok,
      autreMois:mgmtAgendaPoser(m,45,'grosse').ok,tri:m.cal.prochaines.map(x=>x.jour)};`);
  assert.equal(r.passe,'passee'); assert.equal(r.invalide,'invalide'); assert.ok(r.ok); assert.equal(r.pris,'occupee');
  assert.equal(r.deuxieme,'grosse-du-mois','une grosse soirée par mois au plus'); assert.ok(r.petiteOk); assert.ok(r.autreMois);
  assert.deepEqual(r.tri,[10,20,45]);
});

test('Agenda — une petite soirée compte 9 combats, une grosse 13 (dont 4 early prelims)', () => {
  const win=neuve();
  const p=res(win,`const m=G.mgmt; mgmtAgendaPoser(m,10,'petite'); return {t:m.card.sizeMain+m.card.sizePrelims,e:m.card.sizeEarly};`);
  assert.equal(p.t,9); assert.equal(p.e,0);
  const g=res(win,`const m=G.mgmt; mgmtAgendaRetirer(m,0); mgmtAgendaPoser(m,10,'grosse'); return {t:m.card.sizeMain+m.card.sizePrelims,e:m.card.sizeEarly};`);
  assert.equal(g.t,13); assert.equal(g.e,4);
});

test('Agenda — le joueur peut laisser passer un mois sans soirée : le temps avance quand même, et les âges avec lui', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const a0=m.ageWeeks, c0=m.cycle; const j=mgmtAgendaPasser(m); return {j,jour:m.cal.jour,vie:m.cal.vieJour,cycle:m.cycle===c0,semaines:(m.ageWeeks-a0+MGMT_EXT_YEAR_WEEKS)%MGMT_EXT_YEAR_WEEKS};`);
  assert.equal(r.j,30); assert.equal(r.jour,30); assert.equal(r.vie,30); assert.ok(r.cycle,'aucune soirée n’est imposée'); assert.equal(r.semaines,4);
  const stop=res(win,`const m=G.mgmt; mgmtAgendaPoser(m,40,'petite'); const j=mgmtAgendaPasser(m); const j2=mgmtAgendaPasser(m); return {j,j2,jour:m.cal.jour};`);
  assert.equal(stop.j,10,'jamais au-delà de la prochaine soirée posée'); assert.equal(stop.j2,0);
});

test('Agenda — aucune soirée sans validation : rien de posé, carte vide, proposition non validée : on ne joue pas', () => {
  const win=neuve();
  assert.equal(win.eval(`mgmtAgendaJouer(G.mgmt)`),null,'rien de posé');
  win.eval(`mgmtAgendaPoser(G.mgmt,10,'petite')`);
  assert.equal(win.eval(`mgmtAgendaJouer(G.mgmt)`),null,'carte vide');
  win.eval(COMPOSE);
  assert.ok(win.eval(`G.mgmt.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')`),'la proposition de Leïla attend le joueur');
  assert.equal(win.eval(`mgmtAgendaJouer(G.mgmt)`),null,'la proposition n’est pas validée');
  assert.equal(win.eval(`G.mgmt.hist.length`),0,'aucun combat n’a été joué');
});

test('Agenda — la soirée prête se joue à sa date, préliminaires d’abord, le combat principal en dernier', () => {
  const win=neuve();
  win.eval(`mgmtAgendaPoser(G.mgmt,12,'grosse')`);
  carteComplete(win);
  win.eval(`mgmtRetraitProb=function(){return 0;};`);
  const r=res(win,`const m=G.mgmt; const pret=mgmtAgendaPret(m); const principal=m.card.main[0]; const ev=mgmtAgendaJouer(m);
    return {pret,n:ev&&ev.fights.length,jour:m.cal.jour,faites:m.cal.faites.length,restantes:m.cal.prochaines.length,
      slots:m.hist.map(h=>h.slot),dernier:!!ev&&ev.fights[ev.fights.length-1].a===principal.a};`);
  assert.ok(r.pret); assert.equal(r.n,13); assert.equal(r.jour,12); assert.equal(r.faites,1); assert.equal(r.restantes,0);
  assert.deepEqual(r.slots,['prelim','prelim','prelim','prelim','prelim','prelim','prelim','prelim','main','main','main','main','main']);
  assert.ok(r.dernier,'le combat principal est le dernier joué');
});

test('Agenda — l’écran Calendrier : P pose, flèches déplacent la date, T change la taille, Entrée pose, L laisse passer', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_calendrier');`);
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('AUCUNE SOIRÉE POSÉE')`));
  touche(win,'p'); assert.ok(win.eval('MGMT_CALENDRIER.pose')); const j0=win.eval('MGMT_CALENDRIER.pose.jour');
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_CALENDRIER.pose.jour'),j0+1);
  touche(win,'ArrowUp'); assert.equal(win.eval('MGMT_CALENDRIER.pose.jour'),j0+8);
  touche(win,'t'); assert.equal(win.eval('MGMT_CALENDRIER.pose.taille'),'grosse');
  touche(win,'Enter');
  assert.equal(win.eval('G.mgmt.cal.prochaines.length'),1); assert.equal(win.eval('G.mgmt.cal.prochaines[0].taille'),'grosse');
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('GROSSE')`));
  touche(win,'l'); assert.ok(win.eval('G.mgmt.cal.jour')>0,'L laisse passer le temps');
});

test('Agenda — la validation du format : un champ cal abîmé est écarté, un champ sain passe', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const ok=validateMgmt(JSON.parse(JSON.stringify(m)));
    const mauvais=JSON.parse(JSON.stringify(m)); mauvais.cal.prochaines=[{jour:'x',taille:'petite'}]; const ko=validateMgmt(mauvais);
    const r2=JSON.parse(JSON.stringify(m)); r2.cal={actif:true,jour:'?'}; mgmtRepair(r2);
    return {ok,ko,repare:r2.cal===undefined};`);
  assert.ok(r.ok); assert.equal(r.ko,false); assert.ok(r.repare);
});

test('Agenda — migration : une partie d’avant joue sa soirée en cours, puis passe au calendrier', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); (()=>{ const m=G.mgmt; delete m.cal; saveMgmt(); G.mgmt=null; })(); CL.mgmtEnter(1);`);
  assert.equal(win.eval('G.mgmt.cal.actif'),false,'l’agenda attend la fin de la soirée en cours');
  win.eval(`CL.mgmtLendemainNext();`);
  assert.equal(win.eval('mgmtAgendaActif(G.mgmt)'),true,'la partie passe au calendrier au cycle suivant');
  assert.equal(win.eval('G.mgmt.cal.jour'),win.eval('G.mgmt.eventsPlayed*35'));
});

test('Agenda — réservation : Leïla ne place jamais un combattant du cercle ou des suivis', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; mgmtAgendaPoser(m,10,'petite');
    const reserves=mgmtCartRows(m).slice(0,4);
    m.cercle=[reserves[0].id,reserves[1].id]; m.suivis=[reserves[2].id,reserves[3].id];
    m.pile=[]; m.open=null;
    const principal=[]; for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)&&!mgmtAgendaReserve(m,f)); let ok=false;
      for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; }
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'); const ids=new Set(reserves.map(f=>f.id));
    return {bulk:!!bulk,touche:bulk?bulk.fights.some(f=>ids.has(f.a)||ids.has(f.b)):null,res:reserves.every(f=>mgmtAgendaReserve(m,f))};`);
  assert.ok(r.res); assert.ok(r.bulk,'Leïla propose les préliminaires'); assert.equal(r.touche,false,'aucun réservé dans sa proposition');
});

test('Agenda — préparation à la demande : le joueur désigne un combattant, l’assistante propose l’adversaire le plus proche', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=mgmtCartRows(m).find(x=>mgmtSelectable(m,x,null)); const o=mgmtAgendaProposer(m,f.id);
    const rg=mgmtDivisionRank(m,f)||0; const meme=mgmtCartRows(m).filter(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id)).map(x=>Math.abs((mgmtDivisionRank(m,x)||0)-rg));
    return {o:!!o,div:o&&o.div===f.div,proche:o&&Math.abs((mgmtDivisionRank(m,o)||0)-rg)===Math.min(...meme),autre:o&&o.id!==f.id};`);
  assert.ok(r.o&&r.div&&r.proche&&r.autre);
  win.eval(`CL.go('mgmt_carte'); CL.mgmtCarteEntree();`);
  const i0=win.eval('MGMT_CART.cursor'); touche(win,'d');
  assert.equal(win.eval(`mgmtCarteListe(G.mgmt)[MGMT_CART.cursor].id`),win.eval(`mgmtAgendaProposer(G.mgmt,MGMT_CART.pick).id`),'le curseur se place sur l’adversaire proposé');
  assert.ok(i0>=0);
});

test('Une soirée est toujours posée : l’ouverture pose la première, à cinq semaines, et la suivante se pose après une soirée jouée (demande d’Anthony du 08/10/2026 : les planches montrent la date sur chaque écran)', () => {
  const win=ouverte();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){ const m=G.mgmt, p=m.cal.prochaines.slice(); const tete=document.getElementById('app').textContent;
    const jour=m.cal.jour; const dans=p.length?p[0].jour-jour:0;
    m.cal.prochaines=[]; const v=mgmtAgendaSuivante(m), apres=m.cal.prochaines.length, encore=mgmtAgendaSuivante(m);
    return {n:p.length,dans,taille:p[0]&&p[0].taille,v,apres,encore,tete:/Dans 35 jours/.test(tete)}; })())`));
  assert.equal(r.n,1); assert.equal(r.dans,35); assert.equal(r.taille,'petite'); assert.equal(r.v,true); assert.equal(r.apres,1); assert.equal(r.encore,false,'rien de plus tant qu’une soirée est posée'); assert.equal(r.tete,true,'le décompte est dans l’en-tête');
});
