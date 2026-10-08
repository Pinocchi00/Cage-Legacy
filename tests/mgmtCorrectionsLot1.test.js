"use strict";
/* Brief des corrections du 08/10/2026, lot 1 : les impasses du parcours. Une partie neuve arrive à sa première soirée quel que soit l'ordre des actions (1.1),
   un forfait en préliminaires se règle depuis l'écran où on le voit (1.2), le calendrier dit ce qui bloque (1.3), Promettre et Refuser sont de vrais boutons
   (1.4), l'écran d'arrivée allume la bonne section et garde « Continuer » visible (1.5). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
const app=win=>win.document.getElementById('app');

/** Une partie neuve : rien de posé, rien de composé. */
function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1); (function(){ const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null; })();`);
  return win;
}
/** Compose la carte principale (cinq paires) comme le ferait le joueur. */
const composer=win=>win.eval(`(function(){ const m=G.mgmt; const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
  while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[e%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
  return m.card.main.length; })()`);

test('1.1 — Composer, valider les préliminaires, poser la soirée, jouer : une partie neuve arrive à sa première soirée', () => {
  for(const taille of ['petite','grosse']){
    const win=neuve();
    assert.ok([9,13].includes(win.eval(`G.mgmt.card.sizeMain+G.mgmt.card.sizePrelims`)),'la carte neuve a la taille d’une soirée');
    assert.equal(composer(win),5);
    win.eval(`const m=G.mgmt; mgmtOfferBulk(m,true); const b=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b) mgmtDecide(m,b.id,'validate');`);
    assert.ok(win.eval(`G.mgmt.card.prelims.length`)>0,'les préliminaires sont validés');
    const r=win.eval(`mgmtAgendaPoser(G.mgmt,G.mgmt.cal.jour+10,${JSON.stringify(taille)})`);
    assert.equal(r.ok,true,taille+' : la soirée se pose ('+(r.raison||'')+')');
    win.eval(`const m=G.mgmt; mgmtOfferBulk(m,true); const b=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b) mgmtDecide(m,b.id,'validate'); m.pile.forEach(x=>{x.status='closed';});`);
    assert.equal(win.eval(`G.mgmt.card.sizeMain+G.mgmt.card.sizePrelims`),taille==='grosse'?13:9);
    assert.ok(win.eval(`mgmtAgendaJouer(G.mgmt)`),taille+' : la soirée se joue');
  }
});

test('1.1 — Une carte de 12 combats ne bloque plus rien, et une sauvegarde déjà bloquée se débloque au chargement', () => {
  const win=neuve();
  composer(win);
  win.eval(`const m=G.mgmt; m.card.sizePrelims=7; m.card.sizeEarly=0;`);   // l'ancienne carte neuve : 5 + 7
  assert.equal(win.eval(`mgmtAgendaTailleCarte(G.mgmt)`),null,'12 ne correspond à aucune soirée');
  assert.equal(win.eval(`mgmtAgendaVerifier(G.mgmt,G.mgmt.cal.jour+10,'petite').ok`),true);
  assert.equal(win.eval(`mgmtAgendaVerifier(G.mgmt,G.mgmt.cal.jour+10,'grosse').ok`),true);
  /* Une sauvegarde bloquée : on l'écrit telle quelle, on la recharge. */
  win.eval(`saveMgmt(); G.mgmt=null; loadMgmt();`);
  assert.equal(win.eval(`mgmtAgendaTailleCarte(G.mgmt)`),'petite','la carte retrouve la taille d’une soirée au chargement');
});

test('1.2 — Un forfait en préliminaires se règle depuis Préliminaires, en une action, sans passer par la fiche', () => {
  const win=neuve();
  composer(win);
  win.eval(`const m=G.mgmt; mgmtAgendaPoser(m,m.cal.jour+10,'petite'); mgmtOfferBulk(m,true); const b=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b) mgmtDecide(m,b.id,'validate'); m.pile.forEach(x=>{x.status='closed';});`);
  assert.ok(win.eval(`mgmtCardFull(G.mgmt)`),'fixture : la carte est pleine');
  /* Le forfait : un préliminaire tombe, son combattant est suspendu. */
  win.eval(`(function(){ const m=G.mgmt, f=m.card.prelims.pop(); mgmtAddFact(m,{c:m.cycle,k:'retrait',a:f.a,adv:f.b,slot:'prelim'}); })()`);
  assert.equal(win.eval(`mgmtCardFull(G.mgmt)`),false);
  const bl=win.eval(`JSON.stringify(mgmtAgendaBlocages(G.mgmt))`);
  assert.match(bl,/Il manque 1 préliminaire/);
  win.eval(`CL.go('mgmt_prelims')`);
  assert.match(app(win).textContent,/Trouver un remplaçant/,'le bouton est sur l’écran Préliminaires');
  win.eval(`CL.mgmtPrelimsRemplacer()`);
  assert.equal(win.eval(`G.screen`),'mgmt_prelims');
  assert.ok(win.eval(`!!G.mgmt.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open')`),'Leïla propose le remplaçant');
  win.eval(`CL.mgmtPrelimsValider()`);
  assert.ok(win.eval(`mgmtCardFull(G.mgmt)`),'validé, le trou est comblé');
});

