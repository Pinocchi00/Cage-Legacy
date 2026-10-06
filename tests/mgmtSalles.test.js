"use strict";
/* Brief du 06/10/2026, lot 8 : la salle, le public et l'argent — remplissage, recette, satisfaction, popularité. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
function neuve(){ const win=newGameWindow({runMain:true}); win.eval(`setSeed(7); CL.mgmtEnter(1);`); return win; }

test('Salles — six salles créées avec la partie : une ville, un nom, une capacité, et une popularité qui ne s’affiche pas en jauge', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; return {n:m.salles.length,villes:new Set(m.salles.map(s=>s.ville)).size,cap:m.salles.map(s=>s.capacite),pop:m.pop,
    ok:m.salles.every(s=>s.nom.includes(s.ville)&&s.capacite>0),cherche:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.equal(r.n,6); assert.equal(r.villes,6); assert.ok(r.ok); assert.ok(r.cherche);
  assert.deepEqual(r.cap,[...r.cap].sort((a,b)=>a-b),'des petites aux grandes salles'); assert.ok(r.pop>=5&&r.pop<=100);
  const deux=res(newGameWindow({runMain:true}),`setSeed(7); CL.mgmtEnter(1); return G.mgmt.salles;`);
  assert.deepEqual(deux,res(win,`return G.mgmt.salles;`),'mêmes salles pour la même partie');
});

test('Salles — à carte et salle égales, une grosse soirée remplit plus et rapporte plus qu’une petite', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const s=m.salles[3]; const p=mgmtRemplissage(s,60,'petite',0.5), g=mgmtRemplissage(s,60,'grosse',0.5);
    return {sp:p.spectateurs,sg:g.spectateurs,bp:mgmtBilletterie(p.spectateurs,s),bg:mgmtBilletterie(g.spectateurs,s)};`);
  assert.ok(r.sg>r.sp); assert.ok(r.bg>r.bp);
});

test('Salles — une salle plus grande que le plafond de popularité ne se remplit pas au-delà de ce plafond', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const grande=m.salles[5]; const pop=15; const plafond=mgmtPopPlafond(pop);
    const x=mgmtRemplissage(grande,pop,'grosse',1); return {plafond,sp:x.spectateurs,cap:grande.capacite};`);
  assert.ok(r.cap>r.plafond,'la salle dépasse le plafond'); assert.ok(r.sp<=r.plafond,'jamais plus que le plafond');
});

test('Salles — chacun des trois critères de satisfaction, pris seul, la fait monter', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const a=m.roster[0].id,b=m.roster[1].id;
    const base={reclames:[{a,b}],fights:[{a,b:m.roster[2].id,family:'dec',round:3,rounds:3}],noms:0};
    const s0=mgmtSatisfaction(m,base).score;
    const reclame=mgmtSatisfaction(m,{...base,fights:[{a,b,family:'dec',round:3,rounds:3}]}).score;
    const serre=mgmtSatisfaction(m,{...base,fights:[{a,b:m.roster[2].id,family:'ko',round:1,rounds:3}]}).score;
    const noms=mgmtSatisfaction(m,{...base,noms:1}).score;
    return {s0,reclame,serre,noms};`);
  assert.ok(r.reclame>r.s0,'les combats réclamés qui ont eu lieu'); assert.ok(r.serre>r.s0,'un combat fini avant la limite'); assert.ok(r.noms>r.s0,'les noms à l’affiche');
});

test('Salles — un public déçu ou une salle vide fait baisser la popularité, un public comblé la fait monter, et la suivante remplit en conséquence', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const s=m.salles[5];
    const bas=mgmtPopApres(50,20,0.8), vide=mgmtPopApres(50,70,0.2), haut=mgmtPopApres(50,90,0.8), stable=mgmtPopApres(50,55,0.8);
    const avant=mgmtRemplissage(s,50,'petite',0.5).spectateurs, apres=mgmtRemplissage(s,bas,'petite',0.5).spectateurs;
    return {bas,vide,haut,stable,avant,apres,bornes:[mgmtPopApres(5,0,0),mgmtPopApres(100,100,1)]};`);
  assert.ok(r.bas<50&&r.vide<70&&r.haut>50,'déçu : baisse ; salle vide : pénalité ; comblé : hausse'); assert.equal(r.stable,50);
  assert.ok(r.apres<r.avant,'la soirée suivante remplit moins'); assert.deepEqual(r.bornes,[5,100]);
});

test('Salles — la caisse après une soirée vaut la caisse d’avant, plus les recettes, moins les dépenses', () => {
  const win=neuve();
  win.eval(`mgmtRetraitProb=function(){return 0;};`);
  const r=res(win,`const m=G.mgmt; mgmtAgendaPoser(m,12,'grosse'); m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
      for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; }
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
    const t0=m.treasury, pop0=m.pop; const ev=mgmtAgendaJouer(m); const f=ev.finance;
    return {t0,t1:m.treasury,recette:f.recette,calc:f.ticketing+f.tv-f.purses-f.bonuses-f.location,loc:f.location,sp:f.spectateurs,cap:f.capacite,sat:f.satisfaction,pop0,pop1:m.pop,
      compte:m.comptes.length,salle:f.salle,valide:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.equal(r.t1,r.t0+r.recette); assert.equal(r.recette,r.calc,'recettes moins dépenses'); assert.ok(r.loc>0,'la salle se loue');
  assert.ok(r.sp>0&&r.sp<=r.cap); assert.equal(r.compte,1); assert.ok(r.salle.length>0); assert.ok(r.valide);
});

test('Salles — sur 40 parties simulées, enchaîner des soirées faibles dans une salle trop grande fait perdre de l’argent', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`mgmtRetraitProb=function(){return 0;};
    let pertes=0, total=0;
    for(let g=0;g<40;g++){
      setSeed(1000+g); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
      const t0=m.treasury; const grande=m.salles[5].id;
      for(let k=0;k<2;k++){
        m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
        mgmtAgendaPoser(m,m.cal.jour+10+k,'petite',grande);
        const faibles=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)).sort((a,b)=>mgmtStar(a)-mgmtStar(b));
        for(let i=0;i<faibles.length&&m.card.main.length<m.card.sizeMain;i++){ const a=faibles[i]; const b=faibles.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b) mgmtBookMain(m,a.id,b.id); }
        const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
        if(!mgmtAgendaJouer(m)) break;
        mgmtNewPile(m);
      }
      total++; if(m.treasury<t0) pertes++;
    }
    return {pertes,total};`);
  assert.equal(r.total,40); assert.ok(r.pertes>=38,`les soirées faibles perdent de l’argent (${r.pertes}/40)`);
});