test('1.3 — Le calendrier liste ce qui empêche la soirée, une ligne par blocage, chacune menant à l’écran qui la règle', () => {
  const win=neuve();
  win.eval(`mgmtAgendaPoser(G.mgmt,G.mgmt.cal.jour+10,'petite'); CL.go('mgmt_calendrier');`);
  const lignes=win.eval(`[...document.querySelectorAll('.mf-cal-bloc')].map(x=>x.textContent)`);
  assert.ok(lignes.length>=2,'carte principale et préliminaires manquent : deux lignes');
  assert.ok(lignes.some(t=>/carte principale/.test(t)));
  assert.ok(lignes.some(t=>/préliminaire/.test(t)));
  assert.ok(win.eval(`[...document.querySelectorAll('.mf-cal-bloc button')].every(b=>/CL\\./.test(b.getAttribute('onclick')))`),'chaque ligne a son action');
  composer(win);
  win.eval(`G.mgmt.pile.forEach(x=>{x.status='closed';}); CL.go('mgmt_calendrier')`);
  const apres=win.eval(`[...document.querySelectorAll('.mf-cal-bloc')].map(x=>x.textContent)`);
  assert.ok(!apres.some(t=>/carte principale/.test(t)),'la ligne de la carte principale disparaît une fois la carte composée');
  /* Une affaire ouverte bloque aussi, et le dit. */
  win.eval(`const m=G.mgmt; m.pile.push({id:'aff-test',kind:'leila_propose',status:'open',a:m.roster[0].id,b:m.roster[1].id,exchange:'leila_propose'});`);
  assert.ok(win.eval(`mgmtAgendaBlocages(G.mgmt).some(b=>b.k==='affaires')`));
});

test('1.4 — Promettre et Refuser sont deux vrais boutons, avec une touche chacun, sur toute leur surface', () => {
  const win=neuve();
  const id=win.eval(`G.mgmt.roster[0].id`);
  win.eval(`G.mgmt.facts.push({c:G.mgmt.cycle,k:'demande',a:${JSON.stringify(id)},want:'carte-principale'}); MGMT_FICHE={id:${JSON.stringify(id)},retour:'mgmt_effectif',cursor:0,onglet:'ondit'}; G.screen='mgmt_fiche'; render();`);
  const b=win.eval(`[...document.querySelectorAll('.mf-demande .mf-bouton')].map(x=>({t:x.textContent,jaune:x.classList.contains('jaune'),click:x.getAttribute('onclick')}))`);
  assert.equal(b.length,2);
  assert.match(b[0].t,/^\s*P\s*Promettre/); assert.match(b[1].t,/^\s*R\s*Refuser/);
  assert.match(b[0].click,/promettre/); assert.match(b[1].click,/refuser/);
  assert.match(css,/\.mf-demande\{[^}]*margin/,'un espace sépare les boutons du titre suivant');
  win.eval(`keysHandle({key:'p',preventDefault(){}})`);
  assert.ok(win.eval(`G.mgmt.facts.some(x=>x.k==='promesse')`),'la touche P promet');
});

test('1.5 — L’écran d’arrivée n’allume aucune section fausse et garde « Continuer » hors de la colonne qui défile', () => {
  const win=neuve();
  win.eval(`G.screen='mgmt_bureau'; render();`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-barre-item.cur').length`),0,'aucune section n’est allumée à tort');
  assert.ok(win.eval(`!!document.querySelector('.mgmt-week-suite .mgmt-next')`),'Continuer est au pied du panneau');
  assert.ok(win.eval(`!document.querySelector('.mgmt-week-defile .mgmt-next')`),'et plus dans la colonne qui défile');
  assert.match(css,/\.mgmt-week-defile\{[^}]*overflow-y:auto/);
});
